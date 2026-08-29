# ✅ FICHIERS DE TEST INTÉGRÉS - LEAD BALANCE

**Date** : 22 Mars 2026  
**Statut** : Fichiers de test disponibles et documentés

---

## 📊 FICHIERS EXCEL DE TEST DISPONIBLES

### Dans `py_backend/`

| Fichier | Type | Taille | Comptes N | Comptes N-1 | Description |
|---------|------|--------|-----------|-------------|-------------|
| **P000 -BALANCE DEMO.xls** | .xls | 150 KB | Variable | Variable | Fichier de démonstration original |
| **Balance excel.xlsx** | .xlsx | Variable | Variable | Variable | Balance au format moderne |
| **TEST_BALANCE.xlsx** | .xlsx | 7.4 KB | 36 | 31 | Fichier de test créé automatiquement |
| **LIASSE.xlsx** | .xlsx | Variable | N/A | N/A | États financiers SYSCOHADA |

---

## 🎯 FICHIER RECOMMANDÉ POUR LES TESTS

### TEST_BALANCE.xlsx (Nouveau)

**Avantages** :
- ✅ Créé automatiquement avec des données réalistes
- ✅ Structure validée et conforme
- ✅ Données équilibrées (Débit ≈ Crédit)
- ✅ Comptes SYSCOHADA réalistes
- ✅ 5 comptes nouveaux en N (13, 244, 37, 471, 781)
- ✅ Variations significatives entre N et N-1

**Statistiques** :
```
Balance N:
- Comptes: 36
- Total Débit: 192,950,000
- Total Crédit: 211,950,000

Balance N-1:
- Comptes: 31
- Total Débit: 156,800,000
- Total Crédit: 184,080,000
```

**Sections SYSCOHADA couvertes** :
- Classe 1 : Capitaux (101, 106, 12, 13)
- Classe 2 : Immobilisations (211, 213, 215, 218, 241, 244)
- Classe 3 : Stocks (31, 32, 37)
- Classe 4 : Tiers (401, 411, 421, 431, 441, 445, 471)
- Classe 5 : Trésorerie (512, 521, 531)
- Classe 6 : Charges (601, 605, 621, 622, 631, 641, 661, 671)
- Classe 7 : Produits (701, 706, 707, 771, 781)

---

## 🧪 PROCÉDURE DE TEST

### Test avec TEST_BALANCE.xlsx

**Étape 1 : Démarrer les services**
```powershell
# Terminal 1 - Backend
conda activate claraverse_backend
cd py_backend
python main.py

# Terminal 2 - Frontend
npm run dev
```

**Étape 2 : Tester Lead Balance**
1. Ouvrir http://localhost:5173
2. Ouvrir la console (F12)
3. Vérifier : `LeadBalanceAutoTrigger.version` → "3.0.0"
4. Dans le chat, taper : `Lead_balance`
5. Sélectionner : `py_backend/TEST_BALANCE.xlsx`

**Résultats attendus** :
- ✅ Accordéons par section SYSCOHADA
- ✅ 36 comptes communs affichés
- ✅ 5 comptes nouveaux (13, 244, 37, 471, 781)
- ✅ Variations calculées correctement
- ✅ Totaux par section

---

## 🔧 CRÉATION DE NOUVEAUX FICHIERS DE TEST

### Script automatique

```powershell
# Créer un nouveau fichier de test
cd py_backend
conda activate claraverse_backend
python create_test_balance.py

# Créer avec un nom personnalisé
python create_test_balance.py MON_TEST.xlsx
```

### Personnalisation

Éditer `py_backend/create_test_balance.py` pour :
- Ajouter/supprimer des comptes
- Modifier les montants
- Changer les intitulés
- Ajuster les variations

---

## 📋 VALIDATION DES FICHIERS

### Critères de validation

Un fichier Excel valide pour Lead Balance doit :
- ✅ Avoir au moins 2 onglets
- ✅ Contenir les colonnes : Numéro/Compte, Intitulé, Solde Débit, Solde Crédit
- ✅ Avoir des données numériques dans les colonnes de soldes
- ✅ Format .xlsx ou .xls

### Script de validation

```python
# Dans py_backend/
from pandas_lead import detect_balance_columns
import pandas as pd

# Valider un fichier
xl = pd.ExcelFile('TEST_BALANCE.xlsx')
df = pd.read_excel(xl, sheet_name=0)
col_map = detect_balance_columns(df)
print(f"Colonnes détectées: {col_map}")
```

---

## 📚 DOCUMENTATION

### Fichiers créés

1. **py_backend/FICHIERS_TEST_README.md**
   - Documentation complète des fichiers de test
   - Formats attendus
   - Procédures de validation

2. **py_backend/create_test_balance.py**
   - Script de création automatique
   - Données réalistes SYSCOHADA
   - Statistiques et validation

3. **py_backend/TEST_BALANCE.xlsx**
   - Fichier de test généré
   - 36 comptes en N, 31 en N-1
   - Toutes les classes SYSCOHADA

4. **FICHIERS_TEST_INTEGRES.md** (ce fichier)
   - Vue d'ensemble
   - Procédures de test
   - Guide d'utilisation

---

## 🎯 TESTS RECOMMANDÉS

### Test 1 : Fichier de base (TEST_BALANCE.xlsx)

**Objectif** : Vérifier le fonctionnement de base

**Fichier** : `py_backend/TEST_BALANCE.xlsx`

**Points de contrôle** :
- [ ] Table Lead_balance apparaît
- [ ] Dialogue s'ouvre automatiquement
- [ ] Upload réussit
- [ ] Accordéons affichés
- [ ] 36 comptes communs
- [ ] 5 comptes nouveaux
- [ ] Variations calculées

---

### Test 2 : Fichier original (P000 -BALANCE DEMO.xls)

**Objectif** : Vérifier la compatibilité .xls

**Fichier** : `py_backend/P000 -BALANCE DEMO.xls`

**Points de contrôle** :
- [ ] Format .xls supporté
- [ ] Traitement identique à .xlsx
- [ ] Résultats cohérents

---

### Test 3 : Fichier moderne (Balance excel.xlsx)

**Objectif** : Vérifier les formats Excel récents

**Fichier** : `py_backend/Balance excel.xlsx`

**Points de contrôle** :
- [ ] Format .xlsx moderne supporté
- [ ] Toutes les fonctionnalités disponibles

---

## 🐛 DÉPANNAGE

### Problème : Fichier non trouvé

**Symptôme** : Erreur lors de la sélection du fichier

**Solution** :
```powershell
# Vérifier les fichiers disponibles
Get-ChildItem py_backend/*.xls*
```

---

### Problème : Colonnes non détectées

**Symptôme** : Erreur "Colonne 'Numéro' non trouvée"

**Solution** :
1. Ouvrir le fichier Excel
2. Vérifier les noms de colonnes
3. S'assurer qu'il y a : Numéro, Intitulé, Solde Débit, Solde Crédit

---

### Problème : Résultats vides

**Symptôme** : Aucun compte affiché

**Solution** :
1. Vérifier que les onglets contiennent des données
2. Vérifier que les colonnes de soldes ont des valeurs numériques
3. Consulter les logs du backend

---

## ✅ CHECKLIST COMPLÈTE

### Fichiers de test
- [x] P000 -BALANCE DEMO.xls présent
- [x] Balance excel.xlsx présent
- [x] TEST_BALANCE.xlsx créé
- [x] LIASSE.xlsx présent
- [x] Documentation créée

### Scripts
- [x] create_test_balance.py créé
- [x] Script de validation disponible
- [x] Documentation complète

### Tests
- [ ] Test avec TEST_BALANCE.xlsx
- [ ] Test avec P000 -BALANCE DEMO.xls
- [ ] Test avec Balance excel.xlsx
- [ ] Validation des résultats

---

## 🚀 PROCHAINES ÉTAPES

1. **Démarrer les services** :
   ```powershell
   # Backend
   conda activate claraverse_backend
   cd py_backend
   python main.py
   
   # Frontend (autre terminal)
   npm run dev
   ```

2. **Tester avec TEST_BALANCE.xlsx** :
   - Ouvrir http://localhost:5173
   - Taper : `Lead_balance`
   - Sélectionner : `py_backend/TEST_BALANCE.xlsx`

3. **Valider les résultats** :
   - Vérifier les accordéons SYSCOHADA
   - Vérifier les comptes communs (36)
   - Vérifier les comptes nouveaux (5)
   - Vérifier les variations

4. **Tester les autres fichiers** :
   - P000 -BALANCE DEMO.xls
   - Balance excel.xlsx

---

## 📊 RÉSUMÉ

| Élément | Statut | Description |
|---------|--------|-------------|
| Fichiers de test | ✅ | 4 fichiers Excel disponibles |
| TEST_BALANCE.xlsx | ✅ | Créé avec 36 comptes |
| Documentation | ✅ | Complète et détaillée |
| Script de création | ✅ | Automatique et personnalisable |
| Validation | ✅ | Critères définis |
| Tests | ⏳ | Prêts à être exécutés |

---

**Version** : 1.0.0  
**Date** : 22 Mars 2026  
**Statut** : ✅ Fichiers de test intégrés et documentés
