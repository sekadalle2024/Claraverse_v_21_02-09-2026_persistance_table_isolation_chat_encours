/**
 * SCRIPT DE DIAGNOSTIC - Persistance & Isolation des Tables
 * 
 * À exécuter dans la console navigateur pour diagnostiquer rapidement
 * les problèmes de persistance et d'isolation.
 * 
 * Usage: 
 * 1. Ouvrir console (F12)
 * 2. Copier-coller ce script
 * 3. Ou charger: <script src="/diagnostic-persistance.js"></script>
 * 4. Taper: runDiagnostic()
 */

window.runDiagnostic = async function() {
  console.clear();
  console.log("═".repeat(70));
  console.log("🔍 DIAGNOSTIC PERSISTANCE & ISOLATION - ClaraVerse");
  console.log("═".repeat(70));
  console.log("");

  const results = {
    errors: [],
    warnings: [],
    success: []
  };

  // ═══════════════════════════════════════════════════════════════════
  // TEST 1: Vérifier présence data-session-id dans DOM
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 TEST 1: Exposition data-session-id par React");
  console.log("─".repeat(70));
  
  const sessionElement = document.querySelector('[data-session-id], [data-chat-session-id]');
  if (sessionElement) {
    const sessionId = sessionElement.getAttribute('data-session-id') || 
                     sessionElement.getAttribute('data-chat-session-id');
    
    if (sessionId && sessionId !== 'undefined' && sessionId !== 'unknown') {
      console.log("✅ data-session-id trouvé dans DOM");
      console.log(`   SessionId: ${sessionId.substring(0, 40)}...`);
      results.success.push("data-session-id exposé par React");
    } else {
      console.error("❌ data-session-id existe mais valeur invalide:", sessionId);
      results.errors.push("data-session-id invalide (undefined/unknown)");
    }
  } else {
    console.error("❌ data-session-id ABSENT du DOM");
    console.error("   → React ne compile pas ou currentSession undefined");
    console.error("   → Isolation des chats NON GARANTIE");
    results.errors.push("data-session-id absent - isolation compromise");
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // TEST 2: Vérifier claraverseProcessor chargé
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 TEST 2: Chargement claraverseProcessor (conso.js)");
  console.log("─".repeat(70));
  
  if (window.claraverseProcessor) {
    console.log("✅ claraverseProcessor chargé");
    
    if (window.claraverseProcessor.__integrated) {
      console.log("✅ Script inline intégré (sauvegarde vers IndexedDB active)");
      results.success.push("claraverseProcessor intégré");
    } else {
      console.warn("⚠️ Script inline NON intégré");
      results.warnings.push("Script inline pas encore intégré - attendre chargement");
    }
  } else {
    console.error("❌ claraverseProcessor NON CHARGÉ");
    console.error("   → conso.js ne s'est pas chargé correctement");
    results.errors.push("claraverseProcessor absent");
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // TEST 3: Vérifier intégration inline
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 TEST 3: Intégration script inline (index.html)");
  console.log("─".repeat(70));
  
  if (window.consoIndexedDBIntegration) {
    console.log("✅ Script inline chargé");
    console.log(`   Version: ${window.consoIndexedDBIntegration.version}`);
    results.success.push("Script inline présent");
  } else {
    console.error("❌ consoIndexedDBIntegration NON TROUVÉ");
    console.error("   → Script inline dans index.html ne s'exécute pas");
    results.errors.push("Script inline absent");
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // TEST 4: Vérifier tables dans DOM avec data-keyword
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 TEST 4: Tables avec data-keyword dans DOM");
  console.log("─".repeat(70));
  
  const tablesWithKeyword = document.querySelectorAll('table[data-keyword]');
  const allTables = document.querySelectorAll('table');
  
  console.log(`📊 Tables dans DOM: ${allTables.length} total(es)`);
  console.log(`📊 Tables avec data-keyword: ${tablesWithKeyword.length}`);
  
  if (tablesWithKeyword.length > 0) {
    console.log("✅ Au moins une table a data-keyword");
    tablesWithKeyword.forEach((table, i) => {
      const keyword = table.dataset.keyword;
      const tableId = table.dataset.tableId;
      console.log(`   ${i+1}. keyword="${keyword}" id="${tableId}"`);
    });
    results.success.push(`${tablesWithKeyword.length} table(s) avec data-keyword`);
  } else if (allTables.length > 0) {
    console.warn("⚠️ Tables présentes mais AUCUNE n'a data-keyword");
    console.warn("   → conso.js n'ajoute pas data-keyword à la création");
    results.warnings.push("Tables sans data-keyword - ne seront pas restaurées");
  } else {
    console.log("ℹ️ Aucune table dans le DOM (normal si page vide)");
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // TEST 5: Vérifier flowiseTableBridge
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 TEST 5: Service flowiseTableBridge");
  console.log("─".repeat(70));
  
  if (window.flowiseTableBridge) {
    console.log("✅ flowiseTableBridge disponible");
    
    if (typeof window.flowiseTableBridge.restoreTablesForSession === 'function') {
      console.log("✅ Méthode restoreTablesForSession disponible");
      results.success.push("flowiseTableBridge opérationnel");
    } else {
      console.error("❌ Méthode restoreTablesForSession manquante");
      results.errors.push("flowiseTableBridge incomplet");
    }
  } else {
    console.error("❌ flowiseTableBridge NON TROUVÉ");
    results.errors.push("flowiseTableBridge absent");
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // TEST 6: Vérifier IndexedDB
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 TEST 6: IndexedDB clara_db");
  console.log("─".repeat(70));
  
  try {
    const dbRequest = indexedDB.open('clara_db', 1);
    
    await new Promise((resolve, reject) => {
      dbRequest.onsuccess = async (e) => {
        const db = e.target.result;
        
        if (db.objectStoreNames.contains('clara_generated_tables')) {
          console.log("✅ Store 'clara_generated_tables' existe");
          
          try {
            const tx = db.transaction('clara_generated_tables', 'readonly');
            const store = tx.objectStore('clara_generated_tables');
            const countRequest = store.count();
            
            countRequest.onsuccess = () => {
              const count = countRequest.result;
              console.log(`📊 Nombre de tables sauvegardées: ${count}`);
              
              if (count > 0) {
                results.success.push(`${count} table(s) sauvegardée(s) dans IndexedDB`);
                
                // Lister les premières tables
                const getAllRequest = store.getAll();
                getAllRequest.onsuccess = () => {
                  const tables = getAllRequest.result.slice(0, 5); // 5 premières
                  console.log("📋 Exemples de tables sauvegardées:");
                  tables.forEach((t, i) => {
                    console.log(`   ${i+1}. keyword="${t.keyword}" session=${t.sessionId?.substring(0, 20)}...`);
                  });
                  if (getAllRequest.result.length > 5) {
                    console.log(`   ... et ${getAllRequest.result.length - 5} autre(s)`);
                  }
                  resolve();
                };
              } else {
                console.log("ℹ️ Aucune table sauvegardée (normal si première utilisation)");
                resolve();
              }
            };
            
            countRequest.onerror = () => {
              console.error("❌ Erreur lecture IndexedDB");
              results.errors.push("Erreur accès IndexedDB");
              resolve();
            };
          } catch (e) {
            console.error("❌ Erreur transaction IndexedDB:", e.message);
            results.errors.push("Transaction IndexedDB échouée");
            resolve();
          }
        } else {
          console.error("❌ Store 'clara_generated_tables' n'existe pas");
          results.errors.push("Store IndexedDB manquant");
          resolve();
        }
      };
      
      dbRequest.onerror = () => {
        console.error("❌ Impossible d'ouvrir IndexedDB clara_db");
        results.errors.push("IndexedDB inaccessible");
        resolve();
      };
    });
  } catch (e) {
    console.error("❌ Erreur IndexedDB:", e.message);
    results.errors.push("Erreur IndexedDB: " + e.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // TEST 7: Vérifier localStorage (doit être vide)
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 TEST 7: localStorage (doit être désactivé)");
  console.log("─".repeat(70));
  
  const oldData = localStorage.getItem('claraverse_tables_data');
  if (oldData) {
    console.warn("⚠️ localStorage 'claraverse_tables_data' existe encore");
    console.warn("   → Ancien système actif, peut causer conflits");
    console.warn("   → Sera nettoyé au prochain chargement");
    results.warnings.push("localStorage ancien système présent");
  } else {
    console.log("✅ localStorage 'claraverse_tables_data' vide (correct)");
    results.success.push("localStorage nettoyé");
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // TEST 8: Tester getSessionId()
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 TEST 8: Source du SessionId");
  console.log("─".repeat(70));
  
  if (window.consoIndexedDBIntegration && window.getSessionId) {
    // Note: getSessionId est dans la closure, pas directement accessible
    console.log("ℹ️ getSessionId() défini (fonction interne)");
    console.log("   Observer les logs au chargement pour voir la source:");
    console.log("   - '📍 SessionId depuis DOM' → ✅ Isolation active");
    console.log("   - '🚨 SessionId depuis sessionStorage' → ❌ Risque contamination");
  } else {
    console.warn("⚠️ Impossible de tester getSessionId directement");
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // RÉSUMÉ FINAL
  // ═══════════════════════════════════════════════════════════════════
  console.log("═".repeat(70));
  console.log("📊 RÉSUMÉ DIAGNOSTIC");
  console.log("═".repeat(70));
  
  if (results.success.length > 0) {
    console.log(`\n✅ SUCCÈS (${results.success.length}):`);
    results.success.forEach(msg => console.log(`   ✓ ${msg}`));
  }
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️ AVERTISSEMENTS (${results.warnings.length}):`);
    results.warnings.forEach(msg => console.log(`   ⚠ ${msg}`));
  }
  
  if (results.errors.length > 0) {
    console.log(`\n❌ ERREURS (${results.errors.length}):`);
    results.errors.forEach(msg => console.log(`   ✗ ${msg}`));
  }
  
  console.log("\n" + "═".repeat(70));
  
  // Verdict final
  if (results.errors.length === 0) {
    if (results.warnings.length === 0) {
      console.log("🎉 SYSTÈME OPÉRATIONNEL");
      console.log("   La persistance et l'isolation fonctionnent correctement.");
    } else {
      console.log("⚠️ SYSTÈME FONCTIONNEL AVEC AVERTISSEMENTS");
      console.log("   Vérifier les points ci-dessus.");
    }
  } else {
    console.log("❌ PROBLÈMES DÉTECTÉS");
    console.log("   Corriger les erreurs ci-dessus avant de tester.");
  }
  
  console.log("═".repeat(70));
  console.log("");
  
  // Actions recommandées
  console.log("💡 ACTIONS RECOMMANDÉES:");
  
  if (!sessionElement) {
    console.log("   1. Vérifier ClaraAssistant.tsx ligne 3730: data-session-id={currentSession?.id}");
    console.log("   2. Recompiler: npm run dev (arrêter et redémarrer)");
  }
  
  if (!window.claraverseProcessor) {
    console.log("   1. Vérifier que conso.js se charge: <script src='/conso.js'></script>");
    console.log("   2. Regarder onglet Network dans DevTools");
  }
  
  if (tablesWithKeyword.length === 0 && allTables.length > 0) {
    console.log("   1. Vérifier modifications conso.js (lignes 838 et 1528)");
    console.log("   2. Vider cache navigateur (Ctrl+Shift+Delete)");
  }
  
  console.log("\n💡 COMMANDES UTILES:");
  console.log("   - forceRestore()  : Forcer restauration manuelle");
  console.log("   - listTables()    : Lister tables avec data-keyword");
  console.log("   - checkIndexedDB(): Voir contenu IndexedDB détaillé");
  console.log("   - runDiagnostic() : Relancer ce diagnostic");
  
  console.log("");
  console.log("═".repeat(70));
  
  return results;
};

// ═══════════════════════════════════════════════════════════════════
// COMMANDES UTILITAIRES
// ═══════════════════════════════════════════════════════════════════

window.forceRestore = function() {
  console.log("🔄 Forcer restauration des tables...");
  
  const sessionId = document.querySelector('[data-session-id]')?.getAttribute('data-session-id');
  
  if (!sessionId) {
    console.error("❌ Impossible: data-session-id absent du DOM");
    return;
  }
  
  console.log(`📍 SessionId: ${sessionId.substring(0, 40)}...`);
  
  if (window.flowiseTableBridge && window.flowiseTableBridge.restoreTablesForSession) {
    window.flowiseTableBridge.restoreTablesForSession(sessionId)
      .then(() => console.log("✅ Restauration terminée"))
      .catch(err => console.error("❌ Erreur:", err.message));
  } else {
    console.error("❌ flowiseTableBridge non disponible");
  }
};

window.listTables = function() {
  const tables = document.querySelectorAll('table[data-keyword]');
  console.log(`📊 ${tables.length} table(s) avec data-keyword:`);
  
  tables.forEach((table, i) => {
    const keyword = table.dataset.keyword;
    const tableId = table.dataset.tableId;
    const forTable = table.dataset.forTable;
    console.log(`${i+1}. keyword="${keyword}"`);
    console.log(`   tableId="${tableId}"`);
    if (forTable) console.log(`   forTable="${forTable}"`);
    console.log(`   rows=${table.querySelectorAll('tr').length}`);
  });
};

window.checkIndexedDB = async function() {
  console.log("🔍 Inspection IndexedDB...\n");
  
  const dbRequest = indexedDB.open('clara_db', 1);
  
  dbRequest.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction('clara_generated_tables', 'readonly');
    const store = tx.objectStore('clara_generated_tables');
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = () => {
      const tables = getAllRequest.result;
      console.log(`📊 ${tables.length} table(s) sauvegardée(s):\n`);
      
      tables.forEach((t, i) => {
        console.log(`${i+1}. ${t.keyword}`);
        console.log(`   ID: ${t.id}`);
        console.log(`   Session: ${t.sessionId?.substring(0, 30)}...`);
        console.log(`   Timestamp: ${new Date(t.timestamp).toLocaleString()}`);
        console.log(`   HTML size: ${t.html?.length || 0} chars`);
        console.log(`   Fingerprint: ${t.fingerprint}`);
        console.log("");
      });
    };
  };
  
  dbRequest.onerror = () => {
    console.error("❌ Erreur ouverture IndexedDB");
  };
};

// Auto-exécution si chargé comme script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("💡 Diagnostic disponible: tapez runDiagnostic() dans la console");
  });
} else {
  console.log("💡 Diagnostic disponible: tapez runDiagnostic() dans la console");
}
