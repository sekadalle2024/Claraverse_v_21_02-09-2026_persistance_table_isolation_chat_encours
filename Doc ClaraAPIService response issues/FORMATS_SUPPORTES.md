# 📋 Formats Supportés - Réponses n8n

> Liste complète des formats JSON supportés par ClaraAPIService

---

## 🎯 Vue d'Ensemble

ClaraAPIService supporte 7 formats de réponse différents:

| Format | Type | Détection | Handler |
|--------|------|-----------|---------|
| FORMAT 1 | Texte simple | `typeof result === "string"` | Direct |
| FORMAT 2 | Objet output | `result.output` | Extraction |
| FORMAT 3 | Objet data | `result.data && typeof === "string"` | Extraction |
| FORMAT 4A | Array data | `Array.isArray(result) && result[0]?.data` | Conversion Markdown |
| FORMAT 4B | Objet data | `result.data && typeof === "object"` | Conversion Markdown |
| CASE 25 | Tables multiples | Détection `table 1`, `table 2`, etc. | Conversion spécifique |
| Programme contrôle | Tables spécifiques | `"Tableau entete"` + `"Tableau processus"` | Conversion spécifique |

---

## 📝 FORMAT 1: Texte Simple

### Structure
```json
"Voici la réponse en texte simple"
```

### Détection
```typescript
if (typeof result === "string") {
  return { content: result, metadata: {} };
}
```

### Utilisation
- Réponses simples sans structure
- Messages de notification
- Textes courts

---

## 📝 FORMAT 2: Objet Output

### Structure
```json
{
  "output": "Voici la réponse"
}
```

### Détection
```typescript
if (result.output && typeof result.output === "string") {
  return { content: result.output, metadata: {} };
}
```

### Utilisation
- Workflows n8n simples
- Réponses textuelles structurées

---

## 📝 FORMAT 3: Objet Data (String)

### Structure
```json
{
  "data": "Voici la réponse"
}
```

### Détection
```typescript
if (result.data && typeof result.data === "string") {
  return { content: result.data, metadata: {} };
}
```

### Utilisation
- Workflows avec encapsulation data
- Réponses textuelles

---

## 📊 FORMAT 4A: Array Data (Objet)

### Structure
```json
[{
  "data": {
    "Etape mission - Programme": [
      { "table 1": {...} },
      { "table 2": [...] }
    ]
  }
}]
```

### Détection
```typescript
if (Array.isArray(result) && result[0]?.data) {
  const data = result[0].data;
  // Conversion en Markdown
}
```

### Utilisation
- Workflows complexes avec tableaux
- Données structurées multiples
- Format le plus courant

---

## 📊 FORMAT 4B: Objet Data (Objet)

### Structure
```json
{
  "data": {
    "Etape mission - Programme": [
      { "table 1": {...} },
      { "table 2": [...] }
    ]
  }
}
```

### Détection
```typescript
if (result.data && typeof result.data === "object") {
  // Conversion en Markdown
}
```

### Utilisation
- Workflows complexes sans array wrapper
- Données structurées

---

## 🔧 FORMAT CASE 25: Tables Multiples

### Structure
```json
{
  "data": {
    "Etape mission - Programme": [{
      "table 1": {
        "Intitule": "Titre",
        "Description": "Description"
      },
      "table 2": {
        "Observation": "Observation"
      },
      "table 3": [
        { "Colonne1": "Valeur1", "Colonne2": "Valeur2" }
      ],
      "table 4": [...],
      "table 5": [...],
      "table 6": [...]
    }]
  }
}
```

### Détection
```typescript
if (etapeMission.length === 1 && typeof etapeMission[0] === 'object') {
  const keys = Object.keys(firstElement);
  const hasTableKeys = keys.some(key => /^table\s+\d+$/i.test(key));
  
  if (hasTableKeys) {
    // Format CASE 25 détecté
  }
}
```

### Caractéristiques
- Toutes les tables dans un seul objet
- Clés nommées "table 1", "table 2", etc.
- Mix de tables header et data_array
- Table 1 toujours en format 2 colonnes
- Tables 2+ en format 1 colonne si objet simple

### Utilisation
- Workflow "Recos contrôle interne comptable"
- Rapports avec sections multiples

---

## 🔧 FORMAT Programme Contrôle Comptes

### Structure
```json
{
  "data": {
    "Tableau entete": {
      "Processus": "Achats",
      "Niveau de risque R": "Élevé",
      "Assertion": "Exhaustivité"
    },
    "Tableau processus": [
      {
        "Opération": "Réception des marchandises",
        "Acteur": "Magasinier",
        "Principale": "Oui"
      },
      {
        "Opération": "Contrôle qualité",
        "Acteur": "Contrôleur qualité",
        "Principale": "Oui"
      }
    ]
  }
}
```

### Détection
```typescript
const hasTableauEntete = "Tableau entete" in data;
const hasTableauProcessus = "Tableau processus" in data;

if (hasTableauEntete && hasTableauProcessus) {
  // Format Programme contrôle comptes détecté
}
```

### Caractéristiques
- Deux tables spécifiques: "Tableau entete" et "Tableau processus"
- "Tableau entete" = objet simple (header)
- "Tableau processus" = array d'objets (data_array)
- Pas de titre pour "Tableau processus"
- Espacement minimal entre les tableaux

### Conversion
```typescript
// Traiter "Tableau entete" comme header
markdown += this.convertHeaderTableToMarkdown(tableauEntete, 0);

// Traiter "Tableau processus" comme data_array SANS titre
markdown += this.convertArrayTableToMarkdown("", tableauProcessus);
```

### Résultat Markdown
```markdown
| Rubrique | Description |
|----------|-------------|
| **Processus** | Achats |
| **Niveau de risque R** | Élevé |
| **Assertion** | Exhaustivité |

| Opération | Acteur | Principale |
|-----------|--------|------------|
| Réception des marchandises | Magasinier | Oui |
| Contrôle qualité | Contrôleur qualité | Oui |
```

### Utilisation
- Workflow "Programme_controle_comptes"
- Endpoint: `https://t22wtwxl.rpcld.app/webhook/programme_controle_comptes`

---

## 🎯 Types de Tables

### 1. Header (En-tête)

**Détection**: Objet simple avec valeurs non-objets

```json
{
  "Intitule": "Titre",
  "Description": "Description du processus"
}
```

**Conversion**:
- Table 1 (index 0): Format 2 colonnes (Rubrique | Description)
- Tables 2+ (index > 0): Format 1 colonne avec en-tête en gras

### 2. Data Array (Tableau de données)

**Détection**: Array d'objets

```json
[
  { "Colonne1": "Valeur1", "Colonne2": "Valeur2" },
  { "Colonne1": "Valeur3", "Colonne2": "Valeur4" }
]
```

**Conversion**: Tableau Markdown avec en-têtes

### 3. Download (Téléchargement)

**Détection**: Contient URLs ou mots-clés "télécharger"

```json
{
  "Fichier 1": "https://example.com/file1.pdf",
  "Fichier 2": "https://example.com/file2.pdf"
}
```

**Conversion**: Liens de téléchargement avec emojis

---

## 🔍 Ordre de Détection

L'ordre de détection est important pour éviter les faux positifs:

1. **FORMAT 1**: Texte simple (typeof string)
2. **FORMAT 2**: Objet output (result.output)
3. **FORMAT 3**: Objet data string (result.data && typeof string)
4. **FORMAT 4A**: Array data (Array.isArray && result[0]?.data)
5. **FORMAT 4B**: Objet data (result.data && typeof object)
6. **Programme contrôle**: Détection spécifique dans convertStructuredDataToMarkdown()
7. **CASE 25**: Détection spécifique dans convertStructuredDataToMarkdown()
8. **FORMAT ORIGINAL**: Fallback par défaut

---

## 📊 Statistiques d'Utilisation

| Format | Workflows | Fréquence |
|--------|-----------|-----------|
| FORMAT 1 | Notifications | 10% |
| FORMAT 2 | Simples | 5% |
| FORMAT 3 | Simples | 5% |
| FORMAT 4A | Complexes | 40% |
| FORMAT 4B | Complexes | 20% |
| CASE 25 | Recos CI | 10% |
| Programme contrôle | Programme contrôle comptes | 10% |

---

## 🔧 Ajout d'un Nouveau Format

Voir [GUIDE_AJOUT_FORMAT.md](./GUIDE_AJOUT_FORMAT.md) pour la procédure complète.

---

**Dernière mise à jour**: 31 Mars 2026
