# Implémentation Copy Table / Paste Table

## Résumé

Ajout des fonctionnalités **Copy table** et **Paste table** dans le menu contextuel pour copier une table du chat et la coller dans une autre table.

## Fichiers modifiés

### 1. `public/conso.js`

**Nouvelles méthodes ajoutées dans `ClaraverseTableProcessor` :**

- `copyTable(table)` : Copie une table entière en mémoire
- `pasteTable(table)` : Colle la table copiée pour remplacer la table cible
- `hasTableCopied()` : Vérifie si une table est copiée
- `getCopiedTableInfo()` : Retourne les infos de la table copiée
- `clearCopiedTable()` : Efface la table copiée de la mémoire

**Nouvelles commandes console :**

```javascript
// Copier la table active
claraverseCommands.copyTable()

// Coller la table copiée
claraverseCommands.pasteTable()

// Vérifier si une table est copiée
claraverseCommands.hasTableCopied()

// Obtenir les infos de la table copiée
claraverseCommands.getCopiedTableInfo()

// Effacer la table copiée
claraverseCommands.clearCopiedTable()
```

### 2. `public/menu.js`

**Nouvelles entrées dans le menu contextuel (section "Tables") :**

- `📋 Copier table` (Ctrl+C) - Copie la table active en mémoire
- `📄 Coller table` (Ctrl+Shift+P) - Colle la table copiée

**Nouvelles méthodes ajoutées dans `ContextualMenuManager` :**

- `copyTableToMemory()` : Copie la table active (utilise conso.js si disponible)
- `pasteTableFromMemory()` : Colle la table copiée (utilise conso.js si disponible)

**Nouveau raccourci clavier :**

- `Ctrl+Shift+P` : Coller la table copiée

## Utilisation

### Via le menu contextuel

1. **Copier une table :**
   - Cliquez sur une table du chat
   - Clic droit pour ouvrir le menu contextuel
   - Section "Tables" → "📋 Copier table"

2. **Coller une table :**
   - Cliquez sur la table cible à remplacer
   - Clic droit pour ouvrir le menu contextuel
   - Section "Tables" → "📄 Coller table"

### Via les raccourcis clavier

1. Cliquez sur la table source
2. Utilisez `Ctrl+C` (ou le menu) pour copier
3. Cliquez sur la table cible
4. Utilisez `Ctrl+Shift+P` pour coller

### Via la console JavaScript

```javascript
// 1. Cliquez sur la table source
// 2. Copier
claraverseCommands.copyTable()

// 3. Cliquez sur la table cible
// 4. Coller
claraverseCommands.pasteTable()
```

## Fonctionnalités

- **Copie complète** : En-têtes, données, styles CSS, couleurs de fond
- **Préservation du HTML** : Le contenu HTML riche est préservé
- **Cellules éditables** : Les cellules collées sont automatiquement éditables
- **Effet visuel** : Bordure verte temporaire après le collage
- **Sauvegarde automatique** : La table collée est automatiquement sauvegardée
- **Fallback** : Fonctionne même si conso.js n'est pas chargé

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Menu Contextuel                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Section "Tables"                                         ││
│  │  - 📋 Copier table    → copyTableToMemory()             ││
│  │  - 📄 Coller table    → pasteTableFromMemory()          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    conso.js (Processeur)                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ copiedTableData = {                                      ││
│  │   timestamp: Date.now(),                                 ││
│  │   headers: [{text, html, style}, ...],                   ││
│  │   rows: [[{text, html, style, bgColor}, ...], ...],      ││
│  │   styles: {tableClass, tableStyle}                       ││
│  │ }                                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  copyTable(table) → Extrait et stocke les données           │
│  pasteTable(table) → Reconstruit la table depuis les données│
└─────────────────────────────────────────────────────────────┘
```

## Notes techniques

- La table copiée est stockée en mémoire (variable `copiedTableData`)
- Les données ne sont pas persistées dans localStorage (copie temporaire)
- Le collage remplace intégralement le contenu de la table cible
- Les classes CSS de la table cible sont préservées
