# ⚡ TEST IMMÉDIAT: Restauration Simple

## 🎯 Objectif

Vérifier que les tables modelisées sont restaurées automatiquement au rechargement.

## 📋 Étapes de Test (2 minutes)

### Étape 1: Recharger la Page

1. **Appuyer sur Ctrl+R** ou **F5**
2. **Ouvrir la console** (F12)
3. **Attendre 3 secondes**

### Étape 2: Vérifier les Logs

Cherchez ces messages dans la console:

#### ✅ Cas de Succès
```
🚀 RESTAURATION SIMPLE - Démarrage
⏳ Attente du chargement complet...
⏳ Attente du gestionnaire de verrouillage...
🔒 Verrou acquis, restauration...
📂 Ouverture IndexedDB...
✅ IndexedDB ouvert
📊 5 table(s) trouvée(s) dans IndexedDB
✅ Table xxx restaurée
✅ 5 TABLE(S) RESTAURÉE(S)
```

**Résultat**: Les tables doivent apparaître dans le chat + notification verte en haut à droite.

#### ⚠️ Cas: IndexedDB Vide
```
📊 0 table(s) trouvée(s) dans IndexedDB
⚠️ Aucune table à restaurer
ℹ️ Aucune table à restaurer
```

**Action**: Passez à l'Étape 3 pour créer une table.

#### ❌ Cas d'Erreur
```
❌ Erreur restauration: xxx
```

**Action**: Copiez l'erreur et partagez-la pour analyse.

### Étape 3: Créer une Table (Si IndexedDB Vide)

1. **Dans le chat**, demandez à créer une table modelisée
2. **Attendez** que la table apparaisse
3. **Vérifiez dans la console**:
   ```
   🆕 Table generated notifiée au système IndexedDB
   ```
4. **Attendez 2 secondes** (sauvegarde automatique)
5. **Recharger la page** (Ctrl+R)
6. **Vérifier** que la table réapparaît

### Étape 4: Vérification Manuelle

Dans la console, exécutez:

```javascript
// 1. Vérifier IndexedDB
const request = indexedDB.open('ClaraverseDB', 1);
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['flowise_tables'], 'readonly');
  const count = tx.objectStore('flowise_tables').count();
  count.onsuccess = () => console.log(`📊 Tables dans IndexedDB: ${count.result}`);
};

// 2. Vérifier le DOM
console.log(`📋 Tables dans DOM: ${document.querySelectorAll('[data-table-id]').length}`);

// 3. Forcer une restauration si nécessaire
window.simpleRestore.restore()
```

## 🎯 Résultats Attendus

| Scénario | Résultat Attendu |
|----------|------------------|
| IndexedDB avec tables | ✅ Tables restaurées automatiquement |
| IndexedDB vide | ℹ️ Message "Aucune table à restaurer" |
| Erreur | ❌ Message d'erreur dans la console |

## 🔧 Solutions Rapides

### Si "Restauration déjà effectuée"
```javascript
window.restoreLockManager.reset()
window.simpleRestore.restore()
```

### Si "Aucune table à restaurer"
1. Créer une table via le chat
2. Attendre 2 secondes
3. Recharger la page

### Si Tables Invisibles
```javascript
// Vérifier qu'elles sont dans le DOM
document.querySelectorAll('[data-table-id]')

// Vérifier le conteneur
document.querySelectorAll('.prose')
```

## ✅ Critères de Succès

Vous saurez que ça fonctionne quand:

1. ✅ **Console affiche**: "✅ X TABLE(S) RESTAURÉE(S)"
2. ✅ **Notification verte** apparaît en haut à droite
3. ✅ **Tables visibles** dans le chat
4. ✅ **Diagnostic montre**: "📋 Tables avec ID: X" (X > 0)

## 📊 Diagnostic Complet

Le script de diagnostic s'exécute automatiquement après 3 secondes.

Résultats à vérifier:
- ✅ IndexedDB accessible
- ✅ Lock Manager présent
- ✅ Tables dans IndexedDB: X
- ✅ Tables dans DOM: X
- ✅ Événements reçus

## 🆘 Si Rien ne Fonctionne

1. **Copier TOUS les logs** de la console
2. **Vérifier** que les scripts sont chargés:
   ```javascript
   window.restoreLockManager  // Doit exister
   window.simpleRestore       // Doit exister
   window.claraverseTableProcessor  // Doit exister
   ```
3. **Partager** les logs pour analyse

## 💡 Commandes de Debug

```javascript
// État du système
window.restoreLockManager.getState()

// Forcer restauration
window.simpleRestore.restore()

// Test diagnostic
window.testTableRestore()

// Compter tables
document.querySelectorAll('[data-table-id]').length
```

## 📝 Notes

- Le diagnostic s'exécute automatiquement 3 secondes après le chargement
- La restauration s'exécute automatiquement au chargement
- Les logs sont détaillés pour faciliter le debug
- Une notification visuelle confirme le succès

## 🚀 Prochaine Étape

Après avoir vérifié que la restauration fonctionne:
1. Tester avec plusieurs tables
2. Tester après changement de chat
3. Tester l'édition de cellules
4. Vérifier la persistance des modifications
