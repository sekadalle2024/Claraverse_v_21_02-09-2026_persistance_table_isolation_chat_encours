/**
 * ========================================
 * MODELISATION FORCE - Réduction espacement tables
 * Version agressive avec !important partout
 * ========================================
 */

(function () {
  'use strict';

  console.log('💪 [Modelisation FORCE] Démarrage - Réduction 75% TRÈS AGRESSIVE');

  function applyForceStyles() {
    const styleId = 'modelisation-force-styles';

    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      /* ========================================
         RÉDUCTION ESPACEMENT TABLES - 50% FORCE
         ======================================== */

      /* Cibler TOUS les HR dans les messages */
      hr {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
        opacity: 0.5 !important;
        border-color: rgba(156, 163, 175, 0.3) !important;
        height: 1px !important;
      }

      /* Cibler les conteneurs overflow */
      .overflow-x-auto {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      /* Override Tailwind my-4 */
      .my-4 {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      /* Conteneurs prose */
      .prose > *,
      .dark\\:prose-invert > * {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      /* Data containers */
      [data-container-id] {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      /* Tables - préserver ombres */
      table {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }

      /* Messages glassmorphic */
      .glassmorphic .prose,
      .glassmorphic .dark\\:prose-invert {
        line-height: 1.5 !important;
      }

      /* Paragraphes */
      .prose p,
      .dark\\:prose-invert p {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      /* Divs dans prose */
      .prose div,
      .dark\\:prose-invert div {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }
    `;

    console.log('✅ [Modelisation FORCE] Styles CSS injectés avec !important');
  }

  function forceApplyToElements() {
    // HR
    document.querySelectorAll('hr').forEach(hr => {
      hr.style.setProperty('margin-top', '0.5rem', 'important');
      hr.style.setProperty('margin-bottom', '0.5rem', 'important');
      hr.style.setProperty('opacity', '0.5', 'important');
    });

    // Conteneurs
    document.querySelectorAll('.overflow-x-auto, .my-4, [data-container-id]').forEach(el => {
      el.style.setProperty('margin-top', '0.5rem', 'important');
      el.style.setProperty('margin-bottom', '0.5rem', 'important');
    });

    console.log('✅ [Modelisation FORCE] Styles inline appliqués');
  }

  function setupObserver() {
    const observer = new MutationObserver(() => {
      forceApplyToElements();
    });

    const root = document.querySelector('#root');
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true
      });
      console.log('👁️ [Modelisation FORCE] Observer activé');
    }
  }

  function init() {
    applyForceStyles();
    forceApplyToElements();
    setupObserver();

    // Réappliquer toutes les 1 secondes
    setInterval(() => {
      applyForceStyles();
      forceApplyToElements();
    }, 1000);

    console.log('✅ [Modelisation FORCE] Système actif');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API
  window.claraverseModelisationForce = {
    reapply: () => {
      applyForceStyles();
      forceApplyToElements();
    }
  };

})();
