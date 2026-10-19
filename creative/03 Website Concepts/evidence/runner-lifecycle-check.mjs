import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// No browser or product files are modified. The only output is this harness's
// adjacent JSON report. Each scenario imports a fresh copy of the actual source.
const sourceURL = new URL('../runner-motion.js', import.meta.url);
const resultsURL = new URL('./runner-lifecycle-results.json', import.meta.url);
const code = fs.readFileSync(sourceURL, 'utf8');
const results = [];
const originalGlobals = new Map([
  'matchMedia', 'document', 'IntersectionObserver', 'ResizeObserver',
  'setTimeout', 'clearTimeout', 'window'
].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));

async function scenario(name, initialReduce, run) {
  let script, intersection, preferenceChange;
  let constructed = 0, cleaned = 0, starts = 0, stops = 0;
  let disconnected = 0, listeners = 0, nextTimer = 0;
  const instances = [], activeInstances = new Set(), timers = new Map();
  const preference = {
    matches: initialReduce,
    addEventListener(_event, callback) { preferenceChange = callback; listeners++; },
    removeEventListener() { listeners--; }
  };
  const canvas = { isConnected: true };
  const element = { dataset: {}, querySelector() { return canvas; } };
  const container = { querySelectorAll() { return [element]; } };

  globalThis.matchMedia = () => preference;
  globalThis.document = {
    hidden: false,
    head: { append(value) { script = value; } },
    createElement() { return {}; },
    addEventListener() { listeners++; },
    removeEventListener() { listeners--; }
  };
  globalThis.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() {}
    disconnect() { disconnected++; }
  };
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() { disconnected++; }
  };
  globalThis.setTimeout = callback => {
    const id = ++nextTimer;
    timers.set(id, callback);
    return id;
  };
  globalThis.clearTimeout = id => timers.delete(id);
  globalThis.window = {
    rive: {
      RuntimeLoader: { setWasmUrl() {}, setWasmFallbackUrl() {} },
      Layout: class {}, Fit: { Contain: 1 }, Alignment: { Center: 1 },
      Rive: class {
        constructor(options) {
          constructed++;
          activeInstances.add(this);
          instances.push({ self: this, options });
        }
        cleanup() {
          assert(activeInstances.delete(this), `${name}: cleanup called twice`);
          cleaned++;
        }
        resizeDrawingSurfaceToCanvas() {}
        startRendering() { starts++; }
        stopRendering() { stops++; }
      }
    }
  };

  const moduleURL = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${name}`;
  const { mountRunners } = await import(moduleURL);
  const mounted = mountRunners(container);
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
  const state = () => ({
    constructed, cleaned, leaked: activeInstances.size, starts, stops,
    disconnectedObservers: disconnected, retainedListeners: listeners,
    retainedTimers: timers.size, state: element.dataset.state ?? 'default',
    scriptRequested: Boolean(script), fallbackStillVisible: element.dataset.state !== 'ready'
  });

  await run({
    mounted, canvas, element, flush, state,
    enter: () => intersection([{ isIntersecting: true }]),
    toggle: value => { preference.matches = value; preferenceChange(); },
    resolve: () => script.onload(),
    loaded: () => instances.at(-1).options.onLoad()
  });

  assert.equal(activeInstances.size, 0, `${name}: leaked instances`);
  assert.equal(timers.size, 0, `${name}: retained timers`);
  assert.equal(listeners, 0, `${name}: retained listeners`);
  assert.equal(disconnected, 2, `${name}: retained observers`);
  results.push({ scenario: name, status: 'pass', ...state() });
}

try {
  await scenario('rapid_preference_toggle', false, async s => {
    s.enter();
    s.toggle(true);
    s.toggle(false);
    s.resolve();
    await s.flush();
    assert.equal(s.state().constructed, 1, 'pending preference toggle constructed duplicate instances');
    s.loaded();
    assert.equal(s.element.dataset.state, 'ready');
    s.mounted.cleanup();
  });
  await scenario('live_reduced_motion', false, async s => {
    s.enter();
    s.resolve();
    await s.flush();
    s.loaded();
    assert.equal(s.element.dataset.state, 'ready');
    s.toggle(true);
    assert.equal(s.element.dataset.state, 'still');
    assert.equal(s.state().cleaned, 1);
    assert.equal(s.state().fallbackStillVisible, true);
    s.mounted.cleanup();
  });
  await scenario('initial_reduced_motion', true, async s => {
    s.enter();
    await s.flush();
    assert.equal(s.state().scriptRequested, false);
    assert.equal(s.state().constructed, 0);
    assert.equal(s.state().fallbackStillVisible, true);
    s.mounted.cleanup();
  });
  await scenario('pending_load_after_teardown', false, async s => {
    s.enter();
    s.mounted.cleanup();
    s.canvas.isConnected = false;
    s.resolve();
    await s.flush();
    assert.equal(s.state().constructed, 0);
    assert.equal(s.element.dataset.state, 'still');
  });

  const report = {
    checkedAt: new Date().toISOString(),
    method: 'In-memory DOM and Rive runtime stubs exercising the actual runner-motion.js module; no browser or visual acceptance claimed.',
    checkedFile: fileURLToPath(sourceURL),
    sourceSha256: createHash('sha256').update(code).digest('hex'),
    status: 'pass', passed: results.length, total: 4, scenarios: results
  };
  fs.writeFileSync(resultsURL, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  for (const [name, descriptor] of originalGlobals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
}
