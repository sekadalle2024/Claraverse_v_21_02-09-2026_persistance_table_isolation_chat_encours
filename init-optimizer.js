/**
 * Script d'initialisation optimisé pour ClaraVerse
 * Coordonne le démarrage séquentiel et optimisé de tous les scripts
 * Évite la surcharge CPU et les conflits entre composants
 */

class ClaraVerseInitOptimizer {
  constructor() {
    this.initSteps = new Map();
    this.startTime = Date.now();
    this.metrics = {
      totalInitTime: 0,
      scriptsLoaded: 0,
      errorsEncountered: 0,
      performanceScore: 'unknown'
    };

    this.config = {
      INIT_TIMEOUT: 30000, // 30 secondes max pour init complète
      STEP_TIMEOUT: 5000,  // 5 secondes max par étape
      RETRY_ATTEMPTS: 3,   // 3 tentatives max par script
      PERFORMANCE_THRESHOLD: 100 // seuil performance acceptable
    };

    this.state = {
      currentStep: 0,
      isInitializing: true,
      criticalError: false,
      scriptsReady: {
        performanceOptimizer: false,
        dev: false,
        menu: false,
        conso: false,
        syncCoordinator: false
      }
    };

    console.log("🚀 ClaraVerse Init Optimizer démarré");
    this.init();
  }

  async init() {
    try {
      // Définir les étapes d'initialisation
      this.defineInitSteps();

      // Démarrer l'initialisation séquentielle
      await this.executeInitSequence();

      // Finaliser l'initialisation
      this.completeInitialization();

    } catch (error) {
      console.error("❌ Erreur critique lors de l'initialisation:", error);
      this.handleCriticalError(error);
    }
  }

  defineInitSteps() {
    // Étape 1: Vérifier les prérequis
    this.initSteps.set(1, {
      name: "prerequisites",
      description: "Vérification des prérequis",
      timeout: 3000,
      critical: true,
      execute: () => this.checkPrerequisites()
    });

    // Étape 2: Attendre Performance Optimizer
    this.initSteps.set(2, {
      name: "performance_optimizer",
      description: "Chargement Performance Optimizer",
      timeout: 5000,
      critical: true,
      execute: () => this.waitForPerformanceOptimizer()
    });

    // Étape 3: Initialiser le système de stockage
    this.initSteps.set(3, {
      name: "storage_system",
      description: "Initialisation système stockage",
      timeout: 3000,
      critical: true,
      execute: () => this.initializeStorageSystem()
    });

    // Étape 4: Démarrer dev.js (système core)
    this.initSteps.set(4, {
      name: "dev_script",
      description: "Démarrage dev.js",
      timeout: 5000,
      critical: true,
      execute: () => this.initializeDevScript()
    });

    // Étape 5: Démarrer menu.js
    this.initSteps.set(5, {
      name: "menu_script",
      description: "Démarrage menu.js",
      timeout: 4000,
      critical: false,
      execute: () => this.initializeMenuScript()
    });

    // Étape 6: Démarrer sync-coordinator.js
    this.initSteps.set(6, {
      name: "sync_coordinator",
      description: "Démarrage sync-coordinator.js",
      timeout: 3000,
      critical: false,
      execute: () => this.initializeSyncCoordinator()
    });

    // Étape 7: Démarrer conso.js (si disponible)
    this.initSteps.set(7, {
      name: "conso_script",
      description: "Démarrage conso.js",
      timeout: 3000,
      critical: false,
      execute: () => this.initializeConsoScript()
    });

    // Étape 8: Tests de sanité finale
    this.initSteps.set(8, {
      name: "health_check",
      description: "Vérifications finales",
      timeout: 2000,
      critical: true,
      execute: () => this.performFinalHealthCheck()
    });
  }

  async executeInitSequence() {
    console.log(`📋 Démarrage séquence d'initialisation (${this.initSteps.size} étapes)`);

    for (const [stepNumber, stepConfig] of this.initSteps) {
      this.state.currentStep = stepNumber;

      console.log(`🔄 Étape ${stepNumber}/${this.initSteps.size}: ${stepConfig.description}...`);

      const startTime = Date.now();
      let success = false;
      let attempts = 0;

      while (!success && attempts < this.config.RETRY_ATTEMPTS) {
        attempts++;

        try {
          const result = await Promise.race([
            stepConfig.execute(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout étape ${stepNumber}`)), stepConfig.timeout)
            )
          ]);

          success = result !== false;

          if (success) {
            const duration = Date.now() - startTime;
            console.log(`✅ Étape ${stepNumber} complétée en ${duration}ms`);
          }

        } catch (error) {
          console.warn(`⚠️ Tentative ${attempts}/${this.config.RETRY_ATTEMPTS} échouée pour étape ${stepNumber}:`, error.message);

          if (attempts < this.config.RETRY_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Backoff progressif
          }
        }
      }

      if (!success) {
        const message = `Échec étape ${stepNumber}: ${stepConfig.description}`;

        if (stepConfig.critical) {
          throw new Error(`CRITIQUE: ${message}`);
        } else {
          console.warn(`⚠️ NON-CRITIQUE: ${message} - continuation...`);
        }
      }

      this.metrics.scriptsLoaded++;
    }
  }

  async checkPrerequisites() {
    console.log("🔍 Vérification des prérequis...");

    // Vérifier DOM ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    // Vérifier localStorage disponible
    try {
      localStorage.setItem('claraverse_test', 'test');
      localStorage.removeItem('claraverse_test');
    } catch (error) {
      throw new Error("localStorage non disponible");
    }

    // Vérifier configuration globale
    if (!window.CLARAVERSE_CONFIG) {
      throw new Error("Configuration globale manquante");
    }

    console.log("✅ Prérequis OK");
    return true;
  }

  async waitForPerformanceOptimizer() {
    console.log("⏳ Attente Performance Optimizer...");

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 20; // 10 secondes max

      const checkOptimizer = () => {
        attempts++;

        if (window.performanceOptimizer) {
          console.log("✅ Performance Optimizer prêt");
          this.state.scriptsReady.performanceOptimizer = true;
          resolve(true);
          return;
        }

        if (attempts >= maxAttempts) {
          reject(new Error("Performance Optimizer timeout"));
          return;
        }

        setTimeout(checkOptimizer, 500);
      };

      // Écouter l'événement de disponibilité
      document.addEventListener('claraverse:performance-optimizer-ready', () => {
        this.state.scriptsReady.performanceOptimizer = true;
        resolve(true);
      }, { once: true });

      checkOptimizer();
    });
  }

  async initializeStorageSystem() {
    console.log("💾 Initialisation système de stockage...");

    // Vérifier espace disponible
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage || 0) / (1024 * 1024);
        const quotaMB = (estimate.quota || 0) / (1024 * 1024);

        console.log(`📊 Stockage: ${usedMB.toFixed(2)}MB/${quotaMB.toFixed(2)}MB utilisés`);

        if (usedMB > quotaMB * 0.9) {
          console.warn("⚠️ Espace de stockage critique - nettoyage recommandé");
        }
      } catch (error) {
        console.warn("⚠️ Impossible de vérifier l'espace de stockage");
      }
    }

    // Initialiser l'état global
    if (!window.CLARAVERSE_STATE) {
      window.CLARAVERSE_STATE = {
        initialized: false,
        storageStatus: { status: 'UNKNOWN' },
        activeScripts: [],
        lastSync: null
      };
    }

    return true;
  }

  async initializeDevScript() {
    console.log("🔧 Initialisation dev.js...");

    // Attendre que dev.js soit chargé
    let attempts = 0;
    while (!window.claraverseSyncAPI && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts++;
    }

    if (!window.claraverseSyncAPI) {
      throw new Error("dev.js non disponible");
    }

    // Attendre l'initialisation complète
    if (window.claraverseSyncAPI.initialize) {
      await window.claraverseSyncAPI.initialize();
    }

    this.state.scriptsReady.dev = true;
    console.log("✅ dev.js initialisé");
    return true;
  }

  async initializeMenuScript() {
    console.log("📋 Initialisation menu.js...");

    let attempts = 0;
    while (!window.contextualMenuManager && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts++;
    }

    if (!window.contextualMenuManager) {
      console.warn("⚠️ menu.js non disponible - fonctionnalité réduite");
      return false;
    }

    // Initialiser le menu contextuel avec Performance Optimizer
    if (window.contextualMenuManager.init) {
      await window.contextualMenuManager.init();
    }

    this.state.scriptsReady.menu = true;
    console.log("✅ menu.js initialisé");
    return true;
  }

  async initializeSyncCoordinator() {
    console.log("🔄 Initialisation sync-coordinator.js...");

    let attempts = 0;
    while (!window.syncCoordinator && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts++;
    }

    if (!window.syncCoordinator) {
      console.warn("⚠️ sync-coordinator.js non disponible");
      return false;
    }

    if (window.syncCoordinator.initialize) {
      await window.syncCoordinator.initialize();
    }

    this.state.scriptsReady.syncCoordinator = true;
    console.log("✅ sync-coordinator.js initialisé");
    return true;
  }

  async initializeConsoScript() {
    console.log("📊 Initialisation conso.js...");

    let attempts = 0;
    while (!window.claraverseProcessor && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts++;
    }

    if (!window.claraverseProcessor) {
      console.log("ℹ️ conso.js non disponible - optionnel");
      return true; // Non critique
    }

    this.state.scriptsReady.conso = true;
    console.log("✅ conso.js disponible");
    return true;
  }

  async performFinalHealthCheck() {
    console.log("🏥 Vérifications finales...");

    const criticalScripts = ['performanceOptimizer', 'dev'];
    const missingCritical = criticalScripts.filter(script => !this.state.scriptsReady[script]);

    if (missingCritical.length > 0) {
      throw new Error(`Scripts critiques manquants: ${missingCritical.join(', ')}`);
    }

    // Vérifier Performance Optimizer
    if (window.performanceOptimizer) {
      const stats = window.performanceOptimizer.getStats();
      console.log("📊 Stats Performance Optimizer:", stats);

      if (stats.intervals > 10 || stats.observers > 8) {
        console.warn("⚠️ Charge élevée détectée au démarrage");
        this.metrics.performanceScore = 'warning';
      } else {
        this.metrics.performanceScore = 'good';
      }
    }

    // Test rapide de fonctionnalité
    try {
      const testTable = document.createElement('table');
      testTable.innerHTML = '<tr><td>test</td></tr>';

      if (window.claraverseSyncAPI && window.claraverseSyncAPI.generateTableId) {
        const testId = window.claraverseSyncAPI.generateTableId(testTable);
        console.log(`🧪 Test génération ID: ${testId ? '✅' : '❌'}`);
      }
    } catch (error) {
      console.warn("⚠️ Test de fonctionnalité échoué:", error.message);
    }

    return true;
  }

  completeInitialization() {
    this.metrics.totalInitTime = Date.now() - this.startTime;
    this.state.isInitializing = false;

    // Mettre à jour l'état global
    window.CLARAVERSE_STATE.initialized = true;
    window.CLARAVERSE_STATE.activeScripts = Object.keys(this.state.scriptsReady)
      .filter(script => this.state.scriptsReady[script]);

    // Dispatcher événement de fin d'initialisation
    document.dispatchEvent(new CustomEvent('claraverse:initialization-complete', {
      detail: {
        metrics: this.metrics,
        activeScripts: window.CLARAVERSE_STATE.activeScripts,
        performanceScore: this.metrics.performanceScore
      }
    }));

    // Rapport final
    this.generateInitReport();

    // Démarrer surveillance post-initialisation
    this.startPostInitMonitoring();
  }

  generateInitReport() {
    const { totalInitTime, scriptsLoaded, performanceScore } = this.metrics;

    console.log("\n" + "=".repeat(50));
    console.log("🎯 CLARAVERSE INITIALISATION TERMINÉE");
    console.log("=".repeat(50));
    console.log(`⏱️  Temps total: ${totalInitTime}ms`);
    console.log(`📦 Scripts chargés: ${scriptsLoaded}/${this.initSteps.size}`);
    console.log(`⚡ Performance: ${performanceScore}`);
    console.log(`🔧 Scripts actifs: ${window.CLARAVERSE_STATE.activeScripts.join(', ')}`);

    if (window.performanceOptimizer) {
      const stats = window.performanceOptimizer.getStats();
      console.log(`📊 Intervals: ${stats.intervals} | Observers: ${stats.observers}`);
    }

    console.log("=".repeat(50) + "\n");

    // Recommandations
    if (performanceScore === 'warning') {
      console.warn("⚠️ RECOMMANDATION: Surveillance performance recommandée");
    }

    if (totalInitTime > 10000) {
      console.warn("⚠️ RECOMMANDATION: Initialisation lente - vérifier connexion/cache");
    }
  }

  startPostInitMonitoring() {
    if (!window.performanceOptimizer) return;

    // Surveillance légère post-initialisation
    window.performanceOptimizer.registerInterval(
      'post_init_monitoring',
      () => {
        const stats = window.performanceOptimizer.getStats();

        // Log seulement si problème détecté
        if (stats.performance.cpuUsage !== 'normal') {
          console.log(`📊 Surveillance post-init: Performance ${stats.performance.cpuUsage}`);
        }
      },
      300000, // 5 minutes
      { critical: false, runWhenHidden: false }
    );
  }

  handleCriticalError(error) {
    this.state.criticalError = true;
    this.metrics.errorsEncountered++;

    console.error("\n" + "❌".repeat(20));
    console.error("🚨 ERREUR CRITIQUE D'INITIALISATION");
    console.error("❌".repeat(20));
    console.error(`📍 Étape: ${this.state.currentStep}/${this.initSteps.size}`);
    console.error(`⚠️  Erreur: ${error.message}`);
    console.error(`⏱️  Temps écoulé: ${Date.now() - this.startTime}ms`);
    console.error("❌".repeat(20) + "\n");

    // Tentative de récupération minimale
    this.attemptMinimalRecovery();
  }

  attemptMinimalRecovery() {
    console.log("🔄 Tentative de récupération minimale...");

    try {
      // S'assurer que l'état global existe
      if (!window.CLARAVERSE_STATE) {
        window.CLARAVERSE_STATE = {
          initialized: false,
          error: true,
          storageStatus: { status: 'ERROR' }
        };
      }

      // Dispatcher événement d'erreur
      document.dispatchEvent(new CustomEvent('claraverse:initialization-error', {
        detail: {
          error: this.state.criticalError,
          metrics: this.metrics,
          recovery: 'minimal'
        }
      }));

      console.log("🩹 Récupération minimale appliquée");
    } catch (recoveryError) {
      console.error("❌ Récupération impossible:", recoveryError);
    }
  }

  // API publique pour diagnostics
  getStatus() {
    return {
      state: this.state,
      metrics: this.metrics,
      config: this.config,
      uptime: Date.now() - this.startTime
    };
  }
}

// Auto-démarrage quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.claraverseInitOptimizer = new ClaraVerseInitOptimizer();
  });
} else {
  window.claraverseInitOptimizer = new ClaraVerseInitOptimizer();
}

// Nettoyage automatique
window.addEventListener('beforeunload', () => {
  if (window.claraverseInitOptimizer) {
    console.log("🧹 Nettoyage Init Optimizer...");
  }
});

console.log("🎯 Init Optimizer chargé - démarrage automatique activé");
