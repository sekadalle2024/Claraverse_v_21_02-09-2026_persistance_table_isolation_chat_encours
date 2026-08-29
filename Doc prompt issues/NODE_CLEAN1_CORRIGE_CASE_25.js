// Node Code N8N - node clean1 CORRIGÉ pour Case 25
// Compatible avec Structured Output Parser et claraApiService.ts FORMAT 4
// Date: 29 Mars 2026

const inputData = $input.all();
const results = [];

for (const item of inputData) {
  try {
    let parsedData;
    
    // ============================================================
    // EXTRACTION DU CONTENU
    // ============================================================
    // Le Structured Output Parser retourne déjà un JSON parsé
    if (item.json && typeof item.json === 'object' && !Array.isArray(item.json)) {
      // Cas 1: JSON déjà parsé par le Structured Output Parser
      parsedData = item.json;
      console.log('✅ JSON déjà parsé par Structured Output Parser');
    } else if (item.json.text || item.json.output) {
      // Cas 2: Texte brut à parser
      let rawText = item.json.text || item.json.output;
      
      // Nettoyage des échappements multiples
      rawText = rawText.replace(/\\\\\\\\\\\\\\\\/g, '\\\\\\\\');
      rawText = rawText.replace(/\\\\\\\\\\\\\\\"/g, '\\"');
      rawText = rawText.replace(/\\\\\\\\n/g, '\n');
      
      // Nettoyage des backticks markdown
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\s*/, '').replace(/```$/, '').trim();
      }
      
      // Parsing du JSON
      try {
        parsedData = JSON.parse(rawText);
        console.log('✅ JSON parsé depuis texte brut');
      } catch (parseError) {
        // Tentative de nettoyage supplémentaire
        rawText = rawText.replace(/[\r\n\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
        parsedData = JSON.parse(rawText);
        console.log('✅ JSON parsé après nettoyage');
      }
    } else {
      throw new Error('Format de données non reconnu');
    }
    
    // ============================================================
    // TRANSFORMATION VERS FORMAT 4 (claraApiService.ts)
    // ============================================================
    // Le frontend attend: { "data": { "Etape mission - ...": [...] } }
    
    // Vérifier la structure
    const mainKey = Object.keys(parsedData)[0];
    
    if (!mainKey) {
      throw new Error('Aucune clé principale trouvée dans le JSON');
    }
    
    // Vérifier que la clé principale commence par "Etape mission"
    if (!mainKey.startsWith('Etape mission')) {
      console.warn('⚠️ La clé principale ne commence pas par "Etape mission":', mainKey);
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
    console.error('Stack:', error.stack);
    
    // En cas d'erreur, retourner une structure d'erreur compatible
    results.push({
      json: {
        data: {
          "Erreur": [{
            "table 1": {
              "Message": error.message,
              "Type": "Erreur de parsing JSON",
              "Details": error.stack
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
