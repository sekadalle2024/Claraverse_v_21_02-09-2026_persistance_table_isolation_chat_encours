// Node Code N8N - Markdown Generator1 corrige29 CORRIGÉ pour Case 25
// Compatible avec Structured Output Parser et claraApiService.ts FORMAT 4
// Date: 29 Mars 2026
// 
// Ce node transforme la sortie du Structured Output Parser en format attendu
// par le frontend ClaraVerse (FORMAT 4 avec structure "data")

const inputData = $input.all();
const results = [];

for (const item of inputData) {
  try {
    console.log('🔍 === DEBUT TRAITEMENT MARKDOWN GENERATOR ===');
    
    // ============================================================
    // EXTRACTION DU CONTENU DU STRUCTURED OUTPUT PARSER
    // ============================================================
    let parsedData;
    
    // Le Structured Output Parser peut retourner le JSON dans "data" ou "data.output"
    if (item.json && typeof item.json === 'object' && !Array.isArray(item.json)) {
      console.log('📊 Clés disponibles dans item.json:', Object.keys(item.json));
      
      // Cas 1: Structure avec data.output (après node clean1)
      if (item.json.data && item.json.data.output) {
        parsedData = item.json.data.output;
        console.log('✅ JSON extrait de data.output');
      }
      // Cas 2: Structure avec data directement
      else if (item.json.data) {
        parsedData = item.json.data;
        console.log('✅ JSON extrait de data');
      }
      // Cas 3: Structure directe (sans data)
      else {
        parsedData = item.json;
        console.log('✅ JSON direct');
      }
      
      console.log('📊 Clés dans parsedData:', Object.keys(parsedData));
    } else {
      throw new Error('Format de données non reconnu - JSON attendu du Structured Output Parser');
    }
    
    // ============================================================
    // VALIDATION DE LA STRUCTURE
    // ============================================================
    // Vérifier que la structure contient bien une clé "Etape mission"
    const mainKey = Object.keys(parsedData).find(key => 
      key.startsWith('Etape mission') || 
      key.includes('Programme') ||
      key.includes('Recos')
    );
    
    if (!mainKey) {
      console.warn('⚠️ Aucune clé "Etape mission" trouvée, utilisation de la première clé');
      const firstKey = Object.keys(parsedData)[0];
      if (!firstKey) {
        throw new Error('Aucune clé trouvée dans le JSON');
      }
      console.log('📋 Utilisation de la clé:', firstKey);
    } else {
      console.log('✅ Clé principale détectée:', mainKey);
    }
    
    const keyToUse = mainKey || Object.keys(parsedData)[0];
    const dataArray = parsedData[keyToUse];
    
    // Vérifier que c'est bien un array
    if (!Array.isArray(dataArray)) {
      throw new Error(`La clé "${keyToUse}" ne contient pas un array`);
    }
    
    console.log('📊 Nombre de tables:', dataArray.length);
    
    // ============================================================
    // VALIDATION DU CONTENU
    // ============================================================
    // Vérifier que chaque élément du array est un objet avec une table
    let validTables = 0;
    dataArray.forEach((tableObj, index) => {
      if (typeof tableObj === 'object' && !Array.isArray(tableObj)) {
        const tableKeys = Object.keys(tableObj);
        if (tableKeys.length > 0) {
          validTables++;
          console.log(`  ✓ Table ${index + 1}: "${tableKeys[0]}"`);
        }
      }
    });
    
    if (validTables === 0) {
      throw new Error('Aucune table valide trouvée dans le JSON');
    }
    
    console.log(`✅ ${validTables}/${dataArray.length} tables valides`);
    
    // ============================================================
    // TRANSFORMATION VERS FORMAT 4 (claraApiService.ts)
    // ============================================================
    // Le frontend attend: { "data": { "Etape mission - ...": [...] } }
    
    const formattedResponse = {
      data: parsedData  // Envelopper le JSON dans "data"
    };
    
    // ============================================================
    // RETOUR AU FORMAT ARRAY
    // ============================================================
    results.push({
      json: formattedResponse
    });
    
    console.log('✅ Transformation réussie vers FORMAT 4');
    console.log('📋 Structure finale:', {
      hasData: true,
      mainKey: keyToUse,
      tablesCount: dataArray.length,
      validTables: validTables
    });
    console.log('🔍 === FIN TRAITEMENT MARKDOWN GENERATOR ===');
    
  } catch (error) {
    console.error('❌ Erreur de traitement:', error.message);
    console.error('Stack:', error.stack);
    
    // En cas d'erreur, retourner une structure d'erreur compatible
    results.push({
      json: {
        data: {
          "Erreur - Markdown Generator": [{
            "table 1": {
              "Message": error.message,
              "Type": "Erreur de transformation",
              "Details": error.stack,
              "Input": JSON.stringify(item.json, null, 2).substring(0, 500)
            }
          }]
        }
      }
    });
  }
}

// Fallback si aucun résultat
if (results.length === 0) {
  return [{
    json: {
      data: {
        "Erreur - Markdown Generator": [{
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
