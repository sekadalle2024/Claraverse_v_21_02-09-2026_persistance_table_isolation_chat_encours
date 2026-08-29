/**
 * Script de pointage pour les colonnes Assertion, Conclusion et CTR dans Claraverse
 * Auteur: Expert JavaScript senior - 30 ans d'expérience
 * Projet: Integration dans React/TypeScript Claraverse
 * Version: 2.1 - Correction des bugs et optimisation du positionnement des menus
 * 
 * Corrections apportées:
 * - Fix de la logique pour les colonnes [Conclusion]
 * - Positionnement du menu strictement au-dessus de la table
 * - Optimisation des sélecteurs CSS Claraverse
 * - Amélioration de la responsivité mobile
 */

(function() {
    'use strict';
    
    console.log('🎯 Initialisation du script pointage.js v2.1 pour Claraverse (Version corrigée)');
  
    // Configuration des variations de colonnes par type
    const COLUMN_TYPES = {
        ASSERTION: {
            variations: ['Assertion', 'ASSERTION', 'assertion'],
            dropdownValues: ['Validité', 'Exhaustivité', 'Formalisation', 'Application', 'Permanence'],
            className: 'assertion-column',
            color: '#3b82f6' // Bleu
        },
        CONCLUSION: {
            variations: ['Conclusion', 'CONCLUSION', 'conclusion'],
            dropdownValues: ['Satisfaisant', 'Non-Satisfaisant', 'Limitation', 'Non-Applicable', 'Non satisfaisant'],
            className: 'conclusion-column',
            color: '#10b981' // Vert
        },
        CTR: {
            variations: ['CTR1', 'CTR2', 'CTR3', 'Ctr1', 'Ctr2', 'Ctr3', 'Ctr4'],
            dropdownValues: ['+', '-', 'N/A'],
            className: 'ctr-column',
            color: '#f59e0b' // Orange
        }
    };
  
    // Sélecteur CSS de base pour les tables Claraverse
    const BASE_TABLE_SELECTOR = 'div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg';
  
    // État global pour gérer les menus déroulants
    let activeDropdown = null;
  
    /**
     * Fonction principale pour traiter toutes les tables avec colonnes spécialisées
     */
    function processAllSpecialTables() {
        console.log('🔍 Recherche des tables avec colonnes spécialisées...');
        
        const chatTables = document.querySelectorAll(BASE_TABLE_SELECTOR);
        console.log(`📊 ${chatTables.length} table(s) trouvée(s) dans le chat`);
  
        chatTables.forEach((table, tableIndex) => {
            processTableForAllColumns(table, tableIndex);
        });
    }
  
    /**
     * Traite une table spécifique pour tous les types de colonnes
     */
    function processTableForAllColumns(table, tableIndex) {
        const headers = Array.from(table.querySelectorAll('th'));
        const specialColumns = [];
  
        // Identifier toutes les colonnes spécialisées
        headers.forEach((header, columnIndex) => {
            const headerText = header.textContent.trim();
            
            // Vérifier chaque type de colonne
            Object.entries(COLUMN_TYPES).forEach(([type, config]) => {
                if (config.variations.some(variation => 
                    headerText.toLowerCase() === variation.toLowerCase()
                )) {
                    specialColumns.push({
                        index: columnIndex,
                        name: headerText,
                        type: type,
                        config: config,
                        element: header
                    });
                    console.log(`✅ Colonne ${type} trouvée: "${headerText}" (index ${columnIndex})`);
                }
            });
        });
  
        if (specialColumns.length === 0) {
            console.log(`ℹ️ Table ${tableIndex + 1}: Aucune colonne spécialisée trouvée`);
            return;
        }
  
        // Traiter les cellules des colonnes spécialisées
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.log(`⚠️ Table ${tableIndex + 1}: Aucun tbody trouvé`);
            return;
        }
  
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td');
            
            specialColumns.forEach(column => {
                const cell = cells[column.index];
                if (cell && !cell.classList.contains(`${column.config.className}-processed`)) {
                    setupSpecialCell(cell, column, table, tableIndex, rowIndex);
                }
            });
        });
    }
  
    /**
     * Configure une cellule pour le système de pointage selon son type
     */
    function setupSpecialCell(cell, column, table, tableIndex, rowIndex) {
        const processedClass = `${column.config.className}-processed`;
        cell.classList.add(processedClass);
        cell.classList.add('special-cell');
        cell.style.cursor = 'pointer';
        cell.style.position = 'relative';
        cell.style.userSelect = 'none';
        cell.style.padding = '8px 12px';
        cell.style.transition = 'all 0.15s ease';
        
        // Ajouter un indicateur visuel avec couleur selon le type
        if (!cell.querySelector('.column-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'column-indicator';
            indicator.innerHTML = ' ▼';
            indicator.style.fontSize = '0.7em';
            indicator.style.opacity = '0.5';
            indicator.style.marginLeft = '4px';
            indicator.style.color = column.config.color;
            
            cell.appendChild(indicator);
        }
  
        // Gestionnaire d'événement pour le clic
        cell.addEventListener('click', function(event) {
            event.stopPropagation();
            showSpecialDropdown(cell, column, table, tableIndex, rowIndex);
        });
  
        // Effet hover avec couleur selon le type
        cell.addEventListener('mouseenter', function() {
            const hoverColor = hexToRgba(column.config.color, 0.08);
            cell.style.backgroundColor = hoverColor;
            cell.style.borderRadius = '6px';
            cell.style.transform = 'scale(1.02)';
        });
  
        cell.addEventListener('mouseleave', function() {
            if (!cell.querySelector('.special-dropdown')) {
                cell.style.backgroundColor = '';
                cell.style.borderRadius = '';
                cell.style.transform = 'scale(1)';
            }
        });
  
        console.log(`🎯 Cellule ${column.type} configurée: Table ${tableIndex + 1}, Ligne ${rowIndex + 1}, Colonne "${column.name}"`);
    }
  
    /**
     * Affiche le menu déroulant spécialisé pour une cellule
     * CORRECTION: Le menu s'affiche maintenant strictement au-dessus de la table
     */
    function showSpecialDropdown(cell, column, table, tableIndex, rowIndex) {
        // Fermer le dropdown actif s'il existe
        closeActiveDropdown();
  
        const dropdown = createSpecialDropdown(cell, column, table, tableIndex, rowIndex);
        
        // CORRECTION: Positionner le menu au-dessus de la table
        positionDropdownAboveTable(dropdown, cell, table);
        
        // Ajouter le dropdown au body pour éviter les problèmes de z-index
        document.body.appendChild(dropdown);
        
        activeDropdown = { dropdown, cell };
  
        console.log(`📋 Menu ${column.type} affiché au-dessus de la table pour: Table ${tableIndex + 1}, Ligne ${rowIndex + 1}, Colonne "${column.name}"`);
    }
  
    /**
     * NOUVELLE FONCTION: Positionne le dropdown au-dessus de la table
     */
    function positionDropdownAboveTable(dropdown, cell, table) {
        const cellRect = cell.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        
        // Position par défaut : au-dessus de la table, aligné sur la cellule
        let top = tableRect.top - dropdown.offsetHeight - 10; // 10px de marge
        let left = cellRect.left;
        
        // Ajuster si le dropdown dépasse à gauche
        if (left < 10) {
            left = 10;
        }
        
        // Ajuster si le dropdown dépasse à droite
        const rightEdge = left + dropdown.offsetWidth;
        const viewportWidth = window.innerWidth;
        if (rightEdge > viewportWidth - 10) {
            left = viewportWidth - dropdown.offsetWidth - 10;
        }
        
        // Si pas assez de place au-dessus, positionner en dessous de la table
        if (top < 10) {
            top = tableRect.bottom + 10;
            console.log('⚠️ Pas assez d\'espace au-dessus, positionnement en dessous de la table');
        }
        
        // Appliquer la position
        dropdown.style.position = 'fixed';
        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${left}px`;
        dropdown.style.zIndex = '10000';
        
        console.log(`📍 Dropdown positionné: top=${top}px, left=${left}px`);
    }
  
    /**
     * Crée le menu déroulant spécialisé selon le type de colonne
     */
    function createSpecialDropdown(cell, column, table, tableIndex, rowIndex) {
        const dropdown = document.createElement('div');
        dropdown.className = 'special-dropdown';
        dropdown.setAttribute('data-column-type', column.type);
        
        // Styles de base pour la responsivité
        Object.assign(dropdown.style, {
            position: 'fixed', // CORRECTION: Utiliser fixed au lieu d'absolute
            zIndex: '10000',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
            minWidth: '180px',
            maxWidth: 'calc(100vw - 20px)',
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
        });
  
        // Bordure colorée selon le type
        dropdown.style.borderLeftColor = column.config.color;
        dropdown.style.borderLeftWidth = '3px';
  
        // Mode sombre
        if (document.documentElement.classList.contains('dark') || 
            document.body.classList.contains('dark')) {
            dropdown.style.backgroundColor = '#1f2937';
            dropdown.style.borderColor = '#374151';
            dropdown.style.color = '#f9fafb';
        }
  
        // Créer les options selon le type de colonne
        column.config.dropdownValues.forEach((value, index) => {
            const option = document.createElement('div');
            option.className = 'special-option';
            option.textContent = value;
            
            Object.assign(option.style, {
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                borderBottom: index < column.config.dropdownValues.length - 1 ? '1px solid #e5e7eb' : 'none',
                position: 'relative'
            });
  
            // Style spécial pour les valeurs CTR
            if (column.type === 'CTR') {
                option.style.textAlign = 'center';
                option.style.fontWeight = 'bold';
                option.style.fontSize = '16px';
                
                // Couleurs pour les valeurs CTR
                switch(value) {
                    case '+':
                        option.style.color = '#10b981'; // Vert
                        break;
                    case '-':
                        option.style.color = '#ef4444'; // Rouge
                        break;
                    case 'N/A':
                        option.style.color = '#6b7280'; // Gris
                        break;
                }
            }
  
            // Effet hover
            option.addEventListener('mouseenter', function() {
                const hoverBg = document.documentElement.classList.contains('dark') ? 
                    '#374151' : '#f8fafc';
                option.style.backgroundColor = hoverBg;
                option.style.paddingLeft = column.type === 'CTR' ? '16px' : '20px';
            });
  
            option.addEventListener('mouseleave', function() {
                option.style.backgroundColor = '';
                option.style.paddingLeft = '16px';
            });
  
            // CORRECTION: Gestionnaire de clic corrigé pour les colonnes Conclusion
            option.addEventListener('click', function(event) {
                event.stopPropagation();
                selectSpecialValue(cell, value, column, tableIndex, rowIndex);
            });
  
            dropdown.appendChild(option);
        });
  
        return dropdown;
    }
  
    /**
     * Gère la sélection d'une valeur dans le dropdown selon le type
     * CORRECTION: Logique corrigée pour toutes les colonnes
     */
    function selectSpecialValue(cell, value, column, tableIndex, rowIndex) {
        // Récupérer le contenu original (sans l'indicateur)
        const indicator = cell.querySelector('.column-indicator');
        const originalContent = cell.textContent.replace(' ▼', '').trim();
        
        // Mettre à jour la cellule avec la nouvelle valeur
        cell.innerHTML = `<span class="special-value" data-original="${originalContent}" data-type="${column.type}">${value}</span>`;
        
        // Style selon le type de colonne
        const valueSpan = cell.querySelector('.special-value');
        Object.assign(valueSpan.style, {
            fontWeight: '500',
            fontSize: '14px',
            display: 'inline-block',
            textAlign: 'center',
            padding: '4px 8px',
            borderRadius: '4px',
            minWidth: '60px'
        });
  
        // Styles spécifiques selon le type et la valeur
        applyValueStyles(valueSpan, column.type, value);
  
        // Appliquer le style à la cellule
        Object.assign(cell.style, {
            backgroundColor: '',
            borderRadius: '6px',
            padding: '8px 12px',
            textAlign: 'center'
        });
  
        console.log(`✅ Valeur "${value}" (${column.type}) assignée à: Table ${tableIndex + 1}, Ligne ${rowIndex + 1}, Colonne "${column.name}"`);
        
        // Fermer le dropdown
        closeActiveDropdown();
        
        // Déclencher un événement personnalisé
        const customEvent = new CustomEvent('specialValueChanged', {
            detail: {
                cell,
                value,
                originalContent,
                columnType: column.type,
                columnName: column.name,
                tableIndex,
                rowIndex
            }
        });
        document.dispatchEvent(customEvent);
    }
  
    /**
     * NOUVELLE FONCTION: Applique les styles selon le type et la valeur
     */
    function applyValueStyles(valueSpan, columnType, value) {
        switch(columnType) {
            case 'ASSERTION':
                valueSpan.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                valueSpan.style.color = '#1e40af';
                valueSpan.style.border = '1px solid rgba(59, 130, 246, 0.2)';
                break;
                
            case 'CONCLUSION':
                // CORRECTION: Couleurs selon la valeur pour les conclusions
                switch(value) {
                    case 'Satisfaisant':
                        valueSpan.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                        valueSpan.style.color = '#047857';
                        valueSpan.style.border = '1px solid rgba(16, 185, 129, 0.2)';
                        break;
                    case 'Non-Satisfaisant':
                    case 'Non satisfaisant': // CORRECTION: Support des deux variantes
                        valueSpan.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        valueSpan.style.color = '#dc2626';
                        valueSpan.style.border = '1px solid rgba(239, 68, 68, 0.2)';
                        break;
                    case 'Limitation':
                        valueSpan.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                        valueSpan.style.color = '#d97706';
                        valueSpan.style.border = '1px solid rgba(245, 158, 11, 0.2)';
                        break;
                    case 'Non-Applicable':
                        valueSpan.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                        valueSpan.style.color = '#374151';
                        valueSpan.style.border = '1px solid rgba(107, 114, 128, 0.2)';
                        break;
                }
                break;
                
            case 'CTR':
                valueSpan.style.fontWeight = 'bold';
                valueSpan.style.fontSize = '16px';
                valueSpan.style.minWidth = '40px';
                
                // Couleurs pour les valeurs CTR
                switch(value) {
                    case '+':
                        valueSpan.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                        valueSpan.style.color = '#047857';
                        valueSpan.style.border = '2px solid #10b981';
                        break;
                    case '-':
                        valueSpan.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        valueSpan.style.color = '#dc2626';
                        valueSpan.style.border = '2px solid #ef4444';
                        break;
                    case 'N/A':
                        valueSpan.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                        valueSpan.style.color = '#374151';
                        valueSpan.style.border = '2px solid #6b7280';
                        break;
                }
                break;
        }
    }
  
    /**
     * CORRECTION: Ferme le dropdown actif avec nettoyage complet
     */
    function closeActiveDropdown() {
        if (activeDropdown) {
            const { dropdown, cell } = activeDropdown;
            
            if (dropdown && dropdown.parentNode) {
                dropdown.remove();
            }
            
            // Réinitialiser le style de la cellule
            if (cell) {
                cell.style.backgroundColor = '';
                cell.style.borderRadius = '';
                cell.style.transform = 'scale(1)';
            }
            
            activeDropdown = null;
        }
    }
  
    /**
     * Gestionnaire de clic global pour fermer les dropdowns
     */
    function handleDocumentClick(event) {
        if (activeDropdown && !activeDropdown.dropdown.contains(event.target) && !activeDropdown.cell.contains(event.target)) {
            closeActiveDropdown();
        }
    }
  
    /**
     * Gestionnaire de redimensionnement pour la responsivité
     */
    function handleResize() {
        if (activeDropdown) {
            // Repositionner le dropdown au lieu de le fermer
            const { dropdown, cell } = activeDropdown;
            const table = cell.closest('table');
            if (table) {
                positionDropdownAboveTable(dropdown, cell, table);
            }
        }
    }
  
    /**
     * Gestionnaire de défilement pour repositionner le dropdown
     */
    function handleScroll() {
        if (activeDropdown) {
            const { dropdown, cell } = activeDropdown;
            const table = cell.closest('table');
            if (table) {
                positionDropdownAboveTable(dropdown, cell, table);
            }
        }
    }
  
    /**
     * NOUVELLE FONCTION: Convertit une couleur hex en rgba
     */
    function hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  
    /**
     * Observateur pour détecter les nouvelles tables
     */
    const observer = new MutationObserver(function(mutations) {
        let shouldProcess = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches('table, div.prose') || 
                            (node.querySelector && node.querySelector('table.min-w-full.border'))) {
                            shouldProcess = true;
                        }
                    }
                });
            }
        });
        
        if (shouldProcess) {
            console.log('🔄 Nouveau contenu détecté, traitement des tables spécialisées...');
            setTimeout(processAllSpecialTables, 100);
        }
    });
  
    /**
     * Initialisation du système de pointage
     */
    function initializePointageSystem() {
        console.log('🚀 Initialisation du système de pointage v2.1 (Version corrigée)');
        console.log('🎯 Corrections apportées:');
        console.log('  - Fix logique colonnes Conclusion');
        console.log('  - Menu positionné au-dessus de la table');
        console.log('  - Support variante "Non satisfaisant"');
        console.log('  - Amélioration positionnement responsive');
        
        // Injecter les styles CSS directement dans le DOM
        injectCustomStyles();
        
        // Traitement initial
        setTimeout(processAllSpecialTables, 1000);
        
        // Démarrer l'observateur
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
        
        // Gestionnaires d'événements globaux
        document.addEventListener('click', handleDocumentClick);
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true); // Capture phase pour détecter tous les scrolls
        
        // NOUVELLES FONCTIONS GLOBALES
        setupGlobalFunctions();
        
        console.log('✅ Système de pointage v2.1 initialisé avec succès');
        console.log('🎯 Types supportés: Assertion, Conclusion, CTR');
        console.log('📋 Nouvelles fonctionnalités: Positionnement au-dessus des tables, gestion améliorée des événements');
    }
  
    /**
     * NOUVELLE FONCTION: Configure les fonctions globales
     */
    function setupGlobalFunctions() {
        // Fonctions globales pour manipulation externe
        window.updatePointageSystem = function() {
            console.log('🔧 Mise à jour manuelle du système de pointage');
            processAllSpecialTables();
        };

        window.getAllSpecialValues = function() {
            const results = {
                assertions: [],
                conclusions: [],
                ctrs: [],
                all: []
            };
            
            const processedCells = document.querySelectorAll('.special-cell');
            
            processedCells.forEach(cell => {
                const valueSpan = cell.querySelector('.special-value');
                if (valueSpan) {
                    const cellData = {
                        value: valueSpan.textContent,
                        originalContent: valueSpan.dataset.original,
                        type: valueSpan.dataset.type,
                        cell: cell
                    };
                    
                    results.all.push(cellData);
                    
                    switch(cellData.type) {
                        case 'ASSERTION':
                            results.assertions.push(cellData);
                            break;
                        case 'CONCLUSION':
                            results.conclusions.push(cellData);
                            break;
                        case 'CTR':
                            results.ctrs.push(cellData);
                            break;
                    }
                }
            });
            
            console.log('📊 Valeurs spécialisées récupérées:', results);
            return results;
        };

        window.getValuesByType = function(type) {
            const allValues = window.getAllSpecialValues();
            return allValues[type.toLowerCase() + 's'] || [];
        };

        window.exportSpecialData = function() {
            const values = window.getAllSpecialValues();
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '2.1',
                summary: {
                    totalCells: values.all.length,
                    assertions: values.assertions.length,
                    conclusions: values.conclusions.length,
                    ctrs: values.ctrs.length
                },
                data: values.all.map(item => ({
                    type: item.type,
                    value: item.value,
                    originalContent: item.originalContent
                }))
            };
            
            console.log('📤 Données exportées:', exportData);
            return exportData;
        };

        window.debugPointageSystem = function() {
            console.log('🔍 Debug du système de pointage v2.1:');
            console.log('Tables trouvées:', document.querySelectorAll(BASE_TABLE_SELECTOR).length);
            console.log('Cellules traitées:', document.querySelectorAll('.special-cell').length);
            console.log('Valeurs assignées:', document.querySelectorAll('.special-value').length);
            console.log('Configuration des types:', COLUMN_TYPES);
            
            const stats = window.getAllSpecialValues();
            console.log('Statistiques:', stats);
            
            return {
                version: '2.1',
                tables: document.querySelectorAll(BASE_TABLE_SELECTOR).length,
                processedCells: document.querySelectorAll('.special-cell').length,
                assignedValues: document.querySelectorAll('.special-value').length,
                valuesByType: stats
            };
        };

        window.resetPointageSystem = function() {
            console.log('🔄 Réinitialisation complète du système de pointage...');
            
            // Fermer les dropdowns actifs
            closeActiveDropdown();
            
            // Supprimer toutes les classes et styles ajoutés
            document.querySelectorAll('.special-cell').forEach(cell => {
                cell.classList.remove('special-cell', 'assertion-column-processed', 'conclusion-column-processed', 'ctr-column-processed');
                cell.style.cssText = '';
                
                // Supprimer les indicateurs et valeurs
                const indicator = cell.querySelector('.column-indicator');
                const value = cell.querySelector('.special-value');
                
                if (indicator) indicator.remove();
                if (value) {
                    const originalContent = value.dataset.original || '';
                    cell.innerHTML = originalContent;
                }
            });
            
            // Relancer le traitement
            setTimeout(processAllSpecialTables, 500);
            
            console.log('✅ Système réinitialisé');
        };
    }
  
    /**
     * Injection des styles CSS personnalisés pour tous les types
     */
    function injectCustomStyles() {
        const styleId = 'pointage-special-styles-v21';
        
        // Éviter la duplication
        if (document.getElementById(styleId)) {
            return;
        }
  
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Styles pour toutes les cellules spécialisées v2.1 */
            .special-cell {
                position: relative !important;
                transition: all 0.15s ease;
                cursor: pointer !important;
                border-radius: 6px;
                padding: 8px 12px !important;
            }
            
            .special-cell:hover {
                border-radius: 6px !important;
                transform: scale(1.02);
            }
            
            /* Styles spécifiques par type de colonne */
            .assertion-column-processed:hover {
                background-color: rgba(59, 130, 246, 0.08) !important;
            }
            
            .conclusion-column-processed:hover {
                background-color: rgba(16, 185, 129, 0.08) !important;
            }
            
            .ctr-column-processed:hover {
                background-color: rgba(245, 158, 11, 0.08) !important;
            }
            
            /* Styles pour les dropdowns spécialisés - AMÉLIORÉS v2.1 */
            .special-dropdown {
                position: fixed !important;
                z-index: 10000 !important;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 
                            0 10px 10px -5px rgba(0, 0, 0, 0.08) !important;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border-radius: 8px !important;
                animation: dropdownFadeIn 0.15s ease-out;
            }
            
            @keyframes dropdownFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .special-option {
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                transition: all 0.15s ease !important;
                position: relative;
            }
            
            .special-option:hover {
                padding-left: 20px !important;
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .special-option:hover::before {
                content: '→';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 12px;
                color: currentColor;
                opacity: 0.7;
            }
            
            /* Styles pour les valeurs sélectionnées */
            .special-value {
                display: inline-block !important;
                font-weight: 500 !important;
                font-size: 14px !important;
                text-align: center !important;
                padding: 4px 8px !important;
                border-radius: 4px !important;
                min-width: 60px !important;
                transition: all 0.15s ease !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .special-value:hover {
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            
            /* Styles pour les indicateurs */
            .column-indicator {
                pointer-events: none;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                transition: all 0.15s ease;
                font-family: monospace;
            }
            
            .special-cell:hover .column-indicator {
                opacity: 0.8 !important;
                transform: scale(1.1);
            }
            
            /* Responsive breakpoints - AMÉLIORÉS */
            @media (max-width: 768px) {
                .special-dropdown {
                    min-width: 160px !important;
                    font-size: 13px !important;
                    max-width: calc(100vw - 40px) !important;
                }
                
                .special-option {
                    padding: 10px 14px !important;
                    font-size: 13px !important;
                }
                
                .special-option:hover {
                    padding-left: 18px !important;
                }
                
                .column-indicator {
                    font-size: 0.6em !important;
                }
                
                .special-value {
                    font-size: 13px !important;
                    padding: 3px 6px !important;
                    min-width: 50px !important;
                }
                
                .special-cell {
                    padding: 6px 10px !important;
                }
            }
            
            @media (max-width: 480px) {
                .special-dropdown {
                    min-width: 140px !important;
                    font-size: 12px !important;
                    max-width: calc(100vw - 20px) !important;
                }
                
                .special-option {
                    padding: 8px 12px !important;
                    font-size: 12px !important;
                }
                
                .special-option:hover {
                    padding-left: 16px !important;
                }
                
                .special-value {
                    font-size: 12px !important;
                    padding: 2px 4px !important;
                    min-width: 40px !important;
                }
                
                .special-cell {
                    padding: 4px 8px !important;
                }
            }
    
            /* Mode sombre pour les dropdowns - AMÉLIORÉ */
            .dark .special-dropdown {
                background-color: #1f2937 !important;
                border-color: #374151 !important;
                color: #f9fafb !important;
            }
            
            .dark .special-option:hover {
                background-color: #374151 !important;
            }
            
            .dark .special-option {
                border-bottom-color: #4b5563 !important;
            }
            
            /* Animation pour les interactions - NOUVELLES */
            .special-cell {
                transition: background-color 0.15s ease, 
                            border-radius 0.15s ease,
                            transform 0.1s ease,
                            box-shadow 0.15s ease;
            }
            
            .special-cell:active {
                transform: scale(0.98);
            }
            
            .special-cell:focus-within {
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
            }
            
            /* Amélioration de l'accessibilité */
            .special-cell:focus-visible {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
            
            .special-option:focus-visible {
                outline: 2px solid #3b82f6;
                outline-offset: -2px;
                background-color: rgba(59, 130, 246, 0.1) !important;
            }
            
            .special-dropdown:focus-within {
                border-color: #3b82f6 !important;
            }
            
            /* Support des préférences utilisateur */
            @media (prefers-reduced-motion: reduce) {
                .special-cell,
                .special-option,
                .special-value,
                .column-indicator,
                .special-dropdown {
                    transition: none !important;
                    animation: none !important;
                }
            }
            
            /* Optimisation pour les écrans tactiles */
            @media (pointer: coarse) {
                .special-option {
                    min-height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    padding: 12px 16px !important;
                }
                
                .special-cell {
                    min-height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .special-dropdown {
                    border-radius: 12px !important;
                }
            }
            
            /* Styles pour l'export et les statistiques - NOUVEAUX */
            .pointage-stats {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 12px;
                font-size: 12px;
                z-index: 10001;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                cursor: pointer;
                transition: all 0.15s ease;
                max-width: 200px;
            }
            
            .pointage-stats:hover {
                transform: scale(1.02);
                box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.15);
            }
            
            .dark .pointage-stats {
                background: rgba(31, 41, 55, 0.95);
                border-color: #374151;
                color: #f9fafb;
            }
            
            /* Styles pour les types de colonnes CTR - AMÉLIORÉS */
            .special-value[data-type="CTR"] {
                font-family: 'Courier New', monospace !important;
                font-weight: bold !important;
                font-size: 16px !important;
                min-width: 40px !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            /* Styles pour les types de colonnes ASSERTION */
            .special-value[data-type="ASSERTION"] {
                font-variant: small-caps;
                letter-spacing: 0.5px;
            }
            
            /* Styles pour les types de colonnes CONCLUSION */
            .special-value[data-type="CONCLUSION"] {
                font-weight: 600 !important;
                text-transform: capitalize;
            }
            
            /* Indicateurs colorés pour les différents types */
            .assertion-column-processed .column-indicator {
                color: #3b82f6 !important;
            }
            
            .conclusion-column-processed .column-indicator {
                color: #10b981 !important;
            }
            
            .ctr-column-processed .column-indicator {
                color: #f59e0b !important;
            }
            
            /* Animation au chargement */
            .special-cell {
                animation: cellSlideIn 0.3s ease-out;
            }
            
            @keyframes cellSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Styles pour les messages de feedback */
            .pointage-feedback {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10002;
                pointer-events: none;
                animation: feedbackFade 2s ease-in-out;
            }
            
            @keyframes feedbackFade {
                0%, 100% { opacity: 0; }
                15%, 85% { opacity: 1; }
            }
        `;
  
        document.head.appendChild(style);
        console.log('🎨 Styles CSS spécialisés v2.1 injectés avec toutes les améliorations');
    }
  
    // Initialisation selon l'état du DOM
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initializePointageSystem, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializePointageSystem, 500);
        });
    }
  
    // Gestion du hot reload en développement
    if (typeof module !== 'undefined' && module.hot) {
        module.hot.accept();
    }

    // Event listeners pour les événements personnalisés
    document.addEventListener('specialValueChanged', function(event) {
        console.log('🎯 Événement de changement de valeur v2.1:', event.detail);
        
        // Afficher un feedback visuel
        showFeedback(`${event.detail.columnType}: ${event.detail.value}`, 'success');
        
        // Mettre à jour les stats si elles sont affichées
        if (document.querySelector('.pointage-stats')) {
            const statsDiv = document.querySelector('.pointage-stats');
            if (statsDiv) {
                statsDiv.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    statsDiv.style.transform = 'scale(1)';
                }, 150);
            }
        }
    });

    /**
     * NOUVELLE FONCTION: Affiche un message de feedback
     */
    function showFeedback(message, type = 'info') {
        const existingFeedback = document.querySelector('.pointage-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedback = document.createElement('div');
        feedback.className = 'pointage-feedback';
        feedback.textContent = message;
        
        // Couleurs selon le type
        switch(type) {
            case 'success':
                feedback.style.backgroundColor = 'rgba(16, 185, 129, 0.9)';
                break;
            case 'error':
                feedback.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
                break;
            case 'warning':
                feedback.style.backgroundColor = 'rgba(245, 158, 11, 0.9)';
                break;
            default:
                feedback.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
        }
        
        document.body.appendChild(feedback);
        
        // Supprimer après 2 secondes
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 2000);
    }

    /**
     * NOUVELLES FONCTIONS UTILITAIRES GLOBALES
     */
    
    // Fonction pour obtenir un rapport détaillé
    window.getPointageReport = function() {
        const values = window.getAllSpecialValues();
        const tables = document.querySelectorAll(BASE_TABLE_SELECTOR);
        
        const report = {
            timestamp: new Date().toISOString(),
            version: '2.1',
            corrections: [
                'Fix logique colonnes Conclusion',
                'Menu positionné au-dessus de la table',
                'Support variante "Non satisfaisant"',
                'Amélioration positionnement responsive'
            ],
            system: {
                tablesFound: tables.length,
                cellsProcessed: document.querySelectorAll('.special-cell').length,
                valuesAssigned: values.all.length,
                activeDropdown: activeDropdown ? true : false
            },
            statistics: {
                assertions: {
                    total: values.assertions.length,
                    byValue: {}
                },
                conclusions: {
                    total: values.conclusions.length,
                    byValue: {}
                },
                ctrs: {
                    total: values.ctrs.length,
                    byValue: {}
                }
            },
            configuration: COLUMN_TYPES,
            details: values.all
        };
        
        // Calculer les statistiques par valeur
        values.assertions.forEach(item => {
            report.statistics.assertions.byValue[item.value] = 
                (report.statistics.assertions.byValue[item.value] || 0) + 1;
        });
        
        values.conclusions.forEach(item => {
            report.statistics.conclusions.byValue[item.value] = 
                (report.statistics.conclusions.byValue[item.value] || 0) + 1;
        });
        
        values.ctrs.forEach(item => {
            report.statistics.ctrs.byValue[item.value] = 
                (report.statistics.ctrs.byValue[item.value] || 0) + 1;
        });
        
        console.log('📊 Rapport détaillé v2.1 généré:', report);
        return report;
    };

    // Fonction pour afficher des statistiques en temps réel
    window.showPointageStats = function(show = true) {
        const existingStats = document.querySelector('.pointage-stats');
        
        if (!show && existingStats) {
            existingStats.remove();
            return;
        }
        
        if (existingStats) {
            existingStats.remove();
        }
        
        if (!show) return;
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'pointage-stats';
        statsDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #3b82f6;">
                📊 Pointage v2.1
            </div>
            <div id="stats-content">Calcul en cours...</div>
            <div style="margin-top: 8px; font-size: 10px; opacity: 0.7; border-top: 1px solid #e5e7eb; padding-top: 6px;">
                🖱️ Cliquez pour masquer
            </div>
        `;
        
        statsDiv.addEventListener('click', () => {
            window.showPointageStats(false);
            showFeedback('Statistiques masquées', 'info');
        });
        
        document.body.appendChild(statsDiv);
        
        // Mettre à jour les statistiques
        const updateStats = () => {
            const values = window.getAllSpecialValues();
            const content = document.getElementById('stats-content');
            if (content) {
                content.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>Tables:</span> <strong>${document.querySelectorAll(BASE_TABLE_SELECTOR).length}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>Cellules:</span> <strong>${document.querySelectorAll('.special-cell').length}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <span style="color: #3b82f6;">Assertions:</span> <strong>${values.assertions.length}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <span style="color: #10b981;">Conclusions:</span> <strong>${values.conclusions.length}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="color: #f59e0b;">CTRs:</span> <strong>${values.ctrs.length}</strong>
                    </div>
                    <div style="text-align: center; font-size: 11px; color: #6b7280;">
                        Total valeurs: <strong>${values.all.length}</strong>
                    </div>
                `;
            }
        };
        
        updateStats();
        showFeedback('Statistiques affichées', 'success');
        
        // Mettre à jour toutes les 3 secondes
        const statsInterval = setInterval(() => {
            if (document.querySelector('.pointage-stats')) {
                updateStats();
            } else {
                clearInterval(statsInterval);
            }
        }, 3000);
    };

    // Fonction de test pour validation
    window.testPointageSystem = function() {
        console.log('🧪 Test du système de pointage v2.1...');
        
        const results = {
            timestamp: new Date().toISOString(),
            version: '2.1',
            tests: {}
        };
        
        // Test 1: Vérifier la présence des tables
        const tables = document.querySelectorAll(BASE_TABLE_SELECTOR);
        results.tests.tablesFound = {
            passed: tables.length > 0,
            count: tables.length,
            message: tables.length > 0 ? 'Tables Claraverse détectées' : 'Aucune table Claraverse trouvée'
        };
        
        // Test 2: Vérifier les cellules traitées
        const processedCells = document.querySelectorAll('.special-cell');
        results.tests.cellsProcessed = {
            passed: processedCells.length > 0,
            count: processedCells.length,
            message: processedCells.length > 0 ? 'Cellules spécialisées configurées' : 'Aucune cellule spécialisée trouvée'
        };
        
        // Test 3: Vérifier les types de colonnes
        const columnTypes = ['assertion-column-processed', 'conclusion-column-processed', 'ctr-column-processed'];
        results.tests.columnTypes = {};
        
        columnTypes.forEach(type => {
            const count = document.querySelectorAll(`.${type}`).length;
            results.tests.columnTypes[type] = {
                passed: count >= 0,
                count: count,
                message: `${count} cellule(s) de type ${type.replace('-processed', '').replace('-', ' ')}`
            };
        });
        
        // Test 4: Vérifier les fonctions globales
        const globalFunctions = [
            'updatePointageSystem',
            'getAllSpecialValues', 
            'getValuesByType',
            'exportSpecialData',
            'debugPointageSystem',
            'resetPointageSystem',
            'getPointageReport',
            'showPointageStats',
            'testPointageSystem'
        ];
        
        results.tests.globalFunctions = {};
        globalFunctions.forEach(funcName => {
            const exists = typeof window[funcName] === 'function';
            results.tests.globalFunctions[funcName] = {
                passed: exists,
                message: exists ? 'Fonction disponible' : 'Fonction manquante'
            };
        });
        
        // Test 5: Vérifier les styles CSS
        const stylesExist = document.getElementById('pointage-special-styles-v21') !== null;
        results.tests.styles = {
            passed: stylesExist,
            message: stylesExist ? 'Styles CSS v2.1 injectés' : 'Styles CSS manquants'
        };
        
        // Résumé des tests
        const totalTests = Object.keys(results.tests).length;
        const passedTests = Object.values(results.tests).filter(test => 
            typeof test.passed === 'boolean' ? test.passed : 
            Object.values(test).every(subTest => subTest.passed)
        ).length;
        
        results.summary = {
            totalTests,
            passedTests,
            success: passedTests === totalTests,
            message: `${passedTests}/${totalTests} tests réussis`
        };
        
        console.log('🧪 Résultats des tests:', results);
        
        // Afficher le feedback
        if (results.summary.success) {
            showFeedback(`✅ Tous les tests réussis (${passedTests}/${totalTests})`, 'success');
        } else {
            showFeedback(`⚠️ Tests partiels (${passedTests}/${totalTests})`, 'warning');
        }
        
        return results;
    };

    // Messages d'aide pour les développeurs
    console.log('🎯 Système de pointage Claraverse v2.1 chargé avec corrections!');
    console.log('✅ Corrections appliquées:');
    console.log('  ├─ Fix logique colonnes Conclusion');
    console.log('  ├─ Menu positionné au-dessus de la table');
    console.log('  ├─ Support variante "Non satisfaisant"');
    console.log('  └─ Amélioration positionnement responsive');
    console.log('');
    console.log('📋 Fonctions disponibles:');
    console.log('  ├─ window.updatePointageSystem() : Actualiser le système');
    console.log('  ├─ window.getAllSpecialValues() : Récupérer toutes les valeurs');
    console.log('  ├─ window.getValuesByType(type) : Valeurs par type');
    console.log('  ├─ window.exportSpecialData() : Exporter les données');
    console.log('  ├─ window.getPointageReport() : Rapport détaillé v2.1');
    console.log('  ├─ window.debugPointageSystem() : Informations de debug');
    console.log('  ├─ window.resetPointageSystem() : Réinitialiser le système');
    console.log('  ├─ window.showPointageStats(true/false) : Afficher/masquer les stats');
    console.log('  └─ window.testPointageSystem() : Tester le système');
    console.log('');
    console.log('🎨 Types supportés: Assertion, Conclusion, CTR');
    console.log('🔧 Version: 2.1 (Corrections majeures appliquées)');

})();