# 🚀 INSTRUCTIONS DE DÉMARRAGE CLARAVERSE

## ✅ Environnement Conda Créé

L'environnement `claraverse_backend` a été créé avec Python 3.11.

## 📝 ÉTAPES POUR DÉMARRER

### 1. Terminer l'installation des dépendances

Ouvrez un terminal et exécutez:

```powershell
conda activate claraverse_backend
cd py_backend
pip install -r requirements.txt
```

Attendez que toutes les dépendances soient installées (cela peut prendre 5-10 minutes).

### 2. Démarrer le backend

Dans le même terminal (avec l'environnement activé):

```powershell
python main.py
```

Le backend devrait démarrer sur `http://127.0.0.1:5000`

### 3. Démarrer le frontend

Ouvrez un NOUVEAU terminal PowerShell et exécutez:

```powershell
npm run dev
```

Le frontend devrait démarrer sur `http://localhost:5173`

### 4. Tester Lead Balance

1. Ouvrez votre navigateur sur `http://localhost:5173`
2. Dans le chat, tapez: `Lead_balance`
3. Une table devrait apparaître
4. Le dialogue de sélection de fichier devrait s'ouvrir automatiquement
5. Sélectionnez le fichier: `py_backend/P000 -BALANCE DEMO.xls`
6. Les résultats devraient s'afficher

## 🐛 PROBLÈMES CONNUS

### Problème 1: Le dialogue ne s'ouvre pas automatiquement

**Cause**: Le script `LeadBalanceAutoTrigger.js` n'est peut-être pas chargé correctement.

**Solution**: Ouvrez la console du navigateur (F12) et tapez:
```javascript
LeadBalanceAutoTrigger.version
```

Si vous voyez "3.0.0", le script est chargé. Sinon, rafraîchissez la page (F5).

### Problème 2: Erreur "Failed to fetch"

**Cause**: Le backend Python n'est pas démarré ou n'est pas accessible.

**Solution**:
1. Vérifiez que le backend tourne: `http://127.0.0.1:5000/health`
2. Vérifiez les logs du backend dans le terminal
3. Redémarrez le backend si nécessaire

### Problème 3: Le fichier de test ne fonctionne pas

**Cause**: Le fichier `P000 -BALANCE DEMO.xls` n'a peut-être pas le bon format.

**Solution**: Utilisez un fichier Excel avec 2 onglets contenant:
- Colonnes: Compte, Libellé, Débit, Crédit
- Un onglet pour l'année N
- Un onglet pour l'année N-1

## 📚 DOCUMENTATION

- **Architecture**: `Doc_Lead_Balance/README_ARCHITECTURE_FINALE.md`
- **Tests**: `Doc_Lead_Balance/TEST_INTEGRATION_COMPLETE.md`
- **Quick Start**: `Doc_Lead_Balance/QUICK_START.md`

## 🔧 COMMANDES UTILES

### Conda

```powershell
# Activer l'environnement
conda activate claraverse_backend

# Désactiver l'environnement
conda deactivate

# Lister les environnements
conda env list

# Supprimer l'environnement
conda env remove -n claraverse_backend
```

### Backend

```powershell
# Démarrer
conda activate claraverse_backend
cd py_backend
python main.py

# Vérifier la santé
curl http://127.0.0.1:5000/health
```

### Frontend

```powershell
# Démarrer
npm run dev

# Build
npm run build
```

## ✅ CHECKLIST

Avant de tester Lead Balance:

- [ ] Environnement conda créé
- [ ] Dépendances installées
- [ ] Backend démarré (port 5000)
- [ ] Frontend démarré (port 5173)
- [ ] Navigateur ouvert sur localhost:5173
- [ ] Fichier Excel de test disponible

---

**Version**: 1.0.0  
**Date**: 2026-03-22  
**Statut**: Environnement conda créé, installation en cours
