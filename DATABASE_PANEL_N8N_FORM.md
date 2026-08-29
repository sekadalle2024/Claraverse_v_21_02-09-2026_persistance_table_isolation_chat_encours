# Database Panel - Documents Pinecone & Import n8n

## Fonctionnalité

L'icône **Database** dans la barre latérale gauche ouvre un panneau coulissant qui permet :
1. **Importer des documents** via le formulaire n8n (nouvel onglet)
2. **Visualiser les documents Pinecone** en TreeView par workspace/namespace

## Utilisation

### Ouvrir le panneau
- Cliquez sur l'icône **Database** (📊) dans la barre latérale gauche
- Le panneau s'ouvre sur la moitié droite de l'écran

### Fermer le panneau
- Cliquez sur la croix (X) en haut à droite
- Appuyez sur la touche **Échap**
- Cliquez sur l'overlay sombre à gauche du panneau

### Importer des documents (n8n)
- Cliquez sur le bouton **"Importer des documents (n8n)"**
- Le formulaire s'ouvre dans un **nouvel onglet** du navigateur
- URL: `https://barow52161.app.n8n.cloud/form/4e1e20d4-f759-42c8-8439-87b93f43aa7c`

### TreeView Pinecone
- Affiche les **index Pinecone** (workspaces)
- Chaque index contient des **namespaces**
- Chaque namespace contient des **documents**
- Cliquez sur ▶ pour déplier/replier
- Bouton **Actualiser** pour recharger les données

## Structure TreeView

```
📁 Workspaces Pinecone
├── 📊 index-name-1
│   ├── 📁 namespace-1 (X vecteurs • Y docs)
│   │   ├── 📄 document-1.pdf
│   │   ├── 📄 document-2.docx
│   │   └── ...
│   └── 📁 namespace-2
└── 📊 index-name-2
    └── ...
```

## Configuration Pinecone

API Key configurée dans `src/components/Sidebar.tsx` :
```
pcsk_4A2wpr_53YKxJUmh8tyNJAUieppoHEjru44oKksiTXycjRsv6UNFM512Y3pMvLCWYUAczd
```

## Icônes actives/inactives

### Icônes actives
- ✅ Chat
- ✅ Dossier
- ✅ Database

### Icônes inactives (désactivées)
- ❌ Dashboard
- ❌ Agents
- ❌ Notebooks
- ❌ LumaUI (Beta)
- ❌ Image Gen
- ❌ Settings
- ❌ Help

## Technique

### Composant React
- `DatabasePanel` dans `src/components/Sidebar.tsx`
- Utilise `createPortal` pour s'afficher au-dessus de tout (z-index: 99999)
- Appels API Pinecone directs pour lister les index, namespaces et documents

### API Pinecone utilisées
1. `GET https://api.pinecone.io/indexes` - Liste des index
2. `POST https://{host}/describe_index_stats` - Stats et namespaces
3. `POST https://{host}/query` - Récupération des documents

## Test

1. Ouvrir l'application E-audit
2. Cliquer sur l'icône Database dans la sidebar
3. Vérifier que le panneau s'ouvre avec le TreeView Pinecone
4. Cliquer sur un index pour voir les namespaces
5. Cliquer sur un namespace pour voir les documents
6. Cliquer sur "Importer des documents (n8n)" pour ouvrir le formulaire
