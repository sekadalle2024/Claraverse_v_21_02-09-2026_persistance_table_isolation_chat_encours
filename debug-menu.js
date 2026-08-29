/**
 * Diagnostic Immédiat Menu Contextuel ClaraVerse
 *
 * Script de diagnostic rapide pour identifier pourquoi le menu contextuel ne fonctionne plus
 * Usage: Coller dans la console et exécuter debugMenu()
 */

function debugMenu() {
  console.log("🔍 === DIAGNOSTIC MENU CONTEXTUEL ===\n");

  const results = {
    managerExists: false,
    initialized: false,
    menuElement: false,
    eventListeners: false,
    tables: 0,
    errors: []
  };

  // 1. Vérifier ContextualMenuManager
  console.log("1. Vérification ContextualMenuManager...");
  if (window.contextualMenuManager) {
    results.managerExists = true;
    console.log("✅ ContextualMenuManager trouvé");

    // Vérifier initialisation
    if (window.contextualMenuManager.initialized) {
      results.initialized = true;
      console.log("✅ Manager initialisé");
    } else {
      console.log("❌ Manager NON initialisé");
      results.errors.push("Manager non initialisé");
    }

    // Vérifier élément menu
    if (window.contextualMenuManager.menuElement) {
      results.menuElement = true;
      console.log("✅ Élément menu créé");
    } else {
      console.log("❌ Élément menu manquant");
      results.errors.push("Élément DOM du menu manquant");
    }

    // Vérifier event listeners
    if (window.contextualMenuManager.eventListeners && window.contextualMenuManager.eventListeners.length > 0) {
      results.eventListeners = true;
      console.log(`✅ ${window.contextualMenuManager.eventListeners.length} event listeners actifs`);
    } else {
      console.log("❌ Event listeners manquants");
      results.errors.push("Event listeners non attachés");
    }

  } else {
    console.log("❌ ContextualMenuManager INTROUVABLE");
    results.errors.push("ContextualMenuManager non chargé - script menu.js manquant?");
  }

  // 2. Vérifier tables dans le DOM
  console.log("\n2. Vérification tables...");
  const allTables = document.querySelectorAll('table');
  const chatTables = document.querySelectorAll('table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg, .prose table, .markdown-body table');

  results.tables = chatTables.length;
  console.log(`📊 ${allTables.length} table(s) total, ${chatTables.length} table(s) compatible(s) chat`);

  if (chatTables.length === 0) {
    console.log("⚠️ Aucune table compatible trouvée");
    results.errors.push("Aucune table compatible avec le menu contextuel");
  }

  // 3. Vérifier erreurs JavaScript
  console.log("\n3. Vérification erreurs...");
  const hasErrors = results.errors.length > 0;
  if (hasErrors) {
    console.log(`❌ ${results.errors.length} problème(s) détecté(s)`);
  } else {
    console.log("✅ Aucune erreur majeure détectée");
  }

  // 4. Solutions automatiques
  console.log("\n4. Solutions automatiques...");

  if (!results.managerExists) {
    console.log("🔧 SOLUTION: Rechargez menu.js ou vérifiez les erreurs de script dans la console");
  } else if (!results.initialized) {
    console.log("🔧 SOLUTION: Tentative d'initialisation...");
    try {
      window.contextualMenuManager.init();
      console.log("✅ Initialisation forcée réussie");
    } catch (error) {
      console.log("❌ Erreur lors de l'initialisation:", error.message);
    }
  } else if (!results.menuElement || !results.eventListeners) {
    console.log("🔧 SOLUTION: Réinitialisation complète...");
    try {
      if (window.contextualMenuManager.cleanup) {
        window.contextualMenuManager.cleanup();
      }
      window.contextualMenuManager.initialized = false;
      window.contextualMenuManager.init();
      console.log("✅ Réinitialisation complète réussie");
    } catch (error) {
      console.log("❌ Erreur lors de la réinitialisation:", error.message);
    }
  }

  // 5. Test rapide d'apparition
  if (results.managerExists && chatTables.length > 0) {
    console.log("\n5. Test d'apparition du menu...");

    const testTable = chatTables[0];
    console.log("🎯 Test sur première table trouvée...");

    // Simuler survol
    const mouseEvent = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });

    testTable.dispatchEvent(mouseEvent);

    setTimeout(() => {
      const manager = window.contextualMenuManager;
      if (manager && manager.isMenuVisible) {
        console.log("✅ Menu apparaît correctement au survol");
      } else {
        console.log("❌ Menu n'apparaît pas - vérifiez les event listeners sur les tables");
      }
    }, 500);
  }

  // 6. Rapport final
  console.log("\n📋 === RÉSUMÉ DIAGNOSTIC ===");
  const score = [
    results.managerExists,
    results.initialized,
    results.menuElement,
    results.eventListeners,
    results.tables > 0
  ].filter(Boolean).length;

  const status = score >= 4 ? "🟢 FONCTIONNEL" : score >= 3 ? "🟡 PROBLÈMES MINEURS" : "🔴 DYSFONCTIONNEL";
  console.log(`État: ${status} (${score}/5)`);

  if (results.errors.length > 0) {
    console.log("❌ Problèmes identifiés:");
    results.errors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
  }

  console.log("\n💡 Actions recommandées:");
  if (score < 3) {
    console.log("   - Recharger menu.js");
    console.log("   - Vérifier erreurs JavaScript dans la console");
    console.log("   - Exécuter: resetMenuComplete()");
  } else if (score < 5) {
    console.log("   - Exécuter: forceMenuInit()");
    console.log("   - Survoler une table pour tester");
  } else {
    console.log("   - Menu devrait fonctionner normalement");
    console.log("   - Survolez une table pour faire apparaître le menu");
  }

  console.log("=====================================\n");

  return results;
}

// Fonctions utilitaires de réparation
function forceMenuInit() {
  if (window.contextualMenuManager) {
    window.contextualMenuManager.init();
    console.log("✅ Initialisation forcée terminée");
  } else {
    console.log("❌ ContextualMenuManager non disponible");
  }
}

function resetMenuComplete() {
  if (window.contextualMenuManager) {
    try {
      // Nettoyer
      if (window.contextualMenuManager.cleanup) {
        window.contextualMenuManager.cleanup();
      }

      // Réinitialiser
      window.contextualMenuManager.initialized = false;
      window.contextualMenuManager.isMenuVisible = false;
      window.contextualMenuManager.targetTable = null;

      // Re-initialiser
      window.contextualMenuManager.init();

      console.log("✅ Reset complet terminé - menu contextuel restauré");
    } catch (error) {
      console.log("❌ Erreur lors du reset:", error.message);
    }
  } else {
    console.log("❌ ContextualMenuManager non disponible pour reset");
  }
}

function createTestTable() {
  const table = document.createElement('table');
  table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg';
  table.innerHTML = `
    <tr><th style="border:1px solid #ccc;padding:8px;">Test</th></tr>
    <tr><td style="border:1px solid #ccc;padding:8px;">Survolez-moi!</td></tr>
  `;
  table.style.cssText = 'margin:20px; border-collapse:collapse;';
  document.body.appendChild(table);
  console.log("✅ Table de test créée - survolez-la pour tester le menu");
  return table;
}

// Auto-exécution si pas d'erreur
try {
  console.log("🚀 Script de diagnostic menu contextuel chargé");
  console.log("📋 Commandes disponibles:");
  console.log("   debugMenu() - Diagnostic complet");
  console.log("   forceMenuInit() - Forcer initialisation");
  console.log("   resetMenuComplete() - Reset complet");
  console.log("   createTestTable() - Créer table de test");
  console.log("");

  // Diagnostic automatique
  debugMenu();

} catch (error) {
  console.error("❌ Erreur lors du chargement du diagnostic:", error);
}
