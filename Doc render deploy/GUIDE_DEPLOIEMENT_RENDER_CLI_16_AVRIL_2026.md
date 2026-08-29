# 🚀 Guide Déploiement Render CLI - Plan Hobby
**Date:** 16 avril 2026  
**Backend:** Python FastAPI (Sans Docker)

---

## 📋 Plan Hobby Render - Récapitulatif

Le plan **Hobby** de Render est **GRATUIT** ($0/mois) mais vous payez uniquement pour les ressources que vous utilisez :

### 💰 Tarification Compute
- **Web Services:** ~$7/mois pour une instance toujours active
- **Pas de cold start** (contrairement au plan Free)
- **750 heures gratuites/mois** pour les services statiques
- **Idéal pour:** Projets personnels, prototypes, petites applications

### ✅ Avantages
- Déploiement automatique depuis GitHub
- SSL gratuit (HTTPS)
- Domaines personnalisés
- CDN global
- Support email
- Pas de carte bancaire requise pour commencer

---

## 🛠️ Étape 1 : Installation de Render CLI

### Windows (PowerShell)
```powershell
# Installer via npm (Node.js requis)
npm install -g render-cli

# Vérifier l'installation
render --version
```

### Alternative : Téléchargement direct
Si vous n'avez pas Node.js :
```powershell
# Télécharger depuis https://render.com/docs/cli
# Puis ajouter au PATH
```

---

## 🔑 Étape 2 : Authentification

```powershell
# Se connecter à Render
render login

# Cela ouvrira votre navigateur pour l'authentification
# Suivez les instructions à l'écran
```

---

## 📁 Étape 3 : Préparation du Projet

### 3.1 Créer `render.yaml` à la racine du projet

```powershell
# Créer le fichier de configuration
New-Item -Path "render.yaml" -ItemType File
```

Contenu de `render.yaml` :

```yaml
services:
  - type: web
    name: clara-backend-hobby
    env: python
    region: frankfurt
    plan: starter
    buildCommand: pip install -r py_backend/requirements.txt
    startCommand: python py_backend/main.py --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHONUNBUFFERED
        value: 1
      - key: PYTHONDONTWRITEBYTECODE
        value: 1
      - key: HOST
        value: 0.0.0.0
      - key: PORT
        value: 10000
```

### 3.2 Vérifier `requirements.txt`

Assurez-vous que `py_backend/requirements.txt` contient les dépendances essentielles :

```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12
PyPDF2==3.0.1
python-docx>=1.1.0
pydantic==2.9.0
python-dotenv==1.0.1
pandas>=2.0.0
numpy>=1.24.0
openpyxl>=3.1.0
xlrd>=2.0.1
beautifulsoup4>=4.12.0
```

**Note:** Les dépendances optionnelles (LightRAG, Speech2Text, etc.) sont commentées pour réduire la taille du build.

---

## 🚀 Étape 4 : Déploiement via CLI

### 4.1 Initialiser le service

```powershell
# Se placer à la racine du projet
cd C:\Users\[VotreNom]\Back-end-python-V0_03_03_2026

# Créer le service sur Render
render services create
```

Vous serez invité à choisir :
- **Type:** Web Service
- **Nom:** clara-backend-hobby
- **Région:** Frankfurt (Europe)
- **Plan:** Starter ($7/mois)
- **Repository:** Connectez votre repo GitHub

### 4.2 Déployer

```powershell
# Déployer le service
render deploy

# Suivre les logs en temps réel
render logs --tail
```

---

## 🔧 Étape 5 : Configuration des Variables d'Environnement

### Via CLI

```powershell
# Ajouter des variables d'environnement
render env set PYTHONUNBUFFERED=1
render env set PYTHONDONTWRITEBYTECODE=1
render env set HOST=0.0.0.0
render env set PORT=10000

# Lister les variables
render env list
```

### Via Interface Web (Recommandé)

1. Allez sur **render.com/dashboard**
2. Sélectionnez votre service **clara-backend-hobby**
3. Onglet **Environment**
4. Ajoutez les variables :
   - `PYTHONUNBUFFERED` = `1`
   - `PYTHONDONTWRITEBYTECODE` = `1`
   - `HOST` = `0.0.0.0`
   - `PORT` = `10000`

---

## 📊 Étape 6 : Vérification du Déploiement

### 6.1 Vérifier le statut

```powershell
# Voir le statut du service
render services list

# Voir les détails
render services get clara-backend-hobby
```

### 6.2 Tester l'API

```powershell
# Obtenir l'URL du service
$RENDER_URL = render services get clara-backend-hobby --format json | ConvertFrom-Json | Select-Object -ExpandProperty url

# Tester l'endpoint de santé
curl "$RENDER_URL/health"

# Tester l'API
curl "$RENDER_URL/api/health"
```

### 6.3 Voir les logs

```powershell
# Logs en temps réel
render logs --tail

# Logs des 100 dernières lignes
render logs --num 100
```

---

## 🔄 Étape 7 : Déploiements Futurs

### Déploiement automatique (Recommandé)

Render redéploie automatiquement à chaque push sur la branche `main` de GitHub.

```powershell
# Faire vos modifications
git add .
git commit -m "Update backend"
git push origin main

# Render détecte le push et redéploie automatiquement
```

### Déploiement manuel via CLI

```powershell
# Forcer un redéploiement
render deploy --service clara-backend-hobby

# Suivre les logs
render logs --tail
```

---

## 🛑 Étape 8 : Gestion du Service

### Suspendre le service (économiser de l'argent)

```powershell
# Suspendre le service
render services suspend clara-backend-hobby
```

### Reprendre le service

```powershell
# Reprendre le service
render services resume clara-backend-hobby
```

### Supprimer le service

```powershell
# Supprimer définitivement
render services delete clara-backend-hobby
```

---

## 💡 Astuces et Optimisations

### 1. Réduire les Coûts

Si vous voulez éviter les $7/mois du plan Starter :
- Utilisez le **plan Free** (avec cold start après 15 min d'inactivité)
- Configurez **UptimeRobot** (gratuit) pour ping toutes les 5 minutes

### 2. Optimiser le Build

Ajoutez un fichier `.renderignore` pour exclure les fichiers inutiles :

```
.git
.hypothesis
node_modules
*.md
*.txt
Doc*
deploiement-netlify
```

### 3. Monitoring

```powershell
# Voir les métriques
render metrics --service clara-backend-hobby

# Voir les événements
render events --service clara-backend-hobby
```

---

## 🐛 Dépannage

### Problème : Build échoue

```powershell
# Voir les logs de build
render logs --build

# Vérifier les dépendances
cat py_backend/requirements.txt
```

### Problème : Service ne démarre pas

```powershell
# Vérifier les logs de démarrage
render logs --tail --num 200

# Vérifier la commande de démarrage
render services get clara-backend-hobby
```

### Problème : Port incorrect

Render utilise la variable `$PORT` automatiquement. Assurez-vous que `main.py` utilise :

```python
PORT = int(os.getenv('PORT', 5000))
```

---

## 📞 Support

- **Documentation Render CLI:** https://render.com/docs/cli
- **Support Render:** support@render.com
- **Community Forum:** https://community.render.com

---

## ✅ Checklist Finale

- [ ] Render CLI installé et authentifié
- [ ] `render.yaml` créé à la racine
- [ ] `requirements.txt` vérifié
- [ ] Service créé sur Render
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] API testée et fonctionnelle
- [ ] Déploiement automatique configuré (GitHub)

---

**Prêt à déployer !** 🎉
