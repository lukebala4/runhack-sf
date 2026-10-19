const stage = document.querySelector('#character-stage');
const image = document.querySelector('#character');
const error = document.querySelector('#image-error');
const status = document.querySelector('#scene-status');
const buttons = [...document.querySelectorAll('button[data-scene]')];

function sceneFromLocation() {
  return new URL(window.location.href).searchParams.get('scene') === 'meadow' ? 'meadow' : 'paper';
}

function renderScene(scene, announce = false) {
  stage.dataset.scene = scene;
  const label = scene === 'meadow' ? 'Cheetah artwork on the meadow' : 'Cheetah artwork on paper';
  stage.setAttribute('aria-label', label);
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scene === scene)));
  if (announce) status.textContent = label + '.';
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const scene = button.dataset.scene;
    if (scene === stage.dataset.scene) return;
    const url = new URL(window.location.href);
    url.searchParams.set('scene', scene);
    window.history.pushState({ scene }, '', url);
    renderScene(scene, true);
  });
});

window.addEventListener('popstate', () => renderScene(sceneFromLocation(), true));

function showImageError() {
  stage.classList.add('has-error');
  error.hidden = false;
}

function showImage() {
  stage.classList.remove('has-error');
  error.hidden = true;
}

image.addEventListener('error', showImageError);
image.addEventListener('load', showImage);
if (image.complete) {
  if (image.naturalWidth > 0) showImage();
  else showImageError();
}

renderScene(sceneFromLocation());
