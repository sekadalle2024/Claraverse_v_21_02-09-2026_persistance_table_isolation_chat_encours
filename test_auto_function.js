// ═══════════════════════════════════════════════════════════════════════════
// 🧪 TEST AUTOMATIQUE COMPLET - À insérer dans index.html
// ═══════════════════════════════════════════════════════════════════════════

function runAutoTest() {
  let message = "🧪 TEST AUTOMATIQUE COMPLET\n\n";
  message += "─".repeat(40) + "\n\n";
  
  let allPassed = true;
  const errors = [];
  
  // TEST 1: Flag Global
  message += "TEST 1: Flag Global\n";
  if (window.DISABLE_TABLE_RESTORATION === true) {
    message += "✅ DISABLE_TABLE_RESTORATION = true\n\n";
  } else {
    message += "❌ Flag absent (valeur: " + window.DISABLE_TABLE_RESTORATION + ")\n\n";
    allPassed = false;
    errors.push("Flag global");
  }
  
  // TEST 2: Log Désactivation
  message += "TEST 2: Log Désactivation\n";
  const hasDisabledLog = capturedLogs.some(log => 
    log.message.includes('DISABLED') && 
    (log.message.includes('Global flag') || log.message.includes('Skipping'))
  );
  
  if (hasDisabledLog) {
    message += "✅ Log 🚫 DISABLED trouvé\n\n";
  } else {
    message += "❌ Log 🚫 DISABLED absent\n\n";
    allPassed = false;
    errors.push("Log désactivation");
  }
  
  // TEST 3: Contamination (async via IndexedDB)
  message += "TEST 3: Contamination\n";
  message += "⏳ Analyse en cours...\n\n";
  
  const sessionIdElement = document.querySelector('[data-session-id]');
  const currentSessionId = sessionIdElement?.getAttribute('data-session-id')?.trim();
  
  if (!currentSessionId) {
    message += "❌ SessionId non trouvé\n\n";
    message += "─".repeat(40) + "\n\n";
    message += "❌ TESTS INCOMPLETS\n\n";
    errors.forEach(e => message += "• " + e + "\n");
    showLongNotification(message, 'error');
    return;
  }
  
  const allTables = document.querySelectorAll('table');
  const tablesDOM = allTables.length;
  
  try {
    const dbRequest = indexedDB.open('clara_db', 12);
    
    dbRequest.onsuccess = function(event) {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('clara_generated_tables')) {
        message += "⚠️ Store absent\n\n";
        message += "─".repeat(40) + "\n";
        message += "⚠️ TESTS PARTIELS\n";
        showLongNotification(message, 'error');
        return;
      }
      
      const transaction = db.transaction(['clara_generated_tables'], 'readonly');
      const store = transaction.objectStore('clara_generated_tables');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = function() {
        const allRecords = getAllRequest.result || [];
        const currentTables = allRecords.filter(r => r.sessionId === currentSessionId);
        const otherTables = allRecords.filter(r => r.sessionId !== currentSessionId);
        
        let finalMessage = message;
        
        // Compter contamination
        let contamination = 0;
        allTables.forEach(table => {
          const tableId = table.dataset.tableId || table.id;
          const keyword = table.dataset.keyword;
          
          const isContaminated = otherTables.some(record => 
            record.id === tableId || record.keyword === keyword
          );
          
          if (isContaminated) contamination++;
        });
        
        finalMessage += `📊 DB: ${allRecords.length} tables totales\n`;
        finalMessage += `📊 Session: ${currentTables.length} tables\n`;
        finalMessage += `📊 Autres: ${otherTables.length} tables\n`;
        finalMessage += `📺 Visibles: ${tablesDOM} tables\n\n`;
        
        if (contamination === 0) {
          finalMessage += "✅ Aucune contamination\n\n";
        } else {
          finalMessage += `❌ ${contamination} contamination(s)\n\n`;
          allPassed = false;
          errors.push(`${contamination} contamination`);
        }
        
        // TEST 4: Doublons
        finalMessage += "TEST 4: Doublons\n";
        const byKeyword = {};
        allTables.forEach((table, i) => {
          const kw = table.dataset.keyword || `no-kw-${i}`;
          if (!byKeyword[kw]) byKeyword[kw] = [];
          byKeyword[kw].push(table);
        });
        
        const doublons = Object.entries(byKeyword).filter(([k, t]) => t.length > 1);
        
        if (doublons.length === 0) {
          finalMessage += `✅ Aucun doublon (${Object.keys(byKeyword).length} uniques)\n\n`;
        } else {
          finalMessage += `❌ ${doublons.length} doublon(s):\n`;
          doublons.forEach(([kw, t]) => {
            finalMessage += `   • ${kw}: ${t.length}x\n`;
          });
          finalMessage += "\n";
          allPassed = false;
          errors.push(`${doublons.length} doublons`);
        }
        
        // RÉSULTAT FINAL
        finalMessage += "─".repeat(40) + "\n\n";
        
        if (allPassed) {
          finalMessage += "🎉 TOUS LES TESTS PASSÉS!\n\n";
          finalMessage += "✅ Flag global actif\n";
          finalMessage += "✅ Restauration OFF\n";
          finalMessage += "✅ Zéro contamination\n";
          finalMessage += "✅ Zéro doublon\n\n";
          finalMessage += "💡 Système 100% OK";
          showLongNotification(finalMessage, 'success');
        } else {
          finalMessage += `❌ ${errors.length} ERREUR(S):\n\n`;
          errors.forEach((e, i) => finalMessage += `${i + 1}. ${e}\n`);
          finalMessage += "\n💡 Vérifier logs et rebuild";
          showLongNotification(finalMessage, 'error');
        }
      };
    };
    
    dbRequest.onerror = function() {
      message += "❌ Erreur IndexedDB\n";
      showLongNotification(message, 'error');
    };
    
  } catch (e) {
    message += "❌ Exception: " + e.message + "\n";
    showLongNotification(message, 'error');
  }
}
