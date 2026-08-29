# Menu Alpha - Extension CIA pour ClaraVerse

## 📋 Description

`menu_alpha_simple.js` est une extension de `menu.js` qui ajoute des fonctionnalités spécifiques pour les questionnaires d'examen CIA dans ClaraVerse.

## ✨ Fonctionnalités

### Fonctionnalités héritées de menu.js
- ✏️ Édition des cellules
- ➕ Insertion/suppression de lignes et colonnes
- 📥 Import/Export Excel
- 💾 Persistance dans IndexedDB via dev.js

### Nouvelles fonctionnalités CIA
- 🎓 Détection automatique des tables CIA
- 👁️ Masquage automatique des colonnes "Reponse CIA" et "Remarques"
- 🔗 Fusion automatique des cellules "Question" et "Ref_question"
- ☑️ Création automatique de checkboxes dans "Reponse_user"
- 💾 Persistance des checkboxes (localStorage + IndexedDB)
- 🔒 Une seule checkbox cochée par table

## 📦 Installation

### Option 1: Utiliser menu_alpha_simple.js (Recommandé)

Dans votre `index.html`, ajoutez les deux scripts:

```html
<!-- Charger menu.js d'abord -->
<script src="menu.js"></script>

<!-- Puis charger l'extension CIA -->
<script src="menu_alpha_simple.js"></script>
```

### Option 2: Utiliser menu_alpha.js (Version complète)

Si vous préférez un fichier autonome:

```html
<script src="menu_alpha.js"></script>
```

## 🎯 Utilisation

### Structure de table CIA

Les tables doivent avoir les colonnes suivantes (variations acceptées):

| Colonne | Variations acceptées | Description |
|---------|---------------------|-------------|
| Ref_question | ref_question, REF_QUESTION, REF QUESTION | Référence de la question |
| Question | question | Texte de la question |
| Option | option | Options de réponse |
| Reponse CIA | reponse cia, reponse_cia, REPONSE CIA | Bonne réponse (masquée) |
| Remarques | remarques, remarque | Commentaires (masqués) |
| Reponse_user | reponse_user, reponse user, réponse_user | Réponse de l'utilisateur (checkbox) |

### Exemple de table

```html
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    <thead>
        <tr>
            <th>Ref_question</th>
            <th>Question</th>
            <th>Option</th>
            <th>Reponse CIA</th>
            <th>Remarques</th>
            <th>Reponse_user</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Q1</td>
            <td>Quelle est la principale responsabilité d'un auditeur interne?</td>
            <td>A) Préparer les états financiers</td>
            <td>Non</td>
            <td>Les états financiers sont préparés par la comptabilité</td>
            <td></td>
        </tr>
        <tr>
            <td>Q1</td>
            <td>Quelle est la principale responsabilité d'un auditeur interne?</td>
            <td>B) Évaluer les contrôles internes</td>
            <td>Oui</td>
            <td>C'est la bonne réponse</td>
            <td></td>
        </tr>
    </tbody>
</table>
```

## 🧪 Test

Ouvrez `public/test-menu-alpha-cia.html` dans votre navigateur pour tester les fonctionnalités.

## 🔧 Configuration

### Personnaliser les variations de colonnes

Dans `menu_alpha_simple.js`, modifiez l'objet `ciaConfig`:

```javascript
const ciaConfig = {
  responseColumnVariations: [
    "reponse_user", "reponse user", "réponse_user"
  ],
  ciaAnswerColumnVariations: [
    "reponse cia", "REPONSE CIA"
  ],
  // ... autres configurations
};
```

## 💾 Persistance

### Système de sauvegarde

1. **localStorage**: Sauvegarde immédiate de l'état des checkboxes
2. **IndexedDB**: Synchronisation via dev.js pour persistance complète de la table

### Restauration

Les checkboxes sont automatiquement restaurées:
- Au chargement de la page
- Après actualisation
- Lors du changement de chat (si dev.js est actif)

## 🔄 Synchronisation avec dev.js

Le système s'intègre automatiquement avec dev.js:

```javascript
// Sauvegarde automatique via dev.js
if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
  window.claraverseSyncAPI.forceSaveTable(table);
}
```

## 📊 Fonctionnement

### Détection automatique

1. Observer les tables ajoutées au DOM
2. Détecter les colonnes CIA dans les en-têtes
3. Si colonne "Reponse_user" détectée → configurer la table

### Configuration de table

1. Masquer colonnes "Reponse CIA" et "Remarques"
2. Fusionner cellules "Question" et "Ref_question"
3. Créer checkboxes dans "Reponse_user"
4. Restaurer l'état sauvegardé

### Gestion des checkboxes

1. Clic sur checkbox → décocher toutes les autres
2. Sauvegarder l'état dans localStorage
3. Synchroniser avec dev.js/IndexedDB

## 🐛 Dépannage

### Les checkboxes ne s'affichent pas

- Vérifiez que les noms de colonnes correspondent aux variations acceptées
- Vérifiez que la table a la classe CSS ClaraVerse
- Ouvrez la console pour voir les logs

### Les checkboxes ne sont pas persistantes

- Vérifiez que localStorage est activé
- Vérifiez que dev.js est chargé
- Vérifiez les logs de synchronisation

### Les colonnes ne sont pas masquées

- Vérifiez les noms de colonnes (sensible à la casse)
- Vérifiez que la table est détectée comme table CIA

## 📝 Logs

Le système affiche des logs détaillés dans la console:

```
✅ menu.js détecté, initialisation des extensions CIA
🎓 Initialisation des extensions CIA pour menu.js
🎓 2 table(s) CIA détectée(s) et configurée(s)
👁️ Colonnes CIA et Remarques masquées
🔗 Cellules Question et Ref_question fusionnées
✅ Checkboxes CIA configurées
✅ État des checkboxes CIA restauré
💾 État des checkboxes CIA sauvegardé
```

## 🚀 Intégration dans ClaraVerse

### Dans index.html

Ajoutez après le chargement de menu.js:

```html
<script src="public/menu.js"></script>
<script src="public/menu_alpha_simple.js"></script>
```

### Avec Flowise

Les tables générées par Flowise sont automatiquement détectées et configurées si elles contiennent les colonnes CIA.

## 📚 Ressources

- `menu.js` - Menu contextuel de base
- `menu_alpha_simple.js` - Extension CIA
- `test-menu-alpha-cia.html` - Page de test
- `dev.js` - Système de persistance IndexedDB

## ✅ Checklist d'intégration

- [ ] menu.js est chargé
- [ ] menu_alpha_simple.js est chargé après menu.js
- [ ] dev.js est chargé (pour persistance complète)
- [ ] Les tables ont les colonnes CIA correctes
- [ ] Les tables ont les classes CSS ClaraVerse
- [ ] localStorage est activé
- [ ] Les logs s'affichent dans la console

## 🎉 Résultat

Une fois intégré, les questionnaires CIA auront:
- ✅ Colonnes sensibles masquées automatiquement
- ✅ Questions fusionnées pour meilleure lisibilité
- ✅ Checkboxes interactives et persistantes
- ✅ Sauvegarde automatique après actualisation
- ✅ Intégration transparente avec menu.js

## 📞 Support

Pour toute question ou problème, consultez les logs de la console et vérifiez que toutes les dépendances sont chargées correctement.
