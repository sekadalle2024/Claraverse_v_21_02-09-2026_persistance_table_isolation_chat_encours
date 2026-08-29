/**
 * Claraverse Table Consolidation Script - Version React Compatible
 * Script optimisé pour fonctionner avec React et les tables dynamiques
 */

(function () {
  "use strict";

  console.log("🚀 Claraverse Table Script - Démarrage");

  // Configuration globale
  const CONFIG = {
    tableSelector:
      "table.min-w-full.border.border-gray-200.dark\\:border-gray-700 .rounded-lg, table.min-w-full",
    alternativeSelector: "div.prose table, .prose table, table",
    checkInterval: 1000,
    processDelay: 500,
    debugMode: true,
  };

  // Utilitaires de debug
  const debug = {
    log: (...args) =>
      CONFIG.debugMode && console.log("📋 [Claraverse]", ...args),
    error: (...args) => console.error("❌ [Claraverse]", ...args),
    warn: (...args) => console.warn("⚠️ [Claraverse]", ...args),
  };

  class ClaraverseTableProcessor {
    constructor() {
      this.processedTables = new WeakSet();
      this.dropdownVisible = false;
      this.currentDropdown = null;
      this.isInitialized = false;
      this.storageKey = "claraverse_tables_data";
      this.autoSaveDelay = 500; // Délai avant sauvegarde automatique
      this.saveTimeout = null; // Pour le debounce

      this.init();
    }

    init() {
      if (this.isInitialized) return;

      debug.log("Initialisation du processeur de tables");

      // Attendre que React soit prêt
      this.waitForReact(() => {
        // Test de localStorage au démarrage
        this.testLocalStorage();
        this.setupGlobalEventListeners();
        this.startTableMonitoring();
        this.restoreAllTablesData(); // Restaurer les données sauvegardées
        this.setupPasteShortcut(); // Configurer le raccourci Ctrl+V pour coller depuis Excel
        this.isInitialized = true;
        debug.log("✅ Processeur initialisé avec succès");
      });
    }

    testLocalStorage() {
      try {
        // Vérifier si localStorage est disponible
        if (typeof localStorage === 'undefined') {
          debug.warn("⚠️ localStorage n'est pas disponible dans ce contexte");
          return false;
        }

        const testKey = "claraverse_test";
        localStorage.setItem(testKey, "test");
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        if (testValue === "test") {
          debug.log("✅ localStorage fonctionne correctement");

          // Vérifier les données existantes
          const existingData = this.loadAllData();
          const tableCount = Object.keys(existingData).length;
          debug.log(`📦 ${tableCount} table(s) trouvée(s) dans le stockage`);

          if (tableCount > 0) {
            debug.log("📊 Tables sauvegardées:", Object.keys(existingData));
          }
          return true;
        } else {
          debug.error("❌ localStorage ne fonctionne pas correctement");
          return false;
        }
      } catch (error) {
        debug.error("❌ Erreur de test localStorage:", error.message);
        // Afficher l'alerte seulement si c'est une vraie erreur (pas juste indisponible)
        if (error.name !== 'SecurityError') {
          console.warn("⚠️ Le stockage local n'est pas disponible. Les données ne seront pas sauvegardées.");
        }
        return false;
      }
    }

    waitForReact(callback) {
      const checkReactReady = () => {
        // Vérifier si React est chargé et si des tables existent
        const hasReact =
          window.React ||
          document.querySelector("[data-reactroot]") ||
          document.querySelector("#root");
        const hasTables = this.findAllTables().length > 0;

        if (hasReact || hasTables) {
          debug.log("React détecté, démarrage du traitement");
          setTimeout(callback, 500); // Petit délai pour s'assurer que tout est prêt
        } else {
          debug.log("En attente de React...");
          setTimeout(checkReactReady, 1000);
        }
      };

      checkReactReady();
    }

    findAllTables() {
      // Essayer plusieurs sélecteurs pour trouver les tables
      const selectors = [
        CONFIG.tableSelector,
        CONFIG.alternativeSelector,
        "table",
        ".prose table",
        "div table",
      ];

      let allTables = [];

      for (const selector of selectors) {
        try {
          const tables = document.querySelectorAll(selector);
          allTables = [...allTables, ...Array.from(tables)];
        } catch (e) {
          debug.warn(`Sélecteur invalide: ${selector}`, e);
        }
      }

      // Supprimer les doublons
      const uniqueTables = [...new Set(allTables)];
      debug.log(`${uniqueTables.length} table(s) trouvée(s)`);

      return uniqueTables;
    }

    startTableMonitoring() {
      // Traitement initial
      this.processAllTables();

      // Surveillance continue avec MutationObserver
      this.setupMutationObserver();

      // Fallback avec setInterval pour les cas où MutationObserver ne suffit pas
      this.intervalId = setInterval(() => {
        this.processAllTables();
      }, CONFIG.checkInterval);

      // Sauvegarder périodiquement
      this.autoSaveIntervalId = setInterval(() => {
        this.autoSaveAllTables();
      }, 30000); // Sauvegarde automatique toutes les 30 secondes

      debug.log("Surveillance des tables démarrée");
    }

    setupMutationObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new MutationObserver((mutations) => {
        let shouldProcess = false;

        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            // Vérifier les nouveaux noeuds ajoutés
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
          setTimeout(() => this.processAllTables(), CONFIG.processDelay);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }

    processAllTables() {
      const tables = this.findAllTables();

      tables.forEach((table, index) => {
        if (!this.processedTables.has(table) && !table.classList.contains("claraverse-conso-table")) {
          debug.log(`Traitement de la table ${index + 1}`);
          this.processTable(table);
        }
      });
    }

    processTable(table) {
      try {
        const headers = this.getTableHeaders(table);
        if (headers.length === 0) {
          debug.warn("Aucun en-tête trouvé dans la table");
          return;
        }

        debug.log(
          "En-têtes trouvés:",
          headers.map((h) => h.text),
        );

        // Générer et assigner un ID unique immédiatement pour TOUTES les tables
        if (!table.dataset.tableId) {
          this.generateUniqueTableId(table);
          debug.log("✓ ID assigné à la table:", table.dataset.tableId);
        }

        if (this.isModelizedTable(headers)) {
          debug.log(
            "Table modelisée détectée - Configuration des interactions",
          );
          this.setupTableInteractions(table, headers);
          this.createConsolidationTable(table);
          this.processedTables.add(table);
        } else {
          debug.log("Table standard détectée - Sauvegarde uniquement");
          // Les tables non-modelisées seront quand même sauvegardées
          this.processedTables.add(table);
        }

        // Installer un MutationObserver sur TOUTES les tables pour détecter les changements
        this.setupTableChangeDetection(table);
      } catch (error) {
        debug.error("Erreur lors du traitement de la table:", error);
      }
    }

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
          // Filtrer pour ne garder que les en-têtes qui appartiennent directement à cette table
          // et non à une table imbriquée
          const directHeaders = Array.from(headers).filter(
            (h) => h.closest("table") === table
          );
          
          if (directHeaders.length > 0) {
            return directHeaders.map((cell, index) => ({
              element: cell,
              text: cell.textContent.trim().toLowerCase(),
              index: index,
            }));
          }
        }
      }

      return [];
    }

    isModelizedTable(headers) {
      // Les tables sont modelisées si elles contiennent l'une de ces colonnes
      const requiredColumns = ["conclusion", "assertion", "ctr"];
      return requiredColumns.some((col) =>
        headers.some((header) => this.matchesColumn(header.text, col)),
      );
    }

    matchesColumn(headerText, columnType) {
      const patterns = {
        assertion: /^assertion$/i,
        conclusion: /^conclusion$/i,
        ctr: /^ctr\d*$/i,
        ecart: /ecart|montant/i,
        compte: /compte/i,
        resultat: /r[eé]sultat/i,
      };

      return patterns[columnType] && patterns[columnType].test(headerText);
    }

    setupTableInteractions(table, headers) {
      const tbody = table.querySelector("tbody") || table;
      const rows = tbody.querySelectorAll("tr");

      rows.forEach((row, rowIndex) => {
        if (rowIndex === 0 && row.querySelector("th")) return; // Skip header row

        const cells = row.querySelectorAll("td");

        cells.forEach((cell, cellIndex) => {
          const header = headers[cellIndex];
          if (!header) return;

          // Supprimer les anciens event listeners
          cell.replaceWith(cell.cloneNode(true));
          const newCell = row.children[cellIndex];

          if (this.matchesColumn(header.text, "assertion")) {
            this.setupAssertionCell(newCell);
          } else if (this.matchesColumn(header.text, "conclusion")) {
            this.setupConclusionCell(newCell, table);
          } else if (this.matchesColumn(header.text, "ctr")) {
            this.setupCtrCell(newCell);
          }
        });
      });
    }

    setupAssertionCell(cell) {
      cell.style.cursor = "pointer";
      cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
      cell.title = "Cliquez pour sélectionner une assertion";

      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showAssertionMenu(
          cell,
          (value) => {
            cell.textContent = value;
            cell.style.backgroundColor = "#e8f5e8";
            debug.log(`Assertion sélectionnée: ${value}`);
            // Sauvegarder après modification
            const parentTable = this.findParentTable(cell);
            if (parentTable) {
              debug.log("💾 Déclenchement sauvegarde depuis assertion");
              this.saveTableData(parentTable);
            } else {
              debug.warn("⚠️ Table parente non trouvée pour sauvegarde");
            }
          },
        );
      });
    }

    // ========================================
    // MENU CONTEXTUEL ASSERTIONS - Style Menu Démarrer
    // ========================================

    // Liste complète des 50 assertions organisées par catégories
    getAssertionCategories() {
      return {
        "📋 Assertions": [
          "Validité",
          "Exhaustivité",
          "Formalisation",
          "Application",
          "Permanence"
        ]
      };
    }

    showAssertionMenu(targetCell, onSelect) {
      this.hideDropdown();

      const categories = this.getAssertionCategories();

      // Conteneur principal du menu style "Menu Démarrer" - Rouge foncé / Blanc
      const menu = document.createElement("div");
      menu.className = "claraverse-assertion-menu";
      menu.style.cssText = `
        position: fixed;
        background: #ffffff;
        border: 1px solid #380101;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(56, 1, 1, 0.3), 0 0 0 1px rgba(56, 1, 1, 0.1);
        z-index: 10000;
        width: 320px;
        max-height: 450px;
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      `;

      // Positionnement
      const rect = targetCell.getBoundingClientRect();
      const menuHeight = 450;
      const menuWidth = 320;

      // Calculer la position optimale
      let top = rect.bottom + 5;
      let left = rect.left;

      // Ajuster si le menu dépasse en bas
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 5;
      }

      // Ajuster si le menu dépasse à droite
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
      }

      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;

      // En-tête du menu - Rouge foncé comme Menu Démarrer
      const header = document.createElement("div");
      header.style.cssText = `
        background: #380101;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #2A0101;
        border-radius: 11px 11px 0 0;
      `;
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 14px;">▶</span>
          <span style="color: white; font-weight: 600; font-size: 14px;">Sélectionner une Assertion</span>
        </div>
        <span id="close-assertion-menu" style="color: white; cursor: pointer; font-size: 18px; opacity: 0.8;">&times;</span>
      `;
      menu.appendChild(header);

      // Zone de recherche - Fond blanc
      const searchContainer = document.createElement("div");
      searchContainer.style.cssText = `
        padding: 10px 12px;
        background: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
      `;
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.placeholder = "🔍 Rechercher une assertion...";
      searchInput.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ccc;
        border-radius: 6px;
        background: #ffffff;
        color: #333;
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
      `;
      searchInput.addEventListener("focus", () => {
        searchInput.style.borderColor = "#380101";
        searchInput.style.boxShadow = "0 0 0 2px rgba(56, 1, 1, 0.2)";
      });
      searchInput.addEventListener("blur", () => {
        searchInput.style.borderColor = "#ccc";
        searchInput.style.boxShadow = "none";
      });
      searchContainer.appendChild(searchInput);
      menu.appendChild(searchContainer);

      // Zone scrollable des catégories - Fond blanc
      const scrollContainer = document.createElement("div");
      scrollContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px 0;
        background: #ffffff;
        scrollbar-width: thin;
        scrollbar-color: #380101 #f0f0f0;
      `;

      // Créer les catégories et items
      Object.entries(categories).forEach(([categoryName, assertions]) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "assertion-category";
        categoryDiv.dataset.category = categoryName;

        // En-tête de catégorie (cliquable pour expand/collapse) - Style rouge foncé
        const categoryHeader = document.createElement("div");
        categoryHeader.style.cssText = `
          padding: 10px 16px;
          color: #380101;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          background: rgba(56, 1, 1, 0.08);
          margin: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        `;
        categoryHeader.innerHTML = `
          <span>${categoryName}</span>
          <span class="category-arrow" style="transition: transform 0.2s; color: #380101;">▼</span>
        `;

        // Items de la catégorie
        const itemsContainer = document.createElement("div");
        itemsContainer.className = "category-items";
        itemsContainer.style.cssText = `
          overflow: hidden;
          transition: max-height 0.3s ease;
          max-height: 500px;
        `;

        assertions.forEach((assertion) => {
          const item = document.createElement("div");
          item.className = "assertion-item";
          item.dataset.assertion = assertion.toLowerCase();
          item.textContent = assertion;
          item.style.cssText = `
            padding: 10px 16px 10px 28px;
            color: #555;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.15s ease;
            border-left: 3px solid transparent;
            margin: 2px 8px;
            border-radius: 4px;
          `;

          item.addEventListener("mouseenter", () => {
            item.style.background = "rgba(56, 1, 1, 0.1)";
            item.style.borderLeftColor = "#380101";
            item.style.color = "#1A0000";
          });

          item.addEventListener("mouseleave", () => {
            item.style.background = "transparent";
            item.style.borderLeftColor = "transparent";
            item.style.color = "#555";
          });

          item.addEventListener("click", (e) => {
            e.stopPropagation();
            onSelect(assertion);
            this.hideDropdown();
          });

          itemsContainer.appendChild(item);
        });

        // Toggle expand/collapse
        let isExpanded = true;
        categoryHeader.addEventListener("click", (e) => {
          e.stopPropagation();
          isExpanded = !isExpanded;
          itemsContainer.style.maxHeight = isExpanded ? "500px" : "0px";
          categoryHeader.querySelector(".category-arrow").style.transform = isExpanded ? "rotate(0deg)" : "rotate(-90deg)";
        });

        categoryHeader.addEventListener("mouseenter", () => {
          categoryHeader.style.background = "rgba(56, 1, 1, 0.15)";
        });
        categoryHeader.addEventListener("mouseleave", () => {
          categoryHeader.style.background = "rgba(56, 1, 1, 0.08)";
        });

        categoryDiv.appendChild(categoryHeader);
        categoryDiv.appendChild(itemsContainer);
        scrollContainer.appendChild(categoryDiv);
      });

      menu.appendChild(scrollContainer);

      // Fonction de recherche
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allItems = scrollContainer.querySelectorAll(".assertion-item");
        const allCategories = scrollContainer.querySelectorAll(".assertion-category");

        if (searchTerm === "") {
          // Afficher tout
          allCategories.forEach(cat => cat.style.display = "block");
          allItems.forEach(item => item.style.display = "block");
        } else {
          // Filtrer
          allCategories.forEach(category => {
            const items = category.querySelectorAll(".assertion-item");
            let hasVisibleItem = false;

            items.forEach(item => {
              const matches = item.dataset.assertion.includes(searchTerm) ||
                item.textContent.toLowerCase().includes(searchTerm);
              item.style.display = matches ? "block" : "none";
              if (matches) hasVisibleItem = true;
            });

            category.style.display = hasVisibleItem ? "block" : "none";
            // Expand la catégorie si elle a des résultats
            if (hasVisibleItem) {
              category.querySelector(".category-items").style.maxHeight = "500px";
              category.querySelector(".category-arrow").style.transform = "rotate(0deg)";
            }
          });
        }
      });

      // Bouton fermer
      header.querySelector("#close-assertion-menu").addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideDropdown();
      });

      document.body.appendChild(menu);
      this.currentDropdown = menu;
      this.dropdownVisible = true;

      // Focus sur la recherche
      setTimeout(() => searchInput.focus(), 100);

      // Fermer en cliquant ailleurs
      setTimeout(() => {
        const closeHandler = (e) => {
          if (!menu.contains(e.target)) {
            this.hideDropdown();
            document.removeEventListener("click", closeHandler);
          }
        };
        document.addEventListener("click", closeHandler);
      }, 100);

      // Fermer avec Escape
      const escapeHandler = (e) => {
        if (e.key === "Escape") {
          this.hideDropdown();
          document.removeEventListener("keydown", escapeHandler);
        }
      };
      document.addEventListener("keydown", escapeHandler);
    }

    setupConclusionCell(cell, table) {
      cell.style.cursor = "pointer";
      cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
      cell.title = "Cliquez pour sélectionner une conclusion";

      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showDropdown(
          cell,
          ["Satisfaisant", "Non-Satisfaisant", "Limitation", "Non-Applicable"],
          (value) => {
            cell.textContent = value;

            if (value === "Non-Satisfaisant" || value === "Limitation") {
              cell.style.backgroundColor = "#fee";
              debug.log(`Conclusion défavorable sélectionnée: ${value}`);
              this.scheduleConsolidation(table);
            } else {
              cell.style.backgroundColor = "#efe";
            }
            // Sauvegarder après modification
            debug.log("💾 Déclenchement sauvegarde depuis conclusion");
            this.saveTableData(table);
          },
        );
      });
    }

    setupCtrCell(cell) {
      cell.style.cursor = "pointer";
      cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
      cell.title = "Cliquez pour sélectionner un contrôle";

      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showDropdown(cell, ["+", "-", "N/A"], (value) => {
          cell.textContent = value;
          cell.style.backgroundColor =
            value === "+" ? "#e8f5e8" : value === "-" ? "#fee8e8" : "#f5f5f5";
          // Sauvegarder après modification
          const parentTable = this.findParentTable(cell);
          if (parentTable) {
            debug.log("💾 Déclenchement sauvegarde depuis CTR");
            this.saveTableData(parentTable);
          } else {
            debug.warn("⚠️ Table parente non trouvée pour sauvegarde");
          }
        });
      });
    }

    setupTableChangeDetection(table) {
      // Éviter de créer plusieurs observers pour la même table
      if (table.dataset.observerInstalled === "true") {
        return;
      }

      const tableId = table.dataset.tableId;
      debug.log(`🔍 Installation détecteur de changements sur ${tableId}`);

      // Créer un observer pour cette table
      const tableObserver = new MutationObserver((mutations) => {
        let hasChanges = false;

        mutations.forEach((mutation) => {
          // Détecter les changements dans les cellules
          if (
            mutation.type === "characterData" ||
            mutation.type === "childList"
          ) {
            hasChanges = true;
          }
          // Détecter les changements d'attributs (style, etc.)
          if (mutation.type === "attributes") {
            hasChanges = true;
          }
        });

        if (hasChanges) {
          debug.log(`📝 Changement détecté dans table ${tableId}`);
          // Sauvegarder avec debounce
          this.saveTableData(table);
        }
      });

      // Observer les changements dans la table
      tableObserver.observe(table, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: false,
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      // Marquer comme installé
      table.dataset.observerInstalled = "true";

      // Stocker l'observer pour pouvoir le détruire plus tard
      if (!this.tableObservers) {
        this.tableObservers = new Map();
      }
      this.tableObservers.set(table, tableObserver);

      debug.log(`✅ Détecteur installé sur ${tableId}`);
    }

    showDropdown(targetCell, options, onSelect) {
      this.hideDropdown();

      const dropdown = document.createElement("div");
      dropdown.className = "claraverse-dropdown";
      dropdown.style.cssText = `
          position: fixed;
          background: white;
          border: 2px solid #007bff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          min-width: 150px;
          max-width: 200px;
          font-family: system-ui, -apple-system, sans-serif;
        `;

      const rect = targetCell.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;
      dropdown.style.left = `${rect.left + window.scrollX}px`;

      options.forEach((option, index) => {
        const item = document.createElement("div");
        item.textContent = option;
        item.style.cssText = `
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: ${index < options.length - 1 ? "1px solid #eee" : "none"};
            transition: background-color 0.2s;
          `;

        item.addEventListener("mouseenter", () => {
          item.style.backgroundColor = "#f0f8ff";
        });

        item.addEventListener("mouseleave", () => {
          item.style.backgroundColor = "white";
        });

        item.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelect(option);
          this.hideDropdown();
        });

        dropdown.appendChild(item);
      });

      document.body.appendChild(dropdown);
      this.currentDropdown = dropdown;
      this.dropdownVisible = true;

      // Fermer le dropdown en cliquant ailleurs
      setTimeout(() => {
        document.addEventListener("click", this.hideDropdown.bind(this), {
          once: true,
        });
      }, 100);
    }

    hideDropdown() {
      if (
        this.currentDropdown &&
        document.body.contains(this.currentDropdown)
      ) {
        document.body.removeChild(this.currentDropdown);
      }
      this.currentDropdown = null;
      this.dropdownVisible = false;
    }

    createConsolidationTable(table) {
      const tableId = this.generateUniqueTableId(table);
      const existingConso = this.findExistingConsoTable(table);
      
      if (existingConso) {
        debug.log(`Table de consolidation existante trouvée pour ${tableId}`);
        return;
      }

      const consoTable = document.createElement("table");
      // ✅ HARMONISATION CSS : Utiliser les mêmes classes que les autres tables Claraverse
      consoTable.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg claraverse-conso-table";
      consoTable.dataset.forTable = tableId;
      consoTable.style.cssText = `
          margin-bottom: 1.5rem;
          border-collapse: separate;
          border-spacing: 0;
        `;

      consoTable.innerHTML = `
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" style="border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
                📊 Table de Consolidation
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td id="conso-content-${tableId}" class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" style="min-height: 50px; border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem;">
                ⏳ En attente de consolidation...
              </td>
            </tr>
          </tbody>
        `;

      // Insérer la table de consolidation
      this.insertConsoTable(table, consoTable);
      debug.log(`Table de consolidation créée avec ID: ${tableId}`);

      // Notifier dev.js de la création de la nouvelle table
      this.notifyTableCreated(consoTable);
    }

    findExistingConsoTable(table) {
      const tableId = this.generateUniqueTableId(table);
      // Chercher d'abord par data-for-table (notre nouvel attribut stable)
      let conso = document.querySelector(`table.claraverse-conso-table[data-for-table="${tableId}"]`);
      if (conso) return conso;

      // Fallback: chercher dans le parent
      const parent = table.parentElement;
      if (!parent) return null;
      return parent.querySelector(".claraverse-conso-table");
    }

    insertConsoTable(table, consoTable) {
      const parent = table.parentElement;
      if (!parent) {
        table.before(consoTable);
        return;
      }

      // Garantir l'ordre : Table_conso -> Schéma de calcul -> Modelised_table
      // Rechercher si un schéma de calcul précède immédiatement la table modélisée
      let schemaTable = null;
      let prev = table.previousElementSibling;
      
      while (prev) {
        // Ignorer les sauts de ligne ou paragraphes vides
        if (prev.tagName === 'BR' || (prev.tagName === 'P' && prev.textContent.trim() === '')) {
          prev = prev.previousElementSibling;
          continue;
        }
        // Si on trouve le schéma de calcul juste au-dessus
        if (prev.tagName === 'TABLE' && prev.classList.contains("claraverse-schema-calcul")) {
          schemaTable = prev;
        }
        break; // Arrêter la recherche après le premier élément significatif
      }

      if (schemaTable) {
        // Insérer au-dessus du schéma de calcul
        parent.insertBefore(consoTable, schemaTable);
        debug.log("Table de consolidation insérée au-dessus du schéma de calcul");
      } else {
        // Insérer juste au-dessus de la table modélisée
        parent.insertBefore(consoTable, table);
        debug.log("Table de consolidation insérée au-dessus de la table modélisée");
      }
    }

    // generateTableId removed in favor of generateUniqueTableId (hashed ID)

    scheduleConsolidation(table) {
      // Éviter les consolidations multiples rapides
      if (this.consolidationTimeout) {
        clearTimeout(this.consolidationTimeout);
      }

      this.consolidationTimeout = setTimeout(() => {
        this.performConsolidation(table);
      }, 300);
    }

    performConsolidation(table) {
      try {
        debug.log("Début de la consolidation");

        const headers = this.getTableHeaders(table);
        const hasCompte = headers.some((h) =>
          this.matchesColumn(h.text, "compte"),
        );
        const hasEcart = headers.some((h) =>
          this.matchesColumn(h.text, "ecart"),
        );

        let result = "";
        let consolidationData = {};

        if (hasCompte && hasEcart) {
          consolidationData = this.extractConsolidationData(
            table,
            headers,
            "withAccount",
          );
          result = this.consolidateWithAccount(table, headers);
        } else if (hasEcart) {
          consolidationData = this.extractConsolidationData(
            table,
            headers,
            "withoutAccount",
          );
          result = this.consolidateWithoutAccount(table, headers);
        } else {
          result = "⚠️ Table incomplète : colonnes ecart ou montant manquantes";
        }

        // 🚨 ALERTE DE DEBUG - Désactivée pour le moment (garder pour besoins futurs)
        // const alertMessage = this.generateAlertMessage(
        //   consolidationData,
        //   result,
        // );
        // alert(`📊 RÉSULTAT DE CONSOLIDATION\n\n${alertMessage}`);

        this.updateConsolidationDisplay(table, result, consolidationData);
        debug.log("Consolidation terminée");
      } catch (error) {
        debug.error("Erreur pendant la consolidation:", error);
        // Alerte d'erreur désactivée pour le moment (garder pour besoins futurs)
        // alert(
        //   `❌ ERREUR DE CONSOLIDATION\n\n${error.message}\n\nVoir la console pour plus de détails.`,
        // );
        this.updateConsolidationDisplay(
          table,
          "❌ Erreur pendant la consolidation",
        );
      }
    }

    extractConsolidationData(table, headers, type) {
      const data = {
        type: type,
        totalRows: 0,
        processedRows: 0,
        assertions: {},
        rawData: [],
      };

      const tbody = table.querySelector("tbody") || table;
      const rows = tbody.querySelectorAll("tr");
      const colIndexes = this.getColumnIndexes(headers);

      rows.forEach((row, index) => {
        if (index === 0 && row.querySelector("th")) return;

        const cells = row.querySelectorAll("td");
        if (cells.length === 0) return;

        data.totalRows++;

        const assertion = cells[colIndexes.assertion]?.textContent?.trim();
        const conclusion = cells[colIndexes.conclusion]?.textContent?.trim();
        const compte = cells[colIndexes.compte]?.textContent?.trim();
        const ecart = cells[colIndexes.ecart]?.textContent?.trim();

        const rowData = {
          row: index + 1,
          assertion,
          conclusion,
          compte,
          ecart,
          montant: this.parseMontant(ecart),
        };

        data.rawData.push(rowData);

        if (
          assertion &&
          (conclusion === "Non-Satisfaisant" || conclusion === "Limitation")
        ) {
          data.processedRows++;

          if (!data.assertions[assertion]) {
            data.assertions[assertion] = {
              comptes: new Set(),
              total: 0,
              occurrences: 0,
            };
          }

          if (compte) data.assertions[assertion].comptes.add(compte);
          data.assertions[assertion].total += rowData.montant;
          data.assertions[assertion].occurrences++;
        }
      });

      return data;
    }

    generateAlertMessage(consolidationData, finalResult) {
      if (!consolidationData || Object.keys(consolidationData).length === 0) {
        return "Aucune donnée de consolidation disponible.";
      }

      let message = `📋 ANALYSE DE LA TABLE\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `Total lignes analysées: ${consolidationData.totalRows}\n`;
      message += `Lignes avec non-conformités: ${consolidationData.processedRows}\n`;
      message += `Type de consolidation: ${consolidationData.type}\n\n`;

      if (consolidationData.rawData && consolidationData.rawData.length > 0) {
        message += `📊 DONNÉES BRUTES:\n`;
        consolidationData.rawData.forEach((row, index) => {
          if (
            row.conclusion === "Non-Satisfaisant" ||
            row.conclusion === "Limitation"
          ) {
            message += `Ligne ${row.row}: ${row.assertion} | ${row.conclusion} | ${row.compte || "N/A"} | ${row.ecart}\n`;
          }
        });
        message += `\n`;
      }

      if (
        consolidationData.assertions &&
        Object.keys(consolidationData.assertions).length > 0
      ) {
        message += `🔍 CONSOLIDATION PAR ASSERTION:\n`;
        Object.entries(consolidationData.assertions).forEach(
          ([assertion, data]) => {
            message += `• ${assertion}:\n`;
            message += `  - Occurrences: ${data.occurrences}\n`;
            message += `  - Montant total: ${this.formatMontant(data.total)} FCFA\n`;
            if (data.comptes.size > 0) {
              message += `  - Comptes: ${Array.from(data.comptes).join(", ")}\n`;
            }
            message += `\n`;
          },
        );
      }

      message += `📝 RÉSULTAT FINAL:\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      // Supprimer les balises HTML pour l'alerte
      const cleanResult = finalResult
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ");
      message += cleanResult;

      return message;
    }

    consolidateWithAccount(table, headers) {
      const consolidation = {};
      const tbody = table.querySelector("tbody") || table;
      const rows = tbody.querySelectorAll("tr");

      const colIndexes = this.getColumnIndexes(headers);

      rows.forEach((row, index) => {
        if (index === 0 && row.querySelector("th")) return;

        const cells = row.querySelectorAll("td");
        if (cells.length === 0) return;

        const assertion = cells[colIndexes.assertion]?.textContent?.trim();
        const conclusion = cells[colIndexes.conclusion]?.textContent?.trim();
        const compte = cells[colIndexes.compte]?.textContent?.trim();
        const ecart = cells[colIndexes.ecart]?.textContent?.trim();

        if (
          assertion &&
          (conclusion === "Non-Satisfaisant" || conclusion === "Limitation")
        ) {
          if (!consolidation[assertion]) {
            consolidation[assertion] = { comptes: new Set(), total: 0 };
          }

          if (compte) consolidation[assertion].comptes.add(compte);

          const montant = this.parseMontant(ecart);
          consolidation[assertion].total += montant;
        }
      });

      return this.formatConsolidationWithAccount(consolidation);
    }

    consolidateWithoutAccount(table, headers) {
      const consolidation = {};
      const tbody = table.querySelector("tbody") || table;
      const rows = tbody.querySelectorAll("tr");

      const colIndexes = this.getColumnIndexes(headers);

      rows.forEach((row, index) => {
        if (index === 0 && row.querySelector("th")) return;

        const cells = row.querySelectorAll("td");
        if (cells.length === 0) return;

        const assertion = cells[colIndexes.assertion]?.textContent?.trim();
        const conclusion = cells[colIndexes.conclusion]?.textContent?.trim();
        const ecart = cells[colIndexes.ecart]?.textContent?.trim();

        if (
          assertion &&
          (conclusion === "Non-Satisfaisant" || conclusion === "Limitation")
        ) {
          if (!consolidation[assertion]) {
            consolidation[assertion] = { total: 0 };
          }

          const montant = this.parseMontant(ecart);
          consolidation[assertion].total += montant;
        }
      });

      return this.formatConsolidationWithoutAccount(consolidation);
    }

    getColumnIndexes(headers) {
      return {
        assertion: headers.findIndex((h) =>
          this.matchesColumn(h.text, "assertion"),
        ),
        conclusion: headers.findIndex((h) =>
          this.matchesColumn(h.text, "conclusion"),
        ),
        compte: headers.findIndex((h) => this.matchesColumn(h.text, "compte")),
        ecart: headers.findIndex((h) => this.matchesColumn(h.text, "ecart")),
      };
    }

    parseMontant(montantStr) {
      if (!montantStr) return 0;
      const cleaned = montantStr.replace(/[^\d.,-]/g, "").replace(",", ".");
      return parseFloat(cleaned) || 0;
    }

    formatMontant(montant) {
      return new Intl.NumberFormat("fr-FR").format(Math.abs(montant));
    }

    formatConsolidationWithAccount(consolidation) {
      if (Object.keys(consolidation).length === 0) {
        return "✅ Aucune non-conformité détectée";
      }

      const results = [];
      Object.entries(consolidation).forEach(([assertion, data]) => {
        const comptes = Array.from(data.comptes).sort().join(", ");
        const phrase = this.generateAssertionPhrase(
          assertion,
          comptes,
          data.total,
        );
        results.push(phrase);
      });

      return results.join("<br><br>");
    }

    generateAssertionPhrase(assertion, comptes, montant) {
      const assertionLower = assertion.toLowerCase();
      const montantFormate = this.formatMontant(montant);

      const phrases = {
        validité: `🔍 <strong>Validité</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne sont pas valides pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        exhaustivité: `🔍 <strong>Exhaustivité</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne sont pas exhaustives pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        limitation: `🔍 <strong>Limitation</strong> : Nous n'avons pas obtenu les pièces justificatives relatives aux comptes <em>${comptes}</em> pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        "cut-off": `🔍 <strong>Cut-off</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne respectent pas le cut-off pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        evaluation: `🔍 <strong>Évaluation</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne sont pas correctement évaluées pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        presentation: `🔍 <strong>Présentation</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne respectent pas la correcte présentation pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        comptabilisation: `🔍 <strong>Comptabilisation</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne sont pas correctement comptabilisées dans le bon compte et/ou pour le bon montant pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        formalisation: `🔍 <strong>Formalisation</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne sont pas correctement formalisées pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        application: `🔍 <strong>Application</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne sont pas correctement appliquées pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,

        permanence: `🔍 <strong>Permanence</strong> : les transactions relatives aux comptes <em>${comptes}</em> ne respectent pas le principe de permanence pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`,
      };

      return (
        phrases[assertionLower] ||
        `🔍 <strong>${assertion}</strong> : les transactions relatives aux comptes <em>${comptes}</em> présentent des anomalies pour un montant de <strong>${montantFormate} FCFA</strong> au 31/12/N.`
      );
    }

    formatConsolidationWithoutAccount(consolidation) {
      if (Object.keys(consolidation).length === 0) {
        return "✅ Aucune non-conformité détectée";
      }

      const results = [];
      Object.entries(consolidation).forEach(([assertion, data]) => {
        const phrase = this.generateSimpleAssertionPhrase(
          assertion,
          data.total,
        );
        results.push(phrase);
      });

      return results.join("<br><br>");
    }

    generateSimpleAssertionPhrase(assertion, montant) {
      const assertionLower = assertion.toLowerCase();
      const montantFormate = this.formatMontant(montant);

      const phrases = {
        validité: `🔍 <strong>Validité</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        exhaustivité: `🔍 <strong>Exhaustivité</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        limitation: `🔍 <strong>Limitation</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        "cut-off": `🔍 <strong>Cut-off</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        evaluation: `🔍 <strong>Évaluation</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        presentation: `🔍 <strong>Présentation</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        comptabilisation: `🔍 <strong>Comptabilisation</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        formalisation: `🔍 <strong>Formalisation</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        application: `🔍 <strong>Application</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
        permanence: `🔍 <strong>Permanence</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`,
      };

      return (
        phrases[assertionLower] ||
        `🔍 <strong>${assertion}</strong> : Non-conformité pour un montant de <strong>${montantFormate} FCFA</strong>.`
      );
    }

    updateConsolidationDisplay(table, content, consolidationData) {
      try {
        debug.log("🔍 Début de updateConsolidationDisplay");
        debug.log("Contenu complet à afficher:", content.substring(0, 100));

        // Générer la version simplifiée pour la table conso
        const simpleContent = this.generateSimpleConsoContent(content);
        debug.log(
          "Contenu simplifié pour conso:",
          simpleContent.substring(0, 100),
        );

        // 1. Mise à jour de la table RÉSULTAT (version complète) - EN PREMIER
        const resultatUpdated = this.updateResultatTable(table, content, consolidationData);

        // 2. Mise à jour de la table CONSO (version simplifiée) - EN SECOND
        const consoUpdated = this.updateConsoTable(table, simpleContent);

        // 3. Sauvegarder les données après consolidation
        this.saveConsolidationData(table, content, simpleContent);

        // 4. Notifier dev.js des modifications pour synchronisation
        this.notifyDevJsSync(table, { resultatUpdated, consoUpdated });

        // 5. Confirmation
        if (consoUpdated || resultatUpdated) {
          debug.log("✅ Mise à jour réussie");
          debug.log(`- Table Conso: ${consoUpdated ? "✓" : "✗"}`);
          debug.log(`- Table Résultat: ${resultatUpdated ? "✓" : "✗"}`);

          // Alerte de confirmation désactivée pour le moment (garder pour besoins futurs)
          // setTimeout(() => {
          //   const cleanContent = content.replace(/<[^>]*>/g, "").trim();
          //   alert(
          //     `✅ MISE À JOUR CONFIRMÉE\n\n` +
          //     `Table Conso: ${consoUpdated ? "Mise à jour" : "Non trouvée"}\n` +
          //     `Table Résultat: ${resultatUpdated ? "Mise à jour" : "Non trouvée"}\n\n` +
          //     `Contenu Table Résultat:\n${cleanContent.substring(0, 200)}${cleanContent.length > 200 ? "..." : ""}\n\n` +
          //     `Contenu Table Conso:\n${simpleContent.replace(/<[^>]*>/g, "").substring(0, 150)}`,
          //   );
          // }, 500);
        } else {
          debug.warn("⚠️ Aucune table n'a été mise à jour");

          // Essayer de créer la table conso si elle n'existe pas
          this.createConsolidationTable(table);

          // Réessayer après un délai
          setTimeout(() => {
            this.updateConsolidationDisplay(table, content);
          }, 1000);
        }
      } catch (error) {
        debug.error("❌ Erreur dans updateConsolidationDisplay:", error);
        // Alerte d'erreur désactivée pour le moment (garder pour besoins futurs)
        // alert(
        //   `❌ ERREUR DE MISE À JOUR\n\n${error.message}\n\nVoir la console pour plus de détails.`,
        // );
      }
    }

    generateSimpleConsoContent(fullContent) {
      // Transformer le contenu complet en version simplifiée pour table conso
      // Format attendu : "Validité : Non-conformité pour 600 000 FCFA"

      debug.log("🔄 Génération du contenu simplifié");

      const lines = [];

      // Méthode 1: Parser le HTML complet
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = fullContent;

      // Récupérer chaque paragraphe/bloc séparé par <br>
      const htmlParts = fullContent.split(/<br\s*\/?>/gi);

      htmlParts.forEach((part) => {
        if (!part.trim()) return;

        // Extraire l'assertion (contenu de <strong>)
        const assertionMatch = part.match(/<strong>(.*?)<\/strong>/i);
        // Extraire le montant
        const montantMatch = part.match(/([\d\s.,]+)\s*FCFA/);

        if (assertionMatch && montantMatch) {
          const assertion = assertionMatch[1].trim();
          const montant = montantMatch[1].replace(/\s/g, " ").trim();
          lines.push(
            `🔍 <strong>${assertion}</strong> : Non-conformité pour <strong>${montant} FCFA</strong>`,
          );
        }
      });

      // Méthode 2: Fallback si la méthode 1 échoue
      if (lines.length === 0) {
        const cleanText = fullContent.replace(/<[^>]*>/g, "");
        const assertionPattern =
          /(Validité|Exhaustivité|Limitation|Formalisation|Application|Permanence|Cut-off|Évaluation|Présentation|Comptabilisation)[^0-9]*?([\d\s.,]+)\s*FCFA/gi;

        let match;
        while ((match = assertionPattern.exec(cleanText)) !== null) {
          const assertion = match[1];
          const montant = match[2].replace(/\s/g, " ").trim();
          lines.push(
            `🔍 <strong>${assertion}</strong> : Non-conformité pour <strong>${montant} FCFA</strong>`,
          );
        }
      }

      const result =
        lines.length > 0
          ? lines.join("<br><br>")
          : "⏳ En attente de consolidation...";
      debug.log("✓ Contenu simplifié généré:", result.substring(0, 150));
      return result;
    }

    updateConsoTable(table, simpleContent) {
      debug.log("📊 Recherche de la table conso (pour contenu simplifié)...");

      // Stratégie 1: Chercher par ID généré
      const tableId = this.generateUniqueTableId(table);
      let consoCell = document.querySelector(`#conso-content-${tableId}`);

      if (consoCell) {
        debug.log("✓ Table conso trouvée via ID hashé:", `conso-content-${tableId}`);
        debug.log(
          "Mise à jour avec contenu simplifié:",
          simpleContent.substring(0, 100),
        );
        consoCell.innerHTML = simpleContent;
        // Marquer comme table conso
        consoCell.setAttribute("data-updated", "conso");
        consoCell.setAttribute("data-type", "conso");

        // Notifier dev.js de la modification
        this.notifyTableUpdate(
          consoCell.closest("table"),
          "conso-table-update",
        );
        return true;
      }

      // Stratégie 2: Chercher par ID partiel
      const allConsoCells = document.querySelectorAll('[id*="conso-content"]');
      if (allConsoCells.length > 0) {
        debug.log(
          `✓ ${allConsoCells.length} cellule(s) conso trouvée(s) via attribut partiel`,
        );
        // Prendre la dernière créée (plus récente)
        consoCell = allConsoCells[allConsoCells.length - 1];
        debug.log(
          "Mise à jour avec contenu simplifié:",
          simpleContent.substring(0, 100),
        );
        consoCell.innerHTML = simpleContent;
        // Marquer comme table conso
        consoCell.setAttribute("data-updated", "conso");
        consoCell.setAttribute("data-type", "conso");

        // Notifier dev.js de la modification
        this.notifyTableUpdate(
          consoCell.closest("table"),
          "conso-table-update",
        );
        return true;
      }

      // Stratégie 3: Chercher la table conso dans le parent
      const parent = table.parentElement;
      if (parent) {
        const consoTable = parent.querySelector(
          'table.claraverse-conso-table, table[class*="claraverse-conso"]',
        );
        if (consoTable) {
          consoCell = consoTable.querySelector("td");
          if (consoCell) {
            debug.log("✓ Table conso trouvée via parent et classe");
            debug.log(
              "Mise à jour avec contenu simplifié:",
              simpleContent.substring(0, 100),
            );
            consoCell.innerHTML = simpleContent;
            // Marquer comme table conso
            consoCell.setAttribute("data-updated", "conso");
            consoCell.setAttribute("data-type", "conso");

            // Notifier dev.js de la modification
            this.notifyTableUpdate(consoTable, "conso-table-update");
            return true;
          }
        }
      }

      // Stratégie 4: Chercher toutes les tables conso dans le document
      const allConsoTables = document.querySelectorAll(
        'table.claraverse-conso-table, table[class*="claraverse-conso"]',
      );
      if (allConsoTables.length > 0) {
        debug.log(`✓ ${allConsoTables.length} table(s) conso trouvée(s)`);
        // Trouver la plus proche de la table de pointage
        let closestConsoTable = null;
        let minDistance = Infinity;

        allConsoTables.forEach((consoTable) => {
          const distance = this.getElementDistance(table, consoTable);
          if (distance < minDistance) {
            minDistance = distance;
            closestConsoTable = consoTable;
          }
        });

        if (closestConsoTable) {
          consoCell = closestConsoTable.querySelector("td");
          if (consoCell) {
            debug.log("✓ Table conso la plus proche trouvée");
            debug.log(
              "Mise à jour avec contenu simplifié:",
              simpleContent.substring(0, 100),
            );
            consoCell.innerHTML = simpleContent;
            // Marquer comme table conso
            consoCell.setAttribute("data-updated", "conso");
            consoCell.setAttribute("data-type", "conso");
            return true;
          }
        }
      }

      debug.warn("✗ Table conso non trouvée");
      return false;
    }

    updateResultatTable(table, fullContent, consolidationData) {
      debug.log(
        "📋 Recherche de la table Résultat (située au-dessus de la table conso)...",
      );

      // Pour la table résultat, on veut le contenu HTML complet et détaillé
      const htmlContent = fullContent;

      const applyResultatToTable = (potentialTable) => {
        const tableHeaders = this.getTableHeaders(potentialTable);
        const colResultat = tableHeaders.findIndex(h => h.text.includes("resultat") || h.text.includes("résultat"));
        
        if (colResultat !== -1) {
            const colAssertion = tableHeaders.findIndex(h => this.matchesColumn(h.text, "assertion"));
            
            // Si la table a une colonne Assertion ET une colonne Resultat, on met à jour ligne par ligne
            if (colAssertion !== -1 && consolidationData && consolidationData.assertions) {
                const tbody = potentialTable.querySelector("tbody") || potentialTable;
                const rows = tbody.querySelectorAll("tr");
                let updatedAnyRow = false;
                
                rows.forEach((row, index) => {
                    if (index === 0 && row.querySelector("th")) return;
                    const cells = row.querySelectorAll("td");
                    if (cells.length === 0) return;
                    
                    const assertionCell = cells[colAssertion];
                    const resultatCell = cells[colResultat];
                    
                    if (assertionCell && resultatCell) {
                        const rowAssertion = assertionCell.textContent.trim();
                        if (rowAssertion) {
                            const matchingKey = Object.keys(consolidationData.assertions).find(k => k.toLowerCase() === rowAssertion.toLowerCase());
                            
                            let cellContent = "✅ Satisfaisant";
                            let bgColor = "#efe";
                            
                            if (matchingKey) {
                                const data = consolidationData.assertions[matchingKey];
                                if (consolidationData.type === "withAccount") {
                                    const comptes = Array.from(data.comptes).sort().join(", ");
                                    cellContent = this.generateAssertionPhrase(rowAssertion, comptes, data.total);
                                } else {
                                    cellContent = this.generateSimpleAssertionPhrase(rowAssertion, data.total);
                                }
                                bgColor = "#fee";
                            }
                            
                            resultatCell.innerHTML = cellContent;
                            resultatCell.style.backgroundColor = bgColor;
                            resultatCell.setAttribute("data-updated", "resultat");
                            updatedAnyRow = true;
                        }
                    }
                });
                
                if (updatedAnyRow) {
                    debug.log("✓ Table Résultat structurée mise à jour ligne par ligne");
                    potentialTable.style.outline = "3px solid #00ff00";
                    setTimeout(() => potentialTable.style.outline = "", 2000);
                    return true;
                }
            }
        }
        
        // Fallback: logique originale de cellule unique
        const allCells = potentialTable.querySelectorAll("td");
        let contentCell = null;
        for (const cell of allCells) {
            const cellText = cell.textContent.trim().toLowerCase();
            if (!cellText.includes("resultat") && !cellText.includes("résultat")) {
                contentCell = cell;
                break;
            }
        }

        if (contentCell) {
            debug.log("✓ Table Résultat trouvée (Fallback cellule unique)");
            contentCell.innerHTML = htmlContent;
            contentCell.setAttribute("data-updated", "resultat");
            potentialTable.style.outline = "3px solid #00ff00";
            setTimeout(() => potentialTable.style.outline = "", 2000);
            return true;
        }
        
        return false;
      };

      debug.log(
        "Contenu HTML pour table Résultat:",
        htmlContent.substring(0, 150),
      );

      // D'abord, trouver la table conso pour éviter de la confondre avec la table résultat
      let consoTable = null;
      const parent = table.parentElement;

      if (parent) {
        consoTable = parent.querySelector(
          'table.claraverse-conso-table, table[class*="claraverse-conso"]',
        );
      }

      if (!consoTable) {
        // Chercher globalement
        const allConsoTables = document.querySelectorAll(
          'table.claraverse-conso-table, table[class*="claraverse-conso"]',
        );
        if (allConsoTables.length > 0) {
          consoTable = allConsoTables[allConsoTables.length - 1];
        }
      }

      debug.log("Table conso identifiée:", consoTable ? "Oui" : "Non");

      // Stratégie 1: Chercher la table Résultat juste AVANT la table conso
      if (consoTable && consoTable.parentElement) {
        const consoParent = consoTable.parentElement;
        const siblings = Array.from(consoParent.children);
        const consoIndex = siblings.indexOf(consoTable);

        debug.log(`Index de la table conso: ${consoIndex}`);

        // Chercher les tables AVANT la table conso
        for (let i = consoIndex - 1; i >= 0; i--) {
          const sibling = siblings[i];
          if (sibling.tagName === "TABLE" && sibling !== consoTable) {
            debug.log(`Examen de la table à l'index ${i}`);
            const headers = sibling.querySelectorAll("th, td"); // Sélecteur plus large
            for (const header of headers) {
              const headerText = header.textContent.trim().toLowerCase();
              debug.log(`En-tête trouvé: "${headerText}"`);
              if (
                headerText.includes("resultat") ||
                headerText.includes("résultat")
              ) {
                debug.log("✓ Table Résultat trouvée au-dessus de la table conso (S1)");
                if (!consoTable.contains(sibling)) {
                    if (applyResultatToTable(sibling)) return true;
                } else {
                    debug.warn("⚠️ Cette table est la table conso, ignorée");
                }
                break;
              }
            }
          }
        }
      }

      // Stratégie 2: Chercher TOUTES les tables du document
      const allTables = document.querySelectorAll("table");
      debug.log(`🔍 Recherche globale: ${allTables.length} tables trouvées`);

      for (const potentialTable of allTables) {
        // S'assurer que ce n'est pas la table conso ou la table source
        if (potentialTable === consoTable || potentialTable === table) {
          continue;
        }
        if (potentialTable.classList.contains("claraverse-conso-table")) {
          continue;
        }

        const headers = potentialTable.querySelectorAll("th, td");
        for (const header of headers) {
          const headerText = header.textContent.trim().toLowerCase();
          if (
            headerText.includes("resultat") ||
            headerText.includes("résultat")
          ) {
            debug.log("✓ Table Résultat trouvée via recherche globale (S2)");
            if (applyResultatToTable(potentialTable)) return true;
            break;
          }
        }
      }

      // Stratégie 4: Chercher récursivement dans les éléments précédents (hors parent direct)
      let prevElement = (parent || table).previousElementSibling;
      while (prevElement) {
        const potentialTable = prevElement.tagName === "TABLE" ? prevElement : prevElement.querySelector("table");
        if (potentialTable && potentialTable !== consoTable && potentialTable !== table) {
          const headers = potentialTable.querySelectorAll("th, td");
          for (const header of headers) {
            const headerText = header.textContent.trim().toLowerCase();
            if (headerText.includes("resultat") || headerText.includes("résultat")) {
              debug.log("✓ Table Résultat trouvée via Strategy 4 (Siblings)");
              if (applyResultatToTable(potentialTable)) return true;
              break;
            }
          }
        }
        prevElement = prevElement.previousElementSibling;
      }

      // Stratégie 5: Recherche Brute-Force par texte dans tout le document
      debug.log("🔍 Strategy 5: Recherche par texte 'Résultats des tests'...");
      const allTextElements = Array.from(document.querySelectorAll("div, span, th, td, p, h1, h2, h3, h4, h5, h6, b, strong"));
      const resultHeading = allTextElements.find(el => {
        const text = el.textContent.trim().toLowerCase();
        return (text === "résultats des tests" || text === "resultats des tests" || text === "résultat des tests" || text.includes("résultats des tests"));
      });

      if (resultHeading) {
        debug.log("🎯 Titre 'Résultats des tests' trouvé dans le DOM");
        // Chercher la table la plus proche APRÈS ou proche de ce titre
        let foundTable = null;
        
        // 5a. Chercher dans les frères suivants
        let next = resultHeading.nextElementSibling;
        for (let i = 0; i < 5 && next && !foundTable; i++) {
          foundTable = next.tagName === "TABLE" ? next : next.querySelector("table");
          next = next.nextElementSibling;
        }

        // 5b. Chercher dans le parent
        if (!foundTable) {
          const parentEl = resultHeading.parentElement;
          if (parentEl) foundTable = parentEl.querySelector("table");
        }

        if (foundTable && foundTable !== table && foundTable !== consoTable) {
          debug.log("✓ Table Résultat trouvée via Strategy 5 (Proximity)");
          if (applyResultatToTable(foundTable)) return true;
        }
      }

      // Stratégie 6: Recherche Document-Wide sans conditions de proximité
      debug.log("🔍 Strategy 6: Recherche exhaustive de n'importe quelle table de résultat...");
      const finalTryTables = document.querySelectorAll("table");
      for (const t of finalTryTables) {
        if (t === table || t === consoTable || t.classList.contains("claraverse-conso-table")) continue;
        
        const text = t.textContent.toLowerCase();
        if (text.includes("résultats des tests") || text.includes("résultat des tests")) {
          debug.log("✓ Table Résultat trouvée via Strategy 6 (Content Match)");
          if (applyResultatToTable(t)) return true;
        }
      }

      // Stratégie 7: Utiliser la table CONSO comme repère (Ultra-fiable)
      if (consoTable) {
        debug.log("🔍 Strategy 7: Recherche à partir de la table CONSO...");
        let prev = consoTable.previousElementSibling;
        // Remonter jusqu'à 5 éléments au-dessus de la table de consolidation
        for (let i = 0; i < 5 && prev; i++) {
          const text = prev.textContent.toLowerCase();
          if (text.includes("résultat") || text.includes("resultat")) {
            debug.log(`🎯 Élément avec 'résultat' trouvé au-dessus de CONSO (S7): ${prev.tagName}`);
            
            // Si c'est une table, utiliser le helper
            if (prev.tagName === "TABLE") {
               if (applyResultatToTable(prev)) return true;
            } else {
               // Si c'est un autre élément (div, etc.), il contient peut-être la table ou est le conteneur
               const internalTable = prev.querySelector("table");
               if (internalTable) {
                  if (applyResultatToTable(internalTable)) return true;
               }
               // Fallback: si l'élément APRES celui-ci est le conteneur de données
               const dataContainer = prev.nextElementSibling;
               if (dataContainer && dataContainer !== consoTable) {
                  if (dataContainer.tagName === "TABLE") {
                     if (applyResultatToTable(dataContainer)) return true;
                  } else {
                     dataContainer.innerHTML = htmlContent;
                     dataContainer.setAttribute("data-updated", "resultat");
                     dataContainer.style.outline = "3px solid #ff00ff";
                     return true;
                  }
               }
            }
          }
          prev = prev.previousElementSibling;
        }
      }

      // Stratégie 8: Recherche par n'importe quelle table ayant "tests" ou "résultats" n'importe où
      const candidates = Array.from(document.querySelectorAll("table"));
      for (const t of candidates) {
        if (t === table || t === consoTable || t.classList.contains("claraverse-conso-table")) continue;
        if (t.textContent.toLowerCase().includes("tests") || t.textContent.toLowerCase().includes("result")) {
          debug.log("✓ Table Résultat trouvée via Strategy 8 (Keyword Fallback)");
          if (applyResultatToTable(t)) return true;
          
          const cells = t.querySelectorAll("td");
          if (cells.length > 0) {
             const cell = cells[cells.length - 1]; // On prend la dernière cellule si incertain
             cell.innerHTML = htmlContent;
             cell.setAttribute("data-updated", "resultat-S8");
             t.style.outline = "3px solid orange";
             return true;
          }
        }
      }

      // ULTIME RECOURS: Chercher la toute première table au-dessus de la table de pointage
      debug.log("🔍 Ultime recours: recherche de la table immédiatement supérieure...");
      let el = table.parentElement;
      while (el && el !== document.body) {
        const potential = el.querySelectorAll("table");
        for (const t of potential) {
          if (t !== table && t !== consoTable && !t.classList.contains("claraverse-conso-table")) {
            const cells = t.querySelectorAll("td");
            if (cells.length > 0) {
              cells[0].innerHTML = htmlContent;
              cells[0].setAttribute("data-updated", "resultat-final");
              t.style.outline = "3px solid red";
              debug.log("✓ Données injectées dans la table supérieure par défaut");
              return true;
            }
          }
        }
        el = el.parentElement;
      }

      debug.warn("✗ Table Résultat non trouvée après TOUTES les stratégies (1-8 + Fallback)");
      return false;
    }

    setupGlobalEventListeners() {
      // Fermer les dropdowns avec Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.dropdownVisible) {
          this.hideDropdown();
        }
      });

      // Gérer les clics globaux
      document.addEventListener("click", (e) => {
        if (this.dropdownVisible && !e.target.closest(".claraverse-dropdown")) {
          this.hideDropdown();
        }
      });
    }

    destroy() {
      debug.log("🧹 Nettoyage du processeur");

      if (this.observer) {
        this.observer.disconnect();
      }

      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      if (this.autoSaveIntervalId) {
        clearInterval(this.autoSaveIntervalId);
      }

      if (this.consolidationTimeout) {
        clearTimeout(this.consolidationTimeout);
      }

      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.hideDropdown();

      // Déconnecter tous les observers de tables
      if (this.tableObservers) {
        this.tableObservers.forEach((observer, table) => {
          observer.disconnect();
        });
        this.tableObservers.clear();
      }

      // Supprimer les tables de consolidation
      document.querySelectorAll(".claraverse-conso-table").forEach((table) => {
        table.remove();
      });

      this.isInitialized = false;
    }

    // ==================== MÉTHODES DE PERSISTANCE ====================

    /**
     * Générer un ID unique pour une table basé sur son contenu
     */
    generateUniqueTableId(table) {
      // Essayer d'utiliser l'ID existant du dataset
      if (table.dataset.tableId) {
        debug.log(`♻️ Réutilisation ID existant: ${table.dataset.tableId}`);
        return table.dataset.tableId;
      }

      // Essayer d'utiliser l'attribut data-table-id existant
      const existingId = table.getAttribute("data-table-id");
      if (existingId) {
        table.dataset.tableId = existingId;
        debug.log(`♻️ Récupération ID HTML existant: ${existingId}`);
        return existingId;
      }

      // Sinon, créer un ID basé sur les en-têtes (stable entre rechargements)
      const headers = this.getTableHeaders(table);
      // Normaliser les en-têtes pour avoir un hash stable
      const headerText = headers
        .map((h) => h.text.trim().toLowerCase().replace(/\s+/g, "_"))
        .join("__");
      const hash = this.hashCode(headerText);

      // Compter les tables avec ce hash pour différencier les tables similaires
      const existingTables = document.querySelectorAll(
        `[data-table-id^="table_${hash}"]`,
      );
      const suffix =
        existingTables.length > 0 ? `_${existingTables.length}` : "";

      // ID stable basé sur les en-têtes normalisés
      const uniqueId = `table_${hash}${suffix}`;

      table.dataset.tableId = uniqueId;
      table.setAttribute("data-table-id", uniqueId);
      debug.log(`🆔 ID généré et assigné: ${uniqueId}`);
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
     * Calculer la distance approximative entre deux éléments dans le DOM
     */
    getElementDistance(el1, el2) {
      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();

      const dx = rect1.left - rect2.left;
      const dy = rect1.top - rect2.top;

      return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Trouver la table parente d'une cellule
     */
    findParentTable(cell) {
      let element = cell;
      while (element && element.tagName !== "TABLE") {
        element = element.parentElement;
      }
      return element;
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
          debug.warn("⚠️ Quota localStorage dépassé, tentative de nettoyage...");

          // Tenter un nettoyage automatique si le CleanupManager est disponible
          if (window.CleanupManager) {
            const result = window.CleanupManager.autoCleanup();
            if (result && result.saved > 0) {
              debug.log(`✅ ${(result.saved / 1024).toFixed(2)} KB libérés, nouvelle tentative...`);

              // Réessayer la sauvegarde
              try {
                localStorage.setItem(this.storageKey, JSON.stringify(data));
                debug.log("✅ Sauvegarde réussie après nettoyage");
                return;
              } catch (retryError) {
                debug.error("❌ Échec même après nettoyage");
              }
            }
          }

          // Si le nettoyage n'a pas fonctionné, afficher un message discret
          console.warn("⚠️ Espace de stockage insuffisant. Certaines données n'ont pas pu être sauvegardées.");
          console.warn("💡 Utilisez CleanupManager.autoCleanup() pour libérer de l'espace");
        }
      }
    }

    /**
     * Sauvegarder l'état d'une table avec debounce
     */
    saveTableData(table) {
      if (!table) {
        debug.warn("⚠️ saveTableData: table est null ou undefined");
        return;
      }

      debug.log("⏳ Sauvegarde programmée dans", this.autoSaveDelay, "ms");

      // Annuler la sauvegarde en attente
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      // Programmer une nouvelle sauvegarde après le délai
      this.saveTimeout = setTimeout(() => {
        this.saveTableDataNow(table);
      }, this.autoSaveDelay);
    }

    /**
     * Sauvegarder immédiatement l'état d'une table
     */
    saveTableDataNow(table) {
      if (!table) {
        debug.warn("⚠️ saveTableDataNow: table est null ou undefined");
        return;
      }

      debug.log("💾 Début de sauvegarde immédiate");

      const tableId = this.generateUniqueTableId(table);
      debug.log("🆔 ID de table pour sauvegarde:", tableId);

      const allData = this.loadAllData();
      debug.log(
        "📂 Données existantes chargées, nombre de tables:",
        Object.keys(allData).length,
      );

      // Extraire les données de la table
      const tableData = {
        timestamp: Date.now(),
        cells: [],
        headers: [],
        isModelized: false,
      };

      // Sauvegarder les en-têtes
      const headers = this.getTableHeaders(table);
      tableData.headers = headers.map((h) => h.text);
      tableData.isModelized = this.isModelizedTable(headers);

      // Sauvegarder les cellules - gérer tables avec ou sans tbody
      let rows;
      const tbody = table.querySelector("tbody");
      if (tbody) {
        rows = tbody.querySelectorAll("tr");
      } else {
        // Table sans tbody - prendre toutes les lignes sauf thead
        rows = Array.from(table.querySelectorAll("tr")).filter(
          (row) => !row.parentElement.tagName.match(/THEAD/i),
        );
      }

      rows.forEach((row, rowIndex) => {
        // Skip header rows
        if (
          row.querySelector("th") &&
          row.parentElement.tagName.match(/THEAD/i)
        )
          return;

        const cells = row.querySelectorAll("td");
        cells.forEach((cell, colIndex) => {
          const value = cell.textContent.trim();
          const bgColor = cell.style.backgroundColor;
          const innerHTML = cell.innerHTML;

          // Sauvegarder même les cellules vides pour préserver la structure
          tableData.cells.push({
            row: rowIndex,
            col: colIndex,
            value: value,
            bgColor: bgColor,
            // Sauvegarder aussi le HTML pour les cellules avec contenu riche
            html: innerHTML !== value ? innerHTML : undefined,
          });
        });
      });

      // Sauvegarder
      allData[tableId] = tableData;
      debug.log("📝 Données de la table préparées:", {
        type: tableData.isModelized ? "Modelisée" : "Standard",
        headers: tableData.headers.length,
        cells: tableData.cells.length,
        timestamp: new Date(tableData.timestamp).toLocaleString("fr-FR"),
      });

      this.saveAllData(allData);

      debug.log(`✅ Table ${tableId} sauvegardée avec succès`);
      debug.log(
        `📊 Total de tables sauvegardées: ${Object.keys(allData).length}`,
      );
    }

    /**
     * Sauvegarder les données de consolidation
     */
    saveConsolidationData(table, fullContent, simpleContent) {
      if (!table) {
        debug.warn("⚠️ saveConsolidationData: table est null");
        return;
      }

      debug.log("💾 Début sauvegarde consolidation");

      const tableId = this.generateUniqueTableId(table);
      debug.log("🆔 ID pour consolidation:", tableId);

      const allData = this.loadAllData();

      if (!allData[tableId]) {
        allData[tableId] = { timestamp: Date.now() };
        debug.log("📝 Nouvelle entrée créée pour la table");
      }

      allData[tableId].consolidation = {
        fullContent: fullContent,
        simpleContent: simpleContent,
        timestamp: Date.now(),
      };

      debug.log("📝 Consolidation préparée:", {
        fullContentLength: fullContent.length,
        simpleContentLength: simpleContent.length,
      });

      this.saveAllData(allData);
      debug.log(`✅ Consolidation sauvegardée pour ${tableId}`);
    }

    /**
     * Restaurer l'état d'une table
     */
    restoreTableData(table) {
      if (!table) return false;

      const tableId = table.dataset.tableId;
      if (!tableId) {
        debug.warn("⚠️ Table sans ID, impossible de restaurer");
        return false;
      }

      debug.log(`🔍 Tentative de restauration pour ID: ${tableId}`);

      const allData = this.loadAllData();
      const tableData = allData[tableId];

      if (!tableData) {
        debug.log(`ℹ️ Aucune donnée trouvée pour ${tableId}`);
        return false;
      }

      debug.log(`📂 Restauration de la table ${tableId}`, {
        type: tableData.isModelized ? "Modelisée" : "Standard",
        cellCount: tableData.cells ? tableData.cells.length : 0,
        hasConsolidation: !!tableData.consolidation,
      });

      // Restaurer les cellules - gérer tables avec ou sans tbody
      let rows;
      const tbody = table.querySelector("tbody");
      if (tbody) {
        rows = tbody.querySelectorAll("tr");
      } else {
        // Table sans tbody
        rows = Array.from(table.querySelectorAll("tr")).filter(
          (row) => !row.parentElement.tagName.match(/THEAD/i),
        );
      }

      tableData.cells.forEach((cellData) => {
        const row = rows[cellData.row];
        if (!row) return;

        const cells = row.querySelectorAll("td");
        const cell = cells[cellData.col];

        if (cell) {
          // Restaurer le HTML si disponible, sinon le texte
          if (cellData.html) {
            cell.innerHTML = cellData.html;
          } else {
            cell.textContent = cellData.value;
          }

          if (cellData.bgColor) {
            cell.style.backgroundColor = cellData.bgColor;
          }
        }
      });

      // Restaurer la consolidation si elle existe (uniquement pour tables modelisées)
      if (tableData.consolidation && tableData.isModelized) {
        const { fullContent, simpleContent } = tableData.consolidation;

        // Restaurer la table résultat
        this.updateResultatTable(table, fullContent);

        // Restaurer la table conso
        this.updateConsoTable(table, simpleContent);

        debug.log("✅ Consolidation restaurée");
      }

      return true;
    }

    /**
     * Restaurer toutes les tables
     */
    restoreAllTablesData() {
      debug.log("📂 Restauration de toutes les tables...");

      const allData = this.loadAllData();
      const tableIds = Object.keys(allData);

      debug.log(`📊 ${tableIds.length} table(s) trouvée(s) dans le stockage`);

      if (tableIds.length === 0) {
        debug.log("ℹ️ Aucune donnée à restaurer");
        return;
      }

      debug.log("🔍 IDs des tables à restaurer:", tableIds);

      // Attendre un peu que les tables soient créées
      setTimeout(() => {
        const allTables = this.findAllTables();
        debug.log(`🔍 ${allTables.length} table(s) trouvée(s) dans le DOM`);

        let restoredCount = 0;
        let attemptedCount = 0;

        allTables.forEach((table, index) => {
          attemptedCount++;

          // Générer l'ID si la table n'en a pas (pour TOUTES les tables)
          if (!table.dataset.tableId) {
            this.generateUniqueTableId(table);
            debug.log(
              `🆔 ID généré lors de la restauration: ${table.dataset.tableId}`,
            );
          }

          debug.log(
            `🔄 Tentative ${attemptedCount}/${allTables.length} pour la table`,
            table.dataset.tableId || "sans ID",
          );

          if (this.restoreTableData(table)) {
            restoredCount++;
            debug.log(`✓ Table restaurée (${restoredCount}/${attemptedCount})`);
          } else {
            debug.log(`✗ Table non restaurée (aucune donnée ou pas d'ID)`);
          }
        });

        debug.log(
          `✅ Résultat: ${restoredCount} table(s) restaurée(s) sur ${attemptedCount} tentatives`,
        );

        if (restoredCount > 0) {
          // Notification discrète
          const notification = document.createElement("div");
          notification.textContent = `✅ ${restoredCount} table(s) restaurée(s)`;
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
          `;
          document.body.appendChild(notification);

          setTimeout(() => {
            notification.style.transition = "opacity 0.5s";
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 500);
          }, 3000);
        }
      }, 1500);
    }

    /**
     * Sauvegarder automatiquement toutes les tables modifiées
     */
    autoSaveAllTables() {
      const allTables = this.findAllTables();
      let savedCount = 0;

      allTables.forEach((table) => {
        // Sauvegarder TOUTES les tables (modelisées ou non)
        const tbody = table.querySelector("tbody");
        const hasCells = tbody && tbody.querySelectorAll("td").length > 0;

        // Vérifier aussi les tables sans tbody (certaines tables ont les données directement)
        const hasData = hasCells || table.querySelectorAll("td").length > 0;

        if (hasData) {
          this.saveTableDataNow(table);
          savedCount++;
        }
      });

      if (savedCount > 0) {
        debug.log(`💾 Auto-sauvegarde: ${savedCount} table(s) sauvegardée(s)`);
      }
    }

    /**
     * Effacer toutes les données sauvegardées
     */
    clearAllData() {
      if (
        confirm(
          "⚠️ Êtes-vous sûr de vouloir effacer toutes les données sauvegardées ?",
        )
      ) {
        localStorage.removeItem(this.storageKey);
        debug.log("🗑️ Toutes les données ont été effacées");
        alert("✅ Données effacées avec succès");
      }
    }

    /**
     * Exporter les données en JSON
     */
    exportData() {
      const allData = this.loadAllData();
      const jsonString = JSON.stringify(allData, null, 2);

      // Créer un blob et télécharger
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `claraverse_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      debug.log("📥 Données exportées");
      alert("✅ Données exportées avec succès");
    }

    /**
     * Importer des données depuis JSON
     */
    importData(jsonData) {
      try {
        const data =
          typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

        if (
          confirm(
            "⚠️ Importer ces données remplacera les données actuelles. Continuer ?",
          )
        ) {
          this.saveAllData(data);
          this.restoreAllTablesData();
          debug.log("📤 Données importées");
          alert("✅ Données importées avec succès");
        }
      } catch (error) {
        debug.error("❌ Erreur lors de l'importation:", error);
        alert("❌ Erreur lors de l'importation des données");
      }
    }

    /**
     * Effacer les données d'une table spécifique
     */
    clearTableData(tableId) {
      const allData = this.loadAllData();
      if (allData[tableId]) {
        delete allData[tableId];
        this.saveAllData(allData);
        debug.log(`🗑️ Table ${tableId} effacée`);
        return true;
      }
      return false;
    }

    // === MÉTHODES DE SYNCHRONISATION AVEC DEV.JS ===

    // Notifier dev.js d'une modification de table
    notifyTableUpdate(tableElement, updateType = "conso-update") {
      if (!tableElement) return;

      try {
        // Créer un événement personnalisé pour dev.js
        const event = new CustomEvent("claraverse:table:updated", {
          detail: {
            table: tableElement,
            tableId:
              this.generateUniqueTableId(tableElement),
            source: "conso",
            updateType: updateType,
            timestamp: Date.now(),
          },
        });

        document.dispatchEvent(event);
        debug.log(`🔄 Notification envoyée à dev.js: ${updateType}`);
      } catch (error) {
        debug.error("Erreur notification dev.js:", error);
      }
    }

    // Notifier dev.js de la fin de consolidation
    notifyConsolidationComplete(affectedTables = []) {
      try {
        const event = new CustomEvent("claraverse:consolidation:complete", {
          detail: {
            consolidationTables: affectedTables,
            source: "conso",
            timestamp: Date.now(),
          },
        });

        document.dispatchEvent(event);
        debug.log("🎯 Notification consolidation terminée envoyée à dev.js");
      } catch (error) {
        debug.error("Erreur notification consolidation:", error);
      }
    }

    // Notifier dev.js de la création d'une nouvelle table
    notifyTableCreated(tableElement) {
      if (!tableElement) return;

      try {
        const event = new CustomEvent("claraverse:table:created", {
          detail: {
            table: tableElement,
            source: "conso",
            timestamp: Date.now(),
          },
        });

        document.dispatchEvent(event);
        debug.log("🆕 Notification nouvelle table envoyée à dev.js");
      } catch (error) {
        debug.error("Erreur notification création table:", error);
      }
    }

    // Synchroniser avec dev.js après modification
    notifyDevJsSync(table, updateStatus) {
      try {
        const affectedTables = [];

        // Ajouter les tables modifiées
        if (updateStatus.consoUpdated) {
          const consoTable = document.querySelector(".claraverse-conso-table");
          if (consoTable) affectedTables.push(consoTable);
        }

        if (updateStatus.resultatUpdated) {
          // Chercher la table résultat
          const resultatTables = Array.from(
            document.querySelectorAll("table"),
          ).filter((t) => {
            const headers = t.querySelectorAll("th, td"); // Sélecteur plus large
            return Array.from(headers).some(
              (h) =>
                h.textContent.toLowerCase().includes("resultat") ||
                h.textContent.toLowerCase().includes("résultat"),
            );
          });
          if (resultatTables.length > 0) {
            affectedTables.push(resultatTables[resultatTables.length - 1]);
          }
        }

        // Notifier la consolidation terminée
        this.notifyConsolidationComplete(affectedTables);

        // Forcer la sauvegarde via l'API de dev.js
        if (
          window.claraverseSyncAPI &&
          window.claraverseSyncAPI.saveAllTables
        ) {
          setTimeout(() => {
            window.claraverseSyncAPI.saveAllTables();
            debug.log("💾 Sauvegarde forcée via API dev.js");
          }, 100);
        }
      } catch (error) {
        debug.error("Erreur synchronisation dev.js:", error);
      }
    }

    // ==================== COPIER-COLLER DEPUIS EXCEL ====================

    /**
     * Coller des données depuis le presse-papiers (Excel/tableur) dans la table active
     * Les données sont collées à partir de la cellule active
     * @param {HTMLTableCellElement} startCell - Cellule de départ pour le collage
     * @returns {Promise<{success: boolean, rowsInserted: number, cellsUpdated: number}>}
     */
    async pasteFromClipboard(startCell = null) {
      debug.log("📋 Début du collage depuis le presse-papiers...");

      try {
        // 1. Vérifier si le presse-papiers est accessible
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          debug.error("❌ API Clipboard non disponible");
          this.showNotification("❌ Presse-papiers non accessible", "error");
          return { success: false, rowsInserted: 0, cellsUpdated: 0 };
        }

        // 2. Lire le contenu du presse-papiers
        const clipboardText = await navigator.clipboard.readText();

        if (!clipboardText || clipboardText.trim() === "") {
          debug.warn("⚠️ Presse-papiers vide");
          this.showNotification("⚠️ Le presse-papiers est vide", "warning");
          return { success: false, rowsInserted: 0, cellsUpdated: 0 };
        }

        debug.log("📝 Contenu du presse-papiers:", clipboardText.substring(0, 200) + "...");

        // 3. Parser les données tabulaires (séparées par tabulations et retours à la ligne)
        const parsedData = this.parseClipboardData(clipboardText);

        if (parsedData.length === 0) {
          debug.warn("⚠️ Aucune donnée tabulaire détectée");
          this.showNotification("⚠️ Aucune donnée tabulaire détectée", "warning");
          return { success: false, rowsInserted: 0, cellsUpdated: 0 };
        }

        debug.log(`📊 Données parsées: ${parsedData.length} ligne(s), ${parsedData[0]?.length || 0} colonne(s)`);

        // 4. Trouver la table et la cellule de départ
        let targetTable = null;
        let startRow = 0;
        let startCol = 0;

        if (startCell) {
          targetTable = this.findParentTable(startCell);
          const position = this.getCellPosition(startCell);
          startRow = position.row;
          startCol = position.col;
        } else {
          // Chercher la cellule active ou la première table disponible
          const activeCell = document.querySelector('.contextual-active-cell');
          if (activeCell) {
            targetTable = this.findParentTable(activeCell);
            const position = this.getCellPosition(activeCell);
            startRow = position.row;
            startCol = position.col;
          } else {
            // Prendre la première table du chat
            const tables = this.findAllTables();
            if (tables.length > 0) {
              targetTable = tables[0];
              startRow = 1; // Commencer après l'en-tête
              startCol = 0;
            }
          }
        }

        if (!targetTable) {
          debug.error("❌ Aucune table cible trouvée");
          this.showNotification("❌ Aucune table sélectionnée", "error");
          return { success: false, rowsInserted: 0, cellsUpdated: 0 };
        }

        debug.log(`🎯 Table cible trouvée, position de départ: ligne ${startRow}, colonne ${startCol}`);

        // 5. Coller les données dans la table
        const result = this.insertClipboardDataIntoTable(targetTable, parsedData, startRow, startCol);

        // 6. Sauvegarder les modifications
        if (result.success) {
          this.saveTableData(targetTable);
          this.showNotification(`✅ ${result.cellsUpdated} cellule(s) collée(s), ${result.rowsInserted} ligne(s) ajoutée(s)`, "success");
        }

        return result;

      } catch (error) {
        debug.error("❌ Erreur lors du collage:", error);

        // Gérer l'erreur de permission silencieusement
        if (error.name === "NotAllowedError") {
          debug.warn("❌ Permission refusée pour le presse-papiers");
          this.showNotification("❌ Permission presse-papiers refusée", "error");
        } else {
          this.showNotification(`❌ Erreur: ${error.message}`, "error");
        }

        return { success: false, rowsInserted: 0, cellsUpdated: 0 };
      }
    }

    /**
     * Parser les données du presse-papiers (format Excel/tableur)
     * @param {string} text - Texte du presse-papiers
     * @returns {Array<Array<string>>} - Tableau 2D des données
     */
    parseClipboardData(text) {
      if (!text) return [];

      // Normaliser les retours à la ligne (Windows: \r\n, Mac: \r, Unix: \n)
      const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // Séparer par lignes
      const lines = normalizedText.split('\n');

      // Parser chaque ligne (séparée par tabulations)
      const data = [];

      for (const line of lines) {
        // Ignorer les lignes complètement vides à la fin
        if (line.trim() === '' && data.length > 0) {
          // Vérifier si c'est la dernière ligne vide
          continue;
        }

        // Séparer par tabulations
        const cells = line.split('\t');

        // Nettoyer les cellules (trim)
        const cleanedCells = cells.map(cell => cell.trim());

        // Ajouter la ligne si elle contient au moins une cellule non vide
        if (cleanedCells.some(cell => cell !== '')) {
          data.push(cleanedCells);
        }
      }

      return data;
    }

    /**
     * Obtenir la position d'une cellule dans sa table
     * @param {HTMLTableCellElement} cell - La cellule
     * @returns {{row: number, col: number}} - Position de la cellule
     */
    getCellPosition(cell) {
      if (!cell) return { row: 0, col: 0 };

      const row = cell.parentElement;
      const table = this.findParentTable(cell);

      if (!row || !table) return { row: 0, col: 0 };

      // Trouver l'index de la ligne
      const allRows = Array.from(table.querySelectorAll('tr'));
      const rowIndex = allRows.indexOf(row);

      // Trouver l'index de la colonne
      const cells = Array.from(row.querySelectorAll('td, th'));
      const colIndex = cells.indexOf(cell);

      return { row: rowIndex, col: colIndex };
    }

    /**
     * Insérer les données du presse-papiers dans la table
     * @param {HTMLTableElement} table - Table cible
     * @param {Array<Array<string>>} data - Données à insérer
     * @param {number} startRow - Ligne de départ
     * @param {number} startCol - Colonne de départ
     * @returns {{success: boolean, rowsInserted: number, cellsUpdated: number}}
     */
    insertClipboardDataIntoTable(table, data, startRow, startCol) {
      if (!table || !data || data.length === 0) {
        return { success: false, rowsInserted: 0, cellsUpdated: 0 };
      }

      let rowsInserted = 0;
      let cellsUpdated = 0;

      // Obtenir le tbody ou créer si nécessaire
      let tbody = table.querySelector('tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
      }

      // Obtenir toutes les lignes de la table
      const allRows = Array.from(table.querySelectorAll('tr'));
      const headerRow = table.querySelector('thead tr') || allRows[0];
      const numCols = headerRow ? headerRow.querySelectorAll('th, td').length : data[0].length;

      debug.log(`📊 Table: ${allRows.length} lignes, ${numCols} colonnes`);
      debug.log(`📋 Données à coller: ${data.length} lignes, ${data[0].length} colonnes`);

      // Parcourir les données à coller
      data.forEach((rowData, dataRowIndex) => {
        const targetRowIndex = startRow + dataRowIndex;

        // Vérifier si la ligne existe
        let targetRow = allRows[targetRowIndex];

        if (!targetRow) {
          // Créer une nouvelle ligne
          targetRow = document.createElement('tr');

          // Créer les cellules pour la nouvelle ligne
          for (let i = 0; i < numCols; i++) {
            const td = document.createElement('td');
            td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: white;";
            td.contentEditable = true;
            td.setAttribute("data-editable", "true");
            targetRow.appendChild(td);
          }

          tbody.appendChild(targetRow);
          allRows.push(targetRow);
          rowsInserted++;
          debug.log(`➕ Nouvelle ligne créée à l'index ${targetRowIndex}`);
        }

        // Obtenir les cellules de la ligne cible
        const targetCells = targetRow.querySelectorAll('td');

        // Coller les données dans les cellules
        rowData.forEach((cellValue, dataColIndex) => {
          const targetColIndex = startCol + dataColIndex;

          if (targetColIndex < targetCells.length) {
            const targetCell = targetCells[targetColIndex];

            if (targetCell) {
              // Sauvegarder l'ancienne valeur pour le log
              const oldValue = targetCell.textContent;

              // Mettre à jour la valeur
              targetCell.textContent = cellValue;

              // Appliquer un style visuel pour indiquer la modification
              targetCell.style.backgroundColor = '#e8f5e9';

              // Rendre la cellule éditable si ce n'est pas déjà le cas
              if (!targetCell.hasAttribute('contenteditable')) {
                targetCell.contentEditable = true;
                targetCell.setAttribute("data-editable", "true");
              }

              cellsUpdated++;
              debug.log(`📝 Cellule [${targetRowIndex}, ${targetColIndex}]: "${oldValue}" → "${cellValue}"`);
            }
          } else {
            debug.warn(`⚠️ Colonne ${targetColIndex} hors limites (max: ${targetCells.length - 1})`);
          }
        });
      });

      // Réinitialiser les couleurs après un délai
      setTimeout(() => {
        table.querySelectorAll('td').forEach(cell => {
          if (cell.style.backgroundColor === 'rgb(232, 245, 233)') {
            cell.style.backgroundColor = 'white';
          }
        });
      }, 2000);

      debug.log(`✅ Collage terminé: ${cellsUpdated} cellules mises à jour, ${rowsInserted} lignes ajoutées`);

      return { success: true, rowsInserted, cellsUpdated };
    }

    /**
     * Afficher une notification à l'utilisateur
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, error, warning, info)
     */
    showNotification(message, type = "info") {
      const colors = {
        success: { bg: "#28a745", text: "#ffffff" },
        error: { bg: "#dc3545", text: "#ffffff" },
        warning: { bg: "#ffc107", text: "#000000" },
        info: { bg: "#17a2b8", text: "#ffffff" }
      };

      const color = colors[type] || colors.info;

      const notification = document.createElement("div");
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.text};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
      `;

      document.body.appendChild(notification);

      // Animation d'entrée
      setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateY(0)";
      }, 10);

      // Animation de sortie
      setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-20px)";
        setTimeout(() => notification.remove(), 300);
      }, 4000);
    }

    /**
     * Configurer l'écouteur de raccourci clavier Ctrl+V pour le collage
     */
    setupPasteShortcut() {
      document.addEventListener('keydown', async (e) => {
        // Ctrl+Shift+V pour remplacer la table entière
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
          const activeElement = document.activeElement;
          const isInTable = activeElement && (
            activeElement.tagName === 'TD' ||
            activeElement.closest('table')
          );
          const activeCell = document.querySelector('.contextual-active-cell');

          if (isInTable || activeCell) {
            e.preventDefault();
            debug.log("🎹 Raccourci Ctrl+Shift+V détecté - Remplacement de table");

            const table = activeCell ? this.findParentTable(activeCell) :
              (activeElement.tagName === 'TD' ? this.findParentTable(activeElement) :
                activeElement.closest('table'));

            if (table) {
              await this.replaceTableFromClipboard(table);
            }
          }
          return;
        }

        // Ctrl+V ou Cmd+V (Mac) pour coller dans les cellules
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
          // Vérifier si on est dans une table du chat
          const activeElement = document.activeElement;
          const isInTable = activeElement && (
            activeElement.tagName === 'TD' ||
            activeElement.closest('table')
          );

          // Vérifier si une cellule est sélectionnée
          const activeCell = document.querySelector('.contextual-active-cell');

          if (isInTable || activeCell) {
            // Empêcher le comportement par défaut seulement si on est dans une table
            e.preventDefault();

            debug.log("🎹 Raccourci Ctrl+V détecté dans une table");

            // Utiliser la cellule active ou l'élément actif
            const startCell = activeCell || (activeElement.tagName === 'TD' ? activeElement : null);

            await this.pasteFromClipboard(startCell);
          }
        }
      });

      debug.log("⌨️ Raccourcis configurés: Ctrl+V (coller), Ctrl+Shift+V (remplacer table)");
    }

    /**
     * Remplacer intégralement une table avec les données du presse-papiers
     * @param {HTMLTableElement} table - Table à remplacer
     */
    async replaceTableFromClipboard(table) {
      debug.log("📄 Début du remplacement de table depuis le presse-papiers...");

      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          debug.error("❌ API Clipboard non disponible");
          this.showNotification("❌ Presse-papiers non accessible", "error");
          return { success: false };
        }

        const clipboardText = await navigator.clipboard.readText();

        if (!clipboardText || clipboardText.trim() === "") {
          this.showNotification("⚠️ Le presse-papiers est vide", "warning");
          return { success: false };
        }

        const parsedData = this.parseClipboardData(clipboardText);

        if (parsedData.length < 2) {
          this.showNotification("⚠️ Données insuffisantes (en-tête + données requis)", "warning");
          return { success: false };
        }

        debug.log(`📊 Données parsées: ${parsedData.length} lignes, ${parsedData[0].length} colonnes`);

        // Remplacement direct sans confirmation

        // Sauvegarder les classes CSS
        const tableClasses = table.className;
        const tableStyle = table.style.cssText;

        // Vider la table
        table.innerHTML = "";

        // Extraire en-têtes et données
        const headers = parsedData[0];
        const rowsData = parsedData.slice(1);

        // Créer thead
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        headers.forEach(headerText => {
          const th = document.createElement("th");
          th.textContent = headerText || "";
          th.style.cssText = "border: 1px solid #d1d5db; padding: 12px 16px; background: #f8f9fa; font-weight: 600;";
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Créer tbody
        const tbody = document.createElement("tbody");
        rowsData.forEach(rowData => {
          const tr = document.createElement("tr");
          for (let i = 0; i < headers.length; i++) {
            const td = document.createElement("td");
            td.textContent = rowData[i] !== undefined ? rowData[i] : "";
            td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: white;";
            td.contentEditable = true;
            td.setAttribute("data-editable", "true");
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        // Restaurer les classes
        table.className = tableClasses;
        if (tableStyle) table.style.cssText = tableStyle;

        // Effet visuel
        table.style.outline = "3px solid #28a745";
        setTimeout(() => { table.style.outline = ""; }, 2000);

        // Sauvegarder
        this.saveTableData(table);

        this.showNotification(`✅ Table remplacée: ${headers.length} colonnes, ${rowsData.length} lignes`, "success");

        return { success: true, columns: headers.length, rows: rowsData.length };

      } catch (error) {
        debug.error("❌ Erreur remplacement table:", error);
        if (error.name === "NotAllowedError") {
          this.showNotification("❌ Permission refusée pour le presse-papiers", "error");
        } else {
          this.showNotification(`❌ Erreur: ${error.message}`, "error");
        }
        return { success: false };
      }
    }

    // ==================== COPIER-COLLER TABLE INTERNE ====================

    /**
     * Variable pour stocker la table copiée en mémoire
     */
    copiedTableData = null;

    /**
     * Copier une table entière du chat dans la mémoire interne
     * @param {HTMLTableElement} table - Table à copier (optionnel, utilise la table active si non fourni)
     * @returns {{success: boolean, rows: number, cols: number}}
     */
    copyTable(table = null) {
      debug.log("📋 [Copy Table] Début de la copie de table...");

      // Utiliser la table fournie ou chercher la table active
      let targetTable = table;

      if (!targetTable) {
        // Chercher la table avec une cellule active
        const activeCell = document.querySelector('.contextual-active-cell');
        if (activeCell) {
          targetTable = this.findParentTable(activeCell);
        }
      }

      if (!targetTable) {
        // Chercher la première table du chat
        const tables = this.findAllTables();
        if (tables.length > 0) {
          targetTable = tables[0];
        }
      }

      if (!targetTable) {
        debug.error("❌ [Copy Table] Aucune table trouvée à copier");
        this.showNotification("❌ Aucune table sélectionnée à copier", "error");
        return { success: false, rows: 0, cols: 0 };
      }

      debug.log("🎯 [Copy Table] Table cible trouvée:", targetTable.dataset.tableId || "sans ID");

      try {
        // Extraire les données de la table
        const tableData = {
          timestamp: Date.now(),
          headers: [],
          rows: [],
          styles: {
            tableClass: targetTable.className,
            tableStyle: targetTable.style.cssText
          }
        };

        // Extraire les en-têtes
        const headerRow = targetTable.querySelector("thead tr") || targetTable.querySelector("tr:first-child");
        if (headerRow) {
          const headerCells = headerRow.querySelectorAll("th, td");
          headerCells.forEach(cell => {
            tableData.headers.push({
              text: cell.textContent.trim(),
              html: cell.innerHTML,
              style: cell.style.cssText
            });
          });
        }

        // Extraire les lignes de données
        const tbody = targetTable.querySelector("tbody");
        const dataRows = tbody
          ? tbody.querySelectorAll("tr")
          : Array.from(targetTable.querySelectorAll("tr")).slice(1);

        dataRows.forEach(row => {
          const rowData = [];
          const cells = row.querySelectorAll("td");
          cells.forEach(cell => {
            rowData.push({
              text: cell.textContent.trim(),
              html: cell.innerHTML,
              style: cell.style.cssText,
              bgColor: cell.style.backgroundColor
            });
          });
          if (rowData.length > 0) {
            tableData.rows.push(rowData);
          }
        });

        // Stocker les données copiées
        this.copiedTableData = tableData;

        const rowCount = tableData.rows.length;
        const colCount = tableData.headers.length;

        debug.log(`✅ [Copy Table] Table copiée: ${colCount} colonnes, ${rowCount} lignes`);
        this.showNotification(`📋 Table copiée: ${colCount} colonnes, ${rowCount} lignes`, "success");

        return { success: true, rows: rowCount, cols: colCount };

      } catch (error) {
        debug.error("❌ [Copy Table] Erreur lors de la copie:", error);
        this.showNotification(`❌ Erreur: ${error.message}`, "error");
        return { success: false, rows: 0, cols: 0 };
      }
    }

    /**
     * Coller la table copiée pour remplacer la table active
     * @param {HTMLTableElement} table - Table cible à remplacer (optionnel, utilise la table active si non fourni)
     * @returns {{success: boolean, rows: number, cols: number}}
     */
    pasteTable(table = null) {
      debug.log("📄 [Paste Table] Début du collage de table...");

      // Vérifier si une table a été copiée
      if (!this.copiedTableData) {
        debug.warn("⚠️ [Paste Table] Aucune table copiée en mémoire");
        this.showNotification("⚠️ Aucune table copiée. Utilisez d'abord 'Copier table'", "warning");
        return { success: false, rows: 0, cols: 0 };
      }

      // Utiliser la table fournie ou chercher la table active
      let targetTable = table;

      if (!targetTable) {
        // Chercher la table avec une cellule active
        const activeCell = document.querySelector('.contextual-active-cell');
        if (activeCell) {
          targetTable = this.findParentTable(activeCell);
        }
      }

      if (!targetTable) {
        // Chercher la première table du chat
        const tables = this.findAllTables();
        if (tables.length > 0) {
          targetTable = tables[0];
        }
      }

      if (!targetTable) {
        debug.error("❌ [Paste Table] Aucune table cible trouvée");
        this.showNotification("❌ Aucune table sélectionnée pour le collage", "error");
        return { success: false, rows: 0, cols: 0 };
      }

      debug.log("🎯 [Paste Table] Table cible:", targetTable.dataset.tableId || "sans ID");

      try {
        const data = this.copiedTableData;

        // Sauvegarder les classes CSS de la table cible
        const originalClasses = targetTable.className;
        const originalStyle = targetTable.style.cssText;

        // Vider la table
        targetTable.innerHTML = "";

        // Créer le thead avec les en-têtes
        if (data.headers.length > 0) {
          const thead = document.createElement("thead");
          const headerRow = document.createElement("tr");

          data.headers.forEach(header => {
            const th = document.createElement("th");
            // Utiliser le HTML si disponible, sinon le texte
            if (header.html && header.html !== header.text) {
              th.innerHTML = header.html;
            } else {
              th.textContent = header.text || "";
            }
            // Appliquer le style original ou un style par défaut
            th.style.cssText = header.style || "border: 1px solid #d1d5db; padding: 12px 16px; background: #f8f9fa; font-weight: 600; text-align: left;";
            headerRow.appendChild(th);
          });

          thead.appendChild(headerRow);
          targetTable.appendChild(thead);
        }

        // Créer le tbody avec les données
        const tbody = document.createElement("tbody");

        data.rows.forEach(rowData => {
          const tr = document.createElement("tr");

          // S'assurer que chaque ligne a le même nombre de cellules que l'en-tête
          const numCols = data.headers.length || rowData.length;

          for (let i = 0; i < numCols; i++) {
            const td = document.createElement("td");
            const cellData = rowData[i] || { text: "", html: "", style: "" };

            // Utiliser le HTML si disponible et différent du texte
            if (cellData.html && cellData.html !== cellData.text) {
              td.innerHTML = cellData.html;
            } else {
              td.textContent = cellData.text || "";
            }

            // Appliquer le style original ou un style par défaut
            td.style.cssText = cellData.style || "border: 1px solid #d1d5db; padding: 8px 12px; background: white;";

            // Restaurer la couleur de fond si elle était définie
            if (cellData.bgColor) {
              td.style.backgroundColor = cellData.bgColor;
            }

            // Rendre la cellule éditable
            td.contentEditable = true;
            td.setAttribute("data-editable", "true");

            tr.appendChild(td);
          }

          tbody.appendChild(tr);
        });

        targetTable.appendChild(tbody);

        // Restaurer les classes CSS originales de la table cible
        targetTable.className = originalClasses;
        if (originalStyle) {
          targetTable.style.cssText = originalStyle;
        }

        // Effet visuel temporaire pour indiquer le succès
        targetTable.style.outline = "3px solid #28a745";
        setTimeout(() => {
          targetTable.style.outline = "";
        }, 2000);

        // Sauvegarder les modifications
        this.saveTableData(targetTable);

        // Réinstaller le détecteur de changements
        targetTable.dataset.observerInstalled = "false";
        this.setupTableChangeDetection(targetTable);

        const rowCount = data.rows.length;
        const colCount = data.headers.length;

        debug.log(`✅ [Paste Table] Table collée: ${colCount} colonnes, ${rowCount} lignes`);
        this.showNotification(`✅ Table collée: ${colCount} colonnes, ${rowCount} lignes`, "success");

        return { success: true, rows: rowCount, cols: colCount };

      } catch (error) {
        debug.error("❌ [Paste Table] Erreur lors du collage:", error);
        this.showNotification(`❌ Erreur: ${error.message}`, "error");
        return { success: false, rows: 0, cols: 0 };
      }
    }

    /**
     * Vérifier si une table est copiée en mémoire
     * @returns {boolean}
     */
    hasTableCopied() {
      return this.copiedTableData !== null;
    }

    /**
     * Obtenir les informations sur la table copiée
     * @returns {Object|null}
     */
    getCopiedTableInfo() {
      if (!this.copiedTableData) return null;

      return {
        timestamp: this.copiedTableData.timestamp,
        timestampDate: new Date(this.copiedTableData.timestamp).toLocaleString("fr-FR"),
        headers: this.copiedTableData.headers.length,
        rows: this.copiedTableData.rows.length,
        headerNames: this.copiedTableData.headers.map(h => h.text)
      };
    }

    /**
     * Effacer la table copiée de la mémoire
     */
    clearCopiedTable() {
      this.copiedTableData = null;
      debug.log("🗑️ [Copy Table] Table copiée effacée de la mémoire");
      this.showNotification("🗑️ Table copiée effacée", "info");
    }

    // Exposer les méthodes utilitaires
    getStorageInfo() {
      const allData = this.loadAllData();
      const dataSize = new Blob([JSON.stringify(allData)]).size;
      const tableCount = Object.keys(allData).length;

      return {
        tableCount: tableCount,
        dataSize: dataSize,
        dataSizeKB: (dataSize / 1024).toFixed(2),
        dataSizeMB: (dataSize / 1024 / 1024).toFixed(2),
        lastUpdate: Math.max(
          ...Object.values(allData).map((d) => d.timestamp || 0),
        ),
        tables: Object.keys(allData).map((key) => ({
          id: key,
          timestamp: allData[key].timestamp,
          timestampDate: new Date(allData[key].timestamp).toLocaleString(
            "fr-FR",
          ),
          hasConsolidation: !!allData[key].consolidation,
          cellCount: allData[key].cells ? allData[key].cells.length : 0,
        })),
      };
    }
  }

  // Instance globale
  let processor = null;

  // Fonction d'initialisation
  function initClaraverseProcessor() {
    if (processor) {
      processor.destroy();
    }

    processor = new ClaraverseTableProcessor();

    // Exposer pour le debug et les commandes utilitaires
    window.claraverseProcessor = processor;

    // Exposer les commandes utiles dans la console
    window.claraverseCommands = {
      clearAllData: () => processor.clearAllData(),
      clearTable: (tableId) => processor.clearTableData(tableId),
      exportData: () => processor.exportData(),
      importData: (jsonData) => processor.importData(jsonData),
      saveNow: () => processor.autoSaveAllTables(),
      // Nouvelle commande: Coller depuis Excel
      pasteFromExcel: async (startCell = null) => {
        console.log("📋 Collage depuis Excel...");
        const result = await processor.pasteFromClipboard(startCell);
        if (result.success) {
          console.log(`✅ Collage réussi: ${result.cellsUpdated} cellule(s), ${result.rowsInserted} ligne(s) ajoutée(s)`);
        } else {
          console.log("❌ Échec du collage");
        }
        return result;
      },
      // Nouvelle commande: Remplacer table depuis Excel
      replaceTableFromExcel: async () => {
        console.log("📄 Remplacement de table depuis Excel...");
        const tables = processor.findAllTables();
        if (tables.length === 0) {
          console.log("❌ Aucune table trouvée");
          return { success: false };
        }
        // Utiliser la première table ou celle avec une cellule active
        const activeCell = document.querySelector('.contextual-active-cell');
        const table = activeCell ? processor.findParentTable(activeCell) : tables[0];
        const result = await processor.replaceTableFromClipboard(table);
        if (result.success) {
          console.log(`✅ Table remplacée: ${result.columns} colonnes, ${result.rows} lignes`);
        } else {
          console.log("❌ Échec du remplacement");
        }
        return result;
      },
      // Nouvelle commande: Copier une table du chat
      copyTable: (table = null) => {
        console.log("📋 Copie de table...");
        const result = processor.copyTable(table);
        if (result.success) {
          console.log(`✅ Table copiée: ${result.cols} colonnes, ${result.rows} lignes`);
        } else {
          console.log("❌ Échec de la copie");
        }
        return result;
      },
      // Nouvelle commande: Coller une table copiée
      pasteTable: (table = null) => {
        console.log("📄 Collage de table...");
        const result = processor.pasteTable(table);
        if (result.success) {
          console.log(`✅ Table collée: ${result.cols} colonnes, ${result.rows} lignes`);
        } else {
          console.log("❌ Échec du collage");
        }
        return result;
      },
      // Vérifier si une table est copiée
      hasTableCopied: () => {
        const hasCopy = processor.hasTableCopied();
        console.log(hasCopy ? "✅ Une table est copiée en mémoire" : "❌ Aucune table copiée");
        return hasCopy;
      },
      // Obtenir les infos de la table copiée
      getCopiedTableInfo: () => {
        const info = processor.getCopiedTableInfo();
        if (info) {
          console.log("📋 Table copiée:");
          console.log(`  - Colonnes: ${info.headers}`);
          console.log(`  - Lignes: ${info.rows}`);
          console.log(`  - En-têtes: ${info.headerNames.join(", ")}`);
          console.log(`  - Copiée le: ${info.timestampDate}`);
        } else {
          console.log("❌ Aucune table copiée en mémoire");
        }
        return info;
      },
      // Effacer la table copiée
      clearCopiedTable: () => {
        processor.clearCopiedTable();
        console.log("🗑️ Table copiée effacée");
      },
      getStorageInfo: () => {
        const info = processor.getStorageInfo();
        console.table(info.tables);
        console.log(
          `📊 Total: ${info.tableCount} table(s), ${info.dataSizeKB} KB (${info.dataSizeMB} MB)`,
        );
        if (info.lastUpdate) {
          console.log(
            `🕐 Dernière mise à jour: ${new Date(info.lastUpdate).toLocaleString("fr-FR")}`,
          );
        }
        return info;
      },
      restoreAll: () => processor.restoreAllTablesData(),
      testPersistence: () => {
        console.log("🧪 TEST DE PERSISTANCE");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━");

        // 1. Test localStorage
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          console.log("✅ localStorage accessible");
        } catch (e) {
          console.error("❌ localStorage non accessible:", e);
          return;
        }

        // 2. Vérifier les tables dans le DOM
        const tables = processor.findAllTables();
        console.log(`🔍 ${tables.length} table(s) trouvée(s) dans le DOM`);

        tables.forEach((table, i) => {
          const headers = processor.getTableHeaders(table);
          const isModelized = processor.isModelizedTable(headers);
          const hasId = !!table.dataset.tableId;
          const cellCount = table.querySelectorAll("td").length;
          const hasObserver = table.dataset.observerInstalled === "true";
          console.log(`  Table ${i + 1}:`, {
            modelisée: isModelized,
            id: table.dataset.tableId || "❌ AUCUN",
            cellules: cellCount,
            observer: hasObserver ? "✅" : "❌",
            headers:
              headers
                .map((h) => h.text)
                .slice(0, 5)
                .join(", ") + (headers.length > 5 ? "..." : ""),
          });
        });

        // 3. Vérifier les données sauvegardées

        const data = processor.loadAllData();
        const savedTables = Object.keys(data);
        console.log(`💾 ${savedTables.length} table(s) sauvegardée(s)`);

        savedTables.forEach((id, i) => {
          console.log(`  Sauvegarde ${i + 1}:`, {
            id: id,
            cells: data[id].cells?.length || 0,
            hasConsolidation: !!data[id].consolidation,
            timestamp: new Date(data[id].timestamp).toLocaleString("fr-FR"),
          });
        });

        // 4. Test de sauvegarde
        console.log("\n🧪 Test de sauvegarde...");
        processor.autoSaveAllTables();

        setTimeout(() => {
          const newData = processor.loadAllData();
          console.log(
            `✅ Test terminé - ${Object.keys(newData).length} table(s) dans le stockage`,
          );
        }, 1000);
      },
      forceAssignIds: () => {
        console.log("🔧 Attribution forcée des IDs à TOUTES les tables...");
        const tables = processor.findAllTables();
        let count = 0;
        tables.forEach((table) => {
          // Attribuer un ID à TOUTES les tables, pas seulement les modelisées
          if (!table.dataset.tableId) {
            processor.generateUniqueTableId(table);
            count++;
          }
        });
        console.log(`✅ ${count} ID(s) assigné(s)`);
        processor.autoSaveAllTables();
      },
      saveAllNow: () => {
        console.log("💾 Sauvegarde de TOUTES les tables...");
        const tables = processor.findAllTables();
        console.log(`🔍 ${tables.length} table(s) trouvée(s)`);

        let savedCount = 0;
        let skippedCount = 0;

        tables.forEach((table, index) => {
          // Assigner un ID si nécessaire
          if (!table.dataset.tableId) {
            processor.generateUniqueTableId(table);
          }

          const hasData = table.querySelectorAll("td").length > 0;
          const headers = processor.getTableHeaders(table);
          const isModelized = processor.isModelizedTable(headers);

          if (hasData) {
            processor.saveTableDataNow(table);
            savedCount++;
            console.log(
              `  ✅ Table ${index + 1} (${table.dataset.tableId}) - ${isModelized ? "Modelisée" : "Standard"}`,
            );
          } else {
            skippedCount++;
            console.log(`  ⏭️ Table ${index + 1} ignorée (vide)`);
          }
        });

        console.log(`\n📊 RÉSULTAT:`);
        console.log(`  ✅ Sauvegardées: ${savedCount}`);
        console.log(`  ⏭️ Ignorées: ${skippedCount}`);
        console.log(`  📦 Total: ${tables.length}`);

        // Vérifier le stockage
        const info = processor.getStorageInfo();
        console.log(
          `\n💾 Stockage: ${info.tableCount} table(s), ${info.dataSizeKB} KB`,
        );
      },
      debug: {
        enableVerbose: () => {
          CONFIG.debugMode = true;
          console.log("🔊 Mode debug activé");
        },
        disableVerbose: () => {
          CONFIG.debugMode = false;
          console.log("🔇 Mode debug désactivé");
        },
        listTables: () => {
          const tables = processor.findAllTables();
          console.table(
            tables.map((t, i) => ({
              index: i,
              id: t.dataset.tableId || "❌ AUCUN",
              hasClass: t.className,
              rowCount: t.querySelectorAll("tr").length,
            })),
          );
        },
        showStorage: () => {
          const data = processor.loadAllData();
          console.log("📦 Contenu du localStorage:");
          console.log(JSON.stringify(data, null, 2));
        },
      },
      help: () => {
        console.log(`
🎯 COMMANDES CLARAVERSE DISPONIBLES:

📊 Gestion des données:
  - claraverseCommands.getStorageInfo()       : Afficher les infos de stockage
  - claraverseCommands.restoreAll()           : Restaurer toutes les tables
  - claraverseCommands.saveNow()              : Sauvegarder tables modelisées
  - claraverseCommands.saveAllNow()           : Sauvegarder TOUTES les tables
  - claraverseCommands.clearAllData()         : Effacer toutes les données
  - claraverseCommands.clearTable(tableId)    : Effacer une table spécifique

💾 Import/Export:
  - claraverseCommands.exportData()           : Exporter les données en JSON
  - claraverseCommands.importData(json)       : Importer des données JSON

📋 Copier-Coller Excel:
  - claraverseCommands.pasteFromExcel()       : Coller depuis Excel (Ctrl+V)
  - claraverseCommands.replaceTableFromExcel(): Remplacer table entière (Ctrl+Shift+V)
  - Raccourci Ctrl+V: Colle à partir de la cellule active
  - Raccourci Ctrl+Shift+V: Remplace intégralement la table (avec en-têtes)

📋 Copier-Coller Table (interne):
  - claraverseCommands.copyTable()            : Copier la table active en mémoire
  - claraverseCommands.pasteTable()           : Coller la table copiée (remplace la table active)
  - claraverseCommands.hasTableCopied()       : Vérifier si une table est copiée
  - claraverseCommands.getCopiedTableInfo()   : Infos sur la table copiée
  - claraverseCommands.clearCopiedTable()     : Effacer la table copiée de la mémoire

🧪 Diagnostic:
  - claraverseCommands.testPersistence()      : Tester la persistance complète
  - claraverseCommands.forceAssignIds()       : Forcer l'attribution des IDs
  - claraverseCommands.saveAllNow()           : Sauvegarder TOUTES les tables
  - claraverseCommands.debug.enableVerbose()  : Activer logs détaillés
  - claraverseCommands.debug.listTables()     : Lister toutes les tables
  - claraverseCommands.debug.showStorage()    : Afficher le contenu localStorage

💡 Les changements dans les tables sont automatiquement détectés et sauvegardés après 500ms

📋 Exemples:
  // Test de persistance
  claraverseCommands.testPersistence();

  // Coller depuis Excel (après avoir copié des cellules dans Excel)
  // 1. Cliquez sur une cellule de la table
  // 2. Appuyez sur Ctrl+V ou utilisez:
  claraverseCommands.pasteFromExcel();

  // Remplacer une table entière depuis Excel (avec en-têtes)
  // 1. Copiez une plage incluant les en-têtes dans Excel
  // 2. Cliquez sur la table à remplacer
  // 3. Appuyez sur Ctrl+Shift+V ou utilisez:
  claraverseCommands.replaceTableFromExcel();

  // Copier-Coller une table du chat vers une autre:
  // 1. Cliquez sur la table source
  // 2. claraverseCommands.copyTable()
  // 3. Cliquez sur la table cible
  // 4. claraverseCommands.pasteTable()

  // Sauvegarder TOUTES les tables (modelisées et standards)
  claraverseCommands.saveAllNow();

  // Si la persistance ne fonctionne pas
  claraverseCommands.forceAssignIds();
  claraverseCommands.saveAllNow();

  // Voir les infos de stockage
  claraverseCommands.getStorageInfo();
        `);
      },
    };

    debug.log("🎉 Processeur Claraverse initialisé");
    debug.log("💡 Commandes disponibles: window.claraverseCommands");
    debug.log(
      "💡 Tapez: claraverseCommands.help() pour voir toutes les commandes",
    );
    debug.log("📋 Coller depuis Excel: Ctrl+V | Remplacer table: Ctrl+Shift+V");
    debug.log("📋 Copier table: copyTable() | Coller table: pasteTable()");
    debug.log("🧪 Test de persistance: claraverseCommands.testPersistence()");
  }

  // Auto-initialisation
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initClaraverseProcessor);
  } else {
    // Petit délai pour laisser React se charger
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
