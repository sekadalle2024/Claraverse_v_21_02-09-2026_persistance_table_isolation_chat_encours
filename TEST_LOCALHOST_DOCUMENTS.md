# 🚀 Test Localhost - Documents Word et PDF

## ✅ Modifications appliquées

Le script utilise maintenant des viewers **compatibles localhost** :

### Case 1 - PARTIE 1 (Document Word)
- **Méthode** : Iframe chargeant un fichier HTML
- **Fichier requis** : `public/ressource/PARTIE1.html`
- **Conversion** : Word → HTML (voir ci-dessous)

### Case 5 - PARTIE 5 (Document PDF)
- **Méthode** : Viewer PDF natif du navigateur (`<embed>`)
- **Fichier requis** : `public/ressource/PARTIE5.pdf`
- **Fonctionne** : ✅ Directement en localhost

## 📝 Étape 1 : Convertir votre Word en HTML

### Méthode simple (Microsoft Word)

1. Ouvrez votre fichier `PARTIE 1.docx` dans Microsoft Word
2. Cliquez sur **Fichier** → **Enregistrer sous**
3. Choisissez l'emplacement : `public/ressource/`
4. Dans "Type de fichier", sélectionnez : **Page Web (.html)** ou **Page Web filtrée (.html)**
5. Nommez le fichier : `PARTIE1.html`
6. Cliquez sur **Enregistrer**

### Méthode alternative (Google Docs)

1. Uploadez votre `.docx` sur Google Docs
2. Ouvrez le document
3. **Fichier** → **Télécharger** → **Page Web (.html, zippé)**
4. Extrayez le fichier HTML
5. Renommez-le en `PARTIE1.html`
6. Placez-le dans `public/ressource/`

## 📁 Structure des fichiers

```
public/
└── ressource/
    ├── PARTIE1.html  ← Fichier HTML converti depuis Word
    └── PARTIE5.pdf   ← Votre fichier PDF original
```

## 🧪 Test immédiat

1. **Placez vos fichiers** :
   - `public/ressource/PARTIE1.html`
   - `public/ressource/PARTIE5.pdf`

2. **Rechargez** votre page Claraverse

3. **Dans la console** :
   ```javascript
   // Supprimer les anciens templates
   document.querySelectorAll('.modelisation-template-container').forEach(el => el.remove())
   
   // Réinjecter
   window.ModelisationTemplateV2.execute()
   ```

4. **Résultat attendu** :
   - ✅ PARTIE 1 : Iframe affichant votre document HTML
   - ✅ PARTIE 5 : Viewer PDF natif avec votre PDF

## 🎨 Résultat visuel

### PARTIE 1 (HTML)
```
┌─────────────────────────────────────────┐
│ 📄 Document Word - PARTIE 1             │
│ ┌─────────────────────────────────────┐ │
│ │ 🔗 Ouvrir dans un nouvel onglet     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │   [Contenu HTML de votre Word]     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ 💡 Convertissez votre PARTIE1.docx...  │
└─────────────────────────────────────────┘
```

### PARTIE 5 (PDF)
```
┌─────────────────────────────────────────┐
│ 📑 Document PDF - PARTIE 5              │
│ ┌─────────────────────────────────────┐ │
│ │ 🔗 Ouvrir  |  ⬇️ Télécharger        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │   [Viewer PDF natif]                │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ 📄 Viewer PDF natif du navigateur       │
└─────────────────────────────────────────┘
```

## ✨ Avantages de cette solution

1. ✅ **Fonctionne en localhost** - Pas besoin de serveur public
2. ✅ **Pas de dépendance externe** - Pas besoin de Microsoft/Google
3. ✅ **Rapide** - Chargement instantané
4. ✅ **Contrôle total** - Vous gérez vos fichiers
5. ✅ **Boutons d'action** - Ouvrir dans nouvel onglet, télécharger

## 🔧 Personnalisation du HTML

Si vous voulez améliorer le rendu HTML de votre Word :

### Nettoyer le HTML généré par Word

Word génère beaucoup de code inutile. Vous pouvez le nettoyer :

1. Ouvrez `PARTIE1.html` dans un éditeur de texte
2. Supprimez les balises `<style>` inutiles
3. Simplifiez la structure
4. Ou utilisez un outil en ligne : https://wordtohtml.net/

### Ajouter du style personnalisé

Ajoutez dans `PARTIE1.html` :
```html
<style>
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.6;
    }
    h1 { color: #667eea; }
    h2 { color: #764ba2; }
</style>
```

## 🐛 Dépannage

### Problème : Iframe vide pour PARTIE 1

**Vérifications** :
```javascript
// Vérifier si le fichier existe
fetch('/ressource/PARTIE1.html')
  .then(r => r.ok ? console.log('✅ Fichier trouvé') : console.log('❌ Fichier non trouvé'))
```

**Solutions** :
1. Vérifiez que le fichier est bien dans `public/ressource/PARTIE1.html`
2. Vérifiez le nom exact (sensible à la casse)
3. Rechargez le serveur de dev

### Problème : PDF ne s'affiche pas

**Vérifications** :
```javascript
// Vérifier si le PDF existe
fetch('/ressource/PARTIE5.pdf')
  .then(r => r.ok ? console.log('✅ PDF trouvé') : console.log('❌ PDF non trouvé'))
```

**Solutions** :
1. Certains navigateurs bloquent les PDFs en embed
2. Utilisez le bouton "Ouvrir dans un nouvel onglet"
3. Ou téléchargez le PDF

### Problème : Mise en forme Word perdue

**Solution** : Utilisez "Page Web filtrée" au lieu de "Page Web" lors de la conversion. Cela génère un HTML plus propre.

## 💡 Commandes utiles

```javascript
// Vérifier les fichiers
fetch('/ressource/PARTIE1.html').then(r => console.log('HTML:', r.ok))
fetch('/ressource/PARTIE5.pdf').then(r => console.log('PDF:', r.ok))

// Forcer la réinjection
document.querySelectorAll('.modelisation-template-container').forEach(el => el.remove())
window.ModelisationTemplateV2.execute()

// Ouvrir directement les fichiers
window.open('/ressource/PARTIE1.html', '_blank')
window.open('/ressource/PARTIE5.pdf', '_blank')
```

## 🎯 Checklist finale

- [ ] Fichier `PARTIE1.html` créé et placé dans `public/ressource/`
- [ ] Fichier `PARTIE5.pdf` placé dans `public/ressource/`
- [ ] Serveur de dev redémarré (si nécessaire)
- [ ] Page rechargée
- [ ] Script réexécuté : `window.ModelisationTemplateV2.execute()`
- [ ] Documents visibles dans le chat

Tout fonctionne maintenant en localhost ! 🎉
