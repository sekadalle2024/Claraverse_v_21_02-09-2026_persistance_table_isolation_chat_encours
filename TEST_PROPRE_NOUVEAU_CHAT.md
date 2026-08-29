# 🧪 Test Propre - Nouveau Chat

## 🎯 Objectif

Tester la restauration des tables lors du changement de chat avec un test propre.

## 📋 Étape 0 : Nettoyage (IMPORTANT)

Avant de commencer, nettoyez IndexedDB pour repartir de zéro :

```javascript
// Dans la console (F12)
indexedDB.deleteDatabase('FlowiseTableDB').onsuccess = () => {
    console.log('✅ Base de données nettoyée');
    location.reload();
};
```

Attendez que la page se recharge.

## 📋 Étape 1 : Créer une Table dans le Chat A

1. **Ouvrez la console** (F12) pour voir les logs
2. **Créez un nouveau chat** (ou utilisez un chat existant)
3. **Notez l'URL** du chat (par exemple : `http://localhost:5173/chat/abc123`)
4. **Demandez à Flowise** de créer une table (n'importe quelle table)
5. **Attendez** que la table apparaisse

Vous devriez voir dans la console :
```
🎯 RESTORE WITH CONTEXT - Démarrage
✅ Restore with Context activé
👀 Observer activé sur X table(s)
```

## 📋 Étape 2 : Modifier la Table

1. **Cliquez sur "Ajouter une ligne"** dans le menu de la table
2. **Ajoutez quelques lignes** avec des données
3. **Attendez 1-2 secondes**

Vous devriez voir dans la console :
```
💾 Table sauvegardée: [contextKey]
```

Si vous ne voyez PAS ce message, sauvegardez manuellement :
```javascript
// Dans la console
const table = document.querySelector('table');
window.saveTableManually(table);
```

## 📋 Étape 3 : Vérifier la Sauvegarde

Dans la console :
```javascript
const req = indexedDB.open('FlowiseTableDB', 1);
req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction(['tables'], 'readonly');
    const getAll = tx.objectStore('tables').getAll();
    getAll.onsuccess = () => {
        console.log('📦 Tables sauvegardées:', getAll.result);
        console.log('📊 Nombre:', getAll.result.length);
        if (getAll.result.length > 0) {
            console.log('✅ Sauvegarde OK');
            console.log('   URL:', getAll.result[0].url);
            console.log('   Headers:', getAll.result[0].headers);
            console.log('   Context:', getAll.result[0].contextKey);
        }
    };
};
```

Vous devriez voir :
```
📦 Tables sauvegardées: [Array avec 1 élément]
📊 Nombre: 1
✅ Sauvegarde OK
   URL: http://localhost:5173/...
   Headers: [...]
   Context: ...
```

## 📋 Étape 4 : Changer de Chat

1. **Créez un nouveau chat** OU **allez dans un autre chat existant**
2. **Notez que l'URL change** (devrait être différente)
3. **Attendez** que le nouveau chat se charge

Dans la console, vous devriez voir :
```
🔗 URL changée
⏰ Restauration planifiée dans 3 secondes
```

Puis après 3 secondes :
```
🎯 === DÉBUT RESTAURATION AVEC CONTEXTE ===
📦 0 table(s) pertinente(s) pour cette URL
ℹ️ Aucune table à restaurer
🎯 === FIN RESTAURATION ===
```

C'est **NORMAL** : vous êtes dans un chat différent, donc aucune table à restaurer.

## 📋 Étape 5 : Retourner au Chat A (TEST CRITIQUE)

1. **Retournez au chat original** (celui de l'étape 1)
   - Utilisez l'historique du navigateur (bouton retour)
   - OU cliquez sur le chat dans la liste des chats
2. **Attendez 3-5 secondes**
3. **Observez la console**

Vous devriez voir :
```
🔗 URL changée
⏰ Restauration planifiée dans 3 secondes
🎯 === DÉBUT RESTAURATION AVEC CONTEXTE ===
📦 1 table(s) pertinente(s) pour cette URL
🔍 Recherche par contexte: [contextKey]
✅ Message correspondant trouvé
✅ Table trouvée à l'index 0
✅ Table restaurée (X lignes)
✅ 1/1 table(s) restaurée(s)
🎯 === FIN RESTAURATION ===
```

4. **Vérifiez visuellement** que la table a bien vos modifications

## ✅ Résultat Attendu

- ✅ La table modifiée est restaurée automatiquement
- ✅ Les lignes que vous avez ajoutées sont présentes
- ✅ Pas de duplicatas

## ❌ Si ça ne fonctionne pas

### Problème 1 : Pas de message "URL changée"

**Cause** : L'URL ne change pas lors du changement de chat

**Solution** : Vérifiez l'URL dans la barre d'adresse. Si elle ne change vraiment pas, lancez manuellement :
```javascript
window.restoreTablesWithContext()
```

### Problème 2 : "0 table(s) pertinente(s) pour cette URL"

**Cause** : L'URL actuelle ne correspond pas à l'URL sauvegardée

**Diagnostic** :
```javascript
// URL actuelle
console.log('URL actuelle:', window.location.href);

// URL sauvegardée
const req = indexedDB.open('FlowiseTableDB', 1);
req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction(['tables'], 'readonly');
    const getAll = tx.objectStore('tables').getAll();
    getAll.onsuccess = () => {
        console.log('URL sauvegardée:', getAll.result[0]?.url);
    };
};
```

Si les URLs sont différentes mais devraient correspondre, le script a un bug de correspondance.

### Problème 3 : "Message correspondant non trouvé"

**Cause** : La structure du DOM a changé

**Solution** : Le script va essayer le fallback par headers. Si ça ne fonctionne toujours pas, c'est que la table n'existe plus dans le DOM.

### Problème 4 : La restauration se fait mais disparaît

**Cause** : Flowise régénère la table après la restauration

**Solution** : Augmentez le délai dans `restore-with-context.js` ligne 398 :
```javascript
}, 5000); // Augmenter à 5 secondes
```

## 🔧 Test Manuel de Force

Si rien ne fonctionne automatiquement, testez manuellement :

```javascript
// Forcer la restauration
window.restoreTablesWithContext()
```

Si ça fonctionne manuellement mais pas automatiquement, c'est un problème de détection du changement de chat.

## 📊 Logs à Copier

Si le test échoue, copiez-moi :

1. **Tous les logs de la console** depuis le début du test
2. **L'URL du Chat A** (où la table a été créée)
3. **L'URL actuelle** (où vous essayez de restaurer)
4. **Le résultat de** :
```javascript
const req = indexedDB.open('FlowiseTableDB', 1);
req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction(['tables'], 'readonly');
    const getAll = tx.objectStore('tables').getAll();
    getAll.onsuccess = () => console.log('Données:', getAll.result);
};
```
