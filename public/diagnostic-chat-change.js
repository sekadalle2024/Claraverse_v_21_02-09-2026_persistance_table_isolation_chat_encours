// Diagnostic : Pourquoi la restauration ne se déclenche pas au changement de chat ?

(function () {
    console.log('🔍 === DIAGNOSTIC CHANGEMENT DE CHAT ===');

    // 1. Vérifier si le script restore-on-any-change est chargé
    console.log('📦 Script restore-on-any-change chargé:', typeof window.restoreTablesNow !== 'undefined');

    // 2. Observer l'URL
    let lastUrl = window.location.href;
    console.log('📍 URL initiale:', lastUrl);

    setInterval(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            console.log('🔗 CHANGEMENT URL DÉTECTÉ !');
            console.log('   Avant:', lastUrl);
            console.log('   Après:', currentUrl);
            lastUrl = currentUrl;
        }
    }, 100);

    // 3. Observer les changements DOM
    let domChangeCount = 0;
    const observer = new MutationObserver((mutations) => {
        domChangeCount++;

        const hasTableChanges = mutations.some(m => {
            return Array.from(m.addedNodes).some(node => {
                if (node.nodeType === 1) {
                    return node.tagName === 'TABLE' || node.querySelector?.('table');
                }
                return false;
            });
        });

        if (hasTableChanges) {
            console.log('📊 NOUVELLES TABLES DÉTECTÉES !', {
                mutationCount: domChangeCount,
                timestamp: new Date().toISOString()
            });
        }

        // Log des changements significatifs
        if (mutations.length > 10) {
            console.log('🔄 Changement DOM majeur:', {
                mutations: mutations.length,
                addedNodes: mutations.reduce((sum, m) => sum + m.addedNodes.length, 0),
                removedNodes: mutations.reduce((sum, m) => sum + m.removedNodes.length, 0)
            });
        }
    });

    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('👀 MutationObserver activé');
    }, 1000);

    // 4. Observer les clics
    document.addEventListener('click', (e) => {
        const target = e.target;
        console.log('🖱️ Clic détecté sur:', {
            tagName: target.tagName,
            className: target.className,
            id: target.id,
            text: target.textContent?.substring(0, 50)
        });

        // Vérifier si c'est un élément de navigation
        if (target.closest('a, button, [role="button"]')) {
            console.log('   ➡️ Élément de navigation cliqué !');
        }
    }, true);

    // 5. Observer les événements de navigation
    window.addEventListener('popstate', (e) => {
        console.log('⬅️ POPSTATE EVENT !', e);
    });

    // 6. Compter les tables périodiquement
    let lastTableCount = 0;
    setInterval(() => {
        const currentTableCount = document.querySelectorAll('table').length;
        if (currentTableCount !== lastTableCount) {
            console.log('📊 Nombre de tables changé:', lastTableCount, '→', currentTableCount);
            lastTableCount = currentTableCount;
        }
    }, 500);

    // 7. Vérifier IndexedDB
    setTimeout(async () => {
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

            console.log('💾 IndexedDB:', {
                tablesCount: tables.length,
                tables: tables.map(t => ({
                    id: t.id,
                    headers: t.headers,
                    timestamp: new Date(t.timestamp).toLocaleString()
                }))
            });
        } catch (error) {
            console.error('❌ Erreur IndexedDB:', error);
        }
    }, 2000);

    // 8. Vérifier la structure de l'application
    setTimeout(() => {
        console.log('🏗️ Structure de l\'application:', {
            hasReactRoot: !!document.getElementById('root'),
            hasChatContainer: !!document.querySelector('[class*="chat"], [class*="message"]'),
            allContainers: Array.from(document.querySelectorAll('[class*="chat"], [class*="message"], [id*="chat"]'))
                .map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    id: el.id
                }))
        });
    }, 3000);

    // 9. Fonction de test manuel
    window.testChatChange = function () {
        console.log('🧪 TEST MANUEL - Simulation changement de chat');
        console.log('URL actuelle:', window.location.href);
        console.log('Tables actuelles:', document.querySelectorAll('table').length);
        console.log('Containers restaurés:', document.querySelectorAll('[data-restored-content="true"]').length);

        if (typeof window.restoreTablesNow === 'function') {
            console.log('▶️ Lancement de la restauration...');
            window.restoreTablesNow();
        } else {
            console.error('❌ window.restoreTablesNow n\'existe pas !');
        }
    };

    console.log('✅ Diagnostic activé');
    console.log('💡 Instructions:');
    console.log('   1. Créez une table et modifiez-la');
    console.log('   2. Changez de chat');
    console.log('   3. Observez les logs dans la console');
    console.log('   4. Test manuel: window.testChatChange()');
})();
