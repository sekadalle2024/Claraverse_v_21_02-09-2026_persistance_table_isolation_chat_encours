/**
 * Gestion Dossier Google Drive V2 - Menu Coulissant Amélioré
 * 
 * Version 2.0 - Intégration complète avec:
 * - Chargement dynamique des fichiers depuis Google Drive
 * - Affichage en accordéon avec Template beta
 * - Gestion CORS via proxies avec fallback
 * - Support multi-formats (Doc, PDF, Sheet, Slides)
 * 
 * Configuration Google Drive:
 * - Folder ID: 13YcsgS1BqRKjGeuSK9RxoAK8vdD3ErBd
 * - Client ID: [VOTRE_GOOGLE_CLIENT_ID]
 * 
 * @author E-Audit Pro Team
 * @version 2.0
 */

(function () {
    'use strict';

    console.log('📂 [V2] Gestion Dossier Google Drive - Initialisation...');

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        panelId: 'gestion-dossier-panel-v2',
        overlayId: 'gestion-dossier-overlay-v2',
        buttonId: 'gestion-electro-btn-v2',
        googleDrive: {
            folderId: '13YcsgS1BqRKjGeuSK9RxoAK8vdD3ErBd',
            clientId: '[VOTRE_GOOGLE_CLIENT_ID]',
            clientSecret: '[VOTRE_GOOGLE_CLIENT_SECRET]'
        },
        corsProxies: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ],
        localResourcePath: '/ressource/',
        configFile: '/ressource/gestion-dossier-files.json',
        debugMode: true
    };

    // Types de fichiers supportés avec leurs icônes et viewers
    const FILE_TYPES = {
        'application/pdf': {
            icon: '📕',
            label: 'PDF',
            color: '#ea4335',
            viewerType: 'iframe'
        },
        'application/vnd.google-apps.document': {
            icon: '📄',
            label: 'Google Doc',
            color: '#4285f4',
            viewerType: 'html'
        },
        'application/vnd.google-apps.spreadsheet': {
            icon: '📊',
            label: 'Google Sheet',
            color: '#34a853',
            viewerType: 'iframe'
        },
        'application/vnd.google-apps.presentation': {
            icon: '📽️',
            label: 'Google Slides',
            color: '#fbbc05',
            viewerType: 'iframe'
        },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
            icon: '📝',
            label: 'Word',
            color: '#2b579a',
            viewerType: 'iframe'
        },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            icon: '📈',
            label: 'Excel',
            color: '#217346',
            viewerType: 'iframe'
        },
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
            icon: '📊',
            label: 'PowerPoint',
            color: '#d24726',
            viewerType: 'iframe'
        },
        'image/jpeg': { icon: '🖼️', label: 'Image', color: '#9c27b0', viewerType: 'image' },
        'image/png': { icon: '🖼️', label: 'Image', color: '#9c27b0', viewerType: 'image' },
        'text/plain': { icon: '📃', label: 'Texte', color: '#607d8b', viewerType: 'text' },
        'default': { icon: '📁', label: 'Fichier', color: '#757575', viewerType: 'generic' }
    };

    // ========================================
    // UTILITAIRES DEBUG
    // ========================================
    const debug = {
        log: (...args) => CONFIG.debugMode && console.log('📂 [GestionDossierV2]', ...args),
        error: (...args) => console.error('❌ [GestionDossierV2]', ...args),
        warn: (...args) => console.warn('⚠️ [GestionDossierV2]', ...args),
        success: (...args) => console.log('✅ [GestionDossierV2]', ...args)
    };

    // ========================================
    // TEMPLATE ACCORDEON (basé sur Template beta)
    // ========================================
    const ACCORDION_STYLES = `
        .gd-accordion-container {
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .gd-accordion-header {
            background-color: rgba(255, 255, 255, 0.05);
            color: #fff;
            cursor: pointer;
            padding: 18px 25px;
            width: 100%;
            text-align: left;
            border: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            outline: none;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .gd-accordion-header:first-of-type {
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .gd-accordion-header:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        .gd-accordion-header.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .gd-accordion-header::after {
            content: '▶';
            font-size: 12px;
            position: absolute;
            right: 25px;
            transition: transform 0.3s ease;
        }
        .gd-accordion-header.active::after {
            transform: rotate(90deg);
        }
        .gd-accordion-panel {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease-out;
            background-color: rgba(0, 0, 0, 0.2);
        }
        .gd-accordion-panel.active {
            max-height: 800px;
        }
        .gd-file-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        .gd-file-info {
            flex: 1;
            min-width: 0;
        }
        .gd-file-name {
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .gd-file-meta {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 4px;
        }
        .gd-content-wrapper {
            padding: 20px;
        }
        .gd-doc-content {
            background: white;
            border-radius: 8px;
            padding: 30px;
            max-height: 600px;
            overflow-y: auto;
            color: #333;
            line-height: 1.7;
            font-size: 14px;
        }
        .gd-iframe-container {
            border-radius: 8px;
            overflow: hidden;
            background: white;
        }
        .gd-iframe-container iframe {
            width: 100%;
            height: 550px;
            border: none;
        }
        .gd-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            gap: 16px;
        }
        .gd-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: #4285f4;
            border-radius: 50%;
            animation: gd-spin 1s linear infinite;
        }
        @keyframes gd-spin {
            to { transform: rotate(360deg); }
        }
        .gd-error-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            color: #ef4444;
        }
    `;


    // ========================================
    // CLASSE PRINCIPALE V2
    // ========================================
    class GestionDossierMenuV2 {
        constructor() {
            this.isOpen = false;
            this.panel = null;
            this.overlay = null;
            this.files = [];
            this.expandedFiles = new Set();
            this.loadedContent = new Map();
            this.isLoading = false;
            this.init();
        }

        init() {
            debug.log('Initialisation du menu Gestion Dossier V2');
            this.injectStyles();
            this.createFloatingButton();
            this.createPanel();
            this.observeSidebarForButton();
            debug.success('Menu Gestion Dossier V2 initialisé');
        }

        // ========================================
        // INJECTION DES STYLES
        // ========================================
        injectStyles() {
            if (document.getElementById('gestion-dossier-v2-styles')) return;

            const styleEl = document.createElement('style');
            styleEl.id = 'gestion-dossier-v2-styles';
            styleEl.textContent = ACCORDION_STYLES;
            document.head.appendChild(styleEl);
        }

        // ========================================
        // CRÉATION DU BOUTON FLOTTANT - DÉSACTIVÉ
        // ========================================
        createFloatingButton() {
            // Bouton flottant désactivé - utiliser uniquement le bouton dans la sidebar
            debug.log('Bouton flottant V2 désactivé');
        }

        // ========================================
        // OBSERVER POUR INJECTER DANS LA SIDEBAR
        // ========================================
        observeSidebarForButton() {
            const checkAndInject = () => {
                const sidebar = document.querySelector('.main-nav-menu nav ul') ||
                    document.querySelector('.main-nav-menu ul') ||
                    document.querySelector('[class*="sidebar"] nav ul');

                if (sidebar && !document.getElementById(CONFIG.buttonId)) {
                    this.injectSidebarButton(sidebar);
                }
            };

            // Vérifier immédiatement
            checkAndInject();

            // Observer les changements
            const observer = new MutationObserver(checkAndInject);
            observer.observe(document.body, { childList: true, subtree: true });

            // Arrêter après 30 secondes
            setTimeout(() => observer.disconnect(), 30000);
        }

        injectSidebarButton(sidebar) {
            const li = document.createElement('li');
            li.id = CONFIG.buttonId + '-container';

            const button = document.createElement('button');
            button.id = CONFIG.buttonId;
            button.className = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800';
            button.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                <span class="text-sm font-medium">GED V2</span>
            `;
            button.title = 'Gestion électronique des documents V2';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });

            li.appendChild(button);
            sidebar.appendChild(li);
            debug.log('Bouton sidebar V2 injecté');
        }

        // ========================================
        // CRÉATION DU PANNEAU COULISSANT
        // ========================================
        createPanel() {
            // Nettoyer les éléments existants
            document.getElementById(CONFIG.panelId)?.remove();
            document.getElementById(CONFIG.overlayId)?.remove();

            // Overlay
            this.overlay = document.createElement('div');
            this.overlay.id = CONFIG.overlayId;
            this.overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 99998;
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease-out;
            `;
            this.overlay.addEventListener('click', () => this.close());
            document.body.appendChild(this.overlay);

            // Panneau principal
            this.panel = document.createElement('div');
            this.panel.id = CONFIG.panelId;
            this.panel.style.cssText = `
                position: fixed;
                top: 0;
                right: 0;
                height: 100%;
                width: 60%;
                min-width: 650px;
                max-width: 950px;
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
                box-shadow: -8px 0 40px rgba(0, 0, 0, 0.5);
                z-index: 99999;
                display: none;
                flex-direction: column;
                transform: translateX(100%);
                transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                border-left: 1px solid rgba(255, 255, 255, 0.1);
            `;

            // Header
            this.panel.appendChild(this.createHeader());

            // Zone de contenu
            const content = document.createElement('div');
            content.id = 'gestion-dossier-content-v2';
            content.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 20px;
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
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: linear-gradient(90deg, rgba(66, 133, 244, 0.2) 0%, rgba(52, 168, 83, 0.1) 50%, transparent 100%);
            `;

            // Titre avec icône Google Drive
            const titleContainer = document.createElement('div');
            titleContainer.style.cssText = `display: flex; align-items: center; gap: 16px;`;

            const iconBox = document.createElement('div');
            iconBox.style.cssText = `
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #4285f4 0%, #34a853 33%, #fbbc05 66%, #ea4335 100%);
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 4px 15px rgba(66, 133, 244, 0.3);
            `;
            iconBox.textContent = '📂';

            const titleText = document.createElement('div');
            titleText.innerHTML = `
                <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px;">
                    Gestion Électronique
                </h2>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.6);">
                    📁 Dossier Google Drive • ID: ${CONFIG.googleDrive.folderId.substring(0, 8)}...
                </p>
            `;

            titleContainer.appendChild(iconBox);
            titleContainer.appendChild(titleText);

            // Boutons d'action
            const actions = document.createElement('div');
            actions.style.cssText = `display: flex; align-items: center; gap: 10px;`;

            // Bouton Actualiser
            const refreshBtn = this.createActionButton('🔄', 'Actualiser la liste', () => this.loadFolderContent(), '#4285f4');
            actions.appendChild(refreshBtn);

            // Bouton Ouvrir Drive
            const driveBtn = this.createActionButton('🌐', 'Ouvrir dans Google Drive', () => {
                window.open(`https://drive.google.com/drive/folders/${CONFIG.googleDrive.folderId}`, '_blank');
            }, '#34a853');
            actions.appendChild(driveBtn);

            // Bouton Fermer
            const closeBtn = this.createActionButton('✕', 'Fermer', () => this.close(), '#ef4444');
            actions.appendChild(closeBtn);

            header.appendChild(titleContainer);
            header.appendChild(actions);

            return header;
        }

        createActionButton(icon, title, onClick, hoverColor = '#4285f4') {
            const btn = document.createElement('button');
            btn.innerHTML = icon;
            btn.title = title;
            btn.style.cssText = `
                width: 42px;
                height: 42px;
                border: none;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                cursor: pointer;
                font-size: 18px;
                color: #fff;
                transition: all 0.2s ease;
            `;
            btn.addEventListener('mouseenter', () => {
                btn.style.background = `${hoverColor}33`;
                btn.style.transform = 'scale(1.08)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.08)';
                btn.style.transform = 'scale(1)';
            });
            btn.addEventListener('click', onClick);
            return btn;
        }

        // ========================================
        // GESTION OUVERTURE/FERMETURE
        // ========================================
        open() {
            if (this.isOpen) return;
            debug.log('Ouverture du panneau');

            this.overlay.style.display = 'block';
            this.panel.style.display = 'flex';

            requestAnimationFrame(() => {
                this.overlay.style.opacity = '1';
                this.panel.style.transform = 'translateX(0)';
            });

            this.isOpen = true;
            this.loadFolderContent();

            // Écouter Escape
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') this.close();
            };
            document.addEventListener('keydown', this.escapeHandler);
        }

        close() {
            if (!this.isOpen) return;
            debug.log('Fermeture du panneau');

            this.overlay.style.opacity = '0';
            this.panel.style.transform = 'translateX(100%)';

            setTimeout(() => {
                this.overlay.style.display = 'none';
                this.panel.style.display = 'none';
            }, 350);

            this.isOpen = false;

            if (this.escapeHandler) {
                document.removeEventListener('keydown', this.escapeHandler);
            }
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }


        // ========================================
        // CHARGEMENT DU CONTENU DU DOSSIER
        // ========================================
        async loadFolderContent() {
            if (this.isLoading) return;
            this.isLoading = true;

            const content = document.getElementById('gestion-dossier-content-v2');
            if (!content) return;

            // Afficher le loader
            content.innerHTML = this.createLoader('Chargement des documents...');

            try {
                // Charger la liste des fichiers
                const files = await this.fetchFolderFiles();
                this.files = files;
                this.renderFileList(content);
                debug.success(`${files.length} fichiers chargés`);
            } catch (error) {
                debug.error('Erreur chargement dossier:', error);
                this.renderError(content, error.message);
            } finally {
                this.isLoading = false;
            }
        }

        async fetchFolderFiles() {
            // Méthode 1: Fichier de configuration local
            try {
                const response = await fetch(CONFIG.configFile);
                if (response.ok) {
                    const data = await response.json();
                    if (data.files && data.files.length > 0) {
                        debug.log('Fichiers chargés depuis config locale:', data.files.length);
                        return data.files;
                    }
                }
            } catch (e) {
                debug.warn('Config locale non disponible:', e.message);
            }

            // Méthode 2: Utiliser get-folder-id.cjs pour rafraîchir (nécessite Node.js)
            debug.warn('Utilisation des fichiers de démonstration');
            return this.getDemoFiles();
        }

        getDemoFiles() {
            return [
                {
                    id: '1qaymPK-_nfCYxDO8KVylijXvi11oSpr5zsEEhwTzz5I',
                    name: 'Guide E-Audit Pro 2.0',
                    mimeType: 'application/vnd.google-apps.document',
                    description: 'Guide pratique - Norme 9.4 Plan d\'audit interne',
                    modifiedTime: '2024-12-20T10:30:00Z'
                },
                {
                    id: 'demo-rapport-audit',
                    name: 'Rapport Audit Annuel 2024',
                    mimeType: 'application/pdf',
                    description: 'Rapport consolidé des missions d\'audit',
                    modifiedTime: '2024-12-15T14:20:00Z'
                },
                {
                    id: 'demo-suivi-reco',
                    name: 'Suivi des Recommandations',
                    mimeType: 'application/vnd.google-apps.spreadsheet',
                    description: 'Tableau de suivi des recommandations d\'audit',
                    modifiedTime: '2024-12-18T09:45:00Z'
                },
                {
                    id: 'demo-procedure-ci',
                    name: 'Procédure de Contrôle Interne',
                    mimeType: 'application/vnd.google-apps.document',
                    description: 'Manuel des procédures de contrôle',
                    modifiedTime: '2024-12-10T16:00:00Z'
                },
                {
                    id: 'demo-presentation-ca',
                    name: 'Présentation Comité d\'Audit',
                    mimeType: 'application/vnd.google-apps.presentation',
                    description: 'Présentation trimestrielle Q4 2024',
                    modifiedTime: '2024-12-22T11:15:00Z'
                }
            ];
        }

        createLoader(message = 'Chargement...') {
            return `
                <div class="gd-loader">
                    <div class="gd-spinner"></div>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">${message}</p>
                </div>
            `;
        }

        renderError(container, message) {
            container.innerHTML = `
                <div class="gd-error-box" style="margin: 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <h3 style="margin: 0 0 10px 0; font-size: 18px;">Erreur de chargement</h3>
                    <p style="margin: 0 0 20px 0; font-size: 14px; opacity: 0.8;">${message}</p>
                    <button onclick="window.gestionDossierMenuV2.loadFolderContent()" style="
                        padding: 10px 24px;
                        background: rgba(66, 133, 244, 0.2);
                        border: 1px solid rgba(66, 133, 244, 0.5);
                        border-radius: 8px;
                        color: #4285f4;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                    ">🔄 Réessayer</button>
                </div>
            `;
        }

        // ========================================
        // RENDU DE LA LISTE DES FICHIERS
        // ========================================
        renderFileList(container) {
            if (this.files.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5);">
                        <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
                        <p style="font-size: 16px; margin: 0;">Aucun document dans ce dossier</p>
                        <p style="font-size: 13px; margin-top: 10px; opacity: 0.7;">
                            Exécutez <code>node get-folder-id.cjs</code> pour synchroniser
                        </p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '';

            // Stats header
            const stats = document.createElement('div');
            stats.style.cssText = `
                background: linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.1) 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            // Compter les types de fichiers
            const typeCounts = {};
            this.files.forEach(f => {
                const type = FILE_TYPES[f.mimeType] || FILE_TYPES['default'];
                typeCounts[type.label] = (typeCounts[type.label] || 0) + 1;
            });

            const typeIcons = Object.entries(typeCounts)
                .map(([label, count]) => `<span style="opacity: 0.8;">${count} ${label}</span>`)
                .join(' • ');

            stats.innerHTML = `
                <div>
                    <span style="color: #fff; font-weight: 600; font-size: 16px;">📊 ${this.files.length} documents</span>
                    <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 4px;">${typeIcons}</div>
                </div>
                <div style="color: rgba(255,255,255,0.5); font-size: 12px;">
                    Dernière sync: ${new Date().toLocaleString('fr-FR')}
                </div>
            `;
            container.appendChild(stats);

            // Accordéon des fichiers
            const accordion = document.createElement('div');
            accordion.className = 'gd-accordion-container';
            accordion.style.cssText = `
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                overflow: hidden;
            `;

            this.files.forEach((file, index) => {
                accordion.appendChild(this.createFileAccordionItem(file, index));
            });

            container.appendChild(accordion);
        }

        createFileAccordionItem(file, index) {
            const fileType = FILE_TYPES[file.mimeType] || FILE_TYPES['default'];
            const isExpanded = this.expandedFiles.has(file.id);
            const modifiedDate = file.modifiedTime
                ? new Date(file.modifiedTime).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric'
                })
                : '';

            const item = document.createElement('div');
            item.className = 'gd-accordion-item';
            item.dataset.fileId = file.id;

            // Header
            const header = document.createElement('button');
            header.className = `gd-accordion-header ${isExpanded ? 'active' : ''}`;
            header.innerHTML = `
                <span class="gd-file-icon" style="
                    width: 40px;
                    height: 40px;
                    background: ${fileType.color}22;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">${fileType.icon}</span>
                <div class="gd-file-info">
                    <div class="gd-file-name">${file.name}</div>
                    <div class="gd-file-meta">
                        ${fileType.label} ${modifiedDate ? `• ${modifiedDate}` : ''}
                        ${file.description ? `<br><span style="opacity: 0.7;">${file.description}</span>` : ''}
                    </div>
                </div>
            `;

            // Panel de contenu
            const panel = document.createElement('div');
            panel.className = `gd-accordion-panel ${isExpanded ? 'active' : ''}`;

            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'gd-content-wrapper';
            contentWrapper.innerHTML = this.createLoader('Chargement du document...');
            panel.appendChild(contentWrapper);

            // Événement de clic
            header.addEventListener('click', () => {
                this.toggleAccordion(file, header, panel, contentWrapper);
            });

            item.appendChild(header);
            item.appendChild(panel);

            return item;
        }

        toggleAccordion(file, header, panel, contentWrapper) {
            const isExpanded = this.expandedFiles.has(file.id);

            if (isExpanded) {
                // Fermer
                this.expandedFiles.delete(file.id);
                header.classList.remove('active');
                panel.classList.remove('active');
            } else {
                // Ouvrir
                this.expandedFiles.add(file.id);
                header.classList.add('active');
                panel.classList.add('active');

                // Charger le contenu si pas déjà chargé
                if (!this.loadedContent.has(file.id)) {
                    this.loadFileContent(file, contentWrapper);
                }
            }
        }
