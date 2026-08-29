// Diagnostic pour comprendre la race condition entre Flowise et la restauration

(function () {
    console.log('🔍 DIAGNOSTIC TIMING - Démarrage');

    const events = [];
    let restorationAttempts = 0;
    let flowiseRegenerations = 0;

    // Intercepter les restaurations
    const originalRestore = window.restoreModifiedTables;
    if (originalRestore) {
        window.restoreModifiedTables = async function (...args) {
            restorationAttempts++;
            const timestamp = Date.now();
            events.push({
                type: 'RESTORATION_ATTEMPT',
                time: timestamp,
                attempt: restorationAttempts
            });
            console.log(`📥 [${new Date(timestamp).toISOString()}] Tentative de restauration #${restorationAttempts}`);

            const result = await originalRestore.apply(this, args);

            events.push({
                type: 'RESTORATION_COMPLETE',
                time: Date.now(),
                attempt: restorationAttempts,
                success: result
            });
            console.log(`✅ [${new Date().toISOString()}] Restauration #${restorationAttempts} terminée`);

            return result;
        };
    }

    // Observer les mutations DOM pour détecter quand Flowise ajoute/modifie des tables
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    // Chercher les tables ajoutées
                    const tables = node.querySelectorAll ? node.querySelectorAll('table') : [];
                    if (node.tagName === 'TABLE') {
                        tables.push(node);
                    }

                    if (tables.length > 0) {
                        flowiseRegenerations++;
                        const timestamp = Date.now();
                        events.push({
                            type: 'FLOWISE_TABLE_ADDED',
                            time: timestamp,
                            count: tables.length,
                            regeneration: flowiseRegenerations
                        });
                        console.log(`🔄 [${new Date(timestamp).toISOString()}] Flowise a ajouté ${tables.length} table(s) - Régénération #${flowiseRegenerations}`);

                        // Vérifier si c'est une table restaurée ou originale
                        tables.forEach(table => {
                            const container = table.closest('[data-restored-content]');
                            const rows = table.querySelectorAll('tbody tr').length;
                            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim()).join(', ');

                            console.log(`  📊 Table: ${headers.substring(0, 50)}... (${rows} lignes) - Restaurée: ${!!container}`);
                        });
                    }
                }
            });
        });
    });

    // Observer le conteneur de chat
    setTimeout(() => {
        const chatContainer = document.querySelector('.message-container, #chat-container, [class*="message"], [class*="chat"]');
        if (chatContainer) {
            observer.observe(chatContainer, {
                childList: true,
                subtree: true
            });
            console.log('👀 Observer activé sur le conteneur de chat');
        } else {
            console.warn('⚠️ Conteneur de chat non trouvé');
        }
    }, 1000);

    // Rapport après 30 secondes
    setTimeout(() => {
        console.log('\n📊 ===== RAPPORT DE TIMING =====');
        console.log(`Tentatives de restauration: ${restorationAttempts}`);
        console.log(`Régénérations Flowise: ${flowiseRegenerations}`);
        console.log('\n📅 Chronologie des événements:');

        events.sort((a, b) => a.time - b.time);
        const startTime = events[0]?.time || Date.now();

        events.forEach(event => {
            const elapsed = ((event.time - startTime) / 1000).toFixed(2);
            let icon = '❓';
            let msg = '';

            switch (event.type) {
                case 'RESTORATION_ATTEMPT':
                    icon = '📥';
                    msg = `Début restauration #${event.attempt}`;
                    break;
                case 'RESTORATION_COMPLETE':
                    icon = '✅';
                    msg = `Fin restauration #${event.attempt}`;
                    break;
                case 'FLOWISE_TABLE_ADDED':
                    icon = '🔄';
                    msg = `Flowise ajoute ${event.count} table(s) - Régénération #${event.regeneration}`;
                    break;
            }

            console.log(`[+${elapsed}s] ${icon} ${msg}`);
        });

        // Analyser les race conditions
        console.log('\n⚠️ ANALYSE DES RACE CONDITIONS:');
        let raceConditions = 0;

        for (let i = 0; i < events.length - 1; i++) {
            const current = events[i];
            const next = events[i + 1];

            // Si Flowise ajoute une table APRÈS une restauration
            if (current.type === 'RESTORATION_COMPLETE' && next.type === 'FLOWISE_TABLE_ADDED') {
                const gap = ((next.time - current.time) / 1000).toFixed(2);
                raceConditions++;
                console.log(`❌ Race condition #${raceConditions}: Flowise régénère ${gap}s après la restauration`);
            }
        }

        if (raceConditions === 0) {
            console.log('✅ Aucune race condition détectée');
        }

        // État actuel des tables
        console.log('\n📋 ÉTAT ACTUEL DES TABLES:');
        const allTables = document.querySelectorAll('table');
        const restoredTables = document.querySelectorAll('[data-restored-content="true"] table');

        console.log(`Total de tables: ${allTables.length}`);
        console.log(`Tables restaurées: ${restoredTables.length}`);

        restoredTables.forEach((table, i) => {
            const rows = table.querySelectorAll('tbody tr').length;
            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim()).join(', ');
            console.log(`  Table restaurée ${i + 1}: ${headers.substring(0, 50)}... (${rows} lignes)`);
        });

        console.log('\n===== FIN DU RAPPORT =====\n');
    }, 30000);

    console.log('✅ Diagnostic de timing activé - Rapport dans 30 secondes');
})();
