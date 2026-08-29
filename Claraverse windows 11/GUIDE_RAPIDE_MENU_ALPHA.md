# 🚀 Guide Rapide - Menu Alpha CIA

## Installation en 2 étapes

### Étape 1: Ajouter les scripts dans index.html

```html
<!-- Charger menu.js d'abord -->
<script src="public/menu.js"></script>

<!-- Puis charger l'extension CIA -->
<script src="public/menu_alpha_simple.js"></script>
```

### Étape 2: Tester

Ouvrez `public/test-menu-alpha-cia.html` dans votre navigateur.

## ✅ Vérification rapide

Ouvrez la console et vérifiez ces messages:

```
✅ menu.js détecté
🎓 Initialisation des extensions CIA
✅ Extensions CIA initialisées avec succès
```

## 🎯 Utilisation

### Pour les tables CIA

Vos tables doivent avoir ces colonnes:

| Colonne obligatoire | Description |
|---------------------|-------------|
| Reponse_user | Colonne avec checkboxes (détection automatique) |

| Colonnes optionnelles | Action |
|-----------------------|--------|
| Reponse CIA | Masquée automatiquement |
| Remarques | Masquée automatiquement |
| Question | Fusionnée automatiquement |
| Ref_question | Fusionnée automatiquement |

### Exemple minimal

```html
<table class="min-w-full border border-gray-200">
    <tr>
        <th>Question</th>
        <th>Option</th>
        <th>Reponse_user</th>
    </tr>
    <tr>
        <td>Quelle est la bonne réponse?</td>
        <td>A) Option 1</td>
        <td></td>
    </tr>
    <tr>
        <td>Quelle est la bonne réponse?</td>
        <td>B) Option 2</td>
        <td></td>
    </tr>
</table>
```

## 🎉 Résultat

- ☑️ Checkboxes créées automatiquement
- 💾 Sauvegarde automatique après chaque clic
- ✅ Restauration après actualisation
- 🔒 Une seule checkbox cochée par table

## 🧪 Test rapide

1. Ouvrez `public/test-menu-alpha-cia.html`
2. Cochez une checkbox
3. Actualisez la page (F5)
4. La checkbox reste cochée ✅

## 📝 Notes importantes

- menu.js DOIT être chargé AVANT menu_alpha_simple.js
- Les tables doivent avoir la classe CSS ClaraVerse
- La colonne "Reponse_user" déclenche la détection automatique
- Les checkboxes sont sauvegardées dans localStorage ET IndexedDB

## 🐛 Problème?

### Les checkboxes ne s'affichent pas

Vérifiez dans la console:
```javascript
// Doit afficher le nombre de tables CIA détectées
🎓 X table(s) CIA détectée(s)
```

Si 0 table détectée:
- Vérifiez le nom de la colonne "Reponse_user"
- Vérifiez que la table a la classe CSS correcte

### Les checkboxes ne sont pas sauvegardées

Vérifiez dans la console:
```javascript
// Doit s'afficher après chaque clic
💾 État des checkboxes CIA sauvegardé
```

Si ce message n'apparaît pas:
- Vérifiez que localStorage est activé
- Vérifiez qu'il n'y a pas d'erreurs JavaScript

## ✨ Fonctionnalités bonus

### Menu contextuel (clic droit sur table)

- ✏️ Activer/désactiver édition
- ➕ Insérer ligne/colonne
- 🗑️ Supprimer ligne/colonne
- 📥 Import Excel
- 📤 Export Excel

### Raccourcis clavier

- `Ctrl+E` : Activer édition
- `Ctrl+Shift+↓` : Insérer ligne
- `Ctrl+Shift+→` : Insérer colonne
- `Esc` : Fermer menu

## 🎓 Exemple complet avec Flowise

Votre endpoint Flowise doit générer des tables avec cette structure:

```json
{
  "headers": ["Ref_question", "Question", "Option", "Reponse CIA", "Remarques", "Reponse_user"],
  "rows": [
    ["Q1", "Question 1?", "A) Option 1", "Non", "Commentaire", ""],
    ["Q1", "Question 1?", "B) Option 2", "Oui", "Bonne réponse", ""],
    ["Q1", "Question 1?", "C) Option 3", "Non", "Commentaire", ""]
  ]
}
```

Le système détectera automatiquement la colonne "Reponse_user" et configurera la table.

## 📊 Statistiques

Après configuration, chaque table CIA aura:
- ✅ Colonnes sensibles masquées
- ✅ Questions fusionnées
- ✅ Checkboxes interactives
- ✅ Persistance activée
- ✅ Synchronisation avec dev.js

## 🚀 Prêt à utiliser!

Votre système est maintenant configuré pour gérer automatiquement les questionnaires CIA avec persistance complète.
