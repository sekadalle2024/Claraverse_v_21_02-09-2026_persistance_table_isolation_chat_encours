# Différence entre "Ouvrir X-Ref documentaire" et "Afficher X-Ref documentaire"

**Date:** 28 avril 2026  
**Contexte:** Menu contextuel - Section Papier de travail  
**Endpoint n8n:** https://n8nsqlite.zeabur.app/webhook/cross_reference

---

## 📋 Vue d'ensemble

Deux actions distinctes sont disponibles dans le menu contextuel pour gérer les Cross references documentaires :

1. **📂 Ouvrir X-Ref documentaire** (Ctrl+Shift+O)
2. **📋 Afficher X-Ref documentaire**

---

## 🔍 Différences clés

### 📂 **Ouvrir X-Ref documentaire**

**Objectif:** Ouvrir UN document spécifique depuis Google Drive

**Fonctionnement:**
1. ✅ Nécessite qu'une **ligne soit sélectionnée** dans la table X-Ref
2. 🔍 Lit les valeurs des colonnes "Cross references" et "Document" de la ligne active
3. 🏗️ Construit le nom du fichier selon la structure: `[Cross references]-[Document]`
   - Exemple: `[I150]-Balances generale`
4. 🌐 Envoie une requête au **workflow n8n** pour rechercher le fichier dans Google Drive
5. 📂 Ouvre le document dans une **barre latérale droite**

**Cas d'usage:**
- Vous êtes sur une ligne spécifique de la table X-Ref
- Vous voulez ouvrir LE document référencé dans cette ligne
- Action ciblée sur UN document précis

**Raccourci:** `Ctrl+Shift+O`

---

### 📋 **Afficher X-Ref documentaire**

**Objectif:** Afficher TOUTE la table X-Ref dans une barre latérale

**Fonctionnement:**
1. 🔍 Recherche automatiquement la table X-Ref dans le chat
2. ✅ Identifie la table contenant les colonnes "Cross references" et "Document"
3. 📊 Extrait TOUTES les données de la table
4. 📋 Affiche la liste complète dans une **barre latérale**
5. 🎯 Permet de naviguer dans tous les documents référencés

**Cas d'usage:**
- Vous voulez voir la liste complète des documents référencés
- Vous voulez naviguer dans l'ensemble des X-Ref
- Vue d'ensemble de tous les documents du dossier

**Raccourci:** Aucun

---

## 📊 Tableau comparatif

| Critère | 📂 Ouvrir X-Ref | 📋 Afficher X-Ref |
|---------|----------------|-------------------|
| **Sélection ligne** | ✅ Obligatoire | ❌ Non nécessaire |
| **Scope** | 1 document | Tous les documents |
| **Workflow n8n** | ✅ Oui | ❌ Non |
| **Google Drive** | ✅ Recherche fichier | ❌ Non |
| **Barre latérale** | Document unique | Liste complète |
| **Raccourci** | Ctrl+Shift+O | Aucun |

---

## 🎯 Exemples d'utilisation

### Exemple 1: Afficher puis Ouvrir

```
1. Clic droit sur la table X-Ref
2. "📋 Afficher X-Ref documentaire"
   → Barre latérale s'ouvre avec la liste complète
   
3. Clic sur une ligne de la table
4. "📂 Ouvrir X-Ref documentaire"
   → Le document spécifique s'ouvre depuis Google Drive
```

### Exemple 2: Ouvrir directement

```
1. Clic sur la ligne "[I150] Balances generale"
2. Clic droit
3. "📂 Ouvrir X-Ref documentaire"
   → Recherche "[I150]-Balances generale" dans Google Drive
   → Affiche le document dans la barre latérale
```

---

## 🔧 Structure de la table X-Ref

Pour que les deux actions fonctionnent, la table doit contenir:

| Cross references | Document |
|-----------------|----------|
| [I1] | Lead sheet trésorerie |
| [I20] | Proces verbal inventaire de caisse |
| [I150] | Balances generale |

**Colonnes obligatoires:**
- ✅ "Cross references" (ou variantes: X-Ref, XRef, Cross-Ref)
- ✅ "Document" (ou variante: Doc)

---

## 🌐 Workflow n8n (Ouvrir uniquement)

**Endpoint:** `https://n8nsqlite.zeabur.app/webhook/cross_reference`

**Requête:**
```json
{
  "question": "[index] = [I150]-Balances generale",
  "dossier": "Dossier CAC"
}
```

**Exemple curl:**
```bash
curl -X POST "https://n8nsqlite.zeabur.app/webhook/cross_reference" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "[index] = [I150]-Balances generale",
    "dossier": "Dossier CAC"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "file": {
    "fileId": "1abc...",
    "fileName": "[I150]-Balances generale",
    "fileUrl": "https://drive.google.com/file/d/...",
    "mimeType": "application/pdf"
  }
}
```

---

## 💡 Recommandations

### Quand utiliser "Afficher" ?
- ✅ Première consultation du dossier
- ✅ Vue d'ensemble des documents disponibles
- ✅ Navigation dans la liste complète

### Quand utiliser "Ouvrir" ?
- ✅ Accès rapide à un document spécifique
- ✅ Vous connaissez déjà le document recherché
- ✅ Workflow de travail ciblé

---

## 🚀 Workflow recommandé

```
1. "📋 Afficher X-Ref documentaire"
   → Voir la liste complète des documents

2. Identifier le document recherché dans la liste

3. Cliquer sur la ligne correspondante

4. "📂 Ouvrir X-Ref documentaire"
   → Ouvrir le document depuis Google Drive

5. Travailler avec le document dans la barre latérale
```

---

## 🔍 Action bonus: Rechercher document

Une troisième action existe: **🔍 Rechercher document**

**Fonctionnement:**
- Demande un terme de recherche (index ou nom)
- Recherche dans la table X-Ref
- Affiche les résultats filtrés dans la barre latérale

**Exemples de recherche:**
- `I20` → Trouve tous les documents avec I20
- `inventaire` → Trouve tous les documents contenant "inventaire"
- `Lead sheet` → Trouve tous les Lead sheets

---

## 📝 Résumé ultra-rapide

| Action | En 1 phrase |
|--------|-------------|
| **📋 Afficher** | Affiche la liste complète des X-Ref dans une barre latérale |
| **📂 Ouvrir** | Ouvre le document de la ligne sélectionnée depuis Google Drive |
| **🔍 Rechercher** | Filtre et affiche les X-Ref correspondant à un terme |

---

## ✅ Points clés à retenir

1. **"Afficher"** = Vue d'ensemble (pas de Google Drive)
2. **"Ouvrir"** = Document spécifique (avec Google Drive)
3. Les deux utilisent une barre latérale droite
4. "Ouvrir" nécessite une ligne sélectionnée
5. "Afficher" fonctionne sans sélection

---

**Auteur:** Kiro AI Assistant  
**Version:** 1.0  
**Dernière mise à jour:** 28 avril 2026
