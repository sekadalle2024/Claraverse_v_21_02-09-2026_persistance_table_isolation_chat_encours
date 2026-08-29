# 🎯 Guide V2 - Documents Séparés

## ✨ Nouvelle fonctionnalité

La version 2 génère **un document séparé pour chaque table Flowise** détectée.

## 📊 Exemple de comportement

Si vous avez dans votre page :

```
Table 1: Examen CIA (sans Flowise)
Table 2: Examen CIA (sans Flowise)
...
Table 11: Flowise + PARTIE 1
Table 12: Flowise + PARTIE 2
```

Le script va générer :
- **Document 1** après la Table 11 (template PARTIE 1)
- **Document 2** après la Table 12 (template PARTIE 2)

## 🚀 Test immédiat

Rechargez votre page Claraverse et tapez dans la console :

```javascript
window.ModelisationTemplateV2.execute()
```

Vous devriez voir :
```
🚀 Modelisation_template_v2.js - Génération séparée
   Table 11 (Flowise): FlowisePartie 1...
   ✅ PARTIE1 détectée
   Table 12 (Flowise): FlowisePARTIE 2...
   ✅ PARTIE2 détectée
📊 2 document(s) à générer
📄 Case 1: PARTIE 1 (Document DOCX)
✅ Template 1 injecté
📊 Case 2: PARTIE 2 (JSON statique)
✅ Template 2 injecté
✅ Génération terminée
```

## 📍 Où sont les documents ?

Chaque document est injecté **juste après sa table Flowise** :

```
Table 11 (Flowise + PARTIE 1)
  ↓
📄 DOCUMENT 1 (E-AUDIT PRO 2.0 - Format PDF)
  ↓
Table 12 (Flowise + PARTIE 2)
  ↓
📄 DOCUMENT 2 (Accordéon avec sections)
```

## 🎨 Différences entre les templates

### PARTIE 1 - Template Alpha (PDF)
- Format page unique
- Style document professionnel
- Fond dégradé violet
- Titre "E-AUDIT PRO 2.0"

### PARTIE 2, 3, 4, 5 - Template Beta (Accordéon)
- Sections pliables/dépliables
- Navigation par onglets
- Contenu structuré
- Données JSON ou dynamiques

## 🔧 Avantages de la V2

1. ✅ **Séparation claire** : Chaque table génère son propre document
2. ✅ **Positionnement précis** : Le document apparaît juste après sa table
3. ✅ **Pas de confusion** : Chaque document est indépendant
4. ✅ **Scalable** : Fonctionne avec 1, 2, 10 tables Flowise

## 💡 Commandes utiles

```javascript
// Exécuter manuellement
window.ModelisationTemplateV2.execute()

// Voir la config
window.ModelisationTemplateV2.config

// Compter les documents injectés
document.querySelectorAll('.modelisation-template-container').length

// Supprimer tous les documents
document.querySelectorAll('.modelisation-template-container').forEach(el => el.remove())

// Réinjecter
window.ModelisationTemplateV2.execute()
```

## 🧪 Test avec plusieurs tables

Créez plusieurs tables Flowise dans votre chat :

**Table 1:**
| Flowise | Type |
|---------|------|
| PARTIE 1 | Guide |

**Table 2:**
| Flowise | Description |
|---------|-------------|
| PARTIE 2 | Méthodologie |

**Table 3:**
| Flowise | Info |
|---------|------|
| PARTIE 3 | Données dynamiques |

Résultat : **3 documents séparés** seront générés, chacun après sa table !

## 🔄 Migration depuis V1

Si vous utilisiez la V1 :
- ✅ La V2 est déjà activée dans `index.html`
- ✅ L'ancienne V1 est commentée
- ✅ Même API : `window.ModelisationTemplateV2.execute()`
- ✅ Même détection : "Flowise" + "PARTIE X"

## ⚡ Performance

- Détection instantanée
- Injection séquentielle (évite les conflits)
- Observateur de mutations pour les nouvelles tables
- Protection contre les doubles injections

## 🎯 Résultat attendu

Après exécution, vous verrez dans votre page :
- Vos tables originales (intactes)
- Un document professionnel après chaque table Flowise
- Chaque document avec son propre style et contenu
- Navigation fluide entre les sections

C'est exactement ce que vous vouliez : **des générations de documents séparées** ! 🎉
