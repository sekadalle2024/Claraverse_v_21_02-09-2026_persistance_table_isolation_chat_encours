# Quick Start - Réactivation des Notifications

## 🚀 Réactivation Rapide (3 étapes)

### 1️⃣ Ouvrir le Fichier
```bash
code src/components/Clara_Components/clara_assistant_input.tsx
```

### 2️⃣ Chercher la Ligne
Rechercher: `🔕 NOTIFICATIONS DÉSACTIVÉES TEMPORAIREMENT`

### 3️⃣ Décommenter le Code
Remplacer:
```typescript
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

Par:
```typescript
const hasDocuments = processedAttachments.some(att => 
  (att.type === 'excel' || att.type === 'word' || att.type === 'document') 
  && att.processed && att.processingResult?.success
);

if (hasDocuments) {
  claraAttachmentService.showExtractionAlert(processedAttachments);
}
```

## ✅ C'est Tout !

Sauvegarder et redémarrer l'application.

---

Pour plus de détails, voir: `GUIDE_REACTIVATION_NOTIFICATIONS.md`
