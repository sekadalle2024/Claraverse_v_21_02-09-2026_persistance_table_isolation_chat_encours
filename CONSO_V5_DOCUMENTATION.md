# 📋 Claraverse Conso.js - Version 5.0 (V5)

## 🎯 Objectif de la V5

La version 5 de `conso.js` apporte des améliorations majeures pour la gestion des **tables CIA (Examen)** avec une meilleure présentation visuelle et une persistance optimisée.

---

## 🆕 Nouvelles Fonctionnalités V5

### 1. 🔒 Masquage des Colonnes Sensibles

Les colonnes **Reponse_cia** et **Remarques** sont maintenant **masquées visuellement** tout en restant présentes dans le DOM.

**Avantages:**
- Les réponses correctes ne sont pas visibles par l'utilisateur
- Les données restent accessibles pour la sauvegarde et la restauration
- Améliore l'expérience utilisateur lors des examens

**Variations de colonnes masquées:**
- `Reponse_cia`, `REPONSE CIA`, `Reponse cia`, `reponse_cia`, `reponse cia`
- `Remarques`, `remarques`, `remarque`, `Remarque`

### 2. 🔗 Fusion Automatique des Cellules

Les colonnes **Question** et **Ref_question** fusionnent automatiquement leurs cellules lorsque toutes les lignes contiennent la même valeur.

**Comportement:**
- Détection automatique des valeurs identiques
- Fusion verticale avec `rowspan`
- Centrage du texte au milieu de la cellule fusionnée
- Style amélioré (police en gras, alignement central)

**Variations de colonnes fusionnées:**
- `Question`, `question`, `QUESTION`
- `Ref_question`, `ref_question`, `REF_QUESTION`, `REF QUESTION`

### 3. 💾 Persistance Améliorée

La sauvegarde et restauration des tables CIA inclut maintenant:

**Données sauvegardées:**
- ✅ État des checkboxes (coché/décoché)
- ✅ Colonnes masquées (`data-hidden`)
- ✅ Cellules fusionnées (`data-merged`, `rowspan`)
- ✅ Styles et couleurs de fond
- ✅ Contenu HTML enrichi

**Restauration intelligente:**
- Les colonnes masquées restent masquées après rechargement
- Les cellules fusionnées conservent leur fusion
- Les checkboxes retrouvent leur état exact

---

## 📊 Structure des Tables CIA

### Colonnes Reconnues

| Colonne | Variations | Action |
|---------|-----------|--------|
| **Ref_question** | `Ref_question`, `ref_question`, `REF_QUESTION` | Fusion automatique |
| **Question** | `Question`, `question`, `QUESTION` | Fusion automatique |
| **Option** | `Option`, `option` | Affichage normal |
| **Reponse_user** | `Reponse_user`, `Reponse user`, `reponse_user` | Checkbox interactive |
| **Reponse_cia** | `Reponse_cia`, `REPONSE CIA`, `reponse cia` | **Masquée** |
| **Remarques** | `Remarques`, `remarques`, `remarque` | **Masquée** |

### Exemple de Table CIA

```
┌─────────────┬──────────────────────┬─────────┬──────────────┬─────────────┬───────────┐
│ Ref_question│ Question             │ Option  │ Reponse_user │ Reponse_cia │ Remarques │
│ (fusionnée) │ (fusionnée)          │         │              │ (masquée)   │ (masquée) │
├─────────────┼──────────────────────┼─────────┼──────────────┼─────────────┼───────────┤
│             │                      │ A       │ ☐            │ Oui         │ Correct   │
│   Q1-CIA    │ Quelle est la        ├─────────┼──────────────┼─────────────┼───────────┤
│             │ bonne réponse?       │ B       │ ☑            │ Non         │ Incorrect │
│             │                      ├─────────┼──────────────┼─────────────┼───────────┤
│             │                      │ C       │ ☐            │ Non         │ Incorrect │
└─────────────┴──────────────────────┴─────────┴──────────────┴─────────────┴───────────┘
```

---

## 🔧 Fonctions Ajoutées

### `hideColumns(table, headers, columnTypes)`

Masque visuellement des colonnes tout en les conservant dans le DOM.

**Paramètres:**
- `table`: L'élément table HTML
- `headers`: Tableau des en-têtes de colonnes
- `columnTypes`: Tableau des types de colonnes à masquer (ex: `["reponse_cia", "remarques"]`)

**Comportement:**
- Applique `display: none` sur l'en-tête et toutes les cellules
- Ajoute l'attribut `data-hidden="true"` pour la persistance

### `mergeCellsForColumn(table, headers, columnType)`

Fusionne les cellules d'une colonne si elles contiennent toutes la même valeur.

**Paramètres:**
- `table`: L'élément table HTML
- `headers`: Tableau des en-têtes de colonnes
- `columnType`: Type de colonne à fusionner (ex: `"question"`)

**Comportement:**
- Vérifie que toutes les valeurs sont identiques
- Applique `rowspan` sur la première cellule
- Masque les autres cellules avec `data-merged="true"`
- Centre le texte verticalement et horizontalement

---

## 🧪 Tests et Validation

### Test de Persistance CIA

```javascript
// Dans la console du navigateur
claraverseCommands.testPersistence();
```

### Vérifier les Colonnes Masquées

```javascript
// Vérifier qu'une colonne est masquée
const headers = document.querySelectorAll('th');
headers.forEach(h => {
  if (h.getAttribute('data-hidden') === 'true') {
    console.log('Colonne masquée:', h.textContent);
  }
});
```

### Vérifier les Cellules Fusionnées

```javascript
// Vérifier les cellules avec rowspan
const mergedCells = document.querySelectorAll('td[rowspan]');
console.log(`${mergedCells.length} cellule(s) fusionnée(s)`);
mergedCells.forEach(cell => {
  console.log('Cellule fusionnée:', cell.textContent, 'rowspan:', cell.getAttribute('rowspan'));
});
```

---

## 📝 Compatibilité

### Versions Précédentes

La V5 est **rétrocompatible** avec les versions précédentes:
- Les tables modelisées (Assertion, Conclusion, CTR) fonctionnent toujours
- Les tables de consolidation sont désactivées (comme en V4)
- La persistance des données existantes est préservée

### Migration depuis V4

**Aucune action requise!** La V5 détecte automatiquement:
- Les anciennes données sauvegardées (format V4)
- Les nouvelles tables CIA avec colonnes à masquer/fusionner
- Les tables modelisées existantes

---

## 🎨 Styles Appliqués

### Cellules Fusionnées

```css
vertical-align: middle;
text-align: center;
font-weight: 500;
```

### Colonnes Masquées

```css
display: none;
```

### Checkboxes CIA

```css
width: 20px;
height: 20px;
cursor: pointer;
accent-color: #007bff;
```

### Cellule Cochée

```css
background-color: #e8f5e8; /* Vert clair */
```

---

## 🚀 Utilisation

### Initialisation Automatique

Le script s'initialise automatiquement au chargement de la page:

```javascript
// Aucune action requise, le script démarre automatiquement
```

### Commandes Disponibles

```javascript
// Voir toutes les commandes
claraverseCommands.help();

// Sauvegarder toutes les tables
claraverseCommands.saveAllNow();

// Restaurer toutes les tables
claraverseCommands.restoreAll();

// Voir les infos de stockage
claraverseCommands.getStorageInfo();

// Test complet de persistance
claraverseCommands.testPersistence();
```

---

## 🐛 Dépannage

### Les Colonnes ne sont pas Masquées

1. Vérifier que les en-têtes correspondent aux variations reconnues
2. Ouvrir la console et taper:
   ```javascript
   claraverseCommands.debug.listTables();
   ```
3. Vérifier les logs pour voir si les colonnes sont détectées

### Les Cellules ne Fusionnent pas

**Causes possibles:**
- Les valeurs ne sont pas strictement identiques (espaces, casse)
- La colonne n'est pas reconnue (vérifier les variations)

**Solution:**
```javascript
// Forcer le retraitement
claraverseProcessor.processAllTables();
```

### Les Checkboxes ne se Sauvegardent pas

1. Vérifier que localStorage est disponible:
   ```javascript
   claraverseCommands.testPersistence();
   ```

2. Forcer la sauvegarde:
   ```javascript
   claraverseCommands.saveAllNow();
   ```

3. Vérifier le stockage:
   ```javascript
   claraverseCommands.getStorageInfo();
   ```

---

## 📊 Logs de Debug

### Activation des Logs Détaillés

```javascript
claraverseCommands.debug.enableVerbose();
```

### Logs Importants V5

```
🔒 Masquage des colonnes: ["reponse_cia", "remarques"]
🔗 Fusion des cellules pour question (index 1)
✅ 5 cellules fusionnées pour question
💾 Sauvegarde avec états de visibilité et fusion
🔄 Restauration avec colonnes masquées et cellules fusionnées
```

---

## 🎯 Résumé des Améliorations V5

| Fonctionnalité | V4 | V5 |
|----------------|----|----|
| Masquage colonnes CIA | ❌ | ✅ |
| Fusion cellules Question | ❌ | ✅ |
| Fusion cellules Ref_question | ❌ | ✅ |
| Persistance colonnes masquées | ❌ | ✅ |
| Persistance cellules fusionnées | ❌ | ✅ |
| Checkboxes CIA | ✅ | ✅ (amélioré) |
| Tables modelisées | ✅ | ✅ |
| Sauvegarde automatique | ✅ | ✅ |

---

## 📞 Support

Pour toute question ou problème:

1. Consulter les logs: `claraverseCommands.debug.enableVerbose()`
2. Tester la persistance: `claraverseCommands.testPersistence()`
3. Vérifier le stockage: `claraverseCommands.getStorageInfo()`

---

**Version:** 5.0  
**Date:** 29 novembre 2025  
**Compatibilité:** React, TypeScript, JavaScript vanilla
