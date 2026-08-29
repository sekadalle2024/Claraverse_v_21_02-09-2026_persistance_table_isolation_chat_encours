// Menu contextuel (Core) pour les tables ClaraVerse
// Version 9.4 - Backend URL dynamique (local ↔ production) + fallback JS

(function () {
  "use strict";

  // ============================================================
  // 🌐 CONFIG DYNAMIQUE : URL backend selon l'environnement
  // - Local dev  : http://localhost:5173  → http://localhost:5000
  // - Production : https://prclaravi.netlify.app → https://pybackend.zeabur.app
  // Ajouter ici tout nouvel environnement (staging, review app…)
  // ============================================================
  const BACKEND_ENV_MAP = {
    "http://localhost:5173":        "http://localhost:5000",
    "http://localhost:4173":        "http://localhost:5000",  // vite preview
    "https://prclaravi.netlify.app": "https://pybackend.zeabur.app",
  };

  function getBackendBaseUrl() {
    const origin = window.location.origin.replace(/\/$/, "");
    if (BACKEND_ENV_MAP[origin]) {
      console.log(\`🌐 [Config] Backend URL: \${BACKEND_ENV_MAP[origin]} (origin: \${origin})\`);
      return BACKEND_ENV_MAP[origin];
    }
    // Fallback : variable injectée par Vite (VITE_BACKEND_URL dans .env)
    if (typeof window.__VITE_BACKEND_URL__ !== "undefined" && window.__VITE_BACKEND_URL__) {
      return window.__VITE_BACKEND_URL__;
    }
    console.warn(\`⚠️ [Config] Origine non reconnue: \${origin}. Fallback → http://localhost:5000\`);
    return "http://localhost:5000";
  }


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
      this.expandedSections = new Set();
      this.tableCache = new WeakMap();
      this.eventListeners = [];
      this.config = {
        hoverDelay: 300,
        hideDelay: 500,
        maxFileSize: 10 * 1024 * 1024,
        supportedFormats: [".xlsx", ".xls", ".csv"],
      };
    }

    init() {
      if (this.initialized) return;
      console.log("🎯 Initialisation du menu contextuel ClaraVerse v9 - Accordéon");
      this.createMenuElement();
      this.attachEventListeners();
      this.observeNewTables();
      this.processExistingTables();
      this.initSyncWithDev();
      this.initialized = true;
      console.log("✅ Menu contextuel initialisé avec succès");
    }

    getMenuSections() {
      return [
        {
          id: "edition", title: "Édition des cellules", icon: "✏️",
          items: [
            { text: "Activer édition", action: () => this.enableCellEditing(), shortcut: "Ctrl+E" },
            { text: "Désactiver édition", action: () => this.disableCellEditing() }
          ]
        },
        {
          id: "lignes", title: "Lignes", icon: "📋",
          items: [
            { text: "Insérer ligne", action: () => this.insertRowBelow(), shortcut: "Ctrl+Shift+↓" },
            { text: "Dupliquer ligne", action: () => this.duplicateSelectedRow(), shortcut: "Ctrl+D" },
            { text: "Supprimer ligne", action: () => this.deleteSelectedRow() },
            { text: "Effacer contenu toutes lignes", action: () => this.clearAllRowsContent() },
            { text: "📋 Coller depuis Excel", action: () => this.pasteFromExcel(), shortcut: "Ctrl+V" },
            { text: "📄 Copier Table (remplacer)", action: () => this.replaceTableFromExcel(), shortcut: "Ctrl+Shift+V" }
          ]
        },
        {
          id: "colonnes", title: "Colonnes", icon: "📊",
          items: [
            { text: "Insérer colonne", action: () => this.insertColumnRight(), shortcut: "Ctrl+Shift+→" },
            { text: "Dupliquer colonne", action: () => this.duplicateSelectedColumn() },
            { text: "Vider cellules colonne", action: () => this.clearColumnContent() },
            { text: "Ajouter colonne CTR", action: () => this.addCTRColumns() },
            { text: "📋 Ajouter colonnes de pointage", action: () => this.addPointageColumns() },
            { text: "Supprimer colonne", action: () => this.deleteSelectedColumn() }
          ]
        },
        {
          id: "arithmetique", title: "Arithmétique", icon: "🔢",
          items: [
            { text: "Validation (C=A+B, Écart=C-D)", action: () => this.executeValidation(), shortcut: "Ctrl+1" },
            { text: "Mouvement (D=A+B-C, Écart=D-E)", action: () => this.executeMouvement(), shortcut: "Ctrl+2" },
            { text: "Rapprochement (C=A-B, Écart=C)", action: () => this.executeRapprochement(), shortcut: "Ctrl+3" },
            { text: "Séparation (dates: C=A-B)", action: () => this.executeSeparation(), shortcut: "Ctrl+4" },
            { text: "Estimation (C=A*B, Écart=C-D)", action: () => this.executeEstimation(), shortcut: "Ctrl+5" }
          ]
        },
        {
          id: "risques", title: "Évaluation des risques", icon: "⚠️",
          items: [
            { text: "Calculer criticité (matrice)", action: () => this.executeRiskEvaluation(), shortcut: "Ctrl+R" },
            { text: "Appliquer couleurs risques", action: () => this.applyRiskColors() },
            { text: "Ajouter colonnes risques", action: () => this.addRiskColumns() },
            { text: "─────────────────────", action: null },
            { text: "📊 Matrice Alpha 3 niveaux", action: () => this.convertToMatrixAlpha3() },
            { text: "📊 Matrice Alpha 5 niveaux", action: () => this.convertToMatrixAlpha5() },
            { text: "📊 Matrice Alpha 4 niveaux", action: () => this.convertToMatrixAlpha4() },
            { text: "─────────────────────", action: null },
            { text: "🔢 Matrice Num 3 niveaux", action: () => this.convertToMatrixNum3() },
            { text: "🔢 Matrice Num 4 niveaux", action: () => this.convertToMatrixNum4() },
            { text: "🔢 Matrice Num 5 niveaux", action: () => this.convertToMatrixNum5() }
          ]
        },
        {
          id: "tables", title: "Tables", icon: "🗃️",
          items: [
            { text: "📋 Créer ce tableau", action: () => this.createStandardMissionTable() },
            { text: "Insérer table en dessous", action: () => this.insertTableBelow() },
            { text: "📋 Copier table", action: () => this.copyTableToMemory(), shortcut: "Ctrl+C" },
            { text: "📄 Coller table", action: () => this.pasteTableFromMemory(), shortcut: "Ctrl+Shift+P" },
            { text: "Supprimer la table", action: () => this.deleteTable() }
          ]
        },
        {
          id: "excel", title: "Excel", icon: "📁",
          items: [
            { text: "Importer Excel standard", action: () => this.importExcel() },
            { text: "Importer Excel avec colonnes test", action: () => this.importExcelSheetTest() },
            { text: "Importer template (multi-onglets)", action: () => this.importExcelTemplate() },
            { text: "📥 Importer template Excel (1er onglet)", action: () => this.importTemplateExcelFirstSheet() },
            { text: "📊 Importer Excel intégralement", action: () => this.importExcelFullAccordion() },
            { text: "📄 Importer template Word", action: () => this.importTemplateWord() },
            { text: "Exporter Excel", action: () => this.exportExcel() },
            { text: "Exporter template Excel", action: () => this.exportTemplate() },
            { text: "Exporter template Word", action: () => this.exportTemplateWord() },
            { text: "Intégration Doc", action: () => this.integrationDoc() }
          ]
        },
        {
          id: "modelisation", title: "Modélisation Pandas", icon: "🐼",
          items: [
            { text: "Calcul des écarts", action: () => this.executePandasAgent(), shortcut: "Ctrl+P" },
            { text: "Modélisation tables", action: () => this.executeModelisation() },
            { text: "Modélisation table n8n", action: () => this.executeModelisationN8n(), shortcut: "Ctrl+M" },
            { text: "📊 Lead Balance", action: () => this.executeLeadBalance(), shortcut: "Ctrl+L" },
            { text: "📥 Export Lead Balance", action: () => this.exportLeadBalanceToExcel(), shortcut: "Ctrl+Shift+L" },
            { text: "📊 États Financiers SYSCOHADA", action: () => this.executeEtatsFinanciers(), shortcut: "Ctrl+F" },
            { text: "📋 Exporter Liasse Officielle", action: () => this.exporterLiasseOfficielle(), shortcut: "Ctrl+Shift+O" }
          ]
        },
        {
          id: "etats-financiers", title: "États Financiers SYSCOHADA", icon: "📈",
          items: [
            { text: "📊 Calculer États Financiers", action: () => this.executeEtatsFinanciers(), shortcut: "Ctrl+F" },
            { text: "📥 Importer Balance Excel", action: () => this.importBalanceExcel() },
            { text: "─────────────────────", action: null },
            { text: "📋 Afficher Bilan", action: () => this.showBilan() },
            { text: "📋 Afficher Compte de Résultat", action: () => this.showCompteResultat() },
            { text: "─────────────────────", action: null },
            { text: "📋 Exporter Liasse Officielle", action: () => this.exporterLiasseOfficielle(), shortcut: "Ctrl+Shift+O" }
          ]
        },
        {
          id: "echantillonnage", title: "Échantillonnage Audit", icon: "🎲",
          items: [
            { text: "🎲 Aléatoire simple", action: () => this.executeSampleRandom(), shortcut: "Ctrl+Shift+1" },
            { text: "📏 Systématique (intervalle)", action: () => this.executeSampleSystematic(), shortcut: "Ctrl+Shift+2" },
            { text: "💰 Monétaire (MUS)", action: () => this.executeSampleMonetary(), shortcut: "Ctrl+Shift+3" },
            { text: "📊 Stratifié", action: () => this.executeSampleStratified(), shortcut: "Ctrl+Shift+4" },
            { text: "📌 Enregistrements fixes", action: () => this.executeSampleFixed(), shortcut: "Ctrl+Shift+5" },
            { text: "🔄 Avec remise", action: () => this.executeSampleWithReplacement(), shortcut: "Ctrl+Shift+6" },
            { text: "📐 Calculer taille échantillon", action: () => this.calculateSampleSize(), shortcut: "Ctrl+Shift+S" }
          ]
        },
        {
          id: "analyse-fraude", title: "Analyse & Détection Fraude", icon: "🔍",
          items: [
            { text: "👥 Doublons (DUPLICATES)", action: () => this.analyzeDetectDuplicates() },
            { text: "🔢 Trous séquence (GAPS)", action: () => this.analyzeDetectGaps() },
            { text: "📊 Loi de Benford", action: () => this.analyzeBenford() },
            { text: "🎯 Seuils suspects", action: () => this.analyzeThreshold() },
            { text: "📅 Transactions week-end", action: () => this.analyzeWeekend() },
            { text: "🔵 Montants ronds", action: () => this.analyzeRoundAmounts() },
            { text: "📈 Valeurs aberrantes (Z-score)", action: () => this.analyzeOutliers() },
            { text: "📉 Changements brutaux", action: () => this.analyzePeriodChanges() }
          ]
        },
        {
          id: "rapports-audit", title: "Rapports d'Audit", icon: "📝",
          items: [
            { text: "📄 Export Synthèse FRAP", action: () => this.exportAuditReport('synthese_frap') },
            { text: "📑 Export Rapport Provisoire", action: () => this.exportAuditReport('rapport_provisoire') },
            { text: "📖 Export Rapport Final", action: () => this.exportAuditReport('rapport_final') },
            { text: "📝 Export FRAP Individuelle", action: () => this.exportFrapIndividuelle(), shortcut: "Ctrl+Shift+F" }
          ]
        },
        {
          id: "rapports-cac", title: "Rapports CAC & Expert-Comptable", icon: "🎓",
          items: [
            { text: "📊 Export Synthèse CAC (FRAP + Recos Révision + Recos CI)", action: () => this.exportSyntheseCAC(), shortcut: "Ctrl+Shift+C" }
          ]
        },
        {
          id: "papier-travail", title: "Papier de travail", icon: "📁",
          items: [
            { text: "📤 Importer X-Ref documentaire", action: () => this.importerXRefDocumentaire(), shortcut: "Ctrl+Shift+X" },
            { text: "📂 Ouvrir X-Ref documentaire", action: () => this.ouvrirXRefDocumentaire(), shortcut: "Ctrl+Shift+O" },
            { text: "📋 Afficher X-Ref documentaire", action: () => this.afficherXRefDocumentaire() },
            { text: "🔍 Rechercher document", action: () => this.rechercherDocument() }
          ]
        }
      ];
    }

    createMenuElement() {
      this.menuElement = document.createElement("div");
      this.menuElement.id = "contextual-table-menu-advanced";
      this.menuElement.className = "contextual-menu-accordion";
      this.menuElement.style.cssText = `
        position: fixed;
        background: #ffffff;
        border: 1px solid #380101;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(56, 1, 1, 0.3), 0 0 40px rgba(56, 1, 1, 0.1);
        padding: 0;
        z-index: 15000;
        display: none;
        min-width: 280px;
        max-width: 320px;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
      `;

      const header = document.createElement("div");
      header.className = "menu-header";
      header.style.cssText = `
        background: #380101;
        padding: 14px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #2A0101;
        border-radius: 15px 15px 0 0;
      `;
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 16px;">▶</span>
          <span style="color: white; font-weight: 600; font-size: 15px;">Menu Table</span>
        </div>
        <button class="menu-close-btn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; line-height: 1; opacity: 0.8;">×</button>
      `;
      this.menuElement.appendChild(header);

      const sectionsContainer = document.createElement("div");
      sectionsContainer.className = "menu-sections-container";
      sectionsContainer.style.cssText = `max-height: 450px; overflow-y: auto; padding: 8px 0; background: #ffffff;`;

      this.getMenuSections().forEach(section => {
        sectionsContainer.appendChild(this.createAccordionSection(section));
      });

      this.menuElement.appendChild(sectionsContainer);
      this.setupMenuEventHandlers();
      document.body.appendChild(this.menuElement);
    }

    createAccordionSection(section) {
      const wrapper = document.createElement("div");
      wrapper.className = "accordion-section";
      wrapper.dataset.sectionId = section.id;

      const header = document.createElement("div");
      header.className = "accordion-header";
      header.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; cursor: pointer; transition: all 0.2s ease; border-left: 3px solid transparent; margin: 2px 8px; border-radius: 8px;`;
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 16px; opacity: 0.9;">${section.icon}</span>
          <span style="color: #555; font-weight: 500; font-size: 14px;">${section.title}</span>
        </div>
        <span class="accordion-arrow" style="color: #380101; font-size: 12px; transition: transform 0.3s ease;">›</span>
      `;

      header.addEventListener("mouseenter", () => {
        if (!this.expandedSections.has(section.id)) {
          header.style.background = "rgba(56, 1, 1, 0.08)";
          header.style.borderLeftColor = "rgba(56, 1, 1, 0.5)";
        }
      });
      header.addEventListener("mouseleave", () => {
        if (!this.expandedSections.has(section.id)) {
          header.style.background = "transparent";
          header.style.borderLeftColor = "transparent";
        }
      });

      const content = document.createElement("div");
      content.className = "accordion-content";
      content.style.cssText = `max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; background: rgba(56, 1, 1, 0.05); margin: 0 8px; border-radius: 0 0 8px 8px;`;

      section.items.forEach(item => content.appendChild(this.createMenuItem(item)));

      header.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleSection(section.id, header, content);
      });

      wrapper.appendChild(header);
      wrapper.appendChild(content);
      return wrapper;
    }

    createMenuItem(item) {
      // Gérer les séparateurs
      if (!item.action && item.text.includes('─')) {
        const separator = document.createElement("div");
        separator.className = "accordion-separator";
        separator.style.cssText = `
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(56, 1, 1, 0.2), transparent);
          margin: 8px 18px;
        `;
        return separator;
      }

      const menuItem = document.createElement("div");
      menuItem.className = "accordion-item";
      menuItem.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 10px 18px 10px 44px; cursor: pointer; transition: all 0.2s ease; color: #666; font-size: 13px;`;
      menuItem.innerHTML = `<span>${item.text}</span>${item.shortcut ? `<span style="font-size: 11px; color: #888; background: rgba(56, 1, 1, 0.1); padding: 2px 6px; border-radius: 4px;">${item.shortcut}</span>` : ''}`;

      menuItem.addEventListener("mouseenter", () => { menuItem.style.background = "rgba(56, 1, 1, 0.15)"; menuItem.style.color = "#1A0000"; });
      menuItem.addEventListener("mouseleave", () => { menuItem.style.background = "transparent"; menuItem.style.color = "#666"; });
      menuItem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (item.action) { try { item.action(); } catch (err) { this.showAlert(`❌ Erreur: ${err.message}`); } }
        this.hideMenu();
      });
      return menuItem;
    }

    toggleSection(sectionId, header, content) {
      const arrow = header.querySelector(".accordion-arrow");
      if (this.expandedSections.has(sectionId)) {
        this.expandedSections.delete(sectionId);
        content.style.maxHeight = "0";
        arrow.style.transform = "rotate(0deg)";
        header.style.background = "transparent";
        header.style.borderLeftColor = "transparent";
      } else {
        this.expandedSections.add(sectionId);
        content.style.maxHeight = content.scrollHeight + "px";
        arrow.style.transform = "rotate(90deg)";
        header.style.background = "rgba(56, 1, 1, 0.15)";
        header.style.borderLeftColor = "#380101";
      }
    }

    setupMenuEventHandlers() {
      const closeBtn = this.menuElement.querySelector(".menu-close-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => { e.stopPropagation(); this.hideMenu(); });
      }
      this.addEventListenerWithCleanup(this.menuElement, "mouseenter", () => { this.isHoveringMenu = true; this.clearHideTimeout(); });
      this.addEventListenerWithCleanup(this.menuElement, "mouseleave", () => { this.isHoveringMenu = false; this.scheduleHideMenu(); });
    }

    addEventListenerWithCleanup(element, event, handler) {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    }

    attachEventListeners() {
      this.addEventListenerWithCleanup(document, "mouseover", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) this.handleTableHover(e, table);
      });
      this.addEventListenerWithCleanup(document, "mouseout", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) this.handleTableLeave(e, table);
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
        if (cell && table && this.isTableInChat(table)) this.handleCellClick(e, cell, table);
        else if (this.isMenuVisible && !this.menuElement.contains(e.target)) this.hideMenu();
      });
      this.addEventListenerWithCleanup(document, "keydown", (e) => {
        if (e.key === "Escape" && this.isMenuVisible) this.hideMenu();
        if (e.ctrlKey && e.key === "e" && this.targetTable) { e.preventDefault(); this.enableCellEditing(); }
        if (e.ctrlKey && e.shiftKey && this.targetTable) {
          if (e.key === "ArrowDown") { e.preventDefault(); this.insertRowBelow(); }
          if (e.key === "ArrowRight") { e.preventDefault(); this.insertColumnRight(); }
        }
        if (e.ctrlKey && e.key === "p" && this.targetTable) { e.preventDefault(); this.executePandasAgent(); }
        if (e.ctrlKey && e.key === "m" && this.targetTable) { e.preventDefault(); this.executeModelisationN8n(); }
        if (e.ctrlKey && e.key === "l" && this.targetTable) { e.preventDefault(); this.executeLeadBalance(); }
        if (e.ctrlKey && e.shiftKey && e.key === "L" && this.targetTable) { e.preventDefault(); this.exportLeadBalanceToExcel(); }
        if (e.ctrlKey && e.key === "f" && this.targetTable) { e.preventDefault(); this.executeEtatsFinanciers(); }
        // Raccourcis arithmétiques Ctrl+1 à Ctrl+5
        if (e.ctrlKey && e.key === "1" && this.targetTable) { e.preventDefault(); this.executeValidation(); }
        if (e.ctrlKey && e.key === "2" && this.targetTable) { e.preventDefault(); this.executeMouvement(); }
        if (e.ctrlKey && e.key === "3" && this.targetTable) { e.preventDefault(); this.executeRapprochement(); }
        if (e.ctrlKey && e.key === "4" && this.targetTable) { e.preventDefault(); this.executeSeparation(); }
        if (e.ctrlKey && e.key === "5" && this.targetTable) { e.preventDefault(); this.executeEstimation(); }
        if (e.ctrlKey && e.key === "r" && this.targetTable) { e.preventDefault(); this.executeRiskEvaluation(); }
        // Raccourci Ctrl+Shift+V pour remplacer la table depuis Excel
        if (e.ctrlKey && e.shiftKey && e.key === "V" && this.targetTable) { e.preventDefault(); this.replaceTableFromExcel(); }
        // Raccourci Ctrl+Shift+P pour coller la table copiée
        if (e.ctrlKey && e.shiftKey && e.key === "P" && this.targetTable) { e.preventDefault(); this.pasteTableFromMemory(); }
        // Raccourcis Échantillonnage Ctrl+Shift+1 à Ctrl+Shift+6 et Ctrl+Shift+S
        if (e.ctrlKey && e.shiftKey && e.key === "1" && this.targetTable) { e.preventDefault(); this.executeSampleRandom(); }
        if (e.ctrlKey && e.shiftKey && e.key === "2" && this.targetTable) { e.preventDefault(); this.executeSampleSystematic(); }
        if (e.ctrlKey && e.shiftKey && e.key === "3" && this.targetTable) { e.preventDefault(); this.executeSampleMonetary(); }
        if (e.ctrlKey && e.shiftKey && e.key === "4" && this.targetTable) { e.preventDefault(); this.executeSampleStratified(); }
        if (e.ctrlKey && e.shiftKey && e.key === "5" && this.targetTable) { e.preventDefault(); this.executeSampleFixed(); }
        if (e.ctrlKey && e.shiftKey && e.key === "6" && this.targetTable) { e.preventDefault(); this.executeSampleWithReplacement(); }
        if (e.ctrlKey && e.shiftKey && e.key === "S" && this.targetTable) { e.preventDefault(); this.calculateSampleSize(); }
        // Raccourci Export Rapport Audit
        if (e.ctrlKey && e.shiftKey && e.key === "R" && this.targetTable) { e.preventDefault(); this.exportAuditReport(); }
        // Raccourci Export FRAP Individuelle
        if (e.ctrlKey && e.shiftKey && e.key === "F" && this.targetTable) { e.preventDefault(); this.exportFrapIndividuelle(); }
        // Raccourci Export Synthèse CAC
        if (e.ctrlKey && e.shiftKey && e.key === "C" && this.targetTable) { e.preventDefault(); this.exportSyntheseCAC(); }
      });
    }

    handleCellClick(e, cell, table) {
      if (this.activeCell) this.activeCell.classList.remove("contextual-active-cell");
      this.activeCell = cell;
      this.targetTable = table;
      cell.classList.add("contextual-active-cell");
      this.injectActiveStyles();
      this.calculateCellPosition(cell, table);
    }

    injectActiveStyles() {
      if (!document.getElementById("contextual-cell-styles-advanced")) {
        const style = document.createElement("style");
        style.id = "contextual-cell-styles-advanced";
        style.textContent = `.contextual-active-cell { background: linear-gradient(135deg, #e3f2fd, #f0f8ff) !important; outline: 2px solid #2196f3 !important; outline-offset: -2px !important; }
        .menu-sections-container::-webkit-scrollbar { width: 6px; }
        .menu-sections-container::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .menu-sections-container::-webkit-scrollbar-thumb { background: rgba(220, 53, 69, 0.5); border-radius: 3px; }`;
        document.head.appendChild(style);
      }
    }

    calculateCellPosition(cell, table) {
      const row = cell.parentNode;
      const rows = Array.from(table.querySelectorAll("tr"));
      const cells = Array.from(row.querySelectorAll("td, th"));
      this.activeCellPosition = { row: rows.indexOf(row), col: cells.indexOf(cell) };
    }

    validateActiveCell() {
      if (!this.targetTable || this.activeCellPosition.row === -1) {
        this.showAlert("⚠️ Aucune cellule sélectionnée. Cliquez d'abord sur une cellule.");
        return false;
      }
      return true;
    }

    // === ACTIONS LIGNES ===
    insertRowBelow() {
      if (!this.validateActiveCell()) return;
      const rows = this.targetTable.querySelectorAll("tr");
      const targetRow = rows[this.activeCellPosition.row];
      if (!targetRow) return;
      const numCols = targetRow.querySelectorAll("td, th").length;
      const newRow = document.createElement("tr");
      for (let i = 0; i < numCols; i++) {
        const td = document.createElement("td");
        td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: #fafafa;";
        this.makeCellEditable(td);
        newRow.appendChild(td);
      }
      targetRow.parentNode.insertBefore(newRow, targetRow.nextSibling);
      this.showQuickNotification("✅ Ligne ajoutée");
      this.notifyTableStructureChange("row_added", { rowIndex: this.activeCellPosition.row + 1 });
      this.syncWithDev();
    }

    deleteSelectedRow() {
      if (!this.validateActiveCell()) return;
      const rows = this.targetTable.querySelectorAll("tr");
      if (rows.length <= 1) { this.showAlert("⚠️ La table doit avoir au moins une ligne."); return; }
      if (confirm("Supprimer cette ligne ?")) {
        rows[this.activeCellPosition.row].remove();
        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };
        this.showQuickNotification("✅ Ligne supprimée");
        this.notifyTableStructureChange("row_deleted", {});
        this.syncWithDev();
      }
    }

    duplicateSelectedRow() {
      if (!this.validateActiveCell()) return;
      const rows = this.targetTable.querySelectorAll("tr");
      const targetRow = rows[this.activeCellPosition.row];
      if (!targetRow) return;
      const clonedRow = targetRow.cloneNode(true);
      clonedRow.querySelectorAll("td").forEach(cell => this.makeCellEditable(cell));
      targetRow.parentNode.insertBefore(clonedRow, targetRow.nextSibling);
      this.showQuickNotification("✅ Ligne dupliquée");
      this.notifyTableStructureChange("row_duplicated", { rowIndex: this.activeCellPosition.row });
      this.syncWithDev();
    }

    clearAllRowsContent() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      if (confirm("Effacer le contenu de toutes les lignes (hors en-têtes) ?")) {
        const tbody = this.targetTable.querySelector("tbody");
        const rows = tbody ? tbody.querySelectorAll("tr") : this.targetTable.querySelectorAll("tr:not(:first-child)");
        rows.forEach(row => {
          row.querySelectorAll("td").forEach(cell => { cell.textContent = ""; });
        });
        this.showQuickNotification("✅ Contenu des lignes effacé");
        this.notifyTableStructureChange("rows_cleared", {});
        this.syncWithDev();
      }
    }

    // === COLLER DEPUIS EXCEL ===
    /**
     * Coller des données depuis le presse-papiers (Excel/tableur) dans la table active
     * Les données sont collées à partir de la cellule active
     */
    async pasteFromExcel() {
      if (!this.targetTable) {
        this.showQuickNotification("⚠️ Aucune table sélectionnée");
        return;
      }

      try {
        // Vérifier si le presse-papiers est accessible
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          console.error("❌ Le presse-papiers n'est pas accessible");
          this.showQuickNotification("❌ Presse-papiers non accessible");
          return;
        }

        // Lire le contenu du presse-papiers
        const clipboardText = await navigator.clipboard.readText();

        if (!clipboardText || clipboardText.trim() === "") {
          this.showQuickNotification("⚠️ Le presse-papiers est vide");
          return;
        }

        console.log("📋 [Paste Excel] Contenu du presse-papiers:", clipboardText.substring(0, 200) + "...");

        // Parser les données tabulaires (séparées par tabulations et retours à la ligne)
        const parsedData = this.parseClipboardData(clipboardText);

        if (parsedData.length === 0) {
          this.showQuickNotification("⚠️ Aucune donnée tabulaire détectée");
          return;
        }

        console.log(`📊 [Paste Excel] Données parsées: ${parsedData.length} ligne(s), ${parsedData[0]?.length || 0} colonne(s)`);

        // Déterminer la position de départ
        let startRow = this.activeCellPosition.row >= 0 ? this.activeCellPosition.row : 1;
        let startCol = this.activeCellPosition.col >= 0 ? this.activeCellPosition.col : 0;

        // Si on est sur l'en-tête, commencer à la première ligne de données
        if (startRow === 0) startRow = 1;

        console.log(`🎯 [Paste Excel] Position de départ: ligne ${startRow}, colonne ${startCol}`);

        // Coller les données dans la table
        const result = this.insertClipboardDataIntoTable(parsedData, startRow, startCol);

        if (result.success) {
          this.showQuickNotification(`✅ ${result.cellsUpdated} cellule(s) collée(s), ${result.rowsInserted} ligne(s) ajoutée(s)`);
          this.notifyTableStructureChange("excel_paste", { cellsUpdated: result.cellsUpdated, rowsInserted: result.rowsInserted });
          this.syncWithDev();
        }

      } catch (error) {
        console.error("❌ [Paste Excel] Erreur:", error);

        if (error.name === "NotAllowedError") {
          console.warn("❌ Permission refusée pour le presse-papiers");
          this.showQuickNotification("❌ Permission presse-papiers refusée");
        } else {
          console.error(`❌ Erreur: ${error.message}`);
          this.showQuickNotification(`❌ Erreur: ${error.message}`);
        }
      }
    }

    /**
     * Parser les données du presse-papiers (format Excel/tableur)
     */
    parseClipboardData(text) {
      if (!text) return [];

      // Normaliser les retours à la ligne
      const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalizedText.split('\n');
      const data = [];

      for (const line of lines) {
        if (line.trim() === '' && data.length > 0) continue;
        const cells = line.split('\t').map(cell => cell.trim());
        if (cells.some(cell => cell !== '')) {
          data.push(cells);
        }
      }

      return data;
    }

    /**
     * Insérer les données du presse-papiers dans la table
     */
    insertClipboardDataIntoTable(data, startRow, startCol) {
      if (!this.targetTable || !data || data.length === 0) {
        return { success: false, rowsInserted: 0, cellsUpdated: 0 };
      }

      let rowsInserted = 0;
      let cellsUpdated = 0;

      // Obtenir le tbody
      let tbody = this.targetTable.querySelector('tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        this.targetTable.appendChild(tbody);
      }

      // Obtenir toutes les lignes
      const allRows = Array.from(this.targetTable.querySelectorAll('tr'));
      const headerRow = this.targetTable.querySelector('thead tr') || allRows[0];
      const numCols = headerRow ? headerRow.querySelectorAll('th, td').length : data[0].length;

      // Parcourir les données à coller
      data.forEach((rowData, dataRowIndex) => {
        const targetRowIndex = startRow + dataRowIndex;
        let targetRow = allRows[targetRowIndex];

        if (!targetRow) {
          // Créer une nouvelle ligne
          targetRow = document.createElement('tr');
          for (let i = 0; i < numCols; i++) {
            const td = document.createElement('td');
            td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: white;";
            this.makeCellEditable(td);
            targetRow.appendChild(td);
          }
          tbody.appendChild(targetRow);
          allRows.push(targetRow);
          rowsInserted++;
        }

        // Obtenir les cellules de la ligne cible
        const targetCells = targetRow.querySelectorAll('td');

        // Coller les données
        rowData.forEach((cellValue, dataColIndex) => {
          const targetColIndex = startCol + dataColIndex;
          if (targetColIndex < targetCells.length) {
            const targetCell = targetCells[targetColIndex];
            if (targetCell) {
              targetCell.textContent = cellValue;
              targetCell.style.backgroundColor = '#e8f5e9';
              if (!targetCell.hasAttribute('contenteditable')) {
                this.makeCellEditable(targetCell);
              }
              cellsUpdated++;
            }
          }
        });
      });

      // Réinitialiser les couleurs après un délai
      setTimeout(() => {
        this.targetTable.querySelectorAll('td').forEach(cell => {
          if (cell.style.backgroundColor === 'rgb(232, 245, 233)') {
            cell.style.backgroundColor = 'white';
          }
        });
      }, 2000);

      console.log(`✅ [Paste Excel] Collage terminé: ${cellsUpdated} cellules, ${rowsInserted} lignes ajoutées`);
      return { success: true, rowsInserted, cellsUpdated };
    }

    // === COPIER TABLE (REMPLACER INTÉGRALEMENT) ===
    /**
     * Remplacer intégralement la table active avec les données copiées depuis Excel
     * Inclut l'en-tête du tableau
     */
    async replaceTableFromExcel() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée. Cliquez d'abord sur une table.");
        return;
      }

      try {
        // Vérifier si le presse-papiers est accessible
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          console.error("❌ Le presse-papiers n'est pas accessible dans ce navigateur");
          this.showQuickNotification("❌ Presse-papiers non accessible");
          return;
        }

        // Lire le contenu du presse-papiers
        const clipboardText = await navigator.clipboard.readText();

        if (!clipboardText || clipboardText.trim() === "") {
          this.showQuickNotification("⚠️ Le presse-papiers est vide");
          return;
        }

        console.log("📄 [Replace Table] Contenu du presse-papiers:", clipboardText.substring(0, 200) + "...");

        // Parser les données tabulaires
        const parsedData = this.parseClipboardData(clipboardText);

        if (parsedData.length === 0) {
          this.showQuickNotification("⚠️ Aucune donnée tabulaire détectée");
          return;
        }

        if (parsedData.length < 2) {
          this.showQuickNotification("⚠️ Données insuffisantes (en-tête + données requis)");
          return;
        }

        console.log(`📊 [Replace Table] Données parsées: ${parsedData.length} ligne(s), ${parsedData[0]?.length || 0} colonne(s)`);

        // Remplacer la table directement sans confirmation
        const result = this.replaceEntireTable(parsedData);

        if (result.success) {
          this.showQuickNotification(`✅ Table remplacée: ${result.columns} colonnes, ${result.rows} lignes`);
          this.notifyTableStructureChange("table_replaced", { columns: result.columns, rows: result.rows });
          this.syncWithDev();
        }

      } catch (error) {
        console.error("❌ [Replace Table] Erreur:", error);

        if (error.name === "NotAllowedError") {
          console.warn("❌ Permission refusée pour le presse-papiers");
          this.showQuickNotification("❌ Permission presse-papiers refusée");
        } else {
          console.error(`❌ Erreur: ${error.message}`);
          this.showQuickNotification(`❌ Erreur: ${error.message}`);
        }
      }
    }

    /**
     * Remplacer entièrement le contenu de la table avec les nouvelles données
     * @param {Array<Array<string>>} data - Données incluant l'en-tête en première ligne
     */
    replaceEntireTable(data) {
      if (!this.targetTable || !data || data.length < 1) {
        return { success: false, columns: 0, rows: 0 };
      }

      // Sauvegarder les classes CSS de la table
      const tableClasses = this.targetTable.className;
      const tableStyle = this.targetTable.style.cssText;

      // Vider la table
      this.targetTable.innerHTML = "";

      // Extraire l'en-tête (première ligne) et les données
      const headers = data[0];
      const rowsData = data.slice(1);

      // Créer le thead avec les en-têtes
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText || "";
        th.style.cssText = "border: 1px solid #d1d5db; padding: 12px 16px; background: #f8f9fa; font-weight: 600; text-align: left;";
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      this.targetTable.appendChild(thead);

      // Créer le tbody avec les données
      const tbody = document.createElement("tbody");

      rowsData.forEach(rowData => {
        const tr = document.createElement("tr");

        // S'assurer que chaque ligne a le même nombre de cellules que l'en-tête
        for (let i = 0; i < headers.length; i++) {
          const td = document.createElement("td");
          td.textContent = rowData[i] !== undefined ? rowData[i] : "";
          td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: white;";
          this.makeCellEditable(td);
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      });

      this.targetTable.appendChild(tbody);

      // Restaurer les classes CSS
      this.targetTable.className = tableClasses;
      if (tableStyle) {
        this.targetTable.style.cssText = tableStyle;
      }

      // Effet visuel temporaire
      this.targetTable.style.outline = "3px solid #28a745";
      setTimeout(() => {
        this.targetTable.style.outline = "";
      }, 2000);

      console.log(`✅ [Replace Table] Table remplacée: ${headers.length} colonnes, ${rowsData.length} lignes`);

      return {
        success: true,
        columns: headers.length,
        rows: rowsData.length
      };
    }

    // === ACTIONS COLONNES ===
    insertColumnRight() {
      if (!this.validateActiveCell()) return;
      const colIdx = this.activeCellPosition.col;
      Array.from(this.targetTable.querySelectorAll("tr")).forEach((row, i) => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        const newCell = document.createElement(i === 0 ? "th" : "td");
        newCell.textContent = i === 0 ? "Nouvelle colonne" : "";
        newCell.style.cssText = `border: 1px solid #d1d5db; padding: 8px 12px; background: ${i === 0 ? "#f9fafb" : "#fafafa"}; font-weight: ${i === 0 ? "bold" : "normal"};`;
        if (i > 0) this.makeCellEditable(newCell);
        row.insertBefore(newCell, cells[colIdx + 1] || null);
      });
      this.showQuickNotification("✅ Colonne ajoutée");
      this.notifyTableStructureChange("column_added", { columnIndex: colIdx + 1 });
      this.syncWithDev();
    }

    deleteSelectedColumn() {
      if (!this.validateActiveCell()) return;
      const headerCells = this.targetTable.querySelector("tr")?.querySelectorAll("td, th") || [];
      if (headerCells.length <= 1) { this.showAlert("⚠️ La table doit avoir au moins une colonne."); return; }
      if (confirm("Supprimer cette colonne ?")) {
        const colIdx = this.activeCellPosition.col;
        Array.from(this.targetTable.querySelectorAll("tr")).forEach(row => {
          const cells = Array.from(row.querySelectorAll("td, th"));
          if (cells[colIdx]) cells[colIdx].remove();
        });
        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };
        this.showQuickNotification("✅ Colonne supprimée");
        this.notifyTableStructureChange("column_deleted", {});
        this.syncWithDev();
      }
    }

    duplicateSelectedColumn() {
      if (!this.validateActiveCell()) return;
      const colIdx = this.activeCellPosition.col;
      Array.from(this.targetTable.querySelectorAll("tr")).forEach((row, i) => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        const sourceCell = cells[colIdx];
        if (sourceCell) {
          const newCell = sourceCell.cloneNode(true);
          if (i > 0 && newCell.tagName === "TD") this.makeCellEditable(newCell);
          row.insertBefore(newCell, sourceCell.nextSibling);
        }
      });
      this.showQuickNotification("✅ Colonne dupliquée");
      this.notifyTableStructureChange("column_duplicated", { columnIndex: colIdx });
      this.syncWithDev();
    }

    clearColumnContent() {
      if (!this.validateActiveCell()) return;
      const colIdx = this.activeCellPosition.col;
      const tbody = this.targetTable.querySelector("tbody");
      const rows = tbody ? tbody.querySelectorAll("tr") : this.targetTable.querySelectorAll("tr:not(:first-child)");
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells[colIdx]) cells[colIdx].textContent = "";
      });
      this.showQuickNotification("✅ Contenu de la colonne effacé");
      this.notifyTableStructureChange("column_cleared", { columnIndex: colIdx });
      this.syncWithDev();
    }

    addCTRColumns() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }

      // Trouver le prochain numéro CTR et la position de la dernière colonne CTR
      const headerRow = this.targetTable.querySelector("tr");
      const headerCells = headerRow ? Array.from(headerRow.querySelectorAll("th, td")) : [];
      let maxCTR = 0;
      let lastCTRIndex = -1; // Index de la dernière colonne CTR

      headerCells.forEach((cell, index) => {
        const match = cell.textContent.trim().match(/^CTR\s*(\d+)$/i);
        if (match) {
          const ctrNum = parseInt(match[1], 10);
          if (ctrNum >= maxCTR) {
            maxCTR = ctrNum;
            lastCTRIndex = index;
          }
        }
      });

      const nextCTR = maxCTR + 1;
      const colName = `CTR ${nextCTR}`;
      // Position d'insertion : juste après la dernière CTR, ou à la fin si aucune CTR
      const insertPosition = lastCTRIndex >= 0 ? lastCTRIndex + 1 : headerCells.length;

      const ctrOptions = ["", "Oui", "Non", "N/A", "En cours", "À vérifier"];

      Array.from(this.targetTable.querySelectorAll("tr")).forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll("th, td"));
        const referenceCell = cells[insertPosition] || null; // Cellule de référence pour insertBefore

        if (rowIndex === 0) {
          // En-tête
          const th = document.createElement("th");
          th.textContent = colName;
          th.style.cssText = "border: 1px solid #d1d5db; padding: 12px 16px; background: linear-gradient(135deg, #e8f5e9, #c8e6c9); font-weight: 600;";
          if (referenceCell) {
            row.insertBefore(th, referenceCell);
          } else {
            row.appendChild(th);
          }
        } else {
          // Cellule avec menu déroulant
          const td = document.createElement("td");
          td.style.cssText = "border: 1px solid #d1d5db; padding: 4px 8px; background: white;";
          const select = document.createElement("select");
          select.style.cssText = "width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer;";
          ctrOptions.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt || "-- Sélectionner --";
            select.appendChild(option);
          });
          select.addEventListener("change", () => {
            this.notifyTableStructureChange("ctr_changed", { value: select.value });
            this.syncWithDev();
          });
          td.appendChild(select);
          if (referenceCell) {
            row.insertBefore(td, referenceCell);
          } else {
            row.appendChild(td);
          }
        }
      });
      this.showQuickNotification(`✅ Colonne ${colName} ajoutée`);
      this.notifyTableStructureChange("ctr_column_added", { columnName: colName });
      this.syncWithDev();
    }

    // Ajouter colonnes de pointage (CTR 1, CTR 2, CTR 3, Description, Conclusion)
    addPointageColumns() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }

      // Options pour les menus déroulants CTR et Conclusion
      const ctrOptions = ["", "Oui", "Non", "N/A", "En cours", "À vérifier"];
      const conclusionOptions = ["", "Conforme", "Non conforme", "À améliorer", "Sans objet", "En attente"];

      // Définition des colonnes à ajouter
      const columnsToAdd = [
        { name: "CTR 1", type: "dropdown", options: ctrOptions, headerStyle: "background: linear-gradient(135deg, #e8f5e9, #c8e6c9);" },
        { name: "CTR 2", type: "dropdown", options: ctrOptions, headerStyle: "background: linear-gradient(135deg, #e8f5e9, #c8e6c9);" },
        { name: "CTR 3", type: "dropdown", options: ctrOptions, headerStyle: "background: linear-gradient(135deg, #e8f5e9, #c8e6c9);" },
        { name: "Description", type: "text", headerStyle: "background: linear-gradient(135deg, #fff3e0, #ffe0b2);" },
        { name: "Conclusion", type: "dropdown", options: conclusionOptions, headerStyle: "background: linear-gradient(135deg, #e3f2fd, #bbdefb);" }
      ];

      // Ajouter chaque colonne
      columnsToAdd.forEach(colDef => {
        Array.from(this.targetTable.querySelectorAll("tr")).forEach((row, rowIndex) => {
          if (rowIndex === 0) {
            // En-tête
            const th = document.createElement("th");
            th.textContent = colDef.name;
            th.style.cssText = `border: 1px solid #d1d5db; padding: 12px 16px; font-weight: 600; ${colDef.headerStyle}`;
            row.appendChild(th);
          } else {
            // Cellule de données
            const td = document.createElement("td");
            td.style.cssText = "border: 1px solid #d1d5db; padding: 4px 8px; background: white;";

            if (colDef.type === "dropdown") {
              // Menu déroulant
              const select = document.createElement("select");
              select.style.cssText = "width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer;";
              colDef.options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt || "-- Sélectionner --";
                select.appendChild(option);
              });
              select.addEventListener("change", () => {
                this.notifyTableStructureChange("pointage_changed", { column: colDef.name, value: select.value });
                this.syncWithDev();
              });
              td.appendChild(select);
            } else {
              // Cellule texte éditable
              td.contentEditable = true;
              td.setAttribute("data-editable", "true");
              td.addEventListener("blur", () => {
                this.notifyTableStructureChange("description_edited", { column: colDef.name, value: td.textContent });
                this.syncWithDev();
              });
            }
            row.appendChild(td);
          }
        });
      });

      this.showQuickNotification("✅ Colonnes de pointage ajoutées (CTR 1-3, Description, Conclusion)");
      this.notifyTableStructureChange("pointage_columns_added", { columns: columnsToAdd.map(c => c.name) });
      this.syncWithDev();
    }

    // === ÉDITION CELLULES ===
    enableCellEditing() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      this.targetTable.querySelectorAll("tbody td").forEach(cell => this.makeCellEditable(cell));
      this.addEditingIndicator(this.targetTable);
      this.showQuickNotification("✏️ Édition activée");
    }

    disableCellEditing() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      this.targetTable.querySelectorAll("td[contenteditable='true']").forEach(cell => {
        cell.contentEditable = false;
        cell.removeAttribute("data-editable");
      });
      this.removeEditingIndicator(this.targetTable);
      this.showQuickNotification("🔒 Édition désactivée");
    }

    addEditingIndicator(table) {
      if (table.querySelector(".editing-indicator")) return;
      const indicator = document.createElement("div");
      indicator.className = "editing-indicator";
      indicator.innerHTML = "✏️ Mode Édition";
      indicator.style.cssText = "position: absolute; top: -30px; right: 0; background: linear-gradient(135deg, #4caf50, #45a049); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; z-index: 1000;";
      if (getComputedStyle(table).position === "static") table.style.position = "relative";
      table.appendChild(indicator);
    }

    removeEditingIndicator(table) {
      const indicator = table.querySelector(".editing-indicator");
      if (indicator) indicator.remove();
    }

    makeCellEditable(cell) {
      cell.contentEditable = true;
      cell.setAttribute("data-editable", "true");
      this.addEventListenerWithCleanup(cell, "blur", () => this.saveCellData(cell));
      this.addEventListenerWithCleanup(cell, "keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); cell.blur(); } });
    }

    saveCellData(cell) {
      const table = cell.closest("table");
      if (table) {
        this.targetTable = table;
        this.notifyTableStructureChange("cell_edited", { cellContent: cell.textContent });
        this.syncWithDev();
      }
    }

    // === ACTIONS TABLES ===
    showArithmeticOptions() { this.showQuickNotification("🔢 Arithmétique - À venir"); }
    showRapprochementOptions() { this.showQuickNotification("🔗 Rapprochement - À venir"); }
    showMouvementOptions() { this.showQuickNotification("📈 Mouvement - À venir"); }
    executeModelisation() { this.showQuickNotification("🐼 Modélisation - À venir"); }

    // === ÉVALUATION DES RISQUES (MATRICE DE CRITICITÉ) ===

    /**
     * Configuration des patterns pour détecter les colonnes de risque
     */
    getRiskColumnPatterns() {
      return {
        probabilite: /probabilit[eé]|prob|obab/i,
        impact: /impact|mpa|impa/i,
        criticite: /criticit[eé]|ritici/i
      };
    }

    /**
     * Matrice de criticité 3x3
     * Probabilité x Impact = Criticité
     */
    getCriticityMatrix() {
      return {
        // [Probabilité][Impact] = Criticité
        'Faible': {
          'Faible': 'Faible',   // Cas 1
          'Moyen': 'Faible',    // Cas 3
          'Eleve': 'Moyen'      // Cas 6
        },
        'Moyen': {
          'Faible': 'Faible',   // Cas 2
          'Moyen': 'Moyen',     // Cas 5
          'Eleve': 'Eleve'      // Cas 8
        },
        'Eleve': {
          'Faible': 'Moyen',    // Cas 4
          'Moyen': 'Eleve',     // Cas 7
          'Eleve': 'Eleve'      // Cas 9
        }
      };
    }

    /**
     * Couleurs pour les niveaux de risque
     */
    getRiskColors() {
      return {
        'Faible': { bg: '#28a745', text: '#ffffff' },  // Vert
        'Moyen': { bg: '#ffc107', text: '#000000' },   // Jaune avec texte noir pour lisibilité
        'Eleve': { bg: '#dc3545', text: '#ffffff' }    // Rouge
      };
    }

    /**
     * Détecte si la valeur est une lettre seule (F, M, E)
     */
    isLetterFormat(value) {
      if (!value) return false;
      const v = String(value).trim().toLowerCase();
      return v.length === 1 && ['f', 'm', 'e'].includes(v);
    }

    /**
     * Normalise une valeur de risque (F/M/E ou Faible/Moyen/Eleve)
     * Retourne un objet avec le niveau normalisé et le format détecté
     */
    normalizeRiskValueWithFormat(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();

      // Déterminer si c'est une lettre seule
      const isLetter = v.length === 1;

      // Correspondances exactes d'abord (priorité)
      if (v === 'f') return { level: 'Faible', isLetter: true };
      if (v === 'm') return { level: 'Moyen', isLetter: true };
      if (v === 'e' || v === 'é') return { level: 'Eleve', isLetter: true };
      if (v === 'h') return { level: 'Eleve', isLetter: true };  // High

      // Mots complets
      if (v === 'faible' || v === 'low' || v === 'bas') return { level: 'Faible', isLetter: false };
      if (v === 'moyen' || v === 'medium' || v === 'mod' || v === 'modéré') return { level: 'Moyen', isLetter: false };
      if (v === 'eleve' || v === 'élevé' || v === 'elevé' || v === 'high' || v === 'haut') return { level: 'Eleve', isLetter: false };

      // Recherche de mots-clés partiels (contient)
      if (v.includes('faible') || v.includes('low') || v.includes('bas')) return { level: 'Faible', isLetter: false };
      if (v.includes('moyen') || v.includes('medium') || v.includes('modéré')) return { level: 'Moyen', isLetter: false };
      if (v.includes('eleve') || v.includes('élevé') || v.includes('elevé') || v.includes('high') || v.includes('haut')) return { level: 'Eleve', isLetter: false };

      // Recherche de la lettre seule dans la chaîne (f, m, e)
      const hasF = v.includes('f');
      const hasM = v.includes('m');
      const hasE = v.includes('e');

      // Si une seule lettre indicatrice est trouvée
      if (hasF && !hasM && !hasE) return { level: 'Faible', isLetter: isLetter };
      if (hasM && !hasF) return { level: 'Moyen', isLetter: isLetter };
      if (hasE && !hasF && !hasM) return { level: 'Eleve', isLetter: isLetter };

      // Dernier recours: première lettre
      const firstChar = v.charAt(0);
      if (firstChar === 'f') return { level: 'Faible', isLetter: isLetter };
      if (firstChar === 'm') return { level: 'Moyen', isLetter: isLetter };
      if (firstChar === 'e' || firstChar === 'é') return { level: 'Eleve', isLetter: isLetter };
      if (firstChar === 'h') return { level: 'Eleve', isLetter: isLetter };
      if (firstChar === 'l') return { level: 'Faible', isLetter: isLetter };
      if (firstChar === 'b') return { level: 'Faible', isLetter: isLetter };

      return null;
    }

    /**
     * Normalise une valeur de risque - version simple retournant juste le niveau
     */
    normalizeRiskValue(value) {
      const result = this.normalizeRiskValueWithFormat(value);
      return result ? result.level : null;
    }

    /**
     * Convertit un niveau normalisé vers le format souhaité (lettre ou mot)
     */
    formatCriticity(level, useLetter) {
      if (!level) return null;

      if (useLetter) {
        // Format lettre seule
        if (level === 'Faible') return 'F';
        if (level === 'Moyen') return 'M';
        if (level === 'Eleve') return 'E';
      }
      // Format mot complet
      return level;
    }

    /**
     * Trouve les index des colonnes de risque dans la table
     */
    findRiskColumnIndexes(headers) {
      const patterns = this.getRiskColumnPatterns();
      const indexes = {
        probabilite: -1,
        impact: -1,
        criticite: -1
      };

      headers.forEach((header, index) => {
        const h = header.toLowerCase().trim();
        if (patterns.probabilite.test(h)) indexes.probabilite = index;
        if (patterns.impact.test(h)) indexes.impact = index;
        if (patterns.criticite.test(h)) indexes.criticite = index;
      });

      return indexes;
    }

    /**
     * Calcule la criticité selon la matrice avec détection du format
     * Retourne la criticité dans le même format que les entrées
     */
    /**
     * Calcule la criticité avec détection automatique du type de matrice
     */
    calculateCriticityWithFormat(probabilite, impact) {
      // Détecter le type de matrice en fonction des valeurs
      const probStr = String(probabilite).trim().toLowerCase();
      const impactStr = String(impact).trim().toLowerCase();
      
      // Essayer de parser comme nombre
      const probNum = parseFloat(probStr);
      const impactNum = parseFloat(impactStr);
      
      // 1. MATRICES NUMÉRIQUES (priorité si les deux sont des nombres)
      if (!isNaN(probNum) && !isNaN(impactNum)) {
        return this.calculateNumericCriticity(probNum, impactNum);
      }
      
      // 2. MATRICE ALPHA-5 (détecter "très" en premier)
      if (probStr.includes('tres') || impactStr.includes('tres') || 
          probStr.includes('très') || impactStr.includes('très')) {
        return this.calculateAlpha5Criticity(probabilite, impact);
      }
      
      // 3. MATRICE ALPHA-4 (détecter termes spécifiques)
      if (probStr.includes('mineur') || probStr.includes('significatif') || 
          probStr.includes('majeur') || probStr.includes('critique') ||
          impactStr.includes('mineur') || impactStr.includes('significatif') || 
          impactStr.includes('majeur') || impactStr.includes('critique')) {
        return this.calculateAlpha4Criticity(probabilite, impact);
      }
      
      // 4. MATRICE ALPHA-3 (par défaut)
      return this.calculateAlpha3Criticity(probabilite, impact);
    }
    
    /**
     * Calcule la criticité pour matrices numériques (3x3, 4x4, 5x5)
     */
    calculateNumericCriticity(prob, impact) {
      const probRounded = Math.round(prob);
      const impactRounded = Math.round(impact);
      
      // Déterminer le type de matrice
      const maxVal = Math.max(probRounded, impactRounded);
      let matrix, colors;
      
      if (maxVal <= 3) {
        // Matrice 3x3
        matrix = this.getMatrixNum3();
        colors = this.getColorsNumeric(9);
      } else if (maxVal <= 4) {
        // Matrice 4x4
        matrix = this.getMatrixNum4();
        colors = this.getColorsNumeric(16);
      } else {
        // Matrice 5x5
        matrix = this.getMatrixNum5();
        colors = this.getColorsNumeric(25);
      }
      
      const criticite = matrix[probRounded]?.[impactRounded];
      if (!criticite) return null;
      
      return {
        level: criticite,
        formatted: criticite,
        isLetter: false,
        isNumeric: true
      };
    }
    
    /**
     * Calcule la criticité pour matrice Alpha-5
     */
    calculateAlpha5Criticity(probabilite, impact) {
      const matrix = this.getMatrixAlpha5();
      const probNorm = this.normalizeToAlpha5(probabilite);
      const impactNorm = this.normalizeToAlpha5(impact);
      
      if (!probNorm || !impactNorm) return null;
      
      const criticite = matrix[probNorm]?.[impactNorm];
      if (!criticite) return null;
      
      return {
        level: criticite,
        formatted: criticite,
        isLetter: false,
        isAlpha5: true
      };
    }
    
    /**
     * Calcule la criticité pour matrice Alpha-4
     */
    calculateAlpha4Criticity(probabilite, impact) {
      const matrix = this.getMatrixAlpha4();
      const probNorm = this.normalizeToAlpha4(probabilite);
      const impactNorm = this.normalizeToAlpha4(impact);
      
      if (!probNorm || !impactNorm) return null;
      
      const criticite = matrix[probNorm]?.[impactNorm];
      if (!criticite) return null;
      
      return {
        level: criticite,
        formatted: criticite,
        isLetter: false,
        isAlpha4: true
      };
    }
    
    /**
     * Calcule la criticité pour matrice Alpha-3 (ancienne méthode)
     */
    calculateAlpha3Criticity(probabilite, impact) {
      const matrix = this.getCriticityMatrix(); // Alpha-3
      const probResult = this.normalizeRiskValueWithFormat(probabilite);
      const impactResult = this.normalizeRiskValueWithFormat(impact);

      if (!probResult || !impactResult) return null;

      const criticityLevel = matrix[probResult.level]?.[impactResult.level];
      if (!criticityLevel) return null;

      // Utiliser le format lettre si les deux entrées sont des lettres
      const useLetter = probResult.isLetter && impactResult.isLetter;

      return {
        level: criticityLevel,
        formatted: this.formatCriticity(criticityLevel, useLetter),
        isLetter: useLetter
      };
    }

    /**
     * Calcule la criticité selon la matrice (version simple)
     */
    calculateCriticity(probabilite, impact) {
      const result = this.calculateCriticityWithFormat(probabilite, impact);
      return result ? result.level : null;
    }

    /**
     * Applique le style de couleur à une cellule selon le niveau de risque
     * Détecte automatiquement le type de valeur (Alpha-3/4/5 ou Num-3/4/5)
     */
    applyRiskStyle(cell, riskLevel) {
      if (!cell) return;

      const value = String(riskLevel).trim().toLowerCase();
      let bgColor, textColor;

      // Détection automatique du type de valeur
      
      // 1. MATRICES ALPHABÉTIQUES - 5 NIVEAUX
      if (value.includes('tres faible') || value.includes('très faible')) {
        bgColor = '#28a745'; textColor = '#ffffff'; // Vert foncé
      } else if (value.includes('tres eleve') || value.includes('très élevé')) {
        bgColor = '#dc3545'; textColor = '#ffffff'; // Rouge
      } else if (value.includes('modere') || value.includes('modéré')) {
        bgColor = '#ffc107'; textColor = '#000000'; // Jaune
      }
      
      // 2. MATRICES ALPHABÉTIQUES - 4 NIVEAUX
      else if (value.includes('mineur') || value.includes('minor')) {
        bgColor = '#28a745'; textColor = '#ffffff'; // Vert
      } else if (value.includes('significatif') || value.includes('significant')) {
        bgColor = '#ffc107'; textColor = '#000000'; // Jaune
      } else if (value.includes('majeur') || value.includes('major')) {
        bgColor = '#ff8c00'; textColor = '#ffffff'; // Orange
      } else if (value.includes('critique') || value.includes('critical')) {
        bgColor = '#dc3545'; textColor = '#ffffff'; // Rouge
      }
      
      // 3. MATRICES ALPHABÉTIQUES - 3 NIVEAUX (ordre important après les 5 niveaux)
      else if (value.includes('faible') || value.includes('low')) {
        bgColor = '#28a745'; textColor = '#ffffff'; // Vert
      } else if (value.includes('moyen') || value.includes('medium')) {
        bgColor = '#ffc107'; textColor = '#000000'; // Jaune
      } else if (value.includes('eleve') || value.includes('élevé') || value.includes('high')) {
        bgColor = '#dc3545'; textColor = '#ffffff'; // Rouge
      }
      
      // 4. MATRICES NUMÉRIQUES
      else {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          // Matrice 3x3 (valeurs 1-9)
          if (num >= 1 && num <= 9) {
            const colors = this.getColorsNumeric(9);
            if (colors[num]) {
              bgColor = colors[num].bg;
              textColor = colors[num].text;
            }
          }
          // Matrice 4x4 (valeurs 1-16)
          else if (num >= 10 && num <= 16) {
            const colors = this.getColorsNumeric(16);
            if (colors[num]) {
              bgColor = colors[num].bg;
              textColor = colors[num].text;
            }
          }
          // Matrice 5x5 (valeurs 1-25)
          else if (num >= 17 && num <= 25) {
            const colors = this.getColorsNumeric(25);
            if (colors[num]) {
              bgColor = colors[num].bg;
              textColor = colors[num].text;
            }
          }
          // Valeurs 1-5 (peuvent être de n'importe quelle matrice)
          else if (num >= 1 && num <= 5) {
            // Essayer de détecter le contexte via les autres cellules de la ligne
            // Pour l'instant, utiliser les couleurs de base
            if (num === 1) { bgColor = '#28a745'; textColor = '#ffffff'; }
            else if (num === 2) { bgColor = '#90ee90'; textColor = '#000000'; }
            else if (num === 3) { bgColor = '#ffc107'; textColor = '#000000'; }
            else if (num === 4) { bgColor = '#ff8c00'; textColor = '#ffffff'; }
            else if (num === 5) { bgColor = '#dc3545'; textColor = '#ffffff'; }
          }
        }
      }

      // Appliquer les couleurs si trouvées
      if (bgColor && textColor) {
        cell.style.setProperty('background-color', bgColor, 'important');
        cell.style.setProperty('color', textColor, 'important');
        cell.style.setProperty('font-weight', 'bold', 'important');
        cell.style.setProperty('text-align', 'center', 'important');
      }
    }

    /**
     * Action principale: Calculer la criticité selon la matrice de risques
     */
    executeRiskEvaluation() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }

      const headers = this.getTableHeaders();
      const riskIndexes = this.findRiskColumnIndexes(headers);

      // Vérifier que les colonnes Probabilité et Impact existent
      if (riskIndexes.probabilite === -1) {
        this.showAlert("⚠️ Colonne 'Probabilité' non trouvée.\nVariations acceptées: Probabilite, Prob, obab");
        return;
      }

      if (riskIndexes.impact === -1) {
        this.showAlert("⚠️ Colonne 'Impact' non trouvée.\nVariations acceptées: Impact, mpa, IMPA");
        return;
      }

      // Si pas de colonne Criticité, proposer de l'ajouter
      if (riskIndexes.criticite === -1) {
        if (confirm("⚠️ Colonne 'Criticité' non trouvée.\nVoulez-vous l'ajouter automatiquement ?")) {
          this.addCriticityColumn(riskIndexes.impact);
          // Recalculer les index après ajout
          const newHeaders = this.getTableHeaders();
          const newIndexes = this.findRiskColumnIndexes(newHeaders);
          riskIndexes.criticite = newIndexes.criticite;
        } else {
          return;
        }
      }

      const rows = this.getDataRows();
      let calculCount = 0;
      let errorCount = 0;

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length <= Math.max(riskIndexes.probabilite, riskIndexes.impact, riskIndexes.criticite)) return;

        const probCell = cells[riskIndexes.probabilite];
        const impactCell = cells[riskIndexes.impact];
        const criticiteCell = cells[riskIndexes.criticite];

        const probValue = probCell?.textContent?.trim();
        const impactValue = impactCell?.textContent?.trim();

        // Utiliser la version avec format pour avoir la criticité homogène
        const criticiteResult = this.calculateCriticityWithFormat(probValue, impactValue);

        if (criticiteResult) {
          // Mettre à jour la cellule Criticité avec le format homogène
          criticiteCell.textContent = criticiteResult.formatted;

          // Appliquer les couleurs à toutes les cellules de risque
          this.applyRiskStyle(probCell, probValue);
          this.applyRiskStyle(impactCell, impactValue);
          this.applyRiskStyle(criticiteCell, criticiteResult.level);

          calculCount++;
        } else {
          // Valeurs non reconnues
          if (probValue || impactValue) {
            errorCount++;
            console.warn(`⚠️ Valeurs non reconnues - Prob: "${probValue}", Impact: "${impactValue}"`);
          }
        }
      });

      let message = `✅ Évaluation des risques: ${calculCount} ligne(s) calculée(s)`;
      if (errorCount > 0) {
        message += `\n⚠️ ${errorCount} ligne(s) avec valeurs non reconnues`;
      }

      this.showQuickNotification(message);
      this.notifyTableStructureChange("risk_evaluation", { calculCount, errorCount });
      this.syncWithDev();
    }

    /**
     * Ajoute une colonne Criticité après la colonne Impact
     */
    addCriticityColumn(insertAfterIndex) {
      if (!this.targetTable) return;

      Array.from(this.targetTable.querySelectorAll("tr")).forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll("th, td"));
        const referenceCell = cells[insertAfterIndex];

        if (rowIndex === 0) {
          // En-tête
          const th = document.createElement("th");
          th.textContent = "Criticité";
          th.style.cssText = "border: 1px solid #d1d5db; padding: 12px 16px; background: linear-gradient(135deg, #fff3cd, #ffeeba); font-weight: 600;";
          if (referenceCell && referenceCell.nextSibling) {
            row.insertBefore(th, referenceCell.nextSibling);
          } else {
            row.appendChild(th);
          }
        } else {
          // Cellule de données
          const td = document.createElement("td");
          td.textContent = "";
          td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: white; text-align: center;";
          this.makeCellEditable(td);
          if (referenceCell && referenceCell.nextSibling) {
            row.insertBefore(td, referenceCell.nextSibling);
          } else {
            row.appendChild(td);
          }
        }
      });

      this.showQuickNotification("✅ Colonne 'Criticité' ajoutée");
    }

    /**
     * Applique uniquement les couleurs aux cellules de risque existantes
     */
    applyRiskColors() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }

      const headers = this.getTableHeaders();
      const riskIndexes = this.findRiskColumnIndexes(headers);
      const rows = this.getDataRows();
      let coloredCount = 0;

      // Collecter tous les index de colonnes de risque trouvés
      const riskColumnIndexes = [];
      if (riskIndexes.probabilite !== -1) riskColumnIndexes.push(riskIndexes.probabilite);
      if (riskIndexes.impact !== -1) riskColumnIndexes.push(riskIndexes.impact);
      if (riskIndexes.criticite !== -1) riskColumnIndexes.push(riskIndexes.criticite);

      if (riskColumnIndexes.length === 0) {
        this.showAlert("⚠️ Aucune colonne de risque trouvée.\nColonnes recherchées: Probabilité, Impact, Criticité");
        return;
      }

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');

        riskColumnIndexes.forEach(colIndex => {
          if (colIndex < cells.length) {
            const cell = cells[colIndex];
            const value = cell?.textContent?.trim();

            if (value) {
              // Passer la valeur brute à applyRiskStyle qui détectera automatiquement le type
              this.applyRiskStyle(cell, value);
              coloredCount++;
            }
          }
        });
      });

      this.showQuickNotification(`✅ Couleurs appliquées à ${coloredCount} cellule(s)`);
      this.notifyTableStructureChange("risk_colors_applied", { coloredCount });
      this.syncWithDev();
    }

    /**
     * Ajoute les colonnes Probabilité, Impact et Criticité à la table
     */
    addRiskColumns() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }

      const headers = this.getTableHeaders();
      const existingIndexes = this.findRiskColumnIndexes(headers);

      const columnsToAdd = [];
      if (existingIndexes.probabilite === -1) columnsToAdd.push('Probabilité');
      if (existingIndexes.impact === -1) columnsToAdd.push('Impact');
      if (existingIndexes.criticite === -1) columnsToAdd.push('Criticité');

      if (columnsToAdd.length === 0) {
        this.showAlert("ℹ️ Toutes les colonnes de risque existent déjà.");
        return;
      }

      const riskOptions = ["", "Faible", "Moyen", "Eleve"];

      columnsToAdd.forEach(colName => {
        Array.from(this.targetTable.querySelectorAll("tr")).forEach((row, rowIndex) => {
          if (rowIndex === 0) {
            // En-tête
            const th = document.createElement("th");
            th.textContent = colName;
            th.style.cssText = "border: 1px solid #d1d5db; padding: 12px 16px; background: linear-gradient(135deg, #fff3cd, #ffeeba); font-weight: 600;";
            row.appendChild(th);
          } else {
            // Cellule avec menu déroulant (sauf pour Criticité qui sera calculée)
            const td = document.createElement("td");
            td.style.cssText = "border: 1px solid #d1d5db; padding: 4px 8px; background: white;";

            if (colName === 'Criticité') {
              // Criticité sera calculée automatiquement
              td.textContent = "";
              td.style.textAlign = "center";
              this.makeCellEditable(td);
            } else {
              // Probabilité et Impact avec menu déroulant
              const select = document.createElement("select");
              select.style.cssText = "width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer;";
              riskOptions.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt || "-- Sélectionner --";
                select.appendChild(option);
              });
              select.addEventListener("change", () => {
                // Appliquer la couleur immédiatement
                const normalizedValue = this.normalizeRiskValue(select.value);
                if (normalizedValue) {
                  const colors = this.getRiskColors();
                  td.style.backgroundColor = colors[normalizedValue].bg;
                }
                this.notifyTableStructureChange("risk_value_changed", { column: colName, value: select.value });
                this.syncWithDev();
              });
              td.appendChild(select);
            }
            row.appendChild(td);
          }
        });
      });

      this.showQuickNotification(`✅ ${columnsToAdd.length} colonne(s) de risque ajoutée(s): ${columnsToAdd.join(', ')}`);
      this.notifyTableStructureChange("risk_columns_added", { columns: columnsToAdd });
      this.syncWithDev();
    }


    // === EVALUATION DES RISQUES ===

    getMatrixAlpha3() {
      return {
        'Faible': { 'Faible': 'Faible', 'Moyen': 'Faible', 'Eleve': 'Moyen' },
        'Moyen': { 'Faible': 'Faible', 'Moyen': 'Moyen', 'Eleve': 'Eleve' },
        'Eleve': { 'Faible': 'Moyen', 'Moyen': 'Eleve', 'Eleve': 'Eleve' }
      };
    }
    
    /**
     * Matrice alphabétique 5 niveaux
     */
    getMatrixAlpha5() {
      return {
        'Tres faible': { 'Tres faible': 'Tres faible', 'Faible': 'Tres faible', 'Modere': 'Faible', 'Eleve': 'Faible', 'Tres eleve': 'Modere' },
        'Faible': { 'Tres faible': 'Tres faible', 'Faible': 'Faible', 'Modere': 'Faible', 'Eleve': 'Modere', 'Tres eleve': 'Modere' },
        'Modere': { 'Tres faible': 'Faible', 'Faible': 'Faible', 'Modere': 'Modere', 'Eleve': 'Eleve', 'Tres eleve': 'Eleve' },
        'Eleve': { 'Tres faible': 'Faible', 'Faible': 'Modere', 'Modere': 'Eleve', 'Eleve': 'Eleve', 'Tres eleve': 'Tres eleve' },
        'Tres eleve': { 'Tres faible': 'Modere', 'Faible': 'Modere', 'Modere': 'Eleve', 'Eleve': 'Tres eleve', 'Tres eleve': 'Tres eleve' }
      };
    }
    
    /**
     * Matrice alphabétique 4 niveaux (Mineur, Significatif, Majeur, Critique)
     */
    getMatrixAlpha4() {
      return {
        'Mineur': { 'Mineur': 'Mineur', 'Significatif': 'Mineur', 'Majeur': 'Significatif', 'Critique': 'Majeur' },
        'Significatif': { 'Mineur': 'Mineur', 'Significatif': 'Significatif', 'Majeur': 'Majeur', 'Critique': 'Critique' },
        'Majeur': { 'Mineur': 'Significatif', 'Significatif': 'Majeur', 'Majeur': 'Majeur', 'Critique': 'Critique' },
        'Critique': { 'Mineur': 'Significatif', 'Significatif': 'Majeur', 'Majeur': 'Critique', 'Critique': 'Critique' }
      };
    }
    
    /**
     * Matrice numérique 3 niveaux (1-3)
     */
    getMatrixNum3() {
      const matrix = {};
      for (let p = 1; p <= 3; p++) {
        matrix[p] = {};
        for (let i = 1; i <= 3; i++) {
          matrix[p][i] = p * i;
        }
      }
      return matrix;
    }
    
    /**
     * Matrice numérique 4 niveaux (1-4)
     */
    getMatrixNum4() {
      const matrix = {};
      for (let p = 1; p <= 4; p++) {
        matrix[p] = {};
        for (let i = 1; i <= 4; i++) {
          matrix[p][i] = p * i;
        }
      }
      return matrix;
    }
    
    /**
     * Matrice numérique 5 niveaux (1-5)
     */
    getMatrixNum5() {
      const matrix = {};
      for (let p = 1; p <= 5; p++) {
        matrix[p] = {};
        for (let i = 1; i <= 5; i++) {
          matrix[p][i] = p * i;
        }
      }
      return matrix;
    }
    
    // ============================================================================
    // NORMALISATION ET CONVERSION DES VALEURS
    // ============================================================================
    
    /**
     * Normalise une valeur vers le format alphabétique 3 niveaux
     */
    normalizeToAlpha3(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      // Format lettre
      if (v === 'f' || v.includes('faible') || v.includes('low') || v.includes('bas')) return 'Faible';
      if (v === 'm' || v.includes('moyen') || v.includes('medium') || v.includes('mod')) return 'Moyen';
      if (v === 'e' || v === 'é' || v.includes('eleve') || v.includes('élevé') || v.includes('high')) return 'Eleve';
      
      // Format numérique (1-3 ou 1-9)
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num <= 1 || num <= 3) return 'Faible';
        if (num <= 2 || num <= 6) return 'Moyen';
        if (num <= 3 || num <= 9) return 'Eleve';
      }
      
      return null;
    }
    
    /**
     * Normalise une valeur vers le format alphabétique 5 niveaux
     */
    normalizeToAlpha5(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      // Mots-clés spécifiques - ORDRE IMPORTANT (très faible avant faible)
      if (v.includes('tres faible') || v.includes('très faible') || v.includes('very low')) return 'Tres faible';
      if (v.includes('tres eleve') || v.includes('très élevé') || v.includes('very high')) return 'Tres eleve';
      if (v.includes('modere') || v.includes('modéré') || v.includes('moderate')) return 'Modere';
      if (v.includes('faible') || v.includes('low') || v.includes('bas')) return 'Faible';
      if (v.includes('eleve') || v.includes('élevé') || v.includes('high')) return 'Eleve';
      
      // Format numérique (1-5 ou 1-25)
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 5) {
          // Convertir 1-5 vers Alpha-5
          const rounded = Math.round(num);
          if (rounded === 1) return 'Tres faible';
          if (rounded === 2) return 'Faible';
          if (rounded === 3) return 'Modere';
          if (rounded === 4) return 'Eleve';
          if (rounded === 5) return 'Tres eleve';
        }
        // Conversion depuis matrice 5x5 (1-25)
        if (num <= 2) return 'Tres faible';
        if (num <= 6) return 'Faible';
        if (num <= 12) return 'Modere';
        if (num <= 20) return 'Eleve';
        return 'Tres eleve';
      }
      
      return null;
    }
    
    /**
     * Normalise une valeur vers le format alphabétique 4 niveaux
     */
    normalizeToAlpha4(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      if (v.includes('mineur') || v.includes('minor') || v.includes('low')) return 'Mineur';
      if (v.includes('significatif') || v.includes('significant') || v.includes('medium')) return 'Significatif';
      if (v.includes('majeur') || v.includes('major') || v.includes('high')) return 'Majeur';
      if (v.includes('critique') || v.includes('critical') || v.includes('severe')) return 'Critique';
      
      // Format numérique (1-4 ou 1-16)
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 4) {
          // Convertir 1-4 vers Alpha-4
          const rounded = Math.round(num);
          if (rounded === 1) return 'Mineur';
          if (rounded === 2) return 'Significatif';
          if (rounded === 3) return 'Majeur';
          if (rounded === 4) return 'Critique';
        }
        // Conversion depuis matrice 4x4 (1-16)
        if (num <= 2) return 'Mineur';
        if (num <= 6) return 'Significatif';
        if (num <= 12) return 'Majeur';
        return 'Critique';
      }
      
      return null;
    }
    
    /**
     * Normalise une valeur vers le format numérique 3 niveaux (1-3)
     */
    normalizeToNum3(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      // Si déjà numérique
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 3) return Math.round(num);
        // Conversion depuis matrice 3x3 (1-9)
        if (num <= 2) return 1;
        if (num <= 6) return 2;
        if (num <= 9) return 3;
      }
      
      // Conversion depuis alphabétique
      if (v.includes('faible') || v === 'f' || v.includes('low')) return 1;
      if (v.includes('moyen') || v === 'm' || v.includes('medium')) return 2;
      if (v.includes('eleve') || v === 'e' || v.includes('high')) return 3;
      
      return null;
    }
    
    /**
     * Normalise une valeur vers le format numérique 4 niveaux (1-4)
     */
    normalizeToNum4(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 4) return Math.round(num);
        // Conversion depuis matrice 4x4 (1-16)
        if (num <= 2) return 1;
        if (num <= 6) return 2;
        if (num <= 12) return 3;
        if (num <= 16) return 4;
      }
      
      // Conversion depuis alphabétique
      if (v.includes('mineur') || v.includes('minor')) return 1;
      if (v.includes('significatif') || v.includes('significant')) return 2;
      if (v.includes('majeur') || v.includes('major')) return 3;
      if (v.includes('critique') || v.includes('critical')) return 4;
      
      return null;
    }
    
    /**
     * Normalise une valeur vers le format numérique 5 niveaux (1-5)
     */
    normalizeToNum5(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 5) return Math.round(num);
        // Conversion depuis matrice 5x5 (1-25)
        if (num <= 2) return 1;
        if (num <= 6) return 2;
        if (num <= 12) return 3;
        if (num <= 20) return 4;
        if (num <= 25) return 5;
      }
      
      // Conversion depuis alphabétique
      if (v.includes('tres faible') || v.includes('très faible')) return 1;
      if (v.includes('faible') && !v.includes('tres')) return 2;
      if (v.includes('modere') || v.includes('modéré')) return 3;
      if (v.includes('eleve') && !v.includes('tres')) return 4;
      if (v.includes('tres eleve') || v.includes('très élevé')) return 5;
      
      return null;
    }
    
    /**
     * Convertit une valeur (alphabetique ou numerique) vers format numerique 3 niveaux
     * Utilise pour conversion INTEGRALE des matrices
     */
    convertToNumeric3(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      const num = parseFloat(v);
      if (!isNaN(num) && num >= 1 && num <= 3) return Math.round(num);
      
      if (v.includes('faible') || v.includes('low') || v === 'f') return 1;
      if (v.includes('moyen') || v.includes('medium') || v === 'm') return 2;
      if ((v.includes('eleve') || v.includes('élevé') || v.includes('high') || v === 'e') && !v.includes('tres')) return 3;
      
      if (v.includes('tres faible') || v.includes('très faible')) return 1;
      if (v.includes('modere') || v.includes('modéré')) return 2;
      if (v.includes('tres eleve') || v.includes('très élevé')) return 3;
      
      if (v.includes('mineur')) return 1;
      if (v.includes('significatif')) return 2;
      if (v.includes('majeur') || v.includes('critique')) return 3;
      
      return null;
    }
    
    convertToNumeric4(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      const num = parseFloat(v);
      if (!isNaN(num) && num >= 1 && num <= 4) return Math.round(num);
      
      if (v.includes('mineur')) return 1;
      if (v.includes('significatif')) return 2;
      if (v.includes('majeur')) return 3;
      if (v.includes('critique')) return 4;
      
      if (v.includes('faible') || v.includes('low')) return 1;
      if (v.includes('moyen') || v.includes('medium')) return 2;
      if ((v.includes('eleve') || v.includes('élevé') || v.includes('high')) && !v.includes('tres')) return 3;
      
      if (v.includes('tres faible') || v.includes('très faible')) return 1;
      if (v.includes('modere') || v.includes('modéré')) return 2;
      if (v.includes('tres eleve') || v.includes('très élevé')) return 4;
      
      return null;
    }
    
    convertToNumeric5(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      const num = parseFloat(v);
      if (!isNaN(num) && num >= 1 && num <= 5) return Math.round(num);
      
      if (v.includes('tres faible') || v.includes('très faible')) return 1;
      if (v.includes('faible') && !v.includes('tres')) return 2;
      if (v.includes('modere') || v.includes('modéré')) return 3;
      if (v.includes('eleve') && !v.includes('tres')) return 4;
      if (v.includes('tres eleve') || v.includes('très élevé')) return 5;
      
      if (v.includes('faible') || v.includes('low')) return 2;
      if (v.includes('moyen') || v.includes('medium')) return 3;
      if (v.includes('high')) return 4;
      
      if (v.includes('mineur')) return 1;
      if (v.includes('significatif')) return 2;
      if (v.includes('majeur')) return 4;
      if (v.includes('critique')) return 5;
      
      return null;
    }
    
    convertToAlpha3(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      if (v.includes('faible') && !v.includes('tres')) return 'Faible';
      if (v.includes('moyen') || v.includes('medium')) return 'Moyen';
      if ((v.includes('eleve') || v.includes('élevé')) && !v.includes('tres')) return 'Élevé';
      
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num === 1) return 'Faible';
        if (num === 2) return 'Moyen';
        if (num === 3) return 'Élevé';
        if (num <= 2) return 'Faible';
        if (num >= 4) return 'Élevé';
      }
      
      if (v.includes('tres faible') || v.includes('très faible')) return 'Faible';
      if (v.includes('modere') || v.includes('modéré')) return 'Moyen';
      if (v.includes('tres eleve') || v.includes('très élevé')) return 'Élevé';
      
      if (v.includes('mineur')) return 'Faible';
      if (v.includes('significatif')) return 'Moyen';
      if (v.includes('majeur') || v.includes('critique')) return 'Élevé';
      
      return null;
    }
    
    convertToAlpha4(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      if (v.includes('mineur')) return 'Mineur';
      if (v.includes('significatif')) return 'Significatif';
      if (v.includes('majeur') && !v.includes('critique')) return 'Majeur';
      if (v.includes('critique')) return 'Critique';
      
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num === 1) return 'Mineur';
        if (num === 2) return 'Significatif';
        if (num === 3) return 'Majeur';
        if (num >= 4) return 'Critique';
      }
      
      if (v.includes('faible') && !v.includes('tres')) return 'Mineur';
      if (v.includes('moyen')) return 'Significatif';
      if ((v.includes('eleve') || v.includes('élevé')) && !v.includes('tres')) return 'Majeur';
      
      if (v.includes('tres faible') || v.includes('très faible')) return 'Mineur';
      if (v.includes('modere') || v.includes('modéré')) return 'Significatif';
      if (v.includes('tres eleve') || v.includes('très élevé')) return 'Critique';
      
      return null;
    }
    
    convertToAlpha5(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      if (v.includes('tres faible') || v.includes('très faible')) return 'Très faible';
      if (v.includes('faible') && !v.includes('tres')) return 'Faible';
      if (v.includes('modere') || v.includes('modéré')) return 'Modéré';
      if (v.includes('eleve') && !v.includes('tres')) return 'Élevé';
      if (v.includes('tres eleve') || v.includes('très élevé')) return 'Très élevé';
      
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num === 1) return 'Très faible';
        if (num === 2) return 'Faible';
        if (num === 3) return 'Modéré';
        if (num === 4) return 'Élevé';
        if (num === 5) return 'Très élevé';
      }
      
      if (v.includes('faible') && !v.includes('tres')) return 'Faible';
      if (v.includes('moyen')) return 'Modéré';
      if ((v.includes('eleve') || v.includes('élevé')) && !v.includes('tres')) return 'Élevé';
      
      if (v.includes('mineur')) return 'Très faible';
      if (v.includes('significatif')) return 'Faible';
      if (v.includes('majeur')) return 'Élevé';
      if (v.includes('critique')) return 'Très élevé';
      
      return null;
    }
    
    // ============================================================================
    // COULEURS POUR LES MATRICES
    // ============================================================================
    
    /**
     * Obtient les couleurs pour la matrice alphabétique 3 niveaux
     */
    getColorsAlpha3() {
      return {
        'Faible': { bg: '#28a745', text: '#ffffff' },   // Vert
        'Moyen': { bg: '#ffc107', text: '#000000' },    // Jaune
        'Eleve': { bg: '#dc3545', text: '#ffffff' }     // Rouge
      };
    }
    /**
         * Convertit une valeur (alphabetique ou numerique) vers format numerique 3 niveaux
         * Utilise pour conversion INTEGRALE des matrices
         */
        convertToNumeric3(value) {
          if (!value) return null;
          const v = String(value).trim().toLowerCase();

          const num = parseFloat(v);
          if (!isNaN(num) && num >= 1 && num <= 3) return Math.round(num);

          if (v.includes('faible') || v.includes('low') || v === 'f') return 1;
          if (v.includes('moyen') || v.includes('medium') || v === 'm') return 2;
          if ((v.includes('eleve') || v.includes('élevé') || v.includes('high') || v === 'e') && !v.includes('tres')) return 3;

          if (v.includes('tres faible') || v.includes('très faible')) return 1;
          if (v.includes('modere') || v.includes('modéré')) return 2;
          if (v.includes('tres eleve') || v.includes('très élevé')) return 3;

          if (v.includes('mineur')) return 1;
          if (v.includes('significatif')) return 2;
          if (v.includes('majeur') || v.includes('critique')) return 3;

          return null;
        }

        convertToNumeric4(value) {
          if (!value) return null;
          const v = String(value).trim().toLowerCase();

          const num = parseFloat(v);
          if (!isNaN(num) && num >= 1 && num <= 4) return Math.round(num);

          if (v.includes('mineur')) return 1;
          if (v.includes('significatif')) return 2;
          if (v.includes('majeur')) return 3;
          if (v.includes('critique')) return 4;

          if (v.includes('faible') || v.includes('low')) return 1;
          if (v.includes('moyen') || v.includes('medium')) return 2;
          if ((v.includes('eleve') || v.includes('élevé') || v.includes('high')) && !v.includes('tres')) return 3;

          if (v.includes('tres faible') || v.includes('très faible')) return 1;
          if (v.includes('modere') || v.includes('modéré')) return 2;
          if (v.includes('tres eleve') || v.includes('très élevé')) return 4;

          return null;
        }

        convertToNumeric5(value) {
          if (!value) return null;
          const v = String(value).trim().toLowerCase();

          const num = parseFloat(v);
          if (!isNaN(num) && num >= 1 && num <= 5) return Math.round(num);

          if (v.includes('tres faible') || v.includes('très faible')) return 1;
          if (v.includes('faible') && !v.includes('tres')) return 2;
          if (v.includes('modere') || v.includes('modéré')) return 3;
          if (v.includes('eleve') && !v.includes('tres')) return 4;
          if (v.includes('tres eleve') || v.includes('très élevé')) return 5;

          if (v.includes('faible') || v.includes('low')) return 2;
          if (v.includes('moyen') || v.includes('medium')) return 3;
          if (v.includes('high')) return 4;

          if (v.includes('mineur')) return 1;
          if (v.includes('significatif')) return 2;
          if (v.includes('majeur')) return 4;
          if (v.includes('critique')) return 5;

          return null;
        }

        convertToAlpha3(value) {
          if (!value) return null;
          const v = String(value).trim().toLowerCase();

          if (v.includes('faible') && !v.includes('tres')) return 'Faible';
          if (v.includes('moyen') || v.includes('medium')) return 'Moyen';
          if ((v.includes('eleve') || v.includes('élevé')) && !v.includes('tres')) return 'Élevé';

          const num = parseFloat(v);
          if (!isNaN(num)) {
            if (num === 1) return 'Faible';
            if (num === 2) return 'Moyen';
            if (num === 3) return 'Élevé';
            if (num <= 2) return 'Faible';
            if (num === 3) return 'Moyen';
            if (num >= 4) return 'Élevé';
          }

          if (v.includes('tres faible') || v.includes('très faible')) return 'Faible';
          if (v.includes('modere') || v.includes('modéré')) return 'Moyen';
          if (v.includes('tres eleve') || v.includes('très élevé')) return 'Élevé';

          if (v.includes('mineur')) return 'Faible';
          if (v.includes('significatif')) return 'Moyen';
          if (v.includes('majeur') || v.includes('critique')) return 'Élevé';

          return null;
        }

        convertToAlpha4(value) {
          if (!value) return null;
          const v = String(value).trim().toLowerCase();

          if (v.includes('mineur')) return 'Mineur';
          if (v.includes('significatif')) return 'Significatif';
          if (v.includes('majeur') && !v.includes('critique')) return 'Majeur';
          if (v.includes('critique')) return 'Critique';

          const num = parseFloat(v);
          if (!isNaN(num)) {
            if (num === 1) return 'Mineur';
            if (num === 2) return 'Significatif';
            if (num === 3) return 'Majeur';
            if (num === 4) return 'Critique';
            if (num === 5) return 'Critique';
          }

          if (v.includes('faible') && !v.includes('tres')) return 'Mineur';
          if (v.includes('moyen')) return 'Significatif';
          if ((v.includes('eleve') || v.includes('élevé')) && !v.includes('tres')) return 'Majeur';

          if (v.includes('tres faible') || v.includes('très faible')) return 'Mineur';
          if (v.includes('modere') || v.includes('modéré')) return 'Significatif';
          if (v.includes('tres eleve') || v.includes('très élevé')) return 'Critique';

          return null;
        }

        convertToAlpha5(value) {
          if (!value) return null;
          const v = String(value).trim().toLowerCase();

          if (v.includes('tres faible') || v.includes('très faible')) return 'Très faible';
          if (v.includes('faible') && !v.includes('tres')) return 'Faible';
          if (v.includes('modere') || v.includes('modéré')) return 'Modéré';
          if (v.includes('eleve') && !v.includes('tres')) return 'Élevé';
          if (v.includes('tres eleve') || v.includes('très élevé')) return 'Très élevé';

          const num = parseFloat(v);
          if (!isNaN(num)) {
            if (num === 1) return 'Très faible';
            if (num === 2) return 'Faible';
            if (num === 3) return 'Modéré';
            if (num === 4) return 'Élevé';
            if (num === 5) return 'Très élevé';
          }

          if (v.includes('faible') && !v.includes('tres')) return 'Faible';
          if (v.includes('moyen')) return 'Modéré';
          if ((v.includes('eleve') || v.includes('élevé')) && !v.includes('tres')) return 'Élevé';

          if (v.includes('mineur')) return 'Très faible';
          if (v.includes('significatif')) return 'Faible';
          if (v.includes('majeur')) return 'Élevé';
          if (v.includes('critique')) return 'Très élevé';

          return null;
        }


    
    /**
     * Obtient les couleurs pour la matrice alphabétique 5 niveaux
     */
    getColorsAlpha5() {
      return {
        'Tres faible': { bg: '#28a745', text: '#ffffff' },  // Vert foncé
        'Faible': { bg: '#90ee90', text: '#000000' },       // Vert clair
        'Modere': { bg: '#ffc107', text: '#000000' },       // Jaune
        'Eleve': { bg: '#ff8c00', text: '#ffffff' },        // Orange
        'Tres eleve': { bg: '#dc3545', text: '#ffffff' }    // Rouge
      };
    }
    
    /**
     * Obtient les couleurs pour la matrice alphabétique 4 niveaux
     */
    getColorsAlpha4() {
      return {
        'Mineur': { bg: '#28a745', text: '#ffffff' },       // Vert
        'Significatif': { bg: '#ffc107', text: '#000000' }, // Jaune
        'Majeur': { bg: '#ff8c00', text: '#ffffff' },       // Orange
        'Critique': { bg: '#dc3545', text: '#ffffff' }      // Rouge
      };
    }
    
    /**
     * Obtient les couleurs pour les matrices numériques
     */
    getColorsNumeric(maxValue) {
      const colors = {};
      const thresholds = {
        3: [1, 2, 3],      // Matrice 3x3: 1-3, 4-6, 7-9
        4: [2, 6, 12],     // Matrice 4x4: 1-2, 3-6, 7-12, 13-16
        5: [2, 6, 12, 20]  // Matrice 5x5: 1-2, 3-6, 7-12, 13-20, 21-25
      };
      
      for (let i = 1; i <= maxValue; i++) {
        if (maxValue === 9) {
          // Matrice 3x3
          if (i <= 3) colors[i] = { bg: '#28a745', text: '#ffffff' };
          else if (i <= 6) colors[i] = { bg: '#ffc107', text: '#000000' };
          else colors[i] = { bg: '#dc3545', text: '#ffffff' };
        } else if (maxValue === 16) {
          // Matrice 4x4
          if (i <= 2) colors[i] = { bg: '#28a745', text: '#ffffff' };
          else if (i <= 6) colors[i] = { bg: '#ffc107', text: '#000000' };
          else if (i <= 12) colors[i] = { bg: '#ff8c00', text: '#ffffff' };
          else colors[i] = { bg: '#dc3545', text: '#ffffff' };
        } else if (maxValue === 25) {
          // Matrice 5x5
          if (i <= 2) colors[i] = { bg: '#28a745', text: '#ffffff' };
          else if (i <= 6) colors[i] = { bg: '#90ee90', text: '#000000' };
          else if (i <= 12) colors[i] = { bg: '#ffc107', text: '#000000' };
          else if (i <= 20) colors[i] = { bg: '#ff8c00', text: '#ffffff' };
          else colors[i] = { bg: '#dc3545', text: '#ffffff' };
        }
      }
      
      return colors;
    }
    
    // ============================================================================
    // MÉTHODES DE CONVERSION DE MATRICE
    // ============================================================================
    
    /**
     * Convertit la matrice actuelle vers Matrice Alphabétique 3 niveaux
     */
    convertToMatrixAlpha3() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Alphabétique 3 niveaux...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) {
        this.showAlert("⚠️ Table invalide: aucun en-tête trouvé.");
        return;
      }
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      // Trouver les colonnes de risque
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixAlpha3();
      const colors = this.getColorsAlpha3();
      let cellsUpdated = 0;
    
      // Parcourir toutes les lignes de données
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          // CONVERSION INTEGRALE: Convertir TOUTES les valeurs (numeriques ET alphabetiques)
          const probValue = this.convertToAlpha3(probCell.textContent);
          const impactValue = this.convertToAlpha3(impactCell.textContent);
          
          // Mettre à jour les cellules avec le format normalisé
          if (probValue) {
            probCell.textContent = probValue;
            this.applyRiskStyle(probCell, probValue);
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            this.applyRiskStyle(impactCell, impactValue);
            cellsUpdated++;
          }
          
          // Calculer et mettre à jour la criticité
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            this.applyRiskStyle(cells[criticiteIndex], criticite);
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Alpha-3: ${cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "alpha3", cellsUpdated });
      this.syncWithDev();
    }
    
    /**
     * Convertit la matrice actuelle vers Matrice Alphabétique 5 niveaux
     */
    convertToMatrixAlpha5() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Alphabétique 5 niveaux...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixAlpha5();
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.convertToAlpha5(probCell.textContent);
          const impactValue = this.convertToAlpha5(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            this.applyRiskStyle(probCell, probValue);
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            this.applyRiskStyle(impactCell, impactValue);
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            this.applyRiskStyle(cells[criticiteIndex], criticite);
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Alpha-5: ${cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "alpha5", cellsUpdated });
      this.syncWithDev();
    }
    
    /**
     * Convertit la matrice actuelle vers Matrice Alphabétique 4 niveaux
     */
    convertToMatrixAlpha4() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Alphabétique 4 niveaux...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixAlpha4();
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.convertToAlpha4(probCell.textContent);
          const impactValue = this.convertToAlpha4(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            this.applyRiskStyle(probCell, probValue);
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            this.applyRiskStyle(impactCell, impactValue);
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            this.applyRiskStyle(cells[criticiteIndex], criticite);
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Alpha-4: ${cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "alpha4", cellsUpdated });
      this.syncWithDev();
    }
    
    /**
     * Convertit la matrice actuelle vers Matrice Numérique 3 niveaux
     */
    convertToMatrixNum3() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 3 niveaux...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixNum3();
      const colors = this.getColorsNumeric(9);
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.convertToNumeric3(probCell.textContent);
          const impactValue = this.convertToNumeric3(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            const criticiteValue = probValue * (impactValue || 1);
            if (colors[criticiteValue]) {
              probCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              probCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            const criticiteValue = (probValue || 1) * impactValue;
            if (colors[criticiteValue]) {
              impactCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              impactCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            if (colors[criticite]) {
              cells[criticiteIndex].style.setProperty('background-color', colors[criticite].bg, 'important');
              cells[criticiteIndex].style.setProperty('color', colors[criticite].text, 'important');
            }
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Num-3: ${cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "num3", cellsUpdated });
      this.syncWithDev();
    }
    
    /**
     * Convertit la matrice actuelle vers Matrice Numérique 4 niveaux
     */
    convertToMatrixNum4() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 4 niveaux...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixNum4();
      const colors = this.getColorsNumeric(16);
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.convertToNumeric4(probCell.textContent);
          const impactValue = this.convertToNumeric4(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            const criticiteValue = probValue * (impactValue || 1);
            if (colors[criticiteValue]) {
              probCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              probCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            const criticiteValue = (probValue || 1) * impactValue;
            if (colors[criticiteValue]) {
              impactCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              impactCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            if (colors[criticite]) {
              cells[criticiteIndex].style.setProperty('background-color', colors[criticite].bg, 'important');
              cells[criticiteIndex].style.setProperty('color', colors[criticite].text, 'important');
            }
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Num-4: ${cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "num4", cellsUpdated });
      this.syncWithDev();
    }
    
    /**
     * Convertit la matrice actuelle vers Matrice Numérique 5 niveaux
     */
    convertToMatrixNum5() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 5 niveaux...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixNum5();
      const colors = this.getColorsNumeric(25);
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.convertToNumeric5(probCell.textContent);
          const impactValue = this.convertToNumeric5(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            const criticiteValue = probValue * (impactValue || 1);
            if (colors[criticiteValue]) {
              probCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              probCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            const criticiteValue = (probValue || 1) * impactValue;
            if (colors[criticiteValue]) {
              impactCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              impactCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            if (colors[criticite]) {
              cells[criticiteIndex].style.setProperty('background-color', colors[criticite].bg, 'important');
              cells[criticiteIndex].style.setProperty('color', colors[criticiteIndex].text, 'important');
            }
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Num-5: ${cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "num5", cellsUpdated });
      this.syncWithDev();
    }
    
    // ============================================================================
    // FIN DU FICHIER D'EXTENSION
    // ============================================================================

    // === CALCULS ARITHMÉTIQUES ===

    /**
     * Utilitaire: Parse une valeur monétaire (ex: "1 234,56" -> 1234.56)
     */
    parseMonetaryValue(value) {
      if (value === null || value === undefined || value === '') return NaN;
      const str = String(value).trim();
      // Supprimer les espaces, remplacer virgule par point
      const cleaned = str.replace(/\s/g, '').replace(/,/g, '.');
      // Supprimer tout sauf chiffres, point et signe moins
      const numStr = cleaned.replace(/[^\d.\-]/g, '');
      return parseFloat(numStr);
    }

    /**
     * Utilitaire: Parse une date (formats: "2024", "23/12/2024", "2024-12-23")
     * Retourne un objet Date ou null
     */
    parseDateValue(value) {
      if (value === null || value === undefined || value === '') return null;
      const str = String(value).trim();

      // Format année seule (ex: "2024", "2026")
      if (/^\d{4}$/.test(str)) {
        return new Date(parseInt(str), 0, 1); // 1er janvier de l'année
      }

      // Format JJ/MM/AAAA
      const frMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (frMatch) {
        return new Date(parseInt(frMatch[3]), parseInt(frMatch[2]) - 1, parseInt(frMatch[1]));
      }

      // Format AAAA-MM-JJ
      const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (isoMatch) {
        return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
      }

      return null;
    }

    /**
     * Utilitaire: Calcule la différence en jours entre deux dates
     */
    dateDiffInDays(date1, date2) {
      if (!date1 || !date2) return NaN;
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.round((date1 - date2) / msPerDay);
    }

    /**
     * Utilitaire: Formate un nombre en format monétaire français
     */
    formatMonetary(value) {
      if (isNaN(value)) return '';
      return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    }

    /**
     * Utilitaire: Trouve l'index de la colonne "Ecart" ou "Écart"
     */
    findEcartColumnIndex(headers) {
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase().trim();
        if (h === 'ecart' || h === 'écart') return i;
      }
      return -1;
    }

    /**
     * Utilitaire: Récupère les en-têtes de la table
     */
    getTableHeaders() {
      if (!this.targetTable) return [];
      const headerRow = this.targetTable.querySelector('thead tr') || this.targetTable.querySelector('tr');
      if (!headerRow) return [];
      return Array.from(headerRow.querySelectorAll('th, td')).map(cell => cell.textContent.trim());
    }

    /**
     * Utilitaire: Récupère les lignes de données (tbody)
     */
    getDataRows() {
      if (!this.targetTable) return [];
      const tbody = this.targetTable.querySelector('tbody');
      return tbody ? Array.from(tbody.querySelectorAll('tr')) : Array.from(this.targetTable.querySelectorAll('tr')).slice(1);
    }

    /**
     * VALIDATION: C = A + B, Écart = C - D
     * S'applique aux 3 dernières colonnes avant Écart
     * A, B, C, D sont des valeurs monétaires
     */
    executeValidation() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }

      const headers = this.getTableHeaders();
      const ecartIdx = this.findEcartColumnIndex(headers);

      if (ecartIdx === -1) { this.showAlert("⚠️ Colonne 'Ecart' non trouvée."); return; }
      if (ecartIdx < 3) { this.showAlert("⚠️ Il faut au moins 3 colonnes avant 'Ecart' pour Validation."); return; }

      // Colonnes: A (ecart-3), B (ecart-2), C (ecart-1), D = valeur existante dans C avant calcul? Non.
      // Selon spec: C = A+B, Écart = C-D
      // A = colonne ecart-3, B = colonne ecart-2, C = colonne ecart-1 (sera calculée), D = valeur de référence
      // Interprétation: A, B sont les 2 premières colonnes, C est calculé, D est la 3ème colonne avant Ecart
      // A = ecart-3, B = ecart-2, D = ecart-1, C = A+B (nouvelle valeur), Écart = C - D

      const colA = ecartIdx - 3;
      const colB = ecartIdx - 2;
      const colD = ecartIdx - 1;

      const rows = this.getDataRows();
      let calculCount = 0;

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length <= ecartIdx) return;

        const valA = this.parseMonetaryValue(cells[colA]?.textContent);
        const valB = this.parseMonetaryValue(cells[colB]?.textContent);
        const valD = this.parseMonetaryValue(cells[colD]?.textContent);

        if (!isNaN(valA) && !isNaN(valB) && !isNaN(valD)) {
          const C = valA + valB;
          const ecart = C - valD;

          // Mettre à jour la cellule Écart
          cells[ecartIdx].textContent = this.formatMonetary(ecart);
          cells[ecartIdx].style.color = ecart >= 0 ? 'green' : 'red';
          cells[ecartIdx].style.fontWeight = 'bold';
          calculCount++;
        }
      });

      this.showQuickNotification(`✅ Validation: ${calculCount} ligne(s) calculée(s) (C=A+B, Écart=C-D)`);
      this.notifyTableStructureChange("arithmetic_validation", { calculCount });
      this.syncWithDev();
    }

    /**
     * MOUVEMENT: D = A + B - C, Écart = D - E
     * S'applique aux 5 dernières colonnes avant Écart
     * A, B, C, D, E sont des valeurs monétaires
     */
    executeMouvement() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }

      const headers = this.getTableHeaders();
      const ecartIdx = this.findEcartColumnIndex(headers);

      if (ecartIdx === -1) { this.showAlert("⚠️ Colonne 'Ecart' non trouvée."); return; }
      if (ecartIdx < 5) { this.showAlert("⚠️ Il faut au moins 5 colonnes avant 'Ecart' pour Mouvement."); return; }

      // A = ecart-5, B = ecart-4, C = ecart-3, D = ecart-2 (calculé), E = ecart-1
      // D = A + B - C, Écart = D - E
      const colA = ecartIdx - 5;
      const colB = ecartIdx - 4;
      const colC = ecartIdx - 3;
      const colD = ecartIdx - 2; // Sera mis à jour avec le calcul
      const colE = ecartIdx - 1;

      const rows = this.getDataRows();
      let calculCount = 0;

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length <= ecartIdx) return;

        const valA = this.parseMonetaryValue(cells[colA]?.textContent);
        const valB = this.parseMonetaryValue(cells[colB]?.textContent);
        const valC = this.parseMonetaryValue(cells[colC]?.textContent);
        const valE = this.parseMonetaryValue(cells[colE]?.textContent);

        if (!isNaN(valA) && !isNaN(valB) && !isNaN(valC) && !isNaN(valE)) {
          const D = valA + valB - valC;
          const ecart = D - valE;

          // Mettre à jour D (colonne ecart-2)
          cells[colD].textContent = this.formatMonetary(D);
          cells[colD].style.fontWeight = 'bold';

          // Mettre à jour Écart
          cells[ecartIdx].textContent = this.formatMonetary(ecart);
          cells[ecartIdx].style.color = ecart >= 0 ? 'green' : 'red';
          cells[ecartIdx].style.fontWeight = 'bold';
          calculCount++;
        }
      });

      this.showQuickNotification(`✅ Mouvement: ${calculCount} ligne(s) calculée(s) (D=A+B-C, Écart=D-E)`);
      this.notifyTableStructureChange("arithmetic_mouvement", { calculCount });
      this.syncWithDev();
    }

    /**
     * RAPPROCHEMENT: C = A - B, Écart = C
     * S'applique aux 3 dernières colonnes avant Écart
     * A, B, C sont des valeurs monétaires
     */
    executeRapprochement() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }

      const headers = this.getTableHeaders();
      const ecartIdx = this.findEcartColumnIndex(headers);

      if (ecartIdx === -1) { this.showAlert("⚠️ Colonne 'Ecart' non trouvée."); return; }
      if (ecartIdx < 3) { this.showAlert("⚠️ Il faut au moins 3 colonnes avant 'Ecart' pour Rapprochement."); return; }

      // A = ecart-3, B = ecart-2, C = ecart-1 (calculé)
      // C = A - B, Écart = C
      const colA = ecartIdx - 3;
      const colB = ecartIdx - 2;
      const colC = ecartIdx - 1; // Sera mis à jour

      const rows = this.getDataRows();
      let calculCount = 0;

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length <= ecartIdx) return;

        const valA = this.parseMonetaryValue(cells[colA]?.textContent);
        const valB = this.parseMonetaryValue(cells[colB]?.textContent);

        if (!isNaN(valA) && !isNaN(valB)) {
          const C = valA - valB;

          // Mettre à jour C
          cells[colC].textContent = this.formatMonetary(C);
          cells[colC].style.fontWeight = 'bold';

          // Écart = C
          cells[ecartIdx].textContent = this.formatMonetary(C);
          cells[ecartIdx].style.color = C >= 0 ? 'green' : 'red';
          cells[ecartIdx].style.fontWeight = 'bold';
          calculCount++;
        }
      });

      this.showQuickNotification(`✅ Rapprochement: ${calculCount} ligne(s) calculée(s) (C=A-B, Écart=C)`);
      this.notifyTableStructureChange("arithmetic_rapprochement", { calculCount });
      this.syncWithDev();
    }

    /**
     * SÉPARATION: C = A - B (dates), Écart = C (en jours)
     * S'applique aux 3 dernières colonnes avant Écart
     * A, B sont des dates (années ou dates complètes), C est l'écart en jours
     */
    executeSeparation() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }

      const headers = this.getTableHeaders();
      const ecartIdx = this.findEcartColumnIndex(headers);

      if (ecartIdx === -1) { this.showAlert("⚠️ Colonne 'Ecart' non trouvée."); return; }
      if (ecartIdx < 3) { this.showAlert("⚠️ Il faut au moins 3 colonnes avant 'Ecart' pour Séparation."); return; }

      // A = ecart-3 (date), B = ecart-2 (date), C = ecart-1 (calculé en jours)
      // C = A - B (différence en jours), Écart = C
      const colA = ecartIdx - 3;
      const colB = ecartIdx - 2;
      const colC = ecartIdx - 1;

      const rows = this.getDataRows();
      let calculCount = 0;

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length <= ecartIdx) return;

        const dateA = this.parseDateValue(cells[colA]?.textContent);
        const dateB = this.parseDateValue(cells[colB]?.textContent);

        if (dateA && dateB) {
          const diffDays = this.dateDiffInDays(dateA, dateB);

          if (!isNaN(diffDays)) {
            // Mettre à jour C avec la différence en jours
            cells[colC].textContent = `${diffDays} jours`;
            cells[colC].style.fontWeight = 'bold';

            // Écart = C (nombre de jours)
            cells[ecartIdx].textContent = `${diffDays}`;
            cells[ecartIdx].style.color = diffDays >= 0 ? 'green' : 'red';
            cells[ecartIdx].style.fontWeight = 'bold';
            calculCount++;
          }
        }
      });

      this.showQuickNotification(`✅ Séparation: ${calculCount} ligne(s) calculée(s) (C=A-B en jours)`);
      this.notifyTableStructureChange("arithmetic_separation", { calculCount });
      this.syncWithDev();
    }

    /**
     * ESTIMATION: C = A * B, Écart = C - D
     * S'applique aux 4 dernières colonnes avant Écart
     * A est monétaire, B est un taux (%), C et D sont monétaires
     */
    executeEstimation() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }

      const headers = this.getTableHeaders();
      const ecartIdx = this.findEcartColumnIndex(headers);

      if (ecartIdx === -1) { this.showAlert("⚠️ Colonne 'Ecart' non trouvée."); return; }
      if (ecartIdx < 4) { this.showAlert("⚠️ Il faut au moins 4 colonnes avant 'Ecart' pour Estimation."); return; }

      // A = ecart-4 (montant), B = ecart-3 (taux), C = ecart-2 (calculé), D = ecart-1 (référence)
      // C = A * B, Écart = C - D
      const colA = ecartIdx - 4;
      const colB = ecartIdx - 3; // Taux (peut être en % ou décimal)
      const colC = ecartIdx - 2; // Sera calculé
      const colD = ecartIdx - 1;

      const rows = this.getDataRows();
      let calculCount = 0;

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length <= ecartIdx) return;

        const valA = this.parseMonetaryValue(cells[colA]?.textContent);
        let valB = this.parseMonetaryValue(cells[colB]?.textContent);
        const valD = this.parseMonetaryValue(cells[colD]?.textContent);

        // Si B contient un %, le convertir en décimal
        const bText = cells[colB]?.textContent || '';
        if (bText.includes('%')) {
          valB = valB / 100;
        } else if (valB > 1 && valB <= 100) {
          // Si B est entre 1 et 100, supposer que c'est un pourcentage
          valB = valB / 100;
        }

        if (!isNaN(valA) && !isNaN(valB) && !isNaN(valD)) {
          const C = valA * valB;
          const ecart = C - valD;

          // Mettre à jour C
          cells[colC].textContent = this.formatMonetary(C);
          cells[colC].style.fontWeight = 'bold';

          // Mettre à jour Écart
          cells[ecartIdx].textContent = this.formatMonetary(ecart);
          cells[ecartIdx].style.color = ecart >= 0 ? 'green' : 'red';
          cells[ecartIdx].style.fontWeight = 'bold';
          calculCount++;
        }
      });

      this.showQuickNotification(`✅ Estimation: ${calculCount} ligne(s) calculée(s) (C=A×B, Écart=C-D)`);
      this.notifyTableStructureChange("arithmetic_estimation", { calculCount });
      this.syncWithDev();
    }

    // === MODELISATION TABLE N8N ===
    async executeModelisationN8n() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée. Cliquez d'abord sur une table.");
        return;
      }

      try {
        console.log("🚀 [N8N Modelisation] Démarrage de l'envoi vers n8n...");
        this.showQuickNotification("🔄 Envoi vers n8n en cours...");

        // 1. Trouver la div parente contenant toutes les tables
        const parentDiv = this.findParentDivWithTables(this.targetTable);
        if (!parentDiv) {
          console.warn("⚠️ [N8N Modelisation] Div parente non trouvée, utilisation de la table seule");
        }

        // 2. Collecter toutes les tables dans la même div
        const tablesInDiv = parentDiv
          ? Array.from(parentDiv.querySelectorAll('table'))
          : [this.targetTable];

        console.log(`📊 [N8N Modelisation] ${tablesInDiv.length} table(s) trouvée(s) dans la div`);

        // 3. Collecter le outerHTML de toutes les tables
        let allTablesHtml = '';
        tablesInDiv.forEach((table, index) => {
          console.log(`📋 [N8N Modelisation] Collecte table ${index + 1}/${tablesInDiv.length}`);
          allTablesHtml += table.outerHTML + '\n';
        });

        // 4. Créer la table complémentaire avec les métadonnées
        const metadataTableHtml = this.createMetadataTable();
        allTablesHtml += metadataTableHtml;

        console.log("📝 [N8N Modelisation] HTML total collecté:", allTablesHtml.length, "caractères");
        console.log("📝 [N8N Modelisation] Aperçu HTML:", allTablesHtml.substring(0, 500) + "...");

        // 5. Préparer le payload JSON pour n8n
        const payload = {
          question: allTablesHtml,
          source: "claraverse_menu",
          timestamp: new Date().toISOString(),
          tableCount: tablesInDiv.length + 1 // +1 pour la table métadonnées
        };

        console.log("📤 [N8N Modelisation] Envoi vers endpoint n8n...");
        console.log("📤 [N8N Modelisation] Payload:", JSON.stringify(payload).substring(0, 300) + "...");

        // 6. Envoyer vers l'endpoint n8n
        const response = await fetch('https://barow52161.app.n8n.cloud/webhook/htlm_processor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        console.log("📥 [N8N Modelisation] Réponse HTTP status:", response.status);

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        // 7. Traiter la réponse JSON
        const responseText = await response.text();
        console.log("📥 [N8N Modelisation] Réponse brute:", responseText.substring(0, 500) + "...");

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ [N8N Modelisation] Erreur parsing JSON:", parseError);
          throw new Error("Réponse n8n invalide (non-JSON)");
        }

        console.log("📥 [N8N Modelisation] Réponse JSON parsée:", result);

        // 8. Convertir la réponse JSON en HTML et remplacer le contenu
        const newHtml = this.convertN8nResponseToHtml(result);

        if (newHtml) {
          console.log("🔄 [N8N Modelisation] Remplacement du contenu de la table...");
          this.replaceTableWithN8nResponse(this.targetTable, newHtml, result);
          this.showQuickNotification("✅ Modélisation n8n terminée!");
          this.notifyTableStructureChange("n8n_modelisation", { responseKeys: Object.keys(result) });
          this.syncWithDev();
        } else {
          console.warn("⚠️ [N8N Modelisation] Aucun HTML généré depuis la réponse");
          this.showQuickNotification("⚠️ Réponse n8n vide ou invalide");
        }

      } catch (error) {
        console.error("❌ [N8N Modelisation] Erreur:", error);
        this.showAlert(`❌ Erreur Modélisation n8n: ${error.message}`);
      }
    }

    /**
     * Trouve la div parente contenant plusieurs tables
     */
    findParentDivWithTables(table) {
      let parent = table.parentElement;
      let maxIterations = 10;

      while (parent && maxIterations > 0) {
        // Chercher une div qui contient des tables
        if (parent.tagName === 'DIV') {
          const tablesInParent = parent.querySelectorAll('table');
          // Si la div contient au moins la table cible, c'est bon
          if (tablesInParent.length >= 1) {
            // Vérifier si c'est une div de contenu (prose, message, etc.)
            if (parent.classList.contains('prose') ||
              parent.classList.contains('max-w-none') ||
              parent.closest('.prose')) {
              console.log("📁 [N8N Modelisation] Div parente trouvée:", parent.className);
              return parent;
            }
          }
        }
        parent = parent.parentElement;
        maxIterations--;
      }

      // Fallback: retourner le parent immédiat
      return table.parentElement;
    }

    /**
     * Crée une table HTML avec les métadonnées complémentaires
     */
    createMetadataTable() {
      const timestamp = new Date().toISOString();
      return `
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg metadata-table">
  <thead>
    <tr>
      <th style="border: 1px solid #d1d5db; padding: 8px 12px; background: #f0f8ff;">Paramètre</th>
      <th style="border: 1px solid #d1d5db; padding: 8px 12px; background: #f0f8ff;">Valeur</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Command</td>
      <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Modelisation_table</td>
    </tr>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Meta donnees</td>
      <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Complementaire</td>
    </tr>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Timestamp</td>
      <td style="border: 1px solid #d1d5db; padding: 8px 12px;">${timestamp}</td>
    </tr>
  </tbody>
</table>`;
    }

    /**
     * Convertit la réponse JSON de n8n en HTML
     */
    convertN8nResponseToHtml(response) {
      console.log("🔄 [N8N Modelisation] Conversion JSON -> HTML...");

      if (!response || typeof response !== 'object') {
        console.warn("⚠️ [N8N Modelisation] Réponse invalide:", response);
        return null;
      }

      // Extraire le JSON si la réponse est encapsulée dans {text: '```json\n...\n```'}
      let actualData = response;
      if (response.text && typeof response.text === 'string') {
        console.log("📦 [N8N Modelisation] Extraction du JSON depuis le champ 'text'...");
        try {
          // Extraire le JSON du bloc markdown ```json ... ```
          let jsonString = response.text;

          // Supprimer les balises markdown ```json et ```
          const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1].trim();
            console.log("📝 [N8N Modelisation] JSON extrait du bloc markdown");
          } else {
            // Essayer sans les balises markdown
            jsonString = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          }

          console.log("📝 [N8N Modelisation] JSON à parser:", jsonString.substring(0, 200) + "...");
          actualData = JSON.parse(jsonString);
          console.log("✅ [N8N Modelisation] JSON parsé avec succès:", Object.keys(actualData));
        } catch (parseError) {
          console.error("❌ [N8N Modelisation] Erreur parsing JSON imbriqué:", parseError);
          console.log("📝 [N8N Modelisation] Contenu brut:", response.text.substring(0, 500));
          return null;
        }
      }

      let htmlOutput = '';

      // Parcourir les clés de la réponse (ex: "Etape mission - Programme")
      Object.keys(actualData).forEach(sectionKey => {
        const sectionData = actualData[sectionKey];
        console.log(`📋 [N8N Modelisation] Traitement section: ${sectionKey}`);

        if (Array.isArray(sectionData)) {
          sectionData.forEach((item, index) => {
            // Chaque item peut être un objet avec "table 1", "table 2", etc.
            Object.keys(item).forEach(tableKey => {
              const tableData = item[tableKey];
              console.log(`📊 [N8N Modelisation] Génération ${tableKey}...`);

              if (Array.isArray(tableData)) {
                // Table avec plusieurs lignes (ex: table 2)
                htmlOutput += this.generateTableFromArray(tableKey, tableData);
              } else if (typeof tableData === 'object') {
                // Table avec une seule ligne (ex: table 1)
                htmlOutput += this.generateTableFromObject(tableKey, tableData);
              }
            });
          });
        }
      });

      console.log("✅ [N8N Modelisation] HTML généré:", htmlOutput.length, "caractères");
      return htmlOutput;
    }

    /**
     * Génère une table HTML à partir d'un objet simple (une seule ligne)
     */
    generateTableFromObject(title, data) {
      const keys = Object.keys(data);
      if (keys.length === 0) return '';

      let html = `
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg n8n-result-table" style="margin-bottom: 16px;">
  <caption style="caption-side: top; text-align: left; font-weight: bold; padding: 8px; background: #e3f2fd; border: 1px solid #d1d5db; border-bottom: none;">📋 ${title}</caption>
  <thead>
    <tr>`;

      keys.forEach(key => {
        html += `<th style="border: 1px solid #d1d5db; padding: 8px 12px; background: #f8f9fa; font-weight: 600;">${key}</th>`;
      });

      html += `
    </tr>
  </thead>
  <tbody>
    <tr>`;

      keys.forEach(key => {
        html += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; background: white;">${data[key] || ''}</td>`;
      });

      html += `
    </tr>
  </tbody>
</table>`;

      return html;
    }

    /**
     * Génère une table HTML à partir d'un tableau d'objets (plusieurs lignes)
     */
    generateTableFromArray(title, dataArray) {
      if (!Array.isArray(dataArray) || dataArray.length === 0) return '';

      // Extraire les en-têtes depuis le premier objet
      const headers = Object.keys(dataArray[0]);

      let html = `
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg n8n-result-table" style="margin-bottom: 16px;">
  <caption style="caption-side: top; text-align: left; font-weight: bold; padding: 8px; background: #e3f2fd; border: 1px solid #d1d5db; border-bottom: none;">📋 ${title}</caption>
  <thead>
    <tr>`;

      headers.forEach(header => {
        html += `<th style="border: 1px solid #d1d5db; padding: 8px 12px; background: #f8f9fa; font-weight: 600;">${header}</th>`;
      });

      html += `
    </tr>
  </thead>
  <tbody>`;

      dataArray.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
          const cellValue = row[header] !== undefined ? row[header] : '';
          html += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; background: white; white-space: pre-wrap;">${cellValue}</td>`;
        });
        html += '</tr>';
      });

      html += `
  </tbody>
</table>`;

      return html;
    }

    /**
     * Remplace TOUTES les tables dans la div parente par la réponse n8n
     */
    replaceTableWithN8nResponse(targetTable, newHtml, originalResponse) {
      console.log("🔄 [N8N Modelisation] Remplacement de TOUTES les tables dans la div...");

      // Trouver la div parente contenant les tables
      const parentDiv = this.findParentDivWithTables(targetTable);

      if (parentDiv) {
        // 1. Supprimer TOUTES les tables existantes dans la div
        const existingTables = parentDiv.querySelectorAll('table');
        console.log(`🗑️ [N8N Modelisation] Suppression de ${existingTables.length} table(s) existante(s)...`);

        existingTables.forEach((table, index) => {
          console.log(`🗑️ [N8N Modelisation] Suppression table ${index + 1}/${existingTables.length}`);
          table.remove();
        });

        // 2. Créer un conteneur pour les nouvelles tables
        const container = document.createElement('div');
        container.className = 'n8n-modelisation-result';
        container.innerHTML = newHtml;

        // 3. Insérer les nouvelles tables dans la div parente
        parentDiv.appendChild(container);

        // 4. Rendre les nouvelles tables éditables
        container.querySelectorAll('td').forEach(cell => {
          this.makeCellEditable(cell);
        });

        console.log("✅ [N8N Modelisation] Toutes les tables remplacées avec succès");
      } else {
        console.warn("⚠️ [N8N Modelisation] Div parente non trouvée, insertion après la table cible");

        // Fallback: créer un conteneur et insérer après la table cible
        const container = document.createElement('div');
        container.className = 'n8n-modelisation-result';
        container.innerHTML = newHtml;

        targetTable.parentNode.insertBefore(container, targetTable.nextSibling);

        // Rendre les nouvelles tables éditables
        container.querySelectorAll('td').forEach(cell => {
          this.makeCellEditable(cell);
        });
      }
    }

    /**
     * Créer le tableau standard de mission en première position dans la div
     * Structure: 2 colonnes (Rubrique, Description) avec chaque élément JSON sur une ligne
     * JSON: {"table 1": {"Etape de mission": "Etape X", "Norme": "Norme X", "Méthode": "Méthode X", "Reference": "Ref-xxx"}}
     */
    createStandardMissionTable() {
      // Données standard du tableau - chaque clé/valeur devient une ligne
      const tableData = {
        "table 1": {
          "Etape de mission": "Etape X",
          "Norme": "Norme X",
          "Méthode": "Méthode X",
          "Reference": "Ref-xxx"
        }
      };

      // Trouver le conteneur cible
      let targetContainer = null;

      if (this.targetTable) {
        targetContainer = this.targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none')
          || this.targetTable.closest('.chat-message')
          || this.targetTable.closest('.message-content')
          || this.targetTable.parentElement;
      }

      if (!targetContainer) {
        targetContainer = document.querySelector('div.prose.prose-base.dark\\:prose-invert.max-w-none')
          || document.querySelector('.chat-messages')
          || document.querySelector('main');
      }

      if (!targetContainer) {
        this.showAlert("⚠️ Aucun conteneur trouvé. Cliquez d'abord sur une table ou un message.");
        return;
      }

      // En-têtes fixes : Rubrique et Description
      const headers = ["Rubrique", "Description"];

      // Extraire les lignes depuis le JSON (chaque clé/valeur = une ligne)
      const tableContent = tableData["table 1"];
      const rows = Object.entries(tableContent); // [["Etape de mission", "Etape X"], ["Norme", "Norme X"], ...]

      // Créer le wrapper de table
      const tableWrapper = document.createElement("div");
      tableWrapper.className = "table-wrapper overflow-x-auto mission-table-wrapper";
      tableWrapper.style.cssText = "margin: 16px 0;";

      // Créer la table HTML
      const table = document.createElement("table");
      table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg standard-mission-table";
      table.style.cssText = "border-collapse: collapse; width: 100%;";
      table.dataset.tableType = "mission-standard";
      table.dataset.createdAt = new Date().toISOString();

      // En-tête avec style bordeaux (Rubrique | Description)
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        th.style.cssText = `
          border: 1px solid #600018;
          padding: 12px 16px;
          background: #800020;
          color: white;
          font-weight: 600;
          text-align: left;
          font-size: 13px;
        `;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Corps avec les lignes (chaque entrée JSON = une ligne)
      const tbody = document.createElement("tbody");
      rows.forEach(([rubrique, description], rowIndex) => {
        const dataRow = document.createElement("tr");
        dataRow.style.background = rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";

        // Colonne Rubrique
        const tdRubrique = document.createElement("td");
        tdRubrique.textContent = rubrique;
        tdRubrique.style.cssText = "border: 1px solid #d1d5db; padding: 10px 14px; font-size: 13px; font-weight: 500;";
        this.makeCellEditable(tdRubrique);
        dataRow.appendChild(tdRubrique);

        // Colonne Description
        const tdDescription = document.createElement("td");
        tdDescription.textContent = description;
        tdDescription.style.cssText = "border: 1px solid #d1d5db; padding: 10px 14px; font-size: 13px;";
        this.makeCellEditable(tdDescription);
        dataRow.appendChild(tdDescription);

        tbody.appendChild(dataRow);
      });
      table.appendChild(tbody);

      tableWrapper.appendChild(table);

      // Insérer EN PREMIÈRE POSITION dans le conteneur
      if (targetContainer.firstChild) {
        targetContainer.insertBefore(tableWrapper, targetContainer.firstChild);
      } else {
        targetContainer.appendChild(tableWrapper);
      }

      // Sélectionner la nouvelle table comme table active
      this.targetTable = table;

      this.showQuickNotification("✅ Tableau de mission créé en première position");
      this.notifyTableStructureChange("mission_table_created", {
        headers: headers,
        rowCount: rows.length,
        position: "first"
      });
      this.syncWithDev();

      console.log("📋 [Create Mission Table] Tableau créé avec structure:", tableData);
    }

    insertTableBelow() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      const newTable = document.createElement("table");
      newTable.className = this.targetTable.className;
      newTable.style.cssText = this.targetTable.style.cssText || "border-collapse: collapse; width: 100%; margin-top: 16px;";

      // Créer l'en-tête avec 4 colonnes
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["No", "Colonne 1", "Colonne 2", "Colonne 3"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        th.style.cssText = "border: 1px solid #d1d5db; padding: 12px 16px; background: #f8f9fa; font-weight: 600;";
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      newTable.appendChild(thead);

      // Créer le corps avec 3 lignes vides
      const tbody = document.createElement("tbody");
      for (let i = 1; i <= 3; i++) {
        const tr = document.createElement("tr");
        [String(i), "", "", ""].forEach((text, idx) => {
          const td = document.createElement("td");
          td.textContent = text;
          td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: white;";
          this.makeCellEditable(td);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      }
      newTable.appendChild(tbody);

      // Insérer après la table active
      this.targetTable.parentNode.insertBefore(newTable, this.targetTable.nextSibling);
      this.showQuickNotification("✅ Nouvelle table insérée");
      this.notifyTableStructureChange("table_inserted", {});
      this.syncWithDev();
    }

    deleteTable() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      if (confirm("Supprimer cette table ?")) {
        this.targetTable.remove();
        this.targetTable = null;
        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };
        this.showQuickNotification("✅ Table supprimée");
        this.notifyTableStructureChange("table_deleted", {});
        this.syncWithDev();
      }
    }

    // === COPIER-COLLER TABLE (INTERNE) ===

    /**
     * Copier la table active en mémoire (utilise conso.js)
     */
    copyTableToMemory() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée. Cliquez d'abord sur une table.");
        return;
      }

      // Utiliser le processeur conso.js si disponible
      if (window.claraverseProcessor && typeof window.claraverseProcessor.copyTable === 'function') {
        const result = window.claraverseProcessor.copyTable(this.targetTable);
        if (result.success) {
          console.log(`📋 [Menu] Table copiée: ${result.cols} colonnes, ${result.rows} lignes`);
        }
        return result;
      }

      // Fallback: copier localement si conso.js n'est pas disponible
      console.log("📋 [Menu] Copie de table (fallback local)...");

      try {
        const tableData = {
          timestamp: Date.now(),
          headers: [],
          rows: [],
          styles: {
            tableClass: this.targetTable.className,
            tableStyle: this.targetTable.style.cssText
          }
        };

        // Extraire les en-têtes
        const headerRow = this.targetTable.querySelector("thead tr") || this.targetTable.querySelector("tr:first-child");
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
        const tbody = this.targetTable.querySelector("tbody");
        const dataRows = tbody
          ? tbody.querySelectorAll("tr")
          : Array.from(this.targetTable.querySelectorAll("tr")).slice(1);

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

        // Stocker dans une variable globale
        window._menuCopiedTableData = tableData;

        const rowCount = tableData.rows.length;
        const colCount = tableData.headers.length;

        this.showQuickNotification(`📋 Table copiée: ${colCount} colonnes, ${rowCount} lignes`);
        console.log(`✅ [Menu] Table copiée: ${colCount} colonnes, ${rowCount} lignes`);

        return { success: true, rows: rowCount, cols: colCount };

      } catch (error) {
        console.error("❌ [Menu] Erreur lors de la copie:", error);
        this.showQuickNotification(`❌ Erreur: ${error.message}`);
        return { success: false, rows: 0, cols: 0 };
      }
    }

    /**
     * Coller la table copiée pour remplacer la table active (utilise conso.js)
     */
    pasteTableFromMemory() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée. Cliquez d'abord sur une table cible.");
        return;
      }

      // Utiliser le processeur conso.js si disponible
      if (window.claraverseProcessor && typeof window.claraverseProcessor.pasteTable === 'function') {
        const result = window.claraverseProcessor.pasteTable(this.targetTable);
        if (result.success) {
          console.log(`📄 [Menu] Table collée: ${result.cols} colonnes, ${result.rows} lignes`);
          this.notifyTableStructureChange("table_pasted", { columns: result.cols, rows: result.rows });
          this.syncWithDev();
        }
        return result;
      }

      // Fallback: utiliser les données locales si conso.js n'est pas disponible
      console.log("📄 [Menu] Collage de table (fallback local)...");

      // Vérifier si une table a été copiée
      const copiedData = window._menuCopiedTableData;
      if (!copiedData) {
        this.showAlert("⚠️ Aucune table copiée. Utilisez d'abord 'Copier table'.");
        return { success: false, rows: 0, cols: 0 };
      }

      try {
        // Sauvegarder les classes CSS de la table cible
        const originalClasses = this.targetTable.className;
        const originalStyle = this.targetTable.style.cssText;

        // Vider la table
        this.targetTable.innerHTML = "";

        // Créer le thead avec les en-têtes
        if (copiedData.headers.length > 0) {
          const thead = document.createElement("thead");
          const headerRow = document.createElement("tr");

          copiedData.headers.forEach(header => {
            const th = document.createElement("th");
            if (header.html && header.html !== header.text) {
              th.innerHTML = header.html;
            } else {
              th.textContent = header.text || "";
            }
            th.style.cssText = header.style || "border: 1px solid #d1d5db; padding: 12px 16px; background: #f8f9fa; font-weight: 600; text-align: left;";
            headerRow.appendChild(th);
          });

          thead.appendChild(headerRow);
          this.targetTable.appendChild(thead);
        }

        // Créer le tbody avec les données
        const tbody = document.createElement("tbody");

        copiedData.rows.forEach(rowData => {
          const tr = document.createElement("tr");
          const numCols = copiedData.headers.length || rowData.length;

          for (let i = 0; i < numCols; i++) {
            const td = document.createElement("td");
            const cellData = rowData[i] || { text: "", html: "", style: "" };

            if (cellData.html && cellData.html !== cellData.text) {
              td.innerHTML = cellData.html;
            } else {
              td.textContent = cellData.text || "";
            }

            td.style.cssText = cellData.style || "border: 1px solid #d1d5db; padding: 8px 12px; background: white;";

            if (cellData.bgColor) {
              td.style.backgroundColor = cellData.bgColor;
            }

            this.makeCellEditable(td);
            tr.appendChild(td);
          }

          tbody.appendChild(tr);
        });

        this.targetTable.appendChild(tbody);

        // Restaurer les classes CSS originales
        this.targetTable.className = originalClasses;
        if (originalStyle) {
          this.targetTable.style.cssText = originalStyle;
        }

        // Effet visuel temporaire
        this.targetTable.style.outline = "3px solid #28a745";
        setTimeout(() => {
          this.targetTable.style.outline = "";
        }, 2000);

        const rowCount = copiedData.rows.length;
        const colCount = copiedData.headers.length;

        this.showQuickNotification(`✅ Table collée: ${colCount} colonnes, ${rowCount} lignes`);
        console.log(`✅ [Menu] Table collée: ${colCount} colonnes, ${rowCount} lignes`);

        this.notifyTableStructureChange("table_pasted", { columns: colCount, rows: rowCount });
        this.syncWithDev();

        return { success: true, rows: rowCount, cols: colCount };

      } catch (error) {
        console.error("❌ [Menu] Erreur lors du collage:", error);
        this.showQuickNotification(`❌ Erreur: ${error.message}`);
        return { success: false, rows: 0, cols: 0 };
      }
    }

    // === IMPORT/EXPORT EXCEL ===
    async importExcel() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      try {
        const file = await this.openFileDialog();
        if (!file || !this.validateFile(file)) return;
        this.showQuickNotification("📄 Lecture du fichier Excel...");
        await this.ensureSheetJSLoaded();
        const workbook = await this.parseExcelFile(file);
        const { headers, data } = this.extractExcelData(workbook);
        if (data.length === 0) { this.showAlert("⚠️ Fichier vide."); return; }
        this.replaceTableContent(headers, data);
        this.showQuickNotification("✅ Import Excel terminé!");
        this.notifyTableStructureChange("excel_import", { rowCount: data.length, columnCount: headers.length });
        this.syncWithDev();
      } catch (error) { this.showAlert(`❌ Erreur: ${error.message}`); }
    }

    async importExcelSheetTest() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      try {
        const file = await this.openFileDialog();
        if (!file || !this.validateFile(file)) return;
        this.showQuickNotification("📄 Lecture avec colonnes test...");
        await this.ensureSheetJSLoaded();
        const workbook = await this.parseExcelFile(file);
        const { headers, data } = this.extractExcelData(workbook);
        const testCols = ["Ecart", "Assertion", "CTR 1", "CTR 2", "CTR 3", "Conclusion"];
        const enhancedHeaders = [...headers, ...testCols];
        const enhancedData = data.map(row => [...row, ...new Array(testCols.length).fill("")]);
        this.replaceTableContent(enhancedHeaders, enhancedData, true);
        this.showQuickNotification("✅ Import avec colonnes test terminé!");
        this.notifyTableStructureChange("excel_import_test", { rowCount: enhancedData.length });
        this.syncWithDev();
      } catch (error) { this.showAlert(`❌ Erreur: ${error.message}`); }
    }

    async exportExcel() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      try {
        this.showQuickNotification("📊 Préparation export avec styles...");
        await this.ensureSheetJSStyleLoaded();
        const tableData = this.getTableDataArray();
        if (!tableData || tableData.length === 0) { this.showAlert("⚠️ Table vide."); return; }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(tableData);

        // Appliquer les styles professionnels
        this.applyExcelStyles(ws, tableData);

        // Définir les largeurs de colonnes automatiques
        const colWidths = this.calculateColumnWidths(tableData);
        ws['!cols'] = colWidths;

        // Configurer le workbook pour le freeze pane
        if (!wb.Workbook) wb.Workbook = {};
        if (!wb.Workbook.Views) wb.Workbook.Views = [{}];

        XLSX.utils.book_append_sheet(wb, ws, "Export ClaraVerse");

        // Figer la première ligne (volets figés sur ligne 1)
        // Méthode 1: via SheetViews (recommandée pour xlsx-js-style)
        if (!ws['!views']) ws['!views'] = [{}];
        ws['!views'][0] = {
          state: 'frozen',
          xSplit: 0,
          ySplit: 1,
          topLeftCell: 'A2',
          activeCell: 'A2'
        };

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        XLSX.writeFile(wb, `claraverse_export_${timestamp}.xlsx`);
        this.showQuickNotification("✅ Export Excel avec styles terminé!");
      } catch (error) {
        console.error("Erreur export Excel:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Exporter les tables de la div active dans un seul onglet Excel
     * Les tables sont séparées par une ligne vide
     * Style: en-têtes rouge bordeaux, fond blanc, bordures noires
     */
    async exportTemplate() {
      try {
        this.showQuickNotification("📊 Export template en cours...");
        await this.ensureSheetJSStyleLoaded();

        // Chercher les tables dans le contexte de la table active
        let tables = this.findRelatedTables();

        if (tables.length === 0) {
          this.showAlert("⚠️ Aucune table trouvée dans le contexte actuel.");
          return;
        }

        console.log(`📊 Export template: ${tables.length} tables trouvées dans le contexte`);

        // Construire les données combinées avec lignes vides entre tables
        const allData = [];
        const headerRows = []; // Pour tracker les lignes d'en-tête

        tables.forEach((table, tableIndex) => {
          // Ajouter une ligne vide entre les tables (sauf avant la première)
          if (tableIndex > 0) {
            allData.push([]);
          }

          // Marquer la ligne d'en-tête de cette table
          headerRows.push(allData.length);

          // Extraire les données avec colonnes optimisées
          const tableData = this.extractTableDataOptimized(table);
          tableData.forEach(rowData => {
            if (rowData.length > 0) {
              allData.push(rowData);
            }
          });
        });

        if (allData.length === 0) {
          this.showAlert("⚠️ Aucune donnée à exporter.");
          return;
        }

        // Créer le workbook et la feuille
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(allData);

        // Appliquer les styles avec les en-têtes multiples
        this.applyTemplateStyles(ws, allData, headerRows);

        // Calculer les largeurs de colonnes
        const colWidths = this.calculateColumnWidths(allData);
        ws['!cols'] = colWidths;

        // Configurer le workbook
        if (!wb.Workbook) wb.Workbook = {};
        if (!wb.Workbook.Views) wb.Workbook.Views = [{}];

        XLSX.utils.book_append_sheet(wb, ws, "Template Export");

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        XLSX.writeFile(wb, `claraverse_template_${timestamp}.xlsx`);
        this.showQuickNotification(`✅ Export template terminé! (${tables.length} tables)`);
      } catch (error) {
        console.error("Erreur export template:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Exporter toutes les tables de la div dans un document Word (.docx)
     * Utilise le backend Python pour une génération fiable
     * Style: en-têtes rouge bordeaux, fond blanc, bordures noires
     */
    async exportTemplateWord() {
      try {
        this.showQuickNotification("📄 Export Word en cours...");

        // Chercher les tables dans le contexte de la table active
        let tables = this.findRelatedTables();

        if (tables.length === 0) {
          this.showAlert("⚠️ Aucune table trouvée dans le contexte actuel.");
          return;
        }

        console.log(`📄 Export Word: ${tables.length} tables trouvées dans le contexte`);

        // Préparer les données des tables pour le backend
        const tablesData = [];
        tables.forEach(table => {
          const tableData = this.extractTableDataOptimized(table);
          if (tableData.length > 0) {
            // Séparer les en-têtes des données
            const headers = tableData[0] || [];
            const rows = tableData.slice(1);
            tablesData.push({ headers, rows });
          }
        });

        if (tablesData.length === 0) {
          this.showAlert("⚠️ Aucune donnée à exporter.");
          return;
        }

        // Appeler le backend Python
        const response = await fetch(`${getBackendBaseUrl()}/api/word/export`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tables: tablesData })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Erreur serveur');
        }

        // Télécharger le fichier
        const blob = await response.blob();
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const filename = `claraverse_template_${timestamp}.docx`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        this.showQuickNotification(`✅ Export Word terminé! (${tables.length} tables)`);
      } catch (error) {
        console.error("Erreur export Word:", error);
        // Fallback vers la méthode JS si le backend n'est pas disponible
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          console.log("⚠️ Backend non disponible, tentative avec JS...");
          return this.exportTemplateWordJS();
        }
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Export Word via JavaScript (fallback)
     */
    async exportTemplateWordJS() {
      try {
        await this.ensureDocxLibraryLoaded();
        const docxLib = this.getDocxLib();

        let tables = this.findRelatedTables();
        if (tables.length === 0) {
          this.showAlert("⚠️ Aucune table trouvée.");
          return;
        }

        const doc = this.createWordDocument(tables);
        const blob = await docxLib.Packer.toBlob(doc);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const filename = `claraverse_template_${timestamp}.docx`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        this.showQuickNotification(`✅ Export Word terminé! (${tables.length} tables)`);
      } catch (error) {
        console.error("Erreur export Word JS:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Exporter la table active en rapport d'audit structuré
     * Génère un document Word avec les sections: Observation, Constat, Risque, Recommandation, etc.
     * @param {string} etape - Optionnel: 'synthese_frap', 'rapport_provisoire', 'rapport_final'
     */
    async exportAuditReport(etape = null) {
      try {
        this.showQuickNotification("📋 Export Rapport d'Audit en cours...");

        if (!this.targetTable) {
          this.showAlert("⚠️ Aucune table sélectionnée. Cliquez d'abord sur une table.");
          return;
        }

        // Extraire les données de la table active
        const tableData = this.extractTableDataOptimized(this.targetTable);

        if (tableData.length < 2) {
          this.showAlert("⚠️ La table doit contenir au moins un en-tête et une ligne de données.");
          return;
        }

        const headers = tableData[0] || [];
        const rows = tableData.slice(1);

        console.log(`📋 Export Rapport Audit: ${rows.length} constatations`);
        console.log(`📊 Colonnes détectées: ${headers.join(', ')}`);

        // Détecter l'étape de mission si non spécifiée
        if (!etape) {
          etape = this.detectAuditStage(headers);
          console.log(`🔍 Étape détectée automatiquement: ${etape}`);
        }

        // Chercher une référence dans les métadonnées de la table (si disponible)
        let reference = null;
        const refRow = rows.find(row => {
          const firstCell = (row[0] || '').toLowerCase();
          return firstCell.includes('reference') || firstCell.includes('référence') || firstCell.includes('ref');
        });
        if (refRow && refRow[1]) {
          reference = refRow[1];
        }

        // Préparer la requête pour le backend
        const requestData = {
          headers: headers,
          rows: rows,
          etape: etape,
          reference: reference
        };

        try {
          // Appeler le backend Python
          const response = await fetch(`${getBackendBaseUrl()}/api/word/export-rapport`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur serveur');
          }

          // Télécharger le fichier
          const blob = await response.blob();
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
          const etapeLabel = {
            'synthese_frap': 'synthese_frap',
            'rapport_provisoire': 'rapport_provisoire',
            'rapport_final': 'rapport_final'
          }[etape] || 'rapport';
          const filename = `rapport_audit_${etapeLabel}_${timestamp}.docx`;

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);

          this.showQuickNotification(`✅ Rapport d'audit exporté! (${rows.length} constatations)`);
        } catch (backendError) {
          console.error("Erreur backend:", backendError);

          // Fallback vers génération JS si le backend n'est pas disponible
          if (backendError.message.includes('fetch') || backendError.message.includes('NetworkError') || backendError.message.includes('Failed')) {
            console.log("⚠️ Backend non disponible, utilisation du fallback JS...");
            return this.exportAuditReportJS(headers, rows, etape);
          }

          this.showAlert(`❌ Erreur: ${backendError.message}`);
        }
      } catch (error) {
        console.error("Erreur export rapport audit:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Détecter l'étape de mission d'audit basée sur les colonnes présentes
     */
    detectAuditStage(headers) {
      const headersLower = headers.map(h => (h || '').toLowerCase());

      // Vérifier si c'est un rapport final (a plan_action, responsable, delai)
      const hasPlanAction = headersLower.some(h => h.includes('plan') && h.includes('action'));
      const hasResponsable = headersLower.some(h => h.includes('responsable'));
      const hasDelai = headersLower.some(h => h.includes('delai') || h.includes('délai') || h.includes('echeance'));

      if (hasPlanAction || hasResponsable || hasDelai) {
        return 'rapport_final';
      }

      // Vérifier si c'est un rapport provisoire (a commentaire_audite)
      const hasCommentaireAudite = headersLower.some(h =>
        (h.includes('commentaire') && h.includes('audit')) ||
        h.includes('reponse') || h.includes('réponse')
      );

      if (hasCommentaireAudite) {
        return 'rapport_provisoire';
      }

      // Par défaut, c'est une synthèse FRAP
      return 'synthese_frap';
    }

    /**
     * Export Rapport Audit via JavaScript (fallback si backend non disponible)
     */
    async exportAuditReportJS(headers, rows, etape) {
      try {
        await this.ensureDocxLibraryLoaded();
        const docxLib = this.getDocxLib();

        // Mapper les colonnes
        const columnIndexes = this.mapAuditColumns(headers);
        console.log("📊 Colonnes mappées:", columnIndexes);

        const children = [];
        const blueColor = "1E3A8A";  // Bleu foncé professionnel

        // Titre
        children.push(new docxLib.Paragraph({
          children: [new docxLib.TextRun({
            text: "RAPPORT D'AUDIT",
            bold: true,
            size: 32,
            color: blueColor
          })],
          alignment: docxLib.AlignmentType.CENTER,
          spacing: { after: 200 }
        }));

        // Sous-titre avec l'étape
        const etapeLabels = {
          'synthese_frap': 'Synthèse des FRAP',
          'rapport_provisoire': 'Rapport Provisoire',
          'rapport_final': 'Rapport Final'
        };
        children.push(new docxLib.Paragraph({
          children: [new docxLib.TextRun({
            text: etapeLabels[etape] || 'Rapport',
            italics: true,
            size: 28
          })],
          alignment: docxLib.AlignmentType.CENTER,
          spacing: { after: 400 }
        }));

        // Traiter chaque ligne comme une constatation
        rows.forEach((row, rowIdx) => {
          const no = columnIndexes.no >= 0 && row[columnIndexes.no] ? row[columnIndexes.no] : String(rowIdx + 1);
          const intitule = columnIndexes.intitule >= 0 && row[columnIndexes.intitule] ? row[columnIndexes.intitule] : `Constatation ${no}`;

          // Titre de la section
          children.push(new docxLib.Paragraph({
            children: [new docxLib.TextRun({
              text: `${no}. ${intitule}`,
              bold: true,
              size: 26,
              color: blueColor
            })],
            heading: docxLib.HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }));

          // Observation
          if (columnIndexes.observation >= 0 && row[columnIndexes.observation]) {
            children.push(this.createAuditSection(docxLib, "Observation/Analyse", row[columnIndexes.observation], blueColor));
          }

          // Constat
          if (columnIndexes.constat >= 0 && row[columnIndexes.constat]) {
            children.push(this.createAuditSection(docxLib, "Constat", row[columnIndexes.constat], blueColor));
          }

          // Risque
          if (columnIndexes.risque >= 0 && row[columnIndexes.risque]) {
            children.push(this.createAuditSection(docxLib, "Risque(s) / Incidence(s)", row[columnIndexes.risque], blueColor));
          }

          // Recommandation
          if (columnIndexes.recommandation >= 0 && row[columnIndexes.recommandation]) {
            children.push(this.createAuditSection(docxLib, "Recommandation", row[columnIndexes.recommandation], blueColor));
          }

          // Commentaire audité
          if (columnIndexes.commentaire_audite >= 0 && row[columnIndexes.commentaire_audite]) {
            children.push(this.createAuditSection(docxLib, "Commentaire de l'audité", row[columnIndexes.commentaire_audite], blueColor));
          }

          // Commentaire auditeur
          if (columnIndexes.commentaire_auditeur >= 0 && row[columnIndexes.commentaire_auditeur]) {
            children.push(this.createAuditSection(docxLib, "Commentaire de l'auditeur", row[columnIndexes.commentaire_auditeur], blueColor));
          }

          // Plan d'action
          if (columnIndexes.plan_action >= 0 && row[columnIndexes.plan_action]) {
            children.push(this.createAuditSection(docxLib, "Plan d'action", row[columnIndexes.plan_action], blueColor));
          }

          // Tableau Actions/Responsables/Délai
          const responsable = columnIndexes.responsable >= 0 ? row[columnIndexes.responsable] : null;
          const delai = columnIndexes.delai >= 0 ? row[columnIndexes.delai] : null;

          if (responsable || delai) {
            const planAction = columnIndexes.plan_action >= 0 ? row[columnIndexes.plan_action] : '';
            children.push(this.createActionTable(docxLib, planAction, responsable, delai, blueColor));
          }

          // Séparateur
          children.push(new docxLib.Paragraph({
            children: [new docxLib.TextRun({
              text: "─".repeat(50),
              color: "C8C8C8"
            })],
            alignment: docxLib.AlignmentType.CENTER,
            spacing: { before: 200, after: 200 }
          }));
        });

        const doc = new docxLib.Document({
          sections: [{
            properties: {
              page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }
            },
            children: children
          }]
        });

        const blob = await docxLib.Packer.toBlob(doc);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const filename = `rapport_audit_${etape}_${timestamp}.docx`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        this.showQuickNotification(`✅ Rapport d'audit exporté! (${rows.length} constatations)`);
      } catch (error) {
        console.error("Erreur export rapport audit JS:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Mapper les colonnes d'audit aux index
     */
    mapAuditColumns(headers) {
      const columnMapping = {
        no: ['no', 'n°', 'numero', 'numéro', 'num', '#'],
        intitule: ['intitule', 'intitulé', 'titre', 'libelle', 'libellé', 'designation', 'désignation'],
        observation: ['observation', 'observations', 'analyse', 'contexte'],
        constat: ['constat', 'constats', 'finding', 'findings', 'anomalie', 'anomalies'],
        risque: ['risque', 'risques', 'risk', 'risks', 'incidence', 'incidences', 'impact', 'impacts'],
        recommandation: ['recommandation', 'recommandations', 'recommendation', 'recommendations', 'preconisation', 'préconisation'],
        commentaire_audite: ['commentaire audite', 'commentaire audité', 'reponse audite', 'réponse audité', 'reponse audité'],
        commentaire_auditeur: ['commentaire auditeur', 'reponse auditeur', 'réponse auditeur'],
        plan_action: ['plan action', 'plan d\'action', 'actions', 'action'],
        responsable: ['responsable', 'responsables', 'owner', 'pilote'],
        delai: ['delai', 'délai', 'echeance', 'échéance', 'deadline', 'date']
      };

      const indexes = {};
      for (const [key, variants] of Object.entries(columnMapping)) {
        indexes[key] = -1;
        for (let i = 0; i < headers.length; i++) {
          const h = (headers[i] || '').toLowerCase().trim();
          for (const variant of variants) {
            if (h === variant || h.includes(variant) || variant.includes(h)) {
              indexes[key] = i;
              break;
            }
          }
          if (indexes[key] >= 0) break;
        }
      }
      return indexes;
    }

    /**
     * Créer une section de rapport d'audit (titre + contenu)
     */
    createAuditSection(docxLib, title, content, color) {
      const children = [];

      // Titre de la section
      children.push(new docxLib.Paragraph({
        children: [new docxLib.TextRun({
          text: title,
          bold: true,
          color: color,
          size: 22
        })],
        spacing: { before: 200, after: 100 }
      }));

      // Contenu (traiter les retours à la ligne)
      const lines = (content || '').replace(/\\n/g, '\n').split('\n');
      lines.forEach(line => {
        line = line.trim();
        if (line) {
          const isBullet = line.startsWith('-') || line.startsWith('•');
          if (isBullet) {
            line = line.substring(1).trim();
          }
          children.push(new docxLib.Paragraph({
            children: [new docxLib.TextRun({
              text: isBullet ? `• ${line}` : line,
              size: 20
            })],
            indent: { left: 360 }
          }));
        }
      });

      return new docxLib.Paragraph({
        children: children.flatMap(p => p.children || []),
        spacing: { after: 100 }
      });
    }

    /**
     * Créer le tableau Actions/Responsables/Délai
     */
    createActionTable(docxLib, planAction, responsable, delai, color) {
      const tableRows = [
        new docxLib.TableRow({
          children: ['Actions', 'Responsables', 'Délai'].map(text =>
            new docxLib.TableCell({
              children: [new docxLib.Paragraph({
                children: [new docxLib.TextRun({
                  text: text,
                  bold: true,
                  color: "FFFFFF",
                  size: 18
                })],
                alignment: docxLib.AlignmentType.CENTER
              })],
              shading: { fill: color }
            })
          )
        }),
        new docxLib.TableRow({
          children: [planAction || '', responsable || '', delai || ''].map(text =>
            new docxLib.TableCell({
              children: [new docxLib.Paragraph({
                children: [new docxLib.TextRun({
                  text: text,
                  size: 18
                })]
              })]
            })
          )
        })
      ];

      return new docxLib.Table({
        rows: tableRows,
        width: { size: 100, type: docxLib.WidthType.PERCENTAGE }
      });
    }

    /**
     * Exporter une FRAP individuelle (structure multi-tables à une colonne)
     * Collecte toutes les tables dans le contexte et les envoie au backend
     */
    async exportFrapIndividuelle() {
      try {
        this.showQuickNotification("📝 Export FRAP Individuelle en cours...");

        // Trouver toutes les tables dans le contexte de la table active
        let tables = this.findRelatedTables();

        if (tables.length === 0) {
          this.showAlert("⚠️ Aucune table trouvée dans le contexte actuel.");
          return;
        }

        console.log(`📝 Export FRAP: ${tables.length} tables trouvées`);

        // Extraire les données de chaque table (structure une colonne)
        const frapTables = [];
        let reference = null;
        let norme = null;
        let methode = null;

        tables.forEach(table => {
          const rows = table.querySelectorAll('tr');
          if (rows.length === 0) return;

          // Récupérer l'en-tête (première ligne ou th)
          const headerRow = rows[0];
          const headerCells = headerRow.querySelectorAll('th, td');

          if (headerCells.length === 0) return;

          // Pour les tables à une colonne
          if (headerCells.length === 1) {
            const header = headerCells[0].textContent?.trim() || '';

            // Récupérer le contenu (deuxième ligne)
            let content = '';
            if (rows.length > 1) {
              const contentRow = rows[1];
              const contentCells = contentRow.querySelectorAll('td');
              if (contentCells.length > 0) {
                content = contentCells[0].innerHTML?.trim() || contentCells[0].textContent?.trim() || '';
                // Convertir les <br> en texte
                content = content.replace(/<br\s*\/?>/gi, '\n');
                // Supprimer les autres balises HTML
                content = content.replace(/<[^>]*>/g, '');
              }
            }

            if (header && content) {
              frapTables.push({ header, content });
            }
          }
          // Pour les tables à deux colonnes (métadonnées: Rubrique | Description)
          else if (headerCells.length === 2) {
            const firstHeader = headerCells[0].textContent?.trim().toLowerCase() || '';

            if (firstHeader.includes('rubrique')) {
              // C'est une table de métadonnées
              for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length >= 2) {
                  const rubrique = cells[0].textContent?.trim().toLowerCase() || '';
                  const description = cells[1].textContent?.trim() || '';

                  if (rubrique.includes('reference') || rubrique.includes('référence')) {
                    reference = description;
                  } else if (rubrique.includes('norme')) {
                    norme = description;
                  } else if (rubrique.includes('methode') || rubrique.includes('méthode')) {
                    methode = description;
                  }
                }
              }
            }
          }
        });

        if (frapTables.length === 0) {
          this.showAlert("⚠️ Aucune donnée FRAP trouvée. Assurez-vous que les tables ont une structure à une colonne.");
          return;
        }

        console.log(`📊 Tables FRAP extraites: ${frapTables.length}`);
        console.log(`📋 Référence: ${reference}, Norme: ${norme}, Méthode: ${methode}`);

        // Préparer la requête pour le backend
        const requestData = {
          tables: frapTables,
          reference: reference,
          norme: norme,
          methode: methode
        };

        try {
          // Appeler le backend Python
          const response = await fetch(`${getBackendBaseUrl()}/api/word/export-frap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur serveur');
          }

          // Télécharger le fichier
          const blob = await response.blob();
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
          const filename = `frap_${reference || 'export'}_${timestamp}.docx`;

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);

          this.showQuickNotification(`✅ FRAP exportée! (${frapTables.length} sections)`);
        } catch (backendError) {
          console.error("Erreur backend:", backendError);

          // Fallback vers génération JS si le backend n'est pas disponible
          if (backendError.message.includes('fetch') || backendError.message.includes('NetworkError') || backendError.message.includes('Failed')) {
            console.log("⚠️ Backend non disponible, utilisation du fallback JS...");
            return this.exportFrapIndividuelleJS(frapTables, reference, norme, methode);
          }

          this.showAlert(`❌ Erreur: ${backendError.message}`);
        }
      } catch (error) {
        console.error("Erreur export FRAP:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Export FRAP Individuelle via JavaScript (fallback si backend non disponible)
     */
    async exportFrapIndividuelleJS(frapTables, reference, norme, methode) {
      try {
        await this.ensureDocxLibraryLoaded();
        const docxLib = this.getDocxLib();

        const children = [];
        const blueColor = "1E3A8A";  // Bleu foncé

        // Titre
        children.push(new docxLib.Paragraph({
          children: [new docxLib.TextRun({
            text: "FICHE DE RÉVÉLATION ET D'ANALYSE DE PROBLÈME",
            bold: true,
            size: 32,
            color: blueColor
          })],
          alignment: docxLib.AlignmentType.CENTER,
          spacing: { after: 100 }
        }));

        // Sous-titre FRAP
        children.push(new docxLib.Paragraph({
          children: [new docxLib.TextRun({
            text: "FRAP",
            bold: true,
            size: 28,
            color: blueColor
          })],
          alignment: docxLib.AlignmentType.CENTER,
          spacing: { after: 400 }
        }));

        // Métadonnées
        if (reference || norme || methode) {
          const metaRows = [];
          if (reference) {
            metaRows.push(['Référence', reference]);
          }
          if (norme) {
            metaRows.push(['Norme', norme]);
          }
          if (methode) {
            metaRows.push(['Méthode', methode]);
          }

          const metaTableRows = metaRows.map(([label, value]) =>
            new docxLib.TableRow({
              children: [
                new docxLib.TableCell({
                  children: [new docxLib.Paragraph({
                    children: [new docxLib.TextRun({
                      text: label,
                      bold: true,
                      color: "FFFFFF",
                      size: 20
                    })]
                  })],
                  shading: { fill: blueColor }
                }),
                new docxLib.TableCell({
                  children: [new docxLib.Paragraph({
                    children: [new docxLib.TextRun({
                      text: value,
                      size: 20
                    })]
                  })]
                })
              ]
            })
          );

          children.push(new docxLib.Table({
            rows: metaTableRows,
            width: { size: 100, type: docxLib.WidthType.PERCENTAGE }
          }));

          children.push(new docxLib.Paragraph({ text: "", spacing: { after: 200 } }));
        }

        // Sections de contenu
        const sectionMapping = {
          'intitulé': 'INTITULÉ',
          'intitule': 'INTITULÉ',
          'observation': 'OBSERVATION / ANALYSE',
          'constat': 'CONSTAT',
          'risque': 'RISQUE(S) / INCIDENCE(S)',
          'recommendation': 'RECOMMANDATION',
          'recommandation': 'RECOMMANDATION'
        };

        frapTables.forEach(table => {
          const headerLower = table.header.toLowerCase();
          let sectionTitle = table.header.toUpperCase();

          // Mapper vers le titre standard
          for (const [key, title] of Object.entries(sectionMapping)) {
            if (headerLower.includes(key)) {
              sectionTitle = title;
              break;
            }
          }

          // Titre de section
          children.push(new docxLib.Paragraph({
            children: [new docxLib.TextRun({
              text: sectionTitle,
              bold: true,
              size: 24,
              color: blueColor
            })],
            spacing: { before: 200, after: 100 }
          }));

          // Contenu
          const lines = table.content.split('\n');
          lines.forEach(line => {
            line = line.trim();
            if (line) {
              const isBullet = line.startsWith('-') || line.startsWith('•');
              if (isBullet) {
                line = line.substring(1).trim();
              }
              children.push(new docxLib.Paragraph({
                children: [new docxLib.TextRun({
                  text: isBullet ? `• ${line}` : line,
                  size: 20
                })],
                indent: { left: 360 }
              }));
            }
          });

          children.push(new docxLib.Paragraph({ text: "", spacing: { after: 100 } }));
        });

        const doc = new docxLib.Document({
          sections: [{
            properties: {
              page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }
            },
            children: children
          }]
        });

        const blob = await docxLib.Packer.toBlob(doc);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const filename = `frap_${reference || 'export'}_${timestamp}.docx`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        this.showQuickNotification(`✅ FRAP exportée! (${frapTables.length} sections)`);
      } catch (error) {
        console.error("Erreur export FRAP JS:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Charger la bibliothèque docx pour créer des documents Word (fallback JS)
     */
    async ensureDocxLibraryLoaded() {
      // Vérifier si docx est déjà disponible
      if (this._docxLib) {
        console.log("✅ docx déjà en cache");
        return;
      }
      if (typeof window !== "undefined" && window.docx && window.docx.Document) {
        this._docxLib = window.docx;
        console.log("✅ window.docx déjà disponible");
        return;
      }

      return new Promise((resolve, reject) => {
        // Vérifier si le script est déjà chargé
        const existingScript = document.querySelector('script[src*="docx"]');
        if (existingScript) {
          // Attendre que la lib soit disponible
          let attempts = 0;
          const checkLib = setInterval(() => {
            attempts++;
            if (window.docx && window.docx.Document) {
              clearInterval(checkLib);
              this._docxLib = window.docx;
              console.log("✅ docx trouvé après attente");
              resolve();
            } else if (attempts > 50) {
              clearInterval(checkLib);
              reject(new Error("Timeout: docx non accessible"));
            }
          }, 100);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/docx@8.5.0/build/index.umd.js";
        script.onload = () => {
          // Attendre que la bibliothèque s'initialise
          let attempts = 0;
          const checkLib = setInterval(() => {
            attempts++;
            if (window.docx && window.docx.Document) {
              clearInterval(checkLib);
              this._docxLib = window.docx;
              console.log("✅ Bibliothèque docx chargée avec succès");
              resolve();
            } else if (attempts > 50) {
              clearInterval(checkLib);
              reject(new Error("docx chargé mais Document non accessible"));
            }
          }, 100);
        };
        script.onerror = () => reject(new Error("Impossible de charger la bibliothèque docx"));
        document.head.appendChild(script);
      });
    }

    /**
     * Obtenir la référence à la bibliothèque docx
     */
    getDocxLib() {
      if (this._docxLib) return this._docxLib;
      if (typeof window !== "undefined" && window.docx) {
        this._docxLib = window.docx;
        return this._docxLib;
      }
      throw new Error("Bibliothèque docx non disponible");
    }

    /**
     * Créer un document Word avec toutes les tables
     * @param {NodeList} tables - Liste des tables HTML
     * @returns {docx.Document} Document Word
     */
    createWordDocument(tables) {
      const docxLib = this.getDocxLib();
      const children = [];

      // Couleur bordeaux pour les en-têtes
      const burgundyColor = "800020";
      const whiteColor = "FFFFFF";
      const blackColor = "000000";

      tables.forEach((table, tableIndex) => {
        // Ajouter un espace entre les tables (sauf avant la première)
        if (tableIndex > 0) {
          children.push(new docxLib.Paragraph({ text: "", spacing: { after: 200 } }));
        }

        // Extraire les données de la table
        const rows = table.querySelectorAll('tr');
        const tableRows = [];

        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('th, td');
          const isHeader = rowIndex === 0 || row.querySelector('th') !== null;

          const tableCells = Array.from(cells).map((cell) => {
            const cellText = cell.textContent?.trim() || '';

            if (isHeader) {
              // Style en-tête: fond bordeaux, texte blanc, gras
              return new docxLib.TableCell({
                children: [new docxLib.Paragraph({
                  children: [new docxLib.TextRun({
                    text: cellText,
                    bold: true,
                    color: whiteColor,
                    size: 22
                  })],
                  alignment: docxLib.AlignmentType.CENTER
                })],
                shading: { fill: burgundyColor },
                borders: {
                  top: { style: docxLib.BorderStyle.SINGLE, size: 1, color: blackColor },
                  bottom: { style: docxLib.BorderStyle.SINGLE, size: 1, color: blackColor },
                  left: { style: docxLib.BorderStyle.SINGLE, size: 1, color: blackColor },
                  right: { style: docxLib.BorderStyle.SINGLE, size: 1, color: blackColor }
                },
                verticalAlign: docxLib.VerticalAlign.CENTER
              });
            } else {
              // Style données: fond blanc, texte noir
              return new docxLib.TableCell({
                children: [new docxLib.Paragraph({
                  children: [new docxLib.TextRun({
                    text: cellText,
                    color: blackColor,
                    size: 20
                  })]
                })],
                shading: { fill: whiteColor },
                borders: {
                  top: { style: docxLib.BorderStyle.SINGLE, size: 1, color: blackColor },
                  bottom: { style: docxLib.BorderStyle.SINGLE, size: 1, color: blackColor },
                  left: { style: docxLib.BorderStyle.SINGLE, size: 1, color: blackColor },
                  right: { style: docxLib.BorderStyle.SINGLE, size: 1, color: blackColor }
                },
                verticalAlign: docxLib.VerticalAlign.CENTER
              });
            }
          });

          if (tableCells.length > 0) {
            tableRows.push(new docxLib.TableRow({ children: tableCells }));
          }
        });

        if (tableRows.length > 0) {
          children.push(new docxLib.Table({
            rows: tableRows,
            width: { size: 100, type: docxLib.WidthType.PERCENTAGE }
          }));
        }
      });

      return new docxLib.Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 }
            }
          },
          children: children
        }]
      });
    }

    /**
     * Intégration Doc: Collecte les tables, crée un document Word et l'intègre dans la div
     * Remplace toutes les tables par un viewer du document avec affichage intégral
     * Utilise le backend Python pour la génération Word + mammoth.js pour l'affichage
     */
    async integrationDoc() {
      try {
        this.showQuickNotification("📄 Intégration Doc en cours...");

        // Chercher toutes les tables dans le contexte de la table active
        let tables = this.findRelatedTables();

        if (tables.length === 0) {
          this.showAlert("⚠️ Aucune table trouvée dans le contexte actuel.");
          return;
        }

        console.log(`📄 Intégration Doc: ${tables.length} tables trouvées dans le contexte`);

        // Trouver le conteneur parent pour l'insertion
        const container = this.targetTable?.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none')
          || this.targetTable?.closest('.chat-message')
          || this.targetTable?.closest('.message-content')
          || document.querySelector('div.prose.prose-base.dark\\:prose-invert.max-w-none')
          || document.querySelector('.chat-messages')
          || tables[0].parentElement;

        // Préparer les données des tables pour le backend avec détection des colonnes de risque
        const tablesData = [];
        tables.forEach(table => {
          const tableData = this.extractTableDataOptimized(table);
          if (tableData.length > 0) {
            const headers = tableData[0] || [];
            const rows = tableData.slice(1);
            tablesData.push({ headers, rows });
          }
        });

        if (tablesData.length === 0) {
          this.showAlert("⚠️ Aucune donnée à intégrer.");
          return;
        }

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const filename = `claraverse_integration_${timestamp}.docx`;

        let blob;
        try {
          // Essayer d'utiliser le backend Python
          const response = await fetch(`${getBackendBaseUrl()}/api/word/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tables: tablesData, filename })
          });

          if (!response.ok) {
            throw new Error('Backend non disponible');
          }

          blob = await response.blob();
          console.log("✅ Document généré via backend Python");
        } catch (backendError) {
          // Fallback vers JS si le backend n'est pas disponible
          console.log("⚠️ Backend non disponible, utilisation du fallback JS");
          await this.ensureDocxLibraryLoaded();
          const docxLib = this.getDocxLib();
          const doc = this.createWordDocument(tables);
          blob = await docxLib.Packer.toBlob(doc);
        }

        // Créer l'URL du blob pour le téléchargement
        const blobUrl = URL.createObjectURL(blob);

        // Créer le conteneur d'intégration avec affichage intégral du document
        const integrationContainer = await this.createDocIntegrationViewFull(blob, blobUrl, filename, tables.length, tablesData);

        // Supprimer toutes les tables existantes
        tables.forEach(table => {
          const wrapper = table.closest('.table-wrapper') || table.closest('.overflow-x-auto') || table;
          wrapper.remove();
        });

        // Ajouter le conteneur d'intégration au début du conteneur principal
        container.insertBefore(integrationContainer, container.firstChild);

        this.showQuickNotification(`✅ Intégration Doc terminée! (${tables.length} tables intégrées)`);
      } catch (error) {
        console.error("Erreur intégration Doc:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Créer la vue d'intégration avec affichage intégral du document
     */
    async createDocIntegrationViewFull(blob, blobUrl, filename, tableCount, tablesData) {
      const container = document.createElement('div');
      container.className = 'doc-integration-container-full';
      container.style.cssText = `
        background: white;
        border: 2px solid #800020;
        border-radius: 12px;
        margin: 16px 0;
        box-shadow: 0 4px 20px rgba(128, 0, 32, 0.2);
        overflow: hidden;
      `;

      // Header avec titre et boutons
      const header = document.createElement('div');
      header.style.cssText = `
        background: linear-gradient(135deg, #800020 0%, #600018 100%);
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      `;

      const titleSection = document.createElement('div');
      titleSection.style.cssText = 'display: flex; align-items: center; gap: 12px;';
      titleSection.innerHTML = `
        <span style="font-size: 28px;">📄</span>
        <div>
          <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">Document Word Intégré</h3>
          <p style="margin: 2px 0 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">${filename} • ${tableCount} table(s) • ${this.formatFileSize(blob.size)}</p>
        </div>
      `;
      header.appendChild(titleSection);

      // Boutons d'action
      const actionsHeader = document.createElement('div');
      actionsHeader.style.cssText = 'display: flex; gap: 8px;';

      const downloadBtn = document.createElement('a');
      downloadBtn.href = blobUrl;
      downloadBtn.download = filename;
      downloadBtn.style.cssText = `
        display: inline-flex; align-items: center; gap: 6px;
        background: white; color: #800020;
        padding: 8px 16px; border-radius: 6px;
        text-decoration: none; font-weight: 500; font-size: 13px;
        transition: all 0.2s; cursor: pointer;
      `;
      downloadBtn.innerHTML = '⬇️ Télécharger';
      downloadBtn.onmouseover = () => { downloadBtn.style.background = '#f0f0f0'; };
      downloadBtn.onmouseout = () => { downloadBtn.style.background = 'white'; };
      actionsHeader.appendChild(downloadBtn);

      const restoreBtn = document.createElement('button');
      restoreBtn.style.cssText = `
        display: inline-flex; align-items: center; gap: 6px;
        background: transparent; color: white;
        border: 1px solid rgba(255,255,255,0.5);
        padding: 8px 16px; border-radius: 6px;
        font-weight: 500; font-size: 13px; cursor: pointer;
        transition: all 0.2s;
      `;
      restoreBtn.innerHTML = '🔄 Restaurer tables';
      restoreBtn.onclick = () => {
        if (confirm('Restaurer les tables originales? La page sera rechargée.')) {
          location.reload();
        }
      };
      restoreBtn.onmouseover = () => { restoreBtn.style.background = 'rgba(255,255,255,0.1)'; };
      restoreBtn.onmouseout = () => { restoreBtn.style.background = 'transparent'; };
      actionsHeader.appendChild(restoreBtn);

      header.appendChild(actionsHeader);
      container.appendChild(header);

      // Contenu du document - Affichage intégral des tables avec couleurs
      const contentArea = document.createElement('div');
      contentArea.className = 'doc-content-area';
      contentArea.style.cssText = `
        padding: 24px;
        max-height: 70vh;
        overflow-y: auto;
        background: #fafafa;
      `;

      // Générer le HTML des tables avec les couleurs de risque
      const tablesHtml = this.generateTablesHtmlWithRiskColors(tablesData);
      contentArea.innerHTML = tablesHtml;

      container.appendChild(contentArea);

      return container;
    }

    /**
     * Générer le HTML des tables avec les couleurs de risque appliquées
     */
    generateTablesHtmlWithRiskColors(tablesData) {
      const riskColors = {
        'Faible': { bg: '#28A745', text: '#FFFFFF' },
        'Moyen': { bg: '#FFC107', text: '#000000' },
        'Eleve': { bg: '#DC3545', text: '#FFFFFF' }
      };

      let html = '';

      tablesData.forEach((tableData, tableIndex) => {
        // Détecter les colonnes de risque
        const riskColIndexes = this.findRiskColumnIndexesFromHeaders(tableData.headers);

        html += `
          <div style="margin-bottom: 24px;">
            <h4 style="color: #800020; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
              📊 Table ${tableIndex + 1}
            </h4>
            <div style="overflow-x: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <table style="width: 100%; border-collapse: collapse; background: white; font-size: 13px;">
                <thead>
                  <tr>
        `;

        // En-têtes
        tableData.headers.forEach(header => {
          html += `
            <th style="
              background: #800020;
              color: white;
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              border: 1px solid #600018;
              white-space: nowrap;
            ">${this.escapeHtml(header)}</th>
          `;
        });

        html += `
                  </tr>
                </thead>
                <tbody>
        `;

        // Lignes de données
        tableData.rows.forEach((row, rowIndex) => {
          html += `<tr style="background: ${rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa'};">`;

          row.forEach((cell, colIndex) => {
            const isRiskCol = riskColIndexes.probabilite === colIndex ||
              riskColIndexes.impact === colIndex ||
              riskColIndexes.criticite === colIndex;

            let cellStyle = `
              padding: 10px 16px;
              border: 1px solid #e0e0e0;
              text-align: left;
            `;

            // Appliquer les couleurs de risque si applicable
            if (isRiskCol && cell) {
              const riskLevel = this.normalizeRiskValue(cell);
              if (riskLevel && riskColors[riskLevel]) {
                cellStyle += `
                  background: ${riskColors[riskLevel].bg} !important;
                  color: ${riskColors[riskLevel].text} !important;
                  font-weight: bold;
                  text-align: center;
                `;
              }
            }

            html += `<td style="${cellStyle}">${this.escapeHtml(cell || '')}</td>`;
          });

          html += `</tr>`;
        });

        html += `
                </tbody>
              </table>
            </div>
          </div>
        `;
      });

      return html;
    }

    /**
     * Trouver les index des colonnes de risque à partir des en-têtes
     */
    findRiskColumnIndexesFromHeaders(headers) {
      const patterns = this.getRiskColumnPatterns();
      const indexes = { probabilite: -1, impact: -1, criticite: -1 };

      headers.forEach((header, idx) => {
        if (!header) return;
        const h = String(header).toLowerCase().trim();
        if (patterns.probabilite.test(h)) indexes.probabilite = idx;
        if (patterns.impact.test(h)) indexes.impact = idx;
        if (patterns.criticite.test(h)) indexes.criticite = idx;
      });

      return indexes;
    }

    /**
     * Échapper les caractères HTML
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Créer la vue d'intégration du document Word
     * @param {string} blobUrl - URL du blob du document
     * @param {string} filename - Nom du fichier
     * @param {number} tableCount - Nombre de tables intégrées
     * @param {number} fileSize - Taille du fichier en bytes
     * @returns {HTMLElement} Conteneur d'intégration
     */
    createDocIntegrationView(blobUrl, filename, tableCount, fileSize) {
      const container = document.createElement('div');
      container.className = 'doc-integration-container';
      container.style.cssText = `
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 2px solid #800020;
        border-radius: 12px;
        padding: 24px;
        margin: 16px 0;
        box-shadow: 0 4px 12px rgba(128, 0, 32, 0.15);
      `;

      // Icône et titre
      const header = document.createElement('div');
      header.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 16px;';
      header.innerHTML = `
        <div style="
          width: 48px; height: 48px; 
          background: #800020; 
          border-radius: 8px; 
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
        ">📄</div>
        <div>
          <h3 style="margin: 0; color: #800020; font-size: 18px; font-weight: 600;">Document Word Intégré</h3>
          <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">${filename}</p>
        </div>
      `;
      container.appendChild(header);

      // Informations
      const info = document.createElement('div');
      info.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 16px;
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      `;
      info.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #800020; font-weight: 500;">📊 Tables:</span>
          <span style="color: #333;">${tableCount}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #800020; font-weight: 500;">📁 Taille:</span>
          <span style="color: #333;">${this.formatFileSize(fileSize)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #800020; font-weight: 500;">🕐 Créé:</span>
          <span style="color: #333;">${new Date().toLocaleString('fr-FR')}</span>
        </div>
      `;
      container.appendChild(info);

      // Boutons d'action
      const actions = document.createElement('div');
      actions.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap;';

      // Bouton télécharger
      const downloadBtn = document.createElement('a');
      downloadBtn.href = blobUrl;
      downloadBtn.download = filename;
      downloadBtn.style.cssText = `
        display: inline-flex; align-items: center; gap: 8px;
        background: #800020; color: white;
        padding: 10px 20px; border-radius: 6px;
        text-decoration: none; font-weight: 500;
        transition: background 0.2s;
        cursor: pointer;
      `;
      downloadBtn.innerHTML = '⬇️ Télécharger le document';
      downloadBtn.onmouseover = () => downloadBtn.style.background = '#600018';
      downloadBtn.onmouseout = () => downloadBtn.style.background = '#800020';
      actions.appendChild(downloadBtn);

      // Bouton restaurer les tables
      const restoreBtn = document.createElement('button');
      restoreBtn.style.cssText = `
        display: inline-flex; align-items: center; gap: 8px;
        background: white; color: #800020;
        border: 2px solid #800020;
        padding: 10px 20px; border-radius: 6px;
        font-weight: 500; cursor: pointer;
        transition: all 0.2s;
      `;
      restoreBtn.innerHTML = '🔄 Restaurer les tables';
      restoreBtn.onclick = () => {
        // Recharger la page pour restaurer les tables depuis la sauvegarde
        if (confirm('Voulez-vous restaurer les tables originales? La page sera rechargée.')) {
          location.reload();
        }
      };
      restoreBtn.onmouseover = () => {
        restoreBtn.style.background = '#800020';
        restoreBtn.style.color = 'white';
      };
      restoreBtn.onmouseout = () => {
        restoreBtn.style.background = 'white';
        restoreBtn.style.color = '#800020';
      };
      actions.appendChild(restoreBtn);

      container.appendChild(actions);

      return container;
    }

    /**
     * Formater la taille d'un fichier en format lisible
     * @param {number} bytes - Taille en bytes
     * @returns {string} Taille formatée
     */
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    /**
     * Trouver toutes les tables dans la page avec plusieurs stratégies
     * @returns {NodeList|Array} Liste des tables trouvées
     */
    findAllTables() {
      // Stratégie 1: Chercher dans les conteneurs connus
      const selectors = [
        'div.prose.prose-base.dark\\:prose-invert.max-w-none table',
        '.chat-messages table',
        '.message-content table',
        'main table',
        '.overflow-x-auto table',
        '.table-wrapper table',
        '[class*="prose"] table',
        '[class*="chat"] table',
        '[class*="message"] table'
      ];

      for (const selector of selectors) {
        try {
          const tables = document.querySelectorAll(selector);
          if (tables.length > 0) {
            console.log(`✅ Tables trouvées avec: ${selector} (${tables.length})`);
            return tables;
          }
        } catch (e) {
          // Sélecteur invalide, continuer
        }
      }

      // Stratégie 2: Chercher toutes les tables visibles dans le document
      const allTables = document.querySelectorAll('table');
      const visibleTables = Array.from(allTables).filter(table => {
        // Exclure les tables cachées ou dans des menus
        const rect = table.getBoundingClientRect();
        const style = window.getComputedStyle(table);
        return rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          !table.closest('nav') &&
          !table.closest('[role="menu"]');
      });

      if (visibleTables.length > 0) {
        console.log(`✅ Tables visibles trouvées: ${visibleTables.length}`);
        return visibleTables;
      }

      // Stratégie 3: Retourner toutes les tables
      console.log(`📊 Toutes les tables: ${allTables.length}`);
      return allTables;
    }

    /**
     * Trouver les tables liées à la table active (dans le même conteneur/div)
     * @returns {NodeList|Array} Liste des tables dans le contexte (toutes les tables de la div parente)
     */
    findRelatedTables() {
      // Si une table est sélectionnée, chercher TOUTES les tables dans le conteneur parent (div du message)
      if (this.targetTable) {
        // Chercher le conteneur parent le plus large possible (le message complet)
        const container = this.targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none')
          || this.targetTable.closest('.chat-message')
          || this.targetTable.closest('.message-content')
          || this.targetTable.closest('[class*="message"]')
          || this.targetTable.closest('.overflow-x-auto')?.parentElement?.parentElement
          || this.targetTable.parentElement?.parentElement
          || this.targetTable.parentElement;

        if (container) {
          // Chercher toutes les tables dans ce conteneur
          const relatedTables = container.querySelectorAll('table');
          if (relatedTables.length > 0) {
            console.log(`✅ Toutes les tables de la div trouvées: ${relatedTables.length} tables`);
            return relatedTables;
          }
        }
      }

      // Fallback: utiliser findAllTables si pas de table active
      console.log("⚠️ Pas de table active, recherche globale");
      return this.findAllTables();
    }

    /**
     * Extraire les données d'une table en limitant aux colonnes non vides
     * @param {HTMLElement} table - Table HTML
     * @returns {Array} Données de la table avec colonnes optimisées
     */
    extractTableDataOptimized(table) {
      const rows = table.querySelectorAll('tr');
      if (rows.length === 0) return [];

      // Analyser toutes les lignes pour trouver le nombre de colonnes utiles
      let maxUsefulCols = 0;

      // D'abord, analyser l'en-tête (première ligne)
      const headerRow = rows[0];
      const headerCells = headerRow.querySelectorAll('th, td');

      // Trouver la dernière colonne non vide dans l'en-tête
      for (let i = 0; i < headerCells.length; i++) {
        const cellText = headerCells[i].textContent?.trim() || '';
        if (cellText !== '') {
          maxUsefulCols = i + 1;
        }
      }

      // Si l'en-tête n'a pas de colonnes utiles, analyser toutes les lignes
      if (maxUsefulCols === 0) {
        Array.from(rows).forEach(row => {
          const cells = row.querySelectorAll('th, td');
          for (let i = 0; i < cells.length; i++) {
            const cellText = cells[i].textContent?.trim() || '';
            if (cellText !== '') {
              maxUsefulCols = Math.max(maxUsefulCols, i + 1);
            }
          }
        });
      }

      // Si toujours 0, prendre toutes les colonnes
      if (maxUsefulCols === 0) {
        maxUsefulCols = headerCells.length;
      }

      console.log(`📊 Table: ${maxUsefulCols} colonnes utiles sur ${headerCells.length} total`);

      // Extraire les données en se limitant aux colonnes utiles
      const tableData = [];
      Array.from(rows).forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = [];

        for (let i = 0; i < maxUsefulCols && i < cells.length; i++) {
          // Extraire le contenu complet en préservant les retours à la ligne
          let cellContent = cells[i].textContent || '';
          
          // Préserver les retours à la ligne multiples
          cellContent = cellContent.replace(/\n\s*\n/g, '\n\n');
          
          // Nettoyer les espaces en début/fin mais préserver la structure
          cellContent = cellContent.trim();
          
          rowData.push(cellContent);
        }

        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      });

      return tableData;
    }
    /**
     * Extraire le contenu complet d'une cellule de table
     * Gère les tables avec 1 ou 2 colonnes (label + contenu)
     * Préserve les retours à la ligne et le formatage
     */
    extractFullCellContent(tableData) {
      if (!tableData || tableData.length === 0) return '';

      // Si la table a 2 colonnes (label + contenu), prendre la 2ème colonne
      if (tableData[0].length >= 2) {
        // Extraire toutes les lignes de la 2ème colonne et les joindre
        return tableData.map(row => row[1] || '').filter(text => text.trim() !== '').join('\n\n');
      }

      // Si la table a 1 colonne, prendre tout le contenu
      return tableData.map(row => row[0] || '').filter(text => text.trim() !== '').join('\n\n');
    }

    /**
     * Appliquer les styles pour l'export template (multi-tables)
     * @param {Object} ws - Worksheet
     * @param {Array} allData - Toutes les données
     * @param {Array} headerRows - Indices des lignes d'en-tête
     */
    applyTemplateStyles(ws, allData, headerRows) {
      if (!allData || allData.length === 0) return;

      // Trouver le nombre max de colonnes
      let maxCols = 0;
      allData.forEach(row => {
        if (row && row.length > maxCols) maxCols = row.length;
      });

      // Bordure noire fine
      const thinBlackBorder = {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } }
      };

      // Style pour les en-têtes (rouge bordeaux #800020, texte blanc, gras)
      const headerStyle = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: "800020" },
          bgColor: { rgb: "800020" }
        },
        font: {
          color: { rgb: "FFFFFF" },
          bold: true,
          sz: 11,
          name: "Calibri"
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true
        },
        border: thinBlackBorder
      };

      // Style pour les cellules de données (fond blanc, bordures noires)
      const dataStyle = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: "FFFFFF" },
          bgColor: { rgb: "FFFFFF" }
        },
        font: {
          color: { rgb: "000000" },
          sz: 10,
          name: "Calibri"
        },
        alignment: {
          vertical: "center",
          wrapText: true
        },
        border: thinBlackBorder
      };

      // Couleurs de risque pour Excel (sans le #)
      const riskColors = {
        'Faible': { bg: "28A745", text: "FFFFFF" },  // Vert
        'Moyen': { bg: "FFC107", text: "000000" },   // Jaune
        'Eleve': { bg: "DC3545", text: "FFFFFF" }    // Rouge
      };

      // Détecter les colonnes de risque pour chaque section de table
      const riskColumnsBySection = this.detectRiskColumnsInExportData(allData, headerRows);

      // Parcourir toutes les cellules et appliquer les styles
      for (let row = 0; row < allData.length; row++) {
        // Vérifier si c'est une ligne vide (séparateur)
        if (!allData[row] || allData[row].length === 0) continue;

        const isHeaderRow = headerRows.includes(row);

        // Trouver les colonnes de risque pour cette section
        const sectionRiskCols = this.getRiskColumnsForRow(row, riskColumnsBySection, headerRows);

        for (let col = 0; col < maxCols; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });

          // Créer ou récupérer la cellule
          if (!ws[cellRef]) {
            ws[cellRef] = { v: "", t: "s" };
          }

          // Appliquer le style approprié
          if (isHeaderRow) {
            ws[cellRef].s = headerStyle;
          } else {
            // Vérifier si c'est une cellule de risque
            const cellValue = allData[row][col];
            const isRiskColumn = sectionRiskCols && (
              sectionRiskCols.probabilite === col ||
              sectionRiskCols.impact === col ||
              sectionRiskCols.criticite === col
            );

            if (isRiskColumn && cellValue) {
              const riskLevel = this.normalizeRiskValue(cellValue);
              if (riskLevel && riskColors[riskLevel]) {
                // Appliquer le style de risque
                ws[cellRef].s = {
                  fill: {
                    patternType: "solid",
                    fgColor: { rgb: riskColors[riskLevel].bg },
                    bgColor: { rgb: riskColors[riskLevel].bg }
                  },
                  font: {
                    color: { rgb: riskColors[riskLevel].text },
                    bold: true,
                    sz: 10,
                    name: "Calibri"
                  },
                  alignment: {
                    horizontal: "center",
                    vertical: "center",
                    wrapText: true
                  },
                  border: thinBlackBorder
                };
              } else {
                ws[cellRef].s = dataStyle;
              }
            } else {
              ws[cellRef].s = dataStyle;
            }
          }
        }
      }

      // Définir la plage de la feuille
      ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: allData.length - 1, c: maxCols - 1 } });

      console.log(`✅ Styles template appliqués: ${allData.length} lignes, ${headerRows.length} en-têtes, couleurs risques activées`);
    }

    /**
     * Détecte les colonnes de risque dans les données d'export
     * Retourne un objet avec les index par section de table
     */
    detectRiskColumnsInExportData(allData, headerRows) {
      const patterns = this.getRiskColumnPatterns();
      const sectionRiskCols = {};

      headerRows.forEach((headerRowIndex, sectionIndex) => {
        const headerRow = allData[headerRowIndex];
        if (!headerRow) return;

        const indexes = { probabilite: -1, impact: -1, criticite: -1 };

        headerRow.forEach((header, colIndex) => {
          if (!header) return;
          const h = String(header).toLowerCase().trim();
          if (patterns.probabilite.test(h)) indexes.probabilite = colIndex;
          if (patterns.impact.test(h)) indexes.impact = colIndex;
          if (patterns.criticite.test(h)) indexes.criticite = colIndex;
        });

        sectionRiskCols[headerRowIndex] = indexes;
      });

      return sectionRiskCols;
    }

    /**
     * Trouve les colonnes de risque applicables pour une ligne donnée
     */
    getRiskColumnsForRow(rowIndex, riskColumnsBySection, headerRows) {
      // Trouver la section (en-tête) qui précède cette ligne
      let applicableHeaderRow = -1;
      for (let i = headerRows.length - 1; i >= 0; i--) {
        if (headerRows[i] <= rowIndex) {
          applicableHeaderRow = headerRows[i];
          break;
        }
      }

      return applicableHeaderRow >= 0 ? riskColumnsBySection[applicableHeaderRow] : null;
    }

    /**
     * Charger la bibliothèque SheetJS avec support des styles (xlsx-js-style)
     */
    async ensureSheetJSStyleLoaded() {
      // Vérifier si xlsx-js-style est déjà chargé (il supporte la propriété .s pour les styles)
      if (typeof XLSX !== "undefined" && XLSX.utils && XLSX.utils.book_new) {
        console.log("✅ XLSX déjà disponible");
        return;
      }

      return new Promise((resolve, reject) => {
        // Charger xlsx-js-style qui supporte les styles de cellules
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js";
        script.onload = () => {
          console.log("✅ xlsx-js-style chargé avec succès (support des styles activé)");
          resolve();
        };
        script.onerror = () => {
          console.warn("⚠️ xlsx-js-style non disponible, tentative avec xlsx standard");
          const fallbackScript = document.createElement("script");
          fallbackScript.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
          fallbackScript.onload = () => {
            console.log("✅ xlsx standard chargé (styles limités)");
            resolve();
          };
          fallbackScript.onerror = () => reject(new Error("Impossible de charger SheetJS"));
          document.head.appendChild(fallbackScript);
        };
        document.head.appendChild(script);
      });
    }

    /**
     * Appliquer les styles Excel aux cellules
     * - En-têtes: fond rouge bordeaux (#800020), texte blanc, gras
     * - Données: fond blanc, bordures noires
     */
    applyExcelStyles(ws, tableData) {
      if (!tableData || tableData.length === 0) return;

      const numCols = tableData[0].length;
      const numRows = tableData.length;

      // Bordure noire fine
      const thinBlackBorder = {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } }
      };

      // Style pour les en-têtes (rouge bordeaux #800020, texte blanc, gras)
      const headerStyle = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: "800020" },
          bgColor: { rgb: "800020" }
        },
        font: {
          color: { rgb: "FFFFFF" },
          bold: true,
          sz: 11,
          name: "Calibri"
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true
        },
        border: thinBlackBorder
      };

      // Style pour les cellules de données (fond blanc, bordures noires)
      const dataStyle = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: "FFFFFF" },
          bgColor: { rgb: "FFFFFF" }
        },
        font: {
          color: { rgb: "000000" },
          sz: 10,
          name: "Calibri"
        },
        alignment: {
          vertical: "center",
          wrapText: true
        },
        border: thinBlackBorder
      };

      // Parcourir toutes les cellules et appliquer les styles
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });

          // Créer ou récupérer la cellule
          if (!ws[cellRef]) {
            ws[cellRef] = { v: "", t: "s" };
          }

          // Appliquer le style approprié (en-tête ou données)
          ws[cellRef].s = (row === 0) ? headerStyle : dataStyle;
        }
      }

      // Définir la plage de la feuille
      ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: numRows - 1, c: numCols - 1 } });

      // Hauteur des lignes
      ws['!rows'] = [{ hpt: 25 }]; // En-tête plus haute (25 points)

      console.log(`✅ Styles Excel appliqués: ${numRows} lignes, ${numCols} colonnes`);
      console.log(`   - En-têtes: fond bordeaux #800020, texte blanc`);
      console.log(`   - Données: fond blanc, bordures noires`);
    }

    /**
     * Calculer les largeurs de colonnes optimales
     */
    calculateColumnWidths(tableData) {
      if (!tableData || tableData.length === 0) return [];

      const numCols = tableData[0].length;
      const colWidths = [];

      for (let col = 0; col < numCols; col++) {
        let maxWidth = 10; // Largeur minimale

        for (let row = 0; row < tableData.length; row++) {
          const cellValue = tableData[row][col];
          if (cellValue) {
            const cellWidth = String(cellValue).length + 2;
            maxWidth = Math.max(maxWidth, Math.min(cellWidth, 50)); // Max 50 caractères
          }
        }

        colWidths.push({ wch: maxWidth });
      }

      return colWidths;
    }

    /**
     * Importer template Excel - Toutes les tables du premier onglet dans la div active
     * Insère les tables dans le conteneur de la table actuellement sélectionnée
     */
    async importTemplateExcelFirstSheet() {
      try {
        const file = await this.openFileDialog();
        if (!file || !this.validateFile(file)) return;

        this.showQuickNotification("📥 Import template Excel (1er onglet)...");
        await this.ensureSheetJSLoaded();
        const workbook = await this.parseExcelFile(file);

        if (workbook.SheetNames.length === 0) {
          this.showAlert("⚠️ Aucun onglet trouvé dans le fichier.");
          return;
        }

        // Trouver le conteneur actif (div de la table sélectionnée ou conteneur de chat)
        let targetContainer = null;

        if (this.targetTable) {
          // Utiliser le conteneur parent de la table active
          targetContainer = this.targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none')
            || this.targetTable.closest('.chat-message')
            || this.targetTable.closest('.message-content')
            || this.targetTable.parentElement;
        }

        // Fallback sur le conteneur de chat principal
        if (!targetContainer) {
          targetContainer = document.querySelector('div.prose.prose-base.dark\\:prose-invert.max-w-none')
            || document.querySelector('.chat-messages')
            || document.querySelector('main');
        }

        if (!targetContainer) {
          this.showAlert("⚠️ Aucun conteneur trouvé. Cliquez d'abord sur une table.");
          return;
        }

        // Lire uniquement le premier onglet
        const firstSheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", blankrows: true });

        if (rawData.length === 0) {
          this.showAlert("⚠️ Aucune donnée trouvée dans l'onglet.");
          return;
        }

        // Détecter les tables séparées par des lignes vides
        const tables = this.detectTablesFromRawData(rawData);

        if (tables.length === 0) {
          this.showAlert("⚠️ Aucune table détectée dans le fichier.");
          return;
        }

        console.log(`📊 ${tables.length} table(s) détectée(s) dans l'onglet "${firstSheetName}"`);

        // Point d'insertion : après la table active ou à la fin du conteneur
        let insertionPoint = null;
        if (this.targetTable) {
          const tableWrapper = this.targetTable.closest('.table-wrapper') || this.targetTable.closest('.overflow-x-auto') || this.targetTable;
          insertionPoint = tableWrapper.nextSibling;
        }

        let tablesCreated = 0;

        // Créer une table HTML pour chaque table détectée
        tables.forEach((tableData, tableIndex) => {
          if (tableData.length < 1) return;

          const headers = tableData[0] || [];
          const data = tableData.slice(1);

          // Ignorer les tables sans en-têtes valides
          if (headers.length === 0 || headers.every(h => !h || String(h).trim() === "")) return;

          // Créer le wrapper de table
          const tableWrapper = document.createElement("div");
          tableWrapper.className = "table-wrapper overflow-x-auto";
          tableWrapper.style.cssText = "margin: 16px 0;";

          // Créer la table
          const table = document.createElement("table");
          table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg imported-template-table";
          table.style.cssText = "border-collapse: collapse; width: 100%;";
          table.dataset.importedFrom = file.name;
          table.dataset.sheetName = firstSheetName;
          table.dataset.tableIndex = tableIndex;

          // En-tête avec style bordeaux
          const thead = document.createElement("thead");
          const headerRow = document.createElement("tr");
          headers.forEach(h => {
            const th = document.createElement("th");
            th.textContent = h !== null && h !== undefined ? String(h) : "";
            th.style.cssText = `
              border: 1px solid #600018;
              padding: 12px 16px;
              background: #800020;
              color: white;
              font-weight: 600;
              text-align: left;
            `;
            headerRow.appendChild(th);
          });
          thead.appendChild(headerRow);
          table.appendChild(thead);

          // Corps avec détection des colonnes de risque
          const tbody = document.createElement("tbody");
          const riskColIndexes = this.findRiskColumnIndexesFromHeaders(headers);

          data.forEach((rowData, rowIndex) => {
            const tr = document.createElement("tr");
            tr.style.background = rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";

            for (let i = 0; i < headers.length; i++) {
              const td = document.createElement("td");
              const cellData = rowData[i];
              const cellText = cellData !== undefined && cellData !== null ? String(cellData) : "";
              td.textContent = cellText;

              // Style de base
              td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px;";

              // Appliquer les couleurs de risque si applicable
              const isRiskCol = riskColIndexes.probabilite === i ||
                riskColIndexes.impact === i ||
                riskColIndexes.criticite === i;

              if (isRiskCol && cellText) {
                const riskLevel = this.normalizeRiskValue(cellText);
                if (riskLevel) {
                  const colors = this.getRiskColors();
                  if (colors[riskLevel]) {
                    td.style.backgroundColor = colors[riskLevel].bg;
                    td.style.color = colors[riskLevel].text;
                    td.style.fontWeight = "bold";
                    td.style.textAlign = "center";
                  }
                }
              }

              this.makeCellEditable(td);
              tr.appendChild(td);
            }
            tbody.appendChild(tr);
          });
          table.appendChild(tbody);

          tableWrapper.appendChild(table);

          // Insérer au bon endroit
          if (insertionPoint) {
            targetContainer.insertBefore(tableWrapper, insertionPoint);
          } else {
            targetContainer.appendChild(tableWrapper);
          }

          tablesCreated++;
        });

        if (tablesCreated > 0) {
          this.showQuickNotification(`✅ ${tablesCreated} table(s) importée(s) depuis "${firstSheetName}"`);
          this.notifyTableStructureChange("template_first_sheet_imported", {
            filename: file.name,
            sheetName: firstSheetName,
            tablesCount: tablesCreated
          });
          this.syncWithDev();
        } else {
          this.showAlert("⚠️ Aucune table valide détectée dans le fichier.");
        }
      } catch (error) {
        console.error("Erreur import template Excel:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Importer template Word - Toutes les tables d'un fichier Word (.docx) dans la div active
     * Utilise mammoth.js pour extraire les tables du document Word
     */
    async importTemplateWord() {
      try {
        const file = await this.openWordFileDialog();
        if (!file) return;

        this.showQuickNotification("📄 Import template Word en cours...");

        // Charger mammoth.js si nécessaire
        await this.ensureMammothLoaded();

        // Lire le fichier Word
        const arrayBuffer = await file.arrayBuffer();

        // Convertir le document Word en HTML avec mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        const htmlContent = result.value;

        if (!htmlContent || htmlContent.trim() === '') {
          this.showAlert("⚠️ Le document Word est vide ou ne contient pas de contenu convertible.");
          return;
        }

        console.log("📄 [Import Word] HTML extrait:", htmlContent.substring(0, 500) + "...");

        // Parser le HTML pour extraire les tables
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const extractedTables = doc.querySelectorAll('table');

        if (extractedTables.length === 0) {
          this.showAlert("⚠️ Aucune table trouvée dans le document Word.");
          return;
        }

        console.log(`📊 [Import Word] ${extractedTables.length} table(s) trouvée(s)`);

        // Trouver le conteneur actif
        let targetContainer = null;

        if (this.targetTable) {
          targetContainer = this.targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none')
            || this.targetTable.closest('.chat-message')
            || this.targetTable.closest('.message-content')
            || this.targetTable.parentElement;
        }

        if (!targetContainer) {
          targetContainer = document.querySelector('div.prose.prose-base.dark\\:prose-invert.max-w-none')
            || document.querySelector('.chat-messages')
            || document.querySelector('main');
        }

        if (!targetContainer) {
          this.showAlert("⚠️ Aucun conteneur trouvé. Cliquez d'abord sur une table.");
          return;
        }

        // Point d'insertion
        let insertionPoint = null;
        if (this.targetTable) {
          const tableWrapper = this.targetTable.closest('.table-wrapper') || this.targetTable.closest('.overflow-x-auto') || this.targetTable;
          insertionPoint = tableWrapper.nextSibling;
        }

        let tablesCreated = 0;

        // Convertir et insérer chaque table
        extractedTables.forEach((extractedTable, tableIndex) => {
          // Extraire les données de la table
          const tableData = this.extractTableDataFromElement(extractedTable);

          if (tableData.length < 1) return;

          const headers = tableData[0] || [];
          const data = tableData.slice(1);

          // Ignorer les tables sans en-têtes valides
          if (headers.length === 0 || headers.every(h => !h || String(h).trim() === "")) return;

          // Créer le wrapper de table
          const tableWrapper = document.createElement("div");
          tableWrapper.className = "table-wrapper overflow-x-auto";
          tableWrapper.style.cssText = "margin: 16px 0;";

          // Créer la table avec le style ClaraVerse
          const table = document.createElement("table");
          table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg imported-word-table";
          table.style.cssText = "border-collapse: collapse; width: 100%;";
          table.dataset.importedFrom = file.name;
          table.dataset.tableIndex = tableIndex;

          // En-tête avec style bordeaux
          const thead = document.createElement("thead");
          const headerRow = document.createElement("tr");
          headers.forEach(h => {
            const th = document.createElement("th");
            th.textContent = h !== null && h !== undefined ? String(h) : "";
            th.style.cssText = `
              border: 1px solid #600018;
              padding: 12px 16px;
              background: #800020;
              color: white;
              font-weight: 600;
              text-align: left;
            `;
            headerRow.appendChild(th);
          });
          thead.appendChild(headerRow);
          table.appendChild(thead);

          // Corps avec détection des colonnes de risque
          const tbody = document.createElement("tbody");
          const riskColIndexes = this.findRiskColumnIndexesFromHeaders(headers);

          data.forEach((rowData, rowIndex) => {
            const tr = document.createElement("tr");
            tr.style.background = rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";

            for (let i = 0; i < headers.length; i++) {
              const td = document.createElement("td");
              const cellData = rowData[i];
              const cellText = cellData !== undefined && cellData !== null ? String(cellData) : "";
              td.textContent = cellText;

              // Style de base
              td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px;";

              // Appliquer les couleurs de risque si applicable
              const isRiskCol = riskColIndexes.probabilite === i ||
                riskColIndexes.impact === i ||
                riskColIndexes.criticite === i;

              if (isRiskCol && cellText) {
                const riskLevel = this.normalizeRiskValue(cellText);
                if (riskLevel) {
                  const colors = this.getRiskColors();
                  if (colors[riskLevel]) {
                    td.style.backgroundColor = colors[riskLevel].bg;
                    td.style.color = colors[riskLevel].text;
                    td.style.fontWeight = "bold";
                    td.style.textAlign = "center";
                  }
                }
              }

              this.makeCellEditable(td);
              tr.appendChild(td);
            }
            tbody.appendChild(tr);
          });
          table.appendChild(tbody);

          tableWrapper.appendChild(table);

          // Insérer au bon endroit
          if (insertionPoint) {
            targetContainer.insertBefore(tableWrapper, insertionPoint);
          } else {
            targetContainer.appendChild(tableWrapper);
          }

          tablesCreated++;
        });

        if (tablesCreated > 0) {
          this.showQuickNotification(`✅ ${tablesCreated} table(s) importée(s) depuis "${file.name}"`);
          this.notifyTableStructureChange("word_template_imported", {
            filename: file.name,
            tablesCount: tablesCreated
          });
          this.syncWithDev();
        } else {
          this.showAlert("⚠️ Aucune table valide détectée dans le document Word.");
        }
      } catch (error) {
        console.error("Erreur import template Word:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Extraire les données d'une table HTML (élément DOM)
     */
    extractTableDataFromElement(tableElement) {
      const tableData = [];
      const rows = tableElement.querySelectorAll('tr');

      rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('th, td');

        cells.forEach(cell => {
          rowData.push(cell.textContent?.trim() || '');
        });

        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      });

      return tableData;
    }

    /**
     * Ouvrir un dialogue pour sélectionner un fichier Word
     */
    openWordFileDialog() {
      return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".docx,.doc";
        input.style.display = "none";
        input.onchange = (e) => {
          document.body.removeChild(input);
          const file = e.target.files[0];
          if (file) {
            // Vérifier la taille du fichier (max 10 MB)
            if (file.size > 10 * 1024 * 1024) {
              this.showAlert("⚠️ Fichier trop volumineux (max 10 MB).");
              resolve(null);
              return;
            }
            resolve(file);
          } else {
            resolve(null);
          }
        };
        input.oncancel = () => { document.body.removeChild(input); resolve(null); };
        document.body.appendChild(input);
        input.click();
      });
    }

    /**
     * Charger la bibliothèque mammoth.js pour lire les fichiers Word
     * Utilise plusieurs CDN en fallback pour plus de fiabilité
     */
    async ensureMammothLoaded() {
      if (typeof mammoth !== "undefined") {
        console.log("✅ mammoth.js déjà disponible");
        return;
      }

      // Liste des CDN à essayer
      const cdnUrls = [
        "https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js",
        "https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
      ];

      // Vérifier si le script est déjà en cours de chargement
      const existingScript = document.querySelector('script[src*="mammoth"]');
      if (existingScript) {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const checkLib = setInterval(() => {
            attempts++;
            if (typeof mammoth !== "undefined") {
              clearInterval(checkLib);
              console.log("✅ mammoth.js trouvé après attente");
              resolve();
            } else if (attempts > 100) { // 10 secondes max
              clearInterval(checkLib);
              reject(new Error("Timeout: mammoth.js non accessible"));
            }
          }, 100);
        });
      }

      // Essayer chaque CDN jusqu'à ce qu'un fonctionne
      for (let i = 0; i < cdnUrls.length; i++) {
        const url = cdnUrls[i];
        console.log(`📦 [Mammoth] Tentative ${i + 1}/${cdnUrls.length}: ${url}`);

        try {
          await this.loadScriptWithTimeout(url, 15000); // 15 secondes timeout

          // Vérifier que mammoth est disponible
          if (typeof mammoth !== "undefined") {
            console.log(`✅ mammoth.js chargé avec succès depuis ${url}`);
            return;
          }

          // Attendre un peu que la lib s'initialise
          await new Promise(resolve => setTimeout(resolve, 500));

          if (typeof mammoth !== "undefined") {
            console.log(`✅ mammoth.js disponible après initialisation`);
            return;
          }
        } catch (error) {
          console.warn(`⚠️ [Mammoth] Échec CDN ${i + 1}: ${error.message}`);
          // Supprimer le script échoué
          const failedScript = document.querySelector(`script[src="${url}"]`);
          if (failedScript) failedScript.remove();
        }
      }

      throw new Error("Impossible de charger mammoth.js depuis tous les CDN");
    }

    /**
     * Charger un script avec timeout
     */
    loadScriptWithTimeout(url, timeout) {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;

        const timeoutId = setTimeout(() => {
          script.remove();
          reject(new Error(`Timeout après ${timeout}ms`));
        }, timeout);

        script.onload = () => {
          clearTimeout(timeoutId);
          resolve();
        };

        script.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error("Erreur de chargement du script"));
        };

        document.head.appendChild(script);
      });
    }

    /**
     * Importer Excel intégralement - Tous les onglets dans un menu accordéon
     * Chaque onglet devient une section accordéon contenant toutes ses tables
     */
    async importExcelFullAccordion() {
      try {
        const file = await this.openFileDialog();
        if (!file || !this.validateFile(file)) return;

        this.showQuickNotification("📊 Import Excel intégral en cours...");
        await this.ensureSheetJSLoaded();
        const workbook = await this.parseExcelFile(file);

        if (workbook.SheetNames.length === 0) {
          this.showAlert("⚠️ Aucun onglet trouvé dans le fichier.");
          return;
        }

        console.log(`📊 [Import Excel Full] ${workbook.SheetNames.length} onglet(s) trouvé(s)`);

        // Trouver le conteneur actif
        let targetContainer = null;

        if (this.targetTable) {
          targetContainer = this.targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none')
            || this.targetTable.closest('.chat-message')
            || this.targetTable.closest('.message-content')
            || this.targetTable.parentElement;
        }

        if (!targetContainer) {
          targetContainer = document.querySelector('div.prose.prose-base.dark\\:prose-invert.max-w-none')
            || document.querySelector('.chat-messages')
            || document.querySelector('main');
        }

        if (!targetContainer) {
          this.showAlert("⚠️ Aucun conteneur trouvé. Cliquez d'abord sur une table.");
          return;
        }

        // Point d'insertion
        let insertionPoint = null;
        if (this.targetTable) {
          const tableWrapper = this.targetTable.closest('.table-wrapper') || this.targetTable.closest('.overflow-x-auto') || this.targetTable;
          insertionPoint = tableWrapper.nextSibling;
        }

        // Créer le conteneur accordéon principal
        const accordionContainer = document.createElement('div');
        accordionContainer.className = 'excel-full-accordion-container';
        accordionContainer.style.cssText = `
          margin: 16px 0;
          border: 2px solid #800020;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(128, 0, 32, 0.15);
        `;

        // Header du conteneur
        const mainHeader = document.createElement('div');
        mainHeader.style.cssText = `
          background: linear-gradient(135deg, #800020 0%, #600018 100%);
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        `;
        mainHeader.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📊</span>
            <span style="color: white; font-weight: 600; font-size: 15px;">${file.name}</span>
          </div>
          <span style="color: rgba(255,255,255,0.8); font-size: 13px;">${workbook.SheetNames.length} onglet(s)</span>
        `;
        accordionContainer.appendChild(mainHeader);

        // Conteneur des sections accordéon
        const sectionsContainer = document.createElement('div');
        sectionsContainer.className = 'accordion-sections';
        sectionsContainer.style.cssText = 'background: #fafafa;';

        let totalTablesCreated = 0;

        // Parcourir chaque onglet
        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
          const ws = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", blankrows: true });

          if (rawData.length === 0) {
            console.log(`⚠️ [Import Excel Full] Onglet "${sheetName}" vide, ignoré`);
            return;
          }

          // Détecter les tables dans cet onglet
          const tables = this.detectTablesFromRawData(rawData);

          if (tables.length === 0) {
            console.log(`⚠️ [Import Excel Full] Aucune table dans l'onglet "${sheetName}"`);
            return;
          }

          console.log(`📋 [Import Excel Full] Onglet "${sheetName}": ${tables.length} table(s)`);

          // Créer la section accordéon pour cet onglet
          const section = this.createAccordionSectionForSheet(sheetName, sheetIndex, tables);
          sectionsContainer.appendChild(section);

          totalTablesCreated += tables.length;
        });

        accordionContainer.appendChild(sectionsContainer);

        // Insérer au bon endroit
        if (insertionPoint) {
          targetContainer.insertBefore(accordionContainer, insertionPoint);
        } else {
          targetContainer.appendChild(accordionContainer);
        }

        if (totalTablesCreated > 0) {
          this.showQuickNotification(`✅ ${totalTablesCreated} table(s) importée(s) depuis ${workbook.SheetNames.length} onglet(s)`);
          this.notifyTableStructureChange("excel_full_accordion_imported", {
            filename: file.name,
            sheetsCount: workbook.SheetNames.length,
            tablesCount: totalTablesCreated
          });
          this.syncWithDev();
        } else {
          this.showAlert("⚠️ Aucune table valide détectée dans le fichier Excel.");
          accordionContainer.remove();
        }
      } catch (error) {
        console.error("Erreur import Excel intégral:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Créer une section accordéon pour un onglet Excel
     */
    createAccordionSectionForSheet(sheetName, sheetIndex, tables) {
      const section = document.createElement('div');
      section.className = 'accordion-sheet-section';
      section.dataset.sheetName = sheetName;

      // Header de la section (cliquable)
      const header = document.createElement('div');
      header.className = 'accordion-sheet-header';
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      `;
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="accordion-arrow" style="font-size: 12px; color: #800020; transition: transform 0.3s ease;">▶</span>
          <span style="font-size: 16px;">📑</span>
          <span style="font-weight: 500; color: #333;">${sheetName}</span>
        </div>
        <span style="font-size: 12px; color: #666; background: #f0f0f0; padding: 4px 10px; border-radius: 12px;">
          ${tables.length} table(s)
        </span>
      `;

      // Effet hover
      header.addEventListener('mouseenter', () => {
        header.style.background = '#f8f8f8';
      });
      header.addEventListener('mouseleave', () => {
        header.style.background = 'white';
      });

      // Contenu de la section (tables)
      const content = document.createElement('div');
      content.className = 'accordion-sheet-content';
      content.style.cssText = `
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
        background: #fafafa;
        padding: 0 16px;
      `;

      // Créer les tables pour cet onglet
      tables.forEach((tableData, tableIndex) => {
        if (tableData.length < 1) return;

        const headers = tableData[0] || [];
        const data = tableData.slice(1);

        if (headers.length === 0 || headers.every(h => !h || String(h).trim() === "")) return;

        // Wrapper de table
        const tableWrapper = document.createElement('div');
        tableWrapper.style.cssText = 'margin: 16px 0; overflow-x: auto;';

        // Titre de la table si plusieurs tables
        if (tables.length > 1) {
          const tableTitle = document.createElement('div');
          tableTitle.style.cssText = `
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
            font-weight: 500;
          `;
          tableTitle.textContent = `📋 Table ${tableIndex + 1}`;
          tableWrapper.appendChild(tableTitle);
        }

        // Créer la table HTML
        const table = document.createElement('table');
        table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg imported-excel-full-table';
        table.style.cssText = 'border-collapse: collapse; width: 100%;';
        table.dataset.sheetName = sheetName;
        table.dataset.tableIndex = tableIndex;

        // En-tête avec style bordeaux
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(h => {
          const th = document.createElement('th');
          th.textContent = h !== null && h !== undefined ? String(h) : "";
          th.style.cssText = `
            border: 1px solid #600018;
            padding: 10px 14px;
            background: #800020;
            color: white;
            font-weight: 600;
            text-align: left;
            font-size: 13px;
          `;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Corps avec détection des colonnes de risque
        const tbody = document.createElement('tbody');
        const riskColIndexes = this.findRiskColumnIndexesFromHeaders(headers);

        data.forEach((rowData, rowIndex) => {
          const tr = document.createElement('tr');
          tr.style.background = rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa';

          for (let i = 0; i < headers.length; i++) {
            const td = document.createElement('td');
            const cellData = rowData[i];
            const cellText = cellData !== undefined && cellData !== null ? String(cellData) : "";
            td.textContent = cellText;

            td.style.cssText = 'border: 1px solid #d1d5db; padding: 8px 12px; font-size: 13px;';

            // Appliquer les couleurs de risque si applicable
            const isRiskCol = riskColIndexes.probabilite === i ||
              riskColIndexes.impact === i ||
              riskColIndexes.criticite === i;

            if (isRiskCol && cellText) {
              const riskLevel = this.normalizeRiskValue(cellText);
              if (riskLevel) {
                const colors = this.getRiskColors();
                if (colors[riskLevel]) {
                  td.style.backgroundColor = colors[riskLevel].bg;
                  td.style.color = colors[riskLevel].text;
                  td.style.fontWeight = 'bold';
                  td.style.textAlign = 'center';
                }
              }
            }

            this.makeCellEditable(td);
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        tableWrapper.appendChild(table);
        content.appendChild(tableWrapper);
      });

      // Toggle accordéon
      let isExpanded = false;
      header.addEventListener('click', () => {
        isExpanded = !isExpanded;
        const arrow = header.querySelector('.accordion-arrow');

        if (isExpanded) {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.padding = '0 16px 16px 16px';
          arrow.style.transform = 'rotate(90deg)';
          header.style.borderBottom = '1px solid #800020';
        } else {
          content.style.maxHeight = '0';
          content.style.padding = '0 16px';
          arrow.style.transform = 'rotate(0deg)';
          header.style.borderBottom = '1px solid #e0e0e0';
        }
      });

      // Ouvrir automatiquement le premier onglet
      if (sheetIndex === 0) {
        setTimeout(() => {
          header.click();
        }, 100);
      }

      section.appendChild(header);
      section.appendChild(content);

      return section;
    }

    /**
     * Détecter les tables séparées par des lignes vides dans les données brutes
     */
    detectTablesFromRawData(rawData) {
      const tables = [];
      let currentTable = [];

      rawData.forEach((row) => {
        const isEmptyRow = !row || row.length === 0 ||
          row.every(cell => cell === null || cell === undefined || String(cell).trim() === "");

        if (isEmptyRow) {
          if (currentTable.length > 0) {
            tables.push(currentTable);
            currentTable = [];
          }
        } else {
          currentTable.push(row);
        }
      });

      // Ajouter la dernière table si elle existe
      if (currentTable.length > 0) {
        tables.push(currentTable);
      }

      return tables;
    }

    async importExcelTemplate() {
      try {
        const file = await this.openFileDialog();
        if (!file || !this.validateFile(file)) return;
        this.showQuickNotification("📄 Lecture du fichier Excel (premier onglet, multi-tables)...");
        await this.ensureSheetJSLoaded();
        const workbook = await this.parseExcelFile(file);

        if (workbook.SheetNames.length === 0) {
          this.showAlert("⚠️ Aucun onglet trouvé dans le fichier.");
          return;
        }

        // Trouver le conteneur de chat pour insérer les tables
        const chatContainer = document.querySelector('div.prose.prose-base.dark\\:prose-invert.max-w-none')
          || document.querySelector('.chat-messages')
          || document.querySelector('main');

        if (!chatContainer) {
          this.showAlert("⚠️ Conteneur de chat non trouvé.");
          return;
        }

        // Lire uniquement le premier onglet
        const firstSheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", blankrows: true });

        if (rawData.length === 0) {
          this.showAlert("⚠️ Aucune donnée trouvée dans l'onglet.");
          return;
        }

        // Détecter les tables séparées par des lignes vides
        const tables = [];
        let currentTable = [];

        rawData.forEach((row, idx) => {
          const isEmptyRow = !row || row.length === 0 || row.every(cell => cell === null || cell === undefined || String(cell).trim() === "");

          if (isEmptyRow) {
            // Ligne vide = fin de table potentielle
            if (currentTable.length > 0) {
              tables.push(currentTable);
              currentTable = [];
            }
          } else {
            currentTable.push(row);
          }
        });

        // Ajouter la dernière table si elle existe
        if (currentTable.length > 0) {
          tables.push(currentTable);
        }

        if (tables.length === 0) {
          this.showAlert("⚠️ Aucune table détectée.");
          return;
        }

        let tablesCreated = 0;

        // Créer une table HTML pour chaque table détectée
        tables.forEach((tableData, tableIndex) => {
          if (tableData.length < 1) return;

          const headers = tableData[0] || [];
          const data = tableData.slice(1);

          if (headers.length === 0 || headers.every(h => !h || String(h).trim() === "")) return;

          // Créer la table
          const table = document.createElement("table");
          table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
          table.style.cssText = "border-collapse: collapse; width: 100%; margin-bottom: 16px;";

          // En-tête
          const thead = document.createElement("thead");
          const headerRow = document.createElement("tr");
          headers.forEach(h => {
            const th = document.createElement("th");
            th.textContent = h !== null && h !== undefined ? String(h) : "";
            th.style.cssText = "border: 1px solid #d1d5db; padding: 12px 16px; background: #f8f9fa; font-weight: 600;";
            headerRow.appendChild(th);
          });
          thead.appendChild(headerRow);
          table.appendChild(thead);

          // Corps
          const tbody = document.createElement("tbody");
          data.forEach(rowData => {
            const tr = document.createElement("tr");
            for (let i = 0; i < headers.length; i++) {
              const td = document.createElement("td");
              const cellData = rowData[i];
              td.textContent = cellData !== undefined && cellData !== null ? String(cellData) : "";
              td.style.cssText = "border: 1px solid #d1d5db; padding: 8px 12px; background: white;";
              this.makeCellEditable(td);
              tr.appendChild(td);
            }
            tbody.appendChild(tr);
          });
          table.appendChild(tbody);

          // Insérer dans le conteneur
          chatContainer.appendChild(table);
          tablesCreated++;
        });

        if (tablesCreated > 0) {
          this.showQuickNotification(`✅ ${tablesCreated} table(s) importée(s) depuis l'onglet "${firstSheetName}"`);
          this.notifyTableStructureChange("template_imported", { sheetName: firstSheetName, tablesCount: tablesCreated });
          this.syncWithDev();
        } else {
          this.showAlert("⚠️ Aucune table valide détectée.");
        }
      } catch (error) {
        console.error("Erreur import template:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    validateFile(file) {
      if (file.size > this.config.maxFileSize) { this.showAlert("⚠️ Fichier trop volumineux."); return false; }
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!this.config.supportedFormats.includes(ext)) { this.showAlert("⚠️ Format non supporté."); return false; }
      return true;
    }

    openFileDialog() {
      return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = this.config.supportedFormats.join(",");
        input.style.display = "none";
        input.onchange = (e) => { document.body.removeChild(input); resolve(e.target.files[0] || null); };
        input.oncancel = () => { document.body.removeChild(input); resolve(null); };
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
        script.onerror = () => reject(new Error("Impossible de charger SheetJS"));
        document.head.appendChild(script);
      });
    }

    async parseExcelFile(file) {
      const arrayBuffer = await file.arrayBuffer();
      return XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    }

    extractExcelData(workbook) {
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", blankrows: false });
      if (rawData.length === 0) return { headers: [], data: [] };
      const headers = rawData[0] || [];
      const data = rawData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && String(cell).trim()));
      return { headers, data };
    }

    replaceTableContent(headers, data, isTestMode = false) {
      if (!this.targetTable) return;
      const tableClasses = this.targetTable.className;
      this.targetTable.innerHTML = "";
      if (headers.length > 0) {
        const thead = document.createElement("thead");
        const tr = document.createElement("tr");
        headers.forEach((h, i) => {
          const th = document.createElement("th");
          th.textContent = h || "";
          const isTest = isTestMode && i >= headers.length - 6;
          th.style.cssText = `border: 1px solid #d1d5db; padding: 12px 16px; background: ${isTest ? "linear-gradient(135deg, #f0f8ff, #e3f2fd)" : "#f8f9fa"}; font-weight: 600;`;
          tr.appendChild(th);
        });
        thead.appendChild(tr);
        this.targetTable.appendChild(thead);
      }
      if (data.length > 0) {
        const tbody = document.createElement("tbody");
        data.forEach(rowData => {
          const tr = document.createElement("tr");
          rowData.forEach((cellData, i) => {
            const td = document.createElement("td");
            td.textContent = cellData !== undefined && cellData !== null ? String(cellData) : "";
            const isTest = isTestMode && i >= rowData.length - 6;
            td.style.cssText = `border: 1px solid #d1d5db; padding: 8px 12px; background: ${isTest ? "#fafafa" : "white"};`;
            this.makeCellEditable(td);
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        this.targetTable.appendChild(tbody);
      }
      this.targetTable.className = tableClasses;
    }

    getTableDataArray() {
      if (!this.targetTable) return null;
      const data = [];
      this.targetTable.querySelectorAll("tr").forEach(row => {
        const rowData = [];
        row.querySelectorAll("td, th").forEach(cell => rowData.push((cell.textContent || "").trim()));
        if (rowData.length > 0) data.push(rowData);
      });
      return data;
    }

    // === PANDAS AGENT ===
    async executePandasAgent() {
      if (!this.targetTable) { this.showAlert("⚠️ Aucune table sélectionnée."); return; }
      try {
        this.showQuickNotification("🐼 Envoi vers l'agent Pandas...");
        const tableId = this.targetTable.dataset.tableId || 'target_table';
        const headers = [];
        const rows = [];
        const headerRow = this.targetTable.querySelector('thead tr') || this.targetTable.querySelector('tr');
        if (headerRow) headerRow.querySelectorAll('th, td').forEach(cell => headers.push(cell.textContent.trim()));
        const tbody = this.targetTable.querySelector('tbody');
        const dataRows = tbody ? tbody.querySelectorAll('tr') : this.targetTable.querySelectorAll('tr:not(:first-child)');
        dataRows.forEach(row => {
          const rowData = [];
          row.querySelectorAll('td, th').forEach(cell => rowData.push(cell.textContent.trim()));
          if (rowData.length > 0) rows.push(rowData);
        });

        let targetColumn = null;
        headers.forEach(h => { if (h.toLowerCase() === 'ecart' || h.toLowerCase() === 'écart') targetColumn = h; });

        const response = await fetch(`${getBackendBaseUrl()}/pandas-agent/process-json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tables: [{ tableId, headers, rows }], targetTableId: tableId, action: 'calculate_ecart', targetColumn })
        });

        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        const result = await response.json();

        if (result.success && result.rows) {
          const tbody = this.targetTable.querySelector('tbody');
          if (tbody) {
            const existingRows = tbody.querySelectorAll('tr');
            result.rows.forEach((rowData, ri) => {
              if (ri < existingRows.length) {
                const cells = existingRows[ri].querySelectorAll('td');
                rowData.forEach((val, ci) => {
                  if (ci < cells.length) {
                    cells[ci].textContent = val;
                    const hdr = result.headers[ci]?.toLowerCase() || '';
                    if (hdr === 'ecart' || hdr === 'écart') {
                      const num = parseFloat(String(val).replace(/,/g, ''));
                      if (!isNaN(num)) { cells[ci].style.color = num >= 0 ? 'green' : 'red'; cells[ci].style.fontWeight = 'bold'; }
                    }
                  }
                });
              }
            });
          }
          this.showQuickNotification(`✅ ${result.message}`);
          this.notifyTableStructureChange("pandas_agent_calculation", { calculations: result.calculations });
          this.syncWithDev();
        } else throw new Error(result.message || "Erreur inconnue");
      } catch (error) { this.showAlert(`❌ Erreur Pandas: ${error.message}`); }
    }

    // === LEAD BALANCE ===
    /**
     * Exécute le calcul des Lead Balances en important un fichier Excel.
     * Le fichier Excel doit contenir 2 onglets:
     * - Onglet 1: Balance N (période actuelle)
     * - Onglet 2: Balance N-1 (période précédente)
     * 
     * Colonnes attendues: Numéro, Intitulé, Solde Débit, Solde Crédit
     * Le solde net est calculé: Solde Débit - Solde Crédit
     */
    async executeLeadBalance() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée. Cliquez d'abord sur une table pour définir où afficher les résultats.");
        return;
      }

      try {
        // Ouvrir le sélecteur de fichier Excel
        const file = await this.openFileDialogForLeadBalance();
        if (!file) {
          console.log("📊 [Lead Balance] Sélection de fichier annulée");
          return;
        }

        // Vérifier l'extension du fichier
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
          this.showAlert("⚠️ Format de fichier non supporté. Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
          return;
        }

        this.showQuickNotification(`📊 Traitement de ${file.name}...`);
        console.log("📊 [Lead Balance] Fichier sélectionné:", file.name, file.size, "bytes");

        // Lire le fichier en base64
        const fileBase64 = await this.readFileAsBase64(file);
        console.log("📊 [Lead Balance] Fichier encodé en base64:", fileBase64.length, "caractères");

        // Envoyer vers le backend Python
        const response = await fetch(`${getBackendBaseUrl()}/lead-balance/process-excel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_base64: fileBase64,
            filename: file.name
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log("📊 [Lead Balance] Résultat reçu:", result);

        if (result.success && result.html) {
          // Insérer les accordéons HTML en dessous de la table
          this.insertLeadBalanceResults(result.html);
          this.showQuickNotification(result.message || "✅ Lead Balance calculée avec succès!");
          this.notifyTableStructureChange("lead_balance_calculated", {
            filename: file.name,
            commonCount: result.results?.totals?.common?.count || 0,
            onlyNCount: result.results?.totals?.only_n?.count || 0,
            onlyN1Count: result.results?.totals?.only_n_1?.count || 0
          });
          this.syncWithDev();
        } else {
          throw new Error(result.message || "Erreur lors du calcul des Lead Balances");
        }

      } catch (error) {
        console.error("❌ [Lead Balance] Erreur:", error);
        this.showAlert(`❌ Erreur Lead Balance: ${error.message}`);
      }
    }

    /**
     * Ouvre un dialogue de sélection de fichier Excel pour Lead Balance
     */
    openFileDialogForLeadBalance() {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          document.body.removeChild(input);
          resolve(file || null);
        });

        input.addEventListener('cancel', () => {
          document.body.removeChild(input);
          resolve(null);
        });

        document.body.appendChild(input);
        input.click();
      });
    }

    /**
     * Lit un fichier et le convertit en base64
     */
    readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Extraire la partie base64 (après "data:...;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsDataURL(file);
      });
    }

    /**
     * Insère les résultats des Lead Balances (accordéons HTML) en dessous de la table active.
     * @param {string} html - Le HTML des accordéons à insérer
     */
    insertLeadBalanceResults(html) {
      if (!this.targetTable) return;

      // Supprimer les anciens résultats Lead Balance s'ils existent
      const existingResults = this.targetTable.parentElement?.querySelector('.lead-balance-results');
      if (existingResults) {
        existingResults.remove();
      }

      // Créer le conteneur pour les résultats
      const container = document.createElement('div');
      container.className = 'lead-balance-results';
      container.style.cssText = 'margin-top: 20px; padding: 16px; background: #fafafa; border-radius: 8px; border: 1px solid #e0e0e0;';

      // Ajouter un titre
      const title = document.createElement('h3');
      title.textContent = '📊 Résultats Lead Balance';
      title.style.cssText = 'margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600;';
      container.appendChild(title);

      // Ajouter le HTML des accordéons
      const accordionsContainer = document.createElement('div');
      accordionsContainer.innerHTML = html;
      container.appendChild(accordionsContainer);

      // Insérer après la table
      this.targetTable.parentNode.insertBefore(container, this.targetTable.nextSibling);

      console.log("✅ [Lead Balance] Résultats insérés sous la table");
    }

    /**
     * Exporte les résultats Lead Balance vers un fichier Excel multi-onglets.
     * Chaque section SYSCOHADA (Actif Immobilisé, Actif Circulant, etc.) devient un onglet.
     */
    async exportLeadBalanceToExcel() {
      try {
        // Vérifier si des résultats Lead Balance existent
        const leadContainer = document.querySelector('.lead-syscohada-container');
        if (!leadContainer) {
          this.showAlert("⚠️ Aucun résultat Lead Balance trouvé. Veuillez d'abord exécuter le calcul Lead Balance.");
          return;
        }

        this.showQuickNotification("📥 Préparation de l'export Excel...");
        console.log("📥 [Export Lead Balance] Début de l'export");

        // Charger la bibliothèque XLSX si elle n'est pas déjà chargée
        if (typeof XLSX === 'undefined') {
          await this.loadXLSXLibrary();
        }

        // Créer un nouveau classeur Excel
        const workbook = XLSX.utils.book_new();

        // Extraire les noms des onglets depuis les résultats
        const sheetNames = this.extractSheetNamesFromLeadBalance(leadContainer);
        console.log("📥 [Export Lead Balance] Onglets détectés:", sheetNames);

        // Parcourir toutes les sections SYSCOHADA
        const sections = leadContainer.querySelectorAll('.lead-syscohada-section');
        let exportedCount = 0;

        sections.forEach((section) => {
          const sectionId = section.getAttribute('data-section');
          const sectionHeader = section.querySelector('.section-header span');
          const sectionTable = section.querySelector('.lead-table');

          if (!sectionTable) return;

          // Extraire le nom de la section (sans l'icône et le nombre de comptes)
          let sectionName = sectionHeader ? sectionHeader.textContent.trim() : sectionId;
          // Nettoyer le nom: enlever l'icône et le texte entre parenthèses
          sectionName = sectionName.replace(/^[^\w\s]+\s*/, '').replace(/\s*\(\d+\s+comptes?\)/, '').trim();
          
          // Limiter à 31 caractères (limite Excel)
          if (sectionName.length > 31) {
            sectionName = sectionName.substring(0, 28) + '...';
          }

          // Extraire les données du tableau
          const tableData = this.extractTableDataFromElement(sectionTable, sheetNames);
          
          if (tableData && tableData.length > 0) {
            // Créer la feuille Excel
            const worksheet = XLSX.utils.aoa_to_sheet(tableData);
            
            // Définir la largeur des colonnes
            worksheet['!cols'] = [
              { wch: 10 },  // Compte
              { wch: 35 },  // Intitulé
              { wch: 15 },  // Solde N
              { wch: 15 },  // Solde N-1
              { wch: 15 },  // Écart
              { wch: 10 }   // Var %
            ];

            // Ajouter la feuille au classeur
            XLSX.utils.book_append_sheet(workbook, worksheet, sectionName);
            exportedCount++;
            console.log(`📥 [Export Lead Balance] Section exportée: ${sectionName}`);
          }
        });

        if (exportedCount === 0) {
          this.showAlert("⚠️ Aucune donnée à exporter. Vérifiez que les résultats Lead Balance sont affichés.");
          return;
        }

        // Générer le nom du fichier avec la date
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        const filename = `Lead_Balance_${dateStr}_${timeStr}.xlsx`;

        // Générer et télécharger le fichier Excel
        XLSX.writeFile(workbook, filename);

        this.showQuickNotification(`✅ Export réussi: ${exportedCount} sections exportées dans ${filename}`);
        console.log(`✅ [Export Lead Balance] Fichier généré: ${filename}`);

      } catch (error) {
        console.error("❌ [Export Lead Balance] Erreur:", error);
        this.showAlert(`❌ Erreur lors de l'export: ${error.message}`);
      }
    }

    /**
     * Extrait les noms des onglets (N et N-1) depuis le header Lead Balance
     */
    extractSheetNamesFromLeadBalance(container) {
      const header = container.querySelector('.lead-header p');
      if (header) {
        const text = header.textContent;
        const match = text.match(/(\S+)\s+vs\s+(\S+)/);
        if (match) {
          return { n: match[1], n_1: match[2] };
        }
      }
      return { n: 'N', n_1: 'N-1' };
    }

    /**
     * Extrait les données d'un tableau HTML pour l'export Excel
     */
    extractTableDataFromElement(table, sheetNames) {
      const data = [];
      
      // En-têtes
      const headers = [];
      const headerCells = table.querySelectorAll('thead th');
      headerCells.forEach(th => {
        let headerText = th.textContent.trim();
        // Remplacer les noms génériques par les noms réels des onglets
        headerText = headerText.replace(/Solde\s+N(?!\-)/g, `Solde ${sheetNames.n}`);
        headerText = headerText.replace(/Solde\s+N-1/g, `Solde ${sheetNames.n_1}`);
        headers.push(headerText);
      });
      data.push(headers);

      // Lignes de données (tbody)
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(tr => {
        const row = [];
        const cells = tr.querySelectorAll('td');
        cells.forEach(td => {
          let cellText = td.textContent.trim();
          // Nettoyer les nombres formatés (enlever les espaces)
          if (td.classList.contains('number')) {
            cellText = cellText.replace(/\s/g, '').replace(',', '.');
            // Convertir en nombre si possible
            const num = parseFloat(cellText);
            if (!isNaN(num)) {
              row.push(num);
            } else {
              row.push(cellText);
            }
          } else {
            row.push(cellText);
          }
        });
        if (row.length > 0) {
          data.push(row);
        }
      });

      // Ligne de total (tfoot) - optionnel
      const totalRow = table.querySelector('tfoot tr');
      if (totalRow) {
        const row = [];
        const cells = totalRow.querySelectorAll('td');
        cells.forEach(td => {
          let cellText = td.textContent.trim();
          if (td.classList.contains('number')) {
            cellText = cellText.replace(/\s/g, '').replace(',', '.');
            const num = parseFloat(cellText);
            if (!isNaN(num)) {
              row.push(num);
            } else {
              row.push(cellText);
            }
          } else {
            row.push(cellText);
          }
        });
        if (row.length > 0) {
          data.push(row);
        }
      }

      return data;
    }

    /**
     * Charge la bibliothèque XLSX dynamiquement si elle n'est pas disponible
     */
    loadXLSXLibrary() {
      return new Promise((resolve, reject) => {
        if (typeof XLSX !== 'undefined') {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
        script.onload = () => {
          console.log("📥 [Export Lead Balance] Bibliothèque XLSX chargée");
          resolve();
        };
        script.onerror = () => {
          reject(new Error("Impossible de charger la bibliothèque XLSX"));
        };
        document.head.appendChild(script);
      });
    }

    /**
     * Export des États Financiers vers Excel
     * Exporte les états financiers générés (Bilan, Compte de Résultat, TFT, Annexes)
     * vers un fichier Excel multi-onglets
     */
    async exportEtatsFinanciersToExcel() {
      try {
        // Vérifier si des résultats États Financiers existent
        const etatFinContainer = document.querySelector('.etats-fin-container');
        if (!etatFinContainer) {
          this.showAlert("⚠️ Aucun état financier trouvé. Veuillez d'abord générer les états financiers avec 'Etat fin'.");
          return;
        }

        this.showQuickNotification("📥 Préparation de l'export Excel des états financiers...");
        console.log("📥 [Export États Financiers] Début de l'export");

        // Charger la bibliothèque XLSX si elle n'est pas déjà chargée
        if (typeof XLSX === 'undefined') {
          await this.loadXLSXLibrary();
        }

        // Créer un nouveau classeur Excel
        const workbook = XLSX.utils.book_new();
        let exportedCount = 0;

        // Extraire et exporter chaque section
        const sections = [
          { selector: '.section-bilan_actif', name: 'Bilan Actif' },
          { selector: '.section-bilan_passif', name: 'Bilan Passif' },
          { selector: '.section-compte_resultat', name: 'Compte de Résultat' },
          { selector: '.section-tft', name: 'TFT' },
          { selector: '.section-annexes', name: 'Annexes' }
        ];

        sections.forEach(({ selector, name }) => {
          const section = etatFinContainer.querySelector(selector);
          if (!section) {
            console.log(`⚠️ [Export États Financiers] Section non trouvée: ${name}`);
            return;
          }

          const table = section.querySelector('table');
          if (!table) {
            console.log(`⚠️ [Export États Financiers] Tableau non trouvé dans: ${name}`);
            return;
          }

          // Extraire les données du tableau
          const tableData = this.extractTableDataFromElement(table, { n: 'N', n_1: 'N-1' });
          
          if (tableData && tableData.length > 0) {
            // Créer la feuille Excel
            const worksheet = XLSX.utils.aoa_to_sheet(tableData);
            
            // Définir la largeur des colonnes
            worksheet['!cols'] = [
              { wch: 10 },  // REF
              { wch: 40 },  // LIBELLÉS
              { wch: 8 },   // NOTE
              { wch: 15 },  // EXERCICE N
              { wch: 15 }   // EXERCICE N-1
            ];

            // Ajouter la feuille au classeur
            XLSX.utils.book_append_sheet(workbook, worksheet, name);
            exportedCount++;
            console.log(`📥 [Export États Financiers] Section exportée: ${name}`);
          }
        });

        if (exportedCount === 0) {
          this.showAlert("⚠️ Aucune donnée à exporter. Vérifiez que les états financiers sont affichés.");
          return;
        }

        // Générer le nom du fichier avec la date
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        const filename = `Etats_Financiers_${dateStr}_${timeStr}.xlsx`;

        // Générer et télécharger le fichier Excel
        XLSX.writeFile(workbook, filename);

        this.showQuickNotification(`✅ Export réussi: ${exportedCount} sections exportées dans ${filename}`);
        console.log(`✅ [Export États Financiers] Fichier généré: ${filename}`);

      } catch (error) {
        console.error("❌ [Export États Financiers] Erreur:", error);
        this.showAlert(`❌ Erreur lors de l'export: ${error.message}`);
      }
    }

    // === ÉTATS FINANCIERS SYSCOHADA ===

    /**
     * Calcule les États Financiers SYSCOHADA à partir de la table active (Balance)
     * La table doit contenir les colonnes: Numéro, Intitulé, Débit, Crédit, Solde Débit, Solde Crédit
     */
    async executeEtatsFinanciers() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée. Cliquez d'abord sur une table contenant une Balance.");
        return;
      }

      try {
        this.showQuickNotification("📊 Calcul des États Financiers en cours...");
        console.log("📈 [États Financiers] Début du calcul");

        // Extraire les données de la table
        const tableData = this.extractTableDataForEtatsFinanciers();
        if (!tableData) {
          this.showAlert("⚠️ Impossible d'extraire les données de la table. Vérifiez que c'est une Balance valide.");
          return;
        }

        console.log("📈 [États Financiers] Données extraites:", tableData.headers, tableData.rows.length, "lignes");

        // Envoyer vers le backend Python
        const response = await fetch(`${getBackendBaseUrl()}/etats-financiers/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: tableData,
            exercice_n: "N",
            exercice_n1: "N-1"
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log("📈 [États Financiers] Résultat reçu:", result);

        if (result.success) {
          // Afficher les résultats en accordéon sous la table
          this.insertEtatsFinanciersResults(result);
          this.showQuickNotification("✅ États Financiers calculés avec succès!");
          this.notifyTableStructureChange("etats_financiers_calculated", {});
          this.syncWithDev();
        } else {
          throw new Error(result.message || "Erreur lors du calcul des États Financiers");
        }

      } catch (error) {
        console.error("❌ [États Financiers] Erreur:", error);
        this.showAlert(`❌ Erreur États Financiers: ${error.message}`);
      }
    }

    /**
     * Extrait les données de la table pour les États Financiers
     */
    extractTableDataForEtatsFinanciers() {
      if (!this.targetTable) return null;

      const headers = [];
      const rows = [];

      // Extraire les en-têtes
      const headerCells = this.targetTable.querySelectorAll('thead th, thead td, tr:first-child th, tr:first-child td');
      headerCells.forEach(cell => headers.push(cell.textContent.trim()));

      if (headers.length === 0) return null;

      // Extraire les lignes de données
      const tbody = this.targetTable.querySelector('tbody');
      const dataRows = tbody ? tbody.querySelectorAll('tr') : this.targetTable.querySelectorAll('tr:not(:first-child)');

      dataRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
          const rowData = [];
          cells.forEach(cell => rowData.push(cell.textContent.trim()));
          if (rowData.some(cell => cell !== '')) {
            rows.push(rowData);
          }
        }
      });

      return { headers, rows };
    }

    /**
     * Importe une Balance depuis un fichier Excel pour calculer les États Financiers
     */
    async importBalanceExcel() {
      try {
        const file = await this.openFileDialogForLeadBalance();
        if (!file) return;

        this.showQuickNotification(`📊 Import de ${file.name}...`);
        console.log("📈 [États Financiers] Import fichier:", file.name);

        const fileBase64 = await this.readFileAsBase64(file);

        // Envoyer directement vers l'endpoint États Financiers
        const response = await fetch(`${getBackendBaseUrl()}/etats-financiers/calculate-excel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_base64: fileBase64,
            filename: file.name,
            exercice_n: "N",
            exercice_n1: "N-1"
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log("📈 [États Financiers] Résultat:", result);

        if (result.success) {
          this.insertEtatsFinanciersResults(result);
          this.showQuickNotification("✅ États Financiers importés et calculés!");
          this.notifyTableStructureChange("etats_financiers_imported", { filename: file.name });
        } else {
          throw new Error(result.message || "Erreur lors du calcul");
        }

      } catch (error) {
        console.error("❌ [Import Balance] Erreur:", error);
        this.showAlert(`❌ Erreur import: ${error.message}`);
      }
    }

    /**
     * Affiche uniquement le Bilan
     */
    showBilan() {
      const container = document.querySelector('.etats-financiers-results');
      if (!container) {
        this.showAlert("⚠️ Calculez d'abord les États Financiers");
        return;
      }
      // Toggle visibility
      const bilanSections = container.querySelectorAll('[data-ef-type="bilan"]');
      bilanSections.forEach(s => s.style.display = s.style.display === 'none' ? 'block' : 'none');
    }

    /**
     * Affiche uniquement le Compte de Résultat
     */
    showCompteResultat() {
      const container = document.querySelector('.etats-financiers-results');
      if (!container) {
        this.showAlert("⚠️ Calculez d'abord les États Financiers");
        return;
      }
      const crSections = container.querySelectorAll('[data-ef-type="compte-resultat"]');
      crSections.forEach(s => s.style.display = s.style.display === 'none' ? 'block' : 'none');
    }

    /**
     * Insère les résultats des États Financiers en accordéon sous la table
     */
    insertEtatsFinanciersResults(result) {
      // Supprimer les anciens résultats
      const existing = document.querySelector('.etats-financiers-results');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.className = 'etats-financiers-results';
      container.style.cssText = 'margin-top: 20px; padding: 16px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 12px; border: 2px solid #dee2e6;';

      // Si le backend a généré un HTML complet, l'utiliser directement
      if (result.html) {
        console.log("✅ [États Financiers] Utilisation du HTML généré par le backend");
        container.innerHTML = result.html;
      } else {
        // Fallback: construire le HTML manuellement (ancien comportement)
        console.log("⚠️ [États Financiers] Pas de HTML backend, construction manuelle");
        
        // Titre principal
        const title = document.createElement('h2');
        title.innerHTML = '📈 <strong>États Financiers SYSCOHADA Révisé</strong>';
        title.style.cssText = 'margin: 0 0 20px 0; color: #2c3e50; font-size: 20px; text-align: center; padding-bottom: 10px; border-bottom: 2px solid #3498db;';
        container.appendChild(title);

        // Créer les accordéons
        const accordionsHTML = this.buildEtatsFinanciersAccordions(result);
        const accordionsDiv = document.createElement('div');
        accordionsDiv.innerHTML = accordionsHTML;
        container.appendChild(accordionsDiv);
      }

      // Insérer après la table ou à la fin du chat
      if (this.targetTable && this.targetTable.parentNode) {
        this.targetTable.parentNode.insertBefore(container, this.targetTable.nextSibling);
      } else {
        const chatContainer = document.querySelector('.prose, [class*="chat"], [class*="message"]');
        if (chatContainer) chatContainer.appendChild(container);
        else document.body.appendChild(container);
      }

      // Activer les accordéons (fonctionne pour les deux formats)
      this.setupEtatsFinanciersAccordions(container);
      console.log("✅ [États Financiers] Résultats affichés");
    }

    /**
     * Construit le HTML des accordéons pour les États Financiers
     */
    buildEtatsFinanciersAccordions(result) {
      const formatMontant = (val) => new Intl.NumberFormat('fr-FR').format(Math.round(val || 0));

      let html = '';

      // BILAN ACTIF
      if (result.bilan_actif) {
        html += this.buildAccordionSection('bilan', 'BILAN ACTIF', '🏦', result.bilan_actif, result.exercice_n, result.exercice_n1, formatMontant, '#27ae60');
      }

      // BILAN PASSIF
      if (result.bilan_passif) {
        html += this.buildAccordionSection('bilan', 'BILAN PASSIF', '💰', result.bilan_passif, result.exercice_n, result.exercice_n1, formatMontant, '#2980b9');
      }

      // COMPTE DE RÉSULTAT
      if (result.compte_resultat) {
        html += this.buildCompteResultatAccordion(result.compte_resultat, result.exercice_n, result.exercice_n1, formatMontant);
      }

      return html;
    }

    buildAccordionSection(type, titre, icon, data, exN, exN1, formatMontant, color) {
      let tableRows = '';
      data.rubriques.forEach(r => {
        tableRows += `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.code}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.libelle}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: 500;">${formatMontant(r.montant_n)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #666;">${formatMontant(r.montant_n1)}</td>
        </tr>`;
      });

      return `
        <div class="ef-accordion" data-ef-type="${type}" style="margin-bottom: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
          <div class="ef-accordion-header" style="background: ${color}; color: white; padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">${icon} ${titre}</span>
            <span class="ef-arrow" style="transition: transform 0.3s;">▼</span>
          </div>
          <div class="ef-accordion-content" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; background: white;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid ${color};">Code</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid ${color};">Libellé</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid ${color};">${exN}</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid ${color};">${exN1}</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
              <tfoot>
                <tr style="background: ${color}15; font-weight: bold;">
                  <td colspan="2" style="padding: 10px;">TOTAL</td>
                  <td style="padding: 10px; text-align: right;">${formatMontant(data.total.n)}</td>
                  <td style="padding: 10px; text-align: right;">${formatMontant(data.total.n1)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>`;
    }

    buildCompteResultatAccordion(cr, exN, exN1, formatMontant) {
      let produitsRows = '', chargesRows = '';

      cr.produits.rubriques.forEach(r => {
        produitsRows += `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.code}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.libelle}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #27ae60;">${formatMontant(r.montant_n)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #666;">${formatMontant(r.montant_n1)}</td>
        </tr>`;
      });

      cr.charges.rubriques.forEach(r => {
        chargesRows += `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.code}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.libelle}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #e74c3c;">${formatMontant(r.montant_n)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #666;">${formatMontant(r.montant_n1)}</td>
        </tr>`;
      });

      const resultatColor = cr.resultat.n >= 0 ? '#27ae60' : '#e74c3c';

      return `
        <div class="ef-accordion" data-ef-type="compte-resultat" style="margin-bottom: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
          <div class="ef-accordion-header" style="background: #8e44ad; color: white; padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">📊 COMPTE DE RÉSULTAT</span>
            <span class="ef-arrow" style="transition: transform 0.3s;">▼</span>
          </div>
          <div class="ef-accordion-content" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; background: white;">
            <div style="padding: 16px;">
              <h4 style="color: #27ae60; margin: 0 0 10px 0;">📈 PRODUITS</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                <thead><tr style="background: #f8f9fa;">
                  <th style="padding: 8px; text-align: left;">Code</th>
                  <th style="padding: 8px; text-align: left;">Libellé</th>
                  <th style="padding: 8px; text-align: right;">${exN}</th>
                  <th style="padding: 8px; text-align: right;">${exN1}</th>
                </tr></thead>
                <tbody>${produitsRows}</tbody>
                <tfoot><tr style="background: #d5f5e3; font-weight: bold;">
                  <td colspan="2" style="padding: 8px;">Total Produits</td>
                  <td style="padding: 8px; text-align: right;">${formatMontant(cr.produits.total.n)}</td>
                  <td style="padding: 8px; text-align: right;">${formatMontant(cr.produits.total.n1)}</td>
                </tr></tfoot>
              </table>

              <h4 style="color: #e74c3c; margin: 0 0 10px 0;">📉 CHARGES</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                <thead><tr style="background: #f8f9fa;">
                  <th style="padding: 8px; text-align: left;">Code</th>
                  <th style="padding: 8px; text-align: left;">Libellé</th>
                  <th style="padding: 8px; text-align: right;">${exN}</th>
                  <th style="padding: 8px; text-align: right;">${exN1}</th>
                </tr></thead>
                <tbody>${chargesRows}</tbody>
                <tfoot><tr style="background: #fadbd8; font-weight: bold;">
                  <td colspan="2" style="padding: 8px;">Total Charges</td>
                  <td style="padding: 8px; text-align: right;">${formatMontant(cr.charges.total.n)}</td>
                  <td style="padding: 8px; text-align: right;">${formatMontant(cr.charges.total.n1)}</td>
                </tr></tfoot>
              </table>

              <div style="background: linear-gradient(135deg, ${resultatColor}20, ${resultatColor}10); padding: 16px; border-radius: 8px; border-left: 4px solid ${resultatColor};">
                <h4 style="margin: 0; color: ${resultatColor};">💎 RÉSULTAT NET</h4>
                <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                  <div style="text-align: center;">
                    <div style="font-size: 12px; color: #666;">${exN}</div>
                    <div style="font-size: 24px; font-weight: bold; color: ${resultatColor};">${formatMontant(cr.resultat.n)} FCFA</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 12px; color: #666;">${exN1}</div>
                    <div style="font-size: 18px; color: #666;">${formatMontant(cr.resultat.n1)} FCFA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }

    /**
     * Active les accordéons des États Financiers
     */
    setupEtatsFinanciersAccordions(container) {
      // Gérer les accordéons du format frontend (ancien)
      container.querySelectorAll('.ef-accordion-header').forEach(header => {
        header.addEventListener('click', () => {
          const content = header.nextElementSibling;
          const arrow = header.querySelector('.ef-arrow');
          const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

          if (isOpen) {
            content.style.maxHeight = '0';
            arrow.style.transform = 'rotate(0deg)';
          } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            arrow.style.transform = 'rotate(180deg)';
          }
        });
      });

      // Gérer les accordéons du format backend (nouveau - avec BRUT, AMORT, NET)
      container.querySelectorAll('.section-header-ef').forEach(header => {
        header.addEventListener('click', () => {
          const content = header.nextElementSibling;
          const arrow = header.querySelector('.arrow');
          const isOpen = header.classList.contains('active');

          if (isOpen) {
            header.classList.remove('active');
            content.classList.remove('active');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
          } else {
            header.classList.add('active');
            content.classList.add('active');
            if (arrow) arrow.style.transform = 'rotate(90deg)';
          }
        });
      });

      console.log("✅ [États Financiers] Accordéons activés (formats frontend et backend)");
    }

    // ============================================
    // === ÉCHANTILLONNAGE AUDIT (ACL/IDEA/TeamMate) ===
    // ============================================

    /**
     * Collecte les données de la table pour l'échantillonnage
     */
    collectTableDataForSampling() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return null;
      }

      const headers = this.getTableHeaders();
      const rows = this.getDataRows();

      const rowsData = rows.map(row => {
        const cells = row.querySelectorAll('td');
        return Array.from(cells).map(cell => cell.textContent.trim());
      });

      return {
        tableId: this.generateTableId(this.targetTable),
        headers: headers,
        rows: rowsData
      };
    }

    /**
     * Affiche les résultats de l'échantillonnage sous la table
     */
    displaySampleResults(result) {
      // Supprimer les anciens résultats
      const existing = document.querySelector('.sample-results-container');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.className = 'sample-results-container';
      container.style.cssText = 'margin-top: 20px; padding: 16px; background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 12px; border: 2px solid #4caf50;';

      // Titre
      const title = document.createElement('h3');
      title.innerHTML = `🎲 <strong>Résultat Échantillonnage - ${result.sampleTable.method.toUpperCase()}</strong>`;
      title.style.cssText = 'margin: 0 0 16px 0; color: #2e7d32; font-size: 18px;';
      container.appendChild(title);

      // Statistiques
      if (result.statistics) {
        const statsDiv = document.createElement('div');
        statsDiv.style.cssText = 'background: white; padding: 12px; border-radius: 8px; margin-bottom: 16px;';
        statsDiv.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
            <div style="text-align: center; padding: 8px; background: #e3f2fd; border-radius: 6px;">
              <div style="font-size: 12px; color: #666;">Population</div>
              <div style="font-size: 20px; font-weight: bold; color: #1976d2;">${result.statistics.population_size}</div>
            </div>
            <div style="text-align: center; padding: 8px; background: #e8f5e9; border-radius: 6px;">
              <div style="font-size: 12px; color: #666;">Échantillon</div>
              <div style="font-size: 20px; font-weight: bold; color: #388e3c;">${result.statistics.sample_size}</div>
            </div>
            <div style="text-align: center; padding: 8px; background: #fff3e0; border-radius: 6px;">
              <div style="font-size: 12px; color: #666;">Taux</div>
              <div style="font-size: 20px; font-weight: bold; color: #f57c00;">${result.statistics.sampling_rate}%</div>
            </div>
            ${result.statistics.sample_total ? `
            <div style="text-align: center; padding: 8px; background: #fce4ec; border-radius: 6px;">
              <div style="font-size: 12px; color: #666;">Montant échantillon</div>
              <div style="font-size: 16px; font-weight: bold; color: #c2185b;">${new Intl.NumberFormat('fr-FR').format(result.statistics.sample_total)}</div>
            </div>` : ''}
          </div>
        `;
        container.appendChild(statsDiv);
      }

      // Table échantillon
      const tableContainer = document.createElement('div');
      tableContainer.style.cssText = 'overflow-x: auto;';

      const table = document.createElement('table');
      table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg';
      table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 13px;';

      // En-têtes
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      result.sampleTable.headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        th.style.cssText = 'padding: 10px; text-align: left; background: #4caf50; color: white; border: 1px solid #388e3c;';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Corps
      const tbody = document.createElement('tbody');
      result.sampleTable.rows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.style.background = idx % 2 === 0 ? '#ffffff' : '#f5f5f5';
        row.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell;
          td.style.cssText = 'padding: 8px; border: 1px solid #ddd;';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      tableContainer.appendChild(table);
      container.appendChild(tableContainer);

      // Insérer après la table source
      if (this.targetTable && this.targetTable.parentNode) {
        this.targetTable.parentNode.insertBefore(container, this.targetTable.nextSibling);
      }

      console.log("✅ [Échantillonnage] Résultats affichés");
    }

    /**
     * Appel API backend pour l'échantillonnage
     */
    async callSamplingAPI(method, additionalParams = {}) {
      const tableData = this.collectTableDataForSampling();
      if (!tableData) return;

      try {
        this.showQuickNotification(`🔄 Échantillonnage ${method} en cours...`);

        const payload = {
          tables: [tableData],
          targetTableId: tableData.tableId,
          method: method,
          ...additionalParams
        };

        console.log(`🎲 [Échantillonnage] Envoi requête ${method}:`, payload);

        const response = await fetch(`${getBackendBaseUrl()}/echantillonnage/sample`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`✅ [Échantillonnage] Résultat:`, result);

        if (result.success) {
          this.displaySampleResults(result);
          this.showQuickNotification(result.message);
        } else {
          throw new Error(result.message || "Erreur inconnue");
        }

      } catch (error) {
        console.error(`❌ [Échantillonnage] Erreur:`, error);
        this.showAlert(`❌ Erreur échantillonnage: ${error.message}`);
      }
    }

    /**
     * Échantillonnage aléatoire simple (SAMPLE RANDOM)
     */
    async executeSampleRandom() {
      const sizeStr = prompt("Taille de l'échantillon (nombre d'enregistrements):", "10");
      if (!sizeStr) return;

      const sampleSize = parseInt(sizeStr, 10);
      if (isNaN(sampleSize) || sampleSize <= 0) {
        this.showAlert("⚠️ Veuillez entrer un nombre valide.");
        return;
      }

      await this.callSamplingAPI('random', { sampleSize });
    }

    /**
     * Échantillonnage systématique (SAMPLE INTERVAL)
     */
    async executeSampleSystematic() {
      const intervalStr = prompt("Intervalle de sélection (tous les N enregistrements):", "5");
      if (!intervalStr) return;

      const interval = parseInt(intervalStr, 10);
      if (isNaN(interval) || interval <= 0) {
        this.showAlert("⚠️ Veuillez entrer un intervalle valide.");
        return;
      }

      await this.callSamplingAPI('systematic', { interval });
    }

    /**
     * Échantillonnage par unité monétaire (MUS)
     */
    async executeSampleMonetary() {
      const headers = this.getTableHeaders();

      // Chercher automatiquement une colonne monétaire
      const monetaryKeywords = ['montant', 'solde', 'valeur', 'amount', 'total', 'debit', 'credit'];
      let suggestedCol = headers.find(h => monetaryKeywords.some(kw => h.toLowerCase().includes(kw)));

      const colName = prompt(
        `Colonne monétaire pour MUS:\n(Colonnes disponibles: ${headers.join(', ')})`,
        suggestedCol || headers[0]
      );
      if (!colName) return;

      const sizeStr = prompt("Taille de l'échantillon:", "10");
      if (!sizeStr) return;

      const sampleSize = parseInt(sizeStr, 10);
      if (isNaN(sampleSize) || sampleSize <= 0) {
        this.showAlert("⚠️ Veuillez entrer un nombre valide.");
        return;
      }

      await this.callSamplingAPI('monetary', {
        sampleSize,
        monetaryColumn: colName
      });
    }

    /**
     * Échantillonnage stratifié
     */
    async executeSampleStratified() {
      const headers = this.getTableHeaders();

      const colName = prompt(
        `Colonne de stratification:\n(Colonnes disponibles: ${headers.join(', ')})`,
        headers[0]
      );
      if (!colName) return;

      const sizeStr = prompt("Taille totale de l'échantillon:", "15");
      if (!sizeStr) return;

      const sampleSize = parseInt(sizeStr, 10);
      if (isNaN(sampleSize) || sampleSize <= 0) {
        this.showAlert("⚠️ Veuillez entrer un nombre valide.");
        return;
      }

      await this.callSamplingAPI('stratified', {
        sampleSize,
        stratifyColumn: colName
      });
    }

    /**
     * Échantillonnage d'enregistrements fixes
     */
    async executeSampleFixed() {
      const indicesStr = prompt(
        "Indices des enregistrements à sélectionner (séparés par des virgules):\nExemple: 0, 2, 5, 10",
        "0, 1, 2"
      );
      if (!indicesStr) return;

      const fixedRecords = indicesStr.split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n >= 0);

      if (fixedRecords.length === 0) {
        this.showAlert("⚠️ Veuillez entrer des indices valides.");
        return;
      }

      await this.callSamplingAPI('fixed', { fixedRecords });
    }

    /**
     * Échantillonnage avec remise
     */
    async executeSampleWithReplacement() {
      const sizeStr = prompt("Nombre de tirages (avec possibilité de répétition):", "15");
      if (!sizeStr) return;

      const sampleSize = parseInt(sizeStr, 10);
      if (isNaN(sampleSize) || sampleSize <= 0) {
        this.showAlert("⚠️ Veuillez entrer un nombre valide.");
        return;
      }

      await this.callSamplingAPI('with_replacement', { sampleSize });
    }

    /**
     * Calculer la taille d'échantillon optimale
     */
    async calculateSampleSize() {
      const tableData = this.collectTableDataForSampling();
      const populationSize = tableData ? tableData.rows.length : 100;

      const popStr = prompt("Taille de la population:", String(populationSize));
      if (!popStr) return;

      const pop = parseInt(popStr, 10);
      if (isNaN(pop) || pop <= 0) {
        this.showAlert("⚠️ Veuillez entrer une taille de population valide.");
        return;
      }

      const confStr = prompt("Niveau de confiance (0.90, 0.95, 0.99):", "0.95");
      const confidenceLevel = parseFloat(confStr) || 0.95;

      const errStr = prompt("Erreur tolérable (ex: 0.05 pour 5%):", "0.05");
      const tolerableError = parseFloat(errStr) || 0.05;

      try {
        this.showQuickNotification("🔄 Calcul de la taille d'échantillon...");

        const response = await fetch(`${getBackendBaseUrl()}/echantillonnage/calculate-size`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            populationSize: pop,
            confidenceLevel: confidenceLevel,
            tolerableError: tolerableError,
            expectedError: 0.01
          })
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          this.showAlert(
            `📐 TAILLE D'ÉCHANTILLON RECOMMANDÉE\n\n` +
            `Population: ${result.populationSize}\n` +
            `Niveau de confiance: ${(result.confidenceLevel * 100).toFixed(0)}%\n` +
            `Erreur tolérable: ${(result.tolerableError * 100).toFixed(1)}%\n\n` +
            `➡️ Taille d'échantillon: ${result.sampleSize}\n\n` +
            `Formule: ${result.formula}`
          );
        }

      } catch (error) {
        console.error("❌ [Taille échantillon] Erreur:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    // ============================================
    // === ANALYSE & DÉTECTION DE FRAUDE ===
    // ============================================

    /**
     * Appel API backend pour l'analyse
     */
    async callAnalysisAPI(method, additionalParams = {}) {
      const tableData = this.collectTableDataForSampling();
      if (!tableData) return;

      try {
        this.showQuickNotification(`🔍 Analyse ${method} en cours...`);

        const payload = {
          tables: [tableData],
          targetTableId: tableData.tableId,
          method: method,
          ...additionalParams
        };

        console.log(`🔍 [Analyse] Envoi requête ${method}:`, payload);

        const response = await fetch(`${getBackendBaseUrl()}/echantillonnage/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`✅ [Analyse] Résultat:`, result);

        if (result.success) {
          this.displayAnalysisResults(result, method);
          this.showQuickNotification(result.message);
        } else {
          throw new Error(result.message || "Erreur inconnue");
        }

      } catch (error) {
        console.error(`❌ [Analyse] Erreur:`, error);
        this.showAlert(`❌ Erreur analyse: ${error.message}`);
      }
    }

    /**
     * Affiche les résultats d'analyse sous la table
     */
    displayAnalysisResults(result, method) {
      // Supprimer les anciens résultats
      const existing = document.querySelector('.analysis-results-container');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.className = 'analysis-results-container';

      // Couleur selon le type d'analyse
      const colors = {
        duplicates: '#e74c3c',
        gaps: '#f39c12',
        benford: '#9b59b6',
        threshold: '#e67e22',
        weekend: '#3498db',
        round_amounts: '#1abc9c',
        outliers: '#e74c3c',
        period_changes: '#2ecc71'
      };
      const color = colors[method] || '#3498db';

      container.style.cssText = `margin-top: 20px; padding: 16px; background: linear-gradient(135deg, ${color}15, ${color}05); border-radius: 12px; border: 2px solid ${color};`;

      // Titre
      const title = document.createElement('h3');
      title.innerHTML = `🔍 <strong>Résultat Analyse - ${method.toUpperCase()}</strong>`;
      title.style.cssText = `margin: 0 0 16px 0; color: ${color}; font-size: 18px;`;
      container.appendChild(title);

      // Statistiques
      if (result.statistics) {
        const statsDiv = document.createElement('div');
        statsDiv.style.cssText = 'background: white; padding: 12px; border-radius: 8px; margin-bottom: 16px;';

        let statsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">';
        for (const [key, value] of Object.entries(result.statistics)) {
          if (typeof value !== 'object') {
            statsHtml += `
              <div style="text-align: center; padding: 8px; background: ${color}15; border-radius: 6px;">
                <div style="font-size: 11px; color: #666; text-transform: uppercase;">${key.replace(/_/g, ' ')}</div>
                <div style="font-size: 16px; font-weight: bold; color: ${color};">${value}</div>
              </div>`;
          }
        }
        statsHtml += '</div>';
        statsDiv.innerHTML = statsHtml;
        container.appendChild(statsDiv);
      }

      // Table résultats
      if (result.result && result.result.rows && result.result.rows.length > 0) {
        const tableContainer = document.createElement('div');
        tableContainer.style.cssText = 'overflow-x: auto; max-height: 400px; overflow-y: auto;';

        const table = document.createElement('table');
        table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg';
        table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 13px;';

        // En-têtes
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        result.result.headers.forEach(h => {
          const th = document.createElement('th');
          th.textContent = h;
          th.style.cssText = `padding: 10px; text-align: left; background: ${color}; color: white; border: 1px solid ${color}; position: sticky; top: 0;`;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Corps
        const tbody = document.createElement('tbody');
        result.result.rows.forEach((row, idx) => {
          const tr = document.createElement('tr');
          tr.style.background = idx % 2 === 0 ? '#ffffff' : '#f8f9fa';
          row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.style.cssText = 'padding: 8px; border: 1px solid #ddd;';
            // Colorer les cellules d'alerte
            if (cell.includes('⚠️') || cell.includes('SUSPECT')) {
              td.style.background = '#fee2e2';
              td.style.color = '#dc2626';
              td.style.fontWeight = 'bold';
            }
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
      } else {
        const noData = document.createElement('p');
        noData.textContent = '✅ Aucune anomalie détectée';
        noData.style.cssText = 'text-align: center; color: #27ae60; font-weight: bold; padding: 20px;';
        container.appendChild(noData);
      }

      // Insérer après la table source
      if (this.targetTable && this.targetTable.parentNode) {
        this.targetTable.parentNode.insertBefore(container, this.targetTable.nextSibling);
      }

      console.log("✅ [Analyse] Résultats affichés");
    }

    /**
     * Détection des doublons
     */
    async analyzeDetectDuplicates() {
      const headers = this.getTableHeaders();
      const colsStr = prompt(
        `Colonnes à vérifier pour les doublons (séparées par des virgules):\nLaissez vide pour toutes les colonnes.\n\nColonnes disponibles: ${headers.join(', ')}`,
        ""
      );

      const columns = colsStr ? colsStr.split(',').map(c => c.trim()).filter(c => c) : null;
      await this.callAnalysisAPI('duplicates', { columns });
    }

    /**
     * Détection des trous de séquence
     */
    async analyzeDetectGaps() {
      const headers = this.getTableHeaders();
      const seqCol = prompt(
        `Colonne de séquence (numéros de facture, bons de commande...):\n\nColonnes disponibles: ${headers.join(', ')}`,
        headers[0]
      );
      if (!seqCol) return;

      await this.callAnalysisAPI('gaps', { sequenceColumn: seqCol });
    }

    /**
     * Analyse loi de Benford
     */
    async analyzeBenford() {
      const headers = this.getTableHeaders();
      const amountCols = headers.filter(h =>
        ['montant', 'amount', 'total', 'solde', 'valeur'].some(kw => h.toLowerCase().includes(kw))
      );

      const amountCol = prompt(
        `Colonne de montants pour l'analyse Benford:\n\nColonnes suggérées: ${amountCols.join(', ') || 'aucune'}\nToutes: ${headers.join(', ')}`,
        amountCols[0] || headers[0]
      );
      if (!amountCol) return;

      await this.callAnalysisAPI('benford', { amountColumn: amountCol });
    }

    /**
     * Détection transactions sous seuil
     */
    async analyzeThreshold() {
      const headers = this.getTableHeaders();
      const amountCol = prompt(
        `Colonne de montants:\n\nColonnes: ${headers.join(', ')}`,
        headers.find(h => h.toLowerCase().includes('montant')) || headers[0]
      );
      if (!amountCol) return;

      const thresholdStr = prompt(
        "Seuil d'autorisation (ex: 10000 pour détecter les transactions entre 8000 et 10000):",
        "10000"
      );
      const threshold = parseFloat(thresholdStr);
      if (isNaN(threshold) || threshold <= 0) {
        this.showAlert("⚠️ Seuil invalide");
        return;
      }

      await this.callAnalysisAPI('threshold', { amountColumn: amountCol, threshold });
    }

    /**
     * Détection transactions week-end
     */
    async analyzeWeekend() {
      const headers = this.getTableHeaders();
      const dateCols = headers.filter(h =>
        ['date', 'jour', 'day'].some(kw => h.toLowerCase().includes(kw))
      );

      const dateCol = prompt(
        `Colonne de date:\n\nColonnes suggérées: ${dateCols.join(', ') || 'aucune'}\nToutes: ${headers.join(', ')}`,
        dateCols[0] || headers[0]
      );
      if (!dateCol) return;

      await this.callAnalysisAPI('weekend', { dateColumn: dateCol });
    }

    /**
     * Détection montants ronds
     */
    async analyzeRoundAmounts() {
      const headers = this.getTableHeaders();
      const amountCol = prompt(
        `Colonne de montants:\n\nColonnes: ${headers.join(', ')}`,
        headers.find(h => h.toLowerCase().includes('montant')) || headers[0]
      );
      if (!amountCol) return;

      await this.callAnalysisAPI('round_amounts', { amountColumn: amountCol });
    }

    /**
     * Détection valeurs aberrantes (outliers)
     */
    async analyzeOutliers() {
      const headers = this.getTableHeaders();
      const amountCol = prompt(
        `Colonne de montants:\n\nColonnes: ${headers.join(', ')}`,
        headers.find(h => h.toLowerCase().includes('montant')) || headers[0]
      );
      if (!amountCol) return;

      const zStr = prompt("Seuil Z-score (défaut: 3.0 = 3 écarts-types):", "3.0");
      const zThreshold = parseFloat(zStr) || 3.0;

      await this.callAnalysisAPI('outliers', { amountColumn: amountCol, zScoreThreshold: zThreshold });
    }

    /**
     * Détection changements brutaux entre périodes
     */
    async analyzePeriodChanges() {
      const headers = this.getTableHeaders();

      const amountCol = prompt(
        `Colonne de montants:\n\nColonnes: ${headers.join(', ')}`,
        headers.find(h => h.toLowerCase().includes('montant')) || headers[0]
      );
      if (!amountCol) return;

      const dateCol = prompt(
        `Colonne de date:\n\nColonnes: ${headers.join(', ')}`,
        headers.find(h => h.toLowerCase().includes('date')) || headers[0]
      );
      if (!dateCol) return;

      await this.callAnalysisAPI('period_changes', { amountColumn: amountCol, dateColumn: dateCol });
    }

    // === SYNCHRONISATION ===
    syncWithDev() {
      try {
        if (this.targetTable) {
          const tableId = this.generateTableId(this.targetTable);
          if (window.claraverseSyncAPI?.forceSaveTable) window.claraverseSyncAPI.forceSaveTable(this.targetTable);
          else if (typeof window.saveTableNow === "function") window.saveTableNow(this.targetTable);
          if (window.claraverseSyncAPI?.notifyTableUpdate) window.claraverseSyncAPI.notifyTableUpdate(tableId, this.targetTable, "menu");
          document.dispatchEvent(new CustomEvent("claraverse:table:updated", { detail: { tableId, table: this.targetTable, source: "menu", timestamp: Date.now() } }));
        }
      } catch (error) { console.error("Erreur sync:", error); }
    }

    generateTableId(table) {
      if (table.dataset.stableTableId) return table.dataset.stableTableId;
      const pos = Array.from(document.querySelectorAll("table")).indexOf(table);
      const hdrs = Array.from(table.querySelectorAll("th")).map(th => th.textContent.trim()).join("_").replace(/[^a-zA-Z0-9_]/g, "").substring(0, 30);
      const rows = table.querySelectorAll("tr").length;
      const cols = table.querySelector("tr")?.querySelectorAll("td, th").length || 0;
      const id = `table_${pos}_${hdrs}_${rows}x${cols}`;
      table.dataset.stableTableId = id;
      return id;
    }

    notifyTableStructureChange(action, details = {}) {
      if (!this.targetTable) return;
      const tableId = this.generateTableId(this.targetTable);
      document.dispatchEvent(new CustomEvent("claraverse:table:structure:changed", { detail: { tableId, table: this.targetTable, action, details, source: "menu", timestamp: Date.now() } }));
    }

    // === UI ===
    showQuickNotification(message) {
      const n = document.createElement("div");
      n.style.cssText = "position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #4caf50, #45a049); color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 20000; font-size: 14px; opacity: 0; transform: translateY(-20px); transition: all 0.3s;";
      n.textContent = message;
      document.body.appendChild(n);
      setTimeout(() => { n.style.opacity = "1"; n.style.transform = "translateY(0)"; }, 10);
      setTimeout(() => { n.style.opacity = "0"; n.style.transform = "translateY(-20px)"; setTimeout(() => n.remove(), 300); }, 3000);
    }

    showAlert(message) { alert(message); }

    // === GESTION MENU ===
    handleTableHover(e, table) {
      this.isHoveringTable = true;
      this.clearHideTimeout();
      if (this.targetTable !== table && !this.isMenuVisible) {
        this.hoverTimeout = setTimeout(() => { if (this.isHoveringTable && !this.isMenuVisible) this.showMenu(e.pageX + 10, e.pageY + 10, table); }, this.config.hoverDelay);
      }
    }

    handleTableLeave(e, table) { this.isHoveringTable = false; this.clearHoverTimeout(); this.scheduleHideMenu(); }
    scheduleHideMenu() { this.hideTimeout = setTimeout(() => { if (!this.isHoveringTable && !this.isHoveringMenu) this.hideMenu(); }, this.config.hideDelay); }
    clearHoverTimeout() { if (this.hoverTimeout) { clearTimeout(this.hoverTimeout); this.hoverTimeout = null; } }
    clearHideTimeout() { if (this.hideTimeout) { clearTimeout(this.hideTimeout); this.hideTimeout = null; } this.clearHoverTimeout(); }

    isTableInChat(table) {
      // Détection spécifique pour les tables Lead Balance
      if (table.classList.contains('lead-table') || 
          table.classList.contains('lead-balance-table') ||
          table.closest('.lead-syscohada-container') ||
          table.closest('.lead-balance-results') ||
          table.closest('.lead-balance-accordion')) {
        return true;
      }
      
      // Détection standard
      if (table.matches("table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg") && table.closest("div.prose.prose-base.dark\\:prose-invert.max-w-none")) return true;
      const selectors = ['[class*="chat"]', '[class*="message"]', '[class*="conversation"]', '[id*="chat"]', ".prose", ".markdown-body", '[class*="assistant"]', "[data-editable-processed]"];
      return selectors.some(s => table.closest(s));
    }

    showMenu(x, y, table) {
      this.targetTable = table;
      this.expandedSections.clear();
      this.menuElement.querySelectorAll('.accordion-content').forEach(c => c.style.maxHeight = "0");
      this.menuElement.querySelectorAll('.accordion-arrow').forEach(a => a.style.transform = "rotate(0deg)");
      this.menuElement.querySelectorAll('.accordion-header').forEach(h => { h.style.background = "transparent"; h.style.borderLeftColor = "transparent"; });
      this.menuElement.style.left = `${x}px`;
      this.menuElement.style.top = `${y}px`;
      this.menuElement.style.display = "block";
      setTimeout(() => { this.menuElement.style.opacity = "1"; this.menuElement.style.transform = "translateY(0) scale(1)"; }, 10);
      this.isMenuVisible = true;
      setTimeout(() => {
        const rect = this.menuElement.getBoundingClientRect();
        if (rect.right > window.innerWidth) this.menuElement.style.left = `${window.innerWidth - rect.width - 10}px`;
        if (rect.bottom > window.innerHeight) this.menuElement.style.top = `${window.innerHeight - rect.height - 10}px`;
      }, 0);
    }

    hideMenu() {
      if (!this.isMenuVisible) return;
      this.menuElement.style.opacity = "0";
      this.menuElement.style.transform = "translateY(-10px) scale(0.95)";
      setTimeout(() => { this.menuElement.style.display = "none"; this.isMenuVisible = false; this.isHoveringTable = false; this.isHoveringMenu = false; }, 300);
      this.clearHoverTimeout();
      this.clearHideTimeout();
    }

    // === OBSERVERS & INIT ===
    observeNewTables() {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(m => m.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === "TABLE" && this.isTableInChat(node)) console.log("📊 Nouvelle table détectée");
            if (node.querySelectorAll) node.querySelectorAll("table").forEach(t => { if (this.isTableInChat(t)) console.log("📊 Sous-table détectée"); });
          }
        }));
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    processExistingTables() {
      let count = 0;
      document.querySelectorAll("table").forEach(t => { if (this.isTableInChat(t)) count++; });
      console.log(`📊 ${count} table(s) prêtes pour le menu contextuel`);
    }

    forceInit() { this.init(); }

    initSyncWithDev() {
      const wait = (attempts = 0) => {
        if (window.claraverseSyncAPI) { this.setupDevJSListeners(); }
        else if (attempts < 50) setTimeout(() => wait(attempts + 1), 100);
      };
      wait();
    }

    setupDevJSListeners() {
      this.addEventListenerWithCleanup(document, "claraverse:save:complete", () => { });
      this.addEventListenerWithCleanup(document, "claraverse:request:rescan", () => this.processExistingTables());
    }

    // === EXPORT LIASSE OFFICIELLE ===
    exporterLiasseOfficielle() {
      console.log("📋 Export Liasse Officielle déclenché");
      
      // Chercher le conteneur des états financiers
      const container = document.querySelector('.etats-fin-container');
      
      if (!container) {
        this.showAlert("⚠️ Aucun état financier disponible. Veuillez d'abord générer les états financiers.");
        return;
      }
      
      // Vérifier que le handler est chargé
      if (typeof window.ExportLiasseHandler === 'undefined') {
        this.showAlert("❌ Module d'export non chargé. Veuillez recharger la page.");
        return;
      }
      
      // Appeler le handler
      window.ExportLiasseHandler.exportFromContextMenu(container);
    }

    // === EXPORT SYNTHÈSE CAC ===
    /**
     * Export Synthèse CAC - Collecte tous les points d'audit (FRAP, Recos révision, Recos contrôle interne)
     * et génère un rapport structuré au format CAC/Expert-Comptable
     */
    async exportSyntheseCAC() {
      try {
        this.showQuickNotification("📊 Export Synthèse CAC en cours...");

        // DIAGNOSTIC: Tester différents sélecteurs
        console.log("🔍 [Export CAC] DIAGNOSTIC - Test des sélecteurs:");
        console.log("  - document.querySelectorAll('table'):", document.querySelectorAll('table').length);
        console.log("  - document.querySelectorAll('div.prose table'):", document.querySelectorAll('div.prose table').length);
        console.log("  - document.querySelectorAll('div[class*=\"prose\"] table'):", document.querySelectorAll('div[class*="prose"] table').length);
        console.log("  - document.querySelectorAll('main table'):", document.querySelectorAll('main table').length);
        console.log("  - document.querySelectorAll('[role=\"main\"] table'):", document.querySelectorAll('[role="main"] table').length);

        // Utiliser un sélecteur CSS simple et universel pour détecter toutes les tables
        const CLARAVERSE_SELECTORS = {
          CHAT_TABLES: "table",  // Sélecteur universel - détecte toutes les tables
          PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
        };

        // CORRECTION FINALE: Utiliser directement le sélecteur global 'div.prose table'
        // Les logs montrent que ce sélecteur trouve bien les 24 tables
        // Le problème était qu'on cherchait d'abord un conteneur puis les tables dedans
        // Mais querySelector('div.prose') ne trouve pas le bon conteneur
        // car les classes complètes sont: "prose prose-base dark:prose-invert max-w-none"
        
        const allTables = Array.from(document.querySelectorAll('div.prose table'));
        
        console.log("✅ [Export CAC] Sélecteur utilisé: div.prose table");
        console.log(`🔍 [Export CAC] ${allTables.length} table(s) Claraverse trouvée(s)`);
        
        // DIAGNOSTIC: Afficher les 3 premières tables trouvées
        if (allTables.length > 0) {
          console.log("🔍 [Export CAC] Premières tables détectées:");
          allTables.slice(0, 3).forEach((table, i) => {
            console.log(`  Table ${i + 1}:`, {
              classes: table.className,
              rows: table.querySelectorAll('tr').length,
              parent: table.parentElement.tagName + (table.parentElement.className ? '.' + table.parentElement.className.split(' ')[0] : '')
            });
          });
        }

        if (allTables.length === 0) {
          this.showAlert("⚠️ Aucune table Claraverse trouvée dans le chat.\n\nAssurez-vous que des tables FRAP, Recos Révision ou Recos CI sont présentes.\n\nLes tables doivent avoir les classes CSS Claraverse.\n\nVérifiez la console (F12) pour plus de détails.");
          return;
        }

        // Collecter les différents types de points d'audit
        const frapPoints = this.collectFrapPoints(allTables);
        const recosRevisionPoints = this.collectRecosRevisionPoints(allTables);
        const recosControleInternePoints = this.collectRecosControleInternePoints(allTables);

        console.log(`📊 [Export CAC] Points collectés:`);
        console.log(`   - FRAP: ${frapPoints.length}`);
        console.log(`   - Recos Révision: ${recosRevisionPoints.length}`);
        console.log(`   - Recos Contrôle Interne: ${recosControleInternePoints.length}`);

        if (frapPoints.length === 0 && recosRevisionPoints.length === 0 && recosControleInternePoints.length === 0) {
          this.showAlert("⚠️ Aucun point d'audit CAC détecté dans le chat.\n\nRecherche:\n- Tables FRAP\n- Tables Recos révision des comptes\n- Tables Recos contrôle interne comptable");
          return;
        }

        // Préparer les données pour le backend
        const requestData = {
          frap_points: frapPoints,
          recos_revision_points: recosRevisionPoints,
          recos_controle_interne_points: recosControleInternePoints,
          date_rapport: new Date().toISOString().split('T')[0]
        };

        try {
          // Appeler le backend Python FINAL (version avec template + contenu complet)
          const response = await fetch(`${getBackendBaseUrl()}/export-synthese-cac-final`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur serveur');
          }

          // Télécharger le fichier
          const blob = await response.blob();
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
          const filename = `synthese_cac_${timestamp}.docx`;

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);

          const totalPoints = frapPoints.length + recosRevisionPoints.length + recosControleInternePoints.length;
          this.showQuickNotification(`✅ Synthèse CAC exportée! (${totalPoints} points)`);

        } catch (backendError) {
          console.error("Erreur backend:", backendError);

          // Fallback vers génération JS si le backend n'est pas disponible
          if (backendError.message.includes('fetch') || backendError.message.includes('NetworkError') || backendError.message.includes('Failed')) {
            console.log("⚠️ Backend non disponible, utilisation du fallback JS...");
            return this.exportSyntheseCAC_JS(frapPoints, recosRevisionPoints, recosControleInternePoints);
          }

          this.showAlert(`❌ Erreur: ${backendError.message}`);
        }

      } catch (error) {
        console.error("Erreur export synthèse CAC:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Collecter les points FRAP (Feuille de Révélation et d'Analyse de Problème)
     */
    collectFrapPoints(tables) {
      const frapPoints = [];
      const processedIndices = new Set();

      for (let i = 0; i < tables.length; i++) {
        if (processedIndices.has(i)) continue;

        const firstTable = tables[i];
        const firstTableData = this.extractTableDataOptimized(firstTable);
        
        // Vérifier si c'est une table FRAP
        const isFrap = firstTableData.some(row => 
          row.some(cell => (cell || '').toLowerCase().includes('frap'))
        );

        if (!isFrap) continue;

        // Collecter les 6 tables consécutives (ou moins si fin du tableau)
        const groupSize = Math.min(6, tables.length - i);
        const tableGroup = [];
        for (let j = 0; j < groupSize; j++) {
          tableGroup.push(tables[i + j]);
          processedIndices.add(i + j);
        }

        console.log(`✅ [FRAP] Table FRAP détectée avec ${tableGroup.length} sous-tables`);

        // Extraire les données de toutes les tables de ce point FRAP
        const frapData = {
          metadata: {},
          intitule: '',
          observation: '',
          constat: '',
          risque: '',
          recommandation: ''
        };

        tableGroup.forEach((subTable, index) => {
          const data = this.extractTableDataOptimized(subTable);
          
          if (index === 0) {
            // Table 1: Métadonnées (Etape, Norme, Méthode, Reference)
            data.forEach(row => {
              if (row.length >= 2) {
                const key = (row[0] || '').toLowerCase().trim();
                const value = row[1] || '';
                if (key.includes('etape')) frapData.metadata.etape = value;
                if (key.includes('norme')) frapData.metadata.norme = value;
                if (key.includes('méthode') || key.includes('methode')) frapData.metadata.methode = value;
                if (key.includes('reference') || key.includes('référence')) frapData.metadata.reference = value;
              }
            });
          } else if (index === 1 && data.length > 0) {
            // Table 2: Intitulé - Extraire de toutes les cellules disponibles
            frapData.intitule = this.extractFullCellContent(data);
          } else if (index === 2 && data.length > 0) {
            // Table 3: Observation - Extraire le contenu complet
            frapData.observation = this.extractFullCellContent(data);
          } else if (index === 3 && data.length > 0) {
            // Table 4: Constat - Extraire le contenu complet
            frapData.constat = this.extractFullCellContent(data);
          } else if (index === 4 && data.length > 0) {
            // Table 5: Risque - Extraire le contenu complet
            frapData.risque = this.extractFullCellContent(data);
          } else if (index === 5 && data.length > 0) {
            // Table 6: Recommandation - Extraire le contenu complet
            frapData.recommandation = this.extractFullCellContent(data);
          }
        });

        if (frapData.intitule) {
          frapPoints.push(frapData);
        }
      }

      return frapPoints;
    }

    /**
     * Collecter les points de Recommandations Révision des Comptes
     */
    collectRecosRevisionPoints(tables) {
      const recosPoints = [];
      const processedIndices = new Set();

      for (let i = 0; i < tables.length; i++) {
        if (processedIndices.has(i)) continue;

        const firstTable = tables[i];
        const firstTableData = this.extractTableDataOptimized(firstTable);
        
        // Vérifier si c'est une table Recos révision des comptes
        const isRecosRevision = firstTableData.some(row => 
          row.some(cell => {
            const cellLower = (cell || '').toLowerCase();
            return (cellLower.includes('recos') && cellLower.includes('revision')) || 
                   (cellLower.includes('recommendations') && cellLower.includes('comptable') && !cellLower.includes('contrôle') && !cellLower.includes('controle') && !cellLower.includes('interne'));
          })
        );

        if (!isRecosRevision) continue;

        // Collecter les 6 tables consécutives
        const groupSize = Math.min(6, tables.length - i);
        const tableGroup = [];
        for (let j = 0; j < groupSize; j++) {
          tableGroup.push(tables[i + j]);
          processedIndices.add(i + j);
        }

        console.log(`✅ [Recos Révision] Table détectée avec ${tableGroup.length} sous-tables`);

        const recosData = {
          metadata: {},
          intitule: '',
          description: '',
          observation: '',
          ajustement: '',
          regularisation: ''
        };

        tableGroup.forEach((subTable, index) => {
          const data = this.extractTableDataOptimized(subTable);
          
          if (index === 0) {
            // Table 1: Métadonnées
            data.forEach(row => {
              if (row.length >= 2) {
                const key = (row[0] || '').toLowerCase().trim();
                const value = row[1] || '';
                if (key.includes('etape')) recosData.metadata.etape = value;
                if (key.includes('norme')) recosData.metadata.norme = value;
                if (key.includes('méthode') || key.includes('methode')) recosData.metadata.methode = value;
                if (key.includes('reference') || key.includes('référence')) recosData.metadata.reference = value;
              }
            });
          } else if (index === 1 && data.length > 0) {
            // Table 2: Intitulé - Extraire le contenu complet
            recosData.intitule = this.extractFullCellContent(data);
          } else if (index === 2 && data.length > 0) {
            // Table 3: Description - Extraire le contenu complet
            recosData.description = this.extractFullCellContent(data);
          } else if (index === 3 && data.length > 0) {
            // Table 4: Observation - Extraire le contenu complet
            recosData.observation = this.extractFullCellContent(data);
          } else if (index === 4 && data.length > 0) {
            // Table 5: Ajustement - Extraire le contenu complet
            recosData.ajustement = this.extractFullCellContent(data);
          } else if (index === 5 && data.length > 0) {
            // Table 6: Régularisation - Extraire le contenu complet
            recosData.regularisation = this.extractFullCellContent(data);
          }
        });

        if (recosData.intitule) {
          recosPoints.push(recosData);
        }
      }

      return recosPoints;
    }

    /**
     * Collecter les points de Recommandations Contrôle Interne Comptable
     */
    collectRecosControleInternePoints(tables) {
      const recosPoints = [];
      const processedIndices = new Set();

      for (let i = 0; i < tables.length; i++) {
        if (processedIndices.has(i)) continue;

        const firstTable = tables[i];
        const firstTableData = this.extractTableDataOptimized(firstTable);
        
        // Vérifier si c'est une table Recos contrôle interne comptable
        // Doit contenir "recos" ET "controle" ET "interne" ET "comptable" (tous ensemble)
        const isRecosCI = firstTableData.some(row => 
          row.some(cell => {
            const cellLower = (cell || '').toLowerCase().replace(/\s+/g, ' ').trim();
            const hasRecos = cellLower.includes('recos');
            const hasControle = cellLower.includes('controle');
            const hasInterne = cellLower.includes('interne');
            const hasComptable = cellLower.includes('comptable');
            
            return hasRecos && hasControle && hasInterne && hasComptable;
          })
        );

        if (!isRecosCI) continue;

        // Collecter les 6 tables consécutives
        const groupSize = Math.min(6, tables.length - i);
        const tableGroup = [];
        for (let j = 0; j < groupSize; j++) {
          tableGroup.push(tables[i + j]);
          processedIndices.add(i + j);
        }

        console.log(`✅ [Recos CI] Table détectée avec ${tableGroup.length} sous-tables`);

        const recosData = {
          metadata: {},
          intitule: '',
          observation: '',
          constat: '',
          risque: '',
          recommandation: ''
        };

        tableGroup.forEach((subTable, index) => {
          const data = this.extractTableDataOptimized(subTable);
          
          if (index === 0) {
            // Table 1: Métadonnées
            data.forEach(row => {
              if (row.length >= 2) {
                const key = (row[0] || '').toLowerCase().trim();
                const value = row[1] || '';
                if (key.includes('etape')) recosData.metadata.etape = value;
                if (key.includes('norme')) recosData.metadata.norme = value;
                if (key.includes('méthode') || key.includes('methode')) recosData.metadata.methode = value;
                if (key.includes('reference') || key.includes('référence')) recosData.metadata.reference = value;
              }
            });
          } else if (index === 1 && data.length > 0) {
            // Table 2: Intitulé - Extraire le contenu complet
            recosData.intitule = this.extractFullCellContent(data);
          } else if (index === 2 && data.length > 0) {
            // Table 3: Observation - Extraire le contenu complet
            recosData.observation = this.extractFullCellContent(data);
          } else if (index === 3 && data.length > 0) {
            // Table 4: Constat - Extraire le contenu complet
            recosData.constat = this.extractFullCellContent(data);
          } else if (index === 4 && data.length > 0) {
            // Table 5: Risque - Extraire le contenu complet
            recosData.risque = this.extractFullCellContent(data);
          } else if (index === 5 && data.length > 0) {
            // Table 6: Recommandation - Extraire le contenu complet
            recosData.recommandation = this.extractFullCellContent(data);
          }
        });

        if (recosData.intitule) {
          recosPoints.push(recosData);
        }
      }

      return recosPoints;
    }

    /**
     * Fallback JavaScript pour générer le rapport CAC si le backend n'est pas disponible
     */
    async exportSyntheseCAC_JS(frapPoints, recosRevisionPoints, recosControleInternePoints) {
      try {
        await this.ensureDocxLibraryLoaded();

        const doc = new docx.Document({
          sections: [{
            properties: {},
            children: [
              // En-tête du rapport
              new docx.Paragraph({
                text: "SYNTHÈSE DES TRAVAUX DE RÉVISION",
                heading: docx.HeadingLevel.HEADING_1,
                alignment: docx.AlignmentType.CENTER,
                spacing: { after: 400 }
              }),

              // 1. INTRODUCTION
              new docx.Paragraph({
                text: "1. INTRODUCTION",
                heading: docx.HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
              }),
              new docx.Paragraph({
                text: "Le présent document synthétise les observations et recommandations issues de nos travaux de révision des comptes et d'évaluation du contrôle interne comptable.",
                spacing: { after: 200 }
              }),

              // 2. OBSERVATIONS D'AUDIT (Recos Révision)
              new docx.Paragraph({
                text: "2. OBSERVATIONS D'AUDIT",
                heading: docx.HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
              }),
              ...this.generateRecosRevisionSection_JS(recosRevisionPoints),

              // 3. POINTS DE CONTRÔLE INTERNE
              new docx.Paragraph({
                text: "3. POINTS DE CONTRÔLE INTERNE",
                heading: docx.HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
              }),
              ...this.generateControleInterneSection_JS(frapPoints, recosControleInternePoints)
            ]
          }]
        });

        const blob = await docx.Packer.toBlob(doc);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const filename = `synthese_cac_${timestamp}.docx`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        const totalPoints = frapPoints.length + recosRevisionPoints.length + recosControleInternePoints.length;
        this.showQuickNotification(`✅ Synthèse CAC exportée (JS)! (${totalPoints} points)`);

      } catch (error) {
        console.error("Erreur export CAC JS:", error);
        this.showAlert(`❌ Erreur génération JS: ${error.message}`);
      }
    }

    generateRecosRevisionSection_JS(recosPoints) {
      const paragraphs = [];

      if (recosPoints.length === 0) {
        paragraphs.push(new docx.Paragraph({
          text: "Aucune observation d'audit sur la révision des comptes.",
          italics: true,
          spacing: { after: 200 }
        }));
        return paragraphs;
      }

      recosPoints.forEach((point, index) => {
        paragraphs.push(
          new docx.Paragraph({
            text: `2.${index + 1}. ${point.intitule}`,
            heading: docx.HeadingLevel.HEADING_3,
            spacing: { before: 300, after: 150 }
          })
        );

        if (point.observation) {
          paragraphs.push(
            new docx.Paragraph({ text: "Observation:", bold: true, spacing: { before: 100 } }),
            new docx.Paragraph({ text: point.observation, spacing: { after: 150 } })
          );
        }

        if (point.ajustement) {
          paragraphs.push(
            new docx.Paragraph({ text: "Ajustement proposé:", bold: true, spacing: { before: 100 } }),
            new docx.Paragraph({ text: point.ajustement, spacing: { after: 150 } })
          );
        }

        if (point.regularisation) {
          paragraphs.push(
            new docx.Paragraph({ text: "Régularisation comptable:", bold: true, spacing: { before: 100 } }),
            new docx.Paragraph({ text: point.regularisation, spacing: { after: 200 } })
          );
        }
      });

      return paragraphs;
    }

    generateControleInterneSection_JS(frapPoints, recosPoints) {
      const paragraphs = [];
      const allPoints = [...frapPoints, ...recosPoints];

      if (allPoints.length === 0) {
        paragraphs.push(new docx.Paragraph({
          text: "Aucun point de contrôle interne identifié.",
          italics: true,
          spacing: { after: 200 }
        }));
        return paragraphs;
      }

      allPoints.forEach((point, index) => {
        paragraphs.push(
          new docx.Paragraph({
            text: `3.${index + 1}. ${point.intitule}`,
            heading: docx.HeadingLevel.HEADING_3,
            spacing: { before: 300, after: 150 }
          })
        );

        if (point.observation) {
          paragraphs.push(
            new docx.Paragraph({ text: "Observation:", bold: true, spacing: { before: 100 } }),
            new docx.Paragraph({ text: point.observation, spacing: { after: 150 } })
          );
        }

        if (point.constat) {
          paragraphs.push(
            new docx.Paragraph({ text: "Constat:", bold: true, spacing: { before: 100 } }),
            new docx.Paragraph({ text: point.constat, spacing: { after: 150 } })
          );
        }

        if (point.risque) {
          paragraphs.push(
            new docx.Paragraph({ text: "Risques:", bold: true, spacing: { before: 100 } }),
            new docx.Paragraph({ text: point.risque, spacing: { after: 150 } })
          );
        }

        if (point.recommandation) {
          paragraphs.push(
            new docx.Paragraph({ text: "Recommandation:", bold: true, spacing: { before: 100 } }),
            new docx.Paragraph({ text: point.recommandation, spacing: { after: 200 } })
          );
        }
      });

      return paragraphs;
    }

    /**
     * Export uniquement les points de révision des comptes
     */
    async exportPointsRevision() {
      try {
        this.showQuickNotification("📋 Export Points Révision en cours...");
        
        const chatContainer = document.querySelector('div[class*="prose"]') || document.body;
        const allTables = Array.from(chatContainer.querySelectorAll('table'));
        const recosPoints = this.collectRecosRevisionPoints(allTables);

        if (recosPoints.length === 0) {
          this.showAlert("⚠️ Aucun point de révision des comptes détecté.");
          return;
        }

        // Utiliser la même logique que exportSyntheseCAC mais uniquement pour les recos révision
        const requestData = {
          frap_points: [],
          recos_revision_points: recosPoints,
          recos_controle_interne_points: [],
          date_rapport: new Date().toISOString().split('T')[0]
        };

        const response = await fetch(`${getBackendBaseUrl()}/api/word/export-synthese-cac`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error('Erreur serveur');

        const blob = await response.blob();
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `points_revision_${timestamp}.docx`;
        link.click();
        URL.revokeObjectURL(link.href);

        this.showQuickNotification(`✅ Points révision exportés! (${recosPoints.length} points)`);

      } catch (error) {
        console.error("Erreur export points révision:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * Export uniquement les points de contrôle interne
     */
    async exportPointsControleInterne() {
      try {
        this.showQuickNotification("🔍 Export Points Contrôle Interne en cours...");
        
        const chatContainer = document.querySelector('div[class*="prose"]') || document.body;
        const allTables = Array.from(chatContainer.querySelectorAll('table'));
        const frapPoints = this.collectFrapPoints(allTables);
        const recosPoints = this.collectRecosControleInternePoints(allTables);

        if (frapPoints.length === 0 && recosPoints.length === 0) {
          this.showAlert("⚠️ Aucun point de contrôle interne détecté.");
          return;
        }

        const requestData = {
          frap_points: frapPoints,
          recos_revision_points: [],
          recos_controle_interne_points: recosPoints,
          date_rapport: new Date().toISOString().split('T')[0]
        };

        const response = await fetch(`${getBackendBaseUrl()}/api/word/export-synthese-cac`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error('Erreur serveur');

        const blob = await response.blob();
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `points_controle_interne_${timestamp}.docx`;
        link.click();
        URL.revokeObjectURL(link.href);

        const totalPoints = frapPoints.length + recosPoints.length;
        this.showQuickNotification(`✅ Points contrôle interne exportés! (${totalPoints} points)`);

      } catch (error) {
        console.error("Erreur export points contrôle interne:", error);
        this.showAlert(`❌ Erreur: ${error.message}`);
      }
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * SECTION: PAPIER DE TRAVAIL - X-REF DOCUMENTAIRE
     * ═══════════════════════════════════════════════════════════════════════════════
     */

    /**
     * Importer X-Ref documentaire
     * Ouvre le formulaire n8n pour uploader des documents dans Google Drive
     */
    importerXRefDocumentaire() {
      console.log("📤 [X-Ref] Ouverture du formulaire n8n");
      
      // URL du formulaire n8n
      const formUrl = 'https://hkj0631c.rpcl.app/form/20bcf9fd-b7bb-49de-9707-590a794c4763';
      
      // Dimensions de la fenêtre popup
      const width = 800;
      const height = 700;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      // Ouvrir le formulaire dans une nouvelle fenêtre
      const formWindow = window.open(
        formUrl,
        'XRefDocumentaire',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
      );
      
      if (formWindow) {
        this.showQuickNotification("📤 Formulaire X-Ref ouvert");
        console.log("✅ [X-Ref] Formulaire ouvert avec succès");
      } else {
        this.showAlert("❌ Impossible d'ouvrir le formulaire. Vérifiez que les popups ne sont pas bloquées.");
        console.error("❌ [X-Ref] Échec ouverture formulaire - popups bloquées?");
      }
    }

    /**
     * Afficher X-Ref documentaire
     * Détecte et affiche la table des cross-références dans une barre latérale
     */
    afficherXRefDocumentaire() {
      console.log("📋 [X-Ref] Recherche de la table X-Ref");
      
      // Rechercher la table X-Ref dans le chat
      const chatContainer = document.querySelector('div[class*="prose"]') || document.body;
      const tables = Array.from(chatContainer.querySelectorAll('table'));
      
      let xrefTable = null;
      
      // Parcourir les tables pour trouver celle avec les colonnes Cross references et Document
      for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('th, thead td'))
          .map(th => th.textContent.trim().toLowerCase());
        
        // Vérifier la présence des colonnes clés
        const hasCrossRef = headers.some(h => 
          (h.includes('cross') && h.includes('ref')) || 
          h.includes('cross-ref') ||
          h.includes('crossref') ||
          h.includes('x-ref') ||
          h.includes('xref')
        );
        
        const hasDocument = headers.some(h => 
          h.includes('document') || 
          h.includes('doc')
        );
        
        if (hasCrossRef && hasDocument) {
          xrefTable = table;
          console.log("✅ [X-Ref] Table trouvée:", table);
          break;
        }
      }
      
      if (!xrefTable) {
        this.showAlert("⚠️ Aucune table X-Ref documentaire trouvée.\n\nLa table doit contenir les colonnes:\n- Cross references (ou X-Ref)\n- Document");
        console.warn("⚠️ [X-Ref] Aucune table trouvée");
        return;
      }
      
      // Extraire les données de la table
      const data = this.extractTableDataOptimized(xrefTable);
      console.log("📊 [X-Ref] Données extraites:", data);
      
      // Afficher dans la barre latérale
      this.displayXRefSidebar(data);
    }

    /**
     * Rechercher document
     * Permet de rechercher un document par son index ou nom
     */
    rechercherDocument() {
      console.log("🔍 [X-Ref] Recherche de document");
      
      // Demander le terme de recherche
      const searchTerm = prompt("🔍 Rechercher un document (index ou nom):\n\nExemples:\n- I20\n- inventaire\n- Lead sheet");
      
      if (!searchTerm || searchTerm.trim() === '') {
        console.log("⚠️ [X-Ref] Recherche annulée");
        return;
      }
      
      console.log(`🔍 [X-Ref] Recherche: "${searchTerm}"`);
      
      // Rechercher la table X-Ref
      const chatContainer = document.querySelector('div[class*="prose"]') || document.body;
      const tables = Array.from(chatContainer.querySelectorAll('table'));
      
      let xrefTable = null;
      
      for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('th, thead td'))
          .map(th => th.textContent.trim().toLowerCase());
        
        const hasCrossRef = headers.some(h => 
          (h.includes('cross') && h.includes('ref')) || 
          h.includes('cross-ref') ||
          h.includes('crossref') ||
          h.includes('x-ref') ||
          h.includes('xref')
        );
        
        const hasDocument = headers.some(h => 
          h.includes('document') || 
          h.includes('doc')
        );
        
        if (hasCrossRef && hasDocument) {
          xrefTable = table;
          break;
        }
      }
      
      if (!xrefTable) {
        this.showAlert("⚠️ Aucune table X-Ref documentaire trouvée.\n\nLa table doit contenir les colonnes:\n- Cross references (ou X-Ref)\n- Document");
        console.warn("⚠️ [X-Ref] Aucune table trouvée pour la recherche");
        return;
      }
      
      // Extraire et rechercher dans les données
      const data = this.extractTableDataOptimized(xrefTable);
      const results = this.searchInXRefData(data, searchTerm);
      
      console.log(`📊 [X-Ref] ${results.length - 1} résultat(s) trouvé(s)`);
      
      if (results.length <= 1) {
        this.showAlert(`⚠️ Aucun document trouvé pour "${searchTerm}"`);
        return;
      }
      
      // Afficher les résultats dans la barre latérale
      this.displayXRefSidebar(results, `Résultats pour "${searchTerm}"`);
    }

    /**
     * Ouvrir X-Ref documentaire
     * Ouvre le document référencé dans la ligne active depuis Google Drive
     */
    async ouvrirXRefDocumentaire() {
      console.log("📂 [X-Ref] Ouverture du document");
      
      // 1. Vérifier qu'une cellule est active
      if (!this.validateActiveCell()) {
        this.showAlert("⚠️ Veuillez sélectionner une ligne dans la table X-Ref");
        return;
      }
      
      // 2. Vérifier que c'est bien une table X-Ref
      const table = this.targetTable;
      const headers = Array.from(table.querySelectorAll('th, thead td'))
        .map(th => th.textContent.trim().toLowerCase());
      
      const hasCrossRef = headers.some(h => 
        (h.includes('cross') && h.includes('ref')) || 
        h.includes('x-ref') || h.includes('xref')
      );
      
      const hasDocument = headers.some(h => 
        h.includes('document') || h.includes('doc')
      );
      
      if (!hasCrossRef || !hasDocument) {
        this.showAlert("⚠️ Cette table n'est pas une table X-Ref documentaire");
        return;
      }
      
      // 3. Extraire les données de la ligne active
      const rowIndex = this.activeCellPosition.row;
      const rows = Array.from(table.querySelectorAll('tr'));
      const activeRow = rows[rowIndex];
      
      if (!activeRow) {
        this.showAlert("⚠️ Impossible de lire la ligne active");
        return;
      }
      
      // 4. Trouver les index des colonnes
      const headerCells = Array.from(rows[0].querySelectorAll('th, td'));
      let crossRefIndex = -1;
      let documentIndex = -1;
      
      headerCells.forEach((cell, index) => {
        const text = cell.textContent.trim().toLowerCase();
        if ((text.includes('cross') && text.includes('ref')) || 
            text.includes('x-ref') || text.includes('xref')) {
          crossRefIndex = index;
        }
        if (text.includes('document') || text === 'doc') {
          documentIndex = index;
        }
      });
      
      if (crossRefIndex === -1 || documentIndex === -1) {
        this.showAlert("⚠️ Colonnes 'Cross references' et 'Document' non trouvées");
        return;
      }
      
      // 5. Extraire les valeurs
      const cells = Array.from(activeRow.querySelectorAll('td, th'));
      const crossRef = cells[crossRefIndex]?.textContent.trim() || '';
      const document = cells[documentIndex]?.textContent.trim() || '';
      
      if (!crossRef || !document) {
        this.showAlert("⚠️ Données manquantes dans la ligne sélectionnée");
        return;
      }
      
      // 6. Construire le nom du fichier selon [Indexation des document dans Google drive]
      const fileName = `${crossRef}-${document}`;
      console.log(`📄 [X-Ref] Recherche du fichier: ${fileName}`);
      
      this.showQuickNotification(`🔍 Recherche de "${fileName}"...`);
      
      // 7. Appeler le workflow n8n
      try {
        const response = await fetch('https://hkj0631c.rpcl.app/webhook/cross_reference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            index: fileName,
            dossier: 'Dossier CAC'
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("📦 [X-Ref] Réponse n8n:", result);
        
        if (result.success && result.file) {
          // 8. Afficher le document dans la barre latérale
          this.displayDocumentSidebar(result.file, fileName);
          this.showQuickNotification(`✅ Document "${fileName}" ouvert`);
        } else {
          this.showAlert(`⚠️ Document "${fileName}" non trouvé dans Google Drive`);
        }
        
      } catch (error) {
        console.error("❌ [X-Ref] Erreur:", error);
        this.showAlert(`❌ Erreur lors de la recherche du document:\n${error.message}`);
      }
    }

    /**
     * Afficher le document dans une barre latérale
     * @param {Object} file - Informations du fichier Google Drive
     * @param {string} fileName - Nom du fichier
     */
    displayDocumentSidebar(file, fileName) {
      console.log("📄 [X-Ref] Affichage du document:", file);
      
      // Supprimer la barre latérale existante
      let sidebar = document.getElementById('xref-document-viewer');
      if (sidebar) {
        sidebar.remove();
      }
      
      // Créer la barre latérale
      sidebar = document.createElement('div');
      sidebar.id = 'xref-document-viewer';
      sidebar.style.cssText = `
        position: fixed;
        right: 0;
        top: 0;
        width: 600px;
        height: 100vh;
        background: white;
        box-shadow: -4px 0 20px rgba(0,0,0,0.15);
        z-index: 20000;
        display: flex;
        flex-direction: column;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        animation: slideInRight 0.3s ease-out;
      `;
      
      // En-tête
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: #380101;
        color: white;
        border-bottom: 2px solid #2A0101;
      `;
      
      const titleEl = document.createElement('h3');
      titleEl.textContent = fileName;
      titleEl.style.cssText = `
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      `;
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 32px;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: 15px;
        line-height: 1;
        transition: transform 0.2s;
      `;
      closeBtn.onmouseenter = () => { closeBtn.style.transform = 'rotate(90deg)'; };
      closeBtn.onmouseleave = () => { closeBtn.style.transform = 'rotate(0deg)'; };
      closeBtn.onclick = () => {
        sidebar.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => sidebar.remove(), 300);
      };
      
      header.appendChild(titleEl);
      header.appendChild(closeBtn);
      sidebar.appendChild(header);
      
      // Barre d'actions
      const actions = document.createElement('div');
      actions.style.cssText = `
        display: flex;
        gap: 10px;
        padding: 10px 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      `;
      
      const openInDriveBtn = document.createElement('button');
      openInDriveBtn.textContent = '📂 Ouvrir dans Drive';
      openInDriveBtn.style.cssText = `
        padding: 8px 16px;
        background: #380101;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s;
      `;
      openInDriveBtn.onmouseenter = () => { openInDriveBtn.style.background = '#2A0101'; };
      openInDriveBtn.onmouseleave = () => { openInDriveBtn.style.background = '#380101'; };
      openInDriveBtn.onclick = () => {
        window.open(file.webViewLink, '_blank');
      };
      
      actions.appendChild(openInDriveBtn);
      sidebar.appendChild(actions);
      
      // Contenu - iframe pour afficher le document
      const content = document.createElement('div');
      content.style.cssText = `
        flex: 1;
        overflow: hidden;
        background: #f5f5f5;
      `;
      
      // Déterminer l'URL d'affichage selon le type de fichier
      let embedUrl = '';
      
      if (file.mimeType.includes('pdf')) {
        // PDF - utiliser le viewer Google
        embedUrl = `https://drive.google.com/file/d/${file.id}/preview`;
      } else if (file.mimeType.includes('image')) {
        // Image - afficher directement
        const img = document.createElement('img');
        img.src = file.thumbnailLink || file.webViewLink;
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: contain;
        `;
        content.appendChild(img);
      } else if (file.mimeType.includes('document') || 
                 file.mimeType.includes('spreadsheet') || 
                 file.mimeType.includes('presentation')) {
        // Google Docs, Sheets, Slides
        embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.webViewLink)}&embedded=true`;
      } else {
        // Autres types - lien de téléchargement
        content.innerHTML = `
          <div style="padding: 40px; text-align: center;">
            <p style="color: #666; margin-bottom: 20px;">
              Aperçu non disponible pour ce type de fichier
            </p>
            <p style="color: #333; font-weight: 500; margin-bottom: 20px;">
              ${file.name}
            </p>
            <button onclick="window.open('${file.webViewLink}', '_blank')" style="
              padding: 12px 24px;
              background: #380101;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              font-weight: 500;
            ">
              📥 Télécharger le fichier
            </button>
          </div>
        `;
      }
      
      if (embedUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.style.cssText = `
          width: 100%;
          height: 100%;
          border: none;
        `;
        iframe.setAttribute('allow', 'autoplay');
        content.appendChild(iframe);
      }
      
      sidebar.appendChild(content);
      
      // Ajouter au DOM
      document.body.appendChild(sidebar);
      
      console.log("✅ [X-Ref] Document affiché dans la barre latérale");
    }

    /**
     * Afficher la barre latérale X-Ref
     * @param {Array<Array<string>>} data - Données de la table (headers + rows)
     * @param {string} title - Titre de la barre latérale
     */
    displayXRefSidebar(data, title = "Cross-Références Documentaires") {
      console.log("📋 [X-Ref] Affichage de la barre latérale");
      
      // Supprimer la barre latérale existante si présente
      let sidebar = document.getElementById('xref-sidebar');
      if (sidebar) {
        sidebar.remove();
      }
      
      // Créer la barre latérale
      sidebar = document.createElement('div');
      sidebar.id = 'xref-sidebar';
      sidebar.style.cssText = `
        position: fixed;
        right: 0;
        top: 0;
        width: 400px;
        height: 100vh;
        background: white;
        box-shadow: -4px 0 20px rgba(0,0,0,0.15);
        z-index: 20000;
        overflow-y: auto;
        padding: 20px;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        animation: slideInRight 0.3s ease-out;
      `;
      
      // Ajouter l'animation CSS
      if (!document.getElementById('xref-sidebar-styles')) {
        const style = document.createElement('style');
        style.id = 'xref-sidebar-styles';
        style.textContent = `
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
          
          #xref-sidebar::-webkit-scrollbar {
            width: 8px;
          }
          
          #xref-sidebar::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          #xref-sidebar::-webkit-scrollbar-thumb {
            background: #380101;
            border-radius: 4px;
          }
          
          #xref-sidebar::-webkit-scrollbar-thumb:hover {
            background: #2A0101;
          }
        `;
        document.head.appendChild(style);
      }
      
      // En-tête de la barre latérale
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #380101;
      `;
      
      const titleEl = document.createElement('h3');
      titleEl.textContent = title;
      titleEl.style.cssText = `
        margin: 0;
        color: #380101;
        font-size: 18px;
        font-weight: 600;
      `;
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 32px;
        color: #380101;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: transform 0.2s;
      `;
      closeBtn.onmouseenter = () => { closeBtn.style.transform = 'rotate(90deg)'; };
      closeBtn.onmouseleave = () => { closeBtn.style.transform = 'rotate(0deg)'; };
      closeBtn.onclick = () => {
        sidebar.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => sidebar.remove(), 300);
      };
      
      header.appendChild(titleEl);
      header.appendChild(closeBtn);
      sidebar.appendChild(header);
      
      // Contenu de la barre latérale
      const content = document.createElement('div');
      
      if (data.length <= 1) {
        content.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; margin-top: 40px;">Aucune donnée disponible</p>';
      } else {
        const headers = data[0];
        const rows = data.slice(1);
        
        // Afficher le nombre de documents
        const countEl = document.createElement('div');
        countEl.textContent = `${rows.length} document(s)`;
        countEl.style.cssText = `
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 4px;
          text-align: center;
        `;
        content.appendChild(countEl);
        
        // Afficher chaque document
        rows.forEach((row, index) => {
          const item = document.createElement('div');
          item.style.cssText = `
            padding: 15px;
            margin-bottom: 12px;
            background: #f8f9fa;
            border-left: 4px solid #380101;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
          `;
          
          item.onmouseenter = () => {
            item.style.background = '#e8f5e9';
            item.style.borderLeftColor = '#28a745';
            item.style.transform = 'translateX(-5px)';
          };
          item.onmouseleave = () => {
            item.style.background = '#f8f9fa';
            item.style.borderLeftColor = '#380101';
            item.style.transform = 'translateX(0)';
          };
          
          // Construire le contenu de l'item
          let html = '';
          headers.forEach((header, colIndex) => {
            if (row[colIndex]) {
              html += `
                <div style="margin-bottom: 8px;">
                  <strong style="color: #380101; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${header}:</strong>
                  <div style="color: #333; margin-top: 4px; font-size: 14px;">${row[colIndex]}</div>
                </div>
              `;
            }
          });
          
          item.innerHTML = html;
          
          // Action au clic (optionnel - peut ouvrir le document dans Google Drive)
          item.onclick = () => {
            console.log("📄 [X-Ref] Document cliqué:", row);
            this.showQuickNotification(`📄 Document: ${row[1] || row[0]}`);
            // TODO: Implémenter l'ouverture du document dans Google Drive
          };
          
          content.appendChild(item);
        });
      }
      
      sidebar.appendChild(content);
      
      // Ajouter au DOM
      document.body.appendChild(sidebar);
      
      this.showQuickNotification(`📋 ${data.length - 1} document(s) affiché(s)`);
      console.log("✅ [X-Ref] Barre latérale affichée");
    }

    /**
     * Rechercher dans les données X-Ref
     * @param {Array<Array<string>>} data - Données de la table
     * @param {string} searchTerm - Terme de recherche
     * @returns {Array<Array<string>>} - Résultats (headers + rows filtrées)
     */
    searchInXRefData(data, searchTerm) {
      if (data.length <= 1) return [];
      
      const headers = data[0];
      const rows = data.slice(1);
      const term = searchTerm.toLowerCase().trim();
      
      const results = [headers];
      
      rows.forEach(row => {
        // Rechercher dans toutes les cellules de la ligne
        const match = row.some(cell => 
          cell && cell.toLowerCase().includes(term)
        );
        
        if (match) {
          results.push(row);
        }
      });
      
      console.log(`🔍 [X-Ref] Recherche "${term}": ${results.length - 1} résultat(s)`);
      
      return results;
    }

    cleanup() {
      this.eventListeners.forEach(({ element, event, handler }) => element.removeEventListener(event, handler));
      this.eventListeners = [];
      if (this.menuElement?.parentNode) this.menuElement.parentNode.removeChild(this.menuElement);
    }
  }

  // === INSTANCE GLOBALE ===
  const contextualMenuManager = new ContextualMenuManager();

  window.initContextualMenu = () => contextualMenuManager.init();
  window.forceContextualMenu = () => contextualMenuManager.forceInit();
  window.cleanupContextualMenu = () => contextualMenuManager.cleanup();

  const initializeMenu = () => { try { contextualMenuManager.init(); } catch (e) { console.error("❌ Erreur init menu:", e); } };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(initializeMenu, 2000));
  else setTimeout(initializeMenu, 2000);

  window.addEventListener("beforeunload", () => contextualMenuManager.cleanup());

  console.log("✅ Menu contextuel ClaraVerse v9 - Accordéon chargé");
  console.log("🚀 Sections: Édition | Lignes | Colonnes | Arithmétique | Évaluation des risques | Tables | Excel | Modélisation Pandas | États Financiers SYSCOHADA | Échantillonnage Audit");
})();
