# 🚀 Guide des Scripts de Démarrage - ClaraVerse

## 📦 Scripts Disponibles

J'ai créé 6 scripts pour faciliter le démarrage de votre projet ClaraVerse :

### Scripts PowerShell (.ps1)
- `start-frontend.ps1` - Démarre uniquement le frontend
- `start-backend.ps1` - Démarre uniquement le backend
- `start-all.ps1` - Démarre frontend + backend ensemble

### Scripts Batch (.bat)
- `start-frontend.bat` - Démarre uniquement le frontend
- `start-backend.bat` - Démarre uniquement le backend
- `start-all.bat` - Démarre frontend + backend ensemble

## 🎯 Utilisation

### Option 1 : Double-clic (Plus Simple)

**Windows Explorer :**
1. Naviguez vers le dossier `H:\ClaraVerse`
2. Double-cliquez sur le script de votre choix :
   - `start-all.bat` pour tout démarrer
   - `start-frontend.bat` pour le frontend uniquement
   - `start-backend.bat` pour le backend uniquement

### Option 2 : Ligne de Commande

**PowerShell :**
```powershell
# Démarrer tout
.\start-all.ps1

# Ou frontend uniquement
.\start-frontend.ps1

# Ou backend uniquement
.\start-backend.ps1
```

**CMD (Invite de commandes) :**
```cmd
# Démarrer tout
start-all.bat

# Ou frontend uniquement
start-frontend.bat

# Ou backend uniquement
start-backend.bat
```

## 📋 Détails des Scripts

### 1. start-frontend (.ps1 / .bat)

**Ce qu'il fait :**
- Démarre le serveur de développement Vite
- Lance le frontend React

**URL :**
- Frontend : http://localhost:5173

**Commande équivalente :**
```bash
npm run dev
```

### 2. start-backend (.ps1 / .bat)

**Ce qu'il fait :**
- Active l'environnement virtuel Python
- Démarre le serveur FastAPI
- Lance le backend Python

**URLs :**
- Backend : http://localhost:8000
- API Docs : http://localhost:8000/docs

**Commandes équivalentes :**
```bash
.\venv_claraverse\Scripts\Activate.ps1
cd py_backend
python main.py
```

### 3. start-all (.ps1 / .bat)

**Ce qu'il fait :**
- Active l'environnement virtuel Python
- Démarre frontend ET backend ensemble
- Utilise `concurrently` pour lancer les deux serveurs

**URLs :**
- Frontend : http://localhost:5173
- Backend : http://localhost:8000
- API Docs : http://localhost:8000/docs

**Commande équivalente :**
```bash
.\venv_claraverse\Scripts\Activate.ps1
npm run dev:full
```

## ⚠️ Prérequis

Avant d'utiliser ces scripts, assurez-vous que :

1. ✅ L'environnement virtuel Python est créé (`venv_claraverse`)
2. ✅ Les dépendances Python sont installées
3. ✅ Les dépendances npm sont installées

Si ce n'est pas le cas, exécutez d'abord :
```powershell
.\venv_claraverse\Scripts\Activate.ps1
cd py_backend
pip install -r requirements.txt
cd ..
npm install
```

## 🛑 Arrêter les Serveurs

Pour arrêter les serveurs en cours d'exécution :
- Appuyez sur `Ctrl+C` dans le terminal
- Ou fermez simplement la fenêtre du terminal

## 💡 Conseils

### Développement Frontend Uniquement
Si vous travaillez uniquement sur le frontend :
```powershell
.\start-frontend.ps1
```

### Développement Backend Uniquement
Si vous travaillez uniquement sur le backend :
```powershell
.\start-backend.ps1
```

### Développement Full-Stack
Pour travailler sur frontend et backend :
```powershell
.\start-all.ps1
```

## 🔧 Personnalisation

Vous pouvez modifier ces scripts selon vos besoins :

### Changer le Port du Frontend
Éditez `vite.config.ts` :
```typescript
export default defineConfig({
  server: {
    port: 3000  // Changez 5173 en 3000
  }
})
```

### Changer le Port du Backend
Éditez `py_backend/main.py` :
```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)  # Changez 8000 en 8080
```

## 📊 Comparaison des Méthodes

| Méthode | Avantages | Inconvénients |
|---------|-----------|---------------|
| Double-clic (.bat) | Très simple, pas de terminal | Moins de contrôle |
| PowerShell (.ps1) | Coloré, informatif | Nécessite PowerShell |
| Ligne de commande | Flexible, scriptable | Plus technique |

## 🎯 Recommandation

**Pour la plupart des utilisateurs :**
- Double-cliquez sur `start-all.bat`

**Pour les développeurs :**
- Utilisez `.\start-all.ps1` dans PowerShell

## 🐛 Dépannage

### "L'exécution de scripts est désactivée sur ce système"

Si vous voyez cette erreur avec PowerShell :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Environnement virtuel non trouvé"

Créez l'environnement :
```powershell
python -m venv venv_claraverse
.\venv_claraverse\Scripts\Activate.ps1
cd py_backend
pip install -r requirements.txt
```

### "Port déjà utilisé"

Si un port est déjà utilisé :
1. Fermez l'application qui utilise le port
2. Ou changez le port dans la configuration

### Les serveurs ne démarrent pas

Vérifiez que toutes les dépendances sont installées :
```powershell
.\check-install.ps1
```

## 📚 Ressources

- Documentation Vite : https://vitejs.dev/
- Documentation FastAPI : https://fastapi.tiangolo.com/
- Documentation npm : https://docs.npmjs.com/

## 🎉 Prêt à Développer !

Utilisez simplement :
```powershell
.\start-all.ps1
```

Ou double-cliquez sur `start-all.bat` et commencez à coder ! 🚀
