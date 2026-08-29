/**
 * LocalStorage Cleanup Manager - Claraverse
 * Gère automatiquement le nettoyage du localStorage quand le quota est dépassé
 */

(function () {
    'use strict';

    const CleanupManager = {
        // Limite de taille recommandée (en bytes) - 80% de 5MB
        MAX_SIZE: 4 * 1024 * 1024, // 4 MB

        // Préfixes des clés à nettoyer en priorité
        CLEANUP_PRIORITIES: [
            'debug_',
            'temp_',
            'cache_',
            'old_',
            'backup_'
        ],

        /**
         * Calculer la taille totale du localStorage
         */
        getTotalSize() {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return total;
        },

        /**
         * Obtenir toutes les clés avec leur taille
         */
        getAllKeysWithSize() {
            const keys = [];
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const size = localStorage[key].length + key.length;
                    keys.push({ key, size });
                }
            }
            return keys.sort((a, b) => b.size - a.size); // Trier par taille décroissante
        },

        /**
         * Nettoyer les clés temporaires et de debug
         */
        cleanupTemporaryKeys() {
            let cleaned = 0;
            const keysToRemove = [];

            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    // Vérifier si la clé correspond aux priorités de nettoyage
                    const shouldClean = this.CLEANUP_PRIORITIES.some(prefix =>
                        key.startsWith(prefix)
                    );

                    if (shouldClean) {
                        keysToRemove.push(key);
                    }
                }
            }

            keysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                    cleaned++;
                } catch (e) {
                    console.error('Erreur suppression clé:', key, e);
                }
            });

            return cleaned;
        },

        /**
         * Nettoyer les anciennes données (plus de 30 jours)
         */
        cleanupOldData() {
            let cleaned = 0;
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    try {
                        const data = JSON.parse(localStorage[key]);

                        // Vérifier si les données ont un timestamp
                        if (data && data.timestamp) {
                            const dataTime = new Date(data.timestamp).getTime();
                            if (dataTime < thirtyDaysAgo) {
                                localStorage.removeItem(key);
                                cleaned++;
                            }
                        }
                    } catch (e) {
                        // Pas un JSON valide, ignorer
                    }
                }
            }

            return cleaned;
        },

        /**
         * Compresser les données Claraverse
         */
        compressData() {
            let compressed = 0;
            const clarverseKeys = [];

            // Trouver toutes les clés Claraverse
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) &&
                    (key.includes('claraverse') || key.includes('table'))) {
                    clarverseKeys.push(key);
                }
            }

            clarverseKeys.forEach(key => {
                try {
                    const data = JSON.parse(localStorage[key]);

                    // Supprimer les propriétés inutiles
                    if (data && typeof data === 'object') {
                        delete data.debug;
                        delete data.logs;
                        delete data._metadata;

                        // Sauvegarder la version compressée
                        localStorage.setItem(key, JSON.stringify(data));
                        compressed++;
                    }
                } catch (e) {
                    // Pas un JSON, ignorer
                }
            });

            return compressed;
        },

        /**
         * Nettoyage automatique intelligent
         */
        autoCleanup() {
            console.log('🧹 Démarrage du nettoyage automatique...');

            const sizeBefore = this.getTotalSize();
            console.log(`📊 Taille avant: ${(sizeBefore / 1024).toFixed(2)} KB`);

            // Étape 1: Nettoyer les clés temporaires
            const tempCleaned = this.cleanupTemporaryKeys();
            console.log(`✅ ${tempCleaned} clé(s) temporaire(s) supprimée(s)`);

            // Étape 2: Nettoyer les anciennes données
            const oldCleaned = this.cleanupOldData();
            console.log(`✅ ${oldCleaned} donnée(s) ancienne(s) supprimée(s)`);

            // Étape 3: Compresser les données
            const compressed = this.compressData();
            console.log(`✅ ${compressed} donnée(s) compressée(s)`);

            const sizeAfter = this.getTotalSize();
            const saved = sizeBefore - sizeAfter;
            console.log(`📊 Taille après: ${(sizeAfter / 1024).toFixed(2)} KB`);
            console.log(`💾 Espace libéré: ${(saved / 1024).toFixed(2)} KB`);

            return {
                sizeBefore,
                sizeAfter,
                saved,
                tempCleaned,
                oldCleaned,
                compressed
            };
        },

        /**
         * Vérifier et nettoyer si nécessaire
         */
        checkAndCleanup() {
            const currentSize = this.getTotalSize();

            if (currentSize > this.MAX_SIZE) {
                console.warn(`⚠️ Quota proche de la limite: ${(currentSize / 1024).toFixed(2)} KB`);
                return this.autoCleanup();
            }

            return null;
        },

        /**
         * Afficher un rapport détaillé
         */
        getReport() {
            const totalSize = this.getTotalSize();
            const keys = this.getAllKeysWithSize();
            const clarverseKeys = keys.filter(k =>
                k.key.includes('claraverse') || k.key.includes('table')
            );

            console.log('📊 === RAPPORT LOCALSTORAGE ===');
            console.log(`Taille totale: ${(totalSize / 1024).toFixed(2)} KB / ${(this.MAX_SIZE / 1024).toFixed(2)} KB`);
            console.log(`Utilisation: ${((totalSize / this.MAX_SIZE) * 100).toFixed(1)}%`);
            console.log(`Nombre de clés: ${keys.length}`);
            console.log(`Clés Claraverse: ${clarverseKeys.length}`);

            console.log('\n🔝 Top 10 des plus grosses clés:');
            keys.slice(0, 10).forEach((item, index) => {
                console.log(`${index + 1}. ${item.key}: ${(item.size / 1024).toFixed(2)} KB`);
            });

            if (clarverseKeys.length > 0) {
                const clarverseSize = clarverseKeys.reduce((sum, k) => sum + k.size, 0);
                console.log(`\n📦 Taille totale Claraverse: ${(clarverseSize / 1024).toFixed(2)} KB`);
            }

            return {
                totalSize,
                maxSize: this.MAX_SIZE,
                usage: (totalSize / this.MAX_SIZE) * 100,
                totalKeys: keys.length,
                clarverseKeys: clarverseKeys.length,
                topKeys: keys.slice(0, 10)
            };
        }
    };

    // Exposer globalement
    window.CleanupManager = CleanupManager;

    // Vérifier automatiquement au chargement
    setTimeout(() => {
        CleanupManager.checkAndCleanup();
    }, 2000);

    console.log('✅ LocalStorage Cleanup Manager chargé');
    console.log('💡 Commandes disponibles:');
    console.log('   - CleanupManager.getReport() : Afficher le rapport');
    console.log('   - CleanupManager.autoCleanup() : Nettoyer maintenant');
    console.log('   - CleanupManager.checkAndCleanup() : Vérifier et nettoyer si nécessaire');

})();
