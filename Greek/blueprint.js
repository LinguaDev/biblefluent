// ==============================================
// BIBLEFLUENT - SCRIPT REUTILIZABLE
// Verificación, progreso, sidebar, tema oscuro
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.lesson-card');
    const progressBar = document.getElementById('progressBar');
    const sidebarProgressBar = document.getElementById('sidebarProgressBar');
    const progressText = document.getElementById('progressText');
    const sidebarProgressText = document.getElementById('sidebarProgressText');
    const navList = document.getElementById('lessonNavList');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const themeToggle = document.getElementById('themeToggle');
    const resetBtn = document.getElementById('resetProgressBtn');
    const toggleVerse = document.getElementById('toggleVerseTranslation');
    const spanishText = document.querySelector('.spanish-text');

    let completed = JSON.parse(localStorage.getItem('completedLessons')) || Array(cards.length).fill(false);
    let theme = localStorage.getItem('theme') || 'light';

    function updateProgress() {
        const total = cards.length;
        const count = completed.filter(c => c === true).length;
        const percent = (count / total) * 100;
        progressBar.style.width = `${percent}%`;
        sidebarProgressBar.style.width = `${percent}%`;
        progressText.textContent = `${Math.round(percent)}%`;
        sidebarProgressText.textContent = `${count}/${total} completados`;
        cards.forEach((card, idx) => {
            if (completed[idx]) card.classList.add('completed');
            else card.classList.remove('completed');
        });
        const links = navList?.querySelectorAll('a');
        links?.forEach((link, idx) => {
            if (completed[idx]) link.classList.add('completed');
            else link.classList.remove('completed');
        });
        localStorage.setItem('completedLessons', JSON.stringify(completed));
    }

    function completeLesson(id) {
        if (!completed[id]) {
            completed[id] = true;
            updateProgress();
        }
    }

    function setupCard(card, idx) {
        const checkBtn = card.querySelector('.btn-check');
        const showBtn = card.querySelector('.btn-show');
        const input = card.querySelector('.exercise-input');
        const feedback = card.querySelector('.feedback');
        const hiddenDiv = card.querySelector('.hidden-answer');
        const correctAnswer = card.getAttribute('data-answer') || '';
        if (checkBtn && input) {
            checkBtn.addEventListener('click', () => {
                const userAnswer = input.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const valid = correctAnswer.split('|').map(a => a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
                const isCorrect = valid.some(v => v === userAnswer);
                if (isCorrect) {
                    feedback.textContent = '¡Correcto! Bien hecho.';
                    feedback.className = 'feedback correct';
                    if (!completed[idx]) completeLesson(idx);
                } else {
                    feedback.textContent = 'Incorrecto. Intenta de nuevo.';
                    feedback.className = 'feedback incorrect';
                }
            });
        }
        if (showBtn && hiddenDiv) {
            showBtn.addEventListener('click', () => {
                hiddenDiv.classList.toggle('visible');
                showBtn.textContent = hiddenDiv.classList.contains('visible') ? 'Ocultar respuesta' : 'Mostrar respuesta';
            });
        }
    }

    cards.forEach((card, idx) => {
        const header = card.querySelector('.lesson-card-header');
        if (header) {
            header.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-check') && !e.target.closest('.btn-show')) {
                    card.classList.toggle('open');
                }
            });
        }
        setupCard(card, idx);
    });

    if (navList) {
        navList.innerHTML = '';
        cards.forEach((card, idx) => {
            const title = card.querySelector('.lesson-card-title')?.textContent || `Cuadro ${idx+1}`;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.innerHTML = `<i class="fas ${completed[idx] ? 'fa-check-circle' : 'fa-circle'}"></i><span>${title}</span>`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                card.classList.add('open');
                if (window.innerWidth <= 991) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
            });
            li.appendChild(a);
            navList.appendChild(li);
        });
    }

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    function setTheme(newTheme) {
        document.body.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
        if (themeToggle) themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
            setTheme(newTheme);
        });
        setTheme(theme);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('¿Reiniciar todo el progreso de esta lección?')) {
                completed.fill(false);
                updateProgress();
                cards.forEach((card) => {
                    const fb = card.querySelector('.feedback');
                    const inp = card.querySelector('.exercise-input');
                    if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
                    if (inp) inp.value = '';
                    card.classList.remove('completed');
                    const hidden = card.querySelector('.hidden-answer');
                    if (hidden?.classList.contains('visible')) {
                        hidden.classList.remove('visible');
                        const showBtn = card.querySelector('.btn-show');
                        if (showBtn) showBtn.textContent = 'Mostrar respuesta';
                    }
                });
            }
        });
    }

    if (toggleVerse && spanishText) {
        toggleVerse.addEventListener('click', () => {
            spanishText.classList.toggle('visible');
            toggleVerse.textContent = spanishText.classList.contains('visible') ? 'Ocultar traducción' : 'Mostrar traducción';
        });
    }

    updateProgress();
});