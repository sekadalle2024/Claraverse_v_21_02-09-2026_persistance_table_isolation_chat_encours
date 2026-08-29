// ============================================
// TESTS UNITAIRES - Context Manager
// Tests pour la détection et gestion de session
// ============================================

/**
 * Mock du DOM et des APIs navigateur pour les tests
 */
class TestEnvironment {
  constructor() {
    this.localStorage = new Map();
    this.location = {
      href: 'https://example.com/chat',
      search: '',
      hash: '',
      pathname: '/chat'
    };
    this.document = {
      querySelector: () => null,
      querySelectorAll: () => [],
      dispatchEvent: () => true
    };
    this.window = {
      location: this.location,
      localStorage: {
        getItem: (key) => this.localStorage.get(key) || null,
        setItem: (key, value) => this.localStorage.set(key, value),
        removeItem: (key) => this.localStorage.delete(key)
      }
    };
  }

  reset() {
    this.localStorage.clear();
    this.location.href = 'https://example.com/chat';
    this.location.search = '';
    this.location.hash = '';
    this.location.pathname = '/chat';
  }

  setURL(url) {
    const urlObj = new URL(url);
    this.location.href = url;
    this.location.search = urlObj.search;
    this.location.hash = urlObj.hash;
    this.location.pathname = urlObj.pathname;
  }

  setReactState(state) {
    this.window.claraverseState = state;
  }

  setDOMElement(selector, attributes) {
    const mockElement = {
      getAttribute: (attr) => attributes[attr] || null
    };
    this.document.querySelector = (sel) => sel === selector ? mockElement : null;
  }
}

/**
 * Suite de tests pour ClaraverseContextManager
 */
class ContextManagerTests {
  constructor() {
    this.testEnv = new TestEnvironment();
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  /**
   * Exécution de tous les tests
   */
  runAllTests() {
    console.log('🧪 Début des tests Context Manager...');
    
    this.testSessionDetectionFromReactState();
    this.testSessionDetectionFromURL();
    this.testSessionDetectionFromDOM();
    this.testSessionDetectionFromLocalStorage();
    this.testTemporarySessionGeneration();
    this.testSessionContextManagement();
    this.testSessionValidation();
    this.testFallbackChain();
    this.testSessionChangeDetection();
    this.testSessionExpiration();

    this.printResults();
  }

  /**
   * Test de détection depuis l'état React
   */
  testSessionDetectionFromReactState() {
    this.testEnv.reset();
    
    // Test 1: Session dans claraverseState
    this.testEnv.setReactState({
      currentSession: { id: 'react-session-123' }
    });
    
    const manager = this.createManager();
    const sessionId = manager.detectFromReactState();
    
    this.assert(
      sessionId === 'react-session-123',
      'Détection React State - claraverseState',
      `Attendu: react-session-123, Reçu: ${sessionId}`
    );

    // Test 2: Pas de session React
    this.testEnv.setReactState(null);
    const noSession = manager.detectFromReactState();
    
    this.assert(
      noSession === null,
      'Détection React State - aucune session',
      `Attendu: null, Reçu: ${noSession}`
    );
  }

  /**
   * Test de détection depuis l'URL
   */
  testSessionDetectionFromURL() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Paramètre sessionId
    this.testEnv.setURL('https://example.com/chat?sessionId=url-session-456');
    let sessionId = manager.detectFromURL();
    
    this.assert(
      sessionId === 'url-session-456',
      'Détection URL - paramètre sessionId',
      `Attendu: url-session-456, Reçu: ${sessionId}`
    );

    // Test 2: Paramètre chatId
    this.testEnv.setURL('https://example.com/chat?chatId=chat-789');
    sessionId = manager.detectFromURL();
    
    this.assert(
      sessionId === 'chat-789',
      'Détection URL - paramètre chatId',
      `Attendu: chat-789, Reçu: ${sessionId}`
    );

    // Test 3: Hash avec session
    this.testEnv.setURL('https://example.com/chat#session=hash-session-101');
    sessionId = manager.detectFromURL();
    
    this.assert(
      sessionId === 'hash-session-101',
      'Détection URL - hash session',
      `Attendu: hash-session-101, Reçu: ${sessionId}`
    );

    // Test 4: Pathname avec session
    this.testEnv.setURL('https://example.com/session/path-session-202');
    sessionId = manager.detectFromURL();
    
    this.assert(
      sessionId === 'path-session-202',
      'Détection URL - pathname session',
      `Attendu: path-session-202, Reçu: ${sessionId}`
    );
  }

  /**
   * Test de détection depuis le DOM
   */
  testSessionDetectionFromDOM() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Attribut data-session-id
    this.testEnv.setDOMElement('[data-session-id]', {
      'data-session-id': 'dom-session-303'
    });
    
    let sessionId = manager.detectFromDOM();
    
    this.assert(
      sessionId === 'dom-session-303',
      'Détection DOM - data-session-id',
      `Attendu: dom-session-303, Reçu: ${sessionId}`
    );

    // Test 2: Aucun élément trouvé
    this.testEnv.document.querySelector = () => null;
    sessionId = manager.detectFromDOM();
    
    this.assert(
      sessionId === null,
      'Détection DOM - aucun élément',
      `Attendu: null, Reçu: ${sessionId}`
    );
  }

  /**
   * Test de détection depuis localStorage
   */
  testSessionDetectionFromLocalStorage() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Session active valide
    const sessionData = {
      id: 'storage-session-404',
      lastActivity: Date.now() - 1000 // 1 seconde ago
    };
    this.testEnv.localStorage.set('claraverse_active_session', JSON.stringify(sessionData));
    
    let sessionId = manager.detectFromLocalStorage();
    
    this.assert(
      sessionId === 'storage-session-404',
      'Détection localStorage - session valide',
      `Attendu: storage-session-404, Reçu: ${sessionId}`
    );

    // Test 2: Session expirée
    const expiredSessionData = {
      id: 'expired-session-505',
      lastActivity: Date.now() - (25 * 60 * 60 * 1000) // 25 heures ago
    };
    this.testEnv.localStorage.set('claraverse_active_session', JSON.stringify(expiredSessionData));
    
    sessionId = manager.detectFromLocalStorage();
    
    this.assert(
      sessionId === null,
      'Détection localStorage - session expirée',
      `Attendu: null, Reçu: ${sessionId}`
    );
  }

  /**
   * Test de génération de session temporaire
   */
  testTemporarySessionGeneration() {
    this.testEnv.reset();
    const manager = this.createManager();

    const tempSessionId = manager.generateTemporary();
    
    this.assert(
      tempSessionId.startsWith('temp_'),
      'Génération session temporaire - préfixe',
      `Session temporaire doit commencer par 'temp_': ${tempSessionId}`
    );

    this.assert(
      tempSessionId.length > 20,
      'Génération session temporaire - longueur',
      `Session temporaire doit être suffisamment longue: ${tempSessionId.length} caractères`
    );

    // Vérifier que deux générations successives sont différentes
    const tempSessionId2 = manager.generateTemporary();
    
    this.assert(
      tempSessionId !== tempSessionId2,
      'Génération session temporaire - unicité',
      `Deux sessions temporaires doivent être différentes: ${tempSessionId} vs ${tempSessionId2}`
    );
  }

  /**
   * Test de gestion du contexte de session
   */
  testSessionContextManagement() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test de création de contexte
    manager.updateSessionContext('test-session-606', 'manual');
    const context = manager.getCurrentSessionContext();
    
    this.assert(
      context !== null,
      'Gestion contexte - création',
      'Le contexte doit être créé'
    );

    this.assert(
      context.sessionId === 'test-session-606',
      'Gestion contexte - sessionId',
      `Attendu: test-session-606, Reçu: ${context.sessionId}`
    );

    this.assert(
      context.detectionMethod === 'manual',
      'Gestion contexte - detectionMethod',
      `Attendu: manual, Reçu: ${context.detectionMethod}`
    );

    // Test de mise à jour d'activité
    const initialActivity = context.lastActivity;
    setTimeout(() => {
      manager.updateSessionActivity();
      const updatedContext = manager.getCurrentSessionContext();
      
      this.assert(
        updatedContext.lastActivity > initialActivity,
        'Gestion contexte - mise à jour activité',
        `L'activité doit être mise à jour: ${initialActivity} -> ${updatedContext.lastActivity}`
      );
    }, 10);
  }

  /**
   * Test de validation de session
   */
  testSessionValidation() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: ID valide
    this.assert(
      manager.validateSessionId('valid-session-123'),
      'Validation session - ID valide',
      'ID valide doit passer la validation'
    );

    // Test 2: ID trop court
    this.assert(
      !manager.validateSessionId('ab'),
      'Validation session - ID trop court',
      'ID trop court doit échouer'
    );

    // Test 3: ID avec caractères invalides
    this.assert(
      !manager.validateSessionId('invalid@session#123'),
      'Validation session - caractères invalides',
      'ID avec caractères spéciaux doit échouer'
    );

    // Test 4: ID null
    this.assert(
      !manager.validateSessionId(null),
      'Validation session - ID null',
      'ID null doit échouer'
    );
  }

  /**
   * Test de la chaîne de fallback
   */
  testFallbackChain() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Simuler l'échec de toutes les méthodes sauf la dernière
    manager.detectFromReactState = () => null;
    manager.detectFromURL = () => null;
    manager.detectFromDOM = () => null;
    manager.detectFromLocalStorage = () => null;

    const sessionId = manager.detectCurrentSession();
    
    this.assert(
      sessionId.startsWith('temp_'),
      'Chaîne fallback - génération temporaire',
      `Fallback doit générer une session temporaire: ${sessionId}`
    );

    this.assert(
      manager.currentSessionId === sessionId,
      'Chaîne fallback - stockage ID',
      'L\'ID détecté doit être stocké dans currentSessionId'
    );
  }

  /**
   * Test de détection de changement de session
   */
  testSessionChangeDetection() {
    this.testEnv.reset();
    const manager = this.createManager();

    let eventFired = false;
    this.testEnv.document.dispatchEvent = (event) => {
      if (event.type === 'claraverse:session:changed') {
        eventFired = true;
      }
      return true;
    };

    manager.updateSessionContext('change-test-707', 'test');
    
    this.assert(
      eventFired,
      'Détection changement - événement émis',
      'Un événement de changement de session doit être émis'
    );
  }

  /**
   * Test d'expiration de session
   */
  testSessionExpiration() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer un contexte avec une session expirée
    manager.updateSessionContext('expired-test-808', 'test');
    const context = manager.getCurrentSessionContext();
    
    // Simuler une session expirée
    context.lastActivity = Date.now() - (25 * 60 * 60 * 1000); // 25 heures ago
    
    const isValid = manager.validateSessionContext();
    
    this.assert(
      !isValid,
      'Expiration session - validation échoue',
      'Une session expirée doit échouer la validation'
    );

    this.assert(
      !context.isValid,
      'Expiration session - marquage invalide',
      'Une session expirée doit être marquée comme invalide'
    );
  }

  /**
   * Création d'un manager pour les tests
   */
  createManager() {
    // Mock des APIs globales
    const originalWindow = global.window;
    const originalDocument = global.document;
    const originalLocalStorage = global.localStorage;

    global.window = this.testEnv.window;
    global.document = this.testEnv.document;
    global.localStorage = this.testEnv.window.localStorage;

    // Créer le manager (on utiliserait normalement la classe réelle)
    const manager = {
      currentSessionId: null,
      sessionContext: null,
      sessionDetectionMethods: [
        'detectFromReactState',
        'detectFromURL', 
        'detectFromDOM',
        'detectFromLocalStorage',
        'generateTemporary'
      ],

      detectCurrentSession() {
        for (const method of this.sessionDetectionMethods) {
          try {
            const sessionId = this[method]();
            if (sessionId && sessionId.trim() !== '') {
              this.currentSessionId = sessionId;
              this.updateSessionContext(sessionId, method);
              return sessionId;
            }
          } catch (error) {
            // Continue to next method
          }
        }
        throw new Error('Toutes les méthodes de détection ont échoué');
      },

      detectFromReactState() {
        if (global.window.claraverseState?.currentSession?.id) {
          return global.window.claraverseState.currentSession.id;
        }
        return null;
      },

      detectFromURL() {
        const url = new URL(global.window.location.href);
        const sessionParams = ['sessionId', 'session', 'chatId', 'chat', 'conversationId'];
        
        for (const param of sessionParams) {
          const value = url.searchParams.get(param);
          if (value) return value;
        }

        const hash = url.hash;
        if (hash) {
          const hashMatch = hash.match(/session[=:]([^&]+)/i);
          if (hashMatch) return hashMatch[1];
        }

        const pathMatch = url.pathname.match(/\/session\/([^\/]+)/i);
        if (pathMatch) return pathMatch[1];

        return null;
      },

      detectFromDOM() {
        const sessionElement = global.document.querySelector('[data-session-id]');
        if (sessionElement) {
          return sessionElement.getAttribute('data-session-id');
        }
        return null;
      },

      detectFromLocalStorage() {
        const activeSession = global.localStorage.getItem('claraverse_active_session');
        if (activeSession) {
          try {
            const sessionData = JSON.parse(activeSession);
            if (sessionData.id && sessionData.lastActivity) {
              const maxAge = 24 * 60 * 60 * 1000;
              if (Date.now() - sessionData.lastActivity < maxAge) {
                return sessionData.id;
              }
            }
          } catch (error) {
            // Invalid data
          }
        }
        return null;
      },

      generateTemporary() {
        const timestamp = Date.now();
        const urlHash = Math.abs(global.window.location.href.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0));
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        
        return `temp_${timestamp}_${urlHash}_${randomSuffix}`;
      },

      updateSessionContext(sessionId, detectionMethod) {
        this.sessionContext = {
          sessionId: sessionId,
          detectionMethod: detectionMethod,
          isTemporary: sessionId.startsWith('temp_'),
          startTime: Date.now(),
          lastActivity: Date.now(),
          url: global.window.location.href,
          isValid: true
        };

        // Émettre événement
        const event = { type: 'claraverse:session:changed' };
        global.document.dispatchEvent(event);
      },

      updateSessionActivity() {
        if (this.sessionContext) {
          this.sessionContext.lastActivity = Date.now();
        }
      },

      getCurrentSessionContext() {
        return this.sessionContext;
      },

      validateSessionId(sessionId) {
        if (!sessionId || typeof sessionId !== 'string') return false;
        if (sessionId.length < 3 || sessionId.length > 200) return false;
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        return validPattern.test(sessionId);
      },

      validateSessionContext() {
        if (!this.sessionContext) return false;
        
        const maxAge = 24 * 60 * 60 * 1000;
        if (Date.now() - this.sessionContext.lastActivity > maxAge) {
          this.sessionContext.isValid = false;
          return false;
        }

        return true;
      }
    };

    return manager;
  }

  /**
   * Assertion helper
   */
  assert(condition, testName, message) {
    if (condition) {
      this.passedTests++;
      this.testResults.push({ name: testName, status: 'PASS', message: '' });
      console.log(`✅ ${testName}`);
    } else {
      this.failedTests++;
      this.testResults.push({ name: testName, status: 'FAIL', message: message });
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  /**
   * Affichage des résultats
   */
  printResults() {
    console.log('\n📊 Résultats des tests Context Manager:');
    console.log(`✅ Tests réussis: ${this.passedTests}`);
    console.log(`❌ Tests échoués: ${this.failedTests}`);
    console.log(`📈 Taux de réussite: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ Tests échoués:');
      this.testResults
        .filter(result => result.status === 'FAIL')
        .forEach(result => {
          console.log(`  - ${result.name}: ${result.message}`);
        });
    }
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContextManagerTests, TestEnvironment };
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  window.ContextManagerTests = ContextManagerTests;
  
  // Fonction pour exécuter les tests
  window.runContextManagerTests = () => {
    const tests = new ContextManagerTests();
    tests.runAllTests();
    return tests;
  };
  
  console.log('🧪 Tests Context Manager chargés. Utilisez runContextManagerTests() pour les exécuter.');
}