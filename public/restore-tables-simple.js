// Solution ultra-simple : UN SEUL script pour tout gérer

(function () {
    console.log('🎯 RESTORE TABLES SIMPLE - Démarrage');

    // Fonction de restauration unique
    async function restoreTables() {
        console.log('📥 Tentative de restauration...');

        try {
            // Ouvrir IndexedDB
            const db = await new Promise((resolve, reject) => {
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

            // Récupérer les tables sauvegardées
            const savedTables = await new Promise((resolve, reject) => {
                const transaction = db.transaction(['tables'], 'readonly');
                const store = transaction.objectStore('tables');
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });

            console.log(`📦 ${savedTables.length} table(s) sauvegardée(s)`);

            if (savedTables.length === 0) {
                console.log('ℹ️ Aucune table à restaurer');
                return 0;
            }

            // Attendre que les tables soient dans le DOM
            await new Promise(resolve => setTimeout(resolve, 2000));

            let restoredCount = 0;

            // Restaurer chaque table
            for (const savedTable of savedTables) {
                const allTables = document.querySelectorAll('table');

                for (const table of allTables) {
                    const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

                    // Comparer les headers
                    if (headers.length > 0 && savedTable.headers &&
                        headers.length === savedTable.headers.length &&
                        headers.every((h, i) => h === savedTable.headers[i])) {

                        // Vérifier si déjà restaurée
                        const container = table.closest('[data-restored-content="true"]');
                        if (container) continue;

                        // Restaurer
                        const tbody = table.querySelector('tbody');
                        if (tbody && savedTable.html) {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = savedTable.html;
                            const savedTbody = tempDiv.querySelector('tbody');

                            if (savedTbody) {
                                tbody.innerHTML = savedTbody.innerHTML;

                                // Marquer comme restaurée
                                const container = table.closest('[data-table-container]') || table.parentElement;
                                if (container) {
                                    container.setAttribute('data-restored-content', 'true');
                                    container.setAttribute('data-restore-time', new Date().toISOString());
                                }

                                restoredCount++;
                                const rows = savedTbody.querySelectorAll('tr').length;
                                console.log(`✅ Table restaurée (${rows} lignes)`);
                            }
                        }
                        break;
                    }
                }
            }

            console.log(`✅ ${restoredCount}/${savedTables.length} table(s) restaurée(s)`);
            return restoredCount;

        } catch (error) {
            console.error('❌ Erreur:', error);
            return 0;
        }
    }

    // Restaurer à plusieurs moments pour maximiser les chances
    const delays = [2000, 4000, 6000, 10000, 15000];

    delays.forEach(delay => {
        setTimeout(() => {
            console.log(`⏰ Restauration automatique (${delay / 1000}s)`);
            restoreTables();
        }, delay);
    });

    // Exposer pour utilisation manuelle
    window.restoreTables = restoreTables;

    console.log('✅ Restore Tables Simple activé');
    console.log('💡 Restaurations automatiques: 2s, 4s, 6s, 10s, 15s');
    console.log('💡 Forcer manuellement: window.restoreTables()');
})();
