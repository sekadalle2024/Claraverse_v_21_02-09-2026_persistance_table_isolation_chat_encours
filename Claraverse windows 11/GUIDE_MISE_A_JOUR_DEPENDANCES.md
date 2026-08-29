# Guide de Mise à Jour des Dépendances - ClaraVerse

## État Actuel
- ✅ Node.js v22.22.0 installé
- ✅ npm v10.9.4 installé
- ✅ Python 3.14.3 installé
- ❌ Miniconda non installé
- ⏳ Installation npm en cours

## 1. Frontend - Mise à jour des dépendances npm

### Étape 1.1 : Vérifier l'installation en cours
L'installation npm est actuellement en cours. Attendez qu'elle se termine (cela peut prendre 5-10 minutes).

```bash
# Vérifier si l'installation est terminée
ls node_modules
```

### Étape 1.2 : Une fois l'installation terminée, mettre à jour les dépendances

```bash
# Mettre à jour toutes les dépendances vers les versions compatibles
npm update

# Ou pour une mise à jour plus agressive (attention aux breaking changes)
npm install -g npm-check-updates
ncu -u
npm install
```

### Étape 1.3 : Vérifier les vulnérabilités

```bash
npm audit
npm audit fix
```

## 2. Backend Python - Installation de Miniconda

### Étape 2.1 : Télécharger Miniconda

**Pour Windows :**

1. Téléchargez Miniconda depuis : https://docs.conda.io/en/latest/miniconda.html
2. Choisissez la version Windows 64-bit (Python 3.x)
3. Ou utilisez cette commande PowerShell pour télécharger directement :

```powershell
# Télécharger Miniconda
Invoke-WebRequest -Uri "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe" -OutFile "$env:TEMP\Miniconda3-latest-Windows-x86_64.exe"

# Lancer l'installateur
Start-Process -FilePath "$env:TEMP\Miniconda3-latest-Windows-x86_64.exe" -Wait
```

### Étape 2.2 : Installer Miniconda

1. Exécutez le fichier téléchargé
2. Suivez l'assistant d'installation
3. **Important** : Cochez "Add Miniconda3 to my PATH environment variable"
4. Redémarrez votre terminal après l'installation

### Étape 2.3 : Vérifier l'installation de Conda

```bash
# Redémarrez votre terminal puis :
conda --version
conda init
```

## 3. Configuration de l'environnement Python avec Conda

### Étape 3.1 : Créer un environnement virtuel pour ClaraVerse

```bash
# Créer un environnement avec Python 3.11 (recommandé pour la compatibilité)
conda create -n claraverse python=3.11 -y

# Activer l'environnement
conda activate claraverse
```

### Étape 3.2 : Installer les dépendances Python

```bash
# Se déplacer dans le dossier backend
cd py_backend

# Installer les dépendances
pip install -r requirements.txt

# Ou avec conda pour certains packages
conda install pandas numpy openpyxl -y
pip install -r requirements.txt
```

### Étape 3.3 : Mettre à jour les dépendances Python

```bash
# Mettre à jour pip
python -m pip install --upgrade pip

# Mettre à jour toutes les dépendances
pip list --outdated
pip install --upgrade -r requirements.txt
```

## 4. Vérification Finale

### Frontend
```bash
# Vérifier que tout fonctionne
npm run dev
```

### Backend
```bash
# Activer l'environnement conda
conda activate claraverse

# Démarrer le backend
cd py_backend
python main.py
```

### Démarrage complet
```bash
# Démarrer frontend et backend ensemble
npm run dev:full
```

## 5. Commandes Utiles

### Conda
```bash
# Lister les environnements
conda env list

# Activer un environnement
conda activate claraverse

# Désactiver l'environnement
conda deactivate

# Supprimer un environnement
conda env remove -n claraverse

# Exporter l'environnement
conda env export > environment.yml

# Créer depuis un fichier
conda env create -f environment.yml
```

### npm
```bash
# Nettoyer le cache
npm cache clean --force

# Réinstaller complètement
rm -rf node_modules package-lock.json
npm install

# Vérifier les packages obsolètes
npm outdated

# Mettre à jour un package spécifique
npm update <package-name>
```

## 6. Résolution de Problèmes

### Si npm install échoue
```bash
# Nettoyer et réinstaller
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Si conda n'est pas reconnu après installation
1. Redémarrez votre terminal
2. Vérifiez que Miniconda est dans le PATH :
   - Ouvrez "Variables d'environnement système"
   - Ajoutez `C:\Users\<VotreNom>\miniconda3\Scripts` au PATH
   - Ajoutez `C:\Users\<VotreNom>\miniconda3\condabin` au PATH

### Si Python ne trouve pas les modules
```bash
# Vérifier que vous êtes dans le bon environnement
conda activate claraverse
which python  # ou "where python" sur Windows

# Réinstaller les dépendances
pip install --force-reinstall -r requirements.txt
```

## 7. Prochaines Étapes

1. ✅ Attendre la fin de `npm install`
2. ⬜ Installer Miniconda
3. ⬜ Créer l'environnement conda `claraverse`
4. ⬜ Installer les dépendances Python
5. ⬜ Tester le projet complet

## Notes Importantes

- **Python 3.14.3** : Vous avez une version très récente. Si vous rencontrez des problèmes de compatibilité, utilisez Python 3.11 avec conda
- **Dépendances optionnelles** : Certaines dépendances dans `requirements.txt` sont commentées (LangChain, Speech-to-Text, etc.). Décommentez-les si nécessaire
- **Electron** : Le projet utilise Electron pour la version desktop. Les dépendances sont gérées par npm

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur
2. Consultez la documentation officielle de Miniconda
3. Vérifiez les issues GitHub du projet ClaraVerse
