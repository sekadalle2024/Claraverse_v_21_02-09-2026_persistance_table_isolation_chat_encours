# ============================================================================
# Script d'Arret Claraverse - Backend + Frontend
# ============================================================================
# Description: Arrete proprement le backend Python et le frontend React
# Version: 1.0.0
# Date: 2026-03-22
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "ARRET CLARAVERSE - Backend Python + Frontend React" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# ARRET DES JOBS POWERSHELL
# ============================================================================

Write-Host "Recherche des jobs PowerShell actifs..." -ForegroundColor Yellow
Write-Host ""

# Essayer de charger les IDs depuis le fichier
$jobFile = ".claraverse-jobs.json"
$savedJobs = $null

if (Test-Path $jobFile) {
    Write-Host "Fichier de jobs trouve: $jobFile" -ForegroundColor Green
    try {
        $savedJobs = Get-Content $jobFile | ConvertFrom-Json
        Write-Host "   Backend Job ID: $($savedJobs.Backend)" -ForegroundColor White
        Write-Host "   Frontend Job ID: $($savedJobs.Frontend)" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "Impossible de lire le fichier de jobs" -ForegroundColor Yellow
    }
}

# Arreter les jobs sauvegardes
if ($savedJobs) {
    Write-Host "Arret des jobs sauvegardes..." -ForegroundColor Yellow
    
    $jobsToStop = @()
    
    if ($savedJobs.Backend) {
        $backendJob = Get-Job -Id $savedJobs.Backend -ErrorAction SilentlyContinue
        if ($backendJob) {
            $jobsToStop += $backendJob
            Write-Host "   Backend (Job $($savedJobs.Backend)): Trouve" -ForegroundColor White
        }
    }
    
    if ($savedJobs.Frontend) {
        $frontendJob = Get-Job -Id $savedJobs.Frontend -ErrorAction SilentlyContinue
        if ($frontendJob) {
            $jobsToStop += $frontendJob
            Write-Host "   Frontend (Job $($savedJobs.Frontend)): Trouve" -ForegroundColor White
        }
    }
    
    if ($jobsToStop.Count -gt 0) {
        Stop-Job -Job $jobsToStop -ErrorAction SilentlyContinue
        Remove-Job -Job $jobsToStop -ErrorAction SilentlyContinue
        Write-Host "Jobs arretes: $($jobsToStop.Count)" -ForegroundColor Green
    } else {
        Write-Host "Aucun job actif trouve" -ForegroundColor Gray
    }
    
    # Supprimer le fichier de jobs
    Remove-Item $jobFile -ErrorAction SilentlyContinue
    Write-Host ""
}

# Arreter tous les autres jobs actifs
$jobs = Get-Job | Where-Object { $_.State -eq "Running" }

if ($jobs.Count -eq 0) {
    Write-Host "Aucun autre job PowerShell actif" -ForegroundColor Gray
} else {
    Write-Host "Autres jobs actifs trouves: $($jobs.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($job in $jobs) {
        Write-Host "   Job ID: $($job.Id) - Etat: $($job.State)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Arret des autres jobs..." -ForegroundColor Yellow
    
    Stop-Job -Job $jobs -ErrorAction SilentlyContinue
    Remove-Job -Job $jobs -ErrorAction SilentlyContinue
    
    Write-Host "Autres jobs arretes" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# ARRET DES PROCESSUS PAR PORT
# ============================================================================

Write-Host "Recherche des processus sur les ports 5000 et 5173..." -ForegroundColor Yellow
Write-Host ""

$ports = @(5000, 5173)
$processesKilled = 0

foreach ($port in $ports) {
    Write-Host "Port $port..." -NoNewline
    
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connections) {
        Write-Host " Utilise" -ForegroundColor Yellow
        
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-Host "   Arret du processus: $($process.Name) (PID: $processId)" -ForegroundColor White
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                $processesKilled++
            }
        }
    } else {
        Write-Host " Libre" -ForegroundColor Green
    }
}

Write-Host ""

if ($processesKilled -gt 0) {
    Write-Host "$processesKilled processus arrete(s)" -ForegroundColor Green
} else {
    Write-Host "Aucun processus a arreter" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# VERIFICATION FINALE
# ============================================================================

Write-Host "Verification finale..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

Write-Host "   Port 5000 (Backend)..." -NoNewline
if ($port5000) {
    Write-Host " Toujours utilise" -ForegroundColor Yellow
} else {
    Write-Host " Libre" -ForegroundColor Green
}

Write-Host "   Port 5173 (Frontend)..." -NoNewline
if ($port5173) {
    Write-Host " Toujours utilise" -ForegroundColor Yellow
} else {
    Write-Host " Libre" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# RESUME
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "ARRET TERMINE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $port5000 -and -not $port5173) {
    Write-Host "Tous les services sont arretes" -ForegroundColor Green
} else {
    Write-Host "Certains services sont peut-etre encore actifs" -ForegroundColor Yellow
    Write-Host "   Redemarrez votre ordinateur si necessaire" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pour redemarrer Claraverse:" -ForegroundColor Gray
Write-Host "   .\start-claraverse.ps1" -ForegroundColor White
Write-Host ""
