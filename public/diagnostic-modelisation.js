/**
 * Script de diagnostic pour Modelisation_template.js
 */

(function () {
    'use strict';

    console.log('🔍 === DIAGNOSTIC MODELISATION TEMPLATE ===');

    // 1. Vérifier les tables présentes
    function checkTables() {
        console.log('\n📊 1. RECHERCHE DES TABLES');

        // Toutes les tables
        const allTables = document.querySelectorAll('table');
        console.log(`   Total tables trouvées: ${allTables.length}`);

        // Tables avec classes spécifiques
        const tablesWithClasses = document.querySelectorAll('table.min-w-full');
        console.log(`   Tables avec .min-w-full: ${tablesWithClasses.length}`);

        // Afficher les classes de chaque table
        allTables.forEach((table, index) => {
            console.log(`   Table ${index + 1}:`);
            console.log(`      Classes: ${table.className}`);
            console.log(`      Contenu: ${table.textContent.substring(0, 100)}...`);
        });
    }

    // 2. Vérifier les mots-clés
    function checkKeywords() {
        console.log('\n🔑 2. RECHERCHE DES MOTS-CLÉS');

        const keywords = ['Flowise', 'FLOWISE', 'flowise', 'PARTIE 1', 'PARTIE 2', 'PARTIE 3'];
        const allTables = document.querySelectorAll('table');

        allTables.forEach((table, index) => {
            const text = table.textContent;
            const foundKeywords = keywords.filter(kw => text.includes(kw));

            if (foundKeywords.length > 0) {
                console.log(`   ✅ Table ${index + 1} contient: ${foundKeywords.join(', ')}`);
            }
        });
    }

    // 3. Vérifier la structure DOM
    function checkDOMStructure() {
        console.log('\n🏗️ 3. STRUCTURE DOM');

        const proseContainers = document.querySelectorAll('.prose');
        console.log(`   Conteneurs .prose: ${proseContainers.length}`);

        const darkProseContainers = document.querySelectorAll('.dark\\:prose-invert');
        console.log(`   Conteneurs .dark:prose-invert: ${darkProseContainers.length}`);

        // Chercher les divs contenant des tables
        const allDivs = document.querySelectorAll('div');
        let divsWithTables = 0;

        allDivs.forEach(div => {
            const tables = div.querySelectorAll('table');
            if (tables.length > 0) {
                divsWithTables++;
            }
        });

        console.log(`   Divs contenant des tables: ${divsWithTables}`);
    }

    // 4. Tester le sélecteur exact
    function testSelector() {
        console.log('\n🎯 4. TEST DU SÉLECTEUR');

        const selector = 'div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg';
        console.log(`   Sélecteur: ${selector}`);

        const tables = document.querySelectorAll(selector);
        console.log(`   Tables trouvées: ${tables.length}`);

        // Essayer des sélecteurs alternatifs
        const alt1 = document.querySelectorAll('table.min-w-full.border');
        console.log(`   Alternative 1 (table.min-w-full.border): ${alt1.length}`);

        const alt2 = document.querySelectorAll('div.prose table');
        console.log(`   Alternative 2 (div.prose table): ${alt2.length}`);

        const alt3 = document.querySelectorAll('table');
        console.log(`   Alternative 3 (table): ${alt3.length}`);
    }

    // 5. Vérifier si le script principal est chargé
    function checkScriptLoaded() {
        console.log('\n📦 5. VÉRIFICATION DU SCRIPT');

        if (window.ModelisationTemplate) {
            console.log('   ✅ window.ModelisationTemplate existe');
            console.log('   Fonctions disponibles:', Object.keys(window.ModelisationTemplate));
        } else {
            console.log('   ❌ window.ModelisationTemplate n\'existe pas');
            console.log('   Le script Modelisation_template.js n\'est pas chargé ou n\'a pas exposé l\'API');
        }
    }

    // 6. Simuler la détection
    function simulateDetection() {
        console.log('\n🧪 6. SIMULATION DE DÉTECTION');

        const allTables = document.querySelectorAll('table');
        const keywords = {
            flowise: ['Flowise', 'FLOWISE', 'flowise'],
            partie1: ['PARTIE 1', 'partie 1', 'Partie 1'],
            partie2: ['PARTIE 2', 'partie 2', 'Partie 2']
        };

        allTables.forEach((table, index) => {
            const text = table.textContent;

            // Vérifier Flowise
            const hasFlowise = keywords.flowise.some(kw => text.includes(kw));

            // Vérifier PARTIE
            let partieType = null;
            if (keywords.partie1.some(kw => text.includes(kw))) partieType = 'PARTIE 1';
            if (keywords.partie2.some(kw => text.includes(kw))) partieType = 'PARTIE 2';

            if (hasFlowise && partieType) {
                console.log(`   ✅ Table ${index + 1} DÉTECTÉE: ${partieType}`);
                console.log(`      Cette table devrait déclencher l'injection`);
            }
        });
    }

    // Exécuter tous les diagnostics
    setTimeout(() => {
        checkTables();
        checkKeywords();
        checkDOMStructure();
        testSelector();
        checkScriptLoaded();
        simulateDetection();

        console.log('\n✅ === FIN DU DIAGNOSTIC ===');
        console.log('Copiez ces résultats pour analyse');
    }, 1000);

})();
