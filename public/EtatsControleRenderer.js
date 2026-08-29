/**
 * EtatsControleRenderer.js - V1.0
 * Intègre le composant React EtatsControleAccordionRenderer dans le DOM
 * 
 * @version 1.0.0
 * @description
 * - Détecte les résultats d'états de contrôle dans window.lastEtatsFinanciersResults
 * - Monte le composant React EtatsControleAccordionRenderer
 * - Affiche les 8 états de contrôle en accordéons interactifs
 */

(function () {
  "use strict";

  console.group("🔍 ÉTATS DE CONTRÔLE RENDERER V1.0 - INITIALISATION");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.groupEnd();

  /**
   * Vérifie si les états de contrôle sont disponibles
   */
  function hasEtatsControle(results) {
    return results && 
           results.controles && 
           results.controles.etats_controle;
  }

  /**
   * Transforme les données backend en format attendu par le composant React
   */
  function transformEtatsControleData(controles) {
    const etatsControle = controles.etats_controle || {};
    
    return {
      etat_controle_bilan_actif: etatsControle.etat_controle_bilan_actif,
      etat_controle_bilan_passif: etatsControle.etat_controle_bilan_passif,
      etat_controle_compte_resultat: etatsControle.etat_controle_compte_resultat,
      etat_controle_tft: etatsControle.etat_controle_tft,
      etat_controle_sens_comptes: etatsControle.etat_controle_sens_comptes,
      etat_equilibre_bilan: etatsControle.etat_equilibre_bilan,
      etat_controle_comptes_non_integres: etatsControle.etat_controle_comptes_non_integres,
      etat_controle_sens_anormal: etatsControle.etat_controle_sens_anormal
    };
  }

  /**
   * Crée un conteneur pour les états de contrôle
   */
  function createEtatsControleContainer(parentElement) {
    const container = document.createElement('div');
    container.id = 'etats-controle-react-root';
    container.style.cssText = 'margin-top: 32px;';
    
    parentElement.appendChild(container);
    
    return container;
  }

  /**
   * Monte le composant React dans le conteneur
   */
  async function mountReactComponent(container, etatsControleData) {
    try {
      console.log("🔄 Montage du composant React EtatsControleAccordionRenderer...");
      
      // Vérifier si React et ReactDOM sont disponibles
      if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error("❌ React ou ReactDOM non disponibles");
        return false;
      }

      // Importer le composant (si module ES6)
      // Note: Cette partie dépend de votre configuration de build
      // Si le composant est déjà bundlé, utilisez window.EtatsControleAccordionRenderer
      
      if (typeof window.EtatsControleAccordionRenderer === 'undefined') {
        console.warn("⚠️ Composant EtatsControleAccordionRenderer non trouvé dans window");
        console.log("💡 Tentative de chargement dynamique...");
        
        // Fallback: Afficher un message d'attente
        container.innerHTML = `
          <div style="padding: 20px; text-align: center; background: #f0f9ff; border-radius: 8px;">
            <p style="margin: 0; color: #1e3a8a; font-weight: 600;">
              🔍 Chargement des états de contrôle...
            </p>
          </div>
        `;
        
        return false;
      }

      // Créer l'élément React
      const element = React.createElement(
        window.EtatsControleAccordionRenderer,
        { etatsControle: etatsControleData }
      );

      // Monter le composant
      ReactDOM.render(element, container);
      
      console.log("✅ Composant React monté avec succès");
      return true;
      
    } catch (error) {
      console.error("❌ Erreur lors du montage du composant React:", error);
      return false;
    }
  }

  /**
   * Affiche les états de contrôle en HTML statique (fallback)
   */
  function renderEtatsControleHTML(container, etatsControleData) {
    console.log("📋 Affichage des états de contrôle en HTML statique (fallback)");
    
    let html = `
      <div class="etats-controle-container">
        <div class="etats-controle-header">
          <h2>🔍 États de Contrôle</h2>
          <p>Contrôles exhaustifs des états financiers SYSCOHADA Révisé</p>
        </div>
        <div style="padding: 20px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; margin-top: 16px;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">
            ⚠️ Composant React non disponible - Affichage simplifié
          </p>
          <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px;">
            Les états de contrôle sont disponibles dans <code>window.lastEtatsFinanciersResults.controles.etats_controle</code>
          </p>
        </div>
    `;
    
    // Afficher un résumé des états disponibles
    const etats = Object.keys(etatsControleData).filter(key => etatsControleData[key]);
    
    if (etats.length > 0) {
      html += `
        <div style="margin-top: 16px; padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #374151;">
            📊 États de contrôle disponibles (${etats.length})
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
      `;
      
      etats.forEach(etat => {
        const titre = etatsControleData[etat]?.titre || etat;
        html += `<li style="margin: 4px 0;">${titre}</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
  }

  /**
   * Affiche les états de contrôle
   */
  async function renderEtatsControle(parentElement, results) {
    console.group("🎨 RENDU DES ÉTATS DE CONTRÔLE");
    
    try {
      // Vérifier si les états de contrôle sont disponibles
      if (!hasEtatsControle(results)) {
        console.log("⏭️ Pas d'états de contrôle disponibles");
        console.groupEnd();
        return;
      }

      console.log("✅ États de contrôle détectés");
      
      // Transformer les données
      const etatsControleData = transformEtatsControleData(results.controles);
      console.log("📊 Données transformées:", etatsControleData);
      
      // Créer le conteneur
      const container = createEtatsControleContainer(parentElement);
      
      // Tenter de monter le composant React
      const mounted = await mountReactComponent(container, etatsControleData);
      
      // Si le montage échoue, afficher en HTML statique
      if (!mounted) {
        renderEtatsControleHTML(container, etatsControleData);
      }
      
      console.log("✅ États de contrôle affichés");
      
    } catch (error) {
      console.error("❌ Erreur lors du rendu des états de contrôle:", error);
    }
    
    console.groupEnd();
  }

  /**
   * Écoute les événements de succès des états financiers
   */
  function setupEventListeners() {
    document.addEventListener('claraverse:etat-fin:success', async (event) => {
      console.log("🎯 Événement etat-fin:success reçu", event.detail);
      
      // Attendre un peu pour que les résultats soient stockés
      setTimeout(async () => {
        const results = window.lastEtatsFinanciersResults;
        
        if (results) {
          console.log("📊 Résultats disponibles:", results);
          
          // Trouver le conteneur parent (div.etat-fin-results)
          const parentContainer = document.querySelector('.etat-fin-results');
          
          if (parentContainer) {
            await renderEtatsControle(parentContainer, results);
          } else {
            console.warn("⚠️ Conteneur parent .etat-fin-results non trouvé");
          }
        } else {
          console.warn("⚠️ window.lastEtatsFinanciersResults non disponible");
        }
      }, 500);
    });
    
    console.log("👂 Écouteur d'événements configuré");
  }

  /**
   * API globale
   */
  window.EtatsControleRenderer = {
    render: renderEtatsControle,
    hasEtatsControle: hasEtatsControle,
    version: "1.0.0",
    
    // Test manuel
    test: function() {
      console.log("🧪 TEST MANUEL - Rendu des états de contrôle");
      
      const results = window.lastEtatsFinanciersResults;
      const container = document.querySelector('.etat-fin-results');
      
      if (results && container) {
        renderEtatsControle(container, results);
      } else {
        console.error("❌ Résultats ou conteneur non disponibles");
        console.log("Résultats:", results);
        console.log("Conteneur:", container);
      }
    }
  };

  console.log("🌐 API: EtatsControleRenderer.test()");

  /**
   * Initialisation
   */
  function init() {
    setupEventListeners();
    console.log("✅ ÉTATS DE CONTRÔLE RENDERER V1.0 INITIALISÉ");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
