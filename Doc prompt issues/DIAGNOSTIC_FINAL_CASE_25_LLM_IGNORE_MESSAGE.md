# Diagnostic Final - Case 25 : LLM Ignore le Message Utilisateur

**Date**: 29 Mars 2026  
**Problème Critique**: Le LLM génère du contenu mais ignore complètement le message utilisateur

---

## 🔴 Problème Identifié

### Message Envoyé (RH - Recrutement DG)
```
[VAE] : Recos contrôle interne comptable
[Cycle] : RH
[test] : AA010
[reference] : test sur la validation de procedure de recrutement
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de procedure de recrutement du DG
```

### Réponse Reçue (Achats - Bons de Commande)
```
Intitule: Déficience dans le processus d'engagement des dépenses : 
          Absence systématique de Bons de Commande (BC)

Observation: Dans le cadre de nos travaux de contrôle interne sur le 
             cycle Achats/Fournisseurs...

Constat: Lors du test de conformité sur un échantillon de 25 factures 
         fournisseurs, nous avons relevé que 10 factures (soit 40% de 
         l'échantillon) ne sont pas adossées à un Bon de Commande...
```

### Analyse
- ✅ Plus de placeholders (progrès par rapport à avant)
- ✅ Contenu réel généré
- ❌ Contenu sur **Achats/Fournisseurs** au lieu de **RH/Recrutement**
- ❌ LLM ignore complètement le message utilisateur
- ❌ LLM génère du contenu "par défaut" ou basé uniquement sur le prompt système

---

## 🔍 Cause Probable

Le workflow n8n a probablement l'un de ces problèmes:

### 1. Message utilisateur non passé au LLM
```javascript
// ❌ MAUVAIS: Le message utilisateur n'est pas inclus
const prompt = systemPrompt; // Seulement le prompt système

// ✅ BON: Le message utilisateur est inclus
const userMessage = $input.item.json.question || $input.item.json.data;
const prompt = `${systemPrompt}\n\nMessage utilisateur:\n${userMessage}`;
```

### 2. Message utilisateur dans le mauvais champ
```javascript
// Le message pourrait être dans:
$input.item.json.question  // ❌ Vide?
$input.item.json.data      // ❌ Vide?
$input.item.json.body      // ✅ Peut-être ici?
$input.item.json.message   // ✅ Ou ici?
```

### 3. Prompt système trop directif
```javascript
// ❌ MAUVAIS: Le prompt système contient un exemple détaillé
const systemPrompt = `
Vous êtes un expert en contrôle interne.
Générez des recommandations sur les Bons de Commande dans le cycle Achats.
Exemple: Absence de BC, risque de dépassement budgétaire...
`;
// → Le LLM suit l'exemple au lieu du message utilisateur
```

---

## ✅ Solution Complète

### Étape 1: Vérifier la Réception du Message

Dans n8n, ajouter un node "Code" AVANT le LLM pour débugger:

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

**Action**: Exécuter le workflow et vérifier les logs pour voir où se trouve le message.

---

### Étape 2: Extraire Correctement le Message

Une fois que vous savez où est le message, l'extraire:

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
console.log(userMessage);

return {
  json: {
    userMessage: userMessage
  }
};
```

---

### Étape 3: Nouveau Prompt Système ULTRA-SIMPLE

Le prompt système doit être MINIMAL et FORCER le LLM à utiliser le message:

```javascript
// Node: Prepare Prompt
const userMessage = $input.item.json.userMessage;

const systemPrompt = `Tu es un expert en contrôle interne comptable SYSCOHADA.

MISSION: Analyser le message utilisateur ci-dessous et générer des recommandations de contrôle interne.

RÈGLES ABSOLUES:
1. Lis ATTENTIVEMENT le message utilisateur
2. Identifie le CYCLE mentionné (RH, Achats, Ventes, Trésorerie, etc.)
3. Identifie l'ANOMALIE mentionnée
4. Génère du contenu SPÉCIFIQUE à ce cycle et cette anomalie
5. N'invente PAS d'autres cycles ou anomalies

FORMAT DE RÉPONSE (JSON):
{
  "Etape mission - Programme": [
    {"Intitule": "Titre spécifique à l'anomalie"},
    {"Observation": "Description des travaux"},
    {"Constat": "Constat de l'anomalie"},
    {"Risque": "Risques associés"},
    {"Recommendation": "Recommandations"}
  ]
}`;

const fullPrompt = `${systemPrompt}

MESSAGE UTILISATEUR:
${userMessage}

GÉNÈRE MAINTENANT LA RÉPONSE JSON:`;

console.log("=== FULL PROMPT ===");
console.log(fullPrompt);

return {
  json: {
    prompt: fullPrompt
  }
};
```

---

### Étape 4: Configuration du Node LLM

```
Model: gpt-4 ou gemini-pro
Temperature: 0.3  // Plus bas pour plus de précision
Max Tokens: 2000

Prompt: {{ $json.prompt }}

System Message: (VIDE - tout est dans le prompt)
```

**IMPORTANT**: Ne pas mettre de System Message séparé, tout doit être dans le prompt.

---

### Étape 5: Parser la Réponse

```javascript
// Node: Parse Response
const llmOutput = $input.item.json.output || $input.item.json.response;

console.log("=== LLM OUTPUT ===");
console.log(llmOutput);

try {
  // Extraire le JSON de la réponse
  const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsedResponse = JSON.parse(jsonMatch[0]);
    return {
      json: parsedResponse
    };
  } else {
    throw new Error("No JSON found in LLM output");
  }
} catch (error) {
  console.error("Error parsing LLM output:", error);
  return {
    json: {
      error: "Failed to parse LLM response",
      rawOutput: llmOutput
    }
  };
}
```

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

## 📊 Checklist de Débogage

### Dans N8N:

- [ ] Node "Debug Message Reception" ajouté
- [ ] Logs vérifiés pour voir où est le message
- [ ] Message utilisateur correctement extrait
- [ ] Prompt système MINIMAL (pas d'exemples détaillés)
- [ ] Message utilisateur INCLUS dans le prompt envoyé au LLM
- [ ] Logs du prompt complet vérifiés
- [ ] Réponse du LLM vérifiée dans les logs
- [ ] Réponse parsée correctement

### Test Final:

- [ ] Message RH envoyé
- [ ] Réponse parle de RH (pas d'Achats)
- [ ] Réponse parle de Recrutement (pas de BC)
- [ ] Réponse mentionne le DG (pas les fournisseurs)

---

## 🚨 Si le Problème Persiste

### Vérifier le Modèle LLM

Certains modèles ont des comportements différents:

```javascript
// Essayer avec des instructions plus explicites
const fullPrompt = `${systemPrompt}

MESSAGE UTILISATEUR À ANALYSER:
---
${userMessage}
---

ATTENTION: Tu DOIS analyser le message ci-dessus.
Le cycle mentionné est: ${extractCycle(userMessage)}
L'anomalie mentionnée est: ${extractAnomalie(userMessage)}

GÉNÈRE MAINTENANT LA RÉPONSE JSON BASÉE SUR CE MESSAGE:`;
```

### Tester avec un Prompt Ultra-Simple

```javascript
const testPrompt = `Lis ce message et dis-moi quel est le cycle mentionné:

${userMessage}

Réponds en une phrase.`;
```

Si le LLM répond correctement à ce test simple, le problème est dans le prompt système complexe.

---

## 💡 Hypothèse Finale

Le problème le plus probable est que:

1. Le message utilisateur n'est **pas passé au LLM**
2. OU le prompt système contient un **exemple trop détaillé** sur les Achats/BC
3. OU le LLM reçoit le message mais le prompt système le **force à ignorer** le message

**Solution**: Simplifier au maximum, débugger avec des logs, et s'assurer que le message utilisateur est bien dans le prompt envoyé au LLM.

---

**Dernière mise à jour**: 29 Mars 2026  
**Version**: 3.0 (Diagnostic LLM ignore message)  
**Priorité**: CRITIQUE
