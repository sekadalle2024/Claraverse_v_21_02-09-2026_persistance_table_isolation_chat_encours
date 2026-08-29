/**
 * PATCH FINAL - Persistance Tables Conso et Résultat
 * 
 * Ce fichier contient les modifications à apporter à conso.js
 * pour rendre les tables [Table_conso] et [Resultat] persistantes
 */

// ============================================
// MODIFICATION 1 : updateResultatTable
// ============================================
// Ajouter à la fin de chaque cas de succès dans updateResultatTable

// Dans Stratégie 1 (ligne ~1300) - Après contentCell.setAttribute("data-updated", "resultat");
if (!sibling.dataset.tableId) {
    const sourceTableId = this.generateUniqueTableId(table);
    const resultatTableId = `resultat_${sourceTableId}`;
    sibling.dataset.tableId = resultatTableId;
    sibling.dataset.tableType = "resultat";
    sibling.dataset.sourceTableId = sourceTableId;
    debug.log(`🆔 ID assigné à table Résultat: ${resultatTableId}`);
}
this.setupTableChangeDetection(sibling);
setTimeout(() => {
    this.saveTableData(sibling);
    debug.log(`💾 Table Résultat sauvegardée (stratégie 1)`);
}, 300);

// Dans Stratégie 2 (ligne ~1340) - Après contentCell.setAttribute("data-updated", "resultat");
if (!potentialTable.dataset.tableId) {
    const sourceTableId = this.generateUniqueTableId(table);
    const resultatTableId = `resultat_${sourceTableId}`;
    potentialTable.dataset.tableId = resultatTableId;
    potentialTable.dataset.tableType = "resultat";
    potentialTable.dataset.sourceTableId = sourceTableId;
    debug.log(`🆔 ID assigné à table Résultat: ${resultatTableId}`);
}
this.setupTableChangeDetection(potentialTable);
setTimeout(() => {
    this.saveTableData(potentialTable);
    debug.log(`💾 Table Résultat sauvegardée (stratégie 2)`);
}, 300);

// ============================================
// MODIFICATION 2 : generateUniqueTableId
// ============================================
// Remplacer la méthode generateUniqueTableId (ligne ~1400)

generateUniqueTableId(table) {
    // Vérifier si la table a déjà un ID
    if (table.dataset.tableId) {
        return table.dataset.tableId;
    }

    // ✅ AMÉLIORATION : Générer un ID basé sur le contenu et la structure
    try {
        // Extraire les en-têtes pour créer une signature
        const headers = Array.from(table.querySelectorAll('th'))
            .map(th => th.textContent.trim())
            .filter(text => text.length > 0)
            .slice(0, 3) // Limiter à 3 en-têtes
            .join('_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .substring(0, 30);

        // Compter les lignes et colonnes
        const rows = table.querySelectorAll('tr').length;
        const cols = table.querySelector('tr')?.querySelectorAll('td, th').length || 0;

        // Obtenir la position dans le DOM
        const allTables = Array.from(document.querySelectorAll('table'));
        const position = allTables.indexOf(table);

        // Créer un ID stable
        const stableId = `table_${headers}_${rows}x${cols}_pos${position}`;

        // Sauvegarder l'ID sur la table
        table.dataset.tableId = stableId;

        debug.log(`🆔 ID stable généré: ${stableId}`);
        return stableId;

    } catch (error) {
        debug.error("❌ Erreur génération ID:", error);

        // Fallback : ID basé sur timestamp
        const fallbackId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        table.dataset.tableId = fallbackId;
        return fallbackId;
    }
}

// ============================================
// MODIFICATION 3 : Ajouter restoreGeneratedTables
// ============================================
// Ajouter cette nouvelle méthode après restoreAllTablesData (ligne ~1680)

/**
 * ✅ NOUVELLE MÉTHODE : Restaurer les tables générées (conso et résultat)
 */
async restoreGeneratedTables() {
    debug.log("🔄 Restauration des tables générées (conso et résultat)");

    try {
        // Attendre que l'API soit disponible
        if (!window.claraverseSyncAPI) {
            debug.warn("⚠️ API de synchronisation non disponible");
            return;
        }

        // Récupérer toutes les tables sauvegardées
        const sessionId = await this.getCurrentSessionId();

        // Déclencher un événement spécifique pour les tables générées
        const event = new CustomEvent('flowise:generated:tables:restore', {
            detail: {
                sessionId: sessionId,
                tableTypes: ['consolidation', 'resultat'],
                source: 'conso'
            }
        });

        document.dispatchEvent(event);
        debug.log("✅ Restauration tables générées demandée");

    } catch (error) {
        debug.error("❌ Erreur restauration tables générées:", error);
    }
}

// ============================================
// MODIFICATION 4 : Modifier restoreAllTablesData
// ============================================
// Remplacer la méthode restoreAllTablesData (ligne ~1650)

async restoreAllTablesData() {
    debug.log("🔄 Début de la restauration des tables");

    try {
        // Obtenir la session actuelle
        const sessionId = await this.getCurrentSessionId();
        debug.log(`📍 Session pour restauration: ${sessionId}`);

        // Déclencher la restauration via événement (système IndexedDB)
        const event = new CustomEvent('flowise:table:restore:request', {
            detail: {
                sessionId: sessionId,
                source: 'conso',
                timestamp: Date.now(),
                // ✅ AJOUT : Indiquer qu'on veut aussi restaurer les tables générées
                includeGenerated: true,
                tableTypes: ['modelized', 'consolidation', 'resultat']
            }
        });

        document.dispatchEvent(event);
        debug.log("✅ Restauration demandée via événement IndexedDB");

        // Attendre un peu pour que la restauration se fasse
        await new Promise(resolve => setTimeout(resolve, 2000)); // Augmenté à 2s

        // ✅ AJOUT : Restaurer spécifiquement les tables générées
        await this.restoreGeneratedTables();

        // Fallback: essayer aussi avec localStorage
        this.restoreFromLocalStorage();
    } catch (error) {
        debug.error("❌ Erreur restauration:", error);
        // Fallback vers localStorage
        this.restoreFromLocalStorage();
    }
}

// ============================================
// MODIFICATION 5 : Ajouter getCurrentSessionId
// ============================================
// Ajouter cette méthode après init() (ligne ~60)

/**
 * Obtenir l'ID de session actuel (compatible avec le système IndexedDB)
 */
async getCurrentSessionId() {
    try {
        // Réutiliser la session stable du pont
        const storedSession = sessionStorage.getItem('claraverse_stable_session');
        if (storedSession) {
            debug.log(`📍 Session récupérée: ${storedSession}`);
            return storedSession;
        }
    } catch (error) {
        debug.warn('⚠️ sessionStorage lecture impossible:', error.message);
    }

    // Créer une session stable
    const sessionId = `stable_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        sessionStorage.setItem('claraverse_stable_session', sessionId);
        debug.log(`✅ Session stable créée: ${sessionId}`);
    } catch (error) {
        debug.warn('⚠️ Impossible de sauvegarder session:', error.message);
    }

    return sessionId;
}

// ============================================
// INSTRUCTIONS D'APPLICATION
// ============================================

/*
ÉTAPES POUR APPLIQUER CE PATCH :

1. Ouvrir conso.js

2. Appliquer MODIFICATION 1 (updateResultatTable) :
   - Chercher "contentCell.setAttribute("data-updated", "resultat");"
   - Ajouter le code de sauvegarde après chaque occurrence (2 fois)

3. Appliquer MODIFICATION 2 (generateUniqueTableId) :
   - Chercher la méthode generateUniqueTableId
   - Remplacer complètement par la nouvelle version

4. Appliquer MODIFICATION 3 (restoreGeneratedTables) :
   - Chercher restoreAllTablesData
   - Ajouter la nouvelle méthode juste après

5. Appliquer MODIFICATION 4 (restoreAllTablesData) :
   - Remplacer la méthode existante par la nouvelle version

6. Appliquer MODIFICATION 5 (getCurrentSessionId) :
   - Chercher la méthode init()
   - Ajouter getCurrentSessionId juste après

7. Tester :
   - Ouvrir un chat avec une table modelisée
   - Modifier une cellule pour déclencher la consolidation
   - Vérifier que les tables conso et résultat sont créées
   - F5 pour recharger
   - Vérifier que les tables sont restaurées avec leur contenu

LOGS ATTENDUS :

Au chargement :
🚀 Claraverse Table Script - Démarrage
📋 [Claraverse] Initialisation du processeur de tables
✅ [Claraverse] localStorage fonctionne correctement
🔄 [Claraverse] Début de la restauration des tables
📍 [Claraverse] Session pour restauration: stable_session_xxx
✅ [Claraverse] Restauration demandée via événement IndexedDB
🔄 [Claraverse] Restauration des tables générées (conso et résultat)
✅ [Claraverse] Restauration tables générées demandée

Après consolidation :
🆔 [Claraverse] ID stable généré: table_xxx
🆔 [Claraverse] ID assigné à table Résultat: resultat_xxx
💾 [Claraverse] Table Résultat sauvegardée (stratégie 1)
💾 [Claraverse] Table Conso sauvegardée après mise à jour

*/
