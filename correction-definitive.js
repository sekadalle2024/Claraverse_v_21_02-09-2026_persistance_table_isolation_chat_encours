/**
 * CORRECTION DÉFINITIVE POUR LE SYSTÈME DE RESTAURATION DE TABLES
 * 
 * Problème identifié : Les références DOM deviennent obsolètes après innerHTML
 * Solution : Re-sélectionner les éléments après restauration
 */

(function () {
    'use strict';

    console.log('🎯 Correction définitive chargée');

    // Attendre que le système soit chargé
    function waitForSystem() {
        if (typeof window.claraverseStorageAPI !== 'undefined') {
            console.log('✅ Système détecté, installation de la correction définitive...');
            installDefinitiveCorrection();
        } else {
            setTimeout(waitForSystem, 100);
        }
    }

    function installDefinitiveCorrection() {
        // Sauvegarder les méthodes originales
        const originalRestoreTable = window.claraverseStorageAPI.restoreTable;
        const originalRestoreTableHTML = window.restoreTableHTML;

        console.log('📋 Méthodes originales sauvegardées');

        // Fonction de correction avec re-sélection DOM
        function applyDOMReselectionFix(table, delay = 10) {
            setTimeout(() => {
                console.log('🎯 Application correction avec re-sélection DOM...');

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
                                    // RE-SÉLECTIONNER les cellules après innerHTML
                                    const currentCells = table.querySelectorAll('td, th');
                                    const savedCells = parsedTable.querySelectorAll('td, th');

                                    let correctedCells = 0;
                                    for (let i = 0; i < Math.min(currentCells.length, savedCells.length); i++) {
                                        const currentContent = currentCells[i].textContent;
                                        const savedContent = savedCells[i].textContent;

                                        // Corriger seulement si le contenu diffère
                                        if (currentContent !== savedContent) {
                                            currentCells[i].textContent = savedContent;
                                            correctedCells++;
                                            console.log(`🎯 Cellule ${i} corrigée: "${currentContent}" → "${savedContent}"`);
                                        }
                                    }

                                    if (correctedCells > 0) {
                                        console.log(`✅ Correction définitive appliquée: ${correctedCells} cellules`);
                                    } else {
                                        console.log(`✅ Aucune correction nécessaire (contenu déjà correct)`);
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ Erreur correction définitive:', error);
                }
            }, delay);
        }

        // Intercepter restoreTable
        window.claraverseStorageAPI.restoreTable = function (table) {
            console.log('🎯 INTERCEPTION: restoreTable avec correction définitive');

            // Appeler la méthode originale
            const result = originalRestoreTable.call(this, table);

            // Appliquer la correction avec re-sélection DOM
            if (result && table) {
                applyDOMReselectionFix(table, 10);
            }

            return result;
        };

        // Intercepter restoreTableHTML si elle existe
        if (originalRestoreTableHTML) {
            window.restoreTableHTML = function (table) {
                console.log('🎯 INTERCEPTION: restoreTableHTML avec correction définitive');

                // Appeler la méthode originale
                const result = originalRestoreTableHTML.call(this, table);

                // Appliquer la correction avec re-sélection DOM
                if (result && table) {
                    applyDOMReselectionFix(table, 10);
                }

                return result;
            };
        }

        console.log('✅ Correction définitive installée');

        // Exposer une fonction de test
        window.testCorrectionDefinitive = function () {
            console.log('🧪 Test de la correction définitive...');

            const table = document.querySelector('table');
            if (table) {
                const testContent = 'TEST_CORRECTION_DEFINITIVE_' + Date.now();

                // Simuler le processus
                const firstCell = table.querySelector('td');
                if (firstCell) {
                    firstCell.textContent = testContent;
                    window.claraverseStorageAPI.saveTable(table);

                    setTimeout(() => {
                        firstCell.textContent = 'TEMP_DEFINITIVE_TEST';
                        window.claraverseStorageAPI.restoreTable(table);

                        setTimeout(() => {
                            // RE-SÉLECTIONNER pour lire le bon contenu
                            const updatedCell = table.querySelector('td');
                            const finalContent = updatedCell.textContent;

                            if (finalContent === testContent) {
                                console.log('✅ Test correction définitive RÉUSSI !');
                            } else {
                                console.log(`❌ Test correction définitive ÉCHOUÉ: "${finalContent}"`);
                            }
                        }, 50);
                    }, 100);
                }
            }
        };
    }

    // Démarrer l'installation
    waitForSystem();

})();