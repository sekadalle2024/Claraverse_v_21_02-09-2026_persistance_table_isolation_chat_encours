/**
 * PATCH POUR FLOWISE.JS - Support du format de réponse n8n "Programme de travail"
 * Ce script corrige la fonction normalizeN8nResponse pour gérer le nouveau format
 * 
 * UTILISATION:
 * 1. Ouvrir la console du navigateur
 * 2. Copier-coller ce script
 * 3. Exécuter: applyPatchToFlowise()
 */

function applyPatchToFlowise() {
    console.log("🔧 ========== APPLICATION DU PATCH FLOWISE.JS ==========");

    if (!window.ClaraverseN8nV17) {
        console.error("❌ ClaraverseN8nV17 non trouvé. Assurez-vous que Flowise.js est chargé.");
        return false;
    }

    // Sauvegarder l'ancienne fonction
    const oldNormalize = window.ClaraverseN8nV17.normalizeN8nResponse;

    /**
     * NOUVELLE FONCTION normalizeN8nResponse avec support complet
     */
    window.ClaraverseN8nV17.normalizeN8nResponse = function (response) {
        console.log("🔍 ========== NORMALISATION RÉPONSE N8N (PATCHED) ==========");
        console.log("📦 Type de réponse:", Array.isArray(response) ? "Array" : typeof response);
        console.log("📦 Réponse complète (1500 premiers caractères):", JSON.stringify(response, null, 2).substring(0, 1500));

        // ⭐ FORMAT 1: Array avec objet contenant 'response.body[0].output'
        // Format: [{ "response": { "body": [{ "output": "...", "status": "success", ... }], ... } }]
        if (Array.isArray(response) && response.length > 0) {
            console.log("✅ Réponse est un Array avec", response.length, "élément(s)");
            const firstItem = response[0];
            console.log("📦 Premier élément - Type:", typeof firstItem);
            console.log("📦 Premier élément - Clés:", firstItem ? Object.keys(firstItem) : "null");

            // Format avec response.body[0].output (webhook htlm_processor)
            if (firstItem && typeof firstItem === 'object' && 'response' in firstItem) {
                console.log("🔍 Détection du format response.body...");
                console.log("📦 firstItem.response - Type:", typeof firstItem.response);
                console.log("📦 firstItem.response - Clés:", firstItem.response ? Object.keys(firstItem.response) : "null");

                if (firstItem.response && typeof firstItem.response === 'object' && 'body' in firstItem.response) {
                    const body = firstItem.response.body;
                    console.log("📦 Body détecté - Type:", Array.isArray(body) ? `Array[${body.length}]` : typeof body);

                    if (Array.isArray(body) && body.length > 0) {
                        console.log("📦 Body[0] - Type:", typeof body[0]);
                        console.log("📦 Body[0] - Clés:", body[0] ? Object.keys(body[0]) : "null");
                        console.log("📦 Body[0].output existe?", 'output' in body[0]);
                        console.log("📦 Body[0].output - Type:", typeof body[0].output);
                        console.log("📦 Body[0].output - Longueur:", body[0].output?.length || 0);
                        console.log("📦 Body[0].output - Aperçu (300 premiers caractères):", body[0].output?.substring(0, 300) || "vide");

                        if (body[0].output && body[0].output.trim() !== '') {
                            console.log("✅ ✅ ✅ FORMAT DÉTECTÉ: Webhook htlm_processor (response.body[0].output)");
                            console.log("📊 Status:", body[0].status);
                            console.log("📋 Content length:", body[0].output?.length || 0);
                            console.log("📋 Timestamp:", body[0].timestamp);

                            return {
                                output: body[0].output,
                                metadata: {
                                    status: body[0].status,
                                    timestamp: body[0].timestamp,
                                    contentLength: body[0].output?.length || 0,
                                    headers: firstItem.response.headers,
                                    statusCode: firstItem.response.statusCode
                                }
                            };
                        } else {
                            console.warn("⚠️ body[0].output est vide ou undefined");
                        }
                    } else {
                        console.warn("⚠️ body n'est pas un Array ou est vide");
                    }
                } else {
                    console.warn("⚠️ firstItem.response n'a pas de propriété 'body'");
                }
            } else {
                console.log("ℹ️ firstItem n'a pas de propriété 'response', test des autres formats...");
            }

            // Format avec 'data' (Programme de travail)
            if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
                console.log("✅ Format détecté: Programme de travail (data)");
                return {
                    output: convertStructuredDataToMarkdown(firstItem.data),
                    metadata: firstItem
                };
            }

            // Format avec 'output' + 'status' + 'table_format' (Workflow htlm_processor)
            if (firstItem && typeof firstItem === 'object' && 'output' in firstItem && 'status' in firstItem) {
                console.log("✅ Format détecté: Workflow htlm_processor (output + status + table_format)");
                console.log("📊 Status:", firstItem.status);
                console.log("📋 Table format:", firstItem.table_format);

                if (firstItem.status === 'success' && firstItem.output) {
                    return {
                        output: firstItem.output,
                        metadata: {
                            status: firstItem.status,
                            table_format: firstItem.table_format,
                            processing_stats: firstItem.processing_stats,
                            timestamp: firstItem.timestamp
                        }
                    };
                } else if (firstItem.status === 'error') {
                    console.error("❌ Erreur dans la réponse n8n:", firstItem);
                    return {
                        output: null,
                        metadata: { error: "Erreur n8n", details: firstItem }
                    };
                }
            }

            // Format avec 'output' standard (sans status)
            if (firstItem && typeof firstItem === 'object' && 'output' in firstItem) {
                console.log("✅ Format détecté: Standard (output dans array)");
                return {
                    output: firstItem.output,
                    metadata: firstItem
                };
            }
        }

        // Format 2: Objet direct avec 'output'
        if (response && typeof response === 'object' && !Array.isArray(response)) {
            // Format avec response.body[0].output (objet direct)
            if ('response' in response && response.response && 'body' in response.response) {
                const body = response.response.body;
                if (Array.isArray(body) && body.length > 0 && body[0].output) {
                    console.log("✅ Format détecté: Webhook htlm_processor (objet direct avec response.body)");
                    return {
                        output: body[0].output,
                        metadata: {
                            status: body[0].status,
                            timestamp: body[0].timestamp,
                            headers: response.response.headers,
                            statusCode: response.response.statusCode
                        }
                    };
                }
            }

            // Format avec 'output' + 'status' (objet direct)
            if ('output' in response && 'status' in response) {
                console.log("✅ Format détecté: Workflow htlm_processor (objet direct)");
                if (response.status === 'success' && response.output) {
                    return {
                        output: response.output,
                        metadata: {
                            status: response.status,
                            table_format: response.table_format,
                            processing_stats: response.processing_stats,
                            timestamp: response.timestamp
                        }
                    };
                }
            }

            if ('output' in response) {
                console.log("✅ Format détecté: Output direct");
                return {
                    output: response.output,
                    metadata: response
                };
            }

            // Format avec 'tables'
            if ('tables' in response && Array.isArray(response.tables)) {
                console.log("✅ Format détecté: Tables array");
                const output = response.tables
                    .map(table => table?.markdown || '')
                    .filter(content => content.trim() !== '')
                    .join('\n\n---\n\n');
                return {
                    output: output,
                    metadata: response
                };
            }
        }

        console.error("❌ Format de réponse non reconnu:", response);
        console.error("📦 Structure complète:", JSON.stringify(response, null, 2));
        return {
            output: null,
            metadata: { error: "Format inconnu", rawResponse: response }
        };
    };

    /**
     * Fonction helper pour convertir les données structurées en Markdown
     */
    function convertStructuredDataToMarkdown(data) {
        let markdown = "";

        try {
            const mainKey = Object.keys(data).find(key =>
                key.toLowerCase().includes("etape") ||
                key.toLowerCase().includes("mission") ||
                key.toLowerCase().includes("programme")
            ) || Object.keys(data)[0];

            const dataArray = data[mainKey];
            if (!Array.isArray(dataArray)) {
                console.warn("⚠️ Format de données non-array, retour JSON brut");
                return JSON.stringify(data, null, 2);
            }

            console.log(`📊 Conversion de ${dataArray.length} tables structurées...`);

            dataArray.forEach((tableObj) => {
                const tableKey = Object.keys(tableObj)[0];
                const tableData = tableObj[tableKey];

                // Table d'en-tête (objet simple)
                if (typeof tableData === 'object' && !Array.isArray(tableData)) {
                    markdown += "| Rubrique | Description |\n";
                    markdown += "|----------|-------------|\n";
                    Object.entries(tableData).forEach(([key, value]) => {
                        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                        markdown += `| **${formattedKey}** | ${value} |\n`;
                    });
                    markdown += "\n\n";
                }

                // Table de données (array)
                else if (Array.isArray(tableData) && tableData.length > 0) {
                    const columns = Object.keys(tableData[0]);
                    const headers = columns.map(col =>
                        col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ')
                    );

                    markdown += "| " + headers.join(" | ") + " |\n";
                    markdown += "|" + columns.map(() => "---").join("|") + "|\n";

                    tableData.forEach(row => {
                        const cells = columns.map(col => {
                            const value = row[col];
                            if (value === null || value === undefined) return "-";
                            return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ").trim() || "-";
                        });
                        markdown += "| " + cells.join(" | ") + " |\n";
                    });
                    markdown += "\n";
                }
            });

            console.log(`✅ Conversion terminée: ${markdown.length} caractères générés`);
        } catch (error) {
            console.error("❌ Erreur conversion markdown:", error);
            return JSON.stringify(data, null, 2);
        }

        return markdown;
    }

    console.log("✅ Patch appliqué avec succès!");
    console.log("💡 La fonction normalizeN8nResponse a été mise à jour");
    console.log("🔄 Testez maintenant avec une table 'Programme de travail'");

    return true;
}

// Auto-application du patch
console.log("🚀 Script de patch chargé");
console.log("💡 Exécutez: applyPatchToFlowise()");
console.log("💡 Ou attendez 2 secondes pour l'application automatique...");

setTimeout(() => {
    if (window.ClaraverseN8nV17) {
        applyPatchToFlowise();
    } else {
        console.warn("⚠️ ClaraverseN8nV17 non disponible. Rechargez la page et réessayez.");
    }
}, 2000);
