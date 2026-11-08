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
      control.addEventListener('click', event => {
        cover.hidden = true;
        filmCard.classList.add('has-started');
        message.hidden = true;
        if (event.detail === 0) film.focus({preventScroll:true});
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

  const galleryViewports = [...document.querySelectorAll('.photo-viewport')];
  const viewer = document.getElementById('photo-viewer');
  if (galleryViewports.length && viewer) {
    const expanded = document.getElementById('expanded-photo');
    const viewerCount = document.getElementById('photo-count');
    const previous = document.querySelector('[data-gallery-prev]');
    const next = document.querySelector('[data-gallery-next]');
    const eventButtons = [...document.querySelectorAll('[data-event-tab]')];
    let viewerOwner = null;
    let viewerToken = 0;
    let activeGallery = null;

    function setupGallery(gallery) {
      const label = gallery.dataset.event ? gallery.dataset.event[0].toUpperCase() + gallery.dataset.event.slice(1) : 'Event';
      const controller = {};
      const track = gallery.querySelector('.photo-track');
      const cards = [...gallery.querySelectorAll('[data-photo]')];
      const items = cards.map(card => card.closest('.photo-item'));
      let activePhoto = 0;
      let origin = null;
      let openedCard = null;
      let drag = null;
      let suppressClickUntil = 0;
      let cycleWidth = 0;
      let cycleStart = 0;
      let copiesPerSide = 0;
      let measuredWidth = 0;
      let motion = null;
      let motionFrame = 0;
      let settleTimer = 0;
      const modulo = (value, size) => ((value % size) + size) % size;

      function stopMotion() {
        cancelAnimationFrame(motionFrame);
        motionFrame = 0;
        motion = null;
      }
      function loopPosition(position) {
        if (!cycleWidth) return position;
        // Keep every real link in the central cycle available to keyboard users.
        if (position < cycleStart - .5 * cycleWidth || position >= cycleStart + cycleWidth) {
          return cycleStart + modulo(position - cycleStart, cycleWidth);
        }
        return position;
      }
      function recenter() {
        const position = loopPosition(gallery.scrollLeft);
        if (position !== gallery.scrollLeft) gallery.scrollLeft = position;
      }
      function addCopy() {
        const fragment = document.createDocumentFragment();
        items.forEach((item, index) => {
          const copy = item.cloneNode(true);
          copy.dataset.loopCopy = '';
          copy.setAttribute('aria-hidden', 'true');
          // Decorative copies respond to the pointer without duplicating Tab stops.
          const link = copy.querySelector('[data-photo]');
          const surface = document.createElement('div');
          surface.className = link.className;
          surface.dataset.photo = '';
          surface.dataset.photoIndex = index;
          surface.append(...link.childNodes);
          surface.querySelector('img').alt = '';
          link.replaceWith(surface);
          fragment.append(copy);
        });
        return fragment;
      }
      function measureLoop() {
        if (viewer.open || !gallery.clientWidth) return;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const first = items[0];
        const last = items[items.length - 1];
        const nextCycleWidth = last.getBoundingClientRect().right - first.getBoundingClientRect().left + gap;
        if (!nextCycleWidth || (nextCycleWidth === cycleWidth && measuredWidth === gallery.clientWidth)) return;
        stopMotion();
        const phase = cycleWidth ? modulo(gallery.scrollLeft - cycleStart, cycleWidth) / cycleWidth : 0;
        cycleWidth = nextCycleWidth;
        measuredWidth = gallery.clientWidth;
        const requiredCopies = Math.max(1, Math.ceil(gallery.clientWidth / cycleWidth));
        if (requiredCopies !== copiesPerSide) {
          track.querySelectorAll('[data-loop-copy]').forEach(copy => copy.remove());
          copiesPerSide = requiredCopies;
          for (let i = 0; i < copiesPerSide; i++) {
            track.prepend(addCopy());
            track.append(addCopy());
          }
        }
        cycleStart = copiesPerSide * cycleWidth;
        gallery.scrollLeft = cycleStart + phase * cycleWidth;
      }
      function shiftBy(distance) {
        gallery.scrollLeft = loopPosition(gallery.scrollLeft + distance);
      }
      function animateBy(distance) {
        // Rapid clicks add to the intended distance instead of losing prior input.
        if (motion) distance += motion.distance - motion.travelled;
        stopMotion();
        if (reducedMotion.matches) {shiftBy(distance);return;}
        motion = {distance, travelled:0, start:performance.now()};
        function step(now) {
          if (!motion) return;
          const progress = Math.min(1, (now - motion.start) / 480);
          const travelled = motion.distance * (1 - Math.pow(1 - progress, 3));
          shiftBy(travelled - motion.travelled);
          motion.travelled = travelled;
          if (progress < 1) motionFrame = requestAnimationFrame(step);
          else {motion = null;motionFrame = 0;}
        }
        motionFrame = requestAnimationFrame(step);
      }
      function moveGallery(direction) {animateBy(direction * gallery.clientWidth * .78);}

      cards.forEach((card, index) => {card.dataset.photoIndex = index;});
      gallery.classList.add('is-looping');
      gallery.setAttribute('aria-label', `${label} photo collection. Scroll in either direction to explore ${cards.length} photographs in a continuous loop.`);
      gallery.addEventListener('scroll', () => {
        clearTimeout(settleTimer);
        // Let native touch momentum run. Rebase early only near a physical edge.
        const edge = Math.max(100, gallery.clientWidth * .5);
        if (!motion && !drag && (gallery.scrollLeft < edge || gallery.scrollLeft > gallery.scrollWidth - gallery.clientWidth - edge)) recenter();
        settleTimer = setTimeout(() => {if (!motion && !drag) recenter();}, 160);
      }, {passive:true});
      gallery.addEventListener('scrollend', () => {if (!motion && !drag) recenter();});
      gallery.addEventListener('wheel', stopMotion, {passive:true});
      gallery.addEventListener('touchstart', stopMotion, {passive:true});
      addEventListener('resize', measureLoop);
      if ('ResizeObserver' in window) new ResizeObserver(measureLoop).observe(gallery);
      gallery.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          const direction = event.key === 'ArrowRight' ? 1 : -1;
          const focusedCard = event.target.closest('a[data-photo]');
          if (focusedCard) {
            stopMotion();
            cards[modulo(Number(focusedCard.dataset.photoIndex) + direction, cards.length)].focus();
          } else moveGallery(direction);
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          stopMotion();
          const target = event.key === 'Home' ? items[0] : items[items.length - 1];
          gallery.scrollLeft = cycleStart + target.offsetLeft - items[0].offsetLeft;
        }
      });
      gallery.addEventListener('pointerdown', event => {
        stopMotion();
        if (event.pointerType !== 'mouse' || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        drag = {id:event.pointerId,startX:event.clientX,lastX:event.clientX,lastTime:performance.now(),velocity:0,moved:false};
      });
      gallery.addEventListener('pointermove', event => {
        const card = event.target.closest('[data-photo]');
        if (!drag || event.pointerId !== drag.id) {
          if (!card || event.pointerType !== 'mouse' || reducedMotion.matches) return;
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--tilt-x', `${((event.clientY-rect.top)/rect.height-.5)*-5}deg`);
          card.style.setProperty('--tilt-y', `${((event.clientX-rect.left)/rect.width-.5)*5}deg`);
          return;
        }
        if (!(event.buttons & 1)) {finishDrag(event);return;}
        if (!drag.moved && Math.abs(event.clientX - drag.startX) < 7) return;
        const distance = (drag.moved ? drag.lastX : drag.startX) - event.clientX;
        if (!drag.moved) {
          drag.moved = true;
          gallery.setPointerCapture(event.pointerId);
          gallery.classList.add('is-dragging');
        }
        event.preventDefault();
        const now = performance.now();
        drag.velocity = Math.max(-3, Math.min(3, (event.clientX-drag.lastX)/Math.max(1,now-drag.lastTime)));
        shiftBy(distance);
        gallery.style.setProperty('--drag-lean', `${reducedMotion.matches ? 0 : Math.max(-2,Math.min(2,drag.velocity))}deg`);
        drag.lastX = event.clientX;
        drag.lastTime = now;
      });
      gallery.addEventListener('pointerout', event => {
        const card = event.target.closest('[data-photo]');
        if (card && !card.contains(event.relatedTarget)) {
          card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');
        }
      });
      function finishDrag(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const completed = drag;
        drag = null;
        gallery.classList.remove('is-dragging');
        if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
        if (completed.moved) {
          suppressClickUntil = performance.now()+400;
          if (event.type === 'pointerup' && !reducedMotion.matches && performance.now()-completed.lastTime < 80) animateBy(-completed.velocity*110);
        }
      }
      gallery.addEventListener('pointerup', finishDrag);
      gallery.addEventListener('pointercancel', finishDrag);
      gallery.addEventListener('lostpointercapture', finishDrag);
      gallery.addEventListener('dragstart', event => event.preventDefault());
      gallery.addEventListener('click', event => {
        if (event.detail > 0 && performance.now() < suppressClickUntil) {event.preventDefault();event.stopPropagation();return;}
        const card = event.target.closest('[data-photo]');
        if (!card || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof viewer.showModal !== 'function') return;
        event.preventDefault();
        stopMotion();
        const index = Number(card.dataset.photoIndex);
        origin = cards[index];
        openedCard = card;
        showPhoto(index);
        viewerOwner = controller;
        viewer.showModal();
        document.body.classList.add('has-modal');
      });
      function preload(image) {
        const loader = new Image();
        loader.decoding = 'async';
        loader.sizes = '95vw';
        loader.srcset = image.srcset;
        loader.src = image.src;
        return loader;
      }
      function showPhoto(index) {
        activePhoto = modulo(index, cards.length);
        const source = cards[activePhoto].querySelector('img');
        const token = ++viewerToken;
        viewerCount.textContent = `${activePhoto+1} / ${cards.length}`;
        // Respond at once with the gallery-size image the browser already has, then sharpen.
        expanded.removeAttribute('srcset');
        expanded.alt = source.alt;
        expanded.src = source.currentSrc || source.src;
        const full = preload(source);
        const sharpen = () => {
          if (token !== viewerToken || !full.naturalWidth) return;
          // Phones often already show the right file; re-setting it can flicker.
          if ((full.currentSrc || source.src) === expanded.src) return;
          expanded.sizes = '95vw';
          expanded.srcset = source.srcset;
          expanded.src = full.currentSrc || source.src;
        };
        // decode() can stay pending for detached srcset images in Chrome, so wait for load instead.
        if (full.complete) sharpen();
        else full.addEventListener('load', sharpen, {once:true});
        // Warm the neighbours so the next arrow press shows a sharp photo without waiting.
        [1, -1].forEach(step => preload(cards[modulo(activePhoto + step, cards.length)].querySelector('img')));
      }
      function afterViewerClose() {
        measureLoop();
        if (origin && openedCard?.isConnected) {
          gallery.scrollLeft += origin.getBoundingClientRect().left - openedCard.getBoundingClientRect().left;
        }
        origin?.focus({preventScroll:true});
      }

      Object.assign(controller, {gallery, moveGallery, showPhoto, afterViewerClose, measureLoop, stopMotion, step: direction => showPhoto(activePhoto + direction)});
      measureLoop();
      return controller;
    }

    const galleries = galleryViewports.map(setupGallery);
    function showEvent(event, {focus = false} = {}) {
      const target = galleries.find(item => item.gallery.dataset.event === event) || galleries[0];
      galleries.forEach(item => {
        const isTarget = item === target;
        if (!isTarget) item.stopMotion();
        item.gallery.classList.toggle('is-inactive', !isTarget);
        item.gallery.inert = !isTarget;
      });
      eventButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.eventTab === target.gallery.dataset.event)));
      [previous, next].forEach(button => button?.setAttribute('aria-controls', target.gallery.id));
      activeGallery = target;
      requestAnimationFrame(() => target.measureLoop());
      if (focus) target.gallery.focus({preventScroll:true});
    }
    document.querySelector('.catalogue-arrows').hidden = false;
    previous.addEventListener('click', () => activeGallery?.moveGallery(-1));
    next.addEventListener('click', () => activeGallery?.moveGallery(1));
    eventButtons.forEach(button => button.addEventListener('click', () => showEvent(button.dataset.eventTab)));
    viewer.querySelector('[data-viewer-prev]').addEventListener('click', () => viewerOwner?.step(-1));
    viewer.querySelector('[data-viewer-next]').addEventListener('click', () => viewerOwner?.step(1));
    viewer.querySelector('.photo-close').addEventListener('click', () => viewer.close());
    // Swipe the photo left or right to move through the event's photos on touch screens.
    const viewerFrame = viewer.querySelector('.photo-viewer-frame');
    let swipe = null;
    viewerFrame.addEventListener('touchstart', event => {
      if (event.touches.length !== 1) {swipe = null;return;}
      swipe = {x:event.touches[0].clientX, y:event.touches[0].clientY, time:performance.now()};
    }, {passive:true});
    viewerFrame.addEventListener('touchend', event => {
      if (!swipe || !viewerOwner) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - swipe.x;
      const dy = touch.clientY - swipe.y;
      const quick = performance.now() - swipe.time < 700;
      swipe = null;
      if (quick && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) viewerOwner.step(dx < 0 ? 1 : -1);
    }, {passive:true});
    viewerFrame.addEventListener('touchcancel', () => {swipe = null;}, {passive:true});
    viewer.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();viewerOwner?.step(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('has-modal');
      viewerOwner?.afterViewerClose();
      viewerOwner = null;
    });
    const initial = location.hash.replace('#', '');
    showEvent(galleries.some(item => item.gallery.dataset.event === initial) ? initial : (galleries.find(item => !item.gallery.classList.contains('is-inactive')) || galleries[0]).gallery.dataset.event);
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
