# Exemples de code - Système de Notifications Toast

## 📚 Table des matières

1. [Exemples basiques](#exemples-basiques)
2. [Exemples avancés](#exemples-avancés)
3. [Intégration dans les composants](#intégration-dans-les-composants)
4. [Cas d'usage réels](#cas-dusage-réels)
5. [Patterns courants](#patterns-courants)

---

## Exemples basiques

### Notification simple

```typescript
import { addInfoNotification } from './services/toastNotificationService';

// Notification d'information basique
addInfoNotification(
  "Information",
  "Ceci est une notification d'information"
);
```

### Tous les types de notifications

```typescript
import {
  addInfoNotification,
  addSuccessNotification,
  addErrorNotification,
  addWarningNotification
} from './services/toastNotificationService';

// Info
addInfoNotification("Info", "Message d'information");

// Succès
addSuccessNotification("Succès", "Opération réussie");

// Erreur
addErrorNotification("Erreur", "Une erreur s'est produite");

// Avertissement
addWarningNotification("Attention", "Action requise");
```

### Notification avec durée personnalisée

```typescript
// Notification rapide (2 secondes)
addInfoNotification("Info rapide", "Message court", 2000);

// Notification longue (15 secondes)
addErrorNotification("Erreur importante", "Lisez attentivement", 15000);

// Notification persistante (ne se ferme pas automatiquement)
addInfoNotification("Important", "Cliquez sur × pour fermer", 0);
```

---

## Exemples avancés

### Gestion de l'ID de notification

```typescript
import { addInfoNotification, removeNotification } from './services/toastNotificationService';

// Créer une notification et récupérer son ID
const notificationId = addInfoNotification(
  "Traitement en cours",
  "Veuillez patienter..."
);

// Fermer la notification après 5 secondes
setTimeout(() => {
  removeNotification(notificationId);
  addSuccessNotification("Terminé", "Le traitement est complet");
}, 5000);
```

### Notification avec progression

```typescript
async function processData() {
  // Notification de début
  const processingId = addInfoNotification(
    "⏳ Traitement en cours",
    "Analyse des données...",
    0 // Persistante
  );
  
  try {
    await analyzeData();
    
    // Fermer la notification de progression
    removeNotification(processingId);
    
    // Notification de succès
    addSuccessNotification(
      "✅ Traitement terminé",
      "150 lignes analysées avec succès"
    );
  } catch (error) {
    // Fermer la notification de progression
    removeNotification(processingId);
    
    // Notification d'erreur
    addErrorNotification(
      "❌ Erreur de traitement",
      error.message
    );
  }
}
```

### S'abonner aux notifications

```typescript
import { subscribeToNotifications } from './services/toastNotificationService';

function MyComponent() {
  useEffect(() => {
    // S'abonner aux changements
    const unsubscribe = subscribeToNotifications((notifications) => {
      console.log(`${notifications.length} notification(s) active(s)`);
      
      // Faire quelque chose avec les notifications
      notifications.forEach(n => {
        console.log(`- ${n.type}: ${n.title}`);
      });
    });
    
    // Se désabonner au démontage
    return () => unsubscribe();
  }, []);
  
  return <div>Mon composant</div>;
}
```

### Fermer toutes les notifications

```typescript
import { clearAllNotifications } from './services/toastNotificationService';

function clearAllButton() {
  return (
    <button onClick={() => clearAllNotifications()}>
      Fermer toutes les notifications
    </button>
  );
}
```

---

## Intégration dans les composants

### Composant React avec notifications

```typescript
import React, { useState } from 'react';
import { addSuccessNotification, addErrorNotification } from './services/toastNotificationService';

function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async () => {
    if (!file) {
      addErrorNotification(
        "❌ Aucun fichier",
        "Veuillez sélectionner un fichier"
      );
      return;
    }
    
    setUploading(true);
    
    try {
      await uploadFile(file);
      
      addSuccessNotification(
        "✅ Upload réussi",
        `${file.name} a été uploadé avec succès`
      );
      
      setFile(null);
    } catch (error) {
      addErrorNotification(
        "❌ Erreur d'upload",
        `Impossible d'uploader ${file.name}: ${error.message}`
      );
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Upload en cours..." : "Upload"}
      </button>
    </div>
  );
}
```

### Service avec notifications

```typescript
import { addInfoNotification, addErrorNotification } from './services/toastNotificationService';

class DataService {
  async fetchData(url: string) {
    addInfoNotification(
      "📥 Chargement",
      "Récupération des données..."
    );
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      addSuccessNotification(
        "✅ Données chargées",
        `${data.length} éléments récupérés`
      );
      
      return data;
    } catch (error) {
      addErrorNotification(
        "❌ Erreur de chargement",
        "Impossible de récupérer les données"
      );
      throw error;
    }
  }
}
```

---

## Cas d'usage réels

### 1. Routing n8n (claraApiService.ts)

```typescript
import { addInfoNotification } from "./toastNotificationService";

class ClaraApiService {
  async sendMessage(message: string) {
    // Résolution du routing
    const routingInfo = this.getN8nEndpointWithInfo(message);
    const resolvedEndpoint = routingInfo.endpoint;
    
    // Notification de routing
    addInfoNotification(
      "🔀 Router N8N",
      `${routingInfo.caseName} : ${routingInfo.routeKey}\n🌐 ${resolvedEndpoint}`,
      7000
    );
    
    // Envoi de la requête
    try {
      const response = await fetch(resolvedEndpoint, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
      
      return await response.json();
    } catch (error) {
      addErrorNotification(
        "❌ Erreur n8n",
        `Impossible de contacter ${routingInfo.routeKey}`
      );
      throw error;
    }
  }
}
```

### 2. Upload de fichier Excel

```typescript
import { addInfoNotification, addSuccessNotification, addErrorNotification } from './services/toastNotificationService';

async function uploadExcelFile(file: File) {
  // Validation
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    addErrorNotification(
      "❌ Format invalide",
      "Seuls les fichiers Excel (.xlsx, .xls) sont acceptés"
    );
    return;
  }
  
  // Notification de début
  const uploadId = addInfoNotification(
    "📤 Upload en cours",
    `Upload de ${file.name}...`,
    0
  );
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    // Fermer la notification de progression
    removeNotification(uploadId);
    
    // Notification de succès
    addSuccessNotification(
      "✅ Upload réussi",
      `${file.name} a été importé avec succès`
    );
    
  } catch (error) {
    removeNotification(uploadId);
    
    addErrorNotification(
      "❌ Erreur d'upload",
      `Impossible d'uploader ${file.name}: ${error.message}`,
      10000
    );
  }
}
```

### 3. Génération de rapport

```typescript
import { addInfoNotification, addCompletionNotification, addErrorNotification } from './services/toastNotificationService';

async function generateReport(type: string) {
  addInfoNotification(
    "📊 Génération en cours",
    `Création du rapport ${type}...`
  );
  
  try {
    const report = await fetch(`/api/reports/${type}`);
    const blob = await report.blob();
    
    // Téléchargement automatique
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${type}_${Date.now()}.pdf`;
    a.click();
    
    addCompletionNotification(
      "🎉 Rapport généré",
      `Le rapport ${type} a été téléchargé`,
      12000
    );
    
  } catch (error) {
    addErrorNotification(
      "❌ Erreur de génération",
      `Impossible de générer le rapport ${type}`,
      10000
    );
  }
}
```

### 4. Sauvegarde automatique

```typescript
import { addSuccessNotification, addErrorNotification } from './services/toastNotificationService';

class AutoSaveService {
  private saveTimeout: NodeJS.Timeout | null = null;
  
  scheduleAutoSave(data: any) {
    // Annuler la sauvegarde précédente
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Programmer une nouvelle sauvegarde dans 3 secondes
    this.saveTimeout = setTimeout(() => {
      this.save(data);
    }, 3000);
  }
  
  private async save(data: any) {
    try {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      addSuccessNotification(
        "💾 Sauvegarde automatique",
        "Vos modifications ont été sauvegardées",
        3000
      );
      
    } catch (error) {
      addErrorNotification(
        "❌ Erreur de sauvegarde",
        "Impossible de sauvegarder vos modifications"
      );
    }
  }
}
```

### 5. Clara en arrière-plan

```typescript
import { addBackgroundCompletionNotification } from './services/toastNotificationService';

class ClaraBackgroundService {
  async processInBackground(message: string) {
    // Traitement en arrière-plan
    const response = await this.sendToClaraAPI(message);
    
    // Notification persistante quand Clara termine
    addBackgroundCompletionNotification(
      "Clara Response Ready",
      `Clara a terminé de répondre à: "${message.slice(0, 40)}${message.length > 40 ? '...' : ''}"`
    );
    
    return response;
  }
}
```

---

## Patterns courants

### Pattern 1: Try-Catch avec notifications

```typescript
async function performAction() {
  try {
    await doSomething();
    addSuccessNotification("Succès", "Action réussie");
  } catch (error) {
    addErrorNotification("Erreur", error.message);
  }
}
```

### Pattern 2: Progression avec ID

```typescript
async function longRunningTask() {
  const id = addInfoNotification("En cours", "Traitement...", 0);
  
  try {
    await task();
    removeNotification(id);
    addSuccessNotification("Terminé", "Tâche complète");
  } catch (error) {
    removeNotification(id);
    addErrorNotification("Erreur", error.message);
  }
}
```

### Pattern 3: Validation avec avertissement

```typescript
function validateForm(data: FormData) {
  const errors = [];
  
  if (!data.name) errors.push("Nom requis");
  if (!data.email) errors.push("Email requis");
  
  if (errors.length > 0) {
    addWarningNotification(
      "⚠️ Formulaire incomplet",
      errors.join("\n")
    );
    return false;
  }
  
  return true;
}
```

### Pattern 4: Confirmation d'action

```typescript
async function deleteItem(id: string) {
  addWarningNotification(
    "⚠️ Confirmation",
    "Êtes-vous sûr de vouloir supprimer cet élément?",
    8000
  );
  
  // Attendre confirmation (via un modal par exemple)
  const confirmed = await showConfirmDialog();
  
  if (confirmed) {
    try {
      await api.delete(id);
      addSuccessNotification("✅ Supprimé", "L'élément a été supprimé");
    } catch (error) {
      addErrorNotification("❌ Erreur", "Impossible de supprimer");
    }
  }
}
```

### Pattern 5: Notification conditionnelle

```typescript
function processResult(result: any) {
  if (result.warnings.length > 0) {
    addWarningNotification(
      "⚠️ Avertissements",
      `${result.warnings.length} avertissement(s) détecté(s)`
    );
  }
  
  if (result.errors.length > 0) {
    addErrorNotification(
      "❌ Erreurs",
      `${result.errors.length} erreur(s) détectée(s)`
    );
  } else {
    addSuccessNotification(
      "✅ Succès",
      "Traitement terminé sans erreur"
    );
  }
}
```

---

## 🧪 Tests

### Test manuel dans la console

```javascript
// Ouvrir la console du navigateur (F12)

// Test d'une notification info
addInfoNotification("Test Info", "Ceci est un test");

// Test de tous les types
addInfoNotification("Info", "Message info");
addSuccessNotification("Succès", "Message succès");
addErrorNotification("Erreur", "Message erreur");
addWarningNotification("Attention", "Message attention");

// Test de durée
addInfoNotification("Court", "2 secondes", 2000);
addInfoNotification("Long", "15 secondes", 15000);
addInfoNotification("Persistant", "Cliquez pour fermer", 0);

// Test de fermeture
const id = addInfoNotification("Test", "À fermer");
setTimeout(() => removeNotification(id), 3000);

// Test de nettoyage
clearAllNotifications();
```

### Fonction de test complète

```typescript
function testNotifications() {
  console.log("🧪 Test des notifications...");
  
  // Test 1: Info
  setTimeout(() => {
    addInfoNotification("Test 1", "Notification d'information");
  }, 0);
  
  // Test 2: Success
  setTimeout(() => {
    addSuccessNotification("Test 2", "Notification de succès");
  }, 2000);
  
  // Test 3: Error
  setTimeout(() => {
    addErrorNotification("Test 3", "Notification d'erreur");
  }, 4000);
  
  // Test 4: Warning
  setTimeout(() => {
    addWarningNotification("Test 4", "Notification d'avertissement");
  }, 6000);
  
  // Test 5: Multi-ligne
  setTimeout(() => {
    addInfoNotification(
      "Test 5",
      "Ligne 1\nLigne 2\nLigne 3"
    );
  }, 8000);
  
  console.log("✅ Tests programmés");
}

// Exposer la fonction pour les tests
(window as any).testNotifications = testNotifications;
```

---

## 📚 Ressources complémentaires

- **Architecture**: `ARCHITECTURE.md`
- **Guide d'utilisation**: `GUIDE_UTILISATION.md`
- **Problèmes et solutions**: `PROBLEMES_ET_SOLUTIONS.md`
- **Code source**: 
  - `src/services/toastNotificationService.ts`
  - `src/components/NotificationContainer.tsx`
