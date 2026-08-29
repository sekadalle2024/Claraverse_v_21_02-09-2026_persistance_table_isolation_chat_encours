# 🔍 Table Selector Detective - Extension Chrome

Extension Chrome Manifest V3 pour détecter toutes les tables dans le DOM et identifier leurs sélecteurs CSS.
Compatible avec Claraverse, Flowise et toutes les interfaces de chat.

## ✨ Fonctionnalités

### 🎯 Détection de tables
- Scan complet de toutes les balises `<table>` dans la page
- Identification des sélecteurs CSS (court et précis)
- Analyse des en-têtes, dimensions, et structure
- Catalogue des sélecteurs qui fonctionnent par catégorie

### 📥 Export des résultats
- **HTML** : Page web complète avec styles (prête à ouvrir dans un navigateur)
- **JSON** : Données structurées brutes pour traitement automatique
- **PDF** : Document imprimable (via fenêtre d'impression du navigateur)
- **DOC (RTF)** : Format compatible Microsoft Word

## 🚀 Installation

1. Ouvrez Chrome et allez dans `chrome://extensions/`
2. Activez le "Mode développeur" (coin supérieur droit)
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier `table-detector-ext`
5. L'extension est installée !

## 📖 Utilisation

### Étape 1 : Scanner une page
1. Naviguez vers une page contenant des tables (ex: chat Claraverse/Flowise)
2. Cliquez sur l'icône de l'extension dans la barre d'outils
3. Cliquez sur le bouton **Scanner**
4. Les résultats s'affichent immédiatement

### Étape 2 : Explorer les résultats
- **Catalogue des sélecteurs** : Voir quels sélecteurs CSS fonctionnent
- **Détail des tables** : Cliquez sur une table pour voir ses informations
- **Copie rapide** : Cliquez sur n'importe quel sélecteur pour le copier

### Étape 3 : Exporter les résultats
1. Après un scan réussi, le bouton **Export** apparaît
2. Cliquez sur **Export** pour ouvrir le menu
3. Choisissez votre format :
   - **HTML** : Pour visualiser dans un navigateur
   - **JSON** : Pour traitement automatique
   - **PDF** : Pour imprimer ou archiver
   - **DOC** : Pour éditer dans Word
4. Le fichier est téléchargé automatiquement

## 📂 Structure des fichiers

```
table-detector-ext/
├── manifest.json          # Configuration Manifest V3
├── popup.html            # Interface utilisateur
├── popup.js              # Logique principale + scan
├── export-functions.js   # Fonctions d'export (HTML, JSON, PDF, DOC)
├── content.js            # Script de détection (non utilisé en injection)
├── background.js         # Service worker
├── icons/                # Icônes de l'extension
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # Ce fichier
```

## 🎨 Catalogue de sélecteurs

L'extension teste automatiquement ces catégories de sélecteurs :

1. **🟢 Claraverse / Flowise (Natifs)** : Sélecteurs spécifiques au projet
2. **🔵 Chat Tailwind CSS** : Classes Tailwind communes
3. **🟡 Conteneurs Messages Chat** : Wrappers de messages
4. **🟠 Markdown Renderers** : Bibliothèques de rendu Markdown
5. **⚫ Dark Mode** : Variantes mode sombre
6. **🔴 Universel** : Sélecteurs génériques de dernier recours

## 🔧 Permissions requises

- `activeTab` : Accès à l'onglet actif
- `scripting` : Injection de scripts
- `storage` : Stockage local (futur usage)
- `downloads` : Téléchargement des exports
- `<all_urls>` : Fonctionnement sur tous les sites

## 💡 Cas d'usage

### Pour les développeurs
- Identifier les sélecteurs CSS pour scraping
- Déboguer les problèmes de détection de tables
- Documenter la structure HTML d'une interface

### Pour les testeurs
- Vérifier la présence de tables dans le chat
- Exporter les résultats pour rapport de bug
- Comparer les structures entre différentes pages

### Pour les analystes
- Extraire la structure des données affichées
- Documenter les formats de tables
- Créer des rapports d'analyse

## 🐛 Dépannage

### L'extension ne détecte aucune table
- Vérifiez que la page contient bien des balises `<table>`
- Certains chats utilisent des `<div>` stylisés en grilles
- Essayez d'afficher un message contenant un tableau

### Le bouton Export n'apparaît pas
- Effectuez d'abord un scan avec le bouton **Scanner**
- Le bouton Export n'apparaît qu'après un scan réussi

### L'export PDF ne fonctionne pas
- L'export PDF ouvre une fenêtre d'impression
- Utilisez "Enregistrer au format PDF" dans la boîte de dialogue
- Assurez-vous que les pop-ups ne sont pas bloqués

### L'export DOC ne s'ouvre pas dans Word
- Le format généré est RTF (Rich Text Format)
- Compatible avec Word, LibreOffice, Google Docs
- Renommez l'extension en `.doc` si nécessaire

## 📝 Format des exports

### HTML
- Page web autonome avec tous les styles intégrés
- Design identique à l'interface de l'extension
- Prête à être ouverte dans n'importe quel navigateur

### JSON
- Structure complète des données
- Idéal pour traitement automatique
- Format : `{ timestamp, url, totalTablesFound, catalogHits, tables[] }`

### PDF
- Génère via la fonction d'impression du navigateur
- Mise en page optimisée pour l'impression
- Conserve tous les styles et la structure

### DOC (RTF)
- Format Rich Text Format
- Compatible Microsoft Word
- Conserve la mise en forme de base (gras, couleurs, polices)

## 🔄 Mises à jour

### Version 1.0.0 (26 Mars 2026)
- ✅ Détection complète des tables
- ✅ Catalogue de sélecteurs CSS
- ✅ Interface accordéon pour les détails
- ✅ Copie rapide des sélecteurs
- ✅ Export HTML, JSON, PDF, DOC

## 👨‍💻 Développement

### Modifier l'extension
1. Éditez les fichiers dans `table-detector-ext/`
2. Allez dans `chrome://extensions/`
3. Cliquez sur le bouton "Recharger" de l'extension
4. Testez les modifications

### Ajouter des sélecteurs
Éditez la constante `SELECTOR_CATALOG` dans `popup.js` (fonction `injectedScanFunction`)

### Personnaliser les styles
Modifiez la section `<style>` dans `popup.html`

## 📄 Licence

Extension développée pour le projet Claraverse.
Compatible avec les interfaces Flowise et autres chats basés sur des tables HTML.

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la console Chrome (`F12` > Console)
2. Consultez ce README
3. Testez sur une page simple avec une table HTML basique

---

**Version** : 1.0.0  
**Manifest** : V3  
**Compatibilité** : Chrome 88+, Edge 88+
