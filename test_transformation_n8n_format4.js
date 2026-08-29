// Test de transformation JSON → FORMAT 4
// Simule le traitement du node "node clean" corrigé

const exempleJsonLLM = `{
  "Etape mission - Recos revision des comptes": [
    {
      "table 1": {
        "Etape de mission": "Recommendations comptables",
        "Norme": "Norme ISA"
      }
    },
    {
      "table 2": {
        "Intitule": "Dépenses de caisse non appuyées"
      }
    }
  ]
}`;

// Simulation du traitement
function testTransformation(rawText) {
  try {
    // Nettoyage
    rawText = rawText.replace(/\\\\\\\\/g, '\\\\');
    rawText = rawText.replace(/\\\\\\\"/g, '\\"');
    
    // Parse
    const parsedData = JSON.parse(rawText);
    
    // Format 4
    const formattedResponse = {
      data: parsedData
    };
    
    console.log('✅ Transformation réussie');
    console.log(JSON.stringify([{ json: formattedResponse }], null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Exécuter le test
testTransformation(exempleJsonLLM);
