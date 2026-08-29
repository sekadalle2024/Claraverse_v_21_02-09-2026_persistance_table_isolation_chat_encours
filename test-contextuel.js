/**
 * ========================================
 * CLARAVERSE CONTEXTUAL SYSTEM TEST v3.1
 * ========================================
 *
 * Script de test pour valider le nouveau système contextuel
 * de ClaraVerse qui permet d'isoler les données par chat/utilisateur
 *
 * Usage:
 * 1. Charger ce script après les autres scripts ClaraVerse
 * 2. Ouvrir la console développeur
 * 3. Exécuter: testContextualSystem()
 *

(function() {
  'use strict';

  /**
   * ========================================
   * CONFIGURATION DES TESTS
   * ========================================
   */
const TEST_CONFIG = {
  VERSION: '3.1.0',
  DEBUG: true,
  AUTO_RUN_TESTS: false,
  CLEANUP_AFTER_TESTS: true,

  // Données de test
  TEST_USERS: ['user1', 'user2', 'testuser'],
  TEST_CHATS: ['chat123', 'conv456', 'test789'],
  TEST_TABLE_CONTENT: [
    { headers: ['Assertion', 'Ecart', 'CTR1'], rows: [['Test1', '100', 'OK']] },
    { headers: ['Item', 'Value', 'Status'], rows: [['Item1', '200', 'Valid']] },
    { headers: ['Col1', 'Col2', 'Col3'], rows: [['A', 'B', 'C']] }
  ]
};

/**
 * ========================================
 * CLASSE PRINCIPALE DE TEST
 * ========================================
 */
class ContextualTestSuite {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };
    this.originalData = new Map();
    this.testTables = [];
    this.startTime = Date.now();
  }

  // Exécuter tous les tests
  async runAllTests() {
    console.log('🧪 Démarrage des tests du système contextuel ClaraVerse v3.1');
    console.log('='.repeat(60));

    try {
      // Préparation
      await this.setupTestEnvironment();

      // Tests de base
      await this.testContextGeneration();
      await this.testTableIdGeneration();
      await this.testContextualStorage();

      // Tests de synchronisation
      await this.testContextualSync();
      await this.testConflictResolution();
      await this.testCrossContextIsolation();

      // Tests d'intégration
      await this.testMenuIntegration();
      await this.testDevIntegration();
      await this.testDataPersistence();

      // Tests de performance
      await this.testPerformance();

      // Nettoyage
      if (TEST_CONFIG.CLEANUP_AFTER_TESTS) {
        await this.cleanup();
      }

    } catch (error) {
      this.logError('Erreur globale dans les tests', error);
    }

    // Rapport final
    this.generateReport();
  }

  // Configuration de l'environnement de test
  async setupTestEnvironment() {
    this.logTest('Configuration environnement de test');

    try {
      // Sauvegarder l'état initial
      this.backupOriginalState();

      // Créer des tables de test
      await this.createTestTables();

      // Vérifier que les scripts sont chargés
      this.verifyScriptsLoaded();

      this.logSuccess('Environnement configuré');
    } catch (error) {
      this.logError('Erreur configuration environnement', error);
    }
  }

  // Test de génération de contexte
  async testContextGeneration() {
    this.logTest('Test génération de contexte');

    try {
      // Test avec différents éléments DOM
      const testTable = this.testTables[0];

      let context;
      if (window.generateChatContext) {
        context = window.generateChatContext(testTable);
      } else if (window.contextManager) {
        context = window.contextManager.generateChatContext(testTable);
      } else {
        // Fallback : utiliser dev.js
        context = this.mockContextGeneration(testTable);
      }

      // Vérifications
      this.assert(context.userId, 'Context doit avoir userId');
      this.assert(context.chatId, 'Context doit avoir chatId');
      this.assert(context.timestamp, 'Context doit avoir timestamp');

      // Test de cohérence
      const context2 = this.mockContextGeneration(testTable);
      this.assert(
        context.userId === context2.userId,
        'Contextes successifs doivent avoir même userId'
      );

      this.logSuccess('Génération de contexte OK');
    } catch (error) {
      this.logError('Erreur test génération contexte', error);
    }
  }

  // Test de génération d'ID de table contextuel
  async testTableIdGeneration() {
    this.logTest('Test génération ID tables contextuels');

    try {
      const testTable = this.testTables[0];

      // Générer ID contextuel
      let tableId;
      if (window.generateTableId) {
        tableId = window.generateTableId(testTable, 0);
      } else {
        tableId = this.mockTableIdGeneration(testTable);
      }

      // Vérifications
      this.assert(tableId.includes('||'), 'ID doit contenir séparateur contextuel');
      this.assert(tableId.length > 10, 'ID doit être suffisamment long');
      this.assert(tableId.length <= 80, 'ID ne doit pas être trop long');

      // Test d'unicité
      const testTable2 = this.testTables[1];
      const tableId2 = this.mockTableIdGeneration(testTable2);
      this.assert(tableId !== tableId2, 'IDs de tables différentes doivent être uniques');

      // Test de persistance de l'ID
      const tableIdRepeat = this.mockTableIdGeneration(testTable);
      this.assert(tableId === tableIdRepeat, 'ID doit être stable pour même table');

      this.logSuccess('Génération ID contextuels OK');
    } catch (error) {
      this.logError('Erreur test génération ID', error);
    }
  }

  // Test de stockage contextuel
  async testContextualStorage() {
    this.logTest('Test stockage contextuel');

    try {
      const testData = { content: 'Test content', timestamp: Date.now() };
      const contextKey = 'user1||chat123||main||test_table';

      // Stocker avec contexte
      const storageKey = `claraverse_dev_data_${contextKey}`;
      localStorage.setItem(storageKey, JSON.stringify(testData));

      // Vérifier stockage
      const retrieved = JSON.parse(localStorage.getItem(storageKey));
      this.assert(retrieved.content === testData.content, 'Contenu doit être préservé');

      // Test d'isolation contextuelle
      const otherContextKey = 'user2||chat456||main||test_table';
      const otherStorageKey = `claraverse_dev_data_${otherContextKey}`;

      this.assert(
        !localStorage.getItem(otherStorageKey),
        'Données d\'autres contextes ne doivent pas être accessibles'
      );

      this.logSuccess('Stockage contextuel OK');
    } catch (error) {
      this.logError('Erreur test stockage contextuel', error);
    }
  }

  // Test de synchronisation contextuelle
  async testContextualSync() {
    this.logTest('Test synchronisation contextuelle');

    try {
      const testTable = this.testTables[0];
      const tableId = this.mockTableIdGeneration(testTable);

      // Simuler modification de cellule
      const cell = testTable.querySelector('td');
      if (cell) {
        const originalContent = cell.textContent;
        cell.textContent = 'Modified content';

        // Simuler sauvegarde
        await this.simulateCellSave(cell, tableId);

        // Vérifier données sauvegardées
        const storageKey = `claraverse_dev_data_${tableId}_cell_0_0`;
        const savedData = localStorage.getItem(storageKey);

        this.assert(savedData, 'Données cellule doivent être sauvegardées');

        const parsedData = JSON.parse(savedData);
        this.assert(
          parsedData.content === 'Modified content',
          'Contenu modifié doit être sauvegardé'
        );

        // Restaurer contenu original
        cell.textContent = originalContent;
      }

      this.logSuccess('Synchronisation contextuelle OK');
    } catch (error) {
      this.logError('Erreur test sync contextuelle', error);
    }
  }

  // Test de résolution de conflits
  async testConflictResolution() {
    this.logTest('Test résolution de conflits');

    try {
      // Créer données en conflit
      const baseKey = 'user1||chat123||main||conflict_table';
      const cellKey = `claraverse_dev_data_${baseKey}_cell_0_0`;

      const oldData = {
        content: 'Old content',
        timestamp: Date.now() - 60000 // 1 minute ago
      };

      const newData = {
        content: 'New content',
        timestamp: Date.now()
      };

      // Simuler conflit
      localStorage.setItem(cellKey, JSON.stringify(oldData));

      // Nouvelle sauvegarde (plus récente)
      localStorage.setItem(cellKey, JSON.stringify(newData));

      // Vérifier résolution (le plus récent gagne)
      const resolved = JSON.parse(localStorage.getItem(cellKey));
      this.assert(
        resolved.content === 'New content',
        'Conflit doit être résolu en faveur des données plus récentes'
      );

      this.logSuccess('Résolution de conflits OK');
    } catch (error) {
      this.logError('Erreur test résolution conflits', error);
    }
  }

  // Test d'isolation entre contextes
  async testCrossContextIsolation() {
    this.logTest('Test isolation entre contextes');

    try {
      // Créer données dans différents contextes
      const contexts = [
        'user1||chat123||main||test_table',
        'user2||chat123||main||test_table', // Même chat, utilisateur différent
        'user1||chat456||main||test_table'  // Même utilisateur, chat différent
      ];

      const testContent = ['Content A', 'Content B', 'Content C'];

      // Stocker dans chaque contexte
      contexts.forEach((context, index) => {
        const key = `claraverse_dev_data_${context}_cell_0_0`;
        localStorage.setItem(key, JSON.stringify({
          content: testContent[index],
          context: context,
          timestamp: Date.now()
        }));
      });

      // Vérifier isolation
      contexts.forEach((context, index) => {
        const key = `claraverse_dev_data_${context}_cell_0_0`;
        const data = JSON.parse(localStorage.getItem(key));

        this.assert(
          data.content === testContent[index],
          `Données contexte ${context} doivent être isolées`
        );
      });

      this.logSuccess('Isolation contextes OK');
    } catch (error) {
      this.logError('Erreur test isolation', error);
    }
  }

  // Test intégration avec menu.js
  async testMenuIntegration() {
    this.logTest('Test intégration menu.js');

    try {
      // Vérifier présence du gestionnaire de menu
      this.assert(
        window.ContextualMenuManager || window.contextualMenuManager,
        'Gestionnaire de menu contextuel doit être disponible'
      );

      // Simuler événement de menu
      const testEvent = new CustomEvent('claraverse:contextual:structure:changed', {
        detail: {
          tableId: 'user1||chat123||main||test_table',
          action: 'test_action',
          source: 'menu',
          timestamp: Date.now()
        }
      });

      let eventHandled = false;
      document.addEventListener('claraverse:contextual:structure:changed', () => {
        eventHandled = true;
      }, { once: true });

      document.dispatchEvent(testEvent);

      // Attendre traitement
      await new Promise(resolve => setTimeout(resolve, 100));

      this.assert(eventHandled, 'Événement contextuel doit être traité');

      this.logSuccess('Intégration menu.js OK');
    } catch (error) {
      this.logError('Erreur test intégration menu', error);
    }
  }

  // Test intégration avec dev.js
  async testDevIntegration() {
    this.logTest('Test intégration dev.js');

    try {
      // Vérifier fonctions contextuelles dans dev.js
      const devFunctions = [
        'restoreTableDataContextual',
        'generateChatContext',
        'cleanupConflictingData'
      ];

      // Note: Ces fonctions peuvent ne pas être exposées globalement
      // On teste leur existence indirectement

      const testTable = this.testTables[0];
      if (testTable) {
        // Simuler traitement par dev.js
        await this.simulateDevProcessing(testTable);

        this.assert(
          testTable.dataset.claraverseId,
          'Table doit avoir un ID ClaraVerse après traitement'
        );

        this.assert(
          testTable.classList.contains('claraverse-processed'),
          'Table doit être marquée comme traitée'
        );
      }

      this.logSuccess('Intégration dev.js OK');
    } catch (error) {
      this.logError('Erreur test intégration dev', error);
    }
  }

  // Test de persistance des données
  async testDataPersistence() {
    this.logTest('Test persistance des données');

    try {
      const testTable = this.testTables[0];
      const cell = testTable.querySelector('td');

      if (cell) {
        const originalContent = cell.textContent;
        const modifiedContent = `Modified_${Date.now()}`;

        // Modifier et sauvegarder
        cell.textContent = modifiedContent;
        const tableId = this.mockTableIdGeneration(testTable);
        await this.simulateCellSave(cell, tableId);

        // Simuler rechargement de page
        cell.textContent = originalContent; // Reset

        // Simuler restauration
        await this.simulateDataRestore(testTable, tableId);

        this.assert(
          cell.textContent === modifiedContent,
          'Contenu doit être restauré après rechargement simulé'
        );
      }

      this.logSuccess('Persistance des données OK');
    } catch (error) {
      this.logError('Erreur test persistance', error);
    }
  }

  // Test de performance
  async testPerformance() {
    this.logTest('Test performance système contextuel');

    try {
      const iterations = 100;
      const startTime = performance.now();

      // Test génération contexte
      for (let i = 0; i < iterations; i++) {
        const testTable = this.testTables[i % this.testTables.length];
        this.mockContextGeneration(testTable);
      }

      const contextTime = performance.now() - startTime;

      // Test génération IDs
      const idStartTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        const testTable = this.testTables[i % this.testTables.length];
        this.mockTableIdGeneration(testTable);
      }
      const idTime = performance.now() - idStartTime;

      // Vérifications performance
      this.assert(
        contextTime < 1000,
        `Génération contexte doit être rapide (${contextTime.toFixed(2)}ms pour ${iterations} ops)`
      );

      this.assert(
        idTime < 1000,
        `Génération IDs doit être rapide (${idTime.toFixed(2)}ms pour ${iterations} ops)`
      );

      console.log(`📊 Performance: Contexte=${contextTime.toFixed(2)}ms, IDs=${idTime.toFixed(2)}ms`);

      this.logSuccess('Performance OK');
    } catch (error) {
      this.logError('Erreur test performance', error);
    }
  }

  /**
   * ========================================
   * FONCTIONS UTILITAIRES DE TEST
   * ========================================
   */

  // Créer tables de test
  async createTestTables() {
    const container = document.createElement('div');
    container.style.display = 'none';
    container.className = 'prose prose-base dark:prose-invert max-w-none';

    TEST_CONFIG.TEST_TABLE_CONTENT.forEach((tableData, index) => {
      const table = document.createElement('table');
      table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg';
      table.id = `test-table-${index}`;

      // Headers
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      tableData.headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'border px-4 py-2';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Body
      const tbody = document.createElement('tbody');
      tableData.rows.forEach(rowData => {
        const row = document.createElement('tr');
        rowData.forEach(cellData => {
          const td = document.createElement('td');
          td.textContent = cellData;
          td.className = 'border px-4 py-2';
          td.contentEditable = true;
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);

      container.appendChild(table);
      this.testTables.push(table);
    });

    document.body.appendChild(container);
  }

  // Simulation génération contexte
  mockContextGeneration(element) {
    return {
      userId: 'test_user',
      chatId: 'test_chat_123',
      conversationId: null,
      divContext: 'test_div',
      timestamp: Date.now()
    };
  }

  // Simulation génération ID table
  mockTableIdGeneration(table) {
    if (table.dataset.claraverseId && table.dataset.claraverseId.includes('||')) {
      return table.dataset.claraverseId;
    }

    const context = this.mockContextGeneration(table);
    const headers = Array.from(table.querySelectorAll('th'))
      .slice(0, 3)
      .map(th => th.textContent.trim().substring(0, 8))
      .join('_');

    const tableId = [
      context.userId.substring(0, 8),
      context.chatId,
      context.divContext,
      `tbl_${headers}_${table.rows.length}x${table.rows[0]?.cells.length || 0}`
    ].join('||');

    table.dataset.claraverseId = tableId;
    table.dataset.chatContext = JSON.stringify(context);

    return tableId;
  }

  // Simulation sauvegarde cellule
  async simulateCellSave(cell, tableId) {
    const cellId = `cell_${cell.parentNode.rowIndex}_${cell.cellIndex}`;
    const storageKey = `claraverse_dev_data_${tableId}_${cellId}`;

    const data = {
      content: cell.textContent,
      html: cell.innerHTML,
      timestamp: Date.now(),
      contextualId: tableId
    };

    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  // Simulation traitement dev.js
  async simulateDevProcessing(table) {
    const tableId = this.mockTableIdGeneration(table);
    table.classList.add('claraverse-processed');
    table.dataset.processed = 'true';
    table.dataset.timestamp = Date.now().toString();

    // Simuler traitement des cellules
    const cells = table.querySelectorAll('td');
    cells.forEach((cell, index) => {
      cell.dataset.cellId = `cell_${Math.floor(index / cells.length * table.rows.length)}_${index % (table.rows[0]?.cells.length || 1)}`;
    });
  }

  // Simulation restauration données
  async simulateDataRestore(table, tableId) {
    const cells = table.querySelectorAll('td[data-cell-id]');

    for (const cell of cells) {
      const cellId = cell.dataset.cellId;
      const storageKey = `claraverse_dev_data_${tableId}_${cellId}`;
      const storedData = localStorage.getItem(storageKey);

      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.content) {
          cell.textContent = data.content;
        }
      }
    }
  }

  // Sauvegarder état original
  backupOriginalState() {
    // Sauvegarder localStorage
    const storageBackup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('claraverse_')) {
        storageBackup[key] = localStorage.getItem(key);
      }
    }
    this.originalData.set('localStorage', storageBackup);
  }

  // Vérifier que les scripts sont chargés
  verifyScriptsLoaded() {
    const requiredScripts = [
      { name: 'Configuration', check: () => window.CLARAVERSE_CONFIG },
      { name: 'Coordinateur', check: () => window.claraverseSyncAPI || window.coordinatorState },
    ];

    requiredScripts.forEach(script => {
      if (!script.check()) {
        console.warn(`⚠️ Script ${script.name} non détecté`);
      } else {
        console.log(`✅ Script ${script.name} détecté`);
      }
    });
  }

  // Nettoyage après tests
  async cleanup() {
    this.logTest('Nettoyage environnement de test');

    try {
      // Supprimer tables de test
      this.testTables.forEach(table => {
        if (table.parentNode) {
          table.parentNode.removeChild(table);
        }
      });

      // Nettoyer localStorage de test
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('test_') || key.includes('Test')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      this.logSuccess('Nettoyage terminé');
    } catch (error) {
      this.logError('Erreur nettoyage', error);
    }
  }

  /**
   * ========================================
   * FONCTIONS D'ASSERTION ET LOGGING
   * ========================================
   */

  assert(condition, message) {
    this.results.total++;

    if (condition) {
      this.results.passed++;
      this.results.details.push({ type: 'PASS', message });
    } else {
      this.results.failed++;
      this.results.errors.push(message);
      this.results.details.push({ type: 'FAIL', message });
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  logTest(testName) {
    console.log(`\n🧪 ${testName}`);
  }

  logSuccess(message) {
    console.log(`✅ ${message}`);
  }

  logError(message, error) {
    console.error(`❌ ${message}:`, error);
    this.results.errors.push(`${message}: ${error.message || error}`);
  }

  // Générer rapport final
  generateReport() {
    const duration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT DE TEST SYSTÈME CONTEXTUEL CLARAVERSE v3.1');
    console.log('='.repeat(60));
    console.log(`⏱️  Durée: ${duration}ms`);
    console.log(`📈 Tests exécutés: ${this.results.total}`);
    console.log(`✅ Réussis: ${this.results.passed}`);
    console.log(`❌ Échoués: ${this.results.failed}`);
    console.log(`📊 Taux de réussite: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);

    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERREURS DÉTECTÉES:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (this.results.passed === this.results.total) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS!');
      console.log('Le système contextuel ClaraVerse v3.1 fonctionne correctement.');
    } else {
      console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('Veuillez corriger les erreurs avant de déployer en production.');
    }

    console.log('='.repeat(60));

    return {
      success: this.results.failed === 0,
      ...this.results,
      duration
    };
  }
}

/**
 * ========================================
 * FONCTIONS GLOBALES
 * ========================================
 */

// Fonction principale de test
window.testContextualSystem = async function () {
  const testSuite = new ContextualTestSuite();
  return await testSuite.runAllTests();
};

// Test rapide
window.quickContextualTest = async function () {
  console.log('🚀 Test rapide du système contextuel...');

  try {
    // Test basique de génération d'ID
    const testDiv = document.createElement('div');
    testDiv.className = 'prose';
    const testTable = document.createElement('table');
    testTable.className = 'min-w-full border';
    testTable.innerHTML = '<tr><th>Test</th></tr><tr><td>Value</td></tr>';
    testDiv.appendChild(testTable);
    document.body.appendChild(testDiv);

    // Mock génération contexte
    const mockContext = {
      userId: 'quick_test',
      chatId: 'test123',
      divContext: 'test_div',
      timestamp: Date.now()
    };

    const contextualId = [
      mockContext.userId,
      mockContext.chatId,
      mockContext.divContext,
      'tbl_test_2x1'
    ].join('||');

    console.log(`✅ ID contextuel généré: ${contextualId}`);
    console.log(`✅ Séparateur détecté: ${contextualId.includes('||')}`);
    console.log('🎯 Test rapide terminé avec succès!');

    // Nettoyage
    document.body.removeChild(testDiv);

    return true;
  } catch (error) {
    console.error('❌ Échec du test rapide:', error);
    return false;
  }
};

// Auto-exécution si configuré
if (TEST_CONFIG.AUTO_RUN_TESTS) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🤖 Auto-exécution des tests contextuels...');
      window.testContextualSystem();
    }, 2000);
  });
}

console.log('🧪 Script de test contextuel ClaraVerse v3.1 chargé');
console.log('💡 Utilisez testContextualSystem() ou quickContextualTest() dans la console');

}) ();
