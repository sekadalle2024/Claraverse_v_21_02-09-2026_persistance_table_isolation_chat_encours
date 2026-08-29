# Mise à jour Modelisation_template_v2.js - Case 10 Pandas

## Modifications apportées

### 1. Critère table cible actualisé
Le critère de détection des tables a été modifié :
- **Ancien critère** : Entêtes "Flowise", "FLOWISE", "flowise"
- **Nouveau critère** : Entêtes "Template", "TEMPLATE", "template"

### 2. Ajout du Case 10 - Pandas avec Backend Python

#### Architecture
Le Case 10 utilise une architecture hybride :
1. **Backend Python (Pandas)** : API FastAPI avec vraie librairie Pandas
2. **Fallback JavaScript** : Calculs côté client si le backend n'est pas disponible

#### Fichiers créés/modifiés

| Fichier | Description |
|---------|-------------|
| `py_backend/pandas_api.py` | API REST Pandas avec FastAPI |
| `py_backend/requirements.txt` | Ajout de pandas et numpy |
| `py_backend/main.py` | Import du router pandas |
| `public/Modelisation_template_v2.js` | Case 10 avec appel API |

### 3. API Backend Pandas

#### Endpoints disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/pandas/data` | GET | Toutes les données |
| `/pandas/stats` | GET | Statistiques descriptives |
| `/pandas/top/{column}/{n}` | GET | Top N par colonne |
| `/pandas/bottom/{column}/{n}` | GET | Bottom N par colonne |
| `/pandas/groupby/categorie_prix` | GET | Stats par catégorie |
| `/pandas/filter` | POST | Filtrer les données |
| `/pandas/correlation` | GET | Matrice de corrélation |
| `/pandas/arrondissement/{id}` | GET | Données d'un arrondissement |
| `/pandas/chers` | GET | Arrondissements > 10000€/m² |
| `/pandas/denses` | GET | Arrondissements denses |
| `/pandas/export/csv` | GET | Export CSV |
| `/pandas/pivot` | GET | Tableau pivot |
| `/pandas/analysis/complete` | GET | Analyse complète (utilisé par le frontend) |

### 4. Installation

```bash
cd py_backend
pip install -r requirements.txt
python main.py
```

### 5. Comment tester

#### Dans le chat Claraverse
Créer une table avec une colonne "Template" contenant "Pandas" :

| Template |
|----------|
| Pandas   |

#### Via la console
```javascript
window.ModelisationTemplateV2.execute()
```

#### Test API directement
```bash
curl http://localhost:5000/pandas/analysis/complete
```

## Fonctionnement

1. Le frontend détecte une table avec "Template" + "Pandas"
2. Il tente d'appeler l'API backend `/pandas/analysis/complete`
3. Si le backend répond, les données Pandas réelles sont utilisées
4. Sinon, le fallback JavaScript calcule les mêmes résultats
5. L'interface affiche la source des données (Backend ou Fallback)

## Cases disponibles

| Case | Critère | Source | Type |
|------|---------|--------|------|
| 1 | PARTIE 1 | Document Word DOCX | Statique |
| 2 | PARTIE 2 | JSON DATA_COLLECTION | Statique |
| 3 | PARTIE 3 | Endpoint n8n | Dynamique |
| 4 | PARTIE 4 | Endpoint n8n Programme | Dynamique |
| 5 | PARTIE 5 | Document PDF | Statique |
| 8 | n8n_doc | Google Drive | Dynamique |
| 10 | Pandas | API Backend Python | Hybride |
