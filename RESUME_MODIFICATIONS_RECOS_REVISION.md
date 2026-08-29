# Résumé Exécutif : Modifications Recos Revision des Comptes
## Formatage des Tables d'Audit (Frap)

**Date** : 25 Mars 2026  
**Statut** : ✅ Prêt pour implémentation  
**Impact** : Frontend - Affichage des tables d'audit

---

## 🎯 Objectif

Afficher les tables d'audit (Frap) avec le bon formatage :
- **Table 1** : Tableau 2 colonnes (Rubrique | Description) - Métadonnées
- **Tables 2+** : Tableaux 1 colonne avec en-tête rouge - Contenu audit

---

## 📋 Modifications Effectuées

### 1. claraApiService.ts ✅ FAIT

**Fonction modifiée** : `convertHeaderTableToMarkdown()`

**Changements** :
- Ajout du paramètre `tableIndex: number = 0`
- Logique de distinction table 1 vs tables 2+
- Table 1 : Format markdown 2 colonnes
- Tables 2+ : Format HTML avec en-tête rouge (#8B0000)
- Gestion des sauts de ligne (`\n` → `<br>`)

**Avant** :
```typescript
private convertHeaderTableToMarkdown(data: any): string {
  // Toutes les tables : format 2 colonnes
  let md = "| Rubrique | Description |\n";
  // ...
}
```

**Après** :
```typescript
private convertHeaderTableToMarkdown(data: any, tableIndex: number = 0): string {
  // Table 1 (index 0) : format 2 colonnes
  if (tableIndex === 0) {
    let md = "| Rubrique | Description |\n";
    // ...
  }
  
  // Tables 2+ (index > 0) : format 1 colonne + en-tête rouge
  if (entries.length === 1) {
    let md = `<table style="background-color: #8B0000; color: white;">`;
    // ...
  }
}
```

### 2. convertStructuredDataToMarkdown() ✅ FAIT

**Changements** :
- Passage de l'index de table à `convertHeaderTableToMarkdown()`
- Détection de la clé principale (support "recos")

**Avant** :
```typescript
markdown += this.convertHeaderTableToMarkdown(tableData);
```

**Après** :
```typescript
markdown += this.convertHeaderTableToMarkdown(tableData, index);
```

### 3. Node Code N8N 📄 À COPIER

**Fichier** : `n8n_node_clean_final_recos.js`

**Fonction** : Transformer la réponse LLM en FORMAT 4

**Étapes** :
1. Extraire le texte brut du LLM
2. Nettoyer les échappements multiples
3. Parser le JSON
4. Envelopper dans `{ data: {...} }`
5. Retourner au format array

---

## 🔄 Flux de Traitement

```
LLM (Gemini)
  ↓ Retourne JSON brut
  ↓
Node Code N8N ("node clean")
  ↓ Enveloppe dans { data: {...} }
  ↓
Webhook Response
  ↓
claraApiService.ts (normalizeN8nResponse)
  ↓ Détecte FORMAT 4
  ↓
convertStructuredDataToMarkdown()
  ↓ Boucle sur les tables avec index
  ↓
convertHeaderTableToMarkdown(data, index)
  ↓ Table 1 = 2 colonnes, Tables 2+ = 1 colonne rouge
  ↓
Markdown généré
  ↓
Frontend affiche les tables formatées
```

---

## 📊 Format de Réponse

### Réponse N8N Attendue

```json
{
  "json": {
    "data": {
      "Etape mission - Recos revision des comptes": [
        {
          "table 1": {
            "Etape de mission": "Recommendations comptables",
            "Norme": "Norme ISA",
            "Méthode": "Méthode de la regularisations des comptes par les assertions",
            "Reference": "Recos revision-001"
          }
        },
        {
          "table 2": {
            "Intitule": "Dépenses de caisse non appuyées par des pièces justificatives probantes"
          }
        },
        {
          "table 3": {
            "Description": "Nous avons mis en œuvre une procédure de rapprochement..."
          }
        },
        {
          "table 4": {
            "Observation": "Le rapprochement effectué entre les décaissements..."
          }
        },
        {
          "table 5": {
            "Ajustement/Reclassement": "Nous proposons un ajustement pour sur-évaluation..."
          }
        },
        {
          "table 6": {
            "Regularisation comptable": "Nous proposons le débit du compte 571 000..."
          }
        }
      ]
    }
  }
}
```

### Markdown Généré

#### Table 1 (index=0)
```markdown
| Rubrique | Description |
|----------|-------------|
| **Etape de mission** | Recommendations comptables |
| **Norme** | Norme ISA |
| **Méthode** | Méthode de la regularisations des comptes par les assertions |
| **Reference** | Recos revision-001 |
```

#### Tables 2-6 (index>0)
```html
<table style="width: 100%; border-collapse: collapse;">
<tr style="background-color: #8B0000; color: white;">
<th style="padding: 8px; text-align: left; border: 1px solid #8B0000;">Intitule</th>
</tr>
<tr>
<td style="padding: 8px; border: 1px solid #ddd;">Dépenses de caisse non appuyées par des pièces justificatives probantes</td>
</tr>
</table>
```

---

## 🎨 Résultat Visuel

### Table 1 (Métadonnées)
```
┌──────────────────┬──────────────────────────────────────────────┐
│ Rubrique         │ Description                