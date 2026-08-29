// Menu contextuel pour les tables dans le chat - ClaraVerse
// Compatible avec l'existant TableManager dans index.html

(function() {
  'use strict';

  class ContextualMenuManager {
    constructor() {
      this.menuElement = null;
      this.isMenuVisible = false;
      this.targetTable = null;
      this.initialized = false;
      this.hoverTimeout = null;
      this.isHoveringTable = false;
      this.isHoveringMenu = false;
    }

    // Initialise le gestionnaire de menu contextuel
    init() {
      if (this.initialized) return;
      
      console.log('🎯 Initialisation du menu contextuel pour les tables (survol)');
      this.createMenuElement();
      this.attachEventListeners();
      this.observeNewTables();
      this.processExistingTables();
      this.initialized = true;
    }

    // Crée l'élément HTML du menu contextuel
    createMenuElement() {
      this.menuElement = document.createElement('div');
      this.menuElement.id = 'contextual-table-menu';
      this.menuElement.className = 'contextual-menu';
      this.menuElement.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 8px 0;
        z-index: 10000;
        display: none;
        min-width: 160px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      `;

      // Création des boutons du menu
      const menuItems = [
        { text: 'Hello France', action: () => this.showAlert('Hello France 🇫🇷') },
        { text: 'Hello Italie', action: () => this.showAlert('Hello Italie 🇮🇹') },
        { text: 'Hello Ghana', action: () => this.showAlert('Hello Ghana 🇬🇭') }
      ];

      menuItems.forEach(item => {
        const button = document.createElement('button');
        button.textContent = item.text;
        button.className = 'contextual-menu-item';
        button.style.cssText = `
          width: 100%;
          background: none;
          border: none;
          padding: 10px 16px;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 14px;
          color: #333;
        `;

        // Effets de survol
        button.addEventListener('mouseenter', () => {
          button.style.backgroundColor = '#f0f8ff';
          button.style.color = '#007bff';
        });

        button.addEventListener('mouseleave', () => {
          button.style.backgroundColor = 'transparent';
          button.style.color = '#333';
        });

        // Action au clic
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          item.action();
          this.hideMenu();
        });

        this.menuElement.appendChild(button);
      });

      // Gérer le survol du menu lui-même
      this.menuElement.addEventListener('mouseenter', () => {
        this.isHoveringMenu = true;
        this.clearHideTimeout();
      });

      this.menuElement.addEventListener('mouseleave', () => {
        this.isHoveringMenu = false;
        this.scheduleHideMenu();
      });

      document.body.appendChild(this.menuElement);
    }

    // Attache les événements pour le menu contextuel
    attachEventListeners() {
      // Gestionnaire pour le survol des tables (remplace le clic droit)
      document.addEventListener('mouseover', (e) => {
        const table = e.target.closest('table');
        if (table && this.isTableInChat(table)) {
          this.handleTableHover(e, table);
        }
      });

      // Gestionnaire pour quitter le survol des tables
      document.addEventListener('mouseout', (e) => {
        const table = e.target.closest('table');
        if (table && this.isTableInChat(table)) {
          this.handleTableLeave(e, table);
        }
      });

      // Masquer le menu en cliquant ailleurs (garde cette fonctionnalité)
      document.addEventListener('click', (e) => {
        if (this.isMenuVisible && !this.menuElement.contains(e.target)) {
          this.hideMenu();
        }
      });

      // Masquer le menu avec Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isMenuVisible) {
          this.hideMenu();
        }
      });
    }

    // Gère le survol d'une table
    handleTableHover(e, table) {
      this.isHoveringTable = true;
      this.clearHideTimeout();
      
      // Délai avant d'afficher le menu pour éviter les apparitions intempestives
      if (this.targetTable !== table) {
        this.hoverTimeout = setTimeout(() => {
          if (this.isHoveringTable) {
            this.showMenu(e.pageX + 10, e.pageY + 10, table);
          }
        }, 800); // Délai de 800ms avant affichage
      }
    }

    // Gère la sortie du survol d'une table
    handleTableLeave(e, table) {
      this.isHoveringTable = false;
      this.clearHoverTimeout();
      
      // Délai avant masquage pour permettre le passage vers le menu
      this.scheduleHideMenu();
    }

    // Programme le masquage du menu avec délai
    scheduleHideMenu() {
      this.hoverTimeout = setTimeout(() => {
        if (!this.isHoveringTable && !this.isHoveringMenu) {
          this.hideMenu();
        }
      }, 300); // Délai de 300ms avant masquage
    }

    // Annule le timeout de survol
    clearHoverTimeout() {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    }

    // Annule le timeout de masquage
    clearHideTimeout() {
      this.clearHoverTimeout();
    }

    // Vérifie si la table est dans une zone de chat
    isTableInChat(table) {
      // Recherche des conteneurs de chat typiques de ClaraVerse
      const chatSelectors = [
        '[class*="chat"]',
        '[class*="message"]',
        '[class*="conversation"]',
        '[id*="chat"]',
        '[data-testid*="chat"]',
        '.prose', // Souvent utilisé pour le contenu Markdown
        '.prose-base',
        '.markdown-body',
        '[class*="assistant"]',
        '[data-editable-processed]' // Compatible avec TableManager existant
      ];

      for (const selector of chatSelectors) {
        if (table.closest(selector)) {
          return true;
        }
      }

      return false;
    }

    // Affiche le menu contextuel
    showMenu(x, y, table) {
      this.targetTable = table;
      this.menuElement.style.left = `${x}px`;
      this.menuElement.style.top = `${y}px`;
      this.menuElement.style.display = 'block';
      
      // Animation d'apparition
      setTimeout(() => {
        this.menuElement.style.opacity = '1';
      }, 10);
      
      this.isMenuVisible = true;

      console.log('📋 Menu contextuel affiché au survol pour la table:', table.getAttribute('data-table-index') || 'sans index');

      // Ajustement si le menu dépasse les bords de l'écran
      setTimeout(() => {
        const rect = this.menuElement.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (rect.right > windowWidth) {
          this.menuElement.style.left = `${windowWidth - rect.width - 10}px`;
        }

        if (rect.bottom > windowHeight) {
          this.menuElement.style.top = `${windowHeight - rect.height - 10}px`;
        }
      }, 0);
    }

    // Masque le menu contextuel
    hideMenu() {
      if (!this.isMenuVisible) return;
      
      // Animation de disparition
      this.menuElement.style.opacity = '0';
      
      setTimeout(() => {
        this.menuElement.style.display = 'none';
        this.isMenuVisible = false;
        this.targetTable = null;
        this.isHoveringTable = false;
        this.isHoveringMenu = false;
      }, 200);
      
      this.clearHoverTimeout();
    }

    // Affiche une alerte avec le message spécifié
    showAlert(message) {
      alert(message);
      console.log(`🔔 Alerte affichée: ${message}`);
    }

    // Observe l'ajout de nouvelles tables (compatible avec TableManager)
    observeNewTables() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Vérifie si le nœud lui-même est une table
              if (node.tagName === 'TABLE' && this.isTableInChat(node)) {
                console.log('📊 Nouvelle table détectée dans le chat (menu survol ready)');
              }
              
              // Cherche les tables dans les nouveaux nœuds
              if (node.querySelectorAll) {
                const tables = node.querySelectorAll('table');
                tables.forEach(table => {
                  if (this.isTableInChat(table)) {
                    console.log('📊 Sous-table détectée (menu survol ready)');
                  }
                });
              }
            }
          });
        });
      });

      // Observer les changements dans le body avec délai pour éviter conflicts
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('👁️ Observer menu survol activé (compatible TableManager)');
    }

    // Traite les tables existantes
    processExistingTables() {
      const tables = document.querySelectorAll('table');
      let chatTablesCount = 0;
      
      tables.forEach(table => {
        if (this.isTableInChat(table)) {
          chatTablesCount++;
        }
      });

      console.log(`📊 ${chatTablesCount} table(s) de chat ready pour menu survol`);
    }

    // Méthode publique pour forcer l'initialisation
    forceInit() {
      console.log('🔧 Initialisation forcée du menu survol');
      this.init();
    }
  }

  // Instance globale du gestionnaire de menu
  const contextualMenuManager = new ContextualMenuManager();

  // Fonctions globales pour l'intégration
  window.initContextualMenu = function() {
    contextualMenuManager.init();
  };

  window.forceContextualMenu = function() {
    contextualMenuManager.forceInit();
  };

  // Auto-initialisation avec délai pour compatibilité TableManager
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => contextualMenuManager.init(), 2000);
    });
  } else {
    setTimeout(() => contextualMenuManager.init(), 2000);
  }

  console.log('✅ Menu survol ClaraVerse chargé et compatible avec TableManager');

})();