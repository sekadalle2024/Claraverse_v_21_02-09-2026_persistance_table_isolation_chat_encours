# Causes Racines

## L'observation
Une première fonction de nettoyage (`cleanEmptyRows`) existait déjà dans le script `Flowise.js`.
```javascript
  function cleanEmptyRows(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const isEmpty = Array.from(cells).every(cell => {
        const text = cell.textContent.trim();
        return text === '' || text === '---';
      });
      if (isEmpty && cells.length > 0) {
        row.remove();
      }
    });
  }
```

## Le problème
Cette fonction vérifie si **toutes** les cellules de la ligne sont vides (`''`) ou contiennent un séparateur Markdown vide (`'---'`).
Cependant, lors de l'inspection visuelle et du DOM, il a été constaté que les lignes "vides" n'étaient pas *totalement* vides.

### La structure réelle des lignes fantômes issues de n8n / LLM
Le LLM contacté via n8n génère du Markdown. Dans certains de ses échecs de formatage ou sauts de ligne lors de l'énumération pour une synthèse/rapport :
- Il a créé une ligne de tableau Markdown.
- Il a mis **un numéro dans la première colonne** (ex: `| 2 |`).
- Il n'a **pas** ajouté les barres verticales (`|`) pour les autres colonnes de la ligne.

### Conséquence : Le HTML généré est tronqué
Lors de la conversion Markdown vers HTML (assurée par la fonction `extractTablesFromResponse` / `createTableFromMarkdown`), une ligne mal formatée comme `| 2 |` ne génère **qu'une seule cellule `<td>2</td>`** dans le `<tr>` final.

### Le double piège et le bug de la V17.2 initiale
La première fonction `cleanEmptyRows` refusait de nettoyer car la cellule "2" n'était pas vide.

Une première correction (la V17.2 stricte) a échoué à cause d'une condition trop forte :
```javascript
if (cells.length >= 2) { // <- LE BUG ETAIT ICI
  const firstCellText = cells[0].textContent.trim();
  const restAllEmpty = cells.slice(1).every(c => c === '' || c === '---');
  // ... supprime
}
```
Comme le tableau contenait, par exemple, 3 colonnes, on s'attendait à ce que `cells.length` vaille 3. Or, avec la ligne Markdown mal formatée `| 2 |`, `cells.length` **valait 1** ! La condition `cells.length >= 2` court-circuitait la vérification et la ligne n'était jamais nettoyée.
