/**
 * Gestionnaire centralisé d'optimisation des performances
 * Coordonne et optimise tous les intervals, observers et tâches périodiques
 * pour éviter la surcharge CPU et les blocages d'application
 */

class PerformanceOptimizer {
  constructor() {
    this.intervals = new Map();
    this.observers = new Map();
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.performanceMetrics = {
      intervalExecutions: 0,
      observerTriggers: 0,
      lastOptimization: Date.now(),
      cpuUsage: 'normal'
    };

    this.config = {
      MAX_CONCURRENT_INTERVALS: 5,
      MIN_INTERVAL_DELAY: 30000, // 30 secondes minimum
      OBSERVER_THROTTLE: 3000,   // 3 secondes
      DEBOUNCE_DELAY: 1000,      // 1 seconde
      PERFORMANCE_CHECK_INTERVAL: 60000, // 1 minute
      EMERGENCY_CLEANUP_THRESHOLD: 100   // seuil critique
    };

    this.isPageVisible = !document.hidden;
    this.setupVisibilityHandling();
    this.startPerformanceMonitoring();

    console.log("🚀 Performance Optimizer initialisé");
  }

  /**
   * Gestion centralisée des intervals avec optimisation automatique
   */
  registerInterval(name, callback, delay, options = {}) {
    // Vérifier si interval existe déjà
    if (this.intervals.has(name)) {
      console.warn(`⚠️ Interval '${name}' existe déjà - remplacement`);
      this.clearInterval(name);
    }

    // Appliquer délai minimum
    const optimizedDelay = Math.max(delay, this.config.MIN_INTERVAL_DELAY);

    // Wrapper avec gestion d'erreurs et métriques
    const wrappedCallback = async () => {
      if (!this.isPageVisible && !options.runWhenHidden) {
        return; // Pause si page masquée
      }

      this.performanceMetrics.intervalExecutions++;

      try {
        await callback();
      } catch (error) {
        console.error(`❌ Erreur interval '${name}':`, error);
      }
    };

    const intervalId = setInterval(wrappedCallback, optimizedDelay);

    this.intervals.set(name, {
      id: intervalId,
      callback: wrappedCallback,
      delay: optimizedDelay,
      lastExecution: Date.now(),
      options
    });

    console.log(`⏰ Interval '${name}' enregistré (${optimizedDelay}ms)`);
    return intervalId;
  }

  clearInterval(name) {
    const intervalData = this.intervals.get(name);
    if (intervalData) {
      clearInterval(intervalData.id);
      this.intervals.delete(name);
      console.log(`🗑️ Interval '${name}' supprimé`);
    }
  }

  /**
   * Système de debouncing centralisé
   */
  debounce(name, callback, delay = this.config.DEBOUNCE_DELAY) {
    // Annuler timer précédent si existant
    if (this.debounceTimers.has(name)) {
      clearTimeout(this.debounceTimers.get(name));
    }

    const timer = setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.error(`❌ Erreur debounce '${name}':`, error);
      } finally {
        this.debounceTimers.delete(name);
      }
    }, delay);

    this.debounceTimers.set(name, timer);
  }

  /**
   * Système de throttling centralisé
   */
  throttle(name, callback, delay = this.config.OBSERVER_THROTTLE) {
    const now = Date.now();
    const throttleData = this.throttleTimers.get(name);

    if (throttleData && (now - throttleData.lastCall) < delay) {
      return false; // Throttlé
    }

    this.throttleTimers.set(name, {
      lastCall: now,
      callback
    });

    try {
      callback();
      return true;
    } catch (error) {
      console.error(`❌ Erreur throttle '${name}':`, error);
      return false;
    }
  }

  /**
   * Gestionnaire optimisé des MutationObservers
   */
  registerObserver(name, target, callback, options = {}) {
    if (this.observers.has(name)) {
      console.warn(`⚠️ Observer '${name}' existe déjà - remplacement`);
      this.clearObserver(name);
    }

    // Wrapper avec throttling automatique
    const wrappedCallback = (mutations) => {
      this.performanceMetrics.observerTriggers++;

      const success = this.throttle(`observer_${name}`, () => {
        callback(mutations);
      });

      if (!success && options.logThrottled) {
        console.log(`🔄 Observer '${name}' throttlé`);
      }
    };

    const observer = new MutationObserver(wrappedCallback);

    const defaultOptions = {
      childList: true,
      subtree: true,
      attributes: false,
      attributeOldValue: false,
      characterData: false,
      characterDataOldValue: false
    };

    const observerOptions = { ...defaultOptions, ...options.mutationOptions };
    observer.observe(target, observerOptions);

    this.observers.set(name, {
      observer,
      target,
      callback: wrappedCallback,
      options
    });

    console.log(`👁️ Observer '${name}' enregistré`);
    return observer;
  }

  clearObserver(name) {
    const observerData = this.observers.get(name);
    if (observerData) {
      observerData.observer.disconnect();
      this.observers.delete(name);
      console.log(`🗑️ Observer '${name}' supprimé`);
    }
  }

  /**
   * Gestion de la visibilité de la page
   */
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      const wasVisible = this.isPageVisible;
      this.isPageVisible = !document.hidden;

      if (wasVisible !== this.isPageVisible) {
        if (this.isPageVisible) {
          console.log("👁️ Page redevenue visible - reprise des tâches");
          this.resumeOptimizedTasks();
        } else {
          console.log("😴 Page masquée - pause des tâches non critiques");
          this.pauseNonCriticalTasks();
        }
      }
    });
  }

  pauseNonCriticalTasks() {
    // Les intervals avec runWhenHidden=false sont automatiquement pausés
    // Pause des observers non critiques
    this.observers.forEach((observerData, name) => {
      if (!observerData.options.critical) {
        observerData.observer.disconnect();
        console.log(`⏸️ Observer '${name}' mis en pause`);
      }
    });
  }

  resumeOptimizedTasks() {
    // Redémarrage des observers pausés
    this.observers.forEach((observerData, name) => {
      if (!observerData.options.critical) {
        const { target, options } = observerData;
        const observerOptions = {
          childList: true,
          subtree: true,
          ...options.mutationOptions
        };
        observerData.observer.observe(target, observerOptions);
        console.log(`▶️ Observer '${name}' repris`);
      }
    });
  }

  /**
   * Surveillance des performances et optimisation automatique
   */
  startPerformanceMonitoring() {
    this.registerInterval('performance_monitor', () => {
      this.checkPerformanceHealth();
      this.optimizeIfNeeded();
    }, this.config.PERFORMANCE_CHECK_INTERVAL, { runWhenHidden: true });
  }

  checkPerformanceHealth() {
    const now = Date.now();
    const timeSinceLastOpt = now - this.performanceMetrics.lastOptimization;

    // Vérifier charge des intervals
    const intervalLoad = this.intervals.size;
    const observerLoad = this.observers.size;
    const executionRate = this.performanceMetrics.intervalExecutions;
    const triggerRate = this.performanceMetrics.observerTriggers;

    // Déterminer l'état de performance
    let cpuUsage = 'normal';
    if (intervalLoad > 10 || observerLoad > 8 || executionRate > 200 || triggerRate > 500) {
      cpuUsage = 'high';
    } else if (intervalLoad > 15 || observerLoad > 12 || executionRate > 300 || triggerRate > 800) {
      cpuUsage = 'critical';
    }

    this.performanceMetrics.cpuUsage = cpuUsage;

    console.log(`📊 Performance: ${cpuUsage} | Intervals: ${intervalLoad} | Observers: ${observerLoad} | Exec: ${executionRate} | Triggers: ${triggerRate}`);

    // Reset compteurs
    this.performanceMetrics.intervalExecutions = 0;
    this.performanceMetrics.observerTriggers = 0;
  }

  optimizeIfNeeded() {
    const { cpuUsage } = this.performanceMetrics;

    if (cpuUsage === 'critical') {
      console.warn("🚨 Performance critique - optimisation d'urgence");
      this.emergencyOptimization();
    } else if (cpuUsage === 'high') {
      console.warn("⚠️ Performance dégradée - optimisation préventive");
      this.preventiveOptimization();
    }

    this.performanceMetrics.lastOptimization = Date.now();
  }

  emergencyOptimization() {
    // Doubler les délais des intervals non critiques
    this.intervals.forEach((intervalData, name) => {
      if (!intervalData.options.critical) {
        const newDelay = intervalData.delay * 2;
        console.log(`🚨 Urgence: doublement délai '${name}': ${intervalData.delay}ms → ${newDelay}ms`);

        this.clearInterval(name);
        this.registerInterval(name, intervalData.callback, newDelay, intervalData.options);
      }
    });

    // Pause des observers moins importants
    this.observers.forEach((observerData, name) => {
      if (!observerData.options.critical && !observerData.options.important) {
        observerData.observer.disconnect();
        console.log(`🚨 Urgence: pause observer '${name}'`);
      }
    });
  }

  preventiveOptimization() {
    // Augmenter légèrement les délais
    this.intervals.forEach((intervalData, name) => {
      if (!intervalData.options.critical && intervalData.delay < 120000) {
        const newDelay = Math.min(intervalData.delay * 1.5, 120000);
        console.log(`⚠️ Préventif: ajustement '${name}': ${intervalData.delay}ms → ${newDelay}ms`);

        this.clearInterval(name);
        this.registerInterval(name, intervalData.callback, newDelay, intervalData.options);
      }
    });
  }

  /**
   * Nettoyage et destruction
   */
  cleanup() {
    console.log("🧹 Nettoyage Performance Optimizer...");

    // Arrêter tous les intervals
    this.intervals.forEach((_, name) => {
      this.clearInterval(name);
    });

    // Arrêter tous les observers
    this.observers.forEach((_, name) => {
      this.clearObserver(name);
    });

    // Nettoyer les timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    this.throttleTimers.clear();

    console.log("✅ Performance Optimizer nettoyé");
  }

  /**
   * API publique pour les autres scripts
   */
  getStats() {
    return {
      intervals: this.intervals.size,
      observers: this.observers.size,
      debounceTimers: this.debounceTimers.size,
      throttleTimers: this.throttleTimers.size,
      performance: this.performanceMetrics,
      isVisible: this.isPageVisible
    };
  }

  // Méthodes utilitaires pour compatibilité
  createThrottledFunction(callback, delay = 1000) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return callback.apply(this, args);
      }
    };
  }

  createDebouncedFunction(callback, delay = 1000) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback.apply(this, args), delay);
    };
  }
}

// Instance globale
window.performanceOptimizer = new PerformanceOptimizer();

// Event pour signaler que l'optimizer est prêt
document.dispatchEvent(new CustomEvent('claraverse:performance-optimizer-ready', {
  detail: { optimizer: window.performanceOptimizer }
}));

// Nettoyage automatique avant déchargement
window.addEventListener('beforeunload', () => {
  if (window.performanceOptimizer) {
    window.performanceOptimizer.cleanup();
  }
});

console.log("🎯 Performance Optimizer prêt - API disponible via window.performanceOptimizer");
