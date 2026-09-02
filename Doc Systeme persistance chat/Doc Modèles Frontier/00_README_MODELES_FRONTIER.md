# 📚 MODÈLES FRONTIER - Documents pour Agents de Code

**Date:** 29 Août 2026  
**Objectif:** Fournir contexte complet aux agents externes (Claude Opus, Kimi K3, o1-preview)

---

## 📋 CONTENU DOSSIER

Ce dossier contient des **custom instructions** et **documentation système** formatés pour agents de code avancés.

### Documents Disponibles

1. **`01_SITUATION_RESOLUTION_BLOCAGE_CONTAMINATION.md`** (9000 mots)
   - Custom instructions pour agent
   - Analyse complète problème contamination
   - Hypothèses root cause
   - Solutions implémentées + échouées
   - Pistes inexplorees
   - Plan d'implémentation détaillé
   - Questions pour investigation

2. **`02_SYSTEME_SCRIPTS_ARCHITECTURE_PERSISTANCE.md`** (12000 mots)
   - Architecture globale système
   - Description fichiers principaux
   - Flux complets sauvegarde/restauration
   - Points de blocage actuels
   - Glossaire termes techniques
   - Diagrammes ASCII

---

## 🎯 UTILISATION

### Pour Claude Opus / Kimi K3 / o1-preview

**Prompt Type:**
```
[ATTACH: 01_SITUATION_RESOLUTION_BLOCAGE_CONTAMINATION.md]
[ATTACH: 02_SYSTEME_SCRIPTS_ARCHITECTURE_PERSISTANCE.md]

Tu es un développeur senior React/TypeScript expert en debugging.

CONTEXTE:
Les documents attachés décrivent un problème de contamination 
de tables HTML entre chats dans une application React.

MISSION:
1. Analyser les 3 hypothèses root cause (cache, tree-shaking, ordre execution)
2. Proposer diagnostic approfondi avec commandes exactes
3. Implémenter solution alternative qui survit à minification
4. Fournir tests validation + prévention régressions

LIVRABLES:
- Diagnostic complet avec preuves
- Code solution fonctionnelle
- Tests automatisés
- Documentation commits

Commence par résumer ta compréhension du problème.
```

### Pour Session Collaborative

**Workflow:**
1. Lire `02_SYSTEME_SCRIPTS_ARCHITECTURE_PERSISTANCE.md` pour comprendre architecture
2. Lire `01_SITUATION_RESOLUTION_BLOCAGE_CONTAMINATION.md` pour comprendre blocage
3. Proposer plan investigation
4. Implémenter solution
5. Valider avec tests
6. Documenter résolution

---

## 📊 ÉTAT ACTUEL PROBLÈME

### ✅ Résolus
- Isolation sessionId entre chats (useRef)
- SessionId stable (pas de changement render)
- Notifications + boutons diagnostic UI
- Protection sauvegarde (retry si sessionId null)

### ❌ Blocages Critiques
1. **Code désactivation absent build** (ligne 706-710 `flowiseTableBridge.ts`)
   - Présent source TypeScript ✅
   - Absent bundle dist/ ❌
   - Log `🚫 [DISABLED]` jamais vu ❌

2. **Contamination persiste**
   - Test montre 9 tables autres sessions
   - DB: 10 tables, Visibles: 12 tables
   - Flag `DISABLE_TABLE_RESTORATION` activé mais inefficace

3. **Doublons tables**
   - Rubrique: 2x, no: 3x, Table_Consolidation: 2x
   - Code anti-doublon ligne 1392 pas exécuté

### ⏳ En Cours
- Dev server relancé (port 5174)
- Cache Vite supprimé
- Test en attente utilisateur

---

## 🔍 HYPOTHÈSES ROOT CAUSE

### Hypothèse #1: Cache Vite Corrompu (60%)
**Symptômes:**
- Build réussi mais modifications TypeScript absentes
- Cache `node_modules/.vite` potentiellement corrompu
- Rebuilds multiples sans effet

**Prochaine Vérification:**
```bash
npm run build -- --minify false
grep -r "EXCLUDED_KEYWORDS" dist/
```

### Hypothèse #2: Tree-Shaking (30%)
**Symptômes:**
- Code désactivation supprimé par minifier
- Variables "non-utilisées" éliminées
- Console.log supprimés en production

**Prochaine Vérification:**
```typescript
// Forcer utilisation variable
const EXCLUDED_KEYWORDS = ['...'];
window.__EXCLUDED__ = EXCLUDED_KEYWORDS; // Empêcher tree-shaking
if (EXCLUDED_KEYWORDS.some(...)) { ... }
```

### Hypothèse #3: Ordre Execution (10%)
**Symptômes:**
- Code appelé avant compilation
- Import dynamique version ancienne
- Restauration avant désactivation

**Prochaine Vérification:**
```bash
grep -r "import.*flowiseTableBridge" src/
grep -r "await import.*flowise" src/
```

---

## 💡 SOLUTIONS ALTERNATIVES

Si compilation TypeScript impossible:

### Solution A: Blocage IndexedDB Direct
```typescript
// Dans flowiseTableService.ts
async saveGeneratedTable(...args) {
  const [, , keyword] = args;
  const EXCLUDED = ['table_consolidation', 'resultat'];
  
  if (EXCLUDED.includes(keyword.toLowerCase())) {
    console.log(`🚫 [SERVICE] Skipping: ${keyword}`);
    return null;
  }
  
  // Suite normale...
}
```

### Solution B: Interception Événement
```javascript
// Dans index.html AVANT autres écouteurs
document.addEventListener('flowise:table:integrated', function(e) {
  const keyword = e.detail.keyword || '';
  const excluded = ['table_consolidation', 'resultat'];
  
  if (excluded.some(ex => keyword.toLowerCase().includes(ex))) {
    console.log('🚫 [INDEX] Blocking:', keyword);
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
}, true); // Capture phase
```

### Solution C: Filtrage Post-Restauration
```typescript
// Dans restoreTablesForSession()
let tables = await flowiseTableService.restoreSessionTables(sessionId);

const EXCLUDED = ['table_consolidation', 'resultat'];
tables = tables.filter(t => 
  !EXCLUDED.some(ex => t.keyword.toLowerCase().includes(ex))
);

// Continue restauration avec tables filtrées
```

---

## 📖 RÉFÉRENCES

### Mémos Principaux
- `00_MEMO_DESACTIVATION_RACINE_29_AOUT_2026.md` - Historique désactivations
- `00_CORRECTIONS_FINALES_CONTAMINATION_29_AOUT_2026.md` - Corrections appliquées
- `00_ETAT_FINAL_CORRECTIONS_29_AOUT_2026.md` - État avant modèles Frontier

### Fichiers Code Critiques
```
src/services/flowiseTableBridge.ts     (2300 lignes)
  └─ Ligne 706-710: Blocage sauvegarde (ABSENT BUILD)
  └─ Ligne 1024-1140: Restauration tables
  └─ Ligne 1392-1406: Anti-doublons

src/services/flowiseTableService.ts    (500 lignes)
  └─ Ligne 150-250: saveGeneratedTable()
  └─ Ligne 300-350: restoreSessionTables()

src/components/ClaraAssistant.tsx      (3800 lignes)
  └─ Ligne 411-438: SessionId stable (useRef)
  └─ Ligne 3743: Exposition data-session-id

index.html                              (2500 lignes)
  └─ Ligne 140-200: getSessionId() avec retry
  └─ Ligne 320-380: emitSaveEvent() protection
  └─ Ligne 1620-2400: Boutons diagnostic
```

### Commandes Diagnostic
```bash
# Vérifier build
npm run build -- --minify false
grep -r "EXCLUDED_KEYWORDS" dist/

# Chercher appels sauvegarde
grep -rn "saveGeneratedTable" src/

# Inspecter bundle
cat dist/assets/index-*.js | grep -o "saveTable[^(]*" | sort | uniq

# Tracer imports
grep -r "import.*flowiseTableBridge" src/
```

---

## ✅ CHECKLIST RÉSOLUTION

### Phase 1: Diagnostic (30 min)
- [ ] Build sans minification
- [ ] Vérifier présence code dans bundle
- [ ] Identifier tous chemins sauvegarde
- [ ] Tracer ordre execution

### Phase 2: Solution (1h)
- [ ] Implémenter blocage qui survit minification
- [ ] Tester avec build production
- [ ] Vérifier log `🚫 [DISABLED]` visible
- [ ] Confirmer tables exclues pas sauvegardées

### Phase 3: Validation (30 min)
- [ ] Test Auto: ✅ Contamination: 0
- [ ] Test doublons: ✅ Aucun doublon
- [ ] Test isolation: Chat A/B indépendants
- [ ] Test persistance: F5 conserve tables

### Phase 4: Documentation
- [ ] Commits Git avec messages explicites
- [ ] Screenshots console + tests
- [ ] Mémo solution finale
- [ ] Plan prévention régressions

---

## 🚀 DÉMARRAGE RAPIDE

1. **Lire** `02_SYSTEME_SCRIPTS_ARCHITECTURE_PERSISTANCE.md` (15 min)
2. **Lire** `01_SITUATION_RESOLUTION_BLOCAGE_CONTAMINATION.md` (10 min)
3. **Analyser** hypothèses root cause (5 min)
4. **Proposer** plan investigation (10 min)
5. **Implémenter** solution (1h)
6. **Valider** tests (30 min)

**Total: 2h10 max**

---

## 📞 CONTACT

Pour questions ou clarifications, référer aux mémos dans dossier parent:
```
Doc Systeme persistance chat/
  ├── 00_MEMO_*.md (20+ mémos historiques)
  ├── LISTE_FICHIERS_SYSTEME_PERSISTANCE.md
  └── SOMMAIRE.md
```

---

**Documents prêts pour agents Frontier. Bonne chance dans la résolution ! 🎯**
