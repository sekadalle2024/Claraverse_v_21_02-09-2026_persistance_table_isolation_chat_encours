# 🚨 Guide de Résolution des Problèmes de Performance ClaraVerse

## 📋 Diagnostic Rapide

Si l'application se plante ou affiche "application unresponsive", suivez ces étapes dans l'ordre :

### 🔍 1. Diagnostic Immédiat (Console F12)

```javascript
// Commande de diagnostic rapide
window.perfDiag.quick()

// Vérifier l'état du système
window.performanceOptimizer?.getStats()

// Forcer un rapport complet
window.perfDiag.report()
```

### 📊 2. Identifier la Cause

**Causes fréquentes :**
- Trop d'intervals actifs (> 8)
- MutationObservers en surcharge 
- Opérations DOM excessives
- Fuites mémoire
- Stockage localStorage saturé

## 🛠️ Commandes de Dépannage

### Commandes Console Essentielles

```javascript
// === DIAGNOSTIC ===
window.perfDiag.status()           // État actuel
window.perfDiag.quick()            // Diagnostic rapide
window.claraverseInitOptimizer?.getStatus() // État initialisation

// === PERFORMANCE OPTIMIZER ===
window.performanceOptimizer.getStats()      // Statistiques détaillées
window.performanceOptimizer.cleanup()       // Nettoyage d'urgence

// === INTERVALS & OBSERVERS ===
// Lister tous les intervals actifs
console.log("Intervals:", window.performanceOptimizer.intervals)

// Lister tous les observers actifs  
console.log("Observers:", window.performanceOptimizer.observers)

// === STOCKAGE ===
// Vérifier l'espace de stockage
navigator.storage.estimate().then(console.log)

// Nettoyer le localStorage ClaraVerse
Object.keys(localStorage).filter(k => k.startsWith('claraverse')).forEach(k => localStorage.removeItem(k))
```

### Commandes d'Urgence

```javascript
// 🚨 NETTOYAGE D'URGENCE COMPLET
function emergencyCleanup() {
    // Arrêter tous les intervals
    if (window.performanceOptimizer) {
        window.performanceOptimizer.cleanup();
    }
    
    // Nettoyer localStorage
    Object.keys(localStorage).filter(k => k.startsWith('claraverse')).forEach(k => {
        try { localStorage.removeItem(k); } catch(e) {}
    });
    
    // Forcer garbage collection si possible
    if (window.gc) window.gc();
    
    console.log("🧹 Nettoyage d'urgence terminé - rechargement recommandé");
}

// Exécuter le nettoyage
emergencyCleanup();
```

## 🔧 Solutions par Problème

### ❌ Problème : "Application Unresponsive"

**Cause :** Surcharge CPU due aux intervals trop fréquents

**Solution :**
```javascript
// 1. Identifier les intervals problématiques
window.performanceOptimizer.getStats()

// 2. Si > 10 intervals actifs
window.performanceOptimizer.emergencyOptimization()

// 3. Redémarrer l'application proprement
location.reload()
```

### ❌ Problème : Mémoire Élevée (> 100MB)

**Cause :** Fuites mémoire dans les données sauvegardées

**Solution :**
```javascript
// 1. Vérifier la mémoire
console.log("Mémoire:", (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2), "MB")

// 2. Nettoyer les données anciennes
if (window.storageManager) {
    window.storageManager.performEmergencyCleanup()
}

// 3. Si critique : nettoyage radical
localStorage.clear()
location.reload()
```

### ❌ Problème : Scans DOM Excessifs

**Cause :** MutationObservers qui se déclenchent trop souvent

**Solution :**
```javascript
// 1. Vérifier les observers
console.log("Observers actifs:", window.performanceOptimizer.observers.size)

// 2. Si > 8 observers, nettoyer
window.performanceOptimizer.observers.forEach((_, name) => {
    if (!name.includes('critical')) {
        window.performanceOptimizer.clearObserver(name)
    }
})

// 3. Redémarrer la détection optimisée
setTimeout(() => {
    if (window.claraverseSyncAPI) window.claraverseSyncAPI.performScan()
}, 2000)
```

## ⚡ Optimisations Préventives

### Configuration Recommandée

```javascript
// Dans la console, modifier les paramètres pour réduire la charge
window.CLARAVERSE_CONFIG.syncDelays = {
    cellSave: 2000,        // Augmenté de 1000 à 2000ms
    structureSave: 500,    // Augmenté de 200 à 500ms
    htmlBackup: 1000,      // Augmenté de 300 à 1000ms
    restoration: 3000      // Augmenté de 2000 à 3000ms
}
```

### Surveillance Continue

```javascript
// Activer le monitoring automatique
window.perfDiag.start()

// Programmer un nettoyage préventif toutes les 10 minutes
setInterval(() => {
    if (window.performanceOptimizer.getStats().performance.cpuUsage !== 'normal') {
        console.log("🧹 Nettoyage préventif automatique")
        window.performanceOptimizer.preventiveOptimization()
    }
}, 600000) // 10 minutes
```

## 📈 Monitoring en Temps Réel

### Tableau de Bord Performance

```javascript
// Afficher les métriques en temps réel
function showPerformanceDashboard() {
    const stats = window.performanceOptimizer?.getStats() || {};
    const memory = performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A';
    
    console.clear();
    console.log("🎯 CLARAVERSE - TABLEAU DE BORD PERFORMANCE");
    console.log("=" .repeat(50));
    console.log(`🔄 Intervals actifs: ${stats.intervals || 0}`);
    console.log(`👁️  Observers actifs: ${stats.observers || 0}`);
    console.log(`💾 Mémoire utilisée: ${memory} MB`);
    console.log(`⚡ Performance CPU: ${stats.performance?.cpuUsage || 'unknown'}`);
    console.log(`📱 Page visible: ${stats.isVisible ? '✅' : '❌'}`);
    console.log("=" .repeat(50));
}

// Lancer le dashboard (se met à jour toutes les 5 secondes)
const dashboardInterval = setInterval(showPerformanceDashboard, 5000);
showPerformanceDashboard(); // Affichage immédiat

// Arrêter avec : clearInterval(dashboardInterval)
```

## 🚑 Procédure d'Urgence

### Si l'Application est Complètement Bloquée

1. **Ouvrir les DevTools** (F12)
2. **Exécuter le script d'urgence :**

```javascript
// SCRIPT DE SURVIE - Copier/coller dans la console
(function() {
    console.log("🚨 MODE SURVIE CLARAVERSE");
    
    // Arrêter tous les intervals possibles
    for(let i = 1; i < 10000; i++) clearInterval(i);
    
    // Nettoyer le stockage
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('claraverse')) {
                localStorage.removeItem(key);
            }
        });
    } catch(e) {}
    
    // Message de confirmation
    console.log("✅ Nettoyage d'urgence terminé - Rechargez la page (F5)");
})();
```

3. **Recharger la page** (F5)

### Mode Safe (Développement)

Ajouter `?safe=1` à l'URL pour démarrer en mode sécurisé :
- Intervals réduits à 1 par script
- Observers avec throttling maximum
- Stockage en mode lecture seule

## 📋 Checklist de Maintenance

### Quotidienne
- [ ] Vérifier `window.perfDiag.status()`
- [ ] Surveiller la mémoire (< 80MB)
- [ ] S'assurer que < 6 intervals actifs

### Hebdomadaire  
- [ ] Générer rapport complet : `window.perfDiag.report()`
- [ ] Nettoyer localStorage ancien
- [ ] Vérifier logs console pour warnings

### Après Problème
- [ ] Diagnostic complet : `window.perfDiag.quick()`
- [ ] Sauvegarder les logs d'erreur
- [ ] Noter la configuration au moment de l'erreur
- [ ] Tester avec configuration optimisée

## 🔍 Debug Avancé

### Variables à Surveiller

```javascript
// État global du système
console.log("État système:", window.CLARAVERSE_STATE)

// Configuration active
console.log("Config:", window.CLARAVERSE_CONFIG)

// APIs disponibles
console.log("APIs:", {
    dev: !!window.claraverseSyncAPI,
    menu: !!window.contextualMenuManager,
    optimizer: !!window.performanceOptimizer,
    diagnostics: !!window.performanceDiagnostics
})
```

### Logs Utiles

```javascript
// Activer logs détaillés
window.CLARAVERSE_CONFIG.logging.level = "debug"

// Surveiller les événements système
document.addEventListener('claraverse:performance-optimizer-ready', () => console.log("✅ Optimizer ready"))
document.addEventListener('claraverse:initialization-complete', () => console.log("✅ Init complete"))
```

## 📞 Support

Si le problème persiste après toutes ces étapes :

1. Copier les résultats de `window.perfDiag.report()`
2. Noter la configuration : `console.log(JSON.stringify(window.CLARAVERSE_CONFIG, null, 2))`
3. Sauvegarder les logs console
4. Essayer en mode navigation privée

---

*Guide créé pour ClaraVerse Performance Optimizer v1.0*
*Dernière mise à jour : Décembre 2024*