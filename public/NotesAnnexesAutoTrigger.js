/**
 * NotesAnnexesAutoTrigger.js - V1.0
 * Détecte automatiquement les tables Notes_Annexes et déclenche le traitement
 * SANS AUCUNE INTERACTION MANUELLE (pas de clic droit, pas de menu)
 * 
 * @version 1.0.0
 * @description
 * - Détecte automatiquement les tables avec entête "Notes_Annexes"
 * - Ouvre automatiquement le dialogue de sélection de fichier
 * - Envoie le fichier vers le backend Python
 * - Remplace la table avec les résultats (33 notes annexes SYSCOHADA)
 * 
 * DÉCLENCHEMENT 100% AUTOMATIQUE
 */

(function () {
  "use strict";

  console.group("🚀 NOTES ANNEXES AUTO TRIGGER V1.0 - INITIALISATION");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log("📋 Mode: DÉCLENCHEMENT AUTOMATIQUE (pas de clic droit)");
  console.groupEnd();

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  const CONFIG = {
    // Configuration Notes Annexes
    NOTES_ANNEXES: {
      triggerHeader: "Notes_Annexes",
      endpoint: (window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/api/calculer_notes_annexes',
      acceptedFormats: [".xlsx", ".xls"],
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      description: "Notes Annexes SYSCOHADA Révisé",
      timeout: 5 * 60 * 1000 // 5 minutes (calcul peut prendre jusqu'à 30 secondes)
    },

    // Sélecteurs CSS
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    },

    // Attribut pour marquer les tables traitées
    PROCESSED_ATTR: "data-notes-annexes-processed"
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
   * Vérifie si une table est une table Notes_Annexes
   */
  function isNotesAnnexesTable(table) {
    const headers = Array.from(table.querySelectorAll("th"))
      .map(th => th.textContent.trim());

    return headers.includes(CONFIG.NOTES_ANNEXES.triggerHeader);
  }

  /**
   * Ouvre automatiquement le dialogue de sélection de fichier
   */
  function openFileDialog() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = CONFIG.NOTES_ANNEXES.acceptedFormats.join(',');
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
    console.log("🌐 Endpoint:", CONFIG.NOTES_ANNEXES.endpoint);

    const formData = new FormData();
    formData.append('balance_file', file);

    console.log("✅ FormData préparé avec le fichier");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.NOTES_ANNEXES.timeout);

    try {
      const response = await fetch(CONFIG.NOTES_ANNEXES.endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Le calcul a pris trop de temps (> 5 minutes)');
      }
      throw error;
    }
  }

  /**
   * Génère le HTML des accordéons pour les notes annexes
   */
  function generateNotesAnnexesHTML(notes, statuts, metadata) {
    console.group("🎨 GÉNÉRATION HTML DES NOTES ANNEXES");
    console.log("📊 Nombre de notes:", Object.keys(notes).length);

    let html = `
      <div class="notes-annexes-container">
        <div class="notes-annexes-header">
          <h2>📊 Notes Annexes SYSCOHADA Révisé</h2>
          <p>33 notes annexes calculées automatiquement</p>
          <div class="metadata">
            <span>📁 ${metadata.fichier_source}</span>
            <span>⏱️ ${metadata.duree_calcul}s</span>
            <span>✓ Cohérence: ${metadata.taux_coherence}%</span>
          </div>
        </div>

        <div class="controls-na">
          <button class="btn-na" onclick="expandAllNotesAnnexes()">📂 Tout Ouvrir</button>
          <button class="btn-na" onclick="collapseAllNotesAnnexes()">📁 Tout Fermer</button>
          <span class="notes-count">${Object.keys(notes).length} notes disponibles</span>
        </div>

        <div class="notes-list">
    `;

    // Générer chaque note
    Object.entries(notes).forEach(([noteKey, noteData], index) => {
      const statut = statuts[noteKey] || '✓ Succès';
      const icon = getIconForNote(noteKey);
      const titre = getTitreForNote(noteKey, noteData);
      const isFirst = index === 0;

      html += `
        <div class="notes-annexes-section ${isFirst ? 'active' : ''}" data-note="${noteKey}">
          <div class="section-header-na" onclick="toggleNoteSection('${noteKey}')">
            <span>${icon} ${titre}</span>
            <span class="statut">${statut}</span>
            <span class="arrow">›</span>
          </div>
          <div class="section-content-na ${isFirst ? 'active' : ''}">
            ${generateNoteTable(noteData)}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    console.log("✅ HTML généré:", html.length, "caractères");
    console.groupEnd();

    return html;
  }

  /**
   * Génère le tableau HTML pour une note
   */
  function generateNoteTable(noteData) {
    if (!noteData.colonnes || !noteData.lignes) {
      return '<p>Aucune donnée disponible</p>';
    }

    let html = '<table class="notes-annexes-table"><thead><tr>';
    
    // En-têtes
    noteData.colonnes.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Lignes
    noteData.lignes.forEach((ligne, idx) => {
      const isTotal = ligne[0]?.toString().toLowerCase().includes('total');
      html += `<tr class="${isTotal ? 'total-row' : ''}">`;
      
      ligne.forEach((cell, cellIdx) => {
        const isNumeric = typeof cell === 'number';
        const formattedCell = isNumeric ? formatMontant(cell) : cell;
        html += `<td class="${isNumeric ? 'montant-cell' : 'libelle-cell'}">${formattedCell}</td>`;
      });
      
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  /**
   * Formate un montant
   */
  function formatMontant(montant) {
    if (Math.abs(montant) < 0.01) {
      return '-';
    }
    return montant.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).replace(/,/g, ' ');
  }

  /**
   * Retourne l'icône appropriée pour une note
   */
  function getIconForNote(noteKey) {
    if (noteKey.includes('3')) return '🏢'; // Immobilisations
    if (noteKey.includes('4') || noteKey.includes('5')) return '📦'; // Stocks et créances
    if (noteKey.includes('6') || noteKey.includes('7')) return '💰'; // Trésorerie
    if (noteKey.includes('8') || noteKey.includes('9')) return '🏛️'; // Capitaux propres
    if (noteKey.includes('10') || noteKey.includes('11')) return '📊'; // Provisions
    if (noteKey.includes('12') || noteKey.includes('13')) return '💳'; // Dettes
    return '📄'; // Autres
  }

  /**
   * Retourne le titre pour une note
   */
  function getTitreForNote(noteKey, noteData) {
    // Extraire le numéro de la note (ex: "Note_3A" -> "Note 3A")
    const noteNum = noteKey.replace('Note_', 'Note ').replace('_', ' ');
    
    // Si les données contiennent un titre, l'utiliser
    if (noteData.titre) {
      return `${noteNum} - ${noteData.titre}`;
    }
    
    return noteNum;
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
    console.log("📊 HTML à insérer - Longueur:", html.length, "caractères");

    // Créer un conteneur pour les résultats
    const container = document.createElement('div');
    container.className = 'notes-annexes-results';
    container.style.cssText = `
      margin-top: 20px; 
      display: block !important; 
      visibility: visible !important; 
      opacity: 1 !important;
      width: 100%;
      min-height: 100px;
    `;

    // Ajouter le HTML des résultats
    container.innerHTML = html;

    // Remplacer le contenu de la div parent
    parentDiv.innerHTML = '';
    parentDiv.appendChild(container);
    
    // Forcer l'affichage du parent
    parentDiv.style.display = 'block';
    parentDiv.style.visibility = 'visible';
    parentDiv.style.opacity = '1';

    console.log("✅ Table remplacée avec les résultats");
    console.groupEnd();

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FONCTIONS GLOBALES POUR LES ACCORDÉONS
  // ═══════════════════════════════════════════════════════════════════════

  window.toggleNoteSection = function(noteKey) {
    const section = document.querySelector(`[data-note="${noteKey}"]`);
    if (section) {
      section.classList.toggle('active');
      const content = section.querySelector('.section-content-na');
      if (content) {
        content.classList.toggle('active');
      }
    }
  };

  window.expandAllNotesAnnexes = function() {
    document.querySelectorAll('.notes-annexes-section').forEach(section => {
      section.classList.add('active');
      const content = section.querySelector('.section-content-na');
      if (content) {
        content.classList.add('active');
      }
    });
  };

  window.collapseAllNotesAnnexes = function() {
    document.querySelectorAll('.notes-annexes-section').forEach(section => {
      section.classList.remove('active');
      const content = section.querySelector('.section-content-na');
      if (content) {
        content.classList.remove('active');
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // TRAITEMENT PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Traite automatiquement une table Notes_Annexes
   */
  async function processNotesAnnexesTable(table) {
    console.group("🎯 TRAITEMENT AUTOMATIQUE NOTES ANNEXES");

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
      showNotification('📂 Sélectionnez votre fichier de balance Excel (N, N-1, N-2)', 'info');
      
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
      if (!CONFIG.NOTES_ANNEXES.acceptedFormats.includes(ext)) {
        const message = `⚠️ Format non supporté. Formats acceptés: ${CONFIG.NOTES_ANNEXES.acceptedFormats.join(', ')}`;
        showNotification(message, 'error');
        updateTableContent(table, message);
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        console.groupEnd();
        return;
      }

      // Vérifier la taille
      if (file.size > CONFIG.NOTES_ANNEXES.maxFileSize) {
        const maxSizeMB = (CONFIG.NOTES_ANNEXES.maxFileSize / 1024 / 1024).toFixed(0);
        const message = `⚠️ Fichier trop volumineux (max: ${maxSizeMB} MB)`;
        showNotification(message, 'error');
        updateTableContent(table, message);
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        console.groupEnd();
        return;
      }

      // Mettre à jour la table
      updateTableContent(table, `📊 Calcul des 33 notes annexes en cours...\n⏱️ Cela peut prendre jusqu'à 30 secondes`);
      showNotification(`📊 Calcul des notes annexes SYSCOHADA...`, 'info');

      // Envoyer vers le backend
      const result = await sendToBackend(file);

      // Vérifier le succès
      if (!result.success) {
        throw new Error(result.detail || 'Erreur lors du calcul des notes');
      }

      // Générer le HTML des accordéons
      const html = generateNotesAnnexesHTML(
        result.notes,
        result.statuts,
        {
          fichier_source: result.fichier_source,
          duree_calcul: result.duree_calcul,
          taux_coherence: result.taux_coherence
        }
      );

      // Remplacer la table avec les résultats
      const replaced = replaceTableWithResults(table, html);

      if (replaced) {
        showNotification(
          `✅ ${result.notes_calculees} notes annexes générées avec succès! (Cohérence: ${result.taux_coherence}%)`,
          'success'
        );

        // Marquer comme complété
        table.setAttribute(CONFIG.PROCESSED_ATTR, 'completed');

        // Événement personnalisé
        document.dispatchEvent(new CustomEvent('claraverse:notes-annexes:success', {
          detail: { 
            filename: file.name, 
            timestamp: Date.now(),
            notes_calculees: result.notes_calculees,
            taux_coherence: result.taux_coherence
          }
        }));
      } else {
        throw new Error('Impossible d\'afficher les résultats');
      }

    } catch (error) {
      console.error("❌ Erreur:", error);
      showNotification(`❌ Erreur: ${error.message}`, 'error');
      updateTableContent(table, `❌ Erreur: ${error.message}`);
      table.removeAttribute(CONFIG.PROCESSED_ATTR);
    }

    console.groupEnd();
  }

  /**
   * Ajoute un gestionnaire de clic sur la cellule de la table
   */
  function addCellClickHandler(table) {
    const cell = table.querySelector('td');
    if (cell) {
      cell.style.cursor = 'pointer';
      cell.title = 'Cliquer pour sélectionner un fichier Balance Excel';
      
      cell.addEventListener('click', function() {
        console.log("🖱️ Clic sur cellule Notes_Annexes détecté");
        
        // Vérifier si la table n'est pas déjà en cours de traitement
        const currentStatus = table.getAttribute(CONFIG.PROCESSED_ATTR);
        if (currentStatus === 'processing' || currentStatus === 'completed') {
          console.log("⏭️ Table déjà en cours de traitement ou complétée");
          return;
        }
        
        // Réinitialiser l'attribut pour permettre le traitement
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        processNotesAnnexesTable(table);
      });
      
      console.log("✅ Gestionnaire de clic ajouté sur la cellule");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DÉTECTION AUTOMATIQUE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Scan toutes les tables et traite les tables Notes_Annexes
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

    allTables.forEach((table) => {
      if (isNotesAnnexesTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
        console.log("🎯 Table Notes_Annexes détectée - Déclenchement automatique");
        
        // Ajouter le gestionnaire de clic AVANT le traitement automatique
        addCellClickHandler(table);
        
        // Déclencher automatiquement le traitement
        processNotesAnnexesTable(table);
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

  window.NotesAnnexesAutoTrigger = {
    scan: scanAndProcess,
    config: CONFIG,
    version: "1.0.0",
    
    // Fonction pour déclencher manuellement depuis le menu contextuel
    triggerFromContextMenu: function(table) {
      console.log("🎯 Déclenchement manuel depuis menu contextuel");
      if (table && isNotesAnnexesTable(table)) {
        // Réinitialiser l'attribut pour permettre le traitement
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        processNotesAnnexesTable(table);
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

  console.log("🌐 API: NotesAnnexesAutoTrigger.test() / NotesAnnexesAutoTrigger.reset()");

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
        isNotesAnnexesTable(t) && !t.getAttribute(CONFIG.PROCESSED_ATTR)
      );
      
      if (unprocessed.length > 0) {
        console.log(`🔄 ${unprocessed.length} table(s) Notes_Annexes non traitée(s) détectée(s)`);
        scanAndProcess();
      }
    }, 3000);
    
    console.log("✅ NOTES ANNEXES AUTO TRIGGER V1.0 INITIALISÉ");
    console.log("📋 Mode: DÉCLENCHEMENT 100% AUTOMATIQUE");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
