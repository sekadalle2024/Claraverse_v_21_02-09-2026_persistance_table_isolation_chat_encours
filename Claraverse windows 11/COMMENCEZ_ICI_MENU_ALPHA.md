# 🎯 COMMENCEZ ICI - Menu Alpha CIA

## Bienvenue! 👋

Vous êtes au bon endroit pour intégrer le système de questionnaires CIA dans ClaraVerse.

## ⚡ Installation en 3 étapes (5 minutes)

### Étape 1: Ajouter le script

Ouvrez `index.html` et ajoutez cette ligne avant `</body>`:

```html
<script src="public/menu_alpha_simple.js"></script>
```

### Étape 2: Actualiser la page

Rechargez votre application ClaraVerse (F5).

### Étape 3: Vérifier

Ouvrez la console (F12) et vérifiez ces messages:

```
✅ Menu Alpha (Extension CIA) chargé
🎓 Extensions CIA initialisées avec succès
```

## ✅ C'est tout!

Votre système est maintenant prêt à gérer automatiquement les questionnaires CIA.

## 🧪 Test rapide

Ouvrez dans votre navigateur:
```
public/test-menu-alpha-cia.html
```

Vous devriez voir:
- ✅ Une table avec des checkboxes
- ✅ Colonnes "Reponse CIA" et "Remarques" masquées
- ✅ Cellules "Question" fusionnées

Cochez une checkbox, actualisez (F5), elle reste cochée ✅

## 📚 Documentation

### Pour aller plus loin

| Fichier | Quand l'utiliser |
|---------|------------------|
| [INDEX_MENU_ALPHA_CIA.md](INDEX_MENU_ALPHA_CIA.md) | Navigation dans la documentation |
| [GUIDE_RAPIDE_MENU_ALPHA.md](GUIDE_RAPIDE_MENU_ALPHA.md) | Guide d'utilisation rapide |
| [README_MENU_ALPHA_CIA.md](README_MENU_ALPHA_CIA.md) | Documentation complète |
| [DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md](DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md) | Pour les développeurs |
| [SYNTHESE_FINALE_MENU_ALPHA.md](SYNTHESE_FINALE_MENU_ALPHA.md) | Vue d'ensemble |

### Navigation rapide

**Vous voulez:**
- 🚀 Installer rapidement → [GUIDE_RAPIDE_MENU_ALPHA.md](GUIDE_RAPIDE_MENU_ALPHA.md)
- 📖 Comprendre le système → [SYNTHESE_FINALE_MENU_ALPHA.md](SYNTHESE_FINALE_MENU_ALPHA.md)
- 🔧 Personnaliser → [README_MENU_ALPHA_CIA.md](README_MENU_ALPHA_CIA.md)
- 🐛 Résoudre un problème → [GUIDE_RAPIDE_MENU_ALPHA.md](GUIDE_RAPIDE_MENU_ALPHA.md) - Section "Problème?"
- 💻 Développer → [DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md](DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md)

## 🎓 Exemple de table CIA

Votre endpoint Flowise doit générer des tables avec cette structure:

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

Le système détectera automatiquement la colonne "Reponse_user" et créera les checkboxes.

## ✨ Ce qui se passe automatiquement

Quand une table avec colonne "Reponse_user" est détectée:

1. ✅ Checkboxes créées automatiquement
2. ✅ Colonnes "Reponse CIA" et "Remarques" masquées (si présentes)
3. ✅ Cellules "Question" et "Ref_question" fusionnées (si présentes)
4. ✅ Sauvegarde automatique après chaque clic
5. ✅ Restauration automatique après actualisation
6. ✅ Une seule checkbox cochée par table

## 🐛 Problème?

### Les checkboxes ne s'affichent pas

**Vérifiez:**
1. La colonne s'appelle "Reponse_user" (ou variation)
2. La table a la classe CSS ClaraVerse
3. Le script est bien chargé (voir console)

**Solution rapide:**
```javascript
// Console (F12)
const table = document.querySelector("table");
const columns = detectCIAColumns(table);
console.log(columns); // Vérifier hasResponseColumn
```

### Les checkboxes ne sont pas sauvegardées

**Vérifiez:**
1. localStorage est activé
2. Pas d'erreur dans la console
3. dev.js est chargé

**Solution rapide:**
```javascript
// Console (F12)
console.log(localStorage.getItem("cia_checkboxes_table_0_..."));
// Doit afficher les données
```

### Autres problèmes

Consultez [GUIDE_RAPIDE_MENU_ALPHA.md](GUIDE_RAPIDE_MENU_ALPHA.md) - Section "Problème?"

## 📞 Support

### Ordre de consultation

1. Ce fichier (COMMENCEZ_ICI_MENU_ALPHA.md)
2. [GUIDE_RAPIDE_MENU_ALPHA.md](GUIDE_RAPIDE_MENU_ALPHA.md)
3. [README_MENU_ALPHA_CIA.md](README_MENU_ALPHA_CIA.md)
4. [DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md](DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md)

### Console du navigateur

Ouvrez la console (F12) pour voir les logs détaillés:

```
✅ Menu Alpha (Extension CIA) chargé
🎓 Initialisation des extensions CIA
🎓 X table(s) CIA détectée(s)
✅ Checkboxes CIA configurées
💾 État des checkboxes CIA sauvegardé
```

## 🎉 Félicitations!

Votre système de questionnaires CIA est maintenant opérationnel!

### Prochaines étapes

1. ✅ Tester avec [public/test-menu-alpha-cia.html](public/test-menu-alpha-cia.html)
2. ✅ Configurer votre endpoint Flowise
3. ✅ Créer vos premiers questionnaires
4. ✅ Tester la persistance

### Fonctionnalités disponibles

- ✏️ Édition des cellules (menu contextuel)
- ➕ Insertion de lignes/colonnes (menu contextuel)
- 📥 Import Excel (menu contextuel)
- 📤 Export Excel (menu contextuel)
- ☑️ Checkboxes persistantes (automatique)
- 💾 Sauvegarde automatique (automatique)
- 🔄 Restauration automatique (automatique)

### Menu contextuel

Faites un **clic droit** sur une table pour accéder au menu contextuel avec toutes les fonctionnalités.

## 🚀 Prêt pour la production!

Le système est maintenant opérationnel et prêt à être utilisé en production.

**Tout est automatique!** 🎉

---

## 📚 Documentation complète

Pour une documentation complète, consultez:

- **[INDEX_MENU_ALPHA_CIA.md](INDEX_MENU_ALPHA_CIA.md)** - Navigation dans la documentation
- **[SYNTHESE_FINALE_MENU_ALPHA.md](SYNTHESE_FINALE_MENU_ALPHA.md)** - Vue d'ensemble complète
- **[README_MENU_ALPHA_CIA.md](README_MENU_ALPHA_CIA.md)** - Documentation détaillée

---

**Besoin d'aide?** Consultez [GUIDE_RAPIDE_MENU_ALPHA.md](GUIDE_RAPIDE_MENU_ALPHA.md)

**Prêt à commencer!** 🚀
