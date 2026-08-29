/**
 * Node N8N : Alea Generator avec 4 Variables Essentielles
 * 
 * Génère un nombre aléatoire et préserve les 4 variables essentielles :
 * - cycle
 * - reference
 * - assertion
 * - anomalie
 * 
 * Type de node : Code (JavaScript)
 * À placer entre "Extract 4 Variables" et "Agent RAG"
 */

const inputData = $input.first().json;

// Générer un nombre aléatoire entre 1 et 4
const alea = Math.floor(Math.random() * 4) + 1;

// Créer le résultat avec alea + les 4 variables essentielles
const result = {
    alea: alea,
    cycle: inputData.cycle || "Non fourni",
    reference: inputData.reference || "Non fourni",
    assertion: inputData.assertion || "Non fourni",
    anomalie: inputData.anomalie || "Non fourni"
};

console.log('🎲 Alea généré:', alea);
console.log('📤 Résultat avec 5 valeurs (alea + 4 variables):', JSON.stringify(result, null, 2));

return [{ json: result }];
