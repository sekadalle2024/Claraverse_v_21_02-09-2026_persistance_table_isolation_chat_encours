# 🚨 ACTION IMMÉDIATE - Tables Disparaissent

## ⚡ Solution Rapide (2 minutes)

### Étape 1 : Désactiver la Restauration Auto

**Ouvrir** : `index.html`

**Chercher** (ligne ~28) :
```html
<!-- 2. Restauration unique au chargement -->
<script src="/single-restore-on-load.js"></script>
```

**Commenter** :
```html
<!-- 2. Restauration unique au chargement -->
<!-- <script src="/single-restore-on-load.js"></script> -->
```

### Étape 2 : Recharger

Appuyer sur **F5**

### Étape 3 : Vérifier

Les tables ne doivent plus disparaître !

---

## 🔍 Diagnostic (Si Besoin)

### Activer le Diagnostic

**Ajouter** dans `index.html` (avant la balise `</body>`) :

```html
<!-- Diagnostic tables disparues -->
<script src="/diagnostic-tables-disparues.js"></script>
```

**Recharger** (F5)

**Attendre** 15 secondes

**Consulter** la console pour le rapport

---

## 📊 Résultat Attendu

### Avant Fix

```
📊 [10:30:15] Tables: 3 → 3
📊 [10:30:16] Tables: 3 → 0 (-3)  ❌
⚠️ 3 table(s) disparue(s) !
```

### Après Fix

```
📊 [10:30:15] Tables: 3 → 3
✅ Aucun changement détecté
```

---

## 🚀 Solution Définitive (Plus Tard)

Une fois les tables stabilisées, consulter :
- `FIX_URGENT_TABLES_DISPARAISSENT.md` - Solution complète
- Option 3 : Ajouter un flag "Ne Pas Écraser"

---

## 📞 Support Urgent

### Commande Console (Alternative)

Si vous ne pouvez pas modifier `index.html`, exécuter dans la console (F12) :

```javascript
// Désactiver la restauration
if (window.restoreLockManager) {
    window.restoreLockManager.lock();
    console.log('🔒 Restauration verrouillée');
}

// Recharger la page
location.reload();
```

---

**Appliquez MAINTENANT pour arrêter la disparition !**

*Action créée le 21 novembre 2025*
