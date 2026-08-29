# ⚡ Action Immédiate - Diagnostic Examen CIA

## 🎯 Les deux problèmes persistent

1. **Les cellules Question ne sont pas fusionnées**
2. **Les checkboxes ne sont pas persistantes après actualisation**

## 🔧 Solution: Utiliser le diagnostic

J'ai créé un script de diagnostic complet pour identifier précisément les problèmes.

## 🚀 Étapes à suivre MAINTENANT

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Ouvrir la page de test

```
http://localhost:5173/test-examen-cia.html
```

### 3. Ouvrir la console (F12)

Appuyer sur **F12** pour ouvrir les outils de développement.

### 4. Attendre 3 secondes

Le diagnostic s'exécute automatiquement et affiche:

```
🔍 DIAGNOSTIC EXAMEN CIA - Démarrage

=== 1. VÉRIFICATION DU SCRIPT ===
=== 2. VÉRIFICATION DES TABLES ===
=== 3. VÉRIFICATION LOCALSTORAGE ===
=== 4. TEST DE FUSION ===
=== 5. TEST DE PERSISTANCE ===
```

### 5. Analyser les résultats

Cherchez les lignes avec ❌ qui indiquent les problèmes.

## 🔍 Tests à effectuer

### Test 1: Fusion des cellules

**Dans la console:**
```javascript
diagnosticExamenCIA.forcerFusion()
```

**Résultat attendu:**
Les cellules Question et Ref_question doivent être fusionnées visuellement.

### Test 2: Persistance

**Étapes:**
1. Cocher une checkbox
2. Attendre 1 seconde
3. Dans la console:
```javascript
diagnosticExamenCIA.verifierSauvegarde()
```

**Résultat attendu:**
```
✅ Données sauvegardées: {...}
  ✓ Checkbox cochée: ligne X, colonne Y
```

4. Actualiser la page (F5)
5. Dans la console:
```javascript
diagnosticExamenCIA.verifierRestauration()
```

**Résultat attendu:**
```
✅ 1 checkbox(es) restaurée(s)
```

## 📊 Commandes disponibles

```javascript
// Vérifier la sauvegarde
diagnosticExamenCIA.verifierSauvegarde()

// Vérifier la restauration
diagnosticExamenCIA.verifierRestauration()

// Forcer la fusion des cellules
diagnosticExamenCIA.forcerFusion()

// Forcer la restauration
diagnosticExamenCIA.forcerRestauration()

// Tout afficher
diagnosticExamenCIA.afficherTout()
```

## 🐛 Si les problèmes persistent

### Problème 1: Fusion ne fonctionne pas

**Copier ce code dans la console:**
```javascript
// Vérifier les tables
const tables = document.querySelectorAll('[data-exam-table-id]');
console.log('Nombre de tables:', tables.length);

tables.forEach((table, i) => {
  const tbody = table.querySelector('tbody') || table;
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.querySelector('th'));
  console.log(`Table ${i + 1}: ${rows.length} lignes`);
  
  if (rows.length > 0) {
    const firstRow = rows[0];
    const cells = firstRow.querySelectorAll('td');
    console.log(`  Colonnes:`, Array.from(cells).map(c => c.textContent.trim().substring(0, 20)));
  }
});
```

**Partager le résultat.**

### Problème 2: Persistance ne fonctionne pas

**Copier ce code dans la console:**
```javascript
// Test localStorage
try {
  localStorage.setItem('test', 'test');
  const result = localStorage.getItem('test');
  localStorage.removeItem('test');
  console.log('localStorage fonctionne:', result === 'test');
} catch (e) {
  console.error('localStorage ne fonctionne pas:', e);
}

// Vérifier les données
const data = localStorage.getItem('claraverse_examen_cia');
if (data) {
  console.log('Données trouvées:', JSON.parse(data));
} else {
  console.log('Aucune donnée dans localStorage');
}

// Vérifier les checkboxes
const checkboxes = document.querySelectorAll('.exam-cia-checkbox');
console.log('Checkboxes trouvées:', checkboxes.length);

checkboxes.forEach((cb, i) => {
  console.log(`Checkbox ${i + 1}:`, {
    checked: cb.checked,
    hasChangeListener: cb.onchange !== null
  });
});
```

**Partager le résultat.**

## 📝 Créer un rapport

**Copier ce code dans la console:**
```javascript
console.log("=== RAPPORT DIAGNOSTIC EXAMEN CIA ===");
console.log("Date:", new Date().toISOString());
console.log("\n1. SCRIPT");
console.log("  - Chargé:", typeof window.examenCIA !== 'undefined');
console.log("  - Manager:", typeof window.examenCIA?.manager !== 'undefined');

console.log("\n2. TABLES");
const tables = document.querySelectorAll('[data-exam-table-id]');
console.log("  - Détectées:", tables.length);
console.log("  - IDs:", Array.from(tables).map(t => t.dataset.examTableId));

console.log("\n3. CHECKBOXES");
const checkboxes = document.querySelectorAll('.exam-cia-checkbox');
console.log("  - Trouvées:", checkboxes.length);
const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
console.log("  - Cochées:", checkedCount);

console.log("\n4. FUSION");
const rowspanCells = document.querySelectorAll('[rowspan]');
console.log("  - Cellules fusionnées:", rowspanCells.length);
rowspanCells.forEach((cell, i) => {
  console.log(`    ${i + 1}. rowspan=${cell.rowSpan}, contenu="${cell.textContent.trim().substring(0, 30)}..."`);
});

console.log("\n5. LOCALSTORAGE");
const data = localStorage.getItem('claraverse_examen_cia');
if (data) {
  const parsed = JSON.parse(data);
  console.log("  - Examens sauvegardés:", Object.keys(parsed).length);
  Object.keys(parsed).forEach(key => {
    let checkedInStorage = 0;
    if (parsed[key].rows) {
      parsed[key].rows.forEach(row => {
        row.forEach(cell => {
          if (cell.type === 'checkbox' && cell.checked) checkedInStorage++;
        });
      });
    }
    console.log(`    ${key}: ${checkedInStorage} checkbox(es) cochée(s)`);
  });
} else {
  console.log("  - Aucune donnée");
}

console.log("\n=== FIN DU RAPPORT ===");
```

**Copier tout le résultat et le partager.**

## 📚 Documentation

- **Guide complet**: `DIAGNOSTIC_EXAMEN_CIA_GUIDE.md`
- **Script de diagnostic**: `public/diagnostic-examen-cia.js`
- **Page de test**: `public/test-examen-cia.html`

## ✅ Prochaines étapes

1. ✅ Exécuter le diagnostic automatique (attendre 3 secondes)
2. ✅ Tester la fusion: `diagnosticExamenCIA.forcerFusion()`
3. ✅ Tester la persistance: cocher → vérifier → actualiser → vérifier
4. ✅ Créer le rapport de diagnostic
5. ✅ Partager les résultats

---

**Le diagnostic est maintenant en place. Suivez les étapes ci-dessus pour identifier précisément les problèmes.**
