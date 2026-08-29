/**
 * SOLUTION COMPLÈTE SAUVEGARDE ET RESTAURATION
 * 
 * Résout définitivement le problème des anciennes tables dans le chat :
 * - Détection automatique des modifications
 * - Sauvegarde immédiate et persistante
 * - Restauration correcte après actualisation
 * - Compatible avec tous les systèmes (ancien et nouveau)
 */

(function () {
    'use strict';

    console.log('🔧 Solution complète sauvegarde/restauration chargée');

    let isInitialized = false;
    let observedTables = new Set();
    let saveTimeouts = new Map();

    // Configuration
    const CONFIG = {
        AUTO_SAVE_DELAY: 1000,    // 1 seconde après modification
        IMMEDIATE_SAVE_DELAY: 100, // Sauvegarde immédiate
        MAX_RETRIES: 3,
        STORAGE_PREFIX: 'claraverse_complete_'
    };

    // Fonction pour générer un ID stable et unique
    function generateStableTableId(table) {
        // Priorité aux IDs existants
        let id = table.id ||
            table.getAttribute('data-menu-table-id') ||
            table.getAttribute('data-robust-table-id') ||
            table.getAttribute('data-complete-table-id');

        if (!id) {
            // Générer un ID basé sur le contenu et la position dans le DOM
            const textContent = table.textContent.replace(/\s+/g, ' ').trim();
            const contentHash = textContent.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
            const position = Array.from(document.querySelectorAll('table')).indexOf(table);
            const timestamp = Date.now();

            id = `table_complete_${contentHash}_${position}_${timestamp}`;

            // Stocker l'ID sur la table
            table.setAttribute('data-complete-table-id', id);
            console.log(`🆔 Nouvel ID généré: ${id}`);
        }

        return id;
    }

    // Fonction de sauvegarde complète et robuste
    function saveTableComplete(table, immediate = false) {
        try {
            const tableId = generateStableTableId(table);
            const timestamp = new Date().toISOString();

            console.log(`💾 Sauvegarde ${immediate ? 'immédiate' : 'différée'} table: ${tableId}`);

            // Préparer les données complètes
            const tableData = {
                id: tableId,
                html: table.outerHTML,
                innerHTML: table.innerHTML,
                textContent: table.textContent,
                timestamp: timestamp,
                version: 'complete_v1.0',

                // Métadonnées pour validation
                metadata: {
                    rowCount: table.querySelectorAll('tr').length,
                    cellCount: table.querySelectorAll('td, th').length,
                    hasHeaders: table.querySelector('th') !== null,
                    isEditable: table.hasAttribute('contenteditable') ||
                        table.querySelector('[contenteditable]') !== null
                },

                // Données cellule par cellule pour restauration précise
                cellData: Array.from(table.querySelectorAll('td, th')).map((cell, index) => ({
                    index: index,
                    content: cell.textContent,
                    innerHTML: cell.innerHTML,
                    tagName: cell.tagName
                }))
            };

            // Sauvegarder avec multiple stratégies
            const storageKey = `${CONFIG.STORAGE_PREFIX}${tableId}`;

            // Stratégie 1: localStorage direct
            try {
                localStorage.setItem(storageKey, JSON.stringify(tableData));
                console.log(`✅ Sauvegarde directe réussie: ${storageKey}`);
            } catch (e) {
                console.warn('⚠️ Échec sauvegarde directe:', e.message);
            }

            // Stratégie 2: Sauvegarde dans données consolidées
            try {
                let consolidatedData = {};
                const existingData = localStorage.getItem('claraverse_complete_data');
                if (existingData) {
                    consolidatedData = JSON.parse(existingData);
                }

                if (!consolidatedData.tables) {
                    consolidatedData.tables = {};
                }

                consolidatedData.tables[tableId] = tableData;
                consolidatedData.lastUpdate = timestamp;
                consolidatedData.version = 'complete_v1.0';

                localStorage.setItem('claraverse_complete_data', JSON.stringify(consolidatedData));
                console.log(`✅ Sauvegarde consolidée réussie`);
            } catch (e) {
                console.warn('⚠️ Échec sauvegarde consolidée:', e.message);
            }

            // Stratégie 3: Compatibilité avec ancien système
            try {
                if (table.getAttribute('data-menu-table-id')) {
                    const oldKey = table.getAttribute('data-menu-table-id');
                    localStorage.setItem(oldKey, JSON.stringify({
                        html: table.outerHTML,
                        content: table.innerHTML,
                        timestamp: timestamp
                    }));
                    console.log(`✅ Sauvegarde compatibilité ancienne: ${oldKey}`);
                }
            } catch (e) {
                console.warn('⚠️ Échec sauvegarde compatibilité:', e.message);
            }

            // Indicateur visuel de sauvegarde
            table.style.boxShadow = '0 0 3px #28a745';
            table.setAttribute('data-last-saved', timestamp);

            setTimeout(() => {
                table.style.boxShadow = '';
            }, 800);

            return true;

        } catch (error) {
            console.error('❌ Erreur sauvegarde complète:', error);

            // Indicateur visuel d'erreur
            table.style.boxShadow = '0 0 3px #dc3545';
            setTimeout(() => {
                table.style.boxShadow = '';
            }, 1500);

            return false;
        }
    }

    // Fonction de restauration complète
    function restoreTableComplete(table) {
        try {
            const tableId = generateStableTableId(table);
            console.log(`🔄 Restauration complète table: ${tableId}`);

            let tableData = null;

            // Chercher les données sauvegardées
            // Stratégie 1: localStorage direct
            const storageKey = `${CONFIG.STORAGE_PREFIX}${tableId}`;
            try {
                const data = localStorage.getItem(storageKey);
                if (data) {
                    tableData = JSON.parse(data);
                    console.log(`📦 Données trouvées en direct: ${storageKey}`);
                }
            } catch (e) { }

            // Stratégie 2: données consolidées
            if (!tableData) {
                try {
                    const consolidatedData = localStorage.getItem('claraverse_complete_data');
                    if (consolidatedData) {
                        const parsed = JSON.parse(consolidatedData);
                        if (parsed.tables && parsed.tables[tableId]) {
                            tableData = parsed.tables[tableId];
                            console.log(`📦 Données trouvées en consolidé: ${tableId}`);
                        }
                    }
                } catch (e) { }
            }

            // Stratégie 3: compatibilité ancien système
            if (!tableData) {
                const oldId = table.getAttribute('data-menu-table-id') || table.id;
                if (oldId) {
                    try {
                        const data = localStorage.getItem(oldId);
                        if (data) {
                            const parsed = JSON.parse(data);
                            if (parsed.html || parsed.content) {
                                tableData = {
                                    html: parsed.html,
                                    innerHTML: parsed.content || parsed.html,
                                    version: 'legacy'
                                };
                                console.log(`📦 Données trouvées en legacy: ${oldId}`);
                            }
                        }
                    } catch (e) { }
                }
            }

            // Appliquer la restauration si des données sont trouvées
            if (tableData) {
                console.log(`🔄 Application restauration...`);

                if (tableData.cellData && tableData.version === 'complete_v1.0') {
                    // Restauration précise cellule par cellule
                    const currentCells = table.querySelectorAll('td, th');
                    let restoredCells = 0;

                    tableData.cellData.forEach((cellData, index) => {
                        if (currentCells[index] && cellData.content !== currentCells[index].textContent) {
                            currentCells[index].textContent = cellData.content;
                            restoredCells++;
                        }
                    });

                    console.log(`✅ Restauration précise: ${restoredCells} cellules`);

                } else if (tableData.innerHTML) {
                    // Restauration par innerHTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(tableData.html || `<table>${tableData.innerHTML}</table>`, 'text/html');
                    const parsedTable = doc.querySelector('table');

                    if (parsedTable) {
                        const currentCells = table.querySelectorAll('td, th');
                        const savedCells = parsedTable.querySelectorAll('td, th');

                        let restoredCells = 0;
                        for (let i = 0; i < Math.min(currentCells.length, savedCells.length); i++) {
                            if (currentCells[i].textContent !== savedCells[i].textContent) {
                                currentCells[i].textContent = savedCells[i].textContent;
                                restoredCells++;
                            }
                        }

                        console.log(`✅ Restauration innerHTML: ${restoredCells} cellules`);
                    }
                }

                // Indicateur visuel de restauration
                table.style.boxShadow = '0 0 3px #17a2b8';
                setTimeout(() => {
                    table.style.boxShadow = '';
                }, 1000);

                return true;
            } else {
                console.log(`ℹ️ Aucune donnée sauvegardée trouvée pour: ${tableId}`);
                return false;
            }

        } catch (error) {
            console.error('❌ Erreur restauration complète:', error);
            return false;
        }
    }

    // Fonction pour observer les modifications d'une table
    function observeTable(table) {
        if (observedTables.has(table)) {
            return; // Déjà observée
        }

        const tableId = generateStableTableId(table);
        console.log(`👀 Observation table: ${tableId}`);
        observedTables.add(table);

        // Observer les mutations
        const observer = new MutationObserver((mutations) => {
            let hasContentChange = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' ||
                    mutation.type === 'characterData' ||
                    (mutation.type === 'attributes' &&
                        ['contenteditable', 'data-content'].includes(mutation.attributeName))) {
                    hasContentChange = true;
                }
            });

            if (hasContentChange) {
                console.log(`📝 Modification détectée: ${tableId}`);

                // Indicateur visuel de modification
                table.style.boxShadow = '0 0 3px #ffc107';

                // Programmer la sauvegarde
                if (saveTimeouts.has(table)) {
                    clearTimeout(saveTimeouts.get(table));
                }

                const timeout = setTimeout(() => {
                    saveTableComplete(table, false);
                    saveTimeouts.delete(table);
                }, CONFIG.AUTO_SAVE_DELAY);

                saveTimeouts.set(table, timeout);
            }
        });

        observer.observe(table, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['contenteditable', 'data-content']
        });

        // Observer les événements de saisie
        table.addEventListener('input', () => {
            console.log(`⌨️ Saisie détectée: ${tableId}`);

            if (saveTimeouts.has(table)) {
                clearTimeout(saveTimeouts.get(table));
            }

            const timeout = setTimeout(() => {
                saveTableComplete(table, false);
                saveTimeouts.delete(table);
            }, CONFIG.AUTO_SAVE_DELAY);

            saveTimeouts.set(table, timeout);
        });

        // Sauvegarde immédiate à la perte de focus
        table.addEventListener('blur', () => {
            console.log(`👁️ Perte de focus: ${tableId}`);

            if (saveTimeouts.has(table)) {
                clearTimeout(saveTimeouts.get(table));
                saveTimeouts.delete(table);
            }

            saveTableComplete(table, true);
        }, true);

        // Sauvegarde avant fermeture de page
        window.addEventListener('beforeunload', () => {
            saveTableComplete(table, true);
        });
    }

    // Fonction pour scanner et traiter toutes les tables
    function scanAndProcessTables() {
        const tables = document.querySelectorAll('table');
        console.log(`🔍 Scan: ${tables.length} tables trouvées`);

        tables.forEach((table) => {
            // Vérifier si c'est une table ClaraVerse ou dans le chat
            const isRelevantTable = table.id ||
                table.getAttribute('data-menu-table-id') ||
                table.getAttribute('data-robust-table-id') ||
                table.closest('[data-message-id]') || // Tables dans les messages
                table.closest('.prose') || // Tables dans le contenu
                table.closest('[class*="message"]'); // Tables dans les messages (classe générique)

            if (isRelevantTable) {
                // D'abord restaurer, puis observer
                setTimeout(() => {
                    restoreTableComplete(table);
                    observeTable(table);
                }, 50);
            }
        });
    }

    // Fonction d'initialisation principale
    function initCompleteSolution() {
        if (isInitialized) return;
        isInitialized = true;

        console.log('🚀 Initialisation solution complète sauvegarde/restauration');

        // Scanner les tables existantes
        scanAndProcessTables();

        // Observer l'ajout de nouvelles tables
        const documentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const tables = node.tagName === 'TABLE' ? [node] : node.querySelectorAll('table');
                            tables.forEach((table) => {
                                setTimeout(() => {
                                    restoreTableComplete(table);
                                    observeTable(table);
                                }, 100);
                            });
                        }
                    });
                }
            });
        });

        documentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Sauvegarde périodique de sécurité
        setInterval(() => {
            const tables = document.querySelectorAll('table[data-complete-table-id], table[data-menu-table-id], table[data-robust-table-id]');
            console.log(`🔄 Sauvegarde périodique: ${tables.length} tables`);

            tables.forEach((table) => {
                const lastSaved = table.getAttribute('data-last-saved');
                if (!lastSaved || (Date.now() - new Date(lastSaved).getTime()) > 5 * 60 * 1000) {
                    saveTableComplete(table, true);
                }
            });
        }, 2 * 60 * 1000); // Toutes les 2 minutes

        // Exposer les fonctions utiles
        window.saveAllTablesComplete = function () {
            const tables = document.querySelectorAll('table');
            console.log(`💾 Sauvegarde manuelle complète: ${tables.length} tables`);
            tables.forEach((table, index) => {
                setTimeout(() => {
                    saveTableComplete(table, true);
                }, index * 50);
            });
        };

        window.restoreAllTablesComplete = function () {
            const tables = document.querySelectorAll('table');
            console.log(`🔄 Restauration manuelle complète: ${tables.length} tables`);
            tables.forEach((table, index) => {
                setTimeout(() => {
                    restoreTableComplete(table);
                }, index * 50);
            });
        };

        window.testSolutionComplete = function () {
            console.log('🧪 Test solution complète');
            scanAndProcessTables();
        };

        console.log('✅ Solution complète sauvegarde/restauration initialisée');
    }

    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCompleteSolution);
    } else {
        setTimeout(initCompleteSolution, 100);
    }

    // Initialiser aussi après un délai pour être sûr
    setTimeout(initCompleteSolution, 1000);

})();