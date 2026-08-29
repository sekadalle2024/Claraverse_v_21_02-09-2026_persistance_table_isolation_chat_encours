# Guide de Correction - Workflow N8N Case 25

**Date**: 29 Mars 2026  
**Problème**: Le workflow n8n renvoie des recommandations sur la caisse au lieu du sujet demandé (RH/Recrutement)  
**Workflow**: `recos_contrôle_interne_comptable`

---

## 🔍 Diagnostic

### Symptômes
- ✅ Front-end fonctionne (Case 25 détecté et endpoint correct appelé)
- ❌ Réponse du workflow ne correspond pas au message envoyé
- Message demande: RH / Recrutement du DAF
- Réponse reçue: Caisse / Inventaires

### Cause Probable
Le workflow n8n contient probablement:
1. Un exemple hardcodé sur la "caisse"
2. Un prompt système qui force le sujet "caisse"
3. Un template statique au lieu d'une génération dynamique

---

## 🔧 Étapes de Correction

### 1. Ouvrir le Workflow N8N

```
URL: https://t22wtwxl.rpcld.app
Workflow: recos_contrôle_interne_comptable
```

### 2. Vérifier le Node Webhook

**Localiser**: Node "Webhook" au début du workflow

**Vérifier**:
- Le webhook reçoit-il le message dans `question` ou `data`?
- Le message complet est-il accessible?

**Code attendu**:
```javascript
// Le message devrait être dans:
$input.item.json.question
// OU
$input.item.json.data
```

### 3. Vérifier le Prompt Système

**Localiser**: Node "Set" ou "Code" qui prépare le prompt

**❌ MAUVAIS EXEMPLE** (à corriger):
```javascript
const systemPrompt = `
Vous êtes un expert en contrôle interne comptable.
Générez des recommandations sur les inventaires de caisse et le respect 
des seuils d'encaisse.

Contexte:
- Cycle: Trésorerie
- Processus: Inventaire de caisse
- Anomalie: Écarts fréquents entre solde physique et théorique
`;
```

**✅ BON EXEMPLE** (à utiliser):
```javascript
const systemPrompt = `
Vous êtes un expert en contrôle interne comptable.

Analysez le message utilisateur qui contient:
- [Command]: Type de recommandation
- [Cycle]: Cycle comptable concerné
- [test]: Référence du test
- [reference]: Description du test
- [Nature de test]: Type de test effectué
- [Assertion]: Assertion d'audit testée
- [Anomalie]: Anomalie constatée

Générez des recommandations de contrôle interne comptable appropriées 
basées sur le cycle, le test, et l'anomalie mentionnés dans le message.

Format de réponse:
- Structure JSON avec tables HTML
- Rubriques: Intitule, Observation, Constat, Risque, Recommendation
- Contenu spécifique au cycle et à l'anomalie mentionnés
`;
```

### 4. Vérifier le Node LLM

**Localiser**: Node "OpenAI" ou "Gemini" ou autre LLM

**Vérifier le prompt envoyé**:
```javascript
// ❌ MAUVAIS: Prompt hardcodé
const prompt = `
Système: ${systemPrompt}

Utilisateur: Générez des recommandations sur les inventaires de caisse...
`;

// ✅ BON: Prompt dynamique avec le message utilisateur
const userMessage = $input.item.json.question || $input.item.json.data;

const prompt = `
Système: ${systemPrompt}

Utilisateur: ${userMessage}
`;
```

### 5. Vérifier le Node de Formatage

**Localiser**: Node "Code" qui formate la réponse

**Vérifier**:
- La réponse est-elle générée dynamiquement?
- Ou est-ce un template statique?

**❌ MAUVAIS**: Template statique
```javascript
const response = {
  "Etape mission - Programme": [
    {
      "Intitule": "Défaillance dans la gestion et le contrôle des inventaires de caisse..."
    }
  ]
};
```

**✅ BON**: Réponse dynamique du LLM
```javascript
const llmResponse = $input.item.json.output;
const parsedResponse = JSON.parse(llmResponse);
return parsedResponse;
```

---

## 📝 Exemple de Workflow Corrigé

### Structure Recommandée

```
1. Webhook
   ↓
2. Set Variables (extraire le message)
   ↓
3. Code (préparer le prompt système générique)
   ↓
4. LLM (OpenAI/Gemini avec prompt dynamique)
   ↓
5. Code (parser et formater la réponse JSON)
   ↓
6. Respond to Webhook
```

### Code Node "Set Variables"

```javascript
// Extraire le message utilisateur
const userMessage = $input.item.json.question || $input.item.json.data;

return {
  userMessage: userMessage
};
```

### Code Node "Prepare Prompt"

```javascript
const userMessage = $input.item.json.userMessage;

const systemPrompt = `
Vous êtes un expert en contrôle interne comptable SYSCOHADA.

Analysez le message utilisateur et générez des recommandations de contrôle 
interne comptable appropriées.

Le message contient:
- [Command]: Type de recommandation demandée
- [Cycle]: Cycle comptable (RH, Ventes, Achats, Trésorerie, etc.)
- [test]: Référence du test d'audit
- [reference]: Description du test
- [Nature de test]: Type de test (Rapprochement, Observation, etc.)
- [Assertion]: Assertion d'audit (Validité, Exhaustivité, etc.)
- [Anomalie]: Anomalie constatée

Générez une réponse au format JSON avec la structure suivante:
{
  "Etape mission - Programme": [
    {
      "Intitule": "Titre de l'anomalie"
    },
    {
      "Observation": "Description des travaux effectués et du contexte"
    },
    {
      "Constat": "Constat détaillé de l'anomalie"
    },
    {
      "Risque": "Risques associés à l'anomalie"
    },
    {
      "Recommendation": "Recommandations de contrôle interne"
    }
  ]
}

IMPORTANT:
- Adaptez le contenu au CYCLE et à l'ANOMALIE mentionnés
- Ne générez PAS de contenu générique ou d'exemple
- Soyez spécifique au contexte fourni
`;

const fullPrompt = `${systemPrompt}\n\nMessage utilisateur:\n${userMessage}`;

return {
  prompt: fullPrompt
};
```

### Configuration Node LLM

```
Model: gpt-4 ou gemini-pro
Temperature: 0.7
Max Tokens: 2000

Prompt: {{ $json.prompt }}
```

---

## 🧪 Test Après Correction

### Message Test

```
[Command] : Recos contrôle interne comptable
[Cycle] : RH
[test] : AA010
[reference] : test sur la validation des procedures DRH
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = Absence de procedure de recrutement du DAF depuis janvier 2002
```

### Résultat Attendu

La réponse doit contenir:
- ✅ Cycle: RH (Ressources Humaines)
- ✅ Sujet: Procédures de recrutement
- ✅ Anomalie: Absence de procédure de recrutement du DAF
- ✅ Recommandations spécifiques au recrutement
- ❌ PAS de contenu sur la caisse ou la trésorerie

---

## 🔍 Vérification

### Dans N8N

1. Exécuter le workflow manuellement avec le message test
2. Vérifier les logs de chaque node
3. Confirmer que le message utilisateur est bien passé au LLM
4. Confirmer que la réponse est dynamique

### Dans ClaraVerse

1. Envoyer le message test dans le chat
2. Vérifier la notification: "Case 25 : recos_controle_interne"
3. Vérifier que la réponse parle de RH/Recrutement
4. Vérifier que la réponse ne parle PAS de caisse

---

## 📊 Checklist de Correction

- [ ] Workflow n8n ouvert
- [ ] Node Webhook vérifié (message reçu)
- [ ] Prompt système rendu générique (pas de "caisse" hardcodé)
- [ ] Message utilisateur passé au LLM (pas de prompt statique)
- [ ] Réponse générée dynamiquement (pas de template statique)
- [ ] Workflow testé manuellement dans n8n
- [ ] Workflow testé depuis ClaraVerse
- [ ] Réponse correspond au message envoyé

---

## 🚨 Points d'Attention

### Ne PAS Faire

❌ Laisser des exemples hardcodés dans le prompt système  
❌ Utiliser un template statique pour la réponse  
❌ Ignorer le message utilisateur  
❌ Forcer un cycle spécifique (caisse, trésorerie, etc.)

### À Faire

✅ Rendre le prompt système générique  
✅ Passer le message utilisateur complet au LLM  
✅ Générer la réponse dynamiquement  
✅ Adapter le contenu au cycle et à l'anomalie mentionnés

---

## 📞 Support

Si le problème persiste après correction:

1. Vérifier les logs du workflow n8n
2. Vérifier que le LLM reçoit bien le message complet
3. Tester avec un message simple pour isoler le problème
4. Vérifier la configuration du LLM (modèle, température, etc.)

---

**Dernière mise à jour**: 29 Mars 2026  
**Version**: 1.0  
**Auteur**: Diagnostic du problème workflow n8n Case 25
