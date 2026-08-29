/**
 * Dossier Mission Audit - Menu TreeView V2
 * 
 * Ce script crée un panneau coulissant avec une structure TreeView
 * pour organiser les messages du chat selon la structure d'un dossier
 * de mission d'audit interne.
 * 
 * Fonctionnalités:
 * - Panneau coulissant à droite (50% de l'écran)
 * - Structure TreeView selon l'organisation d'audit
 * - Analyse automatique des messages LLM pour classification
 * - Navigation vers les messages correspondants
 * - Icônes et métadonnées pour chaque item
 */

(function () {
    'use strict';

    console.log('📁 Dossier Mission Audit - Initialisation...');

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        panelId: 'dossier-mission-panel',
        overlayId: 'dossier-mission-overlay',
        debugMode: true
    };

    // Icône pour les documents
    const DOC_ICON = '📄';

    // Structure du dossier de mission d'audit
    const STRUCTURE_DOSSIER = [
        {
            id: 'demarrer',
            label: 'Dossier Démarrer',
            icon: '📁',
            children: []
        },
        {
            id: 'guide',
            label: 'Dossier Guide',
            icon: '📁',
            children: []
        },
        {
            id: 'exercice',
            label: 'Dossier Exercice',
            icon: '📁',
            children: []
        },
        {
            id: 'preparation',
            label: 'Phase de préparation',
            icon: '📂',
            expanded: true,
            children: [
                { id: 'plan-pluriannuel', label: 'Plan pluri-annuel d\'audit interne', icon: '📁' },
                { id: 'planification', label: 'Planification de la mission', icon: '📁' },
                { id: 'lettre-mission', label: 'Lettre de mission', icon: '📁' },
                { id: 'rencontre-direction', label: 'Rencontre avec la Direction de l\'entité auditée', icon: '📁' },
                { id: 'compte-rendu', label: 'Compte rendu de la réunion', icon: '📁' },
                { id: 'reunion-ouverture', label: 'Réunion d\'ouverture', icon: '📁' },
                { id: 'collecte-documentaire', label: 'Collecte documentaire (prise de connaissance du Domaine audité)', icon: '📁' },
                { id: 'cartographie-risques', label: 'Cartographie des risques', icon: '📁' },
                { id: 'plan-approche', label: 'Plan d\'approche – référentiel de contrôle interne', icon: '📁' },
                { id: 'qci', label: 'Questionnaire de contrôle interne', icon: '📁' },
                { id: 'tffa', label: 'Tableau des forces et faiblesses apparentes', icon: '📁' },
                { id: 'rapport-orientation', label: 'Le rapport d\'orientation', icon: '📁' },
                {
                    id: 'programme-travail',
                    label: 'Le programme de travail',
                    icon: '📂',
                    expanded: true,
                    children: [
                        { id: 'pt-etape', label: 'Etape de mission - Programme de travail', icon: DOC_ICON },
                        { id: 'pt-norme', label: 'Norme - 13.6 Programme de travail', icon: DOC_ICON },
                        { id: 'pt-methode', label: 'Méthode - Méthode des contrôles clés par les risques', icon: DOC_ICON },
                        { id: 'pt-reference', label: 'Reference - Programme-001', icon: DOC_ICON }
                    ]
                },
                { id: 'qci-programme', label: 'Le questionnaire de contrôle interne du programme de travail', icon: '📁' }
            ]
        },
        {
            id: 'realisation',
            label: 'Phase de réalisation',
            icon: '📂',
            expanded: true,
            children: [
                { id: 'feuille-couverture', label: 'Feuille couverture', icon: '📁' }
            ]
        },
        {
            id: 'conclusion',
            label: 'Phase de conclusion',
            icon: '📂',
            expanded: true,
            children: [
                { id: 'frap', label: 'LA FRAP = Feuille de Révélation et d\'Analyse de Problème', icon: '📁' },
                { id: 'synthese-frap', label: 'La synthèse des FRAP', icon: '📁' },
                { id: 'rapport-provisoire', label: 'Le rapport provisoire', icon: '📁' },
                { id: 'reunion-cloture', label: 'La réunion de clôture', icon: '📁' },
                { id: 'rapport-final', label: 'Le rapport final', icon: '📁' }
            ]
        },
        {
            id: 'permanent',
            label: 'Dossier Permanent',
            icon: '📁',
            children: []
        },
        {
            id: 'donnees-externes',
            label: 'Données Externes',
            icon: '📁',
            children: []
        },
        {
            id: 'analyse-donnees',
            label: 'Dossier Analyse de données',
            icon: '📁',
            children: []
        },
        {
            id: 'dashboard',
            label: 'Dossier Dashboard',
            icon: '📁',
            children: []
        }
    ];

    // Mapping des mots-clés vers les rubriques
    const KEYWORD_MAPPING = {
        'programme de travail': 'programme-travail',
        'programme-travail': 'programme-travail',
        'programme travail': 'programme-travail',
        'etape mission - programme': 'programme-travail',
        'planification': 'planification',
        'lettre de mission': 'lettre-mission',
        'cartographie': 'cartographie-risques',
        'risque': 'cartographie-risques',
        'questionnaire': 'qci',
        'qci': 'qci',
        'contrôle interne': 'qci',
        'frap': 'frap',
        'révélation': 'frap',
        'analyse de problème': 'frap',
        'rapport final': 'rapport-final',
        'rapport provisoire': 'rapport-provisoire',
        'réunion de clôture': 'reunion-cloture',
        'réunion d\'ouverture': 'reunion-ouverture',
        'collecte documentaire': 'collecte-documentaire',
        'prise de connaissance': 'collecte-documentaire',
        'plan d\'approche': 'plan-approche',
        'référentiel': 'plan-approche',
        'forces et faiblesses': 'tffa',
        'tffa': 'tffa',
        'rapport d\'orientation': 'rapport-orientation',
        'synthèse': 'synthese-frap',
        'feuille couverture': 'feuille-couverture',
        'plan pluriannuel': 'plan-pluriannuel',
        'plan pluri-annuel': 'plan-pluriannuel',
        'compte rendu': 'compte-rendu',
        'rencontre': 'rencontre-direction',
        'direction': 'rencontre-direction'
    };

    // ========================================
    // UTILITAIRES
    // ========================================
    const debug = {
        log: (...args) => CONFIG.debugMode && console.log('📁 [Dossier]', ...args),
        error: (...args) => console.error('❌ [Dossier]', ...args),
        warn: (...args) => console.warn('⚠️ [Dossier]', ...args)
    };

    // ========================================
    // CLASSE PRINCIPALE
    // ========================================
    class DossierMissionMenu {
        constructor() {
            this.isOpen = false;
            this.panel = null;
            this.overlay = null;
            this.expandedNodes = new Set(['preparation', 'realisation', 'conclusion']);
            this.classifiedMessages = new Map(); // rubriqueId -> [messages]
            this.init();
        }

        init() {
            debug.log('Initialisation du menu Dossier Mission');
            this.createPanel();
            this.attachEventListeners();
            debug.log('✅ Menu Dossier Mission initialisé');
        }


        // ========================================
        // CRÉATION DU PANNEAU
        // ========================================
        createPanel() {
            // Supprimer les éléments existants
            const existingPanel = document.getElementById(CONFIG.panelId);
            const existingOverlay = document.getElementById(CONFIG.overlayId);
            if (existingPanel) existingPanel.remove();
            if (existingOverlay) existingOverlay.remove();

            // Créer l'overlay
            this.overlay = document.createElement('div');
            this.overlay.id = CONFIG.overlayId;
            this.overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(4px);
                z-index: 99998;
                display: none;
                opacity: 0;
                transition: opacity 0.2s ease-out;
            `;
            this.overlay.addEventListener('click', () => this.close());
            document.body.appendChild(this.overlay);

            // Créer le panneau
            this.panel = document.createElement('div');
            this.panel.id = CONFIG.panelId;
            this.panel.style.cssText = `
                position: fixed;
                top: 0;
                right: 0;
                height: 100%;
                width: 50%;
                min-width: 500px;
                max-width: 800px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
                z-index: 99999;
                display: none;
                flex-direction: column;
                transform: translateX(100%);
                transition: transform 0.3s ease-out;
                border-left: 1px solid rgba(255, 255, 255, 0.1);
            `;

            // Header du panneau
            const header = this.createHeader();
            this.panel.appendChild(header);

            // Contenu TreeView
            const content = document.createElement('div');
            content.id = 'dossier-treeview-content';
            content.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 16px;
            `;
            this.panel.appendChild(content);

            document.body.appendChild(this.panel);
        }

        createHeader() {
            const header = document.createElement('div');
            header.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%);
            `;

            // Titre avec icône
            const titleContainer = document.createElement('div');
            titleContainer.style.cssText = `display: flex; align-items: center; gap: 12px;`;

            const iconBox = document.createElement('div');
            iconBox.style.cssText = `
                width: 40px;
                height: 40px;
                background: rgba(236, 72, 153, 0.2);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            `;
            iconBox.textContent = '📁';

            const titleText = document.createElement('div');
            titleText.innerHTML = `
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #fff;">Dossier de Mission</h2>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.6);">Structure d'audit interne</p>
            `;

            titleContainer.appendChild(iconBox);
            titleContainer.appendChild(titleText);

            // Boutons d'action
            const actions = document.createElement('div');
            actions.style.cssText = `display: flex; align-items: center; gap: 8px;`;

            // Bouton Actualiser
            const refreshBtn = document.createElement('button');
            refreshBtn.innerHTML = '🔄';
            refreshBtn.title = 'Actualiser';
            refreshBtn.style.cssText = `
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: background 0.2s;
            `;
            refreshBtn.addEventListener('mouseenter', () => refreshBtn.style.background = 'rgba(255, 255, 255, 0.2)');
            refreshBtn.addEventListener('mouseleave', () => refreshBtn.style.background = 'rgba(255, 255, 255, 0.1)');
            refreshBtn.addEventListener('click', () => this.refreshContent());

            // Bouton Fermer
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.title = 'Fermer';
            closeBtn.style.cssText = `
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                color: #fff;
                transition: background 0.2s;
            `;
            closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = 'rgba(239, 68, 68, 0.3)');
            closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = 'rgba(255, 255, 255, 0.1)');
            closeBtn.addEventListener('click', () => this.close());

            actions.appendChild(refreshBtn);
            actions.appendChild(closeBtn);

            header.appendChild(titleContainer);
            header.appendChild(actions);

            return header;
        }

        // ========================================
        // GESTION OUVERTURE/FERMETURE
        // ========================================
        open() {
            if (this.isOpen) return;

            debug.log('Ouverture du panneau Dossier Mission');

            // Afficher overlay et panneau
            this.overlay.style.display = 'block';
            this.panel.style.display = 'flex';

            // Animation
            requestAnimationFrame(() => {
                this.overlay.style.opacity = '1';
                this.panel.style.transform = 'translateX(0)';
            });

            this.isOpen = true;

            // Analyser et afficher le contenu
            this.refreshContent();

            // Écouter Escape
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') this.close();
            };
            document.addEventListener('keydown', this.escapeHandler);
        }

        close() {
            if (!this.isOpen) return;

            debug.log('Fermeture du panneau Dossier Mission');

            // Animation de fermeture
            this.overlay.style.opacity = '0';
            this.panel.style.transform = 'translateX(100%)';

            // Masquer après animation
            setTimeout(() => {
                this.overlay.style.display = 'none';
                this.panel.style.display = 'none';
            }, 300);

            this.isOpen = false;

            // Retirer listener Escape
            if (this.escapeHandler) {
                document.removeEventListener('keydown', this.escapeHandler);
            }
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        // ========================================
        // ANALYSE DES MESSAGES
        // ========================================
        analyzeMessages() {
            debug.log('Analyse des messages du chat...');

            this.classifiedMessages.clear();

            // Trouver tous les messages du système LLM (assistant)
            const messageContainers = document.querySelectorAll('[class*="message"], [class*="assistant"], [data-role="assistant"]');

            // Chercher aussi dans les conteneurs de chat typiques
            const chatMessages = document.querySelectorAll('.prose, .markdown-body, [class*="chat-message"]');

            // Combiner les sélecteurs
            const allMessages = new Set([...messageContainers, ...chatMessages]);

            debug.log(`${allMessages.size} conteneurs de messages trouvés`);

            allMessages.forEach((container, index) => {
                // Ignorer les messages utilisateur
                if (container.closest('[data-role="user"]') ||
                    container.classList.contains('user-message') ||
                    container.querySelector('[data-role="user"]')) {
                    return;
                }

                // Chercher les tables dans ce message
                const tables = container.querySelectorAll('table');
                if (tables.length === 0) return;

                tables.forEach((table, tableIndex) => {
                    const messageData = this.extractMessageData(table, container);
                    if (messageData) {
                        const rubriqueId = this.classifyMessage(messageData);

                        if (!this.classifiedMessages.has(rubriqueId)) {
                            this.classifiedMessages.set(rubriqueId, []);
                        }

                        this.classifiedMessages.get(rubriqueId).push({
                            ...messageData,
                            element: table,
                            container: container,
                            index: `${index}-${tableIndex}`
                        });

                        debug.log(`Table classée dans: ${rubriqueId}`, messageData.etapeMission || messageData.reference);
                    }
                });
            });

            debug.log(`Classification terminée: ${this.classifiedMessages.size} rubriques avec contenu`);
        }

        extractMessageData(table, container) {
            const data = {
                etapeMission: '',
                norme: '',
                methode: '',
                reference: '',
                tables: []
            };

            // Chercher les métadonnées dans la table ou le conteneur
            const allText = table.textContent.toLowerCase();
            const containerText = container.textContent.toLowerCase();

            // Extraire depuis les cellules de la table
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                cells.forEach((cell, idx) => {
                    const text = cell.textContent.trim();
                    const textLower = text.toLowerCase();

                    // Détecter les champs clés
                    if (textLower.includes('etape de mission') || textLower.includes('étape de mission')) {
                        const nextCell = cells[idx + 1];
                        if (nextCell) data.etapeMission = nextCell.textContent.trim();
                    }
                    if (textLower.includes('norme')) {
                        const nextCell = cells[idx + 1];
                        if (nextCell) data.norme = nextCell.textContent.trim();
                    }
                    if (textLower.includes('méthode') || textLower.includes('methode')) {
                        const nextCell = cells[idx + 1];
                        if (nextCell) data.methode = nextCell.textContent.trim();
                    }
                    if (textLower.includes('reference') || textLower.includes('référence')) {
                        const nextCell = cells[idx + 1];
                        if (nextCell) data.reference = nextCell.textContent.trim();
                    }

                    // Chercher directement dans le texte
                    if (textLower === 'programme de travail') data.etapeMission = text;
                    if (textLower.includes('programme-')) data.reference = text;
                });
            });

            // Si pas de données extraites, utiliser le texte brut
            if (!data.etapeMission && !data.reference) {
                // Chercher des patterns dans le texte
                for (const [keyword, rubrique] of Object.entries(KEYWORD_MAPPING)) {
                    if (allText.includes(keyword) || containerText.includes(keyword)) {
                        data.etapeMission = keyword;
                        break;
                    }
                }
            }

            // Retourner null si aucune donnée pertinente
            if (!data.etapeMission && !data.reference && !data.norme) {
                return null;
            }

            return data;
        }

        classifyMessage(messageData) {
            const searchText = `${messageData.etapeMission} ${messageData.reference} ${messageData.norme}`.toLowerCase();

            // Chercher une correspondance dans le mapping
            for (const [keyword, rubriqueId] of Object.entries(KEYWORD_MAPPING)) {
                if (searchText.includes(keyword.toLowerCase())) {
                    return rubriqueId;
                }
            }

            // Par défaut: Données Externes
            return 'donnees-externes';
        }


        // ========================================
        // RENDU DU TREEVIEW
        // ========================================
        refreshContent() {
            debug.log('Actualisation du contenu TreeView');

            // Analyser les messages
            this.analyzeMessages();

            // Rendre le TreeView
            const content = document.getElementById('dossier-treeview-content');
            if (!content) return;

            content.innerHTML = '';

            // Statistiques
            const stats = this.createStatsSection();
            content.appendChild(stats);

            // TreeView
            const treeContainer = document.createElement('div');
            treeContainer.style.cssText = 'margin-top: 16px;';

            STRUCTURE_DOSSIER.forEach((node, index) => {
                const isLast = index === STRUCTURE_DOSSIER.length - 1;
                const nodeElement = this.renderTreeNode(node, 0, isLast, []);
                treeContainer.appendChild(nodeElement);
            });

            content.appendChild(treeContainer);
        }

        createStatsSection() {
            const stats = document.createElement('div');
            stats.style.cssText = `
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 16px;
            `;

            let totalMessages = 0;
            this.classifiedMessages.forEach(messages => {
                totalMessages += messages.length;
            });

            stats.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: rgba(255,255,255,0.7); font-size: 13px;">📊 Tables classées</span>
                    <span style="color: #fff; font-weight: 600; font-size: 16px;">${totalMessages}</span>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: rgba(255,255,255,0.5);">
                    ${this.classifiedMessages.size} rubriques avec contenu
                </div>
            `;

            return stats;
        }

        renderTreeNode(node, level, isLast = false, parentLines = []) {
            const container = document.createElement('div');
            container.style.cssText = `position: relative;`;

            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = this.expandedNodes.has(node.id);
            const messageCount = this.classifiedMessages.get(node.id)?.length || 0;

            // Ligne du noeud avec lignes de connexion
            const nodeRow = document.createElement('div');
            nodeRow.style.cssText = `
                display: flex;
                align-items: center;
                padding: 6px 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
                margin: 1px 0;
                position: relative;
            `;
            nodeRow.addEventListener('mouseenter', () => {
                nodeRow.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            nodeRow.addEventListener('mouseleave', () => {
                nodeRow.style.background = 'transparent';
            });

            // Dessiner les lignes verticales des parents
            if (level > 0) {
                for (let i = 0; i < level; i++) {
                    if (parentLines[i]) {
                        const verticalLine = document.createElement('span');
                        verticalLine.style.cssText = `
                            position: absolute;
                            left: ${i * 20 + 8}px;
                            top: 0;
                            bottom: 0;
                            width: 1px;
                            background: rgba(255, 255, 255, 0.2);
                        `;
                        nodeRow.appendChild(verticalLine);
                    }
                }

                // Ligne horizontale vers le noeud
                const horizontalLine = document.createElement('span');
                horizontalLine.style.cssText = `
                    position: absolute;
                    left: ${(level - 1) * 20 + 8}px;
                    top: 50%;
                    width: 12px;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.2);
                `;
                nodeRow.appendChild(horizontalLine);

                // Ligne verticale du parent vers ce noeud (coude)
                const cornerLine = document.createElement('span');
                cornerLine.style.cssText = `
                    position: absolute;
                    left: ${(level - 1) * 20 + 8}px;
                    top: 0;
                    height: ${isLast ? '50%' : '100%'};
                    width: 1px;
                    background: rgba(255, 255, 255, 0.2);
                `;
                nodeRow.appendChild(cornerLine);
            }

            // Conteneur pour l'indentation
            const indent = document.createElement('span');
            indent.style.cssText = `width: ${level * 20}px; display: inline-block; flex-shrink: 0;`;
            nodeRow.appendChild(indent);

            // Chevron pour les noeuds avec enfants
            if (hasChildren) {
                const chevron = document.createElement('span');
                chevron.textContent = isExpanded ? '▼' : '▶';
                chevron.style.cssText = `
                    font-size: 10px;
                    color: rgba(255,255,255,0.5);
                    margin-right: 6px;
                    width: 12px;
                    text-align: center;
                    flex-shrink: 0;
                `;
                nodeRow.appendChild(chevron);

                nodeRow.addEventListener('click', () => {
                    if (this.expandedNodes.has(node.id)) {
                        this.expandedNodes.delete(node.id);
                    } else {
                        this.expandedNodes.add(node.id);
                    }
                    this.refreshContent();
                });
            } else {
                const spacer = document.createElement('span');
                spacer.style.cssText = 'width: 18px; display: inline-block; flex-shrink: 0;';
                nodeRow.appendChild(spacer);
            }

            // Icône
            const icon = document.createElement('span');
            icon.textContent = node.icon;
            icon.style.cssText = 'margin-right: 8px; font-size: 16px; flex-shrink: 0;';
            nodeRow.appendChild(icon);

            // Label
            const label = document.createElement('span');
            label.textContent = node.label;
            label.style.cssText = `
                color: #fff;
                font-size: 13px;
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            nodeRow.appendChild(label);

            // Badge de comptage
            if (messageCount > 0) {
                const badge = document.createElement('span');
                badge.textContent = messageCount;
                badge.style.cssText = `
                    background: rgba(236, 72, 153, 0.3);
                    color: #ec4899;
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-weight: 600;
                    flex-shrink: 0;
                    margin-left: 8px;
                `;
                nodeRow.appendChild(badge);
            }

            container.appendChild(nodeRow);

            // Enfants
            if (hasChildren && isExpanded) {
                const childrenContainer = document.createElement('div');
                childrenContainer.style.cssText = 'position: relative;';

                node.children.forEach((child, index) => {
                    const isLastChild = index === node.children.length - 1;
                    const newParentLines = [...parentLines, !isLast];
                    const childElement = this.renderTreeNode(child, level + 1, isLastChild, newParentLines);
                    childrenContainer.appendChild(childElement);
                });

                container.appendChild(childrenContainer);
            }

            // Messages classés dans cette rubrique
            if (messageCount > 0 && !hasChildren) {
                const messages = this.classifiedMessages.get(node.id);
                messages.forEach(msg => {
                    const msgItem = this.renderMessageItem(msg);
                    msgItem.style.marginLeft = `${(level + 1) * 16}px`;
                    container.appendChild(msgItem);
                });
            }

            return container;
        }

        renderMessageItem(msg) {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                padding: 6px 12px;
                margin: 2px 0;
                border-radius: 4px;
                cursor: pointer;
                background: rgba(255, 255, 255, 0.03);
                transition: background 0.2s;
            `;

            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(236, 72, 153, 0.1)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255, 255, 255, 0.03)';
            });

            // Clic pour naviguer vers le message
            item.addEventListener('click', () => {
                if (msg.element) {
                    msg.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    msg.element.style.outline = '2px solid #ec4899';
                    setTimeout(() => {
                        msg.element.style.outline = '';
                    }, 2000);
                }
            });

            const icon = document.createElement('span');
            icon.textContent = DOC_ICON;
            icon.style.cssText = 'margin-right: 8px; font-size: 12px;';
            item.appendChild(icon);

            const text = document.createElement('span');
            text.textContent = msg.etapeMission || msg.reference || 'Table';
            text.style.cssText = `
                color: rgba(255,255,255,0.8);
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;
            item.appendChild(text);

            return item;
        }

        // ========================================
        // ÉVÉNEMENTS
        // ========================================
        attachEventListeners() {
            // Écouter le clic sur le bouton Dossier dans la sidebar
            document.addEventListener('click', (e) => {
                const dossierButton = e.target.closest('[data-page="dossier"]');
                if (dossierButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggle();
                }
            });

            // Écouter l'événement personnalisé
            document.addEventListener('dossier:toggle', () => {
                this.toggle();
            });

            debug.log('Event listeners attachés');
        }
    }

    // ========================================
    // INITIALISATION
    // ========================================

    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDossierMenu);
    } else {
        initDossierMenu();
    }

    function initDossierMenu() {
        // Petit délai pour s'assurer que React a rendu la sidebar
        setTimeout(() => {
            window.dossierMissionMenu = new DossierMissionMenu();
            debug.log('✅ Menu Dossier Mission prêt');
        }, 500);
    }

})();