# Guide de Test - Données N et N-1 Distinctes

**Date**: 23 mars 2026  
**Objectif**: Vérifier que les états financiers affichent des données différentes pour les exercices N et N-1

---

## ✅ Préparation Complétée

### Fichier de Test Créé
- **Fichier**: `py_backend/BALANCES_N_N1_N2.xlsx`
- **Structure**: 3 onglets avec balances distinctes
  - Balance N (2024) - 405 comptes
  - Balance N-1 (2023) - 405 comptes - **DONNÉES DIFFÉRENTES**
  - Balance N-2 (2022) - 405 comptes - **DONNÉES DIFFÉRENTES**

### Vérification des Balances
```
✅ Les 3 balances sont TOUTES DISTINCTES

Exemple Compte 101000 (Capital):
  N   : Crédit = 100,000,000.00
  N-1 : Crédit = 108,043,587.24  ← DIFFÉRENT
  N-2 : Crédit = 102,441,153.44  ← DIFFÉRENT

Totaux Soldes Débiteurs:
  N   : 6,136,439,620.00
  N-1 : 6,032,570,367.06  ← Différence: 103,869,252.94
  N-2 : 6,180,723,655.40  ← Différence: 44,284,035.40
```

---

## 🧪 Procédure de Test

### 1. Accéder à l'Application
- Ouvrir le navigateur
- Aller sur: **http://localhost:5173**

### 2. Uploader le Fichier de Test
- Cliquer sur le bouton d'upload de fichier
- Sélectionner: `py_backend/BALANCES_N_N1_N2.xlsx`
- Attendre le traitement (peut prendre 10-20 secondes)

### 3. Vérifier les 11 Sections du Menu Accordéon

Le menu accordéon doit afficher **11 sections**:

#### États Financiers (5 sections)
1. 🏢 BILAN - ACTIF
2. 🏛️ BILAN - PASSIF
3. 📉 COMPTE DE RÉSULTAT - CHARGES
4. 📈 COMPTE DE RÉSULTAT - PRODUITS
5. 💰 TABLEAU DES FLUX DE TRÉSORERIE

#### États de Contrôle (6 sections)
6. 🔍 Etat de contrôle Bilan Actif
7. 🔍 Etat de contrôle Bilan Passif
8. 🔍 Etat de contrôle Compte de Résultat
9. 🔍 Etat de contrôle Tableau des Flux
10. 🔍 Etat de contrôle Sens des Comptes
11. 🔍 Etat d'équilibre Bilan

### 4. Vérifier les Colonnes N et N-1

Pour **CHAQUE section des états financiers**, vérifier:

#### Format Attendu
```
┌─────┬──────────────────────────┬──────┬─────────────────┬─────────────────┐
│ REF │ LIBELLÉS                 │ NOTE │ EXERCICE N      │ EXERCICE N-1    │
├─────┼──────────────────────────┼──────┼─────────────────┼─────────────────┤
│ TA  │ Ventes de marchandises   │  21  │  1,234,567.00   │  1,156,789.00   │
│ RA  │ Achats de marchandises   │  22  │    987,654.00   │    923,456.00   │
│ XA  │ MARGE COMMERCIALE        │      │    246,913.00   │    233,333.00   │
└─────┴──────────────────────────┴──────┴─────────────────┴─────────────────┘
```

#### Points de Vérification Critiques

**✅ À VÉRIFIER**:
1. Les colonnes **EXERCICE N** et **EXERCICE N-1** sont présentes
2. Les montants dans les deux colonnes sont **DIFFÉRENTS**
3. Les montants ne sont **PAS identiques** (pas de duplication)
4. Tous les postes affichent des valeurs (pas de colonnes vides)

**❌ PROBLÈME SI**:
- Les colonnes N et N-1 affichent les mêmes montants
- Une colonne est vide
- Les montants sont tous à zéro

### 5. Exemples de Postes à Vérifier

#### Bilan Actif
- **AJ** - Terrains
- **AK** - Bâtiments
- **BH** - Clients

#### Bilan Passif
- **CA** - Capital (devrait être ~100M pour N et ~108M pour N-1)
- **CJ** - Résultat net de l'exercice
- **DH** - Fournisseurs

#### Compte de Résultat
- **TA** - Ventes de marchandises
- **RA** - Achats de marchandises
- **XA** - Marge commerciale

---

## 📊 Résultats Attendus

### Si Tout Fonctionne Correctement

```
✅ 11 sections présentes dans le menu accordéon
✅ Chaque état financier a 2 colonnes: EXERCICE N et EXERCICE N-1
✅ Les montants dans N et N-1 sont DIFFÉRENTS
✅ Les états de contrôle affichent des statistiques cohérentes
✅ Le TFT affiche les flux pour N et N-1
```

### Exemple de Résultat Correct

**Compte de Résultat - Extrait**:
```
TA - Ventes de marchandises
   N   : 5,234,567,890.00
   N-1 : 5,123,456,789.00  ← DIFFÉRENT ✅

RA - Achats de marchandises
   N   : 3,456,789,012.00
   N-1 : 3,389,012,345.00  ← DIFFÉRENT ✅

XA - MARGE COMMERCIALE
   N   : 1,777,778,878.00
   N-1 : 1,734,444,444.00  ← DIFFÉRENT ✅
```

---

## 🐛 Dépannage

### Problème: Les colonnes N et N-1 sont identiques

**Cause**: Le fichier uploadé n'est pas le bon

**Solution**:
1. Vérifier que vous uploadez bien `BALANCES_N_N1_N2.xlsx`
2. Vérifier que le fichier contient 3 onglets distincts
3. Recharger la page et réessayer

### Problème: Une seule colonne s'affiche

**Cause**: L'ancien format est utilisé

**Solution**:
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Redémarrer le backend: `.\start-claraverse-conda.ps1`
3. Recharger la page

### Problème: Les sections ne s'affichent pas

**Cause**: Erreur de traitement

**Solution**:
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs
3. Vérifier les logs du backend dans le terminal

---

## 📝 Rapport de Test

Après le test, noter:

```
Date: _____________
Heure: _____________

✅ / ❌  11 sections présentes
✅ / ❌  Colonnes N et N-1 présentes
✅ / ❌  Données N et N-1 distinctes
✅ / ❌  États de contrôle fonctionnels
✅ / ❌  TFT avec N et N-1

Observations:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Prochaines Étapes

Si le test est réussi:
1. ✅ Vérifier les exports Excel (TASK 2)
2. ✅ Tester avec d'autres fichiers de balance
3. ✅ Valider les états de contrôle exhaustifs

Si le test échoue:
1. Noter les problèmes observés
2. Vérifier les logs du backend
3. Partager les observations pour correction

---

**Fichiers de Référence**:
- `py_backend/BALANCES_N_N1_N2.xlsx` - Fichier de test
- `py_backend/test_balances_distinctes.py` - Script de vérification
- `test_endpoint_n_n1.py` - Test de l'endpoint API
- `Doc_Etat_Fin/STRUCTURE_LIASSE_OFFICIELLE.md` - Documentation du format

**Contact**: Kiro AI Assistant  
**Version**: 1.0 - 23 mars 2026
