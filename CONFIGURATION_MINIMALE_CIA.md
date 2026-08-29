# ⚙️ Configuration Minimale CIA

## 🎯 Objectif

Désactiver TOUS les scripts qui peuvent interférer avec le système CIA pour isoler complètement le problème.

## ✅ Scripts ACTIFS (essentiels uniquement)

### React/TypeScript
```html
<script type="module" src="/src/main.tsx"></script>
```

### Mammoth (documents Word)
```html
<script src="/mammoth-loader-fix.js"></script>
```

### CIA (notre système)
```html
<script src="/cleanup-old-cia.js"></script>  <!-- Temporaire -->
<script src="/examen_cia_integration.js"></script>  <!-- Principal -->
```

## ❌ Scripts DÉSACTIVÉS

### Flowise et modélisation
```html
<!-- <script src="/Flowise.js"></script> -->
<!-- <script src="/wrap-tables-auto.js"></script> -->
<!-- <script src="/modelisation-ultra-compact.js"></script> -->
```

### Diagnostic et espacement
```html
<!-- <script src="/diagnostic-espacement.js"></script> -->
<!-- <script src="/diagnostic-espacement-complet.js"></script> -->
```

### Anciens systèmes CIA
```html
<!-- <script src="/menu_alpha_localstorage_isolated.js"></script> -->
<!-- <script src="/menu_alpha_localstorage.js"></script> -->
<!-- <script src="/diagnostic-cia-realtime.js"></script> -->
<!-- <script src="/cia-protection-patch.js"></script> -->
```

### Persistance et restauration
```html
<!-- <script src="/restore-lock-manager.js"></script> -->
<!-- <script src="/single-restore-on-load.js"></script> -->
<!-- <script src="/menu-persistence-bridge.js"></script> -->
<!-- <script src="/localstorage-cleanup.js"></script> -->
<!-- <script src="/auto-restore-chat-change.js"></script> -->
```

### Menu et conso
```html
<!-- <script src="/menu.js"></script> -->
<!-- <script src="/conso.js"></script> -->
```

## 🧪 TEST MAINTENANT

### 1. Actualiser l'application (F5)

### 2. Vérifier la console

Vous devriez voir UNIQUEMENT :
```
🧹 Nettoyage des anciennes données CIA...
✅ X ancienne(s) entrée(s) supprimée(s)
📝 Examen CIA Integration - Chargement
✅ Examen CIA Integration prêt
```

**PAS de :**
- Messages de Flowise
- Messages de modélisation
- Messages d'autres systèmes CIA

### 3. Créer une table CIA manuellement

Dans la console :
```javascript
const html = `
<table>
  <tr><th>Question</th><th>Option</th><th>Reponse_user</th></tr>
  <tr><td>Q1</td><td>A</td><td></td></tr>
  <tr><td>Q1</td><td>B</td><td></td></tr>
  <tr><td>Q1</td><td>C</td><td></td></tr>
</table>
`;
document.body.insertAdjacentHTML('beforeend', html);
```

### 4. Attendre 2 secondes

Les checkboxes doivent apparaître automatiquement.

### 5. Cocher une checkbox

### 6. Actualiser (F5)

### 7. ✅ La checkbox doit rester cochée

## 📊 Diagnostic

### Si ça marche ✅

**Le problème venait d'un conflit avec un autre script !**

Scripts suspects :
1. `Flowise.js` - Recrée les tables
2. `wrap-tables-auto.js` - Modifie les tables
3. `modelisation-ultra-compact.js` - Gère aussi les tables
4. Anciens scripts CIA - Créent aussi des checkboxes

**Solution :** Réactiver les scripts UN PAR UN pour identifier le coupable.

### Si ça ne marche toujours pas ❌

**Le problème est dans notre script `examen_cia_integration.js`**

Vérifier :
1. L'ID de la table est-il stable ?
2. localStorage se remplit-il ?
3. La restauration est-elle appelée ?

## 🔄 Réactivation progressive

Une fois que ça marche, réactiver les scripts UN PAR UN :

### Étape 1 : Réactiver Mammoth (déjà actif)
```html
<script src="/mammoth-loader-fix.js"></script>
```
→ Tester

### Étape 2 : Réactiver wrap-tables-auto
```html
<script src="/wrap-tables-auto.js"></script>
```
→ Tester

### Étape 3 : Réactiver Flowise
```html
<script src="/Flowise.js"></script>
```
→ Tester ← **Probablement le coupable**

### Étape 4 : Réactiver modélisation
```html
<script src="/modelisation-ultra-compact.js"></script>
```
→ Tester

## 📝 Notes importantes

### Flowise.js

Si Flowise est le coupable, il faut :
1. Modifier Flowise pour qu'il n'interfère pas avec les checkboxes CIA
2. OU modifier notre script pour qu'il résiste aux modifications de Flowise
3. OU charger notre script APRÈS Flowise

### wrap-tables-auto.js

Si wrap-tables-auto est le coupable, il faut :
1. Vérifier qu'il ne modifie pas les tables CIA
2. Ajouter une exception pour les tables avec `data-cia-table="true"`

### modelisation-ultra-compact.js

Si la modélisation est le coupable, il faut :
1. Vérifier qu'elle ne crée pas de checkboxes dans les tables CIA
2. Coordonner avec notre script

## 🎯 Objectif final

Une fois le coupable identifié :
1. Corriger le conflit
2. Réactiver tous les scripts
3. Valider que tout fonctionne ensemble

## 📞 Support

Si ça ne marche toujours pas avec TOUS les scripts désactivés :
1. Partager les logs console complets
2. Partager le contenu de localStorage
3. Partager le HTML de la table générée

---

**🚀 Actualisez l'application maintenant et testez !**

**Date :** 25 novembre 2025  
**Version :** 1.3 - Configuration minimale  
**Statut :** ✅ Prêt pour test isolé
