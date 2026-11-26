/* The scroll edit.
   Scroll chooses the shot. Most changes are hard cuts at a scroll position. Five moments do more:
   1. the film runs only while the reader is scrolling and freezes when they stop (the event's one rule);
   2. "It rained," holds across a smash cut to the sauna;
   3. the megaphone photograph stays while the panel beside it becomes the ExchangeWire piece;
   4. photographs run along the track's own lanes, from London to Barcelona;
   5. a photo-finish wipe drags Barcelona into streaks that become the empty lanes of San Francisco.
   Without this file, or with reduced motion, the page is the same shots as a plain sequence. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reel = document.getElementById('reel');
  const stage = document.getElementById('stage');
  const ok = reel && stage && window.CSS && CSS.supports('height', '100svh') && CSS.supports('overflow', 'clip') &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) { root.classList.remove('js'); return; }
  root.classList.add('js');
  window.__journey = true;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const follow = (cur, target, dt, tau) => cur + (target - cur) * (1 - Math.exp(-dt / tau));

  /* ---------- cue sheet, read from the markup ---------- */
  // When the sentence is on screen, as a share of the shot. Picture and words never change on the same
  // scroll position, except the sauna, where the joke lands on the cut.
  const WORDS = { rained: [0.3, 1.01], sauna: [0, 0.93], lanes: [0.05, 1.01], press: null, film: null, sf: null, cover: [0, 0.93] };
  const PUSH = new Set(['cover', 'rule', 'london', 'posts', 'distance', 'barcelona']);
  let total = 0;
  const shots = [...stage.querySelectorAll('.scene')].map(el => {
    const id = el.dataset.scene, len = +el.dataset.len || 90;
    const shot = { el, id, len, from: total, words: id in WORDS ? WORDS[id] : [0.2, 0.93] };
    total += len;
    if (PUSH.has(id)) el.classList.add('push');
    return shot;
  });
  const by = Object.fromEntries(shots.map(s => [s.id, s]));
  reel.style.setProperty('--total', total);

  // The sentences once, in order, for anyone not following the pinned stage by eye.
  const transcript = document.createElement('div');
  transcript.className = 'sr';
  transcript.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
  for (const s of shots) {
    if (s.el.hasAttribute('data-motion') && s.id !== 'lanes') continue;
    for (const n of s.el.querySelectorAll('.words h2, .words p:not(.links), .clip-h, .line')) {
      const p = document.createElement('p'); p.textContent = n.textContent.replace(/\s+/g, ' ').trim(); transcript.append(p);
    }
  }
  reel.before(transcript);

  /* ---------- geometry that comes from the photographs ---------- */
  // White lines in assets/deck/09-empty-track.jpg, as fractions of its height (measured from the file).
  const LINES = [[0.1722, 0.1861], [0.4731, 0.488], [0.8324, 0.8481]];
  const laneEls = [...stage.querySelectorAll('.lane')].map(el => ({ el, i: +el.dataset.lane, strip: el.querySelector('.strip'), w: 0 }));
  let W = 0, H = 0;
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const sc = Math.max(W / 1920, H / 1080), ih = 1080 * sc, oy = (H - ih) / 2, y = f => oy + f * ih;
    const gaps = [[0, y(LINES[0][0])], [y(LINES[0][1]), y(LINES[1][0])], [y(LINES[1][1]), y(LINES[2][0])], [y(LINES[2][1]), H]]
      .map(([a, b]) => [clamp(a, 0, H), clamp(b, 0, H)]);
    for (const s of [by.lanes, by.sf]) {
      if (!s) continue;
      s.el.style.setProperty('--g1t', gaps[1][0] + 'px'); s.el.style.setProperty('--g1h', (gaps[1][1] - gaps[1][0]) + 'px');
      s.el.style.setProperty('--g2t', gaps[2][0] + 'px'); s.el.style.setProperty('--g2h', (gaps[2][1] - gaps[2][0]) + 'px');
    }
    for (const l of laneEls) {
      l.el.style.setProperty('--top', gaps[l.i][0] + 'px');
      l.el.style.setProperty('--height', Math.max(0, gaps[l.i][1] - gaps[l.i][0]) + 'px');
    }
    measure();
  }
  let clip, paper, marks = [], pressTravel = 0;
  function measure() {
    for (const l of laneEls) l.w = l.strip.scrollWidth;
    if (by.press) {
      clip = clip || by.press.el.querySelector('.clip'); paper = paper || by.press.el.querySelector('.paper');
      marks = [...clip.querySelectorAll('mark')];
      const last = marks[marks.length - 1];
      pressTravel = last ? Math.max(0, clip.offsetTop + last.offsetTop + last.offsetHeight - paper.clientHeight * 0.72) : 0;
    }
  }
  addEventListener('resize', () => { layout(); drawnS = -1; });
  addEventListener('load', layout);
  for (const l of laneEls) for (const im of l.strip.querySelectorAll('img')) im.addEventListener('load', measure);
  document.fonts && document.fonts.ready.then(measure);
  layout();

  /* ---------- 1. the film ---------- */
  const FILM = 'https://djjr1drlf4hlxylk.public.blob.vercel-storage.com/videos/runhack-overview-20260912-1080p.mp4';
  const RUNS = [[48.0, 54.3], [56.75, 65.8]];   // the stretches of the film where people are running on the track
  const video = by.film && by.film.el.querySelector('video');
  let run = 0, stillSince = 0, playPending = false, filmLoaded = false;
  function filmLoad() {
    if (!video || filmLoaded || held !== null || (navigator.connection && navigator.connection.saveData)) return;
    filmLoaded = true;
    video.preload = 'auto'; video.src = FILM + '#t=' + RUNS[0][0]; video.load();
  }
  function film(now, moving) {
    const el = by.film.el;
    filmLoad();
    if (moving) {
      stillSince = 0;
      el.classList.remove('frozen', 'w');
      if (filmLoaded && video.paused && !playPending) {
        playPending = true;
        const p = video.play();
        if (p && p.then) p.then(() => { playPending = false; el.classList.add('rolling'); }, () => { playPending = false; });
        else playPending = false;
      }
    } else {
      if (!video.paused) video.pause();
      if (!stillSince) stillSince = now;
      if (now - stillSince > 360) el.classList.add('frozen', 'w');
    }
    const r = RUNS[run];
    if (video.readyState > 0 && (video.currentTime >= r[1] || video.currentTime < r[0] - 0.5)) {
      run = video.currentTime >= r[1] ? (run + 1) % RUNS.length : run;
      video.currentTime = RUNS[run][0];
    }
  }
  function filmRest() { if (video && !video.paused) video.pause(); }

  /* ---------- 3. the press piece scrolls inside its panel; the highlighter is drawn when the line is reached ---------- */
  let pressCur = 0;
  function press(t, dt) {
    pressCur = follow(pressCur, ease(seg(t, 0.16, 0.8)), dt, 0.1);
    const target = ease(seg(t, 0.16, 0.8));
    clip.style.transform = `translate3d(0,${(-pressTravel * pressCur).toFixed(1)}px,0)`;
    settled = Math.abs(pressCur - target) < 0.0005;
    if (marks[0]) marks[0].classList.toggle('lit', t > 0.5);
    if (marks[1]) marks[1].classList.toggle('lit', t > 0.84);
  }

  /* ---------- 4. the lanes ---------- */
  const LANE_DELAY = { 3: 0, 2: 0.05, 0: 0.1 };   // staggered start, nearest lane first
  let lanesCur = 0;
  function lanes(t, dt) {
    lanesCur = follow(lanesCur, t, dt, 0.12);
    settled = Math.abs(lanesCur - t) < 0.0003;
    for (const l of laneEls) {
      const k = seg(lanesCur, 0.04 + LANE_DELAY[l.i], 1);
      const x = W - k * l.w;                       // in from the right edge; ends with the last photograph flush right
      l.strip.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    }
  }

  /* ---------- 5. photo finish into San Francisco ---------- */
  const canvas = by.sf && by.sf.el.querySelector('.finish');
  const g = canvas && canvas.getContext('2d', { alpha: false });
  const band = document.createElement('canvas'), bg = band.getContext('2d');
  let wipe = null;
  function snapshot(shot, cw, ch, k) {
    // what the shot looks like on stage: its background colour and its photograph, cover-fitted as the browser does it
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const x = c.getContext('2d'), sr = stage.getBoundingClientRect();
    x.fillStyle = getComputedStyle(shot.el).backgroundColor; x.fillRect(0, 0, cw, ch);
    const im = shot.el.querySelector('.photo img');
    if (im && im.complete && im.naturalWidth) {
      const r = im.getBoundingClientRect(), pos = getComputedStyle(im).objectPosition.split(' ').map(v => parseFloat(v) / 100);
      const s = Math.max(r.width / im.naturalWidth, r.height / im.naturalHeight), sw = r.width / s, sh = r.height / s;
      x.drawImage(im, (im.naturalWidth - sw) * (pos[0] || 0.5), (im.naturalHeight - sh) * (pos[1] || 0.5), sw, sh,
        (r.left - sr.left) * k, (r.top - sr.top) * k, r.width * k, r.height * k);
    }
    return c;
  }
  function wipeStart(from, now) {
    const k = Math.min(devicePixelRatio || 1, 2), cw = Math.round(W * k), ch = Math.round(H * k);
    canvas.width = cw; canvas.height = ch; band.width = 256; band.height = ch;
    wipe = { t0: now, dur: 820, a: snapshot(from, cw, ch, k), b: snapshot(by.sf, cw, ch, k), cw, ch };
    by.sf.el.classList.add('wiping'); by.sf.el.classList.remove('landed', 'w');
    wipeDraw(0);
  }
  function wipeDraw(p) {
    const { a, b, cw, ch } = wipe, x = Math.round(cw * (1 - ease(p))), bw = Math.sin(Math.PI * p) * cw * 0.6;
    g.drawImage(a, 0, 0);
    if (x < cw) g.drawImage(b, x, 0, cw - x, ch, x, 0, cw - x, ch);
    if (bw > 2 && x > 0) {
      // the photo-finish camera: one column at the line, dragged sideways into streaks that run into the lanes
      bg.globalCompositeOperation = 'source-over';
      bg.drawImage(a, Math.max(0, x - 1), 0, 1, ch, 0, 0, band.width, ch);
      const fade = bg.createLinearGradient(0, 0, band.width, 0);
      fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(0.35, 'rgba(0,0,0,.85)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
      bg.globalCompositeOperation = 'destination-in'; bg.fillStyle = fade; bg.fillRect(0, 0, band.width, ch);
      g.drawImage(band, 0, 0, band.width, ch, x, 0, bw, ch);
    }
  }
  function sf(t, now) {
    const el = by.sf.el;
    if (wipe) {
      const p = clamp((now - wipe.t0) / wipe.dur);
      wipeDraw(p);
      if (p >= 1) { wipe = null; el.classList.remove('wiping'); el.classList.add('landed', 'w'); }
    }
    el.classList.toggle('c1', t > 0.32);
    el.classList.toggle('c2', t > 0.52);
  }

  /* ---------- the loop ---------- */
  let active = null, lastScroll = -1e9, last = performance.now(), lastS = -1, held = null, settled = true, drawnS = -1;
  // ?hold=lanes:0.5 pins the edit to one moment whatever the scroll position (used to photograph a state)
  const hold = new URLSearchParams(location.search).get('hold');
  if (hold) { const [id, t] = hold.split(':'); const sh = shots.find(x => x.id === id); if (sh) held = sh.from + sh.len * clamp(+t || 0, 0, 0.999); }
  addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });

  function enter(shot, prev, now, forward) {
    if (prev) prev.el.classList.remove('on', 'w', 'frozen');
    shot.el.classList.add('on');
    if (shot.id === 'sf') {
      if (prev && forward && prev.id === 'barcelona') wipeStart(prev, now);
      else { wipe = null; shot.el.classList.remove('wiping'); shot.el.classList.add('landed', 'w'); }
    }
    if (prev && prev.id === 'sf') { wipe = null; prev.el.classList.remove('wiping', 'landed', 'c1', 'c2'); }
    if (shot.id === 'lanes') lanesCur = forward ? 0 : 1;
    if (shot.id === 'press') pressCur = forward ? 0 : 1;
    const i = shots.indexOf(shot);
    if (i >= 1) filmLoad();                           // start fetching the film one shot ahead
    for (const n of shots.slice(Math.max(0, i - 1), i + 3)) {
      if (n.el.classList.contains('near')) continue;
      n.el.classList.add('near');
      for (const im of n.el.querySelectorAll('img')) { im.loading = 'eager'; if (im.decode) im.decode().catch(() => {}); }
    }
    measure();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const unit = stage.offsetHeight || 1;
    const s = held !== null ? held : clamp(-reel.getBoundingClientRect().top / unit * 100, 0, total - 0.001);
    let shot = shots[0];
    for (const c of shots) if (s >= c.from) shot = c;
    const t = clamp((s - shot.from) / shot.len);
    if (shot !== active) { enter(shot, active, now, s >= lastS); active = shot; }
    lastS = s;
    // nothing has changed and nothing is still catching up: rest
    if (s === drawnS && settled && !wipe && shot.id !== 'film') { requestAnimationFrame(frame); return; }
    drawnS = s; settled = true;
    shot.el.style.setProperty('--t', t.toFixed(4));
    if (shot.words) shot.el.classList.toggle('w', t >= shot.words[0] && t < shot.words[1]);
    const moving = now - lastScroll < 200;
    if (shot.id === 'film') film(now, moving); else filmRest();
    if (shot.id === 'press') press(t, dt);
    if (shot.id === 'lanes') lanes(t, dt);
    if (shot.id === 'sf') sf(t, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const title = document.title;
  document.addEventListener('visibilitychange', () => { document.title = document.hidden ? 'Nobody is running.' : title; });

  /* ---------- getting around without a wheel ---------- */
  const goTo = (shot, into = 0.45) => {
    const top = reel.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (shot.from + shot.len * into) / 100 * stage.offsetHeight });
  };
  addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || !active) return;
    const i = shots.indexOf(active);
    if (e.key === 'ArrowRight' && shots[i + 1]) { e.preventDefault(); goTo(shots[i + 1]); }
    if (e.key === 'ArrowLeft' && shots[i - 1]) { e.preventDefault(); goTo(shots[i - 1]); }
  });
  // ?at=lanes:0.5 opens the page on a given shot, part-way through it (for sharing a moment, and for checking one)
  const at = new URLSearchParams(location.search).get('at');
  if (at) { const [id, t] = at.split(':'); if (by[id]) addEventListener('load', () => goTo(by[id], t === undefined ? 0.45 : +t)); }
  const skip = document.querySelector('.skip');
  if (skip && by.sf) skip.addEventListener('click', e => { e.preventDefault(); goTo(by.sf, 0.7); });
})();
