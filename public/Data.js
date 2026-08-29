/**
 * Script dynamique pour les tables Data dans Claraverse - V6.0
 * @version 6.0.0
 * @description
 * - Détecte les tables avec entête de colonne "Data"
 * - Extrait le mot-clé de la table Data (critère table cible)
 * - Collecte les GROUPES de tables dont la table [Rubrique, Description] 
 *   contient le mot-clé dans la cellule "Etape de mission" / "Description"
 * - Envoie ces tables vers pandas_agent (modifie la dernière = modelized table)
 * - REMPLACE le contenu de la div de la table déclencheuse avec les résultats
 */
(function () {
    "use strict";

    console.group("🚀 DATA.JS V6.0 - INITIALISATION");
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log("📋 Comportement: Collecte groupes de tables par critère, envoie à pandas");
    console.groupEnd();

    const CONFIG = {
        PANDAS_ENDPOINT_URL: "http://127.0.0.1:5000/pandas-agent/process-all-tables",
        SELECTORS: {
            CHAT_TABLES: "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
            PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none",
            OVERFLOW_CONTAINER: "div.overflow-x-auto.my-4",
        },
        PROCESSED_CLASS: "data-processed",
        TRIGGER_HEADERS: ["data", "DATA", "Data"],
        // Headers de la table de métadonnées
        METADATA_HEADERS: ["rubrique", "description"],
    };

    /**
     * Vérifie si une table a une colonne avec entête "Data"
     */
    function hasDataHeader(table) {
        const headers = Array.from(table.querySelectorAll("th")).map((th) =>
            th.textContent.trim().toLowerCase()
        );
        return headers.some((h) => h === "data");
    }

    /**
     * Vérifie si une table est une table de métadonnées [Rubrique, Description]
     */
    function isMetadataTable(table) {
        const headers = Array.from(table.querySelectorAll("th")).map((th) =>
            th.textContent.trim().toLowerCase()
        );
        // Doit avoir exactement ou contenir "rubrique" et "description"
        return headers.includes("rubrique") && headers.includes("description");
    }

    /**
     * Extrait le mot-clé de la table Data (première cellule de données)
     */
    function extractKeywordFromDataTable(table) {
        console.group("🔑 EXTRACTION MOT-CLÉ");

        const tbody = table.querySelector("tbody");
        const firstDataRow = tbody ? tbody.querySelector("tr") : table.querySelector("tr:not(:first-child)");

        if (!firstDataRow) {
            console.warn("⚠️ Aucune ligne de données trouvée");
            console.groupEnd();
            return null;
        }

        const firstCell = firstDataRow.querySelector("td");
        const keyword = firstCell ? firstCell.textContent.trim() : null;

        console.log("📝 Mot-clé extrait (critère table cible):", keyword);
        console.groupEnd();

        return keyword;
    }

    /**
     * Vérifie si une table de métadonnées contient le mot-clé dans "Etape de mission"
     */
    function metadataTableMatchesKeyword(table, keyword) {
        if (!keyword || !isMetadataTable(table)) return false;

        const keywordLower = keyword.toLowerCase();
        const rows = table.querySelectorAll("tbody tr, tr");

        for (const row of rows) {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const rubrique = cells[0].textContent.trim().toLowerCase();
                const description = cells[1].textContent.trim().toLowerCase();

                // Chercher "etape de mission" dans la colonne Rubrique
                if (rubrique.includes("etape") && rubrique.includes("mission")) {
                    if (description.includes(keywordLower)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Collecte les groupes de tables correspondant au mot-clé
     * Un groupe = table métadonnées + tables suivantes jusqu'à la prochaine table métadonnées
     */
    function collectTableGroups(keyword, triggerTable) {
        console.group("🔍 RECHERCHE GROUPES DE TABLES");
        console.log("🔑 Mot-clé recherché:", keyword);

        const allTables = Array.from(document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES));
        const groups = [];
        let currentGroup = null;

        allTables.forEach((table, index) => {
            // Ignorer la table Data déclencheuse
            if (table === triggerTable) {
                console.log(`Table ${index}: [TABLE DATA DÉCLENCHEUSE] - IGNORÉE`);
                return;
            }

            // Ignorer les autres tables Data
            if (hasDataHeader(table)) {
                console.log(`Table ${index}: [TABLE DATA] - IGNORÉE`);
                return;
            }

            const headers = Array.from(table.querySelectorAll("th")).map(th => th.textContent.trim());
            const isMeta = isMetadataTable(table);

            if (isMeta) {
                // C'est une table de métadonnées
                const matches = metadataTableMatchesKeyword(table, keyword);
                console.log(`Table ${index}: [${headers.join(", ")}] MÉTADONNÉES - match: ${matches}`);

                if (matches) {
                    // Commencer un nouveau groupe
                    if (currentGroup && currentGroup.tables.length > 0) {
                        groups.push(currentGroup);
                    }
                    currentGroup = {
                        metadataTable: table,
                        tables: [table]
                    };
                } else {
                    // Table métadonnées qui ne correspond pas - fermer le groupe actuel
                    if (currentGroup && currentGroup.tables.length > 0) {
                        groups.push(currentGroup);
                        currentGroup = null;
                    }
                }
            } else if (currentGroup) {
                // Table normale - l'ajouter au groupe actuel
                console.log(`Table ${index}: [${headers.join(", ")}] ajoutée au groupe`);
                currentGroup.tables.push(table);
            } else {
                console.log(`Table ${index}: [${headers.join(", ")}] - pas dans un groupe`);
            }
        });

        // Ajouter le dernier groupe
        if (currentGroup && currentGroup.tables.length > 0) {
            groups.push(currentGroup);
        }

        console.log(`✅ ${groups.length} groupe(s) trouvé(s)`);
        groups.forEach((g, i) => {
            console.log(`   Groupe ${i}: ${g.tables.length} tables`);
        });
        console.groupEnd();

        return groups;
    }

    /**
     * Affiche une notification
     */
    function showNotification(message, type = "success") {
        const colors = {
            success: "linear-gradient(135deg, #4caf50, #45a049)",
            error: "linear-gradient(135deg, #f44336, #d32f2f)",
            info: "linear-gradient(135deg, #2196f3, #1976d2)",
        };

        const notification = document.createElement("div");
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${colors[type] || colors.info};
            color: white; padding: 12px 20px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 20000;
            font-size: 14px; opacity: 0; transform: translateY(-20px);
            transition: all 0.3s; max-width: 400px;
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
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Collecte les données d'une table pour envoi
     */
    function collectTableData(table, tableId) {
        const headers = [];
        const rows = [];

        const headerRow = table.querySelector("thead tr") || table.querySelector("tr");
        if (headerRow) {
            headerRow.querySelectorAll("th, td").forEach((cell) => {
                headers.push(cell.textContent.trim());
            });
        }

        const tbody = table.querySelector("tbody");
        const dataRows = tbody ? tbody.querySelectorAll("tr") : table.querySelectorAll("tr:not(:first-child)");

        dataRows.forEach((row) => {
            const rowData = [];
            row.querySelectorAll("td, th").forEach((cell) => {
                rowData.push(cell.textContent.trim());
            });
            if (rowData.length > 0) {
                rows.push(rowData);
            }
        });

        return { tableId, headers, rows };
    }

    /**
     * Envoie les données vers l'endpoint Pandas
     */
    async function sendToPandasAgent(tables) {
        console.group("🐼 PANDAS AGENT - ENVOI");

        const payload = {
            tables: tables,
            targetTableId: tables.length > 0 ? tables[tables.length - 1].tableId : "last_table",
            action: "calculate_ecart",
            targetColumn: null
        };

        console.log("📤 Endpoint:", CONFIG.PANDAS_ENDPOINT_URL);
        console.log("📤 Nombre de tables:", tables.length);
        console.log("📤 Table cible (dernière = modelized):", payload.targetTableId);
        console.log("📤 Payload:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(CONFIG.PANDAS_ENDPOINT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(payload)
            });

            console.log(`📥 Statut: ${response.status}`);

            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("📊 Résultat:", result);
            console.groupEnd();

            return result;

        } catch (error) {
            console.error("❌ ERREUR:", error.message);
            console.groupEnd();
            throw error;
        }
    }

    /**
     * Crée une table HTML à partir des données JSON
     */
    function createTableHTML(headers, rows) {
        let html = '<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" style="margin-bottom: 1rem;">';

        html += '<thead><tr>';
        headers.forEach((h) => {
            html += `<th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold">${h}</th>`;
        });
        html += '</tr></thead>';

        html += '<tbody>';
        rows.forEach((row, rowIndex) => {
            const bgClass = rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800";
            html += `<tr class="${bgClass}">`;

            row.forEach((cell, cellIndex) => {
                const headerName = headers[cellIndex]?.toLowerCase() || "";
                let style = "";

                if (headerName === "ecart" || headerName === "écart") {
                    const numValue = parseFloat(String(cell).replace(/,/g, "").replace(/\s/g, ""));
                    if (!isNaN(numValue)) {
                        style = numValue >= 0 ? "color: #22c55e; font-weight: bold;" : "color: #ef4444; font-weight: bold;";
                    }
                }

                html += `<td class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm" style="${style}">${cell}</td>`;
            });

            html += '</tr>';
        });
        html += '</tbody></table>';

        return html;
    }

    /**
     * REMPLACE le contenu de la div avec TOUTES les tables résultat
     */
    function replaceWithResults(triggerTable, result) {
        console.group("🔄 REMPLACEMENT CONTENU DIV");

        const parentDiv = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);

        if (!parentDiv) {
            console.error("❌ Div parent non trouvée!");
            console.groupEnd();
            return false;
        }

        console.log("📍 Div parent trouvée:", parentDiv.className);

        let resultHTML = '';

        if (result.tables && Array.isArray(result.tables)) {
            console.log(`📊 ${result.tables.length} tables à afficher`);
            result.tables.forEach((t, i) => {
                if (t.headers && t.rows) {
                    resultHTML += createTableHTML(t.headers, t.rows);
                    console.log(`✅ Table ${i + 1}/${result.tables.length} créée (${t.tableId})`);
                }
            });
        } else if (result.headers && result.rows) {
            resultHTML = createTableHTML(result.headers, result.rows);
            console.log("✅ 1 table créée");
        }

        if (!resultHTML) {
            console.warn("⚠️ Aucune table à afficher");
            console.groupEnd();
            return false;
        }

        parentDiv.innerHTML = resultHTML;

        console.log("✅ Contenu de la div REMPLACÉ avec TOUTES les tables");
        console.groupEnd();

        return true;
    }

    /**
     * Traite une table Data
     */
    async function processDataTable(table) {
        console.group("🎯 DATA.JS V6.0 - TRAITEMENT TABLE DATA");

        if (table.classList.contains(CONFIG.PROCESSED_CLASS)) {
            console.log("⏭️ Table déjà traitée");
            console.groupEnd();
            return;
        }

        try {
            table.classList.add(CONFIG.PROCESSED_CLASS);

            // 1. Extraire le mot-clé de la table Data
            const keyword = extractKeywordFromDataTable(table);

            if (!keyword) {
                console.warn("⚠️ Aucun mot-clé trouvé dans la table Data");
                showNotification("⚠️ Aucun mot-clé dans la table Data", "error");
                table.classList.remove(CONFIG.PROCESSED_CLASS);
                console.groupEnd();
                return;
            }

            showNotification(`🔍 Recherche: "${keyword}"`, "info");

            // 2. Collecter les groupes de tables correspondant au mot-clé
            const groups = collectTableGroups(keyword, table);

            if (groups.length === 0) {
                console.warn("⚠️ Aucun groupe de tables trouvé");
                showNotification(`⚠️ Aucune table trouvée pour "${keyword}"`, "error");
                table.classList.remove(CONFIG.PROCESSED_CLASS);
                console.groupEnd();
                return;
            }

            // 3. Collecter les données de toutes les tables du premier groupe
            const firstGroup = groups[0];
            console.group("📦 COLLECTE DONNÉES DU GROUPE");

            const tablesData = firstGroup.tables.map((t, i) => {
                const tableId = `table_${Date.now()}_${i}`;
                const data = collectTableData(t, tableId);
                const isMeta = isMetadataTable(t);
                const isLast = i === firstGroup.tables.length - 1;
                console.log(`Table ${i}: [${data.headers.slice(0, 3).join(", ")}...] ${data.rows.length} lignes ${isMeta ? '(métadonnées)' : ''} ${isLast ? '(MODELIZED - cible)' : ''}`);
                return data;
            });
            console.groupEnd();

            showNotification(`🐼 Envoi de ${tablesData.length} table(s) vers Pandas...`, "info");

            // 4. Envoyer vers Pandas
            const result = await sendToPandasAgent(tablesData);

            // 5. REMPLACER le contenu de la div avec TOUTES les tables
            if (result.success) {
                const replaced = replaceWithResults(table, result);

                if (replaced) {
                    showNotification(`✅ ${result.message || "Traitement effectué"}`, "success");

                    document.dispatchEvent(new CustomEvent("claraverse:table:updated", {
                        detail: { keyword, source: "data_agent", timestamp: Date.now() }
                    }));
                } else {
                    showNotification("⚠️ Impossible de remplacer le contenu", "error");
                }
            } else {
                throw new Error(result.message || "Erreur");
            }

        } catch (error) {
            console.error("❌ Erreur:", error);
            showNotification(`❌ Erreur: ${error.message}`, "error");
            table.classList.remove(CONFIG.PROCESSED_CLASS);
        }

        console.groupEnd();
    }

    /**
     * Scan les tables
     */
    function scanAllTables() {
        console.group("🔍 SCAN TABLES");

        const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
        console.log(`Tables trouvées: ${allTables.length}`);

        const dataTables = [];

        allTables.forEach((table, index) => {
            const headers = Array.from(table.querySelectorAll("th")).map((th) => th.textContent.trim());
            const hasData = hasDataHeader(table);
            const isProcessed = table.classList.contains(CONFIG.PROCESSED_CLASS);

            if (hasData) {
                console.log(`Table ${index}: [${headers.join(", ")}] hasData=${hasData} processed=${isProcessed}`);
            }

            if (hasData && !isProcessed) {
                dataTables.push(table);
            }
        });

        console.log(`Tables Data à traiter: ${dataTables.length}`);
        console.groupEnd();

        return dataTables;
    }

    function scanAndProcess() {
        const dataTables = scanAllTables();
        dataTables.forEach((table) => processDataTable(table));
    }

    // MutationObserver
    function setupMutationObserver() {
        let scanTimeout = null;

        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;

            mutations.forEach((mutation) => {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === "TABLE" || node.querySelector?.("table")) {
                                shouldScan = true;
                            }
                        }
                    });
                }
            });

            if (shouldScan && !scanTimeout) {
                scanTimeout = setTimeout(() => {
                    scanAndProcess();
                    scanTimeout = null;
                }, 800);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        console.log("👁️ MutationObserver configuré");
    }

    // API globale
    window.DataAgent = {
        scan: scanAllTables,
        process: scanAndProcess,
        processTable: processDataTable,
        config: CONFIG,
        test: function () {
            console.log("🧪 TEST MANUEL");
            scanAndProcess();
        },
        forceProcess: function (index = 0) {
            const tables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
            if (index < tables.length) {
                tables[index].classList.remove(CONFIG.PROCESSED_CLASS);
                processDataTable(tables[index]);
            }
        },
        reset: function () {
            document.querySelectorAll("." + CONFIG.PROCESSED_CLASS).forEach(t => {
                t.classList.remove(CONFIG.PROCESSED_CLASS);
            });
            console.log("✅ Reset");
        },
        findGroups: function (keyword) {
            console.log(`🔍 Recherche groupes pour: "${keyword}"`);
            const groups = collectTableGroups(keyword, null);
            return groups;
        }
    };

    console.log("🌐 API: DataAgent.test() / DataAgent.forceProcess(0) / DataAgent.reset() / DataAgent.findGroups('mot')");

    // Init
    function init() {
        setupMutationObserver();
        setTimeout(scanAndProcess, 2000);
        setInterval(() => {
            const tables = scanAllTables();
            if (tables.length > 0) scanAndProcess();
        }, 3000);
        console.log("✅ DATA.JS V6.0 INITIALISÉ");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
