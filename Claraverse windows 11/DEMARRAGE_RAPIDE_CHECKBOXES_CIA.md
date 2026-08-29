# 🚀 Démarrage Rapide - Checkboxes Examen CIA

## ⚡ En 3 étapes

### 1️⃣ Tester la fonctionnalité

Ouvrez le fichier de test dans votre navigateur:
```
public/test-examen-cia-checkbox.html
```

### 2️⃣ Utiliser dans vos tables

Créez une table avec une colonne `Reponse_user`:

```html
<table class="min-w-full border border-gray-200">
  <thead>
    <tr>
      <th>Ref_question</th>
      <th>Question</th>
      <th>Option</th>
      <th>Reponse_CIA</th>
      <th>Remarques</th>
      <th>Reponse_user</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Q1</td>
      <td>Votre question?</td>
      <td>A</td>
      <td>Réponse A</td>
      <td>Commentaire</td>
      <td></td>
    </tr>
    <tr>
      <td>Q1</td>
      <td>Votre question?</td>
      <td>B</td>
      <td>Réponse B</td>
      <td>Commentaire</td>
      <td></td>
    </tr>
  </tbody>
</table>
```

### 3️⃣ Vérifier que ça fonctionne

Ouvrez la console (F12) et tapez:
```javascript
claraverseCommands.testPersistence()
```

## ✅ Comportement attendu

1. **Cliquez sur une cellule** dans la colonne `Reponse_user`
   - Une checkbox apparaît et se coche
   - La cellule devient verte

2. **Cliquez sur une autre cellule** de la même table
   - La nouvelle checkbox se coche
   - L'ancienne se décoche automatiquement
   - Une seule réponse par table

3. **Rechargez la page** (F5)
   - Les checkboxes sont restaurées
   - Les réponses sont conservées

## 🔧 Commandes utiles

```javascript
// Sauvegarder toutes les tables
claraverseCommands.saveAllNow()

// Voir le stockage
claraverseCommands.getStorageInfo()

// Restaurer les tables
claraverseCommands.restoreAll()

// Aide complète
claraverseCommands.help()
```

## 📋 Variations de noms de colonnes supportées

Toutes ces variations fonctionnent:
- `Reponse_user`
- `Reponse user`
- `Reponse User`
- `reponse_user`
- `reponse user`
- `REPONSE_USER`

## ⚠️ Si ça ne fonctionne pas

1. Vérifiez que `conso.js` est chargé:
   ```javascript
   typeof claraverseCommands !== 'undefined'
   ```

2. Forcez l'attribution des IDs:
   ```javascript
   claraverseCommands.forceAssignIds()
   claraverseCommands.saveAllNow()
   ```

3. Consultez la documentation complète:
   - `INTEGRATION_EXAMEN_CIA_CHECKBOXES.md`

## 🎯 C'est tout !

La fonctionnalité est prête à l'emploi. Les checkboxes sont automatiquement:
- ✅ Créées dans les colonnes `Reponse_user`
- ✅ Sauvegardées après chaque modification
- ✅ Restaurées au rechargement de la page

**Bon examen CIA !** 📚✨
