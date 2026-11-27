/* The London film plays on the page, in a full-screen player, instead of opening the file. */
(() => {
  const player = document.getElementById('player');
  if (!player || !player.showModal) return;
  const film = player.querySelector('video');
  for (const a of document.querySelectorAll('[data-film]')) a.addEventListener('click', e => {
    e.preventDefault();
    player.showModal();
    const p = film.play(); if (p && p.catch) p.catch(() => {});
  });
  const stop = () => { film.pause(); };
  player.addEventListener('close', stop);
  player.querySelector('.player-close').addEventListener('click', () => player.close());
  player.addEventListener('click', e => { if (e.target === player) player.close(); });
})();

/* The scroll edit.
   Scroll chooses the shot, and every change of shot is a hard cut. The sentence lands a beat after its
   photograph. Four moments do more than cut:
   1. the film runs only while the reader is scrolling and freezes when they stop (the event's one rule);
   2. "It rained," holds across a smash cut to the sauna, where the line completes in place;
   3. the megaphone photograph stays while the panel beside it becomes the ExchangeWire press release;
   4. photographs run along one lane of the track, from London to Barcelona. The same track, empty, is San Francisco.
   Without this file, or with reduced motion, the page is the same shots as a plain sequence. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reel = document.getElementById('reel');
  const stage = document.getElementById('stage');
  const ok = reel && stage && window.CSS && CSS.supports('height', '100lvh') && CSS.supports('overflow', 'clip') &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) { root.classList.remove('js'); return; }
  root.classList.add('js');
  window.__journey = true;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const follow = (cur, target, dt, tau) => cur + (target - cur) * (1 - Math.exp(-dt / tau));
  const query = new URLSearchParams(location.search);
  const saveData = !!(navigator.connection && navigator.connection.saveData);

  /* ---------- cue sheet, read from the markup ---------- */
  const BEAT = 520;                                         // ms between a photograph cutting on and its sentence
  const WITH_PICTURE = new Set(['cover', 'sauna', 'posts']);   // first paint; the joke; the panel that would be blank
  const CUTS = new Set(['rained>sauna', 'sauna>rained', 'posts>press', 'press>posts']);   // these two stay hard cuts: the joke, and the panel swap
  const OWN_WORDS = new Set(['film', 'press']);             // the film sets its own caption; the article is the words
  const PUSH = new Set(['cover', 'rule', 'film', 'london', 'distance', 'barcelona']);
  let total = 0;
  const shots = [...stage.querySelectorAll('.scene')].map(el => {
    const id = el.dataset.scene, len = +el.dataset.len || 80;
    const shot = { el, id, len, from: total, at: 0 };
    total += len;
    if (PUSH.has(id)) el.classList.add('push');
    return shot;
  });
  const by = Object.fromEntries(shots.map(s => [s.id, s]));
  reel.style.setProperty('--total', total);

  // The sentences once, in order, for anyone not following the pinned stage by eye.
  const transcript = document.createElement('div');
  transcript.className = 'sr';
  for (const s of shots) {
    if (s.el.hasAttribute('data-motion') && s.id !== 'lanes') continue;
    for (const n of s.el.querySelectorAll('.words h2, .words p:not(.links), .line, .clip-h, .clip blockquote p')) {
      const p = document.createElement('p');
      p.textContent = (n.matches('.clip-h') ? 'ExchangeWire press release, 28 August 2026: ' : '') + (c => { for (const x of c.querySelectorAll('.static-only')) x.remove(); return c; })(n.cloneNode(true)).textContent.replace(/\s+/g, ' ').trim();
      transcript.append(p);
    }
  }
  reel.before(transcript);

  /* ---------- geometry that comes from the photographs ---------- */
  // White lines in assets/deck/09-empty-track.jpg, as fractions of its height (measured from the file).
  const LINES = [[0.1722, 0.1861], [0.4731, 0.488], [0.8324, 0.8481]];
  const lane = (() => { const el = stage.querySelector('.lane'); return el && { el, i: +el.dataset.lane, strip: el.querySelector('.strip'), w: 0 }; })();
  const clip = by.press && by.press.el.querySelector('.clip');
  const paper = by.press && by.press.el.querySelector('.paper');
  const mark = clip && clip.querySelector('mark');
  let W = 0, H = 0, pressTravel = 0, drawnS = -1;
  const unit = () => (reel.offsetHeight - stage.offsetHeight) / total || 1;   // px of scroll per unit
  function measure() {
    if (lane) lane.w = lane.strip.scrollWidth;
    // the article only moves if it does not fit its panel (a phone); then it travels until the link is on the panel
    if (clip) pressTravel = Math.max(0, clip.offsetTop + clip.offsetHeight - paper.clientHeight * 0.94);
    drawnS = -1;   // sizes changed: draw the current moment again
  }
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const sc = Math.max(W / 1920, H / 1080), ih = 1080 * sc, oy = (H - ih) / 2, y = f => clamp(oy + f * ih, 0, H);
    const gaps = [[0, y(LINES[0][0])], [y(LINES[0][1]), y(LINES[1][0])], [y(LINES[1][1]), y(LINES[2][0])], [y(LINES[2][1]), H]];
    for (const s of [by.lanes, by.sf]) {
      if (!s) continue;
      s.el.style.setProperty('--g1t', gaps[1][0] + 'px'); s.el.style.setProperty('--g1h', (gaps[1][1] - gaps[1][0]) + 'px');
      s.el.style.setProperty('--g0h', gaps[0][1] + 'px');
      s.el.style.setProperty('--g2t', gaps[2][0] + 'px'); s.el.style.setProperty('--g2h', (gaps[2][1] - gaps[2][0]) + 'px');
    }
    if (lane) {
      lane.el.style.setProperty('--top', gaps[lane.i][0] + 'px');
      lane.el.style.setProperty('--height', Math.max(0, gaps[lane.i][1] - gaps[lane.i][0]) + 'px');
    }
    measure();
  }
  if (lane) for (const im of lane.strip.querySelectorAll('img')) im.addEventListener('load', measure);
  if (document.fonts && document.fonts.load) {
    // the article's two faces belong to a shot that is not laid out at first, so ask for them now
    Promise.all([document.fonts.load('700 1em Archivo'), document.fonts.load('400 1em Martel'), document.fonts.load('700 1em Martel')]).then(measure, () => {});
    document.fonts.ready.then(measure);
  }
  layout();

  /* ---------- state ---------- */
  let active = null, lastScroll = -1e9, last = performance.now(), lastS = -1, settled = true, snap = false, held = null;
  // ?hold=lanes:0.5 pins the edit to one moment whatever the scroll position (used to photograph a state)
  const hold = query.get('hold');
  if (hold) { const [id, t] = hold.split(':'); if (by[id]) held = by[id].from + by[id].len * clamp(+t || 0, 0, 0.999); }

  /* ---------- 1. the film ---------- */
  // Two stretches of the London film where people are running (0:48 to 0:54 and 0:57 to 1:01), cut into a short
  // silent loop and hosted with the page, in a wide and an upright crop.
  const FILM = '../../assets/film/' + (matchMedia('(orientation: portrait)').matches ? 'runs-portrait.mp4' : 'runs-1600.mp4');
  const termLines = by.film ? [...by.film.el.querySelectorAll('.term .l')] : [];
  const video = by.film && by.film.el.querySelector('video');
  let stillSince = 0, frozenAt = 0, playPending = false, filmLoaded = false, ran = false, filmOff = false;
  function filmLoad() {
    if (!video || filmLoaded || held !== null || saveData) return;
    filmLoaded = true;
    video.addEventListener('loadeddata', () => by.film.el.classList.add('rolling'), { once: true });   // the film's own frame replaces the still
    video.addEventListener('error', () => { filmOff = true; });
    video.loop = true; video.preload = 'auto'; video.src = FILM; video.load();
  }
  function film(now, moving, t) {
    const el = by.film.el;
    filmLoad();
    // the build log is written by distance run: it only gets longer while the reader keeps moving
    const shown = Math.floor(seg(t, 0.03, 0.82) * termLines.length + 0.001);
    termLines.forEach((l, i) => l.classList.toggle('on', i < shown || (i === termLines.length - 1 && shown >= termLines.length - 1)));
    // once "build paused." is up it stays for half a second, so it never strobes between flicks
    const lockedOn = frozenAt && now - frozenAt < 500;
    if (moving && !lockedOn) {
      stillSince = 0; frozenAt = 0;
      el.classList.remove('frozen', 'w');
      if (filmLoaded && !filmOff && video.paused && !playPending) {
        playPending = true;
        const p = video.play();
        if (p && p.then) p.then(() => { playPending = false; ran = true; }, e => { playPending = false; if (e && e.name === 'NotAllowedError') filmOff = true; });
        else playPending = false;
      }
    } else if (!moving) {
      if (!video.paused) video.pause();
      if (!stillSince) stillSince = now;
      // the line is only true if something was running: it needs the film on screen
      if (!frozenAt && ran && now - stillSince > 450 && el.classList.contains('rolling')) { frozenAt = now; el.classList.add('frozen', 'w'); }
    }
  }
  function filmRest() { if (video && !video.paused) video.pause(); }
  // Phones ignore preload, so the first touch, wheel or key starts the download; the film is then ready when its shot arrives.
  const prime = () => {
    removeEventListener('touchstart', prime); removeEventListener('wheel', prime); removeEventListener('keydown', prime);
    filmLoad();
    if (!filmLoaded) return;
    const p = video.play();
    if (p && p.then) p.then(() => { if (!active || active.id !== 'film') video.pause(); }, () => {});
  };
  addEventListener('touchstart', prime, { passive: true }); addEventListener('wheel', prime, { passive: true }); addEventListener('keydown', prime);
  addEventListener('load', filmLoad);

  /* ---------- 3. the press release: the highlighter is drawn a beat after the panel changes ---------- */
  let pressCur = 0;
  function press(t, dt, now) {
    const target = seg(t, 0.1, 0.6);
    pressCur = snap ? target : follow(pressCur, target, dt, 0.1);
    clip.style.transform = pressTravel ? `translate3d(0,${Math.round(-pressTravel * pressCur)}px,0)` : '';
    const lit = pressTravel ? t > 0.55 : now - by.press.at > 650;
    if (mark) mark.classList.toggle('lit', lit);
    if (Math.abs(pressCur - target) > 0.0005 || (!lit && !pressTravel)) settled = false;
  }

  /* ---------- 4. the lane ---------- */
  let laneCur = 0;
  function lanes(t, dt) {
    laneCur = snap ? t : follow(laneCur, t, dt, 0.12);
    // the lane cuts on already full and travels from there, so the track is only ever empty for San Francisco
    const x = -laneCur * Math.max(0, lane.w - W);
    const d = window.devicePixelRatio || 1;
    lane.strip.style.transform = `translate3d(${Math.round(x * d) / d}px,0,0)`;
    if (Math.abs(laneCur - t) > 0.0003) settled = false;
  }

  /* ---------- the loop ---------- */
  addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });

  function near(i) {
    let changed = false;
    for (const n of shots.slice(Math.max(0, i - 1), i + 3)) {
      if (n.el.classList.contains('near')) continue;
      n.el.classList.add('near'); changed = true;
      for (const im of n.el.querySelectorAll('img')) { im.loading = 'eager'; if (im.decode) im.decode().catch(() => {}); }
    }
    if (changed) measure();
  }

  function enter(shot, prev, now, forward, t) {
    const edge = t <= 0.03 || t >= 0.97;
    const cutPair = prev && CUTS.has(prev.id + '>' + shot.id);
    for (const x of shots) x.el.classList.remove('wipe-f', 'wipe-b');
    if (prev) {
      prev.el.classList.remove('on', 'frozen');
      if (edge && !cutPair && held === null) {
        // the last shot stays underneath, sentence and all, until the new one has covered it
        const old = prev.el; old.classList.add('out');
        setTimeout(() => { old.classList.remove('out'); if (!old.classList.contains('on')) old.classList.remove('w'); }, 470);
        shot.el.classList.add(forward ? 'wipe-f' : 'wipe-b');
      } else prev.el.classList.remove('w', 'out');
      if (prev.id === 'press' && mark) mark.classList.remove('lit');
    } else for (const x of shots) if (x !== shot) x.el.classList.remove('on', 'w');
    shot.el.classList.remove('out');
    shot.el.classList.add('on');
    // arriving anywhere but a shot's edge (a reload, a link, a key) shows the settled state straight away
    snap = held !== null || !prev || (t > 0.03 && t < 0.97);
    shot.at = snap ? now - BEAT : now;
    stillSince = 0; frozenAt = 0;
    if (shot.id === 'lanes' && !snap) laneCur = forward ? 0 : 1;
    if (shot.id === 'press' && !snap) pressCur = forward ? 0 : 1;   // the highlight, once drawn, stays drawn
    near(shots.indexOf(shot));
    if (shot.id === 'press' || shot.id === 'lanes') measure();   // sizes are only final once the shot is laid out
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const s = held !== null ? held : clamp(-reel.getBoundingClientRect().top / unit(), 0, total - 0.001);
    let shot = shots[0];
    for (const c of shots) if (s >= c.from) shot = c;
    // a cut is not undone by a pixel of wobble: going back needs a unit and a half past the threshold
    if (active && shot !== active && shots.indexOf(shot) === shots.indexOf(active) - 1 && s > active.from - 1.5) shot = active;
    const t = clamp((s - shot.from) / shot.len);
    if (shot !== active) { enter(shot, active, now, s >= lastS, t); active = shot; drawnS = -1; }
    lastS = s;
    // nothing has changed and nothing is still catching up: rest
    if (s === drawnS && settled && shot.id !== 'film') { requestAnimationFrame(frame); return; }
    drawnS = s; settled = true;
    shot.el.style.setProperty('--t', t.toFixed(4));
    if (!OWN_WORDS.has(shot.id)) {
      const on = WITH_PICTURE.has(shot.id) || now - shot.at >= BEAT;
      shot.el.classList.toggle('w', on);
      if (!on) settled = false;
    }
    const moving = now - lastScroll < 200;
    if (shot.id === 'film') film(now, moving, t); else filmRest();
    if (shot.id === 'press') press(t, dt, now);
    if (shot.id === 'lanes') lanes(t, dt);
    snap = false;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // A fling can outrun the loader, so once the page has loaded the remaining photographs are fetched in order.
  addEventListener('load', () => {
    if (saveData || held !== null) return;
    let i = 0;
    (function warm() { if (i >= shots.length) return; near(i); i += 3; setTimeout(warm, 400); })();
  });

  // Resizing or rotating changes the size of a unit; stay on the same moment of the edit.
  addEventListener('resize', () => {
    const keep = lastS, before = unit();
    layout(); drawnS = -1;
    if (keep >= 0 && held === null && Math.abs(unit() - before) > 0.05) scrollTo(0, reel.getBoundingClientRect().top + scrollY + keep * unit());
  });

  try {
    console.log('%cRunning Hackathon', 'font:800 22px Inter Tight,system-ui,sans-serif');
    console.log(['$ git log --oneline', '240926b  barcelona: did it again, by the sea', '290826a  london: 32 teams, 1,177 km, one sauna', '', '$ git log san-francisco', "fatal: your current branch 'san-francisco' does not have any commits yet", '', 'Want to make the first one? runninghackathon@gmail.com'].join(String.fromCharCode(10)));
  } catch (e) {}


  /* ---------- getting around without a wheel ---------- */
  const goTo = (shot, into = 0.45) => scrollTo({ top: reel.getBoundingClientRect().top + scrollY + (shot.from + shot.len * into) * unit() });
  addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || !active) return;
    const i = shots.indexOf(active);
    if (e.key === 'ArrowRight' && shots[i + 1]) { e.preventDefault(); goTo(shots[i + 1]); }
    if (e.key === 'ArrowLeft' && shots[i - 1]) { e.preventDefault(); goTo(shots[i - 1]); }
  });
  // ?at=lanes:0.5 opens the page on a given shot, part-way through it
  const at = query.get('at');
  if (at) { const [id, t] = at.split(':'); if (by[id]) addEventListener('load', () => goTo(by[id], t === undefined ? 0.45 : +t)); }
  if (location.hash === '#end' && by.sf) addEventListener('load', () => goTo(by.sf, 0.5));
  const skip = document.querySelector('.skip');
  if (skip && by.sf) skip.addEventListener('click', e => { e.preventDefault(); goTo(by.sf, 0.5); });
})();
