# Guide du Menu Dossier - Barre Latérale Accordéon

## 📁 Vue d'ensemble

Le **Menu Dossier** est une nouvelle fonctionnalité qui permet d'organiser et d'accéder facilement aux tables présentes dans les messages du système LLM via un menu accordéon coulissant.

## 🎯 Objectif

Centraliser toutes les tables des messages LLM dans une interface organisée et intuitive, permettant une navigation rapide et efficace entre les différentes tables du chat.

## ✨ Fonctionnalités

### 1. **Icône Dossier dans la Sidebar**
- Nouvelle icône 📁 "Dossier" ajoutée dans le menu latéral gauche
- Positionnée entre "Chat" et "Agents"
- Toujours active et accessible

### 2. **Menu Coulissant**
- Apparaît sur la moitié droite de l'écran
- Animation fluide d'entrée/sortie
- Design moderne avec dégradé violet
- Superposé au-dessus de tous les autres éléments (z-index: 20000)

### 3. **Organisation en Accordéon**
- Chaque message LLM contenant des tables est représenté par une rubrique
- Le titre de la rubrique est extrait de la première ligne de la première table (colonne Description)
- Affiche le nombre de tables dans chaque message

### 4. **Miniatures de Tables**
- Chaque table est présentée avec ses informations :
  - Numéro de la table
  - Nombre de lignes et colonnes
  - Bouton pour faire défiler vers la table
- Clic sur une miniature :
  - Ferme le menu automatiquement
  - Fait défiler la page vers la table
  - Applique un effet de surbrillance temporaire (2 secondes)

### 5. **Rafraîchissement Automatique**
- Le contenu du menu se met à jour automatiquement toutes les 2 secondes
- Détecte les nouvelles tables ajoutées dans le chat

## 🚀 Utilisation

### Ouvrir le Menu Dossier

1. **Via l'icône Sidebar** :
   - Cliquez sur l'icône 📁 "Dossier" dans le menu latéral gauche

2. **Fermer le Menu** :
   - Cliquez sur le bouton ✕ en haut à droite du menu
   - Appuyez sur la touche `Escape`
   - Cliquez sur une miniature de table (fermeture automatique)

### Naviguer dans les Tables

1. **Ouvrir une rubrique** :
   - Cliquez sur l'en-tête d'une rubrique pour afficher/masquer les tables

2. **Accéder à une table** :
   - Cliquez sur une miniature de table
   - Le menu se ferme automatiquement
   - La page défile vers la table sélectionnée
   - La table est mise en surbrillance pendant 2 secondes

## 🎨 Design

### Couleurs et Style
- **En-tête** : Dégradé violet (#667eea → #764ba2)
- **Fond** : Blanc avec légère ombre
- **Accordéon** : Gris clair avec transitions fluides
- **Miniatures** : Blanc avec bordure grise, effet hover bleu

### Animations
- **Entrée/Sortie** : Slide horizontal avec easing cubic-bezier
- **Accordéon** : Expansion/contraction fluide
- **Hover** : Changement de couleur et légère translation

## 🔧 Configuration Technique

### Fichiers Modifiés

1. **`public/dossier-menu.js`** (NOUVEAU)
   - Gestionnaire principal du menu Dossier
   - Logique d'accordéon et de navigation

2. **`src/components/Sidebar.tsx`**
   - Ajout de l'icône Folder (lucide-react)
   - Nouvelle entrée de menu "Dossier" (id: "dossier")
   - Icône active par défaut (disabled: false)

3. **`index.html`**
   - Intégration du script `dossier-menu.js`
   - Chargé après les scripts de persistance

### Sélecteurs CSS Utilisés

Le menu détecte les tables avec les sélecteurs suivants :
```javascript
// Messages de l'assistant (LLM)
'.message-assistant, [data-role="assistant"], .prose.prose-base'

// Tables dans les messages
'table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg'
```

### Configuration

```javascript
config: {
  menuWidth: "50%",              // Largeur du menu
  animationDuration: 300,        // Durée des animations (ms)
  autoRefreshInterval: 2000,     // Intervalle de rafraîchissement (ms)
}
```

## 📊 Structure des Données

### Message avec Tables
```javascript
{
  index: 0,                      // Index du message
  title: "Description...",       // Titre extrait de la première table
  messageDiv: HTMLElement,       // Élément DOM du message
  tables: [HTMLTableElement]     // Liste des tables
}
```

## 🐛 Débogage

### Console Debug
Le menu expose une instance globale pour le débogage :
```javascript
// Accéder au gestionnaire
window.dossierMenu

// Rafraîchir manuellement
window.dossierMenu.refreshAccordion()

// Afficher/masquer
window.dossierMenu.showMenu()
window.dossierMenu.hideMenu()
```

### Messages de Log
- `📁 Initialisation du menu Dossier` : Démarrage
- `✅ Menu Dossier initialisé avec succès` : Prêt
- `📁 Menu Dossier affiché` : Menu ouvert
- `📁 Menu Dossier masqué` : Menu fermé
- `✅ Accordéon rafraîchi: X messages avec tables` : Mise à jour
- `✅ Défilement vers la table effectué` : Navigation réussie

## 🎯 Cas d'Usage

### Scénario 1 : Audit avec Multiples Tables
Un auditeur reçoit une réponse LLM contenant 5 tables d'analyse :
1. Ouvre le menu Dossier
2. Voit la rubrique "Analyse Financière" avec 5 tables
3. Clique sur "Table 3 - Écarts"
4. Est automatiquement dirigé vers cette table

### Scénario 2 : Comparaison de Tables
Un utilisateur veut comparer deux tables dans des messages différents :
1. Ouvre le menu Dossier
2. Navigue vers la première table
3. Rouvre le menu (icône Dossier)
4. Navigue vers la deuxième table

### Scénario 3 : Révision Rapide
Un utilisateur veut revoir toutes les tables d'une conversation :
1. Ouvre le menu Dossier
2. Voit l'ensemble des messages avec tables
3. Parcourt les miniatures pour identifier les tables importantes
4. Accède directement aux tables pertinentes

## ⚙️ Personnalisation

### Modifier la Largeur du Menu
```javascript
// Dans dossier-menu.js
config: {
  menuWidth: "60%",  // Augmenter à 60%
}
```

### Changer l'Intervalle de Rafraîchissement
```javascript
// Dans dossier-menu.js
config: {
  autoRefreshInterval: 5000,  // 5 secondes
}
```

### Adapter les Sélecteurs
Si votre structure HTML est différente, modifiez les sélecteurs dans `getLLMMessagesWithTables()` :
```javascript
const assistantMessages = document.querySelectorAll(
  '.votre-classe-message, [data-votre-attribut="assistant"]'
);
```

## 🔄 Intégration avec les Autres Systèmes

### Compatibilité
- ✅ Compatible avec le système de persistance existant
- ✅ Compatible avec menu.js (menu contextuel)
- ✅ Compatible avec conso.js (consolidation)
- ✅ Compatible avec les scripts de modélisation

### Ordre de Chargement
Le script `dossier-menu.js` doit être chargé **après** :
- `menu-persistence-bridge.js`
- `menu.js`
- `conso.js`

## 📝 Notes Importantes

1. **Icônes Désactivées** : Seules les icônes "Chat" et "Dossier" sont actives
2. **Messages LLM Uniquement** : Le menu affiche uniquement les tables des messages du système LLM, pas celles de l'utilisateur
3. **Première Colonne** : Le titre de la rubrique est extrait de la première cellule de la première ligne (colonne "Description")
4. **Rafraîchissement Automatique** : Le menu se met à jour automatiquement, pas besoin de le fermer/rouvrir

## 🚀 Prochaines Améliorations Possibles

1. **Filtrage** : Ajouter un champ de recherche pour filtrer les tables
2. **Export** : Permettre l'export de tables individuelles
3. **Favoris** : Marquer des tables comme favorites
4. **Historique** : Garder un historique des tables consultées
5. **Thème Sombre** : Support du mode sombre
6. **Responsive** : Adaptation pour mobile/tablette

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Testez avec `window.dossierMenu` dans la console
3. Vérifiez que les sélecteurs CSS correspondent à votre structure HTML

---

**Version** : 1.0  
**Date** : Décembre 2025  
**Auteur** : Équipe E-audit
