// Restauration avec correspondance intelligente
// Gère les cas où les headers changent entre la sauvegarde et la restauration

(function () {
    console.log('🧠 SMART MATCHING RESTORE - Démarrage');

    let isRestoring = false;
    let lastRestoreTime = 0;
    const MIN_RESTORE_INTERVAL = 2000;

    // === FONCTION PRINCIPALE DE RESTAURATION ===
    async function restoreTables() {
        const now = Date.now();
        if (isRestoring || (now - lastRestoreTime) < MIN_RESTORE_INTERVAL) {
            console.log('⏭️ Restauration déjà en cours ou trop récente, skip');
            return;
        }

        isRestoring = true;
        lastRestoreTime = now;
        console.log('🎯 === DÉBUT RESTAURATION SMART ===');

        try {
            const db = await openDatabase();
            const savedTables = await getAllSavedTables(db);

            console.log(`📦 ${savedTables.length} table(s) sauvegardée(s) trouvée(s)`);

            if (savedTables.length === 0) {
                console.log('ℹ️ Aucune table à restaurer');
                return;
            }

            let restoredCount = 0;
            for (const savedTable of savedTables) {
                if (await restoreSingleTable(savedTable)) {
                    restoredCount++;
                }
            }

            console.log(`✅ ${restoredCount}/${savedTables.length} table(s) restaurée(s)`);
            console.log('🎯 === FIN RESTAURATION SMART ===');

        } catch (error) {
            console.error('❌ Erreur restauration:', error);
        } finally {
            isRestoring = false;
        }
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

    // === RESTAURER UNE TABLE AVEC CORRESPONDANCE INTELLIGENTE ===
    async function restoreSingleTable(savedTable) {
        console.log(`🔍 Recherche table: ${savedTable.headers?.join(', ').substring(0, 50)}...`);

        const allTables = document.querySelectorAll('table');
        let bestMatch = null;
        let bestScore = 0;

        for (const table of allTables) {
            // Vérifier si déjà restaurée
            const container = table.closest('[data-restored-content="true"]');
            if (container) {
                continue;
            }

            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());
            const score = calculateMatchScore(headers, savedTable.headers);

            console.log(`   Table avec headers [${headers.join(', ')}] - Score: ${score}`);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = table;
            }
        }

        // Seuil de correspondance : au moins 50%
        if (bestScore >= 0.5) {
            console.log(`✅ Meilleure correspondance trouvée (score: ${bestScore})`);
            return await restoreTableContent(bestMatch, savedTable);
        } else {
            console.log(`❌ Aucune correspondance suffisante (meilleur score: ${bestScore})`);
            return false;
        }
    }

    // === CALCULER LE SCORE DE CORRESPONDANCE ===
    function calculateMatchScore(headers1, headers2) {
        if (!headers1 || !headers2 || headers1.length === 0 || headers2.length === 0) {
            return 0;
        }

        // Méthode 1 : Correspondance exacte (score = 1.0)
        if (headers1.length === headers2.length &&
            headers1.every((h, i) => h === headers2[i])) {
            return 1.0;
        }

        // Méthode 2 : Correspondance partielle
        // Compter combien de headers de la table sauvegardée sont présents dans la table actuelle
        let matchCount = 0;
        for (const savedHeader of headers2) {
            if (headers1.includes(savedHeader)) {
                matchCount++;
            }
        }

        // Score = pourcentage de headers sauvegardés retrouvés
        const partialScore = matchCount / headers2.length;

        // Bonus si la table actuelle a plus de colonnes (évolution de la table)
        const evolutionBonus = headers1.length > headers2.length ? 0.1 : 0;

        return Math.min(partialScore + evolutionBonus, 1.0);
    }

    // === RESTAURER LE CONTENU DE LA TABLE ===
    async function restoreTableContent(table, savedTable) {
        const tbody = table.querySelector('tbody');
        if (!tbody || !savedTable.html) {
            console.log('❌ tbody ou HTML manquant');
            return false;
        }

        // Extraire le tbody sauvegardé
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = savedTable.html;
        const savedTbody = tempDiv.querySelector('tbody');

        if (!savedTbody) {
            console.log('❌ tbody sauvegardé non trouvé');
            return false;
        }

        // Comparer le nombre de colonnes
        const currentHeaders = Array.from(table.querySelectorAll('th'));
        const savedHeaders = savedTable.headers || [];

        console.log(`📊 Colonnes: ${savedHeaders.length} sauvegardées → ${currentHeaders.length} actuelles`);

        // Si le nombre de colonnes a changé, adapter les lignes
        if (currentHeaders.length !== savedHeaders.length) {
            console.log('⚠️ Nombre de colonnes différent - Adaptation nécessaire');
            adaptTableRows(savedTbody, savedHeaders.length, currentHeaders.length);
        }

        // Restaurer le contenu
        tbody.innerHTML = savedTbody.innerHTML;

        // Marquer comme restaurée
        const container = table.closest('[data-table-container]') || table.parentElement;
        if (container) {
            container.setAttribute('data-restored-content', 'true');
            container.setAttribute('data-restore-time', new Date().toISOString());
        }

        console.log(`✅ Table restaurée (${savedTbody.querySelectorAll('tr').length} lignes)`);
        return true;
    }

    // === ADAPTER LES LIGNES SI LE NOMBRE DE COLONNES A CHANGÉ ===
    function adaptTableRows(tbody, oldColCount, newColCount) {
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');

            if (cells.length < newColCount) {
                // Ajouter des cellules vides
                const cellsToAdd = newColCount - cells.length;
                for (let i = 0; i < cellsToAdd; i++) {
                    const newCell = document.createElement('td');
                    newCell.textContent = '-';
                    row.appendChild(newCell);
                }
                console.log(`   ➕ Ajout de ${cellsToAdd} cellule(s) vide(s)`);
            } else if (cells.length > newColCount) {
                // Supprimer les cellules en trop
                const cellsToRemove = cells.length - newColCount;
                for (let i = 0; i < cellsToRemove; i++) {
                    cells[cells.length - 1 - i].remove();
                }
                console.log(`   ➖ Suppression de ${cellsToRemove} cellule(s)`);
            }
        });
    }

    // === DÉTECTION DES CHANGEMENTS ===
    let lastUrl = window.location.href;
    let lastTableCount = 0;
    let restoreTimeout = null;

    function checkForChanges() {
        const currentUrl = window.location.href;
        const currentTableCount = document.querySelectorAll('table').length;

        if (currentUrl !== lastUrl) {
            console.log('🔗 URL changée:', lastUrl, '→', currentUrl);
            lastUrl = currentUrl;
            scheduleRestore();
            return;
        }

        if (currentTableCount > lastTableCount) {
            console.log(`📊 Nouvelles tables: ${lastTableCount} → ${currentTableCount}`);
            lastTableCount = currentTableCount;
            scheduleRestore();
            return;
        }

        lastTableCount = currentTableCount;
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
        setTimeout(restoreTables, 2000);
    });

    // 2. Vérification périodique
    setInterval(checkForChanges, 500);

    // 3. Observer DOM
    const observer = new MutationObserver((mutations) => {
        const hasTableChanges = mutations.some(m => {
            return Array.from(m.addedNodes).some(node => {
                if (node.nodeType === 1) {
                    return node.tagName === 'TABLE' || node.querySelector?.('table');
                }
                return false;
            });
        });

        if (hasTableChanges) {
            console.log('🔄 Nouvelles tables détectées via MutationObserver');
            scheduleRestore();
        }
    });

    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('👀 MutationObserver activé');
    }, 1000);

    // 4. Navigation
    window.addEventListener('popstate', () => {
        console.log('⬅️ Navigation détectée');
        scheduleRestore();
    });

    // 5. Clics
    document.addEventListener('click', (e) => {
        if (e.target.closest('a, button, [role="button"]')) {
            setTimeout(checkForChanges, 500);
        }
    }, true);

    // === EXPOSER POUR TESTS ===
    window.restoreTablesSmartNow = restoreTables;

    console.log('✅ Smart Matching Restore activé');
    console.log('💡 Test manuel: window.restoreTablesSmartNow()');
})();
