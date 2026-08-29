// ═══════════════════════════════════════════════════════════════
// 🔍 DIAGNOSTIC - TROUVER LE BON SÉLECTEUR POUR LES MESSAGES
// ═══════════════════════════════════════════════════════════════
// COPIEZ-COLLEZ CE CODE DANS LA CONSOLE DE CLARAVERSE
// ═══════════════════════════════════════════════════════════════

(function () {
    console.log('%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
    console.log('%c🔍 DIAGNOSTIC SÉLECTEUR MESSAGES', 'color: #f59e0b; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');

    console.log('\n%c📋 TEST 1: Sélecteurs possibles', 'color: #3b82f6; font-weight: bold');

    const selectors = [
        'div[data-message-author-role="assistant"]',
        'div[data-message-author-role]',
        'div.message',
        'div.assistant-message',
        'div[class*="message"]',
        'div[class*="assistant"]',
        'div:has(table)',
        'div > table',
    ];

    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            console.log(`   ${selector}: ${elements.length} élément(s)`);
            if (elements.length > 0) {
                console.log(`      → Premier élément:`, elements[0]);
            }
        } catch (e) {
            console.log(`   ${selector}: ❌ Erreur - ${e.message}`);
        }
    });

    console.log('\n%c📋 TEST 2: Toutes les divs avec tables', 'color: #3b82f6; font-weight: bold');
    const allTables = document.querySelectorAll('table');
    console.log(`   Total de tables dans la page: ${allTables.length}`);

    const divsWithTables = new Set();
    allTables.forEach(table => {
        let parent = table.parentElement;
        while (parent && parent.tagName !== 'BODY') {
            if (parent.tagName === 'DIV') {
                divsWithTables.add(parent);
                break;
            }
            parent = parent.parentElement;
        }
    });

    console.log(`   Divs contenant des tables: ${divsWithTables.size}`);

    if (divsWithTables.size > 0) {
        console.log('\n%c📋 TEST 3: Analyse des divs avec tables', 'color: #3b82f6; font-weight: bold');
        Array.from(divsWithTables).forEach((div, index) => {
            console.log(`\n   DIV ${index + 1}:`);
            console.log(`      • Classes:`, div.className || '(aucune)');
            console.log(`      • ID:`, div.id || '(aucun)');
            console.log(`      • Attributs:`, Array.from(div.attributes).map(a => `${a.name}="${a.value}"`).join(', '));
            console.log(`      • Tables:`, div.querySelectorAll('table').length);
            console.log(`      • Élément:`, div);
        });
    }

    console.log('\n%c📋 TEST 4: Structure du DOM autour des tables', 'color: #3b82f6; font-weight: bold');
    if (allTables.length > 0) {
        const firstTable = allTables[0];
        console.log('   Hiérarchie du premier tableau:');
        let current = firstTable;
        let level = 0;
        while (current && current.tagName !== 'BODY' && level < 10) {
            const indent = '   ' + '  '.repeat(level);
            console.log(`${indent}↑ ${current.tagName}${current.className ? '.' + current.className.split(' ').join('.') : ''}${current.id ? '#' + current.id : ''}`);
            current = current.parentElement;
            level++;
        }
    }

    console.log('\n%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
    console.log('%c✅ DIAGNOSTIC TERMINÉ', 'color: #f59e0b; font-weight: bold');
    console.log('%c💡 Regardez les résultats ci-dessus pour identifier le bon sélecteur', 'color: #f59e0b');
    console.log('%c═══════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
})();
