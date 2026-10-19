let runtimePromise;
function loadRuntime() {
  if (!runtimePromise) runtimePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '../../asset-sets/16b1b20313f8b04d033d305bb85ac6d78423512d7fd60e9076353b4799a96bfb/assets/vendor/rive/rive.js';
    script.onload = () => {
      window.rive.RuntimeLoader.setWasmUrl('../../asset-sets/16b1b20313f8b04d033d305bb85ac6d78423512d7fd60e9076353b4799a96bfb/assets/vendor/rive/rive.wasm');
      window.rive.RuntimeLoader.setWasmFallbackUrl('../../asset-sets/16b1b20313f8b04d033d305bb85ac6d78423512d7fd60e9076353b4799a96bfb/assets/vendor/rive/rive_fallback.wasm');
      resolve(window.rive);
    };
    script.onerror = () => { runtimePromise = undefined; reject(new Error('Rive runtime unavailable')); };
    document.head.append(script);
  });
  return runtimePromise;
}

// Each scene owns its observers and WASM instance, including during concept switches.
export function mountRunners(root = document) {
  const scenes = [...root.querySelectorAll('[data-rive-runner]')].map(element => {
    const canvas = element.querySelector('canvas');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let instance, disposed = false, inView = false, loading = false, paused = false, timeout, generation = 0;
    function sync() {
      if (!instance || element.dataset.state !== 'ready') return;
      if (inView && !document.hidden && !paused && !preference.matches) instance.startRendering();
      else instance.stopRendering();
    }
    function clearInstance(state = 'still') {
      generation++;
      clearTimeout(timeout);
      if (instance) { instance.cleanup(); instance = undefined; }
      loading = false;
      element.dataset.state = state;
    }
    async function start() {
      if (disposed || loading || instance || preference.matches || !inView) return;
      loading = true;
      const attempt = ++generation;
      element.dataset.state = 'loading';
      try {
        const rive = await loadRuntime();
        if (attempt !== generation) return;
        if (disposed || !canvas.isConnected || preference.matches) { loading = false; return; }
        instance = new rive.Rive({
          src: element.dataset.src || '../../asset-sets/16b1b20313f8b04d033d305bb85ac6d78423512d7fd60e9076353b4799a96bfb/assets/rive/morning-runner.riv',
          canvas, artboard: 'Morning Runner', stateMachine: 'Morning Run', autoplay: true,
          layout: new rive.Layout({ fit: rive.Fit.Contain, alignment: rive.Alignment.Center }),
          onLoad() {
            if (disposed || !instance) return;
            clearTimeout(timeout);
            instance.resizeDrawingSurfaceToCanvas();
            element.dataset.state = 'ready';
            sync();
          },
          onLoadError() { clearInstance('unavailable'); }
        });
        timeout = setTimeout(() => { if (element.dataset.state !== 'ready') clearInstance('unavailable'); }, 12000);
      } catch { if (attempt === generation) clearInstance('unavailable'); }
    }
    function onPreference() {
      if (preference.matches) clearInstance(); else start();
    }
    const visibility = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) start();
      sync();
    });
    visibility.observe(element);
    const resize = new ResizeObserver(() => instance?.resizeDrawingSurfaceToCanvas());
    resize.observe(element);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', onPreference);
    return {
      setPaused(value) { paused = value; sync(); },
      cleanup() {
        disposed = true; visibility.disconnect(); resize.disconnect();
        document.removeEventListener('visibilitychange', sync);
        preference.removeEventListener('change', onPreference);
        clearInstance();
      }
    };
  });
  return {
    setPaused(value) { scenes.forEach(scene => scene.setPaused(value)); },
    cleanup() { scenes.forEach(scene => scene.cleanup()); }
  };
}
