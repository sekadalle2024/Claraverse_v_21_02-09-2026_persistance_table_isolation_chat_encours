# 🔍 Aide-Mémoire Logs - Persistance & Isolation

Guide visuel rapide pour identifier si le système fonctionne correctement.

---

## ✅ LOGS NORMAUX (Tout fonctionne)

### Au Chargement de Page
```
🔗 [INLINE] Chargement intégration conso → IndexedDB
✅ [INLINE] claraverseProcessor trouvé après 200ms
🔧 [INLINE] Remplacement de saveTableDataNow...
✅ [INLINE] Intégration terminée
🧹 [INLINE] Nettoyage localStorage (ancien système)
   143 table(s) dans localStorage - SUPPRESSION
   ✅ localStorage vidé
👁️ [INLINE] Observer installé pour détecter changements de session
```

### Isolation Active (SessionId depuis React)
```
📍 [INLINE] SessionId depuis DOM: clara-session-1788034640058-ienho9jr6...
✅ [INLINE] ISOLATION ACTIVE - SessionId unique par chat
```
**→ PARFAIT !** Chaque chat a son propre sessionId.

### Sauvegarde d'une Table
```
💾 [INLINE] Interception sauvegarde table
🔑 [INLINE] Keyword: Table_Consolidation
✏️ Ajout data-keyword='Table_Consolidation' sur table trouvée
✏️ Ajout data-table-id: table_consolidation_xxx
📍 [INLINE] SessionId: clara-session-xxx... (depuis DOM ✅)
✅ [INLINE] Événement émis pour: Table_Consolidation
💾 Demande de sauvegarde depuis conso
✅ Table saved: a5cfecc4-1020-4375-a65c-9296a342b590 (keyword: Table_Consolidation)
```
**→ PARFAIT !** La table est sauvegardée dans IndexedDB.

### Restauration après F5
```
📍 [INLINE] SessionId depuis DOM: clara-session-xxx...
✅ [INLINE] ISOLATION ACTIVE
📋 Found 2 restorable table(s)
✅ [Bridge] Table trouvée via data-keyword: "Table_Consolidation"
✅ [Bridge] Table trouvée via data-keyword: "Table_Resultat"
✅ Restored 2 table(s) for session clara-session-xxx
```
**→ PARFAIT !** Les tables sont restaurées correctement.

### Changement de Chat
```
🔄 [INLINE] CHANGEMENT DE CHAT DÉTECTÉ!
   Ancien sessionId: clara-session-ABC...
   Nouveau sessionId: clara-session-XYZ...
🔄 [INLINE] Restauration automatique pour nouveau chat...
📋 Found 1 restorable table(s)
✅ [INLINE] Tables du nouveau chat restaurées
```
**→ PARFAIT !** L'isolation fonctionne, les chats sont séparés.

---

## ❌ LOGS PROBLÉMATIQUES

### ⚠️ PROBLÈME 1 : Isolation Compromise

```
⚠️ [INLINE] SessionId depuis sessionStorage (RISQUE: pas isolé par chat)
   → Tables peuvent être partagées entre chats!
```

**OU**

```
🚨 [INLINE] ALERTE: SessionId depuis sessionStorage
   ❌ ISOLATION DES CHATS NON GARANTIE
   ❌ Les tables peuvent être partagées entre chats!
   💡 Vérifiez que React expose bien data-session-id
```

**CAUSE** : React n'expose pas `data-session-id` dans le DOM.

**DIAGNOSTIC** :
```javascript
// Console navigateur
document.querySelector('[data-session-id]')?.getAttribute('data-session-id')
// Si retourne null → React ne compile pas correctement
```

**SOLUTION** :
1. Vérifier `src/components/ClaraAssistant.tsx` ligne 3730 :
   ```tsx
   data-session-id={currentSession?.id}
   data-chat-session-id={currentSession?.id}
   ```
2. Recompiler : Arrêter `npm run dev` et redémarrer
3. Vérifier que `currentSession` n'est pas `undefined`

---

### ⚠️ PROBLÈME 2 : Tables Non Restaurées

```
📋 Found 2 restorable table(s)
ℹ️ No existing table found for keyword "Table_Consolidation", skipping restoration
ℹ️ No existing table found for keyword "Table_Resultat", skipping restoration
✅ Restored 0 table(s)
```

**CAUSE** : Les tables n'ont pas `data-keyword` dans le DOM.

**DIAGNOSTIC** :
```javascript
// Console navigateur
document.querySelectorAll('table[data-keyword]')
// Si retourne [] → conso.js n'ajoute pas data-keyword
```

**SOLUTION** :
1. Vérifier modifications dans `public/conso.js` :
   - Ligne 838-850 : `consoTable.dataset.keyword = "Table_Consolidation";`
   - Ligne 1528-1540 : `potentialTable.dataset.keyword = "Table_Resultat";`
2. Vider cache navigateur : Ctrl+Shift+Delete
3. Recharger page : Ctrl+Shift+R (hard refresh)

---

### ⚠️ PROBLÈME 3 : claraverseProcessor Non Trouvé

```
❌ [INLINE] claraverseProcessor non trouvé après 20 secondes
❌ [INLINE] window.claraverseProcessor = undefined
```

**CAUSE** : `conso.js` ne se charge pas.

**DIAGNOSTIC** :
```javascript
// Console navigateur
window.claraverseProcessor
// Si undefined → script non chargé
```

**SOLUTION** :
1. Vérifier `index.html` contient : `<script src="/conso.js"></script>`
2. Vérifier fichier existe : `public/conso.js`
3. Vérifier Network tab (F12) : conso.js doit être chargé (200 OK)
4. Vérifier erreurs JavaScript dans console

---

### ⚠️ PROBLÈME 4 : Sauvegarde Non Déclenchée

**AUCUN LOG après modification de cellule** (pas de `💾 [INLINE] Interception`).

**CAUSE** : L'intégration ne s'est pas faite.

**DIAGNOSTIC** :
```javascript
// Console navigateur
window.claraverseProcessor?.__integrated
// Si undefined ou false → intégration échouée
```

**SOLUTION** :
1. Attendre jusqu'à 20 secondes après chargement page
2. Recharger page (F5)
3. Vérifier log : `✅ [INLINE] Intégration terminée`

---

### ⚠️ PROBLÈME 5 : Contamination Entre Chats

**Symptôme** : Chat1 affiche les données de Chat2 après changement.

**CAUSE** : SessionId identique entre les deux chats (fallback sessionStorage).

**DIAGNOSTIC** :
1. Ouvrir Chat1, regarder log :
   ```
   📍 [INLINE] SessionId: temp-session-xxx
   ```
2. Ouvrir Chat2, regarder log :
   ```
   📍 [INLINE] SessionId: temp-session-xxx (MÊME ID ❌)
   ```

**SOLUTION** : Même que PROBLÈME 1 (React doit exposer data-session-id).

---

## 🔧 COMMANDES DÉPANNAGE RAPIDE

### Vérifier État du Système
```javascript
// Console navigateur (F12)
runDiagnostic()  // Lance diagnostic complet (voir tous les tests)
```

### Forcer Restauration Manuelle
```javascript
const sessionId = document.querySelector('[data-session-id]')?.getAttribute('data-session-id');
console.log("SessionId:", sessionId);
window.flowiseTableBridge.restoreTablesForSession(sessionId);
```

### Lister Tables avec data-keyword
```javascript
listTables()  // Affiche toutes les tables avec data-keyword
```

### Inspecter IndexedDB
```javascript
checkIndexedDB()  // Liste toutes les tables sauvegardées
```

### Nettoyer localStorage Manuellement
```javascript
localStorage.removeItem('claraverse_tables_data');
console.log("✅ localStorage nettoyé");
location.reload();
```

---

## 📊 COMPARAISON VISUELLE

### ✅ CE QUE VOUS DEVEZ VOIR

```
┌─────────────────────────────────────────────────────────┐
│ Console Logs (F12)                                      │
├─────────────────────────────────────────────────────────┤
│ ✅ [INLINE] claraverseProcessor trouvé                 │
│ ✅ [INLINE] Intégration terminée                        │
│ 📍 [INLINE] SessionId depuis DOM                        │
│ ✅ [INLINE] ISOLATION ACTIVE                            │
│ 💾 [INLINE] Interception sauvegarde table               │
│ ✅ Table saved: uuid-xxx                                │
│ ✅ [Bridge] Table trouvée via data-keyword              │
│ ✅ Restored 2 table(s)                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ IndexedDB (DevTools > Application)                     │
├─────────────────────────────────────────────────────────┤
│ clara_db                                                │
│  └─ clara_generated_tables                              │
│      ├─ Table 1: keyword="Table_Consolidation"          │
│      │          sessionId="clara-session-ABC..."        │
│      └─ Table 2: keyword="Table_Resultat"               │
│                 sessionId="clara-session-ABC..."        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DOM (DevTools > Elements)                               │
├─────────────────────────────────────────────────────────┤
│ <div data-session-id="clara-session-ABC...">            │
│   ...                                                   │
│   <table data-keyword="Table_Consolidation"             │
│          data-table-id="table_consolidation_xxx">       │
│     ...                                                 │
│   </table>                                              │
│ </div>                                                  │
└─────────────────────────────────────────────────────────┘
```

### ❌ CE QUE VOUS NE DEVEZ PAS VOIR

```
┌─────────────────────────────────────────────────────────┐
│ Console Logs (F12) - PROBLÉMATIQUE                     │
├─────────────────────────────────────────────────────────┤
│ 🚨 [INLINE] ALERTE: SessionId depuis sessionStorage     │
│ ❌ ISOLATION DES CHATS NON GARANTIE                     │
│ ℹ️ No existing table found for keyword "..."           │
│ ❌ [INLINE] claraverseProcessor non trouvé              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DOM (DevTools > Elements) - PROBLÉMATIQUE              │
├─────────────────────────────────────────────────────────┤
│ <div class="flex h-screen...">  ❌ PAS de data-session-id
│   ...                                                   │
│   <table class="claraverse-conso-table">  ❌ PAS de data-keyword
│     ...                                                 │
│   </table>                                              │
│ </div>                                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 CHECKLIST VALIDATION RAPIDE

Avant de considérer le système fonctionnel :

- [ ] **Au chargement** : Log `✅ [INLINE] Intégration terminée`
- [ ] **SessionId** : Log `📍 SessionId depuis DOM` (pas sessionStorage)
- [ ] **Isolation** : Log `✅ [INLINE] ISOLATION ACTIVE`
- [ ] **Sauvegarde** : Log `✅ Table saved: uuid-xxx` après modification
- [ ] **Restauration** : Log `✅ Restored X table(s)` après F5
- [ ] **data-keyword** : `document.querySelectorAll('table[data-keyword]')` retourne tables
- [ ] **data-session-id** : `document.querySelector('[data-session-id]')` existe
- [ ] **IndexedDB** : Tables visibles dans DevTools > Application > IndexedDB
- [ ] **localStorage** : `localStorage.getItem('claraverse_tables_data')` retourne null
- [ ] **Changement chat** : Log `🔄 CHANGEMENT DE CHAT DÉTECTÉ`

**Si tous cochés → ✅ SYSTÈME OPÉRATIONNEL**

---

## 📞 AIDE SUPPLÉMENTAIRE

**Documentation complète** :
- `00_SOLUTION_FINALE_PERSISTANCE_ISOLATION_29_AOUT_2026.md`

**Guide de test** :
- `00_GUIDE_TEST_RAPIDE_PERSISTANCE.md`

**Script diagnostic** :
- Charger : `<script src="/diagnostic-persistance.js"></script>`
- Exécuter : `runDiagnostic()`

**Résumé modifications** :
- `00_RESUME_MODIFICATIONS_29_AOUT_2026.txt`

---

**Dernière mise à jour** : 29 Août 2026
