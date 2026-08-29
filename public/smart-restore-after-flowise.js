// Solution intelligente : Restaurer APRÈS que Flowise ait fini de régénérer les tables

(function () {
    console.log('🧠 SMART RESTORE - Démarrage');

    let flowiseStableTimeout = null;
    let lastFlowiseActivity = Date.now();
    const STABILITY_DELAY = 3000; // Attendre 3s de stabilité après la dernière activité Flowise

    // Observer les mutations DOM pour détecter l'activité de Flowise
    const observer = new MutationObserver((mutations) => {
        let hasTableActivity = false;

        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    const tables = node.querySelectorAll ? node.querySelectorAll('table') : [];
                    if (node.tagName === 'TABLE') {
                        tables.push(node);
                    }

                    if (tables.length > 0) {
                        hasTableActivity = true;
                    }
                }
            });
        });

        if (hasTableActivity) {
            lastFlowiseActivity = Date.now();
            console.log('🔄 Activité Flowise détectée - Reset du timer de stabilité');

            // Annuler le timer précédent
            if (flowiseStableTimeout) {
                clearTimeout(flowiseStableTimeout);
            }

            // Créer un nouveau timer
            flowiseStableTimeout = setTimeout(() => {
                console.log('✅ Flowise stable depuis 3s - Lancement de la restauration');
                performSmartRestore();
            }, STABILITY_DELAY);
        }
    });

    // Fonction de restauration intelligente
    async function performSmartRestore() {
        console.log('🎯 Début de la restauration intelligente');

        try {
            // 1. Récupérer les données depuis IndexedDB
            const db = await openDatabase();
            const savedTables = await getAllSavedTables(db);

            console.log(`📦 ${savedTables.length} table(s) sauvegardée(s) trouvée(s)`);

            if (savedTables.length === 0) {
                console.log('ℹ️ Aucune table à restaurer');
                return;
            }

            // 2. Pour chaque table sauvegardée, trouver et remplacer la version originale
            let restoredCount = 0;

            for (const savedTable of savedTables) {
                const success = await restoreTable(savedTable);
                if (success) {
                    restoredCount++;
                }
            }

            console.log(`✅ ${restoredCount}/${savedTables.length} table(s) restaurée(s) avec succès`);

            // 3. Nettoyer les duplicatas
            cleanupDuplicates();

        } catch (error) {
            console.error('❌ Erreur lors de la restauration:', error);
        }
    }

    // Ouvrir la base de données
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

    // Récupérer toutes les tables sauvegardées
    function getAllSavedTables(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['tables'], 'readonly');
            const store = transaction.objectStore('tables');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // Restaurer une table spécifique
    async function restoreTable(savedTable) {
        console.log(`🔍 Recherche de la table: ${savedTable.headers?.join(', ').substring(0, 50)}...`);

        // Trouver la table originale par headers
        const allTables = document.querySelectorAll('table');
        let targetTable = null;

        for (const table of allTables) {
            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

            // Comparer les headers
            if (headersMatch(headers, savedTable.headers)) {
                // Vérifier que ce n'est pas déjà une table restaurée
                const container = table.closest('[data-restored-content="true"]');
                if (!container) {
                    targetTable = table;
                    break;
                }
            }
        }

        if (!targetTable) {
            console.log('⚠️ Table originale non trouvée');
            return false;
        }

        console.log('✅ Table originale trouvée - Remplacement du contenu');

        // Remplacer le contenu de la table
        const tbody = targetTable.querySelector('tbody');
        if (tbody && savedTable.html) {
            // Extraire le tbody du HTML sauvegardé
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = savedTable.html;
            const savedTbody = tempDiv.querySelector('tbody');

            if (savedTbody) {
                tbody.innerHTML = savedTbody.innerHTML;

                // Marquer le container comme restauré
                const container = targetTable.closest('[data-table-container]') || targetTable.parentElement;
                if (container) {
                    container.setAttribute('data-restored-content', 'true');
                    container.setAttribute('data-restore-time', new Date().toISOString());
                }

                console.log(`✅ Table restaurée (${savedTbody.querySelectorAll('tr').length} lignes)`);
                return true;
            }
        }

        return false;
    }

    // Comparer les headers
    function headersMatch(headers1, headers2) {
        if (!headers1 || !headers2 || headers1.length !== headers2.length) {
            return false;
        }

        return headers1.every((h, i) => h === headers2[i]);
    }

    // Nettoyer les duplicatas
    function cleanupDuplicates() {
        const allTables = document.querySelectorAll('table');
        const seenHeaders = new Map();
        let removedCount = 0;

        allTables.forEach(table => {
            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim()).join('|');
            const container = table.closest('[data-table-container]') || table.parentElement;
            const isRestored = container?.getAttribute('data-restored-content') === 'true';

            if (seenHeaders.has(headers)) {
                // Si on a déjà vu ces headers
                const previousContainer = seenHeaders.get(headers);
                const previousIsRestored = previousContainer?.getAttribute('data-restored-content') === 'true';

                // Garder la version restaurée, supprimer l'originale
                if (isRestored && !previousIsRestored) {
                    previousContainer?.remove();
                    seenHeaders.set(headers, container);
                    removedCount++;
                    console.log('🗑️ Duplicata original supprimé');
                } else if (!isRestored && previousIsRestored) {
                    container?.remove();
                    removedCount++;
                    console.log('🗑️ Duplicata original supprimé');
                }
            } else {
                seenHeaders.set(headers, container);
            }
        });

        if (removedCount > 0) {
            console.log(`🧹 ${removedCount} duplicata(s) supprimé(s)`);
        }
    }

    // Démarrer l'observation
    setTimeout(() => {
        const chatContainer = document.querySelector('.message-container, #chat-container, [class*="message"], [class*="chat"]');

        if (chatContainer) {
            observer.observe(chatContainer, {
                childList: true,
                subtree: true
            });
            console.log('👀 Observer activé - En attente de stabilité Flowise');

            // Lancer une première restauration après 5s (au cas où Flowise a déjà fini)
            setTimeout(() => {
                console.log('⏰ Première tentative de restauration (5s)');
                performSmartRestore();
            }, 5000);

        } else {
            console.warn('⚠️ Conteneur de chat non trouvé');
        }
    }, 1000);

    // Exposer la fonction pour tests manuels
    window.forceSmartRestore = performSmartRestore;

    console.log('✅ Smart Restore activé');
})();
