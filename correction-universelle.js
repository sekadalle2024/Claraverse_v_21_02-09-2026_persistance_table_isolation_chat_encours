/**
 * CORRECTION UNIVERSELLE POUR TOUS LES SYSTÈMES DE RESTAURATION
 * 
 * Cette correction fonctionne avec :
 * - L'ancien système (conso.js) avec IDs comme table_x213wv
 * - Le nouveau système (menu_storage.js) avec IDs robustes
 * - Tous les autres systèmes de restauration
 */

(function () {
    'use strict';

    console.log('🌍 Correction universelle chargée');

    // Fonction de correction universelle avec re-sélection DOM
    function applyUniversalCorrection(table, delay = 50) {
        setTimeout(() => {
            console.log('🌍 Application correction universelle...');

            try {
                // Essayer de trouver les données sauvegardées avec différents systèmes
                let savedHTML = null;
                let tableId = null;

                // 1. Essayer le nouveau système (robuste)
                const robustId = table.getAttribute('data-robust-table-id');
                if (robustId) {
                    const robustData = localStorage.getItem(robustId);
                    if (robustData) {
                        try {
                            const parsed = JSON.parse(robustData);
                            if (parsed.html) {
                                savedHTML = parsed.html;
                                tableId = robustId;
                                console.log('🌍 Données trouvées avec système robuste');
                            }
                        } catch (e) { }
                    }
                }

                // 2. Essayer l'ancien système (conso.js)
                if (!savedHTML) {
                    const oldId = table.getAttribute('data-menu-table-id') || table.id;
                    if (oldId) {
                        // Chercher dans les données de l'ancien système
                        const keys = Object.keys(localStorage);
                        for (const key of keys) {
                            if (key.includes(oldId) || key.includes('claraverse')) {
                                try {
                                    const data = localStorage.getItem(key);
                                    const parsed = JSON.parse(data);

                                    // Vérifier si c'est des données de table
                                    if (parsed && (parsed.html || parsed.content || parsed.tableData)) {
                                        savedHTML = parsed.html || parsed.content;
                                        tableId = key;
                                        console.log(`🌍 Données trouvées avec ancien système: ${key}`);
                                        break;
                                    }
                                } catch (e) { }
                            }
                        }
                    }
                }

                // 3. Essayer de reconstruire depuis les données consolidées
                if (!savedHTML) {
                    const consolidatedData = localStorage.getItem('claraverse_consolidated_data');
                    if (consolidatedData) {
                        try {
                            const parsed = JSON.parse(consolidatedData);
                            if (parsed.tables) {
                                // Chercher la table correspondante
                                for (const [id, tableData] of Object.entries(parsed.tables)) {
                                    if (table.id === id || table.getAttribute('data-menu-table-id') === id) {
                                        if (tableData.html || tableData.content) {
                                            savedHTML = tableData.html || tableData.content;
                                            tableId = id;
                                            console.log(`🌍 Données trouvées dans consolidation: ${id}`);
                                            break;
                                        }
                                    }
                                }
                            }
                        } catch (e) { }
                    }
                }

                // Appliquer la correction si des données sont trouvées
                if (savedHTML && tableId) {
                    console.log(`🌍 Application correction pour: ${tableId}`);

                    // Parser le HTML sauvegardé
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(savedHTML, 'text/html');
                    const parsedTable = doc.querySelector('table');

                    if (parsedTable) {
                        // RE-SÉLECTIONNER les cellules après innerHTML (la clé du succès)
                        const currentCells = table.querySelectorAll('td, th');
                        const savedCells = parsedTable.querySelectorAll('td, th');

                        let correctedCells = 0;
                        for (let i = 0; i < Math.min(currentCells.length, savedCells.length); i++) {
                            const currentContent = currentCells[i].textContent;
                            const savedContent = savedCells[i].textContent;

                            // Corriger seulement si le contenu diffère significativement
                            if (currentContent !== savedContent && savedContent.trim() !== '') {
                                currentCells[i].textContent = savedContent;
                                correctedCells++;
                                console.log(`🌍 Cellule ${i} corrigée: "${currentContent}" → "${savedContent}"`);
                            }
                        }

                        if (correctedCells > 0) {
                            console.log(`✅ Correction universelle appliquée: ${correctedCells} cellules`);
                        } else {
                            console.log(`✅ Aucune correction nécessaire (contenu déjà correct)`);
                        }
                    }
                } else {
                    console.log('🌍 Aucune donnée sauvegardée trouvée pour cette table');
                }

            } catch (error) {
                console.error('❌ Erreur correction universelle:', error);
            }
        }, delay);
    }

    // Attendre que tous les systèmes soient chargés
    function waitForSystems() {
        const checkInterval = setInterval(() => {
            const hasNewSystem = typeof window.claraverseStorageAPI !== 'undefined';
            const hasOldSystem = typeof window.claraverseSyncAPI !== 'undefined' ||
                document.querySelector('[data-menu-table-id]') !== null;

            if (hasNewSystem || hasOldSystem) {
                clearInterval(checkInterval);
                installUniversalCorrection();
            }
        }, 100);

        // Timeout après 5 secondes
        setTimeout(() => {
            clearInterval(checkInterval);
            installUniversalCorrection();
        }, 5000);
    }

    function installUniversalCorrection() {
        console.log('🌍 Installation correction universelle...');

        // Intercepter le nouveau système si disponible
        if (window.claraverseStorageAPI && window.claraverseStorageAPI.restoreTable) {
            const originalRestore = window.claraverseStorageAPI.restoreTable;

            window.claraverseStorageAPI.restoreTable = function (table) {
                console.log('🌍 INTERCEPTION: Nouveau système');
                const result = originalRestore.call(this, table);
                if (result && table) {
                    applyUniversalCorrection(table, 20);
                }
                return result;
            };

            console.log('✅ Nouveau système intercepté');
        }

        // Intercepter l'ancien système si disponible
        if (window.restoreTableHTML) {
            const originalRestoreHTML = window.restoreTableHTML;

            window.restoreTableHTML = function (table) {
                console.log('🌍 INTERCEPTION: Ancien système HTML');
                const result = originalRestoreHTML.call(this, table);
                if (result && table) {
                    applyUniversalCorrection(table, 20);
                }
                return result;
            };

            console.log('✅ Ancien système HTML intercepté');
        }

        // Observer les changements DOM pour détecter les restaurations automatiques
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Chercher les tables dans les nouveaux éléments
                            const tables = node.tagName === 'TABLE' ? [node] : node.querySelectorAll('table');
                            tables.forEach((table) => {
                                // Vérifier si c'est une table ClaraVerse
                                if (table.id || table.getAttribute('data-menu-table-id') || table.getAttribute('data-robust-table-id')) {
                                    console.log('🌍 Table détectée par observer, application correction...');
                                    applyUniversalCorrection(table, 100);
                                }
                            });
                        }
                    });
                }
            });
        });

        // Observer le document entier
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Appliquer la correction aux tables existantes au chargement
        setTimeout(() => {
            const existingTables = document.querySelectorAll('table[id], table[data-menu-table-id], table[data-robust-table-id]');
            console.log(`🌍 Application correction aux ${existingTables.length} tables existantes`);

            existingTables.forEach((table, index) => {
                setTimeout(() => {
                    applyUniversalCorrection(table, 10);
                }, index * 50); // Étaler les corrections
            });
        }, 1000);

        console.log('✅ Correction universelle installée');

        // Exposer une fonction de test
        window.testCorrectionUniverselle = function () {
            console.log('🧪 Test correction universelle...');
            const tables = document.querySelectorAll('table');
            console.log(`🧪 ${tables.length} tables trouvées`);

            tables.forEach((table, index) => {
                if (table.id || table.getAttribute('data-menu-table-id') || table.getAttribute('data-robust-table-id')) {
                    console.log(`🧪 Test table ${index + 1}: ${table.id || table.getAttribute('data-menu-table-id') || 'robuste'}`);
                    applyUniversalCorrection(table, 10);
                }
            });
        };
    }

    // Démarrer l'installation
    waitForSystems();

})();