# 🚀 Démarrage Rapide - Conso.js V5

## ⚡ En 3 Étapes

### 1️⃣ Vérifier l'Installation

Le fichier `public/conso.js` est déjà mis à jour vers la V5. Aucune installation supplémentaire n'est nécessaire.

### 2️⃣ Tester les Nouvelles Fonctionnalités

Ouvrir le fichier de test dans votre navigateur:

```
public/test-conso-v5-cia.html
```

### 3️⃣ Utiliser dans Votre Application

Le script s'initialise automatiquement. Aucune configuration requise!

---

## 🎯 Ce qui Change pour Vous

### Tables CIA (Examen)

Vos tables CIA avec les colonnes suivantes sont maintenant **automatiquement optimisées**:

```
Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques
```

**Résultat automatique:**
- ✅ `Reponse_cia` et `Remarques` sont **masquées** (mais conservées dans le DOM)
- ✅ `Ref_question` et `Question` sont **fusionnées** si identiques
- ✅ Checkboxes dans `Reponse_user` avec **une seule sélection possible**
- ✅ **Persistance automatique** dans localStorage

---

## 🧪 Test Rapide

### Dans la Console du Navigateur (F12)

```javascript
// Test complet
claraverseCommands.testPersistence();

// Voir les infos
claraverseCommands.getStorageInfo();

// Sauvegarder maintenant
claraverseCommands.saveAllNow();

// Restaurer
claraverseCommands.restoreAll();
```

---

## 📋 Variations de Colonnes Reconnues

Le système reconnaît automatiquement ces variations:

| Colonne | Variations Acceptées |
|---------|---------------------|
| **Ref_question** | `Ref_question`, `ref_question`, `REF_QUESTION`, `REF QUESTION` |
| **Question** | `Question`, `question`, `QUESTION` |
| **Option** | `Option`, `option` |
| **Reponse_user** | `Reponse_user`, `Reponse user`, `reponse_user`, `reponse user` |
| **Reponse_cia** | `Reponse_cia`, `REPONSE CIA`, `reponse_cia`, `reponse cia` |
| **Remarques** | `Remarques`, `remarques`, `remarque`, `Remarque` |

---

## ✅ Vérification Rapide

### 1. Colonnes Masquées

Ouvrir la console et taper:

```javascript
document.querySelectorAll('th[data-hidden="true"]').forEach(h => {
    console.log('✅ Colonne masquée:', h.textContent);
});
```

**Résultat attendu:** Vous devriez voir "Reponse_cia" et "Remarques"

### 2. Cellules Fusionnées

```javascript
document.querySelectorAll('td[rowspan]').forEach(cell => {
    console.log('✅ Cellule fusionnée:', cell.textContent);
});
```

**Résultat attendu:** Vous devriez voir les valeurs de "Ref_question" et "Question"

### 3. Persistance

```javascript
// Cocher une checkbox dans une table
// Puis recharger la page
// La checkbox devrait rester cochée
```

---

## 🐛 Dépannage Express

### Problème: Les colonnes ne sont pas masquées

**Solution:**
```javascript
// Forcer le retraitement
claraverseProcessor.processAllTables();
```

### Problème: Les cellules ne fusionnent pas

**Cause:** Les valeurs ne sont pas strictement identiques

**Vérification:**
```javascript
// Voir les valeurs dans la colonne
const table = document.querySelector('table');
const rows = table.querySelectorAll('tbody tr');
rows.forEach((row, i) => {
    const cell = row.querySelectorAll('td')[0]; // Première colonne
    console.log(`Ligne ${i}:`, `"${cell.textContent.trim()}"`);
});
```

### Problème: La persistance ne fonctionne pas

**Solution:**
```javascript
// Test localStorage
claraverseCommands.testPersistence();

// Forcer l'attribution des IDs
claraverseCommands.forceAssignIds();

// Sauvegarder
claraverseCommands.saveAllNow();
```

---

## 📊 Commandes Utiles

```javascript
// Aide complète
claraverseCommands.help();

// Activer les logs détaillés
claraverseCommands.debug.enableVerbose();

// Lister toutes les tables
claraverseCommands.debug.listTables();

// Voir le contenu du stockage
claraverseCommands.debug.showStorage();

// Exporter les données
claraverseCommands.exportData();

// Effacer tout
claraverseCommands.clearAllData();
```

---

## 🎨 Personnalisation

### Modifier les Couleurs

Dans `conso.js`, chercher:

```javascript
// Cellule cochée
cell.style.backgroundColor = "#e8f5e8"; // Vert clair

// Cellule non cochée
cell.style.backgroundColor = "#f8f9fa"; // Gris clair
```

### Modifier le Délai de Sauvegarde

Dans `conso.js`, chercher:

```javascript
this.autoSaveDelay = 500; // 500ms par défaut
```

---

## 📞 Support Rapide

### Logs de Debug

```javascript
// Activer
claraverseCommands.debug.enableVerbose();

// Désactiver
claraverseCommands.debug.disableVerbose();
```

### Vérifier l'État

```javascript
// État du processeur
console.log(window.claraverseProcessor);

// État du stockage
claraverseCommands.getStorageInfo();
```

---

## 🎯 Checklist de Validation

- [ ] Les colonnes "Reponse_cia" et "Remarques" sont invisibles
- [ ] Les colonnes "Ref_question" et "Question" sont fusionnées
- [ ] Les checkboxes apparaissent dans "Reponse_user"
- [ ] Une seule checkbox peut être cochée par table
- [ ] La cellule cochée devient verte
- [ ] Après rechargement, les checkboxes restent cochées
- [ ] Les colonnes masquées restent masquées après rechargement
- [ ] Les cellules fusionnées restent fusionnées après rechargement

---

## 📚 Documentation Complète

Pour plus de détails, consulter:
- `CONSO_V5_DOCUMENTATION.md` - Documentation complète
- `public/test-conso-v5-cia.html` - Fichier de test interactif

---

**Version:** 5.0  
**Compatibilité:** React, TypeScript, JavaScript vanilla  
**Navigateurs:** Chrome, Firefox, Safari, Edge (dernières versions)
