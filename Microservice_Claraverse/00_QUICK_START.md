# 🚀 QUICK START - CLARAVERSE MICROSERVICE

## ⚡ Démarrage en 5 Minutes

### Prérequis

- ✅ Conda installé et configuré
- ✅ Node.js v18+ installé
- ✅ Environnement claraverse_backend créé

### Étape 1 : Vérification

```powershell
# Vérifier conda
conda --version

# Vérifier Node.js
node --version

# Vérifier l'environnement
conda env list | Select-String claraverse_backend
```

### Étape 2 : Démarrage Automatique

```powershell
# Depuis la racine du projet (H:\ClaraVerse)
.\start-claraverse-conda.ps1
```

**Ce script fait** :
1. Vérifie les prérequis
2. Démarre le backend Python (port 5000)
3. Démarre le frontend React (port 5173)
4. Affiche les URLs et commandes utiles

### Étape 3 : Vérification

**Backend** :
```powershell
# Ouvrir dans le navigateur
http://127.0.0.1:5000/health

# Ou avec curl
curl http://127.0.0.1:5000/health
```

**Frontend** :
```powershell
# Ouvrir dans le navigateur
http://localhost:5173
```

### Étape 4 : Test Lead Balance

1. Ouvrir http://localhost:5173
2. Dans le chat, taper : `Lead_balance`
3. Une table apparaît
4. Le dialogue de sélection s'ouvre AUTOMATIQUEMENT
5. Sélectionner : `py_backend/P000 -BALANCE DEMO.xls`
6. Les résultats s'affichent

---

## 🛑 Arrêt des Services

```powershell
.\stop-claraverse.ps1
```

---

## 🔧 Démarrage Manuel

### Backend

```powershell
# Terminal 1
conda activate claraverse_backend
cd py_backend
python main.py
```

### Frontend

```powershell
# Terminal 2 (nouveau terminal)
npm run dev
```

---

## 📊 Commandes Utiles

### Voir les Logs

```powershell
# Charger les IDs des jobs
$jobs = Get-Content .claraverse-jobs.json | ConvertFrom-Json

# Logs backend
Receive-Job -Id $jobs.Backend -Keep

# Logs frontend
Receive-Job -Id $jobs.Frontend -Keep
```

### Lister les Jobs Actifs

```powershell
Get-Job
```

### Redémarrer un Service

```powershell
# Arrêter
.\stop-claraverse.ps1

# Redémarrer
.\start-claraverse-conda.ps1
```

---

## �� Problèmes Courants

### Le backend ne démarre pas

```powershell
# Vérifier l'environnement
conda activate claraverse_backend
python --version  # Doit être 3.11.x

# Vérifier les dépendances
pip list | Select-String fastapi
```

### Le frontend ne se connecte pas

```powershell
# Vérifier que le backend est actif
curl http://127.0.0.1:5000/health

# Vérifier les processus
Get-Process | Where-Object {$_.ProcessName -like '*python*'}
```

### Port déjà utilisé

```powershell
# Trouver le processus sur le port 5000
netstat -ano | findstr :5000

# Tuer le processus (remplacer PID)
Stop-Process -Id <PID> -Force
```

---

## ✅ Checklist de Démarrage

- [ ] Conda installé
- [ ] Node.js installé
- [ ] Environnement claraverse_backend créé
- [ ] Dépendances Python installées
- [ ] Dépendances npm installées
- [ ] Backend démarre sur port 5000
- [ ] Frontend démarre sur port 5173
- [ ] Test Lead Balance fonctionne

---

## 📚 Documentation Complète

- **Architecture** : ARCHITECTURE.md
- **Guide Backend** : GUIDE_BACKEND.md
- **Guide Frontend** : GUIDE_FRONTEND.md
- **Dépannage** : TROUBLESHOOTING.md

---

**Prêt !** Ouvrez http://localhost:5173 et testez Lead Balance.
