/**
 * Script de diagnostic pour Examen CIA
 * Identifie les problèmes de fusion et de persistance
 */

(function () {
    console.log("🔍 DIAGNOSTIC EXAMEN CIA - Démarrage");

    // Attendre que le script examen_cia soit chargé
    setTimeout(() => {
        console.log("\n=== 1. VÉRIFICATION DU SCRIPT ===");
        console.log("Script examen_cia chargé:", typeof window.examenCIA !== 'undefined');

        if (window.examenCIA) {
            const info = window.examenCIA.getInfo();
            console.log("Examens sauvegardés:", info.examCount);
            console.log("Taille des données:", info.dataSizeKB, "KB");
        }

        console.log("\n=== 2. VÉRIFICATION DES TABLES ===");
        const tables = document.querySelectorAll('[data-exam-table-id]');
        console.log("Nombre de tables d'examen:", tables.length);

        tables.forEach((table, index) => {
            const tableId = table.dataset.examTableId;
            console.log(`\nTable ${index + 1}: ${tableId}`);

            // Vérifier les en-têtes
            const headers = table.querySelectorAll('thead th, thead td, tr:first-child th, tr:first-child td');
            console.log("  En-têtes:", Array.from(headers).map(h => h.textContent.trim()));

            // Vérifier les checkboxes
            const checkboxes = table.querySelectorAll('.exam-cia-checkbox');
            console.log("  Checkboxes trouvées:", checkboxes.length);

            checkboxes.forEach((cb, i) => {
                if (cb.checked) {
                    console.log(`    ✓ Checkbox ${i + 1} cochée`);
                }
            });

            // Vérifier les cellules fusionnées
            const mergedCells = table.querySelectorAll('[data-merged="true"]');
            console.log("  Cellules marquées comme fusionnées:", mergedCells.length);

            const rowspanCells = table.querySelectorAll('[rowspan]');
            console.log("  Cellules avec rowspan:", rowspanCells.length);

            rowspanCells.forEach((cell, i) => {
                console.log(`    Cellule ${i + 1}: rowspan=${cell.rowSpan}, contenu="${cell.textContent.trim().substring(0, 30)}..."`);
            });
        });

        console.log("\n=== 3. VÉRIFICATION LOCALSTORAGE ===");
        const data = localStorage.getItem('claraverse_examen_cia');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                console.log("Données trouvées dans localStorage:");
                Object.keys(parsed).forEach(key => {
                    console.log(`  ${key}:`);
                    console.log(`    Lignes:`, parsed[key].rows?.length || 0);
                    console.log(`    Dernière sauvegarde:`, parsed[key].lastSaved);

                    // Compter les checkboxes cochées
                    let checkedCount = 0;
                    if (parsed[key].rows) {
                        parsed[key].rows.forEach(row => {
                            row.forEach(cell => {
                                if (cell.type === 'checkbox' && cell.checked) {
                                    checkedCount++;
                                }
                            });
                        });
                    }
                    console.log(`    Checkboxes cochées:`, checkedCount);
                });
            } catch (e) {
                console.error("Erreur parsing localStorage:", e);
            }
        } else {
            console.log("Aucune donnée dans localStorage");
        }

        console.log("\n=== 4. TEST DE FUSION ===");
        tables.forEach((table, index) => {
            console.log(`\nTable ${index + 1}:`);

            const tbody = table.querySelector('tbody') || table;
            const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.querySelector('th'));

            if (rows.length > 0) {
                // Vérifier chaque colonne
                const firstRow = rows[0];
                const cellCount = firstRow.querySelectorAll('td').length;

                for (let colIndex = 0; colIndex < cellCount; colIndex++) {
                    const values = rows.map(row => {
                        const cell = row.querySelectorAll('td')[colIndex];
                        return cell ? cell.textContent.trim() : '';
                    });

                    const allSame = values.every(v => v === values[0]);
                    const isEmpty = values[0] === '';

                    if (allSame && !isEmpty && values.length > 1) {
                        console.log(`  Colonne ${colIndex}: DEVRAIT être fusionnée`);
                        console.log(`    Valeur: "${values[0].substring(0, 30)}..."`);
                        console.log(`    Nombre de lignes: ${values.length}`);

                        // Vérifier si elle est effectivement fusionnée
                        const firstCell = rows[0].querySelectorAll('td')[colIndex];
                        if (firstCell && firstCell.rowSpan > 1) {
                            console.log(`    ✅ Fusionnée (rowspan=${firstCell.rowSpan})`);
                        } else {
                            console.log(`    ❌ NON fusionnée`);
                        }
                    }
                }
            }
        });

        console.log("\n=== 5. TEST DE PERSISTANCE ===");
        console.log("Pour tester la persistance:");
        console.log("1. Cochez une checkbox");
        console.log("2. Attendez 1 seconde");
        console.log("3. Exécutez: diagnosticExamenCIA.verifierSauvegarde()");
        console.log("4. Actualisez la page");
        console.log("5. Exécutez: diagnosticExamenCIA.verifierRestauration()");

    }, 3000);

    // API de diagnostic
    window.diagnosticExamenCIA = {
        verifierSauvegarde: function () {
            console.log("\n🔍 VÉRIFICATION SAUVEGARDE");
            const data = localStorage.getItem('claraverse_examen_cia');
            if (data) {
                const parsed = JSON.parse(data);
                console.log("✅ Données sauvegardées:", parsed);

                Object.keys(parsed).forEach(key => {
                    let checkedCount = 0;
                    if (parsed[key].rows) {
                        parsed[key].rows.forEach((row, rowIndex) => {
                            row.forEach((cell, cellIndex) => {
                                if (cell.type === 'checkbox' && cell.checked) {
                                    checkedCount++;
                                    console.log(`  ✓ Checkbox cochée: ligne ${rowIndex + 1}, colonne ${cellIndex + 1}`);
                                }
                            });
                        });
                    }
                    console.log(`Total checkboxes cochées: ${checkedCount}`);
                });
            } else {
                console.log("❌ Aucune donnée sauvegardée");
            }
        },

        verifierRestauration: function () {
            console.log("\n🔍 VÉRIFICATION RESTAURATION");
            const tables = document.querySelectorAll('[data-exam-table-id]');

            tables.forEach((table, index) => {
                console.log(`\nTable ${index + 1}:`);
                const checkboxes = table.querySelectorAll('.exam-cia-checkbox');
                let checkedCount = 0;

                checkboxes.forEach((cb, i) => {
                    if (cb.checked) {
                        checkedCount++;
                        console.log(`  ✓ Checkbox ${i + 1} cochée`);
                    }
                });

                if (checkedCount > 0) {
                    console.log(`✅ ${checkedCount} checkbox(es) restaurée(s)`);
                } else {
                    console.log(`❌ Aucune checkbox restaurée`);
                }
            });
        },

        forcerFusion: function () {
            console.log("\n🔧 FORCER LA FUSION");
            const tables = document.querySelectorAll('[data-exam-table-id]');

            tables.forEach((table, tableIndex) => {
                console.log(`\nTable ${tableIndex + 1}:`);
                const tbody = table.querySelector('tbody') || table;
                const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.querySelector('th'));

                if (rows.length > 0) {
                    const firstRow = rows[0];
                    const cellCount = firstRow.querySelectorAll('td').length;

                    for (let colIndex = 0; colIndex < cellCount; colIndex++) {
                        const cells = rows.map(row => row.querySelectorAll('td')[colIndex]);
                        const values = cells.map(cell => cell ? cell.textContent.trim() : '');

                        const allSame = values.every(v => v === values[0]);
                        const isEmpty = values[0] === '';

                        if (allSame && !isEmpty && values.length > 1) {
                            const firstCell = cells[0];

                            if (firstCell && firstCell.rowSpan === 1) {
                                console.log(`  Fusion colonne ${colIndex}: "${values[0].substring(0, 30)}..."`);

                                firstCell.rowSpan = rows.length;
                                firstCell.style.verticalAlign = "middle";
                                firstCell.style.textAlign = "center";
                                firstCell.style.fontWeight = "bold";
                                firstCell.style.padding = "12px";

                                for (let i = 1; i < cells.length; i++) {
                                    if (cells[i]) {
                                        cells[i].style.display = "none";
                                        cells[i].setAttribute("data-merged", "true");
                                    }
                                }

                                console.log(`  ✅ Colonne ${colIndex} fusionnée`);
                            }
                        }
                    }
                }
            });
        },

        forcerRestauration: function () {
            console.log("\n🔧 FORCER LA RESTAURATION");

            if (window.examenCIA && window.examenCIA.manager) {
                const allData = window.examenCIA.manager.loadAllData();
                const examIds = Object.keys(allData);

                console.log(`Tentative de restauration de ${examIds.length} examen(s)`);

                examIds.forEach(examId => {
                    window.examenCIA.manager.restoreExamData(examId);
                });
            } else {
                console.log("❌ Manager non disponible");
            }
        },

        afficherTout: function () {
            this.verifierSauvegarde();
            this.verifierRestauration();
        }
    };

    console.log("\n✅ Diagnostic chargé. Commandes disponibles:");
    console.log("  diagnosticExamenCIA.verifierSauvegarde()");
    console.log("  diagnosticExamenCIA.verifierRestauration()");
    console.log("  diagnosticExamenCIA.forcerFusion()");
    console.log("  diagnosticExamenCIA.forcerRestauration()");
    console.log("  diagnosticExamenCIA.afficherTout()");
})();
