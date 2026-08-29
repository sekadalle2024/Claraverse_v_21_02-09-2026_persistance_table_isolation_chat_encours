# Procédure de Déploiement Actualisée - Version V4 (23 Avril 2026)

## 🎯 Objectif
Sauvegarder le backend Python de manière **isolée** et **propre** sur le nouveau repository GitHub dédié (V4).

- **URL Repository**: `https://github.com/sekadalle2024/Back-end-python-V4_23_04_2026--tree-master.git`
- **Fréquence**: À chaque modification majeure du backend ou avant un déploiement Zeabur.

---

## 🛠️ Script Recommandé
Utilisez le nouveau script automatisé qui gère l'isolation du dépôt :
```powershell
.\Doc backend github\Scripts\push-backend-to-github-V4.ps1
```

### Pourquoi utiliser cette version ?
1.  **Isolation Totale** : Le script entre dans `py_backend/` pour pousser uniquement son contenu. Le repository GitHub distant contiendra le code à sa racine (prêt pour le cloud).
2.  **Sécurité du Projet Global** : Le remote `origin` du dossier racine `ClaraVerse` n'est **jamais** modifié. Vous gardez votre connexion au repo principal intacte.
3.  **Vérification Automatique** : Le script vérifie la présence de `main.py`, `endpoint_editeur.py` et `requirements.txt` avant de continuer.

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
git commit -m "Sauvegarde Backend Python - Version V4_23_04_2026"
```

### 3. Configurer le Remote (Une seule fois)
```powershell
# Vérifier si origin existe déjà dans ce dossier
git remote -v

# Mise à jour du remote origin :
git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V4_23_04_2026--tree-master.git
```

### 4. Envoyer vers GitHub
```powershell
git push -u origin master --force
```

---

## ⚠️ Précautions DevOps
- **Force Push** : Le script utilise `--force`. Cela garantit que votre version locale (votre poste de travail) est la référence absolue. Cela écrasera toute modification faite directement sur GitHub.
- **Fichiers Exclus** : Le `.gitignore` local exclut automatiquement les fichiers `.xlsx` et `.pdf` volumineux pour éviter de saturer le repository.
- **Vérification** : Après chaque push, vérifiez la mise à jour sur : [GitHub Backend V4](https://github.com/sekadalle2024/Back-end-python-V4_23_04_2026--tree-master.git)
