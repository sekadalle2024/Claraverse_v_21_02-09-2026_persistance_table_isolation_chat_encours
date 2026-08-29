# 📋 Liste Complète des Fichiers - Système de Persistance

## 🎯 Fichiers Essentiels (Ne PAS Supprimer)

### 1. Point d'Entrée : `index.html`

```html
<!-- Scripts chargés dans cet ordre précis -->
<script src="/wrap-tables-auto.js"></script>
<script src="/Flowise.js"></script>
<script type="module" src="/force-restore-on-load.js"></script>
<script src="/menu-persistence-bridge.js"></script>
<script src="/menu.js"></script>
<script type="module" src="/auto-restore-chat-change.js"></script> ⭐ NOUVEAU
```

---

## 📁 Dossier `public/` - Scripts Frontend

### Scripts Actifs (Utilisés)

| Fichier | Rôle | Priorité | Statut |
|---------|------|----------|--------|
| **`restore-lock-manager.js`** | Gestionnaire de verrouillage global | ⭐⭐⭐ CRITIQUE | ✅ ACTIF |
| **`single-restore-on-load.js`** | Restauration unique au chargement | ⭐⭐⭐ CRITIQUE | ✅ ACTIF |
| **`auto-restore-chat-change.js`** | Restauration automatique au changement de chat | ⭐⭐⭐ CRITIQUE | ✅ ACTIF |
| **`dev-indexedDB.js`** | Édition de cellules avec IndexedDB | ⭐⭐⭐ INTÉGRÉ | ✅ ACTIF |
| `wrap-tables-auto.js` | Enveloppe les tables dans des conteneurs | ⭐⭐⭐ | ✅ ACTIF |
| `Flowise.js` | Intégration avec Flowise | ⭐⭐⭐ | ✅ ACTIF |
| `menu.js` | Menus contextuels des tables | ⭐⭐⭐ | ✅ ACTIF |
| `menu-persistence-bridge.js` | Pont menu ↔ persistance | ⭐⭐⭐ | ✅ ACTIF |
| `force-restore-on-load.js` | Restauration au chargement (backup) | ⭐ | ✅ ACTIF |
| `dev-persistence-adapter.js` | Adaptateur localStorage → IndexedDB | ⭐ OPTIONNEL | 🔧 UTIL |

### Scripts de Diagnostic (Optionnels)

| Fichier | Rôle | Statut |
|---------|------|--------|
| `diagnostic-chat-change.js` | Diagnostic changements de chat | 🔧 DEBUG |
| `diagnostic-restauration-detaille.js` | Diagnostic restauration | 🔧 DEBUG |
| `test-restore-force.js` | Test de restauration forcée | 🧪 TEST |

### Scripts Obsolètes (Peuvent être Supprimés)

| Fichier | Raison | Action |
|---------|--------|--------|
| `restore-on-any-change.js` | Remplacé par `auto-restore-chat-change.js` | ❌ SUPPRIMER |
| `restore-with-context.js` | Approche abandonnée | ❌ SUPPRIMER |
| `restore-smart-matching.js` | Approche abandonnée | ❌ SUPPRIMER |
| `restore-tables-simple.js` | Version obsolète | ❌ SUPPRIMER |
| `restore-on-chat-change.js` | Version obsolète | ❌ SUPPRIMER |
| `force-restore-chat-change.js` | Version obsolète | ❌ SUPPRIMER |
| `smart-restore-after-flowise.js` | Approche abandonnée | ❌ SUPPRIMER |
| `auto-save-tables.js` | Non utilisé (sauvegarde gérée par services) | ❌ SUPPRIMER |
| `restore-direct.js` | Version obsolète | ❌ SUPPRIMER |
| `force-restore-menu-tables.js` | Version obsolète | ❌ SUPPRIMER |
| `diagnostic-persistance.js` | Ancien diagnostic | ❌ SUPPRIMER |
| `quick-diagnostic.js` | Ancien diagnostic | ❌ SUPPRIMER |
| `diagnostic-timing-race.js` | Ancien diagnostic | ❌ SUPPRIMER |

---

## 📁 Dossier `src/services/` - Services Backend

### Services Principaux

| Fichier | Rôle | Priorité | Statut |
|---------|------|----------|--------|
| **`flowiseTableService.ts`** | Service principal de gestion des tables | ⭐⭐⭐ CRITIQUE | ✅ ACTIF |
| **`menuIntegration.ts`** | Intégration menu ↔ services | ⭐⭐⭐ CRITIQUE | ✅ ACTIF |
| **`flowiseTableBridge.ts`** | Pont frontend ↔ backend | ⭐⭐⭐ | ✅ ACTIF |
| **`indexedDB.ts`** | Gestion IndexedDB | ⭐⭐⭐ | ✅ ACTIF |
| `claraDatabase.ts` | Base de données Clara | ⭐⭐ | ✅ ACTIF |
| `flowiseTableCache.ts` | Cache des tables | ⭐⭐ | ✅ ACTIF |
| `flowiseTableLazyLoader.ts` | Chargement lazy | ⭐ | ✅ ACTIF |
| `flowiseTimelineService.ts` | Timeline des tables | ⭐ | ✅ ACTIF |
| `flowiseTableDiagnostics.ts` | Diagnostics | 🔧 | ✅ ACTIF |
| `autoRestore.ts` | Auto-restauration | ⭐ | ✅ ACTIF |

### Types

| Fichier | Rôle |
|---------|------|
| `src/types/flowise_table_types.ts` | Types TypeScript pour les tables |

---

## 💾 Base de Données IndexedDB

### Configuration

```javascript
Nom de la base : "clara_db"
Version : 12
Store principal : "clara_generated_tables"
```

### Autres Stores (dans clara_db)

- `clara_sessions` : Sessions utilisateur
- `clara_messages` : Messages des chats
- `clara_users` : Utilisateurs
- `clara_attachments` : Pièces jointes

### SessionStorage

```javascript
Clé : "claraverse_stable_session"
Valeur : "stable_session_1763237811596_xxx"
```

---

## 📊 Hiérarchie des Dépendances

```
index.html
├── wrap-tables-auto.js
├── Flowise.js
├── force-restore-on-load.js (module)
│   └── flowiseTableBridge.ts
│       └── flowiseTableService.ts
│           └── indexedDB.ts
├── menu-persistence-bridge.js
│   └── menuIntegration.ts
│       └── flowiseTableService.ts
├── menu.js
└── auto-restore-chat-change.js (module) ⭐ NOUVEAU
    └── Événement: flowise:table:restore:request
        └── menuIntegration.ts
            └── flowiseTableService.ts
                └── indexedDB.ts
                    └── clara_db/clara_generated_tables
```

---

## 🔄 Flux de Communication

### Événements Personnalisés

| Événement | Émetteur | Récepteur | Données |
|-----------|----------|-----------|---------|
| `flowise:table:save:request` | menu.js | menuIntegration.ts | `{ table, sessionId, keyword, source }` |
| `flowise:table:restore:request` | auto-restore-chat-change.js | menuIntegration.ts | `{ sessionId }` |
| `flowise:table:structure:changed` | menu.js | menuIntegration.ts | `{ action, rowIndex }` |
| `flowise:table:update` | menuIntegration.ts | Subscribers | `{ tableId, keyword }` |

---

## 📝 Fichiers de Documentation

### Documentation Active

| Fichier | Contenu |
|---------|---------|
| **`DOCUMENTATION_COMPLETE_SOLUTION.md`** | Documentation exhaustive du système |
| **`LISTE_FICHIERS_SYSTEME_PERSISTANCE.md`** | Ce fichier - Liste des fichiers |
| `SITUATION_FINALE.md` | État final du système |

### Documentation Obsolète (Peut être Archivée)

Tous les fichiers `TEST_*.md`, `FIX_*.md`, `DIAGNOSTIC_*.md`, `SOLUTION_*.md` créés pendant le développement peuvent être déplacés dans un dossier `archive/` ou supprimés.

---

## 🗑️ Fichiers à Supprimer

### Scripts Obsolètes dans `public/`

```bash
# Commandes pour nettoyer (à exécuter depuis la racine du projet)
rm public/restore-on-any-change.js
rm public/restore-with-context.js
rm public/restore-smart-matching.js
rm public/restore-tables-simple.js
rm public/restore-on-chat-change.js
rm public/force-restore-chat-change.js
rm public/smart-restore-after-flowise.js
rm public/auto-save-tables.js
rm public/restore-direct.js
rm public/force-restore-menu-tables.js
rm public/diagnostic-persistance.js
rm public/quick-diagnostic.js
rm public/diagnostic-timing-race.js
```

### Fichiers HTML de Test

```bash
rm public/*.html  # Tous les fichiers de test HTML
```

### Documentation Obsolète

```bash
# Créer un dossier archive
mkdir -p archive/docs

# Déplacer les anciens docs
mv TEST_*.md archive/docs/
mv FIX_*.md archive/docs/
mv DIAGNOSTIC_*.md archive/docs/
mv SOLUTION_*.md archive/docs/
mv RECAP_*.md archive/docs/
mv GUIDE_*.md archive/docs/
mv CORRECTION_*.md archive/docs/
mv ANALYSE_*.md archive/docs/
mv RESUME_*.md archive/docs/
```

---

## ✅ Checklist de Vérification

Après nettoyage, vérifier que ces fichiers existent :

### Essentiels
- [ ] `index.html`
- [ ] `public/auto-restore-chat-change.js` ⭐
- [ ] `public/wrap-tables-auto.js`
- [ ] `public/Flowise.js`
- [ ] `public/menu.js`
- [ ] `public/menu-persistence-bridge.js`
- [ ] `public/force-restore-on-load.js`

### Services
- [ ] `src/services/flowiseTableService.ts`
- [ ] `src/services/menuIntegration.ts`
- [ ] `src/services/flowiseTableBridge.ts`
- [ ] `src/services/indexedDB.ts`

### Documentation
- [ ] `DOCUMENTATION_COMPLETE_SOLUTION.md`
- [ ] `LISTE_FICHIERS_SYSTEME_PERSISTANCE.md`

---

## 🎯 Résumé

**Fichiers critiques** : 11 fichiers  
**Base de données** : 1 (clara_db)  
**Stores** : 1 principal (clara_generated_tables)  
**Événements** : 4 événements personnalisés  

**Fichier clé de la solution** : `public/auto-restore-chat-change.js`

---

*Liste créée le 15 novembre 2025*
