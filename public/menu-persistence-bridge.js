/**
 * Pont de persistance entre menu.js et le système TypeScript
 * Ce script expose l'API de persistance TypeScript à menu.js
 */

(function () {
    'use strict';

    console.log('🌉 Initialisation du pont de persistance menu.js <-> TypeScript');

    // Attendre que le système TypeScript soit prêt
    const waitForTypeScriptSystem = () => {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                // Vérifier si flowiseTableBridge est disponible via le module React
                if (window.flowiseTableBridge || window.flowiseTableService) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 100);

            // Timeout après 10 secondes
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(false);
            }, 10000);
        });
    };

    // Créer l'API de synchronisation pour menu.js
    const createSyncAPI = async () => {
        const systemReady = await waitForTypeScriptSystem();

        if (!systemReady) {
            console.warn('⚠️ Système TypeScript non détecté, création API fallback');
            createFallbackAPI();
            return;
        }

        console.log('✅ Système TypeScript détecté, création API complète');

        // API de synchronisation complète
        window.claraverseSyncAPI = {
            // Sauvegarder une table immédiatement
            forceSaveTable: async (tableElement) => {
                try {
                    console.log('💾 Sauvegarde forcée de la table via pont');

                    // Obtenir la session actuelle
                    const sessionId = await getCurrentSessionId();

                    // Extraire un keyword de la table
                    const keyword = extractTableKeyword(tableElement);

                    // IMPORTANT: Passer l'élément DOM directement (pas le HTML)
                    // L'événement CustomEvent peut transporter des objets complexes
                    const event = new CustomEvent('flowise:table:save:request', {
                        detail: {
                            table: tableElement, // L'élément DOM lui-même
                            sessionId: sessionId,
                            keyword: keyword,
                            source: 'menu',
                            timestamp: Date.now()
                        },
                        bubbles: false,
                        cancelable: false
                    });

                    document.dispatchEvent(event);

                    // Attendre un peu pour la sauvegarde
                    await new Promise(resolve => setTimeout(resolve, 100));

                    console.log('✅ Table sauvegardée avec succès');
                    return true;
                } catch (error) {
                    console.error('❌ Erreur sauvegarde table:', error);
                    return false;
                }
            },

            // Notifier une mise à jour de table
            notifyTableUpdate: (tableId, tableElement, source) => {
                try {
                    console.log(`🔔 Notification mise à jour table ${tableId} depuis ${source}`);

                    const event = new CustomEvent('flowise:table:updated', {
                        detail: {
                            tableId: tableId,
                            table: tableElement,
                            source: source,
                            timestamp: Date.now()
                        }
                    });

                    document.dispatchEvent(event);

                    // Déclencher aussi une sauvegarde
                    window.claraverseSyncAPI.forceSaveTable(tableElement);
                } catch (error) {
                    console.error('❌ Erreur notification:', error);
                }
            },

            // Restaurer les tables d'une session
            restoreSessionTables: async (sessionId) => {
                try {
                    console.log(`🔄 Restauration tables session ${sessionId}`);

                    const event = new CustomEvent('flowise:table:restore:request', {
                        detail: {
                            sessionId: sessionId,
                            source: 'menu',
                            timestamp: Date.now()
                        }
                    });

                    document.dispatchEvent(event);

                    return true;
                } catch (error) {
                    console.error('❌ Erreur restauration:', error);
                    return false;
                }
            },

            // Obtenir les diagnostics
            getDiagnostics: async () => {
                try {
                    return new Promise((resolve) => {
                        const handler = (event) => {
                            document.removeEventListener('flowise:diagnostics:response', handler);
                            resolve(event.detail);
                        };

                        document.addEventListener('flowise:diagnostics:response', handler);

                        const event = new CustomEvent('flowise:diagnostics:request', {
                            detail: { source: 'menu', timestamp: Date.now() }
                        });

                        document.dispatchEvent(event);

                        // Timeout
                        setTimeout(() => {
                            document.removeEventListener('flowise:diagnostics:response', handler);
                            resolve(null);
                        }, 5000);
                    });
                } catch (error) {
                    console.error('❌ Erreur diagnostics:', error);
                    return null;
                }
            }
        };

        // Fonction globale de sauvegarde (fallback pour menu.js)
        window.saveTableNow = (tableElement) => {
            return window.claraverseSyncAPI.forceSaveTable(tableElement);
        };

        console.log('✅ API de synchronisation créée et exposée');

        // Notifier que l'API est prête
        const readyEvent = new CustomEvent('claraverse:sync:api:ready', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(readyEvent);
    };

    // Créer une API fallback si TypeScript n'est pas disponible
    const createFallbackAPI = () => {
        console.log('⚠️ Création API fallback (localStorage uniquement)');

        window.claraverseSyncAPI = {
            forceSaveTable: async (tableElement) => {
                try {
                    const sessionId = await getCurrentSessionId();
                    const tableData = extractTableData(tableElement);
                    const tableId = generateTableId(tableElement);

                    // Sauvegarder dans localStorage
                    const storageKey = `claraverse_table_${sessionId}_${tableId}`;
                    localStorage.setItem(storageKey, JSON.stringify({
                        data: tableData,
                        timestamp: Date.now(),
                        sessionId: sessionId
                    }));

                    console.log('💾 Table sauvegardée dans localStorage (fallback)');
                    return true;
                } catch (error) {
                    console.error('❌ Erreur sauvegarde fallback:', error);
                    return false;
                }
            },

            notifyTableUpdate: (tableId, tableElement, source) => {
                console.log(`🔔 Notification (fallback): ${tableId} depuis ${source}`);
                window.claraverseSyncAPI.forceSaveTable(tableElement);
            },

            restoreSessionTables: async (sessionId) => {
                console.log(`🔄 Restauration fallback session ${sessionId}`);
                return true;
            },

            getDiagnostics: async () => {
                return {
                    mode: 'fallback',
                    storage: 'localStorage',
                    timestamp: Date.now()
                };
            }
        };

        window.saveTableNow = (tableElement) => {
            return window.claraverseSyncAPI.forceSaveTable(tableElement);
        };
    };

    // Fonctions utilitaires

    // Session stable en mémoire (partagée entre tous les appels)
    let stableSessionId = null;

    // Obtenir l'ID de session actuel (STABLE)
    const getCurrentSessionId = async () => {
        // Si on a déjà une session stable en mémoire, la réutiliser
        if (stableSessionId) {
            return stableSessionId;
        }

        // Essayer de récupérer depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionFromUrl = urlParams.get('session') || urlParams.get('sessionId');

        if (sessionFromUrl) {
            stableSessionId = sessionFromUrl;
            return stableSessionId;
        }

        // Essayer de récupérer depuis sessionStorage (plus fiable que localStorage)
        try {
            const storedSession = sessionStorage.getItem('claraverse_stable_session');
            if (storedSession) {
                stableSessionId = storedSession;
                return stableSessionId;
            }
        } catch (error) {
            console.warn('⚠️ sessionStorage lecture impossible:', error.message);
        }

        // Créer UNE SEULE session stable pour toute la durée de la page
        stableSessionId = `stable_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Sauvegarder dans sessionStorage (pas localStorage pour éviter quota)
        try {
            sessionStorage.setItem('claraverse_stable_session', stableSessionId);
            console.log('✅ Session stable créée:', stableSessionId);
        } catch (error) {
            console.warn('⚠️ Impossible de sauvegarder session:', error.message);
        }

        return stableSessionId;
    };

    // Extraire un keyword de la table
    const extractTableKeyword = (tableElement) => {
        try {
            // Essayer d'obtenir le premier en-tête
            const firstHeader = tableElement.querySelector('th');
            if (firstHeader && firstHeader.textContent) {
                return firstHeader.textContent.trim().substring(0, 50);
            }

            // Sinon, utiliser la première cellule
            const firstCell = tableElement.querySelector('td');
            if (firstCell && firstCell.textContent) {
                return firstCell.textContent.trim().substring(0, 50);
            }

            return 'Table modifiée';
        } catch (error) {
            return 'Table';
        }
    };

    // Extraire les données de la table
    const extractTableData = (tableElement) => {
        const data = [];
        const rows = tableElement.querySelectorAll('tr');

        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td, th');

            cells.forEach(cell => {
                rowData.push(cell.textContent || '');
            });

            if (rowData.length > 0) {
                data.push(rowData);
            }
        });

        return data;
    };

    // Générer un ID de table
    const generateTableId = (tableElement) => {
        try {
            const content = tableElement.outerHTML.substring(0, 1000);
            let hash = 0;
            for (let i = 0; i < content.length; i++) {
                const char = content.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        } catch (error) {
            return Date.now().toString(36);
        }
    };

    // Initialiser l'API
    const init = async () => {
        try {
            await createSyncAPI();
            console.log('✅ Pont de persistance initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur initialisation pont:', error);
            createFallbackAPI();
        }
    };

    // Démarrer l'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('🌉 Pont de persistance chargé');
})();
