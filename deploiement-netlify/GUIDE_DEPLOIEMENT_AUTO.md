# Guide de Déploiement Automatique Netlify

## Deux scripts disponibles

### 1. deploy.ps1 (Recommandé)
Script principal avec le site ID pré-configuré.

```powershell
.\deploy.ps1
```

Ou avec un message personnalisé :
```powershell
.\deploy.ps1 -Message "Ajout nouvelle fonctionnalite X"
```

### 2. deploy-auto.ps1 (Alternative)
Version alternative qui utilise également le site ID automatiquement.

```powershell
.\deploy-auto.ps1
```

## Configuration

Les deux scripts utilisent automatiquement :
- Site ID: `prclaravi`
- Site URL: https://prclaravi.netlify.app
- Configuration: `.netlify/state.json`

## Aucune interaction requise

Les scripts sont maintenant 100% automatiques :
- ✅ Pas de demande de login (utilise la session active)
- ✅ Pas de demande de nom de projet (utilise `prclaravi`)
- ✅ Pas de confirmation manuelle

## Prérequis

Avant la première utilisation, assurez-vous d'être authentifié :
```powershell
netlify login
```

Cette authentification reste active et n'a besoin d'être faite qu'une seule fois.

## Historique

Chaque déploiement est automatiquement enregistré dans `HISTORIQUE_DEPLOIEMENTS.md`.
