/**
 * Script de Migration Automatique: localStorage → DOM Persistence
 *
 * Ce script applique automatiquement toutes les modifications nécessaires
 * pour migrer conso.js vers une persistance 100% DOM
 *
 * Usage:
 *   node migrate_to_dom.js
 *
 * Ou exécuter manuellement les fonctions dans la console du navigateur
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sourceFile: 'conso.js',
  backupFile: 'conso_backup_' + Date.now() + '.js',
  outputFile: 'conso.js',
};

// Lire le fichier source
function readSourceFile() {
  try {
    const filePath = path.join(__dirname, CONFIG.sourceFile);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('❌ Erreur de lecture:', error.message);
    process.exit(1);
  }
}

// Sauvegarder le backup
function createBackup(content) {
  try {
    const backupPath = path.join(__dirname, CONFIG.backupFile);
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log('✅ Backup créé:', CONFIG.backupFile);
  } catch (error) {
    console.error('❌ Erreur de backup:', error.message);
    process.exit(1);
  }
}

// Écrire le fichier de sortie
function writeOutputFile(content) {
  try {
    const outputPath = path.join(__dirname, CONFIG.outputFile);
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log('✅ Fichier migré:', CONFIG.outputFile);
  } catch (error) {
    console.error('❌ Erreur d\'écriture:', error.message);
    process.exit(1);
  }
}

// Transformation 1: Mettre à jour le header
function updateHeader(content) {
  content = content.replace(
    /\/\*\*\s*\*\s*Claraverse Table Consolidation Script.*?\*\//s,
    `/**
 * Claraverse Table Consolidation Script - Version DOM Persistence
 * Script optimisé pour fonctionner avec React et les tables dynamiques
 * Persistance 100% DOM sans localStorage
 */`
  );

  content = content.replace(
    'console.log("🚀 Claraverse Table Script - Démarrage");',
    'console.log("🚀 Claraverse Table Script - Démarrage (DOM Persistence)");'
  );

  return content;
}

// Transformation 2: Mettre à jour CONFIG
function updateConfig(content) {
  const configRegex = /const CONFIG = \{[\s\S]*?\};/;

  const newConfig = `const CONFIG = {
    tableSelector:
      "table.min-w-full.border.border-gray-200.dark\\\\:border-gray-700.rounded-lg, table.min-w-full",
    alternativeSelector: "div.prose table, .prose table, table",
    checkInterval: 1000,
    processDelay: 500,
    debugMode: true,
    domStoreId: "claraverse-dom-data-store", // Conteneur caché pour persistance DOM
    autoSaveDelay: 500, // Délai avant sauvegarde automatique
  };`;

  return content.replace(configRegex, newConfig);
}

// Transformation 3: Mettre à jour le constructeur
function updateConstructor(content) {
  const constructorPattern = /constructor\(\) \{[\s\S]*?this\.init\(\);[\s\S]*?\}/;

  const match = content.match(constructorPattern);
  if (match) {
    let constructor = match[0];

    // Retirer storageKey
    constructor = constructor.replace(/\s*this\.storageKey = ["'].*?["'];?\s*/g, '');

    // Ajouter autoSaveDelay depuis CONFIG
    constructor = constructor.replace(
      /this\.autoSaveDelay = \d+;/,
      'this.autoSaveDelay = CONFIG.autoSaveDelay;'
    );

    // Ajouter domStore
    if (!constructor.includes('this.domStore')) {
      constructor = constructor.replace(
        'this.saveTimeout = null;',
        'this.saveTimeout = null;\n      this.domStore = null; // Référence au conteneur DOM'
      );
    }

    content = content.replace(constructorPattern, constructor);
  }

  return content;
}

// Transformation 4: Supprimer testLocalStorage
function removeTestLocalStorage(content) {
  // Supprimer la méthode testLocalStorage complète
  content = content.replace(/testLocalStorage\(\) \{[\s\S]*?\n    \}/g, '');

  // Supprimer l'appel dans init()
  content = content.replace(/\s*this\.testLocalStorage\(\);?\s*/g, '');

  return content;
}

// Transformation 5: Ajouter initializeDOMStore
function addInitializeDOMStore(content) {
  const initializeDOMStoreMethod = `
    /**
     * Initialiser le conteneur DOM caché pour stocker les données
     */
    initializeDOMStore() {
      // Chercher le conteneur existant
      let store = document.getElementById(CONFIG.domStoreId);

      if (!store) {
        // Créer le conteneur caché
        store = document.createElement("div");
        store.id = CONFIG.domStoreId;
        store.style.cssText = "display: none !important; visibility: hidden !important;";
        store.setAttribute("aria-hidden", "true");
        store.setAttribute("data-persistence-version", "1.0");
        store.setAttribute("data-created", new Date().toISOString());

        // Ajouter au body
        document.body.appendChild(store);
        debug.log("✅ Conteneur DOM de persistance créé");
      } else {
        debug.log("♻️ Conteneur DOM de persistance existant trouvé");
      }

      this.domStore = store;
    }
`;

  // Insérer après init()
  content = content.replace(
    /(init\(\) \{[\s\S]*?\n    \})/,
    `$1\n${initializeDOMStoreMethod}`
  );

  return content;
}

// Transformation 6: Mettre à jour init()
function updateInit(content) {
  let initMethod = content.match(/init\(\) \{[\s\S]*?\n    \}/)[0];

  // Ajouter initializeDOMStore
  if (!initMethod.includes('this.initializeDOMStore')) {
    initMethod = initMethod.replace(
      'debug.log("Initialisation du processeur de tables");',
      `debug.log("Initialisation du processeur de tables (DOM Persistence)");\n\n      // Initialiser le conteneur DOM pour la persistance\n      this.initializeDOMStore();`
    );
  }

  // Mettre à jour le message de succès
  initMethod = initMethod.replace(
    'debug.log("✅ Processeur initialisé avec succès");',
    'debug.log("✅ Processeur initialisé avec succès (DOM Persistence)");'
  );

  content = content.replace(/init\(\) \{[\s\S]*?\n    \}/, initMethod);

  return content;
}

// Transformation 7: Remplacer loadAllData
function replaceLoadAllData(content) {
  const newLoadAllData = `    /**
     * Charger toutes les données depuis le DOM
     */
    loadAllData() {
      try {
        if (!this.domStore) {
          this.initializeDOMStore();
        }

        const dataScript = this.domStore.querySelector(
          'script[type="application/json"]'
        );

        if (dataScript && dataScript.textContent) {
          const data = JSON.parse(dataScript.textContent);
          return data || {};
        }

        return {};
      } catch (error) {
        debug.error("Erreur lors du chargement des données DOM:", error);
        return {};
      }
    }`;

  content = content.replace(
    /\/\*\*[\s\S]*?Charger toutes les données.*?\*\/[\s\S]*?loadAllData\(\) \{[\s\S]*?\n    \}/,
    newLoadAllData
  );

  return content;
}

// Transformation 8: Remplacer saveAllData
function replaceSaveAllData(content) {
  const newSaveAllData = `    /**
     * Sauvegarder toutes les données dans le DOM
     */
    saveAllData(data) {
      try {
        if (!this.domStore) {
          this.initializeDOMStore();
        }

        // Chercher ou créer le script JSON
        let dataScript = this.domStore.querySelector(
          'script[type="application/json"]'
        );

        if (!dataScript) {
          dataScript = document.createElement("script");
          dataScript.type = "application/json";
          dataScript.id = "claraverse-data-json";
          this.domStore.appendChild(dataScript);
        }

        // Sauvegarder les données en JSON
        dataScript.textContent = JSON.stringify(data);

        // Mettre à jour les métadonnées
        this.domStore.setAttribute("data-last-update", new Date().toISOString());
        this.domStore.setAttribute("data-table-count", Object.keys(data).length.toString());

        debug.log("💾 Données sauvegardées dans le DOM");
      } catch (error) {
        debug.error("❌ Erreur lors de la sauvegarde DOM:", error);
      }
    }`;

  content = content.replace(
    /\/\*\*[\s\S]*?Sauvegarder toutes les données.*?\*\/[\s\S]*?saveAllData\([^)]*\) \{[\s\S]*?\n    \}/,
    newSaveAllData
  );

  return content;
}

// Transformation 9: Mettre à jour tous les messages de debug
function updateDebugMessages(content) {
  // Remplacer les mentions de localStorage par DOM
  content = content.replace(/dans localStorage/g, 'dans le DOM');
  content = content.replace(/depuis localStorage/g, 'depuis le DOM');
  content = content.replace(/du stockage/g, 'du stockage DOM');
  content = content.replace(/dans le stockage/g, 'dans le stockage DOM');

  // Messages spécifiques
  content = content.replace(
    /"💾 Données sauvegardées dans localStorage"/g,
    '"💾 Données sauvegardées dans le DOM"'
  );

  content = content.replace(
    /"✅ Table (.*?) sauvegardée avec succès"/g,
    '"✅ Table $1 sauvegardée dans le DOM avec succès"'
  );

  return content;
}

// Transformation 10: Mettre à jour clearAllData
function updateClearAllData(content) {
  content = content.replace(
    /clearAllData\(\) \{[\s\S]*?confirm\([^)]*\)[\s\S]*?\) \{[\s\S]*?localStorage\.removeItem[\s\S]*?\n    \}/,
    `clearAllData() {
      if (
        confirm(
          "⚠️ Êtes-vous sûr de vouloir effacer toutes les données sauvegardées dans le DOM ?"
        )
      ) {
        this.saveAllData({});
        debug.log("🗑️ Toutes les données ont été effacées du DOM");
        alert("✅ Données effacées avec succès");
      }
    }`
  );

  return content;
}

// Transformation 11: Mettre à jour getStorageInfo
function updateGetStorageInfo(content) {
  content = content.replace(
    /(getStorageInfo\(\) \{[\s\S]*?return \{)/,
    `$1\n        storageType: "DOM",`
  );

  content = content.replace(
    /(lastUpdate:[\s\S]*?\),)/,
    `$1\n        domStoreId: CONFIG.domStoreId,`
  );

  return content;
}

// Transformation 12: Mettre à jour exportData
function updateExportData(content) {
  content = content.replace(
    /a\.download = `claraverse_backup_\$\{Date\.now\(\)\}\.json`;/,
    'a.download = `claraverse_backup_dom_${Date.now()}.json`;'
  );

  content = content.replace(
    /"📥 Données exportées"/g,
    '"📥 Données exportées depuis le DOM"'
  );

  return content;
}

// Transformation 13: Ajouter inspectDOMStore aux commandes
function addInspectDOMStore(content) {
  const inspectMethod = `      inspectDOMStore: () => {
        const store = document.getElementById(CONFIG.domStoreId);
        if (store) {
          console.log("📦 Conteneur DOM Store trouvé:");
          console.log("  - ID:", store.id);
          console.log("  - Created:", store.getAttribute('data-created'));
          console.log("  - Last Update:", store.getAttribute('data-last-update'));
          console.log("  - Table Count:", store.getAttribute('data-table-count'));

          const dataScript = store.querySelector('script[type="application/json"]');
          if (dataScript) {
            const data = JSON.parse(dataScript.textContent);
            console.log("  - Data Size:", dataScript.textContent.length, "bytes");
            console.log("  - Tables:", Object.keys(data));
            return { store, data };
          } else {
            console.log("  - No data script found");
          }
        } else {
          console.log("❌ DOM Store non trouvé");
        }
      },
`;

  // Insérer avant la méthode help
  content = content.replace(
    /(restoreAll:[\s\S]*?\},\s*)(help:)/,
    `$1\n${inspectMethod}\n      $2`
  );

  return content;
}

// Transformation 14: Mettre à jour le help
function updateHelp(content) {
  const newHelp = `      help: () => {
        console.log(\`
🎯 COMMANDES CLARAVERSE DISPONIBLES (DOM PERSISTENCE):

📊 Gestion des données:
  - claraverseCommands.getStorageInfo()       : Afficher les infos de stockage DOM
  - claraverseCommands.restoreAll()           : Restaurer toutes les tables depuis DOM
  - claraverseCommands.saveNow()              : Sauvegarder toutes les tables dans DOM
  - claraverseCommands.clearAllData()         : Effacer toutes les données du DOM
  - claraverseCommands.clearTable(tableId)    : Effacer une table spécifique

💾 Import/Export:
  - claraverseCommands.exportData()           : Exporter les données en JSON
  - claraverseCommands.importData(json)       : Importer des données JSON

🔍 Diagnostic DOM:
  - claraverseCommands.inspectDOMStore()      : Inspecter le conteneur DOM
  - claraverseCommands.debug.showStorage()    : Afficher le contenu JSON

⚠️  IMPORTANT:
    Les données sont persistées dans le DOM et seront perdues lors du rechargement de la page.
    Utilisez exportData() pour sauvegarder vos données de manière permanente.

💡 Les changements dans les tables sont automatiquement détectés et sauvegardés dans le DOM après 500ms
        \`);
      },`;

  content = content.replace(
    /help: \(\) => \{[\s\S]*?\},\s*\};/,
    newHelp + '\n    };'
  );

  return content;
}

// Transformation 15: Mettre à jour getStorageInfo dans les commandes
function updateGetStorageInfoCommand(content) {
  content = content.replace(
    /(getStorageInfo: \(\) => \{[\s\S]*?console\.log\(\s*`📊 Total:)/,
    `$1 Storage: \${info.storageType} |`
  );

  // Ajouter affichage du domStoreId
  content = content.replace(
    /(console\.log\(\s*`📊.*?\);[\s\S]*?)(if \(info\.lastUpdate\))/,
    `$1\n        console.log(\`📍 DOM Store ID: \${info.domStoreId}\`);\n        $2`
  );

  return content;
}

// Transformation 16: Mettre à jour debug.showStorage
function updateDebugShowStorage(content) {
  content = content.replace(
    /showStorage:[\s\S]*?console\.log\("📦 Contenu du localStorage:"\);/,
    'showStorage: () => {\n          const data = processor.loadAllData();\n          console.log("📦 Contenu du DOM Store:");'
  );

  return content;
}

// Fonction principale de migration
function migrate() {
  console.log('🚀 Démarrage de la migration vers DOM Persistence...\n');

  // Lire le fichier source
  let content = readSourceFile();
  console.log('✅ Fichier source lu:', CONFIG.sourceFile);

  // Créer un backup
  createBackup(content);

  // Appliquer toutes les transformations
  console.log('\n📝 Application des transformations...');

  content = updateHeader(content);
  console.log('  ✓ Header mis à jour');

  content = updateConfig(content);
  console.log('  ✓ CONFIG mis à jour');

  content = updateConstructor(content);
  console.log('  ✓ Constructeur mis à jour');

  content = removeTestLocalStorage(content);
  console.log('  ✓ testLocalStorage supprimé');

  content = addInitializeDOMStore(content);
  console.log('  ✓ initializeDOMStore ajouté');

  content = updateInit(content);
  console.log('  ✓ init() mis à jour');

  content = replaceLoadAllData(content);
  console.log('  ✓ loadAllData() remplacé');

  content = replaceSaveAllData(content);
  console.log('  ✓ saveAllData() remplacé');

  content = updateDebugMessages(content);
  console.log('  ✓ Messages de debug mis à jour');

  content = updateClearAllData(content);
  console.log('  ✓ clearAllData() mis à jour');

  content = updateGetStorageInfo(content);
  console.log('  ✓ getStorageInfo() mis à jour');

  content = updateExportData(content);
  console.log('  ✓ exportData() mis à jour');

  content = addInspectDOMStore(content);
  console.log('  ✓ inspectDOMStore() ajouté');

  content = updateHelp(content);
  console.log('  ✓ help() mis à jour');

  content = updateGetStorageInfoCommand(content);
  console.log('  ✓ Commande getStorageInfo mise à jour');

  content = updateDebugShowStorage(content);
  console.log('  ✓ debug.showStorage() mis à jour');

  // Écrire le fichier de sortie
  writeOutputFile(content);

  console.log('\n✅ Migration terminée avec succès!');
  console.log('\n📋 Prochaines étapes:');
  console.log('  1. Vérifier le fichier migré:', CONFIG.outputFile);
  console.log('  2. Tester dans le navigateur');
  console.log('  3. Exécuter: claraverseCommands.inspectDOMStore()');
  console.log('  4. Valider avec: claraverseCommands.getStorageInfo()');
  console.log('\n💾 Backup sauvegardé:', CONFIG.backupFile);
}

// Exécuter la migration
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
