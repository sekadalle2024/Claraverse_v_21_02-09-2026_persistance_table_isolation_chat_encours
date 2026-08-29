# Guide de Débogage - Persistance Menu.js

## Problème
Les modifications effectuées par `menu.js` ne sont pas persistantes après rechargement de la page.

## Solution Mise en Place

### Architecture
```
menu.js (frontend)
    ↓ (événements)
menu-persistence-bridge.js (pont JavaScript)
    ↓ (événements personnalisés)
menuIntegration.ts (TypeScript)
    ↓ (appels API)
flowiseTableService.ts (sauvegarde IndexedDB)
```

### Fichiers Créés

1. **`public/menu-persistence-bridge.js`** - Pont entre menu.js et TypeScript
2. **`src/services/menuIntegration.ts`** - Service d'intégration TypeScript
3. **`index.html`** - Mis à jour pour charger le pont

### Vérification de l'Installation

#### Étape 1: Vérifier que les fichiers sont chargés

Ouvrez la console du navigateur (F12) et vérifiez ces messages :

```
✅ Messages attendus au démarrage:
🌉 Pont de persistance chargé
🌉 Initialisation du pont de persistance menu.js <-> TypeScript
✅ Système TypeScript détecté, création API complète
✅ API de synchronisation créée et exposée
🎯 Initialisation du menu contextuel (Core) ClaraVerse
✅ Menu contextuel (Core) initialisé avec succès
🔗 Initialisation intégration menu.js
✅ Intégration menu.js initialisée
```

#### Étape 2: Tester l'API dans la console

```javascript
// 1. Vérifier que l'API est disponible
console.log('API disponible:', !!window.claraverseSyncAPI);

// 2. Vérifier les services TypeScript
console.log('flowiseTableService:', !!window.flowiseTableService);
console.log('flowiseTableBridge:', !!window.flowiseTableBridge);

// 3. Tester une sauvegarde manuelle
const table = document.querySelector('table');
if (table && window.claraverseSyncAPI) {
  window.claraverseSyncAPI.forceSaveTable(table)
    .then(() => console.log('✅ Sauvegarde test réussie'))
    .catch(err => console.error('❌ Erreur sauvegarde:', err));
}

// 4. Obtenir les diagnostics
if (window.claraverseSyncAPI) {
  window.claraverseSyncAPI.getDiagnostics()
    .then(diag => console.log('📊 Diagnostics:', diag));
}
```

#### Étape 3: Tester une modification de table

1. Faites un clic droit sur une table
2. Sélectionnez "➕ Insérer ligne en dessous"
3. Vérifiez dans la console :

```
✅ Messages attendus:
✅ Ligne insérée après ligne X
✅ Ligne ajoutée avec succès
🔄 Notification structure row_added envoyée
🔄 Synchronisation via API dev.js effectuée
💾 Demande de sauvegarde depuis menu
💾 Sauvegarde table: session=xxx, keyword=xxx
✅ Table sauvegardée avec succès
```

### Problèmes Courants et Solutions

#### Problème 1: "API de synchronisation non détectée"

**Symptôme:**
```
⚠️ API dev.js non détectée, utilisation mode fallback
```

**Solution:**
Le système TypeScript n'est pas encore chargé. Attendez 2-3 secondes après le chargement de la page.

**Vérification:**
```javascript
// Attendre que tout soit chargé
setTimeout(() => {
  console.log('API après délai:', !!window.claraverseSyncAPI);
}, 3000);
```

#### Problème 2: "Système TypeScript non détecté"

**Symptôme:**
```
⚠️ Système TypeScript non détecté, création API fallback
```

**Cause:** Le service `menuIntegration.ts` n'est pas chargé.

**Solution:**
1. Vérifiez que `src/main.tsx` contient :
```typescript
import './services/menuIntegration';
```

2. Redémarrez le serveur de développement :
```bash
npm run dev
```

#### Problème 3: Les tables ne se sauvegardent pas

**Diagnostic:**
```javascript
// Vérifier IndexedDB
indexedDB.databases().then(dbs => {
  console.log('Bases de données:', dbs);
  const claraDB = dbs.find(db => db.name === 'ClaraDatabase');
  console.log('ClaraDatabase existe:', !!claraDB);
});

// Vérifier le stockage
if (window.flowiseTableService) {
  window.flowiseTableService.getDiagnostics()
    .then(diag => console.log('Diagnostics:', diag));
}
```

**Solutions possibles:**

1. **Vider IndexedDB et réessayer:**
```javascript
// Dans la console
indexedDB.deleteDatabase('ClaraDatabase');
// Puis recharger la page
```

2. **Vérifier les quotas de stockage:**
```javascript
navigator.storage.estimate().then(estimate => {
  console.log('Quota:', estimate.quota);
  console.log('Usage:', estimate.usage);
  console.log('Disponible:', estimate.quota - estimate.usage);
});
```

#### Problème 4: Erreur "session ID non trouvé"

**Symptôme:**
```
⚠️ Utilisation session temporaire: menu_session_xxx
```

**Solution:**
C'est normal si vous n'êtes pas dans une conversation active. Le système crée une session temporaire.

Pour utiliser une vraie session :
```javascript
// Définir manuellement une session
localStorage.setItem('current_session_id', 'ma-session-test');
```

### Test Complet de Bout en Bout

```javascript
// Script de test complet à exécuter dans la console

async function testCompletPersistance() {
  console.log('🧪 Début du test de persistance');
  
  // 1. Vérifier l'API
  if (!window.claraverseSyncAPI) {
    console.error('❌ API non disponible');
    return;
  }
  console.log('✅ API disponible');
  
  // 2. Trouver une table
  const table = document.querySelector('table');
  if (!table) {
    console.error('❌ Aucune table trouvée');
    return;
  }
  console.log('✅ Table trouvée');
  
  // 3. Sauvegarder la table
  try {
    await window.claraverseSyncAPI.forceSaveTable(table);
    console.log('✅ Sauvegarde réussie');
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
    return;
  }
  
  // 4. Vérifier les diagnostics
  try {
    const diag = await window.claraverseSyncAPI.getDiagnostics();
    console.log('📊 Diagnostics:', diag);
    
    if (diag && diag.totalTables > 0) {
      console.log('✅ Table bien sauvegardée dans IndexedDB');
    } else {
      console.warn('⚠️ Aucune table dans IndexedDB');
    }
  } catch (error) {
    console.error('❌ Erreur diagnostics:', error);
  }
  
  console.log('🧪 Test terminé');
}

// Exécuter le test
testCompletPersistance();
```

### Logs de Débogage Détaillés

Pour activer les logs détaillés, ajoutez dans la console :

```javascript
// Activer tous les logs
localStorage.setItem('debug', 'claraverse:*');

// Écouter tous les événements de persistance
document.addEventListener('flowise:table:save:request', e => {
  console.log('📤 Demande sauvegarde:', e.detail);
});

document.addEventListener('flowise:table:save:success', e => {
  console.log('✅ Sauvegarde réussie:', e.detail);
});

document.addEventListener('flowise:table:save:error', e => {
  console.error('❌ Erreur sauvegarde:', e.detail);
});

document.addEventListener('claraverse:table:updated', e => {
  console.log('🔄 Table mise à jour:', e.detail);
});

document.addEventListener('claraverse:table:structure:changed', e => {
  console.log('🔧 Structure modifiée:', e.detail);
});
```

### Vérification Manuelle dans IndexedDB

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Application" (Chrome) ou "Storage" (Firefox)
3. Développez "IndexedDB"
4. Cherchez "ClaraDatabase"
5. Ouvrez "clara_generated_tables"
6. Vous devriez voir vos tables sauvegardées

### Commandes Utiles

```javascript
// Lister toutes les tables sauvegardées
if (window.flowiseTableService) {
  const sessionId = localStorage.getItem('current_session_id') || 'test';
  window.flowiseTableService.restoreSessionTables(sessionId)
    .then(tables => console.log('Tables sauvegardées:', tables));
}

// Forcer une sauvegarde de toutes les tables visibles
document.querySelectorAll('table').forEach(async (table, index) => {
  if (window.claraverseSyncAPI) {
    await window.claraverseSyncAPI.forceSaveTable(table);
    console.log(`✅ Table ${index + 1} sauvegardée`);
  }
});

// Nettoyer toutes les tables (ATTENTION: supprime tout!)
if (window.flowiseTableService) {
  indexedDB.deleteDatabase('ClaraDatabase');
  console.log('🗑️ Base de données supprimée');
}
```

## Prochaines Étapes

Si après tous ces tests la persistance ne fonctionne toujours pas :

1. **Vérifiez les erreurs dans la console** - Copiez tous les messages d'erreur
2. **Vérifiez le réseau** - Onglet Network, cherchez les fichiers .js qui ne se chargent pas
3. **Vérifiez les permissions** - Certains navigateurs bloquent IndexedDB en mode privé
4. **Testez dans un autre navigateur** - Chrome, Firefox, Edge

## Support

Pour obtenir de l'aide :
1. Exécutez le script de test complet ci-dessus
2. Copiez tous les logs de la console
3. Vérifiez l'état d'IndexedDB
4. Partagez ces informations pour diagnostic
