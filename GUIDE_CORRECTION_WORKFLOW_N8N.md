# Guide de Correction du Workflow n8n pour ClaraAPI

## 🎯 Objectif

Corriger l'erreur `Bad escaped character in JSON at position 11315` en formatant correctement la réponse n8n pour qu'elle soit compatible avec `claraApiService.ts`.

## ❌ Problème Identifié

### Erreur Actuelle
```
Erreur de traitement : Bad escaped character in JSON at position 11315 (line 1 column 11316)
```

### Cause
Le workflow n8n retourne un JSON brut contenant des caractères échappés incorrectement (comme `\n`, `\t`, `\'`, etc.) qui ne peuvent pas être parsés par le front-end.

## ✅ Solution

### Format Attendu par ClaraAPI

Le `claraApiService.ts` attend le **FORMAT 4** pour les programmes de travail:

```json
[
  {
    "data": {
      "Etape mission - Implementation": [
        {
          "table 1": {
            "Etape": "Programme de travail - Phase de Tests",
            "Normes": "Norme 2320 Analyse et évaluation",
            "Reference": "IMP-TRESO-003",
            "Methode": "Méthode des tests de conformité..."
          }
        },
        {
          "table 2": [
            {
              "no": 1,
              "Objectif de contrôle": "Garantir l'indépendance...",
              "Travaux a effectuer": "1. Obtenir l'organigramme...",
              ...
            }
          ]
        },
        {
          "table 3": {
            "Télécharger": "https://..."
          }
        }
      ]
    }
  }
]
```

### Formats Supportés par ClaraAPI

1. **FORMAT 1**: `[{ output: "...", stats: {...} }]` - Réponse simple avec output
2. **FORMAT 2**: `{ tables: [...], status: "..." }` - Format tables
3. **FORMAT 3**: `{ output: "..." }` - Output direct
4. **FORMAT 4**: `[{ data: { "Etape mission - ...": [...] } }]` - **RECOMMANDÉ pour programmes**
5. **FORMAT 5**: `[{ "Sous-section": "...", "Sub-items": [...] }]` - Format CIA
6. **FORMAT 6**: `[{ "Etape mission - CIA": [...] }]` - Format CIA QCM

## 🔧 Modifications à Apporter

### Option 1: Workflow Complet (Recommandé)

Importer le workflow corrigé:

1. Télécharger `n8n_workflow_corrected.json`
2. Dans n8n, aller dans **Workflows** > **Import from File**
3. Sélectionner le fichier
4. Activer le workflow

### Option 2: Modification Manuelle

#### Étape 1: Ajouter un Node "Code" après l'AI Agent

1. Dans votre workflow n8n, après le node **AI Agent**
2. Ajouter un node **Code**
3. Nommer le node: `Format Response for ClaraAPI`

#### Étape 2: Copier le Code de Formatage

Copier le contenu de `n8n_code_node_format_response.js` dans le node Code.

#### Étape 3: Connecter les Nodes

```
Webhook → AI Agent → Format Response for ClaraAPI → Respond to Webhook
```

#### Étape 4: Configurer le Respond to Webhook

Dans le node **Respond to Webhook**:

**Response Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Content-Type: application/json
```

**Response Body:**
```
={{ $json }}
```

## 🧪 Test du Workflow

### Test 1: Vérifier le Format de Sortie

1. Exécuter le workflow manuellement
2. Vérifier que la sortie du node "Format Response for ClaraAPI" ressemble à:

```json
[
  {
    "data": {
      "Etape mission - Implementation": [...]
    }
  }
]
```

### Test 2: Vérifier dans ClaraAPI

1. Envoyer une requête depuis le front-end
2. Ouvrir la console du navigateur
3. Vérifier les logs:

```
✅ FORMAT 4 DETECTE: Nouveau format "Programme de travail" avec structure data
📊 Contenu de data: { type: 'object', keys: [...] }
🔄 Début de la conversion en Markdown...
✅ Conversion terminée: XXXX caractères générés
```

## 📊 Traitement dans ClaraAPI

### Détection du Format

Le `claraApiService.ts` détecte automatiquement le FORMAT 4:

```typescript
if (firstItem && typeof firstItem === "object" && "data" in firstItem) {
  console.log('✅ FORMAT 4 DETECTE: Nouveau format "Programme de travail"');
  const dataContent = firstItem.data;
  contentToDisplay = this.convertStructuredDataToMarkdown(dataContent);
  // ...
}
```

### Conversion en Markdown

La méthode `convertStructuredDataToMarkdown()` convertit automatiquement:

1. **Table 1 (Header)** → Tableau Markdown avec métadonnées
2. **Table 2 (Data Array)** → Tableau Markdown avec colonnes
3. **Table 3 (Download)** → Liens de téléchargement

## 🔍 Débogage

### Vérifier les Logs n8n

Dans le node "Format Response for ClaraAPI", vérifier:

```
📥 Réponse LLM brute: {...}
✅ JSON parsé avec succès
🔑 Clé principale détectée: Etape mission - Implementation
✅ Réponse formatée au FORMAT 4
📊 Structure: [{"data":{"Etape mission - Implementation":[...]}}]
```

### Vérifier les Logs Front-end

Dans la console du navigateur:

```
🔀 Router → Case 1 : template (défaut)
🚀 Envoi de la requête vers n8n endpoint: https://...
📦 === REPONSE BRUTE N8N ===
[{"data":{"Etape mission - Implementation":[...]}}]
📦 === FIN REPONSE BRUTE ===
🔄 Appel de normalizeN8nResponse...
✅ FORMAT 4 DETECTE: Nouveau format "Programme de travail"
```

## ⚠️ Points d'Attention

### 1. Nettoyage des Caractères Échappés

Le code nettoie automatiquement:
- `\n` → espace
- `\t` → espace
- `\'` → `'`
- `\/` → `/`
- Espaces multiples → espace unique

### 2. Extraction du JSON depuis Markdown

Si le LLM retourne le JSON entouré de ` ```json ... ``` `, le code l'extrait automatiquement.

### 3. Gestion des Erreurs

En cas d'erreur de parsing, le code retourne un FORMAT 4 valide avec un message d'erreur:

```json
[{
  "data": {
    "Etape mission - Error": [{
      "table 1": {
        "Error": "Failed to parse LLM response",
        "Details": "...",
        "Response Preview": "..."
      }
    }]
  }
}]
```

## 📝 Checklist de Vérification

- [ ] Node "Code" ajouté après AI Agent
- [ ] Code de formatage copié dans le node
- [ ] Connections vérifiées: Webhook → AI Agent → Code → Respond
- [ ] Headers CORS configurés dans Respond to Webhook
- [ ] Workflow activé dans n8n
- [ ] Test manuel réussi dans n8n
- [ ] Test depuis le front-end réussi
- [ ] Logs de débogage vérifiés
- [ ] Conversion Markdown fonctionnelle

## 🎉 Résultat Attendu

Après correction, vous devriez voir dans le front-end:

1. **Table 1**: Métadonnées du programme (Étape, Normes, Référence, Méthode)
2. **Table 2**: Tableau des contrôles audit avec colonnes
3. **Table 3**: Lien de téléchargement

Le tout formaté en Markdown propre et lisible.

## 🆘 Support

Si l'erreur persiste:

1. Vérifier les logs n8n (node "Format Response for ClaraAPI")
2. Vérifier les logs front-end (console navigateur)
3. Vérifier que le JSON retourné par le LLM est valide
4. Tester avec un JSON simplifié pour isoler le problème

## 📚 Fichiers Fournis

- `n8n_workflow_corrected.json` - Workflow complet corrigé
- `n8n_code_node_format_response.js` - Code du node de formatage
- `GUIDE_CORRECTION_WORKFLOW_N8N.md` - Ce guide
