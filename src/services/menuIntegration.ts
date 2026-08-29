/**
 * Intégration entre menu.js et le système de persistance TypeScript
 * Écoute les événements de menu.js et déclenche les sauvegardes appropriées
 */

import { flowiseTableService } from './flowiseTableService';
import { flowiseTableBridge } from './flowiseTableBridge';

class MenuIntegrationService {
  private initialized = false;
  private saveDebounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_DELAY = 300; // ms

  /**
   * Initialise l'intégration avec menu.js
   */
  public initialize(): void {
    if (this.initialized) {
      console.log('⚠️ MenuIntegration déjà initialisé');
      return;
    }

    console.log('🔗 Initialisation intégration menu.js');

    this.setupEventListeners();
    this.exposeAPIToWindow();
    this.initialized = true;

    console.log('✅ Intégration menu.js initialisée');
  }

  /**
   * Configure les écouteurs d'événements pour menu.js
   */
  private setupEventListeners(): void {
    // Écouter les demandes de sauvegarde de menu.js
    document.addEventListener('flowise:table:save:request', async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { table, sessionId, keyword, source } = customEvent.detail;

      console.log(`💾 Demande de sauvegarde depuis ${source}`);

      try {
        await this.saveTableFromMenu(table, sessionId, keyword);
        
        // Notifier le succès
        const successEvent = new CustomEvent('flowise:table:save:success', {
          detail: {
            sessionId,
            keyword,
            timestamp: Date.now()
          }
        });
        document.dispatchEvent(successEvent);
      } catch (error) {
        console.error('❌ Erreur sauvegarde depuis menu:', error);
        
        // Notifier l'erreur
        const errorEvent = new CustomEvent('flowise:table:save:error', {
          detail: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          }
        });
        document.dispatchEvent(errorEvent);
      }
    });

    // Écouter les demandes de restauration
    document.addEventListener('flowise:table:restore:request', async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { sessionId } = customEvent.detail;

      console.log(`🔄 Demande de restauration session ${sessionId}`);

      try {
        await flowiseTableBridge.restoreTablesForSession(sessionId);
      } catch (error) {
        console.error('❌ Erreur restauration depuis menu:', error);
      }
    });

    // Écouter les demandes de diagnostics
    document.addEventListener('flowise:diagnostics:request', async (event: Event) => {
      console.log('📊 Demande de diagnostics depuis menu');

      try {
        const diagnostics = await flowiseTableService.getDiagnostics();
        
        const responseEvent = new CustomEvent('flowise:diagnostics:response', {
          detail: diagnostics
        });
        document.dispatchEvent(responseEvent);
      } catch (error) {
        console.error('❌ Erreur diagnostics:', error);
      }
    });

    // Écouter les mises à jour de table
    document.addEventListener('flowise:table:updated', async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { table, source } = customEvent.detail;

      console.log(`🔔 Table mise à jour depuis ${source}`);

      // Sauvegarder automatiquement
      try {
        const sessionId = await this.getCurrentSessionId();
        const keyword = this.extractKeyword(table);
        await this.saveTableFromMenu(table, sessionId, keyword);
      } catch (error) {
        console.error('❌ Erreur sauvegarde auto:', error);
      }
    });

    // Écouter les changements de structure
    document.addEventListener('claraverse:table:structure:changed', async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { table, action, details } = customEvent.detail;

      console.log(`🔧 Structure modifiée: ${action}`, details);

      // Sauvegarder après modification de structure
      try {
        const sessionId = await this.getCurrentSessionId();
        const keyword = this.extractKeyword(table);
        await this.saveTableFromMenu(table, sessionId, keyword);
      } catch (error) {
        console.error('❌ Erreur sauvegarde structure:', error);
      }
    });
  }

  /**
   * Expose l'API au window pour menu.js
   */
  private exposeAPIToWindow(): void {
    // Exposer flowiseTableBridge
    (window as any).flowiseTableBridge = flowiseTableBridge;
    (window as any).flowiseTableService = flowiseTableService;

    console.log('✅ API exposée au window pour menu.js');
  }

  /**
   * Sauvegarde une table depuis menu.js (avec MISE À JOUR forcée et debounce)
   */
  private async saveTableFromMenu(
    tableElement: HTMLTableElement,
    sessionId: string,
    keyword: string
  ): Promise<void> {
    const debounceKey = `${sessionId}_${keyword}`;
    
    // Annuler le timer précédent s'il existe
    const existingTimer = this.saveDebounceTimers.get(debounceKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      console.log(`⏱️ Debounce: annulation sauvegarde précédente pour ${keyword}`);
    }
    
    // Créer un nouveau timer
    const timer = setTimeout(async () => {
      try {
        console.log(`💾 Sauvegarde table: session=${sessionId}, keyword=${keyword}`);
        
        // DEBUG: Vérifier ce qu'on reçoit
        console.log('🔍 DEBUG tableElement:', tableElement);
        console.log('🔍 DEBUG type:', typeof tableElement);
        console.log('🔍 DEBUG tagName:', tableElement?.tagName);
        console.log('🔍 DEBUG rows:', tableElement?.querySelectorAll?.('tr')?.length);
        console.log('🔍 DEBUG HTML length:', tableElement?.outerHTML?.length);

        // Déterminer la source (n8n ou flowise)
        const source = this.detectTableSource(tableElement);

        // IMPORTANT: Supprimer l'ancienne version avant de sauvegarder
        // Cela force une mise à jour au lieu d'un skip pour doublon
        try {
          const existingTables = await flowiseTableService.restoreSessionTables(sessionId);
          const matchingTable = existingTables.find(t => t.keyword === keyword);
          
          if (matchingTable) {
            console.log(`🔄 Mise à jour de la table existante: ${matchingTable.id}`);
            await flowiseTableService.deleteTable(matchingTable.id);
          }
        } catch (error) {
          console.warn('⚠️ Impossible de vérifier les doublons:', error);
        }

        // Sauvegarder la nouvelle version (forceUpdate = true pour bypasser la vérification de fingerprint)
        await flowiseTableService.saveGeneratedTable(
          sessionId,
          tableElement,
          keyword,
          source,
          undefined, // messageId
          true // forceUpdate
        );

        console.log('✅ Table sauvegardée avec succès');
        
        // Nettoyer le timer
        this.saveDebounceTimers.delete(debounceKey);
      } catch (error) {
        console.error('❌ Erreur sauvegarde table:', error);
        this.saveDebounceTimers.delete(debounceKey);
        throw error;
      }
    }, this.DEBOUNCE_DELAY);
    
    this.saveDebounceTimers.set(debounceKey, timer);
  }

  // Session stable en mémoire
  private stableSessionId: string | null = null;

  /**
   * Obtient l'ID de session actuel (STABLE)
   */
  private async getCurrentSessionId(): Promise<string> {
    // Si on a déjà une session stable, la réutiliser
    if (this.stableSessionId) {
      return this.stableSessionId;
    }

    try {
      // Essayer d'obtenir depuis flowiseTableBridge
      const sessionId = flowiseTableBridge.getCurrentSessionId();
      if (sessionId && sessionId !== 'unknown') {
        this.stableSessionId = sessionId;
        return this.stableSessionId;
      }
    } catch (error) {
      console.warn('⚠️ Impossible d\'obtenir session depuis bridge');
    }

    // Essayer sessionStorage
    try {
      const storedSession = sessionStorage.getItem('claraverse_stable_session');
      if (storedSession) {
        this.stableSessionId = storedSession;
        console.log('✅ Session stable récupérée:', this.stableSessionId);
        return this.stableSessionId;
      }
    } catch (error) {
      console.warn('⚠️ sessionStorage non accessible');
    }

    // Créer UNE SEULE session stable
    this.stableSessionId = `stable_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      sessionStorage.setItem('claraverse_stable_session', this.stableSessionId);
      console.log('✅ Session stable créée:', this.stableSessionId);
    } catch (error) {
      console.warn('⚠️ Impossible de sauvegarder session');
    }

    return this.stableSessionId;
  }

  /**
   * Extrait un keyword de la table
   */
  private extractKeyword(tableElement: HTMLTableElement): string {
    try {
      // Essayer le premier en-tête
      const firstHeader = tableElement.querySelector('th');
      if (firstHeader?.textContent) {
        return firstHeader.textContent.trim().substring(0, 50);
      }

      // Sinon, première cellule
      const firstCell = tableElement.querySelector('td');
      if (firstCell?.textContent) {
        return firstCell.textContent.trim().substring(0, 50);
      }

      return 'Table modifiée via menu';
    } catch (error) {
      return 'Table';
    }
  }

  /**
   * Détecte la source de la table
   */
  private detectTableSource(tableElement: HTMLTableElement): 'n8n' | 'flowise' {
    // Vérifier les attributs data
    const dataSource = tableElement.getAttribute('data-source');
    if (dataSource === 'n8n' || dataSource === 'flowise') {
      return dataSource;
    }

    // Vérifier les classes
    if (tableElement.classList.contains('n8n-table')) {
      return 'n8n';
    }
    if (tableElement.classList.contains('flowise-table')) {
      return 'flowise';
    }

    // Par défaut, considérer comme flowise
    return 'flowise';
  }
}

// Instance singleton
export const menuIntegrationService = new MenuIntegrationService();

// Auto-initialisation
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => menuIntegrationService.initialize(), 1000);
    });
  } else {
    setTimeout(() => menuIntegrationService.initialize(), 1000);
  }
}
