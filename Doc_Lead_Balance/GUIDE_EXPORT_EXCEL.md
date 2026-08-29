# Guide d'Export Lead Balance vers Excel

## 📥 Fonctionnalité d'Export Multi-Onglets

Cette fonctionnalité permet d'exporter les résultats de Lead Balance vers un fichier Excel avec un onglet par section SYSCOHADA.

---

## 🎯 Utilisation

### Méthode 1: Menu Contextuel
1. Exécutez d'abord le calcul Lead Balance (Ctrl+L ou clic droit → "📊 Lead Balance")
2. Une fois les résultats affichés, cliquez droit sur la table
3. Sélectionnez **"📥 Export Lead Balance"** dans la section "Modélisation Pandas"
4. Le fichier Excel sera automatiquement téléchargé

### Méthode 2: Raccourci Clavier
- **Ctrl+Shift+L** : Export direct des résultats Lead Balance

---

## 📊 Structure du Fichier Excel Généré

Le fichier Excel contient un onglet par section SYSCOHADA détectée dans les résultats :

### Sections Bilan - Actif
- **Actif Immobilisé** : Comptes 20-27
- **Actif Circulant** : Comptes 31-48
- **Trésorerie Actif** : Comptes 50-58

### Sections Bilan - Passif
- **Capitaux Propres** : Comptes 10-15
- **Dettes Financières** : Comptes 16-19
- **Dettes Fournisseurs** : Compte 40
- **Dettes Fiscales et Sociales** : Comptes 42-45
- **Autres Dettes** : Comptes 46-48
- **Trésorerie Passif** : Compte 56

### Sections Compte de Résultat - Charges
- **Achats et Variations de Stocks** : Compte 60
- **Transports** : Compte 61
- **Services Extérieurs A** : Compte 62
- **Services Extérieurs B** : Compte 63
- **Impôts et Taxes** : Compte 64
- **Autres Charges** : Compte 65
- **Charges de Personnel** : Compte 66
- **Charges Financières** : Compte 67
- **Dotations aux Amortissements** : Compte 68
- **Dotations aux Provisions** : Compte 69

### Sections Compte de Résultat - Produits
- **Ventes** : Compte 70
- **Subventions d'Exploitation** : Compte 71
- **Production Immobilisée** : Compte 72
- **Variations de Stocks de Produits** : Compte 73
- **Produits Accessoires** : Compte 74
- **Autres Produits** : Compte 75
- **Produits Financiers** : Comptes 76-77
- **Transferts de Charges** : Compte 78
- **Reprises de Provisions** : Compte 79

### Sections HAO
- **Charges HAO** : Comptes 81, 83, 85, 87, 89
- **Produits HAO** : Comptes 82, 84, 86, 88

---

## 📋 Format des Colonnes

Chaque onglet contient les colonnes suivantes :

| Colonne | Description | Format |
|---------|-------------|--------|
| **Compte** | Numéro de compte | Texte |
| **Intitulé** | Libellé du compte | Texte |
| **Solde N** | Solde période actuelle | Nombre décimal |
| **Solde N-1** | Solde période précédente | Nombre décimal |
| **Écart** | Différence (N - N-1) | Nombre décimal |
| **Var %** | Variation en pourcentage | Pourcentage |

La dernière ligne de chaque onglet contient le **TOTAL** de la section.

---

## 📁 Nom du Fichier

Le fichier généré suit le format :
```
Lead_Balance_YYYYMMDD_HHMMSS.xlsx
```

Exemple : `Lead_Balance_20260322_143025.xlsx`

---

## ⚙️ Fonctionnement Technique

### 1. Détection des Résultats
- La fonction recherche le conteneur `.lead-syscohada-container` dans le DOM
- Si aucun résultat n'est trouvé, un message d'erreur s'affiche

### 2. Extraction des Données
- Parcourt toutes les sections `.lead-syscohada-section`
- Extrait les données de chaque tableau `.lead-table`
- Convertit les nombres formatés (avec espaces et virgules) en nombres Excel

### 3. Création du Fichier Excel
- Utilise la bibliothèque **SheetJS (XLSX)** version 0.18.5
- Crée un onglet par section avec largeurs de colonnes optimisées
- Préserve les totaux et les formules de variation

### 4. Téléchargement
- Le fichier est généré côté client (pas de backend)
- Téléchargement automatique via `XLSX.writeFile()`

---

## 🔧 Dépendances

### Bibliothèque XLSX
- **Version** : 0.18.5 (déjà installée dans package.json)
- **CDN Fallback** : https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js
- Chargement automatique si la bibliothèque n'est pas disponible

---

## ⚠️ Limitations

1. **Limite de 31 caractères** : Les noms d'onglets Excel sont limités à 31 caractères. Les noms trop longs sont tronqués avec "..."

2. **Sections vides** : Les sections sans données ne sont pas exportées

3. **Format Excel** : Le fichier est généré au format `.xlsx` (Excel 2007+)

4. **Résultats requis** : L'export nécessite que les résultats Lead Balance soient affichés à l'écran

---

## 🐛 Dépannage

### Erreur : "Aucun résultat Lead Balance trouvé"
**Solution** : Exécutez d'abord le calcul Lead Balance (Ctrl+L) avant d'exporter

### Erreur : "Impossible de charger la bibliothèque XLSX"
**Solution** : Vérifiez votre connexion internet (la bibliothèque est chargée depuis un CDN)

### Aucune donnée exportée
**Solution** : Vérifiez que les accordéons Lead Balance sont bien affichés et contiennent des données

### Le fichier ne se télécharge pas
**Solution** : 
- Vérifiez les paramètres de téléchargement de votre navigateur
- Autorisez les téléchargements automatiques pour le site

---

## 📝 Exemple d'Utilisation

```javascript
// 1. Calculer Lead Balance
Ctrl+L (ou clic droit → "📊 Lead Balance")

// 2. Attendre l'affichage des résultats (accordéons SYSCOHADA)

// 3. Exporter vers Excel
Ctrl+Shift+L (ou clic droit → "📥 Export Lead Balance")

// 4. Le fichier Lead_Balance_YYYYMMDD_HHMMSS.xlsx est téléchargé
```

---

## 🔄 Workflow Complet

```
┌─────────────────────────────────────┐
│  1. Sélectionner une table          │
│     (clic sur la table)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Exécuter Lead Balance           │
│     Ctrl+L ou Menu Contextuel       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Sélectionner fichier Excel      │
│     (2 onglets: N et N-1)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Résultats affichés              │
│     (Accordéons SYSCOHADA)          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Exporter vers Excel             │
│     Ctrl+Shift+L ou Menu            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. Fichier Excel téléchargé        │
│     (1 onglet par section)          │
└─────────────────────────────────────┘
```

---

## 📚 Fichiers Modifiés

- **public/menu.js** : Ajout de la fonction `exportLeadBalanceToExcel()` et fonctions auxiliaires
- **package.json** : Bibliothèque `xlsx` déjà présente (v0.18.5)

---

## ✅ Tests Recommandés

1. **Test avec fichier de démonstration** :
   - Utiliser `py_backend/TEST_BALANCE.xlsx`
   - Vérifier que toutes les sections sont exportées

2. **Test avec fichier réel** :
   - Utiliser `py_backend/P000 -BALANCE DEMO.xls`
   - Vérifier la cohérence des totaux

3. **Test des cas limites** :
   - Fichier avec peu de comptes
   - Fichier avec beaucoup de sections
   - Noms de sections très longs

---

## 🎓 Pour Aller Plus Loin

### Personnalisation du Format Excel
Vous pouvez modifier la fonction `extractTableDataFromElement()` pour :
- Ajouter des styles (couleurs, bordures)
- Modifier les largeurs de colonnes
- Ajouter des formules Excel

### Ajout de Graphiques
La bibliothèque XLSX supporte l'ajout de graphiques. Consultez la documentation SheetJS pour plus d'informations.

---

**Date de création** : 22 mars 2026  
**Version** : 1.0  
**Auteur** : Kiro AI Assistant
