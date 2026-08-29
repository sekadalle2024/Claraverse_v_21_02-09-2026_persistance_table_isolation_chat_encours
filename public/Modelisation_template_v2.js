/**
 * Modelisation_template_v2.js
 * Version améliorée : Génère un document séparé pour chaque table Flowise
 */

(function () {
    'use strict';

    const CONFIG = {
        selectors: {
            baseTables: 'table'
        },
        keywords: {
            // Critère table cible actualisé: entêtes "Template", "TEMPLATE", "template"
            template: ['Template', 'TEMPLATE', 'template'],
            partie1: ['PARTIE 1', 'partie 1', 'Partie 1'],
            partie2: ['PARTIE 2', 'partie 2', 'Partie 2'],
            partie3: ['PARTIE 3', 'partie 3', 'Partie 3'],
            partie4: ['PARTIE 4', 'partie 4', 'Partie 4'],
            partie5: ['PARTIE 5', 'partie 5', 'Partie 5'],
            n8n_doc: ['n8n_doc', 'n8n doc'],
            // Case 10: Pandas
            pandas: ['Pandas', 'pandas', 'PANDAS'],
            // Case 11: Chart (D3.js)
            chart: ['Chart', 'chart', 'CHART'],
            // Case 15: Youtube
            youtube: ['Youtube', 'youtube', 'YOUTUBE']
        },
        n8nEndpoint: 'https://barow52161.app.n8n.cloud/webhook/cia_cours_gemini',
        n8nEndpointProgramme: 'https://0ngdph0y.rpcld.co/webhook/template',
        pandasEndpoint: (window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/pandas/analysis/complete',
        googleDrive: {
            clientId: '[VOTRE_GOOGLE_CLIENT_ID]',
            clientSecret: '[VOTRE_GOOGLE_CLIENT_SECRET]Contenu'
        },
        debug: true
    };

    // ============================================
    // TEMPLATES
    // ============================================

    const TEMPLATES = {
        alpha: function (data) {
            return `
                <div class="pdf-viewer-container" style="margin: 40px auto; max-width: 900px; background: #e5e7eb; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <style>
                        .pdf-viewer-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-height: 800px; overflow-y: auto; }
                        .pdf-page { background: white; padding: 60px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 600px; }
                        .pdf-page-cover { background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                        .pdf-title-main { font-size: 56px; font-weight: 700; margin-bottom: 20px; }
                        .pdf-subtitle-main { font-size: 32px; font-weight: 600; margin-bottom: 40px; }
                    </style>
                    <div class="pdf-page pdf-page-cover">
                        <div class="pdf-title-main">E-AUDIT PRO 2.0</div>
                        <div class="pdf-subtitle-main">GUIDE PRATIQUE</div>
                        <div style="font-size: 18px;">Norme 9.4 Plan d'audit interne</div>
                    </div>
                </div>
            `;
        },

        beta: function (sections, coverTitle = '', coverSubtitle = '') {
            let accordionHTML = '';

            // Ajouter la page de couverture si un titre est fourni
            if (coverTitle) {
                accordionHTML += `
                    <button class="accordion-header active">📖 Page de Couverture</button>
                    <div class="accordion-panel" style="max-height: fit-content;">
                        <div class="cover-page" style="
                            background: linear-gradient(135deg, rgba(255, 140, 0, 0.85) 0%, rgba(255, 69, 0, 0.85) 100%), 
                                        url('/src/assets/B10.jpg');
                            background-size: cover;
                            background-position: center;
                            color: white;
                            padding: 80px 40px;
                            text-align: center;
                            min-height: 400px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            border-radius: 0 0 8px 8px;
                        ">
                            <h1 style="
                                font-size: 48px;
                                font-weight: 700;
                                margin-bottom: 20px;
                                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                            ">${coverTitle}</h1>
                            ${coverSubtitle ? `<h2 style="
                                font-size: 28px;
                                font-weight: 600;
                                margin-bottom: 30px;
                                text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                            ">${coverSubtitle}</h2>` : ''}
                            <div style="
                                font-size: 18px;
                                opacity: 0.95;
                                max-width: 600px;
                                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                            ">E-AUDIT PRO 2.0 - Guide Pratique</div>
                        </div>
                    </div>
                `;
            }

            sections.forEach((section, index) => {
                const isActive = (index === 0 && !coverTitle) ? 'active' : '';
                const maxHeight = (index === 0 && !coverTitle) ? 'fit-content' : '0';

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
                        .accordion-header { background-color: #f1f5f9; color: #1e3a8a; cursor: pointer; padding: 18px 25px; width: 100%; text-align: left; border: none; outline: none; font-size: 18px; font-weight: 600; transition: 0.3s; position: relative; }
                        .accordion-header.active { background-color: #667eea; color: white; }
                        .accordion-header::after { content: '＋'; font-size: 20px; position: absolute; right: 25px; }
                        .accordion-header.active::after { content: '－'; }
                        .accordion-panel { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; background-color: white; }
                        .pdf-page { padding: 40px; }
                    </style>
                    ${accordionHTML}
                </div>
            `;
        }
    };

    // ============================================
    // UTILITAIRES
    // ============================================

    function tableContainsKeywords(table, keywords) {
        const tableText = table.textContent || '';
        return keywords.some(keyword => tableText.includes(keyword));
    }

    async function fetchN8nData(command, processus) {
        try {
            const response = await fetch(CONFIG.n8nEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: `[Command] = ${command} - [Processus] = ${processus}`
                })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur fetch n8n:', error);
            return null;
        }
    }

    function transformJsonToSections(jsonData) {
        const sections = [];
        if (jsonData['Sub-items']) {
            jsonData['Sub-items'].forEach(subItem => {
                const subItemKey = Object.keys(subItem).find(k => k.startsWith('Sub-item'));
                const title = subItem[subItemKey];
                let content = `<h3 style="font-size: 24px; color: #1e40af; margin-bottom: 20px;">${title}</h3>`;
                if (subItem.Items) {
                    subItem.Items.forEach(item => {
                        const itemKey = Object.keys(item).find(k => k.startsWith('Item'));
                        content += `
                            <div style="background: #f8fafc; border-left: 4px solid #667eea; padding: 15px 20px; margin: 15px 0;">
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

    // ============================================
    // FONCTION HELPER - PAGE DE COUVERTURE
    // ============================================

    function generateCoverPage(title, subtitle = '') {
        return `
            <button class="accordion-header active">📖 Page de Couverture</button>
            <div class="accordion-panel" style="max-height: fit-content;">
                <div class="cover-page" style="
                    background: linear-gradient(135deg, rgba(255, 140, 0, 0.85) 0%, rgba(255, 69, 0, 0.85) 100%), 
                                url('/src/assets/B10.jpg');
                    background-size: cover;
                    background-position: center;
                    color: white;
                    padding: 80px 40px;
                    text-align: center;
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                ">
                    <h1 style="
                        font-size: 48px;
                        font-weight: 700;
                        margin-bottom: 20px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    ">${title}</h1>
                    ${subtitle ? `<h2 style="
                        font-size: 28px;
                        font-weight: 600;
                        margin-bottom: 30px;
                        text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                    ">${subtitle}</h2>` : ''}
                    <div style="
                        font-size: 18px;
                        opacity: 0.95;
                        max-width: 600px;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                    ">E-AUDIT PRO 2.0 - Guide Pratique</div>
                </div>
            </div>
        `;
    }

    // ============================================
    // GESTIONNAIRES DE CAS
    // ============================================

    async function handleCase1(table) {
        if (CONFIG.debug) console.log('📄 Case 1: PARTIE 1 (Document Word avec Mammoth.js)');

        // Charger et convertir le fichier .docx en HTML avec Mammoth.js
        const docxUrl = '/ressource/PARTIE1.docx';

        try {
            // Utiliser la fonction sécurisée de mammoth-loader-fix.js
            const result = await window.convertWordToHtml(docxUrl);
            const htmlContent = result.html;

            // Générer un ID unique pour cet accordéon
            const accordionId = 'accordion-word-' + Date.now();

            return `
                <div class="accordion-container" id="${accordionId}" style="margin: 40px auto; max-width: 1200px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <style>
                        #${accordionId} .cover-page {
                            border-radius: 0 0 8px 8px;
                        }
                        #${accordionId} .accordion-header {
                            background-color: #f1f5f9;
                            color: #1e3a8a;
                            cursor: pointer;
                            padding: 18px 25px;
                            width: 100%;
                            text-align: left;
                            border: none;
                            outline: none;
                            font-size: 18px;
                            font-weight: 600;
                            transition: 0.3s;
                            position: relative;
                            border-radius: 8px 8px 0 0;
                        }
                        #${accordionId} .accordion-header:hover,
                        #${accordionId} .accordion-header.active {
                            background-color: #667eea;
                            color: white;
                        }
                        #${accordionId} .accordion-header::after {
                            content: '＋';
                            font-size: 20px;
                            position: absolute;
                            right: 25px;
                        }
                        #${accordionId} .accordion-header.active::after {
                            content: '－';
                        }
                        #${accordionId} .accordion-panel {
                            max-height: 0;
                            overflow: hidden;
                            transition: max-height 0.4s ease-out;
                            background-color: white;
                            border-radius: 0 0 8px 8px;
                        }
                        #${accordionId} .word-content {
                            padding: 40px;
                            max-height: 800px;
                            overflow-y: auto;
                            border: 1px solid #e5e7eb;
                        }
                        #${accordionId} .word-controls {
                            background: #f9fafb;
                            padding: 15px;
                            text-align: center;
                            border-bottom: 1px solid #e5e7eb;
                        }
                    </style>
                    
                    ${generateCoverPage('Document Word', 'PARTIE 1 - Plan d\'Audit Basé sur les Risques')}
                    
                    <button class="accordion-header active">📄 Contenu du Document</button>
                    <div class="accordion-panel" style="max-height: fit-content;">
                        <div class="word-controls">
                            <a href="${docxUrl}" download style="color: #667eea; text-decoration: none; font-weight: 600; padding: 10px 20px; background: white; border-radius: 5px; display: inline-block;">
                                ⬇️ Télécharger le fichier Word
                            </a>
                        </div>
                        <div class="word-content">
                            ${htmlContent}
                        </div>
                        <p style="text-align: center; padding: 15px; color: #666; font-size: 12px; background: #f9fafb; margin: 0;">
                            📄 Document converti automatiquement avec Mammoth.js
                        </p>
                    </div>
                </div>
                
                <script>
                    (function() {
                        const header = document.querySelector('#${accordionId} .accordion-header');
                        const panel = document.querySelector('#${accordionId} .accordion-panel');
                        
                        header.addEventListener('click', function() {
                            this.classList.toggle('active');
                            if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                                panel.style.maxHeight = '0';
                            } else {
                                panel.style.maxHeight = panel.scrollHeight + 'px';
                            }
                        });
                    })();
                </script>
            `;
        } catch (error) {
            console.error('Erreur chargement Word:', error);
            return `
                <div style="margin: 40px auto; max-width: 1200px; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <h2 style="color: #ef4444; margin-bottom: 20px; text-align: center;">❌ Erreur de chargement</h2>
                    <p style="text-align: center; color: #666;">
                        Impossible de charger le fichier Word. Vérifiez que <code>PARTIE1.docx</code> existe dans <code>public/ressource/</code>
                    </p>
                    <p style="text-align: center; margin-top: 20px;">
                        <a href="${docxUrl}" download style="color: #667eea; text-decoration: none; font-weight: 600;">
                            ⬇️ Télécharger le fichier
                        </a>
                    </p>
                </div>
            `;
        }
    }

    // Note: La fonction loadMammothJS() n'est plus nécessaire
    // On utilise maintenant window.convertWordToHtml() de mammoth-loader-fix.js
    // qui gère automatiquement le chargement sécurisé de Mammoth.js sans conflit AMD

    async function handleCase2(table) {
        if (CONFIG.debug) console.log('📊 Case 2: PARTIE 2 (JSON statique - DATA_COLLECTION)');
        const jsonData = {
            "Sous-section A": "Définition du Plan d'Audit Basé sur les Risques",
            "Sub-items": [
                {
                    "Sub-item A1": "Principes Fondamentaux",
                    "Items": [
                        {
                            "Item A1.1": "Définition Essentielle",
                            "Rubrique": "quoi",
                            "Contenu": "Le plan d'audit basé sur les risques est un processus systématique qui aligne les missions d'audit interne sur les risques les plus significatifs de l'organisation. Il permet de déterminer les priorités de l'audit interne en cohérence avec les objectifs stratégiques de l'entreprise. C'est la pierre angulaire de la fonction d'audit moderne."
                        },
                        {
                            "Item A1.2": "Approfondissement et Distinction",
                            "Rubrique": "synthèse détaillé",
                            "Contenu": "Contrairement à une approche cyclique où toutes les entités sont auditées à tour de rôle, le plan basé sur les risques concentre les ressources limitées de l'audit sur les zones où les menaces pour l'atteinte des objectifs sont les plus élevées. Il s'appuie sur une évaluation et une hiérarchisation formelles de l'univers des risques de l'organisation.\n\nCette approche assure que l'audit interne ne se contente pas de vérifier la conformité, mais contribue activement à la protection et à la création de valeur en fournissant une assurance sur la gestion des risques majeurs."
                        }
                    ]
                },
                {
                    "Sub-item A2": "L'Univers d'Audit comme Prérequis",
                    "Items": [
                        {
                            "Item A2.1": "Définition de l'Univers d'Audit",
                            "Rubrique": "définition",
                            "Contenu": "L'univers d'audit est la liste exhaustive et structurée de tous les objets auditables potentiels au sein de l'organisation. Il inclut les processus, les départements, les projets, les systèmes d'information, et les entités juridiques. C'est la base sur laquelle l'évaluation des risques sera appliquée."
                        },
                        {
                            "Item A2.2": "Rôle dans la Planification",
                            "Rubrique": "rôle",
                            "Contenu": "La définition de l'univers d'audit est la première étape cruciale de la planification basée sur les risques. Sans un univers d'audit complet et à jour, il existe un risque de ne pas identifier des domaines critiques et, par conséquent, de laisser des risques significatifs non couverts par le plan d'audit."
                        }
                    ]
                },
                {
                    "Sub-item A3": "Alignement Stratégique et Parties Prenantes",
                    "Items": [
                        {
                            "Item A3.1": "Lien avec les Objectifs Stratégiques",
                            "Rubrique": "alignement",
                            "Contenu": "Le plan d'audit doit être directement lié aux objectifs stratégiques de l'organisation. L'évaluation des risques doit considérer les menaces et opportunités qui pourraient impacter l'atteinte de ces objectifs. Un plan d'audit efficace démontre une compréhension claire de la stratégie de l'entreprise."
                        },
                        {
                            "Item A3.2": "Consultation des Parties Prenantes",
                            "Rubrique": "acteurs clés",
                            "Contenu": "L'élaboration du plan est un processus consultatif. Le responsable de l'audit interne doit impérativement solliciter l'avis de la Direction Générale et du Conseil (ou de son Comité d'Audit) pour s'assurer que leurs préoccupations sont prises en compte et que le plan est pertinent par rapport à leurs attentes."
                        }
                    ]
                }
            ]
        };
        const sections = transformJsonToSections(jsonData);
        return TEMPLATES.beta(sections, 'Données JSON Statiques', 'PARTIE 2 - Plan d\'Audit Basé sur les Risques');
    }

    async function handleCase3(table) {
        if (CONFIG.debug) console.log('🌐 Case 3: PARTIE 3 (JSON dynamique)');
        const data = await fetchN8nData('/Programme de travail', 'facturation');

        if (data) {
            const sections = transformJsonToSections(data);
            return TEMPLATES.beta(sections, 'Données JSON Dynamiques', 'PARTIE 3 - Programme de Travail');
        } else {
            // Fallback
            const fallbackData = {
                "Sous-section A": "Plan d'Audit (Fallback)",
                "Sub-items": [{
                    "Sub-item A1": "Données de fallback",
                    "Items": [{
                        "Item A1.1": "Info",
                        "Contenu": "Endpoint n8n non accessible"
                    }]
                }]
            };
            const sections = transformJsonToSections(fallbackData);
            return TEMPLATES.beta(sections, 'Données JSON Dynamiques', 'PARTIE 3 - Fallback');
        }
    }

    async function handleCase4(table) {
        if (CONFIG.debug) console.log('📝 Case 4: PARTIE 4 (Word via n8n)');

        try {
            const response = await fetch(CONFIG.n8nEndpointProgramme, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: '[Command] = /Programme de travail - [Processus] = facturation des ventes'
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data && data.data && data.data['Etape mission - Programme']) {
                const sections = [];
                const etapeData = data.data['Etape mission - Programme'];

                // Traiter les données du workflow n8n
                etapeData.forEach((item, index) => {
                    if (item['table 2'] && Array.isArray(item['table 2'])) {
                        let content = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
                        content += '<thead><tr style="background: #667eea; color: white;">';

                        // En-têtes
                        const headers = Object.keys(item['table 2'][0]);
                        headers.forEach(header => {
                            content += `<th style="padding: 12px; border: 1px solid #ddd; text-align: left;">${header}</th>`;
                        });
                        content += '</tr></thead><tbody>';

                        // Lignes
                        item['table 2'].forEach((row, rowIndex) => {
                            const bgColor = rowIndex % 2 === 0 ? '#f9fafb' : 'white';
                            content += `<tr style="background: ${bgColor};">`;
                            headers.forEach(header => {
                                content += `<td style="padding: 10px; border: 1px solid #ddd;">${row[header] || ''}</td>`;
                            });
                            content += '</tr>';
                        });

                        content += '</tbody></table></div>';
                        sections.push({ title: `Programme de Travail - Section ${index + 1}`, content });
                    }
                });

                return TEMPLATES.beta(sections, 'Programme de Travail', 'PARTIE 4 - Données n8n');
            }
        } catch (error) {
            console.error('Erreur Case 4:', error);
        }

        // Fallback
        return TEMPLATES.beta([{
            title: 'Erreur de chargement',
            content: '<p style="color: #ef4444;">Impossible de charger les données du workflow n8n.</p>'
        }], 'Programme de Travail', 'PARTIE 4 - Erreur');
    }

    // ============================================
    // CASE 10: PANDAS - Analyse de données Paris
    // ============================================

    async function handleCase10(table) {
        if (CONFIG.debug) console.log('🐼 Case 10: PANDAS - Analyse de données arrondissements Paris');

        const viewerId = 'pandas-viewer-' + Date.now();
        let analysisData = null;

        // Appel API backend Pandas (obligatoire)
        try {
            const backendUrl = CONFIG.pandasEndpoint || ((window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/pandas/analysis/complete');
            console.log('🔄 [PANDAS] Appel API backend:', backendUrl);

            const response = await fetch(backendUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    analysisData = result.data;
                    console.log('✅ [PANDAS] Données reçues du backend Python');
                }
            }
        } catch (error) {
            console.log('❌ [PANDAS] Backend non disponible:', error.message);
        }

        // Si pas de données du backend, afficher message d'attente
        if (!analysisData) {
            return generateWaitingHTML(viewerId);
        }

        // Stocker les données pour l'initialisation des graphiques
        window._pandasChartsData = window._pandasChartsData || {};
        window._pandasChartsData[viewerId] = analysisData;

        // Planifier l'initialisation des graphiques après injection
        setTimeout(() => {
            initAllPandasCharts(viewerId, analysisData);
        }, 800);

        // Générer le HTML avec les données du backend
        return generatePandasHTML(viewerId, analysisData);
    }

    // Fonction globale pour initialiser TOUS les 6 graphiques Chart.js
    async function initAllPandasCharts(viewerId, data) {
        console.log('🎨 [Pandas Charts] Initialisation complète pour:', viewerId);

        // Charger Chart.js si nécessaire
        if (typeof Chart === 'undefined') {
            console.log('📦 [Chart.js] Chargement...');
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                script.onload = () => {
                    console.log('✅ [Chart.js] Chargé');
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const labels = data.arrondissements.map(a => a.arrondissement + 'e');
        const populations = data.arrondissements.map(a => a.population);
        const prix = data.arrondissements.map(a => a.prix_m2_moyen);
        const densites = data.arrondissements.map(a => a.densite);

        // Couleurs par catégorie
        const colors = data.arrondissements.map(a => {
            if (a.categorie_prix === 'Cher') return 'rgba(239, 68, 68, 0.7)';
            if (a.categorie_prix === 'Moyen') return 'rgba(245, 158, 11, 0.7)';
            return 'rgba(34, 197, 94, 0.7)';
        });
        const borderColors = colors.map(c => c.replace('0.7', '1'));

        // Graphique 1: Population (Bar)
        const ctx1 = document.getElementById(viewerId + '-chart-population');
        if (ctx1 && !ctx1.chart) {
            ctx1.chart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Population',
                        data: populations,
                        backgroundColor: colors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { callback: v => (v / 1000) + 'k' } } }
                }
            });
            console.log('✅ [Chart 1] Population créé');
        }

        // Graphique 2: Prix au m² (Line)
        const ctx2 = document.getElementById(viewerId + '-chart-prix');
        if (ctx2 && !ctx2.chart) {
            ctx2.chart = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Prix/m²',
                        data: prix,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: colors,
                        pointRadius: 5,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: false, ticks: { callback: v => v.toLocaleString() + ' €' } } }
                }
            });
            console.log('✅ [Chart 2] Prix créé');
        }

        // Graphique 3: Camembert catégories
        const ctx3 = document.getElementById(viewerId + '-chart-categorie');
        if (ctx3 && !ctx3.chart) {
            const catCounts = [
                data.arrondissements.filter(a => a.categorie_prix === 'Cher').length,
                data.arrondissements.filter(a => a.categorie_prix === 'Moyen').length,
                data.arrondissements.filter(a => a.categorie_prix === 'Abordable').length
            ];
            ctx3.chart = new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: ['Cher', 'Moyen', 'Abordable'],
                    datasets: [{
                        data: catCounts,
                        backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(34, 197, 94, 0.8)'],
                        borderColor: ['#ef4444', '#f59e0b', '#22c55e'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { padding: 15 } } }
                }
            });
            console.log('✅ [Chart 3] Catégories créé');
        }

        // Graphique 4: Scatter Prix vs Population
        const ctx4 = document.getElementById(viewerId + '-chart-scatter');
        if (ctx4 && !ctx4.chart) {
            const scatterData = data.arrondissements.map(a => ({ x: a.population, y: a.prix_m2_moyen }));
            ctx4.chart = new Chart(ctx4, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Arrondissements',
                        data: scatterData,
                        backgroundColor: colors,
                        pointRadius: 8,
                        pointHoverRadius: 12
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => {
                                    const arr = data.arrondissements[ctx.dataIndex];
                                    return arr.arrondissement + 'e: ' + arr.population.toLocaleString() + ' hab, ' + arr.prix_m2_moyen.toLocaleString() + ' €/m²';
                                }
                            }
                        }
                    },
                    scales: {
                        x: { title: { display: true, text: 'Population' }, ticks: { callback: v => (v / 1000) + 'k' } },
                        y: { title: { display: true, text: 'Prix/m²' }, ticks: { callback: v => v.toLocaleString() + ' €' } }
                    }
                }
            });
            console.log('✅ [Chart 4] Scatter créé');
        }

        // Graphique 5: Densité (Bar horizontal)
        const ctx5 = document.getElementById(viewerId + '-chart-densite');
        if (ctx5 && !ctx5.chart) {
            const densiteColors = densites.map(d => {
                if (d > 30000) return 'rgba(239, 68, 68, 0.7)';
                if (d > 20000) return 'rgba(245, 158, 11, 0.7)';
                return 'rgba(34, 197, 94, 0.7)';
            });
            ctx5.chart = new Chart(ctx5, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Densité (hab/km²)',
                        data: densites,
                        backgroundColor: densiteColors,
                        borderColor: densiteColors.map(c => c.replace('0.7', '1')),
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: ctx => ctx.raw.toLocaleString() + ' hab/km²' } }
                    },
                    scales: { x: { beginAtZero: true, ticks: { callback: v => (v / 1000) + 'k' } } }
                }
            });
            console.log('✅ [Chart 5] Densité créé');
        }

        // Graphique 6: Radar (Top 5 arrondissements)
        const ctx6 = document.getElementById(viewerId + '-chart-radar');
        if (ctx6 && !ctx6.chart) {
            const top5 = [...data.arrondissements].sort((a, b) => b.population - a.population).slice(0, 5);
            const radarLabels = ['Population', 'Prix/m²', 'Densité', 'Restaurants', 'Métros'];
            const maxPop = Math.max(...data.arrondissements.map(a => a.population));
            const maxPrix = Math.max(...data.arrondissements.map(a => a.prix_m2_moyen));
            const maxDens = Math.max(...data.arrondissements.map(a => a.densite));
            const maxRest = Math.max(...data.arrondissements.map(a => a.nb_restaurants));
            const maxMetro = Math.max(...data.arrondissements.map(a => a.nb_metro));
            const radarColors = [
                'rgba(102, 126, 234, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(34, 197, 94, 0.7)',
                'rgba(245, 158, 11, 0.7)', 'rgba(168, 85, 247, 0.7)'
            ];
            const radarDatasets = top5.map((arr, i) => ({
                label: arr.arrondissement + 'e',
                data: [
                    (arr.population / maxPop) * 100,
                    (arr.prix_m2_moyen / maxPrix) * 100,
                    (arr.densite / maxDens) * 100,
                    (arr.nb_restaurants / maxRest) * 100,
                    (arr.nb_metro / maxMetro) * 100
                ],
                backgroundColor: radarColors[i].replace('0.7', '0.2'),
                borderColor: radarColors[i].replace('0.7', '1'),
                borderWidth: 2,
                pointBackgroundColor: radarColors[i].replace('0.7', '1')
            }));
            ctx6.chart = new Chart(ctx6, {
                type: 'radar',
                data: { labels: radarLabels, datasets: radarDatasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, font: { size: 11 } } }
                    },
                    scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, pointLabels: { font: { size: 10 } } } }
                }
            });
            console.log('✅ [Chart 6] Radar créé');
        }

        console.log('✅ [Pandas] 6 graphiques Chart.js initialisés avec succès!');
    }

    // Message d'attente si backend non disponible
    function generateWaitingHTML(viewerId) {
        return `
            <div class="accordion-container" id="${viewerId}" style="margin: 40px auto; max-width: 900px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                ${generateCoverPage('🐼 Analyse Pandas', 'Case 10 - Arrondissements de Paris')}
                
                <div style="background: white; padding: 60px 40px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                    <div style="font-size: 80px; margin-bottom: 20px;">⏳</div>
                    <h2 style="color: #f59e0b; margin-bottom: 15px; font-size: 28px;">En attente du backend</h2>
                    <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                        Le serveur Python avec Pandas n'est pas disponible.
                    </p>
                    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; max-width: 500px; margin: 0 auto;">
                        <p style="color: #92400e; font-size: 14px; margin: 0 0 15px 0; font-weight: 600;">
                            Pour démarrer le backend :
                        </p>
                        <code style="display: block; background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 5px; font-size: 13px; text-align: left;">
cd py_backend<br>
pip install pandas numpy<br>
python main.py
                        </code>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        Endpoint attendu : <code>http://localhost:5000/pandas/analysis/complete</code>
                    </p>
                </div>
            </div>
        `;
    }

    // ============================================
    // GÉNÉRATION DES GRAPHIQUES CHART.JS
    // ============================================

    // Charger Chart.js globalement une seule fois
    function loadChartJS() {
        return new Promise((resolve, reject) => {
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                console.log('✅ [Chart.js] Chargé avec succès');
                resolve();
            };
            script.onerror = () => reject(new Error('Échec chargement Chart.js'));
            document.head.appendChild(script);
        });
    }

    // Initialiser les graphiques après injection
    function initPandasCharts(viewerId, data) {
        console.log('🎨 [Pandas Charts] Initialisation pour:', viewerId);

        const chartId1 = viewerId + '-chart-population';
        const chartId2 = viewerId + '-chart-prix';
        const chartId3 = viewerId + '-chart-categorie';
        const chartId4 = viewerId + '-chart-scatter';

        // Vérifier que Chart.js est chargé
        if (typeof Chart === 'undefined') {
            console.error('❌ [Pandas Charts] Chart.js non chargé!');
            return;
        }
        console.log('✅ [Pandas Charts] Chart.js disponible');

        const labels = data.arrondissements.map(a => a.arrondissement + 'e');
        const populations = data.arrondissements.map(a => a.population);
        const prix = data.arrondissements.map(a => a.prix_m2_moyen);

        // Couleurs par catégorie
        const colors = data.arrondissements.map(a => {
            if (a.categorie_prix === 'Cher') return 'rgba(239, 68, 68, 0.7)';
            if (a.categorie_prix === 'Moyen') return 'rgba(245, 158, 11, 0.7)';
            return 'rgba(34, 197, 94, 0.7)';
        });

        const borderColors = colors.map(c => c.replace('0.7', '1'));

        // Graphique 1: Population (Bar)
        const ctx1 = document.getElementById(chartId1);
        console.log('📊 [Chart 1] Canvas trouvé:', !!ctx1, chartId1);
        if (ctx1) {
            try {
                new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Population',
                            data: populations,
                            backgroundColor: colors,
                            borderColor: borderColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { callback: (v) => (v / 1000) + 'k' }
                            }
                        }
                    }
                });
                console.log('✅ [Chart 1] Population créé');
            } catch (e) {
                console.error('❌ [Chart 1] Erreur:', e);
            }
        }

        // Graphique 2: Prix au m² (Line)
        const ctx2 = document.getElementById(chartId2);
        console.log('📊 [Chart 2] Canvas trouvé:', !!ctx2, chartId2);
        if (ctx2) {
            new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Prix/m²',
                        data: prix,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: colors,
                        pointRadius: 5,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: { callback: (v) => v.toLocaleString() + ' €' }
                        }
                    }
                }
            });
        }

        // Graphique 3: Camembert catégories
        const ctx3 = document.getElementById(chartId3);
        if (ctx3) {
            const catCounts = [
                data.arrondissements.filter(a => a.categorie_prix === 'Cher').length,
                data.arrondissements.filter(a => a.categorie_prix === 'Moyen').length,
                data.arrondissements.filter(a => a.categorie_prix === 'Abordable').length
            ];

            new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: ['Cher', 'Moyen', 'Abordable'],
                    datasets: [{
                        data: catCounts,
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(34, 197, 94, 0.8)'
                        ],
                        borderColor: ['#ef4444', '#f59e0b', '#22c55e'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { padding: 15 }
                        }
                    }
                }
            });
        }

        // Graphique 4: Scatter Prix vs Population
        const ctx4 = document.getElementById(chartId4);
        if (ctx4) {
            const scatterData = data.arrondissements.map((a, i) => ({
                x: a.population,
                y: a.prix_m2_moyen
            }));

            new Chart(ctx4, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Arrondissements',
                        data: scatterData,
                        backgroundColor: colors,
                        pointRadius: 8,
                        pointHoverRadius: 12
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const idx = ctx.dataIndex;
                                    const arr = data.arrondissements[idx];
                                    return arr.arrondissement + 'e: ' + arr.population.toLocaleString() + ' hab, ' + arr.prix_m2_moyen.toLocaleString() + ' €/m²';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Population' },
                            ticks: { callback: (v) => (v / 1000) + 'k' }
                        },
                        y: {
                            title: { display: true, text: 'Prix/m²' },
                            ticks: { callback: (v) => v.toLocaleString() + ' €' }
                        }
                    }
                }
            });
        }

        console.log('✅ [Pandas] 4 graphiques Chart.js initialisés');
    }

    function generateChartsSection(viewerId, data) {
        const chartId1 = viewerId + '-chart-population';
        const chartId2 = viewerId + '-chart-prix';
        const chartId3 = viewerId + '-chart-categorie';
        const chartId4 = viewerId + '-chart-scatter';
        const chartId5 = viewerId + '-chart-densite';
        const chartId6 = viewerId + '-chart-radar';

        // Stocker les données pour l'initialisation ultérieure
        window._pandasChartsData = window._pandasChartsData || {};
        window._pandasChartsData[viewerId] = data;

        return `
            <div style="margin-bottom: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <strong>📊 Visualisations interactives</strong> - 6 graphiques générés avec Chart.js à partir des données Pandas
            </div>
            
            <!-- Ligne 1: Population et Prix -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="color: #1e40af; margin-bottom: 15px; text-align: center;">👥 Population par Arrondissement</h4>
                    <div style="height: 280px; position: relative;"><canvas id="${chartId1}"></canvas></div>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="color: #1e40af; margin-bottom: 15px; text-align: center;">💰 Prix au m² par Arrondissement</h4>
                    <div style="height: 280px; position: relative;"><canvas id="${chartId2}"></canvas></div>
                </div>
            </div>
            
            <!-- Ligne 2: Catégories et Scatter -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="color: #1e40af; margin-bottom: 15px; text-align: center;">🏷️ Répartition par Catégorie de Prix</h4>
                    <div style="height: 280px; position: relative;"><canvas id="${chartId3}"></canvas></div>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="color: #1e40af; margin-bottom: 15px; text-align: center;">📈 Corrélation Prix vs Population</h4>
                    <div style="height: 280px; position: relative;"><canvas id="${chartId4}"></canvas></div>
                </div>
            </div>
            
            <!-- Ligne 3: Densité et Radar -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="color: #1e40af; margin-bottom: 15px; text-align: center;">🏙️ Densité de Population (hab/km²)</h4>
                    <div style="height: 280px; position: relative;"><canvas id="${chartId5}"></canvas></div>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="color: #1e40af; margin-bottom: 15px; text-align: center;">🎯 Comparaison Multi-critères (Top 5)</h4>
                    <div style="height: 280px; position: relative;"><canvas id="${chartId6}"></canvas></div>
                </div>
            </div>
        `;
    }

    // Fonction de génération HTML pour Pandas (données du backend uniquement)
    function generatePandasHTML(viewerId, data) {

        // Section 0: Graphiques Chart.js
        const chartsSection = generateChartsSection(viewerId, data);

        // Section 1: Tableau principal
        let tableauPrincipal = `
            <div style="margin-bottom: 15px; padding: 10px; background: #dcfce7; border-radius: 5px; font-size: 12px;">
                Source des données: <strong>🐍 Backend Python (Pandas)</strong>
            </div>
            <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
                <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <th style="padding: 12px; border: 1px solid #ddd;">Arr.</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">Population</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">Surface (km²)</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">Densité</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">Prix/m²</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">Catégorie</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">Restaurants</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">Métros</th>
                </tr>
            </thead>
            <tbody>
                `;

        data.arrondissements.forEach((arr, i) => {
            const bgColor = i % 2 === 0 ? '#f9fafb' : 'white';
            const catColor = arr.categorie_prix === 'Cher' ? '#ef4444' :
                arr.categorie_prix === 'Moyen' ? '#f59e0b' : '#22c55e';
            tableauPrincipal += `
                <tr style="background: ${bgColor};">
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${arr.arrondissement}e</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${arr.population.toLocaleString()}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${arr.surface_km2.toFixed(2)}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${arr.densite.toLocaleString()}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${arr.prix_m2_moyen.toLocaleString()} €</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;"><span style="background: ${catColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">${arr.categorie_prix}</span></td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${arr.nb_restaurants}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${arr.nb_metro}</td>
                </tr>
                `;
        });
        tableauPrincipal += '</tbody></table></div>';

        // Section 2: Top 5
        let top5HTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div>
                    <h4 style="color: #1e40af; margin-bottom: 15px;">🏆 Top 5 - Population</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #667eea; color: white;">
                            <th style="padding: 10px;">Rang</th>
                            <th style="padding: 10px;">Arr.</th>
                            <th style="padding: 10px;">Population</th>
                        </tr></thead>
                        <tbody>
        `;
        data.top5_population.forEach((item, idx) => {
            top5HTML += `<tr style="background: ${idx % 2 === 0 ? '#f9fafb' : 'white'};">
                <td style="padding: 8px; text-align: center;">${idx + 1}</td>
                <td style="padding: 8px; text-align: center;">${item.arrondissement}e</td>
                <td style="padding: 8px; text-align: right;">${item.population.toLocaleString()}</td>
            </tr>`;
        });
        top5HTML += `</tbody></table></div>
                <div>
                    <h4 style="color: #1e40af; margin-bottom: 15px;">🍽️ Top 5 - Restaurants</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #667eea; color: white;">
                            <th style="padding: 10px;">Rang</th>
                            <th style="padding: 10px;">Arr.</th>
                            <th style="padding: 10px;">Restaurants</th>
                        </tr></thead>
                        <tbody>
        `;
        data.top5_restaurants.forEach((item, idx) => {
            top5HTML += `<tr style="background: ${idx % 2 === 0 ? '#f9fafb' : 'white'};">
                <td style="padding: 8px; text-align: center;">${idx + 1}</td>
                <td style="padding: 8px; text-align: center;">${item.arrondissement}e</td>
                <td style="padding: 8px; text-align: right;">${item.nb_restaurants}</td>
            </tr>`;
        });
        top5HTML += '</tbody></table></div></div>';

        // Section 3: Stats par catégorie
        let statsHTML = `
            <h4 style="color: #1e40af; margin-bottom: 15px;">📊 Statistiques par Catégorie</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        `;
        data.stats_par_categorie.forEach(stat => {
            const color = stat.categorie_prix === 'Cher' ? '#ef4444' :
                stat.categorie_prix === 'Moyen' ? '#f59e0b' : '#22c55e';
            statsHTML += `
                <div style="background: linear-gradient(135deg, ${color}20 0%, ${color}10 100%); border: 2px solid ${color}; border-radius: 10px; padding: 20px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: ${color};">${stat.categorie_prix}</div>
                    <div style="margin-top: 10px; font-size: 14px; color: #666;">
                        <div><strong>${stat.arrondissement}</strong> arrondissements</div>
                        <div><strong>${stat.population.toLocaleString()}</strong> habitants</div>
                        <div>Prix moyen: <strong>${stat.prix_m2_moyen.toLocaleString()} €/m²</strong></div>
                    </div>
                </div>
            `;
        });
        statsHTML += '</div>';

        // Section 4: Arrondissements chers
        let chersHTML = `
            <h4 style="color: #1e40af; margin-bottom: 15px;">💰 Arrondissements Chers (> 10 000 €/m²)</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        `;
        data.arrondissements_chers.forEach(item => {
            chersHTML += `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 25px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold;">${item.arrondissement}e</div>
                    <div style="font-size: 14px; opacity: 0.9;">${item.prix_m2_moyen.toLocaleString()} €/m²</div>
                </div>
            `;
        });
        chersHTML += '</div>';

        // Section 5: Résumé global
        const resumeHTML = `
            <h4 style="color: #1e40af; margin-bottom: 15px;">📈 Résumé Global Paris</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${data.total_population.toLocaleString()}</div>
                    <div style="color: #666;">Population totale</div>
                </div>
                <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #92400e;">${data.prix_moyen_global.toLocaleString()} €</div>
                    <div style="color: #666;">Prix moyen/m²</div>
                </div>
                <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 10px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #166534;">${data.densite_moyenne.toLocaleString()}</div>
                    <div style="color: #666;">Densité moyenne (hab/km²)</div>
                </div>
            </div>
        `;

        return `
            <div class="accordion-container" id="${viewerId}" style="margin: 40px auto; max-width: 1200px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <style>
                    #${viewerId} .accordion-header {
                        background-color: #f1f5f9;
                        color: #1e3a8a;
                        cursor: pointer;
                        padding: 18px 25px;
                        width: 100%;
                        text-align: left;
                        border: none;
                        outline: none;
                        font-size: 18px;
                        font-weight: 600;
                        transition: 0.3s;
                        position: relative;
                        border-top: 1px solid #cbd5e1;
                    }
                    #${viewerId} .accordion-header:first-of-type {
                        border-top: none;
                        border-radius: 8px 8px 0 0;
                    }
                    #${viewerId} .accordion-header:hover,
                    #${viewerId} .accordion-header.active {
                        background-color: #667eea;
                        color: white;
                    }
                    #${viewerId} .accordion-header::after {
                        content: '＋';
                        font-size: 20px;
                        position: absolute;
                        right: 25px;
                    }
                    #${viewerId} .accordion-header.active::after {
                        content: '－';
                    }
                    #${viewerId} .accordion-panel {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.4s ease-out;
                        background-color: white;
                        border: 1px solid #e5e7eb;
                        border-top: none;
                    }
                    #${viewerId} .accordion-panel .content {
                        padding: 25px;
                    }
                </style>
                
                ${generateCoverPage('🐼 Analyse Pandas', 'Case 10 - Arrondissements de Paris')}
                
                <button class="accordion-header active">📊 Graphiques Interactifs (Chart.js)</button>
                <div class="accordion-panel" style="max-height: fit-content;">
                    <div class="content">${chartsSection}</div>
                </div>
                
                <button class="accordion-header">📋 Tableau des Données Complètes</button>
                <div class="accordion-panel">
                    <div class="content">${tableauPrincipal}</div>
                </div>
                
                <button class="accordion-header">🏆 Classements Top 5</button>
                <div class="accordion-panel">
                    <div class="content">${top5HTML}</div>
                </div>
                
                <button class="accordion-header">📊 Statistiques par Catégorie</button>
                <div class="accordion-panel">
                    <div class="content">${statsHTML}</div>
                </div>
                
                <button class="accordion-header">💰 Arrondissements Premium</button>
                <div class="accordion-panel">
                    <div class="content">${chersHTML}</div>
                </div>
                
                <button class="accordion-header">📈 Résumé Global</button>
                <div class="accordion-panel">
                    <div class="content">${resumeHTML}</div>
                </div>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
                (function() {
                    const viewerId = '${viewerId}';
                    const container = document.getElementById(viewerId);
                    if (!container) return;
                    
                    // Accordéon
                    const headers = container.querySelectorAll('.accordion-header');
                    headers.forEach(header => {
                        header.addEventListener('click', function() {
                            this.classList.toggle('active');
                            const panel = this.nextElementSibling;
                            if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                                panel.style.maxHeight = '0';
                            } else {
                                panel.style.maxHeight = panel.scrollHeight + 'px';
                            }
                        });
                    });
                    
                    // Initialiser les graphiques Chart.js après un court délai
                    setTimeout(function() {
                        if (typeof Chart === 'undefined') {
                            console.error('❌ [Pandas Charts] Chart.js non chargé!');
                            return;
                        }
                        
                        const data = window._pandasChartsData && window._pandasChartsData[viewerId];
                        if (!data) {
                            console.error('❌ [Pandas Charts] Données non trouvées pour:', viewerId);
                            return;
                        }
                        
                        console.log('🎨 [Pandas Charts] Initialisation pour:', viewerId);
                        
                        const chartId1 = viewerId + '-chart-population';
                        const chartId2 = viewerId + '-chart-prix';
                        const chartId3 = viewerId + '-chart-categorie';
                        const chartId4 = viewerId + '-chart-scatter';
                        
                        const labels = data.arrondissements.map(a => a.arrondissement + 'e');
                        const populations = data.arrondissements.map(a => a.population);
                        const prix = data.arrondissements.map(a => a.prix_m2_moyen);
                        
                        // Couleurs par catégorie
                        const colors = data.arrondissements.map(a => {
                            if (a.categorie_prix === 'Cher') return 'rgba(239, 68, 68, 0.7)';
                            if (a.categorie_prix === 'Moyen') return 'rgba(245, 158, 11, 0.7)';
                            return 'rgba(34, 197, 94, 0.7)';
                        });
                        const borderColors = colors.map(c => c.replace('0.7', '1'));
                        
                        // Graphique 1: Population (Bar)
                        const ctx1 = document.getElementById(chartId1);
                        if (ctx1) {
                            new Chart(ctx1, {
                                type: 'bar',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: 'Population',
                                        data: populations,
                                        backgroundColor: colors,
                                        borderColor: borderColors,
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { callback: function(v) { return (v / 1000) + 'k'; } }
                                        }
                                    }
                                }
                            });
                            console.log('✅ [Chart 1] Population créé');
                        }
                        
                        // Graphique 2: Prix au m² (Line)
                        const ctx2 = document.getElementById(chartId2);
                        if (ctx2) {
                            new Chart(ctx2, {
                                type: 'line',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: 'Prix/m²',
                                        data: prix,
                                        borderColor: '#667eea',
                                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        fill: true,
                                        tension: 0.3,
                                        pointBackgroundColor: colors,
                                        pointRadius: 5,
                                        pointHoverRadius: 8
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: false,
                                            ticks: { callback: function(v) { return v.toLocaleString() + ' €'; } }
                                        }
                                    }
                                }
                            });
                            console.log('✅ [Chart 2] Prix créé');
                        }
                        
                        // Graphique 3: Camembert catégories
                        const ctx3 = document.getElementById(chartId3);
                        if (ctx3) {
                            const catCounts = [
                                data.arrondissements.filter(a => a.categorie_prix === 'Cher').length,
                                data.arrondissements.filter(a => a.categorie_prix === 'Moyen').length,
                                data.arrondissements.filter(a => a.categorie_prix === 'Abordable').length
                            ];
                            new Chart(ctx3, {
                                type: 'doughnut',
                                data: {
                                    labels: ['Cher', 'Moyen', 'Abordable'],
                                    datasets: [{
                                        data: catCounts,
                                        backgroundColor: [
                                            'rgba(239, 68, 68, 0.8)',
                                            'rgba(245, 158, 11, 0.8)',
                                            'rgba(34, 197, 94, 0.8)'
                                        ],
                                        borderColor: ['#ef4444', '#f59e0b', '#22c55e'],
                                        borderWidth: 2
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom', labels: { padding: 15 } }
                                    }
                                }
                            });
                            console.log('✅ [Chart 3] Catégories créé');
                        }
                        
                        // Graphique 4: Scatter Prix vs Population
                        const ctx4 = document.getElementById(chartId4);
                        if (ctx4) {
                            const scatterData = data.arrondissements.map(function(a) {
                                return { x: a.population, y: a.prix_m2_moyen };
                            });
                            new Chart(ctx4, {
                                type: 'scatter',
                                data: {
                                    datasets: [{
                                        label: 'Arrondissements',
                                        data: scatterData,
                                        backgroundColor: colors,
                                        pointRadius: 8,
                                        pointHoverRadius: 12
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: function(ctx) {
                                                    const idx = ctx.dataIndex;
                                                    const arr = data.arrondissements[idx];
                                                    return arr.arrondissement + 'e: ' + arr.population.toLocaleString() + ' hab, ' + arr.prix_m2_moyen.toLocaleString() + ' €/m²';
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            title: { display: true, text: 'Population' },
                                            ticks: { callback: function(v) { return (v / 1000) + 'k'; } }
                                        },
                                        y: {
                                            title: { display: true, text: 'Prix/m²' },
                                            ticks: { callback: function(v) { return v.toLocaleString() + ' €'; } }
                                        }
                                    }
                                }
                            });
                            console.log('✅ [Chart 4] Scatter créé');
                        }
                        
                        // Graphique 5: Densité (Bar horizontal)
                        const chartId5 = viewerId + '-chart-densite';
                        const ctx5 = document.getElementById(chartId5);
                        if (ctx5) {
                            const densites = data.arrondissements.map(a => a.densite);
                            const densiteColors = densites.map(d => {
                                if (d > 30000) return 'rgba(239, 68, 68, 0.7)';
                                if (d > 20000) return 'rgba(245, 158, 11, 0.7)';
                                return 'rgba(34, 197, 94, 0.7)';
                            });
                            new Chart(ctx5, {
                                type: 'bar',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: 'Densité (hab/km²)',
                                        data: densites,
                                        backgroundColor: densiteColors,
                                        borderColor: densiteColors.map(c => c.replace('0.7', '1')),
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: function(ctx) {
                                                    return ctx.raw.toLocaleString() + ' hab/km²';
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            ticks: { callback: function(v) { return (v / 1000) + 'k'; } }
                                        }
                                    }
                                }
                            });
                            console.log('✅ [Chart 5] Densité créé');
                        }
                        
                        // Graphique 6: Radar (Top 5 arrondissements)
                        const chartId6 = viewerId + '-chart-radar';
                        const ctx6 = document.getElementById(chartId6);
                        if (ctx6) {
                            // Prendre les 5 arrondissements les plus peuplés
                            const top5 = [...data.arrondissements].sort((a, b) => b.population - a.population).slice(0, 5);
                            const radarLabels = ['Population', 'Prix/m²', 'Densité', 'Restaurants', 'Métros'];
                            
                            // Normaliser les données (0-100)
                            const maxPop = Math.max(...data.arrondissements.map(a => a.population));
                            const maxPrix = Math.max(...data.arrondissements.map(a => a.prix_m2_moyen));
                            const maxDens = Math.max(...data.arrondissements.map(a => a.densite));
                            const maxRest = Math.max(...data.arrondissements.map(a => a.nb_restaurants));
                            const maxMetro = Math.max(...data.arrondissements.map(a => a.nb_metro));
                            
                            const radarColors = [
                                'rgba(102, 126, 234, 0.7)',
                                'rgba(239, 68, 68, 0.7)',
                                'rgba(34, 197, 94, 0.7)',
                                'rgba(245, 158, 11, 0.7)',
                                'rgba(168, 85, 247, 0.7)'
                            ];
                            
                            const radarDatasets = top5.map((arr, i) => ({
                                label: arr.arrondissement + 'e',
                                data: [
                                    (arr.population / maxPop) * 100,
                                    (arr.prix_m2_moyen / maxPrix) * 100,
                                    (arr.densite / maxDens) * 100,
                                    (arr.nb_restaurants / maxRest) * 100,
                                    (arr.nb_metro / maxMetro) * 100
                                ],
                                backgroundColor: radarColors[i].replace('0.7', '0.2'),
                                borderColor: radarColors[i].replace('0.7', '1'),
                                borderWidth: 2,
                                pointBackgroundColor: radarColors[i].replace('0.7', '1')
                            }));
                            
                            new Chart(ctx6, {
                                type: 'radar',
                                data: {
                                    labels: radarLabels,
                                    datasets: radarDatasets
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { 
                                            position: 'bottom',
                                            labels: { 
                                                padding: 10,
                                                usePointStyle: true,
                                                font: { size: 11 }
                                            }
                                        }
                                    },
                                    scales: {
                                        r: {
                                            beginAtZero: true,
                                            max: 100,
                                            ticks: { display: false },
                                            pointLabels: { font: { size: 10 } }
                                        }
                                    }
                                }
                            });
                            console.log('✅ [Chart 6] Radar créé');
                        }
                        
                        console.log('✅ [Pandas] 6 graphiques Chart.js initialisés');
                    }, 500);
                })();
            </script>
        `;
    }

    // ============================================
    // CASE 11: CHART - Visualisation D3.js
    // ============================================

    // Fonction pour charger D3.js dynamiquement
    function loadD3js() {
        return new Promise((resolve, reject) => {
            if (typeof d3 !== 'undefined') {
                console.log('✅ [D3.js] Déjà chargé');
                resolve(d3);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
            script.onload = () => {
                console.log('✅ [D3.js] Chargé avec succès');
                resolve(window.d3);
            };
            script.onerror = () => reject(new Error('Échec du chargement de D3.js'));
            document.head.appendChild(script);
        });
    }

    // Fonction pour initialiser le graphique D3.js
    function initD3Chart(viewerId, data) {
        const container = document.getElementById(viewerId);
        if (!container) {
            console.error('❌ [D3.js] Container non trouvé:', viewerId);
            return;
        }

        console.log('🎨 [D3.js] Initialisation du graphique...');

        // Configuration
        const margin = { top: 40, right: 30, bottom: 80, left: 80 };
        const width = 1050 - margin.left - margin.right;
        const height = 460 - margin.top - margin.bottom;

        // SVG
        const svg = d3.select('#' + viewerId + '-svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Échelles
        const x = d3.scaleBand().range([0, width]).padding(0.2);
        const y = d3.scaleLinear().range([height, 0]);

        // Axes
        const xAxis = svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'x-axis');

        const yAxis = svg.append('g').attr('class', 'y-axis');

        // Grille
        const gridlines = svg.append('g').attr('class', 'grid');

        // Labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 50)
            .text('Arrondissement');

        const yLabel = svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -height / 2);

        // Tooltip
        const tooltip = d3.select('#' + viewerId + '-tooltip');

        // Palette de couleurs
        const colorScale = d3.scaleSequential().interpolator(d3.interpolateViridis);

        // Configurations des métriques
        const configs = {
            population: { getValue: d => d.population, label: 'Population', format: d => d.toLocaleString('fr-FR') },
            prix_m2: { getValue: d => d.prix_m2, label: 'Prix au m² (€)', format: d => d.toLocaleString('fr-FR') + ' €' },
            densite: { getValue: d => d.densite, label: 'Densité (hab/km²)', format: d => d.toLocaleString('fr-FR') },
            restaurants: { getValue: d => d.restaurants, label: 'Nombre de restaurants', format: d => d.toLocaleString('fr-FR') }
        };

        // Fonction de mise à jour
        function updateChart(metric) {
            const config = configs[metric];

            x.domain(data.map(d => d.arr));
            y.domain([0, d3.max(data, config.getValue) * 1.1]);
            colorScale.domain([0, d3.max(data, config.getValue)]);

            gridlines.call(d3.axisLeft(y).tickSize(-width).tickFormat(''));
            xAxis.transition().duration(750).call(d3.axisBottom(x));
            yAxis.transition().duration(750).call(d3.axisLeft(y).ticks(8).tickFormat(d => d.toLocaleString('fr-FR')));
            yLabel.text(config.label);

            const bars = svg.selectAll('.bar').data(data, d => d.arr);

            bars.exit().transition().duration(750).attr('y', height).attr('height', 0).remove();

            bars.transition().duration(750)
                .attr('x', d => x(d.arr))
                .attr('y', d => y(config.getValue(d)))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(config.getValue(d)))
                .attr('fill', d => colorScale(config.getValue(d)));

            bars.enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.arr))
                .attr('y', height)
                .attr('width', x.bandwidth())
                .attr('height', 0)
                .attr('fill', d => colorScale(config.getValue(d)))
                .on('mouseover', function (event, d) {
                    d3.select(this).transition().duration(200).attr('opacity', 0.7);
                    tooltip.classed('show', true)
                        .html('<strong>Arrondissement ' + d.arr + '</strong><br/>' +
                            config.label + ': <strong>' + config.format(config.getValue(d)) + '</strong><br/>' +
                            'Population: ' + d.population.toLocaleString('fr-FR') + '<br/>' +
                            'Surface: ' + d.surface + ' km²')
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).transition().duration(200).attr('opacity', 1);
                    tooltip.classed('show', false);
                })
                .transition().duration(750)
                .attr('y', d => y(config.getValue(d)))
                .attr('height', d => height - y(config.getValue(d)));

            // Stats
            const values = data.map(config.getValue);
            const stats = [
                { label: 'Total', value: config.format(d3.sum(values)) },
                { label: 'Moyenne', value: config.format(Math.round(d3.mean(values))) },
                { label: 'Maximum', value: config.format(d3.max(values)) },
                { label: 'Minimum', value: config.format(d3.min(values)) }
            ];

            const statsContainer = document.getElementById(viewerId + '-stats');
            if (statsContainer) {
                statsContainer.innerHTML = stats.map(s =>
                    '<div class="stat-card"><div class="stat-label">' + s.label + '</div><div class="stat-value">' + s.value + '</div></div>'
                ).join('');
            }
        }

        // Boutons
        const buttons = container.querySelectorAll('.chart-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function () {
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateChart(this.dataset.metric);
            });
        });

        // Initialisation
        updateChart('population');
        console.log('✅ [D3.js] Graphique initialisé');
    }

    async function handleCase11(table) {
        if (CONFIG.debug) console.log('📊 Case 11: CHART - Visualisation D3.js des arrondissements Paris');

        const viewerId = 'd3-chart-viewer-' + Date.now();

        // Données statiques des arrondissements de Paris
        const data = [
            { arr: 1, population: 16266, surface: 1.83, prix_m2: 11500, restaurants: 245, metro: 8 },
            { arr: 2, population: 21533, surface: 0.99, prix_m2: 11200, restaurants: 198, metro: 6 },
            { arr: 3, population: 34248, surface: 1.17, prix_m2: 10800, restaurants: 287, metro: 7 },
            { arr: 4, population: 27887, surface: 1.60, prix_m2: 11000, restaurants: 312, metro: 5 },
            { arr: 5, population: 58850, surface: 2.54, prix_m2: 10500, restaurants: 456, metro: 9 },
            { arr: 6, population: 41100, surface: 2.15, prix_m2: 12500, restaurants: 398, metro: 8 },
            { arr: 7, population: 51367, surface: 4.09, prix_m2: 13000, restaurants: 234, metro: 6 },
            { arr: 8, population: 36051, surface: 3.88, prix_m2: 12800, restaurants: 421, metro: 10 },
            { arr: 9, population: 59555, surface: 2.18, prix_m2: 9800, restaurants: 312, metro: 7 },
            { arr: 10, population: 83459, surface: 2.89, prix_m2: 9500, restaurants: 398, metro: 8 },
            { arr: 11, population: 143202, surface: 3.67, prix_m2: 9200, restaurants: 523, metro: 9 },
            { arr: 12, population: 139866, surface: 16.32, prix_m2: 8500, restaurants: 412, metro: 12 },
            { arr: 13, population: 178907, surface: 7.15, prix_m2: 7800, restaurants: 345, metro: 8 },
            { arr: 14, population: 131445, surface: 5.64, prix_m2: 8900, restaurants: 298, metro: 7 },
            { arr: 15, population: 232554, surface: 8.50, prix_m2: 9100, restaurants: 456, metro: 10 },
            { arr: 16, population: 165446, surface: 7.91, prix_m2: 10500, restaurants: 367, metro: 9 },
            { arr: 17, population: 168654, surface: 5.67, prix_m2: 9600, restaurants: 398, metro: 8 },
            { arr: 18, population: 189966, surface: 6.01, prix_m2: 8700, restaurants: 445, metro: 11 },
            { arr: 19, population: 184991, surface: 6.79, prix_m2: 8200, restaurants: 378, metro: 9 },
            { arr: 20, population: 194668, surface: 5.98, prix_m2: 8400, restaurants: 412, metro: 10 }
        ];

        // Calcul de la densité
        data.forEach(d => {
            d.densite = Math.round(d.population / d.surface);
        });

        // Statistiques
        const totalPop = data.reduce((sum, d) => sum + d.population, 0);
        const avgPrix = Math.round(data.reduce((sum, d) => sum + d.prix_m2, 0) / data.length);
        const avgDensite = Math.round(data.reduce((sum, d) => sum + d.densite, 0) / data.length);
        const totalRestaurants = data.reduce((sum, d) => sum + d.restaurants, 0);

        // Charger D3.js et initialiser le graphique après injection
        setTimeout(async () => {
            try {
                await loadD3js();
                initD3Chart(viewerId, data);
            } catch (error) {
                console.error('❌ [D3.js] Erreur:', error);
            }
        }, 500);

        return `
            <div class="accordion-container" id="${viewerId}" style="margin: 40px auto; max-width: 1200px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <style>
                    #${viewerId} .accordion-header {
                        background-color: #f1f5f9;
                        color: #1e3a8a;
                        cursor: pointer;
                        padding: 18px 25px;
                        width: 100%;
                        text-align: left;
                        border: none;
                        outline: none;
                        font-size: 18px;
                        font-weight: 600;
                        transition: 0.3s;
                        position: relative;
                        border-top: 1px solid #cbd5e1;
                    }
                    #${viewerId} .accordion-header:first-of-type {
                        border-top: none;
                        border-radius: 8px 8px 0 0;
                    }
                    #${viewerId} .accordion-header:hover,
                    #${viewerId} .accordion-header.active {
                        background-color: #667eea;
                        color: white;
                    }
                    #${viewerId} .accordion-header::after {
                        content: '＋';
                        font-size: 20px;
                        position: absolute;
                        right: 25px;
                    }
                    #${viewerId} .accordion-header.active::after {
                        content: '－';
                    }
                    #${viewerId} .accordion-panel {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.4s ease-out;
                        background-color: white;
                        border: 1px solid #e5e7eb;
                        border-top: none;
                    }
                    #${viewerId} .accordion-panel .content {
                        padding: 25px;
                    }
                    #${viewerId} .chart-controls {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                    }
                    #${viewerId} .chart-btn {
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        background: #3498db;
                        color: white;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    #${viewerId} .chart-btn:hover {
                        background: #2980b9;
                        transform: translateY(-2px);
                    }
                    #${viewerId} .chart-btn.active {
                        background: #e74c3c;
                    }
                    #${viewerId} .chart-container {
                        background: #f8f9fa;
                        border-radius: 12px;
                        padding: 20px;
                        overflow-x: auto;
                    }
                    #${viewerId} .tooltip-d3 {
                        position: absolute;
                        padding: 12px 16px;
                        background: rgba(0, 0, 0, 0.9);
                        color: white;
                        border-radius: 8px;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.2s;
                        font-size: 14px;
                        max-width: 250px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        z-index: 1000;
                    }
                    #${viewerId} .tooltip-d3.show {
                        opacity: 1;
                    }
                    #${viewerId} .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                        margin-top: 20px;
                    }
                    #${viewerId} .stat-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 20px;
                        border-radius: 12px;
                        color: white;
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    #${viewerId} .stat-value {
                        font-size: 2em;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    #${viewerId} .stat-label {
                        font-size: 0.9em;
                        opacity: 0.9;
                    }
                    #${viewerId} .bar {
                        transition: all 0.3s ease;
                    }
                    #${viewerId} .bar:hover {
                        opacity: 0.8;
                    }
                    #${viewerId} .axis-label {
                        font-size: 14px;
                        font-weight: 600;
                        fill: #2c3e50;
                    }
                    #${viewerId} .grid line {
                        stroke: #e0e0e0;
                        stroke-opacity: 0.7;
                    }
                </style>
                
                ${generateCoverPage('📊 Visualisation D3.js', 'Case 11 - Arrondissements de Paris')}
                
                <button class="accordion-header active">📊 Graphique Interactif</button>
                <div class="accordion-panel" style="max-height: fit-content;">
                    <div class="content">
                        <div class="chart-controls">
                            <button class="chart-btn active" data-metric="population">Population</button>
                            <button class="chart-btn" data-metric="prix_m2">Prix au m²</button>
                            <button class="chart-btn" data-metric="densite">Densité</button>
                            <button class="chart-btn" data-metric="restaurants">Restaurants</button>
                        </div>
                        <div class="chart-container">
                            <svg id="${viewerId}-svg" width="1100" height="500"></svg>
                        </div>
                        <div class="stats-grid" id="${viewerId}-stats"></div>
                    </div>
                </div>
                
                <button class="accordion-header">📋 Données Brutes</button>
                <div class="accordion-panel">
                    <div class="content">
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <thead>
                                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                        <th style="padding: 12px; border: 1px solid #ddd;">Arr.</th>
                                        <th style="padding: 12px; border: 1px solid #ddd;">Population</th>
                                        <th style="padding: 12px; border: 1px solid #ddd;">Surface (km²)</th>
                                        <th style="padding: 12px; border: 1px solid #ddd;">Densité</th>
                                        <th style="padding: 12px; border: 1px solid #ddd;">Prix/m²</th>
                                        <th style="padding: 12px; border: 1px solid #ddd;">Restaurants</th>
                                        <th style="padding: 12px; border: 1px solid #ddd;">Métros</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.map((d, i) => `
                                        <tr style="background: ${i % 2 === 0 ? '#f9fafb' : 'white'};">
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${d.arr}e</td>
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${d.population.toLocaleString()}</td>
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${d.surface.toFixed(2)}</td>
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${d.densite.toLocaleString()}</td>
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${d.prix_m2.toLocaleString()} €</td>
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${d.restaurants}</td>
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${d.metro}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <button class="accordion-header">📈 Résumé Statistique</button>
                <div class="accordion-panel">
                    <div class="content">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                            <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; text-align: center;">
                                <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${totalPop.toLocaleString()}</div>
                                <div style="color: #666;">Population totale</div>
                            </div>
                            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; text-align: center;">
                                <div style="font-size: 32px; font-weight: bold; color: #92400e;">${avgPrix.toLocaleString()} €</div>
                                <div style="color: #666;">Prix moyen/m²</div>
                            </div>
                            <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 10px; padding: 20px; text-align: center;">
                                <div style="font-size: 32px; font-weight: bold; color: #166534;">${avgDensite.toLocaleString()}</div>
                                <div style="color: #666;">Densité moyenne</div>
                            </div>
                            <div style="background: #fce7f3; border: 2px solid #ec4899; border-radius: 10px; padding: 20px; text-align: center;">
                                <div style="font-size: 32px; font-weight: bold; color: #9d174d;">${totalRestaurants.toLocaleString()}</div>
                                <div style="color: #666;">Total restaurants</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tooltip-d3" id="${viewerId}-tooltip"></div>
            </div>
            
            <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
            <script>
                (function() {
                    const viewerId = '${viewerId}';
                    const container = document.getElementById(viewerId);
                    if (!container) return;
                    
                    // Données
                    const data = ${JSON.stringify(data)};
                    
                    // Configuration
                    const margin = {top: 40, right: 30, bottom: 80, left: 80};
                    const width = 1050 - margin.left - margin.right;
                    const height = 460 - margin.top - margin.bottom;
                    
                    // SVG
                    const svg = d3.select('#' + viewerId + '-svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                    
                    // Échelles
                    const x = d3.scaleBand()
                        .range([0, width])
                        .padding(0.2);
                    
                    const y = d3.scaleLinear()
                        .range([height, 0]);
                    
                    // Axes
                    const xAxis = svg.append('g')
                        .attr('transform', 'translate(0,' + height + ')')
                        .attr('class', 'x-axis');
                    
                    const yAxis = svg.append('g')
                        .attr('class', 'y-axis');
                    
                    // Grille
                    const gridlines = svg.append('g')
                        .attr('class', 'grid');
                    
                    // Labels
                    svg.append('text')
                        .attr('class', 'axis-label')
                        .attr('text-anchor', 'middle')
                        .attr('x', width / 2)
                        .attr('y', height + 50)
                        .text('Arrondissement');
                    
                    const yLabel = svg.append('text')
                        .attr('class', 'axis-label')
                        .attr('text-anchor', 'middle')
                        .attr('transform', 'rotate(-90)')
                        .attr('y', -50)
                        .attr('x', -height / 2);
                    
                    // Tooltip
                    const tooltip = d3.select('#' + viewerId + '-tooltip');
                    
                    // Palette de couleurs
                    const colorScale = d3.scaleSequential()
                        .interpolator(d3.interpolateViridis);
                    
                    // Configurations des métriques
                    const configs = {
                        population: {
                            getValue: d => d.population,
                            label: 'Population',
                            format: d => d.toLocaleString('fr-FR')
                        },
                        prix_m2: {
                            getValue: d => d.prix_m2,
                            label: 'Prix au m² (€)',
                            format: d => d.toLocaleString('fr-FR') + ' €'
                        },
                        densite: {
                            getValue: d => d.densite,
                            label: 'Densité (hab/km²)',
                            format: d => d.toLocaleString('fr-FR')
                        },
                        restaurants: {
                            getValue: d => d.restaurants,
                            label: 'Nombre de restaurants',
                            format: d => d.toLocaleString('fr-FR')
                        }
                    };
                    
                    // Fonction de mise à jour
                    function updateChart(metric) {
                        const config = configs[metric];
                        
                        // Mise à jour des échelles
                        x.domain(data.map(d => d.arr));
                        y.domain([0, d3.max(data, config.getValue) * 1.1]);
                        colorScale.domain([0, d3.max(data, config.getValue)]);
                        
                        // Grille
                        gridlines.call(d3.axisLeft(y).tickSize(-width).tickFormat(''));
                        
                        // Axes
                        xAxis.transition().duration(750).call(d3.axisBottom(x));
                        yAxis.transition().duration(750).call(d3.axisLeft(y).ticks(8).tickFormat(d => d.toLocaleString('fr-FR')));
                        
                        // Label Y
                        yLabel.text(config.label);
                        
                        // Barres
                        const bars = svg.selectAll('.bar').data(data, d => d.arr);
                        
                        bars.exit().transition().duration(750).attr('y', height).attr('height', 0).remove();
                        
                        bars.transition().duration(750)
                            .attr('x', d => x(d.arr))
                            .attr('y', d => y(config.getValue(d)))
                            .attr('width', x.bandwidth())
                            .attr('height', d => height - y(config.getValue(d)))
                            .attr('fill', d => colorScale(config.getValue(d)));
                        
                        bars.enter()
                            .append('rect')
                            .attr('class', 'bar')
                            .attr('x', d => x(d.arr))
                            .attr('y', height)
                            .attr('width', x.bandwidth())
                            .attr('height', 0)
                            .attr('fill', d => colorScale(config.getValue(d)))
                            .on('mouseover', function(event, d) {
                                d3.select(this).transition().duration(200).attr('opacity', 0.7);
                                tooltip.classed('show', true)
                                    .html('<strong>Arrondissement ' + d.arr + '</strong><br/>' +
                                          config.label + ': <strong>' + config.format(config.getValue(d)) + '</strong><br/>' +
                                          'Population: ' + d.population.toLocaleString('fr-FR') + '<br/>' +
                                          'Surface: ' + d.surface + ' km²')
                                    .style('left', (event.pageX + 10) + 'px')
                                    .style('top', (event.pageY - 10) + 'px');
                            })
                            .on('mouseout', function() {
                                d3.select(this).transition().duration(200).attr('opacity', 1);
                                tooltip.classed('show', false);
                            })
                            .transition().duration(750)
                            .attr('y', d => y(config.getValue(d)))
                            .attr('height', d => height - y(config.getValue(d)));
                        
                        // Stats
                        const values = data.map(config.getValue);
                        const stats = [
                            {label: 'Total', value: config.format(d3.sum(values))},
                            {label: 'Moyenne', value: config.format(Math.round(d3.mean(values)))},
                            {label: 'Maximum', value: config.format(d3.max(values))},
                            {label: 'Minimum', value: config.format(d3.min(values))}
                        ];
                        
                        const statsContainer = document.getElementById(viewerId + '-stats');
                        statsContainer.innerHTML = stats.map(s => 
                            '<div class="stat-card"><div class="stat-label">' + s.label + '</div><div class="stat-value">' + s.value + '</div></div>'
                        ).join('');
                    }
                    
                    // Boutons
                    const buttons = container.querySelectorAll('.chart-btn');
                    buttons.forEach(btn => {
                        btn.addEventListener('click', function() {
                            buttons.forEach(b => b.classList.remove('active'));
                            this.classList.add('active');
                            updateChart(this.dataset.metric);
                        });
                    });
                    
                    // Accordéon
                    const headers = container.querySelectorAll('.accordion-header');
                    headers.forEach(header => {
                        header.addEventListener('click', function() {
                            this.classList.toggle('active');
                            const panel = this.nextElementSibling;
                            if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                                panel.style.maxHeight = '0';
                            } else {
                                panel.style.maxHeight = panel.scrollHeight + 'px';
                            }
                        });
                    });
                    
                    // Initialisation
                    updateChart('population');
                })();
            </script>
        `;
    }

    // ============================================
    // CASE 15: YOUTUBE - Lecteur vidéo avec API YouTube IFrame Player
    // ============================================

    // Gestionnaire global pour les players YouTube
    window.YouTubePlayerManager = window.YouTubePlayerManager || {
        players: {},
        apiLoaded: false,
        apiCallbacks: [],

        loadAPI: function () {
            return new Promise((resolve) => {
                if (this.apiLoaded && window.YT && window.YT.Player) {
                    resolve();
                    return;
                }

                this.apiCallbacks.push(resolve);

                if (!document.getElementById('youtube-iframe-api-global')) {
                    const tag = document.createElement('script');
                    tag.id = 'youtube-iframe-api-global';
                    tag.src = 'https://www.youtube.com/iframe_api';
                    document.head.appendChild(tag);

                    const self = this;
                    window.onYouTubeIframeAPIReady = function () {
                        self.apiLoaded = true;
                        console.log('✅ [YOUTUBE API] Chargée avec succès');
                        self.apiCallbacks.forEach(cb => cb());
                        self.apiCallbacks = [];
                    };
                }
            });
        },

        createPlayer: async function (containerId, videoId, callbacks) {
            await this.loadAPI();

            console.log('🎬 [YOUTUBE] Création du player pour:', videoId, 'dans:', containerId);

            const player = new YT.Player(containerId, {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    enablejsapi: 1
                },
                events: {
                    onReady: function (event) {
                        console.log('✅ [YOUTUBE] Player prêt!');
                        if (callbacks && callbacks.onReady) callbacks.onReady(event);
                        event.target.playVideo();
                    },
                    onStateChange: function (event) {
                        if (callbacks && callbacks.onStateChange) callbacks.onStateChange(event);
                    },
                    onError: function (event) {
                        console.error('❌ [YOUTUBE] Erreur:', event.data);
                        if (callbacks && callbacks.onError) callbacks.onError(event);
                    }
                }
            });

            this.players[containerId] = player;
            return player;
        }
    };

    async function handleCase15(table) {
        if (CONFIG.debug) console.log('🎬 Case 15: YOUTUBE - Lecteur avec API YouTube IFrame Player');

        const viewerId = 'youtube-viewer-' + Date.now();
        const playerId = 'yt-player-' + Date.now();

        // URL vidéo par défaut (peut être extraite de la table si présente)
        // Note: dUr1wDUaYzg est une vidéo avec intégration autorisée
        let videoUrl = 'https://youtu.be/dUr1wDUaYzg';
        let videoId = 'dUr1wDUaYzg';

        // Essayer d'extraire l'URL de la table si elle contient un lien YouTube
        const tableText = table.textContent || '';
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = tableText.match(youtubeRegex);
        if (match && match[1]) {
            videoId = match[1];
            videoUrl = `https://youtu.be/${videoId}`;
            if (CONFIG.debug) console.log('🎬 [YOUTUBE] ID vidéo extrait:', videoId);
        }

        // URLs
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const thumbnailFallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Mode d'affichage: 'embed' essaie l'iframe, 'link' affiche directement le lien YouTube
        // Certaines vidéos ont l'embed bloqué même avec l'autorisation activée (erreur 153)
        const displayMode = 'hybrid'; // 'embed', 'link', ou 'hybrid' (essaie embed puis fallback)

        // Stocker les infos pour l'initialisation
        window['ytConfig_' + viewerId] = { viewerId, playerId, videoId, displayMode };

        return `
            <div class="accordion-container" id="${viewerId}" style="margin: 40px auto; max-width: 1200px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <style>
                    #${viewerId} .accordion-header {
                        background-color: #f1f5f9;
                        color: #1e3a8a;
                        cursor: pointer;
                        padding: 18px 25px;
                        width: 100%;
                        text-align: left;
                        border: none;
                        outline: none;
                        font-size: 18px;
                        font-weight: 600;
                        transition: 0.3s;
                        position: relative;
                        border-top: 1px solid #cbd5e1;
                    }
                    #${viewerId} .accordion-header:first-of-type {
                        border-top: none;
                        border-radius: 8px 8px 0 0;
                    }
                    #${viewerId} .accordion-header:hover,
                    #${viewerId} .accordion-header.active {
                        background-color: #ff0000;
                        color: white;
                    }
                    #${viewerId} .accordion-header::after {
                        content: '＋';
                        font-size: 20px;
                        position: absolute;
                        right: 25px;
                    }
                    #${viewerId} .accordion-header.active::after {
                        content: '－';
                    }
                    #${viewerId} .accordion-panel {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.4s ease-out;
                        background-color: white;
                        border: 1px solid #e5e7eb;
                        border-top: none;
                    }
                    #${viewerId} .accordion-panel .content {
                        padding: 25px;
                    }
                    #${viewerId} .youtube-player-wrapper {
                        position: relative;
                        width: 100%;
                        max-width: 900px;
                        margin: 0 auto;
                        padding-bottom: 56.25%;
                        height: 0;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                        background: #000;
                    }
                    #${viewerId} .youtube-thumbnail {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        cursor: pointer;
                        transition: opacity 0.3s ease;
                    }
                    #${viewerId} .youtube-thumbnail:hover {
                        opacity: 0.9;
                    }
                    #${viewerId} .play-button {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 90px;
                        height: 64px;
                        background: rgba(255, 0, 0, 0.9);
                        border-radius: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                    }
                    #${viewerId} .play-button:hover {
                        background: rgba(255, 0, 0, 1);
                        transform: translate(-50%, -50%) scale(1.1);
                    }
                    #${viewerId} .play-button::after {
                        content: '';
                        width: 0;
                        height: 0;
                        border-left: 26px solid white;
                        border-top: 15px solid transparent;
                        border-bottom: 15px solid transparent;
                        margin-left: 6px;
                    }
                    #${viewerId} .youtube-iframe {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                    }
                    #${viewerId} .video-controls {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 20px;
                        flex-wrap: wrap;
                    }
                    #${viewerId} .video-btn {
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        background: #ff0000;
                        color: white;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    }
                    #${viewerId} .video-btn:hover {
                        background: #cc0000;
                        transform: translateY(-2px);
                    }
                    #${viewerId} .video-btn.secondary {
                        background: #374151;
                    }
                    #${viewerId} .video-btn.secondary:hover {
                        background: #1f2937;
                    }
                    #${viewerId} .video-info {
                        background: #f8f9fa;
                        border-radius: 10px;
                        padding: 20px;
                        margin-top: 20px;
                    }
                    #${viewerId} .video-info-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 10px;
                        font-size: 14px;
                        color: #666;
                    }
                    #${viewerId} .video-info-item:last-child {
                        margin-bottom: 0;
                    }
                    #${viewerId} .cover-page {
                        background: linear-gradient(135deg, rgba(255, 0, 0, 0.85) 0%, rgba(139, 0, 0, 0.85) 100%);
                        color: white;
                        padding: 80px 40px;
                        text-align: center;
                        min-height: 300px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        border-radius: 0 0 8px 8px;
                    }
                    #${viewerId} .cover-title {
                        font-size: 48px;
                        font-weight: 700;
                        margin-bottom: 20px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    }
                    #${viewerId} .cover-subtitle {
                        font-size: 24px;
                        font-weight: 600;
                        margin-bottom: 30px;
                        text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                    }
                    #${viewerId} .click-to-play {
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                        margin-top: 15px;
                    }
                </style>
                
                <button class="accordion-header active">📖 Page de Couverture</button>
                <div class="accordion-panel" style="max-height: fit-content;">
                    <div class="cover-page">
                        <div style="font-size: 80px; margin-bottom: 20px;">▶️</div>
                        <h1 class="cover-title">Vidéo YouTube</h1>
                        <h2 class="cover-subtitle">Case 15 - Lecteur Intégré</h2>
                        <div style="font-size: 18px; opacity: 0.95;">E-AUDIT PRO 2.0 - Contenu Multimédia</div>
                    </div>
                </div>
                
                <button class="accordion-header active">🎬 Lecteur Vidéo</button>
                <div class="accordion-panel" style="max-height: fit-content;">
                    <div class="content">
                        <div class="youtube-player-wrapper" id="${viewerId}-player">
                            <!-- Overlay avec miniature (visible avant lecture) -->
                            <div id="${viewerId}-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10;">
                                <img 
                                    src="${thumbnailUrl}" 
                                    alt="Cliquez pour lire la vidéo"
                                    class="youtube-thumbnail"
                                    id="${viewerId}-thumbnail"
                                    onerror="this.src='${thumbnailFallback}'"
                                />
                                <div class="play-button" id="${viewerId}-play-btn"></div>
                            </div>
                            <!-- Conteneur pour le player YouTube API -->
                            <div id="${playerId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
                        </div>
                        <p class="click-to-play" id="${viewerId}-hint">👆 Cliquez sur la vidéo pour la lire directement dans l'application</p>
                        
                        <div class="video-controls">
                            <button class="video-btn" id="${viewerId}-play-inline">
                                ▶️ Lire la vidéo
                            </button>
                            <button class="video-btn secondary" id="${viewerId}-pause-btn" style="display: none;">
                                ⏸️ Pause
                            </button>
                            <button class="video-btn secondary" id="${viewerId}-stop-btn" style="display: none;">
                                ⏹️ Arrêter
                            </button>
                            <a href="${watchUrl}" target="_blank" class="video-btn secondary" style="text-decoration: none;">
                                🔗 Ouvrir sur YouTube
                            </a>
                        </div>
                        
                        <div class="video-info">
                            <div class="video-info-item">
                                <span style="font-size: 20px;">🎬</span>
                                <span><strong>ID Vidéo:</strong> ${videoId}</span>
                            </div>
                            <div class="video-info-item">
                                <span style="font-size: 20px;">🔗</span>
                                <span><strong>URL:</strong> <a href="${watchUrl}" target="_blank" style="color: #ff0000;">${watchUrl}</a></span>
                            </div>
                            <div class="video-info-item">
                                <span style="font-size: 20px;">✅</span>
                                <span><strong>Mode:</strong> Lecture intégrée via API YouTube IFrame Player</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button class="accordion-header">ℹ️ Informations</button>
                <div class="accordion-panel">
                    <div class="content">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                            <div style="background: linear-gradient(135deg, #ff0000 0%, #8b0000 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 40px; margin-bottom: 10px;">▶️</div>
                                <div style="font-size: 18px; font-weight: bold;">Lecture Directe</div>
                                <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Cliquez pour jouer</div>
                            </div>
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 40px; margin-bottom: 10px;">🖼️</div>
                                <div style="font-size: 18px; font-weight: bold;">Miniature HD</div>
                                <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Aperçu haute qualité</div>
                            </div>
                            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
                                <div style="font-size: 18px; font-weight: bold;">Compatible</div>
                                <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Fonctionne partout</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 25px; padding: 20px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px;">
                            <h4 style="color: #1e40af; margin-bottom: 10px;">💡 Comment ça marche ?</h4>
                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                                Ce lecteur utilise l'<strong>API YouTube IFrame Player</strong> officielle pour intégrer la vidéo directement dans l'application.
                                La vidéo se lit dans la page sans ouvrir YouTube dans un nouvel onglet.
                                Vous avez un contrôle total : lecture, pause, arrêt.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Initialisation immédiate avec setTimeout pour garantir que le DOM est prêt
                setTimeout(function() {
                    const viewerId = '${viewerId}';
                    const playerId = '${playerId}';
                    const videoId = '${videoId}';
                    
                    let player = null;
                    let isPlayerReady = false;
                    
                    const container = document.getElementById(viewerId);
                    if (!container) {
                        console.error('❌ [YOUTUBE] Container non trouvé:', viewerId);
                        return;
                    }
                    
                    const overlay = document.getElementById(viewerId + '-overlay');
                    const playInlineBtn = document.getElementById(viewerId + '-play-inline');
                    const pauseBtn = document.getElementById(viewerId + '-pause-btn');
                    const stopBtn = document.getElementById(viewerId + '-stop-btn');
                    const hint = document.getElementById(viewerId + '-hint');
                    
                    console.log('🎬 [YOUTUBE] Initialisation du lecteur - ID:', videoId);
                    console.log('🎬 [YOUTUBE] Overlay trouvé:', !!overlay);
                    console.log('🎬 [YOUTUBE] PlayBtn trouvé:', !!playInlineBtn);
                    
                    // Charger l'API YouTube
                    function loadYouTubeAPI() {
                        return new Promise(function(resolve) {
                            if (window.YT && window.YT.Player) {
                                console.log('✅ [YOUTUBE] API déjà chargée');
                                resolve();
                                return;
                            }
                            
                            console.log('🔄 [YOUTUBE] Chargement de l\\'API...');
                            
                            if (!document.getElementById('youtube-iframe-api-script')) {
                                var tag = document.createElement('script');
                                tag.id = 'youtube-iframe-api-script';
                                tag.src = 'https://www.youtube.com/iframe_api';
                                document.head.appendChild(tag);
                            }
                            
                            // Attendre que l'API soit prête
                            var checkAPI = setInterval(function() {
                                if (window.YT && window.YT.Player) {
                                    clearInterval(checkAPI);
                                    console.log('✅ [YOUTUBE] API chargée!');
                                    resolve();
                                }
                            }, 100);
                            
                            // Timeout après 10 secondes
                            setTimeout(function() {
                                clearInterval(checkAPI);
                                console.error('❌ [YOUTUBE] Timeout chargement API');
                            }, 10000);
                        });
                    }
                    
                    // Créer le player YouTube
                    function createPlayer() {
                        if (player && isPlayerReady) {
                            console.log('🎬 [YOUTUBE] Player existe, lecture...');
                            player.playVideo();
                            return;
                        }
                        
                        console.log('🎬 [YOUTUBE] Création du player avec iframe embed...');
                        
                        // SOLUTION: Utiliser iframe embed directe au lieu de l'API YouTube
                        // L'API YouTube IFrame Player peut refuser de se connecter sur localhost
                        // L'iframe embed fonctionne partout sans restrictions
                        
                        // Masquer l'overlay immédiatement
                        if (overlay) overlay.style.display = 'none';
                        if (hint) hint.textContent = '⏳ Chargement de la vidéo...';
                        
                        // Créer l'iframe embed directement
                        var playerContainer = document.getElementById(playerId);
                        if (playerContainer) {
                            var iframe = document.createElement('iframe');
                            iframe.id = playerId + '-iframe';
                            iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1';
                            iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;';
                            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                            iframe.allowFullscreen = true;
                            
                            // Écouter l'événement load de l'iframe
                            iframe.onload = function() {
                                console.log('✅ [YOUTUBE] Iframe chargée');
                                if (hint) hint.textContent = '🎬 Vidéo en cours de lecture';
                            };
                            
                            // Écouter les erreurs YouTube via postMessage
                            var errorHandler = function(event) {
                                if (event.origin !== 'https://www.youtube.com') return;
                                try {
                                    var data = JSON.parse(event.data);
                                    // Détecter les erreurs YouTube
                                    if (data.event === 'onError' || 
                                        (data.info && typeof data.info === 'object' && data.info.errorCode) ||
                                        (data.info && (data.info === 153 || data.info === 150 || data.info === 101))) {
                                        var errorCode = (data.info && data.info.errorCode) ? data.info.errorCode : (data.info || 153);
                                        console.error('❌ [YOUTUBE] Erreur détectée via postMessage:', errorCode);
                                        showEmbedError(playerContainer, videoId, errorCode);
                                        window.removeEventListener('message', errorHandler);
                                    }
                                } catch (e) {}
                            };
                            window.addEventListener('message', errorHandler);
                            
                            // Fonction pour afficher l'erreur d'intégration
                            function showEmbedError(container, vid, errCode) {
                                var watchUrl = 'https://www.youtube.com/watch?v=' + vid;
                                var errorMessages = {
                                    101: 'Lecture intégrée non autorisée',
                                    150: 'Lecture intégrée non autorisée',
                                    153: 'Lecture intégrée désactivée par le propriétaire'
                                };
                                var errMsg = errorMessages[errCode] || 'Erreur ' + errCode;
                                
                                container.innerHTML = '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e 0%, #2d1f3d 100%); border-radius: 8px; padding: 20px; box-sizing: border-box; text-align: center;">' +
                                    '<div style="font-size: 48px; margin-bottom: 15px;">🚫</div>' +
                                    '<h3 style="color: #ff6b6b; margin: 0 0 10px 0; font-size: 18px;">Vidéo non intégrable</h3>' +
                                    '<p style="color: #a0a0a0; margin: 0 0 20px 0; font-size: 14px;">' + errMsg + '<br><small style="color: #666;">Code erreur: ' + errCode + '</small></p>' +
                                    '<a href="' + watchUrl + '" target="_blank" onclick="window.open(this.href, \\'_blank\\'); return false;" style="padding: 12px 24px; background: #ff0000; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; cursor: pointer;">▶️ Regarder sur YouTube</a>' +
                                '</div>';
                                
                                if (hint) hint.textContent = '⚠️ Cette vidéo doit être regardée sur YouTube';
                            }
                            
                            // Timeout de sécurité: après 3 secondes, vérifier si la vidéo joue
                            setTimeout(function() {
                                // Si le hint indique toujours "Chargement", proposer le lien YouTube
                                if (hint && hint.textContent.includes('Chargement')) {
                                    hint.innerHTML = '⚠️ La vidéo met du temps à charger. <a href="https://www.youtube.com/watch?v=' + videoId + '" target="_blank" style="color: #ff0000; font-weight: bold;">Ouvrir sur YouTube →</a>';
                                }
                            }, 3000);
                            
                            playerContainer.innerHTML = '';
                            playerContainer.appendChild(iframe);
                            
                            // Timeout de sécurité: si après 5 secondes l'iframe affiche une erreur
                            // (détectable par l'absence de contenu vidéo), afficher le fallback
                            setTimeout(function() {
                                try {
                                    // Vérifier si l'iframe existe toujours et si elle a un contenu
                                    var currentIframe = document.getElementById(playerId + '-iframe');
                                    if (currentIframe) {
                                        // L'iframe existe, vérifier si elle a chargé correctement
                                        // On ne peut pas accéder au contenu cross-origin, mais on peut
                                        // vérifier si le hint indique toujours "chargement"
                                        if (hint && hint.textContent.includes('Chargement')) {
                                            console.warn('⚠️ [YOUTUBE] Timeout - la vidéo ne semble pas charger');
                                            // Ne pas afficher l'erreur automatiquement, juste mettre à jour le hint
                                            hint.innerHTML = '⚠️ Si la vidéo ne se charge pas, <a href="https://www.youtube.com/watch?v=' + videoId + '" target="_blank" style="color: #ff0000;">cliquez ici pour l\\'ouvrir sur YouTube</a>';
                                        }
                                    }
                                } catch (e) {
                                    console.log('ℹ️ [YOUTUBE] Vérification timeout ignorée');
                                }
                            }, 5000);
                            
                            isPlayerReady = true;
                            console.log('✅ [YOUTUBE] Iframe embed créée avec succès!');
                            
                            // Mettre à jour l'UI
                            if (playInlineBtn) {
                                playInlineBtn.innerHTML = '✅ En lecture';
                                playInlineBtn.style.background = '#22c55e';
                            }
                            if (pauseBtn) pauseBtn.style.display = 'none'; // Pas de contrôle pause avec iframe
                            if (stopBtn) stopBtn.style.display = 'inline-flex';
                            if (hint) hint.textContent = '🎬 Vidéo en cours de lecture (utilisez les contrôles YouTube)';
                            
                            // Stocker la référence de l'iframe
                            player = { iframe: iframe, videoId: videoId };
                        } else {
                            console.error('❌ [YOUTUBE] Container non trouvé:', playerId);
                            if (hint) hint.textContent = '❌ Erreur: Container non trouvé';
                        }
                    }
                    
                    // Contrôles adaptés pour iframe embed
                    function playVideo() {
                        if (!isPlayerReady) {
                            createPlayer();
                        } else {
                            // Avec iframe embed, on recrée simplement l'iframe
                            createPlayer();
                        }
                    }
                    
                    function pauseVideo() {
                        // Note: Pas de contrôle pause direct avec iframe embed
                        // L'utilisateur utilise les contrôles YouTube intégrés
                        console.log('ℹ️ [YOUTUBE] Utilisez les contrôles YouTube pour pause');
                    }
                    
                    function stopVideo() {
                        if (player && player.iframe) {
                            // Supprimer l'iframe pour arrêter la vidéo
                            var playerContainer = document.getElementById(playerId);
                            if (playerContainer) playerContainer.innerHTML = '';
                            
                            player = null;
                            isPlayerReady = false;
                            
                            if (overlay) overlay.style.display = 'block';
                            if (playInlineBtn) {
                                playInlineBtn.innerHTML = '▶️ Lire la vidéo';
                                playInlineBtn.style.background = '#ff0000';
                            }
                            if (pauseBtn) pauseBtn.style.display = 'none';
                            if (stopBtn) stopBtn.style.display = 'none';
                            if (hint) hint.textContent = '👆 Cliquez sur la vidéo pour la lire';
                            
                            console.log('⏹️ [YOUTUBE] Vidéo arrêtée');
                        }
                    }
                    
                    // Événements - avec vérification
                    if (overlay) {
                        overlay.style.cursor = 'pointer';
                        overlay.onclick = function() {
                            console.log('🖱️ [YOUTUBE] Clic sur overlay');
                            createPlayer();
                        };
                    }
                    
                    if (playInlineBtn) {
                        playInlineBtn.onclick = function() {
                            console.log('🖱️ [YOUTUBE] Clic sur bouton play');
                            playVideo();
                        };
                    }
                    
                    if (pauseBtn) {
                        pauseBtn.onclick = pauseVideo;
                    }
                    
                    if (stopBtn) {
                        stopBtn.onclick = stopVideo;
                    }
                    
                    // Accordéon
                    var headers = container.querySelectorAll('.accordion-header');
                    headers.forEach(function(header) {
                        header.addEventListener('click', function() {
                            this.classList.toggle('active');
                            var panel = this.nextElementSibling;
                            if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                                panel.style.maxHeight = '0';
                            } else {
                                panel.style.maxHeight = panel.scrollHeight + 'px';
                            }
                        });
                    });
                    
                    console.log('✅ [YOUTUBE] Lecteur initialisé - Cliquez pour lire - ID:', videoId);
                }, 100);
            </script>
        `;
    }

    async function handleCase8(table) {
        if (CONFIG.debug) console.log('☁️ Case 8: n8n_doc - Téléchargement automatique du contenu');

        const docId = '1qaymPK-_nfCYxDO8KVylijXvi11oSpr5zsEEhwTzz5I';
        const viewerId = 'n8n-doc-viewer-' + Date.now();

        // Essayer de charger le contenu depuis plusieurs sources
        let htmlContent = '';

        // 1. D'abord essayer le fichier local
        try {
            const localResponse = await fetch('/ressource/n8n_doc.html');
            if (localResponse.ok) {
                const localHtml = await localResponse.text();
                // Vérifier si c'est un vrai contenu (pas le placeholder)
                if (!localHtml.includes('placeholder') && !localHtml.includes('sera remplacé') && localHtml.length > 500) {
                    htmlContent = localHtml;
                    console.log('✅ [N8N_DOC] Contenu chargé depuis fichier local');
                }
            }
        } catch (e) {
            console.log('⚠️ [N8N_DOC] Fichier local non disponible');
        }

        // 2. Si pas de contenu local, essayer via proxy CORS
        if (!htmlContent) {
            const corsProxies = [
                `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://docs.google.com/document/d/${docId}/export?format=html`)}`,
                `https://corsproxy.io/?${encodeURIComponent(`https://docs.google.com/document/d/${docId}/export?format=html`)}`
            ];

            for (const proxyUrl of corsProxies) {
                try {
                    console.log('📥 [N8N_DOC] Tentative via proxy CORS...');
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        htmlContent = await response.text();
                        console.log('✅ [N8N_DOC] Contenu téléchargé via proxy:', htmlContent.length, 'caractères');
                        break;
                    }
                } catch (e) {
                    console.log('⚠️ [N8N_DOC] Proxy échoué:', e.message);
                }
            }
        }

        // 3. Si toujours pas de contenu, message d'erreur
        if (!htmlContent || htmlContent.length < 100) {
            htmlContent = `
                <div style="text-align: center; padding: 60px 40px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                    <h2 style="color: #f59e0b; margin-bottom: 15px;">Document non disponible</h2>
                    <p style="color: #666; margin-bottom: 20px;">Le contenu du document Google Drive n'a pas pu être chargé automatiquement.</p>
                    <p style="color: #999; font-size: 14px;">Veuillez télécharger le document manuellement et le placer dans /ressource/n8n_doc.html</p>
                </div>
            `;
        } else {
            // Nettoyer le HTML
            htmlContent = htmlContent
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
                .replace(/<html[^>]*>/gi, '')
                .replace(/<\/html>/gi, '')
                .replace(/<body[^>]*>/gi, '')
                .replace(/<\/body>/gi, '')
                .replace(/<!DOCTYPE[^>]*>/gi, '');
        }

        return `
            <div class="accordion-container" id="${viewerId}" style="margin: 40px auto; max-width: 1200px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <style>
                    #${viewerId} .accordion-header {
                        background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
                        color: white;
                        cursor: pointer;
                        padding: 18px 25px;
                        width: 100%;
                        text-align: left;
                        border: none;
                        outline: none;
                        font-size: 18px;
                        font-weight: 600;
                        transition: 0.3s;
                        position: relative;
                        border-radius: 8px 8px 0 0;
                    }
                    #${viewerId} .accordion-header:hover {
                        opacity: 0.95;
                    }
                    #${viewerId} .accordion-header::after {
                        content: '－';
                        font-size: 20px;
                        position: absolute;
                        right: 25px;
                    }
                    #${viewerId} .accordion-header.collapsed::after {
                        content: '＋';
                    }
                    #${viewerId} .accordion-panel {
                        background-color: white;
                        border-radius: 0 0 8px 8px;
                        border: 1px solid #e5e7eb;
                        border-top: none;
                        overflow: hidden;
                    }
                    #${viewerId} .document-content {
                        padding: 30px;
                        line-height: 1.8;
                        color: #333;
                    }
                    #${viewerId} .document-content h1, 
                    #${viewerId} .document-content h2, 
                    #${viewerId} .document-content h3 {
                        color: #1e3a8a;
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                    }
                    #${viewerId} .document-content p {
                        margin-bottom: 1em;
                    }
                    #${viewerId} .document-content ul, 
                    #${viewerId} .document-content ol {
                        margin-left: 20px;
                        margin-bottom: 1em;
                    }
                    #${viewerId} .document-content table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1em 0;
                    }
                    #${viewerId} .document-content td, 
                    #${viewerId} .document-content th {
                        border: 1px solid #ddd;
                        padding: 8px;
                    }
                </style>
                
                ${generateCoverPage('Document n8n_doc', 'n8n_doc - Document Cloud')}
                
                <button class="accordion-header" onclick="this.classList.toggle('collapsed'); this.nextElementSibling.style.display = this.classList.contains('collapsed') ? 'none' : 'block';">
                    📄 Contenu du Document
                </button>
                <div class="accordion-panel">
                    <div class="document-content">
                        ${htmlContent}
                    </div>
                </div>
            </div>
        `;
    }

    async function handleCase5(table) {
        if (CONFIG.debug) console.log('📑 Case 5: PARTIE 5 (PDF - Viewer optimisé)');

        // Générer un ID unique pour ce viewer
        const viewerId = 'pdf-viewer-' + Date.now();
        const pdfUrl = '/ressource/PARTIE5.pdf';

        return `
            < div class="accordion-container pdf-viewer-optimized" id = "${viewerId}" style = "margin: 40px auto; max-width: 1400px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;" >
                <style>
                    /* Styles accordéon pour PDF */
                    #${viewerId} .accordion-header-pdf {
                        background-color: #f1f5f9;
                        color: #1e3a8a;
                        cursor: pointer;
                        padding: 18px 25px;
                        width: 100%;
                        text-align: left;
                        border: none;
                        outline: none;
                        font-size: 18px;
                        font-weight: 600;
                        transition: 0.3s;
                        position: relative;
                        border-radius: 8px 8px 0 0;
                    }
                    #${viewerId} .accordion-header-pdf:hover,
                    #${viewerId} .accordion-header-pdf.active {
                        background-color: #667eea;
                        color: white;
                    }
                    #${viewerId} .accordion-header-pdf::after {
                        content: '＋';
                        font-size: 20px;
                        position: absolute;
                        right: 25px;
                    }
                    #${viewerId} .accordion-header-pdf.active::after {
                        content: '－';
                    }
                    #${viewerId} .accordion-panel-pdf {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.4s ease-out;
                        background-color: white;
                        border-radius: 0 0 8px 8px;
                    }
                    
                    /* Styles PDF existants */
                    <style>
                    .pdf-viewer-optimized h2 {
                        color: #667eea;
                        margin-bottom: 20px;
                        text-align: center;
                        font-size: 28px;
                        font-weight: 700;
                    }
                    .pdf-viewer-optimized .pdf-controls {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 15px;
                        text-align: center;
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        flex-wrap: wrap;
                    }
                    .pdf-viewer-optimized .pdf-controls a,
                    .pdf-viewer-optimized .pdf-controls button {
                        color: white;
                        text-decoration: none;
                        font-weight: 600;
                        padding: 10px 20px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        border-radius: 5px;
                        transition: all 0.3s;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .pdf-viewer-optimized .pdf-controls a:hover,
                    .pdf-viewer-optimized .pdf-controls button:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateY(-2px);
                    }
                    .pdf-viewer-optimized .pdf-controls button.active {
                        background: rgba(255, 255, 255, 0.4);
                        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
                    }
                    .pdf-viewer-optimized .bookmark-controls {
                        background: #f3f4f6;
                        padding: 12px;
                        border-radius: 8px;
                        margin-bottom: 15px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 15px;
                        flex-wrap: wrap;
                    }
                    .pdf-viewer-optimized .bookmark-controls span {
                        color: #4b5563;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    .pdf-viewer-optimized .bookmark-controls button {
                        padding: 8px 16px;
                        border: 2px solid #667eea;
                        background: white;
                        color: #667eea;
                        font-weight: 600;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-size: 13px;
                    }
                    .pdf-viewer-optimized .bookmark-controls button:hover {
                        background: #667eea;
                        color: white;
                        transform: translateY(-1px);
                    }
                    .pdf-viewer-optimized .bookmark-controls button.active {
                        background: #667eea;
                        color: white;
                        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                    }
                    .pdf-viewer-optimized .pdf-container {
                        position: relative;
                        width: 100%;
                        height: 900px;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        overflow: hidden;
                        background: #f3f4f6;
                    }
                    .pdf-viewer-optimized embed {
                        width: 100%;
                        height: 100%;
                        display: block;
                    }
                    .pdf-viewer-optimized .pdf-info {
                        text-align: center;
                        margin-top: 15px;
                        padding: 10px;
                        background: #f9fafb;
                        border-radius: 5px;
                        color: #666;
                        font-size: 13px;
                    }
                    .pdf-viewer-optimized .pdf-tips {
                        margin-top: 10px;
                        padding: 12px;
                        background: #eff6ff;
                        border-left: 4px solid #3b82f6;
                        border-radius: 4px;
                        font-size: 13px;
                        color: #1e40af;
                    }
                    /* Scrollbar personnalisée pour le conteneur */
                    .pdf-viewer-optimized .pdf-container::-webkit-scrollbar {
                        width: 14px;
                        height: 14px;
                    }
                    .pdf-viewer-optimized .pdf-container::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 10px;
                    }
                    .pdf-viewer-optimized .pdf-container::-webkit-scrollbar-thumb {
                        background: #667eea;
                        border-radius: 10px;
                        border: 2px solid #f1f1f1;
                    }
                    .pdf-viewer-optimized .pdf-container::-webkit-scrollbar-thumb:hover {
                        background: #5568d3;
                    }
                </style>
                
                ${generateCoverPage('Document PDF', 'PARTIE 5 - Guide Complet')}
                
                <button class="accordion-header-pdf active">📑 Viewer PDF</button>
                <div class="accordion-panel-pdf" style="max-height: fit-content;">
                
                <div class="pdf-controls">
                    <a href="${pdfUrl}" target="_blank">
                        🔗 Ouvrir dans un nouvel onglet
                    </a>
                    <a href="${pdfUrl}" download>
                        ⬇️ Télécharger le PDF
                    </a>
                    <button onclick="document.querySelector('#${viewerId} embed').requestFullscreen()">
                        ⛶ Plein écran
                    </button>
                </div>
                
                <div class="bookmark-controls">
                    <span>📑 Panneau des signets :</span>
                    <button id="${viewerId}-bookmark-off" class="active" onclick="toggleBookmarks('${viewerId}', false)">
                        ✖️ Masqué (par défaut)
                    </button>
                    <button id="${viewerId}-bookmark-on" onclick="toggleBookmarks('${viewerId}', true)">
                        ✔️ Affiché
                    </button>
                </div>
                
                <div class="pdf-container">
                    <embed 
                        id="${viewerId}-embed"
                        src="${pdfUrl}#navpanes=0&toolbar=1&view=FitH&zoom=125"
                        type="application/pdf">
                </div>
                
                <script>
                    // Fonction pour basculer l'affichage des signets
                    window.toggleBookmarks = function(viewerId, show) {
                        const embed = document.querySelector('#' + viewerId + '-embed');
                        const btnOff = document.querySelector('#' + viewerId + '-bookmark-off');
                        const btnOn = document.querySelector('#' + viewerId + '-bookmark-on');
                        
                        if (!embed) return;
                        
                        // Construire la nouvelle URL
                        const baseUrl = '${pdfUrl}';
                        const navpanes = show ? 1 : 0;
                        const newUrl = baseUrl + '#navpanes=' + navpanes + '&toolbar=1&view=FitH&zoom=125';
                        
                        // Mettre à jour l'embed
                        embed.src = newUrl;
                        
                        // Mettre à jour les boutons
                        if (show) {
                            btnOn.classList.add('active');
                            btnOff.classList.remove('active');
                        } else {
                            btnOff.classList.add('active');
                            btnOn.classList.remove('active');
                        }
                        
                        console.log('📑 Signets ' + (show ? 'affichés' : 'masqués'));
                    };
                </script>
                
                <div class="pdf-info">
                    📄 Viewer PDF optimisé - Zoom 125% - Signets masqués par défaut
                </div>
                
                <div class="pdf-tips">
                    💡 <strong>Astuces :</strong> Utilisez Ctrl + Molette pour zoomer | Cliquez sur "Plein écran" pour une meilleure lecture | La barre de défilement horizontale est plus large pour faciliter la navigation
                </div>
                
                </div><!-- Fin accordion-panel-pdf -->
            </div><!--Fin accordion - container-- >

            <script>
                (function() {
                    const header = document.querySelector('#${viewerId} .accordion-header-pdf');
                const panel = document.querySelector('#${viewerId} .accordion-panel-pdf');

                header.addEventListener('click', function() {
                    this.classList.toggle('active');
                if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                    panel.style.maxHeight = '0';
                        } else {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                        }
                    });
                })();
            </script>
        `;
    }

    // ============================================
    // DÉTECTION ET INJECTION
    // ============================================

    function detectAllTemplateTables() {
        const allTables = document.querySelectorAll(CONFIG.selectors.baseTables);
        const detections = [];

        allTables.forEach((table, index) => {
            // Vérifier si la table contient "Template" dans les en-têtes
            if (!tableContainsKeywords(table, CONFIG.keywords.template)) {
                return;
            }

            if (CONFIG.debug) {
                console.log(`   Table ${index + 1} (Template): ${table.textContent.substring(0, 50)}...`);
            }

            // Déterminer le type PARTIE, n8n_doc ou Pandas
            let type = null;
            if (tableContainsKeywords(table, CONFIG.keywords.partie1)) type = 'PARTIE1';
            else if (tableContainsKeywords(table, CONFIG.keywords.partie2)) type = 'PARTIE2';
            else if (tableContainsKeywords(table, CONFIG.keywords.partie3)) type = 'PARTIE3';
            else if (tableContainsKeywords(table, CONFIG.keywords.partie4)) type = 'PARTIE4';
            else if (tableContainsKeywords(table, CONFIG.keywords.partie5)) type = 'PARTIE5';
            else if (tableContainsKeywords(table, CONFIG.keywords.n8n_doc)) type = 'N8N_DOC';
            else if (tableContainsKeywords(table, CONFIG.keywords.pandas)) type = 'PANDAS';
            else if (tableContainsKeywords(table, CONFIG.keywords.chart)) type = 'CHART';
            else if (tableContainsKeywords(table, CONFIG.keywords.youtube)) type = 'YOUTUBE';

            if (type) {
                if (CONFIG.debug) console.log(`   ✅ ${type} détectée`);
                detections.push({ type, table, index });
            }
        });

        return detections;
    }

    async function injectTemplate(table, templateHTML, index) {
        // Créer un conteneur unique pour ce template
        const container = document.createElement('div');
        container.className = 'modelisation-template-container';
        container.setAttribute('data-template-index', index);
        container.innerHTML = templateHTML;

        // Injecter juste après la table
        table.parentNode.insertBefore(container, table.nextSibling);

        // IMPORTANT: Exécuter les scripts injectés (innerHTML ne les exécute pas automatiquement)
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            // Copier les attributs
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            // Copier le contenu
            newScript.textContent = oldScript.textContent;
            // Remplacer l'ancien script par le nouveau (qui sera exécuté)
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        // Initialiser l'accordéon si présent
        const headers = container.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', function () {
                this.classList.toggle('active');
                const panel = this.nextElementSibling;
                if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                    panel.style.maxHeight = '0';
                } else {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });

        if (CONFIG.debug) console.log(`✅ Template ${index + 1} injecté avec scripts exécutés`);
    }

    // ============================================
    // FONCTION PRINCIPALE
    // ============================================

    // Variable pour éviter les exécutions multiples
    let isExecuting = false;
    const processedTables = new WeakSet();

    async function executeModelisation() {
        // Éviter les exécutions simultanées
        if (isExecuting) {
            if (CONFIG.debug) console.log('⏳ Exécution déjà en cours, skip');
            return;
        }
        isExecuting = true;

        if (CONFIG.debug) console.log('🚀 Modelisation_template_v2.js - Génération séparée (Critère: Template)');

        const detections = detectAllTemplateTables();

        if (detections.length === 0) {
            if (CONFIG.debug) console.log('⚠️ Aucune table Template avec PARTIE ou n8n_doc détectée');
            isExecuting = false;
            return;
        }

        if (CONFIG.debug) console.log(`📊 ${detections.length} document(s) à générer`);

        // Générer un document pour chaque détection
        for (let i = 0; i < detections.length; i++) {
            const detection = detections[i];

            // Vérifier si cette table a déjà été traitée (WeakSet)
            if (processedTables.has(detection.table)) {
                if (CONFIG.debug) console.log(`⚠️ Table ${i + 1} déjà traitée (WeakSet), skip`);
                continue;
            }

            // Vérifier si déjà injecté via data-attribute
            if (detection.table.hasAttribute('data-template-processed')) {
                if (CONFIG.debug) console.log(`⚠️ Table ${i + 1} déjà traitée (data-attr), skip`);
                continue;
            }

            // Vérifier si un conteneur existe déjà après la table
            const existingContainer = detection.table.nextElementSibling;
            if (existingContainer && existingContainer.classList.contains('modelisation-template-container')) {
                if (CONFIG.debug) console.log(`⚠️ Template ${i + 1} déjà injecté, skip`);
                processedTables.add(detection.table);
                detection.table.setAttribute('data-template-processed', 'true');
                continue;
            }

            // Marquer la table comme traitée AVANT de générer le template
            processedTables.add(detection.table);
            detection.table.setAttribute('data-template-processed', 'true');

            let templateHTML = '';

            switch (detection.type) {
                case 'PARTIE1':
                    templateHTML = await handleCase1(detection.table);
                    break;
                case 'PARTIE2':
                    templateHTML = await handleCase2(detection.table);
                    break;
                case 'PARTIE3':
                    templateHTML = await handleCase3(detection.table);
                    break;
                case 'PARTIE4':
                    templateHTML = await handleCase4(detection.table);
                    break;
                case 'PARTIE5':
                    templateHTML = await handleCase5(detection.table);
                    break;
                case 'N8N_DOC':
                    templateHTML = await handleCase8(detection.table);
                    break;
                case 'PANDAS':
                    templateHTML = await handleCase10(detection.table);
                    break;
                case 'CHART':
                    templateHTML = await handleCase11(detection.table);
                    break;
                case 'YOUTUBE':
                    templateHTML = await handleCase15(detection.table);
                    break;
            }

            if (templateHTML) {
                await injectTemplate(detection.table, templateHTML, i);
            }
        }

        if (CONFIG.debug) console.log('✅ Génération terminée');
        isExecuting = false;
    }

    // ============================================
    // OBSERVATEUR
    // ============================================

    // Debounce pour éviter les appels multiples
    let debounceTimer = null;

    function initializeMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldExecute = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Ignorer les conteneurs qu'on a nous-mêmes créés
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('modelisation-template-container')) {
                                return; // Ignorer nos propres injections
                            }
                            if (node.tagName === 'TABLE' || node.querySelector('table')) {
                                // Vérifier que la table n'est pas déjà traitée
                                const tables = node.tagName === 'TABLE' ? [node] : node.querySelectorAll('table');
                                tables.forEach(table => {
                                    if (!table.hasAttribute('data-template-processed')) {
                                        shouldExecute = true;
                                    }
                                });
                            }
                        }
                    });
                }
            });
            if (shouldExecute) {
                // Debounce: annuler le timer précédent et en créer un nouveau
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }
                debounceTimer = setTimeout(() => {
                    if (CONFIG.debug) console.log('🔄 Nouvelles tables détectées (debounced)');
                    executeModelisation();
                    debounceTimer = null;
                }, 800);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // ============================================
    // INITIALISATION
    // ============================================

    setTimeout(() => {
        executeModelisation();
    }, 2000);

    initializeMutationObserver();

    window.ModelisationTemplateV2 = {
        execute: executeModelisation,
        config: CONFIG
    };

    console.log('✅ Modelisation_template_v2.js chargé');
    console.log('💡 Test: window.ModelisationTemplateV2.execute()');

})();
