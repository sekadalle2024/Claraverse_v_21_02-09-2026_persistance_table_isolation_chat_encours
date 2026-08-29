/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PAPIER DE TRAVAIL - SCHÉMA DE CALCUL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce module gère l'ajout automatique d'une table "Schéma de calcul" au-dessus
 * des tables principales de test (Modelised_table) dans le chat.
 * 
 * Fonctionnalités:
 * - Détection automatique de la "Nature de test" dans la table 2 de la div
 * - Génération du schéma de calcul approprié selon la nature de test
 * - Positionnement au-dessus de la table principale
 * - Sauvegarde persistante avec localStorage (comme conso.js)
 * - Édition des cellules du schéma de calcul
 * 
 * @version 1.0
 * @date 2026-04-24
 */

(function () {
  "use strict";

  console.log("📐 [Schéma Calcul] Module chargé - v1.1 (Red Fix)");

  // Injection CSS pour forcer la couleur rouge foncé
  const injectStyles = () => {
    const styleId = 'claraverse-schema-calcul-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Force la couleur rouge foncé sur toutes les tables de schéma de calcul */
      table.claraverse-schema-calcul, 
      table.claraverse-schema-calcul tr, 
      table.claraverse-schema-calcul td,
      table.claraverse-schema-calcul td span {
        color: #8B0000 !important;
        font-weight: bold !important;
      }
      
      /* Mode sombre */
      .dark table.claraverse-schema-calcul td {
        color: #FF4D4D !important;
      }

      /* Cellules éditables */
      table.claraverse-schema-calcul td[contenteditable="true"] {
        color: #8B0000 !important;
      }
    `;
    document.head.appendChild(style);
    console.log("🎨 [Schéma Calcul] Styles CSS de secours injectés");
  };
  injectStyles();


  // Configuration
  const CONFIG = {
    storageKey: "claraverse_schema_calcul_data",
    autoSaveDelay: 500,
    debugMode: true,
  };

  // Utilitaires de debug
  const debug = {
    log: (...args) => CONFIG.debugMode && console.log("📐 [Schéma]", ...args),
    error: (...args) => console.error("❌ [Schéma]", ...args),
    warn: (...args) => console.warn("⚠️ [Schéma]", ...args),
  };

  /**
   * Classe principale pour gérer les schémas de calcul
   */
  class SchemaCalculManager {
    constructor() {
      this.processedTables = new WeakSet();
      this.saveTimeout = null;
      this.isInitialized = false;
      this.storageKey = CONFIG.storageKey;
      this.autoSaveDelay = CONFIG.autoSaveDelay;
    }

    init() {
      if (this.isInitialized) return;
      
      debug.log("Initialisation du gestionnaire de schémas de calcul");
      
      // Attendre que le DOM soit prêt
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.start());
      } else {
        this.start();
      }
    }

    start() {
      this.testLocalStorage();
      this.startMonitoring();
      this.restoreAllSchemas();
      this.setupGlobalColorizer(); // Colorisateur robuste de secours
      this.isInitialized = true;
      
      debug.log("✅ Gestionnaire initialisé avec succès");
    }

    /**
     * Colorisateur global de secours (Brute Force)
     * Parcourt le DOM pour trouver toute cellule ressemblant à une variable (A), (B)...
     * et lui applique le style rouge foncé.
     */
    setupGlobalColorizer() {
      const colorize = (node) => {
        if (!node || !node.querySelectorAll) return;
        
        const cells = node.querySelectorAll("td");
        cells.forEach(td => {
          const text = td.textContent.trim();
          // Détecte (A), (B), (C)... ou (C) = (A) - (B)
          if (/^\([A-Z]\)$|^\([A-Z]\)\s*[==+\-]/.test(text)) {
            td.style.setProperty("color", "#8B0000", "important");
            td.style.setProperty("font-weight", "bold", "important");
            
            // Ajouter la classe à la table pour les futurs traitements CSS
            const table = td.closest("table");
            if (table && !table.classList.contains("claraverse-schema-calcul")) {
              table.classList.add("claraverse-schema-calcul");
            }
          }
        });
      };

      // Appliquer immédiatement
      colorize(document.body);

      // Surveiller les nouveaux éléments (chat, restaurations, etc.)
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              colorize(node);
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
      debug.log("👁️ [Colorizer] Surveillance globale des variables active");
    }

    /**
     * Tester la disponibilité de localStorage
     */
    testLocalStorage() {
      try {
        if (typeof localStorage === "undefined") {
          debug.warn("localStorage n'est pas disponible");
          return false;
        }

        const testKey = "claraverse_schema_test";
        localStorage.setItem(testKey, "test");
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        if (testValue === "test") {
          debug.log("✅ localStorage fonctionne correctement");
          
          const existingData = this.loadAllData();
          const schemaCount = Object.keys(existingData).length;
          debug.log(`📦 ${schemaCount} schéma(s) trouvé(s) dans le stockage`);
          
          return true;
        }
      } catch (error) {
        debug.error("Erreur de test localStorage:", error.message);
        return false;
      }
    }

    /**
     * Démarrer la surveillance des tables
     */
    startMonitoring() {
      // Traitement initial
      this.processAllTables();

      // Surveillance continue avec MutationObserver
      this.setupMutationObserver();

      // Fallback avec setInterval
      this.intervalId = setInterval(() => {
        this.processAllTables();
      }, 2000);

      debug.log("Surveillance des tables démarrée");
    }

    /**
     * Configurer le MutationObserver
     */
    setupMutationObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new MutationObserver((mutations) => {
        let shouldProcess = false;

        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (
                  node.tagName === "TABLE" ||
                  (node.querySelector && node.querySelector("table"))
                ) {
                  shouldProcess = true;
                }
              }
            });
          }
        });

        if (shouldProcess) {
          debug.log("Changement DOM détecté, retraitement des tables");
          setTimeout(() => this.processAllTables(), 500);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }

    /**
     * Traiter toutes les tables du document
     */
    processAllTables() {
      // Rechercher toutes les divs contenant des tables
      const chatDivs = document.querySelectorAll('div.prose, div[class*="prose"]');
      
      chatDivs.forEach((div) => {
        this.processDivTables(div);
      });
    }

    /**
     * Traiter les tables dans une div spécifique
     */
    processDivTables(div) {
      debug.log("🔍 [DEBUT] Traitement d'une div");
      
      const tables = div.querySelectorAll("table");
      debug.log(`📊 Nombre de tables trouvées: ${tables.length}`);
      
      if (tables.length < 2) {
        debug.warn(`⚠️ Pas assez de tables (besoin de 2 minimum, trouvé ${tables.length})`);
        return;
      }

      // Identifier la table 2 (contient "Nature de test")
      let table2 = null;
      let natureDeTest = null;

      debug.log("🔍 Recherche de la table avec 'Nature de test'...");
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const result = this.extractNatureDeTest(table);
        debug.log(`  Table ${i + 1}: ${result ? `✅ Nature trouvée: "${result}"` : "❌ Pas de nature"}`);
        if (result) {
          table2 = table;
          natureDeTest = result;
          break;
        }
      }

      if (!table2 || !natureDeTest) {
        debug.error("❌ Aucune table avec 'Nature de test' trouvée");
        return;
      }

      debug.log(`✅ Nature de test détectée: "${natureDeTest}"`);

      // Trouver la table principale (Modelised_table) - celle avec Conclusion, Assertion ou CTR
      let tablePrincipale = null;
      
      debug.log("🔍 Recherche de la table principale (avec Conclusion/Assertion/CTR)...");
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        if (table === table2) {
          debug.log(`  Table ${i + 1}: ⏭️ Ignorée (c'est la table 2)`);
          continue;
        }
        
        const headers = this.getTableHeaders(table);
        debug.log(`  Table ${i + 1}: En-têtes = [${headers.join(", ")}]`);
        
        if (this.isModelizedTable(table)) {
          tablePrincipale = table;
          debug.log(`  Table ${i + 1}: ✅ C'est la table principale!`);
          break;
        } else {
          debug.log(`  Table ${i + 1}: ❌ Pas de colonne requise`);
        }
      }

      if (!tablePrincipale) {
        debug.error("❌ Aucune table principale trouvée (pas de colonne Conclusion/Assertion/CTR)");
        return;
      }

      // Vérifier si un schéma existe déjà
      if (this.processedTables.has(tablePrincipale)) {
        debug.warn("⚠️ Schéma déjà créé pour cette table");
        return;
      }

      // Créer le schéma de calcul
      debug.log("🎯 Création du schéma de calcul...");
      this.createSchemaCalcul(tablePrincipale, natureDeTest, div);
      this.processedTables.add(tablePrincipale);
      debug.log("✅ [FIN] Schéma créé avec succès!");
    }

    /**
     * Extraire la "Nature de test" de la table 2
     * Gère 3 cas:
     * - Cas 1 horizontal (ligne): "Nature de test" | "Rapprochement"
     * - Cas 2 vertical (colonne): "Nature de test" en en-tête, "Rapprochement" dans la cellule en dessous
     * - Cas 3 colonne adjacente: Colonne "Nature de test" avec valeur dans cellule adjacente (même ligne)
     */
    extractNatureDeTest(table) {
      const rows = table.querySelectorAll("tr");
      
      debug.log(`📐 [Nature] Analyse de table avec ${rows.length} ligne(s)`);
      
      // CAS 1: Recherche horizontale (dans les lignes)
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const cells = row.querySelectorAll("td, th");
        
        for (let i = 0; i < cells.length - 1; i++) {
          const cellText = cells[i].textContent.trim().toLowerCase();
          
          if (cellText.includes("nature") && cellText.includes("test")) {
            // La valeur est dans la cellule suivante (même ligne)
            const valueCell = cells[i + 1];
            if (valueCell && valueCell.textContent.trim() !== "") {
              const value = valueCell.textContent.trim();
              debug.log(`📐 [Nature] ✅ Trouvée en horizontal (ligne ${rowIdx}): "${value}"`);
              return value;
            }
          }
        }
      }
      
      // CAS 2: Recherche verticale (dans les colonnes)
      // Parcourir TOUTES les lignes pour trouver "Nature de test"
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const cells = row.querySelectorAll("td, th");
        
        for (let colIdx = 0; colIdx < cells.length; colIdx++) {
          const cellText = cells[colIdx].textContent.trim().toLowerCase();
          
          if (cellText.includes("nature") && cellText.includes("test")) {
            debug.log(`📐 [Nature] Colonne "Nature de test" trouvée à ligne ${rowIdx}, colonne ${colIdx}`);
            
            // Chercher la valeur dans les lignes suivantes, même colonne
            for (let nextRowIdx = rowIdx + 1; nextRowIdx < rows.length; nextRowIdx++) {
              const nextRow = rows[nextRowIdx];
              const nextCells = nextRow.querySelectorAll("td, th");
              
              if (nextCells[colIdx]) {
                const value = nextCells[colIdx].textContent.trim();
                if (value !== "" && !value.toLowerCase().includes("nature")) {
                  debug.log(`📐 [Nature] ✅ Trouvée en vertical (ligne ${nextRowIdx}): "${value}"`);
                  return value;
                }
              }
            }
            
            // CAS 3: Si pas de valeur en dessous, chercher dans la cellule adjacente (même ligne, colonne suivante)
            // Cela gère le cas où l'en-tête est mal rendu et devient une colonne
            if (colIdx + 1 < cells.length) {
              const adjacentCell = cells[colIdx + 1];
              if (adjacentCell && adjacentCell.textContent.trim() !== "") {
                const value = adjacentCell.textContent.trim();
                if (!value.toLowerCase().includes("nature")) {
                  debug.log(`📐 [Nature] ✅ Trouvée en colonne adjacente (ligne ${rowIdx}, colonne ${colIdx + 1}): "${value}"`);
                  return value;
                }
              }
            }
          }
        }
      }
      
      debug.log("📐 [Nature] ❌ Aucune nature de test trouvée");
      return null;
    }

    /**
     * Vérifier si une table est une table modelisée (contient Conclusion, Assertion, CTR ou Ecart)
     */
    isModelizedTable(table) {
      const headers = this.getTableHeaders(table);
      
      // Chercher les colonnes spécifiques avec des patterns plus flexibles
      return headers.some(header => {
        const h = header.toLowerCase().trim();
        // Conclusion
        if (h === "conclusion") return true;
        // Assertion
        if (h === "assertion") return true;
        // CTR (avec ou sans numéro)
        if (/^ctr\d*$/i.test(h)) return true;
        // Ecart (avec ou sans accent, peut contenir "montant")
        if (h.includes("ecart") || h.includes("écart") || h.includes("montant")) return true;
        
        return false;
      });
    }

    /**
     * Obtenir les en-têtes d'une table
     */
    getTableHeaders(table) {
      const headerSelectors = [
        "thead th",
        "thead td",
        "tr:first-child th",
        "tr:first-child td",
      ];

      for (const selector of headerSelectors) {
        const headers = table.querySelectorAll(selector);
        if (headers.length > 0) {
          return Array.from(headers).map((cell) => cell.textContent.trim());
        }
      }

      return [];
    }

    /**
     * Vérifier si un en-tête correspond à un type de colonne
     */
    matchesColumn(headerText, columnType) {
      const h = headerText.toLowerCase().trim();
      
      switch(columnType) {
        case "assertion":
          return h === "assertion";
        case "conclusion":
          return h === "conclusion";
        case "ctr":
          return /^ctr\d*$/i.test(h);
        case "ecart":
          return h.includes("ecart") || h.includes("écart") || h.includes("montant");
        default:
          return false;
      }
    }

    /**
     * Trouver l'index de la colonne "Ecart" dans une table
     */
    findEcartColumnIndex(table) {
      const headers = this.getTableHeaders(table);
      
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase().trim();
        if (h.includes("ecart") || h.includes("écart") || h.includes("montant")) {
          debug.log(`📐 [Alignement] Colonne "Ecart" trouvée à l'index ${i}`);
          return i;
        }
      }
      
      debug.warn("📐 [Alignement] Colonne 'Ecart' non trouvée");
      return -1;
    }

    /**
     * Calculer le nombre de colonnes vides à ajouter avant les variables
     */
    calculateEmptyColumnsCount(tablePrincipale, modele) {
      const totalColumns = this.getTableHeaders(tablePrincipale).length;
      const ecartIndex = this.findEcartColumnIndex(tablePrincipale);
      
      debug.log(`📐 [Alignement] Total colonnes table: ${totalColumns}`);
      debug.log(`📐 [Alignement] Index colonne Ecart: ${ecartIndex}`);
      debug.log(`📐 [Alignement] Nombre de variables: ${modele.colonnes.length}`);
      
      if (ecartIndex === -1) {
        // Pas de colonne Ecart, aligner à droite
        const emptyColumns = totalColumns - modele.colonnes.length;
        debug.log(`📐 [Alignement] Pas d'Ecart, alignement à droite: ${emptyColumns} colonnes vides`);
        return Math.max(0, emptyColumns);
      }
      
      // Aligner pour que la dernière variable soit sur la colonne Ecart
      const variablesCount = modele.colonnes.length;
      const emptyColumns = ecartIndex - variablesCount + 1;
      
      debug.log(`📐 [Alignement] Formule: ${ecartIndex} - ${variablesCount} + 1 = ${emptyColumns}`);
      
      return Math.max(0, emptyColumns);
    }

    /**
     * Créer le schéma de calcul selon la nature de test
     */
    createSchemaCalcul(tablePrincipale, natureDeTest, parentDiv) {
      debug.log(`Création du schéma de calcul pour: ${natureDeTest}`);

      // Déterminer le modèle à utiliser
      const modele = this.determinerModele(natureDeTest);
      
      if (!modele) {
        debug.warn(`Aucun modèle trouvé pour: ${natureDeTest}`);
        return;
      }

      // Vérifier si un schéma existe déjà
      const existingSchema = this.findExistingSchema(tablePrincipale);
      if (existingSchema) {
        debug.log("Schéma de calcul déjà existant");
        return;
      }

      // Créer la table du schéma avec alignement
      const schemaTable = this.buildSchemaTable(modele, natureDeTest, tablePrincipale);
      
      // Générer un ID unique pour le schéma
      const schemaId = this.generateSchemaId(tablePrincipale);
      schemaTable.dataset.schemaId = schemaId;
      schemaTable.dataset.forTable = tablePrincipale.dataset.tableId || this.generateTableId(tablePrincipale);

      // Insérer le schéma au-dessus de la table principale
      tablePrincipale.parentNode.insertBefore(schemaTable, tablePrincipale);

      // Rendre les cellules éditables
      this.makeSchemaEditable(schemaTable);

      // Installer le détecteur de changements
      this.setupSchemaChangeDetection(schemaTable);

      debug.log(`✅ Schéma de calcul créé avec ID: ${schemaId}`);
    }

    /**
     * Déterminer le modèle selon la nature de test
     */
    determinerModele(natureDeTest) {
      const nature = natureDeTest.toLowerCase();

      // Validation
      if (nature.includes("validation")) {
        return {
          type: "Validation",
          colonnes: ["(A)", "(B)", "(C) = (A) + (B)", "(D)", "(E) = (C) - (D)"],
        };
      }

      // Mouvement
      if (nature.includes("mouvement")) {
        return {
          type: "Mouvement",
          colonnes: ["(A)", "(B)", "(C)", "(D) = (A) + (B) - (C)", "(E)", "(F) = (D) - (E)"],
        };
      }

      // Rapprochement
      if (nature.includes("rapprochement")) {
        return {
          type: "Rapprochement",
          colonnes: ["(A)", "(B)", "(C) = (A) - (B)"],
        };
      }

      // Séparation
      if (nature.includes("separation") || nature.includes("séparation")) {
        return {
          type: "Séparation",
          colonnes: ["(A)", "(B)", "(C) = (A) - (B)"],
        };
      }

      // Estimation
      if (nature.includes("estimation")) {
        return {
          type: "Estimation",
          colonnes: ["(A)", "(B)", "(C) = (A) * (B)", "(D)", "(E) = (C) - (D)"],
        };
      }

      // Revue analytique
      if (nature.includes("revue") && nature.includes("analytique")) {
        return {
          type: "Revue analytique",
          colonnes: ["(A)", "(B)", "(C) = (A) - (B)"],
        };
      }

      // Cadrage TVA
      if (nature.includes("cadrage") && nature.includes("tva")) {
        return {
          type: "Cadrage TVA",
          colonnes: ["(A)", "(B) = (A) * 18%", "(C)", "(D)", "(E)", "(F) = (B) - (C) - (D) - (E)"],
        };
      }

      // Cotisations sociales
      if (nature.includes("cotisation") && nature.includes("sociale")) {
        return {
          type: "Cotisations sociales",
          colonnes: ["(A)", "(B)", "(C)", "(D)"],
        };
      }

      // Confirmations bancaires
      if (nature.includes("confirmation") || nature.includes("bancaire")) {
        return {
          type: "Confirmations bancaires",
          colonnes: ["(A)", "(B)", "(C)", "(D) = (A) + (B) - (C)", "(E)", "(F)", "(G)", "(H) = (E) + (F) - (G)", "(I) = (D) - (H)"],
        };
      }

      // Vierge
      if (nature.includes("vierge")) {
        return {
          type: "Vierge",
          colonnes: [],
        };
      }

      // Modélisation (détection par expressions régulières)
      if (nature.includes("modelisation") || nature.includes("modélisation")) {
        // Analyser la nature pour extraire les variables
        const variables = this.extractVariablesFromNature(natureDeTest);
        return {
          type: "Modélisation",
          colonnes: variables,
        };
      }

      // Par défaut, si aucune condition n'est respectée mais que la nature est non vide
      if (natureDeTest.trim() !== "") {
        // Essayer de détecter un pattern de modélisation
        const variables = this.extractVariablesFromNature(natureDeTest);
        if (variables.length > 0) {
          return {
            type: "Modélisation (auto-détecté)",
            colonnes: variables,
          };
        }
      }

      return null;
    }

    /**
     * Extraire les variables d'une formule de modélisation
     * Exemples: "(X) = (Y) - (Z)", "(A) + (B) - (C) = (D)"
     */
    extractVariablesFromNature(natureDeTest) {
      // Pattern pour détecter les variables entre parenthèses
      const variablePattern = /\([A-Z]\)/g;
      const matches = natureDeTest.match(variablePattern);
      
      if (!matches) return [];

      // Supprimer les doublons et retourner
      return [...new Set(matches)];
    }

    /**
     * Construire la table HTML du schéma de calcul
     */
    buildSchemaTable(modele, natureDeTest, tablePrincipale) {
      const table = document.createElement("table");
      table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg claraverse-schema-calcul";
      table.style.cssText = `
        margin-bottom: 1rem;
        border-collapse: separate;
        border-spacing: 0;
      `;

      // Calculer l'alignement
      const totalColumns = this.getTableHeaders(tablePrincipale).length;
      const emptyColumnsCount = this.calculateEmptyColumnsCount(tablePrincipale, modele);
      
      debug.log(`📐 [Build] Total colonnes: ${totalColumns}`);
      debug.log(`📐 [Build] Colonnes vides avant: ${emptyColumnsCount}`);

      // Créer le tbody (pas d'en-tête pour le schéma de calcul)
      const tbody = document.createElement("tbody");

      // Ligne unique avec les colonnes
      const row = document.createElement("tr");

      // Ajouter les colonnes vides AVANT les variables (fusionnées)
      if (emptyColumnsCount > 0) {
        const td = document.createElement("td");
        td.className = "px-4 py-3 border border-gray-200 dark:border-gray-700";
        td.style.cssText = `
          min-width: 80px;
        `;
        td.colSpan = emptyColumnsCount;
        td.textContent = "";
        row.appendChild(td);
      }

      // Ajouter les colonnes du modèle (variables)
      modele.colonnes.forEach((colonne, index) => {
        const td = document.createElement("td");
        td.className = "px-4 py-3 text-sm border border-gray-200 dark:border-gray-700";
        
        // Largeur augmentée de 60% pour les formules avec "=" (80px * 1.6 = 128px)
        const isFormula = colonne.includes("=");
        const minWidth = isFormula ? "130px" : "80px";
        const whiteSpace = isFormula ? "nowrap" : "normal";

        td.style.cssText = `
          font-weight: bold !important;
          text-align: center !important;
          min-width: ${minWidth} !important;
          white-space: ${whiteSpace} !important;
          color: #8B0000 !important;
        `;
        td.innerHTML = `<span style="color: #8B0000 !important; font-weight: bold !important;">${colonne}</span>`;
        td.contentEditable = "true";
        row.appendChild(td);
      });

      // Compléter avec des colonnes vides APRÈS les variables si nécessaire (fusionnées)
      const remainingColumns = totalColumns - emptyColumnsCount - modele.colonnes.length;
      debug.log(`📐 [Build] Colonnes vides après: ${remainingColumns}`);
      
      if (remainingColumns > 0) {
        const td = document.createElement("td");
        td.className = "px-4 py-3 border border-gray-200 dark:border-gray-700";
        td.style.cssText = `
          min-width: 80px;
        `;
        td.colSpan = remainingColumns;
        td.textContent = "";
        row.appendChild(td);
      }

      tbody.appendChild(row);
      table.appendChild(tbody);

      return table;
    }

    /**
     * Rendre le schéma éditable
     */
    makeSchemaEditable(schemaTable) {
      const cells = schemaTable.querySelectorAll("td");
      
      cells.forEach((cell) => {
        cell.contentEditable = "true";
        cell.style.cursor = "text";
        
        // Événements pour la sauvegarde
        cell.addEventListener("blur", () => {
          this.saveSchemaData(schemaTable);
        });

        cell.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            cell.blur();
          }
        });
      });
    }

    /**
     * Installer le détecteur de changements sur le schéma
     */
    setupSchemaChangeDetection(schemaTable) {
      if (schemaTable.dataset.observerInstalled === "true") {
        return;
      }

      const schemaId = schemaTable.dataset.schemaId;
      debug.log(`🔍 Installation détecteur sur schéma ${schemaId}`);

      const schemaObserver = new MutationObserver((mutations) => {
        let hasChanges = false;

        mutations.forEach((mutation) => {
          if (
            mutation.type === "characterData" ||
            mutation.type === "childList"
          ) {
            hasChanges = true;
          }
        });

        if (hasChanges) {
          debug.log(`📝 Changement détecté dans schéma ${schemaId}`);
          this.saveSchemaData(schemaTable);
        }
      });

      schemaObserver.observe(schemaTable, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: false,
      });

      schemaTable.dataset.observerInstalled = "true";

      if (!this.schemaObservers) {
        this.schemaObservers = new Map();
      }
      this.schemaObservers.set(schemaTable, schemaObserver);

      debug.log(`✅ Détecteur installé sur schéma ${schemaId}`);
    }

    /**
     * Trouver un schéma existant pour une table
     */
    findExistingSchema(tablePrincipale) {
      const tableId = tablePrincipale.dataset.tableId || this.generateTableId(tablePrincipale);
      return document.querySelector(`table.claraverse-schema-calcul[data-for-table="${tableId}"]`);
    }

    /**
     * Générer un ID unique pour le schéma
     */
    generateSchemaId(tablePrincipale) {
      const tableId = tablePrincipale.dataset.tableId || this.generateTableId(tablePrincipale);
      return `schema_${tableId}_${Date.now()}`;
    }

    /**
     * Générer un ID pour une table
     */
    generateTableId(table) {
      if (table.dataset.tableId) {
        return table.dataset.tableId;
      }

      const headers = this.getTableHeaders(table);
      const headerText = headers.join("__").replace(/\s+/g, "_");
      const hash = this.hashCode(headerText);
      const uniqueId = `table_${hash}`;
      
      table.dataset.tableId = uniqueId;
      return uniqueId;
    }

    /**
     * Fonction de hachage simple
     */
    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    }

    /**
     * Sauvegarder les données du schéma avec debounce
     */
    saveSchemaData(schemaTable) {
      if (!schemaTable) {
        debug.warn("schemaTable est null");
        return;
      }

      debug.log("⏳ Sauvegarde programmée dans", this.autoSaveDelay, "ms");

      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = setTimeout(() => {
        this.saveSchemaDataNow(schemaTable);
      }, this.autoSaveDelay);
    }

    /**
     * Sauvegarder immédiatement les données du schéma
     */
    saveSchemaDataNow(schemaTable) {
      if (!schemaTable) {
        debug.warn("schemaTable est null");
        return;
      }

      debug.log("💾 Début de sauvegarde immédiate du schéma");

      const schemaId = schemaTable.dataset.schemaId;
      debug.log("🆔 ID de schéma pour sauvegarde:", schemaId);

      const allData = this.loadAllData();

      // Extraire les données du schéma
      const schemaData = {
        timestamp: Date.now(),
        forTable: schemaTable.dataset.forTable,
        cells: [],
      };

      const rows = schemaTable.querySelectorAll("tbody tr");
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, colIndex) => {
          schemaData.cells.push({
            row: rowIndex,
            col: colIndex,
            value: cell.textContent.trim(),
          });
        });
      });

      allData[schemaId] = schemaData;
      this.saveAllData(allData);

      debug.log(`✅ Schéma ${schemaId} sauvegardé avec succès`);
    }

    /**
     * Charger toutes les données depuis localStorage
     */
    loadAllData() {
      try {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
      } catch (error) {
        debug.error("Erreur lors du chargement des données:", error);
        return {};
      }
    }

    /**
     * Sauvegarder toutes les données dans localStorage
     */
    saveAllData(data) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        debug.log("💾 Données sauvegardées dans localStorage");
      } catch (error) {
        debug.error("❌ Erreur lors de la sauvegarde:", error);
        if (error.name === "QuotaExceededError") {
          debug.warn("⚠️ Quota localStorage dépassé");
          console.warn("⚠️ Espace de stockage insuffisant pour les schémas de calcul");
        }
      }
    }

    /**
     * Restaurer tous les schémas depuis localStorage
     */
    restoreAllSchemas() {
      debug.log("🔄 Restauration des schémas depuis localStorage");

      const allData = this.loadAllData();
      const schemaIds = Object.keys(allData);

      if (schemaIds.length === 0) {
        debug.log("Aucun schéma à restaurer");
        return;
      }

      debug.log(`📦 ${schemaIds.length} schéma(s) à restaurer`);

      schemaIds.forEach((schemaId) => {
        const schemaData = allData[schemaId];
        const forTableId = schemaData.forTable;

        // Trouver la table principale
        const tablePrincipale = document.querySelector(`table[data-table-id="${forTableId}"]`);
        
        if (!tablePrincipale) {
          debug.warn(`Table principale ${forTableId} non trouvée pour schéma ${schemaId}`);
          return;
        }

        // Vérifier si le schéma existe déjà
        const existingSchema = document.querySelector(`table[data-schema-id="${schemaId}"]`);
        
        if (existingSchema) {
          // Restaurer les valeurs
          this.restoreSchemaValues(existingSchema, schemaData);
        } else {
          debug.log(`Schéma ${schemaId} non trouvé dans le DOM, sera recréé`);
        }
      });

      debug.log("✅ Restauration terminée");
    }

    /**
     * Restaurer les valeurs d'un schéma
     */
    restoreSchemaValues(schemaTable, schemaData) {
      const rows = schemaTable.querySelectorAll("tbody tr");
      
      schemaData.cells.forEach((cellData) => {
        const row = rows[cellData.row];
        if (!row) return;

        const cells = row.querySelectorAll("td");
        const cell = cells[cellData.col];
        
        if (cell && cellData.value) {
          cell.textContent = cellData.value;
        }
      });

      debug.log(`✅ Valeurs restaurées pour schéma ${schemaTable.dataset.schemaId}`);
    }

    /**
     * Nettoyer les ressources
     */
    cleanup() {
      if (this.observer) {
        this.observer.disconnect();
      }

      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      if (this.schemaObservers) {
        this.schemaObservers.forEach((observer) => observer.disconnect());
        this.schemaObservers.clear();
      }

      debug.log("🧹 Ressources nettoyées");
    }
  }

  // Initialiser le gestionnaire
  const manager = new SchemaCalculManager();
  manager.init();

  // Exposer globalement pour le debug
  window.SchemaCalculManager = manager;

  // Commandes de debug
  window.schemaCalculCommands = {
    processAll: () => manager.processAllTables(),
    showStorage: () => {
      const data = manager.loadAllData();
      console.log("📦 Contenu du localStorage (schémas):");
      console.log(JSON.stringify(data, null, 2));
    },
    clearStorage: () => {
      if (confirm("Effacer tous les schémas sauvegardés ?")) {
        localStorage.removeItem(CONFIG.storageKey);
        console.log("🗑️ Schémas effacés");
      }
    },
    restoreAll: () => manager.restoreAllSchemas(),
  };

  debug.log("✅ Module Schéma de Calcul initialisé");
  debug.log("💡 Commandes disponibles: schemaCalculCommands");

})();
