# Test Rapide - Persistance Menu.js

## 🚀 Test en 5 Minutes

### Étape 1: Redémarrer l'Application

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

### Étape 2: Ouvrir la Console (F12)

Vérifiez ces messages au démarrage :

```
✅ Session stable créée: stable_session_xxx
🔄 Initialisation restauration automatique
✅ Restauration automatique terminée
```

### Étape 3: Modifier une Table

1. Clic droit sur une table
2. Sélectionnez "➕ Insérer ligne en dessous"
3. Vérifiez dans la console :

```
✅ Ligne insérée
💾 Sauvegarde table: session=stable_session_xxx
✅ Table sauvegardée avec succès
```

### Étape 4: Recharger la Page

```javascript
location.reload();
```

### Étape 5: Vérifier la Restauration

Après rechargement, dans la console :

```javascript
diagnosticPersistance();
```

**Résultat attendu:**
```
✅ API disponible
✅ IndexedDB OK
✅ Tables sauvegardées: X
✅ Système fonctionnel !
```

**Et la table modifiée devrait être visible avec la ligne ajoutée !**

## ✅ Critères de Succès

- [ ] Session stable créée au démarrage
- [ ] Modifications sauvegardées avec la même session
- [ ] Tables restaurées automatiquement après rechargement
- [ ] Modifications visibles dans le DOM

## ❌ Si Ça Ne Marche Pas

### Diagnostic Rapide

```javascript
// 1. Session stable existe ?
console.log('Session:', sessionStorage.getItem('claraverse_stable_session'));

// 2. Tables sauvegardées ?
diagnosticPersistance();

// 3. Forcer restauration
forcerRestauration();
```

### Nettoyage Complet

```javascript
// Nettoyer tout
nettoyerLocalStorage();
sessionStorage.clear();
location.reload();
```

## 🎯 Test Avancé

### Test de Persistance Multiple

```javascript
// 1. Modifier table 1
// Clic droit > Insérer ligne

// 2. Modifier table 2  
// Clic droit > Insérer colonne

// 3. Vérifier
diagnosticPersistance();
// Devrait montrer 2+ tables

// 4. Recharger
location.reload();

// 5. Vérifier que TOUTES les modifications persistent
```

## 📊 Logs de Succès

Si tout fonctionne, vous devriez voir :

```
=== AU DÉMARRAGE ===
✅ Session stable créée: stable_session_1763058540405_abc123
🔄 Initialisation restauration automatique
🔄 Restauration session: stable_session_1763058540405_abc123
✅ Restauration automatique terminée

=== APRÈS MODIFICATION ===
✅ Ligne insérée après ligne 1
💾 Sauvegarde table: session=stable_session_1763058540405_abc123
✅ Table sauvegardée avec succès

=== APRÈS RECHARGEMENT ===
✅ Session stable récupérée: stable_session_1763058540405_abc123
🔄 Restauration session: stable_session_1763058540405_abc123
📊 Tables restaurées: 1
✅ Restauration automatique terminée
```

## 💡 Commandes Utiles

```javascript
// Diagnostic complet
diagnosticPersistance()

// Lister tables
listerTablesSauvegardees()

// Forcer restauration
forcerRestauration()

// Voir session
sessionStorage.getItem('claraverse_stable_session')

// Nettoyer
nettoyerLocalStorage()
```

## 🎉 Succès !

Si vous voyez vos modifications après rechargement, **c'est gagné !**

La persistance fonctionne maintenant automatiquement. 🎊
