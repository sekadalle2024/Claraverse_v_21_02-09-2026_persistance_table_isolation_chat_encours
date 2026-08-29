# Modifications des Modes du Menu Démarrer

## Objectif
Ajouter deux nouveaux modes pour toutes les étapes de mission dans E-audit pro et E-audit revision :
1. **Mode Methodo audit** : Mode avancé + `[Guide Methodo] : Activate`
2. **Mode Guide des commandes** : Mode avancé + `[Guide des commandes] : Activate`

## Modifications effectuées

### 1. Ajout des nouveaux modes dans la liste MODES
✅ Ajouté `methodo` et `guide-commandes` dans la constante MODES

### 2. E-audit pro - Phase de préparation

#### Étapes modifiées :
- ✅ Collecte documentaire
- ✅ Questionnaire prise de connaissance  
- ✅ Cartographie des processus
- ✅ Referentiel de controle interne
- ✅ Rapport d'orientation

#### Étapes restantes à modifier :
- ⏳ Cartographie des risques (structure différente - pas de [Etape de mission])
- ⏳ Programme de travail (structure différente - pas de [Etape de mission])

### 3. E-audit pro - Phase de réalisation
- Feuille couverture (pas de modes - commande simple)

### 4. E-audit pro - Phase de conclusion
- ⏳ Frap
- ⏳ Synthèse des Frap
- ⏳ Rapport provisoire
- Réunion de clôture (pas de modes - commande simple)
- ⏳ Rapport final
- ⏳ Suivi des recos

### 5. E-revision - Planification
- ⏳ Design (structure différente - utilise [Demo] au lieu de [Mode] = Avancé)
- ⏳ Implementation (structure différente - utilise [Demo] au lieu de [Mode] = Avancé)
- ⏳ Evaluation risque (structure différente - utilise [Demo] au lieu de [Mode] = Avancé)
- ⏳ Feuille de couverture implementation (structure différente)
- ⏳ Programme de controle des comptes (structure différente)

### 6. E-revision - Revue analytique
- ⏳ Revue analytique générale
- ⏳ Analyse des variations

### 7. E-audit plan
Toutes les étapes avec [Etape de mission] à vérifier et modifier

## Structure des nouveaux modes

```typescript
{
  id: 'methodo',
  label: 'Methodo audit',
  command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = ...
[Etape de mission] = ...
[Modele] : ...
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide Methodo] : Activate
[Nb de lignes] = 30`
},
{
  id: 'guide-commandes',
  label: 'Guide des commandes',
  command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = ...
[Etape de mission] = ...
[Modele] : ...
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide des commandes] : Activate
[Nb de lignes] = 30`
}
```

## Prochaines étapes
1. Continuer les modifications pour les étapes restantes d'E-audit pro
2. Adapter la structure pour E-revision (qui utilise [Demo] au lieu de [Mode] = Avancé)
3. Vérifier et modifier E-audit plan
4. Tester l'interface pour s'assurer que les nouveaux modes apparaissent correctement
