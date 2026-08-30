/**
 * SYSTÈME DE LOGS ET NOTIFICATIONS - Persistance Tables
 * 
 * Affiche logs détaillés dans console ET notifications visuelles dans l'interface
 * pour suivre les étapes de sauvegarde et restauration des tables.
 * 
 * Usage: Chargé automatiquement par index.html
 */

(function() {
  'use strict';
  
  console.log("🔔 [Logger] Système de logs et notifications chargé");
  
  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════
  
  const CONFIG = {
    ENABLE_CONSOLE_LOGS: true,      // Logs console détaillés
    ENABLE_VISUAL_NOTIFICATIONS: true, // Notifications visuelles
    NOTIFICATION_DURATION: 4000,    // 4 secondes
    LOG_COLORS: {
      success: '#10b981',  // vert
      error: '#ef4444',    // rouge
      warning: '#f59e0b',  // orange
      info: '#3b82f6',     // bleu
      debug: '#6b7280'     // gris
    }
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // CRÉATION CONTENEUR NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════
  
  let notificationContainer = null;
  
  function createNotificationContainer() {
    if (notificationContainer) return;
    
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'persistance-notifications';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      pointer-events: none;
    `;
    
    document.body.appendChild(notificationContainer);
    console.log("📦 [Logger] Conteneur notifications créé");
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // FONCTION NOTIFICATION VISUELLE
  // ═══════════════════════════════════════════════════════════════════════
  
  function showNotification(message, type = 'info', icon = 'ℹ️') {
    if (!CONFIG.ENABLE_VISUAL_NOTIFICATIONS) return;
    
    createNotificationContainer();
    
    const notification = document.createElement('div');
    const bgColor = CONFIG.LOG_COLORS[type] || CONFIG.LOG_COLORS.info;
    
    notification.style.cssText = `
      background: ${bgColor};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
      word-wrap: break-word;
    `;
    
    notification.innerHTML = `
      <span style="font-size: 20px; flex-shrink: 0;">${icon}</span>
      <span style="flex: 1;">${message}</span>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      ">×</button>
    `;
    
    // Ajouter animation CSS
    if (!document.getElementById('persistance-animations')) {
      const style = document.createElement('style');
      style.id = 'persistance-animations';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    notificationContainer.appendChild(notification);
    
    // Auto-remove après durée configurée
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, CONFIG.NOTIFICATION_DURATION);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LOGGER PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════
  
  const PersistanceLogger = {
    
    // ─────────────────────────────────────────────────────────────────────
    // ÉTAPE 1: INITIALISATION
    // ─────────────────────────────────────────────────────────────────────
    
    logInit: function(sessionId) {
      const shortId = sessionId?.substring(0, 30) + '...';
      
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log("%c🚀 [INIT] Système de persistance démarré", "color: #3b82f6; font-weight: bold");
        console.log(`   SessionId: ${shortId}`);
      }
      
      showNotification(
        `Système de persistance initialisé\nSession: ${sessionId?.substring(0, 20)}...`,
        'info',
        '🚀'
      );
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ÉTAPE 2: SESSION ID SOURCE
    // ─────────────────────────────────────────────────────────────────────
    
    logSessionIdSource: function(source, sessionId) {
      const shortId = sessionId?.substring(0, 30) + '...';
      
      if (source === 'DOM') {
        if (CONFIG.ENABLE_CONSOLE_LOGS) {
          console.log("%c✅ [SESSION] SessionId depuis DOM (ISOLATION ACTIVE)", "color: #10b981; font-weight: bold");
          console.log(`   SessionId: ${shortId}`);
        }
        showNotification(
          `✅ Isolation des chats ACTIVE\nSessionId unique par chat`,
          'success',
          '🔒'
        );
      } else {
        if (CONFIG.ENABLE_CONSOLE_LOGS) {
          console.warn("%c⚠️ [SESSION] SessionId depuis " + source, "color: #f59e0b; font-weight: bold");
          console.warn("   ATTENTION: Isolation des chats NON garantie!");
          console.warn(`   SessionId: ${shortId}`);
        }
        showNotification(
          `⚠️ Isolation compromise\nSource: ${source} (pas isolé par chat)`,
          'warning',
          '⚠️'
        );
      }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ÉTAPE 3: SAUVEGARDE TABLE
    // ─────────────────────────────────────────────────────────────────────
    
    logTableSaveStart: function(keyword, tableType = 'table') {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log(`%c💾 [SAVE] Sauvegarde de "${keyword}" démarrée`, "color: #3b82f6; font-weight: bold");
        console.log(`   Type: ${tableType}`);
      }
      
      showNotification(
        `💾 Sauvegarde "${keyword}"...\nType: ${tableType}`,
        'info',
        '💾'
      );
    },
    
    logTableSaveSuccess: function(keyword, tableId, rowCount) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log(`%c✅ [SAVE] Table "${keyword}" sauvegardée`, "color: #10b981; font-weight: bold");
        console.log(`   ID: ${tableId}`);
        console.log(`   Lignes: ${rowCount || 'N/A'}`);
      }
      
      showNotification(
        `✅ "${keyword}" sauvegardée\n${rowCount ? rowCount + ' lignes' : 'Données enregistrées'}`,
        'success',
        '✅'
      );
    },
    
    logTableSaveError: function(keyword, error) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.error(`%c❌ [SAVE] Erreur sauvegarde "${keyword}"`, "color: #ef4444; font-weight: bold");
        console.error(`   Erreur: ${error.message}`);
      }
      
      showNotification(
        `❌ Erreur sauvegarde "${keyword}"\n${error.message}`,
        'error',
        '❌'
      );
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ÉTAPE 4: RESTAURATION TABLES
    // ─────────────────────────────────────────────────────────────────────
    
    logRestoreStart: function(tableCount, sessionId) {
      const shortId = sessionId?.substring(0, 30) + '...';
      
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log(`%c🔄 [RESTORE] Restauration de ${tableCount} table(s)`, "color: #3b82f6; font-weight: bold");
        console.log(`   Session: ${shortId}`);
      }
      
      showNotification(
        `🔄 Restauration ${tableCount} table(s)...\nSession: ${sessionId?.substring(0, 20)}...`,
        'info',
        '🔄'
      );
    },
    
    logTableFound: function(keyword) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log(`%c✅ [RESTORE] Table trouvée: "${keyword}"`, "color: #10b981");
      }
    },
    
    logTableNotFound: function(keyword) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.warn(`%c⚠️ [RESTORE] Table "${keyword}" non trouvée dans DOM`, "color: #f59e0b");
      }
      
      showNotification(
        `⚠️ Table "${keyword}" non trouvée\nPeut-être pas encore générée`,
        'warning',
        '⚠️'
      );
    },
    
    logRestoreSuccess: function(restoredCount, totalCount) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log(`%c✅ [RESTORE] ${restoredCount}/${totalCount} table(s) restaurée(s)`, "color: #10b981; font-weight: bold");
      }
      
      if (restoredCount > 0) {
        showNotification(
          `✅ ${restoredCount}/${totalCount} table(s) restaurée(s)\nDonnées rechargées avec succès`,
          'success',
          '✅'
        );
      }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ÉTAPE 5: CHANGEMENT DE CHAT
    // ─────────────────────────────────────────────────────────────────────
    
    logChatChange: function(oldSessionId, newSessionId) {
      const oldShort = oldSessionId?.substring(0, 20) + '...';
      const newShort = newSessionId?.substring(0, 20) + '...';
      
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log("%c🔄 [CHAT] Changement de chat détecté", "color: #3b82f6; font-weight: bold");
        console.log(`   Ancien: ${oldShort}`);
        console.log(`   Nouveau: ${newShort}`);
      }
      
      showNotification(
        `🔄 Changement de chat\nChargement des tables du nouveau chat...`,
        'info',
        '🔄'
      );
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ÉTAPE 6: INDEXEDDB
    // ─────────────────────────────────────────────────────────────────────
    
    logIndexedDBWrite: function(keyword, size) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log(`%c💽 [IndexedDB] Écriture "${keyword}"`, "color: #6b7280");
        console.log(`   Taille: ${(size / 1024).toFixed(2)} KB`);
      }
    },
    
    logIndexedDBRead: function(keyword, found) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        if (found) {
          console.log(`%c💽 [IndexedDB] Lecture "${keyword}" - TROUVÉE`, "color: #10b981");
        } else {
          console.warn(`%c💽 [IndexedDB] Lecture "${keyword}" - NON TROUVÉE`, "color: #f59e0b");
        }
      }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ERREURS CRITIQUES
    // ─────────────────────────────────────────────────────────────────────
    
    logCriticalError: function(context, error) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.error(`%c🚨 [ERREUR CRITIQUE] ${context}`, "color: #ef4444; font-weight: bold; font-size: 14px");
        console.error(error);
      }
      
      showNotification(
        `🚨 Erreur critique: ${context}\n${error.message}`,
        'error',
        '🚨'
      );
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // DIAGNOSTIC
    // ─────────────────────────────────────────────────────────────────────
    
    logDiagnostic: function(stats) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.log("%c📊 [DIAGNOSTIC] État du système", "color: #3b82f6; font-weight: bold");
        console.table(stats);
      }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // DOUBLONS DÉTECTÉS
    // ─────────────────────────────────────────────────────────────────────
    
    logDuplicateDetected: function(keyword, action) {
      if (CONFIG.ENABLE_CONSOLE_LOGS) {
        console.warn(`%c⚠️ [DOUBLON] Table "${keyword}" existe déjà`, "color: #f59e0b; font-weight: bold");
        console.warn(`   Action: ${action}`);
      }
      
      showNotification(
        `⚠️ Doublon détecté: "${keyword}"\nAction: ${action}`,
        'warning',
        '⚠️'
      );
    }
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSITION GLOBALE
  // ═══════════════════════════════════════════════════════════════════════
  
  window.PersistanceLogger = PersistanceLogger;
  window.showPersistanceNotification = showNotification;
  
  // Fonction utilitaire pour activer/désactiver
  window.togglePersistanceLogs = function(enable) {
    CONFIG.ENABLE_CONSOLE_LOGS = enable;
    console.log(`🔔 [Logger] Logs console ${enable ? 'activés' : 'désactivés'}`);
  };
  
  window.togglePersistanceNotifications = function(enable) {
    CONFIG.ENABLE_VISUAL_NOTIFICATIONS = enable;
    console.log(`🔔 [Logger] Notifications visuelles ${enable ? 'activées' : 'désactivées'}`);
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // 🔍 DIAGNOSTIC AUTOMATIQUE (Accessibles UI)
  // ═══════════════════════════════════════════════════════════════════════
  
  window.PersistanceLogger.runDiagnostic = function() {
    console.log("🔍 [Diagnostic] Démarrage...");
    
    // Vérifier SessionId
    const element = document.querySelector('[data-session-id]');
    const sessionId = element?.getAttribute('data-session-id');
    const isolated = !!sessionId && sessionId !== 'undefined' && sessionId !== 'unknown';
    
    // Vérifier conso.js
    const consoIntegrated = window.claraverseProcessor?.__integrated || false;
    
    // Vérifier doublons
    const allTables = document.querySelectorAll('table');
    const byKeyword = {};
    allTables.forEach(table => {
      const keyword = table.dataset.keyword || 'sans-keyword';
      byKeyword[keyword] = (byKeyword[keyword] || 0) + 1;
    });
    const hasDuplicates = Object.values(byKeyword).some(count => count > 1);
    
    // Vérifier tables
    const hasConsolidation = !!document.querySelector('table[data-keyword="Table_Consolidation"]');
    const hasResultat = !!document.querySelector('table[data-keyword="Table_Resultat"]');
    
    // Compter problèmes
    const issues = [];
    if (!isolated) issues.push("Isolation compromise");
    if (!consoIntegrated) issues.push("conso.js pas intégré");
    if (hasDuplicates) issues.push("Doublons de tables");
    
    // Afficher résultat
    if (issues.length === 0) {
      window.PersistanceLogger.logSuccess(
        `✅ TOUT FONCTIONNE\n\n` +
        `• Isolation: ACTIVE\n` +
        `• conso.js: INTÉGRÉ\n` +
        `• Doublons: AUCUN\n` +
        `• Tables: ${Object.keys(byKeyword).length} uniques`
      );
    } else {
      let message = `⚠️ PROBLÈMES (${issues.length})\n\n`;
      
      if (!isolated) {
        message += `❌ Isolation compromise\n`;
        message += `   SessionId dans DOM: ${element ? 'Oui mais invalide' : 'NON'}\n\n`;
      }
      
      if (!consoIntegrated) {
        message += `❌ conso.js pas intégré\n`;
        message += `   Attendre 2-3s puis relancer\n\n`;
      }
      
      if (hasDuplicates) {
        message += `❌ Doublons détectés\n`;
        const duplicates = Object.entries(byKeyword).filter(([k, c]) => c > 1);
        duplicates.forEach(([k, c]) => {
          message += `   • ${k}: ${c}x\n`;
        });
      }
      
      window.PersistanceLogger.logError(message);
    }
    
    return {
      isolated,
      consoIntegrated,
      hasDuplicates,
      hasConsolidation,
      hasResultat,
      totalTables: allTables.length,
      uniqueKeywords: Object.keys(byKeyword).length
    };
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // 🎨 BOUTON DIAGNOSTIC FLOTTANT
  // ═══════════════════════════════════════════════════════════════════════
  
  function createDiagnosticButton() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createDiagnosticButton);
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'diagnostic-button';
    button.innerHTML = '🔍';
    button.title = 'Diagnostic Système (Cliquer pour vérifier)';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 99998;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    button.onmouseover = function() {
      this.style.transform = 'scale(1.1)';
      this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
    };
    
    button.onmouseout = function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    };
    
    button.onclick = function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 100);
      
      // Exécuter diagnostic
      window.PersistanceLogger.runDiagnostic();
      
      // Aussi exécuter diagnostic complet dans console
      if (window.runFullDiagnostic) {
        setTimeout(() => window.runFullDiagnostic(), 500);
      }
    };
    
    document.body.appendChild(button);
    console.log("🔍 [Logger] Bouton diagnostic créé");
  }
  
  // Créer bouton après un court délai
  setTimeout(createDiagnosticButton, 1000);
  
  console.log("✅ [Logger] Système prêt - Utilisez window.PersistanceLogger");
  console.log("💡 [Logger] Commandes disponibles:");
  console.log("   - togglePersistanceLogs(true/false)");
  console.log("   - togglePersistanceNotifications(true/false)");
  console.log("   - window.PersistanceLogger.runDiagnostic()");
  console.log("   - Bouton flottant 🔍 (bas droite)");
  
})();
