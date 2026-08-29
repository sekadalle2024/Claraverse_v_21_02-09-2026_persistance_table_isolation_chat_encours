# Modélisation Table n8n - Documentation

## Description

La fonctionnalité "Modélisation table n8n" permet d'envoyer le contenu HTML des tables vers un endpoint n8n pour traitement par un agent pandas en backend, puis de remplacer/ajouter le contenu avec les données JSON retournées converties en HTML.

## Accès

### Via le menu contextuel
1. Survoler ou cliquer sur une table dans le chat
2. Ouvrir le menu contextuel (clic droit ou survol)
3. Dérouler la section "🐼 Modélisation Pandas"
4. Cliquer sur "Modélisation table n8n"

### Via raccourci clavier
- **Ctrl+M** : Exécute la modélisation n8n sur la table sélectionnée

## Fonctionnement

### 1. Collecte des tables
- Trouve la div parente contenant la table ciblée
- Collecte le `outerHTML` de toutes les tables dans cette div
- Ajoute une table complémentaire avec les métadonnées :
  - `Command` = `Modelisation_table`
  - `Meta donnees` = `Complementaire`
  - `Timestamp` = Date/heure actuelle

### 2. Envoi vers n8n
- **Endpoint** : `https://barow52161.app.n8n.cloud/webhook/htlm_processor`
- **Méthode** : POST
- **Payload JSON** :
```json
{
  "question": "<HTML des tables>",
  "source": "claraverse_menu",
  "timestamp": "2025-12-23T...",
  "tableCount": 3
}
```

### 3. Traitement de la réponse
La réponse JSON de n8n est convertie en tables HTML :

**Exemple de réponse n8n** :
```json
{
  "Etape mission - Programme": [
    {
      "table 1": {
        "Etape de mission": "Programme de travail",
        "Norme": "13.6 Programme de travail",
        "Méthode": "Méthode des contrôles clés par les risques"
      }
    },
    {
      "table 2": [
        { "no": 1, "tâches clés": "...", "Point de controle": "..." },
        { "no": 2, "tâches clés": "...", "Point de controle": "..." }
      ]
    }
  ]
}
```

### 4. Insertion des résultats
- Les nouvelles tables sont insérées après la table cible
- Chaque table générée est éditable
- Les cellules sont stylisées avec les classes Claraverse

## Logs de debug

Les logs sont affichés dans la console avec le préfixe `[N8N Modelisation]` :

```
🚀 [N8N Modelisation] Démarrage de l'envoi vers n8n...
📊 [N8N Modelisation] 2 table(s) trouvée(s) dans la div
📝 [N8N Modelisation] HTML total collecté: 1234 caractères
📤 [N8N Modelisation] Envoi vers endpoint n8n...
📥 [N8N Modelisation] Réponse HTTP status: 200
🔄 [N8N Modelisation] Conversion JSON -> HTML...
✅ [N8N Modelisation] Tables insérées avec succès
```

## Fichiers modifiés

- `public/menu.js` : Ajout de la fonction `executeModelisationN8n()` et des fonctions utilitaires

## Test rapide

1. Ouvrir la console développeur (F12)
2. Aller dans une conversation avec des tables
3. Cliquer sur une table
4. Utiliser Ctrl+M ou le menu contextuel
5. Vérifier les logs dans la console
6. Observer les nouvelles tables générées

## Dépannage

| Problème | Solution |
|----------|----------|
| "Aucune table sélectionnée" | Cliquer d'abord sur une cellule de la table |
| Erreur HTTP 4xx/5xx | Vérifier que l'endpoint n8n est accessible |
| Réponse vide | Vérifier le format de la réponse n8n |
| Tables non éditables | Rafraîchir la page et réessayer |
