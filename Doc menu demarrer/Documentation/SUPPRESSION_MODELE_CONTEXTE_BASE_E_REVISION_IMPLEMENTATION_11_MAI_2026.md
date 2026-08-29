# Suppression [Modele] et [Contexte de base] - E-revision Implementation

**Date:** 11 Mai 2026  
**Composant:** `src/components/Clara_Components/DemarrerMenu.tsx`  
**Logiciel:** E-revision  
**Section:** PLANIFICATION  
**Étape:** Implementation

## 📋 Objectif

Supprimer les lignes `[Modele]`, `[Contexte de base]` et leurs contenus des modes **Normal** et **Demo** de l'étape **Implementation** dans le logiciel **E-revision**, section **PLANIFICATION**.

## 🎯 Modifications Effectuées

### Mode Normal - AVANT
```typescript
command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Design du contrôle interne
[Etape de mission] = Implementation du contrôle interne
[Contexte de base]
Description de [Contexte de base]
[Contexte de base] contient les resultat des test sur le Design. Notre objectif est de faire des test pour confirmer ou infirmer l implementation des controle cle selon les resultats des test de design
Contenu de [Contexte de base]
{ "Etape mission - Design": [ { "table 1": { "Etape": "Programme de travail / Questionnaire de Contrôle Interne", "Normes": "Norme 2240 - Programme de travail de la mission", "Reference": "PRG-TRESO-002", "Methode": "Méthode des assertions par les objectifs de contrôle" } }, { "table 2": [ { "no": 1, "Sous processus": "Organisation et Séparation des tâches", "Objectif de contrôle": "Garantir l'indépendance de la fonction de rapprochement bancaire.", "Taches cle": "Définition des rôles", "Questionnaire identification risque": "La personne effectuant le rapprochement est-elle indépendante de la tenue de la caisse et de l'émission des paiements ?", "Assertion": "Séparation des exercices", "Dispositif de maitrises des risques du client": "Le comptable fournisseurs effectue les paiements et réalise également le rapprochement bancaire sur le logiciel Sage.", "Contrôle cle attendus": "Le Responsable Administratif et Financier s'assure que l'agent en charge du rapprochement n'a pas accès aux moyens de paiement ni aux écritures de caisse.", "references documentaire": "Fiches de poste, Matrice des droits d'accès SI", "Anomalies": "Cumul de fonctions incompatible créant un risque de dissimulation de fraude.", "Conclusion": "Non-Satisfaisant" } ] } ] }
[Modele] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
[Integration] = Implementation_modelisation
[Nb de lignes] = 25`
```

### Mode Normal - APRÈS
```typescript
command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Design du contrôle interne
[Etape de mission] = Implementation du contrôle interne
[Modele] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
[Integration] = Implementation_modelisation
[Nb de lignes] = 25`
```

### Mode Demo - AVANT
```typescript
command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Design du contrôle interne
[Etape de mission] = Implementation du contrôle interne
[Contexte de base]
Description de [Contexte de base]
[Contexte de base] contient les resultat des test sur le Design. Notre objectif est de faire des test pour confirmer ou infirmer l implementation des controle cle selon les resultats des test de design
Contenu de [Contexte de base]
{ "Etape mission - Design": [ { "table 1": { "Etape": "Programme de travail / Questionnaire de Contrôle Interne", "Normes": "Norme 2240 - Programme de travail de la mission", "Reference": "PRG-TRESO-002", "Methode": "Méthode des assertions par les objectifs de contrôle" } }, { "table 2": [ { "no": 1, "Sous processus": "Organisation et Séparation des tâches", "Objectif de contrôle": "Garantir l'indépendance de la fonction de rapprochement bancaire.", "Taches cle": "Définition des rôles", "Questionnaire identification risque": "La personne effectuant le rapprochement est-elle indépendante de la tenue de la caisse et de l'émission des paiements ?", "Assertion": "Séparation des exercices", "Dispositif de maitrises des risques du client": "Le comptable fournisseurs effectue les paiements et réalise également le rapprochement bancaire sur le logiciel Sage.", "Contrôle cle attendus": "Le Responsable Administratif et Financier s'assure que l'agent en charge du rapprochement n'a pas accès aux moyens de paiement ni aux écritures de caisse.", "references documentaire": "Fiches de poste, Matrice des droits d'accès SI", "Anomalies": "Cumul de fonctions incompatible créant un risque de dissimulation de fraude.", "Conclusion": "Non-Satisfaisant" } ] } ] }
[Modele] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
[Integration] = Implementation_modelisation
[Demo] = Activate
[Nb de lignes] = 25`
```

### Mode Demo - APRÈS
```typescript
command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Design du contrôle interne
[Etape de mission] = Implementation du contrôle interne
[Modele] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
[Integration] = Implementation_modelisation
[Demo] = Activate
[Nb de lignes] = 25`
```

## 📝 Lignes Supprimées

Pour chaque mode (Normal et Demo), les lignes suivantes ont été supprimées :

1. **`[Contexte de base]`**
2. **`Description de [Contexte de base]`**
3. **`[Contexte de base] contient les resultat des test sur le Design. Notre objectif est de faire des test pour confirmer ou infirmer l implementation des controle cle selon les resultats des test de design`**
4. **`Contenu de [Contexte de base]`**
5. **Le contenu JSON complet** (environ 800 caractères)

## ⚠️ Modes Non Modifiés

Les modes suivants **conservent** les lignes `[Modele]` et `[Contexte de base]` :
- ✅ **Methodo revision**
- ✅ **Guide des commandes**

## 🔧 Script Utilisé

**Fichier:** `Doc menu demarrer/Scripts/remove_modele_contexte_base_e_revision_implementation.py`

Le script utilise des expressions régulières pour identifier et supprimer précisément les lignes concernées dans les modes Normal et Demo uniquement.

## ✅ Résultat

- ✅ Mode Normal : Lignes supprimées avec succès
- ✅ Mode Demo : Lignes supprimées avec succès
- ✅ Mode Methodo revision : Conservé intact
- ✅ Mode Guide des commandes : Conservé intact

## 📊 Impact

Cette modification simplifie les commandes générées pour les modes Normal et Demo en supprimant le contexte de base volumineux, tout en conservant la structure complète pour les modes avancés (Methodo revision et Guide des commandes).

## 🎯 Commande de Test

Pour tester la modification dans l'interface :

1. Ouvrir le menu "Démarrer"
2. Sélectionner **E-revision**
3. Naviguer vers **PLANIFICATION** > **Implementation**
4. Vérifier les modes **Normal** et **Demo**
5. Confirmer que les lignes `[Contexte de base]` ont été supprimées

## 📅 Historique

- **11 Mai 2026** : Suppression initiale des lignes [Modele] et [Contexte de base] pour les modes Normal et Demo
