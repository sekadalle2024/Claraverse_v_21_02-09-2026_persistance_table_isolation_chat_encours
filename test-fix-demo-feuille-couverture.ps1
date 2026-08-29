# Script de test pour la correction de la position [Demo] = Activate
# Feuille couverture - E-audit Pro
# Date: 05 Mai 2026

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST CORRECTION [Demo] = Activate" -ForegroundColor Cyan
Write-Host "Feuille couverture - E-audit Pro" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Exécution du script Python
Write-Host "[1/2] Execution du script de correction..." -ForegroundColor Yellow
python "Doc menu demarrer/Scripts/fix_demo_position_feuille_couverture_e_audit_pro.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[OK] Correction appliquee avec succes !`n" -ForegroundColor Green
    
    Write-Host "[2/2] Verification rapide..." -ForegroundColor Yellow
    
    # Vérifier que [Demo] = Activate n'est plus avant [Nb de lignes]
    $content = Get-Content "src/components/Clara_Components/DemarrerMenu.tsx" -Raw
    $wrongPattern = [regex]::Matches($content, '\[Demo\] = Activate\n\[Nb de lignes\] = 25')
    
    if ($wrongPattern.Count -eq 0) {
        Write-Host "[OK] Aucune occurrence incorrecte detectee" -ForegroundColor Green
        
        # Vérifier que [Demo] = Activate est maintenant après [Nb de lignes]
        $correctPattern = [regex]::Matches($content, '\[Nb de lignes\] = 25\n\[Demo\] = Activate')
        
        if ($correctPattern.Count -gt 0) {
            Write-Host "[OK] $($correctPattern.Count) occurrence(s) correcte(s) trouvee(s)" -ForegroundColor Green
            Write-Host "`n========================================" -ForegroundColor Cyan
            Write-Host "SUCCES - Correction validee !" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Cyan
        } else {
            Write-Host "[WARN] Pattern correct non trouve" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[ERREUR] $($wrongPattern.Count) occurrence(s) incorrecte(s) encore presente(s)" -ForegroundColor Red
    }
    
} else {
    Write-Host "`n[ERREUR] Echec de la correction`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nPROCHAINES ETAPES :" -ForegroundColor Cyan
Write-Host "  1. Relancer l'application : npm run dev" -ForegroundColor White
Write-Host "  2. Tester : Menu Demarrer > E-audit Pro > Phase de realisation" -ForegroundColor White
Write-Host "  3. Selectionner 'Feuille couverture' > Mode Demo" -ForegroundColor White
Write-Host "  4. Verifier que [Demo] = Activate est en derniere ligne`n" -ForegroundColor White
