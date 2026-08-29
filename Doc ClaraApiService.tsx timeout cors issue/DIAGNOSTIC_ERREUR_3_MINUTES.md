# 🔍 Diagnostic de l'Erreur après 3 Minutes

**Date:** 15 avril 2026

---

## 🎯 Objectif

Identifier pourquoi les requêtes vers n8n échouent après environ 3 minutes, alors que le timeout est configuré à 10 minutes.

---

## 📋 Symptômes

- ❌ Timeout configuré: 10 minutes
- ❌ Erreur observée: après ~3 minutes
- ❌ Message d'erreur: "Failed to fetch" ou "Network error"
- ❌ Pas de réponse du serveur

---

## 🔍 Étape 1: Tester avec curl

### Commande de test

```bash
curl -X POST https://hkj0631c.rpcl.app/webhook/template \
  -H "Content-Type: application/json" \
  -d '{"question":"Test de timeout"}' \
  --max-time 600 \
  -v
```

### Interprétation des résultats

#### Cas 1: curl timeout après 3 minutes
```
* Operation timed out after 180000 milliseconds
```

**Conclusion:** Le problème est côté serveur (n8n ou proxy)

**Actions:**
1. Vérifier les logs n8n
2. Vérifier la configuration du proxy/load balancer
3. Augmenter le timeout côté serveur

---

#### Cas 2: curl fonctionne (réponse après 5-10 minutes)
```
< HTTP/1.1 200 OK
< Content-Type: application/json
...
{"result": "..."}
```

**Conclusion:** Le problème est côté navigateur

**Actions:**
1. Vérifier le timeout du navigateur
2. Implémenter un système de polling
3. Utiliser des webhooks asynchrones

---

#### Cas 3: Erreur CORS
```
< HTTP/1.1 403 Forbidden
< Access-Control-Allow-Origin: (manquant)
```

**Conclusion:** Problème de configuration CORS

**Actions:**
1. Configurer les headers CORS dans n8n
2. Voir le guide CONFIGURATION_N8N_CORS.md

---

## 🔍 Étape 2: Vérifier les Logs n8n

### Accéder aux logs

1. Ouvrir n8n: https://hkj0631c.rpcl.app
2. Aller dans **Executions**
3. Trouver l'exécution correspondante
4. Vérifier la durée d'exécution

### Interprétation

#### Cas 1: Workflow timeout dans n8n
```
Execution failed: Timeout after 180 seconds
```

**Conclusion:** Le timeout est configuré à 3 minutes dans n8n

**Solution:**
1. Ouvrir le workflow dans n8n
2. Aller dans **Settings** > **Timeout**
3. Augmenter à 15 minutes (900 secondes)
4. Sauvegarder et réactiver le workflow

---

#### Cas 2: Workflow s'exécute correctement
```
Execution completed successfully after 8 minutes
```

**Conclusion:** Le problème est dans la communication HTTP

**Solution:**
1. Vérifier les proxies/load balancers
2. Vérifier le timeout du navigateur
3. Implémenter un système de polling

---

## 🔍 Étape 3: Vérifier les Headers CORS

### Test avec curl

```bash
curl -X OPTIONS https://hkj0631c.rpcl.app/webhook/template \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### Headers attendus

```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: POST, OPTIONS
< Access-Control-Allow-Headers: Content-Type
< Access-Control-Max-Age: 86400
```

### Si les headers manquent

**Solution:** Configurer CORS dans n8n (voir CONFIGURATION_N8N_CORS.md)

---

## 🔍 Étape 4: Vérifier le Timeout du Navigateur

### Test dans la console du navigateur

```javascript
// Test 1: Requête simple
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes

fetch('https://hkj0631c.rpcl.app/webhook/template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'Test' }),
  signal: controller.signal
})
.then(response => {
  clearTimeout(timeout);
  console.log('✅ Réponse reçue:', response);
})
.catch(error => {
  clearTimeout(timeout);
  console.error('❌ Erreur:', error);
});
```

### Interprétation

#### Cas 1: Erreur après 3 minutes
```
❌ Erreur: TypeError: Failed to fetch
```

**Conclusion:** Le navigateur ou un proxy timeout

**Solution:**
1. Vérifier les proxies/load balancers
2. Implémenter un système de polling

---

#### Cas 2: Réponse après 5-10 minutes
```
✅ Réponse reçue: Response { status: 200, ... }
```

**Conclusion:** Le timeout de 10 minutes fonctionne

**Action:** Vérifier pourquoi l'erreur se produit dans l'application

---

## 🔍 Étape 5: Vérifier les Proxies/Load Balancers

### Identifier les proxies

```bash
# Tracer la route
traceroute hkj0631c.rpcl.app

# Vérifier les headers de réponse
curl -I https://hkj0631c.rpcl.app/webhook/template
```

### Proxies courants et leurs timeouts

| Proxy | Timeout par défaut | Comment augmenter |
|-------|-------------------|-------------------|
| **Nginx** | 60 secondes | `proxy_read_timeout 600s;` |
| **Apache** | 300 secondes | `ProxyTimeout 600` |
| **Cloudflare** | 100 secondes | Passer à Enterprise |
| **AWS ALB** | 60 secondes | Modifier dans la console AWS |
| **Azure LB** | 240 secondes | Modifier dans le portail Azure |

---

## 📊 Tableau de Diagnostic

| Symptôme | Cause probable | Solution |
|----------|---------------|----------|
| curl timeout après 3 min | Timeout serveur/proxy | Augmenter timeout serveur |
| curl fonctionne, navigateur non | Timeout navigateur | Polling ou webhooks |
| Erreur CORS | Headers CORS manquants | Configurer CORS dans n8n |
| Workflow timeout dans n8n | Timeout n8n trop court | Augmenter dans settings n8n |
| Workflow OK, erreur HTTP | Proxy/load balancer | Augmenter timeout proxy |

---

## 🎯 Recommandations

### Solution Immédiate

1. ✅ Vérifier les logs n8n
2. ✅ Augmenter le timeout dans n8n à 15 minutes
3. ✅ Vérifier la configuration CORS
4. ✅ Tester avec curl

### Solution Long Terme

1. 🔄 Implémenter un système de polling
2. 🔄 Utiliser des webhooks asynchrones
3. 🔄 Ajouter une barre de progression
4. 🔄 Permettre l'annulation de la requête

---

## 📝 Script de Diagnostic Automatique

```powershell
# Script: test-timeout-diagnostic.ps1

Write-Host "Diagnostic Timeout n8n" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Test 1: curl avec timeout de 10 minutes
Write-Host "Test 1: curl avec timeout de 10 minutes..." -ForegroundColor Yellow
$result = curl -X POST https://hkj0631c.rpcl.app/webhook/template `
  -H "Content-Type: application/json" `
  -d '{"question":"Test"}' `
  --max-time 600 `
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" 2>&1

Write-Host $result
Write-Host ""

# Test 2: Vérifier les headers CORS
Write-Host "Test 2: Vérification CORS..." -ForegroundColor Yellow
$cors = curl -X OPTIONS https://hkj0631c.rpcl.app/webhook/template `
  -H "Origin: http://localhost:5173" `
  -H "Access-Control-Request-Method: POST" `
  -v 2>&1

if ($cors -match "Access-Control-Allow-Origin") {
    Write-Host "   OK: CORS configure" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: CORS non configure" -ForegroundColor Red
}

Write-Host ""
Write-Host "Diagnostic termine" -ForegroundColor Cyan
```

---

**Dernière mise à jour:** 15 avril 2026
