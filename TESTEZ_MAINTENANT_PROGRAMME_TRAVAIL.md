# 🚀 TESTEZ MAINTENANT - Programme de Travail N8N

## ✅ Corrections Appliquées

J'ai corrigé le fichier `Flowise.js` pour qu'il puisse reconnaître et traiter correctement le format de réponse de votre endpoint n8n "Programme de travail".

### 🔧 Modifications Principales

1. **Fonction `normalizeN8nResponse` améliorée** avec:
   - ✅ Détection du format `response.body[0].output`
   - ✅ Logs détaillés à chaque étape
   - ✅ Support de tous les formats de réponse n8n

2. **Logs de diagnostic complets** pour:
   - ✅ Tracer le flux de données
   - ✅ Identifier rapidement les problèmes
   - ✅ Voir la structure exacte des réponses

3. **Fichiers de test créés**:
   - ✅ `public/test-n8n-programme-travail.html` - Page de test interactive
   - ✅ `public/patch-flowise-n8n-response.js` - Patch de secours
   - ✅ `SOLUTION_PROGRAMME_TRAVAIL_N8N.md` - Documentation complète
   - ✅ `COMMANDES_TEST_PROGRAMME_TRAVAIL.txt` - Commandes rapides

## 🧪 Test Rapide (3 minutes)

### Option 1: Page de Test HTML

```bash
# 1. Démarrez votre serveur (si ce n'est pas déjà fait)
npm run dev

# 2. Ouvrez dans votre navigateur
http://localhost:5173/test-n8n-programme-travail.html

# 3. Cliquez sur "Envoyer Test Programme"
# 4. Regardez les logs et la réponse
```

### Option 2: Console du Navigateur

```javascript
// 1. Ouvrez la console (F12) sur votre page Claraverse

// 2. Testez la connexion n8n
await window.ClaraverseN8nV17.testN8nConnection();

// 3. Forcez un scan des tables
window.ClaraverseN8nV17.scanAndProcess();
```

### Option 3: Test Réel

1. Créez une table avec une colonne "Flowise" contenant "Programme de travail"
2. Créez une table de critères avec "Rubrique" et "Description"
3. Ouvrez la console (F12)
4. Regardez les logs détaillés

## 📊 Logs Attendus

Si tout fonctionne, vous verrez dans la console:

```
🔍 ========== NORMALISATION RÉPONSE N8N ==========
📦 Type de réponse: Array
✅ Réponse est un Array avec 1 élément(s)
📦 Premier élément - Clés: response
🔍 Détection du format response.body...
📦 Body détecté - Type: Array[1]
📦 Body[0].output existe? true
📦 Body[0].output - Longueur: 19372
✅ ✅ ✅ FORMAT DÉTECTÉ: Webhook htlm_processor (response.body[0].output)
📊 Status: success
✅ ========== NORMALISATION RÉUSSIE ==========
📊 Taille de l'output: 19372 caractères
```

## ❌ En Cas de Problème

### Problème: "Output vide ou null"

**Diagnostic**:
```javascript
// Dans la console
await window.ClaraverseN8nV17.testN8nConnection();
```

**Solution**:
1. Vérifiez que l'endpoint n8n fonctionne
2. Testez avec curl (voir `COMMANDES_TEST_PROGRAMME_TRAVAIL.txt`)
3. Vérifiez que le workflow n8n retourne bien des données

### Problème: "Format de réponse non reconnu"

**Diagnostic**:
Regardez les logs détaillés dans la console, section "NORMALISATION"

**Solution**:
1. Copiez la structure complète de la réponse
2. Appliquez le patch de secours:
```javascript
const script = document.createElement('script');
script.src = '/patch-flowise-n8n-response.js';
document.head.appendChild(script);
```

### Problème: Table non détectée

**Diagnostic**:
```javascript
// Vérifier les tables avec colonne "Flowise"
Array.from(document.querySelectorAll('table.min-w-full')).filter(table => {
  const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim().toLowerCase());
  return headers.includes('flowise');
});
```

**Solution**:
1. Vérifiez que votre table a bien une colonne "Flowise"
2. Vérifiez que la première ligne contient "Programme de travail"
3. Regardez les logs de `extractDynamicKeyword`

## 📋 Structure de Table Attendue

```html
<!-- Table de critères -->
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead>
    <tr>
      <th>Rubrique</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Etape</td>
      <td>Programme de travail</td>
    </tr>
    <tr>
      <td>reference</td>
      <td>Prg-001</td>
    </tr>
  </tbody>
</table>

<!-- Table déclencheuse -->
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead>
    <tr>
      <th>Flowise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Programme de travail</td>
    </tr>
  </tbody>
</table>
```

## 🎯 Résultat Attendu

Après le test, vous devriez voir:

1. ✅ La table "Programme de travail" est détectée
2. ✅ Les données sont envoyées à n8n
3. ✅ La réponse est reçue et normalisée
4. ✅ Les tables markdown sont converties en HTML
5. ✅ Les tables sont affichées dans le chat
6. ✅ La table déclencheuse est supprimée

## 📞 Support

Si le problème persiste après les tests:

1. Ouvrez `COMMANDES_TEST_PROGRAMME_TRAVAIL.txt`
2. Suivez les étapes de diagnostic
3. Copiez tous les logs de la console
4. Partagez:
   - Les logs complets
   - La structure de la réponse n8n
   - Une capture d'écran de votre table

## 📚 Documentation Complète

- 📄 `SOLUTION_PROGRAMME_TRAVAIL_N8N.md` - Guide complet
- 📄 `COMMANDES_TEST_PROGRAMME_TRAVAIL.txt` - Commandes rapides
- 🧪 `public/test-n8n-programme-travail.html` - Page de test
- 🔧 `public/patch-flowise-n8n-response.js` - Patch de secours

## 🚀 Commandes Rapides

```javascript
// Vérifier la version
console.log(window.ClaraverseN8nV17.version);

// Tester la connexion
await window.ClaraverseN8nV17.testN8nConnection();

// Forcer un scan
window.ClaraverseN8nV17.scanAndProcess();

// Voir le cache
window.ClaraverseN8nV17.getCacheInfo();

// Effacer le cache
window.ClaraverseN8nV17.clearAllCache();
```

---

## ✅ Checklist de Test

- [ ] Page de test HTML ouverte
- [ ] Test de connexion réussi
- [ ] Test "Programme de travail" réussi
- [ ] Logs détaillés visibles
- [ ] Structure de réponse correcte
- [ ] Test réel dans Claraverse
- [ ] Tables affichées correctement

---

**Bonne chance avec vos tests ! 🎉**

Si tout fonctionne, vous verrez vos tables "Programme de travail" s'afficher correctement dans le chat.
