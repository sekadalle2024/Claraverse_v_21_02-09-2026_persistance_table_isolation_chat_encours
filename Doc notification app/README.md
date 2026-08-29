# Documentation - Système de Notifications Toast

📅 **Date**: 29 Mars 2026  
🎯 **Objectif**: Système de notifications toast pour afficher les informations de routing n8n

## 📋 Vue d'ensemble

Ce dossier contient la documentation complète du système de notifications toast implémenté dans ClaraVerse pour afficher les informations de routing des requêtes n8n.

## 📂 Structure de la documentation

```
Doc notification app/
├── README.md                           # Ce fichier
├── ARCHITECTURE.md                     # Architecture technique du système
├── PROBLEMES_ET_SOLUTIONS.md          # Problèmes rencontrés et solutions
├── GUIDE_UTILISATION.md                # Guide d'utilisation
└── EXEMPLES.md                         # Exemples de code
```

## 🎯 Fonctionnalités

- ✅ Notifications toast en haut à droite de l'écran
- ✅ Affichage du case détecté (1-33)
- ✅ Affichage de la route utilisée
- ✅ Affichage de l'URL de l'endpoint n8n
- ✅ Auto-fermeture après 7 secondes
- ✅ Fermeture manuelle avec bouton ×
- ✅ Support de 4 types: info, success, error, warning

## 📦 Fichiers créés

### Services
- `src/services/toastNotificationService.ts` - Service de notifications toast
- `src/services/notificationService.ts` - Service legacy pour compatibilité

### Composants
- `src/components/NotificationContainer.tsx` - Composant React d'affichage
- `src/components/NotificationContainer.css` - Styles des notifications

### Modifications
- `src/App.tsx` - Ajout du NotificationContainer
- `src/services/claraApiService.ts` - Appel de addInfoNotification

## 🚀 Quick Start

```typescript
// Importer le service
import { addInfoNotification } from './services/toastNotificationService';

// Afficher une notification
addInfoNotification(
  "Titre",
  "Message de la notification",
  7000 // Durée en ms
);
```

## 📖 Documentation détaillée

Consultez les fichiers suivants pour plus d'informations:

1. **ARCHITECTURE.md** - Architecture technique complète
2. **PROBLEMES_ET_SOLUTIONS.md** - Historique des problèmes et solutions
3. **GUIDE_UTILISATION.md** - Guide d'utilisation détaillé
4. **EXEMPLES.md** - Exemples de code et cas d'usage

## 🔧 Maintenance

Pour toute modification du système de notifications:

1. Consulter l'architecture dans `ARCHITECTURE.md`
2. Vérifier les problèmes connus dans `PROBLEMES_ET_SOLUTIONS.md`
3. Tester avec les exemples dans `EXEMPLES.md`
4. Mettre à jour cette documentation

## 📞 Support

Pour toute question ou problème, consulter:
- `PROBLEMES_ET_SOLUTIONS.md` pour les problèmes courants
- Les fichiers de documentation à la racine du projet
