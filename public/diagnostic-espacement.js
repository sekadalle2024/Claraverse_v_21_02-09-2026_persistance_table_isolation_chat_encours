/**
 * Diagnostic Espacement Tables
 * Ouvrir la console et taper: diagnosticEspacement()
 */

window.diagnosticEspacement = function () {
    console.log('🔍 === DIAGNOSTIC ESPACEMENT TABLES ===');

    // 1. Vérifier les HR
    const hrs = document.querySelectorAll('hr');
    console.log(`\n📊 Trouvé ${hrs.length} éléments <hr>`);
    hrs.forEach((hr, i) => {
        const computed = window.getComputedStyle(hr);
        console.log(`HR ${i + 1}:`, {
            marginTop: computed.marginTop,
            marginBottom: computed.marginBottom,
            opacity: computed.opacity
        });
    });

    // 2. Vérifier les conteneurs overflow
    const overflows = document.querySelectorAll('.overflow-x-auto');
    console.log(`\n📦 Trouvé ${overflows.length} conteneurs .overflow-x-auto`);
    overflows.forEach((el, i) => {
        const computed = window.getComputedStyle(el);
        console.log(`Conteneur ${i + 1}:`, {
            marginTop: computed.marginTop,
            marginBottom: computed.marginBottom,
            classes: el.className
        });
    });

    // 3. Vérifier les my-4
    const my4 = document.querySelectorAll('.my-4');
    console.log(`\n🎯 Trouvé ${my4.length} éléments .my-4`);
    my4.forEach((el, i) => {
        const computed = window.getComputedStyle(el);
        console.log(`my-4 ${i + 1}:`, {
            marginTop: computed.marginTop,
            marginBottom: computed.marginBottom
        });
    });

    // 4. Vérifier data-container-id
    const dataContainers = document.querySelectorAll('[data-container-id]');
    console.log(`\n📋 Trouvé ${dataContainers.length} [data-container-id]`);
    dataContainers.forEach((el, i) => {
        const computed = window.getComputedStyle(el);
        console.log(`Container ${i + 1}:`, {
            marginTop: computed.marginTop,
            marginBottom: computed.marginBottom,
            id: el.getAttribute('data-container-id')
        });
    });

    // 5. Vérifier le style injecté
    const styleElement = document.getElementById('modelisation-force-styles');
    console.log(`\n🎨 Style injecté:`, styleElement ? '✅ OUI' : '❌ NON');
    if (styleElement) {
        console.log('Contenu du style:', styleElement.textContent.substring(0, 200) + '...');
    }

    // 6. Vérifier l'API
    console.log(`\n🔧 API disponible:`, window.claraverseModelisationForce ? '✅ OUI' : '❌ NON');

    console.log('\n✅ Diagnostic terminé');
    console.log('💡 Pour forcer la réapplication: window.claraverseModelisationForce.reapply()');
};

console.log('📦 Diagnostic chargé. Tapez: diagnosticEspacement()');
