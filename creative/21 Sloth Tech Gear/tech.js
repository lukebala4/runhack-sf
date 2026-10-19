'use strict';

(() => {
  const grid = document.querySelector('#study-grid');
  const status = document.querySelector('#gallery-status');
  const retry = document.querySelector('#retry-load');
  const dialog = document.querySelector('#drawing-dialog');
  const dialogImage = document.querySelector('#dialog-image');
  const dialogImageError = document.querySelector('#dialog-image-error');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogTrait = document.querySelector('#dialog-trait');
  const dialogCount = document.querySelector('#dialog-count');
  const download = document.querySelector('#download-drawing');
  let directions = [];
  let currentIndex = 0;
  let opener = null;

  const number = index => String(index + 1).padStart(2, '0');
  const imageAlt = study => `Little momentum sloth with ${study.name.toLowerCase()}: ${study.trait}`;

  function makeStudy(study, index) {
    const figure = document.createElement('figure');
    figure.className = 'study';
    figure.id = `study-${study.slug}`;

    const button = document.createElement('button');
    button.className = 'study-button';
    button.type = 'button';
    button.setAttribute('aria-label', `Open ${number(index)}. ${study.name}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', () => openStudy(index, button));

    const artwork = document.createElement('span');
    artwork.className = 'study-artwork';
    const image = document.createElement('img');
    image.className = 'study-image';
    image.alt = imageAlt(study);
    image.width = 1024;
    image.height = 1024;
    image.decoding = 'async';
    image.loading = 'eager';
    const imageError = document.createElement('span');
    imageError.className = 'image-error';
    imageError.textContent = 'Drawing unavailable. Open to try again.';
    imageError.hidden = true;
    image.addEventListener('error', () => {
      image.hidden = true;
      imageError.hidden = false;
    });
    image.addEventListener('load', () => {
      image.hidden = false;
      imageError.hidden = true;
    });
    image.src = study.src;
    artwork.append(image, imageError);
    button.append(artwork);

    const caption = document.createElement('figcaption');
    const referenceNumber = document.createElement('span');
    referenceNumber.className = 'study-number';
    referenceNumber.textContent = number(index);
    const text = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = study.name;
    const trait = document.createElement('p');
    trait.className = 'study-trait';
    trait.textContent = study.trait;
    text.append(title, trait);
    caption.append(referenceNumber, text);
    figure.append(button, caption);
    return figure;
  }

  function setDialogImage(src) {
    dialogImageError.hidden = true;
    dialogImage.hidden = false;
    dialogImage.src = src;
  }

  function showStudy(index) {
    currentIndex = (index + directions.length) % directions.length;
    const study = directions[currentIndex];
    dialogTitle.textContent = study.name;
    dialogTrait.textContent = study.trait;
    dialogCount.textContent = `${number(currentIndex)} / ${directions.length}`;
    dialogImage.alt = imageAlt(study);
    setDialogImage(study.src);
    download.href = study.src;
    download.download = `running-hackathon-${study.slug}.png`;
  }

  function openStudy(index, button) {
    opener = button;
    showStudy(index);
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }

  function closeStudy() {
    if (dialog.open) dialog.close();
  }

  document.querySelector('#close-dialog').addEventListener('click', closeStudy);
  document.querySelector('#previous-drawing').addEventListener('click', () => showStudy(currentIndex - 1));
  document.querySelector('#next-drawing').addEventListener('click', () => showStudy(currentIndex + 1));
  document.querySelector('#retry-image').addEventListener('click', () => {
    setDialogImage(`${directions[currentIndex].src}?retry=${Date.now()}`);
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showStudy(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeStudy();
  });
  dialogImage.addEventListener('error', () => {
    dialogImage.hidden = true;
    dialogImageError.hidden = false;
  });
  dialogImage.addEventListener('load', () => {
    dialogImage.hidden = false;
    dialogImageError.hidden = true;
  });

  function scrollToFragment() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); }
    catch { return; }
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }

  async function loadDirections() {
    retry.hidden = true;
    retry.disabled = true;
    status.hidden = false;
    status.textContent = 'Loading the drawings…';
    try {
      const response = await fetch('directions.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Directions request returned ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length !== 10) throw new Error('Expected ten sloth gear directions');
      const ordered = [...data].sort((a, b) => a.index - b.index);
      const valid = ordered.every((study, index) => (
        study.index === index &&
        typeof study.slug === 'string' && /^[a-z0-9-]+$/.test(study.slug) &&
        typeof study.name === 'string' && study.name.trim() &&
        study.animal === 'Sloth' &&
        typeof study.trait === 'string' && study.trait.trim() &&
        typeof study.src === 'string' && study.src === `assets/${study.slug}.png`
      ));
      if (!valid || new Set(ordered.map(study => study.slug)).size !== 10) throw new Error('Sloth direction data is incomplete');
      directions = ordered;
      grid.replaceChildren(...directions.map((study, index) => makeStudy(study, index)));
      status.hidden = true;
      if (document.readyState === 'complete') requestAnimationFrame(scrollToFragment);
      else window.addEventListener('load', () => requestAnimationFrame(scrollToFragment), { once: true });
    } catch (error) {
      console.error('Sloth tech gear:', error);
      status.textContent = 'The drawings couldn’t load. Try again to reopen the comparison.';
      retry.hidden = false;
    } finally {
      retry.disabled = false;
    }
  }

  window.addEventListener('hashchange', scrollToFragment);
  retry.addEventListener('click', loadDirections);
  loadDirections();
})();
