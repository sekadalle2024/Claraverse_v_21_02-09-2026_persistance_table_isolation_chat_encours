// 🔧 PATCH FLOWISE - DÉSACTIVER LE CACHE
// Ce script force l'envoi vers n8n sans utiliser le cache

(function () {
    console.log('🔧 Application du patch Flowise - Désactivation du cache');

    // Attendre que Flowise.js soit chargé
    const checkInterval = setInterval(() => {
        // Vérifier si la fonction queryN8nEndpoint existe
        if (window.FlowiseV17 || document.querySelector('[data-flowise-loaded]')) {
            clearInterval(checkInterval);
            applyPatch();
        }
    }, 100);

    setTimeout(() => {
        clearInterval(checkInterval);
        console.log('⚠️ Timeout - Flowise.js non détecté');
    }, 5000);

    function applyPatch() {
        console.log('✅ Flowise.js détecté, application du patch...');

        // Intercepter localStorage.getItem pour bloquer le cache
        const originalGetItem = localStorage.getItem.bind(localStorage);
        localStorage.getItem = function (key) {
            // Bloquer les clés de cache n8n
            if (key.startsWith('n8n_')) {
                console.log(`🚫 Cache bloqué pour: ${key}`);
                return null; // Forcer "pas de cache"
            }
            return originalGetItem(key);
        };

        // Intercepter localStorage.setItem pour éviter de saturer
        const originalSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = function (key, value) {
            // Ne pas sauvegarder les nouveaux caches n8n
            if (key.startsWith('n8n_')) {
                console.log(`🚫 Sauvegarde cache bloquée pour: ${key}`);
                return; // Ne pas sauvegarder
            }

            try {
                originalSetItem(key, value);
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.error('❌ Quota localStorage dépassé:', e);
                    console.log('💡 Exécutez: nettoyageUrgent()');
                }
            }
        };

        console.log('✅ Patch appliqué:');
        console.log('   - Cache n8n désactivé (lecture)');
        console.log('   - Sauvegarde cache n8n désactivée (écriture)');
        console.log('   - Tous les appels iront vers n8n');
    }

    // Fonction de nettoyage d'urgence
    window.nettoyageUrgent = function () {
        console.log('🧹 NETTOYAGE D\'URGENCE');

        let count = 0;
        let freed = 0;

        // Supprimer tous les caches n8n
        for (let key in localStorage) {
            if (key.startsWith('n8n_')) {
                const size = (localStorage[key].length * 2) / 1024;
                localStorage.removeItem(key);
                count++;
                freed += size;
            }
        }

        console.log(`✅ ${count} cache(s) n8n supprimé(s)`);
        console.log(`💾 ${freed.toFixed(2)} KB libérés`);

        // Analyser l'espace restant
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length * 2) / 1024;
            }
        }

        console.log(`📊 Utilisation actuelle: ${total.toFixed(2)} KB`);

        if (total > 4000) {
            console.log('⚠️ Toujours proche de la limite !');
            console.log('💡 Considérez: localStorage.clear() pour tout vider');
        } else {
            console.log('✅ Espace suffisant disponible');
        }
    };

    console.log('💡 Fonction disponible: nettoyageUrgent()');
})();
