/**
 * Script de test pour l'intégration conso.js → IndexedDB
 * À exécuter dans la console du navigateur après le chargement de la page
 */

(function() {
  "use strict";

  window.testConsoIndexedDB = {
    /**
     * Test complet de l'intégration
     */
    runAllTests: async function() {
      console.log("\n");
      console.log("╔════════════════════════════════════════════════════════╗");
      console.log("║   TEST INTÉGRATION CONSO.JS → INDEXEDDB                ║");
      console.log("╚════════════════════════════════════════════════════════╝");
      console.log("\n");

      const results = {
        passed: 0,
        failed: 0,
        tests: []
      };

      // Test 1: Vérifier que l'intégration est chargée
      console.log("📋 Test 1: Vérification du chargement de l'intégration");
      if (window.consoIndexedDBIntegration) {
        console.log("  ✅ PASS: consoIndexedDBIntegration est disponible");
        console.log("  📌 Version:", window.consoIndexedDBIntegration.version);
        results.passed++;
        results.tests.push({name: "Chargement intégration", status: "PASS"});
      } else {
        console.log("  ❌ FAIL: consoIndexedDBIntegration n'est pas disponible");
        results.failed++;
        results.tests.push({name: "Chargement intégration", status: "FAIL"});
      }

      // Test 2: Vérifier que conso.js est chargé
      console.log("\n📋 Test 2: Vérification du chargement de conso.js");
      if (window.claraverseTableProcessor) {
        console.log("  ✅ PASS: claraverseTableProcessor est disponible");
        results.passed++;
        results.tests.push({name: "Chargement conso.js", status: "PASS"});
      } else {
        console.log("  ❌ FAIL: claraverseTableProcessor n'est pas disponible");
        results.failed++;
        results.tests.push({name: "Chargement conso.js", status: "FAIL"});
      }

      // Test 3: Vérifier les services backend
      console.log("\n📋 Test 3: Vérification des services backend");
      const services = {
        flowiseTableBridge: !!window.flowiseTableBridge,
        flowiseTableService: !!window.flowiseTableService
      };
      
      if (services.flowiseTableBridge && services.flowiseTableService) {
        console.log("  ✅ PASS: Services backend disponibles");
        console.log("    - flowiseTableBridge:", services.flowiseTableBridge);
        console.log("    - flowiseTableService:", services.flowiseTableService);
        results.passed++;
        results.tests.push({name: "Services backend", status: "PASS"});
      } else {
        console.log("  ❌ FAIL: Services backend manquants");
        console.log("    - flowiseTableBridge:", services.flowiseTableBridge);
        console.log("    - flowiseTableService:", services.flowiseTableService);
        results.failed++;
        results.tests.push({name: "Services backend", status: "FAIL"});
      }

      // Test 4: Obtenir le sessionId
      console.log("\n📋 Test 4: Obtention du sessionId");
      try {
        const sessionId = await window.consoIndexedDBIntegration.getCurrentSession();
        console.log("  ✅ PASS: SessionId obtenu:", sessionId);
        results.passed++;
        results.tests.push({name: "Obtention sessionId", status: "PASS", data: sessionId});
      } catch (error) {
        console.log("  ❌ FAIL: Erreur lors de l'obtention du sessionId:", error);
        results.failed++;
        results.tests.push({name: "Obtention sessionId", status: "FAIL", error: error.message});
      }

      // Test 5: Trouver des tables
      console.log("\n📋 Test 5: Détection des tables");
      const tables = document.querySelectorAll('table');
      if (tables.length > 0) {
        console.log(`  ✅ PASS: ${tables.length} table(s) détectée(s)`);
        results.passed++;
        results.tests.push({name: "Détection tables", status: "PASS", data: tables.length});

        // Test 5b: Extraire keywords
        console.log("\n📋 Test 5b: Extraction des keywords");
        const keywords = [];
        tables.forEach((table, index) => {
          try {
            const keyword = window.consoIndexedDBIntegration.extractKeyword(table);
            keywords.push(keyword);
            console.log(`    Table ${index + 1}: "${keyword}"`);
          } catch (error) {
            console.log(`    Table ${index + 1}: Erreur -`, error.message);
          }
        });
        
        if (keywords.length > 0) {
          console.log("  ✅ PASS: Keywords extraits avec succès");
          results.passed++;
          results.tests.push({name: "Extraction keywords", status: "PASS", data: keywords});
        } else {
          console.log("  ⚠️ WARN: Aucun keyword extrait");
          results.tests.push({name: "Extraction keywords", status: "WARN"});
        }

      } else {
        console.log("  ⚠️ WARN: Aucune table trouvée dans le DOM");
        results.tests.push({name: "Détection tables", status: "WARN"});
      }

      // Test 6: Test de sauvegarde
      console.log("\n📋 Test 6: Test de sauvegarde");
      if (tables.length > 0) {
        try {
          const testTable = tables[0];
          const keyword = window.consoIndexedDBIntegration.extractKeyword(testTable);
          console.log(`  📝 Tentative de sauvegarde de la table: "${keyword}"`);
          
          await window.consoIndexedDBIntegration.saveTable(testTable);
          console.log("  ✅ PASS: Sauvegarde effectuée sans erreur");
          results.passed++;
          results.tests.push({name: "Test sauvegarde", status: "PASS", data: keyword});
        } catch (error) {
          console.log("  ❌ FAIL: Erreur lors de la sauvegarde:", error);
          results.failed++;
          results.tests.push({name: "Test sauvegarde", status: "FAIL", error: error.message});
        }
      } else {
        console.log("  ⚠️ SKIP: Aucune table pour tester la sauvegarde");
        results.tests.push({name: "Test sauvegarde", status: "SKIP"});
      }

      // Test 7: Vérifier IndexedDB
      console.log("\n📋 Test 7: Vérification IndexedDB");
      try {
        const dbExists = await this.checkIndexedDB();
        if (dbExists) {
          console.log("  ✅ PASS: Base de données clara_db accessible");
          results.passed++;
          results.tests.push({name: "IndexedDB accessible", status: "PASS"});
        } else {
          console.log("  ❌ FAIL: Base de données clara_db non accessible");
          results.failed++;
          results.tests.push({name: "IndexedDB accessible", status: "FAIL"});
        }
      } catch (error) {
        console.log("  ❌ FAIL: Erreur lors de la vérification IndexedDB:", error);
        results.failed++;
        results.tests.push({name: "IndexedDB accessible", status: "FAIL", error: error.message});
      }

      // Test 8: Vérifier les données sauvegardées
      console.log("\n📋 Test 8: Vérification des données sauvegardées");
      try {
        const tablesInDB = await this.getTablesFromIndexedDB();
        if (tablesInDB.length > 0) {
          console.log(`  ✅ PASS: ${tablesInDB.length} table(s) trouvée(s) dans IndexedDB`);
          tablesInDB.forEach((table, index) => {
            console.log(`    ${index + 1}. Keyword: "${table.keyword}", Session: ${table.sessionId.substring(0, 20)}...`);
          });
          results.passed++;
          results.tests.push({name: "Tables dans IndexedDB", status: "PASS", data: tablesInDB.length});
        } else {
          console.log("  ⚠️ WARN: Aucune table trouvée dans IndexedDB");
          results.tests.push({name: "Tables dans IndexedDB", status: "WARN"});
        }
      } catch (error) {
        console.log("  ❌ FAIL: Erreur lors de la récupération des tables:", error);
        results.failed++;
        results.tests.push({name: "Tables dans IndexedDB", status: "FAIL", error: error.message});
      }

      // Test 9: Vérifier la migration
      console.log("\n📋 Test 9: Vérification de la migration localStorage");
      const migrationDone = localStorage.getItem('claraverse_migration_done');
      if (migrationDone === 'true') {
        console.log("  ✅ PASS: Migration déjà effectuée");
        results.passed++;
        results.tests.push({name: "Migration localStorage", status: "PASS"});
      } else {
        console.log("  ℹ️ INFO: Migration pas encore effectuée");
        results.tests.push({name: "Migration localStorage", status: "INFO"});
      }

      // Résumé
      console.log("\n");
      console.log("╔════════════════════════════════════════════════════════╗");
      console.log("║   RÉSUMÉ DES TESTS                                     ║");
      console.log("╚════════════════════════════════════════════════════════╝");
      console.log("\n");
      console.log(`  ✅ Tests réussis:  ${results.passed}`);
      console.log(`  ❌ Tests échoués:  ${results.failed}`);
      console.log(`  📊 Total:          ${results.tests.length}`);
      console.log("\n");

      // Afficher les échecs
      const failures = results.tests.filter(t => t.status === "FAIL");
      if (failures.length > 0) {
        console.log("❌ Tests échoués:");
        failures.forEach(test => {
          console.log(`  - ${test.name}: ${test.error || "Erreur inconnue"}`);
        });
        console.log("\n");
      }

      // Verdict final
      if (results.failed === 0) {
        console.log("🎉 SUCCÈS: Tous les tests sont passés!");
        console.log("✅ L'intégration conso.js → IndexedDB fonctionne correctement");
      } else {
        console.log("⚠️ ATTENTION: Certains tests ont échoué");
        console.log("🔧 Vérifiez les erreurs ci-dessus pour diagnostiquer les problèmes");
      }

      console.log("\n");
      return results;
    },

    /**
     * Vérifier si IndexedDB est accessible
     */
    checkIndexedDB: function() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('clara_db');
        
        request.onsuccess = function() {
          request.result.close();
          resolve(true);
        };
        
        request.onerror = function() {
          reject(new Error('Impossible d\'ouvrir IndexedDB'));
        };
      });
    },

    /**
     * Récupérer les tables depuis IndexedDB
     */
    getTablesFromIndexedDB: function() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('clara_db');
        
        request.onsuccess = function() {
          const db = request.result;
          const transaction = db.transaction(['clara_generated_tables'], 'readonly');
          const store = transaction.objectStore('clara_generated_tables');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = function() {
            db.close();
            resolve(getAllRequest.result || []);
          };
          
          getAllRequest.onerror = function() {
            db.close();
            reject(new Error('Erreur lors de la récupération des tables'));
          };
        };
        
        request.onerror = function() {
          reject(new Error('Impossible d\'ouvrir IndexedDB'));
        };
      });
    },

    /**
     * Test rapide (version courte)
     */
    quickTest: async function() {
      console.log("🚀 Test rapide de l'intégration...\n");
      
      if (!window.consoIndexedDBIntegration) {
        console.log("❌ consoIndexedDBIntegration non chargé");
        return;
      }
      
      console.log("✅ Intégration chargée");
      
      const sessionId = await window.consoIndexedDBIntegration.getCurrentSession();
      console.log("✅ SessionId:", sessionId);
      
      const tables = document.querySelectorAll('table');
      console.log(`✅ ${tables.length} table(s) détectée(s)`);
      
      if (tables.length > 0) {
        const keyword = window.consoIndexedDBIntegration.extractKeyword(tables[0]);
        console.log("✅ Keyword:", keyword);
      }
      
      console.log("\n✅ Test rapide terminé");
    }
  };

  console.log("✅ Tests disponibles:");
  console.log("  - testConsoIndexedDB.runAllTests() : Exécuter tous les tests");
  console.log("  - testConsoIndexedDB.quickTest() : Test rapide");

})();
