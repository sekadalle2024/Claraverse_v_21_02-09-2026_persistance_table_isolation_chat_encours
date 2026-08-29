# DOM Persistence Implementation Guide

## Version 2.0.0 - Pure DOM Persistence

Date: 2025
Status: **PRODUCTION READY**

---

## 📋 Executive Summary

This document describes the complete migration from localStorage-based persistence to pure DOM-based persistence for the Claraverse table consolidation system. **All localStorage/sessionStorage dependencies have been removed.**

---

## 🎯 Objectives Achieved

✅ **Zero localStorage/sessionStorage usage**
✅ **Pure DOM manipulation for data persistence**
✅ **Real-time cell modification tracking**
✅ **Automatic consolidation updates**
✅ **Table snapshot system**
✅ **Metadata management in DOM**

---

## 🔧 Technical Architecture

### 1. DOM Storage Containers

Three hidden DOM containers manage all persistence:

#### A. Main Data Store (`claraverse-dom-data-store`)
```html
<div id="claraverse-dom-data-store" style="display:none" data-claraverse-store="true">
  <!-- Stores table snapshots as cloned DOM nodes -->
  <div data-table-ref="table_123456_abc">
    <table><!-- Full table clone --></table>
  </div>
</div>
```

**Purpose**: Stores complete table snapshots using `cloneNode(true)`

#### B. Shadow Store (`claraverse-shadow-store`)
```html
<div id="claraverse-shadow-store" style="display:none">
  <!-- Reserved for future use / backup snapshots -->
</div>
```

**Purpose**: Secondary storage for rollback/versioning

#### C. Meta Store (`claraverse-meta-store`)
```html
<script id="claraverse-meta-store" type="application/json">
{
  "version": "2.0.0",
  "created": "2025-01-15T10:30:00.000Z",
  "tables": {
    "table_123456_abc": {
      "cells": {
        "table_123456_abc_0_1": {
          "value": "Validité",
          "modified": "2025-01-15T10:35:00.000Z"
        }
      },
      "consolidation": {
        "htmlContent": "<div>...</div>",
        "simpleContent": "Non-conformité...",
        "timestamp": "2025-01-15T10:35:00.000Z"
      }
    }
  }
}
</script>
```

**Purpose**: JSON metadata for cell changes, consolidation results, timestamps

---

## 📊 Key Features

### 1. Table Initialization

```javascript
initializeTableInDOM(table, tableId) {
  const domStore = document.getElementById('claraverse-dom-data-store');
  
  // Create container for this table
  let tableContainer = domStore.querySelector(`[data-table-ref="${tableId}"]`);
  if (!tableContainer) {
    tableContainer = document.createElement('div');
    tableContainer.setAttribute('data-table-ref', tableId);
    tableContainer.setAttribute('data-created', new Date().toISOString());
    domStore.appendChild(tableContainer);
  }
  
  // Create snapshot
  const snapshot = table.cloneNode(true);
  tableContainer.innerHTML = '';
  tableContainer.appendChild(snapshot);
}
```

### 2. Cell Change Tracking

Every cell modification is tracked via data attributes:

```html
<td 
  data-original-value="Validité"
  data-cell-index="5"
  data-modified="true"
  data-modified-time="2025-01-15T10:35:00.000Z"
  class="claraverse-modified"
>
  Exhaustivité
</td>
```

### 3. Debounced DOM Save

```javascript
debounceSaveToDOM(table, tableId) {
  if (this.saveTimeouts.has(tableId)) {
    clearTimeout(this.saveTimeouts.get(tableId));
  }
  
  const timeout = setTimeout(() => {
    this.saveTableToDOM(table, tableId);
    this.saveTimeouts.delete(tableId);
  }, 500); // 500ms debounce
  
  this.saveTimeouts.set(tableId, timeout);
}
```

### 4. Snapshot Restoration

```javascript
restoreTableFromSnapshot(targetTable, snapshotTable) {
  const targetRows = targetTable.querySelectorAll('tbody tr');
  const snapshotRows = snapshotTable.querySelectorAll('tbody tr');
  
  snapshotRows.forEach((snapshotRow, rowIndex) => {
    const targetRow = targetRows[rowIndex];
    if (!targetRow) return;
    
    const snapshotCells = snapshotRow.querySelectorAll('td');
    const targetCells = targetRow.querySelectorAll('td');
    
    snapshotCells.forEach((snapshotCell, cellIndex) => {
      const targetCell = targetCells[cellIndex];
      if (targetCell) {
        targetCell.innerHTML = snapshotCell.innerHTML;
        if (snapshotCell.style.backgroundColor) {
          targetCell.style.backgroundColor = snapshotCell.style.backgroundColor;
        }
      }
    });
  });
}
```

---

## 🔄 Data Flow

### Modification Flow

```
User Action (click/input)
    ↓
Event Listener Triggered
    ↓
Cell Value Updated
    ↓
data-modified Attribute Set
    ↓
Debounced Save Scheduled
    ↓
saveTableToDOM() Called
    ↓
Table Cloned (cloneNode(true))
    ↓
Snapshot Stored in DOM Store
    ↓
Metadata Updated in Meta Store
```

### Restoration Flow

```
Page Load / React Ready
    ↓
restoreAllTablesFromDOM() Called
    ↓
Find All Tables in Current DOM
    ↓
For Each Table with data-table-id
    ↓
Locate Snapshot in DOM Store
    ↓
restoreTableFromSnapshot()
    ↓
Copy Cell Values & Styles
    ↓
Table Fully Restored
```

---

## 🎨 Interactive Features

### 1. Dropdown Menus

**Assertion Dropdown:**
- Validité
- Exhaustivité
- Formalisation
- Application
- Permanence

**Conclusion Dropdown:**
- Satisfaisant (green background)
- Non-Satisfaisant (red background)
- Limitation (red background)
- Non-Applicable

### 2. Editable CTR Cells

CTR cells are `contentEditable="true"` and trigger:
- Real-time consolidation
- Debounced DOM save
- Modification tracking

### 3. Automatic Consolidation

Triggers on:
- Assertion selection
- Conclusion selection
- CTR value change
- Any cell modification

Consolidation Logic:
```javascript
performConsolidation(table) {
  // Extract all rows with "Non-Satisfaisant" or "Limitation"
  // Group by assertion type
  // Calculate totals
  // Generate HTML content
  // Update Conso table (simplified)
  // Update Resultat table (detailed)
  // Save to DOM metadata
}
```

---

## 📦 Removed localStorage Methods

The following methods have been **COMPLETELY REMOVED**:

❌ `testLocalStorage()`
❌ `loadAllData()`
❌ `saveAllData(data)`
❌ `saveTableData(table)`
❌ `saveTableDataNow(table)`
❌ `saveConsolidationData(table, fullContent, simpleContent)`
❌ `restoreTableData(table)`
❌ `restoreAllTablesData()`
❌ `autoSaveAllTables()`
❌ `clearAllData()`
❌ `exportData()`
❌ `importData(jsonData)`
❌ `clearTableData(tableId)`
❌ `getStorageInfo()`

---

## ✨ New DOM Persistence Methods

The following methods implement pure DOM persistence:

✅ `initializeDOMPersistence()`
✅ `initializeTableInDOM(table, tableId)`
✅ `saveTableToDOM(table, tableId)`
✅ `saveCellChangeToDOM(table, tableId, rowIndex, cell)`
✅ `saveConsolidationToDOM(tableId, consolidationData)`
✅ `restoreAllTablesFromDOM()`
✅ `restoreTableFromSnapshot(targetTable, snapshotTable)`
✅ `handleCellChange(table, tableId, cell, cellIndex)`
✅ `debounceSaveToDOM(table, tableId)`

---

## 🚀 Usage & Integration

### Automatic Initialization

The script auto-initializes on page load:

```javascript
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClaraverseProcessor);
} else {
  setTimeout(initClaraverseProcessor, 1000);
}
```

### Manual Initialization

```javascript
// Access the processor
window.claraverseProcessor

// Manually trigger initialization
window.initClaraverseProcessor()

// Check if initialized
window.claraverseProcessor.isInitialized
```

### Debugging

```javascript
// Enable debug mode
window.claraverseProcessor.debugMode = true;

// Check DOM store content
document.getElementById('claraverse-dom-data-store').innerHTML

// Check metadata
JSON.parse(document.getElementById('claraverse-meta-store').textContent)

// Check all tracked tables
document.querySelectorAll('[data-table-id]')
```

---

## 🔍 Table Detection

### Modelized Table Criteria

A table is considered "modelized" if it contains any of these headers:
- "assertion"
- "conclusion"
- "ecart"

### CSS Selectors Used

```javascript
const selectors = [
  "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
  "table.min-w-full",
  "table"
];
```

### Table Hierarchy

```
Resultat Table (above)
    ↓
Conso Table (dynamically created)
    ↓
Pointage Table (main scoring table)
```

---

## 💾 Data Persistence Lifecycle

### 1. Session Persistence
✅ Data persists during the entire browser session
✅ Survives React component re-renders
✅ Survives DOM updates (via MutationObserver)

### 2. Page Reload
❌ Data is lost on page reload (by design - no localStorage)
✅ Can be exported via browser DevTools if needed

### 3. Navigation
✅ Data persists when navigating within the SPA
❌ Data is lost when navigating to external pages

---

## 🎯 Performance Optimizations

### 1. Debouncing
- 500ms debounce on cell changes
- Prevents excessive DOM cloning
- Batches rapid user inputs

### 2. WeakSet for Processed Tables
```javascript
this.processedTables = new WeakSet();
```
- Automatic garbage collection
- No memory leaks
- Efficient table tracking

### 3. Event Delegation
- Click handlers at document level for dropdowns
- Minimal event listeners per cell
- Cleanup on destroy

### 4. MutationObserver
- Watches for new tables
- Automatic processing of dynamic content
- Throttled with 500ms delay

---

## 🛡️ Data Integrity

### 1. Unique Table IDs

```javascript
generateUniqueTableId(table) {
  const tableHTML = table.outerHTML.substring(0, 500);
  const hash = this.hashCode(tableHTML);
  const timestamp = Date.now();
  return `table_${timestamp}_${hash}`;
}
```

### 2. Timestamps

Every modification includes ISO 8601 timestamps:
- `data-created`: Table initialization
- `data-last-modified`: Last snapshot save
- `data-modified-time`: Individual cell change

### 3. Original Value Tracking

```javascript
cell.setAttribute('data-original-value', originalValue);
```
Allows rollback and change detection

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Tables detected on page load
- [ ] Assertion dropdown works
- [ ] Conclusion dropdown works
- [ ] CTR cells editable
- [ ] Consolidation table created
- [ ] Conso table updates
- [ ] Resultat table updates

### DOM Persistence
- [ ] Table snapshot created on first interaction
- [ ] Snapshots updated on cell changes
- [ ] Metadata JSON updated
- [ ] Cell changes tracked with attributes
- [ ] Debouncing prevents excessive saves
- [ ] Restoration works on component re-render

### Edge Cases
- [ ] Multiple tables on same page
- [ ] Rapid cell edits
- [ ] Empty tables
- [ ] Tables without headers
- [ ] Tables added dynamically
- [ ] Component unmount/remount

---

## 📝 Migration Notes

### Breaking Changes

1. **No localStorage**: Data does NOT persist across page reloads
2. **No export/import**: Manual export features removed
3. **No storage info**: `getStorageInfo()` removed
4. **In-session only**: All data is session-scoped

### Advantages

1. **No quota limits**: DOM storage has no browser quota
2. **No CORS issues**: Works in all contexts
3. **No security warnings**: No storage APIs used
4. **Better privacy**: No persistent tracking
5. **Simpler debugging**: Data visible in DOM inspector

### Disadvantages

1. **No persistence**: Data lost on page reload
2. **Memory usage**: Full DOM clones stored in memory
3. **Session-scoped**: Cannot share data across tabs

---

## 🔧 Configuration

```javascript
const CONFIG = {
  tableSelector: "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
  checkInterval: 1000,        // Table monitoring interval
  processDelay: 500,          // Delay before processing new tables
  saveDelay: 500,             // Debounce delay for saves
  debugMode: true,            // Enable console logging
  domStoreId: "claraverse-dom-data-store",
  shadowStoreId: "claraverse-shadow-store",
  metaStoreId: "claraverse-meta-store",
};
```

---

## 🐛 Troubleshooting

### Issue: Tables not detected
**Solution**: Check CSS selectors in `CONFIG.tableSelector`

### Issue: Changes not saved
**Solution**: Verify `data-table-id` attribute is set on table

### Issue: Restoration not working
**Solution**: Check DOM store has snapshots: `document.getElementById('claraverse-dom-data-store')`

### Issue: Consolidation not updating
**Solution**: Ensure headers include "assertion", "conclusion", or "ecart"

### Issue: Dropdown not appearing
**Solution**: Check z-index and positioning of dropdown element

---

## 📚 Code Structure

```
conso.js
├── IIFE Wrapper
├── CONFIG Object
├── debug Utilities
├── ClaraverseTableProcessor Class
│   ├── Constructor
│   ├── Initialization Methods
│   │   ├── init()
│   │   ├── initializeDOMPersistence()
│   │   ├── waitForReact()
│   │   └── startTableMonitoring()
│   ├── Table Processing
│   │   ├── findAllTables()
│   │   ├── processAllTables()
│   │   ├── processTable()
│   │   ├── getTableHeaders()
│   │   └── isModelizedTable()
│   ├── DOM Persistence
│   │   ├── initializeTableInDOM()
│   │   ├── saveTableToDOM()
│   │   ├── saveCellChangeToDOM()
│   │   ├── saveConsolidationToDOM()
│   │   ├── restoreAllTablesFromDOM()
│   │   ├── restoreTableFromSnapshot()
│   │   ├── handleCellChange()
│   │   └── debounceSaveToDOM()
│   ├── User Interactions
│   │   ├── setupTableInteractions()
│   │   ├── setupAssertionCell()
│   │   ├── setupConclusionCell()
│   │   ├── setupCtrCell()
│   │   ├── setupTableChangeDetection()
│   │   ├── showDropdown()
│   │   └── hideDropdown()
│   ├── Consolidation
│   │   ├── createConsolidationTable()
│   │   ├── scheduleConsolidation()
│   │   ├── performConsolidation()
│   │   ├── formatConsolidation()
│   │   ├── updateConsoTable()
│   │   └── updateResultatTable()
│   ├── Utilities
│   │   ├── generateTableId()
│   │   ├── generateUniqueTableId()
│   │   ├── hashCode()
│   │   ├── parseMontant()
│   │   └── formatMontant()
│   └── Lifecycle
│       ├── setupGlobalEventListeners()
│       └── destroy()
├── Global Initialization
│   ├── initClaraverseProcessor()
│   └── Auto-init Logic
└── Global Exports
    ├── window.ClaraverseTableProcessor
    └── window.initClaraverseProcessor
```

---

## 🎓 Best Practices

### 1. Always Use data-table-id
Ensure every table has a unique ID for persistence tracking.

### 2. Monitor DOM Store Size
Large tables = large snapshots. Monitor memory usage.

### 3. Cleanup on Unmount
React components should call `processor.destroy()` on unmount.

### 4. Debounce User Input
500ms debounce prevents excessive DOM operations.

### 5. Use MutationObserver
Automatically detect new tables in dynamic SPAs.

---

## 🔮 Future Enhancements

### Possible Improvements

1. **IndexedDB Integration** (optional)
   - For persistent storage across sessions
   - Async API for large datasets
   
2. **Version History**
   - Keep multiple snapshots
   - Undo/redo functionality
   
3. **Compression**
   - Compress snapshots with LZString
   - Reduce memory footprint
   
4. **Export to JSON**
   - Manual export via browser DevTools
   - Download button for users
   
5. **Real-time Collaboration**
   - WebSocket integration
   - Multi-user editing

---

## ✅ Validation

### DOM Store Validation

```javascript
// Check DOM store exists
const domStore = document.getElementById('claraverse-dom-data-store');
console.assert(domStore !== null, 'DOM store must exist');

// Check tables stored
const storedTables = domStore.querySelectorAll('[data-table-ref]');
console.log(`Stored tables: ${storedTables.length}`);

// Check metadata
const metaStore = document.getElementById('claraverse-meta-store');
const metadata = JSON.parse(metaStore.textContent);
console.log('Metadata:', metadata);
```

### Table Validation

```javascript
// Check all tables have IDs
const tables = document.querySelectorAll('table');
tables.forEach(table => {
  const hasId = table.hasAttribute('data-table-id');
  console.log(`Table has ID: ${hasId}`);
});

// Check cell tracking
const cells = document.querySelectorAll('td[data-original-value]');
console.log(`Tracked cells: ${cells.length}`);
```

---

## 📄 License & Credits

**Author**: Claraverse Development Team
**Version**: 2.0.0
**Date**: January 2025
**License**: MIT

---

## 📞 Support

For issues or questions:
1. Check browser console for debug logs
2. Inspect DOM stores in DevTools
3. Verify table structure matches expected format
4. Review this documentation

---

**END OF DOCUMENT**