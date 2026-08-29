# Prompt Système Corrigé - Workflow N8N Case 25

**Date**: 29 Mars 2026  
**Problème**: Le LLM retourne des placeholders littéraux au lieu de contenu réel  
**Solution**: Nouveau prompt sans placeholders, avec instructions claires

---

## 🔴 Problème Actuel

Le workflow retourne:
```
[Titre de l'anomalie basé sur le cycle et l'anomalie mentionnés]
[Description des travaux effectués et du contexte SPÉCIFIQUE au cycle mentionné]
[Constat détaillé de l'anomalie SPÉCIFIQUE mentionnée dans le message]
```

**Cause**: Le prompt système montre un exemple avec des placeholders entre crochets, et le LLM les copie tels quels.

---

## ✅ Solution: Nouveau Prompt Système

### À Copier dans le Node "Recos controle interne comptable"

```
Vous êtes un expert en contrôle interne comptable SYSCOHADA.

Votre mission: Analyser le message utilisateur et générer des recommandations de contrôle interne comptable détaillées et spécifiques.

Le message utilisateur contient:
- Command: Type de recommandation demandée
- Cycle: Cycle comptable concerné (RH, Ventes, Achats, Trésorerie, Immobilisations, etc.)
- test: Référence du test d'audit
- reference: Description du test effectué
- Nature de test: Type de test (Rapprochement, Observation, Inspection, etc.)
- Assertion: Assertion d'audit testée (Validité, Exhaustivité, Exactitude, etc.)
- Anomalie: Anomalie constatée lors du test

Vous devez générer une réponse au format JSON avec cette structure exacte:

{
  "Etape mission - Programme": [
    {
      "Intitule": "Votre titre ici"
    },
    {
      "Observation": "Votre observation ici"
    },
    {
      "Constat": "Votre constat ici"
    },
    {
      "Risque": "Vos risques ici"
    },
    {
      "Recommendation": "Vos recommandations ici"
    }
  ]
}

INSTRUCTIONS CRITIQUES:

1. ADAPTEZ le contenu au CYCLE mentionné dans le message
   - Si Cycle = RH → Parlez de ressources humaines, recrutement, paie, etc.
   - Si Cycle = Ventes → Parlez de clients, facturation, recouvrement, etc.
   - Si Cycle = Trésorerie → Parlez de caisse, banque, rapprochements, etc.

2. ADAPTEZ le contenu à l'ANOMALIE mentionnée
   - Décrivez l'anomalie spécifique constatée
   - Expliquez les risques liés à cette anomalie précise
   - Proposez des recommandations pour corriger cette anomalie

3. NE COPIEZ PAS les placeholders
   - N'écrivez JAMAIS: "[Titre de l'anomalie...]"
   - N'écrivez JAMAIS: "[Description des travaux...]"
   - Écrivez du contenu RÉEL et SPÉCIFIQUE

4. EXEMPLE de ce qu'il NE FAUT PAS faire:
   ❌ "Intitule": "[Titre de l'anomalie basé sur le cycle]"
   ❌ "Observation": "[Description des travaux effectués]"

5. EXEMPLE de ce qu'il FAUT faire (pour un message sur RH/Recrutement):
   ✅ "Intitule": "Absence de procédure formalisée de recrutement du Directeur Administratif et Financier"
   ✅ "Observation": "Lors de nos travaux de contrôle sur le cycle Ressources Humaines, nous avons examiné les procédures de recrutement des cadres dirigeants. Nous avons constaté qu'aucune procédure formalisée n'existe pour le recrutement du DAF depuis janvier 2002."

Générez maintenant votre réponse en suivant ces instructions.
```

---

## 🔧 Instructions de Mise en Place

### Dans N8N:

1. Ouvrir le workflow: `recos_contrôle_interne_comptable`

2. Localiser le node qui contient le prompt système (probablement nommé "Recos controle interne comptable" ou "Set" ou "Code")

3. Remplacer COMPLÈTEMENT le prompt système actuel par le nouveau prompt ci-dessus

4. S'assurer que le message utilisateur est bien passé au LLM:
   ```javascript
   const userMessage = $input.item.json.question || $input.item.json.data;
   const systemPrompt = `[Le nouveau prompt ci-dessus]`;
   
   const fullPrompt = `${systemPrompt}\n\nMessage utilisateur:\n${userMessage}`;
   ```

5. Sauvegarder le workflow

6. Activer le workflow

---

## 🧪 Test Après Correction

### Message Test:

```
[Command] : Recos contrôle interne comptable
[Cycle] : RH
[test] : AA010
[reference] : test sur la validation du process DRH
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = Absence de procedure de recrutement du DAF depuis janvier 2002
```

### Résultat Attendu:

La réponse doit contenir du contenu RÉEL comme:

```json
{
  "Etape mission - Programme": [
    {
      "Intitule": "Absence de procédure formalisée de recrutement du Directeur Administratif et Financier"
    },
    {
      "Observation": "Lors de nos travaux de contrôle sur le cycle Ressources Humaines, nous avons examiné les procédures de recrutement des cadres dirigeants. Nous avons constaté qu'aucune procédure formalisée n'existe pour le recrutement du DAF depuis janvier 2002."
    },
    {
      "Constat": "L'absence de procédure de recrutement formalisée pour le poste de DAF expose l'organisation à des risques de recrutement inadéquat, de non-respect des critères de compétence requis, et de manque de traçabilité dans le processus de sélection."
    },
    {
      "Risque": "Risque de recrutement d'un profil inadéquat pour un poste stratégique, risque de non-conformité aux exigences réglementaires, risque de litige en cas de contestation du processus de recrutement, risque de perte de crédibilité auprès des parties prenantes."
    },
    {
      "Recommendation": "Formaliser une procédure de recrutement pour les postes de direction incluant: définition du profil de poste, processus de sélection (annonce, présélection, entretiens, tests), critères d'évaluation, validation par le conseil d'administration, et documentation complète du processus."
    }
  ]
}
```

### Résultat à ÉVITER:

❌ Ne doit PAS contenir:
```
"Intitule": "[Titre de l'anomalie basé sur le cycle et l'anomalie mentionnés]"
"Observation": "[Description des travaux effectués...]"
```

---

## 📊 Checklist de Vérification

- [ ] Nouveau prompt système copié dans n8n
- [ ] Prompt ne contient AUCUN placeholder entre crochets
- [ ] Message utilisateur bien passé au LLM
- [ ] Workflow sauvegardé et activé
- [ ] Test effectué avec message RH/Recrutement
- [ ] Réponse contient du contenu RÉEL (pas de placeholders)
- [ ] Réponse parle de RH/Recrutement (pas de caisse)
- [ ] Toutes les rubriques sont remplies avec du contenu spécifique

---

## 🚨 Points Critiques

### Ce qui causait le problème:

1. ❌ Prompt système montrait un exemple avec placeholders: `[Titre de l'anomalie...]`
2. ❌ LLM copiait les placeholders au lieu de les remplacer
3. ❌ Pas d'instructions claires sur ce qu'il NE FAUT PAS faire

### Ce qui corrige le problème:

1. ✅ Prompt système sans aucun placeholder
2. ✅ Instructions explicites: "NE COPIEZ PAS les placeholders"
3. ✅ Exemples de ce qu'il FAUT faire vs ce qu'il NE FAUT PAS faire
4. ✅ Instructions d'adaptation au cycle et à l'anomalie

---

**Dernière mise à jour**: 29 Mars 2026  
**Version**: 2.0 (Correction placeholders)  
**Statut**: Prêt à tester
