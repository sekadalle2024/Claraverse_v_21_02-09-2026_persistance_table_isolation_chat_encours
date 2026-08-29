# ⚡ Démarrage Rapide - Déploiement Koyeb

## 🚀 En 5 Minutes

### 1️⃣ Installer Koyeb CLI (1 min)

**Windows (Git Bash/WSL)**
```bash
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
export PATH=$HOME/.koyeb/bin:$PATH
```

**Vérifier l'installation**
```bash
koyeb version
```

### 2️⃣ Se Connecter (1 min)

```bash
koyeb login
```

Suivre les instructions dans le navigateur.

### 3️⃣ Déployer (3 min)

**Option A : Script Automatique (Recommandé)**

Windows PowerShell :
```powershell
.\deploy-koyeb.ps1 dev
```

Linux/Mac Bash :
```bash
chmod +x deploy-koyeb.sh
./deploy-koyeb.sh dev
```

**Option B : Commande Manuelle**

```bash
cd py_backend
koyeb deploy . clara-backend/clara-service \
  --archive-builder docker \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions fra \
  --instance-type nano
```

### 4️⃣ Vérifier

```bash
# Voir le statut
koyeb service get clara-backend/clara-service

# Voir les logs
koyeb service logs clara-backend/clara-service

# Tester l'API
curl https://clara-backend-[your-org].koyeb.app/health
```

## ✅ C'est Tout !

Votre backend Python est maintenant déployé sur Koyeb !

### 🌐 Accéder à l'API

- **API Root** : `https://clara-backend-[your-org].koyeb.app/`
- **Health Check** : `https://clara-backend-[your-org].koyeb.app/health`
- **Documentation** : `https://clara-backend-[your-org].koyeb.app/docs`

### 📚 Documentation Complète

- [Guide Complet](./GUIDE_DEPLOIEMENT_KOYEB.md)
- [README Backend](./py_backend/README_KOYEB.md)
- [Commandes Koyeb](./COMMANDES_KOYEB.txt)
- [Synthèse](./SYNTHESE_DEPLOIEMENT_KOYEB.md)

### 🆘 Problème ?

```bash
# Voir les logs de build
koyeb service logs clara-backend/clara-service --type build

# Redémarrer le service
koyeb service redeploy clara-backend/clara-service
```

### 💰 Coût

Instance **nano** = **GRATUIT** ✨

---

**Temps total : ~5 minutes** ⏱️
