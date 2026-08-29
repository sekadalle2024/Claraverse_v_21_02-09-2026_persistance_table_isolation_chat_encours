# Structure JSON Hiérarchique pour Documents Word et PDF

## Objectif
Modifier la structure JSON des fichiers Word/Doc et PDF envoyés vers n8n pour qu'ils soient modélisés en **nested JSON hiérarchique** selon la structure des titres du document.

## Modifications Appliquées

### Fichier modifié
- `src/services/claraAttachmentService.ts`

### Types de fichiers supportés
- **Excel** (.xlsx, .xls) - Structure `onglet_X - table Y`
- **Word** (.doc, .docx) - Structure hiérarchique avec paragraphes et tableaux
- **PDF** (.pdf) - Structure hiérarchique identique à Word

## Nouvelles fonctionnalités

### 1. Support PDF avec pdfjs-dist
Les fichiers PDF sont maintenant extraits et structurés de la même manière que les fichiers Word :
- Extraction du texte page par page
- Détection des titres hiérarchiques
- Structure JSON nested identique

### 2. Extraction hiérarchique des titres
Les titres sont détectés selon plusieurs patterns :
- **Chiffres romains** : I., II., III., IV., V., etc. (Niveau 1)
- **Chapitres** : 1., 2., 3., etc. (Niveau 1)
- **Sections** : 1.1, 2.1, etc. (Niveau 2)
- **Sous-sections** : 1.1.1, 2.1.1, etc. (Niveau 3)
- **Sous-sous-sections** : 1.1.1.1, etc. (Niveau 4)
- **Lettres majuscules** : A., B., C., etc. (Niveau 2)
- **Lettres minuscules** : a., b., c., etc. (Niveau 3)
- **Lettres entre parenthèses** : (a), (b), (c), etc. (Niveau 3)
- **Numéros entre parenthèses** : (1), (2), (3), etc. (Niveau 3)
- **Puces** : -, •, *, etc. (Niveau 4)

### 3. Paragraphes numérotés
Les textes dans chaque section sont structurés avec des clés chronologiques :
```json
{
  "paragraphe_1": "Premier paragraphe...",
  "paragraphe_2": "Deuxième paragraphe...",
  "paragraphe_3": "Troisième paragraphe..."
}
```

### 4. Tableaux numérotés
Les tableaux dans chaque section sont structurés avec des clés chronologiques :
```json
{
  "table_1": [
    { "Colonne1": "valeur1", "Colonne2": "valeur2" },
    { "Colonne1": "valeur3", "Colonne2": "valeur4" }
  ],
  "table_2": [...]
}
```

## Exemple de Structure JSON Résultante

### Document Word/PDF d'entrée
```
1. Introduction
   Ceci est le premier paragraphe de l'introduction.
   Ceci est le deuxième paragraphe.

   1.1 Contexte
       Description du contexte.
       
       a. Point A
          Détails du point A.
       
       b. Point B
          Détails du point B.

2. Méthodologie
   Description de la méthodologie.
   
   | Étape | Description |
   |-------|-------------|
   | 1     | Analyse     |
   | 2     | Conception  |
```

### JSON Résultant
```json
{
  "DOCUMENT.docx": {
    "1. Introduction": {
      "paragraphe_1": "Ceci est le premier paragraphe de l'introduction.",
      "paragraphe_2": "Ceci est le deuxième paragraphe.",
      "1.1 Contexte": {
        "paragraphe_1": "Description du contexte.",
        "a. Point A": "Détails du point A.",
        "b. Point B": "Détails du point B."
      }
    },
    "2. Méthodologie": {
      "paragraphe_1": "Description de la méthodologie.",
      "table_1": [
        { "Étape": "1", "Description": "Analyse" },
        { "Étape": "2", "Description": "Conception" }
      ]
    }
  }
}
```

## Méthodes Ajoutées/Modifiées

### Pour Word
- `formatWordForN8nStructured()` - Formate le document Word en JSON hiérarchique
- `parseWordToHierarchicalJson()` - Parse le texte en détectant les patterns de titres
- `extractWordContent()` - Extrait le contenu structuré des documents Word
- `parseWordXmlToStructured()` - Parse le XML Word pour extraire les styles de titres
- `parseWordTable()` - Parse les tableaux Word XML en array d'objets

### Pour PDF (NOUVEAU)
- `extractPdfContent()` - Extrait le contenu des fichiers PDF avec pdfjs-dist
- `parsePdfToHierarchicalJson()` - Parse le texte PDF en structure hiérarchique
- `formatPdfForN8nStructured()` - Formate le document PDF en JSON hiérarchique

### Utilitaires communs
- `buildHierarchyFromBlocks()` - Construit la structure hiérarchique
- `cleanupHierarchicalStructure()` - Nettoie la structure JSON
- `parseTableFromLines()` - Parse les tableaux markdown en array d'objets
- `tableToText()` - Convertit les tableaux en texte markdown

## Dépendances

### Librairies utilisées
- **xlsx** - Pour l'extraction des fichiers Excel
- **jszip** - Pour l'extraction des fichiers Word (.docx)
- **pdfjs-dist** - Pour l'extraction des fichiers PDF (déjà installé)

## Compatibilité

Les modifications sont **rétrocompatibles** :
- Les autres workflows n8n existants continuent de fonctionner
- Les fichiers Excel sont toujours traités avec la structure `onglet_X - table Y`
- La méthode `formatDataForN8nStructured()` utilise automatiquement le bon format selon le type de fichier

## Test

Pour tester, envoyez un fichier Word ou PDF avec des titres hiérarchiques vers l'endpoint n8n et vérifiez la structure JSON dans les logs de la console.

## Node Code n8n

Un nouveau node code n8n a été créé pour supporter les deux formats (ancien et nouveau) :
- Fichier : `workflows/n8n-code-transform-claraverse-data-v2.js`

### Utilisation dans n8n

1. Créez un node "Code" dans votre workflow n8n
2. Copiez le contenu de `n8n-code-transform-claraverse-data-v2.js`
3. Le node détecte automatiquement le format des données et les structure correctement

### Formats supportés

Le node code supporte :
1. **Nouveau format direct** : `{ data: [...] }` - Les données sont déjà structurées
2. **Ancien format Excel** : `displayMeta.flowiseExtractedData` 
3. **Ancien format Word/PDF** : `displayMeta.n8nExtractedData.files` avec `hierarchicalData` ou `structuredData`

### Priorité de traitement pour Word/PDF

1. `file.hierarchicalData` - Structure hiérarchique directe (nouveau format)
2. `file.structuredData` - Si c'est une structure hiérarchique (pas juste rawText)
3. `file.structuredData.rawText` - Texte brut à parser
4. `file.extractedText` - Fallback sur le texte extrait
