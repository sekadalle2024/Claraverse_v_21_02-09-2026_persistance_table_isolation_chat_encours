# Procédure de Déploiement Actualisée - Version V3 (23 Avril 2026)

## 🎯 Objectif
Sauvegarder le backend Python de manière **isolée** et **propre** sur le nouveau repository GitHub dédié.

- **URL Repository**: `https://github.com/sekadalle2024/Back-end-python-V3_23_04_2026-.git`
- **Fréquence**: À chaque modification majeure du backend ou avant un déploiement Zeabur.

---

## 🛠️ Scripts Recommandés

### Option 1 : Script Simplifié (Recommandé)
**Le plus fiable - Pas de problèmes d'encodage**
```powershell
.\Doc` backend` github\Scripts\push-backend-to-github-V3-SIMPLIFIE.ps1
```

### Option 2 : Script Original V3
```powershell
.\Doc` backend` github\Scripts\push-backend-to-github-V3.ps1
```

> **💡 Recommandation** : Utilisez le script **SIMPLIFIE** qui évite tous les problèmes d'encodage PowerShell grâce à l'absence de caractères spéciaux.

### Pourquoi utiliser le Script Simplifié ?
1. **Sans Caractères Spéciaux** : Aucun accent, aucun problème d'encodage PowerShell
2. **Isolation Totale** : Le script entre dans `py_backend/` pour pousser uniquement son contenu. Le repository GitHub distant contiendra le code à sa racine (prêt pour le cloud).
3. **Sécurité du Projet Global** : Le remote `origin` du dossier racine `ClaraVerse` n'est **jamais** modifié. Vous gardez votre connexion au repo principal intacte.
4. **Vérification Automatique** : Le script vérifie la présence de `main.py`, `endpoint_editeur.py` et `requirements.txt` avant de continuer.
5. **Fiabilité Maximale** : Fonctionne sur tous les systèmes Windows sans configuration spéciale.

---

## 📖 Procédure Manuelle (Si nécessaire)
Si vous préférez exécuter les commandes manuellement, suivez ces étapes exactes :

### 1. Entrer dans le dossier backend
```powershell
cd py_backend
```

### 2. Ajouter et Committer les changements
```powershell
git add .
git commit -m "Sauvegarde Backend Python - Version V3_23_04_2026"
```

### 3. Configurer le Remote (Une seule fois)
```powershell
# Vérifier si origin existe déjà dans ce dossier
git remote -v

# Si origin n'existe pas ou pointe sur HuggingFace :
git remote add origin https://github.com/sekadalle2024/Back-end-python-V3_23_04_2026-.git

# Si origin existe déjà mais pointe sur l'ancien repo :
git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V3_23_04_2026-.git
```

### 4. Envoyer vers GitHub
```powershell
git push -u origin master --force
```

---

## ⚠️ Précautions DevOps
- **Force Push** : Le script utilise `--force`. Cela garantit que votre version locale (votre poste de travail) est la référence absolue. Cela écrasera toute modification faite directement sur GitHub.
- **Fichiers Exclus** : Le `.gitignore` local exclut automatiquement les fichiers `.xlsx` et `.pdf` volumineux pour éviter de saturer le repository.
- **Vérification** : Après chaque push, vérifiez la mise à jour sur : [GitHub Backend V3](https://github.com/sekadalle2024/Back-end-python-V3_23_04_2026-.git)
