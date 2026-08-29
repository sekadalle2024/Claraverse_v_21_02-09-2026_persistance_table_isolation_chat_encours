# Script d'organisation des fichiers GitHub
# Deplace les fichiers lies a GitHub/Push/Deploiement vers Doc_Github_Issue

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  ORGANISATION DES FICHIERS GITHUB" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Liste des fichiers a deplacer (a la racine)
$fichiersADeplacer = @(
    # Fichiers de diagnostic push GitHub
    "00_DIAGNOSTIC_PUSH_GITHUB_109MB_04_AVRIL_2026.txt",
    "00_PUSH_GITHUB_REUSSI_31_MARS_2026.txt",
    "00_LIRE_EN_PREMIER_PUSH_GITHUB.txt",
    "LIRE_MAINTENANT_PUSH_GITHUB.txt",
    "LIRE_MAINTENANT_PUSH_16_AVRIL_2026.txt",
    "QUICK_START_PUSH_GITHUB.txt",
    "SOLUTION_PUSH_SANS_NODE_MODULES_17_AVRIL_2026.txt",
    "SOLUTION_IMMEDIATE_PUSH_17_AVRIL_2026.txt",
    "UPLOAD_RUNTIME_TXT_MAIN_BRANCH.txt",
    "UPLOAD_MANUEL_RUNTIME_TXT_MAINTENANT.txt",
    "ETAPES_GITHUB_DESKTOP_SIMPLE.txt",
    
    # Scripts de configuration Git
    "configurer-git.ps1",
    "deploy-to-github.bat",
    
    # Fichiers de commit
    "COMMIT_MESSAGE_RENDER_CLI_16_AVRIL_2026.txt",
    "GITHUB_DESKTOP_FIX_BOUTON_NOUVELLE_CONVERSATION.txt",
    "GITHUB_DESKTOP_INSTRUCTIONS_V17.2.txt",
    "GITHUB_DESKTOP_TACHE_8_MENU_CIA.txt",
    
    # Fichiers de deploiement
    "00_DEPLOIEMENT_EN_COURS.txt",
    "00_DEPLOYER_MAINTENANT.txt",
    "DEPLOYER_NETLIFY.bat",
    "deploy-direct.ps1",
    "deploy-maintenant.ps1",
    "deploy-netlify-update.ps1",
    "deploy-now.ps1",
    "deploy-simple.ps1",
    
    # Fichiers de recap push
    "00_RECAP_COMPLET_PUSH_GITHUB_05_AVRIL_2026.txt",
    "00_RECAP_COMPLET_UPDATES_GITHUB_05_AVRIL_2026.txt",
    "00_RECAP_FINAL_UPDATES_GITHUB_05_AVRIL_2026.txt",
    "00_RECAP_FINAL_SESSION_PUSH_GITHUB_16_AVRIL_2026.txt"
)

$compteur = 0
$erreurs = 0

foreach ($fichier in $fichiersADeplacer) {
    $source = Join-Path $PSScriptRoot "..\$fichier"
    $destination = Join-Path $PSScriptRoot $fichier
    
    if (Test-Path $source) {
        try {
            Move-Item -Path $source -Destination $destination -Force
            Write-Host "OK Deplace: $fichier" -ForegroundColor Green
            $compteur++
        }
        catch {
            Write-Host "ERREUR: $fichier - $_" -ForegroundColor Red
            $erreurs++
        }
    }
    else {
        Write-Host "Deja deplace ou inexistant: $fichier" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  RESUME" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Fichiers deplaces: $compteur" -ForegroundColor Green
if ($erreurs -gt 0) {
    Write-Host "Erreurs: $erreurs" -ForegroundColor Red
} else {
    Write-Host "Erreurs: $erreurs" -ForegroundColor Green
}
Write-Host ""
Write-Host "Organisation terminee!" -ForegroundColor Cyan
Write-Host ""
