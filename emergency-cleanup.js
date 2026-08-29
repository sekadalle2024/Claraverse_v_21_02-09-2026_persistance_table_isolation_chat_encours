/**
 * ========================================
 * EMERGENCY STORAGE CLEANUP - ClaraVerse
 * ========================================
 *
 * Script d'urgence pour libérer l'espace localStorage
 * À exécuter immédiatement en cas d'alerte "espace insuffisant"
 *
 * Usage:
 * 1. Ouvrir la console (F12)
 * 2. Coller ce script entier
 * 3. Appuyer sur Entrée
 * 4. Le nettoyage se fait automatiquement
 *
 * ATTENTION: Ce script supprime définitivement les anciennes données
 */

(function() {
    'use strict';

    console.log('🚨 EMERGENCY STORAGE CLEANUP - ClaraVerse v3.1');
    console.log('='.repeat(60));

    // Configuration d'urgence
    const EMERGENCY_CONFIG = {
        // Seuils critiques (en MB)
        CRITICAL_SIZE: 9.5,
        TARGET_SIZE: 4,

        // Durées de rétention d'urgence (en jours)
        KEEP_RECENT_DAYS: 3,
        KEEP_IMPORTANT_DAYS: 7,

        // Patterns de suppression prioritaire
        DELETE_PATTERNS: [
            /temp_|_temp|temporary/i,
            /backup_|_backup/i,
            /corrupted_|_corrupted/i,
            /test_|_test/i,
            /debug_|_debug/i,
            /cache_|_cache/i,
            /old_|_old/i,
            /archive_|_archive/i
        ],

        // Types à supprimer en priorité
        PRIORITY_DELETE: [
            'html_',
            'struct_backup_',
            'meta_backup_',
            'diagnostic_',
            'performance_'
        ]
    };

    // Fonctions utilitaires
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function calculateStorageSize() {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalSize += new Blob([key + value]).size;
        }
        return totalSize;
    }

    function isOlderThan(timestamp, days) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        return timestamp < cutoff;
    }

    function shouldKeepData(key, value) {
        try {
            const data = JSON.parse(value);

            // Garder les données très récentes
            if (data.timestamp && !isOlderThan(data.timestamp, EMERGENCY_CONFIG.KEEP_RECENT_DAYS)) {
                return true;
            }

            // Garder les données importantes récentes
            if (key.includes('claraverse_dev_') &&
                !key.includes('html_') &&
                !key.includes('backup_') &&
                data.timestamp &&
                !isOlderThan(data.timestamp, EMERGENCY_CONFIG.KEEP_IMPORTANT_DAYS)) {
                return true;
            }

            return false;
        } catch (e) {
            // Si pas JSON ou pas de timestamp, considérer comme non important
            return false;
        }
    }

    // PHASE 1: Analyse rapide
    console.log('📊 PHASE 1: Analyse de l\'état actuel...');

    const initialSize = calculateStorageSize();
    const initialSizeMB = initialSize / (1024 * 1024);
    const initialCount = localStorage.length;

    console.log(`💾 Taille initiale: ${formatBytes(initialSize)} (${initialSizeMB.toFixed(2)} MB)`);
    console.log(`📁 Nombre de clés: ${initialCount}`);

    if (initialSizeMB < EMERGENCY_CONFIG.CRITICAL_SIZE) {
        console.log('✅ L\'espace n\'est pas critique. Nettoyage léger...');
    } else {
        console.log('🚨 ESPACE CRITIQUE! Nettoyage agressif requis...');
    }

    // PHASE 2: Identification des gros éléments
    console.log('\n📦 PHASE 2: Identification des plus gros éléments...');

    const itemSizes = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = new Blob([key + value]).size;

        itemSizes.push({ key, value, size });
    }

    // Trier par taille décroissante
    itemSizes.sort((a, b) => b.size - a.size);

    console.log('🔝 Top 10 des plus gros éléments:');
    itemSizes.slice(0, 10).forEach((item, idx) => {
        const type = item.key.includes('claraverse') ? 'ClaraVerse' : 'Autre';
        console.log(`  ${idx + 1}. ${item.key.substring(0, 50)}... - ${formatBytes(item.size)} (${type})`);
    });

    // PHASE 3: Suppression d'urgence
    console.log('\n🗑️ PHASE 3: Suppression d\'urgence...');

    let deletedCount = 0;
    let freedSpace = 0;
    const deletedItems = [];

    // Étape 3.1: Supprimer par patterns prioritaires
    console.log('   🎯 Suppression par patterns...');
    for (const pattern of EMERGENCY_CONFIG.DELETE_PATTERNS) {
        const keysToDelete = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            const value = localStorage.getItem(key);
            const size = new Blob([key + value]).size;

            localStorage.removeItem(key);
            deletedCount++;
            freedSpace += size;
            deletedItems.push({ key, reason: 'Pattern match', size });
        });

        if (keysToDelete.length > 0) {
            console.log(`     ✓ Pattern ${pattern}: ${keysToDelete.length} éléments supprimés`);
        }
    }

    // Étape 3.2: Supprimer par types prioritaires
    console.log('   📂 Suppression par types...');
    for (const type of EMERGENCY_CONFIG.PRIORITY_DELETE) {
        const keysToDelete = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes(type)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            const value = localStorage.getItem(key);
            const size = new Blob([key + value]).size;

            localStorage.removeChild(key);
            deletedCount++;
            freedSpace += size;
            deletedItems.push({ key, reason: `Type: ${type}`, size });
        });

        if (keysToDelete.length > 0) {
            console.log(`     ✓ Type ${type}: ${keysToDelete.length} éléments supprimés`);
        }
    }

    // Étape 3.3: Suppression par âge (données anciennes)
    console.log('   ⏰ Suppression par âge...');
    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        if (!shouldKeepData(key, value)) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => {
        const value = localStorage.getItem(key);
        const size = new Blob([key + value]).size;

        localStorage.removeItem(key);
        deletedCount++;
        freedSpace += size;
        deletedItems.push({ key, reason: 'Données anciennes', size });
    });

    console.log(`     ✓ Données anciennes: ${keysToDelete.length} éléments supprimés`);

    // PHASE 4: Nettoyage agressif si nécessaire
    const currentSize = calculateStorageSize();
    const currentSizeMB = currentSize / (1024 * 1024);

    if (currentSizeMB > EMERGENCY_CONFIG.TARGET_SIZE) {
        console.log('\n⚡ PHASE 4: Nettoyage agressif...');
        console.log('   ⚠️ Suppression des plus gros éléments restants...');

        // Recalculer les tailles après suppression
        const remainingItems = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const size = new Blob([key + value]).size;
            remainingItems.push({ key, value, size });
        }

        // Trier par taille et supprimer les plus gros
        remainingItems.sort((a, b) => b.size - a.size);

        const targetBytes = EMERGENCY_CONFIG.TARGET_SIZE * 1024 * 1024;
        let currentBytes = currentSize;

        for (const item of remainingItems) {
            if (currentBytes <= targetBytes) break;

            // Éviter de supprimer les données très récentes et critiques
            if (shouldKeepData(item.key, item.value)) continue;

            localStorage.removeItem(item.key);
            deletedCount++;
            freedSpace += item.size;
            currentBytes -= item.size;
            deletedItems.push({ key: item.key, reason: 'Nettoyage agressif', size: item.size });

            console.log(`     🗑️ Supprimé: ${item.key.substring(0, 40)}... (${formatBytes(item.size)})`);
        }
    }

    // PHASE 5: Rapport final
    console.log('\n📋 RAPPORT FINAL');
    console.log('='.repeat(40));

    const finalSize = calculateStorageSize();
    const finalSizeMB = finalSize / (1024 * 1024);
    const finalCount = localStorage.length;

    const savedSpace = initialSize - finalSize;
    const savedSpaceMB = savedSpace / (1024 * 1024);
    const percentSaved = ((savedSpace / initialSize) * 100);

    console.log(`📊 AVANT:`);
    console.log(`   Taille: ${formatBytes(initialSize)} (${initialSizeMB.toFixed(2)} MB)`);
    console.log(`   Éléments: ${initialCount}`);

    console.log(`📊 APRÈS:`);
    console.log(`   Taille: ${formatBytes(finalSize)} (${finalSizeMB.toFixed(2)} MB)`);
    console.log(`   Éléments: ${finalCount}`);

    console.log(`💾 ESPACE LIBÉRÉ:`);
    console.log(`   ${formatBytes(savedSpace)} (${savedSpaceMB.toFixed(2)} MB)`);
    console.log(`   ${deletedCount} éléments supprimés`);
    console.log(`   ${percentSaved.toFixed(1)}% d'espace récupéré`);

    // État final
    if (finalSizeMB < EMERGENCY_CONFIG.TARGET_SIZE) {
        console.log('\n✅ SUCCÈS: Espace suffisamment libéré!');
        console.log(`🎯 Objectif atteint: ${finalSizeMB.toFixed(2)} MB < ${EMERGENCY_CONFIG.TARGET_SIZE} MB`);
    } else if (finalSizeMB < EMERGENCY_CONFIG.CRITICAL_SIZE) {
        console.log('\n⚠️ AMÉLIORATION: Espace partiellement libéré');
        console.log('💡 Suggestion: Redémarrer le navigateur pour optimiser davantage');
    } else {
        console.log('\n🚨 ATTENTION: Espace encore critique');
        console.log('💡 Actions recommandées:');
        console.log('   1. Redémarrer le navigateur');
        console.log('   2. Vider le cache navigateur');
        console.log('   3. Considérer migrer vers un stockage externe');
    }

    // Détails des suppressions (optionnel)
    if (deletedItems.length > 0 && deletedItems.length <= 20) {
        console.log('\n📝 DÉTAIL DES SUPPRESSIONS:');
        deletedItems.forEach((item, idx) => {
            console.log(`  ${idx + 1}. ${item.key.substring(0, 40)}... - ${formatBytes(item.size)} (${item.reason})`);
        });
    } else if (deletedItems.length > 20) {
        console.log(`\n📝 ${deletedItems.length} éléments supprimés (liste complète disponible dans deletedItems)`);
        // Exposer la liste complète pour inspection si nécessaire
        window.EMERGENCY_CLEANUP_LOG = deletedItems;
        console.log('💾 Liste complète: window.EMERGENCY_CLEANUP_LOG');
    }

    // Fonction de vérification post-nettoyage
    window.checkStorageStatus = function() {
        const size = calculateStorageSize();
        const sizeMB = size / (1024 * 1024);
        const count = localStorage.length;

        console.log('📊 État actuel du stockage:');
        console.log(`   Taille: ${formatBytes(size)} (${sizeMB.toFixed(2)} MB)`);
        console.log(`   Éléments: ${count}`);
        console.log(`   Status: ${sizeMB > 9 ? '🚨 Critique' : sizeMB > 7 ? '⚠️ Attention' : '✅ OK'}`);

        return { size, sizeMB, count };
    };

    // Message final
    console.log('\n🎉 NETTOYAGE D\'URGENCE TERMINÉ!');
    console.log('💡 Commande disponible: checkStorageStatus()');
    console.log('⚠️ Redémarrage du navigateur recommandé pour optimisation maximale');

    // Retourner les stats pour usage programmatique
    return {
        success: true,
        initialSize: initialSizeMB,
        finalSize: finalSizeMB,
        freedSpace: savedSpaceMB,
        deletedCount: deletedCount,
        percentSaved: percentSaved
    };

})();
