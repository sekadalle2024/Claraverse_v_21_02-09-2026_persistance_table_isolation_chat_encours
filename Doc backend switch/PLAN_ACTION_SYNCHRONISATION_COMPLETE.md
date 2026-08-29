# 🚀 PLAN D'ACTION : SYNCHRONISATION COMPLÈTE BACKEND/FRONTEND

**Date :** 19 Avril 2026  
**Objectif :** Synchroniser le code local vers GitHub → Zeabur + Netlify

---

## ✅ DIAGNOSTIC CONFIRMÉ

### Problèmes Identifiés
1. ❌ **`backendConfig.js` non chargé dans `index.html`**
   - Le fichier existe dans `/public/backendConfig.js`
   - Mais il n'est PAS référencé dans le `<head>` de `index.html`
   - Conséquence : Les AutoTriggers utilisent toujours `http://localhost:5000`

2. ❌ **Zeabur exécute une ancienne version**
   - Log Zeabur : `404 Not Found` sur `/etats-financiers/process-excel`
   - Le backend distant n'a pas les nouveaux endpoints
   - Les corrections CORS ne sont pas déployées

3. ✅ **Code local 100% fonctionnel**
   - Test réussi en 5.22 secondes
   - Traitement de 279 Ko sans erreur
   - Génération HTML correcte (135 Ko)

---

## 📝 ACTIONS À EFFECTUER (ORDRE STRICT)

### ÉTAPE 1 : Corriger `index.html` (CRITIQUE)

**Fichier :** `index.html`

**Action :** Ajouter `backendConfig.js` EN PREMIER dans le `<head>`

**Position exacte :** Juste après les balises `<meta>` et AVANT tous les autres scripts

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="favicon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>E-audit</title>
  
  <!-- ⚡ BACKEND CONFIGURATION - DOIT ÊTRE CHARGÉ EN PREMIER ⚡ -->
  <script src="/backendConfig.js"></script>
  
  <!-- Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <!-- ... reste du head ... -->
</head>
```

**Pourquoi EN PREMIER ?**
- `window.CLARA_BACKEND_URL` doit être défini AVANT que les AutoTriggers se chargent
- Les scripts `LeadBalanceAutoTrigger.js` et `EtatFinAutoTrigger.js` dépendent de cette variable

---

### ÉTAPE 2 : Vérifier les fichiers modifiés

**Fichiers à synchroniser vers GitHub :**

#### Frontend (Netlify)
- ✅ `public/backendConfig.js` (créé)
- ⚠️ `index.html` (à modifier - ÉTAPE 1)
- ✅ `public/LeadBalanceAutoTrigger.js` (patché ligne 32)
- ✅ `public/EtatFinAutoTrigger.js` (patché ligne 32)

#### Backend (Zeabur)
- ✅ `py_backend/main.py` (nouveaux endpoints + CORS)
- ✅ `py_backend/etats_financiers.py` (logique métier)
- ✅ Tous les modules de calcul des états financiers

---

### ÉTAPE 3 : Commit & Push vers GitHub

**Commandes Git :**

```bash
# 1. Vérifier l'état actuel
git status

# 2. Ajouter tous les fichiers modifiés
git add index.html
git add public/backendConfig.js
git add public/LeadBalanceAutoTrigger.js
git add public/EtatFinAutoTrigger.js
git add py_backend/main.py
git add py_backend/etats_financiers.py

# 3. Commit avec message descriptif
git commit -m "🔧 Fix: Intégration backendConfig.js + Sync endpoints Zeabur

- Ajout backendConfig.js dans index.html (switch dynamique local/cloud)
- Patch LeadBalanceAutoTrigger.js et EtatFinAutoTrigger.js
- Sync endpoints états financiers pour Zeabur
- Corrections CORS complètes (Content-Disposition exposé)

Fixes #Case21 #Case24 #FailedToFetch"

# 4. Push vers GitHub
git push origin main
```

---

### ÉTAPE 4 : Vérifier les déploiements automatiques

#### Netlify (Frontend)
1. Aller sur https://app.netlify.com/
2. Vérifier que le build démarre automatiquement après le push
3. Attendre la fin du déploiement (~2-3 minutes)
4. Vérifier le log de build pour confirmer que `backendConfig.js` est inclus

#### Zeabur (Backend)
1. Aller sur https://zeabur.com/
2. Vérifier que le redéploiement démarre automatiquement
3. Attendre la fin du déploiement (~3-5 minutes)
4. Vérifier les logs pour confirmer le démarrage d'Uvicorn

---

### ÉTAPE 5 : Tests de validation

#### Test 1 : Vérifier backendConfig.js
```javascript
// Ouvrir la console sur https://prclaravi.netlify.app/
console.log(window.CLARA_BACKEND_URL);
// Doit afficher : "https://pybackend.zeabur.app"

console.log(window.CLARA_IS_LOCAL_DEV);
// Doit afficher : false
```

#### Test 2 : Tester l'endpoint Zeabur
```bash
# Depuis le terminal local
curl https://pybackend.zeabur.app/

# Doit retourner : {"message": "Clara Backend API v1.0", ...}
```

#### Test 3 : Tester Case 24 (États Financiers)
1. Aller sur https://prclaravi.netlify.app/
2. Créer une table avec l'en-tête "Etat_fin"
3. Cliquer sur la cellule pour uploader un fichier Excel
4. Vérifier que le traitement se fait sans erreur "Failed to fetch"

#### Test 4 : Tester Case 21 (Lead Balance)
1. Créer une table avec l'en-tête "Lead_balance"
2. Uploader un fichier de balance
3. Vérifier le traitement complet

---

## 🔍 VÉRIFICATIONS POST-DÉPLOIEMENT

### Checklist Netlify
- [ ] Build réussi sans erreur
- [ ] `backendConfig.js` présent dans le bundle
- [ ] Console browser affiche le log de configuration
- [ ] `window.CLARA_BACKEND_URL` = `https://pybackend.zeabur.app`

### Checklist Zeabur
- [ ] Déploiement réussi
- [ ] Endpoint root accessible (HTTP 200)
- [ ] Endpoint `/etats-financiers/process-excel` existe (pas de 404)
- [ ] Headers CORS corrects (`Access-Control-Allow-Origin`, `Content-Disposition`)

---

## 🚨 TROUBLESHOOTING

### Si Netlify ne redéploie pas automatiquement
```bash
# Forcer un redéploiement via Netlify CLI
netlify deploy --prod
```

### Si Zeabur ne redéploie pas automatiquement
1. Aller dans l'interface Zeabur
2. Cliquer sur "Redeploy" manuellement
3. Ou : Déconnecter/reconnecter le repo GitHub

### Si l'erreur 404 persiste sur Zeabur
```bash
# Vérifier que le repo GitHub backend est à jour
cd py_backend
git log --oneline -5

# Vérifier que Zeabur pointe vers le bon repo et la bonne branche
```

---

## 📊 RÉSULTAT ATTENDU

Après ces étapes :
- ✅ Frontend Netlify charge `backendConfig.js` en premier
- ✅ `window.CLARA_BACKEND_URL` pointe vers Zeabur en production
- ✅ Zeabur a tous les nouveaux endpoints
- ✅ CORS configuré correctement
- ✅ Case 21 et Case 24 fonctionnent sans erreur
- ✅ Pas de "Failed to fetch"

---

## 📝 NOTES IMPORTANTES

1. **Ordre de chargement critique :**
   - `backendConfig.js` DOIT être le premier script chargé
   - Sinon, les AutoTriggers utiliseront `localhost:5000` par défaut

2. **Déploiement automatique :**
   - Netlify et Zeabur sont configurés pour déployer automatiquement sur `git push`
   - Attendre 3-5 minutes après le push pour que tout soit synchronisé

3. **Cache navigateur :**
   - Après le déploiement, faire Ctrl+Shift+R pour vider le cache
   - Ou ouvrir en navigation privée pour tester

4. **Logs Zeabur :**
   - Surveiller les logs en temps réel pour détecter d'éventuelles erreurs
   - Vérifier que l'endpoint `/etats-financiers/process-excel` est bien enregistré

---

## ✅ VALIDATION FINALE

Une fois toutes les étapes complétées :

```bash
# Test complet depuis le script Python
cd py_backend
python test_zeabur_etat_fin.py

# Doit afficher :
# ✅ Backend Root Endpoint : OK
# ✅ CORS Preflight : OK
# ✅ Headers Exposes : OK (Content-Disposition présent)
# ✅ Test Endpoint etat_fin : OK (pas de 404, pas de 10054)
```

---

**Prochaine étape :** Exécuter l'ÉTAPE 1 (modification de `index.html`)
