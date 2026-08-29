# 🚀 GUIDE DÉPLOIEMENT ZEABUR (Sans Build Local)

**Date:** 20 Avril 2026  
**Objectif:** Déployer Frontend ET Backend sur Zeabur avec Docker Compose  
**⚠️ IMPORTANT:** Netlify n'est PLUS utilisé - Tout est sur Zeabur maintenant

---

## 📋 SITUATION

- Vous ne pouvez pas exécuter `docker build` sur votre desktop
- Zeabur va builder les images Docker automatiquement depuis GitHub
- Frontend ET Backend seront tous deux déployés sur Zeabur
- Netlify est abandonné pour simplifier l'architecture

---

## ✅ FICHIERS CRÉÉS

### 1. docker-compose.yml (Racine du projet)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./py_backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - HOST=0.0.0.0
      - PORT=8080
      - CORS_ORIGINS=https://prclaravi.zeabur.app
    # ... (voir fichier complet)

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    # ... (voir fichier complet)
```

### 2. Dockerfile.frontend (Racine du projet)

Build React + Nginx en 2 stages:
- Stage 1: Build avec Node.js
- Stage 2: Serveur Nginx pour production

### 3. py_backend/Dockerfile (Adapté pour Zeabur)

- Port changé: 7860 → 8080 (requis par Zeabur)
- CMD: `uvicorn main:app --host 0.0.0.0 --port 8080`

---

## 🔄 WORKFLOW DE DÉPLOIEMENT

```
┌─────────────────────────────────────────────────────────┐
│  1. DÉVELOPPEMENT LOCAL (Sans Docker)                   │
├─────────────────────────────────────────────────────────┤
│  • Frontend: npm run dev (localhost:5173)               │
│  • Backend: python main.py (localhost:5000)             │
│  • Tests locaux                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  2. COMMIT ET PUSH VERS GITHUB                          │
├─────────────────────────────────────────────────────────┤
│  git add docker-compose.yml Dockerfile.frontend         │
│  git add py_backend/Dockerfile                          │
│  git commit -m "feat: Docker Compose pour Zeabur"       │
│  git push origin main                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  3. ZEABUR DÉTECTE LE PUSH                              │
├─────────────────────────────────────────────────────────┤
│  • Zeabur lit docker-compose.yml                        │
│  • Build automatique des 2 services                     │
│  • Déploiement automatique                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  4. SERVICES EN PRODUCTION                              │
├─────────────────────────────────────────────────────────┤
│  • Frontend: https://prclaravi.zeabur.app               │
│  • Backend: https://pybackend.zeabur.app                │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 ÉTAPE 1: PUSH VERS GITHUB

### Script PowerShell Automatique

```powershell
# Créer le script: push-to-github-zeabur.ps1

Write-Host "🚀 Push vers GitHub pour déploiement Zeabur" -ForegroundColor Cyan
Write-Host ""

# Vérifier les fichiers
$requiredFiles = @(
    "docker-compose.yml",
    "Dockerfile.frontend",
    "py_backend/Dockerfile"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Fichiers à commiter:" -ForegroundColor Yellow
git status --short

Write-Host ""
$confirm = Read-Host "Continuer? (O/N)"

if ($confirm -eq "O" -or $confirm -eq "o") {
    # Add files
    git add docker-compose.yml
    git add Dockerfile.frontend
    git add py_backend/Dockerfile
    git add public/backendConfig.js
    
    # Commit
    git commit -m "feat: Docker Compose pour déploiement Zeabur

- Ajout docker-compose.yml avec services frontend/backend
- Création Dockerfile.frontend (React + Nginx)
- Adaptation py_backend/Dockerfile pour Zeabur (port 8080)
- Configuration CORS pour production
- Switch backend dynamique préservé"
    
    # Push
    git push origin main
    
    Write-Host ""
    Write-Host "✅ Push réussi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaine étape: Configurer Zeabur" -ForegroundColor Yellow
} else {
    Write-Host "Annulé" -ForegroundColor Yellow
}
```

### Commandes Manuelles

```powershell
# 1. Vérifier les fichiers
git status

# 2. Ajouter les fichiers Docker
git add docker-compose.yml
git add Dockerfile.frontend
git add py_backend/Dockerfile

# 3. Commit
git commit -m "feat: Docker Compose pour Zeabur"

# 4. Push
git push origin main
```

---

## 🔧 ÉTAPE 2: CONFIGURATION ZEABUR

### A. Créer un Nouveau Projet

1. Aller sur https://zeabur.com/dashboard
2. Cliquer sur **"New Project"**
3. Nom du projet: `claraverse-production`
4. Région: Choisir la plus proche (ex: `us-west-1`)

### B. Ajouter le Service Backend

#### Configuration Initiale
```
1. Cliquer "Add Service"
2. Sélectionner "Git Repository"
3. Choisir votre repository GitHub
4. Branch: main
5. Build Method: Docker Compose
6. Service: backend
```

#### Configuration Build
```
Service Name: backend
Build Method: Docker Compose
Service from docker-compose.yml: backend
Port: 8080
```

#### Variables d'Environnement
```
HOST=0.0.0.0
PORT=8080
PYTHONUNBUFFERED=1
APP_ENV=production
LOG_LEVEL=info
CORS_ORIGINS=https://prclaravi.zeabur.app,http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
CORS_EXPOSE_HEADERS=Content-Disposition,Content-Type,Content-Length
```

#### Domaine
```
Domain: pybackend.zeabur.app
HTTPS: Activé (automatique)
```

### C. Ajouter le Service Frontend

#### Configuration Initiale
```
1. Cliquer "Add Service"
2. Sélectionner "Git Repository"
3. Choisir le même repository
4. Branch: main
5. Build Method: Docker Compose
6. Service: frontend
```

#### Configuration Build
```
Service Name: frontend
Build Method: Docker Compose
Service from docker-compose.yml: frontend
Port: 80
```

#### Variables d'Environnement
```
NODE_ENV=production
VITE_BACKEND_URL=https://pybackend.zeabur.app
```

#### Domaine
```
Domain: prclaravi.zeabur.app
HTTPS: Activé (automatique)
```

---

## 🚀 ÉTAPE 3: DÉPLOIEMENT

### A. Lancer le Build

1. Dans Zeabur, cliquer sur **"Deploy"** pour chaque service
2. Zeabur va:
   - Cloner le repository GitHub
   - Lire `docker-compose.yml`
   - Builder les images Docker
   - Déployer les conteneurs

### B. Suivre les Logs de Build

```
Backend Build:
├─ Pulling base image python:3.11-slim
├─ Installing system dependencies
├─ Installing Python packages
├─ Copying application code
└─ ✓ Build successful (3-5 minutes)

Frontend Build:
├─ Stage 1: Node.js build
│  ├─ Installing npm dependencies
│  ├─ Running npm run build
│  └─ ✓ Build artifacts created
├─ Stage 2: Nginx setup
│  ├─ Copying build files
│  └─ ✓ Nginx configured
└─ ✓ Build successful (5-7 minutes)
```

### C. Vérifier le Déploiement

```powershell
# Test Backend
curl https://pybackend.zeabur.app/health

# Test Frontend
curl https://prclaravi.zeabur.app/health

# Ouvrir dans le navigateur
Start-Process "https://prclaravi.zeabur.app"
```

---

## ✅ ÉTAPE 4: VALIDATION

### Tests Fonctionnels

#### 1. Vérifier le Switch Backend

```javascript
// Ouvrir https://prclaravi.zeabur.app
// Console navigateur (F12) devrait afficher:
🔗 Claraverse Backend Configuration:
   Environment: production
   Backend URL: https://pybackend.zeabur.app
   Timeout: 300000ms
✅ Backend is healthy
```

#### 2. Test Case 24 (États Financiers)

1. Ouvrir https://prclaravi.zeabur.app
2. Uploader un fichier Excel de balance
3. Taper "Etat fin" dans le chat
4. Vérifier le traitement (5-10 secondes)
5. Vérifier l'affichage des résultats

#### 3. Test Case 21 (Lead Balance)

1. Uploader un fichier Excel
2. Clic droit → "Lead Balance"
3. Vérifier le traitement

---

## 🔄 WORKFLOW DE MISE À JOUR

### Développement Continu

```powershell
# 1. Développer localement (sans Docker)
npm run dev  # Frontend
python main.py  # Backend

# 2. Tester localement
# ...

# 3. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# 4. Zeabur redéploie automatiquement
# Attendre 5-10 minutes

# 5. Vérifier en production
Start-Process "https://prclaravi.zeabur.app"
```

---

## 📊 MONITORING ZEABUR

### Logs en Temps Réel

```
1. Dashboard Zeabur
2. Sélectionner le service (backend ou frontend)
3. Onglet "Logs"
4. Filtrer par niveau: ERROR, WARN, INFO
```

### Métriques

```
1. Onglet "Metrics"
2. Surveiller:
   - CPU Usage
   - Memory Usage
   - Request Rate
   - Response Time
```

---

## ⚠️ POINTS D'ATTENTION

### 1. Temps de Build

- Backend: 3-5 minutes
- Frontend: 5-7 minutes
- Total: ~10 minutes par déploiement

### 2. Coûts Zeabur

- 2 services = 2x ressources
- Vérifier le plan tarifaire
- Optimiser les images si nécessaire

### 3. Switch Backend

- ✅ Fonctionne automatiquement
- Détecte l'environnement (local vs production)
- Aucune modification nécessaire

---

## 🐛 TROUBLESHOOTING

### Problème: Build Échoue

```
Solution:
1. Vérifier les logs de build dans Zeabur
2. Vérifier que tous les fichiers sont sur GitHub
3. Vérifier les Dockerfiles (syntaxe)
```

### Problème: Service Ne Démarre Pas

```
Solution:
1. Vérifier les logs du service
2. Vérifier les variables d'environnement
3. Vérifier le health check
```

### Problème: CORS Errors

```
Solution:
1. Vérifier CORS_ORIGINS dans les variables d'environnement
2. Vérifier que le frontend utilise la bonne URL backend
3. Vérifier les logs backend
```

---

## 📋 CHECKLIST FINALE

- [ ] docker-compose.yml créé
- [ ] Dockerfile.frontend créé
- [ ] py_backend/Dockerfile adapté (port 8080)
- [ ] Fichiers pushés sur GitHub
- [ ] Projet Zeabur créé
- [ ] Service backend configuré
- [ ] Service frontend configuré
- [ ] Variables d'environnement configurées
- [ ] Domaines configurés
- [ ] Build réussi
- [ ] Services démarrés
- [ ] Tests de santé OK
- [ ] Switch backend fonctionne
- [ ] Tests fonctionnels OK

---

## 🎉 SUCCÈS!

Votre application est maintenant déployée sur Zeabur avec Docker Compose!

**URLs de production:**
- Frontend: https://prclaravi.zeabur.app
- Backend: https://pybackend.zeabur.app

**Workflow de développement:**
1. Développer localement (sans Docker)
2. Push vers GitHub
3. Zeabur déploie automatiquement
4. Valider en production

---

**Prochaine étape:** Créer le script de push automatique
