/**
 * CLARAVERSE - AUTO-FIX UNIFIÉ
 * Script de réparation automatique pour tous les problèmes de restauration
 * Version: 1.0.0
 *
 * UTILISATION:
 * - Dans la console: autoFixClaraVerse()
 * - Par URL: ajouter #auto-fix
 * - Par raccourci: Ctrl + Alt + F
 */

class ClaraVerseAutoFix {
  constructor() {
    this.version = "1.0.0";
    this.logPrefix = "[AutoFix]";
    this.phase = "initialisation";
    this.progression = 0;
    this.maxPhases = 8;

    this.stats = {
      startTime: Date.now(),
      donneesAnalysees: 0,
      donneesCorrigees: 0,
      cellulesRestaurees: 0,
      erreursCorrigees: 0,
      tempsTotal: 0,
    };

    this.notifications = [];
    this.progressBar = null;
  }

  log(message, type = "info", details = null) {
    const timestamp = new Date().toLocaleTimeString();
    const styles = {
      info: "color: #3b82f6; background: #dbeafe; border-left: 3px solid #3b82f6",
      success:
        "color: #059669; background: #d1fae5; border-left: 3px solid #10b981",
      warning:
        "color: #d97706; background: #fef3c7; border-left: 3px solid #f59e0b",
      error:
        "color: #dc2626; background: #fee2e2; border-left: 3px solid #ef4444",
      phase:
        "color: #7c3aed; background: #ede9fe; border-left: 3px solid #8b5cf6; font-weight: bold",
    };

    console.log(
      `%c${this.logPrefix} [${this.phase.toUpperCase()}] ${message}`,
      `padding: 4px 8px; ${styles[type] || styles.info}`,
    );

    if (details) {
      console.log("📊 Détails:", details);
    }

    // Mettre à jour la notification en temps réel
    this.updateRealTimeNotification(message, type);
  }

  async executerAutoFix() {
    try {
      this.log("🚀 DÉMARRAGE AUTO-FIX CLARAVERSE", "phase");
      this.log(
        `Version ${this.version} - Réparation automatique complète`,
        "info",
      );

      this.createProgressInterface();

      // Attendre que l'interface soit créée
      await this.delai(100);

      // Phase 1: Vérification système
      await this.phase1_VerificationSysteme();

      // Phase 2: Diagnostic des problèmes
      await this.phase2_DiagnosticProblemes();

      // Phase 3: Nettoyage des données
      await this.phase3_NettoyageDonnees();

      // Phase 4: Réparation des IDs
      await this.phase4_ReparationIDs();

      // Phase 5: Restauration forcée
      await this.phase5_RestaurationForcee();

      // Phase 6: Vérification cohérence
      await this.phase6_VerificationCoherence();

      // Phase 7: Optimisation finale
      await this.phase7_OptimisationFinale();

      // Phase 8: Rapport final
      await this.phase8_RapportFinal();

      return this.genererRapportSucces();
    } catch (error) {
      this.log(`💥 ERREUR CRITIQUE: ${error.message}`, "error");
      this.showErrorInterface(error);
      return { success: false, error: error.message };
    }
  }

  async phase1_VerificationSysteme() {
    this.updatePhase("Vérification Système", 1);

    // Vérifier ClaraVerse API
    if (!window.ClaraVerse?.TablePersistence) {
      throw new Error("API ClaraVerse non disponible - Rechargez la page");
    }

    // Vérifier IndexedDB
    if (!window.ClaraVerse.TablePersistence.db) {
      throw new Error(
        "IndexedDB non initialisé - Attendez le chargement complet",
      );
    }

    // Test de connectivité base
    try {
      await window.ClaraVerse.TablePersistence.db.getAll();
    } catch (e) {
      throw new Error(`Erreur accès IndexedDB: ${e.message}`);
    }

    this.log("✅ Système vérifié - APIs disponibles", "success");
    await this.delai(500);
  }

  async phase2_DiagnosticProblemes() {
    this.updatePhase("Diagnostic Approfondi", 2);

    // Analyser IndexedDB
    const allData = await window.ClaraVerse.TablePersistence.db.getAll();
    this.stats.donneesAnalysees = allData.length;

    this.log(`🔍 ${allData.length} entrées trouvées en base`, "info");

    // Analyser la qualité des données
    const dataQuality = {
      valides: allData.filter(
        (d) =>
          (d.content || d.text) &&
          d.content !== "undefined" &&
          d.text !== "undefined",
      ),
      corrompues: allData.filter(
        (d) => d.content === "undefined" || d.text === "undefined",
      ),
      vides: allData.filter((d) => !d.content && !d.text),
      sansId: allData.filter((d) => !d.cellId),
    };

    // Analyser les cellules DOM
    const editableCells = document.querySelectorAll(
      'td[contenteditable="true"], th[contenteditable="true"]',
    );
    const cellAnalysis = {
      total: editableCells.length,
      avecId: Array.from(editableCells).filter((c) => c.dataset.cellId).length,
      avecContenu: Array.from(editableCells).filter((c) =>
        c.textContent?.trim(),
      ).length,
      vides: Array.from(editableCells).filter((c) => !c.textContent?.trim())
        .length,
    };

    this.problemes = {
      donneesCorrempues: dataQuality.corrompues.length,
      cellulesVidesAvecDonnees: Math.max(
        0,
        dataQuality.valides.length - cellAnalysis.avecContenu,
      ),
      correspondancesManquees: Math.abs(
        dataQuality.valides.length - cellAnalysis.avecContenu,
      ),
      idsSansCorrespondance: dataQuality.sansId.length,
    };

    this.log(`📊 Problèmes détectés:`, "warning", this.problemes);
    await this.delai(800);
  }

  async phase3_NettoyageDonnees() {
    this.updatePhase("Nettoyage des Données", 3);

    const allData = await window.ClaraVerse.TablePersistence.db.getAll();
    let nettoyees = 0;

    for (const item of allData) {
      let needsCleaning = false;
      let shouldDelete = false;

      // Identifier les données à nettoyer
      if (item.content === "undefined") {
        delete item.content;
        needsCleaning = true;
      }
      if (item.text === "undefined") {
        delete item.text;
        needsCleaning = true;
      }

      // Supprimer les entrées complètement vides
      if (!item.content && !item.text) {
        await window.ClaraVerse.TablePersistence.db.remove(item.cellId);
        shouldDelete = true;
        nettoyees++;
      } else if (needsCleaning) {
        // Mettre à jour les données nettoyées
        await window.ClaraVerse.TablePersistence.db.set(item.cellId, item);
        nettoyees++;
      }
    }

    this.stats.donneesCorrigees = nettoyees;
    this.log(`🧹 ${nettoyees} entrées nettoyées/supprimées`, "success");
    await this.delai(600);
  }

  async phase4_ReparationIDs() {
    this.updatePhase("Réparation des IDs", 4);

    const editableCells = document.querySelectorAll(
      'td[contenteditable="true"], th[contenteditable="true"]',
    );
    const allData = await window.ClaraVerse.TablePersistence.db.getAll();
    const validData = allData.filter((d) => (d.content || d.text) && d.cellId);

    let idsRepares = 0;

    // Réparer les cellules sans ID qui ont du contenu correspondant
    for (const cell of editableCells) {
      if (cell.dataset.cellId) continue; // Déjà un ID

      const cellContent = cell.textContent?.trim();
      if (!cellContent) continue;

      // Chercher une donnée correspondante
      const matchingData = validData.find((data) => {
        const dataContent = (data.content || data.text || "").trim();
        return (
          dataContent === cellContent ||
          (dataContent.length > 10 &&
            cellContent.length > 10 &&
            this.calculateSimilarity(dataContent, cellContent) > 0.8)
        );
      });

      if (matchingData) {
        cell.dataset.cellId = matchingData.cellId;
        idsRepares++;

        // Effet visuel
        cell.style.border = "2px solid #10b981";
        setTimeout(() => (cell.style.border = ""), 1000);
      }
    }

    this.log(`🔧 ${idsRepares} IDs réparés`, "success");
    await this.delai(400);
  }

  async phase5_RestaurationForcee() {
    this.updatePhase("Restauration Forcée", 5);

    const editableCells = document.querySelectorAll(
      'td[contenteditable="true"], th[contenteditable="true"]',
    );
    const allData = await window.ClaraVerse.TablePersistence.db.getAll();
    const validData = allData.filter(
      (d) =>
        (d.content || d.text) &&
        d.content !== "undefined" &&
        d.text !== "undefined",
    );

    let restaurees = 0;
    const usedData = new Set();

    // Stratégie de restauration multi-niveaux
    for (const cell of editableCells) {
      if (cell.textContent?.trim()) continue; // Déjà du contenu

      let matchedData = null;

      // Stratégie 1: Correspondance par ID exact
      if (cell.dataset.cellId) {
        matchedData = validData.find(
          (d) => d.cellId === cell.dataset.cellId && !usedData.has(d.cellId),
        );
      }

      // Stratégie 2: Correspondance par position dans la table
      if (!matchedData) {
        matchedData = this.findDataByPosition(cell, validData, usedData);
      }

      // Stratégie 3: Correspondance par contexte de table
      if (!matchedData) {
        matchedData = this.findDataByTableContext(cell, validData, usedData);
      }

      // Appliquer la restauration
      if (matchedData) {
        await this.appliquerRestauration(cell, matchedData);
        usedData.add(matchedData.cellId);
        restaurees++;

        // Animation progressive
        if (restaurees % 5 === 0) {
          await this.delai(50); // Petite pause pour voir l'animation
        }
      }
    }

    this.stats.cellulesRestaurees = restaurees;
    this.log(`🔄 ${restaurees} cellules restaurées avec succès`, "success");
    await this.delai(800);
  }

  async phase6_VerificationCoherence() {
    this.updatePhase("Vérification Cohérence", 6);

    // Recompter après restauration
    const editableCells = document.querySelectorAll(
      'td[contenteditable="true"], th[contenteditable="true"]',
    );
    const allData = await window.ClaraVerse.TablePersistence.db.getAll();

    const verification = {
      cellulesTotal: editableCells.length,
      cellulesAvecContenu: Array.from(editableCells).filter((c) =>
        c.textContent?.trim(),
      ).length,
      cellulesAvecId: Array.from(editableCells).filter((c) => c.dataset.cellId)
        .length,
      donneesValides: allData.filter(
        (d) => (d.content || d.text) && d.content !== "undefined",
      ).length,
    };

    // Calculer le taux de réussite
    const tauxReussite = Math.round(
      (verification.cellulesAvecContenu / verification.cellulesTotal) * 100,
    );

    this.verification = { ...verification, tauxReussite };
    this.log(
      `📊 Cohérence: ${tauxReussite}% des cellules ont du contenu`,
      tauxReussite > 80 ? "success" : "warning",
      verification,
    );

    await this.delai(500);
  }

  async phase7_OptimisationFinale() {
    this.updatePhase("Optimisation Finale", 7);

    // Optimiser les événements de sauvegarde
    let optimisations = 0;

    // Réattacher les événements aux cellules restaurées
    const editableCells = document.querySelectorAll(
      'td[contenteditable="true"], th[contenteditable="true"]',
    );

    for (const cell of editableCells) {
      if (cell.textContent?.trim() && !cell.dataset.eventsAttached) {
        // Réattacher les événements de sauvegarde automatique
        this.attachSaveEvents(cell);
        optimisations++;
      }
    }

    // Déclencher un événement global de synchronisation
    const syncEvent = new CustomEvent("claraverse:auto-fix:complete", {
      detail: {
        stats: this.stats,
        verification: this.verification,
        timestamp: Date.now(),
      },
    });
    document.dispatchEvent(syncEvent);

    this.log(`⚡ ${optimisations} cellules optimisées`, "success");
    await this.delai(300);
  }

  async phase8_RapportFinal() {
    this.updatePhase("Rapport Final", 8);

    this.stats.tempsTotal = Date.now() - this.stats.startTime;

    const rapport = {
      statut:
        this.verification.tauxReussite > 90
          ? "EXCELLENT"
          : this.verification.tauxReussite > 70
            ? "BON"
            : this.verification.tauxReussite > 50
              ? "MOYEN"
              : "PROBLÉMATIQUE",
      stats: this.stats,
      verification: this.verification,
      recommandations: this.genererRecommandations(),
    };

    this.log("🎯 AUTO-FIX TERMINÉ!", "phase");
    this.log(
      `Statut: ${rapport.statut}`,
      rapport.statut === "EXCELLENT" ? "success" : "warning",
    );
    this.log(
      `Temps total: ${Math.round(this.stats.tempsTotal / 1000)}s`,
      "info",
    );

    await this.delai(500);
    this.showSuccessInterface(rapport);

    return rapport;
  }

  // Méthodes utilitaires

  findDataByPosition(cell, validData, usedData) {
    const table = cell.closest("table");
    if (!table) return null;

    const row = cell.closest("tr");
    const rowIndex = Array.from(table.querySelectorAll("tr")).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(cell);

    return validData.find((data) => {
      if (usedData.has(data.cellId)) return false;

      const match = data.cellId.match(/cell_(\d+)$/);
      if (match) {
        const dataCellIndex = parseInt(match[1]);
        return Math.abs(dataCellIndex - cellIndex) <= 1;
      }
      return false;
    });
  }

  findDataByTableContext(cell, validData, usedData) {
    return validData.find((data) => {
      if (usedData.has(data.cellId)) return false;
      return data.cellId.includes("table_") && (data.content || data.text);
    });
  }

  async appliquerRestauration(cell, data) {
    const content = data.content || data.text;

    if (data.content && data.content !== "undefined") {
      cell.innerHTML = data.content;
    } else if (data.text && data.text !== "undefined") {
      cell.textContent = data.text;
    }

    if (!cell.dataset.cellId) {
      cell.dataset.cellId = data.cellId;
    }

    // Animation de restauration
    cell.style.backgroundColor = "#dcfce7";
    cell.style.transform = "scale(1.05)";
    cell.style.transition = "all 0.3s ease";

    setTimeout(() => {
      cell.style.backgroundColor = "";
      cell.style.transform = "";
    }, 800);
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
      .fill()
      .map(() => Array(str1.length + 1).fill(0));
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost,
        );
      }
    }
    return matrix[str2.length][str1.length];
  }

  attachSaveEvents(cell) {
    if (cell.dataset.eventsAttached) return;

    cell.addEventListener("blur", async () => {
      const cellId = cell.dataset.cellId;
      if (cellId && window.ClaraVerse?.TablePersistence?.db) {
        const data = {
          cellId,
          content: cell.innerHTML,
          text: cell.textContent,
          timestamp: Date.now(),
        };
        await window.ClaraVerse.TablePersistence.db.set(cellId, data);
      }
    });

    cell.dataset.eventsAttached = "true";
  }

  genererRecommandations() {
    const recommandations = [];

    if (this.verification.tauxReussite < 90) {
      recommandations.push("Relancer la restauration dans quelques minutes");
    }

    if (this.stats.donneesCorrigees > 10) {
      recommandations.push("Surveiller la qualité des données sauvegardées");
    }

    if (
      this.verification.cellulesAvecId <
      this.verification.cellulesTotal * 0.8
    ) {
      recommandations.push("Vérifier le système d'attribution des IDs");
    }

    return recommandations;
  }

  // Interface utilisateur

  updatePhase(nom, numero) {
    this.phase = nom;
    this.progression = (numero / this.maxPhases) * 100;

    if (this.progressBar && this.progressBar.parentElement) {
      this.progressBar.style.width = `${this.progression}%`;

      const phaseNameEl =
        this.progressBar.parentElement.querySelector(".phase-name");
      if (phaseNameEl) {
        phaseNameEl.textContent = nom;
      }

      const phasePercentEl =
        this.progressBar.parentElement.querySelector(".phase-percent");
      if (phasePercentEl) {
        phasePercentEl.textContent = `${Math.round(this.progression)}%`;
      }
    }
  }

  createProgressInterface() {
    const existing = document.getElementById("claraverse-autofix-ui");
    if (existing) existing.remove();

    const ui = document.createElement("div");
    ui.id = "claraverse-autofix-ui";
    ui.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      z-index: 20000;
      font-family: 'Segoe UI', Arial, sans-serif;
      text-align: center;
      min-width: 400px;
      backdrop-filter: blur(10px);
    `;

    ui.innerHTML = `
      <div style="font-size: 32px; margin-bottom: 15px;">🛠️</div>
      <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 300;">ClaraVerse Auto-Fix</h2>
      <div class="phase-name" style="font-size: 16px; margin-bottom: 20px; opacity: 0.9;">Initialisation...</div>

      <div style="background: rgba(255,255,255,0.2); border-radius: 25px; height: 8px; margin-bottom: 15px; overflow: hidden;">
        <div class="progress-bar" style="height: 100%; background: #10b981; width: 0%; transition: width 0.5s ease; border-radius: 25px;"></div>
      </div>

      <div class="phase-percent" style="font-size: 14px; opacity: 0.8;">0%</div>
      <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">Ne fermez pas cette fenêtre</div>
    `;

    document.body.appendChild(ui);
    this.progressBar = ui.querySelector(".progress-bar");
  }

  updateRealTimeNotification(message, type) {
    // Notification en temps réel dans l'interface
    const ui = document.getElementById("claraverse-autofix-ui");
    if (!ui) return;

    let notification = ui.querySelector(".realtime-notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.className = "realtime-notification";
      notification.style.cssText = `
        font-size: 12px;
        background: rgba(255,255,255,0.1);
        padding: 8px 12px;
        border-radius: 20px;
        margin-top: 15px;
        opacity: 0.8;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      `;
      ui.appendChild(notification);
    }

    if (notification) {
      notification.textContent = message;

      // Couleur selon le type
      const colors = {
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      };

      if (colors[type]) {
        notification.style.borderLeft = `3px solid ${colors[type]}`;
      }
    }
  }

  showSuccessInterface(rapport) {
    const ui = document.getElementById("claraverse-autofix-ui");
    if (!ui) return;

    ui.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    ui.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
      <h2 style="margin: 0 0 15px 0; font-size: 28px;">Réparation Terminée!</h2>

      <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
          <div><strong>${this.stats.cellulesRestaurees}</strong><br>Cellules restaurées</div>
          <div><strong>${this.stats.donneesCorrigees}</strong><br>Données corrigées</div>
          <div><strong>${this.verification.tauxReussite}%</strong><br>Taux de réussite</div>
          <div><strong>${Math.round(this.stats.tempsTotal / 1000)}s</strong><br>Temps total</div>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-size: 18px; font-weight: 600; color: #f0fdf4;">STATUT: ${rapport.statut}</div>
        ${
          rapport.recommandations.length > 0
            ? `<div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">• ${rapport.recommandations[0]}</div>`
            : '<div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Système entièrement opérationnel</div>'
        }
      </div>

      <div style="display: flex; gap: 10px;">
        <button onclick="location.reload()" style="flex: 1; background: rgba(255,255,255,0.2); border: none; color: white; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px;">
          🔄 Recharger
        </button>
        <button onclick="this.parentElement.parentElement.remove()" style="flex: 1; background: rgba(255,255,255,0.2); border: none; color: white; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px;">
          ✨ Fermer
        </button>
      </div>
    `;

    // Auto-fermeture après 30 secondes
    setTimeout(() => {
      if (ui.parentElement) {
        ui.style.opacity = "0";
        ui.style.transform = "translate(-50%, -50%) scale(0.8)";
        setTimeout(() => ui.remove(), 300);
      }
    }, 30000);
  }

  showErrorInterface(error) {
    const ui = document.getElementById("claraverse-autofix-ui");
    if (!ui) return;

    ui.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    ui.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
      <h2 style="margin: 0 0 15px 0; font-size: 24px;">Erreur Auto-Fix</h2>

      <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; text-align: left;">
        <strong>Erreur:</strong><br>
        ${error.message}
      </div>

      <div style="font-size: 12px; margin-bottom: 20px; opacity: 0.8;">
        Solutions possibles:<br>
        • Recharger la page et réessayer<br>
        • Vérifier la console développeur<br>
        • Contactez le support technique
      </div>

      <div style="display: flex; gap: 10px;">
        <button onclick="location.reload()" style="flex: 1; background: rgba(255,255,255,0.2); border: none; color: white; padding: 12px; border-radius: 8px; cursor: pointer;">
          🔄 Recharger
        </button>
        <button onclick="this.parentElement.parentElement.remove()" style="flex: 1; background: rgba(255,255,255,0.2); border: none; color: white; padding: 12px; border-radius: 8px; cursor: pointer;">
          ✕ Fermer
        </button>
      </div>
    `;
  }

  genererRapportSucces() {
    return {
      success: true,
      statut:
        this.verification.tauxReussite > 90
          ? "EXCELLENT"
          : this.verification.tauxReussite > 70
            ? "BON"
            : "MOYEN",
      stats: this.stats,
      verification: this.verification,
      message: `Auto-Fix terminé: ${this.stats.cellulesRestaurees} cellules restaurées (${this.verification.tauxReussite}%)`,
    };
  }

  async delai(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// INTERFACE GLOBALE
window.autoFixClaraVerse = async function () {
  console.log("🚀 CLARAVERSE AUTO-FIX - Démarrage...");

  try {
    const autoFix = new ClaraVerseAutoFix();
    return await autoFix.executerAutoFix();
  } catch (error) {
    console.error("💥 Erreur Auto-Fix:", error);
    return { success: false, error: error.message };
  }
};

// INTERFACES SPÉCIALISÉES
window.ClaraVerseAutoFix = {
  // Réparation complète
  async fix() {
    return await window.autoFixClaraVerse();
  },

  // Réparation rapide (version light)
  async quickFix() {
    console.log("⚡ Auto-Fix Rapide...");

    try {
      // Juste restauration + nettoyage
      const cleaned = (await window.ClaraVerseForceRestore?.clean()) || 0;
      const restored = (await window.ClaraVerseForceRestore?.restore()) || {
        stats: { restoredCells: 0 },
      };

      return {
        success: true,
        message: `Fix rapide: ${restored.stats?.restoredCells || 0} cellules restaurées, ${cleaned} données nettoyées`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Diagnostic seulement
  async diagnose() {
    console.log("🔍 Diagnostic Auto-Fix...");

    try {
      const autoFix = new ClaraVerseAutoFix();
      await autoFix.phase1_VerificationSysteme();
      await autoFix.phase2_DiagnosticProblemes();

      return {
        success: true,
        problemes: autoFix.problemes,
        stats: autoFix.stats,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// AUTO-INITIALISATION
document.addEventListener("DOMContentLoaded", () => {
  // Attendre que tous les scripts soient chargés
  setTimeout(() => {
    try {
      // Messages d'aide
      console.log("🔧 ClaraVerse Auto-Fix v1.0.0 chargé");
      console.log("📋 Commandes disponibles:");
      console.log("   • autoFixClaraVerse() - Réparation complète");
      console.log("   • window.ClaraVerseAutoFix.fix() - Réparation complète");
      console.log(
        "   • window.ClaraVerseAutoFix.quickFix() - Réparation rapide",
      );
      console.log(
        "   • window.ClaraVerseAutoFix.diagnose() - Diagnostic seulement",
      );

      // Vérifier si auto-fix demandé par URL
      if (window.location.hash === "#auto-fix") {
        console.log("🚨 Auto-Fix automatique déclenché par URL");
        setTimeout(() => {
          if (typeof window.autoFixClaraVerse === "function") {
            window.autoFixClaraVerse().catch(console.error);
          }
        }, 2000);
      }

      // Vérifier si quick-fix demandé
      if (window.location.hash === "#quick-fix") {
        console.log("⚡ Quick-Fix automatique déclenché par URL");
        setTimeout(() => {
          if (window.ClaraVerseAutoFix?.quickFix) {
            window.ClaraVerseAutoFix.quickFix().catch(console.error);
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur initialisation Auto-Fix:", error);
    }
  }, 1000);
});

// RACCOURCIS CLAVIER
document.addEventListener("keydown", (e) => {
  // Ctrl + Alt + F = Auto-Fix complet
  if (e.ctrlKey && e.altKey && e.key === "F") {
    e.preventDefault();
    console.log("🚨 Auto-Fix déclenché par raccourci clavier (Ctrl+Alt+F)");
    window.autoFixClaraVerse();
  }

  // Ctrl + Alt + Q = Quick Fix
  if (e.ctrlKey && e.altKey && e.key === "Q") {
    e.preventDefault();
    console.log("⚡ Quick-Fix déclenché par raccourci clavier (Ctrl+Alt+Q)");
    window.ClaraVerseAutoFix.quickFix();
  }

  // Ctrl + Alt + D = Diagnostic
  if (e.ctrlKey && e.altKey && e.key === "D") {
    e.preventDefault();
    console.log("🔍 Diagnostic déclenché par raccourci clavier (Ctrl+Alt+D)");
    window.ClaraVerseAutoFix.diagnose();
  }
});

// NOTIFICATION DE PROBLÈME AUTOMATIQUE
setTimeout(() => {
  // Vérifier s'il y a un problème évident
  if (window.ClaraVerse?.TablePersistence?.db) {
    window.ClaraVerse.TablePersistence.db
      .getAll()
      .then((data) => {
        const editableCells = document.querySelectorAll(
          'td[contenteditable="true"], th[contenteditable="true"]',
        );
        const emptyCells = Array.from(editableCells).filter(
          (c) => !c.textContent?.trim(),
        ).length;

        // Si beaucoup de données mais beaucoup de cellules vides = problème probable
        if (data.length > 50 && emptyCells > data.length * 0.3) {
          console.log(
            `⚠️ PROBLÈME DÉTECTÉ: ${data.length} données en base mais ${emptyCells} cellules vides`,
          );
          console.log(
            "💡 Suggestion: Exécuter autoFixClaraVerse() pour corriger",
          );

          // Notification discrète
          const notification = document.createElement("div");
          notification.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: #fef3c7;
          color: #92400e;
          padding: 10px 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
          font-family: Arial, sans-serif;
          font-size: 12px;
          cursor: pointer;
          border-left: 4px solid #f59e0b;
          max-width: 300px;
        `;

          notification.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 4px;">⚠️ Problème de restauration détecté</div>
          <div>${data.length} données en base, ${emptyCells} cellules vides</div>
          <div style="margin-top: 6px; font-size: 11px; opacity: 0.8;">
            Cliquez pour auto-réparer
          </div>
        `;

          notification.addEventListener("click", () => {
            notification.remove();
            window.autoFixClaraVerse();
          });

          document.body.appendChild(notification);

          // Auto-suppression après 30 secondes
          setTimeout(() => {
            if (notification.parentElement) {
              notification.remove();
            }
          }, 30000);
        }
      })
      .catch(console.warn);
  }
}, 3000);

/**
 * GUIDE D'UTILISATION RAPIDE
 *
 * COMMANDES PRINCIPALES:
 * - autoFixClaraVerse() : Réparation complète automatique
 * - window.ClaraVerseAutoFix.quickFix() : Réparation rapide
 * - window.ClaraVerseAutoFix.diagnose() : Diagnostic seulement
 *
 * RACCOURCIS CLAVIER:
 * - Ctrl + Alt + F : Auto-Fix complet
 * - Ctrl + Alt + Q : Quick Fix
 * - Ctrl + Alt + D : Diagnostic
 *
 * AUTO-DÉCLENCHEMENT PAR URL:
 * - #auto-fix : Réparation complète automatique
 * - #quick-fix : Réparation rapide automatique
 *
 * EXEMPLE D'UTILISATION:
 * ```javascript
 * // Réparation complète avec interface graphique
 * const result = await autoFixClaraVerse();
 * console.log(`Réparation: ${result.stats.cellulesRestaurees} cellules restaurées`);
 *
 * // Réparation rapide sans interface
 * const quickResult = await window.ClaraVerseAutoFix.quickFix();
 * console.log(quickResult.message);
 * ```
 */
