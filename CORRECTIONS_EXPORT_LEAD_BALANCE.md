# Corrections : Export Lead Balance

## 📅 Date : 22 Mars 2026

---

## 🐛 Problèmes Identifiés

### 1. Script de Lancement Backend
**Problème** : Le script `start-claraverse.ps1` n'utilisait pas l'environnement conda `claraverse_backend`

**Impact** : Le backend ne démarrait pas correctement avec les dépendances installées dans conda

### 2. Menu Contextuel sur Accordéons Lead Balance
**Problème** : Le menu contextuel ne s'affichait pas sur les tables dans les accordéons Lead Balance

**Impact** : Impossible d'exporter les résultats Lead Balance via le menu contextuel

---

## ✅ Corrections Appliquées

### 1. Mise à Jour du Script de Lancement

**Fichier** : `start-claraverse.ps1`

**Modifications** :

#### A. Détection Automatique de Conda
```powershell
# Vérifier conda
Write-Host "Verification de conda..." -NoNewline
try {
    $condaVersion = & conda --version 2>&1
    Write-Host " OK $condaVersion" -ForegroundColor Green
    
    # Vérifier si l'environnement conda existe
    $envExists = conda env list | Select-String -Pattern $ENV_NAME -Quiet
    if ($envExists) {
        Write-Host "Environnement conda '$ENV_NAME' detecte - Utilisation de conda" -ForegroundColor Green
        $USE_CONDA = $true
    } else {
        Write-Host "Environnement conda '$ENV_NAME' non trouve - Utilisation de Python systeme" -ForegroundColor Yellow
    }
} catch {
    Write-Host " Non installe - Utilisation de Python systeme" -ForegroundColor Yellow
}
```

#### B. Démarrage Conditionnel du Backend
```powershell
if ($USE_CONDA) {
    $backendJob = Start-Job -ScriptBlock {
        param($envName, $dir)
        Set-Location $dir
        & conda run -n $envName python main.py
    } -ArgumentList $ENV_NAME, (Resolve-Path $BACKEND_DIR)
} else {
    $backendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & python main.py
    } -ArgumentList (Resolve-Path $BACKEND_DIR)
}
```

#### C. Augmentation du Délai d'Attente
```powershell
# Attendre le backend
Write-Host "Attente du demarrage du backend (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
```

**Changement** : 5 secondes → 10 secondes pour laisser le temps à conda de démarrer

---

### 2. Correction du Menu Contextuel

**Fichier** : `public/menu.js`

**Fonction modifiée** : `isTableInChat()` (ligne ~7194)

**Avant** :
```javascript
isTableInChat(table) {
  if (table.matches("table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg") && table.closest(