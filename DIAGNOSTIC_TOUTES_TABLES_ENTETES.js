/**
 * DIAGNOSTIC - Voir TOUTES les tables et leurs en-têtes
 * Copiez-collez ce code dans la console
 */

console.log('%c═══════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 16px');
console.log('%c📋 TOUTES LES TABLES ET LEURS EN-TÊTES', 'color: #ff6b6b; font-weight: bold; font-size: 16px');
console.log('%c═══════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 16px');

const allTables = document.querySelectorAll('table');
console.log(`\n✅ Total tables trouvées: ${allTables.length}\n`);

allTables.forEach((table, index) => {
    console.log(`%c━━━ TABLE ${index + 1} ━━━`, 'color: #4ecdc4; font-weight: bold');

    // Classes
    console.log(`   Classes: ${table.className || '(aucune)'}`);

    // En-têtes
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    console.log(`   En-têtes (${headers.length}):`, headers);

    // Première ligne de données
    const firstRow = table.querySelector('tbody tr') || table.querySelector('tr:nth-child(2)');
    if (firstRow) {
        const cells = Array.from(firstRow.querySelectorAll('td')).map(td =>
            td.textContent.trim().substring(0, 50)
        );
        console.log(`   Première ligne (${cells.length} cellules):`, cells);
    } else {
        console.log(`   Première ligne: (aucune)`);
    }

    // Parent div
    const parentDiv = table.closest('div.prose');
    if (parentDiv) {
        const divIndex = Array.from(document.querySelectorAll('div.prose')).indexOf(parentDiv);
        console.log(`   Parent: div.prose #${divIndex + 1}`);
    }

    console.log('');
});

console.log('%c═══════════════════════════════════════', 'color: #ff6b6b; font-weight: bold');
console.log('%c🔍 RECHERCHE SPÉCIFIQUE "FLOWISE"', 'color: #ff6b6b; font-weight: bold');
console.log('%c═══════════════════════════════════════', 'color: #ff6b6b; font-weight: bold');

let flowiseFound = false;

allTables.forEach((table, index) => {
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    const headersLower = headers.map(h => h.toLowerCase());

    // Chercher "flowise" de différentes manières
    const exactMatch = headers.includes('Flowise');
    const lowerMatch = headersLower.includes('flowise');
    const partialMatch = headers.some(h => h.toLowerCase().includes('flowise'));

    if (exactMatch || lowerMatch || partialMatch) {
        flowiseFound = true;
        console.log(`\n%c✅ TABLE FLOWISE TROUVÉE! (Table ${index + 1})`, 'color: #51cf66; font-weight: bold');
        console.log(`   En-têtes:`, headers);
        console.log(`   Match exact "Flowise": ${exactMatch}`);
        console.log(`   Match lowercase "flowise": ${lowerMatch}`);
        console.log(`   Match partiel: ${partialMatch}`);

        // Extraire le contenu
        const firstRow = table.querySelector('tbody tr') || table.querySelector('tr:nth-child(2)');
        if (firstRow) {
            const cells = Array.from(firstRow.querySelectorAll('td'));
            console.log(`\n   📝 Contenu des cellules:`);
            cells.forEach((cell, i) => {
                console.log(`      Cellule ${i + 1}: "${cell.textContent.trim()}"`);
            });
        }
    }
});

if (!flowiseFound) {
    console.log(`\n%c❌ AUCUNE TABLE "FLOWISE" TROUVÉE`, 'color: #ff6b6b; font-weight: bold');
    console.log(`\n💡 Vérifiez:`);
    console.log(`   1. La table existe-t-elle visuellement?`);
    console.log(`   2. Est-elle dans un iframe?`);
    console.log(`   3. Est-elle générée dynamiquement après le chargement?`);
    console.log(`   4. L'en-tête est-il exactement "Flowise"?`);
}

console.log('\n%c═══════════════════════════════════════', 'color: #ff6b6b; font-weight: bold');
