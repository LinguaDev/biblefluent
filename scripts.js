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
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    });
  });
}

// ==================== SELECTOR DE IDIOMA ====================
// Detecta qué archivo estamos (index.html o en.html)
const langEs = document.getElementById('langEs');
const langEn = document.getElementById('langEn');
const currentFile = window.location.pathname.split('/').pop() || 'index.html';
const isEnglish = currentFile === 'en.html';

if (langEs && langEn) {
  // Marcar el botón activo según el archivo actual
  if (isEnglish) {
    langEs.classList.remove('active');
    langEn.classList.add('active');
  } else {
    langEs.classList.add('active');
    langEn.classList.remove('active');
  }

  // Redirigir al cambiar de idioma, conservando el mismo ancla (#)
  const currentHash = window.location.hash;

  langEs.addEventListener('click', () => {
    if (!isEnglish) return; // ya estamos en español
    window.location.href = `index.html${currentHash}`;
  });

  langEn.addEventListener('click', () => {
    if (isEnglish) return; // ya estamos en inglés
    window.location.href = `en.html${currentHash}`;
  });
}

// ==================== NEWSLETTER ====================
const newsletterForm = document.getElementById('newsletterForm');
const formMessage = document.getElementById('formMessage');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsEmail').value.trim();
    if (!email || !email.includes('@')) {
      formMessage.textContent = isEnglish ? 'Invalid email address.' : 'Correo inválido.';
      formMessage.style.color = '#f4b642';
      return;
    }
    formMessage.innerHTML = isEnglish ? '✅ Subscribed! Check your email.' : '✅ ¡Suscripción exitosa! Revisa tu correo.';
    formMessage.style.color = '#8bc34a';
    newsletterForm.reset();
    setTimeout(() => { formMessage.textContent = ''; }, 4000);
  });
}

// ==================== BOTONES DE RECURSOS ====================
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