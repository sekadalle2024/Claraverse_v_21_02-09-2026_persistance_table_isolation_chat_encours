#!/bin/bash
# Script pour construire conso.js avec persistance DOM pure

echo "🔧 Construction de conso.js avec persistance DOM pure..."

# Créer le fichier temporaire
cat > conso_temp.js << 'EOF'
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
EOF

echo "✅ Fichier construit: conso_temp.js"
echo "📝 Utilisez ce fichier comme base pour compléter conso.js"

