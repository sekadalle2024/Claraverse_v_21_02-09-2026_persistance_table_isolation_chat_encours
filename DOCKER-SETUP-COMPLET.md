# 🐳 Configuration Docker Complète - E-audit (Claraverse)

## 📦 Fichiers Créés

### Fichiers Docker Principaux
- ✅ `Dockerfile.frontend` - Image du frontend (React/Vite + Nginx)
- ✅ `Dockerfile.backend` - Image du backend (Python/FastAPI)
- ✅ `docker-compose.yml` - Orchestration des services
- ✅ `.dockerignore` - Fichiers à exclure du build

### Scripts de Gestion
- ✅ `build-docker.sh` - Build des images Docker
- ✅ `start-docker.sh` - Démarrage des conteneurs
- ✅ `stop-docker.sh` - Arrêt des conteneurs
- ✅ `check-docker-setup.sh` - Vérification de l'environnement

### Documentation
- ✅ `README-DOCKER.md` - Documentation complète
- ✅ `DEMARRAGE-RAPIDE-DOCKER.md` - Guide rapide
- ✅ `COMMANDES-DOCKER-WSL2.txt` - Référence des commandes
- ✅ `.env.docker` - Template de configuration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           E-audit (Claraverse)              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Frontend   │      │   Backend    │   │
│  │  React/Vite  │◄────►│   FastAPI    │   │
│  │   + Nginx    │      │   Python     │   │
│  └──────────────┘      └──────────────┘   │
│       :3000                 :5000          │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │      Réseau: e-audit-network         │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   Volume: backend-data (/root/.clara)│  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🚀 Démarrage en 3 Étapes

### Étape 1: Vérification
```bash
chmod +x check-docker-setup.sh
./check-docker-setup.sh
```

### Étape 2: Build
```bash
chmod +x build-docker.sh
./build-docker.sh
```

### Étape 3: Démarrage
```bash
chmod +x start-docker.sh
./start-docker.sh
```

## 🌐 Accès aux Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Backend Health**: http://localhost:5000/health

## 📊 Services Configurés

### Frontend (e-audit-frontend)
- **Image**: Node 20 Alpine + Nginx
- **Port**: 3000:80
- **Build**: Multi-stage pour optimisation
- **Restart**: unless-stopped

### Backend (e-audit-backend)
- **Image**: Python 3.11 Slim
- **Port**: 5000:5000
- **Volume**: backend-data → /root/.clara
- **Healthcheck**: Toutes les 30s
- **Restart**: unless-stopped

## 🔧 Configuration Avancée

### Changer les Ports

Éditez `docker-compose.yml` :

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Au lieu de 3000:80
  
  backend:
    ports:
      - "8000:5000"  # Au lieu de 5000:5000
```

### Ajouter des Variables d'Environnement

1. Copiez le template :
```bash
cp .env.docker .env
```

2. Éditez `.env` :
```env
OPENAI_API_KEY=votre-clé-ici
NEO4J_PASSWORD=votre-mot-de-passe
```

3. Modifiez `docker-compose.yml` :
```yaml
backend:
  env_file:
    - .env
```

### Configurer la Persistance

Le backend utilise un volume Docker pour la persistance :
- **Volume**: `backend-data`
- **Montage**: `/root/.clara`
- **Contenu**: Bases de données, fichiers utilisateur, cache

Pour sauvegarder :
```bash
docker run --rm -v e-audit_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .
```

Pour restaurer :
```bash
docker run --rm -v e-audit_backend-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

## 🐛 Dépannage

### Problème 1: Port 3000 déjà utilisé (Flowise)

**Solution**: Changez le port du frontend
```yaml
frontend:
  ports:
    - "8080:80"
```

### Problème 2: Docker ne démarre pas

**Solution**:
```bash
sudo service docker start
docker info
```

### Problème 3: Erreur de build

**Solution**: Rebuild sans cache
```bash
docker compose build --no-cache
```

### Problème 4: Backend ne répond pas

**Solution**: Vérifiez les logs
```bash
docker compose logs backend
docker compose restart backend
```

### Problème 5: Problème de permissions

**Solution**:
```bash
chmod +x *.sh
sudo chown -R $USER:$USER .
```

## 📋 Commandes Essentielles

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Logs
docker compose logs -f

# État
docker compose ps

# Rebuild
docker compose build

# Redémarrer
docker compose restart

# Nettoyer
docker system prune -a
```

## ⚠️ Ports à Éviter

Votre environnement WSL2 utilise déjà :
- ❌ 3000 (Flowise) - **Conflit potentiel**
- ❌ 5001 (Dockge)
- ❌ 5002 (Lead Balance)
- ❌ 5432 (PostgreSQL)
- ❌ 27017 (MongoDB)

Ports recommandés :
- ✅ 8000-8999
- ✅ 4000-4999
- ✅ 9000-9999

## 🔄 Workflow de Développement

### Développement Local (sans Docker)
```bash
# Frontend
npm run dev

# Backend
cd py_backend
python main.py
```

### Production (avec Docker)
```bash
./build-docker.sh
./start-docker.sh
```

### Mise à Jour
```bash
docker compose down
git pull
docker compose build
docker compose up -d
```

## 📈 Monitoring

### Voir l'utilisation des ressources
```bash
docker stats
```

### Vérifier la santé
```bash
curl http://localhost:5000/health
```

### Logs en temps réel
```bash
docker compose logs -f frontend
docker compose logs -f backend
```

## 🎯 Checklist de Déploiement

- [ ] Docker installé et fonctionnel dans WSL2
- [ ] Scripts rendus exécutables (`chmod +x *.sh`)
- [ ] Vérification réussie (`./check-docker-setup.sh`)
- [ ] Ports 3000 et 5000 disponibles (ou modifiés)
- [ ] Build réussi (`./build-docker.sh`)
- [ ] Conteneurs démarrés (`./start-docker.sh`)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] Backend accessible (http://localhost:5000)
- [ ] Healthcheck OK (`curl http://localhost:5000/health`)
- [ ] Logs sans erreurs (`docker compose logs`)

## 📚 Ressources

- **Documentation complète**: `README-DOCKER.md`
- **Guide rapide**: `DEMARRAGE-RAPIDE-DOCKER.md`
- **Commandes**: `COMMANDES-DOCKER-WSL2.txt`
- **Configuration**: `.env.docker`

## ✅ Prêt pour la Production

Votre configuration Docker est maintenant complète et prête à être déployée !

### Prochaines Étapes

1. **Vérifier l'environnement**:
   ```bash
   ./check-docker-setup.sh
   ```

2. **Builder les images**:
   ```bash
   ./build-docker.sh
   ```

3. **Démarrer l'application**:
   ```bash
   ./start-docker.sh
   ```

4. **Tester**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/health

---

**Configuration créée avec succès!** 🎉

Pour toute question, consultez la documentation ou les logs :
```bash
docker compose logs -f
```
