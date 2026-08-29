# 🔗 Intégration Flowise - Examen CIA

## 📋 Vue d'ensemble

Ce document explique comment configurer votre endpoint Flowise pour générer des questionnaires d'examen CIA compatibles avec le script `examen_cia.js`.

## 🎯 Format de table requis

### Structure minimale
```markdown
| Option | Reponse_user |
|--------|--------------|
| A      |              |
| B      |              |
| C      |              |
| D      |              |
```

### Structure complète (recommandée)
```markdown
| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
|--------------|----------|--------|--------------|-------------|-----------|
| Q1.1         | Texte... | A      |              | Non         | Info...   |
| Q1.1         | Texte... | B      |              | Oui         | Info...   |
| Q1.1         | Texte... | C      |              | Non         | Info...   |
| Q1.1         | Texte... | D      |              | Non         | Info...   |
```

## 🤖 Prompt Flowise recommandé

### Exemple de prompt pour générer des questions

```
Tu es un expert en audit interne certifié CIA. Génère une question d'examen CIA au format suivant:

IMPORTANT: Utilise EXACTEMENT ce format de table Markdown:

| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
|--------------|----------|--------|--------------|-------------|-----------|
| Q{numéro}    | {texte de la question} | A. {option A} |  | {Oui/Non} | {explication} |
| Q{numéro}    | {texte de la question} | B. {option B} |  | {Oui/Non} | {explication} |
| Q{numéro}    | {texte de la question} | C. {option C} |  | {Oui/Non} | {explication} |
| Q{numéro}    | {texte de la question} | D. {option D} |  | {Oui/Non} | {explication} |

Règles:
1. La colonne Ref_question doit être identique pour toutes les lignes d'une même question
2. La colonne Question doit être identique pour toutes les lignes d'une même question
3. La colonne Reponse_user doit rester VIDE (l'utilisateur cochera sa réponse)
4. La colonne Reponse_cia contient "Oui" pour la bonne réponse, "Non" pour les autres
5. La colonne Remarques contient une brève explication de chaque option

Génère maintenant une question sur le thème: {thème}
```

### Exemple de réponse attendue

```markdown
| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
|--------------|----------|--------|--------------|-------------|-----------|
| Q1.1 | Quelle est la principale responsabilité de l'audit interne selon l'IIA? | A. Détecter les fraudes |  | Non | L'audit interne ne se limite pas à la détection de fraudes |
| Q1.1 | Quelle est la principale responsabilité de l'audit interne selon l'IIA? | B. Fournir une assurance et des conseils |  | Oui | C'est la définition officielle de l'IIA |
| Q1.1 | Quelle est la principale responsabilité de l'audit interne selon l'IIA? | C. Remplacer l'audit externe |  | Non | L'audit interne complète mais ne remplace pas l'audit externe |
| Q1.1 | Quelle est la principale responsabilité de l'audit interne selon l'IIA? | D. Gérer les risques opérationnels |  | Non | L'audit interne évalue mais ne gère pas les risques |
```

## 🔧 Configuration Flowise

### 1. Créer un nouveau workflow

#### Nœud 1: Chat Model
- **Type**: OpenAI / Anthropic / Ollama
- **Model**: gpt-4 / claude-3 / llama3
- **Temperature**: 0.3 (pour plus de cohérence)

#### Nœud 2: Prompt Template
```
System: Tu es un expert en audit interne certifié CIA. Tu génères des questions d'examen au format Markdown avec des tables.

User: {input}

IMPORTANT: 
- Utilise EXACTEMENT le format de table Markdown spécifié
- La colonne Reponse_user doit rester VIDE
- Répète la Ref_question et la Question pour chaque option
- Mets "Oui" dans Reponse_cia pour la bonne réponse uniquement
```

#### Nœud 3: Conversation Chain
- **Chat Model**: Connecter au nœud 1
- **Prompt**: Connecter au nœud 2
- **Memory**: Buffer Memory (optionnel)

### 2. Variables d'entrée

```javascript
{
  "input": "Génère une question CIA sur l'indépendance de l'audit interne",
  "theme": "Indépendance",
  "niveau": "Intermédiaire",
  "nombre_options": 4
}
```

### 3. Exemple de configuration JSON

```json
{
  "nodes": [
    {
      "id": "chatModel_0",
      "type": "ChatOpenAI",
      "data": {
        "modelName": "gpt-4",
        "temperature": 0.3,
        "maxTokens": 2000
      }
    },
    {
      "id": "promptTemplate_0",
      "type": "PromptTemplate",
      "data": {
        "template": "Tu es un expert CIA. Génère une question au format:\n\n| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |\n|--------------|----------|--------|--------------|-------------|-----------|\n\nThème: {theme}\nNiveau: {niveau}\n\nGénère {nombre_options} options."
      }
    },
    {
      "id": "conversationChain_0",
      "type": "ConversationChain",
      "data": {
        "chatModel": "{{chatModel_0}}",
        "prompt": "{{promptTemplate_0}}"
      }
    }
  ]
}
```

## 📊 Formats de table supportés

### Format 1: Complet (recommandé)
```markdown
| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
```
✅ Toutes les fonctionnalités activées

### Format 2: Standard
```markdown
| Ref_question | Question | Option | Reponse_user |
```
✅ Fonctionnalités de base

### Format 3: Minimaliste
```markdown
| Option | Reponse_user |
```
✅ Fonctionnel mais limité

### Format 4: Avec variations
```markdown
| ref question | question | option | reponse user | REPONSE CIA | remarque |
```
✅ Détection automatique des variations

## 🎨 Personnalisation du prompt

### Ajouter des métadonnées
```markdown
## Examen CIA - Part 1

**Durée**: 3 heures  
**Questions**: 125  
**Date**: 15 Janvier 2024

| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
|--------------|----------|--------|--------------|-------------|-----------|
| ... | ... | ... | ... | ... | ... |
```

### Générer plusieurs questions
```
Génère 5 questions CIA sur les thèmes suivants:
1. Indépendance de l'audit interne
2. Normes IIA
3. Gestion des risques
4. Contrôle interne
5. Gouvernance

Pour chaque question, utilise le format de table Markdown avec 4 options (A, B, C, D).
```

### Adapter le niveau de difficulté
```
Niveau: {niveau}
- Débutant: Questions de définition et concepts de base
- Intermédiaire: Questions d'application et d'analyse
- Avancé: Questions de synthèse et de cas pratiques

Génère une question de niveau {niveau} sur {thème}.
```

## 🔄 Workflow complet

### 1. L'utilisateur envoie une demande
```
"Génère une question CIA sur l'indépendance"
```

### 2. Flowise génère la table
```markdown
| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
|--------------|----------|--------|--------------|-------------|-----------|
| Q1.1 | ... | A | | Non | ... |
| Q1.1 | ... | B | | Oui | ... |
| Q1.1 | ... | C | | Non | ... |
| Q1.1 | ... | D | | Non | ... |
```

### 3. Le script examen_cia.js détecte la table
```javascript
🎓 [Examen CIA] Table d'examen CIA détectée: exam-cia-1234567890-abc123
```

### 4. Configuration automatique
- ✅ Checkboxes ajoutées dans Reponse_user
- ✅ Reponse_cia et Remarques masquées
- ✅ Ref_question et Question fusionnées

### 5. L'utilisateur répond
- Clic sur une checkbox → Sauvegarde automatique
- Rechargement → Restauration automatique

## 🧪 Tester l'intégration

### 1. Créer un endpoint de test
```bash
# Dans Flowise
POST /api/v1/prediction/{chatflowId}

Body:
{
  "question": "Génère une question CIA sur l'indépendance",
  "overrideConfig": {
    "temperature": 0.3
  }
}
```

### 2. Vérifier la réponse
La réponse doit contenir une table Markdown valide.

### 3. Tester dans Claraverse
1. Envoyer la demande dans le chat
2. Vérifier que la table s'affiche
3. Vérifier que les checkboxes apparaissent
4. Cocher une réponse
5. Recharger la page
6. Vérifier que la réponse est restaurée

## 📝 Exemples de prompts utilisateur

### Prompt simple
```
"Génère une question CIA"
```

### Prompt avec thème
```
"Génère une question CIA sur les normes IIA"
```

### Prompt avec niveau
```
"Génère une question CIA de niveau avancé sur la gestion des risques"
```

### Prompt pour un examen complet
```
"Génère un examen CIA de 10 questions couvrant:
- Indépendance (2 questions)
- Normes IIA (3 questions)
- Gestion des risques (2 questions)
- Contrôle interne (2 questions)
- Gouvernance (1 question)"
```

## 🔍 Validation de la table

### Vérifier le format
```javascript
// Dans la console du navigateur
const tables = document.querySelectorAll('table');
tables.forEach((table, index) => {
  const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent.trim());
  console.log(`Table ${index + 1}:`, headers);
});
```

### Vérifier la détection
```javascript
window.examenCIA.debug()
```

## 🐛 Dépannage

### La table n'est pas détectée
**Cause**: Format de table incorrect

**Solution**: Vérifier que la table contient au moins une colonne avec "reponse_user" ou "option"

### Les checkboxes ne s'affichent pas
**Cause**: Colonne Reponse_user manquante ou mal nommée

**Solution**: Ajouter la variation dans `CONFIG.columnVariations.reponse_user`

### Les colonnes ne sont pas masquées
**Cause**: Noms de colonnes non reconnus

**Solution**: Vérifier les variations dans `CONFIG.columnVariations`

## 📚 Ressources

- **Documentation Flowise**: https://docs.flowiseai.com/
- **Guide Examen CIA**: `GUIDE_EXAMEN_CIA.md`
- **Code source**: `public/examen_cia.js`
- **Page de test**: `public/test-examen-cia.html`

## ✅ Checklist d'intégration

- [ ] Endpoint Flowise créé
- [ ] Prompt configuré avec le format de table
- [ ] Test de génération de table
- [ ] Vérification du format Markdown
- [ ] Test dans Claraverse
- [ ] Vérification de la détection automatique
- [ ] Test des checkboxes
- [ ] Test de la persistance
- [ ] Test de la restauration

---

**Intégration prête ! 🎉**

Pour toute question, consulter `GUIDE_EXAMEN_CIA.md`
