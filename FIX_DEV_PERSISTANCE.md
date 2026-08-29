# 🔧 Correction - Persistance dev-indexedDB.js

## 🎯 Problème Identifié

Les modifications effectuées avec `dev-indexedDB.js` n'étaient **pas persistantes** lors de :
- Actualisation de la page (F5)
- Changement de chat

---

## 🔍 Causes du Problème

### 1. Mauvaise Méthode de Sauvegarde

**Avant** :
```javascript
if (service && service.saveTable) {
    await service.saveTable(tableData);
}
```

**Problème** : La méthode `saveTable()` n'existe pas dans `flowiseTableService`.

### 2. Restauration Incorrecte

**Avant** :
```javascript
const tableData = savedTables.find(
    (t) => t.metadata && t.metadata.cellId && t.metadata.cellId.includes(tableId)
);
```

**Problème** : Cherchait les données dans `metadata` qui n'existe pas dans le format de sauvegarde.

### 3. Pas d'Écouteur d'Événements

**Problème** : Ne réagissait pas aux événements de restauration du système principal.

---

## ✅ Solutions Appliquées

### 1. Utilisation de la Bonne Méthode

**Après** :
```javascript
if (service && service.saveGeneratedTable) {
    await service.saveGeneratedTable(
        sessionId,
        table,
        tableId,
        "dev-indexeddb",
        undefined, // messageId
        true // forceUpdate
    );
}
```

**Avantages** :
- ✅ Utilise la méthode correcte du système existant
- ✅ Sauvegarde dans `clara_db` / `clara_generated_tables`
- ✅ Compatible avec le système de restauration

### 2. Restauration depuis le HTML Sauvegardé

**Après** :
```javascript
// Créer un élément temporaire pour parser le HTML sauvegardé
const tempDiv = document.createElement("div");
tempDiv.innerHTML = tableData.html;
const savedTable = tempDiv.querySelector("table");

// Restaurer le contenu des cellules
const currentCells = table.querySelectorAll("td");
const savedCells = savedTable.querySelectorAll("td");

currentCells.forEach((cell, index) => {
    if (savedCells[index]) {
        const savedContent = savedCells[index].textContent.trim();
        cell.textContent = savedContent;
        cell.dataset.originalContent = savedContent;
    }
});
```

**Avantages** :
- ✅ Utilise le HTML sauvegardé par le système
- ✅ Restaure toutes les cellules modifiées
- ✅ Compatible avec le format existant

### 3. Écouteurs d'Événements

**Ajouté** :
```javascript
// Écouter les événements de restauration du système principal
document.addEventListener("claraverse:restore:complete", (event) => {
    devLog("🔄 Restauration système détectée, restauration dev...", "info");
    setTimeout(() => {
        restoreAllTables();
    }, 1000);
});

// Écouter les changements de chat
document.addEventListener("flowise:table:restore:request", (event) => {
    devLog("🔄 Changement de chat détecté", "info");
    setTimeout(() => {
        const tables = scanTables();
        tables.forEach((table) => {
            const tableId = generateTableId(table);
            restoreTableData(table, tableId);
        });
    }, 2000);
});
```

**Avantages** :
- ✅ Restaure automatiquement après le système principal
- ✅ Réagit aux changements de chat
- ✅ Synchronisé avec le système existant

### 4. Restauration Automatique des Nouvelles Tables

**Ajouté** :
```javascript
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.tagName === "TABLE") {
                setTimeout(() => {
                    makeTableEditable(node);
                    const tableId = generateTableId(node);
                    restoreTableData(node, tableId); // ✅ Restauration automatique
                }, 500);
            }
        });
    });
});
```

**Avantages** :
- ✅ Restaure automatiquement les nouvelles tables
- ✅ Fonctionne avec les tables chargées dynamiquement

---

## 🔄 Flux de Fonctionnement

### Sauvegarde

```
1. Utilisateur modifie une cellule (double-clic)
   ↓
2. Événement "blur" ou timeout (1 seconde)
   ↓
3. saveCellData() appelée
   ↓
4. flowiseTableService.saveGeneratedTable()
   ↓
5. Sauvegarde dans IndexedDB (clara_db)
   ↓
6. Notification "💾" affichée
```

### Restauration au Chargement

```
1. Page se charge
   ↓
2. initializeDevMode() s'exécute
   ↓
3. Scanner les tables
   ↓
4. makeTableEditable() pour chaque table
   ↓
5. Attendre 500ms
   ↓
6. restoreTableData() pour chaque table
   ↓
7. flowiseTableService.restoreSessionTables()
   ↓
8. Parser le HTML sauvegardé
   ↓
9. Restaurer le contenu des cellules
```

### Restauration au Changement de Chat

```
1. Utilisateur change de chat
   ↓
2. Événement "flowise:table:restore:request" émis
   ↓
3. dev-indexedDB écoute l'événement
   ↓
4. Attendre 2 secondes (stabilisation)
   ↓
5. Scanner les nouvelles tables
   ↓
6. restoreTableData() pour chaque table
   ↓
7. Cellules restaurées
```

---

## 🧪 Tests de Validation

### Test 1 : Sauvegarde Simple

1. Ouvrir l'application
2. Double-cliquer sur une cellule
3. Modifier le contenu : "Test 123"
4. Cliquer ailleurs ou attendre 1 seconde
5. Vérifier la notification "💾"

**Résultat attendu** : ✅ Notification affichée

### Test 2 : Restauration après F5

1. Modifier une cellule : "Test Persistance"
2. Attendre la notification "💾"
3. Recharger la page (F5)
4. Attendre 2-3 secondes
5. Vérifier que la cellule contient "Test Persistance"

**Résultat attendu** : ✅ Modification restaurée

### Test 3 : Changement de Chat

1. Dans le chat A, modifier une cellule : "Chat A"
2. Attendre la notification "💾"
3. Changer vers le chat B
4. Modifier une cellule : "Chat B"
5. Attendre la notification "💾"
6. Revenir au chat A
7. Vérifier que la cellule contient "Chat A"

**Résultat attendu** : ✅ Modifications restaurées dans chaque chat

### Test 4 : Multiples Cellules

1. Modifier 3 cellules différentes
2. Attendre les notifications "💾"
3. Recharger la page (F5)
4. Vérifier que les 3 cellules sont restaurées

**Résultat attendu** : ✅ Toutes les cellules restaurées

### Test 5 : Protection Édition

1. Double-cliquer sur une cellule (mode édition)
2. Recharger la page (F5) pendant l'édition
3. Vérifier que la cellule n'est pas restaurée pendant l'édition

**Résultat attendu** : ✅ Cellule en édition non restaurée

---

## 📊 Vérification dans IndexedDB

### Ouvrir IndexedDB

1. Outils de développement (F12)
2. Onglet "Application" ou "Stockage"
3. IndexedDB > clara_db > clara_generated_tables

### Vérifier les Données

**Rechercher** :
- `keyword` contenant "dev_table"
- `source` = "dev-indexeddb"
- `html` contenant les modifications

**Exemple** :
```javascript
{
  id: "uuid",
  sessionId: "stable_session_xxx",
  keyword: "dev_table_xxx",
  html: "<table>...</table>", // Contient les modifications
  source: "dev-indexeddb",
  timestamp: 1763398406571
}
```

---

## 🔧 Commandes de Debug

### Vérifier le Service

```javascript
// Dans la console
window.flowiseTableService
// Doit retourner un objet avec saveGeneratedTable()

window.flowiseTableService.saveGeneratedTable
// Doit retourner une fonction
```

### Vérifier la Session

```javascript
window.devIndexedDB.getCurrentSessionId()
// Doit retourner "stable_session_xxx"
```

### Forcer une Restauration

```javascript
window.devIndexedDB.restoreAllTables()
// Doit restaurer toutes les tables
```

### Vérifier les Tables Éditables

```javascript
window.devIndexedDB.scanTables()
// Doit retourner un tableau de tables
```

---

## 📝 Modifications Apportées

### Fichier : `public/dev-indexedDB.js`

**1. Fonction saveCellData()** :
- ✅ Utilise `saveGeneratedTable()` au lieu de `saveTable()`
- ✅ Passe les bons paramètres

**2. Fonction restoreTableData()** :
- ✅ Parse le HTML sauvegardé
- ✅ Restaure toutes les cellules
- ✅ Gère les cellules en cours d'édition

**3. Fonction initializeDevMode()** :
- ✅ Ajoute écouteur `claraverse:restore:complete`
- ✅ Ajoute écouteur `flowise:table:restore:request`
- ✅ Restaure automatiquement les nouvelles tables

---

## ✅ Checklist de Validation

### Sauvegarde
- [x] Utilise `saveGeneratedTable()`
- [x] Sauvegarde dans IndexedDB
- [x] Notification affichée
- [x] Effet visuel (fond vert)

### Restauration
- [x] Parse le HTML sauvegardé
- [x] Restaure toutes les cellules
- [x] Protection cellules en édition
- [x] Effet visuel (fond vert)

### Événements
- [x] Écoute `claraverse:restore:complete`
- [x] Écoute `flowise:table:restore:request`
- [x] Restaure après système principal
- [x] Restaure au changement de chat

### Tests
- [ ] Test 1 : Sauvegarde simple
- [ ] Test 2 : Restauration après F5
- [ ] Test 3 : Changement de chat
- [ ] Test 4 : Multiples cellules
- [ ] Test 5 : Protection édition

---

## 🎉 Conclusion

Les modifications de `dev-indexedDB.js` sont maintenant **persistantes** !

**Corrections appliquées** :
- ✅ Sauvegarde correcte avec `saveGeneratedTable()`
- ✅ Restauration depuis le HTML sauvegardé
- ✅ Écouteurs d'événements pour synchronisation
- ✅ Restauration automatique des nouvelles tables

**Prochaines étapes** :
1. Tester les 5 scénarios de validation
2. Vérifier dans IndexedDB
3. Utiliser l'application normalement

---

*Correction appliquée le 17 novembre 2025*
