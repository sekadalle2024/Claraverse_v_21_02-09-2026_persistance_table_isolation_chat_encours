# Guide de Déploiement Backend Python sur Koyeb

## 📋 Prérequis

1. **Compte Koyeb** : Créer un compte sur [koyeb.com](https://www.koyeb.com)
2. **Koyeb CLI installé** : Suivre les instructions ci-dessous
3. **Token API Koyeb** : Obtenir depuis le dashboard Koyeb

## 🔧 Installation de Koyeb CLI

### Windows (via Shell/Bash)

```bash
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
```

Ajouter au PATH dans `.bashrc` ou `.zshrc` :
```bash
export PATH=$HOME/.koyeb/bin:$PATH
```

### Via Docker (Alternative)

```bash
docker pull koyeb/koyeb-cli:latest
```

## 🔑 Configuration de l'authentification

```bash
# Se connecter à Koyeb
koyeb login

# Ou utiliser un token API directement
export KOYEB_TOKEN=your_api_token_here
```

## 📦 Structure du Backend

Le backend Python (`py_backend/`) contient :
- `main.py` : Point d'entrée FastAPI
- `Dockerfile` : Configuration Docker
- `requirements.txt` : Dépendances Python
- Modules : pandas_api, pandas_agent, gdrive_proxy, word_export, etc.

## 🚀 Méthode 1 : Déploiement Direct depuis le Répertoire

### Commande de base

```bash
cd py_backend
koyeb deploy . clara-backend/clara-service \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions fra \
  --instance-type nano \
  --min-scale 1 \
  --max-scale 1
```

### Avec variables d'environnement

```bash
koyeb deploy . clara-backend/clara-service \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions fra \
  --instance-type nano \
  --min-scale 1 \
  --max-scale 1 \
  --env HOST=0.0.0.0 \
  --env PORT=5000 \
  --env PYTHONUNBUFFERED=1
```

## 🐳 Méthode 2 : Déploiement avec Dockerfile

Le projet contient déjà un `Dockerfile` optimisé. Pour l'utiliser :

```bash
cd py_backend
koyeb deploy . clara-backend/clara-service \
  --archive-builder docker \
  --archive-docker-dockerfile Dockerfile \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions fra \
  --instance-type small \
  --min-scale 1 \
  --max-scale 2
```

## ⚙️ Options de Configuration

### Types d'instances disponibles
- `nano` : 0.1 vCPU, 512 MB RAM (gratuit)
- `micro` : 0.25 vCPU, 1 GB RAM
- `small` : 0.5 vCPU, 2 GB RAM
- `medium` : 1 vCPU, 4 GB RAM
- `large` : 2 vCPU, 8 GB RAM

### Régions disponibles
- `fra` : Frankfurt (Europe)
- `was` : Washington DC (US East)
- `sin` : Singapore (Asia)

### Variables d'environnement importantes

```bash
--env HOST=0.0.0.0 \
--env PORT=5000 \
--env PYTHONUNBUFFERED=1 \
--env PYTHONDONTWRITEBYTECODE=1 \
--env OPENAI_API_KEY=your_key \
--env NEO4J_URI=neo4j://localhost:7687 \
--env NEO4J_USERNAME=neo4j \
--env NEO4J_PASSWORD=password
```

## 📊 Commandes de Gestion

### Vérifier le statut du service

```bash
koyeb service get clara-backend/clara-service
```

### Voir les logs

```bash
# Logs de déploiement
koyeb service logs clara-backend/clara-service

# Logs de build
koyeb service logs clara-backend/clara-service --type build
```

### Mettre à jour le service

```bash
cd py_backend
koyeb deploy . clara-backend/clara-service
```

### Lister les services

```bash
koyeb service list
```

### Supprimer le service

```bash
koyeb service delete clara-backend/clara-service
```

## 🔍 Vérification du Déploiement

Une fois déployé, tester les endpoints :

```bash
# Health check
curl https://your-app.koyeb.app/health

# Root endpoint
curl https://your-app.koyeb.app/

# API docs (FastAPI)
# Ouvrir dans le navigateur : https://your-app.koyeb.app/docs
```

## 🛠️ Dépannage

### Problème : Build échoue

**Solution** : Vérifier les logs de build
```bash
koyeb service logs clara-backend/clara-service --type build
```

### Problème : Service ne démarre pas

**Solution** : Vérifier que le port est correct
```bash
# Le Dockerfile expose le port 5000
# Assurez-vous que --ports 5000:http est défini
```

### Problème : Dépendances manquantes

**Solution** : Vérifier `requirements.txt` et le Dockerfile
```bash
# Le Dockerfile installe déjà les dépendances
# Vérifier que requirements.txt est à jour
```

### Problème : Timeout lors du déploiement

**Solution** : Augmenter la taille de l'instance
```bash
# Utiliser --instance-type small ou medium
```

## 📝 Exemple Complet de Déploiement

```bash
# 1. Se positionner dans le dossier backend
cd py_backend

# 2. Déployer avec toutes les options
koyeb deploy . clara-backend/clara-service \
  --archive-builder docker \
  --archive-docker-dockerfile Dockerfile \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions fra \
  --instance-type small \
  --min-scale 1 \
  --max-scale 2 \
  --env HOST=0.0.0.0 \
  --env PORT=5000 \
  --env PYTHONUNBUFFERED=1 \
  --env PYTHONDONTWRITEBYTECODE=1

# 3. Vérifier le statut
koyeb service get clara-backend/clara-service

# 4. Voir les logs
koyeb service logs clara-backend/clara-service

# 5. Tester l'API
curl https://clara-backend-your-org.koyeb.app/health
```

## 🔗 Ressources

- [Documentation Koyeb CLI](https://www.koyeb.com/docs/build-and-deploy/cli/reference)
- [Guide de déploiement](https://www.koyeb.com/docs/build-and-deploy/deploy-with-git)
- [Dashboard Koyeb](https://app.koyeb.com)

## ✅ Checklist de Déploiement

- [ ] Koyeb CLI installé et configuré
- [ ] Token API configuré
- [ ] Variables d'environnement définies
- [ ] Dockerfile vérifié
- [ ] requirements.txt à jour
- [ ] Commande de déploiement testée
- [ ] Service déployé avec succès
- [ ] Health check fonctionnel
- [ ] Logs vérifiés
- [ ] API accessible publiquement
