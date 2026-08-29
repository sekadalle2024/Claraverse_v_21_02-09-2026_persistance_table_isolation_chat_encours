/**
 * Script Node.js pour télécharger le document Google Drive
 * et le sauvegarder dans ressource/n8n_doc.html
 * 
 * Usage: node download-google-doc.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    docId: '1qaymPK-_nfCYxDO8KVylijXvi11oSpr5zsEEhwTzz5I',
    outputDir: 'ressource',
    outputFile: 'n8n_doc.html'
};

/**
 * Télécharge le document Google Drive en HTML
 */
function downloadGoogleDoc() {
    console.log('📥 Téléchargement du document Google Drive...');
    console.log(`   Document ID: ${CONFIG.docId}`);

    // URL publique d'export Google Docs
    const exportUrl = `https://docs.google.com/document/d/${CONFIG.docId}/export?format=html`;

    https.get(exportUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
            // Suivre la redirection
            https.get(response.headers.location, handleResponse);
        } else {
            handleResponse(response);
        }
    }).on('error', (error) => {
        console.error('❌ Erreur de téléchargement:', error.message);
        process.exit(1);
    });
}

/**
 * Gère la réponse HTTP
 */
function handleResponse(response) {
    if (response.statusCode !== 200) {
        console.error(`❌ Erreur HTTP ${response.statusCode}`);
        process.exit(1);
    }

    let html = '';

    response.on('data', (chunk) => {
        html += chunk;
    });

    response.on('end', () => {
        console.log(`✅ Document téléchargé (${html.length} caractères)`);
        saveDocument(html);
    });
}

/**
 * Sauvegarde le document dans le dossier ressource
 */
function saveDocument(html) {
    // Créer le dossier ressource s'il n'existe pas
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        console.log(`📁 Dossier créé: ${CONFIG.outputDir}/`);
    }

    const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);

    // Nettoyer le HTML (optionnel)
    const cleanHtml = cleanGoogleDocHTML(html);

    // Sauvegarder le fichier
    fs.writeFileSync(outputPath, cleanHtml, 'utf8');

    console.log(`✅ Document sauvegardé: ${outputPath}`);
    console.log(`📄 Taille: ${(cleanHtml.length / 1024).toFixed(2)} KB`);
    console.log('');
    console.log('🎯 Le document sera maintenant chargé automatiquement par le Case 1');
}

/**
 * Nettoie le HTML Google Docs (optionnel)
 */
function cleanGoogleDocHTML(html) {
    // Vous pouvez ajouter des nettoyages ici si nécessaire
    return html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '');
}

// Exécution
console.log('🚀 Téléchargement du document Google Drive pour Case 8 (n8n_doc)');
console.log('');
downloadGoogleDoc();
