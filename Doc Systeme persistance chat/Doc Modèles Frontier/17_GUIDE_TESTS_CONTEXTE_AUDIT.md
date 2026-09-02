# 🧪 GUIDE TESTS - Contexte Audit & Révision des Comptes

**Date:** 29 Août 2026  
**Contexte Métier:** Application audit et révision comptable

---

## 📋 CONTEXTE MÉTIER - CLARIFICATION

### **2 Catégories de Données Générées**

#### **1. Étapes Mission Normales (Tables Autorisées ✅)**
- Cartographie des risques
- Analyses diverses
- Rapports standards
- **→ DOIVENT être sauvées et restaurées**

#### **2. Feuilles de Test (11 Tables dont 3 Exclues ⚠️)**

**Structure Feuille de Test (11 tables) :**

| # | Table | Type | Sauvegarde | Restauration |
|---|-------|------|------------|--------------|
| 1 | Signature | Normale | ✅ Oui | ✅ Oui |
| 2 | En-tête | Normale | ✅ Oui | ✅ Oui |
| 3 | Objectifs | Normale | ✅ Oui | ✅ Oui |
| 4 | Travaux | Normale | ✅ Oui | ✅ Oui |
| 5 | **Table_Conso** | **Exclue** | ❌ **Non** | ❌ **Non** |
| 6 | **Table_Resultat** | **Exclue** | ❌ **Non** | ❌ **Non** |
| 7 | **Modelized Table** | **Exclue?** | ⚠️ **À vérifier** | ⚠️ **À vérifier** |
| 8 | Cross Reference | Normale | ✅ Oui | ✅ Oui |
| 9 | Cross Ref Documentaire | Normale | ✅ Oui | ✅ Oui |
| 10 | Légende | Normale | ✅ Oui | ✅ Oui |
| 11 | Revue Manager | Normale | ✅ Oui | ✅ Oui |

### **⚠️ QUESTION CRITIQUE À CLARIFIER**

**"Modelized Table" est-elle exclue ?**

**Actuellement dans le code :**
```typescript
EXCLUDED_TABLE_KEYWORDS = ['table_consolidation', 'resultat', 'table_conso']
```

**Vérification nécessaire :**
- Quel est le `keyword` exact de "Modelized Table" ?
- Contient-il "consolidation", "resultat" ou "conso" ?
- Si oui → Déjà exclue ✅
- Si non → **À AJOUTER** à la liste ⚠️

---

## 🎯 COMPRENDRE LE PROBLÈME ORIGINAL

### **Pourquoi Exclure Ces Tables ?**

**Hypothèse Initiale (À Confirmer) :**

1. **Table_Conso** = Table de consolidation dynamique
   - Calculée à partir d'autres données
   - Recalculable à la demande
   - **Problème si sauvée** : Contamination inter-sessions

2. **Table_Resultat** = Table de résultats dynamiques
   - Résultats de tests/calculs
   - Dépend du contexte mission
   - **Problème si sauvée** : Contamination inter-sessions

3. **Modelized Table** = Table de test modélisée ?
   - **À clarifier** : Nature exacte ?
   - **Problème potentiel** : Contamination ?

### **Comportement Attendu**

**Scénario Normal :**
```
1. User génère Feuille de Test → 11 tables apparaissent
2. Tables 1-4, 8-11 → Sauvées en DB ✅
3. Tables 5-6 (+ 7?) → PAS sauvées, visibles temporairement ⚠️
4. User actualise (F5)
5. Tables 1-4, 8-11 → Restaurées ✅
6. Tables 5-6 (+ 7?) → Disparues (doivent être régénérées) ❌
```

**Question :** Est-ce le comportement souhaité ? ✅ / ❌

---

## 🧪 PLAN DE TESTS ADAPTÉ AU CONTEXTE AUDIT

### **TEST 1 : Vérification Système (30 secondes)**

**Objectif :** Confirmer que les protections sont actives

**Étapes :**
1. Ouvrir http://localhost:5173/
2. Ouvrir Console (F12)
3. Observer logs au chargement

**Logs attendus :**
```
✅ [INDEX.HTML] Bouclier anti-contamination installé (Capture Phase)
✅ [INDEX.HTML] Événements bloqués: flowise:table:integrated, flowise:table:save:request
🚫 [GLOBAL FLAG] DISABLE_TABLE_RESTORATION = true
```

**Résultat :** ✅ Système actif / ❌ Logs manquants

---

### **TEST 2 : Étape Mission Normale (3 min)**

**Objectif :** Vérifier que tables normales fonctionnent correctement

**Contexte :** Chat 1 - Mission Audit Entreprise ABC

**Étapes :**
1. Nettoyer storage : Bouton 🧹 **Storage**
2. Générer étape normale : "Cartographie des risques"
3. Observer console - **Aucun log blocage**
4. Actualiser (F5)
5. Observer : Table restaurée ✅

**Résultat Attendu :**
- Table visible avant F5 ✅
- Table visible après F5 ✅
- Aucun log `🚫` dans console ✅

**Si échec :**
- Screenshot console
- Quel keyword exact de la table ?

---

### **TEST 3 : Feuille de Test Complète (10 min) - CRITIQUE**

**Objectif :** Vérifier comportement 11 tables dont 3 exclues

**Contexte :** Chat 1 (continuer ou nouveau) - Mission Audit

**Étapes :**

#### **3.1 Génération Feuille de Test**
```
Demander : "Génère une feuille de test complète pour la rubrique [NOM_RUBRIQUE]"
```

**Observer Console pendant génération :**
```
Rechercher logs de type :
🚫 [INDEX.HTML] Événement bloqué pour table exclue: "..."
🚫 [INDEX.HTML] Événement bloqué pour table exclue: "..."
🚫 [INDEX.HTML] Événement bloqué pour table exclue: "..."
```

**Questions à noter :**
1. Combien de logs `🚫 [INDEX.HTML]` ? (Attendu: 2 ou 3)
2. Quels keywords exacts bloqués ?
   - `table_conso` ? ✅ / ❌
   - `resultat` ? ✅ / ❌
   - `modelized` ou autre ? ✅ / ❌

#### **3.2 Comptage Tables Visibles**

**Dans le DOM (visuel page) :**
- Compter tables visibles : ___ / 11
- Toutes les 11 doivent être visibles initialement ✅

**Dans la Console :**
```javascript
// Copier-coller dans console
document.querySelectorAll('table').length
// Résultat attendu: 11 tables
```

#### **3.3 Vérification IndexedDB (Avant F5)**

**Console DevTools → Application → IndexedDB → clara_db → clara_generated_tables**

**Compter entrées :**
- Tables sauvées en DB : ___ tables
- Attendu : 8 ou 9 tables (11 - 2 ou 3 exclues)

**Vérifier absences :**
- Rechercher "conso" → 0 résultats ✅
- Rechercher "resultat" → 0 résultats ✅
- Rechercher "consolidation" → 0 résultats ✅

#### **3.4 Test Actualisation (F5)**

1. **Actualiser page** : F5
2. **Attendre chargement complet**
3. **Compter tables visibles** : ___ tables
4. **Attendu** : 8 ou 9 tables (pas 11)

**Observer Console après F5 :**
```
Rechercher logs :
🚫 [CHRONO] Table exclue filtrée: "..."
🚫 [RESTORE] Table exclue filtrée: "..."
```

#### **3.5 Régénération Tables Manquantes**

**Si Tables Conso/Resultat nécessaires pour workflow :**
1. Demander régénération : "Recalcule Table_Conso et Resultat"
2. Tables réapparaissent temporairement ✅
3. Pas sauvées en DB ✅

---

### **TEST 4 : Isolation Sessions (15 min) - TEST CRITIQUE**

**Objectif :** Vérifier qu'aucune contamination inter-sessions

**Contexte :** 2 Chats différents

#### **4.1 Chat 1 - Mission Entreprise ABC**
1. Nettoyer : 🧹 **Storage**
2. Générer feuille test : "Feuille test Rubrique Clients ABC"
3. Observer tables générées : ___ tables
4. Actualiser (F5)
5. **Laisser Chat 1 ouvert dans onglet 1**

#### **4.2 Chat 2 - Mission Entreprise XYZ**
1. Ouvrir nouvel onglet : http://localhost:5173/
2. Créer nouveau chat (session différente)
3. Générer feuille test : "Feuille test Rubrique Fournisseurs XYZ"
4. Observer tables générées : ___ tables
5. Actualiser (F5)

#### **4.3 Vérification Contamination**

**Dans Chat 2, cliquer : 🧪 Test Auto**

**Résultat attendu :**
```
TEST 3: Contamination
📊 DB: X tables totales
📊 Session: Y tables (Chat 2 seulement)
📊 Autres: 0 tables ← CRITIQUE
📺 Visibles: Y tables

✅ Aucune contamination
```

**Si contamination > 0 :**
- Noter nombre tables contaminées : ___
- Quels keywords des tables contaminées ?
- Screenshots Test Auto

#### **4.4 Vérification Croisée Chat 1**

**Retourner Chat 1 (onglet 1)**
1. Actualiser (F5)
2. Vérifier : Tables ABC toujours présentes ✅
3. Vérifier : Aucune table XYZ visible ✅
4. Test Auto : Contamination = 0 ✅

---

### **TEST 5 : Doublons (5 min)**

**Objectif :** Vérifier absence doublons après multiples générations

**Contexte :** Chat 1 (continuer)

**Étapes :**
1. Générer 1ère fois : "Feuille test Immobilisations"
2. Actualiser (F5)
3. Générer 2ème fois : "Feuille test Immobilisations" (même rubrique)
4. Actualiser (F5)
5. **Test Auto** : 🧪

**Résultat attendu :**
```
TEST 4: Doublons
✅ Aucun doublon (X uniques)
```

**Si doublons :**
- Quels keywords dupliqués ?
- Combien de fois dupliqués ?

---

### **TEST 6 : Vérification Keywords Exacts (DIAGNOSTIC)**

**Objectif :** Identifier keywords exacts de chaque table feuille test

**Contexte :** Chat de test

**Étapes :**

1. **Générer feuille test complète**
2. **Console JavaScript - Copier-coller :**

```javascript
// Extraire tous les keywords de tables
const tables = Array.from(document.querySelectorAll('table'));
const keywords = tables.map((t, i) => ({
  index: i + 1,
  keyword: t.getAttribute('data-keyword') || t.closest('[data-keyword]')?.getAttribute('data-keyword') || 'UNKNOWN',
  rows: t.rows.length,
  cols: t.rows[0]?.cells.length || 0
}));

console.table(keywords);
console.log('=== KEYWORDS BRUTS ===');
keywords.forEach(k => console.log(`${k.index}. "${k.keyword}"`));
```

3. **Copier résultat console et m'envoyer**

**Analyse :**
- Identifier keywords exacts des 11 tables
- Vérifier correspondance avec `EXCLUDED_TABLE_KEYWORDS`
- Ajuster liste si nécessaire

---

## 📊 TABLEAU RÉCAPITULATIF RÉSULTATS À REMPLIR

| Test | Objectif | Résultat | Observations |
|------|----------|----------|--------------|
| **1. Système** | Logs protection actifs | ✅ / ❌ | |
| **2. Mission Normale** | Tables normales OK | ✅ / ❌ | |
| **3. Feuille Test** | 11 tables → 8-9 sauvées | ✅ / ❌ | Keywords bloqués: |
| **4. Isolation** | Contamination = 0 | ✅ / ❌ | Nombre contaminées: |
| **5. Doublons** | Aucun doublon | ✅ / ❌ | Keywords dupliqués: |
| **6. Keywords** | Liste exacte extraite | ✅ / ❌ | Voir console output |

---

## ⚠️ POINTS CRITIQUES À CLARIFIER

### **1. Modelized Table**

**Question :** "Modelized Table" doit-elle être exclue ?

**Si OUI :**
```typescript
// Ajouter dans flowiseTableService.ts
export const EXCLUDED_TABLE_KEYWORDS = [
  'table_consolidation', 
  'resultat', 
  'table_conso',
  'modelized_table' // ← AJOUTER
];
```

**Critère décision :**
- Table recalculable dynamiquement ? → Exclure ✅
- Table unique par mission/contexte ? → Sauver ✅

### **2. Comportement Souhaité Post-F5**

**Option A (Actuel) :**
- Feuille test générée → 11 tables visibles
- F5 → 8-9 tables restaurées (exclues disparues)
- User doit régénérer feuille complète pour travail

**Option B (Alternative) :**
- Toutes tables sauvées et restaurées
- Différenciation par sessionId strict
- Pas de contamination mais tables exclues présentes

**Question :** Option A ou B préférée ?

### **3. Workflow Métier**

**Scénario Typique :**
```
1. Auditeur ouvre mission Client ABC
2. Génère feuille test Rubrique Clients
3. Travaille sur 11 tables (saisie données)
4. Pause déjeuner → Ferme onglet
5. Reprend après-midi → Actualise
```

**Comportement attendu après actualisation :**
- Tables normales (8-9) → Restaurées avec données saisies ✅
- Tables exclues (2-3) → Régénérées vides ou disparues ?

**Préciser workflow souhaité :** ___________

---

## 🚨 CAS D'USAGE RÉELS À TESTER

### **Cas 1 : Mission Longue Durée**

**Contexte :** Mission audit 3 semaines

**Timeline :**
- Jour 1 : Génère 5 feuilles test (5 rubriques)
- Jour 2-7 : Travail progressif, multiples F5
- Jour 8 : Génère 3 nouvelles feuilles
- Jour 15 : Revue manager, accès toutes feuilles
- Jour 20 : Finalisation

**Test :**
- Toutes tables normales persistent ? ✅ / ❌
- Aucune contamination entre feuilles ? ✅ / ❌
- Doublons après multiples générations ? ✅ / ❌

### **Cas 2 : Missions Parallèles**

**Contexte :** 2 auditeurs, 2 missions simultanées

**Auditeur 1 :**
- Chat 1 : Mission Client A
- Génère feuilles test A

**Auditeur 2 :**
- Chat 2 : Mission Client B  
- Génère feuilles test B

**Test :**
- Isolation totale entre chats ? ✅ / ❌
- Aucune fuite de données A → B ? ✅ / ❌

### **Cas 3 : Revue Manager**

**Contexte :** Manager revoit travaux équipe

**Workflow :**
- Ouvre chat existant avec historique
- Actualise page (F5)
- Doit voir : Toutes tables normales précédentes ✅
- Ne doit pas voir : Tables exclues anciennes ❌

**Test :**
- Tables normales restaurées ? ✅ / ❌
- Contexte mission préservé ? ✅ / ❌

---

## 📋 MODE OPÉRATOIRE RECOMMANDÉ

### **Ordre de Tests :**

1. ✅ **Test 1** (30s) → Vérif système
2. ✅ **Test 6** (5 min) → Identifier keywords AVANT autres tests
3. ✅ **Test 2** (3 min) → Valider tables normales
4. ✅ **Test 3** (10 min) → Feuille test complète (CRITIQUE)
5. ✅ **Test 4** (15 min) → Isolation sessions (CRITIQUE)
6. ✅ **Test 5** (5 min) → Doublons

**Total estimé : 40 minutes**

### **Chat à Utiliser :**

**Recommandation :**
- **Tests 1-3** : Même chat (workflow réaliste)
- **Test 4** : 2 chats différents (isolation)
- **Test 5** : Chat de Test 3 (continuité)
- **Test 6** : N'importe quel chat

---

## 📤 INFORMATIONS À ME RENVOYER

### **1. Résultats Tests (Tableau ci-dessus rempli)**

### **2. Keywords Exacts (Test 6)**
```
Copier-coller output console du script keywords
```

### **3. Logs Console Critiques**
```
Tous logs contenant:
- 🚫 [INDEX.HTML]
- 🚫 [CHRONO]
- 🚫 [RESTORE]
- 🚫 [SERVICE]
- 🚫 [BATCH]
```

### **4. Test Auto Complet**
```
Résultat complet Test Auto après chaque test majeur
```

### **5. Clarifications Métier**
- Modelized Table exclue ? Oui / Non
- Comportement souhaité post-F5 ? Option A / B
- Workflow typique mission ? (Description)

---

## 🎯 DÉCISION FINALE ATTENDUE

**Après tests, vous devrez confirmer :**

✅ **Solution fonctionne - Contamination résolue**  
→ Nettoyer DB production + Documenter

❌ **Ajustements nécessaires**  
→ M'envoyer résultats détaillés + je corrige

⚠️ **Comportement inattendu**  
→ M'envoyer logs + clarifier workflow souhaité

---

**Prêt à commencer les tests ? 🚀**

**Commencez par Test 6 (keywords) pour confirmer la liste d'exclusion avant tout !**
