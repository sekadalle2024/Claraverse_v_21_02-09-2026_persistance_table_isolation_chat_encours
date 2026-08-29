/**
 * N8N CODE JAVASCRIPT - VERSION V6 AVEC SUPPORT CHECKBOX
 * Conversion HTML Tables Claraverse vers JSON
 * 🆕 V6: Détection de l'état des checkboxes (data-checked + checked attribute)
 */

// ===== CONFIGURATION PRODUCTION =====
const DEBUG = false; // Désactiver en production pour performance
const MAX_CELL_LENGTH = 500;

// Expressions régulières optimisées
const REGEX = {
    TABLE: /<table[^>]*>[\s\S]*?<\/table>/gi,
    ROW: /<tr[^>]*>([\s\S]*?)<\/tr>/gi,
    CELL: /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi,
    CLEAN: /<[^>]*>/g,
    SPACES: /\s+/g,
    FLOWISE: /\b(flowise|FLOWISE|Flowise)\b/gi,
    // 🆕 V6: Regex pour détecter les checkboxes
    CHECKBOX: /<input[^>]*type=["']checkbox["'][^>]*>/gi,
    DATA_CHECKED: /data-checked=["'](true|false)["']/i,
    CHECKED_ATTR: /\bchecked\b/i
};

/**
 * FONCTION PRINCIPALE - DÉTECTION VARIABLES N8N
 */
function getHTMLContent() {
    // Priorité 1: $json.user_message
    if (typeof $json !== 'undefined' && $json && $json.user_message) {
        return $json.user_message;
    }

    // Priorité 2: $json.chatInput
    if (typeof $json !== 'undefined' && $json && $json.chatInput) {
        return $json.chatInput;
    }

    // Priorité 3: $input
    if (typeof $input !== 'undefined' && $input && $input.all) {
        const inputData = $input.all();
        if (inputData.length > 0 && inputData[0].json && inputData[0].json.user_message) {
            return inputData[0].json.user_message;
        }
    }

    // Priorité 4: items array
    if (typeof items !== 'undefined' && items && items.length > 0) {
        const itemData = items[0].json;
        if (itemData && itemData.user_message) {
            return itemData.user_message;
        }
    }

    return null;
}

/**
 * 🆕 V6: DÉTECTION DE L'ÉTAT D'UNE CHECKBOX
 * Analyse le HTML d'une cellule pour détecter si une checkbox est cochée
 */
function detectCheckboxState(cellHTML) {
    // Vérifier si la cellule contient une checkbox
    const hasCheckbox = REGEX.CHECKBOX.test(cellHTML);

    if (!hasCheckbox) {
        return null; // Pas de checkbox
    }

    // Méthode 1: Vérifier l'attribut data-checked sur la cellule <td>
    const dataCheckedMatch = cellHTML.match(REGEX.DATA_CHECKED);
    if (dataCheckedMatch) {
        const isChecked = dataCheckedMatch[1].toLowerCase() === 'true';
        if (DEBUG) console.log(`  📋 data-checked="${dataCheckedMatch[1]}" → ${isChecked}`);
        return isChecked;
    }

    // Méthode 2: Vérifier l'attribut checked sur l'input
    const checkboxMatch = cellHTML.match(REGEX.CHECKBOX);
    if (checkboxMatch) {
        const checkboxHTML = checkboxMatch[0];
        const hasCheckedAttr = REGEX.CHECKED_ATTR.test(checkboxHTML);
        if (DEBUG) console.log(`  ☑️ checked attribute → ${hasCheckedAttr}`);
        return hasCheckedAttr;
    }

    // Par défaut: non cochée
    return false;
}

/**
 * EXTRACTION TABLES HTML - VERSION OPTIMISÉE
 */
function extractTables(htmlContent) {
    if (!htmlContent) return [];

    const tableMatches = htmlContent.match(REGEX.TABLE);
    if (!tableMatches) return [];

    const tables = [];
    tableMatches.forEach((tableHTML, index) => {
        const table = parseTable(tableHTML, index);
        if (table) tables.push(table);
    });

    return tables;
}

/**
 * PARSING TABLE OPTIMISÉ AVEC SUPPORT CHECKBOX
 */
function parseTable(tableHTML, index) {
    const rowMatches = tableHTML.match(REGEX.ROW);
    if (!rowMatches) return null;

    const table = {
        index,
        headers: [],
        rows: [],
        hasFlowise: false
    };

    let isFirstRow = true;

    rowMatches.forEach(rowHTML => {
        const cellMatches = rowHTML.match(REGEX.CELL);
        if (!cellMatches) return;

        const rowData = cellMatches.map(cellHTML => {
            // 🆕 V6: Détecter l'état de la checkbox AVANT de nettoyer le HTML
            const checkboxState = detectCheckboxState(cellHTML);

            // Nettoyer le contenu texte
            let content = cellHTML
                .replace(REGEX.CLEAN, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(REGEX.SPACES, ' ')
                .trim();

            // Limitation taille
            if (content.length > MAX_CELL_LENGTH) {
                content = content.substring(0, MAX_CELL_LENGTH) + '...';
            }

            // Détection Flowise
            if (REGEX.FLOWISE.test(content)) {
                table.hasFlowise = true;
            }

            // 🆕 V6: Si checkbox détectée, retourner l'état au lieu du texte vide
            if (checkboxState !== null) {
                return checkboxState; // Retourner true ou false
            }

            return content;
        });

        // Première ligne = headers
        if (isFirstRow && (rowHTML.includes('<th') || table.headers.length === 0)) {
            table.headers = rowData;
            isFirstRow = false;
        } else {
            table.rows.push(rowData);
        }
    });

    // Filtrer tables vides
    if (table.headers.length === 0 && table.rows.length === 0) {
        return null;
    }

    return table;
}

/**
 * CONVERSION JSON FORMAT SPÉCIFIQUE - VERSION DYNAMIQUE PURE
 */
function convertToJSON(tables) {
    if (!tables || tables.length === 0) {
        return {
            "Processus - étape inconnu": []
        };
    }

    // Déterminer nom du processus
    let etapeValue = "inconnu";
    if (tables[0] && tables[0].rows.length > 0 && tables[0].rows[0].length >= 2) {
        etapeValue = tables[0].rows[0][1] || "inconnu";
    }

    const processName = `Processus - étape ${etapeValue}`;
    const result = {};
    result[processName] = [];

    // Convertir chaque table
    tables.forEach((table, index) => {
        const tableKey = `table ${index + 1}`;
        const tableObj = {};

        if (table.headers.length === 1 && table.rows.length === 1) {
            // Table simple (1 colonne, 1 ligne) - Format objet direct
            tableObj[tableKey] = {
                [table.headers[0]]: table.rows[0][0]
            };
        } else if (table.headers.length === 2 && table.rows.length >= 1) {
            // Table 2 colonnes - Format objet avec clé-valeur dynamique
            const dynamicObj = {};
            table.rows.forEach(row => {
                if (row.length >= 2) {
                    dynamicObj[row[0]] = row[1]; // Première colonne = clé, deuxième = valeur
                }
            });
            tableObj[tableKey] = dynamicObj;
        } else if (table.headers.length > 2 && table.rows.length > 0) {
            // Table complexe (3+ colonnes) - Format array d'objets SANS "no"
            const tableArray = table.rows.map(row => {
                const rowObj = {};
                table.headers.forEach((header, headerIndex) => {
                    if (row[headerIndex] !== undefined) {
                        // 🆕 V6: Conserver les valeurs booléennes pour les checkboxes
                        rowObj[header] = row[headerIndex];
                    }
                });
                return rowObj;
            });
            tableObj[tableKey] = tableArray;
        } else if (table.headers.length > 0 && table.rows.length === 0) {
            // Table avec headers mais sans données
            tableObj[tableKey] = {
                "headers": table.headers,
                "status": "no_data"
            };
        } else {
            // Table vide
            tableObj[tableKey] = {
                "status": "empty"
            };
        }

        result[processName].push(tableObj);
    });

    return result;
}

// ===== EXÉCUTION PRINCIPALE N8N =====
try {
    const startTime = Date.now();

    // 1. Récupération du contenu HTML
    const htmlContent = getHTMLContent();

    if (!htmlContent) {
        if (DEBUG) console.log('❌ Aucune variable user_message détectée');
        return [{
            json: {
                error: "Variable user_message non trouvée",
                success: false,
                data: {}
            }
        }];
    }

    if (DEBUG) console.log(`📥 HTML récupéré: ${htmlContent.length} caractères`);

    // 2. Extraction des tables
    const tables = extractTables(htmlContent);

    if (tables.length === 0) {
        if (DEBUG) console.log('⚠️ Aucune table HTML trouvée');
        return [{
            json: {
                error: "Aucune table HTML valide trouvée",
                success: false,
                data: {}
            }
        }];
    }

    if (DEBUG) {
        console.log(`📊 ${tables.length} tables extraites`);
        // 🆕 V6: Logger les checkboxes détectées
        tables.forEach((table, idx) => {
            const checkboxCount = table.rows.reduce((count, row) => {
                return count + row.filter(cell => typeof cell === 'boolean').length;
            }, 0);
            if (checkboxCount > 0) {
                console.log(`  ☑️ Table ${idx + 1}: ${checkboxCount} checkbox(es) détectée(s)`);
            }
        });
    }

    // 3. Conversion JSON
    const jsonResult = convertToJSON(tables);

    const processingTime = Date.now() - startTime;

    if (DEBUG) {
        console.log(`✅ Conversion réussie en ${processingTime}ms`);
        console.log(`📋 Tables avec Flowise: ${tables.filter(t => t.hasFlowise).length}`);
    }

    // 4. Retour pour n8n
    return [{
        json: jsonResult
    }];

} catch (error) {
    if (DEBUG) console.error('💥 Erreur globale:', error.message);

    return [{
        json: {
            error: `Erreur de traitement: ${error.message}`,
            success: false,
            data: {},
            timestamp: new Date().toISOString()
        }
    }];
}

/**
 * NOTES TECHNIQUES V6:
 * 
 * 🆕 NOUVEAUTÉS V6:
 * - Détection automatique des checkboxes dans les cellules
 * - Support de data-checked="true|false"
 * - Support de l'attribut checked sur <input>
 * - Valeurs booléennes (true/false) dans le JSON de sortie
 * 
 * DÉTECTION CHECKBOX:
 * 1. Recherche de <input type="checkbox"> dans la cellule
 * 2. Vérification de data-checked="true|false" sur <td>
 * 3. Vérification de l'attribut checked sur <input>
 * 4. Retour de true/false au lieu du texte vide
 * 
 * EXEMPLE OUTPUT:
 * {
 *   "Option": "Hausse de l'inflation.",
 *   "Question": "Quelle est la bonne réponse ?",
 *   "Reponse User": true  ← Checkbox cochée
 * }
 * 
 * COMPATIBILITÉ:
 * - Fonctionne avec conso.js V6 (attribut checked)
 * - Fonctionne avec data-checked (V5 et antérieur)
 * - Fallback sur false si aucun attribut détecté
 * 
 * PERFORMANCE:
 * - Regex compilées une seule fois
 * - Détection avant nettoyage HTML
 * - Pas d'impact sur les cellules sans checkbox
 */
