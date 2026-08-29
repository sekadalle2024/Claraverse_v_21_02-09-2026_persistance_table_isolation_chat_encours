# 🎲 Guide Échantillonnage Audit - ClaraVerse

## Vue d'ensemble

Module d'échantillonnage statistique pour l'audit, inspiré des logiciels ACL, IDEA et TeamMate Analytics.

## Méthodes disponibles

| Méthode | Raccourci | Description | Cas d'usage |
|---------|-----------|-------------|-------------|
| Aléatoire simple | `Ctrl+Shift+1` | Sélection aléatoire X enregistrements | Tests de contrôle, sondages |
| Systématique | `Ctrl+Shift+2` | Sélection tous les N enregistrements | Échantillonnage régulier |
| Monétaire (MUS) | `Ctrl+Shift+3` | Proportionnel aux montants | Audit comptes, validation soldes |
| Stratifié | `Ctrl+Shift+4` | Par sous-groupes | Représentativité par catégories |
| Enregistrements fixes | `Ctrl+Shift+5` | Sélection spécifique | Tests ciblés |
| Avec remise | `Ctrl+Shift+6` | Tirage avec répétition | Études statistiques |
| Taille échantillon | `Ctrl+Shift+S` | Calcul automatique | Planification audit |

## Utilisation

### Via le menu contextuel
1. Cliquez sur une table dans le chat
2. Ouvrez le menu contextuel (survol ou clic droit)
3. Section **"Échantillonnage Audit"** 🎲
4. Sélectionnez la méthode souhaitée

### Via raccourcis clavier
- Sélectionnez d'abord une table
- Utilisez les raccourcis `Ctrl+Shift+1` à `Ctrl+Shift+6`

## Backend Python

Le module utilise un agent Python basé sur pandas et scipy.

### Démarrage
```bash
cd py_backend
python main.py
```

### Endpoints API
- `POST /echantillonnage/sample` - Effectuer un échantillonnage
- `POST /echantillonnage/calculate-size` - Calculer taille optimale
- `GET /echantillonnage/status` - Vérifier le statut

## Test

Ouvrez `public/test-echantillonnage.html` dans votre navigateur pour tester toutes les méthodes.

## Formule taille échantillon (ISA)

```
n = (Z² × p × (1-p)) / E²
```
Ajusté pour population finie.

- Z = Z-score (1.96 pour 95%)
- p = proportion erreurs attendues
- E = erreur tolérable
