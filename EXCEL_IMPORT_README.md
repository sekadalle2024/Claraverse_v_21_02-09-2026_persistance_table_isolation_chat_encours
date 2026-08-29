# 📊 Excel Import Feature - ClaraVerse

## Vue d'ensemble

La fonctionnalité **Import Excel** permet de remplacer intégralement le contenu d'une table HTML dans ClaraVerse par des données provenant d'un fichier Excel, CSV ou autres formats de feuilles de calcul.

## 🚀 Utilisation

### Étapes d'utilisation

1. **Survol d'une table** : Placez votre souris au-dessus d'une table dans le chat
2. **Menu contextuel** : Le menu contextuel apparaît automatiquement
3. **Clic sur "Import Excel"** : Sélectionnez l'option dans le menu
4. **Sélection du fichier** : Une boîte de dialogue s'ouvre pour sélectionner votre fichier
5. **Import automatique** : Le contenu de la table est remplacé par les données du fichier

### Formats supportés

- **Excel (.xlsx, .xls)** - Format Microsoft Excel
- **CSV (.csv)** - Fichier de valeurs séparées par des virgules

## 🔧 Fonctionnalités techniques

### Traitement des données

- **Première ligne = En-têtes** : La première ligne du fichier Excel est automatiquement utilisée comme en-têtes de colonnes
- **Remplacement intégral** : Tout le contenu existant de la table est remplacé
- **Cellules éditables** : Les cellules importées sont automatiquement rendues éditables
- **Styles préservés** : Les classes CSS et styles de la table originale sont conservés

### Gestion des erreurs

- **Fichier vide** : Alerte si le fichier Excel ne contient aucune donnée
- **Erreur de lecture** : Messages d'erreur détaillés en cas de problème
- **Chargement dynamique** : SheetJS est chargé automatiquement si non disponible

## 📋 Structure de fichier Excel recommandée

```
Nom         Âge    Ville           Salaire
Alice       28     Paris           45000
Bob         34     Lyon            52000
Claire      29     Marseille       48000
David       42     Toulouse        55000
```

## 🔄 Synchronisation avec dev.js

L'import Excel est entièrement intégré avec le système de persistance existant :

- **Sauvegarde automatique** : Les données importées sont automatiquement sauvegardées via `dev.js`
- **Notifications** : Événements personnalisés envoyés pour notifier les modifications
- **API de synchronisation** : Utilise `window.claraverseSyncAPI` pour la cohérence des données

### Événements déclenchés

```javascript
// Événement de modification de structure
{
  type: "excel_import",
  rowCount: nombre_de_lignes,
  columnCount: nombre_de_colonnes
}

// Événement de mise à jour de table
{
  tableId: "id_unique",
  source: "menu",
  action: "table_modified",
  timestamp: Date.now()
}
```

## 🛠️ Dépendances

### Bibliothèque SheetJS

La fonctionnalité utilise **SheetJS (xlsx)** pour le traitement des fichiers Excel :

- **Chargement automatique** : CDN `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
- **Version recommandée** : 0.18.5 ou supérieure
- **Fallback** : Chargement dynamique si la bibliothèque n'est pas déjà présente

### APIs navigateur utilisées

- **File API** : `input[type="file"]` et `FileReader`
- **ArrayBuffer** : Pour la lecture binaire des fichiers Excel
- **DOM Manipulation** : Création et modification dynamique des éléments HTML

## 🧪 Tests

### Fichier de test

Un fichier de test `test-excel-import.html` est fourni pour valider la fonctionnalité :

```bash
# Ouvrir le fichier de test dans un navigateur
open test-excel-import.html
```

### Tests automatiques

- Détection des tables avec les sélecteurs CSS ClaraVerse
- Initialisation du menu contextuel
- Vérification de la synchronisation avec dev.js

## 🔍 Sélecteurs CSS ciblés

La fonctionnalité fonctionne avec les tables ayant les classes CSS spécifiques de ClaraVerse :

```css
div.prose.prose-base.dark\:prose-invert.max-w-none 
table.min-w-full.border.border-gray-200.dark\:border-gray-700.rounded-lg
```

## 🐛 Dépannage

### Problèmes courants

1. **Menu ne s'affiche pas**
   - Vérifiez que la table a les bonnes classes CSS
   - Assurez-vous que `menu.js` est chargé

2. **Import Excel ne fonctionne pas**
   - Vérifiez la connexion internet (pour SheetJS CDN)
   - Contrôlez la console pour les erreurs JavaScript

3. **Données mal formatées**
   - Assurez-vous que la première ligne contient les en-têtes
   - Vérifiez que le fichier Excel n'est pas corrompu

### Messages d'erreur

- `⚠️ Aucune table sélectionnée` : Cliquez ou survolez d'abord une table
- `⚠️ Le fichier Excel est vide` : Le fichier ne contient aucune donnée
- `❌ Impossible de charger SheetJS` : Problème de connexion réseau

## 📊 Intégration avec les autres fonctionnalités

L'import Excel fonctionne en synergie avec les autres fonctionnalités du menu contextuel :

- **Insérer ligne en dessous** : Ajoute des lignes après l'import
- **Insérer colonne droite** : Étend la table importée
- **Rapprochement** : Effectue des calculs sur les colonnes importées

## 🔒 Sécurité

- **Traitement local** : Les fichiers sont traités entièrement côté client
- **Aucune transmission** : Aucune donnée n'est envoyée vers des serveurs externes
- **Validation** : Vérification des types de fichiers avant traitement

## 📈 Performance

### Optimisations

- **Chargement à la demande** : SheetJS n'est chargé qu'en cas de besoin
- **Traitement par chunks** : Gestion efficace des gros fichiers Excel
- **DOM Fragment** : Utilisation optimale pour les modifications DOM

### Limitations

- **Taille de fichier** : Recommandé < 10MB pour de meilleures performances
- **Nombre de lignes** : Testé jusqu'à 10,000 lignes
- **Mémoire navigateur** : Dépendant des ressources disponibles

## 🔄 Mises à jour futures

### Fonctionnalités prévues

- Support des formules Excel
- Import de feuilles multiples
- Mappage personnalisé des colonnes
- Preview avant import
- Export vers Excel

---

## 👥 Support

Pour toute question ou problème :

1. Consultez la console développeur pour les messages d'erreur
2. Vérifiez les logs dans `menu.js` (prefixe `📊`, `✅`, `❌`)
3. Testez avec le fichier `test-excel-import.html`

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Compatibilité** : Navigateurs modernes (Chrome, Firefox, Safari, Edge)