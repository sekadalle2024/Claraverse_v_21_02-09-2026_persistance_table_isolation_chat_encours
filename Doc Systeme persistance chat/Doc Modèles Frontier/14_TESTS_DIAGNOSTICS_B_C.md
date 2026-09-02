# 🧪 TESTS DIAGNOSTICS B + C - Instructions Détaillées

**Date:** 29 Août 2026  
**Objectif:** Confirmer hypothèses avant implémentation complète

---

## ⚙️ PRÉPARATION

### ✅ Modification Effectuée

**Fichier:** `src/services/flowiseTableBridge.ts`  
**Ligne:** ~606 (méthode `handleTableSaveRequest`)  
**Ajout:**
```typescript
// 🚨 LOG DIAGNOSTIC: Confirmer bypass via conso.js (Hypothèse Gemini)
console.log(`🚨 [DIAGNOSTIC] Événement save:request reçu via conso.js pour: "${detail.keyword}"`);
```

### 🚀 État Actuel

- ✅ Code diagnostic ajouté
- ✅ Dev server démarré
- ⏳ Attente chargement complet (port 5174)

---

## 📋 TEST B : Diagnostic Bypass (5 minutes)

### **Objectif:**
Confirmer si tables Table_Consolidation passent par événement `flowise:table:save:request` (bypass via conso.js)

### **Étapes:**

#### 1️⃣ **Ouvrir l'application**
```
URL: http://localhost:5174
```

#### 2️⃣ **Ouvrir Console DevTools**
```
Appuyer: F12
Onglet: Console
```

#### 3️⃣ **Vider la console**
```
Clic droit → Clear console
OU
Icône 🚫 en haut
```

#### 4️⃣ **Générer une Table_Consolidation**

**Dans le chat, demander :**
```
"Génère une Table_Consolidation"
```

**OU toute commande générant table de consolidation/résultat**

#### 5️⃣ **Observer Console**

**Rechercher ces 3 logs dans l'ordre :**

```javascript
// LOG 1 : Confirmation bypass Gemini
🚨 [DIAGNOSTIC] Événement save:request reçu via conso.js pour: "Table_Consolidation"

// LOG 2 : Bridge traite requête
💾 [Bridge] Handling save request for: Table_Consolidation

// LOG 3 : Blocage actuel (ligne 706-710)
🚫 [DISABLED] Skipping save for excluded keyword: "Table_Consolidation"
```

### **Résultats Possibles:**

#### ✅ **Scénario A : Les 3 logs apparaissent**

**Interprétation :**
- Gemini a raison : bypass via `conso.js` existe ✅
- Blocage actuel fonctionne pour ce chemin ✅
- MAIS contamination = autres tables passent peut-être par autre chemin

**Action suivante :** Passer TEST C

---

#### ❌ **Scénario B : Seulement LOG 3 apparaît**

**Interprétation :**
- Table passe par `handleTableIntegrated` directement
- Pas de bypass via `conso.js` pour cette table
- Contamination = probablement anciennes tables

**Action suivante :** Passer TEST C (nettoyer DB)

---

#### ⚠️ **Scénario C : Aucun log n'apparaît**

**Interprétation :**
- Dev server pas à jour (cache navigateur?)
- Hot reload pas déclenché

**Action corrective :**
```
1. Hard refresh : Ctrl + Shift + R
2. OU: Fermer onglet + Rouvrir
3. OU: Vider cache navigateur (Ctrl+Shift+Delete)
```

---

## 📋 TEST C : Test Décisif (5 minutes)

### **Objectif:**
Confirmer si contamination = anciennes tables OU nouveau problème

### **Étapes:**

#### 1️⃣ **Nettoyer Complètement DB**

**Cliquer bouton :**
```
🧹 Storage (Clean All)
```

**Confirmer suppression**

**Observer :**
- Console affiche messages suppression
- Page se recharge automatiquement

#### 2️⃣ **Générer Table NORMALE**

**Dans nouveau chat, demander :**
```
"Liste des rubriques comptables"
```

**Résultat attendu :**
- Table visible DOM ✅
- Console : Aucun log `🚫 [DISABLED]` (table normale autorisée)
- Table sauvegardée IndexedDB ✅

#### 3️⃣ **Générer Table EXCLUE**

**Dans même chat, demander :**
```
"Génère une Table_Consolidation"
```

**Observer console :**

**Attendu si blocage fonctionne :**
```
🚨 [DIAGNOSTIC] Événement save:request reçu via conso.js pour: "Table_Consolidation"
💾 [Bridge] Handling save request for: Table_Consolidation
🚫 [DISABLED] Skipping save for excluded keyword: "Table_Consolidation"
```

**Table peut être visible DOM** (générée par Flowise)  
**MAIS PAS sauvegardée IndexedDB** ❌

#### 4️⃣ **Actualiser Page (F5)**

**Appuyer :** F5

**Observer après rechargement :**
- Table "Rubrique" réapparaît ✅ (restaurée depuis DB)
- Table "Table_Consolidation" disparaît ❌ (pas sauvegardée)

#### 5️⃣ **Test Auto Final**

**Cliquer bouton :**
```
🧪 Test Auto
```

**Observer résultat :**

### **Résultats Possibles:**

#### ✅ **Scénario SUCCÈS : Tous tests passent**

```
TEST AUTOMATIQUE COMPLET
────────────────────────────────────────
TEST 1: Flag Global ✅
TEST 2: Log Désactivation ✅
TEST 3: Contamination ✅ (0 ou 1 table session actuelle)
TEST 4: Doublons ✅ (0 doublons)
────────────────────────────────────────
🎉 TOUS LES TESTS PASSÉS!
```

**Interprétation :**
- **BLOCAGE FONCTIONNE !** 🎉
- Les 11 contaminations = anciennes tables avant activation
- Solution = Nettoyer DB une fois pour tous

**Action :** PROBLÈME RÉSOLU ! Documentation + commits

---

#### ❌ **Scénario ÉCHEC : Contamination persiste**

```
TEST 3: Contamination ❌ (X tables)
```

**Interprétation :**
- Blocage niveau 1 insuffisant
- Autre chemin sauvegarde actif
- Tables générées par autre événement non-intercepté

**Action :** Passer ÉTAPE A (Solution 3 Niveaux)

---

#### ⚠️ **Scénario PARTIEL : Log absent**

```
TEST 2: Log Désactivation ❌
TEST 3: Contamination ❌
```

**Interprétation :**
- Dev server pas à jour
- Cache Vite persistant

**Action corrective :**
```powershell
# Arrêter dev
taskkill /F /IM node.exe

# Supprimer caches
Remove-Item -Recurse -Force "dist", "node_modules\.vite"

# Rebuild + Restart
npm run dev
```

---

## 📊 SYNTHÈSE RÉSULTATS À ME COMMUNIQUER

### **Après TEST B (Diagnostic Bypass) :**

**Copiez-collez console (screenshots ou texte) :**
```
Logs console complets après génération Table_Consolidation:
[COLLER ICI]
```

**Répondez :**
- Log `🚨 [DIAGNOSTIC]` apparu ? (Oui/Non)
- Log `🚫 [DISABLED]` apparu ? (Oui/Non)
- Table visible DOM ? (Oui/Non)

---

### **Après TEST C (Test Décisif) :**

**Copiez-collez résultat Test Auto :**
```
TEST AUTOMATIQUE COMPLET
[COLLER RÉSULTAT COMPLET ICI]
```

**Répondez :**
- Après F5, table "Rubrique" restaurée ? (Oui/Non)
- Après F5, table "Table_Consolidation" disparue ? (Oui/Non)
- Contamination = 0 dans Test Auto ? (Oui/Non)

---

## 🎯 DÉCISION FINALE

### **Si Tests B + C SUCCÈS :**
→ **PROBLÈME RÉSOLU !**
→ Pas besoin ÉTAPE A
→ Nettoyer DB production = solution définitive

### **Si Tests B + C ÉCHEC :**
→ **Passer ÉTAPE A**
→ Implémentation Solution 3 Niveaux
→ Défense en profondeur (index.html + service + restore)

---

## ⏱️ TEMPS ESTIMÉ

- **Test B :** 5 minutes
- **Test C :** 5 minutes
- **Total :** 10 minutes max

---

**Effectuez les tests maintenant et envoyez-moi les résultats ! 🚀**

**Je reste en attente pour passer à l'ÉTAPE A si nécessaire.**
