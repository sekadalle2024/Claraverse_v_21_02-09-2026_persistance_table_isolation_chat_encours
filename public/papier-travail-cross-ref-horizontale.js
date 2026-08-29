/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PAPIER DE TRAVAIL - CROSS RÉFÉRENCE HORIZONTALE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce module gère l'ajout automatique d'une table "Cross référence horizontale"
 * au-dessus des tables principales de test (Modelised_table) dans le chat.
 * 
 * Fonctionnalités:
 * - Détection automatique de la "Nature de test" dans la table 2 de la div
 * - Génération des références selon la nature de test (même structure que Schéma de calcul)
 * - Indexation des références selon le cycle comptable
 * - Sauvegarde persistante avec localStorage
 * - Édition des cellules de cross référence
 * 
 * @version 1.0
 * @date 2026-04-24
 */

(function () {
  "use strict";

  console.log("📎 [Cross Ref] Module chargé");

  // Configuration
  const CONFIG = {
    storageKey: "claraverse_cross_ref_data",
    autoSaveDelay: 500,
    debugMode: true,
  };

  // Utilitaires de debug
  const debug = {
    log: (...args) => CONFIG.debugMode && console.log("📎 [Cross Ref]", ...args),
    error: (...args) => console.error("❌ [Cross Ref]", ...args),
    warn: (...args) => console.warn("⚠️ [Cross Ref]", ...args),
  };

  /**
   * Classe principale pour gérer les cross références horizontales
   */
  class CrossRefHorizontaleManager {
    constructor() {
      this.processedTables = new WeakSet();
      this.saveTimeout = null;
      this.isInitialized = false;
      this.storageKey = CONFIG.storageKey;
      this.autoSaveDelay = CONFIG.autoSaveDelay;
    }

    init() {
      if (this.isInitialized) return;
      
      debug.log("Initialisation du gestionnaire de cross références horizontales");
      
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
      this.restoreAllCrossRefs();
      this.isInitialized = true;
      
      debug.log("✅ Gestionnaire initialisé avec succès");
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

        const testKey = "claraverse_crossref_test";
        localStorage.setItem(testKey, "test");
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        if (testValue === "test") {
          debug.log("✅ localStorage fonctionne correctement");
          
          const existingData = this.loadAllData();
          const crossRefCount = Object.keys(existingData).length;
          debug.log(`📦 ${crossRefCount} cross référence(s) trouvée(s) dans le stockage`);
          
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
      debug.log("🔍 [DEBUT] Traitement d'une div pour cross références");
      
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

      // Trouver la table principale (Modelised_table)
      let tablePrincipale = null;
      
      debug.log("🔍 Recherche de la table principale (à l'envers)...");
      // On cherche à l'envers car la table modélisée est presque toujours la dernière table du chat
      for (let i = tables.length - 1; i >= 0; i--) {
        const table = tables[i];
        if (table === table2) {
          debug.log(`  Table ${i + 1}: ⏭️ Ignorée (c'est la table 2)`);
          continue;
        }
        
        if (this.isModelizedTable(table)) {
          tablePrincipale = table;
          debug.log(`  Table ${i + 1}: ✅ C'est la table principale!`);
          break;
        }
      }

      if (!tablePrincipale) {
        debug.error("❌ Aucune table principale trouvée");
        return;
      }

      // Si l'utilisateur a explicitement supprimé la cross référence pour cette table via le menu
      if (tablePrincipale.dataset.crossRefDeleted === "true") {
        debug.log("⏭️ Cross référence explicitement supprimée par l'utilisateur pour cette table.");
        return;
      }

      // Vérifier si une cross référence existe déjà dans le DOM
      const existingCrossRef = this.findExistingCrossRef(tablePrincipale);
      if (existingCrossRef) {
        debug.warn("⚠️ Cross référence existe déjà dans le DOM");
        return;
      }

      if (this.processedTables.has(tablePrincipale)) {
        debug.warn("⚠️ Table principale déjà traitée");
        return;
      }

      // Création automatique de la cross référence
      debug.log("🎯 Création automatique de la cross référence...");
      const crossRefTable = this.createCrossRefHorizontale(tablePrincipale, natureDeTest, div);
      if (crossRefTable) {
        this.processedTables.add(tablePrincipale);

        // Check if a saved cross-reference exists in localStorage for this table
        const allData = this.loadAllData();
        const tableId = tablePrincipale.dataset.tableId || this.generateTableId(tablePrincipale);
        const savedEntry = Object.values(allData).find(entry => entry.forTable === tableId);
        
        if (savedEntry) {
          debug.log("🎯 Restauration d'une cross référence sauvegardée...");
          this.restoreCrossRefValues(crossRefTable, savedEntry);
        } else {
          // Sauvegarder les valeurs générées par défaut
          this.saveCrossRefDataNow(crossRefTable);
        }
        debug.log("✅ [FIN] Cross référence créée avec succès!");
      }
    }

    /**
     * Créer programmatiquement une cross référence pour une table (depuis le menu contextuel)
     */
    createCrossRefForTable(tablePrincipale, natureDeTest) {
      delete tablePrincipale.dataset.crossRefDeleted;
      const parentDiv = tablePrincipale.closest('div.prose, div[class*="prose"]');
      if (!parentDiv) {
        debug.error("Parent div not found for table");
        return null;
      }
      
      const crossRefTable = this.createCrossRefHorizontale(tablePrincipale, natureDeTest, parentDiv);
      if (crossRefTable) {
        this.processedTables.add(tablePrincipale);
        this.saveCrossRefDataNow(crossRefTable);
        return crossRefTable;
      }
      return null;
    }

    /**
     * Supprimer programmatiquement une cross référence (depuis le menu contextuel)
     */
    deleteCrossRefForTable(tablePrincipale) {
      const tableId = tablePrincipale.dataset.tableId || this.generateTableId(tablePrincipale);
      tablePrincipale.dataset.crossRefDeleted = "true";
      this.processedTables.add(tablePrincipale);
      const existingCrossRef = this.findExistingCrossRef(tablePrincipale);
      
      if (existingCrossRef) {
        // Find wrapper and remove it if it exists
        const parentNode = existingCrossRef.parentNode;
        const globalDiv = tablePrincipale.closest('div.prose, div[class*="prose"]');
        if (parentNode && parentNode !== globalDiv && parentNode.tagName === "DIV") {
          parentNode.remove();
        } else {
          existingCrossRef.remove();
        }
      }
      
      // Remove from localStorage
      const allData = this.loadAllData();
      let found = false;
      
      for (const crossRefId in allData) {
        if (allData[crossRefId].forTable === tableId) {
          delete allData[crossRefId];
          found = true;
        }
      }
      
      if (found) {
        this.saveAllData(allData);
        debug.log(`🗑️ Données de cross référence supprimées pour la table ${tableId}`);
      }
    }

    /**
     * Extraire la "Nature de test" de la table 2
     */
    extractNatureDeTest(table) {
      const rows = table.querySelectorAll("tr");
      
      // CAS 1: Recherche horizontale
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const cells = row.querySelectorAll("td, th");
        
        for (let i = 0; i < cells.length - 1; i++) {
          const cellText = cells[i].textContent.trim().toLowerCase();
          
          if (cellText.includes("nature") && cellText.includes("test")) {
            const valueCell = cells[i + 1];
            if (valueCell && valueCell.textContent.trim() !== "") {
              return valueCell.textContent.trim();
            }
          }
        }
      }
      
      // CAS 2: Recherche verticale
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const cells = row.querySelectorAll("td, th");
        
        for (let colIdx = 0; colIdx < cells.length; colIdx++) {
          const cellText = cells[colIdx].textContent.trim().toLowerCase();
          
          if (cellText.includes("nature") && cellText.includes("test")) {
            for (let nextRowIdx = rowIdx + 1; nextRowIdx < rows.length; nextRowIdx++) {
              const nextRow = rows[nextRowIdx];
              const nextCells = nextRow.querySelectorAll("td, th");
              
              if (nextCells[colIdx]) {
                const value = nextCells[colIdx].textContent.trim();
                if (value !== "" && !value.toLowerCase().includes("nature")) {
                  return value;
                }
              }
            }
            
            // CAS 3: Cellule adjacente
            if (colIdx + 1 < cells.length) {
              const adjacentCell = cells[colIdx + 1];
              if (adjacentCell && adjacentCell.textContent.trim() !== "") {
                const value = adjacentCell.textContent.trim();
                if (!value.toLowerCase().includes("nature")) {
                  return value;
                }
              }
            }
          }
        }
      }
      
      return null;
    }

    /**
     * Vérifier si une table est une table modelisée
     */
    isModelizedTable(table) {
      const headers = this.getTableHeaders(table);
      
      // Exclure explicitement le "Schéma de calcul" (qui a (A), (B) et peu de lignes)
      const isSchema = headers.some(h => /^\([A-Z]\)/.test(h.trim()));
      const numRows = table.querySelectorAll("tr").length;
      
      if (isSchema && numRows <= 3) {
        return false; // C'est le schéma de calcul, pas la Modelised_table
      }
      
      return headers.some(header => {
        const h = header.toLowerCase().trim();
        if (h === "conclusion") return true;
        if (h === "assertion") return true;
        if (/^ctr\d*$/i.test(h)) return true;
        // On n'accepte Ecart/Montant que si ce n'est pas le schéma de calcul
        if ((h.includes("ecart") || h.includes("écart") || h.includes("montant")) && !isSchema) return true;
        
        return false;
      });
    }

    /**
     * Obtenir les en-têtes d'une table
     */
    getTableHeaders(table) {
      // Pour éviter de compter les en-têtes multiples (rowspan/colspan),
      // on privilégie la dernière ligne du thead qui contient généralement les colonnes finales.
      const thead = table.querySelector("thead");
      if (thead) {
        const rows = thead.querySelectorAll("tr");
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          const headers = lastRow.querySelectorAll("th, td");
          if (headers.length > 0) {
            return Array.from(headers).map((cell) => cell.textContent.trim());
          }
        }
      }

      // Fallbacks
      const headerSelectors = [
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
     * Trouver l'index de la colonne "Ecart" dans une table
     * Cherche dans TOUTES les lignes thead en tenant compte des colspans
     */
    findEcartColumnIndex(table) {
      // ----------------------------------------------------------------
      // PRIORITÉ 1: Chercher dans toutes les lignes du thead
      // en tenant compte des colspans pour calculer le vrai index de colonne
      // ----------------------------------------------------------------
      const theadRows = table.querySelectorAll("thead tr");
      for (let r = 0; r < theadRows.length; r++) {
        const cells = theadRows[r].querySelectorAll("th, td");
        let colIndex = 0;
        for (let c = 0; c < cells.length; c++) {
          const text = cells[c].textContent.trim().toLowerCase();
          if (text === "ecart" || text === "écart" || text.includes("ecart") || text.includes("écart")) {
            debug.log(`📎 [Alignement] Colonne "Ecart" trouvée à l'index ${colIndex} (ligne thead ${r})`);
            return colIndex;
          }
          colIndex += parseInt(cells[c].getAttribute("colspan") || "1", 10);
        }
      }

      // ----------------------------------------------------------------
      // PRIORITÉ 2: Chercher dans les lignes de données tbody
      // (fallback pour tables sans thead)
      // ----------------------------------------------------------------
      const tbodyRows = table.querySelectorAll("tbody tr");
      for (let r = 0; r < tbodyRows.length; r++) {
        const cells = tbodyRows[r].querySelectorAll("th, td");
        let colIndex = 0;
        for (let c = 0; c < cells.length; c++) {
          const text = cells[c].textContent.trim().toLowerCase();
          if (text === "ecart" || text === "écart") {
            debug.log(`📎 [Alignement] Colonne "Ecart" trouvée à l'index ${colIndex} (ligne tbody ${r})`);
            return colIndex;
          }
          colIndex += parseInt(cells[c].getAttribute("colspan") || "1", 10);
        }
      }

      debug.warn("📎 [Alignement] Colonne 'Ecart' non trouvée");
      return -1;
    }

    /**
     * Mesurer les colonnes réelles de la table principale
     * - totalColumns = nombre réel de colonnes (max colspan-expandé sur TOUTES les lignes)
     * - widthsPx = largeurs individuelles depuis une ligne tbody propre
     * - tableWidthPx = largeur totale du tableau en px
     */
    measureRealColumns(tablePrincipale) {
      let maxCols = 0;
      const allRows = tablePrincipale.querySelectorAll("tr");
      allRows.forEach(row => {
        let colCount = 0;
        row.querySelectorAll("th, td").forEach(cell => {
          colCount += parseInt(cell.getAttribute("colspan") || "1", 10);
        });
        if (colCount > maxCols) maxCols = colCount;
      });
      if (maxCols === 0) maxCols = 5;

      debug.log(`📎 [measureRealColumns] Vrai nb colonnes: ${maxCols}`);

      let bestRow = null;
      let bestRowCount = 0;
      let bestRowIsTbody = false;

      for (let r = 0; r < allRows.length; r++) {
        const cells = allRows[r].querySelectorAll("th, td");
        if (cells.length === 0) continue;
        
        let hasColspan = false;
        for (let c = 0; c < cells.length; c++) {
          if (parseInt(cells[c].getAttribute("colspan") || "1", 10) > 1) {
            hasColspan = true;
            break;
          }
        }
        
        if (!hasColspan) {
           const isTbody = allRows[r].parentNode && allRows[r].parentNode.tagName.toLowerCase() === 'tbody';
           if (cells.length > bestRowCount || (cells.length === bestRowCount && isTbody && !bestRowIsTbody)) {
              bestRowCount = cells.length;
              bestRow = cells;
              bestRowIsTbody = isTbody;
           }
        }
      }

      if (bestRow && bestRowCount > 0) {
        const widths = Array.from(bestRow).map(cell => cell.getBoundingClientRect().width);
        const sum = widths.reduce((s, w) => s + w, 0);

        if (sum > 0) {
          if (bestRowCount === maxCols) {
            debug.log(`📎 [measureRealColumns] Mesure exacte: ${maxCols} colonnes, sum: ${sum}px`);
            return { count: maxCols, widthsPx: widths, tableWidthPx: sum };
          }

          if (bestRowCount < maxCols) {
            const avgColWidth = sum / bestRowCount;
            const extraCols = maxCols - bestRowCount;
            const allWidths = [...widths, ...Array(extraCols).fill(avgColWidth)];
            const totalW = allWidths.reduce((s, w) => s + w, 0);
            
            debug.log(`📎 [measureRealColumns] Extrapolation: ${bestRowCount} + ${extraCols} = ${maxCols}`);
            return { count: maxCols, widthsPx: allWidths, tableWidthPx: totalW };
          }
        }
      }

      const tableWidthPx = tablePrincipale.getBoundingClientRect().width;
      return {
        count: maxCols,
        widthsPx: Array(maxCols).fill(tableWidthPx / maxCols),
        tableWidthPx
      };
    }

    /**
     * Calculer le nombre de colonnes vides à ajouter avant les références
     * Utilise totalColumns réel (depuis measureRealColumns) et ecartIndex
     */
    calculateEmptyColumnsCount(tablePrincipale, nbColonnes, totalColumnsReal) {
      const ecartIndex = this.findEcartColumnIndex(tablePrincipale);
      const total = totalColumnsReal || this.getTableHeaders(tablePrincipale).length || 5;

      debug.log(`📎 [Alignement] Total colonnes réel: ${total}`);
      debug.log(`📎 [Alignement] Index colonne Ecart: ${ecartIndex}`);
      debug.log(`📎 [Alignement] Nombre de références modèle: ${nbColonnes}`);

      if (ecartIndex >= 0) {
        // Aligner pour que la DERNIÈRE référence tombe sur la colonne Ecart
        const empty = ecartIndex - nbColonnes + 1;
        debug.log(`📎 [Alignement] Formule Ecart: ${ecartIndex} - ${nbColonnes} + 1 = ${empty}`);
        return Math.max(0, empty);
      } else {
        // Pas de colonne Ecart: placer les références à droite
        const empty = total - nbColonnes;
        debug.log(`📎 [Alignement] Pas d'Ecart, placement droite: ${empty}`);
        return Math.max(0, empty);
      }
    }

    /**
     * Créer la cross référence horizontale selon la nature de test
     */
    createCrossRefHorizontale(tablePrincipale, natureDeTest, parentDiv) {
      debug.log(`Création de la cross référence pour: ${natureDeTest}`);

      // Déterminer le modèle (même logique que Schéma de calcul)
      const modele = this.determinerModele(natureDeTest);
      
      if (!modele) {
        debug.warn(`Aucun modèle trouvé pour: ${natureDeTest}`);
        return null;
      }

      // Vérifier si une cross référence existe déjà
      const existingCrossRef = this.findExistingCrossRef(tablePrincipale);
      if (existingCrossRef) {
        debug.log("Cross référence déjà existante");
        return existingCrossRef;
      }

      // Trouver table2 pour la référence (Recherche élargie)
      let table2 = null;

      // 1. Recherche locale (div.prose)
      const globalDiv = tablePrincipale.closest('div.prose, div[class*="prose"]') || parentDiv;
      if (globalDiv) {
        const tables = globalDiv.querySelectorAll("table");
        for (let i = 0; i < tables.length; i++) {
          if (this.extractNatureDeTest(tables[i])) {
            table2 = tables[i];
            break;
          }
        }
      }

      // 2. Recherche étendue au chat (si non trouvé localement)
      if (!table2) {
        const chatContainer = tablePrincipale.closest('.overflow-y-auto, [class*="overflow-y-auto"]')
                           || tablePrincipale.closest('.flex-1')
                           || tablePrincipale.closest('[class*="chat"]');
        if (chatContainer) {
          const allTables = chatContainer.querySelectorAll("table");
          for (let i = 0; i < allTables.length; i++) {
            if (this.extractNatureDeTest(allTables[i])) {
              table2 = allTables[i];
              break;
            }
          }
        }
      }

      // 3. Recherche globale (fallback)
      if (!table2) {
        const allDocTables = document.querySelectorAll("table");
        for (let i = 0; i < allDocTables.length; i++) {
          if (this.extractNatureDeTest(allDocTables[i])) {
            table2 = allDocTables[i];
            break;
          }
        }
      }

      // Créer la table de cross référence avec alignement
      const crossRefTable = this.buildCrossRefTable(modele, natureDeTest, tablePrincipale, table2);
      
      // Générer un ID unique
      const tableId = tablePrincipale.dataset.tableId || this.generateTableId(tablePrincipale);
      tablePrincipale.dataset.tableId = tableId;
      
      const crossRefId = `crossref_${tableId}_${Date.now()}`;
      crossRefTable.dataset.crossRefId = crossRefId;
      crossRefTable.dataset.forTable = tableId;

      // Positionnement séparé (Modification 3)
      const parentNode = tablePrincipale.parentNode;
      
      let elementToInsertAfter = tablePrincipale;
      let newElement = crossRefTable;
      
      if (parentNode && parentNode !== globalDiv && parentNode.tagName === "DIV") {
        elementToInsertAfter = parentNode;
        
        // Wrap crossRefTable in a similar wrapper div
        const wrapper = document.createElement("div");
        wrapper.className = parentNode.className;
        if (parentNode.style.cssText) {
          wrapper.style.cssText = parentNode.style.cssText;
        }
        wrapper.appendChild(crossRefTable);
        newElement = wrapper;
      }

      // Insérer EN DESSOUS de la table principale / wrapper
      if (elementToInsertAfter.nextSibling) {
        elementToInsertAfter.parentNode.insertBefore(newElement, elementToInsertAfter.nextSibling);
      } else {
        elementToInsertAfter.parentNode.appendChild(newElement);
      }

      // Rendre les cellules éditables
      this.makeCrossRefEditable(crossRefTable);

      // Installer le détecteur de changements
      this.setupCrossRefChangeDetection(crossRefTable);

      debug.log(`✅ Cross référence créée avec ID: ${crossRefId}`);
      return crossRefTable;
    }

    /**
     * Déterminer le modèle selon la nature de test
     * Retourne le nombre de colonnes basé sur le schéma de calcul
     */
    determinerModele(natureDeTest) {
      const nature = natureDeTest.toLowerCase();

      // Validation: 5 colonnes
      if (nature.includes("validation")) {
        return {
          type: "Validation",
          nbColonnes: 5,
        };
      }

      // Mouvement: 6 colonnes
      if (nature.includes("mouvement")) {
        return {
          type: "Mouvement",
          nbColonnes: 6,
        };
      }

      // Rapprochement: 3 colonnes
      if (nature.includes("rapprochement")) {
        return {
          type: "Rapprochement",
          nbColonnes: 3,
        };
      }

      // Séparation: 3 colonnes
      if (nature.includes("separation") || nature.includes("séparation")) {
        return {
          type: "Séparation",
          nbColonnes: 3,
        };
      }

      // Estimation: 5 colonnes
      if (nature.includes("estimation")) {
        return {
          type: "Estimation",
          nbColonnes: 5,
        };
      }

      // Revue analytique: 3 colonnes
      if (nature.includes("revue") && nature.includes("analytique")) {
        return {
          type: "Revue analytique",
          nbColonnes: 3,
        };
      }

      // Cadrage TVA: 6 colonnes
      if (nature.includes("cadrage") && nature.includes("tva")) {
        return {
          type: "Cadrage TVA",
          nbColonnes: 6,
        };
      }

      // Cotisations sociales: 4 colonnes
      if (nature.includes("cotisation") && nature.includes("sociale")) {
        return {
          type: "Cotisations sociales",
          nbColonnes: 4,
        };
      }

      // Confirmations bancaires: 9 colonnes
      // Modèle: (A) (B) (C) (D)=(A+B-C) (E) (F) (G) (H)=(E+F-G) (I)=(D)-(H)
      if (nature.includes("confirmation") || nature.includes("bancaire")) {
        return {
          type: "Confirmations bancaires",
          nbColonnes: 9,
        };
      }

      // Vierge: 0 colonnes
      if (nature.includes("vierge")) {
        return {
          type: "Vierge",
          nbColonnes: 0,
        };
      }

      // Modélisation: détection automatique
      if (nature.includes("modelisation") || nature.includes("modélisation")) {
        const variables = this.extractVariablesFromNature(natureDeTest);
        return {
          type: "Modélisation",
          nbColonnes: variables.length,
        };
      }

      // Par défaut
      if (natureDeTest.trim() !== "") {
        const variables = this.extractVariablesFromNature(natureDeTest);
        if (variables.length > 0) {
          return {
            type: "Modélisation (auto-détecté)",
            nbColonnes: variables.length,
          };
        }
      }

      return null;
    }

    /**
     * Extraire les variables d'une formule
     */
    extractVariablesFromNature(natureDeTest) {
      const variablePattern = /\([A-Z]\)/g;
      const matches = natureDeTest.match(variablePattern);
      
      if (!matches) return [];

      return [...new Set(matches)];
    }

    /**
     * Construire la table HTML de cross référence horizontale
     * Utilise measureRealColumns() pour un comptage fiable des colonnes réelles
     */
    buildCrossRefTable(modele, natureDeTest, tablePrincipale, table2) {

      // ================================================================
      // ÉTAPE 1 : Mesurer les colonnes réelles depuis les lignes de données
      // ================================================================
      const colInfo = this.measureRealColumns(tablePrincipale);
      const totalColumns = colInfo.count;
      const columnWidthsPx = colInfo.widthsPx;
      const tableWidthPx = colInfo.tableWidthPx;

      debug.log(`📎 [Build] Colonnes réelles mesurées: ${totalColumns}, largeur table: ${tableWidthPx.toFixed(0)}px`);

      // ================================================================
      // ÉTAPE 2 : Créer la table avec la MÊME largeur que tablePrincipale
      // ================================================================
      const table = document.createElement("table");
      // On retire min-w-full pour permettre à la table d'avoir sa largeur exacte en pixels
      table.className = "border border-gray-200 dark:border-gray-700 rounded-lg claraverse-cross-ref-horizontale";
      
      // Forcer la même largeur exacte que la table principale
      table.style.tableLayout = "fixed";
      table.style.borderCollapse = "separate";
      table.style.borderSpacing = "0";
      table.style.background = "#f0f9ff";
      table.style.marginBottom = "1rem";
      if (tableWidthPx > 0) {
        table.style.width = "max-content"; // Permet de respecter les largeurs des colonnes
        table.style.minWidth = tableWidthPx + "px";
      } else {
        table.style.width = "100%";
      }

      // ================================================================
      // ÉTAPE 3 : Colgroup avec les largeurs exactes en px
      // ================================================================
      const colgroup = document.createElement("colgroup");
      columnWidthsPx.forEach(wpx => {
        const col = document.createElement("col");
        col.style.width = wpx + "px";
        colgroup.appendChild(col);
      });
      table.appendChild(colgroup);

      // ================================================================
      // ÉTAPE 4 : Calcul des positions (colonnes vides + références)
      // ================================================================
      const emptyColumnsCount = this.calculateEmptyColumnsCount(tablePrincipale, modele.nbColonnes, totalColumns);
      const nbRefs = Math.min(modele.nbColonnes, Math.max(0, totalColumns - emptyColumnsCount));
      const remainingColumns = Math.max(0, totalColumns - emptyColumnsCount - nbRefs);

      debug.log(`📎 [Build] Total: ${totalColumns}, Vides avant: ${emptyColumnsCount}, Refs: ${nbRefs}, Vides après: ${remainingColumns}`);

      // Préfixe des références
      const prefix = this.extractReferencePrefix(table2);
      debug.log(`📎 [Build] Pré-remplissage avec préfixe: ${prefix}`);

      // ================================================================
      // ÉTAPE 5 : Construction du tbody
      // ================================================================
      const tbody = document.createElement("tbody");
      const row = document.createElement("tr");

      // Fonction utilitaire pour fixer la largeur stricte d'une cellule
      const setExactWidth = (td, width) => {
        if (width > 0) {
          td.style.width = width + "px";
          td.style.minWidth = width + "px";
          td.style.maxWidth = width + "px";
          td.style.boxSizing = "border-box";
        }
      };

      // Cellules vides AVANT les références (non fusionnées pour forcer l'alignement strict)
      for (let i = 0; i < emptyColumnsCount; i++) {
        const td = document.createElement("td");
        td.className = "px-4 py-3 border border-gray-200 dark:border-gray-700";
        td.style.background = "#f0f9ff";
        setExactWidth(td, columnWidthsPx[i]);
        if (i < emptyColumnsCount - 1) {
           td.style.borderRight = "none";
        }
        if (i > 0) {
           td.style.borderLeft = "none";
        }
        td.textContent = "";
        row.appendChild(td);
      }

      // Cellules de références
      for (let i = 0; i < nbRefs; i++) {
        const td = document.createElement("td");
        td.className = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
        td.style.background = "#e0f2fe";
        td.style.fontWeight = "500";
        td.style.textAlign = "center";
        setExactWidth(td, columnWidthsPx[emptyColumnsCount + i]);
        // Format : crochets avec espace de 3 caractères sans lettres ni chiffres pour saisie utilisateur
        td.textContent = "[   ]";
        td.contentEditable = "true";
        row.appendChild(td);
      }

      // Cellules vides APRÈS les références (non fusionnées pour forcer l'alignement strict)
      for (let i = 0; i < remainingColumns; i++) {
        const td = document.createElement("td");
        td.className = "px-4 py-3 border border-gray-200 dark:border-gray-700";
        td.style.background = "#f0f9ff";
        setExactWidth(td, columnWidthsPx[emptyColumnsCount + nbRefs + i]);
        if (i < remainingColumns - 1) {
           td.style.borderRight = "none";
        }
        if (i > 0) {
           td.style.borderLeft = "none";
        }
        td.textContent = "";
        row.appendChild(td);
      }

      tbody.appendChild(row);
      table.appendChild(tbody);

      return table;
    }

    /**
     * @deprecated Utilisez measureRealColumns() à la place.
     * Conservé pour compatibilité ascendante uniquement.
     */
    getColumnWidthsPct(tablePrincipale) {
      const info = this.measureRealColumns(tablePrincipale);
      const sum = info.tableWidthPx > 0 ? info.tableWidthPx : 1;
      return info.widthsPx.map(w => (w / sum) * 100);
    }

    /**
     * Extract the reference from a table containing a "Reference" field
     */
    extractReference(table) {
      const rows = table.querySelectorAll("tr");
      
      // Horizontal check
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const cells = row.querySelectorAll("td, th");
        
        for (let i = 0; i < cells.length - 1; i++) {
          const cellText = cells[i].textContent.trim().toLowerCase();
          
          if (cellText === "reference" || cellText === "référence") {
            const valueCell = cells[i + 1];
            if (valueCell && valueCell.textContent.trim() !== "") {
              return valueCell.textContent.trim();
            }
          }
        }
      }
      
      // Vertical check
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const cells = row.querySelectorAll("td, th");
        
        for (let colIdx = 0; colIdx < cells.length; colIdx++) {
          const cellText = cells[colIdx].textContent.trim().toLowerCase();
          
          if (cellText === "reference" || cellText === "référence") {
            for (let nextRowIdx = rowIdx + 1; nextRowIdx < rows.length; nextRowIdx++) {
              const nextRow = rows[nextRowIdx];
              const nextCells = nextRow.querySelectorAll("td, th");
              
              if (nextCells[colIdx]) {
                const value = nextCells[colIdx].textContent.trim();
                if (value !== "" && !value.toLowerCase().includes("ref")) {
                  return value;
                }
              }
            }
            if (colIdx + 1 < cells.length) {
              const adjacentCell = cells[colIdx + 1];
              if (adjacentCell && adjacentCell.textContent.trim() !== "") {
                return adjacentCell.textContent.trim();
              }
            }
          }
        }
      }
      return null;
    }

    /**
     * Extract prefix from reference (e.g. Test-Caisse-001 -> TE, AA-01 -> AA)
     */
    extractReferencePrefix(table2) {
      if (!table2) return "AA";
      const ref = this.extractReference(table2);
      if (!ref) return "AA";
      
      // Keep only letters
      const letters = ref.replace(/[^a-zA-Z]/g, '');
      if (letters.length >= 2) {
        return letters.substring(0, 2).toUpperCase();
      } else if (letters.length === 1) {
        return letters.toUpperCase();
      }
      return "AA";
    }

    /**
     * Rendre la cross référence éditable
     */
    makeCrossRefEditable(crossRefTable) {
      const cells = crossRefTable.querySelectorAll("td");
      
      cells.forEach((cell) => {
        cell.contentEditable = "true";
        cell.style.cursor = "text";
        
        cell.addEventListener("blur", () => {
          this.saveCrossRefData(crossRefTable);
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
     * Installer le détecteur de changements
     */
    setupCrossRefChangeDetection(crossRefTable) {
      if (crossRefTable.dataset.observerInstalled === "true") {
        return;
      }

      const crossRefId = crossRefTable.dataset.crossRefId;
      debug.log(`🔍 Installation détecteur sur cross référence ${crossRefId}`);

      const crossRefObserver = new MutationObserver((mutations) => {
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
          debug.log(`📝 Changement détecté dans cross référence ${crossRefId}`);
          this.saveCrossRefData(crossRefTable);
        }
      });

      crossRefObserver.observe(crossRefTable, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: false,
      });

      crossRefTable.dataset.observerInstalled = "true";

      if (!this.crossRefObservers) {
        this.crossRefObservers = new Map();
      }
      this.crossRefObservers.set(crossRefTable, crossRefObserver);

      debug.log(`✅ Détecteur installé sur cross référence ${crossRefId}`);
    }

    /**
     * Trouver une cross référence existante
     */
    findExistingCrossRef(tablePrincipale) {
      const tableId = tablePrincipale.dataset.tableId || this.generateTableId(tablePrincipale);
      return document.querySelector(`table.claraverse-cross-ref-horizontale[data-for-table="${tableId}"]`);
    }

    /**
     * Générer un ID unique pour la cross référence
     */
    generateCrossRefId(tablePrincipale) {
      const tableId = tablePrincipale.dataset.tableId || this.generateTableId(tablePrincipale);
      return `crossref_${tableId}_${Date.now()}`;
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
     * Sauvegarder les données avec debounce
     */
    saveCrossRefData(crossRefTable) {
      if (!crossRefTable) {
        debug.warn("crossRefTable est null");
        return;
      }

      debug.log("⏳ Sauvegarde programmée dans", this.autoSaveDelay, "ms");

      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = setTimeout(() => {
        this.saveCrossRefDataNow(crossRefTable);
      }, this.autoSaveDelay);
    }

    /**
     * Sauvegarder immédiatement
     */
    saveCrossRefDataNow(crossRefTable) {
      if (!crossRefTable) {
        debug.warn("crossRefTable est null");
        return;
      }

      debug.log("💾 Début de sauvegarde immédiate");

      const crossRefId = crossRefTable.dataset.crossRefId;
      debug.log("🆔 ID pour sauvegarde:", crossRefId);

      const allData = this.loadAllData();

      const crossRefData = {
        timestamp: Date.now(),
        forTable: crossRefTable.dataset.forTable,
        cells: [],
      };

      const rows = crossRefTable.querySelectorAll("tbody tr");
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, colIndex) => {
          crossRefData.cells.push({
            row: rowIndex,
            col: colIndex,
            value: cell.textContent.trim(),
          });
        });
      });

      allData[crossRefId] = crossRefData;
      this.saveAllData(allData);

      debug.log(`✅ Cross référence ${crossRefId} sauvegardée`);
    }

    /**
     * Charger toutes les données
     */
    loadAllData() {
      try {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
      } catch (error) {
        debug.error("Erreur lors du chargement:", error);
        return {};
      }
    }

    /**
     * Sauvegarder toutes les données
     */
    saveAllData(data) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        debug.log("💾 Données sauvegardées dans localStorage");
      } catch (error) {
        debug.error("❌ Erreur lors de la sauvegarde:", error);
        if (error.name === "QuotaExceededError") {
          debug.warn("⚠️ Quota localStorage dépassé");
        }
      }
    }

    /**
     * Restaurer toutes les cross références
     */
    restoreAllCrossRefs() {
      debug.log("🔄 Restauration des cross références");

      const allData = this.loadAllData();
      const crossRefIds = Object.keys(allData);

      if (crossRefIds.length === 0) {
        debug.log("Aucune cross référence à restaurer");
        return;
      }

      debug.log(`📦 ${crossRefIds.length} cross référence(s) à restaurer`);

      crossRefIds.forEach((crossRefId) => {
        const crossRefData = allData[crossRefId];
        const forTableId = crossRefData.forTable;

        const tablePrincipale = document.querySelector(`table[data-table-id="${forTableId}"]`);
        
        if (!tablePrincipale) {
          debug.warn(`Table principale ${forTableId} non trouvée`);
          return;
        }

        const existingCrossRef = document.querySelector(`table[data-cross-ref-id="${crossRefId}"]`);
        
        if (existingCrossRef) {
          this.restoreCrossRefValues(existingCrossRef, crossRefData);
        } else {
          debug.log(`Cross référence ${crossRefId} non trouvée dans le DOM`);
        }
      });

      debug.log("✅ Restauration terminée");
    }

    /**
     * Restaurer les valeurs
     */
    restoreCrossRefValues(crossRefTable, crossRefData) {
      const rows = crossRefTable.querySelectorAll("tbody tr");
      
      crossRefData.cells.forEach((cellData) => {
        const row = rows[cellData.row];
        if (!row) return;

        const cells = row.querySelectorAll("td");
        const cell = cells[cellData.col];
        
        if (cell && cellData.value) {
          cell.textContent = cellData.value;
        }
      });

      debug.log(`✅ Valeurs restaurées pour ${crossRefTable.dataset.crossRefId}`);
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

      if (this.crossRefObservers) {
        this.crossRefObservers.forEach((observer) => observer.disconnect());
        this.crossRefObservers.clear();
      }

      debug.log("🧹 Ressources nettoyées");
    }
  }

  // Initialiser le gestionnaire
  const manager = new CrossRefHorizontaleManager();
  manager.init();

  // Exposer globalement
  window.CrossRefHorizontaleManager = manager;

  // Commandes de debug
  window.crossRefCommands = {
    processAll: () => manager.processAllTables(),
    showStorage: () => {
      const data = manager.loadAllData();
      console.log("📦 Contenu du localStorage (cross références):");
      console.log(JSON.stringify(data, null, 2));
    },
    clearStorage: () => {
      if (confirm("Effacer toutes les cross références sauvegardées ?")) {
        localStorage.removeItem(CONFIG.storageKey);
        console.log("🗑️ Cross références effacées");
      }
    },
    restoreAll: () => manager.restoreAllCrossRefs(),
  };

  debug.log("✅ Module Cross Référence Horizontale initialisé");
  debug.log("💡 Commandes disponibles: crossRefCommands");

})();
