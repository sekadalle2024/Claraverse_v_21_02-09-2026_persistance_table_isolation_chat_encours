/**
 * FIX URGENT: Nettoyage LocalStorage Saturé (Notifications)
 * Vide les notifications qui saturent le localStorage
 */
(function () {
    'use strict';

    console.log('🧹 FIX URGENT: Nettoyage LocalStorage Notifications');

    try {
        // 1. Vider les notifications
        const notifKeys = [
            'clara-notifications',
            'notifications',
            'clara-notification-history'
        ];

        notifKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                const size = new Blob([value]).size;
                console.log(`📦 ${key}: ${(size / 1024).toFixed(2)} KB`);
                localStorage.removeItem(key);
                console.log(`✅ ${key} supprimé`);
            }
        });

        // 2. Afficher l'état du localStorage
        let totalSize = 0;
        let itemCount = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const value = localStorage.getItem(key);
                const size = new Blob([value]).size;
                totalSize += size;
                itemCount++;

                if (size > 100000) { // Plus de 100KB
                    console.warn(`⚠️ Item volumineux: ${key} = ${(size / 1024).toFixed(2)} KB`);
                }
            }
        }

        console.log(`\n📊 État du LocalStorage:`);
        console.log(`   Items: ${itemCount}`);
        console.log(`   Taille totale: ${(totalSize / 1024).toFixed(2)} KB`);
        console.log(`   Quota estimé: ~5-10 MB`);
        console.log(`   Utilisation: ${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1)}%`);

        // 3. Nettoyer les anciennes données de cache
        const cacheKeys = Object.keys(localStorage).filter(key =>
            key.includes('cache') ||
            key.includes('temp') ||
            key.includes('old')
        );

        if (cacheKeys.length > 0) {
            console.log(`\n🗑️ Nettoyage de ${cacheKeys.length} clés de cache...`);
            cacheKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log(`   ✅ ${key} supprimé`);
            });
        }

        console.log('\n✅ Nettoyage terminé!');
        console.log('🔄 Rechargez la page pour appliquer les changements');

    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
    }
})();
