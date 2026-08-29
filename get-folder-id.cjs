// Script pour lister les fichiers d'un dossier Google Drive par son ID
// et mettre à jour le fichier de configuration pour le menu accordéon
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '[VOTRE_GOOGLE_CLIENT_ID]';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '[VOTRE_GOOGLE_CLIENT_SECRET]';
const REDIRECT_URI = 'http://localhost:3333/callback';

// ID du dossier "template rapport" - METS TON ID ICI
const FOLDER_ID = '13YcsgS1BqRKjGeuSK9RxoAK8vdD3ErBd';

function openBrowser(url) {
    const cmd = process.platform === 'win32' ? 'start' :
        process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${cmd} "${url}"`);
}

function getAuthUrl() {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.readonly');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
}

function exchangeCodeForToken(code) {
    return new Promise((resolve, reject) => {
        const postData = `code=${code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&grant_type=authorization_code`;
        const options = {
            hostname: 'oauth2.googleapis.com',
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Liste TOUS les fichiers dans un dossier par son ID
function listFilesInFolder(accessToken, folderId, pageToken = null) {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
        let apiPath = `/drive/v3/files?q=${query}&fields=nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink)&pageSize=100&orderBy=name`;
        if (pageToken) {
            apiPath += `&pageToken=${pageToken}`;
        }

        const options = {
            hostname: 'www.googleapis.com',
            path: apiPath,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Erreur parsing JSON: ' + data));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

// Récupère tous les fichiers (gère la pagination)
async function getAllFilesInFolder(accessToken, folderId) {
    let allFiles = [];
    let pageToken = null;

    do {
        const result = await listFilesInFolder(accessToken, folderId, pageToken);
        if (result.error) {
            throw new Error(result.error.message);
        }
        if (result.files) {
            allFiles = allFiles.concat(result.files);
        }
        pageToken = result.nextPageToken;
    } while (pageToken);

    return allFiles;
}

// Sauvegarde dans le fichier JSON de configuration
function saveToConfigFile(folderId, files) {
    const configPath = path.join(__dirname, 'ressource', 'gestion-dossier-files.json');

    const config = {
        folderId: folderId,
        lastUpdated: new Date().toISOString(),
        files: files.map(f => ({
            id: f.id,
            name: f.name,
            mimeType: f.mimeType,
            modifiedTime: f.modifiedTime,
            webViewLink: f.webViewLink || null
        }))
    };

    // Créer le dossier ressource s'il n'existe pas
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`\n✅ Configuration sauvegardée dans: ${configPath}`);
    return configPath;
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/callback' && parsedUrl.query.code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

        try {
            console.log('\n📝 Échange du code contre un token...');
            const tokenData = await exchangeCodeForToken(parsedUrl.query.code);

            if (tokenData.error) {
                res.end(`<h2 style="color:red">Erreur: ${tokenData.error_description || tokenData.error}</h2>`);
                server.close();
                return;
            }

            console.log('✅ Token obtenu!');
            console.log(`\n📂 Récupération des fichiers du dossier ID: ${FOLDER_ID}...`);

            const files = await getAllFilesInFolder(tokenData.access_token, FOLDER_ID);

            console.log('\n' + '═'.repeat(80));
            console.log(`📁 DOSSIER ID: ${FOLDER_ID}`);
            console.log('═'.repeat(80));

            if (files && files.length > 0) {
                console.log(`\n📄 ${files.length} fichier(s) trouvé(s):\n`);

                files.forEach((file, i) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    const isDoc = file.mimeType === 'application/vnd.google-apps.document';
                    const icon = isFolder ? '📁' : (isDoc ? '📄' : '📎');
                    console.log(`${(i + 1).toString().padStart(2)}. ${icon} ${file.name}`);
                    console.log(`    ID: ${file.id}`);
                    console.log(`    Type: ${file.mimeType.replace('application/vnd.google-apps.', 'Google ')}`);
                    console.log('');
                });

                // Sauvegarder dans le fichier de config
                const configPath = saveToConfigFile(FOLDER_ID, files);

                // HTML response
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Fichiers Google Drive</title>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; background: #1a1a2e; color: #fff; }
                            h2 { color: #4285f4; }
                            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                            th, td { border: 1px solid #333; padding: 12px; text-align: left; }
                            th { background: #4285f4; color: white; }
                            tr:nth-child(even) { background: rgba(255,255,255,0.05); }
                            tr:hover { background: rgba(66,133,244,0.2); }
                            .doc { color: #4285f4; }
                            .folder { color: #f4b400; }
                            code { background: #333; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
                            .success { background: rgba(52,168,83,0.2); border: 1px solid #34a853; padding: 15px; border-radius: 8px; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <h2>📁 Fichiers du dossier Google Drive</h2>
                        <p>ID du dossier: <code>${FOLDER_ID}</code></p>
                        
                        <div class="success">
                            ✅ <strong>${files.length} fichier(s)</strong> trouvé(s) et sauvegardés dans <code>ressource/gestion-dossier-files.json</code>
                        </div>
                        
                        <table>
                            <tr><th>#</th><th>Nom</th><th>ID du fichier</th><th>Type</th></tr>
                            ${files.map((f, i) => {
                    const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
                    const isDoc = f.mimeType === 'application/vnd.google-apps.document';
                    const icon = isFolder ? '📁' : (isDoc ? '📄' : '📎');
                    const cls = isFolder ? 'folder' : 'doc';
                    const typeName = f.mimeType.replace('application/vnd.google-apps.', '').replace('application/', '');
                    return `<tr>
                                    <td>${i + 1}</td>
                                    <td class="${cls}">${icon} ${f.name}</td>
                                    <td><code>${f.id}</code></td>
                                    <td>${typeName}</td>
                                </tr>`;
                }).join('')}
                        </table>
                        
                        <p style="margin-top: 30px; color: #888;">
                            Le fichier de configuration a été mis à jour. Vous pouvez fermer cette fenêtre.
                        </p>
                    </body>
                    </html>
                `);
            } else {
                console.log('\n⚠️ Le dossier est vide ou inaccessible.');
                res.end(`<h2>📁 Dossier ID: ${FOLDER_ID}</h2><p style="color:orange;">Le dossier est vide ou vous n'avez pas accès.</p>`);
            }

            console.log('\n' + '═'.repeat(80));

        } catch (error) {
            console.error('❌ Erreur:', error);
            res.end(`<h2 style="color:red">Erreur: ${error.message}</h2><pre>${error.stack}</pre>`);
        }

        server.close();
    }
});

server.listen(3333, () => {
    const authUrl = getAuthUrl();
    console.log('\n' + '═'.repeat(60));
    console.log('🔐 LISTE DES FICHIERS GOOGLE DRIVE');
    console.log('═'.repeat(60));
    console.log(`\n📁 Dossier ID: ${FOLDER_ID}`);
    console.log('\n📌 Ouverture automatique du navigateur...\n');

    openBrowser(authUrl);

    console.log('Si le navigateur ne s\'ouvre pas, copie cette URL:\n');
    console.log(authUrl);
    console.log('\nEn attente de l\'authentification...\n');
});
