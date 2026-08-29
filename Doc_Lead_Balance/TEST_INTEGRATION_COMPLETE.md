# 🧪 TEST D'INTÉGRATION COMPLÈTE - LEAD BALANCE

## ✅ STATUT: PRÊT POUR LES TESTS

Date: 2026-03-22
Version: 3.0.0

---

## 📋 CHECKLIST D'INTÉGRATION

### ✅ 1. Modifications Backend (claraApiService.ts)

- [x] Sentinelle `SENTINEL_LEAD_BALANCE` définie
- [x] Router retourne la sentinelle pour "Lead_balance"
- [x] Case 21 génère table unicolonne avec entête "Lead_balance"
- [x] Pas d'appel HTTP vers n8n (traitement 100% local)

**Fichier**: `src/services/claraApiService.ts`

```typescript
// Ligne 43
private readonly SENTINEL_LEAD_BALANCE = "__INTERNAL__LEAD_BALANCE__";

// Ligne 101-103
} else if (msg.includes("Lead_balance")) {
  routeKey = "lead_balance";
}

// Ligne 214-216
case "lead_balance":
  console.log("🔀 Router → Case 21 : lead_balance (traitement local avec upload fichier)");
  return this.SENTINEL_LEAD_BALANCE;

// Ligne 905-927
if (resolvedEndpoint === this.SENTINEL_LEAD_BALANCE) {
  console.log("📊 [Lead Balance] Démarrage du processus");
  
  const initialContent =
    "| Lead_balance |\n" +
    "|-------------|\n" +
    "| Cliquez sur cette table... |";
  
  return {
    role: "assistant",
    content: initialContent,
    metadata: { 
      model: "local",
      type: "lead_balance_trigger",
      instruction: "Right-click on this table..."
    },
  };
}
```

### ✅ 2. Script de Détection Automatique

- [x] `LeadBalanceAutoTrigger.js` créé dans `/public`
- [x] Détection automatique des tables avec entête "Lead_balance"
- [x] Ouverture automatique du dialogue de sélection de fichier
- [x] Upload vers backend Python `http://127.0.0.1:5000/lead-balance/process-excel`
- [x] Remplacement de la table avec les résultats HTML

**Fichier**: `public/LeadBalanceAutoTrigger.js`

**Fonctionnalités**:
- MutationObserver pour détecter les nouvelles tables
- Scan périodique (backup)
- Gestion des erreurs complète
- Notifications visuelles
- API globale pour tests manuels

### ✅ 3. Chargement du Script

- [x] Script ajouté dans `index.html`
- [x] Position: Après `lead-syscohada.js`
- [x] Chargement automatique au démarrage

**Fichier**: `index.html` (ligne ~145)

```html
<!-- Lead Balance Auto Trigger - Détection automatique et traitement -->
<script src="/LeadBalanceAutoTrigger.js"></script>
```

---

## 🧪 PROCÉDURE DE TEST

### Test 1: Déclenchement Automatique

**Objectif**: Vérifier que la table Lead_balance apparaît et que le dialogue s'ouvre automatiquement

**Étapes**:
1. Ouvrir l'application Claraverse
2. Dans le chat, taper: `Lead_balance`
3. Appuyer sur Entrée

**Résultat attendu**:
- ✅ Une table avec entête "Lead_balance" apparaît dans le chat
- ✅ Après 300ms, le dialogue de sélection de fichier s'ouvre AUTOMATIQUEMENT
- ✅ Notification: "📂 Sélectionnez votre fichier de balance Excel"

**Console attendue**:
```
🔀 Router → Case 21 : lead_balance (traitement local avec upload fichier)
📊 [Lead Balance] Démarrage du processus
🚀 LEAD BALANCE AUTO TRIGGER V3.0 - INITIALISATION
🎯 Table Lead_balance détectée - Déclenchement automatique
📂 Ouverture automatique du dialogue de sélection de fichier
```

### Test 2: Sélection et Upload de Fichier

**Objectif**: Vérifier l'upload et le traitement du fichier Excel

**Prérequis**: Backend Python démarré sur port 5000

**Étapes**:
1. Après l'ouverture automatique du dialogue
2. Sélectionner un fichier Excel (.xlsx ou .xls)
3. Cliquer sur "Ouvrir"

**Résultat attendu**:
- ✅ Notification: "📊 Traitement de [nom_fichier].xlsx..."
- ✅ La table affiche: "📊 Traitement de [nom_fichier].xlsx en cours..."
- ✅ Après traitement, la table est remplacée par les résultats
- ✅ Notification: "✅ Lead Balance calculée avec succès!"

**Console attendue**:
```
✅ Fichier sélectionné: balance.xlsx
📤 ENVOI VERS BACKEND
📁 Fichier: balance.xlsx (245.67 KB)
🌐 Endpoint: http://127.0.0.1:5000/lead-balance/process-excel
✅ Fichier encodé en base64: 327890 caractères
📥 Statut réponse: 200
✅ Résultat reçu: {...}
🔄 REMPLACEMENT DE LA TABLE
📍 Div parent trouvée
✅ Table remplacée avec les résultats
```

### Test 3: Annulation

**Objectif**: Vérifier le comportement si l'utilisateur annule la sélection

**Étapes**:
1. Taper `Lead_balance` dans le chat
2. Quand le dialogue s'ouvre, cliquer sur "Annuler"

**Résultat attendu**:
- ✅ La table affiche: "❌ Sélection annulée"
- ✅ Pas d'erreur dans la console
- ✅ L'attribut `data-lead-balance-processed` est retiré

### Test 4: Erreur de Format

**Objectif**: Vérifier la validation du format de fichier

**Étapes**:
1. Taper `Lead_balance` dans le chat
2. Sélectionner un fichier .pdf ou .txt

**Résultat attendu**:
- ✅ Notification: "⚠️ Format non supporté. Formats acceptés: .xlsx, .xls"
- ✅ La table affiche le message d'erreur
- ✅ L'attribut `data-lead-balance-processed` est retiré

### Test 5: Fichier Trop Volumineux

**Objectif**: Vérifier la validation de la taille

**Étapes**:
1. Taper `Lead_balance` dans le chat
2. Sélectionner un fichier Excel > 10 MB

**Résultat attendu**:
- ✅ Notification: "⚠️ Fichier trop volumineux (max: 10 MB)"
- ✅ La table affiche le message d'erreur

### Test 6: Backend Non Disponible

**Objectif**: Vérifier la gestion d'erreur si le backend est arrêté

**Prérequis**: Backend Python arrêté

**Étapes**:
1. Taper `Lead_balance` dans le chat
2. Sélectionner un fichier Excel valide

**Résultat attendu**:
- ✅ Notification: "❌ Erreur: Failed to fetch" (ou similaire)
- ✅ La table affiche le message d'erreur
- ✅ L'attribut `data-lead-balance-processed` est retiré

### Test 7: Tests Manuels via Console

**Objectif**: Vérifier l'API globale

**Commandes console**:

```javascript
// Test manuel
LeadBalanceAutoTrigger.test()

// Réinitialiser toutes les tables
LeadBalanceAutoTrigger.reset()

// Vérifier la configuration
console.log(LeadBalanceAutoTrigger.config)

// Vérifier la version
console.log(LeadBalanceAutoTrigger.version)
```

---

## 🔍 POINTS DE VÉRIFICATION

### Architecture Correcte ✅

- [x] **PAS de menu contextuel** - Pas de clic droit manuel
- [x] **Déclenchement 100% automatique** - Dès que la table apparaît
- [x] **Pattern Data.js suivi** - Détection et traitement automatique
- [x] **Architecture hybride**:
  - Backend: `claraApiService.ts` génère la table
  - Frontend: `LeadBalanceAutoTrigger.js` détecte et traite

### Flux Utilisateur ✅

```
1. User tape: "Lead_balance"
   ↓
2. Table apparaît avec entête "Lead_balance"
   ↓
3. Dialogue s'ouvre AUTOMATIQUEMENT (300ms)
   ↓
4. User sélectionne fichier Excel
   ↓
5. Upload et traitement automatique
   ↓
6. Résultats affichés dans la table
```

**Total: 3 étapes utilisateur** (au lieu de 7 avec menu contextuel)

---

## 🐛 DÉPANNAGE

### Problème: Le dialogue ne s'ouvre pas automatiquement

**Causes possibles**:
1. Script non chargé dans `index.html`
2. MutationObserver non configuré
3. Sélecteur CSS incorrect

**Solution**:
```javascript
// Vérifier que le script est chargé
console.log(window.LeadBalanceAutoTrigger)

// Forcer un scan manuel
LeadBalanceAutoTrigger.test()
```

### Problème: Erreur "Failed to fetch"

**Causes possibles**:
1. Backend Python non démarré
2. Port incorrect (doit être 5000)
3. CORS non configuré

**Solution**:
```bash
# Démarrer le backend Python
cd py_backend
python app.py
```

### Problème: Table non remplacée

**Causes possibles**:
1. Sélecteur CSS de la div parent incorrect
2. Format de réponse backend incorrect

**Solution**:
```javascript
// Vérifier la structure DOM
const table = document.querySelector('table.min-w-full.border');
const parentDiv = table.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none');
console.log(parentDiv);
```

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance
- ⏱️ Temps de détection: < 500ms
- ⏱️ Ouverture dialogue: 300ms
- ⏱️ Upload fichier 1MB: < 2s
- ⏱️ Traitement backend: < 5s

### Fiabilité
- ✅ Détection: 100% des tables Lead_balance
- ✅ Upload: Gestion erreurs complète
- ✅ Affichage: Remplacement correct de la table

### Expérience Utilisateur
- 🎯 Déclenchement automatique: OUI
- 🎯 Nombre d'étapes: 3 (vs 7 avec menu)
- 🎯 Notifications claires: OUI
- 🎯 Gestion erreurs: OUI

---

## 📝 NOTES IMPORTANTES

### Différences avec l'Approche Incorrecte

**APPROCHE INCORRECTE** (7 étapes):
1. User tape "Lead_balance"
2. Table apparaît
3. User fait clic droit sur la table
4. Menu contextuel s'ouvre
5. User cherche "📊 Lead Balance"
6. User clique sur l'option
7. Dialogue s'ouvre

**APPROCHE CORRECTE** (3 étapes):
1. User tape "Lead_balance"
2. Table apparaît + dialogue s'ouvre AUTO
3. User sélectionne fichier

### Réutilisabilité

Ce pattern peut être réutilisé pour d'autres endpoints:
- Analyse fraude
- États financiers
- Rapports d'audit
- Etc.

Voir: `Doc_Lead_Balance/GUIDE_EXTENSION_AUTRES_ENDPOINTS.md`

---

## ✅ VALIDATION FINALE

Avant de considérer l'intégration comme complète, vérifier:

- [ ] Test 1: Déclenchement automatique ✅
- [ ] Test 2: Upload et traitement ✅
- [ ] Test 3: Annulation ✅
- [ ] Test 4: Erreur de format ✅
- [ ] Test 5: Fichier trop volumineux ✅
- [ ] Test 6: Backend non disponible ✅
- [ ] Test 7: Tests manuels console ✅

**Signature**: _____________________
**Date**: _____________________

---

## 📚 DOCUMENTATION ASSOCIÉE

- `Doc_Lead_Balance/README.md` - Point d'entrée principal
- `Doc_Lead_Balance/README_ARCHITECTURE_FINALE.md` - Architecture complète
- `Doc_Lead_Balance/CORRECTION_APPROCHE.md` - Clarification approche correcte
- `Doc_Lead_Balance/GUIDE_EXTENSION_AUTRES_ENDPOINTS.md` - Réutilisation
- `Doc_Lead_Balance/GUIDE_UTILISATEUR.md` - Guide utilisateur final

---

**FIN DU DOCUMENT DE TEST**
