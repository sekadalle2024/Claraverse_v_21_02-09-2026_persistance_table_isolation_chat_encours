# 🔒 Guide : Vider le Cache SANS Perdre Vos Mots de Passe

## ✅ Rassurez-vous !

**VOS MOTS DE PASSE SONT EN SÉCURITÉ** 

Vider le cache du navigateur **ne supprime PAS** :
- ✅ Vos mots de passe enregistrés
- ✅ Vos favoris
- ✅ Votre historique de navigation
- ✅ Vos données de connexion

Le cache contient uniquement des **fichiers temporaires** (images, scripts, CSS).

---

## 🚀 Méthodes Simples (Choisissez-en Une)

### Méthode 1 : Rechargement Forcé ⭐ RECOMMANDÉ

**La plus simple et la plus sûre !**

#### Sur Windows/Linux :
```
Ctrl + F5
```
ou
```
Ctrl + Shift + R
```

#### Sur Mac :
```
Cmd + Shift + R
```

**C'est tout !** La page se recharge en ignorant le cache.

---

### Méthode 2 : Via le Menu du Navigateur

#### Chrome / Edge :

1. Appuyez sur **F12** (ouvre les outils de développement)
2. **Clic droit** sur le bouton de rechargement (⟳)
3. Sélectionnez **"Vider le cache et actualiser"**

#### Firefox :

1. Appuyez sur **F12**
2. **Clic droit** sur le bouton de rechargement
3. Sélectionnez **"Vider le cache et recharger"**

---

### Méthode 3 : Par Code (Console)

1. Appuyez sur **F12** (ouvre la console)
2. Collez ce code :

```javascript
// Recharger en ignorant le cache
window.location.reload(true);
```

3. Appuyez sur **Entrée**

---

### Méthode 4 : Ajouter un Paramètre à l'URL

Ajoutez `?nocache=1` à la fin de votre URL :

**Avant** :
```
http://localhost:3000/
```

**Après** :
```
http://localhost:3000/?nocache=1
```

Puis appuyez sur **Entrée**

---

## 🔍 Vérifier Que Ça a Fonctionné

Après le rechargement, dans la console (F12) :

```javascript
// Vérifier que les scripts de restauration ne sont pas chargés
const restoreScripts = Array.from(document.querySelectorAll('script'))
    .filter(s => s.src.includes('restore') || s.src.includes('auto-restore'));

console.log('Scripts restauration chargés:', restoreScripts.length);
// Doit afficher : 0

// Vérifier les tables
console.log('Tables présentes:', document.querySelectorAll('table').length);
```

---

## ❓ Questions Fréquentes

### Q1 : Mes mots de passe seront-ils supprimés ?

**Non !** Les mots de passe sont stockés séparément dans le gestionnaire de mots de passe du navigateur. Vider le cache ne les affecte pas.

### Q2 : Vais-je perdre mes données Claraverse ?

**Non !** Les données Claraverse sont dans IndexedDB, pas dans le cache. Elles restent intactes.

### Q3 : Dois-je me reconnecter ?

**Probablement pas.** Les cookies de session restent généralement actifs. Si vous devez vous reconnecter, vos mots de passe enregistrés seront toujours là.

### Q4 : Que contient le cache exactement ?

Le cache contient :
- Fichiers JavaScript (.js)
- Feuilles de style (.css)
- Images (.png, .jpg, etc.)
- Polices de caractères

**Rien d'important** qui ne puisse être retéléchargé.

### Q5 : Puis-je vider uniquement le cache de Claraverse ?

Oui ! Avec **Ctrl + F5**, seul le cache de la page actuelle est ignoré.

---

## 🎯 Pourquoi Vider le Cache ?

Dans votre cas, le navigateur a mis en cache les anciens fichiers JavaScript (`single-restore-on-load.js` et `auto-restore-chat-change.js`).

Même si nous les avons désactivés dans `index.html`, le navigateur utilise encore les versions en cache.

**Vider le cache** force le navigateur à :
1. Ignorer les anciens fichiers
2. Lire le nouveau `index.html`
3. Ne plus charger les scripts désactivés

---

## ✅ Checklist Après Rechargement

- [ ] Page rechargée avec Ctrl + F5
- [ ] Console ouverte (F12)
- [ ] Vérification : `0` scripts de restauration chargés
- [ ] Tables ne disparaissent plus
- [ ] Mots de passe toujours enregistrés ✅

---

## 🆘 Si Ça Ne Marche Toujours Pas

### Vérification 1 : Cache Vraiment Vidé ?

```javascript
// Dans la console
console.log('Timestamp:', Date.now());
// Notez le nombre, rechargez avec Ctrl+F5, revérifiez
// Le nombre doit être différent
```

### Vérification 2 : Bon Navigateur ?

Assurez-vous d'être sur le bon onglet/fenêtre de Claraverse.

### Vérification 3 : Mode Incognito (Test)

Ouvrez Claraverse en **mode navigation privée** :
- Chrome/Edge : **Ctrl + Shift + N**
- Firefox : **Ctrl + Shift + P**

En mode incognito, il n'y a pas de cache. Si ça marche, c'était bien un problème de cache.

---

## 💡 Astuce : Désactiver le Cache (Développement)

Pour éviter ce problème à l'avenir :

1. Ouvrez les outils de développement (**F12**)
2. Allez dans l'onglet **Network** (Réseau)
3. Cochez **"Disable cache"** (Désactiver le cache)
4. Gardez les outils ouverts

Le cache sera désactivé tant que les outils de développement sont ouverts.

---

## 🎉 Résumé

**Méthode la plus simple** :
```
Ctrl + F5 (Windows/Linux)
Cmd + Shift + R (Mac)
```

**Vos mots de passe** : ✅ En sécurité  
**Vos données Claraverse** : ✅ Intactes  
**Temps nécessaire** : ⏱️ 2 secondes

---

*Guide créé le 21 novembre 2025*
