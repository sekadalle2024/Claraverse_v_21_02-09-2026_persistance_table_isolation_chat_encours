/**
 * Intégration SIMPLIFIÉE conso.js → IndexedDB
 * Version minimaliste qui intercepte les sauvegardes de conso.js
 */

(function() {
  'use strict';
  
  console.log("🔗 [SIMPLE] Chargement intégration conso → IndexedDB");

  // Attendre que tout soit prêt
  let checkCount = 0;
  const maxChecks = 50; // 5 secondes max
  
  function waitAndIntegrate() {
    checkCount++;
    
    // Vérifier si claraverseProcessor existe
    if (window.claraverseProcessor) {
      console.log("✅ [SIMPLE] claraverseProcessor trouvé, intégration...");
      doIntegration();
      return;
    }
    
    // Si pas encore prêt, réessayer
    if (checkCount < maxChecks) {
      setTimeout(waitAndIntegrate, 100);
    } else {
      console.error("❌ [SIMPLE] claraverseProcessor non trouvé après 5 secondes");
    }
  }
  
  function doIntegration() {
    const processor = window.claraverseProcessor;
    
    // Sauvegarder l'ancienne méthode
    const originalSaveTableDataNow = processor.saveTableDataNow;
    const originalSaveAllData = processor.saveAllData;
    
    console.log("🔧 [SIMPLE] Remplacement de saveTableDataNow...");
    
    // NOUVELLE méthode saveTableDataNow
    processor.saveTableDataNow = function(table) {
      if (!table) {
        console.warn("⚠️ [SIMPLE] Table null");
        return;
      }
      
      console.log("💾 [SIMPLE] Interception sauvegarde table");
      
      // D'abord, appeler l'ancienne méthode pour la compatibilité
      try {
        originalSaveTableDataNow.call(this, table);
      } catch (e) {
        console.warn("⚠️ [SIMPLE] Erreur méthode originale:", e);
      }
      
      // Ensuite, émettre vers IndexedDB
      try {
        emitSaveEvent(table);
      } catch (e) {
        console.error("❌ [SIMPLE] Erreur émission événement:", e);
      }
    };
    
    // DÉSACTIVER saveAllData (ne fait plus rien)
    processor.saveAllData = function(data) {
      console.log("ℹ️ [SIMPLE] saveAllData intercepté (ne fait rien)");
      // On ne sauvegarde plus dans localStorage
    };
    
    console.log("✅ [SIMPLE] Intégration terminée");
    
    // Exposer l'API
    window.consoIndexedDBIntegration = {
      version: '2.0-simple',
      test: testIntegration
    };
    
    console.log("💡 [SIMPLE] API disponible: consoIndexedDBIntegration.test()");
  }
  
  function emitSaveEvent(table) {
    // Extraire keyword
    const keyword = extractKeyword(table);
    console.log("🔑 [SIMPLE] Keyword:", keyword);
    
    // Obtenir sessionId
    const sessionId = getSessionId();
    console.log("📍 [SIMPLE] SessionId:", sessionId.substring(0, 30) + "...");
    
    // Émettre l'événement
    const event = new CustomEvent('flowise:table:save:request', {
      detail: {
        table: table,
        sessionId: sessionId,
        keyword: keyword,
        source: 'conso'
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
    console.log("✅ [SIMPLE] Événement émis pour:", keyword);
  }
  
  function extractKeyword(table) {
    // Stratégie 1: data-keyword
    if (table.dataset && table.dataset.keyword) {
      return table.dataset.keyword;
    }
    
    // Stratégie 2: Wrapper avec keyword
    const wrapper = table.closest('[data-n8n-keyword]');
    if (wrapper && wrapper.dataset.n8nKeyword) {
      return wrapper.dataset.n8nKeyword;
    }
    
    // Stratégie 3: Premier en-tête
    const firstHeader = table.querySelector('th');
    if (firstHeader && firstHeader.textContent.trim()) {
      const text = firstHeader.textContent.trim();
      
      // Détecter table de consolidation
      if (text.toLowerCase().includes('consolidation') || 
          text.includes('📊')) {
        return 'Table_Consolidation';
      }
      
      return text.substring(0, 50);
    }
    
    // Stratégie 4: Classes de table
    if (table.classList.contains('claraverse-conso-table')) {
      return 'Table_Consolidation';
    }
    if (table.classList.contains('claraverse-resultat-table')) {
      return 'Table_Resultat';
    }
    
    // Stratégie 5: Analyser les en-têtes
    const headers = Array.from(table.querySelectorAll('th'))
      .map(th => th.textContent.trim().toLowerCase());
    
    const headerText = headers.join(' ');
    
    if (headerText.includes('conclusion') || headerText.includes('assertion')) {
      return 'Table_Consolidation';
    }
    if (headerText.includes('resultat') || headerText.includes('résultat')) {
      return 'Table_Resultat';
    }
    
    // Fallback
    return `Table_${Date.now()}`;
  }
  
  function getSessionId() {
    // Essayer sessionStorage
    try {
      const stored = sessionStorage.getItem('claraverse_stable_session');
      if (stored) {
        return stored;
      }
    } catch (e) {
      console.warn("⚠️ [SIMPLE] sessionStorage non accessible");
    }
    
    // Essayer flowiseTableBridge
    if (window.flowiseTableBridge && window.flowiseTableBridge.getCurrentSession) {
      const sessionId = window.flowiseTableBridge.getCurrentSession();
      if (sessionId && sessionId !== 'unknown') {
        return sessionId;
      }
    }
    
    // Créer nouveau
    const newSession = `stable_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      sessionStorage.setItem('claraverse_stable_session', newSession);
    } catch (e) {
      // Ignore
    }
    
    return newSession;
  }
  
  function testIntegration() {
    console.log("\n🧪 [SIMPLE] TEST D'INTÉGRATION");
    console.log("═══════════════════════════════");
    
    // 1. Vérifier processor
    if (window.claraverseProcessor) {
      console.log("✅ claraverseProcessor disponible");
    } else {
      console.error("❌ claraverseProcessor NON disponible");
      return;
    }
    
    // 2. Vérifier méthode remplacée
    const fnString = window.claraverseProcessor.saveTableDataNow.toString();
    if (fnString.includes('SIMPLE')) {
      console.log("✅ saveTableDataNow remplacée");
    } else {
      console.warn("⚠️ saveTableDataNow NON remplacée");
    }
    
    // 3. Vérifier services
    if (window.flowiseTableBridge) {
      console.log("✅ flowiseTableBridge disponible");
    } else {
      console.warn("⚠️ flowiseTableBridge NON disponible");
    }
    
    if (window.flowiseTableService) {
      console.log("✅ flowiseTableService disponible");
    } else {
      console.warn("⚠️ flowiseTableService NON disponible");
    }
    
    // 4. Trouver tables
    const tables = document.querySelectorAll('table');
    console.log(`✅ ${tables.length} table(s) dans le DOM`);
    
    // 5. Chercher table de consolidation
    const consoTable = document.querySelector('.claraverse-conso-table');
    if (consoTable) {
      console.log("✅ Table_conso trouvée");
      const keyword = extractKeyword(consoTable);
      console.log("   Keyword:", keyword);
    } else {
      console.warn("⚠️ Table_conso non trouvée");
    }
    
    // 6. SessionId
    const sessionId = getSessionId();
    console.log("✅ SessionId:", sessionId.substring(0, 40) + "...");
    
    console.log("═══════════════════════════════");
    console.log("✅ Test terminé\n");
  }
  
  // Démarrer l'attente
  console.log("⏳ [SIMPLE] Attente de claraverseProcessor...");
  waitAndIntegrate();
  
})();

console.log("✅ [SIMPLE] Script chargé");
