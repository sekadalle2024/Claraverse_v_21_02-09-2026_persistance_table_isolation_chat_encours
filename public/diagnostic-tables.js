// Diagnostic des tables - Affichage par alertes AMÉLIORÉ
(function() {
  function runDiagnostic() {
    console.log("🔍 [DIAGNOSTIC] Démarrage du diagnostic des tables...");
    
    let results = [];
    results.push("=== DIAGNOSTIC TABLES CLARAVERSE ===\n");
    
    // 1. Sélecteur Claraverse EXACT
    const claraverseSelector = "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg";
    const claraverseTables = document.querySelectorAll(claraverseSelector);
    results.push(`✓ Sélecteur Claraverse: ${claraverseTables.length} table(s)`);
    results.push(`  Sélecteur: ${claraverseSelector}\n`);
    
    // 2. Toutes les tables
    const allTables = document.querySelectorAll("table");
    results.push(`✓ Toutes les tables: ${allTables.length}\n`);
    
    // 3. Analyse détaillée des 5 premières tables
    if (allTables.length > 0) {
      results.push("--- ANALYSE DÉTAILLÉE DES TABLES ---\n");
      for (let i = 0; i < Math.min(5, allTables.length); i++) {
        const table = allTables[i];
        results.push(`Table ${i+1}:`);
        results.push(`  Classes: "${table.className}"`);
        results.push(`  ID: "${table.id}"`);
        results.push(`  Parent: ${table.parentElement?.tagName}`);
        results.push(`  Classes parent: "${table.parentElement?.className}"`);
        
        // Vérifier le contenu de la première cellule
        const firstCell = table.querySelector('td, th');
        if (firstCell) {
          const content = firstCell.textContent.trim().substring(0, 50);
          results.push(`  Première cellule: "${content}..."`);
        }
        results.push("");
      }
    }
    
    // 4. Conteneurs possibles
    results.push("--- CONTENEURS ---\n");
    
    const proseDiv = document.querySelector('div.prose.prose-base.dark\\:prose-invert.max-w-none');
    if (proseDiv) {
      const tablesInProse = proseDiv.querySelectorAll("table");
      results.push(`✓ Conteneur prose: TROUVÉ`);
      results.push(`  Tables dans prose: ${tablesInProse.length}\n`);
    } else {
      results.push(`✗ Conteneur prose: NON TROUVÉ\n`);
    }
    
    const mainElement = document.querySelector('main');
    if (mainElement) {
      const tablesInMain = mainElement.querySelectorAll("table");
      results.push(`✓ Element main: TROUVÉ`);
      results.push(`  Tables dans main: ${tablesInMain.length}\n`);
    } else {
      results.push(`✗ Element main: NON TROUVÉ\n`);
    }
    
    // 5. Recherche de divs contenant des tables
    const divsWithTables = document.querySelectorAll('div:has(table)');
    results.push(`✓ Divs contenant des tables: ${divsWithTables.length}`);
    if (divsWithTables.length > 0) {
      const firstDiv = divsWithTables[0];
      results.push(`  Classes du premier div: "${firstDiv.className}"`);
    }
    results.push("");
    
    // Afficher les résultats
    alert(results.join('\n'));
    console.log("📊 [DIAGNOSTIC] Résultats:", results.join('\n'));
    
    // Deuxième alerte avec sélecteurs alternatifs
    let altResults = ["=== SÉLECTEURS ALTERNATIFS ===\n"];
    const selectors = [
      "table",
      "table.min-w-full",
      "table.border",
      ".prose table",
      "main table",
      "div.prose table",
      "div[class*='prose'] table",
      "div[class*='chat'] table",
      "table[class*='min-w']",
      "table[class*='border']"
    ];
    
    selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        altResults.push(`${selector.padEnd(30)} → ${found.length} table(s)`);
      } catch (e) {
        altResults.push(`${selector.padEnd(30)} → ERREUR: ${e.message}`);
      }
    });
    
    altResults.push("\n--- RECOMMANDATION ---");
    if (allTables.length > 0) {
      altResults.push("✓ Des tables sont présentes dans le DOM");
      altResults.push("→ Utiliser le sélecteur qui retourne le plus de tables");
      altResults.push("→ Vérifier les classes CSS des tables ci-dessus");
    } else {
      altResults.push("✗ Aucune table trouvée dans le DOM");
      altResults.push("→ Les tables ne sont peut-être pas encore chargées");
      altResults.push("→ Attendre quelques secondes et réessayer");
    }
    
    alert(altResults.join('\n'));
    console.log("🔍 [DIAGNOSTIC] Sélecteurs alternatifs:", altResults.join('\n'));
  }
  
  // Exécuter après chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log("⏳ [DIAGNOSTIC] DOM chargé, attente de 3 secondes...");
      setTimeout(runDiagnostic, 3000);
    });
  } else {
    console.log("⏳ [DIAGNOSTIC] Page déjà chargée, attente de 3 secondes...");
    setTimeout(runDiagnostic, 3000);
  }
  
  // Fonction accessible globalement
  window.diagnosticTables = runDiagnostic;
  console.log("✅ [DIAGNOSTIC] Script chargé. Utilisez window.diagnosticTables() pour relancer le diagnostic.");
})();
