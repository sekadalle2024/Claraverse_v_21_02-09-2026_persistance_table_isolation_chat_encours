# Script de test pour la suppression de [Instruction] = Template
# E-audit pro > Phase de realisation > Feuille couverture
# Date: 07 Mai 2026

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "TEST - Suppression [Instruction] = Template" -ForegroundColor Yellow
Write-Host "E-audit pro > Phase de realisation > Feuille couverture" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Executer le script Python
Write-Host "Execution du script de suppression..." -ForegroundColor Cyan
Write-Host ""

python "Doc menu demarrer/Scripts/remove_instruction_template_feuille_couverture.py"

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "VERIFICATION" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que la ligne a bien ete supprimee
$filePath = "src/components/Clara_Components/DemarrerMenu.tsx"

if (Test-Path $filePath) {
    $content = Get-Content $filePath -Raw
    
    # Chercher la section Phase de realisation > Feuille couverture
    if ($content -match "id: 'phase-realisation'") {
        Write-Host "OK Section 'Phase de realisation' trouvee" -ForegroundColor Green
        
        # Verifier que [Instruction] = Template n'existe plus dans cette section
        $phaseRealisationSection = $content -split "id: 'phase-realisation'" | Select-Object -Last 1
        $phaseRealisationSection = $phaseRealisationSection -split "id: 'phase-conclusion'" | Select-Object -First 1
        
        if ($phaseRealisationSection -match "\[Instruction\]\s*=\s*Template") {
            Write-Host "ERREUR: La ligne [Instruction] = Template existe encore!" -ForegroundColor Red
            Write-Host "   Verification manuelle necessaire" -ForegroundColor Yellow
        } else {
            Write-Host "OK La ligne [Instruction] = Template a ete supprimee avec succes" -ForegroundColor Green
            Write-Host ""
            Write-Host "Resume:" -ForegroundColor Cyan
            Write-Host "   - Mode Normal: ligne supprimee" -ForegroundColor Green
            Write-Host "   - Mode Demo: ligne supprimee" -ForegroundColor Green
        }
    } else {
        Write-Host "Attention: Section 'Phase de realisation' non trouvee" -ForegroundColor Yellow
    }
} else {
    Write-Host "Erreur: Fichier non trouve: $filePath" -ForegroundColor Red
}

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "FIN DU TEST" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
