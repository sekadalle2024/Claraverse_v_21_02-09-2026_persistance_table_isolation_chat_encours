# 🏗️ Architecture Automatique : Upload de Fichier et Traitement Backend

## 🎯 Objectif

Créer une architecture générique permettant de :
1. Détecter automatiquement une table déclencheuse dans le chat
2. Ouvrir automatiquement un dialogue de sélection de fichier
3. Envoyer le fichier vers un endpoint backend Python
4. Remplacer la table avec les résultats traités

## 🔄 Flux Automatique (Sans clic droit)

```
User: "Lead_balance"
    ↓
claraApiService génère table "Lead_balance"
    ↓
Table rendue dans le chat
    ↓
Script JS détecte automatiquement la table
    ↓
Dialogue de sélection s'ouvre AUTOMATIQUEMENT
    ↓
User sélectionne le fichier
    ↓
Upload et traitement automatique
    ↓
Résultats remplacent la table
    ↓
✅ Terminé
```

## 📋 Comparaison des approches

### ❌ Approche actuelle (avec clic droit)
```
1. User: "Lead_balance"
2. Table apparaît
3. User: Clic droit sur la table
4. User: Sélectionne "Lead Balance" dans le menu
5. Dialogue s'ouvre
6. User: Sélectionne fichier
7. Traitement
```
**Problème** : Trop d'étapes manuelles

### ✅ Approche automatique (recommandée)
```
1. User: "Lead_balance"
2. Table apparaît
3. Dialogue s'ouvre AUTOMATIQUEMENT
4. User: Sélectionne fichier
5. Traitement automatique
```
**Avantage** : Workflow simplifié, 2 étapes au lieu de 7

## 🏗️ Architecture Générique

### 1. Structure des composants

```
claraApiService.ts (Front-end)
    ↓ Génère table déclencheuse
    ↓
AutoUploadHandler.js (Nouveau script)
    ↓ Détecte la table
    ↓ Ouvre dialogue automatiquement
    ↓ Envoie vers backend
    ↓
Backend Python (Endpoint)
    ↓ Traite le fichier
    ↓ Retourne résultats
    ↓
AutoUploadHandler.js
    ↓ Remplace la table
    ↓
✅ Résultats affichés
```

### 2. Configuration générique

```javascript
// Configuration pour chaque type de traitement
const AUTO_UPLOAD_CONFIG = {
  lead_balance: {
    triggerTableHeader: "Lead_balance",
    endpoint: "http://127.0.0.1:5000/lead-balance/process-excel",
    acceptedFormats: [".xlsx", ".xls"],
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    resultType: "html_accordions"
  },
  
  analyse_fraude: {
    triggerTableHeader: "Analyse_fraude",
    endpoint: "http://127.0.0.1:5000/fraud-detection/analyze",
    acceptedFormats: [".xlsx", ".xls", ".csv"],
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    resultType: "html_tables"
  },
  
  etats_financiers: {
    triggerTableHeader: "Etats_financiers",
    endpoint: "http://127.0.0.1:5000/financial-statements/generate",
    acceptedFormats: [".xlsx", ".xls"],
    maxFileSize: 10 * 1024 * 1024,
    resultType: "html_accordions"
  }
};
```

## 📝 Implémentation : AutoUploadHandler.js

### Structure du script

```javascript
/**
 * AutoUploadHandler.js
 * Gère automatiquement l'upload de fichiers et le traitement backend
 * pour les tables déclencheuses détectées dans le chat
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border.border-gray-200",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    },
    PROCESSED_CLASS: "auto-upload-processed",
    UPLOAD_CONFIGS: {
      // Configurations par type de table
    }
  };

  /**
   * Détecte si une table est une table déclencheuse
   */
  function isTriggerTable(table) {
    const headers = Array.from(table.querySelectorAll("th"))
      .map(th => th.textContent.trim());
    
    // Vérifier si l'entête correspond à une config
    for (const [key, config] of Object.entries(CONFIG.UPLOAD_CONFIGS)) {
      if (headers.includes(config.triggerTableHeader)) {
        return { isTrigger: true, type: key, config };
      }
    }
    
    return { isTrigger: false };
  }

  /**
   * Ouvre automatiquement le dialogue de sélection de fichier
   */
  function openFileDialog(config) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = config.acceptedFormats.join(',');
      input.style.display = 'none';

      input.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        document.body.removeChild(input);
        resolve(file || null);
      });

      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        resolve(null);
      });

      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Convertit un fichier en base64
   */
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erreur de lecture'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Envoie le fichier vers le backend
   */
  async function sendToBackend(file, config) {
    const fileBase64 = await readFileAsBase64(file);
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_base64: fileBase64,
        filename: file.name
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Remplace la table avec les résultats
   */
  function replaceTableWithResults(table, result, config) {
    const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (!parentDiv) return false;

    let resultHTML = '';
    
    if (config.resultType === 'html_accordions' && result.html) {
      resultHTML = result.html;
    } else if (config.resultType === 'html_tables' && result.tables) {
      resultHTML = result.tables.map(t => createTableHTML(t)).join('');
    }

    if (resultHTML) {
      parentDiv.innerHTML = resultHTML;
      return true;
    }
    
    return false;
  }

  /**
   * Traite une table déclencheuse
   */
  async function processTriggerTable(table, type, config) {
    if (table.classList.contains(CONFIG.PROCESSED_CLASS)) {
      return;
    }

    try {
      table.classList.add(CONFIG.PROCESSED_CLASS);

      // Ouvrir automatiquement le dialogue
      showNotification(`📂 Sélectionnez votre fichier ${config.triggerTableHeader}`, "info");
      
      const file = await openFileDialog(config);
      
      if (!file) {
        console.log(`❌ Sélection annulée pour ${type}`);
        table.classList.remove(CONFIG.PROCESSED_CLASS);
        return;
      }

      // Vérifier le format
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!config.acceptedFormats.includes(ext)) {
        showNotification(`⚠️ Format non supporté. Formats acceptés: ${config.acceptedFormats.join(', ')}`, "error");
        table.classList.remove(CONFIG.PROCESSED_CLASS);
        return;
      }

      // Vérifier la taille
      if (file.size > config.maxFileSize) {
        showNotification(`⚠️ Fichier trop volumineux (max: ${config.maxFileSize / 1024 / 1024} MB)`, "error");
        table.classList.remove(CONFIG.PROCESSED_CLASS);
        return;
      }

      showNotification(`📊 Traitement de ${file.name}...`, "info");

      // Envoyer vers le backend
      const result = await sendToBackend(file, config);

      // Remplacer la table
      if (result.success) {
        const replaced = replaceTableWithResults(table, result, config);
        if (replaced) {
          showNotification(`✅ ${result.message || "Traitement réussi!"}`, "success");
        }
      } else {
        throw new Error(result.message || "Erreur de traitement");
      }

    } catch (error) {
      console.error(`❌ Erreur ${type}:`, error);
      showNotification(`❌ Erreur: ${error.message}`, "error");
      table.classList.remove(CONFIG.PROCESSED_CLASS);
    }
  }

  /**
   * Scan et traite les tables
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
    
    allTables.forEach((table) => {
      const { isTrigger, type, config } = isTriggerTable(table);
      
      if (isTrigger && !table.classList.contains(CONFIG.PROCESSED_CLASS)) {
        console.log(`🎯 Table déclencheuse détectée: ${type}`);
        processTriggerTable(table, type, config);
      }
    });
  }

  // MutationObserver pour détecter les nouvelles tables
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "TABLE" || node.querySelector?.("table")) {
                shouldScan = true;
              }
            }
          });
        }
      });

      if (shouldScan) {
        setTimeout(scanAndProcess, 500);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Initialisation
  function init() {
    setupMutationObserver();
    setTimeout(scanAndProcess, 2000);
    setInterval(scanAndProcess, 3000);
    console.log("✅ AutoUploadHandler initialisé");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
```

## 🔧 Modifications dans claraApiService.ts

### Approche simplifiée

```typescript
// ── Case 21 : Lead_balance ──────────────────────────────────────────
if (resolvedEndpoint === this.SENTINEL_LEAD_BALANCE) {
  console.log("📊 [Lead Balance] Génération table déclencheuse");
  
  const initialContent =
    "| Lead_balance |\n" +
    "|-------------|\n" +
    "| Traitement automatique en cours... |";
  
  return {
    id: `${Date.now()}-lead-balance`,
    role: "assistant",
    content: initialContent,
    timestamp: new Date(),
    metadata: { 
      model: "local",
      type: "auto_upload_trigger",
      trigger_type: "lead_balance"
    },
  };
}
```

## 📊 Configuration pour d'autres endpoints

### Exemple 1 : Analyse de fraude

```typescript
// Dans claraApiService.ts
case "analyse_fraude":
  console.log("🔀 Router → Case 24 : analyse_fraude");
  return this.SENTINEL_ANALYSE_FRAUDE;

// Dans sendChatMessage()
if (resolvedEndpoint === this.SENTINEL_ANALYSE_FRAUDE) {
  const initialContent =
    "| Analyse_fraude |\n" +
    "|---------------|\n" +
    "| Traitement automatique en cours... |";
  
  return {
    id: `${Date.now()}-analyse-fraude`,
    role: "assistant",
    content: initialContent,
    timestamp: new Date(),
    metadata: { 
      model: "local",
      type: "auto_upload_trigger",
      trigger_type: "analyse_fraude"
    },
  };
}
```

```javascript
// Dans AutoUploadHandler.js CONFIG
analyse_fraude: {
  triggerTableHeader: "Analyse_fraude",
  endpoint: "http://127.0.0.1:5000/fraud-detection/analyze",
  acceptedFormats: [".xlsx", ".xls", ".csv"],
  maxFileSize: 50 * 1024 * 1024,
  resultType: "html_tables"
}
```

### Exemple 2 : États financiers

```typescript
// Dans claraApiService.ts
case "etats_financiers":
  console.log("🔀 Router → Case 25 : etats_financiers");
  return this.SENTINEL_ETATS_FINANCIERS;

if (resolvedEndpoint === this.SENTINEL_ETATS_FINANCIERS) {
  const initialContent =
    "| Etats_financiers |\n" +
    "|------------------|\n" +
    "| Traitement automatique en cours... |";
  
  return {
    id: `${Date.now()}-etats-financiers`,
    role: "assistant",
    content: initialContent,
    timestamp: new Date(),
    metadata: { 
      model: "local",
      type: "auto_upload_trigger",
      trigger_type: "etats_financiers"
    },
  };
}
```

```javascript
// Dans AutoUploadHandler.js CONFIG
etats_financiers: {
  triggerTableHeader: "Etats_financiers",
  endpoint: "http://127.0.0.1:5000/financial-statements/generate",
  acceptedFormats: [".xlsx", ".xls"],
  maxFileSize: 10 * 1024 * 1024,
  resultType: "html_accordions"
}
```

## 🎯 Avantages de l'approche automatique

### 1. Expérience utilisateur simplifiée
- ❌ Avant : 7 étapes (commande → table → clic droit → menu → sélection → fichier → traitement)
- ✅ Après : 3 étapes (commande → fichier → traitement)

### 2. Cohérence avec Data.js
- Même pattern de détection automatique
- Même logique de traitement
- Même expérience utilisateur

### 3. Extensibilité
- Facile d'ajouter de nouveaux types de traitement
- Configuration centralisée
- Code réutilisable

### 4. Maintenabilité
- Un seul script à maintenir (AutoUploadHandler.js)
- Configuration simple
- Logs clairs

## 📋 Checklist d'implémentation

### Pour ajouter un nouveau type de traitement

1. **Dans claraApiService.ts**
   - [ ] Ajouter la sentinelle (ex: `SENTINEL_MON_TRAITEMENT`)
   - [ ] Ajouter le case dans le router
   - [ ] Ajouter la logique dans sendChatMessage()

2. **Dans AutoUploadHandler.js**
   - [ ] Ajouter la configuration dans `UPLOAD_CONFIGS`
   - [ ] Définir l'entête de table déclencheuse
   - [ ] Définir l'endpoint backend
   - [ ] Définir les formats acceptés
   - [ ] Définir le type de résultat

3. **Backend Python**
   - [ ] Créer l'endpoint
   - [ ] Implémenter la logique de traitement
   - [ ] Retourner le format attendu (html, json, etc.)

4. **Tests**
   - [ ] Tester la détection automatique
   - [ ] Tester l'upload de fichier
   - [ ] Tester le traitement backend
   - [ ] Tester l'affichage des résultats

## 🚀 Migration de l'approche actuelle

### Étape 1 : Créer AutoUploadHandler.js

Créer le fichier `public/AutoUploadHandler.js` avec le code ci-dessus.

### Étape 2 : Charger le script dans index.html

```html
<script src="/AutoUploadHandler.js"></script>
```

### Étape 3 : Configurer pour Lead Balance

```javascript
const CONFIG = {
  UPLOAD_CONFIGS: {
    lead_balance: {
      triggerTableHeader: "Lead_balance",
      endpoint: "http://127.0.0.1:5000/lead-balance/process-excel",
      acceptedFormats: [".xlsx", ".xls"],
      maxFileSize: 10 * 1024 * 1024,
      resultType: "html_accordions"
    }
  }
};
```

### Étape 4 : Tester

```
1. Taper : Lead_balance
2. Table apparaît
3. Dialogue s'ouvre AUTOMATIQUEMENT
4. Sélectionner fichier
5. ✅ Résultats affichés
```

## 📊 Comparaison finale

| Critère | Avec clic droit | Automatique |
|---------|----------------|-------------|
| Étapes utilisateur | 7 | 3 |
| Temps moyen | ~15 secondes | ~5 secondes |
| Risque d'erreur | Élevé | Faible |
| Expérience | Complexe | Simple |
| Cohérence | Moyenne | Élevée |
| Maintenabilité | Moyenne | Élevée |

## ✅ Conclusion

L'approche automatique est **fortement recommandée** car elle :
- Simplifie l'expérience utilisateur (3 étapes au lieu de 7)
- Est cohérente avec Data.js
- Est facilement extensible
- Est maintenable

**Recommandation** : Implémenter AutoUploadHandler.js et migrer vers l'approche automatique.

---

**Version** : 2.0 (Automatique)  
**Date** : 22 Mars 2026  
**Statut** : ✅ Architecture recommandée
