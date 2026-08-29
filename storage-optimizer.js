/**
 * ========================================
 * CLARAVERSE STORAGE OPTIMIZER v3.1
 * ========================================
 *
 * Système de gestion optimisée du stockage localStorage
 * pour résoudre les problèmes d'espace insuffisant
 *
 * Features:
 * - Nettoyage automatique des données obsolètes
 * - Compression des données volumineuses
 * - Rotation intelligente des sauvegardes
 * - Diagnostic détaillé de l'utilisation
 * - Purge sélective par priorité
 *
 * Usage:
 * await window.StorageOptimizer.optimizeNow();
 * await window.StorageOptimizer.emergencyCleanup();
 */

(function () {
  "use strict";

  /**
   * ========================================
   * CONFIGURATION DE L'OPTIMISEUR
   * ========================================
   */
  const OPTIMIZER_CONFIG = {
    VERSION: "3.1.0",

    // Limites de stockage (en MB)
    STORAGE_LIMITS: {
      WARNING_THRESHOLD: 8, // Avertissement à 8MB
      CRITICAL_THRESHOLD: 9.5, // Critique à 9.5MB (limite ~10MB)
      TARGET_AFTER_CLEANUP: 5, // Objectif après nettoyage: 5MB
    },

    // Durées de rétention (en jours)
    RETENTION_PERIODS: {
      CELL_DATA: 30, // Données de cellules: 30 jours
      HTML_BACKUPS: 7, // Sauvegardes HTML: 7 jours
      STRUCTURE_DATA: 14, // Structures de tables: 14 jours
      METADATA: 60, // Métadonnées: 60 jours
      CORRUPTED_BACKUPS: 3, // Sauvegardes corrompues: 3 jours
      TEMP_DATA: 1, // Données temporaires: 1 jour
    },

    // Priorités de purge (plus bas = supprimé en premier)
    PURGE_PRIORITIES: {
      corrupted_backup: 1, // Sauvegardes corrompues
      temp: 2, // Données temporaires
      html: 3, // Sauvegardes HTML
      meta: 4, // Métadonnées
      struct: 5, // Structures
      dev: 6, // Données principales
    },

    // Patterns de détection
    PATTERNS: {
      CLARAVERSE_KEY: /^claraverse_/,
      TEMP_KEY: /temp_|_temp|temporary/i,
      BACKUP_KEY: /backup_|_backup/i,
      CORRUPTED_KEY: /corrupted_|_corrupted/i,
      HTML_KEY: /html_|_html/i,
      STRUCT_KEY: /struct_|_struct/i,
      META_KEY: /meta_|_meta/i,
    },
  };

  /**
   * ========================================
   * CLASSE PRINCIPALE D'OPTIMISATION
   * ========================================
   */
  class StorageOptimizer {
    constructor() {
      this.stats = {
        totalSize: 0,
        claraverseSize: 0,
        otherSize: 0,
        keyCount: 0,
        claraverseKeyCount: 0,
        lastOptimization: null,
      };

      this.analysisResults = null;
      this.compressionEnabled = this.checkCompressionSupport();
    }

    /**
     * ========================================
     * API PRINCIPALE
     * ========================================
     */

    // Optimisation complète automatique
    async optimizeNow() {
      console.log("🚀 ClaraVerse Storage Optimizer v3.1 - Démarrage");
      console.log("=".repeat(50));

      try {
        // 1. Analyse de l'état actuel
        await this.analyzeStorage();
        this.displayStorageStatus();

        // 2. Déterminer la stratégie
        const strategy = this.determineOptimizationStrategy();
        console.log(`📋 Stratégie: ${strategy.name}`);

        // 3. Exécuter l'optimisation
        const results = await this.executeOptimization(strategy);

        // 4. Vérification post-optimisation
        await this.analyzeStorage();

        console.log("\n✅ OPTIMISATION TERMINÉE");
        console.log(`💾 Espace libéré: ${results.freedSpace.toFixed(2)} MB`);
        console.log(`🗑️ Éléments supprimés: ${results.itemsRemoved}`);
        console.log(
          `📊 Taille finale: ${this.formatBytes(this.stats.totalSize)}`,
        );

        return {
          success: true,
          freedSpace: results.freedSpace,
          itemsRemoved: results.itemsRemoved,
          finalSize: this.stats.totalSize,
          strategy: strategy.name,
        };
      } catch (error) {
        console.error("❌ Erreur optimisation:", error);
        return {
          success: false,
          error: error.message,
        };
      }
    }

    // Nettoyage d'urgence (supprime le plus possible)
    async emergencyCleanup() {
      console.log("🚨 NETTOYAGE D'URGENCE - ESPACE CRITIQUE");

      const initialSize = await this.calculateTotalSize();
      let freedSpace = 0;
      let itemsRemoved = 0;

      try {
        // 1. Supprimer toutes les données temporaires et corrompues
        const tempResults = await this.purgeByPattern(
          OPTIMIZER_CONFIG.PATTERNS.TEMP_KEY,
        );
        const corruptedResults = await this.purgeByPattern(
          OPTIMIZER_CONFIG.PATTERNS.CORRUPTED_KEY,
        );

        freedSpace += tempResults.freedSpace + corruptedResults.freedSpace;
        itemsRemoved +=
          tempResults.itemsRemoved + corruptedResults.itemsRemoved;

        // 2. Supprimer toutes les sauvegardes HTML anciennes
        const htmlResults = await this.purgeOldData("html", 1); // Garder seulement 1 jour
        freedSpace += htmlResults.freedSpace;
        itemsRemoved += htmlResults.itemsRemoved;

        // 3. Supprimer les métadonnées orphelines
        const metaResults = await this.purgeOrphanedMetadata();
        freedSpace += metaResults.freedSpace;
        itemsRemoved += metaResults.itemsRemoved;

        // 4. Compresser les données restantes si possible
        if (this.compressionEnabled) {
          const compressionResults = await this.compressLargeEntries();
          freedSpace += compressionResults.freedSpace;
        }

        // 5. Si encore insuffisant, supprimer les données les plus anciennes
        const currentSize = await this.calculateTotalSize();
        if (
          currentSize >
          OPTIMIZER_CONFIG.STORAGE_LIMITS.CRITICAL_THRESHOLD * 1024 * 1024
        ) {
          const aggressiveResults = await this.aggressivePurge();
          freedSpace += aggressiveResults.freedSpace;
          itemsRemoved += aggressiveResults.itemsRemoved;
        }

        console.log(`🆘 Nettoyage d'urgence terminé`);
        console.log(`💾 Espace libéré: ${this.formatBytes(freedSpace)}`);
        console.log(`🗑️ Éléments supprimés: ${itemsRemoved}`);

        return {
          success: true,
          freedSpace: freedSpace / (1024 * 1024), // MB
          itemsRemoved,
        };
      } catch (error) {
        console.error("❌ Erreur nettoyage d'urgence:", error);
        throw error;
      }
    }

    // Nettoyage intelligent par âge et priorité
    async smartCleanup() {
      console.log("🧠 Nettoyage intelligent en cours...");

      let totalFreed = 0;
      let totalRemoved = 0;

      // Nettoyer par ordre de priorité et d'âge
      for (const [type, priority] of Object.entries(
        OPTIMIZER_CONFIG.PURGE_PRIORITIES,
      )) {
        const results = await this.purgeByTypeAndAge(type);
        totalFreed += results.freedSpace;
        totalRemoved += results.itemsRemoved;

        console.log(
          `  📁 ${type}: ${results.itemsRemoved} éléments, ${this.formatBytes(results.freedSpace)}`,
        );
      }

      return {
        freedSpace: totalFreed / (1024 * 1024),
        itemsRemoved: totalRemoved,
      };
    }

    /**
     * ========================================
     * ANALYSE ET DIAGNOSTIC
     * ========================================
     */

    async analyzeStorage() {
      const analysis = {
        totalSize: 0,
        byType: {},
        byAge: {},
        oldestEntry: null,
        newestEntry: null,
        largeEntries: [],
        duplicates: [],
        orphaned: [],
        recommendations: [],
      };

      let oldestTime = Date.now();
      let newestTime = 0;

      // Analyser chaque clé
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;

        analysis.totalSize += size;

        // Analyse par type
        const type = this.identifyKeyType(key);
        if (!analysis.byType[type]) {
          analysis.byType[type] = { count: 0, size: 0, keys: [] };
        }
        analysis.byType[type].count++;
        analysis.byType[type].size += size;
        analysis.byType[type].keys.push(key);

        // Analyse par âge (si possible)
        try {
          const data = JSON.parse(value);
          if (data.timestamp) {
            const age = Date.now() - data.timestamp;
            const ageDays = Math.floor(age / (1000 * 60 * 60 * 24));

            if (!analysis.byAge[ageDays]) {
              analysis.byAge[ageDays] = { count: 0, size: 0 };
            }
            analysis.byAge[ageDays].count++;
            analysis.byAge[ageDays].size += size;

            if (data.timestamp < oldestTime) {
              oldestTime = data.timestamp;
              analysis.oldestEntry = {
                key,
                timestamp: data.timestamp,
                age: ageDays,
              };
            }
            if (data.timestamp > newestTime) {
              newestTime = data.timestamp;
              analysis.newestEntry = { key, timestamp: data.timestamp };
            }
          }
        } catch (e) {
          // Pas de timestamp ou JSON invalide
        }

        // Identifier les grosses entrées (>100KB)
        if (size > 100 * 1024) {
          analysis.largeEntries.push({
            key,
            size,
            type,
            sizeFormatted: this.formatBytes(size),
          });
        }
      }

      // Trier les grosses entrées par taille
      analysis.largeEntries.sort((a, b) => b.size - a.size);

      // Générer recommandations
      this.generateRecommendations(analysis);

      this.analysisResults = analysis;
      this.updateStats();

      return analysis;
    }

    generateRecommendations(analysis) {
      const recommendations = [];
      const totalSizeMB = analysis.totalSize / (1024 * 1024);

      // Recommandations basées sur la taille totale
      if (totalSizeMB > OPTIMIZER_CONFIG.STORAGE_LIMITS.CRITICAL_THRESHOLD) {
        recommendations.push({
          priority: "CRITICAL",
          action: "Nettoyage d'urgence requis",
          details: `Espace utilisé: ${totalSizeMB.toFixed(2)}MB`,
          solution: "await StorageOptimizer.emergencyCleanup()",
        });
      } else if (
        totalSizeMB > OPTIMIZER_CONFIG.STORAGE_LIMITS.WARNING_THRESHOLD
      ) {
        recommendations.push({
          priority: "WARNING",
          action: "Optimisation recommandée",
          details: `Espace utilisé: ${totalSizeMB.toFixed(2)}MB`,
          solution: "await StorageOptimizer.optimizeNow()",
        });
      }

      // Recommandations basées sur les types de données
      Object.entries(analysis.byType).forEach(([type, data]) => {
        const sizeMB = data.size / (1024 * 1024);

        if (sizeMB > 2) {
          // Plus de 2MB pour un type
          recommendations.push({
            priority: "MEDIUM",
            action: `Nettoyer les données ${type}`,
            details: `${data.count} entrées, ${sizeMB.toFixed(2)}MB`,
            solution: `await StorageOptimizer.purgeByType('${type}')`,
          });
        }
      });

      // Recommandations pour les anciennes données
      if (analysis.oldestEntry && analysis.oldestEntry.age > 90) {
        recommendations.push({
          priority: "LOW",
          action: "Supprimer les très anciennes données",
          details: `Données les plus anciennes: ${analysis.oldestEntry.age} jours`,
          solution: "await StorageOptimizer.purgeOldData()",
        });
      }

      analysis.recommendations = recommendations;
    }

    displayStorageStatus() {
      if (!this.analysisResults) return;

      const analysis = this.analysisResults;
      const totalSizeMB = analysis.totalSize / (1024 * 1024);

      console.log("\n📊 ÉTAT DU STOCKAGE");
      console.log("-".repeat(30));
      console.log(`💾 Taille totale: ${totalSizeMB.toFixed(2)} MB`);
      console.log(
        `📁 Nombre de clés: ${Object.values(analysis.byType).reduce((sum, type) => sum + type.count, 0)}`,
      );

      console.log("\n📂 Par type:");
      Object.entries(analysis.byType)
        .sort(([, a], [, b]) => b.size - a.size)
        .forEach(([type, data]) => {
          const sizeMB = (data.size / (1024 * 1024)).toFixed(2);
          console.log(`  ${type}: ${data.count} entrées, ${sizeMB} MB`);
        });

      if (analysis.largeEntries.length > 0) {
        console.log("\n📦 Plus grosses entrées:");
        analysis.largeEntries.slice(0, 5).forEach((entry, idx) => {
          console.log(
            `  ${idx + 1}. ${entry.key.substring(0, 50)}... (${entry.sizeFormatted})`,
          );
        });
      }

      if (analysis.recommendations.length > 0) {
        console.log("\n💡 RECOMMANDATIONS:");
        analysis.recommendations.forEach((rec, idx) => {
          const icon =
            rec.priority === "CRITICAL"
              ? "🚨"
              : rec.priority === "WARNING"
                ? "⚠️"
                : "💡";
          console.log(`  ${icon} ${rec.action}`);
          console.log(`     ${rec.details}`);
        });
      }
    }

    /**
     * ========================================
     * MÉTHODES DE NETTOYAGE
     * ========================================
     */

    async purgeByPattern(pattern) {
      let freedSpace = 0;
      let itemsRemoved = 0;
      const keysToRemove = [];

      // Identifier les clés à supprimer
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (pattern.test(key)) {
          keysToRemove.push(key);
        }
      }

      // Supprimer les clés
      keysToRemove.forEach((key) => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            freedSpace += new Blob([value]).size;
            localStorage.removeItem(key);
            itemsRemoved++;
          }
        } catch (error) {
          console.warn(`Impossible de supprimer ${key}:`, error);
        }
      });

      return { freedSpace, itemsRemoved };
    }

    async purgeOldData(type = "all", maxAgeDays = null) {
      let freedSpace = 0;
      let itemsRemoved = 0;
      const keysToRemove = [];
      const cutoffTime =
        Date.now() -
        (maxAgeDays || OPTIMIZER_CONFIG.RETENTION_PERIODS.CELL_DATA) *
          24 *
          60 *
          60 *
          1000;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Filtrer par type si spécifié
        if (type !== "all" && !this.keyMatchesType(key, type)) {
          continue;
        }

        try {
          const value = localStorage.getItem(key);
          const data = JSON.parse(value);

          if (data.timestamp && data.timestamp < cutoffTime) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Si pas de timestamp ou JSON invalide, considérer comme ancien si type correspond
          if (this.keyMatchesType(key, type) || type === "all") {
            keysToRemove.push(key);
          }
        }
      }

      // Supprimer les clés identifiées
      keysToRemove.forEach((key) => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            freedSpace += new Blob([value]).size;
            localStorage.removeItem(key);
            itemsRemoved++;
          }
        } catch (error) {
          console.warn(`Impossible de supprimer ${key}:`, error);
        }
      });

      console.log(
        `🗑️ Suppression données anciennes (${type}): ${itemsRemoved} éléments, ${this.formatBytes(freedSpace)}`,
      );
      return { freedSpace, itemsRemoved };
    }

    async purgeByTypeAndAge(type) {
      const retentionDays =
        OPTIMIZER_CONFIG.RETENTION_PERIODS[type.toUpperCase()] || 30;
      return await this.purgeOldData(type, retentionDays);
    }

    async purgeOrphanedMetadata() {
      let freedSpace = 0;
      let itemsRemoved = 0;
      const metaKeys = [];
      const dataKeys = new Set();

      // Collecter toutes les clés
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (OPTIMIZER_CONFIG.PATTERNS.META_KEY.test(key)) {
          metaKeys.push(key);
        } else if (OPTIMIZER_CONFIG.PATTERNS.CLARAVERSE_KEY.test(key)) {
          dataKeys.add(key);
        }
      }

      // Vérifier les métadonnées orphelines
      metaKeys.forEach((metaKey) => {
        const expectedDataKey = metaKey.replace("meta_", "dev_");
        if (!dataKeys.has(expectedDataKey)) {
          try {
            const value = localStorage.getItem(metaKey);
            if (value) {
              freedSpace += new Blob([value]).size;
              localStorage.removeItem(metaKey);
              itemsRemoved++;
            }
          } catch (error) {
            console.warn(
              `Impossible de supprimer métadonnée orpheline ${metaKey}:`,
              error,
            );
          }
        }
      });

      return { freedSpace, itemsRemoved };
    }

    async aggressivePurge() {
      console.log(
        "⚠️ Purge agressive - suppression des données les plus anciennes...",
      );

      const entries = [];

      // Collecter toutes les entrées avec leur âge
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!OPTIMIZER_CONFIG.PATTERNS.CLARAVERSE_KEY.test(key)) continue;

        try {
          const value = localStorage.getItem(key);
          const data = JSON.parse(value);
          const size = new Blob([value]).size;

          entries.push({
            key,
            timestamp: data.timestamp || 0,
            size,
            priority: this.getKeyPriority(key),
          });
        } catch (error) {
          // Données corrompues - haute priorité de suppression
          const value = localStorage.getItem(key);
          const size = value ? new Blob([value]).size : 0;
          entries.push({
            key,
            timestamp: 0,
            size,
            priority: 0, // Très haute priorité de suppression
          });
        }
      }

      // Trier par priorité (plus bas en premier) puis par âge (plus ancien en premier)
      entries.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.timestamp - b.timestamp;
      });

      let freedSpace = 0;
      let itemsRemoved = 0;
      const targetSize =
        OPTIMIZER_CONFIG.STORAGE_LIMITS.TARGET_AFTER_CLEANUP * 1024 * 1024;
      let currentSize = await this.calculateTotalSize();

      // Supprimer jusqu'à atteindre la taille cible
      for (const entry of entries) {
        if (currentSize <= targetSize) break;

        try {
          localStorage.removeItem(entry.key);
          freedSpace += entry.size;
          currentSize -= entry.size;
          itemsRemoved++;
        } catch (error) {
          console.warn(`Impossible de supprimer ${entry.key}:`, error);
        }
      }

      console.log(
        `🗑️ Purge agressive terminée: ${itemsRemoved} éléments supprimés`,
      );
      return { freedSpace, itemsRemoved };
    }

    /**
     * ========================================
     * COMPRESSION
     * ========================================
     */

    checkCompressionSupport() {
      try {
        // Test basique de compression disponible
        const testString = "x".repeat(1000);
        const compressed = this.compress(testString);
        const decompressed = this.decompress(compressed);
        return decompressed === testString;
      } catch (error) {
        return false;
      }
    }

    compress(str) {
      // Implémentation simple de compression LZ-style
      // Note: Dans un vrai projet, utiliser une vraie lib de compression
      return btoa(unescape(encodeURIComponent(str)));
    }

    decompress(str) {
      return decodeURIComponent(escape(atob(str)));
    }

    async compressLargeEntries() {
      if (!this.compressionEnabled) return { freedSpace: 0 };

      let freedSpace = 0;
      const threshold = 50 * 1024; // 50KB

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!OPTIMIZER_CONFIG.PATTERNS.CLARAVERSE_KEY.test(key)) continue;

        try {
          const value = localStorage.getItem(key);
          if (!value || value.length < threshold) continue;

          const originalSize = new Blob([value]).size;
          const compressed = this.compress(value);
          const compressedSize = new Blob([compressed]).size;

          // Seulement si compression significative (>20% gain)
          if (compressedSize < originalSize * 0.8) {
            const data = JSON.parse(value);
            data._compressed = true;
            data._originalSize = originalSize;

            localStorage.setItem(
              key,
              JSON.stringify({
                ...data,
                _compressedData: compressed,
              }),
            );

            freedSpace += originalSize - compressedSize;
            console.log(
              `🗜️ Compressé ${key}: ${this.formatBytes(originalSize)} → ${this.formatBytes(compressedSize)}`,
            );
          }
        } catch (error) {
          console.warn(`Impossible de comprimer ${key}:`, error);
        }
      }

      return { freedSpace };
    }

    /**
     * ========================================
     * MÉTHODES UTILITAIRES
     * ========================================
     */

    determineOptimizationStrategy() {
      if (!this.analysisResults) return { name: "basic" };

      const totalSizeMB = this.analysisResults.totalSize / (1024 * 1024);

      if (totalSizeMB > OPTIMIZER_CONFIG.STORAGE_LIMITS.CRITICAL_THRESHOLD) {
        return {
          name: "emergency",
          description: "Nettoyage d'urgence - espace critique",
          aggressive: true,
        };
      } else if (
        totalSizeMB > OPTIMIZER_CONFIG.STORAGE_LIMITS.WARNING_THRESHOLD
      ) {
        return {
          name: "smart",
          description: "Nettoyage intelligent par âge et priorité",
          aggressive: false,
        };
      } else {
        return {
          name: "maintenance",
          description: "Nettoyage de maintenance",
          aggressive: false,
        };
      }
    }

    async executeOptimization(strategy) {
      let results = { freedSpace: 0, itemsRemoved: 0 };

      switch (strategy.name) {
        case "emergency":
          const emergencyResults = await this.emergencyCleanup();
          results.freedSpace = emergencyResults.freedSpace;
          results.itemsRemoved = emergencyResults.itemsRemoved;
          break;

        case "smart":
          const smartResults = await this.smartCleanup();
          results.freedSpace = smartResults.freedSpace;
          results.itemsRemoved = smartResults.itemsRemoved;
          break;

        case "maintenance":
        default:
          // Nettoyage basique
          const tempResults = await this.purgeByPattern(
            OPTIMIZER_CONFIG.PATTERNS.TEMP_KEY,
          );
          const corruptedResults = await this.purgeByPattern(
            OPTIMIZER_CONFIG.PATTERNS.CORRUPTED_KEY,
          );
          const orphanedResults = await this.purgeOrphanedMetadata();

          results.freedSpace =
            (tempResults.freedSpace +
              corruptedResults.freedSpace +
              orphanedResults.freedSpace) /
            (1024 * 1024);
          results.itemsRemoved =
            tempResults.itemsRemoved +
            corruptedResults.itemsRemoved +
            orphanedResults.itemsRemoved;
          break;
      }

      return results;
    }

    identifyKeyType(key) {
      if (OPTIMIZER_CONFIG.PATTERNS.TEMP_KEY.test(key)) return "temp";
      if (OPTIMIZER_CONFIG.PATTERNS.CORRUPTED_KEY.test(key)) return "corrupted";
      if (OPTIMIZER_CONFIG.PATTERNS.BACKUP_KEY.test(key)) return "backup";
      if (OPTIMIZER_CONFIG.PATTERNS.HTML_KEY.test(key)) return "html";
      if (OPTIMIZER_CONFIG.PATTERNS.STRUCT_KEY.test(key)) return "struct";
      if (OPTIMIZER_CONFIG.PATTERNS.META_KEY.test(key)) return "meta";
      if (OPTIMIZER_CONFIG.PATTERNS.CLARAVERSE_KEY.test(key))
        return "claraverse";
      return "other";
    }

    keyMatchesType(key, type) {
      const keyType = this.identifyKeyType(key);
      return (
        keyType === type ||
        (type === "claraverse" && keyType.startsWith("claraverse"))
      );
    }

    getKeyPriority(key) {
      const type = this.identifyKeyType(key);
      return OPTIMIZER_CONFIG.PURGE_PRIORITIES[type] || 10;
    }

    async calculateTotalSize() {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      return totalSize;
    }

    updateStats() {
      if (!this.analysisResults) return;

      this.stats = {
        totalSize: this.analysisResults.totalSize,
        claraverseSize: Object.entries(this.analysisResults.byType)
          .filter(([type]) => type !== "other")
          .reduce((sum, [, data]) => sum + data.size, 0),
        otherSize: this.analysisResults.byType.other?.size || 0,
        keyCount: Object.values(this.analysisResults.byType).reduce(
          (sum, type) => sum + type.count,
          0,
        ),
        claraverseKeyCount: Object.entries(this.analysisResults.byType)
          .filter(([type]) => type !== "other")
          .reduce((sum, [, data]) => sum + data.count, 0),
        lastOptimization: Date.now(),
      };
    }

    formatBytes(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    // Export des données importantes avant nettoyage
    async exportImportantData() {
      const exportData = {
        timestamp: Date.now(),
        version: OPTIMIZER_CONFIG.VERSION,
        data: {},
      };

      // Exporter seulement les données récentes et importantes
      const recentThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 jours

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!OPTIMIZER_CONFIG.PATTERNS.CLARAVERSE_KEY.test(key)) continue;
        if (OPTIMIZER_CONFIG.PATTERNS.TEMP_KEY.test(key)) continue;
        if (OPTIMIZER_CONFIG.PATTERNS.CORRUPTED_KEY.test(key)) continue;

        try {
          const value = localStorage.getItem(key);
          const data = JSON.parse(value);

          // Seulement les données récentes
          if (data.timestamp && data.timestamp > recentThreshold) {
            exportData.data[key] = value;
          }
        } catch (error) {
          // Ignorer les données non parsables
        }
      }

      // Sauvegarder l'export dans un blob téléchargeable
      const exportBlob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `claraverse-backup-${Date.now()}.json`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(
        `📤 Export créé: ${Object.keys(exportData.data).length} entrées`,
      );
      return exportData;
    }

    // Import des données sauvegardées
    async importData(jsonData) {
      try {
        const importData =
          typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
        let imported = 0;

        for (const [key, value] of Object.entries(importData.data)) {
          try {
            localStorage.setItem(key, value);
            imported++;
          } catch (error) {
            console.warn(`Impossible d'importer ${key}:`, error);
          }
        }

        console.log(`📥 Import terminé: ${imported} entrées restaurées`);
        return { success: true, imported };
      } catch (error) {
        console.error("❌ Erreur import:", error);
        return { success: false, error: error.message };
      }
    }
  }

  /**
   * ========================================
   * API GLOBALE ET FONCTIONS PRATIQUES
   * ========================================
   */

  // Instance globale
  const optimizer = new StorageOptimizer();

  // API publique
  window.StorageOptimizer = {
    // Méthodes principales
    optimizeNow: () => optimizer.optimizeNow(),
    emergencyCleanup: () => optimizer.emergencyCleanup(),
    smartCleanup: () => optimizer.smartCleanup(),

    // Analyse et diagnostic
    analyzeStorage: () => optimizer.analyzeStorage(),
    displayStatus: () => optimizer.displayStorageStatus(),
    getStats: () => optimizer.stats,

    // Nettoyages spécifiques
    purgeOldData: (type, days) => optimizer.purgeOldData(type, days),
    purgeByPattern: (pattern) => optimizer.purgeByPattern(pattern),
    cleanupOrphaned: () => optimizer.purgeOrphanedMetadata(),

    // Import/Export
    exportData: () => optimizer.exportImportantData(),
    importData: (data) => optimizer.importData(data),

    // Compression
    compressLarge: () => optimizer.compressLargeEntries(),

    // Utilitaires
    calculateSize: () => optimizer.calculateTotalSize(),
    formatBytes: (bytes) => optimizer.formatBytes(bytes),

    // Configuration
    config: OPTIMIZER_CONFIG,
    version: OPTIMIZER_CONFIG.VERSION,
  };

  // Fonctions de commodité globales
  window.cleanStorage = () => window.StorageOptimizer.optimizeNow();
  window.emergencyStorage = () => window.StorageOptimizer.emergencyCleanup();
  window.analyzeStorage = () => window.StorageOptimizer.analyzeStorage();

  /**
   * ========================================
   * AUTO-MONITORING ET ALERTES
   * ========================================
   */

  // Fonction de monitoring automatique
  function startStorageMonitoring() {
    setInterval(async () => {
      try {
        const totalSize = await optimizer.calculateTotalSize();
        const sizeMB = totalSize / (1024 * 1024);

        if (sizeMB > OPTIMIZER_CONFIG.STORAGE_LIMITS.CRITICAL_THRESHOLD) {
          console.warn("🚨 ALERTE STOCKAGE CRITIQUE:", sizeMB.toFixed(2), "MB");

          // Auto-nettoyage d'urgence si configuré
          if (window.CLARAVERSE_CONFIG?.storage?.autoCleanup) {
            console.log("🤖 Auto-nettoyage d'urgence activé...");
            await window.StorageOptimizer.emergencyCleanup();
          } else {
            // Afficher notification à l'utilisateur
            if (window.showQuickNotification) {
              window.showQuickNotification(
                "⚠️ Stockage plein - Nettoyage requis",
                5000,
              );
            }
          }
        } else if (sizeMB > OPTIMIZER_CONFIG.STORAGE_LIMITS.WARNING_THRESHOLD) {
          console.warn(
            "⚠️ Alerte stockage:",
            sizeMB.toFixed(2),
            "MB - Optimisation recommandée",
          );

          if (window.showQuickNotification) {
            window.showQuickNotification("💾 Stockage presque plein", 3000);
          }
        }
      } catch (error) {
        console.error("❌ Erreur monitoring stockage:", error);
      }
    }, 60000); // Vérifier toutes les minutes
  }

  // Démarrage automatique du monitoring
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(startStorageMonitoring, 5000);
    });
  } else {
    setTimeout(startStorageMonitoring, 5000);
  }

  /**
   * ========================================
   * INTEGRATION AVEC CLARAVERSE
   * ========================================
   */

  // Intégration avec le système ClaraVerse existant
  if (window.ClaraVerseAPI) {
    // Ajouter les méthodes de gestion de stockage à l'API principale
    window.ClaraVerseAPI.storage = window.StorageOptimizer;

    // Hook sur les sauvegardes pour optimiser automatiquement
    const originalSaveMethod = window.ClaraVerseAPI.saveWithMeta;
    if (originalSaveMethod) {
      window.ClaraVerseAPI.saveWithMeta = async function (...args) {
        const result = await originalSaveMethod.apply(this, args);

        // Vérifier l'espace après chaque sauvegarde importante
        const totalSize = await optimizer.calculateTotalSize();
        if (
          totalSize >
          OPTIMIZER_CONFIG.STORAGE_LIMITS.WARNING_THRESHOLD * 1024 * 1024
        ) {
          setTimeout(() => window.StorageOptimizer.smartCleanup(), 1000);
        }

        return result;
      };
    }
  }

  // Messages d'aide pour la console
  console.log("✅ ClaraVerse Storage Optimizer v3.1 chargé");
  console.log("💡 Commandes disponibles:");
  console.log("   - cleanStorage()      : Optimisation automatique");
  console.log("   - emergencyStorage()  : Nettoyage d'urgence");
  console.log("   - analyzeStorage()    : Analyse détaillée");
  console.log("   - StorageOptimizer.*  : API complète");
})();
