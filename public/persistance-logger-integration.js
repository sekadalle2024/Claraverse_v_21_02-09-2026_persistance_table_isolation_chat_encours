/**
 * INTÉGRATION AUTOMATIQUE DES LOGS
 * 
 * Ce script s'intègre automatiquement aux fonctions existantes
 * pour ajouter logs et notifications sans modifier index.html
 */

(function() {
  'use strict';
  
  console.log("🔧 [Logger Integration] Démarrage intégration automatique...");
  
  // Attendre que PersistanceLogger soit chargé
  let integrationAttempts = 0;
  const maxAttempts = 50;
  
  function tryIntegration() {
    integrationAttempts++;
    
    if (!window.PersistanceLogger) {
      if (integrationAttempts < maxAttempts) {
        setTimeout(tryIntegration, 100);
      } else {
        console.error("❌ [Logger Integration] PersistanceLogger non trouvé après 5 secondes");
      }
      return;
    }
    
    console.log("✅ [Logger Integration] PersistanceLogger trouvé, intégration en cours...");
    
    // ═══════════════════════════════════════════════════════════════════
    // HOOK: Event Listener flowise:table:save:request
    // ═══════════════════════════════════════════════════════════════════
    
    // Intercepter les événements de sauvegarde
    document.addEventListener('flowise:table:save:request', function(e) {
      const keyword = e.detail?.keyword || 'Table inconnue';
      const source = e.detail?.source || 'unknown';
      const table = e.detail?.table;
      
      const rowCount = table ? table.querySelectorAll('tr').length : null;
      
      window.PersistanceLogger.logTableSaveStart(keyword, source);
      
      console.log(`📊 [Logger Integration] Sauvegarde interceptée: ${keyword} (${rowCount} lignes)`);
    }, true); // useCapture = true pour intercepter en premier
    
    // ═══════════════════════════════════════════════════════════════════
    // HOOK: flowiseTableBridge.restoreTablesForSession
    // ═══════════════════════════════════════════════════════════════════
    
    // Attendre que flowiseTableBridge soit disponible
    let bridgeCheckAttempts = 0;
    function checkFlowiseTableBridge() {
      bridgeCheckAttempts++;
      
      if (window.flowiseTableBridge && window.flowiseTableBridge.restoreTablesForSession) {
        const original = window.flowiseTableBridge.restoreTablesForSession;
        
        window.flowiseTableBridge.restoreTablesForSession = async function(sessionId) {
          console.log("🔄 [Logger Integration] Restauration interceptée");
          
          // Pas besoin de logger ici car flowiseTableBridge a ses propres logs
          // On laisse juste une trace
          
          return original.call(this, sessionId);
        };
        
        console.log("✅ [Logger Integration] flowiseTableBridge.restoreTablesForSession hooké");
        
      } else if (bridgeCheckAttempts < 100) {
        setTimeout(checkFlowiseTableBridge, 100);
      }
    }
    
    setTimeout(checkFlowiseTableBridge, 500);
    
    // ═══════════════════════════════════════════════════════════════════
    // HOOK: Changements de data-session-id (déjà géré par MutationObserver)
    // ═══════════════════════════════════════════════════════════════════
    
    // On va simplement observer et logger les changements
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'data-session-id' || 
             mutation.attributeName === 'data-chat-session-id')) {
          
          const newSessionId = mutation.target.getAttribute(mutation.attributeName);
          
          if (newSessionId && newSessionId !== window.__lastLoggedSessionId) {
            console.log("🔄 [Logger Integration] Changement session détecté:", newSessionId.substring(0, 30) + "...");
            window.PersistanceLogger.logChatChange(window.__lastLoggedSessionId || 'none', newSessionId);
            window.__lastLoggedSessionId = newSessionId;
          }
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-session-id', 'data-chat-session-id']
    });
    
    console.log("✅ [Logger Integration] Observer changements session installé");
    
    // ═══════════════════════════════════════════════════════════════════
    // DIAGNOSTIC AUTOMATIQUE AU DÉMARRAGE
    // ═══════════════════════════════════════════════════════════════════
    
    setTimeout(function() {
      console.log("\n" + "=".repeat(70));
      console.log("📊 DIAGNOSTIC AUTOMATIQUE PERSISTANCE");
      console.log("=".repeat(70));
      
      const sessionElement = document.querySelector('[data-session-id]');
      const sessionId = sessionElement?.getAttribute('data-session-id');
      const tablesWithKeyword = document.querySelectorAll('table[data-keyword]');
      const processorIntegrated = window.claraverseProcessor?.__integrated;
      
      const stats = {
        'SessionId trouvé': sessionId ? `✅ ${sessionId.substring(0, 40)}...` : '❌ NON',
        'Source SessionId': sessionId ? '✅ DOM (isolation active)' : '❌ Pas de data-session-id',
        'Tables data-keyword': `${tablesWithKeyword.length} table(s)`,
        'Processor intégré': processorIntegrated ? '✅ OUI' : '❌ NON',
        'Logger actif': '✅ OUI',
        'Notifications': '✅ OUI'
      };
      
      window.PersistanceLogger.logDiagnostic(stats);
      
      // Notification récapitulative
      if (!sessionId) {
        window.PersistanceLogger.logCriticalError(
          'Isolation compromise',
          new Error('data-session-id absent du DOM - React ne l\'expose pas')
        );
      } else if (!processorIntegrated) {
        window.PersistanceLogger.logCriticalError(
          'Sauvegarde désactivée',
          new Error('claraverseProcessor non intégré')
        );
      } else {
        // Tout va bien
        if (window.showPersistanceNotification) {
          window.showPersistanceNotification(
            `✅ Système opérationnel\n${tablesWithKeyword.length} table(s) suivie(s)`,
            'success',
            '✅'
          );
        }
      }
      
      console.log("=".repeat(70) + "\n");
    }, 3000);
    
    // ═══════════════════════════════════════════════════════════════════
    // COMMANDE DIAGNOSTIC MANUEL
    // ═══════════════════════════════════════════════════════════════════
    
    window.checkPersistanceStatus = function() {
      console.log("\n" + "=".repeat(70));
      console.log("🔍 DIAGNOSTIC MANUEL PERSISTANCE");
      console.log("=".repeat(70));
      
      const sessionElement = document.querySelector('[data-session-id]');
      const sessionId = sessionElement?.getAttribute('data-session-id');
      const tablesWithKeyword = document.querySelectorAll('table[data-keyword]');
      const processorIntegrated = window.claraverseProcessor?.__integrated;
      
      console.log("\n📊 État du système:");
      console.table({
        'SessionId': sessionId ? sessionId.substring(0, 40) + '...' : '❌ ABSENT',
        'Source': sessionId ? '✅ DOM' : '❌ Pas de data-session-id',
        'Tables suivies': tablesWithKeyword.length,
        'Processor': processorIntegrated ? '✅ Intégré' : '❌ Non intégré',
        'Logger': '✅ Actif',
        'Notifications': '✅ Actives'
      });
      
      if (tablesWithKeyword.length > 0) {
        console.log("\n📋 Tables avec data-keyword:");
        tablesWithKeyword.forEach((table, i) => {
          console.log(`  ${i+1}. ${table.dataset.keyword} (${table.querySelectorAll('tr').length} lignes)`);
        });
      } else {
        console.warn("  ⚠️ Aucune table avec data-keyword détectée");
      }
      
      console.log("\n💡 Commandes disponibles:");
      console.log("  - togglePersistanceLogs(true/false)");
      console.log("  - togglePersistanceNotifications(true/false)");
      console.log("  - forceRestore() (si diagnostic-persistance.js chargé)");
      console.log("  - runDiagnostic() (si diagnostic-persistance.js chargé)");
      
      console.log("=".repeat(70) + "\n");
    };
    
    console.log("✅ [Logger Integration] Intégration complète");
    console.log("💡 [Logger Integration] Tapez: checkPersistanceStatus()");
  }
  
  // Démarrer l'intégration
  tryIntegration();
  
})();
