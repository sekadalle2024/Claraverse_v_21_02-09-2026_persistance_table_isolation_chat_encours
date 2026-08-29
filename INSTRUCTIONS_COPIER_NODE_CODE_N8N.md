# Instructions : Copier le Node Code dans N8N
## Workflow Recos Revision des Comptes

---

## 📍 Localisation du Node

**Workflow** : Recos Revision des Comptes  
**Node** : "node clean" (après le LLM "Frap")  
**Position** : Entre le node LLM et le node "Markdown Generator"

---

## 🔄 Étapes à Suivre

### 1. Ouvrir le Workflow N8N

1. Accéder à n8n : `http://localhost:5678` (ou votre URL)
2. Ouvrir le workflow "Recos Revision des Comptes"
3. Localiser le node "node clean"

### 2. Ouvrir l'Éditeur de Code

1. Double-cliquer sur le node "node clean"
2. Voir l'onglet "Code" (JavaScript)
3. Sélectionner tout le code existant (Ctrl+A)

### 3. Remplacer le Code

**Code à copier** : Voir ci-dessous

```javascript
// Node Code N8N - Transformation JSON → Format claraApiService.ts
// WORKFLOW: Recos Revision des Comptes
// Compatible avec FORMAT 4 attendu par le frontend

const inputData = $input.all();
const results = [];

for (const item of inputData) {
  try {
    let rawText = '';
    
    // Extraction du contenu
    if (item.json.text) {
      rawText = item.json.text;
    } else if (item.json.output) {
      rawText = item.json.output;
    } else if (typeof item.json === 'string') {
      rawText = item.json;
    } else {
      rawText = JSON.stringify(item.json);
    }
    
    // Nettoyage des échappements multiples
    rawText = rawText.replace(/\\\\\\\\/g, '\\\\');
    rawText = rawText.replace(/\\\\\\\"/g, '\\"');
    rawText = rawText.replace(/\\\\n/g, '\n');
    
    // Nettoyage des backticks markdown
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/```$/, '').trim();
    }
    
    // Parsing du JSON
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      // Tentative de nettoyage supplémentaire
      rawText = rawText.replace(/[\r\n\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
      parsedData = JSON.parse(rawText);
    }
    
    // ============================================================
    // TRANSFORMATION VERS FORMAT 4 (claraApiService.ts)
    // ============================================================
    // Le frontend attend: [{ "data": { "Etape mission - ...": [...] } }]
    
    // Vérifier que parsedData contient bien la structure attendue
    const mainKey = Object.keys(parsedData)[0];
    
    if (!mainKey) {
      throw new Error('Aucune clé principale trouvée dans le JSON');
    }
    
    // Construire la réponse au format attendu par claraApiService.ts
    const formattedResponse = {
      data: parsedData  // Envelopper le JSON dans "data"
    };
    
    // Retourner au format array comme attendu par le frontend
    results.push({
      json: formattedResponse
    });
    
    console.log('✅ Transformation réussie vers FORMAT 4');
    console.log('📊 Clé principale:', mainKey);
    console.log('📋 Nombre de tables:', Array.isArray(parsedData[mainKey]) ? parsedData[mainKey].length : 'N/A');
    
  } catch (error) {
    console.error('❌ Erreur de traitement:', error.message);
    
    // En cas d'erreur, retourner une structure d'erreur compatible
    results.push({
      json: {
        data: {
          "Erreur": [{
            "table 1": {
              "Message": error.message,
              "Type": "Erreur de parsing JSON"
            }
          }]
        }
      }
    });
  }
}

if (results.length === 0) {
  return [{
    json: {
      data: {
        "Erreur": [{
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
```

### 4. Coller le Code

1. Coller le code ci-dessus dans l'éditeur
2. Vérifier qu'il n'y a pas d'erreurs de syntaxe (rouge)
3. Cliquer sur "Save" ou "Done"

### 5. Tester le Node

1. Cliquer sur "Test" (bouton play)
2. Vérifier que le node s'exécute sans erreur
3. Voir le résultat dans l'onglet "Output"

---

## ✅ Vérification du Résultat

### Output Attendu

```json
[
  {
    "json": {
      "data": {
        "Etape mission - Recos revision des comptes": [
          {
            "table 1": {
              "Etape de mission": "Recommendations comptables",
              "Norme": "Norme ISA",
              "Méthode": "Méthode de la regularisations des comptes par les assertions",
              "Reference": "Recos revision-001"
            }
          },
          {
            "table 2": {
              "Intitule": "Dépenses de caisse non appuyées par des pièces justificatives probantes"
            }
          },
          ...
        ]
      }
    }
  }
]
```

### Points de Vérification

- ✅ Structure `{ "data": { "Etape mission - ...": [...] } }`
- ✅ Tables numérotées (table 1, table 2, etc.)
- ✅ Pas d'erreur de parsing JSON
- ✅ Clé principale détectée correctement

---

## 🔍 Dépannage

### Erreur : "Bad escaped character in JSON"

**Cause** : Échappements mal gérés  
**Solution** : Vérifier les regex de nettoyage

```javascript
// Vérifier ces lignes :
rawText = rawText.replace(/\\\\\\\\/g, '\\\\');  // Quadruple → Double backslash
rawText = rawText.replace(/\\\\\\\"/g, '\\"');   // Guillemets échappés
rawText = rawText.replace(/\\\\n/g, '\n');       // Sauts de ligne
```

### Erreur : "Aucune clé principale trouvée"

**Cause** : Le JSON n'a pas la structure attendue  
**Solution** : Vérifier que le LLM retourne bien :

```json
{
  "Etape mission - Recos revision des comptes": [...]
}
```

### Erreur : "Cannot read property 'length' of undefined"

**Cause** : La clé principale n'est pas un array  
**Solution** : Vérifier la structure du JSON du LLM

---

## 📋 Checklist Finale

- [ ] Node "node clean" localisé
- [ ] Code copié et collé
- [ ] Pas d'erreurs de syntaxe
- [ ] Test exécuté avec succès
- [ ] Output contient structure `{ "data": {...} }`
- [ ] Workflow sauvegardé

---

## 🚀 Prochaine Étape

Une fois le node code mis à jour, tester le workflow complet :

1. Envoyer un message avec "Recos_revision"
2. Vérifier que les tables s'affichent correctement au frontend
3. Vérifier que table 1 = 2 colonnes, tables 2+ = 1 colonne rouge

