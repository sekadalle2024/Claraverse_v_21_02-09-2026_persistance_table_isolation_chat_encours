# ✅ Log HTML Systématique dans la Console

## 🎯 Modification Appliquée

Le contenu HTML envoyé vers n8n est maintenant **systématiquement loggé dans la console** (pas de popup alert).

## 📋 Changements

### 1. Configuration

**Fichier**: `public/Flowise.js` (ligne ~27)

```javascript
const CONFIG = {
  N8N_ENDPOINT_URL: "https://xomava4845.app.n8n.cloud/webhook/htlm_processor",
  DEBUG_LOG_HTML: true, // ⭐ TOUJOURS activé par défaut (systématique)
  // ...
};
```

### 2. Fonction `logHTMLToConsole`

**Remplace**: `showHTMLAlert` (qui affichait une popup)

**Nouveau comportement**: Log uniquement dans la console

```javascript
function logHTMLToConsole(tablesHTML, targetKeyword) {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("🔍 CONTENU HTML ENVOYÉ VERS N8N");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("");
  console.log("🎯 Mot-clé:", targetKeyword);
  console.log("📊 Taille totale:", tablesHTML.length, "caractères");
  console.log("📡 Endpoint:", CONFIG.N8N_ENDPOINT_URL);
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("📋 CONTENU HTML COMPLET:");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("");
  console.log(tablesHTML);
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("💡 ASTUCE: Clic droit sur le HTML ci-dessus → 'Copy string contents'");
  console.log("💡 Puis testez dans n8n avec curl ou fetch");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("\n");
}
```

### 3. Appel Systématique

**Fichier**: `public/Flowise.js` (dans `queryN8nEndpoint`)

```javascript
const payload = { question: tablesHTML };

// ⭐ LOG SYSTÉMATIQUE: Toujours activé par défaut
if (CONFIG.DEBUG_LOG_HTML) {
  logHTMLToConsole(tablesHTML, targetKeyword);
}
```

### 4. API Publique Mise à Jour

```javascript
window.ClaraverseN8nV17 = {
  // ... autres fonctions ...
  
  // ⭐ NOUVEAU: Activer/désactiver le log (activé par défaut)
  enableHTMLLog: () => {
    CONFIG.DEBUG_LOG_HTML = true;
    console.log('✅ Log HTML activé');
  },
  disableHTMLLog: () => {
    CONFIG.DEBUG_LOG_HTML = false;
    console.log('✅ Log HTML désactivé');
  },
  logHTMLToConsole: logHTMLToConsole,
  
  // ...
};
```

## 🚀 Utilisation

### Par Défaut (Automatique)

**Aucune manipulation nécessaire !**

Le HTML est automatiquement loggé dans la console à chaque envoi vers n8n.

### Ouvrir la Console

1. Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
2. Allez dans l'onglet **Console**
3. Créez une table "Programme de travail"
4. Le HTML s'affiche automatiquement dans la console

### Désactiver (si besoin)

```javascript
// Dans la console (F12)
window.ClaraverseN8nV17.disableHTMLLog();
```

### Réactiver

```javascript
// Dans la console (F12)
window.ClaraverseN8nV17.enableHTMLLog();
```

## 📊 Ce Qui Est Affiché

Dans la console, vous verrez:

```
═══════════════════════════════════════════════════════════════════
🔍 CONTENU HTML ENVOYÉ VERS N8N
═══════════════════════════════════════════════════════════════════

🎯 Mot-clé: Programme de travail
📊 Taille totale: 2543 caractères
📡 Endpoint: https://xomava4845.app.n8n.cloud/webhook/htlm_processor
⏰ Timestamp: 2025-12-03T22:30:45.123Z

═══════════════════════════════════════════════════════════════════
📋 CONTENU HTML COMPLET:
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
💡 ASTUCE: Clic droit sur le HTML ci-dessus → 'Copy string contents'
💡 Puis testez dans n8n avec curl ou fetch
═══════════════════════════════════════════════════════════════════
```

## 💡 Copier le HTML

### Méthode 1: Clic Droit (Recommandé)

1. Clic droit sur le HTML dans la console
2. Sélectionner **"Copy string contents"** ou **"Copier le contenu de la chaîne"**
3. Le HTML est copié dans le presse-papiers

### Méthode 2: Sélection Manuelle

1. Sélectionner le HTML dans la console
2. Ctrl+C (ou Cmd+C sur Mac)

## 🧪 Tester le HTML dans N8N

### Avec Fetch (Console)

```javascript
// Copier le HTML depuis la console
const htmlCopie = '<table>...</table>'; // Coller ici

// Tester
fetch('https://xomava4845.app.n8n.cloud/webhook/htlm_processor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: htmlCopie })
})
.then(r => r.json())
.then(d => console.log('Réponse n8n:', d));
```

### Avec Curl (Terminal)

```bash
curl -X POST "https://xomava4845.app.n8n.cloud/webhook/htlm_processor" \
  -H "Content-Type: application/json" \
  -d '{"question":"<HTML_COPIÉ>"}'
```

## ✅ Avantages

### Par Rapport à l'Alert Popup

1. **✅ Pas de popup intrusive** - Pas besoin de fermer une fenêtre
2. **✅ Toujours disponible** - Reste dans l'historique de la console
3. **✅ Facile à copier** - Clic droit → Copy string contents
4. **✅ Pas de limite de taille** - Affiche tout le HTML
5. **✅ Automatique** - Aucune manipulation nécessaire
6. **✅ Timestamp** - Horodatage de chaque envoi
7. **✅ Historique** - Voir tous les envois précédents

## 🔍 Cas d'Usage

### Cas 1: Vérifier le HTML Envoyé

```
1. Ouvrir la console (F12)
2. Créer une table "Programme de travail"
3. Le HTML s'affiche automatiquement
4. Vérifier que tout est correct
```

### Cas 2: Déboguer un Problème

```
1. Ouvrir la console (F12)
2. Reproduire le problème
3. Voir exactement ce qui est envoyé
4. Copier le HTML et le tester dans n8n
```

### Cas 3: Comparer Plusieurs Envois

```
1. Ouvrir la console (F12)
2. Créer plusieurs tables
3. Comparer les différents HTML dans l'historique
4. Identifier les différences
```

## 🚀 Commandes Rapides

```javascript
// Console du navigateur (F12)

// Désactiver le log (si besoin)
window.ClaraverseN8nV17.disableHTMLLog();

// Réactiver le log
window.ClaraverseN8nV17.enableHTMLLog();

// Vérifier l'état
console.log('Log activé?', window.ClaraverseN8nV17.CONFIG.DEBUG_LOG_HTML);

// Log manuel
const testHTML = '<table>...</table>';
window.ClaraverseN8nV17.logHTMLToConsole(testHTML, 'Test');
```

## 📚 Documentation Associée

- [README_FIX_PROGRAMME_TRAVAIL.md](README_FIX_PROGRAMME_TRAVAIL.md) - Vue d'ensemble
- [SOLUTION_PROGRAMME_TRAVAIL_N8N.md](SOLUTION_PROGRAMME_TRAVAIL_N8N.md) - Documentation technique
- [GUIDE_CORRECTION_WORKFLOW_N8N.md](GUIDE_CORRECTION_WORKFLOW_N8N.md) - Corriger le workflow

---

**Version**: 17.2.0 - Log HTML systématique dans la console

**Date**: 2025-12-03

**Statut**: ✅ Fonctionnalité active par défaut

---

## 🎉 Résumé

Le HTML envoyé vers n8n est maintenant **automatiquement loggé dans la console** à chaque envoi.

**Aucune manipulation nécessaire** - Ouvrez simplement la console (F12) et créez une table !

Bonne chance ! 🚀
