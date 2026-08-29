# 🏗️ Architecture : n8n ↔️ claraApiService

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Claraverse)                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              claraApiService.ts                             │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │  Router (getN8nEndpoint)                             │ │   │
│  │  │  ┌────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Case 1: template (défaut)                     │ │ │   │
│  │  │  │  Case 2: integration_windows                   │ │ │   │
│  │  │  │  Case 3: n8n_doc                               │ │ │   │
│  │  │  │  Case 4: htlm_processor                        │ │ │   │
│  │  │  │  Case 6: algorithme                            │ │ │   │
│  │  │  │  Case 7: visualisation                         │ │ │   │
│  │  │  │  Case 9: integration_document                  │ │ │   │
│  │  │  │  Case 10: integration_database                 │ │ │   │
│  │  │  │  Case 11: cia_cours_gemini                     │ │ │   │
│  │  │  │  Case 12: qcm_cia_gemini                       │ │ │   │
│  │  │  │  Case 16: implementation_modelisation          │ │ │   │
│  │  │  │  Case 17: implementation_programme_controle ⭐ │ │ │   │
│  │  │  │  Case 18: implementation_cartographie          │ │ │   │
│  │  │  │  Case 19: programme_controle_comptes           │ │ │   │
│  │  │  │  Case 20: revue_manager                        │ │ │   │
│  │  │  └────────────────────────────────────────────────┘ │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │  normalizeN8nResponse()                              │ │   │
│  │  │  ┌────────────────────────────────────────────────┐ │ │   │
│  │  │  │  FORMAT 1: [{ output: "..." }]                 │ │ │   │
│  │  │  │  FORMAT 2: { tables: [...] }                   │ │ │   │
│  │  │  │  FORMAT 3: { output: "..." }                   │ │ │   │
│  │  │  │  FORMAT 4: [{ data: {...} }] ⭐                │ │ │   │
│  │  │  │  FORMAT 5: [{ "Sous-section": ... }]           │ │ │   │
│  │  │  │  FORMAT 6: [{ "Etape mission - CIA": ... }]    │ │ │   │
│  │  │  └────────────────────────────────────────────────┘ │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │  convertStructuredDataToMarkdown()                   │ │   │
│  │  │  (Pour FORMAT 4)                                     │ │   │
│  │  │  ┌────────────────────────────────────────────────┐ │ │   │
│  │  │  │  detectTableType()                             │ │ │   │
│  │  │  │  - header                                      │ │ │   │
│  │  │  │  - data_array                                  │ │ │   │
│  │  │  │  - download                                    │ │ │   │
│  │  │  └────────────────────────────────────────────────┘ │ │   │
│  │  │  ┌────────────────────────────────────────────────┐ │ │   │
│  │  │  │  convertHeaderTableToMarkdown()                │ │ │   │
│  │  │  │  convertArrayTableToMarkdown()                 │ │ │   │
│  │  │  │  convertDownloadTableToMarkdown()              │ │ │   │
│  │  │  └────────────────────────────────────────────────┘ │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST
                                    │ { question: "..." }
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (n8n)                                │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Workflow: implementation_programme_controle                │   │
│  │                                                              │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │   │
│  │  │   Webhook    │───▶│ Prepare      │───▶│     LLM      │ │   │
│  │  │   Trigger    │    │   Prompt     │    │   (Gemini)   │ │   │
│  │  └──────────────┘    └──────────────┘    └──────────────┘ │   │
│  │                                                   │          │   │
│  │                                                   ▼          │   │
│  │                                          ┌──────────────┐   │   │
│  │                                          │   Format     │   │   │
│  │                                          │  Response ⭐ │   │   │
│  │                                          └──────────────┘   │   │
│  │                                                   │          │   │
│  │                                                   ▼          │   │
│  │                                          ┌──────────────┐   │   │
│  │                                          │   Webhook    │   │   │
│  │                                          │   Response   │   │   │
│  │                                          └──────────────┘   │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Response
                                    │ [{ data: {...} }]
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Claraverse)                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Markdown Renderer                              │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │  ### Programme de Travail                            │ │   │
│  │  │                                                        │ │   │
│  │  │  | Rubrique | Description |                           │ │   │
│  │  │  |----------|-------------|                           │ │   │
│  │  │  | Etape    | Programme de travail - Phase de Tests  │ │   │
│  │  │  | Normes   | Norme 2320 Analyse et évaluation       │ │   │
│  │  │                                                        │ │   │
│  │  │  ### Contrôles Audit                                  │ │   │
│  │  │                                                        │ │   │
│  │  │  | no | Objectif | Travaux | Conclusion |             │ │   │
│  │  │  |----|----------|---------|------------|             │ │   │
│  │  │  | 1  | ...      | ...     | ...        |             │ │   │
│  │  │  | 2  | ...      | ...     | ...        |             │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données Détaillé

### Étape 1 : Envoi de la Requête

```
User Input: "Implementation du contrôle interne"
     │
     ▼
claraApiService.sendChatMessage()
     │
     ▼
getN8nEndpoint(message)
     │
     ├─ Détecte: "Implementation_programme_controle"
     │
     ▼
Endpoint: https://j17rkv4c.rpcld.cc/webhook/implementation_programme_controle
     │
     ▼
HTTP POST: { question: "Implementation du contrôle interne" }
```

---

### Étape 2 : Traitement dans n8n

```
Webhook Trigger
     │
     ▼
Node: Prepare Prompt
     │
     ├─ Extrait: question
     ├─ Construit: systemPrompt
     │
     ▼
Node: LLM (Gemini)
     │
     ├─ Génère: JSON structuré
     │   {
     │     "Etape mission - Implementation": [
     │       { "table 1": {...} },
     │       { "table 2": [...] },
     │       { "table 3": {...} }
     │     ]
     │   }
     │
     ▼
Node: Format Response ⭐
     │
     ├─ Encapsule dans FORMAT 4:
     │   [{
     │     data: {
     │       "Etape mission - Implementation": [...]
     │     }
     │   }]
     │
     ▼
Node: Webhook Response
     │
     ├─ Ajoute headers CORS
     ├─ Retourne JSON
     │
     ▼
HTTP Response: [{ data: {...} }]
```

---

### Étape 3 : Traitement dans le Frontend

```
HTTP Response reçue
     │
     ▼
normalizeN8nResponse(result)
     │
     ├─ Détecte: Array avec "data"
     ├─ Format: FORMAT 4
     │
     ▼
convertStructuredDataToMarkdown(dataContent)
     │
     ├─ Parcourt: "Etape mission - Implementation"
     │
     ├─ Pour chaque table:
     │   │
     │   ├─ detectTableType()
     │   │   ├─ "table 1" → header
     │   │   ├─ "table 2" → data_array
     │   │   └─ "table 3" → download
     │   │
     │   ├─ convertHeaderTableToMarkdown()
     │   │   └─ Génère: | Rubrique | Description |
     │   │
     │   ├─ convertArrayTableToMarkdown()
     │   │   └─ Génère: | no | Objectif | ... |
     │   │
     │   └─ convertDownloadTableToMarkdown()
     │       └─ Génère: 🔗 [Télécharger](url)
     │
     ▼
Markdown complet généré
     │
     ▼
Affichage dans l'interface
```

---

## 🎯 Points Clés de l'Architecture

### 1. Router Intelligent

Le router dans `claraApiService.ts` dirige automatiquement les requêtes vers le bon endpoint n8n selon le contenu du message :

```javascript
if (msg.includes("Implementation_programme_controle")) {
  return "https://j17rkv4c.rpcld.cc/webhook/implementation_programme_controle";
}
```

**Avantages** :
- ✅ Pas besoin de spécifier l'endpoint manuellement
- ✅ Un seul point d'entrée pour l'utilisateur
- ✅ Facile d'ajouter de nouveaux endpoints

---

### 2. Normalisation des Réponses

La fonction `normalizeN8nResponse()` détecte automatiquement le format de la réponse et l'adapte :

```javascript
if (firstItem && "data" in firstItem) {
  // FORMAT 4 détecté
  contentToDisplay = this.convertStructuredDataToMarkdown(dataContent);
}
```

**Avantages** :
- ✅ Support de multiples formats
- ✅ Rétrocompatibilité
- ✅ Extensibilité

---

### 3. Conversion Intelligente en Markdown

Pour FORMAT 4, la conversion en markdown est automatique et intelligente :

```javascript
// Détection automatique du type de table
const tableType = this.detectTableType(tableKey, tableData);

// Conversion selon le type
switch (tableType) {
  case "header": convertHeaderTableToMarkdown();
  case "data_array": convertArrayTableToMarkdown();
  case "download": convertDownloadTableToMarkdown();
}
```

**Avantages** :
- ✅ Pas besoin de spécifier le type manuellement
- ✅ Formatage professionnel automatique
- ✅ Support de tables complexes

---

## 🔧 Node "Format Response" (Détail)

### Rôle

Transformer la réponse du LLM en un format compatible avec le frontend.

### Entrée

```json
{
  "Etape mission - Implementation": [
    { "table 1": {...} },
    { "table 2": [...] },
    { "table 3": {...} }
  ]
}
```

### Sortie

```json
[{
  "data": {
    "Etape mission - Implementation": [
      { "table 1": {...} },
      { "table 2": [...] },
      { "table 3": {...} }
    ]
  }
}]
```

### Code Minimal

```javascript
const llmOutput = $input.first().json;
return [{ json: [{ data: llmOutput }] }];
```

---

## 📊 Diagramme de Séquence

```
┌─────────┐         ┌──────────┐         ┌─────┐         ┌──────────┐
│  User   │         │ Frontend │         │ n8n │         │   LLM    │
└────┬────┘         └────┬─────┘         └──┬──┘         └────┬─────┘
     │                   │                   │                 │
     │ "Implementation"  │                   │                 │
     │──────────────────▶│                   │                 │
     │                   │                   │                 │
     │                   │ POST /webhook     │                 │
     │                   │──────────────────▶│                 │
     │                   │                   │                 │
     │                   │                   │ Generate JSON   │
     │                   │                   │────────────────▶│
     │                   │                   │                 │
     │                   │                   │ JSON Response   │
     │                   │                   │◀────────────────│
     │                   │                   │                 │
     │                   │                   │ Format Response │
     │                   │                   │─────────┐       │
     │                   │                   │         │       │
     │                   │                   │◀────────┘       │
     │                   │                   │                 │
     │                   │ [{ data: {...} }] │                 │
     │                   │◀──────────────────│                 │
     │                   │                   │                 │
     │                   │ Normalize         │                 │
     │                   │─────────┐         │                 │
     │                   │         │         │                 │
     │                   │◀────────┘         │                 │
     │                   │                   │                 │
     │                   │ Convert to MD     │                 │
     │                   │─────────┐         │                 │
     │                   │         │         │                 │
     │                   │◀────────┘         │                 │
     │                   │                   │                 │
     │ Markdown Display  │                   │                 │
     │◀──────────────────│                   │                 │
     │                   │                   │                 │
```

---

## 🏗️ Architecture Modulaire

### Frontend (claraApiService.ts)

```
claraApiService
├── Router
│   └── getN8nEndpoint()
│       ├── Case 1-20
│       └── Sentinelles (DATABASE, NOTIFICATION)
│
├── Normalisation
│   └── normalizeN8nResponse()
│       ├── FORMAT 1-6
│       └── Fallback
│
├── Conversion
│   ├── convertStructuredDataToMarkdown()
│   ├── detectTableType()
│   ├── convertHeaderTableToMarkdown()
│   ├── convertArrayTableToMarkdown()
│   └── convertDownloadTableToMarkdown()
│
└── Communication
    ├── sendChatMessage()
    ├── testN8nConnection()
    └── setN8nTimeout()
```

### Backend (n8n)

```
Workflow
├── Webhook Trigger
│   └── Reçoit: { question: "..." }
│
├── Prepare Prompt
│   ├── Extrait la question
│   └── Construit le prompt système
│
├── LLM (Gemini)
│   ├── Génère le JSON structuré
│   └── Respecte le format demandé
│
├── Format Response ⭐
│   ├── Encapsule dans FORMAT 4
│   ├── Nettoie les caractères spéciaux
│   └── Ajoute des logs
│
└── Webhook Response
    ├── Ajoute headers CORS
    └── Retourne le JSON formaté
```

---

## 🔄 Cycle de Vie d'une Requête

### Phase 1 : Préparation (Frontend)

1. **User Input** : L'utilisateur tape un message
2. **Router** : Détermine l'endpoint n8n approprié
3. **Payload** : Construit le payload JSON
4. **HTTP Request** : Envoie la requête POST

### Phase 2 : Traitement (n8n)

1. **Webhook** : Reçoit la requête
2. **Prepare** : Prépare le prompt pour le LLM
3. **LLM** : Génère la réponse structurée
4. **Format** : Encapsule dans le bon format
5. **Response** : Retourne le JSON formaté

### Phase 3 : Affichage (Frontend)

1. **Receive** : Reçoit la réponse HTTP
2. **Normalize** : Détecte et normalise le format
3. **Convert** : Convertit en markdown
4. **Render** : Affiche dans l'interface

---

## 🎨 Personnalisation

### Ajouter un Nouveau Format

1. **Frontend** : Ajouter la détection dans `normalizeN8nResponse()`
2. **Backend** : Créer un nouveau node de formatage
3. **Documentation** : Documenter le nouveau format

### Ajouter un Nouveau Endpoint

1. **Frontend** : Ajouter un case dans `getN8nEndpoint()`
2. **Backend** : Créer un nouveau workflow n8n
3. **Test** : Valider l'intégration

---

## 📊 Métriques et Performance

### Temps de Traitement Typique

```
User Input → Router : < 1ms
Router → n8n : 50-200ms (réseau)
n8n → LLM : 5-60s (génération)
LLM → Format : < 100ms
Format → Frontend : 50-200ms (réseau)
Frontend → Markdown : 100-500ms (conversion)
Markdown → Display : < 50ms

Total : 6-62 secondes
```

### Optimisations Possibles

1. **Cache** : Mettre en cache les réponses fréquentes
2. **Streaming** : Utiliser le streaming pour les réponses longues
3. **Pagination** : Diviser les gros tableaux
4. **Compression** : Compresser les réponses JSON

---

## 🔒 Sécurité

### Headers CORS

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Validation

- ✅ Validation du payload côté n8n
- ✅ Nettoyage des caractères spéciaux
- ✅ Timeout pour éviter les blocages
- ✅ Gestion des erreurs

---

## 📚 Ressources

- **Code source** : `src/services/claraApiService.ts`
- **Node n8n** : `n8n_format_response_node.js`
- **Workflow** : `workflow_n8n_exemple_complet.json`
- **Documentation** : `README_INTEGRATION_N8N.md`

---

**Version** : 1.0
**Date** : 2024
**Statut** : ✅ Production Ready
