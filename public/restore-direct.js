/**
 * Restauration directe depuis IndexedDB
 * Contourne tous les services et accède directement aux données
 */

(function () {
    'use strict';

    console.log('🔧 Chargement restore-direct.js');

    // Fonction pour restaurer directement depuis IndexedDB
    window.restoreDirect = async function () {
        console.log('🔄 === RESTAURATION DIRECTE DEPUIS INDEXEDDB ===\n');

        try {
            // Ouvrir IndexedDB
            const db = await openDatabase();

            if (!db) {
                console.error('❌ Impossible d\'ouvrir la base de données');
                return;
            }

            // Lire toutes les tables
            const tables = await getAllTables(db);

            console.log(`📊 ${tables.length} table(s) trouvée(s) dans IndexedDB\n`);

            if (tables.length === 0) {
                console.log('ℹ️ Aucune table à restaurer');
                db.close();
                return;
            }

            // Grouper par session
            const sessions = {};
            tables.forEach(table => {
                if (!sessions[table.sessionId]) {
                    sessions[table.sessionId] = [];
                }
                sessions[table.sessionId].push(table);
            });

            console.log(`📁 ${Object.keys(sessions).length} session(s) trouvée(s):\n`);
            Object.keys(sessions).forEach(sessionId => {
                console.log(`  - ${sessionId}: ${sessions[sessionId].length} table(s)`);
            });

            // Trouver le conteneur
            const container = document.querySelector('.prose') ||
                document.querySelector('[class*="message"]') ||
                document.querySelector('[class*="chat"]') ||
                document.body;

            console.log(`\n📍 Conteneur trouvé: ${container.className || 'body'}\n`);

            // Restaurer toutes les tables
            let restored = 0;
            for (const table of tables) {
                if (await injectTable(table, container)) {
                    restored++;
                }
            }

            console.log(`\n✅ ${restored}/${tables.length} table(s) restaurée(s)`);

            db.close();

        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    };

    // Ouvrir la base de données
    function openDatabase() {
        return new Promise((resolve) => {
            const request = indexedDB.open('ClaraDatabase');

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = () => {
                console.error('❌ Erreur ouverture DB:', request.error);
                resolve(null);
            };
        });
    }

    // Lire toutes les tables
    function getAllTables(db) {
        return new Promise((resolve) => {
            if (!db.objectStoreNames.contains('clara_generated_tables')) {
                console.warn('⚠️ Store clara_generated_tables non trouvé');
                resolve([]);
                return;
            }

            const transaction = db.transaction(['clara_generated_tables'], 'readonly');
            const store = transaction.objectStore('clara_generated_tables');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('❌ Erreur lecture tables:', request.error);
                resolve([]);
            };
        });
    }

    // Injecter une table dans le DOM
    async function injectTable(tableData, container) {
        try {
            // Vérifier si déjà présente
            const existingTables = container.querySelectorAll('table');
            for (const existing of existingTables) {
                if (existing.outerHTML === tableData.htmlContent) {
                    console.log(`  ⏭️ Déjà présente: ${tableData.keyword || tableData.id.substring(0, 8)}`);
                    return false;
                }
            }

            // Créer le wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'restored-table-wrapper';
            wrapper.style.cssText = `
        margin: 20px 0;
        padding: 16px;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        background: linear-gradient(to bottom, #eff6ff, #ffffff);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
      `;

            // Badge "Restauré"
            const badge = document.createElement('div');
            badge.style.cssText = `
        display: inline-block;
        background: #3b82f6;
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
      `;
            badge.textContent = '🔄 Restauré depuis IndexedDB';
            wrapper.appendChild(badge);

            // Titre
            if (tableData.keyword) {
                const title = document.createElement('div');
                title.style.cssText = `
          font-weight: 600;
          margin: 8px 0;
          color: #1e40af;
          font-size: 16px;
        `;
                title.textContent = `📊 ${tableData.keyword}`;
                wrapper.appendChild(title);
            }

            // Info
            const info = document.createElement('div');
            info.style.cssText = `
        font-size: 11px;
        color: #6b7280;
        margin-bottom: 12px;
      `;
            const date = new Date(tableData.timestamp).toLocaleString();
            info.textContent = `Session: ${tableData.sessionId.substring(0, 20)}... | ${date}`;
            wrapper.appendChild(info);

            // Table
            const tableContainer = document.createElement('div');
            tableContainer.innerHTML = tableData.htmlContent;
            wrapper.appendChild(tableContainer);

            // Ajouter au conteneur
            container.appendChild(wrapper);

            console.log(`  ✅ Restaurée: ${tableData.keyword || tableData.id.substring(0, 8)}`);
            return true;

        } catch (error) {
            console.error(`  ❌ Erreur injection:`, error);
            return false;
        }
    }

    // Auto-exécution après délai
    setTimeout(async () => {
        console.log('\n🔄 Auto-restauration directe dans 2 secondes...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await window.restoreDirect();
    }, 3000);

    console.log('✅ restore-direct.js chargé');
    console.log('💡 Commande: restoreDirect()\n');

})();
