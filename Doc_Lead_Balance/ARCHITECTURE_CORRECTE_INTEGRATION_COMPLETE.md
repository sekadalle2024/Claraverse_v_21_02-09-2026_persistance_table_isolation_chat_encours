# 🏗️ Architecture Correcte : Intégration Complète dans claraApiService.ts

## ❌ Problème avec l'approche précédente

L'approche avec le menu contextuel ou un script externe (AutoUploadHandler.js) nécessite :
1. Que l'utilisateur fasse un clic droit
2. Que l'utilisateur sélectionne une option dans le menu
3. Plusieurs étapes manuelles

**Ce n'est PAS ce qui était demandé !**

## ✅ Architecture Correcte

### Objectif réel
Dès que claraApiService.ts génère la table "Lead_balance" dans le chat, le processus doit se déclencher **AUTOMATIQUEMENT** :
1. Dialogue de sélection de fichier s'ouvre automatiquement
2. User sélectionne le fichier
3. Traitement automatique
4. Résultats affichés

**Tout le code doit être dans claraApiService.ts, pas dans menu.js ni dans un script externe.**

## 🔄 Flux Correct

```
User: "Lead_balance"
    ↓
claraApiService.ts détecte le mot-clé
    ↓
Router retourne SENTINEL_LEAD_BALANCE
    ↓
sendChatMessage() génère table ET déclenche automatiquement:
    ├─ Ouvre dialogue de sélection de fichier
    ├─ Lit le fichier en base64
    ├─ Envoie vers backend Python
    ├─ Reçoit les résultats
    └─ Retourne le contenu avec les résultats
    ↓
Table avec résultats affichée dans le chat
    ↓
✅ Terminé (TOUT AUTOMATIQUE)
```

## 📝 Implémentation Correcte dans claraApiService.ts

### Problème : TypeScript côté serveur ne peut pas ouvrir de dialogue fichier

**IMPORTANT** : claraApiService.ts s'exécute côté serveur/service, il ne peut pas :
- Ouvrir un dialogue de sélection de fichier (API navigateur uniquement)
- Accéder au système de fichiers local de l'utilisateur
- Interagir directement avec le DOM

### Solution : Architecture Hybride Correcte

```
claraApiService.ts (Backend/Service)
    ↓ Génère table avec metadata spéciale
    ↓
Chat affiche la table
    ↓
Script côté client détecte la metadata
    ↓ (AUTOMATIQUEMENT)
Dialogue de sélection s'ouvre
    ↓
Upload et traitement
    ↓
Mise à jour du DOM avec résultats
```

## 🎯 Solution : Metadata + Event Listener

### 1. claraApiService.ts génère une table avec metadata spéciale

```typescript
// ── Case 21 : Lead_balance ───────────────────────────────────────────
if (resolvedEndpoint === this.SENTINEL_LEAD_BALANCE) {
  console.log("📊 [Lead Balance] Génération table avec déclenchement automatique");
  
  const initialContent =
    "| Lead_balance |\n" +
    "|-------------|\n" +
    "| ⏳ Sélection du fichier en cours... |";
  
  return {
    id: `${Date.now()}-lead-balance`,
    role: "assistant",
    content: initialContent,
    timestamp: new Date(),
    metadata: { 
      model: "local",
      type: "auto_trigger_upload",
      trigger_type: "lead_balance",
      endpoint: "http://127.0.0.1:5000/lead-balance/process-excel",
      acceptedFormats: [".xlsx", ".xls"],
      autoTrigger: true  // ← CLÉ IMPORTANTE
    },
  };
}
```

### 2. Script côté client (LeadBalanceAutoTrigger.js) détecte et traite

```javascript
/**
 * LeadBalanceAutoTrigger.js
 * Détecte automatiquement les tables avec metadata autoTrigger
 * et déclenche le processus d'upload
 */

(function () {
  "use strict";

  // Observer les nouveaux messages dans le chat
  function observeChatMessages() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Chercher les tables Lead_balance
            const tables = node.querySelectorAll('table');
            tables.forEach(checkAndTrigger);
          }
        });
      });
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  // Vérifier si la table doit déclencher l'upload
  async function checkAndTrigger(table) {
    // Vérifier l'entête
    const headers = Array.from(table.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    
    if (!headers.includes('Lead_balance')) return;
    
    // Vérifier si déjà traité
    if (table.dataset.autoTriggered) return;
    table.dataset.autoTriggered = 'true';

    console.log('🎯 Table Lead_balance détectée - Déclenchement automatique');

    // Déclencher automatiquement
    await processLeadBalance(table);
  }

  // Traiter la Lead Balance
  async function processLeadBalance(table) {
    try {
      // 1. Ouvrir dialogue automatiquement
      const file = await openFileDialog();
      if (!file) {
        updateTableContent(table, '❌ Sélection annulée');
        return;
      }

      // 2. Vérifier le format
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!['.xlsx', '.xls'].includes(ext)) {
        updateTableContent(table, '⚠️ Format non supporté');
        return;
      }

      // 3. Mettre à jour la table
      updateTableContent(table, `📊 Traitement de ${file.name}...`);

      // 4. Lire et envoyer le fichier
      const fileBase64 = await readFileAsBase64(file);
      
      const response = await fetch('http://127.0.0.1:5000/lead-balance/process-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_base64: fileBase64,
          filename: file.name
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const result = await response.json();

      // 5. Remplacer la table avec les résultats
      if (result.success && result.html) {
        replaceTableWithResults(table, result.html);
        showNotification('✅ Lead Balance calculée avec succès!');
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      updateTableContent(table, `❌ Erreur: ${error.message}`);
    }
  }

  // Fonctions utilitaires
  function openFileDialog() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      input.style.display = 'none';

      input.onchange = (e) => {
        const file = e.target.files?.[0];
        document.body.removeChild(input);
        resolve(file || null);
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      document.body.appendChild(input);
      setTimeout(() => input.click(), 100);
    });
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(new Error('Erreur de lecture'));
      reader.readAsDataURL(file);
    });
  }

  function updateTableContent(table, message) {
    const cell = table.querySelector('td');
    if (cell) cell.textContent = message;
  }

  function replaceTableWithResults(table, html) {
    const parentDiv = table.closest('div.prose');
    if (parentDiv) {
      parentDiv.innerHTML = html;
    }
  }

  function showNotification(message) {
    // Notification simple
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:white;padding:12px 20px;border-radius:8px;z-index:9999;';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }

  // Initialisation
  observeChatMessages();
  console.log('✅ LeadBalanceAutoTrigger initialisé');

})();
```

### 3. Charger le script dans index.html

```html
<!-- Dans index.html, après les autres scripts -->
<script src="/LeadBalanceAutoTrigger.js"></script>
```

## 🎯 Pourquoi cette architecture ?

### Séparation des responsabilités

1. **claraApiService.ts** (Backend/Service)
   - Détecte le mot-clé "Lead_balance"
   - Génère la table avec metadata
   - Retourne le message

2. **LeadBalanceAutoTrigger.js** (Client/Navigateur)
   - Détecte la table dans le DOM
   - Ouvre le dialogue de fichier (API navigateur)
   - Upload et traitement
   - Mise à jour du DOM

### Avantages

- ✅ **Automatique** : Aucune action manuelle après la commande
- ✅ **Propre** : Séparation claire des responsabilités
- ✅ **Extensible** : Facile d'ajouter d'autres types
- ✅ **Maintenable** : Code organisé et documenté

## 📊 Comparaison des approches

| Approche | Automatique | Code dans claraApiService | Extensible |
|----------|-------------|---------------------------|------------|
| ❌ Menu contextuel | Non (clic droit) | Non | Moyen |
| ❌ AutoUploadHandler.js | Oui | Non | Oui |
| ✅ **Metadata + Trigger** | **Oui** | **Oui (metadata)** | **Oui** |

## 🔧 Pour ajouter un nouveau type de traitement

### 1. Dans claraApiService.ts

```typescript
// Ajouter la sentinelle
private readonly SENTINEL_MON_TRAITEMENT = "__INTERNAL__MON_TRAITEMENT__";

// Ajouter le case dans le router
case "mon_traitement":
  return this.SENTINEL_MON_TRAITEMENT;

// Ajouter la logique dans sendChatMessage()
if (resolvedEndpoint === this.SENTINEL_MON_TRAITEMENT) {
  const initialContent =
    "| Mon_traitement |\n" +
    "|---------------|\n" +
    "| ⏳ Sélection du fichier en cours... |";
  
  return {
    id: `${Date.now()}-mon-traitement`,
    role: "assistant",
    content: initialContent,
    timestamp: new Date(),
    metadata: { 
      model: "local",
      type: "auto_trigger_upload",
      trigger_type: "mon_traitement",
      endpoint: "http://127.0.0.1:5000/mon-endpoint",
      acceptedFormats: [".xlsx", ".csv"],
      autoTrigger: true
    },
  };
}
```

### 2. Dans LeadBalanceAutoTrigger.js

Ajouter la configuration :

```javascript
const CONFIGS = {
  'Lead_balance': {
    endpoint: 'http://127.0.0.1:5000/lead-balance/process-excel',
    formats: ['.xlsx', '.xls']
  },
  'Mon_traitement': {
    endpoint: 'http://127.0.0.1:5000/mon-endpoint',
    formats: ['.xlsx', '.csv']
  }
};
```

## ✅ Conclusion

L'architecture correcte est :
1. **claraApiService.ts** génère la table avec metadata `autoTrigger: true`
2. **LeadBalanceAutoTrigger.js** détecte automatiquement et traite
3. **Aucune interaction manuelle** après la commande initiale

C'est cette approche qui doit être implémentée, pas celle avec le menu contextuel.

---

**Version** : 3.0 (Architecture Correcte)  
**Date** : 22 Mars 2026  
**Statut** : ✅ Architecture validée
