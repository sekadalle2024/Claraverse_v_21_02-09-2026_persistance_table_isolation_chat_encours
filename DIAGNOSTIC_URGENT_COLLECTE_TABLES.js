/**
 * DIAGNOSTIC URGENT - Pourquoi la collecte de tables ne se déclenche plus
 * À exécuter dans la console du navigateur
 */

console.log("%c═══════════════════════════════════════════════════════════", "color: #ff0000; font-weight: bold; font-size: 16px");
console.log("%c🚨 DIAGNOSTIC URGENT - COLLECTE DE TABLES", "color: #ff0000; font-weight: bold; font-size: 16px");
console.log("%c═══════════════════════════════════════════════════════════", "color: #ff0000; font-weight: bold; font-size: 16px");

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 1: Vérifier si le script Flowise.js est chargé
// ═══════════════════════════════════════════════════════════════
console.log("\n%c📋 ÉTAPE 1: Vérification du chargement du script", "color: #3b82f6; font-weight: bold");

const scripts = Array.from(document.querySelectorAll('script'));
const flowiseScript = scripts.find(s => s.src && s.src.includes('Flowise.js'));

if (flowiseScript) {
    console.log("✅ Script Flowise.js trouvé:", flowiseScript.src);
} else {
    console.error("❌ PROBLÈME: Script Flowise.js NON TROUVÉ dans la page!");
    console.log("💡 SOLUTION: Vérifier que index.html contient:");
    console.log('   <script src="Flowise.js"></script>');
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 2: Vérifier la présence de tables dans le DOM
// ═══════════════════════════════════════════════════════════════
console.log("\n%c📋 ÉTAPE 2: Recherche de tables dans le DOM", "color: #3b82f6; font-weight: bold");

const allTables = document.querySelectorAll('table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
console.log(`   Tables totales trouvées: ${allTables.length}`);

if (allTables.length === 0) {
    console.error("❌ PROBLÈME: Aucune table trouvée dans le DOM!");
    console.log("💡 Vérifier que vous avez bien des tables affichées dans le chat");
} else {
    console.log("✅ Tables présentes dans le DOM");

    // Analyser chaque table
    allTables.forEach((table, index) => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        console.log(`   Table ${index + 1}: [${headers.join(', ')}]`);
    });
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 3: Chercher spécifiquement la table "Flowise"
// ═══════════════════════════════════════════════════════════════
console.log("\n%c📋 ÉTAPE 3: Recherche de la table FLOWISE", "color: #3b82f6; font-weight: bold");

let flowiseTable = null;
let flowiseKeyword = null;

for (const table of allTables) {
    const headers = Array.from(table.querySelectorAll('th')).map(th =>
        th.textContent.trim().toLowerCase()
    );

    if (headers.includes('flowise')) {
        flowiseTable = table;
        const firstRow = table.querySelector('tbody tr');
        if (firstRow) {
            const firstCell = firstRow.querySelector('td');
            if (firstCell) {
                flowiseKeyword = firstCell.textContent.trim();
                console.log("✅ Table Flowise TROUVÉE!");
                console.log(`   Mot-clé extrait: "${flowiseKeyword}"`);
                break;
            }
        }
    }
}

if (!flowiseTable) {
    console.error("❌ PROBLÈME: Aucune table avec en-tête 'Flowise' trouvée!");
    console.log("💡 SOLUTION: Créer une table avec:");
    console.log("   - En-tête: 'Flowise'");
    console.log("   - Première cellule: le mot-clé à rechercher (ex: 'Gestion stratégique')");
} else {
    console.log("✅ Table Flowise détectée avec mot-clé:", flowiseKeyword);
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 4: Chercher les tables Rubrique + Description
// ═══════════════════════════════════════════════════════════════
console.log("\n%c📋 ÉTAPE 4: Recherche des tables Rubrique + Description", "color: #3b82f6; font-weight: bold");

let tablesWithRubriqueDescription = 0;
let tablesMatchingKeyword = 0;

allTables.forEach((table, index) => {
    const headers = Array.from(table.querySelectorAll('th')).map(th =>
        th.textContent.trim().toLowerCase()
    );

    const hasRubrique = headers.includes('rubrique');
    const hasDescription = headers.includes('description');

    if (hasRubrique && hasDescription) {
        tablesWithRubriqueDescription++;
        console.log(`   ✅ Table ${index + 1} a Rubrique + Description`);

        // Vérifier si le mot-clé est présent
        if (flowiseKeyword) {
            const descriptionIndex = headers.indexOf('description');
            const allRows = table.querySelectorAll('tbody tr');

            let foundKeyword = false;
            for (const row of allRows) {
                const cells = row.querySelectorAll('td');
                if (cells[descriptionIndex]) {
                    const text = cells[descriptionIndex].textContent.trim();
                    if (text.toLowerCase().includes(flowiseKeyword.toLowerCase())) {
                        foundKeyword = true;
                        tablesMatchingKeyword++;
                        console.log(`      🎯 MATCH! Mot-clé "${flowiseKeyword}" trouvé dans cette table`);
                        break;
                    }
                }
            }

            if (!foundKeyword) {
                console.log(`      ❌ Mot-clé "${flowiseKeyword}" NON trouvé dans cette table`);
            }
        }
    }
});

console.log(`\n📊 RÉSUMÉ:`);
console.log(`   - Tables Rubrique+Description: ${tablesWithRubriqueDescription}`);
console.log(`   - Tables correspondant au mot-clé: ${tablesMatchingKeyword}`);

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 5: Vérifier les MutationObserver
// ═══════════════════════════════════════════════════════════════
console.log("\n%c📋 ÉTAPE 5: Vérification des MutationObserver", "color: #3b82f6; font-weight: bold");

// Impossible de vérifier directement les observers, mais on peut vérifier les logs
console.log("💡 Vérifier dans la console si vous voyez des logs comme:");
console.log("   - '🚀 Initialisation du script dynamique de tables V17.1'");
console.log("   - '👀 MutationObserver activé'");
console.log("   - '🔍 Nouvelle table détectée'");

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 6: Tester manuellement la collecte
// ═══════════════════════════════════════════════════════════════
console.log("\n%c📋 ÉTAPE 6: Test manuel de collecte", "color: #3b82f6; font-weight: bold");

if (flowiseTable && flowiseKeyword) {
    console.log("🧪 Tentative de collecte manuelle...");

    // Simuler la collecte
    const collectedTables = [];

    allTables.forEach((table) => {
        const headers = Array.from(table.querySelectorAll('th')).map(th =>
            th.textContent.trim().toLowerCase()
        );

        if (headers.includes('rubrique') && headers.includes('description')) {
            const descriptionIndex = headers.indexOf('description');
            const allRows = table.querySelectorAll('tbody tr');

            for (const row of allRows) {
                const cells = row.querySelectorAll('td');
                if (cells[descriptionIndex]) {
                    const text = cells[descriptionIndex].textContent.trim();
                    if (text.toLowerCase().includes(flowiseKeyword.toLowerCase())) {
                        collectedTables.push(table);
                        break;
                    }
                }
            }
        }
    });

    console.log(`✅ Collecte manuelle réussie: ${collectedTables.length} table(s)`);

    if (collectedTables.length === 0) {
        console.error("❌ PROBLÈME: Aucune table collectée!");
        console.log("💡 Vérifier que:");
        console.log(`   1. Le mot-clé "${flowiseKeyword}" est bien dans la colonne Description`);
        console.log("   2. Les tables ont bien les en-têtes 'Rubrique' et 'Description'");
    }
} else {
    console.error("❌ Impossible de tester: table Flowise ou mot-clé manquant");
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 7: Vérifier l'endpoint n8n
// ═══════════════════════════════════════════════════════════════
console.log("\n%c📋 ÉTAPE 7: Vérification de l'endpoint n8n", "color: #3b82f6; font-weight: bold");

const n8nEndpoint = "http://localhost:5678/webhook/htlm_processor";
console.log(`   Endpoint configuré: ${n8nEndpoint}`);

// Test de connexion
fetch(n8nEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question: 'Test de connexion' })
})
    .then(response => {
        console.log(`✅ Endpoint n8n accessible! Status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log("📦 Réponse n8n:", data);
    })
    .catch(error => {
        console.error("❌ PROBLÈME: Impossible de contacter l'endpoint n8n!");
        console.error("   Erreur:", error.message);
        console.log("💡 SOLUTIONS:");
        console.log("   1. Vérifier que n8n est démarré (http://localhost:5678)");
        console.log("   2. Vérifier que le workflow 'htlm_processor' est actif");
        console.log("   3. Vérifier les paramètres CORS dans n8n");
    });

// ═══════════════════════════════════════════════════════════════
// CONCLUSION
// ═══════════════════════════════════════════════════════════════
console.log("\n%c═══════════════════════════════════════════════════════════", "color: #10b981; font-weight: bold; font-size: 16px");
console.log("%c✅ DIAGNOSTIC TERMINÉ", "color: #10b981; font-weight: bold; font-size: 16px");
console.log("%c═══════════════════════════════════════════════════════════", "color: #10b981; font-weight: bold; font-size: 16px");

console.log("\n📋 PROCHAINES ÉTAPES:");
console.log("1. Vérifier les résultats ci-dessus");
console.log("2. Corriger les problèmes identifiés");
console.log("3. Recharger la page et réessayer");
console.log("4. Si le problème persiste, partager les logs de ce diagnostic");
