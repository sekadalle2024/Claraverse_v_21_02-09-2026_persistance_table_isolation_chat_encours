# Guide d'Implémentation - Structured Output Parser Case 25

**Date**: 29 Mars 2026  
**Workflow**: recos_contrôle_interne_comptable  
**Problème**: LLM ignore le message utilisateur et retourne du contenu sur Achats au lieu de RH

---

## 🎯 Objectif

Corriger le workflow n8n Case 25 pour que le LLM génère du contenu SPÉCIFIQUE au message utilisateur (RH, Ventes, Trésorerie, etc.) et non du contenu générique sur les Achats.

---

## 📋 Architecture du Workflow Corrigé

```
Webhook
  ↓
[1] Debug Message Reception (nouveau)
  ↓
[2] Extract User Message (nouveau)
  ↓
[3] Prepare Prompt (modifié)
  ↓
[4] OpenAI Chat Model (modifié)
  ↓
[5] Structured Output Parser (existant)
  ↓
[6] node clean1 (modifié)
  ↓
[7] Markdown Generator1 corrige29 (nouveau)
  ↓
Respond to Webhook
```

---

## 🔧 Étape 1: Ajouter le Node "Debug Message Reception"

### Configuration
- **Type**: Code
- **Name**: Debug Message Reception
- **Position**: Juste après le Webhook

### Code à Copier

```javascript
// Node: Debug Message Reception
const webhook = $input.item.json;

console.log("=== DEBUG MESSAGE RECEPTION ===");
console.log("webhook.question:", webhook.question);
console.log("webhook.data:", webhook.data);
console.log("webhook.body:", webhook.body);
console.log("webhook.message:", webhook.message);
console.log("Full webhook:", JSON.stringify(webhook, null, 2));

return {
  json: webhook
};
```

### Objectif
Identifier dans quel champ se trouve le message utilisateur.

---

## 🔧 Étape 2: Ajouter le Node "Extract User Message"

### Configuration
- **Type**: Code
- **Name**: Extract User Message
- **Position**: Après "Debug Message Reception"

### Code à Copier

```javascript
// Node: Extract User Message
const webhook = $input.item.json;

// Essayer tous les champs possibles
const userMessage = webhook.question 
                 || webhook.data 
                 || webhook.body 
                 || webhook.message
                 || JSON.stringify(webhook);

console.log("=== USER MESSAGE EXTRACTED ===");
console.log("Message:", userMessage);
console.log("Length:", userMessage.length);

// Extraire les informations clés du message
const cycleMatch = userMessage.match(/\[Cycle\]\s*:\s*([^\n\-]+)/i);
const anomalieMatch = userMessage.match(/\[Anomalie\]\s*[=:]\s*([^\n]+)/i);

const cycle = cycleMatch ? cycleMatch[1].trim() : "Non spécifié";
const anomalie = anomalieMatch ? anomalieMatch[1].trim() : "Non spécifiée";

console.log("Cycle détecté:", cycle);
console.log("Anomalie détectée:", anomalie);

return {
  json: {
    userMessage: userMessage,
    cycle: cycle,
    anomalie: anomalie
  }
};
```

### Objectif
Extraire le message utilisateur et identifier le cycle et l'anomalie.

---

## 🔧 Étape 3: Modifier le Node "Prepare Prompt"

### Configuration
- **Type**: Code
- **Name**: Prepare Prompt
- **Position**: Après "Extract User Message"

### Code à Copier

```javascript
// Node: Prepare Prompt
const userMessage = $input.item.json.userMessage;
const cycle = $input.item.json.cycle;
const anomalie = $input.item.json.anomalie;

console.log("=== PREPARE PROMPT ===");
console.log("User Message:", userMessage);
console.log("Cycle:", cycle);
console.log("Anomalie:", anomalie);

// Prompt système MINIMAL et GÉNÉRIQUE
const systemPrompt = `Tu es un expert en contrôle interne comptable SYSCOHADA.

MISSION: Analyser le message utilisateur ci-dessous et générer des recommandations de contrôle interne.

RÈGLES ABSOLUES:
1. Lis ATTENTIVEMENT le message utilisateur
2. Identifie le CYCLE mentionné (RH, Achats, Ventes, Trésorerie, Immobilisations, etc.)
3. Identifie l'ANOMALIE mentionnée
4. Génère du contenu SPÉCIFIQUE à ce cycle et cette anomalie
5. N'invente PAS d'autres cycles ou anomalies
6. Utilise UNIQUEMENT les informations du message utilisateur

FORMAT DE RÉPONSE (JSON):
{
  "Etape mission - Recos contrôle interne comptable": [
    {
      "table 1": {
        "Intitule": "Titre spécifique à l'anomalie du cycle ${cycle}",
        "Description": "Description courte"
      }
    },
    {
      "table 2": {
        "Observation": "Description des travaux effectués sur le cycle ${cycle}"
      }
    },
    {
      "table 3": {
        "Constat": "Constat de l'anomalie: ${anomalie}"
      }
    },
    {
      "table 4": {
        "Risque": "Risques associés à cette anomalie dans le cycle ${cycle}"
      }
    },
    {
      "table 5": {
        "Recommendation": "Recommandations pour corriger l'anomalie dans le cycle ${cycle}"
      }
    }
  ]
}

IMPORTANT:
- Le contenu DOIT être spécifique au cycle: ${cycle}
- Le contenu DOIT traiter de l'anomalie: ${anomalie}
- Ne parle PAS d'autres cycles (ex: si c'est RH, ne parle pas d'Achats)
- Ne parle PAS d'autres anomalies que celle mentionnée`;

// Construire le prompt complet
const fullPrompt = `${systemPrompt}

MESSAGE UTILISATEUR À ANALYSER:
---
${userMessage}
---

ATTENTION: Tu DOIS analyser le message ci-dessus.
Le cycle mentionné est: ${cycle}
L'anomalie mentionnée est: ${anomalie}

GÉNÈRE MAINTENANT LA RÉPONSE JSON BASÉE SUR CE MESSAGE:`;

console.log("=== FULL PROMPT ===");
console.log(fullPrompt);
console.log("Prompt length:", fullPrompt.length);

return {
  json: {
    prompt: fullPrompt,
    cycle: cycle,
    anomalie: anomalie
  }
};
```

### Objectif
Créer un prompt qui FORCE le LLM à utiliser le message utilisateur.

---

## 🔧 Étape 4: Modifier le Node "OpenAI Chat Model"

### Configuration
- **Type**: OpenAI Chat Model (ou Gemini)
- **Name**: OpenAI Chat Model
- **Position**: Après "Prepare Prompt"

### Paramètres

```
Model: gpt-4 (ou gemini-pro)
Temperature: 0.3
Max Tokens: 2000

Messages:
  - Role: user
  - Content: {{ $json.prompt }}

System Message: (VIDE - tout est dans le prompt)

Options:
  - Response Format: json_object (si disponible)
```

### Important
- Ne PAS mettre de System Message séparé
- Tout doit être dans le prompt utilisateur
- Temperature basse (0.3) pour plus de précision

---

## 🔧 Étape 5: Vérifier le Structured Output Parser

### Configuration
- **Type**: Structured Output Parser
- **Name**: Structured Output Parser
- **Position**: Après "OpenAI Chat Model"

### Schéma JSON

```json
{
  "type": "object",
  "properties": {
    "Etape mission - Recos contrôle interne comptable": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": {
          "type": "object"
        }
      }
    }
  },
  "required": ["Etape mission - Recos contrôle interne comptable"]
}
```

### Objectif
Parser la réponse JSON du LLM en structure JavaScript.

---

## 🔧 Étape 6: Modifier le Node "node clean1"

### Configuration
- **Type**: Code
- **Name**: node clean1
- **Position**: Après "Structured Output Parser"

### Code à Copier

Copier le contenu du fichier: `NODE_CLEAN1_CORRIGE_CASE_25.js`

### Objectif
Nettoyer et valider la structure JSON.

---

## 🔧 Étape 7: Ajouter le Node "Markdown Generator1 corrige29"

### Configuration
- **Type**: Code
- **Name**: Markdown Generator1 corrige29
- **Position**: Après "node clean1"

### Code à Copier

Copier le contenu du fichier: `MARKDOWN_GENERATOR1_CORRIGE29_CASE_25.js`

### Objectif
Transformer la structure en FORMAT 4 attendu par le frontend.

---

## 🧪 Test de Validation

### Message Test

```
[VAE] : Recos contrôle interne comptable
[Cycle] : RH
[test] : AA010
[reference] : test sur la validation de procedure de recrutement
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de procedure de recrutement du DG
```

### Résultat Attendu

La réponse DOIT contenir:
- ✅ Cycle: **RH** (Ressources Humaines)
- ✅ Sujet: **Recrutement** du Directeur Général
- ✅ Anomalie: **Inexistence de procédure** de recrutement
- ✅ Recommandations sur la **formalisation de procédures RH**

La réponse NE DOIT PAS contenir:
- ❌ Cycle Achats
- ❌ Bons de Commande
- ❌ Fournisseurs
- ❌ Factures

---

## 📊 Checklist d'Implémentation

### Nodes à Ajouter
- [ ] Debug Message Reception (nouveau)
- [ ] Extract User Message (nouveau)
- [ ] Markdown Generator1 corrige29 (nouveau)

### Nodes à Modifier
- [ ] Prepare Prompt (prompt système simplifié)
- [ ] OpenAI Chat Model (configuration)
- [ ] node clean1 (code corrigé)

### Nodes à Vérifier
- [ ] Structured Output Parser (schéma JSON)
- [ ] Respond to Webhook (format de réponse)

### Tests
- [ ] Logs du Debug Message Reception vérifiés
- [ ] Message utilisateur correctement extrait
- [ ] Cycle et anomalie correctement identifiés
- [ ] Prompt complet contient le message utilisateur
- [ ] Réponse du LLM parle du bon cycle
- [ ] Format de réponse conforme au FORMAT 4

---

## 🔍 Débogage

### Si le LLM ignore toujours le message

1. **Vérifier les logs du node "Debug Message Reception"**
   - Le message est-il bien reçu?
   - Dans quel champ se trouve-t-il?

2. **Vérifier les logs du node "Extract User Message"**
   - Le message est-il correctement extrait?
   - Le cycle et l'anomalie sont-ils détectés?

3. **Vérifier les logs du node "Prepare Prompt"**
   - Le prompt complet contient-il le message utilisateur?
   - Le cycle et l'anomalie sont-ils mentionnés?

4. **Vérifier la réponse du LLM**
   - Ajouter un node "Code" après "OpenAI Chat Model":
   ```javascript
   const llmOutput = $input.item.json;
   console.log("=== LLM OUTPUT ===");
   console.log(JSON.stringify(llmOutput, null, 2));
   return { json: llmOutput };
   ```

5. **Tester avec un prompt ultra-simple**
   ```javascript
   const testPrompt = `Lis ce message et dis-moi quel est le cycle mentionné:
   
   ${userMessage}
   
   Réponds en une phrase.`;
   ```

---

## 📁 Fichiers Créés

1. **NODE_CLEAN1_CORRIGE_CASE_25.js**
   - Code corrigé pour le node "node clean1"

2. **MARKDOWN_GENERATOR1_CORRIGE29_CASE_25.js**
   - Code pour le nouveau node "Markdown Generator1 corrige29"

3. **GUIDE_IMPLEMENTATION_STRUCTURED_OUTPUT_CASE_25.md** (ce fichier)
   - Guide complet d'implémentation

4. **PROMPT_FINAL_N8N_CASE_25.txt**
   - Prompt système optimisé (référence)

---

## 🚀 Prochaines Étapes

1. Ouvrir n8n: https://t22wtwxl.rpcld.app
2. Ouvrir le workflow: recos_contrôle_interne_comptable
3. Suivre les étapes 1-7 ci-dessus
4. Tester avec le message RH
5. Vérifier que la réponse parle de RH (pas Achats)

---

**Dernière mise à jour**: 29 Mars 2026  
**Version**: 1.0  
**Priorité**: CRITIQUE

