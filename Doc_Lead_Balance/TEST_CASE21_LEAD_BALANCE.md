# Test Case 21 : Lead Balance

## 🧪 Guide de test complet

### Prérequis

1. ✅ Backend Python démarré sur `http://127.0.0.1:5000`
2. ✅ Application Claraverse lancée
3. ✅ Fichier Excel de balance disponible (.xlsx ou .xls)

### Test 1 : Génération de la table déclencheuse

#### Étapes
1. Ouvrir l'application Claraverse
2. Dans le chat, taper la commande :
   ```
   Lead_balance
   ```
   ou
   ```
   /Couverture Lead_balance
   ```
3. Envoyer le message

#### Résultat attendu
✅ Une table unicolonne apparaît avec :
- Entête : "Lead_balance"
- Contenu : "Cliquez sur cette table avec le bouton droit et sélectionnez 'Lead Balance' dans le menu contextuel pour charger votre fichier Excel."

#### Vérifications
- [ ] La table est bien affichée dans le chat
- [ ] La table a les classes CSS correctes (inspecteur : `min-w-full border border-gray-200`)
- [ ] La table est contenue dans une div avec classe `prose prose-base`

### Test 2 : Activation du menu contextuel

#### Étapes
1. Faire un clic droit sur la table générée
2. Observer le menu contextuel qui s'ouvre

#### Résultat attendu
✅ Le menu contextuel s'ouvre avec toutes les sections, dont :
- Section "Modélisation Pandas" 🐼
- Item "📊 Lead Balance" avec raccourci "Ctrl+L"

#### Vérifications
- [ ] Le menu contextuel s'ouvre correctement
- [ ] La section "Modélisation Pandas" est visible
- [ ] L'item "📊 Lead Balance" est présent
- [ ] Le raccourci "Ctrl+L" est affiché

### Test 3 : Upload du fichier Excel

#### Étapes
1. Cliquer sur "📊 Lead Balance" dans le menu contextuel
2. Observer l'ouverture du dialogue de sélection de fichier
3. Sélectionner un fichier Excel (.xlsx ou .xls)
4. Valider la sélection

#### Résultat attendu
✅ Dialogue de sélection de fichier s'ouvre avec :
- Filtre sur les fichiers .xlsx et .xls
- Possibilité de naviguer dans les dossiers
- Bouton "Ouvrir" pour valider

#### Vérifications
- [ ] Le dialogue s'ouvre correctement
- [ ] Seuls les fichiers Excel sont sélectionnables
- [ ] La sélection fonctionne

### Test 4 : Traitement et affichage des résultats

#### Étapes
1. Après sélection du fichier, observer :
   - Notification "📊 Traitement de [nom_fichier]..."
   - Envoi vers le backend Python
   - Réception des résultats
   - Remplacement de la table

#### Résultat attendu
✅ Séquence complète :
1. Notification de traitement
2. Appel API vers `http://127.0.0.1:5000/lead-balance/process-excel`
3. Réception des résultats (accordéons HTML)
4. Remplacement du contenu de la div avec les accordéons
5. Notification de succès : "✅ Lead Balance calculée avec succès!"

#### Vérifications
- [ ] Notification de traitement affichée
- [ ] Pas d'erreur dans la console (F12)
- [ ] Résultats affichés sous forme d'accordéons
- [ ] Notification de succès affichée
- [ ] Les accordéons contiennent les données attendues

### Test 5 : Vérification des données

#### Étapes
1. Observer les accordéons générés
2. Vérifier la structure :
   - Titre "📊 Résultats Lead Balance"
   - Accordéons pour chaque catégorie :
     - Comptes communs (N et N-1)
     - Comptes uniquement en N
     - Comptes uniquement en N-1

#### Résultat attendu
✅ Structure complète avec :
- Titre principal
- 3 accordéons (ou plus selon les données)
- Chaque accordéon contient une table avec les colonnes appropriées
- Les montants sont correctement formatés

#### Vérifications
- [ ] Titre "📊 Résultats Lead Balance" présent
- [ ] Accordéons présents et fonctionnels (clic pour ouvrir/fermer)
- [ ] Tables dans les accordéons bien formatées
- [ ] Données cohérentes avec le fichier Excel source

### Test 6 : Raccourci clavier Ctrl+L

#### Étapes
1. Cliquer sur la table Lead_balance pour la sélectionner
2. Appuyer sur Ctrl+L

#### Résultat attendu
✅ Le dialogue de sélection de fichier s'ouvre directement

#### Vérifications
- [ ] Le raccourci Ctrl+L fonctionne
- [ ] Le dialogue s'ouvre sans passer par le menu contextuel

### Test 7 : Gestion des erreurs

#### Test 7.1 : Fichier invalide
1. Sélectionner un fichier non-Excel (ex: .txt, .pdf)
2. Observer le message d'erreur

**Résultat attendu** : ⚠️ "Format de fichier non supporté. Veuillez sélectionner un fichier Excel (.xlsx ou .xls)"

#### Test 7.2 : Backend non disponible
1. Arrêter le backend Python
2. Essayer de charger un fichier Excel
3. Observer le message d'erreur

**Résultat attendu** : ❌ "Erreur Lead Balance: [message d'erreur réseau]"

#### Test 7.3 : Annulation de sélection
1. Ouvrir le dialogue de sélection
2. Cliquer sur "Annuler"
3. Observer le comportement

**Résultat attendu** : Aucune action, retour à l'état normal

#### Vérifications
- [ ] Message d'erreur pour fichier invalide
- [ ] Message d'erreur pour backend non disponible
- [ ] Annulation fonctionne correctement

### Test 8 : Console logs

#### Étapes
1. Ouvrir la console (F12)
2. Exécuter le test complet
3. Observer les logs

#### Logs attendus
```
🔀 Router → Case 21 : lead_balance (traitement local avec upload fichier)
📊 [Lead Balance] Démarrage du processus
📊 [Lead Balance] Fichier sélectionné: balance.xlsx 123456 bytes
📊 [Lead Balance] Fichier encodé en base64: 164608 caractères
📊 [Lead Balance] Résultat reçu: {success: true, ...}
```

#### Vérifications
- [ ] Logs du router présents
- [ ] Logs de traitement présents
- [ ] Pas d'erreurs dans la console
- [ ] Logs cohérents avec les actions

## 📊 Checklist complète

### Fonctionnalités de base
- [ ] Génération de la table déclencheuse
- [ ] Ouverture du menu contextuel
- [ ] Sélection de fichier Excel
- [ ] Upload et traitement
- [ ] Affichage des résultats

### Fonctionnalités avancées
- [ ] Raccourci clavier Ctrl+L
- [ ] Gestion des erreurs
- [ ] Notifications utilisateur
- [ ] Logs console

### Qualité et performance
- [ ] Pas d'erreurs JavaScript
- [ ] Temps de traitement acceptable (< 10s)
- [ ] Interface réactive
- [ ] Résultats corrects

## 🐛 Problèmes connus et solutions

### Problème 1 : Table non détectée par le menu contextuel
**Symptôme** : Clic droit ne fait rien
**Solution** : Vérifier que la table a les bonnes classes CSS

### Problème 2 : Backend non accessible
**Symptôme** : Erreur réseau lors de l'upload
**Solution** : Vérifier que le backend Python tourne sur le bon port

### Problème 3 : Fichier non lu
**Symptôme** : Erreur lors de la lecture du fichier
**Solution** : Vérifier les permissions du fichier et le format

## 📝 Notes de test

### Environnement de test
- OS : Windows 11
- Navigateur : Chrome/Edge
- Backend : Python 3.x sur port 5000

### Fichiers de test recommandés
1. Balance simple (< 100 lignes)
2. Balance moyenne (100-1000 lignes)
3. Balance complexe (> 1000 lignes)

### Métriques de performance
- Temps de génération de la table : < 100ms
- Temps d'upload : < 2s
- Temps de traitement backend : < 5s
- Temps d'affichage des résultats : < 500ms

## ✅ Validation finale

Une fois tous les tests passés :
- [ ] Fonctionnalité complète et opérationnelle
- [ ] Aucune régression sur les autres fonctionnalités
- [ ] Documentation à jour
- [ ] Code propre et commenté

## 🎉 Conclusion

Si tous les tests sont ✅, l'implémentation du Case 21 Lead Balance est validée et prête pour la production!
