# SOLUTION STATIQUE - AGENT RAG 7 VARIABLES FIXES

**Date:** 29 Mars 2026  
**Statut:** ✅ Fonctionnel - Pour nombre fixe de variables

## 📋 RÉSUMÉ

Solution pour transmettre un nombre FIXE de 7 variables à l'agent RAG N8N.
Idéal quand les variables sont toujours les mêmes pour une étape de mission.

## 🎯 CAS D'USAGE

- Étape de mission avec variables fixes
- Workflow simple avec 7 variables connues
- Pas besoin de flexibilité

## 📦 VARIABLES SUPPORTÉES (7)

1. `command` - Commande/type de mission
2. `cycle` - Cycle comptable concerné
3. `test` - Code du test effectué
4. `reference` - Description du test
5. `nature_test` - Nature du test (rapprochement, etc.)
6. `assertion` - Assertion d'audit testée
7. `anomalie` - Anomalie détectée

## 🔧 ARCHITECTURE

```
Webhook9
  ↓
Code integrate7 (crée User_message avec 7 clés)
  ↓
Extract Variables for RAG (extrait les 7 variables)
  ↓
Alea16 (ajoute alea + préserve les 7 variables)
  ↓
Agent RAG (reçoit 8 valeurs : alea + 7 variables)
  ↓
code RAG4
```

## 📁 FICHIERS NÉCESSAIRES

### 1. n8n_node_extract_variables_rag_complet.js

Node "Extract Variables for RAG" qui extrait les 7 variables avec mapping EXACT :

```javascript
const inputData = $input.first().json;

const result = {
    command: "Non fourni",
    cycle: "Non fourni",
    test: "Non fourni",
    reference: "Non fourni",
    nature_test: "Non fourni",
    assertion: "Non fourni",
    anomalie: "Non fourni"
};

// Extraire les variables depuis User_message
if (inputData.data && inputData.data.length > 0) {
    const firstItem = inputData.data[0];
    
    if (firstItem && firstItem.User_message) {
        const userMsgArray = firstItem.User_message;
        
        for (const item of userMsgArray) {
            const key = Object.keys(item)[0];
            const value = item[key] || "";
            
            // Mapping EXACT des 7 clés frontend
            if (key === '[Command]') {
                result.command = value;
            } else if (key === '[Cycle]') {
                result.cycle = value;
            } else if (key === '[test]') {
                result.test = value;
            } else if (key === '[reference]') {
                result.reference = value;
            } else if (key === '[Nature de test]') {
                result.nature_test = value;
            } else if (key === '[Assertion]') {
                result.assertion = value;
            } else if (key === '[Anomalie]') {
                result.anomalie = value;
            }
        }
    }
}

return [{ json: result }];
```

### 2. n8n_node_alea16_remplacement_code.js

Node "Alea Generator" qui préserve les 7 variables :

```javascript
const inputData = $input.first().json;

const alea = Math.floor(Math.random() * 4) + 1;

const result = {
    alea: alea,
    command: inputData.command || "Non fourni",
    cycle: inputData.cycle || "Non fourni",
    test: inputData.test || "Non fourni",
    reference: inputData.reference || "Non fourni",
    nature_test: inputData.nature_test || "Non fourni",
    assertion: inputData.assertion || "Non fourni",
    anomalie: inputData.anomalie || "Non fourni"
};

return [{ json: result }];
```

### 3. n8n_prompt_agent_rag_7_variables.txt

Prompt agent RAG avec les 7 variables :

```
[DONNÉES D'ENTRÉE - 7 VARIABLES]
[command] = {{ $json.command || "Non fourni" }}
[cycle] = {{ $json.cycle || "Non fourni" }}
[test] = {{ $json.test || "Non fourni" }}
[reference] = {{ $json.reference || "Non fourni" }}
[nature_test] = {{ $json.nature_test || "Non fourni" }}
[assertion] = {{ $json.assertion || "Non fourni" }}
[anomalie] = {{ $json.anomalie || "Non fourni" }}
```

## 📊 MAPPING DES VARIABLES

| Frontend | Node Extract | Agent RAG |
|----------|--------------|-----------|
| [Command] | command | {{ $json.command }} |
| [Cycle] | cycle | {{ $json.cycle }} |
| [test] | test | {{ $json.test }} |
| [reference] | reference | {{ $json.reference }} |
| [Nature de test] | nature_test | {{ $json.nature_test }} |
| [Assertion] | assertion | {{ $json.assertion }} |
| [Anomalie] | anomalie | {{ $json.anomalie }} |

## ✅ AVANTAGES

- Simple à comprendre
- Variables explicites
- Facile à débugger
- Pas de surprise

## ❌ INCONVÉNIENTS

- Nombre de variables fixe (7)
- Modification du code si ajout de variables
- Pas flexible pour d'autres étapes de mission
- Maintenance manuelle

## 📝 INSTALLATION

1. Remplacer le code du node "Extract Variables for RAG"
2. Remplacer le code du node "Alea16" (ou créer un node Code)
3. Mettre à jour le prompt de l'agent RAG
4. Tester le workflow

## 🔍 VÉRIFICATION

Après installation, vérifier :
- ✓ Output "Extract Variables" : 7 variables extraites
- ✓ Output "Alea Generator" : alea + 7 variables
- ✓ Prompt agent RAG : 7 variables affichées avec valeurs

## 📚 FICHIERS ASSOCIÉS

- `n8n_node_extract_variables_rag_complet.js`
- `n8n_node_alea16_remplacement_code.js`
- `n8n_prompt_agent_rag_7_variables.txt`
- `00_CORRECTION_MAPPING_7_VARIABLES_29_MARS_2026.txt`
- `00_AJOUT_ASSERTION_REFERENCE_PROMPT_RAG.txt`

## 🔄 MIGRATION VERS SOLUTION DYNAMIQUE

Si tu as besoin de flexibilité (nombre variable de variables), voir :
- `00_SOLUTION_AGENT_RAG_VARIABLES_DYNAMIQUE.md`
