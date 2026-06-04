// ==================== MENÚ HAMBURGUESA ====================
const mobileToggle = document.getElementById('mobileToggle');
const navbar = document.getElementById('navbar');

if (mobileToggle && navbar) {
  mobileToggle.addEventListener('click', () => {
    navbar.classList.toggle('active');
    const icon = mobileToggle.querySelector('i');
    if (navbar.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  });
}

// ==================== SELECTOR DE IDIOMA ====================
const langEs = document.getElementById('langEs');
const langEn = document.getElementById('langEn');
const currentFile = window.location.pathname.split('/').pop() || 'index.html';
const isEnglish = currentFile === 'en.html';

if (langEs && langEn) {
  if (isEnglish) {
    langEs.classList.remove('active');
    langEn.classList.add('active');
  } else {
    langEs.classList.add('active');
    langEn.classList.remove('active');
  }

  const currentHash = window.location.hash;

  langEs.addEventListener('click', () => {
    if (!isEnglish) return;
    window.location.href = `index.html${currentHash}`;
  });

  langEn.addEventListener('click', () => {
    if (isEnglish) return;
    window.location.href = `en.html${currentHash}`;
  });
}

// ==================== BOTONES DE RECURSOS (si existen) ====================
document.querySelectorAll('.btn-resource').forEach(btn => {
  btn.addEventListener('click', () => {
    const msg = isEnglish 
      ? 'Coming soon: downloadable materials. Meanwhile, explore the learning paths.'
      : 'Próximamente: descarga de materiales. Mientras tanto, explora las rutas de aprendizaje.';
    alert(msg);
  });
});

// ==================== BACK TO TOP ====================
const backBtn = document.getElementById('backToTop');
if (backBtn) {
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==================== SMOOTH SCROLL PARA ENLACES INTERNOS ====================
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});