# Guide de Déploiement sur Render.com - VERSION CORRIGÉE

**Date:** 16 Avril 2026  
**Contexte:** Alternative à Railway (qui refuse les cartes prépayées)  
**Statut:** ✅ Solution testée et validée

---

## 🎯 Pourquoi Render.com ?

✅ **Accepte les cartes prépayées**  
✅ **Plan gratuit généreux** (750 heures/mois)  
✅ **Déploiement automatique** via GitHub  
✅ **Pas de compilation Rust nécessaire**  
✅ **Interface simple et intuitive**  
✅ **Pas de configuration CLI complexe**

---

## 📋 Prérequis

- Compte GitHub avec le repo: `Back-end-python-V0_03_03_2026`
- Navigateur web
- 15 minutes de temps

---

## 🚀 ÉTAPE 1: Pousser le fichier requirements_render.txt sur GitHub

**IMPORTANT:** Le fichier `requirements_render.txt` doit être dans le repo GitHub avant de configurer Render.

### Commandes PowerShell:

```powershell
# Se positionner dans le dossier py_backend
cd py_backend

# Vérifier que requirements_render.txt existe
ls requirements_render.txt

# Ajouter le fichier
git add requirements_render.txt

# Commit
git commit -m "Add requirements_render.txt for Render deployment"

# Push vers GitHub
git push origin main
```

**Vérification:**
- Aller sur: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
- Vérifier que `requirements_render.txt` est visible dans le dossier racine du repo

⏱️ Temps: 3 minutes

---

## 🚀 ÉTAPE 2: Créer un compte Render

1. Aller sur: https://render.com
2. Cliquer sur **"Get Started"**
3. Choisir **"Sign up with GitHub"**
4. Autoriser Render à accéder à vos repos

⏱️ Temps: 2 minutes

---

## 🚀 ÉTAPE 3: Créer un nouveau Web Service

1. Dans le dashboard Render, cliquer sur **"New +"**
2. Sélectionner **"Web Service"**
3. Connecter votre repository GitHub:
   - Chercher: `Back-end-python-V0_03_03_2026`
   - Cliquer sur **"Connect"**

⏱️ Temps: 1 minute

---

## 🚀 ÉTAPE 4: Configurer le service (CONFIGURATION CRITIQUE)

### ⚠️ Configuration de base:

| Paramètre | Valeur | ⚠️ Important |
|-----------|--------|--------------|
| **Name** | `clara-backend-production` | |
| **Region** | `Frankfurt (EU Central)` | |
| **Branch** | `main` | |
| **Root Directory** | **LAISSER VIDE** | ⚠️ NE PAS mettre `py_backend` |
| **Runtime** | `Python 3` | Sélectionner manuellement |
| **Build Command** | `pip install -r requirements_render.txt` | ⚠️ Exactement cette commande |
| **Start Command** | `python main.py --host 0.0.0.0 --port $PORT` | ⚠️ Exactement cette commande |

### 🔴 ERREURS À ÉVITER:

❌ **NE PAS** mettre `py_backend` dans Root Directory  
❌ **NE PAS** utiliser `requirements.txt` (utiliser `requirements_render.txt`)  
❌ **NE PAS** laisser Build Command vide  
❌ **NE PAS** laisser Start Command vide

### ✅ POURQUOI CES VALEURS:

- **Root Directory vide:** Le repo GitHub contient déjà tout à la racine
- **requirements_render.txt:** Utilise pydantic 2.8.2 (pas de compilation Rust)
- **Build Command:** Installe les dépendances Python
- **Start Command:** Lance le serveur FastAPI

#### Plan:

- Sélectionner: **Free** (0$/mois)

⏱️ Temps: 3 minutes

---

## 🚀 ÉTAPE 5: Variables d'environnement

Cliquer sur **"Advanced"** puis ajouter:

```
HOST=0.0.0.0
PORT=5000
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
```

**Comment ajouter:**
1. Cliquer sur **"Add Environment Variable"**
2. Entrer le nom (ex: `HOST`)
3. Entrer la valeur (ex: `0.0.0.0`)
4. Répéter pour chaque variable

⏱️ Temps: 2 minutes

---

## 🚀 ÉTAPE 6: Créer le service

1. Vérifier tous les paramètres (surtout Root Directory = VIDE)
2. Cliquer sur **"Create Web Service"**
3. Attendre le déploiement (5-10 minutes)

**Vous verrez:**
- Logs de build en temps réel
- Installation de Python 3.14.3
- Installation des dépendances depuis `requirements_render.txt`
- Démarrage du serveur
- URL générée automatiquement

⏱️ Temps: 5-10 minutes

---

## 🔗 Récupérer l'URL du service

Une fois le déploiement terminé:

1. En haut de la page, vous verrez l'URL:
   ```
   https://clara-backend-production.onrender.com
   ```

2. Tester l'endpoint de santé:
   ```
   https://clara-backend-production.onrender.com/health
   ```

---

## ⚙️ Configuration du Frontend

Mettre à jour `src/services/claraApiService.ts`:

```typescript
// Remplacer
const API_BASE_URL = 'https://hkj0631c.rpcl.app';

// Par
const API_BASE_URL = 'https://clara-backend-production.onrender.com';
```

**Commande PowerShell:**
```powershell
$file = "src/services/claraApiService.ts"
$oldUrl = "hkj0631c.rpcl.app"
$newUrl = "clara-backend-production.onrender.com"
(Get-Content $file) -replace $oldUrl, $newUrl | Set-Content $file
```

---

## ⚠️ Limitations du Plan Gratuit

### Cold Start (15 minutes d'inactivité)

Le service s'endort après 15 minutes sans requête.

**Impact:**
- Première requête après inactivité: 30-60 secondes
- Requêtes suivantes: instantanées

**Solutions:**

1. **Ping automatique** (recommandé):
   - Utiliser un service comme UptimeRobot
   - Ping toutes les 10 minutes
   - Gratuit: https://uptimerobot.com

2. **Accepter le cold start**:
   - Informer les utilisateurs
   - Afficher un message de chargement

### Ressources

- **RAM:** 512 MB (suffisant pour votre backend)
- **CPU:** Partagé
- **Bande passante:** 100 GB/mois
- **Heures:** 750h/mois (suffisant pour 24/7)

---

## 🔄 Déploiement Automatique

Render redéploie automatiquement à chaque push sur `main`:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render détecte le push et redéploie (5-10 minutes).

---

## 📊 Monitoring

### Logs en temps réel

1. Dashboard Render
2. Sélectionner votre service
3. Onglet **"Logs"**

### Métriques

1. Onglet **"Metrics"**
2. Voir:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🛠️ Commandes Utiles

### Redéployer manuellement

1. Dashboard Render
2. Sélectionner votre service
3. Cliquer sur **"Manual Deploy"** → **"Deploy latest commit"**

### Voir les variables d'environnement

1. Onglet **"Environment"**
2. Voir/Modifier les variables

### Suspendre le service

1. Settings
2. **"Suspend Service"**
3. Confirmer

---

## 🐛 Dépannage

### Erreur: "Root directory 'py_backend' does not exist"

**Cause:** Root Directory configuré à `py_backend` au lieu de vide

**Solution:**
1. Settings → Build & Deploy
2. Root Directory: **LAISSER VIDE**
3. Sauvegarder
4. Manual Deploy → Deploy latest commit

### Erreur: "Could not open requirements file"

**Cause:** Le fichier `requirements_render.txt` n'existe pas dans le repo GitHub

**Solution:**
1. Vérifier que le fichier existe localement dans `py_backend/`
2. Push vers GitHub:
   ```powershell
   cd py_backend
   git add requirements_render.txt
   git commit -m "Add requirements_render.txt"
   git push origin main
   ```
3. Render redéploiera automatiquement

### Erreur: "Exited with status 1 while building"

**Cause:** Problème de compilation (pydantic-core nécessite Rust)

**Solution:**
- Vérifier que `requirements_render.txt` utilise:
  - `pydantic==2.8.2`
  - `pydantic-core==2.20.1`
- Ces versions ont des wheels pré-compilés (pas de Rust nécessaire)

### Le service ne démarre pas

**Vérifier:**
1. Logs de build (erreurs de dépendances?)
2. Build Command correct: `pip install -r requirements_render.txt`
3. Start Command correct: `python main.py --host 0.0.0.0 --port $PORT`
4. Variables d'environnement définies

### Erreur 502 Bad Gateway

**Causes:**
- Service en cours de démarrage (attendre 1-2 min)
- Cold start (première requête après inactivité)
- Erreur dans le code backend

**Solution:**
- Vérifier les logs
- Tester l'endpoint `/health`

### Timeout

**Render timeout:** 30 secondes par défaut

**Solution:**
- Optimiser les requêtes longues
- Utiliser des tâches asynchrones

---

## 💰 Upgrade vers un plan payant (optionnel)

Si vous avez besoin de plus de ressources:

### Starter Plan ($7/mois)

✅ Pas de cold start  
✅ 512 MB RAM  
✅ Domaine personnalisé  
✅ Support prioritaire

### Standard Plan ($25/mois)

✅ 2 GB RAM  
✅ Scaling automatique  
✅ Meilleure performance

---

## 📝 Checklist Finale

- [ ] Fichier `requirements_render.txt` créé dans `py_backend/`
- [ ] Fichier poussé sur GitHub
- [ ] Service créé sur Render
- [ ] Root Directory = **VIDE** (pas `py_backend`)
- [ ] Build Command = `pip install -r requirements_render.txt`
- [ ] Start Command = `python main.py --host 0.0.0.0 --port $PORT`
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] URL récupérée
- [ ] Frontend mis à jour avec la nouvelle URL
- [ ] Test de l'endpoint `/health`
- [ ] (Optionnel) UptimeRobot configuré pour éviter cold start

---

## 🎉 Félicitations !

Votre backend Clara est maintenant déployé sur Render.com !

**URL de production:**
```
https://clara-backend-production.onrender.com
```

**Prochaines étapes:**
1. Tester toutes les fonctionnalités
2. Configurer UptimeRobot (optionnel)
3. Mettre à jour la documentation

---

## 📚 Ressources

- Documentation Render: https://render.com/docs
- Support: https://render.com/support
- Status: https://status.render.com
- Community: https://community.render.com

---

**Créé le:** 16 Avril 2026  
**Auteur:** Clara Team  
**Version:** 2.0.0 (Corrigée)
