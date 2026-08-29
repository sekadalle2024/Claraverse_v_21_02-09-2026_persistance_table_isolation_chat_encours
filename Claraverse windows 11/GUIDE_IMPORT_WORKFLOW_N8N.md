# 📥 Guide d'Import du Workflow n8n

## 🎯 Objectif

Importer un workflow n8n minimal qui fonctionne pour recevoir les données de Flowise.js

---

## 📋 Étapes d'Import

### 1. Ouvrir n8n

Allez sur : `http://localhost:5678`

### 2. Créer un Nouveau Workflow

1. Cliquez sur le bouton **"+"** (Nouveau workflow) en haut à gauche
2. Ou allez dans **Workflows** → **Add Workflow**

### 3. Importer le JSON

1. Cliquez sur les **3 points** (⋮) en haut à droite
2. Sélectionnez **"Import from File"**
3. Choisissez le fichier : `n8n-workflow-htlm-processor-minimal.json`
4. Cliquez sur **"Import"**

### 4. Activer le Workflow

1. En haut à droite, activez le toggle **"Active"**
2. Le workflow est maintenant en écoute !

---

## 🔍 Vérifier que ça Fonctionne

### Test 1 : Dans n8n

1. Cliquez sur le nœud **"Webhook"**
2. Vous verrez l'URL du webhook : `http://localhost:5678/webhook/htlm_processor`
3. Cliquez sur **"Listen for Test Event"**
4. Dans un autre onglet, ouvrez : `http://localhost:3000/test-envoi-n8n-complet.html`
5. Cliquez sur **"3️⃣ Envoi Complet"**
6. Retournez dans n8n → Vous devriez voir les données reçues !

### Test 2 : Vérifier la Réponse

1. Ouvrez : `http://localhost:3000/test-envoi-n8n-complet.html`
2. Cliquez sur **"3️⃣ Envoi Complet"**
3. Vous devriez maintenant voir une **réponse JSON** dans la console :

```json
{
  "success": true,
  "message": "Données reçues et traitées avec succès",
  "data": {
    "tables_received": 3,
    "size_kb": "1.41",
    "processed_at": "2024-12-03T17:15:00.000Z"
  },
  "html_response": "<div>...</div>"
}
```

---

## 📊 Structure du Workflow

Le workflow contient 4 nœuds :

```
1. Webhook (Trigger)
   ↓ Reçoit les données POST
   
2. Extract Data (Function)
   ↓ Extrait et analyse les données
   
3. Process Data (Function)
   ↓ Traite et formate la réponse
   
4. Respond to Webhook
   ↓ Renvoie la réponse au client
```

---

## 🔧 Personnaliser le Workflow

### Modifier le Traitement

Éditez le nœud **"Process Data"** pour personnaliser la réponse :

```javascript
const data = $input.item.json;

// Votre logique de traitement ici
const response = {
  success: true,
  message: 'Votre message personnalisé',
  data: {
    // Vos données
  }
};

return { json: response };
```

### Ajouter un Appel API

Ajoutez un nœud **"HTTP Request"** entre "Extract Data" et "Process Data" pour appeler un LLM :

```
Method: POST
URL: https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
Body:
{
  "model": "gpt-4",
  "messages": [{"role": "user", "content": "{{ $json.question }}"}]
}
```

---

## 🚨 Dépannage

### Problème : "Workflow not found"

**Solution** : Vérifiez que le workflow est bien activé (toggle "Active")

### Problème : "Webhook not responding"

**Solution** : 
1. Vérifiez que n8n tourne sur le port 5678
2. Vérifiez que le path est bien "htlm_processor"
3. Redémarrez n8n

### Problème : "Execution failed"

**Solution** :
1. Allez dans **Executions**
2. Cliquez sur l'exécution échouée
3. Regardez quel nœud a échoué
4. Vérifiez les logs de ce nœud

---

## 📞 Vérification Finale

Après l'import, testez avec :

```bash
curl -X POST http://localhost:5678/webhook/htlm_processor \
  -H "Content-Type: application/json" \
  -d '{"question":"<table><tr><td>Test</td></tr></table>"}'
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Données reçues et traitées avec succès",
  "data": {
    "tables_received": 1,
    "size_kb": "0.04",
    "processed_at": "..."
  }
}
```

---

## 🎯 Prochaine Étape

Une fois le workflow importé et testé :

1. Testez avec Flowise.js dans votre application
2. Vérifiez que vous recevez maintenant une réponse
3. Personnalisez le traitement selon vos besoins

Le workflow est maintenant prêt à recevoir et traiter les données de Flowise.js ! 🚀
