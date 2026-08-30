# 🚨 DIAGNOSTIC URGENT - Problèmes Identifiés

**Date** : 29 Août 2026  
**Statut** : 3 problèmes critiques détectés

---

## ❌ Problèmes Reportés par l'Utilisateur

### 1. Contamination des Chats Continue
**Symptôme** : Les données d'un chat apparaissent dans un autre chat  
**Cause probable** : `data-session-id` n'est pas exposé par React → fallback sur sessionStorage

### 2. Doublons de Tables
**Symptôme** : Table modifiée + Table non modifiée coexistent  
**Cause probable** : Restauration crée nouvelle table au lieu de mettre à jour l'existante

### 3. Table_conso et Table_Resultat Pas Persistantes
**Symptôme** : Modelized table persiste, mais pas Table_conso ni Table_Resultat  
**Cause racine** : `saveTableDataNow()` est appelé sur la table MODELISÉE uniquement

---

## 🔍 DIAGNOSTIC IMMÉDIAT REQUIS

### Étape 1 : Vérifier Logs Console

**Ouvrir Console (F12) et chercher** :

```
📍 [INLINE] SessionId depuis DOM: clara-session-xxx
```

**OU**

```
🚨 [INLINE] ALERTE: SessionId depuis sessionStorage
```

**Question critique** : Quel log voyez-vous ?

- Si `depuis DOM` → Isolation devrait fonctionner (problème ailleurs)
- Si `depuis sessionStorage` → **C'EST LE PROBLÈME** (React n'expose pas data-session-id)

---

### Étape 2 : Vérifier data-session-id dans DOM

**Console (F12)** :
```javascript
document.querySelector('[data-session-id]')?.getAttribute('data-session-id')
```

**Résultat attendu** : `"clara-session-1788034640058-xxx"`  
**Si null** : React ne compile pas correctement

---

### Étape 3 : Vérifier Sauvegarde Table_conso

**Logs attendus lors modification de Table_conso** :
```
💾 [INLINE] Interception sauvegarde table
🔑 [INLINE] Keyword: Table_Consolidation
✅ [INLINE] Événement émis pour: Table_Consolidation
✅ Table saved: uuid-xxx
```

**Si AUCUN log** : `saveTableDataNow()` n'est pas appelé pour Table_conso

---

## 🛠️ SOLUTIONS PAR PROBLÈME

### Problème 1 : Contamination Chats

**SI log = "SessionId depuis sessionStorage"** :

**Cause** : ClaraAssistant.tsx ne définit pas `data-session-id` OU `currentSession` est undefined

**Solution A** : Vérifier compilation React
```powershell
# Arrêter npm run dev (Ctrl+C)
# Supprimer cache
Remove-Item -Recurse -Force node_modules\.vite
# Redémarrer
npm run dev
```

**Solution B** : Vérifier ClaraAssistant.tsx ligne 3730
```tsx
// Doit avoir :
data-session-id={currentSession?.id}
data-chat-session-id={currentSession?.id}

// Vérifier que currentSession n'est pas undefined
console.log("Current session:", currentSession);
```

---

### Problème 2 : Doublons de Tables

**Cause** : Restauration insère nouvelle table au lieu de remplacer

**Solution** : Modifier flowiseTableBridge pour REMPLACER le contenu au lieu d'INSÉRER

**Code à ajouter dans flowiseTableBridge.ts** (ligne ~1350) :
```typescript
// AVANT de restaurer, vérifier si table existe déjà
const existingTable = this.findTableByKeyword(tableData.keyword);

if (existingTable) {
  // REMPLACER le contenu au lieu de créer nouvelle table
  existingTable.innerHTML = tableData.html;
  console.log(`✅ [Bridge] Table mise à jour: "${tableData.keyword}"`);
  return; // Ne pas créer nouveau container
}
```

---

### Problème 3 : Table_conso et Table_Resultat Pas Persistantes

**Cause racine** : `saveTableDataNow()` appelé uniquement sur table MODELISÉE

**Solution** : Modifier conso.js pour appeler `saveTableDataNow()` sur Table_conso ET Table_Resultat

**Fichier** : `public/conso.js`

**Ligne ~1300** (après création Table_Consolidation) :
```javascript
// Après avoir créé/mis à jour Table_Consolidation
const consoTable = document.querySelector(`table.claraverse-conso-table[data-for-table="${tableId}"]`);
if (consoTable) {
  // FORCER sauvegarde de la table conso
  this.saveTableDataNow(consoTable);
  debug.log("💾 Sauvegarde forcée de Table_Consolidation");
}
```

**Ligne ~1800** (après mise à jour Table_Resultat) :
```javascript
// Dans applyResultatToTable, après mise à jour
if (updatedAnyRow || contentCell) {
  // FORCER sauvegarde de la table résultat
  this.saveTableDataNow(potentialTable);
  debug.log("💾 Sauvegarde forcée de Table_Resultat");
  return true;
}
```

---

## 🎯 ACTION IMMÉDIATE

**1. DIAGNOSTIC D'ABORD** :
```javascript
// Console F12
console.log("=== DIAGNOSTIC ===");
console.log("1. SessionId:", document.querySelector('[data-session-id]')?.getAttribute('data-session-id'));
console.log("2. Tables data-keyword:", document.querySelectorAll('table[data-keyword]').length);
console.log("3. Processor intégré:", window.claraverseProcessor?.__integrated);
```

**2. Partagez les résultats** :
- Log SessionId (DOM ou sessionStorage ?)
- Nombre de tables avec data-keyword
- Processor intégré (true/false ?)

**3. On appliquera les corrections ciblées**

---

## 📋 Checklist Diagnostic

- [ ] Console ouverte (F12)
- [ ] Log SessionId identifié (DOM vs sessionStorage)
- [ ] data-session-id vérifié dans DOM (null vs valeur)
- [ ] Tables avec data-keyword comptées
- [ ] Logs sauvegarde Table_conso observés (ou absents)
- [ ] Test modification Table_conso effectué

**Une fois diagnostic partagé, je corrige les problèmes spécifiques.**

---

**Prochaine étape** : Partagez les 3 résultats du diagnostic ci-dessus.
