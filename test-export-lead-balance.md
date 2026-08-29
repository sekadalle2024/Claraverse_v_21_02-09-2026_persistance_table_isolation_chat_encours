# Test Export Lead Balance vers Excel

## 📋 Checklist de Test

### Prérequis
- [ ] Backend Python lancé (`conda activate claraverse_backend` puis `python py_backend/main.py`)
- [ ] Frontend lancé (`npm run dev`)
- [ ] Fichier de test disponible : `py_backend/TEST_BALANCE.xlsx`

---

## 🧪 Scénario de Test Complet

### Étape 1: Calculer Lead Balance
1. Ouvrir l'application dans le navigateur
2. Cliquer sur une table (ou créer une nouvelle table)
3. Appuyer sur **Ctrl+L** (ou clic droit → "📊 Lead Balance")
4. Sélectionner le fichier `py_backend/TEST_BALANCE.xlsx`
5. Attendre l'affichage des résultats (accordéons SYSCOHADA)

**Résultat attendu** :
- ✅ Accordéons affichés avec sections : Actif Immobilisé, Actif Circulant, etc.
- ✅ Données visibles dans chaque section
- ✅ Totaux calculés correctement

---

### Étape 2: Exporter vers Excel (Méthode 1 - Raccourci)
1. Avec les résultats Lead Balance affichés
2. Appuyer sur **Ctrl+Shift+L**
3. Vérifier le téléchargement du fichier

**Résultat attendu** :
- ✅ Notification : "📥 Préparation de l'export Excel..."
- ✅ Notification : "✅ Export réussi: X sections exportées dans Lead_Balance_YYYYMMDD_HHMMSS.xlsx"
- ✅ Fichier Excel téléchargé dans le dossier Téléchargements

---

### Étape 3: Exporter vers Excel (Méthode 2 - Menu Contextuel)
1. Clic droit sur la table
2. Sélectionner **"📥 Export Lead Balance"** dans la section "Modélisation Pandas"
3. Vérifier le téléchargement du fichier

**Résultat attendu** :
- ✅ Menu contextuel s'affiche
- ✅ Option "📥 Export Lead Balance" visible
- ✅ Fichier Excel téléchargé

---

### Étape 4: Vérifier le Contenu du Fichier Excel
1. Ouvrir le fichier Excel téléchargé
2. Vérifier les onglets créés

**Onglets attendus** (selon les données du fichier TEST_BALANCE.xlsx) :
- ✅ Actif Immobilisé
- ✅ Actif Circulant
- ✅ Trésorerie Actif
- ✅ Capitaux Propres
- ✅ Dettes Financières
- ✅ Autres sections selon les comptes présents

**Pour chaque onglet** :
- ✅ Colonnes : Compte, Intitulé, Solde N, Solde N-1, Écart, Var %
- ✅ Données correctement formatées (nombres avec décimales)
- ✅ Ligne de total en bas
- ✅ Largeurs de colonnes optimisées

---

## 🔍 Tests de Cas Limites

### Test 1: Export sans résultats Lead Balance
1. Ouvrir l'application
2. Appuyer sur **Ctrl+Shift+L** sans avoir calculé Lead Balance

**Résultat attendu** :
- ✅ Message d'erreur : "⚠️ Aucun résultat Lead Balance trouvé. Veuillez d'abord exécuter le calcul Lead Balance."

---

### Test 2: Export avec fichier volumineux
1. Calculer Lead Balance avec `py_backend/P000 -BALANCE DEMO.xls`
2. Exporter vers Excel

**Résultat attendu** :
- ✅ Export réussi avec toutes les sections
- ✅ Fichier Excel de taille raisonnable (< 5 MB)
- ✅ Toutes les données présentes

---

### Test 3: Vérifier les noms d'onglets longs
1. Vérifier que les noms d'onglets ne dépassent pas 31 caractères
2. Vérifier que les noms tronqués se terminent par "..."

**Résultat attendu** :
- ✅ Aucun nom d'onglet > 31 caractères
- ✅ Noms tronqués lisibles

---

## 🐛 Tests de Dépannage

### Test 1: Bibliothèque XLSX non chargée
1. Ouvrir la console développeur (F12)
2. Exécuter : `delete window.XLSX`
3. Exporter Lead Balance

**Résultat attendu** :
- ✅ Message console : "📥 [Export Lead Balance] Bibliothèque XLSX chargée"
- ✅ Export réussi après chargement automatique

---

### Test 2: Vérifier les logs console
1. Ouvrir la console développeur (F12)
2. Exporter Lead Balance
3. Vérifier les logs

**Logs attendus** :
```
📥 [Export Lead Balance] Début de l'export
📥 [Export Lead Balance] Onglets détectés: {n: "N", n_1: "N-1"}
📥 [Export Lead Balance] Section exportée: Actif Immobilisé
📥 [Export Lead Balance] Section exportée: Actif Circulant
...
✅ [Export Lead Balance] Fichier généré: Lead_Balance_YYYYMMDD_HHMMSS.xlsx
```

---

## 📊 Validation des Données

### Vérification Manuelle
1. Ouvrir le fichier Excel généré
2. Comparer avec les résultats affichés dans l'application
3. Vérifier que les totaux correspondent

**Points à vérifier** :
- ✅ Nombres de comptes identiques
- ✅ Totaux identiques
- ✅ Variations en % correctes
- ✅ Aucune donnée manquante

---

## ⚙️ Tests Techniques

### Test 1: Vérifier la fonction extractTableDataFromElement
```javascript
// Dans la console développeur
const table = document.querySelector('.lead-table');
const sheetNames = { n: 'N', n_1: 'N-1' };
const data = window.contextMenuManager.extractTableDataFromElement(table, sheetNames);
console.log(data);
```

**Résultat attendu** :
- ✅ Tableau de données avec en-têtes
- ✅ Nombres convertis correctement
- ✅ Ligne de total incluse

---

### Test 2: Vérifier la fonction extractSheetNamesFromLeadBalance
```javascript
// Dans la console développeur
const container = document.querySelector('.lead-syscohada-container');
const sheetNames = window.contextMenuManager.extractSheetNamesFromLeadBalance(container);
console.log(sheetNames);
```

**Résultat attendu** :
- ✅ Objet avec propriétés `n` et `n_1`
- ✅ Valeurs extraites du header Lead Balance

---

## 📝 Rapport de Test

### Informations à noter
- **Date du test** : _________________
- **Version de l'application** : _________________
- **Navigateur** : _________________
- **Fichier de test utilisé** : _________________

### Résultats
- [ ] ✅ Tous les tests passés
- [ ] ⚠️ Certains tests échoués (détails ci-dessous)
- [ ] ❌ Tests bloquants échoués

### Problèmes rencontrés
```
[Décrire les problèmes ici]
```

### Suggestions d'amélioration
```
[Suggestions ici]
```

---

## 🎯 Critères de Succès

L'export Lead Balance est considéré comme fonctionnel si :
- ✅ Export possible via Ctrl+Shift+L
- ✅ Export possible via menu contextuel
- ✅ Fichier Excel généré avec onglets multiples
- ✅ Données correctement formatées
- ✅ Totaux corrects
- ✅ Aucune erreur console
- ✅ Message de succès affiché

---

## 🔄 Workflow de Test Recommandé

```
1. Lancer Backend (conda + python)
   ↓
2. Lancer Frontend (npm run dev)
   ↓
3. Calculer Lead Balance (Ctrl+L)
   ↓
4. Vérifier résultats affichés
   ↓
5. Exporter vers Excel (Ctrl+Shift+L)
   ↓
6. Vérifier fichier téléchargé
   ↓
7. Ouvrir et valider contenu Excel
   ↓
8. Tester cas limites
   ↓
9. Valider logs console
   ↓
10. Rédiger rapport de test
```

---

**Date de création** : 22 mars 2026  
**Version** : 1.0  
**Statut** : Prêt pour tests
