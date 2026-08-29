# 📊 ANALYSE DES LOGIQUES FLOWISE.JS

## Situation Actuelle

Vous avez **2 fichiers Flowise.js** identiques sauf pour l'endpoint:

### 📁 Fichier 1: `Flowise.js` (RACINE) - ACTUELLEMENT UTILISÉ
- **Version:** V17.1
- **Endpoint:** `https://barow52161.app.n8n.cloud/webhook/htlm_processor` (n8n Cloud)
- **Chargé par:** `index.html` ligne 49

### 📁 Fichier 2: `public/Flowise.js`
- **Version:** V17.1
- **Endpoint:** `http://localhost:5678/webhook/htlm_processor` (n8n Local)
- **Status:** Non utilisé

## 🔍 Logique de Collecte V17.1 (Actuelle)

### Principe de Fonctionnement

**ÉTAPE 1: Détection de la Table Flowise**
```
1. MutationObserver détecte une nouvelle table
2. Vérifie si elle a un en-tête "Flowise"
3. Extrait le mot-clé de la première cellule
```

**ÉTAPE 2: Collecte des Tables Critères**
```
1. Parcourt TOUTES les divs .prose
2. Pour chaque div:
   a. Regarde la PREMIÈRE table
   b. Vérifie si elle a "Rubrique" + "Description"
   c. Cherche le mot-clé dans TOUTES les cellules de cette première table
   d. Si trouvé → Collecte TOUTES les tables de cette div
```

**ÉTAPE 3: Envoi à n8n**
```
1. Consolide toutes les tables HTML
2. Ajoute la table Flowise
3. Ajoute la table user_message (si présente)
4. Envoie à n8n
```

### Code Clé de la Logique V17.1

```javascript
function collectCriteriaTables(dynamicKeyword, triggerTable, userMessageTableHTML) {
  const allDivs = document.querySelectorAll("div.prose");
  const collectedTablesHTML = [];
  
  allDivs.forEach((div) => {
    const firstTable = div.querySelector("table");
    
    // Vérifier si la PREMIÈRE table a Rubrique + Description
    const headers = Array.from(firstTable.querySelectorAll("th"))
      .map(th => th.textContent.trim().toLowerCase());
    
    const hasRubrique = headers.includes("rubrique");
    const hasDescription = headers.includes("description");
    
    if (!hasRubrique || !hasDescription) {
      return; // Ignorer cette div
    }
    
    // Chercher le mot-clé dans TOUTES les cellules de la première table
    const cells = firstTable.querySelectorAll("td");
    const keywordFound = Array.from(cells).some(cell => 
      cell.textContent.toLowerCase().includes(dynamicKeyword.toLowerCase())
    );
    
    if (keywordFound) {
      // Collecter TOUTES les tables de cette div
      const allTablesInDiv = div.querySelectorAll("table");
      allTablesInDiv.forEach(table => {
        collectedTablesHTML.push(table.outerHTML);
      });
    }
  });
  
  return collectedTablesHTML.join("\n");
}
```

## 🆕 Logique V18.0 (Mentionnée dans le Contexte)

D'après le contexte de la conversation précédente, la V18.0 devait implémenter:

**Changement Principal:**
- Chercher le mot-clé dans **TOUTES les lignes** de la colonne "Description"
- Pas seulement dans la première ligne

### Code V18.0 (Théorique)

```javascript
function collectCriteriaTables(dynamicKeyword, triggerTable, userMessageTableHTML) {
  const allTables = document.querySelectorAll("table");
  const collectedTablesHTML = [];
  
  allTables.forEach((table) => {
    const headers = Array.from(table.querySelectorAll("th"))
      .map(th => th.textContent.trim().toLowerCase());
    
    const hasRubrique = headers.includes("rubrique");
    const hasDescription = headers.includes("description");
    
    if (!hasRubrique || !hasDescription) {
      return; // Pas une table Rubrique+Description
    }
    
    // Trouver l'index de la colonne Description
    const descriptionIndex = headers.indexOf("description");
    
    // Parcourir TOUTES les lignes de données
    const allRows = table.querySelectorAll("tbody tr");
    let keywordFound = false;
    
    for (const row of allRows) {
      const cells = row.querySelectorAll("td");
      if (cells[descriptionIndex]) {
        const descriptionText = cells[descriptionIndex].textContent.trim();
        if (descriptionText.toLowerCase().includes(dynamicKeyword.toLowerCase())) {
          keywordFound = true;
          break;
        }
      }
    }
    
    if (keywordFound) {
      collectedTablesHTML.push(table.outerHTML);
    }
  });
  
  return collectedTablesHTML.join("\n");
}
```

## 📊 Comparaison V17.1 vs V18.0

| Aspect | V17.1 (Actuelle) | V18.0 (Proposée) |
|--------|------------------|------------------|
| **Scope** | Divs .prose | Toutes les tables |
| **Critère** | Première table de la div | Chaque table individuellement |
| **Recherche mot-clé** | Toutes cellules de la première table | Toutes lignes de la colonne Description |
| **Collecte** | Toutes tables de la div si match | Table individuelle si match |
| **Précision** | Moins précise (collecte tout) | Plus précise (collecte ciblée) |

## 🎯 Problème Actuel

D'après votre description:
> "Le script de flowise.js semble ne plus fonctionner car nous avons dû confondre les fichiers au cours des mises à jour"

**Diagnostic:**
1. ✅ Le fichier est chargé (diagnostic confirmé)
2. ✅ Les tables sont détectées (diagnostic confirmé)
3. ✅ La table Flowise est trouvée (diagnostic confirmé)
4. ✅ Le mot-clé est extrait (diagnostic confirmé)
5. ✅ Les tables correspondantes sont trouvées (diagnostic confirmé)
6. ❌ **n8n Cloud répond vide** ← VRAI PROBLÈME

**Conclusion:**
Le script Flowise.js fonctionne correctement! Le problème est dans la configuration n8n Cloud.

## 🔧 Solution

### Option A: Garder V17.1 et Fixer n8n Cloud (Recommandé)

**Avantages:**
- Logique éprouvée et fonctionnelle
- Pas de risque de régression
- Juste un problème de configuration n8n

**Actions:**
1. Aller sur https://barow52161.app.n8n.cloud
2. Ouvrir workflow "htlm_processor"
3. Node "Respond to Webhook" → "First Incoming Item"
4. Tester

### Option B: Implémenter V18.0

**Avantages:**
- Recherche plus précise dans la colonne Description
- Collecte ciblée (pas toute la div)

**Inconvénients:**
- Nécessite réécriture de la fonction
- Risque de bugs
- Temps de développement

**Recommandation:** Garder V17.1 et fixer n8n Cloud d'abord

## 📝 Résumé des Logiques

### V17.1 - Logique par DIV
```
Pour chaque div .prose:
  ├─ Regarder la première table
  ├─ A-t-elle Rubrique + Description?
  │  ├─ OUI: Chercher mot-clé dans toutes ses cellules
  │  │  ├─ TROUVÉ: Collecter TOUTES les tables de cette div
  │  │  └─ PAS TROUVÉ: Ignorer cette div
  │  └─ NON: Ignorer cette div
```

### V18.0 - Logique par TABLE
```
Pour chaque table du document:
  ├─ A-t-elle Rubrique + Description?
  │  ├─ OUI: Chercher mot-clé dans TOUTES les lignes de Description
  │  │  ├─ TROUVÉ: Collecter CETTE table
  │  │  └─ PAS TROUVÉ: Ignorer cette table
  │  └─ NON: Ignorer cette table
```

## 🎯 Recommandation Finale

**1. Garder la logique V17.1 actuelle**
   - Elle fonctionne correctement
   - Le diagnostic l'a confirmé

**2. Fixer n8n Cloud**
   - C'est le vrai problème
   - Configuration "Respond to Webhook"

**3. Si besoin de V18.0 plus tard**
   - Implémenter après avoir résolu n8n
   - Tester en parallèle
   - Comparer les résultats

## 📋 Checklist de Vérification

- [ ] Flowise.js (racine) est chargé ✅
- [ ] Endpoint pointe vers n8n Cloud ✅
- [ ] Table Flowise détectée ✅
- [ ] Mot-clé extrait ✅
- [ ] Tables correspondantes trouvées ✅
- [ ] HTML consolidé généré ✅
- [ ] Envoi à n8n réussit (Status 200) ✅
- [ ] **n8n Cloud retourne des données** ❌ ← À FIXER

## 🆘 Action Immédiate

**Ne pas modifier Flowise.js!**

Le problème n'est PAS dans le script, mais dans n8n Cloud.

**Action:**
1. Ouvrir https://barow52161.app.n8n.cloud
2. Workflow "htlm_processor"
3. Node "Respond to Webhook"
4. Changer: "Respond With" = "First Incoming Item"
5. Sauvegarder
6. Tester

Une fois n8n Cloud configuré, tout fonctionnera!
