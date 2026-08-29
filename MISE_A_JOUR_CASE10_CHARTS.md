# Mise à jour Case 10 - Pandas avec 6 Graphiques Chart.js

## Modifications effectuées

### Fichier modifié
- `public/Modelisation_template_v2.js`

### Changements apportés

#### 1. Ajout de 2 nouveaux graphiques (total: 6)
- **Graphique 5**: Densité de Population (Bar horizontal)
  - Affiche la densité (hab/km²) pour chaque arrondissement
  - Couleurs: Rouge (>30k), Orange (>20k), Vert (<20k)
  
- **Graphique 6**: Comparaison Multi-critères (Radar)
  - Compare les 5 arrondissements les plus peuplés
  - Critères: Population, Prix/m², Densité, Restaurants, Métros
  - Données normalisées (0-100%)

#### 2. Amélioration de la mise en page
- Grille 2x3 pour les 6 graphiques
- Hauteur augmentée à 280px (au lieu de 250px)
- Ajout d'ombres et meilleur espacement

### Graphiques disponibles

| # | Type | Description |
|---|------|-------------|
| 1 | Bar | Population par Arrondissement |
| 2 | Line | Prix au m² par Arrondissement |
| 3 | Doughnut | Répartition par Catégorie de Prix |
| 4 | Scatter | Corrélation Prix vs Population |
| 5 | Bar (horizontal) | Densité de Population |
| 6 | Radar | Comparaison Multi-critères Top 5 |

## Test

### Fichier de test créé
- `public/test-modelisation-case10-charts.html`

### Comment tester

1. **Avec données simulées** (sans backend):
   ```
   Ouvrir: http://localhost:5173/test-modelisation-case10-charts.html
   Cliquer: "Tester avec données simulées"
   ```

2. **Avec backend Python** (recommandé):
   ```bash
   # Terminal 1: Démarrer le backend
   cd py_backend
   pip install pandas numpy flask flask-cors
   python main.py
   
   # Terminal 2: Ouvrir le test
   http://localhost:5173/test-modelisation-case10-charts.html
   Cliquer: "Tester avec backend Python"
   ```

3. **Dans l'application Claraverse**:
   - Créer une table avec les colonnes "Template" et "Flowise"
   - Ajouter une ligne avec "Pandas" dans la colonne Flowise
   - Le template Case 10 sera automatiquement injecté

## Dépendances

- **Chart.js**: Chargé automatiquement via CDN
  ```html
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  ```

- **Backend Python** (optionnel mais recommandé):
  - Flask + Flask-CORS
  - Pandas + NumPy
  - Endpoint: `http://localhost:5000/pandas/analysis/complete`

## Structure des données attendues

```javascript
{
  arrondissements: [
    {
      arrondissement: 1,
      population: 16266,
      surface_km2: 1.83,
      densite: 8890,
      prix_m2_moyen: 11500,
      categorie_prix: 'Cher',
      nb_restaurants: 245,
      nb_metro: 8
    },
    // ... 20 arrondissements
  ],
  top5_population: [...],
  top5_restaurants: [...],
  stats_par_categorie: [...],
  arrondissements_chers: [...],
  total_population: 2062015,
  prix_moyen_global: 10015,
  densite_moyenne: 23401
}
```

## Résultat attendu

6 graphiques interactifs affichés dans un accordéon:
- Tous les graphiques sont responsives
- Tooltips au survol
- Couleurs cohérentes par catégorie de prix
- Légendes claires
