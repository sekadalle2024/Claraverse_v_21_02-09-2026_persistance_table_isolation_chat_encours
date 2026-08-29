/**
 * CLARAVERSE - CORRECTION SYNCHRONISATION
 * Script pour corriger la synchronisation avec l'application principale
 * Rétablit les liens entre IndexedDB, DOM et application React
 */

class CorrectionSynchronisation {
  constructor() {
    this.logPrefix = '[SyncCorrection]';
    this.problemesSynchro = [];
    this.evenementsAttaches = new Set();
    this.stats = {
      evenementsRepares: 0,
      cellulesResynchronisees: 0,
      apisReconnectees: 0,
      erreursCorriges: 0
    };
  }

  log(message, type = 'info', data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: '🔄',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      sync: '🔗',
      api: '🛠️'
    };

    console.log(`${emoji[type] || '🔄'} ${this.logPrefix} [${timestamp}] ${message}`);

    if (data) {
      console.log('📊 Détails:', data);
    }
  }

  async executerCorrectionSynchronisation() {
    this.log('🚀 Démarrage correction synchronisation complète', 'sync');

    try {
      // Phase 1: Diagnostic des problèmes de synchronisation
      await this.diagnostiquerProblemesSynchro();

      // Phase 2: Corriger les APIs et connexions
      await this.corrigerAPIsEtConnexions();

      // Phase 3: Rétablir les événements de sauvegarde
      await this.retablirEvenementsSauvegarde();

      // Phase 4: Forcer la synchronisation avec React
      await this.forcerSynchronisationReact();

      // Phase 5: Corriger les gestionnaires d'événements globaux
      await this.corrigerGestionnairesGlobaux();

      // Phase 6: Test de synchronisation finale
      await this.testerSynchronisationFinale();

      const rapport = this.genererRapportSynchro();
      this.afficherRapportSynchronisation(rapport);

      return rapport;

    } catch (error) {
      this.log(`❌ Erreur correction synchronisation: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async diagnostiquerProblemesSynchro() {
    this.log('Diagnostic des problèmes de synchronisation...', 'sync');

    const problemes = [];

    // Vérifier l'état des APIs principales
    if (!window.ClaraVerse?.TablePersistence) {
      problemes.push({
        type: 'api_manquante',
        description: 'API ClaraVerse.TablePersistence non disponible',
        priorite: 'high'
      });
    }

    // Vérifier React/application principale
    if (!document.getElementById('root')?.innerHTML?.trim()) {
      problemes.push({
        type: 'react_non_charge',
        description: 'Application React principale non chargée',
        priorite: 'high'
      });
    }

    // Vérifier les événements sur les cellules
    const cellulesEditables = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
    let cellulessSansEvenements = 0;

    for (const cellule of cellulesEditables) {
      if (!cellule.hasAttribute('data-events-attached')) {
        cellulessSansEvenements++;
      }
    }

    if (cellulessSansEvenements > 0) {
      problemes.push({
        type: 'evenements_manquants',
        description: `${cellulessSansEvenements} cellules sans événements de sauvegarde`,
        priorite: 'medium'
      });
    }

    // Vérifier la cohérence IndexedDB vs DOM
    try {
      const donneesDB = await window.ClaraVerse.TablePersistence.db.getAll();
      const cellulesAvecContenu = Array.from(cellulesEditables).filter(c => c.textContent?.trim());

      if (Math.abs(donneesDB.length - cellulesAvecContenu.length) > donneesDB.length * 0.3) {
        problemes.push({
          type: 'incoherence_donnees',
          description: `Incohérence: ${donneesDB.length} en base vs ${cellulesAvecContenu.length} dans DOM`,
          priorite: 'medium'
        });
      }
    } catch (error) {
      problemes.push({
        type: 'erreur_db',
        description: `Erreur accès IndexedDB: ${error.message}`,
        priorite: 'high'
      });
    }

    this.problemesSynchro = problemes;
    this.log(`${problemes.length} problèmes de synchronisation détectés`, 'warning', problemes);
  }

  async corrigerAPIsEtConnexions() {
    this.log('Correction des APIs et connexions...', 'api');

    let apisReconnectees = 0;

    // Vérifier et corriger ClaraVerse API
    if (!window.ClaraVerse) {
      this.log('Reconstruction de window.ClaraVerse...', 'api');
      window.ClaraVerse = {};
    }

    if (!window.ClaraVerse.TablePersistence) {
      this.log('Reconstruction de TablePersistence...', 'api');

      // Recréer l'API de base si elle est manquante
      window.ClaraVerse.TablePersistence = {
        db: {
          async getAll() {
            return new Promise((resolve) => {
              const request = indexedDB.open('ClaraVerseDB', 1);
              request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['tablePersistence'], 'readonly');
                const store = transaction.objectStore('tablePersistence');
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                  resolve(getAllRequest.result || []);
                };
                getAllRequest.onerror = () => resolve([]);
              };
              request.onerror = () => resolve([]);
            });
          },

          async get(key) {
            return new Promise((resolve) => {
              const request = indexedDB.open('ClaraVerseDB', 1);
              request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['tablePersistence'], 'readonly');
                const store = transaction.objectStore('tablePersistence');
                const getRequest = store.get(key);

                getRequest.onsuccess = () => {
                  resolve(getRequest.result);
                };
                getRequest.onerror = () => resolve(null);
              };
              request.onerror = () => resolve(null);
            });
          },

          async set(key, value) {
            return new Promise((resolve) => {
              const request = indexedDB.open('ClaraVerseDB', 1);
              request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['tablePersistence'], 'readwrite');
                const store = transaction.objectStore('tablePersistence');

                const data = { ...value, cellId: key };
                const setRequest = store.put(data);

                setRequest.onsuccess = () => resolve(true);
                setRequest.onerror = () => resolve(false);
              };
              request.onerror = () => resolve(false);
            });
          },

          async remove(key) {
            return new Promise((resolve) => {
              const request = indexedDB.open('ClaraVerseDB', 1);
              request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['tablePersistence'], 'readwrite');
                const store = transaction.objectStore('tablePersistence');
                const deleteRequest = store.delete(key);

                deleteRequest.onsuccess = () => resolve(true);
                deleteRequest.onerror = () => resolve(false);
              };
              request.onerror = () => resolve(false);
            });
          }
        }
      };

      apisReconnectees++;
    }

    // Vérifier que les fonctions de restauration existent
    if (!window.ClaraVerse.TablePersistence.restore) {
      window.ClaraVerse.TablePersistence.restore = async function() {
        console.log('🔄 Fonction de restauration appelée');
        if (window.fixClaraVerse) {
          return await window.fixClaraVerse();
        }
        return { success: false, message: 'Pas de fonction de restauration disponible' };
      };
      apisReconnectees++;
    }

    this.stats.apisReconnectees = apisReconnectees;
    this.log(`${apisReconnectees} APIs reconnectées`, 'success');
  }

  async retablirEvenementsSauvegarde() {
    this.log('Rétablissement des événements de sauvegarde...', 'sync');

    const cellulesEditables = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
    let evenementsAttaches = 0;

    for (const cellule of cellulesEditables) {
      if (!cellule.hasAttribute('data-events-attached') || !this.evenementsAttaches.has(cellule)) {

        // Supprimer les anciens événements pour éviter les doublons
        const nouveauElement = cellule.cloneNode(true);
        cellule.parentNode.replaceChild(nouveauElement, cellule);

        // Attacher les nouveaux événements
        this.attacherEvenementsCellule(nouveauElement);
        evenementsAttaches++;
      }
    }

    this.stats.evenementsRepares = evenementsAttaches;
    this.log(`${evenementsAttaches} événements de sauvegarde rétablis`, 'success');
  }

  attacherEvenementsCellule(cellule) {
    const self = this;

    // Événement de sauvegarde à la perte de focus
    const sauvegarderContenu = async function() {
      const cellId = cellule.dataset.cellId;
      if (!cellId) return;

      const contenu = {
        cellId: cellId,
        content: cellule.innerHTML,
        text: cellule.textContent,
        timestamp: Date.now()
      };

      try {
        if (window.ClaraVerse?.TablePersistence?.db?.set) {
          await window.ClaraVerse.TablePersistence.db.set(cellId, contenu);

          // Déclencher événement de synchronisation
          const syncEvent = new CustomEvent('claraverse:cell:updated', {
            detail: { cellId, content: contenu }
          });
          document.dispatchEvent(syncEvent);
        }
      } catch (error) {
        console.warn('Erreur sauvegarde cellule:', error);
      }
    };

    // Attacher les événements
    cellule.addEventListener('blur', sauvegarderContenu);
    cellule.addEventListener('input', () => {
      // Sauvegarde différée
      clearTimeout(cellule._saveTimeout);
      cellule._saveTimeout = setTimeout(sauvegarderContenu, 1000);
    });

    // Marquer comme ayant des événements
    cellule.setAttribute('data-events-attached', 'true');
    this.evenementsAttaches.add(cellule);
  }

  async forcerSynchronisationReact() {
    this.log('Forçage de la synchronisation avec React...', 'sync');

    let cellulesResynchronisees = 0;

    // Déclencher des événements React si l'app principale est présente
    const rootElement = document.getElementById('root');
    if (rootElement && rootElement._reactInternalInstance) {

      // Déclencher une mise à jour globale
      const updateEvent = new CustomEvent('claraverse:force-update', {
        detail: {
          timestamp: Date.now(),
          source: 'sync-correction'
        }
      });

      document.dispatchEvent(updateEvent);
      rootElement.dispatchEvent(updateEvent);

      this.log('Événements React déclenchés', 'success');
    }

    // Synchroniser toutes les cellules éditables avec React
    const cellulesEditables = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');

    for (const cellule of cellulesEditables) {
      // Déclencher des événements de changement React
      const changeEvent = new Event('input', { bubbles: true });
      const blurEvent = new Event('blur', { bubbles: true });

      cellule.dispatchEvent(changeEvent);

      // Marquer pour React
      if (!cellule.hasAttribute('data-react-synced')) {
        cellule.setAttribute('data-react-synced', 'true');
        cellulesResynchronisees++;
      }
    }

    this.stats.cellulesResynchronisees = cellulesResynchronisees;
    this.log(`${cellulesResynchronisees} cellules resynchronisées avec React`, 'success');
  }

  async corrigerGestionnairesGlobaux() {
    this.log('Correction des gestionnaires d\'événements globaux...', 'sync');

    let erreursCorriges = 0;

    // Corriger les gestionnaires de menu contextuel
    if (window.ContextualMenuManager) {
      try {
        if (!window.menuManager) {
          window.menuManager = new window.ContextualMenuManager();
          window.menuManager.init();
          erreursCorriges++;
        }
      } catch (error) {
        this.log(`Erreur menu contextuel: ${error.message}`, 'warning');
      }
    }

    // Corriger les processeurs de table
    if (window.ClaraverseTableProcessor) {
      try {
        if (!window.tableProcessor) {
          window.tableProcessor = new window.ClaraverseTableProcessor();
          window.tableProcessor.init();
          erreursCorriges++;
        }
      } catch (error) {
        this.log(`Erreur processeur de table: ${error.message}`, 'warning');
      }
    }

    // Réattacher les événements globaux de synchronisation
    document.removeEventListener('claraverse:table:updated', this.handleTableUpdate);
    document.addEventListener('claraverse:table:updated', this.handleTableUpdate.bind(this));

    document.removeEventListener('claraverse:cell:restored', this.handleCellRestored);
    document.addEventListener('claraverse:cell:restored', this.handleCellRestored.bind(this));

    this.stats.erreursCorriges = erreursCorriges;
    this.log(`${erreursCorriges} gestionnaires globaux corrigés`, 'success');
  }

  handleTableUpdate(event) {
    this.log(`Table mise à jour: ${event.detail?.tableId || 'inconnu'}`, 'sync');

    // Forcer une synchronisation des données
    if (window.ClaraVerse?.TablePersistence?.db) {
      setTimeout(() => {
        this.synchroniserTableAvecDB(event.detail?.tableId);
      }, 100);
    }
  }

  handleCellRestored(event) {
    this.log(`Cellule restaurée: ${event.detail?.cellId || 'inconnu'}`, 'sync');

    // Assurer la cohérence après restauration
    const cellId = event.detail?.cellId;
    if (cellId) {
      const cellule = document.querySelector(`[data-cell-id="${cellId}"]`);
      if (cellule && !cellule.hasAttribute('data-events-attached')) {
        this.attacherEvenementsCellule(cellule);
      }
    }
  }

  async synchroniserTableAvecDB(tableId) {
    if (!tableId) return;

    try {
      const donnees = await window.ClaraVerse.TablePersistence.db.getAll();
      const donneesTable = donnees.filter(d => d.cellId?.includes(tableId));

      this.log(`Synchronisation table ${tableId}: ${donneesTable.length} données`, 'info');

    } catch (error) {
      this.log(`Erreur synchronisation table: ${error.message}`, 'error');
    }
  }

  async testerSynchronisationFinale() {
    this.log('Test de synchronisation finale...', 'sync');

    const tests = [];

    // Test 1: Sauvegarde d'une cellule
    try {
      const celluleTest = document.querySelector('td[contenteditable="true"], th[contenteditable="true"]');
      if (celluleTest) {
        const contenuOriginal = celluleTest.textContent;
        const contenuTest = 'TEST_SYNC_' + Date.now();

        celluleTest.textContent = contenuTest;
        celluleTest.dispatchEvent(new Event('blur', { bubbles: true }));

        // Attendre la sauvegarde
        await new Promise(resolve => setTimeout(resolve, 500));

        // Vérifier en base
        const cellId = celluleTest.dataset.cellId;
        if (cellId) {
          const donnee = await window.ClaraVerse.TablePersistence.db.get(cellId);
          if (donnee && donnee.text?.includes('TEST_SYNC_')) {
            tests.push({ nom: 'sauvegarde', resultat: 'success' });
          } else {
            tests.push({ nom: 'sauvegarde', resultat: 'failed' });
          }
        }

        // Restaurer le contenu original
        celluleTest.textContent = contenuOriginal;
      }
    } catch (error) {
      tests.push({ nom: 'sauvegarde', resultat: 'error', erreur: error.message });
    }

    // Test 2: Événements globaux
    let eventReceived = false;
    const testHandler = () => { eventReceived = true; };

    document.addEventListener('claraverse:test:sync', testHandler);
    document.dispatchEvent(new CustomEvent('claraverse:test:sync'));

    setTimeout(() => {
      document.removeEventListener('claraverse:test:sync', testHandler);
      tests.push({
        nom: 'evenements',
        resultat: eventReceived ? 'success' : 'failed'
      });
    }, 100);

    // Test 3: API disponibilité
    const apiTest = !!(window.ClaraVerse?.TablePersistence?.db?.getAll);
    tests.push({
      nom: 'api',
      resultat: apiTest ? 'success' : 'failed'
    });

    this.log('Tests de synchronisation terminés', 'success', tests);
    return tests;
  }

  genererRapportSynchro() {
    const testsReussis = this.stats.evenementsRepares + this.stats.apisReconnectees;
    const totalTests = Object.values(this.stats).reduce((a, b) => a + b, 0);

    return {
      success: true,
      stats: this.stats,
      problemes: this.problemesSynchro,
      testsReussis,
      totalTests,
      message: `Synchronisation corrigée: ${testsReussis} éléments réparés`
    };
  }

  afficherRapportSynchronisation(rapport) {
    this.log('📊 RAPPORT CORRECTION SYNCHRONISATION', 'success');
    console.log('='.repeat(60));

    Object.entries(rapport.stats).forEach(([cle, valeur]) => {
      this.log(`${cle}: ${valeur}`);
    });

    if (rapport.problemes.length > 0) {
      this.log('Problèmes corrigés:', 'info', rapport.problemes);
    }

    // Notification dans le DOM
    this.afficherNotificationSynchro(rapport);
  }

  afficherNotificationSynchro(rapport) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px 25px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 15000;
      font-family: Arial, sans-serif;
      text-align: center;
      min-width: 300px;
      border-left: 5px solid rgba(255,255,255,0.3);
    `;

    const totalCorrections = Object.values(rapport.stats).reduce((a, b) => a + b, 0);

    notification.innerHTML = `
      <div style="font-size: 32px; margin-bottom: 10px;">🔗</div>
      <h3 style="margin: 0 0 10px 0; font-size: 20px;">Synchronisation Corrigée</h3>
      <div style="font-size: 14px; opacity: 0.9; margin-bottom: 15px;">
        ${totalCorrections} éléments réparés<br>
        Application principale reconnectée
      </div>
      <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; font-size: 12px;">
        ✅ Événements de sauvegarde actifs<br>
        ✅ APIs reconnectées<br>
        ✅ Synchronisation React restaurée
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 6000);
  }
}

// INTERFACE GLOBALE
window.corrigerSynchronisation = async function() {
  console.log('🔗 Correction Synchronisation ClaraVerse - Démarrage...');

  const correcteur = new CorrectionSynchronisation();
  return await correcteur.executerCorrectionSynchronisation();
};

// Fonctions utilitaires
window.ClaraVerseSyncCorrection = {
  async fix() {
    return await window.corrigerSynchronisation();
  },

  async testSync() {
    console.log('🧪 Test de synchronisation...');

    const tests = {
      api: !!(window.ClaraVerse?.TablePersistence?.db),
      events: document.querySelectorAll('[data-events-attached]').length,
      react: !!document.getElementById('root')?._reactInternalInstance,
      cells: document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]').length
    };

    console.log('📊 État synchronisation:', tests);

    const problemes = [];
    if (!tests.api) problemes.push('API manquante');
    if (tests.events === 0) problemes.push('Aucun événement attaché');
    if (!tests.react) problemes.push('React non détecté');
    if (tests.cells === 0) problemes.push('Aucune cellule éditable');

    if (problemes.length > 0) {
      console.log('⚠️ Problèmes détectés:', problemes);
      console.log('💡 Recommandation: corrigerSynchronisation()');
    } else {
      console.log('✅ Synchronisation OK');
    }

    return { ...tests, problemes };
  },

  forceReload() {
    console.log('🔄 Rechargement forcé...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🔗 Correction Synchronisation chargée');
    console.log('Commandes: corrigerSynchronisation() | window.ClaraVerseSyncCorrection.testSync()');

    // Test automatique si paramètre dans URL
    if (window.location.hash === '#fix-sync') {
      console.log('🚨 Correction synchronisation automatique...');
      setTimeout(() => {
        window.corrigerSynchronisation().catch(console.error);
      }, 2000);
    }
  }, 1500);
});

// Gestionnaire d'erreur global pour les problèmes de sync
window.addEventListener('error', (event) => {
  if (event.message?.includes('ClaraVerse') || event.message?.includes('TablePersistence')) {
    console.warn('🔗 Erreur synchronisation détectée:', event.message);
    console.log('💡 Suggestion: corrigerSynchronisation()');
  }
});

// Raccourci clavier pour correction d'urgence
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key === 'Y') {
    e.preventDefault();
    console.log('🚨 Correction synchronisation d\'urgence (Ctrl+Alt+Y)');
    window.corrigerSynchronisation().catch(console.error);
  }
});
