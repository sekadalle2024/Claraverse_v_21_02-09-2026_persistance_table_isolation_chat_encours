/**
 * Service de restauration automatique des tables au chargement
 * Restaure les tables de la session stable au démarrage de l'application
 */

import { flowiseTableBridge } from './flowiseTableBridge';

class AutoRestoreService {
  private initialized = false;
  private restoreAttempted = false;

  /**
   * Initialise la restauration automatique
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🔄 Initialisation restauration automatique');

    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Délai réduit pour restauration plus rapide
    await new Promise(resolve => setTimeout(resolve, 500));

    // Tenter la restauration
    await this.attemptRestore();

    this.initialized = true;
  }

  /**
   * Tente de restaurer les tables de la session stable
   */
  private async attemptRestore(): Promise<void> {
    // Vérifier le gestionnaire de verrouillage
    if ((window as any).restoreLockManager && !(window as any).restoreLockManager.canRestore()) {
      console.log('%c🔒 AUTO-RESTORE: Bloqué par le gestionnaire de verrouillage', 'background: #ff9800; color: black; padding: 3px;');
      return;
    }

    if (this.restoreAttempted) {
      console.log('%c⚠️ AUTO-RESTORE: Déjà tenté', 'background: #ff9800; color: black; padding: 3px;');
      return;
    }

    this.restoreAttempted = true;

    try {
      console.log('%c🔄 AUTO-RESTORE: Tentative de restauration...', 'background: #2196f3; color: white; font-size: 14px; padding: 5px;');

      // Obtenir la session stable depuis sessionStorage
      let sessionId: string | null = null;

      try {
        sessionId = sessionStorage.getItem('claraverse_stable_session');
      } catch (error) {
        console.warn('⚠️ sessionStorage non accessible');
      }

      if (!sessionId) {
        console.log('%cℹ️ AUTO-RESTORE: Aucune session stable trouvée', 'background: #9e9e9e; color: white; padding: 3px;');
        return;
      }

      console.log('%c📋 AUTO-RESTORE: Session trouvée: ' + sessionId, 'background: #4caf50; color: white; padding: 3px;');

      // IMPORTANT: Forcer le bridge à utiliser cette session
      try {
        (flowiseTableBridge as any).currentSessionId = sessionId;
        console.log('%c🔧 AUTO-RESTORE: Session forcée dans le bridge', 'background: #ff9800; color: black; padding: 3px;');
      } catch (error) {
        console.warn('⚠️ Impossible de forcer la session dans le bridge');
      }

      // Restaurer via le bridge
      await flowiseTableBridge.restoreTablesForSession(sessionId);

      console.log('%c✅ AUTO-RESTORE: RESTAURATION TERMINÉE!', 'background: #4caf50; color: white; font-size: 16px; font-weight: bold; padding: 8px;');

      // Émettre un événement
      const event = new CustomEvent('claraverse:auto:restore:complete', {
        detail: {
          sessionId,
          timestamp: Date.now()
        }
      });
      document.dispatchEvent(event);

    } catch (error) {
      console.error('❌ Erreur restauration automatique:', error);
    }
  }

  /**
   * Force une nouvelle tentative de restauration
   */
  public async forceRestore(): Promise<void> {
    this.restoreAttempted = false;
    await this.attemptRestore();
  }
}

// Instance singleton
export const autoRestoreService = new AutoRestoreService();

// Exposer globalement pour debug
if (typeof window !== 'undefined') {
  (window as any).autoRestoreService = autoRestoreService;
}

// Auto-initialisation UNIQUE avec gestionnaire de verrouillage
if (typeof window !== 'undefined') {
  console.log('%c🔄 AUTO-RESTORE: Initialisation unique...', 'background: #007acc; color: white; font-size: 14px; padding: 5px;');
  
  // Une seule tentative après un délai raisonnable
  setTimeout(() => {
    console.log('%c🔄 AUTO-RESTORE: Tentative unique (1.5s)', 'background: #007acc; color: white; padding: 3px;');
    autoRestoreService.initialize().catch(error => {
      console.error('❌ Erreur initialisation auto-restore:', error);
    });
  }, 1500);
}
