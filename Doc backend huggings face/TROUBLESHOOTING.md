# 🔧 Guide de Dépannage : Déploiement Hugging Face

## 📋 Problèmes Courants et Solutions

---

## 🏗️ Problèmes de Build

### ❌ Build échoue avec "No space left on device"

**Cause** : Image Docker trop volumineuse

**Solution** :
```powershell
# Créer/mettre à jour .dockerignore
@"
*.xlsx
*.xls
*.pdf
test_*.py
Doc*/
__pycache__/
"@ | Out-File -FilePath ".dockerignore" -Encoding UTF8
```

### ❌ Build timeout après 1 heure

**Cause** : Build trop long

**Solution** :
1. Réduire les dépendances dans `requirements.txt`
2. Commenter les dépendances optionnelles
3. Utiliser des versions pré-compilées

---

## 🚀 Problèmes de Démarrage

### ❌ Application crash immédiatement

**Diagnostic** :
```powershell
# Vérifier les logs sur Hugging Face
# Onglet "Logs" → "Container logs"
```

**Solutions** :

1. **Port incorrect**
```python
# Dans main.py, vérifier :
PORT = int(os.getenv('PORT', 7860))  # Doit être 7860
```

2. **Module manquant**
```powershell
# Ajouter dans requirements.txt
echo "nom-du-module==version" >> requirements.txt
git add requirements.txt
git commit -m "Add missing dependency"
git push hf main
```

---

## 🔌 Problèmes de Connexion

### ❌ CORS Error

**Solution** :
```python
# Dans main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### ❌ "Failed to fetch"

**Causes possibles** :
1. URL incorrecte
2. Space en veille
3. Application pas encore démarrée

**Solution** :
```powershell
# Vérifier l'URL
$url = "https://[username]-claraverse-backend.hf.space/health"
curl $url

# Attendre 30 secondes et réessayer
Start-Sleep -Seconds 30
curl $url
```

---

## 🔀 Problèmes Git

### ❌ "Authentication failed"

**Cause** : Token invalide ou expiré

**Solution** :
```powershell
# Reconfigurer le remote avec le bon token
git remote remove hf
git remote add hf https://[USERNAME]:[TOKEN]@huggingface.co/spaces/[USERNAME]/claraverse-backend

# Push à nouveau
git push hf main --force
```

### ❌ "Repository not found"

**Cause** : Space pas encore créé

**Solution** :
1. Aller sur https://huggingface.co/new-space
2. Créer le Space avec le nom exact : `claraverse-backend`
3. Réessayer le push

### ❌ "Large files detected"

**Cause** : Fichiers > 10MB

**Solution** :
```powershell
# Identifier les gros fichiers
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 10MB} | Select-Object FullName, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}

# Les ajouter à .gitignore
"*.xlsx" | Add-Content .gitignore
"*.pdf" | Add-Content .gitignore

# Les supprimer du cache Git
git rm --cached fichier-volumineux.xlsx

# Recommiter
git add .
git commit -m "Remove large files"
git push hf main --force
```

---

## ⚠️ Erreurs Spécifiques

### ❌ "ModuleNotFoundError: No module named 'X'"

**Solution** :
```powershell
# Ajouter le module dans requirements.txt
"nom-du-module==version" | Add-Content requirements.txt

# Commit et push
git add requirements.txt
git commit -m "Add missing dependency: nom-du-module"
git push hf main
```

### ❌ "FileNotFoundError"

**Solution** :
```python
# Utiliser des chemins relatifs
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
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

---

## 🔍 Diagnostic Avancé

### Vérifier les Logs de Build

1. Aller sur votre Space
2. Cliquer sur "Logs"
3. Section "Build logs"
4. Chercher les erreurs (lignes en rouge)

### Vérifier les Logs du Container

1. Aller sur votre Space
2. Cliquer sur "Logs"
3. Section "Container logs"
4. Vérifier les erreurs de démarrage

### Tester Localement avec Docker

```powershell
# Construire l'image localement
docker build -t test-backend .

# Lancer le container
docker run -p 7860:7860 test-backend

# Tester l'API
curl http://localhost:7860/health
```

---

## 🆘 Obtenir de l'Aide

### Logs Détaillés

```python
# Activer les logs détaillés dans main.py
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Ressources

- **Forum Hugging Face** : https://discuss.huggingface.co/
- **Documentation Spaces** : https://huggingface.co/docs/hub/spaces
- **Status Page** : https://status.huggingface.co/

### Poster une Question

Si le problème persiste :
1. Aller sur votre Space
2. Cliquer sur "Community" → "New discussion"
3. Inclure :
   - Logs complets
   - Étapes pour reproduire
   - Configuration (Dockerfile, requirements.txt)

---

## ✅ Checklist de Vérification

Avant de demander de l'aide :

- [ ] Dockerfile expose le port 7860
- [ ] requirements.txt contient toutes les dépendances
- [ ] .dockerignore exclut les fichiers volumineux
- [ ] README.md a le bon format (avec frontmatter)
- [ ] Logs consultés (Build + Container)
- [ ] Test local réussi avec Docker
- [ ] Token Hugging Face valide
- [ ] Space créé avec SDK "Docker"

---

## 🔄 Réinitialisation Complète

Si tout échoue, réinitialiser complètement :

```powershell
# 1. Supprimer le dossier .git
Remove-Item -Recurse -Force .git

# 2. Réinitialiser Git
git init

# 3. Reconfigurer le remote
git remote add hf https://[USERNAME]:[TOKEN]@huggingface.co/spaces/[USERNAME]/claraverse-backend

# 4. Recommencer le déploiement
git add .
git commit -m "Fresh deployment"
git push hf main --force
```

---

## 📞 Contact Support

### Hugging Face Support

- **Forum** : https://discuss.huggingface.co/
- **Discord** : https://discord.gg/hugging-face
- **Email** : support@huggingface.co

### Information à Fournir

Lors d'une demande d'aide, inclure :
- URL du Space
- Logs complets (build + container)
- Dockerfile
- requirements.txt
- Étapes pour reproduire le problème

---

**Dernière mise à jour** : 18 Avril 2026
