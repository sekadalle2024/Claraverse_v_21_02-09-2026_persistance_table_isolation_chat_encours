/**
 * DIAGNOSTIC DÉTAILLÉ - Pourquoi les tables ne sont pas collectées
 * Copiez-collez ce code dans la console du navigateur
 */

console.log('%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 14px');
console.log('%c🔍 DIAGNOSTIC DÉTAILLÉ - COLLECTE DES TABLES', 'color: #ff6b6b; font-weight: bold; font-size: 14px');
console.log('%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 14px');

// ÉTAPE 1: Trouver la table Flowise et extraire le mot-clé
console.log('\n%c📋 ÉTAPE 1: Recherche table Flowise', 'color: #4ecdc4; font-weight: bold');

const allTables = document.querySelectorAll('table.min-w-full');
console.log(`   Total tables trouvées: ${allTables.length}`);

let flowiseKeyword = null;
let flowiseTableFound = false;

for (const table of allTables) {
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim().toLowerCase());

    if (headers.includes('flowise')) {
        flowiseTableFound = true;
        const firstRow = table.querySelector('tr:nth-child(2)');
        if (firstRow) {
            const firstCell = firstRow.querySelector('td');
            if (firstCell) {
                flowiseKeyword = firstCell.textContent.trim();
                console.log(`%c   ✅ Table Flowise trouvée!`, 'color: #51cf66');
                console.log(`   📌 Mot-clé extrait: "${flowiseKeyword}"`);
                console.log(`   📏 Longueur: ${flowiseKeyword.length} caractères`);
                break;
            }
        }
    }
}

if (!flowiseTableFound) {
    console.error('   ❌ Aucune table Flowise trouvée!');
}

if (!flowiseKeyword) {
    console.error('   ❌ Mot-clé vide ou non extrait!');
}

// ÉTAPE 2: Chercher les divs avec tables Rubrique/Description
console.log('\n%c📋 ÉTAPE 2: Recherche divs avec Rubrique + Description', 'color: #4ecdc4; font-weight: bold');

const allDivs = document.querySelectorAll('div.prose');
console.log(`   Total divs.prose: ${allDivs.length}`);

let divsWithRubriqueDescription = 0;
let divsMatchingKeyword = 0;

allDivs.forEach((div, divIndex) => {
    const firstTable = div.querySelector('table.min-w-full');
    if (!firstTable) return;

    const headers = Array.from(firstTable.querySelectorAll('th')).map(th =>
        th.textContent.trim().toLowerCase()
    );

    const hasRubrique = headers.includes('rubrique');
    const hasDescription = headers.includes('description');

    if (hasRubrique && hasDescription) {
        divsWithRubriqueDescription++;
        console.log(`\n   %c📋 Div ${divIndex + 1}: Table Rubrique/Description trouvée`, 'color: #ffd43b');
        console.log(`      En-têtes: [${headers.join(', ')}]`);

        // Vérifier Description[ligne 1]
        const descriptionIndex = headers.indexOf('description');
        const firstDataRow = firstTable.querySelector('tr:nth-child(2)');

        if (firstDataRow) {
            const cells = firstDataRow.querySelectorAll('td');
            if (cells[descriptionIndex]) {
                const descriptionText = cells[descriptionIndex].textContent.trim();
                const firstLine = descriptionText.split('\n')[0].trim();

                console.log(`      📝 Description[ligne 1]:`);
                console.log(`         Texte complet: "${firstLine}"`);
                console.log(`         Longueur: ${firstLine.length} caractères`);
                console.log(`         Lowercase: "${firstLine.toLowerCase()}"`);

                if (flowiseKeyword) {
                    console.log(`\n      🔍 Recherche du mot-clé:`);
                    console.log(`         Mot-clé: "${flowiseKeyword}"`);
                    console.log(`         Mot-clé lowercase: "${flowiseKeyword.toLowerCase()}"`);

                    // Test exact
                    const exactMatch = firstLine.toLowerCase() === flowiseKeyword.toLowerCase();
                    console.log(`         Match exact: ${exactMatch ? '✅' : '❌'}`);

                    // Test includes
                    const includesMatch = firstLine.toLowerCase().includes(flowiseKeyword.toLowerCase());
                    console.log(`         Includes match: ${includesMatch ? '✅' : '❌'}`);

                    // Test partiel (premiers mots)
                    const keywordWords = flowiseKeyword.toLowerCase().split(/\s+/);
                    const firstLineWords = firstLine.toLowerCase().split(/\s+/);
                    const partialMatch = keywordWords.some(word => firstLineWords.includes(word));
                    console.log(`         Match partiel (mots): ${partialMatch ? '✅' : '❌'}`);

                    if (includesMatch) {
                        divsMatchingKeyword++;
                        console.log(`%c      ✅ MATCH TROUVÉ!`, 'color: #51cf66; font-weight: bold');

                        // Compter les tables dans cette div
                        const tablesInDiv = div.querySelectorAll('table.min-w-full');
                        console.log(`      📦 Tables à collecter: ${tablesInDiv.length}`);
                    } else {
                        console.log(`%c      ❌ PAS DE MATCH`, 'color: #ff6b6b; font-weight: bold');
                    }
                }
            } else {
                console.log(`      ⚠️ Cellule Description non trouvée (index: ${descriptionIndex})`);
            }
        } else {
            console.log(`      ⚠️ Aucune ligne de données dans la table`);
        }
    }
});

// RÉSUMÉ FINAL
console.log('\n%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 14px');
console.log('%c📊 RÉSUMÉ FINAL', 'color: #ff6b6b; font-weight: bold; font-size: 14px');
console.log('%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 14px');

console.log(`\n✅ Table Flowise trouvée: ${flowiseTableFound ? 'OUI' : 'NON'}`);
console.log(`✅ Mot-clé extrait: ${flowiseKeyword ? `"${flowiseKeyword}"` : 'NON'}`);
console.log(`📋 Divs avec Rubrique+Description: ${divsWithRubriqueDescription}`);
console.log(`🎯 Divs correspondant au mot-clé: ${divsMatchingKeyword}`);

if (divsMatchingKeyword === 0) {
    console.log('\n%c❌ PROBLÈME IDENTIFIÉ:', 'color: #ff6b6b; font-weight: bold');
    console.log('   Aucune div ne contient le mot-clé dans Description[ligne 1]');
    console.log('\n💡 SOLUTIONS POSSIBLES:');
    console.log('   1. Vérifier que le mot-clé Flowise correspond exactement');
    console.log('   2. Utiliser une recherche partielle (premiers mots)');
    console.log('   3. Vérifier la casse et les espaces');
}

console.log('\n%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 14px');
