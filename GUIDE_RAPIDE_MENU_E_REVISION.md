# Guide Rapide - Menu E-revision

## 🚀 Démarrage rapide

### Étape 1 : Ouvrir l'application
```bash
# Si l'application n'est pas démarrée
npm run dev
```

### Étape 2 : Accéder au menu
1. Ouvrez votre navigateur sur l'application E-audit
2. Localisez le bouton **[Démarrer]** (bouton rose avec icône play)
3. Cliquez sur **[Démarrer]**

### Étape 3 : Naviguer vers E-revision
1. Dans le menu qui s'ouvre, cliquez sur **E-revision**
2. Cliquez sur **Contrôle des comptes**
3. Vous verrez maintenant 10 cycles comptables

## 📋 Exemple d'utilisation rapide

### Test rapide : Trésorerie AA040

1. **[Démarrer]** → **E-revision** → **Contrôle des comptes** → **Trésorerie**
2. Cliquez sur **AA040 - test sur la validation du compte caisse**
3. Choisissez **Normal**

**Résultat dans la zone de saisie :**
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10
```

### Test rapide : Mode Demo

1. Répétez les étapes ci-dessus
2. Mais choisissez **Demo** au lieu de **Normal**

**Résultat dans la zone de saisie :**
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10
[Demo] = Activate
```

## 🎯 Les 10 cycles disponibles

| # | Cycle | Nombre de tests |
|---|-------|-----------------|
| 1 | Trésorerie | 5 |
| 2 | Ventes | 4 |
| 3 | Stocks | 5 |
| 4 | Immobilisations | 5 |
| 5 | Clients | 5 |
| 6 | Fournisseurs | 5 |
| 7 | Personnel | 5 |
| 8 | Capitaux propres | 3 |
| 9 | Charges d'exploitation | 5 |
| 10 | Impôts et taxes | 5 |

## 💡 Astuces

### Copier-coller rapide
- La commande est automatiquement insérée dans la zone de saisie
- Vous pouvez la modifier avant de l'envoyer
- Vous pouvez copier-coller la commande pour la réutiliser

### Navigation rapide
- Utilisez les flèches pour naviguer dans le menu
- Cliquez en dehors du menu pour le fermer
- Re-cliquez sur **[Démarrer]** pour fermer le menu

### Personnalisation
- Modifiez `[Nb de lignes] = 10` selon vos besoins
- Ajoutez d'autres paramètres si nécessaire

## 🔍 Vérification rapide

Pour vérifier que tout fonctionne :

```javascript
// Ouvrez la console du navigateur (F12)
// Tapez :
window.DemarrerMenu.isOpen()
// Devrait retourner true si le menu est ouvert

// Pour ouvrir le menu programmatiquement :
window.DemarrerMenu.show()

// Pour fermer le menu :
window.DemarrerMenu.hide()
```

## 📊 Structure des commandes

Toutes les commandes suivent ce format :

```
[Command] = /feuille couverture
[Processus] = [Nom du cycle]
[test] = [Référence du test]
[reference] = [Description du test]
[Nb de lignes] = 10
[Demo] = Activate  ← Uniquement en mode Demo
```

## 🎨 Personnalisation des commandes

Vous pouvez modifier les valeurs après génération :

```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 20  ← Modifié de 10 à 20
[Commentaire] = Test urgent  ← Ajout d'un paramètre personnalisé
```

## 🐛 Dépannage

### Le bouton [Démarrer] n'apparaît pas
1. Actualisez la page (F5)
2. Vérifiez la console pour les erreurs (F12)
3. Vérifiez que le fichier `public/demarrer-menu.js` est chargé

### Le menu ne s'ouvre pas
1. Vérifiez qu'il n'y a pas d'erreurs JavaScript dans la console
2. Essayez de fermer et rouvrir le menu
3. Actualisez la page

### Les commandes ne s'insèrent pas
1. Vérifiez que la zone de saisie est visible
2. Cliquez dans la zone de saisie avant d'utiliser le menu
3. Vérifiez la console pour les erreurs

## 📞 Support

Pour toute question ou problème :
1. Consultez `MENU_E_REVISION_CONTROLES_COMPTES.md` pour la documentation complète
2. Consultez `TEST_MENU_E_REVISION.md` pour les tests détaillés
3. Vérifiez les logs dans la console du navigateur

## ✅ Checklist de validation rapide

- [ ] Le bouton **[Démarrer]** est visible
- [ ] Le menu s'ouvre au clic
- [ ] **E-revision** est présent dans le menu
- [ ] Les 10 cycles comptables sont visibles
- [ ] Un test en mode Normal génère la bonne commande
- [ ] Un test en mode Demo ajoute `[Demo] = Activate`
- [ ] Le menu se ferme après sélection
- [ ] La commande peut être modifiée dans la zone de saisie

---

**Version** : 1.0  
**Date** : 2 mars 2026  
**Auteur** : Équipe E-audit
