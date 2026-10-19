const $ = (selector) => document.querySelector(selector);
const arena = $('#relay');
const entitiesLayer = $('#entities');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const TOTAL = 24;
const storageKey = 'running-hackathon-hare-relay-v1';
const stations = ['Warm up', 'Find an idea', 'Bring it home'];
const safeRead = () => { try { const value = JSON.parse(localStorage.getItem(storageKey) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; } };
const saved = safeRead();
let best = Number.isFinite(saved.best) && saved.best > 0 ? Math.floor(saved.best) : 0;
let partner = typeof saved.partner === 'string' && saved.partner.trim() ? saved.partner.trim().slice(0, 32) : 'Your brand';
let teamColour = ['#283831', '#A0442F', '#354A62', '#8C7445'].includes(saved.colour) ? saved.colour : '#283831';
let state = 'idle';
let score = 0;
let elapsed = 0;
let entities = [];
let lastFrame = 0;
let animationFrame = 0;
let jumpUntil = 0;
let jumpStarted = 0;
let recoverUntil = 0;
let lastSpawn = -0.3;
let spawnIndex = 0;
let previewTimer;
let popTimer;
let announcementTimer;
let currentLeg = 0;
let stepIndex = 0;
let stepMode = reducedMotion.matches;
let pausedForVisibility = false;
let mascotMode = 0;
const stepEncounters = ['spark', 'hurdle', 'spark', 'clear', 'spark', 'hurdle', 'spark', 'clear', 'hurdle', 'spark', 'clear', 'spark'];
const sparkle = '<svg viewBox="0 0 58 58"><path d="M29 2 35 21 54 16 41 31 54 45 35 40 29 57 23 39 5 45 17 30 5 16 23 21Z"/></svg>';
const hurdle = '<svg viewBox="0 0 72 60"><path d="m8 54 5-45h47l5 45M9 12h54v12H9M18 25l-3 29M56 25l3 29"/><path d="m21 12 11 12m13-12 11 12" fill="none"/></svg>';

function persist() { try { localStorage.setItem(storageKey, JSON.stringify({ best, partner, colour: teamColour })); } catch { /* Storage is optional; the relay remains playable. */ } }
function announce(message) { clearTimeout(announcementTimer); $('#game-announcement').textContent = ''; announcementTimer = setTimeout(() => { $('#game-announcement').textContent = message; }, 30); }
function mode(value) { mascotMode = value; window.hareMascot?.setMode?.(value); }
function color(value) { window.hareMascot?.setColor?.(value); }
function setMessage(title, detail) { $('#message-title').textContent = title; $('#message-detail').textContent = detail; }
function updateScore() { $('#score').textContent = String(score).padStart(2, '0'); $('#best').textContent = best; $('#time').innerHTML = `${Math.max(0, Math.ceil(TOTAL - elapsed))}<span>s</span>`; }
function pop(text, miss = false) { clearTimeout(popTimer); const element = $('#score-pop'); element.textContent = text; element.classList.toggle('miss', miss); element.classList.add('visible'); popTimer = setTimeout(() => element.classList.remove('visible'), 680); }
function updatePartner() { document.documentElement.style.setProperty('--team', teamColour); $('#station-partner').textContent = partner; document.querySelectorAll('.partner-name').forEach((el) => { el.textContent = partner; }); $('#partner-name').value = partner; document.querySelectorAll('.swatch').forEach((el) => { const active = el.dataset.color === teamColour; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); }); color(teamColour); }
function updateLeg(done = false) { const leg = Math.min(2, Math.floor(elapsed / 8)); const changed = leg !== currentLeg; currentLeg = leg; $('#station-label').textContent = state === 'idle' ? 'The morning relay' : `${leg + 1} / 3 · ${stations[leg]}`; document.querySelectorAll('.relay-stations li').forEach((el, index) => { el.classList.toggle('current', !done && index === leg); el.classList.toggle('complete', done || index < leg); el.querySelector('.leg-status').textContent = done || index < leg ? 'Done' : index === leg ? state === 'idle' ? 'Ready' : 'Running' : 'Ahead'; }); if (changed && state === 'running') { setMessage(stations[leg], `${partner} is cheering you on.`); announce(`${stations[leg]}. ${score} ideas collected.`); } }
function clearEntities() { entities.forEach((e) => e.el.remove()); entities = []; $('#jump-cue').classList.remove('visible'); $('#hare-wrap').style.transform = ''; }
function active() { return state === 'running'; }
function setButtons() { const playing = active(); const paused = state === 'paused'; $('#jump').disabled = !playing || stepMode; $('#pause').disabled = !playing && !paused; $('#pause').textContent = paused ? 'Resume' : 'Pause'; $('#start').textContent = state === 'idle' ? 'Start the relay ↗' : state === 'finished' ? 'Start again ↗' : 'Restart ↻'; $('#step-jump').disabled = !playing || !stepMode; $('#step-run').disabled = !playing || !stepMode; $('#step-mode').disabled = playing || paused; }

function makeEntity(kind, x) { const el = document.createElement('div'); el.className = `entity ${kind}`; el.innerHTML = kind === 'spark' ? sparkle : hurdle; entitiesLayer.append(el); const entity = { el, kind, x, judged: false }; entities.push(entity); el.style.transform = `translateX(${x}px)`; return entity; }
function characterX() { const hare = $('#hare-wrap'); return hare.offsetLeft + hare.offsetWidth * 0.64; }
function spawn() { const pattern = ['spark', 'hurdle', 'spark', 'spark', 'hurdle', 'spark', 'hurdle', 'spark']; const entity = makeEntity(pattern[spawnIndex % pattern.length], arena.clientWidth + 90); spawnIndex++; lastSpawn = elapsed; return entity; }
function resolve(entity, jumping) { if (entity.judged) return; entity.judged = true; if (entity.kind === 'spark') { if (jumping) { score += 1; entity.el.style.visibility = 'hidden'; pop('+1 idea'); } else { pop('Next one!', true); } } else if (jumping) { score += 1; pop('Clear! +1'); } else { score = Math.max(0, score - 1); recoverUntil = elapsed + 0.65; mode(4); pop('Oops! −1', true); } updateScore(); }
function jump() { if (!active() || stepMode || elapsed < jumpUntil - 0.18) return; jumpStarted = elapsed; jumpUntil = elapsed + 0.8; recoverUntil = 0; mode(2); $('#jump-cue').classList.remove('visible'); }
function finish() { state = 'finished'; cancelAnimationFrame(animationFrame); clearEntities(); arena.classList.remove('running', 'paused'); arena.classList.add('finished'); $('#arena-message').hidden = true; $('#finish-panel').hidden = false; const previous = best; best = Math.max(best, score); persist(); $('#finish-score').textContent = `${score} ${score === 1 ? 'idea' : 'ideas'}`; $('#finish-detail').textContent = score > previous ? `A new personal best. ${partner}, that’s a strong finish.` : `All three stops complete. ${partner}, same time tomorrow?`; $('#step-prompt').textContent = 'All three stops complete. Run it back whenever you’re ready.'; elapsed = TOTAL; updateScore(); updateLeg(true); setButtons(); mode(3); announce(`Relay complete. ${score} ideas. Personal best ${best}.`); }

function frame(now) { if (!active() || stepMode) return; const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.06) : 0; lastFrame = now; elapsed += delta; if (elapsed >= TOTAL) { finish(); return; } const speed = Math.max(210, arena.clientWidth * 0.40); if (elapsed - lastSpawn > 1.55) spawn(); const target = characterX(); let cue = false; for (const entity of entities) { entity.x -= speed * delta; entity.el.style.transform = `translateX(${entity.x}px)`; if (!entity.judged && entity.x < target + speed * .48 && entity.x > target) cue = true; if (!entity.judged && entity.x <= target) resolve(entity, elapsed < jumpUntil); } entities = entities.filter((entity) => { if (entity.x < -100) { entity.el.remove(); return false; } return true; }); $('#jump-cue').classList.toggle('visible', cue && elapsed >= jumpUntil); const jumpProgress = Math.min(1, Math.max(0, (elapsed - jumpStarted) / .8)); const lift = elapsed < jumpUntil ? Math.sin(jumpProgress * Math.PI) * Math.min(112, arena.clientHeight * .19) : 0; $('#hare-wrap').style.transform = lift ? `translateY(${-lift}px)` : ''; if (elapsed >= jumpUntil && elapsed >= recoverUntil && mascotMode !== 1) mode(1); updateScore(); updateLeg(); animationFrame = requestAnimationFrame(frame); }

function showStepEncounter() { clearEntities(); const kind = stepEncounters[stepIndex]; if (!kind) { finish(); return; } $('#step-prompt').textContent = kind === 'spark' ? 'An idea spark is above the track. Will you jump for it?' : kind === 'hurdle' ? 'A hurdle is on the track. Will you jump or keep running?' : 'A clear stretch of track. Keep your rhythm, or take a leap?'; if (kind !== 'clear') makeEntity(kind, Math.max(characterX() + 85, arena.clientWidth * 0.66)); setMessage(stations[currentLeg], `Step ${stepIndex + 1} of ${stepEncounters.length}`); }
function step(jumping) { if (!active() || !stepMode) return; const kind = stepEncounters[stepIndex]; if (kind === 'clear') { if (!jumping) { score++; pop('Good rhythm +1'); } else pop('A little extra air'); } else resolve(entities[0], jumping); mode(reducedMotion.matches ? 0 : jumping ? 2 : 1); stepIndex++; elapsed = stepIndex * 2; updateScore(); updateLeg(); if (stepIndex >= stepEncounters.length) finish(); else showStepEncounter(); }
function start() { cancelAnimationFrame(animationFrame); clearTimeout(previewTimer); clearEntities(); state = 'running'; score = 0; elapsed = 0; jumpUntil = 0; recoverUntil = 0; lastFrame = 0; lastSpawn = -0.3; spawnIndex = 0; stepIndex = 0; currentLeg = 0; pausedForVisibility = false; stepMode = $('#step-mode').checked; arena.classList.remove('finished', 'paused'); arena.classList.add('running'); $('#finish-panel').hidden = true; $('#arena-message').hidden = false; $('#step-controls').hidden = !stepMode; updateScore(); updateLeg(); setButtons(); mode(stepMode && reducedMotion.matches ? 0 : 1); setMessage('Find your rhythm.', 'Jump for the sparks. Clear the hurdles.'); announce(stepMode ? 'Relay started in step mode. Choose Jump this one or Keep running for each encounter.' : 'Relay started. Press Space or tap Jump to collect sparks and clear hurdles.'); if (stepMode) showStepEncounter(); else { arena.focus({ preventScroll: true }); animationFrame = requestAnimationFrame(frame); } }
function pause(forVisibility = false) { if (state === 'running') { state = 'paused'; pausedForVisibility = forVisibility; cancelAnimationFrame(animationFrame); arena.classList.remove('running'); arena.classList.add('paused'); setMessage(forVisibility ? 'We saved your place.' : 'Catch your breath.', 'Resume when you’re ready.'); mode(0); announce('Relay paused.'); } else if (state === 'paused') { state = 'running'; pausedForVisibility = false; lastFrame = 0; arena.classList.remove('paused'); arena.classList.add('running'); setMessage(stations[currentLeg], 'Find the next spark.'); mode(stepMode && reducedMotion.matches ? 0 : 1); if (!stepMode) animationFrame = requestAnimationFrame(frame); announce('Relay resumed.'); } setButtons(); }

$('#start').addEventListener('click', start);
$('#replay').addEventListener('click', start);
$('#jump').addEventListener('click', jump);
$('#pause').addEventListener('click', () => pause());
$('#reset-best').addEventListener('click', () => { best = 0; persist(); updateScore(); announce('Personal best reset.'); });
$('#step-jump').addEventListener('click', () => step(true));
$('#step-run').addEventListener('click', () => step(false));
arena.addEventListener('keydown', (event) => { if ((event.code === 'Space' || event.code === 'ArrowUp') && !event.repeat && active() && !stepMode) { event.preventDefault(); jump(); } else if (event.code === 'KeyP' && (active() || state === 'paused')) { event.preventDefault(); pause(); } });
arena.addEventListener('pointerdown', (event) => { if (event.target.closest('button')) return; if (active() && !stepMode) { arena.focus({ preventScroll: true }); jump(); } });
arena.addEventListener('pointermove', (event) => { const rect = arena.getBoundingClientRect(); window.hareMascot?.setLook?.((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1); });
arena.addEventListener('pointerleave', () => window.hareMascot?.setLook?.(0, 0));
document.addEventListener('visibilitychange', () => { if (document.hidden && active()) pause(true); });
$('#step-mode').checked = stepMode;
$('#step-controls').hidden = !stepMode;
$('#step-mode').addEventListener('change', () => { stepMode = $('#step-mode').checked; $('#step-controls').hidden = !stepMode; $('#game-instructions').textContent = stepMode ? 'Choose your move for each encounter. No scrolling or timer pressure.' : 'Jump for the sparks. Clear the hurdles. Tap Jump or press Space while the game is focused.'; });
reducedMotion.addEventListener('change', (event) => { if (event.matches && active()) pause(); if (state === 'idle' || state === 'finished') { stepMode = event.matches; $('#step-mode').checked = stepMode; $('#step-controls').hidden = !stepMode; } });
$('#partner-form').addEventListener('submit', (event) => { event.preventDefault(); partner = $('#partner-name').value.trim().slice(0, 32) || 'Your brand'; updatePartner(); persist(); announce(`${partner} is on the start line.`); $('#preview-team').textContent = 'Team preview updated ✓'; setTimeout(() => { $('#preview-team').textContent = 'Preview your team ↗'; }, 1800); });
document.querySelectorAll('.swatch').forEach((button) => button.addEventListener('click', () => { teamColour = button.dataset.color; updatePartner(); persist(); $('#colour-status').textContent = window.hareMascot?.ready ? 'The hare is wearing your team colour.' : 'Team colour saved. The animated singlet updates when the character is ready.'; }));
document.querySelectorAll('[data-mascot-mode]').forEach((button) => button.addEventListener('click', () => { if (active()) pause(); clearTimeout(previewTimer); const value = Number(button.dataset.mascotMode); mode(value); document.querySelectorAll('[data-mascot-mode]').forEach((el) => el.setAttribute('aria-pressed', String(el === button))); $('#lab-status').textContent = window.hareMascot?.ready ? `“${button.childNodes[0].textContent.trim()}” is playing on the hare above.` : 'The character artwork is visible above. Animated moods become available when the character is ready.'; if (value === 2 || value === 3) previewTimer = setTimeout(() => mode(0), value === 2 ? 900 : 2400); }));
window.addEventListener('hare:ready', () => { color(teamColour); mode(mascotMode); $('#colour-status').textContent = 'Choose a colour to try on the singlet.'; });
updatePartner(); updateScore(); updateLeg(); setButtons();
