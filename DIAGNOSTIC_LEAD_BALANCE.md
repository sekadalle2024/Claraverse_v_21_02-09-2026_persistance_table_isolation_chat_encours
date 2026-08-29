# 🔍 DIAGNOSTIC LEAD BALANCE - PROBLÈMES IDENTIFIÉS

**Date** : 22 Mars 2026  
**Statut** : En cours de résolution

---

## 🚨 PROBLÈMES IDENTIFIÉS

### Problème 1 : Boîte de dialogue ne s'ouvre pas automatiquement

**Symptôme** :
- La table "Lead_balance" s'affiche correctement dans le chat
- Le message indique "📂 Sélectionnez votre fichier Excel..."
- MAIS le dialogue de sélection de fichier ne s'ouvre PAS automatiquement

**Cause probable** :
- Le script `LeadBalanceAutoTrigger.js` ne détecte pas la table
- OU le script n'est pas chargé correctement
- OU le MutationObserver ne se déclenche pas

### Problème 2 : Erreur Backend "Failed to fetch"

**Symptôme** :
- Message d'erreur : "Erreur Lead Balance: Failed to fetch"
- Le backend ne répond pas à l'endpoint `/lead-balance/process-excel`

**Cause probable** :
- Backend Python non démarré
- OU endpoint incorrect
- OU problème CORS

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. Correction du texte dans claraApiService.ts

**Avant** :
```typescript
"| Cliquez sur cette table avec le bouton droit... |"
```

**Après** :
```typescript
"| 📂 Sélectionnez votre fichier Excel... |"
```

**Fichier** : `src/services/claraApiService.ts` (lignes 905-927)

---

## 🔧 PLAN DE RÉSOLUTION

### Étape 1 : Vérifier le chargement du script

**Action** :
1. Ouvrir la console du navigateur (F12)
2. Taper : `LeadBalanceAutoTrigger.version`
3. Résultat attendu : `"3.0.0"`

**Si le script n'est pas chargé** :
- Vérifier que `index.html` contient : `<script src="/LeadBalanceAutoTrigger.js"></script>`
- Rafraîchir la page (Ctrl+F5)

### Étape 2 : Vérifier la détection de la table

**Action** :
1. Dans la console, taper : `LeadBalanceAutoTrigger.test()`
2. Observer les logs dans la console

**Logs attendus** :
```
🎯 Table Lead_balance détectée - Déclenchement automatique
📂 Ouverture automatique du dialogue de sélection de fichier
```

### Étape 3 : Démarrer le backend correctement

**Action** :
```powershell
# Terminal 1 - Backend
conda activate claraverse_backend
cd py_backend
python main.py
```

**Vérification** :
```powershell
# Dans un autre terminal
curl http://127.0.0.1:5000/health
```

**Résultat attendu** :
```json
{"status": "healthy", "service": "clara-backend"}
```

### Étape 4 : Tester l'intégration complète

**Action** :
1. Backend démarré (port 5000)
2. Frontend démarré (port 5173)
3. Ouvrir http://localhost:5173
4. Taper dans le chat : `Lead_balance`
5. Observer :
   - Table apparaît
   - Dialogue s'ouvre automatiquement (300ms)
   - Sélectionner fichier Excel
   - Résultats affichés

---

## 🐛 DEBUGGING AVANCÉ

### Debug du script LeadBalanceAutoTrigger.js

**Console navigateur** :
```javascript
// Vérifier la version
console.log(LeadBalanceAutoTrigger.version);

// Vérifier la configuration
console.log(LeadBalanceAutoTrigger.config);

// Forcer un scan manuel
LeadBalanceAutoTrigger.test();

// Réinitialiser toutes les tables
LeadBalanceAutoTrigger.reset();

// Vérifier les tables détectées
document.querySelectorAll('table.min-w-full.border').forEach(t => {
  console.log('Table trouvée:', t);
  const headers = Array.from(t.querySelectorAll('th')).map(th => th.textContent.trim());
  console.log('Headers:', headers);
});
```

### Debug du backend

**Logs backend** :
```powershell
# Si démarré avec start-claraverse-conda.ps1
$jobs = Get-Content .claraverse-jobs.json | ConvertFrom-Json
Receive-Job -Id $jobs.Backend -Keep
```

**Test manuel de l'endpoint** :
```powershell
# Créer un fichier de test
$fileContent = [System.IO.File]::ReadAllBytes("py_backend/P000 -BALANCE DEMO.xls")
$base64 = [System.Convert]::ToBase64String($fileContent)

# Envoyer la requête
$body = @{
    file_base64 = $base64
    filename = "test.xls"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/lead-balance/process-excel" -Method POST -Body $body -ContentType "application/json"
```

---

## 📋 CHECKLIST DE VÉRIFICATION

### Avant de tester

- [ ] Backend arrêté (aucun processus Python sur port 5000)
- [ ] Frontend arrêté (aucun processus Node sur port 5173)
- [ ] Modifications de `claraApiService.ts` sauvegardées
- [ ] Script `LeadBalanceAutoTrigger.js` présent dans `/public`
- [ ] Script chargé dans `index.html`

### Démarrage

- [ ] Backend démarré : `conda activate claraverse_backend && cd py_backend && python main.py`
- [ ] Backend répond : `curl http://127.0.0.1:5000/health`
- [ ] Frontend démarré : `npm run dev`
- [ ] Frontend accessible : http://localhost:5173

### Test Lead Balance

- [ ] Taper `Lead_balance` dans le chat
- [ ] Table apparaît avec entête "Lead_balance"
- [ ] Console montre : "🎯 Table Lead_balance détectée"
- [ ] Dialogue s'ouvre automatiquement
- [ ] Sélection de fichier fonctionne
- [ ] Upload vers backend réussit
- [ ] Résultats affichés dans la table

---

## 🔍 ANALYSE DES CAPTURES D'ÉCRAN

### Capture 1 : Table affichée
- ✅ Table "Lead_balance" visible
- ✅ Message "📂 Sélectionnez votre fichier Excel..."
- ❌ Dialogue ne s'ouvre pas automatiquement

**Diagnostic** : Le script ne détecte pas la table OU ne se déclenche pas

### Capture 2 : Erreur "Failed to fetch"
- ❌ Backend ne répond pas
- ❌ Endpoint `/lead-balance/process-excel` inaccessible

**Diagnostic** : Backend non démarré OU problème de connexion

---

## 🎯 PROCHAINES ACTIONS

### Action Immédiate 1 : Vérifier le script

```powershell
# Ouvrir le navigateur sur http://localhost:5173
# Ouvrir la console (F12)
# Taper :
LeadBalanceAutoTrigger.version
```

**Si undefined** → Script non chargé → Vérifier `index.html`

**Si "3.0.0"** → Script chargé → Passer à l'action 2

### Action Immédiate 2 : Forcer la détection

```javascript
// Dans la console
LeadBalanceAutoTrigger.test()
```

**Observer les logs** :
- Si "Table Lead_balance détectée" → Script fonctionne
- Si rien → Problème de sélecteur CSS

### Action Immédiate 3 : Démarrer le backend

```powershell
# Terminal dédié
conda activate claraverse_backend
cd py_backend
python main.py
```

**Attendre** : "Application startup complete"

**Vérifier** :
```powershell
curl http://127.0.0.1:5000/health
```

---

## 📚 FICHIERS CONCERNÉS

### Frontend
- `src/services/claraApiService.ts` - Génération de la table (✅ Corrigé)
- `public/LeadBalanceAutoTrigger.js` - Détection automatique
- `index.html` - Chargement du script

### Backend
- `py_backend/main.py` - Point d'entrée FastAPI
- `py_backend/pandas_lead.py` - Endpoint Lead Balance
- `py_backend/requirements.txt` - Dépendances (✅ Installées)

### Documentation
- `Doc_Lead_Balance/README_ARCHITECTURE_FINALE.md` - Architecture
- `Doc_Lead_Balance/TEST_INTEGRATION_COMPLETE.md` - Tests
- `INSTRUCTIONS_DEMARRAGE_SIMPLE.md` - Instructions

---

## 💡 SOLUTIONS ALTERNATIVES

### Si le dialogue ne s'ouvre toujours pas

**Option 1** : Forcer l'ouverture manuelle
```javascript
// Dans la console
const table = document.querySelector('table.min-w-full.border');
if (table) {
  const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
  if (headers.includes('Lead_balance')) {
    // Créer et cliquer sur l'input file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.click();
  }
}
```

**Option 2** : Vérifier le MutationObserver
```javascript
// Vérifier si le MutationObserver fonctionne
const observer = new MutationObserver((mutations) => {
  console.log('Mutation détectée:', mutations.length);
});
observer.observe(document.body, { childList: true, subtree: true });
```

### Si le backend ne répond pas

**Option 1** : Vérifier le port
```powershell
netstat -ano | Select-String ":5000"
```

**Option 2** : Tester avec uvicorn directement
```powershell
conda activate claraverse_backend
cd py_backend
uvicorn main:app --host 127.0.0.1 --port 5000 --reload
```

---

## ✅ VALIDATION FINALE

Une fois tous les problèmes résolus :

1. ✅ Taper `Lead_balance` → Table apparaît
2. ✅ Dialogue s'ouvre automatiquement (< 1 seconde)
3. ✅ Sélectionner fichier Excel
4. ✅ Upload réussit (notification "📊 Traitement...")
5. ✅ Résultats affichés (accordéons SYSCOHADA)
6. ✅ Pas d'erreur dans la console

---

**Prochaine étape** : Exécuter les actions immédiates 1, 2 et 3
