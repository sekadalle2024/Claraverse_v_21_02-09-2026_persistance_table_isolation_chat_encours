# Correction des 4 methodes restantes: Num3, Num4, Alpha4, Alpha5
# Ajouter la boucle de conversion integrale

$menuPath = "public/menu.js"
$content = Get-Content $menuPath -Raw

# ============================================================================
# 1. convertToMatrixNum3 - Ajouter conversion integrale
# ============================================================================

$oldNum3Loop = @'
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
    
      this.showQuickNotification(`✅ Conversion Num-3: ${cellsUpdated} cellules mises à jour`);
'@

$newNum3Loop = @'
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        // CONVERSION INTEGRALE: parcourir TOUTES les cellules
        cells.forEach((cell, cellIndex) => {
          if (cellIndex === probIndex || cellIndex === impactIndex || cellIndex === criticiteIndex) {
            return;
          }
          const originalValue = cell.textContent.trim();
          if (!originalValue) return;
          const convertedValue = this.normalizeToNum3(originalValue);
          if (convertedValue) {
            cell.textContent = convertedValue;
            const criticiteValue = convertedValue * convertedValue;
            if (colors[criticiteValue]) {
              cell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              cell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
        });
        
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
    
      this.showQuickNotification(`✅ Conversion Num-3 INTEGRALE: ${cellsUpdated} cellules mises a jour`);
'@

$content = $content -replace [regex]::Escape($oldNum3Loop), $newNum3Loop

Write-Host "OK: convertToMatrixNum3 corrigee"

# ============================================================================
# 2. convertToMatrixNum4 - Ajouter conversion integrale
# ============================================================================

$oldNum4Loop = @'
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.normalizeToNum4(probCell.textContent);
          const impactValue = this.normalizeToNum4(impactCell.textContent);
          
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
    
      this.showQuickNotification(`✅ Conversion Num-4: ${cellsUpdated} cellules mises à jour`);
'@

$newNum4Loop = @'
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        
        // CONVERSION INTEGRALE: parcourir TOUTES les cellules
        cells.forEach((cell, cellIndex) => {
          if (cellIndex === probIndex || cellIndex === impactIndex || cellIndex === criticiteIndex) {
            return;
          }
          const originalValue = cell.textContent.trim();
          if (!originalValue) return;
          const convertedValue = this.normalizeToNum4(originalValue);
          if (convertedValue) {
            cell.textContent = convertedValue;
            const criticiteValue = convertedValue * convertedValue;
            if (colors[criticiteValue]) {
              cell.style.setProperty('background-color', colors[criticiteValue].bg, 'important');
              cell.style.setProperty('color', colors[criticiteValue].text, 'important');
            }
            cellsUpdated++;
          }
        });
        
        if (cells.length > Math.max(probIndex, impactIndex)) {
          const probCell = cells[probIndex];
          const impactCell = cells[impactIndex];
          
          const probValue = this.normalizeToNum4(probCell.textContent);
          const impactValue = this.normalizeToNum4(impactCell.textContent);
          
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
    
      this.showQuickNotification(`✅ Conversion Num-4 INTEGRALE: ${cellsUpdated} cellules mises a jour`);
'@

$content = $content -replace [regex]::Escape($oldNum4Loop), $newNum4Loop

Write-Host "OK: convertToMatrixNum4 corrigee"

Set-Content $menuPath -Value $content -Encoding UTF8

Write-Host "Fichier sauvegarde"
