# Troubleshooting - Déploiement Render

**Date:** 16 Avril 2026

## Problèmes de Configuration

### ❌ Erreur: "Root directory does not exist"

**Symptômes:**
- Le déploiement échoue immédiatement
- Message d'erreur dans les logs Render

**Cause:**
Root Directory configuré avec `py_backend` au lieu d'être vide.

**Solution:**
1. Aller dans Settings du service Render
2. Trouver "Root Directory"
3. Supprimer `py_backend` et laisser VIDE
4. Sauvegarder et redéployer

**Explication:**
Render clone le repository complet. Si Root Directory = `py_backend`, Render cherche `py_backend/py_backend` qui n'existe pas.

---

### ❌ Erreur: "requirements_render.txt not found"

**Symptômes:**
- Build échoue avec "No such file or directory"
- Le fichier requirements_render.txt n'est pas trouvé

**Cause:**
Le fichier n'existe pas dans le repository GitHub.

**Solution:**
1. Vérifier sur GitHub:
   ```
   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026/blob/master/py_backend/requirements_render.txt
   ```

2. Si le fichier n'existe pas:
   ```bash
   # Vérifier localement
   git status
   
   # Si le fichier existe localement mais pas sur GitHub
   git add py_backend/requirements_render.txt
   git commit -m "Add requirements_render.txt"
   git push origin master
   ```

3. Attendre que Render redéploie automatiquement

---

## Problèmes de Build

### ❌ Erreur: Compilation Rust échoue

**Symptômes:**
```
error: can't find Rust compiler
Building wheel for pydantic-core failed
```

**Cause:**
pydantic 2.9.0 nécessite la compilation Rust, non disponible sur Render Free Tier.

**Solution:**
Utiliser pydantic 2.8.2 dans requirements_render.txt:

```txt
pydantic==2.8.2
pydantic-core==2.20.1
```

**Vérification:**
```bash
# Vérifier le contenu de requirements_render.txt
cat py_backend/requirements_render.txt | grep pydantic
```

---

### ❌ Erreur: Dépendances incompatibles

**Symptômes:**
```
ERROR: pip's dependency resolver does not currently take into account all the packages that are installed
```

**Cause:**
Conflits de versions entre les packages.

**Solution:**
1. Tester localement avec un environnement virtuel propre:
   ```bash
   python -m venv test_env
   source test_env/bin/activate  # Windows: test_env\Scripts\activate
   pip install -r py_backend/requirements_render.txt
   ```

2. Résoudre les conflits de versions

3. Mettre à jour requirements_render.txt

4. Pusher sur GitHub

---

## Problèmes de Démarrage

### ❌ Erreur: Port binding failed

**Symptômes:**
```
OSError: [Errno 98] Address already in use
```

**Cause:**
L'application n'utilise pas la variable d'environnement $PORT fournie par Render.

**Solution:**
Vérifier que le Start Command utilise `$PORT`:

```bash
cd py_backend && python main.py --host 0.0.0.0 --port $PORT
```

Et que main.py accepte l'argument `--port`:

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8000)
args = parser.parse_args()

uvicorn.run(app, host="0.0.0.0", port=args.port)
```

---

### ❌ Erreur: Module not found

**Symptômes:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Cause:**
Les dépendances ne sont pas installées correctement.

**Solution:**
1. Vérifier le Build Command:
   ```bash
   cd py_backend && pip install -r requirements_render.txt
   ```

2. Vérifier que requirements_render.txt contient toutes les dépendances

3. Redéployer

---

## Problèmes GitHub

### ❌ Erreur: GitHub Secret Scanning bloque le push

**Symptômes:**
```
remote: error: GH013: Repository rule violations found for refs/heads/master
```

**Cause:**
GitHub détecte des secrets (credentials OAuth, API keys) dans le code.

**Solution:**
1. Cliquer sur les liens d'autorisation fournis par GitHub

2. Approuver chaque secret en cliquant "Allow secret"

3. Réessayer le push:
   ```bash
   git push origin master --force
   ```

**Prévention:**
- Ne jamais commiter de secrets
- Utiliser des variables d'environnement
- Ajouter les fichiers sensibles au .gitignore

---

### ❌ Erreur: Push rejeté (fichiers trop volumineux)

**Symptômes:**
```
remote: error: File is too large
```

**Cause:**
Fichiers > 100 MB dans le repository.

**Solution:**
1. Identifier les fichiers volumineux:
   ```bash
   find . -type f -size +50M
   ```

2. Ajouter au .gitignore

3. Supprimer de l'historique Git si nécessaire:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/large/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```

---

## Problèmes de Performance

### ⚠️ Service lent ou timeout

**Symptômes:**
- Requêtes prennent > 30 secondes
- Timeouts fréquents

**Causes possibles:**
1. Free Tier Render (ressources limitées)
2. Cold start (service inactif)
3. Requêtes lourdes

**Solutions:**

**Pour Cold Start:**
- Utiliser un service de ping (UptimeRobot, Pingdom)
- Pinger l'endpoint /health toutes les 5 minutes

**Pour Performance:**
- Optimiser le code
- Ajouter du caching
- Upgrader vers un plan payant Render

---

## Problèmes de Connexion

### ❌ Erreur: Failed to fetch

**Symptômes:**
Frontend ne peut pas se connecter au backend.

**Cause:**
Problème CORS ou URL incorrecte.

**Solution:**

**1. Vérifier l'URL:**
```javascript
// Frontend
const API_URL = "https://clara-backend-production.onrender.com";
```

**2. Configurer CORS dans main.py:**
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

**3. Tester avec curl:**
```bash
curl -I https://clara-backend-production.onrender.com/health
```

---

## Logs et Debugging

### Accéder aux Logs

1. Dashboard Render: https://dashboard.render.com/
2. Sélectionner le service
3. Onglet "Logs"

### Logs en Temps Réel

```bash
# Via Render CLI (si installé)
render logs -f
```

### Filtrer les Logs

Dans le Dashboard Render:
- Rechercher par mot-clé
- Filtrer par niveau (ERROR, WARNING, INFO)
- Exporter les logs

---

## Commandes Utiles

### Vérifier le Statut

```bash
# Tester l'endpoint health
curl https://clara-backend-production.onrender.com/health

# Vérifier les headers
curl -I https://clara-backend-production.onrender.com/health
```

### Forcer un Redéploiement

1. Dashboard Render
2. Bouton "Manual Deploy"
3. Sélectionner "Clear build cache & deploy"

### Rollback

1. Dashboard Render
2. Onglet "Deploys"
3. Sélectionner un déploiement précédent
4. "Redeploy"

---

## Checklist de Diagnostic

Quand un problème survient:

- [ ] Vérifier les logs Render
- [ ] Vérifier que le fichier requirements_render.txt existe sur GitHub
- [ ] Vérifier la configuration (Root Directory vide)
- [ ] Tester l'endpoint /health
- [ ] Vérifier les variables d'environnement
- [ ] Vérifier CORS si problème de connexion
- [ ] Tester localement avec les mêmes dépendances

---

## Support

Si le problème persiste:

1. **Documentation Render:** https://render.com/docs
2. **Support Render:** https://render.com/support
3. **Community Forum:** https://community.render.com/
4. **Status Page:** https://status.render.com/
