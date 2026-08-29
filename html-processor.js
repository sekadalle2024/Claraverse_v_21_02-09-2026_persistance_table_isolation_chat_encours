(function () {
  console.log("HTML Processor script started");

  // Fonction pour appliquer les styles après la création des tables
  function applyStylesToTables(container) {
    // Injection des styles CSS
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      /* Sélecteurs renforcés pour les en-têtes */
      div[id="response-content-container"] table[data-table-index="E"] th,
      .markdown table[data-table-index="E"] th,
      table[data-table-index="E"] > thead > tr > th {
        background-color: #6b1102 !important;
        color: white !important;
        position: sticky !important;
        top: 0 !important;
        z-index: 1000 !important;
        text-align: left !important;
        margin: 0 !important;
        border: 0 !important;
        line-height: 1 !important;
        padding: 8px 15px !important;
      }

      /* Sélecteurs renforcés pour le conteneur */
      div[id="response-content-container"] .table-container,
      .markdown .table-container {
        width: 145% !important;
        margin: 0 !important;
        padding: 0 15px 0 0 !important; /* Ajout de padding à droite */
        overflow-x: auto !important;
        position: relative !important;
        white-space: nowrap !important;
        padding-bottom: 3px !important;
        box-sizing: border-box !important;
        left: 0 !important;
        right: 0 !important;
        transform: none !important;
        display: block !important;
      }
     /* Ajout d'un pseudo-élément pour créer l'espace */
      div[id="response-content-container"] .table-container::after,
      .markdown .table-container::after {
        content: '';
        display: block;
        width: 15px; /* Largeur de l'espace */
        height: 1px;
        visibility: hidden;
      }
    `;
    document.head.appendChild(styleElement);

    // Application directe des styles via JavaScript
    if (container) {
      // Application des styles aux en-têtes
      const headerElements = container.querySelectorAll(
        'table[data-table-index="E"] th',
      );
      headerElements.forEach((th) => {
        Object.assign(th.style, {
          backgroundColor: "#6b1102",
          color: "white",
          position: "sticky",
          top: "0",
          zIndex: "1000",
          textAlign: "left",
          margin: "0",
          border: "0",
          lineHeight: "1",
          padding: "8px 15px",
        });
      });

      // Application des styles aux conteneurs
      const containerElements = container.querySelectorAll(".table-container");
      containerElements.forEach((containerEl) => {
        Object.assign(containerEl.style, {
          width: "120%",
          margin: "0",
          padding: "0",
          overflowX: "auto",
          position: "relative",
          whiteSpace: "nowrap",
          paddingBottom: "3px",
          boxSizing: "border-box",
          left: "0",
          right: "0",
          transform: "none",
          display: "block",
        });
      });
    }
  }

  // Fonction pour traiter les messages et convertir les tables brutes
  function processMessages() {
    try {
      const responseContainers = document.querySelectorAll(
        'div[id="response-content-container"]',
      );

      responseContainers.forEach((container) => {
        if (!container || container.dataset.processed) return;

        // Vérifier si le contenu contient des tables brutes
        const rawContent = container.textContent || "";
        if (!rawContent.includes("<table")) return;

        try {
          console.log("Début du traitement des tables brutes");

          // Créer un conteneur formaté pour les tables
          const formattedContainer = document.createElement("div");
          formattedContainer.className =
            "markdown markdown-prose svelte-icqdsw";

          // Convertir le contenu brut en HTML
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = rawContent;

          // Traiter toutes les tables brutes
          const tablesToProcess = tempDiv.getElementsByTagName("table");
          Array.from(tablesToProcess).forEach((originalTable) => {
            const table = document.createElement("table");
            table.innerHTML = originalTable.innerHTML;

            // Ajouter des attributs de séquence par défaut
            if (!table.id) {
              table.id = `table_${Date.now()}_${Math.floor(
                Math.random() * 1000,
              )}`;
            }
            if (!table.dataset.messageIndex) {
              table.dataset.messageIndex = Date.now();
            }
            if (!table.dataset.tableIndex) {
              table.dataset.tableIndex = "E";
            }

            // Créer un wrapper pour la table
            const tableWrapper = document.createElement("div");
            tableWrapper.className = "table-container";
            tableWrapper.appendChild(table);

            // Ajouter la table au conteneur formaté
            formattedContainer.appendChild(tableWrapper);
          });

          // Remplacer le contenu original par le contenu formaté
          container.innerHTML = "";
          container.appendChild(formattedContainer);

          // Appliquer les styles aux tables
          applyStylesToTables(container);

          // Forcer le séquencement des tables si la fonction est disponible
          if (typeof window.sequenceTables === "function") {
            window.sequenceTables();
            console.log("Séquencement des tables forcé");
          }

          // Intégrer avec ClaraVerseTableManager pour la persistance
          if (typeof window.ClaraVerseTableManager !== "undefined") {
            setTimeout(() => {
              window.ClaraVerseTableManager.scanAndProcessTables();
              console.log(
                "Tables intégrées au système de persistance ClaraVerse",
              );
            }, 300);
          }

          // Marquer le conteneur comme traité
          container.dataset.processed = "true";
          console.log("Conteneur traité avec succès");
        } catch (error) {
          console.error("Erreur lors du traitement des tables:", error);
          container.dataset.processed = false;
        }
      });
    } catch (error) {
      console.error("Erreur générale dans processMessages:", error);
    }
  }

  // Observer les changements du DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        setTimeout(processMessages, 100);
      }
    });
  });

  // Démarrer l'observation
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Traitement initial
  processMessages();

  console.log("HTML Processor script finished");
})();
