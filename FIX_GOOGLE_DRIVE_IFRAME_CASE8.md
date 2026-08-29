# 🔧 FIX - Google Drive Case 8 : Utilisation d'iframe

## ❌ Problème

**Erreur** : `docs.google.com refused to connect`

**Cause** : Google Drive bloque les requêtes fetch directes (politique CORS)

## ✅ Solution

Utiliser un **iframe** au lieu de fetch pour afficher le document Google Drive.

## 🔄 Modifications Appliquées

### Avant (fetch - ne fonctionne pas)
```javascript
fetch(exportUrl)
    .then(response => response.text())
    .then(html => { /* ... */ });
```

### Après (iframe - fonctionne)
```javascript
<iframe src="${viewUrl}" style="width: 100%; height: 600px; border: none;"></iframe>
```

## 📝 Détails Techniques

### URL de Visualisation
```
https://docs.google.com/document/d/{DOC_ID}/preview
```

### Avantages de l'iframe
- ✅ Pas de problème CORS
- ✅ Affichage natif Google Docs
- ✅ Fonctionnalités de navigation intégrées
- ✅ Responsive et adaptatif

## 🎨 Implémentation

Le Case 8 utilise maintenant :
1. **iframe** pour l'affichage du document
2. **Mode preview** de Google Docs
3. **Contrôles** : Ouvrir dans Google Docs, Télécharger
4. **Accordéon** pour une intégration harmonieuse

## 🧪 Test

Créer une table avec :
```html
<table>
  <thead>
    <tr>
      <th>Template</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>n8n_doc</td>
      <td>Document Google Drive</td>
    </tr>
  </tbody>
</table>
```

## ✅ Résultat

Le document Google Drive s'affiche maintenant correctement dans un iframe sans erreur CORS.
