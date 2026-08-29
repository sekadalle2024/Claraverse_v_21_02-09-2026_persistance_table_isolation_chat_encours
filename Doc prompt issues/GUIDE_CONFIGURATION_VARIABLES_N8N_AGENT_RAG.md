# Guide Configuration Variables N8N - Agent RAG

## Problème Identifié

L'agent RAG affiche `[undefined]` pour toutes les variables au lieu des valeurs réelles.

## Solution : Syntaxe N8N Correcte

### ❌ Syntaxe Incorrecte (Actuelle)

```
[user_message] = [undefined]
[cycle_detecte] = [undefined]
[constat] = [undefined]
[anomalie] = [undefined]
```

### ✅ Syntaxe Correcte (À Utiliser)

```
[user_message] = {{ $json.user_message || $json.message || "Message non fourni" }}
[cycle_detecte] = {{ $json.cycle || "Non détecté" }}
[constat] = {{ $json.constat || "Non fourni" }}
[anomalie] = {{ $json.anomalie || "Non fournie" }}
```

## Explication de la Syntaxe N8N

### 1. Syntaxe de Base

```javascript
{{ $json.nom_variable }}
```

- `{{` et `}}` : Délimiteurs N8N pour l'interpolation
- `$json` : Objet JSON du node précédent
- `.nom_variable` : Accès à la propriété

### 2. Avec Valeur par Défaut (Recommandé)

```javascript
{{ $json.variable || "valeur_par_defaut" }}
```

L'opérateur `||` fournit une valeur de secours si la variable est `null`, `undefined` ou vide.

### 3. Accès Multiple avec Fallback

```javascript
{{ $json.user_message || $json.message || "Message non fourni" }}
```

Essaie plusieurs chemins avant d'utiliser la valeur par défaut.

## Configuration dans N8N

### Étape 1 : Structure des Données en Entrée

Assurez-vous que le node AVANT l'agent RAG envoie :

```json
{
  "user_message": "Facture fournisseur non comptabilisée",
  "cycle": "Achats",
  "constat": "Facture reçue mais pas enregistrée",
  "anomalie": "Charge non comptabilisée"
}
```

### Étape 2 : Configuration du Prompt Agent RAG

Dans le node "AI Agent" :

1. Ouvrir le champ "System Message" ou "Prompt"
2. Remplacer les sections [DONNÉES D'ENTRÉE] par :

```
[DONNÉES D'ENTRÉE]
[user_message] = {{ $json.user_message || $json.message || "Message non fourni" }}
[cycle_detecte] = {{ $json.cycle || "Non détecté" }}
[constat] = {{ $json.constat || "Non fourni" }}
[anomalie] = {{ $json.anomalie || "Non fournie" }}
```

### Étape 3 : Correction des Queries RAG

Dans les instructions de recherche, remplacer :

❌ **AVANT :**
```
Query → "compte [undefined] SYSCOHADA fonctionnement débit crédit"
```

✅ **APRÈS :**
```
Query → "compte {{ $json.cycle || "comptable" }} SYSCOHADA fonctionnement débit crédit"
```

## Exemples de Syntaxe N8N Avancée

### 1. Accès depuis un Node Spécifique

```javascript
{{ $('Router').item.json.cycle }}
```

### 2. Condition Ternaire

```javascript
{{ $json.cycle ? $json.cycle : "Cycle non défini" }}
```

### 3. Concaténation

```javascript
{{ "Cycle : " + $json.cycle + " - Anomalie : " + $json.anomalie }}
```

### 4. Accès à un Tableau

```javascript
{{ $json.items[0].compte }}
```

### 5. Transformation

```javascript
{{ $json.cycle.toUpperCase() }}
```

## Debugging des Variables

### Méthode 1 : Node Set de Debug

Ajouter un node "Set" AVANT l'agent RAG :

```json
{
  "debug_user_message": "{{ $json.user_message }}",
  "debug_cycle": "{{ $json.cycle }}",
  "debug_constat": "{{ $json.constat }}",
  "debug_anomalie": "{{ $json.anomalie }}",
  "debug_all": "{{ JSON.stringify($json) }}"
}
```

### Méthode 2 : Console du Node

1. Cliquer sur le node précédent
2. Voir l'onglet "Output"
3. Vérifier la structure JSON

### Méthode 3 : Expression Editor

Dans N8N, utiliser l'éditeur d'expressions :
1. Cliquer sur l'icône "fx" à côté du champ
2. Tester l'expression
3. Voir le résultat en temps réel

## Erreurs Courantes et Solutions

### Erreur 1 : Variable Undefined

**Symptôme :** `{{ $json.cycle }}` retourne `undefined`

**Causes possibles :**
- Le nom de la variable est incorrect
- Le node précédent n'envoie pas cette variable
- La structure JSON est différente

**Solution :**
```javascript
{{ $json.cycle || "Valeur par défaut" }}
```

### Erreur 2 : Syntaxe Invalide

**Symptôme :** Erreur de parsing dans N8N

**Causes possibles :**
- Accolades simples au lieu de doubles : `{ $json.var }`
- Guillemets mal fermés

**Solution :**
```javascript
{{ $json.variable || "défaut" }}
```

### Erreur 3 : Accès à une Propriété Nested

**Symptôme :** `{{ $json.data.cycle }}` ne fonctionne pas

**Solution :**
```javascript
{{ $json.data?.cycle || "Non défini" }}
```

L'opérateur `?.` (optional chaining) évite les erreurs si `data` est `null`.

## Template Complet pour Agent RAG

```
[DONNÉES D'ENTRÉE]
Message utilisateur : {{ $json.user_message || $json.message || "Non fourni" }}
Cycle détecté : {{ $json.cycle || "Non détecté" }}
Constat : {{ $json.constat || "Non fourni" }}
Anomalie : {{ $json.anomalie || "Non fournie" }}

[CONTEXTE ADDITIONNEL]
Date : {{ $json.date || new Date().toISOString() }}
Utilisateur : {{ $json.user || "Système" }}
```

## Validation de la Configuration

### Checklist

- [ ] Les variables utilisent la syntaxe `{{ }}`
- [ ] Chaque variable a une valeur par défaut avec `||`
- [ ] Les noms de variables correspondent au JSON d'entrée
- [ ] Le node précédent envoie bien les données
- [ ] Test effectué avec des données réelles
- [ ] L'output de l'agent RAG affiche les bonnes valeurs

### Test Rapide

Envoyer ce JSON de test :

```json
{
  "user_message": "Test de variables",
  "cycle": "Achats",
  "constat": "Test constat",
  "anomalie": "Test anomalie"
}
```

Vérifier que le prompt affiche :
```
[user_message] = Test de variables
[cycle_detecte] = Achats
[constat] = Test constat
[anomalie] = Test anomalie
```

## Ressources

- Documentation N8N : https://docs.n8n.io/code-examples/expressions/
- Fichier prompt corrigé : `n8n_prompt_agent_rag_variables_corrige.txt`
- Guide complet : `00_SOLUTION_VARIABLES_AGENT_RAG_N8N.txt`
