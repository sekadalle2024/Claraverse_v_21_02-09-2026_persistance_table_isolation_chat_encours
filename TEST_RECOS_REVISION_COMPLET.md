# Test Complet : Recos Revision des Comptes
## Vérification du Formatage des Tables

**Date** : 25 Mars 2026  
**Objectif** : Valider que les tables s'affichent correctement au frontend

---

## 🧪 Scénario de Test

### Données de Test

**Message** :
```
Recos_revision
[Cycle] : trésorerie
[test] : AA040
[reference] : test sur la validation du compte caisse
[Nature de test] = Rapprochement
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 000 FCFA sur les petites dépenses fournisseurs
```

### Flux Attendu

```
1. Frontend envoie le message
   ↓
2. Router détecte "Recos_revision"
   ↓
3. Appel à l'endpoint n8n
   ↓
4. LLM génère la réponse JSON
   ↓
5. Node "node clean" transforme en FORMAT 4
   ↓
6. Webhook retourne la réponse
   ↓
7. claraApiService.ts normalise
   ↓
8. convertStructuredDataToMarkdown() génère le markdown
   ↓
9. Frontend affiche les tables formatées
```

---

## ✅ Points de Vérification

### 1. Vérifier le Router

**Fichier** : `src/services/claraApiService.ts`  
**Fonction** : `getN8nEndpoint()`

```typescript
// Doit contenir :
case "recos_revision_comptes":
  console.log("🔀 Router → Case 26 : recos_revision_compte");
  return "https://t22wtwxl.rpcld.app/webhook/recos_revision_compte";
```

**Vérification** :
- ✅ Message contenant "Recos_revision" est routé correctement
- ✅ Console affiche "🔀 Router → Case 26"

### 2. Vérifier la Réponse N8N

**Endpoint** : `https://t22wtwxl.rpcld.app/webhook/recos_revision_compte`

**Réponse attendue** :
```json
[
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
              "Description": "Nous avons mis en œuvre une procédure de rapprochement des pièces justificatives de caisse..."
            }
          },
          {
            "table 4": {
              "Observation": "Le rapprochement effectué entre les décaissements enregistrés au crédit du compte 571 000..."
            }
          },
          {
            "table 5": {
              "Ajustement/Reclassement": "Nous proposons un ajustement pour sur-évaluation de charges..."
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
]
```

**Vérification** :
- ✅ Structure `{ "data": { "Etape mission - ...": [...] } }`
- ✅ 6 tables présentes (table 1 à table 6)
- ✅ Table 1 : 4 propriétés (Etape de mission, Norme, Méthode, Reference)
- ✅ Tables 2-6 : 1 propriété chacune (Intitule, Description, Observation, etc.)

### 3. Vérifier la Normalisation

**Fichier** : `src/services/claraApiService.ts`  
**Fonction** : `normalizeN8nResponse()`

**Console attendue** :
```
🔍 === DEBUT ANALYSE REPONSE N8N ===
🔍 Analyse du premier élément: {
  isObject: true,
  hasData: true,
  hasOutput: false,
  keys: ['data']
}
✅ FORMAT 4 DETECTE: Nouveau format "Programme de travail" avec structure data
📊 Contenu de data: {
  type: 'object',
  keys: ['Etape mission - Recos revision des comptes'],
  firstKey: 'Etape mission - Recos revision des comptes'
}
🔄 Début de la conversion en Markdown...
🔍 Clé principale détectée: "Etape mission - Recos revision des comptes"
📊 Nombre de tables trouvées: 6
📋 Table 1/6: "table 1" (type: header)
📋 Table 2/6: "table 2" (type: header)
...
✅ Conversion terminée: XXXX caractères générés
🔍 === FIN ANALYSE (FORMAT 4 - Programme de travail) ===
```

**Vérification** :
- ✅ FORMAT 4 détecté
- ✅ 6 tables trouvées
- ✅ Toutes les tables détectées comme "header"
- ✅ Conversion terminée sans erreur

### 4. Vérifier la Conversion Markdown

**Fichier** : `src/services/claraApiService.ts`  
**Fonction** : `convertStructuredDataToMarkdown()`

**Markdown attendu** :

#### Table 1 (index=0) - Format 2 colonnes
```markdown
| Rubrique | Description |
|----------|-------------|
| **Etape de mission** | Recommendations comptables |
| **Norme** | Norme ISA |
| **Méthode** | Méthode de la regularisations des comptes par les assertions |
| **Reference** | Recos revision-001 |
```

#### Table 2 (index=1) - Format 1 colonne + en-tête rouge
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

#### Tables 3-6 - Idem (format 1 colonne + en-tête rouge)

**Vérification** :
- ✅ Table 1 : Tableau markdown 2 colonnes
- ✅ Tables 2-6 : Tableaux HTML 1 colonne avec en-tête rouge
- ✅ Pas de JSON brut visible
- ✅ Sauts de ligne convertis en `<br>`

### 5. Vérifier l'Affichage Frontend

**Navigateur** : Ouvrir la console (F12)

**Vérifications visuelles** :

1. **Table 1** :
   - ✅ Affichée comme tableau 2 colonnes
   - ✅ En-tête noir (défaut)
   - ✅ Contient métadonnées (Etape de mission, Norme, etc.)

2. **Table 2** :
   - ✅ Affichée comme tableau 1 colonne
   - ✅ En-tête rouge (#8B0000)
   - ✅ Contient "Intitule"
   - ✅ Pas de JSON brut

3. **Tables 3-6** :
   - ✅ Idem table 2
   - ✅ En-têtes : Description, Observation, Ajustement/Reclassement, Regularisation comptable
   - ✅ Contenu lisible et bien formaté

---

## 🔧 Commandes de Test

### Test 1 : Vérifier le Router

**Console Browser** :
```javascript
// Ouvrir la console (F12)
// Envoyer un message avec "Recos_revision"
// Vérifier dans la console :
// 🔀 Router → Case 26 : recos_revision_compte
```

### Test 2 : Vérifier la Réponse N8N

**Curl** :
```bash
curl -X POST https://t22wtwxl.rpcld.app/webhook/recos_revision_compte \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Recos_revision [Cycle] : trésorerie [test] : AA040"
  }'
```

**Vérifier** :
- ✅ Réponse HTTP 200
- ✅ JSON valide
- ✅ Structure `{ "data": {...} }`

### Test 3 : Vérifier la Conversion Markdown

**Console Browser** :
```javascript
// Ouvrir la console (F12)
// Envoyer le message
// Vérifier dans la console :
// ✅ FORMAT 4 DETECTE
// 📊 Nombre de tables trouvées: 6
// ✅ Conversion terminée: XXXX caractères générés
```

---

## 📊 Résultats Attendus

### Cas de Succès ✅

| Étape | Résultat Attendu | Vérification |
|-------|------------------|-------------|
| Router | Message routé vers endpoint correct | Console : "🔀 Router → Case 26" |
| N8N | Réponse FORMAT 4 reçue | JSON avec structure "data" |
| Normalisation | FORMAT 4 détecté | Console : "✅ FORMAT 4 DETECTE" |
| Conversion | 6 tables converties | Console : "📊 Nombre de tables trouvées: 6" |
| Markdown | Tables formatées correctement | Table 1 = 2 colonnes, Tables 2-6 = 1 colonne rouge |
| Frontend | Affichage correct | Tables visibles et bien formatées |

### Cas d'Erreur ❌

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Bad escaped character in JSON" | Échappements mal gérés | Vérifier regex de nettoyage |
| "Aucune clé principale trouvée" | Structure JSON incorrecte | Vérifier réponse LLM |
| "Cannot read property 'length'" | Clé principale pas un array | Vérifier structure LLM |
| Tables affichées en JSON | Node code pas mis à jour | Copier le nouveau code |
| Tables sans en-tête rouge | claraApiService.ts pas modifié | Vérifier modifications |

---

## 🚀 Procédure de Test Complète

### Étape 1 : Préparation
- [ ] Vérifier que claraApiService.ts est modifié
- [ ] Vérifier que le node code n8n est mis à jour
- [ ] Ouvrir la console browser (F12)

### Étape 2 : Envoi du Message
- [ ] Envoyer le message de test
- [ ] Attendre la réponse

### Étape 3 : Vérification Console
- [ ] Vérifier "🔀 Router → Case 26"
- [ ] Vérifier "✅ FORMAT 4 DETECTE"
- [ ] Vérifier "📊 Nombre de tables trouvées: 6"
- [ ] Vérifier "✅ Conversion terminée"

### Étape 4 : Vérification Visuelle
- [ ] Table 1 : 2 colonnes (Rubrique | Description)
- [ ] Table 2 : 1 colonne avec en-tête rouge (Intitule)
- [ ] Table 3 : 1 colonne avec en-tête rouge (Description)
- [ ] Tables 4-6 : Idem
- [ ] Pas de JSON brut visible

### Étape 5 : Validation
- [ ] Tous les points vérifiés ✅
- [ ] Aucune erreur en console
- [ ] Affichage conforme aux captures d'écran

---

## 📸 Captures d'Écran de Référence

### Avant (Incorrect)
- Tables 2-6 affichées en JSON brut
- Pas de distinction visuelle
- Formatage non professionnel

### Après (Correct)
- Table 1 : Tableau 2 colonnes (métadonnées)
- Tables 2-6 : Tableaux 1 colonne avec en-tête rouge (contenu audit)
- Formatage professionnel et lisible

---

## ✅ Validation Finale

Une fois tous les tests passés :

- [ ] Documenter les résultats
- [ ] Prendre des captures d'écran
- [ ] Valider avec l'équipe
- [ ] Déployer en production

