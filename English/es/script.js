/**
 * BIBLEFLUENT - INGLÉS BÍBLICO
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
 *      fill: [{sentence, answer, hint?}, ...],
 *      customInit: function() { ... }
 *    }
 * 2. Incluir este script después de definir lessonData.
 * 
 * Las lecciones pueden agregar funcionalidad extra (ej: drag & drop, reconocimiento de voz)
 * en un bloque inline después de este script.
 */

(function() {
  'use strict';

  // ============================================================
  // 1. INICIALIZACIÓN AL CARGAR LA PÁGINA
  // ============================================================
  document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes comunes
    initAccordions();
    initRevealButtons();
    initTtsButtons();
    initScrollTop();
    initHeaderScroll();

    // Si hay datos de lección, construir componentes
    if (window.lessonData) {
      var data = window.lessonData;

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

    // Precargar voces TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
      };
    }
  });

  // ============================================================
  // 2. ACORDEONES
  // ============================================================
  function initAccordions() {
    var items = document.querySelectorAll('.accordion-item');
    items.forEach(function(item) {
      var header = item.querySelector('.accordion-header');
      if (!header || header.hasAttribute('data-accordion')) return;
      header.setAttribute('data-accordion', 'true');
      header.addEventListener('click', function(e) {
        // No activar si se hace clic en un botón dentro del header
        if (e.target.closest('.btn-reveal') || 
            e.target.closest('.btn-check') || 
            e.target.closest('.tts-btn') ||
            e.target.closest('a')) return;
        item.classList.toggle('active');
      });
    });

    // Si hay un acordeón activo por defecto, asegurarse de que se muestre
    document.querySelectorAll('.accordion-item.active .accordion-content').forEach(function(content) {
      content.style.maxHeight = content.scrollHeight + 'px';
    });
  }

  // ============================================================
  // 3. BOTONES REVELAR RESPUESTA
  // ============================================================
  function initRevealButtons() {
    var btns = document.querySelectorAll('.btn-reveal[data-target]');
    btns.forEach(function(btn) {
      if (btn.hasAttribute('data-reveal')) return;
      btn.setAttribute('data-reveal', 'true');
      btn.addEventListener('click', function() {
        var targetId = this.getAttribute('data-target');
        var target = document.getElementById(targetId);
        if (target) target.classList.toggle('show');
      });
    });
  }

  // ============================================================
  // 4. TEXTO A VOZ (TTS)
  // ============================================================
  function initTtsButtons() {
    var btns = document.querySelectorAll('.tts-btn[data-tts]');
    btns.forEach(function(btn) {
      if (btn.hasAttribute('data-tts-init')) return;
      btn.setAttribute('data-tts-init', 'true');
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var text = this.getAttribute('data-tts');
        if (text) {
          speakText(text);
        }
      });
    });
  }

  function speakText(text, lang) {
    lang = lang || 'en-US';
    if (!window.speechSynthesis) {
      console.warn('SpeechSynthesis no soportado');
      return;
    }

    // Cancelar cualquier síntesis en curso
    window.speechSynthesis.cancel();

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Intentar seleccionar una voz en inglés de buena calidad
    var voices = window.speechSynthesis.getVoices();
    // Priorizar voces de Google (en Chrome)
    var enVoice = voices.find(function(v) {
      return v.lang.startsWith('en') && v.name.includes('Google');
    });
    if (!enVoice) {
      enVoice = voices.find(function(v) { 
        return v.lang.startsWith('en') && !v.name.includes('Microsoft');
      });
    }
    if (!enVoice) {
      enVoice = voices.find(function(v) { return v.lang.startsWith('en'); });
    }
    if (enVoice) utterance.voice = enVoice;

    // Añadir clase "playing" al botón que disparó el evento
    var activeBtn = document.activeElement;
    if (activeBtn && activeBtn.classList.contains('tts-btn')) {
      activeBtn.classList.add('playing');
      utterance.onend = function() {
        activeBtn.classList.remove('playing');
      };
      utterance.onerror = function() {
        activeBtn.classList.remove('playing');
      };
    }

    window.speechSynthesis.speak(utterance);
  }

  // Exponer speakText para que pueda ser usado desde inline
  window.speakText = speakText;

  // ============================================================
  // 5. TABLA DE VOCABULARIO (id="vocabTable")
  // ============================================================
  function buildVocabTable(vocab) {
    var table = document.querySelector('#vocabTable');
    if (!table) return;
    var tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    } else {
      tbody.innerHTML = '';
    }

    // Verificar si hay una columna adicional para TTS
    var hasTtsColumn = table.querySelector('thead th:last-child') && 
                       table.querySelector('thead th:last-child').textContent.trim() === '🔊';

    vocab.forEach(function(item) {
      var row = tbody.insertRow();
      row.insertCell(0).innerHTML = '<span class="highlight-word">' + escapeHtml(item.en) + '</span>';
      row.insertCell(1).textContent = item.es;
      row.insertCell(2).textContent = item.note || '';
      if (hasTtsColumn) {
        var ttsCell = row.insertCell(3);
        ttsCell.innerHTML = '<button class="tts-btn" data-tts="' + escapeHtml(item.en) + '" aria-label="Escuchar pronunciación"><i class="fas fa-volume-up"></i></button>';
        // Inicializar el botón TTS (se hará en initTtsButtons, pero como es dinámico, lo hacemos manualmente)
        var btn = ttsCell.querySelector('.tts-btn');
        if (btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var text = this.getAttribute('data-tts');
            if (text) speakText(text);
          });
        }
      }
    });
  }

  // ============================================================
  // 6. FLASHCARDS (id="flashcardGrid")
  // ============================================================
  function buildFlashcards(vocab) {
    var container = document.getElementById('flashcardGrid');
    if (!container) return;
    container.innerHTML = '';

    vocab.forEach(function(item) {
      var card = document.createElement('div');
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
  // 7. QUIZ DE OPCIÓN MÚLTIPLE (id="quizContainer")
  // ============================================================
  var currentQuizIndex = 0;
  var currentQuizData = null;
  var quizScore = 0;

  function initQuiz(quizData) {
    var container = document.getElementById('quizContainer');
    if (!container || !quizData.length) return;
    currentQuizData = quizData;
    currentQuizIndex = 0;
    quizScore = 0;
    loadQuizQuestion();
  }

  function loadQuizQuestion() {
    var container = document.getElementById('quizContainer');
    var feedbackDiv = document.getElementById('quizFeedback');
    var scoreDiv = document.getElementById('quizScore');
    if (!container || !currentQuizData) return;

    if (currentQuizIndex >= currentQuizData.length) {
      var total = currentQuizData.length;
      container.innerHTML = '<p style="font-size:1.1rem; text-align:center;">🎉 ¡Has completado el quiz!</p>';
      if (feedbackDiv) feedbackDiv.innerHTML = '';
      if (scoreDiv) {
        var percentage = Math.round((quizScore / total) * 100);
        var message = percentage >= 80 ? '🌟 ¡Excelente!' : (percentage >= 60 ? '👍 ¡Buen trabajo!' : '📚 Sigue practicando.');
        scoreDiv.innerHTML = '<span style="font-size:1.2rem;">Puntuación: <strong>' + quizScore + '/' + total + '</strong> (' + percentage + '%) — ' + message + '</span>';
      }
      return;
    }

    var q = currentQuizData[currentQuizIndex];
    var html = '<p><strong>' + escapeHtml(q.question) + '</strong></p>';
    q.options.forEach(function(opt, idx) {
      html += '<div class="quiz-option" data-opt="' + idx + '">' + escapeHtml(opt) + '</div>';
    });
    container.innerHTML = html;

    // Asignar eventos a cada opción
    container.querySelectorAll('.quiz-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        var selected = parseInt(this.dataset.opt);
        var correct = currentQuizData[currentQuizIndex].correct;
        var isCorrect = (selected === correct);

        // Marcar visualmente
        this.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');

        // Deshabilitar todos
        container.querySelectorAll('.quiz-option').forEach(function(el) {
          el.style.pointerEvents = 'none';
          el.classList.add('disabled');
        });

        if (isCorrect) quizScore++;

        if (feedbackDiv) {
          if (isCorrect) {
            feedbackDiv.innerHTML = '<span class="feedback-correct">✅ ¡Correcto! +10 XP</span>';
          } else {
            feedbackDiv.innerHTML = '<span class="feedback-wrong">❌ La respuesta correcta es: <strong>' + 
                                    escapeHtml(currentQuizData[currentQuizIndex].options[correct]) + '</strong></span>';
          }
        }

        // Avanzar después de un breve retraso
        currentQuizIndex++;
        setTimeout(function() {
          if (feedbackDiv) feedbackDiv.innerHTML = '';
          loadQuizQuestion();
        }, 1500);
      });
    });
  }

  // ============================================================
  // 8. EJERCICIO DE COMPLETAR (rellenar espacios)
  // ============================================================
  function initFillExercise(fillData) {
    var container = document.getElementById('fillExercise');
    if (!container || !fillData.length) return;

    var html = '<p>Escribe la palabra correcta en cada espacio:</p><ol style="list-style-type:decimal; padding-left:1.5rem;">';
    fillData.forEach(function(item, index) {
      html += '<li data-fill-index="' + index + '" style="margin-bottom:0.5rem;">' +
              escapeHtml(item.sentence.replace('____', '<span class="fill-blank" style="font-weight:600; color:#1f5f54;">____</span>')) +
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
        var index = parseInt(this.dataset.fillIndex);
        var item = fillData[index];
        var feedbackSpan = container.querySelector('.fill-feedback[data-fill-index="' + index + '"]');
        var userAnswer = prompt('Escribe la palabra correcta para el espacio en blanco:');
        if (userAnswer === null) return;
        var trimmed = userAnswer.trim();
        if (trimmed.toLowerCase() === item.answer.toLowerCase()) {
          feedbackSpan.innerHTML = '<span class="feedback-correct">✅ Correcto</span>';
          this.disabled = true;
          this.style.opacity = '0.6';
          this.style.cursor = 'not-allowed';
        } else {
          feedbackSpan.innerHTML = '<span class="feedback-wrong">❌ La respuesta correcta es: <strong>' +
                                   escapeHtml(item.answer) + '</strong></span>';
        }
      });
    });
  }

  // ============================================================
  // 9. SCROLL TOP (botón con id="scrollTopBtn")
  // ============================================================
  function initScrollTop() {
    var btn = document.getElementById('scrollTopBtn');
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
  // 10. HEADER SCROLL (para sombra al hacer scroll)
  // ============================================================
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ============================================================
  // 11. UTILIDADES
  // ============================================================
  function escapeHtml(text) {
    if (!text) return '';
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // ============================================================
  // 12. EXPONER FUNCIONES PARA USO INLINE EN LECCIONES
  // ============================================================
  window.reloadQuiz = function() {
    if (currentQuizData && currentQuizData.length) {
      currentQuizIndex = 0;
      quizScore = 0;
      loadQuizQuestion();
    }
  };

  window.reloadFillExercise = function(fillData) {
    if (fillData && fillData.length) {
      initFillExercise(fillData);
    }
  };

  // Exponer también speakText globalmente (ya está expuesto arriba)

  // ============================================================
  // 13. REINICIO DE EJERCICIOS (para lecciones que lo necesiten)
  // ============================================================
  window.resetLessonComponents = function() {
    if (window.lessonData) {
      var data = window.lessonData;
      if (data.quiz && data.quiz.length) {
        currentQuizIndex = 0;
        quizScore = 0;
        loadQuizQuestion();
      }
      if (data.fill && data.fill.length) {
        initFillExercise(data.fill);
      }
      if (data.vocab && data.vocab.length) {
        buildVocabTable(data.vocab);
        buildFlashcards(data.vocab);
      }
    }
  };

})();