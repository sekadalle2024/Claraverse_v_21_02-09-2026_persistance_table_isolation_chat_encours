# 🚨 NETTOYAGE IMMÉDIAT - LocalStorage Plein

## ⚡ Action Rapide

Copiez-collez ce code dans la console (F12) :

```javascript
// NETTOYAGE IMMÉDIAT
(function() {
    console.log('🧹 Démarrage du nettoyage d\'urgence...');
    
    let cleaned = 0;
    let sizeBefore = 0;
    
    // Calculer la taille avant
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            sizeBefore += localStorage[key].length + key.length;
        }
    }
    
    console.log(`📊 Taille avant: ${(sizeBefore / 1024).toFixed(2)} KB`);
    
    // Supprimer les clés temporaires
    const tempKeys = ['debug_', 'temp_', 'cache_', 'test_', 'diagnostic_'];
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            if (tempKeys.some(prefix => key.startsWith(prefix))) {
                localStorage.removeItem(key);
                cleaned++;
            }
        }
    }
    
    // Supprimer les anciennes sauvegardes
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            if (key.includes('backup') || key.includes('old_')) {
                localStorage.removeItem(key);
                cleaned++;
            }
        }
    }
    
    // Calculer la taille après
    let sizeAfter = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            sizeAfter += localStorage[key].length + key.length;
        }
    }
    
    const saved = sizeBefore - sizeAfter;
    console.log(`📊 Taille après: ${(sizeAfter / 1024).toFixed(2)} KB`);
    console.log(`✅ ${cleaned} clé(s) supprimée(s)`);
    console.log(`💾 ${(saved / 1024).toFixed(2)} KB libérés`);
    console.log('✅ Nettoyage terminé !');
    
    // Recharger la page
    console.log('🔄 Rechargement de la page dans 2 secondes...');
    setTimeout(() => location.reload(), 2000);
})();
```

---

## 🔥 Si Toujours Plein - Nettoyage Complet

**ATTENTION** : Cela supprimera TOUTES les données sauvegardées !

```javascript
// NETTOYAGE COMPLET (ATTENTION)
localStorage.clear();
console.log('✅ LocalStorage vidé complètement');
location.reload();
```

---

## 📊 Vérifier l'Espace Disponible

```javascript
// Voir l'utilisation actuelle
let total = 0;
for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
    }
}
console.log(`Utilisation: ${(total / 1024).toFixed(2)} KB`);
console.log(`Nombre de clés: ${Object.keys(localStorage).length}`);
```

---

## 🎯 Après le Nettoyage

1. Rechargez la page (F5)
2. L'alerte ne devrait plus apparaître
3. Le système CleanupManager préviendra les futurs problèmes

---

## 💡 Commandes Utiles

```javascript
// Voir toutes les clés
Object.keys(localStorage)

// Voir les clés Claraverse
Object.keys(localStorage).filter(k => k.includes('claraverse'))

// Supprimer une clé spécifique
localStorage.removeItem('nom_de_la_cle')

// Voir le contenu d'une clé
localStorage.getItem('nom_de_la_cle')
```
