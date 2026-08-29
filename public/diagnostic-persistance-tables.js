/**
 * Script de Diagnostic - Persistance des Tables
 * Vérifie pourquoi Table_conso et Résultat ne sont pas persistantes
 */

(function() {
  'use strict';

  console.log("🔍 [Diagnostic] Script de diagnostic de persistance chargé");

  // Attendre que tout soit chargé
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      runDiagnostic();
    }, 3000); // Attendre 3 secondes après le chargement
  });

  function runDiagnostic() {
    console.log("\n" + "=".repeat(60));
    console.log("🔍 DIAGNOSTIC DE PERSISTANCE DES TABLES");
    console.log("=".repeat(60) + "\n");

    // 1. Vérifier que l'intégration est chargée
    console.log("1️⃣ Vérification de l'intégration conso-indexeddb");
    console.log("------------------------------------------------");
    
    if (typeof consoIndexedDBIntegration !== 'undefined') {
      console.log("✅ consoIndexedDBIntegration est défini");
      console.log("   Méthodes disponibles:", Object.keys(consoIndexedDBIntegration));
    } else {
      console.error("❌ consoIndexedDBIntegration N'EST PAS défini");
      console.error("   → Le script conso-indexeddb-integration.js n'est pas chargé !");
    }

    // 2. Vérifier conso.js
    console.log("\n2️⃣ Vérification de conso.js");
    console.log("------------------------------------------------");
    
    if (typeof window.saveTableDataNow !== 'undefined') {
      console.log("✅ saveTableDataNow existe");
      console.log("   Type:", typeof window.saveTableDataNow);
      
      // Vérifier si c'est notre version remplacée
      const fnString = window.saveTableDataNow.toString();
      if (fnString.includes('IndexedDB') || fnString.includes('flowise:table:save')) {
        console.log("✅ saveTableDataNow a été REMPLACÉE par l'intégration");
      } else {
        console.warn("⚠️ saveTableDataNow N'A PAS été remplacée");
        console.warn("   → Utilise toujours localStorage");
      }
    } else {
      console.error("❌ saveTableDataNow n'existe pas");
    }

    // 3. Vérifier les services
    console.log("\n3️⃣ Vérification des services");
    console.log("------------------------------------------------");
    
    if (window.flowiseTableBridge) {
      console.log("✅ flowiseTableBridge disponible");
    } else {
      console.error("❌ flowiseTableBridge NON disponible");
    }
    
    if (window.flowiseTableService) {
      console.log("✅ flowiseTableService disponible");
    } else {
      console.error("❌ flowiseTableService NON disponible");
    }

    // 4. Chercher les tables dans le DOM
    console.log("\n4️⃣ Recherche des tables dans le DOM");
    console.log("------------------------------------------------");
    
    const allTables = document.querySelectorAll('table');
    console.log(`📊 ${allTables.length} table(s) trouvée(s) dans le DOM`);
    
    // Chercher spécifiquement Table_conso et Résultat
    let tableConsoFound = false;
    let tableResultatFound = false;
    
    allTables.forEach((table, index) => {
      const wrapper = table.closest('[data-keyword]');
      const keyword = wrapper ? wrapper.getAttribute('data-keyword') : null;
      
      // Vérifier le contenu des en-têtes
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      const firstHeader = headers[0] || '';
      
      if (keyword === 'Table_Consolidation' || firstHeader.includes('Table_Consolidation')) {
        console.log(`\n   ✅ Table ${index + 1}: TABLE_CONSO trouvée`);
        console.log(`      Keyword: ${keyword || '(aucun)'}`);
        console.log(`      En-têtes: ${headers.join(', ')}`);
        tableConsoFound = true;
      }
      
      if (keyword === 'Table_Resultat' || firstHeader.includes('Résultat')) {
        console.log(`\n   ✅ Table ${index + 1}: TABLE_RESULTAT trouvée`);
        console.log(`      Keyword: ${keyword || '(aucun)'}`);
        console.log(`      En-têtes: ${headers.join(', ')}`);
        tableResultatFound = true;
      }
    });
    
    if (!tableConsoFound) {
      console.warn("   ⚠️ Table_conso NON trouvée dans le DOM");
    }
    if (!tableResultatFound) {
      console.warn("   ⚠️ Table_Resultat NON trouvée dans le DOM");
    }

    // 5. Vérifier IndexedDB
    console.log("\n5️⃣ Vérification d'IndexedDB");
    console.log("------------------------------------------------");
    
    checkIndexedDB();

    // 6. Vérifier localStorage (ancien système)
    console.log("\n6️⃣ Vérification de localStorage (ancien système)");
    console.log("------------------------------------------------");
    
    try {
      const oldData = localStorage.getItem('claraverse_tables_data');
      if (oldData) {
        const parsed = JSON.parse(oldData);
        const tableCount = Object.keys(parsed).length;
        console.log(`⚠️ ${tableCount} table(s) dans localStorage (ancien système)`);
        console.log("   Tables:", Object.keys(parsed).join(', '));
      } else {
        console.log("✅ Pas de données dans localStorage");
      }
    } catch (e) {
      console.log("✅ Pas de données localStorage ou erreur:", e.message);
    }

    // 7. Vérifier sessionStorage
    console.log("\n7️⃣ Vérification de sessionStorage");
    console.log("------------------------------------------------");
    
    const sessionId = sessionStorage.getItem('claraverse_stable_session');
    if (sessionId) {
      console.log("✅ SessionId stable:", sessionId);
    } else {
      console.warn("⚠️ Pas de sessionId stable dans sessionStorage");
    }

    // 8. Écouter les événements de sauvegarde
    console.log("\n8️⃣ Installation d'écouteurs d'événements");
    console.log("------------------------------------------------");
    
    document.addEventListener('flowise:table:save:request', (e) => {
      console.log("💾 [ÉVÉNEMENT] flowise:table:save:request détecté");
      console.log("   Keyword:", e.detail.keyword);
      console.log("   SessionId:", e.detail.sessionId);
      console.log("   Source:", e.detail.source);
    });
    
    document.addEventListener('flowise:table:save:success', (e) => {
      console.log("✅ [ÉVÉNEMENT] flowise:table:save:success");
      console.log("   Keyword:", e.detail.keyword);
    });
    
    document.addEventListener('flowise:table:save:error', (e) => {
      console.error("❌ [ÉVÉNEMENT] flowise:table:save:error");
      console.error("   Error:", e.detail.error);
    });

    console.log("✅ Écouteurs installés");

    // Résumé final
    console.log("\n" + "=".repeat(60));
    console.log("📋 RÉSUMÉ DU DIAGNOSTIC");
    console.log("=".repeat(60));
    
    const issues = [];
    
    if (typeof consoIndexedDBIntegration === 'undefined') {
      issues.push("❌ Script d'intégration non chargé");
    }
    
    if (typeof window.saveTableDataNow === 'undefined') {
      issues.push("❌ conso.js non chargé");
    } else {
      const fnString = window.saveTableDataNow.toString();
      if (!fnString.includes('IndexedDB') && !fnString.includes('flowise:table:save')) {
        issues.push("❌ saveTableDataNow non remplacée");
      }
    }
    
    if (!window.flowiseTableBridge) {
      issues.push("❌ flowiseTableBridge manquant");
    }
    
    if (!tableConsoFound) {
      issues.push("⚠️ Table_conso non trouvée");
    }
    
    if (!tableResultatFound) {
      issues.push("⚠️ Table_Resultat non trouvée");
    }
    
    if (issues.length > 0) {
      console.error("\n🚨 PROBLÈMES DÉTECTÉS:");
      issues.forEach(issue => console.error("   " + issue));
      
      console.log("\n💡 SOLUTIONS SUGGÉRÉES:");
      if (typeof consoIndexedDBIntegration === 'undefined') {
        console.log("   1. Vérifier que conso-indexeddb-integration.js est chargé");
        console.log("      → F12 > Réseau > Filtrer 'conso-indexeddb'");
      }
      if (!window.flowiseTableBridge) {
        console.log("   2. Vérifier que menuIntegration.ts est compilé");
        console.log("      → Redémarrer le serveur frontend");
      }
      if (!tableConsoFound || !tableResultatFound) {
        console.log("   3. Générer les tables en utilisant l'application");
        console.log("      → Puis réexécuter: window.runDiagnostic()");
      }
    } else {
      console.log("✅ Aucun problème détecté");
      console.log("   Le système devrait fonctionner correctement");
    }
    
    console.log("\n📞 COMMANDES DISPONIBLES:");
    console.log("   window.runDiagnostic()          → Réexécuter ce diagnostic");
    console.log("   consoIndexedDBIntegration.quickTest()  → Test rapide");
    console.log("   testConsoIndexedDB.runAllTests()       → Tests complets");
    
    console.log("\n" + "=".repeat(60) + "\n");
  }

  async function checkIndexedDB() {
    try {
      const dbName = 'clara_db';
      const storeName = 'clara_generated_tables';
      
      const request = indexedDB.open(dbName);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        console.log(`✅ Base de données "${dbName}" accessible`);
        console.log("   Version:", db.version);
        console.log("   Stores:", Array.from(db.objectStoreNames).join(', '));
        
        // Compter les tables
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          const count = countRequest.result;
          console.log(`📊 ${count} table(s) dans IndexedDB`);
          
          if (count > 0) {
            // Récupérer quelques tables pour analyse
            const getAllRequest = store.getAll();
            getAllRequest.onsuccess = () => {
              const tables = getAllRequest.result;
              console.log("\n   Tables stockées:");
              tables.slice(0, 5).forEach((table, i) => {
                console.log(`   ${i + 1}. Keyword: ${table.keyword}, SessionId: ${table.sessionId?.substring(0, 30)}...`);
              });
              
              // Chercher spécifiquement Table_conso et Résultat
              const tableConso = tables.find(t => 
                t.keyword === 'Table_Consolidation' || 
                t.keyword === 'Table_conso'
              );
              const tableResultat = tables.find(t => 
                t.keyword === 'Table_Resultat' || 
                t.keyword === 'Resultat'
              );
              
              if (tableConso) {
                console.log("\n   ✅ Table_conso trouvée dans IndexedDB");
                console.log("      ID:", tableConso.id);
                console.log("      Timestamp:", tableConso.timestamp);
              } else {
                console.warn("   ⚠️ Table_conso NON trouvée dans IndexedDB");
              }
              
              if (tableResultat) {
                console.log("\n   ✅ Table_Resultat trouvée dans IndexedDB");
                console.log("      ID:", tableResultat.id);
                console.log("      Timestamp:", tableResultat.timestamp);
              } else {
                console.warn("   ⚠️ Table_Resultat NON trouvée dans IndexedDB");
              }
            };
          }
        };
        
        db.close();
      };
      
      request.onerror = (event) => {
        console.error("❌ Erreur d'accès à IndexedDB:", event.target.error);
      };
      
    } catch (error) {
      console.error("❌ Erreur lors de la vérification IndexedDB:", error);
    }
  }

  // Exposer la fonction globalement
  window.runDiagnostic = runDiagnostic;

})();
