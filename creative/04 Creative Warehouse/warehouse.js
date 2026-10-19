const grid = document.getElementById('collection-grid');
const search = document.getElementById('search');
const round = document.getElementById('round');
const count = document.getElementById('result-count');
const clear = document.getElementById('clear-filters');
const params = new URLSearchParams(location.search);
const views = ['all', 'concepts', 'images', 'motion', 'references', 'research', 'starred'];
let view = views.includes(params.get('view')) ? params.get('view') : 'all';
let catalog;
let stars = new Set();
try { stars = new Set(JSON.parse(localStorage.getItem('running-hackathon-warehouse-stars') || '[]')); } catch { /* All studies remain accessible when storage is unavailable. */ }
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));

function card(item) {
  const savedRound = catalog.rounds.find(entry => entry.id === item.round);
  const label = savedRound?.title || ({images:'Image library',motion:'Motion & drawing',references:'Inspiration',research:'Planning & research'}[item.kind]);
  const starred = stars.has(item.id);
  return `<article class="collection-card" data-kind="${escape(item.kind)}"><a class="card-image ${escape(item.presentation || '')}" href="${escape(item.href)}" aria-label="Open ${escape(item.title)}${savedRound ? ' — ' + escape(savedRound.title) : ''}"><img src="${escape(item.image)}" alt="${escape(item.alt || item.title)}" loading="lazy" decoding="async"></a><div class="card-meta"><span>${escape(label)}</span><button class="card-star" data-star="${escape(item.id)}" aria-pressed="${starred}" aria-label="${starred ? 'Unstar' : 'Star'} ${escape(item.title)}${savedRound ? ' — ' + escape(savedRound.title) : ''}">${starred ? '★' : '☆'}</button></div><h3 class="card-title"><a href="${escape(item.href)}">${escape(item.title)}</a></h3><p class="card-description">${escape(item.description)}</p>${item.note ? `<p class="card-note">${escape(item.note)}</p>` : ''}<div class="card-links"><a href="${escape(item.href)}">${escape(item.action || 'Open study')} ↗</a>${item.secondary ? `<a href="${escape(item.secondary.href)}">${escape(item.secondary.label)} ↗</a>` : ''}</div></article>`;
}

function render() {
  if (!catalog) return;
  if (!['all','concepts','starred'].includes(view)) round.value = 'all';
  const query = search.value.trim().toLowerCase();
  const matching = catalog.items.filter(item => (view === 'all' || (view === 'starred' ? stars.has(item.id) : item.kind === view)) && (round.value === 'all' || item.round === round.value) && (!query || [item.title, item.description, ...(item.tags || []), catalog.rounds.find(r => r.id === item.round)?.title || ''].join(' ').toLowerCase().includes(query)));
  grid.innerHTML = matching.map(card).join('');
  document.getElementById('empty-state').hidden = matching.length > 0;
  count.textContent = `${matching.length} ${matching.length === 1 ? 'study' : 'studies'}${catalog.items.length !== matching.length ? ` of ${catalog.items.length}` : ''}`;
  clear.hidden = view === 'all' && round.value === 'all' && !query;
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  round.disabled = !['all','concepts','starred'].includes(view);
  round.parentElement.hidden = round.disabled;
  const url = new URL(location.href);
  for (const [key, value] of [['view', view === 'all' ? '' : view], ['q',search.value.trim()], ['round', round.value === 'all' ? '' : round.value]]) { if (value) url.searchParams.set(key, value); else url.searchParams.delete(key); }
  history.replaceState(null, '', url);
}

function reset() { view = 'all'; search.value = ''; round.value = 'all'; render(); }
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { view = button.dataset.view; if (!['all','concepts','starred'].includes(view)) round.value = 'all'; render(); }));
search.addEventListener('input', () => { if (catalog) render(); });
round.addEventListener('change', render);
clear.addEventListener('click', reset);
document.getElementById('empty-reset').addEventListener('click', reset);
grid.addEventListener('click', event => {
  const button = event.target.closest('[data-star]');
  if (!button) return;
  const id = button.dataset.star;
  if (stars.has(id)) stars.delete(id); else stars.add(id);
  try { localStorage.setItem('running-hackathon-warehouse-stars', JSON.stringify([...stars])); } catch { /* Favourites still work for this open session. */ }
  if (view === 'starred') render();
  else {
    const selected = stars.has(id);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', button.getAttribute('aria-label').replace(/^(Unstar|Star)/, selected ? 'Unstar' : 'Star'));
    button.textContent = selected ? '★' : '☆';
  }
});

try {
  // The collection changes while the local studio is open; always read its current list.
  const response = await fetch('catalog.json', {cache: 'no-store'});
  if (!response.ok) throw new Error('Catalog unavailable');
  catalog = await response.json();
  for (const entry of [...catalog.rounds].reverse()) {
    const option = document.createElement('option'); option.value = entry.id; option.textContent = entry.title; round.append(option);
  }
  search.value = params.get('q') || '';
  round.value = catalog.rounds.some(entry => entry.id === params.get('round')) ? params.get('round') : 'all';
  render();
} catch {
  document.getElementById('load-error').hidden = false;
  count.textContent = 'Collection unavailable';
  document.querySelectorAll('.collection-controls input,.collection-controls select,.collection-controls button').forEach(control => { control.disabled = true; });
}
