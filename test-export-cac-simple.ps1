# Test simple Export Synthese CAC

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST EXPORT SYNTHESE CAC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Donnees de test
$testData = @{
    frap_points = @(
        @{
            metadata = @{
                etape = "Frap"
                norme = "14.3 Evaluation des constats"
                methode = "Methode des constats d'audit"
                reference = "Frap-001"
            }
            intitule = "Perte de liasses de facturation"
            observation = "La procedure de gestion des ventes exige une numerotation sequentielle."
            constat = "- Inexistence d'un rapprochement formalise`n- Ruptures dans la sequence numerique"
            risque = "- Risque de perte financiere directe`n- Risque de non-exhaustivite des produits"
            recommandation = "- Rendre obligatoire le rapprochement hebdomadaire`n- Mettre en place un controle de second niveau"
        }
    )
    recos_revision_points = @(
        @{
            metadata = @{
                etape = "Recommendations comptables"
                norme = "Norme ISA"
                methode = "Methode de la regularisation des comptes"
                reference = "Recos revision-001"
            }
            intitule = "Depenses de caisse non appuyees par des pieces justificatives"
            description = "Nous avons mis en oeuvre une procedure de rapprochement des pieces justificatives de caisse."
            observation = "Le rapprochement effectue fait ressortir un ecart de 600 000 FCFA au 31.12.N."
            ajustement = "Nous proposons un ajustement pour sur-evaluation de charges de 600 000 FCFA."
            regularisation = "Debit du compte 571 000 - Caisse pour 600 000 FCFA TTC."
        }
    )
    recos_controle_interne_points = @(
        @{
            metadata = @{
                etape = "Recos controle interne comptable"
                norme = "14.3 Evaluation des constats"
                methode = "Methode des constats d'audit"
                reference = "Recos CI-001"
            }
            intitule = "Absence de rapprochement bancaire mensuel formalise"
            observation = "Conformement aux dispositions du SYSCOHADA revise, toute entite doit effectuer un rapprochement bancaire mensuel."
            constat = "Inexistence de rapprochements bancaires formalises sur les 6 derniers mois."
            risque = "- Detournement d'actifs non detecte`n- Erreurs bancaires non identifiees"
            recommandation = "- Rendre obligatoire le rapprochement bancaire mensuel`n- Formaliser par un PV signe"
        }
    )
    dat