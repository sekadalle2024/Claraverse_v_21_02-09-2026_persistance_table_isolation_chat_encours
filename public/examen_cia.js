/**
 * Claraverse - Script Examen CIA
 * Gestion des questionnaires d'examen CIA avec persistance IndexedDB
 * Version 1.0
 */

(function () {
    "use strict";

    console.log("🎓 Examen CIA - Démarrage du script");

    // Configuration globale
    const CONFIG = {
        storageKey: "claraverse_examen_cia",
        autoSaveDelay: 500,
        debugMode: true,
        // Variations des colonnes
        columnVariations: {
            reponse_user: [
                "reponse_user",
                "reponse user",
                "reponse user",
                "réponse_user",
                "réponse user",
            ],
            reponse_cia: [
                "reponse cia",
                "reponse_cia",
                "réponse cia",
                "réponse_cia",
                "reponse cia",
                "reponse_cia",
            ],
            option: ["option", "options"],
            remarques: ["remarques", "remarque", "commentaire", "commentaires"],
            question: ["question", "questions"],
            ref_question: [
                "ref_question",
                "ref question",
                "réf_question",
                "réf question",
                "ref_question",
            ],
        },
    };

    // Utilitaires de debug
    const debug = {
        log: (...args) =>
            CONFIG.debugMode && console.log("🎓 [Examen CIA]", ...args),
        error: (...args) => console.error("❌ [Examen CIA]", ...args),
        warn: (...args) => console.warn("⚠️ [Examen CIA]", ...args),
    };

    class ExamenCIAManager {
        constructor() {
            this.processedTables = new WeakSet();
            this.isInitialized = false;
            this.saveTimeout = null;
            this.tableObservers = new Map();

            this.init();
        }

        init() {
            if (this.isInitialized) return;

            debug.log("Initialisation du gestionnaire d'examen CIA");

            this.waitForReact(() => {
                this.testLocalStorage();
                this.startTableMonitoring();
                this.restoreAllExamData();
                this.isInitialized = true;
                debug.log("✅ Gestionnaire initialisé avec succès");
            });
        }

        testLocalStorage() {
            try {
                const testKey = "examen_cia_test";
                localStorage.setItem(testKey, "test");
                const testValue = localStorage.getItem(testKey);
                localStorage.removeItem(testKey);

                if (testValue === "test") {
                    debug.log("✅ localStorage fonctionne correctement");

                    const existingData = this.loadAllData();
                    const examCount = Object.keys(existingData).length;
                    debug.log(`📦 ${examCount} examen(s) trouvé(s) dans le stockage`);
                }
            } catch (error) {
                debug.error("❌ Erreur de test localStorage:", error);
            }
        }

        waitForReact(callback) {
            const checkReactReady = () => {
                const hasReact =
                    window.React ||
                    document.querySelector("[data-reactroot]") ||
                    document.querySelector("#root");
                const hasTables = this.findAllTables().length > 0;

                if (hasReact || hasTables) {
                    debug.log("React détecté, démarrage du traitement");
                    setTimeout(callback, 500);
                } else {
                    setTimeout(checkReactReady, 1000);
                }
            };

            checkReactReady();
        }

        findAllTables() {
            const selectors = [
                "table",
                ".prose table",
                "div table",
                "table.min-w-full",
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

            const uniqueTables = [...new Set(allTables)];
            return uniqueTables;
        }

        startTableMonitoring() {
            this.processAllTables();

            this.setupMutationObserver();

            this.intervalId = setInterval(() => {
                this.processAllTables();
            }, 2000);

            this.autoSaveIntervalId = setInterval(() => {
                this.autoSaveAllExams();
            }, 30000);

            debug.log("Surveillance des tables d'examen démarrée");
        }

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

        processAllTables() {
            const tables = this.findAllTables();

            tables.forEach((table, index) => {
                if (!this.processedTables.has(table)) {
                    this.processTable(table);
                }
            });
        }

        processTable(table) {
            try {
                const headers = this.getTableHeaders(table);
                if (headers.length === 0) return;

                // Générer et assigner un ID unique
                if (!table.dataset.examTableId) {
                    this.generateUniqueTableId(table);
                }

                // Vérifier si c'est une table d'examen CIA
                if (this.isExamCIATable(headers)) {
                    debug.log(
                        "Table d'examen CIA détectée:",
                        table.dataset.examTableId
                    );
                    this.setupExamTable(table, headers);
                    this.processedTables.add(table);
                }

                // Installer un observer pour détecter les changements
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
                    return Array.from(headers).map((cell, index) => ({
                        element: cell,
                        text: cell.textContent.trim().toLowerCase(),
                        index: index,
                    }));
                }
            }

            return [];
        }

        generateUniqueTableId(table) {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            const tableId = `exam-cia-${timestamp}-${random}`;
            table.dataset.examTableId = tableId;
            return tableId;
        }

        isExamCIATable(headers) {
            // Vérifier si la table contient les colonnes caractéristiques d'un examen CIA
            const hasReponseUser = headers.some((h) =>
                this.matchesColumnType(h.text, "reponse_user")
            );
            const hasOption = headers.some((h) =>
                this.matchesColumnType(h.text, "option")
            );

            return hasReponseUser || hasOption;
        }

        matchesColumnType(headerText, columnType) {
            const variations = CONFIG.columnVariations[columnType] || [];
            return variations.some((variation) =>
                headerText.includes(variation.toLowerCase())
            );
        }

        setupExamTable(table, headers) {
            debug.log("Configuration de la table d'examen");

            // Identifier les colonnes
            const columnIndexes = this.identifyColumns(headers);

            // Masquer les colonnes qui ne doivent pas être visibles
            this.hideColumns(table, columnIndexes);

            // Fusionner les cellules pour Question et Ref_question
            this.mergeCells(table, columnIndexes);

            // Configurer les checkboxes pour Reponse_user
            this.setupCheckboxes(table, columnIndexes);

            // Appliquer les styles
            this.applyTableStyles(table);

            debug.log("✅ Table d'examen configurée");
        }

        identifyColumns(headers) {
            const indexes = {};

            headers.forEach((header, index) => {
                if (this.matchesColumnType(header.text, "reponse_user")) {
                    indexes.reponse_user = index;
                } else if (this.matchesColumnType(header.text, "reponse_cia")) {
                    indexes.reponse_cia = index;
                } else if (this.matchesColumnType(header.text, "option")) {
                    indexes.option = index;
                } else if (this.matchesColumnType(header.text, "remarques")) {
                    indexes.remarques = index;
                } else if (this.matchesColumnType(header.text, "question")) {
                    indexes.question = index;
                } else if (this.matchesColumnType(header.text, "ref_question")) {
                    indexes.ref_question = index;
                }
            });

            debug.log("Colonnes identifiées:", indexes);
            return indexes;
        }

        hideColumns(table, columnIndexes) {
            // Masquer les colonnes Reponse_cia et Remarques
            const columnsToHide = ["reponse_cia", "remarques"];

            columnsToHide.forEach((colType) => {
                const colIndex = columnIndexes[colType];
                if (colIndex !== undefined) {
                    // Masquer l'en-tête
                    const headerRow = table.querySelector("tr");
                    if (headerRow) {
                        const headerCell = headerRow.children[colIndex];
                        if (headerCell) {
                            headerCell.style.display = "none";
                        }
                    }

                    // Masquer toutes les cellules de cette colonne
                    const rows = table.querySelectorAll("tr");
                    rows.forEach((row) => {
                        const cell = row.children[colIndex];
                        if (cell) {
                            cell.style.display = "none";
                        }
                    });

                    debug.log(`Colonne ${colType} masquée`);
                }
            });
        }

        mergeCells(table, columnIndexes) {
            // Fusionner les cellules pour Question et Ref_question
            const columnsToMerge = ["question", "ref_question"];

            columnsToMerge.forEach((colType) => {
                const colIndex = columnIndexes[colType];
                if (colIndex !== undefined) {
                    this.mergeColumnCells(table, colIndex);
                }
            });
        }

        mergeColumnCells(table, colIndex) {
            const tbody = table.querySelector("tbody") || table;
            const rows = Array.from(tbody.querySelectorAll("tr")).filter(
                (row) => !row.querySelector("th")
            );

            if (rows.length === 0) return;

            // Récupérer la première cellule
            const firstCell = rows[0].children[colIndex];
            if (!firstCell) return;

            const cellValue = firstCell.textContent.trim();

            // Vérifier si toutes les cellules ont la même valeur
            const allSame = rows.every((row) => {
                const cell = row.children[colIndex];
                return cell && cell.textContent.trim() === cellValue;
            });

            if (allSame && rows.length > 1 && cellValue !== "") {
                // Fusionner les cellules
                firstCell.rowSpan = rows.length;
                firstCell.style.verticalAlign = "middle";
                firstCell.style.textAlign = "center";
                firstCell.style.fontWeight = "bold";
                firstCell.style.padding = "12px";

                // Masquer les autres cellules
                for (let i = 1; i < rows.length; i++) {
                    const cell = rows[i].children[colIndex];
                    if (cell) {
                        cell.style.display = "none";
                        cell.setAttribute("data-merged", "true");
                    }
                }

                debug.log(`✅ Cellules fusionnées pour colonne ${colIndex} (${cellValue.substring(0, 30)}...)`);
            }
        }

        setupCheckboxes(table, columnIndexes) {
            const colIndex = columnIndexes.reponse_user;
            if (colIndex === undefined) return;

            const tbody = table.querySelector("tbody") || table;
            const rows = Array.from(tbody.querySelectorAll("tr")).filter(
                (row) => !row.querySelector("th")
            );

            // Charger les données sauvegardées pour cette table
            const tableId = table.dataset.examTableId;
            const allData = this.loadAllData();
            const savedData = allData[tableId];

            rows.forEach((row, rowIndex) => {
                const cell = row.children[colIndex];
                if (!cell) return;

                // Créer une checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "exam-cia-checkbox";
                checkbox.style.cssText = `
          width: 20px;
          height: 20px;
          cursor: pointer;
          margin: 0 auto;
          display: block;
        `;

                // Restaurer l'état depuis les données sauvegardées
                let isChecked = false;
                if (savedData && savedData.rows && savedData.rows[rowIndex]) {
                    const cellData = savedData.rows[rowIndex][colIndex];
                    if (cellData && cellData.type === "checkbox") {
                        isChecked = cellData.checked;
                        if (isChecked) {
                            debug.log(`✓ Restauration checkbox: ligne ${rowIndex + 1}`);
                        }
                    }
                }

                checkbox.checked = isChecked;

                // Vider la cellule et ajouter la checkbox
                cell.innerHTML = "";
                cell.appendChild(checkbox);
                cell.style.textAlign = "center";

                // Gérer le clic sur la checkbox
                checkbox.addEventListener("change", (e) => {
                    this.handleCheckboxChange(table, row, checkbox, colIndex);
                });
            });

            debug.log("✅ Checkboxes configurées et restaurées");
        }

        handleCheckboxChange(table, row, checkbox, colIndex) {
            if (checkbox.checked) {
                // Décocher toutes les autres checkboxes de la table
                const tbody = table.querySelector("tbody") || table;
                const allRows = Array.from(tbody.querySelectorAll("tr")).filter(
                    (r) => !r.querySelector("th")
                );

                allRows.forEach((r) => {
                    if (r !== row) {
                        const cell = r.children[colIndex];
                        if (cell) {
                            const cb = cell.querySelector(".exam-cia-checkbox");
                            if (cb) {
                                cb.checked = false;
                            }
                        }
                    }
                });

                debug.log("Réponse sélectionnée");
            }

            // Sauvegarder l'état
            this.saveExamData(table);
        }

        applyTableStyles(table) {
            // Appliquer un style général à la table
            table.style.cssText = `
        ${table.style.cssText}
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
      `;

            // Améliorer la lisibilité avec des retours à la ligne
            const cells = table.querySelectorAll("td, th");
            cells.forEach((cell) => {
                cell.style.whiteSpace = "normal";
                cell.style.wordWrap = "break-word";
                cell.style.padding = "12px";
            });

            debug.log("Styles appliqués à la table");
        }

        setupTableChangeDetection(table) {
            if (table.dataset.examObserverInstalled === "true") {
                return;
            }

            const tableId = table.dataset.examTableId;
            if (!tableId) return;

            const tableObserver = new MutationObserver((mutations) => {
                let hasChanges = false;

                mutations.forEach((mutation) => {
                    if (
                        mutation.type === "characterData" ||
                        mutation.type === "childList" ||
                        mutation.type === "attributes"
                    ) {
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    debug.log(`📝 Changement détecté dans examen ${tableId}`);
                    this.saveExamData(table);
                }
            });

            tableObserver.observe(table, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: ["checked"],
            });

            table.dataset.examObserverInstalled = "true";
            this.tableObservers.set(table, tableObserver);

            debug.log(`✅ Détecteur installé sur ${tableId}`);
        }

        // ==================
        // PERSISTANCE DES DONNÉES
        // ==================

        loadAllData() {
            try {
                const data = localStorage.getItem(CONFIG.storageKey);
                return data ? JSON.parse(data) : {};
            } catch (error) {
                debug.error("Erreur chargement données:", error);
                return {};
            }
        }

        saveAllData(data) {
            try {
                localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
                debug.log("💾 Données sauvegardées dans localStorage");
            } catch (error) {
                debug.error("Erreur sauvegarde données:", error);
            }
        }

        saveExamData(table) {
            if (!table) {
                debug.warn("⚠️ saveExamData: table est null");
                return;
            }

            // Debounce
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }

            this.saveTimeout = setTimeout(() => {
                this.saveExamDataNow(table);
            }, CONFIG.autoSaveDelay);
        }

        saveExamDataNow(table) {
            if (!table) {
                debug.warn("⚠️ saveExamDataNow: table est null");
                return;
            }

            const tableId = table.dataset.examTableId;
            if (!tableId) {
                debug.warn("⚠️ Table sans ID, impossible de sauvegarder");
                return;
            }

            debug.log("💾 Sauvegarde de l'examen:", tableId);

            const allData = this.loadAllData();

            // Extraire les données de la table
            const examData = this.extractExamData(table);

            allData[tableId] = {
                ...examData,
                lastSaved: new Date().toISOString(),
            };

            this.saveAllData(allData);
            debug.log("✅ Examen sauvegardé:", tableId);
        }

        extractExamData(table) {
            const data = {
                headers: [],
                rows: [],
                checkboxStates: [],
            };

            // Extraire les en-têtes
            const headerRow = table.querySelector("tr");
            if (headerRow) {
                const headers = headerRow.querySelectorAll("th, td");
                data.headers = Array.from(headers).map((h) => ({
                    text: h.textContent.trim(),
                    visible: h.style.display !== "none",
                }));
            }

            // Extraire les lignes
            const tbody = table.querySelector("tbody") || table;
            const rows = Array.from(tbody.querySelectorAll("tr")).filter(
                (row) => !row.querySelector("th")
            );

            rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll("td");
                const rowData = Array.from(cells).map((cell, cellIndex) => {
                    const checkbox = cell.querySelector(".exam-cia-checkbox");
                    if (checkbox) {
                        return {
                            type: "checkbox",
                            checked: checkbox.checked,
                        };
                    }
                    return {
                        type: "text",
                        content: cell.textContent.trim(),
                        visible: cell.style.display !== "none",
                    };
                });

                data.rows.push(rowData);
            });

            return data;
        }

        restoreAllExamData() {
            debug.log("📂 Restauration de tous les examens...");

            const allData = this.loadAllData();
            const examIds = Object.keys(allData);

            if (examIds.length === 0) {
                debug.log("Aucun examen à restaurer");
                return;
            }

            debug.log(`Tentative de restauration de ${examIds.length} examen(s)`);

            // Attendre que les tables soient complètement traitées
            setTimeout(() => {
                examIds.forEach((examId) => {
                    this.restoreExamData(examId);
                });
            }, 2000);

            // Réessayer après un délai supplémentaire pour les tables chargées tardivement
            setTimeout(() => {
                examIds.forEach((examId) => {
                    this.restoreExamData(examId);
                });
            }, 5000);
        }

        restoreExamData(examId) {
            debug.log(`🔍 Tentative de restauration pour ID: ${examId}`);

            const allData = this.loadAllData();
            const examData = allData[examId];

            if (!examData) {
                debug.warn(`Aucune donnée trouvée pour ${examId}`);
                return;
            }

            // Trouver la table correspondante
            const table = document.querySelector(`[data-exam-table-id="${examId}"]`);

            if (!table) {
                debug.warn(`Table ${examId} non trouvée dans le DOM`);
                return;
            }

            debug.log(`📥 Restauration de l'examen ${examId}`);

            // Restaurer les états des checkboxes
            const tbody = table.querySelector("tbody") || table;
            const rows = Array.from(tbody.querySelectorAll("tr")).filter(
                (row) => !row.querySelector("th")
            );

            let restoredCount = 0;

            rows.forEach((row, rowIndex) => {
                if (examData.rows[rowIndex]) {
                    const cells = row.querySelectorAll("td");
                    cells.forEach((cell, cellIndex) => {
                        const cellData = examData.rows[rowIndex][cellIndex];
                        if (cellData && cellData.type === "checkbox") {
                            const checkbox = cell.querySelector(".exam-cia-checkbox");
                            if (checkbox) {
                                checkbox.checked = cellData.checked;
                                if (cellData.checked) {
                                    restoredCount++;
                                    debug.log(`✓ Checkbox restaurée: ligne ${rowIndex + 1}, colonne ${cellIndex + 1}`);
                                }
                            } else {
                                debug.warn(`⚠️ Checkbox non trouvée: ligne ${rowIndex + 1}, colonne ${cellIndex + 1}`);
                            }
                        }
                    });
                }
            });

            if (restoredCount > 0) {
                debug.log(`✅ Examen ${examId} restauré (${restoredCount} réponse(s))`);
            } else {
                debug.log(`ℹ️ Examen ${examId} restauré (aucune réponse cochée)`);
            }
        }

        autoSaveAllExams() {
            debug.log("🔄 Sauvegarde automatique de tous les examens");

            const tables = this.findAllTables();
            let savedCount = 0;

            tables.forEach((table) => {
                if (table.dataset.examTableId) {
                    this.saveExamDataNow(table);
                    savedCount++;
                }
            });

            if (savedCount > 0) {
                debug.log(`✅ ${savedCount} examen(s) sauvegardé(s) automatiquement`);
            }
        }

        // ==================
        // UTILITAIRES
        // ==================

        exportData() {
            const allData = this.loadAllData();
            const jsonString = JSON.stringify(allData, null, 2);

            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `examen_cia_export_${Date.now()}.json`;
            a.click();

            URL.revokeObjectURL(url);
            debug.log("✅ Données exportées");
        }

        clearAllData() {
            if (
                confirm(
                    "⚠️ Êtes-vous sûr de vouloir effacer toutes les données d'examen ?"
                )
            ) {
                localStorage.removeItem(CONFIG.storageKey);
                debug.log("🗑️ Toutes les données effacées");
                location.reload();
            }
        }

        getStorageInfo() {
            const allData = this.loadAllData();
            const dataSize = new Blob([JSON.stringify(allData)]).size;
            const examCount = Object.keys(allData).length;

            return {
                examCount,
                dataSize,
                dataSizeKB: (dataSize / 1024).toFixed(2),
            };
        }
    }

    // Initialisation automatique
    let examManager;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            examManager = new ExamenCIAManager();
        });
    } else {
        examManager = new ExamenCIAManager();
    }

    // Exposer l'API globale
    window.examenCIA = {
        manager: examManager,
        exportData: () => examManager?.exportData(),
        clearData: () => examManager?.clearAllData(),
        getInfo: () => examManager?.getStorageInfo(),
        debug: () => {
            const info = examManager?.getStorageInfo();
            console.log("📊 Informations Examen CIA:");
            console.log(`  - Nombre d'examens: ${info.examCount}`);
            console.log(`  - Taille des données: ${info.dataSizeKB} KB`);
            console.log("  - Données:", examManager?.loadAllData());
        },
    };

    debug.log("✅ Script Examen CIA chargé");
})();
