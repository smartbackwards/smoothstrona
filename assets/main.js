/* ============================================================
   main.js — nawigacja (taby), reveal, lazy-load, liczniki
   ============================================================ */
(function () {
  const viewHome  = document.getElementById('view-home');
  const viewSnake = document.getElementById('view-snake');
  const navLinks  = document.querySelectorAll('.nav-links');
  const burger    = document.querySelector('.nav-burger');
  const links     = document.querySelector('.nav-links');

  // ---- przełączanie widoków (taby) ----
  function showView(name) {
    const home = name !== 'snake';
    viewHome.classList.toggle('view--active', home);
    viewSnake.classList.toggle('view--active', !home);
    document.querySelectorAll('.nav-snake').forEach(a =>
      a.style.background = home ? '' : 'var(--grad)');
    if (home && window.__snakePause) window.__snakePause();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    history.replaceState(null, '', home ? '#' : '#snake');
  }

  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', e => {
      const view = el.dataset.view;
      // pozwól anchorom na home działać normalnie (scroll), poza brandem/snake
      if (view === 'snake') {
        e.preventDefault();
        showView('snake');
      } else if (view === 'home') {
        if (!viewHome.classList.contains('view--active')) {
          e.preventDefault();
          showView('home');
          const href = el.getAttribute('href');
          if (href && href.startsWith('#') && href.length > 1) {
            setTimeout(() => document.querySelector(href)?.scrollIntoView(), 60);
          }
        }
      }
      links?.classList.remove('open');
    });
  });

  if (location.hash === '#snake') showView('snake');

  // ---- burger menu (mobile) ----
  burger?.addEventListener('click', () => links.classList.toggle('open'));

  // ---- reveal on scroll ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---- lazy-load ciężkich gifów ----
  const lazyIo = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const img = en.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
        lazyIo.unobserve(img);
      }
    });
  }, { rootMargin: '300px' });
  document.querySelectorAll('img.lazy').forEach(img => lazyIo.observe(img));

  // ---- liczniki w sekcji wyników ----
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const cIo = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      animateCount(en.target);
      cIo.unobserve(en.target);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => cIo.observe(c));

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1100;
    const t0 = performance.now();
    function frame(t) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(frame);
  }

  // ---- placeholder linki (humor) ----
  document.querySelectorAll('[data-todo]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      a.classList.add('shake');
      const s = a.querySelector('.link-s');
      const orig = s.textContent;
      s.textContent = 'TODO: podmień ten link 😉';
      setTimeout(() => { s.textContent = orig; a.classList.remove('shake'); }, 1800);
    });
  });

  // ---- rok w stopce ----
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- Konami easter egg ----
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  window.addEventListener('keydown', e => {
    pos = (e.key.toLowerCase() === seq[pos].toLowerCase() || e.key === seq[pos]) ? pos + 1 : 0;
    if (pos === seq.length) { pos = 0; showView('snake'); }
  });
})();
