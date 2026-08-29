/**
 * Node N8N : Extract Variables for RAG - VERSION COMPLÈTE
 * 
 * Extrait TOUTES les 7 variables depuis User_message :
 * - command (Command)
 * - cycle (Cycle)
 * - test (test)
 * - reference (reference)
 * - nature_test (Nature de test)
 * - assertion (Assertion)
 * - anomalie (Anomalie)
 * 
 * À placer entre "Code integrate7" et "Alea16"
 */

const inputData = $input.first().json;

const result = {
    command: "Non fourni",
    cycle: "Non fourni",
    test: "Non fourni",
    reference: "Non fourni",
    nature_test: "Non fourni",
    assertion: "Non fourni",
    anomalie: "Non fourni"
};

// Extraire les variables depuis User_message
if (inputData.data && inputData.data.length > 0) {
    const firstItem = inputData.data[0];
    
    if (firstItem && firstItem.User_message) {
        const userMsgArray = firstItem.User_message;
        
        console.log('📦 User_message trouvé:', userMsgArray.length, 'items');
        
        for (const item of userMsgArray) {
            const key = Object.keys(item)[0];
            const value = item[key] || "";
            
            console.log('🔍 Clé:', key, '→ Valeur:', value);
            
            // Mapping EXACT des 7 clés frontend vers variables agent RAG
            // Frontend envoie: [Command], [Cycle], [test], [reference], [Nature de test], [Assertion], [Anomalie]
            
            if (key === '[Command]') {
                result.command = value;
                console.log('✅ command extrait:', value);
            } else if (key === '[Cycle]') {
                result.cycle = value;
                console.log('✅ cycle extrait:', value);
            } else if (key === '[test]') {
                result.test = value;
                console.log('✅ test extrait:', value);
            } else if (key === '[reference]') {
                result.reference = value;
                console.log('✅ reference extrait:', value);
            } else if (key === '[Nature de test]') {
                result.nature_test = value;
                console.log('✅ nature_test extrait:', value);
            } else if (key === '[Assertion]') {
                result.assertion = value;
                console.log('✅ assertion extrait:', value);
            } else if (key === '[Anomalie]') {
                result.anomalie = value;
                console.log('✅ anomalie extrait:', value);
            }
        }
    } else {
        console.log('⚠️ User_message non trouvé dans data[0]');
    }
} else {
    console.log('⚠️ Aucune donnée dans inputData.data');
}

console.log('📤 Résultat final:', JSON.stringify(result, null, 2));

return [{ json: result }];
