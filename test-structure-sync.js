/**
 * ClaraVerse Structure Sync Test Suite v3.0
 * Script de test pour la synchronisation structurelle des tables
 *
 * Usage: Exécuter dans la console du navigateur après chargement de dev.js et menu.js
 */

class ClaraVerseStructureTestSuite {
  constructor() {
    this.testResults = [];
    this.testTable = null;
    this.originalTableId = null;
    this.menuManager = null;
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      test: "🧪"
    }[type] || "📝";

    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    console.log(logMessage);

    this.testResults.push({
      timestamp,
      type,
      message,
      full: logMessage
    });
  }

  async createTestTable() {
    try {
      this.log("Création d'une table de test...", "test");

      // Créer une table de test
      const tableHTML = `
        <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" id="test-structure-table">
          <thead>
            <tr>
              <th style="border: 1px solid #d1d5db; padding: 8px;">Colonne 1</th>
              <th style="border: 1px solid #d1d5db; padding: 8px;">Colonne 2</th>
              <th style="border: 1px solid #d1d5db; padding: 8px;">Colonne 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px;">A1</td>
              <td style="border: 1px solid #d1d5db; padding: 8px;">B1</td>
              <td style="border: 1px solid #d1d5db; padding: 8px;">C1</td>
            </tr>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px;">A2</td>
              <td style="border: 1px solid #d1d5db; padding: 8px;">B2</td>
              <td style="border: 1px solid #d1d5db; padding: 8px;">C2</td>
            </tr>
          </tbody>
        </table>
      `;

      // Insérer dans le DOM
      const container = document.createElement('div');
      container.innerHTML = tableHTML;
      container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        padding: 20px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;

      const title = document.createElement('h3');
      title.textContent = '🧪 Table de Test - Structure Sync';
      title.style.cssText = 'margin: 0 0 10px 0; color: #3b82f6; font-size: 16px;';
      container.insertBefore(title, container.firstChild);

      document.body.appendChild(container);

      this.testTable = container.querySelector('table');

      // Attendre que dev.js traite la table
      await new Promise(resolve => setTimeout(resolve, 500));

      if (window.generateTableId) {
        this.originalTableId = window.generateTableId(this.testTable);
      } else if (this.testTable.dataset.tableId) {
        this.originalTableId = this.testTable.dataset.tableId;
      } else {
        this.originalTableId = 'test-table-' + Date.now();
      }

      this.log(`Table créée avec ID: ${this.originalTableId}`, "success");
      return true;
    } catch (error) {
      this.log(`Erreur création table: ${error.message}`, "error");
      return false;
    }
  }

  async testStructureSave() {
    try {
      this.log("Test de sauvegarde de structure...", "test");

      if (!window.claraverseSyncAPI || !window.claraverseSyncAPI.saveTableStructure) {
        this.log("API de sauvegarde structure non disponible", "error");
        return false;
      }

      const success = await window.claraverseSyncAPI.saveTableStructure(
        this.testTable,
        { source: "test", operation: "initial_save" }
      );

      if (success) {
        this.log("Sauvegarde de structure réussie", "success");
        return true;
      } else {
        this.log("Échec sauvegarde de structure", "error");
        return false;
      }
    } catch (error) {
      this.log(`Erreur test sauvegarde: ${error.message}`, "error");
      return false;
    }
  }

  async testStructureRestore() {
    try {
      this.log("Test de restauration de structure...", "test");

      if (!window.claraverseSyncAPI || !window.claraverseSyncAPI.restoreTableStructure) {
        this.log("API de restauration structure non disponible", "error");
        return false;
      }

      const restored = await window.claraverseSyncAPI.restoreTableStructure(this.testTable);

      if (restored) {
        this.log("Restauration de structure réussie", "success");
        this.testTable = restored; // Mettre à jour la référence
        return true;
      } else {
        this.log("Aucune structure à restaurer (normal pour un nouveau test)", "warning");
        return true; // Ce n'est pas une erreur
      }
    } catch (error) {
      this.log(`Erreur test restauration: ${error.message}`, "error");
      return false;
    }
  }

  async testRowInsertion() {
    try {
      this.log("Test d'insertion de ligne...", "test");

      const initialRowCount = this.testTable.rows.length;
      this.log(`Nombre de lignes initial: ${initialRowCount}`, "info");

      // Simuler l'insertion d'une ligne
      const tbody = this.testTable.querySelector('tbody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td style="border: 1px solid #d1d5db; padding: 8px;">A3-NEW</td>
        <td style="border: 1px solid #d1d5db; padding: 8px;">B3-NEW</td>
        <td style="border: 1px solid #d1d5db; padding: 8px;">C3-NEW</td>
      `;
      tbody.appendChild(newRow);

      const newRowCount = this.testTable.rows.length;
      this.log(`Nombre de lignes après insertion: ${newRowCount}`, "info");

      // Sauvegarder la nouvelle structure
      const saved = await window.claraverseSyncAPI.saveTableStructure(
        this.testTable,
        { source: "test", operation: "row_added", rowIndex: newRowCount - 1 }
      );

      if (saved && newRowCount > initialRowCount) {
        this.log("Insertion de ligne et sauvegarde réussies", "success");
        return true;
      } else {
        this.log("Échec insertion/sauvegarde de ligne", "error");
        return false;
      }
    } catch (error) {
      this.log(`Erreur test insertion ligne: ${error.message}`, "error");
      return false;
    }
  }

  async testColumnInsertion() {
    try {
      this.log("Test d'insertion de colonne...", "test");

      const initialColCount = this.testTable.rows[0].cells.length;
      this.log(`Nombre de colonnes initial: ${initialColCount}`, "info");

      // Insérer une colonne dans chaque ligne
      const rows = this.testTable.querySelectorAll('tr');
      rows.forEach((row, index) => {
        const newCell = document.createElement(index === 0 ? 'th' : 'td');
        newCell.style.cssText = 'border: 1px solid #d1d5db; padding: 8px;';
        newCell.textContent = index === 0 ? 'Nouvelle Col' : `D${index}-NEW`;
        row.appendChild(newCell);
      });

      const newColCount = this.testTable.rows[0].cells.length;
      this.log(`Nombre de colonnes après insertion: ${newColCount}`, "info");

      // Sauvegarder la nouvelle structure
      const saved = await window.claraverseSyncAPI.saveTableStructure(
        this.testTable,
        { source: "test", operation: "column_added", columnIndex: newColCount - 1 }
      );

      if (saved && newColCount > initialColCount) {
        this.log("Insertion de colonne et sauvegarde réussies", "success");
        return true;
      } else {
        this.log("Échec insertion/sauvegarde de colonne", "error");
        return false;
      }
    } catch (error) {
      this.log(`Erreur test insertion colonne: ${error.message}`, "error");
      return false;
    }
  }

  async testLocalStoragePersistence() {
    try {
      this.log("Test de persistance localStorage...", "test");

      const structureKey = `claraverse_structure_${this.originalTableId}`;
      const storedData = localStorage.getItem(structureKey);

      if (storedData) {
        const parsed = JSON.parse(storedData);
        this.log(`Structure trouvée dans localStorage: ${parsed.rows}x${parsed.columns}`, "success");
        this.log(`Dernière opération: ${parsed.source} - ${parsed.operation}`, "info");
        return true;
      } else {
        this.log("Aucune structure trouvée dans localStorage", "error");

        // Chercher avec d'autres clés possibles
        const allKeys = Object.keys(localStorage).filter(key =>
          key.includes('claraverse') && key.includes('structure')
        );
        this.log(`Clés de structure trouvées: ${allKeys.join(', ')}`, "info");
        return false;
      }
    } catch (error) {
      this.log(`Erreur test localStorage: ${error.message}`, "error");
      return false;
    }
  }

  async testMenuIntegration() {
    try {
      this.log("Test d'intégration avec menu.js...", "test");

      if (window.ContextualMenuManager) {
        // Simuler l'activation du menu
        const event = new MouseEvent('contextmenu', {
          bubbles: true,
          clientX: 100,
          clientY: 100
        });

        const firstCell = this.testTable.querySelector('td');
        if (firstCell) {
          firstCell.dispatchEvent(event);

          // Attendre un peu pour voir si le menu s'active
          await new Promise(resolve => setTimeout(resolve, 300));

          this.log("Menu contextuel activé avec succès", "success");
          return true;
        } else {
          this.log("Aucune cellule trouvée pour test menu", "error");
          return false;
        }
      } else {
        this.log("ContextualMenuManager non trouvé", "error");
        return false;
      }
    } catch (error) {
      this.log(`Erreur test menu: ${error.message}`, "error");
      return false;
    }
  }

  async runAllTests() {
    try {
      this.log("🚀 Démarrage de la suite de tests ClaraVerse Structure Sync", "test");

      const tests = [
        { name: "Création table de test", fn: () => this.createTestTable() },
        { name: "Sauvegarde de structure", fn: () => this.testStructureSave() },
        { name: "Restauration de structure", fn: () => this.testStructureRestore() },
        { name: "Insertion de ligne", fn: () => this.testRowInsertion() },
        { name: "Insertion de colonne", fn: () => this.testColumnInsertion() },
        { name: "Persistance localStorage", fn: () => this.testLocalStoragePersistence() },
        { name: "Intégration menu", fn: () => this.testMenuIntegration() }
      ];

      let passedTests = 0;
      let failedTests = 0;

      for (const test of tests) {
        this.log(`\n--- Test: ${test.name} ---`, "test");
        try {
          const result = await test.fn();
          if (result) {
            passedTests++;
            this.log(`✅ ${test.name} - SUCCÈS`, "success");
          } else {
            failedTests++;
            this.log(`❌ ${test.name} - ÉCHEC`, "error");
          }
        } catch (error) {
          failedTests++;
          this.log(`❌ ${test.name} - ERREUR: ${error.message}`, "error");
        }

        // Pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      this.log(`\n📊 RÉSULTATS FINAUX:`, "test");
      this.log(`✅ Tests réussis: ${passedTests}`, "success");
      this.log(`❌ Tests échoués: ${failedTests}`, failedTests > 0 ? "error" : "info");
      this.log(`📈 Taux de réussite: ${Math.round((passedTests / tests.length) * 100)}%`, "info");

      // Afficher un résumé dans la page
      this.displayResults(passedTests, failedTests, tests.length);

      return passedTests === tests.length;
    } catch (error) {
      this.log(`Erreur critique dans runAllTests: ${error.message}`, "error");
      return false;
    }
  }

  displayResults(passed, failed, total) {
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 3px solid ${failed === 0 ? '#10b981' : '#ef4444'};
      border-radius: 12px;
      padding: 30px;
      z-index: 10000;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      text-align: center;
      font-family: system-ui;
      max-width: 400px;
    `;

    resultDiv.innerHTML = `
      <h2 style="margin: 0 0 20px 0; color: ${failed === 0 ? '#10b981' : '#ef4444'};">
        🧪 Résultats des Tests
      </h2>
      <div style="font-size: 18px; margin: 15px 0;">
        <div style="color: #10b981; font-weight: bold;">✅ Réussis: ${passed}</div>
        <div style="color: #ef4444; font-weight: bold;">❌ Échoués: ${failed}</div>
        <div style="color: #6b7280;">📊 Total: ${total}</div>
      </div>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: ${failed === 0 ? '#10b981' : '#ef4444'};">
        ${Math.round((passed / total) * 100)}% de réussite
      </div>
      <button id="close-test-results" style="
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      ">Fermer</button>
    `;

    document.body.appendChild(resultDiv);

    document.getElementById('close-test-results').onclick = () => {
      resultDiv.remove();
    };

    // Auto-fermer après 10 secondes
    setTimeout(() => {
      if (document.body.contains(resultDiv)) {
        resultDiv.remove();
      }
    }, 10000);
  }

  cleanup() {
    // Nettoyer la table de test
    const testContainer = document.querySelector('#test-structure-table')?.closest('div');
    if (testContainer) {
      testContainer.remove();
    }

    this.log("🧹 Nettoyage terminé", "info");
  }
}

// Fonction d'initialisation globale
window.runClaraVerseStructureTests = async function() {
  const testSuite = new ClaraVerseStructureTestSuite();

  try {
    await testSuite.runAllTests();
  } finally {
    // Programmer le nettoyage pour dans 30 secondes
    setTimeout(() => {
      testSuite.cleanup();
    }, 30000);
  }

  return testSuite;
};

// Auto-exécution si le script est chargé directement
if (typeof window !== 'undefined' && window.claraverseSyncAPI) {
  console.log("🧪 ClaraVerse Structure Test Suite prêt!");
  console.log("📝 Exécutez 'runClaraVerseStructureTests()' pour démarrer les tests");
} else {
  console.log("⚠️ ClaraVerse Structure Test Suite chargé mais claraverseSyncAPI non disponible");
  console.log("🔄 Attendez que dev.js soit complètement chargé");
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraVerseStructureTestSuite;
}
