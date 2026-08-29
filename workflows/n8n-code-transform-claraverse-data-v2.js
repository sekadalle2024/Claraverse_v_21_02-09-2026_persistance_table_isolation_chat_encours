/**
 * Node Code n8n - Transformation des données Claraverse V2
 * 
 * Supporte les formats suivants :
 * 1. Nouveau format direct avec { data: [...] } pour Word/PDF/Excel
 * 2. Ancien format avec displayMeta.flowiseExtractedData pour Excel
 * 3. Ancien format avec displayMeta.n8nExtractedData.files pour Word
 * 
 * Structure de sortie attendue [Data] :
 * - User_message: Array de clé-valeur
 * - Excel: "filename.xlsx" avec "onglet_X - table Y"
 * - Word/PDF: "filename.docx/pdf" avec structure hiérarchique (paragraphe_X, table_X)
 */

const webhookData = $input.first().json;
const result = [];

// ============================================================================
// DETECTION DU FORMAT D'ENTREE
// ============================================================================

// Format 1: Nouveau format direct { data: [...] }
if (webhookData.data && Array.isArray(webhookData.data)) {
    console.log('📦 FORMAT DETECTE: Nouveau format direct avec data[]');

    // Les données sont déjà structurées correctement par Claraverse
    // On les retourne directement
    return [{ json: { data: webhookData.data } }];
}

// Format 2: Ancien format avec body.question ou question
const questionRaw = webhookData.body ? webhookData.body.question : (webhookData.question || '');

if (!questionRaw) {
    console.log('⚠️ Aucune question trouvée dans la requête');
    return [{ json: { data: result } }];
}

console.log('📦 FORMAT DETECTE: Ancien format avec question');

// ============================================================================
// EXTRACTION DES METADONNEES
// ============================================================================

let displayMeta = null;
let userQuestionText = questionRaw;

// Extraire DISPLAY_META si présent
const metaMatch = questionRaw.match(/\[DISPLAY_META:([\s\S]*?)\]\n\n/);
if (metaMatch) {
    try {
        displayMeta = JSON.parse(metaMatch[1]);
        console.log('✅ DISPLAY_META extrait avec succès');
    } catch (e) {
        console.log('⚠️ Erreur parsing DISPLAY_META:', e.message);
    }

    // Extraire la question utilisateur
    const userQuestionMatch = questionRaw.match(/User Question:\s*([\s\S]*?)$/);
    if (userQuestionMatch) {
        userQuestionText = userQuestionMatch[1].trim();
    }
}

// ============================================================================
// TRAITEMENT DU MESSAGE UTILISATEUR
// ============================================================================

const userMessageArray = [];
const keyValueRegex = /\[([^\]]+)\]\s*[=:]\s*([^\[\n]*)/g;
let kvMatch;

while ((kvMatch = keyValueRegex.exec(userQuestionText)) !== null) {
    const key = '[' + kvMatch[1].trim() + ']';
    let value = kvMatch[2].trim();

    // Convertir en nombre si applicable
    if (/^\d+$/.test(value)) {
        value = parseInt(value, 10);
    }

    userMessageArray.push({ [key]: value });
}

// Si aucune donnée structurée, créer un message simple
if (userMessageArray.length === 0 && userQuestionText.trim()) {
    userMessageArray.push({ '[Message]': userQuestionText.trim() });
}

if (userMessageArray.length > 0) {
    result.push({ 'User_message': userMessageArray });
}

// ============================================================================
// TRAITEMENT DES FICHIERS EXCEL (flowiseExtractedData)
// ============================================================================

if (displayMeta && displayMeta.flowiseExtractedData) {
    const flowiseData = displayMeta.flowiseExtractedData;
    const fileNames = Object.keys(flowiseData);

    console.log('📊 Fichiers Excel trouvés:', fileNames.length);

    for (let i = 0; i < fileNames.length; i++) {
        const fileNameWithoutExt = fileNames[i];
        const tables = flowiseData[fileNameWithoutExt];
        const fileName = fileNameWithoutExt + '.xlsx';

        if (Array.isArray(tables)) {
            const formattedTables = [];

            for (let j = 0; j < tables.length; j++) {
                const tableObj = tables[j];
                const tableKeys = Object.keys(tableObj);

                for (let k = 0; k < tableKeys.length; k++) {
                    const tableKey = tableKeys[k];
                    const tableData = tableObj[tableKey];
                    const compositeKey = 'onglet_1 - table ' + (j + 1);

                    if (Array.isArray(tableData)) {
                        formattedTables.push({ [compositeKey]: tableData });
                    }
                }
            }

            if (formattedTables.length > 0) {
                result.push({ [fileName]: formattedTables });
                console.log('✅ Excel ajouté:', fileName);
            }
        }
    }
}

// ============================================================================
// TRAITEMENT DES FICHIERS WORD/PDF (n8nExtractedData)
// ============================================================================

if (displayMeta && displayMeta.n8nExtractedData && displayMeta.n8nExtractedData.files) {
    const files = displayMeta.n8nExtractedData.files;

    console.log('📄 Fichiers Word/PDF trouvés:', files.length);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type;
        const fileName = file.filename;

        // Traitement Word
        if (fileType === 'word' || fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
            console.log('📝 Traitement Word:', fileName);

            // Priorité 1: Données hiérarchiques directes (nouveau format)
            if (file.hierarchicalData && typeof file.hierarchicalData === 'object' && Object.keys(file.hierarchicalData).length > 0) {
                result.push({ [fileName]: file.hierarchicalData });
                console.log('✅ Word (hierarchicalData) ajouté:', fileName);
                continue;
            }

            // Priorité 2: Données structurées hiérarchiques
            if (file.structuredData && typeof file.structuredData === 'object') {
                const keys = Object.keys(file.structuredData);
                if (keys.length > 0 && keys[0] !== 'rawText') {
                    result.push({ [fileName]: file.structuredData });
                    console.log('✅ Word (structuredData hiérarchique) ajouté:', fileName);
                    continue;
                }

                // Si on a rawText, le parser
                if (file.structuredData.rawText) {
                    const sections = parseTextToSections(file.structuredData.rawText);
                    result.push({ [fileName]: sections });
                    console.log('✅ Word (rawText parsé) ajouté:', fileName);
                    continue;
                }
            }

            // Priorité 3: Texte extrait brut
            if (file.extractedText) {
                const sections = parseTextToSections(file.extractedText);
                result.push({ [fileName]: sections });
                console.log('✅ Word (extractedText) ajouté:', fileName);
            }
        }

        // Traitement PDF
        else if (fileType === 'pdf' || fileName.toLowerCase().endsWith('.pdf')) {
            console.log('📕 Traitement PDF:', fileName);

            // Priorité 1: Données hiérarchiques directes (nouveau format)
            if (file.hierarchicalData && typeof file.hierarchicalData === 'object' && Object.keys(file.hierarchicalData).length > 0) {
                result.push({ [fileName]: file.hierarchicalData });
                console.log('✅ PDF (hierarchicalData) ajouté:', fileName);
                continue;
            }

            // Priorité 2: Données structurées hiérarchiques
            if (file.structuredData && typeof file.structuredData === 'object') {
                const keys = Object.keys(file.structuredData);
                if (keys.length > 0 && keys[0] !== 'rawText') {
                    result.push({ [fileName]: file.structuredData });
                    console.log('✅ PDF (structuredData hiérarchique) ajouté:', fileName);
                    continue;
                }

                if (file.structuredData.rawText) {
                    const sections = parseTextToSections(file.structuredData.rawText);
                    result.push({ [fileName]: sections });
                    console.log('✅ PDF (rawText parsé) ajouté:', fileName);
                    continue;
                }
            }

            // Priorité 3: Texte extrait brut
            if (file.extractedText) {
                const sections = parseTextToSections(file.extractedText);
                result.push({ [fileName]: sections });
                console.log('✅ PDF (extractedText) ajouté:', fileName);
            }
        }
    }
}

// ============================================================================
// FONCTION UTILITAIRE: Parser le texte en sections hiérarchiques
// ============================================================================

function parseTextToSections(text) {
    const result = {};

    // Nettoyer le texte
    let cleanText = text
        .replace(/📄 Contenu extrait du document (?:Word|PDF):.*?\n\n/g, '')
        .replace(/--- Page Break ---/g, '\n')
        .trim();

    // Patterns de détection des titres
    const headingPatterns = [
        // Chiffres romains: I., II., III., etc.
        { regex: /^(I{1,3}|IV|V|VI{0,3}|IX|X)\.\s+(.+)$/im, level: 1 },
        // Chapitres: 1., 2., 3., etc.
        { regex: /^(\d)\.\s+(.+)$/m, level: 1 },
        // Sections: 1.1, 2.1, etc.
        { regex: /^(\d+\.\d+)\s+(.+)$/m, level: 2 },
        // Sous-sections: 1.1.1, etc.
        { regex: /^(\d+\.\d+\.\d+)\s+(.+)$/m, level: 3 },
        // Lettres majuscules: A., B., C., etc.
        { regex: /^([A-Z])\.\s+(.+)$/m, level: 2 },
        // Lettres minuscules: a., b., c., etc.
        { regex: /^([a-z])\.\s+(.+)$/m, level: 3 },
    ];

    // Essayer de détecter des sections numérotées
    const sectionRegex = /(\d+)\.\s*([^:\n]+)(?::\s*|\n)([\s\S]*?)(?=\d+\.\s*[^:\n]+(?::\s*|\n)|$)/g;
    let match;
    let sectionNum = 1;
    let foundSections = false;

    while ((match = sectionRegex.exec(cleanText)) !== null) {
        const sectionTitle = match[2].trim();
        const sectionContent = match[3].trim();

        if (sectionTitle && sectionContent) {
            result[`${match[1]}. ${sectionTitle}`] = sectionContent;
            foundSections = true;
        }
    }

    // Si aucune section trouvée, essayer les en-têtes FRAP
    if (!foundSections) {
        const frapHeaders = ['Destinataire', 'Objet', 'Titre', 'Libellé', 'Observation', 'Cause', 'Risque', 'Recommandation', 'Conséquence', 'Contenu'];

        for (const header of frapHeaders) {
            const headerRegex = new RegExp(header + '\\s*[:\\n]\\s*([\\s\\S]*?)(?=' + frapHeaders.map(h => h + '\\s*[:\\n]').join('|') + '|$)', 'i');
            const headerMatch = cleanText.match(headerRegex);

            if (headerMatch && headerMatch[1].trim()) {
                result[`${sectionNum}. ${header}`] = headerMatch[1].trim();
                sectionNum++;
                foundSections = true;
            }
        }
    }

    // Fallback: tout le texte comme contenu
    if (!foundSections && cleanText) {
        // Diviser en paragraphes
        const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim());

        if (paragraphs.length > 1) {
            paragraphs.forEach((para, idx) => {
                result[`paragraphe_${idx + 1}`] = para.trim();
            });
        } else {
            result['paragraphe_1'] = cleanText.substring(0, 5000); // Limiter la taille
        }
    }

    return result;
}

// ============================================================================
// RETOUR DU RESULTAT
// ============================================================================

console.log('📦 Résultat final:', JSON.stringify(result, null, 2).substring(0, 500) + '...');

return [{ json: { data: result } }];
