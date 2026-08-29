# 🔧 DÉPANNAGE CIA TYPESCRIPT

## ✅ Code vérifié - Tout est en place

Le code TypeScript est correctement intégré :
- ✅ `extractCIACheckboxStates()` dans `flowiseTableService.ts`
- ✅ `restoreCIACheckboxes()` dans `flowiseTableService.ts`
- ✅ Appel dans `saveGeneratedTable()`
- ✅ Appel dans `injectTableIntoDOM()` du bridge

## 🔍 Causes possibles du problème

### 1. Les checkboxes n'ont pas la classe `.cia-checkbox`

**Vérification :**
```javascript
// Dans la console
document.querySelectorAll('.cia-checkbox').length
```

**Solution :** Le script JavaScript qui crée les checkboxes doit leur ajouter la classe `.cia-checkbox`

### 2. La table n'est pas sauvegardée par Flowise

**Vérification :**
```javascript
// Dans la console, après avoir généré une table
const request = indexedDB.open('ClaraDB');
request.onsuccess = function(event) {
  const db = event.target.result;
  const transaction = db.transaction(['Generated_Tables'], 'readonly');
  const store = transaction.objectStore('Generated_Tables');
  const getAllRequest = store.getAll();
  getAllRequest.onsuccess = function() {
    console.log('Tables:', getAllRequest.result);
  };
};
```

**Solution :** Vérifier que l'événement `flowise:table:integrated` est bien déclenché

### 3. Le timing de restauration est trop court

Le délai de 100ms peut être insuffisant si React recrée le DOM lentement.

**Solution :** Augmenter le délai dans `flowiseTableBridge.ts` :

```typescript
setTimeout(() => {
  const tableElement = tableWrapper.querySelector('table') as HTMLTableElement;
  if (tableElement) {
    flowiseTableService.restoreCIACheckboxes(tableElement, tableData.ciaCheckboxStates!);
  }
}, 500); // Augmenter à 500ms
```

### 4. React recrée les checkboxes après la restauration

Si React recrée le DOM après notre restauration, les états sont perdus.

**Solution :** Utiliser un MutationObserver pour restaurer après chaque modification :

```typescript
// Dans injectTableIntoDOM, après la restauration
if (tableData.ciaCheckboxStates && tableData.ciaCheckboxStates.length > 0) {
  const observer = new MutationObserver(() => {
    const tableElement = tableWrapper.querySelector('table') as HTMLTableElement;
    if (tableElement) {
      const checkboxes = tableElement.querySelectorAll('.cia-checkbox');
      if (checkboxes.length > 0) {
        flowiseTableService.restoreCIACheckboxes(tableElement, tableData.ciaCheckboxStates!);
      }
    }
  });
  
  observer.observe(tableWrapper, {
    childList: true,
    subtree: true
  });
}
```

### 5. Les checkboxes sont dans un Shadow DOM

Si les checkboxes sont dans un Shadow DOM, `querySelector` ne les trouvera pas.

**Vérification :**
```javascript
// Dans la console
const table = document.querySelector('table');
console.log('Shadow root:', table.shadowRoot);
```

**Solution :** Adapter le sélecteur pour chercher dans le Shadow DOM

### 6. Le script JavaScript externe écrase les états

Si un script JavaScript externe (comme `examen_cia_integration.js`) recrée les checkboxes, il peut écraser les états restaurés.

**Solution :** Désactiver temporairement tous les scripts CIA externes pour tester :

```html
<!-- Dans index.html, commenter temporairement -->
<!-- <script src="/examen_cia_integration.js"></script> -->
```

## 🧪 Test de diagnostic complet

### Étape 1 : Vérifier l'extraction

1. Générer une table CIA avec Flowise
2. Cocher une checkbox
3. Ouvrir la console et chercher : `💾 CIA: Extracted`
4. Si absent → Le problème est dans l'extraction

### Étape 2 : Vérifier la sauvegarde

1. Après l'extraction, vérifier IndexedDB
2. Chercher le champ `ciaCheckboxStates` dans la table sauvegardée
3. Si absent → Le problème est dans la sauvegarde

### Étape 3 : Vérifier la restauration

1. Actualiser la page (F5)
2. Ouvrir la console et chercher : `✅ CIA: Restored`
3. Si absent → Le problème est dans la restauration

### Étape 4 : Vérifier le timing

1. Si le log de restauration apparaît mais les checkboxes ne sont pas cochées
2. → Le problème est le timing (React recrée le DOM après)

## 🎯 Solution rapide à tester

Essayez d'augmenter le délai de restauration :

```typescript
// Dans src/services/flowiseTableBridge.ts, ligne ~1369
setTimeout(() => {
  const tableElement = tableWrapper.querySelector('table') as HTMLTableElement;
  if (tableElement) {
    flowiseTableService.restoreCIACheckboxes(tableElement, tableData.ciaCheckboxStates!);
  }
}, 1000); // Augmenter à 1000ms (1 seconde)
```

Puis recompiler :
```bash
npm run build
npm run dev
```

## 📝 Rapport de diagnostic

Utilisez la page de test pour diagnostiquer :
```
http://localhost:5173/test-cia-typescript-integration.html
```

Notez les résultats et partagez-les pour un diagnostic plus précis.

---

**🔍 Testez et partagez les logs de la console !**
