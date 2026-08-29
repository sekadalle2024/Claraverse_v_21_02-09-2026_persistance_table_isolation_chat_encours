// Extension pour l'évaluation des risques - Menu contextuel ClaraVerse
// À intégrer dans menu.js dans la classe ContextualMenuManager

// ============================================================================
// MATRICES DE CRITICITÉ - DÉFINITIONS
// ============================================================================

/**
 * Matrice alphabétique 3 niveaux (Faible, Moyen, Elevé)
 */
getMatrixAlpha3() {
  return {
    'Faible': { 'Faible': 'Faible', 'Moyen': 'Faible', 'Eleve': 'Moyen' },
    'Moyen': { 'Faible': 'Faible', 'Moyen': 'Moyen', 'Eleve': 'Eleve' },
    'Eleve': { 'Faible': 'Moyen', 'Moyen': 'Eleve', 'Eleve': 'Eleve' }
  };
}

/**
 * Matrice alphabétique 5 niveaux
 */
getMatrixAlpha5() {
  return {
    'Tres faible': { 'Tres faible': 'Tres faible', 'Faible': 'Tres faible', 'Modere': 'Faible', 'Eleve': 'Faible', 'Tres eleve': 'Modere' },
    'Faible': { 'Tres faible': 'Tres faible', 'Faible': 'Faible', 'Modere': 'Faible', 'Eleve': 'Modere', 'Tres eleve': 'Modere' },
    'Modere': { 'Tres faible': 'Faible', 'Faible': 'Faible', 'Modere': 'Modere', 'Eleve': 'Eleve', 'Tres eleve': 'Eleve' },
    'Eleve': { 'Tres faible': 'Faible', 'Faible': 'Modere', 'Modere': 'Eleve', 'Eleve': 'Eleve', 'Tres eleve': 'Tres eleve' },
    'Tres eleve': { 'Tres faible': 'Modere', 'Faible': 'Modere', 'Modere': 'Eleve', 'Eleve': 'Tres eleve', 'Tres eleve': 'Tres eleve' }
  };
}

/**
 * Matrice alphabétique 4 niveaux (Mineur, Significatif, Majeur, Critique)
 */
getMatrixAlpha4() {
  return {
    'Mineur': { 'Mineur': 'Mineur', 'Significatif': 'Mineur', 'Majeur': 'Significatif', 'Critique': 'Majeur' },
    'Significatif': { 'Mineur': 'Mineur', 'Significatif': 'Significatif', 'Majeur': 'Majeur', 'Critique': 'Critique' },
    'Majeur': { 'Mineur': 'Significatif', 'Significatif': 'Majeur', 'Majeur': 'Majeur', 'Critique': 'Critique' },
    'Critique': { 'Mineur': 'Significatif', 'Significatif': 'Majeur', 'Majeur': 'Critique', 'Critique': 'Critique' }
  };
}

/**
 * Matrice numérique 3 niveaux (1-3)
 */
getMatrixNum3() {
  const matrix = {};
  for (let p = 1; p <= 3; p++) {
    matrix[p] = {};
    for (let i = 1; i <= 3; i++) {
      matrix[p][i] = p * i;
    }
  }
  return matrix;
}

/**
 * Matrice numérique 4 niveaux (1-4)
 */
getMatrixNum4() {
  const matrix = {};
  for (let p = 1; p <= 4; p++) {
    matrix[p] = {};
    for (let i = 1; i <= 4; i++) {
      matrix[p][i] = p * i;
    }
  }
  return matrix;
}

/**
 * Matrice numérique 5 niveaux (1-5)
 */
getMatrixNum5() {
  const matrix = {};
  for (let p = 1; p <= 5; p++) {
    matrix[p] = {};
    for (let i = 1; i <= 5; i++) {
      matrix[p][i] = p * i;
    }
  }
  return matrix;
}

// ============================================================================
// NORMALISATION ET CONVERSION DES VALEURS
// ============================================================================

/**
 * Normalise une valeur vers le format alphabétique 3 niveaux
 */
normalizeToAlpha3(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  
  // Format lettre
  if (v === 'f' || v.includes('faible') || v.includes('low') || v.includes('bas')) return 'Faible';
  if (v === 'm' || v.includes('moyen') || v.includes('medium') || v.includes('mod')) return 'Moyen';
  if (v === 'e' || v === 'é' || v.includes('eleve') || v.includes('élevé') || v.includes('high')) return 'Eleve';
  
  // Format numérique (1-3 ou 1-9)
  const num = parseFloat(v);
  if (!isNaN(num)) {
    if (num <= 1 || num <= 3) return 'Faible';
    if (num <= 2 || num <= 6) return 'Moyen';
    if (num <= 3 || num <= 9) return 'Eleve';
  }
  
  return null;
}

/**
 * Normalise une valeur vers le format alphabétique 5 niveaux
 */
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

/**
 * Normalise une valeur vers le format alphabétique 4 niveaux
 */
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

/**
 * Normalise une valeur vers le format numérique 3 niveaux (1-3)
 */
normalizeToNum3(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  
  // Si déjà numérique
  const num = parseFloat(v);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 3) return num;
    if (num >= 4 && num <= 9) {
      // Conversion depuis matrice 3x3 (1-9)
      if (num <= 2) return 1;
      if (num <= 6) return 2;
      return 3;
    }
  }
  
  // Conversion depuis alphabétique
  if (v.includes('faible') || v === 'f' || v.includes('low')) return 1;
  if (v.includes('moyen') || v === 'm' || v.includes('medium')) return 2;
  if (v.includes('eleve') || v === 'e' || v.includes('high')) return 3;
  
  return null;
}

/**
 * Normalise une valeur vers le format numérique 4 niveaux (1-4)
 */
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

/**
 * Normalise une valeur vers le format numérique 5 niveaux (1-5)
 */
normalizeToNum5(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  
  const num = parseFloat(v);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 5) return num;
    if (num >= 6 && num <= 25) {
      // Conversion depuis matrice 5x5 (1-25)
      if (num <= 2) return 1;
      if (num <= 6) return 2;
      if (num <= 12) return 3;
      if (num <= 20) return 4;
      return 5;
    }
  }
  
  // Conversion depuis alphabétique
  if (v.includes('tres faible') || v.includes('très faible')) return 1;
  if (v.includes('faible') && !v.includes('tres')) return 2;
  if (v.includes('modere') || v.includes('modéré')) return 3;
  if (v.includes('eleve') && !v.includes('tres')) return 4;
  if (v.includes('tres eleve') || v.includes('très élevé')) return 5;
  
  return null;
}

// ============================================================================
// COULEURS POUR LES MATRICES
// ============================================================================

/**
 * Obtient les couleurs pour la matrice alphabétique 3 niveaux
 */
getColorsAlpha3() {
  return {
    'Faible': { bg: '#28a745', text: '#ffffff' },   // Vert
    'Moyen': { bg: '#ffc107', text: '#000000' },    // Jaune
    'Eleve': { bg: '#dc3545', text: '#ffffff' }     // Rouge
  };
}

/**
 * Obtient les couleurs pour la matrice alphabétique 5 niveaux
 */
getColorsAlpha5() {
  return {
    'Tres faible': { bg: '#28a745', text: '#ffffff' },  // Vert foncé
    'Faible': { bg: '#90ee90', text: '#000000' },       // Vert clair
    'Modere': { bg: '#ffc107', text: '#000000' },       // Jaune
    'Eleve': { bg: '#ff8c00', text: '#ffffff' },        // Orange
    'Tres eleve': { bg: '#dc3545', text: '#ffffff' }    // Rouge
  };
}

/**
 * Obtient les couleurs pour la matrice alphabétique 4 niveaux
 */
getColorsAlpha4() {
  return {
    'Mineur': { bg: '#28a745', text: '#ffffff' },       // Vert
    'Significatif': { bg: '#ffc107', text: '#000000' }, // Jaune
    'Majeur': { bg: '#ff8c00', text: '#ffffff' },       // Orange
    'Critique': { bg: '#dc3545', text: '#ffffff' }      // Rouge
  };
}

/**
 * Obtient les couleurs pour les matrices numériques
 */
getColorsNumeric(maxValue) {
  const colors = {};
  const thresholds = {
    3: [1, 2, 3],      // Matrice 3x3: 1-3, 4-6, 7-9
    4: [2, 6, 12],     // Matrice 4x4: 1-2, 3-6, 7-12, 13-16
    5: [2, 6, 12, 20]  // Matrice 5x5: 1-2, 3-6, 7-12, 13-20, 21-25
  };
  
  for (let i = 1; i <= maxValue; i++) {
    if (maxValue === 9) {
      // Matrice 3x3
      if (i <= 3) colors[i] = { bg: '#28a745', text: '#ffffff' };
      else if (i <= 6) colors[i] = { bg: '#ffc107', text: '#000000' };
      else colors[i] = { bg: '#dc3545', text: '#ffffff' };
    } else if (maxValue === 16) {
      // Matrice 4x4
      if (i <= 2) colors[i] = { bg: '#28a745', text: '#ffffff' };
      else if (i <= 6) colors[i] = { bg: '#ffc107', text: '#000000' };
      else if (i <= 12) colors[i] = { bg: '#ff8c00', text: '#ffffff' };
      else colors[i] = { bg: '#dc3545', text: '#ffffff' };
    } else if (maxValue === 25) {
      // Matrice 5x5
      if (i <= 2) colors[i] = { bg: '#28a745', text: '#ffffff' };
      else if (i <= 6) colors[i] = { bg: '#90ee90', text: '#000000' };
      else if (i <= 12) colors[i] = { bg: '#ffc107', text: '#000000' };
      else if (i <= 20) colors[i] = { bg: '#ff8c00', text: '#ffffff' };
      else colors[i] = { bg: '#dc3545', text: '#ffffff' };
    }
  }
  
  return colors;
}

// ============================================================================
// MÉTHODES DE CONVERSION DE MATRICE
// ============================================================================

/**
 * Convertit la matrice actuelle vers Matrice Alphabétique 3 niveaux
 */
convertToMatrixAlpha3() {
  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }

  console.log("🔄 Conversion vers Matrice Alphabétique 3 niveaux...");
  
  const headerRow = this.targetTable.querySelector("tr");
  if (!headerRow) {
    this.showAlert("⚠️ Table invalide: aucun en-tête trouvé.");
    return;
  }

  const headers = Array.from(headerRow.querySelectorAll("th, td")).map(h => h.textContent.trim());
  const patterns = this.getRiskColumnPatterns();
  
  // Trouver les colonnes de risque
  const probIndex = headers.findIndex(h => patterns.probabilite.test(h.toLowerCase()));
  const impactIndex = headers.findIndex(h => patterns.impact.test(h.toLowerCase()));
  const criticiteIndex = headers.findIndex(h => patterns.criticite.test(h.toLowerCase()));

  if (probIndex === -1 || impactIndex === -1) {
    this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
    return;
  }

  const matrix = this.getMatrixAlpha3();
  const colors = this.getColorsAlpha3();
  let cellsUpdated = 0;

  // Parcourir toutes les lignes de données
  const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
  
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll("td, th"));
    
    if (cells.length > Math.max(probIndex, impactIndex)) {
      const probCell = cells[probIndex];
      const impactCell = cells[impactIndex];
      
      // Normaliser les valeurs
      const probValue = this.normalizeToAlpha3(probCell.textContent);
      const impactValue = this.normalizeToAlpha3(impactCell.textContent);
      
      // Mettre à jour les cellules avec le format normalisé
      if (probValue) {
        probCell.textContent = probValue;
        this.applyRiskStyle(probCell, probValue);
        cellsUpdated++;
      }
      
      if (impactValue) {
        impactCell.textContent = impactValue;
        this.applyRiskStyle(impactCell, impactValue);
        cellsUpdated++;
      }
      
      // Calculer et mettre à jour la criticité
      if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
        const criticite = matrix[probValue][impactValue];
        cells[criticiteIndex].textContent = criticite;
        this.applyRiskStyle(cells[criticiteIndex], criticite);
        cellsUpdated++;
      }
    }
  });

  this.showQuickNotification(`✅ Conversion Alpha-3: ${cellsUpdated} cellules mises à jour`);
  this.notifyTableStructureChange("matrix_converted", { type: "alpha3", cellsUpdated });
  this.syncWithDev();
}

/**
 * Convertit la matrice actuelle vers Matrice Alphabétique 5 niveaux
 */
convertToMatrixAlpha5() {
  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }

  console.log("🔄 Conversion vers Matrice Alphabétique 5 niveaux...");
  
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

  const matrix = this.getMatrixAlpha5();
  let cellsUpdated = 0;

  const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
  
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll("td, th"));
    
    if (cells.length > Math.max(probIndex, impactIndex)) {
      const probCell = cells[probIndex];
      const impactCell = cells[impactIndex];
      
      const probValue = this.normalizeToAlpha5(probCell.textContent);
      const impactValue = this.normalizeToAlpha5(impactCell.textContent);
      
      if (probValue) {
        probCell.textContent = probValue;
        this.applyRiskStyle(probCell, probValue);
        cellsUpdated++;
      }
      
      if (impactValue) {
        impactCell.textContent = impactValue;
        this.applyRiskStyle(impactCell, impactValue);
        cellsUpdated++;
      }
      
      if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
        const criticite = matrix[probValue][impactValue];
        cells[criticiteIndex].textContent = criticite;
        this.applyRiskStyle(cells[criticiteIndex], criticite);
        cellsUpdated++;
      }
    }
  });

  this.showQuickNotification(`✅ Conversion Alpha-5: ${cellsUpdated} cellules mises à jour`);
  this.notifyTableStructureChange("matrix_converted", { type: "alpha5", cellsUpdated });
  this.syncWithDev();
}

/**
 * Convertit la matrice actuelle vers Matrice Alphabétique 4 niveaux
 */
convertToMatrixAlpha4() {
  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }

  console.log("🔄 Conversion vers Matrice Alphabétique 4 niveaux...");
  
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

  const matrix = this.getMatrixAlpha4();
  let cellsUpdated = 0;

  const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
  
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll("td, th"));
    
    if (cells.length > Math.max(probIndex, impactIndex)) {
      const probCell = cells[probIndex];
      const impactCell = cells[impactIndex];
      
      const probValue = this.normalizeToAlpha4(probCell.textContent);
      const impactValue = this.normalizeToAlpha4(impactCell.textContent);
      
      if (probValue) {
        probCell.textContent = probValue;
        this.applyRiskStyle(probCell, probValue);
        cellsUpdated++;
      }
      
      if (impactValue) {
        impactCell.textContent = impactValue;
        this.applyRiskStyle(impactCell, impactValue);
        cellsUpdated++;
      }
      
      if (probValue && impactValue && criticiteIndex !== -1 && cells[criticiteIndex]) {
        const criticite = matrix[probValue][impactValue];
        cells[criticiteIndex].textContent = criticite;
        this.applyRiskStyle(cells[criticiteIndex], criticite);
        cellsUpdated++;
      }
    }
  });

  this.showQuickNotification(`✅ Conversion Alpha-4: ${cellsUpdated} cellules mises à jour`);
  this.notifyTableStructureChange("matrix_converted", { type: "alpha4", cellsUpdated });
  this.syncWithDev();
}

/**
 * Convertit la matrice actuelle vers Matrice Numérique 3 niveaux
 */
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

  this.showQuickNotification(`✅ Conversion Num-3: ${cellsUpdated} cellules mises à jour`);
  this.notifyTableStructureChange("matrix_converted", { type: "num3", cellsUpdated });
  this.syncWithDev();
}

/**
 * Convertit la matrice actuelle vers Matrice Numérique 4 niveaux
 */
convertToMatrixNum4() {
  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }

  console.log("🔄 Conversion vers Matrice Numérique 4 niveaux...");
  
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

  const matrix = this.getMatrixNum4();
  const colors = this.getColorsNumeric(16);
  let cellsUpdated = 0;

  const rows = Array.from(this.targetTable.querySelectorAll("tr")).slice(1);
  
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
  this.notifyTableStructureChange("matrix_converted", { type: "num4", cellsUpdated });
  this.syncWithDev();
}

/**
 * Convertit la matrice actuelle vers Matrice Numérique 5 niveaux
 */
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

  this.showQuickNotification(`✅ Conversion Num-5: ${cellsUpdated} cellules mises à jour`);
  this.notifyTableStructureChange("matrix_converted", { type: "num5", cellsUpdated });
  this.syncWithDev();
}

// ============================================================================
// FIN DU FICHIER D'EXTENSION
// ============================================================================
