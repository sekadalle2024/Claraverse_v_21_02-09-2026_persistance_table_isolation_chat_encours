# Correction Workflow N8N - Recos Revision des Comptes
## Format Tables Uniligne/Unicolonne avec En-têtes Rouges

**Date**: 25 Mars 2026  
**Statut**: ✅ Prêt pour implémentation  
**Objectif**: Afficher les tables d'audit (Frap) avec le bon formatage frontend

---

## 📋 Résumé des Modifications

### Problème Identifié
- Tables 2 à dernière affichées en JSON au lieu de tableaux formatés
- Manque de distinction visuelle entre table 1 (métadonnées) et tables 2+ (contenu audit)
- Format attendu par le frontend non respecté

### Solution Implémentée

#### 1️⃣ **Modification claraApiService.ts** ✅ FAIT
Fonction `convertHeaderTableToMarkdown()` améliorée :

```typescript
// Table 1 (index 0) : Format 2 colonnes
| Rubrique | Description |
|----------|-------------|
| **Etape de mission** | Recommendations comptables |
| **Norme** | Norme ISA |
...

// Tables 2+ (index > 0) : Format 1 colonne avec en-tête rouge
<table style="background-color: #8B0000; color: white;">
  <tr>
    <th>Intitule</th>
  </tr>
  <tr>
    <td>Dépenses de caisse non appuyées par des pièces justificatives probantes</td>
  </tr>
</table>
```

**Changements clés** :
- Détection de l'index de table (0 = table 1, >0 = tables 2+)
- Table 1 : Format 2 colonnes (Rubrique | Description)
- Tables 2+ : Format HTML avec en-tête rouge (#8B0000)
- Gestion des sauts de ligne (`\n` → `<br>`)

#### 2️⃣ **Node Code N8N** 
Fichier: `n8n_node_clean_final_recos.js`

**Fonction** : Transformer la réponse LLM en format attendu par claraApiService.ts

**Structure attendue** :
```json
{
  "json": {
    "data": {
      "Etape mission - Recos revision des comptes": [
        {
          "table 1": {
            "Etape de mission": "Recommendations comptables",
            "Norme": "Norme ISA",
            ...
          }
        },
        {
          "table 2": {
            "Intitule": "Dépenses de caisse non appuyées..."
          }
        },
        {
          "table 3": {
            "Description": "Nous avons mis en œuvre une procédure..."
          }
        },
        ...
      ]
    }
  }
}
```

---

## 🔧 Instructions d'Implémentation

### Étape 1 : Vérifier claraApiService.ts
✅ **DÉJÀ FAIT** - Les modifications sont en place

Vérifier que la fonction `convertHeaderTableToMarkdown()` contient :
- Paramètre `tableIndex: number = 0`
- Logique de distinction table 1 vs tables 2+
- Génération HTML avec en-tête rouge pour tables 2+

### Étape 2 : Mettre à jour le Node Code N8N

**Localisation** : Workflow n8n → Node "node clean" (après le LLM)

**Code à utiliser** : Voir `n8n_node_clean_final_recos.js`

**Points clés** :
1. Extraire le texte brut du LLM
2. Nettoyer les échappements multiples
3. Parser le JSON
4. Envelopper dans structure `{ data: {...} }`
5. Retourner au format array

### Étape 3 : Vérifier le Prompt LLM

**Vérifier que le LLM retourne** :
```json
{
  "Etape mission - Recos revision des comptes": [
    { "table 1": { "Etape de mission": "...", "Norme": "...", ... } },
    { "table 2": { "Intitule": "..." } },
    { "table 3": { "Description": "..." } },
    { "table 4": { "Observation": "..." } },
    { "table 5": { "Ajustement/Reclassement": "..." } },
    { "table 6": { "Regularisation comptable": "..." } }
  ]
}
```

---

## 📊 Format de Réponse Attendu

### Flux Complet

```
LLM (Gemini)
    ↓
    Retourne JSON brut avec structure "Etape mission - Recos revision des comptes"
    ↓
Node Code N8N ("node clean")
    ↓
    Enveloppe dans { data: {...} }
    ↓
Webhook Response
    ↓
claraApiService.ts (normalizeN8nResponse)
    ↓
    Détecte FORMAT 4 (structure "data")
    ↓
convertStructuredDataToMarkdown()
    ↓
    Boucle sur les tables avec index
    ↓
convertHeaderTableToMarkdown(data, index)
    ↓
    Table 1 (index=0) : Format 2 colonnes
    Tables 2+ (index>0) : Format 1 colonne + en-tête rouge
    ↓
Markdown généré
    ↓
Frontend affiche les tables formatées
```

---

## 🎨 Résultat Visuel Attendu

### Table 1 (Métadonnées)
```
| Rubrique | Description |
|----------|-------------|
| **Etape de mission** | Recommendations comptables |
| **Norme** | Norme ISA |
| **Méthode** | Méthode de la regularisations des comptes par les assertions |
| **Reference** | Recos revision-001 |
```

### Table 2 (Intitule)
```
┌─────────────────────────────────────────────────────────────┐
│ Intitule                                                    │
├─────────────────────────────────────────────────────────────┤
│ Dépenses de caisse non appuyées par des pièces             │
│ justificatives probantes                                    │
└─────────────────────────────────────────────────────────────┘
```

### Table 3 (Description)
```
┌─────────────────────────────────────────────────────────────┐
│ Description                                                 │
├─────────────────────────────────────────────────────────────┤
│ Nous avons mis en œuvre une procédure de rapprochement...  │
│ <br>                                                        │
│ Cette procédure vise à s'assurer que chaque décaissement...│
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Vérification

- [ ] claraApiService.ts modifié avec `convertHeaderTableToMarkdown(data, tableIndex)`
- [ ] Node code n8n remplacé par `n8n_node_clean_final_recos.js`
- [ ] Prompt LLM retourne structure "Etape mission - Recos revision des comptes"
- [ ] Test avec message contenant "Recos_revision"
- [ ] Tables affichées avec bon formatage (table 1 = 2 colonnes, tables 2+ = 1 colonne rouge)
- [ ] Sauts de ligne gérés correctement (`\n` → `<br>`)

---

## 🧪 Test Rapide

### Commande Test
```
Message: "Recos_revision"
Contenu: [Cycle] : trésorerie, [test] : AA040, [Anomalie] : inexistence de pièce justificatives...
```

### Résultat Attendu
- ✅ Table 1 : Tableau 2 colonnes (Rubrique | Description)
- ✅ Table 2 : Tableau 1 colonne avec en-tête rouge (Intitule)
- ✅ Table 3 : Tableau 1 colonne avec en-tête rouge (Description)
- ✅ Tables 4-6 : Idem (Observation, Ajustement, Regularisation)
- ✅ Pas de JSON brut visible
- ✅ Sauts de ligne affichés correctement

---

## 📝 Notes Importantes

1. **Index des tables** : Commence à 0 (table 1 = index 0)
2. **En-tête rouge** : Couleur #8B0000 (dark red)
3. **Sauts de ligne** : Convertis en `<br>` pour le markdown
4. **Compatibilité** : Fonctionne avec tous les workflows utilisant FORMAT 4

---

## 🔗 Fichiers Modifiés

| Fichier | Statut | Description |
|---------|--------|-------------|
| `src/services/claraApiService.ts` | ✅ Modifié | Fonction `convertHeaderTableToMarkdown()` |
| `n8n_node_clean_final_recos.js` | 📄 Référence | Code à copier dans le node n8n |
| Ce document | 📋 Nouveau | Guide d'implémentation |

---

## 🚀 Prochaines Étapes

1. Copier le code du node n8n dans le workflow
2. Tester avec un message "Recos_revision"
3. Vérifier le formatage des tables
4. Ajuster les couleurs/styles si nécessaire
5. Déployer en production

