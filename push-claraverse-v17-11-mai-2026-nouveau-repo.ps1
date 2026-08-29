# ============================================================================
# Script de Sauvegarde ClaraVerse V17 - 11 Mai 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_11-05-2026_V5_docker_zeabur_ok_switch_editeur-.git
# Méthode: Commits multiples pour éviter les timeouts
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   SAUVEGARDE CLARAVERSE V17 - 11 MAI 2026" -ForegroundColor Cyan
Write-Host "   Repository: Claverse_windows__v_17_11-05-2026_V5_docker_zeabur_ok_switch_editeur-" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Git optimale pour gros projets
Write-Host "Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "  Configuration appliquee" -ForegroundColor Green
Write-Host ""

# Vérifier la branche actuelle
Write-Host "Verification de la branche..." -ForegroundColor Yellow
$branche = git branch --show-current
Write-Host "  Branche actuelle: $branche" -ForegroundColor Green
Write-Host ""

# Changer le repository distant
Write-Host "Mise a jour du repository distant..." -ForegroundColor Yellow
$newRepo = "https://github.com/sekadalle2024/Claverse_windows__v_17_11-05-2026_V5_docker_zeabur_ok_switch_editeur-.git"
git remote set-url origin $newRepo
Write-Host "  Repository distant mis a jour" -ForegroundColor Green
Write-Host ""

# Vérifier la connexion
Write-Host "Verification de la connexion au repository..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# Fonction pour pusher avec retry
function Push-WithRetry {
    param(
        [string]$Message,
        [int]$MaxRetries = 3
    )
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Host "  Push tentative $i/$MaxRetries..." -ForegroundColor Yellow
        
        $result = git push -u origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Push reussi: $Message" -ForegroundColor Green
            return $true
        }
        
        Write-Host "  Echec tentative $i" -ForegroundColor Red
        if ($i -lt $MaxRetries) {
            Write-Host "  Attente de 5 secondes avant nouvelle tentative..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  ERREUR: Push echoue apres $MaxRetries tentatives" -ForegroundColor Red
    return $false
}

# ============================================================================
# PARTIE 1: Code Source React/TypeScript (src/)
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 1/6: Code Source React/TypeScript (src/)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

git add src/
$status = git status --short | Select-String "^[AM].*src/"
if ($status) {
    git commit -m "V17 - 11 Mai 2026 - Partie 1: Code Source React/TypeScript"
    Write-Host "  Commit cree" -ForegroundColor Green
    
    if (-not (Push-WithRetry "Code Source React/TypeScript")) {
        Write-Host "ERREUR CRITIQUE: Impossible de pusher la Partie 1" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans src/" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# PARTIE 2: Backend Python (py_backend/)
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 2/6: Backend Python (py_backend/)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

git add py_backend/
$status = git status --short | Select-String "^[AM].*py_backend/"
if ($status) {
    git commit -m "V17 - 11 Mai 2026 - Partie 2: Backend Python"
    Write-Host "  Commit cree" -ForegroundColor Green
    
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host "ERREUR CRITIQUE: Impossible de pusher la Partie 2" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# PARTIE 3: Fichiers Publics (public/)
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 3/6: Fichiers Publics (public/)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

git add public/
$status = git status --short | Select-String "^[AM].*public/"
if ($status) {
    git commit -m "V17 - 11 Mai 2026 - Partie 3: Fichiers Publics"
    Write-Host "  Commit cree" -ForegroundColor Green
    
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host "ERREUR CRITIQUE: Impossible de pusher la Partie 3" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans public/" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# PARTIE 4: Documentation Principale
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 4/6: Documentation Principale" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Etat_Fin/" "Doc_Lead_Balance/" "Doc papier de travail javascript/" "Doc cross ref documentaire menu/" "deploiement-netlify/"
$status = git status --short | Select-String "^[AM].*(Doc menu demarrer|Doc export rapport|Doc_Etat_Fin|Doc_Lead_Balance|Doc papier de travail|Doc cross ref|deploiement-netlify)"
if ($status) {
    git commit -m "V17 - 11 Mai 2026 - Partie 4: Documentation Principale"
    Write-Host "  Commit cree" -ForegroundColor Green
    
    if (-not (Push-WithRetry "Documentation Principale")) {
        Write-Host "ERREUR CRITIQUE: Impossible de pusher la Partie 4" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans la documentation principale" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# PARTIE 5: Autres Documentations et Fichiers de Session
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 5/6: Autres Documentations et Fichiers de Session" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

git add "Doc_Github_Issue/" "Doc zeabur docker/" "Doc backend switch/" "Doc backend github/" "Doc menu contextuel*/" "Doc ClaraAPIService*/" "Doc ClaraAttachmentService*/" "Doc notification app/" "Doc prompt issues/" "Doc selecteur CSS Clara/" "Doc composant menu accordeon/" "Doc_AIONUI/" "doc extension chrome/" "Extraction json DemarrerMenu.tsx/" "Manuel E-audit/" "Microservice_Claraverse/" "Claraverse windows 11/" *.md *.txt
$status = git status --short | Select-String "^[AM].*(Doc_Github_Issue|Doc zeabur|Doc backend|Doc menu contextuel|Doc ClaraAPI|Doc ClaraAttachment|Doc notification|Doc prompt|Doc selecteur|Doc composant|Doc_AIONUI|doc extension|Extraction json|Manuel E-audit|Microservice|Claraverse windows|\.md$|\.txt$)"
if ($status) {
    git commit -m "V17 - 11 Mai 2026 - Partie 5: Autres Documentations et Fichiers de Session"
    Write-Host "  Commit cree" -ForegroundColor Green
    
    if (-not (Push-WithRetry "Autres Documentations")) {
        Write-Host "ERREUR CRITIQUE: Impossible de pusher la Partie 5" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier a commiter dans les autres documentations" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# PARTIE 6: Fichiers Restants (Configuration, Scripts, etc.)
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Partie 6/6: Fichiers Restants (Configuration, Scripts, etc.)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

git add .
$status = git status --short
if ($status) {
    git commit -m "V17 - 11 Mai 2026 - Partie 6: Fichiers Restants (Configuration, Scripts)"
    Write-Host "  Commit cree" -ForegroundColor Green
    
    if (-not (Push-WithRetry "Fichiers Restants")) {
        Write-Host "ERREUR CRITIQUE: Impossible de pusher la Partie 6" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Aucun fichier restant a commiter" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# VERIFICATION FINALE
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "           PUSH TERMINE AVEC SUCCES" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/sekadalle2024/Claverse_windows__v_17_11-05-2026_V5_docker_zeabur_ok_switch_editeur-.git" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Green
Write-Host "   SAUVEGARDE TERMINEE - V17 - 11 MAI 2026" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
