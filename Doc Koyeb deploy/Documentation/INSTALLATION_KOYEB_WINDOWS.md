# 🔧 Installation Koyeb CLI sur Windows

## ⚠️ Koyeb CLI n'est pas encore installé

Pour déployer sur Koyeb, vous devez d'abord installer la CLI.

## 📋 Options d'Installation

### Option 1 : Via Git Bash / WSL (Recommandé)

Si vous avez Git Bash ou WSL installé :

```bash
# Ouvrir Git Bash ou WSL
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh

# Ajouter au PATH
export PATH=$HOME/.koyeb/bin:$PATH

# Vérifier l'installation
koyeb version
```

### Option 2 : Téléchargement Manuel

1. Aller sur : https://github.com/koyeb/koyeb-cli/releases
2. Télécharger la dernière version pour Windows (koyeb-windows-amd64.exe)
3. Renommer en `koyeb.exe`
4. Placer dans un dossier (ex: `C:\koyeb\`)
5. Ajouter le dossier au PATH Windows

### Option 3 : Via Docker

```powershell
docker pull koyeb/koyeb-cli:latest

# Utiliser avec :
docker run -it koyeb/koyeb-cli:latest koyeb version
```

## 🔐 Après l'Installation

### 1. Se Connecter

```bash
koyeb login
```

Cela ouvrira votre navigateur pour vous authentifier.

### 2. Vérifier la Connexion

```bash
koyeb service list
```

### 3. Déployer

Une fois connecté, vous pouvez utiliser les scripts :

```powershell
# Vérifier que tout est prêt
.\check-koyeb-ready.ps1

# Déployer
.\deploy-koyeb.ps1 dev
```

## 📚 Documentation

Pour plus d'informations :
- [Documentation Koyeb CLI](https://www.koyeb.com/docs/build-and-deploy/cli/installation)
- [Guide de déploiement](./GUIDE_DEPLOIEMENT_KOYEB.md)

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :
1. Vérifiez que Git Bash ou WSL est installé
2. Consultez la documentation officielle Koyeb
3. Utilisez l'option Docker comme alternative

---

**Note** : L'installation de Koyeb CLI nécessite un environnement Unix-like (Git Bash, WSL) ou Docker sur Windows.
