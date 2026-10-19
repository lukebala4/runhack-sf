export const directions = [
  {id:'field-club',name:'Field club',description:'Soft, rounded club lettering in the open sky. Warm paper, forest ink and a generous meadow photograph.'},
  {id:'athletic-standard',name:'Athletic standard',description:'A condensed athletics headline above the photograph. The confidence of a vintage running poster, with plenty of daylight.'},
  {id:'sunday-supplement',name:'Sunday supplement',description:'A quiet magazine spread. An italic serif headline beside the runners, with a slower, more editorial rhythm.'},
  {id:'field-journal',name:'Field journal',description:'The photograph comes first, framed like a print. A wide serif headline and sun-warmed paper sit underneath.'},
  {id:'trackside',name:'Trackside',description:'Slanted track lettering, a wide photograph and a fine brick-red rule. The most athletic of the five.'},
];

const params = new URLSearchParams(location.search);
const embedded = params.get('embed') === '1';
if (embedded) { document.body.classList.add('embedded'); document.documentElement.classList.add('is-embedded'); }
const picker = document.querySelector('#version');
const root = document.querySelector('#design-root');
const comparison = document.querySelector('#comparison');
const grid = document.querySelector('#comparison-grid');
const notes = document.querySelector('#design-notes');
const compareLink = document.querySelector('#compare-link');
const known = new Set(['compare', ...directions.map(v => v.id)]);

const subject = 'Sponsorship enquiry | Running Hackathon San Francisco';
const body = [
  'Hi Running Hackathon team,', '',
  'I’d like to explore sponsoring the San Francisco event.', '',
  'Name: [Your name]', 'Company: [Company name]', 'Website: [Company website]',
  'How we’d like to get involved: [A few words about your ideas or support]', '',
  'Please send over the sponsorship options and next steps.', '', 'Thanks,', '[Your name]',
].join('\r\n');
export const sponsorEmail = `mailto:runninghackathon@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

function title(id) {
  if (id === 'sunday-supplement') return '<span>Good ideas</span> <span>need</span> <span>fresh air</span>';
  return '<span>Good ideas</span> <span>need fresh air</span>';
}

function design(id) {
  return `<article class="design ${id}" id="top">
    <header class="site-header">
      <a class="wordmark" href="#top" aria-label="Running Hackathon home"><img src="assets/running-hackathon-wordmark.svg" alt="Running Hackathon" width="160" height="58"></a>
      <nav aria-label="Main navigation"><a href="#idea">The idea</a><a href="#format">How it works</a></nav>
      <a class="city-link" href="#sf">San Francisco <span aria-hidden="true">↗</span></a>
    </header>
    <section class="hero" aria-labelledby="hero-title">
      <figure class="hero-photo"><img src="assets/meadow-natural-v2.png" width="1667" height="944" alt="AI-generated photograph of three runners following a red track through a sunlit meadow." fetchpriority="high"></figure>
      <div class="hero-heading"><h1 id="hero-title">${title(id)}</h1></div>
    </section>
    <div class="hero-lede"><p>A running hackathon for people who make things.</p><a class="underlink" href="#format">How it works <span aria-hidden="true">↘</span></a></div>
    <nav class="brand-row" aria-label="Featured brands">
      <a href="https://www.redbull.com/" target="_blank" rel="noopener noreferrer"><img class="redbull" src="assets/brands/red-bull.svg" alt="Red Bull" width="225" height="36"></a>
      <a href="https://posthog.com/" target="_blank" rel="noopener noreferrer"><img src="assets/brands/posthog.svg" alt="PostHog" width="200" height="54"></a>
      <a href="https://cognition.com/" target="_blank" rel="noopener noreferrer"><img src="assets/brands/cognition.png" alt="Cognition" width="220" height="54"></a>
    </nav>
    <section class="idea content-wrap" id="idea" aria-labelledby="idea-title">
      <h2 id="idea-title">Run together.<br>Build with AI.</h2>
      <div class="idea-copy"><p>Meet a team, head out for a run, and use your voice and AI to build as you move.</p><p>Come back together and show what you made.</p><img src="assets/runner-sketches.png" alt="Loose ink drawings of a running crew" width="1905" height="825" loading="lazy"></div>
    </section>
    <section class="format content-wrap" id="format" aria-labelledby="format-title"><h2 id="format-title">Take it for a run.</h2><div class="steps">
      <article><h3>Meet your team.</h3><p>Runners, makers, first-timers. Find your people and an idea to take outside.</p></article>
      <article><h3>Make something.</h3><p>Your voice, your phone and AI. Build as you move, at a pace that works for you.</p></article>
      <article><h3>Show what happened.</h3><p>Head back to home base. Share what worked, what didn’t, and what you’ll try next.</p></article>
    </div></section>
    <section class="sf content-wrap" id="sf" aria-labelledby="sf-title"><h2 id="sf-title">See you outside,<br>San Francisco.</h2><div><p>Date and place coming soon.</p><a class="underlink" href="https://www.therunninghackathon.com/" target="_blank" rel="noopener noreferrer">More from Running Hackathon <span aria-hidden="true">↗</span></a></div></section>
    <section class="sponsor content-wrap" aria-labelledby="sponsor-title"><h2 id="sponsor-title">Sponsor the<br>San Francisco event.</h2><div><a class="sponsor-cta" href="${sponsorEmail}">Join as a sponsor <span aria-hidden="true">↗</span></a><p><a href="mailto:runninghackathon@gmail.com">runninghackathon@gmail.com</a></p></div></section>
    <footer class="site-footer content-wrap"><a href="#top" aria-label="Running Hackathon home"><img src="assets/running-hackathon-wordmark.svg" alt="Running Hackathon" width="142" height="52"></a><a href="#top">Back to the start <span aria-hidden="true">↑</span></a></footer>
  </article>`;
}

function buildComparison() {
  if (embedded || grid.childElementCount) return;
  grid.innerHTML = directions.map(v => `<article class="comparison-card"><div class="card-heading"><h2>${v.name}</h2><a href="?version=${v.id}">Explore <span aria-hidden="true">↗</span></a></div><a class="preview" href="?version=${v.id}" aria-label="Explore ${v.name}"><iframe title="${v.name} desktop preview" src="?version=${v.id}&amp;embed=1" width="1440" height="1150" tabindex="-1" aria-hidden="true" loading="lazy"></iframe></a><p>${v.description}</p></article>`).join('');
}

function scalePreviews() {
  grid.querySelectorAll('.preview').forEach(el => el.style.setProperty('--scale', el.clientWidth / 1440));
}

function mount(value, push = false) {
  const next = known.has(value) && !(embedded && value === 'compare') ? value : (embedded ? directions[0].id : 'compare');
  const isCompare = next === 'compare';
  document.body.dataset.version = next;
  picker.value = next;
  comparison.hidden = !isCompare;
  root.hidden = isCompare;
  notes.hidden = isCompare || embedded;
  if (isCompare) compareLink.setAttribute('aria-current','page'); else compareLink.removeAttribute('aria-current');
  if (isCompare) {
    root.replaceChildren();
    buildComparison();
    scalePreviews();
    document.title = 'Meadow lane · Five retro directions';
  } else {
    root.innerHTML = design(next);
    const chosen = directions.find(v => v.id === next);
    document.querySelector('#direction-title').textContent = chosen.name + '.';
    document.querySelector('#direction-description').textContent = chosen.description;
    document.title = `Meadow lane · ${chosen.name}`;
  }
  if (push) {
    const url = new URL(location.href);
    url.searchParams.set('version', next); url.hash = '';
    history.pushState(null, '', url);
  }
  window.scrollTo({top:0,behavior:'instant'});
}

picker.addEventListener('change', () => mount(picker.value, true));
window.addEventListener('popstate', () => mount(new URLSearchParams(location.search).get('version')));
new ResizeObserver(scalePreviews).observe(grid);
mount(params.get('version') || 'compare');
