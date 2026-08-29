# 🔍 Guide de Diagnostic - Envoi vers N8N

## 📋 Situation Actuelle

D'après vos logs, le système **collecte correctement** les données :
- ✅ Mot-clé extrait : "Programme de travail"
- ✅ Message utilisateur trouvé et validé
- ✅ Table user_message créée
- ✅ 12 tables collectées au total
- ✅ Message "📡 Envoi des données vers n8n..." affiché

**Question** : Est-ce que les données arrivent réellement à n8n ?

---

## 🧪 Tests à Effectuer (dans l'ordre)

### Test 1 : Vérifier que n8n est démarré

```bash
# Vérifiez que n8n tourne sur le port 5678
curl http://localhost:5678
```

**Résultat attendu** : Une réponse de n8n (même une erreur 404 prouve qu'il tourne)

---

### Test 2 : Page de Test Complète

1. **Ouvrez** : `public/test-envoi-n8n-complet.html` dans votre navigateur
2. **Cliquez** : "1️⃣ Tester la Connexion"
3. **Observez** : La console de diagnostic

**Si ça marche** : n8n est accessible ✅  
**Si ça échoue** : n8n n'est pas démarré ou l'endpoint est incorrect ❌

---

### Test 3 : Envoi avec vos vraies données

1. Dans la page de test, **collez votre HTML** (celui que vous avez fourni) dans la zone "Test Personnalisé"
2. **Cliquez** : "📤 Envoyer HTML Personnalisé"
3. **Vérifiez** : La réponse de n8n dans la console

---

### Test 4 : Activer le diagnostic dans votre application

1. **Ajoutez** ce script dans votre `index.html` (avant la fermeture de `</body>`) :

```html
<script src="/diagnostic-envoi-n8n.js"></script>
```

2. **Rechargez** votre application
3. **Envoyez** une table Flowise dans le chat
4. **Ouvrez** la console du navigateur (F12)
5. **Cherchez** les logs :
   - `📡 APPEL N8N DÉTECTÉ` → L'appel est fait
   - `📦 DONNÉES ENVOYÉES À N8N` → Les données sont envoyées
   - `✅ RÉPONSE N8N REÇUE` → n8n a répondu

---

## 🔍 Vérifications dans Flowise.js

### Vérifier l'endpoint configuré

Ouvrez `public/Flowise.js` ligne 26 :

```javascript
N8N_ENDPOINT_URL: "http://localhost:5678/webhook/htlm_processor",
```

**Questions** :
- ✅ Est-ce le bon endpoint ?
- ✅ n8n écoute-t-il sur ce webhook ?
- ✅ Le webhook est-il activé dans n8n ?

---

### Vérifier que l'envoi n'est pas bloqué par le cache

Dans `Flowise.js`, ligne ~390, la fonction `queryN8nEndpoint` vérifie d'abord le cache :

```javascript
const cachedData = loadFromCache(cacheKey);
if (cachedData) {
    console.log(`📦 Utilisation des données en cache pour "${targetKeyword}"`);
    return cachedData.data; // ⚠️ N'envoie PAS à n8n si en cache !
}
```

**Solution** : Videz le cache localStorage :

```javascript
// Dans la console du navigateur
localStorage.clear();
location.reload();
```

---

## 🐛 Problèmes Courants

### Problème 1 : "📡 Envoi des données vers n8n..." mais pas de réponse

**Causes possibles** :
1. n8n n'est pas démarré
2. L'endpoint est incorrect
3. CORS bloque la requête
4. Le webhook n8n n'est pas activé

**Solution** : Utilisez la page de test pour isoler le problème

---

### Problème 2 : Les données sont en cache

**Symptôme** : Vous voyez `📦 Utilisation des données en cache`

**Solution** :
```javascript
localStorage.clear();
```

---

### Problème 3 : n8n reçoit les données mais ne répond pas

**Vérification** :
1. Ouvrez n8n (http://localhost:5678)
2. Allez dans votre workflow "htlm_processor"
3. Vérifiez les exécutions récentes
4. Regardez si des erreurs sont affichées

---

## 📊 Logs à Surveiller

### Dans la console du navigateur (F12)

```
✅ Logs attendus si tout fonctionne :
🔍 Extraction du mot-clé dynamique depuis la table Flowise...
✅ Mot-clé dynamique extrait: "Programme de travail"
🔎 Recherche du message utilisateur précédant la table déclencheuse...
✅ Message utilisateur trouvé et validé
✅ Table 'user_message' créée dynamiquement
📊 Collecte terminée: 12 table(s) au total
📡 Envoi des données vers n8n...
✅ Réponse reçue de n8n (200 OK)
```

```
❌ Logs problématiques :
📦 Utilisation des données en cache → Videz le cache
❌ Erreur lors de l'envoi → n8n inaccessible
⚠️ Timeout → n8n trop lent ou bloqué
```

---

## 🎯 Action Immédiate

**Faites ceci maintenant** :

1. **Ouvrez** : `http://localhost:3000/test-envoi-n8n-complet.html`
2. **Testez** la connexion
3. **Testez** l'envoi complet
4. **Rapportez** les résultats

Cela nous dira immédiatement si :
- ✅ n8n est accessible
- ✅ L'endpoint fonctionne
- ✅ Les données peuvent être envoyées

---

## 💡 Commandes Utiles

### Vider le cache et recharger
```javascript
localStorage.clear();
location.reload();
```

### Tester manuellement l'envoi
```javascript
fetch('http://localhost:5678/webhook/htlm_processor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: '<table><tr><td>Test</td></tr></table>' })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

### Activer les logs réseau dans Chrome
1. F12 → Onglet "Network"
2. Filtrer par "Fetch/XHR"
3. Envoyer une table Flowise
4. Chercher l'appel vers "htlm_processor"
5. Cliquer dessus pour voir les détails

---

## 📞 Prochaines Étapes

Après avoir testé avec `test-envoi-n8n-complet.html`, dites-moi :

1. ✅ ou ❌ La connexion fonctionne ?
2. ✅ ou ❌ L'envoi simple fonctionne ?
3. ✅ ou ❌ L'envoi complet fonctionne ?
4. 📋 Quel message d'erreur voyez-vous (si erreur) ?

Cela me permettra de vous aider précisément ! 🎯
