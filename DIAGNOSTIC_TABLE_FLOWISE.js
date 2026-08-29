// ═══════════════════════════════════════════════════════════════
// 🔍 DIAGNOSTIC - TROUVER LA TABLE FLOWISE SPÉCIFIQUEMENT
// ═══════════════════════════════════════════════════════════════
// COPIEZ-COLLEZ CE CODE DANS LA CONSOLE DE CLARAVERSE
// ═══════════════════════════════════════════════════════════════

(function () {
    console.log('%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
    console.log('%c🔍 RECHERCHE TABLE FLOWISE', 'color: #f59e0b; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');

    // Chercher TOUTES les tables avec en-tête "Flowise"
    const allTables = document.querySelectorAll('table');
    console.log(`\n📊 Total de tables: ${allTables.length}`);

    let flowiseTablesFound = 0;

    allTables.forEach((table, index) => {
        const headers = Array.from(table.querySelectorAll('th')).map(th =>
            th.textContent.trim().toLowerCase()
        );

        const hasFlowise = headers.some(h => h === 'flowise' || h.toLowerCase() === 'flowise');

        if (hasFlowise) {
            flowiseTablesFound++;
            console.log(`\n%c━━━ TABLE FLOWISE TROUVÉE! (Table ${index + 1}) ━━━`, 'color: #10b981; font-weight: bold');
            console.log('📋 En-têtes:', headers);

            // Extraire le contenu
            const rows = table.querySelectorAll('tr');
            console.log(`📊 Nombre de lignes: ${rows.length}`);

            rows.forEach((row, rowIndex) => {
                const cells = Array.from(row.querySelectorAll('td, th')).map(cell =>
                    cell.textContent.trim()
                );
                if (cells.length > 0) {
                    console.log(`   Ligne ${rowIndex}: [${cells.join(' | ')}]`);
                }
            });

            // Parent de la table
            let parent = table.parentElement;
            let parentChain = [];
            let level = 0;
            while (parent && level < 10) {
                const parentInfo = `${parent.tagName}${parent.className ? '.' + parent.className.split(' ').slice(0, 3).join('.') : ''}${parent.id ? '#' + parent.id : ''}`;
                parentChain.push(parentInfo);

                // Vérifier si c'est une div.prose
                if (parent.tagName === 'DIV' && parent.className.includes('prose')) {
                    console.log(`%c   ✅ Trouvée dans div.prose au niveau ${level}`, 'color: #10b981');
                }

                parent = parent.parentElement;
                level++;
            }
            console.log('   📦 Hiérarchie:', parentChain.join(' ← '));

            // Attributs
            const attrs = Array.from(table.attributes).map(a => `${a.name}="${a.value}"`);
            console.log('   🏷️ Attributs:', attrs.join(', '));

            console.log('   📍 Élément:', table);
        }
    });

    if (flowiseTablesFound === 0) {
        console.log('\n%c❌ AUCUNE TABLE FLOWISE TROUVÉE!', 'color: #ef4444; font-weight: bold');
        console.log('💡 La table est peut-être:');
        console.log('   • Hors de la vue (scrollez vers le haut/bas)');
        console.log('   • Dans un iframe');
        console.log('   • Pas encore chargée');
        console.log('   • Avec un en-tête différent');
    } else {
        console.log(`\n%c✅ ${flowiseTablesFound} table(s) Flowise trouvée(s)!`, 'color: #10b981; font-weight: bold');
    }

    console.log('\n%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
})();
