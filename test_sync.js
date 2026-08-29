// Script de test pour la synchronisation dev.js <-> conso.js
// À charger après dev.js et conso.js pour tester la communication

(function () {
  "use strict";

  console.log("🧪 Test de synchronisation ClaraVerse - Chargement...");

  // Attendre que les deux systèmes soient initialisés
  function waitForSystems() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const devReady = window.cp && window.claraverseSyncAPI;
        const consoReady = window.claraverseProcessor;

        if (devReady && consoReady) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout après 10 secondes
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  // Tests de synchronisation
  async function runSyncTests() {
    console.log("🧪 === DÉBUT DES TESTS DE SYNCHRONISATION ===");

    try {
      await waitForSystems();

      // Test 1: Vérifier la présence des APIs
      console.log("\n📋 Test 1: Vérification des APIs");
      const devAPI = !!window.cp;
      const syncAPI = !!window.claraverseSyncAPI;
      const consoAPI = !!window.claraverseProcessor;

      console.log(`Dev.js API: ${devAPI ? "✅" : "❌"}`);
      console.log(`Sync API: ${syncAPI ? "✅" : "❌"}`);
      console.log(`Conso.js API: ${consoAPI ? "✅" : "❌"}`);

      if (!devAPI || !syncAPI || !consoAPI) {
        console.log("❌ APIs manquantes - Tests interrompus");
        return;
      }

      // Test 2: Scan des tables
      console.log("\n📋 Test 2: Scan des tables");
      const scanResult = window.cp.scan();
      console.log(`Tables scannées par dev.js: ${scanResult || 0}`);

      // Test 3: Test des événements de synchronisation
      console.log("\n📋 Test 3: Test des événements personnalisés");

      let eventReceived = false;
      const testEventHandler = (event) => {
        eventReceived = true;
        console.log("✅ Événement reçu:", event.type, event.detail);
      };

      // Écouter les événements
      document.addEventListener("claraverse:table:updated", testEventHandler);
      document.addEventListener(
        "claraverse:consolidation:complete",
        testEventHandler,
      );
      document.addEventListener("claraverse:table:created", testEventHandler);

      // Déclencher un événement de test
      window.claraverseSyncAPI.notifyTableUpdate(
        "test-table",
        document.createElement("table"),
        "test",
      );

      // Attendre un peu pour voir si l'événement est reçu
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log(`Événements fonctionnels: ${eventReceived ? "✅" : "❌"}`);

      // Nettoyer les listeners
      document.removeEventListener(
        "claraverse:table:updated",
        testEventHandler,
      );
      document.removeEventListener(
        "claraverse:consolidation:complete",
        testEventHandler,
      );
      document.removeEventListener(
        "claraverse:table:created",
        testEventHandler,
      );

      // Test 4: Test de sauvegarde forcée
      console.log("\n📋 Test 4: Test de sauvegarde forcée");
      try {
        window.claraverseSyncAPI.saveAllTables();
        console.log("✅ Sauvegarde forcée exécutée");
      } catch (error) {
        console.log("❌ Erreur sauvegarde forcée:", error);
      }

      // Test 5: Status des deux systèmes
      console.log("\n📋 Test 5: Status des systèmes");
      try {
        const devStatus = window.cp.status();
        console.log("📊 Status dev.js:", devStatus);

        if (window.claraverseProcessor.getStorageInfo) {
          const consoStatus = window.claraverseProcessor.getStorageInfo();
          console.log("📊 Status conso.js:", consoStatus);
        }
      } catch (error) {
        console.log("❌ Erreur récupération status:", error);
      }

      // Test 6: Simulation de consolidation
      console.log("\n📋 Test 6: Simulation de consolidation");
      const testTables = document.querySelectorAll("table");
      if (testTables.length > 0) {
        console.log(`${testTables.length} tables détectées pour le test`);

        // Simuler une consolidation sur la première table trouvée
        const firstTable = testTables[0];
        if (window.claraverseProcessor.notifyConsolidationComplete) {
          window.claraverseProcessor.notifyConsolidationComplete([firstTable]);
          console.log("✅ Simulation consolidation envoyée");
        }
      } else {
        console.log("⚠️ Aucune table trouvée pour le test");
      }

      console.log("\n🎉 === TESTS TERMINÉS ===");
      console.log(
        "💡 Utilisez 'testSync.runManualTest()' pour des tests manuels",
      );
    } catch (error) {
      console.log("❌ Erreur pendant les tests:", error);
    }
  }

  // Test manuel interactif
  function runManualTest() {
    console.log("🔧 === TEST MANUEL ===");
    console.log("1. Modifiez une table dans le chat");
    console.log("2. Déclenclez une consolidation avec conso.js");
    console.log("3. Actualisez la page");
    console.log("4. Vérifiez si les modifications sont persistées");

    // Ajouter des listeners pour observer en temps réel
    const logEvent = (eventName) => (event) => {
      console.log(`🔔 ${eventName}:`, event.detail);
    };

    document.addEventListener(
      "claraverse:table:updated",
      logEvent("Table Updated"),
    );
    document.addEventListener(
      "claraverse:consolidation:complete",
      logEvent("Consolidation Complete"),
    );
    document.addEventListener(
      "claraverse:table:created",
      logEvent("Table Created"),
    );

    console.log("✅ Listeners actifs - observez les événements en temps réel");
  }

  // Diagnostic de synchronisation
  function diagnoseSyncIssues() {
    console.log("🩺 === DIAGNOSTIC DE SYNCHRONISATION ===");

    const issues = [];
    const suggestions = [];

    // Vérifier les APIs
    if (!window.cp) {
      issues.push("Dev.js API manquante (window.cp)");
      suggestions.push("Vérifiez que dev.js est chargé et initialisé");
    }

    if (!window.claraverseSyncAPI) {
      issues.push("API de synchronisation manquante");
      suggestions.push("Vérifiez que dev.js est à jour avec le système de sync");
    }

    if (!window.claraverseProcessor) {
      issues.push("Conso.js API manquante");
      suggestions.push("Vérifiez que conso.js est chargé et initialisé");
    }

    // Vérifier le localStorage
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
    } catch (error) {
      issues.push("localStorage non disponible");
      suggestions.push("Vérifiez les permissions du navigateur");
    }

    // Vérifier les tables
    const tables = document.querySelectorAll("table");
    if (tables.length === 0) {
      issues.push("Aucune table détectée");
      suggestions.push("Naviguez vers une page avec des tables");
    }

    // Rapport
    console.log(`❌ Problèmes détectés: ${issues.length}`);
    issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));

    console.log(`💡 Suggestions: ${suggestions.length}`);
    suggestions.forEach((suggestion, i) =>
      console.log(`${i + 1}. ${suggestion}`),
    );

    if (issues.length === 0) {
      console.log("✅ Aucun problème détecté - Synchronisation OK");
    }
  }

  // API globale pour les tests
  window.testSync = {
    run: runSyncTests,
    runManualTest,
    diagnose: diagnoseSyncIssues,
    info: () => {
      console.log(`
🧪 API de test de synchronisation ClaraVerse

Commandes disponibles:
• testSync.run() - Exécuter tous les tests automatiques
• testSync.runManualTest() - Démarrer un test manuel interactif
• testSync.diagnose() - Diagnostiquer les problèmes de sync
• testSync.info() - Afficher cette aide

Tests automatiques:
✓ Vérification des APIs
✓ Scan des tables
✓ Événements personnalisés
✓ Sauvegarde forcée
✓ Status des systèmes
✓ Simulation consolidation

Usage typique:
1. Charger cette page avec des tables
2. Exécuter: testSync.run()
3. Vérifier les résultats dans la console
4. Si problèmes: testSync.diagnose()
      `);
    },
  };

  // Auto-run des tests après chargement
  setTimeout(() => {
    console.log("🚀 Auto-exécution des tests dans 2 secondes...");
    console.log("💡 Utilisez testSync.info() pour l'aide");
    setTimeout(runSyncTests, 2000);
  }, 1000);
})();
