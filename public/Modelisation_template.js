/**
 * Modelisation_template.js
 * Script d'injection de templates dans les pages de chat Claraverse
 * Détecte les tables avec critères spécifiques et injecte le template approprié
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURATION ET CONSTANTES
    // ============================================

    const CONFIG = {
        selectors: {
            // Sélecteur simplifié - cherche toutes les tables
            baseTables: 'table',
            chatContainer: '.chat-messages-container, .messages-container, [class*="message"]'
        },
        keywords: {
            flowise: ['Flowise', 'FLOWISE', 'flowise'],
            partie1: ['PARTIE 1', 'partie 1', 'Partie 1'],
            partie2: ['PARTIE 2', 'partie 2', 'Partie 2'],
            partie3: ['PARTIE 3', 'partie 3', 'Partie 3'],
            partie4: ['PARTIE 4', 'partie 4', 'Partie 4'],
            partie5: ['PARTIE 5', 'partie 5', 'Partie 5']
        },
        n8nEndpoint: 'https://0ngdph0y.rpcld.co/webhook/template',
        debug: true // Activer les logs de debug
    };

    // ============================================
    // TEMPLATES
    // ============================================

    const TEMPLATES = {
        // Template Alpha - Format PDF avec pages
        alpha: function (data) {
            return `
                <div class="pdf-viewer-container" style="margin: 40px auto; max-width: 900px; background: #e5e7eb; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <style>
                        .pdf-viewer-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-height: 800px; overflow-y: auto; scroll-behavior: smooth; }
                        .pdf-viewer-container::-webkit-scrollbar { width: 10px; }
                        .pdf-viewer-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                        .pdf-viewer-container::-webkit-scrollbar-thumb { background: #667eea; border-radius: 10px; }
                        .pdf-page { background: white; padding: 60px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 600px; }
                        .pdf-page-cover { background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                        .pdf-title-main { font-size: 56px; font-weight: 700; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
                        .pdf-subtitle-main { font-size: 32px; font-weight: 600; margin-bottom: 40px; }
                    </style>
                    <div class="pdf-page pdf-page-cover">
                        <div class="pdf-title-main">E-AUDIT PRO 2.0</div>
                        <div class="pdf-subtitle-main">GUIDE PRATIQUE</div>
                    </div>
                </div>
            `;
        },

        // Template Beta - Format Accordéon
        beta: function (data) {
            const sections = Array.isArray(data) ? data : [data];
            let accordionHTML = '';

            sections.forEach((section, index) => {
                const isActive = index === 0 ? 'active' : '';
                const maxHeight = index === 0 ? 'fit-content' : '0';

                accordionHTML += `
                    <button class="accordion-header ${isActive}">${section.title || 'Section ' + (index + 1)}</button>
                    <div class="accordion-panel" style="max-height: ${maxHeight};">
                        <div class="pdf-page pdf-page-content">
                            ${section.content || ''}
                        </div>
                    </div>
                `;
            });

            return `
                <div class="accordion-container" style="margin: 20px auto; max-width: 900px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <style>
                        .accordion-header { background-color: #f1f5f9; color: #1e3a8a; cursor: pointer; padding: 18px 25px; width: 100%; text-align: left; border: none; border-top: 1px solid #cbd5e1; outline: none; font-size: 18px; font-weight: 600; transition: background-color 0.3s ease; position: relative; }
                        .accordion-header:hover, .accordion-header.active { background-color: #e2e8f0; }
                        .accordion-header.active { background-color: #667eea; color: white; }
                        .accordion-header::after { content: '＋'; font-size: 20px; position: absolute; right: 25px; top: 50%; transform: translateY(-50%); }
                        .accordion-header.active::after { content: '－'; }
                        .accordion-panel { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; background-color: white; }
                    </style>
                    ${accordionHTML}
                </div>
            `;
        }
    };

    // ============================================
    // UTILITAIRES
    // ============================================

    /**
     * Vérifie si une table contient un des mots-clés spécifiés
     */
    function tableContainsKeywords(table, keywords) {
        const tableText = table.textContent || '';
        return keywords.some(keyword => tableText.includes(keyword));
    }

    /**
     * Trouve la dernière div contenant des tables dans la page de chat
     */
    function findLastDivWithTables() {
        const allDivs = document.querySelectorAll('div');
        let lastDivWithTables = null;

        allDivs.forEach(div => {
            const tables = div.querySelectorAll('table');
            if (tables.length > 0) {
                lastDivWithTables = div;
            }
        });

        return lastDivWithTables;
    }

    /**
     * Détecte le type de contenu basé sur les critères de table
     * Cherche uniquement dans les tables qui contiennent "Flowise"
     */
    function detectContentType(tables) {
        // Filtrer d'abord les tables qui contiennent "Flowise"
        const flowiseTables = Array.from(tables).filter(table =>
            tableContainsKeywords(table, CONFIG.keywords.flowise)
        );

        if (CONFIG.debug) {
            console.log(`🔍 ${flowiseTables.length} table(s) Flowise à analyser`);
        }

        // Chercher le type PARTIE dans les tables Flowise uniquement
        for (let table of flowiseTables) {
            const text = table.textContent;

            if (CONFIG.debug) {
                console.log(`   Analyse table Flowise: ${text.substring(0, 50)}...`);
            }

            // Vérifier PARTIE 1
            if (tableContainsKeywords(table, CONFIG.keywords.partie1)) {
                if (CONFIG.debug) console.log('   ✅ PARTIE 1 détectée');
                return { type: 'PARTIE1', table };
            }
            // Vérifier PARTIE 2
            if (tableContainsKeywords(table, CONFIG.keywords.partie2)) {
                if (CONFIG.debug) console.log('   ✅ PARTIE 2 détectée');
                return { type: 'PARTIE2', table };
            }
            // Vérifier PARTIE 3
            if (tableContainsKeywords(table, CONFIG.keywords.partie3)) {
                if (CONFIG.debug) console.log('   ✅ PARTIE 3 détectée');
                return { type: 'PARTIE3', table };
            }
            // Vérifier PARTIE 4
            if (tableContainsKeywords(table, CONFIG.keywords.partie4)) {
                if (CONFIG.debug) console.log('   ✅ PARTIE 4 détectée');
                return { type: 'PARTIE4', table };
            }
            // Vérifier PARTIE 5
            if (tableContainsKeywords(table, CONFIG.keywords.partie5)) {
                if (CONFIG.debug) console.log('   ✅ PARTIE 5 détectée');
                return { type: 'PARTIE5', table };
            }
        }

        if (CONFIG.debug) console.log('   ⚠️ Aucun type PARTIE détecté dans les tables Flowise');
        return null;
    }

    /**
     * Fetch des données depuis l'endpoint n8n
     */
    async function fetchN8nData(command, processus) {
        try {
            const response = await fetch(CONFIG.n8nEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: `[Command] = ${command} - [Processus] = ${processus}`
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors du fetch n8n:', error);
            return null;
        }
    }

    // ============================================
    // GESTIONNAIRES DE CAS
    // ============================================

    /**
     * Case 1: PARTIE 1 - Document DOCX statique
     */
    async function handleCase1(targetDiv) {
        console.log('📄 Case 1: Chargement PARTIE 1 (Document DOCX)');

        // Données statiques du document PARTIE 1
        const staticData = {
            title: 'E-AUDIT PRO 2.0',
            subtitle: 'GUIDE PRATIQUE',
            description: 'Norme 9.4 Plan d\'audit interne'
        };

        const templateHTML = TEMPLATES.alpha(staticData);
        injectTemplate(targetDiv, templateHTML);
    }

    /**
     * Case 2: PARTIE 2 - Données JSON statiques
     */
    async function handleCase2(targetDiv) {
        console.log('📊 Case 2: Chargement PARTIE 2 (JSON statique)');

        // Données JSON statiques
        const jsonData = {
            "Sous-section A": "Définition du Plan d'Audit Basé sur les Risques",
            "Sub-items": [
                {
                    "Sub-item A1": "Principes Fondamentaux",
                    "Items": [
                        {
                            "Item A1.1": "Définition Essentielle",
                            "Rubrique": "quoi",
                            "Contenu": "Le plan d'audit basé sur les risques..."
                        }
                    ]
                }
            ]
        };

        const sections = transformJsonToSections(jsonData);
        const templateHTML = TEMPLATES.beta(sections);
        injectTemplate(targetDiv, templateHTML);
        initializeAccordion();
    }

    /**
     * Case 3: PARTIE 3 - Données JSON dynamiques via n8n
     */
    async function handleCase3(targetDiv) {
        console.log('🌐 Case 3: Chargement PARTIE 3 (JSON dynamique n8n)');

        const data = await fetchN8nData('/Programme de travail', 'facturation des ventes');

        if (data) {
            const sections = transformJsonToSections(data);
            const templateHTML = TEMPLATES.beta(sections);
            injectTemplate(targetDiv, templateHTML);
            initializeAccordion();
        } else {
            console.warn('⚠️ Endpoint n8n non accessible, utilisation des données de fallback');

            // Données de fallback si l'endpoint n'est pas accessible
            const fallbackData = {
                "Sous-section A": "Plan d'Audit Basé sur les Risques (Fallback)",
                "Sub-items": [
                    {
                        "Sub-item A1": "Principes Fondamentaux",
                        "Items": [
                            {
                                "Item A1.1": "Définition",
                                "Rubrique": "quoi",
                                "Contenu": "Le plan d'audit basé sur les risques est un processus systématique qui aligne les missions d'audit interne sur les risques les plus significatifs de l'organisation."
                            }
                        ]
                    }
                ]
            };

            const sections = transformJsonToSections(fallbackData);
            const templateHTML = TEMPLATES.beta(sections);
            injectTemplate(targetDiv, templateHTML);
            initializeAccordion();
        }
    }

    /**
     * Case 4: PARTIE 4 - Document Word via n8n
     */
    async function handleCase4(targetDiv) {
        console.log('📝 Case 4: Chargement PARTIE 4 (Document Word via n8n)');

        const data = await fetchN8nData('/Programme de travail', 'facturation des ventes');

        if (data && data.data && data.data['Etape mission - Programme']) {
            const sections = transformWorkflowToSections(data.data['Etape mission - Programme']);
            const templateHTML = TEMPLATES.beta(sections);
            injectTemplate(targetDiv, templateHTML);
            initializeAccordion();
        } else {
            console.error('Impossible de charger les données pour PARTIE 4');
        }
    }

    /**
     * Case 5: PARTIE 5 - Document PDF statique
     */
    async function handleCase5(targetDiv) {
        console.log('📑 Case 5: Chargement PARTIE 5 (Document PDF)');

        // Données statiques du PDF
        const pdfData = {
            title: 'E-AUDIT PRO 2.0',
            subtitle: 'DOCUMENTATION COMPLÈTE'
        };

        const sections = [
            { title: 'Couverture', content: '<h1>E-AUDIT PRO 2.0</h1>' },
            { title: 'Sommaire', content: '<ul><li>Introduction</li><li>Méthodologie</li></ul>' }
        ];

        const templateHTML = TEMPLATES.beta(sections);
        injectTemplate(targetDiv, templateHTML);
        initializeAccordion();
    }

    // ============================================
    // TRANSFORMATEURS DE DONNÉES
    // ============================================

    /**
     * Transforme les données JSON en sections pour l'accordéon
     */
    function transformJsonToSections(jsonData) {
        const sections = [];

        if (jsonData['Sub-items']) {
            jsonData['Sub-items'].forEach(subItem => {
                const subItemKey = Object.keys(subItem).find(k => k.startsWith('Sub-item'));
                const title = subItem[subItemKey];

                let content = `<h3 class="pdf-section-title">${title}</h3>`;

                if (subItem.Items) {
                    subItem.Items.forEach(item => {
                        const itemKey = Object.keys(item).find(k => k.startsWith('Item'));
                        content += `
                            <div class="pdf-text-block">
                                <strong>${item[itemKey]}</strong>
                                <p>${item.Contenu || ''}</p>
                            </div>
                        `;
                    });
                }

                sections.push({ title, content });
            });
        }

        return sections;
    }

    /**
     * Transforme les données de workflow en sections
     */
    function transformWorkflowToSections(workflowData) {
        const sections = [];

        workflowData.forEach((item, index) => {
            if (item['table 1']) {
                sections.push({
                    title: `Étape: ${item['table 1'].Etape}`,
                    content: `<p>Référence: ${item['table 1'].reference}</p>`
                });
            }

            if (item['table 2']) {
                let tableHTML = '<table class="min-w-full border"><thead><tr>';
                const headers = Object.keys(item['table 2'][0]);
                headers.forEach(h => {
                    tableHTML += `<th class="border px-4 py-2">${h}</th>`;
                });
                tableHTML += '</tr></thead><tbody>';

                item['table 2'].forEach(row => {
                    tableHTML += '<tr>';
                    headers.forEach(h => {
                        tableHTML += `<td class="border px-4 py-2">${row[h] || ''}</td>`;
                    });
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody></table>';

                sections.push({
                    title: 'Points de contrôle',
                    content: tableHTML
                });
            }
        });

        return sections;
    }

    // ============================================
    // INJECTION ET INITIALISATION
    // ============================================

    /**
     * Injecte le template dans la div cible
     */
    function injectTemplate(targetDiv, templateHTML) {
        if (!targetDiv) {
            console.error('Div cible non trouvée');
            return;
        }

        // Créer un conteneur pour le template
        const container = document.createElement('div');
        container.className = 'modelisation-template-container';
        container.innerHTML = templateHTML;

        // Injecter après la dernière table
        targetDiv.appendChild(container);

        console.log('✅ Template injecté avec succès');
    }

    /**
     * Initialise les événements de l'accordéon
     */
    function initializeAccordion() {
        const headers = document.querySelectorAll('.accordion-header');

        headers.forEach(header => {
            header.addEventListener('click', function () {
                // Toggle active class
                this.classList.toggle('active');

                // Get the panel
                const panel = this.nextElementSibling;

                // Toggle panel
                if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                    panel.style.maxHeight = '0';
                } else {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });

        console.log('✅ Accordéon initialisé');
    }

    // ============================================
    // FONCTION PRINCIPALE
    // ============================================

    /**
     * Fonction principale d'exécution
     */
    async function executeModelisation() {
        if (CONFIG.debug) console.log('🚀 Démarrage de Modelisation_template.js');

        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', executeModelisation);
            return;
        }

        // Trouver toutes les tables avec le sélecteur de base
        const tables = document.querySelectorAll(CONFIG.selectors.baseTables);

        if (tables.length === 0) {
            if (CONFIG.debug) console.log('⚠️ Aucune table trouvée');
            return;
        }

        if (CONFIG.debug) console.log(`📊 ${tables.length} table(s) trouvée(s)`);

        // Debug: afficher le contenu de chaque table
        if (CONFIG.debug) {
            tables.forEach((table, i) => {
                const text = table.textContent.substring(0, 100);
                console.log(`   Table ${i + 1}: ${text}...`);
            });
        }

        // Vérifier si les tables contiennent les mots-clés Flowise
        const hasFlowiseKeyword = Array.from(tables).some(table =>
            tableContainsKeywords(table, CONFIG.keywords.flowise)
        );

        if (!hasFlowiseKeyword) {
            if (CONFIG.debug) console.log('⚠️ Aucune table avec mot-clé Flowise trouvée');
            return;
        }

        if (CONFIG.debug) console.log('✅ Table(s) avec mot-clé Flowise détectée(s)');

        // Détecter le type de contenu
        const detection = detectContentType(tables);

        if (!detection) {
            if (CONFIG.debug) console.log('⚠️ Aucun critère de table cible détecté (PARTIE 1-5)');
            return;
        }

        if (CONFIG.debug) console.log(`🎯 Type détecté: ${detection.type}`);

        // Trouver la dernière div contenant des tables
        const targetDiv = findLastDivWithTables();

        if (!targetDiv) {
            console.error('❌ Impossible de trouver la div cible');
            return;
        }

        if (CONFIG.debug) console.log('📍 Div cible trouvée, injection du template...');

        // Vérifier si déjà injecté
        if (targetDiv.querySelector('.modelisation-template-container')) {
            if (CONFIG.debug) console.log('⚠️ Template déjà injecté, skip');
            return;
        }

        // Switch case selon le type détecté
        switch (detection.type) {
            case 'PARTIE1':
                await handleCase1(targetDiv);
                break;
            case 'PARTIE2':
                await handleCase2(targetDiv);
                break;
            case 'PARTIE3':
                await handleCase3(targetDiv);
                break;
            case 'PARTIE4':
                await handleCase4(targetDiv);
                break;
            case 'PARTIE5':
                await handleCase5(targetDiv);
                break;
            default:
                console.log('⚠️ Type non reconnu');
        }
    }

    // ============================================
    // OBSERVATEUR DE MUTATIONS
    // ============================================

    /**
     * Observer les changements dans le DOM pour détecter les nouvelles tables
     */
    function initializeMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldExecute = false;

            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'TABLE' || node.querySelector('table')) {
                                shouldExecute = true;
                            }
                        }
                    });
                }
            });

            if (shouldExecute) {
                console.log('🔄 Nouvelles tables détectées, réexécution...');
                setTimeout(executeModelisation, 500);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('👁️ Observateur de mutations initialisé');
    }

    // ============================================
    // INITIALISATION
    // ============================================

    // Exécution initiale avec délai pour laisser le DOM se charger
    setTimeout(() => {
        executeModelisation();
    }, 2000);

    // Initialiser l'observateur
    initializeMutationObserver();

    // Exposer les fonctions pour usage externe si nécessaire
    window.ModelisationTemplate = {
        execute: executeModelisation,
        detectContentType,
        injectTemplate,
        config: CONFIG
    };

    console.log('✅ Modelisation_template.js chargé et prêt');
    console.log('💡 Pour tester manuellement: window.ModelisationTemplate.execute()');

})();
