# Icône Database Ajoutée - E-audit

## Résumé des modifications

### Fichiers modifiés
- `src/components/Sidebar.tsx` - Ajout de l'icône Database et du panneau coulissant
- `public/design_chat.js` - Correction pour ne pas masquer les icônes de la sidebar
- `public/fix-sidebar-icons.js` - Nouveau script pour forcer l'affichage des icônes
- `index.html` - Ajout du script fix-sidebar-icons.js

### Nouvelles fonctionnalités

#### 1. Icône Database dans la barre latérale
- Position : après l'icône Dossier
- État : **active** (non désactivée)
- Icône : `Database` de lucide-react

#### 2. Panneau coulissant Database
Quand on clique sur l'icône Database :
- Un panneau coulissant s'ouvre sur la **moitié droite** de l'écran
- Le panneau est **au-dessus de tous les autres éléments** (z-index: 10002)
- Un overlay sombre permet de fermer le panneau en cliquant à l'extérieur

#### 3. Contenu du panneau

**Section supérieure - Formulaire n8n :**
- Iframe intégrant le formulaire n8n pour télécharger des documents
- URL : `https://barow52161.app.n8n.cloud/form/4e1e20d4-f759-42c8-8439-87b93f43aa7c`

**Section inférieure - Accordéon des tables :**
- Liste toutes les tables présentes dans les messages du chat
- Chaque rubrique affiche le contenu de la première ligne de la colonne "Description"
- Bouton "Actualiser" pour recharger la liste des tables
- Clic sur une rubrique → déploie les options
- Option "Aller à cette table" → scroll vers la table avec highlight temporaire

### Icônes actives/inactives

**Actives :**
- Chat
- Dossier
- Database ✨ (nouveau)

**Inactives :**
- Dashboard
- Agents
- Notebooks
- LumaUI (Alpha)
- LumaUI (Beta)
- Image Gen
- Workflows
- Settings
- Help

### Comment fermer le panneau Database
1. Cliquer sur la croix (X) en haut à droite du panneau
2. Cliquer sur l'overlay sombre
3. Cliquer sur l'icône Chat dans la barre latérale

### Sélecteur CSS des tables
```javascript
const tableSelector = 'div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg';
```

## Test
1. Démarrer l'application : `npm run dev`
2. Cliquer sur l'icône Database (cylindre) dans la barre latérale gauche
3. Le panneau s'ouvre avec le formulaire n8n
4. Les tables du chat apparaissent dans l'accordéon en bas
