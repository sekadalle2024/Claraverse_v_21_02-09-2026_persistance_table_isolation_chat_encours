# Documentation Déploiement Backend - Clara

## 📋 Vue d'ensemble

Ce dossier contient toute la documentation et les scripts nécessaires pour déployer et gérer le backend Python de Clara sur différentes plateformes cloud.

## 🚀 Options de Déploiement Disponibles

### 1. Render (Recommandé - Plan Hobby) ⭐
- **Coût:** $0/mois (plan Free) ou $7/mois (plan Starter)
- **Avantages:** Facile, CLI puissante, pas de carte bancaire requise
- **Quick Start:** `QUICK_START_RENDER_CLI_HOBBY.txt`
- **Guide complet:** `GUIDE_DEPLOIEMENT_RENDER_CLI_16_AVRIL_2026.md`
- **Astuce:** Éviter cold start avec UptimeRobot (gratuit)

### 2. Railway (Alternative)
- **Coût:** $5 crédit gratuit
- **Avantages:** Simple, pas de cold start
- **Guide:** `00_DEPLOIEMENT_RAILWAY_CLI_16_AVRIL_2026.txt`

### 3. Koyeb (Option initiale)
- **Coût:** Plan gratuit disponible
- **Inconvénient:** Nécessite carte bancaire
- **Méthode:** Intégration Github (déploiement automatique)
- **Guide:** Voir sections ci-dessous

## 🚀 Démarrage rapide

### Configuration actuelle

- **Service**: `back-end-python-v0-03-03-2026`
- **URL**: https://proud-del-saasauditnterne-9f15de46.koyeb.app/
- **Repository**: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
- **Branche**: `main` (auto-deploy activé)
- **Région**: Frankfurt (fra)
- **Instance**: Free (avec sleep mode)

### Workflow de déploiement

```bash
# 1. Développer dans py_backend/
cd py_backend
# Faire vos modifications...

# 2. Synchroniser vers le repository Github
cd ..
.\Doc Koyeb deploy\Scripts\sync-to-github-backend.ps1 -Message "Description" -Push

# 3. Koyeb déploie automatiquement
# Surveiller: https://app.koyeb.com/services/back-end-python-v0-03-03-2026
```

## 📁 Structure du dossier

```
Doc Koyeb deploy/
│
├── 📄 00_COMMENCER_ICI.txt                    ← Démarrage ultra-rapide
├── 📄 00_COMMENCER_ICI_KOYEB.txt              ← Guide détaillé original
├── 📄 00_CONFIGURATION_ACTUELLE_KOYEB.txt     ← Configuration complète
├── 📄 00_REINSTALLATION_CLI_KOYEB_03_AVRIL_2026.txt
├── 📄 00_STATUT_INSTALLATION_KOYEB_CLI_03_AVRIL_2026.txt
├── 📄 README.md                               ← Ce fichier
│
├── 📂 Documentation/                          ← Guides complets
│   ├── GUIDE_DEPLOIEMENT_VIA_GITHUB.md       ⭐ Guide principal
│   ├── README_DEPLOIEMENT_KOYEB.md
│   ├── GUIDE_REINSTALLATION_KOYEB_COMPLET_03_AVRIL_2026.md
│   ├── QUICK_START_KOYEB.txt
│   ├── GUIDE_DEPLOIEMENT_KOYEB.md
│   ├── INDEX_DEPLOIEMENT_KOYEB.md
│   ├── SYNTHESE_DEPLOIEMENT_KOYEB.md
│   ├── COMMANDES_KOYEB.txt
│   ├── INSTALLATION_KOYEB_WINDOWS.md
│   ├── DEPLOIEMENT_KOYEB_DEPUIS_GITHUB.md
│   ├── DEPLOIEMENT_DASHBOARD_KOYEB.md
│   └── ... (autres guides)
│
├── 📂 Scripts/                                ← Scripts automatisés
│   ├── sync-to-github-backend.ps1            🔄 Synchronisation py_backend → Github
│   ├── reinstaller-et-deployer-koyeb.ps1
│   ├── deploy-koyeb.ps1
│   ├── deploy-koyeb.sh
│   ├── check-koyeb-ready.ps1
│   ├── check-koyeb-ready.sh
│   ├── install-koyeb-cli.ps1
│   ├── install-koyeb-cli.sh
│   └── push-backend-github.ps1
│
└── 📂 Backend/                                ← Configuration backend
    ├── README_KOYEB.md
    ├── .env.koyeb.example
    └── Dockerfile
```

## 📚 Documentation essentielle

### À lire en premier

1. **00_COMMENCER_ICI.txt** - Démarrage ultra-rapide (5 minutes)
2. **00_CONFIGURATION_ACTUELLE_KOYEB.txt** - Configuration complète du service
3. **Documentation/GUIDE_DEPLOIEMENT_VIA_GITHUB.md** - Guide principal de déploiement

### Guides complets

- **GUIDE_DEPLOIEMENT_VIA_GITHUB.md** - Déploiement via Github (méthode actuelle)
- **GUIDE_REINSTALLATION_KOYEB_COMPLET_03_AVRIL_2026.md** - Réinstallation CLI
- **INSTALLATION_KOYEB_WINDOWS.md** - Installation sur Windows
- **DEPLOIEMENT_DASHBOARD_KOYEB.md** - Utilisation du dashboard

### Référence

- **COMMANDES_KOYEB.txt** - 100+ commandes Koyeb
- **INDEX_DEPLOIEMENT_KOYEB.md** - Navigation complète
- **Backend/README_KOYEB.md** - Documentation backend

## 🔄 Méthodes de déploiement

### Méthode 1: Synchronisation automatique (Recommandé)

Utiliser le script de synchronisation:

```powershell
# Synchroniser et push automatiquement
.\Doc Koyeb deploy\Scripts\sync-to-github-backend.ps1 -Message "Ajout de nouvelles fonctionnalités" -Push

# Ou synchroniser sans push (pour vérifier avant)
.\Doc Koyeb deploy\Scripts\sync-to-github-backend.ps1 -Message "Work in progress"
```

### Méthode 2: Synchronisation manuelle

```bash
# 1. Copier les fichiers de py_backend/ vers le repository Github
# 2. Dans le repository Github:
cd /path/to/Back-end-python-V0_03_03_2026
git add .
git commit -m "Description des modifications"
git push origin main
```

### Méthode 3: Redéploiement manuel

Via le dashboard Koyeb:
1. Aller sur https://app.koyeb.com
2. Sélectionner le service `back-end-python-v0-03-03-2026`
3. Cliquer sur "Redeploy"

## 🔧 Scripts disponibles

### sync-to-github-backend.ps1
Synchronise py_backend/ vers le repository Github et optionnellement push.

```powershell
# Usage basique
.\Scripts\sync-to-github-backend.ps1

# Avec message personnalisé
.\Scripts\sync-to-github-backend.ps1 -Message "Ajout endpoint /health"

# Avec push automatique
.\Scripts\sync-to-github-backend.ps1 -Message "Fix bug" -Push

# Avec chemin personnalisé
.\Scripts\sync-to-github-backend.ps1 -GithubRepoPath "C:\custom\path"
```

### check-koyeb-ready.ps1
Vérifie que tout est prêt pour le déploiement.

```powershell
.\Scripts\check-koyeb-ready.ps1
```

### install-koyeb-cli.ps1
Installe la CLI Koyeb (optionnel, pour surveillance).

```powershell
.\Scripts\install-koyeb-cli.ps1
```

## 📊 Surveillance

### Via Dashboard Koyeb

URL: https://app.koyeb.com/services/back-end-python-v0-03-03-2026

Onglets:
- **Overview**: Statut, URL, déploiements
- **Metrics**: CPU, mémoire, requêtes
- **Console**: Logs en temps réel
- **Settings**: Configuration

### Via CLI Koyeb (optionnel)

```bash
# Installer la CLI
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
export PATH="$HOME/.koyeb/bin:$PATH"

# Se connecter
koyeb login

# Voir le statut
koyeb service get back-end-python-v0-03-03-2026

# Voir les logs
koyeb service logs back-end-python-v0-03-03-2026 --follow

# Voir les logs de build
koyeb service logs back-end-python-v0-03-03-2026 --type build
```

## ⚙️ Configuration

### Variables d'environnement

Configurées dans Koyeb (région: fra):

```
HOST=0.0.0.0
PORT=5000
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
```

### Scaling

- **Min instances**: 0 (sleep mode)
- **Max instances**: 1
- **Sleep delay**: 3900s (65 minutes)

### Health Check

- **Type**: TCP sur port 5000
- **Grace period**: 5s
- **Interval**: 30s
- **Timeout**: 5s

## 🎯 Parcours recommandés

### 🌱 Débutant - Premier déploiement

1. Lire: `00_COMMENCER_ICI.txt`
2. Lire: `Documentation/GUIDE_DEPLOIEMENT_VIA_GITHUB.md`
3. Configurer le repository Github
4. Utiliser: `Scripts/sync-to-github-backend.ps1`
5. Surveiller le déploiement dans le dashboard

⏱️ Temps: 20 minutes

### 🚀 Intermédiaire - Déploiement régulier

1. Développer dans `py_backend/`
2. Tester localement
3. Synchroniser: `Scripts/sync-to-github-backend.ps1 -Push`
4. Vérifier les logs

⏱️ Temps: 5 minutes

### 🎓 Avancé - Configuration personnalisée

1. Modifier les variables d'environnement dans Koyeb
2. Ajuster le scaling
3. Configurer des branches de développement
4. Mettre en place des webhooks
5. Upgrade vers instance payante

⏱️ Temps: 1 heure

## ⚠️ Points importants

### 1. Instance Free - Sleep Mode

L'instance free s'endort après 65 minutes d'inactivité:
- Premier appel après sleep: ~30-60 secondes
- Appels suivants: latence normale

**Solutions**:
- Accepter le sleep mode (dev/test)
- Upgrade vers instance payante (production)

### 2. Auto-deploy activé

Chaque push sur `main` déclenche un déploiement:
- Utiliser une branche `develop` pour le développement
- Merger vers `main` uniquement quand prêt

### 3. Synchronisation py_backend ↔ Github

Le code local est dans `py_backend/`, mais le repository Github est séparé:
- Utiliser le script `sync-to-github-backend.ps1`
- Ou copier manuellement les fichiers

### 4. Structure du repository Github

Le repository Github doit contenir:
- `Dockerfile` à la racine
- `requirements.txt`
- `main.py`
- Tous les fichiers du backend

## 🔗 Liens utiles

- **Dashboard Koyeb**: https://app.koyeb.com
- **Service**: https://app.koyeb.com/services/back-end-python-v0-03-03-2026
- **API URL**: https://proud-del-saasauditnterne-9f15de46.koyeb.app/
- **Repository Github**: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
- **Documentation Koyeb**: https://www.koyeb.com/docs

## 🆘 Troubleshooting

### Le déploiement échoue

1. Vérifier les logs de build dans le dashboard
2. Vérifier que le Dockerfile est correct
3. Vérifier requirements.txt
4. Tester le build Docker localement

### L'instance ne démarre pas

1. Vérifier les logs d'application
2. Vérifier que l'app écoute sur 0.0.0.0:5000
3. Vérifier les variables d'environnement

### Erreur de synchronisation

1. Vérifier que le repository Github existe
2. Vérifier les permissions Git
3. Vérifier le chemin du repository

## 💰 Coûts

### Instance Free (actuelle)
- **Prix**: Gratuit
- **Limitations**: Sleep mode, 1 instance max

### Upgrade
- **Nano**: ~$5/mois (pas de sleep)
- **Small**: ~$10/mois
- **Medium**: ~$20/mois

## 📞 Support

En cas de problème:
1. Consulter les logs dans le dashboard
2. Lire la documentation dans `Documentation/`
3. Vérifier la configuration dans `00_CONFIGURATION_ACTUELLE_KOYEB.txt`
4. Contacter le support Koyeb si nécessaire

---

**Dernière mise à jour**: 3 Avril 2026
**Version**: 1.0
**Statut**: ✅ Documentation complète et à jour
