# Synthèse Technique - Case 44 : Endpoint Editeur

## Vue d'ensemble

Le Case 44 (Endpoint Editeur) est un endpoint de test simple créé pour valider le mécanisme de switch entre le backend local et les serveurs cloud (Zeabur/Netlify).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                  │
│  1. User envoie: [Command] = editeur                           │
│                                                                  │
│  2. claraApiService.ts (Case 44)                               │
│     ├─ Détecte "editeur" dans le message                       │
│     ├─ routeKey = "editeur"                                    │
│     ├─ resolvedEndpoint = SENTINEL_EDITEUR                     │
│     └─ Génère table: | Editeur |                               │
│                      |----------|                               │
│                      | editeur  |                               │
│                                                                  │
│  3. EditeurAutoTrigger.js                                       │
│     ├─ Détecte la table avec entête "Editeur"                  │
│     ├─ Lit window.CLARA_BACKEND_URL                            │
│     │  • Local: http://localhost:5000                          │
│     │  • Cloud: https://pybackend.zeabur.app                   │
│     ├─ Envoie POST vers /editeur/process                       │
│     └─ Affiche la réponse dans une table                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                                                                  │
│  endpoint_editeur.py                                            │
│  ├─ Route: POST /editeur/process                               │
│  ├─ Reçoit: { command, message }                               │
│  ├─ Traite: Echo du message                                    │
│  └─ Retourne: {                                                 │
│       success: true,                                            │
│       command: "editeur",                                       │
│       message: "editeur",                                       │
│       server_info: {                                            │
│         endpoint: "/editeur/process",                           │
│         status: "operational",                                  │
│         version: "1.0.0"                                        │
│       }                                                          │
│     }                                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Flux de données détaillé

### 1. Détection du message (claraApiService.ts)

```typescript
// Router switch-case
else if (msg.includes("Editeur") || msg.includes("editeur")) {
  routeKey = "editeur";
  caseName = "Case 44";
}

// Résolution de l'endpoint
case "editeur":
  return this.SENTINEL_EDITEUR;

// Génération de la table initiale
if (resolvedEndpoint === this.SENTINEL_EDITEUR) {
  const initialContent =
    "| Editeur |\n" +
    "|----------|\n" +
    "| editeur |";
  
  return {
    id: `${Date.now()}-editeur`,
    role: "assistant",
    content: initialContent,
    timestamp: new Date(),
    metadata: { 
      model: "local",
      caseName: "Case 44",
      routeKey: "editeur"
    },
  };
}
```

### 2. Détection automatique (EditeurAutoTrigger.js)

```javascript
// Détection de la table
function isEditeurTable(table) {
  const headers = Array.from(table.querySelectorAll("th"))
    .map(th => th.textContent.trim());
  return headers.includes("Editeur");
}

// Switch dynamique de l'URL
const endpoint = (window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/editeur/process';

// Envoi vers le backend
const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    command: command,
    message: command
  })
});
```

### 3. Traitement backend (endpoint_editeur.py)

```python
@router.post("/process", response_model=EditeurResponse)
async def process_editeur(request: EditeurRequest):
    try:
        logger.info(f"📝 Endpoint Editeur - Commande reçue: {request.command}")
        
        response = EditeurResponse(
            success=True,
            command=request.command,
            message=request.message or request.command,
            server_info={
                "endpoint": "/editeur/process",
                "status": "operational",
                "version": "1.0.0"
            }
        )
        
        logger.info(f"✅ Réponse envoyée: {response.message}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Erreur dans endpoint_editeur: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur de traitement: {str(e)}"
        )
```

### 4. Affichage de la réponse (EditeurAutoTrigger.js)

```javascript
function replaceTableWithResults(table, result) {
  // Créer une table HTML avec les résultats
  const resultsTable = `
    <table>
      <tr><td>Commande</td><td>${result.command}</td></tr>
      <tr><td>Message</td><td>${result.message}</td></tr>
      <tr><td>Statut</td><td>✅ Succès</td></tr>
      <tr><td>Endpoint</td><td>${result.server_info.endpoint}</td></tr>
      <tr><td>Version</td><td>${result.server_info.version}</td></tr>
      <tr><td>Backend URL</td><td>${window.CLARA_BACKEND_URL}</td></tr>
    </table>
  `;
  
  // Remplacer la table originale
  parentDiv.innerHTML = resultsTable;
}
```

## Mécanisme de switch backend

Le switch entre localhost et cloud est géré par `window.CLARA_BACKEND_URL` défini dans `backendConfig.js`:

```javascript
// backendConfig.js
(function() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    window.CLARA_BACKEND_URL = 'http://localhost:5000';
  } else {
    window.CLARA_BACKEND_URL = 'https://pybackend.zeabur.app';
  }
  
  console.log('🔧 Backend URL configurée:', window.CLARA_BACKEND_URL);
})();
```

## Points clés

1. **Simplicité**: L'endpoint est volontairement simple (echo du message) pour isoler les problèmes de communication

2. **Réutilisabilité**: Le même pattern est utilisé par les Cases 21 (Lead Balance) et 24 (États Financiers)

3. **Détection automatique**: Aucune interaction manuelle requise, tout est automatique

4. **Switch dynamique**: Le frontend détecte automatiquement s'il tourne en local ou en cloud

5. **Diagnostic facile**: Les logs détaillés permettent de tracer chaque étape

## Avantages du Case 44

- ✅ **Test rapide**: Pas de fichier à uploader, réponse instantanée
- ✅ **Diagnostic simple**: Isole les problèmes de switch backend
- ✅ **Validation complète**: Prouve que le mécanisme fonctionne
- ✅ **Réutilisable**: Peut être utilisé pour tester d'autres endpoints

## Limitations connues

- ⚠️ Ne teste pas l'upload de fichiers (voir Cases 21 et 24 pour ça)
- ⚠️ Ne teste pas les traitements complexes (Pandas, Excel, etc.)
- ⚠️ Endpoint de test uniquement, pas de valeur métier

## Prochaines étapes

1. Tester le Case 44 en local
2. Tester le Case 44 en cloud
3. Si succès, appliquer les mêmes patches aux Cases 21 et 24
4. Valider que tous les endpoints fonctionnent en production

## Références

- `py_backend/endpoint_editeur.py`: Backend Python
- `src/services/claraApiService.ts`: Router frontend
- `public/EditeurAutoTrigger.js`: Détection et traitement automatique
- `public/backendConfig.js`: Configuration du switch backend
- `Doc backend switch/02_MEMO_ZEABUR_TESTS_ET_DEBUG_19_AVRIL_2026.md`: Historique des problèmes
