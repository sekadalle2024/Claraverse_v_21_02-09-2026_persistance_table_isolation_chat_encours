# Correction de l'ordre des colonnes - Résultat Final CIA

## Problème identifié

Lors de l'activation de "Résultat Final" via le menu contextuel CIA, les colonnes étaient décalées/confondues :

| Avant (C10) | Après bug (C11) |
|-------------|-----------------|
| Ref Question | Ref Question |
| Question | Question |
| Option | Option |
| Reponse CIA | ❌ Contenu de Reponse User |
| Reponse User | ❌ Contenu de Remarques |
| Remarques | ❌ Contenu de Score |
| Score | ❌ Vide |

## Cause du problème

1. `conso.js` masque les colonnes `Reponse_cia` et `Remarques` au démarrage avec `display: none`
2. `menu_cia.js` utilisait `getTableHeaders()` qui retourne les index des en-têtes
3. Mais les cellules `td` dans le tbody ont des index DOM différents quand certaines sont masquées
4. Résultat: décalage entre les index des en-têtes et les index des cellules

## Corrections apportées

### V1.1 - Première tentative
- Affichage de `reponse_cia` ET `remarques`
- Amélioration de `showColumn()` avec `display: table-cell`

### V1.2 - Correction définitive (actuelle)

#### 1. Nouvelle fonction `getColumnIndexes()`
```javascript
getColumnIndexes(table) {
    // Récupère les index DOM RÉELS de chaque colonne
    // en parcourant directement les éléments th/td
    const allHeaders = Array.from(headerRow.querySelectorAll("th, td"));
    allHeaders.forEach((header, index) => {
        // L'index est l'index DOM réel, pas un index filtré
    });
}
```

#### 2. `showColumn()` corrigé
- Parcourt directement les éléments DOM
- Utilise `Array.from()` pour avoir les index corrects
- Ne dépend plus de `getTableHeaders()`

#### 3. `calculateScores()` corrigé
- Utilise `getColumnIndexes()` pour les index DOM réels
- Accède aux cellules avec `Array.from(row.querySelectorAll("td"))[index]`

#### 4. `mergeScoreColumn()` et `mergeRemarquesColumn()` corrigés
- Utilisent les index DOM réels via `getColumnIndexes()`

## Fichiers modifiés

- `public/menu_cia.js` - Version 1.2

## Test

1. Vider le cache du navigateur (Ctrl+Shift+R)
2. Ouvrir une page avec un questionnaire CIA
3. Clic droit sur une table CIA
4. Cliquer sur "📊 Résultat final"
5. Vérifier dans la console les logs:
   - `🎯 [CIA Menu] 👁️ Colonne reponse_cia trouvée à l'index DOM X`
   - `🎯 [CIA Menu] 📊 Index des colonnes: {...}`

## Résultat attendu

Les colonnes doivent s'afficher dans l'ordre correct avec :
- Chaque en-tête correspondant à son contenu
- Reponse CIA visible
- Remarques visible et fusionnée
- Score calculé et fusionné
- Table Résultat Final avec le score global
