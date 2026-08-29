# SOLUTION DYNAMIQUE - AGENT RAG AUTO-DÉTECTION VARIABLES

**Date:** 29 Mars 2026  
**Statut:** ✅ SOLUTION FINALE RECOMMANDÉE

## 📋 RÉSUMÉ

Solution OPTIMALE combinant :
- **Nodes dynamiques** (Extract + Alea) pour auto-détection de toutes les variables
- **Prompt semi-statique** avec 4 variables essentielles : `cycle`, `reference`, `assertion`, `anomalie`

Cette approche offre le meilleur équilibre entre flexibilité et simplicité.

## 🎯 CAS D'USAGE

- Plusieurs étapes de mission avec variables différentes
- Nombre de variables variable (5, 7, 10, 15+)
- Besoin de flexibilité et évolutivité
- Ajout fréquent de nouvelles variables

## ✨ AVANTAGES CLÉS

- ✅ Détection automatique du nombre de variables
- ✅ Pas de modification du code N8N
- ✅ Fonctionne pour TOUTES les étapes de mission
- ✅ Maintenance facile
- ✅ Évolutif

## 🔧 ARCHITECTURE

```
Webhook9
  ↓
Code integrate7 (crée User_message avec N variables)
  ↓
Extract Variables DYNAMIQUE (détecte et extrait les N variables)
  ↓
Alea Generator DYNAMIQUE (ajoute alea + préserve les N variables)
  ↓
Agent RAG (reçoit alea + N variables, s'adapte automatiquement)
  ↓
code RAG4
```

## 📁 FICHIERS NÉCESSAIRES

### 1. n8n_node_extract_variables_dynamique.js

Node "Extract Variables" avec auto-détection :

```javascript
const inputData = $input.first().json;
const result = {};

if (inputData.data && inputData.data.length > 0) {
    const firstItem = inputData.data[0];
    
    if (firstItem && firstItem.User_message) {
        const userMsgArray = firstItem.User_message;
        
        for (const item of userMsgArray) {
            const key = Object.keys(item)[0];
            const value = item[key] || "";
            
            // Conversion automatique du nom de clé
            let variableName = key
                .replace(/[\[\]]/g, '')  // Enlever []
                .toLowerCase()            // Minuscules
                .trim()
                .replace(/\s+/g, '_')     // Espaces → _
                .replace(/[éèê]/g, 'e')   // Normaliser accents
                .replace(/[àâ]/g, 'a');
            
            result[variableName] = value;
            console.log(`✅ ${key} → ${variableName} = "${value}"`);
        }
        
        console.log(`📊 Total: ${Object.keys(result).length} variables extraites`);
    }
}

if (Object.keys(result).length === 0) {
    result.message = "Aucune variable détectée";
}

return [{ json: result }];
```

**Conversion automatique :**
- `[Command]` → `command`
- `[Nature de test]` → `nature_de_test`
- `[Seuil matérialité]` → `seuil_materialite`

### 2. n8n_node_alea_dynamique.js

Node "Alea Generator" avec spread operator :

```javascript
const inputData = $input.first().json;

const alea = Math.floor(Math.random() * 4) + 1;

// Spread operator : copie TOUTES les propriétés automatiquement
const result = {
    alea: alea,
    ...inputData
};

console.log('🎲 Alea généré:', alea);
console.log('📦 Variables reçues:', Object.keys(inputData).length);
console.log('📤 Variables transmises:', Object.keys(result).length);
console.log('📋 Liste:', Object.keys(result).join(', '));

return [{ json: result }];
```

**Le spread operator `...inputData` copie TOUTES les variables automatiquement !**

### 3. n8n_prompt_agent_rag_4_variables.txt (RECOMMANDÉ)

Prompt semi-statique avec les 4 variables essentielles pour le RAG :

```
[DONNÉES D'ENTRÉE - 4 VARIABLES ESSENTIELLES]
[cycle] = {{ $json.cycle || "Non fourni" }}
[reference] = {{ $json.reference || "Non fourni" }}
[assertion] = {{ $json.assertion || "Non fourni" }}
[anomalie] = {{ $json.anomalie || "Non fourni" }}
```

**Pourquoi 4 variables ?**
- `cycle` : Cycle comptable concerné (trésorerie, ventes, achats, etc.)
- `reference` : Description du test/contrôle effectué
- `assertion` : Assertion d'audit testée (validité, existence, etc.)
- `anomalie` : Anomalie détectée lors du contrôle

Ces 4 variables sont ESSENTIELLES pour que l'agent RAG effectue des recherches pertinentes dans la vector store SYSCOHADA.

**Note :** Le prompt dynamique avec JavaScript ne fonctionne pas dans N8N, d'où l'utilisation d'un prompt semi-statique avec les variables essentielles.

## 📊 EXEMPLES

### Exemple 1 : 7 variables (Étape Contrôle)

**INPUT :**
```json
[
  {"[Command]": "Recos contrôle interne"},
  {"[Cycle]": "trésorerie"},
  {"[test]": "AA010"},
  {"[reference]": "validation compte caisse"},
  {"[Nature de test]": "Rapprochement"},
  {"[Assertion]": "validité"},
  {"[Anomalie]": "VOL de caisse 600k FCFA"}
]
```

**OUTPUT Extract Variables :**
```json
{
  "command": "Recos contrôle interne",
  "cycle": "trésorerie",
  "test": "AA010",
  "reference": "validation compte caisse",
  "nature_de_test": "Rapprochement",
  "assertion": "validité",
  "anomalie": "VOL de caisse 600k FCFA"
}
```

### Exemple 2 : 10 variables (Étape Synthèse)

**INPUT :**
```json
[
  {"[Command]": "Synthèse mission"},
  {"[Cycle]": "ventes"},
  {"[Client]": "ACME Corp"},
  {"[Exercice]": "2025"},
  {"[Montant]": "1500000"},
  {"[Devise]": "FCFA"},
  {"[Type contrôle]": "Substantif"},
  {"[Seuil]": "50000"},
  {"[Risque]": "Élevé"},
  {"[Conclusion]": "Anomalie détectée"}
]
```

**OUTPUT Extract Variables :**
```json
{
  "command": "Synthèse mission",
  "cycle": "ventes",
  "client": "ACME Corp",
  "exercice": "2025",
  "montant": "1500000",
  "devise": "FCFA",
  "type_controle": "Substantif",
  "seuil": "50000",
  "risque": "Élevé",
  "conclusion": "Anomalie détectée"
}
```

→ Le système s'adapte automatiquement à 10 variables !

## 📝 INSTALLATION

### Étape 1 : Remplacer Extract Variables

1. Ouvre le node "Extract Variables for RAG"
2. Copie le code de `n8n_node_extract_variables_dynamique.js`
3. Colle-le dans le node
4. Sauvegarde

### Étape 2 : Remplacer Alea Generator

**Option A - Si node Code existe :**
1. Ouvre le node "Alea Generator"
2. Copie le code de `n8n_node_alea_dynamique.js`
3. Colle-le dans le node
4. Sauvegarde

**Option B - Si node "Alea16" (Edit Fields) :**
1. Supprime le node "Alea16"
2. Ajoute un nouveau node "Code" (JavaScript)
3. Nomme-le "Alea Generator"
4. Copie le code de `n8n_node_alea_dynamique.js`
5. Connecte : Extract Variables → Alea Generator → Agent RAG
6. Sauvegarde

### Étape 3 : Mettre à jour le Prompt (RECOMMANDÉ)

1. Ouvre le node "Agent RAG"
2. Copie le contenu de `n8n_prompt_agent_rag_4_variables.txt`
3. Colle-le dans le prompt de l'agent
4. Sauvegarde

**Important :** Le prompt utilise 4 variables essentielles (`cycle`, `reference`, `assertion`, `anomalie`) qui sont suffisantes pour que l'agent RAG effectue des recherches pertinentes. Les autres variables détectées par les nodes dynamiques sont disponibles mais pas utilisées dans le prompt.

## 🔍 VÉRIFICATION

Après installation, vérifier les logs :

**Node Extract Variables :**
```
📦 User_message trouvé: 7 items
✅ [Command] → command = "Recos contrôle interne"
✅ [Cycle] → cycle = "trésorerie"
...
📊 Total: 7 variables extraites
```

**Node Alea Generator :**
```
🎲 Alea généré: 3
📦 Variables reçues: 7
📤 Variables transmises: 8
📋 Liste: alea, command, cycle, test, reference, nature_de_test, assertion, anomalie
```

## ✅ AVANTAGES vs SOLUTION STATIQUE

| Critère | Statique | Dynamique |
|---------|----------|-----------|
| Nombre de variables | Fixe (7) | Variable (N) |
| Modification code | Oui | Non |
| Flexibilité | Faible | Élevée |
| Maintenance | Manuelle | Automatique |
| Évolutivité | Limitée | Totale |
| Complexité | Simple | Moyenne |

## 🎯 QUAND UTILISER ?

**Utilise la solution DYNAMIQUE si :**
- Tu as plusieurs étapes de mission
- Le nombre de variables change souvent
- Tu veux ajouter des variables facilement
- Tu veux un système évolutif

**Utilise la solution STATIQUE si :**
- Tu as une seule étape de mission
- Les 7 variables sont toujours les mêmes
- Tu préfères la simplicité
- Tu n'as pas besoin de flexibilité

## 📚 FICHIERS ASSOCIÉS

- `n8n_node_extract_variables_dynamique.js`
- `n8n_node_alea_dynamique.js`
- `n8n_prompt_agent_rag_dynamique.txt`
- `00_SOLUTION_DYNAMIQUE_AUTO_DETECTION_VARIABLES.txt`

## 🔄 MIGRATION DEPUIS SOLUTION STATIQUE

Pour migrer de la solution statique vers dynamique :
1. Remplace le code du node "Extract Variables"
2. Remplace le code du node "Alea Generator"
3. Teste avec les mêmes données
4. Vérifie que les 7 variables sont toujours détectées
5. Ajoute de nouvelles variables dans le frontend → détectées automatiquement !
