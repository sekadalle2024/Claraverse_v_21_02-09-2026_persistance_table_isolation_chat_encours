// Test de restauration forcée avec logs détaillés

window.testRestoreForce = async function () {
    console.log('🧪 === TEST RESTAURATION FORCÉE ===');

    try {
        // 1. Ouvrir IndexedDB
        console.log('1️⃣ Ouverture IndexedDB...');
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('FlowiseTableDB', 1);
            request.onsuccess = () => {
                console.log('✅ IndexedDB ouvert');
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('❌ Erreur ouverture IndexedDB:', request.error);
                reject(request.error);
            };
        });

        // 2. Récupérer les tables sauvegardées
        console.log('2️⃣ Récupération des tables...');
        const savedTables = await new Promise((resolve, reject) => {
            const transaction = db.transaction(['tables'], 'readonly');
            const store = transaction.objectStore('tables');
            const request = store.getAll();
            request.onsuccess = () => {
                console.log(`✅ ${request.result.length} table(s) trouvée(s)`);
                resolve(request.result || []);
            };
            request.onerror = () => {
                console.error('❌ Erreur récupération:', request.error);
                reject(request.error);
            };
        });

        if (savedTables.length === 0) {
            console.log('ℹ️ Aucune table sauvegardée');
            return;
        }

        // 3. Afficher les tables sauvegardées
        console.log('3️⃣ Tables sauvegardées:');
        savedTables.forEach((t, i) => {
            console.log(`   ${i + 1}. Headers: [${t.headers.join(', ')}]`);
            console.log(`      Timestamp: ${new Date(t.timestamp).toLocaleString()}`);
        });

        // 4. Afficher les tables dans le DOM
        const allTables = document.querySelectorAll('table');
        console.log(`4️⃣ Tables dans le DOM: ${allTables.length}`);
        allTables.forEach((table, i) => {
            const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());
            console.log(`   ${i + 1}. Headers: [${headers.join(', ')}]`);
        });

        // 5. Essayer de restaurer chaque table
        console.log('5️⃣ Tentative de restauration...');
        let restoredCount = 0;

        for (const savedTable of savedTables) {
            console.log(`\n   🔍 Recherche table: [${savedTable.headers.join(', ')}]`);

            let found = false;
            for (const table of allTables) {
                const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

                // Vérifier correspondance
                const match = headers.length === savedTable.headers.length &&
                    headers.every((h, i) => h === savedTable.headers[i]);

                if (match) {
                    console.log('   ✅ Table correspondante trouvée !');

                    // Vérifier si déjà restaurée
                    const container = table.closest('[data-restored-content="true"]');
                    if (container) {
                        console.log('   ⏭️ Déjà restaurée');
                        found = true;
                        break;
                    }

                    // Restaurer
                    const tbody = table.querySelector('tbody');
                    if (!tbody) {
                        console.log('   ❌ Pas de tbody');
                        break;
                    }

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = savedTable.html;
                    const savedTbody = tempDiv.querySelector('tbody');

                    if (!savedTbody) {
                        console.log('   ❌ Pas de tbody sauvegardé');
                        break;
                    }

                    tbody.innerHTML = savedTbody.innerHTML;

                    const container2 = table.closest('[data-table-container]') || table.parentElement;
                    if (container2) {
                        container2.setAttribute('data-restored-content', 'true');
                        container2.setAttribute('data-restore-time', new Date().toISOString());
                    }

                    console.log(`   ✅ Table restaurée (${savedTbody.querySelectorAll('tr').length} lignes)`);
                    restoredCount++;
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log('   ❌ Table non trouvée dans le DOM');
            }
        }

        console.log(`\n✅ ${restoredCount}/${savedTables.length} table(s) restaurée(s)`);
        console.log('🧪 === FIN TEST ===');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
};

console.log('✅ Test de restauration forcée chargé');
console.log('💡 Lancez: window.testRestoreForce()');
