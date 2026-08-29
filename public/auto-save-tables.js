// Sauvegarde automatique des tables modifiées

(function () {
    console.log('💾 AUTO SAVE TABLES - Démarrage');

    // === SAUVEGARDER UNE TABLE ===
    async function saveTable(table) {
        try {
            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());
            const html = table.outerHTML;

            // Ouvrir IndexedDB
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('FlowiseTableDB', 1);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('tables')) {
                        db.createObjectStore('tables', { keyPath: 'id' });
                        console.log('🔧 Store "tables" créé');
                    }
                };
            });

            // Créer un ID unique basé sur les headers
            const tableId = 'table_' + headers.join('_').replace(/[^a-zA-Z0-9]/g, '_');

            const tableData = {
                id: tableId,
                headers: headers,
                html: html,
                timestamp: Date.now()
            };

            // Sauvegarder
            await new Promise((resolve, reject) => {
                const transaction = db.transaction(['tables'], 'readwrite');
                const store = transaction.objectStore('tables');
                const request = store.put(tableData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            console.log(`💾 Table sauvegardée: ${headers.join(', ').substring(0, 50)}...`);
            return true;
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            return false;
        }
    }

    // === OBSERVER LES MODIFICATIONS DE TABLES ===
    function observeTableChanges() {
        // Observer les modifications dans les tbody
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.target.tagName === 'TBODY') {
                    const table = mutation.target.closest('table');
                    if (table) {
                        // Sauvegarder après un délai (pour grouper les modifications)
                        clearTimeout(table._saveTimeout);
                        table._saveTimeout = setTimeout(() => {
                            console.log('📝 Modification détectée - Sauvegarde...');
                            saveTable(table);
                        }, 1000);
                    }
                }
            });
        });

        // Observer toutes les tables existantes
        function observeAllTables() {
            const allTables = document.querySelectorAll('table');
            allTables.forEach(table => {
                const tbody = table.querySelector('tbody');
                if (tbody && !tbody._observed) {
                    observer.observe(tbody, {
                        childList: true,
                        subtree: false
                    });
                    tbody._observed = true;
                }
            });

            if (allTables.length > 0) {
                console.log(`👀 Observer activé sur ${allTables.length} table(s)`);
            }
        }

        // Observer initialement
        setTimeout(observeAllTables, 2000);

        // Ré-observer périodiquement pour les nouvelles tables
        setInterval(observeAllTables, 5000);

        // Observer les nouvelles tables ajoutées au DOM
        const domObserver = new MutationObserver(() => {
            observeAllTables();
        });

        domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // === SAUVEGARDER TOUTES LES TABLES ACTUELLES ===
    async function saveAllCurrentTables() {
        const allTables = document.querySelectorAll('table');
        console.log(`💾 Sauvegarde de ${allTables.length} table(s) actuelle(s)...`);

        let savedCount = 0;
        for (const table of allTables) {
            if (await saveTable(table)) {
                savedCount++;
            }
        }

        console.log(`✅ ${savedCount}/${allTables.length} table(s) sauvegardée(s)`);
    }

    // === INITIALISATION ===

    // Sauvegarder les tables existantes au chargement
    window.addEventListener('load', () => {
        setTimeout(() => {
            saveAllCurrentTables();
            observeTableChanges();
        }, 3000);
    });

    // Exposer pour tests manuels
    window.saveAllTables = saveAllCurrentTables;
    window.saveTable = saveTable;

    console.log('✅ Auto Save Tables activé');
    console.log('💡 Test manuel: window.saveAllTables()');
})();
