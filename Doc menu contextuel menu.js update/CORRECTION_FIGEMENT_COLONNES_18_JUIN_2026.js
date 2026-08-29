// ==========================================
// CORRECTION FIGEMENT DE COLONNES
// Date: 18 juin 2026
// Fichier: public/menu.js
// ==========================================

// À REMPLACER dans menu.js aux lignes ~917-1000

// === ACTIONS FIGER PANES (VERSION CORRIGÉE) ===
freezeColumns() {
    if (!this.validateActiveCell()) return;
    const numColsToFreeze = this.activeCellPosition.col + 1;
    
    // S'assurer que le conteneur est prêt
    this.ensureScrollContainer(this.targetTable);
    
    // Appliquer le figement
    this.applyFreezePanes(this.targetTable, 0, numColsToFreeze);
    
    // Notification
    this.showQuickNotification(`❄️ ${numColsToFreeze} colonne(s) figée(s)`);
    
    // Log pour debug
    console.log(`✅ Figement appliqué: ${numColsToFreeze} colonnes`);
}

unfreezeColumns() {
    if (!this.targetTable) {
        this.showAlert("⚠️ Aucune table sélectionnée.");
        return;
    }
    
    // Retirer le figement
    this.applyFreezePanes(this.targetTable, 0, 0);
    
    // Notification
    this.showQuickNotification("🔓 Colonnes libérées");
    
    console.log("✅ Figement retiré");
}

/**
 * S'assure que le tableau est dans un conteneur approprié pour le scroll
 */
ensureScrollContainer(table) {
    const parent = table.parentElement;
    
    // Si le parent a déjà les bonnes propriétés, ne rien faire
    if (parent.classList.contains('freeze-scroll-container')) {
        return;
    }
    
    // Configurer le parent comme conteneur scroll
    parent.classList.add('freeze-scroll-container');
    parent.style.overflowX = 'auto';
    parent.style.overflowY = 'visible';
    parent.style.maxWidth = '100%';
    parent.style.position = 'relative';
    
    console.log('✓ Conteneur scroll configuré');
}

/**
 * Applique le figement de volets (freeze panes) sur un tableau
 * @param {HTMLTableElement} table - Le tableau cible
 * @param {number} freezeRows - Nombre de lignes à figer (non implémenté)
 * @param {number} freezeCols - Nombre de colonnes à figer depuis la gauche
 */
applyFreezePanes(table, freezeRows, freezeCols) {
    console.log(`🔧 Application figement: ${freezeCols} colonnes`);
    
    // ===== CONFIGURATION DU TABLEAU =====
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';
    table.style.minWidth = 'max-content'; // Force le tableau à prendre sa taille naturelle
    table.style.width = 'auto';
    
    // ===== CONFIGURATION DU CONTENEUR =====
    const container = table.parentElement;
    if (container) {
        container.style.overflowX = 'auto';
        container.style.maxWidth = '100%';
        container.style.position = 'relative';
        
        // Forcer un reflow pour s'assurer que les dimensions sont calculées
        void container.offsetHeight;
    }
    
    // ===== DÉTECTION DU THÈME =====
    const isDark = document.documentElement.classList.contains('dark') || 
                   document.body.classList.contains('dark');
    const defaultBg = isDark ? '#1e293b' : '#ffffff';
    const headerBg = isDark ? '#0f172a' : '#380101';
    
    // ===== TRAITEMENT DES CELLULES =====
    const rows = Array.from(table.querySelectorAll('tr'));
    
    // Forcer un reflow avant les calculs
    void table.offsetHeight;
    
    rows.forEach((row, rowIndex) => {
        // Forcer un reflow pour cette ligne
        void row.offsetHeight;
        
        const cells = Array.from(row.querySelectorAll('th, td'));
        let currentLeft = 0;
        
        cells.forEach((cell, colIndex) => {
            const isColFrozen = colIndex < freezeCols;
            
            if (isColFrozen) {
                // ===== APPLIQUER LE STICKY =====
                cell.style.position = 'sticky';
                cell.style.left = `${currentLeft}px`;
                cell.style.zIndex = '100'; // Z-index élevé pour passer au-dessus du contenu
                
                // ===== DÉFINIR LE BACKGROUND =====
                const cellTag = cell.tagName.toLowerCase();
                if (cellTag === 'th') {
                    // En-têtes
                    cell.style.backgroundColor = headerBg;
                } else {
                    // Cellules de données - alterner pour lignes paires/impaires
                    const tbody = row.closest('tbody');
                    if (tbody) {
                        const tbodyRows = Array.from(tbody.querySelectorAll('tr'));
                        const tbodyRowIndex = tbodyRows.indexOf(row);
                        cell.style.backgroundColor = tbodyRowIndex % 2 === 0 ? '#ffffff' : '#f9fafb';
                    } else {
                        cell.style.backgroundColor = defaultBg;
                    }
                }
                
                // ===== MARQUEUR VISUEL À LA DERNIÈRE COLONNE FIGÉE =====
                if (colIndex === freezeCols - 1) {
                    cell.style.borderRight = '3px solid #380101';
                    cell.style.boxShadow = '2px 0 5px rgba(56, 1, 1, 0.2)';
                    
                    // Ajouter une classe pour permettre le style CSS
                    cell.classList.add('freeze-last-col');
                }
                
                console.log(`  ✓ Col ${colIndex}: position=sticky, left=${currentLeft}px, bg=${cell.style.backgroundColor}`);
                
            } else {
                // ===== RETIRER LE FIGEMENT =====
                cell.style.position = '';
                cell.style.left = '';
                cell.style.zIndex = '';
                cell.style.borderRight = '';
                cell.style.boxShadow = '';
                cell.classList.remove('freeze-last-col');
            }
            
            // ===== CALCULER LA POSITION DE LA PROCHAINE COLONNE =====
            // Utiliser offsetWidth au lieu de getBoundingClientRect pour plus de fiabilité
            const cellWidth = cell.offsetWidth;
            
            if (cellWidth === 0) {
                console.warn(`⚠️ Largeur 0 détectée pour colonne ${colIndex}`);
                // Fallback: essayer avec getBoundingClientRect
                const rect = cell.getBoundingClientRect();
                currentLeft += rect.width || 150; // 150px par défaut si toujours 0
            } else {
                currentLeft += cellWidth;
            }
        });
    });
    
    // ===== INJECTER LES STYLES CSS SI NÉCESSAIRE =====
    if (!document.getElementById('freeze-panes-styles')) {
        const style = document.createElement('style');
        style.id = 'freeze-panes-styles';
        style.textContent = `
            /* Styles pour le figement de colonnes */
            .freeze-scroll-container {
                overflow-x: auto;
                overflow-y: visible;
                max-width: 100%;
                position: relative;
            }
            
            .freeze-last-col {
                position: relative;
            }
            
            .freeze-last-col::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 3px;
                background: #380101;
                pointer-events: none;
            }
            
            /* Améliorer le contraste en mode sombre */
            .dark .freeze-last-col {
                border-right-color: #dc3545;
            }
            
            /* Scrollbar personnalisée pour le conteneur */
            .freeze-scroll-container::-webkit-scrollbar {
                height: 12px;
            }
            
            .freeze-scroll-container::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 6px;
            }
            
            .freeze-scroll-container::-webkit-scrollbar-thumb {
                background: #380101;
                border-radius: 6px;
            }
            
            .freeze-scroll-container::-webkit-scrollbar-thumb:hover {
                background: #5a0202;
            }
        `;
        document.head.appendChild(style);
        console.log('✓ Styles CSS injectés');
    }
    
    console.log(`✅ Figement terminé avec succès (${freezeCols} colonnes)`);
}


// ==========================================
// NOTES D'IMPLÉMENTATION
// ==========================================

/*
CHANGEMENTS PRINCIPAUX:

1. ✅ Ajout de ensureScrollContainer() pour préparer le conteneur
2. ✅ Utilisation de offsetWidth au lieu de getBoundingClientRect
3. ✅ Forcer le reflow avec void element.offsetHeight
4. ✅ Z-index augmenté à 100 pour éviter les conflits
5. ✅ Backgrounds explicites pour éviter la transparence
6. ✅ Marqueur visuel (bordure + ombre) sur dernière colonne figée
7. ✅ Styles CSS injectés pour scrollbar et marqueurs
8. ✅ Gestion du mode sombre
9. ✅ Logs de debug détaillés
10. ✅ Fallback si width = 0

POURQUOI CES CHANGEMENTS:

- offsetWidth: Plus fiable que getBoundingClientRect dans certains contextes
- Reflow forcé: S'assure que les dimensions sont calculées avant utilisation
- Z-index 100: Évite les conflits avec autres éléments UI
- Backgrounds explicites: Évite que le contenu défilant soit visible à travers
- Marqueur visuel: Aide à identifier les colonnes figées
- Logs: Facilite le debug en production

COMMENT TESTER:

1. Sélectionner une cellule dans une colonne (ex: colonne 3)
2. Clic droit > Colonnes > Figer colonne
3. Scroller horizontalement
4. Les 3 premières colonnes doivent rester visibles
5. Une bordure rouge doit marquer la dernière colonne figée
6. Console: vérifier les logs "✓ Col X: position=sticky..."

COMPATIBILITÉ:

- Chrome 56+
- Firefox 59+
- Safari 13+
- Edge 79+

Note: position: sticky n'est pas supporté dans IE11
*/
