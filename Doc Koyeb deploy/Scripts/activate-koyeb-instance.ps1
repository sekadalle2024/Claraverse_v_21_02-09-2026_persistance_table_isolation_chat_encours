# Script d'Activation de l'Instance Koyeb
# Usage: .\activate-koyeb-instance.ps1

# Configuration
$API_URL = "https://proud-del-saasauditnterne-9f15de46.koyeb.app"
$SWAGGER_URL = "$API_URL/docs"
$HEALTH_URL = "$API_URL/health"

# Couleurs
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error-Custom { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning-Custom { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║       Activation Instance Koyeb - Clara Backend       ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

Write-Info "Service: back-end-python-v0-03-03-2026"
Write-Info "URL API: $API_URL"
Write-Info "Swagger: $SWAGGER_URL"
Write-Host ""

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$Timeout = 90
    )
    
    Write-Host "🔍 Test de $Name..." -ForegroundColor Yellow
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $Timeout -ErrorAction Stop
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        if ($response.StatusCode -eq 200) {
            Write-Success "$Name répond (${duration}s)"
            return $true
        } else {
            Write-Warning-Custom "$Name répond avec code $($response.StatusCode)"
            return $false
        }
    } catch {
        $errorMessage = $_.Exception.Message
        Write-Error-Custom "$Name ne répond pas : $errorMessage"
        return $false
    }
}

# Étape 1: Tester l'endpoint racine
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "ÉTAPE 1: Activation de l'instance" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Write-Info "Envoi de la requête d'activation..."
Write-Warning-Custom "Cela peut prendre 30-60 secondes si l'instance est endormie"
Write-Host ""

$rootSuccess = Test-Endpoint -Url $API_URL -Name "Endpoint racine" -Timeout 90

# Étape 2: Tester le health check (si disponible)
if ($rootSuccess) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "ÉTAPE 2: Vérification du health check" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
    
    $healthSuccess = Test-Endpoint -Url $HEALTH_URL -Name "Health check" -Timeout 10
}

# Étape 3: Tester Swagger
if ($rootSuccess) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "ÉTAPE 3: Vérification de Swagger" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
    
    $swaggerSuccess = Test-Endpoint -Url $SWAGGER_URL -Name "Swagger UI" -Timeout 10
}

# Résumé
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                      RÉSUMÉ                            ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

if ($rootSuccess) {
    Write-Success "Instance Koyeb activée avec succès !"
    Write-Host ""
    
    Write-Host "📊 Endpoints disponibles:" -ForegroundColor Cyan
    Write-Host "   • API racine : $API_URL" -ForegroundColor Green
    if ($healthSuccess) {
        Write-Host "   • Health check : $HEALTH_URL" -ForegroundColor Green
    }
    if ($swaggerSuccess) {
        Write-Host "   • Swagger UI : $SWAGGER_URL" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🌐 Ouvrir Swagger dans le navigateur?" -ForegroundColor Yellow
    $openBrowser = Read-Host "   (O/n)"
    
    if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
        Write-Info "Ouverture de Swagger..."
        Start-Process $SWAGGER_URL
    }
    
    Write-Host ""
    Write-Host "💡 L'instance restera active tant qu'elle reçoit des requêtes" -ForegroundColor Cyan
    Write-Host "   Elle se rendormira après 65 minutes d'inactivité" -ForegroundColor Gray
    
} else {
    Write-Error-Custom "Échec de l'activation de l'instance"
    Write-Host ""
    
    Write-Host "🔧 Solutions possibles:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. Vérifier les logs de l'instance:" -ForegroundColor Cyan
    Write-Host "   koyeb service logs back-end-python-v0-03-03-2026 --follow" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. Vérifier le statut dans le dashboard:" -ForegroundColor Cyan
    Write-Host "   https://app.koyeb.com/services/back-end-python-v0-03-03-2026" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "3. Redéployer manuellement:" -ForegroundColor Cyan
    Write-Host "   Dashboard > Redeploy (bouton vert)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "4. Vérifier le repository Github:" -ForegroundColor Cyan
    Write-Host "   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "5. Consulter la documentation:" -ForegroundColor Cyan
    Write-Host "   Doc Koyeb deploy\GUIDE_ACTIVATION_INSTANCE_KOYEB.md" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Ouvrir le dashboard Koyeb?" -ForegroundColor Yellow
    $openDashboard = Read-Host "   (O/n)"
    
    if ($openDashboard -ne "n" -and $openDashboard -ne "N") {
        Start-Process "https://app.koyeb.com/services/back-end-python-v0-03-03-2026"
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
