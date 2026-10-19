const STORAGE_KEY = 'running-hackathon-reactive-idea-v1';
const $ = (selector) => document.querySelector(selector);
const nameField = $('#your-name');
const ideaField = $('#your-idea');
const helloFeedback = $('#hello-feedback');
const ideaFeedback = $('#idea-feedback');
const savedPanel = $('#saved-idea');
const savedText = $('#saved-idea-text');
const announcement = $('#interaction-status');
const runButton = $('#run-toggle');
const expressionButtons = [...document.querySelectorAll('[data-expression]')];
const colourButtons = [...document.querySelectorAll('[data-color]')];

let restingMode = 0;
let currentMode = 0;
let modeTimeout;
let typingTimeout;
let saving = false;
let lastSaved = null;
let selectedColour = '#283831';

function api() { return window.reactiveMascot; }
function cleanName(value) { return value.trim().replace(/\s+/g, ' ').slice(0, 32); }
function cleanIdea(value) { return value.trim().slice(0, 180); }
function announce(message) { announcement.textContent = message; }

function updateButtons(mode) {
  expressionButtons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.expression) === mode)));
  runButton.setAttribute('aria-pressed', String(restingMode === 1));
  runButton.innerHTML = restingMode === 1 ? 'Pause <span aria-hidden="true">Ⅱ</span>' : 'Run <span aria-hidden="true">→</span>';
}

function setMode(mode, { duration = 0, rest = false } = {}) {
  window.clearTimeout(modeTimeout);
  window.clearTimeout(typingTimeout);
  if (rest) restingMode = mode;
  currentMode = mode;
  document.body.dataset.mode = String(mode);
  api()?.setMode(mode);
  updateButtons(mode);
  if (duration > 0) {
    modeTimeout = window.setTimeout(() => {
      currentMode = restingMode;
      document.body.dataset.mode = String(restingMode);
      api()?.setMode(restingMode);
      updateButtons(restingMode);
    }, duration);
  }
}

function feedback(element, message, tone = '') {
  element.textContent = message;
  element.dataset.tone = tone;
}

function renderSaved() {
  savedPanel.hidden = !lastSaved;
  savedText.textContent = lastSaved?.idea || '';
}

function parseSaved(raw) {
  if (!raw) return null;
  const value = JSON.parse(raw);
  if (value?.version !== 1 || typeof value.idea !== 'string' || typeof value.name !== 'string' || typeof value.savedAt !== 'string') return null;
  const idea = cleanIdea(value.idea);
  if (idea.length < 8) return null;
  return { version: 1, idea, name: cleanName(value.name), savedAt: value.savedAt };
}

try {
  lastSaved = parseSaved(window.localStorage.getItem(STORAGE_KEY));
  if (lastSaved?.name) nameField.value = lastSaved.name;
  if (lastSaved) feedback(ideaFeedback, 'Your last idea is still here. Saved only on this device.');
} catch {
  feedback(ideaFeedback, 'This browser could not read saved ideas. You can still try the hare.');
}
renderSaved();

function greeting() {
  if (saving) return;
  const name = cleanName(nameField.value);
  setMode(6, { duration: 2100 });
  feedback(helloFeedback, name ? `Hello, ${name}. Good to have you on the start line.` : 'Hello there. Good to have you on the start line.', 'success');
  announce(name ? `The hare says hello to ${name}.` : 'The hare says hello.');
}

$('#say-hello').addEventListener('click', greeting);
window.addEventListener('mascot:tap', () => {
  if (saving || currentMode === 5 || currentMode === 3) return;
  greeting();
});
window.addEventListener('mascot:ready', () => {
  api()?.setColor(selectedColour);
  api()?.setMode(currentMode);
  updateButtons(currentMode);
});

$('#run-toggle').addEventListener('click', () => {
  if (saving) return;
  const running = restingMode !== 1;
  if (running) setMode(1, { rest: true });
  else {
    restingMode = 0;
    setMode(4, { duration: 1500 });
  }
  announce(running ? 'The hare is running. Press Pause to rest.' : 'The hare catches its breath, then rests.');
});

$('#hop').addEventListener('click', () => {
  if (saving) return;
  setMode(2, { duration: 850 });
  announce('The hare hops.');
});

nameField.addEventListener('focus', () => {
  if (!saving) setMode(6);
});
nameField.addEventListener('input', () => {
  nameField.removeAttribute('aria-invalid');
  window.clearTimeout(typingTimeout);
  if (saving) return;
  setMode(6);
  feedback(helloFeedback, nameField.value.trim() ? 'Got it. Say hello when you’re ready.' : 'Type your name. Watch the hare pay attention.');
  typingTimeout = window.setTimeout(() => {
    if (document.activeElement === nameField && nameField.value.trim() && !saving) setMode(5);
  }, 300);
});

$('#hello-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (saving) return;
  const name = cleanName(nameField.value);
  if (!name) {
    nameField.setAttribute('aria-invalid', 'true');
    nameField.focus();
    setMode(7, { duration: 2300 });
    feedback(helloFeedback, 'Add your name first, then say hello.', 'error');
    return;
  }
  nameField.value = name;
  nameField.removeAttribute('aria-invalid');
  greeting();
});

ideaField.addEventListener('focus', () => {
  if (!saving) setMode(5);
});
ideaField.addEventListener('input', () => {
  $('#character-count').textContent = `${ideaField.value.length} / 180`;
  ideaField.removeAttribute('aria-invalid');
  if (!saving) setMode(5);
  feedback(ideaFeedback, 'Keep it here when you’re ready. Saved only on this device.');
});

$('#idea-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (saving) return;
  const idea = cleanIdea(ideaField.value);
  if (idea.length < 8) {
    ideaField.setAttribute('aria-invalid', 'true');
    ideaField.focus();
    setMode(7, { duration: 2500 });
    feedback(ideaFeedback, idea.length ? 'Give your idea a little more detail. At least 8 characters.' : 'Add an idea first, then keep it here.', 'error');
    return;
  }

  saving = true;
  $('#save-idea').disabled = true;
  ideaField.removeAttribute('aria-invalid');
  setMode(5);
  feedback(ideaFeedback, 'Keeping that idea…');
  await new Promise((resolve) => requestAnimationFrame(resolve));

  try {
    const record = { version: 1, name: cleanName(nameField.value), idea, savedAt: new Date().toISOString() };
    const raw = JSON.stringify(record);
    window.localStorage.setItem(STORAGE_KEY, raw);
    if (window.localStorage.getItem(STORAGE_KEY) !== raw) throw new Error('Saved idea readback did not match.');
    lastSaved = record;
    renderSaved();
    ideaField.value = idea;
    $('#character-count').textContent = `${idea.length} / 180`;
    feedback(ideaFeedback, 'Idea saved. It will be here on your next visit from this browser.', 'success');
    setMode(3, { duration: 2800 });
    announce('Your idea is saved on this device. The hare celebrates.');
  } catch {
    setMode(7, { duration: 3000 });
    feedback(ideaFeedback, 'This browser could not save your idea. Copy it somewhere safe, then try again.', 'error');
    announce('Your idea was not saved.');
  } finally {
    saving = false;
    $('#save-idea').disabled = false;
  }
});

$('#clear-idea').addEventListener('click', () => {
  if (saving) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    if (window.localStorage.getItem(STORAGE_KEY) !== null) throw new Error('Saved idea was not cleared.');
    lastSaved = null;
    renderSaved();
    feedback(ideaFeedback, 'Saved idea cleared from this device. Your draft stays in the field.');
    setMode(0, { rest: true });
    $('#save-idea').focus();
    announce('Saved idea cleared from this device.');
  } catch {
    setMode(7, { duration: 2200 });
    feedback(ideaFeedback, 'This browser could not clear the saved idea. Try again.', 'error');
  }
});

expressionButtons.forEach((button) => button.addEventListener('click', () => {
  if (saving) return;
  setMode(Number(button.dataset.expression), { rest: true });
  announce(`The hare’s expression is ${button.textContent.toLowerCase()}.`);
}));

colourButtons.forEach((button) => button.addEventListener('click', () => {
  selectedColour = button.dataset.color;
  api()?.setColor(selectedColour);
  colourButtons.forEach((other) => {
    const selected = other === button;
    other.classList.toggle('selected', selected);
    other.setAttribute('aria-pressed', String(selected));
  });
  announce(`${button.textContent.trim()} singlet selected.`);
}));

// The adapter may already have completed loading before this module's listener.
if (api()?.ready) {
  api().setColor(selectedColour);
  api().setMode(currentMode);
}
updateButtons(currentMode);
