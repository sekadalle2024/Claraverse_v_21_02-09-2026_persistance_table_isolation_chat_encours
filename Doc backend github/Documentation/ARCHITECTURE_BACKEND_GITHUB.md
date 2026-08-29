# Architecture Repository Backend GitHub

## 📐 Vue d'Ensemble

Le projet Claraverse utilise une architecture à **deux repositories** pour séparer le backend Python du reste du projet.

## 🏗️ Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJET LOCAL (PC)                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   src/       │  │   public/    │  │  py_backend/ │    │
│  │  (React)     │  │   (Assets)   │  │   (Python)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                              │              │
│  ┌──────────────┐  ┌──────────────┐        │              │
│  │ Doc menu/    │  │  Autres...   │        │              │
│  └──────────────┘  └──────────────┘        │              │
└─────────────────────────────────────────────┼──────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
                    ▼                                                   ▼
        ┌───────────────────────┐                         ┌───────────────────────┐
        │  GITHUB REPOSITORY    │                         │  GITHUB REPOSITORY    │
        │   (Principal)         │                         │    (Backend)          │
        │                       │                         │                       │
        │  Claverse_windows     │                         │  Back-end-python      │
        │  Projet COMPLET       │                         │  py_backend/ SEUL     │
        └───────────────────────┘                         └───────────────────────┘
```

## 🎯 Raison de la Séparation

### Avantages

1. **Isolation du Backend**
   - Déploiement indépendant possible
   - Historique de versions séparé
   - Gestion des dépendances Python isolée

2. **Sauvegardes Ciblées**
   - Sauvegardes fréquentes du backend sans impacter le frontend
   - Commits plus petits et ciblés
   - Historique plus clair

3. **Collaboration**
   - Équipe backend peut travailler indépendamment
   - Moins de conflits Git
   - Reviews de code plus focalisées

### Inconvénients Gérés

1. **Gestion de Deux Remotes**
   - ✅ Résolu par script automatique
   - ✅ Sauvegarde/restauration du remote

2. **Synchronisation**
   - ✅ Version locale toujours prioritaire
   - ✅ Push avec `--force` documenté

## 📁 Contenu des Repositories

### Repository Principal (Claverse_windows)

```
Claverse_windows/
├─ src/                    ← Code React/TypeScript
├─ public/                 ← Assets publics
├─ py_backend/             ← Backend Python (aussi dans repo backend)
├─ Doc menu demarrer/      ← Documentation menu
├─ Doc_Etat_Fin/          ← Documentation états financiers
├─ deploiement-netlify/   ← Scripts déploiement
├─ index.html
├─ package.json
├─ vite.config.ts
└─ ... (autres fichiers projet)
```

### Repository Backend (Back-end-python-V0_03_03_2026)

```
Back-end-python-V0_03_03_2026/
└─ py_backend/             ← UNIQUEMENT ce dossier
   ├─ main.py
   ├─ requirements.txt
   ├─ Dockerfile
   ├─ etats_financiers.py
   ├─ export_liasse.py
   ├─ Doc calcul notes annexes/
   └─ ... (tous les fichiers backend)
```

## 🔄 Workflow de Synchronisation

### 1. Développement Local

```
Développeur travaille sur py_backend/
         ↓
Modifications en local
         ↓
Tests et validation
```

### 2. Sauvegarde Backend

```
Script push-backend-to-github.ps1
         ↓
1. Sauvegarde remote actuel
         ↓
2. Change remote → Backend repo
         ↓
3. git add py_backend/
         ↓
4. git commit -m "Sauvegarde Backend - [date]"
         ↓
5. git push --force origin master
         ↓
6. Restaure remote original
```

### 3. Sauvegarde Projet Complet

```
Sauvegarde normale du projet
         ↓
git add .
         ↓
git commit -m "Message"
         ↓
git push origin master
         ↓
(Inclut py_backend/ dans le repo principal)
```

## ⚙️ Configuration Git

### Remote Principal

```bash
git remote -v
# origin  https://github.com/sekadalle2024/Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public.git
```

### Remote Backend (Temporaire)

```bash
# Changé temporairement par le script
git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
# ... push ...
# Puis restauré
```

## 🔐 Gestion des Branches

### Repository Principal
- `master` : Branche principale
- Autres branches selon besoin

### Repository Backend
- `master` : Branche principale (synchronisée avec py_backend/ local)

## 📊 Historique des Commits

### Repository Principal
- Commits du projet complet
- Inclut frontend, backend, docs, etc.

### Repository Backend
- Commits uniquement du backend
- Messages format : "Sauvegarde Backend Python - [date]"
- Historique plus ciblé et lisible

## 🚨 Points d'Attention

1. **Pas de Sous-Module Git**
   - py_backend/ n'est PAS un sous-module
   - C'est un dossier normal dupliqué dans deux repos

2. **Synchronisation Manuelle**
   - Pas de synchronisation automatique
   - Développeur décide quand sauvegarder

3. **Version Locale Prioritaire**
   - Push avec `--force` écrase la version distante
   - Justifié car mises à jour quotidiennes en local

## 📈 Évolution Future

### Possibilités

1. **CI/CD Séparé**
   - Pipeline de déploiement backend indépendant
   - Tests automatiques sur le repo backend

2. **Versioning Sémantique**
   - Tags de version sur le repo backend
   - Releases indépendantes

3. **Documentation API**
   - Documentation API générée automatiquement
   - Hébergée depuis le repo backend

## 🔗 Références

- Repository Backend : https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
- Repository Principal : https://github.com/sekadalle2024/Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public.git
