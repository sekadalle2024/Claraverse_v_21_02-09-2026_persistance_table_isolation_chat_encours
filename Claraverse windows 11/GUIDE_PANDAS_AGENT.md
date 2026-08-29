# 🐼 Guide Agent Pandas - ClaraVerse

## Vue d'ensemble

L'Agent Pandas permet de calculer automatiquement les écarts dans les tables HTML du chat ClaraVerse. Il utilise LangChain avec Gemini 2.5 Flash pour l'analyse intelligente des données.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (menu.js)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Menu Contextuel → "🐼 Pandas Agent - Calcul Ecarts" │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  executePandasAgent()                                │    │
│  │  - Collecte outerHTML des tables                     │    │
│  │  - Envoie JSON vers backend                          │    │
│  │  - Remplace innerHTML avec résultat                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ HTTP POST /pandas-agent/process
┌─────────────────────────────────────────────────────────────┐
│                  Backend (pandas_agent.py)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  1. Parse HTML → DataFrame (BeautifulSoup)           │    │
│  │  2. Identifie colonnes (Ecart, Solde, etc.)          │    │
│  │  3. Calcule les écarts                               │    │
│  │  4. DataFrame → HTML                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  LangChain + Gemini 2.5 Flash (optionnel)            │    │
│  │  - Analyse intelligente des colonnes                 │    │
│  │  - Détection automatique des formules                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### 1. Installer les dépendances Python

```bash
cd py_backend
pip install -r requirements.txt
```

Dépendances ajoutées :
- `beautifulsoup4>=4.12.0` - Parsing HTML
- `langchain>=0.1.0` - Framework LLM
- `langchain-experimental>=0.0.47` - Agent Pandas
- `langchain-google-genai>=1.0.0` - Intégration Gemini

### 2. Démarrer le backend

```bash
cd py_backend
python main.py --host 127.0.0.1 --port 5000
```

### 3. Vérifier l'installation

Ouvrir dans le navigateur :
```
http://localhost:5000/pandas-agent/status
```

Réponse attendue :
```json
{
  "langchain_available": true,
  "agent_initialized": false,
  "gemini_configured": true,
  "message": "Agent en mode simple"
}
```

## Utilisation

### Via le Menu Contextuel

1. Survoler une table dans le chat ClaraVerse
2. Clic droit pour ouvrir le menu contextuel
3. Cliquer sur **"🐼 Pandas Agent - Calcul Ecarts"**
4. Les écarts sont calculés et la table est mise à jour

### Via Raccourci Clavier

- **Ctrl+P** : Exécute l'agent Pandas sur la table sélectionnée

### Via la Page de Test

Ouvrir `public/test-pandas-agent.html` pour tester l'agent de manière isolée.

## Logique de Calcul des Écarts

L'agent détecte automatiquement les colonnes et applique la formule appropriée :

### Colonnes Recherchées

| Type | Mots-clés détectés |
|------|-------------------|
| Écart | ecart, écart, difference, diff |
| Solde final | théorique, theorique, final |
| Solde clôture | clôture, cloture, bg |
| Numériques | solde, montant, valeur, total, somme |

### Formule Appliquée

```
Ecart = Solde final théorique - Solde BG clôture
```

Si ces colonnes ne sont pas trouvées, l'agent utilise :
```
Ecart = Dernière colonne numérique - Première colonne numérique
```

## API Endpoints

### POST /pandas-agent/process

Traite les tables et calcule les écarts.

**Request Body :**
```json
{
  "tables": [
    {
      "tableId": "table_123",
      "outerHTML": "<table>...</table>"
    }
  ],
  "targetTableId": "table_123",
  "action": "calculate_ecart"
}
```

**Response :**
```json
{
  "success": true,
  "targetTableId": "table_123",
  "resultHTML": "<table>...</table>",
  "message": "✅ Calculs effectués sur 5 lignes",
  "calculations": {
    "rows_processed": 5,
    "columns": ["No", "Compte", "Ecart"],
    "ecart_column_found": true
  }
}
```

### GET /pandas-agent/status

Vérifie le statut de l'agent.

### POST /pandas-agent/test

Exécute un test avec des données exemple.

## Configuration Gemini

La clé API Gemini est configurée dans `py_backend/pandas_agent.py` :

```python
GEMINI_API_KEY = "AIzaSyDOSWlZ1r0BigvXX7yVmxaST6dodmVEiyw"
```

Pour utiliser votre propre clé :
1. Obtenir une clé sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Remplacer la valeur dans le fichier

## Mode de Fonctionnement

### Mode Simple (par défaut)

Si LangChain n'est pas disponible ou si l'initialisation échoue, l'agent fonctionne en mode simple :
- Détection des colonnes par mots-clés
- Calcul mathématique direct
- Pas d'appel au LLM

### Mode LangChain (avec Gemini)

Si LangChain est disponible :
- Analyse intelligente des colonnes
- Détection automatique des formules
- Utilisation de Gemini 2.5 Flash

## Fichiers Créés/Modifiés

| Fichier | Description |
|---------|-------------|
| `py_backend/pandas_agent.py` | Agent Pandas avec LangChain |
| `py_backend/main.py` | Ajout du router pandas-agent |
| `py_backend/requirements.txt` | Dépendances ajoutées |
| `public/menu.js` | Action "Pandas Agent" ajoutée |
| `public/test-pandas-agent.html` | Page de test |

## Dépannage

### L'agent ne répond pas

1. Vérifier que le backend est démarré
2. Vérifier les logs du backend
3. Tester avec `/pandas-agent/status`

### Erreur "LangChain non disponible"

```bash
pip install langchain langchain-experimental langchain-google-genai
```

### Erreur de clé API Gemini

1. Vérifier que la clé est valide
2. Vérifier les quotas sur Google AI Studio

### Les écarts ne sont pas calculés

1. Vérifier que la table contient une colonne "Ecart"
2. Vérifier que les colonnes numériques sont bien formatées
3. Consulter les logs du backend

## Exemple de Table Compatible

```html
<table>
  <thead>
    <tr>
      <th>Compte</th>
      <th>Libelle</th>
      <th>Solde BG clôture</th>
      <th>Solde final théorique</th>
      <th>Ecart</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>211000</td>
      <td>Terrains</td>
      <td>150000</td>
      <td>150000</td>
      <td></td>  <!-- Sera calculé -->
    </tr>
  </tbody>
</table>
```
