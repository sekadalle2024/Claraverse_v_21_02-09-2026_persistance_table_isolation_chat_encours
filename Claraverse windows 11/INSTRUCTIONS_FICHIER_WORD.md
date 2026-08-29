# 📄 Instructions - Fichier Word de Test

## ⚠️ Problème Actuel

Le dossier `public/ressource/` existe mais est **vide**. Il n'y a pas de fichier `PARTIE1.docx` pour tester la conversion Mammoth.js.

## ✅ Solution Mammoth.js Fonctionnelle

La solution pour le conflit AMD/RequireJS est **prête et fonctionnelle**. Le script `mammoth-loader-fix.js` résout le problème en :

1. Désactivant temporairement `window.define` et `window.require`
2. Chargeant Mammoth.js sans conflit
3. Restaurant le système AMD/RequireJS

## 📋 Pour Tester la Solution

### Option 1: Ajouter un fichier Word existant

1. Placez un fichier Word (`.docx`) dans `public/ressource/`
2. Nommez-le `PARTIE1.docx` (ou modifiez le chemin dans le test)
3. Ouvrez la console et testez :

```javascript
await window.convertWordToHtml('/ressource/PARTIE1.docx')
```

### Option 2: Créer un fichier Word simple

1. Ouvrez Microsoft Word ou LibreOffice
2. Créez un document avec du texte simple :
   ```
   PARTIE 1 - Document de Test
   
   Ceci est un document de test pour valider la conversion Mammoth.js.
   
   Section 1
   - Point 1
   - Point 2
   - Point 3
   
   Section 2
   Le système de modélisation fonctionne correctement.
   ```
3. Enregistrez-le comme `PARTIE1.docx` dans `public/ressource/`

### Option 3: Test avec un autre fichier

Si vous avez déjà un fichier Word ailleurs, testez avec son chemin :

```javascript
// Exemple avec un fichier dans un autre dossier
await window.convertWordToHtml('/chemin/vers/votre/fichier.docx')
```

## 🧪 Test de la Solution (sans fichier)

Vous pouvez quand même vérifier que Mammoth.js se charge correctement :

```javascript
// Dans la console du navigateur
await window.loadMammothSafe()
// ✅ Devrait afficher: "Mammoth.js chargé avec succès (mode sécurisé)"

// Vérifier l'API
console.log(typeof window.mammoth.convertToHtml)
// ✅ Devrait afficher: "function"
```

## 📝 Ce qui a été Résolu

✅ **Conflit AMD/RequireJS** - Plus d'erreur "Can only have one anonymous define call"
✅ **API Mammoth disponible** - `window.mammoth.convertToHtml` est maintenant accessible
✅ **Chargement sécurisé** - Le système AMD est préservé

## 🔄 Prochaines Étapes

Une fois qu'un fichier Word est disponible dans `public/ressource/` :

1. La conversion fonctionnera automatiquement
2. Le système de modélisation détectera les tables avec "Flowise" + "PARTIE X"
3. Les documents Word seront injectés dans les pages de chat

## 💡 Alternative : Test avec URL externe

Si vous voulez tester immédiatement sans fichier local, vous pouvez utiliser un fichier Word hébergé en ligne :

```javascript
await window.convertWordToHtml('https://exemple.com/document.docx')
```

**Note**: Le fichier doit être accessible via CORS.
