(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const stage = $('playfield');
  const runner = $('runner');
  const runButton = $('run-button');
  const jumpButton = $('jump-button');
  const resetButton = $('reset-button');
  const dialog = $('source-dialog');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hurdles = [25, 52, 79].map((at, i) => {
    const el = document.createElement('div');
    el.className = 'hurdle';
    el.innerHTML = '<span></span><i></i><i></i>';
    el.hidden = true;
    $('obstacles').append(el);
    return { at, el, checked: false, cleared: false };
  });
  let state = 'ready';
  let metres = 0;
  let cleared = 0;
  let jumpTime = -Infinity;
  let lastFrame = 0;
  let raf = 0;
  let jumpQueued = false;
  let previousFocus = null;

  function label(text) { $('status').textContent = text; }
  function button(text) { runButton.textContent = text; }

  // Inline the local vector so its two shoe groups can move independently.
  // The original <img> stays as a usable fallback if this optional enhancement fails.
  fetch('assets/running-hedgehog.svg').then(r => {
    if (!r.ok) throw new Error('Vector unavailable');
    return r.text();
  }).then(text => {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid vector');
    const svg = document.importNode(doc.documentElement, true);
    svg.classList.add('mascot-vector');
    runner.replaceChildren(svg);
  }).catch(() => { runner.dataset.artMode = 'image-fallback'; });

  function redraw(hop = 0) {
    $('distance').textContent = String(Math.min(100, Math.floor(metres)));
    $('progress').value = metres;
    runner.style.setProperty('--runner-hop', `${-hop}px`);
    const rect = runner.getBoundingClientRect();
    const field = stage.getBoundingClientRect();
    const foot = rect.left - field.left + rect.width * .64;
    const pixelsPerMetre = Math.max(7, field.width / 65);
    for (const h of hurdles) {
      const x = foot + (h.at - metres) * pixelsPerMetre;
      h.el.hidden = state === 'ready' || state === 'finished' || motion.matches || x < -80 || x > field.width + 80;
      h.el.style.left = `${x - 32}px`;
      h.el.classList.toggle('cleared', h.cleared);
    }
    stage.style.setProperty('--course-offset', `${-metres * pixelsPerMetre}px`);
    document.querySelector('.runner-shadow').style.transform = `scale(${1 - Math.min(hop / 700, .22)})`;
  }

  function checkHurdles(hop, queued = false) {
    for (const h of hurdles) {
      if (!h.checked && metres >= h.at) {
        h.checked = true;
        h.cleared = queued || hop > 38;
        if (h.cleared) {
          cleared++;
          label('Nice clearance!');
        } else {
          label('Brushed it. Keep going!');
        }
        $('lap-result').textContent = `${cleared} of 3 hurdles cleared.`;
      }
    }
  }

  function finish() {
    state = 'finished';
    stage.classList.remove('is-running');
    jumpButton.disabled = true;
    button('Run again →');
    label('100 m complete');
    $('lap-result').textContent = `Lap complete. ${cleared} of 3 hurdles cleared. ${cleared === 3 ? 'A clean run!' : 'Ready for another?'}`;
    redraw();
    if (!motion.matches) celebrate();
  }

  function frame(now) {
    if (state !== 'running' || motion.matches) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .06) : 0;
    lastFrame = now;
    metres = Math.min(100, metres + dt * (100 / 18));
    const jumpAge = now - jumpTime;
    // Keep the whole silhouette below the readouts at every responsive size.
    const headroom = stage.clientHeight - parseFloat(getComputedStyle(runner).bottom) - runner.clientHeight;
    const jumpHeight = Math.min(125, Math.max(48, headroom - 85));
    const hop = jumpAge < 860 ? Math.sin(Math.PI * jumpAge / 860) * jumpHeight : 0;
    checkHurdles(hop);
    redraw(hop);
    if (metres >= 100) { finish(); return; }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (state === 'finished') reset();
    state = 'running';
    jumpButton.disabled = false;
    label(motion.matches ? 'Step mode · no scrolling' : 'On your marks. Go!');
    $('lap-result').textContent = motion.matches ? 'Jump, then take a step to clear the next hurdle.' : 'Three hurdles ahead. Time your jump.';
    button(motion.matches ? 'Take a step →' : 'Pause');
    stage.classList.toggle('is-running', !motion.matches);
    stage.focus({ preventScroll: true });
    lastFrame = 0;
    if (motion.matches) step();
    else raf = requestAnimationFrame(frame);
  }

  function pause(reason = 'Taking a breather') {
    if (state !== 'running') return;
    state = 'paused';
    cancelAnimationFrame(raf);
    stage.classList.remove('is-running');
    jumpTime = -Infinity;
    jumpButton.disabled = true;
    button('Resume →');
    label(reason);
    redraw();
  }

  function step() {
    metres = Math.min(100, metres + 10);
    checkHurdles(0, jumpQueued);
    jumpQueued = false;
    redraw();
    if (metres >= 100) finish();
  }

  function reset() {
    cancelAnimationFrame(raf);
    state = 'ready';
    metres = 0; cleared = 0; lastFrame = 0; jumpTime = -Infinity; jumpQueued = false;
    stage.classList.remove('is-running');
    hurdles.forEach(h => { h.checked = false; h.cleared = false; });
    $('confetti').replaceChildren();
    jumpButton.disabled = true;
    button(motion.matches ? 'Start a step lap →' : 'Run a lap →');
    label(motion.matches ? 'Reduced motion · step mode' : 'Ready when you are');
    $('lap-result').textContent = 'Your first lap is waiting.';
    redraw();
  }

  function jump() {
    if (state !== 'running') return;
    if (motion.matches) {
      jumpQueued = true;
      label('Jump ready for your next step');
      return;
    }
    const now = performance.now();
    if (now - jumpTime < 860) return;
    jumpTime = now;
  }

  function celebrate() {
    const fragments = document.createDocumentFragment();
    for (let i = 0; i < 28; i++) {
      const leaf = document.createElement('i');
      leaf.className = 'finish-leaf';
      leaf.style.cssText = `--x:${(i * 37) % 101}%;--delay:${i % 7 * .07}s;--angle:${(i * 83) % 360}deg;--leaf:${['#bd512e','#fff3dc','#547052'][i % 3]}`;
      fragments.append(leaf);
    }
    $('confetti').replaceChildren(fragments);
  }

  runButton.addEventListener('click', () => {
    if (state === 'running') { if (motion.matches) step(); else pause(); }
    else start();
  });
  jumpButton.addEventListener('click', jump);
  resetButton.addEventListener('click', reset);
  stage.addEventListener('click', jump);
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || dialog.open || e.repeat) return;
    if (e.target.closest('button, a, input, textarea, select')) return;
    if (state === 'running') { e.preventDefault(); jump(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause('Paused while you were away'); });
  window.addEventListener('resize', () => redraw());
  motion.addEventListener('change', reset);
  $('outfit-button').addEventListener('click', () => {
    pause('Paused for a closer look');
    previousFocus = document.activeElement;
    dialog.showModal();
  });
  $('close-source').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => previousFocus?.focus());
  reset();
})();
