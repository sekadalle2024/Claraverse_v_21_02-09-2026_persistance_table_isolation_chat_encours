# 🚀 MICROSERVICE CLARAVERSE - ARCHITECTURE COMPLÈTE

## 📋 Vue d'Ensemble

Ce dossier contient toute la documentation et les scripts nécessaires pour démarrer et gérer l'architecture microservice de Claraverse.

**Architecture** : Frontend React + Backend Python FastAPI

**Date de création** : 22 Mars 2026  
**Version** : 1.0.0

---

## 📁 Structure du Projet

```
Claraverse/
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── services/claraApiService.ts  # Service API principal
│   │   └── components/                   # Composants React
│   ├── public/
│   │   ├── LeadBalanceAutoTrigger.js    # Script Lead Balance
│   │   └── Data.js                       # Script Data
│   └── index.html                        # Point d'entrée
│
├── Backend (Python FastAPI)
│   ├── py_backend/
│   │   ├── main.py                       # Point d'entrée FastAPI
│   │   ├── pandas_lead.py                # Endpoint Lead Balance
│   │   ├── pandas_api.py                 # Endpoint Pandas
│   │   ├── requirements.txt              # Dépendances Python
│   │   └── P000 -BALANCE DEMO.xls       # Fichier de test
│   └── Environnement: claraverse_backend (conda)
│
└── Microservice_Claraverse/              # Ce dossier
    ├── README.md                         # Ce fichier
    ├── 00_QUICK_START.md                 # Démarrage rapide
    ├── ARCHITECTURE.md                   # Architecture détaillée
    ├── GUIDE_BACKEND.md                  # Guide backend
    ├── GUIDE_FRONTEND.md                 # Guide frontend
    └── TROUBLESHOOTING.md                # Dépannage
```

---

## 🎯 Démarrage Rapide

### Option 1 : Script Automatique (Recommandé)

```powershell
# Depuis la racine du projet
.\start-claraverse-conda.ps1
```

Ce script démarre automatiquement :
- Backend Python (port 5000) avec conda
- Frontend React (port 5173)

### Option 2 : Démarrage Manuel

**Terminal 1 - Backend** :
```powershell
conda activate claraverse_backend
cd py_backend
python main.py
```

**Terminal 2 - Frontend** :
```powershell
npm run dev
```

### Vérification

- Backend : http://127.0.0.1:5000/health
- Frontend : http://localhost:5173

---

## 📚 Documentation

### Guides Principaux

1. **[00_QUICK_START.md](./00_QUICK_START.md)**
   - Démarrage en 5 minutes
   - Commandes essentielles
   - Tests de base

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - Architecture complète
   - Flux de données
   - Communication Frontend ↔ Backend

3. **[GUIDE_BACKEND.md](./GUIDE_BACKEND.md)**
   - Configuration environnement conda
   - Endpoints disponibles
   - Ajout de nouveaux endpoints

4. **[GUIDE_FRONTEND.md](./GUIDE_FRONTEND.md)**
   - Structure React
   - Services API
   - Scripts automatiques

5. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**
   - Problèmes courants
   - Solutions
   - Logs et debugging

### Documentation Spécifique

- **Lead Balance** : `../Doc_Lead_Balance/`
  - Architecture automatique
  - Tests d'intégration
  - Guide utilisateur

- **Scripts de démarrage** : Racine du projet
  - `setup-backend-env.ps1` : Configuration conda
  - `start-claraverse-conda.ps1` : Démarrage automatique
  - `stop-claraverse.ps1` : Arrêt des services

---

## 🔧 Configuration

### Environnement Backend (Conda)

**Nom** : `claraverse_backend`  
**Python** : 3.11  
**Dépendances** : Voir `py_backend/requirements.txt`

**Installation** :
```powershell
.\setup-backend-env.ps1
```

### Environnement Frontend (Node.js)

**Node.js** : v18+ recommandé  
**Package Manager** : npm  
**Dépendances** : Voir `package.json`

**Installation** :
```powershell
npm install
```

---

## 🌐 Endpoints Backend

### Santé
- **GET** `/health` - Vérification du backend

### Lead Balance
- **POST** `/lead-balance/process-excel` - Traitement fichier Excel
  - Body : `{ file_base64: string, filename: string }`
  - Response : `{ success: bool, html: string, results: object }`

### Pandas API
- **POST** `/pandas/analyze` - Analyse de données
- **POST** `/pandas/transform` - Transformation de données

### Autres
- **POST** `/word-export` - Export Word
- **POST** `/gdrive-proxy` - Proxy Google Drive

---

## 🎨 Fonctionnalités Frontend

### Services

**claraApiService.ts** :
- Gestion des messages chat
- Routing des commandes
- Génération de tables déclencheuses

### Scripts Automatiques

**LeadBalanceAutoTrigger.js** :
- Détection automatique des tables "Lead_balance"
- Upload automatique de fichiers Excel
- Affichage des résultats

**Data.js** :
- Gestion des données
- Formatage des tableaux

---

## 🧪 Tests

### Test Backend

```powershell
# Activer l'environnement
conda activate claraverse_backend

# Tester l'endpoint health
curl http://127.0.0.1:5000/health

# Tester Lead Balance (avec fichier)
# Voir Doc_Lead_Balance/TEST_INTEGRATION_COMPLETE.md
```

### Test Frontend

```powershell
# Démarrer le frontend
npm run dev

# Ouvrir http://localhost:5173
# Taper dans le chat : "Lead_balance"
# Vérifier que le dialogue s'ouvre automatiquement
```

---

## 🛠️ Commandes Utiles

### Conda

```powershell
# Activer l'environnement
conda activate claraverse_backend

# Désactiver
conda deactivate

# Lister les environnements
conda env list

# Mettre à jour les dépendances
conda run -n claraverse_backend pip install -r py_backend/requirements.txt
```

### Backend

```powershell
# Démarrer
cd py_backend
python main.py

# Avec logs détaillés
python main.py --host 0.0.0.0 --port 5000

# Vérifier les processus
Get-Process | Where-Object {$_.ProcessName -like "*python*"}
```

### Frontend

```powershell
# Démarrer en dev
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Vérifier les processus
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Jobs PowerShell

```powershell
# Lister les jobs actifs
Get-Job

# Voir les logs d'un job
Receive-Job -Id <ID> -Keep

# Arrêter un job
Stop-Job -Id <ID>
Remove-Job -Id <ID>
```

---

## 📊 Monitoring

### Logs Backend

```powershell
# Si démarré avec start-claraverse-conda.ps1
$jobs = Get-Content .claraverse-jobs.json | ConvertFrom-Json
Receive-Job -Id $jobs.Backend -Keep
```

### Logs Frontend

```powershell
# Si démarré avec start-claraverse-conda.ps1
$jobs = Get-Content .claraverse-jobs.json | ConvertFrom-Json
Receive-Job -Id $jobs.Frontend -Keep
```

### Console Navigateur

Ouvrir la console (F12) pour voir :
- Logs de détection automatique
- Erreurs de communication avec le backend
- Événements personnalisés

---

## 🚨 Problèmes Courants

### Backend ne démarre pas

**Symptôme** : Erreur lors du démarrage de `main.py`

**Solutions** :
1. Vérifier que l'environnement conda est activé
2. Vérifier que les dépendances sont installées
3. Vérifier que le port 5000 est libre

```powershell
conda activate claraverse_backend
pip list  # Vérifier les packages
netstat -ano | findstr :5000  # Vérifier le port
```

### Frontend ne se connecte pas au backend

**Symptôme** : Erreur "Failed to fetch" dans la console

**Solutions** :
1. Vérifier que le backend est démarré
2. Vérifier l'URL dans le code (http://127.0.0.1:5000)
3. Vérifier CORS dans le backend

```powershell
# Tester le backend
curl http://127.0.0.1:5000/health
```

### Dialogue Lead Balance ne s'ouvre pas

**Symptôme** : Table apparaît mais pas de dialogue

**Solutions** :
1. Vérifier que `LeadBalanceAutoTrigger.js` est chargé
2. Ouvrir la console et taper : `LeadBalanceAutoTrigger.version`
3. Forcer un scan : `LeadBalanceAutoTrigger.test()`

---

## 📖 Ressources

### Documentation Externe

- **FastAPI** : https://fastapi.tiangolo.com/
- **React** : https://react.dev/
- **Vite** : https://vitejs.dev/
- **Conda** : https://docs.conda.io/

### Documentation Interne

- **Lead Balance** : `../Doc_Lead_Balance/README.md`
- **Instructions de démarrage** : `../INSTRUCTIONS_DEMARRAGE_SIMPLE.md`
- **Scripts** : Racine du projet

---

## 🤝 Contribution

### Ajouter un Endpoint Backend

1. Créer un fichier dans `py_backend/` (ex: `mon_endpoint.py`)
2. Définir le router FastAPI
3. Importer dans `main.py`
4. Documenter dans `GUIDE_BACKEND.md`

### Ajouter une Fonctionnalité Frontend

1. Créer le script dans `public/` (ex: `MonFeatureAutoTrigger.js`)
2. Ajouter la sentinelle dans `claraApiService.ts`
3. Charger le script dans `index.html`
4. Documenter dans `GUIDE_FRONTEND.md`

---

## 📝 Changelog

### Version 1.0.0 (22 Mars 2026)

- ✅ Architecture microservice complète
- ✅ Backend Python FastAPI avec conda
- ✅ Frontend React avec Vite
- ✅ Lead Balance avec déclenchement automatique
- ✅ Scripts de démarrage automatique
- ✅ Documentation complète

---

## 📧 Support

Pour toute question ou problème :

1. Consulter `TROUBLESHOOTING.md`
2. Vérifier les logs (backend et frontend)
3. Consulter la documentation spécifique

---

**Prêt à démarrer ?** → Voir [00_QUICK_START.md](./00_QUICK_START.md)
