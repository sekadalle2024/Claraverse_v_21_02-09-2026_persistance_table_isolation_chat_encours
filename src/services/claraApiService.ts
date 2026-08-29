/**
 * Clara Assistant API Service
 *
 * Main orchestrator service that coordinates between specialized services
 * for provider management, tools, agents, chat, and attachments.
 */

import type { ChatMessage } from "../utils/APIClient";
import {
  ClaraMessage,
  ClaraFileAttachment,
  ClaraProvider,
  ClaraModel,
  ClaraAIConfig,
} from "../types/clara_assistant_types";
import { TokenLimitRecoveryService } from "./tokenLimitRecoveryService";
import { addInfoNotification } from "./toastNotificationService";

// Import specialized services
import { claraProviderService } from "./claraProviderService";
import { claraToolService } from "./claraToolService";
import { claraAgentService } from "./claraAgentService";
import { claraChatService } from "./claraChatService";
import { claraModelService } from "./claraModelService";
import { claraAttachmentService } from "./claraAttachmentService";
import { claraPapierTravailService } from "./claraPapierTravailService";

export class ClaraApiService {
  private recoveryService: TokenLimitRecoveryService;
  private stopExecution: boolean = false;

  // ── n8n endpoint par défaut (router switch-case) ─────────────────────────
  // L'endpoint effectif est résolu dynamiquement dans getN8nEndpoint()
  private readonly n8nDefaultEndpoint =
    "https://n8nsqlite.zeabur.app/webhook/template";

  // Sentinelles internes retournées par le router pour les cas sans appel HTTP
  private readonly SENTINEL_DATABASE = "__INTERNAL__DATABASE__";
  private readonly SENTINEL_NOTIFICATION = "__INTERNAL__NOTIFICATION__";
  private readonly SENTINEL_LEAD_BALANCE = "__INTERNAL__LEAD_BALANCE__";
  private readonly SENTINEL_ETAT_FIN = "__INTERNAL__ETAT_FIN__";
  private readonly SENTINEL_TEMPLATE_TABLE = "__INTERNAL__TEMPLATE_TABLE__";
  private readonly SENTINEL_EDITEUR = "__INTERNAL__EDITEUR__";
  private readonly SENTINEL_DATA_ANALYST = "__INTERNAL__DATA_ANALYST__";

  /**
   * Router n8n – Switch-case JavaScript avec informations de routing
   * 
   * Retourne un objet contenant:
   * - endpoint: L'URL de l'endpoint n8n ou une sentinelle interne
   * - caseName: Le nom du case (ex: "Case 1", "Case 2", etc.)
   * - routeKey: La clé de route utilisée (ex: "default", "design", etc.)
   */
  private getN8nEndpointWithInfo(userMessage: string): {
    endpoint: string;
    caseName: string;
    routeKey: string;
  } {
    const msg = userMessage;
    let routeKey: string;
    let caseName: string;

    // ═══════════════════════════════════════════════════════════════════════
    // PRIORITÉ 1: CASES SPÉCIFIQUES (Cases 2-33)
    // Ces cases ont la priorité absolue sur les cases par défaut
    // ═══════════════════════════════════════════════════════════════════════
    
    // Cases 11-13: CIA (Cours, QCM, Synthèse)
    if ((msg.includes("CIA") || msg.includes("cia") || msg.includes("Cia")) &&
      (msg.includes("Cours") || msg.includes("COURS") || msg.includes("cours"))) {
      routeKey = "cia_cours";
      caseName = "Case 11";
    } else if ((msg.includes("CIA") || msg.includes("cia") || msg.includes("Cia")) &&
      (msg.includes("Qcm") || msg.includes("QCM") || msg.includes("Question"))) {
      routeKey = "cia_qcm";
      caseName = "Case 12";
    } else if ((msg.includes("CIA") || msg.includes("cia") || msg.includes("Cia")) &&
      (msg.includes("Synthèse") || msg.includes("Synthese") || msg.includes("synthèse") || msg.includes("synthese"))) {
      routeKey = "cia_synthese";
      caseName = "Case 13";
    }
    
    // Cases 28-34: Méthodologies et Guides
    else if (msg.includes("Methodo audit") || msg.includes("Methodologie audit")) {
      routeKey = "methodo_audit";
      caseName = "Case 28";
    } else if (msg.includes("Methodo revision") || msg.includes("Methodologie revision")) {
      routeKey = "methodo_revision";
      caseName = "Case 33";
    } else if (msg.includes("Guide des commandes") || msg.includes("guide des commandes")) {
      routeKey = "guide_des_commandes";
      caseName = "Case 29";
    } else if (msg.includes("Guide intelligent") || msg.includes("guide intelligent")) {
      routeKey = "guide_intelligent";
      caseName = "Case 30";
    } else if (msg.includes("Guide menu contextuel")) {
      routeKey = "guide_menu_contextuel";
      caseName = "Case 31";
    } else if (msg.includes("Guide produit")) {
      routeKey = "guide_produit";
      caseName = "Case 32";
    }
    // Case 34: Heatmap risque
    else if (msg.includes("Heatmap") || msg.includes("heatmap")) {
      routeKey = "heatmap_risque";
      caseName = "Case 34";
    }
    
    // Cases 25-27: Recommandations et Rapports
    else if (msg.includes("Recos contrôle interne comptable")) {
      routeKey = "recos_controle_interne";
      caseName = "Case 25";
    } else if (msg.includes("Recos revision des comptes")) {
      routeKey = "recos_revision_comptes";
      caseName = "Case 26";
    } else if (msg.includes("Recos_revision")) {
      routeKey = "recos_revision";
      caseName = "Case 23";
    } else if (msg.includes("Rapport de synthèse CAC")) {
      routeKey = "rapport_synthese_cac";
      caseName = "Case 27";
    }
    
    // Cases 16-22: Implémentation et Programmes
    else if (msg.includes("Implementation_modelisation")) {
      routeKey = "implementation_modelisation";
      caseName = "Case 16";
    } else if (msg.includes("Implementation_programme_controle")) {
      routeKey = "implementation_programme_controle";
      caseName = "Case 17";
    } else if (msg.includes("Implementation_cartographie")) {
      routeKey = "implementation_cartographie";
      caseName = "Case 18";
    } else if (msg.includes("Programme_controle_comptes")) {
      routeKey = "programme_controle_comptes";
      caseName = "Case 19";
    } else if (msg.includes("Revue manager")) {
      routeKey = "revue_manager";
      caseName = "Case 20";
    } else if (msg.includes("Lead_balance")) {
      routeKey = "lead_balance";
      caseName = "Case 21";
    } else if (msg.includes("Règles et méthodes comptables")) {
      routeKey = "regles_comptables";
      caseName = "Case 22";
    } else if (msg.includes("Etat fin")) {
      routeKey = "etat_fin";
      caseName = "Case 24";
    }
    
    // Case 44: Editeur (Test de switch backend)
    else if (msg.includes("Editeur") || msg.includes("editeur")) {
      routeKey = "editeur";
      caseName = "Case 44";
    }
    
    // Case 45: Leadsheet
    else if (msg.includes("Leadsheet")) {
      routeKey = "leadsheet";
      caseName = "Case 45";
    }
    
    // Case 46: Revue analytique
    else if (msg.includes("Revue analytique")) {
      routeKey = "revue_analytique";
      caseName = "Case 46";
    }
    
    // Case 48: Plan audit
    else if (msg.includes("Plan_audit")) {
      routeKey = "plan_audit";
      caseName = "Case 48";
    }
    
    // Case 49: Programme de travail
    else if (msg.includes("Programme de travail") || msg.includes("/Programme de travail") || msg.includes("programme de travail")) {
      routeKey = "programme_travail";
      caseName = "Case 49";
    }
    
    // Case 50: Data analyst (Échantillonnage Audit - Toutes méthodes)
    else if (
      msg.includes("Data analyst") || msg.includes("Data Analyst")
    ) {
      routeKey = "data_analyst_aleatoire_simple";
      caseName = "Case 50";
    }
    
    // Cases 35-43: Templates de tables (génération locale)
    else if (msg.includes("Template_table_unicolonne")) {
      routeKey = "template_table_unicolonne";
      caseName = "Case 35";
    } else if (msg.includes("Template_table_simple")) {
      routeKey = "template_table_simple";
      caseName = "Case 36";
    } else if (msg.includes("Template_table_etape_de_mission")) {
      routeKey = "template_table_etape_de_mission";
      caseName = "Case 37";
    } else if (msg.includes("Template_table_feuille_couverture_test_audit")) {
      routeKey = "template_table_feuille_couverture_test_audit";
      caseName = "Case 38";
    } else if (msg.includes("Template_table_frap")) {
      routeKey = "template_table_frap";
      caseName = "Case 39";
    } else if (msg.includes("Template_table_synthèses_frap")) {
      routeKey = "template_table_syntheses_frap";
      caseName = "Case 40";
    } else if (msg.includes("Template_table_rapport_provisoire")) {
      routeKey = "template_table_rapport_provisoire";
      caseName = "Case 41";
    } else if (msg.includes("Template_table_rapport_final")) {
      routeKey = "template_table_rapport_final";
      caseName = "Case 42";
    } else if (msg.includes("Template_table_suivi_recos")) {
      routeKey = "template_table_suivi_recos";
      caseName = "Case 43";
    }
    
    // Cases 2-10: Autres fonctionnalités spécifiques
    else if (msg.includes("Design")) {
      routeKey = "design";
      caseName = "Case 2";
    } else if (msg.includes("n8n_doc")) {
      routeKey = "n8n_doc";
      caseName = "Case 3";
    } else if (msg.includes("Htlm_processor")) {
      routeKey = "htlm_processor";
      caseName = "Case 4";
    } else if (msg.includes("Algorithme")) {
      routeKey = "algorithme";
      caseName = "Case 6";
    } else if (msg.includes("Visualisation")) {
      routeKey = "visualisation";
      caseName = "Case 7";
    } else if (msg.includes("Document")) {
      routeKey = "document";
      caseName = "Case 9";
    } else if (msg.includes("Database")) {
      routeKey = "database_endpoint";
      caseName = "Case 10";
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PRIORITÉ 2: CASES PAR DÉFAUT (Cases 1 et 8)
    // Ces cases ne s'appliquent QUE si aucune case spécifique n'a été détectée
    // ═══════════════════════════════════════════════════════════════════════
    
    // Case 8: Notification (messages sans Command/command et sans /)
    else if (
      !msg.includes("Command") &&
      !msg.includes("command") &&
      !msg.includes("/")
    ) {
      routeKey = "notification";
      caseName = "Case 8";
    } 
    // Case 1: Default (tous les autres messages)
    else {
      routeKey = "default";
      caseName = "Case 1";
    }

    // Résoudre l'endpoint basé sur la routeKey
    const endpoint = this.resolveEndpointFromRouteKey(routeKey);
    
    console.log(`🔀 Router → ${caseName} : ${routeKey}`);
    
    return {
      endpoint,
      caseName,
      routeKey
    };
  }

  /**
   * Résout l'endpoint à partir de la routeKey
   */
  private resolveEndpointFromRouteKey(routeKey: string): string {
    switch (routeKey) {
      case "design":
        return "https://n8nsqlite.zeabur.app/webhook/integration_windows";
      case "n8n_doc":
        return "https://n8nsqlite.zeabur.app/webhook/n8n_doc";
      case "htlm_processor":
        return "https://n8nsqlite.zeabur.app/webhook/htlm_processor";
      case "database_endpoint":
        return "https://n8nsqlite.zeabur.app/webhook/integration_database";
      case "cia_cours":
        return "https://n8nsqlite.zeabur.app/webhook/cia_cours_gemini";
      case "cia_qcm":
        return "https://n8nsqlite.zeabur.app/webhook/qcm_cia_gemini";
      case "cia_synthese":
        return "https://n8nsqlite.zeabur.app/webhook/synthese_cia_gemini";
      case "algorithme":
        return "https://n8nsqlite.zeabur.app/webhook/algorithme";
      case "visualisation":
        return "https://n8nsqlite.zeabur.app/webhook/visualisation";
      case "notification":
        return this.SENTINEL_NOTIFICATION;
      case "document":
        return "https://n8nsqlite.zeabur.app/webhook/integration_document";
      case "implementation_modelisation":
        return "https://n8nsqlite.zeabur.app/webhook/implementation_modelisation";
      case "implementation_programme_controle":
        return "https://n8nsqlite.zeabur.app/webhook/implementation_programme_controle";
      case "implementation_cartographie":
        return "https://n8nsqlite.zeabur.app/webhook/implementation_cartographie";
      case "programme_controle_comptes":
        return "https://n8nsqlite.zeabur.app/webhook/programme_controle_comptes";
      case "revue_manager":
        return "https://n8nsqlite.zeabur.app/webhook/revue_manager";
      case "lead_balance":
        return this.SENTINEL_LEAD_BALANCE;
      case "regles_comptables":
        return "https://n8nsqlite.zeabur.app/webhook/regles_comptables";
      case "recos_revision":
        return "https://n8nsqlite.zeabur.app/webhook/recos_revision";
      case "etat_fin":
        return this.SENTINEL_ETAT_FIN;
      case "editeur":
        return this.SENTINEL_EDITEUR;
      case "leadsheet":
        return "https://n8nsqlite.zeabur.app/webhook/leadsheet";
      case "revue_analytique":
        return "https://n8nsqlite.zeabur.app/webhook/revue_analytique";
      case "plan_audit":
        return "https://n8nsqlite.zeabur.app/webhook/plan_audit";
      case "programme_travail":
        return "https://n8nsqlite.zeabur.app/webhook/template";
      case "data_analyst_aleatoire_simple":
        return this.SENTINEL_DATA_ANALYST;
      case "recos_controle_interne":
        return "https://n8nsqlite.zeabur.app/webhook/recos_contrôle_interne_comptable";
      case "recos_revision_comptes":
        return "https://n8nsqlite.zeabur.app/webhook/recos_revision_compte";
      case "rapport_synthese_cac":
        return "https://n8nsqlite.zeabur.app/webhook/rapport_synthese_cac";
      case "methodo_audit":
        return "https://n8nsqlite.zeabur.app/webhook/methodo_audit";
      case "guide_des_commandes":
        return "https://n8nsqlite.zeabur.app/webhook/guide_des_commandes";
      case "guide_intelligent":
        return "https://n8nsqlite.zeabur.app/webhook/guide_intelligent";
      case "guide_menu_contextuel":
        return "https://n8nsqlite.zeabur.app/webhook/guide_menu_contextuel";
      case "guide_produit":
        return "https://n8nsqlite.zeabur.app/webhook/guide_produit";
      case "methodo_revision":
        return "https://n8nsqlite.zeabur.app/webhook/methodo_revision";
      case "heatmap_risque":
        return "https://n8nsqlite.zeabur.app/webhook/heatmap_risque";
      case "template_table_unicolonne":
      case "template_table_simple":
      case "template_table_etape_de_mission":
      case "template_table_feuille_couverture_test_audit":
      case "template_table_frap":
      case "template_table_syntheses_frap":
      case "template_table_rapport_provisoire":
      case "template_table_rapport_final":
      case "template_table_suivi_recos":
        return this.SENTINEL_TEMPLATE_TABLE;
      case "default":
      default:
        return this.n8nDefaultEndpoint;
    }
  }

  /**
   * Router n8n – Switch-case JavaScript (version legacy)
   *
   * Retourne l'URL de l'endpoint n8n à appeler, ou une sentinelle interne
   * quand la réponse doit être construite localement (Case 5 & Case 8).
   *
   * @deprecated Utilisez getN8nEndpointWithInfo() à la place
   */
  private getN8nEndpoint(userMessage: string): string {
    return this.getN8nEndpointWithInfo(userMessage).endpoint;
  }



  // Timeout configurable (en millisecondes)
  private n8nTimeout = 5 * 60 * 1000; // 5 minutes par défaut pour les workflows LLM

  constructor() {
    // Initialize the recovery service
    this.recoveryService = TokenLimitRecoveryService.getInstance();

    // Log pour confirmer l'initialisation
    console.log(
      "✅ ClaraApiService initialisé avec endpoint par défaut:",
      this.n8nDefaultEndpoint,
    );
    console.log("⏱️ Timeout configuré:", this.n8nTimeout / 1000, "secondes");
  }

  /**
   * Configure le timeout pour les requêtes n8n
   */
  public setN8nTimeout(timeoutMs: number): void {
    this.n8nTimeout = timeoutMs;
    console.log("⏱️ Nouveau timeout n8n:", timeoutMs / 1000, "secondes");
  }

  /**
   * Récupère le timeout actuel
   */
  public getN8nTimeout(): number {
    return this.n8nTimeout;
  }

  /**
   * Test de connexion à l'endpoint n8n
   */
  public async testN8nConnection(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log("🧪 Test de connexion à n8n...");

      // Utiliser un timeout plus court pour le test
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes pour le test

      const response = await fetch(this.n8nDefaultEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ question: "Test de connexion" }),
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log("✅ Connexion réussie, données reçues:", data);

      return {
        success: true,
        message: "Connexion réussie",
        data,
      };
    } catch (error) {
      const err = error as Error;
      console.error("❌ Erreur de test:", err);
      return {
        success: false,
        message: err.message,
      };
    }
  }

  /**
   * Détecte automatiquement le type de table basé sur son contenu
   */
  private detectTableType(
    tableKey: string,
    tableData: any,
  ): "header" | "data_array" | "download" | "unknown" {
    const lowerKey = tableKey.toLowerCase();

    // Type 1: En-tête (objet simple avec valeurs non-objets)
    if (typeof tableData === "object" && !Array.isArray(tableData)) {
      const keys = Object.keys(tableData);
      const hasSimpleValues = keys.every(
        (k) => typeof tableData[k] !== "object",
      );

      // Type 3: Téléchargement (contient des URLs ou le mot "télécharger")
      const hasDownloadKeywords =
        lowerKey.includes("telecharger") ||
        lowerKey.includes("download") ||
        keys.some((k) => k.toLowerCase().includes("telecharger"));
      const hasUrls = keys.some(
        (k) =>
          typeof tableData[k] === "string" &&
          (tableData[k].startsWith("http://") ||
            tableData[k].startsWith("https://")),
      );

      if (hasDownloadKeywords || hasUrls) {
        return "download";
      }

      // Si c'est un objet simple (valeurs non-objets), c'est un header
      // Cela inclut les tables avec 1 seule propriété (Intitule, Description, etc.)
      if (hasSimpleValues) {
        return "header";
      }
    }

    // Type 2: Tableau de données (array d'objets)
    if (Array.isArray(tableData) && tableData.length > 0) {
      return "data_array";
    }

    return "unknown";
  }

  /**
   * Génère un titre approprié pour une table de données
   * @param includeTitle - Si false, ne génère pas de titre
   */
  private generateTableTitle(
    tableKey: string,
    tableData: any[],
    includeTitle: boolean = false,
  ): string {
    if (!includeTitle) {
      return ""; // Pas de titre
    }

    const lowerKey = tableKey.toLowerCase();

    // Analyse du contenu pour deviner le type de données
    if (tableData.length > 0) {
      const firstItem = tableData[0];
      const columns = Object.keys(firstItem);

      // Détection de type "Contrôles Audit"
      const auditKeywords = [
        "controle",
        "audit",
        "risque",
        "point",
        "objectif",
      ];
      const hasAuditColumns = columns.some((col) =>
        auditKeywords.some((kw) => col.toLowerCase().includes(kw)),
      );

      if (hasAuditColumns) {
        return "📑 Programme de Travail - Contrôles Audit";
      }

      // Détection de type "Opérations/Processus"
      const processKeywords = [
        "operation",
        "acteur",
        "principale",
        "processus",
        "tache",
      ];
      const hasProcessColumns = columns.some((col) =>
        processKeywords.some((kw) => col.toLowerCase().includes(kw)),
      );

      if (hasProcessColumns) {
        return "📊 Principales Opérations";
      }

      // Détection de type "Recommandations"
      if (lowerKey.includes("reco") || lowerKey.includes("recommandation")) {
        return "💡 Recommandations";
      }

      // Détection de type "Template"
      if (lowerKey.includes("template") || lowerKey.includes("modele")) {
        return "📋 Modèle";
      }
    }

    // Fallback: utiliser le nom de la clé en le nettoyant
    return (
      "📄 " +
      tableKey
        .replace(/_/g, " ")
        .replace(/table\s*/gi, "")
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  }

  /**
   * Convertit les données structurées du nouveau format n8n en Markdown
   */
  private convertStructuredDataToMarkdown(data: any): string {
    let markdown = "";

    try {
      // 🔧 DÉTECTION PAPIER DE TRAVAIL
      // Vérifier si la réponse contient des papiers de travail (Nature de test)
      const isPapierTravail = claraPapierTravailService.detectPapierTravail(data);
      
      if (isPapierTravail) {
        console.log("📋 === PAPIER DE TRAVAIL DÉTECTÉ ===");
        return claraPapierTravailService.process(data);
      }

      // Parcourir la structure "Etape mission - Programme" ou toute clé similaire
      const etapeMissionKey =
        Object.keys(data).find(
          (key) =>
            key.toLowerCase().includes("etape") ||
            key.toLowerCase().includes("mission") ||
            key.toLowerCase().includes("programme") ||
            key.toLowerCase().includes("recos") ||
            key.toLowerCase().includes("tableau"),
        ) || Object.keys(data)[0]; // Fallback sur la première clé

      console.log(`🔍 Clé principale détectée: "${etapeMissionKey}"`);

      // 🔧 NOUVEAU FORMAT: Programme contrôle comptes avec "Tableau entete" et "Tableau processus" directement dans data
      // Détecter si data contient directement des clés "Tableau entete" et "Tableau processus"
      const hasTableauEntete = "Tableau entete" in data;
      const hasTableauProcessus = "Tableau processus" in data;
      
      if (hasTableauEntete && hasTableauProcessus) {
        console.log("🔧 FORMAT PROGRAMME CONTROLE COMPTES DÉTECTÉ: Tableau entete + Tableau processus");
        
        // Traiter "Tableau entete" comme une table header
        const tableauEntete = data["Tableau entete"];
        if (tableauEntete && typeof tableauEntete === 'object') {
          console.log("📋 Traitement de 'Tableau entete' (type: header)");
          markdown += this.convertHeaderTableToMarkdown(tableauEntete, 0);
        }
        
        // Traiter "Tableau processus" comme une table data_array SANS titre
        const tableauProcessus = data["Tableau processus"];
        if (Array.isArray(tableauProcessus)) {
          console.log(`📋 Traitement de 'Tableau processus' (type: data_array, ${tableauProcessus.length} items)`);
          // Passer une chaîne vide comme titre pour ne pas afficher de section
          markdown += this.convertArrayTableToMarkdown("", tableauProcessus);
        }
        
        return markdown;
      }

      const etapeMission = data[etapeMissionKey];
      if (!Array.isArray(etapeMission)) {
        console.warn("⚠️ Structure non-tableau trouvée, conversion générique");
        return this.convertGenericStructureToMarkdown(data);
      }

      console.log(`📊 Nombre d'éléments dans le tableau: ${etapeMission.length}`);

      // 🔧 NOUVEAU FORMAT CASE 25: Toutes les tables dans un seul objet
      // Détecter si le premier élément contient plusieurs clés "table X"
      if (etapeMission.length === 1 && typeof etapeMission[0] === 'object') {
        const firstElement = etapeMission[0];
        const keys = Object.keys(firstElement);
        
        // Vérifier si les clés sont "table 1", "table 2", etc.
        const hasTableKeys = keys.some(key => /^table\s+\d+$/i.test(key));
        
        if (hasTableKeys) {
          console.log("🔧 FORMAT CASE 25 DÉTECTÉ: Toutes les tables dans un seul objet");
          console.log(`📊 Nombre de tables trouvées: ${keys.length}`);
          
          // Trier les clés par numéro de table
          const sortedKeys = keys.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            return numA - numB;
          });
          
          // Traiter chaque table
          sortedKeys.forEach((tableKey, index) => {
            const tableData = firstElement[tableKey];
            const tableType = this.detectTableType(tableKey, tableData);

            console.log(
              `📋 Table ${index + 1}/${sortedKeys.length}: "${tableKey}" (type: ${tableType})`,
            );

            switch (tableType) {
              case "header":
                // Passer l'index pour différencier la table 1 des autres
                markdown += this.convertHeaderTableToMarkdown(tableData, index);
                break;

              case "data_array":
                const title = this.generateTableTitle(tableKey, tableData);
                markdown += this.convertArrayTableToMarkdown(title, tableData);
                break;

              case "download":
                markdown += this.convertDownloadTableToMarkdown(tableData);
                break;

              default:
                console.warn(`⚠️ Type de table non reconnu: ${tableKey}`);
                markdown += this.convertGenericStructureToMarkdown({
                  [tableKey]: tableData,
                });
            }
          });
          
          return markdown;
        }
      }

      // FORMAT ORIGINAL: Chaque table dans un objet séparé
      console.log("📊 FORMAT ORIGINAL: Chaque table dans un objet séparé");
      
      // Traiter chaque table
      etapeMission.forEach((tableObj: any, index: number) => {
        const tableKey = Object.keys(tableObj)[0];
        const tableData = tableObj[tableKey];
        const tableType = this.detectTableType(tableKey, tableData);

        console.log(
          `📋 Table ${index + 1}/${etapeMission.length}: "${tableKey}" (type: ${tableType})`,
        );

        switch (tableType) {
          case "header":
            // Passer l'index pour différencier la table 1 des autres
            markdown += this.convertHeaderTableToMarkdown(tableData, index);
            break;

          case "data_array":
            const title = this.generateTableTitle(tableKey, tableData);
            markdown += this.convertArrayTableToMarkdown(title, tableData);
            break;

          case "download":
            markdown += this.convertDownloadTableToMarkdown(tableData);
            break;

          default:
            console.warn(`⚠️ Type de table non reconnu: ${tableKey}`);
            markdown += this.convertGenericStructureToMarkdown({
              [tableKey]: tableData,
            });
        }

        // Pas de séparateur après la dernière table
        // Pas de séparateur entre les tables sauf si explicitement demandé
        // Les tables sont suffisamment espacées par leurs propres marges
      });
    } catch (error) {
      console.error("❌ Erreur lors de la conversion en Markdown:", error);
      markdown = `**Erreur de conversion**\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    }

    return markdown;
  }

  /**
   * Convertit une table d'en-tête en Markdown (sans titre de section)
   * Supporte deux formats :
   * - Format 2 colonnes (Rubrique | Description) pour la table 1
   * - Format 1 colonne pour les autres tables (Intitule, Description, Observation, etc.)
   */
  private convertHeaderTableToMarkdown(data: any, tableIndex: number = 0): string {
    const entries = Object.entries(data);
    
    console.log(`🔄 convertHeaderTableToMarkdown - Table ${tableIndex + 1}:`, {
      entriesCount: entries.length,
      keys: entries.map(([k]) => k),
    });
    
    // Table 1 (index 0) : Format 2 colonnes (Rubrique | Description)
    if (tableIndex === 0) {
      let md = "| Rubrique | Description |\n";
      md += "|----------|-------------|\n";

      entries.forEach(([key, value]) => {
        // Capitaliser la clé proprement
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
        md += `| **${formattedKey}** | ${value} |\n`;
      });

      console.log(`✅ Table 1 générée (${md.length} caractères)`);
      return md + "\n";
    }
    
    // Tables 2+ (index > 0) : Format 1 colonne avec en-tête en HTML
    // Extraire la clé et la valeur (généralement une seule paire)
    if (entries.length === 1) {
      const [key, value] = entries[0];
      
      // Formater la clé comme en-tête (première lettre majuscule)
      const headerText = key.charAt(0).toUpperCase() + key.slice(1);
      
      // Convertir la valeur en texte lisible (gérer les sauts de ligne)
      let cellValue = String(value)
        .replace(/\\n/g, '\n')  // Convertir les \n échappés en vrais sauts de ligne
        .replace(/\n/g, '\n\n') // Convertir les sauts de ligne en double saut pour le markdown
        .trim();
      
      // SOLUTION FINALE: Utiliser un tableau Markdown 1 colonne avec en-tête en gras
      // Cette approche garantit un rendu cohérent avec la table 1
      let md = `\n| **${headerText}** |\n`;
      md += `|${'-'.repeat(headerText.length + 6)}|\n`;
      md += `| ${cellValue.replace(/\n\n/g, '<br><br>')} |\n\n`;
      
      console.log(`✅ Table ${tableIndex + 1} générée (Tableau Markdown):`, {
        header: headerText,
        contentLength: cellValue.length,
        markdownLength: md.length,
        preview: md.substring(0, 150),
      });
      
      return md;
    }
    
    // Fallback : si plusieurs entrées, afficher en format 2 colonnes
    console.log(`⚠️ Table ${tableIndex + 1}: Fallback format 2 colonnes (${entries.length} entrées)`);
    let md = "| Rubrique | Description |\n";
    md += "|----------|-------------|\n";

    entries.forEach(([key, value]) => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      md += `| **${formattedKey}** | ${value} |\n`;
    });

    return md + "\n\n";
  }

  /**
   * Convertit un tableau de données en Markdown
   */
  private convertArrayTableToMarkdown(tableName: string, data: any[]): string {
    if (!data || data.length === 0) {
      return tableName ? `### ${tableName}\n\n*Aucune donnée disponible*\n\n` : "";
    }

    console.log(`🔄 Conversion de ${tableName || '(sans titre)'} avec ${data.length} lignes`);

    // Titre de la section avec emoji approprié (seulement si tableName est fourni)
    let md = tableName ? `### ${tableName}\n\n` : "";

    // Extraire les colonnes du premier élément
    const firstItem = data[0];
    const columns = Object.keys(firstItem);

    console.log(
      `📋 Colonnes détectées (${columns.length}):`,
      columns.join(", "),
    );

    // Préparer les en-têtes avec première lettre en majuscule
    const headers = columns.map((col) => {
      // Capitaliser proprement les en-têtes
      return col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, " ");
    });

    // En-tête du tableau
    md += "| " + headers.join(" | ") + " |\n";
    md += "|" + columns.map(() => "---").join("|") + "|\n";

    // Lignes de données
    data.forEach((row, rowIndex) => {
      const cells = columns.map((col) => {
        const value = row[col];
        if (value === null || value === undefined) {
          return "-";
        }
        // Échapper les pipes et nettoyer les valeurs
        let cleanValue = String(value)
          .replace(/\|/g, "\\|")
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Limiter la longueur pour une meilleure lisibilité
        if (cleanValue.length > 200) {
          cleanValue = cleanValue.substring(0, 197) + "...";
        }

        // CORRECTION FUSION CELLULES: Utiliser un tiret pour les cellules vides
        // au lieu d'un espace qui peut être ignoré par le rendu Markdown
        return cleanValue || "-";
      });

      md += "| " + cells.join(" | ") + " |\n";

      // Log de progression tous les 5 items
      if ((rowIndex + 1) % 5 === 0) {
        console.log(`  ✓ ${rowIndex + 1}/${data.length} lignes traitées`);
      }
    });

    console.log(`✅ Tableau ${tableName} converti avec succès`);
    return md + "\n";
  }

  /**
   * Convertit une table de téléchargement en Markdown
   */
  private convertDownloadTableToMarkdown(data: any): string {
    let md = "## 📥 Ressources et Téléchargements\n\n";

    if (typeof data === "object") {
      Object.entries(data).forEach(([key, value]) => {
        const formattedKey =
          key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

        if (
          typeof value === "string" &&
          (value.startsWith("http://") || value.startsWith("https://"))
        ) {
          md += `🔗 **[${formattedKey}](${value})**\n\n`;
        } else {
          md += `**${formattedKey}**: ${value}\n\n`;
        }
      });
    } else {
      md += `${data}\n\n`;
    }

    return md;
  }

  /**
   * Conversion générique de structure en Markdown
   */
  private convertGenericStructureToMarkdown(
    data: any,
    depth: number = 0,
  ): string {
    let md = "";
    const indent = "  ".repeat(depth);

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        md += `${indent}- **Item ${index + 1}**:\n`;
        md += this.convertGenericStructureToMarkdown(item, depth + 1);
      });
    } else if (typeof data === "object" && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === "object") {
          md += `${indent}**${key}**:\n`;
          md += this.convertGenericStructureToMarkdown(value, depth + 1);
        } else {
          md += `${indent}**${key}**: ${value}\n`;
        }
      });
    } else {
      md += `${indent}${data}\n`;
    }

    return md;
  }

  /**
   * Génère les templates de tables pour les cases 35-43
   */
  private generateTemplateTable(routeKey: string, userMessage: string): string {
    console.log(`🎨 Génération du template: ${routeKey}`);
    
    // Définir les templates JSON selon le routeKey
    const templates: { [key: string]: any } = {
      template_table_unicolonne: {
        "Etape mission - Flowise": [
          {
            "table 1": [
              {
                "Table_unicolonne": ""
              }
            ]
          }
        ]
      },
      
      template_table_simple: {
        "Etape mission - audit": [
          {
            "table 1": Array.from({ length: 10 }, (_, i) => ({
              "No": i + 1,
              "Colonne A": "",
              "Colonne B": "",
              "Colonne C": "",
              "Colonne D": "",
              "Colonne E": ""
            }))
          }
        ]
      },
      
      template_table_etape_de_mission: {
        "Etape mission - preparation": [
          {
            "table 1": {
              "Etape de mission": "",
              "Norme": " ",
              "Méthode": "",
              "Reference": "Etape-001"
            }
          },
          {
            "table 2": Array.from({ length: 10 }, (_, i) => ({
              "No": i + 1,
              "Colonne A": "",
              "Colonne B": "",
              "Colonne C": "",
              "Colonne D": "",
              "Colonne E": ""
            }))
          }
        ]
      },
      
      template_table_feuille_couverture_test_audit: {
        "Etape mission - Feuille couverture": [
          {
            "table 1": {
              "Etape de mission": "Feuille couverture",
              "Norme": " ",
              "Méthode": "",
              "Reference": "Feuille couverture-001"
            }
          },
          {
            "table 2": {
              "OBJECTIFS": ""
            }
          },
          {
            "table 3": {
              "1": "",
              "2": " ",
              "3": "",
              "4": ""
            }
          },
          {
            "table 4": {
              "Résultats des tests": ""
            }
          },
          {
            "table 5": Array.from({ length: 10 }, (_, i) => ({
              "No": "",
              "domaines ": "",
              "Transaction": "",
              "Solde Théorique ": "",
              "Solde Physique ": "",
              "Ecart": "",
              "Assertion": "",
              "CTR1": "",
              "CTR 2": "",
              "CTR 3": "",
              "Description": "",
              "Conclusion": ""
            }))
          }
        ]
      },
      
      template_table_frap: {
        "Etape mission - Frap": [
          {
            "table 1": {
              "Etape de mission": "Frap",
              "Norme": "14.3 Évaluation des constats",
              "Méthode": "Méthode des constats d'audit par les risques critiques",
              "Reference": "Frap-001"
            }
          },
          {
            "table 2": {
              "Intitule": ""
            }
          },
          {
            "table 3": {
              "Observation": ""
            }
          },
          {
            "table 4": {
              "Constat": ""
            }
          },
          {
            "table 5": {
              "Risque": ""
            }
          },
          {
            "table 6": {
              "Recommendation": ""
            }
          }
        ]
      },
      
      template_table_syntheses_frap: {
        "Etape mission - Synthèse": [
          {
            "table 1": {
              "Etape de mission": "Synthèse",
              "Norme": "",
              "Méthode": "",
              "Reference": "Synthèse-001"
            }
          },
          {
            "table 2": Array.from({ length: 10 }, (_, i) => ({
              "no": i + 1,
              "Intitule": "",
              "Observation": "",
              "Constat": "",
              "Risque": "",
              "Recommandation": ""
            }))
          }
        ]
      },
      
      template_table_rapport_provisoire: {
        "Etape mission - Rapport provisoire": [
          {
            "table 1": {
              "Etape de mission": "Rapport provisoire",
              "Norme": " ",
              "Méthode": "",
              "Reference": "Rapport provisoire-001"
            }
          },
          {
            "table 2": Array.from({ length: 10 }, (_, i) => ({
              "no": i + 1,
              "Intitule": "",
              "Observation": "",
              "Constat": "",
              "Risque": "",
              "Recommandation": "",
              "Commentaire audite": "",
              "Commentaire auditeur": ""
            }))
          }
        ]
      },
      
      template_table_rapport_final: {
        "Etape mission - Rapport final": [
          {
            "table 1": {
              "Etape de mission": "Rapport final",
              "Norme": " ",
              "Méthode": "",
              "Reference": "Rapport final-001"
            }
          },
          {
            "table 2": Array.from({ length: 10 }, (_, i) => ({
              "no": i + 1,
              "Intitule": "",
              "Observation": "",
              "Constat": "",
              "Risque": "",
              "Recommandation": "",
              "Commentaire audite": "",
              "Commentaire auditeur": "",
              "Plan action": "",
              "Responsable": "",
              "Delai": ""
            }))
          }
        ]
      },
      
      template_table_suivi_recos: {
        "Etape mission - Suivis des recos": [
          {
            "table 1": {
              "Etape de mission": "Suivis des recos",
              "Norme": " ",
              "Méthode": "",
              "Reference": "Suivis des recos-001"
            }
          },
          {
            "table 2": Array.from({ length: 10 }, (_, i) => ({
              "no": i + 1,
              "Intitule": "",
              "Observation": "",
              "Constat": "",
              "Risque": "",
              "Recommandation": "",
              "Commentaire audite": "",
              "Commentaire auditeur": "",
              "Plan action": "",
              "Responsable": "",
              "Delai": "",
              "Evaluation Risque": ""
            }))
          }
        ]
      }
    };
    
    // Récupérer le template correspondant
    const templateData = templates[routeKey];
    
    if (!templateData) {
      console.error(`❌ Template non trouvé pour: ${routeKey}`);
      return `**Erreur**: Template non trouvé pour ${routeKey}`;
    }
    
    // Convertir le template JSON en Markdown en utilisant la méthode existante
    const markdownContent = this.convertStructuredDataToMarkdown(templateData);
    
    console.log(`✅ Template généré avec succès (${markdownContent.length} caractères)`);
    
    return markdownContent;
  }

  /**
   * Détecte et normalise le format de réponse n8n.
   * Cette fonction est conçue pour être robuste et supporter plusieurs formats de réponse.
   */
  private normalizeN8nResponse(result: any): {
    content: string;
    metadata: any;
  } {
    let contentToDisplay = "";
    let metadata: any = {};

    console.log("🔍 === DEBUT ANALYSE REPONSE N8N ===");
    console.log("📦 Structure reçue:", JSON.stringify(result, null, 2).substring(0, 500));

    if (!result) {
      console.error("❌ Réponse n8n vide ou null");
      return {
        content: "",
        metadata: { error: "Empty response from n8n", format: "error" },
      };
    }

    // ========================================================================
    // EXTRACTION PRÉALABLE: Gérer le format response.body[0].data de n8n
    // ========================================================================
    if (result && typeof result === "object" && "response" in result) {
      console.log("🔧 FORMAT WEBHOOK N8N: Extraction de response.body[0].data");
      
      if (result.response && 
          typeof result.response === "object" && 
          "body" in result.response &&
          Array.isArray(result.response.body) &&
          result.response.body.length > 0) {
        
        console.log("✅ Structure response.body détectée");
        
        // Extraire le premier élément du body
        const bodyData = result.response.body[0];
        
        if (bodyData && typeof bodyData === "object" && "data" in bodyData) {
          console.log("✅ Extraction de response.body[0].data réussie");
          console.log("📊 Données extraites:", JSON.stringify(bodyData.data, null, 2).substring(0, 300));
          
          // Remplacer result par les données extraites pour le traitement normal
          // On enveloppe dans un array avec {data: ...} pour correspondre au FORMAT 4
          result = [{ data: bodyData.data }];
          
          console.log("🔄 Données transformées pour traitement FORMAT 4");
        } else {
          console.warn("⚠️ response.body[0] ne contient pas de propriété 'data'");
        }
      } else {
        console.warn("⚠️ response.body n'est pas un array ou est vide");
      }
    }

    // ========================================================================
    // FORMAT CASE 49 (Programme de travail): Array avec "output" contenant JSON dans markdown
    // Exemple: [{ "output": "`json\n{...}\n```" }]
    // ========================================================================
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0];
      
      if (firstItem && typeof firstItem === "object" && "output" in firstItem) {
        const outputContent = firstItem.output;
        
        // Vérifier si output contient du JSON dans un bloc markdown OU commence par `json
        if (typeof outputContent === "string" && 
            (outputContent.includes("```json") || outputContent.trim().startsWith("`json"))) {
          console.log("🔧 FORMAT CASE 49 DETECTE: output avec JSON dans bloc markdown");
          
          try {
            let cleanedOutput = outputContent;
            
            // Étape 1: Retirer le backtick unique initial si présent (ex: "`json")
            if (cleanedOutput.trim().startsWith("`json")) {
              cleanedOutput = cleanedOutput.trim().substring(5); // Retire "`json"
              console.log("🧹 Backtick simple initial retiré");
            }
            
            // Étape 2: Retirer les triples backticks (```json et ```)
            cleanedOutput = cleanedOutput.replace(/^```json\s*/gm, '').replace(/```\s*$/gm, '').trim();
            
            // Étape 3: Retirer les backticks résiduels au début et à la fin
            cleanedOutput = cleanedOutput.replace(/^`+/, '').replace(/`+$/, '').trim();
            
            console.log("📊 Contenu nettoyé (premiers 500 caractères):", cleanedOutput.substring(0, 500));
            
            // Étape 4: Parser le JSON
            const parsedData = JSON.parse(cleanedOutput);
            
            console.log("✅ JSON parsé avec succès");
            console.log("📊 Structure:", {
              type: typeof parsedData,
              keys: Object.keys(parsedData),
              firstKey: Object.keys(parsedData)[0]
            });
            
            // Remplacer result par les données parsées pour le traitement normal
            result = [{ data: parsedData }];
            
            console.log("🔄 Données transformées pour traitement FORMAT 4");
          } catch (parseError) {
            console.error("❌ Erreur lors du parsing JSON depuis output:", parseError);
            console.error("📄 Contenu brut problématique:", outputContent.substring(0, 1000));
            
            // Fallback: retourner l'erreur avec le contenu brut pour debug
            return {
              content: `**Erreur de parsing JSON**\n\nLe serveur a retourné des données mais le format JSON est invalide.\n\n**Détails de l'erreur:**\n${parseError instanceof Error ? parseError.message : String(parseError)}\n\n**Contenu brut (premiers 500 caractères):**\n\`\`\`\n${outputContent.substring(0, 500)}\n\`\`\``,
              metadata: {
                error: "JSON parse error",
                format: "case49_output_markdown_error",
                rawContentPreview: outputContent.substring(0, 200)
              }
            };
          }
        }
      }
    }

    // ========================================================================
    // FORMAT NEW: Response containing "markdown" key (direct or in array)
    // ========================================================================
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0];
      if (firstItem && typeof firstItem === "object" && "markdown" in firstItem) {
        console.log('✅ FORMAT NEW (Array): Réponse avec "markdown"');
        contentToDisplay = String(firstItem.markdown || "");
        
        // 🔧 DÉTECTION PAPIER DE TRAVAIL MARKDOWN
        if (claraPapierTravailService.detectPapierTravail(contentToDisplay)) {
          console.log("📋 === PAPIER DE TRAVAIL DÉTECTÉ DANS MARKDOWN (FORMAT NEW) ===");
          contentToDisplay = claraPapierTravailService.process(contentToDisplay);
        }

        metadata = {
          format: "markdown_response",
          timestamp: firstItem.timestamp || new Date().toISOString(),
          tables_found: firstItem.tableCount || 0,
          totalItems: result.length,
        };
        console.log("🔍 === FIN ANALYSE (FORMAT NEW - Array markdown) ===");
        return { content: contentToDisplay, metadata };
      }
    }

    if (result && typeof result === "object" && !Array.isArray(result) && "markdown" in result) {
      console.log('✅ FORMAT NEW (Object): Réponse avec "markdown"');
      contentToDisplay = String(result.markdown || "");
      
      // 🔧 DÉTECTION PAPIER DE TRAVAIL MARKDOWN
      if (claraPapierTravailService.detectPapierTravail(contentToDisplay)) {
        console.log("📋 === PAPIER DE TRAVAIL DÉTECTÉ DANS MARKDOWN (FORMAT NEW) ===");
        contentToDisplay = claraPapierTravailService.process(contentToDisplay);
      }

      metadata = {
        format: "markdown_response",
        timestamp: result.timestamp || new Date().toISOString(),
        tables_found: result.tableCount || 0,
      };
      console.log("🔍 === FIN ANALYSE (FORMAT NEW - Object markdown) ===");
      return { content: contentToDisplay, metadata };
    }

    // ========================================================================
    // FORMAT 7: METHODO REVISION — Array with "Sous-section" / "Sub-items"
    // Can be direct or wrapped in "[CADRAGE PEDAGOGIQUE]" section
    // ========================================================================
    
    // Case 1: Wrapped in "[CADRAGE PEDAGOGIQUE]" or similar section
    if (Array.isArray(result) && result.length > 0) {
      // Look for a section containing "[CADRAGE PEDAGOGIQUE]" or similar
      const cadragePedagogiqueSection = result.find((item: any) => {
        if (item && typeof item === "object") {
          const keys = Object.keys(item);
          return keys.some(key => 
            key.includes("[CADRAGE PEDAGOGIQUE]") || 
            key.includes("CADRAGE") ||
            key.includes("PEDAGOGIQUE")
          );
        }
        return false;
      });
      
      if (cadragePedagogiqueSection) {
        const sectionKey = Object.keys(cadragePedagogiqueSection).find(key => 
          key.includes("[CADRAGE PEDAGOGIQUE]") || 
          key.includes("CADRAGE") ||
          key.includes("PEDAGOGIQUE")
        );
        
        if (sectionKey) {
          const sectionData = cadragePedagogiqueSection[sectionKey];
          
          // Check if this section contains the expected structure
          if (
            Array.isArray(sectionData) &&
            sectionData.length > 0 &&
            sectionData[0] &&
            typeof sectionData[0] === "object" &&
            "Sous-section" in sectionData[0] &&
            "Sub-items" in sectionData[0]
          ) {
            console.log("✅ FORMAT 7 DETECTE: Réponse METHODO REVISION (wrapped in CADRAGE PEDAGOGIQUE)");
            console.log("📊 Structure détectée:", {
              totalSections: sectionData.length,
              firstSection: sectionData[0]["Sous-section"],
              subItemsCount: sectionData[0]["Sub-items"]?.length || 0,
            });
            
            const content = `__METHODO_REVISION_ACCORDION__${JSON.stringify(sectionData)}`;
            
            console.log("🔍 === FIN ANALYSE (FORMAT 7 - METHODO REVISION Accordion wrapped) ===");
            return {
              content,
              metadata: {
                format: "methodo_revision_accordion",
                timestamp: new Date().toISOString(),
                totalSections: sectionData.length,
                endpoint: "methodo_revision",
                wrapped: true,
              },
            };
          }
        }
      }
    }
    
    // Case 2: Direct structure with "Sous-section" at root level
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      result[0] &&
      typeof result[0] === "object" &&
      "Sous-section" in result[0] &&
      "Sub-items" in result[0]
    ) {
      const firstSection = result[0]["Sous-section"] || "";
      
      // Detect if it's methodo_revision based on content patterns
      const isMethodoRevision = 
        firstSection.includes("AA") || // Test reference like "AA040"
        firstSection.includes("Rapprochements") ||
        firstSection.includes("Cadrage") ||
        firstSection.toLowerCase().includes("audit") ||
        firstSection.toLowerCase().includes("contrôle");
      
      if (isMethodoRevision) {
        console.log("✅ FORMAT 7 DETECTE: Réponse METHODO REVISION avec 'Sous-section' / 'Sub-items'");
        console.log("📊 Structure détectée:", {
          totalSections: result.length,
          firstSection: firstSection,
          subItemsCount: result[0]["Sub-items"]?.length || 0,
        });
        
        const content = `__METHODO_REVISION_ACCORDION__${JSON.stringify(result)}`;
        
        console.log("🔍 === FIN ANALYSE (FORMAT 7 - METHODO REVISION Accordion) ===");
        return {
          content,
          metadata: {
            format: "methodo_revision_accordion",
            timestamp: new Date().toISOString(),
            totalSections: result.length,
            endpoint: "methodo_revision",
          },
        };
      }
    }

    // ========================================================================
    // FORMAT 6: CIA QCM — Array with "Etape mission - CIA" containing tables
    // OU format avec erreur contenant du JSON dans un bloc markdown
    // ========================================================================
    
    // Cas 1: Erreur avec JSON brut dans un bloc markdown (QCM)
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      result[0] &&
      typeof result[0] === "object" &&
      "error" in result[0] &&
      "raw" in result[0]
    ) {
      console.log('🔧 FORMAT 6 SPECIAL: Réponse QCM avec JSON dans bloc markdown');
      try {
        const rawContent = result[0].raw;
        // Extraire le JSON du bloc markdown ```json...```
        const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          const cleanJson = jsonMatch[1].trim();
          const parsedData = JSON.parse(cleanJson);
          
          // Vérifier si c'est bien une structure CIA QCM
          if (parsedData && typeof parsedData === "object" && "Etape mission - CIA" in parsedData) {
            // Convertir en array si c'est un objet unique
            const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
            
            const etapeMission = dataArray[0]["Etape mission - CIA"];
            let totalQuestions = 0;
            
            // Compter le nombre total de questions
            if (Array.isArray(etapeMission)) {
              etapeMission.forEach((tableObj: any) => {
                Object.keys(tableObj).forEach((tableKey) => {
                  const rows = tableObj[tableKey];
                  if (Array.isArray(rows)) {
                    const questionRows = rows.filter((row: any) => row.Question && row.Option);
                    totalQuestions += questionRows.length;
                  }
                });
              });
            }
            
            console.log("✅ JSON QCM extrait et parsé avec succès");
            console.log("📊 Structure détectée:", {
              tablesCount: etapeMission?.length || 0,
              totalQuestions: totalQuestions,
            });
            
            const content = `__CIA_QCM_ACCORDION__${JSON.stringify(dataArray)}`;
            console.log("🔍 === FIN ANALYSE (FORMAT 6 - CIA QCM Accordion depuis markdown) ===");
            return {
              content,
              metadata: {
                format: "cia_qcm_accordion",
                timestamp: new Date().toISOString(),
                qcmGroupsCount: etapeMission?.length || 0,
                totalQuestions: totalQuestions,
                endpoint: "qcm_cia_gemini",
                extractedFromMarkdown: true,
              },
            };
          }
        }
      } catch (e) {
        console.error("❌ Échec de l'extraction du JSON QCM depuis le bloc markdown:", e);
      }
    }
    
    // Cas 2: Format normal avec structure directe (QCM)
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      result[0] &&
      typeof result[0] === "object" &&
      "Etape mission - CIA" in result[0]
    ) {
      console.log('✅ FORMAT 6 DETECTE: Réponse CIA QCM (Etape mission - CIA)');
      
      const etapeMission = result[0]["Etape mission - CIA"];
      let totalQuestions = 0;
      
      // Compter le nombre total de questions
      if (Array.isArray(etapeMission)) {
        etapeMission.forEach((tableObj: any) => {
          Object.keys(tableObj).forEach((tableKey) => {
            const rows = tableObj[tableKey];
            if (Array.isArray(rows)) {
              const questionRows = rows.filter((row: any) => row.Question && row.Option);
              totalQuestions += questionRows.length;
            }
          });
        });
      }
      
      console.log("📊 Structure détectée:", {
        tablesCount: etapeMission?.length || 0,
        totalQuestions: totalQuestions,
      });
      
      const content = `__CIA_QCM_ACCORDION__${JSON.stringify(result)}`;
      console.log("🔍 === FIN ANALYSE (FORMAT 6 - CIA QCM Accordion) ===");
      return {
        content,
        metadata: {
          format: "cia_qcm_accordion",
          timestamp: new Date().toISOString(),
          qcmGroupsCount: etapeMission?.length || 0,
          totalQuestions: totalQuestions,
          endpoint: "qcm_cia_gemini",
        },
      };
    }

    // ========================================================================
    // FORMAT 7: GUIDE DES COMMANDES — Array with "data" containing "Sous-section" / "Sub-items"
    // ========================================================================
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      result[0] &&
      typeof result[0] === "object" &&
      "data" in result[0] &&
      Array.isArray(result[0].data) &&
      result[0].data.length > 0 &&
      "Sous-section" in result[0].data[0] &&
      "Sub-items" in result[0].data[0]
    ) {
      console.log('✅ FORMAT 7 DETECTE: Guide des Commandes avec structure data/Sous-section/Sub-items');
      console.log("📊 Structure détectée:", {
        totalSections: result[0].data.length,
        firstSection: result[0].data[0]["Sous-section"],
        subItemsCount: result[0].data[0]["Sub-items"]?.length || 0,
      });
      
      const content = `__GUIDE_COMMANDES_ACCORDION__${JSON.stringify(result)}`;
      
      console.log('🔍 === FIN ANALYSE (FORMAT 7 - Guide des Commandes Accordion) ===');
      return {
        content,
        metadata: {
          format: "guide_commandes_accordion",
          timestamp: new Date().toISOString(),
          totalSections: result[0].data.length,
          endpoint: "guide_des_commandes",
        },
      };
    }

    // ========================================================================
    // FORMAT 8: HEATMAP RISQUE — Array with "data" containing "Etape mission - Cartographie"
    // ========================================================================
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      result[0] &&
      typeof result[0] === "object" &&
      "data" in result[0]
    ) {
      const dataContent = result[0].data;
      
      // Vérifier si c'est une structure de cartographie des risques
      const cartographieKey = Object.keys(dataContent).find(
        (key) =>
          key.toLowerCase().includes("etape") &&
          key.toLowerCase().includes("cartographie")
      );
      
      if (cartographieKey && Array.isArray(dataContent[cartographieKey])) {
        const tables = dataContent[cartographieKey];
        
        // Vérifier qu'il y a au moins 2 tables (entête + risques)
        if (tables.length >= 2) {
          // Vérifier la structure: table 1 (objet) + table 2 (array)
          const table1 = tables[0];
          const table2 = tables[1];
          
          const table1Key = Object.keys(table1)[0];
          const table2Key = Object.keys(table2)[0];
          
          const isTable1Object = typeof table1[table1Key] === 'object' && !Array.isArray(table1[table1Key]);
          const isTable2Array = Array.isArray(table2[table2Key]);
          
          if (isTable1Object && isTable2Array) {
            console.log('✅ FORMAT 8 DETECTE: Heatmap Risque avec structure Etape mission - Cartographie');
            
            const risques = table2[table2Key];
            console.log("📊 Structure détectée:", {
              cartographieKey: cartographieKey,
              totalTables: tables.length,
              totalRisques: risques.length,
              table1Key: table1Key,
              table2Key: table2Key,
            });
            
            const content = `__HEATMAP_RISQUE_ACCORDION__${JSON.stringify(result)}`;
            
            console.log('🔍 === FIN ANALYSE (FORMAT 8 - Heatmap Risque Accordion) ===');
            return {
              content,
              metadata: {
                format: "heatmap_risque_accordion",
                timestamp: new Date().toISOString(),
                totalRisques: risques.length,
                cartographieKey: cartographieKey,
                endpoint: "heatmap_risque",
              },
            };
          }
        }
      }
    }

    // ========================================================================
    // FORMAT 9: NOUVEAU FORMAT CIA (Case 49 style) — Array with "output" containing "Sous-section" structure
    // Exemple: [{ "output": "`json\n{\"Sous-section A\": \"...\", \"Sub-items\": [...]}\n```" }]
    // ========================================================================
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0];
      
      if (firstItem && typeof firstItem === "object" && "output" in firstItem) {
        const outputContent = firstItem.output;
        
        // Vérifier si output contient du JSON dans un bloc markdown avec structure Sous-section
        if (typeof outputContent === "string" && 
            (outputContent.includes("```json") || outputContent.trim().startsWith("`json"))) {
          console.log("🔧 FORMAT 9 NOUVEAU CIA: output avec JSON Sous-section dans bloc markdown");
          
          try {
            let cleanedOutput = outputContent;
            
            // Étape 1: Retirer le backtick unique initial si présent (ex: "`json")
            if (cleanedOutput.trim().startsWith("`json")) {
              cleanedOutput = cleanedOutput.trim().substring(5); // Retire "`json"
              console.log("🧹 Backtick simple initial retiré");
            }
            
            // Étape 2: Retirer les triples backticks (```json et ```)
            cleanedOutput = cleanedOutput.replace(/^```json\s*/gm, '').replace(/```\s*$/gm, '').trim();
            
            // Étape 3: Retirer les backticks résiduels au début et à la fin
            cleanedOutput = cleanedOutput.replace(/^`+/, '').replace(/`+$/, '').trim();
            
            console.log("📊 Contenu nettoyé (premiers 500 caractères):", cleanedOutput.substring(0, 500));
            
            // Étape 4: Parser le JSON
            const parsedData = JSON.parse(cleanedOutput);
            
            console.log("✅ JSON parsé avec succès");
            console.log("📊 Structure:", {
              type: typeof parsedData,
              keys: Object.keys(parsedData),
              firstKey: Object.keys(parsedData)[0]
            });
            
            // Vérifier si c'est une structure avec "Sous-section" et "Sub-items"
            if (parsedData && typeof parsedData === "object" && "Sous-section" in parsedData) {
              console.log("✅ FORMAT 9 CIA DETECTE: Structure Sous-section/Sub-items trouvée");
              
              // Convertir en array si nécessaire (attendu par CiaAccordionRenderer)
              const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
              
              // Déterminer le type basé sur le contenu
              const firstSection = dataArray[0]["Sous-section"] || "";
              const isMethodoAudit = firstSection.toLowerCase().includes("étape") || 
                                     firstSection.toLowerCase().includes("etape") ||
                                     firstSection.toLowerCase().includes("rôle");
              
              const content = isMethodoAudit 
                ? `__CIA_METHODO_ACCORDION__${JSON.stringify(dataArray)}`
                : `__CIA_ACCORDION__${JSON.stringify(dataArray)}`;
              
              console.log(`🔍 === FIN ANALYSE (FORMAT 9 - ${isMethodoAudit ? 'METHODO AUDIT' : 'CIA COURS'} depuis markdown) ===`);
              return {
                content,
                metadata: {
                  format: isMethodoAudit ? "cia_methodo_accordion" : "cia_accordion",
                  timestamp: new Date().toISOString(),
                  totalSections: dataArray.length,
                  endpoint: isMethodoAudit ? "methodo_audit" : "cia_cours_gemini",
                  extractedFromMarkdown: true,
                  newFormat: true,
                }
              };
            }
            
            // Si pas de structure Sous-section, continuer avec le traitement FORMAT 4 existant
            console.log("⚠️ Pas de structure Sous-section détectée, traitement FORMAT 4");
            result = [{ data: parsedData }];
            
          } catch (parseError) {
            console.error("❌ Erreur lors du parsing JSON depuis output (FORMAT 9):", parseError);
            console.error("📄 Contenu brut problématique:", outputContent.substring(0, 1000));
            
            // Fallback: retourner l'erreur avec le contenu brut pour debug
            return {
              content: `**Erreur de parsing JSON (FORMAT 9)**\n\nLe serveur a retourné des données mais le format JSON est invalide.\n\n**Détails de l'erreur:**\n${parseError instanceof Error ? parseError.message : String(parseError)}\n\n**Contenu brut (premiers 500 caractères):**\n\`\`\`\n${outputContent.substring(0, 500)}\n\`\`\``,
              metadata: {
                error: "JSON parse error",
                format: "nouveau_cia_output_markdown_error",
                rawContentPreview: outputContent.substring(0, 200)
              }
            };
          }
        }
      }
    }

    // ========================================================================
    // FORMAT 5: CIA COURS & METHODO AUDIT — Array with "Sous-section" / "Sub-items" structure
    // OU format avec erreur contenant du JSON dans un bloc markdown
    // ========================================================================
    
    // Cas 1: Erreur avec JSON brut dans un bloc markdown
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      result[0] &&
      typeof result[0] === "object" &&
      "error" in result[0] &&
      "raw" in result[0]
    ) {
      console.log('� FORMAT 5 SPECIAL: Réponse avec JSON dans bloc markdown');
      try {
        const rawContent = result[0].raw;
        // Extraire le JSON du bloc markdown ```json...```
        const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          const cleanJson = jsonMatch[1].trim();
          const parsedData = JSON.parse(cleanJson);
          
          // Vérifier si c'est bien une structure CIA COURS ou METHODO AUDIT
          if (parsedData && typeof parsedData === "object" && "Sous-section" in parsedData) {
            // Convertir en array si c'est un objet unique
            const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
            
            console.log("✅ JSON extrait et parsé avec succès");
            console.log("📊 Structure détectée:", {
              totalSections: dataArray.length,
              firstSection: dataArray[0]["Sous-section"],
              subItemsCount: dataArray[0]["Sub-items"]?.length || 0,
            });
            
            // Déterminer si c'est CIA COURS ou METHODO AUDIT basé sur le contexte
            // On peut vérifier les métadonnées ou utiliser un marqueur spécifique
            const isMethodoAudit = result[0].endpoint === "methodo_audit" || 
                                   (dataArray[0]["Sous-section"] && 
                                    dataArray[0]["Sous-section"].toLowerCase().includes("étape"));
            
            const content = isMethodoAudit 
              ? `__CIA_METHODO_ACCORDION__${JSON.stringify(dataArray)}`
              : `__CIA_ACCORDION__${JSON.stringify(dataArray)}`;
            
            console.log(`� === FIN ANALYSE (FORMAT 5 - ${isMethodoAudit ? 'METHODO AUDIT' : 'CIA COURS'} Accordion depuis markdown) ===`);
            return {
              content,
              metadata: {
                format: isMethodoAudit ? "cia_methodo_accordion" : "cia_accordion",
                timestamp: new Date().toISOString(),
                totalSections: dataArray.length,
                endpoint: isMethodoAudit ? "methodo_audit" : "cia_cours_gemini",
                extractedFromMarkdown: true,
              },
            };
          }
        }
      } catch (e) {
        console.error("❌ Échec de l'extraction du JSON depuis le bloc markdown:", e);
      }
    }
    
    // Cas 2: Format normal avec structure directe
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      result[0] &&
      typeof result[0] === "object" &&
      "Sous-section" in result[0] &&
      "Sub-items" in result[0]
    ) {
      // Déterminer si c'est CIA COURS ou METHODO AUDIT
      // METHODO AUDIT a typiquement des étapes (Étape 1, Étape 2, etc.)
      const firstSection = result[0]["Sous-section"] || "";
      const isMethodoAudit = firstSection.toLowerCase().includes("étape") || 
                             firstSection.toLowerCase().includes("etape");
      
      console.log(
        `✅ FORMAT 5 DETECTE: Réponse ${isMethodoAudit ? 'METHODO AUDIT' : 'CIA COURS'} avec "Sous-section" / "Sub-items"`,
      );
      console.log("📊 Structure détectée:", {
        totalSections: result.length,
        firstSection: firstSection,
        subItemsCount: result[0]["Sub-items"]?.length || 0,
        isMethodoAudit: isMethodoAudit,
      });
      
      const content = isMethodoAudit 
        ? `__CIA_METHODO_ACCORDION__${JSON.stringify(result)}`
        : `__CIA_ACCORDION__${JSON.stringify(result)}`;
      
      console.log(`🔍 === FIN ANALYSE (FORMAT 5 - ${isMethodoAudit ? 'METHODO AUDIT' : 'CIA COURS'} Accordion) ===`);
      return {
        content,
        metadata: {
          format: isMethodoAudit ? "cia_methodo_accordion" : "cia_accordion",
          timestamp: new Date().toISOString(),
          totalSections: result.length,
          endpoint: isMethodoAudit ? "methodo_audit" : "cia_cours_gemini",
        },
      };
    }

    // ========================================================================
    // FORMAT 4: NOUVEAU FORMAT "Programme de travail" avec structure "data"
    // ========================================================================
    
    // CAS 4A: Objet direct avec propriété "data" (n8n retourne un objet au lieu d'un array)
    if (result && typeof result === "object" && !Array.isArray(result) && "data" in result) {
      console.log(
        '✅ FORMAT 4A DETECTE: Objet direct avec propriété "data" (webhook n8n)',
      );

      const dataContent = result.data;
      console.log("📊 Contenu de data:", {
        type: typeof dataContent,
        keys: dataContent && typeof dataContent === "object" ? Object.keys(dataContent) : [],
        firstKey: dataContent && typeof dataContent === "object" ? Object.keys(dataContent)[0] : null,
      });

      // Convertir les données structurées en Markdown
      console.log("🔄 Début de la conversion en Markdown...");
      contentToDisplay = this.convertStructuredDataToMarkdown(dataContent);
      console.log(
        `✅ Conversion terminée: ${contentToDisplay.length} caractères générés`,
      );

      metadata = {
        format: "programme_travail_data_object",
        timestamp: new Date().toISOString(),
        dataStructure: dataContent && typeof dataContent === "object" ? Object.keys(dataContent)[0] || "unknown" : "unknown",
        contentLength: contentToDisplay.length,
      };

      console.log("🔍 === FIN ANALYSE (FORMAT 4A - Programme de travail objet) ===");
      console.log(
        "📝 Aperçu du contenu généré:",
        contentToDisplay.substring(0, 300),
      );
      return { content: contentToDisplay, metadata };
    }
    
    // CAS 4B: Array avec objet contenant "data" (format original)
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0];

      console.log("🔍 Analyse du premier élément:", {
        isObject: typeof firstItem === "object",
        hasData: firstItem && "data" in firstItem,
        hasOutput: firstItem && "output" in firstItem,
        keys: firstItem ? Object.keys(firstItem) : [],
      });

      // Vérifier si c'est le nouveau format avec "data"
      if (firstItem && typeof firstItem === "object" && "data" in firstItem) {
        console.log(
          '✅ FORMAT 4B DETECTE: Array avec objet contenant "data"',
        );

        const dataContent = firstItem.data;
        console.log("📊 Contenu de data:", {
          type: typeof dataContent,
          keys: Object.keys(dataContent),
          firstKey: Object.keys(dataContent)[0],
        });

        // Convertir les données structurées en Markdown
        console.log("🔄 Début de la conversion en Markdown...");
        contentToDisplay = this.convertStructuredDataToMarkdown(dataContent);
        console.log(
          `✅ Conversion terminée: ${contentToDisplay.length} caractères générés`,
        );

        metadata = {
          format: "programme_travail_data_array",
          timestamp: new Date().toISOString(),
          totalItems: result.length,
          dataStructure: Object.keys(dataContent)[0] || "unknown",
          contentLength: contentToDisplay.length,
        };

        console.log("🔍 === FIN ANALYSE (FORMAT 4B - Programme de travail array) ===");
        console.log(
          "📝 Aperçu du contenu généré:",
          contentToDisplay.substring(0, 300),
        );
        return { content: contentToDisplay, metadata };
      }

      // FORMAT 1: Réponse standardisée (Array avec un objet contenant 'output')
      if (firstItem && typeof firstItem === "object" && "output" in firstItem) {
        console.log('✅ FORMAT 1 DETECTE: Array avec objet contenant "output"');
        contentToDisplay = String(firstItem.output || "");
        
        // 🔧 DÉTECTION PAPIER DE TRAVAIL MARKDOWN
        if (claraPapierTravailService.detectPapierTravail(contentToDisplay)) {
          console.log("📋 === PAPIER DE TRAVAIL DÉTECTÉ DANS MARKDOWN (FORMAT 1) ===");
          contentToDisplay = claraPapierTravailService.process(contentToDisplay);
        }

        metadata = {
          stats: firstItem.stats || {},
          debugInfo: firstItem.debugInfo || [],
          consolidationSuccess: firstItem.consolidationSuccess,
          format: "array_output",
          timestamp: firstItem.stats?.timestamp || new Date().toISOString(),
          totalItems: result.length,
        };
        console.log("🔍 === FIN ANALYSE (FORMAT 1) ===");
        return { content: contentToDisplay, metadata };
      }
    }

    // Format 2: Ancien format avec un objet 'tables'
    if (
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      result.tables &&
      Array.isArray(result.tables)
    ) {
      console.log('✅ FORMAT 2 DETECTE: Objet avec "tables"');
      contentToDisplay = result.tables
        .map((table: any) => table?.markdown || "")
        .filter((content: string) => content.trim() !== "")
        .join("\n\n---\n\n");
      metadata = {
        status: result.status,
        tables_found: result.tables_found || result.tables.length,
        format: "tables_array",
        ...result,
      };
      delete metadata.tables;
      console.log("🔍 === FIN ANALYSE (FORMAT 2) ===");
      return { content: contentToDisplay, metadata };
    }

    // Format 3: Réponse directe avec une clé 'output' à la racine
    if (
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      result.output &&
      typeof result.output === "string"
    ) {
      console.log('✅ FORMAT 3 DETECTE: Objet avec "output" direct');
      contentToDisplay = result.output;
      
      // 🔧 DÉTECTION PAPIER DE TRAVAIL MARKDOWN
      if (claraPapierTravailService.detectPapierTravail(contentToDisplay)) {
        console.log("📋 === PAPIER DE TRAVAIL DÉTECTÉ DANS MARKDOWN (FORMAT 3) ===");
        contentToDisplay = claraPapierTravailService.process(contentToDisplay);
      }

      metadata = { ...result, format: "direct_output" };
      delete metadata.output;
      console.log("🔍 === FIN ANALYSE (FORMAT 3) ===");
      return { content: contentToDisplay, metadata };
    }

    // Cas par défaut: Format non reconnu
    console.warn(
      "⚠️ Format de réponse n8n non reconnu. Tentative de fallback.",
    );
    contentToDisplay = `I apologize, but I received an unexpected response format from the server.\n\n**Raw Data:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
    metadata = {
      rawResponse: result,
      format: "unknown_fallback",
      warning: "Unrecognized response format",
    };
    return { content: contentToDisplay, metadata };
  }

  /**
   * Send a chat message
   */
  public async sendChatMessage(
    message: string,
    _config: ClaraAIConfig,
    attachments?: ClaraFileAttachment[],
    _systemPrompt?: string,
    _conversationHistory?: ClaraMessage[],
    _onContentChunk?: (content: string) => void,
  ): Promise<ClaraMessage> {
    // ── Router switch-case : résolution de l'endpoint ──────────────────────
    // Déclaré hors du try pour rester accessible dans le catch
    const routingInfo = this.getN8nEndpointWithInfo(message);
    const resolvedEndpoint = routingInfo.endpoint;
    
    // 🔔 AFFICHAGE SIMPLE : Console log uniquement
    console.log("═══════════════════════════════════════════════════════");
    console.log("🔀 ROUTER N8N - INFORMATION DE ROUTING");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`� Case détecté: ${routingInfo.caseName}`);
    console.log(`📍 Route: ${routingInfo.routeKey}`);
    console.log(`📍 URL: ${resolvedEndpoint}`);
    console.log("═══════════════════════════════════════════════════════");
    
    // 🔔 NOTIFICATION VISUELLE : Affichage en front-end
    addInfoNotification(
      "🔀 Router N8N",
      `${routingInfo.caseName} : ${routingInfo.routeKey}\n🌐 ${resolvedEndpoint}`,
      7000
    );

    try {

      // ── Case 5 : Database – table locale avec lien cliquable ─────────────
      // Note : Case 10 (database_endpoint) a priorité sur Case 5 dans le
      // router, donc ce bloc ne peut être atteint que si on force la
      // sentinelle SENTINEL_DATABASE manuellement (réservé à usage futur).
      if (resolvedEndpoint === this.SENTINEL_DATABASE) {
        const content =
          "| Database |\n" +
          "|----------|\n" +
          "| [Ouvrir le formulaire Database](https://n8nsqlite.zeabur.app/webhook/database) |";
        return {
          id: `${Date.now()}-database`,
          role: "assistant",
          content,
          timestamp: new Date(),
          metadata: { model: "local" },
        };
      }

      // ── Case 8 : Notification locale ─────────────────────────────────────
      if (resolvedEndpoint === this.SENTINEL_NOTIFICATION) {
        const content =
          "| Notification |\n" +
          "|--------------|\n" +
          '| Merci d\u2019ex\u00e9cuter les commandes pr\u00e9vues dans le \u00ab\u00a0Bouton d\u00e9marrer\u00a0\u00bb ou le Guide utilisateur. Le cas \u00e9ch\u00e9ant, se r\u00e9f\u00e9rer \u00e0 l\u2019\u00e9diteur de la suite E-audit. |';
        return {
          id: `${Date.now()}-notification`,
          role: "assistant",
          content,
          timestamp: new Date(),
          metadata: { model: "local" },
        };
      }

      // ── Case 21 : Lead_balance – Upload fichier Excel et traitement ──────
      if (resolvedEndpoint === this.SENTINEL_LEAD_BALANCE) {
        console.log("📊 [Lead Balance] Démarrage du processus - Déclenchement automatique");
        
        // Créer une table unicolonne avec entête "Lead_balance"
        // Le script LeadBalanceAutoTrigger.js détectera cette table automatiquement
        // et ouvrira le dialogue de sélection de fichier
        const initialContent =
          "| Lead_balance |\n" +
          "|-------------|\n" +
          "| 📂 Sélectionnez votre fichier Excel... |";
        
        // Retourner la table initiale
        // La logique d'upload sera gérée automatiquement par LeadBalanceAutoTrigger.js
        return {
          id: `${Date.now()}-lead-balance`,
          role: "assistant",
          content: initialContent,
          timestamp: new Date(),
          metadata: { 
            model: "local"
          },
        };
      }

      // ── Case 24 : États Financiers SYSCOHADA – Upload fichier Excel et traitement ──────
      if (resolvedEndpoint === this.SENTINEL_ETAT_FIN) {
        console.log("📊 [États Financiers] Démarrage du processus - Déclenchement automatique");
        
        // Créer une table unicolonne avec entête "Etat_fin"
        // Le script EtatFinAutoTrigger.js détectera cette table automatiquement
        // et ouvrira le dialogue de sélection de fichier
        const initialContent =
          "| Etat_fin |\n" +
          "|----------|\n" +
          "| 📂 Sélectionnez votre fichier Balance Excel... |";
        
        // Retourner la table initiale
        // La logique d'upload sera gérée automatiquement par EtatFinAutoTrigger.js
        return {
          id: `${Date.now()}-etat-fin`,
          role: "assistant",
          content: initialContent,
          timestamp: new Date(),
          metadata: { 
            model: "local"
          },
        };
      }

      // ── Case 44 : Editeur – Test de switch backend ──────
      if (resolvedEndpoint === this.SENTINEL_EDITEUR) {
        console.log("🧪 [Editeur] Test de switch backend - Déclenchement automatique");
        
        // Créer une table unicolonne avec entête "Editeur"
        // Le script EditeurAutoTrigger.js détectera cette table automatiquement
        // et enverra la commande au backend
        const initialContent =
          "| Editeur |\n" +
          "|----------|\n" +
          "| editeur |";
        
        // Retourner la table initiale
        // La logique de test sera gérée automatiquement par EditeurAutoTrigger.js
        return {
          id: `${Date.now()}-editeur`,
          role: "assistant",
          content: initialContent,
          timestamp: new Date(),
          metadata: { 
            model: "local",
            caseName: "Case 44",
            routeKey: "editeur"
          },
        };
      }

      // ── Case 50 : Data analyst – Échantillonnage Audit & Calcul de taille ──────
      if (resolvedEndpoint === this.SENTINEL_DATA_ANALYST) {
        console.log("🎲 [Data analyst] Démarrage du processus - Déclenchement automatique");
        
        const userMsg = message;
        
        // Déterminer la méthode d'échantillonnage
        let method = "random";
        let methodLabel = "Aléatoire simple";
        let emoji = "🎲";
        
        if (userMsg.includes("Systématique") || userMsg.includes("systématique")) {
          method = "systematic";
          methodLabel = "Systématique";
          emoji = "📏";
        } else if (userMsg.includes("Monétaire") || userMsg.includes("monétaire") || userMsg.includes("MUS") || userMsg.includes("mus")) {
          method = "monetary";
          methodLabel = "Monétaire (MUS)";
          emoji = "💰";
        } else if (userMsg.includes("Stratifié") || userMsg.includes("stratifié")) {
          method = "stratified";
          methodLabel = "Stratifié";
          emoji = "📊";
        } else if (userMsg.includes("Enregistrements fixes") || userMsg.includes("enregistrements fixes") || userMsg.includes("Enregistrement fixe") || userMsg.includes("enregistrement fixe")) {
          method = "fixed";
          methodLabel = "Enregistrements fixes";
          emoji = "📌";
        } else if (userMsg.includes("Avec remise") || userMsg.includes("avec remise")) {
          method = "with_replacement";
          methodLabel = "Avec remise";
          emoji = "🔄";
        } else if (userMsg.includes("Calculer taille") || userMsg.includes("calculer taille")) {
          method = "calculate-size";
          methodLabel = "Calculer taille échantillon";
          emoji = "📐";
        }

        // Extraire la taille d'échantillon depuis [Nb lignes] si présente
        const nbLignesMatch = userMsg.match(/\[Nb lignes\]\s*=\s*(\d+)/i) || 
                              userMsg.match(/Nb lignes\s*[=:]\s*(\d+)/i);
        const sampleSizeHint = nbLignesMatch ? parseInt(nbLignesMatch[1], 10) : null;
        
        // Extraire la colonne cible depuis [Colonne cible] si présente
        const colonneCibleMatch = userMsg.match(/\[Colonne cible\]\s*=\s*([^\[\n]+)/i) || 
                                   userMsg.match(/Colonne cible\s*[=:]\s*([^\[\n]+)/i);
        const colonneCibleHint = colonneCibleMatch ? colonneCibleMatch[1].trim() : null;

        // Extraire l'intervalle si présent (pour systématique)
        const intervalMatch = userMsg.match(/\[Intervalle\]\s*=\s*(\d+)/i) || 
                             userMsg.match(/Intervalle\s*[=:]\s*(\d+)/i);
        const intervalHint = intervalMatch ? parseInt(intervalMatch[1], 10) : null;

        // Extraire les indices d'enregistrements fixes si présents (format [0, 5, 10])
        const fixedMatch = userMsg.match(/\[Enregistrements fixes\]\s*=\s*\[([^\]]+)\]/i) || 
                           userMsg.match(/Enregistrements fixes\s*[=:]\s*\[([^\]]+)\]/i);
        const fixedRecordsHint = fixedMatch ? fixedMatch[1].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : null;
        
        // Construire le texte des paramètres pour l'affichage initial
        let paramsText = "";
        if (method === "systematic" && intervalHint) {
          paramsText += ` · Intervalle: ${intervalHint}`;
        }
        if (sampleSizeHint) {
          paramsText += ` · ${sampleSizeHint} lignes`;
        }
        if (colonneCibleHint) {
          paramsText += ` · Colonne: ${colonneCibleHint}`;
        }
        if (method === "fixed" && fixedRecordsHint) {
          paramsText += ` · Indices: [${fixedRecordsHint.join(', ')}]`;
        }
        
        const initialContent =
          "| Data analyst |\n" +
          "|--------------|\n" +
          `| ${emoji} ${methodLabel}${paramsText} · 📂 Sélectionnez votre fichier Excel... |`;
        
        return {
          id: `${Date.now()}-data-analyst`,
          role: "assistant",
          content: initialContent,
          timestamp: new Date(),
          metadata: { 
            model: "local",
            caseName: "Case 50",
            routeKey: "data_analyst_aleatoire_simple",
            method: method,
            sampleSize: sampleSizeHint,
            interval: intervalHint,
            fixedRecords: fixedRecordsHint,
            monetaryColumn: colonneCibleHint
          },
        };
      }

      // ── Cases 35-43 : Templates de tables – Génération locale ──────
      if (resolvedEndpoint === this.SENTINEL_TEMPLATE_TABLE) {
        console.log(`📋 [Template Table] Génération du template - ${routingInfo.caseName}`);
        
        const templateContent = this.generateTemplateTable(routingInfo.routeKey, message);
        
        return {
          id: `${Date.now()}-template-table`,
          role: "assistant",
          content: templateContent,
          timestamp: new Date(),
          metadata: { 
            model: "local"
          },
        };
      }

      // ── Appel HTTP vers n8n ───────────────────────────────────────────────
      console.log(
        "🚀 Envoi de la requête vers n8n endpoint:",
        resolvedEndpoint,
      );
      console.log("📝 Message original:", message);
      console.log("📎 Attachments:", attachments?.length || 0);
      console.log("⏱️ Timeout configuré:", this.n8nTimeout / 1000, "secondes");

      // Build structured payload for n8n
      let requestBody: any;

      if (attachments && attachments.length > 0) {
        // Use the new structured format when attachments are present
        const structuredData = claraAttachmentService.formatDataForN8nStructured(message, attachments);
        requestBody = { data: structuredData };
        console.log("📦 Structured payload for n8n:", JSON.stringify(requestBody, null, 2));
      } else {
        // Simple message without attachments - adapt field name based on endpoint
        if (resolvedEndpoint.includes("methodo_audit")) {
          requestBody = { output: message };
          console.log("📝 Using 'output' field for methodo_audit endpoint");
        } else {
          requestBody = { question: message };
        }
      }
      
      // 🔍 LOG DÉTAILLÉ: Message envoyé à n8n
      console.log("═══════════════════════════════════════════════════════");
      console.log("📤 MESSAGE ENVOYÉ À N8N");
      console.log("═══════════════════════════════════════════════════════");
      console.log("🌐 Endpoint:", resolvedEndpoint);
      console.log("📦 Request Body:", JSON.stringify(requestBody, null, 2));
      console.log("📝 Message brut:", message);
      console.log("═══════════════════════════════════════════════════════");

      // Configuration étendue pour gérer CORS et timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(
          `⏱️ Timeout atteint (${this.n8nTimeout / 1000}s), annulation de la requête...`,
        );
        controller.abort();
      }, this.n8nTimeout);

      const startTime = Date.now();

      const response = await fetch(resolvedEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Headers CORS si nécessaire
          Origin: window.location.origin,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        mode: "cors", // Explicitement demander CORS
        credentials: "omit", // Ne pas envoyer de credentials
      });

      clearTimeout(timeoutId);

      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        "📡 Statut de la réponse:",
        response.status,
        response.statusText,
      );
      console.log("⏱️ Temps de réponse:", elapsedTime, "secondes");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur HTTP:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `n8n API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
        );
      }

      const result = await response.json();
      
      // 🔍 LOG DÉTAILLÉ: Réponse reçue de n8n
      console.log("═══════════════════════════════════════════════════════");
      console.log("📥 RÉPONSE REÇUE DE N8N");
      console.log("═══════════════════════════════════════════════════════");
      console.log("📦 Réponse complète:", JSON.stringify(result, null, 2));
      console.log("🔍 Type de réponse:", typeof result);
      console.log("🔍 Est un Array?", Array.isArray(result));
      console.log("🔍 Clés principales:", result ? Object.keys(result) : "N/A");
      console.log("═══════════════════════════════════════════════════════");

      // Normaliser la réponse selon son format
      console.log("🔄 Appel de normalizeN8nResponse...");
      const { content, metadata } = this.normalizeN8nResponse(result);

      console.log(`📊 === RESULTAT NORMALISATION ===`);
      console.log(`  Contenu extrait: ${content.length} caractères`);
      console.log(`  Format détecté: ${metadata.format}`);
      console.log(`📊 === FIN RESULTAT NORMALISATION ===`);

      if (!content || content.trim() === "") {
        console.error(
          "❌❌❌ PROBLEME: Aucun contenu exploitable extrait de la réponse n8n.",
        );
      } else {
        console.log(
          "✅✅✅ Contenu extrait avec succès et prêt à être retourné via la Promise.",
        );
      }

      // Formater la réponse en tant que ClaraMessage
      const claraMessage: ClaraMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: content.trim()
          ? content
          : "I apologize, but I was unable to get a response from n8n.",
        timestamp: new Date(),
        metadata: {
          model: "n8n",
          ...metadata,
        },
      };

      console.log(
        "💬 === MESSAGE CLARA FINAL (sera retourné par la Promise) ===",
      );
      console.log("  ID:", claraMessage.id);
      console.log("  Content length:", claraMessage.content.length);
      console.log("  Content preview:", claraMessage.content.substring(0, 200));
      console.log("💬 === FIN MESSAGE CLARA ===");

      return claraMessage;
    } catch (error) {
      console.error("❌ n8n chat execution failed:", error);
      const err = error as Error;
      console.error("📊 Détails de l'erreur:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      // Analyser le type d'erreur
      let errorMessage =
        "I apologize, but I encountered an error while processing your request with n8n.";
      let troubleshootingTips = "";

      if (err.name === "AbortError") {
        const timeoutMinutes = Math.floor(this.n8nTimeout / 60000);
        const timeoutSeconds = Math.floor((this.n8nTimeout % 60000) / 1000);
        const timeoutDisplay =
          timeoutMinutes > 0
            ? `${timeoutMinutes} minute${timeoutMinutes > 1 ? "s" : ""}${timeoutSeconds > 0 ? ` ${timeoutSeconds}s` : ""}`
            : `${timeoutSeconds} secondes`;

        // Message de notification système en cas de timeout
        errorMessage = `## Notification système\n\n⏱️ **Délai d'attente dépassé** (>${timeoutDisplay})\n\n`;
        errorMessage += `Nous sommes en surcharge de requêtes.\n\n`;
        errorMessage += `**Merci de notifier l'événement à l'éditeur par WhatsApp :**\n\n`;
        errorMessage += `📱 **+225 05 44 13 07 98**\n\n`;
        errorMessage += `---\n\n`;
        errorMessage += `### Informations techniques\n\n`;
        errorMessage += `| Rubrique | Description |\n`;
        errorMessage += `|----------|-------------|\n`;
        errorMessage += `| **Endpoint** | ${resolvedEndpoint} |\n`;
        errorMessage += `| **Timeout configuré** | ${timeoutDisplay} |\n`;
        errorMessage += `| **Type d'erreur** | Délai d'attente dépassé |\n`;
        
        troubleshootingTips = "";
      } else if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        errorMessage = "🌐 Network error: Unable to connect to n8n endpoint.";
        troubleshootingTips = `\n\n**Troubleshooting:**\n1. **CORS Issue**: Ensure n8n webhook has CORS enabled\n2. **Endpoint URL**: Verify endpoint is accessible: \`${resolvedEndpoint}\`\n3. **Network**: Check your internet connection\n4. **n8n Status**: Verify n8n workflow is active\n\n**Technical Details:**\n- Endpoint: \`${resolvedEndpoint}\`\n- Error: \`${err.message}\`\n\n**To Fix CORS in n8n:**\n- In your webhook node, set "Respond" > "Options" > "Response Headers"\n- Add header: \`Access-Control-Allow-Origin\` = \`*\` (or your domain)\n- Add header: \`Access-Control-Allow-Methods\` = \`POST, OPTIONS\`\n- Add header: \`Access-Control-Allow-Headers\` = \`Content-Type\``;
      } else if (err.message.includes("404")) {
        errorMessage =
          "🔍 Endpoint not found: The n8n webhook URL may be incorrect.";
        troubleshootingTips = `\n\n**Check:**\n- Workflow is activated in n8n\n- Webhook path is correct: \`${resolvedEndpoint}\``;
      } else if (
        err.message.includes("500") ||
        err.message.includes("502") ||
        err.message.includes("503")
      ) {
        errorMessage =
          "⚠️ Server error: The n8n workflow encountered an internal error.";
        troubleshootingTips =
          "\n\n**Check n8n workflow:**\n- Review workflow execution logs\n- Verify all nodes are properly configured\n- Check for error messages in n8n";
      }

      return {
        id: `${Date.now()}-error`,
        role: "assistant",
        content: `${errorMessage}${troubleshootingTips}\n\nPlease try again or contact support if the issue persists.`,
        timestamp: new Date(),
        metadata: {
          error: `${err.message} (endpoint: ${resolvedEndpoint})`,
          errorType: err.name,
        },
      };
    }
  }

  // Delegate provider-related methods to claraProviderService
  public async getProviders(): Promise<ClaraProvider[]> {
    return claraProviderService.getProviders();
  }

  public async getModels(providerId?: string): Promise<ClaraModel[]> {
    return claraProviderService.getModels(providerId);
  }

  public async getCurrentProviderModels(): Promise<ClaraModel[]> {
    return claraProviderService.getCurrentProviderModels();
  }

  public async getPrimaryProvider(): Promise<ClaraProvider | null> {
    return claraProviderService.getPrimaryProvider();
  }

  public async setPrimaryProvider(providerId: string): Promise<void> {
    return claraProviderService.setPrimaryProvider(providerId);
  }

  public updateProvider(provider: ClaraProvider): void {
    return claraProviderService.updateProvider(provider);
  }

  public async healthCheck(): Promise<boolean> {
    return claraProviderService.healthCheck();
  }

  public async testProvider(provider: ClaraProvider): Promise<boolean> {
    return claraProviderService.testProvider(provider);
  }

  public getCurrentClient() {
    return claraProviderService.getCurrentClient();
  }

  public getCurrentProvider(): ClaraProvider | null {
    return claraProviderService.getCurrentProvider();
  }

  /**
   * Stop the current chat generation
   */
  public stop(): void {
    this.stopExecution = true;
    claraAgentService.stop();
    const client = claraProviderService.getCurrentClient() as any;
    if (client && typeof client.abortStream === "function") {
      client.abortStream();
      console.log("Stream aborted successfully");
    }
  }

  /**
   * Preload/warm up a model
   */
  public async preloadModel(
    config: ClaraAIConfig,
    conversationHistory?: ClaraMessage[],
  ): Promise<void> {
    const client = claraProviderService.getCurrentClient();
    if (!client || !config.models.text) return;

    const currentProvider = claraProviderService.getCurrentProvider();
    const isLocalProvider = claraModelService.isLocalProvider(
      config,
      currentProvider?.baseUrl,
    );
    if (!isLocalProvider) return;

    let modelId = claraModelService.selectAppropriateModel(
      config,
      "",
      [],
      conversationHistory,
    );
    modelId = claraModelService.extractModelId(modelId);

    await claraChatService.preloadModel(
      client,
      modelId,
      config,
      isLocalProvider,
    );
  }

  /**
   * Record a successful tool execution
   */
  public recordToolSuccess(
    toolName: string,
    toolDescription: string,
    toolCallId?: string,
  ): void {
    const currentProvider = claraProviderService.getCurrentProvider();
    claraToolService.recordToolSuccess(
      toolName,
      toolDescription,
      currentProvider?.id || "unknown",
      toolCallId,
    );
  }

  /**
   * Clear incorrectly blacklisted tools
   */
  public clearBlacklistedTools(): void {
    const currentProvider = claraProviderService.getCurrentProvider();
    const client = claraProviderService.getCurrentClient();
    if (currentProvider && client) {
      claraToolService.clearBlacklistedTools(currentProvider.id, client);
      addInfoNotification(
        "Tools Reset",
        `Cleared incorrectly blacklisted tools for ${currentProvider.name}.`,
        8000,
      );
    }
  }
}

// Export singleton instance
export const claraApiService = new ClaraApiService();
