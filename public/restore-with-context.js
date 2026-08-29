// Restauration avec contexte de chat
// Sauvegarde et restaure les tables en fonction de leur position dans le chat

(function () {
    console.log('🎯 RESTORE WITH CONTEXT - Démarrage');

    let isRestoring = false;
    let lastRestoreTime = 0;
    const MIN_RESTORE_INTERVAL = 2000;

    // === OBTENIR LE CONTEXTE D'UNE TABLE ===
    function getTableContext(table) {
        // Trouver le message parent
        const messageContainer = table.closest('[class*="message"], [class*="chat"], [data-message-id]');

        if (messageContainer) {
            // Essayer de trouver un ID de message
            const messageId = messageContainer.getAttribute('data-message-id') ||
                messageContainer.id ||
                messageContainer.className;

            // Trouver l'index de la table dans ce message
            const tablesInMessage = messageContainer.querySelectorAll('table');
            const tableIndex = Array.from(tablesInMessage).indexOf(table);

            return {
                messageId: messageId,
                tableIndex: tableIndex,
                contextKey: `${messageId}_table_${tableIndex}`
            };
        }

        // Fallback : utiliser la position globale
        const allTables = document.querySelectorAll('table');
        const globalIndex = Array.from(allTables).indexOf(table);

        return {
            messageId: 'global',
            tableIndex: globalIndex,
            contextKey: `global_table_${globalIndex}`
        };
    }

    // === SAUVEGARDER UNE TABLE AVEC SON CONTEXTE ===
    async function saveTableWithContext(table) {
        try {
            const context = getTableContext(table);
            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());
            const html = table.outerHTML;

            const db = await openDatabase();

            const tableData = {
                id: context.contextKey,
                contextKey: context.contextKey,
                messageId: context.messageId,
                tableIndex: context.tableIndex,
                headers: headers,
                html: html,
                timestamp: Date.now(),
                url: window.location.href
            };

            await new Promise((resolve, reject) => {
                const transaction = db.transaction(['tables'], 'readwrite');
                const store = transaction.objectStore('tables');
                const request = store.put(tableData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            console.log(`💾 Table sauvegardée: ${context.contextKey}`);
            return true;
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            return false;
        }
    }

    // === RESTAURER LES TABLES POUR L'URL ACTUELLE ===
    async function restoreTables() {
        const now = Date.now();
        if (isRestoring || (now - lastRestoreTime) < MIN_RESTORE_INTERVAL) {
            console.log('⏭️ Restauration déjà en cours, skip');
            return;
        }

        isRestoring = true;
        lastRestoreTime = now;
        console.log('🎯 === DÉBUT RESTAURATION AVEC CONTEXTE ===');

        try {
            const db = await openDatabase();
            const currentUrl = window.location.href;

            // Récupérer toutes les tables sauvegardées
            const allSavedTables = await getAllSavedTables(db);

            // Filtrer par URL (ou URL similaire)
            const relevantTables = allSavedTables.filter(t => {
                // Même URL exacte
                if (t.url === currentUrl) return true;

                // Ou même base URL (sans query params)
                const savedBase = t.url?.split('?')[0];
                const currentBase = currentUrl.split('?')[0];
                return savedBase === currentBase;
            });

            console.log(`📦 ${relevantTables.length} table(s) pertinente(s) pour cette URL`);

            if (relevantTables.length === 0) {
                console.log('ℹ️ Aucune table à restaurer');
                return;
            }

            let restoredCount = 0;

            // Essayer de restaurer chaque table par contexte
            for (const savedTable of relevantTables) {
                if (await restoreTableByContext(savedTable)) {
                    restoredCount++;
                } else {
                    // Fallback : essayer par headers
                    if (await restoreTableByHeaders(savedTable)) {
                        restoredCount++;
                    }
                }
            }

            console.log(`✅ ${restoredCount}/${relevantTables.length} table(s) restaurée(s)`);
            console.log('🎯 === FIN RESTAURATION ===');

        } catch (error) {
            console.error('❌ Erreur restauration:', error);
        } finally {
            isRestoring = false;
        }
    }

    // === RESTAURER PAR CONTEXTE ===
    async function restoreTableByContext(savedTable) {
        console.log(`🔍 Recherche par contexte: ${savedTable.contextKey}`);

        // Trouver le message correspondant
        const messageContainers = document.querySelectorAll('[class*="message"], [class*="chat"], [data-message-id]');

        for (const container of messageContainers) {
            const messageId = container.getAttribute('data-message-id') ||
                container.id ||
                container.className;

            if (messageId === savedTable.messageId) {
                console.log('✅ Message correspondant trouvé');

                // Trouver la table à l'index correspondant
                const tablesInMessage = container.querySelectorAll('table');
                const targetTable = tablesInMessage[savedTable.tableIndex];

                if (targetTable) {
                    console.log(`✅ Table trouvée à l'index ${savedTable.tableIndex}`);
                    return await restoreTableContent(targetTable, savedTable);
                } else {
                    console.log(`⚠️ Table à l'index ${savedTable.tableIndex} non trouvée`);
                }
            }
        }

        console.log('❌ Contexte non trouvé');
        return false;
    }

    // === RESTAURER PAR HEADERS (FALLBACK) ===
    async function restoreTableByHeaders(savedTable) {
        console.log(`🔍 Recherche par headers: ${savedTable.headers?.join(', ')}`);

        const allTables = document.querySelectorAll('table');

        for (const table of allTables) {
            // Vérifier si déjà restaurée
            const container = table.closest('[data-restored-content="true"]');
            if (container) continue;

            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

            // Correspondance partielle
            const score = calculateMatchScore(headers, savedTable.headers);

            if (score >= 0.5) {
                console.log(`✅ Table trouvée par headers (score: ${score})`);
                return await restoreTableContent(table, savedTable);
            }
        }

        console.log('❌ Aucune table correspondante');
        return false;
    }

    // === CALCULER SCORE DE CORRESPONDANCE ===
    function calculateMatchScore(headers1, headers2) {
        if (!headers1 || !headers2 || headers1.length === 0 || headers2.length === 0) {
            return 0;
        }

        // Correspondance exacte
        if (headers1.length === headers2.length &&
            headers1.every((h, i) => h === headers2[i])) {
            return 1.0;
        }

        // Correspondance partielle
        let matchCount = 0;
        for (const savedHeader of headers2) {
            if (headers1.includes(savedHeader)) {
                matchCount++;
            }
        }

        return matchCount / headers2.length;
    }

    // === RESTAURER LE CONTENU ===
    async function restoreTableContent(table, savedTable) {
        const tbody = table.querySelector('tbody');
        if (!tbody || !savedTable.html) {
            console.log('❌ tbody ou HTML manquant');
            return false;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = savedTable.html;
        const savedTbody = tempDiv.querySelector('tbody');

        if (!savedTbody) {
            console.log('❌ tbody sauvegardé non trouvé');
            return false;
        }

        // Restaurer
        tbody.innerHTML = savedTbody.innerHTML;

        // Marquer comme restaurée
        const container = table.closest('[data-table-container]') || table.parentElement;
        if (container) {
            container.setAttribute('data-restored-content', 'true');
            container.setAttribute('data-restore-time', new Date().toISOString());
            container.setAttribute('data-context-key', savedTable.contextKey);
        }

        console.log(`✅ Table restaurée (${savedTbody.querySelectorAll('tr').length} lignes)`);
        return true;
    }

    // === OUVRIR INDEXEDDB ===
    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FlowiseTableDB', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('tables')) {
                    db.createObjectStore('tables', { keyPath: 'id' });
                }
            };
        });
    }

    // === RÉCUPÉRER TOUTES LES TABLES ===
    function getAllSavedTables(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['tables'], 'readonly');
            const store = transaction.objectStore('tables');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // === OBSERVER LES MODIFICATIONS DE TABLES ===
    function observeTableChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.tagName === 'TR') {
                            // Une ligne a été ajoutée à une table
                            const table = node.closest('table');
                            if (table) {
                                // Sauvegarder après un délai (pour grouper les modifications)
                                clearTimeout(table._saveTimeout);
                                table._saveTimeout = setTimeout(() => {
                                    saveTableWithContext(table);
                                }, 1000);
                            }
                        }
                    });
                }
            });
        });

        // Observer toutes les tables
        setTimeout(() => {
            const allTables = document.querySelectorAll('table');
            allTables.forEach(table => {
                const tbody = table.querySelector('tbody');
                if (tbody) {
                    observer.observe(tbody, {
                        childList: true,
                        subtree: false
                    });
                }
            });
            console.log(`👀 Observer activé sur ${allTables.length} table(s)`);
        }, 2000);
    }

    // === DÉTECTION DES CHANGEMENTS ===
    let lastUrl = window.location.href;
    let restoreTimeout = null;

    function checkForChanges() {
        const currentUrl = window.location.href;

        if (currentUrl !== lastUrl) {
            console.log('🔗 URL changée');
            lastUrl = currentUrl;
            scheduleRestore();
        }
    }

    function scheduleRestore() {
        console.log('⏰ Restauration planifiée dans 3 secondes');

        if (restoreTimeout) {
            clearTimeout(restoreTimeout);
        }

        restoreTimeout = setTimeout(() => {
            restoreTables();
        }, 3000);
    }

    // === INITIALISATION ===

    // 1. Restauration au chargement
    window.addEventListener('load', () => {
        console.log('📄 Page chargée - Restauration dans 2s');
        setTimeout(() => {
            restoreTables();
            observeTableChanges();
        }, 2000);
    });

    // 2. Vérification périodique
    setInterval(checkForChanges, 500);

    // 3. Navigation
    window.addEventListener('popstate', () => {
        console.log('⬅️ Navigation détectée');
        scheduleRestore();
    });

    // === EXPOSER POUR TESTS ===
    window.restoreTablesWithContext = restoreTables;
    window.saveTableManually = saveTableWithContext;

    console.log('✅ Restore with Context activé');
    console.log('💡 Test: window.restoreTablesWithContext()');
})();
