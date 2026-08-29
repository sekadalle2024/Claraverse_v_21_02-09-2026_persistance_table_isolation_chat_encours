// Diagnostic détaillé : Pourquoi la restauration échoue ?

(function () {
    console.log('🔬 === DIAGNOSTIC RESTAURATION DÉTAILLÉ ===');

    window.diagnosticRestauration = async function () {
        console.log('🎯 Début du diagnostic...');

        try {
            // 1. Ouvrir IndexedDB
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('FlowiseTableDB', 1);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            // 2. Récupérer les tables sauvegardées
            const savedTables = await new Promise((resolve, reject) => {
                const transaction = db.transaction(['tables'], 'readonly');
                const store = transaction.objectStore('tables');
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });

            console.log(`📦 ${savedTables.length} table(s) sauvegardée(s)`);

            // 3. Analyser chaque table sauvegardée
            savedTables.forEach((savedTable, index) => {
                console.log(`\n📋 Table sauvegardée #${index + 1}:`);
                console.log('   ID:', savedTable.id);
                console.log('   Headers:', savedTable.headers);
                console.log('   Timestamp:', new Date(savedTable.timestamp).toLocaleString());
                console.log('   HTML length:', savedTable.html?.length);

                // Extraire le nombre de lignes
                if (savedTable.html) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = savedTable.html;
                    const rows = tempDiv.querySelectorAll('tbody tr');
                    console.log('   Lignes sauvegardées:', rows.length);
                }
            });

            // 4. Analyser les tables dans le DOM
            const allTables = document.querySelectorAll('table');
            console.log(`\n📊 ${allTables.length} table(s) dans le DOM`);

            allTables.forEach((table, index) => {
                const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());
                const tbody = table.querySelector('tbody');
                const rows = tbody ? tbody.querySelectorAll('tr').length : 0;
                const container = table.closest('[data-restored-content="true"]');

                console.log(`\n📊 Table DOM #${index + 1}:`);
                console.log('   Headers:', headers);
                console.log('   Lignes actuelles:', rows);
                console.log('   Déjà restaurée:', !!container);
                console.log('   Parent:', table.parentElement?.tagName, table.parentElement?.className);
            });

            // 5. Comparer les headers
            console.log('\n🔍 Comparaison des headers:');

            savedTables.forEach((savedTable, savedIndex) => {
                console.log(`\n   Table sauvegardée #${savedIndex + 1}:`);
                console.log('   Headers sauvegardés:', savedTable.headers);

                allTables.forEach((table, domIndex) => {
                    const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

                    // Comparaison détaillée
                    const lengthMatch = headers.length === savedTable.headers?.length;
                    const contentMatch = headers.every((h, i) => h === savedTable.headers?.[i]);

                    if (lengthMatch || contentMatch) {
                        console.log(`   ↔️ Table DOM #${domIndex + 1}:`);
                        console.log('      Headers DOM:', headers);
                        console.log('      Longueur match:', lengthMatch);
                        console.log('      Contenu match:', contentMatch);

                        // Comparaison header par header
                        if (!contentMatch && lengthMatch) {
                            console.log('      Différences:');
                            headers.forEach((h, i) => {
                                if (h !== savedTable.headers?.[i]) {
                                    console.log(`         [${i}] "${h}" !== "${savedTable.headers?.[i]}"`);
                                    console.log(`         Codes: [${Array.from(h).map(c => c.charCodeAt(0)).join(',')}]`);
                                    console.log(`              vs [${Array.from(savedTable.headers?.[i] || '').map(c => c.charCodeAt(0)).join(',')}]`);
                                }
                            });
                        }
                    }
                });
            });

            // 6. Tester la restauration manuellement
            console.log('\n🧪 Test de restauration manuelle:');

            for (const savedTable of savedTables) {
                console.log('\n   Tentative de restauration...');
                console.log('   Headers recherchés:', savedTable.headers);

                let found = false;

                for (const table of allTables) {
                    const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent?.trim());

                    // Test de correspondance
                    if (headers.length === savedTable.headers?.length &&
                        headers.every((h, i) => h === savedTable.headers?.[i])) {

                        console.log('   ✅ Table correspondante trouvée !');
                        console.log('   Headers DOM:', headers);

                        const container = table.closest('[data-restored-content="true"]');
                        if (container) {
                            console.log('   ⏭️ Déjà restaurée');
                        } else {
                            console.log('   ▶️ Peut être restaurée');

                            // Vérifier le tbody
                            const tbody = table.querySelector('tbody');
                            if (tbody) {
                                console.log('   ✅ tbody trouvé');

                                if (savedTable.html) {
                                    const tempDiv = document.createElement('div');
                                    tempDiv.innerHTML = savedTable.html;
                                    const savedTbody = tempDiv.querySelector('tbody');

                                    if (savedTbody) {
                                        console.log('   ✅ tbody sauvegardé trouvé');
                                        console.log('   📊 Lignes à restaurer:', savedTbody.querySelectorAll('tr').length);
                                    } else {
                                        console.log('   ❌ tbody sauvegardé NON trouvé dans le HTML');
                                    }
                                } else {
                                    console.log('   ❌ Pas de HTML sauvegardé');
                                }
                            } else {
                                console.log('   ❌ tbody NON trouvé dans la table DOM');
                            }
                        }

                        found = true;
                        break;
                    }
                }

                if (!found) {
                    console.log('   ❌ Aucune table correspondante trouvée');
                }
            }

            console.log('\n✅ Diagnostic terminé');

        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    };

    console.log('✅ Diagnostic détaillé chargé');
    console.log('💡 Lancez: window.diagnosticRestauration()');
})();
