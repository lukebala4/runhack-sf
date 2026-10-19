// Original character, native Rive timelines + state machine + view-model bindings.
const canvas = document.querySelector('#hare-canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let instance, vm, visible = true, disposed = false, freezeTimer;
let mode = 0, color = '#293e38', gaze = [0, 0];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || 0));
const api = window.hareMascot = {
  ready: false,
  setMode(value) {
    mode = Math.round(clamp(value, 0, 4));
    if (vm) vm.number('mode').value = mode;
    canvas.dataset.mode = String(mode);
    sync(true);
  },
  setLook(x, y) {
    gaze = [clamp(x, -1, 1), clamp(y, -1, 1)];
    if (vm) {
      vm.number('lookX').value = 6 + gaze[0] * 3;
      vm.number('lookY').value = gaze[1] * 3;
    }
    if (reduced.matches) sync(true);
  },
  setColor(value) {
    if (!/^#[0-9a-f]{6}$/i.test(value)) return;
    color = value;
    if (vm) vm.color('sponsorColor').value = Number.parseInt('ff' + value.slice(1), 16);
    sync(true);
  },
  pause(value = true) { api.paused = value; sync(); },
  paused: false,
};
function sync(renderChange = false) {
  if (!instance || !api.ready) return;
  clearTimeout(freezeTimer);
  if (document.hidden || !visible || api.paused) { instance.stopRendering(); return; }
  instance.startRendering();
  if (reduced.matches) {
    // Advance the native transition then hold a pose. No perpetual animation.
    freezeTimer = setTimeout(() => instance?.stopRendering(), renderChange ? 100 : 16);
  }
}
function fail(error) {
  if (disposed) return;
  api.ready = false;
  canvas.dataset.riveState = 'unavailable';
  canvas.parentElement.dataset.riveState = 'unavailable';
  const status = document.querySelector('#rive-status');
  if (status) status.textContent = 'Static character · animation unavailable';
  console.error('Hare animation unavailable:', error);
  instance?.cleanup(); instance = undefined;
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
      src: 'assets/rive/running-hackathon-hare.riv?v=2', canvas,
      artboard: 'Running Hackathon Hare', stateMachine: 'Hare Play',
      autoBind: true, autoplay: true,
      layout: new R.Layout({ fit: R.Fit.Contain, alignment: R.Alignment.Center }),
      onLoad() {
        if (disposed) return;
        vm = instance.viewModelInstance;
        if (!vm?.number('mode') || !vm?.color('sponsorColor')) { fail('Missing character bindings'); return; }
        api.ready = true;
        instance.resizeDrawingSurfaceToCanvas();
        api.setMode(mode); api.setColor(color); api.setLook(...gaze);
        canvas.dataset.riveState = canvas.parentElement.dataset.riveState = 'ready';
        const status = document.querySelector('#rive-status');
        if (status) status.textContent = 'Live Rive character';
        window.dispatchEvent(new CustomEvent('hare:ready'));
        sync();
      },
      onLoadError: fail,
    });
  } catch (error) { fail(error); }
}
if (canvas) {
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { rootMargin: '160px' });
  observer.observe(canvas);
  const resize = new ResizeObserver(() => instance?.resizeDrawingSurfaceToCanvas()); resize.observe(canvas);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  window.addEventListener('pagehide', () => {
    disposed = true; clearTimeout(freezeTimer); observer.disconnect(); resize.disconnect();
    instance?.cleanup(); instance = undefined; vm = undefined;
  }, { once: true });
  load();
}
