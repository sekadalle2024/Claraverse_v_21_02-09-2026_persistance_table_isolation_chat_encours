/**
 * Script d'injection HTML pour Claraverse - Version PDF E-AUDIT PRO 2.0
 * Nom : html_template.js
 * Reproduction fidèle du PDF Guide Pratique
 */

(function() {
    'use strict';
    
    console.log('🚀 Script HTML Template Claraverse - PDF E-AUDIT PRO 2.0');

    // Configuration
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
     * Template HTML reproduisant le PDF E-AUDIT PRO 2.0
     */
    const HTML_TEMPLATE = `
        <div class="pdf-viewer-container" style="margin: 40px auto; max-width: 900px; background: #e5e7eb; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            <style>
                .pdf-viewer-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-height: 800px;
                    overflow-y: auto;
                    scroll-behavior: smooth;
                }
                .pdf-viewer-container::-webkit-scrollbar {
                    width: 10px;
                }
                .pdf-viewer-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .pdf-viewer-container::-webkit-scrollbar-thumb {
                    background: #667eea;
                    border-radius: 10px;
                }
                .pdf-viewer-container::-webkit-scrollbar-thumb:hover {
                    background: #5568d3;
                }
                .pdf-page {
                    background: white;
                    padding: 60px;
                    margin: 15px 0;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    min-height: 600px;
                    page-break-after: always;
                    position: relative;
                }
                .pdf-page-cover {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), url('/src/assets/B10.jpg');
                    background-size: cover;
                    background-position: center;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .pdf-page-content {
                    background: url('/src/assets/B10.jpg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .pdf-page-content::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.97);
                    border-radius: 8px;
                }
                .pdf-page-content > * {
                    position: relative;
                    z-index: 1;
                }
                .pdf-title-main {
                    font-size: 56px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    letter-spacing: 2px;
                }
                .pdf-subtitle-main {
                    font-size: 32px;
                    font-weight: 600;
                    margin-bottom: 40px;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
                }
                .pdf-title-secondary {
                    font-size: 18px;
                    line-height: 1.6;
                    opacity: 0.95;
                    max-width: 600px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                }
                .pdf-section-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e40af;
                    margin-bottom: 30px;
                    text-transform: uppercase;
                }
                .pdf-card-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin: 30px 0;
                }
                .pdf-card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 8px;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .pdf-card-number {
                    font-size: 64px;
                    font-weight: 700;
                    margin-bottom: 15px;
                }
                .pdf-card-text {
                    font-size: 14px;
                    line-height: 1.5;
                }
                .pdf-list {
                    list-style: none;
                    padding: 0;
                    margin: 30px 0;
                }
                .pdf-list-item {
                    font-size: 18px;
                    padding: 15px 0 15px 40px;
                    position: relative;
                    border-bottom: 1px solid #e5e7eb;
                }
                .pdf-list-item::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #667eea;
                    font-size: 32px;
                    line-height: 1;
                }
                .pdf-text-block {
                    background: #f8fafc;
                    border-left: 4px solid #667eea;
                    padding: 20px 25px;
                    margin: 20px 0;
                    font-size: 15px;
                    line-height: 1.7;
                }
                .pdf-highlight-box {
                    background: #eff6ff;
                    border: 2px solid #3b82f6;
                    border-radius: 8px;
                    padding: 25px;
                    margin: 25px 0;
                    font-size: 14px;
                    line-height: 1.7;
                }
                .pdf-case-study-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #1e40af;
                    margin-bottom: 20px;
                }
                .pdf-story-text {
                    font-size: 15px;
                    line-height: 1.8;
                    color: #374151;
                    margin-bottom: 15px;
                    text-align: justify;
                }
                .pdf-workflow {
                    text-align: center;
                    font-size: 18px;
                    font-weight: 700;
                    color: #667eea;
                    margin: 30px 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 8px;
                }
                .pdf-norm-box {
                    background: #fef3c7;
                    border: 3px solid #f59e0b;
                    border-radius: 8px;
                    padding: 25px;
                    margin: 25px 0;
                    font-size: 14px;
                    line-height: 1.7;
                }
                .pdf-norm-title {
                    font-weight: 700;
                    color: #92400e;
                    margin-bottom: 10px;
                    font-size: 15px;
                }
                @media (max-width: 768px) {
                    .pdf-card-container {
                        grid-template-columns: 1fr;
                    }
                    .pdf-page {
                        padding: 30px;
                    }
                    .pdf-title-main {
                        font-size: 36px;
                    }
                }
            </style>

            <!-- PAGE 1: COUVERTURE -->
            <div class="pdf-page pdf-page-cover">
                <div class="pdf-title-main">E-AUDIT PRO 2.0</div>
                <div class="pdf-subtitle-main">GUIDE PRATIQUE</div>
                <div class="pdf-title-secondary">
                    Norme 9.4 Plan d'audit interne- Pourquoi votre plan annuel d'audit ne couvre pas exhaustivement les risques
                </div>
            </div>

            <!-- PAGE 2: SOMMAIRE -->
            <div class="pdf-page pdf-page-content">
                <div class="pdf-section-title">SOMMAIRE</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px;">
                    <div>
                        <h3 style="font-size: 24px; font-weight: 700; color: #1e40af; margin-bottom: 20px;">Sommaire détaillé</h3>
                        <ul class="pdf-list">
                            <li class="pdf-list-item">Etude de cas - P4</li>
                            <li class="pdf-list-item">Méthode manuelle - P11</li>
                            <li class="pdf-list-item">Méthode automatisée -P20</li>
                            <li class="pdf-list-item">Offre logicielle - P27</li>
                            <li class="pdf-list-item">Contact -P29</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 style="font-size: 24px; font-weight: 700; color: #1e40af; margin-bottom: 20px;">Avant-propos</h3>
                        <div class="pdf-text-block">
                            Ce guide pratique vous explique comment construire un univers d'audit robuste, conformément à la Norme 9.4.
                            <br><br>
                            Vous apprendrez à utiliser la revue documentaire pour identifier tous les objets auditables pertinents.
                        </div>
                    </div>
                </div>
            </div>

            <!-- PAGE 3: ETUDE DE CAS - INTRODUCTION -->
            <div class="pdf-page pdf-page-content">
                <div class="pdf-case-study-title">ETUDE DE CAS – Bahi Legre, RESPONSABLE AUDIT INTERNE</div>
                
                <div class="pdf-workflow">
                    RISQUES → SCENARIO → ECART
                </div>

                <div class="pdf-card-container">
                    <div class="pdf-card">
                        <div class="pdf-card-number">1</div>
                        <div class="pdf-card-text">
                            Un programme de travail constitue les travaux d'audit à accomplir pour atteindre les objectifs d'audit
                        </div>
                    </div>
                    <div class="pdf-card">
                        <div class="pdf-card-number">2</div>
                        <div class="pdf-card-text">
                            Les objectifs d'audit de la mission et les risques associés doivent être annexés à tout programme de travail. Les objectifs d'audit sont des sous-thématiques de la thématique globale de mission.
                        </div>
                    </div>
                    <div class="pdf-card">
                        <div class="pdf-card-number">3</div>
                        <div class="pdf-card-text">
                            Les objectifs d'audit sont des sous-thématiques de la thématique globale de mission.
                        </div>
                    </div>
                </div>
            </div>

            <!-- PAGE 4: ETUDE DE CAS - PARTIE 1 -->
            <div class="pdf-page pdf-page-content">
                <div class="pdf-case-study-title">ETUDE DE CAS – Bahi Legre (1/2)</div>
                
                <div class="pdf-story-text">
                    <strong>Lundi, 16h.</strong> Bahi Legre, Responsable de l'Audit Interne, était fatigué, mais soulagé. Sur son écran, la version finale du Plan d'Audit Annuel, prête à être présentée au Comité d'Audit le lendemain. Il avait personnellement supervisé son élaboration.
                </div>

                <div class="pdf-story-text">
                    Son équipe avait passé les dernières semaines à analyser les rapports d'audit interne des trois années précédentes.
                </div>

                <div class="pdf-highlight-box">
                    <div class="pdf-story-text">
                        <strong>Le lendemain.</strong> Bahi attendait l'approbation. Le Président du Comité, prit la parole, avec des mots durs. "Monsieur Legre, en comparant votre proposition avec le rapport de nos Commissaires aux Comptes de l'année N-1, que j'ai ici, je constate une divergence inquiétante."
                    </div>

                    <div class="pdf-story-text" style="margin-top: 15px;">
                        "Votre plan ne couvre absolument pas 40% des risques élevés et des faiblesses significatives que le CAC a pourtant clairement signalés."
                    </div>
                </div>
            </div>

            <!-- PAGE 5: ETUDE DE CAS - PARTIE 2 -->
            <div class="pdf-page pdf-page-content">
                <div class="pdf-case-study-title">ETUDE DE CAS – Bahi Legre (2/2)</div>
                
                <div class="pdf-story-text">
                    <strong>De retour,</strong> Le plan d'audit, sur son bureau, était comme une preuve d'incompétence. La question du Président du Comité tournait en boucle dans son esprit.
                </div>

                <div class="pdf-highlight-box" style="background: #fee2e2; border-color: #dc2626;">
                    <div class="pdf-story-text">
                        Comment avons-nous pu définir notre univers d'audit en ignorant une source d'information externe aussi cruciale que les risques du CAC ?
                    </div>
                    <div class="pdf-story-text">
                        Comment garantir la pertinence de notre plan si notre revue documentaire n'a pas été exhaustive ?
                    </div>
                </div>

                <div class="pdf-text-block" style="background: #dbeafe; border-color: #2563eb;">
                    La publication des nouvelles normes du CRIPP par l'IIA en janvier 2024, avec une entrée en vigueur en janvier 2025, renforce l'exigence d'une planification de l'audit basée sur une évaluation exhaustive des risques, elle-même fondée sur un univers d'audit complet.
                </div>
            </div>

            <!-- PAGE 6: NORMES -->
            <div class="pdf-page pdf-page-content">
                <div class="pdf-case-study-title">ETUDE DE CAS – Bahi Legre (Normes)</div>
                
                <div class="pdf-norm-box">
                    <div class="pdf-norm-title">Norme 9.4 Plan d'audit interne:</div>
                    <p style="margin: 0;">
                        « Le responsable de l'audit interne doit fonder le plan d'audit interne sur une évaluation documentée des stratégies, des objectifs et des risques de l'organisation. [...] Pour établir le plan d'audit interne, il est possible de catégoriser les unités à auditer visant à définir un univers d'audit. »
                    </p>
                </div>

                <div class="pdf-norm-box" style="background: #e0f2fe; border-color: #0284c7;">
                    <div class="pdf-norm-title" style="color: #075985;">Norme 13.2 Évaluation des risques dans le cadre de la mission:</div>
                    <p style="margin: 0;">
                        « Les auditeurs internes doivent comprendre l'activité examinée pour évaluer les risques y afférents. [...] Pour une compréhension appropriée, les auditeurs internes doivent identifier et réunir des informations fiables, pertinentes et suffisantes. »
                    </p>
                </div>
            </div>

        </div>
    `;

    /**
     * Fonction de débogage
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
     * Trouve le conteneur d'injection
     */
    function findInjectionTarget() {
        console.log('🎯 Recherche du conteneur...');

        for (const selector of CONFIG.selectors.filter(s => s.includes('table'))) {
            const tables = document.querySelectorAll(selector);
            if (tables.length > 0) {
                const lastTable = tables[tables.length - 1];
                let parent = lastTable.closest('div');
                if (parent) {
                    console.log('✅ Conteneur trouvé');
                    return parent;
                }
                return lastTable.parentElement;
            }
        }

        for (const selector of CONFIG.selectors.filter(s => s.includes('div'))) {
            const divs = document.querySelectorAll(selector);
            if (divs.length > 0) {
                return divs[divs.length - 1];
            }
        }

        console.log('⚠️ Utilisation du body');
        return document.body;
    }

    /**
     * Injecte le template
     */
    function injectTemplate(container) {
        if (!container) {
            console.error('❌ Aucun conteneur');
            return false;
        }

        if (container.querySelector('.pdf-viewer-container')) {
            console.log('ℹ️ Template déjà présent');
            return false;
        }

        try {
            const temp = document.createElement('div');
            temp.innerHTML = HTML_TEMPLATE;
            const templateContent = temp.firstElementChild;
            container.appendChild(templateContent);
            console.log('✅ Template PDF injecté !');
            return true;
        } catch (error) {
            console.error('❌ Erreur:', error);
            return false;
        }
    }

    /**
     * Exécution principale
     */
    function execute() {
        console.log(`\n🔄 Tentative ${retryCount + 1}/${CONFIG.maxRetries}`);
        
        debugElements();
        const target = findInjectionTarget();
        const success = injectTemplate(target);

        if (!success && retryCount < CONFIG.maxRetries) {
            retryCount++;
            setTimeout(execute, CONFIG.retryInterval);
        } else if (success) {
            console.log('🎉 Injection réussie !');
        }
    }

    /**
     * Initialisation
     */
    function initialize() {
        console.log('⚙️ Initialisation...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(execute, CONFIG.injectionDelay);
            });
        } else {
            setTimeout(execute, CONFIG.injectionDelay);
        }
    }

    /**
     * Observer
     */
    function setupObserver() {
        const observer = new MutationObserver((mutations) => {
            const hasNewTable = mutations.some(mutation => 
                Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && (
                        node.tagName === 'TABLE' || 
                        node.querySelector('table')
                    )
                )
            );

            if (hasNewTable) {
                console.log('📊 Nouvelle table détectée !');
                retryCount = 0;
                execute();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Démarrage
    initialize();
    setupObserver();

    // API globale
    window.ClaraverseHTML = {
        inject: execute,
        debug: debugElements,
        version: '3.0.0-PDF'
    };

    console.log('✅ Script E-AUDIT PRO 2.0 PDF initialisé');

})();