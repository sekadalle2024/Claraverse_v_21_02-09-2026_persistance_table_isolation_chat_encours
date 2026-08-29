# Script de correction: Conversion intégrale entre matrices
# Problème: Les méthodes de conversion ne convertissent que Prob/Impact/Criticité
# Solution: Parcourir TOUTES les cellules et convertir chaque valeur

$menuPath = "public/menu.js"
$content = Get-Content $menuPath -Raw

# ============================================================================
# 1. CORRECTION convertToMatrixNum5 - Conversion intégrale
# ============================================================================

$oldConvertNum5 = @"
convertToMatrixNum5() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 5 niveaux...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixNum5();
      const colors = this.getColorsNumeric(25);
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.normalizeToNum5(probCell.textContent);
          const impactValue = this.normalizeToNum5(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            const criticiteValue = probValue * (impactValue || 1);
            if (colors[criticiteValue]) {
              probCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              probCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            const criticiteValue = (probValue || 1) * impactValue;
            if (colors[criticiteValue]) {
              impactCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              impactCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            if (colors[criticite]) {
              cells[criticiteIndex].style.setProperty('background-color', colors[criticite].bg, 'important');
              cells[criticiteIndex].style.setProperty('color', colors[criticiteIndex].text, 'important');
            }
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Num-5: $`{cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "num5", cellsUpdated });
      this.syncWithDev();
    }
"@

$newConvertNum5 = @"
convertToMatrixNum5() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 5 niveaux (INTÉGRALE)...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixNum5();
      const colors = this.getColorsNumeric(25);
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        // Conversion intégrale: parcourir TOUTES les cellules
        cells.forEach((cell, cellIndex) => {
          // Ignorer les colonnes d'en-tête
          if (cellIndex === probIndex || cellIndex === impactIndex || cellIndex === criticiteIndex) {
            return;
          }
          
          const originalValue = cell.textContent.trim();
          if (!originalValue) return;
          
          // Essayer de convertir la valeur
          const convertedValue = this.normalizeToNum5(originalValue);
          
          if (convertedValue) {
            cell.textContent = convertedValue;
            const criticiteValue = convertedValue * convertedValue; // Approximation pour couleur
            if (colors[criticiteValue]) {
              cell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              cell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
        });
        
        // Traiter les colonnes spéciales (Prob, Impact, Criticité)
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.normalizeToNum5(probCell.textContent);
          const impactValue = this.normalizeToNum5(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            const criticiteValue = probValue * (impactValue || 1);
            if (colors[criticiteValue]) {
              probCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              probCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            const criticiteValue = (probValue || 1) * impactValue;
            if (colors[criticiteValue]) {
              impactCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              impactCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            if (colors[criticite]) {
              cells[criticiteIndex].style.setProperty('background-color', colors[criticite].bg, 'important');
              cells[criticiteIndex].style.setProperty('color', colors[criticiteIndex].text, 'important');
            }
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Num-5 INTÉGRALE: $`{cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "num5", cellsUpdated });
      this.syncWithDev();
    }
"@

$content = $content -replace [regex]::Escape($oldConvertNum5), $newConvertNum5

Write-Host "✅ convertToMatrixNum5 corrigée (conversion intégrale)"

# ============================================================================
# 2. CORRECTION convertToMatrixNum3 - Conversion intégrale
# ============================================================================

$oldConvertNum3 = @"
convertToMatrixNum3() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 3 niveaux...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixNum3();
      const colors = this.getColorsNumeric(9);
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.normalizeToNum3(probCell.textContent);
          const impactValue = this.normalizeToNum3(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            const criticiteValue = probValue * (impactValue || 1);
            if (colors[criticiteValue]) {
              probCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              probCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            const criticiteValue = (probValue || 1) * impactValue;
            if (colors[criticiteValue]) {
              impactCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              impactCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            if (colors[criticite]) {
              cells[criticiteIndex].style.setProperty('background-color', colors[criticite].bg, 'important');
              cells[criticiteIndex].style.setProperty('color', colors[criticite].text, 'important');
            }
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Num-3: $`{cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "num3", cellsUpdated });
      this.syncWithDev();
    }
"@

$newConvertNum3 = @"
convertToMatrixNum3() {
      if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
      }
    
      console.log("🔄 Conversion vers Matrice Numérique 3 niveaux (INTÉGRALE)...");
      
      const headerRow = this.targetTable.querySelector("tr");
      if (!headerRow) return;
    
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
      const patterns = this.getRiskColumnPatterns();
      
      const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
      const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
      const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));
    
      if (probIndex === -1 || impactIndex === -1) {
        this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
        return;
      }
    
      const matrix = this.getMatrixNum3();
      const colors = this.getColorsNumeric(9);
      let cellsUpdated = 0;
    
      const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        // Conversion intégrale: parcourir TOUTES les cellules
        cells.forEach((cell, cellIndex) => {
          // Ignorer les colonnes d'en-tête
          if (cellIndex === probIndex || cellIndex === impactIndex || cellIndex === criticiteIndex) {
            return;
          }
          
          const originalValue = cell.textContent.trim();
          if (!originalValue) return;
          
          // Essayer de convertir la valeur
          const convertedValue = this.normalizeToNum3(originalValue);
          
          if (convertedValue) {
            cell.textContent = convertedValue;
            const criticiteValue = convertedValue * convertedValue; // Approximation pour couleur
            if (colors[criticiteValue]) {
              cell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              cell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
        });
        
        // Traiter les colonnes spéciales (Prob, Impact, Criticité)
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.normalizeToNum3(probCell.textContent);
          const impactValue = this.normalizeToNum3(impactCell.textContent);
          
          if (probValue) {
            probCell.textContent = probValue;
            const criticiteValue = probValue * (impactValue || 1);
            if (colors[criticiteValue]) {
              probCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              probCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (impactValue) {
            impactCell.textContent = impactValue;
            const criticiteValue = (probValue || 1) * impactValue;
            if (colors[criticiteValue]) {
              impactCell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              impactCell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
          
          if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
            const criticite = matrix[probValue][impactValue];
            cells[criticiteIndex].textContent = criticite;
            if (colors[criticite]) {
              cells[criticiteIndex].style.setProperty('background-color', colors[criticite].bg, 'important');
              cells[criticiteIndex].style.setProperty('color', colors[criticite].text, 'important');
            }
            cellsUpdated++;
          }
        }
      });
    
      this.showQuickNotification(`✅ Conversion Num-3 INTÉGRALE: $`{cellsUpdated} cellules mises à jour`);
      this.notifyTableStructureChange("matrix_converted", { type: "num3", cellsUpdated });
      this.syncWithDev();
    }
"@

$content = $content -replace [regex]::Escape($oldConvertNum3), $newConvertNum3

Write-Host "✅ convertToMatrixNum3 corrigée (conversion intégrale)"

# Sauvegarder le fichier
Set-Content $menuPath -Value $content -Encoding UTF8

Write-Host "✅ Fichier menu.js sauvegardé"
Write-Host ""
Write-Host "📋 Résumé des corrections:"
Write-Host "  - convertToMatrixNum5: Conversion intégrale (toutes les cellules)"
Write-Host "  - convertToMatrixNum3: Conversion intégrale (toutes les cellules)"
Write-Host ""
Write-Host "Prochaines etapes:"
Write-Host "  1. Corriger convertToMatrixNum4, convertToMatrixAlpha4, convertToMatrixAlpha5"
Write-Host "  2. Tester la conversion complete"
