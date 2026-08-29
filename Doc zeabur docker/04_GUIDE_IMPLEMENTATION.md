# 🚀 GUIDE D'IMPLÉMENTATION PRATIQUE

**Date:** 20 Avril 2026  
**Objectif:** Déployer Docker Compose sur Zeabur étape par étape

---

## PHASE 1: PRÉPARATION (30 minutes)

### Étape 1.1: Vérifier les Prérequis

```powershell
# Vérifier Docker
docker --version
docker-compose --version

# Vérifier Git
git --version

# Vérifier Node.js
node --version
npm --version

# Vérifier Python
python --version
pip --version
```

**Versions minimales requises:**
- Docker: 20.10+
- Docker Compose: 2.0+
- Node.js: 18+
- Python: 3.11+

### Étape 1.2: Créer les Fichiers de Configuration

#### A. Créer docker-compose.yml

```powershell
# Exécuter le script de création
.\Doc zeabur docker\Scripts\create-docker-compose.ps1
```

Ou créer manuellement à la racine du projet:
```yaml
# Copier le contenu depuis 02_SOLUTION_DOCKER_COMPOSE_ZEABUR.md
```

#### B. Créer Dockerfile.frontend

```powershell
# À la racine du projet
New-Item -Path "Dockerfile.frontend" -ItemType File
```

Copier le contenu depuis `02_SOLUTION_DOCKER_COMPOSE_ZEABUR.md`

#### C. Adapter py_backend/Dockerfile

```powershell
# Vérifier le fichier existant
cat py_backend/Dockerfile

# Adapter si nécessaire (voir section 2.3 du document 02)
```

### Étape 1.3: Créer le Fichier .env (Optionnel)

```powershell
# À la racine du projet
@"
# Environnement
APP_ENV=development
LOG_LEVEL=debug

# Backend
BACKEND_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend
VITE_BACKEND_URL=http://localhost:5000
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

---

## PHASE 2: TESTS LOCAUX (1 heure)

### Étape 2.1: Build des Images

```powershell
# Build sans cache (première fois)
docker-compose build --no-cache

# Build normal (après modifications)
docker-compose build
```

**Temps estimé:** 5-10 minutes

### Étape 2.2: Démarrer les Services

```powershell
# Démarrer en mode détaché
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f
```

**Résultat attendu:**
```
NAME                    STATUS              PORTS
claraverse-frontend     Up (healthy)        0.0.0.0:3000->80/tcp
claraverse-backend      Up (healthy)        0.0.0.0:5000->8080/tcp
```

### Étape 2.3: Tests de Santé

#### A. Test Backend

```powershell
# Health check
curl http://localhost:5000/health

# API Documentation
Start-Process "http://localhost:5000/docs"

# Test endpoint spécifique
curl http://localhost:5000/
```

**Résultat attendu:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-04-20T..."
}
```

#### B. Test Frontend

```powershell
# Health check
curl http://localhost:3000/health

# Ouvrir dans le navigateur
Start-Process "http://localhost:3000"
```

**Résultat attendu:**
- Page d'accueil Claraverse s'affiche
- Console navigateur: "Backend URL: http://localhost:5000"

### Étape 2.4: Test du Switch Backend

#### A. Vérifier la Console Navigateur

```javascript
// Ouvrir DevTools (F12)
// Console devrait afficher:
🔗 Claraverse Backend Configuration:
   Environment: development
   Backend URL: http://localhost:5000
   Timeout: 300000ms
✅ Backend is healthy
```

#### B. Test Fonctionnel (Case 24 - États Financiers)

1. Ouvrir http://localhost:3000
2. Aller dans le chat
3. Uploader un fichier Excel de balance
4. Taper "Etat fin" dans le chat
5. Vérifier que le traitement fonctionne

**Résultat attendu:**
- Fichier uploadé avec succès
- Traitement en cours (spinner)
- Résultats affichés (HTML avec accordéons)

### Étape 2.5: Test des Logs

```powershell
# Logs backend uniquement
docker-compose logs backend

# Logs frontend uniquement
docker-compose logs frontend

# Logs en temps réel
docker-compose logs -f backend

# Filtrer les erreurs
docker-compose logs backend | Select-String "ERROR"
```

### Étape 2.6: Arrêter les Services

```powershell
# Arrêter sans supprimer
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer tout (conteneurs + volumes + images)
docker-compose down -v --rmi all
```

---

## PHASE 3: PRÉPARATION GITHUB (15 minutes)

### Étape 3.1: Créer .dockerignore

```powershell
@"
# Node
node_modules/
npm-debug.log
.npm

# Python
__pycache__/
*.py[cod]
*$py.class
.Python
*.so
.env
.venv
venv/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
*.egg-info/

# Logs
*.log
logs/

# Tests
.pytest_cache/
.coverage
htmlcov/

# Git
.git/
.gitignore

# Documentation temporaire
Doc */
*.md
!README.md
"@ | Out-File -FilePath ".dockerignore" -Encoding UTF8
```

### Étape 3.2: Mettre à Jour .gitignore

```powershell
# Ajouter à .gitignore
@"

# Docker
.env
docker-compose.override.yml

# Logs Docker
*.log
"@ | Out-File -FilePath ".gitignore" -Append -Encoding UTF8
```

### Étape 3.3: Commit et Push

```powershell
# Vérifier les fichiers modifiés
git status

# Ajouter les nouveaux fichiers
git add docker-compose.yml
git add Dockerfile.frontend
git add py_backend/Dockerfile
git add .dockerignore
git add public/backendConfig.js

# Commit
git commit -m "feat: ajout Docker Compose pour déploiement Zeabur

- Ajout docker-compose.yml avec services frontend/backend
- Création Dockerfile.frontend avec Nginx
- Adaptation py_backend/Dockerfile pour Zeabur (port 8080)
- Configuration switch backend dynamique
- Support environnements local et production"

# Push vers GitHub
git push origin main
```

---

## PHASE 4: CONFIGURATION ZEABUR (30 minutes)

### Étape 4.1: Connexion à Zeabur

1. Aller sur https://zeabur.com
2. Se connecter avec GitHub
3. Autoriser l'accès au repository

### Étape 4.2: Créer un Nouveau Projet

1. Cliquer sur "New Project"
2. Nom: `claraverse-production`
3. Région: Choisir la plus proche (ex: `us-west-1`)

### Étape 4.3: Ajouter le Service Backend

#### A. Configuration Initiale
```
1. Cliquer "Add Service"
2. Sélectionner "Git Repository"
3. Choisir le repository Claraverse
4. Branch: main
5. Build Method: Docker Compose
6. Service Name: backend
```

#### B. Configuration Build
```
Root Directory: /
Dockerfile: py_backend/Dockerfile
Build Context: ./py_backend
Port: 8080
```

#### C. Variables d'Environnement
```
HOST=0.0.0.0
PORT=8080
PYTHONUNBUFFERED=1
APP_ENV=production
LOG_LEVEL=info
CORS_ORIGINS=https://prclaravi.zeabur.app,http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
CORS_EXPOSE_HEADERS=Content-Disposition,Content-Type
```

#### D. Configuration Domaine
```
Domain: pybackend.zeabur.app
HTTPS: Activé (automatique)
```

### Étape 4.4: Ajouter le Service Frontend

#### A. Configuration Initiale
```
1. Cliquer "Add Service"
2. Sélectionner "Git Repository"
3. Choisir le repository Claraverse
4. Branch: main
5. Build Method: Docker Compose
6. Service Name: frontend
```

#### B. Configuration Build
```
Root Directory: /
Dockerfile: Dockerfile.frontend
Build Context: .
Port: 80
```

#### C. Variables d'Environnement
```
NODE_ENV=production
VITE_BACKEND_URL=https://pybackend.zeabur.app
```

#### D. Configuration Domaine
```
Domain: prclaravi.zeabur.app
HTTPS: Activé (automatique)
```

### Étape 4.5: Configuration Réseau (Optionnel)

Si les services doivent communiquer en interne:

```
1. Aller dans "Network"
2. Créer un réseau: claraverse-network
3. Ajouter les deux services au réseau
4. Backend accessible via: http://backend:8080
5. Frontend accessible via: http://frontend:80
```

### Étape 4.6: Déploiement

```
1. Cliquer "Deploy" sur chaque service
2. Attendre le build (5-10 minutes)
3. Vérifier les logs de build
4. Vérifier le statut: "Running"
```

---

## PHASE 5: VALIDATION PRODUCTION (30 minutes)

### Étape 5.1: Tests de Santé

```powershell
# Test Backend
curl https://pybackend.zeabur.app/health

# Test Frontend
curl https://prclaravi.zeabur.app/health

# Test API Documentation
Start-Process "https://pybackend.zeabur.app/docs"
```

### Étape 5.2: Test du Switch Backend

```powershell
# Ouvrir l'application
Start-Process "https://prclaravi.zeabur.app"

# Vérifier la console navigateur (F12)
# Devrait afficher:
# Backend URL: https://pybackend.zeabur.app
```

### Étape 5.3: Tests Fonctionnels

#### A. Test Case 21 (Lead Balance)

1. Ouvrir https://prclaravi.zeabur.app
2. Uploader un fichier Excel
3. Clic droit → "Lead Balance"
4. Vérifier le traitement

#### B. Test Case 24 (États Financiers)

1. Uploader un fichier Excel de balance
2. Taper "Etat fin" dans le chat
3. Vérifier le traitement (5-10 secondes)
4. Vérifier l'affichage des résultats

### Étape 5.4: Test CORS

```powershell
# Test depuis un autre domaine (devrait échouer)
curl -X OPTIONS https://pybackend.zeabur.app/etats-financiers/process-excel `
  -H "Origin: https://malicious-site.com" `
  -H "Access-Control-Request-Method: POST"

# Test depuis le frontend autorisé (devrait réussir)
curl -X OPTIONS https://pybackend.zeabur.app/etats-financiers/process-excel `
  -H "Origin: https://prclaravi.zeabur.app" `
  -H "Access-Control-Request-Method: POST"
```

### Étape 5.5: Monitoring

#### A. Logs Zeabur

```
1. Aller dans le dashboard Zeabur
2. Sélectionner le service backend
3. Onglet "Logs"
4. Filtrer par niveau: ERROR, WARN, INFO
```

#### B. Métriques

```
1. Onglet "Metrics"
2. Vérifier:
   - CPU Usage
   - Memory Usage
   - Request Rate
   - Response Time
```

---

## PHASE 6: OPTIMISATIONS (Optionnel)

### Étape 6.1: Optimiser les Images Docker

```dockerfile
# Dockerfile.frontend - Multi-stage optimisé
FROM node:18-alpine AS builder
# ... build ...

FROM nginx:alpine
# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Étape 6.2: Configurer le Cache

```yaml
# docker-compose.yml
services:
  backend:
    build:
      cache_from:
        - claraverse-backend:latest
```

### Étape 6.3: Ajouter Redis (Cache)

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - claraverse-network
```

---

## TROUBLESHOOTING

### Problème 1: Build Échoue

```powershell
# Vérifier les logs de build
docker-compose build --no-cache --progress=plain

# Vérifier les dépendances
docker-compose run --rm backend pip list
docker-compose run --rm frontend npm list
```

### Problème 2: Services Ne Démarrent Pas

```powershell
# Vérifier les logs
docker-compose logs backend
docker-compose logs frontend

# Vérifier les ports
netstat -ano | findstr "3000"
netstat -ano | findstr "5000"
```

### Problème 3: CORS Errors

```powershell
# Vérifier la configuration CORS
curl -I https://pybackend.zeabur.app/health

# Vérifier les headers
curl -v -X OPTIONS https://pybackend.zeabur.app/api/endpoint
```

---

## CHECKLIST FINALE

- [ ] Docker Compose fonctionne en local
- [ ] Switch backend détecte correctement l'environnement
- [ ] Tests Case 21 et Case 24 réussis en local
- [ ] Fichiers commités et pushés sur GitHub
- [ ] Services Zeabur configurés et déployés
- [ ] Tests de santé réussis en production
- [ ] Tests fonctionnels réussis en production
- [ ] CORS configuré correctement
- [ ] Monitoring actif
- [ ] Documentation à jour

---

**Félicitations! Votre application est déployée avec Docker Compose sur Zeabur! 🎉**

**Prochaine lecture:** `05_TESTS_VALIDATION.md`
