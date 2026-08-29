# 🧪 Test de la Restauration Automatique

## ✅ Script Ajouté à index.html

Le script `restore-consolidations-button.js` a été ajouté à `index.html` après `conso.js`.

```html
<!-- Scripts utilisant le système de persistance -->
<script src="/menu.js"></script>
<script src="/conso.js"></script>

<!-- Bouton de restauration manuelle des consolidations (avec auto-restore) -->
<script src="/restore-consolidations-button.js"></script>
```

## 🔍 Diagnostic

### Étape 1: Ouvrir la Console
1. Appuyez sur `F12` pour ouvrir les DevTools
2. Allez dans l'onglet "Console"

### Étape 2: Vérifier le Chargement du Script
Vous devriez voir ce log au chargement:
```
✅ Script de restauration des consolidations chargé (avec auto-restore)
```

### Étape 3: Exécuter le Diagnostic
Copiez-collez ce code dans la console:

```javascript
// Diagnostic rapide
(function() {
    console.log('🔍 DIAGNOSTIC RAPIDE:');
    
    // 1. Script chargé?
    console.log('Script chargé:', typeof window.restoreConsolidationsManually === 'function' ? '✅' : '❌');
    
    // 2. Données disponibles?
    const data = localStorage.getItem('claraverse_tables_data');
    console.log('Données localStorage:', data ? '✅' : '❌');
    
    if (data) {
        const tables = JSON.parse(data);
        const consoTables = Object.keys(tables).filter(id => id.includes('conso_table'));
        const resultatTables = Object.keys(tables).filter(id => id.includes('resultat_table'));
        console.log(`Tables conso: ${consoTables.length}`);
        console.log(`Tables résultat: ${resultatTables.length}`);
    }
    
    // 3. Bouton visible?
    const btn = document.getElementById('restore-consolidations-btn');
    console.log('Bouton:', btn ? (btn.offsetParent !== null ? '✅ Visible' : '⚠️ Masqué') : '❌ Non trouvé');
})();
```

### Étape 4: Test Complet
Pour un diagnostic complet, chargez le script de diagnostic:

```javascript
// Dans la console
const script = document.createElement('script');
script.src = '/diagnostic-auto-restore.js';
document.body.appendChild(script);
```

## 🧪 Scénario de Test

### Test 1: Première Consolidation
1. **Créer une consolidation**
   - Utiliser une table modelisée
   - Attendre que les tables conso/résultat apparaissent

2. **Vérifier la sauvegarde**
   ```javascript
   // Dans la console
   const data = localStorage.getItem('claraverse_tables_data');
   console.log('Données sauvegardées:', data ? 'OUI' : 'NON');
   ```

3. **Recharger la page** (F5 ou Ctrl+R)

4. **Observer la console**
   - Après 1.5 secondes, vous devriez voir:
   ```
   🔄 Restauration automatique: X conso + Y résultat
   📍 Restauration table conso ...
   📍 Conteneur trouvé via messageId: ...
   ✅ Table conso ... restaurée dans le conteneur
   ✅ X table(s) restaurée(s) automatiquement
   ```

5. **Vérifier les tables**
   - Les tables conso/résultat doivent apparaître à leur position d'origine
   - Le bouton "🔄 Restaurer Consolidations" doit être masqué

### Test 2: Restauration Manuelle
1. **Effacer une table restaurée**
   - Supprimer manuellement une table du DOM

2. **Cliquer sur le bouton** (s'il est visible)
   - Ou exécuter: `window.restoreConsolidationsManually()`

3. **Vérifier**
   - Notification popup affichée
   - Table restaurée

### Test 3: Pas de Données
1. **Effacer localStorage**
   ```javascript
   localStorage.removeItem('claraverse_tables_data');
   ```

2. **Recharger la page**

3. **Observer la console**
   ```
   ℹ️ Aucune donnée à restaurer automatiquement
   ```

4. **Vérifier le bouton**
   - Doit être masqué (badge = 0)

## 🐛 Problèmes Possibles

### Problème 1: Script Non Chargé
**Symptôme**: `window.restoreConsolidationsManually` est `undefined`

**Solution**:
1. Vérifier que le script est dans `public/restore-consolidations-button.js`
2. Vérifier que `index.html` contient la ligne:
   ```html
   <script src="/restore-consolidations-button.js"></script>
   ```
3. Recharger la page avec cache vidé: `Ctrl+Shift+R`

### Problème 2: Pas de Restauration Automatique
**Symptôme**: Aucun log de restauration après 1.5s

**Causes possibles**:
1. Pas de données dans localStorage
   - Vérifier: `localStorage.getItem('claraverse_tables_data')`
2. Aucune table conso/résultat dans les données
   - Exécuter le diagnostic complet
3. Erreur JavaScript
   - Vérifier la console pour les erreurs en rouge

### Problème 3: Tables en Bas du Chat
**Symptôme**: Tables restaurées mais mal positionnées

**Causes possibles**:
1. MessageId non sauvegardé
   - Vérifier dans les données: `tableData.messageId`
2. Conteneur non trouvé
   - Logs: `⚠️ Conteneur avec messageId ... non trouvé, fallback...`

**Solution**: Recréer la consolidation pour capturer le messageId

## 📊 Logs Attendus

### Chargement Normal
```
✅ Script de restauration des consolidations chargé (avec auto-restore)
📦 1 table(s) trouvée(s) dans le stockage
✅ Bouton de restauration créé
```

### Restauration Automatique Réussie
```
🔄 Restauration automatique: 1 conso + 1 résultat
📊 Restauration de 1 table(s) conso et 1 table(s) résultat
📍 Restauration table conso conso_table_xxx avec messageId: msg_xxx
📍 Conteneur trouvé via messageId: msg_xxx
✅ Table conso conso_table_xxx restaurée dans le conteneur
📍 Restauration table résultat resultat_table_xxx avec messageId: msg_xxx
📍 Conteneur trouvé via messageId: msg_xxx
✅ Table résultat resultat_table_xxx restaurée dans le conteneur
✅ 2 table(s) restaurée(s) automatiquement
```

### Pas de Données
```
✅ Script de restauration des consolidations chargé (avec auto-restore)
ℹ️ Aucune donnée à restaurer automatiquement
```

## ✅ Checklist de Validation

- [ ] Script chargé (log dans console)
- [ ] Fonction `window.restoreConsolidationsManually` disponible
- [ ] Données dans localStorage
- [ ] Restauration automatique après 1.5s
- [ ] Tables apparaissent au bon endroit
- [ ] Bouton masqué après restauration
- [ ] Restauration manuelle fonctionne
- [ ] Pas d'erreurs dans la console

## 🎯 Résultat Attendu

Après avoir rechargé la page:
1. ⏱️ Attendre 1.5 secondes
2. ✅ Tables conso/résultat apparaissent automatiquement
3. ✅ Positionnées au bon endroit (même message)
4. ✅ Bouton masqué
5. ✅ Aucune notification popup
6. ✅ Logs dans la console uniquement
