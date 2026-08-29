/**
 * DIAGNOSTIC COLLECTE TABLES - À EXÉCUTER DANS LA CONSOLE CLARAVERSE
 * Copier-coller ce code dans la console (F12) de Claraverse
 */

(function () {
    console.log('%c═══════════════════════════════════════════════════════════════════', 'color: #dc2626; font-weight: bold');
    console.log('%c🔍 DIAGNOSTIC COLLECTE TABLES CLARAVERSE', 'color: #dc2626; font-weight: bold; font-size: 16px');
    console.log('%c═══════════════════════════════════════════════════════════════════', 'color: #dc2626; font-weight: bold');

    const SELECTORS = {
        CHAT_TABLES: "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
        PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    };

    // 1. Compter les divs prose
    const allDivs = document.querySelectorAll(SELECTORS.PARENT_DIV);
    console.log(`\n📊 Nombre de divs "prose" trouvées: ${allDivs.length}`);

    if (allDivs.length === 0) {
        console.log('%c❌ PROBLÈME: Aucune div "prose" trouvée !', 'color: #ef4444; font-weight: bold');
        console.log('%c💡 Créez des messages dans le chat Claraverse', 'color: #f59e0b');
        return;
    }

    let totalTables = 0;
    let divsWithTables = 0;
    let divsWithRequiredHeaders = 0;
    let divsMatching = 0;
    const matchingDivs = [];

    // 2. Analyser chaque div
    allDivs.forEach((div, index) => {
        const tables = div.querySelectorAll(SELECTORS.CHAT_TABLES);

        if (tables.length === 0) return;

        totalTables += tables.length;
        divsWithTables++;

        const firstTable = tables[0];
        const headers = Array.from(firstTable.querySelectorAll("th")).map(th => th.textContent.trim());

        const hasRubrique = headers.some(h => h.toLowerCase() === 'rubrique');
        const hasDescription = headers.some(h => h.toLowerCase() === 'description');

        if (!hasRubrique || !hasDescription) return;

        divsWithRequiredHeaders++;

        const cells = firstTable.querySelectorAll("td");
        const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());

        const keywords = ['CIA', 'Flowise', 'Programme', 'Etape'];
        const foundKeywords = keywords.filter(kw =>
            cellTexts.some(text => text.toLowerCase().includes(kw.toLowerCase()))
        );

        if (foundKeywords.length > 0) {
            divsMatching++;
            matchingDivs.push({
                index: index + 1,
                keywords: foundKeywords,
                tablesCount: tables.length,
                headers: headers,
                cellTexts: cellTexts.slice(0, 5)
            });
        }
    });

    // 3. Afficher les résultats
    console.log('\n%c═══════════════════════════════════════════════════════════════════', 'color: #3b82f6; font-weight: bold');
    console.log('%c📊 RÉSUMÉ DE L\'ANALYSE', 'color: #3b82f6; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════════════════════════════════', 'color: #3b82f6; font-weight: bold');

    console.log(`\n📋 Divs "prose" totales: ${allDivs.length}`);
    console.log(`📋 Divs avec tables: ${divsWithTables}`);
    console.log(`📋 Divs avec en-têtes requis: ${divsWithRequiredHeaders}`);
    console.log(`📋 Divs correspondantes (avec mots-clés): ${divsMatching}`);
    console.log(`📋 Tables totales: ${totalTables}`);

    // 4. Détails des divs correspondantes
    if (matchingDivs.length > 0) {
        console.log('\n%c✅ DIVS CORRESPONDANTES DÉTECTÉES:', 'color: #10b981; font-weight: bold');
        matchingDivs.forEach(div => {
            console.log(`\n  Div ${div.index}:`);
            console.log(`    └─ Mots-clés: [${div.keywords.join(', ')}]`);
            console.log(`    └─ Tables: ${div.tablesCount}`);
            console.log(`    └─ En-têtes: [${div.headers.join(', ')}]`);
            console.log(`    └─ Cellules (5 premières): [${div.cellTexts.join(', ')}]`);
        });
    }

    // 5. Test de collecte
    console.log('\n%c═══════════════════════════════════════════════════════════════════', 'color: #8b5cf6; font-weight: bold');
    console.log('%c🧪 TEST DE COLLECTE (mot-clé "CIA")', 'color: #8b5cf6; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════════════════════════════════', 'color: #8b5cf6; font-weight: bold');

    const dynamicKeyword = "CIA";
    const collectedTablesHTML = [];

    allDivs.forEach((div) => {
        const firstTable = div.querySelector(SELECTORS.CHAT_TABLES);
        if (!firstTable) return;

        const headers = Array.from(firstTable.querySelectorAll("th")).map(th => th.textContent.trim().toLowerCase());
        if (!headers.includes("rubrique") || !headers.includes("description")) return;

        const cells = firstTable.querySelectorAll("td");
        const keywordFound = Array.from(cells).some(cell =>
            cell.textContent.toLowerCase().includes(dynamicKeyword.toLowerCase())
        );

        if (keywordFound) {
            const allTablesInDiv = div.querySelectorAll(SELECTORS.CHAT_TABLES);
            allTablesInDiv.forEach(table => {
                collectedTablesHTML.push(table.outerHTML);
            });
        }
    });

    console.log(`\n📊 Tables collectées: ${collectedTablesHTML.length}`);

    if (collectedTablesHTML.length > 0) {
        const finalHTML = collectedTablesHTML.join("\n");
        console.log(`📏 Taille du HTML collecté: ${finalHTML.length} caractères`);
        console.log(`\n📋 Aperçu du HTML (500 premiers caractères):`);
        console.log(finalHTML.substring(0, 500) + '...');

        // Stocker dans window pour inspection
        window.DIAGNOSTIC_COLLECTE = {
            html: finalHTML,
            tablesCount: collectedTablesHTML.length,
            size: finalHTML.length
        };
        console.log('\n%c💾 HTML collecté stocké dans: window.DIAGNOSTIC_COLLECTE', 'color: #10b981; font-weight: bold');
    } else {
        console.log('%c❌ Aucune table collectée !', 'color: #ef4444; font-weight: bold');
    }

    // 6. Diagnostic final
    console.log('\n%c═══════════════════════════════════════════════════════════════════', 'color: #dc2626; font-weight: bold');
    console.log('%c🔍 DIAGNOSTIC FINAL', 'color: #dc2626; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════════════════════════════════', 'color: #dc2626; font-weight: bold');

    if (allDivs.length === 0) {
        console.log('%c❌ PROBLÈME: Aucune div "prose" trouvée', 'color: #ef4444; font-weight: bold');
        console.log('%c💡 Solution: Créez des messages dans le chat', 'color: #f59e0b');
    } else if (divsWithTables === 0) {
        console.log('%c❌ PROBLÈME: Aucune table trouvée', 'color: #ef4444; font-weight: bold');
        console.log('%c💡 Solution: Créez des tables dans le chat', 'color: #f59e0b');
    } else if (divsWithRequiredHeaders === 0) {
        console.log('%c❌ PROBLÈME: Aucune table avec en-têtes "Rubrique" et "Description"', 'color: #ef4444; font-weight: bold');
        console.log('%c💡 Solution: Vos tables doivent avoir ces en-têtes', 'color: #f59e0b');
    } else if (divsMatching === 0) {
        console.log('%c❌ PROBLÈME: Aucune table avec mots-clés trouvée', 'color: #ef4444; font-weight: bold');
        console.log('%c💡 Solution: Ajoutez "CIA", "Flowise", ou "Programme" dans les cellules', 'color: #f59e0b');
    } else if (collectedTablesHTML.length === 0) {
        console.log('%c❌ PROBLÈME: Tables détectées mais pas collectées', 'color: #ef4444; font-weight: bold');
        console.log('%c💡 Solution: Vérifiez que le mot-clé "CIA" est présent', 'color: #f59e0b');
    } else {
        console.log(`%c✅ SUCCÈS: ${collectedTablesHTML.length} table(s) collectée(s)`, 'color: #10b981; font-weight: bold');
        console.log('%c💡 Les tables sont correctement collectées !', 'color: #10b981');
        console.log('%c💡 Si n8n ne reçoit rien, le problème est dans l\'envoi', 'color: #f59e0b');
    }

    console.log('\n%c═══════════════════════════════════════════════════════════════════', 'color: #dc2626; font-weight: bold');
    console.log('%c🎉 DIAGNOSTIC TERMINÉ', 'color: #dc2626; font-weight: bold; font-size: 16px');
    console.log('%c═══════════════════════════════════════════════════════════════════', 'color: #dc2626; font-weight: bold');
})();
