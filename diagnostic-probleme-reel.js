/**
 * DIAGNOSTIC SPÉCIALISÉ POUR LE PROBLÈME RÉEL
 * 
 * Ce script va analyser en détail pourquoi les anciennes tables
 * ne sauvegardent toujours pas dans votre application réelle
 */

(function() {
    'use strict';
    
    console.log('🔍 DIAGNOSTIC PROBLÈME RÉEL - Démarrage');
    
    let diagnosticData = {
        tables: [],
        localStorage: {},
        events: [],
        errors: []
    };
    
    // Fonction pour capturer tous les détails d'une table
    function analyzeTable(table, context = 'scan') {
        try {
            const analysis = {
                context: context,
                timestamp: new Date().toISOString(),
                element: {
                    tagName: table.tagName,
                    id: table.id || null,
                    className: table.className || null,
                    attributes: {}
                },
                content: {
                    textContent: table.textContent.substring(0, 100) + '...',
                    innerHTML: table.innerHTML.substring(0, 200) + '...',
                    rowCount: table.querySelectorAll('tr').length,
                    cellCount: table.querySelectorAll('td, th').length
                },
                parent: {
                    tagName: table.parentElement?.tagName || null,
                    className: table.parentElement?.className || null,
                    id: table.parentElement?.id || null
                },
                identifiers: {
                    hasId: !!table.id,
                    hasMenuId: !!table.getAttribute('data-menu-table-id'),
                    hasRobustId: !!table.getAttribute('data-robust-table-id'),
                    hasCompleteId: !!table.getAttribute('data-complete-table-id'),
                    hasAutoId: !!table.getAttribute('data-auto-table-id')
                },
                editability: {
                    isContentEditable: table.hasAttribute('contenteditable'),
                    hasEditableCells: table.querySelectorAll('[contenteditable]').length > 0,
                    hasInputs: table.querySelectorAll('input, textarea').length > 0
                },
                location: {
                    inMessage: !!table.closest('[data-message-id]'),
                    inProse: !!table.closest('.prose'),
            