/**
 * Module Totalisation - Papier de Travail ClaraVerse
 * Ajoute une ligne de totalisation automatique aux tables de test
 * Version: 1.0.0
 * Date: 25 avril 2026
 */

(function () {
  "use strict";

  console.log("📊 [Totalisation] Module chargé");

  /**
   * Classe principale pour gérer les totalisations
   */
  class TotalisationManager {
    constructor() {
      this.storageKey = "claraverse_totalisation_data";
      this.totalisationTables = new Map(); // Map<tableId, totalisationElement>
      this.init();
    }

    init() {
      console.log("📊 [Totalisation] Initialisation du gestionnaire");
      this.setupAutoRestore();
      this.setupGlobalCommands();
    }

    /**
     * Restaure automatiquement les totalisations au chargement
     */
    setupAutoRestore() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.restoreAllTotalisations();
        });
      } else {
        this.restoreAllTotalisations();
      }
    }

    /**
     * Configure les commandes globales pour le debug
     */
    setupGlobalCommands() {
      window.totalisationCommands = {
        showStorage: () => this.showStorage(),
        processAll: () => this.processAllTables(),
        restoreAll: () => this.restoreAllTotalisations(),
        clearStorage: () => this.clearStorage(),
      };
      console.log("📊 [Totalisation] Commandes disponibles: totalisationCommands");
    }

    /**
     * Détecte si une valeur est numérique ou monétaire
     */
    isNumericValue(value) {
      if (!value) return false;
      const str = String(value).trim();
      
      // Supprimer les espaces, symboles monétaires et séparateurs de milliers
      const cleaned = str
        .replace(/\s/g, "")
        .replace(/[€$£¥]/g, "")
        .replace(/,/g, ".");
      
      // Vérifier si c'est un nombre valide
      const num = parseFloat(cleaned);
      return !isNaN(num) && isFinite(num);
    }

    /**
     * Parse une valeur en nombre
     */
    parseNumericValue(value) {
      if (!value) return 0;
      const str = String(value).trim();
      
      const cleaned = str
        .replace(/\s/g, "")
        .replace(/[€$£¥]/g, "")
        .replace(/,/g, ".");
      
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }

    /**
     * Formate un nombre avec séparateurs de milliers
     */
    formatNumber(num) {
      if (isNaN(num) || !isFinite(num)) return "0";
      
      // Arrondir à 2 décimales
      const rounded = Math.round(num * 100) / 100;
      
      // Formater avec séparateurs de milliers
      return rounded.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    /**
     * Détecte les colonnes numériques dans une table
     */
    detectNumericColumns(table) {
      const headers = Array.from(table.querySelectorAll("thead th, tr:first-child th"));
      const rows = Array.from(table.querySelectorAll("tbody tr, tr:not(:first-child)"));
      
      if (rows.length === 0) return [];

      const numericColumns = [];

      headers.forEach((header, colIndex) => {
        const headerText = header.textContent.trim().toLowerCase();
        
        // Exclure certaines colonnes par leur nom
        const excludedPatterns = [
          /assertion/i,
          /conclusion/i,
          /ctr/i,
          /description/i,
          /nature/i,
          /test/i,
          /compte/i,
          /libellé/i,
          /libelle/i,
          /transaction/i,
          /no/i,
          /n°/i,
        ];

        const isExcluded = excludedPatterns.some((pattern) => pattern.test(headerText));
        if (isExcluded) return;

        // Vérifier si la colonne contient des valeurs numériques
        let numericCount = 0;
        let totalCount = 0;

        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells[colIndex]) {
            const value = cells[colIndex].textContent.trim();
            if (value) {
              totalCount++;
              if (this.isNumericValue(value)) {
                numericCount++;
              }
            }
          }
        });

        // Si au moins 50% des cellules sont numériques, c'est une colonne numérique
        if (totalCount > 0 && numericCount / totalCount >= 0.5) {
          numericColumns.push({
            index: colIndex,
            header: headerText,
          });
        }
      });

      return numericColumns;
    }

    /**
     * Calcule les totaux pour les colonnes numériques
     */
    calculateTotals(table, numericColumns) {
      const rows = Array.from(table.querySelectorAll("tbody tr, tr:not(:first-child)"));
      const totals = {};

      numericColumns.forEach((col) => {
        let sum = 0;
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells[col.index]) {
            const value = cells[col.index].textContent.trim();
            sum += this.parseNumericValue(value);
          }
        });
        totals[col.index] = sum;
      });

      return totals;
    }

    /**
     * Crée la ligne de totalisation
     */
    createTotalisationRow(table, numericColumns, totals) {
      const headers = Array.from(table.querySelectorAll("thead th, tr:first-child th"));
      const totalRow = document.createElement("tr");
      totalRow.className = "claraverse-totalisation-row";
      totalRow.dataset.totalisationRow = "true";

      headers.forEach((header, colIndex) => {
        const td = document.createElement("td");
        td.style.cssText = `
          border: 1px solid #d1d5db;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fff9e6, #fffbf0);
          font-weight: 700;
          color: #1a1a1a;
          text-align: right;
        `;

        // Première colonne : label "Totalisation"
        if (colIndex === 0) {
          td.textContent = "Totalisation";
          td.style.textAlign = "left";
          td.style.fontWeight = "800";
          td.style.color = "#380101";
        }
        // Colonnes numériques : afficher le total
        else if (totals[colIndex] !== undefined) {
          td.textContent = this.formatNumber(totals[colIndex]);
          td.dataset.total = totals[colIndex];
          td.dataset.columnIndex = colIndex;
        }
        // Autres colonnes : vide
        else {
          td.textContent = "";
          td.style.background = "rgba(255, 249, 230, 0.5)";
        }

        totalRow.appendChild(td);
      });

      return totalRow;
    }

    /**
     * Ajoute la totalisation à une table
     */
    ajouterTotalisation(table) {
      if (!table) {
        console.warn("📊 [Totalisation] Aucune table fournie");
        return null;
      }

      // Vérifier si une totalisation existe déjà
      const existingTotal = table.querySelector("[data-totalisation-row='true']");
      if (existingTotal) {
        console.log("📊 [Totalisation] Totalisation déjà présente, actualisation...");
        this.actualiserTotalisation(table);
        return existingTotal;
      }

      console.log("📊 [Totalisation] Ajout de la totalisation...");

      // Détecter les colonnes numériques
      const numericColumns = this.detectNumericColumns(table);
      
      if (numericColumns.length === 0) {
        console.warn("📊 [Totalisation] Aucune colonne numérique détectée");
        return null;
      }

      console.log(`📊 [Totalisation] ${numericColumns.length} colonne(s) numérique(s) détectée(s):`, 
        numericColumns.map((c) => c.header));

      // Calculer les totaux
      const totals = this.calculateTotals(table, numericColumns);

      // Créer la ligne de totalisation
      const totalRow = this.createTotalisationRow(table, numericColumns, totals);

      // Ajouter la ligne à la table
      const tbody = table.querySelector("tbody");
      if (tbody) {
        tbody.appendChild(totalRow);
      } else {
        table.appendChild(totalRow);
      }

      // Générer un ID unique pour la table si nécessaire
      if (!table.dataset.tableId) {
        table.dataset.tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Sauvegarder dans le Map
      this.totalisationTables.set(table.dataset.tableId, totalRow);

      // Installer un observateur pour détecter les changements
      this.setupTableObserver(table);

      // Sauvegarder dans localStorage
      this.saveTotalisation(table);

      console.log("✅ [Totalisation] Totalisation ajoutée avec succès");
      return totalRow;
    }

    /**
     * Actualise la totalisation d'une table
     */
    actualiserTotalisation(table) {
      if (!table) {
        console.warn("📊 [Totalisation] Aucune table fournie");
        return;
      }

      console.log("🔄 [Totalisation] Actualisation de la totalisation...");

      // Supprimer l'ancienne ligne de totalisation
      const existingTotal = table.querySelector("[data-totalisation-row='true']");
      if (existingTotal) {
        existingTotal.remove();
      }

      // Recréer la totalisation
      this.ajouterTotalisation(table);
    }

    /**
     * Supprime la totalisation d'une table
     */
    supprimerTotalisation(table) {
      if (!table) {
        console.warn("📊 [Totalisation] Aucune table fournie");
        return;
      }

      console.log("🗑️ [Totalisation] Suppression de la totalisation...");

      const totalRow = table.querySelector("[data-totalisation-row='true']");
      if (totalRow) {
        totalRow.remove();
        
        // Supprimer du Map
        if (table.dataset.tableId) {
          this.totalisationTables.delete(table.dataset.tableId);
        }

        // Supprimer du localStorage
        this.removeTotalisationFromStorage(table);

        console.log("✅ [Totalisation] Totalisation supprimée");
      } else {
        console.warn("📊 [Totalisation] Aucune totalisation à supprimer");
      }
    }

    /**
     * Installe un observateur pour détecter les changements dans la table
     */
    setupTableObserver(table) {
      // Éviter les doublons
      if (table.dataset.totalisationObserver === "true") {
        return;
      }

      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;

        mutations.forEach((mutation) => {
          // Ignorer les changements sur la ligne de totalisation elle-même
          if (mutation.target.closest("[data-totalisation-row='true']")) {
            return;
          }

          // Détecter les changements de contenu dans les cellules
          if (mutation.type === "characterData" || mutation.type === "childList") {
            shouldUpdate = true;
          }
        });

        if (shouldUpdate) {
          console.log("🔄 [Totalisation] Changement détecté, actualisation...");
          // Debounce pour éviter trop d'actualisations
          clearTimeout(table._totalisationUpdateTimeout);
          table._totalisationUpdateTimeout = setTimeout(() => {
            this.actualiserTotalisation(table);
          }, 500);
        }
      });

      observer.observe(table, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      table.dataset.totalisationObserver = "true";
      console.log("👁️ [Totalisation] Observateur installé sur la table");
    }

    /**
     * Sauvegarde la totalisation dans localStorage
     */
    saveTotalisation(table) {
      try {
        const tableId = table.dataset.tableId;
        if (!tableId) return;

        const data = this.loadAllData();
        
        data[tableId] = {
          timestamp: Date.now(),
          hasTotalisation: true,
        };

        localStorage.setItem(this.storageKey, JSON.stringify(data));
        console.log("💾 [Totalisation] Sauvegardé:", tableId);
      } catch (error) {
        console.error("❌ [Totalisation] Erreur de sauvegarde:", error);
      }
    }

    /**
     * Supprime la totalisation du localStorage
     */
    removeTotalisationFromStorage(table) {
      try {
        const tableId = table.dataset.tableId;
        if (!tableId) return;

        const data = this.loadAllData();
        delete data[tableId];

        localStorage.setItem(this.storageKey, JSON.stringify(data));
        console.log("🗑️ [Totalisation] Supprimé du storage:", tableId);
      } catch (error) {
        console.error("❌ [Totalisation] Erreur de suppression:", error);
      }
    }

    /**
     * Charge toutes les données du localStorage
     */
    loadAllData() {
      try {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
      } catch (error) {
        console.error("❌ [Totalisation] Erreur de chargement:", error);
        return {};
      }
    }

    /**
     * Restaure toutes les totalisations sauvegardées
     */
    restoreAllTotalisations() {
      console.log("🔄 [Totalisation] Restauration des totalisations...");

      const data = this.loadAllData();
      const tableIds = Object.keys(data);

      if (tableIds.length === 0) {
        console.log("📊 [Totalisation] Aucune totalisation à restaurer");
        return;
      }

      console.log(`📊 [Totalisation] ${tableIds.length} totalisation(s) à restaurer`);

      tableIds.forEach((tableId) => {
        const table = document.querySelector(`[data-table-id="${tableId}"]`);
        if (table && data[tableId].hasTotalisation) {
          console.log(`🔄 [Totalisation] Restauration pour table: ${tableId}`);
          this.ajouterTotalisation(table);
        }
      });

      console.log("✅ [Totalisation] Restauration terminée");
    }

    /**
     * Traite toutes les tables de la page
     */
    processAllTables() {
      const tables = document.querySelectorAll("table");
      console.log(`📊 [Totalisation] Traitement de ${tables.length} table(s)`);

      tables.forEach((table) => {
        if (table.dataset.tableId) {
          const data = this.loadAllData();
          if (data[table.dataset.tableId]?.hasTotalisation) {
            this.ajouterTotalisation(table);
          }
        }
      });
    }

    /**
     * Affiche le contenu du localStorage
     */
    showStorage() {
      const data = this.loadAllData();
      console.log("📦 [Totalisation] Contenu du storage:", data);
      return data;
    }

    /**
     * Efface toutes les données du localStorage
     */
    clearStorage() {
      try {
        localStorage.removeItem(this.storageKey);
        console.log("🗑️ [Totalisation] Storage effacé");
      } catch (error) {
        console.error("❌ [Totalisation] Erreur d'effacement:", error);
      }
    }
  }

  // Initialiser le gestionnaire
  const totalisationManager = new TotalisationManager();

  // Exposer globalement pour menu.js
  window.PapierTravailTotalisation = {
    ajouterTotalisation: (table) => totalisationManager.ajouterTotalisation(table),
    actualiserTotalisation: (table) => totalisationManager.actualiserTotalisation(table),
    supprimerTotalisation: (table) => totalisationManager.supprimerTotalisation(table),
    restoreAll: () => totalisationManager.restoreAllTotalisations(),
  };

  console.log("✅ [Totalisation] Module prêt - window.PapierTravailTotalisation disponible");
})();
