/**
 * CORRECTION AUTOMATIQUE POUR LE SYSTÈME DE RESTAURATION DE TABLES
 * 
 * Ce script intercepte les appels de restauration et applique automatiquement
 * la correction différée pour éviter les problèmes d'interférence.
 */

(function () {
    'use strict';

    console.log('🔧 Correction automatique chargée');

    // Attendre que le système soit chargé
    function waitForSystem() {
        if (typeof window.claraverseStorageAPI !== 'undefined') {
            console.log('✅ Système détecté, installation de la correction...');
            installCorrection();
        } else {
            setTimeout(waitForSystem, 100);
        }
    }

    function installCorrection() {
        // Sauvegarder les méthodes originales
        const originalRestoreTable = window.claraverseStorageAPI.restoreTable;
        const originalRestoreTableHTML = window.restoreTableHTML;

        console.log('📋 Méthodes originales sauvegardées');

        // Fonction de correction différée
        function applyDelayedCorrection(table, delay = 50) {
            setTimeout(() => {
                console.log('🔧 Application correction différée...');

                try {
                    const tableId = table.getAttribute('data-robust-table-id');
                    if (tableId) {
                        const savedDataStr = localStorage.getItem(tableId);
                        if (savedDataStr) {
                            const savedData = JSON.parse(savedDataStr);
                            if (savedData.html) {
                                // Parser le HTML sauvegardé
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(savedData.html, 'text/html');
                                const parsedTable = doc.querySelector('table');

                                if (parsedTable) {
                                    // Copier cellule par cellule
                                    const originalCells = table.querySelectorAll('td, th');
                                    const restoredCells = parsedTable.querySelectorAll('td, th');

                                    let correctedCells = 0;
                                    for (let i = 0; i < Math.min(originalCells.length, restoredCells.length); i++) {
                                        const currentContent = originalCells[i].textContent;
                                        const restoredContent = restoredCells[i].textContent;

                                        // Ne corriger que si le contenu semble temporaire
                                        if (currentContent.startsWith('TEMP') || currentContent.startsWith('CONTENU_TEMPORAIRE')) {
                                            originalCells[i].textContent = restoredContent;
                                            correctedCells++;
                                            console.log(`🔧 Cellule ${i} corrigée: "${currentContent}" → "${restoredContent}"`);
                                        }
                                    }

                                    if (correctedCells > 0) {
                                        console.log(`✅ Correction automatique appliquée: ${correctedCells} cellules`);
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ Erreur correction automatique:', error);
                }
            }, delay);
        }

        // Intercepter restoreTable
        window.claraverseStorageAPI.restoreTable = function (table) {
            console.log('🕵️ INTERCEPTION: restoreTable appelée');

            // Appeler la méthode originale
            const result = originalRestoreTable.call(this, table);

            // Appliquer la correction différée
            if (result && table) {
                applyDelayedCorrection(table, 50);
            }

            return result;
        };

        // Intercepter restoreTableHTML si elle existe
        if (originalRestoreTableHTML) {
            window.restoreTableHTML = function (table) {
                console.log('🕵️ INTERCEPTION: restoreTableHTML appelée');

                // Appeler la méthode originale
                const result = originalRestoreTableHTML.call(this, table);

                // Appliquer la correction différée
                if (result && table) {
                    applyDelayedCorrection(table, 50);
                }

                return result;
            };
        }

        console.log('✅ Correction automatique installée');

        // Exposer une fonction de test
        window.testCorrectionAutomatique = function () {
            console.log('🧪 Test de la correction automatique...');

            const table = document.querySelector('table');
            if (table) {
                const firstCell = table.querySelector('td');
                if (firstCell) {
                    const testContent = 'TEST_CORRECTION_AUTO_' + Date.now();

                    // Simuler le processus
                    firstCell.textContent = testContent;
                    window.claraverseStorageAPI.saveTable(table);

                    setTimeout(() => {
                        firstCell.textContent = 'TEMP_AUTO_TEST';
                        window.claraverseStorageAPI.restoreTable(table);

                        setTimeout(() => {
                            const finalContent = firstCell.textContent;
                            if (finalContent === testContent) {
                                console.log('✅ Test correction automatique RÉUSSI !');
                            } else {
                                console.log(`❌ Test correction automatique ÉCHOUÉ: "${finalContent}"`);
                            }
                        }, 200);
                    }, 100);
                }
            }
        };
    }

    // Démarrer l'installation
    waitForSystem();

})();