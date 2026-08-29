# 🔧 Dépannage - Persistance CIA

## Test rapide

### Étape 1: Ouvrir la page de test minimale

```bash
# Ouvrir dans le navigateur
public/test-cia-minimal.html
```

### Étape 2: Ouvrir la console (F12)

Vérifier les messages affichés.

### Étape 3: Identifier le problème

Utilisez ce guide pour identifier et résoudre le problème.

## Problèmes courants

### ❌ Problème 1: Script non chargé

**Symptômes:**
- Aucun message dans la console
- Pas de checkboxes dans les tables
- Colonnes non masquées

**Vérification:**
```javascript
// Console (F12)
console.log("Script chargé:", typeof window !== 'undefined');
```

**Solution:**
1. Vérifier que le script est bien chargé dans index.html:
   ```html
   <script src="public/menu_alpha_localstorage.js"></script>
   ```

2. Vérifier qu'il n'y a pas d'erreur JavaScript dans la console

3. Vérifier le chemin du fichier

### ❌ Problème 2: Tables non détectées

**Symptômes:**
- Script chargé mais aucune table CIA détectée
- Message: "0 table(s) CIA détectée(s)"

**Vérification:**
```javascript
// Console (F12)
const tables = document.querySelectorAll("table");
console.log(`${tables.length} table(s) totale(s)`);

tables.forEach((table, i) => {
    const headers = Array.from(table.querySelectorAll("th"))
        .map(h => h.textContent.trim());
    console.log(`Table ${i + 1}:`, headers);
});
```

**Solution:**
1. Vérifier que les tables ont une colonne "Reponse_user" (ou variation)
2. Vérifier l'orthographe exacte
3. Variations acceptées:
   - "reponse_user"
   - "reponse user"
   - "réponse_user"
   - "réponse user"

### ❌ Problème 3: Checkboxes non créées

**Symptômes:**
- Tables détectées mais pas de checkboxes
- Colonne "Reponse_user" vide

**Vérification:**
```javascript
// Console (F12)
const ciaTables = document.querySelectorAll("table[data-cia-table='true']");
console.log(`${ciaTables.length} table(s) CIA`);

ciaTables.forEach((table, i) => {
    const checkboxes = table.querySelectorAll(".cia-checkbox");
    console.log(`Table ${i + 1}: ${checkboxes.length} checkbox(es)`);
});
```

**Solution:**
1. Attendre 3 secondes après le chargement de la page
2. Vérifier qu'il n'y a pas d'erreur dans la console
3. Relancer le diagnostic:
   ```javascript
   window.diagnosticCIADebug();
   ```

### ❌ Problème 4: Checkboxes non sauvegardées

**Symptômes:**
- Checkboxes présentes mais non sauvegardées
- Après actualisation, checkboxes décochées

**Vérification:**
```javascript
// Console (F12)
// Cocher une checkbox puis:
const keys = Object.keys(localStorage).filter(k => k.includes('cia_checkboxes'));
console.log(`${keys.length} sauvegarde(s)`);

if (keys.length > 0) {
    keys.forEach(key => {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(key, data);
    });
}
```

**Solution:**
1. Vérifier que localStorage est activé:
   ```javascript
   try {
       localStorage.setItem('test', 'test');
       localStorage.removeItem('test');
       console.log('✅ localStorage activé');
   } catch (e) {
       console.log('❌ localStorage désactivé:', e);
   }
   ```

2. Vérifier que l'événement 'change' est bien écouté:
   ```javascript
   const checkbox = document.querySelector('.cia-checkbox');
   if (checkbox) {
       checkbox.addEventListener('change', () => {
           console.log('✅ Événement change déclenché');
       });
   }
   ```

3. Vérifier qu'il n'y a pas d'erreur lors de la sauvegarde

### ❌ Problème 5: Checkboxes non restaurées

**Symptômes:**
- Checkboxes sauvegardées mais non restaurées
- localStorage contient les données mais checkboxes décochées

**Vérification:**
```javascript
// Console (F12)
const table = document.querySelector("table[data-cia-table='true']");
if (table) {
    const tableId = table.dataset.ciaTableId;
    console.log('Table ID:', tableId);
    
    const savedData = localStorage.getItem(`cia_checkboxes_${tableId}`);
    console.log('Données sauvegardées:', savedData);
    
    const checkboxes = table.querySelectorAll('.cia-checkbox');
    console.log('Checkboxes trouvées:', checkboxes.length);
}
```

**Solution:**
1. Vérifier que les IDs de table correspondent:
   ```javascript
   const table = document.querySelector("table[data-cia-table='true']");
   const tableId = table.dataset.ciaTableId;
   const lsKeys = Object.keys(localStorage).filter(k => k.includes('cia_checkboxes'));
   console.log('Table ID:', tableId);
   console.log('localStorage keys:', lsKeys);
   ```

2. Augmenter le délai de restauration dans le script:
   ```javascript
   // Dans menu_alpha_localstorage.js, ligne ~450
   setTimeout(() => {
       restoreCIACheckboxes(table);
   }, 2000); // Augmenter à 2000ms
   ```

3. Forcer la restauration manuellement:
   ```javascript
   const table = document.querySelector("table[data-cia-table='true']");
   const tableId = table.dataset.ciaTableId;
   const savedData = localStorage.getItem(`cia_checkboxes_${tableId}`);
   if (savedData) {
       const data = JSON.parse(savedData);
       const checkboxes = table.querySelectorAll('.cia-checkbox');
       data.checkboxStates.forEach(state => {
           const cb = Array.from(checkboxes).find(
               c => parseInt(c.dataset.rowIndex) === state.rowIndex
           );
           if (cb) cb.checked = state.checked;
       });
   }
   ```

## Diagnostic automatique

### Lancer le diagnostic complet

```javascript
// Console (F12)
window.diagnosticCIADebug();
```

### Interpréter les résultats

Le diagnostic affiche:
1. Scripts chargés
2. Tables détectées
3. État de localStorage
4. Test de sauvegarde
5. Événements
6. Recommandations

### Exemple de résultat OK

```
========================================
📊 DIAGNOSTIC DÉTAILLÉ CIA
========================================

1️⃣ Scripts chargés:
   ✅ menu_alpha_localstorage.js

2️⃣ Tables détectées:
   📊 1 table(s) totale(s)
   
   Table 1:
      En-têtes: Question, Option, Reponse_user
      Table CIA: ✅ OUI
      data-cia-table: true
      data-cia-table-id: cia_table_0_Question_Option_Reponse_user_3x3
      Checkboxes: 3
      Cochées: 1

3️⃣ localStorage:
   💾 1 entrée(s) CIA
   
   📦 cia_checkboxes_cia_table_0_Question_Option_Reponse_user_3x3:
      - 3 checkbox(es)
      - 1 cochée(s)
      - Timestamp: [date]

6️⃣ Recommandations:
   ✅ Aucun problème détecté

========================================
✅ Diagnostic terminé
========================================
```

## Commandes utiles

### Afficher toutes les données CIA

```javascript
Object.keys(localStorage)
    .filter(k => k.includes('cia'))
    .forEach(k => {
        console.log(k);
        console.log(localStorage.getItem(k));
    });
```

### Vider le cache CIA

```javascript
Object.keys(localStorage)
    .filter(k => k.includes('cia'))
    .forEach(k => localStorage.removeItem(k));
console.log('✅ Cache vidé');
location.reload();
```

### Forcer la sauvegarde

```javascript
const table = document.querySelector("table[data-cia-table='true']");
if (table) {
    const tableId = table.dataset.ciaTableId || 'test';
    const checkboxes = table.querySelectorAll('.cia-checkbox');
    const states = Array.from(checkboxes).map((cb, i) => ({
        rowIndex: i,
        checked: cb.checked
    }));
    
    localStorage.setItem(`cia_checkboxes_${tableId}`, JSON.stringify({
        tableId: tableId,
        checkboxStates: states,
        timestamp: Date.now()
    }));
    
    console.log('✅ Sauvegarde forcée');
}
```

### Forcer la restauration

```javascript
const table = document.querySelector("table[data-cia-table='true']");
if (table) {
    const tableId = table.dataset.ciaTableId;
    const savedData = localStorage.getItem(`cia_checkboxes_${tableId}`);
    if (savedData) {
        const data = JSON.parse(savedData);
        const checkboxes = table.querySelectorAll('.cia-checkbox');
        data.checkboxStates.forEach(state => {
            const cb = Array.from(checkboxes)[state.rowIndex];
            if (cb) cb.checked = state.checked;
        });
        console.log('✅ Restauration forcée');
    }
}
```

## Cas spécifiques

### Tables générées dynamiquement (Flowise)

Si les tables sont générées après le chargement de la page:

1. Vérifier que l'observer est actif:
   ```javascript
   console.log('Observer actif');
   ```

2. Attendre que la table soit ajoutée au DOM

3. Le script devrait détecter automatiquement la nouvelle table

### Tables dans des iframes

Le script ne fonctionne pas dans les iframes. Solution:

1. Charger le script dans l'iframe également
2. Ou déplacer les tables hors de l'iframe

### Navigation SPA (Single Page Application)

Si vous utilisez React/Vue/Angular:

1. Le script doit être rechargé à chaque changement de page
2. Ou utiliser un système de persistance global

## Support

Si le problème persiste après avoir suivi ce guide:

1. Ouvrir `public/test-cia-minimal.html`
2. Cliquer sur "📋 Afficher le log"
3. Copier le contenu du log
4. Partager le log pour analyse

---

**Dernière mise à jour:** 24 novembre 2025
