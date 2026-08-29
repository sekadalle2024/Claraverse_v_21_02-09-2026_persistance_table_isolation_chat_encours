# 📑 INDEX - CORRECTION "FAILED TO FETCH" XREF
## Date: 30 avril 2026

---

## 🎯 OBJECTIF
Résoudre l'erreur "failed to fetch" lors de l'appel au workflow n8n pour afficher les documents de cross-référence documentaire.

---

## 📋 FICHIERS DE LA SESSION

### 1. Diagnostic
- **00_DIAGNOSTIC_FAILED_TO_FETCH_XREF_30_AVRIL_2026.txt**
  - Analyse complète de l'erreur
  - Causes possibles identifiées
  - Vérifications à effectuer

### 2. Solution Complète
- **00_SOLUTION_COMPLETE_FAILED_TO_FETCH_30_AVRIL_2026.txt**
  - Solution recommandée avec HTTP Request
  - Configuration détaillée
  - Étapes de mise en œuvre

### 3. Quick Start
- **QUICK_START_CORRECTION_FAILED_TO_FETCH_30_AVRIL_2026.txt**
  - Actions immédiates (5 minutes)
  - Commandes à exécuter
  - Dépannage rapide

### 4. Index (ce fichier)
- **00_INDEX_CORRECTION_FAILED_TO_FETCH_30_AVRIL_2026.md**
  - Vue d'ensemble de la session
  - Organisation des fichiers

---

## 🔍 PROBLÈME IDENTIFIÉ

**Erreur:** "failed to fetch"

**Contexte:**
- Document testé: [I30]-AFRILAND
- Endpoint: https://n8nsqlite.zeabur.app/webhook/cross_reference
- Workflow: Cross Reference - Ouvrir Document

**Causes possibles:**
1. Problème CORS
2. Credentials Google Drive manquants/incorrects
3. Configuration workflow incorrecte
4. Timeout
5. Endpoint inactif

---

## ✅ SOLUTION RECOMMANDÉE

**Approche:** Utiliser HTTP Request avec l'API REST de Google Drive

**Avantages:**
- Plus de contrôle sur les requêtes
- Meilleure gestion des erreurs
- Pas de problème avec les opérations manquantes
- Headers CORS configurables

**Workflow:**
1. Webhook OPTIONS (preflight CORS)
2. Webhook POST (reçoit la requête)
3. HTTP Request - Rechercher Dossier CAC
4. HTTP Request - Rechercher Fichier
5. Code - Formater la réponse
6. Respond to Webhook

---

## 🧪 TESTS

### Script de test
```powershell
.\test-workflow-afficher-xref.ps1
```

### Test manuel avec curl
```powershell
curl -X POST "https://n8nsqlite.zeabur.app/webhook/cross_reference" `
  -H "Content-Type: application/json" `
  -d '{"index":"[I30]-AFRILAND","dossier":"Dossier CAC"}'
```

### Résultat attendu
```json
{
  "success": true,
  "file": {
    "id": "...",
    "name": "[I30]-AFRILAND.pdf",
    "webViewLink": "https://drive.google.com/file/d/...",
    ...
  }
}
```

---

## 📊 ARCHITECTURE

### Frontend Claraverse
```
Table [Cross references- documentaire]
  ↓
Menu contextuel (menu.js)
  ↓
Action "Afficher"
  ↓
Appel API vers n8n
  ↓
Affichage dans barre latérale React
```

### Workflow n8n
```
Webhook POST
  ↓
Rechercher "Dossier CAC" dans Google Drive
  ↓
Rechercher fichier avec index dans le dossier
  ↓
Formater la réponse
  ↓
Retourner les métadonnées
```

---

## 🔧 CONFIGURATION REQUISE

### Google Drive OAuth2
- **Client ID:** [VOTRE_GOOGLE_CLIENT_ID]
- **Client Secret:** [VOTRE_GOOGLE_CLIENT_SECRET]
- **Scope:** https://www.googleapis.com/auth/drive
- **Access Type:** offline

### Headers CORS
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept"
}
```

---

## 📝 PROCHAINES ÉTAPES

1. ✓ Exécuter le script de test
2. ✓ Analyser les logs d'erreur
3. ✓ Appliquer la solution HTTP Request
4. ✓ Tester avec [I30]-AFRILAND
5. ✓ Intégrer au frontend Claraverse
6. ✓ Créer le composant React pour la barre latérale

---

## 📞 SUPPORT

**Fichiers de référence:**
- Doc cross ref documentaire menu/workflow_n8n_ouvrir_xref_HTTP_REQUEST.json
- Doc cross ref documentaire menu/GUIDE_CONFIGURATION_N8N_AVEC_CREDENTIALS_28_AVRIL_2026.md
- test-workflow-afficher-xref.ps1

**Logs à vérifier:**
- n8n: Executions > Voir les erreurs
- Frontend: Console navigateur (F12)
- Frontend: Network tab (F12)

---

## 🎉 RÉSULTAT ATTENDU

Une fois corrigé:
- ✓ Le frontend peut rechercher n'importe quel document via son index
- ✓ Les métadonnées du document sont retournées
- ✓ Le document s'affiche dans une barre latérale React
- ✓ L'utilisateur peut fermer la barre latérale
- ✓ L'intégration avec Google Drive est complète
