# 🚀 Quick Reference : Formats de Réponse n8n

## 📋 Formats Supportés par claraApiService.ts

### FORMAT 1 : Output Simple
```json
[{
  "output": "Contenu markdown...",
  "stats": { "timestamp": "..." },
  "consolidationSuccess": true
}]
```
**Usage** : Réponses textuelles simples

---

### FORMAT 2 : Tables Multiples
```json
{
  "status": "success",
  "tables": [
    { "markdown": "| Col1 | Col2 |\n..." }
  ]
}
```
**Usage** : Plusieurs tables markdown

---

### FORMAT 3 : Output Direct
```json
{
  "output": "Contenu...",
  "metadata": {}
}
```
**Usage** : Réponse simple avec métadonnées

---

### FORMAT 4 : Programme de Travail ⭐
```json
[{
  "data": {
    "Etape mission - Implementation": [
      { "table 1": { "Etape": "...", "Normes": "..." } },
      { "table 2": [{ "no": 1, "Objectif": "..." }] },
      { "table 3": { "Télécharger": "https://..." } }
    ]
  }
}]
```
**Usage** : Structures complexes avec tables multiples
**Conversion** : Automatique en markdown

---

### FORMAT 5 : CIA Accordion
```json
[{
  "Sous-section": "Titre",
  "Sub-items": [{ "Titre": "...", "Contenu": "..." }]
}]
```
**Usage** : Cours CIA avec accordéons
**Préfixe** : `__CIA_ACCORDION__`

---

### FORMAT 6 : CIA QCM
```json
[{
  "Etape mission - CIA": [
    { "table 1": { "Titre": "QCM...", "Questions": [...] } }
  ]
}]
```
**Usage** : QCM CIA avec accordéons
**Préfixe** : `__CIA_QCM_ACCORDION__`

---

## 🔧 Code Minimal pour FORMAT 4

```javascript
// Dans n8n, node "Code" après le LLM
const llmOutput = $input.first().json;
return [{ json: [{ data: llmOutput }] }];
```

---

## 🎯 Détection Automatique

Le frontend détecte automatiquement le format :

```javascript
// FORMAT 4
if (firstItem && "data" in firstItem) {
  // Conversion en markdown
}

// FORMAT 5
if (firstItem && "Sous-section" in firstItem) {
  // Affichage accordéon CIA
}

// FORMAT 6
if (firstItem && "Etape mission - CIA" in firstItem) {
  // Affichage accordéon QCM
}
```

---

## 📊 Types de Tables (FORMAT 4)

### Table d'En-tête
```json
{
  "table 1": {
    "Etape": "Programme de travail",
    "Normes": "Norme 2320",
    "Reference": "PRG-001"
  }
}
```
**Détection** : Objet avec 2-5 propriétés simples
**Rendu** : Table clé-valeur

---

### Table de Données
```json
{
  "table 2": [
    { "no": 1, "Objectif": "...", "Travaux": "..." },
    { "no": 2, "Objectif": "...", "Travaux": "..." }
  ]
}
```
**Détection** : Array d'objets
**Rendu** : Tableau markdown complet

---

### Table de Téléchargement
```json
{
  "table 3": {
    "Télécharger": "https://example.com/file.pdf"
  }
}
```
**Détection** : Contient URLs ou mot "télécharger"
**Rendu** : Liens cliquables

---

## 🧪 Test Rapide

### Dans n8n
```json
// Payload de test
{ "question": "Implementation du contrôle interne" }

// Réponse attendue
[{
  "data": {
    "Etape mission - Implementation": [...]
  }
}]
```

### Dans le Frontend
```javascript
// Console (F12)
// Chercher :
"✅ FORMAT 4 DETECTE"
"🔄 Début de la conversion en Markdown..."
"✅ Conversion terminée: XXX caractères"
```

---

## 🐛 Dépannage Express

| Symptôme | Cause | Solution |
|----------|-------|----------|
| "Format non reconnu" | Structure incorrecte | Vérifier l'encapsulation `[{ data: ... }]` |
| "Bad escaped character" | Caractères spéciaux | Utiliser la fonction de nettoyage |
| Timeout | Workflow trop long | `claraApiService.setN8nTimeout(15*60*1000)` |
| CORS Error | Headers manquants | Ajouter headers CORS dans Webhook Response |

---

## 📚 Ressources

- **Documentation complète** : `MODIFICATIONS_WORKFLOW_N8N_POUR_CLARAAPI.md`
- **Guide d'intégration** : `GUIDE_INTEGRATION_N8N_CLARAAPI.md`
- **Code du node** : `n8n_format_response_node.js`
- **Workflow exemple** : `workflow_n8n_exemple_complet.json`

---

## 💡 Conseils

1. **Utiliser FORMAT 4** pour les structures complexes
2. **Tester dans n8n** avant de tester dans le frontend
3. **Vérifier les logs** dans la console du navigateur
4. **Documenter** les cas d'usage spécifiques

---

**Version** : 1.0
**Dernière mise à jour** : 2024
