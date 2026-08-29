# Guide des États de Contrôle - États Financiers SYSCOHADA

## Vue d'Ensemble

Le système génère automatiquement 8 états de contrôle exhaustifs pour garantir la fiabilité et la cohérence des états financiers produits.

## 1. Statistiques de Couverture 📊

### Objectif
Mesurer le taux d'intégration des comptes de la balance dans les états financiers.

### Indicateurs
- **Comptes intégrés** : Nombre de comptes reconnus et intégrés
- **Comptes non intégrés** : Nombre de comptes non reconnus
- **Taux de couverture** : Pourcentage de comptes intégrés

### Interprétation
- **≥ 95%** : ✅ Excellent (badge vert)
- **80-94%** : ⚠️ Acceptable (badge orange)
- **< 80%** : ❌ Insuffisant (badge rouge)

### Actions Correctives
- Vérifier le tableau de correspondance
- Ajouter les racines de comptes manquantes
- Contrôler la codification des comptes

---

## 2. Équilibre du Bilan ⚖️

### Objectif
Vérifier que le bilan est équilibré (Actif = Passif).

### Contrôles
- **Total Actif** : Somme de tous les postes d'actif
- **Total Passif** : Somme de tous les postes de passif
- **Différence** : Actif - Passif
- **Pourcentage d'écart** : (Différence / Actif) × 100

### Seuil de Tolérance
- **< 0,01** : ✅ Équilibré
- **≥ 0,01** : ❌ Déséquilibré

### Causes Possibles de Déséquilibre
1. Comptes avec sens inversé
2. Comptes non intégrés
3. Erreurs de saisie dans la balance
4. Mauvaise application du sens débit/crédit

---

## 3. Cohérence Résultat (Bilan vs Compte de Résultat) 💰

### Objectif
Vérifier que le résultat calculé par le compte de résultat correspond au résultat du bilan.

### Formules
- **Résultat CR** : Produits - Charges
- **Résultat Bilan** : Actif - Passif
- **Différence** : Résultat CR - Résultat Bilan

### Interprétation
- **Différence < 0,01** : ✅ Cohérent
- **Différence ≥ 0,01** : ⚠️ Incohérent

### Causes Possibles d'Incohérence
1. Résultat non affecté au bilan (compte 13)
2. Comptes de gestion mal classés
3. Comptes de bilan mal classés
4. Erreurs dans le tableau de correspondance

---

## 4. Comptes Non Intégrés ⚠️

### Objectif
Identifier les comptes de la balance qui n'ont pas été intégrés dans les états financiers.

### Informations Affichées
| Colonne | Description |
|---------|-------------|
| N° Compte | Numéro du compte |
| Intitulé | Libellé du compte |
| Classe | Première lettre du compte (1-8) |
| Solde Débit | Montant au débit |
| Solde Crédit | Montant au crédit |
| Solde Net | Débit - Crédit |
| Raison | Cause de la non-intégration |

### Impact
- **Montant total** : Somme des valeurs absolues des soldes nets
- **Pourcentage de l'actif** : Impact relatif sur le total actif

### Actions Correctives
1. Vérifier la codification du compte
2. Ajouter la racine dans `correspondances_syscohada.json`
3. Vérifier si le compte doit être intégré
4. Contrôler la cohérence avec le plan comptable SYSCOHADA

---

## 5. Comptes avec Sens Inversé 🔄

### Objectif
Détecter les comptes ayant un solde contraire au sens normal de leur classe.

### Sens Normal par Classe
| Classe | Sens Normal | Description |
|--------|-------------|-------------|
| 1 | Crédit | Capitaux propres et dettes |
| 2 | Débit | Immobilisations |
| 3 | Débit | Stocks |
| 4 | Variable | Comptes de tiers (mixte) |
| 5 | Débit | Trésorerie |
| 6 | Débit | Charges |
| 7 | Crédit | Produits |
| 8 | Variable | Comptes spéciaux |

### Informations Affichées
- N° Compte
- Intitulé
- Classe
- Sens Attendu
- Sens Réel (en rouge)
- Solde Net

### Interprétation
Un compte avec sens inversé peut indiquer :
- Une erreur de saisie
- Une opération exceptionnelle
- Un compte de régularisation
- Une anomalie comptable

### Actions
1. Vérifier la nature de l'opération
2. Contrôler les écritures comptables
3. Valider avec le comptable si nécessaire

---

## 6. Comptes Créant un Déséquilibre ⚠️

### Objectif
Identifier les comptes qui créent un déséquilibre en raison d'un sens incorrect pour leur section.

### Règles de Sens par Section

#### Bilan Actif
- **Sens attendu** : Débit (positif)
- **Problème** : Solde créditeur sur un compte d'actif

#### Bilan Passif
- **Sens attendu** : Crédit (négatif)
- **Problème** : Solde débiteur sur un compte de passif

#### Charges
- **Sens attendu** : Débit (positif)
- **Problème** : Solde créditeur sur un compte de charges

#### Produits
- **Sens attendu** : Crédit (négatif)
- **Problème** : Solde débiteur sur un compte de produits

### Informations Affichées
- N° Compte
- Intitulé
- Section
- Problème (description)
- Solde

### Impact
Ces comptes créent un déséquilibre car leur sens est contraire à celui attendu pour leur section, ce qui fausse les totaux.

### Actions Correctives
1. Vérifier la classification du compte
2. Contrôler les écritures comptables
3. Vérifier le tableau de correspondance
4. Corriger la balance si nécessaire

---

## 7. Hypothèse d'Affectation du Résultat 💡

### Objectif
Calculer une hypothèse de ce qui se passerait si le résultat était affecté au passif (compte 13).

### Principe
Ce contrôle ne modifie PAS les données, il calcule uniquement une hypothèse pour vérifier si l'affectation du résultat équilibrerait le bilan.

### Informations Affichées

#### Situation Actuelle
- **Actif** : Total de l'actif
- **Passif** : Total du passif (sans le résultat)
- **Différence** : Actif - Passif

#### Hypothèse (si résultat affecté au passif)
- **Résultat Net** : Montant du résultat (Produits - Charges)
- **Passif + Résultat** : Passif après affectation hypothétique
- **Différence** : Actif - (Passif + Résultat)
- **Équilibre** : OUI si différence < 0,01

### Type de Résultat
- **Bénéfice** : Résultat positif (badge vert)
- **Perte** : Résultat négatif (badge rouge)
- **Nul** : Résultat = 0

### Recommandation
- **"Affecter le résultat au passif (compte 13)"** : Si l'hypothèse équilibre le bilan
- **"Vérifier les écritures comptables"** : Si l'hypothèse ne résout pas le déséquilibre

### Utilité
- Comprendre l'origine d'un déséquilibre
- Vérifier si le résultat a été correctement affecté
- Identifier les erreurs de classification

---

## 8. Comptes avec Sens Anormal par Nature 🚨

### Objectif
Détecter les comptes ayant un solde contraire au sens normal attendu selon leur nature comptable spécifique (au-delà du simple contrôle par classe).

### Différence avec le Contrôle par Classe
- **Contrôle par classe** : Vérifie le sens selon la classe générale (1-7)
- **Contrôle par nature** : Vérifie le sens selon la nature spécifique du compte (Capital social, Caisse, etc.)

### Niveaux de Gravité

#### 🔴 CRITIQUE - Déséquilibre majeur
Exemples :
- Capital social débiteur (101)
- Caisse négative (54)
- Banques créditrices (52, 53)

**Action** : Correction immédiate requise

#### 🟠 ÉLEVÉ - Anomalie comptable
Exemples :
- Immobilisations créditrices (21, 22, 23, 24)
- Clients créditeurs (411)
- État débiteur (44)
- Réserves débitrices (11)

**Action** : Vérification et correction prioritaire

#### 🔵 MOYEN - À vérifier
Exemples :
- Report à nouveau débiteur (12)
- Fournisseurs débiteurs (401)
- Amortissements débiteurs (28)

**Action** : Analyse et justification nécessaire

#### ⚪ FAIBLE - Situation exceptionnelle possible
Exemples :
- Comptes de gestion avec sens inversé
- Comptes de régularisation

**Action** : Vérification de routine

### Informations Affichées
| Colonne | Description |
|---------|-------------|
| Gravité | Badge coloré (CRITIQUE, ÉLEVÉ, MOYEN, FAIBLE) |
| N° Compte | Numéro du compte |
| Nature | Nature comptable du compte |
| Intitulé | Libellé du compte |
| Sens Attendu | Sens normal selon la nature |
| Sens Réel | Sens réel dans la balance (en couleur) |
| Solde Net | Montant du solde |

### Règles de Sens Normal

Voir la documentation détaillée : `Doc_Etat_Fin/CONTROLE_SENS_ANORMAL_PAR_NATURE.md`

### Exemples de Détection

#### Exemple 1 : Capital Social Débiteur (CRITIQUE)
```
Compte : 101000 - Capital social
Sens attendu : CRÉDIT
Sens réel : DÉBIT
Solde : 50 000 (débiteur)
Impact : Le capital ne peut pas être débiteur
```

#### Exemple 2 : Caisse Négative (CRITIQUE)
```
Compte : 541000 - Caisse
Sens attendu : DÉBIT
Sens réel : CRÉDIT
Solde : -5 000 (créditeur)
Impact : La caisse ne peut pas être négative
```

#### Exemple 3 : Banque Créditrice (CRITIQUE)
```
Compte : 521100 - Banque SGCI
Sens attendu : DÉBIT
Sens réel : CRÉDIT
Solde : -15 000 (créditeur)
Impact : Découvert bancaire - À reclasser en dettes financières
```

### Actions Correctives

#### Pour les Comptes CRITIQUES
1. Vérifier les écritures comptables
2. Corriger les erreurs de saisie
3. Reclasser les comptes si nécessaire
4. Justifier les situations exceptionnelles

#### Pour les Comptes ÉLEVÉS
1. Analyser les causes
2. Vérifier la cohérence avec les pièces justificatives
3. Documenter les situations particulières

#### Pour les Comptes MOYENS
1. Analyser le contexte
2. Justifier les situations
3. Documenter pour l'audit

---

## Utilisation des États de Contrôle

### Workflow Recommandé

1. **Génération des états**
   - Taper "Etat fin"
   - Sélectionner le fichier Balance Excel
   - Consulter les états de contrôle en premier

2. **Analyse des contrôles**
   - Vérifier le taux de couverture (objectif : ≥ 95%)
   - Contrôler l'équilibre du bilan
   - Vérifier la cohérence du résultat
   - Examiner l'hypothèse d'affectation du résultat
   - Analyser les comptes avec sens anormal par nature

3. **Traitement des anomalies**
   - **Priorité 1** : Comptes CRITIQUES (sens anormal par nature)
   - **Priorité 2** : Comptes en déséquilibre
   - **Priorité 3** : Comptes non intégrés
   - **Priorité 4** : Comptes avec sens inversé (classe)
   - **Priorité 5** : Comptes ÉLEVÉS et MOYENS (sens anormal par nature)

4. **Validation**
   - Tous les contrôles au vert
   - Taux de couverture satisfaisant
   - Équilibres respectés
   - Aucun compte CRITIQUE détecté

### Seuils de Qualité

| Indicateur | Excellent | Acceptable | Insuffisant |
|------------|-----------|------------|-------------|
| Taux de couverture | ≥ 95% | 80-94% | < 80% |
| Équilibre bilan | < 0,01 | 0,01-0,1 | > 0,1 |
| Cohérence résultat | < 0,01 | 0,01-0,1 | > 0,1 |
| Comptes non intégrés | 0-5 | 6-20 | > 20 |
| Comptes CRITIQUES | 0 | 0 | > 0 |
| Comptes ÉLEVÉS | 0-2 | 3-10 | > 10 |

---

## Exemples de Corrections

### Exemple 1 : Compte Non Intégré

**Problème** : Compte 2154000 "Matériel informatique" non intégré

**Solution** :
1. Ouvrir `py_backend/correspondances_syscohada.json`
2. Trouver le poste AM "Matériel"
3. Ajouter la racine "2154" si manquante
4. Relancer le traitement

### Exemple 2 : Sens Inversé

**Problème** : Compte 401 "Fournisseurs" avec solde débiteur

**Analyse** :
- Classe 4 (Tiers) : sens variable
- Solde débiteur = avance versée au fournisseur
- Situation normale si avance réelle

**Action** : Vérifier la nature de l'opération

### Exemple 3 : Déséquilibre

**Problème** : Compte 211 "Frais de développement" avec solde créditeur

**Analyse** :
- Compte d'actif avec solde créditeur
- Crée un déséquilibre au bilan

**Solution** :
- Vérifier les écritures comptables
- Corriger la balance si erreur de saisie

### Exemple 4 : Sens Anormal par Nature (CRITIQUE)

**Problème** : Compte 521100 "Banque SGCI" avec solde créditeur de -15 000

**Analyse** :
- Nature : Banques (gravité CRITIQUE)
- Sens attendu : DÉBIT
- Sens réel : CRÉDIT
- Impact : Découvert bancaire

**Solution** :
1. Vérifier s'il s'agit d'un découvert réel
2. Si oui, reclasser en dettes financières (compte 56)
3. Si non, corriger l'erreur de saisie

### Exemple 5 : Hypothèse d'Affectation

**Problème** : Bilan déséquilibré avec différence de 189 540 500

**Analyse** :
- Résultat Net : -189 540 500 (PERTE)
- Actif : 181 162 530
- Passif : 370 703 030
- Différence avant : -189 540 500
- Passif + Résultat : 181 162 530
- Différence après : 0

**Conclusion** : L'affectation du résultat au passif équilibrerait le bilan

**Action** : Affecter le résultat au compte 13 (Report à nouveau ou Résultat de l'exercice)

---

## Fichiers Concernés

- `py_backend/etats_financiers.py` : Logique de contrôle
- `py_backend/correspondances_syscohada.json` : Tableau de correspondance
- `public/EtatFinAutoTrigger.js` : Affichage des contrôles

## Date de Création
22 mars 2026
