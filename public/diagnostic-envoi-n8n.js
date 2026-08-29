// 🔍 DIAGNOSTIC COMPLET - Envoi vers n8n
// Ce script trace tout le flux de collecte et d'envoi

(function () {
    console.log('🚀 Diagnostic envoi n8n - Démarrage');

    // Intercepter les appels fetch vers n8n
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        const url = args[0];

        // Détecter les appels vers n8n
        if (url && (url.includes('n8n') || url.includes('webhook'))) {
            console.log('📡 APPEL N8N DÉTECTÉ:', {
                url: url,
                timestamp: new Date().toISOString()
            });

            // Si c'est un POST avec des données
            if (args[1] && args[1].method === 'POST') {
                const body = args[1].body;

                try {
                    let parsedBody;
                    if (typeof body === 'string') {
                        parsedBody = JSON.parse(body);
                    } else {
                        parsedBody = body;
                    }

                    console.log('📦 DONNÉES ENVOYÉES À N8N:', {
                        nombreDeTables: parsedBody.tables ? parsedBody.tables.length : 'N/A',
                        motCle: parsedBody.keyword || 'N/A',
                        userMessage: parsedBody.userMessage ? 'Présent' : 'Absent',
                        tailleHTML: body.length,
                        apercu: body.substring(0, 500)
                    });

                    // Afficher les tables individuellement
                    if (parsedBody.tables && Array.isArray(parsedBody.tables)) {
                        parsedBody.tables.forEach((table, index) => {
                            console.log(`  📋 Table ${index + 1}:`, {
                                longueur: table.length,
                                debut: table.substring(0, 100)
                            });
                        });
                    }
                } catch (e) {
                    console.log('📦 DONNÉES BRUTES (non-JSON):', {
                        type: typeof body,
                        taille: body.length,
                        apercu: body.substring(0, 500)
                    });
                }
            }
        }

        // Appeler la fonction fetch originale
        return originalFetch.apply(this, args).then(response => {
            // Intercepter la réponse de n8n
            if (url && (url.includes('n8n') || url.includes('webhook'))) {
                console.log('✅ RÉPONSE N8N REÇUE:', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                    timestamp: new Date().toISOString()
                });

                // Cloner la réponse pour pouvoir la lire
                const clonedResponse = response.clone();
                clonedResponse.text().then(text => {
                    console.log('📥 CONTENU RÉPONSE N8N:', {
                        taille: text.length,
                        apercu: text.substring(0, 500)
                    });
                });
            }
            return response;
        }).catch(error => {
            if (url && (url.includes('n8n') || url.includes('webhook'))) {
                console.error('❌ ERREUR APPEL N8N:', error);
            }
            throw error;
        });
    };

    // Surveiller les événements Flowise
    let tableCount = 0;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    // Détecter les tables Flowise
                    const flowiseTables = node.querySelectorAll('table tbody tr td:first-child');
                    flowiseTables.forEach((cell) => {
                        if (cell.textContent.trim() === 'Flowise') {
                            tableCount++;
                            console.log(`🔔 Table Flowise #${tableCount} détectée`, {
                                timestamp: new Date().toISOString(),
                                element: cell.closest('table')
                            });
                        }
                    });
                }
            });
        });
    });

    // Observer le conteneur de chat
    const chatContainer = document.querySelector('[class*="chat"]') || document.body;
    observer.observe(chatContainer, {
        childList: true,
        subtree: true
    });

    console.log('✅ Diagnostic activé - Surveillance des appels n8n en cours...');
    console.log('📊 Pour tester:');
    console.log('   1. Envoyez une table Flowise dans le chat');
    console.log('   2. Vérifiez les logs ci-dessus pour voir si l\'appel n8n est fait');
    console.log('   3. Vérifiez le contenu des données envoyées');

    // Fonction de test manuel
    window.testEnvoiN8n = function (htmlContent) {
        console.log('🧪 TEST MANUEL - Envoi vers n8n');

        // Simuler l'envoi comme le fait Flowise.js
        const endpoint = 'VOTRE_ENDPOINT_N8N_ICI'; // À remplacer

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tables: [htmlContent],
                keyword: 'Test manuel',
                userMessage: 'Test de diagnostic'
            })
        })
            .then(response => response.text())
            .then(data => {
                console.log('✅ Test réussi:', data);
            })
            .catch(error => {
                console.error('❌ Test échoué:', error);
            });
    };

    console.log('💡 Fonction de test disponible: testEnvoiN8n(htmlContent)');
})();
