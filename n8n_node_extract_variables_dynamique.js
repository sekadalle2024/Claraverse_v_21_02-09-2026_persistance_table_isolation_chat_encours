/**
 * Node N8N : Extract Variables DYNAMIQUE - Auto-détection
 * 
 * Détecte AUTOMATIQUEMENT toutes les variables dans User_message
 * et les extrait sans avoir à les spécifier manuellement.
 * 
 * Fonctionne pour TOUTES les étapes de mission avec des variables différentes.
 * 
 * Type de node : Code (JavaScript)
 * À placer entre "Code integrate7" et "Alea Generator"
 */

const inputData = $input.first().json;

// Objet pour stocker toutes les variables détectées
const result = {};

// Extraire TOUTES les variables depuis User_message
if (inputData.data && inputData.data.length > 0) {
    const firstItem = inputData.data[0];
    
    if (firstItem && firstItem.User_message) {
        const userMsgArray = firstItem.User_message;
        
        console.log('📦 User_message trouvé:', userMsgArray.length, 'items');
        
        // Parcourir tous les items et extraire automatiquement
        for (const item of userMsgArray) {
            const key = Object.keys(item)[0];
            const value = item[key] || "";
            
            // Nettoyer le nom de la clé pour créer un nom de variable valide
            // [Command] → command
            // [Cycle] → cycle
            // [Nature de test] → nature_de_test
            let variableName = key
                .replace(/[\[\]]/g, '')  // Enlever les crochets
                .toLowerCase()            // Mettre en minuscules
                .trim()                   // Enlever les espaces aux extrémités
                .replace(/\s+/g, '_')     // Remplacer les espaces par _
                .replace(/[éèê]/g, 'e')   // Normaliser les accents
                .replace(/[àâ]/g, 'a');
            
            // Ajouter la variable au résultat
            result[variableName] = value;
            
            console.log(`✅ ${key} → ${variableName} = "${value}"`);
        }
        
        console.log(`📊 Total: ${Object.keys(result).length} variables extraites`);
    } else {
        console.log('⚠️ User_message non trouvé dans data[0]');
    }
} else {
    console.log('⚠️ Aucune donnée dans inputData.data');
}

// Si aucune variable n'a été extraite, ajouter un message par défaut
if (Object.keys(result).length === 0) {
    result.message = "Aucune variable détectée";
}

console.log('📤 Résultat final:', JSON.stringify(result, null, 2));

return [{ json: result }];
