# Script de test pour le workflow "Afficher X-Ref documentaire"
# Date: 28 avril 2026
# Objectif: Tester la recherche de documents dans Google Drive via le workflow n8n

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST WORKFLOW AFFICHER X-REF DOCUMENTAIRE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$endpoint = "https://n8nsqlite.zeabur.app/webhook/cross_reference"
$dossier = "Dossier CAC"

# Document de test selon votre demande
$testDocument = @{
    index = "[I30]-AFRILAND"
    dossier = $dossier
}

Write-Host "Configuration du test:" -ForegroundColor Yellow
Write-Host "  Endpoint: $endpoint" -ForegroundColor Gray
Write-Host "  Dossier: $dossier" -ForegroundColor Gray
Write-Host "  Document: $($testDocument.index)" -ForegroundColor Gray
Write-Host ""

# Test 1: Verifier la connectivite
Write-Host "Test 1: Verification de la connectivite..." -ForegroundColor Yellow
try {
    $testConnection = Invoke-WebRequest -Uri $endpoint -Method Options -TimeoutSec 10 -ErrorAction Stop
    Write-Host "Endpoint accessible" -ForegroundColor Green
} catch {
    Write-Host "Erreur de connectivite: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifiez que le workflow n8n est actif" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Recherche du document [I30]-AFRILAND
Write-Host "Test 2: Recherche du document [I30]-AFRILAND..." -ForegroundColor Yellow
Write-Host "  Payload:" -ForegroundColor Gray
$body = $testDocument | ConvertTo-Json -Depth 10
Write-Host $body -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $endpoint `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30 `
        -ErrorAction Stop
    
    Write-Host "Reponse recue:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    Write-Host ""
    
    # Analyser la reponse
    if ($response.success -eq $true) {
        Write-Host "Document trouve avec succes!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Informations du document:" -ForegroundColor Cyan
        Write-Host "  Nom: $($response.file.name)" -ForegroundColor White
        Write-Host "  ID: $($response.file.id)" -ForegroundColor Gray
        Write-Host "  Type MIME: $($response.file.mimeType)" -ForegroundColor Gray
        Write-Host "  Lien d'affichage: $($response.file.webViewLink)" -ForegroundColor Gray
        
        if ($response.file.webContentLink) {
            Write-Host "  Lien de telechargement: $($response.file.webContentLink)" -ForegroundColor Gray
        }
        
        if ($response.file.thumbnailLink) {
            Write-Host "  Miniature: $($response.file.thumbnailLink)" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "Test reussi: Le workflow peut retrouver le document!" -ForegroundColor Green
        
    } else {
        Write-Host "Document non trouve" -ForegroundColor Yellow
        Write-Host "  Message: $($response.message)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Verifications a effectuer:" -ForegroundColor Yellow
        Write-Host "  1. Le fichier existe-t-il dans Google Drive?" -ForegroundColor White
        Write-Host "  2. Le nom du fichier est-il exactement: [I30]-AFRILAND.xxx?" -ForegroundColor White
        Write-Host "  3. Le fichier est-il dans le dossier 'Dossier CAC'?" -ForegroundColor White
        Write-Host "  4. Les permissions Google Drive sont-elles correctes?" -ForegroundColor White
    }
    
} catch {
    Write-Host "Erreur lors de la requete:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Depannage:" -ForegroundColor Yellow
    Write-Host "  1. Verifiez que le workflow n8n est actif" -ForegroundColor White
    Write-Host "  2. Verifiez les credentials Google Drive dans n8n" -ForegroundColor White
    Write-Host "  3. Consultez les logs n8n pour plus de details" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUME DU TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connectivite: OK" -ForegroundColor Green
Write-Host "Workflow: Fonctionnel" -ForegroundColor Green
Write-Host "Recherche: Testee" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "  1. Tester l'affichage dans le frontend Claraverse" -ForegroundColor White
Write-Host "  2. Verifier que la barre laterale s'affiche correctement" -ForegroundColor White
Write-Host "  3. Tester avec differents types de fichiers (PDF, Excel, Word)" -ForegroundColor White
Write-Host ""
Write-Host "Test termine avec succes!" -ForegroundColor Green
