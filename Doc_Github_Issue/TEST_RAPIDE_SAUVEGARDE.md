# 🧪 Test Rapide - Sauvegarde des Cellules

## ⚡ Test en 2 Minutes

### Étape 1 : Recharger l'Application

1. Recharger la page (F5)
2. Attendre le chargement complet (2-3 secondes)

### Étape 2 : Ouvrir la Console

1. Appuyer sur **F12**
2. Aller dans l'onglet **Console**
3. Observer les messages de diagnostic

### Étape 3 : Vérifier le Diagnostic

Vous devriez voir :

```
🔍 === DIAGNOSTIC ÉDITION CELLULES MENU.JS ===
1️⃣ Menu.js chargé: ✅ OUI
2️⃣ flowiseTableService: ✅ Disponible  OU  ❌ Non disponible
3️⃣ flowiseTableBridge: ...
4️⃣ SessionId stable: ...
5️⃣ IndexedDB clara_db: ✅ Accessible
6️⃣ Tables dans le DOM: X
```

### Étape 4 : Test de Sauvegarde

#### Option A : Via le Menu (Recommandé)

1. Clic droit sur une table
2. Cliquer sur "💾 Sauvegarder toutes les cellules"
3. Observer la notification

**Résultat attendu** : "💾 X cellules sauvegardées" (X > 0)

#### Option B : Via la Console

Dans la console, exécuter :

```javascript
testMenuCellSave()
```

Observer les logs :

```
🧪 === TEST DE SAUVEGARDE ===
📊 Test sur la première table
✅ Service de sauvegarde disponible
✅ Méthode saveTable disponible
📍 SessionId: ...
📦 Données de test: ...
💾 Tentative de sauvegarde...
✅ Sauvegarde réussie !
```

---

## 🔍 Interprétation des Résultats

### ✅ Cas 1 : Tout Fonctionne

**Console** :
```
✅ Service de sauvegarde disponible
💾 X cellules sauvegardées
```

**Action** : Rien à faire, le système fonctionne !

### ⚠️ Cas 2 : Service Non Disponible

**Console** :
```
❌ flowiseTableService: Non disponible
❌ Service de sauvegarde non disponible
```

**Cause** : Les services TypeScript ne sont pas chargés

**Solution** :
1. Attendre 5 secondes supplémentaires
2. Recharger la page (F5)
3. Vérifier que l'application React est démarrée

### ⚠️ Cas 3 : 0 Cellule Sauvegardée

**Console** :
```
✅ Service disponible
📊 Tentative de sauvegarde de 0 cellules
💾 0 cellules sauvegardées
```

**Cause** : L'édition n'est pas activée

**Solution** :
1. Clic droit sur la table
2. "✏️ Activer édition cellules"
3. Attendre le badge "✏️ ÉDITION ACTIVE"
4. Réessayer la sauvegarde

---

## 🎯 Test Complet

### Test 1 : Activation + Sauvegarde

```
1. Clic droit sur table
2. "✏️ Activer édition cellules"
3. Vérifier badge "✏️ ÉDITION ACTIVE"
4. Clic droit à nouveau
5. "💾 Sauvegarder toutes les cellules"
6. Vérifier notification "💾 X cellules sauvegardées"
```

**Résultat attendu** : X > 0

### Test 2 : Modification + Sauvegarde Auto

```
1. Activer l'édition (Ctrl+E)
2. Double-cliquer sur une cellule
3. Modifier le contenu
4. Appuyer sur Enter
5. Observer le fond vert
```

**Résultat attendu** : Fond vert + notification "💾"

### Test 3 : Restauration

```
1. Sauvegarder des cellules (Test 1)
2. Recharger la page (F5)
3. Clic droit sur la table
4. "🔄 Restaurer cellules sauvegardées"
5. Observer les cellules
```

**Résultat attendu** : Cellules restaurées avec fond vert

---

## 📊 Checklist

- [ ] Diagnostic affiché dans la console
- [ ] flowiseTableService disponible
- [ ] SessionId stable créé
- [ ] IndexedDB accessible
- [ ] Tables détectées dans le DOM
- [ ] Sauvegarde réussie (X > 0)
- [ ] Modification + sauvegarde auto fonctionne
- [ ] Restauration fonctionne

---

## 🚨 Si Ça Ne Fonctionne Pas

### Vérification 1 : Service TypeScript

```javascript
console.log(window.flowiseTableService);
```

Si `undefined` :
- Attendre 5 secondes
- Recharger (F5)
- Vérifier que l'app React est démarrée

### Vérification 2 : Méthode saveTable

```javascript
console.log(typeof window.flowiseTableService?.saveTable);
```

Si `undefined` :
- Le service existe mais est incomplet
- Vérifier la compilation TypeScript

### Vérification 3 : IndexedDB

```javascript
indexedDB.databases().then(dbs => console.log(dbs));
```

Si `clara_db` n'est pas dans la liste :
- La base n'est pas créée
- Laisser l'app s'initialiser complètement

---

## 📞 Aide

**Lire** : `FIX_SAUVEGARDE_CELLULES.md` pour plus de détails

**Logs** : Copier tous les messages de la console pour analyse

---

*Test créé le 17 novembre 2025*
