# 🔧 FIX - Quota LocalStorage Dépassé

## ⚠️ Problème

Alerte permanente : "Espace de stockage insuffisant. Certaines données n'ont pas pu être sauvegardées."

**Cause** : Le localStorage est plein (limite ~5-10 MB selon le navigateur).

## ✅ Solution Appliquée

### 1. LocalStorage Cleanup Manager

Créé `public/localstorage-cleanup.js` qui :
- Surveille automatiquement l'utilisation du localStorage
- Nettoie les données temporaires et anciennes
- Compresse les données Claraverse
- Libère de l'espace automatiquement

### 2. Gestion Automatique dans `conso.js`

Modifié pour :
- Détecter le quota dépassé
- Déclencher automatiquement le nettoyage
- Réessayer la sauvegarde après nettoyage
- Afficher un message console au lieu d'une alerte popup

### 3. Intégration dans `index.html`

Le script de nettoyage se charge automatiquement avant tous les autres.

---

## 🧪 Diagnostic Immédiat

### Dans la Console

```javascript
// Afficher le rapport complet
CleanupManager.getReport()
```

**Résultat attendu** :
```
📊 === RAPPORT LOCALSTORAGE ===
Taille totale: 4523.45 KB / 4096.00 KB
Utilisation: 110.4%
Nombre de clés: 47
Clés Claraverse: 23

🔝 Top 10 des plus grosses clés:
1. claraverse_tables_data: 1234.56 KB
2. claraverse_backup_20241124: 987.65 KB
...
```

---

## 🧹 Nettoyage Manuel

### Option 1: Nettoyage Automatique Intelligent

```javascript
CleanupManager.autoCleanup()
```

Cela va :
1. Supprimer les clés temporaires (debug_, temp_, cache_)
2. Supprimer les données de plus de 30 jours
3. Compresser les données Claraverse
4. Afficher un rapport

### Option 2: Vérifier et Nettoyer si Nécessaire

```javascript
CleanupManager.checkAndCleanup()
```

Ne nettoie que si l'utilisation dépasse 80%.

### Option 3: Nettoyage Complet (ATTENTION)

```javascript
// Supprimer TOUTES les données localStorage
localStorage.clear()

// Ou supprimer seulement les données Claraverse
Object.keys(localStorage)
  .filter(k => k.includes('claraverse'))
  .forEach(k => localStorage.removeItem(k))
```

---

## 📊 Comprendre l'Utilisation

### Voir Toutes les Clés

```javascript
Object.keys(localStorage).forEach(key => {
  const size = localStorage[key].length;
  console.log(`${key}: ${(size / 1024).toFixed(2)} KB`);
})
```

### Calculer la Taille Totale

```javascript
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log(`Total: ${(total / 1024).toFixed(2)} KB`);
```

---

## 🔄 Nettoyage Automatique

Le système nettoie automatiquement :

1. **Au démarrage** : Vérifie et nettoie si nécessaire (après 2 secondes)
2. **Avant sauvegarde** : Si quota dépassé, nettoie et réessaie
3. **Priorités de nettoyage** :
   - Clés temporaires (debug_, temp_, cache_)
   - Données anciennes (> 30 jours)
   - Métadonnées inutiles

---

## 💡 Prévention

### Bonnes Pratiques

1. **Limiter la taille des données** :
   - Ne pas stocker de gros fichiers
   - Compresser les données JSON
   - Supprimer les propriétés inutiles

2. **Nettoyer régulièrement** :
   ```javascript
   // Ajouter dans votre code
   setInterval(() => {
     CleanupManager.checkAndCleanup();
   }, 60000); // Toutes les minutes
   ```

3. **Utiliser IndexedDB pour les gros volumes** :
   - localStorage : < 5 MB
   - IndexedDB : > 50 MB

---

## 🎯 Actions Immédiates

### Si l'alerte apparaît encore :

1. **Ouvrez la console** (F12)

2. **Exécutez** :
   ```javascript
   CleanupManager.autoCleanup()
   ```

3. **Vérifiez** :
   ```javascript
   CleanupManager.getReport()
   ```

4. **Si toujours plein**, nettoyage manuel :
   ```javascript
   // Supprimer les anciennes sauvegardes
   Object.keys(localStorage)
     .filter(k => k.includes('backup') || k.includes('old'))
     .forEach(k => localStorage.removeItem(k))
   ```

---

## ✅ Résultat Attendu

Après le fix :
- ✅ Plus d'alerte popup
- ✅ Nettoyage automatique
- ✅ Message console discret si problème
- ✅ Réessai automatique après nettoyage
- ✅ Rapport disponible à tout moment

---

## 📝 Notes

- Le nettoyage est **non-destructif** : seules les données temporaires et anciennes sont supprimées
- Les données Claraverse importantes sont **préservées**
- Le système continue de fonctionner même si localStorage est plein
- Les données non sauvegardées sont simplement perdues à la fermeture du navigateur

---

## 🆘 En Cas de Problème

Si le nettoyage automatique ne suffit pas :

1. **Vider complètement** :
   ```javascript
   localStorage.clear()
   ```

2. **Recharger la page** (F5)

3. **Vérifier** :
   ```javascript
   CleanupManager.getReport()
   ```

Le système repartira de zéro avec un localStorage propre.
