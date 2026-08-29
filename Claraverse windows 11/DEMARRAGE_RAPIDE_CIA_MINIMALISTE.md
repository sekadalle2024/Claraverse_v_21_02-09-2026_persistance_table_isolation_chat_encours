# 🚀 Démarrage Rapide - CIA Minimaliste

## En 3 étapes

### 1️⃣ Vérifier la configuration

Ouvrir `index.html` et confirmer que **SEUL** ce script est actif :

```html
<!-- Script d'intégration CIA - UNIQUEMENT checkboxes + localStorage -->
<script src="/examen_cia_integration.js"></script>
```

Tous les autres scripts CIA doivent être commentés (désactivés).

### 2️⃣ Tester localement

Ouvrir dans le navigateur :
```
public/test-cia-minimaliste.html
```

**Actions à faire :**
1. Cocher une checkbox
2. Cliquer sur "🔄 Actualiser"
3. ✅ La checkbox doit rester cochée

### 3️⃣ Tester dans l'application

1. Lancer l'application React
2. Générer une table CIA avec Flowise
3. Cocher une réponse
4. Actualiser la page (F5)
5. ✅ La réponse doit être conservée

## ✅ Critères de succès

- [ ] Les checkboxes apparaissent dans la colonne "Reponse_user"
- [ ] Une seule checkbox peut être cochée par table
- [ ] L'état est sauvegardé automatiquement
- [ ] L'état est restauré après actualisation
- [ ] Aucun conflit avec d'autres scripts

## 🔍 Vérification Console

Ouvrir la console (F12) et chercher :

```
📝 Examen CIA Integration - Chargement
✅ Checkboxes créées
💾 État sauvegardé
📊 1 table(s) CIA configurée(s)
✅ Examen CIA Integration prêt
```

## 💾 Vérification localStorage

Dans DevTools > Application > Local Storage, chercher les clés :
```
cia_exam_[tableId]
```

## ❌ Problèmes courants

### Les checkboxes n'apparaissent pas

**Cause :** La table n'a pas de colonne "Reponse_user"

**Solution :** Vérifier que la table Flowise contient bien cette colonne

### L'état n'est pas sauvegardé

**Cause :** Conflit avec un autre script

**Solution :** Vérifier que tous les autres scripts CIA sont désactivés dans index.html

### Plusieurs checkboxes cochées

**Cause :** Le script n'est pas chargé correctement

**Solution :** Vérifier la console pour les erreurs de chargement

## 📊 Commandes de diagnostic

Dans la console du navigateur :

```javascript
// Voir toutes les tables CIA
document.querySelectorAll('table[data-cia-table="true"]')

// Voir toutes les checkboxes
document.querySelectorAll('.cia-checkbox')

// Voir le localStorage CIA
Object.keys(localStorage).filter(k => k.includes('cia'))

// Vider le cache CIA
Object.keys(localStorage).filter(k => k.includes('cia')).forEach(k => localStorage.removeItem(k))
```

## 🎯 Prochaines étapes

Si tout fonctionne :

1. ✅ Valider avec plusieurs tables
2. ✅ Tester sur différents navigateurs
3. ✅ Documenter pour l'équipe
4. 🗑️ Supprimer les anciens scripts CIA
5. 🚀 Déployer en production

## 📝 Notes importantes

- **Un seul script** : `examen_cia_integration.js`
- **Pas de dépendances** : Fonctionne de manière autonome
- **Léger** : ~200 lignes de code
- **Simple** : Facile à maintenir et débugger

## 🆘 Support

En cas de problème :

1. Vérifier la console pour les erreurs
2. Vérifier que le script est bien chargé
3. Vérifier qu'aucun autre script CIA n'est actif
4. Tester avec `test-cia-minimaliste.html`
5. Consulter `APPROCHE_MINIMALISTE_CIA.md`
