/**
 * ========================================
 * CLARAVERSE CONFIGURATION v3.0
 * ========================================
 *
 * Fichier de configuration optionnel pour personnaliser
 * le comportement de la synchronisation ClaraVerse
 *
 * Usage:
 * 1. Charger ce fichier AVANT les autres scripts
 * 2. Modifier les paramètres selon vos besoins
 * 3. Les scripts détecteront automatiquement cette config
 */

(function() {
  'use strict';

  // Configuration globale ClaraVerse
  window.CLARAVERSE_CONFIG = {

    /**
     * ========================================
     * CONFIGURATION GÉNÉRALE
     * ========================================
     */
    VERSION: '3.0.0',
    DEBUG: true,                    // Activer les logs détaillés
    ENVIRONMENT: 'production',      // 'development' | 'production' | 'test'

    /**
     * ========================================
     * COORDINATEUR
     * ========================================
     */
    COORDINATOR: {
      // Délais d'initialisation
      INIT_DELAY: 1000,             // Délai avant initialisation (ms)
      SCRIPT_DETECTION_TIMEOUT: 30000, // Timeout détection scripts (ms)
      SCRIPT_DETECTION_INTERVAL: 2000,  // Intervalle de détection (ms)

      // Gestion des événements
      EVENT_DEBOUNCE_DELAY: 300,    // Délai anti-rebond événements (ms)
      MAX_EVENT_HISTORY: 100,       // Nombre max d'événements en historique

      // Priorités des scripts (plus faible = plus prioritaire)
      SCRIPT_PRIORITIES: {
        'coordinator': 0,
        'dev': 1,
        'conso': 2,
        'menu': 3
      }
    },

    /**
     * ========================================
     * SYNCHRONISATION
     * ========================================
     */
    SYNC: {
      // Délais de synchronisation
      SYNC_DELAY: 200,              // Délai avant sync (ms)
      BATCH_DELAY: 100,             // Délai entre batches (ms)
      RETRY_DELAY: 500,             // Délai avant retry (ms)

      // Tentatives et timeouts
      MAX_RETRIES: 3,               // Nombre max de tentatives
      OPERATION_TIMEOUT: 5000,      // Timeout par opération (ms)
      MASTER_SYNC_TIMEOUT: 30000,   // Timeout sync complète (ms)

      // Queue de synchronisation
      MAX_QUEUE_SIZE: 50,           // Taille max de la queue
      QUEUE_PROCESSING_INTERVAL: 100, // Intervalle traitement queue (ms)

      // Conflits et validation
      CONFLICT_RESOLUTION_TIMEOUT: 2000, // Timeout résolution conflits (ms)
      DATA_VALIDATION_STRICT: true, // Validation stricte des données
    },

    /**
     * ========================================
     * STOCKAGE (DEV.JS)
     * ========================================
     */
    STORAGE: {
      // Préfixes localStorage
      PREFIX_DEV: 'claraverse_dev_',
      PREFIX_SYNC: 'claraverse_sync_',
      PREFIX_META: 'claraverse_meta_',
      PREFIX_BACKUP: 'claraverse_backup_',

      // Gestion des données
      MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB max
      DATA_EXPIRATION_DAYS: 30,     // Expiration données (jours)
      AUTO_CLEANUP_INTERVAL: 3600000, // Nettoyage auto (1h)

      // Sauvegarde et restauration
      AUTO_SAVE_DELAY: 1000,        // Délai sauvegarde auto (ms)
      RESTORE_TIMEOUT: 5000,        // Timeout restauration (ms)
      BACKUP_FREQUENCY: 24 * 3600000, // Fréquence backup (24h)

      // Validation
      VALIDATE_ON_SAVE: true,       // Valider avant sauvegarde
      VALIDATE_ON_RESTORE: true,    // Valider avant restauration
      COMPRESS_DATA: false,         // Compresser les données (expérimental)
    },

    /**
     * ========================================
     * SCANNER DE TABLES
     * ========================================
     */
    SCANNER: {
      // Sélecteurs CSS pour les tables ClaraVerse
      TABLE_SELECTORS: [
        // Sélecteur principal ClaraVerse
        'div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg',

        // Sélecteurs de fallback
        'table.min-w-full.border',
        'table.claraverse-table',
        '.claraverse-conso-table',
        'table[data-claraverse]',
        'table[data-table-id]',

        // Sélecteur générique pour les tables dans les chats
        'div.prose table',
        'div[class*="prose"] table',
        'div[id*="response"] table',
        'div[class*="response"] table'
      ],

      // Configuration du scanning
      SCAN_INTERVAL: 2000,          // Intervalle scan périodique (ms)
      SCAN_DEBOUNCE: 500,           // Anti-rebond pour scan DOM (ms)
      MAX_TABLES_PER_SCAN: 50,      // Limite tables par scan

      // Traitement des cellules
      MIN_CELL_CONTENT_LENGTH: 1,   // Longueur min contenu cellule
      MAX_CELL_CONTENT_LENGTH: 10000, // Longueur max contenu cellule
      EXCLUDE_SELECTORS: [          // Exclure ces éléments
        'input', 'select', 'textarea', 'button', '[contenteditable="false"]'
      ],

      // Cache et performance
      CACHE_PROCESSED_TABLES: true, // Mettre en cache tables traitées
      REPROCESS_INTERVAL: 30000,    // Re-traiter tables (30s)
    },

    /**
     * ========================================
     * INTERFACE UTILISATEUR
     * ========================================
     */
    UI: {
      // Notifications
      SHOW_NOTIFICATIONS: true,     // Afficher notifications
      NOTIFICATION_DURATION: 2000, // Durée notifications (ms)
      NOTIFICATION_POSITION: 'top-right', // Position notifications

      // Indicateurs visuels
      SHOW_TABLE_INDICATORS: true,  // Indicateurs sur tables
      INDICATOR_ANIMATION_DURATION: 300, // Durée animations (ms)

      // Effets visuels
      HIGHLIGHT_RESTORED_CELLS: true, // Surligner cellules restaurées
      HIGHLIGHT_DURATION: 2000,     // Durée surlignage (ms)
      SAVE_ANIMATION_ENABLED: true, // Animations de sauvegarde

      // Couleurs (CSS)
      COLORS: {
        SUCCESS: '#10b981',
        ERROR: '#ef4444',
        WARNING: '#f59e0b',
        INFO: '#3b82f6',
        PROCESSING: '#8b5cf6'
      }
    },

    /**
     * ========================================
     * MONITORING ET MÉTRIQUES
     * ========================================
     */
    MONITORING: {
      // Collecte de métriques
      ENABLE_METRICS: true,         // Activer collecte métriques
      METRICS_INTERVAL: 5000,       // Intervalle collecte (ms)
      METRICS_HISTORY_SIZE: 1000,   // Taille historique métriques

      // Health monitoring
      HEALTH_CHECK_INTERVAL: 10000, // Intervalle health check (ms)
      SCRIPT_INACTIVITY_THRESHOLD: 30000, // Seuil inactivité script (ms)

      // Alertes
      ENABLE_ALERTS: true,          // Activer alertes
      ALERT_THRESHOLDS: {
        SYNC_TIME_MS: 1000,         // Seuil temps sync (ms)
        QUEUE_SIZE: 10,             // Seuil taille queue
        ERROR_RATE: 0.1,            // Seuil taux d'erreur (10%)
        MEMORY_USAGE_MB: 50         // Seuil usage mémoire (MB)
      },

      // Performance
      ENABLE_PERFORMANCE_PROFILING: false, // Profiling performance
      LOG_SLOW_OPERATIONS: true,    // Logger opérations lentes
      SLOW_OPERATION_THRESHOLD: 500 // Seuil opération lente (ms)
    },

    /**
     * ========================================
     * DÉVELOPPEMENT ET DEBUG
     * ========================================
     */
    DEBUG: {
      // Niveaux de log
      LOG_LEVEL: 'info',            // 'error' | 'warn' | 'info' | 'debug'
      CONSOLE_COLORS: true,         // Couleurs dans console
      TIMESTAMP_LOGS: true,         // Timestamps dans logs

      // Debug avancé
      TRACE_EVENTS: false,          // Tracer tous les événements
      TRACE_STORAGE_OPERATIONS: false, // Tracer opérations storage
      TRACE_SYNC_OPERATIONS: true,  // Tracer opérations sync

      // Test et simulation
      ENABLE_TEST_MODE: false,      // Mode test
      SIMULATE_ERRORS: false,       // Simuler erreurs
      MOCK_SLOW_OPERATIONS: false,  // Simuler lenteurs
    },

    /**
     * ========================================
     * SÉCURITÉ ET VALIDATION
     * ========================================
     */
    SECURITY: {
      // Validation des données
      SANITIZE_HTML_CONTENT: true,  // Nettoyer contenu HTML
      VALIDATE_JSON_STRICT: true,   // Validation JSON stricte
      MAX_DATA_SIZE_KB: 1024,       // Taille max données (KB)

      // Protection
      PREVENT_XSS: true,            // Protection XSS
      ENCODE_SPECIAL_CHARS: true,   // Encoder caractères spéciaux

      // Backup et récupération
      AUTO_BACKUP_ON_ERROR: true,   // Backup auto en cas d'erreur
      RECOVERY_MODE_ENABLED: true,  // Mode récupération
    },

    /**
     * ========================================
     * INTÉGRATIONS EXTERNES
     * ========================================
     */
    INTEGRATIONS: {
      // APIs externes (futures extensions)
      ENABLE_API_SYNC: false,       // Sync avec API externe
      API_ENDPOINT: '',             // URL API externe
      API_TIMEOUT: 10000,           // Timeout API (ms)

      // Export/Import
      ENABLE_DATA_EXPORT: true,     // Activer export données
      EXPORT_FORMAT: 'json',        // Format export ('json' | 'csv')
      ENABLE_DATA_IMPORT: true,     // Activer import données

      // Webhooks (futurs)
      ENABLE_WEBHOOKS: false,       // Activer webhooks
      WEBHOOK_URL: '',              // URL webhook
    }
  };

  /**
   * ========================================
   * FONCTIONS UTILITAIRES DE CONFIGURATION
   * ========================================
   */
  window.CLARAVERSE_CONFIG.utils = {

    // Fusionner configuration personnalisée
    mergeConfig: function(customConfig) {
      function deepMerge(target, source) {
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = target[key] || {};
            deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
        return target;
      }

      return deepMerge(window.CLARAVERSE_CONFIG, customConfig);
    },

    // Valider configuration
    validateConfig: function() {
      const config = window.CLARAVERSE_CONFIG;
      const errors = [];

      // Validations de base
      if (config.SYNC.MAX_RETRIES < 1) {
        errors.push('SYNC.MAX_RETRIES doit être >= 1');
      }

      if (config.STORAGE.DATA_EXPIRATION_DAYS < 1) {
        errors.push('STORAGE.DATA_EXPIRATION_DAYS doit être >= 1');
      }

      if (config.SCANNER.SCAN_INTERVAL < 100) {
        errors.push('SCANNER.SCAN_INTERVAL doit être >= 100ms');
      }

      if (errors.length > 0) {
        console.error('❌ Configuration ClaraVerse invalide:', errors);
        return false;
      }

      return true;
    },

    // Obtenir configuration pour un composant
    getConfig: function(component) {
      return window.CLARAVERSE_CONFIG[component.toUpperCase()] || {};
    },

    // Exporter configuration actuelle
    exportConfig: function() {
      return JSON.stringify(window.CLARAVERSE_CONFIG, null, 2);
    },

    // Réinitialiser à la configuration par défaut
    resetToDefault: function() {
      // Cette fonction rechargerait la configuration par défaut
      console.warn('⚠️ Reset configuration non implémenté dans cette version');
    }
  };

  // Validation automatique au chargement
  if (window.CLARAVERSE_CONFIG.utils.validateConfig()) {
    console.log('✅ Configuration ClaraVerse v3.0 chargée et validée');
  } else {
    console.warn('⚠️ Configuration ClaraVerse contient des erreurs');
  }

  // Marquer la configuration comme chargée
  window.CLARAVERSE_CONFIG._loaded = true;
  window.CLARAVERSE_CONFIG._loadTime = Date.now();

})();

/**
 * ========================================
 * EXEMPLES DE PERSONNALISATION
 * ========================================
 */

/*
// Exemple 1: Configuration pour environnement de développement
window.CLARAVERSE_CONFIG.utils.mergeConfig({
  DEBUG: {
    LOG_LEVEL: 'debug',
    TRACE_EVENTS: true,
    ENABLE_TEST_MODE: true
  },
  UI: {
    NOTIFICATION_DURATION: 5000,
    SHOW_NOTIFICATIONS: true
  }
});

// Exemple 2: Configuration pour production
window.CLARAVERSE_CONFIG.utils.mergeConfig({
  DEBUG: {
    LOG_LEVEL: 'warn',
    TRACE_EVENTS: false
  },
  MONITORING: {
    ENABLE_PERFORMANCE_PROFILING: true,
    METRICS_INTERVAL: 10000
  }
});

// Exemple 3: Configuration personnalisée pour tables spécifiques
window.CLARAVERSE_CONFIG.utils.mergeConfig({
  SCANNER: {
    TABLE_SELECTORS: [
      'table.my-custom-table',
      'div.my-container table'
    ]
  }
});
*/
