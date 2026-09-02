# 🔍 SYNTHÈSE COMPARATIVE : 3 Plans (Claude vs DeepSeek vs Gemini)

**Date:** 29 Août 2026  
**Objectif:** Comparer les 3 analyses de modèles Frontier

---

## 📊 VUE D'ENSEMBLE

| Aspect | Claude | DeepSeek | Gemini |
|--------|--------|----------|--------|
| **Root Cause** | Chemin restauration non filtré | Cache Vite + Tree-shaking | Bypass conso.js |
| **Chemin Identifié** | `restoreTablesChronologically()` | N/A (code supprimé) | `flowise:table:save:request` |
| **Probabilité** | Haute | Moyenne | Haute |
| **Solution** | Défense 3 chemins + DOM guard | Défense 3 niveaux | Défense 3 niveaux |
| **Fichiers Requis** | ClaraAssistant.tsx + flowiseTimelineService.ts | Aucun | Aucun |

---

## 🎯 HYPOTHÈSES ROOT CAUSE

### **Claude : Chemin Restauration Non Filtré**

**Découverte Clé :**
```typescript
// 3 CHEMINS D'INJECTION TABLES DANS DOM
1. handleTableIntegrated()         → ✅ Filtré (ligne 706-710)
2. restoreTablesForSession()       → 🚫 Désactivé (return ligne 1017)
3. restoreTablesChronologically()  → ❌ NON FILTRÉ + Ignore flag global
```

**Analyse :**
```typescript
// flowiseTableBridge.ts ligne 2246
private async restoreTablesChronologically() {
  // ❌ Ne vérifie PAS DISABLE_TABLE_RESTORATION
  // ❌ Ne filtre PAS EXCLUDED_KEYWORDS
  // ❌ Appelle getSessionTimeline() (filtrage session possiblement défaillant)
  // → Injecte TOUT dans DOM sans contrôle
}
```

**Ce que ça explique :**
- Flag global sans effet ✅
- Log `🚫 [DISABLED]` absent ✅
- 11 contaminations ✅
- Doublons ✅

**Probabilité Root Cause :** 🔥 **HAUTE**

---

### **DeepSeek : Cache Vite + Tree-Shaking**

**Hypothèse :**
```
"Le code de blocage (706-710) est absent du bundle car :
- Cache Vite corrompu (node_modules/.vite)
- Tree-shaking identifie code comme 'mort'
- EXCLUDED_KEYWORDS jamais réutilisée → supprimée"
```

**Preuves Initiales :**
```powershell
grep "EXCLUDED_KEYWORDS" dist/assets/*.js
# Résultat: AUCUNE occurrence ❌
```

**MAIS Maintenant :**
```
TEST 2: Log Désactivation ✅ Log 🚫 DISABLED trouvé
```

**Conclusion :**
- Cache Vite ÉTAIT problème → **RÉSOLU** après rebuild ✅
- Code maintenant PRÉSENT et EXÉCUTÉ ✅
- MAIS contamination persiste → **Autre cause active** ❌

**Probabilité Root Cause :** ~~Haute~~ → **RÉSOLUE mais INSUFFISANTE**

---

### **Gemini : Bypass via conso.js**

**Hypothèse :**
```
"Tables consolidation passent par conso.js qui émet événement :
flowise:table:save:request (PAS flowise:table:integrated)
→ Blocage ligne 706-710 est dans handleTableIntegrated()
→ Tables passent par handleTableSaveRequest() sans filtre"
```

**Analyse Code :**
```typescript
// index.html - conso.js
saveTableDataNow() {
  // Émet: flowise:table:save:request ⚠️
}

// flowiseTableBridge.ts
handleTableSaveRequest(event) {
  // ❌ Pas de filtre ici
  this.handleTableIntegrated(integratedDetail); // ✅ Filtre ICI
}
```

**MAIS Gemini a tort sur un point :**
`handleTableSaveRequest()` **APPELLE** `handleTableIntegrated()` qui **A** le filtre !

**Conclusion :**
- Bypass existe pour CERTAINES tables ✅
- MAIS filtre appliqué finalement via handleTableIntegrated ✅
- Pas suffisant pour expliquer contamination persistante ❌

**Probabilité Root Cause :** Moyenne → **Partiellement vraie**

---

## 🔍 ANALYSE COMPARATIVE APPROFONDIE

### **Table des 3 Chemins (Selon Claude)**

| Chemin | Fonction | Filtre EXCLUDED? | Vérifie Flag Global? | Utilisé? |
|--------|----------|------------------|----------------------|----------|
| **1. Sauvegarde Live** | `handleTableIntegrated()` | ✅ OUI (706-710) | N/A | ✅ Oui |
| **2. Restauration Session** | `restoreTablesForSession()` | N/A (désactivé) | ✅ OUI (1024) | ❌ Non |
| **3. Restauration Chronologique** | `restoreTablesChronologically()` | ❌ **NON** | ❌ **NON** | ⚠️ **PROBABLEMENT** |

### **Observation Critique :**

**Nous avons désactivé le Chemin 2 :**
```typescript
// flowiseTableBridge.ts ligne 652-670
private handleSessionChanged(event: Event): void {
  console.log('🚫 [DISABLED] Skipping restoration on session change');
  return; // ❌ Ne restaure rien
}
```

**MAIS si le Chemin 3 existe et s'exécute :**
→ Il bypass TOUT notre travail ! ❌

---

## 🎯 HYPOTHÈSE UNIFIÉE (Synthèse 3 Plans)

### **Scénario Probable :**

1. **Cache Vite** était problème → **RÉSOLU** ✅
2. **Chemin sauvegarde** filtré (handleTableIntegrated) → **OK** ✅
3. **Chemin restauration session** désactivé → **OK** ✅
4. **MAIS Chemin 3 (restoreTablesChronologically)** actif → **NON FILTRÉ** ❌

**Résultat :**
- Nouvelles tables exclues PAS sauvées ✅ (log trouvé)
- MAIS anciennes tables restaurées via Chemin 3 ❌ (contamination)
- Doublons car Chemin 3 ignore sessionId ❌

---

## 🧪 TEST DIAGNOSTIC DÉCISIF

### **Vérifier si Chemin 3 Existe et S'exécute :**

<function_calls>
<invoke name="grep_search">
<parameter name="explanation">Chercher restoreTablesChronologically pour confirmer existence Chemin 3