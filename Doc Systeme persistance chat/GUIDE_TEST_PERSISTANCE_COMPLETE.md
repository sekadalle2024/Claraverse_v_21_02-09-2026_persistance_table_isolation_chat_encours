# 🧪 Guide de Test - Persistance Complète des Tables

## 📋 Objectif

Valider que **TOUTES** les tables (Modelised_table, Table_conso, Table_Resultat) sont maintenant **persistantes** après:
- ✅ Actualisation de la page (F5)
- ✅ Redémarrage du serveur
- ✅ Changement de chat

---

## 🚀 Pré-requis

### 1. Vérifier que tous les fichiers sont en place

```bash
# Dans le dossier public/
ls public/conso-indexeddb-integration.js
ls public/test-conso-indexeddb.js

# Vérifier index.html
grep "conso-indexeddb-integration.js" index.html
```

**Résultat attendu:**
```
✅ conso-indexeddb-integration.js existe
✅ test-conso-indexeddb.js existe
✅ Script chargé dans index.html après conso.js
```

### 2. Démarrer l'application

```bash
# Terminal 1: Backend Python
cd packages/server
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py

# Terminal 2: Frontend React
npm run dev
```

### 3. Ouvrir l'application

```
http://localhost:3000
```

Ouvrir les **Outils de développement** (F12):
- Onglet **Console** pour les logs
- Onglet **Application** > **IndexedDB** pour vérifier les données

---

## 🧪 Tests de Validation

### Test 1: Vérification de l'Intégration

**Objectif:** S'assurer que le script d'intégration est chargé correctement

**Étapes:**
1. Ouvrir la console (F12)
2. Taper:
```javascript
consoIndexedDBIntegration.quickTest()
```

**Résultat attendu:**
```
🚀 Test rapide de l'intégration...

✅ Intégration chargée
✅ SessionId: stable_session_1234567890_abc123
✅ 3 table(s) détectée(s)
✅ Keyword: Table_Consolidation

✅ Test rapide terminé
```

**✅ PASS** si tous les messages sont verts
**❌ FAIL** si des erreurs apparaissent → Vérifier que le script est chargé dans index.html

---

### Test 2: Test Complet de l'Intégration

**Objectif:** Exécuter tous les tests automatisés

**Étapes:**
1. Dans la console:
```javascript
testConsoIndexedDB.runAllTests()
```

**Résultat attendu:**
```
╔════════════════════════════════════════════════════════╗
║   TEST INTÉGRATION CONSO.JS → INDEXEDDB                ║
╚════════════════════════════════════════════════════════╝

📋 Test 1: Vérification du chargement de l'intégration
  ✅ PASS: consoIndexedDBIntegration est disponible

📋 Test 2: Vérification du chargement de conso.js
  ✅ PASS: claraverseTableProcessor est disponible

📋 Test 3: Vérification des services backend
  ✅ PASS: Services backend disponibles

📋 Test 4: Obtention du sessionId
  ✅ PASS: SessionId obtenu: stable_session_...

📋 Test 5: Détection des tables
  ✅ PASS: 3 table(s) détectée(s)

📋 Test 5b: Extraction des keywords
    Table 1: "Table_Consolidation"
    Table 2: "Table_Resultat"
    Table 3: "Rubrique"
  ✅ PASS: Keywords extraits avec succès

📋 Test 6: Test de sauvegarde
  📝 Tentative de sauvegarde de la table: "Table_Consolidation"
  ✅ PASS: Sauvegarde effectuée sans erreur

📋 Test 7: Vérification IndexedDB
  ✅ PASS: Base de données clara_db accessible

📋 Test 8: Vérification des données sauvegardées
  ✅ PASS: 3 table(s) trouvée(s) dans IndexedDB
    1. Keyword: "Table_Consolidation", Session: stable_session_17384...
    2. Keyword: "Table_Resultat", Session: stable_session_17384...
    3. Keyword: "Rubrique", Session: stable_session_17384...

📋 Test 9: Vérification de la migration localStorage
  ✅ PASS: Migration déjà effectuée

╔════════════════════════════════════════════════════════╗
║   RÉSUMÉ DES TESTS                                     ║
╚════════════════════════════════════════════════════════╝

  ✅ Tests réussis:  9
  ❌ Tests échoués:  0
  📊 Total:          9

🎉 SUCCÈS: Tous les tests sont passés!
✅ L'intégration conso.js → IndexedDB fonctionne correctement
```

**✅ PASS** si tous les tests sont réussis (9/9)
**❌ FAIL** si des tests échouent → Consulter les erreurs et SOLUTION_CONSO_INDEXEDDB.md

---

### Test 3: Persistance après Actualisation (F5)

**Objectif:** Vérifier que les données survivent à un rechargement de page

**Scénario A: Modification de Modelised_table**

1. **Créer/Trouver une table modelisée** avec colonnes Conclusion, Assertion, ou CTR
2. **Modifier une cellule:**
   - Cliquer sur une cellule "Assertion"
   - Sélectionner "Validité"
   - La cellule doit afficher "Validité" avec fond vert
3. **Vérifier la sauvegarde dans la console:**
   ```
   💾 [IndexedDB] Début de sauvegarde immédiate
   🔑 Keyword extrait: Rubrique
   ✅ [IndexedDB] Événement de sauvegarde émis pour: Rubrique
   ✅ [IndexedDB] Sauvegarde confirmée pour: Rubrique
   ```
4. **Actualiser la page (F5)**
5. **Vérifier:** La cellule contient toujours "Validité" ✅

**Scénario B: Table de Consolidation**

1. **Modifier une table modelisée** (scénario A)
2. **Attendre la génération de Table_conso** (affichée sous la table source)
3. **Vérifier la console:**
   ```
   💾 [Auto] Sauvegarde table consolidation après mise à jour
   💾 [IndexedDB] Début de sauvegarde immédiate
   ✅ [IndexedDB] Sauvegarde confirmée pour: Table_Consolidation
   ```
4. **Actualiser la page (F5)**
5. **Vérifier:** Table_conso est restaurée avec les mêmes données ✅

**Scénario C: Table Résultat**

1. **Modifier une table modelisée** avec plusieurs lignes
2. **Attendre la génération de Table Résultat** (résumé des conclusions)
3. **Vérifier la console:**
   ```
   💾 [Auto] Sauvegarde table résultat après mise à jour
   ✅ [IndexedDB] Sauvegarde confirmée pour: Table_Resultat
   ```
4. **Actualiser la page (F5)**
5. **Vérifier:** Table Résultat est restaurée ✅

**✅ PASS** si toutes les tables sont restaurées correctement
**❌ FAIL** si des données sont perdues → Vérifier IndexedDB dans les outils de développement

---

### Test 4: Persistance après Redémarrage du Serveur

**Objectif:** Vérifier que les données survivent même après un redémarrage complet

**Étapes:**

1. **Effectuer des modifications** (comme dans Test 3)
2. **Vérifier que les données sont sauvegardées** (console + IndexedDB)
3. **Arrêter le serveur backend:**
   ```bash
   # Dans le terminal backend: Ctrl+C
   ```
4. **Arrêter le serveur frontend:**
   ```bash
   # Dans le terminal frontend: Ctrl+C
   ```
5. **Redémarrer les deux serveurs:**
   ```bash
   # Backend
   python app.py
   
   # Frontend
   npm run dev
   ```
6. **Ouvrir l'application** dans le navigateur
7. **Vérifier:** Toutes les tables sont restaurées automatiquement ✅

**Résultat attendu dans la console:**
```
🔄 Restoring tables for session: stable_session_...
📋 Found 3 table(s) to restore
✅ Restored table "Table_Consolidation"
✅ Restored table "Table_Resultat"
✅ Restored table "Rubrique"
✅ Restored 3 table(s) for session stable_session_...
```

**✅ PASS** si toutes les données sont restaurées
**❌ FAIL** si des données sont perdues → Les données sont stockées dans IndexedDB qui est **indépendant** du serveur

---

### Test 5: Persistance lors du Changement de Chat

**Objectif:** Vérifier que chaque chat conserve ses propres données

**Étapes:**

1. **Chat A:**
   - Modifier une table modelisée
   - Noter les valeurs modifiées
   - Vérifier la sauvegarde (console)

2. **Changer de chat** (créer un nouveau chat ou en ouvrir un existant)

3. **Chat B:**
   - Modifier une autre table
   - Noter les valeurs
   - Vérifier la sauvegarde

4. **Retourner au Chat A:**
   - Vérifier que les données du Chat A sont toujours là ✅
   - Les données du Chat B ne doivent PAS apparaître ✅

5. **Retourner au Chat B:**
   - Vérifier que les données du Chat B sont là ✅
   - Les données du Chat A ne doivent PAS apparaître ✅

**Résultat attendu:**
- Chaque chat a un `sessionId` unique
- Les tables sont restaurées selon le `sessionId` actif
- Pas de mélange de données entre chats ✅

**✅ PASS** si les données sont isolées par chat
**❌ FAIL** si les données se mélangent → Problème de sessionId

---

### Test 6: Conflit Manuel vs Automatique

**Objectif:** Vérifier que la dernière modification (manuelle ou automatique) est toujours sauvegardée

**Scénario A: Auto → Manuel**

1. **Modifier une table modelisée** → Table_conso générée automatiquement
2. **Activer l'édition des cellules** (menu contextuel)
3. **Modifier manuellement Table_conso**
4. **Actualiser (F5)**
5. **Vérifier:** Les modifications manuelles sont conservées ✅

**Scénario B: Manuel → Auto**

1. **Modifier manuellement Table_conso** (édition activée)
2. **Modifier la table modelisée source** → Table_conso régénérée automatiquement
3. **Actualiser (F5)**
4. **Vérifier:** Les données automatiques (les plus récentes) sont conservées ✅

**✅ PASS** si la dernière modification est toujours sauvegardée
**❌ FAIL** si les anciennes données écrasent les nouvelles → Problème de `forceUpdate`

---

### Test 7: Vérification IndexedDB Manuelle

**Objectif:** Inspecter directement les données dans IndexedDB

**Étapes:**

1. **Ouvrir les outils de développement (F12)**
2. **Aller dans:** Application > Storage > IndexedDB > clara_db > clara_generated_tables
3. **Vérifier les champs:**
   - `id`: UUID unique
   - `sessionId`: stable_session_...
   - `keyword`: Table_Consolidation, Table_Resultat, etc.
   - `html`: `<table>...</table>` (HTML de la table)
   - `timestamp`: Date de sauvegarde
   - `source`: "conso" pour les tables de conso.js
   - `fingerprint`: Hash du contenu

4. **Cliquer sur une entrée** pour voir le détail
5. **Vérifier le HTML:** Doit contenir les données modifiées

**✅ PASS** si toutes les tables sont présentes avec les bonnes données
**❌ FAIL** si des tables manquent ou ont du contenu vide → Problème de sauvegarde

---

### Test 8: Migration localStorage

**Objectif:** Vérifier que les anciennes données localStorage sont migrées vers IndexedDB

**Étapes:**

1. **Si vous aviez des données dans localStorage avant:**
   - Vérifier: `localStorage.getItem('claraverse_tables_data')`
   - Si des données existent, noter le nombre de tables

2. **Après le premier chargement avec le nouveau système:**
   - Vérifier la console:
   ```
   🔄 Vérification migration localStorage → IndexedDB
   🔄 Migration de X table(s) depuis localStorage vers IndexedDB...
   ✅ Table [ID] migrée
   ✅ Migration terminée: X/X table(s) migrée(s)
   ✅ Migration marquée comme effectuée
   ```

3. **Vérifier IndexedDB:**
   - Les anciennes tables doivent être présentes ✅

4. **Vérifier le flag de migration:**
   ```javascript
   localStorage.getItem('claraverse_migration_done')
   // → "true"
   ```

**✅ PASS** si toutes les anciennes données sont migrées
**❌ FAIL** si des données sont perdues → Forcer la migration: `consoIndexedDBIntegration.migrate()`

---

## 🐛 Dépannage

### Problème: Les tables ne sont pas sauvegardées

**Diagnostic:**
```javascript
// 1. Vérifier l'intégration
console.log(window.consoIndexedDBIntegration);

// 2. Vérifier les services
console.log(window.flowiseTableBridge);
console.log(window.flowiseTableService);

// 3. Vérifier le sessionId
consoIndexedDBIntegration.getCurrentSession().then(console.log);

// 4. Écouter les événements
document.addEventListener('flowise:table:save:request', (e) => {
  console.log("📤 Sauvegarde demandée:", e.detail);
});

document.addEventListener('flowise:table:save:success', (e) => {
  console.log("✅ Sauvegarde réussie:", e.detail);
});

document.addEventListener('flowise:table:save:error', (e) => {
  console.error("❌ Erreur sauvegarde:", e.detail);
});
```

**Solutions:**
- Si l'intégration est undefined → Le script n'est pas chargé dans index.html
- Si les services sont undefined → menuIntegration.ts n'est pas initialisé
- Si sessionId est null → Problème de détection de session
- Si aucun événement n'est émis → conso.js n'appelle pas saveTableDataNow

---

### Problème: Les tables ne sont pas restaurées

**Diagnostic:**
```javascript
// 1. Vérifier les tables dans IndexedDB
testConsoIndexedDB.getTablesFromIndexedDB().then(tables => {
  console.log(`${tables.length} table(s) dans IndexedDB`);
  tables.forEach(t => console.log(`- ${t.keyword} (${t.sessionId})`));
});

// 2. Vérifier le sessionId actuel
consoIndexedDBIntegration.getCurrentSession().then(sid => {
  console.log("SessionId actuel:", sid);
});

// 3. Forcer la restauration
window.flowiseTableBridge.restoreCurrentSession();
```

**Solutions:**
- Si IndexedDB est vide → Les tables n'ont pas été sauvegardées
- Si le sessionId ne correspond pas → Problème de session stable
- Si la restauration manuelle fonctionne → Problème d'auto-restauration

---

### Problème: Erreur "QuotaExceededError"

**Diagnostic:**
```javascript
// Vérifier l'espace de stockage
navigator.storage.estimate().then(estimate => {
  const used = (estimate.usage / 1024 / 1024).toFixed(2);
  const total = (estimate.quota / 1024 / 1024).toFixed(2);
  const percent = ((estimate.usage / estimate.quota) * 100).toFixed(1);
  console.log(`Stockage: ${used} MB / ${total} MB (${percent}%)`);
});
```

**Solutions:**
- Si > 80% → Nettoyer les anciennes données
- Exécuter: `window.flowiseTableService.performAutomaticCleanup()`
- Supprimer les anciennes sessions: `window.flowiseTableService.cleanupOrphanedTables()`

---

## ✅ Checklist Finale

Cocher ✅ après chaque test réussi:

- [ ] Test 1: Intégration chargée correctement
- [ ] Test 2: Tous les tests automatisés passent (9/9)
- [ ] Test 3A: Modelised_table persistante après F5
- [ ] Test 3B: Table_conso persistante après F5
- [ ] Test 3C: Table_Resultat persistante après F5
- [ ] Test 4: Toutes les tables persistantes après redémarrage serveur
- [ ] Test 5: Données isolées par chat (pas de mélange)
- [ ] Test 6A: Conflit Auto → Manuel résolu
- [ ] Test 6B: Conflit Manuel → Auto résolu
- [ ] Test 7: Données correctes dans IndexedDB
- [ ] Test 8: Migration localStorage effectuée

**Si tous les tests sont ✅ → La persistance complète est validée ! 🎉**

---

## 📊 Rapport de Test

### Environnement
- **Date:** _______________
- **Navigateur:** _______________ (Chrome/Firefox/Edge/Safari)
- **Version:** _______________
- **OS:** _______________ (Windows/Mac/Linux)

### Résultats

| Test | Statut | Notes |
|------|--------|-------|
| Test 1: Intégration | ⬜ PASS / ⬜ FAIL | |
| Test 2: Tests auto | ⬜ PASS / ⬜ FAIL | __/9 réussis |
| Test 3: Actualisation | ⬜ PASS / ⬜ FAIL | |
| Test 4: Redémarrage | ⬜ PASS / ⬜ FAIL | |
| Test 5: Changement chat | ⬜ PASS / ⬜ FAIL | |
| Test 6: Conflits | ⬜ PASS / ⬜ FAIL | |
| Test 7: IndexedDB | ⬜ PASS / ⬜ FAIL | |
| Test 8: Migration | ⬜ PASS / ⬜ FAIL | |

**Verdict Final:** ⬜ SUCCÈS / ⬜ ÉCHEC

**Problèmes rencontrés:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Actions correctives:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

*Guide créé le 29 août 2026*
*Version: 1.0.0*
