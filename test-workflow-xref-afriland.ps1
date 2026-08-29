# Test Workflow N8N - Document [I30]-AFRILAND
# Date: 28 avril 2026

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   TEST WORKFLOW N8N - DOCUMENT [I30]-AFRILAND" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$endpoint = "https://n8nsqlite.zeabur.app/webhook/cross_reference"
$documentIndex = "[I30]-AFRILAND"
$dossier = "Dossier CAC"

Write-Host "Configuration" -ForegroundColor Yellow
Write-Host "   Endpoint: $endpoint" -ForegroundColor Gray
Write-Host "   Document: $documentIndex" -ForegroundColor Gray
Write-Host "   Dossier: $dossier" -ForegroundColor Gray
Write-Host ""

# Preparer le body
# VERSION SIMPLIFIEE: envoyer directement index et dossier
$body = @{
    index = $documentIndex
    dossier = $dossier
} | ConvertTo-Json

Write-Host "Corps de la requete:" -ForegroundColor Yellow
Write-Host $body -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "Envoi de la requete au workflow n8n..." -ForegroundColor Yellow
    Write-Host ""
    
    $response = Invoke-RestMethod -Uri $endpoint `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30
    
    Write-Host "Reponse recue avec succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "REPONSE DU WORKFLOW" -ForegroundColor Cyan
    Write-Host ""
    
    # Afficher la reponse complete
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    Write-Host ""
    
    # Analyser la reponse
    Write-Host "ANALYSE DE LA REPONSE" -ForegroundColor Cyan
    Write-Host ""
    
    if ($response.success) {
        Write-Host "Statut: SUCCESS" -ForegroundColor Green
        Write-Host ""
        
        if ($response.file) {
            Write-Host "Informations du fichier trouve:" -ForegroundColor Green
            Write-Host ""
            Write-Host "   File ID: $($response.file.id)" -ForegroundColor White
            Write-Host "   File Name: $($response.file.name)" -ForegroundColor White
            Write-Host "   File URL: $($response.file.webViewLink)" -ForegroundColor White
            Write-Host "   MIME Type: $($response.file.mimeType)" -ForegroundColor White
            Write-Host ""
            
            # Verifier si le nom correspond
            if ($response.file.name -like "*I30*" -or $response.file.name -like "*AFRILAND*") {
                Write-Host "Le nom du fichier correspond au document recherche !" -ForegroundColor Green
            } else {
                Write-Host "Le nom du fichier ne semble pas correspondre exactement" -ForegroundColor Yellow
            }
            
        } else {
            Write-Host "Aucune information de fichier dans la reponse" -ForegroundColor Yellow
        }
        
        if ($response.message) {
            Write-Host ""
            Write-Host "Message: $($response.message)" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "Statut: ECHEC" -ForegroundColor Red
        Write-Host ""
        
        if ($response.message) {
            Write-Host "Message d'erreur: $($response.message)" -ForegroundColor Red
        }
        
        if ($response.error) {
            Write-Host "Details de l'erreur: $($response.error)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "TEST TERMINE AVEC SUCCES" -ForegroundColor Green
    
} catch {
    Write-Host "ERREUR LORS DE L'EXECUTION DU TEST" -ForegroundColor Red
    Write-Host ""
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "TEST ECHOUE" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   FIN DU TEST" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
