/**
 * EtatFinAutoTrigger.js - V1.0
 * Détecte automatiquement les tables Etat_fin et déclenche le traitement
 * SANS AUCUNE INTERACTION MANUELLE (pas de clic droit, pas de menu)
 * 
 * @version 1.0.0
 * @description
 * - Détecte automatiquement les tables avec entête "Etat_fin"
 * - Ouvre automatiquement le dialogue de sélection de fichier
 * - Envoie le fichier vers le backend Python
 * - Remplace la table avec les résultats (Bilan et Compte de Résultat)
 * 
 * DÉCLENCHEMENT 100% AUTOMATIQUE
 */

(function () {
  "use strict";

  console.group("🚀 ÉTATS FINANCIERS AUTO TRIGGER V1.0 - INITIALISATION");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log("📋 Mode: DÉCLENCHEMENT AUTOMATIQUE (pas de clic droit)");
  console.groupEnd();

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  const CONFIG = {
    // Configuration États Financiers
    ETAT_FIN: {
      triggerHeader: "Etat_fin",
      endpoint: (window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/etats-financiers/process-excel',
      acceptedFormats: [".xlsx", ".xls"],
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      description: "États Financiers SYSCOHADA"
    },

    // Sélecteurs CSS
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    },

    // Attribut pour marquer les tables traitées
    PROCESSED_ATTR: "data-etat-fin-processed"
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
   * Vérifie si une table est une table Etat_fin
   */
  function isEtatFinTable(table) {
    const headers = Array.from(table.querySelectorAll("th"))
      .map(th => th.textContent.trim());

    return headers.includes(CONFIG.ETAT_FIN.triggerHeader);
  }

  /**
   * Ouvre automatiquement le dialogue de sélection de fichier
   */
  function openFileDialog() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = CONFIG.ETAT_FIN.acceptedFormats.join(',');
      input.style.display = 'none';

      input.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        document.body.removeChild(input);
        resolve(file || null);
      });

      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        resolve(null);
      });

      document.body.appendChild(input);
      
      // Ouvrir le dialogue automatiquement après un court délai
      setTimeout(() => {
        console.log("📂 Ouverture automatique du dialogue de sélection de fichier");
        input.click();
      }, 300);
    });
  }

  /**
   * Convertit un fichier en base64
   */
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
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
   * Envoie le fichier vers le backend
   */
  async function sendToBackend(file) {
    console.group("📤 ENVOI VERS BACKEND");
    console.log("📁 Fichier:", file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    console.log("🌐 Endpoint:", CONFIG.ETAT_FIN.endpoint);

    const fileBase64 = await readFileAsBase64(file);
    console.log("✅ Fichier encodé en base64:", fileBase64.length, "caractères");

    const response = await fetch(CONFIG.ETAT_FIN.endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        file_base64: fileBase64,
        filename: file.name
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
   * Remplace la table avec les résultats HTML
   */
  function replaceTableWithResults(table, html) {
    console.group("🔄 REMPLACEMENT DE LA TABLE");

    // Essayer plusieurs sélecteurs pour trouver le div parent
    let parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
    
    if (!parentDiv) {
      console.warn("⚠️ Sélecteur principal non trouvé, essai avec sélecteurs alternatifs");
      
      // Essayer des sélecteurs alternatifs plus génériques
      parentDiv = table.closest('div.prose') || 
                  table.closest('div[class*="prose"]') ||
                  table.closest('div[class*="message"]') ||
                  table.closest('div') ||
                  table.parentElement;
    }
    
    if (!parentDiv) {
      console.error("❌ Aucun div parent trouvé!");
      console.groupEnd();
      return false;
    }

    console.log("📍 Div parent trouvé:", parentDiv.className || 'sans classe');
    console.log("📍 Div parent tag:", parentDiv.tagName);
    console.log("📊 HTML à insérer - Longueur:", html.length, "caractères");

    // Créer un conteneur pour les résultats
    const container = document.createElement('div');
    container.className = 'etat-fin-results';
    container.style.cssText = `
      margin-top: 20px; 
      display: block !important; 
      visibility: visible !important; 
      opacity: 1 !important;
      width: 100%;
      min-height: 100px;
    `;

    // Ajouter un titre
    const title = document.createElement('h3');
    title.textContent = '📊 États Financiers SYSCOHADA';
    title.style.cssText = `
      margin: 0 0 16px 0; 
      color: #333; 
      font-size: 18px; 
      font-weight: 600;
      display: block !important;
    `;
    container.appendChild(title);

    // Ajouter le HTML des résultats
    const resultsContainer = document.createElement('div');
    resultsContainer.innerHTML = html;
    resultsContainer.style.cssText = 'display: block !important; width: 100%;';
    container.appendChild(resultsContainer);

    // Remplacer le contenu de la div parent
    parentDiv.innerHTML = '';
    parentDiv.appendChild(container);
    
    // Forcer l'affichage du parent
    parentDiv.style.display = 'block';
    parentDiv.style.visibility = 'visible';
    parentDiv.style.opacity = '1';

    // Logs de débogage détaillés
    console.log("📊 Vérification après insertion:");
    console.log("  - Container inséré:", container.isConnected);
    console.log("  - Container visible:", window.getComputedStyle(container).display);
    console.log("  - Accordéons trouvés:", parentDiv.querySelectorAll('.section-header-ef').length);
    console.log("  - Contenus trouvés:", parentDiv.querySelectorAll('.section-content-ef').length);
    console.log("  - Tables trouvées:", parentDiv.querySelectorAll('.liasse-table').length);

    // Attacher les événements des accordéons APRÈS l'insertion dans le DOM
    setTimeout(() => {
      const headers = parentDiv.querySelectorAll('.section-header-ef');
      console.log(`📋 États Financiers: ${headers.length} accordéons trouvés`);
      
      if (headers.length === 0) {
        console.warn("⚠️ Aucun accordéon trouvé! Vérifier le HTML généré par le backend");
        console.log("📄 HTML inséré (premiers 500 caractères):", html.substring(0, 500));
      }
      
      headers.forEach((header, index) => {
        // Ajouter un style pour rendre l'accordéon visible
        header.style.display = 'flex';
        header.style.cursor = 'pointer';
        
        header.addEventListener('click', function() {
          console.log('🖱️ Clic sur accordéon:', this.textContent.trim());
          this.classList.toggle('active');
          const content = this.nextElementSibling;
          if (content) {
            content.classList.toggle('active');
            console.log('  - Accordéon ouvert:', content.classList.contains('active'));
          }
        });
        
        // Ouvrir le premier accordéon par défaut (BILAN ACTIF)
        if (index === 0) {
          console.log('🔓 Ouverture automatique du premier accordéon');
          header.classList.add('active');
          const content = header.nextElementSibling;
          if (content) {
            content.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
            console.log('  - Max-height défini:', content.style.maxHeight);
          }
        }
      });
      
      console.log('✅ Événements des accordéons attachés');
      console.log('✅ Premier accordéon ouvert par défaut');
      
      // Scroll vers les résultats
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    console.log("✅ Table remplacée avec les résultats");
    console.groupEnd();

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TRAITEMENT PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Traite automatiquement une table Etat_fin
   */
  async function processEtatFinTable(table) {
    console.group("🎯 TRAITEMENT AUTOMATIQUE ÉTATS FINANCIERS");

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
      updateTableContent(table, '📂 Sélectionnez votre fichier Balance Excel...');

      // Ouvrir automatiquement le dialogue
      showNotification('📂 Sélectionnez votre fichier de balance Excel', 'info');
      
      const file = await openFileDialog();

      if (!file) {
        console.log("❌ Sélection de fichier annulée");
        updateTableContent(table, '❌ Sélection annulée');
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        console.groupEnd();
        return;
      }

      console.log("✅ Fichier sélectionné:", file.name);

      // Vérifier le format
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!CONFIG.ETAT_FIN.acceptedFormats.includes(ext)) {
        const message = `⚠️ Format non supporté. Formats acceptés: ${CONFIG.ETAT_FIN.acceptedFormats.join(', ')}`;
        showNotification(message, 'error');
        updateTableContent(table, message);
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        console.groupEnd();
        return;
      }

      // Vérifier la taille
      if (file.size > CONFIG.ETAT_FIN.maxFileSize) {
        const maxSizeMB = (CONFIG.ETAT_FIN.maxFileSize / 1024 / 1024).toFixed(0);
        const message = `⚠️ Fichier trop volumineux (max: ${maxSizeMB} MB)`;
        showNotification(message, 'error');
        updateTableContent(table, message);
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        console.groupEnd();
        return;
      }

      // Mettre à jour la table
      updateTableContent(table, `📊 Traitement de ${file.name} en cours...`);
      showNotification(`📊 Génération des états financiers...`, 'info');

      // Envoyer vers le backend
      const result = await sendToBackend(file);

      // Remplacer la table avec les résultats
      if (result.success && result.html) {
        // Stocker les résultats pour l'export
        if (result.results) {
          window.lastEtatsFinanciersResults = result.results;
          console.log("✅ Résultats stockés dans window.lastEtatsFinanciersResults");
        }
        
        const replaced = replaceTableWithResults(table, result.html);

        if (replaced) {
          showNotification(
            result.message || '✅ États financiers générés avec succès!',
            'success'
          );

          // Marquer comme complété
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'completed');

          // Événement personnalisé
          document.dispatchEvent(new CustomEvent('claraverse:etat-fin:success', {
            detail: { 
              filename: file.name, 
              timestamp: Date.now(),
              results: result.results
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
      cell.title = 'Cliquer pour sélectionner un fichier Balance Excel';
      
      cell.addEventListener('click', function() {
        console.log("🖱️ Clic sur cellule Etat_fin détecté");
        
        // Vérifier si la table n'est pas déjà en cours de traitement
        const currentStatus = table.getAttribute(CONFIG.PROCESSED_ATTR);
        if (currentStatus === 'processing' || currentStatus === 'completed') {
          console.log("⏭️ Table déjà en cours de traitement ou complétée");
          return;
        }
        
        // Réinitialiser l'attribut pour permettre le traitement
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        processEtatFinTable(table);
      });
      
      console.log("✅ Gestionnaire de clic ajouté sur la cellule");
    }
  }

  /**
   * Scan toutes les tables et traite les tables Etat_fin
   * MODE: DÉCLENCHEMENT AUTOMATIQUE + Clic sur cellule
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

    allTables.forEach((table) => {
      if (isEtatFinTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
        console.log("🎯 Table Etat_fin détectée - Déclenchement automatique");
        
        // Ajouter le gestionnaire de clic AVANT le traitement automatique
        addCellClickHandler(table);
        
        // Déclencher automatiquement le traitement
        processEtatFinTable(table);
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

  window.EtatFinAutoTrigger = {
    scan: scanAndProcess,
    config: CONFIG,
    version: "1.0.0",
    
    // Fonction pour déclencher manuellement depuis le menu contextuel
    triggerFromContextMenu: function(table) {
      console.log("🎯 Déclenchement manuel depuis menu contextuel");
      if (table && isEtatFinTable(table)) {
        // Réinitialiser l'attribut pour permettre le traitement
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        processEtatFinTable(table);
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

  console.log("🌐 API: EtatFinAutoTrigger.test() / EtatFinAutoTrigger.reset()");

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
        isEtatFinTable(t) && !t.getAttribute(CONFIG.PROCESSED_ATTR)
      );
      
      if (unprocessed.length > 0) {
        console.log(`🔄 ${unprocessed.length} table(s) Etat_fin non traitée(s) détectée(s)`);
        scanAndProcess();
      }
    }, 3000);
    
    console.log("✅ ÉTATS FINANCIERS AUTO TRIGGER V1.0 INITIALISÉ");
    console.log("📋 Mode: DÉCLENCHEMENT 100% AUTOMATIQUE");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
