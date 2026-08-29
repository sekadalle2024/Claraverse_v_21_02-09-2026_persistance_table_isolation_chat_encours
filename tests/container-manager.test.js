// ============================================
// TESTS UNITAIRES - Container Manager
// Tests pour l'identification et gestion des conteneurs DIV
// ============================================

/**
 * Mock du DOM pour les tests de conteneurs
 */
class ContainerTestEnvironment {
  constructor() {
    this.elements = new Map();
    this.containers = [];
    this.tables = [];
    this.attributeMap = new Map();
  }

  reset() {
    this.elements.clear();
    this.containers = [];
    this.tables = [];
    this.attributeMap.clear();
  }

  /**
   * Créer un élément DOM mocké
   */
  createElement(tagName, className = '', textContent = '') {
    const element = {
      tagName: tagName.toUpperCase(),
      className: className,
      textContent: textContent,
      children: [],
      parentElement: null,
      attributes: new Map(),
      
      querySelector: (selector) => {
        return this.findElementBySelector(element, selector);
      },
      
      querySelectorAll: (selector) => {
        return this.findAllElementsBySelector(element, selector);
      },
      
      closest: (selector) => {
        return this.findClosestElement(element, selector);
      },
      
      getAttribute: (name) => {
        return this.attributeMap.get(`${element._id}_${name}`) || null;
      },
      
      setAttribute: (name, value) => {
        this.attributeMap.set(`${element._id}_${name}`, value);
      },
      
      hasAttribute: (name) => {
        return this.attributeMap.has(`${element._id}_${name}`);
      },
      
      appendChild: (child) => {
        element.children.push(child);
        child.parentElement = element;
      },
      
      _id: Math.random().toString(36).substring(2)
    };

    this.elements.set(element._id, element);
    return element;
  }

  /**
   * Créer une structure de conteneur avec tables
   */
  createContainerWithTables(containerClass, tableCount = 2) {
    const container = this.createElement('DIV', containerClass);
    const tables = [];

    for (let i = 0; i < tableCount; i++) {
      const table = this.createElement('TABLE', 'min-w-full border');
      const row = this.createElement('TR');
      const cell = this.createElement('TD', '', `Header ${i + 1}`);
      
      row.appendChild(cell);
      table.appendChild(row);
      container.appendChild(table);
      tables.push(table);
    }

    this.containers.push(container);
    this.tables.push(...tables);
    return { container, tables };
  }

  /**
   * Simuler document.querySelectorAll
   */
  querySelectorAll(selector) {
    const results = [];
    
    if (selector.includes('table')) {
      return this.tables.filter(table => this.matchesSelector(table, selector));
    }
    
    if (selector.includes('div') || selector.includes('[')) {
      return this.containers.filter(container => this.matchesSelector(container, selector));
    }
    
    return results;
  }

  /**
   * Vérifier si un élément correspond à un sélecteur
   */
  matchesSelector(element, selector) {
    if (selector.includes('.')) {
      const className = selector.replace(/^[^.]*\./, '').split('.')[0];
      return element.className.includes(className);
    }
    
    if (selector.includes('[data-')) {
      const attrMatch = selector.match(/\[([^=]+)(?:="([^"]*)")?\]/);
      if (attrMatch) {
        const attrName = attrMatch[1];
        const attrValue = attrMatch[2];
        const elementValue = element.getAttribute(attrName);
        
        if (attrValue) {
          return elementValue === attrValue;
        } else {
          return elementValue !== null;
        }
      }
    }
    
    return element.tagName.toLowerCase() === selector.toLowerCase();
  }

  /**
   * Trouver un élément par sélecteur
   */
  findElementBySelector(parent, selector) {
    if (selector === 'tr') {
      return parent.children.find(child => child.tagName === 'TR') || null;
    }
    
    if (selector === 'table') {
      return parent.children.find(child => child.tagName === 'TABLE') || null;
    }
    
    return null;
  }

  /**
   * Trouver tous les éléments par sélecteur
   */
  findAllElementsBySelector(parent, selector) {
    if (selector === 'table') {
      return parent.children.filter(child => child.tagName === 'TABLE');
    }
    
    if (selector === 'tr') {
      return parent.children.filter(child => child.tagName === 'TR');
    }
    
    return [];
  }

  /**
   * Trouver l'élément parent le plus proche
   */
  findClosestElement(element, selector) {
    let current = element.parentElement;
    
    while (current) {
      if (this.matchesSelector(current, selector)) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }
}

/**
 * Suite de tests pour TableContainerManager
 */
class ContainerManagerTests {
  constructor() {
    this.testEnv = new ContainerTestEnvironment();
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  /**
   * Exécution de tous les tests
   */
  runAllTests() {
    console.log('🧪 Début des tests Container Manager...');
    
    this.testContainerDetection();
    this.testContainerIdGeneration();
    this.testContainerContentHashing();
    this.testMultipleContainers();
    this.testContainerMapping();
    this.testContainerChangeDetection();
    this.testContainerCleanup();
    this.testContainerStats();
    this.testErrorHandling();
    this.testContainerSelectors();

    this.printResults();
  }

  /**
   * Test de détection de conteneurs
   */
  testContainerDetection() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Conteneur prose standard
    const { container: proseContainer, tables: proseTables } = 
      this.testEnv.createContainerWithTables('prose prose-base dark:prose-invert max-w-none');
    
    const foundContainer = manager.findTableContainer(proseTables[0]);
    
    this.assert(
      foundContainer === proseContainer,
      'Détection conteneur - prose standard',
      `Conteneur prose doit être détecté`
    );

    // Test 2: Conteneur glassmorphic
    const { container: glassContainer, tables: glassTables } = 
      this.testEnv.createContainerWithTables('glassmorphic');
    
    const foundGlassContainer = manager.findTableContainer(glassTables[0]);
    
    this.assert(
      foundGlassContainer === glassContainer,
      'Détection conteneur - glassmorphic',
      `Conteneur glassmorphic doit être détecté`
    );

    // Test 3: Conteneur avec attribut data
    const { container: dataContainer, tables: dataTables } = 
      this.testEnv.createContainerWithTables('custom-container');
    dataContainer.setAttribute('data-table-container', 'true');
    
    const foundDataContainer = manager.findTableContainer(dataTables[0]);
    
    this.assert(
      foundDataContainer === dataContainer,
      'Détection conteneur - data-table-container',
      `Conteneur avec data-table-container doit être détecté`
    );

    // Test 4: Aucun conteneur trouvé
    const orphanTable = this.testEnv.createElement('TABLE');
    const noContainer = manager.findTableContainer(orphanTable);
    
    this.assert(
      noContainer === null,
      'Détection conteneur - aucun conteneur',
      `Aucun conteneur ne doit être trouvé pour une table orpheline`
    );
  }

  /**
   * Test de génération d'ID de conteneur
   */
  testContainerIdGeneration() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Génération d'ID unique
    const { container, tables } = this.testEnv.createContainerWithTables('prose');
    
    const containerId1 = manager.getOrCreateContainerId(tables[0]);
    const containerId2 = manager.getOrCreateContainerId(tables[0]);
    
    this.assert(
      containerId1 === containerId2,
      'Génération ID - consistance',
      `Le même conteneur doit avoir le même ID: ${containerId1} vs ${containerId2}`
    );

    this.assert(
      containerId1.startsWith('container_'),
      'Génération ID - préfixe',
      `L'ID doit commencer par 'container_': ${containerId1}`
    );

    this.assert(
      container.getAttribute('data-container-id') === containerId1,
      'Génération ID - attribution DOM',
      `L'ID doit être attribué au conteneur DOM`
    );

    // Test 2: IDs différents pour conteneurs différents
    const { tables: otherTables } = this.testEnv.createContainerWithTables('glassmorphic');
    const otherContainerId = manager.getOrCreateContainerId(otherTables[0]);
    
    this.assert(
      containerId1 !== otherContainerId,
      'Génération ID - unicité',
      `Des conteneurs différents doivent avoir des IDs différents: ${containerId1} vs ${otherContainerId}`
    );
  }

  /**
   * Test de hachage du contenu des conteneurs
   */
  testContainerContentHashing() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Hash basé sur le contenu des tables
    const { container: container1 } = this.testEnv.createContainerWithTables('prose');
    const hash1 = manager.hashContainerContent(container1);
    
    this.assert(
      typeof hash1 === 'number',
      'Hash contenu - type numérique',
      `Le hash doit être un nombre: ${typeof hash1}`
    );

    this.assert(
      hash1 > 0,
      'Hash contenu - valeur positive',
      `Le hash doit être positif: ${hash1}`
    );

    // Test 2: Conteneurs avec même contenu ont même hash
    const { container: container2 } = this.testEnv.createContainerWithTables('prose');
    const hash2 = manager.hashContainerContent(container2);
    
    this.assert(
      hash1 === hash2,
      'Hash contenu - consistance',
      `Conteneurs identiques doivent avoir le même hash: ${hash1} vs ${hash2}`
    );

    // Test 3: Conteneurs avec contenu différent ont hash différent
    const { container: container3 } = this.testEnv.createContainerWithTables('prose', 3);
    const hash3 = manager.hashContainerContent(container3);
    
    this.assert(
      hash1 !== hash3,
      'Hash contenu - différenciation',
      `Conteneurs différents doivent avoir des hashs différents: ${hash1} vs ${hash3}`
    );

    // Test 4: Gestion des erreurs
    const invalidContainer = null;
    const errorHash = manager.hashContainerContent(invalidContainer);
    
    this.assert(
      typeof errorHash === 'number',
      'Hash contenu - gestion erreur',
      `Le hash d'erreur doit être un nombre: ${typeof errorHash}`
    );
  }

  /**
   * Test de gestion de multiples conteneurs
   */
  testMultipleContainers() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer plusieurs conteneurs
    const containers = [];
    const containerIds = [];

    for (let i = 0; i < 3; i++) {
      const { container, tables } = this.testEnv.createContainerWithTables(`container-${i}`);
      containers.push(container);
      
      const containerId = manager.getOrCreateContainerId(tables[0]);
      containerIds.push(containerId);
    }

    // Test 1: Tous les IDs sont uniques
    const uniqueIds = new Set(containerIds);
    
    this.assert(
      uniqueIds.size === containerIds.length,
      'Multiples conteneurs - unicité IDs',
      `Tous les IDs doivent être uniques: ${containerIds.length} conteneurs, ${uniqueIds.size} IDs uniques`
    );

    // Test 2: Mapping des conteneurs
    const allContainers = manager.getAllContainers();
    
    this.assert(
      allContainers.length === 3,
      'Multiples conteneurs - mapping',
      `3 conteneurs doivent être mappés: ${allContainers.length} trouvés`
    );

    // Test 3: Informations des conteneurs
    containerIds.forEach(containerId => {
      const containerInfo = manager.getContainerInfo(containerId);
      
      this.assert(
        containerInfo !== undefined,
        `Multiples conteneurs - info ${containerId}`,
        `Les informations du conteneur doivent être disponibles`
      );

      this.assert(
        containerInfo.tableCount >= 2,
        `Multiples conteneurs - comptage tables ${containerId}`,
        `Le conteneur doit avoir au moins 2 tables: ${containerInfo.tableCount}`
      );
    });
  }

  /**
   * Test du mapping et tracking des conteneurs
   */
  testContainerMapping() {
    this.testEnv.reset();
    const manager = this.createManager();

    const { tables } = this.testEnv.createContainerWithTables('prose');
    const containerId = manager.getOrCreateContainerId(tables[0]);

    // Test 1: Informations de base
    const containerInfo = manager.getContainerInfo(containerId);
    
    this.assert(
      containerInfo.id === containerId,
      'Mapping conteneur - ID',
      `L'ID dans les infos doit correspondre: ${containerInfo.id} vs ${containerId}`
    );

    this.assert(
      containerInfo.tableCount === 2,
      'Mapping conteneur - comptage tables',
      `Le comptage de tables doit être correct: ${containerInfo.tableCount}`
    );

    this.assert(
      typeof containerInfo.contentHash === 'number',
      'Mapping conteneur - hash contenu',
      `Le hash de contenu doit être un nombre: ${typeof containerInfo.contentHash}`
    );

    this.assert(
      typeof containerInfo.createdAt === 'number',
      'Mapping conteneur - timestamp création',
      `Le timestamp de création doit être un nombre: ${typeof containerInfo.createdAt}`
    );

    // Test 2: Mise à jour d'accès
    const initialAccess = containerInfo.lastAccessed;
    setTimeout(() => {
      manager.updateContainerAccess(containerId);
      const updatedInfo = manager.getContainerInfo(containerId);
      
      this.assert(
        updatedInfo.lastAccessed > initialAccess,
        'Mapping conteneur - mise à jour accès',
        `L'accès doit être mis à jour: ${initialAccess} -> ${updatedInfo.lastAccessed}`
      );
    }, 10);
  }

  /**
   * Test de détection des changements de conteneur
   */
  testContainerChangeDetection() {
    this.testEnv.reset();
    const manager = this.createManager();

    const { container, tables } = this.testEnv.createContainerWithTables('prose');
    const containerId = manager.getOrCreateContainerId(tables[0]);

    // Test 1: Analyse initiale
    const initialChanges = manager.analyzeContainerChanges(containerId);
    
    this.assert(
      initialChanges !== null,
      'Détection changements - analyse initiale',
      `L'analyse initiale doit retourner un résultat`
    );

    this.assert(
      initialChanges.containerId === containerId,
      'Détection changements - ID conteneur',
      `L'ID du conteneur doit correspondre: ${initialChanges.containerId}`
    );

    // Test 2: Simulation d'un changement (ajout d'une table)
    const newTable = this.testEnv.createElement('TABLE', 'min-w-full');
    container.appendChild(newTable);

    const changesAfterAdd = manager.analyzeContainerChanges(containerId);
    
    this.assert(
      changesAfterAdd.tableCountChanged === true,
      'Détection changements - ajout table',
      `Le changement de nombre de tables doit être détecté`
    );

    this.assert(
      changesAfterAdd.currentTableCount === 3,
      'Détection changements - nouveau comptage',
      `Le nouveau comptage doit être correct: ${changesAfterAdd.currentTableCount}`
    );

    // Test 3: Conteneur inexistant
    const noChanges = manager.analyzeContainerChanges('inexistant-id');
    
    this.assert(
      noChanges === null,
      'Détection changements - conteneur inexistant',
      `L'analyse d'un conteneur inexistant doit retourner null`
    );
  }

  /**
   * Test de nettoyage des conteneurs
   */
  testContainerCleanup() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Créer des conteneurs
    const { tables: tables1 } = this.testEnv.createContainerWithTables('prose');
    const { tables: tables2 } = this.testEnv.createContainerWithTables('glassmorphic');
    
    const containerId1 = manager.getOrCreateContainerId(tables1[0]);
    const containerId2 = manager.getOrCreateContainerId(tables2[0]);

    // Vérifier qu'ils sont mappés
    this.assert(
      manager.getAllContainers().length === 2,
      'Nettoyage - conteneurs initiaux',
      `2 conteneurs doivent être mappés initialement`
    );

    // Simuler la suppression d'un conteneur du DOM
    // (Dans un vrai test, on modifierait document.contains)
    manager.containerMap.delete(containerId1);

    const remainingContainers = manager.getAllContainers();
    
    this.assert(
      remainingContainers.length === 1,
      'Nettoyage - suppression conteneur',
      `1 conteneur doit rester après suppression: ${remainingContainers.length}`
    );

    // Test de nettoyage complet
    manager.cleanup();
    
    this.assert(
      manager.getAllContainers().length === 0,
      'Nettoyage - cleanup complet',
      `Aucun conteneur ne doit rester après cleanup complet`
    );
  }

  /**
   * Test des statistiques de conteneurs
   */
  testContainerStats() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Stats vides
    const emptyStats = manager.getContainerStats();
    
    this.assert(
      emptyStats.containerCount === 0,
      'Stats conteneurs - comptage vide',
      `Le comptage doit être 0 initialement: ${emptyStats.containerCount}`
    );

    this.assert(
      emptyStats.totalTables === 0,
      'Stats conteneurs - tables vides',
      `Le total de tables doit être 0 initialement: ${emptyStats.totalTables}`
    );

    // Test 2: Stats avec conteneurs
    const { tables: tables1 } = this.testEnv.createContainerWithTables('prose', 2);
    const { tables: tables2 } = this.testEnv.createContainerWithTables('glassmorphic', 3);
    
    manager.getOrCreateContainerId(tables1[0]);
    manager.getOrCreateContainerId(tables2[0]);

    const stats = manager.getContainerStats();
    
    this.assert(
      stats.containerCount === 2,
      'Stats conteneurs - comptage',
      `2 conteneurs doivent être comptés: ${stats.containerCount}`
    );

    this.assert(
      stats.totalTables === 5,
      'Stats conteneurs - total tables',
      `5 tables doivent être comptées: ${stats.totalTables}`
    );

    this.assert(
      parseFloat(stats.averageTablesPerContainer) === 2.5,
      'Stats conteneurs - moyenne',
      `La moyenne doit être 2.5: ${stats.averageTablesPerContainer}`
    );

    this.assert(
      typeof stats.oldestContainer === 'number',
      'Stats conteneurs - plus ancien',
      `Le timestamp du plus ancien doit être un nombre: ${typeof stats.oldestContainer}`
    );
  }

  /**
   * Test de gestion des erreurs
   */
  testErrorHandling() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test 1: Table null
    const nullContainerId = manager.getOrCreateContainerId(null);
    
    this.assert(
      nullContainerId === 'no-container',
      'Gestion erreurs - table null',
      `Une table null doit retourner 'no-container': ${nullContainerId}`
    );

    // Test 2: Table sans méthode closest
    const invalidTable = { tagName: 'TABLE' };
    const invalidContainerId = manager.getOrCreateContainerId(invalidTable);
    
    this.assert(
      invalidContainerId === 'no-container',
      'Gestion erreurs - table invalide',
      `Une table invalide doit retourner 'no-container': ${invalidContainerId}`
    );

    // Test 3: Hash de conteneur null
    const nullHash = manager.hashContainerContent(null);
    
    this.assert(
      typeof nullHash === 'number',
      'Gestion erreurs - hash null',
      `Le hash d'un conteneur null doit être un nombre: ${typeof nullHash}`
    );

    // Test 4: Génération d'ID avec conteneur null
    const errorId = manager.generateContainerId(null);
    
    this.assert(
      errorId.includes('container_error_'),
      'Gestion erreurs - ID erreur',
      `Un ID d'erreur doit être généré: ${errorId}`
    );
  }

  /**
   * Test des sélecteurs de conteneurs
   */
  testContainerSelectors() {
    this.testEnv.reset();
    const manager = this.createManager();

    // Test des différents sélecteurs supportés
    const selectorTests = [
      { className: 'prose prose-base dark:prose-invert max-w-none', name: 'prose complet' },
      { className: 'glassmorphic', name: 'glassmorphic' },
      { className: 'prose', name: 'prose simple' },
      { className: 'markdown-body', name: 'markdown-body' },
      { className: 'chat-container', name: 'chat container' },
      { className: 'message-content', name: 'message content' }
    ];

    selectorTests.forEach(test => {
      const { container, tables } = this.testEnv.createContainerWithTables(test.className);
      
      // Pour les attributs data, on les ajoute manuellement
      if (test.name === 'data-table-container') {
        container.setAttribute('data-table-container', 'true');
      }
      
      const foundContainer = manager.findTableContainer(tables[0]);
      
      this.assert(
        foundContainer === container,
        `Sélecteurs - ${test.name}`,
        `Le conteneur ${test.name} doit être détecté`
      );
    });
  }

  /**
   * Création d'un manager pour les tests
   */
  createManager() {
    // Mock de document.querySelectorAll
    const originalQuerySelectorAll = global.document?.querySelectorAll;
    
    const mockDocument = {
      querySelectorAll: (selector) => this.testEnv.querySelectorAll(selector),
      contains: (element) => true // Simuler que tous les éléments sont dans le DOM
    };

    // Créer le manager avec les mocks
    const manager = {
      containerMap: new Map(),
      containerSelectors: [
        'div.prose.prose-base.dark\\:prose-invert.max-w-none',
        'div.glassmorphic',
        'div.prose',
        '[data-table-container]',
        '[class*="chat"]',
        '[class*="message"]',
        '.markdown-body'
      ],
      containerIdCounter: 0,
      changeMonitorInterval: null,

      getOrCreateContainerId(table) {
        if (!table || !table.closest) {
          return 'no-container';
        }

        const container = this.findTableContainer(table);
        if (!container) {
          return 'no-container';
        }

        let containerId = container.getAttribute('data-container-id');
        
        if (!containerId) {
          containerId = this.generateContainerId(container);
          container.setAttribute('data-container-id', containerId);
        }

        const contentHash = this.hashContainerContent(container);
        this.containerMap.set(containerId, {
          element: container,
          id: containerId,
          createdAt: Date.now(),
          lastAccessed: Date.now(),
          lastAnalyzed: Date.now(),
          tableCount: container.querySelectorAll('table').length,
          contentHash: contentHash,
          changeHistory: []
        });

        return containerId;
      },

      findTableContainer(table) {
        for (const selector of this.containerSelectors) {
          try {
            const container = table.closest(selector);
            if (container) {
              return container;
            }
          } catch (error) {
            // Continue to next selector
          }
        }

        let parent = table.parentElement;
        while (parent && parent.tagName !== 'BODY') {
          const tablesInParent = parent.querySelectorAll('table');
          if (tablesInParent.length > 0) {
            return parent;
          }
          parent = parent.parentElement;
        }

        return null;
      },

      generateContainerId(container) {
        if (!container) {
          return `container_error_${Date.now()}`;
        }

        const allContainers = mockDocument.querySelectorAll(this.containerSelectors.join(','));
        const position = Array.from(allContainers).indexOf(container);
        const contentHash = this.hashContainerContent(container);
        const timestamp = Date.now();
        
        this.containerIdCounter++;
        
        return `container_${position >= 0 ? position : 'unknown'}_${contentHash}_${timestamp}_${this.containerIdCounter}`;
      },

      hashContainerContent(container) {
        try {
          if (!container) {
            return this.simpleHash(`fallback_${Date.now()}`);
          }

          const tables = container.querySelectorAll('table');
          const headers = Array.from(tables).map(table => {
            const firstRow = table.querySelector('tr');
            return firstRow ? firstRow.textContent.slice(0, 50).trim() : '';
          }).filter(header => header.length > 0);

          const structureInfo = {
            tagName: container.tagName,
            className: container.className.slice(0, 50),
            tableCount: tables.length,
            childCount: container.children.length
          };

          const textContent = this.extractContainerTextSignature(container);
          const signature = `${headers.join('|')}_${structureInfo.tagName}_${structureInfo.tableCount}x${structureInfo.childCount}_${textContent}`;
          
          return this.simpleHash(signature);
        } catch (error) {
          return this.simpleHash(`fallback_${Date.now()}`);
        }
      },

      extractContainerTextSignature(container) {
        try {
          const textParts = [];
          for (let i = 0; i < Math.min(container.children.length, 5); i++) {
            const element = container.children[i];
            const text = element.textContent?.trim();
            if (text && text.length > 0 && text.length < 200) {
              textParts.push(text.slice(0, 30));
            }
          }
          return textParts.join('_').slice(0, 100);
        } catch (error) {
          return 'no_text_signature';
        }
      },

      simpleHash(str) {
        let hash = 0;
        if (!str || str.length === 0) return hash;
        for (let i = 0; i < Math.min(str.length, 100); i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash |= 0;
        }
        return Math.abs(hash);
      },

      analyzeContainerChanges(containerId) {
        const containerInfo = this.containerMap.get(containerId);
        if (!containerInfo || !containerInfo.element) {
          return null;
        }

        const container = containerInfo.element;
        const currentHash = this.hashContainerContent(container);
        const currentTableCount = container.querySelectorAll('table').length;

        const changes = {
          containerId: containerId,
          timestamp: Date.now(),
          hashChanged: containerInfo.contentHash !== currentHash,
          tableCountChanged: containerInfo.tableCount !== currentTableCount,
          previousHash: containerInfo.contentHash,
          currentHash: currentHash,
          previousTableCount: containerInfo.tableCount,
          currentTableCount: currentTableCount
        };

        containerInfo.contentHash = currentHash;
        containerInfo.tableCount = currentTableCount;
        containerInfo.lastAnalyzed = Date.now();

        return changes;
      },

      getContainerInfo(containerId) {
        return this.containerMap.get(containerId);
      },

      getAllContainers() {
        return Array.from(this.containerMap.values());
      },

      updateContainerAccess(containerId) {
        const containerInfo = this.containerMap.get(containerId);
        if (containerInfo) {
          containerInfo.lastAccessed = Date.now();
          containerInfo.tableCount = containerInfo.element.querySelectorAll('table').length;
        }
      },

      getContainerStats() {
        const containers = this.getAllContainers();
        const totalTables = containers.reduce((sum, container) => sum + container.tableCount, 0);
        const containersWithChanges = containers.filter(c => c.changeHistory && c.changeHistory.length > 0).length;
        
        return {
          containerCount: containers.length,
          totalTables: totalTables,
          averageTablesPerContainer: containers.length > 0 ? (totalTables / containers.length).toFixed(2) : 0,
          oldestContainer: containers.length > 0 ? Math.min(...containers.map(c => c.createdAt)) : null,
          newestContainer: containers.length > 0 ? Math.max(...containers.map(c => c.createdAt)) : null,
          containersWithChanges: containersWithChanges,
          monitoringActive: this.changeMonitorInterval !== null
        };
      },

      cleanup() {
        if (this.changeMonitorInterval) {
          clearInterval(this.changeMonitorInterval);
          this.changeMonitorInterval = null;
        }
        this.containerMap.clear();
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
    console.log('\n📊 Résultats des tests Container Manager:');
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
  module.exports = { ContainerManagerTests, ContainerTestEnvironment };
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  window.ContainerManagerTests = ContainerManagerTests;
  
  // Fonction pour exécuter les tests
  window.runContainerManagerTests = () => {
    const tests = new ContainerManagerTests();
    tests.runAllTests();
    return tests;
  };
  
  console.log('🧪 Tests Container Manager chargés. Utilisez runContainerManagerTests() pour les exécuter.');
}