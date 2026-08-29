/**
 * Script automatique pour envelopper les tables sans conteneur
 * S'exécute en continu pour capturer les tables générées par n'importe quel système
 */
(function () {
    'use strict';

    console.log('🔧 Initialisation du wrapper automatique de tables');

    /**
     * Enveloppe une table dans un conteneur avec data-container-id
     */
    function wrapTableInContainer(table) {
        // Vérifier si déjà dans un conteneur
        if (table.closest('[data-container-id]')) {
            return false;
        }

        // ⭐ IMPORTANT: Ne PAS envelopper les tables Flowise (elles seront traitées par Flowise.js)
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim().toLowerCase());
        if (headers.includes('flowise')) {
            console.log('⏭️ Table Flowise ignorée (sera traitée par Flowise.js)');
            return false;
        }

        // Créer le conteneur
        const container = document.createElement('div');
        container.className = 'prose prose-base dark:prose-invert max-w-none';
        container.setAttribute('data-container-id', `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        container.setAttribute('data-auto-wrapped', 'true');

        // Insérer le conteneur et y déplacer la table
        table.parentNode.insertBefore(container, table);
        container.appendChild(table);

        console.log('✅ Table enveloppée avec data-container-id:', container.getAttribute('data-container-id'));
        return true;
    }

    /**
     * Scanne et enveloppe toutes les tables sans conteneur
     */
    function wrapAllUnwrappedTables() {
        const allTables = document.querySelectorAll('table');
        let wrappedCount = 0;

        allTables.forEach(table => {
            // Ignorer les tables déjà dans un conteneur
            if (table.closest('[data-container-id]')) {
                return;
            }

            // Ignorer les tables dans des éléments spéciaux (modals, etc.)
            if (table.closest('[role="dialog"]') || table.closest('.modal')) {
                return;
            }

            if (wrapTableInContainer(table)) {
                wrappedCount++;
            }
        });

        if (wrappedCount > 0) {
            console.log(`📦 ${wrappedCount} table(s) enveloppée(s) automatiquement`);
        }
    }

    // Observer pour détecter les nouvelles tables
    const observer = new MutationObserver((mutations) => {
        let hasNewTables = false;

        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Vérifier si c'est une table ou contient des tables
                        if (node.tagName === 'TABLE' || node.querySelector?.('table')) {
                            hasNewTables = true;
                        }
                    }
                });
            }
        });

        if (hasNewTables) {
            // Petit délai pour laisser le DOM se stabiliser
            setTimeout(wrapAllUnwrappedTables, 100);
        }
    });

    // Démarrer l'observation
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Scan initial
    setTimeout(wrapAllUnwrappedTables, 500);

    // Scan périodique de sécurité (toutes les 2 secondes)
    setInterval(wrapAllUnwrappedTables, 2000);

    console.log('✅ Wrapper automatique de tables activé');

    // API publique pour debug
    window.tableWrapper = {
        wrapAll: wrapAllUnwrappedTables,
        version: '1.0.0'
    };
})();
