# 🛠️ Commandes Utiles - Déploiement Netlify

## 🚀 Scripts de ce Dossier

```powershell
# Déploiement complet (recommandé)
.\deploy.ps1

# Déploiement rapide (build existant)
.\deploy-rapide.ps1

# Build uniquement
.\build-only.ps1

# Vérification de la configuration
.\verifier-config.ps1
```

## 📦 Commandes de Build

```powershell
# Build de production
npm run build

# Build avec plus de mémoire (si erreur heap)
node --max-old-space-size=8192 ./node_modules/vite/bin/vite.js build

# Preview du build local
npm run preview

# Développement local
npm run dev
```

## 🌐 Commandes Netlify CLI

### Authentification
```powershell
# Se connecter
netlify login

# Se déconnecter
netlify logout

# Voir le statut
netlify status
```

### Déploiement
```powershell
# Déploiement en production
netlify deploy --prod --dir=dist

# Déploiement de test
netlify deploy --dir=dist

# Déploiement avec message
netlify deploy --prod --dir=dist --message="Votre message"
```

### Gestion des Sites
```powershell
# Lister les sites
netlify sites:list

# Lier le projet à un site
netlify link

# Ouvrir le dashboard
netlify open

# Ouvrir le site
netlify open:site
```

### Logs et Monitoring
```powershell
# Voir les logs de déploiement
netlify logs

# Voir les logs en temps réel
netlify logs --live

# Voir les logs de fonctions
netlify functions:log
```

### Variables d'Environnement
```powershell
# Lister les variables
netlify env:list

# Définir une variable
netlify env:set VARIABLE_NAME "valeur"

# Supprimer une variable
netlify env:unset VARIABLE_NAME
```

## 🔍 Commandes de Diagnostic

### Vérifications Système
```powershell
# Versions des outils
node --version
npm --version
netlify --version

# Espace disque
Get-PSDrive C

# Mémoire disponible
Get-WmiObject -Class Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory
```

### Vérifications du Projet
```powershell
# Taille du dossier dist
(Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

# Nombre de fichiers dans dist
(Get-ChildItem -Path "dist" -Recurse -File).Count

# Vérifier les fichiers essentiels
Test-Path "dist/index.html"
Test-Path "dist/assets"

# Contenu du package.json
Get-Content package.json | ConvertFrom-Json | Select-Object name,version,scripts
```

### Nettoyage
```powershell
# Nettoyer le dossier dist
Remove-Item -Recurse -Force dist

# Nettoyer node_modules
Remove-Item -Recurse -Force node_modules
npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer le cache Netlify
netlify logout
netlify login
```

## 🐛 Commandes de Dépannage

### Problèmes de Build
```powershell
# Build avec debug
npm run build --verbose

# Build avec plus de mémoire
node --max-old-space-size=12288 ./node_modules/vite/bin/vite.js build

# Vérifier les dépendances
npm audit
npm audit fix
```

### Problèmes de Déploiement
```powershell
# Forcer la reconnexion
netlify logout
netlify login
netlify link

# Déploiement avec debug
netlify deploy --prod --dir=dist --debug

# Vérifier la connectivité
Test-NetConnection api.netlify.com -Port 443
```

### Problèmes de Permissions
```powershell
# Redémarrer PowerShell en administrateur
Start-Process powershell -Verb runAs

# Vérifier les permissions du dossier
Get-Acl $env:APPDATA\netlify
```

## 📊 Commandes de Monitoring

### Statistiques du Site
```powershell
# Informations du déploiement
netlify status

# Historique des déploiements
netlify deploys:list

# Détails d'un déploiement
netlify deploys:get [DEPLOY_ID]
```

### Métriques de Performance
```powershell
# Taille des fichiers dans dist
Get-ChildItem -Path "dist" -Recurse | Sort-Object Length -Descending | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}} | Head -10

# Analyse des chunks
Get-ChildItem -Path "dist/assets" -Filter "*.js" | Sort-Object Length -Descending | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,0)}}
```

## 🔄 Workflows Complets

### Workflow de Développement
```powershell
# 1. Développement
npm run dev

# 2. Test du build
npm run build
npm run preview

# 3. Déploiement
cd deploiement-netlify
.\deploy-rapide.ps1 -Message "Nouvelles fonctionnalites"
```

### Workflow de Production
```powershell
# 1. Vérifications
cd deploiement-netlify
.\verifier-config.ps1

# 2. Déploiement complet
.\deploy.ps1 -Message "Release v1.2.3"

# 3. Vérification
netlify open:site
netlify logs
```

### Workflow de Dépannage
```powershell
# 1. Diagnostic
.\verifier-config.ps1

# 2. Nettoyage si nécessaire
Remove-Item -Recurse -Force ../dist
Remove-Item -Recurse -Force ../node_modules
cd ..
npm install

# 3. Test du build
cd deploiement-netlify
.\build-only.ps1

# 4. Déploiement
.\deploy-rapide.ps1
```

## 📝 Commandes de Documentation

### Générer des Rapports
```powershell
# Rapport de taille
"=== RAPPORT DE TAILLE ===" | Out-File -FilePath "rapport-taille.txt"
Get-ChildItem -Path "../dist" -Recurse | Group-Object Extension | Sort-Object Count -Descending | Out-File -Append -FilePath "rapport-taille.txt"

# Historique des déploiements
Get-Content HISTORIQUE_DEPLOIEMENTS.md | Select-String "\[2026" | Out-File -FilePath "deploiements-mars-2026.txt"
```

### Backup de Configuration
```powershell
# Sauvegarder les fichiers de config
Copy-Item "../netlify.toml" -Destination "backup-netlify.toml"
Copy-Item "../package.json" -Destination "backup-package.json"
```

## 🌐 Commandes Web

### Ouvrir les URLs Importantes
```powershell
# Site en production
start https://prclaravi.netlify.app

# Dashboard Netlify
start https://app.netlify.com/projects/prclaravi

# Logs de déploiement
netlify open

# Documentation Netlify
start https://docs.netlify.com/
```

## 📞 Commandes de Support

### Collecter les Informations de Debug
```powershell
# Créer un rapport de debug
$debugInfo = @"
=== INFORMATIONS DE DEBUG ===
Date: $(Get-Date)
Node.js: $(node --version)
npm: $(npm --version)
Netlify CLI: $(netlify --version)
Système: $($env:OS)
Dossier: $(Get-Location)
Taille dist: $((Get-ChildItem -Path "../dist" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB) MB
Statut Netlify:
$(netlify status 2>&1)
"@

$debugInfo | Out-File -FilePath "debug-info.txt"
Write-Host "Rapport de debug créé: debug-info.txt"
```

---

**Conseil :** Ajoutez cette page à vos favoris pour un accès rapide aux commandes !

**Version :** 1.0  
**Dernière mise à jour :** Mars 2026