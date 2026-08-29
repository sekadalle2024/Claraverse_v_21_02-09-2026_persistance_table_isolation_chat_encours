// ============================================================
// NODE CODE SOLUTION FINALE — Programme contrôle comptes
// RETOURNE [{ data: {...} }] SANS la propriété "json"
// ============================================================

console.log('🚀 [SOLUTION FINALE] Démarrage du traitement...');

// 1. Récupérer TOUTES les données disponibles
const items = $input.all();
console.log(`📦 [SOLUTION FINALE] Nombre d'items reçus: ${items.length}`);

let rawOutput = '';
let sourceType = 'unknown';

// Essayer de trouver l'output dans différents emplacements
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  console.log(`🔍 [SOLUTION FINALE] Analyse item ${i}:`, Object.keys(item.json || {}));
  
  if (item.json) {
    // Cas 1: output direct
    if (item.json.output) {
      rawOutput = item.json.output;
      sourceType = 'output';
      break;
    }
    // Cas 2: text
    if (item.json.text) {
      rawOutput = item.json.text;
      sourceType = 'text';
      break;
    }
    // Cas 3: response
    if (item.json.response) {
      rawOutput = item.json.response;
      sourceType = 'response';
      break;
    }
    // Cas 4: content
    if (item.json.content) {
      rawOutput = item.json.content;
      sourceType = 'content';
      break;
    }
    // Cas 5: data (déjà parsé)
    if (item.json.data) {
      console.log('✅ [SOLUTION FINALE] Données déjà dans format data');
      // CRITIQUE: Retourner SANS la propriété "json"
      return [{ data: item.json.data }];
    }
  }
}

console.log(`📍 [SOLUTION FINALE] Source trouvée: ${sourceType}`);
console.log(`📏 [SOLUTION FINALE] Longueur: ${rawOutput.length} caractères`);
console.log(`👀 [SOLUTION FINALE] Aperçu (200 chars):`, rawOutput.substring(0, 200));

if (!rawOutput || rawOutput.trim() === '') {
  throw new Error('❌ Output LLM vide. Vérifiez le node Agent.');
}

// 2. Nettoyer et extraire le JSON
let jsonStr = rawOutput.trim();

// Retirer les blocs markdown ```json...```
const jsonFenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
if (jsonFenceMatch) {
  jsonStr = jsonFenceMatch[1].trim();
  console.log('🧹 [SOLUTION FINALE] Bloc markdown retiré');
}

// Trouver les limites du JSON (array ou objet)
const firstBracket = jsonStr.indexOf('[');
const lastBracket = jsonStr.lastIndexOf(']');
const firstBrace = jsonStr.indexOf('{');
const lastBrace = jsonStr.lastIndexOf('}');

let startPos = -1;
let endPos = -1;

// Priorité aux arrays
if (firstBracket !== -1 && lastBracket !== -1) {
  startPos = firstBracket;
  endPos = lastBracket + 1;
} else if (firstBrace !== -1 && lastBrace !== -1) {
  startPos = firstBrace;
  endPos = lastBrace + 1;
}

if (startPos > 0 || endPos < jsonStr.length) {
  if (startPos !== -1 && endPos !== -1) {
    jsonStr = jsonStr.substring(startPos, endPos);
    console.log('🧹 [SOLUTION FINALE] Texte parasite retiré');
  }
}

// Nettoyer les échappements invalides
jsonStr = jsonStr.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

console.log('✨ [SOLUTION FINALE] JSON nettoyé');

// 3. Parser le JSON
let parsedData;

try {
  parsedData = JSON.parse(jsonStr);
  console.log('✅ [SOLUTION FINALE] Parse JSON réussi');
} catch (err1) {
  console.warn('⚠️ [SOLUTION FINALE] Parse échoué (tentative 1):', err1.message);
  
  try {
    const cleanStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
    parsedData = JSON.parse(cleanStr);
    console.log('✅ [SOLUTION FINALE] Parse JSON réussi (tentative 2)');
  } catch (err2) {
    console.error('❌ [SOLUTION FINALE] Parse échoué (tentative 2):', err2.message);
    
    // CRITIQUE: Retourner SANS la propriété "json"
    return [{
      data: {
        "Tableau entete": {
          "Etape": "Erreur de parsing JSON",
          "Normes": "N/A",
          "Reference": "ERR-001",
          "Methode": err1.message
        },
        "Tableau processus": []
      }
    }];
  }
}

console.log('📊 [SOLUTION FINALE] Type parsé:', Array.isArray(parsedData) ? 'Array' : 'Object');

// 4. Normaliser la structure
let finalData = {};

// CAS A: Array avec 2 objets séparés
// [{"Tableau entete": {...}}, {"Tableau processus": [...]}]
if (Array.isArray(parsedData)) {
  console.log(`📋 [SOLUTION FINALE] Array de ${parsedData.length} élément(s)`);
  
  parsedData.forEach((item, index) => {
    if (item && typeof item === 'object') {
      console.log(`  → Item ${index}:`, Object.keys(item));
      Object.assign(finalData, item);
    }
  });
  
  console.log('🔀 [SOLUTION FINALE] Objets fusionnés');
}
// CAS B: Objet direct avec les 2 clés
// {"Tableau entete": {...}, "Tableau processus": [...]}
else if (parsedData && typeof parsedData === 'object') {
  console.log('📦 [SOLUTION FINALE] Objet direct');
  finalData = parsedData;
}

// 5. Vérifier et normaliser les noms de clés
const keys = Object.keys(finalData);
console.log('🔑 [SOLUTION FINALE] Clés trouvées:', keys);

let hasTableauEntete = 'Tableau entete' in finalData;
let hasTableauProcessus = 'Tableau processus' in finalData;

// Chercher des variations de noms
if (!hasTableauEntete) {
  const enteteKey = keys.find(k => 
    k.toLowerCase().includes('entete') || 
    k.toLowerCase().includes('header') ||
    k.toLowerCase().includes('en-tete') ||
    (k.toLowerCase().includes('tableau') && !k.toLowerCase().includes('processus'))
  );
  
  if (enteteKey) {
    finalData['Tableau entete'] = finalData[enteteKey];
    if (enteteKey !== 'Tableau entete') {
      delete finalData[enteteKey];
    }
    hasTableauEntete = true;
    console.log(`🔄 [SOLUTION FINALE] Clé renommée: "${enteteKey}" → "Tableau entete"`);
  }
}

if (!hasTableauProcessus) {
  const processusKey = keys.find(k => 
    k.toLowerCase().includes('processus') || 
    k.toLowerCase().includes('process') ||
    k.toLowerCase().includes('data') ||
    k.toLowerCase().includes('items')
  );
  
  if (processusKey) {
    finalData['Tableau processus'] = finalData[processusKey];
    if (processusKey !== 'Tableau processus') {
      delete finalData[processusKey];
    }
    hasTableauProcessus = true;
    console.log(`🔄 [SOLUTION FINALE] Clé renommée: "${processusKey}" → "Tableau processus"`);
  }
}

// 6. Validation finale
console.log('🎯 [SOLUTION FINALE] Validation:', {
  hasTableauEntete,
  hasTableauProcessus,
  processusIsArray: Array.isArray(finalData['Tableau processus']),
  processusLength: finalData['Tableau processus'] ? finalData['Tableau processus'].length : 0
});

if (!hasTableauEntete || !hasTableauProcessus) {
  console.warn('⚠️ [SOLUTION FINALE] Structure incomplète !');
  console.warn('Clés disponibles:', Object.keys(finalData));
}

// 7. RETOURNER DIRECTEMENT L'OBJET { data: {...} } SANS la propriété "json"
// n8n exige que "json" soit un objet, donc on retourne directement data
const output = {
  data: finalData
};

console.log('✅ [SOLUTION FINALE] Format final généré');
console.log('🎯 [SOLUTION FINALE] STRUCTURE: { data: {...} }');
console.log('📤 [SOLUTION FINALE] Détails:', {
  hasDataProperty: true,
  dataKeys: Object.keys(finalData),
  tableauEnteteKeys: finalData['Tableau entete'] ? Object.keys(finalData['Tableau entete']) : [],
  tableauProcessusLength: finalData['Tableau processus'] ? finalData['Tableau processus'].length : 0
});

return output;
