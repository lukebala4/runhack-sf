/* The address under the sponsor button can be copied with one press. */
(() => {
  for (const b of document.querySelectorAll('[data-copy]')) b.addEventListener('click', () => {
    const text = b.dataset.copy;
    const done = () => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = 'Copy'; }, 1800); };
    const old = () => {
      const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.append(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      t.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, old); else old();
  });
})();

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
   Scroll distance is the only clock. Which shot is up, how far a new shot has been drawn across the last one,
   where a photograph has got to in its window: all of it is a function of how far the reader has scrolled, so
   the page stops when the reader stops. That is the event's rule (the build only moves while someone runs).
   Pictures travel sideways, the way the runners go; sentences never move.
   1. the film starts inside the runner's window, the window opens to the whole stage, and the film itself only
      plays while the reader is scrolling;
   2. "It rained," holds across a smash cut to the sauna, where the line completes in place;
   3. the megaphone window keeps riding while the number beside it becomes the ExchangeWire press release;
   4. the 1,177 km photograph steps down into one lane of the track, photographs run along that lane from London
      to Barcelona, the Barcelona one opens to the whole stage and then runs off. The empty track left is San Francisco.
   Without this file, or with reduced motion, the page is the same shots as a plain sequence. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reel = document.getElementById('reel');
  const stage = document.getElementById('stage');
  const query = new URLSearchParams(location.search);
  const ok = reel && stage && window.CSS && CSS.supports('height', '100lvh') && CSS.supports('overflow', 'clip') &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches && !query.has('plain');
  if (!ok) { root.classList.remove('js'); return; }
  root.classList.add('js');
  window.__journey = true;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const follow = (cur, target, dt, tau) => cur + (target - cur) * (1 - Math.exp(-dt / tau));
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const portraitMq = matchMedia('(orientation: portrait)');
  const coarse = matchMedia('(pointer: coarse)').matches;

  /* ---------- cue sheet, read from the markup ---------- */
  const WIPE = new Set(['rule', 'london', 'rained', 'posts', 'distance']);   // drawn across the shot before; the rest are cuts
  const WIPE_LEN = 14;                                                          // scroll units a wipe takes
  let total = 0;
  const shots = [...stage.querySelectorAll('.scene')].map((el, i) => {
    const id = el.dataset.scene, len = +el.dataset.len || 80;
    const shot = { el, id, len, i, from: total };
    total += len;
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
  let W = 0, H = 0, pressTravel = 0, drawn = -1;

  // The lane begins with the photograph the distance shot left in it and ends with the one Barcelona opens from,
  // so both cuts land on an identical picture.
  const matches = [];
  if (lane) for (const [id, cls, put] of [['distance', 'm1', 'prepend'], ['barcelona', 'm2', 'append']]) {
    const from = by[id] && by[id].el.querySelector('.photo img');
    if (!from) continue;
    const im = document.createElement('img'); im.className = 'match ' + cls; im.alt = '';
    lane.strip[put](im);
    const m = { from, im };
    matches.push(m);
    from.addEventListener('load', () => { syncMatch(m); measure(); });
  }
  function syncMatch(m) {
    const src = m.from.currentSrc || '';
    if (src && m.im.src !== src) m.im.src = src;
    m.im.style.objectPosition = getComputedStyle(m.from).objectPosition;
  }

  const unit = () => (reel.offsetHeight - stage.offsetHeight) / total || 1;   // px of scroll per unit
  function measure() {
    if (lane) lane.w = lane.strip.scrollWidth;
    // the article only moves if it does not fit its panel (a phone); then it travels until the link is on the panel
    if (clip) pressTravel = Math.max(0, clip.offsetTop + clip.offsetHeight - paper.clientHeight * 0.94);
    drawn = -1;   // sizes changed: draw the current moment again
  }
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const sc = Math.max(W / 1920, H / 1080), ih = 1080 * sc, oy = (H - ih) / 2, y = f => clamp(oy + f * ih, 0, H);
    const gaps = [[0, y(LINES[0][0])], [y(LINES[0][1]), y(LINES[1][0])], [y(LINES[1][1]), y(LINES[2][0])], [y(LINES[2][1]), H]];
    const g2t = gaps[2][0], g2h = Math.max(1, gaps[2][1] - gaps[2][0]);
    const py = portraitMq.matches ? g2t : 0;            // on a phone the Barcelona photograph opens to the stage below the upper lane
    const ls = g2h / H, bs = g2h / (H - py);
    const set = (k, v) => stage.style.setProperty(k, v);
    set('--g0h', gaps[0][1] + 'px');
    set('--g1t', gaps[1][0] + 'px'); set('--g1h', (gaps[1][1] - gaps[1][0]) + 'px');
    set('--g3t', gaps[3][0] + 'px'); set('--g2t', g2t + 'px'); set('--g2h', g2h + 'px');
    set('--ls', ls.toFixed(5)); set('--cellw', (W * ls) + 'px'); set('--lead', (W - W * ls) + 'px');
    set('--bs', bs.toFixed(5)); set('--bcellw', (W * bs) + 'px'); set('--blead', (W - W * bs) + 'px'); set('--py', py + 'px');
    if (lane) {
      lane.el.style.setProperty('--top', gaps[lane.i][0] + 'px');
      lane.el.style.setProperty('--height', Math.max(0, gaps[lane.i][1] - gaps[lane.i][0]) + 'px');
    }
    matches.forEach(syncMatch);
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
  let active = null, under = null, lastScroll = -1e9, last = performance.now(), sCur = -1, held = null;
  // ?hold=lanes:0.5 pins the edit to one moment whatever the scroll position (used to photograph a state)
  const hold = query.get('hold');
  if (hold) { const [id, t] = hold.split(':'); if (by[id]) held = by[id].from + by[id].len * clamp(+t || 0, 0, 0.999); }

  /* ---------- the film ---------- */
  // Two stretches of the London film where people are running (0:48 to 0:54 and 0:57 to 1:01), cut into a short
  // silent loop and hosted with the page, in a wide and an upright crop.
  const termLines = by.film ? [...by.film.el.querySelectorAll('.term .l')] : [];
  function makeFilm(shot, src, lines) {
    const el = shot.el, video = el.querySelector('video');
    let stillSince = 0, frozenAt = 0, playPending = false, loaded = false, ran = false, off = false, pace = 1;
    function load() {
      if (!video || loaded || held !== null || saveData) return;
      loaded = true;
      video.addEventListener('loadeddata', () => el.classList.add('rolling'), { once: true });   // the film's own frame replaces the still
      video.addEventListener('error', () => { off = true; });
      video.loop = true; video.preload = 'auto'; video.src = src; video.load();
    }
    function tick(now, moving, t, speed, dt) {
      load();
      // the build log is written by distance run: it only gets longer while the reader keeps moving
      const shown = Math.floor(seg(t, 0.30, 0.86) * lines.length + 0.001);
      lines.forEach((l, i) => l.classList.toggle('on', i < shown || (i === lines.length - 1 && shown >= lines.length - 1)));
      // the runners keep the reader's pace
      pace = follow(pace, clamp(0.8 + speed / 2500, 0.8, 1.6), dt, 0.3);
      // once "build paused." is up it stays for half a second, so it never strobes between flicks
      const lockedOn = frozenAt && now - frozenAt < 500;
      if (moving && !lockedOn) {
        stillSince = 0; frozenAt = 0;
        el.classList.remove('frozen');
        if (loaded && !off) {
          try { if (Math.abs(video.playbackRate - pace) > 0.05) video.playbackRate = pace; } catch (e) {}
          if (video.paused && !playPending) {
            playPending = true;
            const p = video.play();
            if (p && p.then) p.then(() => { playPending = false; ran = true; }, e => { playPending = false; if (e && e.name === 'NotAllowedError') off = true; });
            else playPending = false;
          }
        }
      } else if (!moving) {
        if (!video.paused) video.pause();
        if (!stillSince) stillSince = now;
        // the line is only true if something was running: it needs the film on screen
        if (lines.length && !frozenAt && ran && t > 0.3 && now - stillSince > 450 && el.classList.contains('rolling')) { frozenAt = now; el.classList.add('frozen'); }
      }
    }
    function rest() { if (video && !video.paused) video.pause(); el.classList.remove('frozen'); stillSince = 0; frozenAt = 0; }
    return { load, tick, rest, video, isLoaded: () => loaded };
  }
  const films = {};
  if (by.film) films.film = makeFilm(by.film, '../../assets/film/' + (portraitMq.matches ? 'runs-portrait.mp4' : 'runs-1600.mp4'), termLines);
  if (by.bfilm) films.bfilm = makeFilm(by.bfilm, '../../assets/film/barcelona-runs.mp4', []);
  // Phones ignore preload, so the first touch, wheel or key starts the download; the films are then ready when their shots arrive.
  const prime = () => {
    removeEventListener('touchstart', prime); removeEventListener('wheel', prime); removeEventListener('keydown', prime);
    for (const [id, f] of Object.entries(films)) {
      f.load();
      if (!f.isLoaded()) continue;
      const p = f.video.play();
      if (p && p.then) p.then(() => { if (!active || active.id !== id) f.video.pause(); }, () => {});
    }
  };
  addEventListener('touchstart', prime, { passive: true }); addEventListener('wheel', prime, { passive: true }); addEventListener('keydown', prime);
  addEventListener('load', () => { if (films.film) films.film.load(); });

  /* ---------- the loop ---------- */
  addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });

  function near(i) {
    let changed = false;
    for (const n of shots.slice(Math.max(0, i - 1), i + 3)) {
      if (n.el.classList.contains('near')) continue;
      n.el.classList.add('near'); changed = true;
      for (const im of n.el.querySelectorAll('img')) { im.loading = 'eager'; if (im.decode) im.decode().catch(() => {}); }
    }
    if (changed) { matches.forEach(syncMatch); measure(); }
  }

  // which shot is up, and which one (if any) is still showing underneath it
  function show(shot, below) {
    if (shot !== active) {
      if (!active) for (const x of shots) x.el.classList.remove('on');   // the markup starts with the cover up
      if (active) { active.el.classList.remove('on', 'wipe'); if (films[active.id]) films[active.id].rest(); }
      shot.el.classList.add('on');
      stage.dataset.shot = shot.id;
      active = shot;
      near(shot.i);
      if (shot.id === 'press' || shot.id === 'lanes') measure();   // sizes are only final once the shot is laid out
    }
    if (below !== under) {
      if (under) under.el.classList.remove('out');
      if (below) { below.el.classList.add('out'); below.el.style.setProperty('--t', '1'); }
      under = below;
    }
  }

  // the sponsor button takes the colour that reads on whatever is under it at this moment
  function tone(shot, t, inP) {
    if (inP < 0.12 && under) return under.el.dataset.tone;
    const land = !portraitMq.matches;
    if (shot.id === 'film' && land) return t < 0.2 ? 'dark' : 'light';
    if (shot.id === 'distance') return t < 0.45 ? 'light' : 'dark';
    if (shot.id === 'bfilm') return !land && t > 0.1 && t < 0.9 ? 'light' : 'dark';
    if (shot.id === 'barcelona') return land && t > 0.15 && t < 0.9 ? 'light' : 'dark';
    return shot.el.dataset.tone || 'dark';
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const s = held !== null ? held : clamp(-reel.getBoundingClientRect().top / unit(), 0, total - 0.001);
    const before = sCur;
    // the edit follows the scroll position closely rather than exactly, so a wheel notch reads as a stride, not a jump
    if (held !== null || sCur < 0 || Math.abs(s - sCur) > 70) sCur = s;
    else { sCur = follow(sCur, s, dt, coarse ? 0.04 : 0.09); if (Math.abs(sCur - s) < 0.02) sCur = s; }
    const isFilm = active && films[active.id];
    if (sCur === drawn && !isFilm) { requestAnimationFrame(frame); return; }   // nothing has changed: rest
    drawn = sCur;
    const speed = before < 0 ? 0 : Math.abs(sCur - before) * unit() / Math.max(dt, 0.001);

    let shot = shots[0];
    for (const c of shots) if (sCur >= c.from) shot = c;
    const t = clamp((sCur - shot.from) / shot.len);
    let below = null, inP = 1;
    if (WIPE.has(shot.id) && shot.i > 0 && sCur - shot.from < WIPE_LEN) { below = shots[shot.i - 1]; inP = (sCur - shot.from) / WIPE_LEN; }
    else if (shot.id === 'film' && t < 0.28 && !portraitMq.matches) below = by.rule;   // the runner's window is still on the stage while the film opens out of it
    show(shot, below);
    shot.el.classList.toggle('wipe', inP < 1);
    shot.el.style.setProperty('--in', inP.toFixed(4));
    shot.el.style.setProperty('--t', t.toFixed(4));
    stage.dataset.tone = tone(shot, t, inP);

    if (films[shot.id]) films[shot.id].tick(now, now - lastScroll < 200, t, speed, dt);
    if (shot.id === 'press' && clip) clip.style.transform = pressTravel ? `translate3d(0,${Math.round(-pressTravel * seg(t, 0.1, 0.6))}px,0)` : '';
    if (shot.id === 'lanes' && lane) {
      const d = window.devicePixelRatio || 1;
      lane.strip.style.transform = `translate3d(${Math.round(-t * Math.max(0, lane.w - W) * d) / d}px,0,0)`;
    }
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
    const keep = sCur, before = unit();
    layout();
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
    if (e.key === 'ArrowRight' && shots[active.i + 1]) { e.preventDefault(); goTo(shots[active.i + 1]); }
    if (e.key === 'ArrowLeft' && shots[active.i - 1]) { e.preventDefault(); goTo(shots[active.i - 1]); }
  });
  // ?at=lanes:0.5 opens the page on a given shot, part-way through it
  const at = query.get('at');
  if (at) { const [id, t] = at.split(':'); if (by[id]) addEventListener('load', () => goTo(by[id], t === undefined ? 0.45 : +t)); }
  if (location.hash === '#end' && by.sf) addEventListener('load', () => goTo(by.sf, 0.5));
  const skip = document.querySelector('.skip');
  if (skip && by.sf) skip.addEventListener('click', e => { e.preventDefault(); goTo(by.sf, 0.5); });
})();
