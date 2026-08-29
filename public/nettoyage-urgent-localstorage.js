// 🧹 NETTOYAGE URGENT DU LOCALSTORAGE
// Ce script libère immédiatement de l'espace

(function () {
    console.log('🚨 NETTOYAGE URGENT DU LOCALSTORAGE');

    // Analyser l'utilisation actuelle
    function analyzeStorage() {
        let total = 0;
        const items = [];

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const size = (localStorage[key].length * 2) / 1024; // KB
                items.push({ key, size });
                total += size;
            }
        }

        items.sort((a, b) => b.size - a.size);

        console.log(`📊 Utilisation totale: ${total.toFixed(2)} KB`);
        console.log('📋 Top 10 des plus gros items:');
        items.slice(0, 10).forEach((item, i) => {
            console.log(`   ${i + 1}. ${item.key}: ${item.size.toFixed(2)} KB`);
        });

        return { total, items };
    }

    console.log('📊 AVANT NETTOYAGE:');
    const before = analyzeStorage();

    // Stratégie de nettoyage agressive
    let cleaned = 0;

    // 1. Supprimer tous les caches n8n (ils seront recréés au besoin)
    console.log('\n🗑️ Suppression des caches n8n...');
    for (let key in localStorage) {
        if (key.startsWith('n8n_')) {
            const size = (localStorage[key].length * 2) / 1024;
            localStorage.removeItem(key);
            cleaned++;
            console.log(`   ✅ Supprimé: ${key} (${size.toFixed(2)} KB)`);
        }
    }

    // 2. Supprimer les anciennes données de conso (plus de 7 jours)
    console.log('\n🗑️ Suppression des anciennes données conso...');
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    for (let key in localStorage) {
        if (key.startsWith('conso_') || key.startsWith('table_')) {
            try {
                const data = JSON.parse(localStorage[key]);
                if (data.timestamp && data.timestamp < sevenDaysAgo) {
                    const size = (localStorage[key].length * 2) / 1024;
                    localStorage.removeItem(key);
                    cleaned++;
                    console.log(`   ✅ Supprimé (ancien): ${key} (${size.toFixed(2)} KB)`);
                }
            } catch (e) {
                // Pas un JSON valide, on garde
            }
        }
    }

    // 3. Supprimer les données temporaires
    console.log('\n🗑️ Suppression des données temporaires...');
    const tempPrefixes = ['temp_', 'tmp_', 'cache_', 'debug_', 'test_'];
    for (let key in localStorage) {
        if (tempPrefixes.some(prefix => key.startsWith(prefix))) {
            const size = (localStorage[key].length * 2) / 1024;
            localStorage.removeItem(key);
            cleaned++;
            console.log(`   ✅ Supprimé (temp): ${key} (${size.toFixed(2)} KB)`);
        }
    }

    // 4. Compresser les grosses données restantes
    console.log('\n🗜️ Compression des données volumineuses...');
    let compressed = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const value = localStorage[key];
            const size = (value.length * 2) / 1024;

            // Si > 100 KB, essayer de compresser
            if (size > 100) {
                try {
                    const data = JSON.parse(value);
                    // Supprimer les propriétés non essentielles
                    if (data.html) {
                        // Garder seulement un résumé du HTML
                        data.html = data.html.substring(0, 1000) + '...[tronqué]';
                    }
                    if (data.content) {
                        data.content = data.content.substring(0, 1000) + '...[tronqué]';
                    }

                    const newValue = JSON.stringify(data);
                    const newSize = (newValue.length * 2) / 1024;

                    if (newSize < size * 0.8) { // Si on économise au moins 20%
                        localStorage.setItem(key, newValue);
                        compressed++;
                        console.log(`   ✅ Compressé: ${key} (${size.toFixed(2)} KB → ${newSize.toFixed(2)} KB)`);
                    }
                } catch (e) {
                    // Pas un JSON, on ne peut pas compresser
                }
            }
        }
    }

    console.log('\n📊 APRÈS NETTOYAGE:');
    const after = analyzeStorage();

    const freed = before.total - after.total;
    console.log(`\n✅ RÉSUMÉ:`);
    console.log(`   - Items supprimés: ${cleaned}`);
    console.log(`   - Items compressés: ${compressed}`);
    console.log(`   - Espace libéré: ${freed.toFixed(2)} KB`);
    console.log(`   - Utilisation: ${before.total.toFixed(2)} KB → ${after.total.toFixed(2)} KB`);

    if (after.total < 3000) {
        console.log(`\n🎉 SUCCÈS ! Vous avez maintenant ${(5000 - after.total).toFixed(2)} KB disponibles`);
    } else {
        console.log(`\n⚠️ ATTENTION ! Toujours proche de la limite. Considérez un nettoyage plus agressif.`);
    }

    // Fonction pour nettoyage manuel ciblé
    window.nettoyageManuel = function (pattern) {
        console.log(`🗑️ Nettoyage manuel des clés contenant: "${pattern}"`);
        let count = 0;
        for (let key in localStorage) {
            if (key.includes(pattern)) {
                localStorage.removeItem(key);
                count++;
                console.log(`   ✅ Supprimé: ${key}`);
            }
        }
        console.log(`✅ ${count} clé(s) supprimée(s)`);
        analyzeStorage();
    };

    // Fonction pour tout vider (DANGER!)
    window.viderTout = function () {
        if (confirm('⚠️ ATTENTION ! Cela va supprimer TOUTES les données. Continuer ?')) {
            localStorage.clear();
            console.log('🗑️ Tout le localStorage a été vidé');
            location.reload();
        }
    };

    console.log('\n💡 Fonctions disponibles:');
    console.log('   - nettoyageManuel("pattern") : Supprimer les clés contenant "pattern"');
    console.log('   - viderTout() : Vider complètement le localStorage (DANGER!)');
})();
