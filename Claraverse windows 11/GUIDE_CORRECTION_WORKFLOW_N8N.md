# 🔧 Guide de Correction du Workflow N8N

## 🎯 Problème

Si votre workflow n8n ne retourne pas de données dans le format attendu, voici comment le corriger.

## ✅ Format Attendu

Le workflow doit retourner:

```json
[{
  "response": {
    "body": [{
      "output": "| Rubrique | Description |\n|----------|-------------|\n| Etape | Programme |\n| reference | Prg-001 |",
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

## 🔍 Diagnostic

### Étape 1: Tester l'Endpoint

```bash
curl -X POST "https://xomava4845.app.n8n.cloud/webhook/htlm_processor" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"question":"<table><tr><th>Rubrique</th><th>Description</th></tr><tr><td>Etape</td><td>Programme de travail</td></tr></table>"}'
```

### Étape 2: Vérifier la Réponse

La réponse doit contenir:
- ✅ Un array avec un objet
- ✅ Une propriété `response`
- ✅ Une propriété `response.body` (array)
- ✅ Une propriété `response.body[0].output` (string)
- ✅ Une propriété `response.body[0].status` ("success")

## 🔧 Correction du Workflow N8N

### Node "Respond to Webhook"

Assurez-vous que le node "Respond to Webhook" est configuré ainsi:

**Respond With**: `Using 'Respond to Webhook' Node`

**Response Body**:
```json
{
  "response": {
    "body": [
      {
        "output": "{{ $json.output }}",
        "status": "{{ $json.status }}",
        "timestamp": "{{ $now }}",
        "contentLength": "{{ $json.output.length }}"
      }
    ],
    "headers": {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, Accept"
    },
    "statusCode": 200
  }
}
```

### Node "Code" (Transformation)

Le node "Code" doit retourner:

```javascript
return [{
  json: {
    output: markdownOutput,  // Votre markdown généré
    status: 'success',
    table_format: 'markdown_tables',
    processing_stats: stats,
    timestamp: new Date().toISOString()
  }
}];
```

## 🧪 Test du Workflow

### Test 1: Webhook Direct

```bash
curl -X POST "https://xomava4845.app.n8n.cloud/webhook/htlm_processor" \
  -H "Content-Type: application/json" \
  -d '{"question":"<table><tr><th>Test</th></tr><tr><td>Connexion</td></tr></table>"}' \
  | jq '.'
```

### Test 2: Vérifier la Structure

```bash
# Vérifier que response existe
curl -X POST "..." -d '{"question":"..."}' | jq '.[] | has("response")'

# Vérifier que body existe
curl -X POST "..." -d '{"question":"..."}' | jq '.[].response | has("body")'

# Vérifier que output existe
curl -X POST "..." -d '{"question":"..."}' | jq '.[].response.body[0] | has("output")'
```

## 📋 Checklist de Vérification

- [ ] Le workflow est actif
- [ ] Le webhook est accessible
- [ ] Le node "Code" retourne des données
- [ ] Le node "Respond to Webhook" est configuré
- [ ] La réponse contient `response.body[0].output`
- [ ] Le status est "success"
- [ ] Les headers CORS sont présents

## 🔄 Alternative: Format Simplifié

Si vous ne pouvez pas modifier le workflow, vous pouvez utiliser un format simplifié:

```json
[{
  "output": "| Rubrique | Description |\n...",
  "status": "success",
  "table_format": "markdown_tables"
}]
```

Ce format est également supporté par `Flowise.js`.

## 📞 Support

Si le problème persiste:

1. Exportez votre workflow n8n
2. Partagez la structure de la réponse
3. Testez avec curl et partagez le résultat
4. Vérifiez les logs n8n

---

**Version**: 17.1.0

**Date**: 2025-12-03

**Statut**: ✅ Guide de correction
