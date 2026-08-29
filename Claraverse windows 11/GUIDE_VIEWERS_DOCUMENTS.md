# 📄 Guide - Viewers de Documents

## ✅ Modifications appliquées

Le script utilise maintenant des viewers en ligne pour afficher vos documents :

### Case 1 - PARTIE 1 (Document Word)
- **Viewer** : Microsoft Office Online
- **Fichier** : `public/ressource/PARTIE1.docx`
- **URL** : `https://view.officeapps.live.com/op/embed.aspx`

### Case 5 - PARTIE 5 (Document PDF)
- **Viewer** : Google Docs Viewer
- **Fichier** : `public/ressource/PARTIE5.pdf`
- **URL** : `https://docs.google.com/viewer`

## 📁 Préparation des fichiers

1. **Placez vos fichiers** dans le dossier `public/ressource/` :
   ```
   public/
   └── ressource/
       ├── PARTIE1.docx  ← Votre document Word
       └── PARTIE5.pdf   ← Votre document PDF
   ```

2. **Nommage important** :
   - Le fichier Word DOIT s'appeler exactement `PARTIE1.docx`
   - Le fichier PDF DOIT s'appeler exactement `PARTIE5.pdf`

## 🚀 Test immédiat

1. **Placez vos fichiers** dans `public/ressource/`

2. **Rechargez** votre page Claraverse

3. **Dans la console**, tapez :
   ```javascript
   // Supprimer les anciens templates
   document.querySelectorAll('.modelisation-template-container').forEach(el => el.remove())
   
   // Réinjecter avec les viewers
   window.ModelisationTemplateV2.execute()
   ```

4. **Résultat attendu** :
   - Pour PARTIE 1 : Un viewer Microsoft Office affichant votre document Word
   - Pour PARTIE 5 : Un viewer Google Docs affichant votre PDF

## ⚠️ Limitations des viewers

### Microsoft Office Online Viewer
- ✅ Fonctionne avec : .docx, .xlsx, .pptx
- ⚠️ Le fichier DOIT être accessible publiquement via HTTP
- ⚠️ Ne fonctionne PAS en localhost (nécessite un serveur public)
- 💡 Alternative : Déployez sur un serveur de test ou utilisez ngrok

### Google Docs Viewer
- ✅ Fonctionne avec : .pdf, .doc, .docx, .ppt, .xls
- ⚠️ Le fichier DOIT être accessible publiquement via HTTP
- ⚠️ Ne fonctionne PAS en localhost
- 💡 Alternative : Utilisez un viewer PDF natif du navigateur

## 🔧 Solution pour localhost

Si vous testez en localhost, les viewers externes ne fonctionneront pas. Voici les alternatives :

### Option 1 : Viewer PDF natif (pour PARTIE 5)
```javascript
async function handleCase5(table) {
    const pdfUrl = '/ressource/PARTIE5.pdf';
    return `
        <div style="margin: 40px auto; max-width: 1200px;">
            <h2 style="color: #667eea; margin-bottom: 20px;">📑 PARTIE 5</h2>
            <embed 
                src="${pdfUrl}" 
                type="application/pdf" 
                width="100%" 
                height="800px"
                style="border-radius: 8px;">
        </div>
    `;
}
```

### Option 2 : Convertir Word en HTML
1. Ouvrez `PARTIE1.docx` dans Word
2. Fichier → Enregistrer sous → Format : "Page Web (.html)"
3. Sauvegardez comme `PARTIE1.html` dans `public/ressource/`
4. Modifiez le script pour charger le HTML

### Option 3 : Utiliser ngrok (RECOMMANDÉ pour test)
```bash
# Installer ngrok
npm install -g ngrok

# Exposer votre serveur local
ngrok http 5173

# Utilisez l'URL ngrok fournie
```

## 📊 Exemple de résultat

Quand tout fonctionne, vous verrez :

```
Table Flowise (PARTIE 1)
    ↓
┌─────────────────────────────────────┐
│ 📄 Document Word - PARTIE 1         │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │   [Contenu de votre Word]       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ Viewer Microsoft Office Online      │
└─────────────────────────────────────┘
```

## 🐛 Dépannage

### Problème : "Chargement du document..." reste affiché

**Cause** : Le viewer ne peut pas accéder au fichier

**Solutions** :
1. Vérifiez que le fichier existe dans `public/ressource/`
2. Vérifiez le nom exact du fichier
3. Si en localhost, utilisez une alternative (voir ci-dessus)
4. Déployez sur un serveur public ou utilisez ngrok

### Problème : Iframe vide

**Cause** : Restrictions CORS ou fichier non accessible

**Solutions** :
1. Ouvrez la console (F12) pour voir les erreurs
2. Vérifiez l'URL complète du fichier
3. Testez l'URL directement dans le navigateur

## 💡 Commandes utiles

```javascript
// Voir l'URL complète du fichier Word
console.log(window.location.origin + '/ressource/PARTIE1.docx')

// Voir l'URL complète du fichier PDF
console.log(window.location.origin + '/ressource/PARTIE5.pdf')

// Tester si le fichier est accessible
fetch('/ressource/PARTIE1.docx')
  .then(r => console.log('✅ Fichier accessible'))
  .catch(e => console.log('❌ Fichier non accessible', e))
```

## 🎯 Prochaines étapes

1. Placez vos fichiers dans `public/ressource/`
2. Testez en local avec les alternatives si nécessaire
3. Pour production, déployez sur un serveur public
4. Les viewers fonctionneront automatiquement

Le système est maintenant configuré pour charger vos vrais documents ! 🎉
