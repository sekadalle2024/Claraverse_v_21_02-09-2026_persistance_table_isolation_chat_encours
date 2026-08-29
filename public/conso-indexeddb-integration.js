/**
 * Intégration conso.js avec le système IndexedDB unifié
 * Ce script remplace le système localStorage de conso.js par le système d'événements
 * qui utilise IndexedDB via menuIntegration.ts et flowiseTableService.ts
 * 
 * Ce fichier doit être chargé APRÈS conso.js et APRÈS menuIntegration
 */

(function () {
  "use strict";

  console.log("🔗 Démarrage intégration conso.js → IndexedDB");

  // Attendre que conso.js soit chargé
  function waitForConso() {
    // Vérifier que window.claraverseProcessor existe (instance créée par conso.js)
    if (window.claraverseProcessor && typeof window.claraverseProcessor.saveTableDataNow === 'function') {
      console.log("✅ claraverseProcessor détecté, début de l'intégration");
      integrateConso();
    } else {
      console.log("⏳ En attente de claraverseProcessor...");
      setTimeout(waitForConso, 100); // Vérifier plus fréquemment
    }
  }

  function integrateConso() {
    // Obtenir l'instance du processeur
    const processor = window.claraverseProcessor;
    
    if (!processor) {
      console.error("❌ Instance claraverseProcessor non trouvée");
      return;
    }

    console.log("🔧 Modification des méthodes de persistance de conso.js");

    // Sauvegarder l'ancienne méthode au cas où
    const originalSaveTableDataNow = processor.saveTableDataNow.bind(processor);
    const originalSaveAllData = processor.saveAllData ? processor.saveAllData.bind(processor) : null;

    // ========================================
    // REMPLACEMENT DES MÉTHODES DE SAUVEGARDE
    // ========================================

    /**
     * Nouvelle méthode saveTableDataNow qui utilise IndexedDB via événements
     * Remplace complètement l'ancienne méthode localStorage
     */
    processor.saveTableDataNow = function(table) {
      if (!table) {
        console.warn("⚠️ [IndexedDB] saveTableDataNow: table est null ou undefined");
        return;
      }

      console.log("💾 [IndexedDB] Début de sauvegarde immédiate");

      try {
        // Générer ou récupérer le keyword de la table
        const keyword = this.extractKeywordFromTable(table);
        console.log("🔑 Keyword extrait:", keyword);

        // Obtenir le sessionId depuis menuIntegration
        const sessionId = await this.getCurrentSessionId();
        console.log("📍 SessionId:", sessionId);

        // Émettre l'événement de sauvegarde vers menuIntegration
        const saveEvent = new CustomEvent('flowise:table:save:request', {
          detail: {
            table: table,
            sessionId: sessionId,
            keyword: keyword,
            source: 'conso' // Identifier la source comme conso.js
          },
          bubbles: true
        });

        document.dispatchEvent(saveEvent);
        console.log("✅ [IndexedDB] Événement de sauvegarde émis pour:", keyword);

        // Optionnel: écouter la confirmation de sauvegarde
        return new Promise((resolve) => {
          const successHandler = (event) => {
            if (event.detail.keyword === keyword) {
              console.log("✅ [IndexedDB] Sauvegarde confirmée pour:", keyword);
              document.removeEventListener('flowise:table:save:success', successHandler);
              resolve(true);
            }
          };

          const errorHandler = (event) => {
            console.error("❌ [IndexedDB] Erreur de sauvegarde:", event.detail.error);
            document.removeEventListener('flowise:table:save:error', errorHandler);
            resolve(false);
          };

          document.addEventListener('flowise:table:save:success', successHandler);
          document.addEventListener('flowise:table:save:error', errorHandler);

          // Timeout après 5 secondes
          setTimeout(() => {
            document.removeEventListener('flowise:table:save:success', successHandler);
            document.removeEventListener('flowise:table:save:error', errorHandler);
            resolve(true); // Considérer comme succès par défaut
          }, 5000);
        });

      } catch (error) {
        console.error("❌ [IndexedDB] Erreur lors de la sauvegarde:", error);
        return false;
      }
    };

    /**
     * Méthode helper pour extraire un keyword de la table
     */
    processor.extractKeywordFromTable = function(table) {
      // Stratégie 1: Vérifier l'attribut data-keyword
      if (table.dataset.keyword) {
        return table.dataset.keyword;
      }

      // Stratégie 2: Vérifier le data-n8n-keyword du wrapper
      const wrapper = table.closest('[data-n8n-keyword]');
      if (wrapper && wrapper.dataset.n8nKeyword) {
        return wrapper.dataset.n8nKeyword;
      }

      // Stratégie 3: Utiliser le premier en-tête de colonne
      const firstHeader = table.querySelector('th');
      if (firstHeader && firstHeader.textContent.trim()) {
        return firstHeader.textContent.trim();
      }

      // Stratégie 4: Identifier par le type de table
      const headers = this.getTableHeaders(table);
      const headerTexts = headers.map(h => h.text).join('_');
      
      // Détecter Table_conso
      if (headerTexts.includes('conclusion') || headerTexts.includes('table_conso') || 
          table.classList.contains('claraverse-conso-table')) {
        return 'Table_Consolidation';
      }
      
      // Détecter Table Résultat
      if (headerTexts.includes('resultat') || headerTexts.includes('résultat')) {
        return 'Table_Resultat';
      }

      // Stratégie 5: Utiliser le tableId comme fallback
      if (table.dataset.tableId) {
        return `Table_${table.dataset.tableId}`;
      }

      // Dernière option: générer un keyword basé sur le contenu
      return `Table_${Date.now()}`;
    };

    /**
     * Obtenir le sessionId actuel depuis menuIntegration
     */
    processor.getCurrentSessionId = async function() {
      // Stratégie 1: Utiliser flowiseTableBridge si disponible
      if (window.flowiseTableBridge && typeof window.flowiseTableBridge.getCurrentSession === 'function') {
        const sessionId = window.flowiseTableBridge.getCurrentSession();
        if (sessionId && sessionId !== 'unknown') {
          return sessionId;
        }
      }

      // Stratégie 2: Utiliser sessionStorage
      try {
        const storedSession = sessionStorage.getItem('claraverse_stable_session');
        if (storedSession) {
          return storedSession;
        }
      } catch (error) {
        console.warn('⚠️ sessionStorage non accessible:', error);
      }

      // Stratégie 3: Créer une session stable (sera réutilisée)
      const newSession = `stable_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      try {
        sessionStorage.setItem('claraverse_stable_session', newSession);
      } catch (error) {
        console.warn('⚠️ Impossible de sauvegarder la session');
      }

      return newSession;
    };

    /**
     * DÉSACTIVER les anciennes méthodes localStorage
     * On les garde pour compatibilité mais elles ne font rien
     */
    const originalLoadAllData = processor.loadAllData;
    processor.loadAllData = function() {
      console.log("ℹ️ [Deprecated] loadAllData ignoré (utilise IndexedDB maintenant)");
      return {}; // Retourner un objet vide
    };

    const originalSaveAllData = processor.saveAllData;
    processor.saveAllData = function(data) {
      console.log("ℹ️ [Deprecated] saveAllData ignoré (utilise IndexedDB maintenant)");
      // Ne rien faire
    };

    /**
     * Restauration depuis IndexedDB
     * Cette fonction sera appelée automatiquement par le système de restauration
     */
    processor.restoreAllTablesData = async function() {
      console.log("📂 [IndexedDB] Restauration de toutes les tables...");
      console.log("ℹ️ La restauration est gérée automatiquement par flowiseTableBridge");
      console.log("ℹ️ Les tables seront restaurées depuis IndexedDB au chargement de la page");
      
      // Le système IndexedDB restaure automatiquement les tables
      // On n'a pas besoin de faire quoi que ce soit ici
      // Les tables seront restaurées par:
      // 1. flowiseTableBridge.initializeRestoration() au chargement
      // 2. auto-restore-chat-change.js lors du changement de chat
      
      // Optionnel: afficher une notification
      setTimeout(() => {
        const notification = document.createElement("div");
        notification.textContent = `ℹ️ Les tables seront restaurées automatiquement depuis IndexedDB`;
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #17a2b8;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.transition = "opacity 0.5s";
          notification.style.opacity = "0";
          setTimeout(() => notification.remove(), 500);
        }, 3000);
      }, 1000);
    };

    /**
     * MIGRATION: Migrer les données localStorage vers IndexedDB
     * Cette fonction s'exécute une seule fois pour migrer les anciennes données
     */
    processor.migrateLocalStorageToIndexedDB = async function() {
      console.log("🔄 Vérification migration localStorage → IndexedDB");

      try {
        // Vérifier s'il y a des données dans localStorage
        const localData = localStorage.getItem('claraverse_tables_data');
        
        if (!localData) {
          console.log("ℹ️ Aucune donnée localStorage à migrer");
          return;
        }

        const parsedData = JSON.parse(localData);
        const tableIds = Object.keys(parsedData);

        if (tableIds.length === 0) {
          console.log("ℹ️ Aucune table à migrer");
          return;
        }

        console.log(`🔄 Migration de ${tableIds.length} table(s) depuis localStorage vers IndexedDB...`);

        const sessionId = await this.getCurrentSessionId();
        let migratedCount = 0;

        // Migrer chaque table
        for (const tableId of tableIds) {
          const tableData = parsedData[tableId];
          
          // Trouver la table dans le DOM
          const table = document.querySelector(`[data-table-id="${tableId}"]`);
          
          if (table) {
            try {
              await this.saveTableDataNow(table);
              migratedCount++;
              console.log(`✅ Table ${tableId} migrée`);
            } catch (error) {
              console.error(`❌ Erreur migration table ${tableId}:`, error);
            }
          } else {
            console.warn(`⚠️ Table ${tableId} non trouvée dans le DOM`);
          }
        }

        console.log(`✅ Migration terminée: ${migratedCount}/${tableIds.length} table(s) migrée(s)`);

        // Marquer la migration comme effectuée
        if (migratedCount > 0) {
          localStorage.setItem('claraverse_migration_done', 'true');
          // Optionnel: supprimer les anciennes données après migration réussie
          // localStorage.removeItem('claraverse_tables_data');
          console.log("✅ Migration marquée comme effectuée");
        }

      } catch (error) {
        console.error("❌ Erreur lors de la migration:", error);
      }
    };

    // ========================================
    // SAUVEGARDER LES TABLES DE CONSOLIDATION
    // ========================================

    /**
     * Sauvegarder la table de consolidation (Table_conso)
     */
    processor.saveConsolidationData = async function(table, fullContent, simpleContent) {
      if (!table) {
        console.warn("⚠️ saveConsolidationData: table est null");
        return;
      }

      console.log("💾 [IndexedDB] Début sauvegarde consolidation");

      try {
        // Trouver ou créer la table de consolidation
        let consoTable = document.querySelector('.claraverse-conso-table');
        
        // Si la table de consolidation existe, la sauvegarder
        if (consoTable) {
          await this.saveTableDataNow(consoTable);
          console.log("✅ [IndexedDB] Table de consolidation sauvegardée");
        } else {
          console.warn("⚠️ Table de consolidation non trouvée");
        }

        // Sauvegarder aussi la table résultat
        let resultatTable = document.querySelector('.claraverse-resultat-table');
        if (resultatTable) {
          await this.saveTableDataNow(resultatTable);
          console.log("✅ [IndexedDB] Table résultat sauvegardée");
        }

      } catch (error) {
        console.error("❌ [IndexedDB] Erreur sauvegarde consolidation:", error);
      }
    };

    // ========================================
    // HOOK DANS LES MÉTHODES EXISTANTES
    // ========================================

    /**
     * Hook dans updateConsoTable pour sauvegarder automatiquement
     */
    const originalUpdateConsoTable = processor.updateConsoTable;
    processor.updateConsoTable = function(sourceTable, content) {
      // Appeler la méthode originale
      const result = originalUpdateConsoTable.call(this, sourceTable, content);
      
      // Sauvegarder la table de consolidation après mise à jour
      setTimeout(() => {
        const consoTable = document.querySelector('.claraverse-conso-table');
        if (consoTable) {
          console.log("💾 [Auto] Sauvegarde table consolidation après mise à jour");
          this.saveTableDataNow(consoTable);
        }
      }, 500);
      
      return result;
    };

    /**
     * Hook dans updateResultatTable pour sauvegarder automatiquement
     */
    const originalUpdateResultatTable = processor.updateResultatTable;
    processor.updateResultatTable = function(sourceTable, content) {
      // Appeler la méthode originale
      const result = originalUpdateResultatTable.call(this, sourceTable, content);
      
      // Sauvegarder la table résultat après mise à jour
      setTimeout(() => {
        const resultatTable = document.querySelector('.claraverse-resultat-table');
        if (resultatTable) {
          console.log("💾 [Auto] Sauvegarde table résultat après mise à jour");
          this.saveTableDataNow(resultatTable);
        }
      }, 500);
      
      return result;
    };

    // ========================================
    // INITIALISATION
    // ========================================

    console.log("✅ Intégration conso.js → IndexedDB terminée");

    // Exécuter la migration si nécessaire
    const migrationDone = localStorage.getItem('claraverse_migration_done');
    if (!migrationDone) {
      console.log("🔄 Première exécution, lancement de la migration...");
      setTimeout(() => {
        processor.migrateLocalStorageToIndexedDB();
      }, 2000);
    } else {
      console.log("✅ Migration déjà effectuée");
    }

    // Exposer l'API pour le debugging
    window.consoIndexedDBIntegration = {
      version: '1.0.0',
      saveTable: (table) => processor.saveTableDataNow(table),
      getCurrentSession: () => processor.getCurrentSessionId(),
      extractKeyword: (table) => processor.extractKeywordFromTable(table),
      migrate: () => processor.migrateLocalStorageToIndexedDB(),
      quickTest: async () => {
        console.log("\n🚀 TEST RAPIDE - Intégration IndexedDB");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // 1. Vérifier l'intégration
        if (!window.claraverseProcessor) {
          console.error("❌ claraverseProcessor non trouvé");
          return;
        }
        console.log("✅ Intégration chargée");
        
        // 2. Vérifier sessionId
        try {
          const sessionId = await processor.getCurrentSessionId();
          console.log("✅ SessionId:", sessionId.substring(0, 50) + "...");
        } catch (e) {
          console.error("❌ Erreur sessionId:", e);
        }
        
        // 3. Chercher les tables
        const allTables = document.querySelectorAll('table');
        console.log(`✅ ${allTables.length} table(s) détectée(s)`);
        
        // 4. Chercher spécifiquement Table_conso et Résultat
        const consoTable = document.querySelector('.claraverse-conso-table');
        const resultatTable = document.querySelector('.claraverse-resultat-table');
        
        if (consoTable) {
          const keyword = processor.extractKeywordFromTable(consoTable);
          console.log("✅ Table_conso trouvée, keyword:", keyword);
        } else {
          console.warn("⚠️ Table_conso non trouvée (générez-la d'abord)");
        }
        
        if (resultatTable) {
          const keyword = processor.extractKeywordFromTable(resultatTable);
          console.log("✅ Table_Résultat trouvée, keyword:", keyword);
        } else {
          console.warn("⚠️ Table_Résultat non trouvée (générez-la d'abord)");
        }
        
        // 5. Vérifier les services
        if (window.flowiseTableBridge) {
          console.log("✅ flowiseTableBridge disponible");
        } else {
          console.warn("⚠️ flowiseTableBridge non disponible");
        }
        
        if (window.flowiseTableService) {
          console.log("✅ flowiseTableService disponible");
        } else {
          console.warn("⚠️ flowiseTableService non disponible");
        }
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ Test rapide terminé");
        console.log("\n💡 Pour tester la sauvegarde:");
        console.log("   1. Modifier une table (cliquer sur cellule)");
        console.log("   2. Observer les logs '💾 [IndexedDB]'");
        console.log("   3. F5 pour actualiser");
        console.log("   4. Vérifier que la table est restaurée\n");
      },
      test: async () => {
        console.log("\n🧪 TEST COMPLET - Intégration IndexedDB");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // 1. Vérifier sessionId
        const sessionId = await processor.getCurrentSessionId();
        console.log("✅ SessionId:", sessionId);
        
        // 2. Trouver une table
        const tables = document.querySelectorAll('table');
        if (tables.length > 0) {
          const table = tables[0];
          const keyword = processor.extractKeywordFromTable(table);
          console.log("✅ Keyword extrait:", keyword);
          
          // 3. Tester la sauvegarde
          console.log("💾 Test de sauvegarde...");
          await processor.saveTableDataNow(table);
          console.log("✅ Test de sauvegarde terminé");
        } else {
          console.log("⚠️ Aucune table trouvée pour tester");
        }
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }
    };

    console.log("✅ API de debugging exposée: window.consoIndexedDBIntegration");
    console.log("💡 TEST RAPIDE: consoIndexedDBIntegration.quickTest()");
    console.log("💡 TEST COMPLET: consoIndexedDBIntegration.test()");
  }

  // Démarrer l'attente
  waitForConso();

  console.log("✅ Script d'intégration conso-indexeddb chargé");
})();
