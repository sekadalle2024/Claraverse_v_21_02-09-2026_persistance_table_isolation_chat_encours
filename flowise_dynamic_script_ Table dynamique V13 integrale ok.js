/**
 * Script dynamique pour les tables de critères dans Claraverse - V16 (Clé de stockage stable)
 * @version 16.0.0
 * @description
 * - Implémente une génération de clé de stockage ultra-stable basée sur le mot-clé et l'index positionnel.
 * - Conçu pour être résilient aux re-rendus du DOM par React et résoudre le problème de persistance.
 */
function initializeDynamicTablesV16() {
  console.log(
    "🚀 Initialisation du système de tables dynamiques V16 (Clé Stable)"
  );

  // L'objet `processedInSession` empêche le traitement multiple d'un même élément
  // au sein d'une même session, même si l'observateur se déclenche plusieurs fois.
  const processedInSession = new Set();

  const SEARCH_KEYWORDS = {
    frap: ["frap", "FRAP", "Frap"],
    synthese: [
      "synthese",
      "SYNTHESE",
      "Synthèse",
      "Synthese",
      "synth",
      "SYNTH",
      "Synth",
    ],
    rapport: [
      "rapport",
      "RAPPORT",
      "Rapport",
      "rapport provisoire",
      "rapport final",
    ],
    suivi: ["suivi", "SUIVI", "Suivi", "suivi recos", "SUIVI RECOS"],
  };

  const FLOWISE_ENDPOINT_URL =
    "https://r534c2br.rpcld.co/api/v1/prediction/e5c3313d-cc30-461f-8ea6-f6e8dd715854";

  /**
   * NOUVELLE LOGIQUE DE CLÉ : Génère une clé stable basée sur le mot-clé et l'index de la table.
   * @param {HTMLElement} triggerTable La table de déclenchement.
   * @returns {{key: string|null, keyword: string|null}} Un objet contenant la clé et le mot-clé.
   */
  function getStableStorageKey(triggerTable) {
    const keyword = detectTargetKeywordInFlowiseTable(triggerTable);
    if (!keyword) return { key: null, keyword: null };

    // Trouver toutes les tables de déclenchement du même type dans le document
    const allSimilarTriggers = Array.from(
      document.querySelectorAll("table")
    ).filter((table) => {
      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );
      return (
        headers.includes("flowise") &&
        detectTargetKeywordInFlowiseTable(table) === keyword
      );
    });

    const index = allSimilarTriggers.indexOf(triggerTable);
    if (index === -1) return { key: null, keyword: null }; // Ne devrait pas arriver

    const key = `flowise_data_${keyword}_${index}`;
    return { key, keyword };
  }

  /**
   * Fonction principale qui gère une table : restaure ou lance un appel API.
   * @param {HTMLElement} triggerTable La table avec l'en-tête "Flowise".
   */
  async function processOrRestoreTable(triggerTable) {
    const { key: storageKey, keyword: targetKeyword } =
      getStableStorageKey(triggerTable);

    if (!storageKey || processedInSession.has(storageKey)) {
      return; // Pas de clé valide ou déjà traité dans cette session
    }
    processedInSession.add(storageKey); // Verrouiller pour cette session

    const parentDiv = triggerTable.closest(
      "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    );
    if (!parentDiv) return;

    const savedHTML = localStorage.getItem(storageKey);

    if (savedHTML) {
      console.log(`🔄 Restauration à partir de la clé stable : ${storageKey}`);
      const container = document.createElement("div");
      container.className = "flowise-tables-container restored";
      container.innerHTML = savedHTML;
      parentDiv.appendChild(container);
      triggerTable.remove();
    } else {
      console.log(
        `➕ Nouveau traitement API avec la clé stable : ${storageKey}`
      );
      const container = document.createElement("div");
      container.className = "flowise-tables-container";
      const loader = document.createElement("div");
      loader.className = "text-center py-2 text-indigo-600 font-semibold";
      loader.textContent = `Chargement (${targetKeyword})...`;
      container.appendChild(loader);
      parentDiv.appendChild(container);

      try {
        const criteriaTablesHTML =
          getCriteriaTablesWithDynamicKeyword(targetKeyword);
        if (!criteriaTablesHTML)
          throw new Error(
            `Aucune table de critère trouvée pour "${targetKeyword}"`
          );

        const response = await queryFlowiseEndpoint(criteriaTablesHTML);
        if (!response || !response.text)
          throw new Error("Réponse Flowise vide ou invalide");

        const tables = extractAndConvertTables(response.text);
        const flowiseContentHTML = tables.map((t) => t.outerHTML).join("");

        if (flowiseContentHTML) {
          localStorage.setItem(storageKey, flowiseContentHTML);
          console.log(`💾 Données sauvegardées avec la clé : ${storageKey}`);
          container.innerHTML = flowiseContentHTML;
        } else {
          container.innerHTML = `<div class="text-gray-500 italic p-3">Aucune table exploitable trouvée.</div>`;
        }
        triggerTable.remove();
      } catch (error) {
        console.error(`❌ Erreur critique pour ${storageKey}:`, error);
        container.innerHTML = `<div class="text-red-500 p-3 bg-red-50 rounded"><strong>Erreur:</strong> ${error.message}</div>`;
      }
    }
  }

  // --- Fonctions utilitaires (inchangées) ---
  function detectTargetKeywordInFlowiseTable(flowiseTable) {
    const allCells = flowiseTable.querySelectorAll("td, th");
    for (const [group, variations] of Object.entries(SEARCH_KEYWORDS)) {
      for (const cell of allCells) {
        if (
          variations.some((kw) =>
            cell.textContent.trim().toLowerCase().includes(kw.toLowerCase())
          )
        )
          return group;
      }
    }
    return null;
  }
  async function queryFlowiseEndpoint(question) {
    /* ... */
  }
  function getCriteriaTablesWithDynamicKeyword(targetKeyword) {
    /* ... */
  }
  function extractAndConvertTables(responseText) {
    /* ... */
  }
  // --- Collez ici les implémentations des fonctions utilitaires de V15 ---
  async function queryFlowiseEndpoint(question) {
    try {
      const response = await fetch(FLOWISE_ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Erreur Flowise:", error);
      return null;
    }
  }
  function getCriteriaTablesWithDynamicKeyword(targetKeyword) {
    const tablesHTML = [];
    const allDivs = document.querySelectorAll(
      "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    );
    for (const div of allDivs) {
      const firstTable = div.querySelector("table");
      if (!firstTable) continue;
      const headers = Array.from(firstTable.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );
      if (headers.includes("rubrique") && headers.includes("description")) {
        const allCells = firstTable.querySelectorAll("td");
        for (const cell of allCells) {
          if (cell.textContent.trim().toLowerCase().includes(targetKeyword)) {
            div
              .querySelectorAll("table")
              .forEach((table) => tablesHTML.push(table.outerHTML));
            break;
          }
        }
      }
    }
    return tablesHTML.join("\n");
  }
  function extractAndConvertTables(responseText) {
    const tables = [];
    try {
      const doc = new DOMParser().parseFromString(responseText, "text/html");
      doc
        .querySelectorAll("table")
        .forEach((table) => tables.push(table.cloneNode(true)));
    } catch (e) {
      console.error("Erreur extraction tables:", e);
    }
    return tables;
  }

  /**
   * Fonction centrale déclenchée pour scanner et traiter toutes les tables pertinentes.
   */
  function scanAndProcessAll() {
    document.querySelectorAll("table").forEach((table) => {
      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );
      if (headers.includes("flowise")) {
        processOrRestoreTable(table);
      }
    });
  }

  // --- Observateur de DOM ---
  const observer = new MutationObserver((mutations) => {
    // Si des noeuds sont ajoutés, on relance un scan complet.
    // C'est simple et robuste.
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      // Un petit délai pour s'assurer que le DOM est "stable" après la mutation.
      setTimeout(scanAndProcessAll, 200);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Scan initial au cas où les tables sont déjà là au chargement du script.
  setTimeout(scanAndProcessAll, 500);
}

// Lancement
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDynamicTablesV16);
} else {
  initializeDynamicTablesV16();
}
