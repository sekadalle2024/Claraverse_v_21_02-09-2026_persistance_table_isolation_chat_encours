# La Solution (Flowise.js V17.2)

La solution a été implémentée en deux étapes : affiner la détection du contexte, et créer une règle de nettoyage plus souple.

## 1. Détection Robuste du Contexte
Il fallait appliquer ce nettoyage intensif uniquement sur les tableaux de rapport.
La fonction `detectReportKeywordInFirstTable` a été réécrite pour être **extrêmement robuste**. Au lieu de chercher le mot-clé ("Rapport définitif", "Synthèse", etc.) uniquement dans une en-tête `<th>` spécifique nommée "Description", elle :
- Scanne **toutes les tables** (pas seulement la première).
- Scanne **toutes les cellules** (les `<td>` comme les `<th>`).
- Cherche via Expression Régulière (`/rapport\s+final/i`, `/rapport\s+provisoire/i`, `/synth[eè]se/i`) une correspondance.
Si trouvé, un log est émis (`✅ [V17.2] Mot-clé rapport détecté... → Nettoyage activé`) et une variable passe à `true`.

## 2. Le Nettoyage Étendu (`cleanEmptyRowsForReport`)
Si la détection ci-dessus renvoie vrai, la nouvelle fonction `cleanEmptyRowsForReport` est appelée (sur toutes les tables à l'exception de la première, considérée comme table d'en-tête).

Cette fonction traite deux cas de "lignes vides" :
### Cas (a) : La ligne standard vide
Toutes les cellules sont vides ou valent `'---'` (conservation du comportement historique).

### Cas (b) : La ligne "fantôme numérotée"
Si la ligne ne remplit pas l'exigence du cas (a), on vérifie :
1. Si la première cellule contient exclusivement des chiffres (`/^\d+$/.test(firstCellText)`).
2. Si **la cellule est la seule de la ligne** (`cells.length === 1`) OU **absolument toutes les cellules suivantes** (à partir de l'index 1) sont vides ou valent `'---'`.
Si ces deux conditions sont réunies, la ligne est traitée comme un déchet de formatage LLM/n8n et est supprimée de la structure HTML.

## 3. Remplissage des Colonnes Manquantes (Padding)
Un nouveau mécanisme a été ajouté dans `createTableFromMarkdown` pour garantir l'intégrité visuelle du tableau, même si n8n oublie des délimiteurs `|` à la fin d'une ligne.

**Ancienne erreur :** Le parseur utilisait `.filter(cell => cell.trim() !== '')`, ce qui supprimait les colonnes vides.
**Nouvelle logique :**
- Le split conserve toutes les cellules, même vides.
- Une boucle `while` rajoute des `<td>` vides tant que le nombre de cellules de la ligne est inférieur au nombre d'en-têtes (`headerCount`).

Cela permet aux colonnes comme **"Recommandation"** d'exister physiquement dans le DOM (cellule cliquable/modifiable) même si elles ne contiennent aucune donnée au départ.

## Extrait du correctif (Nettoyage)
```javascript
function cleanEmptyRowsForReport(table) {
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length === 0) return;

    // Cas (a) : toutes les cellules sont vides ou '---'
    const allEmpty = cells.every(cell => {
      const text = cell.textContent.trim();
      return text === '' || text === '---';
    });

    if (allEmpty) {
      row.remove();
      return;
    }

    // Cas (b) : seule la 1ère cellule a du contenu (un numéro)
    // et soit c'est la SEULE cellule, soit toutes les autres sont vides
    const firstCellText = cells[0].textContent.trim();
    const isFirstCellNumeric = /^\d+$/.test(firstCellText);
    
    const isRestEmptyOrMissing = cells.length === 1 || cells.slice(1).every(cell => {
      const text = cell.textContent.trim();
      return text === '' || text === '---';
    });

    if (isFirstCellNumeric && isRestEmptyOrMissing) {
      console.log(`🗑️ [V17.2] Ligne supprimée (numéro "${firstCellText}" seul)`);
      row.remove();
    }
  });
}
```

## Extrait du correctif (Padding)
```javascript
// ⭐ FIX V17.2 ROBUST PADDING:
const headerCount = cleanHeaderCells.length;
const tbody = document.createElement("tbody");

dataRows.forEach((rowText, rowIndex) => {
  const tr = document.createElement("tr");
  // ... (classes et styles)

  // 1. Nettoyer les pipes de bordure (|) avant de split
  let rowContent = rowText.trim();
  if (rowContent.startsWith('|')) rowContent = rowContent.substring(1);
  if (rowContent.endsWith('|')) rowContent = rowContent.substring(0, rowContent.length - 1);

  // 2. Split sans filter pour garder les cellules vides
  let cells = rowContent.split("|");

  // 3. Création des cellules (td)
  cells.forEach((cellText) => {
    const td = document.createElement("td");
    // ... (styles)
    td.textContent = cellText.trim() || ""; 
    tr.appendChild(td);
  });

  // 4. PADDING : Si le LLM a oublié des colonnes, on les rajoute vides
  while (tr.children.length < headerCount) {
    const emptyTd = document.createElement("td");
    emptyTd.textContent = "";
    tr.appendChild(emptyTd);
  }

  if (tr.children.length > 0) tbody.appendChild(tr);
});
```
