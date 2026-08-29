# ⚡ Test Immédiat - Examen CIA

## 🚨 Problème détecté

Les scripts ne se chargent pas correctement:
```
Uncaught ReferenceError: diagnosticExamenCIA is not defined
Cannot read properties of undefined (reading 'getInfo')
```

## ✅ Solution: Test simple

J'ai créé une page de test simplifiée pour diagnostiquer le problème.

## 🚀 Étapes à suivre MAINTENANT

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Ouvrir la page de test simple

```
http://localhost:5173/test-simple-examen.html
```

### 3. Ouvrir la console (F12)

Vous devriez voir:

```
=== TEST SIMPLE EXAMEN CIA ===
✅ window.examenCIA est défini
API disponible: ["manager", "exportData", "clearData", "getInfo", "debug"]
✅ window.diagnosticExamenCIA est défini
✅ 1 table(s) détectée(s)
Table 1: exam-cia-1234567890-abc123
  Checkboxes: 4

=== COMMANDES DISPONIBLES ===
window.examenCIA.debug()
window.examenCIA.getInfo()
diagnosticExamenCIA.forcerFusion()
diagnosticExamenCIA.verifierSauvegarde()
```

### 4. Vérifier le statut en haut à droite

Vous devriez voir:
- Script: ✅ Chargé
- Diagnostic: ✅ Chargé
- Tables: ✅ 1 détectée(s)

## 🔍 Si les scripts ne se chargent toujours pas

### Vérification 1: Erreurs dans la console

Cherchez des erreurs de type:
- `Failed to load resource`
- `404 Not Found`
- `SyntaxError`

### Vérification 2: Chemins des fichiers

Dans la console, exécutez:

```javascript
// Vérifier si les fichiers sont accessibles
fetch('/examen_cia.js')
  .then(r => console.log('examen_cia.js:', r.status))
  .catch(e => console.error('examen_cia.js:', e));

fetch('/diagnostic-examen-cia.js')
  .then(r => console.log('diagnostic-examen-cia.js:', r.status))
  .catch(e => console.error('diagnostic-examen-cia.js:', e));
```

**Résultat attendu:**
```
examen_cia.js: 200
diagnostic-examen-cia.js: 200
```

### Vérification 3: Ordre de chargement

Les scripts doivent se charger dans cet ordre:
1. `examen_cia.js` (définit `window.examenCIA`)
2. `diagnostic-examen-cia.js` (définit `window.diagnosticExamenCIA`)

## 🐛 Diagnostic des problèmes

### Problème 1: Scripts ne se chargent pas (404)

**Cause:** Les fichiers ne sont pas dans le bon dossier ou le serveur ne les trouve pas.

**Solution:**
```bash
# Vérifier que les fichiers existent
ls public/examen_cia.js
ls public/diagnostic-examen-cia.js
```

### Problème 2: Scripts se chargent mais variables non définies

**Cause:** Erreur JavaScript qui empêche l'exécution complète du script.

**Solution:** Ouvrir la console et chercher les erreurs JavaScript.

### Problème 3: Scripts se chargent trop tard

**Cause:** Les scripts se chargent après que le code essaie de les utiliser.

**Solution:** Utiliser `setTimeout` ou attendre l'événement `DOMContentLoaded`.

## 🔧 Solutions de contournement

### Solution 1: Charger les scripts en ligne

Si les fichiers externes ne se chargent pas, copiez le contenu directement dans la page HTML:

```html
<script>
// Contenu de examen_cia.js ici
</script>

<script>
// Contenu de diagnostic-examen-cia.js ici
</script>
```

### Solution 2: Utiliser des modules ES6

Modifier les scripts pour utiliser des modules:

```html
<script type="module">
import { ExamenCIAManager } from '/examen_cia.js';
// ...
</script>
```

### Solution 3: Vérifier la configuration Vite

Dans `vite.config.ts`, vérifier que le dossier `public` est correctement configuré.

## 📊 Test manuel

Si les scripts ne se chargent toujours pas, testez manuellement dans la console:

```javascript
// Test 1: Créer une checkbox manuellement
const table = document.querySelector('table');
const cell = table.querySelector('tbody tr:first-child td:nth-child(4)');
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.style.cssText = 'width: 20px; height: 20px; display: block; margin: 0 auto;';
cell.innerHTML = '';
cell.appendChild(checkbox);
console.log('✅ Checkbox créée');

// Test 2: Fusionner les cellules manuellement
const tbody = table.querySelector('tbody');
const rows = Array.from(tbody.querySelectorAll('tr'));

// Fusionner colonne 0 (Ref_question)
const firstCell = rows[0].querySelectorAll('td')[0];
firstCell.rowSpan = rows.length;
firstCell.style.verticalAlign = 'middle';
firstCell.style.textAlign = 'center';
firstCell.style.fontWeight = 'bold';

for (let i = 1; i < rows.length; i++) {
    rows[i].querySelectorAll('td')[0].style.display = 'none';
}

// Fusionner colonne 1 (Question)
const secondCell = rows[0].querySelectorAll('td')[1];
secondCell.rowSpan = rows.length;
secondCell.style.verticalAlign = 'middle';
secondCell.style.textAlign = 'center';
secondCell.style.fontWeight = 'bold';

for (let i = 1; i < rows.length; i++) {
    rows[i].querySelectorAll('td')[1].style.display = 'none';
}

console.log('✅ Cellules fusionnées');

// Test 3: Sauvegarder dans localStorage
const data = {
    'test-table': {
        checkboxes: [false, true, false, false],
        lastSaved: new Date().toISOString()
    }
};
localStorage.setItem('claraverse_examen_cia', JSON.stringify(data));
console.log('✅ Données sauvegardées');

// Test 4: Vérifier localStorage
const saved = localStorage.getItem('claraverse_examen_cia');
console.log('Données:', JSON.parse(saved));
```

## 📝 Rapport à partager

Si le problème persiste, copiez ce code dans la console et partagez le résultat:

```javascript
console.log("=== RAPPORT DIAGNOSTIC ===");
console.log("URL:", window.location.href);
console.log("User Agent:", navigator.userAgent);

console.log("\n1. SCRIPTS");
console.log("  examenCIA:", typeof window.examenCIA);
console.log("  diagnosticExamenCIA:", typeof window.diagnosticExamenCIA);

console.log("\n2. FICHIERS");
Promise.all([
    fetch('/examen_cia.js').then(r => ({file: 'examen_cia.js', status: r.status})),
    fetch('/diagnostic-examen-cia.js').then(r => ({file: 'diagnostic-examen-cia.js', status: r.status}))
]).then(results => {
    results.forEach(r => console.log(`  ${r.file}: ${r.status}`));
});

console.log("\n3. DOM");
console.log("  Tables:", document.querySelectorAll('table').length);
console.log("  Tables avec ID:", document.querySelectorAll('[data-exam-table-id]').length);
console.log("  Checkboxes:", document.querySelectorAll('.exam-cia-checkbox').length);

console.log("\n4. ERREURS");
// Les erreurs s'affichent automatiquement dans la console

console.log("\n=== FIN DU RAPPORT ===");
```

## ✅ Prochaines étapes

1. ✅ Ouvrir `http://localhost:5173/test-simple-examen.html`
2. ✅ Vérifier le statut en haut à droite
3. ✅ Ouvrir la console et vérifier les logs
4. ✅ Si ça ne fonctionne pas, créer le rapport de diagnostic
5. ✅ Partager le rapport

---

**Cette page de test simple devrait permettre d'identifier précisément pourquoi les scripts ne se chargent pas.**
