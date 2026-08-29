/**
 * CLARAVERSE - CORRECTION RESTAURATION
 * Script de correction spécifique pour les problèmes identifiés dans les logs
 * Corrige les correspondances manquées et les données non restaurées
 */

class CorrectionRestauration {
  constructor() {
    this.logPrefix = '[CorrectionRestauration]';
    this.problemesDetectes = [];
    this.correctionsAppliquees = [];
    this.statistiques = {
      cellulesAnalysees: 0,
      donneesCorrigees: 0,
      correspondancesCreees: 0,
      idsPrepares: 0,
      donneesNettoyees: 0
    };
  }

  log(message, type = 'info', data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const styles = {
      info: 'color: #2563eb; background: #eff6ff',
      success: 'color: #059669; background: #ecfdf5',
      warning: 'color: #d97706; background: #fffbeb',
      error: 'color: #dc2626; background: #fef2f2',
      correction: 'color: #7c3aed; background: #f5f3ff',
      problem: 'color: #dc2626; background: #fef2f2; font-weight: bold'
    };

    console.log(
      `%c${this.logPrefix} [${timestamp}] ${message}`,
      `padding: 3px 8px; border-radius: 4px; ${styles[type] || styles.info}`
    );

    if (data) {
      console.log('🔍 Détails:', data);
    }
  }

  async executerCorrectionComplete() {
    this.log('🛠️ Démarrage correction complète des problèmes de restauration', 'correction');

    try {
      // Étape 1: Diagnostic des problèmes spécifiques
      await this.diagnostiquerProblemsesSpecifiques();

      // Étape 2: Nettoyer les données corrompues
      await this.nettoyerDonneesCorrrompues();

      // Étape 3: Réparer les IDs manquants
      await this.repererIDsManquants();

      // Étape 4: Corriger les correspondances manquées
      await this.corrigerCorrespondancesManquees();

      // Étape 5: Forcer restauration des cellules vides avec données
      await this.forcerRestaurationCellulesVides();

      // Étape 6: Vérification finale
      const verification = await this.verifierCorrections();

      // Rapport final
      this.genererRapportCorrection(verification);

      return {
        success: true,
        problemes: this.problemesDetectes.length,
        corrections: this.correctionsAppliquees.length,
        statistiques: this.statistiques
      };

    } catch (error) {
      this.log(`❌ Erreur critique pendant correction: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async diagnostiquerProblemsesSpecifiques() {
    this.log('🔍 Diagnostic des problèmes spécifiques observés...', 'correction');

    // Problème 1: Cellules avec données disponibles mais non restaurées
    const editableCells = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
    const allData = await window.ClaraVerse.TablePersistence.db.getAll();

    this.statistiques.cellulesAnalysees = editableCells.length;

    for (const cell of editableCells) {
      const cellId = cell.dataset.cellId;
      const currentContent = cell.textContent?.trim() || '';

      // Chercher des données qui pourraient correspondre
      const candidateDonnees = allData.filter(item => {
        if (!item.content && !item.text) return false;
        if (item.content === 'undefined' || item.text === 'undefined') return false;

        // Correspondance par ID exact
        if (cellId && item.cellId === cellId) return true;

        // Correspondance par contenu partiel
        const itemContent = (item.content || item.text || '').trim();
        if (itemContent && currentContent &&
            (itemContent.includes(currentContent) || currentContent.includes(itemContent))) {
          return true;
        }

        return false;
      });

      if (candidateDonnees.length > 0 && currentContent === '') {
        this.problemesDetectes.push({
          type: 'cellule_vide_avec_donnees',
          cellule: cell,
          cellId: cellId,
          donnees: candidateDonnees[0],
          priorite: 'high'
        });
      }

      if (candidateDonnees.length > 0 && currentContent !== '' &&
          candidateDonnees[0].content !== currentContent) {
        this.problemesDetectes.push({
          type: 'correspondance_incomplete',
          cellule: cell,
          cellId: cellId,
          donnees: candidateDonnees[0],
          priorite: 'medium'
        });
      }

      // Problème: Cellule sans ID mais avec des données potentielles
      if (!cellId) {
        const donneesParPosition = this.chercherDonneesParPosition(cell, allData);
        if (donneesParPosition.length > 0) {
          this.problemesDetectes.push({
            type: 'cellule_sans_id_avec_donnees',
            cellule: cell,
            donnees: donneesParPosition[0],
            priorite: 'medium'
          });
        }
      }
    }

    this.log(`🔍 ${this.problemesDetectes.length} problèmes spécifiques détectés`, 'problem', {
      problemes: this.problemesDetectes.map(p => p.type)
    });
  }

  chercherDonneesParPosition(cell, allData) {
    const table = cell.closest('table');
    if (!table) return [];

    const row = cell.closest('tr');
    const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(cell);

    return allData.filter(item => {
      if (!item.cellId || (!item.content && !item.text)) return false;

      // Extraire position de l'ID si possible
      const match = item.cellId.match(/cell_(\d+)/);
      if (match) {
        const itemCellIndex = parseInt(match[1]);
        return Math.abs(itemCellIndex - cellIndex) <= 1; // Tolérance de position
      }
      return false;
    });
  }

  async nettoyerDonneesCorrrompues() {
    this.log('🧹 Nettoyage des données corrompues...', 'correction');

    const allData = await window.ClaraVerse.TablePersistence.db.getAll();
    let cleaned = 0;

    for (const item of allData) {
      let needsCleaning = false;
      let newItem = { ...item };

      // Nettoyer les "undefined" en string
      if (newItem.content === 'undefined') {
        delete newItem.content;
        needsCleaning = true;
      }
      if (newItem.text === 'undefined') {
        delete newItem.text;
        needsCleaning = true;
      }

      // Supprimer les entrées complètement vides
      if (!newItem.content && !newItem.text) {
        await window.ClaraVerse.TablePersistence.db.remove(item.cellId);
        cleaned++;
        continue;
      }

      // Mettre à jour si nécessaire
      if (needsCleaning && (newItem.content || newItem.text)) {
        await window.ClaraVerse.TablePersistence.db.set(item.cellId, newItem);
        cleaned++;
      }
    }

    this.statistiques.donneesNettoyees = cleaned;
    this.log(`✅ ${cleaned} entrées corrompues nettoyées`, 'success');
  }

  async repererIDsManquants() {
    this.log('🔧 Réparation des IDs manquants...', 'correction');

    const problemesID = this.problemesDetectes.filter(p => p.type === 'cellule_sans_id_avec_donnees');
    let reparés = 0;

    for (const probleme of problemesID) {
      const { cellule, donnees } = probleme;

      // Générer un nouvel ID basé sur la position
      const nouvelId = this.genererIdCellule(cellule);

      if (nouvelId && donnees.cellId) {
        // Assigner l'ID à la cellule
        cellule.dataset.cellId = donnees.cellId;

        // Marquer la correction
        this.correctionsAppliquees.push({
          type: 'id_repare',
          cellule: cellule,
          ancienId: null,
          nouveauId: donnees.cellId
        });

        reparés++;
      }
    }

    this.statistiques.idsPrepares = reparés;
    this.log(`✅ ${reparés} IDs réparés`, 'success');
  }

  genererIdCellule(cell) {
    const table = cell.closest('table');
    if (!table) return null;

    // Générer un hash simple basé sur le contenu de la table
    const headers = table.querySelectorAll('th');
    let tableContent = '';
    headers.forEach(th => tableContent += th.textContent?.trim() || '');

    const row = cell.closest('tr');
    const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(cell);

    const tableHash = this.hashSimple(tableContent.substring(0, 50));
    return `table_${tableHash}_${Date.now()}_cell_${cellIndex}`;
  }

  hashSimple(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString().substring(0, 8);
  }

  async corrigerCorrespondancesManquees() {
    this.log('🔗 Correction des correspondances manquées...', 'correction');

    const problemesCorrespondance = this.problemesDetectes.filter(p =>
      p.type === 'correspondance_incomplete' || p.type === 'cellule_vide_avec_donnees'
    );

    let corrigees = 0;

    for (const probleme of problemesCorrespondance) {
      const { cellule, donnees } = probleme;

      try {
        // Appliquer la restauration forcée
        const success = await this.appliquerRestaurationForcee(cellule, donnees);

        if (success) {
          this.correctionsAppliquees.push({
            type: 'correspondance_corrigee',
            cellule: cellule,
            donnees: donnees,
            methode: 'force_restore'
          });
          corrigees++;
        }

      } catch (error) {
        this.log(`⚠️ Erreur correction cellule ${donnees.cellId}: ${error.message}`, 'warning');
      }
    }

    this.statistiques.correspondancesCreees = corrigees;
    this.log(`✅ ${corrigees} correspondances corrigées`, 'success');
  }

  async appliquerRestaurationForcee(cellule, donnees) {
    const contentToRestore = donnees.content || donnees.text;

    if (!contentToRestore || contentToRestore === 'undefined') {
      return false;
    }

    // Sauvegarder l'état actuel
    const ancienContenu = cellule.textContent?.trim() || '';

    try {
      // Appliquer le contenu
      if (donnees.content && donnees.content !== 'undefined') {
        cellule.innerHTML = donnees.content;
      } else if (donnees.text && donnees.text !== 'undefined') {
        cellule.textContent = donnees.text;
      }

      // Assigner l'ID si manquant
      if (!cellule.dataset.cellId && donnees.cellId) {
        cellule.dataset.cellId = donnees.cellId;
      }

      // Effet visuel de correction
      cellule.style.backgroundColor = '#fef3c7';
      cellule.style.border = '2px solid #f59e0b';
      cellule.style.transition = 'all 0.3s ease';

      setTimeout(() => {
        cellule.style.backgroundColor = '#dcfce7';
        cellule.style.border = '1px solid #10b981';
      }, 1000);

      setTimeout(() => {
        cellule.style.backgroundColor = '';
        cellule.style.border = '';
      }, 3000);

      // Événement de correction
      const correctionEvent = new CustomEvent('claraverse:correction:applied', {
        detail: {
          cellId: donnees.cellId,
          ancienContenu,
          nouveauContenu: contentToRestore,
          source: 'correction-restauration'
        }
      });
      document.dispatchEvent(correctionEvent);

      return true;

    } catch (error) {
      this.log(`❌ Erreur application restauration: ${error.message}`, 'error');
      return false;
    }
  }

  async forcerRestaurationCellulesVides() {
    this.log('💪 Restauration forcée des cellules vides avec données...', 'correction');

    const cellulesVides = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
    const allData = await window.ClaraVerse.TablePersistence.db.getAll();

    let restaurees = 0;

    for (const cell of cellulesVides) {
      const currentContent = cell.textContent?.trim();

      // Ignorer les cellules qui ont déjà du contenu
      if (currentContent && currentContent !== '') continue;

      const cellId = cell.dataset.cellId;

      // Stratégie 1: Correspondance par ID exact
      let donnees = null;
      if (cellId) {
        donnees = allData.find(item => item.cellId === cellId && (item.content || item.text));
      }

      // Stratégie 2: Correspondance par position
      if (!donnees) {
        const donneesPosition = this.chercherDonneesParPosition(cell, allData);
        if (donneesPosition.length > 0) {
          donnees = donneesPosition[0];
        }
      }

      // Stratégie 3: Correspondance par contexte de table
      if (!donnees) {
        donnees = this.chercherDonneesParContexteTable(cell, allData);
      }

      // Appliquer la restauration si des données sont trouvées
      if (donnees && (donnees.content || donnees.text)) {
        const success = await this.appliquerRestaurationForcee(cell, donnees);
        if (success) {
          restaurees++;
        }
      }
    }

    this.log(`✅ ${restaurees} cellules vides restaurées par force`, 'success');
  }

  chercherDonneesParContexteTable(cell, allData) {
    const table = cell.closest('table');
    if (!table) return null;

    // Identifier la table par ses headers
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim() || '');
    const tableSignature = headers.join('|').substring(0, 100);

    // Chercher des données qui pourraient appartenir à cette table
    return allData.find(item => {
      if (!item.cellId || (!item.content && !item.text)) return false;

      // Recherche par signature de table (très basique)
      return item.cellId.includes('table_') && (item.content || item.text);
    });
  }

  async verifierCorrections() {
    this.log('✅ Vérification des corrections appliquées...', 'correction');

    const verification = {
      cellulesAvecContenu: 0,
      cellulesAvecId: 0,
      donneesValides: 0,
      problemesPersistants: []
    };

    // Recompter les cellules
    const editableCells = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');

    for (const cell of editableCells) {
      if (cell.textContent?.trim()) {
        verification.cellulesAvecContenu++;
      }
      if (cell.dataset.cellId) {
        verification.cellulesAvecId++;
      }
    }

    // Recompter les données valides
    const allData = await window.ClaraVerse.TablePersistence.db.getAll();
    verification.donneesValides = allData.filter(item =>
      item.cellId &&
      (item.content || item.text) &&
      item.content !== 'undefined' &&
      item.text !== 'undefined'
    ).length;

    return verification;
  }

  genererRapportCorrection(verification) {
    this.log('📊 RAPPORT DE CORRECTION FINALE', 'correction');
    console.log('%c' + '='.repeat(50), 'color: #7c3aed; font-weight: bold;');

    // Résumé des statistiques
    this.log(`Cellules analysées: ${this.statistiques.cellulesAnalysees}`);
    this.log(`Problèmes détectés: ${this.problemesDetectes.length}`);
    this.log(`Corrections appliquées: ${this.correctionsAppliquees.length}`);
    this.log(`Données nettoyées: ${this.statistiques.donneesNettoyees}`);
    this.log(`IDs réparés: ${this.statistiques.idsPrepares}`);
    this.log(`Correspondances créées: ${this.statistiques.correspondancesCreees}`);

    // État final
    this.log('🎯 ÉTAT FINAL:', 'success');
    this.log(`Cellules avec contenu: ${verification.cellulesAvecContenu}`);
    this.log(`Cellules avec ID: ${verification.cellulesAvecId}`);
    this.log(`Données valides en base: ${verification.donneesValides}`);

    // Types de corrections appliquées
    const typesCorrections = {};
    this.correctionsAppliquees.forEach(correction => {
      typesCorrections[correction.type] = (typesCorrections[correction.type] || 0) + 1;
    });

    if (Object.keys(typesCorrections).length > 0) {
      this.log('🔧 Types de corrections:', 'correction', typesCorrections);
    }

    // Notification dans le DOM
    this.afficherNotificationCorrection();

    console.log('%c' + '='.repeat(50), 'color: #7c3aed; font-weight: bold;');
  }

  afficherNotificationCorrection() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px 35px;
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.3);
      z-index: 15000;
      font-family: Arial, sans-serif;
      text-align: center;
      min-width: 300px;
      border: 2px solid rgba(255,255,255,0.2);
    `;

    notification.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">🛠️</div>
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Correction Appliquée</h3>
      <p style="margin: 0 0 15px 0; opacity: 0.9; font-size: 14px;">
        ${this.correctionsAppliquees.length} corrections appliquées<br>
        ${this.statistiques.donneesNettoyees} données nettoyées
      </p>
      <div style="background: rgba(255,255,255,0.2); padding: 8px; border-radius: 6px; font-size: 12px;">
        Système de restauration optimisé
      </div>
    `;

    document.body.appendChild(notification);

    // Animation d'entrée
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
    setTimeout(() => {
      notification.style.transition = 'all 0.3s ease';
      notification.style.opacity = '1';
      notification.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);

    // Suppression automatique
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  }
}

// Interface globale pour la correction
window.ClaraVerseCorrection = {
  async corrigerTout() {
    const correcteur = new CorrectionRestauration();
    return await correcteur.executerCorrectionComplete();
  },

  async diagnostiquer() {
    const correcteur = new CorrectionRestauration();
    await correcteur.diagnostiquerProblemsesSpecifiques();
    return correcteur.problemesDetectes;
  },

  async nettoyerSeulement() {
    const correcteur = new CorrectionRestauration();
    await correcteur.nettoyerDonneesCorrrompues();
    return correcteur.statistiques.donneesNettoyees;
  }
};

// Auto-exécution si URL contient #fix
if (window.location.hash === '#fix') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      window.ClaraVerseCorrection.corrigerTout();
    }, 3000);
  });
}

// Bouton de correction rapide dans la console
console.log('🔧 ClaraVerse Correction chargé:');
console.log('   • window.ClaraVerseCorrection.corrigerTout() - Correction complète');
console.log('   • window.ClaraVerseCorrection.diagnostiquer() - Diagnostic seulement');
console.log('   • Ou ajouter #fix à l\'URL pour correction automatique');

// Interface de correction d'urgence
document.addEventListener('keydown', (e) => {
  // Ctrl + Shift + F pour correction d'urgence
  if (e.ctrlKey && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    console.log('🚨 Correction d\'urgence déclenchée par raccourci clavier');
    window.ClaraVerseCorrection.corrigerTout();
  }
});
