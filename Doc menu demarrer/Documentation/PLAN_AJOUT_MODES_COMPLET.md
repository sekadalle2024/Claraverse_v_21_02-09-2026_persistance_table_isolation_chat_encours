# Plan d'ajout des modes pour TOUTES les étapes

## Objectif
Ajouter les modes "Methodo audit" et "Guide des commandes" pour TOUTES les étapes qui ont des modes, en utilisant le mode "normal" comme base quand il n'y a pas de mode "avancé".

## Modifications déjà effectuées ✅

### E-audit pro - Phase de préparation
1. ✅ Collecte documentaire (avec mode avancé)
2. ✅ Questionnaire prise de connaissance (avec mode avancé)
3. ✅ Cartographie des processus (avec mode avancé)
4. ✅ Referentiel de controle interne (avec mode avancé)
5. ✅ Rapport d'orientation (avec mode avancé)

### E-revision - Planification
1. ✅ Design (avec mode demo)
2. ✅ Implementation (avec mode demo)

### Icônes
✅ Ajout de BookOpen pour "Methodo audit"
✅ Ajout de GraduationCap pour "Guide des commandes"

## Modifications à effectuer ⏳

### E-audit pro - Phase de préparation
- ⏳ Cartographie des risques (a un mode avancé)
- ⏳ Programme de travail (a un mode avancé)

### E-audit pro - Phase de conclusion
- ⏳ Frap (a un mode avancé)
- ⏳ Synthèse des Frap (a un mode avancé)
- ⏳ Rapport provisoire (a un mode avancé)
- ⏳ Rapport final (a un mode avancé)
- ⏳ Suivi des recos (a un mode avancé)

### E-revision - Planification
- ⏳ Evaluation risque (a un mode demo)
- ⏳ Feuille de couverture implementation (a un mode demo)
- ⏳ Programme de controle des comptes (a un mode demo)

### E-revision - Revue analytique
- ⏳ Revue analytique générale (a un mode avancé)
- ⏳ Analyse des variations (a un mode avancé)

### E-revision - Synthèse de mission
- ⏳ Recos revision des comptes (a seulement mode normal)
- ⏳ Recos contrôle interne comptable (a seulement mode normal)
- ⏳ Rapport de synthèse CAC (a seulement mode normal)

### E-audit plan
Toutes les étapes avec modes à vérifier

## Stratégie

Pour chaque étape :
1. Si elle a un mode "avancé" : Dupliquer le mode avancé et ajouter la variable appropriée
2. Si elle a un mode "demo" : Dupliquer le mode demo et remplacer [Demo] = Activate par la variable appropriée
3. Si elle a seulement un mode "normal" : Dupliquer le mode normal et ajouter la variable appropriée

## Variables à ajouter

- Mode "Methodo audit" : `[Guide Methodo] : Activate`
- Mode "Guide des commandes" : `[Guide des commandes] : Activate`

Position : AVANT `[Nb de lignes]` si présent, sinon à la fin de la commande
