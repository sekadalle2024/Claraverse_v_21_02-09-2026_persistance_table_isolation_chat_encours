/**
 * Script dynamique pour les tables de critères dans Claraverse - V13.0 (Persistance avec Signature DOM)
 * @version 13.0.0
 * @description
 * - INTÉGRATION DE LA PERSISTANCE : Les données traitées par Flowise sont sauvegardées dans le localStorage.
 * - RESTAURATION AUTOMATIQUE : Après un rechargement de page, les résultats sont restaurés sans nouvel appel API.
 * - SIGNATURE DOM UNIQUE : Utilise un système de hash du contenu pour identifier de manière fiable chaque table et éviter les erreurs de restauration.
 * - ISOLATION PAR CHAT : Les données sont compartimentées pour chaque conversation.
 * - NETTOYAGE : Une fonction de nettoyage supprime les anciennes données du cache pour éviter de saturer le localStorage.
 * - Basé sur la logique de V12.2 avec les améliorations de persistance de V14.
 */
(function () {
    "use strict";
  
    console.log(
      "🚀 Initialisation V13.0 - Persistance avec Signature DOM"
    );
  
    // --- CONFIGURATION CENTRALE ---
    const CONFIG = {
      FLOWISE_ENDPOINT_URL:
        "https://r534c2br.rpcld.co/api/v1/prediction/e5c3313d-cc30-461f-8ea6-f6e8dd715854",
      SEARCH_KEYWORDS: {
        frap: ["frap", "FRAP", "Frap"],
        synthese: ["synthese", "SYNTHESE", "Synthèse", "Synthese", "synth"],
        rapport: ["rapport", "RAPPORT", "Rapport"],
        suivi: ["suivi", "SUIVI", "Suivi"],
      },
      STORAGE_PREFIX: "claraverse_v13_", // Préfixe pour le localStorage
      PROCESSED_DIV_CLASS: "flowise-div-processed", // Marqueur DOM
      PROCESSED_DATA_CLASS: "flowise-data-injected", // Marqueur pour les données injectées
      CLEANUP_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 jours
    };
  
    // =================================================================
    // NOUVEAU : SYSTÈME DE SIGNATURE DOM POUR IDENTIFICATION UNIQUE
    // =================================================================
    const DOMSignature = {
      generate(div) {
        if (!div) return null;
        // Le hash est basé sur TOUT le contenu textuel de la div. C'est très fiable.
        const textContent = div.textContent.trim().replace(/\s+/g, " ");
        const textHash = this.hashString(textContent);
        // On combine le hash avec l'index de la div pour encore plus de précision.
        const divIndex = Array.from(document.querySelectorAll("div.prose")).indexOf(div);
  
        return `sig_${textHash}_${divIndex}`;
      },
  
      hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash &= hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
      },
    };
  
    // =================================================================
    // NOUVEAU : GESTIONNAIRE DE PERSISTANCE (LOCALSTORAGE)
    // =================================================================
    const PersistenceManager = {
      getCurrentChatId() {
        const urlPath = window.location.pathname;
        const chatMatch = urlPath.match(/\/chat\/([^\/]+)/);
        return chatMatch ? chatMatch[1] : "default_chat";
      },
  
      getStorageKey(signature) {
        const chatId = this.getCurrentChatId();
        return `${CONFIG.STORAGE_PREFIX}${chatId}_${signature}`;
      },
  
      saveProcessedData(signature, flowiseHTML) {
        const key = this.getStorageKey(signature);
        const record = {
          signature,
          flowiseHTML,
          timestamp: Date.now(),
          url: window.location.href,
        };
        localStorage.setItem(key, JSON.stringify(record));
        console.log(`💾 Données sauvegardées pour la signature: ${signature}`);
      },
  
      getProcessedData(signature) {
        const key = this.getStorageKey(signature);
        const record = localStorage.getItem(key);
        if (!record) return null;
  
        try {
          console.log(`📦 Données trouvées dans le cache pour: ${signature}`);
          return JSON.parse(record);
        } catch (e) {
          return null;
        }
      },
  
      cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CONFIG.STORAGE_PREFIX)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (now - data.timestamp > CONFIG.CLEANUP_MAX_AGE) {
                localStorage.removeItem(key);
                cleaned++;
              }
            } catch (e) {
              localStorage.removeItem(key);
            }
          }
        }
        if (cleaned > 0) {
          console.log(`🧹 Nettoyage: ${cleaned} anciens enregistrements supprimés.`);
        }
      },
    };
  
    // --- Fonctions existantes (légèrement adaptées) ---
  
    async function queryFlowiseEndpoint(tablesHTML) {
      try {
        console.log("📡 Envoi des données vers Flowise...");
        const response = await fetch(CONFIG.FLOWISE_ENDPOINT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: tablesHTML }),
        });
        if (!response.ok)
          throw new Error(`Erreur HTTP ${response.status}`);
        console.log("✅ Réponse de Flowise reçue !");
        return await response.json();
      } catch (error) {
        console.error("❌ Erreur API Flowise:", error);
        throw error;
      }
    }
  
    function detectTargetKeyword(flowiseTable) {
      const allCells = flowiseTable.querySelectorAll("td");
      for (const [group, variations] of Object.entries(CONFIG.SEARCH_KEYWORDS)) {
        for (const cell of allCells) {
          if (variations.some(v => cell.textContent.toLowerCase().includes(v.toLowerCase()))) {
            console.log(`🎯 Mot-clé détecté: "${group}"`);
            return group;
          }
        }
      }
      return null;
    }
  
    function collectCriteriaTables(targetKeyword) {
      const allDivs = document.querySelectorAll("div.prose");
      const collectedTablesHTML = [];
      allDivs.forEach(div => {
        const firstTable = div.querySelector("table");
        if (!firstTable) return;
        
        const headers = Array.from(firstTable.querySelectorAll("th")).map(th => th.textContent.toLowerCase());
        if (!headers.includes("rubrique") || !headers.includes("description")) return;
        
        const keywordFound = Array.from(firstTable.querySelectorAll("td")).some(cell => {
            const keywords = CONFIG.SEARCH_KEYWORDS[targetKeyword] || [];
            return keywords.some(kw => cell.textContent.toLowerCase().includes(kw.toLowerCase()));
        });
  
        if (keywordFound) {
          div.querySelectorAll("table").forEach(table => {
              collectedTablesHTML.push(table.outerHTML);
          });
        }
      });
      return collectedTablesHTML.join("\n");
    }
  
    function extractTablesFromResponse(responseText) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(responseText, "text/html");
      const tables = doc.querySelectorAll("table");
      
      // Appliquer le style Claraverse aux tables extraites
      tables.forEach(table => {
          table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
      });
  
      return Array.from(tables);
    }
  
    function integrateDataIntoDOM(flowiseTables, parentDiv) {
      if (!flowiseTables.length || !parentDiv) return;
  
      // Vérifier si des données ne sont pas déjà injectées pour éviter les doublons
      if (parentDiv.querySelector(`.${CONFIG.PROCESSED_DATA_CLASS}`)) return;
  
      const container = document.createElement("div");
      container.className = CONFIG.PROCESSED_DATA_CLASS;
      flowiseTables.forEach(table => container.appendChild(table));
      parentDiv.appendChild(container);
      console.log(`✅ ${flowiseTables.length} table(s) intégrée(s) dans le DOM.`);
    }
  
    // =================================================================
    // MISE À JOUR : LOGIQUE DE TRAITEMENT PRINCIPALE AVEC PERSISTANCE
    // =================================================================
    async function processFlowiseTable(table) {
      const parentDiv = table.closest("div.prose");
      if (!parentDiv) return;
  
      const signature = DOMSignature.generate(parentDiv);
      if (!signature) return;
  
      // Étape 1 : Vérifier si la div est DÉJÀ traitée (cache ou DOM)
      if (parentDiv.classList.contains(CONFIG.PROCESSED_DIV_CLASS)) {
        return;
      }
  
      // Tenter de restaurer depuis le localStorage
      const cachedData = PersistenceManager.getProcessedData(signature);
      if (cachedData) {
        console.log(`♻️ Restauration des données depuis le cache pour ${signature}`);
        const flowiseTables = extractTablesFromResponse(cachedData.flowiseHTML);
        integrateDataIntoDOM(flowiseTables, parentDiv);
        
        parentDiv.classList.add(CONFIG.PROCESSED_DIV_CLASS);
        table.remove(); // Supprimer la table de déclenchement
        return;
      }
  
      // Étape 2 : Si pas dans le cache, lancer le processus normal
      const targetKeyword = detectTargetKeyword(table);
      if (!targetKeyword) return;
  
      // Marquer immédiatement pour éviter les traitements multiples
      parentDiv.classList.add(CONFIG.PROCESSED_DIV_CLASS);
      console.log(`✨ Nouveau traitement pour le mot-clé "${targetKeyword}" (Signature: ${signature})`);
  
      try {
        const criteriaTablesHTML = collectCriteriaTables(targetKeyword);
        if (!criteriaTablesHTML) throw new Error("Aucune table de critère trouvée.");
  
        const response = await queryFlowiseEndpoint(criteriaTablesHTML);
        if (!response || !response.text) throw new Error("Réponse Flowise vide.");
  
        const flowiseTables = extractTablesFromResponse(response.text);
        if (!flowiseTables.length) throw new Error("Aucune table dans la réponse Flowise.");
        
        const flowiseHTML = flowiseTables.map(t => t.outerHTML).join('');
  
        // NOUVEAU : Sauvegarder le résultat avant de l'afficher
        PersistenceManager.saveProcessedData(signature, flowiseHTML);
  
        // Intégrer les données et supprimer la table de déclenchement
        integrateDataIntoDOM(flowiseTables, parentDiv);
        table.remove();
  
      } catch (error) {
        console.error(`❌ Erreur de traitement pour "${targetKeyword}":`, error);
        // En cas d'erreur, on retire la classe pour permettre une nouvelle tentative
        parentDiv.classList.remove(CONFIG.PROCESSED_DIV_CLASS);
      }
    }
  
    function scanAndProcess() {
      const allTables = document.querySelectorAll("table");
      allTables.forEach(table => {
        const headers = Array.from(table.querySelectorAll("th")).map(th => th.textContent.trim().toLowerCase());
        if (headers.includes("flowise")) {
          processFlowiseTable(table);
        }
      });
    }
  
    // --- OBSERVATEUR ET INITIALISATION ---
    const observer = new MutationObserver((mutations) => {
      const hasAddedTables = mutations.some(m => 
          Array.from(m.addedNodes).some(n => 
              n.nodeType === Node.ELEMENT_NODE && (n.tagName === 'TABLE' || n.querySelector('table'))
          )
      );
      if (hasAddedTables) {
        setTimeout(scanAndProcess, 200);
      }
    });
  
    function initialize() {
      console.log("🔧 Initialisation du script V13.0...");
      
      // NOUVEAU : Nettoyer les anciennes données au démarrage
      PersistenceManager.cleanup();
  
      // Scan initial pour les tables déjà présentes (essentiel après un F5)
      setTimeout(scanAndProcess, 500);
  
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      console.log("✅ Script V13.0 initialisé - Observateur DOM actif et persistance activée.");
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize);
    } else {
      initialize();
    }
  })();