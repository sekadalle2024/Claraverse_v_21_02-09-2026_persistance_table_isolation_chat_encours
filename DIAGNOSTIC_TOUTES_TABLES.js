// ═══════════════════════════════════════════════════════════════
// 🔍 DIAGNOSTIC - TROUVER TOUTES LES TABLES (MÊME HORS PROSE)
// ═══════════════════════════════════════════════════════════════
// COPIEZ-COLLEZ CE CODE DANS LA CONSOLE DE CLARAVERSE
// ═══════════════════════════════════════════════════════════════

(function () {
    console.log('%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
    console.log('%c🔍 DIAGNOSTIC TOUTES LES TABLES', 'color: #f59e0b; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');

    // Trouver TOUTES les tables dans la page
    const allTables = document.querySelectorAll('table');
    console.log(`\n📊 Total de tables dans la page: ${allTables.length}`);

    allTables.forEach((table, index) => {
        console.log(`\n%c━━━ TABLE ${index + 1} ━━━`, 'color: #3b82f6; font-weight: bold');

        // En-têtes
        const headers = Array.from(table.querySelectorAll('th')).map(th =>
            th.textContent.trim().toLowerCase()
        );
        console.log('📋 En-têtes:', headers);

        // Vérifier Rubrique + Description
        const hasRubrique = headers.includes('rubrique');
        const hasDescription = headers.includes('description');
        const hasFlowise = headers.some(h => h === 'flowise' || h.toLowerCase() === 'flowise');

        console.log(`   • A "rubrique": ${hasRubrique ? '✅' : '❌'}`);
        console.log(`   • A "description": ${hasDescription ? '✅' : '❌'}`);
        console.log(`   • A "flowise": ${hasFlowise ? '✅' : '❌'}`);

        if (hasRubrique && hasDescription) {
            console.log(`%c   🎯 TABLE CIBLE TROUVÉE!`, 'color: #10b981; font-weight: bold');
        }

        // Parent de la table
        let parent = table.parentElement;
        let parentChain = [];
        let level = 0;
        while (parent && level < 5) {
            const parentInfo = `${parent.tagName}${parent.className ? '.' + parent.className.split(' ').slice(0, 2).join('.') : ''}`;
            parentChain.push(parentInfo);
            parent = parent.parentElement;
            level++;
        }
        console.log('   📦 Parents:', parentChain.join(' ← '));

        // Attributs de la table
        const attrs = Array.from(table.attributes).map(a => `${a.name}="${a.value}"`);
        console.log('   🏷️ Attributs:', attrs.slice(0, 3).join(', '));
    });

    console.log('\n%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
    console.log('%c✅ DIAGNOSTIC TERMINÉ', 'color: #f59e0b; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
})();
