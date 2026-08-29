/**
 * ClaraVerse Contextual ID Manager v1.0
 * Gestionnaire d'identification contextuelle robuste pour éviter les collisions
 * Gère les contextes : Utilisateur + Chat + Div + Table + Timestamp
 */

class ContextualIdManager {
  constructor() {
    this.version = "1.0.0";
    this.config = {
      STORAGE_PREFIX: "claraverse_ctx_",
      SEPARATOR: "__",
      MAX_CONTENT_HASH_LENGTH: 12,
      CONTEXT_CACHE_TTL: 300000, // 5 minutes
      DEBUG_MODE: true
    };

    // Cache des contextes pour optimisation
    this.contextCache = new Map();
    this.tableRegistry = new Map();
    this.currentContext = null;

    this.log("🆔 Contextual ID Manager initialisé");
  }

  /**
   * Génère un contexte complet pour une table
   * Format: user__chatId__divContext__tableSignature__timestamp
   */
  generateFullContext(table, options = {}) {
    try {
      const context = {
        userId: this.extractUserId(),
        chatId: this.extractChatId(),
        divContext: this.extractDivContext(table),
        tableSignature: this.generateTableSignature(table),
        timestamp: options.useTimestamp ? Date.now() : null,
        version: this.version
      };

      const contextId = this.buildContextId(context);

      // Cache le contexte
      this.contextCache.set(contextId, {
        context,
        table,
        created: Date.now(),
        lastAccessed: Date.now()
      });

      this.log(`Contexte généré: ${contextId}`, 'info');
      return contextId;

    } catch (error) {
      this.log(`Erreur génération contexte: ${error.message}`, 'error');
      return this.generateFallbackContext(table);
    }
  }

  /**
   * Extrait l'ID utilisateur de diverses sources
   */
  extractUserId() {
    try {
      // Méthode 1: Attributs data
      const userElement = document.querySelector('[data-user-id], [data-userid]');
      if (userElement) {
        return userElement.dataset.userId || userElement.dataset.userid;
      }

      // Méthode 2: Meta tags
      const userMeta = document.querySelector('meta[name="user-id"], meta[name="userId"]');
      if (userMeta) {
        return userMeta.content;
      }

      // Méthode 3: Variables globales communes
      if (window.currentUser?.id) return window.currentUser.id;
      if (window.user?.id) return window.user.id;
      if (window.userId) return window.userId;

      // Méthode 4: LocalStorage
      const storedUser = localStorage.getItem('userId') || localStorage.getItem('currentUserId');
      if (storedUser) return storedUser;

      // Méthode 5: URL patterns
      const urlMatch = window.location.pathname.match(/\/user\/([^\/]+)/);
      if (urlMatch) return urlMatch[1];

      // Méthode 6: Session storage
      const sessionUser = sessionStorage.getItem('userId');
      if (sessionUser) return sessionUser;

      // Fallback: générer ID temporaire basé sur session
      const tempId = `temp_${this.hashString(navigator.userAgent + Date.now())}`;
      this.log(`Aucun userId trouvé, utilisation temporaire: ${tempId}`, 'warn');
      return tempId;

    } catch (error) {
      this.log(`Erreur extraction userId: ${error.message}`, 'error');
      return 'unknown_user';
    }
  }

  /**
   * Extrait l'ID du chat de diverses sources
   */
  extractChatId() {
    try {
      // Méthode 1: Attributs data spécifiques au chat
      const chatElements = document.querySelectorAll([
        '[data-conversation-id]',
        '[data-chat-id]',
        '[data-chatid]',
        '[data-thread-id]',
        '.chat-container[data-id]',
        '.conversation[data-id]'
      ].join(', '));

      for (const element of chatElements) {
        const chatId = element.dataset.conversationId ||
                      element.dataset.chatId ||
                      element.dataset.chatid ||
                      element.dataset.threadId ||
                      element.dataset.id;
        if (chatId) return chatId;
      }

      // Méthode 2: Variables globales
      if (window.currentConversation?.id) return window.currentConversation.id;
      if (window.chatId) return window.chatId;
      if (window.conversationId) return window.conversationId;

      // Méthode 3: URL patterns
      const urlPatterns = [
        /\/chat\/([^\/\?]+)/,
        /\/conversation\/([^\/\?]+)/,
        /\/c\/([^\/\?]+)/,
        /[\?&]chat[_-]?id=([^&]+)/,
        /[\?&]conversation[_-]?id=([^&]+)/
      ];

      for (const pattern of urlPatterns) {
        const match = window.location.href.match(pattern);
        if (match) return match[1];
      }

      // Méthode 4: Contenu de page - recherche d'IDs dans le DOM
      const textContent = document.body.textContent;
      const contentIdMatch = textContent.match(/(?:chat|conversation)[-_]?id:\s*([a-zA-Z0-9-_]+)/i);
      if (contentIdMatch) return contentIdMatch[1];

      // Méthode 5: Hash de l'URL comme fallback
      const urlHash = this.hashString(window.location.pathname + window.location.search);
      this.log(`Aucun chatId trouvé, utilisation hash URL: ${urlHash}`, 'warn');
      return `url_${urlHash}`;

    } catch (error) {
      this.log(`Erreur extraction chatId: ${error.message}`, 'error');
      return 'unknown_chat';
    }
  }

  /**
   * Extrait le contexte de la div conteneur
   */
  extractDivContext(table) {
    try {
      // Remonte la hiérarchie pour trouver un conteneur identifiable
      let currentElement = table;
      const maxDepth = 10;
      let depth = 0;

      while (currentElement && currentElement !== document.body && depth < maxDepth) {
        // Vérifier les attributs d'identification
        if (currentElement.id) {
          return `id_${currentElement.id}`;
        }

        if (currentElement.dataset.testid) {
          return `testid_${currentElement.dataset.testid}`;
        }

        if (currentElement.dataset.component) {
          return `component_${currentElement.dataset.component}`;
        }

        // Classes significatives
        const significantClasses = [
          'chat-message', 'message', 'conversation',
          'prose', 'markdown', 'content',
          'assistant', 'user', 'response'
        ];

        for (const className of significantClasses) {
          if (currentElement.classList.contains(className)) {
            const index = Array.from(document.querySelectorAll(`.${className}`))
              .indexOf(currentElement);
            return `class_${className}_${index}`;
          }
        }

        currentElement = currentElement.parentElement;
        depth++;
      }

      // Fallback: position dans le document
      const allTables = Array.from(document.querySelectorAll('table'));
      const tableIndex = allTables.indexOf(table);
      return `doc_pos_${tableIndex}`;

    } catch (error) {
      this.log(`Erreur extraction divContext: ${error.message}`, 'error');
      return 'unknown_div';
    }
  }

  /**
   * Génère une signature unique pour une table basée sur son contenu et structure
   */
  generateTableSignature(table) {
    try {
      const signature = {
        // Structure de base
        rows: table.rows.length,
        cols: table.rows[0]?.cells.length || 0,

        // Headers (première ligne)
        headers: this.extractTableHeaders(table),

        // Échantillon du contenu (premières cellules)
        contentSample: this.extractContentSample(table),

        // Classes CSS significatives
        classes: this.extractSignificantClasses(table)
      };

      // Créer hash de la signature
      const signatureString = JSON.stringify(signature);
      const hash = this.hashString(signatureString);

      return hash.substring(0, this.config.MAX_CONTENT_HASH_LENGTH);

    } catch (error) {
      this.log(`Erreur génération signature table: ${error.message}`, 'error');
      return this.hashString(table.outerHTML).substring(0, 8);
    }
  }

  /**
   * Extrait les headers de la table
   */
  extractTableHeaders(table) {
    try {
      const headers = [];
      const headerRow = table.querySelector('thead tr') || table.rows[0];

      if (headerRow) {
        Array.from(headerRow.cells).forEach(cell => {
          const text = cell.textContent.trim();
          if (text.length > 0) {
            headers.push(text.substring(0, 20)); // Limite longueur
          }
        });
      }

      return headers;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extrait un échantillon du contenu de la table
   */
  extractContentSample(table) {
    try {
      const sample = [];
      const maxRows = Math.min(3, table.rows.length);
      const maxCols = Math.min(3, table.rows[0]?.cells.length || 0);

      for (let i = 0; i < maxRows; i++) {
        const row = table.rows[i];
        const rowSample = [];

        for (let j = 0; j < maxCols; j++) {
          const cell = row.cells[j];
          if (cell) {
            const text = cell.textContent.trim().substring(0, 15);
            rowSample.push(text);
          }
        }

        sample.push(rowSample);
      }

      return sample;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extrait les classes CSS significatives
   */
  extractSignificantClasses(table) {
    const significantPatterns = [
      /min-w-/, /max-w-/, /border/, /rounded/,
      /table/, /prose/, /markdown/,
      /dark:/, /light:/
    ];

    const classes = Array.from(table.classList).filter(className => {
      return significantPatterns.some(pattern => pattern.test(className));
    });

    return classes.slice(0, 5); // Limiter le nombre
  }

  /**
   * Construit l'ID contextuel final
   */
  buildContextId(context) {
    const parts = [
      `u${context.userId}`,
      `c${context.chatId}`,
      `d${context.divContext}`,
      `t${context.tableSignature}`
    ];

    if (context.timestamp) {
      parts.push(`ts${context.timestamp}`);
    }

    return parts.join(this.config.SEPARATOR);
  }

  /**
   * Génère un contexte de fallback en cas d'erreur
   */
  generateFallbackContext(table) {
    const fallbackId = `fallback${this.config.SEPARATOR}${Date.now()}${this.config.SEPARATOR}${Math.random().toString(36).substr(2, 9)}`;
    this.log(`Utilisation contexte fallback: ${fallbackId}`, 'warn');
    return fallbackId;
  }

  /**
   * Vérifie si un contexte existe déjà
   */
  contextExists(contextId) {
    // Vérifier cache
    if (this.contextCache.has(contextId)) {
      return true;
    }

    // Vérifier localStorage
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith(this.config.STORAGE_PREFIX) && key.includes(contextId)
    );

    return keys.length > 0;
  }

  /**
   * Récupère les informations d'un contexte
   */
  getContextInfo(contextId) {
    // Depuis le cache
    const cached = this.contextCache.get(contextId);
    if (cached) {
      cached.lastAccessed = Date.now();
      return cached.context;
    }

    // Parser depuis l'ID
    try {
      const parts = contextId.split(this.config.SEPARATOR);
      return {
        userId: parts[0]?.replace('u', ''),
        chatId: parts[1]?.replace('c', ''),
        divContext: parts[2]?.replace('d', ''),
        tableSignature: parts[3]?.replace('t', ''),
        timestamp: parts[4]?.replace('ts', '') || null
      };
    } catch (error) {
      this.log(`Erreur parsing contexte ${contextId}: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Nettoie les contextes expirés du cache
   */
  cleanupExpiredContexts() {
    const now = Date.now();
    const expired = [];

    this.contextCache.forEach((value, key) => {
      if (now - value.lastAccessed > this.config.CONTEXT_CACHE_TTL) {
        expired.push(key);
      }
    });

    expired.forEach(key => this.contextCache.delete(key));

    if (expired.length > 0) {
      this.log(`Nettoyé ${expired.length} contextes expirés du cache`);
    }
  }

  /**
   * Fonction de hash simple et rapide
   */
  hashString(str) {
    let hash = 0;
    if (str.length === 0) return '0';

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Génère une clé de stockage complète
   */
  generateStorageKey(contextId, dataType = 'data') {
    return `${this.config.STORAGE_PREFIX}${dataType}_${contextId}`;
  }

  /**
   * Valide un contexte
   */
  validateContext(contextId) {
    if (!contextId || typeof contextId !== 'string') {
      return false;
    }

    const parts = contextId.split(this.config.SEPARATOR);
    return parts.length >= 4; // Au minimum user, chat, div, table
  }

  /**
   * Compare deux contextes pour similarité
   */
  compareContexts(contextId1, contextId2) {
    const context1 = this.getContextInfo(contextId1);
    const context2 = this.getContextInfo(contextId2);

    if (!context1 || !context2) return 0;

    let similarity = 0;
    const weights = {
      userId: 0.3,
      chatId: 0.4,
      divContext: 0.2,
      tableSignature: 0.1
    };

    Object.keys(weights).forEach(key => {
      if (context1[key] === context2[key]) {
        similarity += weights[key];
      }
    });

    return similarity;
  }

  /**
   * API publique pour récupérer les statistiques
   */
  getStats() {
    return {
      version: this.version,
      cacheSize: this.contextCache.size,
      registrySize: this.tableRegistry.size,
      storageKeys: Object.keys(localStorage).filter(k =>
        k.startsWith(this.config.STORAGE_PREFIX)
      ).length
    };
  }

  /**
   * Logging conditionnel
   */
  log(message, level = 'info') {
    if (!this.config.DEBUG_MODE) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    const prefix = {
      'info': '🆔',
      'warn': '⚠️',
      'error': '❌'
    }[level] || 'ℹ️';

    console.log(`${prefix} [${timestamp}] ContextualIdManager: ${message}`);
  }

  /**
   * Nettoyage et destruction
   */
  cleanup() {
    this.log('Nettoyage Contextual ID Manager...');
    this.contextCache.clear();
    this.tableRegistry.clear();
    this.currentContext = null;
    this.log('Contextual ID Manager nettoyé');
  }
}

// Export global
window.ContextualIdManager = ContextualIdManager;

// Instance globale
window.contextualIdManager = new ContextualIdManager();

// Nettoyage périodique automatique
setInterval(() => {
  if (window.contextualIdManager) {
    window.contextualIdManager.cleanupExpiredContexts();
  }
}, 300000); // 5 minutes

// Event de disponibilité
document.dispatchEvent(new CustomEvent('claraverse:contextual-id-manager-ready', {
  detail: { manager: window.contextualIdManager }
}));

// Nettoyage automatique avant fermeture
window.addEventListener('beforeunload', () => {
  if (window.contextualIdManager) {
    window.contextualIdManager.cleanup();
  }
});

console.log('🆔 ClaraVerse Contextual ID Manager v1.0 chargé et prêt');
