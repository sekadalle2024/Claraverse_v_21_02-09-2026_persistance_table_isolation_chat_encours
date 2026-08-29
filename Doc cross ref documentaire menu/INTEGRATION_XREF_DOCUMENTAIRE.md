# Intégration X-Ref Documentaire - Menu Contextuel

## Vue d'ensemble

Cette documentation décrit l'implémentation complète de la fonctionnalité "Importer X-Ref documentaire" dans le menu contextuel de Claraverse.

## Architecture

### 1. Menu Contextuel (menu.js)

La section "Papier de travail" contient 3 actions:

```javascript
{
  id: "papier-travail", 
  title: "Papier de travail", 
  icon: "📁",
  items: [
    { 
      text: "📤 Importer X-Ref documentaire", 
      action: () => this.importerXRefDocumentaire(), 
      shortcut: "Ctrl+Shift+X" 
    },
    { 
      text: "📋 Afficher X-Ref documentaire", 
      action: () => this.afficherXRefDocumentaire() 
    },
    { 
      text: "🔍 Rechercher document", 
      action: () => this.rechercherDocument() 
    }
  ]
}
```

### 2. Méthodes Implémentées

#### 2.1 importerXRefDocumentaire()

Ouvre le formulaire n8n dans une nouvelle fenêtre pour uploader des documents.

**Fonctionnement:**
1. Ouvre l'URL du formulaire n8n
2. L'utilisateur remplit les champs:
   - Client
   - Exercice
   - Cycle comptable
   - Cross référence
   - Document
   - Fichier(s) à uploader
3. Le workflow n8n traite l'upload et stocke dans Google Drive

**Code:**
```javascript
importerXRefDocumentaire() {
  const formUrl = 'https://hkj0631c.rpcl.app/form/20bcf9fd-b7bb-49de-9707-590a794c4763';
  
  const width = 800;
  const height = 700;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  
  const formWindow = window.open(
    formUrl,
    'XRefDocumentaire',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
  
  if (formWindow) {
    this.showQuickNotification("📤 Formulaire X-Ref ouvert");
  } else {
    this.showAlert("❌ Impossible d'ouvrir le formulaire. Vérifiez les popups.");
  }
}
```

#### 2.2 afficherXRefDocumentaire()

Détecte et affiche la table des cross-références dans une barre latérale.

**Fonctionnement:**
1. Recherche la table contenant les colonnes "Cross references" et "Document"
2. Extrait les données
3. Affiche dans une barre latérale droite
4. Permet la fermeture

**Code:**
```javascript
afficherXRefDocumentaire() {
  const chatContainer = document.querySelector('div[class*="prose"]') || document.body;
  const tables = Array.from(chatContainer.querySelectorAll('table'));
  
  let xrefTable = null;
  
  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll('th, thead td'))
      .map(th => th.textContent.trim().toLowerCase());
    
    const hasCrossRef = headers.some(h => 
      h.includes('cross') && h.includes('ref')
    );
    const hasDocument = headers.some(h => h.includes('document'));
    
    if (hasCrossRef && hasDocument) {
      xrefTable = table;
      break;
    }
  }
  
  if (!xrefTable) {
    this.showAlert("⚠️ Aucune table X-Ref documentaire trouvée");
    return;
  }
  
  const data = this.extractTableDataOptimized(xrefTable);
  this.displayXRefSidebar(data);
}
```

#### 2.3 rechercherDocument()

Permet de rechercher un document par son index ou nom.

**Fonctionnement:**
1. Demande le terme de recherche
2. Recherche dans la table X-Ref
3. Affiche les résultats dans la barre latérale

**Code:**
```javascript
rechercherDocument() {
  const searchTerm = prompt("🔍 Rechercher un document (index ou nom):");
  
  if (!searchTerm || searchTerm.trim() === '') {
    return;
  }
  
  const chatContainer = document.querySelector('div[class*="prose"]') || document.body;
  const tables = Array.from(chatContainer.querySelectorAll('table'));
  
  let xrefTable = null;
  
  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll('th, thead td'))
      .map(th => th.textContent.trim().toLowerCase());
    
    const hasCrossRef = headers.some(h => 
      h.includes('cross') && h.includes('ref')
    );
    const hasDocument = headers.some(h => h.includes('document'));
    
    if (hasCrossRef && hasDocument) {
      xrefTable = table;
      break;
    }
  }
  
  if (!xrefTable) {
    this.showAlert("⚠️ Aucune table X-Ref documentaire trouvée");
    return;
  }
  
  const data = this.extractTableDataOptimized(xrefTable);
  const results = this.searchInXRefData(data, searchTerm);
  
  if (results.length === 0) {
    this.showAlert(`⚠️ Aucun document trouvé pour "${searchTerm}"`);
    return;
  }
  
  this.displayXRefSidebar(results, `Résultats pour "${searchTerm}"`);
}
```

#### 2.4 Méthodes Auxiliaires

**displayXRefSidebar(data, title)**

Affiche les données X-Ref dans une barre latérale droite.

```javascript
displayXRefSidebar(data, title = "Cross-Références Documentaires") {
  let sidebar = document.getElementById('xref-sidebar');
  
  if (sidebar) {
    sidebar.remove();
  }
  
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
    font-family: 'Segoe UI', sans-serif;
  `;
  
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
  `;
  closeBtn.onclick = () => sidebar.remove();
  
  header.appendChild(titleEl);
  header.appendChild(closeBtn);
  sidebar.appendChild(header);
  
  const content = document.createElement('div');
  
  if (data.length <= 1) {
    content.innerHTML = '<p style="color: #666; font-style: italic;">Aucune donnée disponible</p>';
  } else {
    const headers = data[0];
    const rows = data.slice(1);
    
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
      };
      item.onmouseleave = () => {
        item.style.background = '#f8f9fa';
        item.style.borderLeftColor = '#380101';
      };
      
      let html = '';
      headers.forEach((header, colIndex) => {
        if (row[colIndex]) {
          html += `
            <div style="margin-bottom: 8px;">
              <strong style="color: #380101; font-size: 12px; text-transform: uppercase;">${header}:</strong>
              <div style="color: #333; margin-top: 4px;">${row[colIndex]}</div>
            </div>
          `;
        }
      });
      
      item.innerHTML = html;
      content.appendChild(item);
    });
  }
  
  sidebar.appendChild(content);
  document.body.appendChild(sidebar);
  
  this.showQuickNotification(`📋 ${data.length - 1} document(s) affiché(s)`);
}
```

**searchInXRefData(data, searchTerm)**

Recherche dans les données X-Ref.

```javascript
searchInXRefData(data, searchTerm) {
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  const term = searchTerm.toLowerCase().trim();
  
  const results = [headers];
  
  rows.forEach(row => {
    const match = row.some(cell => 
      cell && cell.toLowerCase().includes(term)
    );
    
    if (match) {
      results.push(row);
    }
  });
  
  return results;
}
```

## Workflow n8n

### Configuration du Formulaire

**URL:** https://hkj0631c.rpcl.app/form/20bcf9fd-b7bb-49de-9707-590a794c4763

**Champs:**
1. **Client** (texte, requis)
2. **Exercice** (texte, requis)
3. **Cycle comptable** (dropdown, requis)
   - Capitaux propres
   - Charge d'exploitation
   - Client
   - Fournisseur
   - Immobilisations
   - Impôt et taxes
   - Personnel
   - Stock
   - Trésorerie
   - Ventes
4. **Cross référence** (texte, requis)
5. **Document** (texte, requis)
6. **Files** (upload, requis)
   - Formats acceptés: .xlsx, .xls, .pdf, .doc, .docx

### Logique du Workflow

1. **Réception du formulaire**
2. **Vérification dossier client**
   - Nom: `[Client]-[Exercice]`
   - Exemple: `Orange-2025`
3. **Création structure si nécessaire**
   - Dossier client dans "Dossier CAC"
   - Sous-dossiers pour chaque cycle comptable
4. **Upload du fichier**
   - Nom: `[Cross Reference]-[Document]`
   - Exemple: `[I20]-Proces verbal inventaire de caisse`
   - Emplacement: `Dossier CAC/[Client]-[Exercice]/[Cycle]/`

## Structure Google Drive

```
Dossier CAC/
├── Orange-2025/
│   ├── Capitaux propres/
│   ├── Charge d'exploitation/
│   ├── Client/
│   ├── Fournisseur/
│   ├── Immobilisations/
│   ├── Impôt et taxes/
│   ├── Personnel/
│   ├── Stock/
│   ├── Trésorerie/
│   │   └── [I1]-Lead sheet trésorerie.xlsx
│   │   └── [I20]-Proces verbal inventaire de caisse.pdf
│   └── Ventes/
└── Filtectci-2025/
    └── ...
```

## Format de la Table X-Ref

### Structure

| No | Cross references | Document |
|----|------------------|----------|
| 1  | [I1]             | Lead sheet trésorerie |
| 2  | [I20]            | Proces verbal inventaire de caisse |
| 3  | [I150]           | Balances generle |

### Détection

La table est détectée si elle contient:
- Une colonne avec "cross" ET "ref" (insensible à la casse)
- Une colonne avec "document"

### Position

La table X-Ref doit être placée en dessous du tableau principal de test (celui avec les colonnes Assertion, Écart, CTR 1, CTR 2, Description, Conclusion, etc.).

## Cas d'Usage

### 1. Importer un document de test

1. Cliquer sur "📤 Importer X-Ref documentaire" dans le menu contextuel
2. Remplir le formulaire:
   - Client: Orange
   - Exercice: 2025
   - Cycle: Trésorerie
   - Cross référence: I20
   - Document: Proces verbal inventaire de caisse
   - Fichier: PV_inventaire_caisse_2025.pdf
3. Soumettre
4. Le fichier est uploadé dans: `Dossier CAC/Orange-2025/Trésorerie/[I20]-Proces verbal inventaire de caisse.pdf`

### 2. Afficher les documents référencés

1. Créer une table X-Ref dans le chat
2. Cliquer sur "📋 Afficher X-Ref documentaire"
3. La barre latérale s'ouvre avec la liste des documents

### 3. Rechercher un document

1. Cliquer sur "🔍 Rechercher document"
2. Entrer "I20" ou "inventaire"
3. Les résultats s'affichent dans la barre latérale

## Tests

### Test 1: Ouverture du formulaire

```javascript
// Dans la console du navigateur
window.contextualMenuManager = new ContextualMenuManager();
window.contextualMenuManager.init();
window.contextualMenuManager.importerXRefDocumentaire();
```

**Résultat attendu:** Une nouvelle fenêtre s'ouvre avec le formulaire n8n

### Test 2: Affichage de la table X-Ref

1. Créer une table dans le chat:
```markdown
| No | Cross references | Document |
|----|------------------|----------|
| 1  | [I1]             | Lead sheet trésorerie |
| 2  | [I20]            | PV inventaire caisse |
```

2. Exécuter:
```javascript
window.contextualMenuManager.afficherXRefDocumentaire();
```

**Résultat attendu:** Barre latérale avec les 2 documents

### Test 3: Recherche

```javascript
window.contextualMenuManager.rechercherDocument();
// Entrer "I20" dans le prompt
```

**Résultat attendu:** Barre latérale avec le document I20

## Améliorations Futures

1. **Prévisualisation des documents**
   - Intégrer Google Drive Viewer
   - Afficher le PDF/Excel dans la barre latérale

2. **Synchronisation bidirectionnelle**
   - Récupérer la liste des documents depuis Google Drive
   - Mettre à jour automatiquement la table X-Ref

3. **Gestion des versions**
   - Historique des uploads
   - Comparaison de versions

4. **Recherche avancée**
   - Filtres par cycle
   - Filtres par date
   - Recherche full-text dans les documents

5. **Export de la table X-Ref**
   - Export Excel
   - Export PDF avec liens vers Google Drive

## Dépannage

### Problème: Le formulaire ne s'ouvre pas

**Solution:**
- Vérifier que les popups ne sont pas bloquées
- Vérifier l'URL du formulaire n8n
- Tester l'URL directement dans le navigateur

### Problème: La table X-Ref n'est pas détectée

**Solution:**
- Vérifier que la table contient les colonnes "Cross references" et "Document"
- Vérifier l'orthographe des en-têtes
- Vérifier que la table est dans le conteneur de chat

### Problème: La recherche ne trouve rien

**Solution:**
- Vérifier que la table X-Ref existe
- Vérifier l'orthographe du terme de recherche
- Essayer une recherche partielle

## Conclusion

L'intégration X-Ref documentaire est maintenant complète et fonctionnelle. Elle permet de:
- Uploader des documents de test dans Google Drive
- Afficher les références documentaires
- Rechercher des documents
- Maintenir une indexation structurée

Cette fonctionnalité améliore significativement la gestion des papiers de travail dans Claraverse.
