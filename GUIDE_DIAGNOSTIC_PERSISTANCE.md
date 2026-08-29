# 🔍 Guide de Diagnostic - Tables Non Persistantes

## ⚠️ Problème Rapporté

**Les tables `Table_conso` et `Résultat` ne sont pas persistantes après actualisation (F5)**

---

## 🚀 Diagnostic Automatique

### Étape 1: Redémarrer l'Application (2 min)

```bash
# Arrêter les serveurs actuels (Ctrl+C dans chaque terminal)

# Terminal 1: Backend
cd packages/server
python app.py

# Terminal 2: Frontend  
npm run dev
```

---

### Étape 2: Ouvrir la Console (1 min)

1. Ouvrir l'application dans le navigateur
2. Appuyer sur **F12** pour ouvrir les outils de développement
3. Aller dans l'onglet **Console**

**Vous devriez voir automatiquement après 3 secondes:**

```
🔍 [Diagnostic] Script de diagnostic de persistance chargé
============================================================
🔍 DIAGNOSTIC DE PERSISTANCE DES TABLES
============================================================
```

---

### Étape 3: Analyser les Résultats (2 min)

Le diagnostic affiche **8 sections**:

#### Section 1: Intégration conso-indexeddb

**✅ BON:**
```
✅ consoIndexedDBIntegration est défini
   Méthodes disponibles: [...]
```

**❌ PROBLÈME:**
```
❌ consoIndexedDBIntegration N'EST PAS défini
→ Le script conso-indexeddb-integration.js n'est pas chargé !
```

**Solution:** Vérifier que le fichier existe et est chargé (voir Onglet Réseau)

---

#### Section 2: Vérification de conso.js

**✅ BON:**
```
✅ saveTableDataNow existe
✅ saveTableDataNow a été REMPLACÉE par l'intégration
```

**❌ PROBLÈME:**
```
⚠️ saveTableDataNow N'A PAS été remplacée
→ Utilise toujours localStorage
```

**Solution:** Le script d'intégration n'a pas pu remplacer la fonction. Voir Section 8.

---

#### Section 3: Services

**✅ BON:**
```
✅ flowiseTableBridge disponible
✅ flowiseTableService disponible
```

**❌ PROBLÈME:**
```
❌ flowiseTableBridge NON disponible
```

**Solution:** Les services TypeScript ne sont pas compilés. Redémarrer le frontend.

---

#### Section 4: Tables dans le DOM

**✅ BON:**
```
📊 5 table(s) trouvée(s) dans le DOM
   ✅ Table 2: TABLE_CONSO trouvée
   ✅ Table 3: TABLE_RESULTAT trouvée
```

**❌ PROBLÈME:**
```
   ⚠️ Table_conso NON trouvée dans le DOM
   ⚠️ Table_Resultat NON trouvée dans le DOM
```

**Solution:** Générer les tables en utilisant l'application, puis réexécuter le diagnostic.

---

#### Section 5: IndexedDB

**✅ BON:**
```
✅ Base de données "clara_db" accessible
📊 10 table(s) dans IndexedDB
   ✅ Table_conso trouvée dans IndexedDB
   ✅ Table_Resultat trouvée dans IndexedDB
```

**❌ PROBLÈME:**
```
📊 0 table(s) dans IndexedDB
   ⚠️ Table_conso NON trouvée dans IndexedDB
```

**Solution:** Les tables ne sont pas sauvegardées. Vérifier Section 1 et 2.

---

#### Section 6: localStorage (ancien système)

**✅ BON:**
```
✅ Pas de données dans localStorage
```

**⚠️ ATTENTION:**
```
⚠️ 3 table(s) dans localStorage (ancien système)
```

**Action:** Migration nécessaire (automatique au prochain chargement)

---

#### Section 7: sessionStorage

**✅ BON:**
```
✅ SessionId stable: stable_session_1234567890_abc123
```

**❌ PROBLÈME:**
```
⚠️ Pas de sessionId stable dans sessionStorage
```

**Solution:** Sera créé automatiquement à la première sauvegarde.

---

#### Section 8: Écouteurs d'événements

**Installés automatiquement.** Surveiller les messages:

**Lors de la modification d'une table:**
```
💾 [ÉVÉNEMENT] flowise:table:save:request détecté
   Keyword: Table_Consolidation
   SessionId: stable_session_...
   Source: conso
```

**Si sauvegarde réussie:**
```
✅ [ÉVÉNEMENT] flowise:table:save:success
   Keyword: Table_Consolidation
```

**Si erreur:**
```
❌ [ÉVÉNEMENT] flowise:table:save:error
   Error: [message d'erreur]
```

---

## 🧪 Tests Manuels

### Test 1: Générer et Sauvegarder (2 min)

1. Dans l'application, générer une **Table_conso** (via consolidation)
2. Observer la console: chercher `💾 [ÉVÉNEMENT] flowise:table:save:request`
3. Attendre: chercher `✅ [ÉVÉNEMENT] flowise:table:save:success`

**✅ Si les événements apparaissent:** La sauvegarde fonctionne

**❌ Si aucun événement:** Le script d'intégration ne fonctionne pas

---

### Test 2: Vérifier IndexedDB (1 min)

1. F12 → Onglet **Application**
2. **IndexedDB** → **clara_db** → **clara_generated_tables**
3. Chercher une entrée avec `keyword: "Table_Consolidation"`

**✅ Si trouvée:** Sauvegarde réussie

**❌ Si aucune entrée:** Problème de sauvegarde

---

### Test 3: Actualiser et Restaurer (30 sec)

1. Appuyer sur **F5** (actualiser)
2. Observer la console: chercher `🔄 [Restauration]`
3. Vérifier que la table est de retour

**✅ Si table restaurée:** Tout fonctionne

**❌ Si table disparue:** Problème de restauration

---

## 🔧 Solutions par Symptôme

### Symptôme A: Script d'intégration non chargé

**Diagnostic:**
```
❌ consoIndexedDBIntegration N'EST PAS défini
```

**Solutions:**

1. **Vérifier le fichier existe:**
```bash
ls public/conso-indexeddb-integration.js
```

2. **Vérifier dans l'onglet Réseau (F12):**
   - Filtrer par "conso-indexeddb"
   - Vérifier statut HTTP 200 (succès)
   - Si 404: fichier manquant
   - Si autre erreur: voir l'onglet Console

3. **Vérifier index.html:**
```html
<script src="/conso.js"></script>
<script src="/conso-indexeddb-integration.js"></script>
```

4. **Nettoyer le cache:**
   - Ctrl+Shift+R (hard refresh)
   - Ou Ctrl+Shift+Delete → Vider le cache

---

### Symptôme B: saveTableDataNow non remplacée

**Diagnostic:**
```
⚠️ saveTableDataNow N'A PAS été remplacée
→ Utilise toujours localStorage
```

**Cause possible:** Le script d'intégration se charge AVANT conso.js

**Solution:**

Vérifier l'ordre dans `index.html`:
```html
<!-- 1. CONSO.JS D'ABORD -->
<script src="/conso.js"></script>

<!-- 2. PUIS L'INTÉGRATION -->
<script src="/conso-indexeddb-integration.js"></script>
```

Si inversé, corriger et redémarrer.

---

### Symptôme C: Services TypeScript manquants

**Diagnostic:**
```
❌ flowiseTableBridge NON disponible
```

**Solutions:**

1. **Redémarrer le frontend:**
```bash
# Arrêter (Ctrl+C)
npm run dev
```

2. **Vérifier la compilation TypeScript:**
   - Chercher erreurs dans la console du terminal
   - Vérifier que `menuIntegration.ts` est compilé

3. **Si erreur de compilation:**
   - Lire l'erreur dans le terminal
   - Corriger le fichier TypeScript concerné

---

### Symptôme D: Tables non sauvegardées

**Diagnostic:**
```
📊 0 table(s) dans IndexedDB
```

**Test:**
1. Modifier une table
2. Observer console
3. Chercher: `💾 [ÉVÉNEMENT] flowise:table:save:request`

**Si événement NON émis:**
- saveTableDataNow n'est pas appelée
- Ou n'a pas été remplacée (voir Symptôme B)

**Si événement émis mais erreur:**
- Lire le message d'erreur
- Vérifier que flowiseTableService fonctionne

---

### Symptôme E: Tables sauvegardées mais non restaurées

**Diagnostic:**
```
✅ Table_conso trouvée dans IndexedDB
(mais disparaît après F5)
```

**Solutions:**

1. **Vérifier flowiseTableBridge:**
```javascript
window.flowiseTableBridge.getCurrentSession().then(console.log)
```

2. **Forcer la restauration:**
```javascript
window.flowiseTableBridge.restoreCurrentSession()
```

3. **Vérifier sessionId:**
```javascript
sessionStorage.getItem('claraverse_stable_session')
```

Si `null`, problème de session. Les tables sont sauvegardées avec un sessionId différent.

**Solution:** Vider sessionStorage et recharger:
```javascript
sessionStorage.clear()
location.reload()
```

---

## 📋 Checklist Complète

Cochez au fur et à mesure:

### Fichiers
- [ ] `public/conso-indexeddb-integration.js` existe
- [ ] `public/test-conso-indexeddb.js` existe
- [ ] `index.html` charge les scripts dans le bon ordre

### Scripts chargés
- [ ] `consoIndexedDBIntegration` défini (console)
- [ ] `testConsoIndexedDB` défini (console)
- [ ] `saveTableDataNow` remplacée (console)

### Services
- [ ] `window.flowiseTableBridge` disponible
- [ ] `window.flowiseTableService` disponible

### Tables
- [ ] Table_conso existe dans le DOM
- [ ] Table_Resultat existe dans le DOM

### Sauvegarde
- [ ] Événement `flowise:table:save:request` émis
- [ ] Événement `flowise:table:save:success` émis
- [ ] Tables dans IndexedDB (F12 > Application)

### Restauration
- [ ] SessionId stable créé
- [ ] Tables restaurées après F5
- [ ] Pas d'erreur dans la console

---

## 🎯 Commandes Rapides

### Diagnostic

```javascript
// Réexécuter le diagnostic complet
window.runDiagnostic()

// Test rapide (30 sec)
consoIndexedDBIntegration.quickTest()

// Tests complets (2 min)
testConsoIndexedDB.runAllTests()
```

### Vérifications

```javascript
// Vérifier IndexedDB
testConsoIndexedDB.getTablesFromIndexedDB().then(tables => {
  console.log(`${tables.length} table(s) sauvegardée(s)`);
  tables.forEach(t => console.log(`- ${t.keyword}`));
})

// Vérifier sessionId
consoIndexedDBIntegration.getCurrentSession().then(console.log)

// Vérifier services
console.log('Bridge:', !!window.flowiseTableBridge);
console.log('Service:', !!window.flowiseTableService);
```

### Actions

```javascript
// Forcer restauration
window.flowiseTableBridge.restoreCurrentSession()

// Nettoyer
window.flowiseTableService.performAutomaticCleanup()

// Tout effacer (attention!)
window.flowiseTableService.clearAllTables()
```

---

## 📞 Rapport de Bug

Si le problème persiste, créer un rapport avec:

### 1. Contexte
- Navigateur: [Chrome/Firefox/Edge]
- Version: [numéro]
- OS: [Windows/Mac/Linux]

### 2. Résultats du Diagnostic

Copier la sortie complète de la console après:
```javascript
window.runDiagnostic()
```

### 3. Étapes pour Reproduire

1. Action effectuée
2. Résultat observé
3. Résultat attendu

### 4. Messages d'Erreur

Copier toutes les erreurs de la console (en rouge)

---

## ✅ Validation Finale

**Le système fonctionne si:**

1. ✅ Diagnostic ne montre aucune erreur
2. ✅ Tables sauvegardées (événements dans console)
3. ✅ Tables dans IndexedDB (F12 > Application)
4. ✅ Tables restaurées après F5
5. ✅ Aucune erreur rouge dans la console

**→ Si toutes les cases cochées, le problème est résolu !**

---

*Guide créé le 29 août 2026*
*Pour diagnostiquer: `window.runDiagnostic()` dans la console*
