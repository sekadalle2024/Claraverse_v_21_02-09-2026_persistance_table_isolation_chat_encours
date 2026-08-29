/**
 * Force la restauration des tables au chargement de la page
 * À inclure dans index.html AVANT menu.js et conso.js
 */

(function () {
    'use strict';

    console.log('%c🔄 SCRIPT DE RESTAURATION FORCÉE CHARGÉ', 'background: #007acc; color: white; font-size: 14px; padding: 5px;');

    let restorationComplete = false;
    let restorationPromise = null;

    // Fonction de restauration
    async function forceRestoreNow() {
        // Vérifier le gestionnaire de verrouillage
        if (window.restoreLockManager && !window.restoreLockManager.canRestore()) {
            console.log('🔒 Restauration bloquée par le gestionnaire de verrouillage');
            return false;
        }

        if (restorationComplete) {
            console.log('✅ Restauration déjà effectuée');
            return true;
        }

        if (restorationPromise) {
            console.log('⏳ Restauration en cours, attente...');
            return restorationPromise;
        }

        restorationPromise = (async () => {
            try {
                console.log('🔄 Démarrage restauration forcée...');

                // Obtenir la session stable
                const sessionId = sessionStorage.getItem('claraverse_stable_session');

                if (!sessionId) {
                    console.log('ℹ️ Pas de session stable, pas de restauration');
                    restorationComplete = true;
                    return false;
                }

                console.log(`📋 Session: ${sessionId}`);

                // Attendre que le module soit disponible
                let attempts = 0;
                while (attempts < 50) {
                    try {
                        const module = await import('/src/services/flowiseTableBridge.ts');
                        const bridge = module.flowiseTableBridge;

                        if (bridge) {
                            console.log('✅ Bridge trouvé, restauration...');

                            // IMPORTANT: Forcer le bridge à utiliser la session stable
                            try {
                                bridge.currentSessionId = sessionId;
                                console.log('🔧 Session forcée dans le bridge:', sessionId);
                            } catch (error) {
                                console.warn('⚠️ Impossible de forcer la session');
                            }

                            await bridge.restoreTablesForSession(sessionId);

                            restorationComplete = true;

                            // Émettre événement global
                            const event = new CustomEvent('claraverse:tables:restored', {
                                detail: { sessionId, timestamp: Date.now() }
                            });
                            document.dispatchEvent(event);
                            window.dispatchEvent(event);

                            console.log('%c✅ RESTAURATION TERMINÉE ET ÉVÉNEMENT ÉMIS', 'background: #4ec9b0; color: black; font-size: 14px; padding: 5px;');
                            return true;
                        }
                    } catch (error) {
                        // Module pas encore prêt
                    }

                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                console.warn('⚠️ Timeout restauration');
                return false;

            } catch (error) {
                console.error('❌ Erreur restauration:', error);
                return false;
            }
        })();

        return restorationPromise;
    }

    // Exposer l'API globale
    window.claraverseRestore = {
        forceRestore: forceRestoreNow,
        isComplete: () => restorationComplete,
        waitForRestore: () => {
            if (restorationComplete) {
                return Promise.resolve(true);
            }
            return new Promise((resolve) => {
                document.addEventListener('claraverse:tables:restored', () => resolve(true), { once: true });
                // Timeout après 10 secondes
                setTimeout(() => resolve(false), 10000);
            });
        }
    };

    // Démarrer la restauration dès que possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(forceRestoreNow, 200);
        });
    } else {
        setTimeout(forceRestoreNow, 200);
    }

    console.log('%c✅ API DE RESTAURATION EXPOSÉE: window.claraverseRestore', 'background: #4ec9b0; color: black; font-size: 14px; padding: 5px;');
})();
