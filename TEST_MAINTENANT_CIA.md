# 🧪 TEST MAINTENANT - CIA Minimaliste

## ⏱️ Temps estimé : 5 minutes

---

## 🎯 Test 1 : Page standalone (2 minutes)

### Étape 1 : Ouvrir la page de test

```
Fichier à ouvrir dans le navigateur:
public/test-cia-minimaliste.html
```

### Étape 2 : Vérifier le statut

Chercher en haut de la page :
```
📊 Statut: ✅ 2 table(s) CIA détectée(s)
```

✅ **Si vous voyez ce message, c'est bon !**

### Étape 3 : Tester les checkboxes

1. Cocher la première checkbox (Option A)
2. Observer : les autres se décochent automatiquement
3. Cocher une autre checkbox (Option B)
4. Observer : Option A se décoche

✅ **Si une seule checkbox reste cochée, c'est bon !**

### Étape 4 : Tester la persistance

1. Cocher Option A dans la Table #1
2. Cocher Option B dans la Table #2
3. Cliquer sur le bouton "🔄 Actualiser"
4. Observer : les checkboxes restent cochées

✅ **Si les checkboxes sont toujours cochées, c'est bon !**

### Étape 5 : Vérifier la console

1. Cliquer sur "📋 Afficher Console"
2. Chercher ces messages :
   ```
   📝 Examen CIA Integration - Chargement
   ✅ Checkboxes créées
   💾 État sauvegardé
   ```

✅ **Si vous voyez ces messages, c'est bon !**

### Étape 6 : Vérifier localStorage

1. Cliquer sur "💾 Voir localStorage"
2. Observer les données sauvegardées

✅ **Si vous voyez des données JSON, c'est bon !**

---

## 🎯 Test 2 : Application React (3 minutes)

### Prérequis

L'application React doit être lancée.

### Étape 1 : Ouvrir la console

1. Appuyer sur F12
2. Aller dans l'onglet "Console"

### Étape 2 : Générer une table CIA

1. Utiliser Flowise pour générer une table
2. La table doit avoir une colonne "Reponse_user"

### Étape 3 : Vérifier les logs

Dans la console, chercher :
```
📝 Examen CIA Integration - Chargement
✅ Checkboxes créées
📊 1 table(s) CIA configurée(s)
✅ Examen CIA Integration prêt
```

✅ **Si vous voyez ces messages, c'est bon !**

### Étape 4 : Tester les checkboxes

1. Cocher une checkbox dans la table
2. Observer : les autres se décochent
3. Dans la console, chercher :
   ```
   💾 État sauvegardé
   ```

✅ **Si vous voyez ce message, c'est bon !**

### Étape 5 : Tester la persistance

1. Actualiser la page (F5)
2. Attendre que la table se recharge
3. Observer : la checkbox est toujours cochée
4. Dans la console, chercher :
   ```
   ✅ État restauré
   ```

✅ **Si la checkbox est cochée et vous voyez le message, c'est bon !**

### Étape 6 : Vérifier localStorage

1. Dans DevTools, aller dans "Application"
2. Cliquer sur "Local Storage"
3. Chercher les clés commençant par "cia_exam_"

✅ **Si vous voyez des clés CIA, c'est bon !**

---

## ✅ Résultat des tests

### Test 1 : Page standalone

- [ ] Statut affiché correctement
- [ ] Checkboxes créées
- [ ] Sélection unique fonctionne
- [ ] Persistance fonctionne
- [ ] Console affiche les bons logs
- [ ] localStorage contient les données

### Test 2 : Application React

- [ ] Logs de chargement corrects
- [ ] Checkboxes créées dans la table Flowise
- [ ] Sélection unique fonctionne
- [ ] Sauvegarde automatique
- [ ] Restauration après F5
- [ ] localStorage contient les données

---

## 🎉 Tous les tests passent ?

### ✅ OUI - Tout fonctionne

**Félicitations !** Le système CIA minimaliste est opérationnel.

**Prochaines étapes :**
1. Tester avec plusieurs tables
2. Tester sur différents navigateurs
3. Valider avec l'équipe
4. Déployer en production

### ❌ NON - Problèmes détectés

**Pas de panique !** Consultez le guide de dépannage.

**Problèmes courants :**

#### Problème : Pas de checkboxes

**Cause possible :**
- La table n'a pas de colonne "Reponse_user"
- Le script n'est pas chargé

**Solution :**
1. Vérifier que la table a bien une colonne "Reponse_user"
2. Vérifier dans index.html que le script est activé :
   ```html
   <script src="/examen_cia_integration.js"></script>
   ```

#### Problème : Plusieurs checkboxes cochées

**Cause possible :**
- Un autre script interfère

**Solution :**
1. Vérifier dans index.html que les autres scripts CIA sont désactivés
2. Vérifier la console pour les erreurs

#### Problème : État non sauvegardé

**Cause possible :**
- localStorage plein ou désactivé

**Solution :**
1. Vérifier dans DevTools > Application > Local Storage
2. Vider le cache si nécessaire
3. Vérifier que localStorage est activé dans le navigateur

#### Problème : Erreurs dans la console

**Cause possible :**
- Conflit avec un autre script
- Erreur de chargement

**Solution :**
1. Noter le message d'erreur exact
2. Vérifier que tous les autres scripts CIA sont désactivés
3. Consulter `DEMARRAGE_RAPIDE_CIA_MINIMALISTE.md`

---

## 📊 Commandes de diagnostic

### Dans la console du navigateur

```javascript
// Voir toutes les tables CIA
document.querySelectorAll('table[data-cia-table="true"]')

// Voir toutes les checkboxes
document.querySelectorAll('.cia-checkbox')

// Voir le localStorage CIA
Object.keys(localStorage).filter(k => k.includes('cia'))

// Voir une entrée spécifique
localStorage.getItem('cia_exam_...')

// Vider le cache CIA
Object.keys(localStorage).filter(k => k.includes('cia')).forEach(k => localStorage.removeItem(k))
```

---

## 📚 Documentation de référence

Si vous avez besoin d'aide :

1. **Guide rapide** → `DEMARRAGE_RAPIDE_CIA_MINIMALISTE.md`
2. **Schémas visuels** → `GUIDE_VISUEL_CIA_MINIMALISTE.md`
3. **Détails techniques** → `APPROCHE_MINIMALISTE_CIA.md`
4. **Navigation** → `INDEX_CIA_MINIMALISTE.md`

---

## 🆘 Besoin d'aide ?

1. Consulter `DEMARRAGE_RAPIDE_CIA_MINIMALISTE.md` (section "Problèmes courants")
2. Tester avec `public/test-cia-minimaliste.html`
3. Vérifier la console pour les erreurs
4. Contacter l'équipe avec les logs

---

## 📝 Notes de test

Utilisez cet espace pour noter vos observations :

```
Date du test : _____________

Navigateur : _____________

Test 1 (standalone) :
- Statut : ☐ OK  ☐ KO
- Checkboxes : ☐ OK  ☐ KO
- Persistance : ☐ OK  ☐ KO
- Notes : _________________________________

Test 2 (React) :
- Chargement : ☐ OK  ☐ KO
- Checkboxes : ☐ OK  ☐ KO
- Persistance : ☐ OK  ☐ KO
- Notes : _________________________________

Problèmes rencontrés :
_________________________________________
_________________________________________

Solutions appliquées :
_________________________________________
_________________________________________
```

---

**🚀 Commencez les tests maintenant !**

**Temps total estimé : 5 minutes**
