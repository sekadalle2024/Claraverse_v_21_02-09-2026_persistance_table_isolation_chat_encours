# ✅ Log HTML Brut Complet Envoyé à N8N

## 🎯 Objectif

Afficher dans les logs de la console le **HTML brut COMPLET** qui est envoyé au workflow n8n, sans troncature ni limitation.

## ✅ Solution Appliquée

J'ai ajouté un nouveau log dans la fonction `queryN8nEndpoint()` qui affiche :
1. Le HTML brut complet (intégral, sans troncature)
2. Les statistiques (nombre de tables, taille)
3. La liste de toutes les balises `<table>` trouvées

### Nouveau Log Ajouté

```
╔═══════════════════════════════════════════════════════╗
║  📄 HTML BRUT COMPLET ENVOYÉ À N8N                    ║
╚═══════════════════════════════════════════════════════╝

  📊 Statistiques:
    ├─ Nombre de tables: 7
    ├─ Taille: 15234 caractères (14.88 KB)
    └─ Mot-clé: Programme de travail

  📄 CONTENU HTML COMPLET:
═══════════════════════════════════════════════════════════════════
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead><tr><th>Rubrique</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>Etape</td><td>Programme de travail</td></tr>
    <tr><td>reference</td><td>Prg-InvEsp-001</td></tr>
  </tbody>
</table>
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead><tr><th>no</th><th>tâches clés</th><th>Point de controle</th>...</tr></thead>
  <tbody>
    <tr><td>1</td><td>Préparer les documents...</td><td>Disponibilité...</td>...</tr>
    <tr><td>2</td><td>Arrêter toutes les opérations...</td><td>Absence...</td>...</tr>
    ...
  </tbody>
</table>
...
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead><tr><th>Flowise</th></tr></thead>
  <tbody><tr><td>Programme de travail</td></tr></tbody>
</table>
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  <thead><tr><th>user_message</th></tr></thead>
  <tbody><tr><td>[Command] = /Programme de travail - [Processus] = facturation</td></tr></tbody>
</table>
═══════════════════════════════════════════════════════════════════

  🔍 Vérification des balises <table>:
    ├─ Table 1: <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    ├─ Table 2: <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    ├─ Table 3: <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    ├─ Table 4: <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    ├─ Table 5: <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    ├─ Table 6: <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    ├─ Table 7: <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    └─ Total: 7 table(s) détectée(s)
```

## 📊 Informations Affichées

### 1. Statistiques
- **Nombre de tables** : Comptage des balises `<table>` dans le HTML
- **Taille** : Nombre de caractères et taille en KB
- **Mot-clé** : Le mot-clé qui a déclenché le traitement

### 2. HTML Complet
- **Tout le HTML** est affiché entre deux lignes de séparation
- **Aucune troncature** : Le HTML complet est visible
- **Format brut** : Exactement ce qui est envoyé à n8n

### 3. Vérification des Tables
- **Liste de toutes les balises `<table>`** trouvées
- **Aperçu de chaque balise** (80 premiers caractères)
- **Total** : Nombre total de tables détectées

## 🎯 Utilisation

### 1. Ouvrir la Console

Appuyer sur **F12** pour ouvrir la console du navigateur AVANT de déclencher le traitement.

### 2. Créer une Table Flowise

Créer une table avec en-tête "Flowise" et un mot-clé (ex: "Programme de travail").

### 3. Observer les Logs

Chercher dans la console :
```
📄 HTML BRUT COMPLET ENVOYÉ À N8N
```

### 4. Copier le HTML

Vous pouvez maintenant :
- ✅ Voir tout le HTML envoyé à n8n
- ✅ Copier le HTML complet
- ✅ Tester le HTML dans n8n directement
- ✅ Vérifier que toutes les tables sont présentes

## 🔍 Diagnostic

### Si vous voyez toutes les tables

```
🔍 Vérification des balises <table>:
  ├─ Table 1: <table class="min-w-full...  ← Table critère 1
  ├─ Table 2: <table class="min-w-full...  ← Table critère 2
  ├─ Table 3: <table class="min-w-full...  ← Table critère 3
  ├─ Table 4: <table class="min-w-full...  ← Table critère 4
  ├─ Table 5: <table class="min-w-full...  ← Table critère 5
  ├─ Table 6: <table class="min-w-full...  ← Table déclencheuse
  ├─ Table 7: <table class="min-w-full...  ← Table user_message
  └─ Total: 7 table(s) détectée(s)
```

✅ **Tout est OK** : Toutes les tables sont présentes et seront envoyées à n8n.

### Si vous voyez seulement 2 tables

```
🔍 Vérification des balises <table>:
  ├─ Table 1: <table class="min-w-full...  ← Table d'en-tête
  ├─ Table 2: <table class="min-w-full...  ← Table de données
  └─ Total: 2 table(s) détectée(s)
```

❌ **Problème** : Les tables critères et user_message ne sont PAS collectées.

**Causes possibles** :
1. Aucune div ne contient de tables avec "Rubrique" et "Description"
2. Le mot-clé n'est pas trouvé dans les cellules
3. Le message utilisateur n'a pas été détecté

## 📋 Exemple Complet

Voici ce que vous devriez voir dans la console :

```
╔═══════════════════════════════════════════════════════╗
║  📦 COLLECTE DES TABLES HTML                          ║
╚═══════════════════════════════════════════════════════╝

🔍 ÉTAPE 1: RECHERCHE DES TABLES CRITÈRES
  ├─ Mot-clé recherché: "Programme de travail"
  ├─ Variations: Programme de travail, programme de travail, PROGRAMME DE TRAVAIL
  └─ Divs à analyser: 15

  ✅ Div #3 - Mot-clé trouvé
     ├─ Tables dans cette div: 5
     ├─ Table 1:
     │  ├─ En-têtes: [Rubrique, Description]
     │  ├─ Lignes: 2
     │  └─ Taille: 456 caractères

📊 Tables critères collectées: 5

🎯 ÉTAPE 2: AJOUT TABLE DÉCLENCHEUSE
  ├─ Mot-clé: "Programme de travail"
  ├─ En-têtes: [Flowise]
  ├─ Lignes: 1
  └─ Taille: 234 caractères

💬 ÉTAPE 3: AJOUT TABLE USER_MESSAGE
  ├─ Taille: 345 caractères
  └─ Aperçu: "[Command] = /Programme de travail..."

╔═══════════════════════════════════════════════════════╗
║  ✅ COLLECTE TERMINÉE                                 ║
╚═══════════════════════════════════════════════════════╝
  ├─ Total tables: 7
  │  ├─ Tables critères: 5
  │  ├─ Table déclencheuse: 1
  │  └─ Table user_message: 1
  ├─ Taille totale: 15234 caractères (14.88 KB)
  └─ Prêt pour envoi à n8n

╔═══════════════════════════════════════════════════════╗
║  🚀 COMMUNICATION AVEC N8N                            ║
╚═══════════════════════════════════════════════════════╝

📋 ÉTAPE 1: PRÉPARATION DE LA REQUÊTE
  ├─ Endpoint: https://barow52161.app.n8n.cloud/webhook/htlm_processor
  ├─ Nombre de tables HTML: 7
  ├─ Taille totale: 15234 caractères (14.88 KB)

╔═══════════════════════════════════════════════════════╗
║  📄 HTML BRUT COMPLET ENVOYÉ À N8N                    ║
╚═══════════════════════════════════════════════════════╝

  📊 Statistiques:
    ├─ Nombre de tables: 7
    ├─ Taille: 15234 caractères (14.88 KB)
    └─ Mot-clé: Programme de travail

  📄 CONTENU HTML COMPLET:
═══════════════════════════════════════════════════════════════════
<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
  ... TOUT LE HTML ICI ...
</table>
═══════════════════════════════════════════════════════════════════

  🔍 Vérification des balises <table>:
    ├─ Table 1: <table class="min-w-full border border-gray-200...
    ├─ Table 2: <table class="min-w-full border border-gray-200...
    ├─ Table 3: <table class="min-w-full border border-gray-200...
    ├─ Table 4: <table class="min-w-full border border-gray-200...
    ├─ Table 5: <table class="min-w-full border border-gray-200...
    ├─ Table 6: <table class="min-w-full border border-gray-200...
    ├─ Table 7: <table class="min-w-full border border-gray-200...
    └─ Total: 7 table(s) détectée(s)
```

## ✅ Avantages

1. **Visibilité totale** : Vous voyez TOUT le HTML envoyé à n8n
2. **Copie facile** : Vous pouvez copier le HTML complet depuis la console
3. **Test direct** : Vous pouvez tester le HTML dans n8n avec curl
4. **Diagnostic** : Vous pouvez vérifier que toutes les tables sont présentes
5. **Débogage** : Vous pouvez identifier les tables manquantes

## 🚀 Test Immédiat

1. **Vider le cache** (Ctrl + Shift + Delete)
2. **Rafraîchir** la page (Ctrl + F5)
3. **Ouvrir la console** (F12)
4. **Créer une table Flowise** avec un mot-clé
5. **Chercher** "📄 HTML BRUT COMPLET ENVOYÉ À N8N"
6. **Copier** le HTML complet affiché

## 📝 Test avec curl

Vous pouvez maintenant copier le HTML complet et le tester directement avec curl :

```bash
curl -X POST "https://barow52161.app.n8n.cloud/webhook/htlm_processor" \
  -H "Content-Type: application/json" \
  -d '{"question":"<table>... VOTRE HTML COPIÉ ICI ...</table>"}'
```

## ✅ Résultat

Avec ce nouveau log, vous avez maintenant :
- ✅ Le HTML brut COMPLET sans troncature
- ✅ La liste de toutes les tables envoyées
- ✅ La possibilité de copier et tester le HTML
- ✅ Un diagnostic complet de ce qui est envoyé à n8n

---

**Version** : 17.2  
**Date** : 2025-12-06  
**Statut** : ✅ Log ajouté et fonctionnel  
**Emplacement** : Fonction `queryN8nEndpoint()` dans Flowise.js
