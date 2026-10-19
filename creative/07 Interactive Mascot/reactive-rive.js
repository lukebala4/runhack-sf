// Original layered vector character. Acting, transitions and hit tests live in .riv.
const canvas = document.querySelector('#mascot-canvas');
const wrap = document.querySelector('#mascot-wrap');
const status = document.querySelector('#mascot-status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const names = ['Ready for a fresh idea', 'Out for a run', 'A little hop', 'Idea worth celebrating', 'Catching a breath', 'Thinking it over', 'Good to see you', 'Could use a little help'];
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
let instance, vm, props, visible = true, disposed = false;
let mode = 0, colour = '#283831', frame = 0, freezeTimer;
let target = [0, 0], gaze = [0, 0], previousTime = 0;

const api = window.reactiveMascot = {
  ready: false,
  paused: false,
  setMode(value) {
    mode = Math.round(clamp(value, 0, 7));
    if (props) props.mode.value = mode;
    canvas.dataset.mode = String(mode);
    if (api.ready) status.textContent = names[mode];
    sync();
  },
  setLook(x, y) {
    target = [clamp(x, -1, 1), clamp(y, -1, 1)];
    if (!reduced.matches) requestGaze();
  },
  setColor(value) {
    if (!/^#[0-9a-f]{6}$/i.test(value)) return;
    colour = value;
    if (props) props.colour.value = Number.parseInt('ff' + value.slice(1), 16);
    sync();
  },
  pause(value = true) { api.paused = Boolean(value); sync(); },
};

function canRender() { return api.ready && !disposed && !document.hidden && visible && !api.paused; }
function writeGaze() {
  if (!props) return;
  props.x.value = 6 + gaze[0] * 3;
  props.y.value = gaze[1] * 3;
  props.turn.value = gaze[0] * 3.5;
  props.height.value = gaze[1] * 2;
}
function requestGaze() {
  if (!canRender() || reduced.matches || frame) return;
  previousTime = 0;
  frame = requestAnimationFrame(advanceGaze);
}
function advanceGaze(time) {
  frame = 0;
  if (!canRender() || reduced.matches) return;
  const dt = previousTime ? Math.min(64, time - previousTime) : 16.7;
  previousTime = time;
  const amount = 1 - Math.exp(-dt / 95);
  gaze = gaze.map((v, i) => v + (target[i] - v) * amount);
  writeGaze();
  if (gaze.some((v, i) => Math.abs(target[i] - v) > .002)) frame = requestAnimationFrame(advanceGaze);
}
function sync() {
  clearTimeout(freezeTimer);
  if (!instance || !api.ready) return;
  if (!canRender()) {
    instance.stopRendering(); cancelAnimationFrame(frame); frame = 0; return;
  }
  instance.startRendering();
  if (reduced.matches) {
    // Allow the native 180ms transition to settle, then hold a pose.
    cancelAnimationFrame(frame); frame = 0; gaze = [0, 0]; writeGaze();
    freezeTimer = setTimeout(() => instance?.stopRendering(), 240);
  } else requestGaze();
}
function pointerMove(event) {
  if (reduced.matches || event.pointerType === 'touch') return;
  const rect = canvas.getBoundingClientRect();
  api.setLook((event.clientX - rect.left - rect.width * .53) / (rect.width * .75),
    (event.clientY - rect.top - rect.height * .32) / (rect.height * .8));
}
function resetLook() { api.setLook(0, 0); }
function nativeTap() {
  if (!canRender()) return;
  window.dispatchEvent(new CustomEvent('mascot:tap'));
}
function nativeHover() { wrap.dataset.hovered = String(props.hovered.value); }
function fail(error) {
  if (disposed) return;
  api.ready = false;
  wrap.dataset.riveState = canvas.dataset.riveState = 'unavailable';
  status.textContent = 'Animation unavailable · static preview';
  console.error('Interactive hare could not load:', error);
  clearTimeout(freezeTimer); cancelAnimationFrame(frame); frame = 0;
  instance?.cleanup(); instance = vm = props = undefined;
}
async function load() {
  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '../03%20Website%20Concepts/assets/vendor/rive/rive.js';
      script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
    if (disposed) return;
    const R = window.rive;
    R.RuntimeLoader.setWasmUrl('../03%20Website%20Concepts/assets/vendor/rive/rive.wasm');
    R.RuntimeLoader.setWasmFallbackUrl('../03%20Website%20Concepts/assets/vendor/rive/rive_fallback.wasm');
    instance = new R.Rive({
      src: 'assets/rive/reactive-hare.riv?v=1', canvas,
      artboard: 'Reactive Hare', stateMachine: 'Reactive character',
      autoBind: true, autoplay: true,
      layout: new R.Layout({ fit: R.Fit.Contain, alignment: R.Alignment.Center }),
      onLoad() {
        if (disposed) return;
        vm = instance.viewModelInstance;
        props = {
          mode: vm?.number('mode'), x: vm?.number('lookX'), y: vm?.number('lookY'),
          turn: vm?.number('headTurn'), height: vm?.number('headTilt'),
          colour: vm?.color('sponsorColor'), tap: vm?.trigger('tap'), hovered: vm?.boolean('hovered'),
        };
        if (Object.values(props).some(value => !value)) { fail('Missing ReactiveHare bindings'); return; }
        props.tap.on(nativeTap); props.hovered.on(nativeHover);
        api.ready = true;
        instance.resizeDrawingSurfaceToCanvas();
        api.setColor(colour); api.setMode(mode); writeGaze();
        wrap.dataset.riveState = canvas.dataset.riveState = 'ready';
        window.dispatchEvent(new CustomEvent('mascot:ready'));
        sync();
      },
      onLoadError: fail,
    });
  } catch (error) { fail(error); }
}

if (canvas) {
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { rootMargin: '120px' });
  intersection.observe(canvas);
  const resize = new ResizeObserver(() => instance?.resizeDrawingSurfaceToCanvas()); resize.observe(canvas);
  document.addEventListener('pointermove', pointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetLook);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  window.addEventListener('pageshow', () => sync());
  window.addEventListener('pagehide', (event) => {
    clearTimeout(freezeTimer); cancelAnimationFrame(frame); frame = 0;
    if (event.persisted) { instance?.stopRendering(); return; }
    disposed = true; api.ready = false;
    intersection.disconnect(); resize.disconnect();
    document.removeEventListener('pointermove', pointerMove);
    document.documentElement.removeEventListener('pointerleave', resetLook);
    document.removeEventListener('visibilitychange', sync);
    reduced.removeEventListener('change', sync);
    props?.tap.off(nativeTap); props?.hovered.off(nativeHover);
    instance?.cleanup(); instance = vm = props = undefined;
  });
  load();
}
