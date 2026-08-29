# Intégration Revue Manager Accordéon

## 📋 Vue d'ensemble

Ce document décrit l'intégration complète du composant **RevueManagerAccordion** dans le système de papiers de travail de Claraverse, avec support de la persistance des données via localStorage.

## 🎯 Objectif

Transformer la table "Revue Manager" (table 10) des réponses n8n en un menu accordéon interactif permettant :
- ✅ Affichage des commentaires du Preparer et du Superviseur
- ✅ Modification et ajout de points de revue
- ✅ Persistance automatique des modifications
- ✅ Ajout/suppression de sections
- ✅ Gestion des statuts (Validé, À suivre, À ajuster)

## 📊 Structure des données

### Format d'entrée (n8n)

```json
{
  "table 10 - Revue manager": [
    {
      "no": "1",
      "Superviseur": "Commentaire du superviseur...",
      "Preparer": "Commentaire du préparateur..."
    },
    {
      "no": "2",
      "Superviseur": "...",
      "Preparer": "..."
    }
  ]
}
```

### Format transformé (RevuePoint)

```typescript
interface RevuePoint {
  num: number;              // Numéro du point (1, 2, 3...)
  titre: string;            // Titre du point de revue
  statut: 'ok'|'warn'|'ko'; // ok=Validé, warn=À suivre, ko=À ajuster
  prep: string;             // Commentaire du préparateur
  rev: string;              // Commentaire du superviseur
}
```

## 🔧 Modifications apportées

### 1. Service claraPapierTravailService.ts

#### Nouvelle méthode `processManagerReview()`

```typescript
/**
 * Process Manager Review table with persistence support
 */
private processManagerReview(managerReviewRaw: any, reference: string): any[] {
  if (!Array.isArray(managerReviewRaw) || managerReviewRaw.length === 0) {
    return [];
  }

  // Check if we have saved data in localStorage
  const storageKey = `clara_revue_manager_${reference}`;
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[RevueManager] Loaded ${parsed.length} points from localStorage`);
        return parsed;
      }
    } catch (e) {
      console.error("[RevueManager] Failed to parse saved data:", e);
    }
  }

  // No saved data, process from raw data
  return managerReviewRaw.map((row: any, idx: number) => ({
    num: row.no || row.No || (idx + 1),
    titre: row.Titre || row.Point || row.Superviseur || row.Preparer || "Point de revue",
    statut: this.detectStatut(row),
    prep: row.Preparer || row.prep || "",
    rev: row.Superviseur || row.rev || ""
  }));
}
```

#### Nouvelle méthode `detectStatut()`

```typescript
/**
 * Detect status from row data
 */
private detectStatut(row: any): 'ok' | 'warn' | 'ko' {
  const statut = row.Statut || row.statut || "";
  const statutLower = String(statut).toLowerCase();

  if (statutLower.includes("val") || statutLower.includes("ok") || statutLower.includes("satisf")) {
    return 'ok';
  }
  if (statutLower.includes("suivre") || statutLower.includes("warn") || statutLower.includes("attention")) {
    return 'warn';
  }
  if (statutLower.includes("ajust") || statutLower.includes("ko") || statutLower.includes("anomal")) {
    return 'ko';
  }

  // Default: check if there's content
  const hasContent = (row.Preparer || row.prep || row.Superviseur || row.rev || "").trim().length > 0;
  return hasContent ? 'ok' : 'warn';
}
```

### 2. Composant RevueManagerAccordion.tsx

Le composant est déjà créé avec toutes les fonctionnalités :

#### Fonctionnalités principales

1. **Persistance automatique**
   - Clé localStorage : `clara_revue_manager_${reference}`
   - Sauvegarde au clic sur "Enregistrer la revue"
   - Chargement automatique au montage du composant

2. **Gestion des points**
   - Ajout de nouveaux points via bouton "Ajouter un point"
   - Suppression avec confirmation
   - Modification en temps réel (titre, statut, commentaires)

3. **Interface utilisateur**
   - Accordéon avec animation fluide
   - Badges de statut colorés
   - Zones de texte redimensionnables
   - Indicateur de modifications non enregistrées

## 📍 Positionnement dans le rendu

Le composant RevueManagerAccordion doit être positionné **après le tableau des Légendes** dans le rendu du papier de travail.

### Ordre d'affichage recommandé

1. Signature worksheet (table 0)
2. Feuille de couverture (table 1)
3. Objectifs (table 2)
4. Travaux à effectuer (table 3)
5. Schéma de calcul (table 4b)
6. Table principale (table 5)
7. Totalisation (table 6)
8. Cross references horizontale (table 7)
9. Cross references documentaire (table 8)
10. **Légendes (table 9)**
11. **→ Revue Manager (table 10)** ← ICI

## 🔄 Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Réponse n8n avec table 10                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. claraPapierTravailService.process()                      │
│    - Détecte "Nature de test"                               │
│    - Extrait table 10                                       │
│    - Appelle processManagerReview()                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. processManagerReview()                                   │
│    - Vérifie localStorage (clé: clara_revue_manager_REF)    │
│    - Si données sauvegardées → les charge                   │
│    - Sinon → transforme les données brutes                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Retourne __PAPIER_TRAVAIL__ + JSON                       │
│    {                                                         │
│      reference: "Test-Caisse-001",                          │
│      managerReview: [RevuePoint[]],                         │
│      preparer: "KMP",                                       │
│      reviewer: "JFK",                                       │
│      ...                                                    │
│    }                                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Renderer (à implémenter)                                 │
│    - Parse le JSON                                          │
│    - Affiche les tables 0-9                                 │
│    - Affiche <RevueManagerAccordion                         │
│        points={managerReview}                               │
│        reference={reference}                                │
│        preparer={preparer}                                  │
│        reviewer={reviewer}                                  │
│      />                                                     │
└─────────────────────────────────────────────────────────────┘
```

## 💾 Système de persistance

### Clé de stockage

```typescript
const storageKey = `clara_revue_manager_${reference}`;
// Exemple: "clara_revue_manager_Test-Caisse-001"
```

### Données sauvegardées

```json
[
  {
    "num": 1,
    "titre": "Étendue de l'échantillon",
    "statut": "ok",
    "prep": "Échantillon de 20 PV...",
    "rev": "Étendue validée..."
  },
  {
    "num": 2,
    "titre": "Anomalie significative",
    "statut": "ko",
    "prep": "Écart de −150 000 FCFA...",
    "rev": "Point critique confirmé..."
  }
]
```

### Cycle de vie

1. **Chargement initial** (useEffect)
   - Vérifie localStorage
   - Si données → charge
   - Sinon → utilise props.points

2. **Modifications**
   - Chaque modification met à jour l'état local
   - Flag `isSaved` passe à `false`

3. **Sauvegarde**
   - Clic sur "Enregistrer la revue"
   - Écrit dans localStorage
   - Flag `isSaved` passe à `true`
   - Callback `onSave()` si fourni

## 🎨 Interface utilisateur

### Palette de couleurs

```typescript
const C = {
  blueMain:  "#1855A3",  // Bleu principal
  blueDark:  "#0C447C",  // Bleu foncé (gradient)
  blueLight: "#E6F1FB",  // Bleu clair (badge reviewer)
  blueText:  "#185FA5",  // Texte bleu
  greenBg:   "#EAF3DE",  // Fond vert (validé)
  greenTxt:  "#3B6D11",  // Texte vert
  amberBg:   "#FAEEDA",  // Fond ambre (à suivre)
  amberTxt:  "#854F0B",  // Texte ambre
  redBg:     "#FCEBEB",  // Fond rouge (à ajuster)
  redTxt:    "#A32D2D",  // Texte rouge
};
```

### Statuts disponibles

| Statut | Label | Couleur | Icône |
|--------|-------|---------|-------|
| `ok` | Validé | Vert | ✓ CheckCircle2 |
| `warn` | À suivre | Ambre | ⚠ AlertCircle |
| `ko` | À ajuster | Rouge | ✗ XCircle |

## 🧪 Exemple d'utilisation

### Dans le renderer de papier de travail

```tsx
import RevueManagerAccordion from './Clara_Components/RevueManagerAccordion';

// Après avoir parsé le JSON du papier de travail
const papierData = JSON.parse(jsonString.replace('__PAPIER_TRAVAIL__', ''));

// Afficher le composant après les légendes
<div>
  {/* ... autres sections ... */}
  
  {/* Légendes */}
  <TableRenderer data={papierData.legends} title="Légendes" />
  
  {/* Revue Manager */}
  {papierData.managerReview && papierData.managerReview.length > 0 && (
    <RevueManagerAccordion
      points={papierData.managerReview}
      reference={papierData.reference}
      preparer={papierData.preparer}
      reviewer={papierData.reviewer}
      onSave={(updatedPoints) => {
        console.log('Revue sauvegardée:', updatedPoints);
      }}
    />
  )}
</div>
```

## 🔍 Détection automatique du statut

Le service détecte automatiquement le statut basé sur les mots-clés :

### Statut "ok" (Validé)
- Contient : "val", "ok", "satisf"
- Exemples : "validé", "ok", "satisfaisant"

### Statut "warn" (À suivre)
- Contient : "suivre", "warn", "attention"
- Exemples : "à suivre", "warning", "attention requise"

### Statut "ko" (À ajuster)
- Contient : "ajust", "ko", "anomal"
- Exemples : "à ajuster", "ko", "anomalie"

### Statut par défaut
- Si aucun mot-clé → vérifie si du contenu existe
- Contenu présent → "ok"
- Pas de contenu → "warn"

## 📝 Fonctionnalités du composant

### 1. Ajout de points

```typescript
const addPoint = () => {
  const newPoint: RevuePoint = {
    num: points.length + 1,
    titre: "Nouveau point de revue",
    statut: 'ok',
    prep: "",
    rev: ""
  };
  setPoints([...points, newPoint]);
  setIsSaved(false);
};
```

### 2. Suppression de points

```typescript
const removePoint = (index: number) => {
  if (window.confirm("Supprimer ce point de revue ?")) {
    const next = points
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, num: i + 1 })); // Renumérotation
    setPoints(next);
    setIsSaved(false);
  }
};
```

### 3. Modification de points

```typescript
const updatePoint = (index: number, updated: RevuePoint) => {
  const next = [...points];
  next[index] = updated;
  setPoints(next);
  setIsSaved(false);
};
```

### 4. Sauvegarde

```typescript
const handleSave = () => {
  localStorage.setItem(storageKey, JSON.stringify(points));
  setIsSaved(true);
  if (onSave) onSave(points);
};
```

## 🚀 Prochaines étapes

1. ✅ Service claraPapierTravailService mis à jour
2. ✅ Composant RevueManagerAccordion créé
3. ⏳ Intégrer dans le renderer principal
4. ⏳ Tester avec données réelles n8n
5. ⏳ Ajouter export PDF/Excel si nécessaire

## 📚 Fichiers concernés

### Code source

- `src/services/claraPapierTravailService.ts` - Service de traitement
- `src/components/Clara_Components/RevueManagerAccordion.tsx` - Composant principal
- `Doc cross references claraApiService.tsx/RevueManagerAccordion.jsx` - Version de référence

### Documentation

- `Doc revue manager accordeon/` - Dossier contenant toute la documentation de session
  - `README.md` - Guide principal du dossier
  - `00_LIRE_EN_PREMIER_REVUE_MANAGER_26_AVRIL_2026.txt` - Commencer ici
  - `START_HERE_REVUE_MANAGER.txt` - Guide de démarrage
  - `00_INDEX_REVUE_MANAGER_26_AVRIL_2026.md` - Index complet
  - `QUICK_TEST_REVUE_MANAGER_26_AVRIL_2026.txt` - Tests rapides
  - `SYNTHESE_VISUELLE_REVUE_MANAGER_26_AVRIL_2026.txt` - Diagrammes ASCII
  - `COMMANDES_RAPIDES_REVUE_MANAGER_26_AVRIL_2026.txt` - Commandes console
  - `00_MISSION_ACCOMPLIE_REVUE_MANAGER_26_AVRIL_2026.txt` - Récapitulatif
  - `LISTE_FICHIERS_REVUE_MANAGER_26_AVRIL_2026.md` - Liste des fichiers
  - `COMMIT_MESSAGE_REVUE_MANAGER_26_AVRIL_2026.txt` - Message de commit

## 🎯 Résultat attendu

Un menu accordéon interactif positionné après les légendes, permettant :
- Consultation des points de revue
- Modification des commentaires
- Ajout/suppression de points
- Persistance automatique des modifications
- Interface intuitive avec badges de statut

---

**Date de création** : 26 avril 2026  
**Auteur** : Kiro AI Assistant  
**Version** : 1.0
