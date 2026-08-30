# 🧪 TESTS À EFFECTUER - 29 août 2026

## 🎯 Objectif
Valider que les corrections résolvent :
1. ✅ Contamination entre chats (ZÉRO cas accepté)
2. ✅ Persistance Table_conso et Table_Resultat après F5
3. ✅ Notifications et diagnostic UI fonctionnels

---

## ⚡ Lancement

```powershell
cd h:\Claverse_1
npm run dev
```

Attendre message : "Local: http://localhost:5173/"

---

## 📋 TEST 1: Vérification Diagnostic UI (2 min)

### Étape 1.1: Bouton Diagnostic Apparaît
1. Ouvrir http://localhost:5173
2. **Attendre 2-3 secondes** (temps de chargement)
3. Chercher **bouton flottant bas droite** avec "🔍" et "Test"

**✅ Résultat attendu:** Bouton violet visible, survol change couleur  
**❌ Si absent:** Ouvrir console → Chercher erreurs JavaScript

### Étape 1.2: Cliquer Bouton Diagnostic
1. Cliquer sur bouton "🔍 Test"
2. Observer notification **haut droite** (fond vert/bleu/rouge)
3. Lire contenu notification

**✅ Résultat attendu:**
```
🔍 DIAGNOSTIC SYSTÈME

✅ Isolation: ACTIVE
   ID: clara-session-...

✅ conso.js: INTÉGRÉ

✅ Doublons: AUCUN

📊 Total: X tables
📊 Keywords: Y uniques
```

**❌ Si notification affiche erreurs:**
- "Isolation: COMPROMISE" → Problème React data-session-id
- "conso.js: PAS INTÉGRÉ" → Attendre 2s et recliquer
- "Doublons: DÉTECTÉS" → Noter les keywords listés

### Étape 1.3: Console Commandes
Ouvrir console navigateur (F12), exécuter :

```javascript
checkSessionId()
```
**✅ Doit afficher:** ✅ ISOLATION ACTIVE + sessionId

```javascript
checkConsoIntegration()
```
**✅ Doit afficher:** ✅ INTÉGRÉ + methods disponibles

```javascript
runQuickDiagnostic()
```
**✅ Doit afficher:** Notification + logs console détaillés

---

## 📋 TEST 2: Isolation des Chats (10 min)

### Étape 2.1: Créer Premier Chat avec Tables
1. Créer nouveau chat (nom: "TEST_ISOLATION_A")
2. Envoyer prompt qui génère tables, par exemple:
   ```
   Créer une table de test avec 3 colonnes: Nom, Valeur, Statut
   Ajouter 2 lignes de données
   ```
3. **Vérifier table apparaît** (nom keyword: peut être "Table_Test" ou autre)
4. **Modifier une cellule** de la table (double-clic, éditer, valider)
5. Noter le keyword exact de la table (ex: "Table_JK", "Rubrique_II")

**✅ Résultat attendu:** Table visible et modifiable

### Étape 2.2: Actualiser Page (F5)
1. Appuyer **F5** pour recharger page
2. Attendre chargement complet (2-3s)
3. Vérifier table toujours présente avec modifications

**✅ Résultat attendu:** Table restaurée identique (modifications préservées)  
**❌ Si disparue:** Problème persistance → voir Diagnostic Avancé

### Étape 2.3: Créer Deuxième Chat
1. Créer nouveau chat (nom: "TEST_ISOLATION_B")
2. Envoyer prompt différent qui génère autre table:
   ```
   Créer une table de bilan avec colonnes: Actif, Passif, Montant
   Ajouter 3 lignes
   ```
3. **Vérifier nouvelle table apparaît** (différent keyword que Chat A)
4. **IMPORTANT:** Vérifier que table du Chat A **N'APPARAÎT PAS**

**✅ Résultat attendu:** SEULEMENT table Chat B visible  
**❌ Si table Chat A visible:** 🚨 CONTAMINATION DÉTECTÉE

### Étape 2.4: Retour au Premier Chat
1. Cliquer sur "TEST_ISOLATION_A" (retour Chat A)
2. Attendre restauration (1-2s)
3. **Vérifier SEULEMENT table Chat A visible**
4. **Vérifier table Chat B N'APPARAÎT PAS**

**✅ Résultat attendu:** SEULEMENT table Chat A visible  
**❌ Si table Chat B visible:** 🚨 CONTAMINATION DÉTECTÉE

### Étape 2.5: Test Croisé Multiple
1. Créer Chat C avec table différente
2. Aller Chat A → vérifier SEULEMENT table A
3. Aller Chat B → vérifier SEULEMENT table B  
4. Aller Chat C → vérifier SEULEMENT table C
5. F5 sur chaque chat → vérifier isolation maintenue

**✅ Résultat attendu:** ZÉRO contamination, chaque chat isolé  
**❌ Si ANY contamination:** 🚨 ÉCHEC TEST

---

## 📋 TEST 3: Persistance Table_conso & Table_Resultat (15 min)

### Contexte
Ces tables sont générées par prompts spécifiques et modifiées via menus déroulants et inputs. Elles ont causé des problèmes de persistance car gérées par conso.js.

### Étape 3.1: Générer Tests avec Table_Resultat
1. Créer nouveau chat (nom: "TEST_CONSO")
2. Envoyer prompt pour générer tests (exemple):
   ```
   Générer des tests pour une rubrique comptable
   ```
3. Attendre génération des tables de test
4. **Identifier table [Résultat]** ou **[Table_Resultat]**
5. **Modifier colonnes via menus déroulants** (Conclusion, Observations, etc.)

**Tables attendues:**
- Table des tests (lignes de tests)
- Table [Résultat] ou [Table_Resultat] (résumé)
- Possiblement [Table_Consolidation]

### Étape 3.2: Modifier Table Résultat
1. Trouver colonne "Conclusion" dans table Résultat
2. Cliquer menu déroulant → Sélectionner valeur (ex: "Validé" ou "À corriger")
3. **Observer changement visuel** (couleur, texte)
4. Répéter pour plusieurs lignes
5. **Attendre 1 seconde** (sauvegarde automatique)

### Étape 3.3: Vérifier Sauvegarde dans Console
Ouvrir console, chercher ces logs :

```
💾 [INLINE] Interception sauvegarde table
🔑 [INLINE] Keyword: Table_Resultat (ou Consolidation)
📍 [INLINE] SessionId: clara-session-...
✅ [INLINE] Événement émis pour: Table_Resultat
```

**✅ Si présent:** Sauvegarde déclenchée  
**❌ Si absent:** conso.js ne déclenche pas sauvegarde

Puis chercher :
```
💾 [Bridge] Handling save request for: Table_Resultat
```

**✅ Si présent:** flowiseTableBridge reçoit événement  
**❌ Si absent:** Événement pas écouté

### Étape 3.4: Actualiser Page (F5)
1. Appuyer **F5** pour recharger
2. Attendre chargement (2-3s)
3. **Vérifier table [Résultat] toujours présente**
4. **Vérifier modifications conservées** (colonnes Conclusion, etc.)

**✅ Résultat attendu:** Table restaurée avec modifications  
**❌ Si disparue ou réinitialisée:** 🚨 PERSISTANCE ÉCHOUÉE

### Étape 3.5: Test Table_Consolidation
Si table [Table_Consolidation] présente :

1. Modifier cellules (inputs, menus)
2. Attendre 1s
3. F5
4. Vérifier modifications préservées

**✅ Résultat attendu:** Modifications conservées  
**❌ Si perdues:** 🚨 PERSISTANCE ÉCHOUÉE

---

## 📋 TEST 4: Diagnostic Avancé (En cas de problème)

### Test 4.1: Vérifier SessionId Exposé
Console :
```javascript
const elem = document.querySelector('[data-session-id]');
const sessionId = elem?.getAttribute('data-session-id');
console.log("SessionId DOM:", sessionId);
```

**✅ Résultat attendu:** String "clara-session-..." (long ID)  
**❌ Problèmes possibles:**
- `null` : Élément pas trouvé → React ne monte pas
- `"undefined"` : Attribut = "undefined" → stableSessionId pas défini
- `"unknown"` : Fallback activé → problème détection

### Test 4.2: Vérifier conso.js Intégré
Console :
```javascript
console.log("Exists:", !!window.claraverseProcessor);
console.log("Integrated:", window.claraverseProcessor?.__integrated);
console.log("saveTableDataNow:", typeof window.claraverseProcessor?.saveTableDataNow);
```

**✅ Résultat attendu:**
- Exists: true
- Integrated: true  
- saveTableDataNow: "function"

**❌ Si `false` ou `undefined`:**
- Script conso.js pas chargé
- Chargé après inline script index.html
- Erreur bloque intégration

### Test 4.3: Vérifier IndexedDB
1. Ouvrir DevTools (F12)
2. Onglet **Application**
3. Section **IndexedDB** → **ClaraverseDB**
4. Table **generatedTables**
5. Cliquer pour voir données

**✅ Résultat attendu:** Lignes avec colonnes :
- `id` : ID unique table
- `sessionId` : clara-session-...
- `keyword` : Nom table
- `html` : Contenu HTML
- `timestamp` : Date sauvegarde

**Vérifications:**
- Chaque table a **sessionId différent** par chat
- Keywords correspondent aux tables visibles
- Timestamp récent (quelques secondes après modification)

**❌ Si vide ou colonnes manquantes:** IndexedDB pas écrit

### Test 4.4: Vérifier Événements Émis
Console, installer écouteur :

```javascript
document.addEventListener('flowise:table:save:request', (e) => {
  console.log("📡 EVENT REÇU:", e.detail);
  console.log("  - keyword:", e.detail.keyword);
  console.log("  - sessionId:", e.detail.sessionId?.substring(0, 30));
  console.log("  - source:", e.detail.source);
});
```

Puis modifier une table → observer console.

**✅ Résultat attendu:** Log "📡 EVENT REÇU" avec détails  
**❌ Si absent:** Événement pas émis par conso.js

### Test 4.5: Test Doublons
Console :
```javascript
checkTableDuplicates()
```

**✅ Résultat attendu:** "✅ Aucun doublon détecté"  
**❌ Si doublons listés:** 
```javascript
// Exemple output:
❌ DOUBLONS DÉTECTÉS:
  • Table_JK: 2 occurrences
  • Rubrique_II: 3 occurrences
```

→ Problème restauration ou génération multiple

---

## 🚨 Scénarios d'Échec et Solutions

### Échec 1: SessionId Toujours "FAILED"
**Symptôme:** Console affiche "🚨 ERREUR CRITIQUE: SessionId introuvable après 2 secondes"

**Diagnostic:**
```javascript
// Vérifier élément DOM
document.querySelector('[data-session-id]')
// Si null: React ne monte pas ClaraAssistant
// Si existe mais attribut = "undefined": stableSessionId pas initialisé
```

**Solution:**
1. Vérifier `src/components/ClaraAssistant.tsx` ligne 411-425
2. Vérifier `stableSessionId` state existe
3. Vérifier ligne 3743 : `data-session-id={stableSessionId}`
4. Redémarrer dev server : `Ctrl+C` puis `npm run dev`

### Échec 2: conso.js Pas Intégré
**Symptôme:** `window.claraverseProcessor.__integrated` === `false`

**Diagnostic:**
```javascript
// Script chargé?
console.log("Processor:", window.claraverseProcessor);

// Si undefined: script pas chargé du tout
// Si existe mais __integrated false: intégration échouée
```

**Solution:**
1. Vérifier `index.html` ligne ~140 charge `conso.js`
2. Vérifier console pour erreurs JavaScript
3. Attendre 2-3 secondes puis revérifier
4. Si toujours absent: F5 puis revérifier

### Échec 3: Contamination Persiste
**Symptôme:** Tables d'un autre chat apparaissent

**Diagnostic:**
```javascript
// SessionIds différents par chat?
// Chat A:
const sessionA = document.querySelector('[data-session-id]').getAttribute('data-session-id');
console.log("Session A:", sessionA);

// Chat B:
const sessionB = document.querySelector('[data-session-id]').getAttribute('data-session-id');
console.log("Session B:", sessionB);

// SI sessionA === sessionB → PROBLÈME CRITIQUE
```

**Si SessionIds identiques:** Problème React isolation
1. Vérifier `ClaraAssistant.tsx` `useEffect` ligne 416-425
2. Vérifier dépendances : `[currentSession?.id, stableSessionId]`
3. Vérifier `currentSession` change bien entre chats

**Si SessionIds différents mais contamination quand même:**
1. Vérifier IndexedDB : Tables sauvegardées avec quel sessionId?
2. Ouvrir DevTools → Application → IndexedDB → generatedTables
3. Si même sessionId pour toutes tables → sauvegarde utilise mauvais ID

**Solution:**
```javascript
// Test manuel sauvegarde
const table = document.querySelector('table');
const sessionId = document.querySelector('[data-session-id]').getAttribute('data-session-id');
console.log("SessionId actuel:", sessionId);

// Déclencher sauvegarde
window.claraverseProcessor.saveTableDataNow(table);

// Observer logs console:
// Chercher: "📍 [INLINE] SessionId: ..."
// Doit correspondre au sessionId DOM
```

### Échec 4: Tables Pas Persistantes
**Symptôme:** F5 → tables disparaissent

**Diagnostic Étape par Étape:**

**Étape 1: Événement émis?**
```javascript
// Installer écouteur AVANT modification
document.addEventListener('flowise:table:save:request', (e) => {
  console.log("✅ Event émis pour:", e.detail.keyword);
});

// Puis modifier table → observer console
```

**Si pas d'événement:** conso.js ne déclenche pas
- Vérifier `public/conso.js` ligne 1334-1342 appelle `saveTableDataNow`
- Vérifier `index.html` wrappe bien `saveTableDataNow`

**Étape 2: Bridge écoute?**
Console chercher après modification :
```
💾 [Bridge] Handling save request for: [keyword]
```

**Si absent:** flowiseTableBridge ne reçoit pas
- Vérifier `flowiseTableBridge.ts` ligne 584 addEventListener
- Redémarrer dev server

**Étape 3: IndexedDB écrit?**
DevTools → Application → IndexedDB → ClaraverseDB → generatedTables

**Si vide après modification:**
- Erreur dans `flowiseTableService.saveGeneratedTable`
- Voir console pour stack trace
- Vérifier permissions IndexedDB (pas en navigation privée)

---

## ✅ Critères de Succès

### Succès Complet (100%)
- ✅ Bouton diagnostic apparaît et fonctionne
- ✅ Console commandes disponibles et fonctionnelles
- ✅ **ZÉRO cas de contamination** entre 3+ chats testés
- ✅ Tables persistantes après F5 (modifications conservées)
- ✅ Table_conso et Table_Resultat persistantes
- ✅ Isolation maintenue après F5 sur chaque chat

### Succès Partiel (80%)
- ✅ Bouton diagnostic fonctionne
- ✅ Isolation fonctionne pour nouveaux chats
- ⚠️ 1 cas de contamination sporadique (< 10% des tests)
- ✅ Tables classiques persistantes
- ⚠️ Table_conso/Resultat parfois perdues

→ Nécessite investigation logs + tests additionnels

### Échec (< 80%)
- ❌ Contamination systématique (> 10% cas)
- ❌ Tables jamais persistantes
- ❌ SessionId toujours FAILED
- ❌ conso.js jamais intégré

→ Nécessite corrections architecture

---

## 📊 Rapport de Test (Template)

```markdown
# Rapport Test - [Date]

## Environnement
- Navigateur: [Chrome/Firefox/Edge] [version]
- OS: Windows
- Build: npm run dev

## TEST 1: Diagnostic UI
- Bouton apparaît: ✅ / ❌
- Notification affichée: ✅ / ❌
- Console commandes: ✅ / ❌

## TEST 2: Isolation Chats
- Chat A isolé: ✅ / ❌
- Chat B isolé: ✅ / ❌
- Chat C isolé: ✅ / ❌
- F5 maintient isolation: ✅ / ❌
- Cas contamination détectés: [nombre]

## TEST 3: Persistance Table_conso/Resultat
- Table_Resultat générée: ✅ / ❌
- Modifications enregistrées: ✅ / ❌
- F5 conserve modifications: ✅ / ❌
- Table_Consolidation testée: ✅ / ❌ / N/A

## TEST 4: Diagnostic Avancé
- SessionId DOM: [value ou erreur]
- conso.js intégré: ✅ / ❌
- IndexedDB accessible: ✅ / ❌
- Événements émis: ✅ / ❌

## Problèmes Rencontrés
[Décrire tout problème]

## Conclusion
✅ SUCCÈS COMPLET / ⚠️ SUCCÈS PARTIEL / ❌ ÉCHEC
```

---

## 📞 Support

Si tests échouent, collecter :
1. **Screenshots** problème
2. **Logs console** complets (F12 → Console → clic droit → Save as...)
3. **Rapport test** rempli
4. **IndexedDB export** (DevTools → Application → IndexedDB → Right-click → Export)

Puis consulter `00_CORRECTIONS_FINALES_CONTAMINATION_29_AOUT_2026.md` section "Points Critiques à Surveiller".
