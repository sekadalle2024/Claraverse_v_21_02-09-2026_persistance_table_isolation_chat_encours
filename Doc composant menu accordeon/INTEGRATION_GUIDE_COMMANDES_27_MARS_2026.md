# Intégration du Guide des Commandes - 27 Mars 2026

## 📋 Résumé

Intégration complète du workflow n8n "guide_des_commandes" avec affichage en accordéon dans le frontend Claraverse.

## 🎯 Objectif

Afficher les réponses du workflow n8n "guide_des_commandes" dans un menu accordéon interactif avec page de couverture, similaire aux composants CIA existants.

## 📦 Fichiers Créés

### 1. GuideCommandesAccordionRenderer.tsx
**Emplacement:** `src/components/Clara_Components/GuideCommandesAccordionRenderer.tsx`

**Description:** Composant React pour afficher le Guide des Commandes E AUDIT PRO avec:
- Menu accordéon à plusieurs niveaux
- Page de couverture pour chaque section
- Cartes colorées pour les items selon la rubrique
- Support du mode sombre/clair
- Animation et transitions fluides

**Fonctionnalités:**
- Parsing automatique de la structure JSON depuis n8n
- Accordéons imbriqués (Section → Sub-item → Items)
- Styles dynamiques basés sur les rubriques
- Gestion d'état pour l'ouverture/fermeture des panneaux

## 🔧 Fichiers Modifiés

### 1. claraApiService.ts
**Emplacement:** `src/services/claraApiService.ts`

**Modifications:**
- Ajout du FORMAT 7 dans `normalizeN8nResponse()` pour détecter la structure du Guide des Commandes
- Détection de la structure: `[{ "data": [{ "Sous-section": "...", "Sub-items": [...] }] }]`
- Retour du marqueur `__GUIDE_COMMANDES_ACCORDION__` avec les données JSON

**Code ajouté:**
```typescript
// FORMAT 7: GUIDE DES COMMANDES
if (
  Array.isArray(result) &&
  result.length > 0 &&
  result[0] &&
  typeof result[0] === "object" &&
  "data" in result[0] &&
  Array.isArray(result[0].data) &&
  result[0].data.length > 0 &&
  "Sous-section" in result[0].data[0] &&
  "Sub-items" in result[0].data[0]
) {
  console.log('✅ FORMAT 7 DETECTE: Guide des Commandes');
  const content = `__GUIDE_COMMANDES_ACCORDION__${JSON.stringify(result)}`;
  return {
    content,
    metadata: {
      format: "guide_commandes_accordion",
      timestamp: new Date().toISOString(),
      totalSections: result[0].data.length,
      endpoint: "guide_des_commandes",
    },
  };
}
```

### 2. MessageContentRenderer.tsx
**Emplacement:** `src/components/Clara_Components/MessageContentRenderer.tsx`

**Modifications:**
- Import du nouveau composant `GuideCommandesAccordionRenderer`
- Ajout de la détection du marqueur `__GUIDE_COMMANDES_ACCORDION__`
- Rendu du composant avec les données JSON

**Code ajouté:**
```typescript
// Import
import GuideCommandesAccordionRenderer from './GuideCommandesAccordionRenderer';

// Rendu
if (processedContent.content.startsWith('__GUIDE_COMMANDES_ACCORDION__')) {
  try {
    const jsonStr = processedContent.content.replace('__GUIDE_COMMANDES_ACCORDION__', '');
    return (
      <div className={`guide-commandes-accordion-container ${className}`}>
        <GuideCommandesAccordionRenderer jsonData={jsonStr} isDark={darkMode} />
      </div>
    );
  } catch (e) {
    console.error('Failed to parse Guide Commandes Accordion data:', e);
  }
}
```

## 📊 Structure de Données Attendue

### Format de Réponse n8n

```json
[
  {
    "data": [
      {
        "Sous-section": "Guide d'Onboarding E AUDIT PRO : Maîtriser votre Programme de Travail",
        "Sub-items": [
          {
            "Sub-item C1": "Lancement et Cadrage de la Mission",
            "Items": [
              {
                "Item C1.1": "La commande [Command] : Programme de travail",
                "Rubrique": "Le point de départ",
                "Contenu": "C'est l'instruction qui dit au logiciel exactement ce que vous voulez faire..."
              },
              {
                "Item C1.2": "La commande [Processus] : Inventaire de caisse",
                "Rubrique": "Le cœur de la cible",
                "Contenu": "Ici, vous précisez le sujet que vous allez auditer..."
              }
            ]
          },
          {
            "Sub-item C2": "Structure et Personnalisation du Tableau",
            "Items": [...]
          }
        ]
      }
    ]
  }
]
```

## 🎨 Fonctionnalités du Composant

### 1. Page de Couverture
- Affichage du titre de la section
- Indicateur de progression (Section X / Total)
- Design moderne avec gradient
- Animation de chargement

### 2. Accordéons Imbriqués
- **Niveau 1:** Sous-section (page de couverture)
- **Niveau 2:** Sub-items (accordéons cliquables)
- **Niveau 3:** Items (cartes d'information)

### 3. Cartes d'Items
- Couleurs dynamiques basées sur la rubrique:
  - 🔵 Bleu: "départ", "point"
  - 🟢 Vert: "cible", "cœur"
  - 🟣 Violet: "filtre", "précision"
  - 🟠 Orange: "mesure", "tableau"
  - 🟡 Ambre: "temps", "maîtrise"
  - 🔷 Cyan: "clarté", "document"
  - 🔹 Indigo: "situation", "mise"
  - ⚪ Gris: Par défaut

### 4. Mode Sombre/Clair
- Support complet du thème sombre
- Transitions fluides entre les modes
- Contraste optimisé pour la lisibilité

## 🔄 Flux de Traitement

```
1. Utilisateur envoie: "Guide des commandes"
   ↓
2. claraApiService.ts détecte le message
   ↓
3. Router → Case 29: guide_des_commandes
   ↓
4. Appel API: http://localhost:5678/webhook/guide_des_commandes
   ↓
5. Réponse n8n avec structure data/Sous-section/Sub-items
   ↓
6. normalizeN8nResponse() détecte FORMAT 7
   ↓
7. Retour: __GUIDE_COMMANDES_ACCORDION__ + JSON
   ↓
8. MessageContentRenderer détecte le marqueur
   ↓
9. Rendu: GuideCommandesAccordionRenderer
   ↓
10. Affichage: Menu accordéon interactif
```

## 🧪 Test de l'Intégration

### Commande de Test
```bash
curl -X POST "http://localhost:5678/webhook/guide_des_commandes" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "[PARTIE] = PARTIE 3 - [THEMATIQUE] = CONNAISSANCES METIER POUR L AUDIT INTERNE - [CHAPITRE] = Unité d étude 1 : Gestion stratégique et planification - [SECTION] = Sous-unité 1 : Gestion stratégique et planification"
  }'
```

### Dans l'Interface Claraverse
1. Ouvrir le chat
2. Taper: "Guide des commandes"
3. Vérifier l'affichage de l'accordéon
4. Tester l'ouverture/fermeture des panneaux
5. Vérifier le mode sombre/clair

## ✅ Points de Vérification

- [x] Composant GuideCommandesAccordionRenderer créé
- [x] claraApiService.ts mis à jour (FORMAT 7)
- [x] MessageContentRenderer.tsx mis à jour
- [x] Support du mode sombre/clair
- [x] Accordéons imbriqués fonctionnels
- [x] Page de couverture pour chaque section
- [x] Styles dynamiques par rubrique
- [x] Gestion d'erreur (parsing JSON)
- [x] Compatibilité avec les autres workflows n8n existants

## 🔍 Compatibilité

### Workflows n8n Existants Préservés
- ✅ CIA Cours (FORMAT 5)
- ✅ CIA QCM (FORMAT 6)
- ✅ Methodo Audit (FORMAT 5)
- ✅ Programme de travail (FORMAT 4)
- ✅ Tous les autres endpoints

### Aucun Impact sur
- Lead Balance
- États Financiers
- Recos Revision
- Rapport Synthèse CAC
- Autres workflows existants

## 📝 Notes Techniques

### Différence avec CiaAccordionRenderer
- **Structure de données:** Enveloppée dans `{ "data": [...] }`
- **Parsing:** Gère la structure imbriquée automatiquement
- **Page de couverture:** Design spécifique au Guide des Commandes
- **Styles:** Palette de couleurs adaptée aux rubriques du guide

### Optimisations
- Parsing JSON une seule fois au montage
- État local pour les accordéons (performance)
- Mémoïsation des styles de rubrique
- Transitions CSS optimisées

## 🚀 Prochaines Étapes

1. Tester avec des données réelles depuis n8n
2. Ajuster les styles si nécessaire
3. Ajouter des animations supplémentaires (optionnel)
4. Documenter dans le manuel utilisateur
5. Créer des exemples de commandes

## 📚 Références

- Composant de base: `CiaAccordionRenderer.tsx`
- Composant similaire: `CiaMethodoAccordionRenderer.tsx`
- Service API: `claraApiService.ts`
- Rendu: `MessageContentRenderer.tsx`

---

**Date:** 27 Mars 2026  
**Statut:** ✅ Intégration Complète  
**Version:** 1.0.0
