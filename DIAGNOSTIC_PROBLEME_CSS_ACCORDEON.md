# DIAGNOSTIC - Problème CSS Accordéon

**Date**: 23 mars 2026  
**Problème**: Le CSS des accordéons n'est pas appliqué dans le HTML généré

## Situation

1. ✅ Le fichier `py_backend/etats_financiers_v2.py` contient le BON CSS (vérifié)
2. ✅ Le module Python peut être importé et retourne le BON CSS (3164 caractères)
3. ❌ L'API retourne un HTML avec l'ANCIEN CSS (seulement `.liasse-table`, pas `.section-content-ef`)

## Tests Effectués

### Test 1: Vérification du fichier source
```powershell
Get-Content "py_backend/etats_financiers_v2.py" | Select-String -Pattern "\.section-content-ef"
```
✅ RÉSULTAT: Pattern trouvé dans le fichier

### Test 2: Import Python direct
```powershell
conda run -n claraverse_backend python -c "from etats_financiers_v2 import generate_css_liasse; css = generate_css_liasse(); print(len(css), '.section-content-ef' in css)"
```
✅ RÉSULTAT: 3164 True - Le module retourne le bon CSS

### Test 3: API HTTP
```powershell
.\test-api-curl.ps1
```
❌ RÉSULTAT: HTML reçu contient l'ancien CSS (59498 caractères, pas de `.section-content-ef`)

## Hypothèses

### Hypothèse 1: Cache Python (.pyc)
- ✅ Testé: Suppression de `py_backend/__pycache__`
- ❌ Résultat: Problème persiste

### Hypothèse 2: Processus backend non redémarré
- ✅ Testé: Arrêt de tous les processus Python + redémarrage
- ❌ Résultat: Problème persiste

### Hypothèse 3: Module importé depuis un autre endroit
- 🔍 À vérifier: Y a-t-il un autre fichier `etats_financiers_v2.py` ?
- 🔍 À vérifier: Le PYTHONPATH pointe-t-il vers un autre dossier ?

### Hypothèse 4: Le backend utilise une ancienne version du code
- 🔍 À vérifier: Le backend est-il vraiment redémarré ?
- 🔍 À vérifier: Y a-t-il plusieurs processus Python qui tournent ?

## Actions à Entreprendre

1. Vérifier qu'il n'y a qu'un seul fichier `etats_financiers_v2.py`:
   ```powershell
   Get-ChildItem -Path . -Recurse -Filter "etats_financiers_v2.py"
   ```

2. Vérifier les processus Python en cours:
   ```powershell
   Get-Process python | Select-Object Id, Path, StartTime
   ```

3. Ajouter des logs dans `etats_financiers.py` pour tracer l'appel:
   ```python
   logger.info(f"CSS généré: {len(html)} caractères")
   logger.info(f"CSS contient .section-content-ef: {'.section-content-ef' in html}")
   ```

4. Forcer le rechargement du module avec `importlib.reload()`:
   ```python
   import importlib
   import etats_financiers_v2
   importlib.reload(etats_financiers_v2)
   from etats_financiers_v2 import generate_css_liasse
   ```

## Solution Temporaire

En attendant de résoudre le problème de cache, ajouter le CSS directement dans `etats_financiers.py` au lieu d'importer depuis `etats_financiers_v2.py`.

## Prochaines Étapes

1. Identifier pourquoi le module n'est pas rechargé
2. Implémenter une solution de rechargement forcé
3. Tester avec le frontend React
