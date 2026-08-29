# 🔍 Documentation Timeout et CORS - ClaraAPI Service

**Date:** 15 avril 2026

---

## 🎯 Objectif

Cette documentation analyse et résout les problèmes de timeout et CORS rencontrés lors des requêtes vers n8n depuis le frontend Claraverse.

---

## ❌ Problème

### Symptômes

```
❌ Timeout configuré: 10 minutes dans claraApiService.ts
❌ Erreur observée: après ~3 minutes dans la pratique
❌ Message d'erreur: "Failed to fetch" ou "Network error"
```

### Erreur Typique

```
🌐 Network error: Unable to connect to n8n endpoint.

Troubleshooting:
- CORS Issue: Ensure n8n webhook has CORS enabled
- Endpoint URL: Verify endpoint is accessible
- Network: Check your internet connection
- n8n Status: Verify n8n workflow is active
```

---

## 🔍 Analyse

### Timeout Principal

**Fichier:** `src/services/claraApiService.ts`  
**Ligne:** 330

```typescript
private n8nTimeout = 10 * 60 * 1000; // 10 minutes
```

### Pourquoi l'erreur après 3 minutes ?

Le timeout de 10 minutes peut être **court-circuité** par:

1. ❌ **Timeout du navigateur** (60-300 secondes)
2. ❌ **Timeout du serveur n8n**
3. ❌ **Timeout d'un proxy/load balancer**
4. ❌ **Problème de configuration CORS**

---

## ✅ Solutions

### Solution 1: Diagnostic (Immédiat)

**Étapes:**
1. Tester avec curl
2. Vérifier les logs n8n
3. Vérifier la configuration CORS

**Voir:** `DIAGNOSTIC_ERREUR_3_MINUTES.md`

---

### Solution 2: Système de Polling (Recommandé)

**Architecture:**
```
Frontend → POST /start → n8n (retourne taskId)
Frontend → GET /task/:id → n8n (toutes les 5 secondes)
Frontend ← Résultat ← n8n (quand terminé)
```

**Avantages:**
- ✅ Pas de timeout
- ✅ Barre de progression
- ✅ Meilleure expérience utilisateur
- ✅ Robuste

**Voir:** `SOLUTIONS_RECOMMANDEES.md`

---

### Solution 3: Configuration CORS

**Headers à configurer dans n8n:**

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS, GET
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

**Voir:** `CONFIGURATION_N8N_CORS.md`

---

## 📚 Documentation

| Fichier | Description | Pour qui |
|---------|-------------|----------|
| **00_LIRE_EN_PREMIER.txt** | Vue d'ensemble du problème | Tous |
| **ANALYSE_TIMEOUTS_MULTIPLES.md** | Analyse technique des timeouts | Développeurs |
| **DIAGNOSTIC_ERREUR_3_MINUTES.md** | Guide de diagnostic étape par étape | DevOps |
| **SOLUTIONS_RECOMMANDEES.md** | Solutions détaillées avec code | Développeurs |
| **CONFIGURATION_N8N_CORS.md** | Configuration CORS pour n8n | DevOps |
| **00_INDEX.md** | Index de navigation | Tous |
| **README.md** | Ce fichier | Tous |

---

## 🚀 Démarrage Rapide

### 1. Comprendre le problème (5 minutes)

```bash
# Lire le résumé
cat "00_LIRE_EN_PREMIER.txt"
```

---

### 2. Diagnostiquer (15 minutes)

```bash
# Test avec curl
curl -X POST https://hkj0631c.rpcl.app/webhook/template \
  -H "Content-Type: application/json" \
  -d '{"question":"Test"}' \
  --max-time 600 \
  -v
```

**Voir:** `DIAGNOSTIC_ERREUR_3_MINUTES.md`

---

### 3. Vérifier CORS (10 minutes)

```bash
# Test CORS
curl -X OPTIONS https://hkj0631c.rpcl.app/webhook/template \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Voir:** `CONFIGURATION_N8N_CORS.md`

---

### 4. Implémenter la solution (1-2 heures)

**Voir:** `SOLUTIONS_RECOMMANDEES.md`

---

## 🔧 Scripts Utiles

### Test CORS

```powershell
# test-cors-n8n.ps1
$endpoint = "https://hkj0631c.rpcl.app/webhook/template"

curl -X OPTIONS $endpoint `
  -H "Origin: http://localhost:5173" `
  -H "Access-Control-Request-Method: POST" `
  -v
```

---

### Test Timeout

```powershell
# test-timeout-diagnostic.ps1
curl -X POST https://hkj0631c.rpcl.app/webhook/template `
  -H "Content-Type: application/json" `
  -d '{"question":"Test"}' `
  --max-time 600 `
  -v
```

---

## 📊 Timeouts Identifiés

| Timeout | Valeur | Fichier | Impact |
|---------|--------|---------|--------|
| **Principal (n8n)** | 10 minutes | claraApiService.ts:330 | ✅ OK |
| Test n8n | 30 secondes | claraApiService.ts:372 | ⚠️ Tests uniquement |
| Node HTTP | 30 secondes | NodeRegistry.ts:504 | ⚠️ Si utilisé |
| FlowExecutor | 30 secondes | FlowExecutor.ts:30 | ⚠️ Si utilisé |
| **Navigateur** | 60-300 sec | N/A | ❌ Peut bloquer |
| **n8n serveur** | Variable | N/A | ❌ Peut bloquer |
| **Proxy/LB** | 60-300 sec | N/A | ❌ Peut bloquer |

---

## 🎯 Recommandation

**Solution recommandée:** Système de Polling

**Raisons:**
1. ✅ Pas de timeout
2. ✅ Barre de progression
3. ✅ Meilleure UX
4. ✅ Robuste
5. ✅ Facile à maintenir

**Prochaines étapes:**
1. Lire `SOLUTIONS_RECOMMANDEES.md`
2. Implémenter les 3 workflows n8n
3. Modifier `claraApiService.ts`
4. Tester

---

## 📞 Support

**En cas de problème:**
1. Lire `00_LIRE_EN_PREMIER.txt`
2. Suivre `DIAGNOSTIC_ERREUR_3_MINUTES.md`
3. Vérifier `CONFIGURATION_N8N_CORS.md`
4. Contacter l'éditeur: +225 05 44 13 07 98

---

## ✅ Checklist

- [ ] Lire la documentation
- [ ] Diagnostiquer le problème
- [ ] Vérifier CORS
- [ ] Tester avec curl
- [ ] Vérifier les logs n8n
- [ ] Choisir une solution
- [ ] Implémenter
- [ ] Tester
- [ ] Documenter

---

## 📝 Modifications Effectuées

| Date | Action | Fichier |
|------|--------|---------|
| 15/04/2026 | Timeout maintenu à 10 minutes | claraApiService.ts:330 |
| 15/04/2026 | Message de notification ajouté | claraApiService.ts:2078-2095 |
| 15/04/2026 | Documentation créée | Ce dossier |

---

## 🔗 Liens Utiles

- [Documentation n8n](https://docs.n8n.io/)
- [CORS MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fetch API Timeout](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

---

**Dernière mise à jour:** 15 avril 2026
