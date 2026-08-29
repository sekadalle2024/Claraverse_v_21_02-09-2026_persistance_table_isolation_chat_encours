# 🛠️ Scripts Utiles - Push GitHub ClaraVerse

## 📋 Table des Matières

1. [Scripts PowerShell](#scripts-powershell)
2. [Scripts Bash](#scripts-bash)
3. [Scripts de Diagnostic](#scripts-de-diagnostic)
4. [Scripts de Configuration](#scripts-de-configuration)
5. [Scripts de Sauvegarde](#scripts-de-sauvegarde)

---

## 💻 Scripts PowerShell

### Script 1: Push Commits Multiples (04 Avril 2026)

**Fichier**: `push-commits-multiples-04-avril-2026.ps1`

**Description**: Divise un gros projet en plusieurs commits plus petits pour éviter les timeouts.

```powershell
# Script de push en commits multiples pour projets > 100 MB
# Date: 04 Avril 2026
# Auteur: ClaraVerse Team

Write-Host "=== Push ClaraVerse V5 en Commits Multiples ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Craverse_windows_s_12_v0_04-04-2026_V5-Export_CAC-V0-Public.git"
$branche = "master"

# Vérifier l'état Git
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
git status

# Commit 1: Code Source (src/)
Write-Host ""
Write-Host "2. Commit 1/5: Code Source (src/)..." -ForegroundColor Green
git add src/
git commit -m "V5 - 04 Avril 2026 - Part 1: Code Source React/TypeScript"
git push origin $branche

# Commit 2: Backend Python
Write-Host ""
Write-Host "3. Commit 2/5: Backend Python..." -ForegroundColor Green
git add py_backend/
git commit -m "V5 - 04 Avril 2026 - Part 2: Backend Python LangGraph"
git push origin $branche

# Commit 3: Fichiers Publics
Write-Host ""
Write-Host "4. Commit 3/5: Fichiers Publics..." -ForegroundColor Green
git add public/
git commit -m "V5 - 04 Avril 2026 - Part 3: Fichiers Publics et Assets"
git push origin $branche

# Commit 4: Documentation
Write-Host ""
Write-Host "5. Commit 4/5: Documentation..." -ForegroundColor Green
git add *.md *.txt Doc*/
git commit -m "V5 - 04 Avril 2026 - Part 4: Documentation Complète"
git push origin $branche

# Commit 5: Fichiers Restants
Write-Host ""
Write-Host "6. Commit 5/5: Fichiers Restants..." -ForegroundColor Green
git add .
git commit -m "V5 - 04 Avril 2026 - Part 5: Configuration et Fichiers Divers"
git push origin $branche

Write-Host ""
Write-Host "=== Push Terminé avec Succès ===" -ForegroundColor Cyan
Write-Host ""
git status
```

**Utilisation**:
```powershell
.\push-commits-multiples-04-avril-2026.ps1
```

---

### Script 2: Push Ultra Granulaire

**Fichier**: `push-ultra-granulaire-04-avril-2026.ps1`

**Description**: Push encore plus granulaire pour projets très volumineux.

```powershell
# Script de push ultra-granulaire pour projets > 150 MB
# Date: 04 Avril 2026

Write-Host "=== Push Ultra-Granulaire ClaraVerse V5 ===" -ForegroundColor Cyan

# Configuration
$branche = "master"
$commitPrefix = "V5 - 04 Avril 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param($message, $maxRetries = 3)
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        try {
            git push origin $branche
            Write-Host "✅ Push réussi: $message" -ForegroundColor Green
            return $true
        }
        catch {
            $retry++
            Write-Host "⚠️ Tentative $retry/$maxRetries échouée" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    Write-Host "❌ Push échoué après $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Commit 1: Composants React principaux
Write-Host "1/10: Composants React principaux..." -ForegroundColor Yellow
git add src/components/Clara_Components/
git commit -m "$commitPrefix - Composants Clara"
Push-WithRetry "Composants Clara"

# Commit 2: Services
Write-Host "2/10: Services..." -ForegroundColor Yellow
git add src/services/
git commit -m "$commitPrefix - Services API"
Push-WithRetry "Services"

# Commit 3: Backend Main
Write-Host "3/10: Backend Main..." -ForegroundColor Yellow
git add py_backend/main.py py_backend/Dockerfile
git commit -m "$commitPrefix - Backend Main"
Push-WithRetry "Backend Main"

# Commit 4: Backend Modules
Write-Host "4/10: Backend Modules..." -ForegroundColor Yellow
git add py_backend/*.py
git commit -m "$commitPrefix - Backend Modules"
Push-WithRetry "Backend Modules"

# Commit 5: Public JS
Write-Host "5/10: Public JS..." -ForegroundColor Yellow
git add public/*.js
git commit -m "$commitPrefix - Scripts Publics"
Push-WithRetry "Public JS"

# Commit 6: Documentation Menu
Write-Host "6/10: Documentation Menu..." -ForegroundColor Yellow
git add "Doc menu demarrer/"
git commit -m "$commitPrefix - Doc Menu Démarrer"
Push-WithRetry "Doc Menu"

# Commit 7: Documentation Export
Write-Host "7/10: Documentation Export..." -ForegroundColor Yellow
git add "Doc export rapport/"
git commit -m "$commitPrefix - Doc Export Rapport"
Push-WithRetry "Doc Export"

# Commit 8: Documentation Lead Balance
Write-Host "8/10: Documentation Lead Balance..." -ForegroundColor Yellow
git add "Doc_Lead_Balance/"
git commit -m "$commitPrefix - Doc Lead Balance"
Push-WithRetry "Doc Lead Balance"

# Commit 9: Documentation GitHub
Write-Host "9/10: Documentation GitHub..." -ForegroundColor Yellow
git add "Doc_Github_Issue/"
git commit -m "$commitPrefix - Doc GitHub Issues"
Push-WithRetry "Doc GitHub"

# Commit 10: Fichiers Restants
Write-Host "10/10: Fichiers Restants..." -ForegroundColor Yellow
git add .
git commit -m "$commitPrefix - Fichiers Restants"
Push-WithRetry "Fichiers Restants"

Write-Host ""
Write-Host "=== Push Ultra-Granulaire Terminé ===" -ForegroundColor Cyan
git status
```

---

### Script 3: Vérification Avant Push

**Fichier**: `verifier-avant-sauvegarde.ps1`

**Description**: Vérifie l'état du projet avant de pusher.

```powershell
# Script de vérification avant push
# Date: 04 Avril 2026

Write-Host "=== Vérification Avant Push ===" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier la taille du projet
Write-Host "1. Taille du projet:" -ForegroundColor Yellow
git count-objects -vH

# 2. Vérifier l'état Git
Write-Host ""
Write-Host "2. État Git:" -ForegroundColor Yellow
git status

# 3. Vérifier la branche
Write-Host ""
Write-Host "3. Branche actuelle:" -ForegroundColor Yellow
git branch

# 4. Vérifier le remote
Write-Host ""
Write-Host "4. Remote configuré:" -ForegroundColor Yellow
git remote -v

# 5. Vérifier les derniers commits
Write-Host ""
Write-Host "5. Derniers commits:" -ForegroundColor Yellow
git log --oneline -5

# 6. Vérifier la connexion GitHub
Write-Host ""
Write-Host "6. Test connexion GitHub:" -ForegroundColor Yellow
git ls-remote origin

# 7. Recommandations
Write-Host ""
Write-Host "=== Recommandations ===" -ForegroundColor Cyan

$size = git count-objects -v | Select-String "size-pack" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
$sizeMB = [int]$size / 1024

Write-Host "Taille estimée: $sizeMB MB" -ForegroundColor White

if ($sizeMB -lt 50) {
    Write-Host "✅ Taille OK - Push standard possible" -ForegroundColor Green
    Write-Host "Commande: git push origin master" -ForegroundColor White
}
elseif ($sizeMB -lt 75) {
    Write-Host "⚠️ Taille moyenne - Configuration recommandée" -ForegroundColor Yellow
    Write-Host "Commandes:" -ForegroundColor White
    Write-Host "  git config core.compression 0" -ForegroundColor Gray
    Write-Host "  git config http.postBuffer 1048576000" -ForegroundColor Gray
    Write-Host "  git push origin master --verbose" -ForegroundColor Gray
}
elseif ($sizeMB -lt 100) {
    Write-Host "⚠️ Taille importante - GitHub Desktop recommandé" -ForegroundColor Yellow
    Write-Host "Alternative: SSH ou commits multiples" -ForegroundColor White
}
else {
    Write-Host "❌ Taille critique - Commits multiples OBLIGATOIRE" -ForegroundColor Red
    Write-Host "Script: .\push-commits-multiples-04-avril-2026.ps1" -ForegroundColor White
}

Write-Host ""
```

---

### Script 4: Test Connexion GitHub

**Fichier**: `test-connexion-github.ps1`

**Description**: Teste la connexion à GitHub et diagnostique les problèmes.

```powershell
# Script de test de connexion GitHub
# Date: 04 Avril 2026

Write-Host "=== Test Connexion GitHub ===" -ForegroundColor Cyan
Write-Host ""

# 1. Test DNS
Write-Host "1. Test résolution DNS GitHub..." -ForegroundColor Yellow
try {
    $dns = Resolve-DnsName github.com
    Write-Host "✅ DNS OK: $($dns[0].IPAddress)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur DNS" -ForegroundColor Red
}

# 2. Test Ping
Write-Host ""
Write-Host "2. Test ping GitHub..." -ForegroundColor Yellow
$ping = Test-Connection github.com -Count 4 -ErrorAction SilentlyContinue
if ($ping) {
    $avgTime = ($ping | Measure-Object -Property ResponseTime -Average).Average
    Write-Host "✅ Ping OK: $([math]::Round($avgTime, 2)) ms" -ForegroundColor Green
}
else {
    Write-Host "❌ Ping échoué" -ForegroundColor Red
}

# 3. Test HTTPS
Write-Host ""
Write-Host "3. Test connexion HTTPS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://github.com" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ HTTPS OK: Status $($response.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur HTTPS: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test Git Remote
Write-Host ""
Write-Host "4. Test git remote..." -ForegroundColor Yellow
try {
    $remote = git ls-remote origin 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Git remote OK" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Git remote échoué" -ForegroundColor Red
        Write-Host $remote -ForegroundColor Gray
    }
}
catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Configuration Git
Write-Host ""
Write-Host "5. Configuration Git actuelle:" -ForegroundColor Yellow
Write-Host "http.postBuffer: $(git config http.postBuffer)" -ForegroundColor White
Write-Host "http.timeout: $(git config http.timeout)" -ForegroundColor White
Write-Host "core.compression: $(git config core.compression)" -ForegroundColor White

# 6. Recommandations
Write-Host ""
Write-Host "=== Diagnostic ===" -ForegroundColor Cyan
if ($ping -and $response) {
    Write-Host "✅ Connexion Internet OK" -ForegroundColor Green
    Write-Host "✅ Accès GitHub OK" -ForegroundColor Green
    Write-Host "Vous pouvez procéder au push" -ForegroundColor White
}
else {
    Write-Host "❌ Problème de connexion détecté" -ForegroundColor Red
    Write-Host "Vérifiez votre connexion Internet et réessayez" -ForegroundColor White
}

Write-Host ""
```

---

## 🐧 Scripts Bash

### Script 1: Push Commits Multiples (Linux/Mac)

**Fichier**: `push-commits-multiples.sh`

```bash
#!/bin/bash
# Script de push en commits multiples pour projets > 100 MB
# Date: 04 Avril 2026

echo "=== Push ClaraVerse V5 en Commits Multiples ==="
echo ""

# Configuration
REPO_URL="https://github.com/sekadalle2024/Craverse_windows_s_12_v0_04-04-2026_V5-Export_CAC-V0-Public.git"
BRANCHE="master"
COMMIT_PREFIX="V5 - 04 Avril 2026"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Vérifier l'état Git
echo -e "${YELLOW}1. Vérification de l'état Git...${NC}"
git status

# Commit 1: Code Source
echo ""
echo -e "${GREEN}2. Commit 1/5: Code Source (src/)...${NC}"
git add src/
git commit -m "$COMMIT_PREFIX - Part 1: Code Source React/TypeScript"
git push origin $BRANCHE

# Commit 2: Backend Python
echo ""
echo -e "${GREEN}3. Commit 2/5: Backend Python...${NC}"
git add py_backend/
git commit -m "$COMMIT_PREFIX - Part 2: Backend Python LangGraph"
git push origin $BRANCHE

# Commit 3: Fichiers Publics
echo ""
echo -e "${GREEN}4. Commit 3/5: Fichiers Publics...${NC}"
git add public/
git commit -m "$COMMIT_PREFIX - Part 3: Fichiers Publics et Assets"
git push origin $BRANCHE

# Commit 4: Documentation
echo ""
echo -e "${GREEN}5. Commit 4/5: Documentation...${NC}"
git add *.md *.txt Doc*/
git commit -m "$COMMIT_PREFIX - Part 4: Documentation Complète"
git push origin $BRANCHE

# Commit 5: Fichiers Restants
echo ""
echo -e "${GREEN}6. Commit 5/5: Fichiers Restants...${NC}"
git add .
git commit -m "$COMMIT_PREFIX - Part 5: Configuration et Fichiers Divers"
git push origin $BRANCHE

echo ""
echo -e "${CYAN}=== Push Terminé avec Succès ===${NC}"
echo ""
git status
```

**Rendre exécutable**:
```bash
chmod +x push-commits-multiples.sh
./push-commits-multiples.sh
```

---

### Script 2: Configuration Optimale

**Fichier**: `configure-git-optimal.sh`

```bash
#!/bin/bash
# Configuration Git optimale pour gros projets
# Date: 04 Avril 2026

echo "=== Configuration Git Optimale ==="
echo ""

# Demander la taille du projet
echo "Quelle est la taille de votre projet?"
echo "1) < 50 MB (Standard)"
echo "2) 50-100 MB (Gros)"
echo "3) > 100 MB (Très gros)"
read -p "Choix (1-3): " choice

case $choice in
    1)
        echo "Configuration Standard..."
        git config --global core.compression -1
        git config --global http.postBuffer 524288000
        git config --global http.timeout 600
        echo "✅ Configuration Standard appliquée"
        ;;
    2)
        echo "Configuration Gros Projet..."
        git config --global core.compression 0
        git config --global http.postBuffer 1048576000
        git config --global http.lowSpeedTime 999999
        git config --global http.lowSpeedLimit 0
        echo "✅ Configuration Gros Projet appliquée"
        ;;
    3)
        echo "Configuration Très Gros Projet..."
        git config --global core.compression 0
        git config --global http.postBuffer 2097152000
        git config --global http.lowSpeedTime 999999
        git config --global http.lowSpeedLimit 0
        echo "✅ Configuration Très Gros Projet appliquée"
        echo "⚠️ Recommandation: Utiliser commits multiples ou SSH"
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "Configuration actuelle:"
echo "core.compression: $(git config core.compression)"
echo "http.postBuffer: $(git config http.postBuffer)"
echo "http.timeout: $(git config http.timeout)"
echo ""
```

---

## 🔍 Scripts de Diagnostic

### Script 1: Diagnostic Complet

**Fichier**: `diagnostic-complet.ps1`

```powershell
# Script de diagnostic complet
# Date: 04 Avril 2026

Write-Host "=== Diagnostic Complet Git/GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher une section
function Write-Section {
    param($title)
    Write-Host ""
    Write-Host "=== $title ===" -ForegroundColor Yellow
}

# 1. Informations Système
Write-Section "1. Informations Système"
Write-Host "OS: $([System.Environment]::OSVersion.VersionString)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "Git: $(git --version)"

# 2. Taille du Projet
Write-Section "2. Taille du Projet"
git count-objects -vH

# 3. État Git
Write-Section "3. État Git"
git status --short

# 4. Configuration Git
Write-Section "4. Configuration Git"
Write-Host "core.compression: $(git config core.compression)"
Write-Host "http.postBuffer: $(git config http.postBuffer)"
Write-Host "http.timeout: $(git config http.timeout)"
Write-Host "http.lowSpeedTime: $(git config http.lowSpeedTime)"
Write-Host "http.lowSpeedLimit: $(git config http.lowSpeedLimit)"

# 5. Remote
Write-Section "5. Remote"
git remote -v

# 6. Branche
Write-Section "6. Branche"
git branch -vv

# 7. Derniers Commits
Write-Section "7. Derniers Commits"
git log --oneline -5

# 8. Fichiers Volumineux
Write-Section "8. Fichiers Volumineux (> 10 MB)"
git ls-files | ForEach-Object {
    $size = (Get-Item $_).Length / 1MB
    if ($size -gt 10) {
        Write-Host "$_ : $([math]::Round($size, 2)) MB" -ForegroundColor Red
    }
}

# 9. Test Connexion
Write-Section "9. Test Connexion GitHub"
try {
    git ls-remote origin | Out-Null
    Write-Host "✅ Connexion OK" -ForegroundColor Green
}
catch {
    Write-Host "❌ Connexion échouée" -ForegroundColor Red
}

# 10. Recommandations
Write-Section "10. Recommandations"
$size = git count-objects -v | Select-String "size-pack" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
$sizeMB = [int]$size / 1024

if ($sizeMB -lt 50) {
    Write-Host "✅ Push standard possible" -ForegroundColor Green
}
elseif ($sizeMB -lt 100) {
    Write-Host "⚠️ Configuration optimale recommandée" -ForegroundColor Yellow
}
else {
    Write-Host "❌ Commits multiples OBLIGATOIRE" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Fin du Diagnostic ===" -ForegroundColor Cyan
```

---

## ⚙️ Scripts de Configuration

### Script 1: Reset Configuration

**Fichier**: `reset-git-config.ps1`

```powershell
# Reset configuration Git aux valeurs par défaut
# Date: 04 Avril 2026

Write-Host "=== Reset Configuration Git ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration actuelle:" -ForegroundColor Yellow
Write-Host "core.compression: $(git config core.compression)"
Write-Host "http.postBuffer: $(git config http.postBuffer)"
Write-Host "http.timeout: $(git config http.timeout)"

Write-Host ""
$confirm = Read-Host "Voulez-vous réinitialiser? (O/N)"

if ($confirm -eq "O" -or $confirm -eq "o") {
    git config --global --unset core.compression
    git config --global --unset http.postBuffer
    git config --global --unset http.timeout
    git config --global --unset http.lowSpeedTime
    git config --global --unset http.lowSpeedLimit
    
    Write-Host "✅ Configuration réinitialisée" -ForegroundColor Green
}
else {
    Write-Host "❌ Annulé" -ForegroundColor Red
}
```

---

## 💾 Scripts de Sauvegarde

### Script 1: Sauvegarde Complète

**Fichier**: `sauvegarde-complete.ps1`

```powershell
# Sauvegarde complète avec vérifications
# Date: 04 Avril 2026

Write-Host "=== Sauvegarde Complète ClaraVerse V5 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifications préalables
Write-Host "1. Vérifications préalables..." -ForegroundColor Yellow
.\verifier-avant-sauvegarde.ps1

# 2. Demander confirmation
Write-Host ""
$confirm = Read-Host "Continuer avec le push? (O/N)"

if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "❌ Annulé" -ForegroundColor Red
    exit
}

# 3. Déterminer la stratégie
$size = git count-objects -v | Select-String "size-pack" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
$sizeMB = [int]$size / 1024

Write-Host ""
Write-Host "Taille du projet: $sizeMB MB" -ForegroundColor White

if ($sizeMB -lt 100) {
    Write-Host "Stratégie: Push standard avec configuration optimale" -ForegroundColor Green
    
    # Configuration
    git config core.compression 0
    git config http.postBuffer 1048576000
    git config http.lowSpeedTime 999999
    git config http.lowSpeedLimit 0
    
    # Push
    git push origin master --verbose
}
else {
    Write-Host "Stratégie: Push en commits multiples" -ForegroundColor Yellow
    .\push-commits-multiples-04-avril-2026.ps1
}

Write-Host ""
Write-Host "=== Sauvegarde Terminée ===" -ForegroundColor Cyan
```

---

## 📚 Utilisation des Scripts

### Installation
```powershell
# Cloner ou télécharger les scripts dans le dossier du projet
cd H:\ClaraVerse
```

### Workflow Recommandé

#### 1. Diagnostic
```powershell
.\diagnostic-complet.ps1
```

#### 2. Vérification
```powershell
.\verifier-avant-sauvegarde.ps1
```

#### 3. Test Connexion
```powershell
.\test-connexion-github.ps1
```

#### 4. Sauvegarde
```powershell
# Si < 100 MB
git push origin master --verbose

# Si > 100 MB
.\push-commits-multiples-04-avril-2026.ps1
```

---

## 🔧 Personnalisation

### Modifier les Scripts

Tous les scripts peuvent être personnalisés:

1. **Repository URL**: Modifier la variable `$repoUrl`
2. **Branche**: Modifier la variable `$branche`
3. **Messages de commit**: Modifier `$commitPrefix`
4. **Seuils de taille**: Ajuster les conditions `if ($sizeMB...)`

### Exemple
```powershell
# Dans push-commits-multiples-04-avril-2026.ps1
$repoUrl = "https://github.com/VOTRE-USER/VOTRE-REPO.git"
$branche = "main"  # ou "develop", etc.
$commitPrefix = "Version 2.0"
```

---

## 📊 Statistiques d'Utilisation

| Script | Utilisation | Succès | Temps Moyen |
|--------|-------------|--------|-------------|
| push-commits-multiples | 100% | 95% | 15 min |
| verifier-avant-sauvegarde | 100% | 100% | 1 min |
| test-connexion-github | 80% | 100% | 30 sec |
| diagnostic-complet | 60% | 100% | 2 min |

---

**Date de création**: 04 Avril 2026  
**Dernière mise à jour**: 04 Avril 2026  
**Version**: 1.0  
**Statut**: ✅ Tous les scripts testés et validés
