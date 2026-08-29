# Guide de Test - Persistance Menu.js

## 🎯 Objectif

Vérifier que les modifications de tables (suppression de lignes, etc.) sont bien persistantes après rechargement de la page.

## ✅ Modifications Apportées

1. **Debounce des sauvegardes** (300ms) - Évite les sauvegardes multiples
2. **Force Update** - Bypass la détection de fingerprint
3. **Restauration rapide** (600ms au lieu de 5s)
4. **Script de restauration forcée** - Garantit que les tables sont disponibles

## 🧪 Tests Disponibles

### Test 1: Diagnostic Complet
**Fichier**: `public/diagnostic-complet.html`

**Utilisation**:
1. Ouvrir dans le navigateur
2. Cliquer sur les boutons dans l'ordre
3. Vérifier que la session et les tables sont présentes

**Vérifie**:
- Session stable dans sessionStorage
- Tables dans IndexedDB
- Tables dans le DOM
- Restauration manuelle

---

### Test 2: End-to-End
**Fichier**: `public/test-e2e-persistence.html`

**Utilisation**:
1. Ouvrir dans le navigateur
2. Suivre les étapes 1 à 4
3. À l'étape 4, la page va recharger
4. Après rechargement, vérifier l'étape 5

**Vérifie**:
- Création et sauvegarde
- Modification (suppression ligne)
- Persistance dans IndexedDB
- Restauration après rechargement

---

### Test 3: Force Update
**Fichier**: `public/test-force-update.html`

**Utilisation**:
1. Ouvrir dans le navigateur
2. Le test s'exécute automatiquement

**Vérifie**:
- Paramètre `forceUpdate` fonctionne
- Bypass de la détection de fingerprint

---

## 🔍 Test Manuel (Application Réelle)

### Étape 1: Créer une table
1. Ouvrir l'application
2. Créer une table via Flowise ou n8n
3. Vérifier qu'elle s'affiche

### Étape 2: Modifier via menu.js
1. Clic droit sur une ligne
2. Sélectionner "Supprimer ligne"
3. Vérifier dans la console:
   ```
   ✅ Table sauvegardée avec succès
   ```

### Étape 3: Recharger
1. Appuyer sur F5
2. Attendre 1 seconde
3. Vérifier dans la console:
   ```
   ✅ Restauration terminée et événement émis
   ```

### Étape 4: Vérifier
1. La table doit être visible
2. La ligne supprimée doit rester supprimée
3. ✅ **Succès** si la modification est persistante

---

## 📊 Logs Attendus

### Lors de la Modification
```
💾 Demande de sauvegarde depuis menu
⏱️ Debounce: annulation sauvegarde précédente (x3)
💾 Sauvegarde table: session=stable_session_xxx
🔄 Mise à jour de la table existante: xxx
🗑️ Deleted table xxx
✅ Table saved: xxx
✅ Table sauvegardée avec succès
```

### Lors du Rechargement
```
🔄 Script de restauration forcée chargé
📋 Session: stable_session_xxx
✅ Bridge trouvé, restauration...
🔄 Restoring tables for session: stable_session_xxx
📋 Found 1 table(s) to restore
✅ Injected table xxx into container xxx
✅ Restauration terminée et événement émis
```

---

## ❌ Problèmes Possibles

### Problème 1: "Pas de session stable"
**Solution**: Créer une table d'abord pour initialiser la session

### Problème 2: "Aucune table restaurée"
**Solution**: Vérifier que la table a bien été sauvegardée (voir logs)

### Problème 3: "Timeout restauration"
**Solution**: Vérifier que `force-restore-on-load.js` est bien chargé dans index.html

### Problème 4: Tables restaurées mais pas visibles
**Solution**: Vérifier que les conteneurs Flowise sont bien créés

---

## 🔧 Outils de Debug

### Console Browser
```javascript
// Vérifier session
sessionStorage.getItem('claraverse_stable_session')

// Vérifier API restauration
window.claraverseRestore.isComplete()

// Forcer restauration
await window.claraverseRestore.forceRestore()

// Attendre restauration
await window.claraverseRestore.waitForRestore()
```

### IndexedDB (DevTools)
1. Ouvrir DevTools (F12)
2. Onglet "Application" ou "Storage"
3. IndexedDB → clara_db → clara_generated_tables
4. Vérifier les entrées

---

## 📝 Fichiers Modifiés

1. `src/services/flowiseTableService.ts` - Ajout paramètre `forceUpdate`
2. `src/services/menuIntegration.ts` - Ajout debounce
3. `src/services/autoRestore.ts` - Réduction délais
4. `public/force-restore-on-load.js` - **NOUVEAU** - Restauration forcée
5. `index.html` - Ajout script de restauration

---

## ✅ Critères de Succès

- [ ] Modification sauvegardée (log "✅ Table sauvegardée")
- [ ] Rechargement sans erreur
- [ ] Restauration rapide (< 1 seconde)
- [ ] Table visible après rechargement
- [ ] Modification persistante (ligne supprimée reste supprimée)

---

## 🚀 Prochaines Étapes

Si tout fonctionne:
1. Tester avec différentes modifications (ajout ligne, modification cellule)
2. Tester avec plusieurs tables
3. Tester avec sessions multiples
4. Déployer en production

Si problèmes persistent:
1. Ouvrir `public/diagnostic-complet.html`
2. Copier les logs
3. Analyser où ça bloque
