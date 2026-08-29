# 🔧 Configuration CORS pour n8n

**Date:** 15 avril 2026

---

## 🎯 Objectif

Configurer correctement les headers CORS dans n8n pour permettre les requêtes depuis le frontend Claraverse.

---

## ❌ Problème CORS

### Symptômes

```
Access to fetch at 'https://hkj0631c.rpcl.app/webhook/template' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Cause

Les headers CORS ne sont pas configurés dans le webhook node de n8n.

---

## ✅ Solution: Configurer les Headers CORS

### Étape 1: Ouvrir le Workflow n8n

1. Aller sur https://hkj0631c.rpcl.app
2. Se connecter
3. Ouvrir le workflow concerné

---

### Étape 2: Configurer le Webhook Node

1. **Cliquer sur le node Webhook**

2. **Aller dans l'onglet "Respond"**

3. **Cliquer sur "Add Option" > "Response Headers"**

4. **Ajouter les headers suivants:**

| Header | Valeur | Description |
|--------|--------|-------------|
| `Access-Control-Allow-Origin` | `*` | Autorise toutes les origines |
| `Access-Control-Allow-Methods` | `POST, OPTIONS, GET` | Méthodes autorisées |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` | Headers autorisés |
| `Access-Control-Max-Age` | `86400` | Cache preflight 24h |

---

### Étape 3: Configuration Détaillée

#### Header 1: Access-Control-Allow-Origin

```
Name: Access-Control-Allow-Origin
Value: *
```

**Note:** Pour plus de sécurité, remplacer `*` par l'URL exacte:
```
Value: http://localhost:5173
```

Ou pour plusieurs origines:
```
Value: http://localhost:5173, https://claraverse.netlify.app
```

---

#### Header 2: Access-Control-Allow-Methods

```
Name: Access-Control-Allow-Methods
Value: POST, OPTIONS, GET
```

**Explication:**
- `POST`: Pour envoyer les requêtes
- `OPTIONS`: Pour les requêtes preflight CORS
- `GET`: Pour les requêtes de polling (si utilisé)

---

#### Header 3: Access-Control-Allow-Headers

```
Name: Access-Control-Allow-Headers
Value: Content-Type, Authorization
```

**Explication:**
- `Content-Type`: Pour envoyer du JSON
- `Authorization`: Pour l'authentification (si nécessaire)

---

#### Header 4: Access-Control-Max-Age

```
Name: Access-Control-Max-Age
Value: 86400
```

**Explication:**
- Cache la réponse preflight pendant 24 heures
- Réduit le nombre de requêtes OPTIONS

---

### Étape 4: Gérer les Requêtes OPTIONS (Preflight)

Les navigateurs envoient une requête OPTIONS avant la requête POST pour vérifier les permissions CORS.

#### Option 1: Répondre automatiquement aux OPTIONS

Dans le webhook node:

1. **Aller dans "Settings"**
2. **Chercher "Allowed Methods"**
3. **Cocher "OPTIONS"**

#### Option 2: Créer un node séparé pour OPTIONS

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "template",
        "httpMethod": "OPTIONS",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Respond to OPTIONS",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "noData",
        "options": {
          "responseHeaders": {
            "entries": [
              {
                "name": "Access-Control-Allow-Origin",
                "value": "*"
              },
              {
                "name": "Access-Control-Allow-Methods",
                "value": "POST, OPTIONS"
              },
              {
                "name": "Access-Control-Allow-Headers",
                "value": "Content-Type"
              }
            ]
          }
        }
      }
    }
  ]
}
```

---

## 🧪 Tester la Configuration CORS

### Test 1: Avec curl

```bash
# Test preflight (OPTIONS)
curl -X OPTIONS https://hkj0631c.rpcl.app/webhook/template \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Résultat attendu:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: POST, OPTIONS
< Access-Control-Allow-Headers: Content-Type
< Access-Control-Max-Age: 86400
```

---

### Test 2: Avec JavaScript

```javascript
// Dans la console du navigateur
fetch('https://hkj0631c.rpcl.app/webhook/template', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ question: 'Test CORS' })
})
.then(response => {
  console.log('✅ CORS fonctionne:', response);
  return response.json();
})
.then(data => console.log('Données:', data))
.catch(error => console.error('❌ Erreur CORS:', error));
```

**Résultat attendu:**
```
✅ CORS fonctionne: Response { status: 200, ... }
Données: { ... }
```

---

## 🔒 Configuration Sécurisée (Production)

### Pour la production, utiliser des origines spécifiques

```
Access-Control-Allow-Origin: https://claraverse.netlify.app
```

### Avec authentification

Si vous utilisez des tokens d'authentification:

```
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

**Important:** Si `Access-Control-Allow-Credentials: true`, vous ne pouvez pas utiliser `*` pour `Access-Control-Allow-Origin`.

---

## 📊 Exemple Complet de Configuration

### Configuration Webhook Node

```json
{
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "template",
    "httpMethod": "POST",
    "responseMode": "responseNode",
    "options": {
      "responseHeaders": {
        "entries": [
          {
            "name": "Access-Control-Allow-Origin",
            "value": "*"
          },
          {
            "name": "Access-Control-Allow-Methods",
            "value": "POST, OPTIONS, GET"
          },
          {
            "name": "Access-Control-Allow-Headers",
            "value": "Content-Type, Authorization"
          },
          {
            "name": "Access-Control-Max-Age",
            "value": "86400"
          }
        ]
      }
    }
  }
}
```

---

## ❌ Erreurs Courantes

### Erreur 1: Wildcard avec Credentials

```
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' 
when the request's credentials mode is 'include'.
```

**Solution:** Utiliser une origine spécifique au lieu de `*`

---

### Erreur 2: Headers Manquants

```
Request header field content-type is not allowed by Access-Control-Allow-Headers in preflight response.
```

**Solution:** Ajouter `Content-Type` dans `Access-Control-Allow-Headers`

---

### Erreur 3: Méthode Non Autorisée

```
Method POST is not allowed by Access-Control-Allow-Methods in preflight response.
```

**Solution:** Ajouter `POST` dans `Access-Control-Allow-Methods`

---

## 🎯 Checklist de Configuration

- [ ] Header `Access-Control-Allow-Origin` configuré
- [ ] Header `Access-Control-Allow-Methods` configuré
- [ ] Header `Access-Control-Allow-Headers` configuré
- [ ] Header `Access-Control-Max-Age` configuré
- [ ] Requêtes OPTIONS gérées
- [ ] Test avec curl réussi
- [ ] Test avec JavaScript réussi
- [ ] Workflow sauvegardé et réactivé

---

## 📝 Script de Test Automatique

```powershell
# test-cors-n8n.ps1

Write-Host "Test CORS n8n" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host ""

$endpoint = "https://hkj0631c.rpcl.app/webhook/template"

# Test 1: OPTIONS (preflight)
Write-Host "Test 1: Requete OPTIONS (preflight)..." -ForegroundColor Yellow
$options = curl -X OPTIONS $endpoint `
  -H "Origin: http://localhost:5173" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: Content-Type" `
  -v 2>&1

if ($options -match "Access-Control-Allow-Origin") {
    Write-Host "   OK: Header Access-Control-Allow-Origin present" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: Header Access-Control-Allow-Origin manquant" -ForegroundColor Red
}

if ($options -match "Access-Control-Allow-Methods") {
    Write-Host "   OK: Header Access-Control-Allow-Methods present" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: Header Access-Control-Allow-Methods manquant" -ForegroundColor Red
}

Write-Host ""

# Test 2: POST avec Origin
Write-Host "Test 2: Requete POST avec Origin..." -ForegroundColor Yellow
$post = curl -X POST $endpoint `
  -H "Content-Type: application/json" `
  -H "Origin: http://localhost:5173" `
  -d '{"question":"Test CORS"}' `
  -v 2>&1

if ($post -match "Access-Control-Allow-Origin") {
    Write-Host "   OK: CORS fonctionne pour POST" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: CORS ne fonctionne pas pour POST" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test termine" -ForegroundColor Cyan
```

---

**Dernière mise à jour:** 15 avril 2026
