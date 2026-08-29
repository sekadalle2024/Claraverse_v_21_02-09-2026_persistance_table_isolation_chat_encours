# 🔍 Guide Diagnostic Collecte Tables Claraverse

## 🎯 Objectif

Identifier pourquoi les tables ne sont pas collectées correctement dans Claraverse avant l'envoi à n8n.

## 📋 Problème Identifié

**Symptôme** :
- HTTP REQUEST → n8n ✅ Données reçues dans Google Sheet
- Claraverse → n8n ❌ Google Sheet vide

**Hypothèse** :
Les données ne sont pas collectées correctement dans Claraverse par la fonction `collectCriteriaTables()`.

---

## 🧪 Utilisation de l'Outil de Diagnostic

### Étape 1 : Ouvrir l'Outil

```bash
# Dans Claraverse, ouvrir la console (F12) et taper :
window.open('/diagnostic-collecte-tables-claraverse.html', '_blank')

# Ou ouvrir directement :
http://localhost:5173/diagnostic-collecte-tables-claraverse.html
```

### Étape 2 : Créer des Tables de Test

Dans Claraverse, créer ces tables :

```markdown
| Rubrique    | Description |
|-------------|-------------|
| Etape       | Programme   |
| Référence   | TEST-001    |

| Flowise |
|---------|
| CIA     |
```

### Étape 3 : Lancer le Diagnostic

1. Cliquer sur **"Analyser le DOM"**
2. Observer les logs
3. Vérifier les statistiques

---

## 📊 Interprétation des Résultats

### Cas 1 : Aucune Div "Prose" Trouvée

```
❌ PROBLÈME CRITIQUE: Aucune div "prose" trouvée
```

**Cause** : Vous n'êtes pas dans Claraverse ou aucun message n'est affiché

**Solution** :
- Vérifier que vous êtes bien dans Claraverse
- Créer des messages dans le chat
- Rafraîchir la page

### Cas 2 : Aucune Table Trouvée

```
❌ PROBLÈME: Aucune table trouvée dans les divs
```

**Cause** : Les tables ne sont pas créées ou mal formatées

**Solution** :
- Créer des tables avec le format Markdown
- Vérifier que les tables ont la classe CSS correcte
- Vérifier le sélecteur : `table.min-w-full.border.border-gray-200...`

### Cas 3 : Aucune Table avec En-têtes Requis

```
❌ PROBLÈME: Aucune table avec en-têtes "Rubrique" et "Description"
```

**Cause** : Les tables n'ont pas les en-têtes requis

**Solution** :
- Vos tables doivent avoir les colonnes "Rubrique" ET "Description"
- Vérifier la casse (insensible normalement)
- Exemple :
  ```markdown
  | Rubrique | Description |
  |----------|-------------|
  | ...      | ...         |
  ```

### Cas 4 : Aucune Table avec Mots-clés

```
❌ PROBLÈME: Aucune table avec mots-clés trouvée
```

**Cause** : Les tables ne contiennent pas de mots-clés reconnus

**Solution** :
- Ajouter un mot-clé dans une cellule : "CIA", "Flowise", "Programme", etc.
- Exemple :
  ```markdown
  | Flowise |
  |---------|
  | CIA     |
  ```

### Cas 5 : Tables Collectées Mais Pas Envoyées

```
✅ X div(s) devraient être collectées
💡 Si les données ne sont pas envoyées à n8n, le problème est ailleurs
```

**Cause** : La collecte fonctionne, mais l'envoi échoue

**Solution** :
- Vérifier les logs de `queryN8nEndpoint()`
- Vérifier que le payload est bien construit
- Vérifier la connexion à n8n

---

## 🔧 Problèmes Courants et Solutions

### Problème 1 : Sélecteur CSS Incorrect

**Symptôme** : Aucune table trouvée alors qu'elles sont visibles

**Diagnostic** :
```javascript
// Dans la console, tester le sélecteur
document.querySelectorAll('table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg')
```

**Solution** :
- Vérifier que les tables ont bien toutes les classes CSS
- Inspecter une table (F12 → Inspect) et copier les classes exactes

### Problème 2 : En-têtes avec Casse Différente

**Symptôme** : Tables ignorées car en-têtes non reconnus

**Diagnostic** :
```javascript
// Vérifier les en-têtes
const table = document.querySelector('table');
const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
console.log('En-têtes:', headers);
```

**Solution** :
- Utiliser exactement "Rubrique" et "Description"
- Ou modifier le code pour être insensible à la casse (déjà fait normalement)

### Problème 3 : Mot-clé Non Trouvé

**Symptôme** : Tables avec en-têtes corrects mais pas collectées

**Diagnostic** :
```javascript
// Vérifier le contenu des cellules
const table = document.querySelector('table');
const cells = Array.from(table.querySelectorAll('td')).map(td => td.textContent.trim());
console.log('Cellules:', cells);
```

**Solution** :
- Ajouter un mot-clé reconnu : "CIA", "Flowise", "Programme"
- Ou modifier la liste des mots-clés dans le code

### Problème 4 : Tables Collectées Mais HTML Vide

**Symptôme** : `collectedTablesHTML.length > 0` mais `finalHTML.length === 0`

**Diagnostic** :
```javascript
// Vérifier le HTML collecté
const tables = document.querySelectorAll('table');
tables.forEach((table, i) => {
    console.log(`Table ${i + 1} HTML length:`, table.outerHTML.length);
});
```

**Solution** :
- Vérifier que `table.outerHTML` n'est pas vide
- Vérifier qu'il n'y a pas d'erreur JavaScript

---

## 📝 Logs à Surveiller

### Logs Normaux (Succès)

```
📊 Nombre de divs "prose" trouvées: 5
📋 Analyse de la div 1/5
   └─ Tables trouvées: 2
   └─ En-têtes de la première table: [Rubrique, Description]
   └─ A "Rubrique": ✅
   └─ A "Description": ✅
   └─ Contenu des cellules: [Etape, Programme, ...]
   └─ ✅ Mots-clés trouvés: [Programme]
✅ 1 div(s) devraient être collectées
```

### Logs Problématiques

```
📊 Nombre de divs "prose" trouvées: 5
📋 Analyse de la div 1/5
   └─ Tables trouvées: 2
   └─ En-têtes de la première table: [Col1, Col2]
   └─ A "Rubrique": ❌
   └─ A "Description": ❌
   └─ ⏭️ Div ignorée (pas d'en-têtes requis)
❌ PROBLÈME: Aucune table avec en-têtes "Rubrique" et "Description"
```

---

## 🚀 Prochaines Étapes

### Si le Diagnostic Montre que les Tables Sont Collectées

1. Vérifier les logs de `queryN8nEndpoint()`
2. Vérifier que le payload contient bien le HTML
3. Vérifier la réponse de n8n

### Si le Diagnostic Montre que les Tables Ne Sont Pas Collectées

1. Corriger les en-têtes des tables
2. Ajouter des mots-clés dans les cellules
3. Vérifier le sélecteur CSS

### Si le Problème Persiste

1. Activer les logs détaillés dans Flowise.js
2. Ajouter des `console.log()` dans `collectCriteriaTables()`
3. Vérifier le workflow n8n

---

## 📞 Support

### Fichiers Utiles

- `public/diagnostic-collecte-tables-claraverse.html` - Outil de diagnostic
- `public/Flowise.js` - Code source (fonction `collectCriteriaTables`)
- `FIX_N8N_REPONSE_VIDE_V17.2_SOLUTION.md` - Documentation du fix V17.2

### Commandes Utiles

```bash
# Ouvrir l'outil de diagnostic
start public/diagnostic-collecte-tables-claraverse.html

# Démarrer Claraverse
npm run dev

# Vérifier les logs dans la console
# F12 → Console → Chercher "collectCriteriaTables"
```

---

**Version** : 1.0  
**Date** : 2025-12-06  
**Status** : Outil de Diagnostic Créé
