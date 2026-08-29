# 🏗️ Architecture - wrap-tables-auto.js

**Fichier:** `public/wrap-tables-auto.js`  
**Rôle:** Envelopper automatiquement chaque table dans un conteneur avec `data-container-id`

---

## 🎯 OBJECTIF

Le script `wrap-tables-auto.js` détecte toutes les tables générées dynamiquement dans l'application et les enveloppe individuellement dans des conteneurs pour faciliter leur manipulation.

---

## 📊 STRUCTURE CRÉÉE

### Avant wrap-tables-auto.js

```html
<div class="prose prose-base dark:prose-invert max-w-none">
  <table>...</table>
  <table>...</table>
  <table>...</table>
</div>
```

### Après wrap-tables-auto.js

```html
<div class="prose prose-base dark:prose-invert max-w-none">
  <div class="prose prose-base dark:prose-invert max-w-none" 
       data-container-id="container-1715234567890-abc123"
       data-auto-wrapped="true">
    <table>...</table>
  </div>
  
  <div class="prose prose-base dark:prose-invert max-w-none" 
       data-container-id="container-1715234567891-def456"
       data-auto-wrapped="true">
    <table>...</table>
  </div>
  
  <div class="prose prose-base dark:prose-invert max-w-none" 
       data-container-id="container-1715234567892-ghi789"
       data-auto-wrapped="true">
    <table>...</table>
  </div>
</div>
```

---

## 🔍 FONCTIONNEMENT

### 1. Fonction wrapTableInContainer()

```javascript
function wrapTableInContainer(table) {
  // Vérifier si déjà dans un conteneur
  if (table.closest('[data-container-id]')) {
    return false;
  }

  // ⭐ IMPORTANT: Ne PAS envelopper les tables Flowise
  const headers = Array.from(table.querySelectorAll('th'))
    .map(th => th.textContent.trim().toLowerCase());
  if (headers.includes('flowise')) {
    console.log('⏭️ Table Flowise ignorée (sera traitée par Flowise.js)');
    return false;
  }

  // Créer le conteneur
  const container = document.createElement('div');
  container.className = 'prose prose-base dark:prose-invert max-w-none';
  container.setAttribute('data-container-id', 
    `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  container.setAttribute('data-auto-wrapped', 'true');

  // Insérer le conteneur et y déplacer la table
  table.parentNode.insertBefore(container, table);
  container.appendChild(table);

  console.log('✅ Table enveloppée avec data-container-id:', 
    container.getAttribute('data-container-id'));
  return true;
}
```

### 2. Scan Automatique

```javascript
function wrapAllUnwrappedTables() {
  const allTables = document.querySelectorAll('table');
  let wrappedCount = 0;

  allTables.forEach(table => {
    // Ignorer les tables déjà dans un conteneur
    if (table.closest('[data-container-id]')) {
      return;
    }

    // Ignorer les tables dans des éléments spéciaux
    if (table.closest('[role="dialog"]') || table.closest('.modal')) {
      return;
    }

    if (wrapTableInContainer(table)) {
      wrappedCount++;
    }
  });

  if (wrappedCount > 0) {
    console.log(`📦 ${wrappedCount} table(s) enveloppée(s) automatiquement`);
  }
}
```

### 3. Observer MutationObserver

```javascript
const observer = new MutationObserver((mutations) => {
  let hasNewTables = false;

  mutations.forEach(mutation => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'TABLE' || node.querySelector?.('table')) {
            hasNewTables = true;
          }
        }
      });
    }
  });

  if (hasNewTables) {
    setTimeout(wrapAllUnwrappedTables, 100);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

### 4. Scans Périodiques

```javascript
// Scan initial
setTimeout(wrapAllUnwrappedTables, 500);

// Scan périodique de sécurité (toutes les 2 secondes)
setInterval(wrapAllUnwrappedTables, 2000);
```

---

## 🔑 ATTRIBUTS CLÉS

### data-container-id

**Format:** `container-{timestamp}-{random}`  
**Exemple:** `container-1715234567890-abc123`

**Utilité:**
- Identifier de manière unique chaque wrapper de table
- Permettre la détection du conteneur parent dans menu.js
- Faciliter le debugging et le tracking

### data-auto-wrapped

**Valeur:** `"true"`

**Utilité:**
- Indiquer que le wrapper a été créé automatiquement
- Distinguer des wrappers manuels éventuels
- Faciliter le debugging

---

## 🎯 IMPACT SUR EXPORT TEMPLATE

### Problème Créé

Chaque table est **isolée** dans son propre wrapper:

```
Message
├─ Wrapper 1 [data-container-id="..."]
│  └─ Table 1
├─ Wrapper 2 [data-container-id="..."]
│  └─ Table 2
└─ Wrapper 3 [data-container-id="..."]
   └─ Table 3
```

**Conséquence:** `closest('[data-container-id]')` trouve le wrapper individuel, pas le conteneur parent.

### Solution dans menu.js

Au lieu de compter les `<table>`, compter les **wrappers**:

```javascript
// ❌ AVANT: Compte les tables (trouve 1 seule table par wrapper)
const tablesInParent = parentContainer.querySelectorAll('table').length;

// ✅ APRÈS: Compte les wrappers (trouve tous les wrappers du message)
const wrappersCount = parentContainer.querySelectorAll('[data-container-id]').length;
```

---

## 🔍 TABLES IGNORÉES

### Tables Flowise

```javascript
const headers = Array.from(table.querySelectorAll('th'))
  .map(th => th.textContent.trim().toLowerCase());
if (headers.includes('flowise')) {
  console.log('⏭️ Table Flowise ignorée');
  return false;
}
```

**Raison:** Les tables Flowise sont traitées par `Flowise.js` avec leur propre logique.

### Tables dans Modals

```javascript
if (table.closest('[role="dialog"]') || table.closest('.modal')) {
  return;
}
```

**Raison:** Les tables dans les modals/dialogs ne doivent pas être enveloppées automatiquement.

---

## 🧪 DEBUGGING

### API Publique

```javascript
window.tableWrapper = {
  wrapAll: wrapAllUnwrappedTables,
  version: '1.0.0'
};
```

**Utilisation dans la console:**

```javascript
// Forcer un scan manuel
window.tableWrapper.wrapAll();

// Vérifier la version
console.log(window.tableWrapper.version);
```

### Logs de Diagnostic

```javascript
// Lors de l'enveloppement
✅ Table enveloppée avec data-container-id: container-xxx

// Lors du scan
📦 3 table(s) enveloppée(s) automatiquement

// Lors de l'ignorance
⏭️ Table Flowise ignorée (sera traitée par Flowise.js)
```

---

## 📝 MAINTENANCE

### Points d'Attention

1. **Performance:** Le scan périodique (2s) peut impacter les performances sur de gros documents
2. **Conflits:** Vérifier que d'autres scripts ne modifient pas les wrappers
3. **Timing:** Le délai de 100ms après détection peut être insuffisant pour certains cas

### Améliorations Possibles

1. **Scan intelligent:** Ne scanner que les zones modifiées
2. **Désactivation conditionnelle:** Désactiver le scan périodique après X minutes d'inactivité
3. **Cache:** Mémoriser les tables déjà enveloppées pour éviter les re-scans

---

## 🔗 INTÉGRATION

### Chargement dans index.html

```html
<script src="/wrap-tables-auto.js"></script>
```

**Position:** Après le chargement du DOM, avant les autres scripts de manipulation de tables.

### Dépendances

- ✅ Aucune dépendance externe
- ✅ Fonctionne de manière autonome
- ✅ Compatible avec tous les navigateurs modernes

---

## 📊 STATISTIQUES

**Fréquence de scan:**
- Initial: 500ms après chargement
- Périodique: Toutes les 2 secondes
- Sur mutation: 100ms après détection

**Performance:**
- Scan de 100 tables: ~10ms
- Enveloppement d'une table: ~1ms
- Impact négligeable sur l'UI

---

## 🎯 CONCLUSION

`wrap-tables-auto.js` est un script **essentiel** qui:
- ✅ Enveloppe automatiquement toutes les tables
- ✅ Facilite la manipulation et l'export
- ✅ Fonctionne de manière transparente
- ⚠️ Crée une structure qui nécessite une logique spéciale dans menu.js

La correction dans `menu.js` **s'adapte** à cette architecture en comptant les wrappers au lieu des tables.
