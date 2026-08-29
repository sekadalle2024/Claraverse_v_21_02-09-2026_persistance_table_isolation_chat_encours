# Diagramme de Transformation - FORMAT 4

## 🔄 Vue d'Ensemble du Flux

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW N8N                                │
│                                                                     │
│  ┌──────────────┐                                                  │
│  │ User Message │                                                  │
│  └──────┬───────┘                                                  │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ LLM "Frap" (Gemini)                                      │     │
│  │ Génère JSON avec échappements                            │     │
│  └──────┬───────────────────────────────────────────────────┘     │
│         │                                                          │
│         │ JSON brut :                                              │
│         │ "{\n  \"Etape mission - ...\":\n  [\n    ..."            │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ "Json clean etape Frap V5 ok"                            │     │
│  │ Nettoie les backticks et échappements basiques           │     │
│  └──────┬───────────────────────────────────────────────────┘     │
│         │                                                          │
│         │ JSON nettoyé :                                           │
│         │ { "Etape mission - ...": [...] }                         │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ "node clean" ← MODIFIÉ                                   │     │
│  │ • Nettoie échappements multiples                         │     │
│  │ • Parse le JSON                                          │     │
│  │ • Enveloppe dans FORMAT 4                                │     │
│  └──────┬───────────────────────────────────────────────────┘     │
│         │                                                          │
│         │ FORMAT 4 :                                               │
│         │ [{ "data": { "Etape mission - ...": [...] } }]           │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ "Markdown Generator" ← SIMPLIFIÉ                         │     │
│  │ Passthrough simple (pas de conversion)                   │     │
│  └──────┬───────────────────────────────────────────────────┘     │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ "Respond to Webhook"                                     │     │
│  │ Retourne au frontend                                     │     │
│  └──────┬───────────────────────────────────────────────────┘     │
│         │                                                          │
└─────────┼──────────────────────────────────────────────────────────┘
          │
          │ HTTP Response
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (claraApiService.ts)                    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ normalizeN8nResponse()                                   │     │
│  │ Détecte le format de la réponse                          │     │
│  └──────┬───────────────────────────────────────────────────┘     │
│         │                                                          │
│         │ Détection FORMAT 4 :                                     │
│         │ if (Array.isArray(result) && result[0].data)             │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ convertStructuredDataToMarkdown()                        │     │
│  │ • Parcourt les tables                                    │     │
│  │ • Détecte le type (header/data_array/download)           │     │
│  │ • Génère le Markdown approprié                           │     │
│  └──────┬───────────────────────────────────────────────────┘     │
│         │                                                          │
│         │ Markdown généré :                                        │
│         │ | Rubrique | Description |                               │
│         │ |----------|-------------|                               │
│         │ | ...      | ...         |                               │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ Affichage dans l'interface utilisateur                   │     │
│  │ Tables formatées avec accordéons                         │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Transformation Détaillée du JSON

### Étape 1 : JSON brut du LLM
```json
"{\n  \"Etape mission - Recos revision des comptes\": [\n    {\n      \"table 1\": {\n        \"Etape de mission\": \"Recommendations comptables\"\n      }\n    }\n  ]\n}"
```

### Étape 2 : Après "Json clean etape Frap V5 ok"
```json
{
  "Etape mission - Recos revision des comptes": [
    {
      "table 1": {
        "Etape de mission": "Recommendations comptables"
      }
    }
  ]
}
```

### Étape 3 : Après "node clean" (FORMAT 4)
```json
[
  {
    "data": {
      "Etape mission - Recos revision des comptes": [
        {
          "table 1": {
            "Etape de mission": "Recommendations comptables"
          }
        }
      ]
    }
  }
]
```

### Étape 4 : Après conversion Markdown (Frontend)
```markdown
| Rubrique | Description |
|----------|-------------|
| **Etape de mission** | Recommendations comptables |
```

---

## 🔍 Détection des Types de Tables

```
┌─────────────────────────────────────────────────────────────┐
│         convertStructuredDataToMarkdown()                   │
│                                                             │
│  Pour chaque table dans le JSON :                          │
│                                                             │
│  ┌─────────────────────────────────────────────────┐       │
│  │ detectTableType(tableKey, tableData)            │       │
│  └─────────────┬───────────────────────────────────┘       │
│                │                                            │
│                ├─► "header"                                 │
│                │   • Objet simple (2-5 propriétés)          │
│                │   • Valeurs non-objets                     │
│                │   • Mots-clés : etape, reference, titre    │
│                │   → Format : 2 colonnes (Propriété/Valeur) │
│                │                                            │
│                ├─► "data_array"                             │
│                │   • Array d'objets                         │
│                │   • Plusieurs lignes de données            │
│                │   → Format : Tableau multi-colonnes        │
│                │                                            │
│                ├─► "download"                               │
│                │   • Contient URLs                          │
│                │   • Mots-clés : telecharger, download      │
│                │   → Format : Liens cliquables              │
│                │                                            │
│                └─► "unknown"                                │
│                    • Format non reconnu                     │
│                    → Conversion générique                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Exemples de Rendu Markdown

### Type "header" (table 1)
```markdown
| Rubrique | Description |
|----------|-------------|
| **Etape de mission** | Recommendations comptables |
| **Norme** | Norme ISA |
| **Méthode** | Méthode de la regularisations |
| **Reference** | Recos revision-001 |
```

### Type "data_array" (tableau de contrôles)
```markdown
### 📑 Programme de Travail - Contrôles Audit

| N° | Contrôle | Objectif | Risque |
|----|----------|----------|--------|
| 1 | Rapprochement caisse | Validité | Sur-évaluation |
| 2 | Vérification pièces | Exhaustivité | Sous-évaluation |
```

### Type "download"
```markdown
## 📥 Ressources et Téléchargements

🔗 **[Télécharger le modèle](https://example.com/template.xlsx)**

🔗 **[Guide utilisateur](https://example.com/guide.pdf)**
```

---

## ⚙️ Configuration du Frontend

### Détection FORMAT 4 (claraApiService.ts)
```typescript
// Ligne 760-810
if (Array.isArray(result) && result.length > 0) {
  const firstItem = result[0];
  
  if (firstItem && typeof firstItem === "object" && "data" in firstItem) {
    console.log('✅ FORMAT 4 DETECTE');
    
    const dataContent = firstItem.data;
    contentToDisplay = this.convertStructuredDataToMarkdown(dataContent);
    
    metadata = {
      format: "programme_travail_data",
      timestamp: new Date().toISOString(),
      totalItems: result.length,
      dataStructure: Object.keys(dataContent)[0],
      contentLength: contentToDisplay.length,
    };
    
    return { content: contentToDisplay, metadata };
  }
}
```

---

## 🔧 Points Clés de la Correction

1. **Nettoyage des échappements** : `\\\\` → `\\`
2. **Enveloppe FORMAT 4** : `{ data: parsedData }`
3. **Retour en array** : `[{ json: formattedResponse }]`
4. **Passthrough Markdown** : Pas de conversion côté backend
5. **Conversion frontend** : `convertStructuredDataToMarkdown()`

---

**Date** : 24 Mars 2026  
**Version** : 1.0  
**Statut** : ✅ Documentation complète
