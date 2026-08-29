// ============================================
// MENU_STORAGE.JS - Gestion de la Persistance
// Sauvegarde et restauration automatique des tables HTML
// Version 2.0 - Système d'identification robuste
// ============================================

(function () {
  "use strict";

  // ============================================
  // INTERFACES ET TYPES
  // ============================================

  /**
   * Interface pour le contexte de session
   */
  class SessionContext {
    constructor(sessionId, detectionMethod) {
      this.sessionId = sessionId;
      this.detectionMethod = detectionMethod;
      this.isTemporary = sessionId.startsWith('temp_');
      this.startTime = Date.now();
      this.lastActivity = Date.now();
      this.url = window.location.href;
      this.userAgent = navigator.userAgent.substring(0, 100);
      this.isValid = true;
    }

    /**
     * Mise à jour de l'activité
     */
    updateActivity() {
      this.lastActivity = Date.now();
    }

    /**
     * Vérification si la session est expirée
     */
    isExpired(maxAge = 24 * 60 * 60 * 1000) { // 24h par défaut
      return Date.now() - this.lastActivity > maxAge;
    }

    /**
     * Sérialisation pour stockage
     */
    toJSON() {
      return {
        sessionId: this.sessionId,
        detectionMethod: this.detectionMethod,
        isTemporary: this.isTemporary,
        startTime: this.startTime,
        lastActivity: this.lastActivity,
        url: this.url,
        userAgent: this.userAgent,
        isValid: this.isValid
      };
    }

    /**
     * Désérialisation depuis stockage
     */
    static fromJSON(data) {
      const context = new SessionContext(data.sessionId, data.detectionMethod);
      context.isTemporary = data.isTemporary;
      context.startTime = data.startTime;
      context.lastActivity = data.lastActivity;
      context.url = data.url;
      context.userAgent = data.userAgent;
      context.isValid = data.isValid;
      return context;
    }
  }

  // ============================================
  // CONTEXT MANAGER - Détection de Session
  // ============================================

  class ClaraverseContextManager {
    constructor() {
      this.currentSessionId = null;
      this.sessionDetectionMethods = [
        'detectFromReactState',
        'detectFromURL',
        'detectFromDOM',
        'detectFromLocalStorage',
        'generateTemporary'
      ];
      this.sessionContext = null;
    }

    /**
     * Détection automatique du contexte de session avec fallback
     */
    detectCurrentSession() {
      // Vérifier d'abord si on a déjà une session valide en cache
      if (this.currentSessionId && this.sessionContext && this.sessionContext.isValid) {
        console.log(`🔍 Session en cache utilisée: ${this.currentSessionId.substring(0, 20)}...`);
        return this.currentSessionId;
      }

      for (const method of this.sessionDetectionMethods) {
        try {
          const sessionId = this[method]();
          if (sessionId && sessionId.trim() !== '' && sessionId !== 'undefined' && sessionId !== 'null') {
            this.currentSessionId = sessionId;
            this.updateSessionContext(sessionId, method);
            console.log(`✅ Session détectée via ${method}: ${sessionId.substring(0, 20)}...`);
            return sessionId;
          }
        } catch (error) {
          console.warn(`⚠️ Méthode ${method} échouée:`, error.message);
        }
      }

      // Si toutes les méthodes échouent, créer une session de fallback
      console.warn('⚠️ Toutes les méthodes de détection ont échoué, création session fallback');
      const fallbackSessionId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      this.currentSessionId = fallbackSessionId;
      this.updateSessionContext(fallbackSessionId, 'fallback');
      return fallbackSessionId;
    }

    /**
     * Détection depuis l'état React global
     */
    detectFromReactState() {
      // Vérifier window.claraverseState (état global React)
      if (window.claraverseState?.currentSession?.id) {
        return window.claraverseState.currentSession.id;
      }

      // Vérifier d'autres variables globales possibles
      if (window.currentClaraSession?.id) {
        return window.currentClaraSession.id;
      }

      // Vérifier dans le DOM React
      const reactRoot = document.querySelector('[data-clara-container]');
      if (reactRoot && reactRoot._reactInternalFiber) {
        // Tentative d'accès aux props React (méthode avancée)
        try {
          const fiber = reactRoot._reactInternalFiber || reactRoot._reactInternalInstance;
          if (fiber && fiber.child && fiber.child.memoizedProps) {
            const sessionId = this.extractSessionFromReactProps(fiber.child.memoizedProps);
            if (sessionId) return sessionId;
          }
        } catch (error) {
          // Silencieux - méthode expérimentale
        }
      }

      return null;
    }

    /**
     * Extraction d'ID de session depuis les props React
     */
    extractSessionFromReactProps(props) {
      if (props.sessionId) return props.sessionId;
      if (props.currentSession?.id) return props.currentSession.id;
      if (props.session?.id) return props.session.id;

      // Recherche récursive dans les props enfants
      for (const key in props) {
        if (typeof props[key] === 'object' && props[key] !== null) {
          if (props[key].id && key.toLowerCase().includes('session')) {
            return props[key].id;
          }
        }
      }

      return null;
    }

    /**
     * Détection depuis l'URL
     */
    detectFromURL() {
      const urlParams = new URLSearchParams(window.location.search);

      // Paramètres URL possibles
      const sessionParams = ['sessionId', 'session', 'chatId', 'chat', 'conversationId'];

      for (const param of sessionParams) {
        const value = urlParams.get(param);
        if (value) return value;
      }

      // Extraction depuis le hash
      const hash = window.location.hash;
      if (hash) {
        const hashMatch = hash.match(/session[=:]([^&]+)/i);
        if (hashMatch) return hashMatch[1];
      }

      // Extraction depuis le pathname
      const pathMatch = window.location.pathname.match(/\/session\/([^\/]+)/i);
      if (pathMatch) return pathMatch[1];

      return null;
    }

    /**
     * Détection depuis le DOM
     */
    detectFromDOM() {
      // Recherche d'attributs data-session-id
      const sessionElement = document.querySelector('[data-session-id]');
      if (sessionElement) {
        return sessionElement.getAttribute('data-session-id');
      }

      // Recherche dans les conteneurs de chat
      const chatContainers = document.querySelectorAll('[data-clara-container], .clara-chat, [class*="chat"]');
      for (const container of chatContainers) {
        const sessionId = container.getAttribute('data-session') ||
          container.getAttribute('data-chat-id') ||
          container.getAttribute('data-conversation-id');
        if (sessionId) return sessionId;
      }

      // Recherche dans les métadonnées
      const metaSession = document.querySelector('meta[name="session-id"]');
      if (metaSession) {
        return metaSession.getAttribute('content');
      }

      return null;
    }

    /**
     * Détection depuis localStorage (session persistante)
     */
    detectFromLocalStorage() {
      // Vérifier s'il y a une session active stockée
      const activeSession = localStorage.getItem('claraverse_active_session');
      if (activeSession) {
        try {
          const sessionData = JSON.parse(activeSession);
          if (sessionData.id && sessionData.lastActivity) {
            // Vérifier si la session n'est pas trop ancienne (24h)
            const maxAge = 24 * 60 * 60 * 1000; // 24 heures
            if (Date.now() - sessionData.lastActivity < maxAge) {
              return sessionData.id;
            }
          }
        } catch (error) {
          console.warn('⚠️ Session localStorage corrompue:', error);
        }
      }

      return null;
    }

    /**
     * Génération d'une session temporaire
     */
    generateTemporary() {
      const timestamp = Date.now();
      const urlHash = this.simpleHash(window.location.href);
      const randomSuffix = Math.random().toString(36).substring(2, 8);

      const tempSessionId = `temp_${timestamp}_${urlHash}_${randomSuffix}`;

      // Stocker la session temporaire
      this.storeTemporarySession(tempSessionId);

      return tempSessionId;
    }

    /**
     * Stockage d'une session temporaire
     */
    storeTemporarySession(sessionId) {
      try {
        const sessionData = {
          id: sessionId,
          isTemporary: true,
          startTime: Date.now(),
          lastActivity: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent.substring(0, 100)
        };

        localStorage.setItem('claraverse_active_session', JSON.stringify(sessionData));
        console.log(`💾 Session temporaire stockée: ${sessionId}`);
      } catch (error) {
        console.warn('⚠️ Impossible de stocker la session temporaire:', error);
      }
    }

    /**
     * Mise à jour du contexte de session
     */
    updateSessionContext(sessionId, detectionMethod) {
      this.sessionContext = new SessionContext(sessionId, detectionMethod);

      // Mettre à jour l'activité de la session
      this.updateSessionActivity();

      // Émettre un événement de changement de session
      this.emitSessionChangeEvent();
    }

    /**
     * Mise à jour de l'activité de session
     */
    updateSessionActivity() {
      if (this.sessionContext) {
        this.sessionContext.updateActivity();

        // Mettre à jour dans localStorage si ce n'est pas temporaire
        if (!this.sessionContext.isTemporary) {
          try {
            localStorage.setItem('claraverse_active_session', JSON.stringify(this.sessionContext.toJSON()));
          } catch (error) {
            console.warn('⚠️ Impossible de mettre à jour l\'activité de session:', error);
          }
        }
      }
    }

    /**
     * Émission d'un événement de changement de session
     */
    emitSessionChangeEvent() {
      const event = new CustomEvent('claraverse:session:changed', {
        detail: {
          sessionId: this.currentSessionId,
          context: this.sessionContext,
          timestamp: Date.now()
        },
        bubbles: true
      });
      document.dispatchEvent(event);
      console.log(`📡 Événement session changée émis: ${this.currentSessionId}`);
    }

    /**
     * Surveillance des changements de session
     */
    startSessionMonitoring() {
      // Surveillance des changements d'URL
      let lastUrl = window.location.href;
      const checkUrlChange = () => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          console.log('🔄 Changement d\'URL détecté, re-détection de session...');
          this.refreshSession();
        }
      };

      // Vérification périodique
      setInterval(checkUrlChange, 2000);

      // Écoute des événements de navigation
      window.addEventListener('popstate', () => {
        setTimeout(() => this.refreshSession(), 100);
      });

      // Écoute des événements personnalisés
      document.addEventListener('claraverse:session:refresh', () => {
        this.refreshSession();
      });

      console.log('👁️ Surveillance de session activée');
    }

    /**
     * Validation du contexte de session
     */
    validateSessionContext() {
      if (!this.sessionContext) return false;

      // Vérifier si la session n'est pas expirée
      if (this.sessionContext.isExpired()) {
        console.warn('⚠️ Session expirée détectée');
        this.sessionContext.isValid = false;
        return false;
      }

      // Vérifier si l'URL a changé significativement
      if (this.sessionContext.url !== window.location.href) {
        const currentDomain = new URL(window.location.href).origin;
        const sessionDomain = new URL(this.sessionContext.url).origin;

        if (currentDomain !== sessionDomain) {
          console.warn('⚠️ Changement de domaine détecté');
          this.sessionContext.isValid = false;
          return false;
        }
      }

      return true;
    }

    /**
     * Hash simple pour génération d'ID
     */
    simpleHash(str) {
      let hash = 0;
      if (!str || str.length === 0) return hash;
      for (let i = 0; i < Math.min(str.length, 100); i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return Math.abs(hash);
    }

    /**
     * Obtenir le contexte de session actuel
     */
    getCurrentSessionContext() {
      return this.sessionContext;
    }

    /**
     * Forcer la détection d'une nouvelle session
     */
    refreshSession() {
      this.currentSessionId = null;
      this.sessionContext = null;
      return this.detectCurrentSession();
    }

    /**
     * Détection avancée depuis l'état React avec retry
     */
    detectFromReactStateAdvanced() {
      // Méthode avec retry pour les applications React qui se chargent de manière asynchrone
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 5;
        const retryDelay = 200;

        const tryDetection = () => {
          const sessionId = this.detectFromReactState();
          if (sessionId) {
            resolve(sessionId);
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(tryDetection, retryDelay);
          } else {
            resolve(null);
          }
        };

        tryDetection();
      });
    }

    /**
     * Validation d'un ID de session
     */
    validateSessionId(sessionId) {
      if (!sessionId || typeof sessionId !== 'string') return false;
      if (sessionId.length < 3 || sessionId.length > 200) return false;

      // Vérifier les caractères valides
      const validPattern = /^[a-zA-Z0-9_-]+$/;
      return validPattern.test(sessionId);
    }

    /**
     * Nettoyage des sessions expirées
     */
    cleanupExpiredSessions() {
      try {
        const activeSession = localStorage.getItem('claraverse_active_session');
        if (activeSession) {
          const sessionData = JSON.parse(activeSession);
          const maxAge = 24 * 60 * 60 * 1000; // 24 heures

          if (Date.now() - sessionData.lastActivity > maxAge) {
            localStorage.removeItem('claraverse_active_session');
            console.log('🧹 Session expirée nettoyée');
          }
        }
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage sessions expirées:', error);
      }
    }
  }

  // ============================================
  // CONTAINER MANAGER - Identification des conteneurs DIV
  // ============================================

  class TableContainerManager {
    constructor() {
      this.containerMap = new Map();
      this.containerSelectors = [
        'div.prose.prose-base.dark\\:prose-invert.max-w-none',
        'div.glassmorphic',
        'div.prose',
        '[data-table-container]',
        '[class*="chat"]',
        '[class*="message"]',
        '.markdown-body'
      ];
      this.containerIdCounter = 0;
      this.changeMonitorInterval = null;

      // Démarrer la surveillance des changements après un délai
      setTimeout(() => {
        this.startContainerChangeMonitoring();
      }, 2000);
    }

    /**
     * Obtenir ou créer un ID de conteneur pour une table
     */
    getOrCreateContainerId(table) {
      if (!table || !table.closest) {
        console.warn('⚠️ Table invalide pour identification de conteneur');
        return 'no-container';
      }

      const container = this.findTableContainer(table);
      if (!container) {
        console.warn('⚠️ Aucun conteneur trouvé pour la table');
        return 'no-container';
      }

      // Vérifier si le conteneur a déjà un ID
      let containerId = container.getAttribute('data-container-id');

      if (!containerId) {
        containerId = this.generateContainerId(container);
        container.setAttribute('data-container-id', containerId);
        console.log(`✅ Nouveau conteneur ID généré: ${containerId}`);
      }

      // Mettre à jour le mapping avec analyse de contenu
      const contentHash = this.hashContainerContent(container);
      this.containerMap.set(containerId, {
        element: container,
        id: containerId,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        lastAnalyzed: Date.now(),
        tableCount: container.querySelectorAll('table').length,
        contentHash: contentHash,
        changeHistory: []
      });

      return containerId;
    }

    /**
     * Trouver le conteneur parent d'une table
     */
    findTableContainer(table) {
      // Essayer chaque sélecteur dans l'ordre de priorité
      for (const selector of this.containerSelectors) {
        try {
          const container = table.closest(selector);
          if (container) {
            console.log(`📦 Conteneur trouvé avec sélecteur: ${selector}`);
            return container;
          }
        } catch (error) {
          console.warn(`⚠️ Erreur avec sélecteur ${selector}:`, error.message);
        }
      }

      // Fallback: chercher le parent le plus proche avec des tables multiples
      let parent = table.parentElement;
      while (parent && parent !== document.body) {
        const tablesInParent = parent.querySelectorAll('table');
        if (tablesInParent.length > 0) {
          console.log(`📦 Conteneur fallback trouvé: ${parent.tagName}.${parent.className}`);
          return parent;
        }
        parent = parent.parentElement;
      }

      console.warn('⚠️ Aucun conteneur approprié trouvé');
      return null;
    }

    /**
     * Générer un ID unique pour un conteneur
     */
    generateContainerId(container) {
      if (!container) {
        return `container_error_${Date.now()}`;
      }

      // 1. Position du conteneur dans la page
      const allContainers = document.querySelectorAll(this.containerSelectors.join(','));
      const position = Array.from(allContainers).indexOf(container);

      // 2. Hash du contenu du conteneur
      const contentHash = this.hashContainerContent(container);

      // 3. Timestamp pour l'unicité
      const timestamp = Date.now();

      // 4. Compteur interne pour éviter les collisions
      this.containerIdCounter++;

      // 5. Assemblage de l'ID final
      const containerId = `container_${position >= 0 ? position : 'unknown'}_${contentHash}_${timestamp}_${this.containerIdCounter}`;

      console.log(`🔧 ID conteneur généré: ${containerId}`);
      return containerId;
    }

    /**
     * Calculer un hash du contenu du conteneur pour identification stable
     */
    hashContainerContent(container) {
      try {
        // Collecter les en-têtes de toutes les tables dans le conteneur
        const tables = container.querySelectorAll('table');
        const headers = Array.from(tables).map(table => {
          const firstRow = table.querySelector('tr');
          return firstRow ? firstRow.textContent.slice(0, 50).trim() : '';
        }).filter(header => header.length > 0);

        // Ajouter des informations sur la structure du conteneur
        const structureInfo = {
          tagName: container.tagName,
          className: container.className.slice(0, 50),
          tableCount: tables.length,
          childCount: container.children.length
        };

        // Analyser le contenu textuel pour une signature plus robuste
        const textContent = this.extractContainerTextSignature(container);

        // Créer une signature unique
        const signature = `${headers.join('|')}_${structureInfo.tagName}_${structureInfo.tableCount}x${structureInfo.childCount}_${textContent}`;

        // Calculer le hash
        const hash = this.simpleHash(signature);
        console.log(`🔍 Hash conteneur calculé: ${hash} (signature: ${signature.slice(0, 100)}...)`);

        return hash;
      } catch (error) {
        console.error('❌ Erreur calcul hash conteneur:', error);
        return this.simpleHash(`fallback_${Date.now()}`);
      }
    }

    /**
     * Extraire une signature textuelle du conteneur pour identification
     */
    extractContainerTextSignature(container) {
      try {
        // Collecter le texte des premiers éléments significatifs
        const significantElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span');
        const textParts = [];

        for (let i = 0; i < Math.min(significantElements.length, 5); i++) {
          const element = significantElements[i];
          const text = element.textContent.trim();
          if (text.length > 0 && text.length < 200) {
            textParts.push(text.slice(0, 30));
          }
        }

        return textParts.join('_').slice(0, 100);
      } catch (error) {
        console.warn('⚠️ Erreur extraction signature textuelle:', error);
        return 'no_text_signature';
      }
    }

    /**
     * Analyser les changements de contenu dans un conteneur
     */
    analyzeContainerChanges(containerId) {
      const containerInfo = this.containerMap.get(containerId);
      if (!containerInfo || !containerInfo.element) {
        return null;
      }

      const container = containerInfo.element;
      const currentHash = this.hashContainerContent(container);
      const currentTableCount = container.querySelectorAll('table').length;

      // Comparer avec l'état précédent
      const changes = {
        containerId: containerId,
        timestamp: Date.now(),
        hashChanged: containerInfo.contentHash !== currentHash,
        tableCountChanged: containerInfo.tableCount !== currentTableCount,
        previousHash: containerInfo.contentHash,
        currentHash: currentHash,
        previousTableCount: containerInfo.tableCount,
        currentTableCount: currentTableCount
      };

      // Mettre à jour les informations du conteneur
      containerInfo.contentHash = currentHash;
      containerInfo.tableCount = currentTableCount;
      containerInfo.lastAnalyzed = Date.now();

      if (changes.hashChanged || changes.tableCountChanged) {
        console.log(`🔄 Changements détectés dans conteneur ${containerId}:`, changes);
        this.emitContainerChangeEvent(changes);
      }

      return changes;
    }

    /**
     * Émettre un événement de changement de conteneur
     */
    emitContainerChangeEvent(changes) {
      const event = new CustomEvent('claraverse:container:changed', {
        detail: changes,
        bubbles: true
      });
      document.dispatchEvent(event);
    }

    /**
     * Surveiller les changements dans tous les conteneurs actifs
     */
    startContainerChangeMonitoring() {
      if (this.changeMonitorInterval) {
        clearInterval(this.changeMonitorInterval);
      }

      this.changeMonitorInterval = setInterval(() => {
        const containerIds = Array.from(this.containerMap.keys());
        containerIds.forEach(containerId => {
          this.analyzeContainerChanges(containerId);
        });
      }, 5000); // Vérification toutes les 5 secondes

      console.log('👁️ Surveillance des changements de conteneur activée');
    }

    /**
     * Arrêter la surveillance des changements
     */
    stopContainerChangeMonitoring() {
      if (this.changeMonitorInterval) {
        clearInterval(this.changeMonitorInterval);
        this.changeMonitorInterval = null;
        console.log('⏹️ Surveillance des changements de conteneur arrêtée');
      }
    }

    /**
     * Hash simple pour génération d'ID
     */
    simpleHash(str) {
      let hash = 0;
      if (!str || str.length === 0) return hash;
      for (let i = 0; i < Math.min(str.length, 100); i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return Math.abs(hash);
    }

    /**
     * Obtenir les informations d'un conteneur
     */
    getContainerInfo(containerId) {
      return this.containerMap.get(containerId);
    }

    /**
     * Lister tous les conteneurs actifs
     */
    getAllContainers() {
      return Array.from(this.containerMap.values());
    }

    /**
     * Nettoyer les conteneurs qui ne sont plus dans le DOM
     */
    cleanupStaleContainers() {
      const staleContainers = [];

      for (const [containerId, containerInfo] of this.containerMap.entries()) {
        if (!document.contains(containerInfo.element)) {
          staleContainers.push(containerId);
        }
      }

      staleContainers.forEach(containerId => {
        this.containerMap.delete(containerId);
        console.log(`🧹 Conteneur obsolète supprimé: ${containerId}`);
      });

      return staleContainers.length;
    }

    /**
     * Mettre à jour l'accès à un conteneur
     */
    updateContainerAccess(containerId) {
      const containerInfo = this.containerMap.get(containerId);
      if (containerInfo) {
        containerInfo.lastAccessed = Date.now();
        containerInfo.tableCount = containerInfo.element.querySelectorAll('table').length;
      }
    }

    /**
     * Obtenir les statistiques des conteneurs
     */
    getContainerStats() {
      const containers = this.getAllContainers();
      const totalTables = containers.reduce((sum, container) => sum + container.tableCount, 0);
      const containersWithChanges = containers.filter(c => c.changeHistory && c.changeHistory.length > 0).length;

      return {
        containerCount: containers.length,
        totalTables: totalTables,
        averageTablesPerContainer: containers.length > 0 ? (totalTables / containers.length).toFixed(2) : 0,
        oldestContainer: containers.length > 0 ? Math.min(...containers.map(c => c.createdAt)) : null,
        newestContainer: containers.length > 0 ? Math.max(...containers.map(c => c.createdAt)) : null,
        containersWithChanges: containersWithChanges,
        monitoringActive: this.changeMonitorInterval !== null
      };
    }

    /**
     * Nettoyer les ressources du gestionnaire de conteneurs
     */
    cleanup() {
      this.stopContainerChangeMonitoring();
      this.containerMap.clear();
      console.log('🧹 Container Manager nettoyé');
    }
  }

  // ============================================
  // DATA MIGRATION MANAGER - Migration des données legacy
  // ============================================

  /**
   * Erreur spécifique pour les migrations
   */
  class MigrationError extends Error {
    constructor(message, oldKey, details) {
      super(message);
      this.name = 'MigrationError';
      this.oldKey = oldKey;
      this.details = details;
    }
  }

  class DataMigrationManager {
    constructor() {
      this.migrationVersion = '2.0';
      this.oldPrefix = 'claraverse_table_';
      this.migrationStats = {
        totalFound: 0,
        migrated: 0,
        errors: 0,
        skipped: 0,
        startTime: null,
        endTime: null
      };
      this.recoveryData = new Map();
    }

    /**
     * Migration automatique de toutes les données existantes
     */
    async migrateAllExistingData() {
      console.log('🔄 Début migration des données de table...');

      this.migrationStats.startTime = Date.now();
      this.migrationStats.totalFound = 0;
      this.migrationStats.migrated = 0;
      this.migrationStats.errors = 0;
      this.migrationStats.skipped = 0;

      const oldKeys = this.findOldFormatKeys();
      this.migrationStats.totalFound = oldKeys.length;

      if (oldKeys.length === 0) {
        console.log('✅ Aucune donnée legacy trouvée, migration non nécessaire');
        this.migrationStats.endTime = Date.now();
        return this.migrationStats;
      }

      console.log(`📊 ${oldKeys.length} entrée(s) legacy détectée(s)`);

      for (const oldKey of oldKeys) {
        try {
          const success = await this.migrateSingleTableWithRecovery(oldKey);
          if (success) {
            this.migrationStats.migrated++;
          } else {
            this.migrationStats.skipped++;
          }
        } catch (error) {
          console.error(`❌ Erreur migration ${oldKey}:`, error);
          this.migrationStats.errors++;
        }
      }

      this.migrationStats.endTime = Date.now();
      const duration = this.migrationStats.endTime - this.migrationStats.startTime;

      console.log(`✅ Migration terminée en ${duration}ms:`);
      console.log(`  - ${this.migrationStats.migrated} migrées`);
      console.log(`  - ${this.migrationStats.errors} erreurs`);
      console.log(`  - ${this.migrationStats.skipped} ignorées`);

      return this.migrationStats;
    }

    /**
     * Trouver toutes les clés au format legacy
     */
    findOldFormatKeys() {
      const oldKeys = [];

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.oldPrefix) && !this.isNewFormat(key)) {
            oldKeys.push(key);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la recherche des clés legacy:', error);
      }

      return oldKeys;
    }

    /**
     * Vérifier si une clé est au nouveau format
     */
    isNewFormat(key) {
      if (!key || !key.startsWith(this.oldPrefix)) {
        return false;
      }

      // Nouveau format: claraverse_table_sessionId_containerId_position_hash
      // Minimum 6 parties: claraverse + table + sessionId + containerId + position + hash
      const parts = key.split('_');

      // Vérifier le nombre de parties
      if (parts.length < 6) {
        return false;
      }

      // Vérifier la structure de base
      if (parts[0] !== 'claraverse' || parts[1] !== 'table') {
        return false;
      }

      // Vérifier que les parties ne sont pas vides
      for (let i = 2; i < Math.min(parts.length, 6); i++) {
        if (!parts[i] || parts[i].trim() === '') {
          return false;
        }
      }

      // Vérifier si c'est une clé de récupération
      if (key.includes('recovery_') || key.includes('migrated_legacy')) {
        return true; // Considérer comme nouveau format pour éviter la re-migration
      }

      return true;
    }

    /**
     * Migrer une seule table
     */
    async migrateSingleTable(oldKey) {
      try {
        console.log(`🔄 Migration de: ${oldKey}`);

        const oldData = localStorage.getItem(oldKey);
        if (!oldData) {
          console.warn(`⚠️ Données introuvables pour: ${oldKey}`);
          return false;
        }

        let parsedData;
        try {
          parsedData = JSON.parse(oldData);
        } catch (parseError) {
          console.error(`❌ Données corrompues pour ${oldKey}:`, parseError);
          return false;
        }

        // Générer un nouvel ID pour les données legacy
        const genericSessionId = 'migrated_legacy';
        const genericContainerId = 'legacy_container';
        const timestamp = parsedData.timestamp || Date.now();
        const contentHash = this.generateLegacyContentHash(parsedData);

        const newKey = `claraverse_table_${genericSessionId}_${genericContainerId}_0_${contentHash}_${timestamp}`;

        // Vérifier si la nouvelle clé existe déjà
        if (localStorage.getItem(newKey)) {
          console.warn(`⚠️ Clé de destination existe déjà: ${newKey}`);
          return false;
        }

        // Créer les nouvelles données avec le format robuste
        const newData = {
          id: newKey,
          html: parsedData.html || parsedData.outerHTML || '',
          timestamp: timestamp,
          sessionId: genericSessionId,
          containerId: genericContainerId,
          metadata: {
            rowCount: parsedData.rowCount || 0,
            colCount: parsedData.colCount || 0,
            version: this.migrationVersion,
            migratedFrom: oldKey,
            migrationDate: Date.now(),
            originalVersion: parsedData.version || '1.0'
          },
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100),
            sessionStartTime: Date.now()
          }
        };

        // Sauvegarder avec le nouveau format
        localStorage.setItem(newKey, JSON.stringify(newData));

        // Vérifier que la sauvegarde a réussi
        const verifyData = localStorage.getItem(newKey);
        if (!verifyData) {
          throw new Error('Échec de la sauvegarde des nouvelles données');
        }

        // Supprimer l'ancienne entrée seulement après confirmation
        localStorage.removeItem(oldKey);

        console.log(`✅ Migration réussie: ${oldKey} → ${newKey}`);
        return true;

      } catch (error) {
        console.error(`❌ Erreur migration ${oldKey}:`, error);
        throw new MigrationError(`Migration échouée pour ${oldKey}`, oldKey, {
          originalError: error,
          timestamp: Date.now()
        });
      }
    }

    /**
     * Migrer une table avec mécanisme de récupération
     */
    async migrateSingleTableWithRecovery(oldKey) {
      try {
        return await this.migrateSingleTable(oldKey);
      } catch (error) {
        console.warn(`⚠️ Erreur migration ${oldKey}, tentative de récupération...`);

        try {
          // Sauvegarder les données dans un format de récupération
          const rawData = localStorage.getItem(oldKey);
          if (rawData) {
            const recoveryKey = `recovery_${oldKey}_${Date.now()}`;
            localStorage.setItem(recoveryKey, rawData);

            // Stocker les informations de récupération
            this.recoveryData.set(oldKey, {
              recoveryKey: recoveryKey,
              originalKey: oldKey,
              timestamp: Date.now(),
              error: error.message,
              rawDataSize: rawData.length
            });

            console.log(`💾 Données sauvegardées en récupération: ${recoveryKey}`);
          }

          return false;
        } catch (recoveryError) {
          console.error(`❌ Échec de la récupération pour ${oldKey}:`, recoveryError);
          throw new MigrationError('Migration et récupération échouées', oldKey, {
            originalError: error,
            recoveryError: recoveryError,
            timestamp: Date.now()
          });
        }
      }
    }

    /**
     * Générer un hash de contenu pour les données legacy
     */
    generateLegacyContentHash(data) {
      try {
        let content = '';

        if (data.html) {
          // Extraire le contenu textuel des premières lignes
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data.html;
          const firstRow = tempDiv.querySelector('tr');
          content = firstRow ? firstRow.textContent.slice(0, 100) : '';
        }

        // Ajouter les métadonnées si disponibles
        const metadata = `${data.rowCount || 0}x${data.colCount || 0}`;
        const signature = `${content}_${metadata}_legacy`;

        return this.simpleHash(signature);
      } catch (error) {
        console.warn('⚠️ Erreur génération hash legacy:', error);
        return this.simpleHash(`legacy_fallback_${Date.now()}`);
      }
    }

    /**
     * Hash simple pour génération d'ID
     */
    simpleHash(str) {
      let hash = 0;
      if (!str || str.length === 0) return hash;
      for (let i = 0; i < Math.min(str.length, 100); i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return Math.abs(hash);
    }

    /**
     * Obtenir les statistiques de migration
     */
    getMigrationStats() {
      return {
        ...this.migrationStats,
        recoveryCount: this.recoveryData.size,
        hasRecoveryData: this.recoveryData.size > 0
      };
    }

    /**
     * Obtenir les données de récupération
     */
    getRecoveryData() {
      return Array.from(this.recoveryData.entries()).map(([key, data]) => ({
        originalKey: key,
        ...data
      }));
    }

    /**
     * Nettoyer les données de récupération anciennes
     */
    cleanupRecoveryData(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 jours par défaut
      const now = Date.now();
      let cleanedCount = 0;

      try {
        // Nettoyer les données de récupération en mémoire
        for (const [key, data] of this.recoveryData.entries()) {
          if (now - data.timestamp > maxAge) {
            // Supprimer de localStorage
            if (data.recoveryKey) {
              localStorage.removeItem(data.recoveryKey);
            }
            // Supprimer de la map
            this.recoveryData.delete(key);
            cleanedCount++;
          }
        }

        // Nettoyer les clés de récupération orphelines dans localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('recovery_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (data && data.timestamp && (now - data.timestamp > maxAge)) {
                localStorage.removeItem(key);
                cleanedCount++;
              }
            } catch (error) {
              // Supprimer les données de récupération corrompues
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        }

        if (cleanedCount > 0) {
          console.log(`🧹 ${cleanedCount} donnée(s) de récupération nettoyée(s)`);
        }

        return cleanedCount;
      } catch (error) {
        console.error('❌ Erreur nettoyage données de récupération:', error);
        return 0;
      }
    }

    /**
     * Valider l'intégrité des données migrées
     */
    validateMigratedData() {
      const results = {
        totalChecked: 0,
        validData: 0,
        invalidData: 0,
        missingData: 0,
        errors: []
      };

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.oldPrefix) && this.isNewFormat(key)) {
            results.totalChecked++;

            try {
              const data = localStorage.getItem(key);
              if (!data) {
                results.missingData++;
                continue;
              }

              const parsedData = JSON.parse(data);

              // Vérifications de base
              const hasRequiredFields = parsedData.id && parsedData.html &&
                parsedData.sessionId && parsedData.containerId;

              if (hasRequiredFields && parsedData.metadata && parsedData.metadata.version === this.migrationVersion) {
                results.validData++;
              } else {
                results.invalidData++;
                results.errors.push(`Données invalides: ${key}`);
              }

            } catch (parseError) {
              results.invalidData++;
              results.errors.push(`Erreur parsing: ${key} - ${parseError.message}`);
            }
          }
        }

        console.log(`🔍 Validation migration: ${results.validData}/${results.totalChecked} données valides`);

        if (results.errors.length > 0) {
          console.warn(`⚠️ ${results.errors.length} erreur(s) détectée(s):`, results.errors.slice(0, 5));
        }

        return results;
      } catch (error) {
        console.error('❌ Erreur validation données migrées:', error);
        results.errors.push(`Erreur validation: ${error.message}`);
        return results;
      }
    }

    /**
     * Restaurer des données depuis la récupération
     */
    restoreFromRecovery(originalKey) {
      try {
        const recoveryInfo = this.recoveryData.get(originalKey);
        if (!recoveryInfo) {
          console.warn(`⚠️ Aucune donnée de récupération pour: ${originalKey}`);
          return false;
        }

        const recoveryData = localStorage.getItem(recoveryInfo.recoveryKey);
        if (!recoveryData) {
          console.warn(`⚠️ Données de récupération introuvables: ${recoveryInfo.recoveryKey}`);
          return false;
        }

        // Restaurer les données originales
        localStorage.setItem(originalKey, recoveryData);

        // Supprimer les données de récupération
        localStorage.removeItem(recoveryInfo.recoveryKey);
        this.recoveryData.delete(originalKey);

        console.log(`✅ Données restaurées depuis la récupération: ${originalKey}`);
        return true;

      } catch (error) {
        console.error(`❌ Erreur restauration depuis récupération:`, error);
        return false;
      }
    }

    /**
     * Obtenir un rapport détaillé de migration
     */
    getMigrationReport() {
      const stats = this.getMigrationStats();
      const validation = this.validateMigratedData();
      const recovery = this.getRecoveryData();

      return {
        summary: {
          totalProcessed: stats.totalFound,
          successful: stats.migrated,
          errors: stats.errors,
          skipped: stats.skipped,
          duration: stats.endTime ? stats.endTime - stats.startTime : null,
          successRate: stats.totalFound > 0 ? ((stats.migrated / stats.totalFound) * 100).toFixed(1) : 0
        },
        validation: validation,
        recovery: {
          count: recovery.length,
          data: recovery
        },
        recommendations: this.generateRecommendations(stats, validation, recovery)
      };
    }

    /**
     * Générer des recommandations basées sur les résultats de migration
     */
    generateRecommendations(stats, validation, recovery) {
      const recommendations = [];

      if (stats.errors > 0) {
        recommendations.push('Vérifier les erreurs de migration et considérer une restauration manuelle');
      }

      if (validation.invalidData > 0) {
        recommendations.push('Valider manuellement les données migrées invalides');
      }

      if (recovery.length > 0) {
        recommendations.push('Examiner les données de récupération et décider de leur sort');
      }

      if (stats.migrated === 0 && stats.totalFound > 0) {
        recommendations.push('Aucune migration réussie - vérifier la configuration et réessayer');
      }

      if (recommendations.length === 0) {
        recommendations.push('Migration réussie - aucune action requise');
      }

      return recommendations;
    }
  }

  class TableStorageManager {
    constructor() {
      this.saveTimeouts = new Map();
      this.config = {
        storagePrefix: "claraverse_table_",
        autoSaveDelay: 300,
      };
      this.observers = [];

      // Initialiser les nouveaux gestionnaires
      this.contextManager = new ClaraverseContextManager();
      this.containerManager = new TableContainerManager();
      this.migrationManager = new DataMigrationManager();

      console.log('🔧 Gestionnaires de contexte et conteneur initialisés');
    }

    // ============================================
    // GÉNÉRATION ID STABLE (Legacy)
    // ============================================

    generateStableTableId(table) {
      if (table.hasAttribute('data-menu-table-id')) {
        return table.getAttribute('data-menu-table-id');
      }

      const allChatTables = document.querySelectorAll('div.prose table.min-w-full');
      const position = Array.from(allChatTables).indexOf(table);
      const firstRow = table.querySelector('tr');
      const contentHash = firstRow ? this.simpleHash(firstRow.textContent.slice(0, 100)) : Date.now();
      const tableId = `${this.config.storagePrefix}${position}_${contentHash}`;

      table.setAttribute('data-menu-table-id', tableId);
      return tableId;
    }

    // ============================================
    // GÉNÉRATION ID ROBUSTE (Nouveau système)
    // ============================================

    /**
     * Générer un ID robuste pour une table combinant session, conteneur, position et contenu
     */
    generateRobustTableId(table) {
      try {
        if (!table || !table.querySelector) {
          console.warn('⚠️ Table invalide pour génération ID robuste');
          return null;
        }

        // Vérifier si la table a déjà un ID robuste
        const existingRobustId = table.getAttribute('data-robust-table-id');
        if (existingRobustId) {
          console.log(`🔍 ID robuste existant trouvé: ${existingRobustId.substring(0, 50)}...`);
          return existingRobustId;
        }

        // 1. Contexte de session avec validation
        let sessionId;
        try {
          sessionId = this.contextManager.detectCurrentSession();
          if (!sessionId || sessionId.trim() === '') {
            throw new Error('Session ID vide');
          }
        } catch (error) {
          console.warn('⚠️ Erreur détection session, utilisation fallback:', error.message);
          // Utiliser un fallback stable basé sur l'URL et le contenu de la table
          const urlHash = this.simpleHash(window.location.href);
          const tableHash = this.simpleHash(table.outerHTML.substring(0, 100));
          sessionId = `fallback_${urlHash}_${tableHash}`;
        }

        // 2. Conteneur parent avec validation
        let containerId;
        try {
          containerId = this.containerManager.getOrCreateContainerId(table);
          if (!containerId || containerId === 'no-container') {
            // Créer un conteneur de fallback stable basé sur la position dans le document
            const allTables = document.querySelectorAll('table');
            const globalPosition = Array.from(allTables).indexOf(table);
            const parentHash = table.parentElement ? this.simpleHash(table.parentElement.className + table.parentElement.tagName) : 0;
            containerId = `fallback-container-${globalPosition}-${parentHash}`;
            console.warn(`⚠️ Utilisation conteneur fallback: ${containerId}`);
          }
        } catch (error) {
          console.warn('⚠️ Erreur détection conteneur, utilisation fallback:', error.message);
          const allTables = document.querySelectorAll('table');
          const globalPosition = Array.from(allTables).indexOf(table);
          const parentHash = table.parentElement ? this.simpleHash(table.parentElement.className + table.parentElement.tagName) : 0;
          containerId = `fallback-container-${globalPosition}-${parentHash}`;
        }

        // 3. Position dans le conteneur avec validation
        let position = 0;
        try {
          const container = this.containerManager.findTableContainer(table);
          const tablesInContainer = container ?
            container.querySelectorAll('table') :
            document.querySelectorAll('table');
          position = Array.from(tablesInContainer).indexOf(table);
          if (position === -1) {
            // Si la table n'est pas trouvée, utiliser la position globale
            const allTables = document.querySelectorAll('table');
            position = Array.from(allTables).indexOf(table);
          }
        } catch (error) {
          console.warn('⚠️ Erreur calcul position, utilisation fallback:', error.message);
          const allTables = document.querySelectorAll('table');
          position = Array.from(allTables).indexOf(table);
        }

        // 4. Hash du contenu amélioré avec validation
        let contentHash;
        try {
          contentHash = this.generateContentHash(table);
          if (!contentHash || contentHash === 0) {
            contentHash = this.simpleHash(`fallback_${table.outerHTML.substring(0, 100)}`);
          }
        } catch (error) {
          console.warn('⚠️ Erreur génération hash contenu, utilisation fallback:', error.message);
          // Utiliser un fallback stable basé sur le contenu de la table
          const tableContent = table.textContent || table.innerHTML || 'empty';
          contentHash = this.simpleHash(`fallback_content_${tableContent.substring(0, 50)}`);
        }

        // 5. Assemblage de l'ID final avec validation
        const tableId = `claraverse_table_${sessionId}_${containerId}_${position}_${contentHash}`;

        // Vérifier que l'ID est valide
        if (tableId.length < 20 || tableId.includes('undefined') || tableId.includes('null')) {
          console.error('❌ ID généré invalide, utilisation fallback complet');
          // Utiliser un fallback stable basé sur le contenu et la position
          const stableContent = table.textContent || 'empty';
          const stableHash = this.simpleHash(`stable_${stableContent.substring(0, 30)}_${position}`);
          const fallbackId = `claraverse_table_stable_${stableHash}`;
          table.setAttribute('data-robust-table-id', fallbackId);
          return fallbackId;
        }

        // 6. Stocker l'ID sur la table
        table.setAttribute('data-robust-table-id', tableId);

        console.log(`✅ ID robuste généré: ${tableId.substring(0, 80)}...`);
        return tableId;

      } catch (error) {
        console.error('❌ Erreur génération ID robuste:', error);
        // Fallback complet en cas d'erreur critique - utiliser un ID stable
        try {
          const tableContent = table.textContent || table.innerHTML || 'error';
          const allTables = document.querySelectorAll('table');
          const globalPosition = Array.from(allTables).indexOf(table);
          const stableHash = this.simpleHash(`error_${tableContent.substring(0, 30)}_${globalPosition}`);
          const fallbackId = `claraverse_table_error_${stableHash}`;
          table.setAttribute('data-robust-table-id', fallbackId);
          console.warn(`⚠️ Utilisation ID fallback d'erreur stable: ${fallbackId}`);
          return fallbackId;
        } catch (fallbackError) {
          console.error('❌ Échec fallback complet:', fallbackError);
          // Dernier recours: utiliser l'ancien système
          return this.generateStableTableId(table);
        }
      }
    }

    /**
     * Générer un hash de contenu amélioré pour identification de table
     */
    generateContentHash(table) {
      try {
        if (!table || !table.querySelector) {
          return this.simpleHash(`fallback_empty_table`);
        }

        // 1. Analyser la structure de la table
        const rows = table.querySelectorAll('tr');
        const rowCount = rows.length;
        const firstRow = rows[0];
        const colCount = firstRow ? firstRow.children.length : 0;

        // 2. Extraire le contenu des en-têtes (première ligne)
        let headerText = '';
        if (firstRow) {
          const headerCells = Array.from(firstRow.children);
          headerText = headerCells.map(cell =>
            cell.textContent.trim().slice(0, 20)
          ).join('|');
        }

        // 3. Analyser quelques lignes de données pour plus de robustesse
        let dataSignature = '';
        const sampleRows = Math.min(3, rowCount - 1); // Analyser jusqu'à 3 lignes de données
        for (let i = 1; i <= sampleRows; i++) {
          if (rows[i]) {
            const rowText = Array.from(rows[i].children)
              .map(cell => cell.textContent.trim().slice(0, 10))
              .join('');
            dataSignature += rowText.slice(0, 30);
          }
        }

        // 4. Créer une signature unique combinant structure et contenu
        const structureSignature = `${rowCount}x${colCount}`;
        const contentSignature = `${headerText}_${dataSignature}`.slice(0, 200);
        const fullSignature = `${structureSignature}_${contentSignature}`;

        // 5. Calculer le hash final
        const hash = this.simpleHash(fullSignature);

        console.log(`🔍 Hash contenu généré: ${hash} (signature: ${fullSignature.slice(0, 50)}...)`);
        return hash;

      } catch (error) {
        console.error('❌ Erreur génération hash contenu:', error);
        // Utiliser un fallback stable basé sur le contenu de la table
        const tableContent = table.textContent || table.innerHTML || 'error';
        return this.simpleHash(`error_fallback_${tableContent.substring(0, 30)}`);
      }
    }

    /**
     * Obtenir l'ID de table approprié (robuste si disponible, sinon legacy)
     */
    getTableId(table) {
      // Priorité 1: ID robuste existant
      const robustId = table.getAttribute('data-robust-table-id');
      if (robustId) {
        return robustId;
      }

      // Priorité 2: Générer un nouvel ID robuste
      try {
        const newRobustId = this.generateRobustTableId(table);
        if (newRobustId) {
          return newRobustId;
        }
      } catch (error) {
        console.warn('⚠️ Échec génération ID robuste, fallback vers legacy:', error.message);
      }

      // Priorité 3: Fallback vers l'ancien système
      return this.generateStableTableId(table);
    }

    simpleHash(str) {
      let hash = 0;
      if (!str || str.length === 0) return hash;
      for (let i = 0; i < Math.min(str.length, 100); i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return Math.abs(hash);
    }

    // ============================================
    // SAUVEGARDE (Système robuste avec migration automatique)
    // ============================================

    saveTableHTMLNow(table) {
      try {
        if (!table || !table.querySelector) {
          console.warn("⚠️ Table invalide pour sauvegarde");
          return false;
        }

        // Vérifier si c'est une ancienne table à migrer
        const oldId = table.getAttribute('data-menu-table-id');
        let newId;

        try {
          newId = this.generateRobustTableId(table);
        } catch (error) {
          console.error("❌ Erreur génération ID robuste:", error);
          // Fallback vers l'ancien système
          newId = this.generateStableTableId(table);
        }

        if (!newId) {
          console.error("❌ Impossible de générer un ID (robuste ou legacy)");
          // Dernier recours: générer un ID stable basé sur le contenu
          const tableContent = table.textContent || table.innerHTML || 'emergency';
          const allTables = document.querySelectorAll('table');
          const globalPosition = Array.from(allTables).indexOf(table);
          const emergencyHash = this.simpleHash(`emergency_${tableContent.substring(0, 30)}_${globalPosition}`);
          newId = `claraverse_table_emergency_${emergencyHash}`;
          console.warn(`⚠️ Utilisation ID d'urgence stable: ${newId}`);
        }

        // Migration automatique si nécessaire
        if (oldId && oldId !== newId && !this.migrationManager.isNewFormat(oldId)) {
          console.log(`🔄 Migration automatique détectée: ${oldId} → ${newId.substring(0, 50)}...`);
          try {
            // Migration synchrone pour éviter les problèmes d'async dans saveTableHTMLNow
            this.migrationManager.migrateSingleTable(oldId).catch(migrationError => {
              console.warn('⚠️ Erreur migration automatique:', migrationError.message);
            });
          } catch (migrationError) {
            console.warn('⚠️ Erreur migration automatique:', migrationError.message);
            // Continuer avec la sauvegarde même si la migration échoue
          }
        }

        // Préparer les données avec le nouveau format robuste
        const sessionContext = this.contextManager.getCurrentSessionContext();
        const containerId = this.containerManager.getOrCreateContainerId(table);

        const saveData = {
          id: newId,
          html: table.outerHTML,
          timestamp: Date.now(),
          sessionId: sessionContext ? sessionContext.sessionId : 'unknown',
          containerId: containerId,
          metadata: {
            rowCount: table.querySelectorAll("tr").length,
            colCount: table.querySelector("tr")?.querySelectorAll("td, th").length || 0,
            version: '2.0',
            contentHash: this.generateContentHash(table),
            position: this.getTablePositionInContainer(table, containerId)
          },
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100),
            sessionStartTime: sessionContext ? sessionContext.startTime : Date.now(),
            detectionMethod: sessionContext ? sessionContext.detectionMethod : 'unknown'
          }
        };

        // Sauvegarde avec gestion d'erreur quota
        localStorage.setItem(newId, JSON.stringify(saveData));

        // Stocker l'ID sur la table pour la restauration future
        table.setAttribute('data-robust-table-id', newId);

        console.log(`✅ Sauvegarde robuste: ${newId.substring(0, 50)}... (${saveData.metadata.rowCount}x${saveData.metadata.colCount})`);

        this.showSaveIndicator();
        this.notifyObservers('table_saved', { tableId: newId, table, isRobust: true });

        return true;

      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn("⚠️ Quota localStorage dépassé, nettoyage...");
          this.cleanOldSaves(5);

          try {
            // Retry avec données minimales
            const tableId = this.getTableId(table);
            const minimalData = {
              id: tableId,
              html: table.outerHTML,
              timestamp: Date.now(),
              version: '2.0'
            };
            localStorage.setItem(tableId, JSON.stringify(minimalData));
            console.log("✅ Sauvegarde minimale après nettoyage");
            return true;
          } catch (retryError) {
            console.error("❌ Échec après nettoyage:", retryError);
            return false;
          }
        }
        console.error("❌ Erreur sauvegarde robuste:", error);
        return false;
      }
    }

    /**
     * Obtenir la position d'une table dans son conteneur
     */
    getTablePositionInContainer(table, containerId) {
      try {
        const containerInfo = this.containerManager.getContainerInfo(containerId);
        if (containerInfo && containerInfo.element) {
          const tablesInContainer = containerInfo.element.querySelectorAll('table');
          return Array.from(tablesInContainer).indexOf(table);
        }
        return 0;
      } catch (error) {
        console.warn('⚠️ Erreur calcul position table:', error);
        return 0;
      }
    }

    // ============================================
    // MÉTADONNÉES ET CONTEXTE AVANCÉS
    // ============================================

    /**
     * Créer des métadonnées complètes pour une table
     */
    createEnhancedMetadata(table, tableId) {
      try {
        const sessionContext = this.contextManager.getCurrentSessionContext();
        const containerId = this.containerManager.getOrCreateContainerId(table);
        const containerInfo = this.containerManager.getContainerInfo(containerId);

        return {
          // Identification
          id: tableId,
          sessionId: sessionContext ? sessionContext.sessionId : 'unknown',
          containerId: containerId,

          // Structure de table
          rowCount: table.querySelectorAll("tr").length,
          colCount: table.querySelector("tr")?.querySelectorAll("td, th").length || 0,
          hasHeaders: this.detectTableHeaders(table),

          // Position et relations
          position: this.getTablePositionInContainer(table, containerId),
          siblingTables: containerInfo ? containerInfo.tableCount - 1 : 0,

          // Contenu
          contentHash: this.generateContentHash(table),
          headerSignature: this.extractHeaderSignature(table),
          dataSignature: this.extractDataSignature(table),

          // Métadonnées techniques
          version: '2.0',
          createdAt: Date.now(),
          lastModified: Date.now(),

          // Contexte de session
          sessionContext: sessionContext ? {
            detectionMethod: sessionContext.detectionMethod,
            isTemporary: sessionContext.isTemporary,
            sessionStartTime: sessionContext.startTime,
            sessionUrl: sessionContext.url
          } : null,

          // Contexte de conteneur
          containerContext: containerInfo ? {
            containerCreatedAt: containerInfo.createdAt,
            containerLastAnalyzed: containerInfo.lastAnalyzed,
            containerContentHash: containerInfo.contentHash
          } : null,

          // Contexte de page
          pageContext: {
            url: window.location.href,
            title: document.title,
            userAgent: navigator.userAgent.substring(0, 100),
            timestamp: Date.now(),
            domain: window.location.hostname
          }
        };
      } catch (error) {
        console.error('❌ Erreur création métadonnées:', error);
        return {
          id: tableId,
          version: '2.0',
          error: error.message,
          timestamp: Date.now()
        };
      }
    }

    /**
     * Détecter si une table a des en-têtes
     */
    detectTableHeaders(table) {
      try {
        const firstRow = table.querySelector('tr');
        if (!firstRow) return false;

        // Vérifier s'il y a des éléments th
        const thElements = firstRow.querySelectorAll('th');
        if (thElements.length > 0) return true;

        // Vérifier si la première ligne a un style différent
        const firstRowCells = Array.from(firstRow.children);
        const secondRow = table.querySelector('tr:nth-child(2)');

        if (secondRow) {
          const secondRowCells = Array.from(secondRow.children);

          // Comparer les styles (approximatif)
          if (firstRowCells.length > 0 && secondRowCells.length > 0) {
            const firstCellStyle = window.getComputedStyle(firstRowCells[0]);
            const secondCellStyle = window.getComputedStyle(secondRowCells[0]);

            return firstCellStyle.fontWeight !== secondCellStyle.fontWeight ||
              firstCellStyle.backgroundColor !== secondCellStyle.backgroundColor;
          }
        }

        return false;
      } catch (error) {
        console.warn('⚠️ Erreur détection en-têtes:', error);
        return false;
      }
    }

    /**
     * Extraire une signature des en-têtes de table
     */
    extractHeaderSignature(table) {
      try {
        const firstRow = table.querySelector('tr');
        if (!firstRow) return '';

        const headers = Array.from(firstRow.children).map(cell =>
          cell.textContent.trim().slice(0, 20)
        );

        return headers.join('|').slice(0, 200);
      } catch (error) {
        console.warn('⚠️ Erreur extraction signature en-têtes:', error);
        return '';
      }
    }

    /**
     * Extraire une signature des données de table
     */
    extractDataSignature(table) {
      try {
        const rows = table.querySelectorAll('tr');
        const dataRows = Array.from(rows).slice(1, 4); // Prendre jusqu'à 3 lignes de données

        const signatures = dataRows.map(row => {
          const cells = Array.from(row.children);
          return cells.map(cell =>
            cell.textContent.trim().slice(0, 10)
          ).join('');
        });

        return signatures.join('_').slice(0, 150);
      } catch (error) {
        console.warn('⚠️ Erreur extraction signature données:', error);
        return '';
      }
    }

    /**
     * Valider le contexte lors des opérations sur les tables
     */
    validateOperationContext(table, operation = 'unknown') {
      try {
        const validation = {
          isValid: true,
          warnings: [],
          errors: [],
          context: {
            operation: operation,
            timestamp: Date.now(),
            tableId: table.getAttribute('data-robust-table-id') || 'unknown'
          }
        };

        // Validation de session
        const sessionContext = this.contextManager.getCurrentSessionContext();
        if (!sessionContext) {
          validation.warnings.push('Aucun contexte de session détecté');
        } else if (!sessionContext.isValid) {
          validation.warnings.push('Contexte de session invalide');
        }

        // Validation de conteneur
        const containerId = this.containerManager.getOrCreateContainerId(table);
        if (containerId === 'no-container') {
          validation.warnings.push('Table sans conteneur identifiable');
        }

        // Validation de la table elle-même
        if (!table.querySelector('tr')) {
          validation.errors.push('Table sans lignes détectées');
          validation.isValid = false;
        }

        // Validation de l'environnement
        if (!document.contains(table)) {
          validation.errors.push('Table non présente dans le DOM');
          validation.isValid = false;
        }

        validation.context.sessionId = sessionContext ? sessionContext.sessionId : null;
        validation.context.containerId = containerId;

        return validation;
      } catch (error) {
        console.error('❌ Erreur validation contexte opération:', error);
        return {
          isValid: false,
          errors: [`Erreur validation: ${error.message}`],
          warnings: [],
          context: { operation, timestamp: Date.now(), error: error.message }
        };
      }
    }

    /**
     * Suivre les relations entre tables dans un conteneur
     */
    trackTableRelationships(containerId) {
      try {
        const containerInfo = this.containerManager.getContainerInfo(containerId);
        if (!containerInfo || !containerInfo.element) {
          return null;
        }

        const container = containerInfo.element;
        const tables = Array.from(container.querySelectorAll('table'));

        const relationships = {
          containerId: containerId,
          tableCount: tables.length,
          tables: [],
          relationships: [],
          timestamp: Date.now()
        };

        // Analyser chaque table
        tables.forEach((table, index) => {
          const tableId = table.getAttribute('data-robust-table-id') || `table_${index}`;
          const metadata = this.createEnhancedMetadata(table, tableId);

          relationships.tables.push({
            id: tableId,
            position: index,
            rowCount: metadata.rowCount,
            colCount: metadata.colCount,
            headerSignature: metadata.headerSignature,
            contentHash: metadata.contentHash
          });
        });

        // Détecter les relations potentielles
        for (let i = 0; i < relationships.tables.length; i++) {
          for (let j = i + 1; j < relationships.tables.length; j++) {
            const table1 = relationships.tables[i];
            const table2 = relationships.tables[j];

            const relation = this.analyzeTableRelation(table1, table2);
            if (relation.type !== 'none') {
              relationships.relationships.push({
                table1: table1.id,
                table2: table2.id,
                type: relation.type,
                confidence: relation.confidence,
                details: relation.details
              });
            }
          }
        }

        console.log(`🔗 Relations analysées pour conteneur ${containerId}: ${relationships.relationships.length} relation(s)`);
        return relationships;

      } catch (error) {
        console.error('❌ Erreur suivi relations tables:', error);
        return null;
      }
    }

    /**
     * Analyser la relation entre deux tables
     */
    analyzeTableRelation(table1, table2) {
      try {
        // Relation par structure similaire
        if (table1.colCount === table2.colCount &&
          Math.abs(table1.rowCount - table2.rowCount) <= 2) {

          // Vérifier la similarité des en-têtes
          const headerSimilarity = this.calculateStringSimilarity(
            table1.headerSignature,
            table2.headerSignature
          );

          if (headerSimilarity > 0.8) {
            return {
              type: 'similar_structure',
              confidence: headerSimilarity,
              details: 'Tables avec structure et en-têtes similaires'
            };
          }
        }

        // Relation par proximité (tables adjacentes)
        if (Math.abs(table1.position - table2.position) === 1) {
          return {
            type: 'adjacent',
            confidence: 0.7,
            details: 'Tables adjacentes dans le conteneur'
          };
        }

        // Relation par contenu similaire
        const contentSimilarity = this.calculateStringSimilarity(
          table1.contentHash.toString(),
          table2.contentHash.toString()
        );

        if (contentSimilarity > 0.6) {
          return {
            type: 'similar_content',
            confidence: contentSimilarity,
            details: 'Tables avec contenu similaire'
          };
        }

        return { type: 'none', confidence: 0, details: 'Aucune relation détectée' };

      } catch (error) {
        console.warn('⚠️ Erreur analyse relation tables:', error);
        return { type: 'error', confidence: 0, details: error.message };
      }
    }

    /**
     * Calculer la similarité entre deux chaînes
     */
    calculateStringSimilarity(str1, str2) {
      if (!str1 || !str2) return 0;
      if (str1 === str2) return 1;

      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;

      if (longer.length === 0) return 1;

      const editDistance = this.calculateLevenshteinDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculer la distance de Levenshtein entre deux chaînes
     */
    calculateLevenshteinDistance(str1, str2) {
      const matrix = [];

      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }

      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      return matrix[str2.length][str1.length];
    }

    saveTableHTMLDebounced(table) {
      if (!table) return;
      const tableId = this.generateStableTableId(table);

      if (this.saveTimeouts.has(tableId)) {
        clearTimeout(this.saveTimeouts.get(tableId));
      }

      const timeout = setTimeout(() => {
        this.saveTableHTMLNow(table);
        this.saveTimeouts.delete(tableId);
      }, this.config.autoSaveDelay);

      this.saveTimeouts.set(tableId, timeout);
    }

    // ============================================
    // RESTAURATION (Système robuste avec validation)
    // ============================================

    restoreTableFromStorage(table) {
      console.log("🚨 DEBUG: restoreTableFromStorage APPELÉE !");
      try {
        if (!table || !table.querySelector) {
          console.warn("⚠️ Table invalide pour restauration");
          return false;
        }

        let savedDataStr = null;
        let tableId = null;
        let isRobustRestore = false;

        // Priorité 1: Utiliser l'ID robuste déjà stocké sur la table (le plus fiable)
        const existingRobustId = table.getAttribute('data-robust-table-id');
        if (existingRobustId) {
          try {
            savedDataStr = localStorage.getItem(existingRobustId);
            if (savedDataStr) {
              tableId = existingRobustId;
              isRobustRestore = true;
              console.log(`🔍 Données robustes trouvées avec ID existant: ${existingRobustId.substring(0, 50)}...`);
            }
          } catch (error) {
            console.warn("⚠️ Erreur accès localStorage pour ID existant:", error.message);
          }
        }

        // Priorité 2: Essayer de générer l'ID robuste (si pas d'ID existant)
        if (!savedDataStr) {
          let robustId = null;
          try {
            robustId = this.generateRobustTableId(table);
          } catch (error) {
            console.warn("⚠️ Erreur génération ID robuste pour restauration:", error.message);
          }

          if (robustId) {
            try {
              savedDataStr = localStorage.getItem(robustId);
              if (savedDataStr) {
                tableId = robustId;
                isRobustRestore = true;
                console.log(`🔍 Données robustes trouvées avec ID généré: ${robustId.substring(0, 50)}...`);
              }
            } catch (error) {
              console.warn("⚠️ Erreur accès localStorage pour ID généré:", error.message);
            }
          }
        }

        // Fallback vers l'ancien système si pas de données robustes
        if (!savedDataStr) {
          const legacyId = this.generateStableTableId(table);
          savedDataStr = localStorage.getItem(legacyId);
          if (savedDataStr) {
            tableId = legacyId;
            console.log(`🔄 Restauration legacy: ${legacyId}`);
          }
        }

        if (!savedDataStr) {
          console.log(`ℹ️ Pas de sauvegarde pour la table`);
          return false;
        }

        const savedData = JSON.parse(savedDataStr);

        // Validation pour les données robustes
        if (isRobustRestore && savedData.version === '2.0') {
          const validationResult = this.validateTableContext(savedData);
          if (!validationResult.isValid) {
            console.warn(`⚠️ Validation contexte échouée: ${validationResult.reason}`);
            // Continuer quand même mais avec un avertissement
          }
        }

        // Parser et restaurer le HTML
        console.log(`🔧 DEBUG: Début parsing HTML...`);
        const parser = new DOMParser();
        const doc = parser.parseFromString(savedData.html, 'text/html');
        const parsedTable = doc.querySelector('table');

        if (!parsedTable) {
          console.error("❌ Parse HTML échoué");
          return false;
        }

        console.log(`🔧 DEBUG: HTML parsé avec succès, début restauration...`);

        // Préserver les classes et styles actuels
        const currentClasses = table.className;
        const currentStyles = table.style.cssText;

        // Restaurer le contenu
        table.innerHTML = parsedTable.innerHTML;

        // CORRECTION DIFFÉRÉE: Appliquer la restauration cellule par cellule avec délai
        // pour éviter les interférences qui écrasent le contenu immédiatement après
        setTimeout(() => {
          const originalCells = table.querySelectorAll('td, th');
          const restoredCells = parsedTable.querySelectorAll('td, th');

          console.log(`🔧 CORRECTION DIFFÉRÉE: ${originalCells.length} cellules originales, ${restoredCells.length} cellules restaurées`);

          for (let i = 0; i < Math.min(originalCells.length, restoredCells.length); i++) {
            const restoredContent = restoredCells[i].textContent;
            originalCells[i].textContent = restoredContent;
            console.log(`🔧 CORRECTION: Cellule ${i} forcée: "${restoredContent}"`);
          }

          console.log('✅ Correction différée appliquée avec succès');
        }, 50);

        table.className = currentClasses;
        table.style.cssText = currentStyles;

        // Mettre à jour les attributs d'identification
        if (isRobustRestore) {
          table.setAttribute('data-robust-table-id', tableId);
        }

        console.log(`✅ Restauration ${isRobustRestore ? 'robuste' : 'legacy'}: ${tableId.substring(0, 50)}...`);
        this.notifyObservers('table_restored', {
          tableId,
          table,
          isRobust: isRobustRestore,
          metadata: savedData.metadata
        });

        return true;

      } catch (error) {
        console.error("❌ Erreur restauration:", error);
        return false;
      }
    }

    /**
     * Valider le contexte d'une table sauvegardée
     */
    validateTableContext(savedData) {
      try {
        const currentSession = this.contextManager.getCurrentSessionContext();

        // Validation de session
        if (savedData.sessionId && currentSession) {
          if (savedData.sessionId !== currentSession.sessionId) {
            // Permettre la restauration entre sessions mais avec avertissement
            return {
              isValid: true,
              reason: `Session différente: ${savedData.sessionId} vs ${currentSession.sessionId}`,
              warning: true
            };
          }
        }

        // Validation de conteneur (plus flexible)
        if (savedData.containerId) {
          const containerExists = document.querySelector(`[data-container-id="${savedData.containerId}"]`);
          if (!containerExists) {
            return {
              isValid: true,
              reason: `Conteneur non trouvé: ${savedData.containerId}`,
              warning: true
            };
          }
        }

        // Validation de l'URL (domaine seulement)
        if (savedData.context && savedData.context.url) {
          try {
            const savedUrl = new URL(savedData.context.url);
            const currentUrl = new URL(window.location.href);

            if (savedUrl.origin !== currentUrl.origin) {
              return {
                isValid: false,
                reason: `Domaine différent: ${savedUrl.origin} vs ${currentUrl.origin}`
              };
            }
          } catch (urlError) {
            // Ignorer les erreurs d'URL
          }
        }

        return { isValid: true, reason: 'Validation réussie' };

      } catch (error) {
        console.warn('⚠️ Erreur validation contexte:', error);
        return {
          isValid: true,
          reason: 'Erreur validation, autorisation par défaut',
          warning: true
        };
      }
    }

    restoreAllTablesFromStorage() {
      console.log("🔄 Restauration globale des tables...");

      // Détecter toutes les tables dans les conteneurs appropriés
      const chatTables = document.querySelectorAll('div.prose table.min-w-full');
      let restoredCount = 0;
      let robustCount = 0;
      let legacyCount = 0;

      // Déclencher la migration automatique si nécessaire
      this.migrationManager.migrateAllExistingData().then((migrationStats) => {
        if (migrationStats.migrated > 0) {
          console.log(`🔄 Migration automatique: ${migrationStats.migrated} table(s) migrée(s)`);
        }
      }).catch((error) => {
        console.warn('⚠️ Erreur migration automatique:', error);
      });

      chatTables.forEach((table, index) => {
        setTimeout(() => {
          const restored = this.restoreTableFromStorage(table);
          if (restored) {
            restoredCount++;

            // Compter les types de restauration
            const hasRobustId = table.hasAttribute('data-robust-table-id');
            if (hasRobustId) {
              robustCount++;
            } else {
              legacyCount++;
            }
          }
        }, index * 50);
      });

      setTimeout(() => {
        if (restoredCount > 0) {
          const message = `✅ ${restoredCount} table(s) restaurée(s) (${robustCount} robuste, ${legacyCount} legacy)`;
          console.log(message);
          this.showQuickNotification(`✅ ${restoredCount} table(s) restaurée(s)`);

          // Émettre un événement de restauration globale
          this.notifyObservers('tables_restored_all', {
            total: restoredCount,
            robust: robustCount,
            legacy: legacyCount
          });
        }
      }, chatTables.length * 50 + 100);
    }

    // ============================================
    // GESTION QUOTA
    // ============================================

    cleanOldSaves(keepCount = 10) {
      try {
        const saves = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              saves.push({ key, timestamp: data.timestamp || 0 });
            } catch {
              saves.push({ key, timestamp: 0 });
            }
          }
        }

        saves.sort((a, b) => b.timestamp - a.timestamp);

        if (saves.length > keepCount) {
          const toDelete = saves.slice(keepCount);
          toDelete.forEach(({ key }) => {
            localStorage.removeItem(key);
          });
          console.log(`🧹 ${toDelete.length} sauvegarde(s) nettoyée(s)`);
        }
      } catch (error) {
        console.error("❌ Erreur nettoyage:", error);
      }
    }

    // ============================================
    // NETTOYAGE ET OPTIMISATION AVANCÉS
    // ============================================

    /**
     * Nettoyage intelligent avec préservation des sessions actives
     */
    cleanOldSavesSessionAware(keepCount = 10, preserveActiveSessions = true) {
      try {
        console.log('🧹 Début nettoyage intelligent avec préservation de session...');

        const saves = [];
        const currentSessionId = this.contextManager.currentSessionId;
        const activeSessionIds = this.getActiveSessionIds();

        // Collecter toutes les sauvegardes avec métadonnées de session
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              const saveInfo = {
                key,
                timestamp: data.timestamp || 0,
                sessionId: data.sessionId || 'unknown',
                isCurrentSession: data.sessionId === currentSessionId,
                isActiveSession: activeSessionIds.includes(data.sessionId),
                isNewFormat: this.migrationManager.isNewFormat(key),
                version: data.metadata?.version || '1.0',
                size: JSON.stringify(data).length
              };
              saves.push(saveInfo);
            } catch (parseError) {
              // Données corrompues - marquer pour suppression
              saves.push({
                key,
                timestamp: 0,
                sessionId: 'corrupted',
                isCurrentSession: false,
                isActiveSession: false,
                isNewFormat: false,
                version: 'corrupted',
                size: 0,
                corrupted: true
              });
            }
          }
        }

        console.log(`📊 ${saves.length} sauvegardes analysées`);
        console.log(`📊 Sessions actives: ${activeSessionIds.length}`);

        // Stratégie de nettoyage par priorité
        const cleanupResults = this.executeCleanupStrategy(saves, keepCount, preserveActiveSessions);

        return cleanupResults;
      } catch (error) {
        console.error("❌ Erreur nettoyage intelligent:", error);
        return { deleted: 0, preserved: 0, errors: 1 };
      }
    }

    /**
     * Exécuter la stratégie de nettoyage par priorité
     */
    executeCleanupStrategy(saves, keepCount, preserveActiveSessions) {
      const results = {
        deleted: 0,
        preserved: 0,
        errors: 0,
        details: {
          corruptedDeleted: 0,
          oldFormatDeleted: 0,
          inactiveSessionDeleted: 0,
          oldDataDeleted: 0,
          activeSessionPreserved: 0,
          currentSessionPreserved: 0
        }
      };

      try {
        // Phase 1: Supprimer les données corrompues
        const corruptedSaves = saves.filter(save => save.corrupted);
        corruptedSaves.forEach(save => {
          localStorage.removeItem(save.key);
          results.deleted++;
          results.details.corruptedDeleted++;
        });

        // Phase 2: Appliquer les politiques d'expiration par session
        const validSaves = saves.filter(save => !save.corrupted);
        const expiredSaves = this.applySessionExpirationPolicies(validSaves);

        expiredSaves.forEach(save => {
          localStorage.removeItem(save.key);
          results.deleted++;
          results.details.inactiveSessionDeleted++;
        });

        // Phase 3: Nettoyage sélectif basé sur l'activité
        const remainingSaves = validSaves.filter(save => !expiredSaves.includes(save));
        const selectiveCleanup = this.performSelectiveCleanup(remainingSaves, keepCount, preserveActiveSessions);

        results.deleted += selectiveCleanup.deleted;
        results.preserved += selectiveCleanup.preserved;
        results.details.oldFormatDeleted += selectiveCleanup.oldFormatDeleted;
        results.details.oldDataDeleted += selectiveCleanup.oldDataDeleted;
        results.details.activeSessionPreserved += selectiveCleanup.activeSessionPreserved;
        results.details.currentSessionPreserved += selectiveCleanup.currentSessionPreserved;

        console.log(`✅ Nettoyage terminé: ${results.deleted} supprimées, ${results.preserved} préservées`);
        console.log(`📊 Détails:`, results.details);

        return results;
      } catch (error) {
        console.error("❌ Erreur stratégie nettoyage:", error);
        results.errors++;
        return results;
      }
    }

    /**
     * Appliquer les politiques d'expiration basées sur les sessions
     */
    applySessionExpirationPolicies(saves) {
      const expiredSaves = [];
      const now = Date.now();

      // Politiques d'expiration par type de session
      const expirationPolicies = {
        temporary: 2 * 60 * 60 * 1000,      // 2 heures pour sessions temporaires
        inactive: 7 * 24 * 60 * 60 * 1000,  // 7 jours pour sessions inactives
        legacy: 30 * 24 * 60 * 60 * 1000,   // 30 jours pour données legacy
        corrupted: 0                        // Suppression immédiate pour données corrompues
      };

      saves.forEach(save => {
        let maxAge = expirationPolicies.inactive; // Par défaut

        // Déterminer la politique d'expiration appropriée
        if (save.sessionId.startsWith('temp_')) {
          maxAge = expirationPolicies.temporary;
        } else if (save.version === '1.0' || !save.isNewFormat) {
          maxAge = expirationPolicies.legacy;
        } else if (save.corrupted) {
          maxAge = expirationPolicies.corrupted;
        }

        // Vérifier l'expiration
        const age = now - save.timestamp;
        if (age > maxAge) {
          expiredSaves.push(save);
          console.log(`⏰ Données expirées: ${save.key.substring(0, 50)}... (âge: ${Math.round(age / (60 * 60 * 1000))}h)`);
        }
      });

      return expiredSaves;
    }

    /**
     * Nettoyage sélectif basé sur l'activité de session
     */
    performSelectiveCleanup(saves, keepCount, preserveActiveSessions) {
      const results = {
        deleted: 0,
        preserved: 0,
        oldFormatDeleted: 0,
        oldDataDeleted: 0,
        activeSessionPreserved: 0,
        currentSessionPreserved: 0
      };

      // Séparer les sauvegardes par priorité
      const currentSessionSaves = saves.filter(save => save.isCurrentSession);
      const activeSessionSaves = saves.filter(save => save.isActiveSession && !save.isCurrentSession);
      const inactiveSessionSaves = saves.filter(save => !save.isActiveSession && !save.isCurrentSession);

      // Toujours préserver la session courante si demandé
      if (preserveActiveSessions) {
        results.preserved += currentSessionSaves.length;
        results.currentSessionPreserved += currentSessionSaves.length;

        results.preserved += activeSessionSaves.length;
        results.activeSessionPreserved += activeSessionSaves.length;
      }

      // Calculer combien de sauvegardes inactives on peut garder
      const preservedCount = preserveActiveSessions ?
        (currentSessionSaves.length + activeSessionSaves.length) : 0;
      const remainingQuota = Math.max(0, keepCount - preservedCount);

      // Trier les sauvegardes inactives par priorité (nouveau format d'abord, puis par timestamp)
      inactiveSessionSaves.sort((a, b) => {
        // Priorité 1: Nouveau format
        if (a.isNewFormat !== b.isNewFormat) {
          return b.isNewFormat - a.isNewFormat;
        }
        // Priorité 2: Timestamp récent
        return b.timestamp - a.timestamp;
      });

      // Garder les meilleures sauvegardes inactives dans la limite du quota
      const inactivesToKeep = inactiveSessionSaves.slice(0, remainingQuota);
      const inactivesToDelete = inactiveSessionSaves.slice(remainingQuota);

      results.preserved += inactivesToKeep.length;

      // Supprimer les sauvegardes inactives en excès
      inactivesToDelete.forEach(save => {
        localStorage.removeItem(save.key);
        results.deleted++;

        if (!save.isNewFormat) {
          results.oldFormatDeleted++;
        } else {
          results.oldDataDeleted++;
        }
      });

      return results;
    }

    /**
     * Obtenir les IDs de sessions actives
     */
    getActiveSessionIds() {
      const activeIds = new Set();

      try {
        // Ajouter la session courante
        if (this.contextManager.currentSessionId) {
          activeIds.add(this.contextManager.currentSessionId);
        }

        // Vérifier les sessions récemment actives dans localStorage
        const recentThreshold = 24 * 60 * 60 * 1000; // 24 heures
        const now = Date.now();

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (data.sessionId && data.timestamp && (now - data.timestamp < recentThreshold)) {
                activeIds.add(data.sessionId);
              }
            } catch (error) {
              // Ignorer les données corrompues
            }
          }
        }

        // Vérifier la session active stockée
        const activeSession = localStorage.getItem('claraverse_active_session');
        if (activeSession) {
          try {
            const sessionData = JSON.parse(activeSession);
            if (sessionData.id && (now - sessionData.lastActivity < recentThreshold)) {
              activeIds.add(sessionData.id);
            }
          } catch (error) {
            // Ignorer les données corrompues
          }
        }

      } catch (error) {
        console.warn('⚠️ Erreur détection sessions actives:', error);
      }

      return Array.from(activeIds);
    }

    /**
     * Surveillance du quota de stockage avec contexte de session
     */
    monitorStorageQuotaWithSession() {
      try {
        const stats = this.getStorageStatsWithSession();
        const quotaThreshold = 0.8; // 80% du quota

        if (stats.quotaUsageRatio > quotaThreshold) {
          console.warn(`⚠️ Quota de stockage élevé: ${(stats.quotaUsageRatio * 100).toFixed(1)}%`);

          // Nettoyage automatique intelligent
          const cleanupResults = this.cleanOldSavesSessionAware(15, true);

          console.log(`🧹 Nettoyage automatique: ${cleanupResults.deleted} supprimées`);

          // Émettre un événement de nettoyage
          this.emitStorageCleanupEvent(cleanupResults, stats);
        }

        return stats;
      } catch (error) {
        console.error('❌ Erreur surveillance quota:', error);
        return null;
      }
    }

    /**
     * Émettre un événement de nettoyage de stockage
     */
    emitStorageCleanupEvent(cleanupResults, storageStats) {
      const event = new CustomEvent('claraverse:storage:cleanup', {
        detail: {
          cleanupResults,
          storageStats,
          timestamp: Date.now()
        },
        bubbles: true
      });
      document.dispatchEvent(event);
    }

    /**
     * Détecter les données orphelines sans sessions valides
     */
    detectOrphanedData() {
      console.log('🔍 Détection des données orphelines...');

      const orphanedData = {
        invalidSessions: [],
        missingContainers: [],
        corruptedData: [],
        duplicateIds: [],
        inconsistentData: [],
        totalOrphaned: 0
      };

      try {
        const allSaves = [];
        const sessionIds = new Set();
        const containerIds = new Set();
        const tableIds = new Set();

        // Première passe: collecter toutes les données et identifier les patterns
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              const saveInfo = {
                key,
                data,
                sessionId: data.sessionId,
                containerId: data.containerId,
                tableId: data.id,
                timestamp: data.timestamp || 0,
                version: data.metadata?.version || '1.0'
              };

              allSaves.push(saveInfo);

              if (saveInfo.sessionId) sessionIds.add(saveInfo.sessionId);
              if (saveInfo.containerId) containerIds.add(saveInfo.containerId);
              if (saveInfo.tableId) {
                if (tableIds.has(saveInfo.tableId)) {
                  orphanedData.duplicateIds.push(saveInfo);
                } else {
                  tableIds.add(saveInfo.tableId);
                }
              }

            } catch (parseError) {
              orphanedData.corruptedData.push({
                key,
                error: parseError.message,
                rawData: localStorage.getItem(key)?.substring(0, 100) + '...'
              });
            }
          }
        }

        console.log(`📊 Analyse: ${allSaves.length} sauvegardes, ${sessionIds.size} sessions, ${containerIds.size} conteneurs`);

        // Deuxième passe: identifier les données orphelines
        allSaves.forEach(save => {
          // Vérifier la validité de la session
          if (!this.validateSessionId(save.sessionId)) {
            orphanedData.invalidSessions.push({
              ...save,
              reason: 'Session ID invalide ou manquant'
            });
          }

          // Vérifier la cohérence des conteneurs
          if (save.containerId && save.containerId !== 'no-container') {
            const containerExists = this.validateContainerExists(save.containerId);
            if (!containerExists) {
              orphanedData.missingContainers.push({
                ...save,
                reason: 'Conteneur référencé introuvable dans le DOM'
              });
            }
          }

          // Vérifier la cohérence des données
          const dataIntegrity = this.validateDataIntegrity(save);
          if (!dataIntegrity.isValid) {
            orphanedData.inconsistentData.push({
              ...save,
              reason: dataIntegrity.reason,
              issues: dataIntegrity.issues
            });
          }
        });

        // Calculer le total
        orphanedData.totalOrphaned =
          orphanedData.invalidSessions.length +
          orphanedData.missingContainers.length +
          orphanedData.corruptedData.length +
          orphanedData.duplicateIds.length +
          orphanedData.inconsistentData.length;

        console.log(`🔍 Données orphelines détectées: ${orphanedData.totalOrphaned}`);
        console.log(`  - Sessions invalides: ${orphanedData.invalidSessions.length}`);
        console.log(`  - Conteneurs manquants: ${orphanedData.missingContainers.length}`);
        console.log(`  - Données corrompues: ${orphanedData.corruptedData.length}`);
        console.log(`  - IDs dupliqués: ${orphanedData.duplicateIds.length}`);
        console.log(`  - Données incohérentes: ${orphanedData.inconsistentData.length}`);

        return orphanedData;

      } catch (error) {
        console.error('❌ Erreur détection données orphelines:', error);
        return orphanedData;
      }
    }

    /**
     * Valider l'existence d'un conteneur dans le DOM
     */
    validateContainerExists(containerId) {
      try {
        // Vérifier dans le cache du gestionnaire de conteneurs
        const containerInfo = this.containerManager.getContainerInfo(containerId);
        if (containerInfo && containerInfo.element && document.contains(containerInfo.element)) {
          return true;
        }

        // Vérifier directement dans le DOM
        const containerElement = document.querySelector(`[data-container-id="${containerId}"]`);
        return containerElement !== null;

      } catch (error) {
        console.warn(`⚠️ Erreur validation conteneur ${containerId}:`, error);
        return false;
      }
    }

    /**
     * Valider l'intégrité des données d'une sauvegarde
     */
    validateDataIntegrity(save) {
      const validation = {
        isValid: true,
        reason: '',
        issues: []
      };

      try {
        const data = save.data;

        // Vérifications de base
        if (!data.id) {
          validation.issues.push('ID manquant');
        }

        if (!data.html || data.html.trim() === '') {
          validation.issues.push('HTML manquant ou vide');
        }

        if (!data.timestamp || isNaN(data.timestamp)) {
          validation.issues.push('Timestamp invalide');
        }

        // Vérifications de cohérence
        if (data.id !== save.key && !save.key.includes(data.id)) {
          validation.issues.push('Incohérence entre clé et ID');
        }

        // Vérifications de métadonnées
        if (data.metadata) {
          if (data.metadata.rowCount < 0 || data.metadata.colCount < 0) {
            validation.issues.push('Métadonnées de structure invalides');
          }
        }

        // Vérifications de version
        if (data.metadata?.version === '2.0') {
          if (!data.sessionId || !data.containerId) {
            validation.issues.push('Données v2.0 incomplètes (session/conteneur manquant)');
          }
        }

        // Vérifications HTML
        if (data.html) {
          try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.html;
            const table = tempDiv.querySelector('table');
            if (!table) {
              validation.issues.push('HTML ne contient pas de table valide');
            }
          } catch (htmlError) {
            validation.issues.push('HTML malformé');
          }
        }

        // Déterminer la validité globale
        if (validation.issues.length > 0) {
          validation.isValid = false;
          validation.reason = `${validation.issues.length} problème(s) détecté(s)`;
        }

        return validation;

      } catch (error) {
        validation.isValid = false;
        validation.reason = `Erreur validation: ${error.message}`;
        validation.issues.push(error.message);
        return validation;
      }
    }

    /**
     * Nettoyer les données orphelines de manière sécurisée
     */
    cleanupOrphanedData(orphanedData = null, options = {}) {
      console.log('🧹 Début nettoyage des données orphelines...');

      const defaultOptions = {
        removeCorrupted: true,
        removeDuplicates: true,
        removeInvalidSessions: false, // Plus conservateur par défaut
        removeMissingContainers: false,
        removeInconsistentData: false,
        createBackup: true,
        dryRun: false
      };

      const cleanupOptions = { ...defaultOptions, ...options };

      // Détecter les données orphelines si non fournies
      if (!orphanedData) {
        orphanedData = this.detectOrphanedData();
      }

      const cleanupResults = {
        removed: 0,
        backed_up: 0,
        errors: 0,
        details: {
          corruptedRemoved: 0,
          duplicatesRemoved: 0,
          invalidSessionsRemoved: 0,
          missingContainersRemoved: 0,
          inconsistentDataRemoved: 0
        },
        backupKeys: []
      };

      try {
        // Phase 1: Créer des sauvegardes si demandé
        if (cleanupOptions.createBackup && !cleanupOptions.dryRun) {
          this.createOrphanedDataBackup(orphanedData, cleanupResults);
        }

        // Phase 2: Nettoyer les données corrompues
        if (cleanupOptions.removeCorrupted) {
          this.cleanupCorruptedData(orphanedData.corruptedData, cleanupResults, cleanupOptions.dryRun);
        }

        // Phase 3: Nettoyer les doublons
        if (cleanupOptions.removeDuplicates) {
          this.cleanupDuplicateData(orphanedData.duplicateIds, cleanupResults, cleanupOptions.dryRun);
        }

        // Phase 4: Nettoyer les sessions invalides (optionnel)
        if (cleanupOptions.removeInvalidSessions) {
          this.cleanupInvalidSessionData(orphanedData.invalidSessions, cleanupResults, cleanupOptions.dryRun);
        }

        // Phase 5: Nettoyer les conteneurs manquants (optionnel)
        if (cleanupOptions.removeMissingContainers) {
          this.cleanupMissingContainerData(orphanedData.missingContainers, cleanupResults, cleanupOptions.dryRun);
        }

        // Phase 6: Nettoyer les données incohérentes (optionnel)
        if (cleanupOptions.removeInconsistentData) {
          this.cleanupInconsistentData(orphanedData.inconsistentData, cleanupResults, cleanupOptions.dryRun);
        }

        const action = cleanupOptions.dryRun ? 'Simulation' : 'Nettoyage';
        console.log(`✅ ${action} terminé: ${cleanupResults.removed} supprimées, ${cleanupResults.backed_up} sauvegardées`);
        console.log(`📊 Détails:`, cleanupResults.details);

        return cleanupResults;

      } catch (error) {
        console.error('❌ Erreur nettoyage données orphelines:', error);
        cleanupResults.errors++;
        return cleanupResults;
      }
    }

    /**
     * Créer une sauvegarde des données orphelines avant suppression
     */
    createOrphanedDataBackup(orphanedData, cleanupResults) {
      try {
        const backupTimestamp = Date.now();
        const backupPrefix = `orphaned_backup_${backupTimestamp}_`;

        // Sauvegarder chaque type de données orphelines
        const dataTypes = ['corruptedData', 'duplicateIds', 'invalidSessions', 'missingContainers', 'inconsistentData'];

        dataTypes.forEach(dataType => {
          if (orphanedData[dataType] && orphanedData[dataType].length > 0) {
            const backupKey = `${backupPrefix}${dataType}`;
            const backupData = {
              type: dataType,
              timestamp: backupTimestamp,
              count: orphanedData[dataType].length,
              data: orphanedData[dataType]
            };

            localStorage.setItem(backupKey, JSON.stringify(backupData));
            cleanupResults.backupKeys.push(backupKey);
            cleanupResults.backed_up++;
          }
        });

        console.log(`💾 Sauvegarde orphelines créée: ${cleanupResults.backupKeys.length} fichier(s)`);

      } catch (error) {
        console.error('❌ Erreur création sauvegarde orphelines:', error);
        cleanupResults.errors++;
      }
    }

    /**
     * Nettoyer les données corrompues
     */
    cleanupCorruptedData(corruptedData, cleanupResults, dryRun) {
      corruptedData.forEach(item => {
        if (!dryRun) {
          localStorage.removeItem(item.key);
        }
        cleanupResults.removed++;
        cleanupResults.details.corruptedRemoved++;
        console.log(`🗑️ ${dryRun ? '[DRY RUN] ' : ''}Données corrompues supprimées: ${item.key}`);
      });
    }

    /**
     * Nettoyer les données dupliquées
     */
    cleanupDuplicateData(duplicateData, cleanupResults, dryRun) {
      // Garder seulement la version la plus récente de chaque doublon
      const duplicateGroups = new Map();

      duplicateData.forEach(item => {
        const tableId = item.tableId;
        if (!duplicateGroups.has(tableId)) {
          duplicateGroups.set(tableId, []);
        }
        duplicateGroups.get(tableId).push(item);
      });

      duplicateGroups.forEach((duplicates, tableId) => {
        if (duplicates.length > 1) {
          // Trier par timestamp décroissant
          duplicates.sort((a, b) => b.timestamp - a.timestamp);

          // Supprimer tous sauf le plus récent
          const toDelete = duplicates.slice(1);
          toDelete.forEach(item => {
            if (!dryRun) {
              localStorage.removeItem(item.key);
            }
            cleanupResults.removed++;
            cleanupResults.details.duplicatesRemoved++;
            console.log(`🗑️ ${dryRun ? '[DRY RUN] ' : ''}Doublon supprimé: ${item.key}`);
          });
        }
      });
    }

    /**
     * Nettoyer les données de sessions invalides
     */
    cleanupInvalidSessionData(invalidSessionData, cleanupResults, dryRun) {
      invalidSessionData.forEach(item => {
        if (!dryRun) {
          localStorage.removeItem(item.key);
        }
        cleanupResults.removed++;
        cleanupResults.details.invalidSessionsRemoved++;
        console.log(`🗑️ ${dryRun ? '[DRY RUN] ' : ''}Session invalide supprimée: ${item.key} (${item.reason})`);
      });
    }

    /**
     * Nettoyer les données de conteneurs manquants
     */
    cleanupMissingContainerData(missingContainerData, cleanupResults, dryRun) {
      missingContainerData.forEach(item => {
        if (!dryRun) {
          localStorage.removeItem(item.key);
        }
        cleanupResults.removed++;
        cleanupResults.details.missingContainersRemoved++;
        console.log(`🗑️ ${dryRun ? '[DRY RUN] ' : ''}Conteneur manquant supprimé: ${item.key} (${item.reason})`);
      });
    }

    /**
     * Nettoyer les données incohérentes
     */
    cleanupInconsistentData(inconsistentData, cleanupResults, dryRun) {
      inconsistentData.forEach(item => {
        if (!dryRun) {
          localStorage.removeItem(item.key);
        }
        cleanupResults.removed++;
        cleanupResults.details.inconsistentDataRemoved++;
        console.log(`🗑️ ${dryRun ? '[DRY RUN] ' : ''}Données incohérentes supprimées: ${item.key} (${item.reason})`);
      });
    }

    // ============================================
    // DIAGNOSTIC ET TROUBLESHOOTING TOOLS
    // ============================================

    /**
     * Analyser les conflits d'identification de tables
     */
    debugTableIdentification(table = null) {
      console.log('🔍 === DIAGNOSTIC D\'IDENTIFICATION DE TABLE ===');

      const diagnosticResults = {
        timestamp: Date.now(),
        targetTable: null,
        allTables: [],
        conflicts: [],
        sessionAnalysis: null,
        containerAnalysis: null,
        recommendations: []
      };

      try {
        // Analyser une table spécifique ou toutes les tables
        const tablesToAnalyze = table ? [table] : Array.from(document.querySelectorAll('table'));

        console.log(`📊 Analyse de ${tablesToAnalyze.length} table(s)...`);

        // Analyse de session
        diagnosticResults.sessionAnalysis = this.analyzeSessionContext();

        // Analyse de conteneurs
        diagnosticResults.containerAnalysis = this.analyzeContainerContext();

        // Analyser chaque table
        tablesToAnalyze.forEach((currentTable, index) => {
          const tableAnalysis = this.analyzeTableIdentification(currentTable, index);
          diagnosticResults.allTables.push(tableAnalysis);

          if (table && currentTable === table) {
            diagnosticResults.targetTable = tableAnalysis;
          }
        });

        // Détecter les conflits
        diagnosticResults.conflicts = this.detectIdentificationConflicts(diagnosticResults.allTables);

        // Générer des recommandations
        diagnosticResults.recommendations = this.generateIdentificationRecommendations(diagnosticResults);

        // Afficher les résultats
        this.displayIdentificationDiagnostic(diagnosticResults);

        return diagnosticResults;

      } catch (error) {
        console.error('❌ Erreur diagnostic identification:', error);
        diagnosticResults.error = error.message;
        return diagnosticResults;
      }
    }

    /**
     * Analyser le contexte de session pour le diagnostic
     */
    analyzeSessionContext() {
      const sessionContext = this.contextManager.getCurrentSessionContext();
      const analysis = {
        detected: !!sessionContext,
        sessionId: sessionContext ? sessionContext.sessionId : null,
        detectionMethod: sessionContext ? sessionContext.detectionMethod : null,
        isTemporary: sessionContext ? sessionContext.isTemporary : null,
        isValid: sessionContext ? sessionContext.isValid : false,
        age: sessionContext ? Date.now() - sessionContext.startTime : null,
        lastActivity: sessionContext ? Date.now() - sessionContext.lastActivity : null,
        issues: []
      };

      // Identifier les problèmes de session
      if (!analysis.detected) {
        analysis.issues.push('Aucune session détectée');
      } else {
        if (analysis.isTemporary) {
          analysis.issues.push('Session temporaire (peut causer des conflits)');
        }
        if (!analysis.isValid) {
          analysis.issues.push('Session invalide ou expirée');
        }
        if (analysis.lastActivity > 30 * 60 * 1000) { // 30 minutes
          analysis.issues.push('Session inactive depuis plus de 30 minutes');
        }
      }

      return analysis;
    }

    /**
     * Analyser le contexte des conteneurs pour le diagnostic
     */
    analyzeContainerContext() {
      const containerStats = this.containerManager.getContainerStats();
      const allContainers = this.containerManager.getAllContainers();

      const analysis = {
        containerCount: containerStats.containerCount,
        totalTables: containerStats.totalTables,
        averageTablesPerContainer: containerStats.averageTablesPerContainer,
        monitoringActive: containerStats.monitoringActive,
        containers: [],
        issues: []
      };

      // Analyser chaque conteneur
      allContainers.forEach(container => {
        const containerAnalysis = {
          id: container.id,
          tableCount: container.tableCount,
          age: Date.now() - container.createdAt,
          lastAccessed: Date.now() - container.lastAccessed,
          contentHash: container.contentHash,
          isStale: !document.contains(container.element),
          issues: []
        };

        // Identifier les problèmes de conteneur
        if (containerAnalysis.isStale) {
          containerAnalysis.issues.push('Conteneur non présent dans le DOM');
        }
        if (containerAnalysis.tableCount === 0) {
          containerAnalysis.issues.push('Conteneur sans tables');
        }
        if (containerAnalysis.lastAccessed > 60 * 60 * 1000) { // 1 heure
          containerAnalysis.issues.push('Conteneur non accédé depuis plus d\'1 heure');
        }

        analysis.containers.push(containerAnalysis);
      });

      // Identifier les problèmes globaux
      if (analysis.containerCount === 0) {
        analysis.issues.push('Aucun conteneur détecté');
      }
      if (!analysis.monitoringActive) {
        analysis.issues.push('Surveillance des conteneurs inactive');
      }

      const staleContainers = analysis.containers.filter(c => c.isStale).length;
      if (staleContainers > 0) {
        analysis.issues.push(`${staleContainers} conteneur(s) obsolète(s) détecté(s)`);
      }

      return analysis;
    }

    /**
     * Analyser l'identification d'une table spécifique
     */
    analyzeTableIdentification(table, index) {
      const analysis = {
        index: index,
        element: table,
        ids: {
          legacy: null,
          robust: null,
          current: null
        },
        structure: {
          rowCount: 0,
          colCount: 0,
          hasHeaders: false
        },
        context: {
          sessionId: null,
          containerId: null,
          position: null
        },
        hashes: {
          content: null,
          container: null
        },
        issues: [],
        inDOM: document.contains(table)
      };

      try {
        // Analyser les IDs
        analysis.ids.legacy = table.getAttribute('data-menu-table-id');
        analysis.ids.robust = table.getAttribute('data-robust-table-id');
        analysis.ids.current = this.getTableId(table);

        // Analyser la structure
        const rows = table.querySelectorAll('tr');
        analysis.structure.rowCount = rows.length;
        analysis.structure.colCount = rows[0] ? rows[0].children.length : 0;
        analysis.structure.hasHeaders = this.detectTableHeaders(table);

        // Analyser le contexte
        const sessionContext = this.contextManager.getCurrentSessionContext();
        analysis.context.sessionId = sessionContext ? sessionContext.sessionId : null;
        analysis.context.containerId = this.containerManager.getOrCreateContainerId(table);
        analysis.context.position = this.getTablePositionInContainer(table, analysis.context.containerId);

        // Analyser les hashes
        analysis.hashes.content = this.generateContentHash(table);
        const containerInfo = this.containerManager.getContainerInfo(analysis.context.containerId);
        analysis.hashes.container = containerInfo ? containerInfo.contentHash : null;

        // Identifier les problèmes
        if (!analysis.inDOM) {
          analysis.issues.push('Table non présente dans le DOM');
        }
        if (!analysis.ids.current) {
          analysis.issues.push('Impossible de générer un ID pour la table');
        }
        if (analysis.structure.rowCount === 0) {
          analysis.issues.push('Table sans lignes');
        }
        if (analysis.structure.colCount === 0) {
          analysis.issues.push('Table sans colonnes');
        }
        if (analysis.context.containerId === 'no-container') {
          analysis.issues.push('Table sans conteneur identifiable');
        }
        if (!analysis.context.sessionId) {
          analysis.issues.push('Aucune session détectée pour la table');
        }

        // Vérifier la cohérence des IDs
        if (analysis.ids.legacy && analysis.ids.robust && analysis.ids.legacy !== analysis.ids.robust) {
          analysis.issues.push('Incohérence entre ID legacy et robuste');
        }

      } catch (error) {
        analysis.issues.push(`Erreur analyse: ${error.message}`);
      }

      return analysis;
    }

    /**
     * Détecter les conflits d'identification entre tables
     */
    detectIdentificationConflicts(tableAnalyses) {
      const conflicts = [];
      const idMap = new Map();
      const hashMap = new Map();
      const positionMap = new Map();

      // Grouper les tables par différents critères
      tableAnalyses.forEach((analysis, index) => {
        // Conflits d'ID
        if (analysis.ids.current) {
          if (!idMap.has(analysis.ids.current)) {
            idMap.set(analysis.ids.current, []);
          }
          idMap.get(analysis.ids.current).push({ index, analysis });
        }

        // Conflits de hash de contenu
        if (analysis.hashes.content) {
          if (!hashMap.has(analysis.hashes.content)) {
            hashMap.set(analysis.hashes.content, []);
          }
          hashMap.get(analysis.hashes.content).push({ index, analysis });
        }

        // Conflits de position dans conteneur
        const positionKey = `${analysis.context.containerId}_${analysis.context.position}`;
        if (!positionMap.has(positionKey)) {
          positionMap.set(positionKey, []);
        }
        positionMap.get(positionKey).push({ index, analysis });
      });

      // Identifier les conflits d'ID
      idMap.forEach((tables, id) => {
        if (tables.length > 1) {
          conflicts.push({
            type: 'duplicate_id',
            severity: 'high',
            id: id,
            tables: tables,
            description: `${tables.length} tables partagent le même ID: ${id.substring(0, 50)}...`
          });
        }
      });

      // Identifier les conflits de hash (tables similaires)
      hashMap.forEach((tables, hash) => {
        if (tables.length > 1) {
          conflicts.push({
            type: 'similar_content',
            severity: 'medium',
            hash: hash,
            tables: tables,
            description: `${tables.length} tables ont un contenu similaire (hash: ${hash})`
          });
        }
      });

      // Identifier les conflits de position
      positionMap.forEach((tables, positionKey) => {
        if (tables.length > 1) {
          conflicts.push({
            type: 'position_conflict',
            severity: 'low',
            positionKey: positionKey,
            tables: tables,
            description: `${tables.length} tables à la même position: ${positionKey}`
          });
        }
      });

      return conflicts;
    }

    /**
     * Générer des recommandations basées sur le diagnostic
     */
    generateIdentificationRecommendations(diagnosticResults) {
      const recommendations = [];

      // Recommandations de session
      if (diagnosticResults.sessionAnalysis.issues.length > 0) {
        recommendations.push({
          category: 'session',
          priority: 'high',
          title: 'Problèmes de session détectés',
          actions: [
            'Rafraîchir la détection de session: contextManager.refreshSession()',
            'Vérifier la configuration de session dans l\'application',
            'Considérer la génération d\'une nouvelle session temporaire'
          ]
        });
      }

      // Recommandations de conteneurs
      if (diagnosticResults.containerAnalysis.issues.length > 0) {
        recommendations.push({
          category: 'containers',
          priority: 'medium',
          title: 'Problèmes de conteneurs détectés',
          actions: [
            'Nettoyer les conteneurs obsolètes: containerManager.cleanupStaleContainers()',
            'Redémarrer la surveillance: containerManager.startContainerChangeMonitoring()',
            'Vérifier les sélecteurs de conteneurs dans la configuration'
          ]
        });
      }

      // Recommandations de conflits
      const highSeverityConflicts = diagnosticResults.conflicts.filter(c => c.severity === 'high');
      if (highSeverityConflicts.length > 0) {
        recommendations.push({
          category: 'conflicts',
          priority: 'critical',
          title: `${highSeverityConflicts.length} conflit(s) critique(s) détecté(s)`,
          actions: [
            'Régénérer les IDs des tables en conflit',
            'Vérifier l\'unicité des sessions et conteneurs',
            'Considérer une migration manuelle des données conflictuelles'
          ]
        });
      }

      // Recommandations générales
      const tablesWithIssues = diagnosticResults.allTables.filter(t => t.issues.length > 0);
      if (tablesWithIssues.length > 0) {
        recommendations.push({
          category: 'general',
          priority: 'medium',
          title: `${tablesWithIssues.length} table(s) avec des problèmes`,
          actions: [
            'Exécuter une validation complète: validateStorageIntegrity()',
            'Nettoyer les données orphelines: cleanupOrphanedData()',
            'Considérer une re-initialisation du système de stockage'
          ]
        });
      }

      return recommendations;
    }

    /**
     * Afficher les résultats du diagnostic d'identification
     */
    displayIdentificationDiagnostic(diagnosticResults) {
      console.log('\n📊 === RÉSULTATS DU DIAGNOSTIC ===');

      // Session
      console.log('\n🔐 ANALYSE DE SESSION:');
      const session = diagnosticResults.sessionAnalysis;
      console.log(`  Session détectée: ${session.detected ? '✅' : '❌'}`);
      if (session.detected) {
        console.log(`  ID: ${session.sessionId?.substring(0, 30)}...`);
        console.log(`  Méthode: ${session.detectionMethod}`);
        console.log(`  Temporaire: ${session.isTemporary ? '⚠️' : '✅'}`);
        console.log(`  Valide: ${session.isValid ? '✅' : '❌'}`);
      }
      if (session.issues.length > 0) {
        console.log('  ⚠️ Problèmes:');
        session.issues.forEach(issue => console.log(`    - ${issue}`));
      }

      // Conteneurs
      console.log('\n📦 ANALYSE DES CONTENEURS:');
      const containers = diagnosticResults.containerAnalysis;
      console.log(`  Conteneurs actifs: ${containers.containerCount}`);
      console.log(`  Tables totales: ${containers.totalTables}`);
      console.log(`  Surveillance: ${containers.monitoringActive ? '✅' : '❌'}`);
      if (containers.issues.length > 0) {
        console.log('  ⚠️ Problèmes:');
        containers.issues.forEach(issue => console.log(`    - ${issue}`));
      }

      // Tables
      console.log('\n📋 ANALYSE DES TABLES:');
      console.log(`  Tables analysées: ${diagnosticResults.allTables.length}`);
      const tablesWithIssues = diagnosticResults.allTables.filter(t => t.issues.length > 0);
      console.log(`  Tables avec problèmes: ${tablesWithIssues.length}`);

      if (tablesWithIssues.length > 0) {
        console.log('  ⚠️ Détails des problèmes:');
        tablesWithIssues.forEach((table, index) => {
          console.log(`    Table ${index + 1}:`);
          table.issues.forEach(issue => console.log(`      - ${issue}`));
        });
      }

      // Conflits
      console.log('\n⚔️ CONFLITS DÉTECTÉS:');
      if (diagnosticResults.conflicts.length === 0) {
        console.log('  ✅ Aucun conflit détecté');
      } else {
        diagnosticResults.conflicts.forEach(conflict => {
          const severity = conflict.severity === 'high' ? '🔴' :
            conflict.severity === 'medium' ? '🟡' : '🟢';
          console.log(`  ${severity} ${conflict.description}`);
        });
      }

      // Recommandations
      console.log('\n💡 RECOMMANDATIONS:');
      if (diagnosticResults.recommendations.length === 0) {
        console.log('  ✅ Aucune action requise');
      } else {
        diagnosticResults.recommendations.forEach(rec => {
          const priority = rec.priority === 'critical' ? '🔴' :
            rec.priority === 'high' ? '🟡' : '🟢';
          console.log(`  ${priority} ${rec.title}:`);
          rec.actions.forEach(action => console.log(`    - ${action}`));
        });
      }

      console.log('\n=== FIN DU DIAGNOSTIC ===\n');
    }

    /**
     * Valider l'intégrité complète du système de stockage
     */
    validateStorageIntegrity() {
      console.log('🔍 === VALIDATION DE L\'INTÉGRITÉ DU STOCKAGE ===');

      const validation = {
        timestamp: Date.now(),
        overall: {
          isValid: true,
          score: 0,
          maxScore: 0
        },
        categories: {
          dataConsistency: null,
          sessionIntegrity: null,
          containerMapping: null,
          migrationStatus: null,
          storageHealth: null
        },
        issues: [],
        warnings: [],
        recommendations: [],
        statistics: null
      };

      try {
        // 1. Validation de la cohérence des données
        validation.categories.dataConsistency = this.validateDataConsistency();

        // 2. Validation de l'intégrité des sessions
        validation.categories.sessionIntegrity = this.validateSessionIntegrity();

        // 3. Validation du mapping des conteneurs
        validation.categories.containerMapping = this.validateContainerMapping();

        // 4. Validation du statut de migration
        validation.categories.migrationStatus = this.validateMigrationStatus();

        // 5. Validation de la santé du stockage
        validation.categories.storageHealth = this.validateStorageHealth();

        // Calculer le score global
        this.calculateIntegrityScore(validation);

        // Générer les recommandations
        validation.recommendations = this.generateIntegrityRecommendations(validation);

        // Afficher les résultats
        this.displayIntegrityValidation(validation);

        return validation;

      } catch (error) {
        console.error('❌ Erreur validation intégrité:', error);
        validation.overall.isValid = false;
        validation.issues.push(`Erreur critique: ${error.message}`);
        return validation;
      }
    }

    /**
     * Valider la cohérence des données stockées
     */
    validateDataConsistency() {
      const validation = {
        name: 'Cohérence des données',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: {
          totalEntries: 0,
          validEntries: 0,
          invalidEntries: 0,
          corruptedEntries: 0
        }
      };

      try {
        // Analyser toutes les entrées de stockage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            validation.statistics.totalEntries++;

            try {
              const data = JSON.parse(localStorage.getItem(key));
              const entryValidation = this.validateStorageEntry(key, data);

              if (entryValidation.isValid) {
                validation.statistics.validEntries++;
              } else {
                validation.statistics.invalidEntries++;
                validation.issues.push(`Entrée invalide: ${key} - ${entryValidation.reason}`);
              }

            } catch (parseError) {
              validation.statistics.corruptedEntries++;
              validation.issues.push(`Données corrompues: ${key}`);
            }
          }
        }

        // Effectuer les vérifications
        validation.checks = [
          {
            name: 'Données parsables',
            passed: validation.statistics.corruptedEntries === 0,
            details: `${validation.statistics.corruptedEntries} entrée(s) corrompue(s)`
          },
          {
            name: 'Structure des données',
            passed: validation.statistics.invalidEntries < validation.statistics.totalEntries * 0.1,
            details: `${validation.statistics.invalidEntries}/${validation.statistics.totalEntries} entrée(s) invalide(s)`
          },
          {
            name: 'Cohérence des IDs',
            passed: this.validateIdConsistency(),
            details: 'Vérification de l\'unicité des identifiants'
          }
        ];

        // Calculer le score
        const passedChecks = validation.checks.filter(c => c.passed).length;
        validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
        validation.isValid = validation.score >= 80; // 80% minimum

      } catch (error) {
        validation.isValid = false;
        validation.issues.push(`Erreur validation cohérence: ${error.message}`);
      }

      return validation;
    }

    /**
     * Valider l'intégrité des sessions
     */
    validateSessionIntegrity() {
      const validation = {
        name: 'Intégrité des sessions',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: {
          activeSessions: 0,
          expiredSessions: 0,
          temporarySessions: 0,
          invalidSessions: 0
        }
      };

      try {
        const sessionContext = this.contextManager.getCurrentSessionContext();
        const activeSessionIds = this.getActiveSessionIds();

        validation.statistics.activeSessions = activeSessionIds.length;

        // Analyser les sessions dans les données stockées
        const sessionIds = new Set();
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (data.sessionId) {
                sessionIds.add(data.sessionId);

                if (data.sessionId.startsWith('temp_')) {
                  validation.statistics.temporarySessions++;
                }

                if (!this.contextManager.validateSessionId(data.sessionId)) {
                  validation.statistics.invalidSessions++;
                }
              }
            } catch (error) {
              // Ignorer les données corrompues
            }
          }
        }

        // Effectuer les vérifications
        validation.checks = [
          {
            name: 'Session courante détectée',
            passed: !!sessionContext,
            details: sessionContext ? `Session: ${sessionContext.sessionId.substring(0, 20)}...` : 'Aucune session'
          },
          {
            name: 'Session courante valide',
            passed: sessionContext ? sessionContext.isValid : false,
            details: sessionContext ? (sessionContext.isValid ? 'Valide' : 'Invalide/Expirée') : 'N/A'
          },
          {
            name: 'Sessions actives cohérentes',
            passed: validation.statistics.activeSessions > 0,
            details: `${validation.statistics.activeSessions} session(s) active(s)`
          },
          {
            name: 'Proportion de sessions temporaires acceptable',
            passed: validation.statistics.temporarySessions < sessionIds.size * 0.5,
            details: `${validation.statistics.temporarySessions}/${sessionIds.size} temporaire(s)`
          }
        ];

        // Calculer le score
        const passedChecks = validation.checks.filter(c => c.passed).length;
        validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
        validation.isValid = validation.score >= 75; // 75% minimum

      } catch (error) {
        validation.isValid = false;
        validation.issues.push(`Erreur validation sessions: ${error.message}`);
      }

      return validation;
    }

    /**
     * Valider le mapping des conteneurs
     */
    validateContainerMapping() {
      const validation = {
        name: 'Mapping des conteneurs',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: {
          totalContainers: 0,
          activeContainers: 0,
          staleContainers: 0,
          orphanedTables: 0
        }
      };

      try {
        const allContainers = this.containerManager.getAllContainers();
        validation.statistics.totalContainers = allContainers.length;

        // Analyser chaque conteneur
        allContainers.forEach(container => {
          if (document.contains(container.element)) {
            validation.statistics.activeContainers++;
          } else {
            validation.statistics.staleContainers++;
          }
        });

        // Vérifier les tables orphelines (sans conteneur valide)
        const allTables = document.querySelectorAll('table');
        allTables.forEach(table => {
          const containerId = this.containerManager.getOrCreateContainerId(table);
          if (containerId === 'no-container') {
            validation.statistics.orphanedTables++;
          }
        });

        // Effectuer les vérifications
        validation.checks = [
          {
            name: 'Conteneurs détectés',
            passed: validation.statistics.totalContainers > 0,
            details: `${validation.statistics.totalContainers} conteneur(s) total`
          },
          {
            name: 'Conteneurs actifs dans le DOM',
            passed: validation.statistics.staleContainers < validation.statistics.totalContainers * 0.2,
            details: `${validation.statistics.activeContainers} actif(s), ${validation.statistics.staleContainers} obsolète(s)`
          },
          {
            name: 'Tables sans conteneur orphelines',
            passed: validation.statistics.orphanedTables === 0,
            details: `${validation.statistics.orphanedTables} table(s) orpheline(s)`
          },
          {
            name: 'Surveillance des conteneurs',
            passed: this.containerManager.getContainerStats().monitoringActive,
            details: 'Surveillance automatique des changements'
          }
        ];

        // Calculer le score
        const passedChecks = validation.checks.filter(c => c.passed).length;
        validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
        validation.isValid = validation.score >= 70; // 70% minimum

      } catch (error) {
        validation.isValid = false;
        validation.issues.push(`Erreur validation conteneurs: ${error.message}`);
      }

      return validation;
    }

    /**
     * Valider le statut de migration
     */
    validateMigrationStatus() {
      const validation = {
        name: 'Statut de migration',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: null
      };

      try {
        const migrationStats = this.migrationManager.getMigrationStats();
        const migrationReport = this.migrationManager.getMigrationReport();

        validation.statistics = migrationStats;

        // Effectuer les vérifications
        validation.checks = [
          {
            name: 'Migration exécutée',
            passed: migrationStats.totalFound >= 0,
            details: `${migrationStats.totalFound} entrée(s) legacy analysée(s)`
          },
          {
            name: 'Taux de succès de migration',
            passed: migrationStats.totalFound === 0 || (migrationStats.migrated / migrationStats.totalFound) >= 0.9,
            details: `${migrationStats.migrated}/${migrationStats.totalFound} migrée(s) avec succès`
          },
          {
            name: 'Erreurs de migration minimales',
            passed: migrationStats.errors <= migrationStats.totalFound * 0.1,
            details: `${migrationStats.errors} erreur(s) de migration`
          },
          {
            name: 'Données de récupération gérées',
            passed: migrationStats.recoveryCount === 0 || migrationStats.recoveryCount <= 5,
            details: `${migrationStats.recoveryCount} donnée(s) en récupération`
          }
        ];

        // Calculer le score
        const passedChecks = validation.checks.filter(c => c.passed).length;
        validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
        validation.isValid = validation.score >= 80; // 80% minimum

      } catch (error) {
        validation.isValid = false;
        validation.issues.push(`Erreur validation migration: ${error.message}`);
      }

      return validation;
    }

    /**
     * Valider la santé du stockage
     */
    validateStorageHealth() {
      const validation = {
        name: 'Santé du stockage',
        isValid: true,
        score: 0,
        maxScore: 100,
        checks: [],
        issues: [],
        statistics: null
      };

      try {
        const storageStats = this.getStorageStatsWithSession();
        validation.statistics = storageStats;

        // Effectuer les vérifications
        validation.checks = [
          {
            name: 'Quota de stockage acceptable',
            passed: storageStats.quotaUsageRatio < 0.9,
            details: `${(storageStats.quotaUsageRatio * 100).toFixed(1)}% du quota utilisé`
          },
          {
            name: 'Données récentes présentes',
            passed: storageStats.recentTables > 0,
            details: `${storageStats.recentTables} table(s) récente(s)`
          },
          {
            name: 'Distribution des sessions équilibrée',
            passed: storageStats.sessionCount > 0 && storageStats.sessionCount <= 10,
            details: `${storageStats.sessionCount} session(s) avec données`
          },
          {
            name: 'Taille moyenne des tables raisonnable',
            passed: storageStats.averageTableSize < 50000, // 50KB par table
            details: `${Math.round(storageStats.averageTableSize)} bytes en moyenne`
          }
        ];

        // Calculer le score
        const passedChecks = validation.checks.filter(c => c.passed).length;
        validation.score = Math.round((passedChecks / validation.checks.length) * validation.maxScore);
        validation.isValid = validation.score >= 75; // 75% minimum

      } catch (error) {
        validation.isValid = false;
        validation.issues.push(`Erreur validation santé stockage: ${error.message}`);
      }

      return validation;
    }

    /**
     * Calculer le score global d'intégrité
     */
    calculateIntegrityScore(validation) {
      let totalScore = 0;
      let totalMaxScore = 0;
      let validCategories = 0;

      Object.values(validation.categories).forEach(category => {
        if (category && typeof category.score === 'number') {
          totalScore += category.score;
          totalMaxScore += category.maxScore;
          validCategories++;

          if (!category.isValid) {
            validation.overall.isValid = false;
          }

          // Collecter les problèmes
          if (category.issues && category.issues.length > 0) {
            validation.issues.push(...category.issues);
          }
        }
      });

      validation.overall.score = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
      validation.overall.maxScore = 100;

      // Critères de validation globale
      if (validation.overall.score < 70) {
        validation.overall.isValid = false;
      }
    }

    /**
     * Générer des recommandations basées sur la validation d'intégrité
     */
    generateIntegrityRecommendations(validation) {
      const recommendations = [];

      // Recommandations par catégorie
      Object.entries(validation.categories).forEach(([categoryName, category]) => {
        if (category && !category.isValid) {
          const priority = category.score < 50 ? 'critical' : category.score < 70 ? 'high' : 'medium';

          recommendations.push({
            category: categoryName,
            priority: priority,
            title: `${category.name} nécessite une attention`,
            score: category.score,
            actions: this.getRecommendationActions(categoryName, category)
          });
        }
      });

      // Recommandations globales
      if (validation.overall.score < 70) {
        recommendations.unshift({
          category: 'global',
          priority: 'critical',
          title: 'Intégrité globale compromise',
          score: validation.overall.score,
          actions: [
            'Exécuter un diagnostic complet: debugTableIdentification()',
            'Nettoyer les données orphelines: cleanupOrphanedData()',
            'Considérer une réinitialisation du système de stockage',
            'Vérifier la configuration des gestionnaires de session et conteneurs'
          ]
        });
      }

      return recommendations;
    }

    /**
     * Obtenir les actions recommandées pour une catégorie
     */
    getRecommendationActions(categoryName, category) {
      const actions = [];

      switch (categoryName) {
        case 'dataConsistency':
          actions.push('Nettoyer les données corrompues');
          actions.push('Valider et corriger les IDs dupliqués');
          actions.push('Exécuter une migration complète des données');
          break;

        case 'sessionIntegrity':
          actions.push('Rafraîchir la détection de session');
          actions.push('Nettoyer les sessions expirées');
          actions.push('Vérifier la configuration de session');
          break;

        case 'containerMapping':
          actions.push('Nettoyer les conteneurs obsolètes');
          actions.push('Redémarrer la surveillance des conteneurs');
          actions.push('Réassigner les tables orphelines');
          break;

        case 'migrationStatus':
          actions.push('Relancer la migration des données legacy');
          actions.push('Examiner les données de récupération');
          actions.push('Corriger les erreurs de migration');
          break;

        case 'storageHealth':
          actions.push('Nettoyer les anciennes données');
          actions.push('Optimiser l\'utilisation du quota');
          actions.push('Surveiller la croissance du stockage');
          break;

        default:
          actions.push('Consulter la documentation pour des actions spécifiques');
      }

      return actions;
    }

    /**
     * Afficher les résultats de la validation d'intégrité
     */
    displayIntegrityValidation(validation) {
      console.log('\n🔍 === VALIDATION DE L\'INTÉGRITÉ DU STOCKAGE ===');

      // Score global
      const scoreColor = validation.overall.score >= 80 ? '🟢' :
        validation.overall.score >= 60 ? '🟡' : '🔴';
      console.log(`\n${scoreColor} SCORE GLOBAL: ${validation.overall.score}/100`);
      console.log(`   Statut: ${validation.overall.isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);

      // Détails par catégorie
      console.log('\n📊 DÉTAILS PAR CATÉGORIE:');
      Object.entries(validation.categories).forEach(([name, category]) => {
        if (category) {
          const categoryColor = category.score >= 80 ? '🟢' :
            category.score >= 60 ? '🟡' : '🔴';
          console.log(`\n  ${categoryColor} ${category.name}: ${category.score}/100`);

          category.checks.forEach(check => {
            const checkIcon = check.passed ? '✅' : '❌';
            console.log(`    ${checkIcon} ${check.name}: ${check.details}`);
          });

          if (category.issues.length > 0) {
            console.log('    ⚠️ Problèmes:');
            category.issues.slice(0, 3).forEach(issue => {
              console.log(`      - ${issue}`);
            });
            if (category.issues.length > 3) {
              console.log(`      ... et ${category.issues.length - 3} autre(s)`);
            }
          }
        }
      });

      // Recommandations
      console.log('\n💡 RECOMMANDATIONS:');
      if (validation.recommendations.length === 0) {
        console.log('  ✅ Aucune action requise - système en bon état');
      } else {
        validation.recommendations.forEach(rec => {
          const priorityIcon = rec.priority === 'critical' ? '🔴' :
            rec.priority === 'high' ? '🟡' : '🟢';
          console.log(`\n  ${priorityIcon} ${rec.title} (Score: ${rec.score || 'N/A'})`);
          rec.actions.forEach(action => {
            console.log(`    - ${action}`);
          });
        });
      }

      console.log('\n=== FIN DE LA VALIDATION ===\n');
    }

    /**
     * Valider la cohérence des IDs
     */
    validateIdConsistency() {
      try {
        const idMap = new Map();
        let duplicateCount = 0;

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (data.id) {
                if (idMap.has(data.id)) {
                  duplicateCount++;
                } else {
                  idMap.set(data.id, key);
                }
              }
            } catch (error) {
              // Ignorer les données corrompues
            }
          }
        }

        return duplicateCount === 0;
      } catch (error) {
        console.warn('⚠️ Erreur validation cohérence IDs:', error);
        return false;
      }
    }

    /**
     * Valider une entrée de stockage individuelle
     */
    validateStorageEntry(key, data) {
      const validation = {
        isValid: true,
        reason: ''
      };

      try {
        // Vérifications de base
        if (!data.id) {
          validation.isValid = false;
          validation.reason = 'ID manquant';
          return validation;
        }

        if (!data.html || data.html.trim() === '') {
          validation.isValid = false;
          validation.reason = 'HTML manquant';
          return validation;
        }

        if (!data.timestamp || isNaN(data.timestamp)) {
          validation.isValid = false;
          validation.reason = 'Timestamp invalide';
          return validation;
        }

        // Vérifications de cohérence
        if (data.id !== key && !key.includes(data.id)) {
          validation.isValid = false;
          validation.reason = 'Incohérence clé/ID';
          return validation;
        }

        // Vérifications de version
        if (data.metadata?.version === '2.0') {
          if (!data.sessionId || !data.containerId) {
            validation.isValid = false;
            validation.reason = 'Données v2.0 incomplètes';
            return validation;
          }
        }

        return validation;

      } catch (error) {
        validation.isValid = false;
        validation.reason = `Erreur validation: ${error.message}`;
        return validation;
      }
    }
    createOrphanedDataBackup(orphanedData, results) {
      const backupTimestamp = Date.now();
      const backupPrefix = `claraverse_orphan_backup_${backupTimestamp}_`;

      try {
        // Sauvegarder toutes les catégories de données orphelines
        const allOrphanedItems = [
          ...orphanedData.corruptedData,
          ...orphanedData.duplicateIds,
          ...orphanedData.invalidSessions,
          ...orphanedData.missingContainers,
          ...orphanedData.inconsistentData
        ];

        allOrphanedItems.forEach((item, index) => {
          const backupKey = `${backupPrefix}${index}`;
          const backupData = {
            originalKey: item.key,
            category: this.categorizeOrphanedItem(item, orphanedData),
            reason: item.reason || 'Non spécifié',
            timestamp: backupTimestamp,
            originalData: item.data || item.rawData
          };

          localStorage.setItem(backupKey, JSON.stringify(backupData));
          results.backed_up++;
          results.backupKeys.push(backupKey);
        });

        console.log(`💾 ${results.backed_up} éléments sauvegardés avec préfixe: ${backupPrefix}`);

      } catch (error) {
        console.error('❌ Erreur création sauvegarde orphelines:', error);
        results.errors++;
      }
    }

    /**
     * Catégoriser un élément orphelin pour la sauvegarde
     */
    categorizeOrphanedItem(item, orphanedData) {
      if (orphanedData.corruptedData.includes(item)) return 'corrupted';
      if (orphanedData.duplicateIds.includes(item)) return 'duplicate';
      if (orphanedData.invalidSessions.includes(item)) return 'invalid_session';
      if (orphanedData.missingContainers.includes(item)) return 'missing_container';
      if (orphanedData.inconsistentData.includes(item)) return 'inconsistent';
      return 'unknown';
    }

    /**
     * Nettoyer les données corrompues
     */
    cleanupCorruptedData(corruptedItems, results, dryRun) {
      corruptedItems.forEach(item => {
        if (!dryRun) {
          localStorage.removeItem(item.key);
        }
        results.removed++;
        results.details.corruptedRemoved++;
        console.log(`🗑️ ${dryRun ? '[SIMULATION] ' : ''}Données corrompues supprimées: ${item.key}`);
      });
    }

    /**
     * Nettoyer les données dupliquées
     */
    cleanupDuplicateData(duplicateItems, results, dryRun) {
      // Grouper par ID de table pour garder la version la plus récente
      const duplicateGroups = new Map();

      duplicateItems.forEach(item => {
        const tableId = item.tableId;
        if (!duplicateGroups.has(tableId)) {
          duplicateGroups.set(tableId, []);
        }
        duplicateGroups.get(tableId).push(item);
      });

      duplicateGroups.forEach((duplicates, tableId) => {
        // Trier par timestamp décroissant et garder le plus récent
        duplicates.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        const toDelete = duplicates.slice(1); // Supprimer tous sauf le premier (plus récent)

        toDelete.forEach(item => {
          if (!dryRun) {
            localStorage.removeItem(item.key);
          }
          results.removed++;
          results.details.duplicatesRemoved++;
          console.log(`🗑️ ${dryRun ? '[SIMULATION] ' : ''}Doublon supprimé: ${item.key}`);
        });
      });
    }

    /**
     * Nettoyer les données avec sessions invalides
     */
    cleanupInvalidSessionData(invalidItems, results, dryRun) {
      invalidItems.forEach(item => {
        if (!dryRun) {
          localStorage.removeItem(item.key);
        }
        results.removed++;
        results.details.invalidSessionsRemoved++;
        console.log(`🗑️ ${dryRun ? '[SIMULATION] ' : ''}Session invalide supprimée: ${item.key}`);
      });
    }

    /**
     * Nettoyer les données avec conteneurs manquants
     */
    cleanupMissingContainerData(missingItems, results, dryRun) {
      missingItems.forEach(item => {
        if (!dryRun) {
          localStorage.removeItem(item.key);
        }
        results.removed++;
        results.details.missingContainersRemoved++;
        console.log(`🗑️ ${dryRun ? '[SIMULATION] ' : ''}Conteneur manquant supprimé: ${item.key}`);
      });
    }

    /**
     * Nettoyer les données incohérentes
     */
    cleanupInconsistentData(inconsistentItems, results, dryRun) {
      inconsistentItems.forEach(item => {
        if (!dryRun) {
          localStorage.removeItem(item.key);
        }
        results.removed++;
        results.details.inconsistentDataRemoved++;
        console.log(`🗑️ ${dryRun ? '[SIMULATION] ' : ''}Données incohérentes supprimées: ${item.key}`);
      });
    }

    /**
     * Planification automatique du nettoyage
     */
    scheduleAutomaticCleanup(intervalMinutes = 60) {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      this.cleanupInterval = setInterval(() => {
        console.log('⏰ Nettoyage automatique programmé...');

        // Nettoyage conservateur automatique
        const orphanedData = this.detectOrphanedData();

        if (orphanedData.totalOrphaned > 0) {
          const cleanupOptions = {
            removeCorrupted: true,
            removeDuplicates: true,
            removeInvalidSessions: false,
            removeMissingContainers: false,
            removeInconsistentData: false,
            createBackup: true,
            dryRun: false
          };

          const results = this.cleanupOrphanedData(orphanedData, cleanupOptions);

          if (results.removed > 0) {
            console.log(`🧹 Nettoyage automatique: ${results.removed} éléments supprimés`);
            this.emitAutomaticCleanupEvent(results);
          }
        }
      }, intervalMinutes * 60 * 1000);

      console.log(`⏰ Nettoyage automatique programmé toutes les ${intervalMinutes} minutes`);
    }

    /**
     * Émettre un événement de nettoyage automatique
     */
    emitAutomaticCleanupEvent(cleanupResults) {
      const event = new CustomEvent('claraverse:storage:auto_cleanup', {
        detail: {
          cleanupResults,
          timestamp: Date.now(),
          type: 'automatic'
        },
        bubbles: true
      });
      document.dispatchEvent(event);
    }

    /**
     * Valider l'intégrité des données à travers les sessions
     */
    validateDataIntegrityAcrossSessions() {
      console.log('🔍 Validation de l\'intégrité des données inter-sessions...');

      const validation = {
        totalSessions: 0,
        validSessions: 0,
        invalidSessions: 0,
        crossSessionConflicts: [],
        sessionStats: new Map(),
        recommendations: []
      };

      try {
        const sessionData = new Map();

        // Collecter les données par session
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              const sessionId = data.sessionId || 'unknown';

              if (!sessionData.has(sessionId)) {
                sessionData.set(sessionId, {
                  sessionId,
                  tables: [],
                  totalSize: 0,
                  oldestTimestamp: Infinity,
                  newestTimestamp: 0,
                  containers: new Set(),
                  versions: new Set()
                });
              }

              const session = sessionData.get(sessionId);
              session.tables.push({ key, data });
              session.totalSize += JSON.stringify(data).length;
              session.oldestTimestamp = Math.min(session.oldestTimestamp, data.timestamp || 0);
              session.newestTimestamp = Math.max(session.newestTimestamp, data.timestamp || 0);

              if (data.containerId) session.containers.add(data.containerId);
              if (data.metadata?.version) session.versions.add(data.metadata.version);

            } catch (error) {
              // Données corrompues - ignorer pour cette analyse
            }
          }
        }

        validation.totalSessions = sessionData.size;

        // Analyser chaque session
        sessionData.forEach((session, sessionId) => {
          const sessionValidation = this.validateSingleSession(session);
          validation.sessionStats.set(sessionId, sessionValidation);

          if (sessionValidation.isValid) {
            validation.validSessions++;
          } else {
            validation.invalidSessions++;
          }
        });

        // Détecter les conflits inter-sessions
        validation.crossSessionConflicts = this.detectCrossSessionConflicts(sessionData);

        // Générer des recommandations
        validation.recommendations = this.generateIntegrityRecommendations(validation);

        console.log(`✅ Validation terminée: ${validation.validSessions}/${validation.totalSessions} sessions valides`);
        console.log(`⚠️ ${validation.crossSessionConflicts.length} conflit(s) inter-sessions détecté(s)`);

        return validation;

      } catch (error) {
        console.error('❌ Erreur validation intégrité inter-sessions:', error);
        validation.error = error.message;
        return validation;
      }
    }

    /**
     * Valider une session individuelle
     */
    validateSingleSession(session) {
      const validation = {
        sessionId: session.sessionId,
        isValid: true,
        issues: [],
        stats: {
          tableCount: session.tables.length,
          totalSize: session.totalSize,
          containerCount: session.containers.size,
          versionCount: session.versions.size,
          timeSpan: session.newestTimestamp - session.oldestTimestamp
        }
      };

      // Vérifications de cohérence
      if (session.sessionId === 'unknown') {
        validation.issues.push('Session ID manquant');
      }

      if (session.tables.length === 0) {
        validation.issues.push('Aucune table dans la session');
      }

      if (session.versions.size > 1) {
        validation.issues.push(`Versions mixtes: ${Array.from(session.versions).join(', ')}`);
      }

      // Vérifier la cohérence temporelle
      if (validation.stats.timeSpan > 7 * 24 * 60 * 60 * 1000) { // Plus de 7 jours
        validation.issues.push('Session s\'étend sur plus de 7 jours');
      }

      validation.isValid = validation.issues.length === 0;
      return validation;
    }

    /**
     * Détecter les conflits entre sessions
     */
    detectCrossSessionConflicts(sessionData) {
      const conflicts = [];
      const containerUsage = new Map();
      const contentHashes = new Map();

      // Analyser l'utilisation des conteneurs et contenus
      sessionData.forEach((session, sessionId) => {
        session.tables.forEach(({ key, data }) => {
          // Conflits de conteneurs
          if (data.containerId && data.containerId !== 'no-container') {
            if (!containerUsage.has(data.containerId)) {
              containerUsage.set(data.containerId, []);
            }
            containerUsage.get(data.containerId).push({ sessionId, key, data });
          }

          // Conflits de contenu
          if (data.metadata?.contentHash) {
            if (!contentHashes.has(data.metadata.contentHash)) {
              contentHashes.set(data.metadata.contentHash, []);
            }
            contentHashes.get(data.metadata.contentHash).push({ sessionId, key, data });
          }
        });
      });

      // Identifier les conflits de conteneurs
      containerUsage.forEach((usage, containerId) => {
        const sessions = new Set(usage.map(u => u.sessionId));
        if (sessions.size > 1) {
          conflicts.push({
            type: 'container_conflict',
            containerId,
            sessions: Array.from(sessions),
            affectedTables: usage.length,
            description: `Conteneur ${containerId} utilisé par ${sessions.size} sessions différentes`
          });
        }
      });

      // Identifier les conflits de contenu
      contentHashes.forEach((usage, contentHash) => {
        const sessions = new Set(usage.map(u => u.sessionId));
        if (sessions.size > 1) {
          conflicts.push({
            type: 'content_conflict',
            contentHash,
            sessions: Array.from(sessions),
            affectedTables: usage.length,
            description: `Contenu identique (hash: ${contentHash}) dans ${sessions.size} sessions différentes`
          });
        }
      });

      return conflicts;
    }

    /**
     * Générer des recommandations basées sur la validation d'intégrité
     */
    generateIntegrityRecommendations(validation) {
      const recommendations = [];

      if (validation.invalidSessions > 0) {
        recommendations.push(`Nettoyer ${validation.invalidSessions} session(s) invalide(s)`);
      }

      if (validation.crossSessionConflicts.length > 0) {
        recommendations.push(`Résoudre ${validation.crossSessionConflicts.length} conflit(s) inter-sessions`);
      }

      const totalTables = Array.from(validation.sessionStats.values())
        .reduce((sum, session) => sum + session.stats.tableCount, 0);

      if (totalTables > 100) {
        recommendations.push('Considérer un nettoyage général - plus de 100 tables stockées');
      }

      if (recommendations.length === 0) {
        recommendations.push('Intégrité des données satisfaisante');
      }

      return recommendations;
    }

    getStorageStats() {
      // Enhanced storage statistics with session and container breakdown
      const enhancedStats = this.getStorageStatsWithSession();

      // Maintain backward compatibility by including legacy format
      return {
        tableCount: enhancedStats.totalTables,
        totalSize: enhancedStats.totalSize,
        totalSizeMB: enhancedStats.totalSizeMB,

        // Enhanced breakdown information
        sessionBreakdown: enhancedStats.sessionBreakdown,
        containerBreakdown: enhancedStats.containerBreakdown,
        versionBreakdown: enhancedStats.versionBreakdown,

        // Migration and health metrics
        migrationStats: this.migrationManager.getMigrationStats(),
        containerStats: this.containerManager.getContainerStats(),

        // Performance metrics
        quotaUsageRatio: enhancedStats.quotaUsageRatio,
        averageTableSize: enhancedStats.averageTableSize,
        oldestData: enhancedStats.oldestData,
        newestData: enhancedStats.newestData,

        // Health indicators
        healthScore: this.calculateStorageHealthScore(enhancedStats),
        recommendations: this.generateStorageRecommendations(enhancedStats)
      };
    }

    /**
     * Calculate storage health score based on various metrics
     */
    calculateStorageHealthScore(stats) {
      try {
        let score = 100;

        // Quota usage penalty (0-30 points)
        if (stats.quotaUsageRatio > 0.9) {
          score -= 30;
        } else if (stats.quotaUsageRatio > 0.7) {
          score -= 15;
        } else if (stats.quotaUsageRatio > 0.5) {
          score -= 5;
        }

        // Version distribution penalty (0-20 points)
        const versionStats = stats.versionBreakdown;
        if (versionStats && typeof versionStats === 'object') {
          const versions = Object.keys(versionStats);
          const legacyCount = versionStats['1.0']?.count || 0;
          const totalTables = stats.totalTables;

          if (totalTables > 0) {
            const legacyRatio = legacyCount / totalTables;
            if (legacyRatio > 0.5) {
              score -= 20;
            } else if (legacyRatio > 0.2) {
              score -= 10;
            }
          }
        }

        // Session distribution penalty (0-15 points)
        const sessionCount = Object.keys(stats.sessionBreakdown || {}).length;
        if (sessionCount > 20) {
          score -= 15;
        } else if (sessionCount > 10) {
          score -= 8;
        }

        // Data age penalty (0-10 points)
        if (stats.oldestData) {
          const ageInDays = (Date.now() - new Date(stats.oldestData).getTime()) / (1000 * 60 * 60 * 24);
          if (ageInDays > 30) {
            score -= 10;
          } else if (ageInDays > 14) {
            score -= 5;
          }
        }

        // Migration status bonus/penalty (0-10 points)
        const migrationStats = this.migrationManager.getMigrationStats();
        if (migrationStats.errors > 0) {
          score -= 10;
        } else if (migrationStats.migrated > 0) {
          score += 5; // Bonus for successful migrations
        }

        return Math.max(0, Math.min(100, Math.round(score)));
      } catch (error) {
        console.warn('⚠️ Erreur calcul score santé stockage:', error);
        return 50; // Default neutral score
      }
    }

    /**
     * Generate storage recommendations based on statistics
     */
    generateStorageRecommendations(stats) {
      const recommendations = [];

      try {
        // Quota recommendations
        if (stats.quotaUsageRatio > 0.9) {
          recommendations.push({
            type: 'critical',
            message: 'Quota de stockage critique (>90%). Nettoyage urgent requis.',
            action: 'cleanOldSaves',
            priority: 1
          });
        } else if (stats.quotaUsageRatio > 0.7) {
          recommendations.push({
            type: 'warning',
            message: 'Quota de stockage élevé (>70%). Considérer un nettoyage.',
            action: 'cleanOldSaves',
            priority: 2
          });
        }

        // Version recommendations
        const versionStats = stats.versionBreakdown;
        if (versionStats && versionStats['1.0']?.count > 0) {
          const legacyCount = versionStats['1.0'].count;
          const totalTables = stats.totalTables;
          const legacyRatio = legacyCount / totalTables;

          if (legacyRatio > 0.3) {
            recommendations.push({
              type: 'info',
              message: `${legacyCount} table(s) au format legacy détectée(s). Migration recommandée.`,
              action: 'migrateAllExistingData',
              priority: 3
            });
          }
        }

        // Session cleanup recommendations
        const sessionCount = Object.keys(stats.sessionBreakdown || {}).length;
        if (sessionCount > 15) {
          recommendations.push({
            type: 'info',
            message: `${sessionCount} sessions détectées. Nettoyage des sessions inactives recommandé.`,
            action: 'cleanupExpiredSessions',
            priority: 4
          });
        }

        // Data age recommendations
        if (stats.oldestData) {
          const ageInDays = (Date.now() - new Date(stats.oldestData).getTime()) / (1000 * 60 * 60 * 24);
          if (ageInDays > 30) {
            recommendations.push({
              type: 'info',
              message: `Données anciennes détectées (${Math.round(ageInDays)} jours). Archivage recommandé.`,
              action: 'archiveOldData',
              priority: 5
            });
          }
        }

        // Container recommendations
        const containerStats = this.containerManager.getContainerStats();
        if (containerStats.containerCount > 10) {
          recommendations.push({
            type: 'info',
            message: `${containerStats.containerCount} conteneurs actifs. Vérification de la cohérence recommandée.`,
            action: 'validateContainerIntegrity',
            priority: 6
          });
        }

        // Performance recommendations
        if (stats.averageTableSize > 100000) { // 100KB
          recommendations.push({
            type: 'warning',
            message: 'Taille moyenne des tables élevée. Optimisation recommandée.',
            action: 'optimizeTableStorage',
            priority: 3
          });
        }

        // Sort by priority
        recommendations.sort((a, b) => a.priority - b.priority);

        return recommendations;
      } catch (error) {
        console.warn('⚠️ Erreur génération recommandations:', error);
        return [{
          type: 'error',
          message: 'Erreur génération recommandations de stockage',
          action: 'checkStorageIntegrity',
          priority: 1
        }];
      }
    }

    /**
     * Obtenir des statistiques de stockage avec détail par session
     */
    getStorageStatsWithSession() {
      const stats = {
        totalTables: 0,
        totalSize: 0,
        totalSizeMB: 0,
        sessionBreakdown: new Map(),
        versionBreakdown: new Map(),
        containerBreakdown: new Map(),
        quotaUsageRatio: 0,
        oldestData: null,
        newestData: null,
        averageTableSize: 0
      };

      try {
        let oldestTimestamp = Infinity;
        let newestTimestamp = 0;
        const tableSizes = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.storagePrefix)) {
            const value = localStorage.getItem(key);
            const itemSize = (key.length + (value ? value.length : 0)) * 2; // UTF-16

            stats.totalTables++;
            stats.totalSize += itemSize;
            tableSizes.push(itemSize);

            try {
              const data = JSON.parse(value);
              const sessionId = data.sessionId || 'unknown';
              const version = data.metadata?.version || '1.0';
              const containerId = data.containerId || 'no-container';
              const timestamp = data.timestamp || 0;

              // Statistiques par session
              if (!stats.sessionBreakdown.has(sessionId)) {
                stats.sessionBreakdown.set(sessionId, {
                  tableCount: 0,
                  totalSize: 0,
                  oldestTimestamp: Infinity,
                  newestTimestamp: 0,
                  containers: new Set()
                });
              }
              const sessionStats = stats.sessionBreakdown.get(sessionId);
              sessionStats.tableCount++;
              sessionStats.totalSize += itemSize;
              sessionStats.oldestTimestamp = Math.min(sessionStats.oldestTimestamp, timestamp);
              sessionStats.newestTimestamp = Math.max(sessionStats.newestTimestamp, timestamp);
              sessionStats.containers.add(containerId);

              // Statistiques par version
              if (!stats.versionBreakdown.has(version)) {
                stats.versionBreakdown.set(version, { count: 0, size: 0 });
              }
              stats.versionBreakdown.get(version).count++;
              stats.versionBreakdown.get(version).size += itemSize;

              // Statistiques par conteneur
              if (!stats.containerBreakdown.has(containerId)) {
                stats.containerBreakdown.set(containerId, { count: 0, size: 0, sessions: new Set() });
              }
              stats.containerBreakdown.get(containerId).count++;
              stats.containerBreakdown.get(containerId).size += itemSize;
              stats.containerBreakdown.get(containerId).sessions.add(sessionId);

              // Timestamps globaux
              if (timestamp > 0) {
                oldestTimestamp = Math.min(oldestTimestamp, timestamp);
                newestTimestamp = Math.max(newestTimestamp, timestamp);
              }

            } catch (parseError) {
              // Données corrompues - compter quand même dans les totaux
            }
          }
        }

        // Calculs finaux
        stats.totalSizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
        stats.averageTableSize = stats.totalTables > 0 ? Math.round(stats.totalSize / stats.totalTables) : 0;

        if (oldestTimestamp !== Infinity) {
          stats.oldestData = new Date(oldestTimestamp);
        }
        if (newestTimestamp > 0) {
          stats.newestData = new Date(newestTimestamp);
        }

        // Estimation du quota (approximative)
        try {
          const testKey = 'claraverse_quota_test';
          const testData = 'x'.repeat(1024); // 1KB test
          localStorage.setItem(testKey, testData);
          localStorage.removeItem(testKey);

          // Estimation basée sur la taille actuelle (très approximative)
          const estimatedQuota = 10 * 1024 * 1024; // 10MB estimation pour localStorage
          stats.quotaUsageRatio = Math.min(stats.totalSize / estimatedQuota, 1);
        } catch (quotaError) {
          stats.quotaUsageRatio = 0.9; // Assumer proche de la limite si erreur
        }

        // Convertir les Maps en objets pour sérialisation
        stats.sessionBreakdown = Object.fromEntries(
          Array.from(stats.sessionBreakdown.entries()).map(([key, value]) => [
            key,
            { ...value, containers: Array.from(value.containers) }
          ])
        );
        stats.versionBreakdown = Object.fromEntries(stats.versionBreakdown);
        stats.containerBreakdown = Object.fromEntries(
          Array.from(stats.containerBreakdown.entries()).map(([key, value]) => [
            key,
            { ...value, sessions: Array.from(value.sessions) }
          ])
        );

        return stats;

      } catch (error) {
        console.error('❌ Erreur calcul statistiques avec session:', error);
        return {
          ...stats,
          error: error.message
        };
      }
    }

    // ============================================
    // DIAGNOSTIC AND TROUBLESHOOTING TOOLS
    // ============================================

    addObserver(callback) {
      if (typeof callback === 'function') {
        this.observers.push(callback);
      }
    }

    notifyObservers(action, data) {
      this.observers.forEach(observer => {
        try {
          observer(action, data);
        } catch (error) {
          console.error("❌ Erreur notification observateur:", error);
        }
      });

      // Émettre un Custom Event global
      const event = new CustomEvent('claraverse:storage:event', {
        detail: { action, data, timestamp: Date.now() },
        bubbles: true
      });
      document.dispatchEvent(event);
    }

    // ============================================
    // UI NOTIFICATIONS
    // ============================================

    showSaveIndicator() {
      const indicator = document.createElement('div');
      indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 25000;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      `;
      indicator.innerHTML = '💾 Sauvegardé';

      document.body.appendChild(indicator);

      setTimeout(() => {
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';
      }, 10);

      setTimeout(() => {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(10px)';
        setTimeout(() => {
          if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
          }
        }, 300);
      }, 2000);
    }

    showQuickNotification(message) {
      const notif = document.createElement("div");
      notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 20000;
        font-size: 14px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
      `;
      notif.textContent = message;
      document.body.appendChild(notif);

      setTimeout(() => {
        notif.style.opacity = "1";
        notif.style.transform = "translateY(0)";
      }, 10);

      setTimeout(() => {
        notif.style.opacity = "0";
        notif.style.transform = "translateY(-20px)";
        setTimeout(() => {
          if (notif.parentNode) notif.parentNode.removeChild(notif);
        }, 300);
      }, 3000);
    }

    // ============================================
    // OBSERVER DOM (Nouvelles tables)
    // ============================================

    observeNewTables() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "TABLE" && this.isTableInChat(node)) {
                console.log("📊 Nouvelle table détectée");
                setTimeout(() => this.restoreTableFromStorage(node), 200);
              }

              if (node.querySelectorAll) {
                const tables = node.querySelectorAll("table");
                tables.forEach((table) => {
                  if (this.isTableInChat(table)) {
                    setTimeout(() => this.restoreTableFromStorage(table), 200);
                  }
                });
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log("👁️ Observer DOM activé");
    }

    isTableInChat(table) {
      const selector = "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg";
      if (table.matches(selector)) {
        const container = "div.prose.prose-base.dark\\:prose-invert.max-w-none";
        if (table.closest(container)) return true;
      }

      const fallbacks = [
        '[class*="chat"]',
        '[class*="message"]',
        ".prose",
        ".markdown-body"
      ];

      for (const sel of fallbacks) {
        if (table.closest(sel)) return true;
      }

      return false;
    }

    // ============================================
    // CLEANUP
    // ============================================

    cleanup() {
      this.saveTimeouts.forEach((timeout) => clearTimeout(timeout));
      this.saveTimeouts.clear();

      // Nettoyer les nouveaux gestionnaires
      if (this.containerManager) {
        this.containerManager.cleanup();
      }
      if (this.contextManager) {
        this.contextManager.cleanupExpiredSessions();
      }
      if (this.migrationManager) {
        this.migrationManager.cleanupRecoveryData();
      }

      console.log("🧹 Storage Manager nettoyé");
    }
  }

  // ============================================
  // INITIALISATION & API GLOBALE
  // ============================================

  /**
   * Effectuer une vérification de santé au démarrage
   */
  async function performStartupHealthCheck(storageManager) {
    const healthCheck = {
      timestamp: Date.now(),
      version: '2.0.0',
      session: { detected: false, sessionId: null, method: null, warnings: [] },
      containers: { containerCount: 0, totalTables: 0, warnings: [] },
      storage: { tableCount: 0, totalSizeMB: 0, warnings: [] },
      migration: { completed: false, stats: null, warnings: [] },
      warnings: [],
      errors: [],
      recommendations: []
    };

    try {
      // 1. Vérification de session
      try {
        const sessionContext = storageManager.contextManager.getCurrentSessionContext();
        if (sessionContext) {
          healthCheck.session.detected = true;
          healthCheck.session.sessionId = sessionContext.sessionId;
          healthCheck.session.method = sessionContext.detectionMethod;

          if (sessionContext.isTemporary) {
            healthCheck.session.warnings.push('Session temporaire détectée');
            healthCheck.warnings.push('Session temporaire - les données pourraient ne pas persister');
          }

          if (!sessionContext.isValid) {
            healthCheck.session.warnings.push('Session invalide');
            healthCheck.warnings.push('Session invalide détectée');
          }
        } else {
          healthCheck.warnings.push('Aucune session détectée - utilisation d\'un ID temporaire');
          healthCheck.recommendations.push('Vérifier la configuration de session pour une meilleure persistance');
        }
      } catch (sessionError) {
        healthCheck.errors.push(`Erreur détection session: ${sessionError.message}`);
      }

      // 2. Vérification des conteneurs
      try {
        const containerStats = storageManager.containerManager.getContainerStats();
        healthCheck.containers = {
          containerCount: containerStats.containerCount,
          totalTables: containerStats.totalTables,
          warnings: []
        };

        if (containerStats.containerCount === 0) {
          healthCheck.containers.warnings.push('Aucun conteneur détecté');
          healthCheck.warnings.push('Aucun conteneur de table détecté sur la page');
        }

        if (!containerStats.monitoringActive) {
          healthCheck.containers.warnings.push('Surveillance des conteneurs inactive');
          healthCheck.warnings.push('Surveillance des changements de conteneur inactive');
        }
      } catch (containerError) {
        healthCheck.errors.push(`Erreur analyse conteneurs: ${containerError.message}`);
      }

      // 3. Vérification du stockage
      try {
        const storageStats = storageManager.getStorageStats();
        healthCheck.storage = {
          tableCount: storageStats.tableCount,
          totalSizeMB: storageStats.totalSizeMB,
          warnings: []
        };

        if (storageStats.totalSizeMB > 8) { // Plus de 8MB
          healthCheck.storage.warnings.push('Utilisation élevée du stockage');
          healthCheck.warnings.push(`Utilisation élevée du stockage: ${storageStats.totalSizeMB} MB`);
          healthCheck.recommendations.push('Considérer un nettoyage des anciennes données');
        }

        if (storageStats.tableCount > 100) {
          healthCheck.storage.warnings.push('Nombre élevé de tables stockées');
          healthCheck.warnings.push(`Nombre élevé de tables: ${storageStats.tableCount}`);
          healthCheck.recommendations.push('Considérer un nettoyage périodique');
        }
      } catch (storageError) {
        healthCheck.errors.push(`Erreur analyse stockage: ${storageError.message}`);
      }

      // 4. Vérification de la migration
      try {
        const migrationStats = storageManager.migrationManager.getMigrationStats();
        healthCheck.migration = {
          completed: migrationStats.endTime !== null,
          stats: migrationStats,
          warnings: []
        };

        if (migrationStats.errors > 0) {
          healthCheck.migration.warnings.push(`${migrationStats.errors} erreur(s) de migration`);
          healthCheck.warnings.push(`${migrationStats.errors} erreur(s) de migration détectée(s)`);
          healthCheck.recommendations.push('Vérifier les données de récupération pour les erreurs de migration');
        }

        const recoveryData = storageManager.migrationManager.getRecoveryData();
        if (recoveryData.length > 0) {
          healthCheck.migration.warnings.push(`${recoveryData.length} donnée(s) en récupération`);
          healthCheck.warnings.push(`${recoveryData.length} donnée(s) en attente de récupération`);
        }
      } catch (migrationError) {
        healthCheck.errors.push(`Erreur vérification migration: ${migrationError.message}`);
      }

      // 5. Vérifications environnementales
      try {
        // Test localStorage
        const testKey = 'claraverse_health_test';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
      } catch (localStorageError) {
        healthCheck.errors.push('localStorage non disponible ou quota dépassé');
        healthCheck.recommendations.push('Vérifier les paramètres du navigateur et l\'espace de stockage');
      }

      // 6. Recommandations générales
      if (healthCheck.warnings.length === 0 && healthCheck.errors.length === 0) {
        healthCheck.recommendations.push('Système en bon état - aucune action requise');
      }

      return healthCheck;

    } catch (error) {
      healthCheck.errors.push(`Erreur vérification santé: ${error.message}`);
      return healthCheck;
    }
  }

  /**
   * Programmer les tâches de maintenance périodiques
   */
  function scheduleMaintenanceTasks(storageManager) {
    // Nettoyage des sessions expirées toutes les heures
    setInterval(() => {
      try {
        storageManager.contextManager.cleanupExpiredSessions();
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage sessions:', error.message);
      }
    }, 60 * 60 * 1000); // 1 heure

    // Nettoyage des conteneurs obsolètes toutes les 30 minutes
    setInterval(() => {
      try {
        const cleaned = storageManager.containerManager.cleanupStaleContainers();
        if (cleaned > 0) {
          console.log(`🧹 ${cleaned} conteneur(s) obsolète(s) nettoyé(s)`);
        }
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage conteneurs:', error.message);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Nettoyage des données de récupération anciennes une fois par jour
    setInterval(() => {
      try {
        const cleaned = storageManager.migrationManager.cleanupRecoveryData();
        if (cleaned > 0) {
          console.log(`🧹 ${cleaned} donnée(s) de récupération nettoyée(s)`);
        }
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage récupération:', error.message);
      }
    }, 24 * 60 * 60 * 1000); // 24 heures

    // Validation périodique de l'intégrité des données (une fois par semaine)
    setInterval(() => {
      try {
        const validation = storageManager.migrationManager.validateMigratedData();
        if (validation.invalidData > 0) {
          console.warn(`⚠️ ${validation.invalidData} donnée(s) invalide(s) détectée(s)`);
        }
      } catch (error) {
        console.warn('⚠️ Erreur validation intégrité:', error.message);
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 jours

    console.log('⏰ Tâches de maintenance programmées');
  }

  const storageManager = new TableStorageManager();

  // API globale exposée
  window.claraverseStorageAPI = {
    version: '2.0.0',

    // ============================================
    // SAUVEGARDE ET RESTAURATION (Compatible + Robuste)
    // ============================================

    // Méthodes de sauvegarde
    saveTable: (table) => storageManager.saveTableHTMLNow(table),
    saveTableDebounced: (table) => storageManager.saveTableHTMLDebounced(table),
    saveTableRobust: (table) => storageManager.saveTableHTMLNow(table), // Alias pour clarté

    // Méthodes de restauration
    restoreTable: (table) => storageManager.restoreTableFromStorage(table),
    restoreAll: () => storageManager.restoreAllTablesFromStorage(),
    restoreTableRobust: (table) => storageManager.restoreTableFromStorage(table), // Alias pour clarté

    // ============================================
    // IDENTIFICATION ROBUSTE
    // ============================================

    // Génération d'ID
    generateTableId: (table) => storageManager.generateStableTableId(table), // Legacy
    generateRobustTableId: (table) => storageManager.generateRobustTableId(table), // Nouveau
    getTableId: (table) => storageManager.getTableId(table), // Méthode unifiée

    // Validation et contexte
    validateOperationContext: (table, operation) => storageManager.validateOperationContext(table, operation),
    createEnhancedMetadata: (table, tableId) => storageManager.createEnhancedMetadata(table, tableId),

    // ============================================
    // GESTION DE SESSION
    // ============================================

    // Contexte de session
    getCurrentSession: () => storageManager.contextManager.getCurrentSessionContext(),
    refreshSession: () => storageManager.contextManager.refreshSession(),
    detectCurrentSession: () => storageManager.contextManager.detectCurrentSession(),
    validateSessionContext: () => storageManager.contextManager.validateSessionContext(),

    // Surveillance de session
    startSessionMonitoring: () => storageManager.contextManager.startSessionMonitoring(),
    updateSessionActivity: () => storageManager.contextManager.updateSessionActivity(),
    cleanupExpiredSessions: () => storageManager.contextManager.cleanupExpiredSessions(),

    // ============================================
    // GESTION DE CONTENEURS
    // ============================================

    // Analyse de conteneurs
    getContainerStats: () => storageManager.containerManager.getContainerStats(),
    analyzeContainer: (containerId) => storageManager.containerManager.analyzeContainerChanges(containerId),
    getAllContainers: () => storageManager.containerManager.getAllContainers(),
    getContainerInfo: (containerId) => storageManager.containerManager.getContainerInfo(containerId),

    // Gestion de conteneurs
    getOrCreateContainerId: (table) => storageManager.containerManager.getOrCreateContainerId(table),
    findTableContainer: (table) => storageManager.containerManager.findTableContainer(table),
    cleanupStaleContainers: () => storageManager.containerManager.cleanupStaleContainers(),

    // Surveillance de conteneurs
    startContainerMonitoring: () => storageManager.containerManager.startContainerChangeMonitoring(),
    stopContainerMonitoring: () => storageManager.containerManager.stopContainerChangeMonitoring(),

    // ============================================
    // MIGRATION ET RÉCUPÉRATION
    // ============================================

    // Migration
    migrateAllData: () => storageManager.migrationManager.migrateAllExistingData(),
    getMigrationStats: () => storageManager.migrationManager.getMigrationStats(),
    getMigrationReport: () => storageManager.migrationManager.getMigrationReport(),
    validateMigratedData: () => storageManager.migrationManager.validateMigratedData(),

    // Récupération
    getRecoveryData: () => storageManager.migrationManager.getRecoveryData(),
    restoreFromRecovery: (key) => storageManager.migrationManager.restoreFromRecovery(key),
    cleanupRecoveryData: (maxAge) => storageManager.migrationManager.cleanupRecoveryData(maxAge),

    // Utilitaires de migration
    findOldFormatKeys: () => storageManager.migrationManager.findOldFormatKeys(),
    isNewFormat: (key) => storageManager.migrationManager.isNewFormat(key),

    // ============================================
    // GESTION ET MAINTENANCE
    // ============================================

    // Statistiques et monitoring
    getStats: () => storageManager.getStorageStats(),
    getStorageStats: () => storageManager.getStorageStats(), // Alias pour clarté

    // Nettoyage
    cleanOld: (keepCount) => storageManager.cleanOldSaves(keepCount),
    cleanup: () => storageManager.cleanup(),

    // ============================================
    // OBSERVATEURS ET ÉVÉNEMENTS
    // ============================================

    // Observateurs
    addObserver: (callback) => storageManager.addObserver(callback),
    removeObserver: (callback) => storageManager.removeObserver(callback),
    notifyObservers: (event, data) => storageManager.notifyObservers(event, data),

    // ============================================
    // UTILITAIRES ET COMPATIBILITÉ
    // ============================================

    // Utilitaires
    isTableInChat: (table) => storageManager.isTableInChat(table),
    simpleHash: (str) => storageManager.simpleHash(str),

    // Accès direct aux gestionnaires (pour usage avancé)
    contextManager: storageManager.contextManager,
    containerManager: storageManager.containerManager,
    migrationManager: storageManager.migrationManager,

    // ============================================
    // DIAGNOSTICS ET DÉVELOPPEMENT
    // ============================================

    // Diagnostics avancés
    debugTableIdentification: (table) => storageManager.debugTableIdentification(table),
    validateStorageIntegrity: () => storageManager.validateStorageIntegrity(),

    // Validation de contexte de session
    validateSessionContext: () => {
      const sessionContext = storageManager.contextManager.getCurrentSessionContext();
      const validation = {
        timestamp: Date.now(),
        sessionDetected: !!sessionContext,
        sessionValid: sessionContext ? sessionContext.isValid : false,
        sessionId: sessionContext ? sessionContext.sessionId : null,
        detectionMethod: sessionContext ? sessionContext.detectionMethod : null,
        isTemporary: sessionContext ? sessionContext.isTemporary : null,
        age: sessionContext ? Date.now() - sessionContext.startTime : null,
        lastActivity: sessionContext ? Date.now() - sessionContext.lastActivity : null,
        issues: [],
        recommendations: []
      };

      // Identifier les problèmes
      if (!validation.sessionDetected) {
        validation.issues.push('Aucune session détectée');
        validation.recommendations.push('Exécuter contextManager.refreshSession()');
      } else {
        if (!validation.sessionValid) {
          validation.issues.push('Session invalide ou expirée');
          validation.recommendations.push('Rafraîchir la session ou en créer une nouvelle');
        }
        if (validation.isTemporary) {
          validation.issues.push('Session temporaire (peut causer des conflits)');
          validation.recommendations.push('Configurer une session persistante');
        }
        if (validation.lastActivity > 30 * 60 * 1000) {
          validation.issues.push('Session inactive depuis plus de 30 minutes');
          validation.recommendations.push('Mettre à jour l\'activité de session');
        }
      }

      console.log('🔐 Validation du contexte de session:', validation);
      return validation;
    },

    // Diagnostics de mapping des conteneurs
    visualizeContainerMapping: () => {
      const containers = storageManager.containerManager.getAllContainers();
      const mapping = {
        timestamp: Date.now(),
        totalContainers: containers.length,
        containers: [],
        orphanedTables: [],
        statistics: {
          activeContainers: 0,
          staleContainers: 0,
          totalTables: 0,
          averageTablesPerContainer: 0
        }
      };

      // Analyser chaque conteneur
      containers.forEach(container => {
        const containerInfo = {
          id: container.id,
          isActive: document.contains(container.element),
          tableCount: container.tableCount,
          age: Date.now() - container.createdAt,
          lastAccessed: Date.now() - container.lastAccessed,
          contentHash: container.contentHash,
          element: {
            tagName: container.element.tagName,
            className: container.element.className,
            id: container.element.id
          },
          tables: []
        };

        if (containerInfo.isActive) {
          mapping.statistics.activeContainers++;
          mapping.statistics.totalTables += containerInfo.tableCount;

          // Analyser les tables dans ce conteneur
          const tablesInContainer = container.element.querySelectorAll('table');
          Array.from(tablesInContainer).forEach((table, index) => {
            containerInfo.tables.push({
              index: index,
              hasRobustId: table.hasAttribute('data-robust-table-id'),
              hasLegacyId: table.hasAttribute('data-menu-table-id'),
              rowCount: table.querySelectorAll('tr').length,
              colCount: table.querySelector('tr')?.children.length || 0
            });
          });
        } else {
          mapping.statistics.staleContainers++;
        }

        mapping.containers.push(containerInfo);
      });

      // Chercher les tables orphelines
      const allTables = document.querySelectorAll('table');
      Array.from(allTables).forEach(table => {
        const containerId = storageManager.containerManager.getOrCreateContainerId(table);
        if (containerId === 'no-container') {
          mapping.orphanedTables.push({
            element: table,
            rowCount: table.querySelectorAll('tr').length,
            colCount: table.querySelector('tr')?.children.length || 0,
            hasRobustId: table.hasAttribute('data-robust-table-id'),
            hasLegacyId: table.hasAttribute('data-menu-table-id')
          });
        }
      });

      // Calculer les statistiques
      if (mapping.statistics.activeContainers > 0) {
        mapping.statistics.averageTablesPerContainer =
          mapping.statistics.totalTables / mapping.statistics.activeContainers;
      }

      console.log('📦 Mapping des conteneurs:', mapping);
      console.table(mapping.containers.map(c => ({
        ID: c.id.substring(0, 20) + '...',
        Actif: c.isActive ? '✅' : '❌',
        Tables: c.tableCount,
        'Âge (min)': Math.round(c.age / (60 * 1000)),
        'Dernier accès (min)': Math.round(c.lastAccessed / (60 * 1000))
      })));

      if (mapping.orphanedTables.length > 0) {
        console.warn(`⚠️ ${mapping.orphanedTables.length} table(s) orpheline(s) détectée(s)`);
      }

      return mapping;
    },

    // Analyse des performances d'identification
    benchmarkIdentificationPerformance: (iterations = 100) => {
      console.log(`🚀 Test de performance d'identification (${iterations} itérations)...`);

      const results = {
        timestamp: Date.now(),
        iterations: iterations,
        results: {
          sessionDetection: { total: 0, average: 0, min: Infinity, max: 0 },
          containerIdentification: { total: 0, average: 0, min: Infinity, max: 0 },
          tableIdGeneration: { total: 0, average: 0, min: Infinity, max: 0 },
          contentHashing: { total: 0, average: 0, min: Infinity, max: 0 }
        },
        recommendations: []
      };

      // Préparer une table de test
      const testTable = document.querySelector('table') || document.createElement('table');
      if (!testTable.querySelector('tr')) {
        testTable.innerHTML = '<tr><th>Test</th><th>Data</th></tr><tr><td>1</td><td>Sample</td></tr>';
      }

      // Test de détection de session
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        storageManager.contextManager.detectCurrentSession();
        const duration = performance.now() - start;

        results.results.sessionDetection.total += duration;
        results.results.sessionDetection.min = Math.min(results.results.sessionDetection.min, duration);
        results.results.sessionDetection.max = Math.max(results.results.sessionDetection.max, duration);
      }
      results.results.sessionDetection.average = results.results.sessionDetection.total / iterations;

      // Test d'identification de conteneur
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        storageManager.containerManager.getOrCreateContainerId(testTable);
        const duration = performance.now() - start;

        results.results.containerIdentification.total += duration;
        results.results.containerIdentification.min = Math.min(results.results.containerIdentification.min, duration);
        results.results.containerIdentification.max = Math.max(results.results.containerIdentification.max, duration);
      }
      results.results.containerIdentification.average = results.results.containerIdentification.total / iterations;

      // Test de génération d'ID de table
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        storageManager.generateRobustTableId(testTable);
        const duration = performance.now() - start;

        results.results.tableIdGeneration.total += duration;
        results.results.tableIdGeneration.min = Math.min(results.results.tableIdGeneration.min, duration);
        results.results.tableIdGeneration.max = Math.max(results.results.tableIdGeneration.max, duration);
      }
      results.results.tableIdGeneration.average = results.results.tableIdGeneration.total / iterations;

      // Test de hachage de contenu
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        storageManager.generateContentHash(testTable);
        const duration = performance.now() - start;

        results.results.contentHashing.total += duration;
        results.results.contentHashing.min = Math.min(results.results.contentHashing.min, duration);
        results.results.contentHashing.max = Math.max(results.results.contentHashing.max, duration);
      }
      results.results.contentHashing.average = results.results.contentHashing.total / iterations;

      // Générer des recommandations basées sur les performances
      Object.entries(results.results).forEach(([operation, metrics]) => {
        if (metrics.average > 10) { // Plus de 10ms en moyenne
          results.recommendations.push(`Performance ${operation} lente: ${metrics.average.toFixed(2)}ms en moyenne`);
        }
        if (metrics.max > 50) { // Plus de 50ms au maximum
          results.recommendations.push(`Pic de performance ${operation}: ${metrics.max.toFixed(2)}ms maximum`);
        }
      });

      // Afficher les résultats
      console.log('📊 Résultats du benchmark:');
      console.table(Object.entries(results.results).map(([operation, metrics]) => ({
        Opération: operation,
        'Moyenne (ms)': metrics.average.toFixed(2),
        'Min (ms)': metrics.min.toFixed(2),
        'Max (ms)': metrics.max.toFixed(2),
        'Total (ms)': metrics.total.toFixed(2)
      })));

      if (results.recommendations.length > 0) {
        console.warn('⚠️ Recommandations de performance:');
        results.recommendations.forEach(rec => console.warn(`  - ${rec}`));
      } else {
        console.log('✅ Performances acceptables pour toutes les opérations');
      }

      return results;
    },

    // Analyse des conflits d'ID en temps réel
    analyzeIdConflicts: () => {
      console.log('🔍 Analyse des conflits d\'ID en temps réel...');

      const analysis = {
        timestamp: Date.now(),
        conflicts: {
          duplicateIds: [],
          similarContent: [],
          positionConflicts: []
        },
        statistics: {
          totalTables: 0,
          uniqueIds: 0,
          duplicateIdCount: 0,
          similarContentGroups: 0
        },
        recommendations: []
      };

      const idMap = new Map();
      const contentHashMap = new Map();
      const positionMap = new Map();

      // Analyser toutes les tables visibles
      const allTables = document.querySelectorAll('table');
      analysis.statistics.totalTables = allTables.length;

      Array.from(allTables).forEach((table, index) => {
        try {
          // Obtenir les identifiants
          const tableId = storageManager.getTableId(table);
          const contentHash = storageManager.generateContentHash(table);
          const containerId = storageManager.containerManager.getOrCreateContainerId(table);
          const position = storageManager.getTablePositionInContainer(table, containerId);
          const positionKey = `${containerId}_${position}`;

          // Collecter les conflits d'ID
          if (tableId) {
            if (!idMap.has(tableId)) {
              idMap.set(tableId, []);
            }
            idMap.get(tableId).push({ index, table, tableId, contentHash, containerId, position });
          }

          // Collecter les conflits de contenu
          if (contentHash) {
            if (!contentHashMap.has(contentHash)) {
              contentHashMap.set(contentHash, []);
            }
            contentHashMap.get(contentHash).push({ index, table, tableId, contentHash, containerId, position });
          }

          // Collecter les conflits de position
          if (!positionMap.has(positionKey)) {
            positionMap.set(positionKey, []);
          }
          positionMap.get(positionKey).push({ index, table, tableId, contentHash, containerId, position });

        } catch (error) {
          console.warn(`⚠️ Erreur analyse table ${index}:`, error);
        }
      });

      // Identifier les conflits d'ID
      idMap.forEach((tables, id) => {
        if (tables.length > 1) {
          analysis.conflicts.duplicateIds.push({
            id: id,
            count: tables.length,
            tables: tables.map(t => ({
              index: t.index,
              containerId: t.containerId,
              position: t.position,
              contentHash: t.contentHash
            }))
          });
          analysis.statistics.duplicateIdCount += tables.length - 1;
        }
      });

      // Identifier les contenus similaires
      contentHashMap.forEach((tables, hash) => {
        if (tables.length > 1) {
          analysis.conflicts.similarContent.push({
            contentHash: hash,
            count: tables.length,
            tables: tables.map(t => ({
              index: t.index,
              tableId: t.tableId,
              containerId: t.containerId,
              position: t.position
            }))
          });
          analysis.statistics.similarContentGroups++;
        }
      });

      // Identifier les conflits de position
      positionMap.forEach((tables, positionKey) => {
        if (tables.length > 1) {
          analysis.conflicts.positionConflicts.push({
            positionKey: positionKey,
            count: tables.length,
            tables: tables.map(t => ({
              index: t.index,
              tableId: t.tableId,
              contentHash: t.contentHash
            }))
          });
        }
      });

      // Calculer les statistiques
      analysis.statistics.uniqueIds = idMap.size;

      // Générer des recommandations
      if (analysis.conflicts.duplicateIds.length > 0) {
        analysis.recommendations.push(`${analysis.conflicts.duplicateIds.length} conflit(s) d'ID détecté(s) - Régénérer les IDs`);
      }
      if (analysis.conflicts.similarContent.length > 0) {
        analysis.recommendations.push(`${analysis.conflicts.similarContent.length} groupe(s) de contenu similaire - Vérifier la logique de hachage`);
      }
      if (analysis.conflicts.positionConflicts.length > 0) {
        analysis.recommendations.push(`${analysis.conflicts.positionConflicts.length} conflit(s) de position - Vérifier la gestion des conteneurs`);
      }

      // Afficher les résultats
      console.log('📊 Statistiques des conflits:');
      console.log(`  Tables analysées: ${analysis.statistics.totalTables}`);
      console.log(`  IDs uniques: ${analysis.statistics.uniqueIds}`);
      console.log(`  Conflits d'ID: ${analysis.conflicts.duplicateIds.length}`);
      console.log(`  Groupes de contenu similaire: ${analysis.conflicts.similarContent.length}`);
      console.log(`  Conflits de position: ${analysis.conflicts.positionConflicts.length}`);

      if (analysis.conflicts.duplicateIds.length > 0) {
        console.warn('🔴 Conflits d\'ID critiques détectés:');
        analysis.conflicts.duplicateIds.forEach(conflict => {
          console.warn(`  ID: ${conflict.id.substring(0, 50)}... (${conflict.count} tables)`);
        });
      }

      if (analysis.recommendations.length > 0) {
        console.log('💡 Recommandations:');
        analysis.recommendations.forEach(rec => console.log(`  - ${rec}`));
      } else {
        console.log('✅ Aucun conflit critique détecté');
      }

      return analysis;
    },

    // Diagnostics de base
    runDiagnostics: () => {
      const sessionContext = storageManager.contextManager.getCurrentSessionContext();
      const containerStats = storageManager.containerManager.getContainerStats();
      const storageStats = storageManager.getStorageStats();
      const migrationStats = storageManager.migrationManager.getMigrationStats();

      return {
        version: '2.0.0',
        timestamp: Date.now(),
        session: sessionContext,
        containers: containerStats,
        storage: storageStats,
        migration: migrationStats,
        environment: {
          url: window.location.href,
          userAgent: navigator.userAgent.substring(0, 100),
          localStorage: {
            available: typeof localStorage !== 'undefined',
            quota: (() => {
              try {
                const test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return 'OK';
              } catch (e) {
                return e.name;
              }
            })()
          }
        }
      };
    },

    // Test de fonctionnement de base
    testBasicFunctionality: () => {
      console.log('🧪 Test de fonctionnement de base du système de stockage...');

      const results = {
        timestamp: Date.now(),
        tests: [],
        overall: true
      };

      try {
        // Test 1: Détection de session
        try {
          const sessionId = storageManager.contextManager.detectCurrentSession();
          results.tests.push({
            name: 'Détection de session',
            passed: !!sessionId && sessionId.trim() !== '',
            details: sessionId ? `Session: ${sessionId.substring(0, 20)}...` : 'Aucune session'
          });
        } catch (error) {
          results.tests.push({
            name: 'Détection de session',
            passed: false,
            details: `Erreur: ${error.message}`
          });
          results.overall = false;
        }

        // Test 2: Création d'une table de test
        const testTable = document.createElement('table');
        testTable.innerHTML = '<tr><td>Test</td><td>Data</td></tr>';
        document.body.appendChild(testTable);

        try {
          // Test 3: Génération d'ID robuste
          const robustId = storageManager.generateRobustTableId(testTable);
          results.tests.push({
            name: 'Génération ID robuste',
            passed: !!robustId && robustId.length > 10,
            details: robustId ? `ID: ${robustId.substring(0, 50)}...` : 'Échec génération'
          });

          // Test 4: Sauvegarde
          if (robustId) {
            const saveResult = storageManager.saveTableHTMLNow(testTable);
            results.tests.push({
              name: 'Sauvegarde de table',
              passed: saveResult,
              details: saveResult ? 'Sauvegarde réussie' : 'Échec sauvegarde'
            });

            // Test 5: Restauration
            if (saveResult) {
              // Modifier la table pour tester la restauration
              testTable.innerHTML = '<tr><td>Modified</td><td>Content</td></tr>';

              const restoreResult = storageManager.restoreTableFromStorage(testTable);
              results.tests.push({
                name: 'Restauration de table',
                passed: restoreResult,
                details: restoreResult ? 'Restauration réussie' : 'Échec restauration'
              });

              // Vérifier si le contenu a été restauré
              if (restoreResult) {
                const restoredContent = testTable.textContent;
                const contentRestored = restoredContent.includes('Test') && restoredContent.includes('Data');
                results.tests.push({
                  name: 'Vérification contenu restauré',
                  passed: contentRestored,
                  details: contentRestored ? 'Contenu correctement restauré' : 'Contenu non restauré'
                });
              }
            }
          }
        } catch (error) {
          results.tests.push({
            name: 'Test table',
            passed: false,
            details: `Erreur: ${error.message}`
          });
          results.overall = false;
        } finally {
          // Nettoyer la table de test
          if (testTable.parentNode) {
            testTable.parentNode.removeChild(testTable);
          }
        }

        // Calculer le résultat global
        const passedTests = results.tests.filter(t => t.passed).length;
        const totalTests = results.tests.length;
        results.overall = passedTests === totalTests;

        console.log(`📊 Résultats test de base: ${passedTests}/${totalTests} réussis`);
        results.tests.forEach(test => {
          const icon = test.passed ? '✅' : '❌';
          console.log(`  ${icon} ${test.name}: ${test.details}`);
        });

        if (results.overall) {
          console.log('✅ Système de stockage fonctionnel');
        } else {
          console.warn('⚠️ Problèmes détectés dans le système de stockage');
        }

        return results;

      } catch (error) {
        console.error('❌ Erreur critique dans test de base:', error);
        results.overall = false;
        results.tests.push({
          name: 'Test global',
          passed: false,
          details: `Erreur critique: ${error.message}`
        });
        return results;
      }
    },

    // Tests et validation
    validateIntegrity: () => {
      const results = {
        timestamp: Date.now(),
        tests: [],
        errors: [],
        warnings: []
      };

      try {
        // Test session
        const sessionContext = storageManager.contextManager.getCurrentSessionContext();
        results.tests.push({
          name: 'Session Detection',
          passed: !!sessionContext,
          details: sessionContext ? `Session: ${sessionContext.sessionId.substring(0, 20)}...` : 'No session detected'
        });

        // Test conteneurs
        const containerStats = storageManager.containerManager.getContainerStats();
        results.tests.push({
          name: 'Container Management',
          passed: containerStats.containerCount >= 0,
          details: `${containerStats.containerCount} containers, ${containerStats.totalTables} tables`
        });

        // Test migration
        const migrationStats = storageManager.migrationManager.getMigrationStats();
        results.tests.push({
          name: 'Migration System',
          passed: migrationStats.totalFound >= 0,
          details: `${migrationStats.migrated} migrated, ${migrationStats.errors} errors`
        });

        // Test storage
        const storageStats = storageManager.getStorageStats();
        results.tests.push({
          name: 'Storage System',
          passed: storageStats.tableCount >= 0,
          details: `${storageStats.tableCount} tables, ${storageStats.totalSizeMB} MB`
        });

      } catch (error) {
        results.errors.push(`Validation error: ${error.message}`);
      }

      return results;
    }
  };

  // ============================================
  // FONCTIONS COMPATIBLES ANCIENNES VERSIONS
  // ============================================

  // Fonctions principales (maintenues pour compatibilité)
  window.saveTableHTMLNow = (table) => storageManager.saveTableHTMLNow(table);
  window.restoreTableHTML = (table) => storageManager.restoreTableFromStorage(table);

  // Fonctions utilitaires legacy
  window.generateStableTableId = (table) => storageManager.generateStableTableId(table);
  window.cleanOldTableSaves = (keepCount) => storageManager.cleanOldSaves(keepCount);
  window.getTableStorageStats = () => storageManager.getStorageStats();

  // Alias pour les nouvelles fonctions (transition douce)
  window.saveTableRobust = (table) => storageManager.saveTableHTMLNow(table);
  window.restoreTableRobust = (table) => storageManager.restoreTableFromStorage(table);
  window.generateRobustTableId = (table) => storageManager.generateRobustTableId(table);

  // Fonctions de migration (pour scripts externes)
  window.migrateTableData = () => storageManager.migrationManager.migrateAllExistingData();
  window.getTableMigrationStats = () => storageManager.migrationManager.getMigrationStats();

  // Fonctions de session (pour scripts externes)
  window.getCurrentTableSession = () => storageManager.contextManager.getCurrentSessionContext();
  window.refreshTableSession = () => storageManager.contextManager.refreshSession();

  // Fonction de diagnostic globale
  window.diagnoseTableStorage = () => window.claraverseStorageAPI.runDiagnostics();

  // Auto-initialisation
  const initStorage = async () => {
    try {
      // 1. Démarrer la surveillance des nouvelles tables
      storageManager.observeNewTables();

      // 2. Démarrer la surveillance de session
      storageManager.contextManager.startSessionMonitoring();

      // 3. Nettoyage des sessions expirées
      storageManager.contextManager.cleanupExpiredSessions();

      // 4. Migration automatique des données legacy avec rapport de progression
      console.log("🔄 Vérification migration des données legacy...");
      try {
        const migrationStats = await storageManager.migrationManager.migrateAllExistingData();

        // Rapport de migration détaillé
        if (migrationStats.totalFound > 0) {
          console.log(`📊 Migration - Résultats:`);
          console.log(`  - ${migrationStats.totalFound} entrée(s) legacy détectée(s)`);
          console.log(`  - ${migrationStats.migrated} migrée(s) avec succès`);
          console.log(`  - ${migrationStats.errors} erreur(s)`);
          console.log(`  - ${migrationStats.skipped} ignorée(s)`);

          if (migrationStats.errors > 0) {
            console.warn(`⚠️ ${migrationStats.errors} erreur(s) de migration détectée(s)`);
            const recoveryData = storageManager.migrationManager.getRecoveryData();
            if (recoveryData.length > 0) {
              console.log(`💾 ${recoveryData.length} donnée(s) sauvegardée(s) en récupération`);
            }
          }

          // Émettre un événement de migration terminée
          const migrationEvent = new CustomEvent('claraverse:migration:completed', {
            detail: {
              stats: migrationStats,
              timestamp: Date.now()
            },
            bubbles: true
          });
          document.dispatchEvent(migrationEvent);
        } else {
          console.log("✅ Aucune donnée legacy trouvée, migration non nécessaire");
        }
      } catch (migrationError) {
        console.error("❌ Erreur migration automatique:", migrationError);

        // Émettre un événement d'erreur de migration
        const migrationErrorEvent = new CustomEvent('claraverse:migration:error', {
          detail: {
            error: migrationError.message,
            timestamp: Date.now()
          },
          bubbles: true
        });
        document.dispatchEvent(migrationErrorEvent);
      }

      // 5. Restauration initiale après chargement
      setTimeout(() => {
        storageManager.restoreAllTablesFromStorage();
      }, 1000);

      // 6. Diagnostics de démarrage et vérifications de santé
      const healthCheck = await performStartupHealthCheck(storageManager);

      console.log("✅ TableStorageManager initialisé");
      console.log("💾 API: window.claraverseStorageAPI");
      console.log(`📊 Storage: ${healthCheck.storage.tableCount} table(s), ${healthCheck.storage.totalSizeMB} MB`);
      console.log(`🔍 Session: ${healthCheck.session.detected ? healthCheck.session.sessionId.substring(0, 20) + '...' : 'Non détectée'}`);
      console.log(`📦 Conteneurs: ${healthCheck.containers.containerCount} actif(s), ${healthCheck.containers.totalTables} table(s)`);

      // Afficher les avertissements de santé
      if (healthCheck.warnings.length > 0) {
        console.warn("⚠️ Avertissements de santé détectés:");
        healthCheck.warnings.forEach(warning => console.warn(`  - ${warning}`));
      }

      // Afficher les erreurs critiques
      if (healthCheck.errors.length > 0) {
        console.error("❌ Erreurs critiques détectées:");
        healthCheck.errors.forEach(error => console.error(`  - ${error}`));
      }

      // Recommandations
      if (healthCheck.recommendations.length > 0) {
        console.log("💡 Recommandations:");
        healthCheck.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }

      // 7. Émettre un événement d'initialisation complète
      const initEvent = new CustomEvent('claraverse:storage:initialized', {
        detail: {
          version: '2.0',
          healthCheck: healthCheck,
          timestamp: Date.now(),
          success: healthCheck.errors.length === 0
        },
        bubbles: true
      });
      document.dispatchEvent(initEvent);

      // 8. Programmer des tâches de maintenance périodiques
      scheduleMaintenanceTasks(storageManager);

    } catch (error) {
      console.error("❌ Erreur initialisation storage:", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initStorage, 500);
    });
  } else {
    setTimeout(initStorage, 500);
  }

  window.addEventListener("beforeunload", () => {
    storageManager.cleanup();
  });

  console.log("🚀 menu_storage.js chargé");

  // ============================================
  // TESTS ET DIAGNOSTICS (Mode développement)
  // ============================================

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Charger les tests en mode développement
    const loadTests = () => {
      const script = document.createElement('script');
      script.src = 'tests/context-manager.test.js';
      script.onload = () => {
        console.log('🧪 Tests Context Manager chargés');

        // Ajouter une fonction globale pour exécuter les tests
        window.testContextManager = () => {
          if (window.runContextManagerTests) {
            return window.runContextManagerTests();
          } else {
            console.error('❌ Tests non disponibles');
          }
        };
      };
      document.head.appendChild(script);
    };

    // Charger les tests après un délai pour s'assurer que tout est initialisé
    setTimeout(loadTests, 1000);
  }
})();
