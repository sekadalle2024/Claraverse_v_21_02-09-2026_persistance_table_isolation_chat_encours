# 🐛 Debug Restauration Automatique - MAINTENANT

## 🎯 Modifications Appliquées

### 1. Logs Améliorés
Le script affiche maintenant des logs détaillés à chaque étape:

```javascript
🚀 [RESTORE-BUTTON] Script chargé et initialisé
⏱️ Restauration automatique programmée dans 2 secondes...
🔍 Vérification des données à restaurer...
✅ Données trouvées dans localStorage
📦 X table(s) au total
📊 Tables trouvées: X conso + Y résultat
🔄 Lancement de la restauration automatique...
```

### 2. Délai Augmenté
- Avant: 1.5 secondes
- Maintenant: 2 secondes
- Raison: Laisser plus de temps aux tables modelisées de se charger

## 🧪 Test Immédiat

### Étape 1: Ouvrir la Console
1. Appuyez sur `F12`
2. Allez dans l'onglet "Console"
3. Rechargez la page (`F5` ou `Ctrl+R`)

### Étape 2: Vérifier les Logs
Vous devriez voir **immédiatement** au chargement:
```
🚀 [RESTORE-BUTTON] Script chargé et initialisé
```

Si vous ne voyez PAS ce log:
- ❌ Le script n'est pas chargé
- Solution: Vérifier que `index.html` contient bien:
  ```html
  <script src="/restore-consolidations-button.js"></script>
  ```
- Vider le cache: `Ctrl+Shift+R`

### Étape 3: Attendre 2 Secondes
Après 2 secondes, vous devriez voir:
```
⏱️ Restauration automatique programmée dans 2 secondes...
🔍 Vérification des données à restaurer...
```

Puis soit:
- ✅ `✅ Données trouvées dans localStorage` → Restauration lancée
- ℹ️ `ℹ️ Aucune donnée à restaurer automatiquement` → Pas de données

## 🔍 Diagnostic Rapide

### Test 1: Script Chargé?
Copiez dans la console:
```javascript
console.log('Script chargé?', typeof window.restoreConsolidationsManually === 'function' ? '✅ OUI' : '❌ NON');
```

### Test 2: Données Présentes?
Copiez dans la console:
```javascript
const data = localStorage.getItem('claraverse_tables_data');
if (data) {
    const tables = JSON.parse(data);
    const consoTables = Object.keys(tables).filter(id => id.includes('conso_table'));
    const resultatTables = Object.keys(tables).filter(id => id.includes('resultat_table'));
    console.log(`✅ Données: ${consoTables.length} conso + ${resultatTables.length} résultat`);
} else {
    console.log('❌ Aucune donnée');
}
```

### Test 3: Forcer la Restauration
Copiez dans la console:
```javascript
window.restoreConsolidationsManually();
```

## 📄 Page de Test Dédiée

Ouvrez cette page pour un diagnostic complet:
```
http://localhost:VOTRE_PORT/test-auto-restore-simple.html
```

Cette page permet de:
- ✅ Vérifier si le script est chargé
- ✅ Voir l'état de localStorage
- ✅ Créer des données de test
- ✅ Tester la restauration manuellement
- ✅ Voir tous les logs en temps réel

## 🐛 Problèmes Possibles

### Problème 1: Aucun Log au Chargement
**Symptôme**: Pas de `🚀 [RESTORE-BUTTON] Script chargé`

**Causes**:
1. Script pas dans `index.html`
2. Chemin incorrect
3. Cache navigateur

**Solutions**:
```bash
# 1. Vérifier le fichier existe
ls public/restore-consolidations-button.js

# 2. Vider le cache
Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)

# 3. Vérifier index.html
grep "restore-consolidations-button" index.html
```

### Problème 2: Script Chargé mais Pas de Restauration
**Symptôme**: Log `🚀` visible mais pas de restauration

**Causes**:
1. Pas de données dans localStorage
2. Données mal formatées
3. Erreur JavaScript

**Solutions**:
```javascript
// Vérifier localStorage
localStorage.getItem('claraverse_tables_data')

// Créer des données de test
const fakeData = {
    'conso_table_test': {
        timestamp: Date.now(),
        cells: [{ row: 0, col: 0, value: 'Test' }],
        headers: ['Test'],
        messageId: 'msg_test'
    }
};
localStorage.setItem('claraverse_tables_data', JSON.stringify(fakeData));

// Recharger
location.reload();
```

### Problème 3: Erreur JavaScript
**Symptôme**: Logs en rouge dans la console

**Solution**:
1. Copier l'erreur complète
2. Vérifier la ligne mentionnée
3. Partager l'erreur pour analyse

## ✅ Checklist de Validation

Cochez au fur et à mesure:

- [ ] Console ouverte (F12)
- [ ] Page rechargée (F5)
- [ ] Log `🚀 [RESTORE-BUTTON] Script chargé` visible
- [ ] Après 2s: Log `⏱️ Restauration automatique programmée`
- [ ] Log `🔍 Vérification des données`
- [ ] Soit `✅ Données trouvées` soit `ℹ️ Aucune donnée`
- [ ] Si données: `🔄 Lancement de la restauration`
- [ ] Tables apparaissent dans le chat
- [ ] Pas d'erreurs en rouge

## 🎯 Résultat Attendu

### Si Données Présentes
```
🚀 [RESTORE-BUTTON] Script chargé et initialisé
✅ Script de restauration des consolidations chargé (avec auto-restore)
📦 1 table(s) trouvée(s) dans le stockage
✅ Bouton de restauration créé
⏱️ Restauration automatique programmée dans 2 secondes...
🔍 Vérification des données à restaurer...
✅ Données trouvées dans localStorage
📦 2 table(s) au total
📊 Tables trouvées: 1 conso + 1 résultat
🔄 Lancement de la restauration automatique...
📊 Restauration de 1 table(s) conso et 1 table(s) résultat
📍 Restauration table conso conso_table_xxx avec messageId: msg_xxx
📍 Conteneur trouvé via messageId: msg_xxx
✅ Table conso conso_table_xxx restaurée dans le conteneur
✅ 2 table(s) restaurée(s) automatiquement
```

### Si Pas de Données
```
🚀 [RESTORE-BUTTON] Script chargé et initialisé
✅ Script de restauration des consolidations chargé (avec auto-restore)
⏱️ Restauration automatique programmée dans 2 secondes...
🔍 Vérification des données à restaurer...
ℹ️ Aucune donnée à restaurer automatiquement
```

## 🚀 Action Immédiate

1. **Rechargez la page** (`F5`)
2. **Ouvrez la console** (`F12`)
3. **Cherchez** le log `🚀 [RESTORE-BUTTON]`
4. **Attendez** 2 secondes
5. **Observez** les logs suivants

Si vous ne voyez AUCUN log, le problème est le chargement du script.
Si vous voyez les logs mais pas de restauration, le problème est les données.
