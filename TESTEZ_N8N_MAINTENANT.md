# 🚀 TESTEZ N8N MAINTENANT

## ⚡ Test Rapide (2 minutes)

### Étape 1: Ouvrir l'Outil de Diagnostic
```
1. Ouvrez votre navigateur
2. Allez sur: public/test-n8n-connection.html
3. Cliquez sur "🚀 Tester la Connexion"
```

### Étape 2: Interpréter les Résultats

#### ✅ Si vous voyez "SUCCÈS" :
Votre n8n fonctionne ! Le problème vient d'ailleurs.

#### ❌ Si vous voyez "Réponse vide" :
**Problème** : Votre workflow n8n ne retourne rien

**Solution** :
1. Ouvrez votre workflow n8n
2. Ajoutez un node "Respond to Webhook" à la fin
3. Configurez-le ainsi :
   ```json
   {
     "output": "{{ $json.result }}"
   }
   ```

#### ❌ Si vous voyez "Réponse non-JSON" :
**Problème** : n8n retourne du texte brut, pas du JSON

**Solution** :
1. Dans le node "Respond to Webhook"
2. Changez "Response Mode" en "JSON"
3. Assurez-vous que le body est un objet JSON valide

#### ❌ Si vous voyez "Erreur CORS" :
**Problème** : n8n bloque les requêtes depuis votre domaine

**Solution** :
1. Dans n8n, allez dans Settings
2. Ajoutez votre domaine aux origines autorisées
3. Ou utilisez `*` pour autoriser tous les domaines (dev uniquement)

## 🔍 Test dans la Console

Ouvrez la console du navigateur (F12) et collez :

```javascript
// Test simple
fetch('https://xomava4845.app.n8n.cloud/webhook/htlm_processor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'test' })
})
.then(r => r.text())
.then(text => {
  console.log('✅ Réponse reçue:', text);
  if (text === '') {
    console.error('❌ PROBLÈME: Réponse vide !');
    console.log('👉 Ajoutez un node "Respond to Webhook" dans n8n');
  } else {
    try {
      const json = JSON.parse(text);
      console.log('✅ JSON valide:', json);
    } catch (e) {
      console.error('❌ PROBLÈME: Pas du JSON !');
      console.log('👉 Configurez le node pour retourner du JSON');
    }
  }
})
.catch(e => {
  console.error('❌ ERREUR:', e.message);
  console.log('👉 Vérifiez l\'URL et les permissions CORS');
});
```

## 📋 Checklist Workflow n8n

Vérifiez que votre workflow contient :

- [ ] **Webhook Node** avec path `/webhook/htlm_processor`
- [ ] **Code Node** ou autre traitement
- [ ] **Respond to Webhook Node** (OBLIGATOIRE !)
- [ ] Format de réponse : `{ "output": "..." }`

## 🎯 Workflow Minimal qui Fonctionne

Si rien ne marche, créez ce workflow minimal :

```
1. Webhook (POST)
   ↓
2. Set Node
   - output: "# Test\n\n| Col1 | Col2 |\n|------|------|\n| A | B |"
   ↓
3. Respond to Webhook
   - Response Body: {{ $json }}
```

## 🔧 Fix Appliqué dans Flowise.js

Le code a été amélioré pour :
- ✅ Détecter les réponses vides
- ✅ Afficher des messages d'erreur clairs
- ✅ Logger la réponse brute pour debug

## 📊 Logs à Vérifier

Dans la console, vous devriez voir :
```
📡 Envoi des données vers n8n...
✅ Données reçues de l'endpoint n8n ! Statut: 200 OK
📄 Réponse brute (texte): {"output":"..."}  ← DOIT AVOIR DU CONTENU
📦 Réponse brute n8n: {output: "..."}
```

Si `📄 Réponse brute (texte):` est vide → Problème dans n8n !

## 💡 Astuce

Testez d'abord avec l'outil de diagnostic avant de tester dans l'application.
Cela vous dira exactement où est le problème.

## 🆘 Toujours Bloqué ?

1. Vérifiez les logs n8n (dans l'interface n8n)
2. Testez le webhook directement avec Postman ou curl
3. Vérifiez que le workflow est activé
4. Vérifiez l'URL (pas de typo)

## 📞 Commandes Utiles

### Test avec curl :
```bash
curl -X POST https://xomava4845.app.n8n.cloud/webhook/htlm_processor \
  -H "Content-Type: application/json" \
  -d '{"question":"test"}'
```

### Test avec PowerShell :
```powershell
Invoke-RestMethod -Uri "https://xomava4845.app.n8n.cloud/webhook/htlm_processor" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"question":"test"}'
```

## ✅ Résultat Attendu

Vous devriez recevoir un JSON comme :
```json
{
  "output": "# Résultat\n\n| Col1 | Col2 |\n|------|------|\n| A | B |"
}
```

Ou :
```json
[
  {
    "output": "contenu markdown"
  }
]
```
