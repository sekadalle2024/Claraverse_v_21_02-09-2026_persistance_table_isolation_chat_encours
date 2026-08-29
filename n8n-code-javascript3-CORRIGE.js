// ========================================
// NODE CODE - PRÉPARATION FINALE POUR WEBHOOK RESPONSE
// VERSION CORRIGÉE - Retourne directement les données
// À placer JUSTE AVANT "Respond to Webhook14"
// ========================================

try {
    console.log("=== PRÉPARATION RÉPONSE WEBHOOK (VERSION CORRIGÉE) ===");

    // 1. RÉCUPÉRATION DES DONNÉES
    const items = $input.all();

    if (!items || items.length === 0) {
        throw new Error("Aucune donnée reçue");
    }

    const inputData = items[0].json;
    console.log("Données d'entrée:", JSON.stringify(Object.keys(inputData)));

    // 2. EXTRACTION DU CONTENU MARKDOWN
    let markdownContent = "";

    // Priorité 1: Champ 'output'
    if (inputData.output && typeof inputData.output === 'string') {
        markdownContent = inputData.output;
    }
    // Priorité 2: Champ 'markdown'
    else if (inputData.markdown && typeof inputData.markdown === 'string') {
        markdownContent = inputData.markdown;
    }
    // Priorité 3: Tout le contenu en JSON
    else if (inputData.data) {
        markdownContent = JSON.stringify(inputData.data, null, 2);
    }
    else {
        markdownContent = JSON.stringify(inputData, null, 2);
    }

    // 3. VÉRIFICATION
    if (!markdownContent || markdownContent.trim() === '' || markdownContent === '{}') {
        markdownContent = "⚠️ Aucun contenu généré";
    }

    console.log(`✅ Contenu préparé: ${markdownContent.length} caractères`);

    // 4. RETOUR DIRECT DES DONNÉES
    // Le node "Respond to Webhook" va automatiquement envoyer tout ce qui est dans "json"
    return [{
        json: {
            output: markdownContent,
            status: "success",
            tables_found: inputData.tableCount || inputData.tables_found || 0,
            timestamp: new Date().toISOString()
        }
    }];

} catch (error) {
    console.error("❌ Erreur préparation webhook:", error);

    // Format d'erreur simple
    return [{
        json: {
            output: `# ⚠️ Erreur\n\n${error.message}`,
            status: "error",
            timestamp: new Date().toISOString()
        }
    }];
}
