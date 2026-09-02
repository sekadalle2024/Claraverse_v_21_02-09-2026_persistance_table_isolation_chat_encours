# 🔍 Guide Diagnostic Console

**Fonctions de diagnostic intégrées dans index.html**  
**Accessibles via Console Browser (F12)**

---

## 🎯 Fonctions Disponibles

### 1️⃣ `window.checkSessionId()`
**Vérifie** : Isolation des chats et état du sessionId

**Utilisation** :
```javascript
window.checkSessionId()
```

**Résultat** :
```
═══════════════════════════════════════════
🔍 DIAGNOSTIC: SessionId et Isolation
═══════════════════════════════════════════
1️⃣ data-session-id dans DOM:
   Element: ✅ Trouvé
   SessionId: clara-session-1735506000000-abc123xyz
   Longueur: 45 caractères
   Préfixe: clara-session-17...
   ✅ Isolation ACTIVE

2️⃣ Cache interne:
   cachedSessionId: clara-session-1735506000000-abc...
   sessionIdSource: DOM
   sessionIdRetryCount: 0

3️⃣ Recommandations:
   ✅ Tout fonctionne correctement
═══════════════════════════════════════════
```

**Retourne objet** :
```javascript
{
  hasElement: true,
  sessionId: "clara-session-1735506000000-abc123xyz",
  source: "DOM",
  retryCount: 0,
  isolated: true
}
```

---

### 2️⃣ `window.checkConsoIntegration()`
**Vérifie** : Intégration du script conso.js

**Utilisation** :
```javascript
window.checkConsoIntegration()
```

**Résultat si OK** :
```
═══════════════════════════════════════════
🔍 DIAGNOSTIC: Intégration conso.js
═══════════════════════════════════════════
1️⃣ window.claraverseProcessor:
   Existe: ✅
   __integrated: ✅
   saveTableDataNow: function
   setupTableInteractions: function
   findResultatTable: function

2️⃣ Recommandations:
   ✅ Intégration complète et fonctionnelle
═══════════════════════════════════════════
```

**Résultat si problème** :
```
1️⃣ window.claraverseProcessor:
   Existe: ❌
   ❌ claraverseProcessor non trouvé
   → Vérifier que conso.js est chargé

2️⃣ Recommandations:
   ⚠️ Vérifier index.html ligne 134: <script src="/conso.js">
   ⚠️ Vérifier que le fichier existe: h:\Claverse_1\public\conso.js
```

---

### 3️⃣ `window.checkTableDuplicates()`
**Vérifie** : Doublons de tables dans le DOM

**Utilisation** :
```javascript
window.checkTableDuplicates()
```

**Résultat sans doublon** :
```
═══════════════════════════════════════════
🔍 DIAGNOSTIC: Doublons de Tables
═══════════════════════════════════════════
📊 Total tables: 3
📊 Keywords uniques: 3

✅ Unique: "Modelized_table"
✅ Unique: "Table_Consolidation"
✅ Unique: "Table_Resultat"

2️⃣ Recommandations:
   ✅ Aucun doublon détecté
═══════════════════════════════════════════
```

**Résultat avec doublon** :
```
❌ DOUBLON: "Table_Consolidation" → 2 tables
   1. ID: table_consolidation_123, Restored: non, Class: claraverse-conso-table
   2. ID: table_consolidation_456, Restored: true, Class: claraverse-conso-table

2️⃣ Recommandations:
   ⚠️ Des doublons existent
   ⚠️ Vérifier flowiseTableBridge.ts ligne 1342
   ⚠️ Chercher logs console: '⏭️ Skip restoration'
```

---

### 4️⃣ `window.checkTableSaves()`
**Vérifie** : Présence des tables de consolidation et résultat

**Utilisation** :
```javascript
window.checkTableSaves()
```

**Résultat** :
```
═══════════════════════════════════════════
🔍 DIAGNOSTIC: Sauvegarde Tables
═══════════════════════════════════════════
1️⃣ Table_Consolidation:
   ✅ Trouvée dans DOM
   data-table-id: table_consolidation_1735506000000
   data-keyword: Table_Consolidation
   data-restored: non

2️⃣ Table_Resultat:
   ✅ Trouvée dans DOM
   data-table-id: table_resultat_1735506000000
   data-keyword: Table_Resultat
   data-restored: non

3️⃣ Instructions Test:
   1. Générer une table avec consolidation
   2. Chercher dans console:
      - '💾 [CONSO] Sauvegarde forcée Table_Consolidation'
      - '💾 [CONSO] Sauvegarde forcée Table_Resultat'
      - '💾 [INLINE] Interception sauvegarde table'
      - '✅ Table saved: table_xxx'
   3. Si logs absents → Sauvegarde ne se déclenche pas
═══════════════════════════════════════════
```

---

### 5️⃣ `window.runFullDiagnostic()` ⭐
**Exécute** : Tous les diagnostics en une seule commande

**Utilisation** :
```javascript
window.runFullDiagnostic()
```

**Résultat** : Exécute séquentiellement les 4 diagnostics + résumé global

```
╔═══════════════════════════════════════════════════════════════╗
║                 🔍 DIAGNOSTIC COMPLET                         ║
╚═══════════════════════════════════════════════════════════════╝

[... tous les diagnostics s'exécutent ...]

╔═══════════════════════════════════════════════════════════════╗
║                    📊 RÉSUMÉ GLOBAL                           ║
╚═══════════════════════════════════════════════════════════════╝

✅ ✅ ✅ TOUT FONCTIONNE CORRECTEMENT ✅ ✅ ✅
```

**Ou si problèmes** :
```
⚠️ PROBLÈMES DÉTECTÉS:

   ❌ Isolation compromise - data-session-id problématique
   ❌ conso.js pas intégré correctement
   ❌ Doublons de tables détectés
```

---

## 📋 Workflow de Diagnostic Recommandé

### Au Démarrage de l'Application

1. **Ouvrir Console** (F12)
2. **Exécuter diagnostic complet** :
   ```javascript
   window.runFullDiagnostic()
   ```
3. **Vérifier résumé global** :
   - ✅ Tout OK → Continuer normalement
   - ❌ Problèmes → Suivre recommandations

---

### Après Génération de Table

1. **Générer table avec consolidation**
2. **Chercher logs automatiques** :
   ```
   💾 [CONSO] Sauvegarde forcée Table_Consolidation
   💾 [CONSO] Sauvegarde forcée Table_Resultat
   🔧 [CONSO] Réinstallation listeners
   ```
3. **Si logs absents, exécuter** :
   ```javascript
   window.checkConsoIntegration()
   window.checkTableSaves()
   ```

---

### Après F5 (Actualisation)

1. **Vérifier isolation maintenue** :
   ```javascript
   window.checkSessionId()
   ```
   - ✅ `isolated: true` → OK
   - ❌ `isolated: false` → Problème

2. **Vérifier doublons** :
   ```javascript
   window.checkTableDuplicates()
   ```

---

### Si Contamination Entre Chats

1. **Noter sessionId Chat1** :
   ```javascript
   const chat1 = window.checkSessionId().sessionId
   console.log("Chat1:", chat1)
   ```

2. **Créer nouveau chat (Chat2)**

3. **Vérifier sessionId différent** :
   ```javascript
   const chat2 = window.checkSessionId().sessionId
   console.log("Chat2:", chat2)
   console.log("Différents ?", chat1 !== chat2 ? "✅" : "❌")
   ```

4. **Retourner Chat1**

5. **Vérifier sessionId revenu** :
   ```javascript
   const chat1Again = window.checkSessionId().sessionId
   console.log("Chat1 retour:", chat1Again)
   console.log("Même ?", chat1 === chat1Again ? "✅" : "❌")
   ```

---

## 🎯 Interprétation Résultats

### ✅ Tout Fonctionne Si

```javascript
const result = window.runFullDiagnostic();

// Isolation OK
result.sessionId.isolated === true

// Conso.js intégré
result.consoIntegration.integrated === true

// Pas de doublons
result.duplicates.hasDuplicates === false
```

---

### ❌ Problèmes Identifiés

#### Problème 1 : `isolated: false`
**Cause** : data-session-id absent ou undefined

**Solution** :
1. Vérifier compilation React : `npm run dev`
2. Vérifier ClaraAssistant.tsx ligne 411-425
3. Chercher erreurs TypeScript dans terminal

---

#### Problème 2 : `integrated: false`
**Cause** : conso.js pas chargé ou pas intégré

**Solution** :
1. Vérifier index.html ligne 134 : `<script src="/conso.js">`
2. Vérifier fichier existe : `h:\Claverse_1\public\conso.js`
3. Attendre 2-3 secondes puis relancer diagnostic
4. Chercher logs : "✅ [INLINE] claraverseProcessor trouvé"

---

#### Problème 3 : `hasDuplicates: true`
**Cause** : Tables restaurées plusieurs fois

**Solution** :
1. Chercher logs : "⏭️ Skip restoration of Table_Consolidation"
2. Si absent → flowiseTableBridge ne skip pas
3. Vérifier flowiseTableBridge.ts ligne 1342
4. Vérifier attribut `data-restored="true"` sur tables

---

#### Problème 4 : Tables pas sauvegardées
**Cause** : findResultatTable ne trouve pas tables

**Solution** :
1. Chercher logs après consolidation :
   ```
   🔍 [findResultatTable] X table(s) trouvée(s)
   ✅ [findResultatTable] Table Résultat trouvée
   ```
2. Si "⚠️ Aucune table trouvée" :
   - Structure HTML différente de prévu
   - Tables pas dans même parent
3. Inspecter DOM (F12 → Elements) pour voir structure

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Vérification Rapide
```javascript
// Au démarrage
window.checkSessionId()
// → Si isolated: true, tout va bien

// Après consolidation
window.checkTableSaves()
// → Vérifier que tables sont présentes
```

---

### Exemple 2 : Debug Doublons
```javascript
// Vérifier doublons
const result = window.checkTableDuplicates()

// Si doublons détectés
console.log("Détails:", result.byKeyword)

// Inspecter table spécifique
const consolidationTables = result.byKeyword["Table_Consolidation"]
consolidationTables.forEach((t, i) => {
  console.log(`Table ${i}:`, t.element)
})
```

---

### Exemple 3 : Debug Isolation
```javascript
// Vérifier état complet isolation
const session = window.checkSessionId()

if (!session.isolated) {
  console.log("🚨 ISOLATION COMPROMISE")
  console.log("Source:", session.source)
  console.log("Retry:", session.retryCount)
  
  if (session.source === 'sessionStorage') {
    console.log("⚠️ React trop lent (>2s)")
  } else {
    console.log("⚠️ data-session-id pas dans DOM")
  }
}
```

---

## 📊 Checklist Validation Complète

```javascript
// Exécuter diagnostic complet
const diag = window.runFullDiagnostic()

// Checklist
const checks = {
  "✅ Isolation active": diag.sessionId.isolated,
  "✅ Conso.js intégré": diag.consoIntegration.integrated,
  "✅ Pas de doublons": !diag.duplicates.hasDuplicates,
  "✅ Tables générées": diag.tableSaves.hasConsolidation || diag.tableSaves.hasResultat
}

console.table(checks)
```

**Résultat attendu** :
```
┌─────────────────────────────┬───────┐
│         (index)             │ Value │
├─────────────────────────────┼───────┤
│ ✅ Isolation active         │ true  │
│ ✅ Conso.js intégré         │ true  │
│ ✅ Pas de doublons          │ true  │
│ ✅ Tables générées          │ true  │
└─────────────────────────────┴───────┘
```

---

## 🚀 Raccourcis Clavier Utiles

- **F12** : Ouvrir/Fermer Console
- **Ctrl + L** : Clear console
- **↑ ↓** : Naviguer historique commandes
- **Tab** : Auto-complétion

---

## ✅ Résumé

**5 fonctions disponibles** :
1. `window.checkSessionId()` → Isolation
2. `window.checkConsoIntegration()` → conso.js
3. `window.checkTableDuplicates()` → Doublons
4. `window.checkTableSaves()` → Sauvegardes
5. `window.runFullDiagnostic()` → Tout en un ⭐

**Usage recommandé** :
```javascript
// Au démarrage
window.runFullDiagnostic()

// Si problème spécifique
window.checkSessionId()
window.checkConsoIntegration()
window.checkTableDuplicates()
window.checkTableSaves()
```

---

**Les fonctions sont chargées automatiquement au démarrage de l'application** ✅
