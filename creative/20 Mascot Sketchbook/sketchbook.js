'use strict';

(() => {
  const grid = document.querySelector('#study-grid');
  const newGrid = document.querySelector('#new-study-grid');
  const newSection = document.querySelector('#new-directions');
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
  const imageAlt = study => `${study.animal} mascot study: ${study.trait}`;

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
    image.src = study.src;
    image.alt = imageAlt(study);
    image.width = 1024;
    image.height = 1024;
    image.decoding = 'async';
    // Every study is comparison content, so none are hidden behind lazy loading.
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

  function showStudy(index) {
    currentIndex = (index + directions.length) % directions.length;
    const study = directions[currentIndex];
    dialogTitle.textContent = study.name;
    dialogTrait.textContent = study.trait;
    dialogCount.textContent = `${number(currentIndex)} / ${directions.length}`;
    dialogImageError.hidden = true;
    dialogImage.hidden = false;
    dialogImage.alt = imageAlt(study);
    dialogImage.src = study.src;
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
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showStudy(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
    // Escape and focus containment are provided by the native modal dialog.
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

  async function loadDirections() {
    retry.hidden = true;
    status.hidden = false;
    status.textContent = 'Loading the drawings…';
    try {
      const response = await fetch('directions.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Directions request returned ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length < 10) throw new Error('Expected at least ten mascot directions');
      const ordered = [...data].sort((a, b) => a.index - b.index);
      const valid = ordered.every((study, index) => (
        study.index === index &&
        typeof study.slug === 'string' && /^[a-z0-9-]+$/.test(study.slug) &&
        typeof study.name === 'string' && study.name.trim() &&
        typeof study.animal === 'string' && study.animal.trim() &&
        typeof study.trait === 'string' && study.trait.trim() &&
        typeof study.src === 'string' && study.src === `assets/${study.slug}.png`
      ));
      if (!valid || new Set(ordered.map(study => study.slug)).size !== ordered.length) throw new Error('Mascot direction data is incomplete');
      directions = ordered;
      grid.replaceChildren(...directions.slice(0, 10).map(study => makeStudy(study, study.index)));
      newGrid.replaceChildren(...directions.slice(10).map(study => makeStudy(study, study.index)));
      newSection.hidden = directions.length === 10;
      status.hidden = true;
      // The cards arrive after the browser's initial fragment jump.
      const fragmentTarget = document.getElementById(location.hash.slice(1));
      fragmentTarget?.scrollIntoView({ block: 'start' });
    } catch (error) {
      console.error('Mascot sketchbook:', error);
      status.textContent = 'The drawings couldn’t load. Try again to reopen the sketchbook.';
      retry.hidden = false;
    }
  }

  retry.addEventListener('click', loadDirections);
  loadDirections();
})();
