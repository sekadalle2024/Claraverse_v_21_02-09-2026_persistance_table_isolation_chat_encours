/**
 * Diagnostic LocalStorage - Claraverse
 * Vérifie la disponibilité et l'état du stockage local
 */

(function () {
    'use strict';

    function diagnosticLocalStorage() {
        console.log('🔍 === DIAGNOSTIC LOCALSTORAGE ===');

        // Test 1: Disponibilité
        console.log('\n📋 Test 1: Disponibilité');
        if (typeof localStorage === 'undefined') {
            console.error('❌ localStorage n\'est pas défini');
            return;
        }
        console.log('✅ localStorage est défini');

        // Test 2: Accès en lecture
        console.log('\n📋 Test 2: Accès en lecture');
        try {
            const length = localStorage.length;
            console.log(`✅ Accès en lecture OK (${length} clés)`);
        } catch (error) {
            console.error('❌ Erreur d\'accès en lecture:', error.message);
            return;
        }

        // Test 3: Accès en écriture
        console.log('\n📋 Test 3: Accès en écriture');
        try {
            const testKey = 'diagnostic_test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            const value = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            if (value === 'test') {
                console.log('✅ Accès en écriture OK');
            } else {
                console.error('❌ Valeur incorrecte après écriture');
            }
        } catch (error) {
            console.error('❌ Erreur d\'accès en écriture:', error.message);

            if (error.name === 'QuotaExceededError') {
                console.error('💾 Quota de stockage dépassé');
            } else if (error.name === 'SecurityError') {
                console.error('🔒 Erreur de sécurité (navigation privée ou cookies désactivés)');
            }
            return;
        }

        // Test 4: Espace disponible
        console.log('\n📋 Test 4: Espace disponible');
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            console.log(`📊 Espace utilisé: ~${(totalSize / 1024).toFixed(2)} KB`);
            console.log(`📊 Nombre de clés: ${localStorage.length}`);
        } catch (error) {
            console.error('❌ Erreur de calcul d\'espace:', error.message);
        }

        // Test 5: Clés Claraverse
        console.log('\n📋 Test 5: Clés Claraverse');
        try {
            const clarverseKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('claraverse') || key.includes('table') || key.includes('conso'))) {
                    clarverseKeys.push(key);
                }
            }

            if (clarverseKeys.length > 0) {
                console.log(`✅ ${clarverseKeys.length} clé(s) Claraverse trouvée(s):`);
                clarverseKeys.forEach(key => {
                    const size = localStorage.getItem(key)?.length || 0;
                    console.log(`   - ${key}: ${(size / 1024).toFixed(2)} KB`);
                });
            } else {
                console.log('ℹ️ Aucune clé Claraverse trouvée');
            }
        } catch (error) {
            console.error('❌ Erreur de lecture des clés:', error.message);
        }

        // Test 6: Contexte d'exécution
        console.log('\n📋 Test 6: Contexte d\'exécution');
        console.log(`🌐 Protocol: ${window.location.protocol}`);
        console.log(`🌐 Host: ${window.location.host}`);
        console.log(`🔒 Secure context: ${window.isSecureContext}`);

        // Vérifier si en mode privé (approximatif)
        try {
            const test = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            if (!test) {
                console.warn('⚠️ Possible mode navigation privée détecté');
            }
        } catch (e) {
            console.warn('⚠️ Possible mode navigation privée détecté');
        }

        console.log('\n✅ === DIAGNOSTIC TERMINÉ ===\n');
    }

    // Exposer la fonction globalement
    window.diagnosticLocalStorage = diagnosticLocalStorage;

    // Exécuter automatiquement au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', diagnosticLocalStorage);
    } else {
        diagnosticLocalStorage();
    }

    console.log('💡 Utilisez diagnosticLocalStorage() pour relancer le diagnostic');

})();
