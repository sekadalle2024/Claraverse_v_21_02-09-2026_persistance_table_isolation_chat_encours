# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_17_16-07-2026_V5_Data_analyst_python.git"
$branche = "main"
$commitPrefix = "Sauvegarde ClaraVerse V17 - Data Analyst Python - 16 Juillet 2026"

# Configuration Git
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0

git remote set-url origin $repoUrl
git checkout -b $branche 2>&1 | Out-Null
git branch --set-upstream-to=origin/$branche $branche 2>&1 | Out-Null

function Push-WithRetry {
    param([string]$message)
    $retry = 0
    while ($retry -lt 3) {
        Write-Host "Pushing $message (Attempt $($retry + 1)/3)..."
        git push -u origin $branche
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Success: $message"
            return $true
        }
        $retry++
        Start-Sleep -Seconds 5
    }
    Write-Host "Failed to push $message"
    return $false
}

Write-Host "Part 1: Code Source"
git add src/
git commit -m "$commitPrefix - Partie 1: Code Source"
if ($LASTEXITCODE -eq 0) { Push-WithRetry "Code Source" }

Write-Host "Part 2: Backend Python"
git add py_backend/
git commit -m "$commitPrefix - Partie 2: Backend Python"
if ($LASTEXITCODE -eq 0) { Push-WithRetry "Backend Python" }

Write-Host "Part 3: Fichiers Publics"
git add public/
git commit -m "$commitPrefix - Partie 3: Fichiers Publics"
if ($LASTEXITCODE -eq 0) { Push-WithRetry "Fichiers Publics" }

Write-Host "Part 4: Documentation principale"
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" "Doc composant menu accordeon/"
git commit -m "$commitPrefix - Partie 4: Documentation principale"
if ($LASTEXITCODE -eq 0) { Push-WithRetry "Documentation principale" }

Write-Host "Part 5: Autres documentations"
git add "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc zeabur docker/" "Doc render deploy/" "Doc backend github/" "Doc backend switch/" "Doc cross ref documentaire menu/"
git add *.md *.txt
git commit -m "$commitPrefix - Partie 5: Autres documentations"
if ($LASTEXITCODE -eq 0) { Push-WithRetry "Autres documentations" }

Write-Host "Part 6: Fichiers Restants"
git add .
git commit -m "$commitPrefix - Partie 6: Configuration et Fichiers Divers"
if ($LASTEXITCODE -eq 0) { Push-WithRetry "Fichiers Restants" }

Write-Host "Push Process Completed."
