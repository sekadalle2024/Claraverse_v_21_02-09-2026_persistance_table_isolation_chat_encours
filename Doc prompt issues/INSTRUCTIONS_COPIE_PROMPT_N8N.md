# Instructions - Copier le Prompt dans N8N

**Date**: 29 Mars 2026  
**Workflow**: recos_contrôle_interne_comptable  
**Fichier source**: PROMPT_FINAL_N8N_CASE_25.txt

---

## 🎯 Objectif

Remplacer le prompt système actuel dans le workflow n8n par le nouveau prompt optimisé qui force le LLM à lire et utiliser le message utilisateur.

---

## 📋 Étapes Détaillées

### Étape 1: Ouvrir N8N

```
URL: https://t22wtwxl.rpcld.app
```

1. Ouvrir le navigateur
2. Aller sur l'URL ci-dessus
3. Se connecter si nécessaire

---

### Étape 2: Ouvrir le Workflow

1. Dans la liste des workflows, chercher: `recos_contrôle_interne_comptable`
2. Cliquer sur le workflow pour l'ouvrir
3. Le workflow s'affiche avec tous ses nodes

---

### Étape 3: Localiser le Node du Prompt

Le node peut avoir l'un de ces noms:
- "Recos controle interne comptable"
- "Set" (avec un nom similaire)
- "Code" (qui prépare le prompt)
- "Prepare Prompt"

**Comment le trouver**:
1. Chercher le node qui se trouve AVANT le node LLM (OpenAI/Gemini)
2. C'est généralement un node "Code" ou "Set"
3. Il contient le texte du prompt système

---

### Étape 4: Ouvrir le Fichier Source

Sur votre ordinateur:

```powershell
code PROMPT_FINAL_N8N_CASE_25.txt
```

Ou ouvrir manuellement le fichier `PROMPT_FINAL_N8N_CASE_25.txt`

---

### Étape 5: Copier le Prompt

1. Ouvrir `PROMPT_FINAL_N8N_CASE_25.txt`
2. Sélectionner TOUT le contenu (Ctrl+A)
3. Copier (Ctrl+C)

**IMPORTANT**: Copier TOUT le fichier, y compris les lignes de séparation `═══`

---

### Étape 6: Modifier le Node dans N8N

#### Option A: Si c'est un node "Code"

1. Double-cliquer sur le node
2. Chercher la variable `systemPrompt` ou `prompt`
3. Remplacer le contenu entre les backticks `` ` `` ou guillemets `""`

**Exemple AVANT**:
```javascript
const systemPrompt = `
Vous êtes un expert en contrôle interne.
Générez des recommandations...
`;
```

**Exemple APRÈS**:
```javascript
const systemPrompt = `
Tu es un expert en contrôle interne comptable SYSCOHADA.

═══════════════════════════════════════════════════════════════════════════
MISSION
═══════════════════════════════════════════════════════════════════════════

Analyser le message utilisateur ci-dessous et générer des recommandations 
de contrôle interne comptable détaillées et spécifiques.

[... reste du prompt ...]
`;
```

#### Option B: Si c'est un node "Set"

1. Double-cliquer sur le node
2. Chercher le champ qui contient le prompt
3. Remplacer le contenu par le nouveau prompt

---

### Étape 7: S'assurer que le Message Utilisateur est Passé

**CRITIQUE**: Le prompt système seul ne suffit pas. Il faut aussi passer le message utilisateur au LLM.

Vérifier que le code contient quelque chose comme:

```javascript
// Extraire le message utilisateur
const userMessage = $input.item.json.question 
                 || $input.item.json.data 
                 || $input.item.json.body 
                 || $input.item.json.message;

// Construire le prompt complet
const fullPrompt = `${systemPrompt}

MESSAGE UTILISATEUR:
${userMessage}

GÉNÈRE MAINTENANT LA RÉPONSE JSON:`;
```

**Si ce code n'existe pas**, l'ajouter APRÈS la définition du `systemPrompt`.

---

### Étape 8: Vérifier le Node LLM

1. Localiser le node LLM (OpenAI, Gemini, etc.)
2. Double-cliquer dessus
3. Vérifier la configuration:

```
Prompt: {{ $json.prompt }}
OU
Prompt: {{ $json.fullPrompt }}

System Message: (LAISSER VIDE)
Temperature: 0.3 à 0.5
Max Tokens: 2000 minimum
```

**IMPORTANT**: Le System Message doit être VIDE. Tout doit être dans le prompt.

---

### Étape 9: Sauvegarder

1. Cliquer sur "Save" en haut à droite du workflow
2. Attendre la confirmation "Workflow saved"

---

### Étape 10: Activer le Workflow

1. Vérifier que le toggle en haut à droite est sur "Active"
2. Si non, cliquer dessus pour activer

---

## 🧪 Test

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

La réponse doit contenir:
- ✅ Cycle: RH (Ressources Humaines)
- ✅ Sujet: Recrutement du Directeur Général
- ✅ Anomalie: Inexistence de procédure
- ✅ Recommandations sur la formalisation de procédures RH

La réponse NE DOIT PAS contenir:
- ❌ Cycle Achats
- ❌ Bons de Commande
- ❌ Fournisseurs
- ❌ Factures

---

## 🔍 Débogage

### Si le Problème Persiste

#### 1. Vérifier que le Message est Reçu

Ajouter un node "Code" AVANT le LLM:

```javascript
const webhook = $input.item.json;

console.log("=== DEBUG MESSAGE ===");
console.log("question:", webhook.question);
console.log("data:", webhook.data);
console.log("body:", webhook.body);
console.log("message:", webhook.message);
console.log("Full webhook:", JSON.stringify(webhook, null, 2));

return { json: webhook };
```

Exécuter le workflow et vérifier les logs.

#### 2. Vérifier que le Prompt Complet est Envoyé

Ajouter un log AVANT le node LLM:

```javascript
console.log("=== PROMPT COMPLET ===");
console.log(fullPrompt);

return { json: { prompt: fullPrompt } };
```

Vérifier que le prompt contient bien le message utilisateur.

#### 3. Vérifier la Réponse du LLM

Ajouter un node "Code" APRÈS le LLM:

```javascript
const llmOutput = $input.item.json.output || $input.item.json.response;

console.log("=== RÉPONSE LLM ===");
console.log(llmOutput);

return { json: { output: llmOutput } };
```

Vérifier que la réponse parle du bon cycle.

---

## 📊 Checklist

- [ ] N8N ouvert
- [ ] Workflow `recos_contrôle_interne_comptable` ouvert
- [ ] Node du prompt localisé
- [ ] Fichier `PROMPT_FINAL_N8N_CASE_25.txt` ouvert
- [ ] Prompt copié
- [ ] Prompt collé dans le node
- [ ] Code pour passer le message utilisateur vérifié/ajouté
- [ ] Node LLM vérifié (System Message vide)
- [ ] Workflow sauvegardé
- [ ] Workflow activé
- [ ] Test effectué avec message RH
- [ ] Réponse parle de RH (pas Achats)

---

## 🚨 Points d'Attention

### Ne PAS Faire

❌ Copier seulement une partie du prompt  
❌ Oublier de passer le message utilisateur au LLM  
❌ Mettre le prompt dans le System Message du LLM  
❌ Oublier de sauvegarder le workflow

### À Faire

✅ Copier TOUT le prompt  
✅ S'assurer que le message utilisateur est inclus dans le prompt  
✅ Mettre TOUT dans le prompt (pas de System Message séparé)  
✅ Sauvegarder et activer le workflow  
✅ Tester avec le message RH

---

## 📞 Support

Si vous rencontrez des difficultés:

1. Vérifier les logs de chaque node
2. S'assurer que le message utilisateur est bien reçu
3. S'assurer que le prompt complet contient le message
4. Vérifier que le LLM reçoit le prompt complet
5. Consulter: `DIAGNOSTIC_FINAL_CASE_25_LLM_IGNORE_MESSAGE.md`

---

**Dernière mise à jour**: 29 Mars 2026  
**Version**: 1.0  
**Fichier source**: PROMPT_FINAL_N8N_CASE_25.txt
