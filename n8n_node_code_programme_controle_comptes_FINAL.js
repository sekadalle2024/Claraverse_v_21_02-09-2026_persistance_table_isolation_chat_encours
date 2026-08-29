// ============================================================
// NODE CODE — Parseur JSON robuste + formatage FORMAT 4
// Pour workflow: Programme contrôle comptes (Case 19)
// Attendu par claraApiService.ts → normalizeN8nResponse()
// FORMAT 4: [{ data: { "Tableau entete": {...}, "Tableau processus": [...] } }]
// ============================================================

// 1. Récupérer la sortie brute du LLM (Agent)
const agentOutput = $input.first();
let rawOutput = '';

if (agentOutput && agentOutput.json) {
  rawOutput = agentOutput.json.output
    || agentOutput.json.text
    || agentOutput.json.response
    || agentOutput.json.content
    || '';
}

console.log('[CODE NODE] Longueur output brut:', rawOutput.length);
console.log('[CODE NODE] Aperçu (300 chars):', rawOutput.substring(0, 300));

if (!rawOutput || rawOutput.trim() === '') {
  throw new Error('Output LLM vide ou non trouvé. Vérifiez le node Agent.');
}

// 2. Extraire le JSON — retirer les blocs markdown si présents
let jsonStr = rawOutput.trim();

// Cas 1 : bloc ```json ... ```
const jsonFenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
if (jsonFenceMatch) {
  jsonStr = jsonFenceMatch[1].trim();
  console.log('[CODE NODE] Markdown fence détectée et retirée.');
}

// Cas 2 : parfois le LLM ajoute du texte avant { ou après }
const firstBrace = jsonStr.indexOf('[');
const lastBrace = jsonStr.lastIndexOf(']');

// Chercher aussi les accolades si pas de crochets
const firstCurly = jsonStr.indexOf('{');
const lastCurly = jsonStr.lastIndexOf('}');

let startPos = -1;
let endPos = -1;

if (firstBrace !== -1 && lastBrace !== -1) {
  startPos = firstBrace;
  endPos = lastBrace + 1;
} else if (firstCurly !== -1 && lastCurly !== -1) {
  startPos = firstCurly;
  endPos = lastCurly + 1;
}

if (startPos > 0 || endPos < jsonStr.length) {
  if (startPos !== -1 && endPos !== -1) {
    jsonStr = jsonStr.substring(startPos, endPos);
    console.log('[CODE NODE] Texte parasite avant/après JSON retiré.');
  }
}

// 3. Corriger les séquences d'échappement invalides
// Passe A : réparer les backslashes isolés
jsonStr = jsonStr.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');

// Passe B : supprimer les caractères de contrôle sauf \n \r \t légitimes
jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

console.log('[CODE NODE] Nettoyage des escapes effectué.');

// 4. Parser le JSON avec fallback progressif
let parsedData;

try {
  // Tentative 1 : parse direct
  parsedData = JSON.parse(jsonStr);
  console.log('[CODE NODE] ✅ Parse JSON réussi (tentative 1).');
} catch (err1) {
  console.warn('[CODE NODE] ⚠️ Parse échoué (tentative 1):', err1.message);
  
  try {
    // Tentative 2 : supprimer tous les caractères de contrôle Unicode
    const cleanStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
    parsedData = JSON.parse(cleanStr);
    console.log('[CODE NODE] ✅ Parse JSON réussi (tentative 2).');
  } catch (err2) {
    console.error('[CODE NODE] ❌ Parse échoué (tentative 2):', err2.message);
    
    // Tentative 3 : utiliser Function() pour un parsing plus permissif
    try {
      parsedData = (new Function('return ' + jsonStr))();
      console.log('[CODE NODE] ✅ Parse réussi via Function() (tentative 3).');
    } catch (err3) {
      // Retourner un message d'erreur structuré mais valide pour le front-end
      parsedData = {
        "Tableau entete": {
          "Etape": "Erreur de traitement JSON",
          "Normes": "N/A",
          "Reference": "ERR-001",
          "Methode": "Voir détail ci-dessous"
        },
        "Tableau processus": [
          {
            "no": 1,
            "Erreur": err1.message,
            "Position": "Vérifier les caractères autour de la position indiquée",
            "Solution": "Réduire la complexité du prompt ou augmenter la rigueur du format demandé au LLM"
          }
        ]
      };
      console.log('[CODE NODE] ⚠️ Retour d\'un objet erreur structuré.');
    }
  }
}

// 5. Normaliser la structure pour correspondre au FORMAT 4
// Le front-end attend: [{ data: { "Tableau entete": {...}, "Tableau processus": [...] } }]

let finalData;

// Cas A: Le LLM a retourné un array avec les 2 objets séparés
// Format: [{ "Tableau entete": {...} }, { "Tableau processus": [...] }]
if (Array.isArray(parsedData) && parsedData.length >= 2) {
  console.log('[CODE NODE] Format détecté: Array avec objets séparés');
  
  // Fusionner les objets en un seul
  finalData = {};
  parsedData.forEach(item => {
    if (item && typeof item === 'object') {
      Object.assign(finalData, item);
    }
  });
  
  console.log('[CODE NODE] Objets fusionnés:', Object.keys(finalData));
}
// Cas B: Le LLM a retourné directement l'objet avec les 2 clés
// Format: { "Tableau entete": {...}, "Tableau processus": [...] }
else if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
  console.log('[CODE NODE] Format détecté: Objet direct avec 2 clés');
  finalData = parsedData;
}
// Cas C: Format inattendu
else {
  console.warn('[CODE NODE] ⚠️ Format inattendu, utilisation tel quel');
  finalData = parsedData;
}

// 6. Vérifier que les clés attendues sont présentes
const hasTableauEntete = finalData && 'Tableau entete' in finalData;
const hasTableauProcessus = finalData && 'Tableau processus' in finalData;

console.log('[CODE NODE] Vérification structure:', {
  hasTableauEntete,
  hasTableauProcessus,
  keys: finalData ? Object.keys(finalData) : []
});

if (!hasTableauEntete || !hasTableauProcessus) {
  console.warn('[CODE NODE] ⚠️ Structure incomplète détectée');
  
  // Essayer de corriger les noms de clés (variations possibles)
  if (finalData && typeof finalData === 'object') {
    const keys = Object.keys(finalData);
    
    // Chercher des variations de "Tableau entete"
    const enteteKey = keys.find(k => 
      k.toLowerCase().includes('entete') || 
      k.toLowerCase().includes('header') ||
      k.toLowerCase().includes('tableau') && k !== 'Tableau processus'
    );
    
    // Chercher des variations de "Tableau processus"
    const processusKey = keys.find(k => 
      k.toLowerCase().includes('processus') || 
      k.toLowerCase().includes('process') ||
      k.toLowerCase().includes('data')
    );
    
    if (enteteKey && enteteKey !== 'Tableau entete') {
      finalData['Tableau entete'] = finalData[enteteKey];
      delete finalData[enteteKey];
      console.log('[CODE NODE] Clé renommée:', enteteKey, '→ Tableau entete');
    }
    
    if (processusKey && processusKey !== 'Tableau processus') {
      finalData['Tableau processus'] = finalData[processusKey];
      delete finalData[processusKey];
      console.log('[CODE NODE] Clé renommée:', processusKey, '→ Tableau processus');
    }
  }
}

// 7. Retourner dans le FORMAT 4 attendu par claraApiService.ts
// Structure obligatoire : [{ data: { ... } }]
// normalizeN8nResponse() vérifie : Array.isArray(result) && result[0].data
const output = [
  {
    data: finalData
  }
];

console.log('[CODE NODE] ✅ Format final généré:', {
  isArray: Array.isArray(output),
  hasData: output[0] && 'data' in output[0],
  dataKeys: output[0].data ? Object.keys(output[0].data) : [],
  tableauProcessusLength: output[0].data && output[0].data['Tableau processus'] 
    ? output[0].data['Tableau processus'].length 
    : 0
});

return output;
