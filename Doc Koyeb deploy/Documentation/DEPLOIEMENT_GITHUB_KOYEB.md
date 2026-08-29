# 🚀 Déploiement via GitHub + Koyeb

## ✅ Situation Actuelle

- ✅ Git installé : v2.53.0
- ✅ Repository GitHub : `https://github.com/sekadalle2024/Calaraverse_windows_s_11_v0_02-03-2026.git`
- ✅ Branch : `master`
- ✅ Backend prêt : `py_backend/`

---

## 📋 Étapes de Déploiement

### Étape 1 : Pousser le Code sur GitHub

Ajoutons et poussons tous les fichiers :

```powershell
# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Ajout backend Python pour deploiement Koyeb"

# Pousser sur GitHub
git push origin master
```

---

### Étape 2 : Connecter GitHub à Koyeb

Dans le Dashboard Koyeb (https://app.koyeb.com) :

1. **Cliquez sur "Create Service"**

2. **Sélectionnez "GitHub"**

3. **Autorisez Koyeb** :
   - Cliquez sur "Connect GitHub"
   - Autorisez l'accès à vos repositories
   - Sélectionnez votre repository : `Calaraverse_windows_s_11_v0_02-03-2026`

4. **Configuration du Repository** :
   ```
   Repository: Calaraverse_windows_s_11_v0_02-03-2026
   Branch: master
   ```

---

### Étape 3 : Configuration du Build

1. **Builder** :
   ```
   Builder: Dockerfile
   ```

2. **Build Context** :
   ```
   Build context: py_backend
   ```
   (Important : spécifier le sous-dossier)

3. **Dockerfile Path** :
   ```
   Dockerfile: Dockerfile
   ```
   (Relatif au build context)

---

### Étape 4 : Configuration du Service

#### Nom et Région
```
Service name: clara-backend
App name: clara-backend
Region: Frankfurt (fra)
```

#### Instance
```
Instance type: Nano (gratuit)
```

#### Port
```
Port: 5000
Protocol: HTTP
```

---

### Étape 5 : Variables d'Environnement

Ajoutez ces variables :

```
HOST = 0.0.0.0
PORT = 5000
PYTHONUNBUFFERED = 1
PYTHONDONTWRITEBYTECODE = 1
```

Variables optionnelles (si nécessaire) :
```
OPENAI_API_KEY = votre-cle-api
NEO4J_URI = neo4j://localhost:7687
NEO4J_USERNAME = neo4j
NEO4J_PASSWORD = password
```

---

### Étape 6 : Déploiement Automatique

1. **Activez le déploiement automatique** :
   - Cochez "Auto-deploy on push"
   - Chaque push sur `master` déclenchera un nouveau déploiement

2. **Cliquez sur "Deploy"**

---

## 🔄 Suivi du Déploiement

### Phase 1 : Cloning (30 secondes)
```
✓ Cloning repository from GitHub...
✓ Checking out branch master...
✓ Repository cloned successfully
```

### Phase 2 : Building (5-10 minutes)
```
✓ Building Docker image from py_backend/Dockerfile...
✓ Installing Python dependencies...
✓ Installing spaCy model...
✓ Image built successfully
```

### Phase 3 : Deploying (1-2 minutes)
```
✓ Starting container...
✓ Application started on port 5000
✓ Health check passed
```

### Phase 4 : Healthy ✅
```
Status: 🟢 Healthy
URL: https://clara-backend-[votre-org].koyeb.app
```

---

## 🌐 Accéder à votre API

### URL de l'API
```
https://clara-backend-[votre-org].koyeb.app
```

### Tester
```bash
# Health check
curl https://clara-backend-[votre-org].koyeb.app/health

# Documentation
https://clara-backend-[votre-org].koyeb.app/docs
```

---

## 🔧 Mises à Jour Futures

Avec le déploiement automatique activé :

```powershell
# Modifier votre code
# ...

# Commit et push
git add .
git commit -m "Mise a jour du backend"
git push origin master

# Koyeb déploie automatiquement !
```

---

## 📊 Avantages de cette Méthode

✅ **Déploiement automatique** : Chaque push déclenche un déploiement  
✅ **Historique Git** : Rollback facile vers une version précédente  
✅ **CI/CD intégré** : Pipeline de déploiement automatique  
✅ **Pas de CLI nécessaire** : Tout via le Dashboard  
✅ **Collaboration** : Plusieurs développeurs peuvent contribuer  

---

## 🛠️ Dépannage

### Erreur "Build context not found"

**Solution** : Vérifiez que le build context est bien `py_backend`

### Erreur "Dockerfile not found"

**Solution** : Le Dockerfile doit être dans `py_backend/Dockerfile`

### Build échoue

**Solution** : Consultez les logs de build dans le Dashboard

---

## 📝 Configuration Complète

```yaml
GitHub:
  Repository: Calaraverse_windows_s_11_v0_02-03-2026
  Branch: master
  Auto-deploy: Enabled

Build:
  Builder: Dockerfile
  Context: py_backend
  Dockerfile: Dockerfile

Service:
  Name: clara-backend
  Region: Frankfurt (fra)
  Instance: Nano

Network:
  Port: 5000
  Protocol: HTTP
  Health Check: /health

Environment:
  HOST: 0.0.0.0
  PORT: 5000
  PYTHONUNBUFFERED: 1
  PYTHONDONTWRITEBYTECODE: 1

Scaling:
  Min: 1
  Max: 1
```

---

## ✅ Checklist

### Avant de Déployer
- [ ] Code poussé sur GitHub
- [ ] Repository accessible
- [ ] `py_backend/Dockerfile` présent
- [ ] `py_backend/requirements.txt` présent

### Configuration Koyeb
- [ ] GitHub connecté
- [ ] Repository sélectionné
- [ ] Build context : `py_backend`
- [ ] Port : `5000`
- [ ] Variables d'environnement ajoutées

### Après le Déploiement
- [ ] Build réussi
- [ ] Service Healthy
- [ ] API accessible
- [ ] Documentation testée

---

**Temps estimé** : 15-20 minutes  
**Méthode** : GitHub + Koyeb Dashboard  
**Coût** : Gratuit (instance Nano)
