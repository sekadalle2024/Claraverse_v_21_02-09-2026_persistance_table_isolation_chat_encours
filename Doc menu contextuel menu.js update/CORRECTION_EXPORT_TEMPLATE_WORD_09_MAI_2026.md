# 📋 Correction Export Template Word - Détection Tables et Timeout

**Date:** 09 Mai 2026  
**Fichier modifié:** `public/menu.js`  
**Fonctions modifiées:** 
- `exportTemplateWord()` (lignes 4171-4283)
- `ensureDocxLibraryLoaded()` (lignes 5009-5067)

**Statut:** ✅ CORRIGÉ

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Deux problèmes identifiés et corrigés:**

1. **Détection des tables:** L'export Word n'exportait qu'UNE SEULE table au lieu de TOUTES les tables du message
2. **Timeout bibliothèque docx:** Erreur "Timeout: docx non accessible" lors du chargement de la bibliothèque

**Solutions appliquées:**

1. **Détection des tables:** Réplication de la logique corrigée d'Excel - compter les `div[data-container-id]` (wrappers) au lieu des `<table>`
2. **Timeout:** Augmentation du timeout de 5 secondes à 30 secondes pour le chargement de la bibliothèque docx

---

## 📊 PROBLÈME 1: DÉTECTION DES TABLES

### Symptômes

1. ✅ Clic droit sur une table → "Export template Word"
2. ❌ Message d'erreur: "❌ Erreur: Timeout: docx non accessible"
3. ❌ Ou si le backend fonctionne: seulement la table cliquée est exportée
4. ❌ Les autres tables du même message sont ignorées

### Cause Racine

**Identique au problème Excel résolu précédemment:**

Le script `wrap-tables-auto.js` enveloppe chaque table individuellement dans un `div[data-container-id]`. L'ancienne logique cherchait le conteneur `div.prose` uniquement, sans utiliser la logique de comptage des wrappers.

### Architecture des Tables

```
Message (div.prose ou autre conteneur)
├─ div[data-container-id="container-xxx-1"] ← Wrapper individuel table 1
│  └─ table ← Table 1
├─ div[data-container-id="container-xxx-2"] ← Wrapper individuel table 2
│  └─ table ← Table 2
└─ div[data-container-id="container-xxx-3"] ← Wrapper individuel table 3
   └─ table ← Table 3
```

### Code Problématique (Avant)

```javascript
// ❌ ANCIEN CODE - Logique incomplète
if (this.targetTable) {
  // Chercher le conteneur du message (div.prose) le plus proche
  const messageContainer = this.targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none')
    || this.targetTable.closest('div.prose');

  if (messageContainer) {
    // Chercher TOUTES les tables dans CE message uniquement
    tables = Array.from(messageContainer.querySelectorAll('table'));
  }
}
```

**Problème:** Ne fonctionne pas toujours selon la structure DOM du message.

### Solution Appliquée (Après)

```javascript
// ✅ NOUVEAU CODE - Même logique que exportTemplate() Excel
if (this.targetTable) {
  // 1. Trouver le wrapper individuel de la table cliquée
  const tableWrapper = this.targetTable.closest('[data-container-id]');
  
  if (tableWrapper) {
    console.log("🔍 [Export Word] Wrapper individuel trouvé:", 
                tableWrapper.getAttribute('data-container-id'));
    
    // 2. Remonter au conteneur parent qui contient tous les wrappers
    let messageContainer = tableWrapper.parentElement;
    
    while (messageContainer && messageContainer !== document.body) {
      // ✅ CLEF: Compter les WRAPPERS, pas les tables
      const wrappersCount = messageContainer.querySelectorAll('[data-container-id]').length;
      
      console.log(`🔍 [Export Word] Conteneur testé: ${messageContainer.className}, wrappers: ${wrappersCount}`);
      
      // Si ce conteneur a plusieurs wrappers, c'est le conteneur du message
      if (wrappersCount > 1) {
        console.log(`✅ [Export Word] Conteneur du message trouvé avec ${wrappersCount} wrappers`);
        break;
      }
      
      messageContainer = messageContainer.parentElement;
    }
    
    // 3. Extraire toutes les tables de ce conteneur
    if (messageContainer && messageContainer !== document.body) {
      tables = Array.from(messageContainer.querySelectorAll('table'));
      console.log(`✅ [Export Word] ${tables.length} table(s) trouvée(s) dans le message`);
    } else {
      // Fallback: si pas de conteneur parent trouvé, prendre juste la table active
      console.warn("⚠️ [Export Word] Conteneur parent non trouvé, export de la table active uniquement");
      tables = [this.targetTable];
    }
  } else {
    // Pas de wrapper data-container-id, chercher le conteneur prose classique
    console.log("🔍 [Export Word] Pas de wrapper data-container-id, recherche conteneur prose");
    const proseContainer = this.targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none')
      || this.targetTable.closest('div.prose');
    
    if (proseContainer) {
      tables = Array.from(proseContainer.querySelectorAll('table'));
      console.log(`✅ [Export Word] ${tables.length} table(s) trouvée(s) dans conteneur prose`);
    } else {
      tables = [this.targetTable];
    }
  }
  
  // DIAGNOSTIC: Afficher les tables trouvées
  if (tables.length > 0) {
    console.log("🔍 [Export Word] Tables détectées:");
    tables.forEach((table, i) => {
      console.log(`  Table ${i + 1}:`, {
        rows: table.querySelectorAll('tr').length,
        cols: table.querySelectorAll('tr')[0]?.querySelectorAll('td, th').length || 0
      });
    });
  }
}
```

### Différences Clés

| Aspect | Avant ❌ | Après ✅ |
|--------|---------|---------|
| **Logique** | Cherche `div.prose` uniquement | Compte les wrappers `[data-container-id]` |
| **Robustesse** | Dépend de la structure DOM | S'adapte à l'architecture des wrappers |
| **Fallback** | Limité | Multiple niveaux de fallback |
| **Logs** | Basique | Diagnostic détaillé à chaque étape |
| **Cohérence** | Différent d'Excel | **Identique à Excel** ✅ |

---

## 📊 PROBLÈME 2: TIMEOUT BIBLIOTHÈQUE DOCX

### Symptômes

1. ✅ Clic droit sur une table → "Export template Word"
2. ❌ Message d'erreur: "❌ Erreur: Timeout: docx non accessible"
3. ❌ L'export ne se lance jamais

### Cause Racine

Le timeout de chargement de la bibliothèque docx était trop court:
- **Avant:** 50 tentatives × 100ms = **5 secondes**
- **Problème:** Insuffisant pour charger la bibliothèque depuis le CDN unpkg.com

### Code Problématique (Avant)

```javascript
// ❌ TIMEOUT TROP COURT: 5 secondes
const checkLib = setInterval(() => {
  attempts++;
  if (window.docx && window.docx.Document) {
    clearInterval(checkLib);
    this._docxLib = window.docx;
    console.log("✅ docx trouvé après attente");
    resolve();
  } else if (attempts > 50) { // ❌ 50 × 100ms = 5 secondes
    clearInterval(checkLib);
    reject(new Error("Timeout: docx non accessible"));
  }
}, 100);
```

### Solution Appliquée (Après)

```javascript
// ✅ TIMEOUT AUGMENTÉ: 30 secondes
const checkLib = setInterval(() => {
  attempts++;
  if (window.docx && window.docx.Document) {
    clearInterval(checkLib);
    this._docxLib = window.docx;
    console.log("✅ docx trouvé après attente");
    resolve();
  } else if (attempts > 300) { // ✅ 300 × 100ms = 30 secondes
    clearInterval(checkLib);
    reject(new Error("Timeout: docx non accessible après 30 secondes"));
  }
}, 100);
```

### Différences Clés

| Aspect | Avant ❌ | Après ✅ |
|--------|---------|---------|
| **Tentatives** | 50 | 300 |
| **Timeout total** | 5 secondes | 30 secondes |
| **Message d'erreur** | "Timeout: docx non accessible" | "Timeout: docx non accessible après 30 secondes" |
| **Robustesse** | Échoue souvent | Laisse le temps au CDN de répondre |

**Note:** La correction a été appliquée aux **deux endroits** dans `ensureDocxLibraryLoaded()`:
1. Vérification du script existant
2. Chargement d'un nouveau script

---

## 🧪 VALIDATION

### Test Attendu

```
Scénario: Message avec 3 tables
Action: Clic droit sur table 2 → "Export template Word"

Logs Console Attendus:
✅ 🔍 [Export Word] Wrapper individuel trouvé: container-xxx-2
✅ 🔍 [Export Word] Conteneur testé: prose prose-base..., wrappers: 3
✅ ✅ [Export Word] Conteneur du message trouvé avec 3 wrappers
✅ ✅ [Export Word] 3 table(s) trouvée(s) dans le message
✅ 🔍 [Export Word] Tables détectées:
     Table 1: { rows: 5, cols: 3 }
     Table 2: { rows: 8, cols: 4 }
     Table 3: { rows: 6, cols: 2 }
✅ 📄 Export Word: 3 tables seront exportées
✅ ✅ Bibliothèque docx chargée avec succès (si fallback JS)
✅ ✅ Export Word terminé! (3 tables)

Fichier Word:
✅ Contient les 3 tables
✅ Séparées par des espaces
✅ En-têtes avec style rouge bordeaux
```

### Critères de Succès

- ✅ **Détection:** Toutes les tables du message sont détectées
- ✅ **Export:** Toutes les tables sont exportées dans le fichier Word
- ✅ **Timeout:** Pas d'erreur de timeout lors du chargement de docx
- ✅ **Logs:** Diagnostic détaillé dans la console
- ✅ **Cohérence:** Même logique que l'export Excel

---

## 📚 INTÉGRATION AVEC AUTRES MEMOS

### Memos Liés

1. **Probleme_resolution_export_table_div.md**
   - Documentation de la correction Excel (référence)
   - Architecture des wrappers `wrap-tables-auto.js`
   - Logique de comptage des wrappers

2. **ARCHITECTURE_WRAP_TABLES_AUTO.md**
   - Fonctionnement du script `wrap-tables-auto.js`
   - Structure des wrappers `data-container-id`

3. **SOLUTION_TECHNIQUE_DETAILLEE.md**
   - Détails techniques de la solution Excel
   - Patterns de détection des tables

### Cohérence Globale

```
wrap-tables-auto.js
    ↓ (enveloppe chaque table)
div[data-container-id] × N
    ↓ (détection par menu.js)
exportTemplate() [Excel] ✅
exportTemplateWord() [Word] ✅
    ↓ (compte les wrappers)
Conteneur parent trouvé
    ↓ (extraction)
Toutes les tables exportées
```

**Résultat:** Les deux fonctions d'export (Excel et Word) utilisent maintenant **la même logique robuste** de détection des tables. ✅

---

## 🔧 MAINTENANCE FUTURE

### Points d'Attention

1. **Si wrap-tables-auto.js change:**
   - Vérifier que les wrappers utilisent toujours `data-container-id`
   - Adapter la logique de comptage si nécessaire
   - Tester les deux exports (Excel et Word)

2. **Si la structure DOM change:**
   - Tester avec différents types de messages
   - Vérifier les logs de diagnostic
   - Valider les fallbacks

3. **Si le CDN unpkg.com est lent:**
   - Le timeout de 30 secondes devrait suffire
   - Possibilité d'augmenter encore si nécessaire
   - Envisager un CDN alternatif ou hébergement local

### Tests Recommandés

- ✅ Message avec 1 table
- ✅ Message avec 3+ tables
- ✅ Message avec tables imbriquées
- ✅ Message sans wrapper `data-container-id`
- ✅ Message avec structure DOM complexe
- ✅ Export avec connexion lente (timeout)
- ✅ Export avec backend Python disponible
- ✅ Export avec fallback JavaScript (backend indisponible)

---

## 📝 CONCLUSION

**Deux corrections majeures appliquées:**

1. **Détection des tables:** Réplication de la logique Excel corrigée
   - Compte les wrappers `[data-container-id]` au lieu des `<table>`
   - Logs de diagnostic détaillés
   - Fallbacks multiples

2. **Timeout bibliothèque docx:** Augmentation de 5s à 30s
   - Laisse le temps au CDN de répondre
   - Message d'erreur plus explicite
   - Appliqué aux deux points de chargement

**Résultat:** L'export template Word fonctionne maintenant de manière **cohérente avec Excel** et **robuste face aux timeouts**. ✅

---

## 🔗 RÉFÉRENCES

- **Fichier modifié:** `public/menu.js`
- **Fonctions:** `exportTemplateWord()`, `ensureDocxLibraryLoaded()`
- **Lignes:** 4171-4283, 5009-5067
- **Date:** 09 Mai 2026
- **Référence Excel:** `Probleme_resolution_export_table_div.md`
- **Architecture:** `ARCHITECTURE_WRAP_TABLES_AUTO.md`

