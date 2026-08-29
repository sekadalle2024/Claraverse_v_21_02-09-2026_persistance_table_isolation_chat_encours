# 🚨 FIX URGENT - Tables Modelisées Disparaissent

## 📋 Problème

**Symptôme** : Les tables modelisées disparaissent quelques secondes après le chargement de la page.

**Cause** : La restauration automatique **écrase** les tables existantes au lieu de les **fusionner**.

---

## 🔍 Diagnostic Rapide

### Test Immédiat

```javascript
// Dans la console (F12)

// 1. Observer les tables au chargement
console.log('=== DIAGNOSTIC TABLES DISPARUES ===');

let tableCount = 0;
const observer = new MutationObserver(() => {
    const tables = document.querySelectorAll('table');
    const newCount = tables.length;
    if (newCount !== tableCount) {
        console.log(`📊 Tables: ${tableCount} → ${newCount} (${newCount > tableCount ? '+' : ''}${newCount - tableCount})`);
        tableCount = newCount;
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// 2. Vérifier les événements de restauration
document.addEventListener('claraverse:restore:complete', (e) => {
    console.log('🔄 Restauration effectuée:', e.detail);
    console.log('📊 Tables après restauration:', document.querySelectorAll('table').length);
});

// 3. Attendre 10 secondes et afficher le résultat
setTimeout(() => {
    console.log('📊 Tables finales:', document.querySelectorAll('table').length);
    observer.disconnect();
}, 10000);
```

---

## ✅ Solution Immédiate

### Option 1 : Désactiver la Restauration Auto (Temporaire)

**Fichier** : `public/single-restore-on-load.js`

**Modifier** la ligne ~50 :

```javascript
// AVANT
const RESTORE_DELAY = 1000; // 1 seconde

// APRÈS (désactiver temporairement)
const RESTORE_DELAY = 999999; // Désactivé
```

**OU** commenter l'appel dans `index.html` :

```html
<!-- Restauration unique au chargement -->
<!-- <script src="/single-restore-on-load.js"></script> -->
```

### Option 2 : Filtrer les Tables à Restaurer (Recommandé)

**Fichier** : `src/services/menuIntegration.ts`

**Chercher** la fonction `restoreSessionTables` (ligne ~150) et **ajouter** :

```typescript
private async restoreSessionTables(sessionId: string): Promise<void> {
    try {
        console.log(`🔄 Restauration tables session ${sessionId}`);
        
        // ✅ NOUVEAU : Vérifier si des tables existent déjà
        const existingTables = document.querySelectorAll('table');
        if (existingTables.length > 0) {
            console.log(`⚠️ ${existingTables.length} table(s) déjà présente(s), restauration sélective`);
            
            // Ne restaurer QUE les tables générées (conso, résultat)
            // PAS les tables modelisées qui sont déjà dans le DOM
            const tables = await this.flowiseTableService.restoreSessionTables(sessionId);
            
            // Filtrer pour ne garder que les tables générées
            const generatedTables = tables.filter(t => 
                t.tableType === 'generated' || 
                t.keyword?.includes('Consolidation') ||
                t.keyword?.includes('Résultat')
            );
            
            console.log(`📊 Restauration de ${generatedTables.length} table(s) générée(s) uniquement`);
            
            // Restaurer uniquement les tables générées
            for (const table of generatedTables) {
                await this.restoreTable(table);
            }
            
            return;
        }
        
        // Si aucune table n'existe, restaurer normalement
        await this.flowiseTableService.restoreSessionTables(sessionId);
        
    } catch (error) {
        console.error('❌ Erreur restauration:', error);
    }
}
```

### Option 3 : Ajouter un Flag "Ne Pas Écraser" (Solution Complète)

**Fichier** : `public/auto-restore-chat-change.js`

**Chercher** la fonction `performRestore` (ligne ~100) et **modifier** :

```javascript
async function performRestore() {
    try {
        console.log('🎯 === RESTAURATION VIA ÉVÉNEMENT ===');
        
        const sessionId = await getCurrentSessionId();
        console.log('📍 Session:', sessionId);
        
        // ✅ NOUVEAU : Marquer les tables existantes pour ne pas les écraser
        const existingTables = document.querySelectorAll('table');
        existingTables.forEach(table => {
            if (!table.dataset.restoredContent) {
                table.dataset.existingTable = 'true';
                console.log('🔒 Table existante protégée:', table.dataset.tableId);
            }
        });
        
        // Déclencher la restauration
        const event = new CustomEvent('flowise:table:restore:request', {
            detail: {
                sessionId: sessionId,
                source: 'auto-restore-chat-change',
                timestamp: Date.now(),
                preserveExisting: true // ✅ NOUVEAU FLAG
            }
        });
        
        document.dispatchEvent(event);
        console.log('✅ Événement de restauration déclenché (mode préservation)');
        
    } catch (error) {
        console.error('❌ Erreur restauration:', error);
    }
}
```

---

## 🔧 Solution Définitive (À Appliquer)

### Modification dans `src/services/flowiseTableService.ts`

**Chercher** la méthode `restoreSessionTables` et **ajouter** la logique de préservation :

```typescript
async restoreSessionTables(sessionId: string, preserveExisting: boolean = true): Promise<void> {
    try {
        console.log(`🔄 Restauration tables session ${sessionId}`);
        
        // Récupérer les tables sauvegardées
        const savedTables = await this.getAllTables();
        const sessionTables = savedTables.filter(t => t.sessionId === sessionId);
        
        console.log(`📊 ${sessionTables.length} table(s) à restaurer`);
        
        // ✅ NOUVEAU : Si preserveExisting, ne restaurer que les tables absentes
        if (preserveExisting) {
            const existingTableIds = new Set(
                Array.from(document.querySelectorAll('table[data-table-id]'))
                    .map(t => (t as HTMLElement).dataset.tableId)
            );
            
            const tablesToRestore = sessionTables.filter(t => {
                // Ne restaurer que si la table n'existe pas déjà
                const exists = existingTableIds.has(t.id);
                if (exists) {
                    console.log(`⏭️ Table ${t.id} déjà présente, ignorée`);
                }
                return !exists;
            });
            
            console.log(`📊 ${tablesToRestore.length} table(s) à restaurer (${sessionTables.length - tablesToRestore.length} ignorée(s))`);
            
            // Restaurer uniquement les tables absentes
            for (const table of tablesToRestore) {
                await this.restoreTable(table);
            }
        } else {
            // Mode normal : restaurer toutes les tables
            for (const table of sessionTables) {
                await this.restoreTable(table);
            }
        }
        
        console.log('✅ Restauration terminée');
        
    } catch (error) {
        console.error('❌ Erreur restauration:', error);
        throw error;
    }
}
```

---

## 🧪 Test de Validation

### Test 1 : Vérifier que les Tables Ne Disparaissent Plus

```javascript
console.log('=== TEST : Tables ne disparaissent plus ===');

// 1. Compter les tables au démarrage
const initialCount = document.querySelectorAll('table').length;
console.log('📊 Tables initiales:', initialCount);

// 2. Attendre 10 secondes
setTimeout(() => {
    const finalCount = document.querySelectorAll('table').length;
    console.log('📊 Tables finales:', finalCount);
    
    if (finalCount >= initialCount) {
        console.log('✅ TEST RÉUSSI : Tables préservées');
    } else {
        console.error('❌ TEST ÉCHOUÉ : Tables disparues');
        console.log(`Différence: ${initialCount - finalCount} table(s) perdue(s)`);
    }
}, 10000);
```

### Test 2 : Vérifier la Restauration Sélective

```javascript
console.log('=== TEST : Restauration sélective ===');

// Écouter les événements de restauration
document.addEventListener('claraverse:restore:complete', (e) => {
    console.log('🔄 Restauration:', e.detail);
    
    const restoredTables = document.querySelectorAll('[data-restored-content="true"]');
    const existingTables = document.querySelectorAll('[data-existing-table="true"]');
    
    console.log('📊 Tables restaurées:', restoredTables.length);
    console.log('🔒 Tables existantes protégées:', existingTables.length);
    
    if (existingTables.length > 0) {
        console.log('✅ Tables existantes préservées');
    }
});
```

---

## 🚀 Application Immédiate

### Étape 1 : Solution Temporaire (1 min)

**Désactiver la restauration auto** en commentant dans `index.html` :

```html
<!-- <script src="/single-restore-on-load.js"></script> -->
```

**Recharger** la page (F5)

**Vérifier** : Les tables ne disparaissent plus

### Étape 2 : Solution Définitive (10 min)

1. **Appliquer** l'Option 3 dans `auto-restore-chat-change.js`
2. **Modifier** `flowiseTableService.ts` avec la logique de préservation
3. **Réactiver** `single-restore-on-load.js` dans `index.html`
4. **Tester** avec les 2 tests ci-dessus

---

## 📊 Logs à Surveiller

### Logs Normaux (Après Fix)

```
🔄 Restauration tables session xxx
📊 5 table(s) à restaurer
⏭️ Table table-123 déjà présente, ignorée
⏭️ Table table-456 déjà présente, ignorée
📊 3 table(s) à restaurer (2 ignorée(s))
✅ Restauration terminée
```

### Logs Problématiques (Avant Fix)

```
🔄 Restauration tables session xxx
📊 5 table(s) à restaurer
[Toutes les tables sont restaurées, écrasant les existantes]
❌ Tables modelisées disparues
```

---

## 🐛 Dépannage

### Problème : Tables Disparaissent Toujours

**Vérifier** :
1. La restauration auto est-elle désactivée ?
2. Y a-t-il des erreurs dans la console ?
3. Le flag `preserveExisting` est-il bien passé ?

**Solution** :
```javascript
// Forcer la désactivation temporaire
window.restoreLockManager?.reset();
window.restoreLockManager?.lock();
```

### Problème : Tables Générées Non Restaurées

**Cause** : Le filtre est trop strict

**Solution** : Ajuster le filtre dans `flowiseTableService.ts` :

```typescript
const tablesToRestore = sessionTables.filter(t => {
    // Toujours restaurer les tables générées
    if (t.tableType === 'generated') {
        return true;
    }
    
    // Pour les autres, vérifier si elles existent
    const exists = existingTableIds.has(t.id);
    return !exists;
});
```

---

## ✅ Checklist de Validation

- [ ] Solution temporaire appliquée (restauration désactivée)
- [ ] Tables ne disparaissent plus
- [ ] Solution définitive appliquée (préservation)
- [ ] Restauration réactivée
- [ ] Test 1 : Tables préservées ✅
- [ ] Test 2 : Restauration sélective ✅
- [ ] Logs confirment la préservation
- [ ] Aucune régression

---

## 🎯 Résultat Attendu

### Avant Fix

```
Temps 0s : 3 tables modelisées présentes
Temps 1s : Restauration auto démarre
Temps 2s : 0 tables (toutes écrasées) ❌
```

### Après Fix

```
Temps 0s : 3 tables modelisées présentes
Temps 1s : Restauration auto démarre
Temps 2s : 3 tables modelisées + 2 tables générées restaurées ✅
```

---

## 📞 Support Urgent

### Commande de Désactivation Immédiate

```javascript
// Dans la console (F12)

// Désactiver toute restauration
if (window.restoreLockManager) {
    window.restoreLockManager.lock();
    console.log('🔒 Restauration verrouillée');
}

// Arrêter l'observateur de changement de chat
if (window.autoRestoreChatChange) {
    window.autoRestoreChatChange.stop();
    console.log('⏹️ Auto-restore arrêté');
}
```

### Commande de Réactivation

```javascript
// Réactiver après fix
if (window.restoreLockManager) {
    window.restoreLockManager.unlock();
    console.log('🔓 Restauration déverrouillée');
}
```

---

**Appliquez la solution temporaire IMMÉDIATEMENT pour arrêter la disparition des tables !**

*Fix créé le 21 novembre 2025*
