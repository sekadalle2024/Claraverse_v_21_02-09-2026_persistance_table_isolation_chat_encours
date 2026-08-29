/**
 * Gestion Électronique - Menu Coulissant dans la Sidebar
 * 
 * Ajoute un bouton "Gestion Électro" dans la barre latérale
 * qui ouvre un panneau coulissant à droite affichant les fichiers
 * Google Drive via l'endpoint N8N
 * 
 * Endpoint N8N: https://barow52161.app.n8n.cloud/webhook/scan-drive-http
 * 
 * @author E-Audit Pro Team
 * @version 1.0
 */

(function () {
    'use strict';

    console.log('📂 [GestionElectro] Initialisation du menu...');

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        n8nEndpoint: 'https://barow52161.app.n8n.cloud/webhook/scan-drive-http',
        panelId: 'gestion-electro-panel',
        overlayId: 'gestion-electro-overlay',
        buttonId: 'gestion-electro-sidebar-btn',
        cacheKey: 'gestion-electro-cache',
        debug: true
    };

    // Types de fichiers avec icônes
    const FILE_TYPES = {
        'application/pdf': { icon: '📕', label: 'PDF', color: '#ea4335' },
        'application/vnd.google-apps.document': { icon: '📄', label: 'Google Doc', color: '#4285f4' },
        'application/vnd.google-apps.spreadsheet': { icon: '📊', label: 'Google Sheet', color: '#34a853' },
        'application/vnd.google-apps.presentation': { icon: '📽️', label: 'Google Slides', color: '#fbbc05' },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', label: 'Word', color: '#2b579a' },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: '📈', label: 'Excel', color: '#217346' },
        'default': { icon: '📁', label: 'Fichier', color: '#757575' }
    };

    const debug = {
        log: (...args) => CONFIG.debug && console.log('📂 [GestionElectro]', ...args),
        error: (...args) => console.error('❌ [GestionElectro]', ...args),
        success: (...args) => console.log('✅ [GestionElectro]', ...args)
    };

    // ========================================
    // STYLES CSS
    // ========================================
    const STYLES = `
        /* Overlay */
        .ge-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            z-index: 99998;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        .ge-overlay.open {
            opacity: 1;
            visibility: visible;
        }
        
        /* Panneau coulissant */
        .ge-panel {
            position: fixed;
            top: 0;
            right: 0;
            height: 100%;
            width: 55%;
            min-width: 600px;
            max-width: 900px;
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
            box-shadow: -5px 0 30px rgba(0, 0, 0, 0.4);
            z-index: 99999;
            transform: translateX(100%);
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ge-panel.open {
            transform: translateX(0);
        }
        
        /* Header */
        .ge-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: linear-gradient(90deg, rgba(66, 133, 244, 0.15) 0%, rgba(52, 168, 83, 0.1) 50%, transparent 100%);
        }
        .ge-header-title {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .ge-header-icon {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #4285f4 0%, #34a853 33%, #fbbc05 66%, #ea4335 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            box-shadow: 0 3px 12px rgba(66, 133, 244, 0.3);
        }
        .ge-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: #fff;
        }
        .ge-header p {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: rgba(255,255,255,0.5);
        }
        .ge-header-actions {
            display: flex;
            gap: 8px;
        }
        .ge-btn-icon {
            width: 38px;
            height: 38px;
            border: none;
            background: rgba(255,255,255,0.08);
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            color: #fff;
            transition: all 0.2s;
        }
        .ge-btn-icon:hover {
            background: rgba(255,255,255,0.15);
            transform: scale(1.05);
        }
        
        /* Contenu */
        .ge-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }
        
        /* Stats */
        .ge-stats {
            background: linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.1) 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        /* Liste des fichiers */
        .ge-file-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            margin-bottom: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .ge-file-item:hover {
            border-color: rgba(66, 133, 244, 0.3);
        }
        .ge-file-item.expanded {
            border-color: rgba(66, 133, 244, 0.5);
        }
        .ge-file-header {
            display: flex;
            align-items: center;
            padding: 14px 16px;
            cursor: pointer;
            gap: 12px;
            transition: background 0.2s;
        }
        .ge-file-header:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        .ge-file-icon {
            font-size: 26px;
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }
        .ge-file-info {
            flex: 1;
            min-width: 0;
        }
        .ge-file-name {
            color: #fff;
            font-weight: 500;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ge-file-meta {
            color: rgba(255,255,255,0.5);
            font-size: 11px;
            margin-top: 3px;
        }
        .ge-chevron {
            color: rgba(255,255,255,0.4);
            font-size: 12px;
            transition: transform 0.3s;
        }
        .ge-file-item.expanded .ge-chevron {
            transform: rotate(90deg);
        }
        .ge-file-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease-out;
            background: rgba(0, 0, 0, 0.2);
        }
        .ge-file-item.expanded .ge-file-content {
            max-height: 650px;
        }
        .ge-viewer {
            padding: 16px;
        }
        .ge-iframe {
            width: 100%;
            height: 500px;
            border: none;
            border-radius: 8px;
            background: white;
        }
        
        /* Loader */
        .ge-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 50px;
            gap: 16px;
        }
        .ge-spinner {
            width: 44px;
            height: 44px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: #4285f4;
            border-radius: 50%;
            animation: ge-spin 1s linear infinite;
        }
        @keyframes ge-spin { to { transform: rotate(360deg); } }
    `;

    // ========================================
    // CLASSE PRINCIPALE
    // ========================================
    class GestionElectroMenu {
        constructor() {
            this.isOpen = false;
            this.panel = null;
            this.overlay = null;
            this.files = [];
            this.folderInfo = null;
            this.expandedFiles = new Set();
            this.isLoading = false;
            this.init();
        }

        init() {
            debug.log('Initialisation...');
            this.injectStyles();
            this.createPanel();
            this.injectSidebarButton();
            debug.success('Menu initialisé');
        }

        // ========================================
        // INJECTION DES STYLES
        // ========================================
        injectStyles() {
            if (document.getElementById('gestion-electro-styles')) return;
            const style = document.createElement('style');
            style.id = 'gestion-electro-styles';
            style.textContent = STYLES;
            document.head.appendChild(style);
        }

        // ========================================
        // INJECTION DU BOUTON DANS LA SIDEBAR
        // ========================================
        injectSidebarButton() {
            const tryInject = () => {
                // Chercher la sidebar
                const sidebar = document.querySelector('.main-nav-menu nav ul') ||
                    document.querySelector('.main-nav-menu ul');

                if (!sidebar) {
                    debug.log('Sidebar non trouvée, retry dans 500ms...');
                    setTimeout(tryInject, 500);
                    return;
                }

                // Vérifier si le bouton existe déjà
                if (document.getElementById(CONFIG.buttonId)) {
                    debug.log('Bouton déjà présent');
                    return;
                }

                // Trouver le bouton Database pour insérer après
                const databaseBtn = sidebar.querySelector('[data-page="database"]');
                const insertAfter = databaseBtn ? databaseBtn.closest('li') : null;

                // Créer le bouton
                const li = document.createElement('li');
                li.id = CONFIG.buttonId + '-container';

                const button = document.createElement('button');
                button.id = CONFIG.buttonId;
                button.className = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800';
                button.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #4285f4;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                    </svg>
                    <span class="text-sm font-medium">Gestion Électro</span>
                `;
                button.title = 'Gestion électronique des documents';
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggle();
                });

                li.appendChild(button);

                // Insérer après Database ou à la fin
                if (insertAfter && insertAfter.nextSibling) {
                    sidebar.insertBefore(li, insertAfter.nextSibling);
                } else if (insertAfter) {
                    sidebar.appendChild(li);
                } else {
                    sidebar.appendChild(li);
                }

                debug.success('Bouton injecté dans la sidebar');
            };

            // Démarrer l'injection
            tryInject();

            // Observer les changements DOM pour réinjecter si nécessaire
            const observer = new MutationObserver(() => {
                if (!document.getElementById(CONFIG.buttonId)) {
                    tryInject();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // ========================================
        // CRÉATION DU PANNEAU COULISSANT
        // ========================================
        createPanel() {
            // Nettoyer
            document.getElementById(CONFIG.panelId)?.remove();
            document.getElementById(CONFIG.overlayId)?.remove();

            // Overlay
            this.overlay = document.createElement('div');
            this.overlay.id = CONFIG.overlayId;
            this.overlay.className = 'ge-overlay';
            this.overlay.addEventListener('click', () => this.close());
            document.body.appendChild(this.overlay);

            // Panel
            this.panel = document.createElement('div');
            this.panel.id = CONFIG.panelId;
            this.panel.className = 'ge-panel';
            this.panel.innerHTML = `
                <div class="ge-header">
                    <div class="ge-header-title">
                        <div class="ge-header-icon">📂</div>
                        <div>
                            <h2>Gestion Électronique</h2>
                            <p id="ge-folder-info">📁 Chargement via N8N...</p>
                        </div>
                    </div>
                    <div class="ge-header-actions">
                        <button class="ge-btn-icon" onclick="window.gestionElectroMenu.loadFiles()" title="Actualiser">🔄</button>
                        <button class="ge-btn-icon" id="ge-open-drive" title="Ouvrir Drive">🌐</button>
                        <button class="ge-btn-icon" onclick="window.gestionElectroMenu.close()" title="Fermer">✕</button>
                    </div>
                </div>
                <div id="ge-content" class="ge-content"></div>
            `;
            document.body.appendChild(this.panel);
        }

        // ========================================
        // OUVERTURE / FERMETURE
        // ========================================
        open() {
            if (this.isOpen) return;
            debug.log('Ouverture du panneau');

            this.overlay.classList.add('open');
            this.panel.classList.add('open');
            this.isOpen = true;
            this.loadFiles();

            // Escape pour fermer
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') this.close();
            };
            document.addEventListener('keydown', this.escapeHandler);
        }

        close() {
            if (!this.isOpen) return;
            debug.log('Fermeture du panneau');

            this.overlay.classList.remove('open');
            this.panel.classList.remove('open');
            this.isOpen = false;

            if (this.escapeHandler) {
                document.removeEventListener('keydown', this.escapeHandler);
            }
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        // ========================================
        // CHARGEMENT DES FICHIERS VIA N8N
        // ========================================
        async loadFiles() {
            if (this.isLoading) return;
            this.isLoading = true;

            const content = document.getElementById('ge-content');
            if (!content) return;

            content.innerHTML = `
                <div class="ge-loader">
                    <div class="ge-spinner"></div>
                    <p style="color: rgba(255,255,255,0.6); font-size: 13px;">Chargement des documents...</p>
                </div>
            `;

            try {
                debug.log('Appel endpoint N8N:', CONFIG.n8nEndpoint);
                const response = await fetch(CONFIG.n8nEndpoint, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                const result = Array.isArray(data) ? data[0] : data;

                if (result && result.contenu) {
                    this.files = result.contenu.filter(f => !f.fichier_nom.startsWith('~$'));
                    this.folderInfo = result.dossierCible;
                    this.updateFolderInfo(result);
                    this.renderFiles(content);
                    this.saveCache(result);
                    debug.success(`${this.files.length} fichiers chargés`);
                } else {
                    this.loadFromCache(content);
                }
            } catch (error) {
                debug.error('Erreur:', error);
                this.loadFromCache(content) || this.renderError(content, error.message);
            } finally {
                this.isLoading = false;
            }
        }

        saveCache(data) {
            try {
                localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
                    ...data,
                    cachedAt: new Date().toISOString()
                }));
            } catch (e) { /* ignore */ }
        }

        loadFromCache(content) {
            try {
                const cached = localStorage.getItem(CONFIG.cacheKey);
                if (cached) {
                    const data = JSON.parse(cached);
                    this.files = data.contenu?.filter(f => !f.fichier_nom.startsWith('~$')) || [];
                    this.folderInfo = data.dossierCible;
                    this.updateFolderInfo(data);
                    this.renderFiles(content);
                    debug.log('Chargé depuis le cache');
                    return true;
                }
            } catch (e) { /* ignore */ }
            return false;
        }

        updateFolderInfo(data) {
            const folderInfo = document.getElementById('ge-folder-info');
            const openDriveBtn = document.getElementById('ge-open-drive');

            if (folderInfo && data.dossierCible) {
                folderInfo.textContent = `📁 ${data.dossierCible.nom} • ${data.statistiques?.totalElements || 0} fichiers`;
            }

            if (openDriveBtn && data.dossierCible?.id) {
                openDriveBtn.onclick = () => {
                    window.open(`https://drive.google.com/drive/folders/${data.dossierCible.id}`, '_blank');
                };
            }
        }

        renderError(container, message) {
            container.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 30px; text-align: center; margin: 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
                    <h3 style="color: #ef4444; margin: 0 0 10px 0;">Erreur de chargement</h3>
                    <p style="color: rgba(255,255,255,0.6); margin: 0 0 20px 0; font-size: 13px;">${message}</p>
                    <button onclick="window.gestionElectroMenu.loadFiles()" style="padding: 10px 20px; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">🔄 Réessayer</button>
                </div>
            `;
        }

        // ========================================
        // RENDU DE LA LISTE DES FICHIERS
        // ========================================
        renderFiles(container) {
            if (this.files.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: rgba(255,255,255,0.5);">
                        <div style="font-size: 56px; margin-bottom: 15px;">📭</div>
                        <p style="font-size: 15px;">Aucun document dans ce dossier</p>
                    </div>
                `;
                return;
            }

            // Compter les types
            const typeCounts = {};
            this.files.forEach(f => {
                const type = FILE_TYPES[f.fichier_mimeType] || FILE_TYPES['default'];
                typeCounts[type.label] = (typeCounts[type.label] || 0) + 1;
            });
            const typeStr = Object.entries(typeCounts).map(([l, c]) => `${c} ${l}`).join(' • ');

            let html = `
                <div class="ge-stats">
                    <div>
                        <span style="color: #fff; font-weight: 600; font-size: 15px;">📊 ${this.files.length} documents</span>
                        <div style="color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 3px;">${typeStr}</div>
                    </div>
                    <div style="color: rgba(255,255,255,0.4); font-size: 11px;">
                        ${new Date().toLocaleString('fr-FR')}
                    </div>
                </div>
            `;

            this.files.forEach((file, index) => {
                const fileType = FILE_TYPES[file.fichier_mimeType] || FILE_TYPES['default'];
                const isExpanded = this.expandedFiles.has(file.fichier_id);

                html += `
                    <div class="ge-file-item ${isExpanded ? 'expanded' : ''}" data-file-id="${file.fichier_id}" data-index="${index}">
                        <div class="ge-file-header" onclick="window.gestionElectroMenu.toggleFile('${file.fichier_id}', ${index})">
                            <span class="ge-file-icon" style="background: ${fileType.color}15;">${fileType.icon}</span>
                            <div class="ge-file-info">
                                <div class="ge-file-name">${file.fichier_nom}</div>
                                <div class="ge-file-meta">
                                    <span style="color: ${fileType.color};">${fileType.label}</span>
                                    <span style="margin-left: 8px;">📁 ${file.dossier_parent_nom || 'Racine'}</span>
                                </div>
                            </div>
                            <span class="ge-chevron">▶</span>
                        </div>
                        <div class="ge-file-content">
                            <div class="ge-viewer" id="viewer-${file.fichier_id}"></div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        toggleFile(fileId, index) {
            const item = document.querySelector(`.ge-file-item[data-file-id="${fileId}"]`);
            if (!item) return;

            const isExpanded = item.classList.contains('expanded');

            // Fermer les autres
            document.querySelectorAll('.ge-file-item.expanded').forEach(el => {
                if (el !== item) {
                    el.classList.remove('expanded');
                    this.expandedFiles.delete(el.dataset.fileId);
                }
            });

            if (isExpanded) {
                item.classList.remove('expanded');
                this.expandedFiles.delete(fileId);
            } else {
                item.classList.add('expanded');
                this.expandedFiles.add(fileId);
                this.loadViewer(this.files[index]);
            }
        }

        loadViewer(file) {
            const viewer = document.getElementById(`viewer-${file.fichier_id}`);
            if (!viewer) return;

            let viewerUrl = '';
            switch (file.fichier_mimeType) {
                case 'application/vnd.google-apps.document':
                    viewerUrl = `https://docs.google.com/document/d/${file.fichier_id}/preview`;
                    break;
                case 'application/vnd.google-apps.spreadsheet':
                    viewerUrl = `https://docs.google.com/spreadsheets/d/${file.fichier_id}/preview`;
                    break;
                case 'application/vnd.google-apps.presentation':
                    viewerUrl = `https://docs.google.com/presentation/d/${file.fichier_id}/preview`;
                    break;
                default:
                    viewerUrl = `https://drive.google.com/file/d/${file.fichier_id}/preview`;
            }

            viewer.innerHTML = `
                <iframe class="ge-iframe" src="${viewerUrl}" allowfullscreen></iframe>
                <div style="text-align: center; margin-top: 12px;">
                    <a href="https://drive.google.com/file/d/${file.fichier_id}/view" target="_blank" 
                       style="display: inline-block; padding: 8px 18px; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">
                        🔗 Ouvrir dans Google Drive
                    </a>
                </div>
            `;
        }
    }

    // ========================================
    // INITIALISATION
    // ========================================
    let instance = null;

    function init() {
        if (instance) return instance;
        instance = new GestionElectroMenu();
        window.gestionElectroMenu = instance;
        return instance;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ gestion-electro-menu.js chargé');
    console.log('💡 Ouvrir: window.gestionElectroMenu.open()');

})();
