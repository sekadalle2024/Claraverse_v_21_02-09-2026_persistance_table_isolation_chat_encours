# 📊 Guide Utilisateur : Lead Balance

## 🎯 Qu'est-ce que la Lead Balance ?

La fonctionnalité Lead Balance permet d'analyser et de comparer les balances comptables entre deux périodes (N et N-1) pour identifier :
- ✅ Les comptes communs aux deux périodes
- 🆕 Les comptes présents uniquement en période N
- 📉 Les comptes présents uniquement en période N-1

## 🚀 Comment utiliser la Lead Balance ?

### Méthode 1 : Via commande chat (Recommandée)

#### Étape 1 : Taper la commande
Dans le chat Claraverse, tapez simplement :
```
Lead_balance
```

ou avec une commande complète :
```
/Couverture Lead_balance
```

#### Étape 2 : Cliquer sur la table
Une table apparaît avec l'instruction. Faites un **clic droit** sur cette table.

#### Étape 3 : Sélectionner "Lead Balance"
Dans le menu contextuel qui s'ouvre, cliquez sur **"📊 Lead Balance"** (dans la section "Modélisation Pandas").

#### Étape 4 : Charger votre fichier Excel
1. Un dialogue de sélection de fichier s'ouvre
2. Naviguez jusqu'à votre fichier de balance Excel (.xlsx ou .xls)
3. Sélectionnez le fichier et cliquez sur "Ouvrir"

#### Étape 5 : Consulter les résultats
Les résultats s'affichent automatiquement sous forme d'accordéons :
- 📊 **Comptes communs** : Comptes présents dans N et N-1
- 🆕 **Comptes uniquement en N** : Nouveaux comptes
- 📉 **Comptes uniquement en N-1** : Comptes disparus

### Méthode 2 : Via raccourci clavier

Si une table Lead_balance est déjà affichée :
1. Cliquez sur la table pour la sélectionner
2. Appuyez sur **Ctrl+L**
3. Le dialogue de sélection de fichier s'ouvre directement

### Méthode 3 : Via menu contextuel sur n'importe quelle table

1. Faites un clic droit sur n'importe quelle table dans le chat
2. Sélectionnez **"📊 Lead Balance"** dans le menu contextuel
3. Chargez votre fichier Excel
4. Les résultats remplacent la table sélectionnée

## 📋 Format du fichier Excel

### Structure attendue

Votre fichier Excel doit contenir au minimum les colonnes suivantes :
- **Numéro de compte** (ou Code compte)
- **Libellé** (ou Intitulé)
- **Solde Débit** (période N et N-1)
- **Solde Crédit** (période N et N-1)

### Exemple de structure

| Compte | Libellé | Débit N | Crédit N | Débit N-1 | Crédit N-1 |
|--------|---------|---------|----------|-----------|------------|
| 101000 | Capital | 0 | 1000000 | 0 | 800000 |
| 411000 | Clients | 250000 | 0 | 200000 | 0 |
| 512000 | Banque | 150000 | 0 | 120000 | 0 |

### Formats acceptés
- ✅ .xlsx (Excel 2007 et supérieur)
- ✅ .xls (Excel 97-2003)
- ❌ .csv (non supporté directement)
- ❌ .pdf (non supporté)

## 📊 Comprendre les résultats

### Accordéon 1 : Comptes communs (N et N-1)

Affiche tous les comptes présents dans les deux périodes avec :
- Numéro de compte
- Libellé
- Solde N (Débit - Crédit)
- Solde N-1 (Débit - Crédit)
- **Écart** (Solde N - Solde N-1)

**Interprétation** :
- Écart positif (vert) : Augmentation du solde
- Écart négatif (rouge) : Diminution du solde
- Écart = 0 : Solde stable

### Accordéon 2 : Comptes uniquement en N

Affiche les nouveaux comptes créés en période N :
- Numéro de compte
- Libellé
- Solde N

**Interprétation** :
- Ces comptes n'existaient pas en N-1
- Peut indiquer de nouvelles activités ou opérations

### Accordéon 3 : Comptes uniquement en N-1

Affiche les comptes qui ont disparu en période N :
- Numéro de compte
- Libellé
- Solde N-1

**Interprétation** :
- Ces comptes ne sont plus utilisés en N
- Peut indiquer des activités arrêtées ou des comptes soldés

## 💡 Cas d'usage

### Audit comptable
- Identifier les variations significatives entre deux exercices
- Détecter les comptes nouveaux ou supprimés
- Préparer les tests de détail sur les écarts importants

### Révision des comptes
- Analyser l'évolution des soldes
- Identifier les comptes à risque
- Préparer les notes explicatives

### Contrôle de gestion
- Suivre l'évolution des postes clés
- Identifier les tendances
- Préparer les reportings

## ⚠️ Messages d'erreur courants

### "Format de fichier non supporté"
**Cause** : Le fichier sélectionné n'est pas un fichier Excel
**Solution** : Vérifiez que votre fichier a l'extension .xlsx ou .xls

### "Erreur de lecture du fichier"
**Cause** : Le fichier est corrompu ou protégé
**Solution** : Vérifiez que le fichier s'ouvre correctement dans Excel

### "Erreur HTTP 500"
**Cause** : Le backend Python a rencontré une erreur
**Solution** : Vérifiez la structure de votre fichier Excel

### "Erreur réseau"
**Cause** : Le backend Python n'est pas accessible
**Solution** : Vérifiez que le serveur Python est démarré

## 🔧 Dépannage

### Le menu contextuel ne s'ouvre pas
1. Vérifiez que vous faites un clic droit sur la table
2. Essayez de rafraîchir la page (F5)
3. Vérifiez la console (F12) pour les erreurs

### Le fichier ne se charge pas
1. Vérifiez le format du fichier (.xlsx ou .xls)
2. Vérifiez que le fichier n'est pas ouvert dans Excel
3. Essayez avec un fichier plus petit

### Les résultats sont incorrects
1. Vérifiez la structure de votre fichier Excel
2. Vérifiez que les colonnes sont correctement nommées
3. Vérifiez que les montants sont au bon format (nombres)

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation technique : `IMPLEMENTATION_CASE21_LEAD_BALANCE.md`
2. Consultez les tests : `TEST_CASE21_LEAD_BALANCE.md`
3. Vérifiez les logs dans la console (F12)

## 🎓 Conseils d'utilisation

### Bonnes pratiques
- ✅ Utilisez des fichiers Excel bien structurés
- ✅ Vérifiez vos données avant l'import
- ✅ Sauvegardez vos résultats importants
- ✅ Utilisez le raccourci Ctrl+L pour gagner du temps

### À éviter
- ❌ Fichiers Excel trop volumineux (> 10 Mo)
- ❌ Fichiers avec des formules complexes
- ❌ Fichiers avec plusieurs onglets non structurés
- ❌ Fichiers protégés par mot de passe

## 🚀 Astuces avancées

### Astuce 1 : Réutilisation rapide
Une fois la table Lead_balance affichée, vous pouvez :
- Cliquer dessus et appuyer sur Ctrl+L pour charger un nouveau fichier
- Les résultats précédents seront remplacés

### Astuce 2 : Export des résultats
Les résultats affichés peuvent être :
- Copiés (Ctrl+C) pour les coller dans Excel
- Exportés via le menu contextuel (fonctionnalité à venir)

### Astuce 3 : Comparaison multiple
Pour comparer plusieurs balances :
1. Tapez "Lead_balance" plusieurs fois
2. Chargez un fichier différent pour chaque table
3. Comparez visuellement les résultats

## 📈 Évolutions futures

Fonctionnalités prévues :
- 📊 Export des résultats en Excel
- 📄 Export des résultats en PDF
- 🔍 Filtres et recherche dans les résultats
- 📈 Graphiques de visualisation des écarts
- 💾 Sauvegarde des analyses

## ✅ Checklist utilisateur

Avant d'utiliser la Lead Balance :
- [ ] Backend Python démarré
- [ ] Fichier Excel préparé et vérifié
- [ ] Structure du fichier conforme
- [ ] Données à jour

Après utilisation :
- [ ] Résultats vérifiés
- [ ] Écarts analysés
- [ ] Actions identifiées
- [ ] Documentation mise à jour

## 🎉 Conclusion

La fonctionnalité Lead Balance est un outil puissant pour l'analyse comparative des balances comptables. Utilisez-la régulièrement pour un suivi efficace de vos comptes!

---

**Version** : 1.0  
**Date** : 2024  
**Auteur** : Équipe Claraverse
