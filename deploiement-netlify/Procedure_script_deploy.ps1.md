# PROCÉDURE COMPLÈTE : Script deploy.ps1
## Guide pour Agent LLM - Déploiement Netlify ClaraVerse

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis et Installation](#prérequis-et-installation)
3. [Configuration du Projet](#configuration-du-projet)
4. [Utilisation du Script](#utilisation-du-script)
5. [Paramètres Intégrés](#paramètres-intégrés)
6. [Fichiers de Configuration](#fichiers-de-configuration)
7. [Problèmes Courants et Solutions](#problèmes-courants-et-solutions)
8. [Commandes Utiles](#commandes-utiles)
9. [Workflow Complet](#workflow-complet)
10. [Checklist de Vérification](#checklist-de-vérification)

---

## 🎯 VUE D'ENSEMBLE

### Objectif
Le script `deploy.ps1` automatise le déploiement complet de l'application ClaraVerse sur Netlify sans aucune interaction manuelle requise.

### Fonctionnalités
- ✅ Build automatique de production
- ✅ Vérifications préliminaires (Node.js, Netlify CLI, authentification)
- ✅ Nettoyage automatique du dossier dist
- ✅ Déploiement direct vers le site prclaravi
- ✅ Enregistrement automatique dans l'historique
- ✅ Gestion des erreurs avec messages explicites

### Durée Estimée
- Build : 2-3 minutes
- Upload : 5-8 minutes
- **Total : ~10 minutes**

---

## 🔧 PRÉREQUIS ET INSTALLATION

### 1. Node.js

**Version requise** : 18.14.0 ou supérieure

**Vérifier l'installation** :
```powershell
node --version
```

**Installer si nécessaire** :
- Télécharger depuis https://nodejs.org/
- Choisir la version LTS (Long Term Support)
- Redémarrer le terminal après installation

### 2. Netlify CLI

**Version recommandée** : 17.0.0 ou supérieure

**Installation globale** :
```powershell
npm install -g netlify-cli
```

**Vérifier l'installation** :
```powershell
netlify --version
```

**Mise à jour si nécessaire** :
```powershell
npm update -g netlify-cli
```

### 3. Authentification Netlify

**Première fois uniquement** :
```powershell
netlify login
```

Cette commande :
- Ouvre un navigateur
- Demande de se connecter à Netlify
- Enregistre le token d'authentification localement
- **N'a besoin d'être exécutée qu'une seule fois**

**Vérifier l'authentification** :
```powershell
netlify status
```

Résultat attendu :
```
Current Netlify User
────────────────────────────────────────────
Name:  [Votre nom]
Email: ohada.finance@gmail.com
Teams:
  SEKA
```

---

## ⚙️ CONFIGURATION DU PROJET

### Informations du Projet

| Paramètre | Valeur |
|-----------|--------|
| **Nom du site** | prclaravi |
| **Site ID** | 0cafe68b-1d02-42c0-a757-5ce59fb99d42 |
| **URL de production** | https://prclaravi.netlify.app |
| **Dashboard** | https://app.netlify.com/projects/prclaravi |
| **Compte** | ohada.finance@gmail.com |
| **Team** | SEKA |

### Fichiers de Configuration Liés

#### 1. `.netlify/state.json` (Racine du projet)
```json
{
  "siteId": "0cafe68b-1d02-42c0-a757-5ce59fb99d42"
}
```
**Rôle** : Lie automatiquement le projet local au site Netlify

#### 2. `netlify.toml` (Racine du projet)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```
**Rôle** : Configuration du build sur Netlify

#### 3. `package.json` (Racine du projet)
```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  }
}
```
**Rôle** : Définit les commandes de build

#### 4. `.netlify-ignore` (Racine du projet)
Liste des fichiers à exclure du déploiement

---

## 🚀 UTILISATION DU SCRIPT

### Commande de Base

```powershell
cd deploiement-netlify
.\deploy.ps1
```

### Avec Message Personnalisé

```powershell
.\deploy.ps1 -Message "Ajout nouvelle fonctionnalite X"
```

### Exemples de Messages

```powershell
# Correction de bug
.\deploy.ps1 -Message "Correction bug affichage matrices"

# Nouvelle fonctionnalité
.\deploy.ps1 -Message "Ajout module evaluation risques"

# Mise à jour
.\deploy.ps1 -Message "Mise a jour dependances React"

# Déploiement de test
.\deploy.ps1 -Message "Test deploiement automatique"
```

### Sortie Console Attendue

```
========================================
  DEPLOIEMENT COMPLET NETLIFY
========================================

[1/5] Verifications preliminaires...
  Node.js: v18.17.0
  Netlify CLI: netlify-cli/17.10.1
  Authentification: OK

[2/5] Nettoyage...
  Ancien dossier dist supprime

[3/5] Build de production...
  Cela peut prendre 2-3 minutes...
  Build reussi - Taille: 50.4 MB

[4/5] Verifications post-build...
  Fichiers essentiels: OK

[5/5] Deploiement sur Netlify...
  Projet cible: prclaravi
  Upload en cours (5-8 minutes)...

========================================
  DEPLOIEMENT REUSSI !
========================================

Site en ligne: https://prclaravi.netlify.app
Dashboard: https://app.netlify.com/projects/prclaravi

Prochaines etapes:
1. Tester le site en production
2. Verifier les nouvelles fonctionnalites
3. Mettre a jour HISTORIQUE_DEPLOIEMENTS.md
```

---

## 🔑 PARAMÈTRES INTÉGRÉS

### Paramètres du Script

| Paramètre | Type | Valeur par Défaut | Description |
|-----------|------|-------------------|-------------|
| `$Message` | String | "Mise a jour [date]" | Message de déploiement |
| `$SiteId` | String | "prclaravi" | ID du site Netlify (pré-configuré) |

### Paramètres Netlify Deploy

Le script utilise automatiquement :
```powershell
netlify deploy --prod --dir=dist --site=prclaravi --message="$Message"
```

| Flag | Valeur | Description |
|------|--------|-------------|
| `--prod` | - | Déploiement en production (pas de preview) |
| `--dir` | dist | Dossier à déployer |
| `--site` | prclaravi | Site cible (évite les prompts) |
| `--message` | Variable | Message de commit |

### Variables d'Environnement

Le script utilise :
- `$LASTEXITCODE` : Code de sortie de la dernière commande
- Pas besoin de `NETLIFY_AUTH_TOKEN` (utilise la session active)

---

## 📁 FICHIERS DE CONFIGURATION

### Structure des Fichiers

```
ClaraVerse/
├── .netlify/
│   └── state.json              # Configuration du site (auto-généré)
├── deploiement-netlify/
│   ├── deploy.ps1              # Script principal ⭐
│   ├── deploy-auto.ps1         # Script alternatif
│   ├── HISTORIQUE_DEPLOIEMENTS.md  # Journal des déploiements
│   ├── Procedure_script_deploy.ps1.md  # Ce fichier
│   └── MEMO_PROBLEMES_SOLUTIONS.md
├── dist/                       # Dossier de build (généré)
├── netlify.toml                # Config Netlify
├── .netlify-ignore             # Fichiers exclus
└── package.json                # Scripts npm
```

### Fichiers Générés Automatiquement

1. **dist/** : Créé par `npm run build`
2. **.netlify/state.json** : Créé par `netlify link`
3. **HISTORIQUE_DEPLOIEMENTS.md** : Mis à jour par le script

---

## ⚠️ PROBLÈMES COURANTS ET SOLUTIONS

### Problème 1 : "Node.js non installé"

**Erreur** :
```
ERREUR: Node.js non installe
```

**Solution** :
```powershell
# Télécharger et installer Node.js depuis nodejs.org
# Puis redémarrer le terminal
node --version  # Vérifier l'installation
```

---

### Problème 2 : "Netlify CLI non installé"

**Erreur** :
```
ERREUR: Netlify CLI non installe. Executez: npm install -g netlify-cli
```

**Solution** :
```powershell
npm install -g netlify-cli
netlify --version  # Vérifier l'installation
```

---

### Problème 3 : "Non authentifié sur Netlify"

**Erreur** :
```
ERREUR: Non authentifie sur Netlify. Executez: netlify login
```

**Solution** :
```powershell
netlify login
# Suivre les instructions dans le navigateur
netlify status  # Vérifier l'authentification
```

---

### Problème 4 : "Échec du build"

**Erreur** :
```
ERREUR: Echec du build. Verifiez les erreurs ci-dessus
```

**Causes possibles** :
1. Erreurs de syntaxe dans le code
2. Dépendances manquantes
3. Problèmes de mémoire

**Solutions** :
```powershell
# 1. Vérifier les erreurs de compilation
npm run build

# 2. Réinstaller les dépendances
Remove-Item -Recurse -Force node_modules
npm install

# 3. Nettoyer le cache
npm cache clean --force
Remove-Item -Recurse -Force dist
```

---

### Problème 5 : "Dossier dist non créé"

**Erreur** :
```
ERREUR: Dossier dist non cree apres le build
```

**Solution** :
```powershell
# Vérifier le script de build dans package.json
cat package.json | Select-String "build"

# Tester le build manuellement
npm run build

# Vérifier que vite.config.ts est correct
```

---

### Problème 6 : "Fichier essentiel manquant"

**Erreur** :
```
ERREUR: Fichier essentiel manquant: ../dist/index.html
```

**Solution** :
```powershell
# Vérifier la configuration Vite
cat vite.config.ts

# Rebuild complet
Remove-Item -Recurse -Force dist
npm run build
```

---

### Problème 7 : "Échec du déploiement"

**Erreur** :
```
ERREUR: Echec du deploiement. Verifiez les logs ci-dessus
```

**Solutions** :
```powershell
# 1. Vérifier la connexion réseau
Test-NetConnection netlify.com

# 2. Vérifier l'authentification
netlify status

# 3. Vérifier le site ID
cat .netlify/state.json

# 4. Réessayer avec plus de détails
netlify deploy --prod --dir=dist --site=prclaravi --debug
```

---

### Problème 8 : "Site non lié"

**Erreur** :
```
You don't appear to be in a folder that is linked to a project
```

**Solution** :
```powershell
# Lier le projet manuellement
netlify link

# Sélectionner "Search by full or partial project name"
# Entrer : prclaravi
```

---

### Problème 9 : "Taille de déploiement trop grande"

**Avertissement** :
```
Warning: Large deploy size detected
```

**Solution** :
```powershell
# Vérifier la taille
Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum

# Exclure les fichiers inutiles dans .netlify-ignore
# Optimiser les assets (images, fonts)
```

---

### Problème 10 : "Timeout pendant l'upload"

**Erreur** :
```
Error: Upload timeout
```

**Solution** :
```powershell
# Augmenter le timeout
$env:NETLIFY_TIMEOUT = "600000"  # 10 minutes

# Réessayer le déploiement
.\deploy.ps1
```

---

## 🛠️ COMMANDES UTILES

### Vérifications Préliminaires

```powershell
# Vérifier Node.js
node --version

# Vérifier npm
npm --version

# Vérifier Netlify CLI
netlify --version

# Vérifier l'authentification
netlify status

# Vérifier le lien du projet
netlify status --verbose
```

### Gestion du Build

```powershell
# Build local
npm run build

# Build avec nettoyage
Remove-Item -Recurse -Force dist ; npm run build

# Vérifier la taille du build
Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum

# Prévisualiser le build localement
npm run preview
```

### Gestion Netlify

```powershell
# Lister les sites
netlify sites:list

# Informations du site
netlify status

# Lier un projet
netlify link

# Délier un projet
netlify unlink

# Voir les déploiements récents
netlify deploy:list

# Ouvrir le dashboard
netlify open
```

### Déploiement

```powershell
# Déploiement complet (script)
.\deploy.ps1

# Déploiement avec message
.\deploy.ps1 -Message "Description"

# Déploiement manuel (sans script)
netlify deploy --prod --dir=dist --site=prclaravi

# Déploiement en preview (test)
netlify deploy --dir=dist --site=prclaravi

# Déploiement avec debug
netlify deploy --prod --dir=dist --site=prclaravi --debug
```

### Diagnostic

```powershell
# Logs du dernier déploiement
netlify logs

# Informations détaillées
netlify status --verbose

# Tester la connexion
Test-NetConnection netlify.com

# Vérifier les variables d'environnement
netlify env:list
```

### Nettoyage

```powershell
# Nettoyer le dossier dist
Remove-Item -Recurse -Force dist

# Nettoyer node_modules
Remove-Item -Recurse -Force node_modules

# Nettoyer le cache npm
npm cache clean --force

# Réinstaller les dépendances
npm install
```

---

## 📊 WORKFLOW COMPLET

### Workflow Standard

```powershell
# 1. Se placer dans le dossier de déploiement
cd deploiement-netlify

# 2. Exécuter le script
.\deploy.ps1 -Message "Description des changements"

# 3. Attendre la fin du déploiement (~10 minutes)

# 4. Vérifier le site en production
# Ouvrir https://prclaravi.netlify.app dans un navigateur

# 5. Consulter l'historique
cat HISTORIQUE_DEPLOIEMENTS.md
```

### Workflow avec Vérifications

```powershell
# 1. Vérifier les prérequis
node --version
netlify --version
netlify status

# 2. Tester le build localement
cd ..
npm run build
npm run preview  # Tester sur http://localhost:4173

# 3. Déployer
cd deploiement-netlify
.\deploy.ps1 -Message "Description"

# 4. Vérifier le déploiement
netlify open  # Ouvre le dashboard
```

### Workflow en Cas d'Erreur

```powershell
# 1. Nettoyer complètement
Remove-Item -Recurse -Force dist
Remove-Item -Recurse -Force node_modules

# 2. Réinstaller
npm install

# 3. Tester le build
npm run build

# 4. Vérifier le contenu de dist
Get-ChildItem -Path dist -Recurse

# 5. Réessayer le déploiement
cd deploiement-netlify
.\deploy.ps1 -Message "Redeploiement apres correction"
```

---

## ✅ CHECKLIST DE VÉRIFICATION

### Avant le Déploiement

- [ ] Node.js installé (v18.14.0+)
- [ ] Netlify CLI installé (v17.0.0+)
- [ ] Authentifié sur Netlify (`netlify status`)
- [ ] Projet lié (`cat .netlify/state.json`)
- [ ] Code testé localement
- [ ] Pas d'erreurs de compilation
- [ ] Dépendances à jour

### Pendant le Déploiement

- [ ] Script démarre sans erreur
- [ ] Build réussit (étape 3/5)
- [ ] Fichiers essentiels présents (étape 4/5)
- [ ] Upload démarre (étape 5/5)
- [ ] Pas de timeout

### Après le Déploiement

- [ ] Message de succès affiché
- [ ] Site accessible : https://prclaravi.netlify.app
- [ ] Nouvelles fonctionnalités visibles
- [ ] Pas d'erreurs console (F12)
- [ ] Historique mis à jour
- [ ] Dashboard Netlify à jour

---

## 🎓 CONSEILS POUR AGENT LLM

### Quand Utiliser ce Script

✅ **Utiliser le script quand** :
- L'utilisateur demande un déploiement
- Des modifications ont été apportées au code
- Une nouvelle fonctionnalité est prête
- Un bug a été corrigé

❌ **Ne PAS utiliser le script quand** :
- Le code n'a pas été testé
- Il y a des erreurs de compilation
- Les dépendances sont cassées
- Le build local échoue

### Ordre des Opérations

1. **Toujours vérifier les prérequis d'abord**
2. **Tester le build localement avant de déployer**
3. **Utiliser un message descriptif**
4. **Attendre la fin complète du déploiement**
5. **Vérifier le site en production**

### Messages d'Erreur à Surveiller

- "Node.js non installé" → Installer Node.js
- "Netlify CLI non installé" → Installer avec npm
- "Non authentifié" → Exécuter `netlify login`
- "Échec du build" → Vérifier les erreurs de code
- "Fichier manquant" → Vérifier la config Vite

### Bonnes Pratiques

1. **Toujours inclure un message descriptif**
2. **Ne jamais interrompre le déploiement en cours**
3. **Vérifier le site après chaque déploiement**
4. **Consulter l'historique régulièrement**
5. **Nettoyer dist/ en cas de problème**

---

## 📞 SUPPORT ET RESSOURCES

### Documentation Officielle

- **Netlify CLI** : https://cli.netlify.com/
- **Netlify Docs** : https://docs.netlify.com/
- **Node.js** : https://nodejs.org/docs/

### Fichiers de Référence Locaux

- `MEMO_PROBLEMES_SOLUTIONS.md` : Solutions aux problèmes courants
- `GUIDE_DEPLOIEMENT_AUTO.md` : Guide du déploiement automatique
- `AMELIORATION_DEPLOIEMENT_AUTO.md` : Historique des améliorations
- `README.md` : Documentation générale

### Commandes de Diagnostic Rapide

```powershell
# Diagnostic complet en une commande
Write-Host "Node.js:" (node --version)
Write-Host "npm:" (npm --version)
Write-Host "Netlify CLI:" (netlify --version)
netlify status
cat .netlify/state.json
```

---

## 📝 NOTES IMPORTANTES

1. **Le script est 100% automatique** - Aucune interaction requise une fois lancé
2. **Le site ID est pré-configuré** - Pas besoin de le spécifier
3. **L'authentification persiste** - `netlify login` n'est nécessaire qu'une fois
4. **Le build prend du temps** - Ne pas interrompre le processus
5. **L'historique est automatique** - Chaque déploiement est enregistré

---

**Version** : 1.0  
**Date** : 3 avril 2026  
**Projet** : ClaraVerse  
**Site** : prclaravi (https://prclaravi.netlify.app)
