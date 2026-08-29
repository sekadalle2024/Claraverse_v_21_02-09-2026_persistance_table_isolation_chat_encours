/**
 * ========================================
 * CLARAVERSE SETUP SCRIPT v3.0
 * ========================================
 *
 * Script d'installation et configuration rapide
 * pour le système de synchronisation ClaraVerse
 *
 * Usage simple:
 * <script src="setup-claraverse.js"></script>
 *
 * Le script se charge automatiquement de:
 * - Détecter l'environnement
 * - Charger les scripts nécessaires
 * - Configurer le système
 * - Vérifier le bon fonctionnement
 */

(function() {
  'use strict';

  // Configuration de base du setup
  const SETUP_CONFIG = {
    VERSION: '3.0.0',
    DEBUG: true,
    AUTO_INIT: true,
    SHOW_SETUP_UI: true,

    // Scripts à charger (dans l'ordre)
    REQUIRED_SCRIPTS: [
      { name: 'coordinator', file: 'sync-coordinator.js', global: 'claraverseCoordinator' },
      { name: 'dev', file: 'dev.js', global: 'claraverseSyncAPI' },
      { name: 'conso', file: 'conso.js', global: 'claraverseProcessor', optional: true },
      { name: 'menu', file: 'menu.js', global: 'contextualMenuManager', optional: true }
    ],

    // Configuration optionnelle
    CONFIG_FILE: 'claraverse-config.js',

    // Timeouts
    SCRIPT_LOAD_TIMEOUT: 10000,
    INIT_TIMEOUT: 30000,

    // UI
    UI_POSITION: 'bottom-right',
    UI_AUTO_HIDE_DELAY: 10000
  };

  /**
   * ========================================
   * LOGGER DE SETUP
   * ========================================
   */
  class SetupLogger {
    constructor() {
      this.logs = [];
      this.uiContainer = null;
      this.setupUI();
    }

    setupUI() {
      if (!SETUP_CONFIG.SHOW_SETUP_UI) return;

      this.uiContainer = document.createElement('div');
      this.uiContainer.id = 'claraverse-setup-ui';
      this.uiContainer.style.cssText = `
        position: fixed;
        ${SETUP_CONFIG.UI_POSITION.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
        ${SETUP_CONFIG.UI_POSITION.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        width: 350px;
        max-height: 400px;
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        color: #f9fafb;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        z-index: 999999;
        overflow: hidden;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        border: 1px solid #374151;
      `;

      const header = document.createElement('div');
      header.style.cssText = `
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        padding: 12px 16px;
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      `;
      header.innerHTML = `
        <span>🎯 ClaraVerse Setup v${SETUP_CONFIG.VERSION}</span>
        <button id="setup-close-btn" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      `;

      this.logArea = document.createElement('div');
      this.logArea.style.cssText = `
        padding: 12px 16px;
        max-height: 300px;
        overflow-y: auto;
        line-height: 1.4;
      `;

      this.progressBar = document.createElement('div');
      this.progressBar.style.cssText = `
        height: 3px;
        background: #374151;
        position: relative;
        overflow: hidden;
      `;

      this.progressFill = document.createElement('div');
      this.progressFill.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #10b981, #059669);
        width: 0%;
        transition: width 0.3s ease;
      `;
      this.progressBar.appendChild(this.progressFill);

      this.uiContainer.appendChild(header);
      this.uiContainer.appendChild(this.progressBar);
      this.uiContainer.appendChild(this.logArea);

      // Événements
      header.querySelector('#setup-close-btn').onclick = () => this.hideUI();

      // Ajouter au DOM quand prêt
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(this.uiContainer);
          this.showUI();
        });
      } else {
        document.body.appendChild(this.uiContainer);
        this.showUI();
      }

      // Auto-masquer après délai
      setTimeout(() => {
        if (this.uiContainer) {
          this.hideUI();
        }
      }, SETUP_CONFIG.UI_AUTO_HIDE_DELAY);
    }

    showUI() {
      if (this.uiContainer) {
        setTimeout(() => {
          this.uiContainer.style.transform = 'translateY(0)';
        }, 100);
      }
    }

    hideUI() {
      if (this.uiContainer) {
        this.uiContainer.style.transform = 'translateY(100%)';
        setTimeout(() => {
          if (this.uiContainer && this.uiContainer.parentNode) {
            this.uiContainer.parentNode.removeChild(this.uiContainer);
          }
        }, 300);
      }
    }

    updateProgress(percentage) {
      if (this.progressFill) {
        this.progressFill.style.width = `${percentage}%`;
      }
    }

    log(message, level = 'info') {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = { timestamp, message, level };
      this.logs.push(logEntry);

      // Console log
      if (SETUP_CONFIG.DEBUG) {
        const emoji = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
        console.log(`${emoji[level] || '📝'} [ClaraVerse Setup] ${message}`);
      }

      // UI log
      if (this.logArea) {
        const logDiv = document.createElement('div');
        const colors = {
          info: '#60a5fa',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171'
        };

        logDiv.style.cssText = `
          padding: 2px 0;
          color: ${colors[level] || '#d1d5db'};
          font-size: 12px;
        `;
        logDiv.innerHTML = `<span style="color: #9ca3af;">[${timestamp}]</span> ${message}`;

        this.logArea.appendChild(logDiv);
        this.logArea.scrollTop = this.logArea.scrollHeight;
      }
    }
  }

  /**
   * ========================================
   * GESTIONNAIRE DE CHARGEMENT DE SCRIPTS
   * ========================================
   */
  class ScriptLoader {
    constructor(logger) {
      this.logger = logger;
      this.loadedScripts = new Set();
    }

    async loadScript(scriptConfig) {
      return new Promise((resolve, reject) => {
        // Vérifier si déjà chargé
        if (this.isScriptLoaded(scriptConfig)) {
          this.logger.log(`✓ ${scriptConfig.name} déjà chargé`, 'success');
          resolve(scriptConfig);
          return;
        }

        this.logger.log(`Chargement de ${scriptConfig.name}...`, 'info');

        const script = document.createElement('script');
        script.src = scriptConfig.file;
        script.type = scriptConfig.file.endsWith('.js') ? 'text/javascript' : 'module';

        const timeout = setTimeout(() => {
          this.logger.log(`⏱️ Timeout chargement ${scriptConfig.name}`, 'warning');
          if (scriptConfig.optional) {
            resolve(scriptConfig);
          } else {
            reject(new Error(`Timeout chargement ${scriptConfig.name}`));
          }
        }, SETUP_CONFIG.SCRIPT_LOAD_TIMEOUT);

        script.onload = () => {
          clearTimeout(timeout);
          this.loadedScripts.add(scriptConfig.name);

          // Attendre un peu que le script s'initialise
          setTimeout(() => {
            if (this.isScriptLoaded(scriptConfig)) {
              this.logger.log(`✅ ${scriptConfig.name} chargé avec succès`, 'success');
              resolve(scriptConfig);
            } else if (scriptConfig.optional) {
              this.logger.log(`⚠️ ${scriptConfig.name} chargé mais API non disponible (optionnel)`, 'warning');
              resolve(scriptConfig);
            } else {
              reject(new Error(`${scriptConfig.name} chargé mais API non disponible`));
            }
          }, 200);
        };

        script.onerror = () => {
          clearTimeout(timeout);
          const error = `Erreur chargement ${scriptConfig.name}`;

          if (scriptConfig.optional) {
            this.logger.log(`⚠️ ${error} (optionnel)`, 'warning');
            resolve(scriptConfig);
          } else {
            this.logger.log(`❌ ${error}`, 'error');
            reject(new Error(error));
          }
        };

        document.head.appendChild(script);
      });
    }

    isScriptLoaded(scriptConfig) {
      if (scriptConfig.global) {
        return !!window[scriptConfig.global];
      }
      return this.loadedScripts.has(scriptConfig.name);
    }

    async loadAllScripts() {
      const totalScripts = SETUP_CONFIG.REQUIRED_SCRIPTS.length;
      let loadedCount = 0;

      for (const scriptConfig of SETUP_CONFIG.REQUIRED_SCRIPTS) {
        try {
          await this.loadScript(scriptConfig);
          loadedCount++;
          this.logger.updateProgress((loadedCount / totalScripts) * 80); // 80% pour le chargement
        } catch (error) {
          this.logger.log(`❌ Échec: ${error.message}`, 'error');
          throw error;
        }
      }

      return loadedCount;
    }
  }

  /**
   * ========================================
   * GESTIONNAIRE D'INSTALLATION
   * ========================================
   */
  class ClaraVerseSetup {
    constructor() {
      this.logger = new SetupLogger();
      this.scriptLoader = new ScriptLoader(this.logger);
      this.isSetupComplete = false;
    }

    async init() {
      try {
        this.logger.log('🚀 Initialisation ClaraVerse v3.0...', 'info');

        // 1. Vérifier prérequis
        this.checkPrerequisites();

        // 2. Charger configuration optionnelle
        await this.loadConfiguration();

        // 3. Charger scripts
        await this.loadScripts();

        // 4. Initialiser système
        await this.initializeSystem();

        // 5. Vérifier fonctionnement
        await this.verifySetup();

        // 6. Setup terminé
        this.completeSetup();

      } catch (error) {
        this.logger.log(`❌ Setup échoué: ${error.message}`, 'error');
        this.showErrorHelp(error);
      }
    }

    checkPrerequisites() {
      this.logger.log('Vérification des prérequis...', 'info');

      // Vérifier que nous sommes dans un navigateur
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('Environnement navigateur requis');
      }

      // Vérifier localStorage
      if (!window.localStorage) {
        this.logger.log('⚠️ localStorage non disponible', 'warning');
      }

      this.logger.log('✓ Prérequis validés', 'success');
    }

    async loadConfiguration() {
      this.logger.log('Chargement de la configuration...', 'info');

      // La configuration peut être déjà chargée
      if (window.CLARAVERSE_CONFIG && window.CLARAVERSE_CONFIG._loaded) {
        this.logger.log('✓ Configuration personnalisée détectée', 'success');
        return;
      }

      // Essayer de charger le fichier de config
      try {
        await this.scriptLoader.loadScript({
          name: 'config',
          file: SETUP_CONFIG.CONFIG_FILE,
          optional: true
        });
      } catch (error) {
        this.logger.log('Configuration par défaut utilisée', 'info');
      }
    }

    async loadScripts() {
      this.logger.log('Chargement des scripts ClaraVerse...', 'info');
      const loadedCount = await this.scriptLoader.loadAllScripts();
      this.logger.log(`✓ ${loadedCount} scripts chargés`, 'success');
    }

    async initializeSystem() {
      this.logger.log('Initialisation du système...', 'info');
      this.logger.updateProgress(85);

      // Attendre que le coordinateur soit prêt
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout initialisation système'));
        }, SETUP_CONFIG.INIT_TIMEOUT);

        // Écouter l'événement de prêt du coordinateur
        document.addEventListener('claraverse:coordinator:ready', (event) => {
          clearTimeout(timeout);
          this.logger.log('✓ Coordinateur initialisé', 'success');
          this.logger.log(`📊 Scripts actifs: ${event.detail.registeredScripts.length}`, 'info');
          resolve();
        });

        // Si le coordinateur est déjà prêt
        if (window.claraverseCoordinator && window.claraverseCoordinator.getState) {
          const state = window.claraverseCoordinator.getState();
          if (state.isInitialized) {
            clearTimeout(timeout);
            resolve();
          }
        }
      });
    }

    async verifySetup() {
      this.logger.log('Vérification du setup...', 'info');
      this.logger.updateProgress(95);

      const verifications = [];

      // Vérifier APIs disponibles
      const apis = [
        { name: 'Coordinateur', global: 'claraverseCoordinator' },
        { name: 'Dev API', global: 'claraverseSyncAPI' },
        { name: 'Storage Manager', global: 'storageManager' }
      ];

      apis.forEach(api => {
        if (window[api.global]) {
          verifications.push(`✓ ${api.name}`);
        } else {
          verifications.push(`✗ ${api.name}`);
        }
      });

      // Tester fonctionnement de base
      try {
        if (window.claraverseSyncAPI) {
          const stats = window.claraverseSyncAPI.getStorageStats();
          verifications.push(`✓ Stockage (${stats.totalItems || 0} entrées)`);
        }
      } catch (error) {
        verifications.push(`✗ Test stockage échoué`);
      }

      this.logger.log(`Vérifications: ${verifications.join(', ')}`, 'info');
    }

    completeSetup() {
      this.logger.updateProgress(100);
      this.isSetupComplete = true;

      this.logger.log('🎉 Setup ClaraVerse terminé avec succès!', 'success');

      // Exposer utilitaires de diagnostic
      window.claraverseSetup = {
        version: SETUP_CONFIG.VERSION,
        isComplete: () => this.isSetupComplete,
        logs: () => this.logger.logs,
        restart: () => this.init(),
        diagnostic: this.runDiagnostic.bind(this)
      };

      // Événement de setup terminé
      const event = new CustomEvent('claraverse:setup:complete', {
        detail: {
          version: SETUP_CONFIG.VERSION,
          timestamp: Date.now(),
          loadedScripts: Array.from(this.scriptLoader.loadedScripts)
        }
      });
      document.dispatchEvent(event);

      // Message console de bienvenue
      console.log(`
🎯 CLARAVERSE v${SETUP_CONFIG.VERSION} READY!
==========================================
✅ Setup terminé avec succès
📊 APIs disponibles:
   • window.claraverseCoordinator - Coordination système
   • window.claraverseSyncAPI - Gestion données
   • window.claraverseSetup - Utilitaires setup

🔧 Commandes utiles:
   • claraverseSetup.diagnostic() - Diagnostic complet
   • claraverseCoordinator.runDiagnostic() - État système
   • claraverseSyncAPI.getStorageStats() - Stats stockage
      `);
    }

    showErrorHelp(error) {
      this.logger.log('💡 Aide au dépannage:', 'info');
      this.logger.log('1. Vérifiez que tous les fichiers .js sont présents', 'info');
      this.logger.log('2. Vérifiez la console pour plus de détails', 'info');
      this.logger.log('3. Essayez: claraverseSetup.restart()', 'info');
    }

    runDiagnostic() {
      const diagnostic = {
        setup: {
          version: SETUP_CONFIG.VERSION,
          complete: this.isSetupComplete,
          loadedScripts: Array.from(this.scriptLoader.loadedScripts)
        },
        apis: {
          coordinator: !!window.claraverseCoordinator,
          devAPI: !!window.claraverseSyncAPI,
          storageManager: !!window.storageManager
        },
        browser: {
          userAgent: navigator.userAgent,
          localStorage: !!window.localStorage,
          url: window.location.href
        }
      };

      console.table(diagnostic);
      return diagnostic;
    }
  }

  /**
   * ========================================
   * AUTO-INITIALISATION
   * ========================================
   */

  // Créer instance setup
  let setupInstance;

  function startSetup() {
    if (setupInstance) return;

    setupInstance = new ClaraVerseSetup();

    if (SETUP_CONFIG.AUTO_INIT) {
      setupInstance.init();
    }
  }

  // Démarrer selon l'état du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSetup);
  } else {
    setTimeout(startSetup, 100);
  }

  // Exposer pour usage manuel
  window.ClaraVerseSetup = ClaraVerseSetup;

})();
