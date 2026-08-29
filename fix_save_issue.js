/**
 * Fix Save Issue - Correction automatique de la sauvegarde
 * Ce script force l'initialisation et la sauvegarde des tables
 *
 * UTILISATION:
 * 1. Charger APRÈS table_data.js et conso.js
 * 2. Ou exécuter manuellement dans la console
 */

(function() {
  "use strict";

  console.log("🔧 ========================================");
  console.log("🔧 FIX SAVE ISSUE - Correction en cours...");
  console.log("🔧 ========================================\n");

  // ============================================================================
  // ÉTAPE 1 : Vérifier que le manager existe
  // ============================================================================

  if (!window.ClaraverseTableDataManager) {
    console.error("❌ Table Data Manager non trouvé !");
    console.error("   Veuillez charger table_data.js d'abord");
    return;
  }

  console.log("✅ Table Data Manager détecté");

  const manager = window.ClaraverseTableDataManager;

  // ============================================================================
  // ÉTAPE 2 : Forcer la redécouverte des tables
  // ============================================================================

  console.log("\n📊 Redécouverte des tables...");

  if (typeof manager.discoverAllTables === 'function') {
    manager.discoverAllTables();
    console.log(`✅ ${manager.tables ? manager.tables.size : 0} table(s) détectée(s)`);
  } else {
    console.warn("⚠️  Méthode discoverAllTables() non disponible");
  }

  // ============================================================================
  // ÉTAPE 3 : Forcer l'indexation de TOUTES les tables
  // ============================================================================

  console.log("\n🔢 Indexation des tables...");

  const allTables = document.querySelectorAll('table');
  let indexedCount = 0;
  let savedCount = 0;

  allTables.forEach((table, index) => {
    console.log(`\n  Table ${index + 1}:`);

    // Vérifier/Créer l'ID de table
    if (!table.dataset.tableId) {
      if (typeof manager.ensureTableId === 'function') {
        manager.ensureTableId(table);
        console.log(`    ✅ ID créé: ${table.dataset.tableId}`);
      } else if (typeof manager.generateUniqueTableId === 'function') {
        manager.generateUniqueTableId(table);
        console.log(`    ✅ ID créé: ${table.dataset.tableId}`);
      } else {
        // Créer un ID manuellement
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        table.dataset.tableId = `table_${timestamp}_${index}_${random}`;
        console.log(`    ✅ ID créé manuellement: ${table.dataset.tableId}`);
      }
    }

    // Déterminer le type de table
    if (!table.dataset.tableType) {
      if (table.classList.contains('claraverse-conso-table')) {
        table.dataset.tableType = 'conso';
      } else {
        const headers = Array.from(table.querySelectorAll('thead th, tr:first-child th'))
          .map(th => th.textContent.trim().toLowerCase());

        if (headers.some(h => h.includes('resultat') || h.includes('résultat'))) {
          table.dataset.tableType = 'resultat';
        } else if (headers.some(h => h.includes('assertion') || h.includes('conclusion'))) {
          table.dataset.tableType = 'pointage';
        } else {
          table.dataset.tableType = 'standard';
        }
      }
      console.log(`    ✅ Type défini: ${table.dataset.tableType}`);
    }

    // Indexer les cellules
    const tbody = table.querySelector('tbody');
    const rows = tbody ? tbody.querySelectorAll('tr') : table.querySelectorAll('tr:not(thead tr)');

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td, th');

      cells.forEach((cell, colIndex) => {
        // Ajouter les index
        cell.dataset.rowIndex = rowIndex;
        cell.dataset.cellIndex = colIndex;

        // Sauvegarder l'état initial si pas déjà fait
        if (!cell.dataset.cellState) {
          const state = {
            value: cell.textContent.trim(),
            html: cell.innerHTML,
            bgColor: cell.style.backgroundColor || '',
            color: cell.style.color || '',
            fontWeight: cell.style.fontWeight || '',
            classList: Array.from(cell.classList),
            timestamp: Date.now()
          };

          cell.dataset.cellState = JSON.stringify(state);
          cell.dataset.lastModified = state.timestamp.toString();
        }

        indexedCount++;
      });
    });

    console.log(`    ✅ ${rows.length} ligne(s), ${indexedCount} cellule(s) indexées`);

    // Sauvegarder la table avec l'API
    if (window.ClaraverseTableData && typeof window.ClaraverseTableData.saveTable === 'function') {
      try {
        const result = window.ClaraverseTableData.saveTable(table);
        if (result) {
          savedCount++;
          console.log(`    ✅ Table sauvegardée avec l'API`);
        } else {
          console.warn(`    ⚠️  saveTable() a retourné false`);
        }
      } catch (error) {
        console.error(`    ❌ Erreur sauvegarde: ${error.message}`);
      }
    }
  });

  // ============================================================================
  // ÉTAPE 4 : Ajouter des event listeners manuellement si nécessaire
  // ============================================================================

  console.log("\n🎧 Configuration des event listeners...");

  const editableCells = document.querySelectorAll('td[contenteditable="true"], td[contenteditable]');

  if (editableCells.length === 0) {
    console.warn("⚠️  Aucune cellule avec contenteditable='true' trouvée");
    console.log("   Pour que la sauvegarde automatique fonctionne, ajoutez:");
    console.log("   <td contenteditable='true'>Contenu</td>");
  } else {
    console.log(`✅ ${editableCells.length} cellule(s) éditable(s) trouvée(s)`);

    // Ajouter des listeners si le manager ne l'a pas fait
    let listenerCount = 0;

    editableCells.forEach(cell => {
      // Vérifier si des listeners existent déjà
      const hasListeners = manager.eventListeners && manager.eventListeners.has(cell);

      if (!hasListeners) {
        // Ajouter des listeners manuellement

        // Listener blur (perte de focus)
        cell.addEventListener('blur', function() {
          saveCellState(this);
          const table = this.closest('table');
          if (table && window.ClaraverseTableData) {
            window.ClaraverseTableData.saveTable(table);
          }
        });

        // Listener input (changement de contenu)
        let inputTimeout;
        cell.addEventListener('input', function() {
          clearTimeout(inputTimeout);
          inputTimeout = setTimeout(() => {
            saveCellState(this);
          }, 300);
        });

        listenerCount++;
      }
    });

    if (listenerCount > 0) {
      console.log(`✅ ${listenerCount} listener(s) ajouté(s) manuellement`);
    } else {
      console.log(`✅ Listeners déjà configurés par le manager`);
    }
  }

  // ============================================================================
  // FONCTION UTILITAIRE : Sauvegarder l'état d'une cellule
  // ============================================================================

  function saveCellState(cell) {
    const state = {
      value: cell.textContent.trim(),
      html: cell.innerHTML,
      bgColor: cell.style.backgroundColor || '',
      color: cell.style.color || '',
      fontWeight: cell.style.fontWeight || '',
      classList: Array.from(cell.classList),
      timestamp: Date.now()
    };

    cell.dataset.cellState = JSON.stringify(state);
    cell.dataset.lastModified = state.timestamp.toString();

    console.log(`💾 Cellule sauvegardée [${cell.dataset.rowIndex}, ${cell.dataset.cellIndex}]: "${state.value}"`);
  }

  // ============================================================================
  // ÉTAPE 5 : Exposer des fonctions utilitaires globales
  // ============================================================================

  window.ForceSave = {
    // Sauvegarder toutes les tables
    saveAll: function() {
      console.log("💾 Sauvegarde de toutes les tables...");
      let count = 0;

      document.querySelectorAll('table').forEach(table => {
        if (window.ClaraverseTableData) {
          if (window.ClaraverseTableData.saveTable(table)) {
            count++;
          }
        }
      });

      console.log(`✅ ${count} table(s) sauvegardée(s)`);
      return count;
    },

    // Sauvegarder une table spécifique
    saveTable: function(tableIdOrElement) {
      let table;

      if (typeof tableIdOrElement === 'string') {
        table = document.querySelector(`[data-table-id="${tableIdOrElement}"]`);
      } else {
        table = tableIdOrElement;
      }

      if (!table) {
        console.error("❌ Table non trouvée");
        return false;
      }

      if (window.ClaraverseTableData) {
        return window.ClaraverseTableData.saveTable(table);
      }

      return false;
    },

    // Voir l'état de toutes les cellules
    showState: function() {
      const cells = document.querySelectorAll('td[data-cell-state]');
      console.log(`📊 ${cells.length} cellule(s) avec état sauvegardé:`);

      cells.forEach((cell, index) => {
        if (index < 10) { // Afficher seulement les 10 premières
          try {
            const state = JSON.parse(cell.dataset.cellState);
            console.log(`  [${cell.dataset.rowIndex}, ${cell.dataset.cellIndex}]: "${state.value}"`);
          } catch (e) {
            console.warn(`  Erreur parsing cellule ${index}`);
          }
        }
      });

      if (cells.length > 10) {
        console.log(`  ... et ${cells.length - 10} autre(s)`);
      }
    },

    // Réinitialiser tout
    reset: function() {
      console.log("🔄 Réinitialisation...");

      // Supprimer tous les attributs data-cell-state
      document.querySelectorAll('[data-cell-state]').forEach(cell => {
        delete cell.dataset.cellState;
        delete cell.dataset.lastModified;
      });

      // Forcer la réindexation
      if (manager && typeof manager.discoverAllTables === 'function') {
        manager.discoverAllTables();
      }

      console.log("✅ Réinitialisation terminée");
    },

    // Test complet
    test: function() {
      console.log("🧪 Test de sauvegarde...");

      const testCell = document.querySelector('td[contenteditable="true"]');

      if (!testCell) {
        console.error("❌ Aucune cellule éditable trouvée");
        return false;
      }

      const originalValue = testCell.textContent;
      console.log(`  Valeur originale: "${originalValue}"`);

      // Modifier
      testCell.textContent = "TEST_" + Date.now();
      console.log(`  Nouvelle valeur: "${testCell.textContent}"`);

      // Déclencher blur
      testCell.dispatchEvent(new Event('blur', { bubbles: true }));

      // Vérifier
      setTimeout(() => {
        if (testCell.dataset.cellState) {
          const state = JSON.parse(testCell.dataset.cellState);
          if (state.value === testCell.textContent) {
            console.log("✅ TEST RÉUSSI : La cellule a été sauvegardée");
          } else {
            console.error("❌ TEST ÉCHOUÉ : Valeur non sauvegardée");
          }
        } else {
          console.error("❌ TEST ÉCHOUÉ : Pas de data-cell-state");
        }

        // Restaurer
        testCell.textContent = originalValue;
        testCell.dispatchEvent(new Event('blur', { bubbles: true }));
      }, 500);

      return true;
    }
  };

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================

  console.log("\n");
  console.log("🔧 ========================================");
  console.log("🔧 RÉSUMÉ DE LA CORRECTION");
  console.log("🔧 ========================================\n");

  console.log(`✅ ${allTables.length} table(s) détectée(s)`);
  console.log(`✅ ${indexedCount} cellule(s) indexée(s)`);
  console.log(`✅ ${savedCount} table(s) sauvegardée(s)`);
  console.log(`✅ ${editableCells.length} cellule(s) éditable(s)`);

  // Vérifier que tout fonctionne
  const cellsWithState = document.querySelectorAll('td[data-cell-state]').length;
  console.log(`✅ ${cellsWithState} cellule(s) avec état sauvegardé`);

  if (cellsWithState === 0) {
    console.warn("\n⚠️  ATTENTION: Aucune cellule n'a d'état sauvegardé !");
    console.warn("   Cela peut être normal si les tables sont vides");
  }

  console.log("\n💡 FONCTIONS DISPONIBLES:");
  console.log("   ForceSave.saveAll()        - Sauvegarder toutes les tables");
  console.log("   ForceSave.saveTable(id)    - Sauvegarder une table");
  console.log("   ForceSave.showState()      - Voir l'état des cellules");
  console.log("   ForceSave.reset()          - Réinitialiser");
  console.log("   ForceSave.test()           - Tester la sauvegarde");

  console.log("\n🔧 ========================================");
  console.log("🔧 CORRECTION TERMINÉE");
  console.log("🔧 ========================================\n");

  // Auto-test si demandé
  if (window.location.hash === '#autotest') {
    console.log("🧪 Auto-test activé (URL contient #autotest)");
    setTimeout(() => ForceSave.test(), 1000);
  }

  return {
    tables: allTables.length,
    indexed: indexedCount,
    saved: savedCount,
    editable: editableCells.length,
    withState: cellsWithState
  };
})();
