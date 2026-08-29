# Exemples de Transformation des Commandes

Ce document présente des exemples concrets de transformation des commandes du menu Démarrer.

## 📋 Exemple 1 : Feuille de Couverture (E-audit pro)

### Avant (Format Normal - ❌ Échoue)
```
[Command] = Couverture
[Processus] = Sécurité trésorerie
[Contrôle] = Verifier l exhaustivite des inventaires de caisse
[Instruction] = Template
[Nb de lignes] = 15
[Modele de test] = no, compte, site, libelle, solde BG, Solde Pv inventaire
```

### Après (Format Liste à Puces - ✅ Réussit)
```
- [Command] = Couverture
- [Processus] = Sécurité trésorerie
- [Contrôle] = Verifier l exhaustivite des inventaires de caisse
- [Instruction] = Template
- [Nb de lignes] = 15
- [Modele de test] = no, compte, site, libelle, solde BG, Solde Pv inventaire
```

---

## 📋 Exemple 2 : Design (E-revision)

### Avant (Format Normal - ❌ Échoue)
```
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Prise de connaissance du domaine audite
[Etape de mission] = Design
[Modele] : Sous processus, Objectif de contrôle, Taches cle, Questionnaire identification risque, Assertion, Dispositif de maitrises des risques du client, Contrôle cle attendus, references documentaire, Anomalies, Conclusion
[Directive] = Remplir toutes les colonnes en simulant des lignes satisfaisante t des lignes non satisfaisantes
[Integration] = Design
[Nb de lignes] = 10
```

### Après (Format Liste à Puces - ✅ Réussit)
```
- [Command] = Etape de mission
- [Processus] = rapprochements bancaires
- [test] : DD155
- [Etape précédente] = Prise de connaissance du domaine audite
- [Etape de mission] = Design
- [Modele] : Sous processus, Objectif de contrôle, Taches cle, Questionnaire identification risque, Assertion, Dispositif de maitrises des risques du client, Contrôle cle attendus, references documentaire, Anomalies, Conclusion
- [Directive] = Remplir toutes les colonnes en simulant des lignes satisfaisante t des lignes non satisfaisantes
- [Integration] = Design
- [Nb de lignes] = 10
```

---

## 📋 Exemple 3 : Mode Demo (E-revision)

### Avant (Format Normal - ❌ Échoue)
```
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Prise de connaissance du domaine audite
[Etape de mission] = Design
[Modele] : Sous processus, Objectif de contrôle, Taches cle, Questionnaire identification risque, Assertion, Dispositif de maitrises des risques du client, Contrôle cle attendus, references documentaire, Anomalies, Conclusion
[Directive] = Remplir toutes les colonnes en simulant des lignes satisfaisante t des lignes non satisfaisantes
[Integration] = Design
[Nb de lignes] = 10
[Demo] = Activate
```

### Après (Format Liste à Puces - ✅ Réussit)
```
- [Command] = Etape de mission
- [Processus] = rapprochements bancaires
- [test] : DD155
- [Etape précédente] = Prise de connaissance du domaine audite
- [Etape de mission] = Design
- [Modele] : Sous processus, Objectif de contrôle, Taches cle, Questionnaire identification risque, Assertion, Dispositif de maitrises des risques du client, Contrôle cle attendus, references documentaire, Anomalies, Conclusion
- [Directive] = Remplir toutes les colonnes en simulant des lignes satisfaisante t des lignes non satisfaisantes
- [Integration] = Design
- [Nb de lignes] = 10
- [Demo] = Activate
```

---

## 📋 Exemple 4 : Test de Cycle (E-revision - Trésorerie)

### Avant (Format Normal - ❌ Échoue)
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = Rapprochements
[Nb de lignes] = 10
```

### Après (Format Liste à Puces - ✅ Réussit)
```
- [Command] = /feuille couverture
- [Processus] = Trésorerie
- [test] = AA040
- [reference] = Rapprochements
- [Nb de lignes] = 10
```

---

## 📋 Exemple 5 : Rapport Provisoire (E-audit pro)

### Avant (Format Normal - ❌ Échoue)
```
[Command] = /Table rapport_provisoire
[Command Manuel] = Étape mission
[Étape précédente] = Synthèse des Frap
[Étape mission] = Rapport provisoire
[Modèle] = 
[Pièces jointes] = Synthèse des Frap
```

### Après (Format Liste à Puces - ✅ Réussit)
```
- [Command] = /Table rapport_provisoire
- [Command Manuel] = Étape mission
- [Étape précédente] = Synthèse des Frap
- [Étape mission] = Rapport provisoire
- [Modèle] = 
- [Pièces jointes] = Synthèse des Frap
```

---

## 📋 Exemple 6 : Evaluation des Risques (E-revision)

### Avant (Format Normal - ❌ Échoue)
```
[Command] = Evaluation des risques
[Processus] = Controle des rapprochements bancaires
[Modele] : Sous processus, Taches cle, Assertion, risque, évaluation risque, probabilité, impact, controle audit
[Matrice de criticite] = Matrice alphabetique - 4 niveau
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_cartographie
[Nb de lignes] = 25
```

### Après (Format Liste à Puces - ✅ Réussit)
```
- [Command] = Evaluation des risques
- [Processus] = Controle des rapprochements bancaires
- [Modele] : Sous processus, Taches cle, Assertion, risque, évaluation risque, probabilité, impact, controle audit
- [Matrice de criticite] = Matrice alphabetique - 4 niveau
- [Contexte de base]
- [Modelisation] : les informations des rapprochements bancaires
- [Integration] = Implementation_cartographie
- [Nb de lignes] = 25
```

---

## 📋 Exemple 7 : Commande avec Contexte JSON (E-revision - Implementation)

### Avant (Format Normal - ❌ Échoue)
```
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Design du contrôle interne
[Etape de mission] = Implementation du contrôle interne
[Contexte de base]
Description de [Contexte de base]
[Contexte de base] contient les resultat des test sur le Design. Notre objectif est de faire des test pour confirmer ou infirmer l implementation des controle cle selon les resultats des test de design
Contenu de [Contexte de base]
{ "Etape mission - Design": [ { "table 1": { "Etape": "Programme de travail / Questionnaire de Contrôle Interne", "Normes": "Norme 2240 - Programme de travail de la mission", "Reference": "PRG-TRESO-002", "Methode": "Méthode des assertions par les objectifs de contrôle" } } ] }
[Modele] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
[Integration] = Implementation_modelisation
[Nb de lignes] = 25
```

### Après (Format Liste à Puces - ✅ Réussit)
```
- [Command] = Etape de mission
- [Processus] = rapprochements bancaires
- [test] : DD155
- [Etape précédente] = Design du contrôle interne
- [Etape de mission] = Implementation du contrôle interne
- [Contexte de base]
Description de [Contexte de base]
- [Contexte de base] contient les resultat des test sur le Design. Notre objectif est de faire des test pour confirmer ou infirmer l implementation des controle cle selon les resultats des test de design
Contenu de [Contexte de base]
{ "Etape mission - Design": [ { "table 1": { "Etape": "Programme de travail / Questionnaire de Contrôle Interne", "Normes": "Norme 2240 - Programme de travail de la mission", "Reference": "PRG-TRESO-002", "Methode": "Méthode des assertions par les objectifs de contrôle" } } ] }
- [Modele] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
- [Integration] = Implementation_modelisation
- [Nb de lignes] = 25
```

**Note :** Les objets JSON et les lignes de description sont préservés tels quels.

---

## 🎯 Règles de Transformation

La fonction `formatCommandWithBullets()` applique les règles suivantes :

1. ✅ **Ligne commençant par `[`** → Ajouter `- ` au début
2. ✅ **Ligne vide** → Conserver telle quelle
3. ✅ **Ligne déjà avec tiret** → Ne pas dupliquer
4. ✅ **Objet JSON** → Conserver tel quel
5. ✅ **Texte descriptif** → Conserver tel quel

---

## 🧪 Comment Tester

Pour chaque exemple ci-dessus :

1. Ouvrir le menu Démarrer
2. Naviguer vers la rubrique correspondante
3. Sélectionner le mode approprié
4. Vérifier que la commande générée correspond au format "Après"
5. Envoyer le prompt vers l'endpoint n8n
6. ✅ Vérifier que le prompt réussit

---

## ✅ Résultat Attendu

Toutes les commandes générées par le menu Démarrer doivent maintenant :

- ✅ Avoir des tirets devant chaque ligne `[...]`
- ✅ Préserver les lignes vides et les objets JSON
- ✅ Fonctionner correctement avec l'endpoint n8n
- ✅ Être prêtes à l'envoi sans modification manuelle

---

**Statut :** ✅ Implémenté et validé  
**Date :** 8 mars 2024
