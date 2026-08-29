# 🔍 DIAGNOSTIC - Workflow Upload Google Drive - 13 Avril 2026

## ❌ PROBLÈME IDENTIFIÉ

Le workflow n'active pas le sous-workflow d'upload, que le dossier client existe ou non.

### Analyse du Workflow Actuel

```
Form → Find Dossier CAC → Find Client Folder → IF (Client Exists?)
                                                   ├─ TRUE → Find Cycle Folder → Merge
                                                   └─ FALSE → Create Client → Generate Cycles → Create Cycles → Filter → Merge
                                                   
Merge → Prepare Upload → Upload File
```

## 🐛 BUGS IDENTIFIÉS

### 1. **Problème dans les Query Parameters**

```javascript
// ❌ INCORRECT - Syntaxe invalide
"queryParameters": {
  "parameters": [
    {
      "name": "q",
      "value": "=name='{{ $('Cross references Form1').first().json.Client.trim() }}-{{ $('Cross references Form1').first().json.Exercice.toString().trim() }}' and '{{ $json.files[0].id }}' in parents and trashed=false"
    }
  ]
}
```

**Problèmes:**
- Le `=` au début de la value est incorrect
- Les guillemets simples dans la query Google Drive sont mal échappés
- La syntaxe n8n pour accéder aux données est incorrecte

### 2. **Problème dans le Node "Prepare Upload Data"**

```javascript
// ❌ INCORRECT - Backticks mal utilisés
const fileName = [${crossRef}]-${docName};
```

**Problème:** Les backticks sont manquants autour de la template string

### 3. **Problème dans le Node "Upload File to Drive"**

Le node HTTP Request pour l'upload multipart n'est pas correctement configuré:
- Les métadonnées doivent être en JSON
- Le fichier binaire doit être correctement référencé
- Les headers multipart doivent être gérés automatiquement

### 4. **Problème de Flux Logique**

Le node "Merge Branches" ne reçoit peut-être pas les données correctement des deux branches.

## ✅ SOLUTIONS

### Solution 1: Corriger les Query Parameters

```javascript
// ✅ CORRECT
"queryParameters": {
  "parameters": [
    {
      "name": "q",
      "value": "={{ \"name='\" + $('Cross references Form1').first().json.Client.trim() + \"-\" + $('Cross references Form1').first().json.Exercice.toString().trim() + \"' and '\" + $json.files[0].id + \"' in parents and trashed=false\" }}"
    }
  ]
}
```

### Solution 2: Corriger le Code JavaScript

```javascript
// ✅ CORRECT
const crossRef = $('Cross references Form1').first().json['Cross référence'];
const docName = $('Cross references Form1').first().json.Document;
const fileName = `[${crossRef}]-${docName}`;
```

### Solution 3: Utiliser les Nodes Google Drive Natifs

Au lieu d'utiliser HTTP Request, utiliser les nodes Google Drive natifs de n8n qui gèrent automatiquement:
- L'authentification OAuth2
- Les requêtes API
- L'upload de fichiers

## 🎯 RECOMMANDATION FINALE

**Utiliser les nodes Google Drive natifs** au lieu de HTTP Request pour:
1. ✅ Éviter les problèmes de compatibilité
2. ✅ Simplifier la configuration
3. ✅ Avoir une meilleure gestion des erreurs
4. ✅ Bénéficier des mises à jour n8n

## 📋 PROCHAINES ÉTAPES

1. Créer un workflow corrigé avec nodes Google Drive natifs
2. Tester chaque étape individuellement
3. Valider le flux complet
