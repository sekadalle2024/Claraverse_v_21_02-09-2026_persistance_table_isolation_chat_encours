# 🚀 Mémo Résolution Sauvegarde V17 - 05 Mai 2026

## 🎯 Problématique Rencontrée
La sauvegarde du projet ClaraVerse V17 (>140 Mo) a été exceptionnellement longue et complexe pour deux raisons majeures :

1.  **Blocage de Sécurité (Secret Scanning)** : GitHub a détecté une clé API OpenRouter hardcodée dans le code (`src/db/index.ts`) et dans plusieurs fichiers de documentation. Le push était systématiquement rejeté avec une erreur de violation de politique.
2.  **Taille du Projet** : Comme pour les versions précédentes, le volume de données (>140 Mo) provoquait des timeouts (HTTP 408) et des réinitialisations de connexion lors des tentatives de push standard.

---

## ✅ Solution Implémentée (Succès)

### 1. Nettoyage et Masquage
Toutes les occurrences de la clé API OpenRouter ont été remplacées par une version masquée :
- **Fichier impacté** : `src/db/index.ts`
- **Documentation impactée** : `Claraverse windows 11/*.md`, `CONFIGURATION_OPENROUTER_PAR_DEFAUT.md`, etc.
- **Masque utilisé** : `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxbb92`

### 2. Branche Orpheline (Clean History)
Pour éviter que GitHub ne rejette le push à cause des *anciens commits* contenant encore les secrets dans leur historique, nous avons utilisé une branche "orpheline" :
```powershell
git checkout --orphan v17_backup_final
git reset
```
Cela permet de repartir sur une base 100% propre, sans aucun historique compromis.

### 3. Push Fragmenté (6 Parties)
Nous avons utilisé le script `push-claraverse-v17-05-mai-2026.ps1` pour téléverser le projet par segments :
- **Partie 1** : Code Source (src/)
- **Partie 2** : Backend (py_backend/)
- **Partie 3** : Public (public/)
- **Partie 4** : Documentation Principale
- **Partie 5** : Autres Documentations
- **Partie 6** : Reste du projet

---

## 🛠️ Outils Sauvegardés
Les outils utilisés pour cette session sont archivés dans `Doc_Github_Issue/` :
- `push-claraverse-v17-05-mai-2026.ps1` : Script de push fragmenté mis à jour.
- `00_MEMO_RESOLUTION_PUSH_V17_SECRETS_ET_CHUNK_05_MAI_2026.md` : Ce présent mémo.

---

## 💡 Leçons Apprises
- **Ne jamais hardcoder de clés API** : Même dans les fichiers de documentation, GitHub les détecte et bloque tout le repo.
- **La branche orpheline est radicale mais efficace** : C'est la solution ultime quand l'historique Git bloque un push pour des raisons de sécurité.
- **HTTP/1.1** : En cas de "Connection Reset" persistant, forcer `git config http.version HTTP/1.1` peut aider à stabiliser la connexion.

---

**Date** : 05 Mai 2026  
**Statut** : ✅ Sauvegarde V17 terminée et sécurisée sur `v17_backup_final`.
