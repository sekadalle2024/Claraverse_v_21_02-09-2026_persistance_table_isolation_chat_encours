/**
 * Node N8N : Remplacement du node "Alea16"
 * 
 * Ce node remplace "Alea16" (Edit Fields) par un node Code JavaScript
 * qui fait exactement la même chose : ajouter "alea" + préserver les 7 variables
 * 
 * Type de node : Code (JavaScript)
 * À placer entre "Extract Variables for RAG" et "Agent RAG"
 */

const inputData = $input.first().json;

// Générer un nombre aléatoire entre 1 et 4
const alea = Math.floor(Math.random() * 4) + 1;

// Créer le résultat avec alea + toutes les 7 variables préservées
const result = {
    alea: alea,
    command: inputData.command || "Non fourni",
    cycle: inputData.cycle || "Non fourni",
    test: inputData.test || "Non fourni",
    reference: inputData.reference || "Non fourni",
    nature_test: inputData.nature_test || "Non fourni",
    assertion: inputData.assertion || "Non fourni",
    anomalie: inputData.anomalie || "Non fourni"
};

console.log('🎲 Alea généré:', alea);
console.log('� Variables reçues en entrée:', JSON.stringify(inputData, null, 2));
console.log('�📤 Résultat avec 8 valeurs (alea + 7 variables):', JSON.stringify(result, null, 2));

return [{ json: result }];
