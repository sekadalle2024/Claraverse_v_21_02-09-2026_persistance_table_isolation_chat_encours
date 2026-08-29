# 🔍 Diagnostic - N8N Renvoie une Réponse Vide

## ✅ Ce qui Fonctionne

- ✅ Connexion à n8n : **OK** (Status 200)
- ✅ Envoi des données : **OK**
- ✅ n8n reçoit les données : **OK**

## ❌ Le Problème

**n8n renvoie une réponse vide (0 caractères)**

Cela signifie que le workflow n8n :
1. Reçoit bien les données
2. Mais ne les traite pas correctement
3. Ou ne renvoie pas de réponse

---

## 🎯 Actions à Faire dans n8n

### 1. Vérifier que le Workflow est Activé

1. Ouvrez n8n : `http://localhost:5678`
2. Allez dans votre workflow "htlm_processor"
3. Vérifiez qu'il est **ACTIVÉ** (toggle en haut à droite)

### 2. Vérifier les Exécutions

1. Dans n8n, cliquez sur "Executions" (en haut)
2. Vous devriez voir vos 3 tests récents
3. Cliquez sur une exécution pour voir les détails
4. Vérifiez :
   - ✅ Le webhook a-t-il reçu les données ?
   - ❌ Y a-t-il une erreur dans un nœud ?
   - ❌ Le workflow s'arrête-t-il quelque part ?

### 3. Vérifier le Nœud Webhook

Le webhook doit être configuré pour :
- **Path** : `htlm_processor`
- **Method** : POST
- **Response Mode** : "When Last Node Finishes"
- **Response Data** : "First Entry JSON"

### 4. Vérifier le Dernier Nœud

Le dernier nœud du workflow doit renvoyer des données. Par exemple :

```json
{
  "output": "Données traitées",
  "tables": "...",
  "success": true
}
```

---

## 🔧 Solution Rapide - Workflow n8n Minimal

Voici un workflow n8n minimal qui fonctionne :

### Configuration du Webhook

```
Webhook Node:
- HTTP Method: POST
- Path: htlm_processor
- Response Mode: When Last Node Finishes
- Response Data: First Entry JSON
```

### Nœud de Traitement (Function)

```javascript
// Récupérer les données du webhook
const question = $input.item.json.body.question || $input.item.json.question;

// Traiter (exemple simple)
const response = {
  success: true,
  received: question ? question.length : 0,
  message: "Données reçues et traitées",
  timestamp: new Date().toISOString()
};

return { json: response };
```

### Nœud de Réponse (Respond to Webhook)

```
Respond to Webhook Node:
- Response Code: 200
- Response Body: {{ $json }}
```

---

## 🧪 Test du Workflow n8n

### Test 1 : Webhook Seul

Dans n8n, testez le webhook avec ce payload :

```json
{
  "question": "Test simple"
}
```

**Résultat attendu** : Le webhook doit recevoir les données

### Test 2 : Workflow Complet

Exécutez le workflow manuellement et vérifiez que chaque nœud fonctionne.

---

## 📊 Vérifier les Logs n8n

Dans le terminal où n8n tourne, vous devriez voir :

```
Webhook received POST request to /webhook/htlm_processor
Workflow execution started
Workflow execution completed
```

Si vous voyez des erreurs, elles indiqueront le problème.

---

## 🎯 Workflow n8n Recommandé pour Flowise

```
1. Webhook (Trigger)
   ↓
2. Function (Extraire les données)
   ↓
3. HTTP Request (Appeler votre LLM/API)
   ↓
4. Function (Formater la réponse)
   ↓
5. Respond to Webhook (Renvoyer la réponse)
```

---

## 💡 Exemple de Workflow Complet

### Nœud 1 : Webhook
- Path: `htlm_processor`
- Method: POST

### Nœud 2 : Function (Extraire)
```javascript
const question = $input.item.json.body.question || $input.item.json.question;

return {
  json: {
    question: question,
    timestamp: new Date().toISOString()
  }
};
```

### Nœud 3 : HTTP Request (Optionnel - Appeler un LLM)
```
Method: POST
URL: https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body:
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.question }}"
    }
  ]
}
```

### Nœud 4 : Function (Formater)
```javascript
const response = $input.item.json;

return {
  json: {
    success: true,
    data: response,
    processed_at: new Date().toISOString()
  }
};
```

### Nœud 5 : Respond to Webhook
- Response Code: 200
- Response Body: `{{ $json }}`

---

## 🚨 Problèmes Courants

### Problème 1 : Workflow Non Activé
**Solution** : Activez le workflow (toggle en haut à droite)

### Problème 2 : Pas de Nœud "Respond to Webhook"
**Solution** : Ajoutez un nœud "Respond to Webhook" à la fin

### Problème 3 : Erreur dans un Nœud
**Solution** : Vérifiez les exécutions pour voir où ça bloque

### Problème 4 : Timeout
**Solution** : Vérifiez que le workflow se termine rapidement

---

## 🎯 Action Immédiate

1. **Ouvrez n8n** : `http://localhost:5678`
2. **Allez dans "Executions"**
3. **Cliquez sur la dernière exécution**
4. **Vérifiez** :
   - Le webhook a-t-il reçu les données ?
   - Y a-t-il une erreur ?
   - Le workflow se termine-t-il ?

5. **Partagez** :
   - Une capture d'écran de l'exécution
   - Les erreurs éventuelles
   - La configuration de votre workflow

Cela me permettra de vous aider précisément ! 🎯
