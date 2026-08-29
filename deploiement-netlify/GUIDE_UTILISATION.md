# 📖 Guide d'Utilisation - Scripts de Déploiement Netlify

## 🎯 Vue d'Ensemble

Ce dossier contient tous les outils nécessaires pour déployer efficacement ClaraVerse sur Netlify. Chaque script a un rôle spécifique selon vos besoins.

## 🚀 Scripts Disponibles

### 1. `deploy.ps1` ⭐ (Recommandé)

**Usage :** Déploiement complet avec build automatique

```powershell
.\deploy.ps1
# ou avec un message personnalisé
.\deploy.ps1 -Message "Ajout nouvelles fonctionnalites E-audit"
```

**Ce qu'il fait :**
- ✅ Vérifie la configuration
- ✅ Nettoie l'ancien build
- ✅ Effectue un nouveau build
- ✅ Vérifie le build
- ✅ Déploie sur Netlify
- ✅ Enregistre dans l'historique

**Durée :** 8-12 minutes  
**Quand l'utiliser :** Après des modifications du code

---

### 2. `deploy-rapide.ps1` ⚡

**Usage :** Déploiement rapide sans rebuild

```powershell
.\deploy-rapide.ps1
# ou avec un message personnalisé
.\deploy-rapide.ps1 -Message "Correction mineure"
```

**Ce qu'il fait :**
- ✅ Vérifie que dist/ existe
- ✅ Vérifie le contenu
- ✅ Déploie directement
- ✅ Enregistre dans l'historique

**Durée :** 3-5 minutes  
**Quand l'utiliser :** Quand le build est déjà fait et récent

---

### 3. `build-only.ps1` 🔨

**Usage :** Build uniquement, sans déploiement

```powershell
.\build-only.ps1
```

**Ce qu'il fait :**
- ✅ Nettoie l'ancien build
- ✅ Effectue un nouveau build
- ✅ Affiche les statistiques
- ✅ Enregistre dans l'historique

**Durée :** 2-4 minutes  
**Quand l'utiliser :** Pour tester le build ou préparer un déploiement rapide

---

### 4. `verifier-config.ps1` 🔍

**Usage :** Vérification complète de la configuration

```powershell
.\verifier-config.ps1
```

**Ce qu'il fait :**
- ✅ Vérifie les outils (Node.js, npm, Netlify CLI)
- ✅ Vérifie l'authentification
- ✅ Vérifie les fichiers de configuration
- ✅ Vérifie l'environnement
- ✅ Teste la connectivité

**Durée :** 30 secondes  
**Quand l'utiliser :** En cas de problème ou avant le premier déploiement

---

## 📋 Workflow Recommandé

### Workflow Standard (Modifications importantes)

```powershell
# 1. Aller dans le dossier de déploiement
cd deploiement-netlify

# 2. Vérifier la configuration (optionnel)
.\verifier-config.ps1

# 3. Déploiement complet
.\deploy.ps1 -Message "Description des modifications"

# 4. Vérifier le site
start https://prclaravi.netlify.app
```

### Workflow Rapide (Corrections mineures)

```powershell
# 1. Build local (si pas déjà fait)
cd deploiement-netlify
.\build-only.ps1

# 2. Déploiement rapide
.\deploy-rapide.ps1 -Message "Correction mineure"
```

### Workflow de Test

```powershell
# 1. Build uniquement
cd deploiement-netlify
.\build-only.ps1

# 2. Test local
cd ..
npm run preview

# 3. Si OK, déploiement rapide
cd deploiement-netlify
.\deploy-rapide.ps1
```

## ⚙️ Paramètres des Scripts

### Messages Personnalisés

Tous les scripts de déploiement acceptent un paramètre `-Message` :

```powershell
# Exemples de messages utiles
.\deploy.ps1 -Message "Ajout module E-audit"
.\deploy.ps1 -Message "Correction bug menu demarrer"
.\deploy.ps1 -Message "Mise a jour API Clara"
.\deploy.ps1 -Message "Optimisation performances"
```

**Bonnes pratiques pour les messages :**
- Soyez descriptif mais concis
- Mentionnez la fonctionnalité modifiée
- Évitez les caractères spéciaux
- Utilisez l'infinitif ("Ajout", "Correction", "Mise à jour")

## 🔍 Interprétation des Résultats

### Indicateurs de Succès

```
========================================
  DEPLOIEMENT REUSSI !
========================================

Site en ligne: https://prclaravi.netlify.app
```

### Indicateurs de Progression

```powershell
[1/5] Verifications preliminaires...    # Configuration OK
[2/5] Nettoyage...                      # Ancien build supprimé
[3/5] Build de production...            # Build en cours (2-3 min)
[4/5] Verifications post-build...       # Build vérifié
[5/5] Deploiement sur Netlify...        # Upload (5-8 min)
```

### Métriques Normales

```
Build reussi - Taille: 49.7 MB         # Taille normale
Duree: 2m 8s                           # Temps normal
Fichiers: 1247                         # Nombre de fichiers
```

## 🐛 Gestion des Erreurs

### Erreurs Courantes et Actions

| Erreur | Action Immédiate |
|--------|------------------|
| "Node.js non installe" | Installer Node.js |
| "Netlify CLI non installe" | `npm install -g netlify-cli` |
| "Non authentifie" | `netlify login` |
| "Dossier dist non trouve" | `.\build-only.ps1` |
| "Echec du build" | Vérifier les erreurs de compilation |
| "EPERM operation not permitted" | Redémarrer PowerShell en admin |

### Diagnostic Automatique

En cas d'erreur, les scripts affichent :
```
ERREUR: Description du problème
Consultez MEMO_PROBLEMES_SOLUTIONS.md pour les solutions
```

Consultez toujours le mémo pour les solutions détaillées.

## 📊 Monitoring et Logs

### Historique des Déploiements

Chaque déploiement est enregistré dans `HISTORIQUE_DEPLOIEMENTS.md` :

```
[2026-03-10 14:30:15] Deploiement reussi - Ajout E-audit - Taille: 49.7 MB
[2026-03-10 15:45:22] Build reussi - Duree: 2m 8s - Taille: 49.7 MB
```

### Commandes de Monitoring

```powershell
# Voir le statut du site
netlify status

# Voir les logs de déploiement
netlify logs

# Ouvrir le dashboard Netlify
netlify open

# Voir l'historique local
Get-Content HISTORIQUE_DEPLOIEMENTS.md -Tail 10
```

## 🔧 Personnalisation

### Modifier les Scripts

Les scripts sont conçus pour être modifiés selon vos besoins :

1. **Changer les messages par défaut :**
```powershell
# Dans deploy.ps1, ligne 5
param(
    [string]$Message = "Votre message par defaut"
)
```

2. **Ajouter des vérifications :**
```powershell
# Ajouter après les vérifications existantes
if (-not (Test-Path "../votre-fichier.txt")) {
    Show-Error "Votre fichier manquant"
}
```

3. **Modifier les timeouts :**
```powershell
# Pour des builds plus longs
Start-Sleep -Seconds 300  # 5 minutes
```

### Variables d'Environnement

Si votre application utilise des variables d'environnement :

```powershell
# Ajouter dans les scripts avant le déploiement
netlify env:set VITE_API_URL "https://votre-api.com"
netlify env:set VITE_VERSION "$(Get-Date -Format 'yyyy.MM.dd')"
```

## 📈 Optimisations

### Accélérer les Déploiements

1. **Utiliser le déploiement rapide** quand possible
2. **Nettoyer régulièrement** le cache :
```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

3. **Surveiller la taille** du build :
```powershell
# Si > 60 MB, optimiser
(Get-ChildItem -Path "../dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
```

### Réduire les Erreurs

1. **Toujours vérifier** avant de déployer :
```powershell
.\verifier-config.ps1
```

2. **Tester localement** d'abord :
```powershell
npm run preview
```

3. **Utiliser des messages** descriptifs pour l'historique

## 📞 Support

### Ordre de Résolution

1. **Consulter** `MEMO_PROBLEMES_SOLUTIONS.md`
2. **Exécuter** `.\verifier-config.ps1`
3. **Vérifier** l'historique des déploiements
4. **Tester** avec `.\build-only.ps1`
5. **Contacter** le support externe si nécessaire

### Ressources Externes

- **Documentation Netlify :** https://docs.netlify.com/
- **CLI Reference :** https://cli.netlify.com/
- **Community :** https://answers.netlify.com/
- **Status :** https://www.netlifystatus.com/

---

**Version :** 1.0  
**Dernière mise à jour :** Mars 2026  
**Maintenu par :** Équipe ClaraVerse