/**
 * Node N8N : Extract Variables for RAG
 * 
 * Extrait les variables user_message, cycle, constat, anomalie
 * depuis la structure User_message créée par "Code integrate7"
 * 
 * À placer entre "Code integrate7" et "Alea16"
 */

const inputData = $input.first().json;

const result = {
    data: inputData.data || [],
    user_message: "Message non fourni",
    cycle: "Achats",
    constat: "À compléter",
    anomalie: "À compléter"
};

// Extraire les variables depuis User_message
if (inputData.data && inputData.data.length > 0) {
    const userMessageObj = inputData.data.find(item => item.User_message);
    
    if (userMessageObj && userMessageObj.User_message) {
        const userMsgArray = userMessageObj.User_message;
        
        console.log('📦 User_message trouvé:', userMsgArray.length, 'items');
        
        for (const item of userMsgArray) {
            const key = Object.keys(item)[0];
            const value = item[key];
            
            console.log('🔍 Clé:', key, '→ Valeur:', value);
            
            // Extraire selon le nom de la clé (insensible à la casse)
            const keyLower = key.toLowerCase();
            
            // Mapping des clés frontend vers variables agent RAG
            if (keyLower.includes('reference')) {
                result.user_message = value;
                console.log('✅ user_message extrait depuis [reference]:', value);
            } else if (keyLower.includes('cycle')) {
                result.cycle = value;
                console.log('✅ cycle extrait:', value);
            } else if (keyLower.includes('test]') && !keyLower.includes('nature')) {
                result.constat = value;
                console.log('✅ constat extrait depuis [test]:', value);
            } else if (keyLower.includes('anomalie')) {
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
