// Hamburger menu
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
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    });
  });
}

// Language switcher (redirige a versiones traducidas)
const langEs = document.getElementById('langEs');
const langEn = document.getElementById('langEn');

if (langEs && langEn) {
  const currentPath = window.location.pathname;
  const isEnglish = currentPath.includes('/en/') || currentPath === '/en/index.html';
  
  if (isEnglish) {
    langEs.classList.remove('active');
    langEn.classList.add('active');
  } else {
    langEs.classList.add('active');
    langEn.classList.remove('active');
  }

  langEs.addEventListener('click', () => {
    if (window.location.pathname !== '/' && !window.location.pathname.includes('/en/')) {
      return;
    }
    window.location.href = '/';
  });

  langEn.addEventListener('click', () => {
    if (window.location.pathname.includes('/en/')) return;
    window.location.href = '/en/index.html';
  });
}

// Newsletter simulado
const newsletterForm = document.getElementById('newsletterForm');
const formMessage = document.getElementById('formMessage');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsEmail').value.trim();
    if (!email || !email.includes('@')) {
      formMessage.textContent = 'Correo inválido.';
      formMessage.style.color = '#f4b642';
      return;
    }
    formMessage.innerHTML = '✅ ¡Suscripción exitosa! Revisa tu correo.';
    formMessage.style.color = '#8bc34a';
    newsletterForm.reset();
    setTimeout(() => { formMessage.textContent = ''; }, 4000);
  });
}

// Botones de recursos (demo)
document.querySelectorAll('.btn-resource').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Próximamente: descarga de materiales. Mientras tanto, explora las rutas de aprendizaje.');
  });
});

// Back to top
const backBtn = document.getElementById('backToTop');
if (backBtn) {
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}