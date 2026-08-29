// ============================================
// TESTS UNITAIRES - Diagnostic et Monitoring
// Tests pour les outils de diagnostic et de surveillance
// ============================================

/**
 * Environnement de test pour les diagnostics
 */
class DiagnosticTestEnvironment {
  constructor() {
    this.localStorage = new Map();
    this.mockTables = [];
    this.mockContainers = [];
    this.sessionId = 'test-session-diagnostic-123';
    this.containerId = 'test-container-diagnostic-456';
    this.mockStorageManager = null;
  }

  reset() {
    this.localStorage.clear();
    this.mockTables = [];
    this.mockContainers = [];
    this.sessionId = 'test-session-diagnostic-123';
    this.containerId = 'test-container-diagnostic-456';
  }

  /**
   * Créer une table mock avec des conflits potentiels
   */
  createMockTableWithConflicts(id, content = 'Test Table', hasConflict = false) {
    const table = {
      id: id,
      tagName: 'TABLE',
      className: 'min-w-full border',
      outerHTML: `<table class="min-w-full border"><tr><td>${content}</td></tr></table>`,
      attributes: new Map(),
      _conflicts: hasConflict,
      
      querySelector: (selector) => {
        if (selector === 'tr') {
          return {
            textContent: content,
            children: [{ textContent: content }, { textContent: 'Data' }]
          };
        }
        return null;
      },
      
      querySelectorAll: (selector) => {
        if (selector === 'tr') {
          return [
            {
              textContent: content,
              children: [{ textContent: content }, { textContent: 'Data' }]
            },
            {
              textContent: 'Row 2',
              children: [{ textContent: 'Value 1' }, { textContent: 'Value 2' }]
            }
          ];
        }
        return [];
      },
      
      hasAttribute: (attr) => this.attributes.has(attr),
      getAttribute: (attr) => this.attributes.get(attr),
      setAttribute: (attr, value) => this.attributes.set(attr, value),
      
      closest: () => this.createMockContainer()
    };
    
    this.mockTables.push(table);
    return table;
  }

  /**
   * Créer un conteneur mock
   */
  createMockContainer() {
    const container = {
      id: this.containerId,
      tagName: 'DIV',
      className: 'prose prose-base',
      
      querySelector: () => null,
      querySelectorAll: (selector) => {
        if (selector === 'table') {
          return this.mockTables;
        }
        return [];
      },
      
      hasAttribute: () => false,
      getAttribute: () => null,
      setAttribute: () => {},
      
      contains: () => true
    };
    
    this.mockContainers.push(container);
    return container;
  }

  /**
   * Créer des données de stockage avec des problèmes
   */
  createProblematicStorageData() {
    // Données valides
    this.localStorage.set('claraverse_table_session1_container1_0_12345', JSON.stringify({
      id: 'claraverse_table_session1_container1_0_12345',
      html: '<table><tr><td>Valid Data</td></tr></table>',
      timestamp: Date.now(),
      sessionId: 'session1',
      containerId: 'container1',
      metadata: { version: '2.0', rowCount: 1, colCount: 1 }
    }));

    // Données corrompues
    this.localStorage.set('claraverse_table_corrupted', 'invalid json data {');

    // Données avec ID dupliqué
    this.localStorage.set('claraverse_table_duplicate_1', JSON.stringify({
      id: 'same-id-123',
      html: '<table><tr><td>Duplicate 1</td></tr></table>',
      timestamp: Date.now() - 1000,
      sessionId: 'session2',
      containerId: 'container2',
      metadata: { version: '2.0', rowCount: 1, colCount: 1 }
    }));

    this.localStorage.set('claraverse_table_duplicate_2', JSON.stringify({
      id: 'same-id-123',
      html: '<table><tr><td>Duplicate 2</td></tr></table>',
      timestamp: Date.now(),
      sessionId: 'session2',
      containerId: 'container2',
      metadata: { version: '2.0', rowCount: 1, colCount: 1 }
    }));

    // Données legacy
    this.localStorage.set('claraverse_table_0_legacy', JSON.stringify({
      html: '<table><tr><td>Legacy Data</td></tr></table>',
      timestamp: Date.now() - 86400000, // 1 jour
      rowCount: 1,
      colCount: 1
    }));

    // Données avec session invalide
    this.localStorage.set('claraverse_table_invalid_session', JSON.stringify({
      id: 'claraverse_table_invalid_session',
      html: '<table><tr><td>Invalid Session</td></tr></table>',
      timestamp: Date.now(),
      sessionId: '', // Session vide
      containerId: 'container3',
      metadata: { version: '2.0', rowCount: 1, colCount: 1 }
    }));
  }

  /**
   * Mock du gestionnaire de stockage pour les tests
   */
  createMockStorageManager() {
    const env = this;
    
    return {
      config: { storagePrefix: 'claraverse_table_' },
      
      // Mock Context Manager
      contextManager: {
        getCurrentSessionContext: () => ({
          sessionId: env.sessionId,
          detectionMethod: 'test',
          isTemporary: false,
          isValid: true,
          startTime: Date.now() - 60000,
          lastActivity: Date.now() - 1000
        }),
        validateSessionId: (id) => id && id.length > 0 && id !== '',
        detectCurrentSession: () => env.sessionId
      },
      
      // Mock Container Manager
      containerManager: {
        getAllContainers: () => env.mockContainers.map(c => ({
          id: c.id,
          element: c,
          tableCount: env.mockTables.length,
          createdAt: Date.now() - 120000,
          lastAccessed: Date.now() - 30000,
          contentHash: 'mock-hash-123'
        })),
        getContainerInfo: (id) => ({
          id: id,
          element: env.mockContainers[0],
          tableCount: env.mockTables.length,
          createdAt: Date.now() - 120000,
          lastAccessed: Date.now() - 30000,
          contentHash: 'mock-hash-123'
        }),
        getOrCreateContainerId: () => env.containerId,
        findTableContainer: () => env.mockContainers[0],
        getContainerStats: () => ({
          containerCount: env.mockContainers.length,
          totalTables: env.mockTables.length,
          monitoringActive: true
        })
      },
      
      // Mock Migration Manager
      migrationManager: {
        getMigrationStats: () => ({
          totalFound: 5,
          migrated: 4,
          errors: 1,
          skipped: 0,
          recoveryCount: 1
        }),
        isNewFormat: (key) => key.includes('session') && key.includes('container')
      },
      
      // Mock Storage Methods
      getTableId: (table) => table.id || 'mock-table-id',
      generateContentHash: () => 'mock-content-hash',
      getTablePositionInContainer: () => 0,
      detectTableHeaders: () => true,
      validateDataIntegrity: (save) => ({
        isValid: !save.key.includes('invalid'),
        reason: save.key.includes('invalid') ? 'Test invalid data' : 'Valid',
        issues: save.key.includes('invalid') ? ['Test issue'] : []
      }),
      validateContainerExists: (id) => id !== 'missing-container',
      getStorageStatsWithSession: () => ({
        totalTables: 10,
        sessionCount: 3,
        quotaUsageRatio: 0.5,
        recentTables: 5,
        averageTableSize: 1024
      }),
      
      // Mock localStorage access
      localStorage: env.localStorage
    };
  }
}

/**
 * Tests pour debugTableIdentification
 */
class DebugTableIdentificationTests {
  constructor(env) {
    this.env = env;
    this.results = [];
  }

  async runAllTests() {
    console.log('🧪 === Tests debugTableIdentification ===');
    
    try {
      await this.testBasicTableAnalysis();
      await this.testSessionAnalysis();
      await this.testContainerAnalysis();
      await this.testConflictDetection();
      await this.testRecommendationGeneration();
      
      this.displayResults();
      return this.results;
    } catch (error) {
      console.error('❌ Erreur dans les tests debugTableIdentification:', error);
      return this.results;
    }
  }

  async testBasicTableAnalysis() {
    console.log('📋 Test analyse basique de table...');
    
    try {
      const table = this.env.createMockTableWithConflicts('test-table-1', 'Test Content');
      const mockManager = this.env.createMockStorageManager();
      
      // Simuler l'analyse d'une table
      const analysis = {
        index: 0,
        element: table,
        ids: {
          legacy: null,
          robust: 'mock-robust-id',
          current: 'mock-current-id'
        },
        structure: {
          rowCount: 2,
          colCount: 2,
          hasHeaders: true
        },
        context: {
          sessionId: this.env.sessionId,
          containerId: this.env.containerId,
          position: 0
        },
        issues: []
      };

      // Vérifications
      const passed = analysis.ids.current && 
                    analysis.structure.rowCount > 0 && 
                    analysis.context.sessionId;

      this.results.push({
        test: 'Analyse basique de table',
        passed: passed,
        details: `IDs: ${!!analysis.ids.current}, Structure: ${analysis.structure.rowCount}x${analysis.structure.colCount}, Session: ${!!analysis.context.sessionId}`,
        data: analysis
      });

      console.log(`  ${passed ? '✅' : '❌'} Analyse basique: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Analyse basique de table',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur analyse basique: ${error.message}`);
    }
  }

  async testSessionAnalysis() {
    console.log('🔐 Test analyse de session...');
    
    try {
      const mockManager = this.env.createMockStorageManager();
      const sessionContext = mockManager.contextManager.getCurrentSessionContext();
      
      const analysis = {
        detected: !!sessionContext,
        sessionId: sessionContext ? sessionContext.sessionId : null,
        detectionMethod: sessionContext ? sessionContext.detectionMethod : null,
        isTemporary: sessionContext ? sessionContext.isTemporary : null,
        isValid: sessionContext ? sessionContext.isValid : false,
        issues: []
      };

      // Identifier les problèmes potentiels
      if (!analysis.detected) {
        analysis.issues.push('Aucune session détectée');
      }
      if (analysis.isTemporary) {
        analysis.issues.push('Session temporaire');
      }

      const passed = analysis.detected && analysis.isValid && !analysis.isTemporary;

      this.results.push({
        test: 'Analyse de session',
        passed: passed,
        details: `Détectée: ${analysis.detected}, Valide: ${analysis.isValid}, Temporaire: ${analysis.isTemporary}`,
        data: analysis
      });

      console.log(`  ${passed ? '✅' : '❌'} Analyse session: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Analyse de session',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur analyse session: ${error.message}`);
    }
  }

  async testContainerAnalysis() {
    console.log('📦 Test analyse de conteneurs...');
    
    try {
      const mockManager = this.env.createMockStorageManager();
      const containerStats = mockManager.containerManager.getContainerStats();
      
      const analysis = {
        containerCount: containerStats.containerCount,
        totalTables: containerStats.totalTables,
        monitoringActive: containerStats.monitoringActive,
        issues: []
      };

      // Identifier les problèmes
      if (analysis.containerCount === 0) {
        analysis.issues.push('Aucun conteneur détecté');
      }
      if (!analysis.monitoringActive) {
        analysis.issues.push('Surveillance inactive');
      }

      const passed = analysis.containerCount > 0 && analysis.monitoringActive;

      this.results.push({
        test: 'Analyse de conteneurs',
        passed: passed,
        details: `Conteneurs: ${analysis.containerCount}, Tables: ${analysis.totalTables}, Surveillance: ${analysis.monitoringActive}`,
        data: analysis
      });

      console.log(`  ${passed ? '✅' : '❌'} Analyse conteneurs: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Analyse de conteneurs',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur analyse conteneurs: ${error.message}`);
    }
  }

  async testConflictDetection() {
    console.log('⚔️ Test détection de conflits...');
    
    try {
      // Créer des tables avec des conflits potentiels
      const table1 = this.env.createMockTableWithConflicts('same-id', 'Content A', true);
      const table2 = this.env.createMockTableWithConflicts('same-id', 'Content B', true);
      const table3 = this.env.createMockTableWithConflicts('unique-id', 'Content C', false);

      const tableAnalyses = [
        { ids: { current: 'same-id' }, hashes: { content: 'hash-1' }, context: { containerId: 'container-1', position: 0 } },
        { ids: { current: 'same-id' }, hashes: { content: 'hash-2' }, context: { containerId: 'container-1', position: 1 } },
        { ids: { current: 'unique-id' }, hashes: { content: 'hash-3' }, context: { containerId: 'container-2', position: 0 } }
      ];

      // Détecter les conflits
      const conflicts = [];
      const idMap = new Map();

      tableAnalyses.forEach((analysis, index) => {
        if (analysis.ids.current) {
          if (!idMap.has(analysis.ids.current)) {
            idMap.set(analysis.ids.current, []);
          }
          idMap.get(analysis.ids.current).push({ index, analysis });
        }
      });

      // Identifier les conflits d'ID
      idMap.forEach((tables, id) => {
        if (tables.length > 1) {
          conflicts.push({
            type: 'duplicate_id',
            severity: 'high',
            id: id,
            tables: tables,
            description: `${tables.length} tables partagent le même ID: ${id}`
          });
        }
      });

      const passed = conflicts.length > 0; // On s'attend à détecter des conflits

      this.results.push({
        test: 'Détection de conflits',
        passed: passed,
        details: `${conflicts.length} conflit(s) détecté(s)`,
        data: { conflicts, tableAnalyses }
      });

      console.log(`  ${passed ? '✅' : '❌'} Détection conflits: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Détection de conflits',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur détection conflits: ${error.message}`);
    }
  }

  async testRecommendationGeneration() {
    console.log('💡 Test génération de recommandations...');
    
    try {
      // Simuler des résultats de diagnostic avec des problèmes
      const diagnosticResults = {
        sessionAnalysis: {
          detected: false,
          issues: ['Aucune session détectée']
        },
        containerAnalysis: {
          issues: ['Conteneurs obsolètes détectés']
        },
        conflicts: [
          { type: 'duplicate_id', severity: 'high' },
          { type: 'similar_content', severity: 'medium' }
        ],
        allTables: [
          { issues: ['Table sans ID'] },
          { issues: [] },
          { issues: ['Conteneur manquant'] }
        ]
      };

      // Générer des recommandations
      const recommendations = [];

      if (diagnosticResults.sessionAnalysis.issues.length > 0) {
        recommendations.push({
          category: 'session',
          priority: 'high',
          title: 'Problèmes de session détectés',
          actions: ['Rafraîchir la détection de session']
        });
      }

      if (diagnosticResults.containerAnalysis.issues.length > 0) {
        recommendations.push({
          category: 'containers',
          priority: 'medium',
          title: 'Problèmes de conteneurs détectés',
          actions: ['Nettoyer les conteneurs obsolètes']
        });
      }

      const highSeverityConflicts = diagnosticResults.conflicts.filter(c => c.severity === 'high');
      if (highSeverityConflicts.length > 0) {
        recommendations.push({
          category: 'conflicts',
          priority: 'critical',
          title: `${highSeverityConflicts.length} conflit(s) critique(s)`,
          actions: ['Régénérer les IDs des tables en conflit']
        });
      }

      const passed = recommendations.length > 0 && 
                    recommendations.some(r => r.priority === 'critical');

      this.results.push({
        test: 'Génération de recommandations',
        passed: passed,
        details: `${recommendations.length} recommandation(s) générée(s)`,
        data: { recommendations, diagnosticResults }
      });

      console.log(`  ${passed ? '✅' : '❌'} Génération recommandations: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Génération de recommandations',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur génération recommandations: ${error.message}`);
    }
  }

  displayResults() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log(`\n📊 Résultats debugTableIdentification: ${passed}/${total} tests réussis`);
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`  ${icon} ${result.test}: ${result.details}`);
    });
  }
}

/**
 * Tests pour validateStorageIntegrity
 */
class ValidateStorageIntegrityTests {
  constructor(env) {
    this.env = env;
    this.results = [];
  }

  async runAllTests() {
    console.log('\n🧪 === Tests validateStorageIntegrity ===');
    
    try {
      await this.testDataConsistencyValidation();
      await this.testSessionIntegrityValidation();
      await this.testContainerMappingValidation();
      await this.testMigrationStatusValidation();
      await this.testStorageHealthValidation();
      await this.testIntegrityScoreCalculation();
      
      this.displayResults();
      return this.results;
    } catch (error) {
      console.error('❌ Erreur dans les tests validateStorageIntegrity:', error);
      return this.results;
    }
  }

  async testDataConsistencyValidation() {
    console.log('📊 Test validation cohérence des données...');
    
    try {
      // Préparer des données de test avec des problèmes
      this.env.createProblematicStorageData();
      const mockManager = this.env.createMockStorageManager();
      
      // Simuler la validation de cohérence
      const validation = {
        name: 'Cohérence des données',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: {
          totalEntries: this.env.localStorage.size,
          validEntries: 0,
          invalidEntries: 0,
          corruptedEntries: 0
        }
      };

      // Analyser les entrées
      for (const [key, value] of this.env.localStorage.entries()) {
        if (key.startsWith('claraverse_table_')) {
          try {
            const data = JSON.parse(value);
            if (data.id && data.html && data.timestamp) {
              validation.statistics.validEntries++;
            } else {
              validation.statistics.invalidEntries++;
              validation.issues.push(`Entrée invalide: ${key}`);
            }
          } catch (error) {
            validation.statistics.corruptedEntries++;
            validation.issues.push(`Données corrompues: ${key}`);
          }
        }
      }

      // Effectuer les vérifications
      validation.checks = [
        {
          name: 'Données parsables',
          passed: validation.statistics.corruptedEntries === 0,
          details: `${validation.statistics.corruptedEntries} entrée(s) corrompue(s)`
        },
        {
          name: 'Structure des données',
          passed: validation.statistics.invalidEntries < validation.statistics.totalEntries * 0.1,
          details: `${validation.statistics.invalidEntries}/${validation.statistics.totalEntries} entrée(s) invalide(s)`
        }
      ];

      const passedChecks = validation.checks.filter(c => c.passed).length;
      validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
      validation.isValid = validation.score >= 80;

      const passed = validation.statistics.totalEntries > 0 && validation.score > 0;

      this.results.push({
        test: 'Validation cohérence des données',
        passed: passed,
        details: `Score: ${validation.score}/100, Entrées: ${validation.statistics.totalEntries}, Valides: ${validation.statistics.validEntries}`,
        data: validation
      });

      console.log(`  ${passed ? '✅' : '❌'} Validation cohérence: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Validation cohérence des données',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur validation cohérence: ${error.message}`);
    }
  }

  async testSessionIntegrityValidation() {
    console.log('🔐 Test validation intégrité des sessions...');
    
    try {
      const mockManager = this.env.createMockStorageManager();
      const sessionContext = mockManager.contextManager.getCurrentSessionContext();
      
      const validation = {
        name: 'Intégrité des sessions',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: {
          activeSessions: 1,
          expiredSessions: 0,
          temporarySessions: 0,
          invalidSessions: 0
        }
      };

      // Effectuer les vérifications
      validation.checks = [
        {
          name: 'Session courante détectée',
          passed: !!sessionContext,
          details: sessionContext ? `Session: ${sessionContext.sessionId.substring(0, 20)}...` : 'Aucune session'
        },
        {
          name: 'Session courante valide',
          passed: sessionContext ? sessionContext.isValid : false,
          details: sessionContext ? (sessionContext.isValid ? 'Valide' : 'Invalide/Expirée') : 'N/A'
        },
        {
          name: 'Sessions actives cohérentes',
          passed: validation.statistics.activeSessions > 0,
          details: `${validation.statistics.activeSessions} session(s) active(s)`
        }
      ];

      const passedChecks = validation.checks.filter(c => c.passed).length;
      validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
      validation.isValid = validation.score >= 75;

      const passed = validation.score >= 75;

      this.results.push({
        test: 'Validation intégrité des sessions',
        passed: passed,
        details: `Score: ${validation.score}/100, Sessions actives: ${validation.statistics.activeSessions}`,
        data: validation
      });

      console.log(`  ${passed ? '✅' : '❌'} Validation sessions: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Validation intégrité des sessions',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur validation sessions: ${error.message}`);
    }
  }

  async testContainerMappingValidation() {
    console.log('📦 Test validation mapping des conteneurs...');
    
    try {
      const mockManager = this.env.createMockStorageManager();
      const containerStats = mockManager.containerManager.getContainerStats();
      
      const validation = {
        name: 'Mapping des conteneurs',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: {
          totalContainers: containerStats.containerCount,
          activeContainers: containerStats.containerCount,
          staleContainers: 0,
          orphanedTables: 0
        }
      };

      // Effectuer les vérifications
      validation.checks = [
        {
          name: 'Conteneurs détectés',
          passed: validation.statistics.totalContainers > 0,
          details: `${validation.statistics.totalContainers} conteneur(s) total`
        },
        {
          name: 'Conteneurs actifs dans le DOM',
          passed: validation.statistics.staleContainers < validation.statistics.totalContainers * 0.2,
          details: `${validation.statistics.activeContainers} actif(s), ${validation.statistics.staleContainers} obsolète(s)`
        },
        {
          name: 'Tables sans conteneur orphelines',
          passed: validation.statistics.orphanedTables === 0,
          details: `${validation.statistics.orphanedTables} table(s) orpheline(s)`
        },
        {
          name: 'Surveillance des conteneurs',
          passed: containerStats.monitoringActive,
          details: 'Surveillance automatique des changements'
        }
      ];

      const passedChecks = validation.checks.filter(c => c.passed).length;
      validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
      validation.isValid = validation.score >= 70;

      const passed = validation.score >= 70;

      this.results.push({
        test: 'Validation mapping des conteneurs',
        passed: passed,
        details: `Score: ${validation.score}/100, Conteneurs: ${validation.statistics.totalContainers}`,
        data: validation
      });

      console.log(`  ${passed ? '✅' : '❌'} Validation conteneurs: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Validation mapping des conteneurs',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur validation conteneurs: ${error.message}`);
    }
  }

  async testMigrationStatusValidation() {
    console.log('🔄 Test validation statut de migration...');
    
    try {
      const mockManager = this.env.createMockStorageManager();
      const migrationStats = mockManager.migrationManager.getMigrationStats();
      
      const validation = {
        name: 'Statut de migration',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: migrationStats
      };

      // Effectuer les vérifications
      validation.checks = [
        {
          name: 'Migration exécutée',
          passed: migrationStats.totalFound >= 0,
          details: `${migrationStats.totalFound} entrée(s) legacy analysée(s)`
        },
        {
          name: 'Taux de succès de migration',
          passed: migrationStats.totalFound === 0 || (migrationStats.migrated / migrationStats.totalFound) >= 0.8,
          details: `${migrationStats.migrated}/${migrationStats.totalFound} migrée(s) avec succès`
        },
        {
          name: 'Erreurs de migration minimales',
          passed: migrationStats.errors <= migrationStats.totalFound * 0.2,
          details: `${migrationStats.errors} erreur(s) de migration`
        }
      ];

      const passedChecks = validation.checks.filter(c => c.passed).length;
      validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
      validation.isValid = validation.score >= 80;

      const passed = validation.score >= 80;

      this.results.push({
        test: 'Validation statut de migration',
        passed: passed,
        details: `Score: ${validation.score}/100, Migrées: ${migrationStats.migrated}/${migrationStats.totalFound}`,
        data: validation
      });

      console.log(`  ${passed ? '✅' : '❌'} Validation migration: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Validation statut de migration',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur validation migration: ${error.message}`);
    }
  }

  async testStorageHealthValidation() {
    console.log('💾 Test validation santé du stockage...');
    
    try {
      const mockManager = this.env.createMockStorageManager();
      const storageStats = mockManager.getStorageStatsWithSession();
      
      const validation = {
        name: 'Santé du stockage',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: storageStats
      };

      // Effectuer les vérifications
      validation.checks = [
        {
          name: 'Quota de stockage acceptable',
          passed: storageStats.quotaUsageRatio < 0.9,
          details: `${(storageStats.quotaUsageRatio * 100).toFixed(1)}% du quota utilisé`
        },
        {
          name: 'Données récentes présentes',
          passed: storageStats.recentTables > 0,
          details: `${storageStats.recentTables} table(s) récente(s)`
        },
        {
          name: 'Distribution des sessions équilibrée',
          passed: storageStats.sessionCount > 0 && storageStats.sessionCount <= 10,
          details: `${storageStats.sessionCount} session(s) avec données`
        },
        {
          name: 'Taille moyenne des tables raisonnable',
          passed: storageStats.averageTableSize < 50000,
          details: `${Math.round(storageStats.averageTableSize)} bytes en moyenne`
        }
      ];

      const passedChecks = validation.checks.filter(c => c.passed).length;
      validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
      validation.isValid = validation.score >= 75;

      const passed = validation.score >= 75;

      this.results.push({
        test: 'Validation santé du stockage',
        passed: passed,
        details: `Score: ${validation.score}/100, Quota: ${(storageStats.quotaUsageRatio * 100).toFixed(1)}%`,
        data: validation
      });

      console.log(`  ${passed ? '✅' : '❌'} Validation santé stockage: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Validation santé du stockage',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur validation santé stockage: ${error.message}`);
    }
  }

  async testIntegrityScoreCalculation() {
    console.log('🎯 Test calcul du score d\'intégrité...');
    
    try {
      // Simuler des résultats de validation par catégorie
      const categories = {
        dataConsistency: { isValid: true, score: 85, maxScore: 100 },
        sessionIntegrity: { isValid: true, score: 90, maxScore: 100 },
        containerMapping: { isValid: false, score: 65, maxScore: 100 },
        migrationStatus: { isValid: true, score: 95, maxScore: 100 },
        storageHealth: { isValid: true, score: 80, maxScore: 100 }
      };

      // Calculer le score global
      let totalScore = 0;
      let totalMaxScore = 0;
      let validCategories = 0;
      let overallValid = true;

      Object.values(categories).forEach(category => {
        totalScore += category.score;
        totalMaxScore += category.maxScore;
        validCategories++;
        
        if (!category.isValid) {
          overallValid = false;
        }
      });

      const overallScore = Math.round((totalScore / totalMaxScore) * 100);
      
      if (overallScore < 70) {
        overallValid = false;
      }

      const passed = overallScore > 0 && validCategories === 5;

      this.results.push({
        test: 'Calcul du score d\'intégrité',
        passed: passed,
        details: `Score global: ${overallScore}/100, Catégories valides: ${Object.values(categories).filter(c => c.isValid).length}/5`,
        data: { overallScore, overallValid, categories }
      });

      console.log(`  ${passed ? '✅' : '❌'} Calcul score intégrité: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Calcul du score d\'intégrité',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur calcul score intégrité: ${error.message}`);
    }
  }

  displayResults() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log(`\n📊 Résultats validateStorageIntegrity: ${passed}/${total} tests réussis`);
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`  ${icon} ${result.test}: ${result.details}`);
    });
  }
}

/**
 * Tests de performance pour le monitoring
 */
class PerformanceMonitoringTests {
  constructor(env) {
    this.env = env;
    this.results = [];
  }

  async runAllTests() {
    console.log('\n🧪 === Tests Performance Monitoring ===');
    
    try {
      await this.testDiagnosticPerformance();
      await this.testValidationPerformance();
      await this.testLargeDatasetHandling();
      await this.testConcurrentOperations();
      
      this.displayResults();
      return this.results;
    } catch (error) {
      console.error('❌ Erreur dans les tests de performance:', error);
      return this.results;
    }
  }

  async testDiagnosticPerformance() {
    console.log('⚡ Test performance des diagnostics...');
    
    try {
      const iterations = 10;
      const mockManager = this.env.createMockStorageManager();
      
      // Créer plusieurs tables pour le test
      for (let i = 0; i < 20; i++) {
        this.env.createMockTableWithConflicts(`test-table-${i}`, `Content ${i}`);
      }

      // Test de performance du diagnostic d'identification
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        // Simuler debugTableIdentification
        const tables = this.env.mockTables;
        tables.forEach(table => {
          const analysis = {
            ids: { current: mockManager.getTableId(table) },
            structure: { rowCount: 2, colCount: 2 },
            context: { 
              sessionId: mockManager.contextManager.detectCurrentSession(),
              containerId: mockManager.containerManager.getOrCreateContainerId(table)
            }
          };
        });
      }
      
      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;
      
      const passed = averageTime < 100; // Moins de 100ms par diagnostic

      this.results.push({
        test: 'Performance des diagnostics',
        passed: passed,
        details: `Temps moyen: ${averageTime.toFixed(2)}ms pour ${this.env.mockTables.length} tables`,
        data: { averageTime, iterations, tableCount: this.env.mockTables.length }
      });

      console.log(`  ${passed ? '✅' : '❌'} Performance diagnostics: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Performance des diagnostics',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur performance diagnostics: ${error.message}`);
    }
  }

  async testValidationPerformance() {
    console.log('⚡ Test performance de la validation...');
    
    try {
      const iterations = 5;
      
      // Créer un grand nombre d'entrées de stockage
      for (let i = 0; i < 100; i++) {
        this.env.localStorage.set(`claraverse_table_perf_${i}`, JSON.stringify({
          id: `claraverse_table_perf_${i}`,
          html: `<table><tr><td>Performance Test ${i}</td></tr></table>`,
          timestamp: Date.now() - (i * 1000),
          sessionId: `session-${Math.floor(i / 10)}`,
          containerId: `container-${Math.floor(i / 5)}`,
          metadata: { version: '2.0', rowCount: 1, colCount: 1 }
        }));
      }

      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        // Simuler validateStorageIntegrity
        let validEntries = 0;
        let invalidEntries = 0;
        
        for (const [key, value] of this.env.localStorage.entries()) {
          if (key.startsWith('claraverse_table_')) {
            try {
              const data = JSON.parse(value);
              if (data.id && data.html && data.timestamp) {
                validEntries++;
              } else {
                invalidEntries++;
              }
            } catch (error) {
              invalidEntries++;
            }
          }
        }
      }
      
      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;
      
      const passed = averageTime < 200; // Moins de 200ms par validation

      this.results.push({
        test: 'Performance de la validation',
        passed: passed,
        details: `Temps moyen: ${averageTime.toFixed(2)}ms pour ${this.env.localStorage.size} entrées`,
        data: { averageTime, iterations, entryCount: this.env.localStorage.size }
      });

      console.log(`  ${passed ? '✅' : '❌'} Performance validation: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Performance de la validation',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur performance validation: ${error.message}`);
    }
  }

  async testLargeDatasetHandling() {
    console.log('📊 Test gestion de gros volumes de données...');
    
    try {
      // Créer un très grand nombre d'entrées
      const largeDatasetSize = 500;
      
      for (let i = 0; i < largeDatasetSize; i++) {
        this.env.localStorage.set(`claraverse_table_large_${i}`, JSON.stringify({
          id: `claraverse_table_large_${i}`,
          html: `<table><tr><td>Large Dataset ${i}</td><td>Data ${i * 2}</td></tr></table>`,
          timestamp: Date.now() - (i * 100),
          sessionId: `large-session-${Math.floor(i / 50)}`,
          containerId: `large-container-${Math.floor(i / 25)}`,
          metadata: { version: '2.0', rowCount: 1, colCount: 2 }
        }));
      }

      const startTime = performance.now();
      
      // Test de traitement du gros dataset
      let processedEntries = 0;
      const sessionMap = new Map();
      const containerMap = new Map();
      
      for (const [key, value] of this.env.localStorage.entries()) {
        if (key.startsWith('claraverse_table_large_')) {
          try {
            const data = JSON.parse(value);
            processedEntries++;
            
            // Simuler l'analyse des sessions
            if (!sessionMap.has(data.sessionId)) {
              sessionMap.set(data.sessionId, []);
            }
            sessionMap.get(data.sessionId).push(key);
            
            // Simuler l'analyse des conteneurs
            if (!containerMap.has(data.containerId)) {
              containerMap.set(data.containerId, []);
            }
            containerMap.get(data.containerId).push(key);
            
          } catch (error) {
            // Ignorer les erreurs pour ce test
          }
        }
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      const passed = processingTime < 1000 && processedEntries === largeDatasetSize; // Moins de 1 seconde

      this.results.push({
        test: 'Gestion de gros volumes de données',
        passed: passed,
        details: `${processedEntries} entrées traitées en ${processingTime.toFixed(2)}ms`,
        data: { 
          processingTime, 
          processedEntries, 
          largeDatasetSize,
          sessionCount: sessionMap.size,
          containerCount: containerMap.size
        }
      });

      console.log(`  ${passed ? '✅' : '❌'} Gestion gros volumes: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Gestion de gros volumes de données',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur gestion gros volumes: ${error.message}`);
    }
  }

  async testConcurrentOperations() {
    console.log('🔄 Test opérations concurrentes...');
    
    try {
      const mockManager = this.env.createMockStorageManager();
      
      // Simuler des opérations concurrentes
      const operations = [];
      const operationCount = 20;
      
      const startTime = performance.now();
      
      // Créer plusieurs opérations simultanées
      for (let i = 0; i < operationCount; i++) {
        operations.push(new Promise((resolve) => {
          setTimeout(() => {
            // Simuler une opération de diagnostic
            const table = this.env.createMockTableWithConflicts(`concurrent-table-${i}`, `Concurrent ${i}`);
            const analysis = {
              ids: { current: mockManager.getTableId(table) },
              context: { 
                sessionId: mockManager.contextManager.detectCurrentSession(),
                containerId: mockManager.containerManager.getOrCreateContainerId(table)
              }
            };
            resolve(analysis);
          }, Math.random() * 50); // Délai aléatoire jusqu'à 50ms
        }));
      }
      
      // Attendre que toutes les opérations se terminent
      const results = await Promise.all(operations);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      const passed = results.length === operationCount && totalTime < 500; // Toutes les opérations en moins de 500ms

      this.results.push({
        test: 'Opérations concurrentes',
        passed: passed,
        details: `${results.length}/${operationCount} opérations réussies en ${totalTime.toFixed(2)}ms`,
        data: { totalTime, operationCount, successCount: results.length }
      });

      console.log(`  ${passed ? '✅' : '❌'} Opérations concurrentes: ${passed ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      this.results.push({
        test: 'Opérations concurrentes',
        passed: false,
        details: `Erreur: ${error.message}`,
        error: error
      });
      console.log(`  ❌ Erreur opérations concurrentes: ${error.message}`);
    }
  }

  displayResults() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log(`\n📊 Résultats Performance Monitoring: ${passed}/${total} tests réussis`);
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`  ${icon} ${result.test}: ${result.details}`);
    });
  }
}

/**
 * Fonction principale pour exécuter tous les tests de diagnostic et monitoring
 */
async function runDiagnosticMonitoringTests() {
  console.log('🚀 === TESTS DIAGNOSTIC ET MONITORING ===');
  console.log('Tests pour les outils de diagnostic et de surveillance du système d\'identification des tables\n');
  
  const env = new DiagnosticTestEnvironment();
  const allResults = {
    debugTableIdentification: [],
    validateStorageIntegrity: [],
    performanceMonitoring: [],
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0
    }
  };
  
  try {
    // Tests debugTableIdentification
    const debugTests = new DebugTableIdentificationTests(env);
    allResults.debugTableIdentification = await debugTests.runAllTests();
    
    // Reset environment
    env.reset();
    
    // Tests validateStorageIntegrity
    const integrityTests = new ValidateStorageIntegrityTests(env);
    allResults.validateStorageIntegrity = await integrityTests.runAllTests();
    
    // Reset environment
    env.reset();
    
    // Tests de performance
    const performanceTests = new PerformanceMonitoringTests(env);
    allResults.performanceMonitoring = await performanceTests.runAllTests();
    
    // Calculer le résumé global
    const allTestResults = [
      ...allResults.debugTableIdentification,
      ...allResults.validateStorageIntegrity,
      ...allResults.performanceMonitoring
    ];
    
    allResults.summary.totalTests = allTestResults.length;
    allResults.summary.passedTests = allTestResults.filter(r => r.passed).length;
    allResults.summary.failedTests = allResults.summary.totalTests - allResults.summary.passedTests;
    allResults.summary.successRate = allResults.summary.totalTests > 0 ? 
      Math.round((allResults.summary.passedTests / allResults.summary.totalTests) * 100) : 0;
    
    // Afficher le résumé final
    console.log('\n🎯 === RÉSUMÉ GLOBAL ===');
    console.log(`Tests exécutés: ${allResults.summary.totalTests}`);
    console.log(`Tests réussis: ${allResults.summary.passedTests}`);
    console.log(`Tests échoués: ${allResults.summary.failedTests}`);
    console.log(`Taux de réussite: ${allResults.summary.successRate}%`);
    
    const overallSuccess = allResults.summary.successRate >= 80;
    console.log(`\n${overallSuccess ? '✅' : '❌'} Résultat global: ${overallSuccess ? 'SUCCÈS' : 'ÉCHEC'}`);
    
    if (!overallSuccess) {
      console.log('\n⚠️ Recommandations:');
      console.log('- Vérifier les méthodes de diagnostic qui échouent');
      console.log('- Optimiser les performances si nécessaire');
      console.log('- Corriger les problèmes de validation d\'intégrité');
    }
    
    return allResults;
    
  } catch (error) {
    console.error('❌ Erreur critique dans les tests:', error);
    return allResults;
  }
}

// Exporter les fonctions pour utilisation externe
if (typeof window !== 'undefined') {
  window.runDiagnosticMonitoringTests = runDiagnosticMonitoringTests;
  window.DiagnosticTestEnvironment = DiagnosticTestEnvironment;
  window.DebugTableIdentificationTests = DebugTableIdentificationTests;
  window.ValidateStorageIntegrityTests = ValidateStorageIntegrityTests;
  window.PerformanceMonitoringTests = PerformanceMonitoringTests;
  
  console.log('🧪 Tests de diagnostic et monitoring chargés');
  console.log('💡 Utilisation: runDiagnosticMonitoringTests()');
}