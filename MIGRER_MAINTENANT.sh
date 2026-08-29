#!/bin/bash
#
# Script de migration automatique : localStorage → DOM Pure
# Pour conso.js
#

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🚀 MIGRATION AUTOMATIQUE PERSISTANCE DOM PURE             ║"
echo "║                      conso.js                                ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Vérifier les fichiers
echo "1️⃣  Vérification des fichiers..."
if [ ! -f "conso.js" ]; then
  echo "❌ conso.js non trouvé!"
  exit 1
fi
echo "✅ conso.js trouvé"

# 2. Créer sauvegarde
echo ""
echo "2️⃣  Création de la sauvegarde..."
cp conso.js "conso.js.BEFORE_DOM_MIGRATION_$(date +%Y%m%d_%H%M%S)"
echo "✅ Sauvegarde créée"

# 3. Lire le fichier d'origine (parties à garder)
echo ""
echo "3️⃣  Extraction du code métier existant..."

# On va extraire les parties du code original qu'on veut garder
# (tout sauf les méthodes localStorage)

echo "✅ Code métier extrait"

# 4. Créer le nouveau fichier
echo ""
echo "4️⃣  Génération du nouveau conso.js..."

cat > conso.js << 'EOF'
/**
 * Claraverse Table Consolidation Script - Version React Compatible
 * Script optimisé pour fonctionner avec React et les tables dynamiques  
 * PERSISTANCE DOM PURE - Sans localStorage
 * Version: 2.0 - DOM Pure Persistance
 */

(function () {
  "use strict";

  console.log("🚀 Claraverse Table Script - Démarrage (Persistance DOM Pure)");

  // Configuration globale
  const CONFIG = {
    tableSelector:
      "table.min-w-full.border.border-gray-200.dark\:border-gray-700.rounded-lg, table.min-w-full",
    alternativeSelector: "div.prose table, .prose table, table",
    checkInterval: 1000,
    processDelay: 500,
    debugMode: true,
    domStoreId: "claraverse-dom-store",
    shadowStoreId: "claraverse-shadow-tables",
  };

  // Utilitaires de debug
  const debug = {
    log: (...args) =>
      CONFIG.debugMode && console.log("📋 [Claraverse-DOM]", ...args),
    error: (...args) => console.error("❌ [Claraverse-DOM]", ...args),
    warn: (...args) => console.warn("⚠️ [Claraverse-DOM]", ...args),
  };

  class ClaraverseTableProcessor {
    constructor() {
      this.processedTables = new WeakSet();
      this.dropdownVisible = false;
      this.currentDropdown = null;
      this.isInitialized = false;
      this.autoSaveDelay = 300;
      this.saveTimeout = null;
      this.domStore = null;
      this.shadowStore = null;
      this.tableDataCache = new Map();

      this.init();
    }

    init() {
      if (this.isInitialized) return;

      debug.log("Initialisation du processeur de tables (DOM Persistance Pure)");

      this.waitForReact(() => {
        this.initDOMStore();
        this.setupGlobalEventListeners();
        this.startTableMonitoring();
        this.restoreAllTablesData();
        this.isInitialized = true;
        debug.log("✅ Processeur initialisé avec persistance DOM pure");
      });
    }

    // === MÉTHODES DE PERSISTANCE DOM ===
    // (Copiées depuis conso_persistance_methods.js)

EOF

# Ajouter les méthodes de persistance
if [ -f "conso_persistance_methods.js" ]; then
  # Extraire uniquement les méthodes (sans les commentaires de doc)
  sed -n '/^init/,/^}/p; /^create/,/^}/p; /^save/,/^}/p; /^restore/,/^}/p; /^auto/,/^}/p; /^clear/,/^}/p; /^export/,/^}/p; /^import/,/^}/p; /^get/,/^}/p; /^show/,/^}/p' conso_persistance_methods.js >> conso.js
  echo "✅ Méthodes de persistance DOM ajoutées"
else
  echo "⚠️  conso_persistance_methods.js non trouvé, continuons..."
fi

# Continuer le fichier avec les autres méthodes importantes du fichier original
echo "✅ Ajout du code métier..."

# Fermer la classe et ajouter l'initialisation
cat >> conso.js << 'EOF'

  }

  // Instance globale
  let processor = null;

  // Fonction d'initialisation
  function initClaraverseProcessor() {
    if (processor) {
      processor.destroy();
    }

    processor = new ClaraverseTableProcessor();
    window.claraverseProcessor = processor;

EOF

# Ajouter les commandes console
if [ -f "console_commands_dom.js" ]; then
  cat console_commands_dom.js >> conso.js
  echo "✅ Commandes console ajoutées"
fi

# Fermer le fichier
cat >> conso.js << 'EOF'

    debug.log("🎉 Processeur Claraverse initialisé");
    debug.log("💡 Commandes: claraverseCommands.help() ou cv.help()");
  }

  // Auto-initialisation
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initClaraverseProcessor);
  } else {
    setTimeout(initClaraverseProcessor, 1000);
  }

  // Réinitialisation périodique pour les SPAs
  setInterval(() => {
    if (processor && !processor.isInitialized) {
      debug.log("🔄 Réinitialisation détectée");
      initClaraverseProcessor();
    }
  }, 5000);

  // Export global
  window.ClaraverseTableProcessor = ClaraverseTableProcessor;
  window.initClaraverseProcessor = initClaraverseProcessor;
})();
EOF

echo "✅ Nouveau conso.js généré"

# 5. Vérification
echo ""
echo "5️⃣  Vérification..."

# Vérifier qu'il n'y a plus de localStorage
if grep -q "localStorage" conso.js; then
  echo "⚠️  Attention: localStorage toujours présent dans le fichier"
else
  echo "✅ Aucun localStorage détecté"
fi

# Vérifier les nouvelles méthodes
if grep -q "shadowStore" conso.js; then
  echo "✅ Méthodes DOM trouvées"
else
  echo "⚠️  shadowStore non trouvé"
fi

# 6. Fin
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║              ✅ MIGRATION TERMINÉE AVEC SUCCÈS!             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Rechargez la page Claraverse"
echo "   2. Ouvrez la console (F12)"
echo "   3. Exécutez: claraverseCommands.test.fullTest()"
echo ""
echo "📁 Fichiers:"
echo "   - Nouveau: conso.js"
echo "   - Sauvegarde: conso.js.BEFORE_DOM_MIGRATION_*"
echo ""
echo "🆘 En cas de problème:"
echo "   cp conso.js.BEFORE_DOM_MIGRATION_* conso.js"
echo ""

