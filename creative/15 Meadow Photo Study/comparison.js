// Images stay uncropped and open directly. If an asset cannot load, expose its
// full-image link in readable text rather than silently showing an empty card.
document.querySelectorAll('[data-study-image]').forEach((image) => {
  const card = image.closest('.photo-card');
  const error = card?.querySelector('.image-error');
  const showError = () => {
    if (error) error.hidden = false;
  };
  image.addEventListener('error', showError);
  image.addEventListener('load', () => {
    if (error) error.hidden = true;
  });
  if (image.complete && image.naturalWidth === 0) showError();
});
