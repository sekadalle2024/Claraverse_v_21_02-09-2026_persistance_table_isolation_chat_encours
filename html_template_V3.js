/**
 * Script d'injection HTML pour Claraverse - Version Accordéon E-AUDIT PRO 2.0
 * Nom : html_template.js
 * Description : Transforme la présentation du guide pratique en un menu accordéon interactif.
 */

(function() {
    'use strict';
    
    console.log('🚀 Script HTML Template Claraverse - ACCORDEON E-AUDIT PRO 2.0');

    // Configuration (inchangée)
    const CONFIG = {
        selectors: [
            'table.min-w-full.border.border-gray-200',
            'table.min-w-full',
            'div.prose table',
            'table',
            'div.prose',
            'div[class*="prose"]'
        ],
        injectionDelay: 1000,
        processedClass: 'html-template-injected',
        maxRetries: 10,
        retryInterval: 2000
    };

    let retryCount = 0;

    /**
     * Template HTML structuré en menu accordéon
     */
    const HTML_TEMPLATE = `
        <div class="accordion-container" style="margin: 20px auto; max-width: 900px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <style>
                /* Styles de base du contenu original (légèrement adaptés) */
                .pdf-page { background: white; padding: 40px; margin-top: -1px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
                .pdf-page-cover { background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), url('/src/assets/B10.jpg'); background-size: cover; color: white; text-align: center; }
                .pdf-page-content { background: rgba(255, 255, 255, 0.97); }
                .pdf-title-main { font-size: 48px; font-weight: 700; margin-bottom: 20px; }
                .pdf-subtitle-main { font-size: 28px; font-weight: 600; margin-bottom: 30px; }
                .pdf-title-secondary { font-size: 16px; opacity: 0.95; max-width: 600px; margin: 0 auto; }
                .pdf-section-title { font-size: 24px; font-weight: 700; color: #1e40af; margin-bottom: 25px; text-transform: uppercase; }
                .pdf-card-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 25px 0; }
                .pdf-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
                .pdf-card-number { font-size: 50px; font-weight: 700; }
                .pdf-card-text { font-size: 13px; line-height: 1.5; }
                .pdf-list { list-style: none; padding: 0; }
                .pdf-list-item { font-size: 16px; padding: 12px 0 12px 35px; position: relative; border-bottom: 1px solid #e5e7eb; }
                .pdf-list-item::before { content: "•"; position: absolute; left: 0; color: #667eea; font-size: 28px; line-height: 1; }
                .pdf-text-block { background: #f8fafc; border-left: 4px solid #667eea; padding: 15px 20px; margin: 15px 0; font-size: 14px; line-height: 1.6; }
                .pdf-highlight-box { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .pdf-case-study-title { font-size: 20px; font-weight: 700; color: #1e40af; margin-bottom: 20px; }
                .pdf-story-text { font-size: 14px; line-height: 1.8; color: #374151; margin-bottom: 15px; }
                .pdf-workflow { text-align: center; font-size: 16px; font-weight: 700; margin: 25px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
                .pdf-norm-box { background: #fef3c7; border: 3px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .pdf-norm-title { font-weight: 700; color: #92400e; margin-bottom: 10px; font-size: 15px; }

                /* Nouveaux styles pour l'accordéon */
                .accordion-header {
                    background-color: #f1f5f9;
                    color: #1e3a8a;
                    cursor: pointer;
                    padding: 18px 25px;
                    width: 100%;
                    text-align: left;
                    border: none;
                    border-top: 1px solid #cbd5e1;
                    outline: none;
                    font-size: 18px;
                    font-weight: 600;
                    transition: background-color 0.3s ease;
                    position: relative;
                }
                .accordion-header:first-of-type {
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    border-top: none;
                }
                .accordion-header:last-of-type {
                     border-bottom-left-radius: 8px;
                     border-bottom-right-radius: 8px;
                }
                 .accordion-header.active:last-of-type {
                     border-bottom-left-radius: 0;
                     border-bottom-right-radius: 0;
                }
                .accordion-header:hover, .accordion-header.active {
                    background-color: #e2e8f0;
                }
                .accordion-header.active {
                    background-color: #667eea;
                    color: white;
                }
                .accordion-header::after {
                    content: '＋';
                    font-size: 20px;
                    color: #1e3a8a;
                    position: absolute;
                    right: 25px;
                    top: 50%;
                    transform: translateY(-50%);
                    transition: transform 0.3s ease;
                }
                .accordion-header.active::after {
                    content: '－';
                    color: white;
                }
                .accordion-panel {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.4s ease-out;
                    background-color: white;
                }
            </style>

            <button class="accordion-header active">Couverture</button>
            <div class="accordion-panel" style="max-height: fit-content;">
                <div class="pdf-page pdf-page-cover">
                    <div class="pdf-title-main">E-AUDIT PRO 2.0</div>
                    <div class="pdf-subtitle-main">GUIDE PRATIQUE</div>
                    <div class="pdf-title-secondary">Norme 9.4 Plan d'audit interne- Pourquoi votre plan annuel d'audit ne couvre pas exhaustivement les risques</div>
                </div>
            </div>

            <button class="accordion-header">Sommaire & Avant-propos</button>
            <div class="accordion-panel">
                <div class="pdf-page pdf-page-content">
                    <div class="pdf-section-title">SOMMAIRE</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
                        <div>
                            <h3 style="font-size: 20px; font-weight: 700; color: #1e40af; margin-bottom: 15px;">Sommaire détaillé</h3>
                            <ul class="pdf-list">
                                <li class="pdf-list-item">Etude de cas - P4</li>
                                <li class="pdf-list-item">Méthode manuelle - P11</li>
                                <li class="pdf-list-item">Méthode automatisée -P20</li>
                                <li class="pdf-list-item">Offre logicielle - P27</li>
                                <li class="pdf-list-item">Contact -P29</li>
                            </ul>
                        </div>
                        <div>
                            <h3 style="font-size: 20px; font-weight: 700; color: #1e40af; margin-bottom: 15px;">Avant-propos</h3>
                            <div class="pdf-text-block">Ce guide pratique vous explique comment construire un univers d'audit robuste, conformément à la Norme 9.4. Vous apprendrez à utiliser la revue documentaire pour identifier tous les objets auditables pertinents.</div>
                        </div>
                    </div>
                </div>
            </div>

            <button class="accordion-header">Etude de cas : Introduction</button>
            <div class="accordion-panel">
                 <div class="pdf-page pdf-page-content">
                    <div class="pdf-case-study-title">ETUDE DE CAS – Bahi Legre, RESPONSABLE AUDIT INTERNE</div>
                    <div class="pdf-workflow">RISQUES → SCENARIO → ECART</div>
                    <div class="pdf-card-container">
                        <div class="pdf-card"><div class="pdf-card-number">1</div><div class="pdf-card-text">Un programme de travail constitue les travaux d'audit à accomplir pour atteindre les objectifs d'audit</div></div>
                        <div class="pdf-card"><div class="pdf-card-number">2</div><div class="pdf-card-text">Les objectifs d'audit de la mission et les risques associés doivent être annexés à tout programme de travail.</div></div>
                        <div class="pdf-card"><div class="pdf-card-number">3</div><div class="pdf-card-text">Les objectifs d'audit sont des sous-thématiques de la thématique globale de mission.</div></div>
                    </div>
                </div>
            </div>

            <button class="accordion-header">Etude de cas : Le Contexte</button>
            <div class="accordion-panel">
                <div class="pdf-page pdf-page-content">
                    <div class="pdf-case-study-title">ETUDE DE CAS – Bahi Legre (1/2)</div>
                    <div class="pdf-story-text"><strong>Lundi, 16h.</strong> Bahi Legre, Responsable de l'Audit Interne, était fatigué, mais soulagé. Sur son écran, la version finale du Plan d'Audit Annuel.</div>
                    <div class="pdf-story-text">Son équipe avait passé les dernières semaines à analyser les rapports d'audit interne des trois années précédentes.</div>
                    <div class="pdf-highlight-box">
                        <div class="pdf-story-text"><strong>Le lendemain.</strong> Bahi attendait l'approbation. Le Président du Comité, prit la parole, avec des mots durs. "Monsieur Legre, en comparant votre proposition avec le rapport de nos Commissaires aux Comptes de l'année N-1, que j'ai ici, je constate une divergence inquiétante."</div>
                        <div class="pdf-story-text" style="margin-top: 15px;">"Votre plan ne couvre absolument pas 40% des risques élevés et des faiblesses significatives que le CAC a pourtant clairement signalés."</div>
                    </div>
                </div>
            </div>

            <button class="accordion-header">Etude de cas : La Prise de Conscience</button>
            <div class="accordion-panel">
                <div class="pdf-page pdf-page-content">
                    <div class="pdf-case-study-title">ETUDE DE CAS – Bahi Legre (2/2)</div>
                    <div class="pdf-story-text"><strong>De retour,</strong> Le plan d'audit, sur son bureau, était comme une preuve d'incompétence. La question du Président du Comité tournait en boucle dans son esprit.</div>
                    <div class="pdf-highlight-box" style="background: #fee2e2; border-color: #dc2626;">
                        <div class="pdf-story-text">Comment avons-nous pu définir notre univers d'audit en ignorant une source d'information externe aussi cruciale que les risques du CAC ?</div>
                        <div class="pdf-story-text">Comment garantir la pertinence de notre plan si notre revue documentaire n'a pas été exhaustive ?</div>
                    </div>
                </div>
            </div>

            <button class="accordion-header">Les Normes Applicables</button>
            <div class="accordion-panel">
                <div class="pdf-page pdf-page-content">
                    <div class="pdf-case-study-title">Rappel des Normes IIA</div>
                     <div class="pdf-text-block" style="background: #dbeafe; border-color: #2563eb;">La publication des nouvelles normes du CRIPP par l'IIA en janvier 2024, avec une entrée en vigueur en janvier 2025, renforce l'exigence d'une planification de l'audit basée sur une évaluation exhaustive des risques.</div>
                    <div class="pdf-norm-box">
                        <div class="pdf-norm-title">Norme 9.4 Plan d'audit interne:</div>
                        <p style="margin: 0;">« Le responsable de l'audit interne doit fonder le plan d'audit interne sur une évaluation documentée des stratégies, des objectifs et des risques de l'organisation. [...] »</p>
                    </div>
                    <div class="pdf-norm-box" style="background: #e0f2fe; border-color: #0284c7;">
                        <div class="pdf-norm-title" style="color: #075985;">Norme 13.2 Évaluation des risques dans le cadre de la mission:</div>
                        <p style="margin: 0;">« Les auditeurs internes doivent comprendre l'activité examinée pour évaluer les risques y afférents. [...] Pour une compréhension appropriée, les auditeurs internes doivent identifier et réunir des informations fiables, pertinentes et suffisantes. »</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    /**
     * Ajoute les écouteurs d'événements pour l'accordéon
     */
    function setupAccordionListeners() {
        const accordionContainer = document.querySelector('.accordion-container');
        if (!accordionContainer || accordionContainer.dataset.listenersAttached) {
            return;
        }
        
        const headers = accordionContainer.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                // Ferme tous les panneaux ouverts
                headers.forEach(otherHeader => {
                    if (otherHeader !== this) {
                        otherHeader.classList.remove('active');
                        otherHeader.nextElementSibling.style.maxHeight = null;
                    }
                });

                // Ouvre/Ferme le panneau cliqué
                const isActive = this.classList.toggle('active');
                const panel = this.nextElementSibling;
                if (isActive) {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                } else {
                    panel.style.maxHeight = null;
                }
            });
        });

        accordionContainer.dataset.listenersAttached = 'true';
        console.log('🎧 Écouteurs d\'événements pour l\'accordéon activés.');
    }

    /**
     * Fonction de débogage (inchangée)
     */
    function debugElements() {
        console.log('🔍 Débogage des éléments présents dans la page:');
        CONFIG.selectors.forEach((selector, index) => {
            try {
                const elements = document.querySelectorAll(selector);
                console.log(`  ${index + 1}. Sélecteur: "${selector}" → ${elements.length} élément(s)`);
            } catch (e) {
                console.log(`  ${index + 1}. Sélecteur: "${selector}" → ERREUR`);
            }
        });
    }

    /**
     * Trouve le conteneur d'injection (inchangée)
     */
    function findInjectionTarget() {
        console.log('🎯 Recherche du conteneur...');
        for (const selector of CONFIG.selectors.filter(s => s.includes('table'))) {
            const tables = document.querySelectorAll(selector);
            if (tables.length > 0) {
                const lastTable = tables[tables.length - 1];
                let parent = lastTable.closest('div.prose, div[class*="prose"]');
                if (parent) {
                    console.log('✅ Conteneur trouvé près de la dernière table.');
                    return parent;
                }
            }
        }
        const divs = document.querySelectorAll('div.prose, div[class*="prose"]');
        if (divs.length > 0) {
            console.log('✅ Conteneur trouvé (dernière div "prose").');
            return divs[divs.length - 1];
        }
        console.log('⚠️ Conteneur non trouvé, utilisation du body.');
        return document.body;
    }

    /**
     * Injecte le template
     */
    function injectTemplate(container) {
        if (!container) {
            console.error('❌ Aucun conteneur valide pour l\'injection.');
            return false;
        }
        if (container.querySelector('.accordion-container')) {
            console.log('ℹ️ Le menu accordéon est déjà injecté.');
            return false;
        }
        try {
            // Utilise insertAdjacentHTML pour une injection plus propre
            container.insertAdjacentHTML('beforeend', HTML_TEMPLATE);
            console.log('✅ Template Accordéon injecté !');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'injection du template:', error);
            return false;
        }
    }

    /**
     * Exécution principale
     */
    function execute() {
        console.log(`\n🔄 Tentative d'injection n°${retryCount + 1}/${CONFIG.maxRetries}`);
        debugElements();
        const target = findInjectionTarget();
        const success = injectTemplate(target);

        if (success) {
            console.log('🎉 Injection réussie ! Initialisation de l\'accordéon...');
            setupAccordionListeners(); // Active la logique de l'accordéon
        } else if (retryCount < CONFIG.maxRetries) {
            retryCount++;
            setTimeout(execute, CONFIG.retryInterval);
        } else {
             console.log('🚫 Échec de l\'injection après plusieurs tentatives.');
        }
    }

    /**
     * Initialisation (inchangée)
     */
    function initialize() {
        console.log('⚙️ Initialisation du script Accordéon...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(execute, CONFIG.injectionDelay));
        } else {
            setTimeout(execute, CONFIG.injectionDelay);
        }
    }

    /**
     * Observer (inchangée mais cruciale pour les chats dynamiques)
     */
    function setupObserver() {
        const observer = new MutationObserver((mutations) => {
            const hasNewTable = mutations.some(mutation => 
                Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && (node.tagName === 'TABLE' || node.querySelector('table'))
                )
            );
            if (hasNewTable) {
                console.log('📊 Nouvelle table détectée par MutationObserver ! Relance de l\'injection.');
                retryCount = 0; // Réinitialise le compteur de tentatives
                execute();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Démarrage
    initialize();
    setupObserver();

    // API globale (inchangée)
    window.ClaraverseHTML = {
        inject: execute,
        debug: debugElements,
        version: '4.0.0-Accordion'
    };
    console.log('✅ Script E-AUDIT PRO 2.0 Accordéon initialisé et prêt.');
})();