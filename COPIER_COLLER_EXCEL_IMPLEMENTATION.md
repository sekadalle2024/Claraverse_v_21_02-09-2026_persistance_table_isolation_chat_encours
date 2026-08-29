# Fonctionnalité Copier-Coller depuis Excel

## Description
Cette fonctionnalité permet de copier des plages de cellules depuis Excel (ou tout tableur) et de les coller directement dans les tables du chat Claraverse.

Deux modes sont disponibles :
1. **Coller (Ctrl+V)** : Colle les données à partir de la cellule active
2. **Copier Table (Ctrl+Shift+V)** : Remplace intégralement la table active (incluant les en-têtes)

---

## Mode 1: Coller depuis Excel (Ctrl+V)

### Utilisation

#### Méthode 1: Raccourci clavier
1. Copiez des cellules dans Excel (Ctrl+C)
2. Cliquez sur une cellule de la table dans Claraverse
3. Appuyez sur **Ctrl+V**
4. Les données sont collées à partir de la cellule sélectionnée

#### Méthode 2: Menu contextuel
1. Copiez des cellules dans Excel (Ctrl+C)
2. Survolez une table dans le chat
3. Ouvrez le menu contextuel (clic droit ou survol)
4. Section **Lignes** → **📋 Coller depuis Excel**

#### Méthode 3: Console JavaScript
```javascript
claraverseCommands.pasteFromExcel();
```

### Comportement
- Les données sont collées à partir de la cellule active
- Les lignes manquantes sont automatiquement créées si nécessaire
- Les cellules modifiées sont temporairement colorées en vert clair

---

## Mode 2: Copier Table - Remplacer intégralement (Ctrl+Shift+V)

### Utilisation

#### Méthode 1: Raccourci clavier
1. Copiez une plage de cellules **incluant les en-têtes** dans Excel (Ctrl+C)
2. Cliquez sur la table à remplacer dans Claraverse
3. Appuyez sur **Ctrl+Shift+V**
4. Confirmez le remplacement
5. La table est entièrement remplacée

#### Méthode 2: Menu contextuel
1. Copiez une plage avec en-têtes dans Excel (Ctrl+C)
2. Survolez la table à remplacer
3. Ouvrez le menu contextuel
4. Section **Lignes** → **📄 Copier Table (remplacer)**

#### Méthode 3: Console JavaScript
```javascript
claraverseCommands.replaceTableFromExcel();
```

### Comportement
- La première ligne des données copiées devient l'en-tête de la table
- Toutes les lignes suivantes deviennent les données
- La table existante est complètement remplacée
- Les classes CSS de la table sont préservées
- Un effet visuel (bordure verte) confirme le remplacement

---

## Format des données

- **Séparateur de colonnes**: Tabulation (`\t`)
- **Séparateur de lignes**: Retour à la ligne (`\n`, `\r\n`, ou `\r`)
- Compatible avec Excel, Google Sheets, LibreOffice Calc, etc.

---

## Fichiers modifiés

### `public/conso.js`
- `pasteFromClipboard(startCell)` - Coller à partir d'une cellule
- `replaceTableFromClipboard(table)` - Remplacer une table entière
- `parseClipboardData(text)` - Parser les données Excel
- `setupPasteShortcut()` - Raccourcis Ctrl+V et Ctrl+Shift+V
- Commandes: `pasteFromExcel()`, `replaceTableFromExcel()`

### `public/menu.js`
- Option "📋 Coller depuis Excel" (Ctrl+V)
- Option "📄 Copier Table (remplacer)" (Ctrl+Shift+V)
- `pasteFromExcel()` - Coller dans les cellules
- `replaceTableFromExcel()` - Remplacer la table entière
- `replaceEntireTable(data)` - Logique de remplacement

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| Ctrl+V | Coller à partir de la cellule active |
| Ctrl+Shift+V | Remplacer intégralement la table |

---

## Commandes console

```javascript
// Afficher l'aide
claraverseCommands.help();

// Coller depuis Excel (à partir de la cellule active)
claraverseCommands.pasteFromExcel();

// Remplacer la table entière depuis Excel
claraverseCommands.replaceTableFromExcel();

// Sauvegarder après modifications
claraverseCommands.saveAllNow();
```

---

## Test rapide

### Test Coller (Ctrl+V)
1. Dans Excel, sélectionnez quelques cellules (sans en-tête)
2. Copiez (Ctrl+C)
3. Dans Claraverse, cliquez sur une cellule
4. Appuyez sur Ctrl+V
5. Vérifiez que les données sont collées

### Test Copier Table (Ctrl+Shift+V)
1. Dans Excel, sélectionnez une plage **avec en-têtes**
2. Copiez (Ctrl+C)
3. Dans Claraverse, cliquez sur une table
4. Appuyez sur Ctrl+Shift+V
5. Confirmez le remplacement
6. Vérifiez que la table est entièrement remplacée
