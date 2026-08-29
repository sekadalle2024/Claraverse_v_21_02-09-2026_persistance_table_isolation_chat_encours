// Force la restauration lors des changements de chat - Version agressive

(function () {
    console.log('🔥 FORCE RESTORE CHAT CHANGE - Démarrage');

    let lastUrl = window.location.href;
    let lastChatContent = '';
    let restoreTimer = null;

    // Fonction de restauration
    async function forceRestore() {
        console.log('🎯 Force Restore - Tentative de restauration');

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
            const tables = await new Promise((resolve, reject) => {
                const transaction = db.transaction(['tables'], 'readonly');
                const store = transaction.objectStore('tables');
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });

            console.log(`📦 ${tables.length} table(s) sauvegardée(s) trouvée(s)`);

            if (tables.length === 0) {
                console.log('ℹ️ Aucune table à restaurer');
                return;
            }

            // Attendre que les tables soient dans le DOM
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Restaurer chaque table
            let restoredCount = 0;
            for (const savedTable of tables) {
                const allTables = document.querySelectorAll('table');

                for (const table of allTables) {
                    const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

                    // Comparer les headers
                    if (headers.length > 0 && savedTable.headers &&
                        headers.length === savedTable.headers.length &&
                        headers.every((h, i) => h === savedTable.headers[i])) {

                        // Vérifier si déjà restaurée
                        const container = table.closest('[data-restored-content="true"]');
                        if (container) {
                            console.log('⏭️ Table déjà restaurée, skip');
                            continue;
                        }

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
                                console.log(`✅ Table restaurée (${savedTbody.querySelectorAll('tr').length} lignes)`);
                            }
                        }
                        break;
                    }
                }
            }

            console.log(`✅ ${restoredCount}/${tables.length} table(s) restaurée(s)`);

        } catch (error) {
            console.error('❌ Erreur lors de la restauration:', error);
        }
    }

    // Détecter les changements de contenu du chat
    function getChatSignature() {
        // Créer une signature du contenu du chat
        const messages = document.querySelectorAll('[class*="message"], [class*="chat-message"], .message-container > *');
        return messages.length + '_' + (messages[messages.length - 1]?.textContent?.substring(0, 50) || '');
    }

    // Observer les changements
    function checkForChanges() {
        const currentUrl = window.location.href;
        const currentSignature = getChatSignature();

        // Changement d'URL
        if (currentUrl !== lastUrl) {
            console.log('🔗 URL changée:', lastUrl, '→', currentUrl);
            lastUrl = currentUrl;
            scheduleRestore();
        }

        // Changement de contenu significatif
        if (currentSignature !== lastChatContent && currentSignature !== '0_') {
            const oldCount = parseInt(lastChatContent.split('_')[0]) || 0;
            const newCount = parseInt(currentSignature.split('_')[0]) || 0;

            // Si le nombre de messages a beaucoup changé (probable changement de chat)
            if (Math.abs(newCount - oldCount) > 3) {
                console.log('📝 Changement significatif de contenu:', oldCount, '→', newCount, 'messages');
                lastChatContent = currentSignature;
                scheduleRestore();
            }
        }
    }

    // Planifier la restauration
    function scheduleRestore() {
        console.log('⏰ Restauration planifiée dans 3 secondes');

        if (restoreTimer) {
            clearTimeout(restoreTimer);
        }

        restoreTimer = setTimeout(() => {
            forceRestore();
        }, 3000);
    }

    // Vérifier toutes les 500ms
    setInterval(checkForChanges, 500);

    // Observer le DOM pour les changements majeurs
    const observer = new MutationObserver((mutations) => {
        // Détecter les changements majeurs (beaucoup de nœuds ajoutés/supprimés)
        const significantChange = mutations.some(m =>
            m.addedNodes.length > 5 || m.removedNodes.length > 5
        );

        if (significantChange) {
            console.log('🔄 Changement DOM significatif détecté');
            checkForChanges();
        }
    });

    // Observer le body
    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('👀 Observer DOM activé');
    }, 1000);

    // Écouter les événements de navigation
    window.addEventListener('popstate', () => {
        console.log('⬅️ Navigation arrière/avant');
        scheduleRestore();
    });

    // Écouter les clics sur les liens/boutons de navigation
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'A' || target.closest('a') ||
            target.getAttribute('role') === 'button' ||
            target.closest('[role="button"]')) {
            console.log('🖱️ Clic de navigation détecté');
            setTimeout(checkForChanges, 500);
        }
    }, true);

    // Initialiser
    lastUrl = window.location.href;
    lastChatContent = getChatSignature();

    // Exposer pour tests manuels
    window.forceRestoreChatChange = forceRestore;
    window.checkChatChanges = checkForChanges;

    console.log('✅ Force Restore Chat Change activé');
    console.log('💡 Test manuel: window.forceRestoreChatChange()');
    console.log('📍 URL actuelle:', lastUrl);
    console.log('📝 Signature chat:', lastChatContent);
})();
