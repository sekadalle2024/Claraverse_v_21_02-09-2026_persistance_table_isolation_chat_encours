# Script pour déplacer tous les fichiers de test HTML dans un dossier dédié
# Auteur: Script automatique pour nettoyer le projet ClaraVerse
# Date: 2026-03-02

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Nettoyage des fichiers de test HTML  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Créer le dossier de destination
$testFolder = "tests-html"
if (-not (Test-Path $testFolder)) {
    New-Item -ItemType Directory -Path $testFolder -Force | Out-Null
    Write-Host "[OK] Dossier '$testFolder' créé" -ForegroundColor Green
} else {
    Write-Host "[INFO] Dossier '$testFolder' existe déjà" -ForegroundColor Yellow
}

# Compteurs
$movedCount = 0
$errorCount = 0

# Liste des patterns de fichiers à déplacer
$patterns = @(
    "test-*.html",
    "TEST_*.html",
    "debug*.html",
    "diagnostic*.html",
    "recovery.html",
    "solution-*.html",
    "fix-*.html"
)

Write-Host ""
Write-Host "Recherche des fichiers de test..." -ForegroundColor Cyan
Write-Host ""

# Fonction pour déplacer un fichier
function Move-TestFile {
    param (
        [string]$filePath,
        [string]$destination
    )
    
    try {
        $fileName = Split-Path $filePath -Leaf
        $destPath = Join-Path $destination $fileName
        
        # Vérifier si le fichier existe déjà dans la destination
        if (Test-Path $destPath) {
            Write-Host "  [SKIP] $fileName (existe déjà)" -ForegroundColor Yellow
            return $false
        }
        
        Move-Item -Path $filePath -Destination $destPath -Force
        Write-Host "  [OK] $fileName déplacé" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  [ERREUR] $fileName : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Déplacer les fichiers de la racine
Write-Host "1. Fichiers à la racine du projet:" -ForegroundColor Cyan
foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $result = Move-TestFile -filePath $file.FullName -destination $testFolder
        if ($result -eq $true) { $movedCount++ }
        elseif ($result -eq $null) { $errorCount++ }
    }
}

# Déplacer les fichiers du dossier public
Write-Host ""
Write-Host "2. Fichiers dans le dossier 'public':" -ForegroundColor Cyan
if (Test-Path "public") {
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path "public" -Filter $pattern -File -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $result = Move-TestFile -filePath $file.FullName -destination $testFolder
            if ($result -eq $true) { $movedCount++ }
            elseif ($result -eq $null) { $errorCount++ }
        }
    }
}

# Déplacer les fichiers du dossier electron
Write-Host ""
Write-Host "3. Fichiers dans le dossier 'electron':" -ForegroundColor Cyan
if (Test-Path "electron") {
    $electronTestFiles = @("featureSelection.html", "loading.html", "splash.html")
    foreach ($fileName in $electronTestFiles) {
        $filePath = Join-Path "electron" $fileName
        if (Test-Path $filePath) {
            $result = Move-TestFile -filePath $filePath -destination $testFolder
            if ($result -eq $true) { $movedCount++ }
            elseif ($result -eq $null) { $errorCount++ }
        }
    }
}

# Déplacer les fichiers du dossier ressource
Write-Host ""
Write-Host "4. Fichiers dans le dossier 'ressource':" -ForegroundColor Cyan
if (Test-Path "ressource") {
    $files = Get-ChildItem -Path "ressource" -Filter "*.html" -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $result = Move-TestFile -filePath $file.FullName -destination $testFolder
        if ($result -eq $true) { $movedCount++ }
        elseif ($result -eq $null) { $errorCount++ }
    }
}

# Déplacer les fichiers du dossier sdk
Write-Host ""
Write-Host "5. Fichiers dans le dossier 'sdk':" -ForegroundColor Cyan
if (Test-Path "sdk") {
    $files = Get-ChildItem -Path "sdk" -Filter "test-*.html" -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $result = Move-TestFile -filePath $file.FullName -destination $testFolder
        if ($result -eq $true) { $movedCount++ }
        elseif ($result -eq $null) { $errorCount++ }
    }
}

# Déplacer les fichiers du dossier test-configs
Write-Host ""
Write-Host "6. Fichiers dans le dossier 'test-configs':" -ForegroundColor Cyan
if (Test-Path "test-configs") {
    $files = Get-ChildItem -Path "test-configs" -Filter "*.html" -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $result = Move-TestFile -filePath $file.FullName -destination $testFolder
        if ($result -eq $true) { $movedCount++ }
        elseif ($result -eq $null) { $errorCount++ }
    }
}

# Déplacer les fichiers du dossier src/components
Write-Host ""
Write-Host "7. Fichiers dans le dossier 'src/components':" -ForegroundColor Cyan
if (Test-Path "src/components") {
    $files = Get-ChildItem -Path "src/components" -Filter "*.html" -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $result = Move-TestFile -filePath $file.FullName -destination $testFolder
        if ($result -eq $true) { $movedCount++ }
        elseif ($result -eq $null) { $errorCount++ }
    }
}

# Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           RÉSUMÉ DU NETTOYAGE          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichiers déplacés : $movedCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "Erreurs rencontrées : $errorCount" -ForegroundColor Red
}
Write-Host ""
Write-Host "Tous les fichiers de test sont maintenant dans le dossier '$testFolder'" -ForegroundColor Cyan
Write-Host ""

# Créer un fichier README dans le dossier tests-html
$readmeContent = @"
# Fichiers de Test HTML - ClaraVerse

Ce dossier contient tous les fichiers HTML de test qui ont été déplacés depuis la racine du projet.

## Raison du déplacement

Ces fichiers causaient des erreurs lors du scan de dépendances par Vite au démarrage de l'application.
En les déplaçant ici, ils restent accessibles pour les tests mais n'interfèrent plus avec le build.

## Utilisation

Pour utiliser ces fichiers de test :
1. Ouvrez-les directement dans votre navigateur
2. Ou utilisez un serveur HTTP local : ``python -m http.server 8000``

## Date de déplacement

$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Fichiers déplacés

$movedCount fichiers au total
"@

$readmePath = Join-Path $testFolder "README.md"
Set-Content -Path $readmePath -Value $readmeContent -Encoding UTF8
Write-Host "[OK] Fichier README.md créé dans '$testFolder'" -ForegroundColor Green

Write-Host ""
Write-Host "Vous pouvez maintenant relancer l'application avec : npm run dev" -ForegroundColor Yellow
Write-Host ""
