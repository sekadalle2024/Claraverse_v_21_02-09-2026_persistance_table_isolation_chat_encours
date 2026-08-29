/**
 * MODELISATION ULTRA COMPACT - Réduction 75%
 * Version très agressive pour un espacement minimal
 */

(function () {
    'use strict';

    console.log('🔥 [ULTRA COMPACT] Démarrage - Réduction 75%');

    function applyUltraCompactStyles() {
        const styleId = 'modelisation-ultra-compact';

        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        style.textContent = `
      /* ULTRA COMPACT - 75% de réduction */
      
      hr {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
        opacity: 0.2 !important;
        border-color: rgba(156, 163, 175, 0.2) !important;
        height: 1px !important;
      }

      .overflow-x-auto {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
      }

      .my-4 {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
      }

      .prose > *,
      .dark\\:prose-invert > * {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
      }

      [data-container-id] {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      table {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }

      .prose p,
      .dark\\:prose-invert p {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
      }

      .prose div,
      .dark\\:prose-invert div {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
      }
    `;

        console.log('✅ [ULTRA COMPACT] Styles CSS injectés');
    }

    function forceApply() {
        // HR - 4px au lieu de 16px
        document.querySelectorAll('hr').forEach(hr => {
            hr.style.setProperty('margin-top', '0.25rem', 'important');
            hr.style.setProperty('margin-bottom', '0.25rem', 'important');
            hr.style.setProperty('opacity', '0.2', 'important');
        });

        // Conteneurs - 4px au lieu de 16px
        document.querySelectorAll('.overflow-x-auto, .my-4, [data-container-id]').forEach(el => {
            el.style.setProperty('margin-top', '0.25rem', 'important');
            el.style.setProperty('margin-bottom', '0.25rem', 'important');
        });

        console.log('✅ [ULTRA COMPACT] Appliqué à tous les éléments');
    }

    function setupObserver() {
        const observer = new MutationObserver(() => {
            forceApply();
        });

        const root = document.querySelector('#root');
        if (root) {
            observer.observe(root, {
                childList: true,
                subtree: true
            });
        }
    }

    function init() {
        applyUltraCompactStyles();
        forceApply();
        setupObserver();

        // Réappliquer toutes les 500ms pour être sûr
        setInterval(() => {
            applyUltraCompactStyles();
            forceApply();
        }, 500);

        console.log('✅ [ULTRA COMPACT] Système actif - Espacement minimal');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.claraverseUltraCompact = {
        reapply: () => {
            applyUltraCompactStyles();
            forceApply();
        }
    };

})();
