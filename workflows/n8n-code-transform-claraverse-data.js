/**
 * Node Code n8n - Transformation des données Claraverse
 * 
 * Ce code transforme les données reçues du webhook Claraverse
 * vers le format structuré spécifié :
 * - User_message: Array de clé-valeur
 * - Fichiers Excel: "filename.xlsx" avec "onglet_X - table Y"
 * - Fichiers Word: "filename.doc" avec sections numérotées
 * 
 * À placer juste après le node Webhook dans votre workflow n8n
 */

// Récupérer les données du webhook
const webhookData = $input.first().json;
const questionRaw = webhookData.body?.question || webhookData.question || '';

// Résultat final - Array structuré
const result = [];

// ============================================================================
// 1. EXTRAIRE LE DISPLAY_META (contient toutes les données structurées)
// ============================================================================
let displayMeta = null;
let userQuestionText = questionRaw;

const metaRegex = /\[DISPLAY_META:([\s\S]*?)\]\n\n/;
const metaMatch = questionRaw.match(metaRegex);

if (metaMatch) {
    try {
        displayMeta = JSON.parse(metaMatch[1]);
        console.log('✅ DISPLAY_META extrait avec succès');
    } catch (e) {
        console.log('⚠️ Erreur parsing DISPLAY_META:', e.message);
    }

    // Extraire la question utilisateur (après "User Question:")
    const userQuestionMatch = questionRaw.match(/User Question:\s*([\s\S]*?)$/);
    if (userQuestionMatch) {
        userQuestionText = userQuestionMatch[1].trim();
    }
}

// ============================================================================
// 2. CONSTRUIRE User_message à partir du texte utilisateur
// ============================================================================
const userMessageArray = [];

// Parser les patterns [Key] = Value ou [Key] : Value
const keyValueRegex = /\[([^\]]+)\]\s*[=:]\s*([^\[\n]*)/g;
let kvMatch;

while ((kvMatch = keyValueRegex.exec(userQuestionText)) !== null) {
    const key = `[${kvMatch[1].trim()}]`;
    let value = kvMatch[2].trim();

    // Convertir en nombre si applicable
    if (/^\d+$/.test(value)) {
        value = parseInt(value, 10);
    }

    userMessageArray.push({ [key]: value });
}

// Si aucun pattern trouvé, ajouter le message brut
if (userMessageArray.length === 0 && userQuestionText.trim()) {
    userMessageArray.push({ "[Message]": userQuestionText.trim() });
}

// Ajouter User_message au résultat
if (userMessageArray.length > 0) {
    result.push({ "User_message": userMessageArray });
}

// ============================================================================
// 3. TRAITER LES FICHIERS EXCEL depuis flowiseExtractedData
// ============================================================================
if (displayMeta?.flowiseExtractedData) {
    const flowiseData = displayMeta.flowiseExtractedData;

    Object.keys(flowiseData).forEach(fileNameWithoutExt => {
        const tables = flowiseData[fileNameWithoutExt];
        const fileName = `${fileNameWithoutExt}.xlsx`;

        if (Array.isArray(tables)) {
            const formattedTables = [];
            let ongletIndex = 1;

            tables.forEach((tableObj, tableIdx) => {
                // Chaque tableObj a une clé comme "table 1"
                Object.keys(tableObj).forEach(tableKey => {
                    const tableData = tableObj[tableKey];

                    // Créer la clé composite "onglet_X - table Y"
                    const compositeKey = `onglet_${ongletIndex} - table ${tableIdx + 1}`;

                    if (Array.isArray(tableData)) {
                        formattedTables.push({ [compositeKey]: tableData });
                    }
                });
            });

            if (formattedTables.length > 0) {
                result.push({ [fileName]: formattedTables });
            }

            ongletIndex++;
        }
    });
}

// ============================================================================
// 4. TRAITER LES FICHIERS WORD depuis n8nExtractedData
// ============================================================================
if (displayMeta?.n8nExtractedData?.files) {
    displayMeta.n8nExtractedData.files.forEach(file => {
        if (file.type === 'word' && file.structuredData?.rawText) {
            const fileName = file.filename;
            const rawText = file.structuredData.rawText;

            // Extraire les sections du document Word
            const sections = extractWordSections(rawText);

            if (sections.length > 0) {
                result.push({ [fileName]: sections });
            }
        }
    });
}

// ============================================================================
// FONCTION: Extraire les sections d'un document Word
// ============================================================================
function extractWordSections(text) {
    const sections = [];
    let sectionNum = 1;

    // Nettoyer le texte
    const cleanText = text.trim();

    // Essayer de détecter des sections numérotées existantes
    const numberedSectionRegex = /(\d+)\.\s*([^:\n]+)(?::\s*|\n)([\s\S]*?)(?=\d+\.\s*[^:\n]+(?::\s*|\n)|$)/g;
    let match;

    while ((match = numberedSectionRegex.exec(cleanText)) !== null) {
        const title = match[2].trim();
        const content = match[3].trim();
        sections.push({ [`${match[1]}. ${title}`]: content });
    }

    // Si pas de sections numérotées, essayer les en-têtes FRAP courants
    if (sections.length === 0) {
        const frapHeaders = [
            { pattern: /Titre\s*[:\n]\s*([\s\S]*?)(?=Libellé|Observation|Cause|Risque|Recommandation|Conséquence|$)/i, name: 'Titre' },
            { pattern: /Libellé\s*[:\n]\s*([\s\S]*?)(?=Observation|Cause|Risque|Recommandation|Conséquence|$)/i, name: 'Libellé' },
            { pattern: /Observation\s*[:\n]\s*([\s\S]*?)(?=Cause|Risque|Recommandation|Conséquence|$)/i, name: 'Observation' },
            { pattern: /Cause\s*[:\n]\s*([\s\S]*?)(?=Risque|Recommandation|Conséquence|$)/i, name: 'Cause' },
            { pattern: /Risque\s*[:\n]\s*([\s\S]*?)(?=Recommandation|Conséquence|$)/i, name: 'Risque' },
            { pattern: /Recommandation\s*[:\n]\s*([\s\S]*?)(?=Conséquence|$)/i, name: 'Recommandation' },
            { pattern: /Conséquence\s*[:\n]\s*([\s\S]*?)$/i, name: 'Conséquence' }
        ];

        frapHeaders.forEach(header => {
            const headerMatch = cleanText.match(header.pattern);
            if (headerMatch && headerMatch[1].trim()) {
                sections.push({ [`${sectionNum}. ${header.name}`]: headerMatch[1].trim() });
                sectionNum++;
            }
        });
    }

    // Fallback: si toujours pas de sections, créer une section unique
    if (sections.length === 0 && cleanText.length > 0) {
        // Essayer de détecter Destinataire, Objet, etc. pour une lettre
        const letterPatterns = [
            { pattern: /Destinataire\(?s?\)?\s*[:\n]\s*([^\n]+)/i, name: 'Destinataire' },
            { pattern: /Copie\s*[:\n]\s*([^\n]+)/i, name: 'Copie' },
            { pattern: /Objet\s*[:\n]\s*([^\n]+)/i, name: 'Objet' }
        ];

        letterPatterns.forEach(lp => {
            const lpMatch = cleanText.match(lp.pattern);
            if (lpMatch) {
                sections.push({ [`${sectionNum}. ${lp.name}`]: lpMatch[1].trim() });
                sectionNum++;
            }
        });

        // Ajouter le corps du document
        if (sections.length > 0) {
            // Extraire le corps après les en-têtes
            const bodyMatch = cleanText.match(/Monsieur,\s*([\s\S]*?)(?:A\s+\w+\s*,\s*le|$)/i);
            if (bodyMatch) {
                sections.push({ [`${sectionNum}. Corps`]: bodyMatch[1].trim() });
            }
        } else {
            // Aucune structure détectée, mettre tout le contenu
            sections.push({ "1. Contenu": cleanText.substring(0, 5000) }); // Limiter à 5000 caractères
        }
    }

    return sections;
}

// ============================================================================
// RETOURNER LE RÉSULTAT STRUCTURÉ
// ============================================================================
console.log('📦 Résultat final structuré:', JSON.stringify(result, null, 2));

return [{
    json: {
        data: result,
        _meta: {
            totalItems: result.length,
            hasUserMessage: result.some(item => item.User_message),
            excelFiles: result.filter(item => Object.keys(item)[0]?.endsWith('.xlsx')).map(item => Object.keys(item)[0]),
            wordFiles: result.filter(item => Object.keys(item)[0]?.endsWith('.docx') || Object.keys(item)[0]?.endsWith('.doc')).map(item => Object.keys(item)[0]),
            processedAt: new Date().toISOString()
        }
    }
}];
