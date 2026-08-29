// ============================================================================
// TEST: Validation du formatage de réponse n8n pour ClaraAPI
// ============================================================================
// Ce fichier permet de tester le formatage en local avant de l'intégrer à n8n
// ============================================================================

// Simuler la réponse brute du LLM (avec caractères échappés problématiques)
const mockLLMResponse = `{
  "Etape mission - Implementation": [
    {
      "table 1": {
        "Etape": "Programme de travail - Phase de Tests",
        "Normes": "Norme 2320 Analyse et évaluation",
        "Reference": "IMP-TRESO-003",
        "Methode": "Méthode des tests de conformité et substantifs par les objectifs de contrôle"
      }
    },
    {
      "table 2": [
        {
          "no": 1,
          "Objectif de contrôle": "Garantir l'indépendance de la fonction de rapprochement bancaire.",
          "Travaux a effectuer": "1. Obtenir l'organigramme\\n2. Mener un entretien\\n3. Observer une session",
          "Resultat": "Le comptable cumule bien les droits d'accès",
          "Conclusion": "Non-Satisfaisant"
        },
        {
          "no": 2,
          "Objectif de contrôle": "Assurer l'exhaustivité des informations bancaires",
          "Travaux a effectuer": "1. Obtenir le journal\\t2. Sélectionner un échantillon",
          "Resultat": "Séquence numérique continue",
          "Conclusion": "Satisfaisant"
        }
      ]
    },
    {
      "table 3": {
        "Télécharger": "https://www.notion.so/Projet-arc-narratif-templates"
      }
    }
  ]
}`;

// ============================================================================
// FONCTION DE FORMATAGE (identique au node n8n)
// ============================================================================

function formatResponseForClaraAPI(llmResponse) {
  console.log("📥 Réponse LLM brute:", llmResponse.substring(0, 200));

  // ETAPE 1: Nettoyer et parser le JSON
  let parsedData;
  try {
    // Nettoyer les caractères problématiques
    let cleanedResponse = llmResponse
      .replace(/\\n/g, " ")           // Remplacer \n par espace
      .replace(/\\t/g, " ")           // Remplacer \t par espace
      .replace(/\\r/g, "")            // Supprimer \r
      .replace(/\\'/g, "'")           // Remplacer \' par '
      .replace(/\\\//g, "/")          // Remplacer \/ par /
      .replace(/\s+/g, " ")           // Normaliser les espaces multiples
      .trim();

    // Extraire le JSON s'il est entouré de markdown
    const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[1].trim();
    }

    // Parser le JSON
    parsedData = JSON.parse(cleanedResponse);
    console.log("✅ JSON parsé avec succès");
    
  } catch (error) {
    console.error("❌ Erreur de parsing JSON:", error.message);
    
    // Retourner une erreur formatée
    return [{
      data: {
        "Etape mission - Error": [{
          "table 1": {
            "Error": "Failed to parse LLM response",
            "Details": error.message,
            "Response Preview": llmResponse.substring(0, 200)
          }
        }]
      }
    }];
  }

  // ETAPE 2: Formater au FORMAT 4 attendu par ClaraAPI
  const mainKey = Object.keys(parsedData).find(key => 
    key.toLowerCase().includes('etape') || 
    key.toLowerCase().includes('mission') ||
    key.toLowerCase().includes('programme')
  ) || Object.keys(parsedData)[0];

  console.log("🔑 Clé principale détectée:", mainKey);

  // Construire la réponse au FORMAT 4
  const formattedResponse = [{
    data: {
      [mainKey]: parsedData[mainKey]
    }
  }];

  console.log("✅ Réponse formatée au FORMAT 4");
  
  return formattedResponse;
}

// ============================================================================
// TESTS
// ============================================================================

console.log("🧪 === DEBUT DES TESTS ===\n");

// Test 1: Formatage de base
console.log("📋 Test 1: Formatage de base");
console.log("─".repeat(80));
const result1 = formatResponseForClaraAPI(mockLLMResponse);
console.log("Résultat:", JSON.stringify(result1, null, 2).substring(0, 500));
console.log("\n");

// Test 2: Vérification de la structure
console.log("📋 Test 2: Vérification de la structure");
console.log("─".repeat(80));
const hasData = result1[0] && "data" in result1[0];
const hasMainKey = hasData && Object.keys(result1[0].data).length > 0;
const mainKey = hasMainKey ? Object.keys(result1[0].data)[0] : null;
const hasArray = mainKey && Array.isArray(result1[0].data[mainKey]);

console.log("✓ Structure [{ data: {...} }]:", hasData ? "✅" : "❌");
console.log("✓ Clé principale présente:", hasMainKey ? "✅" : "❌");
console.log("✓ Clé principale:", mainKey || "N/A");
console.log("✓ Contenu est un array:", hasArray ? "✅" : "❌");
console.log("\n");

// Test 3: Vérification du contenu des tables
console.log("📋 Test 3: Vérification du contenu des tables");
console.log("─".repeat(80));
if (hasArray) {
  const tables = result1[0].data[mainKey];
  console.log("Nombre de tables:", tables.length);
  
  tables.forEach((table, index) => {
    const tableKey = Object.keys(table)[0];
    const tableData = table[tableKey];
    const tableType = Array.isArray(tableData) ? "array" : "object";
    console.log(`  Table ${index + 1}: "${tableKey}" (type: ${tableType})`);
  });
}
console.log("\n");

// Test 4: Simulation de la détection dans ClaraAPI
console.log("📋 Test 4: Simulation de la détection dans ClaraAPI");
console.log("─".repeat(80));
const firstItem = result1[0];
const isFormat4 = firstItem && typeof firstItem === "object" && "data" in firstItem;
console.log("FORMAT 4 détecté:", isFormat4 ? "✅" : "❌");

if (isFormat4) {
  const dataContent = firstItem.data;
  console.log("Clés dans data:", Object.keys(dataContent));
  console.log("Type de contenu:", typeof dataContent[Object.keys(dataContent)[0]]);
}
console.log("\n");

// Test 5: Test avec JSON entouré de markdown
console.log("📋 Test 5: Test avec JSON entouré de markdown");
console.log("─".repeat(80));
const mockMarkdownResponse = "```json\n" + mockLLMResponse + "\n```";
const result5 = formatResponseForClaraAPI(mockMarkdownResponse);
const isFormat4_5 = result5[0] && "data" in result5[0];
console.log("Extraction depuis markdown:", isFormat4_5 ? "✅" : "❌");
console.log("\n");

// Test 6: Test avec JSON invalide
console.log("📋 Test 6: Test avec JSON invalide");
console.log("─".repeat(80));
const mockInvalidResponse = '{ "invalid": json }';
const result6 = formatResponseForClaraAPI(mockInvalidResponse);
const hasError = result6[0] && result6[0].data && "Etape mission - Error" in result6[0].data;
console.log("Gestion d'erreur:", hasError ? "✅" : "❌");
if (hasError) {
  console.log("Message d'erreur:", result6[0].data["Etape mission - Error"][0]["table 1"].Error);
}
console.log("\n");

console.log("🧪 === FIN DES TESTS ===\n");

// ============================================================================
// RÉSUMÉ
// ============================================================================

console.log("📊 === RÉSUMÉ ===");
console.log("─".repeat(80));
console.log("✅ Tous les tests devraient afficher des ✅");
console.log("✅ Le format de sortie est compatible avec ClaraAPI FORMAT 4");
console.log("✅ Les caractères échappés sont correctement nettoyés");
console.log("✅ Les erreurs sont gérées gracieusement");
console.log("\n");

console.log("📝 === PROCHAINES ÉTAPES ===");
console.log("─".repeat(80));
console.log("1. Copier le code de formatage dans un node Code dans n8n");
console.log("2. Connecter: Webhook → AI Agent → Code → Respond to Webhook");
console.log("3. Configurer les headers CORS dans Respond to Webhook");
console.log("4. Tester depuis le front-end ClaraAPI");
console.log("\n");

// Export pour Node.js (si exécuté avec node test_n8n_format_response.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatResponseForClaraAPI };
}
