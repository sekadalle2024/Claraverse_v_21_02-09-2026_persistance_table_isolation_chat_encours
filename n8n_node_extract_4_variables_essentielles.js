/**
 * Node N8N : Extract 4 Variables Essentielles pour RAG
 * 
 * Extrait UNIQUEMENT les 4 variables essentielles pour l'agent RAG :
 * - cycle (Cycle comptable)
 * - reference (Description du test)
 * - assertion (Assertion d'audit)
 * - anomalie (Anomalie détectée)
 * 
 * Type de node : Code (JavaScript)
 * À placer entre "Code integrate7" et "Alea Generator"
 */

const inputData = $input.first().json;

const result = {
    cycle: "Non fourni",
    reference: "Non fourni",
    assertion: "Non fourni",
    anomalie: "Non fourni"
};

// Extraire les 4 variables essentielles depuis User_message
if (inputData.data && inputData.data.length > 0) {
    const firstItem = inputData.data[0];
    
    if (firstItem && firstItem.User_message) {
        const userMsgArray = firstItem.User_message;
        
        console.log('📦 User_message trouvé:', userMsgArray.length, 'items');
        
        for (const item of userMsgArray) {
            const key = Object.keys(item)[0];
            const value = item[key] || "";
            
            // Mapping EXACT des 4 clés essentielles
            if (key === '[Cycle]') {
                result.cycle = value;
                console.log('✅ cycle extrait:', value);
            } else if (key === '[reference]') {
                result.reference = value;
                console.log('✅ reference extrait:', value);
            } else if (key === '[Assertion]') {
                result.assertion = value;
                console.log('✅ assertion extrait:', value);
            } else if (key === '[Anomalie]') {
                result.anomalie = value;
                console.log('✅ anomalie extrait:', value);
            }
        }
        
        console.log('📊 Total: 4 variables essentielles extraites');
    } else {
        console.log('⚠️ User_message non trouvé dans data[0]');
    }
} else {
    console.log('⚠️ Aucune donnée dans inputData.data');
}

console.log('📤 Résultat final:', JSON.stringify(result, null, 2));

return [{ json: result }];
