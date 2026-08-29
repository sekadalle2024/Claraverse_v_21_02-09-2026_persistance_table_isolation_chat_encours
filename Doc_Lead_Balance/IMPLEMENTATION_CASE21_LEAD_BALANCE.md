# Implémentation Case 21 : Lead Balance

## 📋 Résumé de l'implémentation

L'objectif était d'intégrer la fonctionnalité "Lead Balance" du menu contextuel directement dans le Case 21 de `claraApiService.ts`, permettant ainsi de déclencher cette fonctionnalité via un message utilisateur contenant "Lead_balance".

## ✅ Modifications effectuées

### 1. **src/services/claraApiService.ts**

#### A. Ajout d'une nouvelle sentinelle interne (ligne ~43)
```typescript
private readonly SENTINEL_LEAD_BALANCE = "__INTERNAL__LEAD_BALANCE__";
```

Cette sentinelle permet de traiter le Case 21 localement sans faire d'appel API vers n8n.

#### B. Modification du router dans `getN8nEndpoint()` (ligne ~120)
```typescript
case "lead_balance":
  console.log("🔀 Router → Case 21 : lead_balance (traitement local avec upload fichier)");
  return this.SENTINEL_LEAD_BALANCE;
```

Au lieu de retourner l'URL de l'endpoint n8n, le router retourne maintenant la sentinelle `SENTINEL_LEAD_BALANCE`.

#### C. Ajout de la logique de traitement dans `sendChatMessage()` (après ligne ~900)
```typescript
// ── Case 21 : Lead_balance – Upload fichier Excel et traitement ──────
if (resolvedEndpoint === this.SENTINEL_LEAD_BALANCE) {
  console.log("📊 [Lead Balance] Démarrage du processus");
  
  // Créer une table unicolonne avec entête "Lead_balance"
  const initialContent =
    "| Lead_balance |\n" +
    "|-------------|\n" +
    "| Cliquez sur cette table avec le bouton droit et sélectionnez 'Lead Balance' dans le menu contextuel pour charger votre fichier Excel. |";
  
  // Retourner la table initiale
  return {
    id: `${Date.now()}-lead-balance`,
    role: "assistant",
    content: initialContent,
    timestamp: new Date(),
    metadata: { 
      model: "local",
      type: "lead_balance_trigger",
      instruction: "Right-click on this table and select 'Lead Balance' from the context menu to upload your Excel file."
    },
  };
}
```

## 🔄 Flux de fonctionnement

### Étape 1 : Déclenchement via message utilisateur
L'utilisateur envoie un message contenant "Lead_balance" (par exemple : `/Couverture Lead_balance`)

### Étape 2 : Détection par le router
Le router dans `getN8nEndpoint()` détecte le mot-clé "Lead_balance" et retourne `SENTINEL_LEAD_BALANCE`

### Étape 3 : Génération de la table déclencheuse
`sendChatMessage()` génère une table Markdown unicolonne avec l'entête "Lead_balance" :

```markdown
| Lead_balance |
|-------------|
| Cliquez sur cette table avec le bouton droit... |
```

### Étape 4 : Rendu de la table dans le chat
La table est rendue dans le chat avec les classes CSS standard de Claraverse :
- `class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg"`
- Contenue dans `div.prose.prose-base.dark:prose-invert.max-w-none`

### Étape 5 : Détection automatique par le menu contextuel
Le menu contextuel (`menu.js`) détecte automatiquement cette table via :
- `isTableInChat()` : vérifie les sélecteurs CSS
- Event listeners sur `mouseover`, `contextmenu`, etc.

### Étape 6 : Activation de la fonctionnalité Lead Balance
L'utilisateur fait un clic droit sur la table et sélectionne "📊 Lead Balance" dans le menu contextuel.

### Étape 7 : Upload et traitement du fichier Excel
La fonction `executeLeadBalance()` dans `menu.js` :
1. Ouvre un dialogue de sélection de fichier Excel
2. Lit le fichier et le convertit en base64
3. Envoie le fichier vers le backend Python : `http://127.0.0.1:5000/lead-balance/process-excel`
4. Reçoit les résultats (accordéons HTML avec les Lead Balances)
5. Remplace le contenu de la div de la table déclencheuse avec les résultats

## 📁 Fichiers modifiés

1. **src/services/claraApiService.ts**
   - Ajout de `SENTINEL_LEAD_BALANCE`
   - Modification du Case 21 dans `getN8nEndpoint()`
   - Ajout de la logique de traitement dans `sendChatMessage()`

## 🔧 Fichiers existants utilisés (non modifiés)

1. **public/menu.js**
   - Fonction `executeLeadBalance()` (lignes 5759-5830)
   - Fonction `openFileDialogForLeadBalance()` (lignes 5838-5856)
   - Fonction `readFileAsBase64()` (lignes 5862-5872)
   - Fonction `insertLeadBalanceResults()` (lignes 5879-5910)

2. **public/Data.js**
   - Logique similaire de détection et traitement de tables
   - Utilisé comme référence pour la structure

## 🎯 Avantages de cette approche

1. **Pas d'appel API n8n inutile** : Le Case 21 ne fait plus d'appel vers n8n, économisant des ressources
2. **Réutilisation du code existant** : La logique d'upload et de traitement dans `menu.js` est réutilisée
3. **Expérience utilisateur cohérente** : L'utilisateur utilise le même menu contextuel familier
4. **Persistance des données** : Le menu contextuel gère déjà la persistance via `syncWithDev()`
5. **Sélecteurs CSS cohérents** : Utilise les mêmes sélecteurs que le reste de l'application

## 🧪 Test de la fonctionnalité

### Commande de test
```
/Couverture Lead_balance
```

ou simplement :
```
Lead_balance
```

### Résultat attendu
1. Une table unicolonne apparaît dans le chat avec l'entête "Lead_balance"
2. Clic droit sur la table → menu contextuel s'ouvre
3. Sélection "📊 Lead Balance" → dialogue de sélection de fichier
4. Sélection d'un fichier Excel (.xlsx ou .xls)
5. Traitement par le backend Python
6. Affichage des résultats (accordéons HTML) en remplacement de la table

## 📊 Backend Python

L'endpoint backend utilisé :
```
POST http://127.0.0.1:5000/lead-balance/process-excel
```

Payload :
```json
{
  "file_base64": "...",
  "filename": "balance.xlsx"
}
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Lead Balance calculée avec succès",
  "html": "<div>...</div>",
  "results": {
    "totals": {
      "common": { "count": 150 },
      "only_n": { "count": 10 },
      "only_n_1": { "count": 5 }
    }
  }
}
```

## 🔍 Points d'attention

1. **Backend Python doit être démarré** : Le serveur Python doit tourner sur `http://127.0.0.1:5000`
2. **Format de fichier** : Seuls les fichiers .xlsx et .xls sont acceptés
3. **Taille de fichier** : Pas de limite explicite, mais le backend peut avoir des contraintes
4. **Sélecteurs CSS** : La table générée doit avoir les bonnes classes CSS pour être détectée

## 🚀 Prochaines étapes possibles

1. **Amélioration de l'UX** : Ajouter un indicateur de chargement pendant le traitement
2. **Gestion d'erreurs** : Améliorer les messages d'erreur pour l'utilisateur
3. **Validation côté client** : Vérifier la structure du fichier Excel avant l'envoi
4. **Cache des résultats** : Stocker les résultats pour éviter de retraiter le même fichier
5. **Export des résultats** : Permettre d'exporter les Lead Balances en Excel ou PDF

## 📝 Notes techniques

- La table générée en Markdown est automatiquement convertie en HTML par le système de rendu de Claraverse
- Les classes CSS sont appliquées automatiquement par le système de rendu
- Le menu contextuel utilise `MutationObserver` pour détecter les nouvelles tables
- La persistance est gérée par `syncWithDev()` dans le menu contextuel

## ✅ Conclusion

L'implémentation est complète et fonctionnelle. Le Case 21 génère maintenant une table déclencheuse qui permet d'activer la fonctionnalité Lead Balance via le menu contextuel, réutilisant ainsi toute la logique existante dans `menu.js` sans duplication de code.
