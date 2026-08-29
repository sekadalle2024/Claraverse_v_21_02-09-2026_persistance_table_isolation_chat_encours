/**
 * DESIGN CHAT - Script unifié pour les modifications de design
 * Combine le masquage des sélecteurs LLM et l'espacement ultra-compact
 * Style Grok - Interface épurée
 */

(function () {
    'use strict';

    console.log('🎨 [DESIGN CHAT] Initialisation - Style Grok');

    // ═══════════════════════════════════════════════════════════════
    // PARTIE 1: MASQUAGE DES SÉLECTEURS LLM
    // ═══════════════════════════════════════════════════════════════

    function masquerSelecteurs() {
        // Masquer tous les boutons qui contiennent "gemini", "gpt", "claude", etc.
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            const text = button.textContent.toLowerCase();
            if (
                text.includes('gemini') ||
                text.includes('gpt') ||
                text.includes('claude') ||
                text.includes('llama') ||
                text.includes('model') ||
                text.includes('provider')
            ) {
                button.style.display = 'none';
                console.log('✅ [MASQUAGE] Bouton masqué:', text.substring(0, 30));
            }
        });

        // Masquer les icônes de paramètres (Settings)
        // EXCEPTION: Ne pas masquer les boutons de thème
        const settingsButtons = document.querySelectorAll('button[aria-label*="settings"], button[aria-label*="Settings"], button[title*="settings"], button[title*="Settings"]');
        settingsButtons.forEach(btn => {
            const ariaLabel = btn.getAttribute('aria-label') || '';
            const title = btn.getAttribute('title') || '';
            const isThemeButton = ariaLabel.toLowerCase().includes('theme') ||
                title.toLowerCase().includes('theme') ||
                ariaLabel.toLowerCase().includes('dark mode') ||
                title.toLowerCase().includes('dark mode');

            if (!isThemeButton) {
                btn.style.display = 'none';
                console.log('✅ [MASQUAGE] Bouton paramètres masqué');
            }
        });

        // Masquer les SVG qui ressemblent à des icônes de paramètres
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(svg => {
            const parent = svg.parentElement;
            if (parent && parent.tagName === 'BUTTON') {
                // Vérifier si c'est un bouton de thème (Sun, Moon, Monitor, Palette)
                const ariaLabel = parent.getAttribute('aria-label') || '';
                const title = parent.getAttribute('title') || '';
                const isThemeButton = ariaLabel.toLowerCase().includes('theme') ||
                    title.toLowerCase().includes('theme') ||
                    ariaLabel.toLowerCase().includes('dark mode') ||
                    title.toLowerCase().includes('dark mode') ||
                    title.toLowerCase().includes('changer de thème') ||
                    parent.closest('.theme-selector');

                if (isThemeButton) {
                    // Ne pas masquer les boutons de thème
                    console.log('🎨 [MASQUAGE] Bouton de thème préservé:', title || ariaLabel);
                    return;
                }

                // Vérifier si c'est une icône de paramètres (gear/cog)
                const paths = svg.querySelectorAll('path');
                paths.forEach(path => {
                    const d = path.getAttribute('d');
                    // Pattern typique d'une icône de paramètres
                    if (d && (d.includes('M12') || d.includes('circle'))) {
                        // Ne pas masquer les icônes Paperclip et Send
                        const parentText = parent.textContent;
                        if (!parentText.includes('Attach') && !parentText.includes('Send')) {
                            parent.style.display = 'none';
                            console.log('✅ [MASQUAGE] Icône paramètres masquée');
                        }
                    }
                });
            }
        });

        // Masquer les dropdowns de sélection
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            const name = select.getAttribute('name');
            if (name && (name.includes('model') || name.includes('provider'))) {
                select.style.display = 'none';
                console.log('✅ [MASQUAGE] Select masqué:', name);
            }
        });

        // Masquer les éléments avec des classes spécifiques
        const classesToHide = [
            'model-selector',
            'provider-selector',
            'model-dropdown',
            'provider-dropdown'
        ];

        classesToHide.forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(el => {
                el.style.display = 'none';
                console.log('✅ [MASQUAGE] Élément masqué par classe:', className);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // PARTIE 2: ESPACEMENT ULTRA-COMPACT
    // ═══════════════════════════════════════════════════════════════

    function applyUltraCompactStyles() {
        const styleId = 'design-chat-ultra-compact';

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

        console.log('✅ [ESPACEMENT] Styles CSS ultra-compact injectés');
    }

    function forceApplyCompactSpacing() {
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

        console.log('✅ [ESPACEMENT] Appliqué à tous les éléments');
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALISATION ET OBSERVATEURS
    // ═══════════════════════════════════════════════════════════════

    function setupObserver() {
        const observer = new MutationObserver(() => {
            masquerSelecteurs();
            forceApplyCompactSpacing();
        });

        const root = document.querySelector('#root') || document.body;
        observer.observe(root, {
            childList: true,
            subtree: true
        });

        console.log('✅ [DESIGN CHAT] Observateur DOM activé');
    }

    function init() {
        // Appliquer les styles CSS
        applyUltraCompactStyles();

        // Appliquer les modifications
        masquerSelecteurs();
        forceApplyCompactSpacing();

        // Configurer l'observateur
        setupObserver();

        // Réappliquer périodiquement pour garantir la persistance
        setInterval(() => {
            applyUltraCompactStyles();
            masquerSelecteurs();
            forceApplyCompactSpacing();
        }, 500);

        console.log('✅ [DESIGN CHAT] Système actif - Style Grok complet');
    }

    // Démarrage
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique pour réappliquer manuellement
    window.designChat = {
        reapply: () => {
            applyUltraCompactStyles();
            masquerSelecteurs();
            forceApplyCompactSpacing();
            console.log('🔄 [DESIGN CHAT] Réappliqué manuellement');
        }
    };

    console.log('🎨 [DESIGN CHAT] Chargé avec succès');

})();
