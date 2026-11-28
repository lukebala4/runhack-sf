/* The loading screen: on your marks, get set, go.
   The bar shows real work, weighted: the headline typeface (35%), the cover photograph decoded (40%), and the
   next photograph, the first thing a scroll reveals (25%). It never moves backwards. After 4 seconds the page is
   shown whatever is still loading, and a failed font never holds it up.
   Everything it needs is here, in loader.css, and in the .loader block and the one inline line in index.html. */
(() => {
  'use strict';
  const root = document.documentElement, panel = document.querySelector('.loader');
  if (!panel) { root.classList.remove('loading'); return; }
  if (!root.classList.contains('loading')) { panel.remove(); return; }

  const word = panel.querySelector('.loader-word'), bar = panel.querySelector('.loader-lane i'), count = panel.querySelector('.loader-count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let progress = 0, finished = false;

  const show = p => {
    progress = Math.max(progress, Math.min(1, p));                 // never backwards
    bar.style.setProperty('--p', progress.toFixed(3));
    count.textContent = String(Math.round(progress * 100)).padStart(3, '0');
    if (!finished && progress > 0.55 && word.textContent !== 'Get set') word.textContent = 'Get set';
  };

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
  let done = 0;
  for (const [weight, job] of jobs) job.then(() => { done += weight; show(done); }, () => { done += weight; show(done); });

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const once = (el, name, ms) => new Promise(r => { el.addEventListener('animationend', r, { once: true }); setTimeout(r, ms); });

  async function finish() {
    if (finished) return;
    finished = true;
    show(1);
    word.textContent = 'Go!';
    await wait(reduced ? 150 : 320);                               // let the lane line finish painting
    root.classList.remove('loading');                              // the page can scroll again as the panel lifts
    if (reduced) { panel.classList.add('fade'); await once(panel, 'fade', 400); }
    else {
      panel.classList.add('go'); await once(panel, 'go', 450); await wait(150);
      panel.classList.add('lift'); await once(panel, 'lift', 800);
    }
    panel.remove();
  }
  Promise.all(jobs.map(j => j[1])).then(finish, finish);
  setTimeout(finish, 4000);                                         // never hold the page for longer than this
})();
