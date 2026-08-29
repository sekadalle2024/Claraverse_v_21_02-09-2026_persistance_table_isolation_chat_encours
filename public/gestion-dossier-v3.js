/**
 * Gestion Dossier Google Drive V3 - Intégration Automatique
 * 
 * Charge automatiquement les fichiers depuis Google Drive via l'API
 * avec authentification OAuth2 intégrée (Google Identity Services)
 * 
 * Configuration:
 * - Folder ID: 13YcsgS1BqRKjGeuSK9RxoAK8vdD3ErBd
 * - Client ID: [VOTRE_GOOGLE_CLIENT_ID]
 */

(function () {
    'use strict';

    console.log('📂 [V3] Gestion Dossier Google Drive - Chargement automatique...');

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        panelId: 'gestion-dossier-panel-v3',
        overlayId: 'gestion-dossier-overlay-v3',
        googleDrive: {
            folderId: '13YcsgS1BqRKjGeuSK9RxoAK8vdD3ErBd',
            clientId: '[VOTRE_GOOGLE_CLIENT_ID]',
            apiKey: 'AIzaSyDummyKeyForPublicAccess', // Optionnel pour fichiers publics
            scopes: 'https://www.googleapis.com/auth/drive.readonly'
        },
        debugMode: true
    };

    // Types de fichiers avec icônes et viewers
    const FILE_TYPES = {
        'application/pdf': { icon: '📕', label: 'PDF', color: '#ea4335' },
        'application/vnd.google-apps.document': { icon: '📄', label: 'Google Doc', color: '#4285f4' },
        'application/vnd.google-apps.spreadsheet': { icon: '📊', label: 'Google Sheet', color: '#34a853' },
        'application/vnd.google-apps.presentation': { icon: '📽️', label: 'Google Slides', color: '#fbbc05' },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', label: 'Word', color: '#2b579a' },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: '📈', label: 'Excel', color: '#217346' },
        'image/jpeg': { icon: '🖼️', label: 'Image', color: '#9c27b0' },
        'image/png': { icon: '🖼️', label: 'Image', color: '#9c27b0' },
        'text/plain': { icon: '📃', label: 'Texte', color: '#607d8b' },
        'application/vnd.google-apps.folder': { icon: '📁', label: 'Dossier', color: '#ffc107' },
        'default': { icon: '📎', label: 'Fichier', color: '#757575' }
    };

    // ========================================
    // UTILITAIRES
    // ========================================
    const debug = {
        log: (...args) => CONFIG.debugMode && console.log('📂 [GestionDossierV3]', ...args),
        error: (...args) => console.error('❌ [GestionDossierV3]', ...args),
        warn: (...args) => console.warn('⚠️ [GestionDossierV3]', ...args),
        success: (...args) => console.log('✅ [GestionDossierV3]', ...args)
    };

    // ========================================
    // CLASSE PRINCIPALE
    // ========================================
    class GestionDossierV3 {
        constructor() {
            this.isOpen = false;
            this.panel = null;
            this.overlay = null;
            this.files = [];
            this.expandedFiles = new Set();
            this.accessToken = null;
            this.tokenClient = null;
            this.gapiInited = false;
            this.gisInited = false;

            this.init();
        }

        async init() {
            debug.log('Initialisation V3...');
            this.injectStyles();
            this.createPanel();
            this.loadGoogleAPIs();
            debug.success('Menu Gestion Dossier V3 initialisé');

            // Exposer globalement
            window.gestionDossierMenuV3 = this;
            window.gestionDossierMenuV2 = this; // Compatibilité
        }

        // ========================================
        // CHARGEMENT DES APIs GOOGLE
        // ========================================
        loadGoogleAPIs() {
            // Charger Google Identity Services (GIS)
            if (!document.getElementById('google-gis-script')) {
                const gisScript = document.createElement('script');
                gisScript.id = 'google-gis-script';
                gisScript.src = 'https://accounts.google.com/gsi/client';
                gisScript.async = true;
                gisScript.defer = true;
                gisScript.onload = () => this.initGIS();
                document.head.appendChild(gisScript);
            }

            // Charger Google API Client (GAPI)
            if (!document.getElementById('google-gapi-script')) {
                const gapiScript = document.createElement('script');
                gapiScript.id = 'google-gapi-script';
                gapiScript.src = 'https://apis.google.com/js/api.js';
                gapiScript.async = true;
                gapiScript.defer = true;
                gapiScript.onload = () => this.initGAPI();
                document.head.appendChild(gapiScript);
            }
        }

        initGIS() {
            debug.log('Initialisation Google Identity Services...');
            try {
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: CONFIG.googleDrive.clientId,
                    scope: CONFIG.googleDrive.scopes,
                    callback: (response) => this.handleAuthResponse(response)
                });
                this.gisInited = true;
                debug.success('GIS initialisé');
            } catch (e) {
                debug.error('Erreur init GIS:', e);
            }
        }

        initGAPI() {
            debug.log('Initialisation Google API Client...');
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({});
                    await gapi.client.load('drive', 'v3');
                    this.gapiInited = true;
                    debug.success('GAPI initialisé');
                } catch (e) {
                    debug.error('Erreur init GAPI:', e);
                }
            });
        }

        handleAuthResponse(response) {
            if (response.error) {
                debug.error('Erreur auth:', response.error);
                return;
            }
            this.accessToken = response.access_token;
            debug.success('Authentification réussie!');
            this.loadFolderContent();
        }

        // ========================================
        // AUTHENTIFICATION
        // ========================================
        async authenticate() {
            if (!this.gisInited) {
                debug.warn('GIS pas encore initialisé, attente...');
                setTimeout(() => this.authenticate(), 500);
                return;
            }

            // Vérifier si on a déjà un token valide
            if (this.accessToken && gapi.client.getToken()) {
                debug.log('Token existant, chargement direct');
                this.loadFolderContent();
                return;
            }

            // Demander l'authentification
            debug.log('Demande authentification Google...');
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        }

        // ========================================
        // CHARGEMENT DES FICHIERS
        // ========================================
        async loadFolderContent() {
            const content = document.getElementById('gestion-dossier-content-v3');
            if (!content) return;

            content.innerHTML = this.createLoader('Chargement des documents...');

            try {
                // Méthode 1: Essayer avec l'API Google Drive (si authentifié)
                if (this.accessToken && this.gapiInited) {
                    const files = await this.fetchFilesFromAPI();
                    if (files && files.length > 0) {
                        this.files = files;
                        this.renderFileList(content);
                        return;
                    }
                }

                // Méthode 2: Essayer le fichier de config local
                const localFiles = await this.fetchLocalConfig();
                if (localFiles && localFiles.length > 0) {
                    this.files = localFiles;
                    this.renderFileList(content);
                    return;
                }

                // Méthode 3: Afficher bouton de connexion
                this.renderAuthRequired(content);

            } catch (error) {
                debug.error('Erreur chargement:', error);
                this.renderError(content, error.message);
            }
        }

        async fetchFilesFromAPI() {
            debug.log('Récupération fichiers via API Google Drive...');

            const response = await gapi.client.drive.files.list({
                q: `'${CONFIG.googleDrive.folderId}' in parents and trashed=false`,
                fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink,thumbnailLink)',
                pageSize: 100,
                orderBy: 'name'
            });

            const files = response.result.files || [];
            debug.success(`${files.length} fichiers récupérés via API`);

            // Sauvegarder en cache local
            this.saveToLocalCache(files);

            return files;
        }

        async fetchLocalConfig() {
            try {
                const response = await fetch('/ressource/gestion-dossier-files.json');
                if (response.ok) {
                    const data = await response.json();
                    debug.log('Fichiers chargés depuis cache local:', data.files?.length);
                    return data.files || [];
                }
            } catch (e) {
                debug.warn('Cache local non disponible');
            }
            return [];
        }

        saveToLocalCache(files) {
            const cacheData = {
                folderId: CONFIG.googleDrive.folderId,
                lastUpdated: new Date().toISOString(),
                files: files
            };
            localStorage.setItem('gestion-dossier-cache', JSON.stringify(cacheData));
            debug.log('Cache local mis à jour');
        }

        // ========================================
        // STYLES
        // ========================================
        injectStyles() {
            if (document.getElementById('gestion-dossier-v3-styles')) return;

            const style = document.createElement('style');
            style.id = 'gestion-dossier-v3-styles';
            style.textContent = `
                .gdv3-panel {
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
                }
                .gdv3-panel.open {
                    display: flex;
                    transform: translateX(0);
                }
                .gdv3-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 99998;
                    display: none;
                    opacity: 0;
                    transition: opacity 0.3s ease-out;
                }
                .gdv3-overlay.open {
                    display: block;
                    opacity: 1;
                }
                .gdv3-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: linear-gradient(90deg, rgba(66, 133, 244, 0.2) 0%, rgba(52, 168, 83, 0.1) 50%, transparent 100%);
                }
                .gdv3-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }
                .gdv3-file-item {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    margin-bottom: 10px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .gdv3-file-item:hover {
                    border-color: rgba(66, 133, 244, 0.3);
                }
                .gdv3-file-header {
                    display: flex;
                    align-items: center;
                    padding: 16px 18px;
                    cursor: pointer;
                    gap: 14px;
                    transition: background 0.2s;
                }
                .gdv3-file-header:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                .gdv3-file-icon {
                    font-size: 28px;
                    flex-shrink: 0;
                }
                .gdv3-file-info {
                    flex: 1;
                    min-width: 0;
                }
                .gdv3-file-name {
                    color: #fff;
                    font-weight: 500;
                    font-size: 15px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .gdv3-file-meta {
                    color: rgba(255,255,255,0.5);
                    font-size: 12px;
                    margin-top: 4px;
                }
                .gdv3-chevron {
                    color: rgba(255,255,255,0.4);
                    font-size: 14px;
                    transition: transform 0.3s;
                }
                .gdv3-file-item.expanded .gdv3-chevron {
                    transform: rotate(90deg);
                }
                .gdv3-file-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.4s ease-out;
                    background: rgba(0, 0, 0, 0.2);
                }
                .gdv3-file-item.expanded .gdv3-file-content {
                    max-height: 700px;
                }
                .gdv3-viewer {
                    padding: 20px;
                }
                .gdv3-iframe {
                    width: 100%;
                    height: 550px;
                    border: none;
                    border-radius: 8px;
                    background: white;
                }
                .gdv3-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    gap: 20px;
                }
                .gdv3-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255,255,255,0.1);
                    border-top-color: #4285f4;
                    border-radius: 50%;
                    animation: gdv3-spin 1s linear infinite;
                }
                @keyframes gdv3-spin {
                    to { transform: rotate(360deg); }
                }
                .gdv3-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .gdv3-btn-primary {
                    background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
                    color: white;
                }
                .gdv3-btn-primary:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 15px rgba(66, 133, 244, 0.4);
                }
                .gdv3-auth-box {
                    text-align: center;
                    padding: 60px 40px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                }
            `;
            document.head.appendChild(style);
        }

        // ========================================
        // CRÉATION DU PANNEAU
        // ========================================
        createPanel() {
            // Nettoyer
            document.getElementById(CONFIG.panelId)?.remove();
            document.getElementById(CONFIG.overlayId)?.remove();

            // Overlay
            this.overlay = document.createElement('div');
            this.overlay.id = CONFIG.overlayId;
            this.overlay.className = 'gdv3-overlay';
            this.overlay.addEventListener('click', () => this.close());
            document.body.appendChild(this.overlay);

            // Panel
            this.panel = document.createElement('div');
            this.panel.id = CONFIG.panelId;
            this.panel.className = 'gdv3-panel';
            this.panel.innerHTML = `
                <div class="gdv3-header">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4285f4 0%, #34a853 33%, #fbbc05 66%, #ea4335 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📂</div>
                        <div>
                            <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff;">Gestion Électronique</h2>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.6);">📁 Google Drive • Chargement automatique</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.gestionDossierMenuV3.loadFolderContent()" title="Actualiser" style="width: 42px; height: 42px; border: none; background: rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; font-size: 18px; color: #fff;">🔄</button>
                        <button onclick="window.open('https://drive.google.com/drive/folders/${CONFIG.googleDrive.folderId}', '_blank')" title="Ouvrir Drive" style="width: 42px; height: 42px; border: none; background: rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; font-size: 18px; color: #fff;">🌐</button>
                        <button onclick="window.gestionDossierMenuV3.close()" title="Fermer" style="width: 42px; height: 42px; border: none; background: rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; font-size: 18px; color: #fff;">✕</button>
                    </div>
                </div>
                <div id="gestion-dossier-content-v3" class="gdv3-content"></div>
            `;
            document.body.appendChild(this.panel);
        }

        // ========================================
        // RENDU
        // ========================================
        createLoader(message) {
            return `
                <div class="gdv3-loader">
                    <div class="gdv3-spinner"></div>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">${message}</p>
                </div>
            `;
        }

        renderAuthRequired(container) {
            container.innerHTML = `
                <div class="gdv3-auth-box">
                    <div style="font-size: 64px; margin-bottom: 20px;">🔐</div>
                    <h3 style="color: #fff; margin: 0 0 15px 0; font-size: 20px;">Connexion Google Drive</h3>
                    <p style="color: rgba(255,255,255,0.6); margin: 0 0 30px 0; font-size: 14px; line-height: 1.6;">
                        Connectez-vous pour accéder aux documents du dossier<br>
                        <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${CONFIG.googleDrive.folderId}</code>
                    </p>
                    <button class="gdv3-btn gdv3-btn-primary" onclick="window.gestionDossierMenuV3.authenticate()">
                        <span style="margin-right: 8px;">🔑</span> Se connecter avec Google
                    </button>
                    <p style="color: rgba(255,255,255,0.4); margin-top: 20px; font-size: 12px;">
                        Ou utilisez le fichier de configuration local
                    </p>
                </div>
            `;
        }

        renderError(container, message) {
            container.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <h3 style="color: #ef4444; margin: 0 0 10px 0;">Erreur</h3>
                    <p style="color: rgba(255,255,255,0.6); margin: 0 0 20px 0;">${message}</p>
                    <button class="gdv3-btn gdv3-btn-primary" onclick="window.gestionDossierMenuV3.loadFolderContent()">🔄 Réessayer</button>
                </div>
            `;
        }

        renderFileList(container) {
            if (this.files.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px; color: rgba(255,255,255,0.5);">
                        <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
                        <p>Aucun document dans ce dossier</p>
                    </div>
                `;
                return;
            }

            // Stats
            let html = `
                <div style="background: linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.1) 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #fff; font-weight: 600;">📊 ${this.files.length} documents</span>
                    <span style="color: rgba(255,255,255,0.5); font-size: 12px;">Dernière sync: ${new Date().toLocaleString('fr-FR')}</span>
                </div>
            `;

            // Liste des fichiers
            this.files.forEach((file, index) => {
                const fileType = FILE_TYPES[file.mimeType] || FILE_TYPES['default'];
                const modifiedDate = file.modifiedTime
                    ? new Date(file.modifiedTime).toLocaleDateString('fr-FR')
                    : '';

                html += `
                    <div class="gdv3-file-item" data-file-id="${file.id}" data-index="${index}">
                        <div class="gdv3-file-header" onclick="window.gestionDossierMenuV3.toggleFile('${file.id}', ${index})">
                            <span class="gdv3-file-icon">${fileType.icon}</span>
                            <div class="gdv3-file-info">
                                <div class="gdv3-file-name">${file.name}</div>
                                <div class="gdv3-file-meta">${fileType.label} ${modifiedDate ? '• ' + modifiedDate : ''}</div>
                            </div>
                            <span class="gdv3-chevron">▶</span>
                        </div>
                        <div class="gdv3-file-content">
                            <div class="gdv3-viewer" id="viewer-${file.id}"></div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        toggleFile(fileId, index) {
            const item = document.querySelector(`.gdv3-file-item[data-file-id="${fileId}"]`);
            if (!item) return;

            const isExpanded = item.classList.contains('expanded');

            // Fermer tous les autres
            document.querySelectorAll('.gdv3-file-item.expanded').forEach(el => {
                if (el !== item) el.classList.remove('expanded');
            });

            if (isExpanded) {
                item.classList.remove('expanded');
            } else {
                item.classList.add('expanded');
                this.loadFileViewer(this.files[index]);
            }
        }

        loadFileViewer(file) {
            const viewer = document.getElementById(`viewer-${file.id}`);
            if (!viewer) return;

            let viewerUrl = '';

            // Construire l'URL du viewer selon le type
            if (file.mimeType === 'application/vnd.google-apps.document') {
                viewerUrl = `https://docs.google.com/document/d/${file.id}/preview`;
            } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
                viewerUrl = `https://docs.google.com/spreadsheets/d/${file.id}/preview`;
            } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
                viewerUrl = `https://docs.google.com/presentation/d/${file.id}/preview`;
            } else if (file.mimeType === 'application/pdf') {
                viewerUrl = `https://drive.google.com/file/d/${file.id}/preview`;
            } else if (file.mimeType?.startsWith('image/')) {
                viewerUrl = `https://drive.google.com/uc?id=${file.id}`;
                viewer.innerHTML = `<img src="${viewerUrl}" style="max-width: 100%; border-radius: 8px;" alt="${file.name}">`;
                return;
            } else {
                viewerUrl = `https://drive.google.com/file/d/${file.id}/preview`;
            }

            viewer.innerHTML = `<iframe class="gdv3-iframe" src="${viewerUrl}" allowfullscreen></iframe>`;
        }

        // ========================================
        // OUVERTURE / FERMETURE
        // ========================================
        open() {
            if (this.isOpen) return;
            debug.log('Ouverture panneau');

            this.overlay.classList.add('open');
            this.panel.classList.add('open');
            this.isOpen = true;

            // Charger le contenu
            this.loadFolderContent();

            // Escape pour fermer
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') this.close();
            };
            document.addEventListener('keydown', this.escapeHandler);
        }

        close() {
            if (!this.isOpen) return;
            debug.log('Fermeture panneau');

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
    }

    // ========================================
    // INITIALISATION
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new GestionDossierV3());
    } else {
        new GestionDossierV3();
    }

})();
