# Déploiement sur Render via Interface Web
**Date:** 16 Avril 2026  
**Méthode:** Interface Web (SANS Docker, SANS CLI)  
**Plateforme:** Render.com

---

## 🎯 Ce que nous allons faire

Déployer votre backend Python FastAPI sur Render en utilisant uniquement l'interface web.  
**Aucune installation requise** sur votre machine !

---

## 📋 Étape 1: Créer un Compte Render

### 1.1 Aller sur Render.com

Ouvrez votre navigateur et allez sur : **https://render.com**

### 1.2 S'inscrire

Cliquez sur **"Get Started"** ou **"Sign Up"**

**Choisissez une méthode d'inscription :**
- ✅ **Avec GitHub** (RECOMMANDÉ - plus rapide)
- ✅ Avec Google
- ✅ Avec Email

**Si vous choisissez GitHub :**
1. Cliquez sur "Sign up with GitHub"
2. Autorisez Render à accéder à votre compte GitHub
3. Sélectionnez les repositories auxquels Render peut accéder

**Si vous choisissez Email :**
1. Entrez votre email : `ohada.save12@gmail.com`
2. Créez un mot de passe
3. Confirmez votre email

---

## 📋 Étape 2: Connecter votre Repository GitHub

### 2.1 Depuis le Dashboard Render

Une fois connecté, vous verrez le dashboard Render.

### 2.2 Créer un nouveau Web Service

1. Cliquez sur le bouton **"New +"** (en haut à droite)
2. Sélectionnez **"Web Service"**

### 2.3 Connecter GitHub

**Si vous n'avez pas encore connecté GitHub :**
1. Cliquez sur **"Connect GitHub"**
2. Autorisez Render à accéder à vos repositories
3. Sélectionnez **"All repositories"** ou **"Only select repositories"**
4. Si vous choisissez "Only select repositories", sélectionnez : `Back-end-python-V0_03_03_2026`

**Si GitHub est déjà connecté :**
1. Vous verrez la liste de vos repositories
2. Cherchez : `Back-end-python-V0_03_03_2026`
3. Cliquez sur **"Connect"** à côté du repository

---

## 📋 Étape 3: Configurer le Service

### 3.1 Configuration de Base

Render va vous demander plusieurs informations :

**Name (Nom du service) :**
```
clara-backend-production
```

**Region (Région) :**
- Choisissez **"Frankfurt (Europe)"** (plus proche de vous)
- Ou **"Oregon (US West)"** si vous préférez

**Branch (Branche Git) :**
```
main
```
(ou `master` si c'est le nom de votre branche principale)

**Root Directory (Répertoire racine) :**
```
py_backend
```
⚠️ **IMPORTANT** : Votre code Python est dans le dossier `py_backend/`

### 3.2 Configuration du Build

**Runtime (Environnement) :**
```
Python 3
```

**Build Command (Commande de build) :**
```
pip install -r requirements.txt
```

**Start Command (Commande de démarrage) :**
```
python main.py
```

---

## 📋 Étape 4: Variables d'Environnement

### 4.1 Ajouter les Variables

Cliquez sur **"Advanced"** pour voir les options avancées.

Puis cliquez sur **"Add Environment Variable"** et ajoutez :

| Key | Value |
|-----|-------|
| `HOST` | `0.0.0.0` |
| `PORT` | `5000` |
| `PYTHONDONTWRITEBYTECODE` | `1` |
| `PYTHONUNBUFFERED` | `1` |

**Comment ajouter chaque variable :**
1. Cliquez sur **"Add Environment Variable"**
2. Dans **"Key"**, entrez le nom (ex: `HOST`)
3. Dans **"Value"**, entrez la valeur (ex: `0.0.0.0`)
4. Répétez pour chaque variable

---

## 📋 Étape 5: Choisir le Plan

### 5.1 Plan Gratuit (avec cold start)

**Instance Type :**
```
Free
```

**Ce que vous obtenez :**
- ✅ 512 MB RAM
- ✅ 750 heures/mois (suffisant pour 24/7)
- ✅ Déploiement automatique
- ❌ **Cold start après 15 min d'inactivité**

**Coût : $0/mois**

### 5.2 Plan Starter (SANS cold start)

**Instance Type :**
```
Starter
```

**Ce que vous obtenez :**
- ✅ 512 MB RAM
- ✅ Toujours actif 24/7
- ✅ **PAS de cold start**
- ✅ Déploiement automatique

**Coût : $7/mois**

⚠️ **Pour le plan Starter, vous devrez ajouter une carte de crédit/débit**

---

## 📋 Étape 6: Créer le Service

### 6.1 Vérifier la Configuration

Vérifiez que tout est correct :
- ✅ Name: `clara-backend-production`
- ✅ Region: `Frankfurt (Europe)`
- ✅ Branch: `main`
- ✅ Root Directory: `py_backend`
- ✅ Build Command: `pip install -r requirements.txt`
- ✅ Start Command: `python main.py`
- ✅ Variables d'environnement ajoutées
- ✅ Plan choisi (Free ou Starter)

### 6.2 Cliquer sur "Create Web Service"

Render va commencer le déploiement automatiquement !

---

## 📋 Étape 7: Suivre le Déploiement

### 7.1 Logs de Build

Vous verrez les logs en temps réel :
```
==> Cloning from https://github.com/[votre-username]/Back-end-python-V0_03_03_2026...
==> Checking out commit [commit-hash] in branch main
==> Running build command 'pip install -r requirements.txt'...
==> Installing dependencies...
==> Build successful!
==> Starting service...
```

### 7.2 Temps de Déploiement

Le premier déploiement prend **3-5 minutes**.

### 7.3 Service Déployé

Une fois terminé, vous verrez :
```
✅ Your service is live at https://clara-backend-production.onrender.com
```

---

## 📋 Étape 8: Tester le Déploiement

### 8.1 Vérifier l'URL

Votre backend est maintenant accessible à :
```
https://clara-backend-production.onrender.com
```

### 8.2 Tester l'Endpoint Health

Ouvrez votre navigateur et allez sur :
```
https://clara-backend-production.onrender.com/health
```

Vous devriez voir une réponse JSON :
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

---

## 📋 Étape 9: Mettre à Jour le Frontend

### 9.1 Modifier claraApiService.ts

Ouvrez le fichier : `src/services/claraApiService.ts`

Cherchez la ligne :
```typescript
private readonly n8nDefaultEndpoint = "https://hkj0631c.rpcl.app/webhook/template";
```

Remplacez **TOUTES les URLs** `https://hkj0631c.rpcl.app` par :
```typescript
https://clara-backend-production.onrender.com
```

### 9.2 Sauvegarder et Redéployer le Frontend

Une fois modifié, redéployez votre frontend sur Netlify.

---

## 🔧 Étape 10: Éviter le Cold Start (Optionnel)

### Si vous avez choisi le plan GRATUIT

Votre service s'endort après 15 min d'inactivité.

**Solution : Utiliser UptimeRobot (gratuit)**

1. Allez sur : **https://uptimerobot.com**
2. Créez un compte gratuit
3. Cliquez sur **"Add New Monitor"**
4. Configurez :
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Clara Backend
   - **URL:** `https://clara-backend-production.onrender.com/health`
   - **Monitoring Interval:** 5 minutes
5. Cliquez sur **"Create Monitor"**

**Résultat :** Votre backend reste actif 24/7 sans cold start ! 🎉

---

## 📊 Récapitulatif

### Ce que vous avez déployé

- ✅ Backend Python FastAPI sur Render
- ✅ Déploiement automatique depuis GitHub
- ✅ URL publique : `https://clara-backend-production.onrender.com`
- ✅ Variables d'environnement configurées
- ✅ SSL automatique (HTTPS)

### Coûts

**Plan Free :**
- $0/mois
- Cold start après 15 min (résolu avec UptimeRobot)

**Plan Starter :**
- $7/mois
- Pas de cold start
- Toujours actif 24/7

---

## 🚨 Dépannage

### Le build échoue

**Erreur : "requirements.txt not found"**

**Solution :**
1. Vérifiez que **Root Directory** est bien `py_backend`
2. Vérifiez que `requirements.txt` existe dans `py_backend/`

**Erreur : "Module not found"**

**Solution :**
1. Vérifiez que toutes les dépendances sont dans `requirements.txt`
2. Ajoutez les dépendances manquantes

### Le service ne démarre pas

**Erreur : "Port already in use"**

**Solution :**
1. Vérifiez que la variable `PORT` est bien `5000`
2. Vérifiez que `main.py` utilise `os.getenv('PORT', 5000)`

### Erreurs CORS

**Erreur : "CORS policy blocked"**

**Solution :**
Ajoutez dans `main.py` :
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://votre-frontend.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🎉 Félicitations !

Votre backend Python est maintenant déployé sur Render !

**Prochaines étapes :**
1. ✅ Tester tous les endpoints
2. ✅ Mettre à jour le frontend avec la nouvelle URL
3. ✅ Configurer UptimeRobot (si plan gratuit)
4. ✅ Monitorer les performances

---

**Besoin d'aide ?** Dites-moi où vous en êtes ! 🚀
