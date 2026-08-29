# 📘 Guide Simple - Un Seul Fichier : table_data.js

## 🎯 Principe

**UN SEUL fichier nécessaire : `table_data.js`**

Tous les autres fichiers (fix_save_issue.js, debug_table_data.js, etc.) sont optionnels et servent uniquement au dépannage.

---

## ⚡ Installation (1 minute)

### Étape 1 : Ajouter le Script

Dans votre HTML, ajouter **AVANT** `conso.js` :

```html
<!DOCTYPE html>
<html>
<head>
  <title>ClaraVerse</title>
</head>
<body>
  <!-- Votre contenu avec des tables -->
  
  <!-- ✅ Charger table_data.js EN PREMIER -->
  <script src="table_data.js"></script>
  
  <!-- ✅ Puis charger conso.js -->
  <script src="conso.js"></script>
</body>
</html>
```

**C'EST TOUT ! Le système fonctionne automatiquement.**

---

## ✅ Vérification (30 secondes)

Ouvrir la console (F12) et vérifier :

```javascript
// Ces 3 choses doivent exister
console.log(window.ClaraverseTableDataManager);  // Objet
console.log(window.ClaraverseTableData);         // Objet
console.log(window.forceSaveAllTables);          // Function
```

**Si tout affiche des objets/fonctions → ✅ Ça marche !**

---

## 🚀 Utilisation Automatique

Le système fonctionne **automatiquement** :

1. ✅ **Détecte** toutes les tables au chargement
2. ✅ **Rend les cellules éditables** automatiquement
3. ✅ **Indexe** toutes les cellules avec des attributs `data-*`
4. ✅ **Sauvegarde** automatiquement à chaque modification
5. ✅ **Restaure** les données au rechargement (pendant la session)

**Vous n'avez RIEN à faire !**

---

## 💾 Sauvegarde Manuelle (Optionnel)

Si vous voulez forcer une sauvegarde :

```javascript
// Sauvegarder toutes les tables manuellement
window.forceSaveAllTables();
```

---

## 📊 Fonctionnalités Automatiques

### 1. Détection des Tables

Le système détecte automatiquement :
- Tables Claraverse : `class="min-w-full border..."`
- Tables de consolidation : `class="claraverse-conso-table"`
- Toutes les autres tables : `<table>`

**Retry automatique** : Si aucune table n'est trouvée, le système réessaie 3 fois.

### 2. Cellules Éditables

Le système rend **automatiquement** toutes les cellules `<td>` éditables :

```html
<!-- AVANT (votre code) -->
<td>Contenu</td>

<!-- APRÈS (automatique) -->
<td contenteditable="true">Contenu</td>
```

**Vous n'avez pas besoin d'ajouter `contenteditable="true"` !**

### 3. Sauvegarde Automatique

Chaque fois que vous modifiez une cellule et perdez le focus (blur) :
- ✅ La cellule est sauvegardée dans `data-cell-state`
- ✅ Un timestamp est ajouté dans `data-last-modified`
- ✅ Un événement `claraverse:table:changed` est émis

### 4. Types de Tables

Le système identifie automatiquement :
- `pointage` : Tables avec colonnes Assertion, Ecart, CTR, Conclusion
- `conso` : Tables de consolidation
- `resultat` : Tables de résultats
- `standard` : Autres tables

---

## 🔧 API Simple (Optionnel)

### Sauvegarder une table

```javascript
const table = document.querySelector('table');
window.ClaraverseTableData.saveTable(table);
```

### Restaurer une table

```javascript
window.ClaraverseTableData.restoreTable(table);
```

### Exporter toutes les données

```javascript
const data = window.ClaraverseTableData.exportAll();
console.log(data); // JSON de toutes les tables
```

### Obtenir les infos d'une table

```javascript
const tables = window.ClaraverseTableData.getAllTables();
console.log(`${tables.length} table(s) gérée(s)`);
```

---

## 🎨 Personnalisation (Optionnel)

Pour désactiver les logs ou la correction automatique, modifier dans `table_data.js` (ligne ~53) :

```javascript
const CONFIG = {
  // ...
  debugMode: false,              // ← Désactiver les logs
  autoMakeCellsEditable: false,  // ← Ne pas rendre les cellules éditables auto
  retryCount: 3,                 // ← Nombre de tentatives
  retryDelay: 1000,              // ← Délai entre tentatives (ms)
};
```

---

## 🧪 Test Simple

### Test 1 : Modifier une cellule

1. Modifier une cellule dans une table
2. Cliquer en dehors (perdre le focus)
3. Ouvrir la console (F12)
4. Vérifier :

```javascript
const cell = document.querySelector('td[data-cell-state]');
console.log(cell.getAttribute('data-cell-state'));
// Devrait afficher : {"value":"...", "html":"...", "timestamp":...}
```

**✅ Si vous voyez un JSON → La sauvegarde fonctionne !**

### Test 2 : Vérifier les tables

```javascript
console.log(window.ClaraverseTableDataManager.tables.size);
// Devrait afficher : le nombre de tables (> 0)
```

---

## 🐛 Dépannage Simple

### Problème : "window.ClaraverseTableDataManager is undefined"

**Cause** : `table_data.js` n'est pas chargé

**Solution** :
```html
<!-- Vérifier le chemin du fichier -->
<script src="table_data.js"></script>
```

### Problème : "Aucune table trouvée (tables.size = 0)"

**Cause** : Les tables sont chargées après le script

**Solution** : Attendre ou forcer la détection :
```javascript
// Attendre 2 secondes puis forcer
setTimeout(() => {
  window.ClaraverseTableDataManager.discoverAllTables();
}, 2000);
```

### Problème : "Les cellules ne se sauvegardent pas"

**Cause** : Les cellules ne sont pas éditables

**Solution** : Le système le fait automatiquement, mais vous pouvez forcer :
```javascript
window.forceSaveAllTables();
```

---

## ⚠️ Important

### Persistance des Données

**Les données sont sauvegardées dans le DOM** :
- ✅ Persistance **pendant la session** (page ouverte)
- ❌ **Perdues au rechargement** de la page

**C'est le comportement voulu** : persistance temporaire, pas de localStorage.

### Si vous voulez persister entre sessions

Utiliser l'export/import optionnel :

```javascript
// Avant de quitter
window.addEventListener('beforeunload', () => {
  const data = window.ClaraverseTableData.exportAll();
  localStorage.setItem('backup', JSON.stringify(data));
});

// Au chargement
window.addEventListener('load', () => {
  const backup = localStorage.getItem('backup');
  if (backup) {
    const data = JSON.parse(backup);
    Object.entries(data).forEach(([tableId, tableData]) => {
      window.ClaraverseTableData.importTable(tableId, tableData);
    });
  }
});
```

---

## 📋 Checklist

- [ ] `table_data.js` est chargé **AVANT** `conso.js`
- [ ] La console ne montre pas d'erreurs
- [ ] `window.ClaraverseTableDataManager` existe
- [ ] `window.ClaraverseTableData` existe
- [ ] Les tests de modification fonctionnent
- [ ] Les données sont dans `data-cell-state`

---

## 🎉 Résumé

### Ce que vous devez faire :

```html
<!-- 1. Ajouter UNE ligne dans votre HTML -->
<script src="table_data.js"></script>
```

### Ce que le système fait automatiquement :

1. ✅ Trouve toutes les tables
2. ✅ Rend les cellules éditables
3. ✅ Indexe les cellules
4. ✅ Configure les event listeners
5. ✅ Sauvegarde à chaque modification
6. ✅ Restaure les données

**C'est tout ! Un seul fichier, zéro configuration.**

---

## 📞 Documentation Complète

Pour aller plus loin :
- **API détaillée** : `README_TABLE_DATA.md`
- **Migration conso.js** : `MIGRATION_GUIDE.md`
- **Dépannage** : `TROUBLESHOOTING_SAVE.md`

Mais pour l'utilisation de base, ce guide suffit.

---

**Version:** 2.0.0  
**Fichier unique** : `table_data.js` (34 KB)  
**Configuration** : Aucune nécessaire  
**Ça marche immédiatement** : ✅ Oui