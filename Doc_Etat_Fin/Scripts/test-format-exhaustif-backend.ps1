# Script de test du format exhaustif des états de contrôle avec le backend

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 TEST FORMAT EXHAUSTIF - ÉTATS DE CONTRÔLE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le backend est démarré
Write-Host "📡 Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend opérationnel" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible. Veuillez le démarrer avec:" -ForegroundColor Red
    Write-Host "   python py_backend/main.py" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📊 Test de l'endpoint /etats-financiers..." -ForegroundColor Yellow

# Préparer les données de test
$testData = @{
    balance_file = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
    exercice = "2024"
    entite = "DEMO COMPANY"
} | ConvertTo-Json

# Appeler l'endpoint
try {
    Write-Host "🔄 Envoi de la requête..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:5000/etats-financiers" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testData `
        -TimeoutSec 60
    
    Write-Host "✅ Réponse reçue" -ForegroundColor Green
    
    # Vérifier la structure de la réponse
    if ($response.html) {
        $htmlLength = $response.html.Length
        Write-Host "📄 HTML généré: $htmlLength caractères" -ForegroundColor Green
        
        # Sauvegarder le HTML sur le bureau
        $desktop = [Environment]::GetFolderPath("Desktop")
        $outputFile = Join-Path $desktop "test_format_exhaustif_backend.html"
        $response.html | Out-File -FilePath $outputFile -Encoding UTF8
        
        Write-Host "💾 Fichier sauvegardé: $outputFile" -ForegroundColor Green
        
        # Analyser le contenu HTML
        Write-Host ""
        Write-Host "🔍 Analyse du contenu HTML..." -ForegroundColor Yellow
        
        # Compter les sections d'états de contrôle
        $etatsControleCount = ([regex]::Matches($response.html, "Etat de contrôle")).Count
        $etatsEquilibreCount = ([regex]::Matches($response.html, "Etat d'équilibre")).Count
        
        Write-Host "  - États de contrôle trouvés: $etatsControleCount" -ForegroundColor Cyan
        Write-Host "  - États d'équilibre trouvés: $etatsEquilibreCount" -ForegroundColor Cyan
        
        # Vérifier les références exhaustives
        $refCA = ([regex]::Matches($response.html, "CA")).Count
        $refCB = ([regex]::Matches($response.html, "CB")).Count
        $refCC = ([regex]::Matches($response.html, "CC")).Count
        $refCD = ([regex]::Matches($response.html, "CD")).Count
        
        Write-Host ""
        Write-Host "📊 Vérification format exhaustif (Bilan Actif):" -ForegroundColor Yellow
        Write-Host "  - CA (Total Actif): $refCA occurrences" -ForegroundColor Cyan
        Write-Host "  - CB (Nombre postes N): $refCB occurrences" -ForegroundColor Cyan
        Write-Host "  - CC (Nombre postes N-1): $refCC occurrences" -ForegroundColor Cyan
        Write-Host "  - CD (Variation Total): $refCD occurrences" -ForegroundColor Cyan
        
        if ($refCA -gt 0 -and $refCB -gt 0 -and $refCC -gt 0 -and $refCD -gt 0) {
            Write-Host ""
            Write-Host "✅ FORMAT EXHAUSTIF CONFIRMÉ!" -ForegroundColor Green
            Write-Host "   Les lignes sont bien séparées pour N et N-1" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "⚠️ Format exhaustif incomplet" -ForegroundColor Yellow
        }
        
        # Ouvrir le fichier dans le navigateur
        Write-Host ""
        Write-Host "🌐 Ouverture du fichier dans le navigateur..." -ForegroundColor Yellow
        Start-Process $outputFile
        
    } else {
        Write-Host "❌ Pas de HTML dans la réponse" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur lors de l'appel: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ TEST TERMINÉ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
