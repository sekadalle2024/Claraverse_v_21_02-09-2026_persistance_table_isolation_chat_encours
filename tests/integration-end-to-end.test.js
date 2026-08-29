// ============================================
// TESTS D'INTÉGRATION END-TO-END
// Test complet du workflow de détection à stockage
// ============================================

(function() {
  'use strict';

  /**
   * Environnement de test pour l'intégration end-to-end
   */
  class IntegrationTestEnvironment {
    constructor() {
      this.testResults = [];
      this.sessionId = null;
      this.containerId = null;
      this.localStorage = new Map();
      this.mockDOM = null;
      this.eventLog = [];
    }

    /**
     * Créer un environnement DOM de test complet
     */
    createTestEnvironment() {
      // Créer un conteneur de test
      const testContainer = document.createElement('div');
      testContainer.className = 'prose prose-base dark:prose-invert max-w-none';
      testContainer.setAttribute('data-test-container', 'true');
      
      // Ajouter des métadonnées de session
      testContainer.setAttribute('data-session-id', 'test-session-123');
      
      document.body.appendChild(testContainer);
      this.mockDOM = testContainer;
      
      return testContainer;
    }

    /**
     * Créer une table de test avec contenu spécifique
     */
    createTestTable(headers, rows, containerId = null) {
      const table = document.createElement('table');
      table.className = 'min-w-full border-collapse border border-gray-300';
      
      // Créer les en-têtes
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'border border-gray-300 px-4 py-2 bg-gray-100';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Créer les lignes de données
      const tbody = document.createElement('tbody');
      rows.forEach(rowData => {
        const row = document.createElement('tr');
        rowData.forEach(cellData => {
          const td = document.createElement('td');
          td.textContent = cellData;
          td.className = 'border border-gray-300 px-4 py-2';
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      
      // Ajouter à un conteneur si spécifié
      if (containerId && this.mockDOM) {
        const container = this.mockDOM.querySelector(`[data-container-id="${containerId}"]`);
        if (container) {
          container.appendChild(table);
        } else {
          this.mockDOM.appendChild(table);
        }
      } else if (this.mockDOM) {
        this.mockDOM.appendChild(table);
      }
      
      return table;
    }

    /**
     * Simuler localStorage pour les tests
     */
    mockLocalStorage() {
      const originalLocalStorage = window.localStorage;
      
      window.localStorage = {
        getItem: (key) => this.localStorage.get(key) || null,
        setItem: (key, value) => this.localStorage.set(key, value),
        removeItem: (key) => this.localStorage.delete(key),
        clear: () => this.localStorage.clear(),
        get length() { return this.localStorage.size; },
        key: (index) => Array.from(this.localStorage.keys())[index] || null
      };
      
      return originalLocalStorage;
    }

    /**
     * Écouter les événements du système
     */
    startEventListening() {
      const events = [
        'claraverse:session:changed',
        'claraverse:container:changed',
        'claraverse:migration:completed',
        'claraverse:storage:initialized'
      ];
      
      events.forEach(eventType => {
        document.addEventListener(eventType, (event) => {
          this.eventLog.push({
            type: eventType,
            detail: event.detail,
            timestamp: Date.now()
          });
        });
      });
    }

    /**
     * Nettoyer l'environnement de test
     */
    cleanup() {
      if (this.mockDOM && this.mockDOM.parentNode) {
        this.mockDOM.parentNode.removeChild(this.mockDOM);
      }
      this.localStorage.clear();
      this.eventLog = [];
    }

    /**
     * Attendre qu'une condition soit remplie
     */
    async waitFor(condition, timeout = 5000) {
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        if (await condition()) {
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return false;
    }
  }

  /**
   * Suite de tests d'intégration end-to-end
   */
  class IntegrationTestSuite {
    constructor() {
      this.testEnv = new IntegrationTestEnvironment();
      this.results = [];
    }

    /**
     * Exécuter tous les tests d'intégration
     */
    async runAllTests() {
      console.log('🧪 Début des tests d\'intégration end-to-end');
      
      const tests = [
        'testCompleteWorkflowSingleSession',
        'testMultiSessionIsolation',
        'testMigrationAndBackwardCompatibility',
        'testContainerManagement',
        'testErrorRecovery',
        'testPerformanceUnderLoad'
      ];

      for (const testName of tests) {
        try {
          console.log(`\n🔬 Test: ${testName}`);
          await this[testName]();
          console.log(`✅ ${testName} - RÉUSSI`);
        } catch (error) {
          console.error(`❌ ${testName} - ÉCHEC:`, error);
          this.results.push({
            test: testName,
            passed: false,
            error: error.message
          });
        }
      }

      this.printResults();
      return this.results;
    }

    /**
     * Test 1: Workflow complet de détection à stockage (session unique)
     */
    async testCompleteWorkflowSingleSession() {
      this.testEnv.cleanup();
      const originalLocalStorage = this.testEnv.mockLocalStorage();
      this.testEnv.startEventListening();
      
      try {
        // 1. Créer l'environnement de test
        const container = this.testEnv.createTestEnvironment();
        
        // 2. Vérifier que l'API est disponible
        if (!window.claraverseStorageAPI) {
          throw new Error('API claraverseStorageAPI non disponible');
        }
        
        const api = window.claraverseStorageAPI;
        
        // 3. Créer une table de test
        const table = this.testEnv.createTestTable(
          ['Nom', 'Age', 'Ville'],
          [
            ['Alice', '25', 'Paris'],
            ['Bob', '30', 'Lyon'],
            ['Charlie', '35', 'Marseille']
          ]
        );
        
        // 4. Tester la détection de session
        const sessionContext = api.getCurrentSession();
        if (!sessionContext) {
          // Forcer la détection
          api.refreshSession();
          await this.testEnv.waitFor(() => api.getCurrentSession() !== null);
        }
        
        const finalSessionContext = api.getCurrentSession();
        if (!finalSessionContext) {
          throw new Error('Échec détection de session');
        }
        
        // 5. Tester la détection de conteneur
        const containerId = api.getOrCreateContainerId(table);
        if (!containerId || containerId === 'no-container') {
          throw new Error('Échec détection de conteneur');
        }
        
        // 6. Tester la génération d'ID robuste
        const robustId = api.generateRobustTableId(table);
        if (!robustId) {
          throw new Error('Échec génération ID robuste');
        }
        
        // Vérifier que l'ID contient les composants attendus
        if (!robustId.includes(finalSessionContext.sessionId)) {
          throw new Error('ID robuste ne contient pas l\'ID de session');
        }
        
        // 7. Tester la sauvegarde
        const saveResult = api.saveTable(table);
        if (!saveResult) {
          throw new Error('Échec sauvegarde de table');
        }
        
        // Vérifier que les données sont stockées
        const storedData = this.testEnv.localStorage.get(robustId);
        if (!storedData) {
          throw new Error('Données non trouvées dans le stockage');
        }
        
        const parsedData = JSON.parse(storedData);
        if (parsedData.version !== '2.0') {
          throw new Error('Version de données incorrecte');
        }
        
        // 8. Tester la restauration
        // Créer une nouvelle table vide
        const newTable = this.testEnv.createTestTable(['', '', ''], []);
        newTable.setAttribute('data-robust-table-id', robustId);
        
        const restoreResult = api.restoreTable(newTable);
        if (!restoreResult) {
          throw new Error('Échec restauration de table');
        }
        
        // Vérifier que le contenu a été restauré
        const restoredRows = newTable.querySelectorAll('tbody tr');
        if (restoredRows.length !== 3) {
          throw new Error(`Nombre de lignes incorrect après restauration: ${restoredRows.length}`);
        }
        
        // 9. Vérifier les statistiques
        const stats = api.getStats();
        if (stats.tableCount < 1) {
          throw new Error('Statistiques incorrectes');
        }
        
        console.log('✅ Workflow complet testé avec succès');
        this.results.push({
          test: 'testCompleteWorkflowSingleSession',
          passed: true,
          details: {
            sessionId: finalSessionContext.sessionId,
            containerId: containerId,
            robustId: robustId,
            stats: stats
          }
        });
        
      } finally {
        window.localStorage = originalLocalStorage;
        this.testEnv.cleanup();
      }
    }

    /**
     * Test 2: Isolation entre sessions multiples
     */
    async testMultiSessionIsolation() {
      this.testEnv.cleanup();
      const originalLocalStorage = this.testEnv.mockLocalStorage();
      
      try {
        const api = window.claraverseStorageAPI;
        
        // Session 1
        const container1 = this.testEnv.createTestEnvironment();
        container1.setAttribute('data-session-id', 'session-1');
        
        const table1 = this.testEnv.createTestTable(
          ['Produit', 'Prix'],
          [['Pomme', '1.50'], ['Banane', '2.00']]
        );
        
        // Forcer la détection de session 1
        api.refreshSession();
        const session1Context = api.getCurrentSession();
        const id1 = api.generateRobustTableId(table1);
        api.saveTable(table1);
        
        // Session 2 (simuler changement de session)
        container1.setAttribute('data-session-id', 'session-2');
        
        const table2 = this.testEnv.createTestTable(
          ['Produit', 'Prix'], // Même structure
          [['Orange', '3.00'], ['Kiwi', '4.00']] // Données différentes
        );
        
        // Forcer la détection de session 2
        api.refreshSession();
        const session2Context = api.getCurrentSession();
        const id2 = api.generateRobustTableId(table2);
        api.saveTable(table2);
        
        // Vérifications
        if (id1 === id2) {
          throw new Error('IDs identiques pour des sessions différentes');
        }
        
        if (!id1.includes('session-1') || !id2.includes('session-2')) {
          throw new Error('IDs ne contiennent pas les identifiants de session corrects');
        }
        
        // Vérifier que les données sont isolées
        const data1 = JSON.parse(this.testEnv.localStorage.get(id1));
        const data2 = JSON.parse(this.testEnv.localStorage.get(id2));
        
        if (data1.sessionId === data2.sessionId) {
          throw new Error('Sessions non isolées dans les données');
        }
        
        console.log('✅ Isolation entre sessions testée avec succès');
        this.results.push({
          test: 'testMultiSessionIsolation',
          passed: true,
          details: {
            session1: session1Context?.sessionId,
            session2: session2Context?.sessionId,
            id1: id1,
            id2: id2
          }
        });
        
      } finally {
        window.localStorage = originalLocalStorage;
        this.testEnv.cleanup();
      }
    }

    /**
     * Test 3: Migration et compatibilité descendante
     */
    async testMigrationAndBackwardCompatibility() {
      this.testEnv.cleanup();
      const originalLocalStorage = this.testEnv.mockLocalStorage();
      
      try {
        const api = window.claraverseStorageAPI;
        
        // 1. Créer des données legacy
        const legacyKey = 'claraverse_table_0_12345';
        const legacyData = {
          html: '<table><tr><th>Legacy</th></tr><tr><td>Data</td></tr></table>',
          timestamp: Date.now() - 86400000, // 1 jour plus tôt
          rowCount: 2,
          colCount: 1
        };
        
        this.testEnv.localStorage.set(legacyKey, JSON.stringify(legacyData));
        
        // 2. Déclencher la migration
        const migrationStats = await api.migrateAllData();
        
        if (migrationStats.migrated !== 1) {
          throw new Error(`Migration incorrecte: ${migrationStats.migrated} au lieu de 1`);
        }
        
        // 3. Vérifier que les anciennes données ont été supprimées
        if (this.testEnv.localStorage.has(legacyKey)) {
          throw new Error('Données legacy non supprimées après migration');
        }
        
        // 4. Vérifier que les nouvelles données existent
        const newKeys = Array.from(this.testEnv.localStorage.keys())
          .filter(key => key.includes('migrated_legacy'));
        
        if (newKeys.length !== 1) {
          throw new Error(`Nombre incorrect de données migrées: ${newKeys.length}`);
        }
        
        const migratedData = JSON.parse(this.testEnv.localStorage.get(newKeys[0]));
        if (migratedData.version !== '2.0') {
          throw new Error('Version incorrecte après migration');
        }
        
        if (!migratedData.metadata.migratedFrom) {
          throw new Error('Métadonnées de migration manquantes');
        }
        
        // 5. Tester la compatibilité avec les anciennes fonctions
        const container = this.testEnv.createTestEnvironment();
        const table = this.testEnv.createTestTable(['Test'], [['Value']]);
        
        // Utiliser l'ancienne fonction
        const oldResult = window.saveTableHTMLNow(table);
        if (!oldResult) {
          throw new Error('Ancienne fonction saveTableHTMLNow ne fonctionne plus');
        }
        
        console.log('✅ Migration et compatibilité testées avec succès');
        this.results.push({
          test: 'testMigrationAndBackwardCompatibility',
          passed: true,
          details: {
            migrationStats: migrationStats,
            migratedKeys: newKeys
          }
        });
        
      } finally {
        window.localStorage = originalLocalStorage;
        this.testEnv.cleanup();
      }
    }

    /**
     * Test 4: Gestion des conteneurs
     */
    async testContainerManagement() {
      this.testEnv.cleanup();
      const originalLocalStorage = this.testEnv.mockLocalStorage();
      
      try {
        const api = window.claraverseStorageAPI;
        
        // 1. Créer plusieurs conteneurs
        const container1 = this.testEnv.createTestEnvironment();
        container1.setAttribute('data-test-container', 'container-1');
        
        const container2 = document.createElement('div');
        container2.className = 'prose prose-base';
        container2.setAttribute('data-test-container', 'container-2');
        document.body.appendChild(container2);
        
        // 2. Ajouter des tables dans chaque conteneur
        const table1 = this.testEnv.createTestTable(['A', 'B'], [['1', '2']]);
        container1.appendChild(table1);
        
        const table2 = this.testEnv.createTestTable(['C', 'D'], [['3', '4']]);
        container2.appendChild(table2);
        
        // 3. Tester la détection de conteneurs
        const containerId1 = api.getOrCreateContainerId(table1);
        const containerId2 = api.getOrCreateContainerId(table2);
        
        if (containerId1 === containerId2) {
          throw new Error('Conteneurs identiques pour des tables dans des conteneurs différents');
        }
        
        // 4. Tester les statistiques de conteneurs
        const containerStats = api.getContainerStats();
        if (containerStats.containerCount < 2) {
          throw new Error(`Nombre de conteneurs incorrect: ${containerStats.containerCount}`);
        }
        
        // 5. Tester l'analyse de changements
        const changes1 = api.analyzeContainer(containerId1);
        if (!changes1) {
          throw new Error('Analyse de conteneur échouée');
        }
        
        // 6. Nettoyer un conteneur et tester le nettoyage
        container2.remove();
        const cleanedCount = api.cleanupStaleContainers();
        if (cleanedCount < 1) {
          throw new Error('Nettoyage des conteneurs obsolètes échoué');
        }
        
        console.log('✅ Gestion des conteneurs testée avec succès');
        this.results.push({
          test: 'testContainerManagement',
          passed: true,
          details: {
            containerId1: containerId1,
            containerId2: containerId2,
            containerStats: containerStats,
            cleanedCount: cleanedCount
          }
        });
        
      } finally {
        window.localStorage = originalLocalStorage;
        this.testEnv.cleanup();
      }
    }

    /**
     * Test 5: Récupération d'erreurs
     */
    async testErrorRecovery() {
      this.testEnv.cleanup();
      const originalLocalStorage = this.testEnv.mockLocalStorage();
      
      try {
        const api = window.claraverseStorageAPI;
        
        // 1. Simuler une erreur de quota localStorage
        let quotaErrorThrown = false;
        const originalSetItem = this.testEnv.localStorage.set;
        
        this.testEnv.localStorage.set = function(key, value) {
          if (!quotaErrorThrown) {
            quotaErrorThrown = true;
            const error = new Error('QuotaExceededError');
            error.name = 'QuotaExceededError';
            throw error;
          }
          return originalSetItem.call(this, key, value);
        };
        
        // 2. Tenter une sauvegarde qui devrait déclencher le nettoyage
        const container = this.testEnv.createTestEnvironment();
        const table = this.testEnv.createTestTable(['Test'], [['Data']]);
        
        // Ajouter quelques données existantes pour le nettoyage
        for (let i = 0; i < 10; i++) {
          const oldKey = `claraverse_table_old_${i}`;
          const oldData = { html: '<table></table>', timestamp: Date.now() - (i * 86400000) };
          originalSetItem.call(this.testEnv.localStorage, oldKey, JSON.stringify(oldData));
        }
        
        const saveResult = api.saveTable(table);
        
        // La sauvegarde devrait réussir après nettoyage
        if (!saveResult) {
          throw new Error('Récupération d\'erreur de quota échouée');
        }
        
        // 3. Tester la récupération de migration
        const badLegacyKey = 'claraverse_table_bad_data';
        this.testEnv.localStorage.set(badLegacyKey, 'invalid json data');
        
        const migrationStats = await api.migrateAllData();
        
        // Vérifier que les données de récupération ont été créées
        const recoveryData = api.getRecoveryData();
        if (recoveryData.length === 0) {
          throw new Error('Données de récupération non créées pour migration échouée');
        }
        
        console.log('✅ Récupération d\'erreurs testée avec succès');
        this.results.push({
          test: 'testErrorRecovery',
          passed: true,
          details: {
            quotaErrorHandled: quotaErrorThrown,
            recoveryDataCount: recoveryData.length,
            migrationStats: migrationStats
          }
        });
        
      } finally {
        window.localStorage = originalLocalStorage;
        this.testEnv.cleanup();
      }
    }

    /**
     * Test 6: Performance sous charge
     */
    async testPerformanceUnderLoad() {
      this.testEnv.cleanup();
      const originalLocalStorage = this.testEnv.mockLocalStorage();
      
      try {
        const api = window.claraverseStorageAPI;
        const container = this.testEnv.createTestEnvironment();
        
        const startTime = Date.now();
        const tableCount = 50;
        const tables = [];
        
        // 1. Créer et sauvegarder de nombreuses tables
        for (let i = 0; i < tableCount; i++) {
          const table = this.testEnv.createTestTable(
            [`Col1_${i}`, `Col2_${i}`],
            [[`Data1_${i}`, `Data2_${i}`], [`Data3_${i}`, `Data4_${i}`]]
          );
          
          tables.push(table);
          
          const saveResult = api.saveTable(table);
          if (!saveResult) {
            throw new Error(`Sauvegarde échouée pour table ${i}`);
          }
        }
        
        const saveTime = Date.now() - startTime;
        
        // 2. Tester la restauration en masse
        const restoreStartTime = Date.now();
        
        for (const table of tables) {
          const restoreResult = api.restoreTable(table);
          if (!restoreResult) {
            throw new Error('Restauration échouée sous charge');
          }
        }
        
        const restoreTime = Date.now() - restoreStartTime;
        
        // 3. Vérifier les performances
        const avgSaveTime = saveTime / tableCount;
        const avgRestoreTime = restoreTime / tableCount;
        
        if (avgSaveTime > 100) { // Plus de 100ms par table
          throw new Error(`Performance de sauvegarde trop lente: ${avgSaveTime}ms par table`);
        }
        
        if (avgRestoreTime > 50) { // Plus de 50ms par table
          throw new Error(`Performance de restauration trop lente: ${avgRestoreTime}ms par table`);
        }
        
        // 4. Vérifier l'intégrité des données
        const stats = api.getStats();
        if (stats.tableCount < tableCount) {
          throw new Error(`Données perdues sous charge: ${stats.tableCount}/${tableCount}`);
        }
        
        console.log('✅ Performance sous charge testée avec succès');
        this.results.push({
          test: 'testPerformanceUnderLoad',
          passed: true,
          details: {
            tableCount: tableCount,
            totalSaveTime: saveTime,
            totalRestoreTime: restoreTime,
            avgSaveTime: avgSaveTime,
            avgRestoreTime: avgRestoreTime,
            finalStats: stats
          }
        });
        
      } finally {
        window.localStorage = originalLocalStorage;
        this.testEnv.cleanup();
      }
    }

    /**
     * Afficher les résultats des tests
     */
    printResults() {
      console.log('\n📊 RÉSULTATS DES TESTS D\'INTÉGRATION END-TO-END');
      console.log('================================================');
      
      const passed = this.results.filter(r => r.passed).length;
      const total = this.results.length;
      
      console.log(`✅ Tests réussis: ${passed}/${total}`);
      
      if (passed < total) {
        console.log('\n❌ Tests échoués:');
        this.results.filter(r => !r.passed).forEach(result => {
          console.log(`  - ${result.test}: ${result.error}`);
        });
      }
      
      console.log('\n📋 Détails des tests:');
      this.results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.test}`);
        if (result.details) {
          console.log('   Détails:', result.details);
        }
      });
      
      return { passed, total, success: passed === total };
    }
  }

  // ============================================
  // EXPORT ET INITIALISATION
  // ============================================

  // Exposer les tests globalement
  window.IntegrationTestSuite = IntegrationTestSuite;
  window.runIntegrationTests = async function() {
    const suite = new IntegrationTestSuite();
    return await suite.runAllTests();
  };

  // Auto-exécution en mode développement
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🧪 Tests d\'intégration end-to-end chargés');
    console.log('💡 Utilisez runIntegrationTests() pour exécuter tous les tests');
  }

})();