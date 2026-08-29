/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INTÉGRATION MENU CONTEXTUEL - PAPIER DE TRAVAIL (SCHÉMA DE CALCUL)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier contient les méthodes à ajouter dans la classe ContextualMenuManager
 * de public/menu.js pour gérer les schémas de calcul.
 * 
 * INSTRUCTIONS D'INTÉGRATION:
 * 1. Ouvrir public/menu.js
 * 2. Localiser la section "PAPIER DE TRAVAIL" (ligne ~189 et ~9424)
 * 3. Ajouter les nouvelles méthodes ci-dessous avant la méthode cleanup()
 * 4. Mettre à jour le menu "papier-travail" dans getMenuSections()
 * 
 * @version 1.0
 * @date 2026-04-24
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 1: METTRE À JOUR getMenuSections() - Section "papier-travail"
// ═══════════════════════════════════════════════════════════════════════════════

/*
Remplacer la section "papier-travail" existante (ligne ~189) par:

{
  id: "papier-travail", title: "Papier de travail", icon: "📁",
  items: [
    { text: "📐 Ajouter Schéma de calcul", action: () => this.ajouterSchemaCalcul(), shortcut: "Ctrl+Shift+S" },
    { text: "📐 Régénérer Schéma de calcul", action: () => this.regenererSchemaCalcul() },
    { text: "🗑️ Supprimer Schéma de calcul", action: () => this.supprimerSchemaCalcul() },
    { text: "─────────────────────", action: null },
    { text: "📤 Importer X-Ref documentaire", action: () => this.importerXRefDocumentaire(), shortcut: "Ctrl+Shift+X" },
    { text: "📂 Ouvrir X-Ref documentaire", action: () => this.ouvrirXRefDocumentaire(), shortcut: "Ctrl+Shift+O" },
    { text: "📋 Afficher X-Ref documentaire", action: () => this.afficherXRefDocumentaire() },
    { text: "🔍 Rechercher document", action: () => this.rechercherDocument() }
  ]
},
*/

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 2: AJOUTER LES MÉTHODES CI-DESSOUS DANS ContextualMenuManager
// Position: Avant la méthode cleanup() (ligne ~10000+)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECTION: PAPIER DE TRAVAIL - SCHÉMA DE CALCUL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Ajouter un schéma de calcul au-dessus de la table active
 * Détecte automatiquement la "Nature de test" et génère le schéma approprié
 */
ajouterSchemaCalcul() {
  console.log("📐 [Schéma Calcul] Ajout du schéma de calcul");

  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.\n\nVeuillez cliquer sur une cellule de la table principale.");
    return;
  }

  // Vérifier que c'est une table modelisée
  if (!this.isModelizedTable(this.targetTable)) {
    this.showAlert("⚠️ Cette table n'est pas une table modelisée.\n\nLe schéma de calcul ne peut être ajouté qu'aux tables avec les colonnes:\n- Conclusion\n- Assertion\n- CTR");
    return;
  }

  // Rechercher la div parente contenant les tables
  const parentDiv = this.targetTable.closest('div.prose, div[class*="prose"]');
  
  if (!parentDiv) {
    this.showAlert("⚠️ Impossible de trouver le conteneur parent de la table.");
    return;
  }

  // Rechercher la table 2 (contient "Nature de test")
  const tables = parentDiv.querySelectorAll("table");
  let table2 = null;
  let natureDeTest = null;

  for (const table of tables) {
    const result = this.extractNatureDeTest(table);
    if (result) {
      table2 = table;
      natureDeTest = result;
      break;
    }
  }

  if (!table2 || !natureDeTest) {
    this.showAlert("⚠️ Aucune table avec 'Nature de test' trouvée dans cette section.\n\nLe schéma de calcul nécessite une table contenant:\n- Une colonne 'Nature de test'\n- Une valeur (Validation, Mouvement, Rapprochement, etc.)");
    return;
  }

  console.log(`📊 [Schéma Calcul] Nature de test détectée: "${natureDeTest}"`);

  // Vérifier si un schéma existe déjà
  const existingSchema = this.findExistingSchemaCalcul(this.targetTable);
  
  if (existingSchema) {
    const response = confirm("Un schéma de calcul existe déjà pour cette table.\n\nVoulez-vous le remplacer ?");
    if (response) {
      existingSchema.remove();
      console.log("🗑️ [Schéma Calcul] Schéma existant supprimé");
    } else {
      return;
    }
  }

  // Créer le schéma de calcul
  try {
    this.createSchemaCalculTable(this.targetTable, natureDeTest);
    this.showQuickNotification(`✅ Schéma de calcul ajouté: ${natureDeTest}`);
    console.log("✅ [Schéma Calcul] Schéma créé avec succès");
  } catch (error) {
    console.error("❌ [Schéma Calcul] Erreur:", error);
    this.showAlert(`❌ Erreur lors de la création du schéma:\n\n${error.message}`);
  }
}

/**
 * Régénérer le schéma de calcul (supprime et recrée)
 */
regenererSchemaCalcul() {
  console.log("🔄 [Schéma Calcul] Régénération du schéma");

  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }

  const existingSchema = this.findExistingSchemaCalcul(this.targetTable);
  
  if (!existingSchema) {
    this.showAlert("⚠️ Aucun schéma de calcul trouvé pour cette table.\n\nUtilisez 'Ajouter Schéma de calcul' pour en créer un.");
    return;
  }

  // Supprimer et recréer
  existingSchema.remove();
  this.ajouterSchemaCalcul();
}

/**
 * Supprimer le schéma de calcul
 */
supprimerSchemaCalcul() {
  console.log("🗑️ [Schéma Calcul] Suppression du schéma");

  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }

  const existingSchema = this.findExistingSchemaCalcul(this.targetTable);
  
  if (!existingSchema) {
    this.showAlert("⚠️ Aucun schéma de calcul trouvé pour cette table.");
    return;
  }

  const response = confirm("Supprimer le schéma de calcul ?");
  
  if (response) {
    existingSchema.remove();
    this.showQuickNotification("✅ Schéma de calcul supprimé");
    console.log("✅ [Schéma Calcul] Schéma supprimé");
    
    // Supprimer aussi du localStorage
    if (window.SchemaCalculManager) {
      const schemaId = existingSchema.dataset.schemaId;
      const allData = window.SchemaCalculManager.loadAllData();
      delete allData[schemaId];
      window.SchemaCalculManager.saveAllData(allData);
    }
  }
}

/**
 * Extraire la "Nature de test" d'une table
 * Gère 3 cas:
 * - Cas 1 horizontal (ligne): "Nature de test" | "Rapprochement"
 * - Cas 2 vertical (colonne): "Nature de test" en en-tête, "Rapprochement" dans la cellule en dessous
 * - Cas 3 colonne adjacente: Colonne "Nature de test" avec valeur dans cellule adjacente (même ligne)
 */
extractNatureDeTest(table) {
  const rows = table.querySelectorAll("tr");
  
  console.log(`📐 [Nature] Analyse de table avec ${rows.length} ligne(s)`);
  
  // CAS 1: Recherche horizontale (dans les lignes)
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const cells = row.querySelectorAll("td, th");
    
    for (let i = 0; i < cells.length - 1; i++) {
      const cellText = cells[i].textContent.trim().toLowerCase();
      
      if (cellText.includes("nature") && cellText.includes("test")) {
        // La valeur est dans la cellule suivante (même ligne)
        const valueCell = cells[i + 1];
        if (valueCell && valueCell.textContent.trim() !== "") {
          const value = valueCell.textContent.trim();
          console.log(`📐 [Nature] ✅ Trouvée en horizontal (ligne ${rowIdx}): "${value}"`);
          return value;
        }
      }
    }
  }
  
  // CAS 2: Recherche verticale (dans les colonnes)
  // Parcourir TOUTES les lignes pour trouver "Nature de test"
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const cells = row.querySelectorAll("td, th");
    
    for (let colIdx = 0; colIdx < cells.length; colIdx++) {
      const cellText = cells[colIdx].textContent.trim().toLowerCase();
      
      if (cellText.includes("nature") && cellText.includes("test")) {
        console.log(`📐 [Nature] Colonne "Nature de test" trouvée à ligne ${rowIdx}, colonne ${colIdx}`);
        
        // Chercher la valeur dans les lignes suivantes, même colonne
        for (let nextRowIdx = rowIdx + 1; nextRowIdx < rows.length; nextRowIdx++) {
          const nextRow = rows[nextRowIdx];
          const nextCells = nextRow.querySelectorAll("td, th");
          
          if (nextCells[colIdx]) {
            const value = nextCells[colIdx].textContent.trim();
            if (value !== "" && !value.toLowerCase().includes("nature")) {
              console.log(`📐 [Nature] ✅ Trouvée en vertical (ligne ${nextRowIdx}): "${value}"`);
              return value;
            }
          }
        }
        
        // CAS 3: Si pas de valeur en dessous, chercher dans la cellule adjacente (même ligne, colonne suivante)
        // Cela gère le cas où l'en-tête est mal rendu et devient une colonne
        if (colIdx + 1 < cells.length) {
          const adjacentCell = cells[colIdx + 1];
          if (adjacentCell && adjacentCell.textContent.trim() !== "") {
            const value = adjacentCell.textContent.trim();
            if (!value.toLowerCase().includes("nature")) {
              console.log(`📐 [Nature] ✅ Trouvée en colonne adjacente (ligne ${rowIdx}, colonne ${colIdx + 1}): "${value}"`);
              return value;
            }
          }
        }
      }
    }
  }
  
  console.log("📐 [Nature] ❌ Aucune nature de test trouvée");
  return null;
}

/**
 * Vérifier si une table est modelisée
 */
isModelizedTable(table) {
  const headers = this.getTableHeadersSimple(table);
  const requiredColumns = ["conclusion", "assertion", "ctr"];
  
  return requiredColumns.some((col) =>
    headers.some((header) => this.matchesColumnSimple(header, col))
  );
}

/**
 * Obtenir les en-têtes d'une table (version simplifiée)
 */
getTableHeadersSimple(table) {
  const headerSelectors = [
    "thead th",
    "thead td",
    "tr:first-child th",
    "tr:first-child td",
  ];

  for (const selector of headerSelectors) {
    const headers = table.querySelectorAll(selector);
    if (headers.length > 0) {
      return Array.from(headers).map((cell) => cell.textContent.trim().toLowerCase());
    }
  }

  return [];
}

/**
 * Vérifier si un en-tête correspond à un type de colonne
 */
matchesColumnSimple(headerText, columnType) {
  const patterns = {
    assertion: /^assertion$/i,
    conclusion: /^conclusion$/i,
    ctr: /^ctr\d*$/i,
  };

  return patterns[columnType] && patterns[columnType].test(headerText);
}

/**
 * Trouver un schéma de calcul existant pour une table
 */
findExistingSchemaCalcul(table) {
  const tableId = table.dataset.tableId || this.generateTableIdSimple(table);
  
  // Chercher le schéma juste avant la table
  let previousElement = table.previousElementSibling;
  
  while (previousElement) {
    if (
      previousElement.tagName === "TABLE" &&
      previousElement.classList.contains("claraverse-schema-calcul") &&
      previousElement.dataset.forTable === tableId
    ) {
      return previousElement;
    }
    
    // Ne chercher que dans les éléments immédiatement avant
    if (previousElement.tagName === "TABLE") {
      break;
    }
    
    previousElement = previousElement.previousElementSibling;
  }
  
  return null;
}

/**
 * Créer la table du schéma de calcul
 */
createSchemaCalculTable(tablePrincipale, natureDeTest) {
  console.log(`📐 [Schéma Calcul] Création pour: ${natureDeTest}`);

  // Déterminer le modèle
  const modele = this.determinerModeleSchemaCalcul(natureDeTest);
  
  if (!modele) {
    throw new Error(`Aucun modèle trouvé pour la nature de test: ${natureDeTest}`);
  }

  // Créer la table
  const schemaTable = document.createElement("table");
  schemaTable.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg claraverse-schema-calcul";
  schemaTable.style.cssText = `
    margin-bottom: 1rem;
    border-collapse: separate;
    border-spacing: 0;
    background: #fffbf0;
  `;

  // Générer les IDs
  const tableId = tablePrincipale.dataset.tableId || this.generateTableIdSimple(tablePrincipale);
  const schemaId = `schema_${tableId}_${Date.now()}`;
  
  schemaTable.dataset.schemaId = schemaId;
  schemaTable.dataset.forTable = tableId;

  // Créer le caption
  // Pas de caption - le schéma parle de lui-même

  // Créer le tbody
  const tbody = document.createElement("tbody");
  const row = document.createElement("tr");

  modele.colonnes.forEach((colonne) => {
    const td = document.createElement("td");
    td.className = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    td.style.cssText = `
      background: #fff9e6;
      font-weight: 500;
      text-align: center;
      min-width: 80px;
      cursor: text;
    `;
    td.textContent = colonne;
    td.contentEditable = "true";
    
    // Événements pour la sauvegarde
    td.addEventListener("blur", () => {
      if (window.SchemaCalculManager) {
        window.SchemaCalculManager.saveSchemaData(schemaTable);
      }
    });

    td.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        td.blur();
      }
    });
    
    row.appendChild(td);
  });

  tbody.appendChild(row);
  schemaTable.appendChild(tbody);

  // Insérer au-dessus de la table principale
  tablePrincipale.parentNode.insertBefore(schemaTable, tablePrincipale);

  // Notifier le gestionnaire de schémas
  if (window.SchemaCalculManager) {
    window.SchemaCalculManager.setupSchemaChangeDetection(schemaTable);
    window.SchemaCalculManager.saveSchemaDataNow(schemaTable);
  }

  console.log(`✅ [Schéma Calcul] Table créée avec ID: ${schemaId}`);
}

/**
 * Déterminer le modèle de schéma selon la nature de test
 */
determinerModeleSchemaCalcul(natureDeTest) {
  const nature = natureDeTest.toLowerCase();

  // Validation
  if (nature.includes("validation")) {
    return {
      type: "Validation",
      colonnes: ["(A)", "(B)", "(C) = (A) + (B)", "(D)", "(E) = (C) - (D)"],
    };
  }

  // Mouvement
  if (nature.includes("mouvement")) {
    return {
      type: "Mouvement",
      colonnes: ["(A)", "(B)", "(C)", "(D) = (A) + (B) - (C)", "(E)", "(F) = (D) - (E)"],
    };
  }

  // Rapprochement
  if (nature.includes("rapprochement")) {
    return {
      type: "Rapprochement",
      colonnes: ["(A)", "(B)", "(C) = (A) - (B)"],
    };
  }

  // Séparation
  if (nature.includes("separation") || nature.includes("séparation")) {
    return {
      type: "Séparation",
      colonnes: ["(A)", "(B)", "(C) = (A) - (B)"],
    };
  }

  // Estimation
  if (nature.includes("estimation")) {
    return {
      type: "Estimation",
      colonnes: ["(A)", "(B)", "(C) = (A) * (B)", "(D)", "(E) = (C) - (D)"],
    };
  }

  // Revue analytique
  if (nature.includes("revue") && nature.includes("analytique")) {
    return {
      type: "Revue analytique",
      colonnes: ["(A)", "(B)", "(C) = (A) - (B)"],
    };
  }

  // Cadrage TVA
  if (nature.includes("cadrage") && nature.includes("tva")) {
    return {
      type: "Cadrage TVA",
      colonnes: ["(A)", "(B) = (A) * 18%", "(C)", "(D)", "(E)", "(F) = (B) - (C) - (D) - (E)"],
    };
  }

  // Cotisations sociales
  if (nature.includes("cotisation") && nature.includes("sociale")) {
    return {
      type: "Cotisations sociales",
      colonnes: ["(A)", "(B)", "(C)", "(D)"],
    };
  }

  // Vierge
  if (nature.includes("vierge")) {
    return {
      type: "Vierge",
      colonnes: [],
    };
  }

  // Modélisation (détection par expressions régulières)
  if (nature.includes("modelisation") || nature.includes("modélisation")) {
    const variables = this.extractVariablesFromNature(natureDeTest);
    return {
      type: "Modélisation",
      colonnes: variables.length > 0 ? variables : ["(X)", "(Y)", "(Z)"],
    };
  }

  // Par défaut, essayer de détecter un pattern
  const variables = this.extractVariablesFromNature(natureDeTest);
  if (variables.length > 0) {
    return {
      type: "Modélisation (auto-détecté)",
      colonnes: variables,
    };
  }

  return null;
}

/**
 * Extraire les variables d'une formule de modélisation
 */
extractVariablesFromNature(natureDeTest) {
  const variablePattern = /\([A-Z]\)/g;
  const matches = natureDeTest.match(variablePattern);
  
  if (!matches) return [];

  return [...new Set(matches)];
}

/**
 * Générer un ID simple pour une table
 */
generateTableIdSimple(table) {
  if (table.dataset.tableId) {
    return table.dataset.tableId;
  }

  const headers = this.getTableHeadersSimple(table);
  const headerText = headers.join("__").replace(/\s+/g, "_");
  const hash = this.hashCodeSimple(headerText);
  const uniqueId = `table_${hash}`;
  
  table.dataset.tableId = uniqueId;
  return uniqueId;
}

/**
 * Fonction de hachage simple
 */
hashCodeSimple(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 3: AJOUTER LE RACCOURCI CLAVIER
// Dans la méthode attachEventListeners(), ajouter après les autres raccourcis:
// ═══════════════════════════════════════════════════════════════════════════════

/*
// Raccourci Schéma de calcul Ctrl+Shift+S
if (e.ctrlKey && e.shiftKey && e.key === "S" && this.targetTable) { 
  e.preventDefault(); 
  this.ajouterSchemaCalcul(); 
}
*/
