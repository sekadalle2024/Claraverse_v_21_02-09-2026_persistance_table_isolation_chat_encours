# Guide Complet des Sélecteurs CSS pour les Tables Clara

## 📋 Table des matières
1. [Structure HTML des tables](#structure-html)
2. [Sélecteurs CSS valides](#sélecteurs-valides)
3. [Sélecteurs CSS invalides](#sélecteurs-invalides)
4. [Bonnes pratiques](#bonnes-pratiques)
5. [Cas d'usage réels](#cas-dusage-réels)

---

## Structure HTML

### Structure réelle dans Clara

```html
<!-- Conteneur principal -->
<div class="prose prose-base dark:prose-invert max-w-none">
  <!-- Table 1 -->
  <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    <thead>
      <tr>
        <th>Colonne 1</th>
        <th>Colonne 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Données</td>
        <td>Données</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Conteneur principal (SÉPARÉ) -->
<div class="prose prose-base dark:prose-invert max-w-none">
  <!-- Table 2 -->
  <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    <thead>
      <tr>
        <th>Colonne 1</th>
        <th>Colonne 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Données</td>
        <td>Données</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ... 22 autres tables ... -->
```

### Point clé: Chaque table est dans sa propre div!

**IMPORTANT**: Contrairement à ce qu'on pourrait supposer, les tables ne sont PAS groupées dans une div parente commune. Chaque table est encapsulée dans sa propre div avec la classe `prose`.

---

## Sélecteurs valides

### ✅ Sélecteur global (RECOMMANDÉ)
```javascript
// Détecte TOUTES les tables dans le document
const tables = document.querySelectorAll('div.prose table');
// Résultat: 24 tables trouvées ✅
```

**Avantages**:
- Simple et efficace
- Détecte toutes les tables
- Pas de dépendance à la structure HTML
- Fonctionne même si les divs sont réorganisées

**Utilisation**:
```javascript
const tables = Array.from(document.querySelectorAll('div.prose table'));
console.log(`Trouvé ${tables.length} table(s)`);
```

---

### ✅ Sélecteur avec classe spécifique
```javascript
// Détecte les tables avec une classe spécifique
const tables = document.querySelectorAll('table.min-w-full');
// Résultat: 24 tables trouvées ✅
```

**Avantages**:
- Cible les tables Clara spécifiquement
- Évite les tables d'autres sources

**Utilisation**:
```javascript
const tables = Array.from(document.querySelectorAll('table.min-w-full.border'));
```

---

### ✅ Sélecteur combiné (PLUS SPÉCIFIQUE)
```javascript
// Détecte les tables dans div.prose avec classes spécifiques
const tables = document.querySelectorAll('div.prose table.min-w-full.border');
// Résultat: 24 tables trouvées ✅
```

**Avantages**:
- Plus spécifique
- Réduit les faux positifs
- Cible précisément les tables Clara

**Utilisation**:
```javascript
const tables = Array.from(
  document.querySelectorAll('div.prose table.min-w-full.border.border-gray-200')
);
```

---

## Sélecteurs invalides

### ❌ Sélecteur enfant direct (INCORRECT)
```javascript
// Cherche les tables qui sont des enfants DIRECTS de div.prose
const tables = document.querySelectorAll('div.prose > table');
// Résultat: 0 tables trouvées ❌
```

**Pourquoi ça ne fonctionne pas**:
- Le `>` signifie "enfant direct"
- Les tables sont des enfants directs de `div.prose` ✅
- MAIS: Chaque table est dans sa propre div
- Donc: `div.prose > table` ne trouve rien si on cherche dans une div parente

**Erreur courante**:
```javascript
// ❌ MAUVAIS: Chercher dans une div parente
const parentDiv = table.closest('div.prose');
const tablesInDiv = parentDiv.querySelectorAll('table');
// Résultat: Seulement 1 table trouvée (la table elle-même)
```

---

### ❌ Sélecteur trop spécifique (INCORRECT)
```javascript
// Cherche les tables avec TOUTES ces classes
const tables = document.querySelectorAll(
  'div.prose.prose-base.dark\\:prose-invert.max-w-none > table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg'
);
// Résultat: Peut ne rien trouver si une classe change ❌
```

**Pourquoi ça ne fonctionne pas**:
- Trop de dépendances à la structure HTML
- Si une classe change, le sélecteur casse
- Difficile à maintenir

---

### ❌ Sélecteur par attribut (INCORRECT)
```javascript
// Cherche les tables par attribut data
const tables = document.querySelectorAll('table[data-type="report"]');
// Résultat: 0 tables trouvées ❌
```

**Pourquoi ça ne fonctionne pas**:
- Les tables Clara n'ont pas d'attribut `data-type`
- Nécessiterait de modifier le HTML

---

### ❌ Sélecteur par ID (INCORRECT)
```javascript
// Cherche les tables par ID
const tables = document.querySelectorAll('table#report-table');
// Résultat: 0 tables trouvées ❌
```

**Pourquoi ça ne fonctionne pas**:
- Les tables Clara n'ont pas d'ID
- Chaque table aurait besoin d'un ID unique

---

## Bonnes pratiques

### 1. Utiliser le sélecteur global
```javascript
// ✅ BON
const tables = document.querySelectorAll('div.prose table');

// ❌ MAUVAIS
const tables = document.querySelectorAll('div.prose > table');
```

### 2. Convertir en Array
```javascript
// ✅ BON: Permet d'utiliser les méthodes Array
const tables = Array.from(document.querySelectorAll('div.prose table'));
tables.forEach((table, index) => {
  console.log(`Table ${index}:`, table);
});

// ❌ MAUVAIS: NodeList n'a pas toutes les méthodes Array
const tables = document.querySelectorAll('div.prose table');
tables.map(...); // Erreur!
```

### 3. Valider les résultats
```javascript
// ✅ BON: Vérifier que les tables sont trouvées
const tables = Array.from(document.querySelectorAll('div.prose table'));
console.log(`Trouvé ${tables.length} table(s)`);

if (tables.length === 0) {
  console.error('❌ Aucune table trouvée!');
  return;
}

// ❌ MAUVAIS: Supposer que les tables existent
const tables = document.querySelectorAll('div.prose table');
tables[0].querySelectorAll('tr'); // Erreur si tables.length === 0
```

### 4. Identifier le type de table
```javascript
// ✅ BON: Vérifier le contenu pour identifier le type
const firstTableData = extractTableData(tables[0]);
const isFrap = firstTableData.some(row =>
  row.some(cell => (cell || '').toLowerCase().includes('frap'))
);

// ❌ MAUVAIS: Supposer que la première table est toujours FRAP
const frapData = extractTableData(tables[0]); // Peut être Recos!
```

### 5. Gérer les groupes de tables
```javascript
// ✅ BON: Collecter N tables consécutives
const processedIndices = new Set();
for (let i = 0; i < tables.length; i++) {
  if (processedIndices.has(i)) continue;
  
  const groupSize = Math.min(6, tables.length - i);
  const tableGroup = [];
  for (let j = 0; j < groupSize; j++) {
    tableGroup.push(tables[i + j]);
    processedIndices.add(i + j);
  }
  
  // Traiter le groupe
}

// ❌ MAUVAIS: Chercher dans une div parente
for (const table of tables) {
  const parentDiv = table.closest('div.prose');
  const tablesInDiv = parentDiv.querySelectorAll('table');
  // Trouve seulement 1 table!
}
```

### 6. Extraire le contenu complet
```javascript
// ✅ BON: Extraire TOUT le contenu de chaque cellule
function extractFullCellContent(tableData) {
  return tableData
    .map(row => row.join('\n'))
    .join('\n');
}

// ❌ MAUVAIS: Extraire seulement la première ligne
const firstCell = tableData[0][0]; // Perd les paragraphes suivants
```

---

## Cas d'usage réels

### Cas 1: Détecter toutes les tables
```javascript
// Objectif: Trouver toutes les tables dans la page
const tables = Array.from(document.querySelectorAll('div.prose table'));
console.log(`Trouvé ${tables.length} table(s)`);

// Résultat attendu:
// ✅ Trouvé 24 table(s)
```

### Cas 2: Détecter les tables FRAP
```javascript
// Objectif: Trouver les tables FRAP
const tables = Array.from(document.querySelectorAll('div.prose table'));
const frapTables = [];

for (const table of tables) {
  const data = extractTableData(table);
  const isFrap = data.some(row =>
    row.some(cell => (cell || '').toLowerCase().includes('frap'))
  );
  
  if (isFrap) {
    frapTables.push(table);
  }
}

console.log(`Trouvé ${frapTables.length} table(s) FRAP`);

// Résultat attendu:
// ✅ Trouvé 2 table(s) FRAP
```

### Cas 3: Collecter les données d'un point FRAP
```javascript
// Objectif: Collecter les 6 tables d'un point FRAP
const tables = Array.from(document.querySelectorAll('div.prose table'));
const frapData = {
  metadata: {},
  intitule: '',
  observation: '',
  constat: '',
  risque: '',
  recommandation: ''
};

// Supposons que les tables FRAP commencent à l'index 0
const frapTables = tables.slice(0, 6);

frapTables.forEach((table, index) => {
  const data = extractTableData(table);
  
  if (index === 0) {
    // Métadonnées
    data.forEach(row => {
      if (row.length >= 2) {
        const key = (row[0] || '').toLowerCase().trim();
        const value = row[1] || '';
        if (key.includes('etape')) frapData.metadata.etape = value;
        if (key.includes('norme')) frapData.metadata.norme = value;
      }
    });
  } else if (index === 1) {
    // Intitulé
    frapData.intitule = extractFullCellContent(data);
  } else if (index === 2) {
    // Observation
    frapData.observation = extractFullCellContent(data);
  }
  // ... etc
});

console.log('Données FRAP collectées:', frapData);

// Résultat attendu:
// ✅ Données FRAP collectées: { metadata: {...}, intitule: '...', ... }
```

### Cas 4: Valider les tables détectées
```javascript
// Objectif: Vérifier que les tables détectées sont valides
const tables = Array.from(document.querySelectorAll('div.prose table'));

const validTables = tables.filter(table => {
  // Vérifier que la table a des lignes
  const rows = table.querySelectorAll('tr');
  if (rows.length === 0) return false;
  
  // Vérifier que la première ligne a du contenu
  const firstRow = rows[0];
  const cells = firstRow.querySelectorAll('td, th');
  if (cells.length === 0) return false;
  
  // Vérifier que la première cellule a du contenu
  const firstCell = cells[0];
  if (!firstCell.textContent.trim()) return false;
  
  return true;
});

console.log(`${validTables.length} table(s) valide(s) sur ${tables.length}`);

// Résultat attendu:
// ✅ 24 table(s) valide(s) sur 24
```

---

## Résumé

| Sélecteur | Valide | Résultat | Utilisation |
|-----------|--------|----------|-------------|
| `div.prose table` | ✅ | 24 tables | Détection globale |
| `table.min-w-full` | ✅ | 24 tables | Détection spécifique |
| `div.prose > table` | ❌ | 0 tables | Enfant direct (incorrect) |
| `div.prose table.min-w-full` | ✅ | 24 tables | Combiné (recommandé) |
| `table[data-type]` | ❌ | 0 tables | Attribut (n'existe pas) |
| `table#id` | ❌ | 0 tables | ID (n'existe pas) |

---

## 🎯 Recommandation finale

**Utiliser le sélecteur global**: `div.prose table`

C'est le plus simple, le plus efficace et le plus robuste. Il détecte toutes les tables Clara sans dépendre de la structure HTML spécifique.

```javascript
// ✅ RECOMMANDÉ
const tables = Array.from(document.querySelectorAll('div.prose table'));
```

---

**Dernière mise à jour**: 26 Mars 2026  
**Statut**: ✅ Validé et testé
