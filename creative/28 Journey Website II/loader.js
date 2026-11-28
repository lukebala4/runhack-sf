/* The loading screen: the wordmark fills with ink as the page loads.
   Progress is real work, weighted: the headline typeface (35%), the cover photograph decoded (40%), and the next
   photograph, the first thing a scroll reveals (25%). What is shown never runs ahead of that work and never moves
   backwards; it only follows it at a pace the eye can read (shorter on a return visit). After 4 seconds the page
   is shown whatever is still loading, and a failed font never holds it up.
   ?loader=0.6 freezes the screen at that point, for looking at it.
   Everything it needs is here, in loader.css, and in the .loader block and the one inline line in index.html. */
(() => {
  'use strict';
  const root = document.documentElement, panel = document.querySelector('.loader');
  if (!panel) { root.classList.remove('loading'); return; }
  if (!root.classList.contains('loading')) { panel.remove(); return; }

  const count = panel.querySelector('.loader-count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = v => Math.max(0, Math.min(1, v));
  const paint = d => {
    panel.style.setProperty('--f', clamp(d).toFixed(3));
    count.textContent = String(Math.round(d * 100)).padStart(3, '0');
  };

  const frozen = /[?&]loader=([\d.]+)/.exec(location.search);
  if (frozen) { paint(clamp(+frozen[1])); return; }

  let seen = false;
  try { seen = sessionStorage.getItem('rh-loaded') === '1'; sessionStorage.setItem('rh-loaded', '1'); } catch (e) {}
  const PACE = seen ? 0.45 : 0.9;                                 // seconds for the whole start, at the fastest

  const decoded = img => !img ? Promise.resolve() : new Promise(done => {
    const ok = () => (img.decode ? img.decode().then(done, done) : done());
    if (img.complete) ok(); else { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', done, { once: true }); }
  });
  const fonts = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('800 1em "Inter Tight"'), document.fonts.load('500 1em "Inter Tight"')]).catch(() => {})
    : Promise.resolve();
  const jobs = [
    [0.35, fonts],
    [0.40, decoded(document.querySelector('.s-cover .photo img'))],
    [0.25, decoded(document.querySelector('.s-rule .photo img'))],
  ];
  let real = 0, shown = 0, finished = false, last = performance.now();
  for (const [weight, job] of jobs) { const add = () => { real = Math.min(1, real + weight); }; job.then(add, add); }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const once = (el, ms) => new Promise(r => { el.addEventListener('animationend', r, { once: true }); setTimeout(r, ms); });

  async function finish() {
    if (finished) return;
    finished = true;
    paint(1);
    await wait(reduced ? 150 : 260);
    root.classList.remove('loading');                              // the page can scroll again as the panel lifts
    if (reduced) { panel.classList.add('fade'); await once(panel, 400); }
    else { panel.classList.add('lift'); await once(panel, 800); }
    panel.remove();
  }

  const tick = now => {
    if (finished) return;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    shown = Math.min(real, shown + dt / PACE);
    paint(shown);
    if (shown >= 1) finish(); else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  setTimeout(finish, 4000);                                         // never hold the page for longer than this
})();
