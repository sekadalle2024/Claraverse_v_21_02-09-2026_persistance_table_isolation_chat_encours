# Solution Finale : Restauration par Keyword

## Problème

Les `containerId` changent à chaque rechargement car ils contiennent un timestamp.
- Impossible de retrouver les containers par leur ID
- La restauration in-place ne fonctionne pas

## Solution

**Matcher les tables par KEYWORD au lieu de ContainerID**

### Stratégie

1. Lors de la restauration, chercher les tables existantes par leur **keyword**
2. Trouver le container de cette table
3. Remplacer le contenu du container par la version restaurée

### Implémentation

```typescript
private injectTableIntoDOM(tableData: FlowiseGeneratedTableRecord): void {
  try {
    // Chercher une table existante avec le même keyword
    const existingTable = this.findTableByKeyword(tableData.keyword);
    
    if (!existingTable) {
      console.log(`ℹ️ No existing table found for keyword "${tableData.keyword}", skipping restoration`);
      return;
    }

    // Trouver le container de cette table
    const container = existingTable.closest('[data-container-id]');
    
    if (!container) {
      console.log(`ℹ️ No container found for table "${tableData.keyword}", skipping restoration`);
      return;
    }

    // Remplacer le contenu du container
    const tableWrapper = this.createTableWrapper(tableData);
    container.innerHTML = '';
    container.appendChild(tableWrapper);
    container.setAttribute('data-restored-content', 'true');

    console.log(`✅ Restored table "${tableData.keyword}" into existing container`);

  } catch (error) {
    console.error(`❌ Error restoring table ${tableData.id}:`, error);
  }
}

private findTableByKeyword(keyword: string): HTMLTableElement | null {
  // Chercher une table avec ce keyword dans ses attributs
  const tables = document.querySelectorAll('table');
  
  for (const table of tables) {
    const wrapper = table.closest('[data-n8n-keyword]');
    if (wrapper?.getAttribute('data-n8n-keyword') === keyword) {
      return table as HTMLTableElement;
    }
  }
  
  return null;
}
```

## Avantages

✅ Fonctionne même si les IDs changent
✅ Trouve automatiquement la bonne table à remplacer
✅ Pas de duplications
✅ Bon positionnement (utilise le container existant)

## Test

1. Modifier une table (supprimer une ligne)
2. Recharger la page
3. La table modifiée devrait remplacer l'originale
