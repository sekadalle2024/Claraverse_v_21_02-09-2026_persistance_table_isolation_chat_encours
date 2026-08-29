# Architecture Finale - Schéma de Calcul Papier de Travail
**Date:** 24 avril 2026
**Mise à jour:** 25 avril 2026 - Correction positionnement Cross référence

## 🎯 Vue d'ensemble

Le système de schéma de calcul utilise **une architecture hybride** avec du code dans `menu.js` ET des fichiers dédiés.

## 📍 Positionnement des tables

**IMPORTANT - Ordre des tables:**
1. **Schéma de calcul** → AU-DESSUS (ABOVE) de la table principale
2. **Table principale** (Modelised_table) → Au milieu
3. **Cross référence horizontale** → EN DESSOUS (BELOW) de la table principale

```
┌─────────────────────────────────────┐
│  Schéma de calcul (AU-DESSUS)       │
│  | (A) | (B) | (C) = (A) - (B) |    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Table principale (Modelised_table) │
│  | Compte | Libellé | Solde | ...  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Cross référence (EN DESSOUS)       │
│  | [AA10] | [AA20] | [AA30] |       │
└─────────────────────────────────────┘
```

---

## 📁 Structure des fichiers

### **Fichier principal : `public/menu.js`**
- **Rôle :** Contient TOUTE la logique métier
- **Méthodes clés :**
  - `ajouterSchemaCalculDirect()` - Point d'entrée principal
  - `extractNatureDeTestDirect()` - Détection de la nature de test (3 cas)
  - `determinerModeleSchemaCalculDirect()` - Sélection du modèle
  - `creerSchemaCalculDirect()` - Génération du tableau HTML

### **Fichier dédié : `public/papier-travail-schema-calcul.js`**
- **Rôle :** Module autonome standalone (IIFE)
- **Usage :** Peut être utilisé indépendamment de menu.js
- **Contenu :** Copie complète de la logique de menu.js

### **Fichier wrapper : `public/menu-papier-travail-integration.js`**
- **Rôle :** Pont entre menu.js et le module standalone
- **Usage :** Facilite l'intégration dans d'autres contextes

---

## 🔄 Flux d'exécution

```
┌─────────────────────────────────────────────────────┐
│  1. Utilisateur clique sur "Ajouter schéma calcul"  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  2. menu.js → ajouterSchemaCalculDirect()           │
│     - Trouve la div parente                         │
│     - Récupère toutes les tables                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  3. extractNatureDeTestDirect(table)                │
│     Détecte "Nature de test" dans 3 cas :           │
│     ✓ Cas 1: Horizontal (ligne)                     │
│     ✓ Cas 2: Vertical (colonne)                     │
│     ✓ Cas 3: Colonne adjacente (mal rendu)          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  4. determinerModeleSchemaCalculDirect(nature)      │
│     Retourne le modèle selon la nature :            │
│     - Validation                                    │
│     - Mouvement                                     │
│     - Rapprochement                                 │
│     - Cohérence                                     │
│     - Exhaustivité                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  5. creerSchemaCalculDirect(modele)                 │
│     Génère le tableau HTML avec :                   │
│     - Structure responsive                          │
│     - Colonnes du modèle                            │
│     - Styles intégrés                               │
│     - SANS caption (retiré)                         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  6. Insertion dans le DOM                           │
│     - Au-dessus de la table principale              │
│     - Sauvegarde dans localStorage                  │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Détection "Nature de test" - 3 cas

### **Cas 1 : Horizontal (ligne)**
```
| Nature de test | Rapprochement |
```
→ Valeur dans la cellule suivante (même ligne)

### **Cas 2 : Vertical (colonne)**
```
| Nature de test |
| Rapprochement  |
```
→ Valeur dans la ligne suivante (même colonne)

### **Cas 3 : Colonne adjacente (nouveau !)**
```
| Nature de test | Rapprochement |
| Autre info     | Autre valeur  |
```
→ Quand l'en-tête est mal rendu en frontend et devient une colonne
→ Valeur dans la cellule adjacente (même ligne, colonne suivante)

---

## 🏗️ Modèles de schéma disponibles

### **1. Validation**
```
| Solde N | Solde N-1 | Variation | Conclusion |
```

### **2. Mouvement**
```
| Solde N-1 | Augmentation | Diminution | Solde N | Conclusion |
```

### **3. Rapprochement**
```
| Source 1 | Source 2 | Écart | Conclusion |
```

### **4. Cohérence**
```
| Donnée 1 | Donnée 2 | Cohérence | Conclusion |
```

### **5. Exhaustivité**
```
| Population | Échantillon | Taux | Conclusion |
```

---

## 💾 Persistance

- **localStorage** : Sauvegarde automatique du schéma
- **Clé** : `papierTravail_schema_${divId}`
- **Restauration** : Au chargement de la page

---

## 🔧 Points d'intégration

### **Dans menu.js**
```javascript
// Méthode appelée depuis le menu contextuel
ajouterSchemaCalculDirect() {
  // Logique complète ici
}
```

### **Module standalone**
```javascript
// Peut être utilisé indépendamment
const schemaManager = window.PapierTravailSchemaCalcul;
schemaManager.ajouterSchemaCalcul(divElement);
```

---

## ✅ Améliorations récentes (24 avril 2026)

1. ✅ **Détection robuste** : 3 cas de figure pour "Nature de test"
2. ✅ **Suppression du caption** : Plus de libellé "Schéma de calcul: ..."
3. ✅ **Logs améliorés** : Debug détaillé de la détection
4. ✅ **Architecture documentée** : Ce fichier !

## ✅ Corrections (25 avril 2026)

1. ✅ **Positionnement Cross référence** : Correction du module standalone
   - **Avant** : Cross référence AU-DESSUS de la table principale (incorrect)
   - **Après** : Cross référence EN DESSOUS de la table principale (correct)
   - **Fichier corrigé** : `public/papier-travail-cross-ref-horizontale.js`
   - **Méthode** : `createCrossRefHorizontale()` - ligne 374
   - **Code** : Utilisation de `insertBefore(nextSibling)` ou `appendChild()`

2. ✅ **Alignement des colonnes** : Implémenté dans menu.js
   - Les tables Schéma de calcul et Cross référence ont le MÊME nombre de colonnes que la table principale
   - Les variables se terminent sur l'axe de la colonne "Ecart"
   - Colonnes vides ajoutées avant et après les variables pour l'alignement

---

## 📝 Maintenance

### **Pour ajouter un nouveau modèle :**
1. Modifier `determinerModeleSchemaCalculDirect()` dans `menu.js`
2. Ajouter le modèle avec ses colonnes
3. Copier la modification dans `papier-travail-schema-calcul.js`

### **Pour modifier la détection :**
1. Modifier `extractNatureDeTestDirect()` dans `menu.js`
2. Copier la modification dans `papier-travail-schema-calcul.js`

---

## 🎯 Conclusion

**Architecture actuelle = Code dans menu.js + Modules dédiés**

- ✅ Flexibilité maximale
- ✅ Réutilisabilité
- ✅ Maintenance centralisée dans menu.js
- ✅ Possibilité d'usage standalone
