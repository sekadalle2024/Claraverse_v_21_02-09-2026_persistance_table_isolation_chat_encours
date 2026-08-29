# 📊 Situation Réelle - Persistance CIA

## ✅ Ce Que Nous Savons

### Diagnostic Confirmé

- ✅ **10 tables** dans le DOM (les tables existent !)
- ✅ **conso.js** chargé et fonctionnel
- ✅ **22 tables CIA** sauvegardées dans localStorage
- ✅ **Système de persistance** en place (IndexedDB + localStorage)
- ✅ **auto-restore-chat-change.js** actif

### Le Vrai Problème

❌ **Les checkboxes CIA ne sont pas persistantes lors du changement de chat**

Ce n'est PAS un problème de :
- ❌ Tables qui disparaissent (elles sont là)
- ❌ conso.js non chargé (il est chargé)
- ❌ localStorage vide (22 tables sauvegardées)

C'EST un problème de :
- ⚠️ **Timing de restauration** lors du changement de chat
- ⚠️ **Événement non déclenché** ou non reçu
- ⚠️ **Tables recréées** après la restauration

## 🔍 Analyse du Système Existant

### Architecture Actuelle

```
Changement de chat
    ↓
auto-restore-chat-change.js détecte le changement
    ↓
Attend 5 secondes
    ↓
Déclenche événement 'flowise:table:restore:request'
    ↓
conso.js écoute l'événement (ligne ~1500)
    ↓
Attend 2 secondes (ligne ~1507)
    ↓
Appelle restoreAllTablesData()
    ↓
Restaure les checkboxes depuis localStorage
```

**Timing total** : 5s + 2s = **7 secondes**

### Problèmes Potentiels

1. **Les tables sont recréées APRÈS la restauration**
   - Flowise/Menu.js recrée les tables
   - Les checkboxes sont réinitialisées (vides)
   - La restauration est écrasée

2. **L'événement n'est pas déclenché**
   - auto-restore-chat-change.js ne détecte pas le changement
   - Ou le MutationObserver est bloqué

3. **L'événement n'est pas reçu**
   - conso.js n'écoute pas correctement
   - Ou l'événement est déclenché avant que conso.js soit prêt

4. **La restauration échoue silencieusement**
   - Les tables n'ont pas d'ID
   - Les données ne correspondent pas aux tables actuelles

## 🧪 Plan de Test

### Test 1 : Restauration Manuelle

**Objectif** : Vérifier si `restoreAllTablesData()` fonctionne

**Procédure** : Voir `TEST_MANUEL_RESTAURATION_CIA.txt`

**Si ça fonctionne** : Le problème est le timing lors du changement de chat  
**Si ça ne fonctionne pas** : Le problème est dans la fonction de restauration

### Test 2 : Événement Manuel

**Objectif** : Vérifier si l'événement déclenche la restauration

**Procédure** :
```javascript
// Cocher une checkbox
// Sauvegarder
claraverseProcessor.autoSaveAllTables();

// Décocher la checkbox
// Déclencher l'événement manuellement
document.dispatchEvent(new CustomEvent('flowise:table:restore:request', {
  detail: { sessionId: 'test' }
}));

// Attendre 3 secondes
// Vérifier si la checkbox est recochée
```

**Si ça fonctionne** : Le problème est que l'événement n'est pas déclenché lors du changement de chat  
**Si ça ne fonctionne pas** : Le problème est que conso.js ne reçoit pas l'événement

### Test 3 : Observer les Logs

**Objectif** : Voir ce qui se passe lors du changement de chat

**Procédure** :
1. Ouvrir la console
2. Cocher une checkbox
3. Sauvegarder
4. Changer de chat
5. Observer les logs pendant 10 secondes
6. Revenir au chat initial
7. Observer les logs pendant 10 secondes

**Logs attendus** :
```
🔄 Nouvelles tables CIA détectées
⏰ Restauration planifiée dans 5 secondes
🎯 === RESTAURATION VIA ÉVÉNEMENT (CIA) ===
📊 Tables CIA détectées: X
✅ Événement de restauration déclenché
🔄 Événement de restauration reçu pour les tables CIA
🔄 Restauration des tables CIA...
✅ X table(s) restaurée(s)
```

**Si logs absents** : Identifier quelle étape manque

## 🎯 Solutions Possibles

### Solution A : Augmenter le Délai

Si les tables sont recréées après la restauration :

**Dans `conso.js`, ligne ~1507** :
```javascript
// AVANT
setTimeout(() => {
  debug.log("🔄 Restauration des tables CIA...");
  this.restoreAllTablesData();
}, 2000);

// APRÈS
setTimeout(() => {
  debug.log("🔄 Restauration des tables CIA...");
  this.restoreAllTablesData();
}, 5000); // Augmenté à 5 secondes
```

### Solution B : Restaurer en Continu

Si le timing est imprévisible :

**Ajouter dans `conso.js`** :
```javascript
// Restaurer toutes les 2 secondes pendant 10 secondes après changement de chat
document.addEventListener("flowise:table:restore:request", (e) => {
  let attempts = 0;
  const maxAttempts = 5;
  
  const restoreInterval = setInterval(() => {
    attempts++;
    debug.log(`🔄 Tentative de restauration ${attempts}/${maxAttempts}`);
    this.restoreAllTablesData();
    
    if (attempts >= maxAttempts) {
      clearInterval(restoreInterval);
      debug.log("✅ Restaurations terminées");
    }
  }, 2000);
});
```

### Solution C : Observer les Checkboxes

Si les tables sont recréées :

**Ajouter un MutationObserver** pour détecter quand les checkboxes sont créées et les restaurer immédiatement.

### Solution D : Forcer les IDs Stables

Si les tables perdent leur ID :

**S'assurer que les IDs sont générés AVANT la sauvegarde** et **conservés lors de la recréation**.

## 📋 Prochaines Étapes

1. **Exécuter `TEST_MANUEL_RESTAURATION_CIA.txt`**
   - Suivre les 6 étapes
   - Noter les résultats

2. **Analyser les résultats**
   - Identifier quelle étape échoue
   - Déterminer la cause exacte

3. **Appliquer la solution appropriée**
   - Solution A, B, C ou D selon le diagnostic

4. **Tester à nouveau**
   - Vérifier que le problème est résolu

## 📞 Informations Nécessaires

Pour vous aider efficacement, j'ai besoin de savoir :

1. **Résultat du test manuel** (TEST_MANUEL_RESTAURATION_CIA.txt)
   - Étape 5 : La restauration manuelle fonctionne-t-elle ? OUI / NON
   - Étape 6 : Que voyez-vous dans la console lors du changement de chat ?

2. **Logs lors du changement de chat**
   - Copiez-collez tous les logs qui apparaissent
   - Cherchez spécifiquement les logs avec 🔄, ✅, ❌

3. **Comportement observé**
   - Les checkboxes disparaissent immédiatement ?
   - Elles restent quelques secondes puis disparaissent ?
   - Elles ne sont jamais restaurées ?

---

**Date** : 26 novembre 2025  
**Statut** : 🔍 Diagnostic en cours  
**Action** : Exécuter TEST_MANUEL_RESTAURATION_CIA.txt
