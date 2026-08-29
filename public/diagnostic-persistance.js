/**
 * Script de diagnostic pour la persistance des tables
 * À exécuter dans la console pour vérifier l'état du système
 */

(function () {
    'use strict';

    console.log('🔍 === DIAGNOSTIC PERSISTANCE TABLES ===');

    // Fonction de diagnostic complète
    window.diagnosticPersistance = async function () {
        const results = {
            api: false,
            indexedDB: false,
            tables: 0,
            sessions: [],
            errors: []
        };

        // 1. Vérifier l'API
        console.log('\n📋 1. Vérification API');
        results.api = !!window.claraverseSyncAPI;
        console.log('  claraverseSyncAPI:', results.api ? '✅' : '❌');
        console.log('  flowiseTableService:', !!window.flowiseTableService ? '✅' : '❌');
        console.log('  flowiseTableBridge:', !!window.flowiseTableBridge ? '✅' : '❌');

        // 2. Vérifier IndexedDB
        console.log('\n💾 2. Vérification IndexedDB');
        try {
            const dbs = await indexedDB.databases();
            const claraDB = dbs.find(db => db.name === 'ClaraDatabase');
            results.indexedDB = !!claraDB;
            console.log('  ClaraDatabase existe:', results.indexedDB ? '✅' : '❌');

            if (claraDB) {
                console.log('  Version:', claraDB.version);
            }
        } catch (error) {
            results.errors.push('IndexedDB: ' + error.message);
            console.error('  ❌ Erreur:', error.message);
        }

        // 3. Compter les tables sauvegardées
        console.log('\n📊 3. Tables sauvegardées');
        if (window.flowiseTableService) {
            try {
                const diag = await window.flowiseTableService.getDiagnostics();
                results.tables = diag.totalTables || 0;
                results.sessions = diag.sessions || [];

                console.log('  Total tables:', results.tables);
                console.log('  Taille totale:', diag.totalSize || '0 MB');
                console.log('  Sessions:', results.sessions.length);

                if (results.sessions.length > 0) {
                    console.log('  Liste des sessions:');
                    results.sessions.forEach(s => console.log('    -', s));
                }
            } catch (error) {
                results.errors.push('Diagnostics: ' + error.message);
                console.error('  ❌ Erreur:', error.message);
            }
        } else {
            console.warn('  ⚠️ flowiseTableService non disponible');
        }

        // 4. Vérifier les tables dans le DOM
        console.log('\n🌐 4. Tables dans le DOM');
        const tablesInDOM = document.querySelectorAll('table').length;
        console.log('  Tables visibles:', tablesInDOM);

        // 5. Tester une sauvegarde
        console.log('\n💾 5. Test de sauvegarde');
        const testTable = document.querySelector('table');
        if (testTable && window.claraverseSyncAPI) {
            try {
                await window.claraverseSyncAPI.forceSaveTable(testTable);
                console.log('  ✅ Sauvegarde test réussie');
            } catch (error) {
                results.errors.push('Sauvegarde test: ' + error.message);
                console.error('  ❌ Erreur:', error.message);
            }
        } else {
            console.warn('  ⚠️ Pas de table ou API non disponible');
        }

        // 6. Vérifier la restauration
        console.log('\n🔄 6. Capacité de restauration');
        if (window.flowiseTableBridge) {
            try {
                const currentSession = window.flowiseTableBridge.getCurrentSessionId();
                console.log('  Session actuelle:', currentSession);

                // Essayer de restaurer
                console.log('  Test de restauration...');
                await window.flowiseTableBridge.restoreTablesForSession(currentSession);
                console.log('  ✅ Restauration test réussie');
            } catch (error) {
                results.errors.push('Restauration: ' + error.message);
                console.error('  ❌ Erreur:', error.message);
            }
        } else {
            console.warn('  ⚠️ flowiseTableBridge non disponible');
        }

        // Résumé
        console.log('\n📝 === RÉSUMÉ ===');
        console.log('API disponible:', results.api ? '✅' : '❌');
        console.log('IndexedDB OK:', results.indexedDB ? '✅' : '❌');
        console.log('Tables sauvegardées:', results.tables);
        console.log('Erreurs:', results.errors.length);

        if (results.errors.length > 0) {
            console.log('\n❌ Erreurs détectées:');
            results.errors.forEach(err => console.log('  -', err));
        }

        if (results.api && results.indexedDB && results.tables > 0) {
            console.log('\n✅ Système fonctionnel ! Les tables sont sauvegardées.');
            console.log('💡 Si les modifications ne persistent pas, le problème est dans la restauration.');
        } else if (results.api && results.indexedDB && results.tables === 0) {
            console.log('\n⚠️ Système prêt mais aucune table sauvegardée.');
            console.log('💡 Modifiez une table pour tester la sauvegarde.');
        } else {
            console.log('\n❌ Problème détecté dans le système.');
        }

        return results;
    };

    // Fonction pour lister toutes les tables sauvegardées
    window.listerTablesSauvegardees = async function () {
        console.log('📋 === TABLES SAUVEGARDÉES ===\n');

        if (!window.flowiseTableService) {
            console.error('❌ flowiseTableService non disponible');
            return;
        }

        try {
            const diag = await window.flowiseTableService.getDiagnostics();

            if (!diag.sessions || diag.sessions.length === 0) {
                console.log('⚠️ Aucune session trouvée');
                return;
            }

            for (const sessionId of diag.sessions) {
                console.log(`\n📁 Session: ${sessionId}`);
                try {
                    const tables = await window.flowiseTableService.restoreSessionTables(sessionId);
                    console.log(`  Tables: ${tables.length}`);

                    tables.forEach((table, index) => {
                        console.log(`  ${index + 1}. ${table.keyword || 'Sans titre'}`);
                        console.log(`     ID: ${table.id}`);
                        console.log(`     Taille: ${(table.htmlContent?.length || 0)} caractères`);
                        console.log(`     Date: ${new Date(table.timestamp).toLocaleString()}`);
                    });
                } catch (error) {
                    console.error(`  ❌ Erreur: ${error.message}`);
                }
            }
        } catch (error) {
            console.error('❌ Erreur:', error.message);
        }
    };

    // Fonction pour forcer la restauration
    window.forcerRestauration = async function (sessionId) {
        console.log(`🔄 Forçage restauration session: ${sessionId || 'actuelle'}\n`);

        if (!window.flowiseTableBridge) {
            console.error('❌ flowiseTableBridge non disponible');
            return;
        }

        try {
            const session = sessionId || window.flowiseTableBridge.getCurrentSessionId();
            console.log('Session:', session);

            await window.flowiseTableBridge.restoreTablesForSession(session);
            console.log('✅ Restauration terminée');

            // Vérifier les tables dans le DOM
            setTimeout(() => {
                const tables = document.querySelectorAll('table').length;
                console.log(`📊 Tables dans le DOM: ${tables}`);
            }, 1000);
        } catch (error) {
            console.error('❌ Erreur:', error.message);
        }
    };

    // Fonction pour nettoyer localStorage
    window.nettoyerLocalStorage = function () {
        console.log('🧹 Nettoyage localStorage...\n');

        let cleaned = 0;
        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }

        keys.forEach(key => {
            if (key && (key.includes('claraverse') || key.includes('table') || key.includes('session'))) {
                try {
                    localStorage.removeItem(key);
                    cleaned++;
                    console.log(`  ✅ Supprimé: ${key}`);
                } catch (error) {
                    console.error(`  ❌ Erreur sur ${key}:`, error.message);
                }
            }
        });

        console.log(`\n✅ ${cleaned} entrée(s) nettoyée(s)`);
        console.log('💡 Rechargez la page pour appliquer les changements');
    };

    console.log('\n✅ Diagnostic chargé !');
    console.log('\n📝 Commandes disponibles:');
    console.log('  diagnosticPersistance()      - Diagnostic complet');
    console.log('  listerTablesSauvegardees()   - Liste toutes les tables');
    console.log('  forcerRestauration()         - Force la restauration');
    console.log('  nettoyerLocalStorage()       - Nettoie localStorage');
    console.log('\n💡 Exécutez: diagnosticPersistance()');
})();
