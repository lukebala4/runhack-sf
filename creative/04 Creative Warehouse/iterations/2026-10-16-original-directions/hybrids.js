export const hybrids = [
  { id: 'hybrid-1', name: 'Open track', image: '01-open-track', width: 1668, height: 943, alt: 'Two runners in cream singlets and brick-orange shoes sprint along a terracotta track beside a wildflower meadow in warm sunlight.' },
  { id: 'hybrid-2', name: 'Meadow lane', image: '02-meadow-lane', width: 1667, height: 943, alt: 'Three friends run away along a terracotta track curving through a Swedish midsummer meadow towards the low sun.' },
  { id: 'hybrid-3', name: 'Morning club', image: '03-morning-club', width: 1667, height: 943, alt: 'A small running crew in cream and olive clothing, with brick-orange shoes, passes wildflowers on a sunlit track.' },
  { id: 'hybrid-4', name: 'Grass and lanes', image: '04-grass-and-lanes', width: 1668, height: 943, alt: 'Three runners in full stride on a curved red track surrounded by long grass and midsummer flowers.' },
  { id: 'hybrid-5', name: 'Out and back', image: '05-out-and-back', width: 1672, height: 941, alt: 'An immersive rear view of runners following a warm terracotta track through an open field, with brick-orange shoes in the foreground.' },
];

function photo(concept) {
  return `<img src="assets/hybrids/${concept.image}.png" alt="${concept.alt}" width="${concept.width}" height="${concept.height}" fetchpriority="high">`;
}

const formatLink = '<a class="text-link" href="#format">How it works <span aria-hidden="true">↘</span></a>';
const lede = 'A running hackathon for people who make things.';

function hero(concept) {
  switch (concept.id) {
    case 'hybrid-1': return `<section class="hybrid-hero open-hero" aria-labelledby="hero-title">
      <div class="open-intro"><h1 id="hero-title">Good ideas<br>need fresh air</h1><div class="hero-lede"><p>${lede}</p>${formatLink}</div></div>
      <figure class="open-photo">${photo(concept)}</figure>
    </section>`;
    case 'hybrid-2': return `<section class="hybrid-hero meadow-hero" aria-labelledby="hero-title">
      ${photo(concept)}<div class="meadow-title"><h1 id="hero-title">Good ideas<br>need fresh air</h1></div>
    </section><div class="meadow-lede"><p>${lede}</p>${formatLink}</div>`;
    case 'hybrid-3': return `<section class="hybrid-hero club-hero" aria-labelledby="hero-title">
      <div class="club-copy"><h1 id="hero-title">Good ideas<br>need<br class="club-break"> fresh air</h1><p>${lede}</p>${formatLink}</div>
      <figure class="club-photo">${photo(concept)}</figure>
    </section>`;
    case 'hybrid-4': return `<section class="hybrid-hero grass-hero" aria-labelledby="hero-title">
      <figure class="grass-photo">${photo(concept)}</figure><div class="grass-intro"><h1 id="hero-title">Good ideas<br>need fresh air</h1><div class="hero-lede"><p>${lede}</p>${formatLink}</div></div>
    </section>`;
    case 'hybrid-5': return `<section class="hybrid-hero back-hero" aria-labelledby="hero-title">
      ${photo(concept)}<div class="back-title"><h1 id="hero-title">Good ideas<br>need fresh air</h1></div>
    </section><div class="back-lede"><p>Go for a run. Build with AI.<br>Come back with something new.</p>${formatLink}</div>`;
  }
}

function continuation(concept) {
  const sketch = concept.id === 'hybrid-3'
    ? '<span class="runner-motion hybrid-runner" data-rive-runner aria-hidden="true"><img src="../../asset-sets/16b1b20313f8b04d033d305bb85ac6d78423512d7fd60e9076353b4799a96bfb/assets/runner-rig.svg" alt="" width="360" height="420"><canvas></canvas></span>'
    : '<img class="hybrid-sketch" src="../../asset-sets/16b1b20313f8b04d033d305bb85ac6d78423512d7fd60e9076353b4799a96bfb/assets/runner-sketches.png" alt="Loose ink drawings of a running crew" width="1905" height="825" loading="lazy">';
  return `<section class="hybrid-idea" id="idea" aria-labelledby="idea-title">
    <h2 id="idea-title">Run together.<br>Build with AI.</h2><div class="hybrid-idea-copy"><p>Meet a team, head out for a run, and use your voice and AI to build as you move.</p><p>Come back together and show what you made.</p>${sketch}</div>
  </section>
  <section class="hybrid-format" id="format" aria-labelledby="format-title"><h2 id="format-title">Take it for a run.</h2>
    <div class="hybrid-steps"><article><h3>Meet your team.</h3><p>Runners, makers, first-timers. Find your people and an idea to take outside.</p></article><article><h3>Make something.</h3><p>Your voice, your phone and AI. Build as you move, at a pace that works for you.</p></article><article><h3>Show what happened.</h3><p>Head back to home base. Share what worked, what didn’t, and what you’ll try next.</p></article></div>
  </section>
  <section class="hybrid-sf" id="sf"><h2>See you outside,<br>San Francisco.</h2><div><p>Date and place coming soon.</p><a class="text-link" href="https://www.therunninghackathon.com/" target="_blank" rel="noopener">More from Running Hackathon ↗</a></div></section>
  <footer class="site-footer"><a href="#top" class="footer-logo" aria-label="Running Hackathon home"><img src="../../asset-sets/16b1b20313f8b04d033d305bb85ac6d78423512d7fd60e9076353b4799a96bfb/assets/running-hackathon-wordmark.svg" alt="Running Hackathon" width="140" height="50"></a><a href="#top">Back to the start ↑</a></footer>`;
}

export function createHybrid(id) {
  const concept = hybrids.find(item => item.id === id);
  const template = document.createElement('template');
  template.innerHTML = `<div class="concept concept-hybrid ${concept.id}" id="top" data-concept="${concept.id}"><div data-nav></div>${hero(concept)}${continuation(concept)}</div>`;
  return template.content;
}

export function comparisonCards() {
  return hybrids.map((concept, index) => `<article class="compare-item"><div class="compare-caption"><h2>${String(index + 1).padStart(2, '0')} / ${concept.name}</h2><a href="?concept=${concept.id}">Open concept <span aria-hidden="true">↗</span></a></div><a class="preview-stage" href="?concept=${concept.id}" aria-label="Open ${concept.name} concept"><iframe title="${concept.name} desktop preview" data-src="?concept=${concept.id}&amp;embed=1" loading="lazy" tabindex="-1" aria-hidden="true"></iframe></a></article>`).join('');
}
