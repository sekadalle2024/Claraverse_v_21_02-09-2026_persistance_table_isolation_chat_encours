# 🔍 Diagnostic: Table Non Détectée

## ❌ Problème

Vous avez envoyé un message mais aucun log HTML n'apparaît dans la console.

## 🎯 Cause Probable

Le système `Flowise.js` attend une **table HTML** dans le chat, pas un message texte.

### Votre Message

```
[Mode] = Table_Template
[Node] = Programme de travail
[Command] = Etape de mission
[Processus] = Sécurité trésorerie
...
```

**Ce n'est PAS une table HTML** - C'est du texte brut.

## ✅ Solution: Créer une Table HTML

### Étape 1: Créer une Table de Critères

Vous devez créer une **table HTML** dans le chat avec:

1. **En-têtes**: "Rubrique" et "Description"
2. **Contenu**: Les informations de votre processus

**Exemple de table attendue**:

| Rubrique | Description |
|----------|-------------|
| Etape | Programme de travail |
| reference | Prg-001 |
| Processus | Sécurité trésorerie |
| Directive | Cibler uniquement les operations d'inventaire de caisse |

### Étape 2: Créer une Table Déclencheuse

Ensuite, créez une **deuxième table** avec:

1. **En-tête**: "Flowise"
2. **Contenu**: Le mot-clé (ex: "Programme de travail")

**Exemple de table déclencheuse**:

| Flowise |
|---------|
| Programme de travail |

## 🧪 Test de Diagnostic

### Vérifier si Flowise.js est Chargé

```javascript
// Ouvrir la console (F12)

// Vérifier la version
console.log(window.ClaraverseN8nV17.version);
// Devrait afficher: "17.2.0 - Log HTML systématique dans la console"

// Forcer un scan
window.ClaraverseN8nV17.scanAndProcess();
// Devrait afficher: "🔎 Scanner: Analyse de X table(s) dans le DOM..."
```

### Vérifier les Tables dans le DOM

```javascript
// Compter les tables
const tables = document.querySelectorAll('table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
console.log('Nombre de tables:', tables.length);

// Voir les en-têtes de chaque table
tables.forEach((table, i) => {
  const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
  console.log(`Table ${i + 1} - En-têtes:`, headers);
});

// Chercher les tables avec "Flowise"
const flowiseTables = Array.from(tables).filter(table => {
  const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim().toLowerCase());
  return headers.includes('flowise');
});
console.log('Tables avec colonne "Flowise":', flowiseTables.length);
```

## 📋 Logs Attendus

### Si Tout Fonctionne

Quand vous créez une table avec "Flowise", vous devriez voir:

```
🔎 Scanner: Analyse de 2 table(s) dans le DOM...
📋 Table 1 - En-têtes: ["Rubrique", "Description"]
⏭️ Table 1: Pas de colonne 'Flowise', ignorée
📋 Table 2 - En-têtes: ["Flowise"]
✅ Table 2: Colonne 'Flowise' détectée ! Traitement en cours...
🎬 === DÉBUT DU TRAITEMENT D'UNE TABLE FLOWISE ===
🔍 Extraction du mot-clé dynamique depuis la table Flowise...
✅ Mot-clé dynamique extrait: "Programme de travail"
📝 Étape 1: Extraction du message utilisateur...
📊 Étape 2: Collecte des tables de critères...
📡 ========== ÉTAPE 3: ENVOI VERS N8N ==========

═══════════════════════════════════════════════════════════════════
🔍 CONTENU HTML ENVOYÉ VERS N8N
═══════════════════════════════════════════════════════════════════

🎯 Mot-clé: Programme de travail
📊 Taille totale: 2543 caractères
📡 Endpoint: https://xomava4845.app.n8n.cloud/webhook/htlm_processor
⏰ Timestamp: 2025-12-03T22:45:12.345Z

═══════════════════════════════════════════════════════════════════
📋 CONTENU HTML COMPLET:
═══════════════════════════════════════════════════════════════════

<table>...</table>
```

### Si Aucune Table n'est Détectée

```
🔎 Scanner: Analyse de 0 table(s) dans le DOM...
📊 Scanner terminé: 0 table(s) Flowise traitée(s) sur 0 table(s) analysée(s)
```

**Cela signifie**: Aucune table HTML n'a été créée dans le chat.

## 🎯 Comment Créer une Table dans le Chat

### Option 1: Via un LLM (Recommandé)

Demandez à votre LLM (ChatGPT, Claude, etc.) de créer une table:

```
Crée-moi une table avec:
- Colonne 1: Rubrique
- Colonne 2: Description
- Ligne 1: Etape | Programme de travail
- Ligne 2: reference | Prg-001
- Ligne 3: Processus | Sécurité trésorerie

Puis crée une deuxième table avec:
- Colonne: Flowise
- Ligne: Programme de travail
```

### Option 2: Via Markdown

Si votre interface supporte le markdown:

```markdown
| Rubrique | Description |
|----------|-------------|
| Etape | Programme de travail |
| reference | Prg-001 |
| Processus | Sécurité trésorerie |

| Flowise |
|---------|
| Programme de travail |
```

### Option 3: Via HTML Direct

Si vous pouvez injecter du HTML:

```html
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead>
    <tr>
      <th>Rubrique</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Etape</td>
      <td>Programme de travail</td>
    </tr>
    <tr>
      <td>reference</td>
      <td>Prg-001</td>
    </tr>
  </tbody>
</table>

<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead>
    <tr>
      <th>Flowise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Programme de travail</td>
    </tr>
  </tbody>
</table>
```

## 🔧 Forcer un Scan Manuel

Si vous avez créé des tables mais rien ne se passe:

```javascript
// Dans la console (F12)
window.ClaraverseN8nV17.scanAndProcess();
```

## 📞 Checklist de Diagnostic

- [ ] Console ouverte (F12)
- [ ] Flowise.js chargé (`window.ClaraverseN8nV17.version` fonctionne)
- [ ] Tables HTML créées dans le chat (pas de texte brut)
- [ ] Table avec colonne "Flowise" présente
- [ ] Mot-clé dans la première ligne de la colonne "Flowise"
- [ ] Scan manuel effectué (`scanAndProcess()`)
- [ ] Logs visibles dans la console

## 💡 Astuce

Pour tester rapidement, utilisez la page de test:

```
http://localhost:5173/test-n8n-programme-travail.html
```

Cette page crée automatiquement les tables et teste l'envoi vers n8n.

---

**Version**: 17.2.0

**Date**: 2025-12-03

**Statut**: ✅ Guide de diagnostic

---

## 🎉 Résumé

Le système attend des **tables HTML**, pas du texte brut.

Créez deux tables:
1. Table de critères (Rubrique/Description)
2. Table déclencheuse (Flowise/Mot-clé)

Le HTML sera automatiquement loggé dans la console ! 🚀
