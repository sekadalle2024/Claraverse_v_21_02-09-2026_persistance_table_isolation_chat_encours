# 01 - Contexte et Objectifs

Ce document décrit le projet de consolidation automatique des tables dans l'application Claraverse via le script `conso.js`.

## Objectif Principal
L'objectif est de permettre une synchronisation en temps réel entre :
1.  **La Table de Pointage (Source)** : Où l'utilisateur saisit des assertions (Validité, Exhaustivité, etc.) et des conclusions (Satisfaisant, Non-Satisfaisant, Limitation).
2.  **La Table de Consolidation (Intermédiaire)** : Une table générée dynamiquement juste au-dessus de la table de pointage, résumant les non-conformités par assertion avec les montants cumulés.
3.  **La Table RÉSULTAT (Cible Finale)** : Une table pré-existante dans le flux de la conversation (généralement au-dessus) qui doit recevoir la synthèse détaillée des anomalies pour le rapport final.

## Enjeux Techniques
-   **Compatibilité React** : Le script doit fonctionner dans un environnement où le DOM est géré par React, impliquant des re-renders fréquents qui peuvent écraser les modifications manuelles du DOM.
-   **Identification Stable** : Les tables n'ont pas d'ID uniques persistants. Il a fallu implémenter un système de hashage basé sur les en-têtes.
-   **Découverte Dynamique** : Les tables cibles (Résultat) peuvent se trouver n'importe où dans le document, nécessitant des stratégies de recherche robustes.
