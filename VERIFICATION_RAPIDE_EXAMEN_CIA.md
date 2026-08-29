# ✅ Vérification Rapide - Examen CIA

## 🎉 Bonne nouvelle !

Les scripts se chargent maintenant ! Vous voyez les commandes disponibles dans la console.

## 🔍 Vérification immédiate

### Dans la console, exécutez:

```javascript
// 1. Vérifier que les scripts sont chargés
console.log("examenCIA:", typeof window.examenCIA);
console.log("diagnosticExamenCIA:", typeof window.diagnosticExamenCIA);

// 2. Vérifier les tables
const tables = document.querySelectorAll('[data-exam-table-id]');
console.log("Tables détectées:", tables.length);

// 3. Vérifier les checkboxes
const checkboxes = document.querySelectorAll('.exam-cia-checkbox');
console.log("Checkboxes:", checkboxes.length);

// 4. Vérifier la fusion
const rowspanCells = document.querySelectorAll('[rowspan]');
console.log("Cellules fusionnées:", rowspanCells.length);
```

## 📊 Résultats attendus

```
examenCIA: object
diagnosticExamenCIA: object
Tables détectées: 4
Checkboxes: 16 (4 par table)
Cellules fusionnées: 8 (2 par table: Ref_question + Question)
```

## 🧪 Tests à effectuer

### Test 1: Fusion des cellules

**Commande:**
```javascript
diagnosticExamenCIA.forcerFusion()
```

**Résultat attendu:**
- Les cellules "Ref_question" et "Question" doivent être fusionnées visuellement
- Le texte doit être centré

### Test 2: Sauvegarde

**Étapes:**
1. Cocher une checkbox dans une table
2. Attendre 1 seconde
3. Exécuter:
```javascript
diagnosticExamenCIA.verifierSauvegarde()
```

**Résultat attendu:**
```
🔍 VÉRIFICATION SAUVEGARDE
✅ Données sauvegardées: {...}
  ✓ Checkbox cochée: ligne X, colonne Y
Total checkboxes cochées: 1
```

### Test 3: Restauration

**Étapes:**
1. Actualiser la page (F5)
2. Attendre 3 secondes
3. Exécuter:
```javascript
diagnosticExamenCIA.verifierRestauration()
```

**Résultat attendu:**
```
🔍 VÉRIFICATION RESTAURATION

Table 1:
  ✓ Checkbox X cochée
✅ 1 checkbox(es) restaurée(s)
```

## 🐛 Si les problèmes persistent

### Problème 1: Tables non détectées (0 tables)

**Solution:**
```javascript
// Attendre que les tables soient créées
setTimeout(() => {
    const tables = document.querySelectorAll('[data-exam-table-id]');
    console.log("Tables après délai:", tables.length);
}, 5000);
```

### Problème 2: Checkboxes non créées

**Solution:**
```javascript
// Forcer le retraitement
if (window.examenCIA && window.examenCIA.manager) {
    window.examenCIA.manager.processAllTables();
    console.log("✅ Tables retraitées");
}
```

### Problème 3: Fusion ne fonctionne pas

**Solution:**
```javascript
diagnosticExamenCIA.forcerFusion()
```

### Problème 4: Persistance ne fonctionne pas

**Solution:**
```javascript
// Vérifier localStorage
const data = localStorage.getItem('claraverse_examen_cia');
if (data) {
    console.log("✅ Données trouvées:", JSON.parse(data));
} else {
    console.log("❌ Aucune donnée dans localStorage");
}
```

## 📝 Rapport complet

Pour obtenir un rapport complet, exécutez:

```javascript
console.log("=== RAPPORT COMPLET ===");

// 1. Scripts
console.log("\n1. SCRIPTS");
console.log("  examenCIA:", typeof window.examenCIA);
console.log("  diagnosticExamenCIA:", typeof window.diagnosticExamenCIA);

// 2. Tables
console.log("\n2. TABLES");
const tables = document.querySelectorAll('[data-exam-table-id]');
console.log("  Détectées:", tables.length);
tables.forEach((t, i) => {
    console.log(`  Table ${i + 1}:`, t.dataset.examTableId);
});

// 3. Checkboxes
console.log("\n3. CHECKBOXES");
const checkboxes = document.querySelectorAll('.exam-cia-checkbox');
console.log("  Total:", checkboxes.length);
const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
console.log("  Cochées:", checkedCount);

// 4. Fusion
console.log("\n4. FUSION");
const rowspanCells = document.querySelectorAll('[rowspan]');
console.log("  Cellules fusionnées:", rowspanCells.length);
rowspanCells.forEach((cell, i) => {
    console.log(`  ${i + 1}. rowspan=${cell.rowSpan}, "${cell.textContent.trim().substring(0, 30)}..."`);
});

// 5. localStorage
console.log("\n5. LOCALSTORAGE");
const data = localStorage.getItem('claraverse_examen_cia');
if (data) {
    const parsed = JSON.parse(data);
    console.log("  Examens sauvegardés:", Object.keys(parsed).length);
} else {
    console.log("  Aucune donnée");
}

console.log("\n=== FIN DU RAPPORT ===");
```

## ✅ Checklist

- [ ] Scripts chargés (examenCIA et diagnosticExamenCIA définis)
- [ ] Tables détectées (4 tables)
- [ ] Checkboxes créées (16 checkboxes)
- [ ] Cellules fusionnées (8 cellules avec rowspan)
- [ ] Sauvegarde fonctionne (données dans localStorage)
- [ ] Restauration fonctionne (checkboxes restaurées après F5)

## 🎯 Prochaines étapes

1. ✅ Exécuter les vérifications ci-dessus
2. ✅ Tester la fusion avec `diagnosticExamenCIA.forcerFusion()`
3. ✅ Tester la sauvegarde en cochant une checkbox
4. ✅ Tester la restauration en actualisant la page
5. ✅ Partager les résultats si des problèmes persistent

---

**Les scripts sont maintenant chargés ! Suivez les tests ci-dessus pour vérifier que tout fonctionne correctement.**
