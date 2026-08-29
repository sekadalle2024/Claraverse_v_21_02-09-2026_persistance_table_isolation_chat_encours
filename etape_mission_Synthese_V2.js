/**
 * Synthese.js - Automatisation pour les tables Synthèse dans Claraverse
 * Version: V3.1 - Corrigée
 * Description: Collecte et consolide les tables FRAP dans les tables Synthèse
 */

class SyntheseAutomation {
  constructor() {
    // Sélecteur CSS plus flexible pour les tables
    this.baseSelector = "table";

    // Variantes pour la détection des tables Synthèse (étendues)
    this.syntheseVariants = [
      "synthese",
      "synthèse",
      "SYNTHESE",
      "SYNTHÈSE",
      "Synthese",
      "Synthèse",
    ];
    this.frapKeyword = "frap";

    // Normalisation du texte pour comparaison
    this.normalizeText = (text) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    };
  }

  /**
   * Point d'entrée principal
   */
  init() {
    console.log("🔍 Démarrage de l'automatisation Synthèse...");

    const syntheseTable = this.findSyntheseTable();
    if (syntheseTable) {
      console.log("✅ Table Synthèse détectée - Lancement de l'automatisation");
      this.executeAutomation(syntheseTable);
    } else {
      console.log("❌ Aucune table Synthèse trouvée");
      this.debug(); // Afficher des informations de débogage
    }
  }

  /**
   * Recherche une table avec l'en-tête "Synthèse" (ou ses variantes)
   * Méthode plus robuste pour trouver les tables
   */
  findSyntheseTable() {
    const allTables = document.querySelectorAll(this.baseSelector);

    for (let table of allTables) {
      // Vérifier les en-têtes de table
      const headers = table.querySelectorAll("th");
      for (let header of headers) {
        const headerText = this.normalizeText(header.textContent);

        // Vérifier si l'en-tête correspond à une variante de "Synthèse"
        if (
          this.syntheseVariants.some((variant) =>
            headerText.includes(this.normalizeText(variant))
          )
        ) {
          console.log("✅ Table Synthèse trouvée:", headerText);
          return table;
        }
      }

      // Vérifier également les cellules pour les tables sans en-tête clair
      const cells = table.querySelectorAll("td");
      for (let cell of cells) {
        const cellText = this.normalizeText(cell.textContent);
        if (
          this.syntheseVariants.some((variant) =>
            cellText.includes(this.normalizeText(variant))
          )
        ) {
          console.log("✅ Table Synthèse trouvée via cellule:", cellText);
          return table;
        }
      }
    }
    return null;
  }

  /**
   * Recherche les tables FRAP à intégrer
   */
  findFrapTables() {
    const frapTables = [];
    const allTables = document.querySelectorAll(this.baseSelector);

    for (let table of allTables) {
      if (this.isFrapTable(table)) {
        const tableGroup = this.collectFrapTableGroup(table);
        if (tableGroup.length > 0) {
          frapTables.push(tableGroup);
          console.log(
            `📊 Groupe FRAP collecté avec ${tableGroup.length} table(s)`
          );
        }
      }
    }

    console.log(
      `📊 Total: ${frapTables.length} groupe(s) de tables FRAP trouvé(s)`
    );
    return frapTables;
  }

  /**
   * Vérifie si une table est une table d'en-tête FRAP
   */
  isFrapTable(table) {
    // 1. Vérifier la présence des en-têtes "rubrique" et "description"
    const headers = table.querySelectorAll("th");
    const headerTexts = Array.from(headers).map((h) =>
      this.normalizeText(h.textContent)
    );

    const hasRubriqueHeader = headerTexts.some((text) =>
      text.includes("rubrique")
    );
    const hasDescriptionHeader = headerTexts.some((text) =>
      text.includes("description")
    );

    if (!hasRubriqueHeader || !hasDescriptionHeader) {
      return false;
    }

    // 2. Vérifier si une cellule contient "Frap" (n'importe où dans la table)
    const cells = table.querySelectorAll("td");
    for (let cell of cells) {
      const cellText = this.normalizeText(cell.textContent);
      if (cellText.includes(this.normalizeText(this.frapKeyword))) {
        console.log('✅ Contenu "Frap" trouvé:', cellText);
        return true;
      }
    }

    return false;
  }

  // ... (le reste des méthodes reste similaire mais avec des sélecteurs plus flexibles)

  /**
   * Méthode utilitaire pour le debugging - Affiche les informations des tables
   */
  debug() {
    console.log("🔧 Mode debug activé - Analyse des tables");
    console.log("==========================================");

    const allTables = document.querySelectorAll("table");
    console.log(`📋 Nombre total de tables: ${allTables.length}`);

    allTables.forEach((table, index) => {
      console.log(`\n📊 Table ${index + 1}:`);

      // Afficher les en-têtes
      const headers = table.querySelectorAll("th");
      if (headers.length > 0) {
        console.log(
          "   En-têtes:",
          Array.from(headers).map((h) => h.textContent.trim())
        );
      }

      // Afficher le contenu des premières cellules
      const cells = table.querySelectorAll("td");
      if (cells.length > 0) {
        const sampleContent = Array.from(cells)
          .slice(0, 3)
          .map((c) => c.textContent.trim());
        console.log("   Contenu échantillon:", sampleContent);
      }

      // Vérifier si c'est une table FRAP
      console.log("   Est FRAP:", this.isFrapTable(table));

      // Vérifier si c'est une table Synthèse
      const hasSyntheseHeader = Array.from(headers).some((h) =>
        this.syntheseVariants.some((variant) =>
          this.normalizeText(h.textContent).includes(
            this.normalizeText(variant)
          )
        )
      );
      console.log("   Est Synthèse:", hasSyntheseHeader);
    });

    console.log("==========================================");
  }
}

// Auto-initialisation
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => new SyntheseAutomation().init(), 1000);
  });
} else {
  setTimeout(() => new SyntheseAutomation().init(), 1000);
}
