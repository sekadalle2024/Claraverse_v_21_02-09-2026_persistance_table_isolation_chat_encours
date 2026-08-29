/**
 * ClaraVerse Performance Diagnostics v1.0
 * Script de diagnostic avancé des performances
 * Détecte les problèmes de surcharge CPU, mémoire et DOM
 */

class PerformanceDiagnostics {
  constructor() {
    this.startTime = Date.now();
    this.diagnosticData = {
      intervals: new Map(),
      observers: new Map(),
      memoryUsage: [],
      cpuMetrics: [],
      domOperations: [],
      storageOperations: [],
      errors: [],
      warnings: []
    };

    this.thresholds = {
      HIGH_CPU_THRESHOLD: 80,     // % CPU usage
      HIGH_MEMORY_THRESHOLD: 100, // MB memory usage
      MAX_INTERVALS: 8,           // Maximum intervals recommandés
      MAX_OBSERVERS: 6,           // Maximum observers recommandés
      MAX_DOM_OPERATIONS: 50,     // Operations DOM par seconde
      SLOW_OPERATION_THRESHOLD: 100 // ms pour opération lente
    };

    this.config = {
      MONITORING_INTERVAL: 5000,  // 5 secondes
      SAMPLE_HISTORY: 12,         // Garder 12 échantillons (1 minute)
      DETAILED_LOGGING: true,
      AUTO_REPORT_THRESHOLD: 'warning' // 'critical', 'warning', 'info'
    };

    this.isMonitoring = false;
    this.monitoringInterval = null;

    console.log("🔍 Performance Diagnostics initialisé");
  }

  /**
   * Démarrer le monitoring des performances
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn("⚠️ Monitoring déjà actif");
      return;
    }

    this.isMonitoring = true;
    console.log("📊 Démarrage du monitoring des performances...");

    // Monitoring principal
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceData();
      this.analyzePerformance();
    }, this.config.MONITORING_INTERVAL);

    // Surveillance des erreurs
    this.setupErrorTracking();

    // Surveillance DOM
    this.setupDOMTracking();

    // Surveillance stockage
    this.setupStorageTracking();

    console.log("✅ Monitoring des performances actif");
  }

  /**
   * Arrêter le monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.log("🛑 Monitoring des performances arrêté");
  }

  /**
   * Collecter les données de performance
   */
  collectPerformanceData() {
    const timestamp = Date.now();

    // Collecter métriques mémoire
    this.collectMemoryMetrics(timestamp);

    // Collecter métriques CPU (approximatif)
    this.collectCPUMetrics(timestamp);

    // Détecter intervals actifs
    this.detectActiveIntervals();

    // Détecter observers actifs
    this.detectActiveObservers();

    // Nettoyer l'historique (garder seulement les N derniers échantillons)
    this.cleanupHistory();
  }

  collectMemoryMetrics(timestamp) {
    if (performance.memory) {
      const memInfo = {
        timestamp,
        used: performance.memory.usedJSHeapSize / (1024 * 1024), // MB
        total: performance.memory.totalJSHeapSize / (1024 * 1024), // MB
        limit: performance.memory.jsHeapSizeLimit / (1024 * 1024) // MB
      };

      this.diagnosticData.memoryUsage.push(memInfo);

      // Alerter si mémoire élevée
      if (memInfo.used > this.thresholds.HIGH_MEMORY_THRESHOLD) {
        this.addWarning('high_memory', `Utilisation mémoire élevée: ${memInfo.used.toFixed(2)}MB`);
      }
    }
  }

  collectCPUMetrics(timestamp) {
    // Mesure approximative de l'activité CPU via performance.now() precision
    const start = performance.now();

    // Opération de référence
    for (let i = 0; i < 1000; i++) {
      Math.random();
    }

    const duration = performance.now() - start;

    const cpuMetric = {
      timestamp,
      benchmarkDuration: duration,
      // Approximation: plus c'est lent, plus le CPU est chargé
      approximateCPULoad: Math.min((duration / 2) * 100, 100)
    };

    this.diagnosticData.cpuMetrics.push(cpuMetric);

    if (cpuMetric.approximateCPULoad > this.thresholds.HIGH_CPU_THRESHOLD) {
      this.addWarning('high_cpu', `Charge CPU approximative élevée: ${cpuMetric.approximateCPULoad.toFixed(1)}%`);
    }
  }

  detectActiveIntervals() {
    let intervalCount = 0;
    const intervalDetails = [];

    // Détecter via Performance Optimizer si disponible
    if (window.performanceOptimizer) {
      const stats = window.performanceOptimizer.getStats();
      intervalCount = stats.intervals;

      // Récupérer les détails des intervals via l'API
      if (window.performanceOptimizer.intervals) {
        window.performanceOptimizer.intervals.forEach((intervalData, name) => {
          intervalDetails.push({
            name,
            delay: intervalData.delay,
            lastExecution: intervalData.lastExecution,
            critical: intervalData.options?.critical || false
          });
        });
      }
    } else {
      // Méthode alternative : scanner les propriétés window pour les intervals
      intervalCount = this.scanForIntervals();
    }

    this.diagnosticData.intervals.set(Date.now(), {
      count: intervalCount,
      details: intervalDetails
    });

    if (intervalCount > this.thresholds.MAX_INTERVALS) {
      this.addWarning('too_many_intervals', `Trop d'intervals actifs: ${intervalCount}`);
    }
  }

  detectActiveObservers() {
    let observerCount = 0;
    const observerDetails = [];

    if (window.performanceOptimizer) {
      const stats = window.performanceOptimizer.getStats();
      observerCount = stats.observers;

      if (window.performanceOptimizer.observers) {
        window.performanceOptimizer.observers.forEach((observerData, name) => {
          observerDetails.push({
            name,
            target: observerData.target.tagName || 'unknown',
            critical: observerData.options?.critical || false
          });
        });
      }
    } else {
      // Estimation basée sur les scripts connus
      observerCount = this.estimateObserverCount();
    }

    this.diagnosticData.observers.set(Date.now(), {
      count: observerCount,
      details: observerDetails
    });

    if (observerCount > this.thresholds.MAX_OBSERVERS) {
      this.addWarning('too_many_observers', `Trop d'observers actifs: ${observerCount}`);
    }
  }

  scanForIntervals() {
    let count = 0;

    // Vérifier les intervals connus
    const knownIntervalSources = [
      'monitoringInterval',
      'storageMonitoringInterval',
      'healthCheckInterval',
      'syncInterval',
      'cleanupInterval'
    ];

    knownIntervalSources.forEach(source => {
      if (window[source]) count++;
    });

    return count;
  }

  estimateObserverCount() {
    let count = 0;

    // Estimer basé sur les scripts chargés
    if (window.contextualMenuManager) count++;
    if (window.claraverseSyncAPI) count++;
    if (document.querySelector('[data-observer]')) count++;

    return count;
  }

  setupErrorTracking() {
    // Capturer les erreurs JavaScript
    window.addEventListener('error', (event) => {
      this.diagnosticData.errors.push({
        timestamp: Date.now(),
        type: 'javascript',
        message: event.error?.message || event.message,
        filename: event.filename,
        lineno: event.lineno,
        stack: event.error?.stack
      });
    });

    // Capturer les promesses rejetées
    window.addEventListener('unhandledrejection', (event) => {
      this.diagnosticData.errors.push({
        timestamp: Date.now(),
        type: 'promise_rejection',
        message: event.reason?.message || String(event.reason)
      });
    });
  }

  setupDOMTracking() {
    let domOperationCount = 0;
    let lastReset = Date.now();

    // Tracker les opérations DOM fréquentes
    const originalQuerySelector = document.querySelector;
    const originalQuerySelectorAll = document.querySelectorAll;

    document.querySelector = function(...args) {
      domOperationCount++;
      return originalQuerySelector.apply(this, args);
    };

    document.querySelectorAll = function(...args) {
      domOperationCount++;
      return originalQuerySelectorAll.apply(this, args);
    };

    // Reset compteur toutes les secondes
    setInterval(() => {
      const now = Date.now();
      const opsPerSecond = domOperationCount / ((now - lastReset) / 1000);

      if (opsPerSecond > this.thresholds.MAX_DOM_OPERATIONS) {
        this.addWarning('high_dom_operations', `Opérations DOM élevées: ${opsPerSecond.toFixed(1)}/sec`);
      }

      this.diagnosticData.domOperations.push({
        timestamp: now,
        operationsPerSecond: opsPerSecond
      });

      domOperationCount = 0;
      lastReset = now;
    }, 1000);
  }

  setupStorageTracking() {
    let storageOperationCount = 0;

    // Tracker les opérations localStorage
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;

    localStorage.setItem = function(key, value) {
      const start = performance.now();
      const result = originalSetItem.call(this, key, value);
      const duration = performance.now() - start;

      storageOperationCount++;

      if (duration > this.thresholds?.SLOW_OPERATION_THRESHOLD || 50) {
        window.performanceDiagnostics?.addWarning('slow_storage',
          `Opération localStorage lente: ${duration.toFixed(2)}ms pour clé ${key}`);
      }

      return result;
    };

    localStorage.getItem = function(key) {
      const start = performance.now();
      const result = originalGetItem.call(this, key);
      const duration = performance.now() - start;

      storageOperationCount++;

      if (duration > this.thresholds?.SLOW_OPERATION_THRESHOLD || 50) {
        window.performanceDiagnostics?.addWarning('slow_storage_read',
          `Lecture localStorage lente: ${duration.toFixed(2)}ms pour clé ${key}`);
      }

      return result;
    };

    // Reset compteur périodiquement
    setInterval(() => {
      this.diagnosticData.storageOperations.push({
        timestamp: Date.now(),
        operationCount: storageOperationCount
      });
      storageOperationCount = 0;
    }, 5000);
  }

  analyzePerformance() {
    const analysis = {
      timestamp: Date.now(),
      overallStatus: 'good',
      issues: [],
      recommendations: []
    };

    // Analyser la mémoire
    if (this.diagnosticData.memoryUsage.length > 0) {
      const latestMemory = this.diagnosticData.memoryUsage[this.diagnosticData.memoryUsage.length - 1];
      const memoryTrend = this.calculateTrend(this.diagnosticData.memoryUsage, 'used');

      if (latestMemory.used > this.thresholds.HIGH_MEMORY_THRESHOLD) {
        analysis.issues.push(`Mémoire élevée: ${latestMemory.used.toFixed(2)}MB`);
        analysis.overallStatus = 'warning';
      }

      if (memoryTrend > 5) { // Augmentation de plus de 5MB/échantillon
        analysis.issues.push(`Fuite mémoire potentielle: +${memoryTrend.toFixed(2)}MB/min`);
        analysis.overallStatus = 'critical';
        analysis.recommendations.push("Redémarrer les scripts ou recharger la page");
      }
    }

    // Analyser les intervals
    const latestIntervals = Array.from(this.diagnosticData.intervals.values()).pop();
    if (latestIntervals && latestIntervals.count > this.thresholds.MAX_INTERVALS) {
      analysis.issues.push(`Trop d'intervals: ${latestIntervals.count}`);
      analysis.overallStatus = analysis.overallStatus === 'critical' ? 'critical' : 'warning';
      analysis.recommendations.push("Optimiser ou fusionner les intervals");
    }

    // Générer rapport si nécessaire
    if (analysis.overallStatus !== 'good' && this.shouldGenerateReport(analysis.overallStatus)) {
      this.generatePerformanceReport(analysis);
    }
  }

  calculateTrend(dataArray, property) {
    if (dataArray.length < 2) return 0;

    const recent = dataArray.slice(-3); // Derniers 3 échantillons
    if (recent.length < 2) return 0;

    const first = recent[0][property];
    const last = recent[recent.length - 1][property];

    return (last - first) / recent.length; // Tendance moyenne
  }

  shouldGenerateReport(status) {
    const levelOrder = ['info', 'warning', 'critical'];
    const currentLevel = levelOrder.indexOf(status);
    const thresholdLevel = levelOrder.indexOf(this.config.AUTO_REPORT_THRESHOLD);

    return currentLevel >= thresholdLevel;
  }

  addWarning(type, message) {
    this.diagnosticData.warnings.push({
      timestamp: Date.now(),
      type,
      message
    });

    if (this.config.DETAILED_LOGGING) {
      console.warn(`🚨 Performance Warning [${type}]: ${message}`);
    }
  }

  generatePerformanceReport(analysis) {
    const uptime = Date.now() - this.startTime;
    const report = {
      timestamp: Date.now(),
      uptime: uptime,
      status: analysis.overallStatus,
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      metrics: this.getMetricsSummary()
    };

    console.log("\n" + "🔍".repeat(20));
    console.log("📊 RAPPORT DE PERFORMANCE CLARAVERSE");
    console.log("🔍".repeat(20));
    console.log(`⏱️  Uptime: ${(uptime / 1000 / 60).toFixed(1)} minutes`);
    console.log(`🚨 Statut: ${analysis.overallStatus.toUpperCase()}`);

    if (analysis.issues.length > 0) {
      console.log(`❌ Problèmes détectés:`);
      analysis.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    }

    if (analysis.recommendations.length > 0) {
      console.log(`💡 Recommandations:`);
      analysis.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    // Métriques détaillées
    const metrics = report.metrics;
    console.log(`📈 Métriques:`);
    console.log(`   - Mémoire: ${metrics.currentMemory}MB (max: ${metrics.maxMemory}MB)`);
    console.log(`   - Intervals: ${metrics.intervals}`);
    console.log(`   - Observers: ${metrics.observers}`);
    console.log(`   - Erreurs: ${metrics.errors}`);
    console.log(`   - Avertissements: ${metrics.warnings}`);

    console.log("🔍".repeat(20) + "\n");

    // Sauvegarder le rapport
    this.saveReport(report);
  }

  getMetricsSummary() {
    const latestMemory = this.diagnosticData.memoryUsage[this.diagnosticData.memoryUsage.length - 1];
    const latestIntervals = Array.from(this.diagnosticData.intervals.values()).pop();
    const latestObservers = Array.from(this.diagnosticData.observers.values()).pop();

    return {
      currentMemory: latestMemory?.used.toFixed(2) || 'N/A',
      maxMemory: Math.max(...this.diagnosticData.memoryUsage.map(m => m.used)).toFixed(2),
      intervals: latestIntervals?.count || 0,
      observers: latestObservers?.count || 0,
      errors: this.diagnosticData.errors.length,
      warnings: this.diagnosticData.warnings.length
    };
  }

  saveReport(report) {
    try {
      const reports = JSON.parse(localStorage.getItem('claraverse_performance_reports') || '[]');
      reports.push(report);

      // Garder seulement les 10 derniers rapports
      if (reports.length > 10) {
        reports.splice(0, reports.length - 10);
      }

      localStorage.setItem('claraverse_performance_reports', JSON.stringify(reports));
    } catch (error) {
      console.warn("⚠️ Impossible de sauvegarder le rapport:", error);
    }
  }

  cleanupHistory() {
    const maxSamples = this.config.SAMPLE_HISTORY;

    if (this.diagnosticData.memoryUsage.length > maxSamples) {
      this.diagnosticData.memoryUsage.splice(0, this.diagnosticData.memoryUsage.length - maxSamples);
    }

    if (this.diagnosticData.cpuMetrics.length > maxSamples) {
      this.diagnosticData.cpuMetrics.splice(0, this.diagnosticData.cpuMetrics.length - maxSamples);
    }
  }

  /**
   * API publique pour obtenir le statut actuel
   */
  getCurrentStatus() {
    return {
      isMonitoring: this.isMonitoring,
      uptime: Date.now() - this.startTime,
      metrics: this.getMetricsSummary(),
      recentWarnings: this.diagnosticData.warnings.slice(-5),
      recentErrors: this.diagnosticData.errors.slice(-5)
    };
  }

  /**
   * Forcer la génération d'un rapport
   */
  forceReport() {
    console.log("🔍 Génération forcée du rapport de performance...");

    const analysis = {
      timestamp: Date.now(),
      overallStatus: 'info',
      issues: ['Rapport généré manuellement'],
      recommendations: ['Aucune action requise']
    };

    this.generatePerformanceReport(analysis);
  }

  /**
   * Diagnostic rapide
   */
  quickDiagnostic() {
    console.log("⚡ Diagnostic rapide des performances...");

    const issues = [];
    const recommendations = [];

    // Vérifications rapides
    if (window.performanceOptimizer) {
      const stats = window.performanceOptimizer.getStats();

      if (stats.intervals > this.thresholds.MAX_INTERVALS) {
        issues.push(`${stats.intervals} intervals actifs (recommandé: < ${this.thresholds.MAX_INTERVALS})`);
        recommendations.push("Réduire le nombre d'intervals ou augmenter leurs délais");
      }

      if (stats.observers > this.thresholds.MAX_OBSERVERS) {
        issues.push(`${stats.observers} observers actifs (recommandé: < ${this.thresholds.MAX_OBSERVERS})`);
        recommendations.push("Optimiser ou fusionner les observers DOM");
      }

      if (stats.performance.cpuUsage !== 'normal') {
        issues.push(`Performance CPU: ${stats.performance.cpuUsage}`);
        recommendations.push("Réduire la fréquence des opérations ou optimiser le code");
      }
    }

    // Vérification mémoire
    if (performance.memory) {
      const usedMB = performance.memory.usedJSHeapSize / (1024 * 1024);
      if (usedMB > this.thresholds.HIGH_MEMORY_THRESHOLD) {
        issues.push(`Mémoire élevée: ${usedMB.toFixed(2)}MB`);
        recommendations.push("Nettoyer le cache ou recharger la page");
      }
    }

    // Résultats
    console.log(`📊 Diagnostic terminé - ${issues.length} problème(s) détecté(s)`);

    if (issues.length === 0) {
      console.log("✅ Aucun problème de performance détecté");
    } else {
      console.log("❌ Problèmes:");
      issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));

      console.log("💡 Recommandations:");
      recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
    }

    return { issues, recommendations };
  }

  /**
   * Nettoyage avant destruction
   */
  cleanup() {
    this.stopMonitoring();

    // Restaurer les méthodes originales si possible
    if (this.originalQuerySelector) {
      document.querySelector = this.originalQuerySelector;
    }

    if (this.originalQuerySelectorAll) {
      document.querySelectorAll = this.originalQuerySelectorAll;
    }

    console.log("🧹 Performance Diagnostics nettoyé");
  }
}

// Instance globale
window.performanceDiagnostics = new PerformanceDiagnostics();

// Auto-start après initialisation de ClaraVerse
document.addEventListener('claraverse:initialization-complete', () => {
  setTimeout(() => {
    if (window.performanceDiagnostics) {
      window.performanceDiagnostics.startMonitoring();
      console.log("🔍 Monitoring automatique des performances activé");
    }
  }, 2000);
});

// Commandes console pratiques
window.perfDiag = {
  start: () => window.performanceDiagnostics?.startMonitoring(),
  stop: () => window.performanceDiagnostics?.stopMonitoring(),
  status: () => window.performanceDiagnostics?.getCurrentStatus(),
  report: () => window.performanceDiagnostics?.forceReport(),
  quick: () => window.performanceDiagnostics?.quickDiagnostic()
};

// Nettoyage automatique
window.addEventListener('beforeunload', () => {
  if (window.performanceDiagnostics) {
    window.performanceDiagnostics.cleanup();
  }
});

console.log("🔍 Performance Diagnostics chargé - utilisez window.perfDiag pour les commandes rapides");
