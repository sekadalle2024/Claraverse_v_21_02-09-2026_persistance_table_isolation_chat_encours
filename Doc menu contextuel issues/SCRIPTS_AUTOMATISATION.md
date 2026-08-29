# Scripts d'Automatisation - Menu Contextuel

## Vue d'Ensemble

Ce dossier contient des scripts PowerShell pour automatiser les tâches courantes de maintenance et d'évolution du menu contextuel.

## Scripts Disponibles

### 1. insert-risk-methods-v3.ps1

**Objectif**: Insérer les 22 méthodes d'évaluation des risques dans menu.js

**Utilisation**:
```powershell
.\insert-risk-methods-v3.ps1
```

**Fonctionnalités**:
- Création automatique de backup
- Extraction des lignes 10-848 du fichier source
- Insertion avant le marqueur "// === CALCULS ARITHM"
- Gestion de l'indentation (4 espaces)
- Messages de progression

**Résultat**:
```
Insertion v3...
TERMINE - 22 methodes inserees!
Exit Code: 0
```

---

### 2. template-insertion.ps1

**Objectif**: Template réutilisable pour insérer du code dans menu.js

**Configuration**:
```powershell
# Personnaliser ces variables
$sourceFile = "public/menu_VOTRE_FEATURE_extension.js"
$startLine = 10
$endLine = 100
$insertionMarker = "// === CALCULS ARITHM"
$sectionName = "VOTRE SECTION"
```

**Utilisation**:
```powershell
# 1. Copier le template
Copy-Item "template-insertion.ps1" "insert-ma-feature.ps1"

# 2. Personnaliser les variables

# 3. Exécuter
.\insert-ma-feature.ps1
```

**Fonctionnalités**:
- Vérification existence fichiers
- Backup automatique
- Gestion erreurs avec restauration
- Indentation automatique
- Messages clairs

---

### 3. verify-integration.ps1

**Objectif**: Vérifier que les méthodes ont été correctement insérées

**Utilisation**:
```powershell
.\verify-integration.ps1 -MethodNames "methode1","methode2","methode3"
```

**Exemple**:
```powershell
# Vérifier les méthodes d'évaluation des risques
.\verify-integration.ps1 -MethodNames @(
    "getMatrixAlpha3()",
    "getMatrixNum5()",
    "convertToMatrixAlpha3()",
    "normalizeToAlpha3()",
    "getColorsAlpha3()"
)
```

**Résultat**:
```
Verification de l'integration...
  OK: getMatrixAlpha3() trouve
  OK: getMatrixNum5() trouve
  OK: convertToMatrixAlpha3() trouve
  OK: normalizeToAlpha3() trouve
  OK: getColorsAlpha3() trouve

VERIFICATION REUSSIE: 5/5 methodes trouvees
Exit Code: 0
```

---

## Workflow Complet

### Scénario: Ajouter une Nouvelle Fonctionnalité

```powershell
# 1. Créer le fichier d'extension
New-Item "public/menu_ma_feature_extension.js"

# 2. Développer les méthodes dans le fichier d'extension

# 3. Copier le template
Copy-Item "Doc menu contextuel issues/Scripts/template-insertion.ps1" "insert-ma-feature.ps1"

# 4. Personnaliser le script
# Éditer insert-ma-feature.ps1 avec les bonnes valeurs

# 5. Exécuter l'insertion
.\insert-ma-feature.ps1

# 6. Vérifier l'insertion
.\Doc menu contextuel issues\Scripts\verify-integration.ps1 -MethodNames "maMethode1","maMethode2"

# 7. Tester
# Ouvrir test-ma-feature.html dans le navigateur

# 8. Commit
git add public/menu.js public/menu_ma_feature_extension.js
git commit -m "feat: Ajout ma feature"
git push
```

---

## Création de Nouveaux Scripts

### Template de Base

```powershell
# Nom du script: mon-script.ps1
# Description: [Description]

param(
    [Parameter(Mandatory=$true)]
    [string]$Param1,
    
    [Parameter(Mandatory=$false)]
    [string]$Param2 = "valeur_par_defaut"
)

# Configuration
$targetFile = "public/menu.js"

Write-Host "Execution de mon-script..." -ForegroundColor Cyan

# Verification
if (-not (Test-Path $targetFile)) {
    Write-Host "ERREUR: Fichier non trouve" -ForegroundColor Red
    exit 1
}

# Backup
$backupFile = "$targetFile.backup"
Copy-Item $targetFile $backupFile -Force

# Traitement
try {
    # Logique principale
    $content = Get-Content $targetFile -Raw -Encoding UTF8
    
    # Modifications...
    
    # Ecriture
    [System.IO.File]::WriteAllText($targetFile, $content, [System.Text.Encoding]::UTF8)
    
    Write-Host "TERMINE!" -ForegroundColor Green
    exit 0
    
} catch {
    Write-Host "ERREUR: $_" -ForegroundColor Red
    Copy-Item $backupFile $targetFile -Force
    exit 1
}
```

---

## Bonnes Pratiques Scripts

### 1. Toujours Créer un Backup

```powershell
$backupFile = "$targetFile.backup"
Copy-Item $targetFile $backupFile -Force
```

### 2. Vérifier l'Existence des Fichiers

```powershell
if (-not (Test-Path $sourceFile)) {
    Write-Host "ERREUR: Fichier non trouve: $sourceFile" -ForegroundColor Red
    exit 1
}
```

### 3. Utiliser UTF-8 Explicitement

```powershell
# Lecture
$content = Get-Content $file -Encoding UTF8 -Raw

# Écriture
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
```

### 4. Gérer les Erreurs

```powershell
try {
    # Code risqué
} catch {
    Write-Host "ERREUR: $_" -ForegroundColor Red
    # Restaurer backup
    Copy-Item $backupFile $targetFile -Force
    exit 1
}
```

### 5. Messages Clairs

```powershell
Write-Host "Debut operation..." -ForegroundColor Cyan
Write-Host "Etape 1 terminee" -ForegroundColor Green
Write-Host "ERREUR: Probleme detecte" -ForegroundColor Red
Write-Host "ATTENTION: Verification requise" -ForegroundColor Yellow
```

### 6. Codes de Sortie

```powershell
# Succès
exit 0

# Erreur
exit 1
```

---

## Scripts Utilitaires Additionnels

### Compter les Lignes de Code

```powershell
# count-lines.ps1
$content = Get-Content "public/menu.js"
$lineCount = $content.Count
$methodCount = ($content | Select-String -Pattern "^\s+\w+\(\)" | Measure-Object).Count

Write-Host "Lignes totales: $lineCount"
Write-Host "Methodes: $methodCount"
```

### Lister les Méthodes

```powershell
# list-methods.ps1
$content = Get-Content "public/menu.js"
$methods = $content | Select-String -Pattern "^\s+(\w+)\(\)" | ForEach-Object {
    $_.Matches.Groups[1].Value
}

Write-Host "Methodes trouvees:"
$methods | ForEach-Object { Write-Host "  - $_" }
```

### Rechercher une Méthode

```powershell
# find-method.ps1
param([string]$MethodName)

$content = Get-Content "public/menu.js"
$lineNumber = 0

for ($i = 0; $i < $content.Count; $i++) {
    if ($content[$i] -match "$MethodName\(\)") {
        $lineNumber = $i + 1
        break
    }
}

if ($lineNumber -gt 0) {
    Write-Host "Methode $MethodName trouvee a la ligne $lineNumber"
} else {
    Write-Host "Methode $MethodName non trouvee"
}
```

---

## Dépannage

### Problème: "Execution de scripts est desactivee"

**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problème: "Fichier non trouve"

**Solution**: Vérifier le chemin relatif
```powershell
# Afficher le répertoire courant
Get-Location

# Lister les fichiers
Get-ChildItem
```

### Problème: "Erreur d'encodage"

**Solution**: Toujours utiliser UTF-8
```powershell
Get-Content $file -Encoding UTF8
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
```

### Problème: "Backup non restauré"

**Solution**: Restaurer manuellement
```powershell
Copy-Item "public/menu.js.backup" "public/menu.js" -Force
```

---

## Maintenance des Scripts

### Versionner les Scripts

```powershell
# En-tête du script
# Version: 1.0
# Date: 2 Avril 2026
# Auteur: [Nom]
# Changelog:
#   v1.0 - Version initiale
```

### Tester les Scripts

```powershell
# Créer un environnement de test
$testDir = "test-scripts"
New-Item -ItemType Directory -Path $testDir -Force
Copy-Item "public/menu.js" "$testDir/menu.js"

# Tester le script
# ...

# Nettoyer
Remove-Item $testDir -Recurse -Force
```

---

## Ressources

- Template: `template-insertion.ps1`
- Exemples: `insert-risk-methods-v3.ps1`
- Vérification: `verify-integration.ps1`
- Documentation: `../GUIDE_MISE_A_JOUR.md`
