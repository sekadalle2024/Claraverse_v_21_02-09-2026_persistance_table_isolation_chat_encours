# 🔧 Solutions Recommandées pour les Timeouts

**Date:** 15 avril 2026

---

## 🎯 Vue d'ensemble

Ce document présente les solutions recommandées pour résoudre les problèmes de timeout lors des requêtes vers n8n.

---

## ✅ Solution 1: Augmenter le Timeout dans n8n

### Étapes

1. **Ouvrir n8n**
   - URL: https://hkj0631c.rpcl.app

2. **Ouvrir le workflow**
   - Aller dans **Workflows**
   - Sélectionner le workflow concerné

3. **Configurer le timeout du webhook**
   - Cliquer sur le node **Webhook**
   - Aller dans **Settings**
   - Chercher **Timeout**
   - Augmenter à **900 secondes** (15 minutes)

4. **Configurer le timeout du workflow**
   - Cliquer sur **Workflow Settings** (icône engrenage)
   - Aller dans **Execution**
   - Chercher **Timeout**
   - Augmenter à **900 secondes** (15 minutes)

5. **Sauvegarder et réactiver**
   - Cliquer sur **Save**
   - Désactiver puis réactiver le workflow

### Avantages
- ✅ Simple à mettre en place
- ✅ Pas de modification du code

### Inconvénients
- ❌ Ne résout pas les timeouts du navigateur/proxy
- ❌ Mauvaise expérience utilisateur (attente longue)

---

## 🔄 Solution 2: Système de Polling (Recommandé)

### Architecture

```
Frontend                    n8n Backend
   |                             |
   |---(1) POST /start-task----->|
   |<---(2) {taskId: "123"}------|
   |                             |
   |---(3) GET /task/123-------->| (toutes les 5 secondes)
   |<---(4) {status: "running"}--|
   |                             |
   |---(5) GET /task/123-------->|
   |<---(6) {status: "completed", result: {...}}|
```

### Implémentation Frontend

```typescript
// src/services/claraApiService.ts

/**
 * Démarre une tâche asynchrone et retourne un ID de tâche
 */
private async startAsyncTask(
  endpoint: string,
  payload: any
): Promise<string> {
  const response = await fetch(`${endpoint}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  return data.taskId;
}

/**
 * Poll le statut d'une tâche
 */
private async pollTaskStatus(
  endpoint: string,
  taskId: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  const maxAttempts = 120; // 10 minutes (5 secondes * 120)
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = await fetch(`${endpoint}/task/${taskId}`);
    const data = await response.json();
    
    if (data.status === 'completed') {
      return data.result;
    }
    
    if (data.status === 'failed') {
      throw new Error(data.error || 'Task failed');
    }
    
    // Mettre à jour la progression
    if (onProgress && data.progress) {
      onProgress(data.progress);
    }
    
    // Attendre 5 secondes avant le prochain poll
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }
  
  throw new Error('Task timeout after 10 minutes');
}

/**
 * Envoie une requête avec polling
 */
public async sendMessageWithPolling(
  message: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  const endpoint = this.getN8nEndpoint(message);
  
  // Démarrer la tâche
  const taskId = await this.startAsyncTask(endpoint, { question: message });
  
  // Afficher une notification
  addInfoNotification(`Traitement en cours... (ID: ${taskId})`);
  
  // Poll le statut
  const result = await this.pollTaskStatus(endpoint, taskId, onProgress);
  
  return result;
}
```

### Implémentation Backend (n8n)

#### Workflow 1: Start Task

```json
{
  "nodes": [
    {
      "name": "Webhook Start",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "start",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "name": "Generate Task ID",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const taskId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);\nreturn { taskId };"
      }
    },
    {
      "name": "Store Task",
      "type": "n8n-nodes-base.redis",
      "parameters": {
        "operation": "set",
        "key": "={{$json.taskId}}",
        "value": "={{JSON.stringify({status: 'pending', question: $('Webhook Start').item.json.body.question})}}",
        "ttl": 3600
      }
    },
    {
      "name": "Trigger Processing",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://hkj0631c.rpcl.app/webhook/process",
        "method": "POST",
        "body": {
          "taskId": "={{$json.taskId}}",
          "question": "={{$('Webhook Start').item.json.body.question}}"
        }
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{JSON.stringify({taskId: $json.taskId})}}"
      }
    }
  ]
}
```

#### Workflow 2: Process Task

```json
{
  "nodes": [
    {
      "name": "Webhook Process",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "process",
        "responseMode": "lastNode"
      }
    },
    {
      "name": "Update Status Running",
      "type": "n8n-nodes-base.redis",
      "parameters": {
        "operation": "set",
        "key": "={{$json.body.taskId}}",
        "value": "={{JSON.stringify({status: 'running', progress: 0})}}"
      }
    },
    {
      "name": "Process with LLM",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "message",
        "text": "={{$json.body.question}}"
      }
    },
    {
      "name": "Update Status Completed",
      "type": "n8n-nodes-base.redis",
      "parameters": {
        "operation": "set",
        "key": "={{$('Webhook Process').item.json.body.taskId}}",
        "value": "={{JSON.stringify({status: 'completed', result: $json.message})}}"
      }
    }
  ]
}
```

#### Workflow 3: Get Task Status

```json
{
  "nodes": [
    {
      "name": "Webhook Get Status",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "task/:taskId",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Get Task from Redis",
      "type": "n8n-nodes-base.redis",
      "parameters": {
        "operation": "get",
        "key": "={{$json.params.taskId}}"
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{$json}}"
      }
    }
  ]
}
```

### Avantages
- ✅ Pas de timeout
- ✅ Barre de progression possible
- ✅ Meilleure expérience utilisateur
- ✅ Robuste

### Inconvénients
- ❌ Plus complexe à mettre en place
- ❌ Nécessite Redis ou une base de données

---

## 🔔 Solution 3: Webhooks Asynchrones avec WebSocket

### Architecture

```
Frontend (WebSocket)        n8n Backend
   |                             |
   |---(1) POST /start-task----->|
   |<---(2) {taskId: "123"}------|
   |                             |
   |<===(3) WebSocket: {status: "running", progress: 25%}===|
   |<===(4) WebSocket: {status: "running", progress: 50%}===|
   |<===(5) WebSocket: {status: "running", progress: 75%}===|
   |<===(6) WebSocket: {status: "completed", result: {...}}=|
```

### Implémentation Frontend

```typescript
// src/services/websocketService.ts

export class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();
  
  connect(url: string) {
    this.ws = new WebSocket(url);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const listener = this.listeners.get(data.taskId);
      if (listener) {
        listener(data);
      }
    };
  }
  
  subscribe(taskId: string, callback: (data: any) => void) {
    this.listeners.set(taskId, callback);
  }
  
  unsubscribe(taskId: string) {
    this.listeners.delete(taskId);
  }
}

// src/services/claraApiService.ts

public async sendMessageWithWebSocket(
  message: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  const endpoint = this.getN8nEndpoint(message);
  
  // Démarrer la tâche
  const response = await fetch(`${endpoint}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: message })
  });
  
  const { taskId } = await response.json();
  
  // S'abonner aux mises à jour via WebSocket
  return new Promise((resolve, reject) => {
    const wsService = new WebSocketService();
    wsService.connect('wss://hkj0631c.rpcl.app/ws');
    
    wsService.subscribe(taskId, (data) => {
      if (data.status === 'completed') {
        wsService.unsubscribe(taskId);
        resolve(data.result);
      } else if (data.status === 'failed') {
        wsService.unsubscribe(taskId);
        reject(new Error(data.error));
      } else if (onProgress && data.progress) {
        onProgress(data.progress);
      }
    });
  });
}
```

### Avantages
- ✅ Temps réel
- ✅ Pas de polling
- ✅ Barre de progression en temps réel
- ✅ Efficace

### Inconvénients
- ❌ Complexe à mettre en place
- ❌ Nécessite un serveur WebSocket
- ❌ Gestion des reconnexions

---

## 📊 Comparaison des Solutions

| Solution | Complexité | Expérience | Robustesse | Recommandé |
|----------|-----------|------------|------------|------------|
| **Augmenter timeout** | ⭐ Facile | ⭐ Mauvaise | ⭐⭐ Moyenne | ❌ Non |
| **Polling** | ⭐⭐ Moyenne | ⭐⭐⭐ Bonne | ⭐⭐⭐ Bonne | ✅ Oui |
| **WebSocket** | ⭐⭐⭐ Difficile | ⭐⭐⭐⭐ Excellente | ⭐⭐⭐⭐ Excellente | ⚠️ Si possible |

---

## 🎯 Recommandation Finale

**Solution recommandée:** Système de Polling (Solution 2)

**Raisons:**
1. ✅ Bon compromis complexité/efficacité
2. ✅ Pas de timeout
3. ✅ Barre de progression possible
4. ✅ Robuste et fiable
5. ✅ Facile à maintenir

**Prochaines étapes:**
1. Implémenter les 3 workflows n8n (start, process, get-status)
2. Modifier `claraApiService.ts` pour utiliser le polling
3. Ajouter une barre de progression dans l'UI
4. Tester avec des requêtes longues

---

**Dernière mise à jour:** 15 avril 2026
