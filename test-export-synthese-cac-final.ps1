# Test Export Synthèse CAC - VERSION FINALE
# Teste le nouvel endpoint avec template et contenu complet

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST EXPORT SYNTHÈSE CAC - VERSION FINALE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le backend est démarré
Write-Host "🔍 Vérification du backend..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend actif" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible sur http://localhost:5000" -ForegroundColor Red
    Write-Host "   Démarrez le backend avec: .\start-claraverse.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📝 Préparation des données de test..." -ForegroundColor Yellow

# Données de test complètes
$testData = @{
    frap_points = @(
        @{
            metadata = @{
                etape = "Frap"
                norme = "14.3 Évaluation des constats"
                methode = "Méthode des constats d'audit par les risques critiques"
                reference = "Frap-001"
            }
            intitule = "Perte de liasses de facturation due à l'absence de rapprochement"
            observation = "La procédure de gestion des ventes exige une numérotation séquentielle.\n\nNos travaux ont consisté à tester l'application de cette procédure."
            constat = "- Inexistence d'un rapprochement formalisé\n- Ruptures dans la séquence numérique\n- Montant cumulé: 8 880 000 FCFA"
            risque = "- Risque de perte financière directe\n- Risque de non-exhaustivité des produits\n- Risque d'information financière non fiable"
            recommandation = "- Rendre obligatoire le rapprochement hebdomadaire\n- Mettre en place un contrôle de second niveau\n- Sécuriser l'archivage des liasses"
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
            description = "Nous avons mis en œuvre une procédure de rapprochement des pièces justificatives de caisse.\n\nCette procédure vise à s'assurer que chaque décaissement est adossé à une pièce justificative probante."
            observation = "Le rapprochement effectué fait ressortir un écart de 600 000 FCFA au 31.12.N.\n\nDes décaissements ne sont appuyés d'aucune pièce justificative probante."
            ajustement = "Nous proposons un ajustement pour sur-évaluation de charges de 600 000 FCFA.\n\nConformément au SYSCOHADA Révisé, une charge ne peut être reconnue sans pièce justificative."
            regularisation = "Débit du compte 571 000 — Caisse pour 600 000 FCFA TTC.\n\nCrédit du compte 601 XXX — Charges fournisseurs pour le montant HT."
        }
    )
    recos_controle_interne_points = @(
        @{
            metadata = @{
                etape = "Recos contrôle interne comptable"
                norme = "14.3 Évaluation des constats"
                methode = "Méthode des constats d'audit par les risques critiques"
                reference = "Recos CI-001"
            }
            intitule = "Absence de rapprochement bancaire mensuel formalisé"
            observation = "Conformément aux dispositions du SYSCOHADA révisé, toute entité doit effectuer un rapprochement bancaire mensuel.\n\nLa procédure interne stipule un rapprochement mensuel obligatoire."
            constat = "Inexistence de rapprochements bancaires formalisés sur les 6 derniers mois.\n\nAucun contrôle de supervision n'est formalisé."
            risque = "- Détournement d'actifs non détecté\n- Erreurs bancaires non identifiées\n- Information financière non fiable"
            recommandation = "- Rendre obligatoire le rapprochement bancaire mensuel\n- Formaliser par un PV signé\n- Mettre en place un contrôle de second niveau"
        }
    )
    date_rapport = "2026-03-25"
    entite = "SOCIÉTÉ DE TEST SARL"
    exercice = "2025"
}

Write-Host "✅ Données préparées:" -ForegroundColor Green
Write-Host "   - FRAP: $($testData.frap_points.Count) point(s)" -ForegroundColor White
Write-Host "   - Recos Révision: $($testData.recos_revision_points.Count) point(s)" -ForegroundColor White
Write-Host "   - Recos CI: $($testData.recos_controle_interne_points.Count) point(s)" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Appel de l'endpoint /export-synthese-cac-final..." -ForegroundColor Yellow

try {
    $jsonBody = $testData | ConvertTo-Json -Depth 10
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/word/export-synthese-cac-final" `
        -Method Post `
        -ContentType "application/json" `
        -Body $jsonBody `
        -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Requête réussie (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Sauvegarder le fichier
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $filename = "synthese_cac_test_$timestamp.docx"
        $filepath = Join-Path (Get-Location) $filename
        
        [System.IO.File]::WriteAllBytes($filepath, $response.Content)
        
        Write-Host ""
        Write-Host "📄 Fichier généré:" -ForegroundColor Green
        Write-Host "   $filepath" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 Taille du fichier: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "   VÉRIFICATIONS À EFFECTUER" -ForegroundColor Cyan
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Ouvrez le fichier Word et vérifiez:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "✓ Template utilisé comme base" -ForegroundColor White
        Write-Host "✓ Section 2: OBSERVATIONS D'AUDIT" -ForegroundColor White
        Write-Host "  - Sommaire avec liste des points" -ForegroundColor Gray
        Write-Host "  - Champ 'Description' présent" -ForegroundColor Gray
        Write-Host "  - Champ 'Observation' présent" -ForegroundColor Gray
        Write-Host "  - Champ 'Ajustement' présent" -ForegroundColor Gray
        Write-Host "  - Champ 'Régularisation' présent" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✓ Section 3: POINTS DE CONTRÔLE INTERNE" -ForegroundColor White
        Write-Host "  - Sommaire avec liste des points" -ForegroundColor Gray
        Write-Host "  - Points FRAP et Recos CI combinés" -ForegroundColor Gray
        Write-Host "  - Tous les champs présents" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✓ Retours à la ligne corrects" -ForegroundColor White
        Write-Host "✓ Formatage professionnel" -ForegroundColor White
        Write-Host ""
        
        # Ouvrir le fichier automatiquement
        Write-Host "🔍 Ouverture du fichier..." -ForegroundColor Yellow
        Start-Process $filepath
        
        Write-Host ""
        Write-Host "✅ TEST RÉUSSI!" -ForegroundColor Green
        
    } else {
        Write-Host "⚠️ Réponse inattendue (Status: $($response.StatusCode))" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ ERREUR lors de l'appel API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Détails de l'erreur:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "💡 Vérifiez:" -ForegroundColor Yellow
    Write-Host "   1. Le backend est bien démarré" -ForegroundColor White
    Write-Host "   2. Le fichier export_synthese_cac_final.py existe" -ForegroundColor White
    Write-Host "   3. Le template Word existe dans 'Doc export rapport/'" -ForegroundColor White
    Write-Host "   4. Les logs du backend pour plus de détails" -ForegroundColor White
    
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
