/**
 * Restauration unique au chargement de la page
 * Utilise le gestionnaire de verrouillage pour garantir une seule exécution
 */

(function () {
    'use strict';

    console.log('🔄 SINGLE RESTORE ON LOAD - Initialisation');

    /**
     * Fonction principale de restauration
     */
    async function performRestore() {
        try {
            // Attendre que le gestionnaire de verrouillage soit disponible
            let attempts = 0;
            while (!window.restoreLockManager && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (!window.restoreLockManager) {
                console.error('❌ Gestionnaire de verrouillage non disponible');
                return false;
            }

            // Vérifier si on peut restaurer
            if (!window.restoreLockManager.canRestore()) {
                console.log('⏭️ Restauration déjà effectuée ou en cours');
                return false;
            }

            // Obtenir la session stable
            const sessionId = sessionStorage.getItem('claraverse_stable_session');

            if (!sessionId) {
                console.log('ℹ️ Pas de session stable, pas de restauration');
                return false;
            }

            console.log(`📋 Session détectée: ${sessionId}`);

            // Fonction de restauration
            const restoreFunction = async (sessionId) => {
                // Attendre que le module soit disponible
                let moduleAttempts = 0;
                while (moduleAttempts < 50) {
                    try {
                        const module = await import('/src/services/flowiseTableBridge.ts');
                        const bridge = module.flowiseTableBridge;

                        if (bridge) {
                            console.log('✅ Bridge trouvé, restauration...');

                            // Forcer la session dans le bridge
                            try {
                                bridge.currentSessionId = sessionId;
                                console.log('🔧 Session forcée dans le bridge');
                            } catch (error) {
                                console.warn('⚠️ Impossible de forcer la session');
                            }

                            // Restaurer les tables
                            await bridge.restoreTablesForSession(sessionId);

                            console.log('✅ Tables restaurées avec succès');
                            return true;
                        }
                    } catch (error) {
                        // Module pas encore prêt
                    }

                    await new Promise(resolve => setTimeout(resolve, 100));
                    moduleAttempts++;
                }

                throw new Error('Timeout: Bridge non disponible');
            };

            // Exécuter la restauration avec verrouillage
            const result = await window.restoreLockManager.executeRestore(sessionId, restoreFunction);

            if (result) {
                console.log('%c✅ RESTAURATION UNIQUE TERMINÉE', 'background: #4caf50; color: white; font-size: 16px; font-weight: bold; padding: 8px;');
            }

            return result;

        } catch (error) {
            console.error('❌ Erreur restauration unique:', error);
            return false;
        }
    }

    /**
     * Initialisation au chargement
     */
    function initialize() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Délai pour laisser les autres scripts se charger
                setTimeout(performRestore, 1000);
            });
        } else {
            // DOM déjà prêt
            setTimeout(performRestore, 1000);
        }
    }

    // Exposer l'API
    window.singleRestoreOnLoad = {
        performRestore
    };

    // Démarrer l'initialisation
    initialize();

    console.log('✅ Single Restore On Load initialisé');
    console.log('💡 Test: window.singleRestoreOnLoad.performRestore()');
})();
