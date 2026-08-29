# Exemples de Cas d'Usage - Évaluation des Risques

## 📋 Table des Matières
1. [Cas 1: Audit Financier](#cas-1-audit-financier)
2. [Cas 2: Gestion de Projet](#cas-2-gestion-de-projet)
3. [Cas 3: Conformité Réglementaire](#cas-3-conformité-réglementaire)
4. [Cas 4: Sécurité Informatique](#cas-4-sécurité-informatique)
5. [Cas 5: Conversion entre Matrices](#cas-5-conversion-entre-matrices)

---

## Cas 1: Audit Financier

### Contexte
Un auditeur évalue les risques financiers d'une entreprise selon la méthodologie ISA.

### Table Initiale
```
| Risque Identifié | Probabilité | Impact | Criticité | Contrôle |
|------------------|-------------|--------|-----------|----------|
| Fraude comptable | E | E | | |
| Erreur de saisie | M | F | | |
| Perte de données | F | M | | |
```

### Actions
1. Clic droit sur la table
2. Évaluation des risques → **Matrice Alpha 3 niveaux**
3. Le système calcule automatiquement:
   - Fraude comptable: E × E = **Elevé** (🔴 Rouge)
   - Erreur de saisie: M × F = **Faible** (🟢 Vert)
   - Perte de données: F × M = **Faible** (🟢 Vert)

### Résultat
```
| Risque Identifié | Probabilité | Impact | Criticité | Contrôle |
|------------------|-------------|--------|-----------|----------|
| Fraude comptable | Eleve 🔴 | Eleve 🔴 | Eleve 🔴 | Prioritaire |
| Erreur de saisie | Moyen 🟡 | Faible 🟢 | Faible 🟢 | Standard |
| Perte de données | Faible 🟢 | Moyen 🟡 | Faible 🟢 | Standard |
```

---

## Cas 2: Gestion de Projet

### Contexte
Un chef de projet évalue les risques d'un projet IT avec une matrice numérique.

### Table Initiale
```
| Risque Projet | Prob | Impact | Criticité | Action |
|---------------|------|--------|-----------|--------|
| Retard livraison | 3 | 4 | | |
| Dépassement budget | 2 | 3 | | |
| Turnover équipe | 1 | 2 | | |
```

### Actions
1. Clic droit sur la table
2. Évaluation des risques → **Matrice Num 4 niveaux**
3. Calcul automatique (Criticité = Prob × Impact):
   - Retard: 3 × 4 = **12** (🟠 Orange)
   - Budget: 2 × 3 = **6** (🟡 Jaune)
   - Turnover: 1 × 2 = **2** (🟢 Vert)

### Résultat
```
| Risque Projet | Prob | Impact | Criticité | Action |
|---------------|------|--------|-----------|--------|
| Retard livraison | 3 🟠 | 4 🔴 | 12 🟠 | Plan mitigation |
| Dépassement budget | 2 🟡 | 3 🟠 | 6 🟡 | Surveillance |
| Turnover équipe | 1 🟢 | 2 🟡 | 2 🟢 | Accepter |
```

---

## Cas 3: Conformité Réglementaire

### Contexte
Un risk manager évalue les risques de non-conformité avec une matrice 5 niveaux.

### Table Initiale
```
| Risque Conformité | Probabilité | Impact | Criticité | Mesure |
|-------------------|-------------|--------|-----------|--------|
| RGPD | 2 | 5 | | |
| Blanchiment | 1 | 5 | | |
| Fraude fiscale | 3 | 4 | | |
```

### Actions
1. Clic droit sur la table
2. Évaluation des risques → **Matrice Num 5 niveaux**
3. Calcul avec échelle 1-25:
   - RGPD: 2 × 5 = **10** (🟡 Jaune)
   - Blanchiment: 1 × 5 = **5** (🟢 Vert clair)
   - Fraude: 3 × 4 = **12** (🟡 Jaune)

### Résultat
```
| Risque Conformité | Probabilité | Impact | Criticité | Mesure |
|-------------------|-------------|--------|-----------|--------|
| RGPD | 2 🟢 | 5 🔴 | 10 🟡 | Formation équipe |
| Blanchiment | 1 🟢 | 5 🔴 | 5 🟢 | Procédures KYC |
| Fraude fiscale | 3 🟡 | 4 🟠 | 12 🟡 | Audit externe |
```

---

## Cas 4: Sécurité Informatique

### Contexte
Un RSSI évalue les risques cyber avec une matrice 4 niveaux (Mineur/Significatif/Majeur/Critique).

### Table Initiale
```
| Menace Cyber | Probabilité | Impact | Criticité | Réponse |
|--------------|-------------|--------|-----------|---------|
| Ransomware | Critique | Critique | | |
| Phishing | Majeur | Significatif | | |
| DDoS | Significatif | Mineur | | |
```

### Actions
1. Clic droit sur la table
2. Évaluation des risques → **Matrice Alpha 4 niveaux**
3. Calcul selon matrice 4×4:
   - Ransomware: Critique × Critique = **Critique** (🔴 Rouge)
   - Phishing: Majeur × Significatif = **Majeur** (🟠 Orange)
   - DDoS: Significatif × Mineur = **Mineur** (🟢 Vert)

### Résultat
```
| Menace Cyber | Probabilité | Impact | Criticité | Réponse |
|--------------|-------------|--------|-----------|---------|
| Ransomware | Critique 🔴 | Critique 🔴 | Critique 🔴 | Plan urgence |
| Phishing | Majeur 🟠 | Significatif 🟡 | Majeur 🟠 | Sensibilisation |
| DDoS | Significatif 🟡 | Mineur 🟢 | Mineur 🟢 | Monitoring |
```

---

## Cas 5: Conversion entre Matrices

### Contexte
Un analyste doit présenter les mêmes risques selon différentes méthodologies.

### Table de Départ (Format Lettre)
```
| Risque | Prob | Impact | Criticité |
|--------|------|--------|-----------|
| A | F | M | |
| B | M | E | |
| C | E | E | |
```

### Étape 1: Conversion Alpha 3
Clic droit → **Matrice Alpha 3 niveaux**
```
| Risque | Prob | Impact | Criticité |
|--------|------|--------|-----------|
| A | Faible 🟢 | Moyen 🟡 | Faible 🟢 |
| B | Moyen 🟡 | Eleve 🔴 | Eleve 🔴 |
| C | Eleve 🔴 | Eleve 🔴 | Eleve 🔴 |
```

### Étape 2: Conversion Num 3
Clic droit → **Matrice Num 3 niveaux**
```
| Risque | Prob | Impact | Criticité |
|--------|------|--------|-----------|
| A | 1 🟢 | 2 🟡 | 2 🟢 |
| B | 2 🟡 | 3 🔴 | 6 🟡 |
| C | 3 🔴 | 3 🔴 | 9 🔴 |
```

### Étape 3: Conversion Alpha 5
Clic droit → **Matrice Alpha 5 niveaux**
```
| Risque | Prob | Impact | Criticité |
|--------|------|--------|-----------|
| A | Faible 🟢 | Faible 🟢 | Faible 🟢 |
| B | Faible 🟢 | Modere 🟡 | Modere 🟡 |
| C | Modere 🟡 | Modere 🟡 | Modere 🟡 |
```

### Étape 4: Conversion Num 5
Clic droit → **Matrice Num 5 niveaux**
```
| Risque | Prob | Impact | Criticité |
|--------|------|--------|-----------|
| A | 2 🟢 | 2 🟢 | 4 🟢 |
| B | 2 🟢 | 3 🟡 | 6 🟡 |
| C | 3 🟡 | 3 🟡 | 9 🟡 |
```

---

## 🎯 Bonnes Pratiques

### 1. Choix de la Matrice
- **Alpha 3**: Évaluation rapide, simplicité
- **Alpha 5**: Granularité fine, analyse détaillée
- **Alpha 4**: Terminologie métier (Mineur/Critique)
- **Num 3**: Calculs simples, reporting
- **Num 4**: Équilibre granularité/simplicité
- **Num 5**: Maximum de précision

### 2. Workflow Recommandé
1. Identifier les risques
2. Évaluer Probabilité et Impact
3. Appliquer la matrice appropriée
4. Analyser les résultats (couleurs)
5. Définir les actions selon criticité

### 3. Interprétation des Couleurs
- 🟢 **Vert**: Risque acceptable, surveillance standard
- 🟡 **Jaune**: Risque à surveiller, actions préventives
- 🟠 **Orange**: Risque important, plan de mitigation
- 🔴 **Rouge**: Risque critique, action immédiate

### 4. Conversion entre Formats
- Commencer par le format le plus simple (Alpha 3)
- Affiner avec des matrices plus granulaires si nécessaire
- Utiliser le format numérique pour les calculs et graphiques
- Utiliser le format alphabétique pour la communication

---

## 📊 Tableau de Correspondance

| Alpha 3 | Alpha 5 | Alpha 4 | Num 3 | Num 4 | Num 5 | Couleur |
|---------|---------|---------|-------|-------|-------|---------|
| Faible | Très faible | Mineur | 1 | 1 | 1-2 | 🟢 Vert |
| Faible | Faible | Mineur | 1-2 | 1-2 | 2-3 | 🟢 Vert |
| Moyen | Modéré | Significatif | 2 | 2-3 | 3-4 | 🟡 Jaune |
| Moyen | Élevé | Majeur | 2-3 | 3 | 4 | 🟠 Orange |
| Elevé | Très élevé | Critique | 3 | 4 | 5 | 🔴 Rouge |

---

## ✅ Checklist d'Utilisation

- [ ] Identifier le contexte d'évaluation
- [ ] Choisir la matrice appropriée
- [ ] Créer la table avec colonnes: Risque, Probabilité, Impact, Criticité
- [ ] Remplir les valeurs de Probabilité et Impact
- [ ] Clic droit → Évaluation des risques → Choisir la matrice
- [ ] Vérifier les couleurs appliquées
- [ ] Vérifier les calculs de criticité
- [ ] Analyser les résultats
- [ ] Définir les actions selon les niveaux de risque
- [ ] Documenter les décisions

---

**Note**: Ces exemples sont fournis à titre illustratif. Adaptez les matrices et les seuils selon votre méthodologie et votre contexte organisationnel.
