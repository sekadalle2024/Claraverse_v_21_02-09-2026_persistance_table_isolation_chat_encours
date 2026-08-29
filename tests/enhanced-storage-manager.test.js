// ============================================
// TESTS UNITAIRES - Enhanced Storage Manager
// Tests pour le système d'identification robuste des tables
// ============================================

/**
 * Environnement de test pour le stockage amélioré
 */
class EnhancedStorageTestEnvironment {
  constructor() {
    this.localStorage = new Map();
    this.mockTables = [];
    this.mockContainers = [];
    this.sessionId = 'test-session-123';
    this.containerId = 'test-container-456';
  }

  reset() {
    this.localStorage.clear();
    this.mockTables = [];
    this.mockContainers = [];
    this.sessionId = 'test-session-123';
    this.containerId = 'test-container-456';
  }

  /**
   * Créer une table mock pour les tests
   */
  createMockTable(content = 'Test Table', rowCount = 2, colCount = 3) {
    const table = {
      tagName: 'TABLE',
      className: 'min-w-full border',
      outerHTML: `<table class="min-w-full border"><tr><td>${content}</td></tr></table>`,
      attributes: new Map(),
      
      querySelector: (selector) => {
        if (selector === 'tr') {
          return {
            textContent: content,
            children: Array(colCount).fill().map(() => ({ textContent: content }))
          };
        }
        return null;
      },
      
      querySelectorAll: (selector) => {
        if (selector === 'tr') {
          return Array(rowCount).fill().map(() => ({
            textContent: content,
            children: Array(colCount).fill().map(() => ({ textContent: content }))
          }));
        }
        return [];
      },
      
      getAttribute: (name) => this.attributes.get(name) || null,
      setAttribute: (name, value) => this.attributes.set(name, value),
      hasAttribute: (name) => this.attributes.has(name),
      
      closest: (selector) => {
        return this.mockContainers.find(container => 
          container.className.includes(selector.replace(/[.\\]/g, ''))
        ) || null;
      }
    };

    this.mockTables.push(table);
    return table;
  }

  /**
   * Créer un conteneur mock
   */
  createMockContainer(className = 'prose prose-base') {
    const container = {
      tagName: 'DIV',
      className: className,
      attributes: new Map(),
      children: [],
      
      getAttribute: (name) => this.attributes.get(name) || null,
      setAttribute: (name, value) => this.attributes.set(name, value),
      hasAttribute: (name) => this.attributes.has(name),
      
      querySelectorAll: (selector) => {
        if (selector === 'table') {
          return this.children.filter(child => child.tagName === 'TABLE');
        }
        return [];
      }
    };

    this.mockContainers.push(container);
    return container;
  }

  /**
   * Mock de localStorage
   */
  getLocalStorageMock() {
    return {
      getItem: (key) => this.localStorage.get(key) || null,
      setItem: (key, value) => this.localStorage.set(key, value),
      removeItem: (key) => this.localStorage.delete(key),
      key: (index) => Array.from(this.localStorage.keys())[index] || null,
      get length() { return this.localStorage.size; }
    };
  }
}

/**
 * Suite de tests pour Enhanced Storage Manager
 */
class EnhancedStorageManagerTests {
  constructor() {
    this.testEnv = new EnhancedStorageTestEnvironment();
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  /**
   * Exécution de tous les tests
   */
  async runAllTests() {
    console.log('🧪 Début des tests Enhanced Storage Manager...');
    
    await this.testRobustIdGeneration();
    await this.testContentHashGeneration();
    await this.testEnhancedSaveOperation();
    await this.testEnhancedRestoreOperation();
    await this.testSessionIsolation();
    await this.testBackwardCompatibility();
    await this.testContextValidation();
    await this.testMetadataTracking();
    await this.testTableRelationships();
    await this.testErrorHandling();
    
    // Tests de performance pour le nettoyage
    await this.testCleanupPerformance();
    await this.testSessionIsolationDuringCleanup();
    await this.testDataIntegrityAfterCleanup();
    await this.testOrphanedDataDetectionPerformance();
    await this.testLargeDatasetCleanup();

    this.printResults();
  }

  /**
   * Test de génération d'ID robuste
   */
  async testRobustIdGeneration() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Génération d'ID robuste basique
    const table = this.testEnv.createMockTable('Header 1');
    const robustId = manager.generateRobustTableId(table);

    this.assert(
      robustId !== null,
      'ID robuste - génération réussie',
      'Un ID robuste doit être généré'
    );

    this.assert(
      robustId.startsWith('claraverse_table_'),
      'ID robuste - préfixe correct',
      `L'ID doit commencer par 'claraverse_table_': ${robustId}`
    );

    this.assert(
      robustId.includes(this.testEnv.sessionId),
      'ID robuste - session incluse',
      `L'ID doit contenir l'ID de session: ${robustId}`
    );

    this.assert(
      robustId.includes(this.testEnv.containerId),
      'ID robuste - conteneur inclus',
      `L'ID doit contenir l'ID de conteneur: ${robustId}`
    );

    // Test 2: Consistance de génération
    const robustId2 = manager.generateRobustTableId(table);

    this.assert(
      robustId === robustId2,
      'ID robuste - consistance',
      `Le même ID doit être généré pour la même table: ${robustId} vs ${robustId2}`
    );

    // Test 3: Attribution de l'attribut DOM
    this.assert(
      table.getAttribute('data-robust-table-id') === robustId,
      'ID robuste - attribution DOM',
      'L\'ID doit être attribué comme attribut DOM'
    );

    // Test 4: Tables différentes ont des IDs différents
    const table2 = this.testEnv.createMockTable('Header 2');
    const robustId3 = manager.generateRobustTableId(table2);

    this.assert(
      robustId !== robustId3,
      'ID robuste - unicité',
      `Des tables différentes doivent avoir des IDs différents: ${robustId} vs ${robustId3}`
    );
  }

  /**
   * Test de génération de hash de contenu amélioré
   */
  async testContentHashGeneration() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Hash basé sur la structure
    const table1 = this.testEnv.createMockTable('Header 1', 3, 4);
    const hash1 = manager.generateContentHash(table1);

    this.assert(
      typeof hash1 === 'number',
      'Hash contenu - type numérique',
      `Le hash doit être un nombre: ${typeof hash1}`
    );

    this.assert(
      hash1 > 0,
      'Hash contenu - valeur positive',
      `Le hash doit être positif: ${hash1}`
    );

    // Test 2: Tables identiques ont le même hash
    const table2 = this.testEnv.createMockTable('Header 1', 3, 4);
    const hash2 = manager.generateContentHash(table2);

    this.assert(
      hash1 === hash2,
      'Hash contenu - consistance',
      `Tables identiques doivent avoir le même hash: ${hash1} vs ${hash2}`
    );

    // Test 3: Tables différentes ont des hashs différents
    const table3 = this.testEnv.createMockTable('Header 2', 3, 4);
    const hash3 = manager.generateContentHash(table3);

    this.assert(
      hash1 !== hash3,
      'Hash contenu - différenciation contenu',
      `Tables avec contenu différent doivent avoir des hashs différents: ${hash1} vs ${hash3}`
    );

    // Test 4: Structures différentes ont des hashs différents
    const table4 = this.testEnv.createMockTable('Header 1', 4, 4);
    const hash4 = manager.generateContentHash(table4);

    this.assert(
      hash1 !== hash4,
      'Hash contenu - différenciation structure',
      `Tables avec structure différente doivent avoir des hashs différents: ${hash1} vs ${hash4}`
    );
  }

  /**
   * Test de sauvegarde améliorée
   */
  async testEnhancedSaveOperation() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Sauvegarde avec nouveau format
    const table = this.testEnv.createMockTable('Test Save Table');
    const success = manager.saveTableHTMLNow(table);

    this.assert(
      success === true,
      'Sauvegarde améliorée - succès',
      'La sauvegarde doit réussir'
    );

    // Vérifier que les données ont été sauvegardées
    const savedKeys = Array.from(this.testEnv.localStorage.keys());
    const robustKeys = savedKeys.filter(key => key.includes('claraverse_table_'));

    this.assert(
      robustKeys.length === 1,
      'Sauvegarde améliorée - clé créée',
      `Une clé robuste doit être créée: ${robustKeys.length} trouvée(s)`
    );

    // Vérifier le format des données sauvegardées
    const savedData = JSON.parse(this.testEnv.localStorage.get(robustKeys[0]));

    this.assert(
      savedData.metadata.version === '2.0',
      'Sauvegarde améliorée - version',
      `Version doit être 2.0: ${savedData.metadata.version}`
    );

    this.assert(
      savedData.sessionId === this.testEnv.sessionId,
      'Sauvegarde améliorée - session ID',
      `Session ID doit être préservé: ${savedData.sessionId}`
    );

    this.assert(
      savedData.containerId === this.testEnv.containerId,
      'Sauvegarde améliorée - container ID',
      `Container ID doit être préservé: ${savedData.containerId}`
    );

    this.assert(
      savedData.context !== undefined,
      'Sauvegarde améliorée - contexte',
      'Le contexte doit être inclus'
    );

    this.assert(
      savedData.metadata.contentHash !== undefined,
      'Sauvegarde améliorée - hash contenu',
      'Le hash de contenu doit être inclus'
    );
  }

  /**
   * Test de restauration améliorée
   */
  async testEnhancedRestoreOperation() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Préparer des données sauvegardées
    const table = this.testEnv.createMockTable('Test Restore Table');
    manager.saveTableHTMLNow(table);

    // Créer une nouvelle table pour la restauration
    const newTable = this.testEnv.createMockTable('Empty Table');
    const originalHTML = newTable.outerHTML;

    // Test 1: Restauration réussie
    const restored = manager.restoreTableFromStorage(newTable);

    this.assert(
      restored === true,
      'Restauration améliorée - succès',
      'La restauration doit réussir'
    );

    // Test 2: Validation du contexte
    const robustId = newTable.getAttribute('data-robust-table-id');

    this.assert(
      robustId !== null,
      'Restauration améliorée - ID attribué',
      'L\'ID robuste doit être attribué à la table restaurée'
    );

    // Test 3: Restauration avec validation de contexte
    // Simuler un changement de session
    this.testEnv.sessionId = 'different-session-789';
    const differentSessionTable = this.testEnv.createMockTable('Different Session Table');
    
    // La restauration doit réussir mais avec un avertissement
    const restoredDifferentSession = manager.restoreTableFromStorage(differentSessionTable);

    this.assert(
      restoredDifferentSession === true,
      'Restauration améliorée - session différente',
      'La restauration doit réussir même avec une session différente'
    );
  }

  /**
   * Test d'isolation par session
   */
  async testSessionIsolation() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Session 1
    this.testEnv.sessionId = 'session-1';
    const table1 = this.testEnv.createMockTable('Session 1 Table');
    manager.saveTableHTMLNow(table1);

    // Session 2
    this.testEnv.sessionId = 'session-2';
    const table2 = this.testEnv.createMockTable('Session 1 Table'); // Même contenu
    manager.saveTableHTMLNow(table2);

    // Vérifier que deux clés différentes ont été créées
    const savedKeys = Array.from(this.testEnv.localStorage.keys());
    const session1Keys = savedKeys.filter(key => key.includes('session-1'));
    const session2Keys = savedKeys.filter(key => key.includes('session-2'));

    this.assert(
      session1Keys.length === 1,
      'Isolation session - session 1',
      `Une clé pour session 1: ${session1Keys.length} trouvée(s)`
    );

    this.assert(
      session2Keys.length === 1,
      'Isolation session - session 2',
      `Une clé pour session 2: ${session2Keys.length} trouvée(s)`
    );

    this.assert(
      session1Keys[0] !== session2Keys[0],
      'Isolation session - clés différentes',
      'Les sessions doivent avoir des clés différentes'
    );

    // Test de restauration isolée
    this.testEnv.sessionId = 'session-1';
    const restoreTable1 = this.testEnv.createMockTable('Empty');
    const restored1 = manager.restoreTableFromStorage(restoreTable1);

    this.assert(
      restored1 === true,
      'Isolation session - restauration session 1',
      'La restauration dans la session 1 doit réussir'
    );
  }

  /**
   * Test de compatibilité descendante
   */
  async testBackwardCompatibility() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer des données au format legacy
    const legacyKey = 'claraverse_table_0_12345';
    const legacyData = {
      id: legacyKey,
      html: '<table><tr><td>Legacy Table</td></tr></table>',
      timestamp: Date.now(),
      rowCount: 2,
      colCount: 3,
      version: '1.0'
    };

    this.testEnv.localStorage.set(legacyKey, JSON.stringify(legacyData));

    // Test 1: Restauration de données legacy
    const table = this.testEnv.createMockTable('Legacy Table');
    table.setAttribute('data-menu-table-id', legacyKey);

    const restored = manager.restoreTableFromStorage(table);

    this.assert(
      restored === true,
      'Compatibilité - restauration legacy',
      'Les données legacy doivent être restaurables'
    );

    // Test 2: Migration automatique lors de la sauvegarde
    const saved = manager.saveTableHTMLNow(table);

    this.assert(
      saved === true,
      'Compatibilité - sauvegarde après legacy',
      'La sauvegarde après restauration legacy doit réussir'
    );

    // Vérifier qu'une nouvelle clé robuste a été créée
    const allKeys = Array.from(this.testEnv.localStorage.keys());
    const robustKeys = allKeys.filter(key => 
      key.startsWith('claraverse_table_') && 
      key !== legacyKey &&
      key.split('_').length >= 6
    );

    this.assert(
      robustKeys.length >= 1,
      'Compatibilité - migration automatique',
      `Une clé robuste doit être créée: ${robustKeys.length} trouvée(s)`
    );
  }

  /**
   * Test de validation de contexte
   */
  async testContextValidation() {
    this.testEnv.reset();
    const manager = this.createManager();

    const table = this.testEnv.createMockTable('Context Test Table');

    // Test 1: Validation réussie
    const validation1 = manager.validateOperationContext(table, 'save');

    this.assert(
      validation1.isValid === true,
      'Validation contexte - succès',
      'La validation doit réussir avec un contexte valide'
    );

    this.assert(
      validation1.context.operation === 'save',
      'Validation contexte - opération',
      `L'opération doit être enregistrée: ${validation1.context.operation}`
    );

    // Test 2: Table sans lignes
    const emptyTable = {
      tagName: 'TABLE',
      querySelector: () => null,
      querySelectorAll: () => [],
      getAttribute: () => null,
      setAttribute: () => {},
      hasAttribute: () => false,
      closest: () => null
    };

    const validation2 = manager.validateOperationContext(emptyTable, 'restore');

    this.assert(
      validation2.isValid === false,
      'Validation contexte - table vide',
      'La validation doit échouer pour une table vide'
    );

    this.assert(
      validation2.errors.length > 0,
      'Validation contexte - erreurs rapportées',
      'Des erreurs doivent être rapportées'
    );
  }

  /**
   * Test de suivi des métadonnées
   */
  async testMetadataTracking() {
    this.testEnv.reset();
    const manager = this.createManager();

    const table = this.testEnv.createMockTable('Metadata Test', 4, 5);
    const tableId = 'test-table-id';

    // Test 1: Création de métadonnées complètes
    const metadata = manager.createEnhancedMetadata(table, tableId);

    this.assert(
      metadata.id === tableId,
      'Métadonnées - ID',
      `L'ID doit être préservé: ${metadata.id}`
    );

    this.assert(
      metadata.rowCount === 4,
      'Métadonnées - nombre de lignes',
      `Le nombre de lignes doit être correct: ${metadata.rowCount}`
    );

    this.assert(
      metadata.colCount === 5,
      'Métadonnées - nombre de colonnes',
      `Le nombre de colonnes doit être correct: ${metadata.colCount}`
    );

    this.assert(
      typeof metadata.contentHash === 'number',
      'Métadonnées - hash contenu',
      `Le hash de contenu doit être un nombre: ${typeof metadata.contentHash}`
    );

    this.assert(
      metadata.version === '2.0',
      'Métadonnées - version',
      `La version doit être 2.0: ${metadata.version}`
    );

    this.assert(
      metadata.sessionContext !== null,
      'Métadonnées - contexte session',
      'Le contexte de session doit être inclus'
    );

    this.assert(
      metadata.pageContext !== null,
      'Métadonnées - contexte page',
      'Le contexte de page doit être inclus'
    );

    // Test 2: Détection d'en-têtes
    const hasHeaders = manager.detectTableHeaders(table);

    this.assert(
      typeof hasHeaders === 'boolean',
      'Métadonnées - détection en-têtes',
      'La détection d\'en-têtes doit retourner un booléen'
    );

    // Test 3: Signatures de contenu
    const headerSignature = manager.extractHeaderSignature(table);
    const dataSignature = manager.extractDataSignature(table);

    this.assert(
      typeof headerSignature === 'string',
      'Métadonnées - signature en-têtes',
      'La signature d\'en-têtes doit être une chaîne'
    );

    this.assert(
      typeof dataSignature === 'string',
      'Métadonnées - signature données',
      'La signature de données doit être une chaîne'
    );
  }

  /**
   * Test de suivi des relations entre tables
   */
  async testTableRelationships() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer des tables avec des relations
    const table1 = this.testEnv.createMockTable('Header A', 3, 3);
    const table2 = this.testEnv.createMockTable('Header A', 3, 3); // Structure similaire
    const table3 = this.testEnv.createMockTable('Header B', 5, 2); // Structure différente

    table1.setAttribute('data-robust-table-id', 'table-1');
    table2.setAttribute('data-robust-table-id', 'table-2');
    table3.setAttribute('data-robust-table-id', 'table-3');

    // Test 1: Suivi des relations
    const relationships = manager.trackTableRelationships(this.testEnv.containerId);

    this.assert(
      relationships !== null,
      'Relations tables - suivi réussi',
      'Le suivi des relations doit réussir'
    );

    this.assert(
      relationships.containerId === this.testEnv.containerId,
      'Relations tables - ID conteneur',
      `L'ID de conteneur doit être correct: ${relationships.containerId}`
    );

    // Test 2: Analyse de relation entre tables similaires
    const relation12 = manager.analyzeTableRelation(
      { headerSignature: 'Header A', colCount: 3, rowCount: 3, position: 0 },
      { headerSignature: 'Header A', colCount: 3, rowCount: 3, position: 1 }
    );

    this.assert(
      relation12.type !== 'none',
      'Relations tables - détection similarité',
      `Une relation doit être détectée: ${relation12.type}`
    );

    this.assert(
      relation12.confidence > 0,
      'Relations tables - confiance',
      `La confiance doit être positive: ${relation12.confidence}`
    );

    // Test 3: Analyse de relation entre tables différentes
    const relation13 = manager.analyzeTableRelation(
      { headerSignature: 'Header A', colCount: 3, rowCount: 3, position: 0 },
      { headerSignature: 'Header B', colCount: 2, rowCount: 5, position: 2 }
    );

    this.assert(
      relation13.confidence < 0.5,
      'Relations tables - pas de relation',
      `La confiance doit être faible pour des tables différentes: ${relation13.confidence}`
    );

    // Test 4: Calcul de similarité de chaînes
    const similarity1 = manager.calculateStringSimilarity('Header A', 'Header A');
    const similarity2 = manager.calculateStringSimilarity('Header A', 'Header B');

    this.assert(
      similarity1 === 1,
      'Relations tables - similarité identique',
      `Chaînes identiques doivent avoir similarité 1: ${similarity1}`
    );

    this.assert(
      similarity2 < 1,
      'Relations tables - similarité différente',
      `Chaînes différentes doivent avoir similarité < 1: ${similarity2}`
    );
  }

  /**
   * Test de gestion des erreurs
   */
  async testErrorHandling() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Table null
    const nullResult = manager.generateRobustTableId(null);

    this.assert(
      nullResult === null,
      'Gestion erreurs - table null',
      'Une table null doit retourner null'
    );

    // Test 2: Table sans méthodes
    const invalidTable = { tagName: 'TABLE' };
    const invalidResult = manager.generateRobustTableId(invalidTable);

    this.assert(
      invalidResult !== null,
      'Gestion erreurs - table invalide',
      'Une table invalide doit utiliser le fallback'
    );

    // Test 3: Erreur de contexte
    const originalContextManager = manager.contextManager;
    manager.contextManager = {
      detectCurrentSession: () => { throw new Error('Context error'); }
    };

    const table = this.testEnv.createMockTable('Error Test');
    const errorResult = manager.generateRobustTableId(table);

    this.assert(
      errorResult !== null,
      'Gestion erreurs - erreur contexte',
      'Une erreur de contexte doit utiliser le fallback'
    );

    // Restaurer le context manager
    manager.contextManager = originalContextManager;

    // Test 4: Sauvegarde avec erreur
    const originalSetItem = this.testEnv.localStorage.set;
    this.testEnv.localStorage.set = () => { throw new Error('Storage error'); };

    const saveResult = manager.saveTableHTMLNow(table);

    this.assert(
      saveResult === false,
      'Gestion erreurs - erreur sauvegarde',
      'Une erreur de sauvegarde doit retourner false'
    );

    // Restaurer localStorage
    this.testEnv.localStorage.set = originalSetItem;
  }

  // ============================================
  // TESTS DE PERFORMANCE POUR LE NETTOYAGE
  // ============================================

  /**
   * Test de performance du nettoyage avec de gros volumes de données
   */
  async testCleanupPerformance() {
    this.testEnv.reset();
    const manager = this.createManagerWithCleanup();

    console.log('🚀 Test de performance du nettoyage...');

    // Créer un grand nombre de sauvegardes de test
    const testDataCount = 1000;
    const startSetup = performance.now();

    for (let i = 0; i < testDataCount; i++) {
      const sessionId = `session-${Math.floor(i / 100)}`; // 10 sessions avec 100 tables chacune
      const tableData = {
        id: `claraverse_table_${sessionId}_container-${i % 10}_${i}_${Date.now() + i}`,
        html: `<table><tr><td>Test Data ${i}</td></tr></table>`,
        timestamp: Date.now() - (i * 1000), // Données plus anciennes pour les indices plus élevés
        sessionId: sessionId,
        containerId: `container-${i % 10}`,
        metadata: {
          version: i % 2 === 0 ? '2.0' : '1.0', // Mix de versions
          rowCount: 2,
          colCount: 3,
          contentHash: i * 12345
        }
      };
      
      this.testEnv.localStorage.set(tableData.id, JSON.stringify(tableData));
    }

    const setupTime = performance.now() - startSetup;
    console.log(`📊 Setup de ${testDataCount} entrées en ${setupTime.toFixed(2)}ms`);

    // Test 1: Performance du nettoyage intelligent
    const startCleanup = performance.now();
    const cleanupResults = manager.cleanOldSavesSessionAware(500, true);
    const cleanupTime = performance.now() - startCleanup;

    this.assert(
      cleanupTime < 1000, // Moins d'1 seconde pour 1000 entrées
      'Performance nettoyage - temps acceptable',
      `Nettoyage trop lent: ${cleanupTime.toFixed(2)}ms pour ${testDataCount} entrées`
    );

    this.assert(
      cleanupResults.deleted > 0,
      'Performance nettoyage - éléments supprimés',
      'Le nettoyage doit supprimer des éléments'
    );

    this.assert(
      cleanupResults.preserved > 0,
      'Performance nettoyage - éléments préservés',
      'Le nettoyage doit préserver des éléments actifs'
    );

    console.log(`⚡ Nettoyage de ${testDataCount} entrées en ${cleanupTime.toFixed(2)}ms`);
    console.log(`📊 Résultats: ${cleanupResults.deleted} supprimées, ${cleanupResults.preserved} préservées`);

    // Test 2: Performance de détection des données orphelines
    const startOrphanDetection = performance.now();
    const orphanedData = manager.detectOrphanedData();
    const orphanDetectionTime = performance.now() - startOrphanDetection;

    this.assert(
      orphanDetectionTime < 500, // Moins de 500ms
      'Performance détection orphelines - temps acceptable',
      `Détection orphelines trop lente: ${orphanDetectionTime.toFixed(2)}ms`
    );

    this.assert(
      typeof orphanedData.totalOrphaned === 'number',
      'Performance détection orphelines - résultat valide',
      'La détection doit retourner un nombre total'
    );

    console.log(`🔍 Détection orphelines en ${orphanDetectionTime.toFixed(2)}ms`);
    console.log(`📊 ${orphanedData.totalOrphaned} données orphelines détectées`);

    // Test 3: Performance des statistiques avec session
    const startStats = performance.now();
    const stats = manager.getStorageStatsWithSession();
    const statsTime = performance.now() - startStats;

    this.assert(
      statsTime < 200, // Moins de 200ms
      'Performance statistiques - temps acceptable',
      `Calcul statistiques trop lent: ${statsTime.toFixed(2)}ms`
    );

    this.assert(
      stats.totalTables > 0,
      'Performance statistiques - données valides',
      'Les statistiques doivent contenir des données'
    );

    console.log(`📈 Calcul statistiques en ${statsTime.toFixed(2)}ms`);
    console.log(`📊 ${stats.totalTables} tables, ${stats.totalSizeMB}MB`);
  }

  /**
   * Test d'isolation des sessions pendant le nettoyage
   */
  async testSessionIsolationDuringCleanup() {
    this.testEnv.reset();
    const manager = this.createManagerWithCleanup();

    console.log('🔒 Test d\'isolation des sessions pendant le nettoyage...');

    // Créer des données pour différentes sessions
    const sessions = ['active-session-1', 'active-session-2', 'old-session-3'];
    const tablesPerSession = 50;

    sessions.forEach((sessionId, sessionIndex) => {
      for (let i = 0; i < tablesPerSession; i++) {
        const isOldSession = sessionIndex === 2;
        const tableData = {
          id: `claraverse_table_${sessionId}_container-${i}_${i}_${Date.now() + i}`,
          html: `<table><tr><td>Session ${sessionId} Table ${i}</td></tr></table>`,
          timestamp: isOldSession ? Date.now() - (30 * 24 * 60 * 60 * 1000) : Date.now(), // Session 3 = 30 jours
          sessionId: sessionId,
          containerId: `container-${i}`,
          metadata: {
            version: '2.0',
            rowCount: 2,
            colCount: 3
          }
        };
        
        this.testEnv.localStorage.set(tableData.id, JSON.stringify(tableData));
      }
    });

    // Simuler que les sessions 1 et 2 sont actives
    manager.getActiveSessionIds = () => ['active-session-1', 'active-session-2'];

    const initialStats = manager.getStorageStatsWithSession();
    console.log(`📊 Avant nettoyage: ${initialStats.totalTables} tables`);

    // Effectuer le nettoyage avec préservation des sessions actives
    const startTime = performance.now();
    const cleanupResults = manager.cleanOldSavesSessionAware(100, true);
    const cleanupTime = performance.now() - startTime;

    const finalStats = manager.getStorageStatsWithSession();

    // Vérifier l'isolation des sessions
    this.assert(
      cleanupResults.details.activeSessionPreserved > 0,
      'Isolation session - sessions actives préservées',
      'Les sessions actives doivent être préservées'
    );

    this.assert(
      cleanupResults.details.inactiveSessionDeleted > 0,
      'Isolation session - sessions inactives supprimées',
      'Les sessions inactives doivent être supprimées'
    );

    // Vérifier que les sessions actives ont encore leurs données
    const session1Count = Object.keys(finalStats.sessionBreakdown)
      .filter(sessionId => sessionId === 'active-session-1').length;
    const session2Count = Object.keys(finalStats.sessionBreakdown)
      .filter(sessionId => sessionId === 'active-session-2').length;

    this.assert(
      session1Count > 0 || finalStats.sessionBreakdown['active-session-1'],
      'Isolation session - session 1 préservée',
      'La session active 1 doit être préservée'
    );

    this.assert(
      session2Count > 0 || finalStats.sessionBreakdown['active-session-2'],
      'Isolation session - session 2 préservée',
      'La session active 2 doit être préservée'
    );

    console.log(`⚡ Nettoyage avec isolation en ${cleanupTime.toFixed(2)}ms`);
    console.log(`📊 Après nettoyage: ${finalStats.totalTables} tables`);
    console.log(`🔒 Sessions préservées: ${cleanupResults.details.activeSessionPreserved}`);
  }

  /**
   * Test d'intégrité des données après nettoyage
   */
  async testDataIntegrityAfterCleanup() {
    this.testEnv.reset();
    const manager = this.createManagerWithCleanup();

    console.log('🛡️ Test d\'intégrité des données après nettoyage...');

    // Créer des données de test avec différents niveaux de qualité
    const testData = [
      // Données valides récentes
      {
        id: 'claraverse_table_session1_container1_0_12345',
        sessionId: 'session1',
        containerId: 'container1',
        timestamp: Date.now(),
        metadata: { version: '2.0', rowCount: 3, colCount: 4 },
        html: '<table><tr><td>Valid Recent Data</td></tr></table>'
      },
      // Données valides anciennes
      {
        id: 'claraverse_table_session1_container1_1_12346',
        sessionId: 'session1',
        containerId: 'container1',
        timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 jours
        metadata: { version: '2.0', rowCount: 2, colCount: 3 },
        html: '<table><tr><td>Valid Old Data</td></tr></table>'
      },
      // Données corrompues
      {
        id: 'claraverse_table_session2_container2_0_12347',
        sessionId: 'session2',
        containerId: 'container2',
        timestamp: Date.now(),
        metadata: { version: '2.0' },
        // HTML manquant - données corrompues
      },
      // Données avec session invalide
      {
        id: 'claraverse_table_invalid_session_container3_0_12348',
        sessionId: '', // Session invalide
        containerId: 'container3',
        timestamp: Date.now(),
        metadata: { version: '2.0', rowCount: 1, colCount: 1 },
        html: '<table><tr><td>Invalid Session</td></tr></table>'
      }
    ];

    // Sauvegarder les données de test
    testData.forEach(data => {
      this.testEnv.localStorage.set(data.id, JSON.stringify(data));
    });

    // Validation avant nettoyage
    const beforeValidation = manager.validateDataIntegrityAcrossSessions();
    console.log(`📊 Avant nettoyage: ${beforeValidation.validSessions}/${beforeValidation.totalSessions} sessions valides`);

    // Détecter les données orphelines
    const orphanedData = manager.detectOrphanedData();
    console.log(`🔍 Données orphelines détectées: ${orphanedData.totalOrphaned}`);

    // Effectuer le nettoyage des données orphelines
    const startTime = performance.now();
    const cleanupResults = manager.cleanupOrphanedData(orphanedData, {
      removeCorrupted: true,
      removeDuplicates: true,
      removeInvalidSessions: true,
      createBackup: true,
      dryRun: false
    });
    const cleanupTime = performance.now() - startTime;

    // Validation après nettoyage
    const afterValidation = manager.validateDataIntegrityAcrossSessions();

    // Vérifier l'amélioration de l'intégrité
    this.assert(
      afterValidation.validSessions >= beforeValidation.validSessions,
      'Intégrité après nettoyage - sessions valides maintenues',
      'Le nombre de sessions valides ne doit pas diminuer'
    );

    this.assert(
      cleanupResults.details.corruptedRemoved > 0,
      'Intégrité après nettoyage - données corrompues supprimées',
      'Les données corrompues doivent être supprimées'
    );

    this.assert(
      cleanupResults.backed_up > 0,
      'Intégrité après nettoyage - sauvegarde créée',
      'Une sauvegarde des données supprimées doit être créée'
    );

    // Vérifier que les données valides sont préservées
    const validDataStillExists = this.testEnv.localStorage.has('claraverse_table_session1_container1_0_12345');
    this.assert(
      validDataStillExists,
      'Intégrité après nettoyage - données valides préservées',
      'Les données valides récentes doivent être préservées'
    );

    // Vérifier les performances
    this.assert(
      cleanupTime < 100, // Moins de 100ms pour ce petit dataset
      'Intégrité après nettoyage - performance acceptable',
      `Nettoyage trop lent: ${cleanupTime.toFixed(2)}ms`
    );

    console.log(`⚡ Nettoyage intégrité en ${cleanupTime.toFixed(2)}ms`);
    console.log(`📊 Après nettoyage: ${afterValidation.validSessions}/${afterValidation.totalSessions} sessions valides`);
    console.log(`🛡️ ${cleanupResults.removed} éléments supprimés, ${cleanupResults.backed_up} sauvegardés`);
  }

  /**
   * Test de performance de détection des données orphelines
   */
  async testOrphanedDataDetectionPerformance() {
    this.testEnv.reset();
    const manager = this.createManagerWithCleanup();

    console.log('🔍 Test de performance de détection des données orphelines...');

    // Créer un dataset mixte avec différents types de problèmes
    const dataTypes = [
      { type: 'valid', count: 500 },
      { type: 'corrupted', count: 50 },
      { type: 'invalid_session', count: 30 },
      { type: 'missing_container', count: 20 },
      { type: 'duplicate', count: 10 }
    ];

    let totalCreated = 0;
    dataTypes.forEach(({ type, count }) => {
      for (let i = 0; i < count; i++) {
        const id = `claraverse_table_${type}_${i}_${Date.now() + i}`;
        let data;

        switch (type) {
          case 'valid':
            data = {
              id: id,
              sessionId: `session-${i % 10}`,
              containerId: `container-${i % 5}`,
              timestamp: Date.now() - (i * 1000),
              metadata: { version: '2.0', rowCount: 2, colCount: 3 },
              html: `<table><tr><td>Valid ${i}</td></tr></table>`
            };
            break;
          case 'corrupted':
            data = `{invalid json for ${id}`;
            break;
          case 'invalid_session':
            data = {
              id: id,
              sessionId: '', // Session invalide
              containerId: `container-${i}`,
              timestamp: Date.now(),
              metadata: { version: '2.0' },
              html: '<table><tr><td>Invalid Session</td></tr></table>'
            };
            break;
          case 'missing_container':
            data = {
              id: id,
              sessionId: `session-${i}`,
              containerId: `nonexistent-container-${i}`,
              timestamp: Date.now(),
              metadata: { version: '2.0' },
              html: '<table><tr><td>Missing Container</td></tr></table>'
            };
            break;
          case 'duplicate':
            data = {
              id: 'duplicate_table_id', // ID dupliqué intentionnellement
              sessionId: `session-${i}`,
              containerId: `container-${i}`,
              timestamp: Date.now() - (i * 1000),
              metadata: { version: '2.0' },
              html: '<table><tr><td>Duplicate</td></tr></table>'
            };
            break;
        }

        if (type === 'corrupted') {
          this.testEnv.localStorage.set(id, data); // Données corrompues
        } else {
          this.testEnv.localStorage.set(id, JSON.stringify(data));
        }
        totalCreated++;
      }
    });

    console.log(`📊 Dataset créé: ${totalCreated} entrées`);

    // Test de performance de détection
    const startDetection = performance.now();
    const orphanedData = manager.detectOrphanedData();
    const detectionTime = performance.now() - startDetection;

    // Vérifier les performances
    this.assert(
      detectionTime < 500, // Moins de 500ms pour ~600 entrées
      'Performance détection orphelines - temps acceptable',
      `Détection trop lente: ${detectionTime.toFixed(2)}ms pour ${totalCreated} entrées`
    );

    // Vérifier la précision de détection
    this.assert(
      orphanedData.corruptedData.length >= 40, // Au moins 80% des données corrompues détectées
      'Performance détection orphelines - données corrompues détectées',
      `Pas assez de données corrompues détectées: ${orphanedData.corruptedData.length}/50`
    );

    this.assert(
      orphanedData.invalidSessions.length >= 24, // Au moins 80% des sessions invalides détectées
      'Performance détection orphelines - sessions invalides détectées',
      `Pas assez de sessions invalides détectées: ${orphanedData.invalidSessions.length}/30`
    );

    this.assert(
      orphanedData.duplicateIds.length >= 8, // Au moins 80% des doublons détectés
      'Performance détection orphelines - doublons détectés',
      `Pas assez de doublons détectés: ${orphanedData.duplicateIds.length}/10`
    );

    // Test de performance de nettoyage
    const startCleanup = performance.now();
    const cleanupResults = manager.cleanupOrphanedData(orphanedData, {
      removeCorrupted: true,
      removeDuplicates: true,
      removeInvalidSessions: true,
      createBackup: false, // Pas de backup pour ce test de performance
      dryRun: false
    });
    const cleanupTime = performance.now() - startCleanup;

    this.assert(
      cleanupTime < 300, // Moins de 300ms pour le nettoyage
      'Performance nettoyage orphelines - temps acceptable',
      `Nettoyage trop lent: ${cleanupTime.toFixed(2)}ms`
    );

    this.assert(
      cleanupResults.removed > 0,
      'Performance nettoyage orphelines - éléments supprimés',
      'Le nettoyage doit supprimer des éléments'
    );

    console.log(`⚡ Détection en ${detectionTime.toFixed(2)}ms, nettoyage en ${cleanupTime.toFixed(2)}ms`);
    console.log(`📊 Détecté: ${orphanedData.totalOrphaned} orphelines, supprimé: ${cleanupResults.removed}`);
  }

  /**
   * Test de nettoyage avec de très gros datasets
   */
  async testLargeDatasetCleanup() {
    this.testEnv.reset();
    const manager = this.createManagerWithCleanup();

    console.log('📈 Test de nettoyage avec gros dataset...');

    // Créer un très gros dataset (simulation de production)
    const largeDatasetSize = 2000;
    const sessionsCount = 50;
    const containersPerSession = 10;

    console.log(`🏗️ Création de ${largeDatasetSize} entrées...`);
    const startSetup = performance.now();

    for (let i = 0; i < largeDatasetSize; i++) {
      const sessionId = `session-${i % sessionsCount}`;
      const containerId = `container-${i % containersPerSession}`;
      const isOld = i % 4 === 0; // 25% de données anciennes
      const isLegacy = i % 10 === 0; // 10% de données legacy

      const tableData = {
        id: `claraverse_table_${sessionId}_${containerId}_${i % 20}_${Date.now() + i}`,
        html: `<table><tr><td>Large Dataset Entry ${i}</td></tr></table>`,
        timestamp: isOld ? Date.now() - (15 * 24 * 60 * 60 * 1000) : Date.now() - (i * 1000),
        sessionId: sessionId,
        containerId: containerId,
        metadata: {
          version: isLegacy ? '1.0' : '2.0',
          rowCount: 2 + (i % 5),
          colCount: 3 + (i % 3),
          contentHash: i * 12345
        }
      };

      this.testEnv.localStorage.set(tableData.id, JSON.stringify(tableData));
    }

    const setupTime = performance.now() - startSetup;
    console.log(`📊 Setup terminé en ${setupTime.toFixed(2)}ms`);

    // Simuler des sessions actives (20% des sessions)
    const activeSessions = [];
    for (let i = 0; i < Math.floor(sessionsCount * 0.2); i++) {
      activeSessions.push(`session-${i}`);
    }
    manager.getActiveSessionIds = () => activeSessions;

    // Test 1: Performance du nettoyage intelligent
    console.log('🧹 Test nettoyage intelligent...');
    const startIntelligentCleanup = performance.now();
    const intelligentResults = manager.cleanOldSavesSessionAware(1000, true);
    const intelligentCleanupTime = performance.now() - startIntelligentCleanup;

    this.assert(
      intelligentCleanupTime < 2000, // Moins de 2 secondes pour 2000 entrées
      'Performance gros dataset - nettoyage intelligent',
      `Nettoyage intelligent trop lent: ${intelligentCleanupTime.toFixed(2)}ms pour ${largeDatasetSize} entrées`
    );

    // Test 2: Performance de détection des orphelines
    console.log('🔍 Test détection orphelines...');
    const startOrphanDetection = performance.now();
    const orphanedData = manager.detectOrphanedData();
    const orphanDetectionTime = performance.now() - startOrphanDetection;

    this.assert(
      orphanDetectionTime < 1000, // Moins d'1 seconde
      'Performance gros dataset - détection orphelines',
      `Détection orphelines trop lente: ${orphanDetectionTime.toFixed(2)}ms`
    );

    // Test 3: Performance des statistiques
    console.log('📈 Test calcul statistiques...');
    const startStats = performance.now();
    const stats = manager.getStorageStatsWithSession();
    const statsTime = performance.now() - startStats;

    this.assert(
      statsTime < 500, // Moins de 500ms
      'Performance gros dataset - statistiques',
      `Calcul statistiques trop lent: ${statsTime.toFixed(2)}ms`
    );

    // Test 4: Validation de l'intégrité
    console.log('🛡️ Test validation intégrité...');
    const startValidation = performance.now();
    const validation = manager.validateDataIntegrityAcrossSessions();
    const validationTime = performance.now() - startValidation;

    this.assert(
      validationTime < 800, // Moins de 800ms
      'Performance gros dataset - validation intégrité',
      `Validation intégrité trop lente: ${validationTime.toFixed(2)}ms`
    );

    // Vérifier les résultats
    this.assert(
      stats.totalTables > 0,
      'Performance gros dataset - données présentes',
      'Des données doivent être présentes après le setup'
    );

    this.assert(
      Object.keys(stats.sessionBreakdown).length > 0,
      'Performance gros dataset - sessions détectées',
      'Des sessions doivent être détectées'
    );

    this.assert(
      validation.totalSessions > 0,
      'Performance gros dataset - validation réussie',
      'La validation doit détecter des sessions'
    );

    console.log(`⚡ Résultats de performance pour ${largeDatasetSize} entrées:`);
    console.log(`  - Setup: ${setupTime.toFixed(2)}ms`);
    console.log(`  - Nettoyage intelligent: ${intelligentCleanupTime.toFixed(2)}ms`);
    console.log(`  - Détection orphelines: ${orphanDetectionTime.toFixed(2)}ms`);
    console.log(`  - Statistiques: ${statsTime.toFixed(2)}ms`);
    console.log(`  - Validation intégrité: ${validationTime.toFixed(2)}ms`);
    console.log(`📊 ${stats.totalTables} tables, ${stats.totalSizeMB}MB, ${validation.totalSessions} sessions`);
  }

  /**
   * Créer un manager pour les tests
   */
  createManager() {
    const testEnv = this.testEnv;
    
    return {
      contextManager: {
        detectCurrentSession: () => testEnv.sessionId,
        getCurrentSessionContext: () => ({
          sessionId: testEnv.sessionId,
          detectionMethod: 'test',
          isTemporary: false,
          startTime: Date.now(),
          lastActivity: Date.now(),
          url: 'https://test.example.com',
          isValid: true
        })
      },

      containerManager: {
        getOrCreateContainerId: () => testEnv.containerId,
        findTableContainer: (table) => testEnv.mockContainers[0] || null,
        getContainerInfo: () => ({
          element: testEnv.mockContainers[0],
          tableCount: testEnv.mockTables.length,
          contentHash: 12345,
          createdAt: Date.now(),
          lastAnalyzed: Date.now()
        })
      },

      migrationManager: {
        isNewFormat: (key) => key.split('_').length >= 6,
        migrateSingleTable: async () => true
      },

      generateRobustTableId(table) {
        try {
          if (!table || !table.querySelector) {
            return null;
          }

          const existingId = table.getAttribute('data-robust-table-id');
          if (existingId) return existingId;

          const sessionId = this.contextManager.detectCurrentSession();
          const containerId = this.containerManager.getOrCreateContainerId(table);
          const contentHash = this.generateContentHash(table);
          
          const tableId = `claraverse_table_${sessionId}_${containerId}_0_${contentHash}`;
          table.setAttribute('data-robust-table-id', tableId);
          
          return tableId;
        } catch (error) {
          return `fallback_${Date.now()}`;
        }
      },

      generateContentHash(table) {
        try {
          if (!table || !table.querySelector) {
            return Math.abs('fallback'.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0));
          }

          const rows = table.querySelectorAll('tr');
          const rowCount = rows.length;
          const firstRow = rows[0];
          const colCount = firstRow ? firstRow.children.length : 0;

          let headerText = '';
          if (firstRow) {
            headerText = Array.from(firstRow.children)
              .map(cell => cell.textContent.trim().slice(0, 20))
              .join('|');
          }

          const signature = `${rowCount}x${colCount}_${headerText}`;
          return Math.abs(signature.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0));
        } catch (error) {
          return Math.abs(`error_${Date.now()}`.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0));
        }
      },

      getTableId(table) {
        const robustId = table.getAttribute('data-robust-table-id');
        if (robustId) return robustId;
        
        return this.generateRobustTableId(table);
      },

      saveTableHTMLNow(table) {
        try {
          if (!table || !table.querySelector) return false;

          const tableId = this.generateRobustTableId(table);
          if (!tableId) return false;

          const sessionContext = this.contextManager.getCurrentSessionContext();
          const containerId = this.containerManager.getOrCreateContainerId(table);

          const saveData = {
            id: tableId,
            html: table.outerHTML,
            timestamp: Date.now(),
            sessionId: sessionContext.sessionId,
            containerId: containerId,
            metadata: {
              rowCount: table.querySelectorAll('tr').length,
              colCount: table.querySelector('tr')?.children.length || 0,
              version: '2.0',
              contentHash: this.generateContentHash(table)
            },
            context: {
              url: 'https://test.example.com',
              userAgent: 'Test Browser',
              sessionStartTime: sessionContext.startTime
            }
          };

          testEnv.localStorage.set(tableId, JSON.stringify(saveData));
          return true;
        } catch (error) {
          return false;
        }
      },

      restoreTableFromStorage(table) {
        try {
          if (!table || !table.querySelector) return false;

          const robustId = this.generateRobustTableId(table);
          let savedDataStr = testEnv.localStorage.get(robustId);
          let isRobustRestore = true;

          if (!savedDataStr) {
            // Fallback vers legacy
            const legacyId = table.getAttribute('data-menu-table-id');
            if (legacyId) {
              savedDataStr = testEnv.localStorage.get(legacyId);
              isRobustRestore = false;
            }
          }

          if (!savedDataStr) return false;

          const savedData = JSON.parse(savedDataStr);

          if (isRobustRestore && savedData.version === '2.0') {
            const validation = this.validateTableContext(savedData);
            // Continue même si validation échoue (avec avertissement)
          }

          // Simuler la restauration du HTML
          table.innerHTML = 'restored content';
          
          if (isRobustRestore) {
            table.setAttribute('data-robust-table-id', robustId);
          }

          return true;
        } catch (error) {
          return false;
        }
      },

      validateTableContext(savedData) {
        try {
          const currentSession = this.contextManager.getCurrentSessionContext();
          
          if (savedData.sessionId && currentSession) {
            if (savedData.sessionId !== currentSession.sessionId) {
              return {
                isValid: true,
                reason: 'Session différente',
                warning: true
              };
            }
          }

          return { isValid: true, reason: 'Validation réussie' };
        } catch (error) {
          return { 
            isValid: true, 
            reason: 'Erreur validation, autorisation par défaut',
            warning: true 
          };
        }
      },

      createEnhancedMetadata(table, tableId) {
        try {
          const sessionContext = this.contextManager.getCurrentSessionContext();
          const containerId = this.containerManager.getOrCreateContainerId(table);

          return {
            id: tableId,
            sessionId: sessionContext.sessionId,
            containerId: containerId,
            rowCount: table.querySelectorAll('tr').length,
            colCount: table.querySelector('tr')?.children.length || 0,
            hasHeaders: this.detectTableHeaders(table),
            contentHash: this.generateContentHash(table),
            headerSignature: this.extractHeaderSignature(table),
            dataSignature: this.extractDataSignature(table),
            version: '2.0',
            createdAt: Date.now(),
            lastModified: Date.now(),
            sessionContext: sessionContext,
            pageContext: {
              url: 'https://test.example.com',
              title: 'Test Page',
              userAgent: 'Test Browser',
              timestamp: Date.now()
            }
          };
        } catch (error) {
          return {
            id: tableId,
            version: '2.0',
            error: error.message,
            timestamp: Date.now()
          };
        }
      },

      detectTableHeaders(table) {
        try {
          const firstRow = table.querySelector('tr');
          if (!firstRow) return false;
          
          // Simulation simple - vrai si le contenu contient "Header"
          return firstRow.textContent.includes('Header');
        } catch (error) {
          return false;
        }
      },

      extractHeaderSignature(table) {
        try {
          const firstRow = table.querySelector('tr');
          if (!firstRow) return '';

          return Array.from(firstRow.children)
            .map(cell => cell.textContent.trim().slice(0, 20))
            .join('|').slice(0, 200);
        } catch (error) {
          return '';
        }
      },

      extractDataSignature(table) {
        try {
          const rows = table.querySelectorAll('tr');
          const dataRows = Array.from(rows).slice(1, 4);
          
          return dataRows.map(row => 
            Array.from(row.children)
              .map(cell => cell.textContent.trim().slice(0, 10))
              .join('')
          ).join('_').slice(0, 150);
        } catch (error) {
          return '';
        }
      },

      validateOperationContext(table, operation = 'unknown') {
        try {
          const validation = {
            isValid: true,
            warnings: [],
            errors: [],
            context: {
              operation: operation,
              timestamp: Date.now(),
              tableId: table.getAttribute('data-robust-table-id') || 'unknown'
            }
          };

          if (!table.querySelector('tr')) {
            validation.errors.push('Table sans lignes détectées');
            validation.isValid = false;
          }

          return validation;
        } catch (error) {
          return {
            isValid: false,
            errors: [`Erreur validation: ${error.message}`],
            warnings: [],
            context: { operation, timestamp: Date.now(), error: error.message }
          };
        }
      },

      trackTableRelationships(containerId) {
        try {
          const relationships = {
            containerId: containerId,
            tableCount: testEnv.mockTables.length,
            tables: [],
            relationships: [],
            timestamp: Date.now()
          };

          testEnv.mockTables.forEach((table, index) => {
            const tableId = table.getAttribute('data-robust-table-id') || `table_${index}`;
            const metadata = this.createEnhancedMetadata(table, tableId);
            
            relationships.tables.push({
              id: tableId,
              position: index,
              rowCount: metadata.rowCount,
              colCount: metadata.colCount,
              headerSignature: metadata.headerSignature,
              contentHash: metadata.contentHash
            });
          });

          return relationships;
        } catch (error) {
          return null;
        }
      },

      analyzeTableRelation(table1, table2) {
        try {
          if (table1.colCount === table2.colCount && 
              Math.abs(table1.rowCount - table2.rowCount) <= 2) {
            
            const headerSimilarity = this.calculateStringSimilarity(
              table1.headerSignature, 
              table2.headerSignature
            );
            
            if (headerSimilarity > 0.8) {
              return {
                type: 'similar_structure',
                confidence: headerSimilarity,
                details: 'Tables avec structure et en-têtes similaires'
              };
            }
          }

          if (Math.abs(table1.position - table2.position) === 1) {
            return {
              type: 'adjacent',
              confidence: 0.7,
              details: 'Tables adjacentes dans le conteneur'
            };
          }

          return { type: 'none', confidence: 0, details: 'Aucune relation détectée' };
        } catch (error) {
          return { type: 'error', confidence: 0, details: error.message };
        }
      },

      calculateStringSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        if (str1 === str2) return 1;

        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1;

        const editDistance = this.calculateLevenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
      },

      calculateLevenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
          matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
          matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
          for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
            }
          }
        }

        return matrix[str2.length][str1.length];
      }
    };
  }

  /**
   * Créer un manager avec fonctionnalités de nettoyage pour les tests de performance
   */
  createManagerWithCleanup() {
    const baseManager = this.createManager();
    const testEnv = this.testEnv;

    // Étendre le manager de base avec les fonctionnalités de nettoyage
    return {
      ...baseManager,

      // Méthodes de nettoyage intelligent
      cleanOldSavesSessionAware(keepCount = 10, preserveActiveSessions = true) {
        const results = {
          deleted: 0,
          preserved: 0,
          errors: 0,
          details: {
            corruptedDeleted: 0,
            oldFormatDeleted: 0,
            inactiveSessionDeleted: 0,
            oldDataDeleted: 0,
            activeSessionPreserved: 0,
            currentSessionPreserved: 0
          }
        };

        try {
          const saves = [];
          const activeSessionIds = this.getActiveSessionIds();

          // Collecter toutes les sauvegardes
          for (const [key, value] of testEnv.localStorage.entries()) {
            if (key.startsWith('claraverse_table_')) {
              try {
                const data = JSON.parse(value);
                saves.push({
                  key,
                  data,
                  sessionId: data.sessionId || 'unknown',
                  timestamp: data.timestamp || 0,
                  isActiveSession: activeSessionIds.includes(data.sessionId),
                  version: data.metadata?.version || '1.0'
                });
              } catch (error) {
                // Données corrompues
                testEnv.localStorage.delete(key);
                results.deleted++;
                results.details.corruptedDeleted++;
              }
            }
          }

          // Appliquer la stratégie de nettoyage
          if (preserveActiveSessions) {
            const activeSaves = saves.filter(save => save.isActiveSession);
            const inactiveSaves = saves.filter(save => !save.isActiveSession);

            results.preserved += activeSaves.length;
            results.details.activeSessionPreserved += activeSaves.length;

            // Trier les inactives par timestamp et garder les plus récentes
            inactiveSaves.sort((a, b) => b.timestamp - a.timestamp);
            const inactivesToKeep = Math.max(0, keepCount - activeSaves.length);
            const inactivesToDelete = inactiveSaves.slice(inactivesToKeep);

            inactivesToDelete.forEach(save => {
              testEnv.localStorage.delete(save.key);
              results.deleted++;
              if (save.version === '1.0') {
                results.details.oldFormatDeleted++;
              } else {
                results.details.inactiveSessionDeleted++;
              }
            });

            results.preserved += Math.min(inactiveSaves.length, inactivesToKeep);
          } else {
            // Nettoyage simple par timestamp
            saves.sort((a, b) => b.timestamp - a.timestamp);
            const toDelete = saves.slice(keepCount);

            toDelete.forEach(save => {
              testEnv.localStorage.delete(save.key);
              results.deleted++;
              results.details.oldDataDeleted++;
            });

            results.preserved = Math.min(saves.length, keepCount);
          }

          return results;
        } catch (error) {
          results.errors++;
          return results;
        }
      },

      // Détection des données orphelines
      detectOrphanedData() {
        const orphanedData = {
          invalidSessions: [],
          missingContainers: [],
          corruptedData: [],
          duplicateIds: [],
          inconsistentData: [],
          totalOrphaned: 0
        };

        const seenIds = new Set();

        for (const [key, value] of testEnv.localStorage.entries()) {
          if (key.startsWith('claraverse_table_')) {
            try {
              const data = JSON.parse(value);
              
              // Vérifier les doublons
              if (seenIds.has(data.id)) {
                orphanedData.duplicateIds.push({ key, data });
              } else {
                seenIds.add(data.id);
              }

              // Vérifier les sessions invalides
              if (!data.sessionId || data.sessionId.trim() === '') {
                orphanedData.invalidSessions.push({ key, data, reason: 'Session ID manquant' });
              }

              // Vérifier les conteneurs manquants (simulation)
              if (data.containerId && data.containerId.includes('nonexistent')) {
                orphanedData.missingContainers.push({ key, data, reason: 'Conteneur introuvable' });
              }

              // Vérifier la cohérence des données
              if (!data.html || !data.timestamp) {
                orphanedData.inconsistentData.push({ 
                  key, 
                  data, 
                  reason: 'Données incomplètes',
                  issues: [
                    !data.html ? 'HTML manquant' : null,
                    !data.timestamp ? 'Timestamp manquant' : null
                  ].filter(Boolean)
                });
              }

            } catch (error) {
              orphanedData.corruptedData.push({
                key,
                error: error.message,
                rawData: value.substring(0, 100) + '...'
              });
            }
          }
        }

        orphanedData.totalOrphaned = 
          orphanedData.invalidSessions.length +
          orphanedData.missingContainers.length +
          orphanedData.corruptedData.length +
          orphanedData.duplicateIds.length +
          orphanedData.inconsistentData.length;

        return orphanedData;
      },

      // Nettoyage des données orphelines
      cleanupOrphanedData(orphanedData, options = {}) {
        const results = {
          removed: 0,
          backed_up: 0,
          errors: 0,
          details: {
            corruptedRemoved: 0,
            duplicatesRemoved: 0,
            invalidSessionsRemoved: 0,
            missingContainersRemoved: 0,
            inconsistentDataRemoved: 0
          },
          backupKeys: []
        };

        try {
          // Créer des sauvegardes si demandé
          if (options.createBackup) {
            const backupTimestamp = Date.now();
            const allOrphaned = [
              ...orphanedData.corruptedData,
              ...orphanedData.duplicateIds,
              ...orphanedData.invalidSessions,
              ...orphanedData.missingContainers,
              ...orphanedData.inconsistentData
            ];

            allOrphaned.forEach((item, index) => {
              const backupKey = `claraverse_orphan_backup_${backupTimestamp}_${index}`;
              const backupData = {
                originalKey: item.key,
                reason: item.reason || 'Non spécifié',
                timestamp: backupTimestamp,
                originalData: item.data || item.rawData
              };
              testEnv.localStorage.set(backupKey, JSON.stringify(backupData));
              results.backed_up++;
              results.backupKeys.push(backupKey);
            });
          }

          // Supprimer les données corrompues
          if (options.removeCorrupted) {
            orphanedData.corruptedData.forEach(item => {
              if (!options.dryRun) {
                testEnv.localStorage.delete(item.key);
              }
              results.removed++;
              results.details.corruptedRemoved++;
            });
          }

          // Supprimer les doublons
          if (options.removeDuplicates) {
            orphanedData.duplicateIds.forEach(item => {
              if (!options.dryRun) {
                testEnv.localStorage.delete(item.key);
              }
              results.removed++;
              results.details.duplicatesRemoved++;
            });
          }

          // Supprimer les sessions invalides
          if (options.removeInvalidSessions) {
            orphanedData.invalidSessions.forEach(item => {
              if (!options.dryRun) {
                testEnv.localStorage.delete(item.key);
              }
              results.removed++;
              results.details.invalidSessionsRemoved++;
            });
          }

          // Supprimer les conteneurs manquants
          if (options.removeMissingContainers) {
            orphanedData.missingContainers.forEach(item => {
              if (!options.dryRun) {
                testEnv.localStorage.delete(item.key);
              }
              results.removed++;
              results.details.missingContainersRemoved++;
            });
          }

          // Supprimer les données incohérentes
          if (options.removeInconsistentData) {
            orphanedData.inconsistentData.forEach(item => {
              if (!options.dryRun) {
                testEnv.localStorage.delete(item.key);
              }
              results.removed++;
              results.details.inconsistentDataRemoved++;
            });
          }

          return results;
        } catch (error) {
          results.errors++;
          return results;
        }
      },

      // Statistiques avec session
      getStorageStatsWithSession() {
        const stats = {
          totalTables: 0,
          totalSize: 0,
          totalSizeMB: 0,
          sessionBreakdown: {},
          versionBreakdown: {},
          containerBreakdown: {},
          quotaUsageRatio: 0
        };

        for (const [key, value] of testEnv.localStorage.entries()) {
          if (key.startsWith('claraverse_table_')) {
            const itemSize = (key.length + value.length) * 2;
            stats.totalTables++;
            stats.totalSize += itemSize;

            try {
              const data = JSON.parse(value);
              const sessionId = data.sessionId || 'unknown';
              const version = data.metadata?.version || '1.0';
              const containerId = data.containerId || 'no-container';

              // Session breakdown
              if (!stats.sessionBreakdown[sessionId]) {
                stats.sessionBreakdown[sessionId] = { tableCount: 0, totalSize: 0 };
              }
              stats.sessionBreakdown[sessionId].tableCount++;
              stats.sessionBreakdown[sessionId].totalSize += itemSize;

              // Version breakdown
              if (!stats.versionBreakdown[version]) {
                stats.versionBreakdown[version] = { count: 0, size: 0 };
              }
              stats.versionBreakdown[version].count++;
              stats.versionBreakdown[version].size += itemSize;

              // Container breakdown
              if (!stats.containerBreakdown[containerId]) {
                stats.containerBreakdown[containerId] = { count: 0, size: 0 };
              }
              stats.containerBreakdown[containerId].count++;
              stats.containerBreakdown[containerId].size += itemSize;

            } catch (error) {
              // Données corrompues - compter quand même
            }
          }
        }

        stats.totalSizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
        stats.quotaUsageRatio = Math.min(stats.totalSize / (5 * 1024 * 1024), 1); // Estimation 5MB quota

        return stats;
      },

      // Validation de l'intégrité inter-sessions
      validateDataIntegrityAcrossSessions() {
        const validation = {
          totalSessions: 0,
          validSessions: 0,
          invalidSessions: 0,
          crossSessionConflicts: [],
          sessionStats: new Map()
        };

        const sessionData = new Map();

        // Collecter les données par session
        for (const [key, value] of testEnv.localStorage.entries()) {
          if (key.startsWith('claraverse_table_')) {
            try {
              const data = JSON.parse(value);
              const sessionId = data.sessionId || 'unknown';

              if (!sessionData.has(sessionId)) {
                sessionData.set(sessionId, {
                  sessionId,
                  tables: [],
                  totalSize: 0,
                  oldestTimestamp: Infinity,
                  newestTimestamp: 0
                });
              }

              const session = sessionData.get(sessionId);
              session.tables.push({ key, data });
              session.totalSize += value.length;
              session.oldestTimestamp = Math.min(session.oldestTimestamp, data.timestamp || 0);
              session.newestTimestamp = Math.max(session.newestTimestamp, data.timestamp || 0);

            } catch (error) {
              // Ignorer les données corrompues pour cette analyse
            }
          }
        }

        validation.totalSessions = sessionData.size;

        // Valider chaque session
        sessionData.forEach((session, sessionId) => {
          const isValid = session.sessionId !== 'unknown' && session.tables.length > 0;
          if (isValid) {
            validation.validSessions++;
          } else {
            validation.invalidSessions++;
          }

          validation.sessionStats.set(sessionId, {
            isValid,
            tableCount: session.tables.length,
            totalSize: session.totalSize
          });
        });

        return validation;
      },

      // Obtenir les IDs de sessions actives (mock pour les tests)
      getActiveSessionIds() {
        return ['session-0', 'session-1', 'session-2']; // Sessions actives par défaut
      },

      // Validation d'un ID de session
      validateSessionId(sessionId) {
        return sessionId && typeof sessionId === 'string' && sessionId.trim() !== '';
      }
    };
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
    console.log('\n📊 Résultats des tests Enhanced Storage Manager:');
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

    return {
      passed: this.passedTests,
      failed: this.failedTests,
      total: this.passedTests + this.failedTests,
      successRate: ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)
    };
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnhancedStorageManagerTests, EnhancedStorageTestEnvironment };
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  window.EnhancedStorageManagerTests = EnhancedStorageManagerTests;
  
  // Fonction pour exécuter les tests
  window.runEnhancedStorageTests = async () => {
    const tests = new EnhancedStorageManagerTests();
    await tests.runAllTests();
    return tests;
  };
  
  console.log('🧪 Tests Enhanced Storage Manager chargés. Utilisez runEnhancedStorageTests() pour les exécuter.');
}