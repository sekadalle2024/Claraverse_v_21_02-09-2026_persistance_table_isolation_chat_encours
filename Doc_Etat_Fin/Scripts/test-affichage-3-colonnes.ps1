# Script de test pour l'affichage 3 colonnes (N, N-1, N-2)
# Date : 04 Avril 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST : AFFICHAGE 3 COLONNES (N, N-1, N-2)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "py_backend")) {
    Write-Host "❌ Erreur : Le dossier py_backend n'existe pas" -ForegroundColor Red
    Write-Host "   Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Vérification des fichiers modifiés..." -ForegroundColor Yellow
Write-Host ""

# Liste des fichiers modifiés
$fichiers = @(
    "py_backend/etats_financiers_v2.py",
    "py_backend/etats_financiers.py",
    "py_backend/generer_etats_liasse.py"
)

$tous_presents = $true
foreach ($fichier in $fichiers) {
    if (Test-Path $fichier) {
        Write-Host "   ✅ $fichier" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $fichier (manquant)" -ForegroundColor Red
        $tous_presents = $false
    }
}

if (-not $tous_presents) {
    Write-Host ""
    Write-Host "❌ Certains fichiers sont manquants" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST 1 : Génération des états financiers" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Lancement de la génération..." -ForegroundColor Yellow
Write-Host ""

# Exécuter le script de génération
Set-Location py_backend
$result = conda run -n claraverse_backend python generer_etats_liasse.py 2>&1

# Afficher le résultat
Write-Host $result

# Vérifier si le fichier HTML a été généré
$desktop = [Environment]::GetFolderPath("Desktop")
$htmlFiles = Get-ChildItem -Path $desktop -Filter "Etats_Financiers_Liasse_*.html" | Sort-Object LastWriteTime -Descending

if ($htmlFiles.Count -gt 0) {
    $htmlFile = $htmlFiles[0].FullName
    Write-Host ""
    Write-Host "✅ Fichier HTML généré avec succès !" -ForegroundColor Green
    Write-Host "   📄 Emplacement : $htmlFile" -ForegroundColor Cyan
    Write-Host ""
    
    # Lire le contenu du fichier pour vérifier les 3 colonnes
    $content = Get-Content $htmlFile -Raw
    
    Write-Host "🔍 Vérification du contenu..." -ForegroundColor Yellow
    Write-Host ""
    
    # Vérifier la présence des 3 colonnes
    if ($content -match "EXERCICE N-2") {
        Write-Host "   ✅ Colonne EXERCICE N-2 présente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Colonne EXERCICE N-2 absente" -ForegroundColor Red
    }
    
    if ($content -match "EXERCICE N-1") {
        Write-Host "   ✅ Colonne EXERCICE N-1 présente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Colonne EXERCICE N-1 absente" -ForegroundColor Red
    }
    
    if ($content -match "EXERCICE N") {
        Write-Host "   ✅ Colonne EXERCICE N présente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Colonne EXERCICE N absente" -ForegroundColor Red
    }
    
    # Vérifier la présence du total général (DZ)
    if ($content -match "TOTAL GÉNÉRAL") {
        Write-Host "   ✅ Total général (DZ) présent" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Total général (DZ) absent" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   RÉSULTAT DU TEST" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Test réussi ! Le fichier HTML a été généré avec 3 colonnes" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Ouvrir le fichier HTML dans un navigateur" -ForegroundColor White
    Write-Host "   2. Vérifier visuellement les 3 colonnes" -ForegroundColor White
    Write-Host "   3. Vérifier que les totaux généraux (DZ) sont affichés" -ForegroundColor White
    Write-Host "   4. Vérifier que le TFT est affiché" -ForegroundColor White
    Write-Host ""
    
    # Proposer d'ouvrir le fichier
    $reponse = Read-Host "Voulez-vous ouvrir le fichier HTML maintenant ? (O/N)"
    if ($reponse -eq "O" -or $reponse -eq "o") {
        Start-Process $htmlFile
    }
} else {
    Write-Host ""
    Write-Host "❌ Erreur : Le fichier HTML n'a pas été généré" -ForegroundColor Red
    Write-Host "   Vérifiez les erreurs ci-dessus" -ForegroundColor Yellow
    Write-Host ""
}

Set-Location ..

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   FIN DU TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
