# Script d'installation du composant XRefSidebar
# Date: 12 Avril 2026

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Installation du Composant React XRefSidebar" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé" -ForegroundColor Red
    Write-Host "   Veuillez exécuter ce script depuis la racine du projet Claraverse" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Répertoire du projet détecté" -ForegroundColor Green
Write-Host ""

# Étape 1: Vérifier les fichiers du composant
Write-Host "📋 Étape 1: Vérification des fichiers du composant..." -ForegroundColor Yellow

$files = @(
    "src/components/Clara_Components/XRefSidebar.tsx",
    "src/components/Clara_Components/XRefSidebar.css",
    "src/components/Clara_Components/XRefSidebarWrapper.tsx"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MANQUANT)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Certains fichiers sont manquants" -ForegroundColor Red
    Write-Host "   Veuillez copier les fichiers depuis Doc cross ref documentaire menu/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Tous les fichiers du composant sont présents" -ForegroundColor Green
Write-Host ""

# Étape 2: Installer lucide-react
Write-Host "📦 Étape 2: Installation de lucide-react..." -ForegroundColor Yellow

# Vérifier si lucide-react est déjà installé
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$lucideInstalled = $false

if ($packageJson.dependencies -and $packageJson.dependencies.'lucide-react') {
    Write-Host "  ✓ lucide-react déjà installé (version: $($packageJson.dependencies.'lucide-react'))" -ForegroundColor Green
    $lucideInstalled = $true
} elseif ($packageJson.devDependencies -and $packageJson.devDependencies.'lucide-react') {
    Write-Host "  ✓ lucide-react déjà installé en dev (version: $($packageJson.devDependencies.'lucide-react'))" -ForegroundColor Green
    $lucideInstalled = $true
}

if (-not $lucideInstalled) {
    Write-Host "  Installation de lucide-react..." -ForegroundColor Cyan
    
    # Détecter le gestionnaire de paquets
    if (Test-Path "yarn.lock") {
        Write-Host "  Utilisation de Yarn..." -ForegroundColor Cyan
        yarn add lucide-react
    } elseif (Test-Path "pnpm-lock.yaml") {
        Write-Host "  Utilisation de pnpm..." -ForegroundColor Cyan
        pnpm add lucide-react
    } else {
        Write-Host "  Utilisation de npm..." -ForegroundColor Cyan
        npm install lucide-react
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ lucide-react installé avec succès" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erreur lors de l'installation de lucide-react" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Dépendances installées" -ForegroundColor Green
Write-Host ""

# Étape 3: Vérifier l'intégration dans App.tsx
Write-Host "🔗 Étape 3: Vérification de l'intégration dans App.tsx..." -ForegroundColor Yellow

$appFiles = @(
    "src/App.tsx",
    "src/components/Chat.tsx",
    "src/pages/Chat.tsx"
)

$appFile = $null
foreach ($file in $appFiles) {
    if (Test-Path $file) {
        $appFile = $file
        break
    }
}

if ($appFile) {
    Write-Host "  Fichier principal trouvé: $appFile" -ForegroundColor Cyan
    
    $content = Get-Content $appFile -Raw
    
    if ($content -match "XRefSidebarWrapper") {
        Write-Host "  ✓ XRefSidebarWrapper déjà intégré" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  XRefSidebarWrapper non intégré" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Pour intégrer le composant, ajoutez ces lignes dans $appFile :" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  // Import" -ForegroundColor Gray
        Write-Host "  import XRefSidebarWrapper from '@/components/Clara_Components/XRefSidebarWrapper';" -ForegroundColor White
        Write-Host ""
        Write-Host "  // Dans le JSX (avant la fermeture du div principal)" -ForegroundColor Gray
        Write-Host "  <XRefSidebarWrapper />" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "  ⚠️  Fichier principal non trouvé" -ForegroundColor Yellow
    Write-Host "  Veuillez intégrer manuellement XRefSidebarWrapper" -ForegroundColor Yellow
}

Write-Host ""

# Étape 4: Vérifier menu.js
Write-Host "📝 Étape 4: Vérification de menu.js..." -ForegroundColor Yellow

if (Test-Path "public/menu.js") {
    $menuContent = Get-Content "public/menu.js" -Raw
    
    $checks = @{
        "importerXRefDocumentaire" = $menuContent -match "importerXRefDocumentaire"
        "afficherXRefDocumentaire" = $menuContent -match "afficherXRefDocumentaire"
        "rechercherDocument" = $menuContent -match "rechercherDocument"
    }
    
    $allChecksPass = $true
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "  ✓ Méthode $($check.Key) présente" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Méthode $($check.Key) manquante" -ForegroundColor Red
            $allChecksPass = $false
        }
    }
    
    if ($allChecksPass) {
        Write-Host ""
        Write-Host "  ℹ️  Pour utiliser le composant React, modifiez les méthodes pour dispatcher des événements:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  document.dispatchEvent(new CustomEvent('xref:open', {" -ForegroundColor White
        Write-Host "    detail: { documents: [...] }" -ForegroundColor White
        Write-Host "  }));" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "  ✗ public/menu.js non trouvé" -ForegroundColor Red
}

Write-Host ""

# Étape 5: Ouvrir la page de test
Write-Host "🧪 Étape 5: Page de test..." -ForegroundColor Yellow

$testFile = "Doc cross ref documentaire menu/test-xref-react-component.html"
if (Test-Path $testFile) {
    Write-Host "  ✓ Page de test trouvée: $testFile" -ForegroundColor Green
    Write-Host ""
    
    $response = Read-Host "  Voulez-vous ouvrir la page de test dans le navigateur? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Start-Process $testFile
        Write-Host "  ✓ Page de test ouverte" -ForegroundColor Green
    }
} else {
    Write-Host "  ✗ Page de test non trouvée" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Installation terminée" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Résumé
Write-Host "📊 RÉSUMÉ:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✅ Fichiers du composant: OK" -ForegroundColor Green
Write-Host "  ✅ Dépendances: OK" -ForegroundColor Green

if ($appFile -and $content -match "XRefSidebarWrapper") {
    Write-Host "  ✅ Intégration App.tsx: OK" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Intégration App.tsx: À FAIRE" -ForegroundColor Yellow
}

Write-Host "  ⚠️  Modification menu.js: À FAIRE" -ForegroundColor Yellow
Write-Host ""

# Prochaines étapes
Write-Host "🚀 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Intégrer XRefSidebarWrapper dans App.tsx (si pas déjà fait)" -ForegroundColor White
Write-Host "  2. Modifier menu.js pour dispatcher les événements 'xref:open'" -ForegroundColor White
Write-Host "  3. Tester avec la page test-xref-react-component.html" -ForegroundColor White
Write-Host "  4. Tester dans l'application Claraverse" -ForegroundColor White
Write-Host ""

Write-Host "📖 Documentation complète:" -ForegroundColor Yellow
Write-Host "  → Doc cross ref documentaire menu/INTEGRATION_COMPOSANT_REACT_XREF.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "✨ Le composant XRefSidebar est prêt à être utilisé!" -ForegroundColor Green
Write-Host ""
