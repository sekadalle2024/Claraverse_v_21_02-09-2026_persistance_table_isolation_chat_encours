/**
 * Diagnostic Complet - Trouver la vraie source de l'espacement
 */

window.diagnosticComplet = function () {
    console.log('🔍 === DIAGNOSTIC COMPLET ESPACEMENT ===\n');

    // Trouver un message avec des tables
    const messages = document.querySelectorAll('.glassmorphic');
    console.log(`📨 Trouvé ${messages.length} messages glassmorphic\n`);

    if (messages.length > 0) {
        const message = messages[messages.length - 1]; // Dernier message
        console.log('📊 Analyse du dernier message:\n');

        // 1. Padding du message
        const messageStyle = window.getComputedStyle(message);
        console.log('Message glassmorphic:', {
            paddingTop: messageStyle.paddingTop,
            paddingBottom: messageStyle.paddingBottom,
            paddingLeft: messageStyle.paddingLeft,
            paddingRight: messageStyle.paddingRight
        });

        // 2. Conteneur prose
        const prose = message.querySelector('.prose');
        if (prose) {
            const proseStyle = window.getComputedStyle(prose);
            console.log('\nConteneur .prose:', {
                paddingTop: proseStyle.paddingTop,
                paddingBottom: proseStyle.paddingBottom,
                marginTop: proseStyle.marginTop,
                marginBottom: proseStyle.marginBottom
            });
        }

        // 3. Analyser chaque table et son contexte
        const tables = message.querySelectorAll('table');
        console.log(`\n📋 Trouvé ${tables.length} tables dans ce message\n`);

        tables.forEach((table, i) => {
            console.log(`\n--- TABLE ${i + 1} ---`);

            // Parent direct
            let parent = table.parentElement;
            let level = 0;

            while (parent && level < 5) {
                const style = window.getComputedStyle(parent);
                console.log(`Parent niveau ${level} (${parent.className}):`, {
                    marginTop: style.marginTop,
                    marginBottom: style.marginBottom,
                    paddingTop: style.paddingTop,
                    paddingBottom: style.paddingBottom,
                    display: style.display
                });

                parent = parent.parentElement;
                level++;

                if (parent && parent.classList.contains('glassmorphic')) break;
            }

            // HR avant et après
            const prevHr = table.closest('.overflow-x-auto')?.previousElementSibling;
            const nextHr = table.closest('.overflow-x-auto')?.nextElementSibling;

            if (prevHr && prevHr.tagName === 'HR') {
                const hrStyle = window.getComputedStyle(prevHr);
                console.log('HR avant:', {
                    marginTop: hrStyle.marginTop,
                    marginBottom: hrStyle.marginBottom,
                    height: hrStyle.height
                });
            }

            if (nextHr && nextHr.tagName === 'HR') {
                const hrStyle = window.getComputedStyle(nextHr);
                console.log('HR après:', {
                    marginTop: hrStyle.marginTop,
                    marginBottom: hrStyle.marginBottom,
                    height: hrStyle.height
                });
            }
        });
    }

    console.log('\n✅ Diagnostic terminé');
    console.log('💡 Cherchez les valeurs de padding/margin élevées ci-dessus');
};

console.log('📦 Diagnostic complet chargé. Tapez: diagnosticComplet()');
