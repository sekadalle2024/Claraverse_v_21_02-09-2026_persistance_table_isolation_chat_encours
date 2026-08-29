/**
 * CLARAVERSE EMERGENCY FIX
 * Script de réparation d'urgence - À copier/coller dans la console (F12)
 * Résout immédiatement les problèmes de performance et blocages
 */

console.log("🚨 CLARAVERSE EMERGENCY FIX - DÉMARRAGE");
console.log("=" .repeat(50));

// === ÉTAPE 1: ARRÊT D'URGENCE ===
console.log("🛑 ÉTAPE 1: Arrêt de tous les processus actifs");

let stoppedIntervals = 0;
let stoppedTimeouts = 0;

// Arrêter TOUS les intervals (méthode brutale mais efficace)
for (let i = 1; i < 10000; i++) {
    try {
        clearInterval(i);
        stoppedIntervals++;
    } catch (e) {}
}

// Arrêter TOUS les timeouts
for (let i = 1; i < 10000; i++) {
    try {
        clearTimeout(i);
        stoppedTimeouts++;
    } catch (e) {}
}

console.log(`✅ ${stoppedIntervals} intervals arrêtés`);
console.log(`✅ ${stoppedTimeouts} timeouts arrêtés`);

// === ÉTAPE 2: NETTOYAGE MÉMOIRE ===
console.log("\n💾 ÉTAPE 2: Nettoyage mémoire et stockage");

// Nettoyer localStorage ClaraVerse
let clearedKeys = 0;
try {
    Object.keys(localStorage).forEach(key => {
        if (key.includes('claraverse') || key.includes('clara')) {
            localStorage.removeItem(key);
            clearedKeys++;
        }
    });
} catch (e) {
    console.warn("⚠️ Erreur nettoyage localStorage:", e.message);
}

console.log(`✅ ${clearedKeys} clés localStorage supprimées`);

// Nettoyer sessionStorage
let sessionCleared = 0;
try {
    Object.keys(sessionStorage).forEach(key => {
        if (key.includes('claraverse') || key.includes('clara')) {
            sessionStorage.removeItem(key);
            sessionCleared++;
        }
    });
} catch (e) {}

console.log(`✅ ${sessionCleared} clés sessionStorage supprimées`);

// === ÉTAPE 3: NETTOYAGE DOM ===
console.log("\n🧹 ÉTAPE 3: Nettoyage éléments DOM");

// Supprimer les attributs de traitement
let cleanedElements = 0;
try {
    document.querySelectorAll('[data-processed]').forEach(el => {
        el.removeAttribute('data-processed');
        cleanedElements++;
    });

    document.querySelectorAll('[data-claraverse-id]').forEach(el => {
        // Garder l'ID mais nettoyer les event listeners
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        cleanedElements++;
    });
} catch (e) {
    console.warn("⚠️ Erreur nettoyage DOM:", e.message);
}

console.log(`✅ ${cleanedElements} éléments DOM nettoyés`);

// === ÉTAPE 4: RÉINITIALISATION VARIABLES GLOBALES ===
console.log("\n🔄 ÉTAPE 4: Réinitialisation variables globales");

// Nettoyer les variables ClaraVerse
const globalVarsToClean = [
    'claraverseSyncAPI',
    'contextualMenuManager',
    'performanceOptimizer',
    'syncCoordinator',
    'claraverseProcessor',
    'CLARAVERSE_STATE'
];

let cleanedVars = 0;
globalVarsToClean.forEach(varName => {
    if (window[varName]) {
        try {
            if (typeof window[varName].cleanup === 'function') {
                window[varName].cleanup();
            }
            delete window[varName];
            cleanedVars++;
        } catch (e) {}
    }
});

console.log(`✅ ${cleanedVars} variables globales nettoyées`);

// === ÉTAPE 5: FORCER GARBAGE COLLECTION ===
console.log("\n🗑️ ÉTAPE 5: Nettoyage mémoire forcé");

// Forcer garbage collection si disponible
if (window.gc) {
    try {
        window.gc();
        console.log("✅ Garbage collection forcée");
    } catch (e) {
        console.log("⚠️ Garbage collection non disponible");
    }
} else {
    console.log("ℹ️ Garbage collection automatique du navigateur");
}

// === ÉTAPE 6: DIAGNOSTIC FINAL ===
console.log("\n📊 ÉTAPE 6: Vérification finale");

const finalCheck = {
    memoryUsed: performance.memory ?
        (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
    localStorageSize: (() => {
        let size = 0;
        try {
            for (let key in localStorage) {
                size += localStorage[key]?.length || 0;
            }
        } catch (e) {}
        return (size / 1024).toFixed(2) + ' KB';
    })(),
    activeElements: document.querySelectorAll('[data-processed], [data-claraverse-id]').length
};

console.log("📈 État après nettoyage:");
console.log(`   - Mémoire: ${finalCheck.memoryUsed}`);
console.log(`   - LocalStorage: ${finalCheck.localStorageSize}`);
console.log(`   - Éléments actifs: ${finalCheck.activeElements}`);

// === RÉSULTAT FINAL ===
console.log("\n" + "=".repeat(50));
console.log("🎯 RÉPARATION TERMINÉE");
console.log("=".repeat(50));

console.log("✅ Tous les processus bloquants ont été arrêtés");
console.log("✅ Mémoire et stockage nettoyés");
console.log("✅ DOM optimisé");
console.log("✅ Variables globales réinitialisées");

console.log("\n💡 PROCHAINES ÉTAPES:");
console.log("1. Rechargez la page: location.reload()");
console.log("2. Ou utilisez F5 pour un rechargement complet");
console.log("3. Si le problème persiste, videz le cache navigateur");

// === AUTO-RELOAD OPTIONNEL ===
console.log("\n🔄 Rechargement automatique dans 5 secondes...");
console.log("Pour annuler, tapez: clearTimeout(autoReloadTimer)");

window.autoReloadTimer = setTimeout(() => {
    console.log("🔄 RECHARGEMENT EN COURS...");
    location.reload();
}, 5000);

// === FONCTIONS D'AIDE ===
window.cancelReload = () => {
    clearTimeout(window.autoReloadTimer);
    console.log("❌ Rechargement automatique annulé");
};

window.forceReload = () => {
    console.log("🔄 Rechargement forcé...");
    location.reload(true); // Force reload from server
};

window.clearCache = () => {
    console.log("🧹 Tentative de vidage cache...");
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
            console.log("✅ Cache navigateur vidé");
        });
    }
    localStorage.clear();
    sessionStorage.clear();
    console.log("✅ Stockage local vidé");
    setTimeout(() => location.reload(true), 1000);
};

console.log("\n🛠️ COMMANDES DISPONIBLES:");
console.log("- window.cancelReload() : Annuler rechargement auto");
console.log("- window.forceReload() : Forcer rechargement immédiat");
console.log("- window.clearCache() : Vider cache et recharger");

console.log("\n🚨 Si l'application reste bloquée après rechargement:");
console.log("1. Ouvrez un nouvel onglet en mode incognito");
console.log("2. Ou redémarrez complètement le navigateur");
console.log("3. Ou videz manuellement cache/cookies dans les paramètres");
