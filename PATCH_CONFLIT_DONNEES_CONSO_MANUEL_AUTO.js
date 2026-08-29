/**
 * PATCH - Résolution Conflit Données Automatiques vs Manuelles
 * 
 * Ce patch résout le conflit entre :
 * - Données générées automatiquement par conso.js (consolidation)
 * - Données saisies manuellement via "Activer édition des cellules"
 * 
 * Principe : La dernière action (manuelle OU automatique) prévaut
 * Protection : Les modifications manuelles sont protégées pendant 30 secondes
 */

// ============================================
// MODIFICATION 1 : Ajouter le système de marquage
// À ajouter APRÈS saveTableDataNow() dans conso.js (ligne ~1630)
// ============================================

/**
 * Marquer une table avec le type et timestamp de dernière modification
 * @param {HTMLElement} table - La table à marquer
 * @param {string} editType - Type de modification ('auto' ou 'manual')
 */
markTableEditType(table, editType) {
    if (!table) return;

    const timestamp = Date.now();
    table.dataset.lastEditType = editType;
    table.dataset.lastEditTimestamp = timestamp;

    // ✅ Ajouter un indicateur visuel
    const indicator = table.querySelector('.edit-type-indicator') || document.createElement('div');
    indicator.className = 'edit-type-indicator';
    indicator.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        z-index: 1000;
        ${editType === 'manual'
            ? 'background: #ffc107; color: #000;'
            : 'background: #28a745; color: #fff;'}
    `;
    indicator.textContent = editType === 'manual' ? '✏️ MANUEL' : '🤖 AUTO';

    // Positionner la table en relative si nécessaire
    if (getComputedStyle(table).position === 'static') {
        table.style.position = 'relative';
    }

    if (!table.querySelector('.edit-type-indicator')) {
        table.appendChild(indicator);
    }

    // Faire disparaître l'indicateur après 3 secondes
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.5s';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 500);
    }, 3000);

    debug.log(`🏷️ Table marquée: ${editType} à ${new Date(timestamp).toLocaleTimeString()}`);
}

/**
 * Vérifier si une table peut être écrasée par une modification automatique
 * @param {HTMLElement} table - La table à vérifier
 * @returns {boolean} - true si la table peut être écrasée
 */
canOverwriteTable(table) {
    if (!table) return true;

    const lastEditType = table.dataset.lastEditType;
    const lastEditTimestamp = parseInt(table.dataset.lastEditTimestamp || '0');
    const now = Date.now();

    // Si pas de marquage, on peut écraser
    if (!lastEditType) {
        debug.log("✅ Pas de marquage, écrasement autorisé");
        return true;
    }

    // Si dernière modification manuelle récente (< 30 secondes), on ne peut pas écraser
    if (lastEditType === 'manual') {
        const timeSinceEdit = now - lastEditTimestamp;
        const canOverwrite = timeSinceEdit > 30000; // 30 secondes

        if (!canOverwrite) {
            debug.warn(`⚠️ Modification manuelle récente (${Math.round(timeSinceEdit / 1000)}s), écrasement bloqué`);
        } else {
            debug.log(`✅ Modification manuelle ancienne (${Math.round(timeSinceEdit / 1000)}s), écrasement autorisé`);
        }

        return canOverwrite;
    }

    // Si dernière modification automatique, on peut toujours écraser
    debug.log("✅ Dernière modification automatique, écrasement autorisé");
    return true;
}

// ============================================
// MODIFICATION 2 : Ajouter findExistingResultatTable
// À ajouter APRÈS findExistingConsoTable() dans conso.js (ligne ~560)
// ============================================

/**
 * Trouver la table Résultat existante pour une table source
 * @param {HTMLElement} table - La table source
 * @returns {HTMLElement|null} - La table Résultat ou null
 */
findExistingResultatTable(table) {
    if (!table) return null;

    // Stratégie 1 : Chercher par data-source-table-id
    const tableId = table.dataset.tableId;
    if (tableId) {
        const resultatById = document.querySelector(`[data-source-table-id="${tableId}"][data-table-type="resultat"]`);
        if (resultatById) {
            debug.log("✓ Table Résultat trouvée par ID");
            return resultatById;
        }
    }

    // Stratégie 2 : Chercher dans les siblings
    let sibling = table.nextElementSibling;
    while (sibling) {
        if (sibling.tagName === 'TABLE' &&
            (sibling.classList.contains('claraverse-resultat-table') ||
                sibling.dataset.tableType === 'resultat')) {
            debug.log("✓ Table Résultat trouvée par sibling");
            return sibling;
        }
        sibling = sibling.nextElementSibling;
    }

    // Stratégie 3 : Chercher dans le parent
    const parent = table.parentElement;
    if (parent) {
        const resultatInParent = parent.querySelector('.claraverse-resultat-table, [data-table-type="resultat"]');
        if (resultatInParent) {
            debug.log("✓ Table Résultat trouvée dans parent");
            return resultatInParent;
        }
    }

    debug.log("✗ Aucune table Résultat trouvée");
    return null;
}

// ============================================
// MODIFICATION 3 : Modifier performConsolidation
// REMPLACER la méthode performConsolidation() dans conso.js (ligne ~604)
// ============================================

performConsolidation(table) {
    try {
        debug.log("Début de la consolidation");

        const headers = this.getTableHeaders(table);
        const hasCompte = headers.some((h) =>
            this.matchesColumn(h.text, "compte"),
        );
        const hasEcart = headers.some((h) =>
            this.matchesColumn(h.text, "ecart"),
        );

        let result = "";
        let consolidationData = {};

        if (hasCompte && hasEcart) {
            consolidationData = this.extractConsolidationData(
                table,
                headers,
                "withAccount",
            );
            result = this.consolidateWithAccount(table, headers);
        } else if (hasEcart) {
            consolidationData = this.extractConsolidationData(
                table,
                headers,
                "withoutAccount",
            );
            result = this.consolidateWithoutAccount(table, headers);
        } else {
            result = "⚠️ Table incomplète : colonnes ecart ou montant manquantes";
        }

        // 🚨 ALERTE DE DEBUG - Afficher le contenu de consolidation
        const alertMessage = this.generateAlertMessage(
            consolidationData,
            result,
        );
        alert(`📊 RÉSULTAT DE CONSOLIDATION\n\n${alertMessage}`);

        // ✅ NOUVEAU : Vérifier si on peut écraser les tables générées
        const consoTable = this.findExistingConsoTable(table);
        const resultatTable = this.findExistingResultatTable(table);

        // Vérifier la table de consolidation
        if (consoTable && !this.canOverwriteTable(consoTable)) {
            debug.warn("⚠️ Table consolidation modifiée manuellement, conservation des données");
            alert("⚠️ ATTENTION\n\nLa table de consolidation a été modifiée manuellement récemment.\nLes données manuelles sont conservées.");
        } else {
            // Mettre à jour la table conso
            this.updateConsolidationDisplay(table, result);

            // Marquer comme modification automatique
            if (consoTable) {
                this.markTableEditType(consoTable, 'auto');

                // Sauvegarder
                if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
                    window.claraverseSyncAPI.forceSaveTable(consoTable)
                        .then(() => {
                            debug.log("✅ Table consolidation sauvegardée");
                        })
                        .catch((error) => {
                            debug.error("❌ Erreur sauvegarde consolidation:", error);
                        });
                }
            }
        }

        // Vérifier la table résultat
        if (resultatTable && !this.canOverwriteTable(resultatTable)) {
            debug.warn("⚠️ Table résultat modifiée manuellement, conservation des données");
            alert("⚠️ ATTENTION\n\nLa table résultat a été modifiée manuellement récemment.\nLes données manuelles sont conservées.");
        } else {
            // Mettre à jour la table résultat
            this.updateResultatTable(table, result);

            // Marquer comme modification automatique
            if (resultatTable) {
                this.markTableEditType(resultatTable, 'auto');

                // Sauvegarder
                if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
                    window.claraverseSyncAPI.forceSaveTable(resultatTable)
                        .then(() => {
                            debug.log("✅ Table résultat sauvegardée");
                        })
                        .catch((error) => {
                            debug.error("❌ Erreur sauvegarde résultat:", error);
                        });
                }
            }
        }

        debug.log("Consolidation terminée");
    } catch (error) {
        debug.error("Erreur pendant la consolidation:", error);
        alert(
            `❌ ERREUR DE CONSOLIDATION\n\n${error.message}\n\nVoir la console pour plus de détails.`,
        );
        this.updateConsolidationDisplay(
            table,
            "❌ Erreur pendant la consolidation",
        );
    }
}

// ============================================
// MODIFICATION 4 : Exposer le processor globalement
// À ajouter À LA FIN de conso.js (ligne ~2260)
// ============================================

// Exposer le processor globalement pour menu.js
window.claraverseProcessor = processor;
debug.log("✅ Processor exposé globalement");

// ============================================
// MODIFICATION 5 : Intégrer avec menu.js
// À ajouter dans menu.js, dans la fonction qui active l'édition
// ============================================

// Dans menu.js, chercher la fonction qui active l'édition des cellules
// (probablement nommée enableCellEditing, activateEditing, ou similaire)
// et AJOUTER ce code :

function enableCellEditing(table) {
    // ... code existant d'activation de l'édition ...

    // ✅ NOUVEAU : Marquer la table comme modifiée manuellement
    if (window.claraverseProcessor && window.claraverseProcessor.markTableEditType) {
        window.claraverseProcessor.markTableEditType(table, 'manual');
        console.log("🏷️ Table marquée comme modification manuelle");
    }

    // Ajouter un listener sur les modifications de cellules
    const cells = table.querySelectorAll('td[contenteditable="true"]');
    cells.forEach(cell => {
        cell.addEventListener('input', () => {
            // Marquer à chaque modification
            if (window.claraverseProcessor && window.claraverseProcessor.markTableEditType) {
                window.claraverseProcessor.markTableEditType(table, 'manual');
            }
        });

        cell.addEventListener('blur', () => {
            // Sauvegarder après modification
            if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
                window.claraverseSyncAPI.forceSaveTable(table);
            }
        });
    });
}

// ============================================
// MODIFICATION 6 : Sauvegarder les marquages dans IndexedDB
// À ajouter dans saveTableDataNow() dans conso.js
// ============================================

// Dans saveTableDataNow(), AJOUTER avant la sauvegarde :

// Extraire les métadonnées de marquage
const metadata = {
    lastEditType: table.dataset.lastEditType || 'auto',
    lastEditTimestamp: table.dataset.lastEditTimestamp || Date.now(),
};

// Puis lors de l'appel à claraverseSyncAPI, passer les metadata :
if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
    // Ajouter les metadata à la table avant sauvegarde
    table.dataset.metadata = JSON.stringify(metadata);

    window.claraverseSyncAPI.forceSaveTable(table)
        .then(() => {
            debug.log("✅ Table sauvegardée avec metadata:", metadata);
        })
        .catch((error) => {
            debug.error("❌ Erreur sauvegarde:", error);
        });
}

// ============================================
// MODIFICATION 7 : Restaurer les marquages depuis IndexedDB
// À ajouter dans restoreTableData() dans conso.js
// ============================================

// Dans restoreTableData(), APRÈS la restauration des cellules, AJOUTER :

// Restaurer les métadonnées de marquage
if (tableData.metadata) {
    if (tableData.metadata.lastEditType) {
        table.dataset.lastEditType = tableData.metadata.lastEditType;
    }
    if (tableData.metadata.lastEditTimestamp) {
        table.dataset.lastEditTimestamp = tableData.metadata.lastEditTimestamp;
    }

    debug.log("✅ Métadonnées de marquage restaurées:", tableData.metadata);
}

// ============================================
// FIN DU PATCH
// ============================================

/**
 * RÉSUMÉ DES MODIFICATIONS :
 * 
 * 1. markTableEditType() - Marquer le type de modification
 * 2. canOverwriteTable() - Vérifier si écrasement autorisé
 * 3. findExistingResultatTable() - Trouver la table résultat
 * 4. performConsolidation() - Respecter les modifications manuelles
 * 5. Exposer window.claraverseProcessor
 * 6. Intégrer avec menu.js
 * 7. Sauvegarder les marquages dans IndexedDB
 * 8. Restaurer les marquages depuis IndexedDB
 * 
 * ORDRE D'APPLICATION :
 * 1. Sauvegarder conso.js et menu.js
 * 2. Appliquer modifications 1-4 dans conso.js
 * 3. Appliquer modification 5 dans menu.js
 * 4. Appliquer modifications 6-7 dans conso.js
 * 5. Recharger l'application
 * 6. Tester
 * 
 * TEMPS ESTIMÉ : 20-30 minutes
 * 
 * TESTS À EFFECTUER :
 * 1. Créer une consolidation automatique → Vérifier marquage "AUTO"
 * 2. Activer édition et modifier manuellement → Vérifier marquage "MANUEL"
 * 3. Modifier la table source → Vérifier que données manuelles sont conservées
 * 4. Attendre 30 secondes et modifier → Vérifier que données sont écrasées
 * 5. Recharger (F5) → Vérifier que marquages sont restaurés
 */

