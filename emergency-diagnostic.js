/**
 * SCRIPT DE DIAGNOSTIC D'URGENCE CLARAVERSE
 * Détecte et résout immédiatement les blocages de performance
 * Exécution autonome - ne dépend d'aucun autre script
 */

(function() {
    'use strict';

    console.log("🚨 DIAGNOSTIC D'URGENCE CLARAVERSE DÉMARRÉ");
    console.log("=" .repeat(60));

    const startTime = Date.now();
    let issuesFound = 0;
    let criticalIssues = 0;

    // === PHASE 1: DIAGNOSTIC IMMÉDIAT ===
    console.log("🔍 PHASE 1: DIAGNOSTIC IMMÉDIAT");

    // 1.1 Détecter les intervals actifs
    console.log("\n📊 Détection des intervals actifs...");
    let intervalCount = 0;
    let suspiciousIntervals = [];

    // Scanner les intervals (approximatif)
    for (let i = 1; i < 10000; i++) {
        try {
            const originalClearInterval = window.clearInterval;
            let isActive = false;

            window.clearInterval = function(id) {
                if (id === i) isActive = true;
                return originalClearInterval.call(this, id);
            };

            clearInterval(i);
            window.clearInterval = originalClearInterval;

            if (!isActive) {
                intervalCount++;
                // Essayer d'identifier l'interval
                if (i % 1000 === 0 || intervalCount > 20) {
                    suspiciousIntervals.push(i);
                }
            }
        } catch (e) {}
    }

    console.log(`⚠️  ${intervalCount} intervals potentiellement actifs détectés`);
    if (intervalCount > 10) {
        criticalIssues++;
        console.log("🚨 CRITIQUE: Trop d'intervals actifs (>10)");
    }

    // 1.2 Vérifier la mémoire
    console.log("\n💾 Vérification mémoire...");
    let memoryIssue = false;

    if (performance.memory) {
        const usedMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const limitMB = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

        console.log(`📈 Mémoire: ${usedMB}MB / ${limitMB}MB`);

        if (usedMB > 150) {
            memoryIssue = true;
            criticalIssues++;
            console.log("🚨 CRITIQUE: Mémoire élevée (>150MB)");
        }
    }

    // 1.3 Vérifier le stockage localStorage
    console.log("\n💿 Vérification stockage localStorage...");
    let storageSize = 0;
    let claraverseKeys = 0;

    try {
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const value = localStorage.getItem(key);
                if (value) {
                    storageSize += key.length + value.length;
                    if (key.includes('claraverse')) {
                        claraverseKeys++;
                    }
                }
            }
        }

        const storageMB = (storageSize / 1024 / 1024).toFixed(2);
        console.log(`📦 localStorage: ${storageMB}MB utilisés`);
        console.log(`🔑 Clés ClaraVerse: ${claraverseKeys}`);

        if (storageMB > 5) {
            issuesFound++;
            console.log("⚠️  Stockage localStorage volumineux (>5MB)");
        }

        if (claraverseKeys > 100) {
            criticalIssues++;
            console.log("🚨 CRITIQUE: Trop de clés ClaraVerse (>100)");
        }

    } catch (e) {
        console.error("❌ Erreur vérification stockage:", e.message);
    }

    // 1.4 Détecter les MutationObservers
    console.log("\n👁️  Détection MutationObservers...");
    let observerEstimation = 0;

    // Vérifications indirectes
    const potentialObserverSources = [
        'contextualMenuManager',
        'claraverseSyncAPI',
        'syncCoordinator',
        'performanceOptimizer'
    ];

    potentialObserverSources.forEach(source => {
        if (window[source]) {
            observerEstimation++;
            console.log(`🔍 Source détectée: ${source}`);
        }
    });

    // Vérifier les éléments DOM avec des listeners
    const elementsWithListeners = document.querySelectorAll('[data-processed], [data-claraverse-id]');
    console.log(`📊 Éléments DOM traités: ${elementsWithListeners.length}`);

    if (elementsWithListeners.length > 50) {
        issuesFound++;
        console.log("⚠️  Beaucoup d'éléments DOM traités (>50)");
    }

    // === PHASE 2: DIAGNOSTIC APPROFONDI ===
    console.log("\n" + "=".repeat(60));
    console.log("🔍 PHASE 2: DIAGNOSTIC APPROFONDI");

    // 2.1 Tester la réactivité DOM
    console.log("\n⚡ Test réactivité DOM...");
    const domTestStart = performance.now();

    try {
        const testDiv = document.createElement('div');
        testDiv.innerHTML = 'Test';
        document.body.appendChild(testDiv);
        document.body.removeChild(testDiv);

        const domTestDuration = performance.now() - domTestStart;
        console.log(`📏 Opération DOM: ${domTestDuration.toFixed(2)}ms`);

        if (domTestDuration > 10) {
            criticalIssues++;
            console.log("🚨 CRITIQUE: DOM lent (>10ms pour opération simple)");
        }

    } catch (e) {
        criticalIssues++;
        console.log("🚨 CRITIQUE: Erreur opération DOM:", e.message);
    }

    // 2.2 Tester localStorage performance
    console.log("\n💾 Test performance localStorage...");
    const storageTestStart = performance.now();

    try {
        const testKey = 'claraverse_emergency_test';
        const testData = 'x'.repeat(1000); // 1KB test

        localStorage.setItem(testKey, testData);
        localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        const storageTestDuration = performance.now() - storageTestStart;
        console.log(`💿 Opération stockage: ${storageTestDuration.toFixed(2)}ms`);

        if (storageTestDuration > 50) {
            criticalIssues++;
            console.log("🚨 CRITIQUE: localStorage lent (>50ms)");
        }

    } catch (e) {
        criticalIssues++;
        console.log("🚨 CRITIQUE: Erreur localStorage:", e.message);
    }

    // 2.3 Analyser les événements en cours
    console.log("\n🎯 Analyse événements actifs...");

    // Compter les event listeners (approximatif)
    const allElements = document.querySelectorAll('*');
    let elementsWithEvents = 0;

    for (let element of allElements) {
        if (element.onclick || element.onmouseover || element.getAttribute('data-processed')) {
            elementsWithEvents++;
        }
    }

    console.log(`🎭 Éléments avec événements: ${elementsWithEvents}`);

    if (elementsWithEvents > 100) {
        issuesFound++;
        console.log("⚠️  Beaucoup d'event listeners (>100)");
    }

    // === PHASE 3: SOLUTIONS IMMÉDIATES ===
    console.log("\n" + "=".repeat(60));
    console.log("🛠️  PHASE 3: SOLUTIONS IMMÉDIATES");

    let solutionsApplied = 0;

    // 3.1 Nettoyage intervals si critique
    if (intervalCount > 15) {
        console.log("\n🧹 NETTOYAGE D'URGENCE: Intervals");

        let clearedCount = 0;
        for (let i = 1; i < 10000; i++) {
            try {
                clearInterval(i);
                clearedCount++;
            } catch (e) {}
        }

        console.log(`✅ ${clearedCount} intervals nettoyés`);
        solutionsApplied++;
    }

    // 3.2 Nettoyage localStorage si nécessaire
    if (claraverseKeys > 50) {
        console.log("\n🧹 NETTOYAGE: Stockage localStorage");

        let removedKeys = 0;
        const keysToRemove = [];

        for (let key in localStorage) {
            if (key.includes('claraverse') && !key.includes('config') && !key.includes('essential')) {
                // Garder seulement les clés essentielles
                const age = Date.now() - (parseInt(key.split('_').pop()) || 0);
                if (age > 86400000) { // Plus de 24h
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
                removedKeys++;
            } catch (e) {}
        });

        console.log(`✅ ${removedKeys} clés localStorage supprimées`);
        solutionsApplied++;
    }

    // 3.3 Optimisation DOM si nécessaire
    if (elementsWithListeners > 100) {
        console.log("\n🧹 OPTIMISATION: Éléments DOM");

        // Supprimer les attributs data-processed anciens
        let cleanedElements = 0;
        document.querySelectorAll('[data-processed]').forEach(el => {
            const processedTime = el.getAttribute('data-processed');
            if (processedTime && Date.now() - parseInt(processedTime) > 3600000) { // 1h
                el.removeAttribute('data-processed');
                cleanedElements++;
            }
        });

        console.log(`✅ ${cleanedElements} éléments DOM nettoyés`);
        solutionsApplied++;
    }

    // === PHASE 4: RAPPORT FINAL ===
    console.log("\n" + "=".repeat(60));
    console.log("📋 RAPPORT FINAL");
    console.log("=".repeat(60));

    const totalTime = Date.now() - startTime;

    console.log(`⏱️  Durée diagnostic: ${totalTime}ms`);
    console.log(`⚠️  Problèmes trouvés: ${issuesFound}`);
    console.log(`🚨 Problèmes critiques: ${criticalIssues}`);
    console.log(`🛠️  Solutions appliquées: ${solutionsApplied}`);

    // État général
    let overallStatus = 'GOOD';
    if (criticalIssues > 0) {
        overallStatus = 'CRITICAL';
    } else if (issuesFound > 2) {
        overallStatus = 'WARNING';
    }

    console.log(`🎯 ÉTAT GÉNÉRAL: ${overallStatus}`);

    // Recommandations
    console.log("\n💡 RECOMMANDATIONS:");

    if (criticalIssues > 0) {
        console.log("   🚨 CRITIQUE: Rechargement de la page recommandé (F5)");
        console.log("   🔧 Vérifier les scripts qui créent trop d'intervals");
        console.log("   💾 Considérer vider le cache navigateur");
    } else if (issuesFound > 0) {
        console.log("   ⚠️  Surveillance continue recommandée");
        console.log("   🧹 Nettoyage préventif effectué");
    } else {
        console.log("   ✅ Système en bon état");
        console.log("   📊 Monitoring préventif recommandé");
    }

    // Scripts à vérifier
    console.log("\n🔍 SCRIPTS À VÉRIFIER:");
    const scriptsToCheck = [
        'dev.js',
        'menu.js',
        'sync-coordinator.js',
        'performance-optimizer.js'
    ];

    scriptsToCheck.forEach(script => {
        const scriptName = script.replace('.js', '').replace('-', '');
        const isLoaded = window[`${scriptName}API`] || window[scriptName] || window[`${scriptName}Manager`];
        console.log(`   ${script}: ${isLoaded ? '✅ Chargé' : '❌ Non détecté'}`);
    });

    // === PHASE 5: SURVEILLANCE TEMPORAIRE ===
    if (overallStatus !== 'CRITICAL') {
        console.log("\n🔄 Activation surveillance temporaire (30 secondes)...");

        let monitoringCount = 0;
        const monitoringInterval = setInterval(() => {
            monitoringCount++;

            const currentMemory = performance.memory ?
                (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) : 'N/A';

            console.log(`📊 Monitor ${monitoringCount}/6: Mémoire=${currentMemory}MB`);

            if (monitoringCount >= 6) {
                clearInterval(monitoringInterval);
                console.log("✅ Surveillance temporaire terminée");
            }
        }, 5000);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🏁 DIAGNOSTIC D'URGENCE TERMINÉ");
    console.log("=".repeat(60));

    // Stocker les résultats pour référence
    window.CLARAVERSE_EMERGENCY_DIAGNOSTIC = {
        timestamp: new Date().toISOString(),
        duration: totalTime,
        status: overallStatus,
        issuesFound,
        criticalIssues,
        solutionsApplied,
        intervals: intervalCount,
        memoryMB: performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : null,
        storageKeys: claraverseKeys
    };

    // Fonction d'aide pour l'utilisateur
    window.emergencyFix = function() {
        console.log("🚨 RÉPARATION D'URGENCE EN COURS...");

        // Stopper tous les intervals
        for (let i = 1; i < 10000; i++) {
            try { clearInterval(i); } catch (e) {}
        }

        // Nettoyer localStorage ClaraVerse
        Object.keys(localStorage).forEach(key => {
            if (key.includes('claraverse')) {
                try { localStorage.removeItem(key); } catch (e) {}
            }
        });

        // Garbage collect si possible
        if (window.gc) {
            try { window.gc(); } catch (e) {}
        }

        console.log("✅ Réparation terminée - Rechargez la page (location.reload())");

        // Auto-reload après 3 secondes
        setTimeout(() => {
            console.log("🔄 Rechargement automatique...");
            location.reload();
        }, 3000);
    };

    if (overallStatus === 'CRITICAL') {
        console.log("\n🆘 Pour une réparation immédiate, tapez: window.emergencyFix()");
    }

})();
