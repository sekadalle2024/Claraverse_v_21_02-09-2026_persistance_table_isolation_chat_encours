/**
 * ========================================
 * MODELISATION.JS - Réduction espacement tables
 * ========================================
 * 
 * Objectif: Réduire l'espace entre les tables du chat de 50% (moitié)
 * tout en gardant les ombres des tables
 * 
 * Stratégie:
 * 1. Cibler les éléments <hr> entre les tables
 * 2. Réduire les marges des conteneurs .overflow-x-auto
 * 3. Ajuster les espacements .my-4
 * 4. Préserver les ombres et le style visuel
 */

(function () {
    'use strict';

    console.log('🎨 [Modelisation] Initialisation - Réduction espacement 50%');

    // Configuration de réduction (50% = moitié)
    const REDUCTION_FACTOR = 0.5; // On garde 50% de l'espace original

    /**
     * Applique les styles de réduction d'espacement
     */
    function applySpacingReduction() {
        // Injecter les styles CSS globaux
        const styleId = 'modelisation-spacing-styles';

        // Supprimer l'ancien style s'il existe
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        // Créer le nouveau style
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
      /* ========================================
         RÉDUCTION ESPACEMENT TABLES - 50%
         ======================================== */

      /* 1. Réduire les <hr> entre tables de moitié */
      .prose hr,
      .dark\\:prose-invert hr {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
        opacity: 0.5 !important;
        border-color: rgba(156, 163, 175, 0.3) !important;
      }

      /* 2. Réduire les marges des conteneurs de tables de moitié */
      .overflow-x-auto.my-4 {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      /* 3. Réduire l'espacement dans les conteneurs prose */
      .prose .overflow-x-auto,
      .dark\\:prose-invert .overflow-x-auto {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      /* 4. Ajuster les conteneurs data-container-id */
      [data-container-id] {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      /* 5. Préserver les ombres des tables */
      table.min-w-full,
      table.claraverse-conso-table,
      table[data-table-id] {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        margin-bottom: 0.75rem !important;
      }

      /* 6. Réduire l'espacement dans les messages assistant */
      .glassmorphic .prose {
        line-height: 1.5 !important;
      }

      /* 7. Compacter les paragraphes entre tables */
      .prose p {
        margin-top: 0.75rem !important;
        margin-bottom: 0.75rem !important;
      }

      /* 8. Réduire l'espacement vertical global dans prose */
      .prose > * + * {
        margin-top: 0.75rem !important;
      }
    `;

        document.head.appendChild(style);
        console.log('✅ [Modelisation] Styles CSS injectés - Réduction 50%');
    }

    /**
     * Traite dynamiquement les éléments HR
     */
    function processHrElements() {
        const hrElements = document.querySelectorAll('.prose hr, .dark\\:prose-invert hr');

        hrElements.forEach((hr, index) => {
            // Réduire la hauteur et les marges de moitié
            hr.style.marginTop = '0.5rem';
            hr.style.marginBottom = '0.5rem';
            hr.style.opacity = '0.5';
            hr.style.borderColor = 'rgba(156, 163, 175, 0.3)';
            hr.style.height = '1px';
        });

        if (hrElements.length > 0) {
            console.log(`✅ [Modelisation] ${hrElements.length} éléments <hr> traités`);
        }
    }

    /**
     * Traite les conteneurs de tables
     */
    function processTableContainers() {
        const containers = document.querySelectorAll('.overflow-x-auto.my-4');

        containers.forEach((container, index) => {
            container.style.marginTop = '0.5rem';
            container.style.marginBottom = '0.5rem';
        });

        if (containers.length > 0) {
            console.log(`✅ [Modelisation] ${containers.length} conteneurs de tables traités`);
        }
    }

    /**
     * Traite les conteneurs avec data-container-id
     */
    function processDataContainers() {
        const dataContainers = document.querySelectorAll('[data-container-id]');

        dataContainers.forEach((container, index) => {
            container.style.marginTop = '0.5rem';
            container.style.marginBottom = '0.5rem';
        });

        if (dataContainers.length > 0) {
            console.log(`✅ [Modelisation] ${dataContainers.length} data-containers traités`);
        }
    }

    /**
     * Applique toutes les modifications
     */
    function applyAllModifications() {
        applySpacingReduction();
        processHrElements();
        processTableContainers();
        processDataContainers();

        console.log('🎯 [Modelisation] Toutes les modifications appliquées - Réduction 50%');
    }

    /**
     * Observer pour détecter les nouvelles tables
     */
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;

            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Vérifier si c'est une table ou un conteneur de table
                            if (
                                node.matches && (
                                    node.matches('table') ||
                                    node.matches('.overflow-x-auto') ||
                                    node.matches('[data-container-id]') ||
                                    node.matches('hr') ||
                                    node.querySelector('table, .overflow-x-auto, [data-container-id], hr')
                                )
                            ) {
                                shouldProcess = true;
                            }
                        }
                    });
                }
            });

            if (shouldProcess) {
                // Délai court pour laisser le DOM se stabiliser
                setTimeout(() => {
                    processHrElements();
                    processTableContainers();
                    processDataContainers();
                }, 100);
            }
        });

        // Observer le conteneur principal du chat
        const chatContainer = document.querySelector('#root');
        if (chatContainer) {
            observer.observe(chatContainer, {
                childList: true,
                subtree: true
            });
            console.log('👁️ [Modelisation] Observer activé sur #root');
        }

        return observer;
    }

    /**
     * Initialisation principale
     */
    function initialize() {
        console.log('🚀 [Modelisation] Démarrage - Réduction 50%...');

        // Appliquer immédiatement
        applyAllModifications();

        // Configurer l'observer
        const observer = setupMutationObserver();

        // Réappliquer après un court délai (pour les éléments chargés dynamiquement)
        setTimeout(() => {
            applyAllModifications();
        }, 500);

        // Réappliquer périodiquement (toutes les 2 secondes)
        setInterval(() => {
            processHrElements();
            processTableContainers();
            processDataContainers();
        }, 2000);

        console.log('✅ [Modelisation] Système initialisé - Espacement réduit de 50%');
    }

    // Démarrer quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Exposer l'API globale
    window.claraverseModelisation = {
        applySpacingReduction,
        processHrElements,
        processTableContainers,
        processDataContainers,
        reapply: applyAllModifications
    };

    console.log('📦 [Modelisation] API exposée: window.claraverseModelisation');

})();
