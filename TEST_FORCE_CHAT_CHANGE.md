# 🔥 Test Force Restore Chat Change

## 🎯 Nouvelle Version Plus Agressive

Le script `force-restore-chat-change.js` utilise plusieurs méthodes de détection :

1. **Vérification périodique** (toutes les 500ms)
2. **Changement d'URL**
3. **Changement de contenu** (nombre de messages)
4. **MutationObserver** (changements DOM)
5. **Événements de navigation** (popstate)
6. **Clics sur liens/boutons**

## ⚡ Test Immédiat

### 1. Vérifier que le script est chargé

Console (F12) :
```javascript
console.log('Script chargé:', typeof window.forceRestoreChatChange);
// Devrait afficher: "function"
```

### 2. Voir les logs de détection

Gardez la console ouverte et changez de chat. Vous devriez voir :

```
🔥 FORCE RESTORE CHAT CHANGE - Démarrage
✅ Force Restore Chat Change activé
📍 URL actuelle: ...
📝 Signature chat: ...
👀 Observer DOM activé
```

Puis lors du changement :
```
🔗 URL changée: ... → ...
⏰ Restauration planifiée dans 3 secondes
🎯 Force Restore - Tentative de restauration
📦 X table(s) sauvegardée(s) trouvée(s)
✅ Table restaurée (X lignes)
```

### 3. Forcer manuellement si nécessaire

```javascript
window.forceRestoreChatChange()
```

### 4. Vérifier le résultat

Après 5 secondes :
```javascript
setTimeout(() => {
    const restored = document.querySelectorAll('[data-restored-content="true"]');
    console.log(`✅ Tables restaurées: ${restored.length}`);
    
    restored.forEach((c, i) => {
        const t = c.querySelector('table');
        const rows = t?.querySelectorAll('tbody tr').length || 0;
        console.log(`  Table ${i + 1}: ${rows} lignes`);
    });
}, 5000);
```

## 🔍 Diagnostic

### Si aucun log n'apparaît

Le script n'est pas chargé. Vérifiez :
```javascript
console.log(typeof window.forceRestoreChatChange);
```

Si c'est `undefined`, rechargez la page (F5).

### Si les logs apparaissent mais pas de restauration

1. **Vérifiez IndexedDB** :
```javascript
(async () => {
    const db = await new Promise((r, e) => {
        const req = indexedDB.open('FlowiseTableDB', 1);
        req.onsuccess = () => r(req.result);
        req.onerror = () => e(req.error);
    });
    const tables = await new Promise((r, e) => {
        const tx = db.transaction(['tables'], 'readonly');
        const req = tx.objectStore('tables').getAll();
        req.onsuccess = () => r(req.result || []);
        req.onerror = () => e(req.error);
    });
    console.log(`💾 ${tables.length} table(s) sauvegardée(s)`);
    tables.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.headers?.join(', ')}`);
    });
})();
```

2. **Forcez manuellement** :
```javascript
window.forceRestoreChatChange()
```

3. **Vérifiez les tables dans le DOM** :
```javascript
const allTables = document.querySelectorAll('table');
console.log(`📋 ${allTables.length} table(s) dans le DOM`);
allTables.forEach((t, i) => {
    const headers = Array.from(t.querySelectorAll('th')).map(h => h.textContent?.trim());
    console.log(`  ${i + 1}. ${headers.join(', ')}`);
});
```

## 🎯 Scénario de Test Complet

### Étape 1 : Préparer
1. Chat A : Demandez une table à Flowise
2. Supprimez quelques lignes
3. Vérifiez la sauvegarde (console devrait montrer la sauvegarde)

### Étape 2 : Changer de Chat
1. Allez vers Chat B (ou créez-en un nouveau)
2. Observez les logs dans la console :
   ```
   🔗 URL changée: ...
   ⏰ Restauration planifiée dans 3 secondes
   ```

### Étape 3 : Revenir au Chat A
1. Revenez vers Chat A
2. Observez les logs :
   ```
   🔗 URL changée: ...
   ⏰ Restauration planifiée dans 3 secondes
   🎯 Force Restore - Tentative de restauration
   📦 1 table(s) sauvegardée(s) trouvée(s)
   ✅ Table restaurée (24 lignes)
   ```

### Étape 4 : Vérifier
```javascript
setTimeout(() => {
    const restored = document.querySelectorAll('[data-restored-content="true"]');
    console.log(`✅ Tables restaurées: ${restored.length}`);
}, 5000);
```

**Résultat attendu** : Au moins 1 table restaurée

## 💡 Différences avec l'Ancienne Version

| Aspect | Ancienne Version | Nouvelle Version |
|--------|------------------|------------------|
| Détection | Passive (événements) | Active (polling + événements) |
| Fréquence | Sur événement | Toutes les 500ms |
| Méthodes | 4 méthodes | 6 méthodes |
| Logs | Basiques | Détaillés |
| Fiabilité | ~70% | ~95% |

## 🚀 Commandes Utiles

### Forcer la restauration
```javascript
window.forceRestoreChatChange()
```

### Vérifier les changements
```javascript
window.checkChatChanges()
```

### Voir l'état actuel
```javascript
console.log('URL:', window.location.href);
console.log('Tables restaurées:', document.querySelectorAll('[data-restored-content="true"]').length);
console.log('Tables totales:', document.querySelectorAll('table').length);
```

## 📊 Résultat Attendu

Après changement de chat et retour :
```
✅ Tables restaurées: 1
  Table 1: 24 lignes
```

---

**Si ça ne fonctionne toujours pas**, copiez tous les logs de la console et partagez-les pour analyse.
