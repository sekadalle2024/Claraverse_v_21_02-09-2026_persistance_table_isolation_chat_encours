// Restauration automatique lors des changements de chat (navigation SPA)

(function () {
    console.log('🔄 RESTORE ON CHAT CHANGE - Démarrage');

    let currentChatId = null;
    let restoreTimeout = null;

    // Fonction pour obtenir l'ID du chat actuel
    function getCurrentChatId() {
        // Essayer plusieurs méthodes pour identifier le chat
        const url = window.location.href;
        const urlMatch = url.match(/chat[\/=]([^\/&]+)/i);
        if (urlMatch) return urlMatch[1];

        // Chercher dans le DOM
        const chatContainer = document.querySelector('[data-chat-id], [data-session-id], [id*="chat"]');
        if (chatContainer) {
            return chatContainer.getAttribute('data-chat-id') ||
                chatContainer.getAttribute('data-session-id') ||
                chatContainer.id;
        }

        return url; // Fallback sur l'URL complète
    }

    // Fonction de restauration
    async function restoreTablesForCurrentChat() {
        console.log('🎯 Restauration pour le chat actuel');

        // Attendre que Flowise ait généré les tables
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Utiliser Smart Restore si disponible
        if (typeof window.forceSmartRestore === 'function') {
            console.log('📥 Utilisation de Smart Restore');
            window.forceSmartRestore();
        } else {
            // Fallback : restauration manuelle
            console.log('📥 Restauration manuelle');
            await manualRestore();
        }
    }

    // Restauration manuelle (fallback)
    async function manualRestore() {
        try {
            const db = await openDatabase();
            const savedTables = await getAllSavedTables(db);

            console.log(`📦 ${savedTables.length} table(s) sauvegardée(s)`);

            for (const savedTable of savedTables) {
                await restoreTable(savedTable);
            }
        } catch (error) {
            console.error('❌ Erreur restauration manuelle:', error);
        }
    }

    // Ouvrir IndexedDB
    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FlowiseTableDB', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Récupérer toutes les tables
    function getAllSavedTables(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['tables'], 'readonly');
            const store = transaction.objectStore('tables');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // Restaurer une table
    async function restoreTable(savedTable) {
        const allTables = document.querySelectorAll('table');

        for (const table of allTables) {
            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

            if (headersMatch(headers, savedTable.headers)) {
                const container = table.closest('[data-restored-content="true"]');
                if (!container) {
                    const tbody = table.querySelector('tbody');
                    if (tbody && savedTable.html) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = savedTable.html;
                        const savedTbody = tempDiv.querySelector('tbody');

                        if (savedTbody) {
                            tbody.innerHTML = savedTbody.innerHTML;
                            const container = table.closest('[data-table-container]') || table.parentElement;
                            if (container) {
                                container.setAttribute('data-restored-content', 'true');
                                container.setAttribute('data-restore-time', new Date().toISOString());
                            }
                            console.log('✅ Table restaurée');
                        }
                    }
                }
                break;
            }
        }
    }

    // Comparer les headers
    function headersMatch(headers1, headers2) {
        if (!headers1 || !headers2 || headers1.length !== headers2.length) {
            return false;
        }
        return headers1.every((h, i) => h === headers2[i]);
    }

    // Détecter les changements de chat
    function detectChatChange() {
        const newChatId = getCurrentChatId();

        if (newChatId !== currentChatId) {
            console.log(`🔄 Changement de chat détecté: ${currentChatId} → ${newChatId}`);
            currentChatId = newChatId;

            // Annuler le timeout précédent
            if (restoreTimeout) {
                clearTimeout(restoreTimeout);
            }

            // Restaurer après un délai
            restoreTimeout = setTimeout(() => {
                restoreTablesForCurrentChat();
            }, 3000); // Attendre 3s pour que Flowise génère les tables
        }
    }

    // Observer les changements d'URL (pour les SPA)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            console.log('🔗 URL changée:', currentUrl);
            detectChatChange();
        }
    }).observe(document, { subtree: true, childList: true });

    // Observer les changements dans le conteneur de chat
    const observeChatContainer = () => {
        const chatContainer = document.querySelector('.message-container, #chat-container, [class*="message"], [class*="chat"], main');

        if (chatContainer) {
            console.log('👀 Observer activé sur le conteneur de chat');

            const observer = new MutationObserver((mutations) => {
                // Détecter si le contenu du chat a été complètement remplacé
                const hasSignificantChange = mutations.some(mutation => {
                    return mutation.addedNodes.length > 5 || mutation.removedNodes.length > 5;
                });

                if (hasSignificantChange) {
                    console.log('📝 Changement significatif détecté dans le chat');
                    detectChatChange();
                }
            });

            observer.observe(chatContainer, {
                childList: true,
                subtree: false // Observer seulement les enfants directs
            });
        } else {
            // Réessayer après 1 seconde
            setTimeout(observeChatContainer, 1000);
        }
    };

    // Démarrer l'observation
    setTimeout(observeChatContainer, 1000);

    // Initialiser le chat actuel
    currentChatId = getCurrentChatId();
    console.log('📍 Chat actuel:', currentChatId);

    // Écouter les événements de navigation (si disponibles)
    window.addEventListener('popstate', () => {
        console.log('⬅️ Navigation arrière/avant détectée');
        detectChatChange();
    });

    // Écouter les événements personnalisés (si l'app en émet)
    window.addEventListener('chatChanged', (event) => {
        console.log('🔔 Événement chatChanged reçu:', event.detail);
        detectChatChange();
    });

    window.addEventListener('sessionChanged', (event) => {
        console.log('🔔 Événement sessionChanged reçu:', event.detail);
        detectChatChange();
    });

    // Exposer pour tests manuels
    window.restoreCurrentChat = restoreTablesForCurrentChat;
    window.detectChatChange = detectChatChange;

    console.log('✅ Restore on Chat Change activé');
    console.log('💡 Test manuel: window.restoreCurrentChat()');
})();
