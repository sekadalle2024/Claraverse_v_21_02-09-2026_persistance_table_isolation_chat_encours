/**
 * SCRIPT DE VÉRIFICATION RAPIDE - ENDPOINT N8N
 * Copier-coller dans la console du navigateur
 */

console.log("\n═══════════════════════════════════════════════════════");
console.log("🔍 VÉRIFICATION ENDPOINT N8N");
console.log("═══════════════════════════════════════════════════════\n");

// Vérifier si le script est chargé
if (typeof window.ClaraverseN8nV17 === 'undefined') {
    console.error("❌ Script Flowise.js NON chargé!");
    console.error("└─ Recharger la page avec Ctrl+F5\n");
} else {
    console.log("✅ Script Flowise.js chargé\n");

    // Vérifier la version
    console.log("📦 VERSION");
    console.log("├─ Version:", window.ClaraverseN8nV17.version);
    console.log("└─ Attendu: 18.0.0\n");

    // Vérifier l'endpoint
    const endpoint = window.ClaraverseN8nV17.CONFIG.N8N_ENDPOINT_URL;
    console.log("🔗 ENDPOINT CONFIGURÉ");
    console.log("├─ Endpoint actuel:", endpoint);
    console.log("└─ Endpoint attendu: https://barow52161.app.n8n.cloud/webhook/htlm_processor\n");

    // Vérifier si c'est le bon endpoint
    if (endpoint === "https://barow52161.app.n8n.cloud/webhook/htlm_processor") {
        console.log("✅ ENDPOINT CORRECT - n8n Cloud configuré!");
        console.log("└─ Vous pouvez créer une table Flowise\n");
    } else if (endpoint.includes("localhost")) {
        console.error("❌ ENDPOINT INCORRECT - Utilise encore localhost!");
        console.error("└─ Le navigateur utilise une version en CACHE\n");
        console.error("💡 SOLUTION:");
        console.error("   1. Ctrl+Shift+Delete (vider le cache)");
        console.error("   2. Cocher 'Images et fichiers en cache'");
        console.error("   3. Période: 'Toutes les périodes'");
        console.error("   4. Effacer les données");
        console.error("   5. Recharger avec Ctrl+Shift+R\n");
    } else {
        console.warn("⚠️ ENDPOINT INATTENDU");
        console.warn("└─ Vérifier le fichier Flowise.js\n");
    }
}

console.log("═══════════════════════════════════════════════════════\n");

// Test de connexion optionnel
console.log("💡 Pour tester la connexion n8n Cloud:");
console.log("   window.ClaraverseN8nV17.testN8nConnection()\n");
