# 📖 GUIDE UTILISATION - Envoi à Agent Externe

**Date:** 29 Août 2026  
**Agent Target:** Claude Opus / Kimi K3 / o1-preview

---

## ✅ FICHIERS À ENVOYER (4 FICHIERS)

### 1. **PROMPT_AGENT_COMPLET.md** ← CE FICHIER
   - **Contient TOUT** le contexte du document 01
   - Instructions complètes mission
   - Hypothèses + solutions + tests
   - **Copier-coller ce fichier dans le message**

### 2. **02_SYSTEME_SCRIPTS_ARCHITECTURE_PERSISTANCE.md**
   - Architecture système
   - Flux détaillés
   - Glossaire technique

### 3. **src/services/flowiseTableBridge.ts**
   - Fichier problème (ligne 706-710)
   - Service gestion tables
   - 2300 lignes

### 4. **src/services/flowiseTableService.ts**
   - Service IndexedDB
   - Alternative blocage bas niveau
   - 500 lignes

### 5. **index.html** (OPTIONNEL si 5 fichiers max)
   - Bootstrap + diagnostic
   - Failsafe inline
   - 2500 lignes

---

## 🎯 PROCÉDURE EXACTE

### ÉTAPE 1 : Ouvrir Interface Agent

Exemples :
- **Claude Opus :** https://claude.ai/new
- **Kimi K3 :** https://kimi.moonshot.cn

### ÉTAPE 2 : Attacher Fichiers

Cliquez icône **📎 Attach**, sélectionnez :

```
✅ PROMPT_AGENT_COMPLET.md
✅ 02_SYSTEME_SCRIPTS_ARCHITECTURE_PERSISTANCE.md
✅ src/services/flowiseTableBridge.ts
✅ src/services/flowiseTableService.ts
✅ index.html (si limite 5 fichiers)
```

### ÉTAPE 3 : Message Simple

Dans zone texte, tapez simplement :

```
Lis le fichier PROMPT_AGENT_COMPLET.md et exécute la mission.

Commence par résumer ta compréhension du problème en 5 points.
```

### ÉTAPE 4 : Envoyer

Cliquez **Envoyer** 🚀

---

## 📊 CE QUE L'AGENT VA FAIRE

### Phase 1 : Diagnostic (30 min)
- Analyser pourquoi code absent build
- Identifier root cause (cache / tree-shaking / ordre)
- Fournir commandes diagnostic

### Phase 2 : Solution (1h)
- Implémenter 3 niveaux blocage
- Code survit minification
- Défense en profondeur

### Phase 3 : Validation (30 min)
- Tests build verification
- Tests runtime logs
- Tests contamination = 0
- Screenshots preuve

---

## ✅ LIVRABLES ATTENDUS

L'agent doit vous fournir :

1. **Diagnostic complet** (markdown)
2. **Code solution** (3 fichiers modifiés)
3. **Tests validation** (screenshots)
4. **Mémo résolution** (markdown)

---

## 🎯 CRITÈRES SUCCÈS

✅ Log `🚫 [DISABLED]` visible console  
✅ Test Auto : Contamination = 0  
✅ Code présent dans bundle dist/  
✅ Tables exclues jamais sauvegardées  

---

**C'EST TOUT ! Juste 4 fichiers + 1 phrase de message. 🚀**
