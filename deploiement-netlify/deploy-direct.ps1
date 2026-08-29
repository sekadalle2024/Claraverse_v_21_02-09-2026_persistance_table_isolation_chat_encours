# Script de déploiement direct Netlify - ClaraVerse
# Déploie directement sans changer de répertoire

param(
    [string]$Message = "Mise a jour $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT DIRECT NETLIFY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les erreurs
function Show-Error {
    param([string]$ErrorMessage)
    Write-Host "ERREUR: $ErrorMessage" -ForegroundColor Red
    exit 1
}

# Étape 1: Vérifications
Write-Host "[1/4] Verifications..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) { Show-Error "Node.js non installe" }
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

$netlifyVersion = netlify --version 2>$null
if ($LASTEXITCODE -ne 0) { Show-Error "Netlify CLI non installe" }
Write-Host "  Netlify CLI: $netlifyVersion" -ForegroundColor Green

# Étape 2: Nettoyage
Write-Host ""
Write-Host "[2/4] Nettoyage..." -ForegroundColor Yellow
if (Test-Path "../dist") {
    Remove-Item -Recurse -Force "../dist"
    Write-Host "  Ancien dossier dist supprime" -ForegroundColor Green
}

# Étape 3: Build
Write-Host ""
Write-Host "[3/4] Build de production..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre 2-3 minutes..." -ForegroundColor Gray

Push-Location ".."
npm run build
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Show-Error "Echec du build"
}

if (-not (Test-Path "../dist")) {
    Show-Error "Dossier dist non cree"
}

$distSize = (Get-ChildItem -Path "../dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Build reussi - Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor Green

# Étape 4: Déploiement direct avec site ID
Write-Host ""
Write-Host "[4/4] Deploiement sur Netlify..." -ForegroundColor Yellow
Write-Host "  Upload en cours..." -ForegroundColor Gray

# Déployer depuis le répertoire parent avec le site ID
Push-Location ".."
netlify deploy --prod --dir=dist --site=prclaravi --message="$Message"
$deployResult = $LASTEXITCODE
Pop-Location

if ($deployResult -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  DEPLOIEMENT REUSSI !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Site en ligne: https://prclaravi.netlify.app" -ForegroundColor Cyan
    Write-Host "Dashboard: https://app.netlify.com/projects/prclaravi" -ForegroundColor Cyan
    
    # Enregistrer dans l'historique
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "`n[$timestamp] Deploiement reussi - $Message - Taille: $([math]::Round($distSize, 1)) MB"
    
    if (-not (Test-Path "HISTORIQUE_DEPLOIEMENTS.md")) {
        "# Historique des deploiements Netlify`n" | Out-File -FilePath "HISTORIQUE_DEPLOIEMENTS.md" -Encoding UTF8
    }
    Add-Content -Path "HISTORIQUE_DEPLOIEMENTS.md" -Value $logEntry
    
} else {
    Show-Error "Echec du deploiement"
}
