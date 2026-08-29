# 🔧 Solution: Support du Format N8N "Programme de Travail"

## 📋 Problème Identifié

Le workflow n8n "Programme de travail" retourne un format de réponse différent que Flowise.js ne reconnaît pas correctement:

```json
[{
  "response": {
    "body": [{
      "output": "| Rubrique | Description |\n...",
      "status": "success",
      "timestamp": "2025-12-03T21:11:47.130Z",
      "contentLength": 19372
    }],
    "headers": {
      "content-type": "application/json",
      "access-control-allow-origin": "*"
    },
    "statusCode": 200
  }
}]
```

## ✅ Solution Appliquée

### 1. Fonction `normalizeN8nResponse` Améliorée

La fonction a été mise à jour pour détecter et traiter ce nouveau format avec des logs détaillés:

```javascript
// Détection du format response.body[0].output
if (firstItem && typeof firstItem === 'object' && 'response' in firstItem) {
  if (firstItem.response && 'body' in firstItem.response) {
    const body = firstItem.response.body;
    if (Array.isArray(body) && body.length > 0 && body[0].output) {
      console.log("✅ FORMAT DÉTECTÉ: Webhook htlm_processor");
      return {
        output: body[0].output,
        metadata: {
          status: body[0].status,
          timestamp: body[0].timestamp,
          contentLength: body[0].output?.length || 0,
          headers: firstItem.response.headers,
          statusCode: firstItem.response.statusCode
        }
      };
    }
  }
}
```

### 2. Logs de Diagnostic Ajoutés

Des logs détaillés ont été ajoutés à chaque étape:

- ✅ Type de réponse (Array/Object)
- ✅ Structure complète de la réponse
- ✅ Détection de chaque niveau (response → body → output)
- ✅ Longueur et aperçu de l'output
- ✅ Métadonnées (status, timestamp, headers)

## 🧪 Tests Disponibles

### Test 1: Page HTML de Diagnostic

Ouvrez dans votre navigateur:
```
http://localhost:5173/test-n8n-programme-travail.html
```

Cette page permet de:
- ✅ Tester la connexion à l'endpoint n8n
- ✅ Envoyer des données simulées "Programme de travail"
- ✅ Voir la structure exacte de la réponse
- ✅ Tester la normalisation

### Test 2: Patch JavaScript

Si vous voulez patcher Flowise.js sans recharger:

1. Ouvrez la console du navigateur (F12)
2. Chargez le script de patch:
```javascript
// Créer un script tag
const script = document.createElement('script');
script.src = '/patch-flowise-n8n-response.js';
document.head.appendChild(script);
```

3. Attendez 2 secondes, le patch s'applique automatiquement

### Test 3: Console du Navigateur

Testez directement dans la console:

```javascript
// Test de connexion
await window.ClaraverseN8nV17.testN8nConnection();

// Voir le cache
window.ClaraverseN8nV17.getCacheInfo();

// Forcer un nouveau scan
window.ClaraverseN8nV17.scanAndProcess();
```

## 📊 Logs à Surveiller

Quand vous testez avec une table "Programme de travail", vous devriez voir dans la console:

```
🔍 ========== NORMALISATION RÉPONSE N8N ==========
📦 Type de réponse: Array
✅ Réponse est un Array avec 1 élément(s)
📦 Premier élément - Type: object
📦 Premier élément - Clés: response
🔍 Détection du format response.body...
📦 firstItem.response - Type: object
📦 firstItem.response - Clés: body, headers, statusCode
📦 Body détecté - Type: Array[1]
📦 Body[0] - Type: object
📦 Body[0] - Clés: output, status, timestamp, contentLength
📦 Body[0].output existe? true
📦 Body[0].output - Type: string
📦 Body[0].output - Longueur: 19372
✅ ✅ ✅ FORMAT DÉTECTÉ: Webhook htlm_processor (response.body[0].output)
📊 Status: success
📋 Content length: 19372
```

## 🔍 Diagnostic en Cas de Problème

### Problème 1: "Output vide ou null"

**Cause**: La réponse n8n ne contient pas de données dans `body[0].output`

**Solution**:
1. Vérifiez que le workflow n8n retourne bien des données
2. Testez l'endpoint directement avec curl:
```bash
curl -X POST "https://xomava4845.app.n8n.cloud/webhook/htlm_processor" \
  -H "Content-Type: application/json" \
  -d '{"question":"<table><tr><th>Test</th></tr></table>"}'
```

### Problème 2: "Format de réponse non reconnu"

**Cause**: Le format de la réponse est différent de ce qui est attendu

**Solution**:
1. Ouvrez la console (F12)
2. Regardez les logs détaillés de `normalizeN8nResponse`
3. Copiez la structure complète de la réponse
4. Ajoutez un nouveau cas dans la fonction `normalizeN8nResponse`

### Problème 3: Table "Programme de travail" non détectée

**Cause**: Le mot-clé "Programme de travail" n'est pas dans la colonne "Flowise"

**Solution**:
1. Vérifiez que votre table a bien une colonne "Flowise"
2. Vérifiez que la première ligne contient "Programme de travail"
3. Regardez les logs de `extractDynamicKeyword`:
```
🔍 Extraction du mot-clé dynamique depuis la table Flowise...
📋 En-têtes de la table détectés: ["Flowise"]
✅ Colonne 'Flowise' trouvée à l'index 0
✅ Mot-clé dynamique extrait: "Programme de travail"
```

## 🎯 Critères de Table Dynamiques

Le système détecte automatiquement le mot-clé depuis la table elle-même:

1. **Table déclencheuse** doit avoir:
   - Une colonne "Flowise" (insensible à la casse)
   - Une première ligne avec le mot-clé (ex: "Programme de travail")

2. **Tables de critères** doivent avoir:
   - En-têtes "Rubrique" et "Description"
   - Une cellule contenant le mot-clé dans la première table

3. **Message utilisateur** (optionnel):
   - Doit précéder la table déclencheuse
   - Doit contenir des mots-clés comme: `/`, `[command]`, `[processus]`, etc.

## 📝 Structure Attendue

```html
<!-- Message utilisateur (optionnel) -->
<div class="prose prose-base dark:prose-invert max-w-none">
  <p>[Command] = /Programme de travail - [Processus] = facturation des ventes</p>
</div>

<!-- Table de critères -->
<div class="prose prose-base dark:prose-invert max-w-none">
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
      <tr>
        <td>reference</td>
        <td>Prg-001</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Table déclencheuse -->
<div class="prose prose-base dark:prose-invert max-w-none">
  <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    <thead>
      <tr>
        <th>Flowise</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Programme de travail</td>
      </tr>
    </tbody>
  </table>
</div>
```

## 🚀 Commandes Rapides

### Dans la Console du Navigateur

```javascript
// 1. Vérifier que Flowise.js est chargé
console.log(window.ClaraverseN8nV17.version);

// 2. Tester la connexion n8n
await window.ClaraverseN8nV17.testN8nConnection();

// 3. Forcer un scan des tables
window.ClaraverseN8nV17.scanAndProcess();

// 4. Voir les informations du cache
window.ClaraverseN8nV17.getCacheInfo();

// 5. Effacer le cache
window.ClaraverseN8nV17.clearAllCache();

// 6. Tester la normalisation avec des données de test
const testData = [{
  "response": {
    "body": [{
      "output": "Test output",
      "status": "success"
    }]
  }
}];
window.ClaraverseN8nV17.normalizeN8nResponse(testData);
```

## 📞 Support

Si le problème persiste:

1. ✅ Ouvrez la console (F12)
2. ✅ Reproduisez le problème
3. ✅ Copiez TOUS les logs qui commencent par:
   - `🔍 ========== NORMALISATION`
   - `📡 ========== ÉTAPE 3: ENVOI`
   - `✅ ========== RÉPONSE REÇUE`
4. ✅ Copiez la structure complète de la réponse n8n
5. ✅ Partagez ces informations

## 🎉 Résultat Attendu

Après correction, vous devriez voir:

1. ✅ Les tables "Programme de travail" sont détectées
2. ✅ Les données sont envoyées à n8n
3. ✅ La réponse est normalisée correctement
4. ✅ Les tables markdown sont converties en HTML
5. ✅ Les tables sont affichées dans le chat
6. ✅ La table déclencheuse est supprimée

## 📚 Fichiers Créés

- ✅ `public/patch-flowise-n8n-response.js` - Patch pour corriger Flowise.js
- ✅ `public/test-n8n-programme-travail.html` - Page de test complète
- ✅ `SOLUTION_PROGRAMME_TRAVAIL_N8N.md` - Ce document

## 🔄 Prochaines Étapes

1. Testez avec la page HTML de diagnostic
2. Vérifiez les logs dans la console
3. Si ça fonctionne, le patch est déjà appliqué dans Flowise.js
4. Si ça ne fonctionne pas, partagez les logs complets
