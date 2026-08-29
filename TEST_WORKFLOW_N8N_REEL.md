# 🔍 Test du Workflow N8N Réel

## 📊 Votre Workflow Actuel

Votre workflow `htlm_processor` est complexe avec 10 nœuds :

```
webhook_htlm 
  → Edit Fields htlm3 
  → Htlm to json dynamique 
  → Switch8 (7 sorties)
  → Code in JavaScript3
  → HTTP Request dynamique (/webhook/template)
  → Code in JavaScript1
  → Json clean etape Frap V5 ok 9
  → Markdown Generator1 corrige16
  → Respond to Webhook14
```

## ❌ Pourquoi Réponse Vide ?

Le **Switch8** route les données selon l'étape détectée :
- Frap
- Synthèse
- Rapport provisoire
- Rapport final
- Suivi des recos
- **Etape** ← Probablement ce que vous voulez

Si les données ne correspondent à **aucune condition**, elles ne passent pas et **aucune réponse n'est renvoyée**.

---

## 🧪 Test 1 : Vérifier la Réception

1. **Ouvrez n8n** : `http://localhost:5678`
2. **Ouvrez votre workflow** "htlm_processor"
3. **Cliquez sur "Executions"** (en haut)
4. **Regardez les 3 dernières exécutions** (vos tests)

**Questions** :
- ✅ Le webhook a-t-il reçu les données ?
- ❌ À quel nœud l'exécution s'arrête-t-elle ?
- ❌ Y a-t-il une erreur ?

---

## 🧪 Test 2 : Tester avec les Bonnes Données

Votre Switch8 cherche cette condition pour la sortie "Etape" :

```javascript
$json['Processus - étape Programme'][4]['table 5'].user_message
```

Cela signifie qu'il attend un JSON avec :
- Une clé `"Processus - étape Programme"`
- Un array avec au moins 5 éléments (index 4)
- L'élément 4 doit avoir une clé `"table 5"`
- `table 5` doit avoir une propriété `user_message`
- `user_message` doit contenir le mot "Etape"

**Problème** : Flowise.js envoie juste :

```json
{
  "question": "<table>...</table>"
}
```

Ce n'est **PAS** le format attendu par le Switch8 !

---

## 🎯 Solution 1 : Modifier Flowise.js

Flowise.js doit envoyer les données dans le format attendu par votre workflow.

Actuellement, Flowise.js envoie :
```json
{
  "question": "HTML_DES_TABLES"
}
```

Votre workflow attend que `Htlm to json dynamique` transforme cela en :
```json
{
  "Processus - étape Programme": [
    { "table 1": {...} },
    { "table 2": {...} },
    { "table 3": {...} },
    { "table 4": {...} },
    { "table 5": { "user_message": "..." } }
  ]
}
```

**Vérification** : Le nœud "Htlm to json dynamique" fait-il cette transformation ?

---

## 🎯 Solution 2 : Ajouter une Sortie par Défaut au Switch8

Modifiez le Switch8 pour ajouter une sortie "Fallback" qui capture tout ce qui ne correspond pas aux autres conditions.

1. Dans n8n, ouvrez le nœud **Switch8**
2. Ajoutez une nouvelle règle **en dernier** :
   - Condition : `true` (toujours vrai)
   - Output : "Default"
3. Connectez cette sortie à **Code in JavaScript3**

Ainsi, même si les données ne correspondent pas exactement, elles seront traitées.

---

## 🎯 Solution 3 : Simplifier le Test

Créons un payload de test qui correspond exactement à ce que votre workflow attend :

```json
{
  "question": "<table class=\"min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-6\"><thead><tr><th class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold\">Propriété</th><th class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold\">Valeur</th></tr></thead><tbody><tr><td class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-bold\">Etape</td><td class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm\">Programme</td></tr><tr><td class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-bold\">Référence</td><td class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm\">Programme-001</td></tr></tbody></table><table class=\"min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-2\"><thead><tr><th class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold\">Flowise</th></tr></thead><tbody><tr><td class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm\">CIA</td></tr></tbody></table><table class=\"min-w-full border border-gray-200 dark:border-gray-700 rounded-lg\"><thead><tr><th class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold\">user_message</th></tr></thead><tbody><tr><td class=\"px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm\">[Command] = Programme de travail<br>[Processus] = Sécurité trésorerie<br>[Nb de lignes] = 25</td></tr></tbody></table>"
}
```

---

## 📊 Diagnostic dans n8n

### Étape 1 : Vérifier "Htlm to json dynamique"

1. Ouvrez le nœud **"Htlm to json dynamique"**
2. Regardez le code JavaScript
3. Vérifiez qu'il transforme bien le HTML en JSON avec la structure :
   ```json
   {
     "Processus - étape XXX": [...]
   }
   ```

### Étape 2 : Vérifier le Switch8

1. Ouvrez le nœud **Switch8**
2. Regardez les conditions
3. La sortie "Etape" (index 6) cherche :
   ```javascript
   $json['Processus - étape Programme'][4]['table 5'].user_message
   ```
4. Vérifiez que vos données ont bien cette structure

### Étape 3 : Tester Manuellement

1. Dans n8n, cliquez sur le nœud **webhook_htlm**
2. Cliquez sur **"Listen for Test Event"**
3. Envoyez un test depuis `test-envoi-n8n-complet.html`
4. Regardez les données qui arrivent dans chaque nœud

---

## 🎯 Action Immédiate

**Faites ceci maintenant** :

1. Ouvrez n8n : `http://localhost:5678`
2. Allez dans **Executions**
3. Cliquez sur la dernière exécution
4. **Partagez-moi** :
   - À quel nœud l'exécution s'arrête ?
   - Y a-t-il une erreur ?
   - Quelle est la structure des données après "Htlm to json dynamique" ?

Cela me permettra de vous dire exactement où le problème se situe et comment le corriger ! 🎯
