import { mountRunners } from './runner-motion.js';
import { hybrids, createHybrid, comparisonCards } from './hybrids.js';
const params = new URLSearchParams(location.search);
const embedded = params.get('embed') === '1';
const root = document.getElementById('concept-root');
const comparison = document.getElementById('comparison');
const notes = document.getElementById('notes');
let currentConcept;
let motion;
const picker = document.getElementById('concept-picker');
comparison.querySelector('.compare-grid').innerHTML = comparisonCards();

if (embedded) document.body.classList.add('embedded');

function setConcept(choice, updateURL = true) {
  motion?.cleanup();
  const next = ['track', 'field', 'compare', ...hybrids.map(item => item.id)].includes(choice) ? choice : 'compare';
  currentConcept = next;
  picker.value = next;
  document.querySelectorAll('[data-choice]').forEach(button => {
    if (button.hasAttribute('aria-pressed')) button.setAttribute('aria-pressed', String(button.dataset.choice === next));
  });
  comparison.hidden = next !== 'compare';
  root.hidden = next === 'compare';
  if (next === 'compare') {
    document.querySelectorAll('iframe[data-src]').forEach(frame => {
      if (!frame.getAttribute('src')) frame.src = frame.dataset.src;
    });
    scalePreviews();
  } else {
    root.replaceChildren(next.startsWith('hybrid-') ? createHybrid(next) : document.getElementById(`${next}-concept`).content.cloneNode(true));
    root.querySelector('[data-nav]').replaceWith(document.getElementById('shared-nav').content.cloneNode(true));
    if (!embedded) motion = mountRunners(root);
  }
  if (updateURL) {
    const url = new URL(location.href);
    url.searchParams.set('concept', next);
    url.hash = '';
    history.replaceState(null, '', url);
  }
  document.title = `Running Hackathon — ${hybrids.find(item => item.id === next)?.name || (next === 'field' ? 'Midsummer fields' : next === 'compare' ? 'Five merged concepts' : 'Track morning')}`;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function scalePreviews() {
  document.querySelectorAll('.preview-stage').forEach(stage => {
    stage.style.setProperty('--preview-scale', stage.clientWidth / 1440);
  });
}

document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => setConcept(button.dataset.choice)));
picker.addEventListener('change', () => setConcept(picker.value));
document.getElementById('notes-open').addEventListener('click', () => notes.showModal());
document.getElementById('notes-close').addEventListener('click', () => notes.close());
notes.addEventListener('click', event => { if (event.target === notes) notes.close(); });
new ResizeObserver(scalePreviews).observe(document.body);
setConcept(params.get('concept') || 'compare', false);
