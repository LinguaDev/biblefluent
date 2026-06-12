/**
 * KOINÉ ACADEMY - Script global para todas las lecciones
 * 
 * Dependencias:
 * - jQuery no requerido (JavaScript puro)
 * - FontAwesome 6 (para iconos)
 * - CSS: styles.css (debe estar cargado)
 * 
 * Uso:
 * 1. Definir window.lessonData con:
 *    {
 *      vocab: [{greek, translit, spanish}, ...],
 *      quiz: [{question, options, correct}, ...],
 *      type: "declension" | "article" | "spirit" | "diphthong" | "cases",
 *      declensionWords: [...] (si type = "declension"),
 *      customInit: function() { ... }
 *    }
 * 2. Incluir este script después de definir lessonData.
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes comunes
    initAccordions();
    initRevealButtons();
    initScrollTop();

    // Si hay datos de lección, construirlos
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
      
      // Traductor aleatorio
      if (data.vocab && data.vocab.length && document.getElementById('translationQuiz')) {
        initTranslationQuiz(data.vocab);
      }
      
      // Tipos especiales de lección
      if (data.type) {
        handleSpecialLessonType(data);
      }
      
      // Función personalizada adicional
      if (typeof data.customInit === 'function') {
        data.customInit();
      }
    }
  });

  // --------------------------------------------------------------
  // ACORDEONES
  // --------------------------------------------------------------
  function initAccordions() {
    const items = document.querySelectorAll('.accordion-item');
    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      if (!header || header.hasAttribute('data-accordion')) return;
      header.setAttribute('data-accordion', 'true');
      header.addEventListener('click', (e) => {
        // Evitar que se active si se hace clic en un botón dentro del header
        if (e.target.closest('.btn-reveal')) return;
        item.classList.toggle('active');
      });
    });
  }

  // --------------------------------------------------------------
  // BOTONES REVELAR RESPUESTA
  // --------------------------------------------------------------
  function initRevealButtons() {
    const btns = document.querySelectorAll('.btn-reveal');
    btns.forEach(btn => {
      if (btn.hasAttribute('data-reveal')) return;
      btn.setAttribute('data-reveal', 'true');
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-target');
        if (targetId) {
          const targetDiv = document.getElementById(targetId);
          if (targetDiv) targetDiv.classList.toggle('show');
        }
      });
    });
  }

  // --------------------------------------------------------------
  // TABLA DE VOCABULARIO (id="vocabTable" o .vocab-table)
  // --------------------------------------------------------------
  function buildVocabTable(vocab) {
    const table = document.querySelector('#vocabTable, .vocab-table');
    if (!table) return;
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    } else {
      tbody.innerHTML = '';
    }
    vocab.forEach(item => {
      const row = tbody.insertRow();
      row.insertCell(0).innerHTML = `<span class="greek-word">${item.greek}</span>`;
      row.insertCell(1).textContent = item.translit || '';
      row.insertCell(2).textContent = item.spanish;
    });
  }

  // --------------------------------------------------------------
  // FLASHCARDS (id="flashcardGrid")
  // --------------------------------------------------------------
  function buildFlashcards(vocab) {
    const container = document.getElementById('flashcardGrid');
    if (!container) return;
    container.innerHTML = '';
    vocab.forEach(word => {
      const card = document.createElement('div');
      card.className = 'vocab-card';
      card.innerHTML = `
        <div class="greek-word" style="font-size:1.6rem; font-weight:bold;">${word.greek}</div>
        <div class="translit" style="font-size:0.8rem;">${word.translit || ''}</div>
        <div class="meaning" style="display:none; margin-top:0.5rem;"><i class="fas fa-language"></i> ${word.spanish}</div>
      `;
      card.addEventListener('click', () => {
        const meaning = card.querySelector('.meaning');
        meaning.style.display = meaning.style.display === 'none' ? 'block' : 'none';
      });
      container.appendChild(card);
    });
  }

  // --------------------------------------------------------------
  // QUIZ DE OPCIÓN MÚLTIPLE (id="quizContainer" y "quizFeedback")
  // --------------------------------------------------------------
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
    const q = currentQuizData[currentQuizIndex % currentQuizData.length];
    let html = `<p><strong>${q.question}</strong></p>`;
    q.options.forEach((opt, idx) => {
      html += `<div class="quiz-option" data-opt="${idx}">${opt}</div>`;
    });
    container.innerHTML = html;
    
    // Asignar eventos a cada opción
    container.querySelectorAll('.quiz-option').forEach(opt => {
      opt.removeEventListener('click', quizOptionHandler);
      opt.addEventListener('click', quizOptionHandler);
    });
    
    function quizOptionHandler(e) {
      const selected = parseInt(this.dataset.opt);
      const isCorrect = (selected === q.correct);
      if (feedbackDiv) {
        if (isCorrect) {
          feedbackDiv.innerHTML = '<span class="correct-feedback">✅ ¡Correcto! +10 XP</span>';
          currentQuizIndex++;
          setTimeout(() => {
            loadQuizQuestion();
            feedbackDiv.innerHTML = '';
          }, 1200);
        } else {
          feedbackDiv.innerHTML = `<span class="wrong-feedback">❌ Incorrecto. Respuesta correcta: ${q.options[q.correct]}</span>`;
        }
      } else {
        // Fallback sin feedback
        if (isCorrect) {
          currentQuizIndex++;
          loadQuizQuestion();
        }
      }
    }
  }

  // --------------------------------------------------------------
  // TRADUCCIÓN ALEATORIA (id="translationQuiz")
  // --------------------------------------------------------------
  function initTranslationQuiz(vocab) {
    const container = document.getElementById('translationQuiz');
    if (!container) return;
    let currentVocab = vocab;
    loadRandomTranslation();
    
    function loadRandomTranslation() {
      const randomWord = currentVocab[Math.floor(Math.random() * currentVocab.length)];
      container.innerHTML = `
        <div class="card-highlight">
          <strong>Traduce al español:</strong> <span class="greek-word">${randomWord.greek}</span><br>
          <input type="text" id="transAnswer" placeholder="escribe aquí..." style="margin-top:0.5rem; padding:0.5rem; width:100%; max-width:300px;">
          <button id="checkTrans" class="btn-reveal">Comprobar</button>
          <span id="transFeedback"></span>
        </div>
      `;
      const checkBtn = document.getElementById('checkTrans');
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          const answer = document.getElementById('transAnswer').value.trim().toLowerCase();
          const correct = randomWord.spanish.toLowerCase();
          const fbSpan = document.getElementById('transFeedback');
          if (answer === correct || (correct.includes(answer) && answer.length > 2)) {
            fbSpan.innerHTML = '<span class="correct-feedback">✓ Correcto</span>';
            setTimeout(loadRandomTranslation, 1500);
          } else {
            fbSpan.innerHTML = `<span class="wrong-feedback">✗ La respuesta es: ${randomWord.spanish}</span>`;
          }
        });
      }
    }
  }

  // --------------------------------------------------------------
  // MANEJAR TIPOS ESPECIALES DE LECCIÓN
  // --------------------------------------------------------------
  function handleSpecialLessonType(data) {
    switch (data.type) {
      case 'declension':
        if (data.declensionWords && data.declensionWords.length) {
          initDeclensionQuiz(data.declensionWords);
        }
        break;
      case 'article':
        if (data.articleForms && data.articleForms.length) {
          initArticleQuiz(data.articleForms);
        }
        break;
      case 'spirit':
        if (data.spiritWords && data.spiritWords.length) {
          initSpiritQuiz(data.spiritWords);
        }
        break;
      case 'diphthong':
        if (data.diphthongWords && data.diphthongWords.length) {
          initDiphthongQuiz(data.diphthongWords);
        }
        break;
      case 'cases':
        if (data.caseExamples && data.caseExamples.length) {
          initCaseQuiz(data.caseExamples);
        }
        break;
      default:
        break;
    }
  }

  // Ejercicio de declinación (ejemplo: pedir genitivo)
  function initDeclensionQuiz(declWords) {
    const container = document.getElementById('declensionQuizArea');
    if (!container) return;
    let currentWord = declWords[0];
    function load() {
      currentWord = declWords[Math.floor(Math.random() * declWords.length)];
      container.innerHTML = `
        <div class="card-highlight">
          <strong>Completa la declinación de <span class="greek-word">${currentWord.nom}</span>:</strong><br>
          Nominativo: ${currentWord.article || 'ἡ'} ${currentWord.nom}<br>
          Genitivo singular: ______<br>
          <input type="text" id="declAnswer" placeholder="ej. φωνῆς" style="margin-top:0.5rem; padding:0.5rem;">
          <button id="checkDecl" class="btn-reveal">Verificar</button>
          <div id="declResult"></div>
        </div>
      `;
      const checkBtn = document.getElementById('checkDecl');
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          const answer = document.getElementById('declAnswer').value.trim();
          const correct = currentWord.gen;
          const resultDiv = document.getElementById('declResult');
          if (answer === correct) {
            resultDiv.innerHTML = '<span class="correct-feedback">✓ ¡Correcto!</span>';
            setTimeout(load, 1500);
          } else {
            resultDiv.innerHTML = `<span class="wrong-feedback">✗ La forma correcta es ${correct}.</span>`;
          }
        });
      }
    }
    load();
    window.refreshDeclensionQuiz = load; // opcional para botón "Nueva palabra"
  }

  // Stub para otros tipos (pueden expandirse según necesidades)
  function initArticleQuiz(articleForms) {
    console.log('Article quiz not fully implemented yet');
  }
  function initSpiritQuiz(spiritWords) {
    console.log('Spirit quiz not fully implemented yet');
  }
  function initDiphthongQuiz(diphthongWords) {
    console.log('Diphthong quiz not fully implemented yet');
  }
  function initCaseQuiz(caseExamples) {
    console.log('Case quiz not fully implemented yet');
  }

  // --------------------------------------------------------------
  // SCROLL TOP (botón con id="scrollTopBtn")
  // --------------------------------------------------------------
  function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();