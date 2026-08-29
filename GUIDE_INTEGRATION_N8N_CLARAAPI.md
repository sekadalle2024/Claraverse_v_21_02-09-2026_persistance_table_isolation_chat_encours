# Guide d'Intégration n8n ↔️ claraApiService

## 🎯 Objectif

Adapter votre workflow n8n pour qu'il retourne des réponses compatibles avec le traitement frontend dans `claraApiService.ts`.

---

## 📋 Prérequis

- ✅ Workflow n8n fonctionnel avec un LLM (Gemini, OpenAI, etc.)
- ✅ Webhook configuré et accessible
- ✅ Frontend Claraverse déployé

---

## 🔄 Architecture du Flux

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  n8n        │────▶│     LLM      │────▶│   Format    │
│  (Clara)    │     │  Webhook    │     │   (Gemini)   │     │  Response   │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
                                                                      │
                                                                      ▼
                                                              ┌──────────────┐
                                                              │   Webhook    │
                                                              │   Response   │
                                                              └──────────────┘
                                                                      │
                                                                      ▼
                                                              ┌──────────────┐
                                                              │   Frontend   │
                                                              │  (Markdown)  │
                                                              └──────────────┘
```

---

## 🛠️ Étape 1 : Identifier Votre Workflow Actuel

### Workflow Type A : Simple (LLM → Webhook Response)

```
[Webhook] → [LLM] → [Webhook Response]
```

**Action** : Ajouter un node "Code" entre LLM et Webhook Response

---

### Workflow Type B : Avec Traitement (LLM → Code → Webhook Response)

```
[Webhook] → [LLM] → [Code: Process] → [Webhook Response]
```

**Action** : Modifier le node "Code: Process" existant

---

## 🛠️ Étape 2 : Ajouter le Node "Format Response"

### Dans n8n :

1. **Ouvrir votre workflow**
2. **Cliquer entre le LLM et le Webhook Response**
3. **Ajouter un node "Code"**
4. **Nommer le node** : "Format Response"
5. **Coller le code** depuis `n8n_format_response_node.js`

### Configuration du Node :

| Paramètre | Valeur |
|-----------|--------|
| **Mode** | Run Once for All Items |
| **Language** | JavaScript |
| **Code** | Voir `n8n_format_response_node.js` |

---

## 🛠️ Étape 3 : Configurer le Webhook Response

### Headers CORS Requis :

Dans le node "Webhook Response", ajouter les headers :

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
}
```

### Configuration :

| Paramètre | Valeur |
|-----------|--------|
| **Respond** | Using 'Respond to Webhook' Node |
| **Response Code** | 200 |
| **Response Headers** | Voir ci-dessus |

---

## 🧪 Étape 4 : Tester le Workflow

### Test 1 : Dans n8n

1. **Activer le workflow**
2. **Cliquer sur "Execute Workflow"**
3. **Envoyer un payload de test** :

```json
{
  "question": "Implementation du contrôle interne"
}
```

4. **Vérifier la sortie du node "Format Response"** :

```json
[
  {
    "data": {
      "Etape mission - Implementation": [
        { "table 1": {...} },
        { "table 2": [...] }
      ]
    }
  }
]
```

---

### Test 2 : Depuis le Frontend

1. **Ouvrir l'application Claraverse**
2. **Ouvrir la console du navigateur** (F12)
3. **Envoyer un message** : `Implementation du contrôle interne`
4. **Vérifier les logs** :

```
🔀 Router → Case 17 : implementation_programme_controle
🚀 Envoi de la requête vers n8n endpoint: https://...
📦 === REPONSE BRUTE N8N ===
[{"data":{"Etape mission - Implementation":[...]}}]
📦 === FIN REPONSE BRUTE ===
🔄 Appel de normalizeN8nResponse...
✅ FORMAT 4 DETECTE: Nouveau format "Programme de travail"
🔄 Début de la conversion en Markdown...
✅ Conversion terminée: 15234 caractères générés
```

---

## 🐛 Dépannage

### Problème 1 : "Bad escaped character in JSON"

**Symptôme** : Erreur dans les logs du frontend

**Cause** : Caractères spéciaux mal échappés dans le JSON du LLM

**Solution** : Le node "Format Response" inclut déjà une fonction de nettoyage. Si le problème persiste :

1. Vérifier le prompt du LLM
2. Ajouter des instructions pour éviter les caractères spéciaux
3. Utiliser FORMAT 1 au lieu de FORMAT 4

---

### Problème 2 : "Format non reconnu"

**Symptôme** : Message "⚠️ Format de réponse n8n non reconnu"

**Cause** : La structure de réponse ne correspond à aucun format attendu

**Solution** :

1. Vérifier que le node "Format Response" est bien placé
2. Vérifier les logs du node dans n8n
3. Comparer la sortie avec les exemples dans `MODIFICATIONS_WORKFLOW_N8N_POUR_CLARAAPI.md`

---

### Problème 3 : Timeout

**Symptôme** : "Request timeout: The n8n workflow took too long"

**Cause** : Le workflow prend plus de 10 minutes

**Solution** :

```javascript
// Dans la console du navigateur
claraApiService.setN8nTimeout(15 * 60 * 1000); // 15 minutes
```

Ou optimiser le workflow :
- Réduire le nombre d'items générés
- Utiliser un modèle LLM plus rapide
- Diviser en plusieurs requêtes

---

### Problème 4 : CORS Error

**Symptôme** : "Network error: Unable to connect to n8n endpoint"

**Cause** : Headers CORS manquants ou incorrects

**Solution** :

1. Vérifier les headers dans le node "Webhook Response"
2. Tester avec curl :

```bash
curl -X POST https://votre-webhook.n8n.cloud/webhook/test \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"question":"test"}'
```

3. Vérifier que les headers CORS sont présents dans la réponse

---

## 📊 Validation de l'Intégration

### Checklist :

- [ ] Node "Format Response" ajouté et configuré
- [ ] Headers CORS configurés dans Webhook Response
- [ ] Test dans n8n réussi (sortie au bon format)
- [ ] Test depuis le frontend réussi
- [ ] Logs du frontend montrent "FORMAT 4 DETECTE"
- [ ] Markdown affiché correctement dans l'interface
- [ ] Pas d'erreurs dans la console

---

## 🎨 Personnalisation

### Modifier le Format de Sortie

Si vous voulez utiliser un autre format (FORMAT 1, 2, ou 3), modifiez la variable `outputFormat` dans le node "Format Response" :

```javascript
let outputFormat = 'FORMAT_1'; // Au lieu de 'FORMAT_4'
```

### Ajouter des Métadonnées

Vous pouvez enrichir la réponse avec des métadonnées :

```javascript
formattedResponse = [{
  data: responseData,
  metadata: {
    processus: 'facturation des ventes',
    etape: 'Implementation',
    timestamp: new Date().toISOString(),
    version: '1.0'
  }
}];
```

---

## 📚 Ressources

- **Documentation complète** : `MODIFICATIONS_WORKFLOW_N8N_POUR_CLARAAPI.md`
- **Code du node** : `n8n_format_response_node.js`
- **Code source frontend** : `src/services/claraApiService.ts`

---

## 🚀 Prochaines Étapes

1. ✅ Intégrer le node "Format Response"
2. ✅ Tester avec différents types de messages
3. ✅ Documenter les cas d'usage spécifiques
4. ✅ Optimiser le prompt du LLM si nécessaire
5. ✅ Créer des workflows pour d'autres cas (CIA, QCM, etc.)

---

## 💡 Conseils

### Pour de Meilleures Performances :

1. **Utiliser FORMAT 4** pour les structures complexes (tableaux multiples)
2. **Utiliser FORMAT 1** pour les réponses simples (texte, markdown)
3. **Optimiser le prompt LLM** pour générer directement la bonne structure
4. **Ajouter des logs** dans le node "Format Response" pour déboguer

### Pour une Meilleure Expérience Utilisateur :

1. **Ajouter un indicateur de progression** dans le workflow
2. **Diviser les gros workflows** en plusieurs étapes
3. **Utiliser des webhooks intermédiaires** pour les mises à jour en temps réel
4. **Documenter les commandes** dans le menu "Démarrer"

---

**Date de création** : 2024
**Version** : 1.0
**Statut** : ✅ Prêt pour production
