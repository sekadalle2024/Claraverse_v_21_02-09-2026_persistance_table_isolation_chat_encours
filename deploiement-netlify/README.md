# 📦 Dossier de Déploiement Netlify

## 🎯 Objectif

Ce dossier contient tous les scripts et la documentation nécessaires pour déployer rapidement et efficacement l'application ClaraVerse sur Netlify.

## 📁 Contenu du Dossier

### Scripts de Déploiement

1. **`deploy.ps1`** ⭐ (Recommandé)
   - Script complet : build + déploiement
   - Vérifications automatiques
   - Gestion des erreurs
   - **Site ID pré-configuré : prclaravi**
   - **Aucune interaction requise**

2. **`deploy-auto.ps1`** 🤖 (Nouveau)
   - Version alternative 100% automatique
   - Utilise le site ID directement
   - Pas de demande de login ou nom de projet

3. **`../DEPLOYER_NETLIFY.bat`** 🚀 (One-Click)
   - Situé à la racine du projet
   - Lance le déploiement complet en un seul clic
   - Idéal pour les mises à jour récurrentes

4. **`deploy-rapide.ps1`**
   - Déploiement rapide (sans rebuild)
   - Utilise le dossier dist/ existant

5. **`build-only.ps1`**
   - Build uniquement (sans déploiement)
   - Utile pour tester le build

6. **`verifier-config.ps1`**
   - Vérifie la configuration Netlify
   - Teste l'authentification

### Documentation

1. **`GUIDE_DEPLOIEMENT_AUTO.md`** 🆕 (Nouveau)
   - Guide du déploiement automatique
   - Explications sur les scripts sans interaction
   - Configuration du site ID

2. **`MEMO_PROBLEMES_SOLUTIONS.md`** 📝
   - Liste des problèmes rencontrés
   - Solutions détaillées
   - Conseils de dépannage

3. **`GUIDE_UTILISATION.md`**
   - Guide d'utilisation des scripts
   - Workflow recommandé
   - Commandes utiles

4. **`HISTORIQUE_DEPLOIEMENTS.md`**
   - Journal des déploiements
   - Modifications apportées
   - Notes importantes

## 🚀 Utilisation Rapide

### Déploiement UN CLIC (Le plus simple)

Double-cliquez sur `DEPLOYER_NETLIFY.bat` à la racine du projet.

### Déploiement Automatique (Recommandé)

```powershell
cd deploiement-netlify
.\deploy.ps1
```

Avec message personnalisé :
```powershell
.\deploy.ps1 -Message "Ajout nouvelle fonctionnalite"
```

**Avantages** :
- ✅ Aucune interaction requise
- ✅ Site ID pré-configuré (prclaravi)
- ✅ Pas de demande de login ou nom de projet

### Déploiement Rapide (Build déjà fait)

```powershell
cd deploiement-netlify
.\deploy-rapide.ps1
```

### Build Uniquement

```powershell
cd deploiement-netlify
.\build-only.ps1
```

## 📊 Informations du Site

- **Nom** : prclaravi
- **URL** : https://prclaravi.netlify.app
- **Dashboard** : https://app.netlify.com/projects/prclaravi
- **Compte** : ohada.finance@gmail.com (Team SEKA)
- **Configuration** : `.netlify/state.json` (automatique)

## ⚙️ Configuration

La configuration Netlify se trouve dans :
- `../netlify.toml` (racine du projet)
- `../.netlify-ignore` (fichiers exclus)

## 📝 Workflow Recommandé

1. **Développement**
   ```bash
   npm run dev
   ```

2. **Tests locaux**
   - Vérifier les fonctionnalités

3. **Build et déploiement**
   ```powershell
   cd deploiement-netlify
   .\deploy.ps1
   ```

4. **Vérification**
   - Tester sur https://prclaravi.netlify.app

## 🔍 Dépannage

Consultez `MEMO_PROBLEMES_SOLUTIONS.md` pour :
- Erreurs courantes
- Solutions testées
- Conseils de dépannage

## 📞 Support

- **Documentation Netlify** : https://docs.netlify.com/
- **CLI Reference** : https://cli.netlify.com/
- **Community** : https://answers.netlify.com/

---

**Version** : 1.0  
**Dernière mise à jour** : Mars 2026
