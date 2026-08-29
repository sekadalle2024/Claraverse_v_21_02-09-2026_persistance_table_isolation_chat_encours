# 📚 Exemples - Structures JSON et Conversions

> Exemples concrets de structures JSON et leurs conversions en Markdown

---

## 🎯 Vue d'Ensemble

Ce document contient des exemples réels de structures JSON retournées par les workflows n8n et leurs conversions en Markdown.

---

## 📝 FORMAT 1: Texte Simple

### Entrée JSON

```json
"Voici la réponse en texte simple. Cette réponse ne contient pas de structure complexe."
```

### Sortie Markdown

```markdown
Voici la réponse en texte simple. Cette réponse ne contient pas de structure complexe.
```

### Utilisation

- Notifications simples
- Messages courts
- Réponses textuelles

---

## 📝 FORMAT 2: Objet Output

### Entrée JSON

```json
{
  "output": "Voici la réponse du workflow. Elle est encapsulée dans un objet output."
}
```

### Sortie Markdown

```markdown
Voici la réponse du workflow. Elle est encapsulée dans un objet output.
```

### Utilisation

- Workflows n8n simples
- Réponses structurées basiques

---

## 📊 FORMAT 4A: Array Data

### Entrée JSON

```json
[{
  "data": {
    "Etape mission - Programme": [
      {
        "table 1": {
          "Intitule": "Processus Achats",
          "Description": "Analyse du processus d'achat de l'entreprise"
        }
      },
      {
        "table 2": [
          {
            "Risque": "Commandes non autorisées",
            "Impact": "Élevé",
            "Probabilité": "Moyenne"
          },
          {
            "Risque": "Factures non conformes",
            "Impact": "Moyen",
            "Probabilité": "Élevée"
          }
        ]
      }
    ]
  }
}]
```

### Sortie Markdown

```markdown
| Rubrique | Description |
|----------|-------------|
| **Intitule** | Processus Achats |
| **Description** | Analyse du processus d'achat de l'entreprise |

### 📄 Table 2

| Risque | Impact | Probabilité |
|--------|--------|-------------|
| Commandes non autorisées | Élevé | Moyenne |
| Factures non conformes | Moyen | Élevée |
```

### Utilisation

- Workflows complexes
- Rapports avec sections multiples
- Format le plus courant

---

## 🔧 FORMAT CASE 25: Tables Multiples

### Entrée JSON

```json
{
  "data": {
    "Etape mission - Programme": [{
      "table 1": {
        "Intitule": "Recommandations Contrôle Interne Comptable",
        "Description": "Analyse des points d'amélioration du contrôle interne"
      },
      "table 2": {
        "Observation": "Le processus de validation des factures présente des faiblesses"
      },
      "table 3": [
        {
          "Numéro": "1",
          "Recommandation": "Mettre en place une double validation",
          "Priorité": "Haute"
        },
        {
          "Numéro": "2",
          "Recommandation": "Former les équipes aux procédures",
          "Priorité": "Moyenne"
        }
      ],
      "table 4": [
        {
          "Action": "Créer une procédure écrite",
          "Responsable": "Directeur Financier",
          "Échéance": "30/04/2026"
        }
      ],
      "table 5": [
        {
          "Indicateur": "Taux de factures validées",
          "Cible": "100%",
          "Actuel": "85%"
        }
      ],
      "table 6": [
        {
          "Document": "Procédure de validation",
          "Statut": "À créer",
          "Date": "30/04/2026"
        }
      ]
    }]
  }
}
```

### Sortie Markdown

```markdown
| Rubrique | Description |
|----------|-------------|
| **Intitule** | Recommandations Contrôle Interne Comptable |
| **Description** | Analyse des points d'amélioration du contrôle interne |

| **Observation** |
|-----------------|
| Le processus de validation des factures présente des faiblesses |

### 📄 Table 3

| Numéro | Recommandation | Priorité |
|--------|----------------|----------|
| 1 | Mettre en place une double validation | Haute |
| 2 | Former les équipes aux procédures | Moyenne |

### 📄 Table 4

| Action | Responsable | Échéance |
|--------|-------------|----------|
| Créer une procédure écrite | Directeur Financier | 30/04/2026 |

### 📄 Table 5

| Indicateur | Cible | Actuel |
|------------|-------|--------|
| Taux de factures validées | 100% | 85% |

### 📄 Table 6

| Document | Statut | Date |
|----------|--------|------|
| Procédure de validation | À créer | 30/04/2026 |
```

### Utilisation

- Workflow "Recos contrôle interne comptable"
- Rapports avec 6 sections
- Format structuré complexe

---

## 🔧 FORMAT Programme Contrôle Comptes

### Entrée JSON

```json
{
  "data": {
    "Tableau entete": {
      "Processus": "Achats",
      "Niveau de risque R": "Élevé",
      "Assertion": "Exhaustivité"
    },
    "Tableau processus": [
      {
        "Opération": "Réception des marchandises",
        "Acteur": "Magasinier",
        "Principale": "Oui"
      },
      {
        "Opération": "Contrôle qualité",
        "Acteur": "Contrôleur qualité",
        "Principale": "Oui"
      },
      {
        "Opération": "Saisie dans le système",
        "Acteur": "Assistant comptable",
        "Principale": "Non"
      },
      {
        "Opération": "Validation de la facture",
        "Acteur": "Responsable achats",
        "Principale": "Oui"
      },
      {
        "Opération": "Paiement",
        "Acteur": "Trésorier",
        "Principale": "Oui"
      }
    ]
  }
}
```

### Sortie Markdown

```markdown
| Rubrique | Description |
|----------|-------------|
| **Processus** | Achats |
| **Niveau de risque R** | Élevé |
| **Assertion** | Exhaustivité |

| Opération | Acteur | Principale |
|-----------|--------|------------|
| Réception des marchandises | Magasinier | Oui |
| Contrôle qualité | Contrôleur qualité | Oui |
| Saisie dans le système | Assistant comptable | Non |
| Validation de la facture | Responsable achats | Oui |
| Paiement | Trésorier | Oui |
```

### Caractéristiques

- Deux tableaux collés sans titre ni tiret
- "Tableau entete" = Format 2 colonnes
- "Tableau processus" = Tableau de données sans titre
- Espacement minimal entre les tableaux

### Utilisation

- Workflow "Programme_controle_comptes"
- Endpoint: `https://t22wtwxl.rpcld.app/webhook/programme_controle_comptes`

---

## 📥 FORMAT Download

### Entrée JSON

```json
{
  "data": {
    "Etape mission - Programme": [
      {
        "Télécharger": {
          "Rapport d'audit": "https://example.com/rapport_audit.pdf",
          "Annexes": "https://example.com/annexes.pdf",
          "Synthèse": "https://example.com/synthese.pdf"
        }
      }
    ]
  }
}
```

### Sortie Markdown

```markdown
## 📥 Ressources et Téléchargements

🔗 **[Rapport d'audit](https://example.com/rapport_audit.pdf)**

🔗 **[Annexes](https://example.com/annexes.pdf)**

🔗 **[Synthèse](https://example.com/synthese.pdf)**
```

### Utilisation

- Workflows avec fichiers à télécharger
- Rapports avec annexes

---

## 🔄 Exemple de Conversion Complète

### Scénario: Workflow "Recos Révision des Comptes"

#### Entrée JSON Complète

```json
[{
  "data": {
    "Etape mission - Recos revision": [{
      "table 1": {
        "Intitule": "Recommandations Révision Compte Clients",
        "Description": "Analyse des comptes clients et recommandations d'audit"
      },
      "table 2": {
        "Observation": "Plusieurs créances anciennes non provisionnées"
      },
      "table 3": [
        {
          "Numéro": "1",
          "Recommandation": "Provisionner les créances > 1 an",
          "Impact": "Élevé"
        },
        {
          "Numéro": "2",
          "Recommandation": "Mettre en place un suivi mensuel",
          "Impact": "Moyen"
        }
      ],
      "table 4": [
        {
          "Test": "Circularisation clients",
          "Échantillon": "20 clients",
          "Résultat": "2 écarts détectés"
        }
      ]
    }]
  }
}]
```

#### Sortie Markdown Complète

```markdown
| Rubrique | Description |
|----------|-------------|
| **Intitule** | Recommandations Révision Compte Clients |
| **Description** | Analyse des comptes clients et recommandations d'audit |

| **Observation** |
|-----------------|
| Plusieurs créances anciennes non provisionnées |

### 📄 Table 3

| Numéro | Recommandation | Impact |
|--------|----------------|--------|
| 1 | Provisionner les créances > 1 an | Élevé |
| 2 | Mettre en place un suivi mensuel | Moyen |

### 📄 Table 4

| Test | Échantillon | Résultat |
|------|-------------|----------|
| Circularisation clients | 20 clients | 2 écarts détectés |
```

#### Logs de Conversion

```
🔍 Clé principale détectée: "Etape mission - Recos revision"
📊 Nombre d'éléments dans le tableau: 1
🔧 FORMAT CASE 25 DÉTECTÉ: Toutes les tables dans un seul objet
📊 Nombre de tables trouvées: 4
📋 Table 1/4: "table 1" (type: header)
🔄 convertHeaderTableToMarkdown - Table 1: { entriesCount: 2, keys: ['Intitule', 'Description'] }
✅ Table 1 générée (123 caractères)
📋 Table 2/4: "table 2" (type: header)
🔄 convertHeaderTableToMarkdown - Table 2: { entriesCount: 1, keys: ['Observation'] }
✅ Table 2 générée (Tableau Markdown): { header: 'Observation', contentLength: 45, markdownLength: 98 }
📋 Table 3/4: "table 3" (type: data_array)
🔄 Conversion de 📄 Table 3 avec 2 lignes
📋 Colonnes détectées (3): Numéro, Recommandation, Impact
✅ Tableau 📄 Table 3 converti avec succès
📋 Table 4/4: "table 4" (type: data_array)
🔄 Conversion de 📄 Table 4 avec 1 lignes
📋 Colonnes détectées (3): Test, Échantillon, Résultat
✅ Tableau 📄 Table 4 converti avec succès
```

---

## 🎨 Exemples de Cas Limites

### 1. Données Vides

#### Entrée

```json
{
  "data": {
    "Tableau entete": {},
    "Tableau processus": []
  }
}
```

#### Sortie

```markdown
(Aucun tableau généré)
```

### 2. Valeurs Nulles

#### Entrée

```json
{
  "data": {
    "Etape mission - Programme": [{
      "table 1": {
        "Intitule": "Titre",
        "Description": null
      }
    }]
  }
}
```

#### Sortie

```markdown
| Rubrique | Description |
|----------|-------------|
| **Intitule** | Titre |
| **Description** | - |
```

### 3. Caractères Spéciaux

#### Entrée

```json
{
  "data": {
    "Etape mission - Programme": [{
      "table 1": [
        {
          "Colonne": "Valeur avec | pipe",
          "Autre": "Valeur avec\nsaut de ligne"
        }
      ]
    }]
  }
}
```

#### Sortie

```markdown
### 📄 Table 1

| Colonne | Autre |
|---------|-------|
| Valeur avec \| pipe | Valeur avec saut de ligne |
```

### 4. Longues Valeurs

#### Entrée

```json
{
  "data": {
    "Etape mission - Programme": [{
      "table 1": [
        {
          "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        }
      ]
    }]
  }
}
```

#### Sortie

```markdown
### 📄 Table 1

| Description |
|-------------|
| Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris... |
```

---

## 🔍 Comparaison Avant/Après Corrections

### Problème 1: Affichage Texte Brut

#### AVANT (Texte brut)

```
Tableau entete: { Processus: "Achats", Niveau de risque R: "Élevé", Assertion: "Exhaustivité" }
Tableau processus: [{ Opération: "Réception des marchandises", Acteur: "Magasinier", Principale: "Oui" }, ...]
```

#### APRÈS (Tableaux Markdown)

```markdown
| Rubrique | Description |
|----------|-------------|
| **Processus** | Achats |
| **Niveau de risque R** | Élevé |
| **Assertion** | Exhaustivité |

| Opération | Acteur | Principale |
|-----------|--------|------------|
| Réception des marchandises | Magasinier | Oui |
```

### Problème 2: Titre et Tiret Indésirables

#### AVANT

```markdown
| Rubrique | Description |
|----------|-------------|
| **Processus** | Achats |

### Tableau processus

| Opération | Acteur | Principale |
|-----------|--------|------------|
| Réception des marchandises | Magasinier | Oui |
```

#### APRÈS

```markdown
| Rubrique | Description |
|----------|-------------|
| **Processus** | Achats |

| Opération | Acteur | Principale |
|-----------|--------|------------|
| Réception des marchandises | Magasinier | Oui |
```

---

## 📚 Ressources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Comprendre le flux
- [FORMATS_SUPPORTES.md](./FORMATS_SUPPORTES.md) - Formats existants
- [GUIDE_AJOUT_FORMAT.md](./GUIDE_AJOUT_FORMAT.md) - Ajouter un format

---

**Dernière mise à jour**: 31 Mars 2026
