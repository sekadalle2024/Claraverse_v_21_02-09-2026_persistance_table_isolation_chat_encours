# Précautions Importantes - Repository Backend

**Dernière mise à jour**: 23 Avril 2026 - Version 3.0.0 (NOUVELLE PROCÉDURE)

## 🚀 NOUVEAUTÉ VERSION 3.0.0
Une nouvelle procédure simplifiée et sécurisée est disponible. 
**IL EST FORTEMENT RECOMMANDÉ d'utiliser cette version pour éviter de modifier le remote du projet global.**

- **Procédure**: [Documentation/PROCEDURE_ACTUALISEE_V3.md](PROCEDURE_ACTUALISEE_V3.md)
- **Script**: `Doc backend github\Scripts\push-backend-to-github-V3.ps1`

---

## 📋 NOUVEAUTÉS VERSION 2.0.0 (Ancienne)

### Script Amélioré Disponible

Un nouveau script amélioré est disponible : `push-backend-to-github-improved.ps1`

**Améliorations** :
- ✅ Vérification automatique des fichiers critiques (main.py, endpoint_editeur.py, requirements.txt)
- ✅ Validation avant push avec résumé détaillé
- ✅ Logs colorés et structurés
- ✅ Gestion d'erreurs robuste avec restauration automatique
- ✅ Confirmation utilisateur obligatoire
- ✅ Vérification finale complète

**Utilisation** :
```powershell
.\Doc backend github\Scripts\push-backend-to-github-improved.ps1
```

## ⚠️ AVERTISSEMENTS CRITIQUES

### 1. 🔴 Push avec --force

**DANGER** : Le script utilise `git push --force`

```powershell
git push -u origin master --force
```

**Conséquences** :
- ✅ Écrase la version distante
- ✅ Version locale devient la référence
- ⚠️ Perte des commits distants non présents en local

**Justification** :
- Version locale mise à jour quotidiennement
- Version locale toujours prioritaire
- Plusieurs sauvegardes déjà effectuées avec succès

**Précaution** :
- ✅ Toujours vérifier l'état local avant push
- ✅ S'assurer que les modifications locales sont correctes
- ✅ Utiliser le script de vérification avant push

### 2. 🟡 Changement de Remote

**ATTENTION** : Le remote est changé temporairement

```powershell
# Sauvegarde
$currentRemote = git remote get-url origin

# Changement
git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git

# ... push ...

# Restauration
git remote set-url origin $currentRemote
```

**Risques** :
- ⚠️ Si le script est interrompu, le remote reste changé
- ⚠️ Commits suivants iraient vers le mauvais repository

**Protection** :
- ✅ Script de restauration disponible
- ✅ Vérification du remote après chaque opération
- ✅ Message de confirmation à l'utilisateur

### 3. 🟢 Dossier py_backend/ Uniquement

**IMPORTANT** : Seul le dossier `py_backend/` est poussé

```powershell
git add py_backend/
```

**Implications** :
- ✅ Autres dossiers ignorés
- ✅ Taille du repository backend réduite
- ⚠️ Modifications hors py_backend/ non sauvegardées dans ce repo

**Fichiers Critiques Vérifiés** :
- ✅ `py_backend/main.py` - Point d'entrée FastAPI
- ✅ `py_backend/endpoint_editeur.py` - Endpoint de test switch backend
- ✅ `py_backend/requirements.txt` - Dépendances Python
- ✅ Tous les autres fichiers .py du backend

**Vérification** :
```powershell
git status py_backend/
```

### 4. 🆕 Fichiers Nouveaux à Surveiller

**endpoint_editeur.py** :
- Fichier créé le 20 Avril 2026
- Endpoint de test pour switch backend localhost/cloud
- Doit TOUJOURS être inclus dans les sauvegardes
- Vérification automatique dans le script amélioré

## 🛡️ Mesures de Sécurité

### Avant Chaque Push

1. **Vérifier l'État Local**
   ```powershell
   git status
   git status py_backend/
   ```

2. **Vérifier les Fichiers Critiques**
   ```powershell
   # Vérifier que endpoint_editeur.py existe
   Test-Path py_backend/endpoint_editeur.py
   
   # Vérifier que main.py existe
   Test-Path py_backend/main.py
   
   # Vérifier requirements.txt
   Test-Path py_backend/requirements.txt
   ```

3. **Vérifier le Remote Actuel**
   ```powershell
   git remote -v
   ```

4. **Vérifier la Branche**
   ```powershell
   git branch
   ```

### Utilisation du Script Amélioré (RECOMMANDÉ)

Le script amélioré effectue TOUTES ces vérifications automatiquement :

```powershell
.\Doc backend github\Scripts\push-backend-to-github-improved.ps1
```

**Avantages** :
- ✅ Vérification automatique des fichiers critiques
- ✅ Confirmation obligatoire avant push
- ✅ Logs détaillés et colorés
- ✅ Restauration automatique en cas d'erreur
- ✅ Résumé complet de l'opération

### Pendant le Push

1. **Confirmation Utilisateur**
   - Le script demande confirmation avant `--force`
   - Lire attentivement le message
   - Répondre "o" seulement si sûr

2. **Surveillance des Messages**
   - Vérifier les messages de succès
   - Noter les erreurs éventuelles
   - Vérifier "Everything up-to-date" ou "Branch 'master' set up to track"

### Après le Push

1. **Vérifier le Remote Restauré**
   ```powershell
   git remote -v
   # Doit afficher le repo principal
   ```

2. **Vérifier sur GitHub**
   - Aller sur https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
   - Vérifier que les fichiers sont à jour
   - Vérifier la date du dernier commit

## 🚫 Erreurs à Éviter

### 1. Ne PAS Interrompre le Script

❌ **MAUVAIS** : Ctrl+C pendant l'exécution
```
Script en cours...
^C  ← NE PAS FAIRE
```

✅ **BON** : Laisser le script terminer
```
Script en cours...
✓ Push réussi!
✓ Remote restauré
```

**Si Interrompu** :
```powershell
# Restaurer manuellement le remote
.\Doc backend github\Scripts\restaurer-remote-original.ps1
```

### 2. Ne PAS Modifier Manuellement le Remote

❌ **MAUVAIS** : Changer le remote manuellement
```powershell
git remote set-url origin [autre-url]  # NE PAS FAIRE
```

✅ **BON** : Utiliser le script
```powershell
.\Doc backend github\Scripts\push-backend-to-github.ps1
```

### 3. Ne PAS Pusher Sans Vérification

❌ **MAUVAIS** : Push direct sans vérification
```powershell
git push --force  # NE PAS FAIRE
```

✅ **BON** : Utiliser le script avec vérifications
```powershell
.\Doc backend github\Scripts\verifier-etat-backend.ps1
.\Doc backend github\Scripts\push-backend-to-github.ps1
```

## 🔧 Procédures de Récupération

### Si le Remote N'est Pas Restauré

```powershell
# 1. Vérifier le remote actuel
git remote -v

# 2. Si c'est le repo backend, restaurer
git remote set-url origin https://github.com/sekadalle2024/Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public.git

# 3. Vérifier
git remote -v
```

### Si le Push Échoue

```powershell
# 1. Vérifier l'état
git status

# 2. Vérifier la connexion
git remote -v

# 3. Vérifier les credentials
# S'assurer d'être authentifié sur GitHub

# 4. Réessayer
.\Doc backend github\Scripts\push-backend-to-github.ps1
```

### Si Conflit de Versions

```powershell
# La version locale est prioritaire
# Le --force écrase la version distante
# C'est le comportement attendu

# Si besoin de récupérer la version distante d'abord :
git fetch origin
git log origin/master  # Voir les commits distants
# Puis décider si merge ou force push
```

## 📋 Checklist de Sécurité

Avant chaque sauvegarde backend :

- [ ] Vérifier que py_backend/ contient les dernières modifications
- [ ] Vérifier qu'aucun fichier sensible n'est inclus
- [ ] Vérifier le remote actuel (doit être le repo principal)
- [ ] Lancer le script de vérification
- [ ] Lire attentivement les messages du script
- [ ] Confirmer le push seulement si tout est correct
- [ ] Vérifier le remote après le push (doit être restauré)
- [ ] Vérifier sur GitHub que les fichiers sont à jour

## 🆘 En Cas de Problème

1. **Ne pas paniquer**
2. **Noter l'erreur exacte**
3. **Consulter TROUBLESHOOTING.md**
4. **Utiliser les scripts de récupération**
5. **Vérifier l'état avec `git status` et `git remote -v`**

## 📞 Support

En cas de problème persistant :
1. Consulter `Documentation/TROUBLESHOOTING.md`
2. Vérifier les logs Git
3. Restaurer le remote si nécessaire
4. Recommencer avec le script de vérification

## 🔒 Bonnes Pratiques

1. **Toujours utiliser les scripts fournis**
2. **Ne jamais modifier Git manuellement pour ce workflow**
3. **Vérifier avant et après chaque opération**
4. **Garder une copie locale de sauvegarde**
5. **Documenter les modifications importantes**

---

**Date de dernière mise à jour** : 20 avril 2026
**Version** : 2.0.0

**Changements Version 2.0.0** :
- ✅ Ajout du script amélioré `push-backend-to-github-improved.ps1`
- ✅ Vérification automatique des fichiers critiques
- ✅ Ajout de endpoint_editeur.py dans les fichiers surveillés
- ✅ Amélioration de la gestion d'erreurs
- ✅ Logs détaillés et colorés
- ✅ Confirmation obligatoire avant push
