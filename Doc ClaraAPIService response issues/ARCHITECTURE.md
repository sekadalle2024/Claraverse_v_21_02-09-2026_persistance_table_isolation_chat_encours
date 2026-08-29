# 🏗️ Architecture - Traitement des Réponses n8n

> Flux complet de traitement des réponses depuis n8n jusqu'à l'affichage front-end

---

## 📊 Vue d'Ensemble

```
┌─────────────┐
│   n8n       │ Workflow exécuté
│  Webhook    │
└──────┬──────┘
       │ HTTP Response
       ▼
┌─────────────────────────────────┐
│  claraApiService.ts             │
│  normalizeN8nResponse()         │
│  - Détecte le format            │
│  - Extrait data                 │
└──────┬──────────────────────────┘
       │ data object
       ▼
┌─────────────────────────────────┐
│  convertStructuredDataToMarkdown│
│  - Détecte le type de structure │
│  - Route vers le bon handler    │
└──────┬──────────────────────────┘
       │ Markdown string
       ▼
┌─────────────────────────────────┐
│  Front-end React                │
│  - Affiche le Markdown          │
│  - Applique les styles CSS      │
└─────────────────────────────────┘
```

---

## 🔍 Détection du Format

### Étape 1: normalizeN8nResponse()

Cette fonction détecte le format de la réponse n8n:

```typescript
// FORMAT 1: Texte simple
if (typeof result === "string") {
  return { content: result, metadata: {} };
}

// FORMAT 2: { output: "texte" }
if (result.output && typeof result.output === "string") {
  return { content: result.output, metadata: {} };
}

// FORMAT 3: { data: "texte" }
if (result.data && typeof result.data === "string") {
  return { content: result.data, metadata: {} };
}

// FORMAT 4A: [{ data: {...} }]
if (Array.isArray(result) && result[0]?.data) {
  const data = result[0].data;
  // Conversion en Markdown
}

// FORMAT 4B: { data: {...} }
if (result.data && typeof result.data === "object") {
  // Conversion en Markdown
}
```

---

## 🔄 Conversion en Markdown

### Étape 2: convertStructuredDataToMarkdown()

Cette fonction analyse la structure et route vers les handlers appropriés:

#### 2.1 Détection de la clé principale

```typescript
const etapeMissionKey = Object.keys(data).find(
  (key) =>
    key.toLowerCase().includes("etape") ||
    key.toLowerCase().includes("mission") ||
    key.toLowerCase().includes("programme") ||
    key.toLowerCase().includes("recos") ||
    key.toLowerCase().includes("tableau")
) || Object.keys(data)[0];
```

#### 2.2 Format spécifique: Programme contrôle comptes

```typescript
const hasTableauEntete = "Tableau entete" in data;
const hasTableauProcessus = "Tableau processus" in data;

if (hasTableauEntete && hasTableauProcessus) {
  // Traiter "Tableau entete" comme header
  markdown += this.convertHeaderTableToMarkdown(tableauEntete, 0);
  
  // Traiter "Tableau processus" comme data_array
  markdown += this.convertArrayTableToMarkdown("", tableauProcessus);
  
  return markdown;
}
```

#### 2.3 Format CASE 25: Toutes les tables dans un objet

```typescript
if (etapeMission.length === 1 && typeof etapeMission[0] === 'object') {
  const firstElement = etapeMission[0];
  const keys = Object.keys(firstElement);
  
  const hasTableKeys = keys.some(key => /^table\s+\d+$/i.test(key));
  
  if (hasTableKeys) {
    // Trier et traiter chaque table
    sortedKeys.forEach((tableKey, index) => {
      const tableType = this.detectTableType(tableKey, tableData);
      // Router vers le bon handler
    });
  }
}
```

#### 2.4 Format original: Chaque table dans un objet séparé

```typescript
etapeMission.forEach((tableObj: any, index: number) => {
  const tableKey = Object.keys(tableObj)[0];
  const tableData = tableObj[tableKey];
  const tableType = this.detectTableType(tableKey, tableData);
  
  switch (tableType) {
    case "header":
      markdown += this.convertHeaderTableToMarkdown(tableData, index);
      break;
    case "data_array":
      markdown += this.convertArrayTableToMarkdown(title, tableData);
      break;
    case "download":
      markdown += this.convertDownloadTableToMarkdown(tableData);
      break;
  }
});
```

---

## 🎯 Détection du Type de Table

### detectTableType()

```typescript
private detectTableType(
  tableKey: string,
  tableData: any
): "header" | "data_array" | "download" | "unknown" {
  
  // Type 1: En-tête (objet simple)
  if (typeof tableData === "object" && !Array.isArray(tableData)) {
    const hasSimpleValues = keys.every(
      (k) => typeof tableData[k] !== "object"
    );
    
    // Type 3: Téléchargement
    if (hasDownloadKeywords || hasUrls) {
      return "download";
    }
    
    if (hasSimpleValues) {
      return "header";
    }
  }
  
  // Type 2: Tableau de données
  if (Array.isArray(tableData) && tableData.length > 0) {
    return "data_array";
  }
  
  return "unknown";
}
```

---

## 📝 Handlers de Conversion

### 1. convertHeaderTableToMarkdown()

Convertit un objet en tableau Markdown:

```typescript
// Table 1 (index 0): Format 2 colonnes
| Rubrique | Description |
|----------|-------------|
| **Clé1** | Valeur1     |
| **Clé2** | Valeur2     |

// Tables 2+ (index > 0): Format 1 colonne
| **En-tête** |
|-------------|
| Contenu     |
```

### 2. convertArrayTableToMarkdown()

Convertit un array d'objets en tableau Markdown:

```typescript
### Titre (optionnel)

| Colonne1 | Colonne2 | Colonne3 |
|----------|----------|----------|
| Valeur1  | Valeur2  | Valeur3  |
| Valeur4  | Valeur5  | Valeur6  |
```

### 3. convertDownloadTableToMarkdown()

Convertit des liens de téléchargement:

```typescript
## 📥 Ressources et Téléchargements

🔗 **[Nom du fichier](url)**
```

---

## 🔧 Points d'Extension

### Ajouter un nouveau format

1. Détecter le format dans `normalizeN8nResponse()`
2. Ajouter la logique de détection dans `convertStructuredDataToMarkdown()`
3. Créer un handler spécifique si nécessaire
4. Tester avec des données réelles

### Modifier un format existant

1. Identifier le handler concerné
2. Modifier la logique de conversion
3. Vérifier l'impact sur les autres formats
4. Tester tous les workflows affectés

---

## 📊 Flux de Données Détaillé

### Exemple: Programme contrôle comptes

```
n8n Webhook
  ↓ Retourne
[{
  data: {
    "Tableau entete": {
      "Processus": "Achats",
      "Niveau de risque": "Élevé"
    },
    "Tableau processus": [
      { "Opération": "...", "Acteur": "..." },
      { "Opération": "...", "Acteur": "..." }
    ]
  }
}]
  ↓
normalizeN8nResponse()
  ↓ Détecte FORMAT 4A
  ↓ Extrait data
{
  "Tableau entete": {...},
  "Tableau processus": [...]
}
  ↓
convertStructuredDataToMarkdown()
  ↓ Détecte "Tableau entete" + "Tableau processus"
  ↓ Route vers handlers spécifiques
  ↓
convertHeaderTableToMarkdown(tableauEntete, 0)
  ↓ Génère
| Rubrique | Description |
|----------|-------------|
| **Processus** | Achats |
| **Niveau de risque** | Élevé |
  ↓
convertArrayTableToMarkdown("", tableauProcessus)
  ↓ Génère
| Opération | Acteur |
|-----------|--------|
| ...       | ...    |
  ↓
Front-end
  ↓ Affiche les tableaux formatés ✅
```

---

## 🎨 Rendu Front-end

Le Markdown généré est affiché par le composant React avec:

1. **Parsing Markdown**: Conversion en HTML
2. **Styles CSS**: Application des styles de tableaux
3. **Responsive**: Adaptation mobile/desktop

---

## 🔍 Logs de Débogage

Chaque étape génère des logs dans la console:

```
🔍 Clé principale détectée: "Tableau entete"
🔧 FORMAT PROGRAMME CONTROLE COMPTES DÉTECTÉ
📋 Traitement de 'Tableau entete' (type: header)
📋 Traitement de 'Tableau processus' (type: data_array, 5 items)
🔄 Conversion de (sans titre) avec 5 lignes
📋 Colonnes détectées (3): Opération, Acteur, Principale
✅ Tableau converti avec succès
```

---

**Dernière mise à jour**: 31 Mars 2026
