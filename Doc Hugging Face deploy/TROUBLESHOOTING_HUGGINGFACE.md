# 🔧 Guide de Dépannage : Hugging Face Spaces

## 📋 Table des Matières

1. [Problèmes de Build](#problèmes-de-build)
2. [Problèmes de Démarrage](#problèmes-de-démarrage)
3. [Problèmes de Performance](#problèmes-de-performance)
4. [Problèmes de Connexion](#problèmes-de-connexion)
5. [Problèmes Git](#problèmes-git)
6. [Erreurs Courantes](#erreurs-courantes)

---

## 🏗️ Problèmes de Build

### ❌ Build échoue avec "No space left on device"

**Cause** : Image Docker trop volumineuse

**Solution** :
```bash
# 1. Optimiser .dockerignore
# Ajouter dans .dockerignore :
*.xlsx
*.xls
*.pdf
test_*.py
Doc*/
__pycache__/

# 2. Nettoyer les fichiers volumineux
# Supprimer les fichiers de test et documentation
```

### ❌ Build échoue avec "requirements.txt not found"

**Cause** : Fichier requirements.txt manquant ou mal placé

**Solution** :
```bash
# Vérifier que requirements.txt est à la racine de py_backend
ls requirements.txt

# Si manquant, le créer avec les dépendances minimales
```

### ❌ Build timeout après 1 heure

**Cause** : Build trop long (limite Hugging Face)

**Solution** :
1. Réduire les dépendances dans requirements.txt
2. Utiliser des images de base plus légères
3. Commenter les dépendances optionnelles

```dockerfile
# Dans Dockerfile, utiliser :
FROM python:3.11-slim
# Au lieu de :
FROM python:3.11
```

### ❌ Erreur "Failed to build wheel for [package]"

**Cause** : Dépendance nécessitant compilation (ex: Rust pour pydantic)

**Solution** :
```txt
# Dans requirements.txt, utiliser des versions pré-compilées :
pydantic==2.6.4
pydantic-core==2.16.3

# Éviter les versions nécessitant Rust :
# pydantic>=2.7.0  ❌
```

---

## 🚀 Problèmes de Démarrage

### ❌ Application démarre mais crash immédiatement

**Diagnostic** :
```bash
# Vérifier les logs du container
# Dans l'interface HF : Onglet "Logs" → "Container logs"
```

**Solutions courantes** :

1. **Port incorrect**
```python
# Dans main.py, s'assurer que :
PORT = int(os.getenv('PORT', 7860))  # Doit être 7860 pour HF
```

2. **Import manquant**
```python
# Vérifier que tous les modules sont dans requirements.txt
# Tester localement d'abord
```

3. **Fichier manquant**
```python
# Vérifier que tous les fichiers nécessaires sont commités
git status
```

### ❌ "Address already in use"

**Cause** : Port 7860 déjà utilisé (rare sur HF)

**Solution** :
```python
# Dans main.py, ajouter :
import socket

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

# Utiliser en fallback
PORT = int(os.getenv('PORT', 7860))
```

### ❌ Application en "Building" indéfiniment

**Cause** : Build bloqué ou erreur silencieuse

**Solution** :
1. Annuler le build (bouton "Stop")
2. Vérifier les logs
3. Faire un nouveau push avec `--force`

```bash
git push hf main --force
```

---

## ⚡ Problèmes de Performance

### ❌ Application très lente

**Cause** : Hardware insuffisant (CPU basic)

**Solution** :
1. Upgrader le hardware :
   - Settings → Space hardware → CPU upgrade
2. Optimiser le code :
   - Ajouter du caching
   - Réduire les imports lourds

### ❌ Timeout sur les requêtes

**Cause** : Traitement trop long

**Solution** :
```python
# Dans main.py, augmenter les timeouts :
from fastapi import FastAPI
import uvicorn

app = FastAPI()

# Augmenter le timeout
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=7860,
        timeout_keep_alive=300  # 5 minutes
    )
```

### ❌ Out of Memory (OOM)

**Cause** : Utilisation mémoire excessive

**Solution** :
1. Upgrader vers CPU upgrade (16GB RAM)
2. Optimiser le code :
```python
# Libérer la mémoire après traitement
import gc

def process_large_file(file):
    # Traitement
    result = ...
    
    # Libérer la mémoire
    gc.collect()
    
    return result
```

---

## 🔌 Problèmes de Connexion

### ❌ CORS Error dans le frontend

**Cause** : CORS mal configuré

**Solution** :
```python
# Dans main.py, configurer CORS correctement :
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En prod, spécifier les domaines
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
```

### ❌ "Failed to fetch" depuis le frontend

**Cause** : URL incorrecte ou Space en veille

**Solution** :
1. Vérifier l'URL :
```javascript
// Doit être :
const API_URL = "https://[username]-claraverse-backend.hf.space"
// Pas :
const API_URL = "https://huggingface.co/spaces/[username]/claraverse-backend"
```

2. Réveiller le Space :
   - Ouvrir l'URL du Space dans le navigateur
   - Attendre 30 secondes

### ❌ SSL/TLS Error

**Cause** : Certificat SSL non valide (rare)

**Solution** :
```python
# Forcer HTTPS dans les redirections
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# En production uniquement
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

---

## 🔀 Problèmes Git

### ❌ "Authentication failed"

**Cause** : Token invalide ou expiré

**Solution** :
```bash
# 1. Générer un nouveau token sur HF
# 2. Mettre à jour le remote :
git remote remove hf
git remote add hf https://[username]:[new-token]@huggingface.co/spaces/[username]/claraverse-backend

# 3. Push à nouveau
git push hf main
```

### ❌ "Repository not found"

**Cause** : Space pas encore créé ou nom incorrect

**Solution** :
1. Vérifier que le Space existe sur HF
2. Vérifier l'URL :
```bash
# Doit être :
https://huggingface.co/spaces/[username]/claraverse-backend
# Pas :
https://huggingface.co/[username]/claraverse-backend
```

### ❌ "Large files detected"

**Cause** : Fichiers > 10MB dans le commit

**Solution** :
```bash
# 1. Identifier les gros fichiers
git ls-files -z | xargs -0 du -h | sort -h | tail -20

# 2. Les ajouter à .gitignore
echo "*.xlsx" >> .gitignore
echo "*.pdf" >> .gitignore

# 3. Les supprimer du cache Git
git rm --cached fichier-volumineux.xlsx

# 4. Recommiter
git add .
git commit -m "Remove large files"
git push hf main --force
```

### ❌ "Merge conflict"

**Cause** : Modifications concurrentes

**Solution** :
```bash
# 1. Récupérer les changements distants
git pull hf main

# 2. Résoudre les conflits manuellement

# 3. Push à nouveau
git push hf main
```

---

## ⚠️ Erreurs Courantes

### ❌ "ModuleNotFoundError: No module named 'X'"

**Solution** :
```bash
# Ajouter le module manquant dans requirements.txt
echo "nom-du-module==version" >> requirements.txt

# Recommiter et push
git add requirements.txt
git commit -m "Add missing dependency"
git push hf main
```

### ❌ "FileNotFoundError: [Errno 2] No such file or directory"

**Solution** :
```python
# Utiliser des chemins relatifs ou absolus corrects
import os
from pathlib import Path

# Obtenir le dossier de base
BASE_DIR = Path(__file__).parent

# Construire les chemins
file_path = BASE_DIR / "data" / "fichier.xlsx"
```

### ❌ "Permission denied"

**Solution** :
```dockerfile
# Dans Dockerfile, créer un utilisateur non-root
RUN useradd -m -r -u 1000 clara && \
    chown -R clara:clara /app

USER clara
```

### ❌ "Healthcheck failed"

**Solution** :
```python
# Ajouter un endpoint /health simple
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }
```

---

## 🆘 Obtenir de l'Aide

### Logs Détaillés

```python
# Activer les logs détaillés dans main.py
import logging

logging.basicConfig(
    level=logging.DEBUG,  # Au lieu de INFO
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Tester Localement

```bash
# Avant de déployer, tester avec Docker localement
docker build -t test-backend .
docker run -p 7860:7860 test-backend

# Tester l'API
curl http://localhost:7860/health
```

### Ressources

- **Forum Hugging Face** : https://discuss.huggingface.co/
- **Documentation Spaces** : https://huggingface.co/docs/hub/spaces
- **Status Page** : https://status.huggingface.co/

### Contact Support

Si le problème persiste :
1. Aller sur votre Space
2. Cliquer sur "Community" → "New discussion"
3. Décrire le problème avec :
   - Logs complets
   - Étapes pour reproduire
   - Configuration (Dockerfile, requirements.txt)

---

## ✅ Checklist de Vérification

Avant de demander de l'aide, vérifier :

- [ ] Dockerfile expose le port 7860
- [ ] requirements.txt contient toutes les dépendances
- [ ] .dockerignore exclut les fichiers volumineux
- [ ] README.md a le bon format (avec frontmatter)
- [ ] Logs consultés (Build + Container)
- [ ] Test local réussi avec Docker
- [ ] Token Hugging Face valide (Write access)
- [ ] Space créé avec SDK "Docker"

---

**Dernière mise à jour** : 18 Avril 2026
