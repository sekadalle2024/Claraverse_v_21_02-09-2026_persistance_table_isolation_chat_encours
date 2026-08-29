# Script pour comparer la version locale et Netlify
# Identifie les differences

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPARAISON LOCAL vs NETLIFY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obtenir le chemin du projet
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Split-Path -Parent $scriptPath

Write-Host "Analyse de la version locale..." -ForegroundColor Yellow
Write-Host ""

# Verifier les fichiers cles
$fichiersCles = @(
    "src/components/Clara_Components/DemarrerMenu.tsx",
    "src/components/Clara_Components/CyclesComptablesSidebar.tsx",
    "src/components/Clara_Components/GuideCommandesAccordionRenderer.tsx",
    "src/components/Clara_Components/MethodoRevisionAccordionRenderer.tsx",
    "src/services/claraApiService.ts",
    "public/menu.js",
    "index.html"
)

Write-Host "FICHIERS CLES A VERIFIER:" -ForegroundColor Cyan
Write-Host ""

foreach ($fichier in $fichiersCles) {
    $cheminComplet = Join-Path $projectPath $fichier
    if (Test-Path $cheminComplet) {
        $taille = (Get-Item $cheminComplet).Length
        $dateModif = (Get-Item $cheminComplet).LastWriteTime
        Write-Host "OK $fichier" -ForegroundColor Green
        Write-Host "   Taille: $taille octets" -ForegroundColor Gray
        Write-Host "   Modifie: $dateModif" -ForegroundColor Gray
    } else {
        Write-Host "MANQUANT $fichier" -ForegroundColor Red
    }
    Write-Host ""
}

# Verifier le contenu de dist/
Write-Host ""
Write-Host "CONTENU DE DIST/:" -ForegroundColor Cyan
Write-Host ""

$distPath = Join-Path $projectPath "dist"
if (Test-Path $distPath) {
    $distSize = (Get-ChildItem -Path $distPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    $fileCount = (Get-ChildItem -Path $distPath -Recurse -File -ErrorAction SilentlyContinue).Count
    
    Write-Host "Taille totale: $([math]::Round($distSize, 1)) MB" -ForegroundColor Green
    Write-Host "Nombre de fichiers: $fileCount" -ForegroundColor Green
    Write-Host ""
    
    # Verifier index.html dans dist
    $indexDist = Join-Path $distPath "index.html"
    if (Test-Path $indexDist) {
        $indexSize = (Get-Item $indexDist).Length
        Write-Host "index.html: $indexSize octets" -ForegroundColor Green
        
        # Lire les premieres lignes
        $content = Get-Content $indexDist -First 20
        Write-Host ""
        Write-Host "Apercu index.html (20 premieres lignes):" -ForegroundColor Gray
        $content | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "ERREUR: Dossier dist/ introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACTIONS A FAIRE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verifier le site Netlify: https://prclaravi.netlify.app" -ForegroundColor Yellow
Write-Host "2. Comparer avec la version locale: npm run dev" -ForegroundColor Yellow
Write-Host "3. Noter les differences specifiques" -ForegroundColor Yellow
Write-Host ""
Write-Host "QUESTIONS A REPONDRE:" -ForegroundColor Cyan
Write-Host "- Quels elements manquent exactement sur Netlify?" -ForegroundColor White
Write-Host "- S'agit-il de composants, de styles, de donnees?" -ForegroundColor White
Write-Host "- Y a-t-il des erreurs dans la console du navigateur?" -ForegroundColor White
Write-Host ""
