# Guide de Réactivation des Notifications JSON

## ❌ Statut Actuel: NOTIFICATIONS DÉSACTIVÉES

**Date de désactivation**: 23 juin 2026

Les notifications d'affichage du contenu JSON des fichiers convertis ont été **désactivées** le **23 juin 2026**.

Ces notifications n'affichent plus le contenu JSON des fichiers Excel, Word et PDF après leur conversion dans le chat.

## 📋 Historique

- **06 mai 2026**: Désactivation temporaire des notifications
- **23 juin 2026**: Réactivation des notifications
- **23 juin 2026**: Nouvelle désactivation des notifications

## 🔕 Désactivation Actuelle

### Fichier Modifié
- **Fichier**: `src/components/Clara_Components/clara_assistant_input.tsx`
- **Ligne**: ~3056-3064
- **Statut**: ❌ **Code désactivé** (23 juin 2026)

### Code Désactivé
```typescript
// 🔕 NOTIFICATIONS DÉSACTIVÉES TEMPORAIREMENT (23/06/2026)
// Pour réactiver, voir: Doc ClaraAttachmentService traitement/GUIDE_REACTIVATION_NOTIFICATIONS.md
/*
const hasDocuments = processedAttachments.some(att => 
  (att.type === 'excel' || att.type === 'word' || att.type === 'document') 
  && att.processed && att.processingResult?.success
);

if (hasDocuments) {
  claraAttachmentService.showExtractionAlert(processedAttachments);
}
*/
```

## 🔕 Comment Désactiver à Nouveau les Notifications (si nécessaire)

### ❌ Les notifications sont actuellement DÉSACTIVÉES

Les notifications ont déjà été désactivées. Pour les réactiver, suivez les instructions ci-dessous.

## ✅ Comment RÉACTIVER les Notifications

### Étape 1: Ouvrir le Fichier
```bash
# Ouvrir le fichier dans votre éditeur
code src/components/Clara_Components/clara_assistant_input.tsx
```

### Étape 2: Localiser le Code
- Chercher la ligne contenant: `🔕 NOTIFICATIONS DÉSACTIVÉES TEMPORAIREMENT`
- Vous devriez être aux alentours de la ligne **3056-3064**

### Étape 3: Décommenter le Code
Pour réactiver, décommenter le bloc commenté :

**ACTIF (actuellement):**
```typescript
// ✅ NOTIFICATIONS RÉACTIVÉES (23/06/2026)
const hasDocuments = processedAttachments.some(att => 
  (att.type === 'excel' || att.type === 'word' || att.type === 'document') 
  && att.processed && att.processingResult?.success
);

if (hasDocuments) {
  claraAttachmentService.showExtractionAlert(processedAttachments);
}
```

**DÉSACTIVÉ (pour désactiver à nouveau):**
```typescript
// 🔕 NOTIFICATIONS DÉSACTIVÉES TEMPORAIREMENT
/*
const hasDocuments = processedAttachments.some(att => 
  (att.type === 'excel' || att.type === 'word' || att.type === 'document') 
  && att.processed && att.processingResult?.success
);

if (hasDocuments) {
  claraAttachmentService.showExtractionAlert(processedAttachments);
}
*/
```

### Étape 4: Sauvegarder et Tester
1. **Sauvegarder** le fichier (`Ctrl+S` ou `Cmd+S`)
2. **Redémarrer** l'application
3. **Tester** en envoyant un fichier Excel, Word ou PDF dans le chat

## 📊 Comportement Actuel (Notifications Actives)

Lorsque vous envoyez un fichier dans le chat, une **alerte de notification** s'affichera avec :

### Exemple de Notification
```
📊 Extraction des fichiers terminée !

✅ Fichiers traités avec succès (1):
  • BALANCE_N_N1_N2.xlsx (excel)

📤 Données Excel formatées pour l'endpoint Flowise:

{
  "BALANCE_N_N1_N2": [
    {
      "table 1": [
        {
          "Numéro": "101000",
          "Intitulé": "Capital social",
          "Solde N": "50000000",
          ...
        }
      ]
    }
  ]
}

📤 Les données extraites seront incluses dans votre message vers l'endpoint Flowise.
```

## 🔧 Services Impliqués

### 1. ClaraAttachmentService
- **Fichier**: `src/services/claraAttachmentService.ts`
- **Méthode**: `showExtractionAlert(attachments: ClaraFileAttachment[])`
- **Rôle**: Génère et affiche la notification avec le JSON formaté

### 2. Clara Assistant Input
- **Fichier**: `src/components/Clara_Components/clara_assistant_input.tsx`
- **Méthode**: `handleFileAttachments()`
- **Rôle**: Appelle `showExtractionAlert()` après traitement des fichiers

## 📝 Formats de Fichiers Supportés

Les notifications s'affichent pour les types de fichiers suivants :

| Type | Extensions | Format JSON |
|------|-----------|-------------|
| **Excel** | `.xlsx`, `.xls` | Structure avec onglets et tables |
| **Word** | `.doc`, `.docx` | Structure hiérarchique avec sections |
| **PDF** | `.pdf` | Structure hiérarchique avec sections |

## 🎯 Cas d'Usage

### Quand Réactiver ?
- Pour **déboguer** le traitement des fichiers
- Pour **vérifier** la structure JSON générée
- Pour **valider** l'extraction des données

### Quand Laisser Désactivé ?
- En **production** pour éviter les alertes intrusives
- Quand les utilisateurs n'ont **pas besoin** de voir le JSON
- Pour une **expérience utilisateur** plus fluide

## 🚨 Notes Importantes

1. **Performance**: Les notifications peuvent ralentir l'interface pour les gros fichiers
2. **UX**: Les alertes peuvent être intrusives pour les utilisateurs finaux
3. **Debug**: Utile en développement, moins en production

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation technique dans `src/services/claraAttachmentService.ts`
- Vérifier les logs de la console navigateur (`F12`)
- Contacter l'équipe de développement

---

**Date de création**: 06 mai 2026  
**Dernière mise à jour**: 23 juin 2026  
**Statut**: ✅ Notifications ACTIVES  
**Version**: 2.0
