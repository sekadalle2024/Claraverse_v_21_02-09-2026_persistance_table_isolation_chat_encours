/**
 * DIAGNOSTIC URGENT - Persistance CIA
 * Copiez-collez ce code dans la console du navigateur
 */

(async function () {
    console.clear();
    console.log("🔍 DIAGNOSTIC URGENT - PERSISTANCE CIA");
    console.log("=".repeat(70));

    const results = {
        systemes: {},
        tables: {},
        localStorage: {},
        evenements: {},
        problemes: []
    };

    // 1. VÉRIFIER LES SYSTÈMES
    console.log("\n1️⃣ VÉRIFICATION DES SYSTÈMES");
    console.log("-".repeat(70));

    results.systemes.conso = !!window.claraverseProcessor;
    results.systemes.autoRestore = !!window.restoreCurrentSession;
    results.systemes.countCIA = !!window.countCIATables;

    console.log("conso.js:", results.systemes.conso ? "✅" : "❌ MANQUANT");
    console.log("auto-restore:", results.systemes.autoRestore ? "✅" : "❌ MANQUANT");
    console.log("countCIATables:", results.systemes.countCIA ? "✅" : "❌ MANQUANT");

    if (!results.systemes.conso) {
        results.problemes.push("❌ CRITIQUE: conso.js non chargé");
    }
    if (!results.systemes.autoRestore) {
        results.problemes.push("❌ CRITIQUE: auto-restore-chat-change.js non chargé");
    }

    // 2. VÉRIFIER LES TABLES CIA
    console.log("\n2️⃣ VÉRIFICATION DES TABLES CIA");
    console.log("-".repeat(70));

    const allTables = document.querySelectorAll('table');
    results.tables.total = allTables.length;
    results.tables.cia = [];
    results.tables.avecID = 0;
    results.tables.sansID = 0;

    allTables.forEach((table, index) => {
        const headers = Array.from(table.querySelectorAll('thead th, thead td, tr:first-child th, tr:first-child td'))
            .map(h => h.textContent.trim().toLowerCase());

        const isCIA = headers.some(h => /reponse[_\s]?user/i.test(h));

        if (isCIA) {
            const tableId = table.dataset.tableId;
            const checkboxes = table.querySelectorAll('input[type="checkbox"]');
            const checked = Array.from(checkboxes).filter(cb => cb.checked);

            const info = {
                index,
                id: tableId || null,
                checkboxes: checkboxes.length,
                checked: checked.length,
                headers: headers.slice(0, 3)
            };

            results.tables.cia.push(info);

            if (tableId) {
                results.tables.avecID++;
            } else {
                results.tables.sansID++;
                results.problemes.push(`⚠️ Table CIA #${results.tables.cia.length} sans ID`);
            }

            console.log(`Table CIA #${results.tables.cia.length}:`);
            console.log(`  ID: ${tableId || "❌ SANS ID"}`);
            console.log(`  Checkboxes: ${checkboxes.length} (${checked.length} cochées)`);
        }
    });

    console.log(`\nRésumé: ${results.tables.cia.length} table(s) CIA trouvée(s)`);
    console.log(`  - Avec ID: ${results.tables.avecID}`);
    console.log(`  - Sans ID: ${results.tables.sansID}`);

    if (results.tables.cia.length === 0) {
        results.problemes.push("❌ CRITIQUE: Aucune table CIA trouvée");
    }
    if (results.tables.sansID > 0) {
        results.problemes.push(`⚠️ ${results.tables.sansID} table(s) CIA sans ID - ne seront pas sauvegardées`);
    }

    // 3. VÉRIFIER LOCALSTORAGE
    console.log("\n3️⃣ VÉRIFICATION LOCALSTORAGE");
    console.log("-".repeat(70));

    try {
        const data = JSON.parse(localStorage.getItem('claraverse_tables_data') || '{}');
        results.localStorage.accessible = true;
        results.localStorage.totalTables = Object.keys(data).length;
        results.localStorage.ciaTables = Object.values(data).filter(t => t.isCIATable).length;
        results.localStorage.checkboxesCochees = 0;

        Object.values(data).forEach(table => {
            if (table.isCIATable && table.cells) {
                const checked = table.cells.filter(c => c.isCheckboxCell && c.isChecked).length;
                results.localStorage.checkboxesCochees += checked;
            }
        });

        console.log("localStorage accessible:", "✅");
        console.log("Tables totales:", results.localStorage.totalTables);
        console.log("Tables CIA:", results.localStorage.ciaTables);
        console.log("Checkboxes cochées:", results.localStorage.checkboxesCochees);

        if (results.localStorage.ciaTables === 0) {
            results.problemes.push("⚠️ Aucune table CIA sauvegardée dans localStorage");
        }

        // Afficher les détails des tables CIA sauvegardées
        if (results.localStorage.ciaTables > 0) {
            console.log("\nDétails des tables CIA sauvegardées:");
            Object.entries(data).forEach(([id, table]) => {
                if (table.isCIATable) {
                    const checked = (table.cells || []).filter(c => c.isCheckboxCell && c.isChecked).length;
                    console.log(`  - ${id}: ${checked} checkbox(es) cochée(s)`);
                }
            });
        }
    } catch (error) {
        results.localStorage.accessible = false;
        results.localStorage.error = error.message;
        results.problemes.push("❌ CRITIQUE: localStorage inaccessible - " + error.message);
        console.error("❌ Erreur localStorage:", error);
    }

    // 4. TESTER LES ÉVÉNEMENTS
    console.log("\n4️⃣ TEST DES ÉVÉNEMENTS");
    console.log("-".repeat(70));

    let eventReceived = false;
    const testListener = (e) => {
        eventReceived = true;
        console.log("✅ Événement reçu:", e.detail);
    };

    document.addEventListener('flowise:table:restore:request', testListener, { once: true });

    console.log("Déclenchement de l'événement test...");
    document.dispatchEvent(new CustomEvent('flowise:table:restore:request', {
        detail: { sessionId: 'test-diagnostic' }
    }));

    await new Promise(resolve => setTimeout(resolve, 100));

    results.evenements.fonctionnel = eventReceived;
    console.log("Événement fonctionnel:", eventReceived ? "✅" : "❌");

    if (!eventReceived) {
        results.problemes.push("❌ CRITIQUE: Système d'événements ne fonctionne pas");
    }

    document.removeEventListener('flowise:table:restore:request', testListener);

    // 5. VÉRIFIER LES SCRIPTS CHARGÉS
    console.log("\n5️⃣ VÉRIFICATION DES SCRIPTS");
    console.log("-".repeat(70));

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const scriptsImportants = [
        'conso.js',
        'auto-restore-chat-change.js',
        'menu.js',
        'Flowise.js'
    ];

    results.scripts = {};
    scriptsImportants.forEach(name => {
        const found = scripts.some(s => s.src.includes(name));
        results.scripts[name] = found;
        console.log(`${name}:`, found ? "✅" : "❌ NON CHARGÉ");

        if (!found) {
            results.problemes.push(`⚠️ Script ${name} non trouvé dans le DOM`);
        }
    });

    // 6. RÉSUMÉ DES PROBLÈMES
    console.log("\n6️⃣ RÉSUMÉ DES PROBLÈMES");
    console.log("=".repeat(70));

    if (results.problemes.length === 0) {
        console.log("✅ Aucun problème détecté");
    } else {
        console.log(`❌ ${results.problemes.length} problème(s) détecté(s):\n`);
        results.problemes.forEach((p, i) => {
            console.log(`${i + 1}. ${p}`);
        });
    }

    // 7. RECOMMANDATIONS
    console.log("\n7️⃣ RECOMMANDATIONS");
    console.log("=".repeat(70));

    if (!results.systemes.conso) {
        console.log("🔧 Recharger la page avec Ctrl+F5");
    } else if (results.tables.sansID > 0) {
        console.log("🔧 Forcer la génération des IDs:");
        console.log("   claraverseProcessor.processAllTables()");
    } else if (results.localStorage.ciaTables === 0) {
        console.log("🔧 Cocher des checkboxes et attendre 2 secondes");
        console.log("   Puis vérifier: claraverseProcessor.saveNow()");
    } else if (!eventReceived) {
        console.log("🔧 Vérifier que auto-restore-chat-change.js est bien chargé");
        console.log("   Recharger avec Ctrl+F5");
    } else {
        console.log("✅ Système semble fonctionnel");
        console.log("🧪 Tester le changement de chat:");
        console.log("   1. Cocher des checkboxes");
        console.log("   2. Changer de chat");
        console.log("   3. Revenir au chat initial");
        console.log("   4. Vérifier les checkboxes");
    }

    // 8. COMMANDES UTILES
    console.log("\n8️⃣ COMMANDES UTILES");
    console.log("=".repeat(70));
    console.log("Forcer la sauvegarde:");
    console.log("  claraverseProcessor.saveNow()");
    console.log("");
    console.log("Forcer la restauration:");
    console.log("  claraverseProcessor.restoreAllTablesData()");
    console.log("");
    console.log("Compter les tables CIA:");
    console.log("  window.countCIATables()");
    console.log("");
    console.log("Forcer l'événement:");
    console.log("  document.dispatchEvent(new CustomEvent('flowise:table:restore:request', {");
    console.log("    detail: { sessionId: 'current' }");
    console.log("  }))");
    console.log("");
    console.log("Voir les données sauvegardées:");
    console.log("  JSON.parse(localStorage.getItem('claraverse_tables_data'))");

    // 9. EXPORT DES RÉSULTATS
    console.log("\n9️⃣ RÉSULTATS COMPLETS");
    console.log("=".repeat(70));
    console.log("Résultats disponibles dans: window.diagnosticResults");
    window.diagnosticResults = results;

    console.log("\n✅ Diagnostic terminé");
    console.log("=".repeat(70));

    return results;
})();
