# 🔍 Guide: Alert HTML Envoyé vers N8N

## 🎯 Fonctionnalité

Une fonction d'alert a été ajoutée à `Flowise.js` pour afficher le contenu HTML envoyé vers le workflow n8n. Ceci est très utile pour le débogage.

## ✅ Activation

### Méthode 1: Via la Console (Recommandé)

```javascript
// Ouvrir la console du navigateur (F12)

// Activer l'alert
window.ClaraverseN8nV17.enableHTMLAlert();

// Maintenant, créez une table "Programme de travail"
// Une popup s'affichera avec le HTML envoyé
```

### Méthode 2: Modification du Code

Dans `public/Flowise.js`, ligne ~27:

```javascript
const CONFIG = {
  N8N_ENDPOINT_URL: "https://xomava4845.app.n8n.cloud/webhook/htlm_processor",
  DEBUG_ALERT_HTML: true, // ⭐ Changer false en true
  // ...
};
```

## 📋 Utilisation

### Étape 1: Activer l'Alert

```javascript
// Dans la console (F12)
window.ClaraverseN8nV17.enableHTMLAlert();
```

**Résultat**:
```
✅ Alert HTML activée - Une popup s'affichera lors du prochain envoi vers n8n
💡 Pour désactiver: window.ClaraverseN8nV17.disableHTMLAlert()
```

### Étape 2: Créer une Table

Créez une table avec:
- Une colonne "Flowise"
- Le mot-clé "Programme de travail" (ou autre)

### Étape 3: Voir l'Alert

Une popup s'affichera avec:

```
═══════════════════════════════════════════════════════════════════
🔍 CONTENU HTML ENVOYÉ VERS N8N
═══════════════════════════════════════════════════════════════════

🎯 Mot-clé: Programme de travail
📊 Taille totale: 2543 caractères
📡 Endpoint: https://xomava4845.app.n8n.cloud/webhook/htlm_processor

═══════════════════════════════════════════════════════════════════
📋 CONTENU HTML:
═══════════════════════════════════════════════════════════════════

<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead>
    <tr>
      <th>Rubrique</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Etape</td>
      <td>Programme de travail</td>
    </tr>
    ...
  </tbody>
</table>

═══════════════════════════════════════════════════════════════════
💡 ASTUCE: Copiez ce contenu pour le tester dans n8n
═══════════════════════════════════════════════════════════════════
```

### Étape 4: Copier le Contenu

Le contenu complet est également loggé dans la console:

```javascript
// Dans la console, vous verrez:
📋 ========== CONTENU HTML COMPLET ==========
<table>...</table>
📋 ========== FIN DU CONTENU HTML ==========
```

Vous pouvez copier ce contenu pour le tester directement dans n8n.

## 🔧 Désactivation

```javascript
// Dans la console (F12)
window.ClaraverseN8nV17.disableHTMLAlert();
```

**Résultat**:
```
✅ Alert HTML désactivée
```

## 🧪 Test Manuel

Vous pouvez aussi afficher manuellement une alert avec du HTML personnalisé:

```javascript
// Dans la console (F12)
const testHTML = '<table><tr><th>Test</th></tr><tr><td>Contenu</td></tr></table>';
window.ClaraverseN8nV17.showHTMLAlert(testHTML, 'Test Manuel');
```

## 📊 Informations Affichées

L'alert affiche:

1. **🎯 Mot-clé**: Le mot-clé détecté (ex: "Programme de travail")
2. **📊 Taille totale**: Nombre de caractères du HTML
3. **📡 Endpoint**: L'URL du webhook n8n
4. **📋 Contenu HTML**: Le HTML complet (limité à 5000 caractères dans l'alert)
5. **⚠️ Avertissement**: Si le contenu est tronqué

## 💡 Cas d'Usage

### Cas 1: Vérifier le HTML Envoyé

```javascript
// Activer l'alert
window.ClaraverseN8nV17.enableHTMLAlert();

// Créer votre table
// L'alert s'affiche automatiquement

// Copier le HTML de l'alert
// Tester dans n8n avec curl:
curl -X POST "https://xomava4845.app.n8n.cloud/webhook/htlm_processor" \
  -H "Content-Type: application/json" \
  -d '{"question":"<HTML_COPIÉ_ICI>"}'
```

### Cas 2: Déboguer un Problème

```javascript
// Activer l'alert
window.ClaraverseN8nV17.enableHTMLAlert();

// Reproduire le problème
// L'alert montre exactement ce qui est envoyé

// Vérifier:
// - Les tables sont-elles toutes présentes?
// - Le format est-il correct?
// - Les données sont-elles complètes?
```

### Cas 3: Comparer Avant/Après

```javascript
// Avant modification
window.ClaraverseN8nV17.enableHTMLAlert();
// Créer la table → Copier le HTML de l'alert

// Après modification
// Créer la table → Comparer avec le HTML précédent
```

## 🚀 Commandes Rapides

```javascript
// Console du navigateur (F12)

// Activer l'alert
window.ClaraverseN8nV17.enableHTMLAlert();

// Désactiver l'alert
window.ClaraverseN8nV17.disableHTMLAlert();

// Test manuel
window.ClaraverseN8nV17.showHTMLAlert('<table>...</table>', 'Test');

// Vérifier l'état
console.log('Alert activée?', window.ClaraverseN8nV17.CONFIG.DEBUG_ALERT_HTML);
```

## ⚠️ Limitations

1. **Taille de l'alert**: Limitée à 5000 caractères
   - Le contenu complet est toujours dans la console
   - Utilisez la console pour copier le HTML complet

2. **Performance**: L'alert peut ralentir l'interface
   - Désactivez-la après utilisation
   - Utilisez uniquement pour le débogage

3. **Popup bloquée**: Certains navigateurs peuvent bloquer l'alert
   - Autorisez les popups pour votre site
   - Utilisez la console comme alternative

## 📝 Exemple Complet

```javascript
// 1. Ouvrir la console (F12)
console.log('🚀 Démarrage du test');

// 2. Activer l'alert
window.ClaraverseN8nV17.enableHTMLAlert();

// 3. Créer une table avec:
//    - Colonne "Flowise"
//    - Mot-clé "Programme de travail"

// 4. L'alert s'affiche automatiquement

// 5. Copier le HTML de l'alert ou de la console

// 6. Tester dans n8n:
const htmlCopie = '<table>...</table>'; // Coller ici
fetch('https://xomava4845.app.n8n.cloud/webhook/htlm_processor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: htmlCopie })
})
.then(r => r.json())
.then(d => console.log('Réponse n8n:', d));

// 7. Désactiver l'alert
window.ClaraverseN8nV17.disableHTMLAlert();
```

## 🔍 Diagnostic

### Problème: L'alert ne s'affiche pas

**Solution 1**: Vérifier que l'alert est activée
```javascript
console.log(window.ClaraverseN8nV17.CONFIG.DEBUG_ALERT_HTML);
// Doit afficher: true
```

**Solution 2**: Vérifier les popups
- Autorisez les popups pour votre site
- Vérifiez la barre d'adresse du navigateur

**Solution 3**: Utiliser la console
```javascript
// Le HTML est toujours loggé dans la console
// Cherchez: "📋 ========== CONTENU HTML COMPLET =========="
```

### Problème: L'alert est tronquée

**Solution**: Utiliser la console
```javascript
// Le contenu complet est dans la console
// Cherchez: "📋 ========== CONTENU HTML COMPLET =========="
// Copiez tout le contenu entre les deux lignes
```

## 📚 Documentation Associée

- [README_FIX_PROGRAMME_TRAVAIL.md](README_FIX_PROGRAMME_TRAVAIL.md) - Vue d'ensemble
- [SOLUTION_PROGRAMME_TRAVAIL_N8N.md](SOLUTION_PROGRAMME_TRAVAIL_N8N.md) - Documentation technique
- [GUIDE_CORRECTION_WORKFLOW_N8N.md](GUIDE_CORRECTION_WORKFLOW_N8N.md) - Corriger le workflow

---

**Version**: 17.1.0

**Date**: 2025-12-03

**Statut**: ✅ Fonctionnalité ajoutée

---

## 🎉 Résumé

L'alert HTML est maintenant disponible ! Utilisez-la pour:

1. ✅ Voir exactement ce qui est envoyé à n8n
2. ✅ Copier le HTML pour le tester
3. ✅ Déboguer les problèmes de format
4. ✅ Comparer avant/après modifications

**Commande rapide**:
```javascript
window.ClaraverseN8nV17.enableHTMLAlert();
```

Bonne chance ! 🚀
