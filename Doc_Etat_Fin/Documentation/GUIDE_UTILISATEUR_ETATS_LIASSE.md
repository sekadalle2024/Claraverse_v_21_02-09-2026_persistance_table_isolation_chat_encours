# Guide Utilisateur - États Financiers Format Liasse Officielle

**Version**: 1.0  
**Date**: 22 mars 2026

---

## 🎯 Objectif

Générer automatiquement vos états financiers au format liasse officielle SYSCOHADA à partir de vos balances comptables.

---

## 📋 Prérequis

### Fichier Excel Requis

Votre fichier Excel doit contenir **3 onglets** avec vos balances:

```
BALANCES_N_N1_N2.xlsx
├── Balance N (2024)      ← Exercice en cours
├── Balance N-1 (2023)    ← Exercice précédent
└── Balance N-2 (2022)    ← Exercice N-2 (optionnel)
```

### Structure de Chaque Onglet

Chaque balance doit avoir **4 colonnes**:

| Numéro | Intitulé | Solde Débit | Solde Crédit |
|--------|----------|-------------|--------------|
| 101000 | Capital social | | 10 000 000 |
| 411000 | Clients | 5 000 000 | |
| 521000 | Banque SGBCI | 2 000 000 | |
| ... | ... | ... | ... |

---

## 🚀 Utilisation Simple

### Méthode 1: Script Python (Recommandé)

1. **Placez votre fichier** `BALANCES_N_N1_N2.xlsx` dans le dossier `py_backend`

2. **Ouvrez un terminal** et exécutez:
   ```bash
   cd py_backend
   conda run -n claraverse_backend python generer_etats_liasse.py
   ```

3. **Résultat**: Le fichier HTML est automatiquement:
   - ✅ Généré sur votre Bureau
   - ✅ Nommé avec la date et l'heure
   - ✅ Ouvert dans votre navigateur

**Exemple de nom**: `Etats_Financiers_Liasse_20260322_202645.html`

### Méthode 2: Via l'Interface Web

1. **Lancez l'application** ClaraVerse
2. **Uploadez** votre fichier Excel
3. **Sélectionnez** les onglets Balance N et Balance N-1
4. **Cliquez** sur "Générer les états financiers"
5. **Téléchargez** le fichier HTML généré

---

## 📊 Ce Que Vous Obtenez

### États Financiers Complets

Le fichier HTML généré contient:

#### 1. BILAN (Format Liasse Officielle)

**ACTIF**:
```
REF | LIBELLÉS                          | NOTE | EXERCICE N | EXERCICE N-1
----|-----------------------------------|------|------------|-------------
AD  | Immobilisations incorporelles     | 3    | 50 000 000 | 45 000 000
AI  | Immobilisations corporelles       | 4    | 200 000 000| 180 000 000
...
```

**PASSIF**:
```
REF | LIBELLÉS                          | NOTE | EXERCICE N | EXERCICE N-1
----|-----------------------------------|------|------------|-------------
CA  | Capital                           | 10   | 100 000 000| 100 000 000
CF  | Réserves indisponibles            | 11   | 10 000 000 | 8 000 000
...
```

#### 2. COMPTE DE RÉSULTAT

```
REF | LIBELLÉS                          | NOTE | EXERCICE N | EXERCICE N-1
----|-----------------------------------|------|------------|-------------
TA  | Ventes de marchandises            | 21   | 500 000 000| 450 000 000
RA  | Achats de marchandises            | 22   | 300 000 000| 280 000 000
XA  | MARGE COMMERCIALE                 |      | 200 000 000| 170 000 000
...
XI  | RÉSULTAT NET                      |      | 50 000 000 | 40 000 000
```

#### 3. TABLEAU DES FLUX DE TRÉSORERIE (TFT)

- Flux de trésorerie des activités opérationnelles
- Flux de trésorerie des activités d'investissement
- Flux de trésorerie des activités de financement
- Variation de trésorerie

#### 4. ANNEXES (Notes Calculables)

- Note 3A: Immobilisations incorporelles
- Note 3B: Immobilisations corporelles
- Note 6: Stocks
- Note 7: Créances
- Note 10: Capital
- Note 11: Réserves
- ... (13 notes au total)

---

## ✨ Avantages

### Format Officiel
- ✅ Conforme à la liasse officielle SYSCOHADA
- ✅ Tous les postes affichés (même vides)
- ✅ 2 colonnes pour comparaison N vs N-1

### Automatisation
- ✅ Calcul automatique des totaux
- ✅ Postes de totalisation (XA, XB, XI, etc.)
- ✅ TFT calculé automatiquement
- ✅ Annexes générées

### Flexibilité
- ✅ Fonctionne avec n'importe quel plan comptable SYSCOHADA
- ✅ S'adapte à la taille de votre entreprise
- ✅ Supporte les comptes personnalisés

---

## 🔍 Vérifications Automatiques

Le système effectue des contrôles et vous alerte en cas de:

### 1. Comptes Non Intégrés
```
⚠️ Comptes non reconnus: 2
- 999999: Compte spécial (1 000 000 FCFA)
- 888888: Autre compte (500 000 FCFA)
```

**Action**: Vérifiez que ces comptes sont bien codifiés selon SYSCOHADA

### 2. Comptes Sens Anormal
```
⚠️ Comptes avec sens anormal: 1
- 521000 Banque: Créditeur (devrait être débiteur)
```

**Action**: Vérifiez les écritures de ce compte

### 3. Taux de Couverture
```
✅ Comptes intégrés: 256/256 (100%)
```

**Objectif**: Viser 100% de couverture

---

## 🛠️ Résolution de Problèmes

### Problème 1: "Onglet non trouvé"

**Erreur**: `Worksheet named 'Balance N' not found`

**Solution**: Vérifiez que vos onglets sont nommés exactement:
- `Balance N (2024)`
- `Balance N-1 (2023)`
- `Balance N-2 (2022)`

### Problème 2: "Colonnes manquantes"

**Erreur**: `Colonne 'Numéro' non trouvée`

**Solution**: Vérifiez que votre balance contient les 4 colonnes:
- Numéro (ou Compte)
- Intitulé (ou Libellé)
- Solde Débit
- Solde Crédit

### Problème 3: "Taux de couverture faible"

**Message**: `Comptes intégrés: 180/256 (70%)`

**Solution**: 
1. Vérifiez que vos comptes respectent SYSCOHADA
2. Consultez la liste des comptes non intégrés
3. Corrigez la codification si nécessaire

### Problème 4: "Résultat incohérent"

**Message**: `Résultat CR ≠ Résultat Bilan`

**Solution**:
1. Vérifiez l'équilibre de votre balance
2. Contrôlez les écritures de clôture
3. Vérifiez l'affectation du résultat

---

## 📝 Conseils Pratiques

### Pour une Génération Réussie

1. **Préparez votre balance**
   - Exportez depuis votre logiciel comptable
   - Vérifiez l'équilibre (Total Débit = Total Crédit)
   - Incluez tous les comptes (même soldes nuls)

2. **Nommez correctement les onglets**
   - Respectez la casse (majuscules/minuscules)
   - Incluez l'année entre parenthèses
   - Exemple: `Balance N (2024)`

3. **Vérifiez les colonnes**
   - Pas de colonnes vides
   - Pas de lignes de titre multiples
   - Format numérique pour les montants

4. **Testez avec un exercice**
   - Commencez avec une balance simple
   - Vérifiez le résultat
   - Ajoutez progressivement la complexité

### Pour une Liasse de Qualité

1. **Complétude**
   - Incluez tous les comptes
   - N'oubliez pas les comptes de régularisation
   - Vérifiez les comptes de liaison

2. **Cohérence**
   - Comparez N et N-1
   - Vérifiez les variations importantes
   - Justifiez les écarts significatifs

3. **Exactitude**
   - Contrôlez les totaux
   - Vérifiez les postes de totalisation
   - Validez le résultat net

---

## 📞 Support

### En Cas de Problème

1. **Consultez les logs**
   - Le script affiche des messages détaillés
   - Notez les erreurs exactes

2. **Vérifiez votre fichier**
   - Structure des onglets
   - Noms des colonnes
   - Format des données

3. **Testez avec un fichier exemple**
   - Utilisez `BALANCES_N_N1_N2.xlsx` fourni
   - Comparez avec votre fichier

### Fichiers de Référence

- `BALANCES_N_N1_N2.xlsx` - Exemple de structure
- `correspondances_syscohada.json` - Mapping des comptes
- `FLEXIBILITE_MULTI_ENTREPRISES.md` - Guide détaillé

---

## 🎓 Exemples d'Utilisation

### Exemple 1: PME Commerce

**Contexte**: Petite entreprise commerciale, 50 comptes

**Fichier**: `BALANCES_PME_Commerce.xlsx`

**Commande**:
```bash
python generer_etats_liasse.py BALANCES_PME_Commerce.xlsx
```

**Résultat**: Liasse complète en 5 secondes

### Exemple 2: Entreprise Industrielle

**Contexte**: Moyenne entreprise industrielle, 200 comptes

**Fichier**: `BALANCES_Industrie.xlsx`

**Commande**:
```bash
python generer_etats_liasse.py BALANCES_Industrie.xlsx
```

**Résultat**: Liasse avec TFT détaillé

### Exemple 3: Groupe d'Entreprises

**Contexte**: 5 filiales à consolider

**Fichiers**:
- `BALANCES_Filiale_A.xlsx`
- `BALANCES_Filiale_B.xlsx`
- `BALANCES_Filiale_C.xlsx`
- `BALANCES_Filiale_D.xlsx`
- `BALANCES_Filiale_E.xlsx`

**Commandes**:
```bash
python generer_etats_liasse.py BALANCES_Filiale_A.xlsx
python generer_etats_liasse.py BALANCES_Filiale_B.xlsx
python generer_etats_liasse.py BALANCES_Filiale_C.xlsx
python generer_etats_liasse.py BALANCES_Filiale_D.xlsx
python generer_etats_liasse.py BALANCES_Filiale_E.xlsx
```

**Résultat**: 5 liasses comparables pour consolidation

---

## ✅ Checklist Avant Génération

- [ ] Fichier Excel nommé `BALANCES_N_N1_N2.xlsx`
- [ ] 3 onglets présents (N, N-1, N-2)
- [ ] Onglets nommés correctement avec années
- [ ] 4 colonnes dans chaque onglet
- [ ] Balance équilibrée (Débit = Crédit)
- [ ] Tous les comptes inclus
- [ ] Format numérique pour les montants
- [ ] Pas de lignes vides
- [ ] Backend ClaraVerse actif (si via API)

---

## 🎉 Résultat Final

Après génération, vous obtenez un fichier HTML professionnel contenant:

✅ Bilan complet (Actif + Passif)  
✅ Compte de Résultat détaillé  
✅ Tableau des Flux de Trésorerie  
✅ Annexes calculées  
✅ Format liasse officielle SYSCOHADA  
✅ Comparaison N vs N-1  
✅ Tous les postes (même vides)  
✅ Calculs automatiques validés  

**Prêt pour dépôt officiel ou analyse financière!**

---

**Version**: 1.0  
**Dernière mise à jour**: 22 mars 2026  
**Auteur**: ClaraVerse Team
