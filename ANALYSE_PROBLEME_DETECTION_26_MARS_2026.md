# Analyse du Problème de Détection - 26 Mars 2026

## Problème Constaté

L'export CAC affiche "Aucun point d'audit CAC détecté" même après correction du sélecteur CSS.

## Analyse du Code

### Code Actuel (Ligne ~7420)

```javascript
collectFrapPoints(tables) {
  const frapPoints = [];

  for (const table of tables) {
    // Chercher la div parente contenant la table
    const parentDiv = table.closest('div[class*="prose"]');
    if (!parentDiv) continue;

    // Extraire toutes les tables dans cette div
    const tablesInDiv = Array.from(parentDiv.querySelectorAll('table'));
    
    // Vérifier si la première table contient "Frap"
    const firstTable = tablesInDiv[0];
    const firstTableData = this.extractTableDataOptimized(firstTable);
    
    const isFrap = firstTableData.some(row => 
      row.some(cell => (cell || '').toLowerCase().includes('frap'))
    );

    if (!isFrap) continue;
    // ...
  }
}
```

## Problèmes Identifiés

### 1. Logique de Boucle Inefficace

**Problème**: Le code itère sur TOUTES les tables (24 tables), puis pour chaque table:
1. Trouve la div parente
2. Récupère TOUTES les tables de cette div
3. Vérifie si la première table contient "frap"

**Conséquence**: Si les 24 tables sont dans la même div, le code va:
- Traiter la même div 24 fois
- Vérifier 24 fois la même première table
- Créer potentiellement des doublons

### 2. Sélecteur `closest()` Fragile

**Problème**: `table.closest('div[class*="prose"]')` cherche un ancêtre avec "prose" dans la classe.

**Risques**:
- Si la structure HTML change, ça casse
- Si les tables ne sont pas directement dans une div.prose, ça échoue
- Le sélecteur `[class*="prose"]` est trop large

### 3. Détection par Mot-Clé Stricte

**Problème**: Le code cherche exactement le mot "frap" (minuscule) dans les cellules.

**Risques**:
- Si le texte est "FRAP" (majuscule) → Non détecté
- Si le texte est "Feuille de Révélation" sans "frap" → Non détecté
- Si le texte a des espaces ou caractères spéciaux → Non détecté

### 4. Structure Attendue Rigide

**Problème**: Le code s'attend à exactement 6 tables dans un ordre précis:
1. Métadonnées
2. Intitulé
3. Observation
4. Constat
5. Risque
6. Recommandation

**Risques**:
- Si une table manque → Données décalées
- Si l'ordre change → Mauvaise extraction
- Si plus de 6 tables → Tables ignorées

## Solution Proposée

### Approche 1: Grouper les Tables par Div (Recommandé)

Au lieu d'itérer sur les tables, itérer sur les divs:

```javascript
collectFrapPoints(tables) {
  const frapPoints = [];
  const processedDivs = new Set();

  for (const table of tables) {
    const parentDiv = table.closest('div[class*="prose"]');
    if (!parentDiv || processedDivs.has(parentDiv)) continue;
    
    processedDivs.add(parentDiv);
    
    const tablesInDiv = Array.from(parentDiv.querySelectorAll('table'));
    // ... traiter une seule fois
  }
}
```

### Approche 2: Détecter les Groupes de Tables

Identifier les groupes de 6 tables consécutives:

```javascript
collectFrapPoints(tables) {
  const frapPoints = [];
  
  for (let i = 0; i < tables.length; i += 6) {
    const group = tables.slice(i, i + 6);
    if (group.length < 6) continue;
    
    // Vérifier si c'est un groupe FRAP
    const firstTableData = this.extractTableDataOptimized(group[0]);
    const isFrap = firstTableData.some(row => 
      row.some(cell => (cell || '').toLowerCase().includes('frap'))
    );
    
    if (isFrap) {
      // Extraire les données
    }
  }
}
```

### Approche 3: Détection Plus Flexible

Améliorer la détection par mot-clé:

```javascript
const isFrap = firstTableData.some(row => 
  row.some(cell => {
    const cellLower = (cell || '').toLowerCase();
    return cellLower.includes('frap') || 
           cellLower.includes('feuille de révélation') ||
           cellLower.includes('analyse de problème');
  })
);
```

## Tests à Effectuer

### Test 1: Vérifier la Structure HTML

```javascript
// Dans la console du navigateur
const tables = document.querySelectorAll('div.prose table');
console.log("Nombre de tables:", tables.length);

tables.forEach((t, i) => {
  const parentDiv = t.closest('div[class*="prose"]');
  console.log(`Table ${i+1}:`, {
    hasParent: !!parentDiv,
    parentClass: parentDiv?.className,
    content: t.textContent.substring(0, 50)
  });
});
```

### Test 2: Vérifier le Contenu des Tables

```javascript
const firstTable = document.querySelector('div.prose table');
if (firstTable) {
  const rows = firstTable.querySelectorAll('tr');
  rows.forEach((row, i) => {
    const cells = row.querySelectorAll('td, th');
    console.log(`Ligne ${i+1}:`, Array.from(cells).map(c => c.textContent));
  });
}
```

### Test 3: Tester la Détection

```javascript
const tables = document.querySelectorAll('div.prose table');
const firstTable = tables[0];
const rows = firstTable.querySelectorAll('tr');
const data = Array.from(rows).map(row => 
  Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent)
);

const hasFrap = data.some(row => 
  row.some(cell => (cell || '').toLowerCase().includes('frap'))
);

console.log("Contient 'frap':", hasFrap);
console.log("Données:", data);
```

## Recommandations

1. **Immédiat**: Exécuter les tests dans la console pour comprendre la structure réelle
2. **Court terme**: Implémenter l'Approche 1 (grouper par div) avec détection flexible
3. **Moyen terme**: Ajouter des logs détaillés pour faciliter le debugging
4. **Long terme**: Revoir l'architecture pour être moins dépendant de la structure HTML

## Prochaines Étapes

1. Exécuter `.\diagnostic-export-complet.ps1`
2. Exécuter les tests JavaScript dans la console
3. Analyser les résultats
4. Appliquer la solution adaptée

---

Date: 26 Mars 2026
Statut: Analyse complète
Priorité: URGENTE
