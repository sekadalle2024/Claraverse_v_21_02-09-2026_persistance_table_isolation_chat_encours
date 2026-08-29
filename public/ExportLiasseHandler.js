/**
 * ExportLiasseHandler.js - V1.0
 * Gère l'export de la liasse officielle Excel remplie
 * 
 * @version 1.0.0
 * @description
 * - Récupère les résultats des états financiers depuis le HTML
 * - Envoie vers le backend pour remplir la liasse
 * - Télécharge automatiquement le fichier sur le bureau
 */

(function () {
  "use strict";

  console.group("📊 EXPORT LIASSE HANDLER - INITIALISATION");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.groupEnd();

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  const CONFIG = {
    ENDPOINT: "http://127.0.0.1:5000/export-liasse/generer",
    TIMEOUT: 60000, // 60 secondes
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
    }, 5000);
  }

  /**
   * Extrait les résultats des états financiers depuis le conteneur HTML
   */
  function extraireResultatsDepuisHTML(container) {
    console.group("📊 EXTRACTION DES RÉSULTATS");
    
    // Cette fonction doit extraire les données depuis le HTML généré
    // Pour l'instant, on suppose que les données sont stockées dans un attribut data
    
    const resultsData = container.getAttribute('data-results');
    if (resultsData) {
      try {
        const results = JSON.parse(resultsData);
        console.log("✅ Résultats extraits depuis data-results");
        console.groupEnd();
        return results;
      } catch (e) {
        console.error("❌ Erreur parsing data-results:", e);
      }
    }
    
    console.warn("⚠️ Impossible d'extraire les résultats depuis le HTML");
    console.groupEnd();
    return null;
  }

  /**
   * Télécharge un fichier depuis base64
   */
  function telechargerFichier(base64Content, filename) {
    console.log("💾 Téléchargement du fichier:", filename);
    
    try {
      // Décoder le base64
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Créer un blob
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("✅ Fichier téléchargé avec succès");
      return true;
    } catch (error) {
      console.error("❌ Erreur téléchargement:", error);
      return false;
    }
  }

  /**
   * Envoie la requête au backend pour générer la liasse
   */
  async function genererLiasse(results, nomEntreprise = "ENTREPRISE") {
    console.group("📤 GÉNÉRATION LIASSE");
    console.log("📊 Résultats:", results);
    console.log("🏢 Entreprise:", nomEntreprise);

    try {
      showNotification("📊 Génération de la liasse officielle...", "info");

      const response = await fetch(CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          results: results,
          nom_entreprise: nomEntreprise,
          exercice: new Date().getFullYear().toString()
        }),
        timeout: CONFIG.TIMEOUT
      });

      console.log("📥 Statut réponse:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Erreur backend:", errorData);
        throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Résultat reçu:", result);
      console.groupEnd();

      return result;

    } catch (error) {
      console.error("❌ Erreur:", error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Fonction principale d'export
   */
  async function exporterLiasse(container) {
    console.group("🎯 EXPORT LIASSE OFFICIELLE");

    try {
      // 1. Extraire les résultats
      let results = extraireResultatsDepuisHTML(container);
      
      if (!results) {
        // Si pas de data-results, chercher dans window
        if (window.lastEtatsFinanciersResults) {
          results = window.lastEtatsFinanciersResults;
          console.log("✅ Résultats récupérés depuis window.lastEtatsFinanciersResults");
        } else {
          throw new Error("Aucun résultat d'états financiers disponible");
        }
      }

      // 2. Demander le nom de l'entreprise
      const nomEntreprise = prompt(
        "Nom de l'entreprise:",
        "ENTREPRISE"
      );

      if (!nomEntreprise) {
        console.log("❌ Export annulé par l'utilisateur");
        console.groupEnd();
        return;
      }

      // 3. Générer la liasse
      const result = await genererLiasse(results, nomEntreprise);

      if (result.success && result.file_base64) {
        // 4. Télécharger le fichier
        const downloaded = telechargerFichier(
          result.file_base64,
          result.filename
        );

        if (downloaded) {
          showNotification(
            `✅ ${result.message}\nFichier: ${result.filename}`,
            "success"
          );

          // Événement personnalisé
          document.dispatchEvent(new CustomEvent('claraverse:liasse:exported', {
            detail: {
              filename: result.filename,
              timestamp: Date.now()
            }
          }));
        } else {
          throw new Error("Erreur lors du téléchargement du fichier");
        }
      } else {
        throw new Error(result.message || "Erreur de génération");
      }

    } catch (error) {
      console.error("❌ Erreur:", error);
      showNotification(`❌ Erreur: ${error.message}`, "error");
    }

    console.groupEnd();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API GLOBALE
  // ═══════════════════════════════════════════════════════════════════════

  window.ExportLiasseHandler = {
    exporter: exporterLiasse,
    version: "1.0.0",
    
    // Fonction pour être appelée depuis le menu contextuel
    exportFromContextMenu: function(container) {
      console.log("🎯 Export déclenché depuis menu contextuel");
      exporterLiasse(container);
    },
    
    // Test manuel
    test: function() {
      console.log("🧪 TEST MANUEL");
      if (window.lastEtatsFinanciersResults) {
        exporterLiasse(document.body);
      } else {
        console.error("❌ Aucun résultat disponible pour le test");
      }
    }
  };

  console.log("🌐 API: ExportLiasseHandler.test() / ExportLiasseHandler.exporter(container)");
  console.log("✅ EXPORT LIASSE HANDLER INITIALISÉ");

})();
