# 🚀 Guide d'Extension : Ajouter d'autres Endpoints avec Upload Automatique

## 🎯 Objectif

Ce guide explique comment réutiliser l'architecture Lead Balance pour ajouter d'autres fonctionnalités avec upload automatique de fichiers vers des endpoints backend Python.

## 📋 Architecture Générique

### Principe

```
User: "Mot_clé"
    ↓
claraApiService.ts détecte et génère table
    ↓
Script JS détecte automatiquement la table
    ↓
Dialogue de sélection s'ouvre AUTOMATIQUEMENT
    ↓
Upload et traitement automatique
    ↓
Résultats affichés
```

### Composants

1. **claraApiService.ts** : Génère la table déclencheuse
2. **Script JS** : Détecte et traite automatiquement
3. **Backend Python** : Traite le fichier et retourne les résultats

## 🔧 Étapes pour ajouter un nouveau endpoint

### Exemple : Analyse de Fraude

#### Étape 1 : Ajouter dans claraApiService.ts

```typescript
// 1. Ajouter la sentinelle
private readonly SENTINEL_ANALYSE_FRAUDE = "__INTERNAL__ANALYSE_FRAUDE__";

// 2. Ajouter le case dans getN8nEndpoint()
else if (msg.includes("Analyse_fraude")) {
  routeKey = "analyse_fraude";
}

switch (routeKey) {
  // ... autres cases ...
  
  case "analyse_fraude":
    console.log("🔀 Router → Case 24 : analyse_fraude");
    return this.SENTINEL_ANALYSE_FRAUDE;
}

// 3. Ajouter la logique dans sendChatMessage()
if (resolvedEndpoint === this.SENTINEL_ANALYSE_FRAUDE) {
  console.log("🔍 [Analyse Fraude] Génération table avec déclenchement automatique");
  
  const initialContent =
    "| Analyse_fraude |\n" +
    "|---------------|\n" +
    "| ⏳ Sélection du fichier en cours... |";
  
  return {
    id: `${Date.now()}-analyse-fraude`,
    role: "assistant",
    content: initialContent,
    timestamp: new Date(),
    metadata: { 
      model: "local",
      type: "auto_trigger_upload",
      trigger_type: "analyse_fraude",
      endpoint: "http://127.0.0.1:5000/fraud-detection/analyze",
      acceptedFormats: [".xlsx", ".xls", ".csv"],
      autoTrigger: true
    },
  };
}
```

#### Étape 2 : Créer le script JS (AnalyseFraudeAutoTrigger.js)

```javascript
/**
 * AnalyseFraudeAutoTrigger.js
 * Détecte automatiquement les tables Analyse_fraude
 */

(function () {
  "use strict";

  const CONFIG = {
    ANALYSE_FRAUDE: {
      triggerHeader: "Analyse_fraude",
      endpoint: "http://127.0.0.1:5000/fraud-detection/analyze",
      acceptedFormats: [".xlsx", ".xls", ".csv"],
      maxFileSize: 50 * 1024 * 1024, // 50 MB
      description: "Analyse de Fraude"
    },
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    },
    PROCESSED_ATTR: "data-analyse-fraude-processed"
  };

  // Fonctions utilitaires (identiques à LeadBalanceAutoTrigger.js)
  function showNotification(message, type = "success") { /* ... */ }
  function isAnalyseFraudeTable(table) {
    const headers = Array.from(table.querySelectorAll("th"))
      .map(th => th.textContent.trim());
    return headers.includes(CONFIG.ANALYSE_FRAUDE.triggerHeader);
  }
  function openFileDialog() { /* ... */ }
  function readFileAsBase64(file) { /* ... */ }
  function updateTableContent(table, message) { /* ... */ }
  
  async function sendToBackend(file) {
    const fileBase64 = await readFileAsBase64(file);
    
    const response = await fetch(CONFIG.ANALYSE_FRAUDE.endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        file_base64: fileBase64,
        filename: file.name
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  function replaceTableWithResults(table, result) {
    const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (!parentDiv) return false;

    // Créer le HTML des résultats
    let html = '<div class="analyse-fraude-results">';
    html += '<h3>🔍 Résultats Analyse de Fraude</h3>';
    
    // Afficher les tables de résultats
    if (result.tables && Array.isArray(result.tables)) {
      result.tables.forEach(tableData => {
        html += createTableHTML(tableData);
      });
    }
    
    html += '</div>';

    parentDiv.innerHTML = html;
    return true;
  }

  async function processAnalyseFraudeTable(table) {
    if (table.getAttribute(CONFIG.PROCESSED_ATTR)) return;

    try {
      table.setAttribute(CONFIG.PROCESSED_ATTR, 'processing');
      updateTableContent(table, '📂 Sélectionnez votre fichier...');

      const file = await openFileDialog();
      if (!file) {
        updateTableContent(table, '❌ Sélection annulée');
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        return;
      }

      // Vérifications
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!CONFIG.ANALYSE_FRAUDE.acceptedFormats.includes(ext)) {
        showNotification('⚠️ Format non supporté', 'error');
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        return;
      }

      updateTableContent(table, `🔍 Analyse de ${file.name} en cours...`);
      showNotification(`🔍 Analyse de ${file.name}...`, 'info');

      const result = await sendToBackend(file);

      if (result.success) {
        replaceTableWithResults(table, result);
        showNotification('✅ Analyse terminée!', 'success');
        table.setAttribute(CONFIG.PROCESSED_ATTR, 'completed');
      }

    } catch (error) {
      console.error("❌ Erreur:", error);
      showNotification(`❌ Erreur: ${error.message}`, 'error');
      table.removeAttribute(CONFIG.PROCESSED_ATTR);
    }
  }

  // Scan et détection
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
    allTables.forEach((table) => {
      if (isAnalyseFraudeTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
        processAnalyseFraudeTable(table);
      }
    });
  }

  function setupMutationObserver() {
    const observer = new MutationObserver(() => {
      setTimeout(scanAndProcess, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Initialisation
  function init() {
    setupMutationObserver();
    setTimeout(scanAndProcess, 2000);
    setInterval(scanAndProcess, 3000);
    console.log("✅ AnalyseFraudeAutoTrigger initialisé");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
```

#### Étape 3 : Charger le script dans index.html

```html
<!-- Dans index.html -->
<script src="/AnalyseFraudeAutoTrigger.js"></script>
```

#### Étape 4 : Créer l'endpoint backend Python

```python
# Dans py_backend/app.py ou un fichier dédié

from flask import Flask, request, jsonify
import base64
import pandas as pd
from io import BytesIO

@app.route('/fraud-detection/analyze', methods=['POST'])
def analyze_fraud():
    try:
        data = request.json
        file_base64 = data.get('file_base64')
        filename = data.get('filename')
        
        # Décoder le fichier
        file_bytes = base64.b64decode(file_base64)
        
        # Lire avec pandas
        if filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(file_bytes))
        else:
            df = pd.read_excel(BytesIO(file_bytes))
        
        # Analyse de fraude
        results = perform_fraud_analysis(df)
        
        # Générer le HTML des résultats
        html = generate_fraud_results_html(results)
        
        return jsonify({
            'success': True,
            'message': 'Analyse de fraude terminée',
            'html': html,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

def perform_fraud_analysis(df):
    # Logique d'analyse de fraude
    results = {
        'duplicates': find_duplicates(df),
        'gaps': find_gaps(df),
        'outliers': find_outliers(df)
    }
    return results

def generate_fraud_results_html(results):
    # Générer le HTML
    html = '<div class="fraud-results">'
    html += '<h4>🔍 Doublons détectés</h4>'
    html += create_table_html(results['duplicates'])
    html += '<h4>📊 Trous de séquence</h4>'
    html += create_table_html(results['gaps'])
    html += '<h4>⚠️ Valeurs aberrantes</h4>'
    html += create_table_html(results['outliers'])
    html += '</div>'
    return html
```

## 📊 Template Générique

### Script JS Template

```javascript
/**
 * [NOM]AutoTrigger.js
 * Template générique pour upload automatique
 */

(function () {
  "use strict";

  const CONFIG = {
    [NOM_MAJUSCULE]: {
      triggerHeader: "[Nom_table]",
      endpoint: "http://127.0.0.1:5000/[endpoint]",
      acceptedFormats: [".xlsx", ".xls"],
      maxFileSize: 10 * 1024 * 1024,
      description: "[Description]"
    },
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    },
    PROCESSED_ATTR: "data-[nom]-processed"
  };

  // Copier les fonctions de LeadBalanceAutoTrigger.js
  // et adapter les noms

  function init() {
    setupMutationObserver();
    setTimeout(scanAndProcess, 2000);
    setInterval(scanAndProcess, 3000);
    console.log("✅ [NOM]AutoTrigger initialisé");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
```

### Backend Python Template

```python
@app.route('/[endpoint]', methods=['POST'])
def [fonction]():
    try:
        data = request.json
        file_base64 = data.get('file_base64')
        filename = data.get('filename')
        
        # Décoder et lire le fichier
        file_bytes = base64.b64decode(file_base64)
        df = pd.read_excel(BytesIO(file_bytes))
        
        # Traitement
        results = process_data(df)
        
        # Générer HTML
        html = generate_html(results)
        
        return jsonify({
            'success': True,
            'message': 'Traitement terminé',
            'html': html,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
```

## 📋 Checklist d'ajout d'un nouveau endpoint

### Dans claraApiService.ts
- [ ] Ajouter la sentinelle `SENTINEL_[NOM]`
- [ ] Ajouter le case dans le router
- [ ] Ajouter la condition dans sendChatMessage()
- [ ] Définir l'entête de table
- [ ] Définir l'endpoint backend
- [ ] Définir les formats acceptés

### Script JS
- [ ] Créer [Nom]AutoTrigger.js
- [ ] Configurer CONFIG
- [ ] Adapter les fonctions
- [ ] Tester la détection
- [ ] Charger dans index.html

### Backend Python
- [ ] Créer l'endpoint
- [ ] Implémenter la logique
- [ ] Générer le HTML de résultats
- [ ] Tester avec Postman/curl

### Tests
- [ ] Tester la commande
- [ ] Tester la détection automatique
- [ ] Tester l'upload
- [ ] Tester le traitement
- [ ] Tester l'affichage

## 🎯 Exemples d'endpoints à ajouter

### 1. États Financiers SYSCOHADA
- **Commande** : `Etats_financiers`
- **Endpoint** : `/financial-statements/generate`
- **Formats** : `.xlsx`, `.xls`
- **Résultat** : Bilan, Compte de résultat, etc.

### 2. Échantillonnage Audit
- **Commande** : `Echantillonnage`
- **Endpoint** : `/audit-sampling/generate`
- **Formats** : `.xlsx`, `.xls`, `.csv`
- **Résultat** : Liste des éléments échantillonnés

### 3. Rapprochement Bancaire
- **Commande** : `Rapprochement_bancaire`
- **Endpoint** : `/bank-reconciliation/process`
- **Formats** : `.xlsx`, `.xls`, `.csv`
- **Résultat** : Écarts identifiés

### 4. Analyse ABC
- **Commande** : `Analyse_ABC`
- **Endpoint** : `/abc-analysis/classify`
- **Formats** : `.xlsx`, `.xls`, `.csv`
- **Résultat** : Classification A/B/C

## ✅ Avantages de cette architecture

1. **Réutilisable** : Template générique facile à adapter
2. **Automatique** : Aucune interaction manuelle après la commande
3. **Extensible** : Facile d'ajouter de nouveaux endpoints
4. **Maintenable** : Code organisé et documenté
5. **Cohérent** : Même expérience pour tous les traitements

## 📚 Ressources

- **LeadBalanceAutoTrigger.js** : Script de référence
- **claraApiService.ts** : Service principal
- **Data.js** : Exemple de détection automatique
- **menu.js** : Fonctions utilitaires

---

**Version** : 1.0  
**Date** : 22 Mars 2026  
**Statut** : ✅ Guide complet
