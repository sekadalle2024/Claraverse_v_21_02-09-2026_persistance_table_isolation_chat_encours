/**
 * Node N8N : Alea Generator DYNAMIQUE
 * 
 * Génère un nombre aléatoire et PRÉSERVE automatiquement
 * TOUTES les variables reçues en entrée, quelle que soit leur nombre.
 * 
 * Type de node : Code (JavaScript)
 * À placer entre "Extract Variables" et "Agent RAG"
 */

const inputData = $input.first().json;

// Générer un nombre aléatoire entre 1 et 4
const alea = Math.floor(Math.random() * 4) + 1;

// Créer le résultat en préservant TOUTES les variables d'entrée
const result = {
    alea: alea,
    ...inputData  // Spread operator : copie TOUTES les propriétés de inputData
};

console.log('🎲 Alea généré:', alea);
console.log('📦 Variables reçues:', Object.keys(inputData).length);
console.log('📤 Variables transmises:', Object.keys(result).length);
console.log('📋 Liste des variables:', Object.keys(result).join(', '));

return [{ json: result }];
