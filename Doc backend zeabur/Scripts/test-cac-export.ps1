# 🧪 TEST ENDPOINT EXPORT CAC FINAL
# ═══════════════════════════════════════════════════════════════════════════════

$backendUrl = "https://pybackend.zeabur.app"
$endpoint = "/api/word/export-synthese-cac-final"

Write-Host "🧪 Test de l'endpoint : $backendUrl$endpoint" -ForegroundColor Cyan

$body = @{
    entite = "Test Entity"
    exercice = "2023"
    date_rapport = "23/04/2026"
    frap_points = @()
    recos_revision_points = @(@{
        intitule = "Test Observation"
        observation = "Ceci est un test"
        metadata = @{ reference = "REF001" }
    })
    recos_controle_interne_points = @()
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "$backendUrl$endpoint" -Method Post -Body $body -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Succès ! Fichier Word généré." -ForegroundColor Green
        Write-Host "   Taille du fichier : $($response.RawContentLength) octets" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
}
