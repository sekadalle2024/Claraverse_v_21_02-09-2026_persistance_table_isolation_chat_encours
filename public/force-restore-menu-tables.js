/**
 * Force la restauration des tables modifiées par menu.js
 * Solution directe qui injecte les tables dans le DOM
 */

(function () {
    'use strict';

    console.log('🔧 Chargement force-restore-menu-tables.js');

    // Attendre que tout soit prêt
    const waitForSystem = () => {
        return new Promise((resolve) => {
            const check = () => {
                if (window.flowiseTableService && window.flowiseTableBridge) {
                    resolve(true);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();

            // Timeout après 10 secondes
            setTimeout(() => resolve(false), 10000);
        });
    };

    // Fonction principale de restauration forcée
    const forceRestoreMenuTables = async () => {
        console.log('🔄 Début restauration forcée des tables menu.js');

        try {
            // Attendre le système
            const ready = await waitForSystem();
            if (!ready) {
                console.error('❌ Système non prêt');
                return;
            }

            // Obtenir la session stable
            let sessionId = sessionStorage.getItem('claraverse_stable_session');

            if (!sessionId) {
                console.log('⚠️ Pas de session stable, recherche de toutes les sessions...');

                // Obtenir toutes les sessions
                const diag = await window.flowiseTableService.getDiagnostics();

                if (!diag || !diag.sessions || diag.sessions.length === 0) {
                    console.log('ℹ️ Aucune table sauvegardée');
                    return;
                }

                console.log(`📊 ${diag.sessions.length} session(s) trouvée(s):`, diag.sessions);

                // Restaurer TOUTES les sessions
                for (const session of diag.sessions) {
                    await restoreSessionTables(session);
                }
            } else {
                // Restaurer la session stable
                console.log(`🔄 Restauration session stable: ${sessionId}`);
                await restoreSessionTables(sessionId);
            }

            console.log('✅ Restauration forcée terminée');

        } catch (error) {
            console.error('❌ Erreur restauration forcée:', error);
        }
    };

    // Restaurer les tables d'une session
    const restoreSessionTables = async (sessionId) => {
        try {
            console.log(`📋 Restauration session: ${sessionId}`);

            // Récupérer les tables de cette session
            const tables = await window.flowiseTableService.restoreSessionTables(sessionId);

            if (!tables || tables.length === 0) {
                console.log(`  ℹ️ Aucune table dans cette session`);
                return;
            }

            console.log(`  📊 ${tables.length} table(s) trouvée(s)`);

            // Trouver le conteneur de chat
            const chatContainer = document.querySelector('.prose') ||
                document.querySelector('[class*="chat"]') ||
                document.querySelector('[class*="message"]') ||
                document.body;

            // Injecter chaque table dans le DOM
            for (const tableData of tables) {
                await injectTableIntoDOM(tableData, chatContainer);
            }

            console.log(`  ✅ ${tables.length} table(s) restaurée(s)`);

        } catch (error) {
            console.error(`  ❌ Erreur restauration session ${sessionId}:`, error);
        }
    };

    // Injecter une table dans le DOM
    const injectTableIntoDOM = async (tableData, container) => {
        try {
            // Vérifier si la table existe déjà
            const existingTables = container.querySelectorAll('table');
            for (const existing of existingTables) {
                if (existing.outerHTML === tableData.htmlContent) {
                    console.log(`  ⏭️ Table déjà présente: ${tableData.keyword}`);
                    return;
                }
            }

            // Créer un conteneur pour la table
            const wrapper = document.createElement('div');
            wrapper.className = 'restored-table-container';
            wrapper.style.cssText = `
        margin: 16px 0;
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #ffffff;
      `;

            // Ajouter un titre si keyword existe
            if (tableData.keyword) {
                const title = document.createElement('div');
                title.style.cssText = `
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
          font-size: 14px;
        `;
                title.textContent = `📊 ${tableData.keyword}`;
                wrapper.appendChild(title);
            }

            // Injecter le HTML de la table
            const tableContainer = document.createElement('div');
            tableContainer.innerHTML = tableData.htmlContent;
            wrapper.appendChild(tableContainer);

            // Ajouter au conteneur
            container.appendChild(wrapper);

            console.log(`  ✅ Table injectée: ${tableData.keyword || tableData.id}`);

        } catch (error) {
            console.error(`  ❌ Erreur injection table:`, error);
        }
    };

    // Exposer la fonction globalement
    window.forceRestoreMenuTables = forceRestoreMenuTables;

    // Auto-exécution après un délai
    const autoRestore = async () => {
        // Attendre que la page soit chargée
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Attendre un peu plus pour que tout soit initialisé
        await new Promise(resolve => setTimeout(resolve, 4000));

        // Exécuter la restauration
        await forceRestoreMenuTables();
    };

    // Lancer l'auto-restauration
    autoRestore().catch(error => {
        console.error('❌ Erreur auto-restauration:', error);
    });

    console.log('✅ force-restore-menu-tables.js chargé');
    console.log('💡 Commande disponible: forceRestoreMenuTables()');

})();
