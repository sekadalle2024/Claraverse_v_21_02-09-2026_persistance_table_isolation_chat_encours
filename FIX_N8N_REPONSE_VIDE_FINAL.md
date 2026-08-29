# 🔧 FIX: Erreur n8n "Unexpected end of JSON input"

## 🎯 Problème

L'erreur `Failed to execute 'json' on 'Response': Unexpected end of JSON input` signifie que n8n renvoie une réponse vide ou mal formée.

## ✅ Solution Appliquée

### 1. Amélioration de la Gestion des Erreurs dans Flowise.js

Le code a été modifié pour :
- ✅ Lire la réponse comme texte d'abord (`response.text()`)
- ✅ Vérifier si la réponse est vide
- ✅ Parser le JSON avec gestion d'erreur explicite
- ✅ Afficher des messages d'erreur détaillés

```javascript
// AVANT (problématique)
const responseData = await response.json(); // ❌ Crash si vide

// APRÈS (robuste)
const responseText = await response.text();
if (!responseText || responseText.trim() === '') {
  throw new Error("Réponse n8n vide - vérifiez votre workflow n8n");
}
const responseData = JSON.parse(responseText); // ✅ Avec gestion d'erreur
```

## 🔍 Diagnostic

### Étape 1: Tester la Connexion n8n

Ouvrez dans votre navigateur :
```
public/test-n8n-connection.html
```

Ce fichier vous permet de :
- ✅ Tester votre endpoint n8n
- ✅ Voir la réponse brute (texte)
- ✅ Vérifier si le JSON est valide
- ✅ Diagnostiquer les problèmes CORS

### Étape 2: Vérifier votre Workflow n8n

#### Checklist n8n :

1. **Webhook Node** :
   - ✅ Path: `/webhook/htlm_processor`
   - ✅ Method: POST
   - ✅ Response Mode: "Using 'Respond to Webhook' Node"

2. **Respond to Webhook Node** (CRITIQUE) :
   - ✅ Doit être présent dans le workflow
   - ✅ Response Body: JSON
   - ✅ Doit contenir un champ `output` ou `data`

3. **Format de Réponse Attendu** :

```json
// Format 1: Standard
{
  "output": "contenu markdown avec tables"
}

// Format 2: Array
[
  {
    "output": "contenu markdown"
  }
]

// Format 3: Programme de travail
[
  {
    "data": {
      "etape_mission_Synthese": [...]
    }
  }
]
```

## 🚨 Causes Fréquentes

### 1. Pas de Node "Respond to Webhook"
**Symptôme** : Réponse vide
**Solution** : Ajoutez un node "Respond to Webhook" à la fin de votre workflow

### 2. Mauvais Format de Réponse
**Symptôme** : JSON invalide
**Solution** : Vérifiez que le node retourne un objet JSON valide

### 3. Erreur dans le Workflow
**Symptôme** : Réponse vide ou erreur 500
**Solution** : Vérifiez les logs n8n pour voir où le workflow échoue

### 4. CORS Non Configuré
**Symptôme** : Erreur CORS dans la console
**Solution** : Configurez les headers CORS dans n8n

## 🧪 Tests

### Test 1: Connexion Basique
```bash
# Ouvrir dans le navigateur
public/test-n8n-connection.html
```

### Test 2: Console du Navigateur
```javascript
// Coller dans la console
fetch('https://xomava4845.app.n8n.cloud/webhook/htlm_processor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: '<table><tr><td>Test</td></tr></table>' })
})
.then(r => r.text())
.then(text => console.log('Réponse:', text))
.catch(e => console.error('Erreur:', e));
```

## 📋 Workflow n8n Minimal

Voici un workflow n8n minimal qui fonctionne :

```
1. Webhook (POST /webhook/htlm_processor)
   ↓
2. Code Node (traitement)
   ↓
3. Respond to Webhook
   Response Body: { "output": "{{ $json.result }}" }
```

### Exemple de Code Node :

```javascript
// Dans le Code Node
const input = $input.first().json.question;

// Traitement simple
const result = `# Résultat\n\n| Colonne 1 | Colonne 2 |\n|-----------|----------|\n| Test | OK |`;

return {
  json: {
    output: result
  }
};
```

## 🎯 Vérification Finale

Après avoir appliqué le fix :

1. ✅ Ouvrez la console du navigateur (F12)
2. ✅ Déclenchez une table Flowise
3. ✅ Vérifiez les logs :
   - `📄 Réponse brute (texte):` doit afficher du contenu
   - `📦 Réponse brute n8n:` doit afficher un objet JSON

## 📞 Messages d'Erreur Améliorés

Le code affiche maintenant des erreurs explicites :

- ❌ "Réponse n8n vide - vérifiez votre workflow n8n"
- ❌ "Réponse n8n invalide (pas du JSON): [détails]"
- ❌ "Erreur HTTP 500: Internal Server Error"

## 🔗 Fichiers Modifiés

- ✅ `Flowise.js` - Gestion robuste des réponses
- ✅ `public/test-n8n-connection.html` - Outil de diagnostic

## 💡 Conseils

1. **Toujours tester avec l'outil de diagnostic d'abord**
2. **Vérifier les logs n8n** pour voir les erreurs côté serveur
3. **Utiliser un workflow minimal** pour isoler le problème
4. **Vérifier le format de réponse** avec la console du navigateur

## 🎉 Résultat Attendu

Après le fix, vous devriez voir dans la console :
```
📡 Envoi des données vers n8n...
✅ Données reçues de l'endpoint n8n ! Statut: 200 OK
📄 Réponse brute (texte): {"output":"# Résultat..."}
📦 Réponse brute n8n: {output: "# Résultat..."}
🔥 Réponse n8n normalisée: # Résultat...
✅ 2 table(s) extraite(s) du markdown
🎉 Traitement complet réussi pour "votre-mot-clé"
```
