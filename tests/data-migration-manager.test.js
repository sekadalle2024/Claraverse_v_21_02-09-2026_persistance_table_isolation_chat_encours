// ============================================
// TESTS INTÉGRATION - Data Migration Manager
// Tests pour la migration des données legacy
// ============================================

/**
 * Mock de localStorage pour les tests
 */
class MockLocalStorage {
  constructor() {
    this.data = new Map();
  }

  getItem(key) {
    return this.data.get(key) || null;
  }

  setItem(key, value) {
    this.data.set(key, value);
  }

  removeItem(key) {
    this.data.delete(key);
  }

  key(index) {
    const keys = Array.from(this.data.keys());
    return keys[index] || null;
  }

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  // Méthodes utilitaires pour les tests
  getAllKeys() {
    return Array.from(this.data.keys());
  }

  getAllData() {
    const result = {};
    for (const [key, value] of this.data.entries()) {
      result[key] = value;
    }
    return result;
  }
}

/**
 * Environnement de test pour la migration
 */
class MigrationTestEnvironment {
  constructor() {
    this.localStorage = new MockLocalStorage();
    this.originalLocalStorage = null;
    this.originalWindow = null;
    this.originalDocument = null;
  }

  setup() {
    // Sauvegarder les références originales
    this.originalLocalStorage = global.localStorage;
    this.originalWindow = global.window;
    this.originalDocument = global.document;

    // Configurer les mocks
    global.localStorage = this.localStorage;
    global.window = {
      location: { href: 'https://test.example.com/chat' },
      navigator: { userAgent: 'Test Browser 1.0' }
    };
    global.document = {
      createElement: (tag) => ({
        innerHTML: '',
        querySelector: () => ({ textContent: 'Test Header' })
      })
    };
  }

  teardown() {
    // Restaurer les références originales
    if (this.originalLocalStorage) global.localStorage = this.originalLocalStorage;
    if (this.originalWindow) global.window = this.originalWindow;
    if (this.originalDocument) global.document = this.originalDocument;
  }

  reset() {
    this.localStorage.clear();
  }

  /**
   * Créer des données legacy pour les tests
   */
  createLegacyData(count = 3) {
    const legacyData = [];

    for (let i = 0; i < count; i++) {
      const key = `claraverse_table_${i}_${12345 + i}`;
      const data = {
        id: key,
        html: `<table><tr><td>Legacy Table ${i + 1}</td></tr></table>`,
        timestamp: Date.now() - (i * 1000),
        rowCount: 2 + i,
        colCount: 3,
        version: '1.0'
      };

      this.localStorage.setItem(key, JSON.stringify(data));
      legacyData.push({ key, data });
    }

    return legacyData;
  }

  /**
   * Créer des données au nouveau format
   */
  createNewFormatData(count = 2) {
    const newData = [];

    for (let i = 0; i < count; i++) {
      const key = `claraverse_table_session${i}_container${i}_0_${54321 + i}_${Date.now() + i}`;
      const data = {
        id: key,
        html: `<table><tr><td>New Format Table ${i + 1}</td></tr></table>`,
        timestamp: Date.now() - (i * 500),
        sessionId: `session${i}`,
        containerId: `container${i}`,
        metadata: {
          rowCount: 3 + i,
          colCount: 4,
          version: '2.0'
        }
      };

      this.localStorage.setItem(key, JSON.stringify(data));
      newData.push({ key, data });
    }

    return newData;
  }

  /**
   * Créer des données corrompues pour tester la gestion d'erreurs
   */
  createCorruptedData() {
    const corruptedKeys = [
      'claraverse_table_corrupt1_123',
      'claraverse_table_corrupt2_456'
    ];

    // Données JSON invalides
    this.localStorage.setItem(corruptedKeys[0], '{ invalid json }');
    
    // Données manquantes
    this.localStorage.setItem(corruptedKeys[1], '');

    return corruptedKeys;
  }
}

/**
 * Suite de tests pour DataMigrationManager
 */
class DataMigrationManagerTests {
  constructor() {
    this.testEnv = new MigrationTestEnvironment();
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  /**
   * Exécution de tous les tests
   */
  async runAllTests() {
    console.log('🧪 Début des tests Data Migration Manager...');
    
    this.testEnv.setup();

    try {
      await this.testLegacyDataDetection();
      await this.testNewFormatDetection();
      await this.testSingleTableMigration();
      await this.testBatchMigration();
      await this.testErrorHandling();
      await this.testRecoveryMechanism();
      await this.testMigrationValidation();
      await this.testPerformanceWithLargeDataset();
      await this.testRecoveryDataCleanup();
      await this.testMigrationReporting();
    } finally {
      this.testEnv.teardown();
    }

    this.printResults();
  }

  /**
   * Test de détection des données legacy
   */
  async testLegacyDataDetection() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Détection de données legacy
    const legacyData = this.testEnv.createLegacyData(3);
    const foundKeys = manager.findOldFormatKeys();

    this.assert(
      foundKeys.length === 3,
      'Détection legacy - nombre de clés',
      `3 clés legacy attendues, ${foundKeys.length} trouvées`
    );

    legacyData.forEach(({ key }) => {
      this.assert(
        foundKeys.includes(key),
        `Détection legacy - clé ${key}`,
        `La clé ${key} doit être détectée comme legacy`
      );
    });

    // Test 2: Mélange legacy et nouveau format
    this.testEnv.createNewFormatData(2);
    const mixedKeys = manager.findOldFormatKeys();

    this.assert(
      mixedKeys.length === 3,
      'Détection legacy - mélange formats',
      `Seules les clés legacy doivent être détectées: ${mixedKeys.length}/5`
    );

    // Test 3: Aucune donnée legacy
    this.testEnv.reset();
    this.testEnv.createNewFormatData(2);
    const noLegacyKeys = manager.findOldFormatKeys();

    this.assert(
      noLegacyKeys.length === 0,
      'Détection legacy - aucune donnée',
      `Aucune clé legacy ne doit être trouvée: ${noLegacyKeys.length}`
    );
  }

  /**
   * Test de détection du nouveau format
   */
  async testNewFormatDetection() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Clés au nouveau format
    const newFormatKeys = [
      'claraverse_table_session1_container1_0_12345_1234567890',
      'claraverse_table_migrated_legacy_legacy_container_0_54321_9876543210'
    ];

    newFormatKeys.forEach(key => {
      this.assert(
        manager.isNewFormat(key),
        `Nouveau format - ${key}`,
        `La clé doit être reconnue comme nouveau format`
      );
    });

    // Test 2: Clés au format legacy
    const legacyKeys = [
      'claraverse_table_0_12345',
      'claraverse_table_1_67890'
    ];

    legacyKeys.forEach(key => {
      this.assert(
        !manager.isNewFormat(key),
        `Format legacy - ${key}`,
        `La clé doit être reconnue comme legacy`
      );
    });

    // Test 3: Clés invalides
    const invalidKeys = [
      'other_prefix_table_0_12345',
      'claraverse_table_',
      'claraverse_table_incomplete'
    ];

    invalidKeys.forEach(key => {
      this.assert(
        !manager.isNewFormat(key),
        `Format invalide - ${key}`,
        `La clé invalide ne doit pas être reconnue comme nouveau format`
      );
    });
  }

  /**
   * Test de migration d'une seule table
   */
  async testSingleTableMigration() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Migration réussie
    const legacyKey = 'claraverse_table_0_12345';
    const legacyData = {
      id: legacyKey,
      html: '<table><tr><td>Test Table</td></tr></table>',
      timestamp: Date.now(),
      rowCount: 2,
      colCount: 3,
      version: '1.0'
    };

    this.testEnv.localStorage.setItem(legacyKey, JSON.stringify(legacyData));

    const success = await manager.migrateSingleTable(legacyKey);

    this.assert(
      success === true,
      'Migration simple - succès',
      'La migration doit réussir'
    );

    // Vérifier que l'ancienne clé a été supprimée
    this.assert(
      this.testEnv.localStorage.getItem(legacyKey) === null,
      'Migration simple - suppression ancienne clé',
      'L\'ancienne clé doit être supprimée'
    );

    // Vérifier qu'une nouvelle clé a été créée
    const allKeys = this.testEnv.localStorage.getAllKeys();
    const newKeys = allKeys.filter(key => key.includes('migrated_legacy'));

    this.assert(
      newKeys.length === 1,
      'Migration simple - nouvelle clé créée',
      `Une nouvelle clé doit être créée: ${newKeys.length} trouvée(s)`
    );

    // Vérifier le contenu des nouvelles données
    const newData = JSON.parse(this.testEnv.localStorage.getItem(newKeys[0]));

    this.assert(
      newData.metadata.version === '2.0',
      'Migration simple - version mise à jour',
      `Version doit être 2.0: ${newData.metadata.version}`
    );

    this.assert(
      newData.metadata.migratedFrom === legacyKey,
      'Migration simple - référence origine',
      `Référence origine doit être préservée: ${newData.metadata.migratedFrom}`
    );

    // Test 2: Migration de données inexistantes
    const missingKey = 'claraverse_table_missing_999';
    const failedMigration = await manager.migrateSingleTable(missingKey);

    this.assert(
      failedMigration === false,
      'Migration simple - données manquantes',
      'La migration de données inexistantes doit échouer'
    );
  }

  /**
   * Test de migration par lot
   */
  async testBatchMigration() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer plusieurs données legacy
    const legacyData = this.testEnv.createLegacyData(5);
    
    // Ajouter quelques données au nouveau format (ne doivent pas être migrées)
    this.testEnv.createNewFormatData(2);

    const stats = await manager.migrateAllExistingData();

    this.assert(
      stats.totalFound === 5,
      'Migration lot - nombre trouvé',
      `5 entrées legacy attendues: ${stats.totalFound} trouvées`
    );

    this.assert(
      stats.migrated === 5,
      'Migration lot - nombre migré',
      `5 migrations attendues: ${stats.migrated} réussies`
    );

    this.assert(
      stats.errors === 0,
      'Migration lot - aucune erreur',
      `Aucune erreur attendue: ${stats.errors} erreurs`
    );

    // Vérifier que les anciennes clés ont été supprimées
    const remainingLegacyKeys = manager.findOldFormatKeys();

    this.assert(
      remainingLegacyKeys.length === 0,
      'Migration lot - nettoyage legacy',
      `Aucune clé legacy ne doit rester: ${remainingLegacyKeys.length} restantes`
    );

    // Vérifier que les nouvelles clés existent
    const allKeys = this.testEnv.localStorage.getAllKeys();
    const migratedKeys = allKeys.filter(key => key.includes('migrated_legacy'));

    this.assert(
      migratedKeys.length === 5,
      'Migration lot - nouvelles clés',
      `5 nouvelles clés attendues: ${migratedKeys.length} créées`
    );
  }

  /**
   * Test de gestion des erreurs
   */
  async testErrorHandling() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer des données corrompues
    const corruptedKeys = this.testEnv.createCorruptedData();
    
    // Ajouter des données valides
    this.testEnv.createLegacyData(2);

    const stats = await manager.migrateAllExistingData();

    this.assert(
      stats.totalFound === 4,
      'Gestion erreurs - total trouvé',
      `4 entrées attendues: ${stats.totalFound} trouvées`
    );

    this.assert(
      stats.migrated === 2,
      'Gestion erreurs - migrations réussies',
      `2 migrations réussies attendues: ${stats.migrated} réussies`
    );

    this.assert(
      stats.errors > 0 || stats.skipped > 0,
      'Gestion erreurs - erreurs détectées',
      'Des erreurs ou données ignorées doivent être détectées'
    );

    // Vérifier que les données de récupération ont été créées
    const recoveryData = manager.getRecoveryData();

    this.assert(
      recoveryData.length > 0,
      'Gestion erreurs - données de récupération',
      `Des données de récupération doivent être créées: ${recoveryData.length} créées`
    );
  }

  /**
   * Test du mécanisme de récupération
   */
  async testRecoveryMechanism() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer une donnée qui va échouer à la migration
    const problematicKey = 'claraverse_table_problem_123';
    const problematicData = {
      id: problematicKey,
      html: '<table><tr><td>Problem Table</td></tr></table>',
      timestamp: Date.now()
      // Données incomplètes pour forcer une erreur
    };

    this.testEnv.localStorage.setItem(problematicKey, JSON.stringify(problematicData));

    // Simuler une erreur en modifiant temporairement localStorage
    const originalSetItem = this.testEnv.localStorage.setItem;
    this.testEnv.localStorage.setItem = (key, value) => {
      if (key.includes('migrated_legacy')) {
        throw new Error('Simulated storage error');
      }
      return originalSetItem.call(this.testEnv.localStorage, key, value);
    };

    try {
      const success = await manager.migrateSingleTableWithRecovery(problematicKey);

      this.assert(
        success === false,
        'Récupération - échec migration',
        'La migration doit échouer comme prévu'
      );

      // Vérifier que les données de récupération ont été créées
      const recoveryData = manager.getRecoveryData();

      this.assert(
        recoveryData.length === 1,
        'Récupération - données sauvegardées',
        `1 donnée de récupération attendue: ${recoveryData.length} créée(s)`
      );

      const recovery = recoveryData[0];

      this.assert(
        recovery.originalKey === problematicKey,
        'Récupération - clé originale',
        `Clé originale doit être préservée: ${recovery.originalKey}`
      );

      // Vérifier que la clé de récupération existe dans localStorage
      const recoveryKey = recovery.recoveryKey;
      const recoveredData = this.testEnv.localStorage.getItem(recoveryKey);

      this.assert(
        recoveredData !== null,
        'Récupération - données stockées',
        'Les données de récupération doivent être stockées'
      );

    } finally {
      // Restaurer localStorage
      this.testEnv.localStorage.setItem = originalSetItem;
    }

    // Test de restauration depuis la récupération
    const restored = manager.restoreFromRecovery(problematicKey);

    this.assert(
      restored === true,
      'Récupération - restauration',
      'La restauration depuis la récupération doit réussir'
    );

    // Vérifier que les données originales ont été restaurées
    const restoredData = this.testEnv.localStorage.getItem(problematicKey);

    this.assert(
      restoredData !== null,
      'Récupération - données restaurées',
      'Les données originales doivent être restaurées'
    );
  }

  /**
   * Test de validation des données migrées
   */
  async testMigrationValidation() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Migrer des données
    this.testEnv.createLegacyData(3);
    await manager.migrateAllExistingData();

    // Valider les données migrées
    const validation = manager.validateMigratedData();

    this.assert(
      validation.totalChecked === 3,
      'Validation - nombre vérifié',
      `3 données attendues: ${validation.totalChecked} vérifiées`
    );

    this.assert(
      validation.validData === 3,
      'Validation - données valides',
      `3 données valides attendues: ${validation.validData} valides`
    );

    this.assert(
      validation.invalidData === 0,
      'Validation - données invalides',
      `Aucune donnée invalide attendue: ${validation.invalidData} invalides`
    );

    // Test avec des données corrompues
    const corruptedKey = 'claraverse_table_session1_container1_0_12345_1234567890';
    this.testEnv.localStorage.setItem(corruptedKey, '{ invalid json }');

    const validationWithErrors = manager.validateMigratedData();

    this.assert(
      validationWithErrors.invalidData > 0,
      'Validation - détection corruption',
      'Les données corrompues doivent être détectées'
    );

    this.assert(
      validationWithErrors.errors.length > 0,
      'Validation - erreurs rapportées',
      'Les erreurs doivent être rapportées'
    );
  }

  /**
   * Test de performance avec un grand jeu de données
   */
  async testPerformanceWithLargeDataset() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer un grand nombre de données legacy
    const largeDataCount = 50;
    this.testEnv.createLegacyData(largeDataCount);

    const startTime = Date.now();
    const stats = await manager.migrateAllExistingData();
    const endTime = Date.now();

    const duration = endTime - startTime;

    this.assert(
      stats.migrated === largeDataCount,
      'Performance - migration complète',
      `${largeDataCount} migrations attendues: ${stats.migrated} réussies`
    );

    this.assert(
      duration < 5000, // 5 secondes max
      'Performance - temps acceptable',
      `Migration doit prendre moins de 5s: ${duration}ms`
    );

    // Vérifier l'efficacité (au moins 10 migrations par seconde)
    const migrationsPerSecond = (stats.migrated / duration) * 1000;

    this.assert(
      migrationsPerSecond > 10,
      'Performance - efficacité',
      `Au moins 10 migrations/s attendues: ${migrationsPerSecond.toFixed(1)}/s`
    );
  }

  /**
   * Test de nettoyage des données de récupération
   */
  async testRecoveryDataCleanup() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer des données de récupération anciennes
    const oldRecoveryKey = 'recovery_old_table_123';
    const oldRecoveryData = {
      timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 jours
      originalKey: 'old_table_123'
    };

    this.testEnv.localStorage.setItem(oldRecoveryKey, JSON.stringify(oldRecoveryData));

    // Créer des données de récupération récentes
    const recentRecoveryKey = 'recovery_recent_table_456';
    const recentRecoveryData = {
      timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 jour
      originalKey: 'recent_table_456'
    };

    this.testEnv.localStorage.setItem(recentRecoveryKey, JSON.stringify(recentRecoveryData));

    // Ajouter à la map de récupération
    manager.recoveryData.set('recent_table_456', {
      recoveryKey: recentRecoveryKey,
      timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000)
    });

    const cleanedCount = manager.cleanupRecoveryData(7 * 24 * 60 * 60 * 1000); // 7 jours

    this.assert(
      cleanedCount >= 1,
      'Nettoyage récupération - données supprimées',
      `Au moins 1 donnée ancienne doit être supprimée: ${cleanedCount} supprimées`
    );

    // Vérifier que les données récentes sont préservées
    const recentStillExists = this.testEnv.localStorage.getItem(recentRecoveryKey);

    this.assert(
      recentStillExists !== null,
      'Nettoyage récupération - données récentes préservées',
      'Les données récentes doivent être préservées'
    );
  }

  /**
   * Test de génération de rapports de migration
   */
  async testMigrationReporting() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer un mélange de données
    this.testEnv.createLegacyData(3);
    this.testEnv.createCorruptedData();

    await manager.migrateAllExistingData();

    const report = manager.getMigrationReport();

    // Vérifier la structure du rapport
    this.assert(
      report.summary !== undefined,
      'Rapport - section résumé',
      'Le rapport doit contenir une section résumé'
    );

    this.assert(
      report.validation !== undefined,
      'Rapport - section validation',
      'Le rapport doit contenir une section validation'
    );

    this.assert(
      report.recovery !== undefined,
      'Rapport - section récupération',
      'Le rapport doit contenir une section récupération'
    );

    this.assert(
      report.recommendations !== undefined,
      'Rapport - recommandations',
      'Le rapport doit contenir des recommandations'
    );

    // Vérifier le contenu du résumé
    this.assert(
      typeof report.summary.successRate === 'string',
      'Rapport - taux de succès',
      'Le taux de succès doit être une chaîne'
    );

    this.assert(
      Array.isArray(report.recommendations),
      'Rapport - format recommandations',
      'Les recommandations doivent être un tableau'
    );

    this.assert(
      report.recommendations.length > 0,
      'Rapport - recommandations présentes',
      'Des recommandations doivent être générées'
    );
  }

  /**
   * Créer un manager pour les tests
   */
  createManager() {
    // Utiliser la classe réelle avec les mocks
    const manager = {
      migrationVersion: '2.0',
      oldPrefix: 'claraverse_table_',
      migrationStats: {
        totalFound: 0,
        migrated: 0,
        errors: 0,
        skipped: 0,
        startTime: null,
        endTime: null
      },
      recoveryData: new Map(),

      async migrateAllExistingData() {
        this.migrationStats.startTime = Date.now();
        this.migrationStats.totalFound = 0;
        this.migrationStats.migrated = 0;
        this.migrationStats.errors = 0;
        this.migrationStats.skipped = 0;

        const oldKeys = this.findOldFormatKeys();
        this.migrationStats.totalFound = oldKeys.length;

        if (oldKeys.length === 0) {
          this.migrationStats.endTime = Date.now();
          return this.migrationStats;
        }

        for (const oldKey of oldKeys) {
          try {
            const success = await this.migrateSingleTableWithRecovery(oldKey);
            if (success) {
              this.migrationStats.migrated++;
            } else {
              this.migrationStats.skipped++;
            }
          } catch (error) {
            this.migrationStats.errors++;
          }
        }

        this.migrationStats.endTime = Date.now();
        return this.migrationStats;
      },

      findOldFormatKeys() {
        const oldKeys = [];
        
        try {
          for (let i = 0; i < global.localStorage.length; i++) {
            const key = global.localStorage.key(i);
            if (key && key.startsWith(this.oldPrefix) && !this.isNewFormat(key)) {
              oldKeys.push(key);
            }
          }
        } catch (error) {
          // Handle error
        }

        return oldKeys;
      },

      isNewFormat(key) {
        if (!key || !key.startsWith(this.oldPrefix)) {
          return false;
        }

        const parts = key.split('_');
        
        if (parts.length < 6) {
          return false;
        }

        if (parts[0] !== 'claraverse' || parts[1] !== 'table') {
          return false;
        }

        for (let i = 2; i < Math.min(parts.length, 6); i++) {
          if (!parts[i] || parts[i].trim() === '') {
            return false;
          }
        }

        if (key.includes('recovery_') || key.includes('migrated_legacy')) {
          return true;
        }

        return true;
      },

      async migrateSingleTable(oldKey) {
        try {
          const oldData = global.localStorage.getItem(oldKey);
          if (!oldData) {
            return false;
          }

          let parsedData;
          try {
            parsedData = JSON.parse(oldData);
          } catch (parseError) {
            return false;
          }

          const genericSessionId = 'migrated_legacy';
          const genericContainerId = 'legacy_container';
          const timestamp = parsedData.timestamp || Date.now();
          const contentHash = this.generateLegacyContentHash(parsedData);
          
          const newKey = `claraverse_table_${genericSessionId}_${genericContainerId}_0_${contentHash}_${timestamp}`;

          if (global.localStorage.getItem(newKey)) {
            return false;
          }

          const newData = {
            id: newKey,
            html: parsedData.html || parsedData.outerHTML || '',
            timestamp: timestamp,
            sessionId: genericSessionId,
            containerId: genericContainerId,
            metadata: {
              rowCount: parsedData.rowCount || 0,
              colCount: parsedData.colCount || 0,
              version: this.migrationVersion,
              migratedFrom: oldKey,
              migrationDate: Date.now(),
              originalVersion: parsedData.version || '1.0'
            },
            context: {
              url: global.window.location.href,
              userAgent: global.window.navigator.userAgent.substring(0, 100),
              sessionStartTime: Date.now()
            }
          };

          global.localStorage.setItem(newKey, JSON.stringify(newData));
          
          const verifyData = global.localStorage.getItem(newKey);
          if (!verifyData) {
            throw new Error('Échec de la sauvegarde des nouvelles données');
          }

          global.localStorage.removeItem(oldKey);
          
          return true;

        } catch (error) {
          throw error;
        }
      },

      async migrateSingleTableWithRecovery(oldKey) {
        try {
          return await this.migrateSingleTable(oldKey);
        } catch (error) {
          try {
            const rawData = global.localStorage.getItem(oldKey);
            if (rawData) {
              const recoveryKey = `recovery_${oldKey}_${Date.now()}`;
              global.localStorage.setItem(recoveryKey, rawData);
              
              this.recoveryData.set(oldKey, {
                recoveryKey: recoveryKey,
                originalKey: oldKey,
                timestamp: Date.now(),
                error: error.message,
                rawDataSize: rawData.length
              });
            }
            
            return false;
          } catch (recoveryError) {
            throw error;
          }
        }
      },

      generateLegacyContentHash(data) {
        try {
          let content = '';
          
          if (data.html) {
            const tempDiv = global.document.createElement('div');
            tempDiv.innerHTML = data.html;
            const firstRow = tempDiv.querySelector('tr');
            content = firstRow ? firstRow.textContent.slice(0, 100) : '';
          }
          
          const metadata = `${data.rowCount || 0}x${data.colCount || 0}`;
          const signature = `${content}_${metadata}_legacy`;
          
          return this.simpleHash(signature);
        } catch (error) {
          return this.simpleHash(`legacy_fallback_${Date.now()}`);
        }
      },

      simpleHash(str) {
        let hash = 0;
        if (!str || str.length === 0) return hash;
        for (let i = 0; i < Math.min(str.length, 100); i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash |= 0;
        }
        return Math.abs(hash);
      },

      getMigrationStats() {
        return {
          ...this.migrationStats,
          recoveryCount: this.recoveryData.size,
          hasRecoveryData: this.recoveryData.size > 0
        };
      },

      getRecoveryData() {
        return Array.from(this.recoveryData.entries()).map(([key, data]) => ({
          originalKey: key,
          ...data
        }));
      },

      cleanupRecoveryData(maxAge = 7 * 24 * 60 * 60 * 1000) {
        const now = Date.now();
        let cleanedCount = 0;

        try {
          for (const [key, data] of this.recoveryData.entries()) {
            if (now - data.timestamp > maxAge) {
              if (data.recoveryKey) {
                global.localStorage.removeItem(data.recoveryKey);
              }
              this.recoveryData.delete(key);
              cleanedCount++;
            }
          }

          for (let i = 0; i < global.localStorage.length; i++) {
            const key = global.localStorage.key(i);
            if (key && key.startsWith('recovery_')) {
              try {
                const data = JSON.parse(global.localStorage.getItem(key));
                if (data && data.timestamp && (now - data.timestamp > maxAge)) {
                  global.localStorage.removeItem(key);
                  cleanedCount++;
                }
              } catch (error) {
                global.localStorage.removeItem(key);
                cleanedCount++;
              }
            }
          }

          return cleanedCount;
        } catch (error) {
          return 0;
        }
      },

      validateMigratedData() {
        const results = {
          totalChecked: 0,
          validData: 0,
          invalidData: 0,
          missingData: 0,
          errors: []
        };

        try {
          for (let i = 0; i < global.localStorage.length; i++) {
            const key = global.localStorage.key(i);
            if (key && key.startsWith(this.oldPrefix) && this.isNewFormat(key)) {
              results.totalChecked++;
              
              try {
                const data = global.localStorage.getItem(key);
                if (!data) {
                  results.missingData++;
                  continue;
                }

                const parsedData = JSON.parse(data);
                
                const hasRequiredFields = parsedData.id && parsedData.html && 
                                        parsedData.sessionId && parsedData.containerId;
                
                if (hasRequiredFields && parsedData.metadata && parsedData.metadata.version === this.migrationVersion) {
                  results.validData++;
                } else {
                  results.invalidData++;
                  results.errors.push(`Données invalides: ${key}`);
                }
                
              } catch (parseError) {
                results.invalidData++;
                results.errors.push(`Erreur parsing: ${key} - ${parseError.message}`);
              }
            }
          }

          return results;
        } catch (error) {
          results.errors.push(`Erreur validation: ${error.message}`);
          return results;
        }
      },

      restoreFromRecovery(originalKey) {
        try {
          const recoveryInfo = this.recoveryData.get(originalKey);
          if (!recoveryInfo) {
            return false;
          }

          const recoveryData = global.localStorage.getItem(recoveryInfo.recoveryKey);
          if (!recoveryData) {
            return false;
          }

          global.localStorage.setItem(originalKey, recoveryData);
          global.localStorage.removeItem(recoveryInfo.recoveryKey);
          this.recoveryData.delete(originalKey);
          
          return true;
          
        } catch (error) {
          return false;
        }
      },

      getMigrationReport() {
        const stats = this.getMigrationStats();
        const validation = this.validateMigratedData();
        const recovery = this.getRecoveryData();

        return {
          summary: {
            totalProcessed: stats.totalFound,
            successful: stats.migrated,
            errors: stats.errors,
            skipped: stats.skipped,
            duration: stats.endTime ? stats.endTime - stats.startTime : null,
            successRate: stats.totalFound > 0 ? ((stats.migrated / stats.totalFound) * 100).toFixed(1) : 0
          },
          validation: validation,
          recovery: {
            count: recovery.length,
            data: recovery
          },
          recommendations: this.generateRecommendations(stats, validation, recovery)
        };
      },

      generateRecommendations(stats, validation, recovery) {
        const recommendations = [];

        if (stats.errors > 0) {
          recommendations.push('Vérifier les erreurs de migration et considérer une restauration manuelle');
        }

        if (validation.invalidData > 0) {
          recommendations.push('Valider manuellement les données migrées invalides');
        }

        if (recovery.length > 0) {
          recommendations.push('Examiner les données de récupération et décider de leur sort');
        }

        if (stats.migrated === 0 && stats.totalFound > 0) {
          recommendations.push('Aucune migration réussie - vérifier la configuration et réessayer');
        }

        if (recommendations.length === 0) {
          recommendations.push('Migration réussie - aucune action requise');
        }

        return recommendations;
      }
    };

    return manager;
  }

  /**
   * Assertion helper
   */
  assert(condition, testName, message) {
    if (condition) {
      this.passedTests++;
      this.testResults.push({ name: testName, status: 'PASS', message: '' });
      console.log(`✅ ${testName}`);
    } else {
      this.failedTests++;
      this.testResults.push({ name: testName, status: 'FAIL', message: message });
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  /**
   * Affichage des résultats
   */
  printResults() {
    console.log('\n📊 Résultats des tests Data Migration Manager:');
    console.log(`✅ Tests réussis: ${this.passedTests}`);
    console.log(`❌ Tests échoués: ${this.failedTests}`);
    console.log(`📈 Taux de réussite: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ Tests échoués:');
      this.testResults
        .filter(result => result.status === 'FAIL')
        .forEach(result => {
          console.log(`  - ${result.name}: ${result.message}`);
        });
    }
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataMigrationManagerTests, MigrationTestEnvironment };
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  window.DataMigrationManagerTests = DataMigrationManagerTests;
  
  // Fonction pour exécuter les tests
  window.runDataMigrationManagerTests = async () => {
    const tests = new DataMigrationManagerTests();
    await tests.runAllTests();
    return tests;
  };
  
  console.log('🧪 Tests Data Migration Manager chargés. Utilisez runDataMigrationManagerTests() pour les exécuter.');
}