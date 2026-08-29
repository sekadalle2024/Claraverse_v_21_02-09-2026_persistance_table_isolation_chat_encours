/**
 * Script d'injection HTML pour Claraverse - Version PDF E-AUDIT PRO 2.0 - Accordéon avec Tables
 * Nom : html_template.js
 * Reproduction fidèle du PDF Guide Pratique en menu accordéon avec tables à une ligne/une colonne
 */
(function () {
    'use strict';

    console.log('🚀 Script HTML Template Claraverse - PDF E-AUDIT PRO 2.0 Accordéon Tables');

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
     * Template HTML reproduisant le PDF E-AUDIT PRO 2.0 en accordéon avec tables
     */
    const HTML_TEMPLATE = `
        <div class="accordion-container" style="margin: 40px auto; max-width: 900px; background: #e5e7eb; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            <style>
                .accordion-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-height: 800px;
                    overflow-y: auto;
                    scroll-behavior: smooth;
                }
                .accordion-container::-webkit-scrollbar {
                    width: 10px;
                }
                .accordion-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .accordion-container::-webkit-scrollbar-thumb {
                    background: #667eea;
                    border-radius: 10px;
                }
                .accordion-container::-webkit-scrollbar-thumb:hover {
                    background: #5568d3;
                }
                details {
                    margin-bottom: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    overflow: hidden;
                    background: white;
                }
                details[open] {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                summary {
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 18px;
                    list-style: none;
                    outline: none;
                    transition: background 0.3s ease;
                }
                summary:hover {
                    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
                }
                summary::-webkit-details-marker {
                    display: none;
                }
                summary::before {
                    content: '▶';
                    display: inline-block;
                    margin-right: 10px;
                    transition: transform 0.3s ease;
                }
                details[open] summary::before {
                    transform: rotate(90deg);
                }
                .accordion-content {
                    padding: 0 20px 20px;
                    background: #f8fafc;
                }
                .content-table {
                    min-width: 100%;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    overflow: hidden;
                    margin-bottom: 15px;
                    background: white;
                }
                .content-table.dark {
                    border-color: #374151;
                    background: #1f2937;
                }
                .content-table td {
                    padding: 15px;
                    vertical-align: top;
                    border: none;
                }
                .cover-table td {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), url('/src/assets/B10.jpg');
                    background-size: cover;
                    background-position: center;
                    color: white;
                    text-align: center;
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .content-table.cover-table td::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.97);
                    border-radius: 0.5rem;
                }
                .content-table.cover-table td > * {
                    position: relative;
                    z-index: 1;
                }
                .title-main {
                    font-size: 48px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    letter-spacing: 2px;
                }
                .subtitle-main {
                    font-size: 28px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
                }
                .title-secondary {
                    font-size: 16px;
                    line-height: 1.6;
                    opacity: 0.95;
                    max-width: 500px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                }
                .section-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e40af;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                }
                .card-table td {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    min-height: 150px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .card-number {
                    font-size: 48px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                .card-text {
                    font-size: 12px;
                    line-height: 1.4;
                }
                .list-table td {
                    padding-left: 30px;
                    position: relative;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 16px;
                }
                .list-table td::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #667eea;
                    font-size: 24px;
                    line-height: 1;
                }
                .text-block-table td {
                    background: #f1f5f9;
                    border-left: 4px solid #667eea;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .highlight-table td {
                    background: #eff6ff;
                    border: 2px solid #3b82f6;
                    border-radius: 0.5rem;
                    font-size: 13px;
                    line-height: 1.6;
                }
                .case-title-table td {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e40af;
                    margin-bottom: 15px;
                }
                .story-text-table td {
                    font-size: 14px;
                    line-height: 1.7;
                    color: #374151;
                    margin-bottom: 10px;
                    text-align: justify;
                }
                .workflow-table td {
                    text-align: center;
                    font-size: 16px;
                    font-weight: 700;
                    color: white;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 0.5rem;
                    padding: 15px;
                    margin: 20px 0;
                }
                .norm-table td {
                    background: #fef3c7;
                    border: 3px solid #f59e0b;
                    border-radius: 0.5rem;
                    font-size: 13px;
                    line-height: 1.6;
                }
                .norm-title {
                    font-weight: 700;
                    color: #92400e;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .h3-table td {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e40af;
                    margin-bottom: 15px;
                }
                .grid-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-top: 30px;
                }
                @media (max-width: 768px) {
                    .title-main {
                        font-size: 32px;
                    }
                    .grid-wrapper {
                        grid-template-columns: 1fr;
                    }
                    summary {
                        padding: 15px;
                        font-size: 16px;
                    }
                }
                .dark .accordion-container {
                    background: #1f2937;
                    color: #f9fafb;
                }
                .dark details {
                    border-color: #4b5563;
                    background: #374151;
                }
                .dark .accordion-content {
                    background: #4b5563;
                }
                .dark .content-table {
                    border-color: #4b5563;
                }
                .dark .text-block-table td {
                    background: #1f2937;
                    border-color: #60a5fa;
                }
                .dark .highlight-table td {
                    background: #1e3a8a;
                    border-color: #60a5fa;
                }
                .dark .norm-table td {
                    background: #78350f;
                    border-color: #d97706;
                }
                .dark .story-text-table td {
                    color: #f9fafb;
                }
            </style>

            <!-- ACCORDÉON ITEM 1: COUVERTURE -->
            <details>
                <summary>Couverture - E-AUDIT PRO 2.0</summary>
                <div class="accordion-content">
                    <table class="content-table cover-table"><tbody><tr><td class="title-main">E-AUDIT PRO 2.0</td></tr></tbody></table>
                    <table class="content-table cover-table"><tbody><tr><td class="subtitle-main">GUIDE PRATIQUE</td></tr></tbody></table>
                    <table class="content-table cover-table"><tbody><tr><td class="title-secondary">Norme 9.4 Plan d'audit interne- Pourquoi votre plan annuel d'audit ne couvre pas exhaustivement les risques</td></tr></tbody></table>
                </div>
            </details>

            <!-- ACCORDÉON ITEM 2: SOMMAIRE -->
            <details>
                <summary>Sommaire</summary>
                <div class="accordion-content">
                    <table class="content-table"><tbody><tr><td class="section-title">SOMMAIRE</td></tr></tbody></table>
                    <div class="grid-wrapper">
                        <div>
                            <table class="content-table h3-table"><tbody><tr><td>Sommaire détaillé</td></tr></tbody></table>
                            <table class="content-table list-table"><tbody><tr><td>Etude de cas - P4</td></tr></tbody></table>
                            <table class="content-table list-table"><tbody><tr><td>Méthode manuelle - P11</td></tr></tbody></table>
                            <table class="content-table list-table"><tbody><tr><td>Méthode automatisée -P20</td></tr></tbody></table>
                            <table class="content-table list-table"><tbody><tr><td>Offre logicielle - P27</td></tr></tbody></table>
                            <table class="content-table list-table"><tbody><tr><td>Contact -P29</td></tr></tbody></table>
                        </div>
                        <div>
                            <table class="content-table h3-table"><tbody><tr><td>Avant-propos</td></tr></tbody></table>
                            <table class="content-table text-block-table"><tbody><tr><td>Ce guide pratique vous explique comment construire un univers d'audit robuste, conformément à la Norme 9.4.<br><br>Vous apprendrez à utiliser la revue documentaire pour identifier tous les objets auditables pertinents.</td></tr></tbody></table>
                        </div>
                    </div>
                </div>
            </details>

            <!-- ACCORDÉON ITEM 3: ETUDE DE CAS - INTRODUCTION -->
            <details>
                <summary>Etude de cas - Introduction</summary>
                <div class="accordion-content">
                    <table class="content-table case-title-table"><tbody><tr><td>ETUDE DE CAS – Bahi Legre, RESPONSABLE AUDIT INTERNE</td></tr></tbody></table>
                    <table class="content-table workflow-table"><tbody><tr><td>RISQUES → SCENARIO → ECART</td></tr></tbody></table>
                    <table class="content-table card-table"><tbody><tr><td><div class="card-number">1</div><div class="card-text">Un programme de travail constitue les travaux d'audit à accomplir pour atteindre les objectifs d'audit</div></td></tr></tbody></table>
                    <table class="content-table card-table"><tbody><tr><td><div class="card-number">2</div><div class="card-text">Les objectifs d'audit de la mission et les risques associés doivent être annexés à tout programme de travail. Les objectifs d'audit sont des sous-thématiques de la thématique globale de mission.</div></td></tr></tbody></table>
                    <table class="content-table card-table"><tbody><tr><td><div class="card-number">3</div><div class="card-text">Les objectifs d'audit sont des sous-thématiques de la thématique globale de mission.</div></td></tr></tbody></table>
                </div>
            </details>

            <!-- ACCORDÉON ITEM 4: ETUDE DE CAS - PARTIE 1 -->
            <details>
                <summary>Etude de cas – Bahi Legre (1/2)</summary>
                <div class="accordion-content">
                    <table class="content-table case-title-table"><tbody><tr><td>ETUDE DE CAS – Bahi Legre (1/2)</td></tr></tbody></table>
                    <table class="content-table story-text-table"><tbody><tr><td><strong>Lundi, 16h.</strong> Bahi Legre, Responsable de l'Audit Interne, était fatigué, mais soulagé. Sur son écran, la version finale du Plan d'Audit Annuel, prête à être présentée au Comité d'Audit le lendemain. Il avait personnellement supervisé son élaboration.</td></tr></tbody></table>
                    <table class="content-table story-text-table"><tbody><tr><td>Son équipe avait passé les dernières semaines à analyser les rapports d'audit interne des trois années précédentes.</td></tr></tbody></table>
                    <table class="content-table highlight-table"><tbody><tr><td><strong>Le lendemain.</strong> Bahi attendait l'approbation. Le Président du Comité, prit la parole, avec des mots durs. "Monsieur Legre, en comparant votre proposition avec le rapport de nos Commissaires aux Comptes de l'année N-1, que j'ai ici, je constate une divergence inquiétante."<br><br>"Votre plan ne couvre absolument pas 40% des risques élevés et des faiblesses significatives que le CAC a pourtant clairement signalés."</td></tr></tbody></table>
                </div>
            </details>

            <!-- ACCORDÉON ITEM 5: ETUDE DE CAS - PARTIE 2 -->
            <details>
                <summary>Etude de cas – Bahi Legre (2/2)</summary>
                <div class="accordion-content">
                    <table class="content-table case-title-table"><tbody><tr><td>ETUDE DE CAS – Bahi Legre (2/2)</td></tr></tbody></table>
                    <table class="content-table story-text-table"><tbody><tr><td><strong>De retour,</strong> Le plan d'audit, sur son bureau, était comme une preuve d'incompétence. La question du Président du Comité tournait en boucle dans son esprit.</td></tr></tbody></table>
                    <table class="content-table highlight-table" style="background: #fee2e2; border-color: #dc2626;"><tbody><tr><td>Comment avons-nous pu définir notre univers d'audit en ignorant une source d'information externe aussi cruciale que les risques du CAC ?<br><br>Comment garantir la pertinence de notre plan si notre revue documentaire n'a pas été exhaustive ?</td></tr></tbody></table>
                    <table class="content-table text-block-table" style="background: #dbeafe; border-color: #2563eb;"><tbody><tr><td>La publication des nouvelles normes du CRIPP par l'IIA en janvier 2024, avec une entrée en vigueur en janvier 2025, renforce l'exigence d'une planification de l'audit basée sur une évaluation exhaustive des risques, elle-même fondée sur un univers d'audit complet.</td></tr></tbody></table>
                </div>
            </details>

            <!-- ACCORDÉON ITEM 6: NORMES -->
            <details open>
                <summary>Normes (Ouvert par défaut)</summary>
                <div class="accordion-content">
                    <table class="content-table case-title-table"><tbody><tr><td>ETUDE DE CAS – Bahi Legre (Normes)</td></tr></tbody></table>
                    <table class="content-table norm-table"><tbody><tr><td><div class="norm-title">Norme 9.4 Plan d'audit interne:</div>« Le responsable de l'audit interne doit fonder le plan d'audit interne sur une évaluation documentée des stratégies, des objectifs et des risques de l'organisation. [...] Pour établir le plan d'audit interne, il est possible de catégoriser les unités à auditer visant à définir un univers d'audit. »</td></tr></tbody></table>
                    <table class="content-table norm-table" style="background: #e0f2fe; border-color: #0284c7;"><tbody><tr><td><div class="norm-title" style="color: #075985;">Norme 13.2 Évaluation des risques dans le cadre de la mission:</div>« Les auditeurs internes doivent comprendre l'activité examinée pour évaluer les risques y afférents. [...] Pour une compréhension appropriée, les auditeurs internes doivent identifier et réunir des informations fiables, pertinentes et suffisantes. »</td></tr></tbody></table>
                </div>
            </details>
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
     * Injecte le template accordéon avec tables (remplace si table présente)
     */
    function injectTemplate(container) {
        if (!container) {
            console.error('❌ Aucun conteneur');
            return false;
        }

        if (container.querySelector('.accordion-container')) {
            console.log('ℹ️ Accordéon déjà présent');
            return false;
        }

        try {
            // Si une table est dans le conteneur, la remplacer par l'accordéon
            const existingTable = container.querySelector('table');
            if (existingTable) {
                existingTable.remove();
                console.log('🗑️ Table existante supprimée');
            }

            const temp = document.createElement('div');
            temp.innerHTML = HTML_TEMPLATE;
            const templateContent = temp.firstElementChild;
            container.appendChild(templateContent);
            console.log('✅ Accordéon avec tables PDF injecté !');
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
            console.log('🎉 Injection accordéon avec tables réussie !');
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
        version: '3.0.0-ACCORDÉON-TABLES'
    };

    console.log('✅ Script E-AUDIT PRO 2.0 Accordéon Tables initialisé');

})();