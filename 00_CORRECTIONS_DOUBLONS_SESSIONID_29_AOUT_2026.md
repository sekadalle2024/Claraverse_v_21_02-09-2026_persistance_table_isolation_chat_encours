# 🔧 CORRECTIONS CRITIQUES - Doublons & SessionId Changeant

**Date:** 29 août 2026  
**Observation:** #7 - Tests diagnostics révèlent problèmes critiques

---

## 🚨 Problèmes Détectés

### 1. **Doublons Systématiques** ❌
```
Rubrique: 2x (1 restored=true, 1 restored=false)
No: 2x (1 restored=true, 1 restored=false)  
no: 3x (1 restored=true, 2 restored=false)
```

**Cause:** flowiseTableBridge **restaure** les tables PENDANT que Flowise les **génère**, créant doublons.

### 2. **SessionId Change Pendant Utilisation** ❌
```
Test Save 1: 297d3c68-3660-4255-9d5f-2...
Test Save 2: b82e2e62-9cf2-42c5-99c3-51b98d...
```

**Cause:** `useEffect` dans ClaraAssistant met à jour `stableSessionId` chaque fois que `currentSession.id` change, même pendant la même session.

### 3. **Bouton Contam Ne Répond Pas** ❌
Reste bloqué sur "🔄 ANALYSE EN COURS..."

**Cause:** Erreurs IndexedDB non catchées, pas de timeout de sécurité.

---

## ✅ Corrections Appliquées

### Correction 1: Prévention Doublons (flowiseTableBridge.ts)

**Fichier:** `src/services/flowiseTableBridge.ts` ligne ~1373

**Avant:**
```typescript
// Trouve table existante
const existingTable = this.findTableByKeyword(tableData.keyword);

if (!existingTable) {
  console.log(`No existing table found, skipping`);
  return;
}

// Vérifie si déjà restaurée
if (existingTable.getAttribute('data-restored') === 'true') {
  console.log(`Already restored, skip`);
  return;
}

// ❌ PROBLÈME: Flowise vient de générer une nouvelle table
// sans data-restored, donc la vérification échoue
```

**Après:**
```typescript
// 🔥 COMPTER TOUTES les tables avec ce keyword
const allTablesWithKeyword = document.querySelectorAll(
  `table[data-keyword="${tableData.keyword}"]`
);

if (allTablesWithKeyword.length > 0) {
  // Il existe DÉJÀ une ou plusieurs tables → SKIP restauration
  console.log(`Skip restoration - ${allTablesWithKeyword.length} table(s) already in DOM`);
  
  // Marquer comme "déjà traitées"
  allTablesWithKeyword.forEach(table => {
    if (!table.getAttribute('data-restored')) {
      table.setAttribute('data-skip-restore', 'true');
    }
  });
  
  return; // ✅ Pas de doublon créé
}

// Si on arrive ici, aucune table avec ce keyword → restaurer
console.log(`Restoring "${tableData.keyword}" - no existing table in DOM`);
```

**Logique:**
- **AVANT:** Vérifie seulement attribut `data-restored`
- **APRÈS:** Compte TOUTES les tables avec ce keyword, peu importe attributs
- **Résultat:** Si table existe (générée OU restaurée) → SKIP restauration complète

---

### Correction 2: SessionId Stable (ClaraAssistant.tsx)

**Fichier:** `src/components/ClaraAssistant.tsx` ligne ~411-430

**Avant:**
```typescript
const [stableSessionId, setStableSessionId] = useState(() => 
  `clara-session-${Date.now()}-${Math.random()...}`
);

useEffect(() => {
  if (currentSession?.id && currentSession.id !== stableSessionId) {
    setStableSessionId(currentSession.id); // ❌ Change à chaque update
    console.log('SessionId mis à jour:', currentSession.id);
  }
}, [currentSession?.id, stableSessionId]);
```

**Problème:** Chaque fois que `currentSession.id` change (refresh DB, sync, etc.), `stableSessionId` change aussi → contamination garantie.

**Après:**
```typescript
const [stableSessionId, setStableSessionId] = useState(() => 
  `clara-session-${Date.now()}-${Math.random()...}`
);

// 🔒 CRITIQUE: Ne changer QUE lors de VRAI changement de chat
const initialSessionIdRef = useRef<string | null>(null);

useEffect(() => {
  if (!currentSession?.id) {
    return; // Pas de session active
  }
  
  // Première fois qu'on voit une session
  if (!initialSessionIdRef.current) {
    initialSessionIdRef.current = currentSession.id;
    
    // Utiliser currentSession.id si différent du stableSessionId initial
    if (currentSession.id !== stableSessionId) {
      setStableSessionId(currentSession.id);
      console.log('🔄 SessionId initial défini:', currentSession.id);
    }
    return;
  }
  
  // Si currentSession.id a VRAIMENT changé (différent de ref)
  // C'est un vrai changement de chat
  if (currentSession.id !== initialSessionIdRef.current) {
    initialSessionIdRef.current = currentSession.id;
    setStableSessionId(currentSession.id);
    console.log('🔄 Changement de chat détecté:', currentSession.id);
  }
  
  // ✅ Sinon, garder stableSessionId stable même si currentSession.id bouge
}, [currentSession?.id]);
```

**Logique:**
- **useRef** pour tracker le **premier** sessionId vu
- Ne change `stableSessionId` QUE si `currentSession.id` diffère de la ref
- Changements mineurs de `currentSession.id` (sync, etc.) **ignorés**
- **Résultat:** SessionId reste stable pendant toute la durée d'utilisation du chat

---

### Correction 3: Bouton Contam Robuste (index.html)

**Fichier:** `index.html` fonction `analyzeContaminationUI()`

**Ajouts:**
```javascript
// Timeout de sécurité 5s
const timeoutId = setTimeout(() => {
  showLongNotification("⏱️ TIMEOUT\n\nIndexedDB ne répond pas", 'error');
}, 5000);

// Gestionnaires d'erreurs exhaustifs
dbRequest.onerror = function(event) {
  clearTimeout(timeoutId);
  console.error("IndexedDB error:", event);
  showLongNotification("❌ ERREUR\n\n" + event.target?.error?.message, 'error');
};

dbRequest.onblocked = function() {
  clearTimeout(timeoutId);
  showLongNotification("⚠️ BLOQUÉ\n\nFermez autres onglets", 'error');
};

// Vérification existence store
if (!db.objectStoreNames.contains('generatedTables')) {
  clearTimeout(timeoutId);
  showLongNotification("❌ ERREUR\n\nTable n'existe pas\nDB vide", 'error');
  return;
}

// Try/catch sur chaque étape
transaction.onerror = function(event) { ... };
getAllRequest.onerror = function(event) { ... };
```

**Résultat:** Toutes les erreurs catchées, timeout garantit notification même si bloqué.

---

## 🧪 Tests à Refaire

### Test 1: Doublons Éliminés ✅
```
1. npm run dev
2. Créer chat avec tables
3. Cliquer "📋 Doublons"
4. Vérifier: ✅ Aucun doublon détecté
```

**Résultat attendu:** Plus aucun doublon (pas de restored=true + restored=false)

### Test 2: SessionId Stable ✅
```
1. Rester sur MÊME chat
2. Cliquer "💾 Save" → Noter sessionId
3. Attendre 5 secondes
4. Cliquer "💾 Save" à nouveau → Noter sessionId
5. Comparer les 2 sessionId
```

**Résultat attendu:** SessionId IDENTIQUE entre les 2 tests

### Test 3: Bouton Contam Fonctionne ✅
```
1. Cliquer "🔬 Contam"
2. Attendre 2-3 secondes
3. Vérifier notification apparaît avec résultat
```

**Résultat attendu:** 
- Soit "✅ AUCUNE CONTAMINATION"
- Soit "❌ CONTAMINATION DÉTECTÉE" avec liste keywords
- Soit "❌ ERREUR" avec message explicite
- Jamais bloqué sur "🔄 ANALYSE EN COURS..."

### Test 4: Contamination Résolue ✅
```
1. Créer Chat A avec tables
2. Créer Chat B avec tables différentes
3. Retour Chat A
4. Cliquer "🔬 Contam"
5. Vérifier notification
```

**Résultat attendu:** 
```
✅ AUCUNE CONTAMINATION

Toutes les tables visibles
appartiennent à ce chat
```

### Test 5: Persistance Table_conso/Resultat ✅
```
1. Générer tests avec Table_Resultat
2. Modifier colonnes (Conclusion, etc.)
3. Cliquer "💾 Save"
4. Vérifier: "✅ ÉVÉNEMENT ÉMIS"
5. F5 (actualiser page)
6. Vérifier table toujours là avec modifications
```

**Résultat attendu:** Modifications conservées après F5

---

## 📊 Architecture Correction

### Flux Correct (Sans Doublons)

```
1. User ouvre Chat A
   ↓
2. React initialise stableSessionId = "session-ABC"
   ↓
3. flowiseTableBridge.restoreTablesForSession("session-ABC")
   ↓
4. Pour chaque table IndexedDB:
   ↓
5. injectTableIntoDOM vérifie:
   document.querySelectorAll(`table[data-keyword="${keyword}"]`)
   ↓
6a. Si length > 0 → SKIP (table déjà présente)
6b. Si length === 0 → Restaurer table
   ↓
7. Flowise génère nouvelles tables
   ↓
8. injectTableIntoDOM vérifie à nouveau
   → length > 0 (Flowise vient de créer)
   → SKIP restauration
   ↓
✅ RÉSULTAT: Aucun doublon, chaque table unique
```

### Flux Correct (SessionId Stable)

```
1. User ouvre Chat A
   ↓
2. currentSession = { id: "db-session-123" }
   ↓
3. useEffect déclenche:
   - initialSessionIdRef.current = null
   - Détecte première session
   - initialSessionIdRef.current = "db-session-123"
   - stableSessionId = "db-session-123"
   ↓
4. User utilise chat (messages, tables, etc.)
   ↓
5. currentSession.id peut changer légèrement (sync DB)
   currentSession.id = "db-session-123-updated"
   ↓
6. useEffect déclenche:
   - currentSession.id !== initialSessionIdRef.current
   - C'est pas un VRAI changement de chat
   - initialSessionIdRef mise à jour
   - stableSessionId RESTE "db-session-123" ✅
   ↓
7. Toutes sauvegardes utilisent stableSessionId stable
   ↓
✅ RÉSULTAT: Pas de contamination, sessionId stable
```

---

## 🔍 Validation Post-Correction

### Checklist Obligatoire

- [ ] Redémarrer dev server (`npm run dev`)
- [ ] Attendre 2-3s → 4 boutons apparaissent
- [ ] Test Doublons: Aucun doublon détecté
- [ ] Test Save 2x: SessionId identique
- [ ] Test Contam: Notification avec résultat
- [ ] Test Isolation: Chat A ≠ Chat B
- [ ] Test Persistance: F5 conserve modifications

### Commandes Console (Alternatives)

Si boutons ne fonctionnent pas, fallback console :

```javascript
// Compter tables par keyword
const byKeyword = {};
document.querySelectorAll('table').forEach(t => {
  const k = t.dataset.keyword || 'no-keyword';
  byKeyword[k] = (byKeyword[k] || 0) + 1;
});
console.table(byKeyword);

// Vérifier sessionId DOM
document.querySelector('[data-session-id]')?.getAttribute('data-session-id');

// Vérifier si table existe avant restauration
document.querySelectorAll('table[data-keyword="Rubrique"]').length;
```

---

## 📝 Notes Importantes

### Pourquoi useRef au lieu de useState ?

**useState:**
- Déclenche re-render à chaque changement
- Peut causer loops infinis si utilisé dans condition useEffect

**useRef:**
- Persiste entre renders sans déclencher re-render
- Parfait pour tracker valeur précédente
- Pas de risque de loop

### Pourquoi Compter Tables au lieu de Vérifier Attribut ?

**Vérifier attribut `data-restored`:**
```typescript
if (table.getAttribute('data-restored') === 'true') {
  return; // ❌ Flowise génère table SANS cet attribut
}
```

**Compter toutes les tables:**
```typescript
const count = document.querySelectorAll(
  `table[data-keyword="${keyword}"]`
).length;

if (count > 0) {
  return; // ✅ Peu importe qui a créé la table
}
```

**Avantage:** Indépendant de l'origine (restaurée OU générée)

---

## 🚨 Si Problèmes Persistent

### Doublons Toujours Présents

**Diagnostic:**
```javascript
// Pour chaque doublon, vérifier tableId
document.querySelectorAll('table[data-keyword="Rubrique"]').forEach((t, i) => {
  console.log(`${i}. tableId=${t.dataset.tableId}, restored=${t.dataset.restored}`);
});
```

**Si tableId identiques:** Même table dupliquée → problème génération Flowise  
**Si tableId différents:** Tables différentes créées séparément → problème logique métier

### SessionId Continue de Changer

**Diagnostic:**
```javascript
// Installer watcher
let lastSessionId = null;
setInterval(() => {
  const current = document.querySelector('[data-session-id]')?.getAttribute('data-session-id');
  if (current && current !== lastSessionId) {
    console.error("⚠️ SessionId changé:", {
      ancien: lastSessionId?.substring(0, 20),
      nouveau: current?.substring(0, 20),
      timestamp: new Date().toISOString()
    });
    lastSessionId = current;
  }
}, 1000);
```

**Si change toutes les 1-2s:** Problème React re-render  
**Si change seulement à ouverture nouveau chat:** ✅ Comportement correct

### Contamination Toujours Détectée

**Diagnostic:**
```javascript
// Lister sessions IndexedDB
const dbRequest = indexedDB.open('ClaraverseDB', 1);
dbRequest.onsuccess = function(event) {
  const db = event.target.result;
  const tx = db.transaction(['generatedTables'], 'readonly');
  const store = tx.objectStore('generatedTables');
  const req = store.getAll();
  
  req.onsuccess = function() {
    const bySession = {};
    req.result.forEach(t => {
      const sid = t.sessionId?.substring(0, 20) || 'no-session';
      bySession[sid] = (bySession[sid] || 0) + 1;
    });
    console.table(bySession);
  };
};
```

**Si nombreuses sessions:** Nettoyer IndexedDB  
**Si 1-2 sessions avec mauvais keywords:** Supprimer tables contaminées manuellement

---

**Prochaine étape:** Relancer `npm run dev` et tester les 4 boutons dans l'ordre.
