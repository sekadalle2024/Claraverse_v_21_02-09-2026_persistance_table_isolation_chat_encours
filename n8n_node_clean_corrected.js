// Node Code N8N - Transformation JSON → Format claraApiService.ts
// Compatible avec FORMAT 4 attendu par le frontend

const inputData = $input.all();
const results = [];

for (const item of inputData) {
  try {
    let rawText = '';
    
    // Extraction du contenu
    if (item.json.text) {
      rawText = item.json.text;
    } else if (item.json.output) {
      rawText = item.json.output;
    } else if (typeof item.json === 'string') {
      rawText = item.json;
    } else {
      rawText = JSON.stringify(item.json);
    }
    
    // Nettoyage des échappements multiples
    rawText = rawText.replace(/\\\\\\\\/g, '\\\\');
    rawText = rawText.replace(/\\\\\\\"/g, '\\"');
    rawText = rawText.replace(/\\\\n/g, '\n');
    
    // Nettoyage des backticks markdown
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/```$/, '').trim();
    }
    
    // Parsing du JSON
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      // Tentative de nettoyage supplémentaire
      rawText = rawText.replace(/[\r\n\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
      parsedData = JSON.parse(rawText);
    }
    
    // ============================================================
    // TRANSFORMATION VERS FORMAT 4 (claraApiService.ts)
    // ============================================================
    // Le frontend attend: [{ "data": { "Etape mission - ...": [...] } }]
    
    // Vérifier que parsedData contient bien la structure attendue
    const mainKey = Object.keys(parsedData)[0];
    
    if (!mainKey) {
      throw new Error('Aucune clé principale trouvée dans le JSON');
    }
    
    // Construire la réponse au format attendu par claraApiService.ts
    const formattedResponse = {
      data: parsedData  // Envelopper le JSON dans "data"
    };
    
    // Retourner au format array comme attendu par le frontend
    results.push({
      json: formattedResponse
    });
    
    console.log('✅ Transformation réussie vers FORMAT 4');
    console.log('📊 Clé principale:', mainKey);
    console.log('📋 Nombre de tables:', Array.isArray(parsedData[mainKey]) ? parsedData[mainKey].length : 'N/A');
    
  } catch (error) {
    console.error('❌ Erreur de traitement:', error.message);
    
    // En cas d'erreur, retourner une structure d'erreur compatible
    results.push({
      json: {
        data: {
          "Erreur": [{
            "table 1": {
              "Message": error.message,
              "Type": "Erreur de parsing JSON"
            }
          }]
        }
      }
    });
  }
}

if (results.length === 0) {
  return [{
    json: {
      data: {
        "Erreur": [{
          "table 1": {
            "Message": "Aucune donnée n'a pu être traitée",
            "Type": "Erreur de traitement"
          }
        }]
      }
    }
  }];
}

return results;
