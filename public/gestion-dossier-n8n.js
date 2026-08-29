/**
 * Gestion Dossier Google Drive via N8N - Menu Coulissant
 * 
 * Version 4.0 - Intégration avec téléchargement du contenu via proxies CORS
 * Basé sur la solution documentée dans GUIDE_INTEGRATION_GOOGLE_DRIVE_N8N_DOC.txt
 * 
 * Endpoint N8N: https://barow52161.app.n8n.cloud/webhook/scan-drive-http
 * 
 * @author E-Audit Pro Team
 * @version 4.0
 */

(function () {
    'use strict';

    console.log('📂 [V4] Gestion Dossier Google Drive via N8N - Initialisation...');

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        panelId: 'gestion-dossier-panel-n8n',
        overlayId: 'gestion-dossier-overlay-n8n',
        n8nEndpoint: 'https://barow52161.app.n8n.cloud/webhook/scan-drive-http',
        corsProxies: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ],
        localCacheKey: 'gestion-dossier-n8n-cache',
        debugMode: true
    };

    // Types de fichiers supportés
    const FILE_TYPES = {
        'application/pdf': { icon: '📕', label: 'PDF', color: '#ea4335', canDownload: true, canEmbed: false },
        'application/vnd.google-apps.document': { icon: '📄', label: 'Google Doc', color: '#4285f4', canDownload: true },
        'application/vnd.google-apps.spreadsheet': { icon: '📊', label: 'Google Sheet', color: '#34a853', canDownload: false },
        'application/vnd.google-apps.presentation': { icon: '📽️', label: 'Google Slides', color: '#fbbc05', canDownload: false },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', label: 'Word', color: '#2b579a', canDownload: true },
        'default': { icon: '📁', label: 'Fichier', color: '#757575', canDownload: false }
    };

    // ========================================
    // INDEXEDDB POUR CACHE DES PDF
    // ========================================
    const PDF_DB_NAME = 'GestionDossierPDFCache';
    const PDF_DB_VERSION = 1;
    const PDF_STORE_NAME = 'pdfFiles';

    let pdfDB = null;

    async function openPDFDatabase() {
        if (pdfDB) return pdfDB;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(PDF_DB_NAME, PDF_DB_VERSION);

            request.onerror = () => {
                debug.error('Erreur ouverture IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                pdfDB = request.result;
                debug.log('IndexedDB ouverte pour cache PDF');
                resolve(pdfDB);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
                    const store = db.createObjectStore(PDF_STORE_NAME, { keyPath: 'fileId' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    debug.log('Store PDF créé dans IndexedDB');
                }
            };
        });
    }

    async function getCachedPDF(fileId) {
        try {
            const db = await openPDFDatabase();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([PDF_STORE_NAME], 'readonly');
                const store = transaction.objectStore(PDF_STORE_NAME);
                const request = store.get(fileId);

                request.onsuccess = () => {
                    if (request.result) {
                        debug.log('PDF trouvé dans le cache:', fileId);
                        resolve(request.result.data);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            debug.error('Erreur lecture cache PDF:', e);
            return null;
        }
    }

    async function cachePDF(fileId, base64Data, fileName) {
        try {
            const db = await openPDFDatabase();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([PDF_STORE_NAME], 'readwrite');
                const store = transaction.objectStore(PDF_STORE_NAME);
                const request = store.put({
                    fileId: fileId,
                    data: base64Data,
                    fileName: fileName,
                    timestamp: Date.now()
                });

                request.onsuccess = () => {
                    debug.success('PDF mis en cache:', fileName);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            debug.error('Erreur mise en cache PDF:', e);
            return false;
        }
    }

    // ========================================
    // CHARGEMENT PDF.JS
    // ========================================
    let pdfjsLoaded = false;
    let pdfjsLoadPromise = null;

    async function loadPDFJS() {
        if (pdfjsLoaded && window.pdfjsLib) return true;
        if (pdfjsLoadPromise) return pdfjsLoadPromise;

        pdfjsLoadPromise = new Promise((resolve) => {
            if (window.pdfjsLib) {
                pdfjsLoaded = true;
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                // Configurer le worker
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                pdfjsLoaded = true;
                debug.success('PDF.js chargé avec succès');
                resolve(true);
            };
            script.onerror = () => {
                debug.error('Échec du chargement de PDF.js');
                resolve(false);
            };
            document.head.appendChild(script);
        });

        return pdfjsLoadPromise;
    }

    // ========================================
    // TÉLÉCHARGEMENT PDF VIA PROXY CORS
    // ========================================
    async function downloadPDFFile(fileId, fileName) {
        debug.log('Téléchargement du PDF:', fileName);

        // Vérifier le cache d'abord
        const cachedData = await getCachedPDF(fileId);
        if (cachedData) {
            debug.success('PDF chargé depuis le cache');
            return cachedData;
        }

        // URL de téléchargement direct depuis Google Drive
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        // Liste des proxies CORS
        const corsProxies = [
            { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
            { name: 'corsproxy.io', url: 'https://corsproxy.io/?' }
        ];

        let arrayBuffer = null;

        // Essayer chaque proxy
        for (const proxy of corsProxies) {
            try {
                const proxyUrl = proxy.url + encodeURIComponent(downloadUrl);
                debug.log(`Téléchargement PDF via ${proxy.name}...`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s pour les gros PDF

                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    arrayBuffer = await response.arrayBuffer();
                    if (arrayBuffer && arrayBuffer.byteLength > 1000) {
                        debug.success(`PDF téléchargé via ${proxy.name}: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB`);
                        break;
                    }
                }
            } catch (e) {
                debug.log(`${proxy.name} échoué:`, e.message);
            }
        }

        if (!arrayBuffer || arrayBuffer.byteLength < 1000) {
            debug.error('Impossible de télécharger le PDF');
            return null;
        }

        // Convertir en base64 pour le stockage
        const base64 = arrayBufferToBase64(arrayBuffer);

        // Mettre en cache
        await cachePDF(fileId, base64, fileName);

        return base64;
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // ========================================
    // RENDU PDF AVEC PDF.JS
    // ========================================
    async function renderPDFToCanvas(base64Data, containerId, maxPages = 10) {
        const pdfjsReady = await loadPDFJS();
        if (!pdfjsReady || !window.pdfjsLib) {
            debug.error('PDF.js non disponible');
            return false;
        }

        const container = document.getElementById(containerId);
        if (!container) return false;

        try {
            const arrayBuffer = base64ToArrayBuffer(base64Data);
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            debug.log(`PDF chargé: ${pdf.numPages} pages`);

            // Créer le conteneur de pages
            container.innerHTML = `
                <div class="pdf-viewer-container" style="background: #525659; border-radius: 8px; padding: 20px; max-height: 600px; overflow-y: auto;">
                    <div class="pdf-pages" id="pdf-pages-${containerId}"></div>
                    <div class="pdf-info" style="text-align: center; padding: 10px; color: #fff; font-size: 12px;">
                        ${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''} ${pdf.numPages > maxPages ? `(affichage limité à ${maxPages} pages)` : ''}
                    </div>
                </div>
            `;

            const pagesContainer = document.getElementById(`pdf-pages-${containerId}`);
            const pagesToRender = Math.min(pdf.numPages, maxPages);

            for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const scale = 1.5;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                canvas.style.cssText = 'display: block; margin: 0 auto 15px auto; box-shadow: 0 2px 10px rgba(0,0,0,0.3);';
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext('2d');
                await page.render({ canvasContext: context, viewport: viewport }).promise;

                pagesContainer.appendChild(canvas);
            }

            debug.success('PDF rendu avec succès');
            return true;
        } catch (e) {
            debug.error('Erreur rendu PDF:', e);
            return false;
        }
    }

    // ========================================
    // CHARGEMENT MAMMOTH.JS POUR FICHIERS WORD
    // ========================================
    let mammothLoaded = false;
    let mammothLoadPromise = null;

    async function loadMammoth() {
        if (mammothLoaded && window.mammoth) return true;
        if (mammothLoadPromise) return mammothLoadPromise;

        mammothLoadPromise = new Promise((resolve) => {
            if (window.mammoth) {
                mammothLoaded = true;
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
            script.onload = () => {
                mammothLoaded = true;
                debug.success('Mammoth.js chargé avec succès');
                resolve(true);
            };
            script.onerror = () => {
                debug.error('Échec du chargement de Mammoth.js');
                resolve(false);
            };
            document.head.appendChild(script);
        });

        return mammothLoadPromise;
    }

    // ========================================
    // TÉLÉCHARGEMENT ET CONVERSION FICHIER WORD
    // ========================================
    async function downloadAndConvertWordFile(fileId) {
        debug.log('Téléchargement du fichier Word:', fileId);

        // Charger Mammoth.js si pas encore fait
        const mammothReady = await loadMammoth();
        if (!mammothReady || !window.mammoth) {
            debug.error('Mammoth.js non disponible');
            return null;
        }

        // URL de téléchargement direct depuis Google Drive
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        // Liste des proxies CORS
        const corsProxies = [
            { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
            { name: 'corsproxy.io', url: 'https://corsproxy.io/?' }
        ];

        let arrayBuffer = null;

        // Essayer chaque proxy
        for (const proxy of corsProxies) {
            try {
                const proxyUrl = proxy.url + encodeURIComponent(downloadUrl);
                debug.log(`Téléchargement Word via ${proxy.name}...`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    arrayBuffer = await response.arrayBuffer();
                    if (arrayBuffer && arrayBuffer.byteLength > 100) {
                        debug.success(`Fichier Word téléchargé via ${proxy.name}: ${arrayBuffer.byteLength} bytes`);
                        break;
                    }
                }
            } catch (e) {
                debug.log(`${proxy.name} échoué:`, e.message);
            }
        }

        if (!arrayBuffer || arrayBuffer.byteLength < 100) {
            debug.error('Impossible de télécharger le fichier Word');
            return null;
        }

        // Convertir avec Mammoth
        try {
            debug.log('Conversion avec Mammoth.js...');
            const result = await window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer });

            if (result.value && result.value.length > 0) {
                debug.success('Conversion Word → HTML réussie:', result.value.length, 'caractères');

                // Ajouter des styles pour le rendu
                let htmlContent = result.value;
                htmlContent = `<div class="word-doc-imported">${htmlContent}</div>`;

                // Log des avertissements éventuels
                if (result.messages && result.messages.length > 0) {
                    debug.log('Avertissements Mammoth:', result.messages);
                }

                return htmlContent;
            }
        } catch (e) {
            debug.error('Erreur conversion Mammoth:', e.message);
        }

        return null;
    }

    const debug = {
        log: (...args) => CONFIG.debugMode && console.log('📂 [GestionDossierN8N]', ...args),
        error: (...args) => console.error('❌ [GestionDossierN8N]', ...args),
        success: (...args) => console.log('✅ [GestionDossierN8N]', ...args)
    };

    // ========================================
    // FONCTION DE TÉLÉCHARGEMENT VIA PROXY CORS
    // Version améliorée avec plusieurs proxies et fallbacks
    // ========================================
    async function downloadGoogleDocContent(fileId) {
        debug.log('Téléchargement du contenu Google Doc:', fileId);

        // URL d'export HTML de Google Docs
        const googleUrl = `https://docs.google.com/document/d/${fileId}/export?format=html`;

        // Liste étendue de proxies CORS (ordre de fiabilité)
        const corsProxies = [
            { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
            { name: 'corsproxy.io', url: 'https://corsproxy.io/?' },
            { name: 'cors-anywhere-alt', url: 'https://api.codetabs.com/v1/proxy?quest=' },
            { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' }
        ];

        let htmlContent = '';
        let lastError = null;

        // Essayer chaque proxy
        for (const proxy of corsProxies) {
            try {
                const proxyUrl = proxy.url + encodeURIComponent(googleUrl);
                debug.log(`Tentative via ${proxy.name}...`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,*/*'
                    }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    htmlContent = await response.text();

                    // Vérifier que c'est bien du HTML valide
                    if (htmlContent && htmlContent.length > 200 &&
                        (htmlContent.includes('<') || htmlContent.includes('html'))) {
                        debug.success(`✅ Contenu téléchargé via ${proxy.name}: ${htmlContent.length} caractères`);
                        break;
                    } else {
                        debug.log(`${proxy.name}: Réponse invalide ou trop courte`);
                        htmlContent = '';
                    }
                } else {
                    debug.log(`${proxy.name}: HTTP ${response.status}`);
                }
            } catch (e) {
                lastError = e;
                debug.log(`${proxy.name} échoué:`, e.name === 'AbortError' ? 'Timeout' : e.message);
            }
        }

        // Si aucun proxy n'a fonctionné, essayer l'URL de visualisation publique
        if (!htmlContent || htmlContent.length < 200) {
            debug.log('Tentative via URL de visualisation publique...');
            try {
                const pubUrl = `https://docs.google.com/document/d/${fileId}/pub`;
                const proxyUrl = corsProxies[0].url + encodeURIComponent(pubUrl);

                const response = await fetch(proxyUrl);
                if (response.ok) {
                    htmlContent = await response.text();
                    debug.success('Contenu récupéré via /pub:', htmlContent.length, 'caractères');
                }
            } catch (e) {
                debug.log('Fallback /pub échoué:', e.message);
            }
        }

        // Nettoyer le HTML si on a du contenu
        if (htmlContent && htmlContent.length > 100) {
            // Extraire le body si présent
            const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch) {
                htmlContent = bodyMatch[1];
            }

            // Nettoyage de sécurité
            htmlContent = htmlContent
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/<link[^>]*>/gi, '')
                .replace(/<meta[^>]*>/gi, '')
                .replace(/<!DOCTYPE[^>]*>/gi, '')
                .replace(/<html[^>]*>/gi, '')
                .replace(/<\/html>/gi, '')
                .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
                .replace(/<body[^>]*>/gi, '')
                .replace(/<\/body>/gi, '');

            // Ajouter des styles de base pour le rendu
            htmlContent = `<div class="google-doc-imported">${htmlContent}</div>`;
        }

        if (!htmlContent || htmlContent.length < 100) {
            debug.error('Impossible de télécharger le contenu du document');
            return null;
        }

        return htmlContent;
    }

    // ========================================
    // STYLES CSS
    // ========================================
    const STYLES = `
        .gdn-overlay {
            position: fixed; inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 99998;
            display: none; opacity: 0;
            transition: opacity 0.3s ease-out;
        }
        .gdn-overlay.open { display: block; opacity: 1; }
        
        .gdn-panel {
            position: fixed; top: 0; right: 0;
            height: 100%; width: 65%;
            min-width: 700px; max-width: 1000px;
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
            box-shadow: -8px 0 40px rgba(0, 0, 0, 0.5);
            z-index: 99999;
            display: none; flex-direction: column;
            transform: translateX(100%);
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gdn-panel.open { display: flex; transform: translateX(0); }
        
        .gdn-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: linear-gradient(90deg, rgba(66, 133, 244, 0.2) 0%, rgba(52, 168, 83, 0.1) 50%, transparent 100%);
        }
        
        .gdn-content { flex: 1; overflow-y: auto; padding: 20px; }
        
        .gdn-file-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px; margin-bottom: 10px;
            overflow: hidden; transition: all 0.3s ease;
        }
        .gdn-file-item:hover { border-color: rgba(66, 133, 244, 0.3); }
        .gdn-file-item.expanded { border-color: rgba(66, 133, 244, 0.5); }
        
        .gdn-file-header {
            display: flex; align-items: center;
            padding: 16px 18px; cursor: pointer;
            gap: 14px; transition: background 0.2s;
        }
        .gdn-file-header:hover { background: rgba(255, 255, 255, 0.05); }
        
        .gdn-file-icon {
            font-size: 28px; flex-shrink: 0;
            width: 44px; height: 44px;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255, 255, 255, 0.05); border-radius: 10px;
        }
        
        .gdn-file-info { flex: 1; min-width: 0; }
        .gdn-file-name { color: #fff; font-weight: 500; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gdn-file-meta { color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 4px; display: flex; gap: 10px; }
        
        .gdn-chevron { color: rgba(255,255,255,0.4); font-size: 14px; transition: transform 0.3s; }
        .gdn-file-item.expanded .gdn-chevron { transform: rotate(90deg); }
        
        .gdn-file-content { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; background: rgba(0, 0, 0, 0.2); }
        .gdn-file-item.expanded .gdn-file-content { max-height: 800px; }
        
        .gdn-viewer { padding: 20px; }
        .gdn-doc-content {
            background: white; border-radius: 8px; padding: 30px;
            max-height: 600px; overflow-y: auto;
            color: #333; line-height: 1.7; font-size: 14px;
        }
        .gdn-doc-content h1, .gdn-doc-content h2, .gdn-doc-content h3 { color: #1e3a8a; margin-top: 1.5em; margin-bottom: 0.5em; }
        .gdn-doc-content p { margin-bottom: 1em; }
        .gdn-doc-content ul, .gdn-doc-content ol { margin-left: 20px; margin-bottom: 1em; }
        .gdn-doc-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .gdn-doc-content td, .gdn-doc-content th { border: 1px solid #ddd; padding: 8px; }
        
        .gdn-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 20px; }
        .gdn-spinner { width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #4285f4; border-radius: 50%; animation: gdn-spin 1s linear infinite; }
        @keyframes gdn-spin { to { transform: rotate(360deg); } }
        
        .gdn-btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        .gdn-btn-primary { background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; }
        .gdn-btn-primary:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(66, 133, 244, 0.4); }
        
        .gdn-stats { background: linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.1) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        
        .gdn-floating-btn { position: fixed; bottom: 100px; right: 20px; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 75%, #ea4335 100%); border: none; box-shadow: 0 4px 20px rgba(66, 133, 244, 0.5); cursor: pointer; font-size: 26px; z-index: 9998; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; }
        .gdn-floating-btn:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 6px 25px rgba(66, 133, 244, 0.6); }
        
        .gdn-fallback-viewer { text-align: center; padding: 30px; background: rgba(255,255,255,0.02); border-radius: 8px; }
    `;

    // ========================================
    // CLASSE PRINCIPALE
    // ========================================
    class GestionDossierN8N {
        constructor() {
            this.isOpen = false;
            this.panel = null;
            this.overlay = null;
            this.files = [];
            this.folderInfo = null;
            this.expandedFiles = new Set();
            this.loadedContent = new Map(); // Cache du contenu téléchargé
            this.isLoading = false;
            this.init();
        }

        init() {
            debug.log('Initialisation du menu Gestion Dossier N8N');
            this.injectStyles();
            this.createFloatingButton();
            this.createPanel();
            debug.success('Menu Gestion Dossier N8N initialisé');
        }

        injectStyles() {
            if (document.getElementById('gestion-dossier-n8n-styles')) return;
            const styleEl = document.createElement('style');
            styleEl.id = 'gestion-dossier-n8n-styles';
            styleEl.textContent = STYLES;
            document.head.appendChild(styleEl);
        }

        createFloatingButton() {
            // Bouton flottant désactivé - utiliser uniquement le bouton dans la sidebar
            debug.log('Bouton flottant N8N désactivé');
        }

        createPanel() {
            document.getElementById(CONFIG.panelId)?.remove();
            document.getElementById(CONFIG.overlayId)?.remove();

            this.overlay = document.createElement('div');
            this.overlay.id = CONFIG.overlayId;
            this.overlay.className = 'gdn-overlay';
            this.overlay.addEventListener('click', () => this.close());
            document.body.appendChild(this.overlay);

            this.panel = document.createElement('div');
            this.panel.id = CONFIG.panelId;
            this.panel.className = 'gdn-panel';
            this.panel.innerHTML = `
                <div class="gdn-header">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4285f4 0%, #34a853 33%, #fbbc05 66%, #ea4335 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 15px rgba(66, 133, 244, 0.3);">📂</div>
                        <div>
                            <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff;">Gestion Électronique</h2>
                            <p id="gdn-folder-info" style="margin: 5px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.6);">📁 Chargement via N8N...</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.gestionDossierN8N.loadFolderContent()" title="Actualiser" style="width: 42px; height: 42px; border: none; background: rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; font-size: 18px; color: #fff;">🔄</button>
                        <button id="gdn-open-drive-btn" title="Ouvrir Drive" style="width: 42px; height: 42px; border: none; background: rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; font-size: 18px; color: #fff;">🌐</button>
                        <button onclick="window.gestionDossierN8N.close()" title="Fermer" style="width: 42px; height: 42px; border: none; background: rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; font-size: 18px; color: #fff;">✕</button>
                    </div>
                </div>
                <div id="gestion-dossier-content-n8n" class="gdn-content"></div>
            `;
            document.body.appendChild(this.panel);
        }

        open() {
            if (this.isOpen) return;
            debug.log('Ouverture du panneau');
            this.overlay.classList.add('open');
            this.panel.classList.add('open');
            this.isOpen = true;
            this.loadFolderContent();
            this.escapeHandler = (e) => { if (e.key === 'Escape') this.close(); };
            document.addEventListener('keydown', this.escapeHandler);
        }

        close() {
            if (!this.isOpen) return;
            debug.log('Fermeture du panneau');
            this.overlay.classList.remove('open');
            this.panel.classList.remove('open');
            this.isOpen = false;
            if (this.escapeHandler) document.removeEventListener('keydown', this.escapeHandler);
        }

        toggle() { this.isOpen ? this.close() : this.open(); }

        async loadFolderContent() {
            if (this.isLoading) return;
            this.isLoading = true;

            const content = document.getElementById('gestion-dossier-content-n8n');
            if (!content) return;

            content.innerHTML = this.createLoader('Chargement des documents via N8N...');

            try {
                const data = await this.fetchFromN8N();
                if (data && data.contenu && data.contenu.length > 0) {
                    this.files = data.contenu.filter(f => !f.fichier_nom.startsWith('~$'));
                    this.folderInfo = data.dossierCible;
                    this.updateFolderInfo(data);
                    this.renderFileList(content);
                    debug.success(`${this.files.length} fichiers chargés depuis N8N`);
                } else {
                    this.renderError(content, 'Aucun fichier trouvé');
                }
            } catch (error) {
                debug.error('Erreur chargement N8N:', error);
                this.renderError(content, error.message);
            } finally {
                this.isLoading = false;
            }
        }

        async fetchFromN8N() {
            debug.log('Appel endpoint N8N:', CONFIG.n8nEndpoint);
            const response = await fetch(CONFIG.n8nEndpoint, { method: 'GET', headers: { 'Accept': 'application/json' } });
            if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
            const data = await response.json();
            debug.log('Réponse N8N:', data);
            return Array.isArray(data) && data.length > 0 ? data[0] : data;
        }

        updateFolderInfo(data) {
            const folderInfoEl = document.getElementById('gdn-folder-info');
            const openDriveBtn = document.getElementById('gdn-open-drive-btn');
            if (folderInfoEl && data.dossierCible) {
                folderInfoEl.textContent = `📁 ${data.dossierCible.nom} • ${data.statistiques?.totalElements || 0} fichiers`;
            }
            if (openDriveBtn && data.dossierCible?.id) {
                openDriveBtn.onclick = () => window.open(`https://drive.google.com/drive/folders/${data.dossierCible.id}`, '_blank');
            }
        }

        createLoader(message = 'Chargement...') {
            return `<div class="gdn-loader"><div class="gdn-spinner"></div><p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">${message}</p></div>`;
        }

        renderError(container, message) {
            container.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 30px; text-align: center; margin: 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <h3 style="color: #ef4444; margin: 0 0 10px 0;">Erreur de chargement</h3>
                    <p style="color: rgba(255,255,255,0.6); margin: 0 0 20px 0;">${message}</p>
                    <button class="gdn-btn gdn-btn-primary" onclick="window.gestionDossierN8N.loadFolderContent()">🔄 Réessayer</button>
                </div>
            `;
        }

        renderFileList(container) {
            if (this.files.length === 0) {
                container.innerHTML = `<div style="text-align: center; padding: 60px; color: rgba(255,255,255,0.5);"><div style="font-size: 64px; margin-bottom: 20px;">📭</div><p>Aucun document dans ce dossier</p></div>`;
                return;
            }

            const typeCounts = {};
            this.files.forEach(f => {
                const type = FILE_TYPES[f.fichier_mimeType] || FILE_TYPES['default'];
                typeCounts[type.label] = (typeCounts[type.label] || 0) + 1;
            });
            const typeIcons = Object.entries(typeCounts).map(([label, count]) => `<span>${count} ${label}</span>`).join(' • ');

            let html = `
                <div class="gdn-stats">
                    <div>
                        <span style="color: #fff; font-weight: 600; font-size: 16px;">📊 ${this.files.length} documents</span>
                        <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 4px;">${typeIcons}</div>
                    </div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 12px;">Dernière sync: ${new Date().toLocaleString('fr-FR')}</div>
                </div>
            `;

            this.files.forEach((file, index) => {
                const fileType = FILE_TYPES[file.fichier_mimeType] || FILE_TYPES['default'];
                const isExpanded = this.expandedFiles.has(file.fichier_id);

                html += `
                    <div class="gdn-file-item ${isExpanded ? 'expanded' : ''}" data-file-id="${file.fichier_id}" data-index="${index}">
                        <div class="gdn-file-header" onclick="window.gestionDossierN8N.toggleFile('${file.fichier_id}', ${index})">
                            <span class="gdn-file-icon" style="background: ${fileType.color}20;">${fileType.icon}</span>
                            <div class="gdn-file-info">
                                <div class="gdn-file-name">${file.fichier_nom}</div>
                                <div class="gdn-file-meta">
                                    <span style="color: ${fileType.color};">${fileType.label}</span>
                                    <span>📁 ${file.dossier_parent_nom || 'Racine'}</span>
                                </div>
                            </div>
                            <span class="gdn-chevron">▶</span>
                        </div>
                        <div class="gdn-file-content">
                            <div class="gdn-viewer" id="viewer-${file.fichier_id}"></div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        async toggleFile(fileId, index) {
            const item = document.querySelector(`.gdn-file-item[data-file-id="${fileId}"]`);
            if (!item) return;

            const isExpanded = item.classList.contains('expanded');

            // Fermer tous les autres
            document.querySelectorAll('.gdn-file-item.expanded').forEach(el => {
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
                await this.loadFileViewer(this.files[index]);
            }
        }

        async loadFileViewer(file) {
            const viewer = document.getElementById(`viewer-${file.fichier_id}`);
            if (!viewer) return;

            const fileType = FILE_TYPES[file.fichier_mimeType] || FILE_TYPES['default'];

            // Afficher un loader pendant le chargement
            viewer.innerHTML = this.createLoader('Chargement du document...');

            // Pour les Google Docs, essayer d'abord le téléchargement via proxy CORS
            if (file.fichier_mimeType === 'application/vnd.google-apps.document') {
                // Vérifier le cache
                if (this.loadedContent.has(file.fichier_id)) {
                    viewer.innerHTML = `<div class="gdn-doc-content">${this.loadedContent.get(file.fichier_id)}</div>`;
                    this.addViewerActions(viewer, file);
                    return;
                }

                try {
                    const htmlContent = await downloadGoogleDocContent(file.fichier_id);

                    if (htmlContent && htmlContent.length > 100) {
                        this.loadedContent.set(file.fichier_id, htmlContent);
                        viewer.innerHTML = `<div class="gdn-doc-content">${htmlContent}</div>`;
                        this.addViewerActions(viewer, file);
                        debug.success('Document Google Doc affiché via proxy:', file.fichier_nom);
                        return;
                    }
                } catch (error) {
                    debug.log('Téléchargement CORS échoué, utilisation du fallback iframe:', error.message);
                }

                // Fallback: utiliser l'iframe avec /pub?embedded=true
                debug.log('Utilisation du fallback iframe /pub pour:', file.fichier_nom);
                this.renderFallbackViewer(viewer, file);
            }
            // Pour les fichiers Word (.docx), utiliser Mammoth.js
            else if (file.fichier_mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // Vérifier le cache
                if (this.loadedContent.has(file.fichier_id)) {
                    viewer.innerHTML = `<div class="gdn-doc-content">${this.loadedContent.get(file.fichier_id)}</div>`;
                    this.addWordViewerActions(viewer, file);
                    return;
                }

                viewer.innerHTML = this.createLoader('Téléchargement et conversion du fichier Word...');

                try {
                    const htmlContent = await downloadAndConvertWordFile(file.fichier_id);

                    if (htmlContent && htmlContent.length > 50) {
                        this.loadedContent.set(file.fichier_id, htmlContent);
                        viewer.innerHTML = `<div class="gdn-doc-content">${htmlContent}</div>`;
                        this.addWordViewerActions(viewer, file);
                        debug.success('Document Word affiché:', file.fichier_nom);
                        return;
                    }
                } catch (error) {
                    debug.error('Erreur conversion Word:', error.message);
                }

                // Fallback si la conversion échoue
                this.renderFallbackViewer(viewer, file);
            }
            // Pour les PDF - Affichage avec boutons d'action (pas d'iframe possible avec Google Drive)
            else if (file.fichier_mimeType === 'application/pdf') {
                const driveViewUrl = `https://drive.google.com/file/d/${file.fichier_id}/view`;
                const drivePreviewUrl = `https://drive.google.com/file/d/${file.fichier_id}/preview`;
                const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${file.fichier_id}`;

                viewer.innerHTML = `
                    <div class="pdf-viewer-gdn" style="background: linear-gradient(135deg, rgba(234, 67, 53, 0.1) 0%, rgba(198, 40, 40, 0.1) 100%); border-radius: 12px; padding: 40px 30px; text-align: center;">
                        <div style="font-size: 80px; margin-bottom: 20px;">📕</div>
                        <h3 style="color: #fff; margin: 0 0 10px 0; font-size: 18px;">${file.fichier_nom}</h3>
                        <p style="color: rgba(255,255,255,0.6); margin: 0 0 30px 0; font-size: 14px; line-height: 1.6;">
                            Les fichiers PDF de Google Drive ne peuvent pas être affichés<br>
                            directement dans l'application en raison des restrictions de sécurité Google.
                        </p>
                        
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 25px;">
                            <button onclick="window.open('${driveViewUrl}', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')" 
                                    class="gdn-btn gdn-btn-primary" style="padding: 14px 28px; font-size: 15px;">
                                📖 Ouvrir le PDF
                            </button>
                            <a href="${directDownloadUrl}" target="_blank" 
                               class="gdn-btn" style="padding: 14px 28px; font-size: 15px; text-decoration: none; background: rgba(234, 67, 53, 0.2); color: #ea4335; border: 1px solid rgba(234, 67, 53, 0.3);">
                                📥 Télécharger
                            </a>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin-top: 20px;">
                            <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px;">
                                💡 <strong>Astuce :</strong> Cliquez sur "Ouvrir le PDF" pour visualiser le document dans une nouvelle fenêtre
                            </p>
                        </div>
                    </div>
                `;
                debug.success('PDF viewer (boutons) créé pour:', file.fichier_nom);
                return;
            } else {
                // Pour les autres types, utiliser directement le fallback
                this.renderFallbackViewer(viewer, file);
            }
        }

        addWordViewerActions(viewer, file) {
            const actionsDiv = document.createElement('div');
            actionsDiv.style.cssText = 'display: flex; justify-content: center; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);';
            actionsDiv.innerHTML = `
                <a href="https://drive.google.com/file/d/${file.fichier_id}/view" target="_blank" class="gdn-btn gdn-btn-primary" style="text-decoration: none;">
                    🔗 Ouvrir dans Drive
                </a>
                <a href="https://drive.google.com/uc?export=download&id=${file.fichier_id}" target="_blank" class="gdn-btn" style="text-decoration: none; background: rgba(255,255,255,0.1); color: white;">
                    📥 Télécharger
                </a>
            `;
            viewer.appendChild(actionsDiv);
        }

        addPDFViewerActions(viewer, file) {
            const actionsDiv = document.createElement('div');
            actionsDiv.style.cssText = 'display: flex; justify-content: center; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);';
            actionsDiv.innerHTML = `
                <a href="https://drive.google.com/file/d/${file.fichier_id}/view" target="_blank" class="gdn-btn gdn-btn-primary" style="text-decoration: none;">
                    🔗 Ouvrir dans Drive
                </a>
                <a href="https://drive.google.com/uc?export=download&id=${file.fichier_id}" target="_blank" class="gdn-btn" style="text-decoration: none; background: rgba(234, 67, 53, 0.2); color: #ea4335; border: 1px solid rgba(234, 67, 53, 0.3);">
                    📥 Télécharger PDF
                </a>
                <button onclick="window.gestionDossierN8N.clearPDFCache('${file.fichier_id}')" class="gdn-btn" style="background: rgba(255,255,255,0.1); color: white;" title="Vider le cache et recharger">
                    🔄 Actualiser
                </button>
            `;
            viewer.appendChild(actionsDiv);
        }

        async clearPDFCache(fileId) {
            try {
                const db = await openPDFDatabase();
                const transaction = db.transaction([PDF_STORE_NAME], 'readwrite');
                const store = transaction.objectStore(PDF_STORE_NAME);
                store.delete(fileId);
                this.loadedContent.delete(fileId);
                debug.log('Cache PDF vidé pour:', fileId);

                // Recharger le fichier
                const file = this.files.find(f => f.fichier_id === fileId);
                if (file) {
                    await this.loadFileViewer(file);
                }
            } catch (e) {
                debug.error('Erreur vidage cache PDF:', e);
            }
        }

        renderPDFFallback(viewer, file) {
            const pdfUrl = `https://drive.google.com/file/d/${file.fichier_id}/view`;
            const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${file.fichier_id}`;

            viewer.innerHTML = `
                <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 30px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📕</div>
                    <h3 style="color: #fff; margin: 0 0 10px 0;">${file.fichier_nom}</h3>
                    <p style="color: rgba(255,255,255,0.6); margin: 0 0 15px 0; font-size: 14px;">
                        ⚠️ Le téléchargement automatique a échoué.<br>
                        Le fichier est peut-être trop volumineux ou non partagé publiquement.
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <a href="${pdfUrl}" target="_blank" class="gdn-btn gdn-btn-primary" style="text-decoration: none;">
                            🔗 Ouvrir dans Google Drive
                        </a>
                        <a href="${directDownloadUrl}" target="_blank" class="gdn-btn" style="text-decoration: none; background: rgba(234, 67, 53, 0.2); color: #ea4335; border: 1px solid rgba(234, 67, 53, 0.3);">
                            📥 Télécharger manuellement
                        </a>
                    </div>
                </div>
            `;
        }

        renderFallbackViewer(viewer, file) {
            const fileType = FILE_TYPES[file.fichier_mimeType] || FILE_TYPES['default'];

            // Pour les Google Docs, utiliser l'URL de publication intégrée
            if (file.fichier_mimeType === 'application/vnd.google-apps.document') {
                // URL de publication qui fonctionne en iframe
                const pubUrl = `https://docs.google.com/document/d/${file.fichier_id}/pub?embedded=true`;

                viewer.innerHTML = `
                    <div style="background: white; border-radius: 8px; overflow: hidden;">
                        <iframe 
                            src="${pubUrl}" 
                            style="width: 100%; height: 550px; border: none;"
                            sandbox="allow-same-origin allow-scripts allow-popups"
                            loading="lazy"
                        ></iframe>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px;">
                        <a href="https://docs.google.com/document/d/${file.fichier_id}/edit" target="_blank" class="gdn-btn gdn-btn-primary" style="text-decoration: none;">
                            ✏️ Modifier dans Google Docs
                        </a>
                        <a href="https://docs.google.com/document/d/${file.fichier_id}/export?format=pdf" target="_blank" class="gdn-btn" style="text-decoration: none; background: rgba(255,255,255,0.1); color: white;">
                            📥 Télécharger PDF
                        </a>
                    </div>
                `;
                return;
            }

            // Pour les fichiers Word, utiliser Office Online Viewer ou Google Docs Viewer
            if (file.fichier_mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const driveViewUrl = `https://drive.google.com/file/d/${file.fichier_id}/preview`;

                viewer.innerHTML = `
                    <div style="background: white; border-radius: 8px; overflow: hidden;">
                        <iframe 
                            src="${driveViewUrl}" 
                            style="width: 100%; height: 550px; border: none;"
                            allow="autoplay"
                            loading="lazy"
                        ></iframe>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px;">
                        <a href="https://drive.google.com/file/d/${file.fichier_id}/view" target="_blank" class="gdn-btn gdn-btn-primary" style="text-decoration: none;">
                            🔗 Ouvrir dans Drive
                        </a>
                        <a href="https://drive.google.com/uc?export=download&id=${file.fichier_id}" target="_blank" class="gdn-btn" style="text-decoration: none; background: rgba(255,255,255,0.1); color: white;">
                            📥 Télécharger
                        </a>
                    </div>
                `;
                return;
            }

            // Fallback générique pour les autres types
            viewer.innerHTML = `
                <div class="gdn-fallback-viewer">
                    <div style="font-size: 64px; margin-bottom: 20px;">${fileType.icon}</div>
                    <h3 style="color: #fff; margin: 0 0 10px 0;">${file.fichier_nom}</h3>
                    <p style="color: rgba(255,255,255,0.6); margin: 0 0 20px 0;">
                        Type: ${fileType.label}<br>
                        <small>Ce type de fichier doit être ouvert dans Google Drive.</small>
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <a href="https://drive.google.com/file/d/${file.fichier_id}/view" target="_blank" class="gdn-btn gdn-btn-primary" style="text-decoration: none;">
                            🔗 Ouvrir dans Google Drive
                        </a>
                    </div>
                </div>
            `;
        }

        addViewerActions(viewer, file) {
            const actionsDiv = document.createElement('div');
            actionsDiv.style.cssText = 'display: flex; justify-content: center; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);';
            actionsDiv.innerHTML = `
                <a href="https://drive.google.com/file/d/${file.fichier_id}/view" target="_blank" class="gdn-btn gdn-btn-primary" style="text-decoration: none;">
                    🔗 Ouvrir dans Drive
                </a>
                <a href="https://docs.google.com/document/d/${file.fichier_id}/edit" target="_blank" class="gdn-btn" style="text-decoration: none; background: rgba(255,255,255,0.1); color: white;">
                    ✏️ Modifier
                </a>
            `;
            viewer.appendChild(actionsDiv);
        }
    }

    // ========================================
    // INITIALISATION
    // ========================================
    let instance = null;

    function init() {
        if (instance) return instance;
        instance = new GestionDossierN8N();
        window.gestionDossierN8N = instance;
        return instance;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ gestion-dossier-n8n.js chargé');
    console.log('💡 Ouvrir le menu: window.gestionDossierN8N.open()');

})();
