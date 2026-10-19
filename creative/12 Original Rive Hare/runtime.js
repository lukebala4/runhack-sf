// The character's artwork, acting and state transitions are authored in Rive.
// JavaScript sends intent through the OriginalHare view model only.
const canvas = document.querySelector('#mascot-canvas');
const stage = document.querySelector('#character-stage');
const status = document.querySelector('#mascot-status');
const controls = [...document.querySelectorAll('.controls button[data-mode]')];
const runLabel = document.querySelector('#run-label');
const errorPanel = document.querySelector('#runtime-error');
const retry = document.querySelector('#retry-preview');
const motionNote = document.querySelector('#motion-note');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const stateNames = ['Ready for fresh air', 'Out for a run', 'A little hop', 'Hello there', 'Taking a sip', 'Good idea!'];
const durations = {2:1200, 3:1800, 4:3600, 5:2000};
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
let instance, vm, props, loadTimer, returnTimer, freezeTimer;
let gazeFrame = 0, gazeTime = 0, gaze = [0,0], target = [0,0];
let disposed = false, inView = true, requestedMode = 0, actionRevision = 0, loadRevision = 0;
let runtimePromise;

const api = window.originalHare = {
  ready:false,
  paused:false,
  get mode(){return requestedMode},
  durations,
  setMode(value, {userInitiated = true} = {}) {
    if (!api.ready || disposed) return false;
    const next = Math.round(clamp(value, 0, 5));
    const revision = ++actionRevision;
    clearTimeout(returnTimer);
    // Resetting the previous one-shot before re-entering makes repeated taps replay it.
    if (next === requestedMode && next > 1) {
      props.mode.value = 0;
      instance.startRendering();
      requestedMode = 0;
      updateUI();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (revision === actionRevision) activate(next, userInitiated);
      }));
    } else activate(next, userInitiated);
    return true;
  },
  setLook(x,y) {
    target = [clamp(x,-100,100),clamp(y,-100,100)];
    requestGaze();
  },
  pause(value=true) {
    api.paused = Boolean(value);
    sync();
  },
};

function activate(next,userInitiated) {
  if (!api.ready || disposed) return;
  requestedMode = next;
  props.mode.value = next;
  updateUI();
  sync(userInitiated);
  if (durations[next] && !reduced.matches) returnTimer = setTimeout(() => api.setMode(0,{userInitiated:false}),durations[next]);
}

function updateUI() {
  canvas.dataset.mode = String(requestedMode);
  controls.forEach(button => {
    button.disabled = !api.ready;
    button.setAttribute('aria-pressed',String(Number(button.dataset.mode) === requestedMode));
  });
  runLabel.textContent = requestedMode === 1 ? 'Pause' : 'Run';
  if (api.ready) status.textContent = reduced.matches ? `${stateNames[requestedMode]} · still pose` : stateNames[requestedMode];
  motionNote.textContent = reduced.matches ? 'Reduced motion is on. Choose a move to view its pose.' : 'Choose a move, or use keys 1–6.';
}

function mayRender() {return api.ready && !disposed && !api.paused && !document.hidden && inView}
function stopGaze() {cancelAnimationFrame(gazeFrame);gazeFrame=0;gazeTime=0}
function writeGaze() {
  if (!props) return;
  // Clamp pixel offsets inside the cream eye shapes, with room to glance left.
  props.lookX.value = clamp(gaze[0] * .06,-5,3);
  props.lookY.value = clamp(gaze[1] * .06,-4,4);
}
function requestGaze() {
  if (!mayRender() || reduced.matches || gazeFrame) return;
  gazeFrame = requestAnimationFrame(advanceGaze);
}
function advanceGaze(time) {
  gazeFrame = 0;
  if (!mayRender() || reduced.matches) return;
  const dt = gazeTime ? Math.min(64,time-gazeTime) : 16.7;
  gazeTime = time;
  const amount = 1-Math.exp(-dt/100);
  gaze = gaze.map((value,index) => value+(target[index]-value)*amount);
  writeGaze();
  if (gaze.some((value,index) => Math.abs(target[index]-value)>.08)) gazeFrame = requestAnimationFrame(advanceGaze);
  else gazeTime = 0;
}

function sync(userInitiated=false) {
  clearTimeout(freezeTimer);
  if (!api.ready || !instance) return;
  if (!mayRender()) {instance.stopRendering();stopGaze();return}
  instance.startRendering();
  if (reduced.matches) {
    stopGaze();target=gaze=[0,0];writeGaze();
    // Let the native state transition settle, then hold a pose rather than looping.
    freezeTimer = setTimeout(() => instance?.stopRendering(), userInitiated && requestedMode>1 ? 420 : 240);
  } else requestGaze();
}

function pointerMove(event) {
  if (!api.ready || reduced.matches || event.pointerType==='touch') return;
  const rect = canvas.getBoundingClientRect();
  api.setLook((event.clientX-rect.left-rect.width*.5)/rect.width*180,
    (event.clientY-rect.top-rect.height*.36)/rect.height*180);
}
function resetLook() {api.setLook(0,0)}
function visibilityChanged() {
  if (document.hidden) {
    actionRevision++;
    clearTimeout(returnTimer);
    if (api.ready) {requestedMode=0;props.mode.value=0;updateUI()}
    resetLook();
  }
  sync();
}
function reducedChanged() {
  actionRevision++;
  clearTimeout(returnTimer);
  if (api.ready) {requestedMode=0;props.mode.value=0}
  updateUI();sync();
}
function fail(error) {
  if (disposed) return;
  clearTimeout(loadTimer);clearTimeout(returnTimer);clearTimeout(freezeTimer);stopGaze();
  loadRevision++;actionRevision++;api.ready=false;
  stage.dataset.riveState='unavailable';
  status.textContent='Animation unavailable';
  errorPanel.hidden=false;
  controls.forEach(button => {button.disabled=true});
  instance?.cleanup();instance=vm=props=undefined;
  console.error('Original hare preview could not load:',error);
}

async function loadRuntime() {
  if (window.rive) return window.rive;
  if (!runtimePromise) runtimePromise = new Promise((resolve,reject) => {
    const script=document.createElement('script');
    script.src='../03%20Website%20Concepts/assets/vendor/rive/rive.js';
    script.onload=() => window.rive ? resolve(window.rive) : reject(new Error('Rive runtime unavailable'));
    script.onerror=() => {script.remove();runtimePromise=undefined;reject(new Error('Rive runtime could not download'))};
    document.head.append(script);
  });
  return runtimePromise;
}

async function load() {
  const revision=++loadRevision;
  clearTimeout(loadTimer);
  stage.dataset.riveState='loading';errorPanel.hidden=true;status.textContent='Getting ready…';
  loadTimer=setTimeout(() => fail(new Error('Preview timed out')),18000);
  try {
    const R=await loadRuntime();
    if (disposed || revision!==loadRevision) return;
    R.RuntimeLoader.setWasmUrl('../03%20Website%20Concepts/assets/vendor/rive/rive.wasm');
    R.RuntimeLoader.setWasmFallbackUrl('../03%20Website%20Concepts/assets/vendor/rive/rive_fallback.wasm');
    let candidate;
    candidate=new R.Rive({
      src:'assets/rive/original-hare.riv?v=2',canvas,
      artboard:'OriginalHare',stateMachine:'Hare personality',
      autoBind:true,autoplay:true,
      layout:new R.Layout({fit:R.Fit.Contain,alignment:R.Alignment.Center}),
      onLoad(){
        if (disposed || revision!==loadRevision) {candidate?.cleanup();return}
        clearTimeout(loadTimer);
        vm=candidate.viewModelInstance;
        props={mode:vm?.number('mode'),lookX:vm?.number('lookX'),lookY:vm?.number('lookY')};
        if (Object.values(props).some(property => !property)) {fail(new Error('OriginalHare data bindings are missing'));return}
        api.ready=true;
        stage.dataset.riveState='ready';
        instance.resizeDrawingSurfaceToCanvas();
        props.mode.value=0;requestedMode=0;writeGaze();updateUI();sync();
        window.dispatchEvent(new CustomEvent('hare:ready'));
      },
      onLoadError(error){if(revision===loadRevision) fail(error)},
    });
    instance=candidate;
  } catch(error) {if(revision===loadRevision) fail(error)}
}

controls.forEach(button => button.addEventListener('click',() => {
  const next=Number(button.dataset.mode);
  api.setMode(next===1 && requestedMode===1 ? 0 : next);
}));
retry.addEventListener('click',() => {instance?.cleanup();instance=vm=props=undefined;load()});
document.addEventListener('keydown',event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
  const key=Number(event.key);
  if (!/^[1-6]$/.test(event.key)) return;
  const next=key-1;
  if (api.ready) {event.preventDefault();api.setMode(next===1 && requestedMode===1 ? 0 : next)}
});

const resize=new ResizeObserver(() => instance?.resizeDrawingSurfaceToCanvas());resize.observe(canvas);
const intersection=new IntersectionObserver(entries => {inView=entries[0].isIntersecting;sync()},{rootMargin:'100px'});intersection.observe(canvas);
document.addEventListener('pointermove',pointerMove,{passive:true});
document.documentElement.addEventListener('pointerleave',resetLook);
document.addEventListener('visibilitychange',visibilityChanged);
reduced.addEventListener('change',reducedChanged);
window.addEventListener('pageshow',() => sync());
window.addEventListener('pagehide',event => {
  actionRevision++;
  clearTimeout(loadTimer);clearTimeout(returnTimer);clearTimeout(freezeTimer);stopGaze();
  if (event.persisted) {
    requestedMode=0;
    if (props) props.mode.value=0;
    target=gaze=[0,0];writeGaze();updateUI();
    instance?.stopRendering();
    return;
  }
  disposed=true;api.ready=false;
  resize.disconnect();intersection.disconnect();
  document.removeEventListener('pointermove',pointerMove);
  document.documentElement.removeEventListener('pointerleave',resetLook);
  document.removeEventListener('visibilitychange',visibilityChanged);
  reduced.removeEventListener('change',reducedChanged);
  instance?.cleanup();instance=vm=props=undefined;
});
updateUI();load();
