// ============================================
// MENU_ACTION.JS - Actions du Menu Contextuel
// Gestion des modifications de structure et Import/Export Excel
// ============================================

(function () {
  "use strict";

  class ContextualMenuActions {
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
      this.eventListeners = [];

      this.config = {
        hoverDelay: 300,
        hideDelay: 500,
        maxFileSize: 10 * 1024 * 1024,
        supportedFormats: [".xlsx", ".xls", ".csv"],
      };
    }

    // ============================================
    // MODIFICATIONS STRUCTURE - LIGNES
    // ============================================

    insertRowBelow() {
      if (!this.validateActiveCell()) return;

      try {
        const rows = this.targetTable.querySelectorAll("tr");
        const targetRowIndex = this.activeCellPosition.row;
        const targetRow = rows[targetRowIndex];

        if (!targetRow) {
          this.showAlert("⚠️ Ligne introuvable");
          return;
        }

        const cellsInTargetRow = targetRow.querySelectorAll("td, th");
        const numberOfColumns = cellsInTargetRow.length;
        const newRow = document.createElement("tr");

        for (let i = 0; i < numberOfColumns; i++) {
          const newCell = document.createElement("td");
          newCell.textContent = "";
          newCell.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: #fafafa;";
          this.makeCellEditable(newCell);
          newRow.appendChild(newCell);
        }

        const tbody = targetRow.parentNode;
        if (targetRowIndex < rows.length - 1) {
          tbody.insertBefore(newRow, rows[targetRowIndex + 1]);
        } else {
          tbody.appendChild(newRow);
        }

        this.showQuickNotification("✅ Ligne ajoutée");
        this.notifyStructureChange('row_added', { rowIndex: targetRowIndex + 1 });
        this.saveTable();
      } catch (error) {
        console.error("❌ Erreur insertion ligne:", error);
      }
    }

    deleteSelectedRow() {
      if (!this.validateActiveCell()) return;

      const rows = this.targetTable.querySelectorAll("tr");
      if (rows.length <= 1) {
        this.showAlert("⚠️ Minimum 1 ligne requise");
        return;
      }

      const targetRow = rows[this.activeCellPosition.row];
      if (!targetRow) return;

      if (confirm("Supprimer cette ligne ?")) {
        const rowIndex = this.activeCellPosition.row;
        targetRow.parentNode.removeChild(targetRow);
        
        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };
        
        this.showQuickNotification("✅ Ligne supprimée");
        this.notifyStructureChange('row_deleted', { rowIndex });
        this.saveTable();
      }
    }

    // ============================================
    // MODIFICATIONS STRUCTURE - COLONNES
    // ============================================

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
            background: ${rowIndex === 0 ? "#f9fafb" : "#fafafa"};
            font-weight: ${rowIndex === 0 ? "bold" : "normal"};
          `;

          if (rowIndex > 0) {
            this.makeCellEditable(newCell);
          }

          if (targetColIndex < cells.length - 1) {
            row.insertBefore(newCell, cells[targetColIndex + 1]);
          } else {
            row.appendChild(newCell);
          }
        });

        this.showQuickNotification("✅ Colonne ajoutée");
        this.notifyStructureChange('column_added', { colIndex: targetColIndex + 1 });
        this.saveTable();
      } catch (error) {
        console.error("❌ Erreur insertion colonne:", error);
      }
    }

    deleteSelectedColumn() {
      if (!this.validateActiveCell()) return;

      const headerRow = this.targetTable.querySelector("tr");
      const headerCells = headerRow ? headerRow.querySelectorAll("td, th") : [];

      if (headerCells.length <= 1) {
        this.showAlert("⚠️ Minimum 1 colonne requise");
        return;
      }

      if (confirm("Supprimer cette colonne ?")) {
        const rows = Array.from(this.targetTable.querySelectorAll("tr"));
        const targetColIndex = this.activeCellPosition.col;

        rows.forEach((row) => {
          const cells = Array.from(row.querySelectorAll("td, th"));
          if (cells[targetColIndex]) {
            cells[targetColIndex].parentNode.removeChild(cells[targetColIndex]);
          }
        });

        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };
        
        this.showQuickNotification("✅ Colonne supprimée");
        this.notifyStructureChange('column_deleted', { colIndex: targetColIndex });
        this.saveTable();
      }
    }

    // ============================================
    // IMPORT/EXPORT EXCEL
    // ============================================

    async importExcel() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée");
        return;
      }

      try {
        const file = await this.openFileDialog();
        if (!file || !this.validateFile(file)) return;

        this.showQuickNotification("📄 Lecture...");
        await this.ensureSheetJSLoaded();

        const workbook = await this.parseExcelFile(file);
        const { headers, data } = this.extractExcelData(workbook);

        if (data.length === 0) {
          this.showAlert("⚠️ Fichier vide");
          return;
        }

        this.replaceTableContent(headers, data, false);
        this.showQuickNotification("✅ Import réussi");
        this.notifyStructureChange('table_imported', { rowCount: data.length, colCount: headers.length });
        this.saveTable();
      } catch (error) {
        console.error("❌ Erreur import:", error);
        this.showAlert(`❌ ${error.message}`);
      }
    }

    async importExcelSheetTest() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée");
        return;
      }

      try {
        const file = await this.openFileDialog();
        if (!file || !this.validateFile(file)) return;

        this.showQuickNotification("📄 Import test...");
        await this.ensureSheetJSLoaded();

        const workbook = await this.parseExcelFile(file);
        const { headers, data } = this.extractExcelData(workbook);

        const testColumns = ["Ecart", "Assertion", "CTR 1", "CTR 2", "CTR 3", "Conclusion"];
        const enhancedHeaders = [...headers, ...testColumns];
        const enhancedData = data.map((row) => [...row, ...new Array(testColumns.length).fill("")]);

        this.replaceTableContent(enhancedHeaders, enhancedData, true);
        this.showQuickNotification("✅ Import test réussi");
        this.notifyStructureChange('table_imported_test', { rowCount: data.length, colCount: enhancedHeaders.length });
        this.saveTable();
      } catch (error) {
        console.error("❌ Erreur import test:", error);
        this.showAlert(`❌ ${error.message}`);
      }
    }

    async exportExcel() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée");
        return;
      }

      try {
        this.showQuickNotification("📊 Export...");
        await this.ensureSheetJSLoaded();

        const tableData = this.extractTableData();
        if (!tableData || tableData.length === 0) {
          this.showAlert("⚠️ Table vide");
          return;
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(tableData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const fileName = `claraverse_${timestamp}.xlsx`;

        XLSX.writeFile(workbook, fileName);
        this.showQuickNotification("✅ Export réussi");
      } catch (error) {
        console.error("❌ Erreur export:", error);
        this.showAlert("❌ Erreur export");
      }
    }

    // ============================================
    // UTILITAIRES EXCEL
    // ============================================

    validateFile(file) {
      if (file.size > this.config.maxFileSize) {
        this.showAlert("⚠️ Fichier trop volumineux");
        return false;
      }
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!this.config.supportedFormats.includes(ext)) {
        this.showAlert("⚠️ Format non supporté");
        return false;
      }
      return true;
    }

    openFileDialog() {
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = this.config.supportedFormats.join(",");
        input.style.display = "none";

        input.onchange = (e) => {
          const file = e.target.files[0];
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

    async ensureSheetJSLoaded() {
      if (typeof XLSX !== "undefined") return;

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("SheetJS non chargé"));
        document.head.appendChild(script);
      });
    }

    async parseExcelFile(file) {
      const arrayBuffer = await file.arrayBuffer();
      return XLSX.read(arrayBuffer, { type: "array" });
    }

    extractExcelData(workbook) {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });

      if (rawData.length === 0) return { headers: [], data: [] };

      let headerIdx = 0;
      for (let i = 0; i < Math.min(3, rawData.length); i++) {
        if (rawData[i] && rawData[i].some(c => c && c.toString().trim())) {
          headerIdx = i;
          break;
        }
      }

      const headers = rawData[headerIdx] || [];
      const data = rawData.slice(headerIdx + 1).filter(row => 
        row && row.some(c => c !== null && c !== undefined && c.toString().trim())
      );

      const maxCols = Math.max(headers.length, ...data.map(r => r.length));
      return {
        headers: this.normalizeRowLength(headers, maxCols),
        data: data.map(r => this.normalizeRowLength(r, maxCols))
      };
    }

    normalizeRowLength(row, len) {
      const normalized = [...row];
      while (normalized.length < len) normalized.push("");
      return normalized.slice(0, len);
    }

    extractTableData() {
      if (!this.targetTable) return null;

      const data = [];
      this.targetTable.querySelectorAll("tr").forEach((row) => {
        const rowData = [];
        row.querySelectorAll("td, th").forEach((cell) => {
          rowData.push((cell.textContent || "").trim());
        });
        if (rowData.length > 0) data.push(rowData);
      });

      return data;
    }

    // ============================================
    // REMPLACEMENT CONTENU TABLE
    // ============================================

    replaceTableContent(headers, data, isTestMode) {
      if (!this.targetTable) return;

      const classes = this.targetTable.className;
      const styles = this.targetTable.style.cssText;

      this.targetTable.innerHTML = "";

      if (headers.length > 0) {
        this.targetTable.appendChild(this.createTableHeader(headers, isTestMode));
      }
      if (data.length > 0) {
        this.targetTable.appendChild(this.createTableBody(data, isTestMode));
      }

      this.targetTable.className = classes;
      this.targetTable.style.cssText = styles;
    }

    createTableHeader(headers, isTestMode) {
      const thead = document.createElement("thead");
      const tr = document.createElement("tr");

      headers.forEach((text, i) => {
        const th = document.createElement("th");
        th.textContent = text || "";
        const isTest = isTestMode && i >= headers.length - 6;
        th.style.cssText = `
          border: 1px solid #d1d5db;
          padding: 12px 16px;
          background: ${isTest ? "#e3f2fd" : "#f8f9fa"};
          font-weight: 600;
        `;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      return thead;
    }

    createTableBody(data, isTestMode) {
      const tbody = document.createElement("tbody");

      data.forEach((rowData) => {
        const tr = document.createElement("tr");

        rowData.forEach((cellData, i) => {
          const td = document.createElement("td");
          td.textContent = cellData !== undefined && cellData !== null ? String(cellData) : "";
          const isTest = isTestMode && i >= rowData.length - 6;
          td.style.cssText = `
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            background: ${isTest ? "#fafafa" : "white"};
          `;
          this.makeCellEditable(td);
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      return tbody;
    }

    // ============================================
    // ÉDITION CELLULES
    // ============================================

    makeCellEditable(cell) {
      cell.contentEditable = true;
      cell.setAttribute("data-editable", "true");

      // Sauvegarder sur blur (perte de focus)
      this.addEventListenerWithCleanup(cell, "blur", () => {
        const table = cell.closest("table");
        if (table) {
          console.log("💾 Sauvegarde après édition cellule");
          this.saveTable();
        }
      });

      // Sauvegarder sur Enter
      this.addEventListenerWithCleanup(cell, "keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          cell.blur();
        }
      });

      // Sauvegarde auto pendant la frappe
      let typingTimeout;
      this.addEventListenerWithCleanup(cell, "input", () => {
        const table = cell.closest("table");
        if (table) {
          clearTimeout(typingTimeout);
          typingTimeout = setTimeout(() => {
            console.log("💾 Sauvegarde auto pendant frappe");
            this.saveTable();
          }, 2000);
        }
      });
    }

    // ============================================
    // COMMUNICATION AVEC menu_storage.js
    // ============================================

    saveTable() {
      if (this.targetTable && window.claraverseStorageAPI) {
        window.claraverseStorageAPI.saveTable(this.targetTable);
      }
    }

    notifyStructureChange(action, details) {
      // Émettre un Custom Event pour informer les autres scripts
      const event = new CustomEvent('claraverse:structure:changed', {
        detail: {
          action: action,
          table: this.targetTable,
          details: details,
          source: 'menu_action',
          timestamp: Date.now()
        },
        bubbles: true
      });
      document.dispatchEvent(event);

      // Sauvegarder immédiatement après modification structure
      this.saveTable();
    }

    // ============================================
    // INTERFACE MENU
    // ============================================

    init() {
      if (this.initialized) return;

      console.log("🎯 Init menu contextuel actions");
      this.createMenuElement();
      this.attachEventListeners();
      
      // Écouter les événements du storage
      this.listenStorageEvents();

      this.initialized = true;
      console.log("✅ Menu actions initialisé");
    }

    listenStorageEvents() {
      document.addEventListener('claraverse:storage:event', (event) => {
        const { action, data } = event.detail;
        console.log(`📡 Storage event reçu: ${action}`, data);
        
        // Réagir aux événements du storage si nécessaire
        if (action === 'table_restored' && data.table) {
          // Réappliquer l'édition sur les cellules restaurées
          const cells = data.table.querySelectorAll('td');
          cells.forEach(cell => {
            if (!cell.hasAttribute('contentEditable')) {
              this.makeCellEditable(cell);
            }
          });
        }
      });
    }

    createMenuElement() {
      this.menuElement = document.createElement("div");
      this.menuElement.id = "contextual-menu-actions";
      this.menuElement.style.cssText = `
        position: fixed;
        background: linear-gradient(145deg, #fff, #f8f9fa);
        border: 1px solid #e1e5e9;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        padding: 8px 0;
        z-index: 15000;
        display: none;
        min-width: 250px;
        font-size: 14px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
      `;

      const items = [
        { text: "➕ Insérer ligne", action: () => this.insertRowBelow() },
        { text: "📊 Insérer colonne", action: () => this.insertColumnRight() },
        { text: "🗑️ Supprimer ligne", action: () => this.deleteSelectedRow() },
        { text: "❌ Supprimer colonne", action: () => this.deleteSelectedColumn() },
        { text: "---", action: null },
        { text: "📥 Import Excel", action: () => this.importExcel() },
        { text: "📬 Import Excel + Test", action: () => this.importExcelSheetTest() },
        { text: "📤 Export Excel", action: () => this.exportExcel() },
        { text: "---", action: null },
        { text: "💾 Sauvegarder maintenant", action: () => this.forceSave() },
      ];

      this.renderMenuItems(items);
      document.body.appendChild(this.menuElement);
    }

    renderMenuItems(items) {
      const fragment = document.createDocumentFragment();

      items.forEach((item) => {
        if (item.text === "---") {
          const sep = document.createElement("div");
          sep.style.cssText = "height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent); margin: 8px 12px;";
          fragment.appendChild(sep);
          return;
        }

        const btn = document.createElement("button");
        btn.textContent = item.text;
        btn.style.cssText = `
          width: 100%;
          background: none;
          border: none;
          padding: 12px 16px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          color: #2c3e50;
        `;

        this.addEventListenerWithCleanup(btn, "mouseenter", () => {
          btn.style.background = "linear-gradient(135deg, #e3f2fd, #f0f8ff)";
          btn.style.color = "#1976d2";
        });

        this.addEventListenerWithCleanup(btn, "mouseleave", () => {
          btn.style.background = "none";
          btn.style.color = "#2c3e50";
        });

        this.addEventListenerWithCleanup(btn, "click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (item.action) {
            try {
              item.action();
            } catch (err) {
              console.error("❌ Erreur action:", err);
            }
          }
          this.hideMenu();
        });

        fragment.appendChild(btn);
      });

      this.menuElement.appendChild(fragment);
    }

    attachEventListeners() {
      this.addEventListenerWithCleanup(this.menuElement, "mouseenter", () => {
        this.isHoveringMenu = true;
        this.clearHideTimeout();
      });

      this.addEventListenerWithCleanup(this.menuElement, "mouseleave", () => {
        this.isHoveringMenu = false;
        this.scheduleHideMenu();
      });

      this.addEventListenerWithCleanup(document, "mouseover", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) {
          this.handleTableHover(e, table);
        }
      });

      this.addEventListenerWithCleanup(document, "mouseout", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) {
          this.handleTableLeave();
        }
      });

      this.addEventListenerWithCleanup(document, "contextmenu", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) {
          e.preventDefault();
          this.clearHoverTimeout();
          this.showMenu(e.pageX, e.pageY, table);
        }
      });

      this.addEventListenerWithCleanup(document, "click", (e) => {
        const cell = e.target.closest("td, th");
        const table = e.target.closest("table");

        if (cell && table && this.isTableInChat(table)) {
          this.handleCellClick(cell, table);
        } else if (this.isMenuVisible && !this.menuElement.contains(e.target)) {
          this.hideMenu();
        }
      });

      this.addEventListenerWithCleanup(document, "keydown", (e) => {
        if (e.key === "Escape" && this.isMenuVisible) {
          this.hideMenu();
        }
      });
    }

    addEventListenerWithCleanup(el, evt, handler) {
      el.addEventListener(evt, handler);
      this.eventListeners.push({ element: el, event: evt, handler });
    }

    // ============================================
    // GESTION CELLULES & POSITIONS
    // ============================================

    handleCellClick(cell, table) {
      if (this.activeCell) {
        this.activeCell.classList.remove("active-cell");
      }

      this.activeCell = cell;
      this.targetTable = table;
      cell.classList.add("active-cell");

      this.injectActiveStyles();
      this.calculateCellPosition(cell, table);
    }

    injectActiveStyles() {
      if (!document.getElementById("cell-styles-actions")) {
        const style = document.createElement("style");
        style.id = "cell-styles-actions";
        style.textContent = `
          .active-cell {
            background: linear-gradient(135deg, #e3f2fd, #f0f8ff) !important;
            outline: 2px solid #2196f3 !important;
            outline-offset: -2px !important;
          }
        `;
        document.head.appendChild(style);
      }
    }

    calculateCellPosition(cell, table) {
      const row = cell.parentNode;
      const rows = Array.from(table.querySelectorAll("tr"));
      const rowIndex = rows.indexOf(row);
      const cells = Array.from(row.querySelectorAll("td, th"));
      const colIndex = cells.indexOf(cell);
      this.activeCellPosition = { row: rowIndex, col: colIndex };
    }

    validateActiveCell() {
      if (!this.targetTable || this.activeCellPosition.row === -1) {
        this.showAlert("⚠️ Cliquez sur une cellule d'abord");
        return false;
      }
      return true;
    }

    forceSave() {
      if (this.targetTable && window.claraverseStorageAPI) {
        window.claraverseStorageAPI.saveTable(this.targetTable);
        this.showQuickNotification("💾 Table sauvegardée!");
      } else {
        this.showAlert("⚠️ Aucune table sélectionnée");
      }
    }

    // ============================================
    // GESTION MENU (Hover & Display)
    // ============================================

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

    handleTableLeave() {
      this.isHoveringTable = false;
      this.clearHoverTimeout();
      this.scheduleHideMenu();
    }

    scheduleHideMenu() {
      this.hideTimeout = setTimeout(() => {
        if (!this.isHoveringTable && !this.isHoveringMenu) {
          this.hideMenu();
        }
      }, this.config.hideDelay);
    }

    clearHoverTimeout() {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    }

    clearHideTimeout() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.clearHoverTimeout();
    }

    isTableInChat(table) {
      if (window.claraverseStorageAPI) {
        return window.claraverseStorageAPI.isTableInChat(table);
      }

      // Fallback si storage pas encore chargé
      const selector = "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg";
      if (table.matches(selector)) {
        const container = "div.prose.prose-base.dark\\:prose-invert.max-w-none";
        if (table.closest(container)) return true;
      }

      const fallbacks = [
        '[class*="chat"]',
        '[class*="message"]',
        ".prose",
        ".markdown-body"
      ];

      for (const sel of fallbacks) {
        if (table.closest(sel)) return true;
      }

      return false;
    }

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

      setTimeout(() => {
        const rect = this.menuElement.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        if (rect.right > winW) {
          this.menuElement.style.left = `${winW - rect.width - 10}px`;
        }
        if (rect.bottom > winH) {
          this.menuElement.style.top = `${winH - rect.height - 10}px`;
        }
      }, 0);
    }

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

    // ============================================
    // UTILITAIRES UI
    // ============================================

    showQuickNotification(message) {
      const notif = document.createElement("div");
      notif.style.cssText = `
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
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
      `;
      notif.textContent = message;
      document.body.appendChild(notif);

      setTimeout(() => {
        notif.style.opacity = "1";
        notif.style.transform = "translateY(0)";
      }, 10);

      setTimeout(() => {
        notif.style.opacity = "0";
        notif.style.transform = "translateY(-20px)";
        setTimeout(() => {
          if (notif.parentNode) notif.parentNode.removeChild(notif);
        }, 300);
      }, 3000);
    }

    showAlert(msg) {
      alert(msg);
    }

    // ============================================
    // CLEANUP
    // ============================================

    cleanup() {
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners = [];

      if (this.menuElement && this.menuElement.parentNode) {
        this.menuElement.parentNode.removeChild(this.menuElement);
      }

      console.log("🧹 Menu actions nettoyé");
    }
  }

  // ============================================
  // INITIALISATION & API GLOBALE
  // ============================================

  const menuActions = new ContextualMenuActions();

  // API globale exposée
  window.claraverseMenuAPI = {
    version: '1.0.0',
    
    // Actions structure
    insertRow: () => menuActions.insertRowBelow(),
    insertColumn: () => menuActions.insertColumnRight(),
    deleteRow: () => menuActions.deleteSelectedRow(),
    deleteColumn: () => menuActions.deleteSelectedColumn(),
    
    // Import/Export
    importExcel: () => menuActions.importExcel(),
    importExcelTest: () => menuActions.importExcelSheetTest(),
    exportExcel: () => menuActions.exportExcel(),
    
    // Utilitaires
    getTargetTable: () => menuActions.targetTable,
    getActiveCell: () => menuActions.activeCell,
    
    // Cleanup
    cleanup: () => menuActions.cleanup()
  };

  // Fonctions compatibles anciennes versions
  window.initContextualMenu = () => menuActions.init();

  // Auto-initialisation (attend que storage soit chargé)
  const initActions = () => {
    // Vérifier que storage est disponible
    if (typeof window.claraverseStorageAPI === 'undefined') {
      console.warn("⚠️ menu_storage.js pas encore chargé, nouvelle tentative...");
      setTimeout(initActions, 500);
      return;
    }

    try {
      menuActions.init();
      console.log("✅ Menu contextuel actions chargé");
      console.log("🔧 API: window.claraverseMenuAPI");
    } catch (error) {
      console.error("❌ Erreur initialisation menu actions:", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initActions, 1500);
    });
  } else {
    setTimeout(initActions, 1500);
  }

  window.addEventListener("beforeunload", () => {
    menuActions.cleanup();
  });

  console.log("🚀 menu_action.js chargé");
})();