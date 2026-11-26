// Scroll drives every scene. Each scene is taller than the screen and pins its stage;
// progress through the scene (0 to 1) decides which photo and sentence are in focus,
// how far the route has been drawn and how far the camera has pulled back.
(() => {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // static layout stays
  root.classList.add('js');

  const clamp = v => Math.min(1, Math.max(0, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const smooth = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  // Longitude is squeezed so distances look right at these latitudes.
  const project = ([lon, lat]) => [lon * 0.72, -lat];
  const PLACES = {
    london: project([-0.13, 51.51]),
    barcelona: project([2.17, 41.39]),
    sf: project([-122.42, 37.77]),
  };
  const KM = 1177.5; // sum of the Combined KM column, London final scoring sheet

  const scenes = [...document.querySelectorAll('[data-scene]')].map(el => ({
    el,
    stage: el.querySelector('.stage'),
    beats: [...el.querySelectorAll('[data-in]')].map(b => ({
      el: b, from: +b.dataset.in, to: +b.dataset.out, photo: b.classList.contains('beat'),
    })),
    route: el.dataset.route || null,
    ran: el.querySelector('.ran'),
    next: el.querySelector('.next'),
    head: el.querySelector('.head'),
    count: el.querySelector('[data-count]'),
    places: Object.fromEntries([...el.querySelectorAll('[data-place]')].map(n => [n.dataset.place, n])),
  }));

  function drawRoute(s, p, W, H) {
    const wide = W > 760;
    // Two camera positions: close on London and Barcelona, then pulled back to the Pacific.
    const near = {
      x: 0.75, y: -46.45,
      s: Math.min(0.44 * H / 10.1, 0.34 * W / 3),
      cx: W * (wide ? 0.7 : 0.5), cy: H * (wide ? 0.5 : 0.62),
    };
    const far = {
      x: -43.5, y: -44.5,
      s: Math.min((wide ? 0.72 : 0.58) * W / 89.7, 0.4 * H / 16),
      cx: W * (wide ? 0.48 : 0.42), cy: H * (wide ? 0.62 : 0.66),
    };
    const z = s.route === 'west' ? smooth(seg(p, 0.06, 0.52)) : 0;
    const cam = {
      x: lerp(near.x, far.x, z), y: lerp(near.y, far.y, z),
      s: near.s * Math.pow(far.s / near.s, z),
      cx: lerp(near.cx, far.cx, z), cy: lerp(near.cy, far.cy, z),
    };
    const at = ([x, y]) => [cam.cx + (x - cam.x) * cam.s, cam.cy + (y - cam.y) * cam.s];
    const L = at(PLACES.london), B = at(PLACES.barcelona), S = at(PLACES.sf);

    const ran = s.route === 'west' ? 1 : seg(p, 0.05, 0.6);
    const tip = [lerp(L[0], B[0], ran), lerp(L[1], B[1], ran)];
    s.ran.setAttribute('d', `M${L[0]} ${L[1]}L${tip[0]} ${tip[1]}`);
    if (s.head) { s.head.setAttribute('cx', tip[0]); s.head.setAttribute('cy', tip[1]); }
    if (s.count) s.count.textContent = Math.floor(KM * ran).toLocaleString('en-GB');

    if (s.next) {
      // The leg nobody has run: a dotted arc that bends north like a flight path.
      const t = seg(p, 0.3, 0.86);
      const c = at([(PLACES.barcelona[0] + PLACES.sf[0]) / 2, (PLACES.barcelona[1] + PLACES.sf[1]) / 2 - 15]);
      let d = `M${B[0]} ${B[1]}`;
      const steps = Math.ceil(t * 64);
      for (let i = 1; i <= steps; i++) {
        const u = Math.min(t, i / 64), v = 1 - u;
        d += `L${v * v * B[0] + 2 * v * u * c[0] + u * u * S[0]} ${v * v * B[1] + 2 * v * u * c[1] + u * u * S[1]}`;
      }
      s.next.setAttribute('d', d);
    }

    const label = (node, pt, show, side) => {
      if (!node) return;
      node.style.opacity = show;
      node.style.transform = side === 'below'
        ? `translate(${pt[0]}px,${pt[1] + 16}px) translateX(-50%)`
        : `translate(${pt[0] + 16}px,${pt[1]}px) translateY(-50%)`;
    };
    label(s.places.london, L, 1);
    label(s.places.barcelona, B, s.route === 'west' ? 1 : seg(p, 0.5, 0.62));
    label(s.places.sf, S, seg(p, 0.82, 0.92), wide ? 'right' : 'below');
  }

  let queued = false;
  function update() {
    queued = false;
    const H = innerHeight, W = innerWidth;
    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      if (r.bottom < -H || r.top > 2 * H) continue;
      const travel = Math.max(1, r.height - H);
      const p = clamp(-r.top / travel);
      const f = Math.min(0.3 * H / travel, 0.16); // length of one fade, as a share of the scene
      for (const b of s.beats) {
        const first = b.from <= 0, last = b.to >= 1;
        if (b.photo) {
          // The next photo fades in over the one before it, so the screen never dips to black.
          const a = first ? 1 : clamp((p - (b.from - f)) / f);
          b.el.style.setProperty('--a', p > b.to + 0.001 && !last ? 0 : a);
          b.el.style.setProperty('--t', seg(p, b.from - f, b.to));
        }
        const vin = first ? 1 : clamp((p - b.from) / f);
        const vout = last ? 1 : clamp((b.to - f - p) / f);
        const v = smooth(Math.min(vin, vout));
        (b.photo ? b.el.querySelector('.line') : b.el).style.setProperty('--v', v);
      }
      if (s.route) drawRoute(s, p, W, H);
    }
  }
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  update();
})();
