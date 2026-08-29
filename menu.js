// Menu contextuel (Core) pour les tables ClaraVerse
// Version 8 - Focalisée sur la modification de structure et l'import/export

(function () {
  "use strict";

  class ContextualMenuManager {
    constructor() {
      this.menuElement = null;
      this.isMenuVisible = false;
      this.targetTable = null;
      this.activeCellPosition = { row: -1, col: -1 };
      this.activeCell = null;
      this.initialized = false;
      this.hoverTimeout = null;
      this.hideTimeout = null;
      this.isHoveringTable = false;
      this.isHoveringMenu = false;

      // Cache pour optimiser les performances
      this.tableCache = new WeakMap();
      this.eventListeners = [];

      // Configuration
      this.config = {
        hoverDelay: 300,
        hideDelay: 500,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedFormats: [".xlsx", ".xls", ".csv"],
      };
    }

    // Initialise le gestionnaire de menu contextuel
    init() {
      if (this.initialized) return;

      console.log("🎯 Initialisation du menu contextuel (Core) ClaraVerse");
      this.createMenuElement();
      this.attachEventListeners();
      this.observeNewTables();
      this.processExistingTables();
      this.initSyncWithDev();
      this.initialized = true;

      console.log("✅ Menu contextuel (Core) initialisé avec succès");
    }

    // Crée l'élément HTML du menu contextuel avec design amélioré
    createMenuElement() {
      this.menuElement = document.createElement("div");
      this.menuElement.id = "contextual-table-menu-advanced";
      this.menuElement.className = "contextual-menu-advanced";
      this.menuElement.style.cssText = `
        position: fixed;
        background: linear-gradient(145deg, #ffffff, #f8f9fa);
        border: 1px solid #e1e5e9;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 8px 0;
        z-index: 15000;
        display: none;
        min-width: 250px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      `;

      // Menu items - Uniquement modification de structure et import/export
      const menuItems = [
        // Actions de modification de structure
        {
          text: "➕ Insérer ligne en dessous",
          action: () => this.insertRowBelow(),
          category: "structure",
          shortcut: "Ctrl+Shift+↓",
        },
        {
          text: "📊 Insérer colonne à droite",
          action: () => this.insertColumnRight(),
          category: "structure",
          shortcut: "Ctrl+Shift+→",
        },
        {
          text: "🗑️ Supprimer ligne sélectionnée",
          action: () => this.deleteSelectedRow(),
          category: "structure",
        },
        {
          text: "❌ Supprimer colonne sélectionnée",
          action: () => this.deleteSelectedColumn(),
          category: "structure",
        },

        { text: "---", action: null }, // Séparateur

        // Actions d'import/export avancées
        {
          text: "📥 Import Excel Standard",
          action: () => this.importExcel(),
          category: "data",
        },
        {
          text: "🔬 Import Excel avec colonnes test",
          action: () => this.importExcelSheetTest(),
          category: "data",
        },
        {
          text: "📤 Export vers Excel",
          action: () => this.exportExcel(),
          category: "data",
        },
      ];

      this.renderMenuItems(menuItems);
      this.setupMenuEventHandlers();
      document.body.appendChild(this.menuElement);
    }

    // Rendu optimisé des éléments de menu
    renderMenuItems(menuItems) {
      const fragment = document.createDocumentFragment();

      menuItems.forEach((item, index) => {
        if (item.text === "---") {
          const separator = document.createElement("div");
          separator.className = "menu-separator";
          separator.style.cssText = `
            height: 1px;
            background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
            margin: 8px 12px;
          `;
          fragment.appendChild(separator);
          return;
        }

        const button = document.createElement("button");
        button.className = `contextual-menu-item ${item.category || ""}`;
        button.innerHTML = `
          <span class="menu-item-text">${item.text}</span>
          ${item.shortcut ? `<span class="menu-item-shortcut" style="font-size:11px;color:#999;margin-left:auto;">${item.shortcut}</span>` : ""}
        `;

        button.style.cssText = `
          width: 100%;
          background: none;
          border: none;
          padding: 12px 16px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #2c3e50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        `;

        // Gestion des événements optimisée
        this.addEventListenerWithCleanup(button, "mouseenter", () => {
          button.style.background = "linear-gradient(135deg, #e3f2fd, #f0f8ff)";
          button.style.color = "#1976d2";
          button.style.transform = "translateX(4px)";
        });

        this.addEventListenerWithCleanup(button, "mouseleave", () => {
          button.style.background = "none";
          button.style.color = "#2c3e50";
          button.style.transform = "none";
        });

        this.addEventListenerWithCleanup(button, "click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (item.action) {
            try {
              item.action();
              console.log(`✅ Action exécutée: ${item.text}`);
            } catch (error) {
              console.error(`❌ Erreur action ${item.text}:`, error);
              this.showAlert(`❌ Erreur: ${error.message}`);
            }
          }
          this.hideMenu();
        });

        fragment.appendChild(button);
      });

      this.menuElement.appendChild(fragment);
    }

    // Configuration des gestionnaires d'événements du menu
    setupMenuEventHandlers() {
      this.addEventListenerWithCleanup(this.menuElement, "mouseenter", () => {
        this.isHoveringMenu = true;
        this.clearHideTimeout();
      });

      this.addEventListenerWithCleanup(this.menuElement, "mouseleave", () => {
        this.isHoveringMenu = false;
        this.scheduleHideMenu();
      });
    }

    // Gestionnaire d'événements optimisé avec nettoyage automatique
    addEventListenerWithCleanup(element, event, handler) {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    }

    // Attache les événements principaux avec delegation optimisée
    attachEventListeners() {
      // Event delegation pour les tables
      this.addEventListenerWithCleanup(document, "mouseover", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) {
          this.handleTableHover(e, table);
        }
      });

      this.addEventListenerWithCleanup(document, "mouseout", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) {
          this.handleTableLeave(e, table);
        }
      });

      // Menu contextuel avec clic droit
      this.addEventListenerWithCleanup(document, "contextmenu", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) {
          e.preventDefault();
          this.clearHoverTimeout();
          this.showMenu(e.pageX, e.pageY, table);
          console.log("📋 Menu contextuel affiché via clic droit");
        }
      });

      // Gestion des clics sur cellules
      this.addEventListenerWithCleanup(document, "click", (e) => {
        const cell = e.target.closest("td, th");
        const table = e.target.closest("table");

        if (cell && table && this.isTableInChat(table)) {
          this.handleCellClick(e, cell, table);
        } else if (this.isMenuVisible && !this.menuElement.contains(e.target)) {
          this.hideMenu();
        }
      });

      // Raccourcis clavier
      this.addEventListenerWithCleanup(document, "keydown", (e) => {
        if (e.key === "Escape" && this.isMenuVisible) {
          this.hideMenu();
        }

        // Raccourcis avec Ctrl+Shift
        if (e.ctrlKey && e.shiftKey && this.targetTable) {
          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              this.insertRowBelow();
              break;
            case "ArrowRight":
              e.preventDefault();
              this.insertColumnRight();
              break;
          }
        }
      });
    }

    // Gestion optimisée du clic sur cellule
    handleCellClick(e, cell, table) {
      // Nettoyer l'ancienne sélection
      if (this.activeCell) {
        this.activeCell.classList.remove("contextual-active-cell");
      }

      // Nouvelle sélection
      this.activeCell = cell;
      this.targetTable = table;
      cell.classList.add("contextual-active-cell");

      // Injecter les styles si nécessaire
      this.injectActiveStyles();

      // Calculer position
      this.calculateCellPosition(cell, table);

      console.log(
        `📍 Cellule active: ligne ${this.activeCellPosition.row}, colonne ${this.activeCellPosition.col}`
      );
    }

    // Injection optimisée des styles CSS
    injectActiveStyles() {
      if (!document.getElementById("contextual-cell-styles-advanced")) {
        const style = document.createElement("style");
        style.id = "contextual-cell-styles-advanced";
        style.textContent = `
          .contextual-active-cell {
            background: linear-gradient(135deg, #e3f2fd, #f0f8ff) !important;
            outline: 2px solid #2196f3 !important;
            outline-offset: -2px !important;
            box-shadow: inset 0 0 0 1px rgba(33, 150, 243, 0.3) !important;
            position: relative !important;
          }

          .contextual-active-cell::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, transparent, rgba(33, 150, 243, 0.1), transparent);
            pointer-events: none;
            border-radius: 4px;
          }
        `;
        document.head.appendChild(style);
      }
    }

    // Calcul optimisé de la position de cellule
    calculateCellPosition(cell, table) {
      const row = cell.parentNode;
      const rows = Array.from(table.querySelectorAll("tr"));
      const rowIndex = rows.indexOf(row);
      const cells = Array.from(row.querySelectorAll("td, th"));
      const colIndex = cells.indexOf(cell);

      this.activeCellPosition = { row: rowIndex, col: colIndex };
    }

    // Validation de cellule active
    validateActiveCell() {
      if (!this.targetTable || this.activeCellPosition.row === -1) {
        this.showAlert(
          "⚠️ Aucune cellule sélectionnée. Cliquez d'abord sur une cellule de la table."
        );
        return false;
      }
      return true;
    }

    // Insertion de ligne améliorée
    insertRowBelow() {
      if (!this.validateActiveCell()) return;

      try {
        const rows = this.targetTable.querySelectorAll("tr");
        const targetRowIndex = this.activeCellPosition.row;
        const targetRow = rows[targetRowIndex];

        if (!targetRow) {
          this.showAlert("⚠️ Ligne cible introuvable.");
          return;
        }

        // Analyser la structure de la ligne
        const cellsInTargetRow = targetRow.querySelectorAll("td, th");
        const numberOfColumns = cellsInTargetRow.length;

        // Créer nouvelle ligne
        const newRow = document.createElement("tr");

        for (let i = 0; i < numberOfColumns; i++) {
          const newCell = document.createElement("td");
          newCell.textContent = "";
          newCell.style.cssText = `
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            min-height: 20px;
            background: #fafafa;
            transition: background-color 0.3s ease;
          `;

          this.makeCellEditable(newCell);
          newRow.appendChild(newCell);
        }

        // Insertion optimisée
        if (targetRowIndex < rows.length - 1) {
          rows[targetRowIndex + 1].parentNode.insertBefore(
            newRow,
            rows[targetRowIndex + 1]
          );
        } else {
          targetRow.parentNode.appendChild(newRow);
        }

        console.log(`✅ Ligne insérée après ligne ${targetRowIndex}`);
        this.showQuickNotification("✅ Ligne ajoutée avec succès");

        // Synchronisation et notifications
        this.notifyTableStructureChange("row_added", {
          rowIndex: targetRowIndex + 1,
          columnCount: numberOfColumns,
        });

        this.syncWithDev();
      } catch (error) {
        console.error("❌ Erreur insertion ligne:", error);
        this.showAlert("❌ Erreur lors de l'insertion de la ligne");
      }
    }

    // Insertion de colonne améliorée
    insertColumnRight() {
      if (!this.validateActiveCell()) return;

      try {
        const targetColIndex = this.activeCellPosition.col;
        const rows = Array.from(this.targetTable.querySelectorAll("tr"));

        rows.forEach((row, rowIndex) => {
          const cells = Array.from(row.querySelectorAll("td, th"));
          const newCell = document.createElement(rowIndex === 0 ? "th" : "td");

          newCell.textContent = rowIndex === 0 ? "Nouvelle colonne" : "";
          newCell.style.cssText = `
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            min-height: 20px;
            background: ${rowIndex === 0 ? "#f9fafb" : "#fafafa"};
            font-weight: ${rowIndex === 0 ? "bold" : "normal"};
          `;

          if (rowIndex > 0) {
            this.makeCellEditable(newCell);
          }

          // Insertion à la position correcte
          if (targetColIndex < cells.length - 1) {
            row.insertBefore(newCell, cells[targetColIndex + 1]);
          } else {
            row.appendChild(newCell);
          }
        });

        console.log(`✅ Colonne insérée après colonne ${targetColIndex}`);
        this.showQuickNotification("✅ Colonne ajoutée avec succès");

        this.notifyTableStructureChange("column_added", {
          columnIndex: targetColIndex + 1,
        });

        this.syncWithDev();
      } catch (error) {
        console.error("❌ Erreur insertion colonne:", error);
        this.showAlert("❌ Erreur lors de l'insertion de la colonne");
      }
    }

    // Nouvelle fonction: Supprimer ligne sélectionnée
    deleteSelectedRow() {
      if (!this.validateActiveCell()) return;

      const rows = this.targetTable.querySelectorAll("tr");
      if (rows.length <= 1) {
        this.showAlert(
          "⚠️ Impossible de supprimer - la table doit avoir au moins une ligne."
        );
        return;
      }

      const targetRowIndex = this.activeCellPosition.row;
      const targetRow = rows[targetRowIndex];

      if (!targetRow) {
        this.showAlert("⚠️ Ligne à supprimer introuvable.");
        return;
      }

      if (confirm("Êtes-vous sûr de vouloir supprimer cette ligne ?")) {
        targetRow.remove();
        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };

        console.log(`✅ Ligne ${targetRowIndex} supprimée`);
        this.showQuickNotification("✅ Ligne supprimée");

        this.notifyTableStructureChange("row_deleted", {
          rowIndex: targetRowIndex,
        });
        this.syncWithDev();
      }
    }

    // Nouvelle fonction: Supprimer colonne sélectionnée
    deleteSelectedColumn() {
      if (!this.validateActiveCell()) return;

      const headerRow = this.targetTable.querySelector("tr");
      const headerCells = headerRow ? headerRow.querySelectorAll("td, th") : [];

      if (headerCells.length <= 1) {
        this.showAlert(
          "⚠️ Impossible de supprimer - la table doit avoir au moins une colonne."
        );
        return;
      }

      const targetColIndex = this.activeCellPosition.col;

      if (confirm("Êtes-vous sûr de vouloir supprimer cette colonne ?")) {
        const rows = Array.from(this.targetTable.querySelectorAll("tr"));

        rows.forEach((row) => {
          const cells = Array.from(row.querySelectorAll("td, th"));
          if (cells[targetColIndex]) {
            cells[targetColIndex].remove();
          }
        });

        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };

        console.log(`✅ Colonne ${targetColIndex} supprimée`);
        this.showQuickNotification("✅ Colonne supprimée");

        this.notifyTableStructureChange("column_deleted", {
          columnIndex: targetColIndex,
        });
        this.syncWithDev();
      }
    }

    // Import Excel amélioré
    async importExcel() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }

      try {
        const file = await this.openFileDialog();
        if (!file) return;

        if (!this.validateFile(file)) return;

        this.showQuickNotification("📄 Lecture du fichier Excel...");

        await this.ensureSheetJSLoaded();

        const workbook = await this.parseExcelFile(file);
        const { headers, data } = this.extractExcelData(workbook);

        if (data.length === 0) {
          this.showAlert("⚠️ Le fichier Excel ne contient aucune donnée.");
          return;
        }

        // Remplacement amélioré du contenu
        this.replaceTableContentAdvanced(headers, data);

        this.showQuickNotification("✅ Import Excel terminé avec succès!");

        this.notifyTableStructureChange("excel_import", {
          rowCount: data.length,
          columnCount: headers.length,
          fileName: file.name,
        });

        this.syncWithDev();
      } catch (error) {
        console.error("❌ Erreur import Excel:", error);
        this.showAlert(`❌ Erreur lors de l'import: ${error.message}`);
      }
    }

    // Import Excel avec colonnes de test
    async importExcelSheetTest() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }

      try {
        const file = await this.openFileDialog();
        if (!file) return;

        if (!this.validateFile(file)) return;

        this.showQuickNotification(
          "📄 Lecture du fichier Excel avec colonnes test..."
        );

        await this.ensureSheetJSLoaded();

        const workbook = await this.parseExcelFile(file);
        const { headers, data } = this.extractExcelData(workbook);

        // Ajouter colonnes de test spécifiques
        const testColumns = [
          "Ecart",
          "Assertion",
          "CTR 1",
          "CTR 2",
          "CTR 3",
          "Conclusion",
        ];
        const enhancedHeaders = [...headers, ...testColumns];
        const enhancedData = data.map((row) => [
          ...row,
          ...new Array(testColumns.length).fill(""),
        ]);

        this.replaceTableContentAdvanced(enhancedHeaders, enhancedData, true);

        this.showQuickNotification(
          "✅ Import Excel avec colonnes test terminé!"
        );

        this.notifyTableStructureChange("excel_import_test", {
          rowCount: enhancedData.length,
          columnCount: enhancedHeaders.length,
          fileName: file.name,
          testColumns: testColumns.length,
        });

        this.syncWithDev();
      } catch (error) {
        console.error("❌ Erreur import Excel test:", error);
        this.showAlert(`❌ Erreur lors de l'import test: ${error.message}`);
      }
    }

    // Export Excel amélioré
    async exportExcel() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }

      try {
        this.showQuickNotification("📊 Préparation de l'export Excel...");

        await this.ensureSheetJSLoaded();

        const tableData = this.extractTableData();

        if (!tableData || tableData.length === 0) {
          this.showAlert("⚠️ La table est vide, rien à exporter.");
          return;
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(tableData);

        XLSX.utils.book_append_sheet(workbook, worksheet, "Export ClaraVerse");

        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:]/g, "-");
        const fileName = `claraverse_export_${timestamp}.xlsx`;

        XLSX.writeFile(workbook, fileName);

        this.showQuickNotification("✅ Export Excel terminé avec succès!");
        console.log(`✅ Table exportée vers: ${fileName}`);
      } catch (error) {
        console.error("❌ Erreur export Excel:", error);
        this.showAlert("❌ Erreur lors de l'export Excel: " + error.message);
      }
    }

    // Fonctions utilitaires pour import/export

    // Validation de fichier avancée
    validateFile(file) {
      if (file.size > this.config.maxFileSize) {
        this.showAlert(
          `⚠️ Fichier trop volumineux (max ${this.config.maxFileSize / 1024 / 1024}MB)`
        );
        return false;
      }

      const extension = "." + file.name.split(".").pop().toLowerCase();
      if (!this.config.supportedFormats.includes(extension)) {
        this.showAlert(
          `⚠️ Format non supporté. Formats acceptés: ${this.config.supportedFormats.join(", ")}`
        );
        return false;
      }

      return true;
    }

    // Ouverture de dialogue fichier moderne
    openFileDialog() {
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = this.config.supportedFormats.join(",");
        input.style.display = "none";

        input.onchange = (event) => {
          const file = event.target.files[0];
          document.body.removeChild(input);
          resolve(file || null);
        };

        input.oncancel = () => {
          document.body.removeChild(input);
          resolve(null);
        };

        document.body.appendChild(input);
        input.click();
      });
    }

    // S'assurer que SheetJS est chargé
    async ensureSheetJSLoaded() {
      if (typeof XLSX !== "undefined") {
        return;
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error("Impossible de charger SheetJS"));
        document.head.appendChild(script);
      });
    }

    // Parsing Excel amélioré
    async parseExcelFile(file) {
      const arrayBuffer = await file.arrayBuffer();
      return XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: true,
        cellNF: false,
        cellText: false,
      });
    }

    // Extraction de données Excel avec détection automatique
    extractExcelData(workbook) {
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      if (rawData.length === 0) {
        return { headers: [], data: [] };
      }

      // Détecter automatiquement la ligne d'en-tête
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(rawData.length, 3); i++) {
        if (
          rawData[i] &&
          rawData[i].some((cell) => cell && cell.toString().trim())
        ) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = rawData[headerRowIndex] || [];
      const data = rawData
        .slice(headerRowIndex + 1)
        .filter(
          (row) =>
            row &&
            row.some(
              (cell) =>
                cell !== null && cell !== undefined && cell.toString().trim()
            )
        );

      // Normaliser la longueur des lignes
      const maxColumns = Math.max(
        headers.length,
        ...data.map((row) => row.length)
      );

      const normalizedHeaders = this.normalizeRowLength(headers, maxColumns);
      const normalizedData = data.map((row) =>
        this.normalizeRowLength(row, maxColumns)
      );

      return {
        headers: normalizedHeaders,
        data: normalizedData,
      };
    }

    // Normalisation de la longueur des lignes
    normalizeRowLength(row, targetLength) {
      const normalized = [...row];
      while (normalized.length < targetLength) {
        normalized.push("");
      }
      return normalized.slice(0, targetLength);
    }

    // Remplacement de contenu de table avancé
    replaceTableContentAdvanced(headers, data, isTestMode = false) {
      if (!this.targetTable) return;

      try {
        // Sauvegarder les attributs de la table
        const tableClasses = this.targetTable.className;
        const tableStyles = this.targetTable.style.cssText;

        // Vider la table
        this.targetTable.innerHTML = "";

        // Créer l'en-tête
        if (headers.length > 0) {
          const thead = this.createTableHeader(headers, isTestMode);
          this.targetTable.appendChild(thead);
        }

        // Créer le corps
        if (data.length > 0) {
          const tbody = this.createTableBody(data, isTestMode);
          this.targetTable.appendChild(tbody);
        }

        // Restaurer les attributs
        this.targetTable.className = tableClasses;
        if (tableStyles) {
          this.targetTable.style.cssText = tableStyles;
        }

        console.log(
          `✅ Table remplacée: ${data.length} lignes, ${headers.length} colonnes`
        );
      } catch (error) {
        console.error("❌ Erreur remplacement table:", error);
        throw error;
      }
    }

    // Création d'en-tête de table optimisée
    createTableHeader(headers, isTestMode = false) {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      headers.forEach((headerText, index) => {
        const th = document.createElement("th");
        th.textContent = headerText || "";

        // Style spécial pour les colonnes de test
        const isTestColumn = isTestMode && index >= headers.length - 6;

        th.style.cssText = `
          border: 1px solid #d1d5db;
          padding: 12px 16px;
          background: ${isTestColumn ? "linear-gradient(135deg, #f0f8ff, #e3f2fd)" : "linear-gradient(135deg, #f8f9fa, #e9ecef)"};
          font-weight: 600;
          color: ${isTestColumn ? "#1976d2" : "#495057"};
          text-align: left;
          position: sticky;
          top: 0;
          z-index: 10;
        `;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      return thead;
    }

    // Création du corps de table optimisée
    createTableBody(data, isTestMode = false) {
      const tbody = document.createElement("tbody");

      data.forEach((rowData) => {
        const tr = document.createElement("tr");

        rowData.forEach((cellData, colIndex) => {
          const td = document.createElement("td");
          td.textContent =
            cellData !== undefined && cellData !== null ? String(cellData) : "";

          const isTestColumn = isTestMode && colIndex >= rowData.length - 6;

          td.style.cssText = `
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            min-height: 20px;
            background: ${isTestColumn ? "#fafafa" : "white"};
            transition: background-color 0.3s ease;
          `;

          this.makeCellEditable(td);
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      return tbody;
    }

    // Extraction des données de table
    extractTableData() {
      if (!this.targetTable) {
        return null;
      }

      const data = [];
      const rows = this.targetTable.querySelectorAll("tr");

      rows.forEach((row) => {
        const rowData = [];
        const cells = row.querySelectorAll("td, th");

        cells.forEach((cell) => {
          const cellText = cell.textContent || cell.innerText || "";
          rowData.push(cellText.trim());
        });

        if (rowData.length > 0) {
          data.push(rowData);
        }
      });

      return data;
    }

    // Rendre une cellule éditable
    makeCellEditable(cell) {
      cell.contentEditable = true;
      cell.setAttribute("data-editable", "true");

      this.addEventListenerWithCleanup(cell, "blur", () => {
        this.saveCellData(cell);
      });

      this.addEventListenerWithCleanup(cell, "keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          cell.blur();
        }
      });
    }

    // Sauvegarde des données de cellule
    saveCellData(cell) {
      try {
        const table = cell.closest("table");
        if (table) {
          const tableId = this.generateTableId(table);

          // Sauvegarder via l'API de dev.js si disponible
          if (
            window.claraverseSyncAPI &&
            window.claraverseSyncAPI.forceSaveTable
          ) {
            window.claraverseSyncAPI.forceSaveTable(table);
          }

          // Notifier la modification
          if (
            window.claraverseSyncAPI &&
            window.claraverseSyncAPI.notifyTableUpdate
          ) {
            window.claraverseSyncAPI.notifyTableUpdate(tableId, table, "menu");
          }

          // Déclencher un événement personnalisé
          const event = new CustomEvent("claraverse:table:updated", {
            detail: {
              tableId: tableId,
              table: table,
              cell: cell,
              source: "menu",
              action: "cell_edit",
              timestamp: Date.now(),
            },
          });
          document.dispatchEvent(event);
        }
      } catch (error) {
        console.error("Erreur sauvegarde cellule:", error);
      }
    }

    // Synchronisation avec dev.js
    syncWithDev() {
      try {
        if (this.targetTable) {
          const tableId = this.generateTableId(this.targetTable);

          // Utiliser l'API de synchronisation si disponible
          if (
            window.claraverseSyncAPI &&
            window.claraverseSyncAPI.forceSaveTable
          ) {
            window.claraverseSyncAPI.forceSaveTable(this.targetTable);
            console.log("🔄 Synchronisation via API dev.js effectuée");
          } else if (typeof window.saveTableNow === "function") {
            window.saveTableNow(this.targetTable);
            console.log("🔄 Synchronisation avec dev.js effectuée (fallback)");
          }

          // Notifier la modification
          if (
            window.claraverseSyncAPI &&
            window.claraverseSyncAPI.notifyTableUpdate
          ) {
            window.claraverseSyncAPI.notifyTableUpdate(
              tableId,
              this.targetTable,
              "menu"
            );
          }

          // Déclencher un événement personnalisé
          const event = new CustomEvent("claraverse:table:updated", {
            detail: {
              tableId: tableId,
              table: this.targetTable,
              source: "menu",
              action: "table_modified",
              timestamp: Date.now(),
            },
          });
          document.dispatchEvent(event);
        }
      } catch (error) {
        console.error("Erreur synchronisation dev.js:", error);
      }
    }

    // Génération d'ID de table
    generateTableId(table) {
      try {
        const tableContent = table.outerHTML.replace(/\s+/g, " ").trim();
        const hash = this.hashCode(tableContent);
        const position = Array.from(document.querySelectorAll("table")).indexOf(
          table
        );
        return `table_${position}_${Math.abs(hash)}`;
      } catch (error) {
        console.error("Erreur génération ID table:", error);
        return `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    }

    // Hash code pour l'ID de table
    hashCode(str) {
      let hash = 0;
      if (str.length === 0) return hash;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash;
    }

    // Notification de changement de structure
    notifyTableStructureChange(action, details = {}) {
      try {
        if (!this.targetTable) return;

        const tableId = this.generateTableId(this.targetTable);

        const event = new CustomEvent("claraverse:table:structure:changed", {
          detail: {
            tableId: tableId,
            table: this.targetTable,
            action: action,
            details: details,
            source: "menu",
            timestamp: Date.now(),
          },
        });

        document.dispatchEvent(event);
        console.log(`🔄 Notification structure ${action} envoyée à dev.js`);
      } catch (error) {
        console.error("Erreur notification structure:", error);
      }
    }

    // Affichage de notification rapide
    showQuickNotification(message) {
      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 20000;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        max-width: 300px;
      `;
      notification.textContent = message;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateY(0)";
      }, 10);

      setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-20px)";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }

    // Gestion du survol de table
    handleTableHover(e, table) {
      this.isHoveringTable = true;
      this.clearHideTimeout();

      if (this.targetTable !== table && !this.isMenuVisible) {
        this.hoverTimeout = setTimeout(() => {
          if (this.isHoveringTable && !this.isMenuVisible) {
            this.showMenu(e.pageX + 10, e.pageY + 10, table);
          }
        }, this.config.hoverDelay);
      }
    }

    // Gestion de la sortie du survol
    handleTableLeave(e, table) {
      this.isHoveringTable = false;
      this.clearHoverTimeout();
      this.scheduleHideMenu();
    }

    // Programmer le masquage du menu
    scheduleHideMenu() {
      this.hideTimeout = setTimeout(() => {
        if (!this.isHoveringTable && !this.isHoveringMenu) {
          this.hideMenu();
        }
      }, this.config.hideDelay);
    }

    // Annuler le timeout de survol
    clearHoverTimeout() {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    }

    // Annuler le timeout de masquage
    clearHideTimeout() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.clearHoverTimeout();
    }

    // Vérifier si la table est dans le chat (en utilisant le sélecteur Claraverse fourni)
    isTableInChat(table) {
      const claraVerseTableSelector =
        "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg";

      // Vérification principale : la table elle-même correspond au sélecteur de base
      if (table.matches(claraVerseTableSelector)) {
        // Vérification secondaire : la table est-elle dans un conteneur de chat ?
        const chatContainerSelector =
          "div.prose.prose-base.dark\\:prose-invert.max-w-none";
        if (table.closest(chatContainerSelector)) {
          return true;
        }
      }

      // Fallback sur d'autres sélecteurs de chat génériques si la correspondance exacte échoue
      const chatSelectors = [
        '[class*="chat"]',
        '[class*="message"]',
        '[class*="conversation"]',
        '[id*="chat"]',
        '[data-testid*="chat"]',
        ".prose",
        ".markdown-body",
        '[class*="assistant"]',
        "[data-editable-processed]",
      ];

      for (const selector of chatSelectors) {
        if (table.closest(selector)) {
          return true;
        }
      }

      return false;
    }

    // Afficher le menu contextuel
    showMenu(x, y, table) {
      this.targetTable = table;
      this.menuElement.style.left = `${x}px`;
      this.menuElement.style.top = `${y}px`;
      this.menuElement.style.display = "block";

      setTimeout(() => {
        this.menuElement.style.opacity = "1";
        this.menuElement.style.transform = "translateY(0)";
      }, 10);

      this.isMenuVisible = true;

      console.log(
        "📋 Menu contextuel affiché pour la table:",
        table.getAttribute("data-table-index") || "sans index"
      );

      // Ajustement si le menu dépasse les bords de l'écran
      setTimeout(() => {
        const rect = this.menuElement.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (rect.right > windowWidth) {
          this.menuElement.style.left = `${windowWidth - rect.width - 10}px`;
        }

        if (rect.bottom > windowHeight) {
          this.menuElement.style.top = `${windowHeight - rect.height - 10}px`;
        }
      }, 0);
    }

    // Masquer le menu contextuel
    hideMenu() {
      if (!this.isMenuVisible) return;

      this.menuElement.style.opacity = "0";
      this.menuElement.style.transform = "translateY(-10px)";

      setTimeout(() => {
        this.menuElement.style.display = "none";
        this.isMenuVisible = false;
        this.isHoveringTable = false;
        this.isHoveringMenu = false;
      }, 300);

      this.clearHoverTimeout();
      this.clearHideTimeout();
    }

    // Afficher une alerte
    showAlert(message) {
      alert(message);
      console.log(`🔔 Alerte affichée: ${message}`);
    }

    // Observer l'ajout de nouvelles tables
    observeNewTables() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "TABLE" && this.isTableInChat(node)) {
                console.log("📊 Nouvelle table détectée dans le chat");
              }

              if (node.querySelectorAll) {
                const tables = node.querySelectorAll("table");
                tables.forEach((table) => {
                  if (this.isTableInChat(table)) {
                    console.log("📊 Sous-table détectée");
                  }
                });
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      console.log("👁️ Observer menu contextuel activé");
    }

    // Traiter les tables existantes
    processExistingTables() {
      const tables = document.querySelectorAll("table");
      let chatTablesCount = 0;

      tables.forEach((table) => {
        if (this.isTableInChat(table)) {
          chatTablesCount++;
        }
      });

      console.log(
        `📊 ${chatTablesCount} table(s) de chat prêtes pour le menu contextuel`
      );
    }

    // Forcer l'initialisation
    forceInit() {
      console.log("🔧 Initialisation forcée du menu contextuel");
      this.init();
    }

    // Initialiser la synchronisation avec dev.js
    initSyncWithDev() {
      try {
        console.log("🔗 Initialisation synchronisation menu.js <-> dev.js");

        const waitForDevJS = (attempts = 0) => {
          if (window.claraverseSyncAPI) {
            console.log("✅ API de synchronisation dev.js détectée");
            this.setupDevJSListeners();
          } else if (attempts < 50) {
            setTimeout(() => waitForDevJS(attempts + 1), 100);
          } else {
            console.log(
              "⚠️ API dev.js non détectée, utilisation mode fallback"
            );
          }
        };

        waitForDevJS();
      } catch (error) {
        console.error("Erreur initialisation sync dev.js:", error);
      }
    }

    // Configurer les écouteurs pour dev.js
    setupDevJSListeners() {
      try {
        // Écouter les événements de sauvegarde de dev.js
        this.addEventListenerWithCleanup(
          document,
          "claraverse:save:complete",
          (event) => {
            console.log("💾 Sauvegarde dev.js terminée:", event.detail);
          }
        );

        // Écouter les demandes de rescan
        this.addEventListenerWithCleanup(
          document,
          "claraverse:request:rescan",
          () => {
            console.log("🔄 Rescan demandé par dev.js");
            this.processExistingTables();
          }
        );

        console.log("👂 Écouteurs dev.js configurés");
      } catch (error) {
        console.error("Erreur configuration écouteurs dev.js:", error);
      }
    }

    // Nettoyage des événements
    cleanup() {
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners = [];

      if (this.menuElement && this.menuElement.parentNode) {
        this.menuElement.parentNode.removeChild(this.menuElement);
      }

      console.log("🧹 Menu contextuel nettoyé");
    }
  }

  // Instance globale du gestionnaire de menu
  const contextualMenuManager = new ContextualMenuManager();

  // Fonctions globales pour l'intégration
  window.initContextualMenu = function () {
    contextualMenuManager.init();
  };

  window.forceContextualMenu = function () {
    contextualMenuManager.forceInit();
  };

  window.cleanupContextualMenu = function () {
    contextualMenuManager.cleanup();
  };

  // Auto-initialisation avec délai pour compatibilité
  const initializeMenu = () => {
    try {
      contextualMenuManager.init();
    } catch (error) {
      console.error("❌ Erreur initialisation menu contextuel:", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initializeMenu, 2000);
    });
  } else {
    setTimeout(initializeMenu, 2000);
  }

  // Nettoyage automatique lors du déchargement de la page
  window.addEventListener("beforeunload", () => {
    contextualMenuManager.cleanup();
  });

  console.log("✅ Menu contextuel (Core) ClaraVerse chargé avec succès");
  console.log("🚀 Fonctionnalités de base disponibles:");
  console.log("   • Insertion/suppression lignes et colonnes");
  console.log("   • Import/Export Excel optimisé");
  console.log("   • Synchronisation des modifications avec dev.js");
})();
