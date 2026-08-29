/**
 * Gestion Dossier Google Drive - Menu Coulissant
 * 
 * Ce script crée un bouton "Gestion électro" dans la barre latérale
 * et un panneau coulissant à droite pour afficher le contenu
 * d'un dossier Google Drive dans un menu accordéon.
 * 
 * Configuration Google Drive:
 * - Folder ID: 13YcsgS1BqRKjGeuSK9RxoAK8vdD3ErBd
 * - Client ID: [VOTRE_GOOGLE_CLIENT_ID]
 */

(function () {
    'use strict';

    console.log('📂 Gestion Dossier Google Drive - Initialisation...');

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        panelId: 'gestion-dossier-panel',
        overlayId: 'gestion-dossier-overlay',
        buttonId: 'gestion-electro-btn',
        googleDrive: {
            folderId: '13YcsgS1BqRKjGeuSK9RxoAK8vdD3ErBd',
            clientId: '[VOTRE_GOOGLE_CLIENT_ID]',
            apiKey: '' // À configurer si nécessaire
        },
        corsProxies: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ],
        debugMode: true
    };

    // Types de fichiers supportés avec leurs icônes
    const FILE_TYPES = {
        'application/pdf': { icon: '📕', label: 'PDF' },
        'application/vnd.google-apps.document': { icon: '📄', label: 'Google Doc' },
        'application/vnd.google-apps.spreadsheet': { icon: '📊', label: 'Google Sheet' },
        'application/vnd.google-apps.presentation': { icon: '📽️', label: 'Google Slides' },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', label: 'Word' },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: '📈', label: 'Excel' },
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: '📊', label: 'PowerPoint' },
        'image/jpeg': { icon: '🖼️', label: 'Image' },
        'image/png': { icon: '🖼️', label: 'Image' },
        'text/plain': { icon: '📃', label: 'Texte' },
        'default': { icon: '📁', label: 'Fichier' }
    };

    // ========================================
    // UTILITAIRES
    // ========================================
    const debug = {
        log: (...args) => CONFIG.debugMode && console.log('📂 [GestionDossier]', ...args),
        error: (...args) => console.error('❌ [GestionDossier]', ...args),
        warn: (...args) => console.warn('⚠️ [GestionDossier]', ...args)
    };


    // ========================================
    // CLASSE PRINCIPALE
    // ========================================
    class GestionDossierMenu {
        constructor() {
            this.isOpen = false;
            this.panel = null;
            this.overlay = null;
            this.files = [];
            this.expandedFiles = new Set();
            this.loadedContent = new Map();
            this.init();
        }

        init() {
            debug.log('Initialisation du menu Gestion Dossier');
            this.createButton();
            this.createPanel();
            this.attachEventListeners();
            debug.log('✅ Menu Gestion Dossier initialisé');
        }

        // ========================================
        // CRÉATION DU BOUTON DANS LA SIDEBAR
        // ========================================
        createButton() {
            // Créer aussi un bouton flottant comme fallback
            this.createFloatingButton();

            // Attendre que la sidebar soit disponible
            const checkSidebar = setInterval(() => {
                // Chercher la sidebar avec plusieurs sélecteurs possibles
                const sidebar = document.querySelector('.main-nav-menu nav ul') ||
                    document.querySelector('.main-nav-menu ul') ||
                    document.querySelector('[class*="sidebar"] nav ul');

                if (sidebar) {
                    clearInterval(checkSidebar);
                    this.injectButton(sidebar);
                }
            }, 500);

            // Timeout après 15 secondes
            setTimeout(() => clearInterval(checkSidebar), 15000);
        }

        createFloatingButton() {
            // Bouton flottant désactivé - utiliser uniquement le bouton dans la sidebar
            debug.log('Bouton flottant désactivé');
        }

        injectButton(sidebar) {
            // Vérifier si le bouton existe déjà
            if (document.getElementById(CONFIG.buttonId)) return;

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
                <span class="text-sm font-medium">Gestion électro</span>
            `;
            button.title = 'Gestion électronique des documents Google Drive';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });

            li.appendChild(button);

            // Insérer après "Database" ou à la fin du menu principal
            const databaseItem = sidebar.querySelector('[data-page="database"]')?.closest('li');
            if (databaseItem) {
                databaseItem.after(li);
                debug.log('✅ Bouton inséré après Database');
            } else {
                // Sinon, ajouter à la fin
                sidebar.appendChild(li);
                debug.log('✅ Bouton ajouté à la fin de la sidebar');
            }

            debug.log('✅ Bouton Gestion électro ajouté à la sidebar');
        }


        // ========================================
        // CRÉATION DU PANNEAU COULISSANT
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
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 99998;
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease-out;
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
                width: 55%;
                min-width: 600px;
                max-width: 900px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                box-shadow: -4px 0 30px rgba(0, 0, 0, 0.4);
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

            // Zone de contenu
            const content = document.createElement('div');
            content.id = 'gestion-dossier-content';
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
                background: linear-gradient(90deg, rgba(66, 133, 244, 0.15) 0%, transparent 100%);
            `;

            // Titre avec icône Google Drive
            const titleContainer = document.createElement('div');
            titleContainer.style.cssText = `display: flex; align-items: center; gap: 14px;`;

            const iconBox = document.createElement('div');
            iconBox.style.cssText = `
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 75%, #ea4335 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
            `;
            iconBox.textContent = '📂';

            const titleText = document.createElement('div');
            titleText.innerHTML = `
                <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #fff;">Gestion Électronique</h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.6);">Documents Google Drive</p>
            `;

            titleContainer.appendChild(iconBox);
            titleContainer.appendChild(titleText);

            // Boutons d'action
            const actions = document.createElement('div');
            actions.style.cssText = `display: flex; align-items: center; gap: 10px;`;

            // Bouton Actualiser
            const refreshBtn = this.createActionButton('🔄', 'Actualiser', () => this.loadFolderContent());
            actions.appendChild(refreshBtn);

            // Bouton Fermer
            const closeBtn = this.createActionButton('✕', 'Fermer', () => this.close(), true);
            actions.appendChild(closeBtn);

            header.appendChild(titleContainer);
            header.appendChild(actions);

            return header;
        }

        createActionButton(icon, title, onClick, isClose = false) {
            const btn = document.createElement('button');
            btn.innerHTML = icon;
            btn.title = title;
            btn.style.cssText = `
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                cursor: pointer;
                font-size: 18px;
                color: #fff;
                transition: all 0.2s;
            `;
            btn.addEventListener('mouseenter', () => {
                btn.style.background = isClose ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)';
                btn.style.transform = 'scale(1.05)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.1)';
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
            debug.log('Ouverture du panneau Gestion Dossier');

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
            debug.log('Fermeture du panneau Gestion Dossier');

            this.overlay.style.opacity = '0';
            this.panel.style.transform = 'translateX(100%)';

            setTimeout(() => {
                this.overlay.style.display = 'none';
                this.panel.style.display = 'none';
            }, 300);

            this.isOpen = false;

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

        attachEventListeners() {
            // Écouter les clics sur le bouton Dossier dans la sidebar existante
            document.addEventListener('click', (e) => {
                const dossierBtn = e.target.closest('[data-page="dossier"]');
                if (dossierBtn) {
                    // Ne pas interférer avec le menu Dossier existant
                }
            });
        }


        // ========================================
        // CHARGEMENT DU CONTENU GOOGLE DRIVE
        // ========================================
        async loadFolderContent() {
            const content = document.getElementById('gestion-dossier-content');
            if (!content) return;

            // Afficher le loader
            content.innerHTML = this.createLoader();

            try {
                // Essayer de charger la liste des fichiers
                const files = await this.fetchFolderFiles();
                this.files = files;
                this.renderFileList(content);
            } catch (error) {
                debug.error('Erreur chargement dossier:', error);
                this.renderError(content, error.message);
            }
        }

        async fetchFolderFiles() {
            // Méthode 1: Utiliser l'API Google Drive (nécessite authentification)
            // Pour l'instant, on utilise une liste statique ou un fichier de configuration

            // Essayer de charger depuis un fichier de configuration local
            try {
                const response = await fetch('/ressource/gestion-dossier-files.json');
                if (response.ok) {
                    const data = await response.json();
                    debug.log('Fichiers chargés depuis config locale:', data.files?.length);
                    return data.files || [];
                }
            } catch (e) {
                debug.warn('Config locale non disponible');
            }

            // Fallback: Liste de démonstration
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
                    id: 'demo-pdf-1',
                    name: 'Rapport Audit Annuel 2024',
                    mimeType: 'application/pdf',
                    description: 'Rapport consolidé des missions d\'audit',
                    modifiedTime: '2024-12-15T14:20:00Z'
                },
                {
                    id: 'demo-sheet-1',
                    name: 'Suivi des Recommandations',
                    mimeType: 'application/vnd.google-apps.spreadsheet',
                    description: 'Tableau de suivi des recommandations d\'audit',
                    modifiedTime: '2024-12-18T09:45:00Z'
                },
                {
                    id: 'demo-doc-2',
                    name: 'Procédure de Contrôle Interne',
                    mimeType: 'application/vnd.google-apps.document',
                    description: 'Manuel des procédures de contrôle',
                    modifiedTime: '2024-12-10T16:00:00Z'
                },
                {
                    id: 'demo-ppt-1',
                    name: 'Présentation Comité d\'Audit',
                    mimeType: 'application/vnd.google-apps.presentation',
                    description: 'Présentation trimestrielle Q4 2024',
                    modifiedTime: '2024-12-22T11:15:00Z'
                }
            ];
        }

        createLoader() {
            return `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 20px;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 4px solid rgba(255,255,255,0.1);
                        border-top-color: #4285f4;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px;">Chargement des documents...</p>
                </div>
                <style>
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
        }

        renderError(container, message) {
            container.innerHTML = `
                <div style="
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <h3 style="color: #ef4444; margin: 0 0 10px 0; font-size: 18px;">Erreur de chargement</h3>
                    <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 14px;">${message}</p>
                    <button onclick="window.gestionDossierMenu.loadFolderContent()" style="
                        margin-top: 20px;
                        padding: 10px 24px;
                        background: rgba(66, 133, 244, 0.2);
                        border: 1px solid rgba(66, 133, 244, 0.5);
                        border-radius: 8px;
                        color: #4285f4;
                        cursor: pointer;
                        font-size: 14px;
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
                        <p style="font-size: 16px;">Aucun document dans ce dossier</p>
                    </div>
                `;
                return;
            }

            // Stats
            const stats = document.createElement('div');
            stats.style.cssText = `
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 14px 18px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            stats.innerHTML = `
                <span style="color: rgba(255,255,255,0.7); font-size: 14px;">📊 Documents disponibles</span>
                <span style="color: #fff; font-weight: 600; font-size: 18px;">${this.files.length}</span>
            `;
            container.innerHTML = '';
            container.appendChild(stats);

            // Liste des fichiers en accordéon
            const accordion = document.createElement('div');
            accordion.className = 'gestion-accordion';
            accordion.style.cssText = `display: flex; flex-direction: column; gap: 8px;`;

            this.files.forEach((file, index) => {
                const fileItem = this.createFileAccordionItem(file, index);
                accordion.appendChild(fileItem);
            });

            container.appendChild(accordion);
        }

        createFileAccordionItem(file, index) {
            const fileType = FILE_TYPES[file.mimeType] || FILE_TYPES['default'];
            const isExpanded = this.expandedFiles.has(file.id);
            const modifiedDate = file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('fr-FR') : '';

            const item = document.createElement('div');
            item.className = 'accordion-file-item';
            item.dataset.fileId = file.id;
            item.style.cssText = `
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s ease;
            `;

            // Header de l'accordéon
            const header = document.createElement('div');
            header.className = 'accordion-file-header';
            header.style.cssText = `
                display: flex;
                align-items: center;
                padding: 16px 18px;
                cursor: pointer;
                transition: background 0.2s;
                gap: 14px;
            `;

            header.innerHTML = `
                <span style="font-size: 28px; flex-shrink: 0;">${fileType.icon}</span>
                <div style="flex: 1; min-width: 0;">
                    <div style="color: #fff; font-weight: 500; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${file.name}
                    </div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 4px;">
                        ${fileType.label} ${modifiedDate ? `• ${modifiedDate}` : ''}
                    </div>
                </div>
                <span class="accordion-chevron" style="
                    color: rgba(255,255,255,0.4);
                    font-size: 14px;
                    transition: transform 0.3s;
                    transform: rotate(${isExpanded ? '90deg' : '0deg'});
                ">▶</span>
            `;

            header.addEventListener('mouseenter', () => {
                header.style.background = 'rgba(255, 255, 255, 0.05)';
            });
            header.addEventListener('mouseleave', () => {
                header.style.background = 'transparent';
            });

            // Contenu de l'accordéon
            const content = document.createElement('div');
            content.className = 'accordion-file-content';
            content.style.cssText = `
                max-height: ${isExpanded ? '800px' : '0'};
                overflow: hidden;
                transition: max-height 0.4s ease-out;
                background: rgba(0, 0, 0, 0.2);
            `;

            // Contenu interne
            const contentInner = document.createElement('div');
            contentInner.style.cssText = `padding: 20px;`;
            contentInner.innerHTML = this.createFileContentPlaceholder(file);
            content.appendChild(contentInner);

            // Événement de clic
            header.addEventListener('click', () => {
                this.toggleFileAccordion(file, item, content);
            });

            item.appendChild(header);
            item.appendChild(content);

            return item;
        }

        createFileContentPlaceholder(file) {
            // Afficher un loader pendant le chargement automatique
            return `
                <div style="text-align: center; padding: 30px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        margin: 0 auto 16px;
                        border: 3px solid rgba(255,255,255,0.1);
                        border-top-color: #4285f4;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <p style="color: rgba(255,255,255,0.6); font-size: 13px;">Chargement du document...</p>
                </div>
            `;
        }


        toggleFileAccordion(file, item, content) {
            const chevron = item.querySelector('.accordion-chevron');
            const isExpanded = this.expandedFiles.has(file.id);

            if (isExpanded) {
                this.expandedFiles.delete(file.id);
                content.style.maxHeight = '0';
                chevron.style.transform = 'rotate(0deg)';
                item.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            } else {
                this.expandedFiles.add(file.id);
                content.style.maxHeight = '1200px';
                chevron.style.transform = 'rotate(90deg)';
                item.style.borderColor = 'rgba(66, 133, 244, 0.3)';

                // Charger automatiquement le contenu
                const contentInner = content.querySelector('div');
                this.loadFileContent(file, contentInner);
            }
        }

        // ========================================
        // CHARGEMENT DU CONTENU D'UN FICHIER
        // ========================================
        async loadFileContent(file, container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        margin: 0 auto 16px;
                        border: 3px solid rgba(255,255,255,0.1);
                        border-top-color: #4285f4;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <p style="color: rgba(255,255,255,0.6); font-size: 13px;">Chargement du document...</p>
                </div>
            `;

            try {
                let htmlContent = '';

                // Selon le type de fichier
                if (file.mimeType === 'application/vnd.google-apps.document') {
                    htmlContent = await this.loadGoogleDoc(file.id);
                } else if (file.mimeType === 'application/pdf') {
                    htmlContent = this.createPdfViewer(file);
                } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
                    htmlContent = this.createSheetViewer(file);
                } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
                    htmlContent = this.createSlidesViewer(file);
                } else {
                    htmlContent = this.createGenericViewer(file);
                }

                this.loadedContent.set(file.id, htmlContent);
                container.innerHTML = htmlContent;

            } catch (error) {
                debug.error('Erreur chargement fichier:', error);
                container.innerHTML = `
                    <div style="
                        background: rgba(239, 68, 68, 0.1);
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                    ">
                        <p style="color: #ef4444; margin: 0;">❌ Erreur: ${error.message}</p>
                        <button onclick="window.gestionDossierMenu.retryLoadFile('${file.id}')" style="
                            margin-top: 12px;
                            padding: 8px 16px;
                            background: rgba(66, 133, 244, 0.2);
                            border: none;
                            border-radius: 6px;
                            color: #4285f4;
                            cursor: pointer;
                        ">Réessayer</button>
                    </div>
                `;
            }
        }

        async loadGoogleDoc(docId) {
            debug.log('Chargement Google Doc:', docId);

            // 1. Essayer le fichier local
            try {
                const localResponse = await fetch(`/ressource/gdrive_${docId}.html`);
                if (localResponse.ok) {
                    const html = await localResponse.text();
                    if (html.length > 500) {
                        debug.log('✅ Contenu chargé depuis fichier local');
                        return this.wrapDocContent(this.cleanHtml(html));
                    }
                }
            } catch (e) {
                debug.warn('Fichier local non disponible');
            }

            // 2. Essayer via proxy CORS
            const googleUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;

            for (const proxy of CONFIG.corsProxies) {
                try {
                    debug.log('Tentative via proxy:', proxy);
                    const response = await fetch(proxy + encodeURIComponent(googleUrl));
                    if (response.ok) {
                        const html = await response.text();
                        debug.log('✅ Contenu téléchargé via proxy');
                        return this.wrapDocContent(this.cleanHtml(html));
                    }
                } catch (e) {
                    debug.warn('Proxy échoué:', e.message);
                }
            }

            // 3. Fallback: iframe Google Docs Viewer
            return this.createGoogleDocsViewer(docId);
        }

        cleanHtml(html) {
            return html
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

        wrapDocContent(html) {
            return `
                <div class="doc-content-wrapper" style="
                    background: white;
                    border-radius: 8px;
                    padding: 30px;
                    max-height: 600px;
                    overflow-y: auto;
                    color: #333;
                    line-height: 1.7;
                    font-size: 14px;
                ">
                    ${html}
                </div>
            `;
        }

        createGoogleDocsViewer(docId) {
            const viewerUrl = `https://docs.google.com/document/d/${docId}/preview`;
            return `
                <div style="border-radius: 8px; overflow: hidden;">
                    <iframe 
                        src="${viewerUrl}"
                        style="width: 100%; height: 550px; border: none; background: white;"
                        allowfullscreen
                    ></iframe>
                </div>
            `;
        }

        createPdfViewer(file) {
            // Afficher le PDF directement via Google Docs Viewer
            const viewerUrl = file.id.startsWith('demo-')
                ? `https://docs.google.com/viewer?embedded=true`
                : `https://drive.google.com/file/d/${file.id}/preview`;
            return `
                <div style="border-radius: 8px; overflow: hidden;">
                    <iframe 
                        src="${viewerUrl}"
                        style="width: 100%; height: 500px; border: none; background: white;"
                        allowfullscreen
                    ></iframe>
                    <div style="
                        background: rgba(234, 67, 53, 0.1);
                        padding: 10px;
                        text-align: center;
                        font-size: 12px;
                        color: rgba(255,255,255,0.6);
                    ">
                        📕 ${file.name}
                    </div>
                </div>
            `;
        }

        createSheetViewer(file) {
            const viewerUrl = `https://docs.google.com/spreadsheets/d/${file.id}/preview`;
            return `
                <div style="border-radius: 8px; overflow: hidden;">
                    <iframe 
                        src="${viewerUrl}"
                        style="width: 100%; height: 450px; border: none; background: white;"
                    ></iframe>
                    <div style="
                        background: rgba(52, 168, 83, 0.1);
                        padding: 10px;
                        text-align: center;
                        font-size: 12px;
                        color: rgba(255,255,255,0.6);
                    ">
                        📊 ${file.name}
                    </div>
                </div>
            `;
        }

        createSlidesViewer(file) {
            const viewerUrl = `https://docs.google.com/presentation/d/${file.id}/preview`;
            return `
                <div style="border-radius: 8px; overflow: hidden;">
                    <iframe 
                        src="${viewerUrl}"
                        style="width: 100%; height: 500px; border: none; background: white;"
                        allowfullscreen
                    ></iframe>
                    <div style="
                        background: rgba(251, 188, 5, 0.1);
                        padding: 10px;
                        text-align: center;
                        font-size: 12px;
                        color: rgba(255,255,255,0.6);
                    ">
                        📽️ ${file.name}
                    </div>
                </div>
            `;
        }

        createGenericViewer(file) {
            return `
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">📁</div>
                    <h4 style="color: #fff; margin: 0 0 10px 0;">${file.name}</h4>
                    <p style="color: rgba(255,255,255,0.5); font-size: 13px;">
                        Type: ${file.mimeType}
                    </p>
                </div>
            `;
        }

        retryLoadFile(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (file) {
                this.loadedContent.delete(fileId);
                const item = document.querySelector(`[data-file-id="${fileId}"]`);
                if (item) {
                    const content = item.querySelector('.accordion-file-content div');
                    if (content) {
                        this.loadFileContent(file, content);
                    }
                }
            }
        }
    }


    // ========================================
    // INITIALISATION
    // ========================================
    let gestionDossierMenu = null;

    function initGestionDossier() {
        if (gestionDossierMenu) return;
        gestionDossierMenu = new GestionDossierMenu();
        window.gestionDossierMenu = gestionDossierMenu;
        debug.log('✅ Gestion Dossier Menu prêt');
    }

    // Observer pour détecter quand la sidebar React est rendue
    function observeSidebarCreation() {
        const observer = new MutationObserver((mutations) => {
            const sidebar = document.querySelector('.main-nav-menu nav ul');
            if (sidebar && !document.getElementById('gestion-electro-btn')) {
                if (gestionDossierMenu) {
                    gestionDossierMenu.injectButton(sidebar);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Arrêter l'observation après 30 secondes
        setTimeout(() => observer.disconnect(), 30000);
    }

    // Initialiser au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initGestionDossier, 1500);
            observeSidebarCreation();
        });
    } else {
        setTimeout(initGestionDossier, 1500);
        observeSidebarCreation();
    }

    // Exposer l'API globale
    window.GestionDossierAPI = {
        open: () => gestionDossierMenu?.open(),
        close: () => gestionDossierMenu?.close(),
        toggle: () => gestionDossierMenu?.toggle(),
        refresh: () => gestionDossierMenu?.loadFolderContent()
    };

    console.log('✅ gestion-dossier-menu.js chargé');
    console.log('💡 API: window.GestionDossierAPI.open() / .close() / .toggle()');

})();
