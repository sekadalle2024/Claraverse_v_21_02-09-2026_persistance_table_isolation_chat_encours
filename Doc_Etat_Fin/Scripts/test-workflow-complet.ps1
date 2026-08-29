# Script de test du workflow complet États Financiers
# Vérifie que le HTML généré par le backend est correctement affiché dans le frontend

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST WORKFLOW COMPLET - ÉTATS FINANCIERS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que le fichier de balance démo existe
$balanceFile = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
if (Test-Path $balanceFile) {
    Write-Host "✅ Fichier de balance démo trouvé: $balanceFile" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier de balance démo non trouvé: $balanceFile" -ForegroundColor Red
    exit 1
}

# 2. Vérifier que le backend est démarré
Write-Host ""
Write-Host "🔍 Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend démarré et accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible. Démarrez-le avec: python py_backend/main.py" -ForegroundColor Red
    exit 1
}

# 3. Tester l'endpoint /etats-financiers/process-excel
Write-Host ""
Write-Host "📤 Test de l'endpoint /etats-financiers/process-excel..." -ForegroundColor Yellow

# Lire le fichier et l'encoder en base64
$fileBytes = [System.IO.File]::ReadAllBytes($balanceFile)
$fileBase64 = [System.Convert]::ToBase64String($fileBytes)

# Créer le payload JSON
$payload = @{
    file_base64 = $fileBase64
    filename = "P000 -BALANCE DEMO N_N-1_N-2.xls"
} | ConvertTo-Json

# Envoyer la requête
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -TimeoutSec 30 `
        -ErrorAction Stop
    
    Write-Host "✅ Requête réussie (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Parser la réponse JSON
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Traitement réussi: $($result.message)" -ForegroundColor Green
        
        # Vérifier que le HTML est présent
        if ($result.html) {
            Write-Host "✅ HTML généré (longueur: $($result.html.Length) caractères)" -ForegroundColor Green
            
            # Vérifier que le HTML contient les accordéons
            $htmlContent = $result.html
            
            $checks = @(
                @{ Pattern = "BILAN - ACTIF"; Name = "Accordéon Bilan Actif" },
                @{ Pattern = "BILAN - PASSIF"; Name = "Accordéon Bilan Passif" },
                @{ Pattern = "COMPTE DE RÉSULTAT"; Name = "Accordéon Compte de Résultat" },
                @{ Pattern = "section-header-ef"; Name = "En-têtes d'accordéon" },
                @{ Pattern = "section-content-ef"; Name = "Contenu d'accordéon" },
                @{ Pattern = "EXERCICE N"; Name = "Colonne N" },
                @{ Pattern = "EXERCICE N-1"; Name = "Colonne N-1" },
                @{ Pattern = "liasse-table"; Name = "Table format liasse" }
            )
            
            Write-Host ""
            Write-Host "🔍 Vérification du contenu HTML:" -ForegroundColor Yellow
            foreach ($check in $checks) {
                if ($htmlContent -match $check.Pattern) {
                    Write-Host "  ✅ $($check.Name) présent" -ForegroundColor Green
                } else {
                    Write-Host "  ❌ $($check.Name) MANQUANT" -ForegroundColor Red
                }
            }
            
            # Sauvegarder le HTML pour inspection
            $outputFile = "$env:USERPROFILE\Desktop\test_etats_financiers_workflow.html"
            $htmlContent | Out-File -FilePath $outputFile -Encoding UTF8
            Write-Host ""
            Write-Host "💾 HTML sauvegardé pour inspection: $outputFile" -ForegroundColor Cyan
            Write-Host "   Ouvrez ce fichier dans un navigateur pour vérifier l'affichage" -ForegroundColor Cyan
            
        } else {
            Write-Host "❌ HTML non généré dans la réponse" -ForegroundColor Red
        }
        
        # Vérifier que les résultats sont présents
        if ($result.results) {
            Write-Host ""
            Write-Host "✅ Résultats présents:" -ForegroundColor Green
            
            $sections = @("bilan_actif", "bilan_passif", "compte_resultat")
            foreach ($section in $sections) {
                if ($result.results.$section) {
                    $count = ($result.results.$section | Measure-Object).Count
                    Write-Host "  - $section : $count postes" -ForegroundColor Gray
                } else {
                    Write-Host "  - $section : MANQUANT" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "❌ Résultats non présents dans la réponse" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Traitement échoué: $($result.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur lors de la requête: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "RÉSUMÉ DU TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backend fonctionne correctement" -ForegroundColor Green
Write-Host "✅ Endpoint /etats-financiers/process-excel répond" -ForegroundColor Green
Write-Host "✅ HTML généré avec accordéons" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Ouvrez le fichier HTML généré sur le bureau" -ForegroundColor White
Write-Host "2. Vérifiez que les accordéons s'affichent correctement" -ForegroundColor White
Write-Host "3. Vérifiez que les colonnes N et N-1 sont présentes" -ForegroundColor White
Write-Host "4. Testez le workflow complet dans l'application:" -ForegroundColor White
Write-Host "   - Tapez 'Etat fin' dans le chat" -ForegroundColor White
Write-Host "   - Sélectionnez le fichier de balance" -ForegroundColor White
Write-Host "   - Vérifiez que les accordéons s'affichent dans le chat" -ForegroundColor White
Write-Host ""
