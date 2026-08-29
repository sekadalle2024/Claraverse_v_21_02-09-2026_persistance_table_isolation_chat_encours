// Restauration automatique - Fonctionne pour rechargement ET changement de chat
// Version ultra-simple et robuste

(function () {
    console.log('🔄 RESTORE ON ANY CHANGE - Démarrage');

    let isRestoring = false;
    let lastRestoreTime = 0;
    const MIN_RESTORE_INTERVAL = 2000; // Minimum 2s entre deux restaurations

    // === FONCTION PRINCIPALE DE RESTAURATION ===
    async function restoreTables() {
        // Éviter les restaurations trop fréquentes
        const now = Date.now();
        const timeSinceLastRestore = now - lastRestoreTime;

        console.log(`🔍 Tentative de restauration (isRestoring: ${isRestoring}, timeSince: ${timeSinceLastRestore}ms)`);

        if (isRestoring) {
            console.log('⏭️ Restauration déjà en cours, skip');
            return;
        }

        if (timeSinceLastRestore < MIN_RESTORE_INTERVAL) {
            console.log(`⏭️ Restauration trop récente (${timeSinceLastRestore}ms < ${MIN_RESTORE_INTERVAL}ms), skip`);
            return;
        }

        isRestoring = true;
        lastRestoreTime = now;
        console.log('🎯 === DÉBUT RESTAURATION ===');

        try {
            // 1. Ouvrir IndexedDB
            console.log('1️⃣ Ouverture IndexedDB (clara_db)...');
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('clara_db', 12);
                request.onsuccess = () => {
                    console.log('✅ IndexedDB ouvert');
                    resolve(request.result);
                };
                request.onerror = () => {
                    console.error('❌ Erreur ouverture IndexedDB:', request.error);
                    reject(request.error);
                };
                request.onupgradeneeded = (event) => {
                    console.log('🔧 Upgrade de la base...');
                    // Ne rien faire, la base est gérée par le système principal
                };
            });

            // 2. Vérifier que le store existe
            const storeName = 'clara_generated_tables';
            if (!db.objectStoreNames.contains(storeName)) {
                console.log(`⚠️ Store "${storeName}" n'existe pas`);
                console.log('ℹ️ Aucune table à restaurer');
                return;
            }

            // 3. Récupérer toutes les tables sauvegardées
            console.log('2️⃣ Récupération des tables...');
            const savedTables = await new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                request.onsuccess = () => {
                    console.log(`✅ ${request.result.length} table(s) récupérée(s)`);
                    resolve(request.result || []);
                };
                request.onerror = () => {
                    console.error('❌ Erreur récupération:', request.error);
                    reject(request.error);
                };
            });

            console.log(`📦 ${savedTables.length} table(s) sauvegardée(s) trouvée(s)`);

            if (savedTables.length === 0) {
                console.log('ℹ️ Aucune table à restaurer');
                return;
            }

            // 3. Restaurer chaque table
            console.log('3️⃣ Tentative de restauration...');
            let restoredCount = 0;
            for (const savedTable of savedTables) {
                console.log(`   🔍 Table: ${savedTable.keyword || savedTable.id || 'unknown'}`);
                console.log(`      Structure:`, Object.keys(savedTable));
                if (await restoreSingleTable(savedTable)) {
                    restoredCount++;
                }
            }

            console.log(`✅ ${restoredCount}/${savedTables.length} table(s) restaurée(s)`);
            console.log('🎯 === FIN RESTAURATION ===');

        } catch (error) {
            console.error('❌ Erreur restauration:', error);
        } finally {
            isRestoring = false;
        }
    }

    // === RESTAURER UNE TABLE SPÉCIFIQUE ===
    async function restoreSingleTable(savedTable) {
        // Trouver toutes les tables dans le DOM
        const allTables = document.querySelectorAll('table');

        for (const table of allTables) {
            // Extraire les headers de la table
            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

            // Comparer avec les headers sauvegardés
            if (headersMatch(headers, savedTable.headers)) {
                // Vérifier si déjà restaurée
                const container = table.closest('[data-restored-content="true"]');
                if (container) {
                    console.log('⏭️ Table déjà restaurée, skip');
                    return false;
                }

                // Restaurer le contenu
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

                        console.log(`✅ Table restaurée: ${headers.join(', ').substring(0, 50)}...`);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // === COMPARER LES HEADERS ===
    function headersMatch(headers1, headers2) {
        if (!headers1 || !headers2 || headers1.length !== headers2.length) {
            return false;
        }
        return headers1.every((h, i) => h === headers2[i]);
    }

    // === DÉTECTER LES CHANGEMENTS ===
    let lastUrl = window.location.href;
    let lastTableCount = 0;
    let checkInterval = null;

    function checkForChanges() {
        const currentUrl = window.location.href;
        const currentTableCount = document.querySelectorAll('table').length;

        // Changement d'URL (changement de chat)
        if (currentUrl !== lastUrl) {
            console.log('🔗 URL changée:', lastUrl, '→', currentUrl);
            lastUrl = currentUrl;
            scheduleRestore();
            return;
        }

        // Changement du nombre de tables (augmentation OU diminution)
        if (currentTableCount !== lastTableCount && currentTableCount > 0) {
            console.log(`📊 Nombre de tables changé: ${lastTableCount} → ${currentTableCount}`);
            lastTableCount = currentTableCount;
            scheduleRestore();
            return;
        }

        lastTableCount = currentTableCount;
    }

    // === PLANIFIER LA RESTAURATION ===
    let restoreTimeout = null;

    let lastScheduleTime = 0;
    const SCHEDULE_COOLDOWN = 5000; // Ne pas replanifier si déjà planifié il y a moins de 5s

    function scheduleRestore() {
        const now = Date.now();

        // Si un timeout est déjà en cours et récent, ne pas le remplacer
        if (restoreTimeout && (now - lastScheduleTime) < SCHEDULE_COOLDOWN) {
            console.log('⏭️ Restauration déjà planifiée, skip');
            return;
        }

        console.log('⏰ Restauration planifiée dans 5 secondes');

        // Annuler le timeout précédent seulement si ancien
        if (restoreTimeout) {
            clearTimeout(restoreTimeout);
            console.log('   ↩️ Timeout précédent annulé (ancien)');
        }

        lastScheduleTime = now;

        // Réinitialiser le flag pour permettre la restauration
        isRestoring = false;

        // Planifier la restauration
        restoreTimeout = setTimeout(() => {
            console.log('⏰ Timeout écoulé - Lancement de la restauration');
            restoreTables();
            restoreTimeout = null;
        }, 5000); // Attendre 5s pour que Flowise finisse de générer
    }

    // === INITIALISATION ===

    // 1. Restauration au chargement de la page
    window.addEventListener('load', () => {
        console.log('📄 Page chargée - Restauration dans 2s');
        setTimeout(restoreTables, 2000);
    });

    // 2. Vérifier les changements toutes les 500ms
    checkInterval = setInterval(checkForChanges, 500);

    // 3. Observer les mutations DOM
    const observer = new MutationObserver((mutations) => {
        const hasTableChanges = mutations.some(m => {
            return Array.from(m.addedNodes).some(node => {
                if (node.nodeType === 1) {
                    return node.tagName === 'TABLE' || node.querySelector('table');
                }
                return false;
            });
        });

        if (hasTableChanges) {
            console.log('🔄 Nouvelles tables détectées via MutationObserver');
            scheduleRestore();
        }
    });

    // Démarrer l'observation après 1s
    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('👀 MutationObserver activé');
    }, 1000);

    // 4. Écouter les événements de navigation
    window.addEventListener('popstate', () => {
        console.log('⬅️ Navigation arrière/avant détectée');
        scheduleRestore();
    });

    // 5. Écouter les clics (pour détecter les changements de chat)
    document.addEventListener('click', (e) => {
        const target = e.target;
        // Détecter les clics sur des éléments de navigation
        if (target.closest('a, button, [role="button"]')) {
            console.log('🖱️ Clic de navigation détecté');
            setTimeout(checkForChanges, 500);
        }
    }, true);

    // === EXPOSER POUR TESTS MANUELS ===
    window.restoreTablesNow = restoreTables;
    window.checkChanges = checkForChanges;

    console.log('✅ Restore on Any Change activé');
    console.log('💡 Test manuel: window.restoreTablesNow()');
    console.log('📍 URL actuelle:', lastUrl);
})();
