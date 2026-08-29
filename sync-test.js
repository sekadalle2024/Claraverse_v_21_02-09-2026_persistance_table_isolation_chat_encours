/**
 * Utilitaire de Test de Synchronisation ClaraVerse
 *
 * Ce script teste la synchronisation entre menu.js et dev.js
 * pour garantir la persistance des données modifiées dans les tables.
 *
 * Utilisation:
 * 1. Charger ce script dans la console du navigateur
 * 2. Exécuter: ClaraVerseSyncTest.runFullTest()
 * 3. Analyser les résultats dans la console
 */

class ClaraVerseSyncTest {
  constructor() {
    this.results = {
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      warnings: []
    };
    this.testTableId = `test_table_${Date.now()}`;
    this.testTable = null;
  }

  /**
   * Exécuter tous les tests de synchronisation
   */
  async runFullTest() {
    console.log("🧪 === DÉBUT DES TESTS DE SYNCHRONISATION CLARAVERSE ===");
    this.results = { tests: [], totalTests: 0, passedTests: 0, failedTests: 0, warnings: [] };

    try {
      // Tests préliminaires
      await this.testEnvironmentSetup();
      await this.testDevJSAPI();
      await this.testMenuJSIntegration();

      // Tests de création et modification
      await this.createTestTable();
      await this.testTableModifications();
      await this.testDataPersistence();

      // Tests de synchronisation
      await this.testSyncCommunication();
      await this.testFallbackMechanism();

      // Nettoyage
      await this.cleanupTests();

      // Rapport final
      this.generateReport();

    } catch (error) {
      console.error("❌ Erreur critique lors des tests:", error);
      this.addResult("Erreur critique", false, `Erreur système: ${error.message}`);
    }
  }

  /**
   * Test de configuration de l'environnement
   */
  async testEnvironmentSetup() {
    console.log("🔧 Test configuration environnement...");

    // Vérifier présence de dev.js
    const devJSPresent = !!window.claraverseSyncAPI;
    this.addResult("dev.js API disponible", devJSPresent,
      devJSPresent ? "API claraverseSyncAPI détectée" : "API claraverseSyncAPI non trouvée");

    // Vérifier présence de menu.js
    const menuJSPresent = !!window.contextualMenuManager;
    this.addResult("menu.js Manager disponible", menuJSPresent,
      menuJSPresent ? "ContextualMenuManager détecté" : "ContextualMenuManager non trouvé");

    // Vérifier localStorage
    const localStorageAvailable = this.testLocalStorage();
    this.addResult("localStorage disponible", localStorageAvailable,
      localStorageAvailable ? "localStorage fonctionnel" : "localStorage non accessible");

    // Vérifier événements personnalisés
    const customEventsWork = this.testCustomEvents();
    this.addResult("Événements personnalisés", customEventsWork,
      customEventsWork ? "Événements personnalisés fonctionnels" : "Problème avec les événements");
  }

  /**
   * Test de l'API dev.js
   */
  async testDevJSAPI() {
    console.log("📊 Test API dev.js...");

    if (!window.claraverseSyncAPI) {
      this.addResult("API dev.js", false, "claraverseSyncAPI non disponible");
      return;
    }

    const api = window.claraverseSyncAPI;

    // Tester les méthodes essentielles
    const methods = [
      'forceSaveTable', 'notifyTableUpdate', 'saveAllTables',
      'getStorageStats', 'getSyncState'
    ];

    methods.forEach(method => {
      const available = typeof api[method] === 'function';
      this.addResult(`API méthode ${method}`, available,
        available ? `Méthode ${method} disponible` : `Méthode ${method} manquante`);
    });

    // Tester les statistiques de stockage
    try {
      const stats = api.getStorageStats();
      this.addResult("Statistiques stockage", true, `Stats récupérées: ${JSON.stringify(stats)}`);
    } catch (error) {
      this.addResult("Statistiques stockage", false, `Erreur stats: ${error.message}`);
    }

    // Tester l'état de synchronisation
    try {
      const syncState = api.getSyncState();
      this.addResult("État synchronisation", true, `État récupéré: ${JSON.stringify(syncState)}`);
    } catch (error) {
      this.addResult("État synchronisation", false, `Erreur état: ${error.message}`);
    }
  }

  /**
   * Test de l'intégration menu.js
   */
  async testMenuJSIntegration() {
    console.log("🎯 Test intégration menu.js...");

    if (!window.contextualMenuManager) {
      this.addResult("menu.js intégration", false, "ContextualMenuManager non disponible");
      return;
    }

    const manager = window.contextualMenuManager;

    // Vérifier les méthodes de synchronisation
    const syncMethods = ['syncWithDev', 'checkSyncStatus', 'fallbackSync'];
    syncMethods.forEach(method => {
      const available = typeof manager[method] === 'function';
      this.addResult(`menu.js méthode ${method}`, available,
        available ? `Méthode ${method} disponible` : `Méthode ${method} manquante`);
    });

    // Tester l'état de synchronisation
    try {
      const syncStatus = manager.checkSyncStatus();
      this.addResult("Menu sync status", true, `Status: ${JSON.stringify(syncStatus)}`);
    } catch (error) {
      this.addResult("Menu sync status", false, `Erreur status: ${error.message}`);
    }
  }

  /**
   * Créer une table de test
   */
  async createTestTable() {
    console.log("📋 Création table de test...");

    try {
      // Trouver un conteneur dans le chat
      const container = document.querySelector('.prose, .markdown-body, .chat') || document.body;

      // Créer une table de test
      this.testTable = document.createElement('table');
      this.testTable.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg';
      this.testTable.setAttribute('data-test-table', 'true');
      this.testTable.setAttribute('data-table-id', this.testTableId);

      // Ajouter en-têtes
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['ID', 'Nom', 'Valeur', 'Ecart', 'Assertion'];

      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cssText = 'border: 1px solid #d1d5db; padding: 8px; background: #f9fafb;';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      this.testTable.appendChild(thead);

      // Ajouter quelques lignes de données
      const tbody = document.createElement('tbody');
      for (let i = 1; i <= 3; i++) {
        const row = document.createElement('tr');
        const values = [i, `Test ${i}`, Math.floor(Math.random() * 100), '', ''];

        values.forEach(value => {
          const td = document.createElement('td');
          td.textContent = value;
          td.style.cssText = 'border: 1px solid #d1d5db; padding: 8px;';
          td.setAttribute('data-cell-id', `test_cell_${i}_${Date.now()}`);
          row.appendChild(td);
        });
        tbody.appendChild(row);
      }
      this.testTable.appendChild(tbody);

      // Ajouter au DOM
      container.appendChild(this.testTable);

      // Attendre un peu pour l'initialisation
      await this.delay(500);

      this.addResult("Création table test", true, `Table créée avec ID: ${this.testTableId}`);

    } catch (error) {
      this.addResult("Création table test", false, `Erreur création: ${error.message}`);
    }
  }

  /**
   * Test des modifications de table
   */
  async testTableModifications() {
    console.log("✏️ Test modifications table...");

    if (!this.testTable) {
      this.addResult("Modifications table", false, "Table de test non disponible");
      return;
    }

    try {
      // Test 1: Modification d'une cellule
      const firstCell = this.testTable.querySelector('td[data-cell-id]');
      if (firstCell) {
        const originalValue = firstCell.textContent;
        const newValue = `Modified_${Date.now()}`;
        firstCell.textContent = newValue;
        firstCell.setAttribute('data-modified', 'true');

        this.addResult("Modification cellule", true, `Cellule modifiée: ${originalValue} -> ${newValue}`);

        // Attendre et vérifier
        await this.delay(100);
        const currentValue = firstCell.textContent;
        this.addResult("Persistance modification", currentValue === newValue,
          `Valeur après modification: ${currentValue}`);
      }

      // Test 2: Simuler une action de menu (si disponible)
      if (window.contextualMenuManager) {
        const manager = window.contextualMenuManager;
        manager.targetTable = this.testTable;

        // Tester la synchronisation
        try {
          await manager.syncWithDev();
          this.addResult("Sync après modification", true, "Synchronisation exécutée sans erreur");
        } catch (error) {
          this.addResult("Sync après modification", false, `Erreur sync: ${error.message}`);
        }
      }

    } catch (error) {
      this.addResult("Modifications table", false, `Erreur modifications: ${error.message}`);
    }
  }

  /**
   * Test de persistance des données
   */
  async testDataPersistence() {
    console.log("💾 Test persistance données...");

    if (!this.testTable) {
      this.addResult("Persistance données", false, "Table de test non disponible");
      return;
    }

    try {
      // Forcer la sauvegarde via dev.js
      if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
        const savedCells = await window.claraverseSyncAPI.forceSaveTable(this.testTable);
        this.addResult("Sauvegarde forcée", savedCells > 0,
          `${savedCells} cellules sauvegardées`);
      }

      // Vérifier localStorage
      const storageKeys = Object.keys(localStorage).filter(key =>
        key.includes('claraverse') || key.includes('table')
      );
      this.addResult("Données en localStorage", storageKeys.length > 0,
        `${storageKeys.length} clés trouvées dans localStorage`);

      // Tester la restauration
      if (window.claraverseSyncAPI && window.claraverseSyncAPI.restoreAllData) {
        try {
          await window.claraverseSyncAPI.restoreAllData();
          this.addResult("Restauration données", true, "Restauration exécutée sans erreur");
        } catch (error) {
          this.addResult("Restauration données", false, `Erreur restauration: ${error.message}`);
        }
      }

    } catch (error) {
      this.addResult("Persistance données", false, `Erreur persistance: ${error.message}`);
    }
  }

  /**
   * Test de communication de synchronisation
   */
  async testSyncCommunication() {
    console.log("📡 Test communication synchronisation...");

    try {
      // Tester les événements personnalisés
      let eventReceived = false;
      const testEventHandler = (event) => {
        eventReceived = true;
        console.log("Événement reçu:", event.detail);
      };

      document.addEventListener('claraverse:test:sync', testEventHandler);

      // Envoyer un événement de test
      const testEvent = new CustomEvent('claraverse:test:sync', {
        detail: {
          source: 'sync-test',
          timestamp: Date.now(),
          tableId: this.testTableId
        }
      });
      document.dispatchEvent(testEvent);

      await this.delay(100);

      document.removeEventListener('claraverse:test:sync', testEventHandler);

      this.addResult("Communication événements", eventReceived,
        eventReceived ? "Événement envoyé et reçu" : "Événement non reçu");

      // Tester notification table update
      if (window.claraverseSyncAPI && window.claraverseSyncAPI.notifyTableUpdate) {
        try {
          window.claraverseSyncAPI.notifyTableUpdate(this.testTableId, this.testTable, 'test');
          this.addResult("Notification table update", true, "Notification envoyée sans erreur");
        } catch (error) {
          this.addResult("Notification table update", false, `Erreur notification: ${error.message}`);
        }
      }

    } catch (error) {
      this.addResult("Communication sync", false, `Erreur communication: ${error.message}`);
    }
  }

  /**
   * Test du mécanisme de fallback
   */
  async testFallbackMechanism() {
    console.log("🛡️ Test mécanisme fallback...");

    try {
      if (window.contextualMenuManager && this.testTable) {
        const manager = window.contextualMenuManager;
        manager.targetTable = this.testTable;

        // Tester fallback sync
        try {
          manager.fallbackSync();
          this.addResult("Fallback sync", true, "Fallback sync exécuté sans erreur");

          // Vérifier si des données ont été sauvées en fallback
          const fallbackKeys = Object.keys(localStorage).filter(key =>
            key.includes('backup') || key.includes('fallback')
          );
          this.addResult("Fallback storage", fallbackKeys.length > 0,
            `${fallbackKeys.length} sauvegardes fallback trouvées`);

        } catch (error) {
          this.addResult("Fallback sync", false, `Erreur fallback: ${error.message}`);
        }
      }

    } catch (error) {
      this.addResult("Mécanisme fallback", false, `Erreur test fallback: ${error.message}`);
    }
  }

  /**
   * Nettoyage des tests
   */
  async cleanupTests() {
    console.log("🧹 Nettoyage tests...");

    try {
      // Supprimer la table de test
      if (this.testTable && this.testTable.parentNode) {
        this.testTable.parentNode.removeChild(this.testTable);
        this.addResult("Nettoyage table test", true, "Table de test supprimée");
      }

      // Nettoyer localStorage des données de test (optionnel)
      // Commenté pour préserver les données réelles
      /*
      Object.keys(localStorage).forEach(key => {
        if (key.includes('test_table_')) {
          localStorage.removeItem(key);
        }
      });
      */

    } catch (error) {
      this.addResult("Nettoyage", false, `Erreur nettoyage: ${error.message}`);
    }
  }

  /**
   * Générer le rapport final
   */
  generateReport() {
    console.log("\n🏁 === RAPPORT FINAL DE SYNCHRONISATION ===");

    const { totalTests, passedTests, failedTests, warnings } = this.results;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    console.log(`📊 Total tests: ${totalTests}`);
    console.log(`✅ Tests réussis: ${passedTests}`);
    console.log(`❌ Tests échoués: ${failedTests}`);
    console.log(`⚠️ Avertissements: ${warnings.length}`);
    console.log(`📈 Taux de réussite: ${successRate}%`);

    if (failedTests > 0) {
      console.log("\n❌ TESTS ÉCHOUÉS:");
      this.results.tests.filter(test => !test.passed).forEach(test => {
        console.log(`  - ${test.name}: ${test.details}`);
      });
    }

    if (warnings.length > 0) {
      console.log("\n⚠️ AVERTISSEMENTS:");
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    // Recommandations
    console.log("\n💡 RECOMMANDATIONS:");
    if (!window.claraverseSyncAPI) {
      console.log("  - Vérifier que dev.js est bien chargé et initialisé");
    }
    if (!window.contextualMenuManager) {
      console.log("  - Vérifier que menu.js est bien chargé et initialisé");
    }
    if (failedTests > 0) {
      console.log("  - Examiner les erreurs détaillées ci-dessus");
      console.log("  - Vérifier la console pour d'autres messages d'erreur");
    }

    // Évaluation globale
    if (successRate >= 90) {
      console.log("\n🎉 ÉVALUATION: Synchronisation excellente!");
    } else if (successRate >= 75) {
      console.log("\n👍 ÉVALUATION: Synchronisation bonne, quelques améliorations possibles");
    } else if (successRate >= 50) {
      console.log("\n⚠️ ÉVALUATION: Synchronisation problématique, nécessite des corrections");
    } else {
      console.log("\n❌ ÉVALUATION: Synchronisation défaillante, corrections urgentes nécessaires");
    }

    console.log("\n=== FIN DU RAPPORT ===\n");

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      warnings: warnings.length,
      status: successRate >= 75 ? 'good' : successRate >= 50 ? 'warning' : 'critical'
    };
  }

  /**
   * Ajouter un résultat de test
   */
  addResult(name, passed, details = '') {
    this.results.tests.push({ name, passed, details });
    this.results.totalTests++;
    if (passed) {
      this.results.passedTests++;
      console.log(`✅ ${name}: ${details}`);
    } else {
      this.results.failedTests++;
      console.log(`❌ ${name}: ${details}`);
    }
  }

  /**
   * Tester localStorage
   */
  testLocalStorage() {
    try {
      const testKey = 'claraverse_test_' + Date.now();
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return value === 'test';
    } catch (error) {
      return false;
    }
  }

  /**
   * Tester les événements personnalisés
   */
  testCustomEvents() {
    try {
      let eventWorked = false;
      const testHandler = () => { eventWorked = true; };

      document.addEventListener('test-custom-event', testHandler);
      document.dispatchEvent(new CustomEvent('test-custom-event'));
      document.removeEventListener('test-custom-event', testHandler);

      return eventWorked;
    } catch (error) {
      return false;
    }
  }

  /**
   * Utilitaire de délai
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Créer une instance globale pour les tests
window.ClaraVerseSyncTest = new ClaraVerseSyncTest();

// Fonctions utilitaires rapides
window.testSync = () => window.ClaraVerseSyncTest.runFullTest();
window.quickSyncTest = async () => {
  const tester = new ClaraVerseSyncTest();
  await tester.testEnvironmentSetup();
  await tester.testDevJSAPI();
  await tester.testMenuJSIntegration();
  return tester.generateReport();
};

// Auto-exécution si demandé
if (typeof window !== 'undefined' && window.location.search.includes('autotest=sync')) {
  setTimeout(() => {
    console.log("🚀 Auto-exécution des tests de synchronisation...");
    window.testSync();
  }, 2000);
}

console.log("🧪 Utilitaire de test de synchronisation ClaraVerse chargé!");
console.log("📋 Commandes disponibles:");
console.log("  - testSync() : Lancer tous les tests");
console.log("  - quickSyncTest() : Tests rapides seulement");
console.log("  - ClaraVerseSyncTest.runFullTest() : Tests complets avec rapport");
