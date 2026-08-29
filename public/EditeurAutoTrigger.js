/**
 * EditeurAutoTrigger.js - V1.0
 * Détecte automatiquement les tables Editeur et déclenche le traitement
 * SANS AUCUNE INTERACTION MANUELLE (pas de clic droit, pas de menu)
 * 
 * @version 1.0.0
 * @description
 * - Détecte automatiquement les tables avec entête "Editeur"
 * - Envoie automatiquement la commande vers le backend Python
 * - Remplace la table avec la réponse du serveur
 * 
 * DÉCLENCHEMENT 100% AUTOMATIQUE - TEST DE SWITCH BACKEND
 */

(function () {
  "use strict";

  console.group("🚀 EDITEUR AUTO TRIGGER V1.0 - INITIALISATION");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log("📋 Mode: TEST DE SWITCH BACKEND (localhost ↔ cloud)");
  console.groupEnd();

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  const CONFIG = {
    // Configuration Editeur
    EDITEUR: {
      triggerHeader: "Editeur",
      endpoint: (window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/editeur/process',
      description: "Test de Switch Backend"
    },

    // Sélecteurs CSS
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    },

    // Attribut pour marquer les tables traitées
    PROCESSED_ATTR: "data-editeur-processed"
  };

  // ═══════════════════════════════════════════════════════════════════════
  // FONCTIONS UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Affiche une notification
   */
  function showNotification(message, type = "success") {
    const colors = {
      success: "linear-gradient(135deg, #4caf50, #45a049)",
      error: "linear-gradient(135deg, #f44336, #d32f2f)",
      info: "linear-gradient(135deg, #2196f3, #1976d2)",
    };

    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${colors[type] || colors.info};
      color: white; padding: 12px 20px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 20000;
      font-size: 14px; opacity: 0; transform: translateY(-20px);
      transition: all 0.3s; max-width: 400px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-20px)";
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  /**
   * Vérifie si une table est une table Editeur
   */
  function isEditeurTable(table) {
    const headers = Array.from(table.querySelectorAll("th"))
      .map(th => th.textContent.trim());

    return headers.includes(CONFIG.EDITEUR.triggerHeader);
  }

  /**
   * Met à jour le contenu de la cellule de la table
   */
  function updateTableContent(table, message) {
    const cell = table.querySelector('td');
    if (cell) {
      cell.textContent = message;
      cell.style.textAlign = 'center';
      cell.style.padding = '20px';
    }
  }

  /**
   * Envoie la commande vers le backend
   */
  async function sendToBackend(command) {
    console.group("📤 ENVOI VERS BACKEND");
    console.log("📝 Commande:", command);
    console.log("🌐 Endpoint:", CONFIG.EDITEUR.endpoint);
    console.log("🔗 Backend URL:", window.CLARA_BACKEND_URL || 'http://localhost:5000');

    const response = await fetch(CONFIG.EDITEUR.endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        command: command,
        message: command
      })
    });

    console.log("📥 Statut réponse:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Erreur backend:", errorData);
      console.groupEnd();
      throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Résultat reçu:", result);
    console.groupEnd();

    return result;
  }

  /**
   * Remplace la table avec les résultats
   */
  function replaceTableWithResults(table, result) {
    console.group("🔄 REMPLACEMENT DE LA TABLE");

    const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);

    if (!parentDiv) {
      console.error("❌ Div parent non trouvée!");
      console.groupEnd();
      return false;
    }

    console.log("📍 Div parent trouvée");

    // Créer un conteneur pour les résultats
    const container = document.createElement('div');
    container.className = 'editeur-results';
    container.style.cssText = 'margin-top: 20px;';

    // Ajouter un titre
    const title = document.createElement('h3');
    title.textContent = '✅ Test de Switch Backend Réussi';
    title.style.cssText = 'margin: 0 0 16px 0; color: #4caf50; font-size: 18px; font-weight: 600;';
    container.appendChild(title);

    // Créer une table pour afficher les résultats
    const resultsTable = document.createElement('table');
    resultsTable.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      border: 1px solid #ddd;
    `;

    // En-tête de la table
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr style="background-color: #f5f5f5;">
        <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Propriété</th>
        <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Valeur</th>
      </tr>
    `;
    resultsTable.appendChild(thead);

    // Corps de la table
    const tbody = document.createElement('tbody');
    
    // Ligne 1: Commande
    const row1 = document.createElement('tr');
    row1.innerHTML = `
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: 500;">Commande</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${result.command || 'N/A'}</td>
    `;
    tbody.appendChild(row1);

    // Ligne 2: Message
    const row2 = document.createElement('tr');
    row2.innerHTML = `
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: 500;">Message</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${result.message || 'N/A'}</td>
    `;
    tbody.appendChild(row2);

    // Ligne 3: Statut
    const row3 = document.createElement('tr');
    row3.innerHTML = `
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: 500;">Statut</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        <span style="color: ${result.success ? '#4caf50' : '#f44336'}; font-weight: 600;">
          ${result.success ? '✅ Succès' : '❌ Échec'}
        </span>
      </td>
    `;
    tbody.appendChild(row3);

    // Ligne 4: Endpoint
    const row4 = document.createElement('tr');
    row4.innerHTML = `
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: 500;">Endpoint</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${result.server_info?.endpoint || 'N/A'}</td>
    `;
    tbody.appendChild(row4);

    // Ligne 5: Version
    const row5 = document.createElement('tr');
    row5.innerHTML = `
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: 500;">Version</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${result.server_info?.version || 'N/A'}</td>
    `;
    tbody.appendChild(row5);

    // Ligne 6: Backend URL
    const row6 = document.createElement('tr');
    row6.innerHTML = `
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: 500;">Backend URL</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">
        ${window.CLARA_BACKEND_URL || 'http://localhost:5000'}
      </td>
    `;
    tbody.appendChild(row6);

    resultsTable.appendChild(tbody);
    container.appendChild(resultsTable);

    // Remplacer le contenu de la div parent
    parentDiv.innerHTML = '';
    parentDiv.appendChild(container);

    console.log("✅ Table remplacée avec les résultats");
    console.groupEnd();

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TRAITEMENT PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Traite automatiquement une table Editeur
   */
  async function processEditeurTable(table) {
    console.group("🎯 TRAITEMENT AUTOMATIQUE EDITEUR");

    // Vérifier si déjà traité
    if (table.getAttribute(CONFIG.PROCESSED_ATTR)) {
      console.log("⏭️ Table déjà traitée");
      console.groupEnd();
      return;
    }

    try {
      // Marquer comme en cours de traitement
      table.setAttribute(CONFIG.PROCESSED_ATTR, 'processing');

      // Mettre à jour la table
      updateTableContent(table, '📡 Test de connexion au backend...');

      // Extraire la commande de la cellule (si présente)
      const cell = table.querySelector('td');
      const command = cell ? cell.textContent.trim() : 'editeur';

      console.log("✅ Commande extraite:", command);

      // Mettre à jour la table
      updateTableContent(table, `📊 Envoi de la commande "${command}"...`);
      showNotification(`📊 Test du switch backend...`, 'info');

      // Envoyer vers le backend
      const result = await sendToBackend(command);

      // Remplacer la table avec les résultats
      if (result.success) {
        const replaced = replaceTableWithResults(table, result);

        if (replaced) {
          showNotification(
            '✅ Test de switch backend réussi!',
            'success'
          );

          // Marquer comme complété
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'completed');

          // Événement personnalisé
          document.dispatchEvent(new CustomEvent('claraverse:editeur:success', {
            detail: { 
              command: command,
              timestamp: Date.now(),
              backend_url: window.CLARA_BACKEND_URL || 'http://localhost:5000',
              result: result
            }
          }));
        } else {
          throw new Error('Impossible d\'afficher les résultats');
        }
      } else {
        throw new Error(result.message || 'Erreur de traitement');
      }

    } catch (error) {
      console.error("❌ Erreur:", error);
      showNotification(`❌ Erreur: ${error.message}`, 'error');
      updateTableContent(table, `❌ Erreur: ${error.message}`);
      table.removeAttribute(CONFIG.PROCESSED_ATTR);
    }

    console.groupEnd();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DÉTECTION AUTOMATIQUE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Ajoute un gestionnaire de clic sur la cellule de la table
   */
  function addCellClickHandler(table) {
    const cell = table.querySelector('td');
    if (cell) {
      cell.style.cursor = 'pointer';
      cell.title = 'Cliquer pour relancer le test';
      
      cell.addEventListener('click', function() {
        console.log("🖱️ Clic sur cellule Editeur détecté");
        
        // Vérifier si la table n'est pas déjà en cours de traitement
        const currentStatus = table.getAttribute(CONFIG.PROCESSED_ATTR);
        if (currentStatus === 'processing') {
          console.log("⏭️ Table déjà en cours de traitement");
          return;
        }
        
        // Réinitialiser l'attribut pour permettre le traitement
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        processEditeurTable(table);
      });
      
      console.log("✅ Gestionnaire de clic ajouté sur la cellule");
    }
  }

  /**
   * Scan toutes les tables et traite les tables Editeur
   * MODE: DÉCLENCHEMENT AUTOMATIQUE + Clic sur cellule
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

    allTables.forEach((table) => {
      if (isEditeurTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
        console.log("🎯 Table Editeur détectée - Déclenchement automatique");
        
        // Ajouter le gestionnaire de clic AVANT le traitement automatique
        addCellClickHandler(table);
        
        // Déclencher automatiquement le traitement
        processEditeurTable(table);
      }
    });
  }

  /**
   * Configure le MutationObserver pour détecter les nouvelles tables
   */
  function setupMutationObserver() {
    let scanTimeout = null;

    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "TABLE" || node.querySelector?.("table")) {
                shouldScan = true;
              }
            }
          });
        }
      });

      if (shouldScan && !scanTimeout) {
        scanTimeout = setTimeout(() => {
          scanAndProcess();
          scanTimeout = null;
        }, 500);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log("👁️ MutationObserver configuré pour détection automatique");
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API GLOBALE
  // ═══════════════════════════════════════════════════════════════════════

  window.EditeurAutoTrigger = {
    scan: scanAndProcess,
    config: CONFIG,
    version: "1.0.0",
    
    // Fonction pour déclencher manuellement depuis le menu contextuel
    triggerFromContextMenu: function(table) {
      console.log("🎯 Déclenchement manuel depuis menu contextuel");
      if (table && isEditeurTable(table)) {
        // Réinitialiser l'attribut pour permettre le traitement
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        processEditeurTable(table);
      }
    },
    
    // Test manuel
    test: function() {
      console.log("🧪 TEST MANUEL");
      scanAndProcess();
    },
    
    // Réinitialiser
    reset: function() {
      document.querySelectorAll(`[${CONFIG.PROCESSED_ATTR}]`).forEach(t => {
        t.removeAttribute(CONFIG.PROCESSED_ATTR);
      });
      console.log("✅ Reset effectué");
    }
  };

  console.log("🌐 API: EditeurAutoTrigger.test() / EditeurAutoTrigger.reset()");

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════

  function init() {
    setupMutationObserver();
    
    // Scan initial après un délai
    setTimeout(scanAndProcess, 2000);
    
    // Scan périodique (backup)
    setInterval(() => {
      const tables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
      const unprocessed = Array.from(tables).filter(t => 
        isEditeurTable(t) && !t.getAttribute(CONFIG.PROCESSED_ATTR)
      );
      
      if (unprocessed.length > 0) {
        console.log(`🔄 ${unprocessed.length} table(s) Editeur non traitée(s) détectée(s)`);
        scanAndProcess();
      }
    }, 3000);
    
    console.log("✅ EDITEUR AUTO TRIGGER V1.0 INITIALISÉ");
    console.log("📋 Mode: TEST DE SWITCH BACKEND");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
