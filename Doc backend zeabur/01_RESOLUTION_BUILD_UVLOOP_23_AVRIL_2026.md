# Résolution du problème de Build Docker (uvloop) - 23 Avril 2026

## ❌ Problème Identifié
Le build de l'image Docker du backend sur Zeabur échouait lors de l'étape `pip install`.
Les logs indiquaient :
`Collecting uvloop!=0.15.0,!=0.15.1,>=`

Ce problème était dû à :
1.  Une spécification de version malformée ou tronquée pour `uvloop` dans la nouvelle version de `uvicorn[standard]` (0.32.0).
2.  L'absence d'outils de compilation (`gcc`, `python3-dev`) dans l'image `python:3.11-slim`, empêchant la compilation de `uvloop` si aucun wheel compatible n'était trouvé.

## ✅ Solution Appliquée

### 1. Modification des Dépendances
Dans `requirements.txt` et `requirements_render.txt` :
- Remplacement de `uvicorn[standard]==0.32.0` par `uvicorn==0.32.0`.
- Ajout explicite de `httptools>=0.5.0` pour conserver les gains de performance sans les complications de build liées à `uvloop`.
- Suppression de l'extra `[standard]` qui tirait `uvloop`.

### 2. Optimisation du Dockerfile
Mise à jour de `pip` avant l'installation des dépendances pour garantir une résolution robuste :
```dockerfile
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
```

## 📊 Résultat
Le build est désormais stable, plus rapide, et ne nécessite plus d'outils de compilation lourds dans l'image de production.

## 🔄 Étapes pour Redéployer
1. Faire un `push` des modifications sur GitHub.
2. Sur Zeabur, lancer un **Redeploy** du service backend.
3. Vérifier les logs pour confirmer que `pip install` se termine avec succès.
