/**
 * CLARAVERSE - CORRECTION TABLES SÉPARÉES
 * Script de correction pour éviter le mélange des données entre tables
 * Restaure chaque table individuellement avec ses propres données
 */

class CorrectionTablesSeperees {
  constructor() {
    this.logPrefix = '[CorrectionTables]';
    this.tablesAnalysees = new Map();
    this.donneesParTable = new Map();
    this.stats = {
      tablesDetectees: 0,
      donneesTriees: 0,
      cellulesCorrigees: 0,
      donneesDeplacees: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      table: '📊',
      fix: '🔧'
    };

    console.log(`${emoji[type] || '🔍'} ${this.logPrefix} [${timestamp}] ${message}`);
  }

  async executerCorrectionComplete() {
    this.log('🚀 Démarrage correction tables séparées', 'fix');

    try {
      // Étape 1: Identifier toutes les tables uniques
      await this.identifierTables();

      // Étape 2: Trier les données par table d'origine
      await this.trierDonneesParTable();

      // Étape 3: Nettoyer les mélanges existants
      await this.nettoyerMelanges();

      // Étape 4: Redistribuer correctement les données
      await this.redistribuerDonnees();

      // Étape 5: Vérifier la cohérence finale
      await this.verifierCoherence();

      const rapport = this.genererRapport();
      this.afficherRapportFinal(rapport);

      return rapport;

    } catch (error) {
      this.log(`❌ Erreur correction: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async identifierTables() {
    this.log('Identification des tables uniques...', 'table');

    const tables = document.querySelectorAll('table');
    let tableIndex = 0;

    for (const table of tables) {
      const tableInfo = this.analyserTable(table, tableIndex);

      if (tableInfo.hasEditableCells) {
        this.tablesAnalysees.set(tableInfo.id, {
          ...tableInfo,
          element: table,
          cellules: tableInfo.cellules
        });

        this.log(`Table ${tableIndex + 1}: "${tableInfo.signature}" (${tableInfo.cellules.length} cellules)`, 'table');
        tableIndex++;
      }
    }

    this.stats.tablesDetectees = this.tablesAnalysees.size;
    this.log(`${this.stats.tablesDetectees} tables uniques identifiées`, 'success');
  }

  analyserTable(table, index) {
    // Créer une signature unique basée sur la structure de la table
    const headers = Array.from(table.querySelectorAll('th')).map(th =>
      th.textContent?.trim() || ''
    );

    const firstRowCells = Array.from(table.querySelector('tr')?.children || []).map(cell =>
      cell.textContent?.trim().substring(0, 20) || ''
    );

    // Signature combinée pour identifier uniquement cette table
    const signatureElements = [
      ...headers,
      ...firstRowCells.slice(0, 3), // Premiers éléments de la première ligne
      `pos_${index}`, // Position dans la page
      `cols_${table.rows[0]?.cells.length || 0}`, // Nombre de colonnes
      `rows_${table.rows.length}` // Nombre de lignes
    ].filter(el => el && el !== '');

    const signature = signatureElements.join('|').substring(0, 100);
    const tableId = this.genererIdTableUnique(signature, index);

    // Collecter toutes les cellules éditables
    const cellules = Array.from(table.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]'))
      .map((cell, cellIndex) => ({
        element: cell,
        row: this.getRowIndex(cell, table),
        col: this.getColIndex(cell),
        cellId: cell.dataset.cellId,
        content: cell.textContent?.trim() || '',
        isEmpty: !cell.textContent?.trim(),
        originalTableId: tableId
      }));

    return {
      id: tableId,
      signature: signature.substring(0, 50),
      headers,
      cellules,
      hasEditableCells: cellules.length > 0,
      position: index
    };
  }

  genererIdTableUnique(signature, position) {
    // Créer un hash stable basé sur le contenu et la position
    let hash = 0;
    const content = signature + '_pos_' + position;

    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en entier 32-bit
    }

    return `table_${Math.abs(hash).toString(36)}_${position}`;
  }

  getRowIndex(cell, table) {
    const row = cell.closest('tr');
    return Array.from(table.querySelectorAll('tr')).indexOf(row);
  }

  getColIndex(cell) {
    const row = cell.closest('tr');
    return Array.from(row.children).indexOf(cell);
  }

  async trierDonneesParTable() {
    this.log('Tri des données par table d\'origine...', 'fix');

    try {
      const allData = await window.ClaraVerse.TablePersistence.db.getAll();
      this.log(`${allData.length} entrées à trier`);

      for (const data of allData) {
        if (!data.cellId || (!data.content && !data.text)) continue;

        // Essayer d'identifier la table d'origine de cette donnée
        const tableOriginale = this.identifierTableOriginale(data);

        if (tableOriginale) {
          if (!this.donneesParTable.has(tableOriginale)) {
            this.donneesParTable.set(tableOriginale, []);
          }
          this.donneesParTable.get(tableOriginale).push(data);
        } else {
          // Données orphelines - les placer dans une catégorie à part
          if (!this.donneesParTable.has('orphelines')) {
            this.donneesParTable.set('orphelines', []);
          }
          this.donneesParTable.get('orphelines').push(data);
        }
      }

      this.stats.donneesTriees = allData.length;

      // Afficher la répartition
      for (const [tableId, donnees] of this.donneesParTable) {
        this.log(`${tableId}: ${donnees.length} données`, 'info');
      }

    } catch (error) {
      this.log(`Erreur tri données: ${error.message}`, 'error');
    }
  }

  identifierTableOriginale(data) {
    // Analyser l'ID de la cellule pour identifier la table d'origine
    const cellId = data.cellId;

    // Pattern: table_[hash]_[timestamp]_cell_[index]
    const match = cellId.match(/^table_([^_]+)_/);
    if (match) {
      const tableHash = match[1];

      // Chercher la table correspondante
      for (const [tableId, tableInfo] of this.tablesAnalysees) {
        if (tableId.includes(tableHash)) {
          return tableId;
        }
      }
    }

    return null;
  }

  async nettoyerMelanges() {
    this.log('Nettoyage des mélanges existants...', 'fix');

    let donneesDeplacees = 0;

    for (const [tableId, tableInfo] of this.tablesAnalysees) {
      const cellules = tableInfo.cellules;

      for (const cellule of cellules) {
        const { element, originalTableId } = cellule;
        const currentContent = element.textContent?.trim();

        if (currentContent && element.dataset.cellId) {
          // Vérifier si les données actuelles appartiennent à cette table
          const cellId = element.dataset.cellId;
          const tableOriginaleId = this.identifierTableOriginale({ cellId });

          if (tableOriginaleId && tableOriginaleId !== tableId) {
            // Cette donnée appartient à une autre table - la marquer pour déplacement
            this.log(`Donnée incorrecte détectée: ${cellId} dans table ${tableId} (origine: ${tableOriginaleId})`, 'warning');

            // Sauvegarder la donnée dans la bonne catégorie
            const donneesCorrectes = this.donneesParTable.get(tableOriginaleId) || [];
            donneesCorrectes.push({
              cellId,
              content: element.innerHTML,
              text: element.textContent,
              tableOriginale: tableOriginaleId
            });
            this.donneesParTable.set(tableOriginaleId, donneesCorrectes);

            // Vider la cellule incorrecte
            element.innerHTML = '';
            element.textContent = '';
            delete element.dataset.cellId;

            donneesDeplacees++;
          }
        }
      }
    }

    this.stats.donneesDeplacees = donneesDeplacees;
    this.log(`${donneesDeplacees} données déplacées vers leurs tables correctes`, 'success');
  }

  async redistribuerDonnees() {
    this.log('Redistribution correcte des données...', 'fix');

    let cellulesCorrigees = 0;

    for (const [tableId, tableInfo] of this.tablesAnalysees) {
      const donneesTable = this.donneesParTable.get(tableId) || [];

      if (donneesTable.length === 0) {
        this.log(`Table ${tableId}: aucune donnée à redistribuer`, 'info');
        continue;
      }

      this.log(`Table ${tableId}: redistribution de ${donneesTable.length} données`, 'table');

      const cellulesVides = tableInfo.cellules.filter(c => c.isEmpty);
      const usedData = new Set();

      for (const cellule of cellulesVides) {
        // Chercher une donnée correspondante pour cette position
        let matchedData = null;

        // Stratégie 1: Correspondance par position exacte
        matchedData = donneesTable.find(data => {
          if (usedData.has(data.cellId)) return false;
          return this.correspondPositionnelle(data, cellule, tableInfo);
        });

        // Stratégie 2: Première donnée disponible de cette table
        if (!matchedData) {
          matchedData = donneesTable.find(data => !usedData.has(data.cellId));
        }

        // Appliquer la restauration
        if (matchedData) {
          await this.appliquerRestaurationTable(cellule.element, matchedData, tableId);
          usedData.add(matchedData.cellId);
          cellulesCorrigees++;
        }
      }

      this.log(`Table ${tableId}: ${cellulesCorrigees} cellules corrigées`);
    }

    this.stats.cellulesCorrigees = cellulesCorrigees;
  }

  correspondPositionnelle(data, cellule, tableInfo) {
    // Essayer d'extraire la position de l'ID de la donnée
    const match = data.cellId.match(/cell_(\d+)$/);
    if (match) {
      const dataColIndex = parseInt(match[1]);
      return Math.abs(dataColIndex - cellule.col) <= 1; // Tolérance de position
    }
    return false;
  }

  async appliquerRestaurationTable(cell, data, tableId) {
    const contentToRestore = data.content || data.text;

    if (!contentToRestore || contentToRestore === 'undefined') {
      return false;
    }

    // Appliquer le contenu
    if (data.content && data.content !== 'undefined') {
      cell.innerHTML = data.content;
    } else if (data.text && data.text !== 'undefined') {
      cell.textContent = data.text;
    }

    // Assigner ou corriger l'ID avec référence à la bonne table
    const nouveauCellId = this.genererCellIdCorrect(cell, tableId);
    cell.dataset.cellId = nouveauCellId;

    // Mettre à jour en base avec le bon ID
    const nouvelleDonnee = {
      cellId: nouveauCellId,
      content: cell.innerHTML,
      text: cell.textContent,
      tableId: tableId,
      timestamp: Date.now()
    };

    await window.ClaraVerse.TablePersistence.db.set(nouveauCellId, nouvelleDonnee);

    // Animation de correction spécifique
    cell.style.backgroundColor = '#fef3c7'; // Jaune pour correction
    cell.style.border = '2px solid #f59e0b';
    setTimeout(() => {
      cell.style.backgroundColor = '#dcfce7'; // Vert pour succès
      cell.style.border = '1px solid #10b981';
    }, 1000);
    setTimeout(() => {
      cell.style.backgroundColor = '';
      cell.style.border = '';
    }, 3000);

    return true;
  }

  genererCellIdCorrect(cell, tableId) {
    const row = cell.closest('tr');
    const table = cell.closest('table');
    const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(cell);

    return `${tableId}_row_${rowIndex}_cell_${cellIndex}`;
  }

  async verifierCoherence() {
    this.log('Vérification de la cohérence finale...', 'fix');

    for (const [tableId, tableInfo] of this.tablesAnalysees) {
      let cellulesAvecContenu = 0;
      let cellulesAvecId = 0;
      let idsCorrects = 0;

      for (const celluleInfo of tableInfo.cellules) {
        const cell = celluleInfo.element;

        if (cell.textContent?.trim()) {
          cellulesAvecContenu++;
        }

        if (cell.dataset.cellId) {
          cellulesAvecId++;

          // Vérifier que l'ID correspond bien à cette table
          if (cell.dataset.cellId.includes(tableId.split('_')[1])) {
            idsCorrects++;
          }
        }
      }

      this.log(`Table ${tableId}: ${cellulesAvecContenu} avec contenu, ${idsCorrects} IDs corrects`, 'info');
    }
  }

  genererRapport() {
    return {
      success: true,
      stats: this.stats,
      tablesAnalysees: Array.from(this.tablesAnalysees.keys()),
      message: `${this.stats.tablesDetectees} tables séparées, ${this.stats.cellulesCorrigees} cellules corrigées, ${this.stats.donneesDeplacees} données déplacées`
    };
  }

  afficherRapportFinal(rapport) {
    this.log('📊 RAPPORT FINAL DE CORRECTION', 'success');
    console.log('='.repeat(50));
    this.log(`Tables détectées: ${rapport.stats.tablesDetectees}`);
    this.log(`Données triées: ${rapport.stats.donneesTriees}`);
    this.log(`Cellules corrigées: ${rapport.stats.cellulesCorrigees}`);
    this.log(`Données déplacées: ${rapport.stats.donneesDeplacees}`);
    console.log('Tables séparées:', rapport.tablesAnalysees);

    // Notification dans le DOM
    this.afficherNotificationCorrection(rapport);
  }

  afficherNotificationCorrection(rapport) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 15000;
      font-family: Arial, sans-serif;
      text-align: center;
      min-width: 350px;
    `;

    notification.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Tables Correctement Séparées</h3>
      <div style="font-size: 14px; opacity: 0.9; margin-bottom: 15px;">
        ${rapport.stats.tablesDetectees} tables • ${rapport.stats.cellulesCorrigees} cellules corrigées
      </div>
      <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; font-size: 12px;">
        Les données ont été redistribuées dans leurs tables d'origine
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
}

// INTERFACE GLOBALE
window.corrigerTablesSeparees = async function() {
  console.log('🔧 Correction Tables Séparées - Démarrage...');

  const correcteur = new CorrectionTablesSeperees();
  return await correcteur.executerCorrectionComplete();
};

// Fonction de diagnostic avant correction
window.diagnostiquerMelangeTables = async function() {
  console.log('🔍 Diagnostic mélange tables...');

  const tables = document.querySelectorAll('table');
  const problemes = [];

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const cellules = table.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');

    for (const cell of cellules) {
      const cellId = cell.dataset.cellId;
      if (cellId) {
        // Vérifier si l'ID contient des indices de table différents
        const match = cellId.match(/table_([^_]+)/);
        if (match) {
          const tableHash = match[1];
          // Si on trouve plusieurs tables avec des hash différents, il y a mélange
          if (!problemes.some(p => p.tableHash === tableHash)) {
            problemes.push({
              tableIndex: i,
              tableHash,
              cellules: Array.from(cellules).filter(c => c.dataset.cellId?.includes(tableHash)).length
            });
          }
        }
      }
    }
  }

  console.log('📊 Diagnostic des tables:');
  console.log(`${tables.length} tables trouvées`);
  console.log(`${problemes.length} groupes de données détectés`);

  if (problemes.length > tables.length) {
    console.log('⚠️ MÉLANGE DÉTECTÉ: Plus de groupes de données que de tables');
    console.log('💡 Recommandation: Exécuter corrigerTablesSeparees()');
  } else {
    console.log('✅ Pas de mélange détecté');
  }

  return { tables: tables.length, groupes: problemes.length, melange: problemes.length > tables.length };
};

// Auto-chargement
console.log('📊 Correction Tables Séparées chargée');
console.log('Commandes: corrigerTablesSeparees() | diagnostiquerMelangeTables()');
