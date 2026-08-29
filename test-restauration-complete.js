/**
 * CLARAVERSE - TEST RESTAURATION COMPLÈTE
 * Script de test et validation pour le système de restauration unifié
 * Teste toutes les fonctionnalités et génère un rapport détaillé
 */

class TestRestaurateurClaraVerse {
  constructor() {
    this.logPrefix = '[TestRestaurateur]';
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info', data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const styles = {
      info: 'color: #2563eb; background: #eff6ff',
      success: 'color: #059669; background: #ecfdf5',
      warning: 'color: #d97706; background: #fffbeb',
      error: 'color: #dc2626; background: #fef2f2',
      test: 'color: #7c3aed; background: #f5f3ff'
    };

    console.log(
      `%c${this.logPrefix} [${timestamp}] ${message}`,
      `padding: 2px 6px; border-radius: 3px; font-weight: bold; ${styles[type] || styles.info}`
    );

    if (data) {
      console.log('📊 Données:', data);
    }
  }

  addTest(name, description, testFn) {
    this.tests.push({ name, description, testFn });
  }

  async runTest(test) {
    this.log(`🧪 Test: ${test.name}`, 'test');
    this.results.total++;

    try {
      const result = await test.testFn();

      if (result.success) {
        this.log(`✅ ${test.name} - RÉUSSI`, 'success');
        this.results.passed++;
      } else if (result.warning) {
        this.log(`⚠️ ${test.name} - AVERTISSEMENT: ${result.message}`, 'warning');
        this.results.warnings++;
      } else {
        this.log(`❌ ${test.name} - ÉCHEC: ${result.message}`, 'error');
        this.results.failed++;
      }

      return result;
    } catch (error) {
      this.log(`💥 ${test.name} - ERREUR: ${error.message}`, 'error');
      this.results.failed++;
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    this.log('🚀 Démarrage de la suite de tests complète');

    // Initialiser les tests
    this.setupTests();

    const testResults = [];

    for (const test of this.tests) {
      const result = await this.runTest(test);
      testResults.push({
        name: test.name,
        description: test.description,
        result
      });

      // Pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Générer le rapport final
    const rapport = this.generateFinalReport(testResults);
    this.displayResults(rapport);

    return rapport;
  }

  setupTests() {
    // Test 1: Disponibilité des APIs
    this.addTest('api_availability', 'Vérification des APIs ClaraVerse', async () => {
      if (!window.ClaraVerse) {
        return { success: false, message: 'window.ClaraVerse non disponible' };
      }

      if (!window.ClaraVerse.TablePersistence) {
        return { success: false, message: 'TablePersistence non disponible' };
      }

      if (!window.ClaraVerse.TablePersistence.db) {
        return { success: false, message: 'Base de données non initialisée' };
      }

      return { success: true, message: 'Toutes les APIs sont disponibles' };
    });

    // Test 2: État d'IndexedDB
    this.addTest('indexeddb_state', 'Analyse de l\'état d\'IndexedDB', async () => {
      try {
        const allData = await window.ClaraVerse.TablePersistence.db.getAll();

        if (allData.length === 0) {
          return { success: false, message: 'IndexedDB vide - aucune donnée à restaurer' };
        }

        const validData = allData.filter(item =>
          item.cellId &&
          (item.content || item.text) &&
          item.content !== 'undefined' &&
          item.text !== 'undefined'
        );

        if (validData.length === 0) {
          return { success: false, message: `${allData.length} entrées trouvées mais aucune valide` };
        }

        if (validData.length < allData.length * 0.8) {
          return {
            warning: true,
            message: `${validData.length}/${allData.length} entrées valides - beaucoup de données corrompues`
          };
        }

        return {
          success: true,
          message: `${validData.length}/${allData.length} entrées valides trouvées`,
          data: { total: allData.length, valid: validData.length }
        };
      } catch (error) {
        return { success: false, message: `Erreur accès IndexedDB: ${error.message}` };
      }
    });

    // Test 3: Cellules éditables
    this.addTest('editable_cells', 'Détection des cellules éditables', async () => {
      const editableCells = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');

      if (editableCells.length === 0) {
        return { success: false, message: 'Aucune cellule éditable trouvée' };
      }

      const cellsWithId = Array.from(editableCells).filter(cell => cell.dataset.cellId);
      const cellsWithContent = Array.from(editableCells).filter(cell => cell.textContent?.trim());

      return {
        success: true,
        message: `${editableCells.length} cellules éditables trouvées`,
        data: {
          total: editableCells.length,
          withId: cellsWithId.length,
          withContent: cellsWithContent.length,
          empty: editableCells.length - cellsWithContent.length
        }
      };
    });

    // Test 4: Restaurateur unifié
    this.addTest('unified_restorer', 'Test du restaurateur unifié', async () => {
      if (!window.ClaraVerseRestaurateurUnifie) {
        return { success: false, message: 'Classe ClaraVerseRestaurateurUnifie non disponible' };
      }

      try {
        const restaurateur = new window.ClaraVerseRestaurateurUnifie();
        const initialized = await restaurateur.initialize();

        if (!initialized) {
          return { success: false, message: 'Impossible d\'initialiser le restaurateur' };
        }

        return { success: true, message: 'Restaurateur unifié fonctionnel' };
      } catch (error) {
        return { success: false, message: `Erreur restaurateur: ${error.message}` };
      }
    });

    // Test 5: Analyse des données
    this.addTest('data_analysis', 'Analyse approfondie des données', async () => {
      try {
        const analysis = await window.ClaraVerseForceRestore.analyze();

        if (!analysis.db || !analysis.cells) {
          return { success: false, message: 'Impossible d\'analyser les données' };
        }

        const dbAnalysis = analysis.db.analysis;
        const cellAnalysis = analysis.cells.analysis;

        const issues = [];
        if (dbAnalysis.corrupted > 0) {
          issues.push(`${dbAnalysis.corrupted} entrées corrompues`);
        }
        if (cellAnalysis.withoutIds > cellAnalysis.withIds * 0.5) {
          issues.push(`Beaucoup de cellules sans ID (${cellAnalysis.withoutIds})`);
        }

        if (issues.length > 0) {
          return {
            warning: true,
            message: `Analyse complétée avec problèmes: ${issues.join(', ')}`,
            data: { db: dbAnalysis, cells: cellAnalysis }
          };
        }

        return {
          success: true,
          message: 'Analyse des données réussie',
          data: { db: dbAnalysis, cells: cellAnalysis }
        };
      } catch (error) {
        return { success: false, message: `Erreur analyse: ${error.message}` };
      }
    });

    // Test 6: Test de restauration
    this.addTest('restoration_test', 'Test de restauration en conditions réelles', async () => {
      try {
        // Sauvegarder l'état actuel
        const editableCells = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
        const originalStates = Array.from(editableCells).map(cell => ({
          element: cell,
          content: cell.innerHTML,
          text: cell.textContent
        }));

        // Effectuer la restauration
        const result = await window.ClaraVerseForceRestore.restore();

        if (!result) {
          return { success: false, message: 'La restauration a retourné null' };
        }

        if (result.stats.restoredCells === 0) {
          return {
            warning: true,
            message: 'Aucune cellule restaurée - soit déjà à jour, soit problème de données',
            data: result
          };
        }

        return {
          success: true,
          message: `Restauration réussie: ${result.stats.restoredCells} cellules restaurées`,
          data: result
        };
      } catch (error) {
        return { success: false, message: `Erreur test restauration: ${error.message}` };
      }
    });

    // Test 7: Cohérence des données
    this.addTest('data_consistency', 'Vérification de la cohérence des données', async () => {
      try {
        const allData = await window.ClaraVerse.TablePersistence.db.getAll();
        const duplicateIds = {};
        const inconsistencies = [];

        // Chercher les doublons d'ID
        for (const item of allData) {
          if (duplicateIds[item.cellId]) {
            inconsistencies.push(`ID dupliqué: ${item.cellId}`);
          } else {
            duplicateIds[item.cellId] = true;
          }
        }

        // Vérifier la correspondance DOM
        const editableCells = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
        let unmatchedCells = 0;
        let unmatchedData = 0;

        for (const cell of editableCells) {
          if (cell.dataset.cellId) {
            const hasData = allData.some(item => item.cellId === cell.dataset.cellId);
            if (!hasData) {
              unmatchedCells++;
            }
          }
        }

        const cellIds = Array.from(editableCells)
          .map(cell => cell.dataset.cellId)
          .filter(id => id);

        for (const item of allData) {
          if (!cellIds.includes(item.cellId)) {
            unmatchedData++;
          }
        }

        if (inconsistencies.length > 0) {
          inconsistencies.push(`${unmatchedCells} cellules sans données`);
          inconsistencies.push(`${unmatchedData} données sans cellules`);
        }

        if (inconsistencies.length > 0) {
          return {
            warning: true,
            message: `Incohérences détectées: ${inconsistencies.slice(0, 3).join(', ')}`,
            data: { issues: inconsistencies.length }
          };
        }

        return {
          success: true,
          message: 'Données cohérentes',
          data: { cells: editableCells.length, data: allData.length }
        };
      } catch (error) {
        return { success: false, message: `Erreur vérification cohérence: ${error.message}` };
      }
    });

    // Test 8: Nettoyage des données
    this.addTest('data_cleanup', 'Test de nettoyage des données corrompues', async () => {
      try {
        const cleaned = await window.ClaraVerseForceRestore.clean();

        if (cleaned > 0) {
          return {
            success: true,
            message: `${cleaned} entrées corrompues nettoyées`,
            data: { cleaned }
          };
        } else {
          return {
            success: true,
            message: 'Aucune donnée corrompue à nettoyer'
          };
        }
      } catch (error) {
        return { success: false, message: `Erreur nettoyage: ${error.message}` };
      }
    });
  }

  generateFinalReport(testResults) {
    const duration = Date.now() - this.startTime;

    return {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results: this.results,
      testResults,
      recommendations: this.generateRecommendations(testResults),
      summary: this.generateSummary()
    };
  }

  generateRecommendations(testResults) {
    const recommendations = [];

    const failedTests = testResults.filter(t => !t.result.success && !t.result.warning);
    const warningTests = testResults.filter(t => t.result.warning);

    if (failedTests.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Corriger les erreurs critiques',
        details: failedTests.map(t => `${t.name}: ${t.result.message}`)
      });
    }

    if (warningTests.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Résoudre les avertissements',
        details: warningTests.map(t => `${t.name}: ${t.result.message}`)
      });
    }

    // Recommandations spécifiques
    const dataTest = testResults.find(t => t.name === 'indexeddb_state');
    if (dataTest && dataTest.result.warning) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Nettoyer les données corrompues',
        details: ['Exécuter: window.ClaraVerseForceRestore.clean()']
      });
    }

    const restoTest = testResults.find(t => t.name === 'restoration_test');
    if (restoTest && restoTest.result.warning) {
      recommendations.push({
        priority: 'LOW',
        action: 'Vérifier si la restauration est nécessaire',
        details: ['Les données semblent déjà à jour']
      });
    }

    return recommendations;
  }

  generateSummary() {
    const { passed, failed, warnings, total } = this.results;
    const successRate = Math.round((passed / total) * 100);

    let status = 'EXCELLENT';
    let color = '#059669';

    if (failed > 0 || successRate < 80) {
      status = 'PROBLÉMATIQUE';
      color = '#dc2626';
    } else if (warnings > 0 || successRate < 95) {
      status = 'ATTENTION REQUISE';
      color = '#d97706';
    }

    return {
      status,
      color,
      successRate,
      message: `${passed} réussis, ${failed} échecs, ${warnings} avertissements sur ${total} tests`
    };
  }

  displayResults(rapport) {
    this.log('📊 RAPPORT FINAL DE TEST', 'test');
    console.log('%c' + '='.repeat(60), 'color: #7c3aed; font-weight: bold;');

    // Résumé
    this.log(`État: ${rapport.summary.status} (${rapport.summary.successRate}%)`,
             rapport.summary.status === 'EXCELLENT' ? 'success' :
             rapport.summary.status === 'PROBLÉMATIQUE' ? 'error' : 'warning');

    this.log(`Durée: ${rapport.duration}`);
    this.log(`Tests: ${rapport.summary.message}`);

    // Recommandations
    if (rapport.recommendations.length > 0) {
      this.log('🎯 RECOMMANDATIONS:', 'warning');
      rapport.recommendations.forEach((rec, i) => {
        console.log(`%c${i + 1}. [${rec.priority}] ${rec.action}`,
                   `color: ${rec.priority === 'HIGH' ? '#dc2626' : rec.priority === 'MEDIUM' ? '#d97706' : '#2563eb'}`);
        rec.details.forEach(detail => console.log(`   • ${detail}`));
      });
    }

    // Affichage dans le DOM
    this.createResultsUI(rapport);

    console.log('%c' + '='.repeat(60), 'color: #7c3aed; font-weight: bold;');
  }

  createResultsUI(rapport) {
    // Supprimer l'ancienne interface si elle existe
    const existingUI = document.getElementById('test-results-ui');
    if (existingUI) {
      existingUI.remove();
    }

    const ui = document.createElement('div');
    ui.id = 'test-results-ui';
    ui.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
    `;

    ui.innerHTML = `
      <div style="border-bottom: 2px solid ${rapport.summary.color}; padding-bottom: 10px; margin-bottom: 15px;">
        <h3 style="margin: 0; color: ${rapport.summary.color};">🧪 Test ClaraVerse</h3>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
          ${rapport.summary.status} (${rapport.summary.successRate}%)
        </p>
      </div>

      <div style="margin-bottom: 15px;">
        <div style="display: flex; gap: 10px; font-size: 12px;">
          <span style="background: #dcfce7; color: #059669; padding: 2px 6px; border-radius: 4px;">
            ✅ ${rapport.results.passed}
          </span>
          <span style="background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 4px;">
            ⚠️ ${rapport.results.warnings}
          </span>
          <span style="background: #fef2f2; color: #dc2626; padding: 2px 6px; border-radius: 4px;">
            ❌ ${rapport.results.failed}
          </span>
        </div>
      </div>

      ${rapport.recommendations.length > 0 ? `
        <div style="background: #f9fafb; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">Actions recommandées:</h4>
          ${rapport.recommendations.slice(0, 3).map(rec => `
            <div style="font-size: 12px; margin-bottom: 5px;">
              <strong style="color: ${rec.priority === 'HIGH' ? '#dc2626' : rec.priority === 'MEDIUM' ? '#d97706' : '#2563eb'}">
                ${rec.action}
              </strong>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div style="display: flex; gap: 10px; font-size: 12px;">
        <button onclick="window.ClaraVerseForceRestore.restore()"
                style="flex: 1; background: #2563eb; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
          🔄 Restaurer
        </button>
        <button onclick="window.ClaraVerseForceRestore.clean()"
                style="flex: 1; background: #d97706; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
          🧹 Nettoyer
        </button>
        <button onclick="document.getElementById('test-results-ui').remove()"
                style="background: #6b7280; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(ui);

    // Auto-suppression après 30 secondes
    setTimeout(() => {
      if (ui.parentNode) {
        ui.remove();
      }
    }, 30000);
  }
}

// Interface globale
window.ClaraVerseTesteur = {
  async runFullTest() {
    const testeur = new TestRestaurateurClaraVerse();
    return await testeur.runAllTests();
  },

  async quickTest() {
    console.log('🧪 Test rapide ClaraVerse...');

    // Vérifications basiques
    const checks = {
      api: !!window.ClaraVerse?.TablePersistence,
      db: !!window.ClaraVerse?.TablePersistence?.db,
      restorer: !!window.ClaraVerseForceRestore,
      cells: document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]').length
    };

    console.log('📊 État rapide:', checks);

    if (checks.api && checks.db && checks.restorer && checks.cells > 0) {
      console.log('✅ Système fonctionnel - Prêt pour restauration');
      return true;
    } else {
      console.log('❌ Problème détecté - Lancer le test complet');
      return false;
    }
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🔧 Test ClaraVerse disponible:');
    console.log('   • window.ClaraVerseTesteur.runFullTest() - Test complet');
    console.log('   • window.ClaraVerseTesteur.quickTest() - Test rapide');
  }, 1000);
});

// Test automatique si URL contient #test
if (window.location.hash.includes('test')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      window.ClaraVerseTesteur.runFullTest();
    }, 2000);
  });
}
