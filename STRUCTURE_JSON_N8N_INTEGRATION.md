# Structure JSON pour l'intégration n8n

## Résumé

Le front-end Claraverse envoie maintenant un JSON structuré vers n8n lorsque des pièces jointes (Excel, Word) sont présentes.

## Format du JSON envoyé

### Avec pièces jointes (nouveau format)

```json
{
  "data": [
    {
      "User_message": [
        { "[Command]": "Programme de travail" },
        { "[Processus]": "inventaire de caisse" },
        { "[Modele]": "Point de controle, Risque, assertion" },
        { "[Nb de lignes]": 20 }
      ]
    },
    {
      "Programme_de_travail.xlsx": [
        {
          "onglet_1 - table 1": [
            { "Nom de la banque": "BOA", "Numéro de compte": "CI123", "Devise": "XOF" },
            { "Nom de la banque": "Ecobank", "Numéro de compte": "CI055", "Devise": "XOF" }
          ]
        }
      ]
    },
    {
      "Rapport_audit.doc": [
        { "1. Titre": "FRAP N°01 - Ecart de caisse" },
        { "2. Observation": "Lors du comptage physique..." },
        { "3. Recommandation": "Procéder à la régularisation..." }
      ]
    }
  ]
}
```

### Sans pièces jointes (format legacy)

```json
{
  "question": "Votre message texte simple"
}
```

## Structure détaillée

### 1. User_message (Contexte utilisateur)

- **Type** : Array d'objets clé-valeur
- **Format des clés** : `[NomParametre]`
- **Usage** : Paramètres système extraits du message utilisateur

```json
{
  "User_message": [
    { "[Command]": "Programme de travail" },
    { "[Processus]": "inventaire de caisse" },
    { "[Nb de lignes]": 20 }
  ]
}
```

### 2. Fichiers Excel (*.xlsx, *.xls)

- **Clé racine** : Nom du fichier avec extension
- **Structure** : Array d'objets avec clé composite `onglet_X - table Y`
- **Valeur** : Array d'objets (lignes de données)

```json
{
  "MonFichier.xlsx": [
    {
      "onglet_1 - table 1": [
        { "Colonne A": "Valeur 1", "Colonne B": "Valeur 2" },
        { "Colonne A": "Valeur 3", "Colonne B": "Valeur 4" }
      ]
    },
    {
      "onglet_2 - table 1": [
        { "Autre Col": "Data" }
      ]
    }
  ]
}
```

### 3. Fichiers Word (*.doc, *.docx)

- **Clé racine** : Nom du fichier avec extension
- **Structure** : Array d'objets avec sections numérotées
- **Format des clés** : `N. Titre_Section`

```json
{
  "Rapport.doc": [
    { "1. Titre": "FRAP N°01" },
    { "2. Observation": "Contenu de l'observation..." },
    { "3. Cause": "Absence de contrôles..." },
    { "4. Recommandation": "Mettre en place..." }
  ]
}
```

## Traitement dans n8n

### Node Code pour parser les données

```javascript
// Récupérer les données structurées
const inputData = $input.first().json.data;

// Si c'est l'ancien format (question simple)
if ($input.first().json.question) {
  return [{ json: { message: $input.first().json.question } }];
}

// Parser le nouveau format structuré
let userMessage = null;
let excelFiles = [];
let wordFiles = [];

inputData.forEach(item => {
  const key = Object.keys(item)[0];
  
  if (key === 'User_message') {
    userMessage = item[key];
  } else if (key.endsWith('.xlsx') || key.endsWith('.xls')) {
    excelFiles.push({ filename: key, data: item[key] });
  } else if (key.endsWith('.doc') || key.endsWith('.docx')) {
    wordFiles.push({ filename: key, data: item[key] });
  }
});

return [{
  json: {
    userMessage,
    excelFiles,
    wordFiles,
    totalFiles: excelFiles.length + wordFiles.length
  }
}];
```

### Accéder aux données Excel

```javascript
// Accéder à une table spécifique
const excelFile = excelFiles[0];
const table1 = excelFile.data.find(t => t['onglet_1 - table 1']);
const rows = table1['onglet_1 - table 1'];

// Itérer sur les lignes
rows.forEach(row => {
  console.log(row['Nom de la banque'], row['Devise']);
});
```

## Configuration du Webhook n8n

**Important** : Configurez votre node Webhook avec :

- **Respond** : `When Last Node Finishes` ou `Immediately`
- **HTTP Method** : `POST`
- **Response Code** : `200`

## Fichiers modifiés

1. `src/services/claraAttachmentService.ts`
   - Nouvelle méthode `formatDataForN8nStructured()`
   - Parsing du message utilisateur en clés-valeurs
   - Formatage Excel avec structure `onglet_X - table Y`
   - Formatage Word avec sections numérotées

2. `src/services/claraApiService.ts`
   - Détection automatique des pièces jointes
   - Envoi du format structuré `{ data: [...] }` avec attachments
   - Maintien du format legacy `{ question: "..." }` sans attachments
