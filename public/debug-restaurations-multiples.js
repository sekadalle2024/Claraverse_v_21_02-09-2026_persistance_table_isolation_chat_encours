/**
 * Script de débogage pour identifier les restaurations multiples
 */

(function () {
    'use strict';

    console.log('🔍 DEBUG RESTAURATIONS MULTIPLES - Démarrage');

    // Compteur de restaurations
    let restoreCount = 0;
    const restoreLog = [];

    // Intercepter les événements de restauration
    document.addEventListener('claraverse:restore:complete', (event) => {
        restoreCount++;
        const logEntry = {
            count: restoreCount,
            timestamp: new Date().toISOString(),
            detail: event.detail,
            stack: new Error().stack
        };
        restoreLog.push(logEntry);

        console.log(`🔄 RESTAURATION #${restoreCount}`, {
            timestamp: logEntry.timestamp,
            sessionId: event.detail?.sessionId,
            source: event.detail?.source
        });

        // Afficher la stack trace pour identifier la source
        console.log('📍 Stack trace:', logEntry.stack);
    });

    // Intercepter les demandes de restauration
    document.addEventListener('flowise:table:restore:request', (event) => {
        console.log('📨 DEMANDE DE RESTAURATION', {
            timestamp: new Date().toISOString(),
            sessionId: event.detail?.sessionId,
            stack: new Error().stack
        });
    });

    // Observer les modifications de tables
    let tableModCount = 0;
    const tableObserver = new MutationObserver((mutations) => {
        const hasTableChanges = mutations.some(m => {
            return Array.from(m.addedNodes).some(node => {
                if (node.nodeType === 1) {
                    return node.tagName === 'TABLE' || node.querySelector?.('table');
                }
                return false;
            }) || Array.from(m.removedNodes).some(node => {
                if (node.nodeType === 1) {
                    return node.tagName === 'TABLE' || node.querySelector?.('table');
                }
                return false;
            });
        });

        if (hasTableChanges) {
            tableModCount++;
            console.log(`📊 MODIFICATION TABLE #${tableModCount}`, {
                timestamp: new Date().toISOString(),
                addedNodes: mutations.reduce((sum, m) => sum + m.addedNodes.length, 0),
                removedNodes: mutations.reduce((sum, m) => sum + m.removedNodes.length, 0)
            });
        }
    });

    setTimeout(() => {
        tableObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('👀 Observer de tables activé');
    }, 1000);

    // Compter les tables périodiquement
    let lastTableCount = 0;
    setInterval(() => {
        const currentTableCount = document.querySelectorAll('table').length;
        if (currentTableCount !== lastTableCount) {
            console.log(`📈 Nombre de tables: ${lastTableCount} → ${currentTableCount}`);
            lastTableCount = currentTableCount;
        }
    }, 1000);

    // Exposer l'API de débogage
    window.debugRestaurations = {
        getCount: () => restoreCount,
        getLog: () => restoreLog,
        getTableModCount: () => tableModCount,
        reset: () => {
            restoreCount = 0;
            tableModCount = 0;
            restoreLog.length = 0;
            console.log('🔄 Compteurs réinitialisés');
        },
        showSummary: () => {
            console.log('📊 RÉSUMÉ DES RESTAURATIONS');
            console.log(`   Total: ${restoreCount}`);
            console.log(`   Modifications tables: ${tableModCount}`);
            console.log(`   Logs:`, restoreLog);
        }
    };

    // Afficher un résumé toutes les 10 secondes
    setInterval(() => {
        if (restoreCount > 0 || tableModCount > 0) {
            console.log(`📊 Résumé: ${restoreCount} restaurations, ${tableModCount} modifications tables`);
        }
    }, 10000);

    console.log('✅ Debug activé');
    console.log('💡 API: window.debugRestaurations');
    console.log('💡 Commandes:');
    console.log('   - window.debugRestaurations.getCount()');
    console.log('   - window.debugRestaurations.showSummary()');
    console.log('   - window.debugRestaurations.reset()');
})();
