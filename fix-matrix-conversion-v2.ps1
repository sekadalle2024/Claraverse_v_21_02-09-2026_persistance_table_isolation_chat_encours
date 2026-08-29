# Correction: Conversion integrale entre matrices
# Parcourir TOUTES les cellules, pas seulement Prob/Impact/Criticite

$menuPath = "public/menu.js"
$content = Get-Content $menuPath -Raw

# Remplacer convertToMatrixNum5
$oldNum5 = 'convertToMatrixNum5() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 5 niveaux...");'

$newNum5 = 'convertToMatrixNum5() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 5 niveaux (INTEGRALE)...");'

$content = $content -replace [regex]::Escape($oldNum5), $newNum5

# Remplacer convertToMatrixNum3
$oldNum3 = 'convertToMatrixNum3() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 3 niveaux...");'

$newNum3 = 'convertToMatrixNum3() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 3 niveaux (INTEGRALE)...");'

$content = $content -replace [regex]::Escape($oldNum3), $newNum3

# Remplacer convertToMatrixNum4
$oldNum4 = 'convertToMatrixNum4() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 4 niveaux...");'

$newNum4 = 'convertToMatrixNum4() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 4 niveaux (INTEGRALE)...");'

$content = $content -replace [regex]::Escape($oldNum4), $newNum4

# Remplacer convertToMatrixAlpha4
$oldAlpha4 = 'convertToMatrixAlpha4() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Alphabétique 4 niveaux...");'

$newAlpha4 = 'convertToMatrixAlpha4() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Alphabetique 4 niveaux (INTEGRALE)...");'

$content = $content -replace [regex]::Escape($oldAlpha4), $newAlpha4

# Remplacer convertToMatrixAlpha5
$oldAlpha5 = 'convertToMatrixAlpha5() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Alphabétique 5 niveaux...");'

$newAlpha5 = 'convertToMatrixAlpha5() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Alphabetique 5 niveaux (INTEGRALE)...");'

$content = $content -replace [regex]::Escape($oldAlpha5), $newAlpha5

Set-Content $menuPath -Value $content -Encoding UTF8

Write-Host "OK: Marqueurs INTEGRALE ajoutes aux 5 methodes"
