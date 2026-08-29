# Documentation Backend Zeabur - ClaraVerse

Ce dossier centralise les interventions, solutions et scripts liés à la maintenance et au déploiement du backend Python sur Zeabur.

## 📋 Mémos et Résolutions

1. [01_RESOLUTION_BUILD_UVLOOP_23_AVRIL_2026.md](01_RESOLUTION_BUILD_UVLOOP_23_AVRIL_2026.md)
   * Résolution du plantage lors du `pip install` (problème uvloop).
   * Optimisation du `Dockerfile` et de `requirements.txt`.

2. [02_STANDARDISATION_ROUTES_WORD_23_AVRIL_2026.md](02_STANDARDISATION_ROUTES_WORD_23_AVRIL_2026.md)
   * Standardisation des préfixes `/api/word/`.
   * Correction des erreurs 404 sur les exports de rapports (CAC, Audit).

## 🚀 Scripts Utilitaires

Les scripts se trouvent dans le sous-dossier `Scripts/` :

*   **[push-backend-updates.ps1](Scripts/push-backend-updates.ps1)** : Automatisation du push vers GitHub pour déclencher le déploiement.
*   **[test-cac-export.ps1](Scripts/test-cac-export.ps1)** : Test rapide de connectivité et de génération Word.

## 🔧 Configuration Critique
*   **Port** : 8080 (Configuré dans le Dockerfile).
*   **CORS** : Les origines sont explicitement listées dans `main.py` (ALLOWED_ORIGINS).
*   **Image de base** : `python:3.11-slim` (mise à jour via `pip upgrade` lors du build).

---
*Dernière mise à jour : 23 Avril 2026*
