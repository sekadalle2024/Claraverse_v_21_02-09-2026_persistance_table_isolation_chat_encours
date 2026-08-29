/**
 * Gestionnaire de verrouillage pour la restauration automatique
 * Garantit qu'une seule restauration s'exécute au chargement
 */

(function () {
    'use strict';

    console.log('🔒 RESTORE LOCK MANAGER - Initialisation');

    // État global de restauration
    const restoreState = {
        isRestoring: false,
        hasRestored: false,
        restorePromise: null,
        timestamp: null,
        sessionId: null
    };

    // Configuration
    const LOCK_TIMEOUT = 30000; // 30 secondes max pour une restauration
    const COOLDOWN_PERIOD = 5000; // 5 secondes entre deux restaurations

    /**
     * Vérifie si une restauration peut être lancée
     */
    function canRestore() {
        // Si déjà restauré récemment
        if (restoreState.hasRestored && restoreState.timestamp) {
            const timeSinceRestore = Date.now() - restoreState.timestamp;
            if (timeSinceRestore < COOLDOWN_PERIOD) {
                console.log(`⏭️ Restauration récente (${timeSinceRestore}ms), skip`);
                return false;
            }
        }

        // Si restauration en cours
        if (restoreState.isRestoring) {
            console.log('⏳ Restauration déjà en cours, skip');
            return false;
        }

        return true;
    }

    /**
     * Acquiert le verrou de restauration
     */
    function acquireLock(sessionId) {
        if (!canRestore()) {
            return false;
        }

        restoreState.isRestoring = true;
        restoreState.sessionId = sessionId;
        console.log(`🔒 Verrou acquis pour session: ${sessionId}`);

        // Timeout de sécurité
        setTimeout(() => {
            if (restoreState.isRestoring) {
                console.warn('⚠️ Timeout restauration, libération forcée du verrou');
                releaseLock(false);
            }
        }, LOCK_TIMEOUT);

        return true;
    }

    /**
     * Libère le verrou de restauration
     */
    function releaseLock(success = true) {
        restoreState.isRestoring = false;

        if (success) {
            restoreState.hasRestored = true;
            restoreState.timestamp = Date.now();
            console.log('🔓 Verrou libéré - Restauration réussie');
        } else {
            console.log('🔓 Verrou libéré - Restauration échouée');
        }
    }

    /**
     * Réinitialise l'état (pour permettre une nouvelle restauration)
     */
    function reset() {
        restoreState.isRestoring = false;
        restoreState.hasRestored = false;
        restoreState.restorePromise = null;
        restoreState.timestamp = null;
        restoreState.sessionId = null;
        console.log('🔄 État de restauration réinitialisé');
    }

    /**
     * Exécute une restauration avec verrouillage
     */
    async function executeRestore(sessionId, restoreFunction) {
        // Vérifier si on peut restaurer
        if (!canRestore()) {
            // Si une restauration est en cours, attendre qu'elle se termine
            if (restoreState.restorePromise) {
                console.log('⏳ Attente de la restauration en cours...');
                return restoreState.restorePromise;
            }
            return false;
        }

        // Acquérir le verrou
        if (!acquireLock(sessionId)) {
            return false;
        }

        // Créer la promesse de restauration
        restoreState.restorePromise = (async () => {
            try {
                console.log(`🔄 Exécution restauration pour session: ${sessionId}`);

                // Exécuter la fonction de restauration
                await restoreFunction(sessionId);

                // Succès
                releaseLock(true);

                // Émettre événement de succès
                const event = new CustomEvent('claraverse:restore:complete', {
                    detail: {
                        sessionId,
                        timestamp: Date.now(),
                        source: 'restore-lock-manager'
                    }
                });
                document.dispatchEvent(event);

                console.log('✅ Restauration terminée avec succès');
                return true;

            } catch (error) {
                console.error('❌ Erreur restauration:', error);
                releaseLock(false);

                // Émettre événement d'erreur
                const event = new CustomEvent('claraverse:restore:error', {
                    detail: {
                        sessionId,
                        error: error.message,
                        timestamp: Date.now()
                    }
                });
                document.dispatchEvent(event);

                return false;
            } finally {
                restoreState.restorePromise = null;
            }
        })();

        return restoreState.restorePromise;
    }

    /**
     * Obtient l'état actuel
     */
    function getState() {
        return {
            ...restoreState,
            canRestore: canRestore()
        };
    }

    // Exposer l'API globale
    window.restoreLockManager = {
        canRestore,
        acquireLock,
        releaseLock,
        reset,
        executeRestore,
        getState
    };

    console.log('✅ Restore Lock Manager initialisé');
    console.log('💡 API: window.restoreLockManager');
})();
