# 📋 MÉMO — Réactivation des Notifications (23 Juin 2026)

📅 **Date de réactivation** : 23 Juin 2026  
✅ **Statut actuel** : Notifications **ACTIVES**  
🔖 **Version** : 2.0

---

## 🎯 Vue d'Ensemble

Il existe **deux systèmes de notifications** indépendants dans l'application E-audit :

| # | Système | Fichier concerné | Méthode de contrôle |
|---|---------|-----------------|---------------------|
| 1 | **Router N8N** (cases 1-45) | `src/components/NotificationContainer.css` | CSS `display: none` |
| 2 | **Extraction JSON** (fichiers Excel/Word/PDF) | `src/components/Clara_Components/clara_assistant_input.tsx` | Commentaire code `/* */` |

---

## 🔔 Système 1 — Notifications Router N8N

### Description
Affiche une notification toast en **haut à droite** à chaque message envoyé dans le chat :
- 🔀 `Router N8N` (titre)
- Case activée (ex: `Case 23 : recos_revision`)
- URL de l'endpoint N8N

### 📁 Fichier à modifier
`src/components/NotificationContainer.css`

### ✅ Réactiver
Supprimer ces lignes au **début** du fichier CSS :
```css
/* DÉSACTIVATION TEMPORAIRE - [DATE] */
.notification-container {
  display: none !important;
}
```
→ Sauvegarder. Immédiatement visible.

### 🔕 Désactiver
Ajouter ces lignes au **tout début** du fichier CSS :
```css
/* DÉSACTIVATION TEMPORAIRE - [DATE] */
.notification-container {
  display: none !important;
}
```
→ Sauvegarder. Immédiatement invisible (service reste actif en arrière-plan).

---

## 🔔 Système 2 — Notifications Extraction JSON

### Description
Affiche une notification quand un fichier **Excel / Word / PDF** est joint et traité avec succès, montrant le JSON extrait avant envoi vers n8n.

### 📁 Fichier à modifier
`src/components/Clara_Components/clara_assistant_input.tsx`  
**Ligne** : ~3055–3065

### ✅ Réactiver
Chercher le marqueur `🔕 NOTIFICATIONS DÉSACTIVÉES` et décommenter le bloc (supprimer `/*` et `*/`) :
```typescript
// ✅ NOTIFICATIONS RÉACTIVÉES ([DATE])
// Pour désactiver, commenter le bloc ci-dessous avec /* */
const hasDocuments = processedAttachments.some(att =>
  (att.type === 'excel' || att.type === 'word' || att.type === 'document')
  && att.processed && att.processingResult?.success
);
if (hasDocuments) {
  claraAttachmentService.showExtractionAlert(processedAttachments);
}
```
→ Sauvegarder + redémarrer `npm run dev`.

### 🔕 Désactiver
Chercher le marqueur `✅ NOTIFICATIONS RÉACTIVÉES` et commenter le bloc avec `/* */` :
```typescript
// 🔕 NOTIFICATIONS DÉSACTIVÉES TEMPORAIREMENT ([DATE])
// Pour réactiver : Doc notification app/MEMO_REACTIVATION_NOTIFICATIONS_23_JUIN_2026.md
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
→ Sauvegarder + redémarrer.

---

## 🏗️ Architecture — Flux complet

```
SYSTÈME 1 — ROUTER N8N
──────────────────────
Message chat envoyé
  ↓
claraApiService.ts → switch/case (1 à 45)
  ↓
addInfoNotification("🔀 Router N8N", "Case XX : ...", 7000)
  ↓
toastNotificationService.ts → NotificationContainer.tsx
  ↓
  ✅ Visible (haut droite)   [si CSS sans display:none]
  ❌ Invisible               [si display:none dans CSS]

SYSTÈME 2 — EXTRACTION JSON
───────────────────────────
Fichier Excel/Word/PDF joint
  ↓
clara_assistant_input.tsx → claraAttachmentService.processFileAttachments()
  ↓
Extraction JSON
  ↓
  ✅ showExtractionAlert()   [si code décommenté]
  ❌ Pas de notification     [si code commenté /* */]
  ↓
Envoi vers n8n (toujours actif, indépendant)
```

---

## 📦 Fichiers — Résumé

### À modifier (désactiver/réactiver)
| Fichier | Système | Action |
|---------|---------|--------|
| `src/components/NotificationContainer.css` (début) | Système 1 | Ajouter/supprimer `display: none` |
| `src/components/Clara_Components/clara_assistant_input.tsx` (~L3055) | Système 2 | Commenter/décommenter bloc |

### Ne pas modifier
| Fichier | Rôle |
|---------|------|
| `src/services/toastNotificationService.ts` | Service toast principal |
| `src/components/NotificationContainer.tsx` | Composant React d'affichage |
| `src/services/claraAttachmentService.ts` | Méthode `showExtractionAlert()` |
| `src/services/claraApiService.ts` | Appels par case (1-45) |

---

## 🧪 Tests de Validation

### Système 1
1. `npm run dev`
2. Envoyer un message → notification haut droite avec `🔀 Router N8N` + Case XX
3. Auto-fermeture après 7 secondes + bouton ×

### Système 2
1. Joindre un fichier Excel/Word/PDF + envoyer
2. Notification JSON du contenu extrait

### Console F12
```
📢 Notification info: { title: "🔀 Router N8N", ... }
```

---

## 📅 Historique

| Date | Action | Système | Méthode |
|------|--------|---------|---------|
| 29/03/2026 | Création | Système 1 Router N8N | Composant créé |
| 06/05/2026 | Désactivation | Système 1 | CSS `display: none` |
| 06/05/2026 | Désactivation | Système 2 | Commentaire `/* */` |
| 23/06/2026 | Réactivation | Système 2 | Commentaire supprimé |
| 23/06/2026 | Désactivation | Système 2 | Commentaire `/* */` |
| **23/06/2026** | **Réactivation** | **Système 1 + 2** | **CSS + code décommentés** ← Aujourd'hui |

---

## 🔗 Références

- [README.md](./README.md) — Vue d'ensemble
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Architecture technique
- [GUIDE_UTILISATION.md](./GUIDE_UTILISATION.md) — Guide d'utilisation
- [PROBLEMES_ET_SOLUTIONS.md](./PROBLEMES_ET_SOLUTIONS.md) — Dépannage
- [GUIDE_REACTIVATION_NOTIFICATIONS.md](../GUIDE_REACTIVATION_NOTIFICATIONS.md) — Guide Système 1 (CSS)

---

**Dernière mise à jour** : 23 Juin 2026  
**Statut** : ✅ Les deux systèmes de notifications sont ACTIFS
