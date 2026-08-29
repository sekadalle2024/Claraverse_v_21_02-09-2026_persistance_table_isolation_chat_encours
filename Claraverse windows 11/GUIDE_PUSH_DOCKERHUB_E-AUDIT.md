# Guide de Push vers Docker Hub - E-Audit

## 📋 Informations du Compte Docker Hub

- **Username**: `sekadalle`
- **Repository**: `mes_images_docker`
- **Token d'accès**: `[VOTRE_TOKEN_DOCKER_HUB]`
- **Expire le**: 31 octobre 2026

## 🚀 Méthode Rapide (Recommandée)

### Option 1: Script Automatique

Double-cliquez sur le fichier:
```
push-to-dockerhub-e-audit.bat
```

Le script va:
1. Se connecter à Docker Hub
2. Construire les images Frontend et Backend
3. Les tagger correctement
4. Les pousser vers votre compte

**Mot de passe à utiliser**: `[VOTRE_TOKEN_DOCKER_HUB]`

---

## 📝 Méthode Manuelle (Étape par Étape)

### Étape 1: Connexion à Docker Hub

```cmd
docker login -u sekadalle
```

Quand demandé, entrez le token:
```
[VOTRE_TOKEN_DOCKER_HUB]
```

### Étape 2: Construction des Images

**Frontend:**
```cmd
docker build -f Dockerfile.frontend -t e-audit-frontend:latest .
```

**Backend:**
```cmd
docker build -f Dockerfile.backend -t e-audit-backend:latest .
```

### Étape 3: Tag des Images

**Frontend:**
```cmd
docker tag e-audit-frontend:latest sekadalle/mes_images_docker:e-audit-frontend
```

**Backend:**
```cmd
docker tag e-audit-backend:latest sekadalle/mes_images_docker:e-audit-backend
```

**Version Latest (Frontend):**
```cmd
docker tag e-audit-frontend:latest sekadalle/mes_images_docker:e-audit-latest
```

### Étape 4: Push vers Docker Hub

**Frontend:**
```cmd
docker push sekadalle/mes_images_docker:e-audit-frontend
```

**Backend:**
```cmd
docker push sekadalle/mes_images_docker:e-audit-backend
```

**Latest:**
```cmd
docker push sekadalle/mes_images_docker:e-audit-latest
```

---

## 🔍 Vérification

Après le push, vérifiez sur Docker Hub:
```
https://hub.docker.com/r/sekadalle/mes_images_docker/tags
```

Vous devriez voir:
- `e-audit-frontend`
- `e-audit-backend`
- `e-audit-latest`

---

## 📥 Utilisation des Images

Pour télécharger et utiliser vos images depuis n'importe quelle machine:

```cmd
docker pull sekadalle/mes_images_docker:e-audit-frontend
docker pull sekadalle/mes_images_docker:e-audit-backend
```

Ou avec docker-compose, créez un fichier `docker-compose-hub.yml`:

```yaml
version: '3.8'

services:
  frontend:
    image: sekadalle/mes_images_docker:e-audit-frontend
    container_name: e-audit-frontend
    ports:
      - "8080:80"
    networks:
      - e-audit-network
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: sekadalle/mes_images_docker:e-audit-backend
    container_name: e-audit-backend
    ports:
      - "5000:5000"
    environment:
      - PYTHONUNBUFFERED=1
      - HOST=0.0.0.0
      - PORT=5000
    volumes:
      - backend-data:/root/.clara
    networks:
      - e-audit-network
    restart: unless-stopped

networks:
  e-audit-network:
    driver: bridge

volumes:
  backend-data:
    driver: local
```

Puis lancez:
```cmd
docker-compose -f docker-compose-hub.yml up -d
```

---

## 🛠️ Commandes Utiles

### Voir les images locales
```cmd
docker images
```

### Supprimer une image locale
```cmd
docker rmi e-audit-frontend:latest
```

### Voir les containers en cours
```cmd
docker ps
```

### Arrêter tous les containers
```cmd
docker stop $(docker ps -aq)
```

### Nettoyer Docker
```cmd
docker system prune -a
```

---

## ⚠️ Dépannage

### Erreur de connexion
Si la connexion échoue, vérifiez:
1. Que Docker Desktop est lancé
2. Que vous utilisez le bon token (pas votre mot de passe)
3. Que le token n'a pas expiré

### Erreur de build
Si la construction échoue:
1. Vérifiez que tous les fichiers nécessaires sont présents
2. Assurez-vous d'être dans le bon répertoire
3. Vérifiez les logs d'erreur

### Erreur de push
Si le push échoue:
1. Vérifiez votre connexion internet
2. Assurez-vous d'être connecté à Docker Hub
3. Vérifiez que le nom du repository est correct

---

## 📊 Tailles Approximatives

- **Frontend**: ~50-100 MB
- **Backend**: ~200-300 MB
- **Total**: ~250-400 MB

Le premier push peut prendre plusieurs minutes selon votre connexion.

---

## 🔐 Sécurité

⚠️ **Important**: Ne partagez jamais votre token d'accès publiquement!

Le token dans ce guide est pour votre usage personnel uniquement.

---

## 📞 Support

En cas de problème:
1. Vérifiez les logs: `docker logs <container_name>`
2. Consultez la documentation Docker Hub
3. Vérifiez l'état de Docker Hub: https://status.docker.com/
