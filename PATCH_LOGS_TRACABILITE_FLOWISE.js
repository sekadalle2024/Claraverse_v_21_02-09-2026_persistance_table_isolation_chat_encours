/**
 * PATCH: Ajout de logs de traçabilité détaillés pour Flowise.js
 * À ajouter au début de la fonction queryN8nEndpoint
 */

// ═══════════════════════════════════════════════════════════════
// REMPLACER LA FONCTION queryN8nEndpoint PAR CELLE-CI:
// ═══════════════════════════════════════════════════════════════

async function queryN8nEndpoint(tablesHTML, targetKeyword) {
    // ═══════════════════════════════════════════════════════════════
    // LOGS DE TRAÇABILITÉ - DÉBUT
    // ═══════════════════════════════════════════════════════════════
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("🚀 DÉBUT DE L'APPEL N8N");
    console.log("═══════════════════════════════════════════════════════");

    console.log("\n📋 ÉTAPE 1: PRÉPARATION");
    console.log("├─ Endpoint:", CONFIG.N8N_ENDPOINT_URL);
    console.log("├─ Méthode: POST");
    console.log("├─ Content-Type: application/json");
    console.log("├─ Mot-clé cible:", targetKeyword);
    console.log("└─ Données à envoyer:", tablesHTML.substring(0, 100) + "...");
    console.log("└─ Taille payload:", tablesHTML.length, "caractères");

    try {
        const cacheKey = generateCacheKey(tablesHTML);
        const cachedData = loadFromCache(cacheKey);

        if (cachedData) {
            console.log("\n📦 CACHE HIT - Utilisation des données en cache");
            console.log("├─ Clé:", cacheKey);
            console.log("├─ Timestamp:", new Date(cachedData.timestamp).toISOString());
            console.log("└─ Mot-clé:", cachedData.targetKeyword);
            return cachedData.data;
        }

        console.log("\n📡 ÉTAPE 2: ENVOI DE LA REQUÊTE");
        const startTime = Date.now();
        console.log("└─ Timestamp:", new Date().toISOString());

        const payload = { question: tablesHTML };
        console.log("\n📦 Payload:");
        console.log("├─ Type: Object");
        console.log("├─ Clé: 'question'");
        console.log("├─ Valeur (aperçu):", tablesHTML.substring(0, 200) + "...");
        console.log("└─ Taille JSON:", JSON.stringify(payload).length, "caractères");

        const response = await fetch(CONFIG.N8N_ENDPOINT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        const elapsed = Date.now() - startTime;

        console.log("\n📥 ÉTAPE 3: RÉCEPTION DE LA RÉPONSE");
        console.log("├─ Statut HTTP:", response.status, response.statusText);
        console.log("├─ Durée:", elapsed + "ms");
        console.log("└─ Headers reçus:");

        const headers = Object.fromEntries(response.headers.entries());
        for (const [key, value] of Object.entries(headers)) {
            console.log(`   ├─ ${key}: ${value}`);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("\n❌ ERREUR HTTP");
            console.error("├─ Status:", response.status);
            console.error("├─ Status Text:", response.statusText);
            console.error("└─ Body:", errorText);
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        console.log("\n📄 ÉTAPE 4: LECTURE DU BODY");
        const contentLength = response.headers.get('content-length');
        console.log("├─ Content-Length:", contentLength);

        const responseText = await response.text();
        console.log("├─ Taille reçue:", responseText.length, "caractères");
        console.log("├─ Est vide?", responseText.length === 0 ? "❌ OUI (PROBLÈME!)" : "✅ NON");

        if (!responseText || responseText.trim() === '') {
            console.error("\n❌ RÉPONSE VIDE DE N8N");
            console.error("└─ ⚠️ RÉPONSE VIDE - Vérifiez le node 'Respond to Webhook' dans n8n");

            return {
                output: "⚠️ Réponse vide de n8n. Vérifier la configuration du workflow.",
                status: "empty_response",
                timestamp: new Date().toISOString(),
                error: "response body is empty"
            };
        }

        console.log("\n🔍 ÉTAPE 5: PARSING JSON");
        console.log("├─ Aperçu (200 premiers caractères):");
        console.log("│  ", responseText.substring(0, 200));

        let responseData;
        try {
            responseData = JSON.parse(responseText);
            console.log("└─ ✅ JSON parsé avec succès");
        } catch (parseError) {
            console.error("\n❌ ERREUR PARSING JSON");
            console.error("├─ Erreur:", parseError.message);
            console.error("├─ Contenu reçu (500 premiers caractères):");
            console.error("│  ", responseText.substring(0, 500));
            console.error("└─ ⚠️ Impossible de parser - réponse invalide");
            throw new Error(`Impossible de parser la réponse JSON: ${parseError.message}`);
        }

        console.log("\n📊 ÉTAPE 6: ANALYSE DE LA STRUCTURE");
        console.log("├─ Type:", Array.isArray(responseData) ? "Array" : typeof responseData);
        if (Array.isArray(responseData)) {
            console.log("├─ Longueur:", responseData.length);
            if (responseData.length > 0) {
                console.log("├─ Premier élément:");
                console.log("│  ├─ Type:", typeof responseData[0]);
                console.log("│  └─ Clés:", Object.keys(responseData[0] || {}).join(", "));
            }
        } else if (typeof responseData === 'object') {
            console.log("├─ Clés:", Object.keys(responseData).join(", "));
        }
        console.log("└─ Aperçu:", JSON.stringify(responseData, null, 2).substring(0, 300) + "...");

        console.log("\n💾 ÉTAPE 7: SAUVEGARDE EN CACHE");
        saveToCache(cacheKey, responseData, targetKeyword);
        console.log("└─ ✅ Données sauvegardées");

        console.log("\n📊 RÉSUMÉ");
        console.log("├─ HTTP OK?", response.status === 200 ? "✅ OUI" : "❌ NON");
        console.log("├─ Données reçues?", responseText.length > 0 ? "✅ OUI" : "❌ NON");
        console.log("├─ JSON valide?", responseData ? "✅ OUI" : "❌ NON");
        console.log("└─ Durée totale:", elapsed + "ms");

        console.log("\n═══════════════════════════════════════════════════════");
        console.log("🏁 FIN DE L'APPEL N8N");
        console.log("═══════════════════════════════════════════════════════\n");

        return responseData;

    } catch (error) {
        console.error("\n❌ ERREUR LORS DE L'APPEL À L'API N8N");
        console.error("├─ Type:", error.name);
        console.error("├─ Message:", error.message);
        console.error("└─ Stack:", error.stack);

        console.log("\n═══════════════════════════════════════════════════════");
        console.log("🏁 FIN DE L'APPEL N8N (AVEC ERREUR)");
        console.log("═══════════════════════════════════════════════════════\n");

        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// AJOUTER AUSSI CES LOGS AU DÉBUT DU MutationObserver
// ═══════════════════════════════════════════════════════════════

// Dans la fonction qui initialise le MutationObserver, ajouter:
console.log("\n═══════════════════════════════════════════════════════");
console.log("👀 MUTATIONOBSERVER ACTIVÉ");
console.log("═══════════════════════════════════════════════════════");
console.log("├─ Cible: document.body");
console.log("├─ Options: { childList: true, subtree: true }");
console.log("└─ En attente de nouvelles tables...\n");

// Dans le callback du MutationObserver, au début:
console.log("\n🔔 MUTATION DÉTECTÉE");
console.log("├─ Nombre de mutations:", mutations.length);
console.log("└─ Analyse en cours...");

// Quand une table est détectée:
console.log("\n📋 NOUVELLE TABLE DÉTECTÉE");
console.log("├─ Sélecteur:", CONFIG.SELECTORS.CHAT_TABLES);
console.log("├─ En-têtes:", headers.join(", "));
console.log("└─ Vérification si table Flowise...");

// Si c'est une table Flowise:
console.log("\n✅ TABLE FLOWISE TROUVÉE!");
console.log("├─ Mot-clé extrait:", keyword);
console.log("└─ Démarrage de la collecte...");

// ═══════════════════════════════════════════════════════════════
// LOGS POUR LA FONCTION collectCriteriaTables
// ═══════════════════════════════════════════════════════════════

// Au début de collectCriteriaTables, remplacer les logs existants par:
console.log("\n═══════════════════════════════════════════════════════");
console.log("📦 DÉBUT DE LA COLLECTE DES TABLES");
console.log("═══════════════════════════════════════════════════════");
console.log("├─ Mot-clé recherché:", dynamicKeyword);
console.log("├─ Table trigger:", triggerTable ? "✅ Présente" : "❌ Absente");
console.log("├─ User message:", userMessageTableHTML ? "✅ Présent" : "❌ Absent");
console.log("└─ Timestamp:", new Date().toISOString());

// À la fin de collectCriteriaTables:
console.log("\n═══════════════════════════════════════════════════════");
console.log("✅ FIN DE LA COLLECTE DES TABLES");
console.log("═══════════════════════════════════════════════════════");
console.log("├─ Tables collectées:", totalTableCount);
console.log("├─ Taille totale:", totalSize, "caractères");
console.log("└─ Prêt pour envoi à n8n\n");
