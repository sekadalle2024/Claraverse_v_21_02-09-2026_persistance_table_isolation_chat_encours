# Index Documentation Heatmap Risque

## 📚 Documentation complète

### 🚀 Démarrage rapide
- **[QUICK_START_HEATMAP_RISQUE.txt](../QUICK_START_HEATMAP_RISQUE.txt)**
  - Guide de démarrage en 3 étapes
  - Tests essentiels
  - Dépannage rapide

### 📖 Documentation principale
- **[README.md](./README.md)**
  - Vue d'ensemble complète
  - Architecture détaillée
  - Format de données
  - Utilisation
  - Personnalisation
  - Dépannage

### 📋 Documentation technique
- **[00_INTEGRATION_HEATMAP_RISQUE_02_AVRIL_2026.txt](../00_INTEGRATION_HEATMAP_RISQUE_02_AVRIL_2026.txt)**
  - Travail accompli
  - Format de données attendu
  - Logique de calcul de criticité
  - Fichiers modifiés
  - Tests à effectuer

### 📊 Synthèse
- **[SYNTHESE_HEATMAP_RISQUE_02_AVRIL_2026.md](../SYNTHESE_HEATMAP_RISQUE_02_AVRIL_2026.md)**
  - Récapitulatif complet
  - Livrables
  - Fonctionnalités
  - Design
  - Évolutions possibles

## 🧪 Scripts de test

### PowerShell
- **[test-heatmap-risque.ps1](../test-heatmap-risque.ps1)**
  - Test automatisé de l'endpoint n8n
  - Analyse détaillée de la réponse
  - Statistiques de répartition

## 📁 Fichiers du projet

### Composants React
```
src/components/Clara_Components/
├── HeatmapRisqueAccordionRenderer.tsx  (470 lignes)
└── HeatmapRisqueAccordionRenderer.css  (450 lignes)
```

### Services
```
src/services/
└── claraApiService.ts  (modifié - FORMAT 8)
```

### Renderers
```
src/components/Clara_Components/
└── MessageContentRenderer.tsx  (modifié - import + traitement)
```

## 🎯 Accès rapide

### Pour développeurs
1. [Architecture](./README.md#architecture)
2. [Format de données](./README.md#format-de-données)
3. [Intégration](./README.md#intégration)
4. [Personnalisation](./README.md#personnalisation)

### Pour testeurs
1. [Quick Start](../QUICK_START_HEATMAP_RISQUE.txt)
2. [Script de test](../test-heatmap-risque.ps1)
3. [Vérifications](./README.md#tests)

### Pour utilisateurs
1. [Utilisation](./README.md#utilisation)
2. [Fonctionnalités](./README.md#fonctionnalités)
3. [Dépannage](./README.md#dépannage)

## 🔗 Liens utiles

### Endpoint n8n
```
https://t22wtwxl.rpcld.app/webhook/heatmap_risque
```

### Router
- **Case**: 34
- **Route Key**: `heatmap_risque`
- **Trigger**: Message contenant "Heatmap" ou "heatmap"

### Marqueur
```
__HEATMAP_RISQUE_ACCORDION__
```

## 📞 Support

### En cas de problème
1. Consulter [Dépannage](./README.md#dépannage)
2. Vérifier les logs console (F12)
3. Tester avec le script PowerShell
4. Consulter la synthèse technique

### Ressources
- Documentation complète: [README.md](./README.md)
- Guide rapide: [QUICK_START](../QUICK_START_HEATMAP_RISQUE.txt)
- Synthèse: [SYNTHESE](../SYNTHESE_HEATMAP_RISQUE_02_AVRIL_2026.md)

## 📅 Historique

### Version 1.0.0 (02 Avril 2026)
- ✅ Création initiale
- ✅ Intégration complète
- ✅ Documentation exhaustive
- ✅ Scripts de test
- ✅ Prêt pour production

---

**Navigation rapide**:
- [⬆️ Retour au sommaire](#index-documentation-heatmap-risque)
- [📖 Documentation principale](./README.md)
- [🚀 Quick Start](../QUICK_START_HEATMAP_RISQUE.txt)
- [📊 Synthèse](../SYNTHESE_HEATMAP_RISQUE_02_AVRIL_2026.md)
