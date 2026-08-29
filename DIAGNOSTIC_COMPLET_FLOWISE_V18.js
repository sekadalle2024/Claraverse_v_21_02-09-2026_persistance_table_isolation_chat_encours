/**
 * DIAGNOSTIC COMPLET V18 - Pourquoi les tables ne sont pas collectées
 * Copiez-collez dans la console après avoir envoyé votre message avec la table Flowise
 */

console.clear();
console.log('%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 16px');
console.log('%c🔍 DIAGNOSTIC COMPLET V18 - FLOWISE', 'color: #ff6b6b; font-weight: bold; font-size: 16px');
console.log('%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 16px');

// ÉTAPE 1: Trouver la table Flowise
console.log('\n%c📋 ÉTAPE 1: Recherche table Flowise', 'color: #4ecdc4; font-weight: bold');

const allTables = document.querySelectorAll('table.min-w-full');
console.log(`   Total tables: ${allTables.length}`);

let flowiseTable = null;
let flowiseKeyword = null;

for (const table of allTables) {
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    const headersLower = headers.map(h => h.toLowerCase());

    if (headersLower.includes('flowise')) {
        flowiseTable = table;
        const firstRow = table.querySelector('tr:nth-child(2)');
        if (firstRow) {
            const firstCell = firstRow.querySelector('td');
            if (firstCell) {
                flowiseKeyword = firstCell.textContent.trim();
                console.log(`%c   ✅ TABLE FLOWISE TROUVÉE!`, 'color: #51cf66; font-weight: bold');
                console.log(`   📌 Mot-clé extrait: "${flowiseKeyword}"`);
                console.log(`   📏 Longueur: ${flowiseKeyword.length} caractères`);
                console.log(`   🔤 Lowercase: "${flowiseKeyword.toLowerCase()}"`);
                break;
            }
        }
    }
}

if (!flowiseTable) {
    console.error('%c   ❌ AUCUNE TABLE FLOWISE TROUVÉE!', 'color: #ff6b6b; font-weight: bold');
    console.log('   Arrêt du diagnostic.');
} else if (!flowiseKeyword) {
    console.error('%c   ❌ MOT-CLÉ VIDE!', 'color: #ff6b6b; font-weight: bold');
    console.log('   Arrêt du diagnostic.');
} else {
    // ÉTAPE 2: Chercher les divs avec Rubrique + Description
    console.log('\n%c📋 ÉTAPE 2: Recherche divs avec Rubrique + Description', 'color: #4ecdc4; font-weight: bold');

    const allDivs = document.querySelectorAll('div.prose');
    console.log(`   Total divs.prose: ${allDivs.length}`);

    let divsWithRubriqueDescription = 0;
    let divsMatching = 0;

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
            console.log(`\n   %c📋 Div ${divIndex + 1}: Table Rubrique/Description`, 'color: #ffd43b; font-weight: bold');
            console.log(`      En-têtes: [${headers.join(', ')}]`);

            // Vérifier Description[ligne 1]
            const descriptionIndex = headers.indexOf('description');
            const firstDataRow = firstTable.querySelector('tr:nth-child(2)');

            if (firstDataRow) {
                const cells = firstDataRow.querySelectorAll('td');
                if (cells[descriptionIndex]) {
                    const descriptionText = cells[descriptionIndex].textContent.trim();

                    console.log(`      📝 Description[ligne 1]:`);
                    console.log(`         Texte: "${descriptionText}"`);
                    console.log(`         Longueur: ${descriptionText.length} caractères`);
                    console.log(`         Lowercase: "${descriptionText.toLowerCase()}"`);

                    console.log(`\n      🔍 Comparaison:`);
                    console.log(`         Mot-clé Flowise: "${flowiseKeyword}"`);
                    console.log(`         Mot-clé lowercase: "${flowiseKeyword.toLowerCase()}"`);

                    // Test includes
                    const includesMatch = descriptionText.toLowerCase().includes(flowiseKeyword.toLowerCase());
                    console.log(`         Includes match: ${includesMatch ? '✅' : '❌'}`);

                    // Test exact
                    const exactMatch = descriptionText.toLowerCase() === flowiseKeyword.toLowerCase();
                    console.log(`         Exact match: ${exactMatch ? '✅' : '❌'}`);

                    // Test partiel (premiers mots)
                    const keywordWords = flowiseKeyword.toLowerCase().split(/\s+/);
                    const descWords = descriptionText.toLowerCase().split(/\s+/);
                    const partialMatch = keywordWords.some(word => descWords.includes(word));
                    console.log(`         Partial match (mots): ${partialMatch ? '✅' : '❌'}`);

                    if (includesMatch) {
                        divsMatching++;
                        console.log(`%c      ✅ MATCH TROUVÉ!`, 'color: #51cf66; font-weight: bold');

                        // Compter les tables
                        const tablesInDiv = div.querySelectorAll('table.min-w-full');
                        console.log(`      📦 Tables à collecter: ${tablesInDiv.length}`);
                    } else {
                        console.log(`%c      ❌ PAS DE MATCH`, 'color: #ff6b6b; font-weight: bold');
                    }
                } else {
                    console.log(`      ⚠️ Cellule Description non trouvée (index: ${descriptionIndex})`);
                }
            } else {
                console.log(`      ⚠️ Aucune ligne de données`);
            }
        }
    });

    // RÉSUMÉ
    console.log('\n%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 16px');
    console.log('%c📊 RÉSUMÉ FINAL', 'color: #ff6b6b; font-weight: bold; font-size: 16px');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 16px');

    console.log(`\n✅ Table Flowise trouvée: OUI`);
    console.log(`✅ Mot-clé extrait: "${flowiseKeyword}"`);
    console.log(`📋 Divs avec Rubrique+Description: ${divsWithRubriqueDescription}`);
    console.log(`🎯 Divs correspondant au mot-clé: ${divsMatching}`);

    if (divsMatching === 0) {
        console.log('\n%c❌ PROBLÈME:', 'color: #ff6b6b; font-weight: bold; font-size: 14px');
        console.log('   Aucune div ne contient le mot-clé dans Description[ligne 1]');
        console.log('\n💡 VÉRIFIEZ:');
        console.log('   1. Le mot-clé Flowise est-il exactement le même que dans Description?');
        console.log('   2. Y a-t-il des espaces ou caractères invisibles?');
        console.log('   3. La casse est-elle différente?');
    } else {
        console.log('\n%c✅ SUCCÈS!', 'color: #51cf66; font-weight: bold; font-size: 14px');
        console.log(`   ${divsMatching} div(s) correspondent au mot-clé`);
    }
}

console.log('\n%c═══════════════════════════════════════════════════════════', 'color: #ff6b6b; font-weight: bold; font-size: 16px');
