/**
 * DIAGNOSTIC IMMÉDIAT - À exécuter dans la console
 * Copiez-collez ce code ENTIER dans la console du navigateur
 */

console.clear();
console.log("🔍 DIAGNOSTIC IMMÉDIAT - PERSISTANCE CIA");
console.log("=".repeat(70));

// Test 1: Vérifier que conso.js est chargé
console.log("\n1️⃣ SYSTÈME CONSO.JS");
if (window.claraverseProcessor) {
    console.log("✅ conso.js chargé");

    // Vérifier les fonctions clés
    const fonctions = [
        'processAllTables',
        'saveNow',
        'restoreAllTablesData',
        'loadAllData'
    ];

    fonctions.forEach(fn => {
        if (typeof window.claraverseProcessor[fn] === 'function') {
            console.log(`  ✅ ${fn}() disponible`);
        } else {
            console.log(`  ❌ ${fn}() MANQUANTE`);
        }
    });
} else {
    console.log("❌ conso.js NON CHARGÉ");
    console.log("💡 Rechargez la page avec Ctrl+F5");
}

// Test 2: Trouver les tables CIA
console.log("\n2️⃣ TABLES CIA DANS LE DOM");
const allTables = document.querySelectorAll('table');
console.log(`Total de tables: ${allTables.length}`);

let ciaTablesFound = [];
allTables.forEach((table, index) => {
    const headers = Array.from(table.querySelectorAll('thead th, thead td, tr:first-child th, tr:first-child td'))
        .map(h => h.textContent.trim());

    const hasReponseUser = headers.some(h => /reponse[_\s]?user/i.test(h));

    if (hasReponseUser) {
        const tableId = table.dataset.tableId;
        const checkboxes = table.querySelectorAll('input[type="checkbox"]');
        const checked = Array.from(checkboxes).filter(cb => cb.checked);

        ciaTablesFound.push({
            index,
            id: tableId,
            checkboxes: checkboxes.length,
            checked: checked.length
        });

        console.log(`Table CIA #${ciaTablesFound.length}:`);
        console.log(`  Index DOM: ${index}`);
        console.log(`  ID: ${tableId || "❌ SANS ID"}`);
        console.log(`  Checkboxes: ${checkboxes.length}`);
        console.log(`  Cochées: ${checked.length}`);
        console.log(`  Headers:`, headers.slice(0, 3).join(', '));
    }
});

if (ciaTablesFound.length === 0) {
    console.log("❌ AUCUNE TABLE CIA TROUVÉE");
    console.log("💡 Vérifiez que vous êtes sur une page avec des tables d'examen CIA");
} else {
    console.log(`\n✅ ${ciaTablesFound.length} table(s) CIA trouvée(s)`);
}

// Test 3: Vérifier localStorage
console.log("\n3️⃣ LOCALSTORAGE");
try {
    const data = JSON.parse(localStorage.getItem('claraverse_tables_data') || '{}');
    const allKeys = Object.keys(data);
    const ciaTables = Object.values(data).filter(t => t.isCIATable);

    console.log(`Total tables sauvegardées: ${allKeys.length}`);
    console.log(`Tables CIA sauvegardées: ${ciaTables.length}`);

    if (ciaTables.length > 0) {
        console.log("\nDétails des tables CIA sauvegardées:");
        ciaTables.forEach((table, i) => {
            const checked = (table.cells || []).filter(c => c.isCheckboxCell && c.isChecked).length;
            const total = (table.cells || []).filter(c => c.isCheckboxCell).length;
            console.log(`  ${i + 1}. ${checked}/${total} checkbox(es) cochée(s)`);
            console.log(`     Headers:`, table.headers?.slice(0, 3).join(', '));
        });
    } else {
        console.log("⚠️ Aucune table CIA sauvegardée");
    }
} catch (error) {
    console.log("❌ Erreur localStorage:", error.message);
}

// Test 4: Test de sauvegarde EN DIRECT
console.log("\n4️⃣ TEST DE SAUVEGARDE");
if (window.claraverseProcessor && ciaTablesFound.length > 0) {
    console.log("🧪 Cochez une checkbox maintenant...");
    console.log("Puis exécutez: claraverseProcessor.saveNow()");
    console.log("Puis vérifiez: JSON.parse(localStorage.getItem('claraverse_tables_data'))");
} else {
    console.log("⏭️ Impossible de tester (système ou tables manquants)");
}

// Test 5: Test de restauration EN DIRECT
console.log("\n5️⃣ TEST DE RESTAURATION");
if (window.claraverseProcessor) {
    console.log("🧪 Pour tester la restauration:");
    console.log("1. Cochez des checkboxes");
    console.log("2. Exécutez: claraverseProcessor.saveNow()");
    console.log("3. Décochez les checkboxes");
    console.log("4. Exécutez: claraverseProcessor.restoreAllTablesData()");
    console.log("5. Les checkboxes doivent se recocher");
} else {
    console.log("⏭️ Impossible de tester (système manquant)");
}

// Résumé
console.log("\n" + "=".repeat(70));
console.log("📊 RÉSUMÉ");
console.log("=".repeat(70));

const problemes = [];

if (!window.claraverseProcessor) {
    problemes.push("❌ CRITIQUE: conso.js non chargé");
}

if (ciaTablesFound.length === 0) {
    problemes.push("❌ CRITIQUE: Aucune table CIA trouvée");
}

const tablesSansID = ciaTablesFound.filter(t => !t.id).length;
if (tablesSansID > 0) {
    problemes.push(`⚠️ ${tablesSansID} table(s) CIA sans ID`);
}

if (problemes.length === 0) {
    console.log("✅ Système semble OK");
    console.log("\n🧪 TESTEZ MAINTENANT:");
    console.log("1. Cochez une checkbox");
    console.log("2. Attendez 2 secondes");
    console.log("3. Exécutez: claraverseProcessor.saveNow()");
    console.log("4. Vérifiez localStorage:");
    console.log("   const data = JSON.parse(localStorage.getItem('claraverse_tables_data'));");
    console.log("   console.log(data);");
} else {
    console.log("❌ PROBLÈMES DÉTECTÉS:");
    problemes.forEach((p, i) => console.log(`${i + 1}. ${p}`));
}

console.log("\n" + "=".repeat(70));
console.log("✅ Diagnostic terminé");
