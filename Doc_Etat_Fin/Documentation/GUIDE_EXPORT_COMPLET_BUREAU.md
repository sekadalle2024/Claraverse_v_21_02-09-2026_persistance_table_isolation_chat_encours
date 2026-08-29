# Guide Export Complet sur le Bureau

## Objectif

Générer tous les états financiers calculables et les exporter sur le Bureau en un seul fichier HTML.

---

## Prérequis

1. Fichier `py_backend/BALANCES_N_N1_N2.xlsx` avec 3 onglets:
   - Balance N (exercice en cours)
   - Balance N-1 (exercice précédent)
   - Balance N-2 (exercice N-2)

2. Backend Python configuré (environnement conda `claraverse_backend`)

---

## Utilisation

### Méthode 1: Script PowerShell (Recommandé)

```powershell
.\test-export-complet-bureau.ps1
```

**Ce script va** :
1. Vérifier l'existence du fichier BALANCES_N_N1_N2.xlsx
2. Générer tous les états financiers
3. Copier le fichier HTML sur le Bureau
4. Ouvrir automatiquement le fichier

### Méthode 2: Commandes Manuelles

```bash
cd py_backend
python test_etats_financiers_standalone.py
```

Puis copier manuellement le fichier HTML généré sur le Bureau.

---

## Contenu du Fichier Exporté

Le fichier HTML contient :

### 1. Bilan
- **Actif** : Tous les postes d'actif avec montants
- **Passif** : Tous les postes de passif avec montants
- **Totaux** : Total Actif et Total Passif

### 2. Compte de Résultat
- **Charges** : Tous les postes de charges
- **Produits** : Tous les postes de produits
- **Totaux** : Total Charges et Total Produits

### 3. Résultat Net
- Type : Bénéfice ou Perte
- Montant absolu

### 4. Tableau des Flux de Trésorerie (si Balance N-1)
- Trésorerie d'ouverture
- CAFG (Capacité d'Autofinancement Globale)
- Flux opérationnels
- Flux d'investissement
- Flux de financement
- Variation de trésorerie
- Trésorerie de clôture

### 5. Annexes Calculables (13 notes)
- NOTE 3A : Immobilisations incorporelles
- NOTE 3B : Immobilisations corporelles
- NOTE 6 : État des stocks
- NOTE 7 : État des créances
- NOTE 10 : Capital social
- NOTE 11 : Réserves
- NOTE 13 : Résultat net
- NOTE 16 : Emprunts
- NOTE 17 : Dettes fournisseurs
- NOTE 21 : Chiffre d'affaires
- NOTE 22 : Achats
- NOTE 25 : Charges de personnel
- NOTE 26 : Impôts et taxes

### 6. États de Contrôle
- Équilibre du bilan
- Couverture de la balance
- Cohérence résultat
- Autres contrôles

---

## Format du Fichier

- **Type** : HTML
- **Nom** : `Etats_Financiers_Complet_YYYYMMDD_HHMMSS.html`
- **Emplacement** : Bureau de l'utilisateur
- **Taille** : ~50-100 KB
- **Style** : Professionnel, prêt à imprimer

---

## Avantages

✅ **Tout-en-un** : Tous les états dans un seul fichier  
✅ **Professionnel** : Design soigné et lisible  
✅ **Imprimable** : Optimisé pour l'impression  
✅ **Portable** : Fichier HTML autonome  
✅ **Horodaté** : Nom de fichier avec date et heure  
✅ **Automatique** : Ouverture automatique du fichier

---

## Dépannage

### Erreur: Fichier BALANCES_N_N1_N2.xlsx non trouvé

**Solution** : Créer le fichier avec les 3 onglets requis dans `py_backend/`

### Erreur: Module non trouvé

**Solution** : Activer l'environnement conda
```bash
conda activate claraverse_backend
```

### Le fichier ne s'ouvre pas automatiquement

**Solution** : Ouvrir manuellement depuis le Bureau

---

## Exemple de Résultat

```
Bureau/
  └── Etats_Financiers_Complet_20260322_193045.html
      ├── Bilan (Actif + Passif)
      ├── Compte de Résultat
      ├── Résultat Net
      ├── TFT
      ├── Annexes (13 notes)
      └── Contrôles
```

---

## Notes

- Le fichier est généré à partir de BALANCES_N_N1_N2.xlsx
- Les annexes sont calculées automatiquement
- Le TFT nécessite Balance N-1
- Conformité 100% SYSCOHADA Révisé

---

**Date** : 22 mars 2026  
**Version** : 1.0
