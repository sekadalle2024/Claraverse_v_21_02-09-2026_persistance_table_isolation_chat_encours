# Script de test HTML pour les états financiers
# Date : 04 Avril 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST HTML : ÉTATS FINANCIERS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Trouver le fichier HTML le plus récent
$desktop = [Environment]::GetFolderPath("Desktop")
$htmlFile = Get-ChildItem -Path $desktop -Filter "Etats_Financiers_Liasse_*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $htmlFile) {
    Write-Host "❌ Aucun fichier HTML trouvé sur le Bureau" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Fichier testé : $($htmlFile.Name)" -ForegroundColor Yellow
Write-Host ""

# Lire le contenu
$content = Get-Content $htmlFile.FullName -Raw

Write-Host "🔍 VÉRIFICATIONS :" -ForegroundColor Yellow
Write-Host ""

# 1. Vérifier les colonnes
Write-Host "1. Colonnes :" -ForegroundColor Cyan
if ($content -match "EXERCICE N-2") {
    Write-Host "   ❌ Colonne N-2 présente (devrait être absente)" -ForegroundColor Red
} else {
    Write-Host "   ✅ Colonne N-2 absente (correct)" -ForegroundColor Green
}

if ($content -match "EXERCICE N-1") {
    Write-Host "   ✅ Colonne N-1 présente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Colonne N-1 absente" -ForegroundColor Red
}

if ($content -match "EXERCICE N") {
    Write-Host "   ✅ Colonne N présente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Colonne N absente" -ForegroundColor Red
}

Write-Host ""

# 2. Vérifier les sections
Write-Host "2. Sections :" -ForegroundColor Cyan

if ($content -match "BILAN") {
    Write-Host "   ✅ Section BILAN présente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Section BILAN absente" -ForegroundColor Red
}

if ($content -match "ACTIF") {
    Write-Host "   ✅ Section ACTIF présente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Section ACTIF absente" -ForegroundColor Red
}

if ($content -match "PASSIF") {
    Write-Host "   ✅ Section PASSIF présente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Section PASSIF absente" -ForegroundColor Red
}

if ($content -match "COMPTE DE RÃ‰SULTAT|COMPTE DE RÉSULTAT") {
    Write-Host "   ✅ Section COMPTE DE RÉSULTAT présente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Section COMPTE DE RÉSULTAT absente" -ForegroundColor Red
}

Write-Host ""

# 3. Vérifier le TFT
Write-Host "3. Tableau des Flux de Trésorerie (TFT) :" -ForegroundColor Cyan

if ($content -match "TABLEAU DES FLUX DE TRÃ‰SORERIE|TABLEAU DES FLUX DE TRÉSORERIE") {
    Write-Host "   ✅ Section TFT présente" -ForegroundColor Green
    
    if ($content -match "CAFG|Capacité d'Autofinancement") {
        Write-Host "   ✅ CAFG présent" -ForegroundColor Green
    } else {
        Write-Host "   ❌ CAFG absent" -ForegroundColor Red
    }
    
    if ($content -match "VARIATION DE LA TRÃ‰SORERIE|VARIATION DE TRÉSORERIE") {
        Write-Host "   ✅ Variation de trésorerie présente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Variation de trésorerie absente" -ForegroundColor Red
    }
    
    if ($content -match "FLUX DE TRÃ‰SORERIE DES ACTIVITÃ‰S OPÃ‰RATIONNELLES|FLUX.*OPÉRATIONNELLES") {
        Write-Host "   ✅ Flux opérationnels présents" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Flux opérationnels absents" -ForegroundColor Red
    }
    
    if ($content -match "FLUX DE TRÃ‰SORERIE DES ACTIVITÃ‰S D'INVESTISSEMENT|FLUX.*INVESTISSEMENT") {
        Write-Host "   ✅ Flux d'investissement présents" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Flux d'investissement absents" -ForegroundColor Red
    }
    
    if ($content -match "FLUX DE TRÃ‰SORERIE DES ACTIVITÃ‰S DE FINANCEMENT|FLUX.*FINANCEMENT") {
        Write-Host "   ✅ Flux de financement présents" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Flux de financement absents" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Section TFT absente" -ForegroundColor Red
}

Write-Host ""

# 4. Vérifier les annexes
Write-Host "4. Notes Annexes :" -ForegroundColor Cyan

if ($content -match "NOTES ANNEXES|ANNEXES") {
    Write-Host "   ✅ Section NOTES ANNEXES présente" -ForegroundColor Green
    
    if ($content -match "NOTE 3A|Immobilisations incorporelles") {
        Write-Host "   ✅ Note 3A présente" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Note 3A absente" -ForegroundColor Yellow
    }
    
    if ($content -match "NOTE 6|stocks") {
        Write-Host "   ✅ Note 6 (Stocks) présente" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Note 6 absente" -ForegroundColor Yellow
    }
    
    if ($content -match "NOTE 13|Résultat") {
        Write-Host "   ✅ Note 13 (Résultat) présente" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Note 13 absente" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Section NOTES ANNEXES absente" -ForegroundColor Red
}

Write-Host ""

# 5. Vérifier les totaux généraux
Write-Host "5. Totaux Généraux (DZ) :" -ForegroundColor Cyan

if ($content -match "TOTAL GÃ‰NÃ‰RAL|TOTAL GÉNÉRAL") {
    Write-Host "   ✅ Totaux généraux présents" -ForegroundColor Green
    
    if ($content -match "TOTAL GÃ‰NÃ‰RAL ACTIF|TOTAL GÉNÉRAL ACTIF") {
        Write-Host "   ✅ Total général ACTIF (DZ) présent" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Total général ACTIF absent" -ForegroundColor Red
    }
    
    if ($content -match "TOTAL GÃ‰NÃ‰RAL PASSIF|TOTAL GÉNÉRAL PASSIF") {
        Write-Host "   ✅ Total général PASSIF (DZ) présent" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Total général PASSIF absent" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Totaux généraux absents" -ForegroundColor Red
}

Write-Host ""

# 6. Vérifier les accordéons
Write-Host "6. Menu Accordéon :" -ForegroundColor Cyan

if ($content -match "section-header-ef") {
    Write-Host "   ✅ En-têtes d'accordéon présents" -ForegroundColor Green
} else {
    Write-Host "   ❌ En-têtes d'accordéon absents" -ForegroundColor Red
}

if ($content -match "section-content-ef") {
    Write-Host "   ✅ Contenu d'accordéon présent" -ForegroundColor Green
} else {
    Write-Host "   ❌ Contenu d'accordéon absent" -ForegroundColor Red
}

if ($content -match "active") {
    Write-Host "   ✅ Classe 'active' présente (sections ouvertes par défaut)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Classe 'active' absente (sections fermées par défaut)" -ForegroundColor Yellow
}

Write-Host ""

# 7. Statistiques
Write-Host "7. Statistiques :" -ForegroundColor Cyan
Write-Host "   📊 Taille du fichier : $([math]::Round($content.Length / 1024, 2)) KB" -ForegroundColor White
Write-Host "   📄 Nombre de caractères : $($content.Length)" -ForegroundColor White

# Compter les sections
$nbSections = ([regex]::Matches($content, "section-header-ef")).Count
Write-Host "   📑 Nombre de sections accordéon : $nbSections" -ForegroundColor White

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   RÉSULTAT DU TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Proposer d'ouvrir le fichier
$reponse = Read-Host "Voulez-vous ouvrir le fichier HTML dans le navigateur ? (O/N)"
if ($reponse -eq "O" -or $reponse -eq "o") {
    Start-Process $htmlFile.FullName
    Write-Host ""
    Write-Host "✅ Fichier ouvert dans le navigateur" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   FIN DU TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
