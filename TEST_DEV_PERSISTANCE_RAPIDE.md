# 🧪 Test Rapide - Persistance dev-indexedDB.js

## ⚡ Test en 2 Minutes

### Test 1 : Sauvegarde et Restauration

**Étapes** :
1. Ouvrir l'application
2. Trouver une table
3. **Double-cliquer** sur une cellule
4. Modifier le contenu : **"TEST 123"**
5. Cliquer ailleurs (ou attendre 1 seconde)
6. Vérifier la notification **"💾"**
7. **Recharger la page** (F5)
8. Attendre 2-3 secondes
9. Vérifier que la cellule contient **"TEST 123"**

**Résultat attendu** : ✅ La modification est restaurée

---

### Test 2 : Changement de Chat

**Étapes** :
1. Dans le chat actuel, modifier une cellule : **"CHAT A"**
2. Attendre la notification **"💾"**
3. **Changer de chat**
4. Attendre 2-3 secondes
5. **Revenir au chat précédent**
6. Vérifier que la cellule contient **"CHAT A"**

**Résultat attendu** : ✅ La modification est restaurée

---

## 🔍 Vérification dans IndexedDB

### Ouvrir IndexedDB

1. **F12** (Outils de développement)
2. Onglet **"Application"** ou **"Stockage"**
3. **IndexedDB** > **clara_db** > **clara_generated_tables**

### Chercher les Données

**Filtrer par** :
- `source` = **"dev-indexeddb"**
- `keyword` contenant **"dev_table"**

**Vérifier** :
- Le champ `html` contient les modifications
- Le `timestamp` est récent

---

## 🚨 Si Ça Ne Fonctionne Pas

### Vérifier le Service

Dans la console :
```javascript
window.flowiseTableService
// Doit retourner un objet
```

### Vérifier la Session

```javascript
window.devIndexedDB.getCurrentSessionId()
// Doit retourner "stable_session_xxx"
```

### Forcer une Restauration

```javascript
window.devIndexedDB.restoreAllTables()
```

### Vérifier les Logs

Chercher dans la console :
- `💾 Sauvegardé: xxx`
- `✅ Table xxx: X cellules restaurées`

---

## ✅ Checklist

- [ ] Test 1 : Modification restaurée après F5
- [ ] Test 2 : Modification restaurée après changement de chat
- [ ] Vérification IndexedDB : Données présentes
- [ ] Logs : Sauvegarde et restauration confirmées

**Si toutes les cases sont cochées** : ✅ Persistance fonctionnelle !

---

*Test rapide créé le 17 novembre 2025*
