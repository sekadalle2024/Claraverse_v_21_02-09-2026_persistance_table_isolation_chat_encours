/**
 * Test rapide du menu contextuel ClaraVerse
 *
 * Script de diagnostic pour vérifier le fonctionnement du menu contextuel
 * Usage: Charger dans la console puis exécuter testMenu()
 */

class MenuTester {
  constructor() {
    this.testResults = [];
    this.testTable = null;
  }

  /**
   * Test complet du menu contextuel
   */
  async testMenu() {
    console.log("🎯 === TEST MENU CONTEXTUEL CLARAVERSE ===");

    this.testResults = [];

    // Tests de base
    this.testManagerAvailable();
    this.testInitialization();

    // Tests fonctionnels
    await this.createTestTable();
    await this.testMenuAppearance();
    this.testMenuActions();

    // Rapport final
    this.generateReport();
  }

  /**
   * Vérifier si le ContextualMenuManager est disponible
   */
  testManagerAvailable() {
    const available = !!window.contextualMenuManager;
    this.addResult("ContextualMenuManager disponible", available,
      available ? "Manager trouvé et chargé" : "Manager non trouvé - menu.js non chargé?");

    if (available) {
      // Vérifier l'état d'initialisation
      const initialized = window.contextualMenuManager.initialized;
      this.addResult("Manager initialisé", initialized,
        initialized ? "Manager correctement initialisé" : "Manager non initialisé");
    }
  }

  /**
   * Tester l'initialisation
   */
  testInitialization() {
    if (!window.contextualMenuManager) return;

    const manager = window.contextualMenuManager;

    // Vérifier les propriétés essentielles
    const hasMenuElement = !!manager.menuElement;
    this.addResult("Élément menu créé", hasMenuElement,
      hasMenuElement ? "Élément DOM du menu existe" : "Élément DOM manquant");

    // Vérifier les event listeners
    const hasEventListeners = manager.eventListeners && manager.eventListeners.length > 0;
    this.addResult("Event listeners attachés", hasEventListeners,
      hasEventListeners ? `${manager.eventListeners.length} listeners actifs` : "Aucun listener trouvé");

    // Forcer l'initialisation si nécessaire
    if (!manager.initialized) {
      console.log("🔧 Forçage initialisation...");
      manager.init();
    }
  }

  /**
   * Créer une table de test
   */
  async createTestTable() {
    console.log("📋 Création table de test...");

    try {
      // Supprimer l'ancienne table de test si elle existe
      const oldTable = document.querySelector('[data-test-menu="true"]');
      if (oldTable) oldTable.remove();

      // Trouver un conteneur approprié
      const container = document.querySelector('.prose, .markdown-body, .chat, main') || document.body;

      // Créer la nouvelle table
      this.testTable = document.createElement('table');
      this.testTable.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg';
      this.testTable.setAttribute('data-test-menu', 'true');
      this.testTable.style.cssText = 'margin: 20px; border-collapse: collapse;';

      // Ajouter contenu
      this.testTable.innerHTML = `
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">ID</th>
            <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">Nom</th>
            <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">Valeur</th>
            <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">Ecart</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">1</td>
            <td style="border: 1px solid #ccc; padding: 8px;">Test A</td>
            <td style="border: 1px solid #ccc; padding: 8px;">100</td>
            <td style="border: 1px solid #ccc; padding: 8px;">0</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">2</td>
            <td style="border: 1px solid #ccc; padding: 8px;">Test B</td>
            <td style="border: 1px solid #ccc; padding: 8px;">200</td>
            <td style="border: 1px solid #ccc; padding: 8px;">0</td>
          </tr>
        </tbody>
      `;

      container.appendChild(this.testTable);

      // Attendre que la table soit dans le DOM
      await this.delay(500);

      this.addResult("Table de test créée", true, "Table ajoutée au DOM avec succès");

      // Forcer le retraitement des tables existantes
      if (window.contextualMenuManager) {
        window.contextualMenuManager.processExistingTables();
      }

    } catch (error) {
      this.addResult("Table de test créée", false, `Erreur: ${error.message}`);
    }
  }

  /**
   * Tester l'apparition du menu
   */
  async testMenuAppearance() {
    if (!this.testTable || !window.contextualMenuManager) {
      this.addResult("Test apparition menu", false, "Table ou manager manquant");
      return;
    }

    console.log("👁️ Test apparition menu...");

    const manager = window.contextualMenuManager;

    try {
      // Simuler survol de table
      const mouseEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      });

      this.testTable.dispatchEvent(mouseEvent);

      // Attendre l'apparition du menu
      await this.delay(manager.config?.hoverDelay || 300);

      // Vérifier si le menu est visible
      const menuVisible = manager.isMenuVisible ||
                         (manager.menuElement && manager.menuElement.style.display !== 'none');

      this.addResult("Menu apparaît au survol", menuVisible,
        menuVisible ? "Menu contextuel visible" : "Menu ne s'affiche pas");

      // Vérifier la position du menu
      if (manager.menuElement) {
        const rect = manager.menuElement.getBoundingClientRect();
        const positioned = rect.top > 0 && rect.left > 0;
        this.addResult("Menu bien positionné", positioned,
          positioned ? `Position: (${Math.round(rect.left)}, ${Math.round(rect.top)})` : "Position incorrecte");
      }

    } catch (error) {
      this.addResult("Test apparition menu", false, `Erreur: ${error.message}`);
    }
  }

  /**
   * Tester les actions du menu
   */
  testMenuActions() {
    if (!window.contextualMenuManager) {
      this.addResult("Test actions menu", false, "Manager non disponible");
      return;
    }

    console.log("⚙️ Test actions menu...");

    const manager = window.contextualMenuManager;

    // Vérifier les méthodes d'action
    const actions = [
      'insertRowBelow',
      'insertColumnRight',
      'performRapprochement',
      'importExcel',
      'exportExcel'
    ];

    actions.forEach(action => {
      const available = typeof manager[action] === 'function';
      this.addResult(`Action ${action}`, available,
        available ? "Méthode disponible" : "Méthode manquante");
    });

    // Tester la synchronisation
    const syncAvailable = typeof manager.syncWithDev === 'function';
    this.addResult("Synchronisation disponible", syncAvailable,
      syncAvailable ? "Méthode sync disponible" : "Synchronisation manquante");
  }

  /**
   * Ajouter un résultat de test
   */
  addResult(name, passed, details) {
    this.testResults.push({ name, passed, details });
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${details}`);
  }

  /**
   * Générer le rapport final
   */
  generateReport() {
    console.log("\n📋 === RAPPORT TEST MENU CONTEXTUEL ===");

    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total * 100).toFixed(1) : 0;

    console.log(`📊 Total: ${total} | ✅ Réussis: ${passed} | ❌ Échoués: ${failed}`);
    console.log(`📈 Taux de réussite: ${successRate}%`);

    if (failed > 0) {
      console.log("\n❌ PROBLÈMES DÉTECTÉS:");
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}: ${result.details}`);
      });
    }

    // Diagnostic et solutions
    console.log("\n💡 DIAGNOSTIC:");

    if (!window.contextualMenuManager) {
      console.log("  🔴 CRITIQUE: menu.js non chargé ou erreur de script");
      console.log("  📝 Solution: Recharger menu.js et vérifier les erreurs dans la console");
    } else if (!window.contextualMenuManager.initialized) {
      console.log("  🟡 AVERTISSEMENT: Menu non initialisé");
      console.log("  📝 Solution: Exécuter window.contextualMenuManager.init()");
    } else if (successRate < 80) {
      console.log("  🟡 AVERTISSEMENT: Fonctionnalités partiellement disponibles");
      console.log("  📝 Solution: Vérifier les dépendances et réinitialiser si nécessaire");
    } else {
      console.log("  🟢 OK: Menu contextuel fonctionnel");
    }

    console.log("=====================================\n");

    return {
      total,
      passed,
      failed,
      successRate: parseFloat(successRate),
      functional: successRate >= 80
    };
  }

  /**
   * Nettoyer la table de test
   */
  cleanup() {
    if (this.testTable && this.testTable.parentNode) {
      this.testTable.parentNode.removeChild(this.testTable);
      console.log("🧹 Table de test supprimée");
    }
  }

  /**
   * Forcer la réinitialisation du menu
   */
  forceReset() {
    if (window.contextualMenuManager) {
      console.log("🔄 Réinitialisation forcée du menu...");

      // Nettoyer les anciens listeners
      if (window.contextualMenuManager.cleanup) {
        window.contextualMenuManager.cleanup();
      }

      // Réinitialiser
      window.contextualMenuManager.initialized = false;
      window.contextualMenuManager.init();

      console.log("✅ Menu réinitialisé");
    }
  }

  /**
   * Utilitaire de délai
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instance globale
window.menuTester = new MenuTester();

// Fonctions utilitaires
window.testMenu = () => window.menuTester.testMenu();
window.resetMenu = () => window.menuTester.forceReset();
window.cleanupTest = () => window.menuTester.cleanup();

// Test rapide
window.quickMenuTest = () => {
  const managerOK = !!window.contextualMenuManager;
  const initialized = managerOK && window.contextualMenuManager.initialized;

  console.log(`Menu rapide: Manager=${managerOK ? '✅' : '❌'} Init=${initialized ? '✅' : '❌'}`);

  if (managerOK && !initialized) {
    console.log("🔧 Tentative initialisation...");
    window.contextualMenuManager.init();
  }

  return { managerOK, initialized };
};

// Instructions
console.log("🎯 Test Menu Contextuel chargé!");
console.log("📋 Commandes disponibles:");
console.log("  - testMenu() : Test complet");
console.log("  - quickMenuTest() : Vérification rapide");
console.log("  - resetMenu() : Réinitialisation forcée");
console.log("  - cleanupTest() : Nettoyer table de test");

// Auto-test si paramètre dans URL
if (window.location.search.includes('testmenu')) {
  setTimeout(() => {
    console.log("🚀 Auto-test du menu...");
    window.testMenu();
  }, 1000);
}
