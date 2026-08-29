# 🔍 Analyse des Timeouts Multiples dans Claraverse

**Date:** 15 avril 2026

---

## 📊 Vue d'ensemble

Le projet Claraverse contient **plusieurs timeouts** à différents niveaux. Le timeout configuré dans `claraApiService.ts` (10 minutes) n'est **pas le seul** qui peut affecter les requêtes vers n8n.

---

## 🎯 Timeout Principal

### claraApiService.ts

**Fichier:** `src/services/claraApiService.ts`  
**Ligne:** 330

```typescript
// Timeout configurable (en millisecondes)
private n8nTimeout = 10 * 60 * 1000; // 10 minutes par défaut pour les workflows LLM
```

**Utilisation:**
```typescript
const timeoutId = setTimeout(() => {
  console.warn(`⏱️ Timeout atteint (${this.n8nTimeout / 1000}s), annulation de la requête...`);
  controller.abort();
}, this.n8nTimeout);
```

**Impact:** Ce timeout s'applique aux requêtes vers les endpoints n8n.

---

## ⚠️ Timeouts Secondaires

### 1. Timeout de Test (30 secondes)

**Fichier:** `src/services/claraApiService.ts`  
**Ligne:** 372

```typescript
// Utiliser un timeout plus court pour le test
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes pour le test
```

**Impact:** Utilisé uniquement dans `testN8nConnection()`. Ne devrait **pas** affecter les requêtes normales.

---

### 2. Timeout des Nodes HTTP (30 secondes)

**Fichier:** `src/shared/FlowEngine/NodeRegistry.ts`  
**Ligne:** 504

```typescript
// Get configuration
const method = node.data.method || 'GET';
const timeout = node.data.timeout || 30000; // 30 secondes par défaut
const maxRetries = node.data.retries || 3;
```

**Impact:** Si les requêtes n8n passent par le système de nodes, ce timeout de 30 secondes peut s'appliquer.

---

### 3. Timeout du FlowExecutor (30 secondes)

**Fichier:** `src/shared/FlowEngine/FlowExecutor.ts`  
**Ligne:** 30

```typescript
const defaultOptions: FlowExecutorOptions = {
  enableLogging: true,
  logLevel: 'info',
  timeout: 30000, // 30 secondes
  onExecutionLog: () => {},
  ...options
};
```

**Impact:** Timeout global pour l'exécution des flows.

---

### 4. Timeout par Défaut Global (30 secondes)

**Fichier:** `src/lib/agent-studio/constants.ts`  
**Ligne:** 247

```typescript
export const DEFAULT_CONFIG = {
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  hotReload: true,
  debugMode: false,
  pluginDirectories: ['./plugins', './node_modules/@clara/agent-studio-*'],
  allowRemotePlugins: false,
  defaultTimeout: 30000, // 30 secondes
  maxConcurrency: 10,
  theme: 'auto' as const,
};
```

**Impact:** Configuration par défaut pour tous les agents.

---

### 5. Timeout des Node Definitions (30 secondes)

**Fichier:** `src/services/agents/nodeDefinitions.ts`  
**Ligne:** 380

```typescript
{
  name: 'Timeout (ms)',
  type: 'number',
  defaultValue: 30000, // 30 secondes
  validation: { min: 1000, max: 300000 }
}
```

**Impact:** Valeur par défaut pour les nodes HTTP dans les agents.

---

### 6. Timeout des Simple Node Definitions (30 secondes)

**Fichier:** `src/services/agents/simpleNodeDefinitions.ts`  
**Ligne:** 1133

```typescript
{
  name: 'Timeout (ms)',
  type: 'number',
  defaultValue: 30000, // 30 secondes
  description: 'Request timeout in milliseconds'
}
```

**Impact:** Valeur par défaut pour les nodes HTTP simples.

---

## 🔍 Timeouts Externes

### 1. Timeout du Navigateur

Les navigateurs ont leurs propres timeouts pour les requêtes `fetch()`:

| Navigateur | Timeout par défaut |
|------------|-------------------|
| Chrome/Edge | ~5 minutes |
| Firefox | ~90 secondes |
| Safari | ~60 secondes |

**Impact:** Le navigateur peut annuler la requête avant que le timeout de 10 minutes ne soit atteint.

---

### 2. Timeout du Serveur n8n

n8n a ses propres timeouts configurables:

- **Timeout de workflow:** Configurable dans les settings n8n
- **Timeout de webhook:** Configurable dans le webhook node
- **Timeout de node HTTP:** Configurable par node

**Impact:** Si n8n timeout avant 10 minutes, la requête échoue côté serveur.

---

### 3. Timeout Réseau/Proxy

Les proxies, load balancers, ou firewalls peuvent avoir leurs propres timeouts:

| Service | Timeout par défaut |
|---------|-------------------|
| Nginx | 60 secondes |
| Apache | 300 secondes (5 minutes) |
| Cloudflare | 100 secondes |
| AWS ALB | 60 secondes |
| Azure Load Balancer | 240 secondes (4 minutes) |

**Impact:** Un timeout intermédiaire peut couper la connexion avant que le timeout de 10 minutes ne soit atteint.

---

## 📊 Tableau Récapitulatif

| Timeout | Valeur | Fichier | Impact |
|---------|--------|---------|--------|
| **Principal (n8n)** | 10 minutes | claraApiService.ts:330 | ✅ Requêtes n8n |
| Test n8n | 30 secondes | claraApiService.ts:372 | ⚠️ Tests uniquement |
| Node HTTP | 30 secondes | NodeRegistry.ts:504 | ⚠️ Si utilisé |
| FlowExecutor | 30 secondes | FlowExecutor.ts:30 | ⚠️ Si utilisé |
| Config globale | 30 secondes | constants.ts:247 | ⚠️ Par défaut |
| Node definitions | 30 secondes | nodeDefinitions.ts:380 | ⚠️ Par défaut |
| Simple nodes | 30 secondes | simpleNodeDefinitions.ts:1133 | ⚠️ Par défaut |
| **Navigateur** | 60-300 sec | N/A | ❌ Peut bloquer |
| **n8n serveur** | Variable | N/A | ❌ Peut bloquer |
| **Proxy/LB** | 60-300 sec | N/A | ❌ Peut bloquer |

---

## 🎯 Conclusion

Le timeout de 10 minutes dans `claraApiService.ts` est correct, mais il peut être **court-circuité** par:

1. ❌ Les timeouts du navigateur (60-300 secondes)
2. ❌ Les timeouts du serveur n8n
3. ❌ Les timeouts des proxies/load balancers
4. ⚠️ Les timeouts des nodes HTTP (si utilisés)

**Recommandation:** Implémenter un système de polling ou de webhooks asynchrones pour éviter les timeouts.

---

**Dernière mise à jour:** 15 avril 2026
