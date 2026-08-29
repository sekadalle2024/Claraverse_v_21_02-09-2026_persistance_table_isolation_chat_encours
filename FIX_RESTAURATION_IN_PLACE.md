# Fix : Restauration In-Place

## Problème Actuel

Le système crée de **nouveaux containers** lors de la restauration, ce qui cause :
- Duplications (3-4 copies de chaque table)
- Mauvais positionnement (hors du chat)
- Superposition entre chats

## Solution : Restauration In-Place

Au lieu de créer de nouveaux containers, **réutiliser les containers existants** :

1. Lors de la sauvegarde : sauvegarder le `containerId` du container original
2. Lors de la restauration : trouver le container original par son ID
3. Si trouvé : remplacer son contenu
4. Si non trouvé : ne rien faire (le container n'existe plus)

## Modifications Nécessaires

### 1. Désactiver le Preload Forcé

Dans `createTableWrapper()`, supprimer le `setTimeout` qui force le preload :

```typescript
// SUPPRIMER CE CODE :
setTimeout(() => {
  if (placeholder.isConnected && !flowiseTableLazyLoader.isLoaded(tableData.id)) {
    flowiseTableLazyLoader.preload(tableData.id).catch(error => {
      console.error(`❌ Error preloading restored table ${tableData.id}:`, error);
    });
  }
}, 100);
```

### 2. Modifier la Logique de Restauration

Dans `injectTableIntoDOM()`, au lieu de créer un nouveau container :

```typescript
private injectTableIntoDOM(tableData: FlowiseGeneratedTableRecord): void {
  try {
    // Trouver le container EXISTANT
    const container = this.findTableContainer(tableData.containerId);

    if (!container) {
      console.log(`ℹ️ Container ${tableData.containerId} not found, skipping restoration`);
      return; // NE PAS créer de nouveau container
    }

    // Remplacer le contenu du container existant
    const tableWrapper = this.createTableWrapper(tableData);
    container.innerHTML = ''; // Vider le container
    container.appendChild(tableWrapper);

    console.log(`✅ Restored table ${tableData.id} into existing container ${tableData.containerId}`);

  } catch (error) {
    console.error(`❌ Error restoring table ${tableData.id}:`, error);
  }
}
```

### 3. Supprimer createTableContainer()

Ne plus créer de nouveaux containers lors de la restauration.

## Avantages

✅ Pas de duplications (une seule table par container)
✅ Bon positionnement (utilise les containers existants dans le chat)
✅ Pas de superposition (restaure uniquement dans les containers existants)
✅ Plus simple et plus fiable

## Test

Après modification :
1. Modifier une table (supprimer une ligne)
2. Recharger la page
3. Vérifier que la table modifiée remplace l'originale dans le même container
4. Vérifier qu'il n'y a qu'une seule copie de la table
