/* ── Visual Effects Module ───────────────────────────────── */
const FX = (() => {

  /* Custom cursor ----------------------------------------- */
  function initCursor() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

    (function trackRing() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      dot.style.transform  = `translate(${tx - 4}px,${ty - 4}px)`;
      ring.style.transform = `translate(${cx - 14}px,${cy - 14}px)`;
      requestAnimationFrame(trackRing);
    })();

    // Scale ring on hoverable elements
    document.querySelectorAll('a, button, .glass-card, .cp-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  /* Scroll progress bar ----------------------------------- */
  function initScrollBar() {
    const bar = document.getElementById('scroll-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - innerHeight) * 100;
      bar.style.width = `${pct}%`;
    }, { passive: true });
  }

  /* Scroll reveal ----------------------------------------- */
  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  /* 3D Tilt on cards -------------------------------------- */
  function initTilt() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const MAX = 12;
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = (e.clientX - r.left) / r.width  - 0.5;
        const y  = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x*MAX*2}deg) rotateX(${-y*MAX}deg) translateZ(10px)`;
        card.style.transition = 'transform 0.05s';
        const shine = card.querySelector('.tilt-shine');
        if (shine) {
          shine.style.background = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform  = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)';
        card.style.transition = 'transform 0.5s ease';
        const shine = card.querySelector('.tilt-shine');
        if (shine) shine.style.background = 'transparent';
      });
    });
  }

  /* Typewriter effect ------------------------------------- */
  function typewriter(el, words, speed = 100) {
    if (!el) return;
    let wi = 0, ci = 0, deleting = false, pause = 0;

    function tick() {
      const word = words[wi];
      if (deleting) {
        el.textContent = word.substring(0, ci--);
        if (ci < 0) { deleting = false; wi = (wi+1) % words.length; pause = 600; }
      } else {
        el.textContent = word.substring(0, ci++);
        if (ci > word.length) { deleting = true; pause = 1800; }
      }
      setTimeout(tick, pause || (deleting ? speed*0.5 : speed));
      pause = 0;
    }
    tick();
  }

  /* Active nav highlight ---------------------------------- */
  function initNavHighlight() {
    const links = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => io.observe(s));
  }

  function init() {
    initCursor();
    initScrollBar();
    initReveal();
    initNavHighlight();
    typewriter(
      document.getElementById('type-role'),
      ['Backend Developer', 'Full-Stack Engineer', 'Competitive Coder', 'Problem Solver'],
      80
    );
    // Tilt init after render
    setTimeout(initTilt, 500);
  }

  return { init, initTilt };
})();
