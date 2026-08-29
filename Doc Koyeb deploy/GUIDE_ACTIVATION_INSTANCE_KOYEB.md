# Guide d'Activation de l'Instance Koyeb

## 🎯 Contexte

Votre instance Koyeb est configurée en mode **Free** avec **sleep mode** activé. Cela signifie que l'instance s'endort automatiquement après 65 minutes d'inactivité pour économiser les ressources.

**Statut actuel** : "No running instances" (visible dans le dashboard)

## 🔄 Processus d'Activation

### Méthode 1: Appel HTTP à l'API (Recommandé)

C'est la méthode la plus simple pour réveiller l'instance.

#### Via navigateur

Ouvrez simplement l'URL de votre API dans un navigateur :

```
https://proud-del-saasauditnterne-9f15de46.koyeb.app/docs
```

**Ce qui se passe** :
1. Koyeb détecte la requête HTTP
2. L'instance démarre automatiquement (cold start)
3. Temps de démarrage : ~30-60 secondes
4. La page Swagger s'affiche une fois l'instance prête

#### Via PowerShell

```powershell
# Tester l'endpoint /docs
Invoke-WebRequest -Uri "https://proud-del-saasauditnterne-9f15de46.koyeb.app/docs" -Method GET

# Ou tester l'endpoint racine
Invoke-WebRequest -Uri "https://proud-del-saasauditnterne-9f15de46.koyeb.app/" -Method GET
```

#### Via curl (Git Bash)

```bash
# Tester l'endpoint /docs
curl https://proud-del-saasauditnterne-9f15de46.koyeb.app/docs

# Ou avec verbose pour voir les détails
curl -v https://proud-del-saasauditnterne-9f15de46.koyeb.app/docs
```

### Méthode 2: Redéploiement via Dashboard

Si l'instance ne répond pas ou si vous voulez forcer un redémarrage :

1. **Aller sur le dashboard Koyeb**
   ```
   https://app.koyeb.com/services/back-end-python-v0-03-03-2026
   ```

2. **Cliquer sur "Redeploy"** (bouton vert en haut à droite)

3. **Confirmer le redéploiement**

4. **Attendre le déploiement** (~2-3 minutes)
   - Build de l'image Docker
   - Démarrage de l'instance
   - Health check

### Méthode 3: Via CLI Koyeb

Si vous avez installé la CLI Koyeb :

```bash
# Se connecter (si nécessaire)
koyeb login

# Redéployer le service
koyeb service redeploy back-end-python-v0-03-03-2026

# Suivre les logs
koyeb service logs back-end-python-v0-03-03-2026 --follow
```

### Méthode 4: Push vers Github

Puisque l'auto-deploy est activé, un simple push vers Github redéploie automatiquement :

```bash
# Faire un commit vide pour forcer le redéploiement
git commit --allow-empty -m "Force redeploy"
git push origin main
```

## ⏱️ Temps de Démarrage

### Cold Start (instance endormie)
- **Durée** : 30-60 secondes
- **Processus** :
  1. Koyeb détecte la requête
  2. Démarre le conteneur Docker
  3. Charge l'application FastAPI
  4. Effectue le health check
  5. Route le trafic vers l'instance

### Warm Start (instance active)
- **Durée** : < 1 seconde
- L'instance répond immédiatement

## 📊 Surveillance de l'Activation

### Via Dashboard Koyeb

1. Aller sur : https://app.koyeb.com/services/back-end-python-v0-03-03-2026

2. **Onglet Overview** :
   - Statut de l'instance
   - Dernière activité
   - Métriques en temps réel

3. **Onglet Console** :
   - Logs de démarrage
   - Erreurs éventuelles
   - Messages de l'application

### Via CLI Koyeb

```bash
# Voir le statut
koyeb service get back-end-python-v0-03-03-2026

# Voir les logs en temps réel
koyeb service logs back-end-python-v0-03-03-2026 --follow

# Voir les logs de build
koyeb service logs back-end-python-v0-03-03-2026 --type build
```

## 🔍 Vérification de l'Activation

### Test 1: Endpoint racine

```powershell
# PowerShell
Invoke-WebRequest -Uri "https://proud-del-saasauditnterne-9f15de46.koyeb.app/"
```

```bash
# Bash
curl https://proud-del-saasauditnterne-9f15de46.koyeb.app/
```

**Réponse attendue** : Code 200 avec le message de bienvenue de l'API

### Test 2: Swagger Documentation

Ouvrir dans le navigateur :
```
https://proud-del-saasauditnterne-9f15de46.koyeb.app/docs
```

**Résultat attendu** : Interface Swagger avec tous les endpoints disponibles

### Test 3: Health Check (si disponible)

```powershell
# PowerShell
Invoke-WebRequest -Uri "https://proud-del-saasauditnterne-9f15de46.koyeb.app/health"
```

```bash
# Bash
curl https://proud-del-saasauditnterne-9f15de46.koyeb.app/health
```

## 🚨 Troubleshooting

### L'instance ne démarre pas

**Symptômes** :
- Timeout après 60 secondes
- Erreur 502 Bad Gateway
- Erreur 503 Service Unavailable

**Solutions** :

1. **Vérifier les logs de build**
   ```bash
   koyeb service logs back-end-python-v0-03-03-2026 --type build
   ```

2. **Vérifier les logs d'application**
   ```bash
   koyeb service logs back-end-python-v0-03-03-2026 --follow
   ```

3. **Vérifier le Dockerfile**
   - Est-il présent dans le repository Github ?
   - Build-t-il correctement en local ?

4. **Vérifier les variables d'environnement**
   - Dashboard > Settings > Environment variables
   - Vérifier HOST=0.0.0.0 et PORT=5000

5. **Redéployer manuellement**
   - Dashboard > Redeploy

### L'instance démarre mais ne répond pas

**Symptômes** :
- L'instance est "Running" dans le dashboard
- Mais les requêtes HTTP timeout

**Solutions** :

1. **Vérifier que l'app écoute sur 0.0.0.0:5000**
   ```python
   # Dans main.py
   if __name__ == "__main__":
       import uvicorn
       uvicorn.run(app, host="0.0.0.0", port=5000)
   ```

2. **Vérifier le health check**
   - Dashboard > Settings > Health checks
   - Type: TCP sur port 5000

3. **Vérifier les logs**
   ```bash
   koyeb service logs back-end-python-v0-03-03-2026 --follow
   ```

### L'instance se rendort trop vite

**Symptômes** :
- L'instance s'endort après quelques minutes d'inactivité

**Explication** :
- C'est normal avec l'instance Free
- Sleep delay configuré : 3900 secondes (65 minutes)

**Solutions** :

1. **Accepter le sleep mode** (gratuit)
   - Première requête : 30-60 secondes
   - Requêtes suivantes : < 1 seconde

2. **Upgrade vers instance payante**
   - Dashboard > Settings > Instance type
   - Choisir "nano" ou "small"
   - Pas de sleep mode
   - Coût : ~$5-10/mois

3. **Ping régulier** (non recommandé)
   - Mettre en place un cron job pour ping l'API
   - Attention aux coûts si vous dépassez les limites gratuites

## 💡 Bonnes Pratiques

### 1. Ajouter un endpoint /health

Ajoutez un endpoint de santé dans votre FastAPI :

```python
from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "clara-backend"
    }
```

### 2. Configurer un timeout approprié

Dans votre frontend, configurez un timeout plus long pour le premier appel :

```typescript
// Pour le premier appel après sleep
const response = await fetch(API_URL, {
    timeout: 60000 // 60 secondes
});
```

### 3. Afficher un message de chargement

Informez l'utilisateur que l'instance démarre :

```typescript
if (isFirstCall && response.status === 503) {
    showMessage("Démarrage du serveur en cours... (~30 secondes)");
    // Réessayer après 30 secondes
}
```

### 4. Surveiller les logs

Configurez des alertes pour être notifié des problèmes :

```bash
# Surveiller les erreurs
koyeb service logs back-end-python-v0-03-03-2026 --follow | grep ERROR
```

## 📈 Upgrade vers Instance Payante

Si le sleep mode est problématique pour votre usage :

### Avantages
- ✅ Pas de sleep mode
- ✅ Démarrage instantané
- ✅ Meilleures performances
- ✅ Plus de ressources (CPU, RAM)

### Coûts
- **Nano** : ~$5/mois (512 MB RAM, 0.1 vCPU)
- **Small** : ~$10/mois (1 GB RAM, 0.5 vCPU)
- **Medium** : ~$20/mois (2 GB RAM, 1 vCPU)

### Comment upgrader

1. Dashboard > Settings > Instance type
2. Sélectionner le type d'instance
3. Sauvegarder
4. L'instance redémarre automatiquement

## 🔗 Liens Utiles

- **Dashboard** : https://app.koyeb.com/services/back-end-python-v0-03-03-2026
- **API URL** : https://proud-del-saasauditnterne-9f15de46.koyeb.app/
- **Swagger** : https://proud-del-saasauditnterne-9f15de46.koyeb.app/docs
- **Documentation Koyeb** : https://www.koyeb.com/docs

## 📝 Script d'Activation Automatique

Créez un script pour activer l'instance facilement :

```powershell
# activate-koyeb-instance.ps1

$API_URL = "https://proud-del-saasauditnterne-9f15de46.koyeb.app/docs"

Write-Host "🚀 Activation de l'instance Koyeb..." -ForegroundColor Cyan
Write-Host "URL: $API_URL" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "⏳ Envoi de la requête (peut prendre 30-60 secondes)..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri $API_URL -Method GET -TimeoutSec 90
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Instance activée avec succès !" -ForegroundColor Green
        Write-Host "📊 Swagger disponible : $API_URL" -ForegroundColor Green
        
        # Ouvrir dans le navigateur
        Start-Process $API_URL
    }
} catch {
    Write-Host "❌ Erreur lors de l'activation : $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions :" -ForegroundColor Yellow
    Write-Host "  1. Vérifier les logs : koyeb service logs back-end-python-v0-03-03-2026" -ForegroundColor Cyan
    Write-Host "  2. Redéployer : https://app.koyeb.com/services/back-end-python-v0-03-03-2026" -ForegroundColor Cyan
}
```

Utilisation :
```powershell
.\Doc Koyeb deploy\Scripts\activate-koyeb-instance.ps1
```

## 🎯 Résumé

Pour activer votre instance Koyeb :

1. **Méthode simple** : Ouvrir https://proud-del-saasauditnterne-9f15de46.koyeb.app/docs dans le navigateur
2. **Attendre** : 30-60 secondes pour le cold start
3. **Vérifier** : L'interface Swagger s'affiche
4. **Utiliser** : L'API est maintenant active et répond rapidement

L'instance restera active tant qu'elle reçoit des requêtes. Elle se rendormira après 65 minutes d'inactivité.
