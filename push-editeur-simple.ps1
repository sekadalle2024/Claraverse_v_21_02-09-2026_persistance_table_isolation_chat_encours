# Push endpoint editeur vers GitHub
Write-Host ""
Write-Host "PUSH ENDPOINT EDITEUR VERS GITHUB" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Verifier le commit
Write-Host "Etape 1: Verification du commit" -ForegroundColor Yellow
$commitInfo = git log -1 --oneline
Write-Host "Dernier commit: $commitInfo" -ForegroundColor White
Write-Host ""

# Verifier que endpoint_editeur.py est dans le commit
$fileInCommit = git diff-tree --no-commit-id --name-only -r HEAD | Select-String "endpoint_editeur.py"

if ($fileInCommit) {
    Write-Host "OK - endpoint_editeur.py est dans le commit" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "ERREUR - endpoint_editeur.py n'est PAS dans le commit" -ForegroundColor Red
    exit 1
}

# Etape 2: Push vers GitHub
Write-Host "Etape 2: Push vers GitHub" -ForegroundColor Yellow
Write-Host ""

git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCES - Push reussi vers GitHub" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERREUR - Echec du push" -ForegroundColor Red
    exit 1
}

# Etape 3: Attendre le deploiement
Write-Host "Etape 3: Attente du deploiement Zeabur (30 secondes)" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 30

# Etape 4: Tester l'endpoint
Write-Host "Etape 4: Test de l'endpoint" -ForegroundColor Yellow
Write-Host ""

Write-Host "Test 1: Health Check" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "https://pybackend.zeabur.app/editeur/health" -Method Get -ErrorAction Stop
    Write-Host "SUCCES - Health Check" -ForegroundColor Green
    $response | ConvertTo-Json
    Write-Host ""
} catch {
    Write-Host "ECHEC - Health Check" -ForegroundColor Red
    Write-Host "Erreur: $($_.Exception.Message)"
    Write-Host "Le deploiement peut prendre plus de temps. Attendez 1-2 minutes." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Test 2: Endpoint Process" -ForegroundColor Cyan
try {
    $body = @{
        command = "editeur"
        message = "test depuis PowerShell"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://pybackend.zeabur.app/editeur/process" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "SUCCES - Endpoint Process" -ForegroundColor Green
    $response | ConvertTo-Json
    Write-Host ""
} catch {
    Write-Host "ECHEC - Endpoint Process" -ForegroundColor Red
    Write-Host "Erreur: $($_.Exception.Message)"
    Write-Host ""
}

Write-Host ""
Write-Host "TERMINE" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si les tests echouent:" -ForegroundColor White
Write-Host "- Attendez 1-2 minutes pour le deploiement" -ForegroundColor Gray
Write-Host "- Verifiez les logs Zeabur" -ForegroundColor Gray
Write-Host "- Reexecutez: .\test-endpoint-editeur-zeabur.ps1" -ForegroundColor Gray
Write-Host ""
