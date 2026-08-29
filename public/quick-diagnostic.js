// Script de diagnostic rapide à copier-coller dans la console

(async function quickDiagnostic() {
    console.log('\n🔍 ===== DIAGNOSTIC RAPIDE =====\n');

    // 1. Vérifier les scripts chargés
    console.log('📦 Scripts chargés:');
    console.log('  - Smart Restore:', typeof window.forceSmartRestore !== 'undefined' ? '✅' : '❌');
    console.log('  - Restore Tables:', typeof window.restoreModifiedTables !== 'undefined' ? '✅' : '❌');
    console.log('  - Wrap Tables:', typeof window.wrapAllTables !== 'undefined' ? '✅' : '❌');

    // 2. Vérifier IndexedDB
    console.log('\n💾 IndexedDB:');
    try {
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('FlowiseTableDB', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const tables = await new Promise((resolve, reject) => {
            const transaction = db.transaction(['tables'], 'readonly');
            const store = transaction.objectStore('tables');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        console.log(`  ✅ ${tables.length} table(s) sauvegardée(s)`);

        tables.forEach((table, i) => {
            const headers = table.headers?.join(', ').substring(0, 60) || 'N/A';
            const rowCount = (table.html?.match(/<tr>/g) || []).length - 1; // -1 pour le header
            console.log(`  📊 Table ${i + 1}: ${headers}... (${rowCount} lignes)`);
        });

    } catch (error) {
        console.log('  ❌ Erreur:', error.message);
    }

    // 3. Vérifier les tables dans le DOM
    console.log('\n📋 Tables dans le DOM:');
    const allTables = document.querySelectorAll('table');
    const restoredTables = document.querySelectorAll('[data-restored-content="true"]');
    const wrappedTables = document.querySelectorAll('[data-table-container]');

    console.log(`  - Total: ${allTables.length}`);
    console.log(`  - Restaurées: ${restoredTables.length}`);
    console.log(`  - Wrappées: ${wrappedTables.length}`);

    // 4. Détails des tables restaurées
    if (restoredTables.length > 0) {
        console.log('\n✅ Tables restaurées:');
        restoredTables.forEach((container, i) => {
            const table = container.querySelector('table');
            if (table) {
                const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim()).join(', ');
                const rows = table.querySelectorAll('tbody tr').length;
                const restoreTime = container.getAttribute('data-restore-time');
                console.log(`  ${i + 1}. ${headers.substring(0, 60)}... (${rows} lignes)`);
                console.log(`     Restaurée à: ${restoreTime}`);
            }
        });
    } else {
        console.log('\n⚠️ Aucune table restaurée trouvée');
    }

    // 5. Rechercher des duplicatas
    console.log('\n🔍 Recherche de duplicatas:');
    const headerMap = new Map();
    let duplicateCount = 0;

    allTables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim()).join('|');
        if (headers) {
            if (headerMap.has(headers)) {
                duplicateCount++;
                console.log(`  ⚠️ Duplicata trouvé: ${headers.substring(0, 60)}...`);
            } else {
                headerMap.set(headers, table);
            }
        }
    });

    if (duplicateCount === 0) {
        console.log('  ✅ Aucun duplicata trouvé');
    } else {
        console.log(`  ⚠️ ${duplicateCount} duplicata(s) trouvé(s)`);
    }

    // 6. Recommandations
    console.log('\n💡 Recommandations:');

    if (restoredTables.length === 0 && tables.length > 0) {
        console.log('  ⚠️ Des tables sont sauvegardées mais non restaurées');
        console.log('  → Essayez: window.forceSmartRestore()');
    } else if (restoredTables.length > 0) {
        console.log('  ✅ La restauration fonctionne correctement');
    }

    if (duplicateCount > 0) {
        console.log('  ⚠️ Des duplicatas existent');
        console.log('  → Rechargez la page pour nettoyer');
    }

    console.log('\n===== FIN DU DIAGNOSTIC =====\n');

    // Retourner un résumé
    return {
        scriptsLoaded: {
            smartRestore: typeof window.forceSmartRestore !== 'undefined',
            restoreTables: typeof window.restoreModifiedTables !== 'undefined',
            wrapTables: typeof window.wrapAllTables !== 'undefined'
        },
        indexedDB: {
            savedTables: tables?.length || 0
        },
        dom: {
            totalTables: allTables.length,
            restoredTables: restoredTables.length,
            wrappedTables: wrappedTables.length,
            duplicates: duplicateCount
        },
        status: restoredTables.length > 0 ? 'SUCCESS' : 'NEEDS_RESTORE'
    };
})();
