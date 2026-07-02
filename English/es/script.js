/**
 * KOINÉ ACADEMY - INGLÉS BÍBLICO
 * Script general para todas las lecciones
 * 
 * Dependencias:
 * - FontAwesome 6 (para iconos)
 * - CSS: styles.css
 * 
 * Uso:
 * 1. Definir window.lessonData con:
 *    {
 *      vocab: [{en, es, note?}, ...],
 *      quiz: [{question, options, correct}, ...],
 *      fill: [{sentence, answer, hint?}, ...],  // opcional
 *      customInit: function() { ... }           // opcional
 *    }
 * 2. Incluir este script después de definir lessonData.
 */

(function() {
  'use strict';

  // ============================================================
  // 1. INICIALIZACIÓN GENERAL AL CARGAR LA PÁGINA
  // ============================================================
  document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes comunes
    initAccordions();
    initRevealButtons();
    initScrollTop();

    // Si hay datos de lección, construir componentes
    if (window.lessonData) {
      const data = window.lessonData;

      // Vocabulario: tabla y flashcards
      if (data.vocab && data.vocab.length) {
        buildVocabTable(data.vocab);
        buildFlashcards(data.vocab);
      }

      // Quiz de opción múltiple
      if (data.quiz && data.quiz.length) {
        initQuiz(data.quiz);
      }

      // Ejercicio de completar (fill-in-the-blank)
      if (data.fill && data.fill.length) {
        initFillExercise(data.fill);
      }

      // Función personalizada adicional
      if (typeof data.customInit === 'function') {
        data.customInit();
      }
    }
  });

  // ============================================================
  // 2. ACORDEONES
  // ============================================================
  function initAccordions() {
    const items = document.querySelectorAll('.accordion-item');
    items.forEach(function(item) {
      const header = item.querySelector('.accordion-header');
      if (!header || header.hasAttribute('data-accordion')) return;
      header.setAttribute('data-accordion', 'true');
      header.addEventListener('click', function(e) {
        // No activar si se hace clic en un botón dentro del header
        if (e.target.closest('.btn-reveal') || e.target.closest('.btn-check')) return;
        item.classList.toggle('active');
      });
    });
  }

  // ============================================================
  // 3. BOTONES REVELAR RESPUESTA
  // ============================================================
  function initRevealButtons() {
    const btns = document.querySelectorAll('.btn-reveal[data-target]');
    btns.forEach(function(btn) {
      if (btn.hasAttribute('data-reveal')) return;
      btn.setAttribute('data-reveal', 'true');
      btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (target) target.classList.toggle('show');
      });
    });
  }

  // ============================================================
  // 4. TABLA DE VOCABULARIO (id="vocabTable")
  // ============================================================
  function buildVocabTable(vocab) {
    const table = document.querySelector('#vocabTable');
    if (!table) return;
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    } else {
      tbody.innerHTML = '';
    }
    vocab.forEach(function(item) {
      const row = tbody.insertRow();
      row.insertCell(0).innerHTML = '<span class="highlight-word">' + escapeHtml(item.en) + '</span>';
      row.insertCell(1).textContent = item.es;
      row.insertCell(2).textContent = item.note || '';
    });
  }

  // ============================================================
  // 5. FLASHCARDS (id="flashcardGrid")
  // ============================================================
  function buildFlashcards(vocab) {
    const container = document.getElementById('flashcardGrid');
    if (!container) return;
    container.innerHTML = '';
    vocab.forEach(function(item) {
      const card = document.createElement('div');
      card.className = 'flashcard';
      card.innerHTML = '<div class="en">' + escapeHtml(item.en) + '</div>' +
                       '<div class="es">' + escapeHtml(item.es) + '</div>';
      card.addEventListener('click', function() {
        this.classList.toggle('show');
      });
      container.appendChild(card);
    });
  }

  // ============================================================
  // 6. QUIZ DE OPCIÓN MÚLTIPLE (id="quizContainer")
  // ============================================================
  let currentQuizIndex = 0;
  let currentQuizData = null;

  function initQuiz(quizData) {
    const container = document.getElementById('quizContainer');
    if (!container || !quizData.length) return;
    currentQuizData = quizData;
    currentQuizIndex = 0;
    loadQuizQuestion();
  }

  function loadQuizQuestion() {
    const container = document.getElementById('quizContainer');
    const feedbackDiv = document.getElementById('quizFeedback');
    if (!container || !currentQuizData) return;

    if (currentQuizIndex >= currentQuizData.length) {
      container.innerHTML = '<p style="font-size:1.1rem;">🎉 ¡Has completado el quiz! Sigue practicando.</p>';
      if (feedbackDiv) feedbackDiv.innerHTML = '';
      return;
    }

    const q = currentQuizData[currentQuizIndex];
    let html = '<p><strong>' + escapeHtml(q.question) + '</strong></p>';
    q.options.forEach(function(opt, idx) {
      html += '<div class="quiz-option" data-opt="' + idx + '">' + escapeHtml(opt) + '</div>';
    });
    container.innerHTML = html;

    // Asignar eventos a cada opción
    container.querySelectorAll('.quiz-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        const selected = parseInt(this.dataset.opt);
        const correct = currentQuizData[currentQuizIndex].correct;
        const isCorrect = (selected === correct);

        // Marcar visualmente
        this.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');

        // Deshabilitar todos
        container.querySelectorAll('.quiz-option').forEach(function(el) {
          el.style.pointerEvents = 'none';
        });

        if (feedbackDiv) {
          if (isCorrect) {
            feedbackDiv.innerHTML = '<span class="feedback-correct">✅ ¡Correcto! +10 XP</span>';
            currentQuizIndex++;
            setTimeout(function() {
              feedbackDiv.innerHTML = '';
              loadQuizQuestion();
            }, 1200);
          } else {
            feedbackDiv.innerHTML = '<span class="feedback-wrong">❌ La respuesta correcta es: ' +
                                    escapeHtml(currentQuizData[currentQuizIndex].options[correct]) +
                                    '</span>';
            // Permitir reintentar después de 2 segundos
            setTimeout(function() {
              container.querySelectorAll('.quiz-option').forEach(function(el) {
                el.style.pointerEvents = 'auto';
                el.classList.remove('selected-correct', 'selected-wrong');
              });
              feedbackDiv.innerHTML = '';
            }, 2000);
          }
        }
      });
    });
  }

  // ============================================================
  // 7. EJERCICIO DE COMPLETAR (rellenar espacios)
  // ============================================================
  function initFillExercise(fillData) {
    const container = document.getElementById('fillExercise');
    if (!container || !fillData.length) return;

    // Construir el ejercicio
    let html = '<p>Escribe la palabra correcta en cada espacio:</p><ol style="list-style-type:decimal; padding-left:1.5rem;">';
    fillData.forEach(function(item, index) {
      html += '<li data-fill-index="' + index + '">' +
              escapeHtml(item.sentence.replace('____', '<span class="fill-blank">____</span>')) +
              ' <span class="fill-hint" style="font-size:0.8rem; color:#5b6e8c;">(' + (item.hint || '') + ')</span>' +
              ' <button class="btn-check" data-fill-index="' + index + '">Verificar</button>' +
              ' <span class="fill-feedback" data-fill-index="' + index + '"></span>' +
              '</li>';
    });
    html += '</ol>';
    container.innerHTML = html;

    // Eventos para los botones de verificar
    container.querySelectorAll('.btn-check[data-fill-index]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.fillIndex);
        const item = fillData[index];
        const feedbackSpan = container.querySelector('.fill-feedback[data-fill-index="' + index + '"]');
        // Pedir al usuario que escriba la respuesta
        const userAnswer = prompt('Escribe la palabra correcta para el espacio en blanco:');
        if (userAnswer === null) return;
        const trimmed = userAnswer.trim();
        if (trimmed.toLowerCase() === item.answer.toLowerCase()) {
          feedbackSpan.innerHTML = '<span class="feedback-correct">✅ Correcto</span>';
          // Opcional: deshabilitar el botón
          this.disabled = true;
          this.style.opacity = '0.6';
        } else {
          feedbackSpan.innerHTML = '<span class="feedback-wrong">❌ La respuesta correcta es: <strong>' +
                                   escapeHtml(item.answer) + '</strong></span>';
        }
      });
    });
  }

  // ============================================================
  // 8. SCROLL TOP (botón con id="scrollTopBtn")
  // ============================================================
  function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', function() {
      btn.style.display = (window.scrollY > 300) ? 'flex' : 'none';
    });
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // 9. UTILIDADES
  // ============================================================
  // Escapar HTML para evitar inyecciones
  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // ============================================================
  // 10. EXPONER FUNCIONES PARA USO INLINE EN LECCIONES
  // ============================================================
  // Permitir que las lecciones puedan recargar el quiz o el ejercicio
  window.reloadQuiz = function() {
    if (currentQuizData && currentQuizData.length) {
      currentQuizIndex = 0;
      loadQuizQuestion();
    }
  };

  window.reloadFillExercise = function() {
    // Se puede recargar si se vuelve a llamar a initFillExercise
    // Pero mejor que cada lección maneje su propio reinicio si es necesario.
  };

})();