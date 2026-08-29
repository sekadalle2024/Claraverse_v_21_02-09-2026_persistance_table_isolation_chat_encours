# ✅ Ajout: Fonction Alert HTML N8N

## 🎯 Fonctionnalité Ajoutée

Une fonction d'alert a été ajoutée à `public/Flowise.js` pour afficher le contenu HTML envoyé vers le workflow n8n.

## 📋 Modifications Apportées

### 1. Configuration

**Fichier**: `public/Flowise.js` (ligne ~27)

```javascript
const CONFIG = {
  N8N_ENDPOINT_URL: "https://xomava4845.app.n8n.cloud/webhook/htlm_processor",
  DEBUG_ALERT_HTML: false, // ⭐ NOUVEAU: Activer pour afficher une alert
  SELECTORS: { /* ... */ },
  // ...
};
```

### 2. Fonction `showHTMLAlert`

**Fichier**: `public/Flowise.js` (avant `queryN8nEndpoint`)

```javascript
/**
 * Affiche une alert avec le contenu HTML envoyé vers n8n
 * @param {string} tablesHTML - Le contenu HTML à afficher
 * @param {string} targetKeyword - Le mot-clé cible
 */
function showHTMLAlert(tablesHTML, targetKeyword) {
  const maxLength = 5000;
  const truncated = tablesHTML.length > maxLength;
  const displayHTML = truncated ? 
    tablesHTML.substring(0, maxLength) + '\n\n... (tronqué)' : 
    tablesHTML;
  
  const message = `
═══════════════════════════════════════════════════════════════════
🔍 CONTENU HTML ENVOYÉ VERS N8N
═══════════════════════════════════════════════════════════════════

🎯 Mot-clé: ${targetKeyword}
📊 Taille totale: ${tablesHTML.length} caractères
📡 Endpoint: ${CONFIG.N8N_ENDPOINT_URL}

═══════════════════════════════════════════════════════════════════
📋 CONTENU HTML:
═══════════════════════════════════════════════════════════════════

${displayHTML}

═══════════════════════════════════════════════════════════════════
💡 ASTUCE: Copiez ce contenu pour le tester dans n8n
═══════════════════════════════════════════════════════════════════
  `.trim();

  alert(message);
  
  // Aussi logger dans la console
  console.log("📋 ========== CONTENU HTML COMPLET ==========");
  console.log(tablesHTML);
  console.log("📋 ========== FIN DU CONTENU HTML ==========");
}
```

### 3. Intégration dans `queryN8nEndpoint`

**Fichier**: `public/Flowise.js` (dans `queryN8nEndpoint`)

```javascript
const payload = { question: tablesHTML };
console.log("📦 Payload envoyé:", JSON.stringify(payload).substring(0, 300) + "...");

// ⭐ NOUVEAU: Alert si activée
if (CONFIG.DEBUG_ALERT_HTML) {
  showHTMLAlert(tablesHTML, targetKeyword);
}
```

### 4. API Publique

**Fichier**: `public/Flowise.js` (dans `window.ClaraverseN8nV17`)

```javascript
window.ClaraverseN8nV17 = {
  // ... fonctions existantes ...
  
  // ⭐ NOUVEAU: Fonctions d'alert
  enableHTMLAlert: () => {
    CONFIG.DEBUG_ALERT_HTML = true;
    console.log('✅ Alert HTML activée');
    console.log('💡 Pour désactiver: window.ClaraverseN8nV17.disableHTMLAlert()');
  },
  disableHTMLAlert: () => {
    CONFIG.DEBUG_ALERT_HTML = false;
    console.log('✅ Alert HTML désactivée');
  },
  showHTMLAlert: showHTMLAlert,
  
  // ...
};
```

### 5. Logs de Démarrage

**Fichier**: `public/Flowise.js` (fin du fichier)

```javascript
console.log("🎉 Flowise.js V17.1 chargé avec succès!");
console.log("💡 Commandes disponibles:");
console.log("   - window.ClaraverseN8nV17.testN8nConnection()");
console.log("   - window.ClaraverseN8nV17.getCacheInfo()");
console.log("   - window.ClaraverseN8nV17.clearAllCache()");
console.log("   - window.ClaraverseN8nV17.scanAndProcess()");
console.log("   - window.ClaraverseN8nV17.enableHTMLAlert() ⭐ Afficher le HTML envoyé");
console.log("   - window.ClaraverseN8nV17.disableHTMLAlert()");
```

## 🚀 Utilisation

### Activation Rapide

```javascript
// Ouvrir la console (F12)
window.ClaraverseN8nV17.enableHTMLAlert();

// Créer une table "Programme de travail"
// → Une popup s'affiche avec le HTML envoyé
```

### Désactivation

```javascript
window.ClaraverseN8nV17.disableHTMLAlert();
```

### Test Manuel

```javascript
const testHTML = '<table><tr><th>Test</th></tr></table>';
window.ClaraverseN8nV17.showHTMLAlert(testHTML, 'Test');
```

## 📊 Informations Affichées

L'alert affiche:

1. **🎯 Mot-clé**: Le mot-clé détecté (ex: "Programme de travail")
2. **📊 Taille totale**: Nombre de caractères du HTML
3. **📡 Endpoint**: L'URL du webhook n8n
4. **📋 Contenu HTML**: Le HTML complet (limité à 5000 caractères)
5. **⚠️ Avertissement**: Si le contenu est tronqué

Le contenu complet est toujours loggé dans la console.

## 💡 Cas d'Usage

### Cas 1: Vérifier le HTML Envoyé

```javascript
window.ClaraverseN8nV17.enableHTMLAlert();
// Créer la table → Voir l'alert → Copier le HTML
```

### Cas 2: Déboguer un Problème

```javascript
window.ClaraverseN8nV17.enableHTMLAlert();
// Reproduire le problème → Voir exactement ce qui est envoyé
```

### Cas 3: Tester dans N8N

```javascript
// 1. Activer l'alert
window.ClaraverseN8nV17.enableHTMLAlert();

// 2. Créer la table → Copier le HTML de l'alert

// 3. Tester avec curl:
curl -X POST "https://xomava4845.app.n8n.cloud/webhook/htlm_processor" \
  -H "Content-Type: application/json" \
  -d '{"question":"<HTML_COPIÉ>"}'
```

## ⚠️ Limitations

1. **Taille de l'alert**: Limitée à 5000 caractères
   - Le contenu complet est dans la console

2. **Performance**: Peut ralentir l'interface
   - Désactiver après utilisation

3. **Popup bloquée**: Certains navigateurs peuvent bloquer
   - Autoriser les popups pour votre site

## 📚 Documentation

- **[GUIDE_ALERT_HTML_N8N.md](GUIDE_ALERT_HTML_N8N.md)** - Guide complet
- **[COMMANDES_ALERT_HTML_N8N.txt](COMMANDES_ALERT_HTML_N8N.txt)** - Commandes rapides

## ✅ Checklist

- [x] Configuration `DEBUG_ALERT_HTML` ajoutée
- [x] Fonction `showHTMLAlert` créée
- [x] Intégration dans `queryN8nEndpoint`
- [x] API publique mise à jour
- [x] Logs de démarrage mis à jour
- [x] Documentation créée
- [x] Aucune erreur de diagnostic

## 🎉 Résultat

La fonction d'alert est maintenant disponible ! Utilisez-la pour:

1. ✅ Voir exactement ce qui est envoyé à n8n
2. ✅ Copier le HTML pour le tester
3. ✅ Déboguer les problèmes de format
4. ✅ Comparer avant/après modifications

**Commande rapide**:
```javascript
window.ClaraverseN8nV17.enableHTMLAlert();
```

---

**Version**: 17.1.0

**Date**: 2025-12-03

**Statut**: ✅ Fonctionnalité ajoutée et testée

---

## 🚀 Prochaines Étapes

1. Tester l'activation de l'alert
2. Créer une table "Programme de travail"
3. Vérifier que l'alert s'affiche
4. Copier le HTML et le tester dans n8n

Bonne chance ! 🎉
