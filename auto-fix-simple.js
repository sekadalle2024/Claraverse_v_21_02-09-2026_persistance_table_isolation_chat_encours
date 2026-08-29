/**
 * CLARAVERSE AUTO-FIX SIMPLE
 * Version simplifiée et robuste sans interface DOM complexe
 * Corrige les problèmes de restauration IndexedDB
 */

class ClaraVerseSimpleFix {
  constructor() {
    this.logPrefix = '[SimpleFix]';
    this.stats = {
      donneesAnalysees: 0,
      donneesNettoyees: 0,
      cellulesRestaurees: 0,
      erreursCorrigees: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      fix: '🔧'
    };

    console.log(`${emoji[type] || '🔍'} ${this.logPrefix} [${timestamp}] ${message}`);
  }

  async executerReparationSimple() {
    this.log('Démarrage réparation simple ClaraVerse', 'fix');

    try {
      // Étape 1: Vérifications de base
      if (!await this.verifierSysteme()) {
        return { success: false, error: 'Système non prêt' };
      }

      // Étape 2: Nettoyer les données corrompues
      await this.nettoyerDonnees();

      // Étape 3: Restaurer les cellules vides
      await this.restaurerCellules();

      // Étape 4: Rapport final
      const rapport = this.genererRapport();
      this.log(`Réparation terminée: ${rapport.message}`, 'success');

      // Notification simple
      this.afficherNotificationSimple(rapport);

      return rapport;

    } catch (error) {
      this.log(`Erreur durant la réparation: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async verifierSysteme() {
    this.log('Vérification du système...');

    // Vérifier ClaraVerse API
    if (!window.ClaraVerse || !window.ClaraVerse.TablePersistence) {
      this.log('API ClaraVerse non disponible', 'error');
      return false;
    }

    // Vérifier IndexedDB
    if (!window.ClaraVerse.TablePersistence.db) {
      this.log('IndexedDB non initialisé', 'error');
      return false;
    }

    // Test d'accès aux données
    try {
      const testData = await window.ClaraVerse.TablePersistence.db.getAll();
      this.stats.donneesAnalysees = testData.length;
      this.log(`${testData.length} entrées trouvées en base`);
    } catch (e) {
      this.log(`Erreur accès IndexedDB: ${e.message}`, 'error');
      return false;
    }

    this.log('Système vérifié et opérationnel', 'success');
    return true;
  }

  async nettoyerDonnees() {
    this.log('Nettoyage des données corrompues...');

    try {
      const allData = await window.ClaraVerse.TablePersistence.db.getAll();
      let nettoyees = 0;

      for (const item of allData) {
        let needsUpdate = false;
        let shouldDelete = false;

        // Nettoyer les "undefined" en tant que string
        if (item.content === 'undefined') {
          delete item.content;
          needsUpdate = true;
        }
        if (item.text === 'undefined') {
          delete item.text;
          needsUpdate = true;
        }

        // Supprimer les entrées complètement vides
        if (!item.content && !item.text) {
          await window.ClaraVerse.TablePersistence.db.remove(item.cellId);
          shouldDelete = true;
          nettoyees++;
        } else if (needsUpdate) {
          await window.ClaraVerse.TablePersistence.db.set(item.cellId, item);
          nettoyees++;
        }
      }

      this.stats.donneesNettoyees = nettoyees;
      this.log(`${nettoyees} entrées nettoyées/supprimées`, 'success');

    } catch (error) {
      this.log(`Erreur nettoyage: ${error.message}`, 'error');
    }
  }

  async restaurerCellules() {
    this.log('Restauration des cellules vides...');

    try {
      // Obtenir toutes les données valides
      const allData = await window.ClaraVerse.TablePersistence.db.getAll();
      const validData = allData.filter(item =>
        item.cellId &&
        (item.content || item.text) &&
        item.content !== 'undefined' &&
        item.text !== 'undefined'
      );

      this.log(`${validData.length} données valides disponibles pour restauration`);

      // Obtenir toutes les cellules éditables
      const editableCells = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
      this.log(`${editableCells.length} cellules éditables trouvées`);

      if (editableCells.length === 0) {
        this.log('Aucune cellule éditable trouvée', 'warning');
        return;
      }

      let restaurees = 0;
      const usedData = new Set();

      // Restaurer cellule par cellule
      for (const cell of editableCells) {
        const currentContent = cell.textContent?.trim() || '';

        // Ignorer les cellules qui ont déjà du contenu
        if (currentContent !== '') continue;

        // Chercher des données correspondantes
        let matchedData = null;

        // Stratégie 1: Correspondance par ID exact
        const cellId = cell.dataset.cellId;
        if (cellId) {
          matchedData = validData.find(item =>
            item.cellId === cellId && !usedData.has(item.cellId)
          );
        }

        // Stratégie 2: Première donnée disponible (si pas de correspondance exacte)
        if (!matchedData) {
          matchedData = validData.find(item => !usedData.has(item.cellId));
        }

        // Appliquer la restauration
        if (matchedData) {
          try {
            await this.appliquerRestauration(cell, matchedData);
            usedData.add(matchedData.cellId);
            restaurees++;

            // Petit délai pour éviter de surcharger le DOM
            if (restaurees % 10 === 0) {
              await this.delai(50);
            }
          } catch (error) {
            this.log(`Erreur restauration cellule: ${error.message}`, 'warning');
          }
        }
      }

      this.stats.cellulesRestaurees = restaurees;
      this.log(`${restaurees} cellules restaurées avec succès`, 'success');

    } catch (error) {
      this.log(`Erreur restauration: ${error.message}`, 'error');
    }
  }

  async appliquerRestauration(cell, data) {
    const contentToRestore = data.content || data.text;

    if (!contentToRestore || contentToRestore === 'undefined') {
      return false;
    }

    // Appliquer le contenu
    if (data.content && data.content !== 'undefined') {
      cell.innerHTML = data.content;
    } else if (data.text && data.text !== 'undefined') {
      cell.textContent = data.text;
    }

    // Assigner l'ID si manquant
    if (!cell.dataset.cellId && data.cellId) {
      cell.dataset.cellId = data.cellId;
    }

    // Animation simple et sûre
    if (cell.style) {
      const originalBg = cell.style.backgroundColor;
      cell.style.backgroundColor = '#dcfce7';
      cell.style.transition = 'background-color 0.5s ease';

      setTimeout(() => {
        if (cell.style) {
          cell.style.backgroundColor = originalBg;
        }
      }, 2000);
    }

    return true;
  }

  genererRapport() {
    const { donneesAnalysees, donneesNettoyees, cellulesRestaurees } = this.stats;

    return {
      success: true,
      stats: this.stats,
      message: `${cellulesRestaurees} cellules restaurées, ${donneesNettoyees} données nettoyées sur ${donneesAnalysees} analysées`
    };
  }

  afficherNotificationSimple(rapport) {
    // Créer notification temporaire simple
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 350px;
    `;

    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">✅ Réparation Terminée</div>
      <div style="font-size: 13px; opacity: 0.9;">${rapport.message}</div>
    `;

    // Ajouter au DOM de manière sécurisée
    try {
      document.body.appendChild(notification);

      // Suppression automatique
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    } catch (error) {
      // Si erreur DOM, juste ignorer la notification
      console.log('Notification: ' + rapport.message);
    }
  }

  async delai(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// INTERFACE GLOBALE SIMPLIFIÉE
window.fixClaraVerse = async function() {
  console.log('🛠️ ClaraVerse Simple Fix - Démarrage...');

  try {
    const fixer = new ClaraVerseSimpleFix();
    return await fixer.executerReparationSimple();
  } catch (error) {
    console.error('❌ Erreur Simple Fix:', error);
    return { success: false, error: error.message };
  }
};

// FONCTIONS UTILITAIRES SIMPLES
window.ClaraVerseSimpleFix = {
  async fix() {
    return await window.fixClaraVerse();
  },

  async quickCheck() {
    console.log('🔍 Vérification rapide...');

    const checks = {
      api: !!window.ClaraVerse?.TablePersistence,
      db: !!window.ClaraVerse?.TablePersistence?.db,
      cells: document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]').length
    };

    console.log('📊 État:', checks);

    if (checks.api && checks.db && checks.cells > 0) {
      try {
        const data = await window.ClaraVerse.TablePersistence.db.getAll();
        const emptyCells = Array.from(document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]'))
          .filter(cell => !cell.textContent?.trim()).length;

        console.log(`💾 ${data.length} données en base, ${emptyCells} cellules vides`);

        if (data.length > 0 && emptyCells > 0) {
          console.log('💡 Suggestion: Exécuter fixClaraVerse() pour restaurer');
          return { needsFix: true, data: data.length, emptyCells };
        }

        return { needsFix: false, status: 'ok' };
      } catch (e) {
        console.log('⚠️ Erreur vérification:', e.message);
        return { needsFix: true, error: e.message };
      }
    } else {
      console.log('❌ Système non prêt');
      return { needsFix: true, status: 'system_not_ready' };
    }
  },

  async cleanOnly() {
    console.log('🧹 Nettoyage seul...');

    try {
      const fixer = new ClaraVerseSimpleFix();
      if (await fixer.verifierSysteme()) {
        await fixer.nettoyerDonnees();
        return { success: true, cleaned: fixer.stats.donneesNettoyees };
      }
      return { success: false, error: 'Système non prêt' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// AUTO-INITIALISATION SÉCURISÉE
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🔧 ClaraVerse Simple Fix chargé');
    console.log('📋 Commandes: fixClaraVerse() | window.ClaraVerseSimpleFix.quickCheck()');

    // Auto-fix par URL
    if (window.location.hash === '#simple-fix') {
      console.log('🚨 Simple Fix automatique...');
      setTimeout(() => {
        window.fixClaraVerse().catch(console.error);
      }, 2000);
    }
  }, 1500);
});

// RACCOURCI CLAVIER SÉCURISÉ
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key === 'S') {
    e.preventDefault();
    console.log('🚨 Simple Fix déclenché par raccourci (Ctrl+Alt+S)');
    window.fixClaraVerse().catch(console.error);
  }
});

// AUTO-DÉTECTION DIFFÉRÉE
setTimeout(() => {
  if (window.ClaraVerse?.TablePersistence?.db) {
    window.ClaraVerseSimpleFix.quickCheck()
      .then(result => {
        if (result.needsFix && result.data > 50 && result.emptyCells > 10) {
          console.log(`⚠️ PROBLÈME DÉTECTÉ: ${result.data} données, ${result.emptyCells} cellules vides`);
          console.log('💡 Commande: fixClaraVerse()');
        }
      })
      .catch(() => {}); // Ignorer les erreurs de détection
  }
}, 5000);
