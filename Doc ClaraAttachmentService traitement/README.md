# Documentation ClaraAttachmentService - Traitement des Fichiers

## 📁 Contenu du Dossier

Ce dossier contient la documentation relative au traitement des fichiers et aux notifications dans E-Audit.

### Fichiers Disponibles

| Fichier | Description |
|---------|-------------|
| `GUIDE_REACTIVATION_NOTIFICATIONS.md` | Guide complet pour réactiver les notifications JSON des fichiers |
| `README.md` | Ce fichier - Vue d'ensemble de la documentation |

## 🎯 Objectif

Documenter la gestion des notifications d'extraction et de conversion JSON des fichiers envoyés dans le chat E-Audit.

## 🔧 Services Concernés

### ClaraAttachmentService
- **Localisation**: `src/services/claraAttachmentService.ts`
- **Rôle**: Traitement et extraction du contenu des fichiers (Excel, Word, PDF)
- **Méthodes clés**:
  - `processFileAttachments()`: Traite les fichiers joints
  - `showExtractionAlert()`: Affiche les notifications JSON
  - `formatExcelDataForFlowise()`: Formate les données Excel
  - `formatWordForN8nStructured()`: Formate les documents Word
  - `formatPdfForN8nStructured()`: Formate les documents PDF

### ClaraApiService
- **Localisation**: `src/services/claraApiService.ts`
- **Rôle**: Orchestration des appels API vers les endpoints n8n
- **Intégration**: Utilise les données extraites par ClaraAttachmentService

## 📊 Flux de Traitement

```
1. Utilisateur envoie un fichier dans le chat
   ↓
2. clara_assistant_input.tsx → handleFileAttachments()
   ↓
3. claraAttachmentService.processFileAttachments()
   ↓
4. Extraction du contenu (Excel/Word/PDF)
   ↓
5. [OPTIONNEL] claraAttachmentService.showExtractionAlert()
   ↓
6. Envoi vers endpoint n8n avec données extraites
```

## 🔕 État Actuel (06/05/2026)

**Notifications**: **DÉSACTIVÉES**

Les notifications d'affichage du JSON des fichiers convertis sont actuellement désactivées pour améliorer l'expérience utilisateur.

Pour réactiver, consulter: `GUIDE_REACTIVATION_NOTIFICATIONS.md`

## 📝 Formats Supportés

### Excel (.xlsx, .xls)
- Extraction des onglets et tables
- Format JSON structuré avec `onglet_X - table Y`
- Support des en-têtes et données

### Word (.doc, .docx)
- Extraction hiérarchique des sections
- Numérotation des paragraphes et tables
- Support des titres et sous-titres

### PDF (.pdf)
- Extraction hiérarchique du contenu
- Structure similaire à Word
- Support des sections et paragraphes

## 🛠️ Maintenance

### Modifications Récentes
- **06/05/2026**: Désactivation des notifications JSON (voir `GUIDE_REACTIVATION_NOTIFICATIONS.md`)

### Prochaines Étapes
- Évaluer l'impact de la désactivation sur l'UX
- Décider si réactivation nécessaire en production
- Améliorer le formatage JSON si réactivation

## 📞 Contact

Pour toute question technique :
- Consulter le code source dans `src/services/`
- Vérifier les logs de la console navigateur
- Contacter l'équipe de développement E-Audit

---

**Projet**: E-Audit (anciennement Claraverse)  
**Version**: 1.0  
**Date**: 06 mai 2026
