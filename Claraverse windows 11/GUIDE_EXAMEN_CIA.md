# Guide d'utilisation - Script Examen CIA

## 📋 Vue d'ensemble

Le script `examen_cia.js` permet de gérer des questionnaires d'examen CIA dans les pages de chat de Claraverse avec persistance automatique des réponses dans localStorage.

## 🎯 Fonctionnalités principales

### 1. Détection automatique des tables d'examen
Le script détecte automatiquement les tables contenant les colonnes caractéristiques d'un questionnaire CIA.

### 2. Colonnes supportées

#### **Reponse_user** (Réponse de l'utilisateur)
- **Variations détectées**: `reponse_user`, `reponse user`, `Reponse User`, `réponse_user`
- **Comportement**: 
  - Affiche une checkbox dans chaque ligne
  - Une seule checkbox peut être cochée par table (choix unique)
  - Quand une checkbox est cochée, toutes les autres sont automatiquement décochées
  - L'état est sauvegardé automatiquement

#### **Reponse_cia** (Réponse correcte)
- **Variations détectées**: `reponse cia`, `REPONSE CIA`, `Reponse_cia`, `réponse cia`
- **Comportement**: 
  - Colonne masquée automatiquement (invisible mais présente dans le DOM)
  - Contient les bonnes réponses pour correction ultérieure

#### **Option** (Options de réponse)
- **Variations détectées**: `option`, `options`, `Option`
- **Comportement**: 
  - Affiche les différentes options de réponse (A, B, C, D, etc.)
  - Visible et non modifiable

#### **Remarques** (Commentaires)
- **Variations détectées**: `remarques`, `remarque`, `commentaire`, `commentaires`
- **Comportement**: 
  - Colonne masquée automatiquement
  - Contient les explications/commentaires

#### **Question**
- **Variations détectées**: `question`, `questions`, `Question`
- **Comportement**: 
  - Si toutes les lignes ont la même question, les cellules sont fusionnées
  - Texte centré verticalement et horizontalement
  - Mise en gras automatique

#### **Ref_question** (Référence de la question)
- **Variations détectées**: `ref_question`, `ref question`, `REF_QUESTION`, `réf_question`
- **Comportement**: 
  - Si toutes les lignes ont la même référence, les cellules sont fusionnées
  - Texte centré verticalement et horizontalement
  - Mise en gras automatique

## 📊 Structure des tables

### Table d'information (première table)
```
| Titre Examen | Durée | Date | ... |
|--------------|-------|------|-----|
| CIA Part 1   | 3h    | ...  | ... |
```

### Tables de questions (tables suivantes)
```
| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
|--------------|----------|--------|--------------|-------------|-----------|
| Q1.1         | Texte... | A      | ☐            | (masqué)    | (masqué)  |
| Q1.1         | Texte... | B      | ☐            | (masqué)    | (masqué)  |
| Q1.1         | Texte... | C      | ☐            | (masqué)    | (masqué)  |
| Q1.1         | Texte... | D      | ☐            | (masqué)    | (masqué)  |
```

**Après traitement:**
```
| Ref_question | Question | Option | Reponse_user |
|--------------|----------|--------|--------------|
|              |          | A      | ☐            |
|     Q1.1     |  Texte   | B      | ☐            |
| (fusionné)   |(fusionné)| C      | ☐            |
|              |          | D      | ☐            |
```

## 💾 Persistance des données

### Sauvegarde automatique
- **Déclenchement**: À chaque changement de checkbox
- **Délai**: 500ms (debounce pour optimiser les performances)
- **Stockage**: localStorage avec la clé `claraverse_examen_cia`
- **Sauvegarde périodique**: Toutes les 30 secondes

### Restauration automatique
- Au chargement de la page
- Après un rechargement
- Lors du changement de chat

### Format des données sauvegardées
```json
{
  "exam-cia-1234567890-abc123": {
    "headers": [...],
    "rows": [
      [
        { "type": "text", "content": "Q1.1", "visible": true },
        { "type": "text", "content": "Question...", "visible": true },
        { "type": "text", "content": "A", "visible": true },
        { "type": "checkbox", "checked": true }
      ]
    ],
    "lastSaved": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🎨 Styles appliqués

### Tables
- Bordures collapsées
- Largeur 100%
- Marges de 20px
- Retour à la ligne automatique

### Cellules
- Padding de 12px
- Word-wrap activé
- Alignement centré pour les checkboxes

### Checkboxes
- Taille: 20x20px
- Curseur pointer
- Centrées dans la cellule

## 🔧 API JavaScript

### Accès global
```javascript
// Accéder au gestionnaire
window.examenCIA.manager

// Exporter les données
window.examenCIA.exportData()

// Effacer toutes les données
window.examenCIA.clearData()

// Obtenir les informations
window.examenCIA.getInfo()
// Retourne: { examCount, dataSize, dataSizeKB }

// Debug dans la console
window.examenCIA.debug()
```

### Exemples d'utilisation

#### Vérifier le nombre d'examens sauvegardés
```javascript
const info = window.examenCIA.getInfo();
console.log(`${info.examCount} examen(s) sauvegardé(s)`);
console.log(`Taille: ${info.dataSizeKB} KB`);
```

#### Exporter les données
```javascript
// Télécharge un fichier JSON avec toutes les données
window.examenCIA.exportData();
```

#### Effacer toutes les données
```javascript
// Demande confirmation puis efface tout
window.examenCIA.clearData();
```

#### Debug complet
```javascript
// Affiche toutes les informations dans la console
window.examenCIA.debug();
```

## 🔍 Logs de debug

Le script affiche des logs détaillés dans la console:

```
🎓 [Examen CIA] Initialisation du gestionnaire d'examen CIA
🎓 [Examen CIA] ✅ localStorage fonctionne correctement
🎓 [Examen CIA] 📦 2 examen(s) trouvé(s) dans le stockage
🎓 [Examen CIA] React détecté, démarrage du traitement
🎓 [Examen CIA] Table d'examen CIA détectée: exam-cia-1234567890-abc123
🎓 [Examen CIA] Colonnes identifiées: {reponse_user: 3, option: 2, ...}
🎓 [Examen CIA] Colonne reponse_cia masquée
🎓 [Examen CIA] Cellules fusionnées pour colonne 0
🎓 [Examen CIA] Checkboxes configurées
🎓 [Examen CIA] ✅ Table d'examen configurée
🎓 [Examen CIA] 💾 Sauvegarde de l'examen: exam-cia-1234567890-abc123
🎓 [Examen CIA] ✅ Examen sauvegardé: exam-cia-1234567890-abc123
```

## 🚀 Intégration

### Dans index.html
```html
<!-- Script Examen CIA - Questionnaires avec persistance -->
<script src="/examen_cia.js"></script>
```

### Ordre de chargement
1. `restore-lock-manager.js` (verrouillage)
2. `single-restore-on-load.js` (restauration unique)
3. `wrap-tables-auto.js` (wrapper)
4. `Flowise.js` (endpoint)
5. `menu-persistence-bridge.js` (pont de persistance)
6. `menu.js` (menu contextuel)
7. `conso.js` (consolidation)
8. **`examen_cia.js`** ← Nouveau script
9. Autres scripts...

## ⚙️ Configuration

### Modifier les variations de colonnes
Éditer le fichier `public/examen_cia.js`:

```javascript
const CONFIG = {
  columnVariations: {
    reponse_user: [
      "reponse_user",
      "reponse user",
      "ma_variation_personnalisee"  // Ajouter ici
    ],
    // ...
  }
};
```

### Modifier le délai de sauvegarde
```javascript
const CONFIG = {
  autoSaveDelay: 500,  // Modifier ici (en millisecondes)
  // ...
};
```

### Activer/désactiver le mode debug
```javascript
const CONFIG = {
  debugMode: true,  // false pour désactiver les logs
  // ...
};
```

## 🐛 Dépannage

### Les checkboxes ne s'affichent pas
1. Vérifier que la colonne contient une variation de "reponse_user"
2. Ouvrir la console et chercher les logs `🎓 [Examen CIA]`
3. Vérifier que la table est détectée: `Table d'examen CIA détectée`

### Les données ne sont pas sauvegardées
1. Vérifier localStorage: `window.examenCIA.debug()`
2. Vérifier les erreurs dans la console
3. Tester localStorage: `localStorage.setItem('test', 'test')`

### Les colonnes ne sont pas masquées
1. Vérifier les variations de noms de colonnes
2. Ouvrir la console: `Colonnes identifiées: {...}`
3. Ajouter la variation manquante dans CONFIG

### Les cellules ne fusionnent pas
1. Vérifier que toutes les lignes ont la même valeur
2. Vérifier qu'il y a plus d'une ligne dans la table
3. Consulter les logs: `Cellules fusionnées pour colonne X`

## 📝 Notes importantes

1. **ID unique**: Chaque table reçoit un ID unique au format `exam-cia-{timestamp}-{random}`
2. **Choix unique**: Une seule checkbox peut être cochée par table
3. **Persistance**: Les données survivent aux rechargements de page
4. **Performance**: Debounce de 500ms pour optimiser les sauvegardes
5. **Compatibilité**: Fonctionne avec React et les tables dynamiques

## 🔄 Synchronisation avec les autres scripts

Le script `examen_cia.js` est compatible avec:
- ✅ `menu.js` (menu contextuel)
- ✅ `conso.js` (consolidation)
- ✅ `dev.js` (développement)
- ✅ Système de restauration unique
- ✅ Pont de persistance

## 📚 Ressources

- Code source: `public/examen_cia.js`
- Documentation: `GUIDE_EXAMEN_CIA.md`
- Intégration: `index.html`

## ✅ Checklist de vérification

- [x] Script créé: `public/examen_cia.js`
- [x] Intégré dans `index.html`
- [x] Documentation créée
- [x] Détection automatique des tables
- [x] Checkboxes fonctionnelles
- [x] Choix unique par table
- [x] Colonnes masquées (reponse_cia, remarques)
- [x] Fusion des cellules (question, ref_question)
- [x] Persistance localStorage
- [x] Restauration automatique
- [x] API JavaScript exposée
- [x] Logs de debug
- [x] Sauvegarde automatique périodique

---

**Version**: 1.0  
**Date**: 2024-01-15  
**Auteur**: Kiro AI Assistant
