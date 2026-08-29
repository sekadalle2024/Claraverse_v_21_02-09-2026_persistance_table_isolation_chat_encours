# 🧪 Test de Persistance - Tables Conso et Résultat

## ✅ Modifications Appliquées

Les modifications suivantes ont été appliquées automatiquement à `conso.js` :

1. ✅ `createConsolidationTable()` - Assigner ID stable + sauvegarder
2. ✅ `updateConsolidationDisplay()` - Sauvegarder après mise à jour
3. ✅ `getCurrentSessionId()` - NOUVELLE méthode ajoutée
4. ✅ `restoreAllTablesData()` - Modifiée pour utiliser IndexedDB
5. ✅ `restoreGeneratedTables()` - NOUVELLE méthode ajoutée
6. ✅ `restoreFromLocalStorage()` - NOUVELLE méthode ajoutée (fallback)
7. ✅ `updateResultatTable()` - Sauvegarde ajoutée (2 stratégies)

---

## 🧪 Tests à Effectuer

### Test 1 : Vérifier le Chargement

1. Ouvrir la console du navigateur (F12)
2. Recharger la page (F5)
3. Vérifier les logs suivants :

```
🚀 Claraverse Table Script - Démarrage
📋 [Claraverse] Initialisation du processeur de tables
✅ [Claraverse] localStorage fonctionne correctement
🔄 [Claraverse] Début de la restauration des tables
📍 [Claraverse] Session pour restauration: stable_session_xxx
✅ [Claraverse] Restauration demandée via événement IndexedDB
🔄 [Claraverse] Restauration des tables générées (conso et résultat)
✅ [Claraverse] Restauration tables générées demandée
```

### Test 2 : Créer une Consolidation

1. Ouvrir un chat avec une table modelisée
2. Cliquer droit sur la table > "Activer édition des cellules"
3. Modifier une cellule dans la colonne "Conclusion" > Sélectionner "Non-Satisfaisant"
4. Vérifier dans la console :

```
🆔 [Claraverse] ID stable généré: table_xxx
🆔 [Claraverse] ID assigné à table Résultat: resultat_xxx
💾 [Claraverse] Table de consolidation conso_xxx sauvegardée
💾 [Claraverse] Table Résultat sauvegardée (stratégie 1)
💾 [Claraverse] Table Conso sauvegardée après mise à jour
```

### Test 3 : Vérifier les IDs des Tables

Exécuter dans la console :

```javascript
// Vérifier toutes les tables avec IDs
document.querySelectorAll('[data-table-id]').forEach(t => {
  console.log('Table:', t.dataset.tableId, 'Type:', t.dataset.tableType || 'standard');
});

// Vérifier spécifiquement les tables de consolidation
document.querySelectorAll('.claraverse-conso-table').forEach(t => {
  console.log('Conso:', t.dataset.tableId, 'Source:', t.dataset.sourceTableId);
});

// Vérifier les tables Résultat
document.querySelectorAll('[data-table-type="resultat"]').forEach(t => {
  console.log('Résultat:', t.dataset.tableId, 'Source:', t.dataset.sourceTableId);
});
```

**Résultat attendu** :
```
Table: table_xxx Type: standard
Table: conso_table_xxx Type: consolidation
Table: resultat_table_xxx Type: resultat
```

### Test 4 : Vérifier IndexedDB

1. Ouvrir DevTools (F12)
2. Aller dans **Application** > **IndexedDB** > **clara_db** > **clara_generated_tables**
3. Chercher les entrées avec :
   - `tableType: "consolidation"`
   - `tableType: "resultat"`

Exécuter dans la console :

```javascript
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    const tables = getAll.result;
    console.log('📊 Total tables sauvegardées:', tables.length);
    
    const consoTables = tables.filter(t => t.tableType === 'consolidation');
    const resultatTables = tables.filter(t => t.tableType === 'resultat');
    
    console.log('📊 Tables Conso:', consoTables.length);
    console.log('📊 Tables Résultat:', resultatTables.length);
    
    consoTables.forEach(t => {
      console.log('  - Conso:', t.keyword, 'Timestamp:', new Date(t.timestamp).toLocaleString());
    });
    
    resultatTables.forEach(t => {
      console.log('  - Résultat:', t.keyword, 'Timestamp:', new Date(t.timestamp).toLocaleString());
    });
  };
};
```

### Test 5 : Restauration après F5

1. Après avoir créé une consolidation (Test 2)
2. Appuyer sur **F5** pour recharger la page
3. Attendre 5-10 secondes
4. Vérifier que :
   - La table de consolidation est visible
   - La table Résultat est visible
   - Le contenu est identique à avant le rechargement

5. Vérifier dans la console :

```
🔄 [Claraverse] Début de la restauration des tables
📍 [Claraverse] Session pour restauration: stable_session_xxx
✅ [Claraverse] Restauration demandée via événement IndexedDB
🔄 [Claraverse] Restauration des tables générées (conso et résultat)
✅ [Claraverse] Restauration tables générées demandée
```

### Test 6 : Forcer une Sauvegarde Manuelle

Exécuter dans la console :

```javascript
// Forcer la sauvegarde de toutes les tables de consolidation
if (window.claraverseProcessor) {
  const consoTables = document.querySelectorAll('.claraverse-conso-table');
  console.log(`🔍 ${consoTables.length} table(s) de consolidation trouvée(s)`);
  
  consoTables.forEach(t => {
    window.claraverseProcessor.saveTableData(t);
    console.log('💾 Sauvegarde forcée:', t.dataset.tableId);
  });
  
  // Forcer la sauvegarde des tables Résultat
  const resultatTables = document.querySelectorAll('[data-table-type="resultat"]');
  console.log(`🔍 ${resultatTables.length} table(s) Résultat trouvée(s)`);
  
  resultatTables.forEach(t => {
    window.claraverseProcessor.saveTableData(t);
    console.log('💾 Sauvegarde forcée:', t.dataset.tableId);
  });
} else {
  console.error('❌ claraverseProcessor non disponible');
}
```

### Test 7 : Changement de Chat

1. Créer une consolidation dans Chat A
2. Passer à Chat B (ou créer un nouveau chat)
3. Revenir à Chat A
4. Vérifier que les tables de consolidation et Résultat sont restaurées

---

## 🔍 Diagnostic en Cas de Problème

### Problème 1 : Tables non sauvegardées

**Symptômes** :
- Pas de log `💾 Table sauvegardée`
- Aucune entrée dans IndexedDB

**Diagnostic** :

```javascript
// Vérifier que les méthodes existent
console.log('saveTableData:', typeof window.claraverseProcessor?.saveTableData);
console.log('setupTableChangeDetection:', typeof window.claraverseProcessor?.setupTableChangeDetection);

// Vérifier que les tables ont des IDs
document.querySelectorAll('.claraverse-conso-table').forEach(t => {
  console.log('Conso ID:', t.dataset.tableId || '❌ PAS D\'ID');
});
```

**Solution** :
- Vérifier que `setupTableChangeDetection()` est appelé
- Vérifier que `saveTableData()` existe et fonctionne
- Forcer une sauvegarde manuelle (Test 6)

### Problème 2 : Tables non restaurées

**Symptômes** :
- Tables vides après F5
- Pas de log de restauration

**Diagnostic** :

```javascript
// Vérifier la session
console.log('Session:', sessionStorage.getItem('claraverse_stable_session'));

// Vérifier les données dans IndexedDB
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    console.log('Tables dans IndexedDB:', getAll.result.length);
    getAll.result.forEach(t => {
      if (t.tableType === 'consolidation' || t.tableType === 'resultat') {
        console.log('Générée:', t.tableType, t.keyword);
      }
    });
  };
};
```

**Solution** :
- Augmenter le délai de restauration à 3000ms
- Vérifier que les tables ont le même ID avant et après F5
- Vérifier que l'événement `flowise:table:restore:request` est émis

### Problème 3 : Erreur "saveTableData is not a function"

**Symptômes** :
- Erreur dans la console
- Tables non sauvegardées

**Diagnostic** :

```javascript
// Vérifier l'objet claraverseProcessor
console.log('claraverseProcessor:', window.claraverseProcessor);
console.log('Méthodes disponibles:', Object.keys(window.claraverseProcessor || {}));
```

**Solution** :
- Vérifier que conso.js est chargé correctement
- Vérifier qu'il n'y a pas d'erreur de syntaxe dans conso.js
- Recharger la page

---

## ✅ Checklist de Validation

- [ ] Les logs de chargement sont corrects
- [ ] Les tables de consolidation ont un `data-table-id`
- [ ] Les tables Résultat ont un `data-table-id`
- [ ] Les tables sont sauvegardées (logs dans console)
- [ ] Les tables sont présentes dans IndexedDB
- [ ] Les tables sont restaurées après F5
- [ ] Le contenu est identique après restauration
- [ ] Aucune erreur dans la console

---

## 📊 Résultat Attendu

Après validation de tous les tests :

✅ **Création** : Les tables [Table_conso] et [Resultat] sont créées avec un ID stable  
✅ **Sauvegarde** : Les tables sont sauvegardées automatiquement dans IndexedDB  
✅ **Détection** : Les modifications sont détectées et sauvegardées  
✅ **Restauration** : Les tables sont restaurées après F5 avec leur contenu  
✅ **Changement de chat** : Les tables sont restaurées lors du changement de chat  
✅ **Persistance** : Les données restent même après fermeture du navigateur  

---

## 📞 Support

Si les tests échouent :

1. Vérifier les logs dans la console
2. Vérifier IndexedDB (F12 > Application)
3. Exécuter les commandes de diagnostic
4. Consulter `SOLUTION_PERSISTANCE_TABLES_CONSO_RESULTAT.md`

---

*Tests créés le 20 novembre 2025*
