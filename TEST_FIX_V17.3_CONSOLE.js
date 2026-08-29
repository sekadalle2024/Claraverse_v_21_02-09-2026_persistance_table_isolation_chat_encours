// ═══════════════════════════════════════════════════════════════
// 🧪 TEST FIX V17.3 - VÉRIFICATION COLONNE FLOWISE
// ═══════════════════════════════════════════════════════════════
// COPIEZ-COLLEZ CE CODE DANS LA CONSOLE DE CLARAVERSE
// ═══════════════════════════════════════════════════════════════

(function () {
    console.log('%c═══════════════════════════════════════', 'color: #10b981; font-weight: bold');
    console.log('%c🧪 TEST FIX V17.3 - COLONNE FLOWISE', 'color: #10b981; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #10b981; font-weight: bold');

    // ⭐ Utiliser le bon sélecteur pour Claraverse
    const allDivs = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none');
    console.log(`\n📊 Divs trouvées: ${allDivs.length}`);

    allDivs.forEach((div, divIndex) => {
        console.log(`\n%c━━━ DIV ${divIndex + 1} ━━━`, 'color: #3b82f6; font-weight: bold');

        const firstTable = div.querySelector('table');
        if (!firstTable) {
            console.log('⏭️ Pas de table');
            return;
        }

        // Étape 1: Vérifier les en-têtes
        const headers = Array.from(firstTable.querySelectorAll('th')).map(th =>
            th.textContent.trim().toLowerCase()
        );

        console.log('📋 En-têtes:', headers);

        const hasRubrique = headers.includes('rubrique');
        const hasDescription = headers.includes('description');

        console.log(`   • A "rubrique": ${hasRubrique ? '✅' : '❌'}`);
        console.log(`   • A "description": ${hasDescription ? '✅' : '❌'}`);

        if (!hasRubrique || !hasDescription) {
            console.log('⏭️ Pas d\'en-têtes requis, ignorée');
            return;
        }

        // Étape 2: Chercher la colonne Flowise
        const flowiseIndex = headers.findIndex(h =>
            h === 'flowise' || h === 'FLOWISE' || h.toLowerCase() === 'flowise'
        );

        console.log(`\n🔍 Index colonne Flowise: ${flowiseIndex}`);

        if (flowiseIndex === -1) {
            console.log('⚠️ Colonne "Flowise" non trouvée');
            return;
        }

        // Étape 3: Extraire les cellules de la colonne Flowise
        const rows = firstTable.querySelectorAll('tr');
        const flowiseCells = [];

        rows.forEach((row, rowIndex) => {
            if (rowIndex === 0) return; // Skip header
            const cells = row.querySelectorAll('td');
            if (cells[flowiseIndex]) {
                flowiseCells.push(cells[flowiseIndex].textContent.trim());
            }
        });

        console.log(`📊 Cellules dans colonne Flowise (${flowiseCells.length}):`, flowiseCells);

        // Étape 4: Chercher le mot-clé "CIA" (exemple)
        const keyword = 'CIA';
        const keywordFound = flowiseCells.some(cellText =>
            cellText.toLowerCase().includes(keyword.toLowerCase())
        );

        console.log(`\n🎯 Mot-clé "${keyword}" trouvé: ${keywordFound ? '✅' : '❌'}`);

        if (keywordFound) {
            const allTables = div.querySelectorAll('table');
            console.log(`\n%c✅ COLLECTE: ${allTables.length} table(s)`, 'color: #10b981; font-weight: bold');

            allTables.forEach((table, tableIndex) => {
                const tableHeaders = Array.from(table.querySelectorAll('th')).map(th =>
                    th.textContent.trim()
                );
                console.log(`   📋 Table ${tableIndex + 1}: [${tableHeaders.join(', ')}]`);
            });
        } else {
            console.log('%c⏭️ Pas de collecte (mot-clé absent)', 'color: #f59e0b');
        }
    });

    console.log('\n%c═══════════════════════════════════════', 'color: #10b981; font-weight: bold');
    console.log('%c✅ TEST TERMINÉ', 'color: #10b981; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #10b981; font-weight: bold');
})();
