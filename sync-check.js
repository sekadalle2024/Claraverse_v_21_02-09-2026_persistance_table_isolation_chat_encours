/**
 * ClaraVerse Sync Check - Utilitaire de vérification de synchronisation
 *
 * Script simple pour vérifier l'état de synchronisation entre menu.js et dev.js
 * Usage: Charger dans la console et exécuter syncCheck()
 */

class SyncChecker {
  constructor() {
    this.status = {
      devJS: false,
      menuJS: false,
      localStorage: false,
      sync: false,
      errors: []
    };
  }

  /**
   * Vérification complète de la synchronisation
   */
  check() {
    console.log("🔍 Vérification synchronisation ClaraVerse...");

    this.checkDevJS();
    this.checkMenuJS();
    this.checkLocalStorage();
    this.checkSync();

    this.displayReport();
    return this.status;
  }

  /**
   * Vérifier dev.js
   */
  checkDevJS() {
    if (window.claraverseSyncAPI) {
      this.status.devJS = true;
      console.log("✅ dev.js: API disponible (v" + (window.claraverseSyncAPI.version || '?') + ")");

      // Vérifier les méthodes essentielles
      const methods = ['forceSaveTable', 'saveAllTables', 'getStorageStats'];
      methods.forEach(method => {
        if (typeof window.claraverseSyncAPI[method] !== 'function') {
          this.status.errors.push(`Méthode ${method} manquante dans dev.js`);
        }
      });
    } else {
      this.status.devJS = false;
      this.status.errors.push("API claraverseSyncAPI non trouvée - dev.js non chargé?");
      console.log("❌ dev.js: API non disponible");
    }
  }

  /**
   * Vérifier menu.js
   */
  checkMenuJS() {
    if (window.contextualMenuManager) {
      this.status.menuJS = true;
      console.log("✅ menu.js: ContextualMenuManager disponible");

      // Vérifier les méthodes de synchronisation
      const methods = ['syncWithDev', 'fallbackSync', 'checkSyncStatus'];
      methods.forEach(method => {
        if (typeof window.contextualMenuManager[method] !== 'function') {
          this.status.errors.push(`Méthode ${method} manquante dans menu.js`);
        }
      });
    } else {
      this.status.menuJS = false;
      this.status.errors.push("ContextualMenuManager non trouvé - menu.js non chargé?");
      console.log("❌ menu.js: ContextualMenuManager non disponible");
    }
  }

  /**
   * Vérifier localStorage
   */
  checkLocalStorage() {
    try {
      const testKey = 'sync_test_' + Date.now();
      localStorage.setItem(testKey, 'ok');
      localStorage.removeItem(testKey);
      this.status.localStorage = true;

      // Compter les données ClaraVerse
      const keys = Object.keys(localStorage).filter(key =>
        key.includes('claraverse') || key.includes('table_') || key.includes('cell_')
      );
      console.log(`✅ localStorage: ${keys.length} clé(s) ClaraVerse trouvée(s)`);
    } catch (error) {
      this.status.localStorage = false;
      this.status.errors.push("localStorage non accessible: " + error.message);
      console.log("❌ localStorage: Non accessible");
    }
  }

  /**
   * Tester la synchronisation
   */
  checkSync() {
    if (!this.status.devJS || !this.status.menuJS) {
      this.status.sync = false;
      this.status.errors.push("Impossible de tester la sync - composants manquants");
      return;
    }

    try {
      // Test événement personnalisé
      let eventReceived = false;
      const handler = () => { eventReceived = true; };

      document.addEventListener('sync-test-event', handler);
      document.dispatchEvent(new CustomEvent('sync-test-event'));
      document.removeEventListener('sync-test-event', handler);

      if (!eventReceived) {
        this.status.errors.push("Événements personnalisés ne fonctionnent pas");
      }

      // Vérifier l'état de sync du menu
      if (window.contextualMenuManager.checkSyncStatus) {
        const syncStatus = window.contextualMenuManager.checkSyncStatus();
        console.log("📊 État sync menu:", syncStatus);

        if (!syncStatus.devJSDetected) {
          this.status.errors.push("menu.js ne détecte pas dev.js");
        }
      }

      this.status.sync = eventReceived && this.status.errors.length === 0;

    } catch (error) {
      this.status.sync = false;
      this.status.errors.push("Erreur test sync: " + error.message);
    }
  }

  /**
   * Afficher le rapport
   */
  displayReport() {
    console.log("\n📋 === RAPPORT DE SYNCHRONISATION ===");

    const overall = this.status.devJS && this.status.menuJS && this.status.localStorage;

    console.log(`🔧 dev.js: ${this.status.devJS ? '✅' : '❌'}`);
    console.log(`🎯 menu.js: ${this.status.menuJS ? '✅' : '❌'}`);
    console.log(`💾 localStorage: ${this.status.localStorage ? '✅' : '❌'}`);
    console.log(`🔄 Synchronisation: ${this.status.sync ? '✅' : '❌'}`);

    if (this.status.errors.length > 0) {
      console.log("\n❌ PROBLÈMES DÉTECTÉS:");
      this.status.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log(`\n📈 État général: ${overall ? '🟢 OK' : '🔴 PROBLÈME'}`);

    if (!overall) {
      console.log("\n💡 SOLUTIONS SUGGÉRÉES:");
      if (!this.status.devJS) console.log("  - Recharger ou vérifier dev.js");
      if (!this.status.menuJS) console.log("  - Recharger ou vérifier menu.js");
      if (!this.status.localStorage) console.log("  - Vérifier paramètres navigateur");
    }

    console.log("=====================================\n");
  }

  /**
   * Test rapide de sauvegarde
   */
  testSave() {
    if (!this.status.devJS) {
      console.log("❌ dev.js non disponible pour test de sauvegarde");
      return false;
    }

    try {
      const tables = document.querySelectorAll('table');
      if (tables.length === 0) {
        console.log("⚠️ Aucune table trouvée pour test");
        return false;
      }

      console.log(`🧪 Test sauvegarde sur ${tables.length} table(s)...`);

      let totalSaved = 0;
      tables.forEach(async (table, index) => {
        try {
          const saved = await window.claraverseSyncAPI.forceSaveTable(table);
          totalSaved += saved;
          console.log(`📊 Table ${index + 1}: ${saved} cellules sauvées`);
        } catch (error) {
          console.log(`❌ Erreur table ${index + 1}: ${error.message}`);
        }
      });

      console.log(`✅ Test terminé: ${totalSaved} cellules total`);
      return true;

    } catch (error) {
      console.log(`❌ Erreur test sauvegarde: ${error.message}`);
      return false;
    }
  }

  /**
   * Statistiques de stockage
   */
  getStats() {
    const stats = {
      localStorage: {
        total: localStorage.length,
        claraverse: 0,
        size: 0
      },
      tables: document.querySelectorAll('table').length,
      modifiedTables: document.querySelectorAll('table[data-modified-by]').length
    };

    // Compter les données ClaraVerse
    Object.keys(localStorage).forEach(key => {
      if (key.includes('claraverse') || key.includes('table_') || key.includes('cell_')) {
        stats.localStorage.claraverse++;
        stats.localStorage.size += localStorage.getItem(key).length;
      }
    });

    console.log("📊 Statistiques:", stats);
    return stats;
  }

  /**
   * Nettoyage des données de test
   */
  cleanup() {
    let cleaned = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.includes('test_') || key.includes('sync_test_')) {
        localStorage.removeItem(key);
        cleaned++;
      }
    });
    console.log(`🧹 ${cleaned} élément(s) de test nettoyé(s)`);
    return cleaned;
  }
}

// Instance globale
window.syncChecker = new SyncChecker();

// Fonctions utilitaires rapides
window.syncCheck = () => window.syncChecker.check();
window.syncTest = () => window.syncChecker.testSave();
window.syncStats = () => window.syncChecker.getStats();
window.syncClean = () => window.syncChecker.cleanup();

// Helper pour vérification rapide
window.quickSync = () => {
  const devOK = !!window.claraverseSyncAPI;
  const menuOK = !!window.contextualMenuManager;
  const status = devOK && menuOK ? '🟢 OK' : '🔴 PROBLÈME';

  console.log(`Sync rapide: dev.js=${devOK ? '✅' : '❌'} menu.js=${menuOK ? '✅' : '❌'} => ${status}`);
  return { devOK, menuOK, status: devOK && menuOK };
};

// Auto-notification au chargement
console.log("🔍 Sync Check ClaraVerse chargé!");
console.log("📋 Commandes: syncCheck() | syncTest() | syncStats() | quickSync()");

// Vérification automatique après un délai
setTimeout(() => {
  if (window.location.search.includes('synccheck')) {
    console.log("🚀 Auto-vérification...");
    window.syncCheck();
  }
}, 1000);
