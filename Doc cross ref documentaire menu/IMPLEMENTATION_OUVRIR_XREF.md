# Implémentation "Ouvrir X-Ref documentaire"

## Vue d'ensemble

Cette fonctionnalité permet d'ouvrir un document référencé dans la table Cross-Références directement depuis Google Drive dans une barre latérale.

## Architecture

### 1. Détection de la ligne active
- Identifier la cellule/ligne active dans la table X-Ref
- Extraire les valeurs des colonnes "Cross references" et "Document"

### 2. Construction du nom de fichier
Format : `[Cross references]-[Document]`

Exemples :
- `[I1]-Lead sheet trésorerie`
- `[I20]-Proces verbal inventaire de caisse`
- `[I150]-Balances generale`

### 3. Workflow n8n

#### Endpoint
```
POST https://hkj0631c.rpcl.app/webhook/cross_reference
```

#### Payload
```json
{
  "index": "[I150]-Balances generale",
  "dossier": "Dossier CAC"
}
```

#### Réponse attendue
```json
{
  "success": true,
  "file": {
    "id": "1abc...",
    "name": "[I150]-Balances generale.pdf",
    "webViewLink": "https://drive.google.com/file/d/...",
    "thumbnailLink": "https://...",
    "mimeType": "application/pdf"
  }
}
```

### 4. Affichage dans la barre latérale

#### Composant React (optionnel)
- Barre latérale droite
- Viewer de document (PDF, images, Google Docs)
- Bouton de fermeture
- Bouton "Ouvrir dans Google Drive"

#### Version JavaScript (immédiate)
- Barre latérale en HTML/CSS/JS pur
- iframe pour afficher le document
- Intégration dans menu.js

## Implémentation

### Étape 1 : Méthode dans menu.js

```javascript
/**
 * Ouvrir X-Ref documentaire
 * Ouvre le document référencé dans la ligne active depuis Google Drive
 */
async ouvrirXRefDocumentaire() {
  console.log("📂 [X-Ref] Ouverture du document");
  
  // 1. Vérifier qu'une cellule est active
  if (!this.validateActiveCell()) {
    this.showAlert("⚠️ Veuillez sélectionner une ligne dans la table X-Ref");
    return;
  }
  
  // 2. Vérifier que c'est bien une table X-Ref
  const table = this.targetTable;
  const headers = Array.from(table.querySelectorAll('th, thead td'))
    .map(th => th.textContent.trim().toLowerCase());
  
  const hasCrossRef = headers.some(h => 
    (h.includes('cross') && h.includes('ref')) || 
    h.includes('x-ref') || h.includes('xref')
  );
  
  const hasDocument = headers.some(h => 
    h.includes('document') || h.includes('doc')
  );
  
  if (!hasCrossRef || !hasDocument) {
    this.showAlert("⚠️ Cette table n'est pas une table X-Ref documentaire");
    return;
  }
  
  // 3. Extraire les données de la ligne active
  const rowIndex = this.activeCellPosition.row;
  const rows = Array.from(table.querySelectorAll('tr'));
  const activeRow = rows[rowIndex];
  
  if (!activeRow) {
    this.showAlert("⚠️ Impossible de lire la ligne active");
    return;
  }
  
  // 4. Trouver les index des colonnes
  const headerCells = Array.from(rows[0].querySelectorAll('th, td'));
  let crossRefIndex = -1;
  let documentIndex = -1;
  
  headerCells.forEach((cell, index) => {
    const text = cell.textContent.trim().toLowerCase();
    if ((text.includes('cross') && text.includes('ref')) || 
        text.includes('x-ref') || text.includes('xref')) {
      crossRefIndex = index;
    }
    if (text.includes('document') || text === 'doc') {
      documentIndex = index;
    }
  });
  
  if (crossRefIndex === -1 || documentIndex === -1) {
    this.showAlert("⚠️ Colonnes 'Cross references' et 'Document' non trouvées");
    return;
  }
  
  // 5. Extraire les valeurs
  const cells = Array.from(activeRow.querySelectorAll('td, th'));
  const crossRef = cells[crossRefIndex]?.textContent.trim() || '';
  const document = cells[documentIndex]?.textContent.trim() || '';
  
  if (!crossRef || !document) {
    this.showAlert("⚠️ Données manquantes dans la ligne sélectionnée");
    return;
  }
  
  // 6. Construire le nom du fichier
  const fileName = `${crossRef}-${document}`;
  console.log(`📄 [X-Ref] Recherche du fichier: ${fileName}`);
  
  this.showQuickNotification(`🔍 Recherche de "${fileName}"...`);
  
  // 7. Appeler le workflow n8n
  try {
    const response = await fetch('https://hkj0631c.rpcl.app/webhook/cross_reference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        index: fileName,
        dossier: 'Dossier CAC'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("📦 [X-Ref] Réponse n8n:", result);
    
    if (result.success && result.file) {
      // 8. Afficher le document dans la barre latérale
      this.displayDocumentSidebar(result.file, fileName);
      this.showQuickNotification(`✅ Document "${fileName}" ouvert`);
    } else {
      this.showAlert(`⚠️ Document "${fileName}" non trouvé dans Google Drive`);
    }
    
  } catch (error) {
    console.error("❌ [X-Ref] Erreur:", error);
    this.showAlert(`❌ Erreur lors de la recherche du document:\n${error.message}`);
  }
}

/**
 * Afficher le document dans une barre latérale
 * @param {Object} file - Informations du fichier Google Drive
 * @param {string} fileName - Nom du fichier
 */
displayDocumentSidebar(file, fileName) {
  console.log("📄 [X-Ref] Affichage du document:", file);
  
  // Supprimer la barre latérale existante
  let sidebar = document.getElementById('xref-document-viewer');
  if (sidebar) {
    sidebar.remove();
  }
  
  // Créer la barre latérale
  sidebar = document.createElement('div');
  sidebar.id = 'xref-document-viewer';
  sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: 600px;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    z-index: 20000;
    display: flex;
    flex-direction: column;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    animation: slideInRight 0.3s ease-out;
  `;
  
  // En-tête
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #380101;
    color: white;
    border-bottom: 2px solid #2A0101;
  `;
  
  const titleEl = document.createElement('h3');
  titleEl.textContent = fileName;
  titleEl.style.cssText = `
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 32px;
    color: white;
    cursor: pointer;
    padding: 0;
    margin-left: 15px;
    line-height: 1;
    transition: transform 0.2s;
  `;
  closeBtn.onmouseenter = () => { closeBtn.style.transform = 'rotate(90deg)'; };
  closeBtn.onmouseleave = () => { closeBtn.style.transform = 'rotate(0deg)'; };
  closeBtn.onclick = () => {
    sidebar.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => sidebar.remove(), 300);
  };
  
  header.appendChild(titleEl);
  header.appendChild(closeBtn);
  sidebar.appendChild(header);
  
  // Barre d'actions
  const actions = document.createElement('div');
  actions.style.cssText = `
    display: flex;
    gap: 10px;
    padding: 10px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  `;
  
  const openInDriveBtn = document.createElement('button');
  openInDriveBtn.textContent = '📂 Ouvrir dans Drive';
  openInDriveBtn.style.cssText = `
    padding: 8px 16px;
    background: #380101;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  openInDriveBtn.onmouseenter = () => { openInDriveBtn.style.background = '#2A0101'; };
  openInDriveBtn.onmouseleave = () => { openInDriveBtn.style.background = '#380101'; };
  openInDriveBtn.onclick = () => {
    window.open(file.webViewLink, '_blank');
  };
  
  actions.appendChild(openInDriveBtn);
  sidebar.appendChild(actions);
  
  // Contenu - iframe pour afficher le document
  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
    overflow: hidden;
    background: #f5f5f5;
  `;
  
  // Déterminer l'URL d'affichage selon le type de fichier
  let embedUrl = '';
  
  if (file.mimeType.includes('pdf')) {
    // PDF - utiliser le viewer Google
    embedUrl = `https://drive.google.com/file/d/${file.id}/preview`;
  } else if (file.mimeType.includes('image')) {
    // Image - afficher directement
    const img = document.createElement('img');
    img.src = file.thumbnailLink || file.webViewLink;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
    `;
    content.appendChild(img);
  } else if (file.mimeType.includes('document') || 
             file.mimeType.includes('spreadsheet') || 
             file.mimeType.includes('presentation')) {
    // Google Docs, Sheets, Slides
    embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.webViewLink)}&embedded=true`;
  } else {
    // Autres types - lien de téléchargement
    content.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <p style="color: #666; margin-bottom: 20px;">
          Aperçu non disponible pour ce type de fichier
        </p>
        <p style="color: #333; font-weight: 500; margin-bottom: 20px;">
          ${file.name}
        </p>
        <button onclick="window.open('${file.webViewLink}', '_blank')" style="
          padding: 12px 24px;
          background: #380101;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        ">
          📥 Télécharger le fichier
        </button>
      </div>
    `;
  }
  
  if (embedUrl) {
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    iframe.setAttribute('allow', 'autoplay');
    content.appendChild(iframe);
  }
  
  sidebar.appendChild(content);
  
  // Ajouter au DOM
  document.body.appendChild(sidebar);
  
  console.log("✅ [X-Ref] Document affiché dans la barre latérale");
}
```

### Étape 2 : Ajouter au menu

Dans la méthode `getMenuSections()`, section "papier-travail" :

```javascript
{
  id: "papier-travail", title: "Papier de travail", icon: "📁",
  items: [
    { text: "📤 Importer X-Ref documentaire", action: () => this.importerXRefDocumentaire(), shortcut: "Ctrl+Shift+X" },
    { text: "📂 Ouvrir X-Ref documentaire", action: () => this.ouvrirXRefDocumentaire(), shortcut: "Ctrl+Shift+O" },
    { text: "📋 Afficher X-Ref documentaire", action: () => this.afficherXRefDocumentaire() },
    { text: "🔍 Rechercher document", action: () => this.rechercherDocument() }
  ]
}
```

### Étape 3 : Workflow n8n

Le workflow doit :
1. Recevoir le webhook POST avec `index` et `dossier`
2. Rechercher dans Google Drive le dossier "Dossier CAC"
3. Rechercher le fichier dont le nom contient `index`
4. Retourner les informations du fichier

Structure du workflow :
- Node 1 : Webhook (POST /cross_reference)
- Node 2 : Google Drive - Search Folder
- Node 3 : Google Drive - Search File
- Node 4 : Response avec file info

## Tests

### Test 1 : Ligne active valide
1. Ouvrir une table X-Ref
2. Cliquer sur une ligne avec données
3. Menu contextuel > Papier de travail > Ouvrir X-Ref documentaire
4. Vérifier que le document s'affiche

### Test 2 : Document non trouvé
1. Sélectionner une ligne avec un index inexistant
2. Vérifier le message d'erreur approprié

### Test 3 : Table non X-Ref
1. Sélectionner une table normale
2. Vérifier le message d'avertissement

## Améliorations futures

1. **Cache des documents** : Mémoriser les documents déjà ouverts
2. **Historique** : Liste des derniers documents consultés
3. **Annotations** : Permettre d'annoter les documents
4. **Téléchargement** : Bouton de téléchargement direct
5. **Partage** : Générer un lien de partage
6. **Composant React** : Version React pour meilleure intégration

## Dépendances

- menu.js (existant)
- Workflow n8n (à créer)
- Google Drive API (configuré dans n8n)
- Accès au dossier "Dossier CAC" dans Google Drive
