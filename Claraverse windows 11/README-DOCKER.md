# 🐳 Guide Docker E-audit (Claraverse)

Guide complet pour déployer E-audit avec Docker sur Windows 10 + WSL2

## 📋 Prérequis

- ✅ Windows 10 (Build 10.0.19045.6332)
- ✅ WSL2 avec Ubuntu 24.04.1 LTS
- ✅ Docker Engine 27.5.1 dans WSL
- ✅ Docker Compose v2.32.4

## 🚀 Démarrage Rapide

### 1. Rendre les scripts exécutables

```bash
chmod +x build-docker.sh start-docker.sh stop-docker.sh
```

### 2. Build des images Docker

```bash
./build-docker.sh
```

Cette commande va :
- Vérifier que Docker est opérationnel
- Builder l'image du frontend (React/Vite + Nginx)
- Builder l'image du backend (Python/FastAPI)

### 3. Démarrer les conteneurs

```bash
./start-docker.sh
```

Cette commande va :
- Démarrer les conteneurs en arrière-plan
- Vérifier la santé des services
- Afficher les URLs d'accès

### 4. Accéder à l'application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📦 Architecture Docker

### Services

1. **Frontend** (e-audit-frontend)
   - Port: 3000 → 80
   - Image: Node 20 Alpine + Nginx
   - Build multi-stage pour optimiser la taille

2. **Backend** (e-audit-backend)
   - Port: 5000
   - Image: Python 3.11 Slim
   - FastAPI avec Uvicorn

### Réseau

- Réseau bridge `e-audit-network` pour la communication inter-services
- Le frontend peut communiquer avec le backend via `http://backend:5000`

### Volumes

- `backend-data`: Persistance des données backend dans `/root/.clara`
- `./logs`: Logs du backend (optionnel)

## 🛠️ Commandes Utiles

### Gestion des conteneurs

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Redémarrer
docker compose restart

# Voir l'état
docker compose ps

# Voir les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f frontend
docker compose logs -f backend
```

### Gestion des images

```bash
# Lister les images
docker images

# Supprimer les images
docker rmi e-audit-frontend e-audit-backend

# Rebuild sans cache
docker compose build --no-cache
```

### Gestion des volumes

```bash
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect e-audit_backend-data

# Supprimer les volumes (⚠️ perte de données)
docker compose down -v
```

### Nettoyage

```bash
# Nettoyer les ressources inutilisées
docker system prune -a

# Nettoyer uniquement les volumes non utilisés
docker volume prune
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Frontend
NODE_ENV=production

# Backend
PYTHONUNBUFFERED=1
HOST=0.0.0.0
PORT=5000

# API Keys (si nécessaire)
OPENAI_API_KEY=your-key-here
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
```

### Ports personnalisés

Modifiez `docker-compose.yml` :

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Changez 3000 en 8080
  
  backend:
    ports:
      - "8000:5000"  # Changez 5000 en 8000
```

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Voir les logs détaillés
docker compose logs backend

# Vérifier la santé du conteneur
docker inspect e-audit-backend

# Redémarrer le backend
docker compose restart backend
```

### Problème de connexion frontend → backend

1. Vérifiez que les deux conteneurs sont sur le même réseau :
```bash
docker network inspect e-audit-network
```

2. Testez la connectivité depuis le frontend :
```bash
docker exec e-audit-frontend ping backend
```

### Erreur de port déjà utilisé

```bash
# Voir les ports utilisés
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Arrêter le conteneur qui utilise le port
docker stop <nom_conteneur>
```

### Problème de permissions WSL2

```bash
# Donner les permissions aux scripts
chmod +x *.sh

# Si problème avec Docker
sudo service docker restart
```

### Espace disque insuffisant

```bash
# Voir l'utilisation
docker system df

# Nettoyer
docker system prune -a --volumes
```

## 📊 Monitoring

### Voir l'utilisation des ressources

```bash
docker stats
```

### Healthcheck du backend

Le backend a un healthcheck automatique :
- Intervalle: 30s
- Timeout: 10s
- Retries: 3

Vérifiez manuellement :
```bash
curl http://localhost:5000/health
```

## 🔄 Mise à jour

### Mettre à jour le code

```bash
# 1. Arrêter les conteneurs
./stop-docker.sh

# 2. Mettre à jour le code (git pull, etc.)
git pull

# 3. Rebuild les images
./build-docker.sh

# 4. Redémarrer
./start-docker.sh
```

## 📝 Notes Importantes

### Ports déjà utilisés dans votre environnement

⚠️ Évitez ces ports :
- 3000 (Flowise) - **Conflit potentiel avec le frontend**
- 5001 (Dockge)
- 5002 (Lead Balance)
- 5432 (PostgreSQL/pgvector)
- 27017 (MongoDB instable)

### Solution si port 3000 occupé

Modifiez `docker-compose.yml` :
```yaml
frontend:
  ports:
    - "8080:80"  # Utilisez 8080 au lieu de 3000
```

Puis accédez à : http://localhost:8080

## 🎯 Workflow de Développement

### Développement local (sans Docker)

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

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [WSL2 + Docker](https://docs.docker.com/desktop/wsl/)

## ✅ Checklist de Déploiement

- [ ] Docker est installé et fonctionne dans WSL2
- [ ] Les scripts sont exécutables (`chmod +x *.sh`)
- [ ] Les ports 3000 et 5000 sont disponibles
- [ ] Le fichier `.env` est configuré (si nécessaire)
- [ ] Build réussi (`./build-docker.sh`)
- [ ] Conteneurs démarrés (`./start-docker.sh`)
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Backend accessible sur http://localhost:5000
- [ ] Les logs ne montrent pas d'erreurs

## 🆘 Support

En cas de problème :

1. Vérifiez les logs : `docker compose logs -f`
2. Vérifiez l'état : `docker compose ps`
3. Redémarrez : `docker compose restart`
4. Rebuild : `./build-docker.sh`

---

**Prêt pour le déploiement!** 🚀
