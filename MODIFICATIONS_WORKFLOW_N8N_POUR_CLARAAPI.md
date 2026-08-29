# Modifications du Workflow n8n pour Compatibilité avec claraApiService.ts

## 📋 Analyse du Traitement Frontend

Le fichier `src/services/claraApiService.ts` attend des formats de réponse spécifiques du workflow n8n. Voici les formats supportés et comment adapter votre workflow.

---

## 🎯 Formats de Réponse Supportés

### FORMAT 1 : Array avec `output` (Recommandé pour réponses simples)
```json
[
  {
    "output": "Contenu markdown ici...",
    "stats": {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "processingTime": 1234
    },
    "debugInfo": [],
    "consolidationSuccess": true
  }
]
```

**Utilisation** : Réponses textuelles simples, markdown formaté

---

### FORMAT 2 : Objet avec `tables` (Pour multiples tables)
```json
{
  "status": "success",
  "tables_found": 3,
  "tables": [
    {
      "markdown": "| Colonne 1 | Colonne 2 |\n|-----------|-----------|..."
    },
    {
      "markdown": "| Autre | Table |\n|-------|-------|..."
    }
  ]
}
```

**Utilisation** : Quand vous avez plusieurs tables markdown à afficher

---

### FORMAT 3 : Objet avec `output` direct
```json
{
  "output": "Contenu markdown...",
  "additionalInfo": "..."
}
```

**Utilisation** : Réponse simple avec métadonnées additionnelles

---

### FORMAT 4 : Array avec `data` (Pour Programme de travail) ⭐
```json
[
  {
    "data": {
      "Etape mission - Implementation": [
        {
          "table 1": {
            "Etape": "Programme de travail - Phase de Tests",
            "Normes": "Norme 2320 Analyse et évaluation",
            "Reference": "IMP-TRESO-003",
            "Methode": "Méthode des tests..."
          }
        },
        {
          "table 2": [
            {
              "no": 1,
              "Objectif de contrôle": "...",
              "Travaux a effectuer": "...",
              "Resultat": "...",
              "Conclusion": "..."
            }
          ]
        },
        {
          "table 3": {
            "Télécharger": "https://..."
          }
        }
      ]
    }
  }
]
```

**Utilisation** : Format structuré pour programmes de travail avec tables multiples

**Traitement Frontend** :
- Détecte automatiquement les types de tables (header, data_array, download)
- Convertit en markdown avec titres et formatage appropriés
- Supporte les tables d'en-tête, tableaux de données, et liens de téléchargement

---

### FORMAT 5 : Array CIA avec `Sous-section` (Pour cours CIA)
```json
[
  {
    "Sous-section": "Titre de la section",
    "Sub-items": [
      {
        "Titre": "...",
        "Contenu": "..."
      }
    ]
  }
]
```

**Utilisation** : Contenu de cours CIA avec accordéons

**Traitement Frontend** : Affiche avec préfixe `__CIA_ACCORDION__`

---

### FORMAT 6 : Array CIA QCM avec `Etape mission - CIA`
```json
[
  {
    "Etape mission - CIA": [
      {
        "table 1": {
          "Titre": "QCM...",
          "Questions": [...]
        }
      }
    ]
  }
]
```

**Utilisation** : QCM CIA avec accordéons

**Traitement Frontend** : Affiche avec préfixe `__CIA_QCM_ACCORDION__`

---

## 🔧 Modifications à Apporter au Workflow n8n

### Option 1 : Utiliser FORMAT 4 (Recommandé pour votre cas)

Votre workflow actuel génère déjà une structure proche. Il suffit d'encapsuler dans le bon format :

**Node "Code" final avant Webhook Response :**

```javascript
// Récupérer la réponse du LLM (déjà en JSON)
const llmResponse = $input.first().json;

// Encapsuler dans le FORMAT 4 attendu par claraApiService
const formattedResponse = [
  {
    data: llmResponse
  }
];

return formattedResponse;
```

**Explication** :
- Votre LLM génère déjà la structure `{ "Etape mission - Implementation": [...] }`
- On l'encapsule simplement dans `[{ data: ... }]`
- Le frontend détectera automatiquement FORMAT 4 et convertira en markdown

---

### Option 2 : Utiliser FORMAT 1 (Plus simple, moins de contrôle)

Si vous voulez que le LLM génère directement du markdown :

**Node "Code" final :**

```javascript
const llmResponse = $input.first().json;

// Convertir en markdown (vous devez implémenter cette logique)
const markdownContent = convertToMarkdown(llmResponse);

const formattedResponse = [
  {
    output: markdownContent,
    stats: {
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    },
    consolidationSuccess: true
  }
];

return formattedResponse;
```

---

## 📝 Exemple Complet de Modification

### Workflow Actuel (Simplifié)
```
[Webhook] → [LLM] → [Webhook Response]
```

### Workflow Modifié
```
[Webhook] → [LLM] → [Code: Format Response] → [Webhook Response]
```

### Code du Node "Format Response"

```javascript
// ============================================
// Node: Format Response pour claraApiService
// ============================================

// 1. Récupérer la réponse du LLM
const llmOutput = $input.first().json;

// 2. Vérifier si c'est déjà au bon format
let responseData;

if (typeof llmOutput === 'string') {
  // Si le LLM a retourné une string JSON, la parser
  try {
    responseData = JSON.parse(llmOutput);
  } catch (e) {
    // Si ce n'est pas du JSON, traiter comme markdown
    return [{
      json: [{
        output: llmOutput,
        stats: {
          timestamp: new Date().toISOString()
        }
      }]
    }];
  }
} else {
  responseData = llmOutput;
}

// 3. Formater selon FORMAT 4 (Programme de travail)
const formattedResponse = [{
  data: responseData
}];

// 4. Retourner au format attendu par n8n
return [{
  json: formattedResponse
}];
```

---

## 🧪 Test de la Réponse

### Dans n8n :

1. Ajoutez un node "Code" après votre LLM
2. Copiez le code ci-dessus
3. Testez avec un message : `Implementation du contrôle interne`
4. Vérifiez que la sortie ressemble à :

```json
[
  {
    "data": {
      "Etape mission - Implementation": [
        { "table 1": {...} },
        { "table 2": [...] },
        { "table 3": {...} }
      ]
    }
  }
]
```

### Dans le Frontend :

1. Envoyez un message via l'interface
2. Ouvrez la console du navigateur
3. Cherchez les logs :
   - `✅ FORMAT 4 DETECTE: Nouveau format "Programme de travail"`
   - `🔄 Début de la conversion en Markdown...`
   - `✅ Conversion terminée: XXX caractères générés`

---

## ⚠️ Points d'Attention

### 1. Erreur "Bad escaped character in JSON"

**Cause** : Caractères spéciaux mal échappés dans le JSON du LLM

**Solution** : Ajouter un node de nettoyage avant le formatage :

```javascript
// Node: Clean JSON
const llmOutput = $input.first().json;
let cleanedOutput = JSON.stringify(llmOutput);

// Nettoyer les caractères problématiques
cleanedOutput = cleanedOutput
  .replace(/\\/g, '\\\\')  // Échapper les backslashes
  .replace(/\n/g, '\\n')   // Échapper les retours à la ligne
  .replace(/\r/g, '\\r')   // Échapper les retours chariot
  .replace(/\t/g, '\\t');  // Échapper les tabulations

return [{
  json: JSON.parse(cleanedOutput)
}];
```

### 2. Timeout du Frontend

Le frontend a un timeout de 10 minutes par défaut. Pour les workflows longs :

```javascript
// Dans la console du navigateur
claraApiService.setN8nTimeout(15 * 60 * 1000); // 15 minutes
```

### 3. CORS

Assurez-vous que votre webhook n8n a les headers CORS :

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## 🎨 Personnalisation du Markdown Généré

Le frontend convertit automatiquement les tables en markdown avec :

- **Tables d'en-tête** : Format clé-valeur
- **Tables de données** : Tableaux markdown complets
- **Tables de téléchargement** : Liens cliquables

Si vous voulez personnaliser, modifiez les méthodes dans `claraApiService.ts` :
- `convertHeaderTableToMarkdown()`
- `convertArrayTableToMarkdown()`
- `convertDownloadTableToMarkdown()`

---

## 📊 Résumé des Modifications

| Élément | Avant | Après |
|---------|-------|-------|
| **Structure de réponse** | JSON brut du LLM | Encapsulé dans `[{ data: ... }]` |
| **Node ajouté** | - | "Format Response" (Code) |
| **Format détecté** | Unknown | FORMAT 4 (Programme de travail) |
| **Affichage** | JSON brut | Markdown formaté avec tables |

---

## 🚀 Prochaines Étapes

1. ✅ Ajouter le node "Format Response" dans votre workflow
2. ✅ Tester avec un message d'exemple
3. ✅ Vérifier les logs dans la console du navigateur
4. ✅ Ajuster le prompt du LLM si nécessaire pour respecter la structure
5. ✅ Documenter les cas d'usage spécifiques

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console du navigateur (F12)
2. Cherchez les messages commençant par `🔍`, `✅`, `❌`
3. Vérifiez que la structure JSON du LLM correspond au format attendu
4. Testez avec un payload minimal pour isoler le problème

---

**Date de création** : 2024
**Version** : 1.0
**Auteur** : Analyse basée sur claraApiService.ts
