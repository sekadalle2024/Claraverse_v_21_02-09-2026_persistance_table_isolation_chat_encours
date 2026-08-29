# Test de l'export Synthèse CAC
# Ce script teste l'endpoint d'export de synthèse CAC

Write-Host "🧪 Test Export Synthèse CAC" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Données de test
$testData = @{
    frap_points = @(
        @{
            metadata = @{
                etape = "Frap"
                norme = "14.3 Évaluation des constats"
                methode = "Méthode des constats d'audit par les risques critiques"
                reference = "Frap-001"
            }
            intitule = "Perte de liasses de facturation due à l'absence de rapprochement et de traçabilité"
            observation = "La procédure de gestion des ventes et de la facturation exige que toutes les factures émises soient numérotées séquentiellement."
            constat = "L'inexistence d'un rapprochement formalisé et documenté entre les factures émises et le journal des ventes a été confirmée."
            risque = "Risque de perte financière directe pour l'entreprise. Risque de non-exhaustivité des produits enregistrés."
            recommandation = "Rendre obligatoire le rapprochement hebdomadaire des factures émises avec les bons de livraison et le journal des ventes."
        }
    )
    recos_revision_points = @(
        @{
            metadata = @{
                etape = "Recommendations comptables"
                norme = "Norme ISA"
                methode = "Méthode de la régularisation des comptes par les assertions"
                reference = "Recos revision-001"
            }
            intitule = "Dépenses de caisse non appuyées par des pièces justificatives probantes"
            description = "Nous avons mis en œuvre une procédure de rapprochement des pièces justificatives de caisse."
            observation = "Le rapprochement effectué fait ressortir un écart de 600 000 FCFA au 31.12.N."
            ajustement = "Nous proposons un ajustement pour sur-évaluation de charges d'un montant de 600 000 FCFA."
            regularisation = "Nous proposons le débit du compte 571 000 — Caisse pour un montant de 600 000 FCFA TTC."
        }
    )
    recos_controle_interne_points = @(
        @{
            metadata = @{
                etape = "Recos contrôle interne comptable"
                norme = "14.3 Évaluation des constats"
                methode = "Méthode des constats d'audit par les risques critiques"
                reference = "Recos contrôle interne comptable-001"
            }
            intitule = "Absence de rapprochement bancaire mensuel formalisé"
            observation = "Les procédures internes prévoient un rapprochement bancaire mensuel systématique."
            constat = "Aucun rapprochement bancaire formalisé n'a été retrouvé sur les 6 derniers mois."
            risque = "Risque de non-détection d'erreurs bancaires. Risque de fraude non détectée."
            recommandation = "Mettre en place un rapprochement bancaire mensuel obligatoire avec formalisation par fiche de contrôle."
        }
    )
    date_rapport = "2026-03-24"
    entite = "Société Test CAC"
    exercice = "2025"
}

$jsonData = $testData | ConvertTo-Json -Depth 10

Write-Host "📋 Données de test préparées:" -ForegroundColor Green
Write-Host "   - FRAP: $($testData.frap_points.Count) point(s)" -ForegroundColor Yellow
Write-Host "   - Recos Révision: $($testData.recos_revision_points.Count) point(s)" -ForegroundColor Yellow
Write-Host "   - Recos CI: $($testData.recos_controle_interne_points.Count) point(s)" -ForegroundColor Yellow
Write-Host ""

# Test de l'endpoint
Write-Host "🚀 Envoi de la requête à l'API..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/word/export-synthese-cac" `
        -Method POST `
        -ContentType "application/json" `
        -Body $jsonData `
        -OutFile "synthese_cac_test.docx"
    
    if (Test-Path "synthese_cac_test.docx") {
        $fileSize = (Get-Item "synthese_cac_test.docx").Length
        Write-Host "✅ Export réussi!" -ForegroundColor Green
        Write-Host "   Fichier: synthese_cac_test.docx" -ForegroundColor Yellow
        Write-Host "   Taille: $fileSize octets" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📄 Ouvrez le fichier pour vérifier le contenu." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Le fichier n'a pas été créé" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Erreur lors de l'appel API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Vérifiez que le backend est démarré (python main.py)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test terminé" -ForegroundColor Cyan
