# 🚀 Démarrage Rapide Docker - E-audit

Guide ultra-rapide pour lancer E-audit avec Docker sur WSL2

## ⚡ En 3 Commandes

```bash
# 1. Rendre les scripts exécutables
chmod +x build-docker.sh start-docker.sh stop-docker.sh

# 2. Builder les images
./build-docker.sh

# 3. Démarrer l'application
./start-docker.sh
```

**C'est tout!** 🎉

## 🌐 Accès

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📋 Commandes Essentielles

```bash
# Voir les logs
docker compose logs -f

# Arrêter
docker compose down

# Redémarrer
docker compose restart

# État des conteneurs
docker compose ps
```

## ⚠️ Problèmes Courants

### Port 3000 déjà utilisé (Flowise)

Modifiez `docker-compose.yml` :
```yaml
frontend:
  ports:
    - "8080:80"  # Changez 3000 en 8080
```

Puis accédez à http://localhost:8080

### Docker ne démarre pas

```bash
sudo service docker start
docker info
```

### Rebuild complet

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 📚 Documentation Complète

Voir `README-DOCKER.md` pour plus de détails.

---

**Prêt en 3 commandes!** 🚀
