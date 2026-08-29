# 🎯 Guide Menu Contextuel CIA - Claraverse

## 📋 Vue d'ensemble

Le **Menu Contextuel CIA** est un système interactif qui permet d'afficher et de calculer automatiquement les résultats des questionnaires d'examen CIA dans Claraverse.

## ✨ Fonctionnalités

### 1. Menu Contextuel (Clic Droit)
- **Activation**: Clic droit sur n'importe quelle table CIA
- **Option disponible**: "📊 Résultat final"

### 2. Affichage des Colonnes Cachées
Lorsque "Résultat final" est activé:
- ✅ **Remarques**: Affiche les commentaires détaillés
- ✅ **Score**: Crée et affiche la colonne de score (0 ou 1)
- ✅ **Résultat Final**: Crée une table récapitulative

### 3. Calcul Automatique des Scores

#### Algorithme de Score
Pour chaque question (table):
```
SI checkbox cochée (Reponse_user = true)
  SI Reponse_cia == Option
    ALORS Score = 1 (Bonne réponse)
  SINON
    Score = 0 (Mauvaise réponse)
SINON
  Score = 0 (Pas de réponse)
```

#### Fusion des Cellules Score
- Toutes les cellules de la colonne Score sont fusionnées
- Affichage du format: `X/Y` (ex: `8/10`)
- Couleur de fond:
  - 🟢 Vert: Score parfait (100%)
  - 🟡 Jaune: Score partiel
  - 🔴 Rouge: Score faible

### 4. Table Résultat Final

Une table récapitulative est créée en haut du conteneur avec:
- **En-tête**: "Résultat Final" (fond bleu)
- **Score global**: Somme de tous les scores des tables CIA
- **Format**: `Total/Questions` (ex: `24/30`)
- **Couleur adaptative**:
  - 🟢 Vert: ≥ 100%
  - 🟡 Jaune: ≥ 70%
  - 🔴 Rouge: < 70%

## 🎮 Utilisation

### Étape 1: Répondre aux Questions
1. Parcourir les tables de questions CIA
2. Cocher la checkbox dans la colonne **Reponse_user** pour chaque question
3. Une seule réponse possible par question

### Étape 2: Afficher les Résultats
1. **Clic droit** sur n'importe quelle table CIA
2. Sélectionner **"📊 Résultat final"**
3. Le système:
   - Affiche les colonnes cachées (Remarques, Score)
   - Calcule automatiquement les scores
   - Crée la table Résultat Final

### Étape 3: Consulter les Résultats
- **Colonne Score**: Voir le score de chaque question (fusionné)
- **Colonne Remarques**: Lire les explications détaillées
- **Table Résultat Final**: Voir le score global

## 📊 Structure des Tables CIA

### Colonnes Requises
| Colonne | Description | Visible par défaut |
|---------|-------------|-------------------|
| **Ref_question** | Référence de la question | ✅ Oui (fusionnée) |
| **Question** | Texte de la question | ✅ Oui (fusionnée) |
| **Option** | Options de réponse (A, B, C, D) | ✅ Oui |
| **Reponse_cia** | Bonne réponse | ❌ Non (masquée) |
| **Remarques** | Commentaires explicatifs | ❌ Non (masquée) |
| **Reponse_user** | Checkbox pour la réponse | ✅ Oui |

### Colonnes Créées Dynamiquement
| Colonne | Description | Création |
|---------|-------------|----------|
| **Score** | Score 0 ou 1 | Créée au clic sur "Résultat final" |

## 🔧 Détails Techniques

### Fichiers Impliqués
```
public/
├── menu_cia.js          # Script principal du menu contextuel
├── conso.js             # Script de gestion des tables (existant)
└── test-menu-cia.html   # Page de test
```

### Intégration dans index.html
```html
<!-- Menu contextuel CIA pour résultats et scores -->
<script src="/menu_cia.js"></script>
```

### Détection des Tables CIA
Une table est considérée comme "CIA" si elle contient une colonne **Reponse_user**.

### Sélecteurs de Colonnes
Le système reconnaît les variations suivantes (insensible à la casse):

| Type | Variations |
|------|-----------|
| **Reponse_user** | `reponse_user`, `Reponse user`, `Reponse User`, `reponse user` |
| **Reponse_cia** | `reponse_cia`, `Reponse cia`, `REPONSE CIA`, `REPONSE_CIA` |
| **Remarques** | `remarques`, `remarque`, `Remarques`, `Remarque` |
| **Score** | `score`, `Score`, `SCORE` |
| **Resultat** | `résultat final`, `Resultat final`, `RESULTAT FINAL` |
| **Option** | `option`, `Option`, `OPTION` |
| **Question** | `question`, `Question`, `QUESTION` |
| **Ref_question** | `ref_question`, `Ref_question`, `REF_QUESTION`, `REF QUESTION` |

## 🧪 Test

### Page de Test
Ouvrir dans le navigateur:
```
http://localhost:5173/test-menu-cia.html
```

### Scénario de Test
1. ✅ Cocher quelques réponses dans les tables
2. ✅ Clic droit sur une table
3. ✅ Sélectionner "Résultat final"
4. ✅ Vérifier:
   - Colonne Remarques visible
   - Colonne Score créée et fusionnée
   - Table Résultat Final en haut
   - Scores calculés correctement

### Console de Debug
Ouvrir la console du navigateur (F12) pour voir les logs:
```
🎯 [CIA Menu] Initialisation du menu contextuel CIA
🎯 [CIA Menu] ✅ Menu contextuel CIA configuré
🎯 [CIA Menu] Menu contextuel affiché pour table CIA
🎯 [CIA Menu] 📊 Affichage du résultat final
🎯 [CIA Menu] 🧮 Calcul des scores
🎯 [CIA Menu] ✅ Score total: 8/10
```

## 🎨 Personnalisation

### Modifier les Couleurs
Dans `menu_cia.js`, section `createResultatTable()`:
```javascript
background-color: ${
  totalScore === totalQuestions ? "#d4edda" :  // Vert (100%)
  totalScore >= totalQuestions * 0.7 ? "#fff3cd" :  // Jaune (≥70%)
  "#f8d7da"  // Rouge (<70%)
};
```

### Modifier le Style du Menu
Dans `menu_cia.js`, section `createContextMenu()`:
```javascript
menu.style.cssText = `
  position: fixed;
  background: white;
  border: 2px solid #007bff;  // Couleur de bordure
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10001;
  min-width: 200px;
`;
```

## 🐛 Dépannage

### Le menu ne s'affiche pas
- ✅ Vérifier que `menu_cia.js` est chargé dans `index.html`
- ✅ Vérifier que la table contient une colonne `Reponse_user`
- ✅ Ouvrir la console (F12) pour voir les erreurs

### Les scores ne sont pas calculés
- ✅ Vérifier que les colonnes `Reponse_cia` et `Option` existent
- ✅ Vérifier que les checkboxes sont cochées
- ✅ Vérifier les logs dans la console

### La colonne Remarques ne s'affiche pas
- ✅ Vérifier que la colonne existe dans la table
- ✅ Vérifier qu'elle est bien masquée au départ (`display: none`)
- ✅ Vérifier les logs dans la console

### La table Résultat Final n'apparaît pas
- ✅ Vérifier qu'il y a au moins une table CIA dans le conteneur
- ✅ Vérifier que les scores ont été calculés
- ✅ Ouvrir la console pour voir les erreurs

## 📝 Notes Importantes

### Compatibilité avec conso.js
Le menu CIA fonctionne en complément de `conso.js`:
- ✅ Les deux scripts peuvent coexister
- ✅ `conso.js` gère la persistance et les interactions de base
- ✅ `menu_cia.js` ajoute le menu contextuel et les calculs de score

### Persistance des Données
- Les réponses cochées sont sauvegardées par `conso.js`
- Les scores et résultats sont calculés à la demande
- La table Résultat Final est recréée à chaque activation

### Performance
- Le calcul des scores est instantané
- Pas d'impact sur les performances même avec de nombreuses tables
- Le menu contextuel est léger et réactif

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- [ ] Export des résultats en PDF
- [ ] Historique des scores
- [ ] Comparaison avec les résultats précédents
- [ ] Statistiques détaillées par thème
- [ ] Mode révision (afficher les bonnes réponses)

### Améliorations Possibles
- [ ] Animation lors de l'affichage des résultats
- [ ] Son de notification pour les scores parfaits
- [ ] Graphiques de progression
- [ ] Recommandations personnalisées

## 📞 Support

Pour toute question ou problème:
1. Consulter les logs dans la console (F12)
2. Vérifier la structure des tables
3. Tester avec la page `test-menu-cia.html`

## 📄 Licence

Ce script fait partie du projet Claraverse et suit la même licence.

---

**Version**: 1.0  
**Date**: Décembre 2024  
**Auteur**: Équipe Claraverse
