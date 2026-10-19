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
  const characterKey = 'running-hackathon-sponsor-runner-v1';
  const animalBase = '../06%20Animal%20Mascot%20Choices/assets/';
  const characters = {
    devin: { name: 'Devin · Cognition', short: 'Devin', art: 'assets/devin-runner.png', source: 'assets/devin-source.png', sourceLabel: 'Cognition’s Devin reference', foot: .68,
      note: 'Cognition’s orange otter in a new running kit. AI outfit concept.',
      sourceNote: 'AI-generated outfit adaptation of the Cognition otter in your existing sponsor artwork, also verified on Devin’s official site. A private concept, unapproved by Cognition.', href: 'https://devin.ai/desktop' },
    poke: { name: 'Poke · Cognition otter kit', short: 'Poke', art: 'assets/poke-runner.png', source: 'assets/poke-mark.svg', sourceLabel: 'Poke’s actual palm mark', foot: .68,
      note: 'A Poke kit on the Cognition otter. Proposed character concept.',
      sourceNote: 'Poke’s official mark is a palm tree. Your sponsor artwork pairs Poke with Cognition’s otter. This AI-generated Poke outfit is a new private interpretation of that otter, not a verified separate Poke mascot or approved brand asset.', href: 'https://cognition.com/blog/interaction' },
    hedgehog: { name: 'PostHog · Max', short: 'PostHog', art: '../09%20Hedgehog%20Playground/assets/running-hedgehog.svg', source: '../09%20Hedgehog%20Playground/assets/official-marathon.svg', sourceLabel: 'Official PostHog Marathon source', foot: .64,
      note: 'The retained hedgehog kit study. PostHog approval required for public use.',
      sourceNote: 'A modified vector study based on PostHog’s official Marathon illustration. PostHog restricts altered brand artwork and requires explicit permission for hedgehog marketing use. This concept is unapproved.', href: 'https://posthog.com/handbook/brand/assets' },
    ...Object.fromEntries(['hare', 'fox', 'raccoon', 'otter', 'deer'].map(id => [id, {
      name: id[0].toUpperCase() + id.slice(1), short: id[0].toUpperCase() + id.slice(1), art: `${animalBase}${id}-preview.webp`, source: `${animalBase}${id}.png`, sourceLabel: 'Original generated artwork', foot: id === 'hare' || id === 'deer' ? .5 : .56,
      note: 'One of your five original animal concepts, kept in play.',
      sourceNote: 'Existing generated Running Hackathon character artwork from the five-animal study. The same animal is shown here as a web preview and on the track; its original file remains unchanged.', href: `../06%20Animal%20Mascot%20Choices/?animal=${id}`, original: true
    }]))
  };
  const isCharacter = id => typeof id === 'string' && Object.hasOwn(characters, id);
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
  let selected = 'devin';
  let artRequest = 0;
  let hasCharacter = false;

  function label(text) { $('status').textContent = text; }
  function button(text) { runButton.textContent = text; }

  async function selectCharacter(id, persist = true) {
    if (!isCharacter(id)) return;
    if (selected === id && hasCharacter) {
      // Returning to the visible runner must also cancel an in-flight change.
      ++artRequest;
      stage.removeAttribute('aria-busy');
      $('character-note').textContent = characters[id].note;
      return;
    }
    pause('Paused while changing runner');
    const request = ++artRequest;
    const c = characters[id];
    stage.setAttribute('aria-busy', 'true');
    $('character-note').textContent = `Loading ${c.short}…`;
    try {
      const image = new Image();
      image.id = 'runner-art';
      image.alt = `${c.name}, Running Hackathon outfit concept`;
      image.draggable = false;
      image.src = c.art;
      await image.decode();
      let art = image;
      if (id === 'hedgehog') {
        // Retain the original hedgehog's independently moving vector shoe groups.
        try {
          const response = await fetch(c.art);
          if (!response.ok) throw new Error('Vector unavailable');
          const doc = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
          if (doc.querySelector('parsererror')) throw new Error('Invalid vector');
          art = document.importNode(doc.documentElement, true);
          art.classList.add('mascot-vector');
        } catch { /* The decoded image remains a valid fallback. */ }
      }
      if (request !== artRequest) return;
      selected = id;
      hasCharacter = true;
      runner.dataset.character = id;
      runner.replaceChildren(art);
      $('selected-name').textContent = c.name;
      $('character-note').textContent = c.note;
      document.querySelectorAll('[data-character].character-option').forEach(b => {
        const active = b.dataset.character === id;
        b.setAttribute('aria-pressed', String(active));
        b.classList.toggle('is-selected', active);
      });
      $('source-title').textContent = c.original ? `${c.short}, kept in play.` : `${c.short}, dressed to run.`;
      $('source-original').src = c.source;
      $('source-original').alt = c.sourceLabel;
      $('source-original').classList.toggle('palm-source', id === 'poke');
      $('source-adapted').src = c.art;
      $('source-adapted').alt = `${c.name} playground artwork`;
      $('source-label').textContent = c.sourceLabel;
      $('study-label').textContent = c.original ? 'Playground preview' : 'Running Hackathon outfit concept';
      $('source-note').textContent = c.sourceNote;
      $('source-link').href = c.href;
      $('source-link').textContent = c.original ? 'Open the original animal study ↗' : 'View the brand source ↗';
      $('outfit-button').textContent = c.original ? 'View artwork ↗' : 'Compare source ↗';
      if (persist) {
        try { localStorage.setItem(characterKey, id); } catch { /* Optional preference. */ }
      }
      const url = new URL(location.href);
      url.searchParams.set('animal', id);
      history.replaceState(null, '', url);
      reset();
    } catch {
      if (request === artRequest) $('character-note').textContent = `Could not load ${c.short}. Choose it again to retry. Your previous runner is still available.`;
    } finally {
      if (request === artRequest) stage.removeAttribute('aria-busy');
    }
  }

  function redraw(hop = 0) {
    $('distance').textContent = String(Math.min(100, Math.floor(metres)));
    $('progress').value = metres;
    runner.style.setProperty('--runner-hop', `${-hop}px`);
    const rect = runner.getBoundingClientRect();
    const field = stage.getBoundingClientRect();
    const foot = rect.left - field.left + rect.width * characters[selected].foot;
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
    const jumpHeight = Math.min(125, Math.max(70, headroom - 70));
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
  document.querySelector('.character-picker').addEventListener('click', e => {
    const option = e.target.closest('button[data-character]');
    if (option) selectCharacter(option.dataset.character);
  });
  reset();
  let saved;
  try { saved = localStorage.getItem(characterKey); } catch { /* Optional preference. */ }
  const requested = new URLSearchParams(location.search).get('animal');
  selectCharacter(isCharacter(requested) ? requested : isCharacter(saved) ? saved : 'devin', false);
})();
