// ═══════════════════════════════════════════════════════════════════════════════
// CODE À AJOUTER DANS public/menu.js
// Section: PAPIER DE TRAVAIL - X-REF DOCUMENTAIRE
// Position: Avant la méthode cleanup()
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECTION: PAPIER DE TRAVAIL - X-REF DOCUMENTAIRE
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Importer X-Ref documentaire
 * Ouvre le formulaire n8n pour uploader des documents dans Google Drive
 */
importerXRefDocumentaire() {
  console.log("📤 [X-Ref] Ouverture du formulaire n8n");
  
  // URL du formulaire n8n
  const formUrl = 'https://hkj0631c.rpcl.app/form/20bcf9fd-b7bb-49de-9707-590a794c4763';
  
  // Dimensions de la fenêtre popup
  const width = 800;
  const height = 700;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  
  // Ouvrir le formulaire dans une nouvelle fenêtre
  const formWindow = window.open(
    formUrl,
    'XRefDocumentaire',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
  );
  
  if (formWindow) {
    this.showQuickNotification("📤 Formulaire X-Ref ouvert");
    console.log("✅ [X-Ref] Formulaire ouvert avec succès");
  } else {
    this.showAlert("❌ Impossible d'ouvrir le formulaire. Vérifiez que les popups ne sont pas bloquées.");
    console.error("❌ [X-Ref] Échec ouverture formulaire - popups bloquées?");
  }
}

/**
 * Afficher X-Ref documentaire
 * Détecte et affiche la table des cross-références dans une barre latérale
 */
afficherXRefDocumentaire() {
  console.log("📋 [X-Ref] Recherche de la table X-Ref");
  
  // Rechercher la table X-Ref dans le chat
  const chatContainer = document.querySelector('div[class*="prose"]') || document.body;
  const tables = Array.from(chatContainer.querySelectorAll('table'));
  
  let xrefTable = null;
  
  // Parcourir les tables pour trouver celle avec les colonnes Cross references et Document
  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll('th, thead td'))
      .map(th => th.textContent.trim().toLowerCase());
    
    // Vérifier la présence des colonnes clés
    const hasCrossRef = headers.some(h => 
      (h.includes('cross') && h.includes('ref')) || 
      h.includes('cross-ref') ||
      h.includes('crossref') ||
      h.includes('x-ref') ||
      h.includes('xref')
    );
    
    const hasDocument = headers.some(h => 
      h.includes('document') || 
      h.includes('doc')
    );
    
    if (hasCrossRef && hasDocument) {
      xrefTable = table;
      console.log("✅ [X-Ref] Table trouvée:", table);
      break;
    }
  }
  
  if (!xrefTable) {
    this.showAlert("⚠️ Aucune table X-Ref documentaire trouvée.\n\nLa table doit contenir les colonnes:\n- Cross references (ou X-Ref)\n- Document");
    console.warn("⚠️ [X-Ref] Aucune table trouvée");
    return;
  }
  
  // Extraire les données de la table
  const data = this.extractTableDataOptimized(xrefTable);
  console.log("📊 [X-Ref] Données extraites:", data);
  
  // Afficher dans la barre latérale
  this.displayXRefSidebar(data);
}

/**
 * Rechercher document
 * Permet de rechercher un document par son index ou nom
 */
rechercherDocument() {
  console.log("🔍 [X-Ref] Recherche de document");
  
  // Demander le terme de recherche
  const searchTerm = prompt("🔍 Rechercher un document (index ou nom):\n\nExemples:\n- I20\n- inventaire\n- Lead sheet");
  
  if (!searchTerm || searchTerm.trim() === '') {
    console.log("⚠️ [X-Ref] Recherche annulée");
    return;
  }
  
  console.log(`🔍 [X-Ref] Recherche: "${searchTerm}"`);
  
  // Rechercher la table X-Ref
  const chatContainer = document.querySelector('div[class*="prose"]') || document.body;
  const tables = Array.from(chatContainer.querySelectorAll('table'));
  
  let xrefTable = null;
  
  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll('th, thead td'))
      .map(th => th.textContent.trim().toLowerCase());
    
    const hasCrossRef = headers.some(h => 
      (h.includes('cross') && h.includes('ref')) || 
      h.includes('cross-ref') ||
      h.includes('crossref') ||
      h.includes('x-ref') ||
      h.includes('xref')
    );
    
    const hasDocument = headers.some(h => 
      h.includes('document') || 
      h.includes('doc')
    );
    
    if (hasCrossRef && hasDocument) {
      xrefTable = table;
      break;
    }
  }
  
  if (!xrefTable) {
    this.showAlert("⚠️ Aucune table X-Ref documentaire trouvée.\n\nLa table doit contenir les colonnes:\n- Cross references (ou X-Ref)\n- Document");
    console.warn("⚠️ [X-Ref] Aucune table trouvée pour la recherche");
    return;
  }
  
  // Extraire et rechercher dans les données
  const data = this.extractTableDataOptimized(xrefTable);
  const results = this.searchInXRefData(data, searchTerm);
  
  console.log(`📊 [X-Ref] ${results.length - 1} résultat(s) trouvé(s)`);
  
  if (results.length <= 1) {
    this.showAlert(`⚠️ Aucun document trouvé pour "${searchTerm}"`);
    return;
  }
  
  // Afficher les résultats dans la barre latérale
  this.displayXRefSidebar(results, `Résultats pour "${searchTerm}"`);
}

/**
 * Afficher la barre latérale X-Ref
 * @param {Array<Array<string>>} data - Données de la table (headers + rows)
 * @param {string} title - Titre de la barre latérale
 */
displayXRefSidebar(data, title = "Cross-Références Documentaires") {
  console.log("📋 [X-Ref] Affichage de la barre latérale");
  
  // Supprimer la barre latérale existante si présente
  let sidebar = document.getElementById('xref-sidebar');
  if (sidebar) {
    sidebar.remove();
  }
  
  // Créer la barre latérale
  sidebar = document.createElement('div');
  sidebar.id = 'xref-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    z-index: 20000;
    overflow-y: auto;
    padding: 20px;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    animation: slideInRight 0.3s ease-out;
  `;
  
  // Ajouter l'animation CSS
  if (!document.getElementById('xref-sidebar-styles')) {
    const style = document.createElement('style');
    style.id = 'xref-sidebar-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      #xref-sidebar::-webkit-scrollbar {
        width: 8px;
      }
      
      #xref-sidebar::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      #xref-sidebar::-webkit-scrollbar-thumb {
        background: #380101;
        border-radius: 4px;
      }
      
      #xref-sidebar::-webkit-scrollbar-thumb:hover {
        background: #2A0101;
      }
    `;
    document.head.appendChild(style);
  }
  
  // En-tête de la barre latérale
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #380101;
  `;
  
  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  titleEl.style.cssText = `
    margin: 0;
    color: #380101;
    font-size: 18px;
    font-weight: 600;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 32px;
    color: #380101;
    cursor: pointer;
    padding: 0;
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
  
  // Contenu de la barre latérale
  const content = document.createElement('div');
  
  if (data.length <= 1) {
    content.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; margin-top: 40px;">Aucune donnée disponible</p>';
  } else {
    const headers = data[0];
    const rows = data.slice(1);
    
    // Afficher le nombre de documents
    const countEl = document.createElement('div');
    countEl.textContent = `${rows.length} document(s)`;
    countEl.style.cssText = `
      color: #666;
      font-size: 14px;
      margin-bottom: 15px;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 4px;
      text-align: center;
    `;
    content.appendChild(countEl);
    
    // Afficher chaque document
    rows.forEach((row, index) => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 15px;
        margin-bottom: 12px;
        background: #f8f9fa;
        border-left: 4px solid #380101;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      
      item.onmouseenter = () => {
        item.style.background = '#e8f5e9';
        item.style.borderLeftColor = '#28a745';
        item.style.transform = 'translateX(-5px)';
      };
      item.onmouseleave = () => {
        item.style.background = '#f8f9fa';
        item.style.borderLeftColor = '#380101';
        item.style.transform = 'translateX(0)';
      };
      
      // Construire le contenu de l'item
      let html = '';
      headers.forEach((header, colIndex) => {
        if (row[colIndex]) {
          html += `
            <div style="margin-bottom: 8px;">
              <strong style="color: #380101; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${header}:</strong>
              <div style="color: #333; margin-top: 4px; font-size: 14px;">${row[colIndex]}</div>
            </div>
          `;
        }
      });
      
      item.innerHTML = html;
      
      // Action au clic (optionnel - peut ouvrir le document dans Google Drive)
      item.onclick = () => {
        console.log("📄 [X-Ref] Document cliqué:", row);
        this.showQuickNotification(`📄 Document: ${row[1] || row[0]}`);
        // TODO: Implémenter l'ouverture du document dans Google Drive
      };
      
      content.appendChild(item);
    });
  }
  
  sidebar.appendChild(content);
  
  // Ajouter l'animation de sortie
  const styleOut = document.createElement('style');
  styleOut.textContent = `
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleOut);
  
  // Ajouter au DOM
  document.body.appendChild(sidebar);
  
  this.showQuickNotification(`📋 ${data.length - 1} document(s) affiché(s)`);
  console.log("✅ [X-Ref] Barre latérale affichée");
}

/**
 * Rechercher dans les données X-Ref
 * @param {Array<Array<string>>} data - Données de la table
 * @param {string} searchTerm - Terme de recherche
 * @returns {Array<Array<string>>} - Résultats (headers + rows filtrées)
 */
searchInXRefData(data, searchTerm) {
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  const term = searchTerm.toLowerCase().trim();
  
  const results = [headers];
  
  rows.forEach(row => {
    // Rechercher dans toutes les cellules de la ligne
    const match = row.some(cell => 
      cell && cell.toLowerCase().includes(term)
    );
    
    if (match) {
      results.push(row);
    }
  });
  
  console.log(`🔍 [X-Ref] Recherche "${term}": ${results.length - 1} résultat(s)`);
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIN DE LA SECTION X-REF DOCUMENTAIRE
// ═══════════════════════════════════════════════════════════════════════════════
