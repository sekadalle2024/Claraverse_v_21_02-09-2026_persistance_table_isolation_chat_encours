/**
 * Script Auto-Fix pour Examen CIA
 * Force la fusion des cellules et la restauration des checkboxes
 */

(function () {
    'use strict';

    console.log("🔧 [Auto-Fix CIA] Démarrage");

    // Fonction pour fusionner les cellules
    function fusionnerCellules() {
        const tables = document.querySelectorAll('[data-exam-table-id]');
        let fusionCount = 0;

        tables.forEach((table) => {
            const tbody = table.querySelector('tbody') || table;
            const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.querySelector('th'));

            if (rows.length > 1) {
                const firstRow = rows[0];
                const cellCount = firstRow.querySelectorAll('td').length;

                // Fusionner les 2 premières colonnes (Ref_question et Question)
                for (let colIndex = 0; colIndex < Math.min(2, cellCount); colIndex++) {
                    const cells = rows.map(row => row.querySelectorAll('td')[colIndex]);
                    const values = cells.map(cell => cell ? cell.textContent.trim() : '');

                    const allSame = values.every(v => v === values[0]);
                    const isEmpty = values[0] === '';

                    if (allSame && !isEmpty && values.length > 1) {
                        const firstCell = cells[0];

                        if (firstCell && firstCell.rowSpan === 1) {
                            firstCell.rowSpan = rows.length;
                            firstCell.style.verticalAlign = "middle";
                            firstCell.style.textAlign = "center";
                            firstCell.style.fontWeight = "bold";
                            firstCell.style.padding = "12px";

                            for (let i = 1; i < cells.length; i++) {
                                if (cells[i]) {
                                    cells[i].style.display = "none";
                                }
                            }

                            fusionCount++;
                        }
                    }
                }
            }
        });

        if (fusionCount > 0) {
            console.log(`✅ [Auto-Fix CIA] ${fusionCount} colonnes fusionnées`);
        }
    }

    // Fonction pour restaurer les checkboxes
    function restaurerCheckboxes() {
        const data = localStorage.getItem('claraverse_examen_cia');
        if (!data) {
            console.log("ℹ️ [Auto-Fix CIA] Aucune donnée à restaurer");
            return;
        }

        try {
            const parsed = JSON.parse(data);
            let restoredCount = 0;

            Object.keys(parsed).forEach(tableId => {
                const table = document.querySelector(`[data-exam-table-id="${tableId}"]`);
                if (!table) return;

                const examData = parsed[tableId];
                if (!examData.rows) return;

                const tbody = table.querySelector('tbody') || table;
                const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.querySelector('th'));

                rows.forEach((row, rowIndex) => {
                    if (examData.rows[rowIndex]) {
                        const cells = row.querySelectorAll('td');
                        cells.forEach((cell, cellIndex) => {
                            const cellData = examData.rows[rowIndex][cellIndex];
                            if (cellData && cellData.type === 'checkbox') {
                                const checkbox = cell.querySelector('.exam-cia-checkbox');
                                if (checkbox && cellData.checked) {
                                    checkbox.checked = true;
                                    restoredCount++;
                                }
                            }
                        });
                    }
                });
            });

            if (restoredCount > 0) {
                console.log(`✅ [Auto-Fix CIA] ${restoredCount} checkbox(es) restaurée(s)`);
            }
        } catch (error) {
            console.error("❌ [Auto-Fix CIA] Erreur restauration:", error);
        }
    }

    // Fonction principale
    function appliquerFixes() {
        const tables = document.querySelectorAll('[data-exam-table-id]');
        if (tables.length === 0) {
            console.log("⏳ [Auto-Fix CIA] En attente des tables...");
            return;
        }

        console.log(`🔧 [Auto-Fix CIA] Traitement de ${tables.length} table(s)`);
        fusionnerCellules();
        restaurerCheckboxes();
    }

    // Exécuter au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(appliquerFixes, 2000);
            setTimeout(appliquerFixes, 5000);
            setTimeout(appliquerFixes, 10000);
        });
    } else {
        setTimeout(appliquerFixes, 2000);
        setTimeout(appliquerFixes, 5000);
        setTimeout(appliquerFixes, 10000);
    }

    // Observer les changements DOM pour réappliquer les fixes
    const observer = new MutationObserver(() => {
        const tables = document.querySelectorAll('[data-exam-table-id]');
        if (tables.length > 0) {
            // Réappliquer les fixes si des tables sont détectées
            setTimeout(appliquerFixes, 1000);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Exposer une fonction globale pour forcer les fixes
    window.forcerFixesExamenCIA = function () {
        console.log("🔧 [Auto-Fix CIA] Forçage manuel des fixes");
        appliquerFixes();
    };

    console.log("✅ [Auto-Fix CIA] Script chargé - Les fixes seront appliqués automatiquement");
    console.log("💡 Utilisez window.forcerFixesExamenCIA() pour forcer manuellement");

})();
