# 📊 Guide des Logs N8N - Diagnostic Détaillé

## 🎯 Objectif

Ce guide vous aide à comprendre les logs détaillés pour diagnostiquer les problèmes de réponse n8n.

## 🔍 Où Voir les Logs

**Console du navigateur** : Appuyez sur `F12` puis allez dans l'onglet "Console"

## 📋 Logs Détaillés - Ce Que Vous Verrez

### ✅ Exemple de Logs RÉUSSIS

```
═══════════════════════════════════════════════════════
📡 ENVOI VERS N8N
═══════════════════════════════════════════════════════
🎯 Endpoint: https://xomava4845.app.n8n.cloud/webhook/htlm_processor
📦 Taille payload: 2543 caractères
🔑 Mot-clé: Programme de travail
⏱️ Durée requête: 1234ms
✅ Réponse reçue ! Statut: 200 OK
📄 Lecture du body...
📏 Taille reçue: 5678 caractères          ← IMPORTANT: > 0 !
📄 Premiers 200 caractères: {"output":"# Résultat..."}
   ... ( 5478 caractères restants)
🔍 Parsing JSON...
✅ JSON parsé avec succès
📊 Type: Object
🔑 Clés: output
📦 Réponse complète: {output: "..."}
═══════════════════════════════════════════════════════
```

### ❌ Exemple de Logs avec RÉPONSE VIDE

```
═══════════════════════════════════════════════════════
📡 ENVOI VERS N8N
═══════════════════════════════════════════════════════
🎯 Endpoint: https://xomava4845.app.n8n.cloud/webhook/htlm_processor
📦 Taille payload: 2543 caractères
🔑 Mot-clé: Programme de travail
⏱️ Durée requête: 856ms
✅ Réponse reçue ! Statut: 200 OK
📄 Lecture du body...
📏 Taille reçue: 0 caractères             ← PROBLÈME ICI !
❌ PROBLÈME: Réponse vide (0 caractères)
👉 Vérifiez que votre workflow n8n contient un node 'Respond to Webhook'
❌ Erreur: Réponse n8n vide - vérifiez votre workflow n8n
```

### ❌ Exemple de Logs avec JSON INVALIDE

```
═══════════════════════════════════════════════════════
📡 ENVOI VERS N8N
═══════════════════════════════════════════════════════
🎯 Endpoint: https://xomava4845.app.n8n.cloud/webhook/htlm_processor
📦 Taille payload: 2543 caractères
🔑 Mot-clé: Programme de travail
⏱️ Durée requête: 923ms
✅ Réponse reçue ! Statut: 200 OK
📄 Lecture du body...
📏 Taille reçue: 234 caractères           ← Données reçues
📄 Premiers 200 caractères: Ceci est du texte brut, pas du JSON
🔍 Parsing JSON...
❌ Erreur parsing JSON: Unexpected token C in JSON at position 0
📄 Contenu reçu (premiers 500 car.): Ceci est du texte brut...
👉 La réponse n'est pas du JSON valide
❌ Erreur: Réponse n8n invalide (pas du JSON): Unexpected token...
```

## 🎯 Indicateurs Clés

### 1. 📏 Taille Reçue

**C'est l'indicateur le plus important !**

- ✅ `> 0 caractères` = Données reçues de n8n
- ❌ `0 caractères` = Réponse vide (problème dans n8n)

### 2. ✅/❌ JSON Parsé

- ✅ `JSON parsé avec succès` = Format correct
- ❌ `Erreur parsing JSON` = Pas du JSON (problème de format)

### 3. 🔑 Clés

- ✅ `Clés: output` = Format standard attendu
- ✅ `Clés: data` = Format Programme de travail
- ❌ Pas de clés = Problème de structure

## 🔧 Diagnostic Rapide

### Problème 1: "Taille reçue: 0 caractères"

**Cause** : n8n ne renvoie rien

**Solution** :
1. Ouvrez votre workflow n8n
2. Vérifiez qu'il y a un node **"Respond to Webhook"** à la fin
3. Ce node doit être connecté et actif

**Workflow minimal** :
```
Webhook → Code Node → Respond to Webhook
```

### Problème 2: "Erreur parsing JSON"

**Cause** : n8n renvoie du texte brut, pas du JSON

**Solution** :
1. Dans le node "Respond to Webhook"
2. Vérifiez que "Response Mode" est sur "JSON"
3. Le body doit être un objet JSON : `{ "output": "..." }`

### Problème 3: "Erreur HTTP 404/500"

**Cause** : Problème d'URL ou erreur dans le workflow

**Solution** :
1. Vérifiez l'URL du webhook (pas de typo)
2. Vérifiez que le workflow est **activé** dans n8n
3. Consultez les logs n8n pour voir l'erreur

## 🧪 Test Rapide

### Option 1: Fichier de Test

Ouvrez `public/test-n8n-connection.html` dans votre navigateur et cliquez sur "Tester la Connexion"

### Option 2: Console du Navigateur

Collez ce code dans la console (F12) :

```javascript
fetch('https://xomava4845.app.n8n.cloud/webhook/htlm_processor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'test' })
})
.then(r => r.text())
.then(text => {
  console.log('📏 Taille:', text.length, 'caractères');
  console.log('📄 Contenu:', text);
})
.catch(e => console.error('❌ Erreur:', e));
```

## 📊 Interprétation des Résultats

### ✅ Tout Fonctionne

```
📏 Taille: 456 caractères
📄 Contenu: {"output":"# Résultat..."}
```

**Action** : Rien à faire, tout est OK !

### ❌ Réponse Vide

```
📏 Taille: 0 caractères
📄 Contenu: 
```

**Action** : Ajoutez un node "Respond to Webhook" dans n8n

### ❌ Pas du JSON

```
📏 Taille: 123 caractères
📄 Contenu: Ceci est du texte
```

**Action** : Configurez le node pour retourner du JSON

## 💡 Astuces

1. **Toujours regarder la taille en premier** : Si c'est 0, inutile de chercher plus loin
2. **Utilisez le fichier de test** : Plus facile que de tester dans l'app
3. **Vérifiez les logs n8n** : Ils montrent les erreurs côté serveur
4. **Testez avec un workflow minimal** : Plus facile à débugger

## 🔗 Fichiers Utiles

- `public/test-n8n-connection.html` - Outil de test avec interface
- `COMMANDES_RAPIDES_N8N.txt` - Commandes à copier-coller
- `FIX_N8N_REPONSE_VIDE_FINAL.md` - Guide complet de résolution

## 📞 Workflow n8n Minimal qui Fonctionne

```
1. Webhook (POST /webhook/htlm_processor)
   ↓
2. Code Node
   Code:
   return {
     json: {
       output: "# Test\n\n| Col1 | Col2 |\n|------|------|\n| A | B |"
     }
   };
   ↓
3. Respond to Webhook
   Response Body: {{ $json }}
```

## 🎯 Checklist de Vérification

Avant de chercher le problème ailleurs, vérifiez :

- [ ] Le workflow n8n est **activé** (toggle ON)
- [ ] Il y a un node **"Respond to Webhook"** à la fin
- [ ] Ce node est **connecté** au reste du workflow
- [ ] Le format de réponse est **JSON**
- [ ] L'URL du webhook est **correcte** (pas de typo)
- [ ] Les logs montrent **> 0 caractères** reçus

## 🆘 Toujours Bloqué ?

1. Testez avec `public/test-n8n-connection.html`
2. Regardez les logs dans la console (F12)
3. Vérifiez la **taille reçue** (doit être > 0)
4. Consultez les logs n8n pour voir les erreurs
5. Testez avec un workflow minimal

## ✅ Résultat Attendu

Quand tout fonctionne, vous devriez voir :

```
📏 Taille reçue: XXX caractères (> 0)
✅ JSON parsé avec succès
📊 Type: Object
🔑 Clés: output
🎉 Traitement complet réussi
```
