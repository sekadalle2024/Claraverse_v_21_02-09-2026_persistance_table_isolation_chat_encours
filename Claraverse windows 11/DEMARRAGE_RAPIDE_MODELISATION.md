# 🚀 Démarrage Rapide - Modelisation Template

## ❌ Problème: "Rien ne fonctionne"

Vous avez une table avec "Flowise" et "PARTIE 1" mais rien ne s'affiche ?

## ✅ Solution en 3 étapes

### Étape 1: Tester avec la page de test

Ouvrez dans votre navigateur :
```
http://localhost:5173/test-modelisation-simple.html
```

Vous devriez voir :
- ✅ Une table avec "Flowise" et "PARTIE 1"
- ✅ Des logs dans la console
- ✅ Un template injecté après 1 seconde

### Étape 2: Activer le diagnostic

Dans votre application Claraverse, ouvrez la console du navigateur (F12) et tapez :

```javascript
window.ModelisationTemplate.execute()
```

Vous verrez des logs détaillés :
- 📊 Nombre de tables trouvées
- ✅ Détection des mots-clés
- 🎯 Type détecté
- 📍 Injection du template

### Étape 3: Vérifier votre table

Votre table doit contenir :

1. **Le mot "Flowise"** (ou "FLOWISE" ou "flowise") dans n'importe quelle cellule
2. **Le mot "PARTIE 1"** (ou "partie 1" ou "Partie 1") dans n'importe quelle cellule

Exemple de table valide :

| Flowise | Type |
|---------|------|
| PARTIE 1 | Document |

## 🔍 Diagnostic approfondi

Si ça ne fonctionne toujours pas, activez le diagnostic complet :

1. Ouvrez `index.html`
2. Décommentez cette ligne :
```html
<!-- <script src="/diagnostic-modelisation.js"></script> -->
```

3. Rechargez la page
4. Regardez la console, vous verrez un rapport détaillé

## 🐛 Problèmes courants

### Problème 1: "Aucune table trouvée"
**Solution**: Les tables sont chargées dynamiquement. Attendez 2-3 secondes ou exécutez manuellement :
```javascript
window.ModelisationTemplate.execute()
```

### Problème 2: "Table trouvée mais pas de mot-clé Flowise"
**Solution**: Vérifiez l'orthographe exacte. Le script cherche :
- "Flowise" (avec F majuscule)
- "FLOWISE" (tout en majuscules)
- "flowise" (tout en minuscules)

### Problème 3: "Flowise trouvé mais pas de PARTIE"
**Solution**: Assurez-vous que la table contient aussi :
- "PARTIE 1" ou "PARTIE 2" ou "PARTIE 3" etc.
- Avec ou sans majuscules

### Problème 4: "Template déjà injecté"
**Solution**: Le script ne s'exécute qu'une fois. Pour réinjecter :
1. Rechargez la page
2. Ou supprimez l'élément `.modelisation-template-container` du DOM

## 📝 Test manuel dans la console

```javascript
// 1. Vérifier que le script est chargé
console.log(window.ModelisationTemplate);

// 2. Voir la configuration
console.log(window.ModelisationTemplate.config);

// 3. Compter les tables
console.log('Tables:', document.querySelectorAll('table').length);

// 4. Vérifier le contenu des tables
document.querySelectorAll('table').forEach((t, i) => {
    console.log(`Table ${i + 1}:`, t.textContent.substring(0, 100));
});

// 5. Exécuter manuellement
window.ModelisationTemplate.execute();
```

## 🎯 Exemple complet qui fonctionne

Créez une table dans Flowise qui retourne ce HTML :

```html
<table>
    <tr>
        <th>Flowise</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>PARTIE 1</td>
        <td>Guide d'audit</td>
    </tr>
</table>
```

Le script détectera automatiquement :
- ✅ Mot-clé "Flowise" dans l'en-tête
- ✅ Mot-clé "PARTIE 1" dans la cellule
- 🎯 Type: PARTIE1
- 📄 Template: Alpha (format PDF)

## 🔄 Forcer la réexécution

Si vous modifiez une table et voulez réinjecter :

```javascript
// Supprimer l'ancien template
document.querySelector('.modelisation-template-container')?.remove();

// Réexécuter
window.ModelisationTemplate.execute();
```

## 📞 Besoin d'aide ?

1. Ouvrez `public/test-modelisation-simple.html` - ça doit fonctionner
2. Si ça fonctionne là mais pas dans Claraverse, le problème vient du timing
3. Utilisez le diagnostic : `window.ModelisationTemplate.execute()` dans la console
4. Vérifiez les logs avec `CONFIG.debug = true`

## ✨ Ça fonctionne !

Vous devriez voir apparaître :
- Un conteneur avec fond gris
- Des pages de style PDF
- Un titre "E-AUDIT PRO 2.0"
- Du contenu formaté professionnellement

Le template s'injecte **après** la dernière table de la page.
