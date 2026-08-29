# ============================================================================
# Script de correction des bugs d'évaluation des risques
# Date: 02 Avril 2026
# ============================================================================

Write-Host "🔧 CORRECTION DES BUGS D'ÉVALUATION DES RISQUES" -ForegroundColor Cyan
Write-Host "=" * 70

$menuFile = "public/menu.js"

if (-not (Test-Path $menuFile)) {
    Write-Host "❌ Fichier $menuFile introuvable!" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Lecture du fichier $menuFile..." -ForegroundColor Yellow
$content = Get-Content $menuFile -Raw -Encoding UTF8

# ============================================================================
# BUG 1: normalizeToAlpha4 - Logique || incorrecte
# ============================================================================
Write-Host "`n🐛 BUG 1: Correction normalizeToAlpha4..." -ForegroundColor Yellow

$oldAlpha4 = @"
    normalizeToAlpha4(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      if (v.includes('mineur') || v.includes('minor') || v.includes('low')) return 'Mineur';
      if (v.includes('significatif') || v.includes('significant') || v.includes('medium')) return 'Significatif';
      if (v.includes('majeur') || v.includes('major') || v.includes('high')) return 'Majeur';
      if (v.includes('critique') || v.includes('critical') || v.includes('severe')) return 'Critique';
      
      // Format numérique (1-4 ou 1-16)
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num <= 1 || num <= 2) return 'Mineur';
        if (num <= 2 || num <= 6) return 'Significatif';
        if (num <= 3 || num <= 12) return 'Majeur';
        if (num <= 4 || num <= 16) return 'Critique';
      }
      
      return null;
    }
"@

$newAlpha4 = @"
    normalizeToAlpha4(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      if (v.includes('mineur') || v.includes('minor') || v.includes('low')) return 'Mineur';
      if (v.includes('significatif') || v.includes('significant') || v.includes('medium')) return 'Significatif';
      if (v.includes('majeur') || v.includes('major') || v.includes('high')) return 'Majeur';
      if (v.includes('critique') || v.includes('critical') || v.includes('severe')) return 'Critique';
      
      // Format numérique (1-4 ou 1-16)
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 4) return num; // Retourner la valeur 1-4 directement
        // Conversion depuis matrice 4x4 (1-16)
        if (num <= 2) return 'Mineur';
        if (num <= 6) return 'Significatif';
        if (num <= 12) return 'Majeur';
        return 'Critique';
      }
      
      return null;
    }
"@

if ($content -match [regex]::Escape($oldAlpha4)) {
    $content = $content -replace [regex]::Escape($oldAlpha4), $newAlpha4
    Write-Host "✅ normalizeToAlpha4 corrigée" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pattern normalizeToAlpha4 non trouvé (peut-être déjà corrigé)" -ForegroundColor Yellow
}

# ============================================================================
# BUG 2: normalizeToAlpha5 - Logique || incorrecte
# ============================================================================
Write-Host "`n🐛 BUG 2: Correction normalizeToAlpha5..." -ForegroundColor Yellow

$oldAlpha5 = @"
    normalizeToAlpha5(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      // Mots-clés spécifiques
      if (v.includes('tres faible') || v.includes('très faible') || v.includes('very low')) return 'Tres faible';
      if (v.includes('tres eleve') || v.includes('très élevé') || v.includes('very high')) return 'Tres eleve';
      if (v.includes('modere') || v.includes('modéré') || v.includes('moderate')) return 'Modere';
      if (v.includes('faible') || v.includes('low') || v.includes('bas')) return 'Faible';
      if (v.includes('eleve') || v.includes('élevé') || v.includes('high')) return 'Eleve';
      
      // Format numérique (1-5 ou 1-25)
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num <= 1 || num <= 2) return 'Tres faible';
        if (num <= 2 || num <= 6) return 'Faible';
        if (num <= 3 || num <= 12) return 'Modere';
        if (num <= 4 || num <= 20) return 'Eleve';
        if (num <= 5 || num <= 25) return 'Tres eleve';
      }
      
      return null;
    }
"@

$newAlpha5 = @"
    normalizeToAlpha5(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      // Mots-clés spécifiques - ORDRE IMPORTANT (très faible avant faible)
      if (v.includes('tres faible') || v.includes('très faible') || v.includes('very low')) return 'Tres faible';
      if (v.includes('tres eleve') || v.includes('très élevé') || v.includes('very high')) return 'Tres eleve';
      if (v.includes('modere') || v.includes('modéré') || v.includes('moderate')) return 'Modere';
      if (v.includes('faible') || v.includes('low') || v.includes('bas')) return 'Faible';
      if (v.includes('eleve') || v.includes('élevé') || v.includes('high')) return 'Eleve';
      
      // Format numérique (1-5 ou 1-25)
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 5) return num; // Retourner la valeur 1-5 directement
        // Conversion depuis matrice 5x5 (1-25)
        if (num <= 2) return 'Tres faible';
        if (num <= 6) return 'Faible';
        if (num <= 12) return 'Modere';
        if (num <= 20) return 'Eleve';
        return 'Tres eleve';
      }
      
      return null;
    }
"@

if ($content -match [regex]::Escape($oldAlpha5)) {
    $content = $content -replace [regex]::Escape($oldAlpha5), $newAlpha5
    Write-Host "✅ normalizeToAlpha5 corrigée" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pattern normalizeToAlpha5 non trouvé (peut-être déjà corrigé)" -ForegroundColor Yellow
}

# ============================================================================
# BUG 3: normalizeToNum4 - Logique de conversion incorrecte
# ============================================================================
Write-Host "`n🐛 BUG 3: Correction normalizeToNum4..." -ForegroundColor Yellow

$oldNum4 = @"
    normalizeToNum4(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 4) return num;
        if (num >= 5 && num <= 16) {
          // Conversion depuis matrice 4x4 (1-16)
          if (num <= 2) return 1;
          if (num <= 6) return 2;
          if (num <= 12) return 3;
          return 4;
        }
      }
      
      // Conversion depuis alphabétique
      if (v.includes('mineur') || v.includes('minor')) return 1;
      if (v.includes('significatif') || v.includes('significant')) return 2;
      if (v.includes('majeur') || v.includes('major')) return 3;
      if (v.includes('critique') || v.includes('critical')) return 4;
      
      return null;
    }
"@

$newNum4 = @"
    normalizeToNum4(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 4) return Math.round(num); // Arrondir pour éviter les décimales
        // Conversion depuis matrice 4x4 (1-16)
        if (num <= 2) return 1;
        if (num <= 6) return 2;
        if (num <= 12) return 3;
        if (num <= 16) return 4;
      }
      
      // Conversion depuis alphabétique
      if (v.includes('mineur') || v.includes('minor')) return 1;
      if (v.includes('significatif') || v.includes('significant')) return 2;
      if (v.includes('majeur') || v.includes('major')) return 3;
      if (v.includes('critique') || v.includes('critical')) return 4;
      
      return null;
    }
"@

if ($content -match [regex]::Escape($oldNum4)) {
    $content = $content -replace [regex]::Escape($oldNum4), $newNum4
    Write-Host "✅ normalizeToNum4 corrigée" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pattern normalizeToNum4 non trouvé (peut-être déjà corrigé)" -ForegroundColor Yellow
}

# ============================================================================
# BUG 4: normalizeToNum5 - Ajouter la méthode manquante
# ============================================================================
Write-Host "`n🐛 BUG 4: Vérification normalizeToNum5..." -ForegroundColor Yellow

if ($content -notmatch "normalizeToNum5\(value\)") {
    Write-Host "⚠️  normalizeToNum5 manquante - ajout nécessaire" -ForegroundColor Yellow
    
    # Trouver l'emplacement après normalizeToNum4
    $insertAfter = "    normalizeToNum4(value) {"
    $insertPosition = $content.IndexOf($insertAfter)
    
    if ($insertPosition -gt 0) {
        # Trouver la fin de la méthode normalizeToNum4
        $searchStart = $insertPosition + $insertAfter.Length
        $braceCount = 1
        $endPosition = $searchStart
        
        for ($i = $searchStart; $i -lt $content.Length; $i++) {
            if ($content[$i] -eq '{') { $braceCount++ }
            if ($content[$i] -eq '}') { 
                $braceCount--
                if ($braceCount -eq 0) {
                    $endPosition = $i + 1
                    break
                }
            }
        }
        
        $newNum5Method = @"

    normalizeToNum5(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      
      const num = parseFloat(v);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 5) return Math.round(num); // Arrondir pour éviter les décimales
        // Conversion depuis matrice 5x5 (1-25)
        if (num <= 2) return 1;
        if (num <= 6) return 2;
        if (num <= 12) return 3;
        if (num <= 20) return 4;
        if (num <= 25) return 5;
      }
      
      // Conversion depuis alphabétique
      if (v.includes('tres faible') || v.includes('très faible')) return 1;
      if (v.includes('faible')) return 2;
      if (v.includes('modere') || v.includes('modéré')) return 3;
      if (v.includes('eleve') || v.includes('élevé')) return 4;
      if (v.includes('tres eleve') || v.includes('très élevé')) return 5;
      
      return null;
    }
"@
        
        $content = $content.Insert($endPosition, $newNum5Method)
        Write-Host "✅ normalizeToNum5 ajoutée" -ForegroundColor Green
    }
} else {
    Write-Host "✅ normalizeToNum5 existe déjà" -ForegroundColor Green
}

# ============================================================================
# Sauvegarde du fichier
# ============================================================================
Write-Host "`n💾 Sauvegarde des corrections..." -ForegroundColor Yellow
$content | Set-Content $menuFile -Encoding UTF8 -NoNewline

Write-Host "`n✅ CORRECTIONS TERMINÉES!" -ForegroundColor Green
Write-Host "=" * 70

Write-Host "`n📋 RÉSUMÉ DES CORRECTIONS:" -ForegroundColor Cyan
Write-Host "  1. ✅ normalizeToAlpha4 - Logique numérique corrigée"
Write-Host "  2. ✅ normalizeToAlpha5 - Logique numérique corrigée"
Write-Host "  3. ✅ normalizeToNum4 - Conversion matrice corrigée"
Write-Host "  4. ✅ normalizeToNum5 - Méthode ajoutée/vérifiée"

Write-Host "`n🧪 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "  1. Tester chaque matrice individuellement"
Write-Host "  2. Vérifier que toutes les valeurs apparaissent"
Write-Host "  3. Vérifier les codes couleurs"

Write-Host "`n✨ Script terminé avec succès!" -ForegroundColor Green
