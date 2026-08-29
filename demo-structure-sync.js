/**
 * ClaraVerse Structure Sync - Script de Démonstration v3.0
 *
 * Ce script démontre le nouveau système de synchronisation structurelle
 * qui permet de persister les modifications de structure des tables HTML.
 *
 * Usage:
 * 1. Charger ce script dans une page avec dev.js et menu.js
 * 2. Exécuter: startClaraVerseSyncDemo()
 * 3. Tester les fonctionnalités via l'interface
 */

class ClaraVerseSyncDemo {
  constructor() {
    this.demoTable = null;
    this.demoContainer = null;
    this.controlPanel = null;
    this.logContainer = null;
    this.tableId = null;
    this.logs = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      message,
      type,
      id: Date.now() + Math.random()
    };

    this.logs.unshift(logEntry);

    // Garder seulement les 20 derniers logs
    if (this.logs.length > 20) {
      this.logs = this.logs.slice(0, 20);
    }

    console.log(`[${timestamp}] ${message}`);
    this.updateLogDisplay();
  }

  updateLogDisplay() {
    if (!this.logContainer) return;

    const logHTML = this.logs.map(log => {
      const color = {
        info: '#3b82f6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b'
      }[log.type] || '#6b7280';

      return `
        <div style="padding: 4px 8px; margin: 2px 0; border-left: 3px solid ${color}; background: #f9fafb; font-size: 12px;">
          <span style="color: #6b7280;">[${log.timestamp}]</span>
          <span style="color: ${color};">${log.message}</span>
        </div>
      `;
    }).join('');

    this.logContainer.innerHTML = logHTML;
  }

  async createDemoInterface() {
    this.log('🚀 Initialisation de la démonstration ClaraVerse Sync', 'info');

    // Container principal
    this.demoContainer = document.createElement('div');
    this.demoContainer.id = 'claraverse-sync-demo';
    this.demoContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 500px;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: system-ui;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px 20px;
      background: linear-gradient(45deg, #3b82f6, #1d4ed8);
      color: white;
      border-radius: 10px 10px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h2 style="margin: 0; font-size: 16px;">🧪 ClaraVerse Sync Demo v3.0</h2>
      <button id="close-demo" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✕</button>
    `;

    // Panel de contrôles
    this.controlPanel = document.createElement('div');
    this.controlPanel.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    `;

    // Zone de table
    const tableArea = document.createElement('div');
    tableArea.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      max-height: 300px;
      overflow: auto;
    `;

    // Zone de logs
    this.logContainer = document.createElement('div');
    const logArea = document.createElement('div');
    logArea.style.cssText = `
      padding: 10px;
      max-height: 200px;
      overflow-y: auto;
      background: #f8fafc;
    `;

    const logTitle = document.createElement('h4');
    logTitle.textContent = '📋 Logs en temps réel';
    logTitle.style.cssText = 'margin: 0 0 10px 0; font-size: 14px; color: #374151;';

    logArea.appendChild(logTitle);
    logArea.appendChild(this.logContainer);

    // Assembler l'interface
    this.demoContainer.appendChild(header);
    this.demoContainer.appendChild(this.controlPanel);
    this.demoContainer.appendChild(tableArea);
    this.demoContainer.appendChild(logArea);

    document.body.appendChild(this.demoContainer);

    // Event listeners
    document.getElementById('close-demo').onclick = () => this.cleanup();

    // Créer la table de démonstration
    await this.createDemoTable(tableArea);
    this.createControls();

    this.log('✅ Interface de démonstration créée', 'success');
  }

  async createDemoTable(container) {
    const tableHTML = `
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">📊 Table de démonstration</h3>
      </div>
      <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" id="demo-sync-table" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-weight: bold;">Produit</th>
            <th style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-weight: bold;">Prix</th>
            <th style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-weight: bold;">Stock</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Ordinateur</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 12px;">999€</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 12px;">15</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Souris</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 12px;">25€</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 12px;">50</td>
          </tr>
        </tbody>
      </table>
    `;

    container.innerHTML = tableHTML;
    this.demoTable = container.querySelector('#demo-sync-table');

    // Attendre que dev.js traite la table
    await new Promise(resolve => setTimeout(resolve, 500));

    if (this.demoTable) {
      this.tableId = this.generateTableId();
      this.log(`📊 Table créée avec ID: ${this.tableId}`, 'success');

      // Sauvegarder la structure initiale
      await this.saveCurrentStructure('initial_creation');
    }
  }

  createControls() {
    this.controlPanel.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
        <button id="add-row-btn" class="demo-btn" style="background: #10b981;">➕ Ajouter ligne</button>
        <button id="add-col-btn" class="demo-btn" style="background: #3b82f6;">➕ Ajouter colonne</button>
        <button id="save-structure-btn" class="demo-btn" style="background: #f59e0b;">💾 Sauvegarder</button>
        <button id="restore-structure-btn" class="demo-btn" style="background: #8b5cf6;">🔄 Restaurer</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
        <button id="check-storage-btn" class="demo-btn" style="background: #6b7280;">🔍 Vérifier stockage</button>
        <button id="simulate-refresh-btn" class="demo-btn" style="background: #ef4444;">🔄 Simuler refresh</button>
      </div>
      <div style="background: #fef3c7; padding: 10px; border-radius: 6px; font-size: 12px;">
        💡 <strong>Astuce:</strong> Modifiez la structure, puis simulez un refresh pour voir la persistance!
      </div>
      <style>
        .demo-btn {
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
          transition: transform 0.2s ease;
        }
        .demo-btn:hover {
          transform: translateY(-1px);
        }
        .demo-btn:active {
          transform: translateY(0);
        }
      </style>
    `;

    // Event listeners pour les boutons
    document.getElementById('add-row-btn').onclick = () => this.addRow();
    document.getElementById('add-col-btn').onclick = () => this.addColumn();
    document.getElementById('save-structure-btn').onclick = () => this.saveCurrentStructure('manual_save');
    document.getElementById('restore-structure-btn').onclick = () => this.restoreStructure();
    document.getElementById('check-storage-btn').onclick = () => this.checkStorage();
    document.getElementById('simulate-refresh-btn').onclick = () => this.simulateRefresh();
  }

  generateTableId() {
    if (this.demoTable.dataset.tableId) {
      return this.demoTable.dataset.tableId;
    }

    if (window.generateTableId) {
      return window.generateTableId(this.demoTable);
    }

    return 'demo-table-' + Date.now();
  }

  async addRow() {
    try {
      this.log('➕ Ajout d\'une nouvelle ligne...', 'info');

      const tbody = this.demoTable.querySelector('tbody');
      const currentRowCount = tbody.children.length;
      const columnCount = this.demoTable.rows[0].cells.length;

      const newRow = document.createElement('tr');

      for (let i = 0; i < columnCount; i++) {
        const cell = document.createElement('td');
        cell.style.cssText = 'border: 1px solid #d1d5db; padding: 8px 12px;';
        cell.textContent = `Nouveau ${i + 1}`;
        newRow.appendChild(cell);
      }

      tbody.appendChild(newRow);

      this.log(`✅ Ligne ajoutée (maintenant ${currentRowCount + 1} lignes)`, 'success');

      // Sauvegarder automatiquement
      await this.saveCurrentStructure('row_added');

    } catch (error) {
      this.log(`❌ Erreur ajout ligne: ${error.message}`, 'error');
    }
  }

  async addColumn() {
    try {
      this.log('➕ Ajout d\'une nouvelle colonne...', 'info');

      const rows = Array.from(this.demoTable.rows);
      const currentColCount = rows[0].cells.length;

      rows.forEach((row, index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        cell.style.cssText = `border: 1px solid #d1d5db; padding: 8px 12px; ${index === 0 ? 'font-weight: bold; background: #f9fafb;' : ''}`;
        cell.textContent = index === 0 ? 'Nouvelle Col' : `Col ${currentColCount + 1}`;
        row.appendChild(cell);
      });

      this.log(`✅ Colonne ajoutée (maintenant ${currentColCount + 1} colonnes)`, 'success');

      // Sauvegarder automatiquement
      await this.saveCurrentStructure('column_added');

    } catch (error) {
      this.log(`❌ Erreur ajout colonne: ${error.message}`, 'error');
    }
  }

  async saveCurrentStructure(operation = 'manual_save') {
    try {
      this.log(`💾 Sauvegarde de la structure (${operation})...`, 'info');

      if (window.claraverseSyncAPI && window.claraverseSyncAPI.saveTableStructure) {
        const success = await window.claraverseSyncAPI.saveTableStructure(
          this.demoTable,
          {
            source: 'demo',
            operation: operation,
            timestamp: Date.now()
          }
        );

        if (success) {
          this.log('✅ Structure sauvegardée avec succès', 'success');
        } else {
          this.log('⚠️ Échec sauvegarde via API, tentative fallback...', 'warning');
          this.fallbackSave(operation);
        }
      } else {
        this.log('⚠️ API non disponible, utilisation fallback', 'warning');
        this.fallbackSave(operation);
      }

    } catch (error) {
      this.log(`❌ Erreur sauvegarde: ${error.message}`, 'error');
    }
  }

  fallbackSave(operation) {
    try {
      const structureData = {
        outerHTML: this.demoTable.outerHTML,
        rows: this.demoTable.rows.length,
        columns: this.demoTable.rows[0].cells.length,
        operation: operation,
        timestamp: Date.now(),
        source: 'demo_fallback'
      };

      localStorage.setItem(`claraverse_structure_${this.tableId}`, JSON.stringify(structureData));
      this.log('🛡️ Structure sauvegardée en fallback', 'success');
    } catch (error) {
      this.log(`❌ Échec fallback: ${error.message}`, 'error');
    }
  }

  async restoreStructure() {
    try {
      this.log('🔄 Restauration de la structure...', 'info');

      if (window.claraverseSyncAPI && window.claraverseSyncAPI.restoreTableStructure) {
        const restored = await window.claraverseSyncAPI.restoreTableStructure(this.demoTable);

        if (restored) {
          this.demoTable = restored;
          this.log('✅ Structure restaurée via API', 'success');
        } else {
          this.log('ℹ️ Aucune structure à restaurer via API, tentative fallback...', 'info');
          this.fallbackRestore();
        }
      } else {
        this.log('⚠️ API non disponible, tentative fallback...', 'warning');
        this.fallbackRestore();
      }

    } catch (error) {
      this.log(`❌ Erreur restauration: ${error.message}`, 'error');
    }
  }

  fallbackRestore() {
    try {
      const storedData = localStorage.getItem(`claraverse_structure_${this.tableId}`);

      if (storedData) {
        const data = JSON.parse(storedData);

        // Remplacer la table actuelle
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.outerHTML, 'text/html');
        const newTable = doc.querySelector('table');

        if (newTable) {
          this.demoTable.parentNode.replaceChild(newTable, this.demoTable);
          this.demoTable = newTable;
          this.log(`🛡️ Structure restaurée depuis fallback (${data.rows}x${data.columns})`, 'success');
        } else {
          this.log('❌ Impossible de parser la structure stockée', 'error');
        }
      } else {
        this.log('ℹ️ Aucune structure sauvegardée trouvée', 'info');
      }
    } catch (error) {
      this.log(`❌ Erreur fallback restore: ${error.message}`, 'error');
    }
  }

  checkStorage() {
    try {
      this.log('🔍 Vérification du stockage...', 'info');

      const structureKey = `claraverse_structure_${this.tableId}`;
      const storedData = localStorage.getItem(structureKey);

      if (storedData) {
        const data = JSON.parse(storedData);
        this.log(`📊 Structure trouvée: ${data.rows}x${data.columns}`, 'success');
        this.log(`🕐 Dernière modification: ${new Date(data.timestamp).toLocaleString()}`, 'info');
        this.log(`🔧 Opération: ${data.operation}`, 'info');
        this.log(`📝 Source: ${data.source}`, 'info');
      } else {
        this.log('❌ Aucune structure trouvée dans le stockage', 'warning');
      }

      // Vérifier aussi les autres clés ClaraVerse
      const allKeys = Object.keys(localStorage).filter(key => key.includes('claraverse'));
      this.log(`💾 Total clés ClaraVerse: ${allKeys.length}`, 'info');

    } catch (error) {
      this.log(`❌ Erreur vérification stockage: ${error.message}`, 'error');
    }
  }

  async simulateRefresh() {
    try {
      this.log('🔄 Simulation d\'un refresh de page...', 'info');

      // Sauvegarder d'abord
      await this.saveCurrentStructure('pre_refresh');

      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 500));

      // "Recréer" la table originale (simuler le rechargement)
      const originalTable = `
        <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" id="demo-sync-table" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-weight: bold;">Produit</th>
              <th style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-weight: bold;">Prix</th>
              <th style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-weight: bold;">Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Ordinateur</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 12px;">999€</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 12px;">15</td>
            </tr>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px 12px;">Souris</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 12px;">25€</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 12px;">50</td>
            </tr>
          </tbody>
        </table>
      `;

      const tableContainer = this.demoTable.parentNode;
      tableContainer.innerHTML = '<h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">📊 Table de démonstration (après refresh)</h3>' + originalTable;

      this.demoTable = tableContainer.querySelector('#demo-sync-table');

      this.log('🔄 Table "rechargée" vers structure originale', 'info');

      // Maintenant restaurer automatiquement
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.restoreStructure();

    } catch (error) {
      this.log(`❌ Erreur simulation refresh: ${error.message}`, 'error');
    }
  }

  cleanup() {
    if (this.demoContainer && document.body.contains(this.demoContainer)) {
      this.demoContainer.remove();
    }

    this.log('🧹 Démonstration fermée', 'info');
  }

  async start() {
    await this.createDemoInterface();

    // Message de bienvenue
    setTimeout(() => {
      this.log('👋 Bienvenue dans la démo ClaraVerse Sync!', 'success');
      this.log('💡 Cliquez sur les boutons pour tester les fonctionnalités', 'info');
      this.log('🚀 Toutes les modifications sont automatiquement sauvegardées', 'info');
    }, 500);
  }
}

// Fonction globale pour lancer la démonstration
window.startClaraVerseSyncDemo = async function() {
  // Vérifier que les dépendances sont chargées
  if (!window.claraverseSyncAPI && !localStorage.getItem) {
    console.error('❌ Dependencies manquantes pour la démo');
    alert('❌ Veuillez charger dev.js avant de lancer la démo');
    return;
  }

  // Fermer une démo existante
  const existingDemo = document.getElementById('claraverse-sync-demo');
  if (existingDemo) {
    existingDemo.remove();
  }

  const demo = new ClaraVerseSyncDemo();
  await demo.start();

  console.log('🎯 Démo ClaraVerse Sync démarrée!');
  return demo;
};

// Message de chargement
console.log('📋 Script de démonstration ClaraVerse Sync chargé!');
console.log('🚀 Exécutez: startClaraVerseSyncDemo()');

// Auto-démarrage si requis
if (typeof window !== 'undefined' && window.location.search.includes('auto-demo')) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.startClaraVerseSyncDemo();
    }, 2000);
  });
}
