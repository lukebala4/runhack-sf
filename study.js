(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const film = document.getElementById('london-film');
  const filmCard = document.querySelector('.hero-film');
  const cover = document.querySelector('.film-cover');
  const message = document.getElementById('video-message');
  const messageText = document.getElementById('video-message-text');

  if (film) {
    document.querySelectorAll('[data-play-inline]').forEach(control => {
      control.hidden = false;
      control.addEventListener('click', () => {
        cover.hidden = true;
        filmCard.classList.add('has-started');
        message.hidden = true;
        film.focus({preventScroll:true});
        film.play().catch(() => {
          messageText.textContent = film.error
            ? 'The film couldn’t load. Try opening it directly.'
            : 'Press play in the video controls to start the film.';
          message.hidden = false;
        });
      });
    });
    film.addEventListener('play', () => {
      cover.hidden = true;
      filmCard.classList.add('has-started');
      message.hidden = true;
    });
    film.addEventListener('error', () => {
      cover.hidden = true;
      messageText.textContent = 'The film couldn’t load. Try opening it directly.';
      message.hidden = false;
    });
  }

  document.querySelectorAll('.story-mascot').forEach(mascot => {
    mascot.addEventListener('click', () => {
      if (reducedMotion.matches) return;
      mascot.classList.remove('is-bouncing', 'is-in-view');
      void mascot.offsetWidth;
      mascot.classList.add('is-bouncing');
    });
    mascot.addEventListener('animationend', event => {
      if (event.animationName === 'mascot-bounce') mascot.classList.remove('is-bouncing');
      if (event.animationName === 'mascot-arrive') mascot.classList.remove('is-in-view');
    });
  });

  const gallery = document.querySelector('.photo-viewport');
  if (gallery) {
    const cards = [...gallery.querySelectorAll('[data-photo]')];
    const previous = document.querySelector('[data-gallery-prev]');
    const next = document.querySelector('[data-gallery-next]');
    const viewer = document.getElementById('photo-viewer');
    const expanded = document.getElementById('expanded-photo');
    const viewerPrevious = viewer.querySelector('[data-viewer-prev]');
    const viewerNext = viewer.querySelector('[data-viewer-next]');
    let activePhoto = 0;
    let origin = null;
    let drag = null;
    let suppressClickUntil = 0;
    let scrollFrame = 0;

    document.querySelector('.catalogue-arrows').hidden = false;
    function updateGalleryControls() {
      scrollFrame = 0;
      previous.disabled = gallery.scrollLeft <= 2;
      next.disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
    }
    function moveGallery(direction) {
      gallery.scrollBy({left: direction * gallery.clientWidth * .78, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    }
    previous.addEventListener('click', () => moveGallery(-1));
    next.addEventListener('click', () => moveGallery(1));
    gallery.addEventListener('scroll', () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateGalleryControls);
    }, {passive:true});
    addEventListener('resize', updateGalleryControls);
    if ('ResizeObserver' in window) new ResizeObserver(updateGalleryControls).observe(gallery);
    gallery.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        moveGallery(event.key === 'ArrowRight' ? 1 : -1);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        gallery.scrollTo({left:event.key === 'Home' ? 0 : gallery.scrollWidth,behavior:reducedMotion.matches ? 'instant' : 'smooth'});
      }
    });
    gallery.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      drag = {id:event.pointerId,startX:event.clientX,startScroll:gallery.scrollLeft,lastX:event.clientX,lastTime:performance.now(),velocity:0,moved:false};
    });
    gallery.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      if (!(event.buttons & 1)) {finishDrag(event);return;}
      const distance = event.clientX - drag.startX;
      if (!drag.moved && Math.abs(distance) < 7) return;
      if (!drag.moved) {
        drag.moved = true;
        gallery.setPointerCapture(event.pointerId);
        gallery.classList.add('is-dragging');
      }
      event.preventDefault();
      const now = performance.now();
      drag.velocity = Math.max(-3, Math.min(3, (event.clientX-drag.lastX)/Math.max(1,now-drag.lastTime)));
      gallery.scrollLeft = drag.startScroll - distance;
      gallery.style.setProperty('--drag-lean', `${reducedMotion.matches ? 0 : Math.max(-2,Math.min(2,drag.velocity))}deg`);
      drag.lastX = event.clientX;
      drag.lastTime = now;
    });
    function finishDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      const completed = drag;
      drag = null;
      gallery.classList.remove('is-dragging');
      if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
      if (completed.moved) {
        suppressClickUntil = performance.now()+400;
        if (event.type === 'pointerup' && !reducedMotion.matches && performance.now()-completed.lastTime < 80) {
          gallery.scrollBy({left:-completed.velocity*110,behavior:'smooth'});
        }
      }
    }
    gallery.addEventListener('pointerup', finishDrag);
    gallery.addEventListener('pointercancel', finishDrag);
    gallery.addEventListener('lostpointercapture', finishDrag);
    gallery.addEventListener('dragstart', event => event.preventDefault());
    gallery.addEventListener('click', event => {
      if (event.detail > 0 && performance.now() < suppressClickUntil) {event.preventDefault();event.stopPropagation();}
    }, true);

    cards.forEach((card,index) => {
      card.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse' || reducedMotion.matches || drag?.moved) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--tilt-x', `${((event.clientY-rect.top)/rect.height-.5)*-5}deg`);
        card.style.setProperty('--tilt-y', `${((event.clientX-rect.left)/rect.width-.5)*5}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');
      });
      card.addEventListener('click', event => {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof viewer.showModal !== 'function') return;
        event.preventDefault();
        origin = card;
        showPhoto(index);
        viewer.showModal();
        document.body.classList.add('has-modal');
      });
    });
    function showPhoto(index) {
      activePhoto = Math.max(0,Math.min(cards.length-1,index));
      const source = cards[activePhoto].querySelector('img');
      expanded.alt = source.alt;
      expanded.srcset = source.srcset;
      expanded.sizes = '95vw';
      expanded.src = source.src;
      document.getElementById('photo-count').textContent = `${activePhoto+1} / ${cards.length}`;
      document.getElementById('photo-caption').textContent = source.alt;
      viewerPrevious.disabled = activePhoto === 0;
      viewerNext.disabled = activePhoto === cards.length-1;
    }
    viewerPrevious.addEventListener('click', () => showPhoto(activePhoto-1));
    viewerNext.addEventListener('click', () => showPhoto(activePhoto+1));
    viewer.querySelector('.photo-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();showPhoto(activePhoto+(event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('has-modal');
      origin?.focus({preventScroll:true});
    });
    updateGalleryControls();
  }

  const hero = document.querySelector('.hero-media-shell');
  let pendingFrame = false;
  function updateMedia() {
    pendingFrame = false;
    if (!hero) return;
    const progress = Math.max(0,Math.min(1,(innerHeight-hero.getBoundingClientRect().top)/(innerHeight*.75)));
    hero.style.setProperty('--hero-progress', reducedMotion.matches ? 1 : progress.toFixed(4));
  }
  addEventListener('scroll', () => {
    if (!pendingFrame) {pendingFrame = true;requestAnimationFrame(updateMedia);}
  }, {passive:true});
  addEventListener('resize', updateMedia);
  reducedMotion.addEventListener('change', updateMedia);
  updateMedia();
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const mascotObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in-view');
        mascotObserver.unobserve(entry.target);
      });
    }, {threshold: .3});
    document.querySelectorAll('.story-mascot').forEach(mascot => mascotObserver.observe(mascot));
  }
})();
