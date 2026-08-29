# 📝 Étapes de Déploiement Manuel - Koyeb

## ⚠️ Koyeb CLI Non Installé

La CLI Koyeb n'est pas encore installée sur votre système. Voici les étapes pour installer et déployer.

## 🎯 Processus Complet

### Étape 1 : Installer Koyeb CLI

#### Via Git Bash (Recommandé pour Windows)

1. **Ouvrir Git Bash** (si installé)
2. **Exécuter la commande d'installation :**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
   ```
3. **Ajouter au PATH :**
   ```bash
   export PATH=$HOME/.koyeb/bin:$PATH
   ```
4. **Vérifier :**
   ```bash
   koyeb version
   ```

#### Alternative : Via le Dashboard Koyeb (Sans CLI)

Vous pouvez aussi déployer directement depuis le dashboard web :

1. **Aller sur** : https://app.koyeb.com
2. **Créer un compte** ou se connecter
3. **Cliquer sur** "Create Service"
4. **Choisir** "Docker" comme source
5. **Uploader** le dossier `py_backend` ou connecter GitHub

### Étape 2 : Se Connecter (Si CLI installée)

```bash
koyeb login
```

Cela ouvrira votre navigateur pour l'authentification.

### Étape 3 : Vérifier que Tout est Prêt

```powershell
# Windows PowerShell
.\check-koyeb-ready.ps1
```

Ou manuellement :
- ✅ Vérifier que `py_backend/` existe
- ✅ Vérifier que `py_backend/Dockerfile` existe
- ✅ Vérifier que `py_backend/requirements.txt` existe
- ✅ Vérifier que `py_backend/main.py` existe

### Étape 4 : Déployer

#### Option A : Avec le Script (Si CLI installée)

```powershell
.\deploy-koyeb.ps1 dev
```

#### Option B : Commande Manuelle (Si CLI installée)

```bash
cd py_backend
koyeb deploy . clara-backend/clara-service \
  --archive-builder docker \
  --archive-docker-dockerfile Dockerfile \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions fra \
  --instance-type nano \
  --min-scale 1 \
  --max-scale 1
```

#### Option C : Via le Dashboard Web (Sans CLI)

1. **Aller sur** : https://app.koyeb.com
2. **Cliquer sur** "Create Service"
3. **Sélectionner** "Docker"
4. **Configuration :**
   - Name: `clara-service`
   - App: `clara-backend`
   - Builder: Docker
   - Dockerfile path: `Dockerfile`
   - Port: `5000`
   - Instance: `nano` (gratuit)
   - Region: `Frankfurt`

5. **Variables d'environnement :**
   ```
   HOST=0.0.0.0
   PORT=5000
   PYTHONUNBUFFERED=1
   ```

6. **Cliquer sur** "Deploy"

### Étape 5 : Vérifier le Déploiement

#### Via CLI :
```bash
koyeb service get clara-backend/clara-service
koyeb service logs clara-backend/clara-service
```

#### Via Dashboard :
- Aller sur https://app.koyeb.com
- Voir le statut du service
- Consulter les logs

#### Tester l'API :
```bash
curl https://clara-backend-[your-org].koyeb.app/health
```

Ou ouvrir dans le navigateur :
```
https://clara-backend-[your-org].koyeb.app/docs
```

## 🔄 Déploiement Alternatif : Via GitHub

Si vous préférez déployer depuis GitHub :

1. **Pusher le code sur GitHub**
2. **Sur Koyeb Dashboard** :
   - Cliquer "Create Service"
   - Choisir "GitHub"
   - Sélectionner votre repository
   - Branch: `main`
   - Working directory: `py_backend`
   - Builder: Docker
   - Dockerfile: `Dockerfile`

3. **Activer le déploiement automatique**

## 📊 Résumé des Options

| Méthode | Prérequis | Difficulté | Temps |
|---------|-----------|------------|-------|
| CLI + Script | Koyeb CLI, Git Bash | Facile | 5 min |
| CLI Manuel | Koyeb CLI | Moyen | 10 min |
| Dashboard Web | Compte Koyeb | Très facile | 10 min |
| GitHub | GitHub, Compte Koyeb | Facile | 15 min |

## 💡 Recommandation

**Pour Windows sans Git Bash :**
→ Utilisez le **Dashboard Web** (Option C)

**Pour Windows avec Git Bash :**
→ Installez la CLI et utilisez les **scripts automatiques**

**Pour déploiement continu :**
→ Utilisez **GitHub** avec déploiement automatique

## 🆘 Besoin d'Aide ?

- **Installation CLI** : Voir `INSTALLATION_KOYEB_WINDOWS.md`
- **Guide complet** : Voir `GUIDE_DEPLOIEMENT_KOYEB.md`
- **Commandes** : Voir `COMMANDES_KOYEB.txt`
- **Support Koyeb** : https://www.koyeb.com/support

## 🎯 Prochaine Étape

Choisissez votre méthode de déploiement :

1. **Installer la CLI** → Voir `INSTALLATION_KOYEB_WINDOWS.md`
2. **Utiliser le Dashboard** → Aller sur https://app.koyeb.com
3. **Déployer via GitHub** → Pusher le code et connecter le repo

---

**Note** : Le déploiement via le dashboard web est la méthode la plus simple si vous n'avez pas Git Bash ou WSL installé.
