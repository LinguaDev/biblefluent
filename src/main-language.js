// ==================== MENÚ HAMBURGUESA ====================
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.contains('open');
    mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', !isOpen);
    // Cambiar ícono (opcional)
    const icon = navToggle.querySelector('i');
    if (icon) {
      if (!isOpen) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  });

  // Cerrar menú al hacer clic en un enlace
  const navLinks = mainNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  });
}

// ==================== AÑO EN FOOTER ====================
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// ==================== SCROLL SUAVE PARA ENLACES INTERNOS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Actualizar URL sin recargar
      history.pushState(null, null, targetId);
    }
  });
});

// ==================== HEADER SCROLL (EFECTO) ====================
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
}

// ==================== CERRAR MENÚ AL REDIMENSIONAR A DESKTOP ====================
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    if (mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  }
});