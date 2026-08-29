# 🔍 Guide de Diagnostic - Examen CIA

## 🎯 Objectif

Ce guide vous aide à diagnostiquer et résoudre les problèmes de fusion des cellules et de persistance des checkboxes dans le script Examen CIA.

## 🚀 Démarrage rapide

### 1. Ouvrir la page de test

```bash
npm run dev
```

Puis ouvrir: `http://localhost:5173/test-examen-cia.html`

### 2. Ouvrir la console du navigateur

Appuyer sur **F12** ou **Ctrl+Shift+I** (Windows/Linux) ou **Cmd+Option+I** (Mac)

### 3. Attendre le chargement

Le diagnostic s'exécute automatiquement après 3 secondes. Vous verrez:

```
🔍 DIAGNOSTIC EXAMEN CIA - Démarrage

=== 1. VÉRIFICATION DU SCRIPT ===
Script examen_cia chargé: true
Examens sauvegardés: 0
Taille des données: 0 KB

=== 2. VÉRIFICATION DES TABLES ===
Nombre de tables d'examen: 4
...
```

## 🔧 Commandes de diagnostic

### Vérifier la sauvegarde

```javascript
diagnosticExamenCIA.verifierSauvegarde()
```

**Utilisation:**
1. Cocher une checkbox dans une table
2. Attendre 1 seconde
3. Exécuter la commande

**Résultat attendu:**
```
🔍 VÉRIFICATION SAUVEGARDE
✅ Données sauvegardées: {...}
  ✓ Checkbox cochée: ligne 2, colonne 4
Total checkboxes cochées: 1
```

**Si ça ne fonctionne pas:**
```
❌ Aucune donnée sauvegardée
```
→ Problème de sauvegarde détecté

### Vérifier la restauration

```javascript
diagnosticExamenCIA.verifierRestauration()
```

**Utilisation:**
1. Cocher une checkbox
2. Actualiser la page (F5)
3. Exécuter la commande

**Résultat attendu:**
```
🔍 VÉRIFICATION RESTAURATION

Table 1:
  ✓ Checkbox 2 cochée
✅ 1 checkbox(es) restaurée(s)
```

**Si ça ne fonctionne pas:**
```
Table 1:
❌ Aucune checkbox restaurée
```
→ Problème de restauration détecté

### Forcer la fusion des cellules

```javascript
diagnosticExamenCIA.forcerFusion()
```

**Utilisation:**
Si les cellules Question ou Ref_question ne sont pas fusionnées, cette commande force la fusion.

**Résultat attendu:**
```
🔧 FORCER LA FUSION

Table 1:
  Fusion colonne 0: "Q1.1"
  ✅ Colonne 0 fusionnée
  Fusion colonne 1: "Quelle est la principale responsabilité..."
  ✅ Colonne 1 fusionnée
```

### Forcer la restauration

```javascript
diagnosticExamenCIA.forcerRestauration()
```

**Utilisation:**
Si les checkboxes ne sont pas restaurées automatiquement, cette commande force la restauration.

**Résultat attendu:**
```
🔧 FORCER LA RESTAURATION
Tentative de restauration de 4 examen(s)
🎓 [Examen CIA] ✓ Checkbox restaurée: ligne 2, colonne 4
🎓 [Examen CIA] ✅ Examen exam-cia-... restauré (1 réponse(s))
```

### Afficher tout

```javascript
diagnosticExamenCIA.afficherTout()
```

Exécute `verifierSauvegarde()` et `verifierRestauration()` en une seule commande.

## 🐛 Scénarios de test

### Scénario 1: Test de fusion des cellules

**Étapes:**
1. Ouvrir la page de test
2. Regarder les tables
3. Vérifier visuellement si les colonnes Question et Ref_question sont fusionnées

**Résultat attendu:**
- Les cellules avec le même contenu doivent être fusionnées verticalement
- Le texte doit être centré

**Si ça ne fonctionne pas:**
```javascript
// Dans la console
diagnosticExamenCIA.forcerFusion()
```

### Scénario 2: Test de persistance simple

**Étapes:**
1. Cocher une checkbox dans la table 2 (ligne B)
2. Attendre 1 seconde
3. Exécuter: `diagnosticExamenCIA.verifierSauvegarde()`
4. Vérifier que la checkbox est sauvegardée
5. Actualiser la page (F5)
6. Exécuter: `diagnosticExamenCIA.verifierRestauration()`
7. Vérifier que la checkbox est restaurée

**Résultat attendu:**
- Avant actualisation: `✅ Données sauvegardées`
- Après actualisation: `✅ 1 checkbox(es) restaurée(s)`

### Scénario 3: Test de choix unique

**Étapes:**
1. Cocher la checkbox ligne A
2. Cocher la checkbox ligne B
3. Vérifier que la checkbox ligne A est automatiquement décochée

**Résultat attendu:**
- Une seule checkbox cochée à la fois par table

### Scénario 4: Test de persistance multiple

**Étapes:**
1. Cocher une checkbox dans la table 2
2. Cocher une checkbox dans la table 3
3. Cocher une checkbox dans la table 4
4. Attendre 1 seconde
5. Exécuter: `diagnosticExamenCIA.verifierSauvegarde()`
6. Actualiser la page
7. Exécuter: `diagnosticExamenCIA.verifierRestauration()`

**Résultat attendu:**
- 3 checkboxes sauvegardées
- 3 checkboxes restaurées après actualisation

## 📊 Interprétation des résultats

### Diagnostic automatique (après 3 secondes)

#### Section 1: Vérification du script
```
Script examen_cia chargé: true  ← ✅ OK
Examens sauvegardés: 2          ← Nombre d'examens en mémoire
```

#### Section 2: Vérification des tables
```
Nombre de tables d'examen: 4    ← Nombre de tables détectées

Table 1: exam-cia-1234567890-abc123
  En-têtes: ["Ref_question", "Question", "Option", "Reponse_user", ...]
  Checkboxes trouvées: 4        ← ✅ OK
  Cellules marquées comme fusionnées: 12  ← Cellules masquées
  Cellules avec rowspan: 2      ← Cellules fusionnées
    Cellule 1: rowspan=4, contenu="Q1.1"  ← ✅ Fusionnée
    Cellule 2: rowspan=4, contenu="Quelle est la principale..."  ← ✅ Fusionnée
```

#### Section 3: Vérification localStorage
```
Données trouvées dans localStorage:
  exam-cia-1234567890-abc123:
    Lignes: 4
    Dernière sauvegarde: 2024-01-15T10:30:00.000Z
    Checkboxes cochées: 1       ← ✅ Données sauvegardées
```

#### Section 4: Test de fusion
```
Table 1:
  Colonne 0: DEVRAIT être fusionnée
    Valeur: "Q1.1"
    Nombre de lignes: 4
    ✅ Fusionnée (rowspan=4)    ← ✅ OK

  Colonne 1: DEVRAIT être fusionnée
    Valeur: "Quelle est la principale..."
    Nombre de lignes: 4
    ❌ NON fusionnée            ← ⚠️ PROBLÈME DÉTECTÉ
```

## 🔍 Identification des problèmes

### Problème 1: Cellules Question non fusionnées

**Symptôme:**
```
Colonne 1: DEVRAIT être fusionnée
  ❌ NON fusionnée
```

**Cause possible:**
- La fonction `mergeColumnCells` ne s'exécute pas
- La condition `cellValue !== ""` échoue
- Les cellules ont des espaces différents

**Solution:**
```javascript
// Forcer la fusion
diagnosticExamenCIA.forcerFusion()
```

**Vérification:**
Regarder visuellement si les cellules sont maintenant fusionnées.

### Problème 2: Checkboxes non sauvegardées

**Symptôme:**
```
❌ Aucune donnée sauvegardée
```

**Cause possible:**
- La fonction `saveExamData` ne s'exécute pas
- Le `handleCheckboxChange` n'est pas déclenché
- localStorage est désactivé

**Solution:**
```javascript
// Vérifier localStorage
localStorage.setItem('test', 'test')
localStorage.getItem('test')  // Doit retourner 'test'

// Vérifier les événements
const checkbox = document.querySelector('.exam-cia-checkbox')
checkbox.addEventListener('change', () => {
  console.log('Checkbox changée!')
})
```

### Problème 3: Checkboxes non restaurées

**Symptôme:**
```
❌ Aucune checkbox restaurée
```

**Cause possible:**
- La restauration se fait trop tôt
- Les checkboxes n'existent pas encore
- L'ID de la table a changé

**Solution:**
```javascript
// Forcer la restauration
diagnosticExamenCIA.forcerRestauration()

// Vérifier les IDs
const tables = document.querySelectorAll('[data-exam-table-id]')
tables.forEach(t => console.log(t.dataset.examTableId))

// Vérifier localStorage
const data = JSON.parse(localStorage.getItem('claraverse_examen_cia'))
console.log('IDs sauvegardés:', Object.keys(data))
```

## 🛠️ Solutions rapides

### Solution 1: Réinitialiser complètement

```javascript
// Effacer toutes les données
localStorage.removeItem('claraverse_examen_cia')

// Recharger la page
location.reload()
```

### Solution 2: Forcer tout

```javascript
// Forcer la fusion
diagnosticExamenCIA.forcerFusion()

// Cocher une checkbox
const checkbox = document.querySelector('.exam-cia-checkbox')
checkbox.checked = true
checkbox.dispatchEvent(new Event('change'))

// Attendre 1 seconde
setTimeout(() => {
  // Vérifier
  diagnosticExamenCIA.verifierSauvegarde()
  
  // Recharger
  location.reload()
}, 1000)
```

### Solution 3: Debug manuel

```javascript
// Activer les logs détaillés
window.examenCIA.manager.constructor.prototype.debug = {
  log: console.log,
  error: console.error,
  warn: console.warn
}

// Retraiter les tables
window.examenCIA.manager.processAllTables()
```

## 📝 Rapport de diagnostic

Après avoir exécuté les tests, créez un rapport:

```javascript
// Copier ce code dans la console
console.log("=== RAPPORT DE DIAGNOSTIC ===")
console.log("Date:", new Date().toISOString())
console.log("\n1. Script chargé:", typeof window.examenCIA !== 'undefined')
console.log("2. Tables détectées:", document.querySelectorAll('[data-exam-table-id]').length)
console.log("3. Checkboxes:", document.querySelectorAll('.exam-cia-checkbox').length)
console.log("4. Cellules fusionnées:", document.querySelectorAll('[rowspan]').length)

const data = localStorage.getItem('claraverse_examen_cia')
if (data) {
  const parsed = JSON.parse(data)
  console.log("5. Examens sauvegardés:", Object.keys(parsed).length)
} else {
  console.log("5. Examens sauvegardés: 0")
}

diagnosticExamenCIA.verifierSauvegarde()
diagnosticExamenCIA.verifierRestauration()
```

## ✅ Checklist de vérification

- [ ] Le script `examen_cia.js` est chargé
- [ ] Les tables sont détectées (4 tables dans la page de test)
- [ ] Les checkboxes sont créées (4 par table)
- [ ] Les cellules Ref_question sont fusionnées
- [ ] Les cellules Question sont fusionnées
- [ ] Les colonnes Reponse_cia et Remarques sont masquées
- [ ] Cocher une checkbox décoche les autres
- [ ] Les données sont sauvegardées dans localStorage
- [ ] Après actualisation, les checkboxes sont restaurées

---

**Utilisez ce guide pour identifier et résoudre les problèmes de fusion et de persistance.**

Si les problèmes persistent après avoir suivi ce guide, partagez le rapport de diagnostic.
