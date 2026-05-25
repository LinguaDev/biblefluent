/* ═══════════════════════════════════════════════════════════════
   BIBLEFLUENT — GRIEGO BÍBLICO · main-es.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ───────────────────────────────────────────
   1. AÑO EN EL FOOTER
─────────────────────────────────────────── */
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ───────────────────────────────────────────
   2. HEADER — SCROLL FROSTED GLASS
─────────────────────────────────────────── */
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
})();


/* ───────────────────────────────────────────
   3. MENÚ MÓVIL — HAMBURGUESA
─────────────────────────────────────────── */
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onEsc);
  }

  function openMenu() {
    nav.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onEsc);
  }

  function onEsc(e) {
    if (e.key === 'Escape') closeMenu();
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Cerrar al hacer clic en un enlace del menú
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });
})();


/* ───────────────────────────────────────────
   4. REVEAL ON SCROLL — IntersectionObserver
─────────────────────────────────────────── */
(function initReveal() {
  // Respetar prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ───────────────────────────────────────────
   5. STAGGERED REVEAL — tarjetas de lección
─────────────────────────────────────────── */
(function initLessonStagger() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.lesson-card');

  // Preparar estado inicial
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateX(-16px)';
    card.style.transition =
      `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${i * 35}ms,
       transform 500ms cubic-bezier(0.16,1,0.3,1) ${i * 35}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  cards.forEach(card => observer.observe(card));
})();


/* ───────────────────────────────────────────
   6. STAGGERED REVEAL — feature cards, steps,
      testimonials, method steps
─────────────────────────────────────────── */
(function initGroupStagger() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const groups = [
    { selector: '.feature-card',      delay: 80,  tx: 0,   ty: 20 },
    { selector: '.method-step',       delay: 100, tx: 0,   ty: 24 },
    { selector: '.testimonial-card',  delay: 90,  tx: 0,   ty: 20 },
  ];

  groups.forEach(({ selector, delay, tx, ty }) => {
    const items = document.querySelectorAll(selector);

    items.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = `translate(${tx}px, ${ty}px)`;
      el.style.transition =
        `opacity 600ms cubic-bezier(0.16,1,0.3,1) ${i * delay}ms,
         transform 600ms cubic-bezier(0.16,1,0.3,1) ${i * delay}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translate(0,0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    items.forEach(el => observer.observe(el));
  });
})();


/* ───────────────────────────────────────────
   7. CANVAS — PARTÍCULAS DE POLVO DORADO
─────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // No animar en móviles de baja potencia
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, particles, raf;
  const PARTICLE_COUNT = prefersReducedMotion ? 0 : (window.innerWidth < 600 ? 35 : 70);

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Partícula ── */
  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x     = Math.random() * W;
      this.y     = initial ? Math.random() * H : H + 10;
      this.size  = Math.random() * 1.8 + 0.3;
      this.speedY = -(Math.random() * 0.35 + 0.08);  // sube lentamente
      this.speedX = (Math.random() - 0.5) * 0.18;
      this.opacity = Math.random() * 0.55 + 0.05;
      this.twinkle = Math.random() * Math.PI * 2;     // fase inicial
      this.twinkleSpeed = Math.random() * 0.012 + 0.004;

      // Algunos tienen forma de "letra" (cruz simple)
      this.isGlyph = Math.random() < 0.06;
      if (this.isGlyph) {
        const glyphs = ['α','ω','λ','θ','σ','φ','γ','δ','ε','ξ','ψ'];
        this.glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        this.size  = Math.random() * 9 + 6;
        this.opacity = Math.random() * 0.12 + 0.03;
        this.speedY  = -(Math.random() * 0.18 + 0.04);
      }
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.twinkle += this.twinkleSpeed;

      // Desvío horizontal suave (drift)
      this.speedX += (Math.random() - 0.5) * 0.005;
      this.speedX  = Math.max(-0.3, Math.min(0.3, this.speedX));

      if (this.y < -20) this.reset();
    }

    draw() {
      const flicker = 0.7 + 0.3 * Math.sin(this.twinkle);
      const alpha   = this.opacity * flicker;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (this.isGlyph) {
        // Letra griega flotante tenue
        ctx.font         = `${this.size}px 'EB Garamond', serif`;
        ctx.fillStyle    = '#c9a84c';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.glyph, this.x, this.y);
      } else {
        // Partícula circular con halo
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        grad.addColorStop(0,   'rgba(226, 195, 122, 1)');
        grad.addColorStop(0.4, 'rgba(201, 168, 76,  0.6)');
        grad.addColorStop(1,   'rgba(160, 121, 48,  0)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /* ── Init partículas ── */
  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  /* ── Loop de animación ── */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  /* ── Visibilidad de la página ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(loop);
    }
  });

  /* ── Resize con debounce ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initParticles();
    }, 200);
  }, { passive: true });

  /* ── Arranque ── */
  resize();
  if (PARTICLE_COUNT > 0) {
    initParticles();
    loop();
  }
})();


/* ───────────────────────────────────────────
   8. SMOOTH SCROLL — anclas internas
─────────────────────────────────────────── */
(function initSmoothScroll() {
  const HEADER_H = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h') || '72'
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href');
      if (hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_H - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ───────────────────────────────────────────
   9. PARALLAX SUAVE — letras del hero
─────────────────────────────────────────── */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  const glyphs = document.querySelectorAll('.hero-greek-bg .glyph');
  if (!glyphs.length) return;

  // Profundidades diferentes por glyph
  const depths = [0.04, 0.07, 0.05, 0.03, 0.06, 0.045, 0.035, 0.055];

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        glyphs.forEach((g, i) => {
          const d = depths[i] || 0.05;
          g.style.transform = `translateY(${y * d}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ───────────────────────────────────────────
   10. CONTADOR ANIMADO — stats del hero
─────────────────────────────────────────── */
(function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Solo el stat "24"
  const statNums = document.querySelectorAll('.stat-num');

  statNums.forEach(el => {
    const raw = el.textContent.trim();
    const num = parseInt(raw);
    if (isNaN(num)) return; // "100%", "Acceso" — no animar

    el.textContent = '0';
    let started = false;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        animateCount(el, num, raw.replace(String(num), ''));
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    observer.observe(el);
  });

  function animateCount(el, target, suffix) {
    const duration = 1200;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out quart
      const eased    = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }
})();


/* ───────────────────────────────────────────
   11. ACTIVE NAV LINK — highlight al scrollear
─────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const HEADER_H = 80;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const match = link.getAttribute('href') === `#${id}`;
            link.style.color = match
              ? 'var(--gold-lt)'
              : '';
          });
        }
      });
    },
    {
      rootMargin: `-${HEADER_H}px 0px -55% 0px`,
      threshold: 0,
    }
  );

  sections.forEach(s => observer.observe(s));
})();


/* ───────────────────────────────────────────
   12. CURSOR PERSONALIZADO (solo desktop)
─────────────────────────────────────────── */
(function initCursor() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 1024) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  // Crea los elementos del cursor
  const dot  = document.createElement('div');
  const ring = document.createElement('div');

  dot.id  = 'cursor-dot';
  ring.id = 'cursor-ring';

  Object.assign(dot.style, {
    position: 'fixed',
    top: '0', left: '0',
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: 'var(--gold)',
    pointerEvents: 'none',
    zIndex: '9999',
    transform: 'translate(-50%, -50%)',
    transition: 'opacity 200ms',
    willChange: 'transform',
  });

  Object.assign(ring.style, {
    position: 'fixed',
    top: '0', left: '0',
    width: '32px', height: '32px',
    borderRadius: '50%',
    border: '1px solid rgba(201,168,76,.45)',
    pointerEvents: 'none',
    zIndex: '9998',
    transform: 'translate(-50%, -50%)',
    transition: 'width 300ms, height 300ms, border-color 300ms',
    willChange: 'transform',
  });

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  // Efecto hover en interactivos
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '52px';
      ring.style.height = '52px';
      ring.style.borderColor = 'rgba(201,168,76,.75)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(201,168,76,.45)';
    });
  });

  // Loop suave con lag en el ring
  const LERP = 0.12;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateCursor() {
    // Dot sigue exacto
    dot.style.transform  = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;

    // Ring con lag (lerp)
    rx = lerp(rx, mx, LERP);
    ry = lerp(ry, my, LERP);
    ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Ocultar cursor nativo
  document.documentElement.style.cursor = 'none';
  document.querySelectorAll('a, button').forEach(el => {
    el.style.cursor = 'none';
  });
})();


/* ───────────────────────────────────────────
   13. CITA GRIEGA — typing effect en hero
─────────────────────────────────────────── */
(function initTypingEffect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const el = document.querySelector('.hero-greek-quote');
  if (!el) return;

  const full = el.textContent.trim();
  el.textContent = '';
  el.style.minHeight = '1.3em';
  el.style.borderRight = '2px solid var(--gold-dk)';
  el.style.display = 'inline-block';

  let i = 0;
  let started = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;

      // Esperar un poco antes de empezar
      setTimeout(() => {
        const interval = setInterval(() => {
          el.textContent = full.slice(0, ++i);
          if (i >= full.length) {
            clearInterval(interval);
            // Quitar cursor parpadeante al terminar
            setTimeout(() => {
              el.style.borderRight = 'none';
            }, 800);
          }
        }, 55);
      }, 600);

      observer.disconnect();
    }
  }, { threshold: 0.8 });

  observer.observe(el);
})();
