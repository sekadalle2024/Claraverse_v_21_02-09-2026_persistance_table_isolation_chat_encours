# 🧪 Guide de Test - Édition de Cellules dans Menu.js

## 🎯 Objectif

Tester l'intégration de l'édition de cellules dans menu.js avec le système de sauvegarde existant.

---

## ✅ Tests Essentiels (5 minutes)

### Test 1 : Activer l'Édition

**Étapes** :
1. Ouvrir l'application
2. Clic droit sur une table
3. Cliquer sur "✏️ Activer édition des cellules"

**Résultat attendu** :
- ✅ Indicateur "✏️ ÉDITION ACTIVE" apparaît en haut à gauche de la table
- ✅ Message "✏️ Édition activée (X cellules)" s'affiche
- ✅ Log dans la console : `✏️ Édition activée: X cellules`

**Succès** : ✅ / ❌

---

### Test 2 : Modifier une Cellule

**Étapes** :
1. Activer l'édition (Test 1)
2. Cliquer sur une cellule
3. Modifier le contenu (ex: "Test 123")
4. Cliquer ailleurs

**Résultat attendu** :
- ✅ Cellule devient bleue au focus
- ✅ Cellule devient verte après le blur (sauvegarde)
- ✅ Log dans la console : `💾 Cellule modifiée - Table sauvegardée`
- ✅ Log dans la console : `✅ Table sauvegardée via système existant (cell_edit)`

**Succès** : ✅ / ❌

---

### Test 3 : Persistance après F5

**Étapes** :
1. Activer l'édition
2. Modifier plusieurs cellules (ex: "A", "B", "C")
3. Attendre 2 secondes
4. Appuyer sur F5 (recharger la page)
5. Vérifier les cellules modifiées

**Résultat attendu** :
- ✅ Page se recharge
- ✅ Tables sont restaurées
- ✅ Modifications sont présentes ("A", "B", "C")
- ✅ Log dans la console : `🔄 AUTO RESTORE CHAT CHANGE - Démarrage`

**Succès** : ✅ / ❌

---

### Test 4 : Raccourci Clavier Ctrl+E

**Étapes** :
1. Cliquer sur une table
2. Appuyer sur Ctrl+E
3. Vérifier l'indicateur
4. Appuyer à nouveau sur Ctrl+E

**Résultat attendu** :
- ✅ Première fois : Indicateur "✏️ ÉDITION ACTIVE" apparaît
- ✅ Deuxième fois : Indicateur disparaît
- ✅ Messages de confirmation s'affichent

**Succès** : ✅ / ❌

---

### Test 5 : Sauvegarde avec Ctrl+S

**Étapes** :
1. Activer l'édition
2. Cliquer sur une cellule
3. Modifier le contenu
4. Appuyer sur Ctrl+S (sans cliquer ailleurs)

**Résultat attendu** :
- ✅ Message "💾 Sauvegardé!" s'affiche
- ✅ Cellule devient verte
- ✅ Log dans la console : `💾 Cellule modifiée - Table sauvegardée`

**Succès** : ✅ / ❌

---

## 🔄 Tests de Compatibilité (10 minutes)

### Test 6 : Édition + Ajout de Ligne

**Étapes** :
1. Activer l'édition
2. Modifier une cellule (ex: "Test 1")
3. Clic droit > "➕ Insérer ligne en dessous"
4. Modifier une cellule de la nouvelle ligne (ex: "Test 2")
5. F5

**Résultat attendu** :
- ✅ Nouvelle ligne ajoutée
- ✅ Les deux modifications présentes après F5
- ✅ Log : `✅ Ligne ajoutée avec succès`
- ✅ Log : `✅ Table sauvegardée via système existant (structure_change)`

**Succès** : ✅ / ❌

---

### Test 7 : Édition + Suppression de Ligne

**Étapes** :
1. Activer l'édition
2. Modifier plusieurs cellules
3. Cliquer sur une cellule d'une ligne
4. Clic droit > "🗑️ Supprimer ligne sélectionnée"
5. Confirmer
6. F5

**Résultat attendu** :
- ✅ Ligne supprimée
- ✅ Modifications des autres cellules présentes après F5
- ✅ Log : `✅ Ligne supprimée`

**Succès** : ✅ / ❌

---

### Test 8 : Édition + Import Excel

**Étapes** :
1. Activer l'édition
2. Modifier une cellule
3. Clic droit > "📥 Import Excel Standard"
4. Sélectionner un fichier Excel
5. Activer à nouveau l'édition
6. Modifier une cellule du nouveau contenu
7. F5

**Résultat attendu** :
- ✅ Contenu Excel importé
- ✅ Nouvelle modification présente après F5
- ✅ Log : `✅ Import Excel terminé avec succès!`

**Succès** : ✅ / ❌

---

## 🔍 Tests Avancés (15 minutes)

### Test 9 : Changement de Chat

**Étapes** :
1. Activer l'édition sur une table du Chat A
2. Modifier plusieurs cellules
3. Changer de chat (Chat B)
4. Revenir au Chat A
5. Vérifier les modifications

**Résultat attendu** :
- ✅ Modifications présentes dans Chat A
- ✅ Log : `🎯 === RESTAURATION VIA ÉVÉNEMENT ===`
- ✅ Log : `✅ Événement de restauration déclenché`

**Succès** : ✅ / ❌

---

### Test 10 : Édition Multiple Tables

**Étapes** :
1. Activer l'édition sur Table 1
2. Modifier des cellules
3. Activer l'édition sur Table 2
4. Modifier des cellules
5. F5
6. Vérifier les deux tables

**Résultat attendu** :
- ✅ Modifications présentes dans Table 1
- ✅ Modifications présentes dans Table 2
- ✅ Chaque table a son propre indicateur

**Succès** : ✅ / ❌

---

### Test 11 : Désactiver l'Édition

**Étapes** :
1. Activer l'édition
2. Modifier une cellule
3. Clic droit > "🔒 Désactiver édition des cellules"
4. Essayer de modifier une cellule

**Résultat attendu** :
- ✅ Indicateur "✏️ ÉDITION ACTIVE" disparaît
- ✅ Message "🔒 Édition désactivée" s'affiche
- ✅ Cellules ne sont plus éditables
- ✅ Modifications précédentes sont sauvegardées

**Succès** : ✅ / ❌

---

## 🔧 Tests de Débogage

### Test 12 : Vérifier IndexedDB

**Étapes** :
1. Activer l'édition
2. Modifier une cellule
3. Ouvrir Outils de développement (F12)
4. Aller dans Application > IndexedDB > clara_db > clara_generated_tables
5. Vérifier les données

**Résultat attendu** :
- ✅ Entrée avec le sessionId actuel
- ✅ Champ `html` contient le HTML de la table
- ✅ Champ `timestamp` récent
- ✅ Champ `source` = "menu"

**Succès** : ✅ / ❌

---

### Test 13 : Vérifier SessionId

**Étapes** :
1. Ouvrir la console
2. Taper : `sessionStorage.getItem('claraverse_stable_session')`
3. Noter le sessionId
4. Modifier une cellule
5. Vérifier dans IndexedDB que le sessionId correspond

**Résultat attendu** :
- ✅ SessionId stable présent
- ✅ Format : `stable_session_TIMESTAMP_RANDOM`
- ✅ Même sessionId dans IndexedDB

**Succès** : ✅ / ❌

---

### Test 14 : Vérifier les Événements

**Étapes** :
1. Ouvrir la console
2. Activer l'édition
3. Modifier une cellule
4. Vérifier les logs

**Résultat attendu** :
- ✅ Log : `💾 Cellule modifiée - Table sauvegardée`
- ✅ Log : `✅ Table sauvegardée via système existant (cell_edit)`
- ✅ Pas d'erreur dans la console

**Succès** : ✅ / ❌

---

## 📊 Résultats

### Résumé des Tests

| Test | Description | Résultat |
|------|-------------|----------|
| 1 | Activer l'édition | ✅ / ❌ |
| 2 | Modifier une cellule | ✅ / ❌ |
| 3 | Persistance après F5 | ✅ / ❌ |
| 4 | Raccourci Ctrl+E | ✅ / ❌ |
| 5 | Sauvegarde Ctrl+S | ✅ / ❌ |
| 6 | Édition + Ajout ligne | ✅ / ❌ |
| 7 | Édition + Suppression ligne | ✅ / ❌ |
| 8 | Édition + Import Excel | ✅ / ❌ |
| 9 | Changement de chat | ✅ / ❌ |
| 10 | Édition multiple tables | ✅ / ❌ |
| 11 | Désactiver l'édition | ✅ / ❌ |
| 12 | Vérifier IndexedDB | ✅ / ❌ |
| 13 | Vérifier SessionId | ✅ / ❌ |
| 14 | Vérifier les événements | ✅ / ❌ |

**Total** : ___/14 tests réussis

---

## 🚨 Problèmes Courants

### Problème 1 : Modifications non sauvegardées

**Symptômes** :
- Cellule modifiée mais pas de log de sauvegarde
- Modifications disparaissent après F5

**Vérifications** :
```javascript
// Dans la console
sessionStorage.getItem('claraverse_stable_session')
// Doit retourner un sessionId
```

**Solution** :
```javascript
// Forcer une sauvegarde manuelle
const table = document.querySelector('table');
window.contextualMenuManager.saveTableViaExistingSystem(table, 'manual');
```

---

### Problème 2 : Indicateur ne s'affiche pas

**Symptômes** :
- Pas d'indicateur "✏️ ÉDITION ACTIVE"
- Cellules éditables mais pas d'indicateur visuel

**Vérifications** :
```javascript
// Dans la console
const table = document.querySelector('table');
console.log(getComputedStyle(table).position);
// Doit retourner 'relative' ou 'absolute'
```

**Solution** :
```javascript
// Forcer l'affichage
const table = document.querySelector('table');
table.style.position = 'relative';
window.contextualMenuManager.addEditingIndicator(table);
```

---

### Problème 3 : Ctrl+E ne fonctionne pas

**Symptômes** :
- Raccourci clavier ne répond pas
- Pas de message d'activation

**Vérifications** :
```javascript
// Dans la console
console.log(window.contextualMenuManager);
// Doit retourner l'objet ContextualMenuManager
```

**Solution** :
```javascript
// Réinitialiser le menu
window.contextualMenuManager.init();
```

---

## ✅ Checklist Finale

Avant de valider l'intégration :

- [ ] Tous les tests essentiels (1-5) passent
- [ ] Au moins 3 tests de compatibilité (6-8) passent
- [ ] Au moins 2 tests avancés (9-11) passent
- [ ] Tous les tests de débogage (12-14) passent
- [ ] Aucune erreur dans la console
- [ ] IndexedDB contient les données
- [ ] SessionId stable présent
- [ ] Documentation lue

**Total** : ___/8 critères validés

---

## 📞 Support

### Commandes Utiles

```javascript
// État du menu
console.log(window.contextualMenuManager);

// SessionId
sessionStorage.getItem('claraverse_stable_session');

// Tables sauvegardées
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => console.log('Tables:', getAll.result);
};

// Forcer une sauvegarde
const table = document.querySelector('table');
window.contextualMenuManager.saveTableViaExistingSystem(table, 'manual');

// Activer l'édition
const table = document.querySelector('table');
window.contextualMenuManager.targetTable = table;
window.contextualMenuManager.enableCellEditing();
```

---

## 📚 Documentation

- **[INTEGRATION_EDITION_CELLULES_MENU.md](INTEGRATION_EDITION_CELLULES_MENU.md)** - Documentation complète
- **[DOCUMENTATION_COMPLETE_SOLUTION.md](DOCUMENTATION_COMPLETE_SOLUTION.md)** - Système de sauvegarde
- **[APPROCHE_FINALE_SIMPLE.md](APPROCHE_FINALE_SIMPLE.md)** - Approche utilisée

---

**Bon test !** 🧪

---

*Guide créé le 18 novembre 2025*
