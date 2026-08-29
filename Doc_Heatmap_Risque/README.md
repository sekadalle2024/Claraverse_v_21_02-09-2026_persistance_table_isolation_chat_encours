# Documentation Heatmap Risque - Case 34

## Vue d'ensemble

Le composant **Heatmap Risque** permet d'afficher une cartographie interactive des risques avec une matrice de criticité visuelle. Il fait partie du système Claraverse et s'intègre dans le workflow n8n via le Case 34.

## Architecture

### Composants créés

1. **HeatmapRisqueAccordionRenderer.tsx**
   - Composant React principal
   - Gère l'affichage en accordéon
   - Contient 3 sous-composants:
     - Page de couverture
     - Heatmap interactive
     - Tableau détaillé

2. **HeatmapRisqueAccordionRenderer.css**
   - Styles complets
   - Responsive design
   - Support mode sombre
   - Animations et transitions

### Intégration

1. **claraApiService.ts**
   - FORMAT 8: Détection automatique
   - Endpoint: `heatmap_risque`
   - Marqueur: `__HEATMAP_RISQUE_ACCORDION__`

2. **MessageContentRenderer.tsx**
   - Import du composant
   - Traitement du marqueur
   - Rendu dans le chat

## Format de données

### Structure JSON attendue

```json
[
  {
    "data": {
      "Etape mission - Cartographie": [
        {
          "table 1": {
            "Etape de mission": "Cartographie des risques",
            "Norme": "13.2 Évaluation des risques",
            "Méthode": "Méthode des risques par les contrôles",
            "Reference": "Cartographie-002"
          }
        },
        {
          "table 2": [
            {
              "no": 1,
              "operationnel": "Caissier",
              "Risques": "Description du risque...",
              "Probabilite": "Moyen",
              "Impact": "Élevé",
              "Criticite": "Élevé",
              "controle audit": "Contrôle à effectuer..."
            }
          ]
        }
      ]
    }
  }
]
```

### Champs requis

#### Table 1 (En-tête)
- Objet avec métadonnées de la cartographie
- Clés flexibles (affichées telles quelles)

#### Table 2 (Risques)
- Array d'objets risques
- Champs obligatoires:
  - `no`: Numéro du risque
  - `Risques`: Description
  - `Probabilite`: "Élevé" | "Moyen" | "Faible"
  - `Impact`: "Élevé" | "Moyen" | "Faible"
  - `Criticite`: "Élevé" | "Moyen" | "Faible"
- Champs optionnels:
  - `operationnel`: Acteur concerné
  - `controle audit`: Contrôle recommandé

## Matrice de criticité

### Logique de calcul

```
                 Impact
              F    M    E
         ┌─────┬─────┬─────┐
       E │  M  │  E  │  E  │
Prob   M │  F  │  M  │  E  │
       F │  F  │  F  │  M  │
         └─────┴─────┴─────┘
```

### Code couleur

- **Vert** (#4caf50): Criticité Faible
- **Orange** (#ff9800): Criticité Moyenne
- **Rouge** (#f44336): Criticité Élevée

## Fonctionnalités

### 1. Menu accordéon

- 3 sections indépendantes
- Ouverture/fermeture au clic
- Section 1 ouverte par défaut
- Animations fluides

### 2. Heatmap interactive

- Grille 3x3 (Probabilité x Impact)
- Compteur de risques par cellule
- Clic sur cellule → affichage des risques
- Couleurs automatiques selon criticité

### 3. Tableau détaillé

- Affichage de tous les risques
- Colonnes:
  - N°
  - Opérationnel
  - Risques
  - Probabilité (badge coloré)
  - Impact (badge coloré)
  - Criticité (badge coloré)
  - Contrôle Audit
- Bordure gauche colorée selon criticité
- Hover effect sur les lignes

## Utilisation

### Dans Claraverse

1. Ouvrir le chat
2. Taper: `Heatmap` ou `heatmap`
3. Le système détecte automatiquement le Case 34
4. Appel à l'endpoint n8n
5. Affichage du composant

### Workflow n8n

L'endpoint doit retourner la structure JSON décrite ci-dessus.

**URL**: `https://t22wtwxl.rpcld.app/webhook/heatmap_risque`

**Méthode**: POST

**Body**:
```json
{
  "question": "heatmap"
}
```

## Tests

### Test de l'endpoint

```powershell
# PowerShell
.\test-heatmap-risque.ps1
```

### Test dans Claraverse

1. Démarrer le serveur:
   ```bash
   npm run dev
   ```

2. Ouvrir le navigateur
3. Taper "Heatmap" dans le chat
4. Vérifier l'affichage

### Vérifications

- [ ] Router détecte Case 34
- [ ] Appel API réussi
- [ ] Composant s'affiche
- [ ] 3 sections accordéon visibles
- [ ] Heatmap interactive
- [ ] Couleurs correctes
- [ ] Tableau détaillé complet

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
  - Tableau scrollable horizontalement
  - Détails en popup centré
  - Taille de police réduite

- **Tablette**: 768px - 1200px
  - Grille adaptée
  - Padding réduit

- **Desktop**: > 1200px
  - Affichage optimal
  - Toutes les fonctionnalités

## Mode sombre

Le composant supporte automatiquement le mode sombre via:
- Media query `prefers-color-scheme: dark`
- Couleurs adaptées
- Contrastes optimisés

## Personnalisation

### Modifier les couleurs

Dans `HeatmapRisqueAccordionRenderer.css`:

```css
.heatmap-cell-faible {
  background: #4caf50; /* Vert */
}

.heatmap-cell-moyen {
  background: #ff9800; /* Orange */
}

.heatmap-cell-élevé {
  background: #f44336; /* Rouge */
}
```

### Modifier la logique de criticité

Dans `HeatmapRisqueAccordionRenderer.tsx`, fonction `getCriticite()`:

```typescript
const getCriticite = (probabilite: string, impact: string): string => {
  // Modifier la logique ici
  if (probabilite === 'Élevé' && impact === 'Élevé') {
    return 'Élevé';
  }
  // ...
};
```

## Dépannage

### Problème: Rien ne s'affiche

**Causes possibles**:
- Format JSON incorrect
- Endpoint n8n ne répond pas
- Erreur de parsing

**Solutions**:
1. Vérifier la console (F12)
2. Tester l'endpoint avec le script PowerShell
3. Vérifier les logs du router

### Problème: Couleurs incorrectes

**Causes possibles**:
- Valeurs de criticité incorrectes
- Problème d'accents
- Casse incorrecte

**Solutions**:
1. Vérifier les valeurs: "Élevé", "Moyen", "Faible"
2. Respecter les accents (é)
3. Respecter la casse (majuscule initiale)

### Problème: Erreur de parsing

**Causes possibles**:
- Structure JSON invalide
- Clé de cartographie manquante
- Tables manquantes

**Solutions**:
1. Vérifier la structure JSON
2. S'assurer que "Etape mission - Cartographie" existe
3. Vérifier qu'il y a au moins 2 tables

## Évolutions possibles

### Fonctionnalités à ajouter

1. **Export PDF**
   - Générer un PDF de la heatmap
   - Inclure le tableau détaillé

2. **Filtres**
   - Filtrer par criticité
   - Filtrer par opérationnel
   - Recherche textuelle

3. **Statistiques**
   - Graphiques de répartition
   - Indicateurs clés
   - Tendances

4. **Édition**
   - Modifier les risques
   - Recalculer la criticité
   - Sauvegarder les modifications

## Support

Pour toute question ou problème:
1. Consulter cette documentation
2. Vérifier les logs de la console
3. Tester avec le script PowerShell
4. Contacter l'équipe de développement

## Changelog

### Version 1.0.0 (02 Avril 2026)
- Création initiale du composant
- Intégration dans Claraverse
- Support du Case 34
- Documentation complète
