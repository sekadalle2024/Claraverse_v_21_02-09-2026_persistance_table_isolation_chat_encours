# 🧪 GUIDE TEST RAPIDE - Persistance & Isolation

**Durée**: 5 minutes  
**Objectif**: Valider que les tables persistent après F5 et sont isolées par chat

---

## 🚀 DÉMARRAGE

### 1. Lancer l'Application
```powershell
# Terminal 1 - Frontend
cd h:\Claverse_1
npm run dev

# Terminal 2 - Backend (si nécessaire)
python app.py
```

### 2. Ouvrir la Console
- Navigateur : **F12** → Onglet **Console**
- Filtrer les logs : tapez `[INLINE]` ou `[Bridge]` dans la recherche

---

## ✅ TEST 1 : Persistance Basique (2 min)

### Étape 1 : Créer une table
1. Démarrer un nouveau chat
2. Demander à l'IA : `"Génère un tableau d'audit avec assertions"`
3. Attendre que les tables apparaissent :
   - Table principale (générée par l'IA)
   - Table_Consolidation (📊 générée par conso.js)
   - Table_Resultat (générée par conso.js)

### Étape 2 : Modifier une cellule
1. Cliquer sur une cellule de **Table_Consolidation**
2. Taper : `"TEST_PERSISTANCE_1"`
3. Cliquer ailleurs (pour déclencher sauvegarde)

**🔍 Vérifier logs** :
```
💾 [INLINE] Interception sauvegarde table
🔑 [INLINE] Keyword: Table_Consolidation
📍 [INLINE] SessionId: clara-session-... (depuis DOM ✅)
✅ [INLINE] Événement émis pour: Table_Consolidation
✅ Table saved: uuid-xxx (keyword: Table_Consolidation)
```

### Étape 3 : Actualiser la page
1. Appuyer sur **F5** (ou Ctrl+R)
2. Attendre le chargement

**🔍 Vérifier logs** :
```
📍 [INLINE] SessionId depuis DOM: clara-session-...
✅ [INLINE] ISOLATION ACTIVE - SessionId unique par chat
📋 Found X restorable table(s)
✅ [Bridge] Table trouvée via data-keyword: "Table_Consolidation"
✅ Restored X table(s) for session clara-session-...
```

### ✅ Résultat Attendu
- La cellule contient toujours `"TEST_PERSISTANCE_1"`
- Les tables sont restaurées automatiquement

### ❌ Si ça ne fonctionne PAS
**Problème 1** : Pas de log `✅ Table saved`
→ La sauvegarde ne se déclenche pas
→ Vérifier que `claraverseProcessor` est bien chargé

**Problème 2** : Log `ℹ️ No existing table found for keyword`
→ `data-keyword` absent du DOM
→ Vérifier que conso.js a bien été modifié

**Problème 3** : Cellule vide après F5
→ Table trouvée mais contenu pas restauré
→ Vérifier IndexedDB : DevTools > Application > IndexedDB > clara_db

---

## 🔒 TEST 2 : Isolation des Chats (3 min)

### Étape 1 : Chat 1 - Données "CHAT1"
1. Ouvrir/créer **Chat 1**
2. Générer une table
3. Modifier une cellule : `"DONNEES_CHAT1"`
4. Attendre log : `✅ Table saved`

**🔍 Noter le SessionId** :
```
📍 [INLINE] SessionId: clara-session-ABC... (depuis DOM ✅)
```

### Étape 2 : Chat 2 - Données "CHAT2"
1. Créer **nouveau chat** (Chat 2)
2. Générer une table similaire
3. Modifier la même cellule : `"DONNEES_CHAT2"`
4. Attendre log : `✅ Table saved`

**🔍 Vérifier nouveau SessionId** :
```
📍 [INLINE] SessionId: clara-session-XYZ... (depuis DOM ✅)
🔄 [INLINE] CHANGEMENT DE CHAT DÉTECTÉ!
   Ancien sessionId: clara-session-ABC...
   Nouveau sessionId: clara-session-XYZ...
```

### Étape 3 : Retour Chat 1
1. Cliquer sur **Chat 1** dans la liste des conversations
2. Observer la table

**🔍 Vérifier logs** :
```
🔄 [INLINE] CHANGEMENT DE CHAT DÉTECTÉ!
   Nouveau sessionId: clara-session-ABC...
✅ Restored X table(s) for session clara-session-ABC...
```

### ✅ Résultat Attendu
- **Chat 1** : Affiche `"DONNEES_CHAT1"` ✅
- **Chat 2** : Affiche `"DONNEES_CHAT2"` ✅
- Les données ne sont **PAS** mélangées

### Étape 4 : Actualisation (F5)
1. Sur Chat 1 : **F5** → Doit afficher `"DONNEES_CHAT1"`
2. Sur Chat 2 : **F5** → Doit afficher `"DONNEES_CHAT2"`

### ❌ Si l'isolation ne fonctionne PAS
**Problème** : Les deux chats affichent les mêmes données
→ Log visible : `🚨 [INLINE] ALERTE: SessionId depuis sessionStorage`

**Cause** :
- React n'expose pas `data-session-id` dans le DOM
- `currentSession` est undefined

**Solution** :
1. Vérifier dans Console :
   ```javascript
   document.querySelector('[data-session-id]')?.getAttribute('data-session-id')
   ```
2. Si retourne `null` :
   - Vérifier `ClaraAssistant.tsx` ligne 3730
   - Recompiler : `npm run dev` (arrêter et redémarrer)
3. Si retourne `undefined` :
   - `currentSession` n'est pas défini dans React
   - Problème dans la gestion des sessions côté frontend

---

## 🔍 VÉRIFICATIONS AVANCÉES

### Inspecter IndexedDB
1. F12 → **Application** (Chrome) / **Storage** (Firefox)
2. **IndexedDB** → `clara_db` → `clara_generated_tables`
3. Vous devez voir vos tables sauvegardées :
   ```
   id: "uuid-xxx"
   keyword: "Table_Consolidation"
   sessionId: "clara-session-ABC..."
   html: "<table>...</table>"
   timestamp: 1735506000000
   ```

### Inspecter le DOM
1. F12 → **Elements** / **Inspector**
2. Chercher : `data-session-id`
3. Doit trouver :
   ```html
   <div class="flex h-screen..." 
        data-session-id="clara-session-ABC..." 
        data-chat-session-id="clara-session-ABC...">
   ```

### Vérifier les Attributs des Tables
1. F12 → **Elements**
2. Trouver une table de consolidation
3. Vérifier présence de :
   ```html
   <table class="... claraverse-conso-table"
          data-keyword="Table_Consolidation"
          data-table-id="table_consolidation_xxx"
          data-for-table="table_xxx">
   ```

---

## 📊 LOGS DE RÉFÉRENCE

### ✅ Workflow Complet Réussi

**Sauvegarde** :
```
💾 [INLINE] Interception sauvegarde table
🔑 [INLINE] Keyword: Table_Consolidation
📍 [INLINE] SessionId: clara-session-1788034640058-... (depuis DOM ✅)
✅ [INLINE] Événement émis pour: Table_Consolidation
💾 Demande de sauvegarde depuis conso
✅ Table saved: a5cfecc4-1020-4375-a65c-9296a342b590 (keyword: Table_Consolidation)
```

**Restauration après F5** :
```
📍 [INLINE] SessionId depuis DOM: clara-session-1788034640058-...
✅ [INLINE] ISOLATION ACTIVE - SessionId unique par chat
👁️ [INLINE] Observer installé pour détecter changements de session
📋 Found 2 restorable table(s)
✅ [Bridge] Table trouvée via data-keyword: "Table_Consolidation"
✅ [Bridge] Table trouvée via data-keyword: "Table_Resultat"
✅ Restored 2 table(s) for session clara-session-1788034640058-...
```

**Changement de chat** :
```
🔄 [INLINE] CHANGEMENT DE CHAT DÉTECTÉ!
   Ancien sessionId: clara-session-ABC...
   Nouveau sessionId: clara-session-XYZ...
🔄 [INLINE] Restauration automatique pour nouveau chat...
✅ [INLINE] Tables du nouveau chat restaurées
```

### ❌ Logs Problématiques

**Isolation compromise** :
```
🚨 [INLINE] ALERTE: SessionId depuis sessionStorage
   ❌ ISOLATION DES CHATS NON GARANTIE
   ❌ Les tables peuvent être partagées entre chats!
   💡 Vérifiez que React expose bien data-session-id
```
→ **Action** : Vérifier que React compile et expose `data-session-id`

**Table non restaurée** :
```
📋 Found 1 restorable table(s)
ℹ️ No existing table found for keyword "Table_Consolidation", skipping restoration
✅ Restored 0 table(s)
```
→ **Action** : `data-keyword` absent du DOM, vérifier conso.js

**Erreur claraverseProcessor** :
```
❌ [INLINE] claraverseProcessor non trouvé après 20 secondes
```
→ **Action** : conso.js ne se charge pas, vérifier les scripts dans index.html

---

## 🛠️ COMMANDES CONSOLE UTILES

### 1. Forcer Restauration Manuelle
```javascript
// Obtenir le sessionId actuel
const sessionId = document.querySelector('[data-session-id]')?.getAttribute('data-session-id');
console.log("SessionId:", sessionId);

// Forcer restauration
window.flowiseTableBridge.restoreTablesForSession(sessionId);
```

### 2. Lister Tables avec data-keyword
```javascript
const tables = document.querySelectorAll('table[data-keyword]');
console.log(`${tables.length} table(s) avec data-keyword:`);
tables.forEach(t => {
  console.log(`- ${t.dataset.keyword} (id: ${t.dataset.tableId})`);
});
```

### 3. Vérifier Intégration
```javascript
console.log("Version intégration:", window.consoIndexedDBIntegration?.version);
console.log("Processor intégré:", window.claraverseProcessor?.__integrated);
```

### 4. Nettoyer localStorage (si besoin)
```javascript
// Supprimer anciennes données localStorage
localStorage.removeItem('claraverse_tables_data');
console.log("✅ localStorage nettoyé");
```

### 5. Voir Toutes les Tables Sauvegardées
```javascript
// Ouvrir IndexedDB
const request = indexedDB.open('clara_db', 1);
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('clara_generated_tables', 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  
  getAll.onsuccess = () => {
    console.log(`${getAll.result.length} table(s) sauvegardée(s):`);
    getAll.result.forEach(t => {
      console.log(`- ${t.keyword} (session: ${t.sessionId.substring(0, 20)}...)`);
    });
  };
};
```

---

## ✅ CHECKLIST VALIDATION

### Avant de Marquer comme Résolu
- [ ] **Test 1 réussi** : Table persiste après F5
- [ ] **Test 2 réussi** : Chat1 et Chat2 ont données séparées
- [ ] **Logs corrects** : `SessionId depuis DOM` (pas sessionStorage)
- [ ] **Observer actif** : Changement de chat détecté
- [ ] **IndexedDB peuplé** : Tables visibles dans DevTools
- [ ] **data-keyword présent** : Visible sur tables dans DOM
- [ ] **localStorage vide** : `claraverse_tables_data` n'existe plus

### Si Tous les Tests Passent
🎉 **SUCCÈS !** La solution est opérationnelle.

Les tables `Table_Consolidation` et `Table_Resultat` :
- ✅ Persistent après actualisation (F5)
- ✅ Sont isolées par chat (pas de contamination)
- ✅ Se restaurent automatiquement lors du changement de chat

---

## 🆘 EN CAS DE PROBLÈME

### 1. Aucune table ne se génère
**Cause** : Backend pas lancé ou erreur IA
**Solution** : Vérifier que `python app.py` tourne sur port 5001

### 2. Tables générées mais pas sauvegardées
**Cause** : `claraverseProcessor` pas chargé
**Solution** : Vérifier logs `[INLINE]`, attendre max 20s

### 3. Tables sauvegardées mais pas restaurées
**Cause** : `data-keyword` absent ou `findTableByKeyword` échoue
**Solution** : 
- Vérifier `data-keyword` dans DOM
- Vérifier logs `[Bridge]`
- Vérifier que `flowiseTableBridge.ts` modifié

### 4. Isolation ne fonctionne pas
**Cause** : React n'expose pas `data-session-id`
**Solution** :
- Vérifier `ClaraAssistant.tsx` ligne 3730
- Recompiler frontend
- Vérifier dans console : `document.querySelector('[data-session-id]')`

### 5. Build échoue
**Cause** : Erreur syntaxe TypeScript
**Solution** :
- Lire erreurs : `npm run build 2>&1 | more`
- Vérifier `flowiseTableBridge.ts` syntaxe

---

**Dernière mise à jour** : 29 Août 2026  
**Version** : 1.0
