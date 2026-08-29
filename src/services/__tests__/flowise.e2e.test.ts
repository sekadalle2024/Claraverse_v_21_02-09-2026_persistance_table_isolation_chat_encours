/**
 * Flowise Table Persistence - End-to-End Test Suite
 * 
 * Comprehensive end-to-end tests for Task 14.1:
 * - Test full save and restore cycle
 * - Test multiple sessions with isolation
 * - Test duplicate prevention
 * - Test error handling
 * 
 * Requirements: 1.1, 1.2, 3.1, 3.2, 9.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlowiseTableBridge } from '../flowiseTableBridge';
import { flowiseTableService } from '../flowiseTableService';
import { indexedDBService } from '../indexedDB';

const TEST_TIMEOUT = 30000;

// Helper to wait for async operations
const waitForAsync = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create a mock table element
function createMockTable(data: { headers: string[], rows: string[][] }): HTMLTableElement {
  const table = document.createElement('table');
  
  // Create thead
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  data.headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create tbody
  const tbody = document.createElement('tbody');
  data.rows.forEach(rowData => {
    const row = document.createElement('tr');
    rowData.forEach(cellData => {
      const td = document.createElement('td');
      td.textContent = cellData;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  
  return table;
}

// Helper to simulate Flowise event
function emitFlowiseEvent(table: HTMLTableElement, keyword: string, source: 'n8n' | 'cached' | 'error' = 'n8n') {
  const event = new CustomEvent('flowise:table:integrated', {
    detail: {
      table,
      keyword,
      source,
      timestamp: Date.now()
    }
  });
  document.dispatchEvent(event);
}

// Helper to simulate session change
function emitSessionChangeEvent(sessionId: string) {
  const event = new CustomEvent('claraverse:session:changed', {
    detail: { sessionId }
  });
  document.dispatchEvent(event);
}

describe('Flowise Table Persistence - End-to-End Tests', () => {
  let bridge: FlowiseTableBridge;

  beforeEach(async () => {
    // Clear DOM
    document.body.innerHTML = '';
    
    // Clear window state
    delete (window as any).claraverseState;
    window.history.pushState({}, '', window.location.pathname);
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Clear IndexedDB
    try {
      await flowiseTableService.clearAllTables();
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  });

  afterEach(async () => {
    vi.clearAllMocks();
    try {
      await flowiseTableService.clearAllTables();
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  });

  describe('E2E Test 1: Full Save and Restore Cycle', () => {
    /**
     * Test complete workflow from table generation to restoration
     * Requirements: 1.1, 1.2, 3.1, 3.2
     */
    it('should complete full save and restore cycle', async () => {
      const sessionId = 'e2e-full-cycle-session';
      
      // Step 1: Initialize bridge with session
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Step 2: Generate and save table via Flowise event
      const table = createMockTable({
        headers: ['Product', 'Price', 'Stock'],
        rows: [
          ['Laptop', '$999', '10'],
          ['Mouse', '$29', '50'],
          ['Keyboard', '$79', '30']
        ]
      });

      emitFlowiseEvent(table, 'Inventory', 'n8n');
      await waitForAsync();

      // Step 3: Verify table was saved to IndexedDB
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(1);
      expect(savedTables[0].keyword).toBe('Inventory');
      expect(savedTables[0].source).toBe('n8n');
      expect(savedTables[0].sessionId).toBe(sessionId);
      expect(savedTables[0].metadata.rowCount).toBe(4); // header + 3 data rows
      expect(savedTables[0].metadata.colCount).toBe(3);

      // Step 4: Simulate page reload (clear DOM)
      document.body.innerHTML = '';

      // Step 5: Restore tables on new page load
      const newBridge = new FlowiseTableBridge();
      newBridge.setCurrentSession(sessionId);
      await newBridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Step 6: Verify table was restored to DOM
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('Inventory');

      // Step 7: Verify table content is preserved
      const restoredTable = restoredTables[0].querySelector('table');
      expect(restoredTable).toBeTruthy();
      
      const headers = restoredTable?.querySelectorAll('th');
      expect(headers?.length).toBe(3);
      expect(headers?.[0].textContent).toBe('Product');
      expect(headers?.[1].textContent).toBe('Price');
      expect(headers?.[2].textContent).toBe('Stock');

      const cells = restoredTable?.querySelectorAll('td');
      expect(cells?.length).toBe(9); // 3 rows × 3 columns
      expect(cells?.[0].textContent).toBe('Laptop');
      expect(cells?.[1].textContent).toBe('$999');
    }, TEST_TIMEOUT);

    it('should preserve table attributes and metadata through cycle', async () => {
      const sessionId = 'e2e-metadata-cycle';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      const table = createMockTable({
        headers: ['Name', 'Email', 'Role'],
        rows: [
          ['Alice', 'alice@example.com', 'Admin'],
          ['Bob', 'bob@example.com', 'User']
        ]
      });

      emitFlowiseEvent(table, 'Users', 'n8n');
      await waitForAsync();

      // Verify saved metadata
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      const savedTable = savedTables[0];
      
      expect(savedTable.metadata.headers).toEqual(['Name', 'Email', 'Role']);
      expect(savedTable.metadata.rowCount).toBe(3);
      expect(savedTable.metadata.colCount).toBe(3);
      expect(savedTable.fingerprint).toBeTruthy();
      expect(savedTable.timestamp).toBeTruthy();

      // Restore and verify attributes
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      const restoredElement = document.querySelector('[data-restored="true"]');
      expect(restoredElement?.getAttribute('data-n8n-keyword')).toBe('Users');
      expect(restoredElement?.getAttribute('data-n8n-table')).toBe('true');
      expect(restoredElement?.getAttribute('data-table-id')).toBe(savedTable.id);
    }, TEST_TIMEOUT);

    it('should handle multiple tables in single session', async () => {
      const sessionId = 'e2e-multiple-tables';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Save three different tables
      const tables = [
        { keyword: 'Products', headers: ['Product'], rows: [['Item 1']] },
        { keyword: 'Orders', headers: ['Order'], rows: [['Order 1']] },
        { keyword: 'Customers', headers: ['Customer'], rows: [['Customer 1']] }
      ];

      for (const tableData of tables) {
        const table = createMockTable(tableData);
        emitFlowiseEvent(table, tableData.keyword, 'n8n');
        await waitForAsync(50);
      }

      // Verify all saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(3);

      // Restore all
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify all restored
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(3);

      const keywords = Array.from(restoredTables).map(el => 
        el.getAttribute('data-n8n-keyword')
      );
      expect(keywords).toContain('Products');
      expect(keywords).toContain('Orders');
      expect(keywords).toContain('Customers');
    }, TEST_TIMEOUT);
  });

  describe('E2E Test 2: Multiple Sessions with Isolation', () => {
    /**
     * Test session isolation and switching
     * Requirements: 9.3
     */
    it('should isolate tables between different sessions', async () => {
      const session1 = 'e2e-session-1';
      const session2 = 'e2e-session-2';
      
      bridge = new FlowiseTableBridge();

      // Save tables for session 1
      bridge.setCurrentSession(session1);
      const table1 = createMockTable({
        headers: ['Session 1 Data'],
        rows: [['Data for session 1']]
      });
      emitFlowiseEvent(table1, 'Session1Table', 'n8n');
      await waitForAsync();

      // Save tables for session 2
      bridge.setCurrentSession(session2);
      const table2 = createMockTable({
        headers: ['Session 2 Data'],
        rows: [['Data for session 2']]
      });
      emitFlowiseEvent(table2, 'Session2Table', 'n8n');
      await waitForAsync();

      // Verify isolation in storage
      const session1Tables = await flowiseTableService.restoreSessionTables(session1);
      const session2Tables = await flowiseTableService.restoreSessionTables(session2);
      
      expect(session1Tables).toHaveLength(1);
      expect(session2Tables).toHaveLength(1);
      expect(session1Tables[0].keyword).toBe('Session1Table');
      expect(session2Tables[0].keyword).toBe('Session2Table');

      // Restore session 1 only
      document.body.innerHTML = '';
      bridge.setCurrentSession(session1);
      await bridge.restoreTablesForSession(session1);
      await waitForAsync();

      let restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('Session1Table');

      // Switch to session 2
      document.body.innerHTML = '';
      bridge.setCurrentSession(session2);
      await bridge.restoreTablesForSession(session2);
      await waitForAsync();

      restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('Session2Table');
    }, TEST_TIMEOUT);

    it('should handle session switching via events', async () => {
      const session1 = 'e2e-event-session-1';
      const session2 = 'e2e-event-session-2';
      
      bridge = new FlowiseTableBridge();

      // Save tables for both sessions
      bridge.setCurrentSession(session1);
      const table1 = createMockTable({
        headers: ['S1'],
        rows: [['Session 1']]
      });
      emitFlowiseEvent(table1, 'S1Table', 'n8n');
      await waitForAsync();

      bridge.setCurrentSession(session2);
      const table2 = createMockTable({
        headers: ['S2'],
        rows: [['Session 2']]
      });
      emitFlowiseEvent(table2, 'S2Table', 'n8n');
      await waitForAsync();

      // Switch via event to session 1
      document.body.innerHTML = '';
      emitSessionChangeEvent(session1);
      await waitForAsync();

      let restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('S1Table');

      // Switch via event to session 2
      document.body.innerHTML = '';
      emitSessionChangeEvent(session2);
      await waitForAsync();

      restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('S2Table');
    }, TEST_TIMEOUT);

    it('should maintain isolation with same keyword across sessions', async () => {
      const session1 = 'e2e-same-keyword-1';
      const session2 = 'e2e-same-keyword-2';
      const sharedKeyword = 'SharedKeyword';
      
      bridge = new FlowiseTableBridge();

      // Save table with same keyword in session 1
      bridge.setCurrentSession(session1);
      const table1 = createMockTable({
        headers: ['Session 1'],
        rows: [['Different content 1']]
      });
      emitFlowiseEvent(table1, sharedKeyword, 'n8n');
      await waitForAsync();

      // Save table with same keyword in session 2
      bridge.setCurrentSession(session2);
      const table2 = createMockTable({
        headers: ['Session 2'],
        rows: [['Different content 2']]
      });
      emitFlowiseEvent(table2, sharedKeyword, 'n8n');
      await waitForAsync();

      // Verify both saved with same keyword but different sessions
      const session1Tables = await flowiseTableService.restoreSessionTables(session1);
      const session2Tables = await flowiseTableService.restoreSessionTables(session2);
      
      expect(session1Tables).toHaveLength(1);
      expect(session2Tables).toHaveLength(1);
      expect(session1Tables[0].keyword).toBe(sharedKeyword);
      expect(session2Tables[0].keyword).toBe(sharedKeyword);
      expect(session1Tables[0].fingerprint).not.toBe(session2Tables[0].fingerprint);

      // Restore and verify isolation
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(session1);
      await waitForAsync();

      const restoredTable = document.querySelector('[data-restored="true"] table');
      const header = restoredTable?.querySelector('th');
      expect(header?.textContent).toBe('Session 1');
    }, TEST_TIMEOUT);
  });

  describe('E2E Test 3: Duplicate Prevention', () => {
    /**
     * Test duplicate detection across the full workflow
     * Requirements: 3.1, 3.2
     */
    it('should prevent duplicate tables with identical content', async () => {
      const sessionId = 'e2e-duplicate-prevention';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      const tableData = {
        headers: ['Name', 'Value'],
        rows: [['Test', '123']]
      };

      // Save first table
      const table1 = createMockTable(tableData);
      emitFlowiseEvent(table1, 'DuplicateTest', 'n8n');
      await waitForAsync();

      // Try to save duplicate
      const table2 = createMockTable(tableData);
      emitFlowiseEvent(table2, 'DuplicateTest', 'n8n');
      await waitForAsync();

      // Verify only one table saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(1);

      // Restore and verify only one in DOM
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(1);
    }, TEST_TIMEOUT);

    it('should allow tables with same keyword but different content', async () => {
      const sessionId = 'e2e-same-keyword-different-content';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Save first table
      const table1 = createMockTable({
        headers: ['Name'],
        rows: [['Alice']]
      });
      emitFlowiseEvent(table1, 'SameKeyword', 'n8n');
      await waitForAsync();

      // Save second table with same keyword but different content
      const table2 = createMockTable({
        headers: ['Name'],
        rows: [['Bob']]
      });
      emitFlowiseEvent(table2, 'SameKeyword', 'n8n');
      await waitForAsync();

      // Verify both saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(2);
      expect(savedTables[0].keyword).toBe('SameKeyword');
      expect(savedTables[1].keyword).toBe('SameKeyword');
      expect(savedTables[0].fingerprint).not.toBe(savedTables[1].fingerprint);

      // Restore and verify both in DOM
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(2);
    }, TEST_TIMEOUT);

    it('should detect duplicates after page reload', async () => {
      const sessionId = 'e2e-duplicate-after-reload';
      
      // First page load - save table
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      const tableData = {
        headers: ['Data'],
        rows: [['Original']]
      };

      const table1 = createMockTable(tableData);
      emitFlowiseEvent(table1, 'ReloadTest', 'n8n');
      await waitForAsync();

      // Simulate page reload
      document.body.innerHTML = '';
      const newBridge = new FlowiseTableBridge();
      newBridge.setCurrentSession(sessionId);
      await newBridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Try to save duplicate after reload
      const table2 = createMockTable(tableData);
      emitFlowiseEvent(table2, 'ReloadTest', 'n8n');
      await waitForAsync();

      // Verify still only one table
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(1);
    }, TEST_TIMEOUT);
  });

  describe('E2E Test 4: Error Handling', () => {
    /**
     * Test error scenarios and recovery
     * Requirements: 3.1, 3.2
     */
    it('should handle and persist error tables', async () => {
      const sessionId = 'e2e-error-handling';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Create error table
      const errorTable = createMockTable({
        headers: ['Error'],
        rows: [['N8N endpoint failed']]
      });

      emitFlowiseEvent(errorTable, 'ErrorTest', 'error');
      await waitForAsync();

      // Verify error table saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(1);
      expect(savedTables[0].source).toBe('error');

      // Restore and verify error table in DOM
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(1);
    }, TEST_TIMEOUT);

    it('should emit error events on save failure', async () => {
      const sessionId = 'e2e-save-failure';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Mock save to fail
      const originalSave = flowiseTableService.saveGeneratedTable;
      vi.spyOn(flowiseTableService, 'saveGeneratedTable').mockRejectedValue(
        new Error('Storage quota exceeded')
      );

      // Track error event
      let errorEventReceived = false;
      let errorDetail: any = null;
      document.addEventListener('storage:table:error', (event: Event) => {
        errorEventReceived = true;
        errorDetail = (event as CustomEvent).detail;
      });

      const table = createMockTable({
        headers: ['Test'],
        rows: [['Data']]
      });

      emitFlowiseEvent(table, 'FailTest', 'n8n');
      await waitForAsync();

      // Verify error event emitted
      expect(errorEventReceived).toBe(true);
      expect(errorDetail.error).toContain('Storage quota exceeded');
      expect(errorDetail.sessionId).toBe(sessionId);

      // Restore original
      flowiseTableService.saveGeneratedTable = originalSave;
    }, TEST_TIMEOUT);

    it('should handle missing session gracefully', async () => {
      // Create bridge without session
      bridge = new FlowiseTableBridge();
      // Don't set session

      const table = createMockTable({
        headers: ['NoSession'],
        rows: [['Test']]
      });

      emitFlowiseEvent(table, 'NoSessionTest', 'n8n');
      await waitForAsync();

      // Verify temporary session created
      const currentSession = bridge.getCurrentSession();
      expect(currentSession).toBeTruthy();
      expect(currentSession).toMatch(/^temp-session-/);

      // Verify table saved with temporary session
      const savedTables = await flowiseTableService.restoreSessionTables(currentSession!);
      expect(savedTables).toHaveLength(1);
    }, TEST_TIMEOUT);

    it('should recover from restoration errors', async () => {
      const sessionId = 'e2e-restoration-error';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Save valid table
      const table = createMockTable({
        headers: ['Valid'],
        rows: [['Data']]
      });
      emitFlowiseEvent(table, 'ValidTable', 'n8n');
      await waitForAsync();

      // Mock restoration to fail once
      let restoreAttempts = 0;
      const originalRestore = flowiseTableService.restoreSessionTables;
      vi.spyOn(flowiseTableService, 'restoreSessionTables').mockImplementation(async (sid) => {
        restoreAttempts++;
        if (restoreAttempts === 1) {
          throw new Error('Temporary restoration error');
        }
        return originalRestore.call(flowiseTableService, sid);
      });

      // Try to restore
      document.body.innerHTML = '';
      try {
        await bridge.restoreTablesForSession(sessionId);
      } catch (error) {
        // Expected first failure
      }

      // Retry should succeed
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify restoration succeeded on retry
      expect(restoreAttempts).toBeGreaterThanOrEqual(2);

      // Restore original
      flowiseTableService.restoreSessionTables = originalRestore;
    }, TEST_TIMEOUT);
  });

  describe('E2E Test 5: Session Deletion with Cascade Cleanup', () => {
    /**
     * Test session deletion cascades to tables
     * Requirements: 9.3
     */
    it('should delete all tables when session is deleted', async () => {
      const sessionId = 'e2e-cascade-delete';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Save multiple tables
      for (let i = 0; i < 3; i++) {
        const table = createMockTable({
          headers: [`Table ${i}`],
          rows: [[`Data ${i}`]]
        });
        emitFlowiseEvent(table, `Table${i}`, 'n8n');
        await waitForAsync(50);
      }

      // Verify tables saved
      let savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(3);

      // Delete session tables
      const deletedCount = await flowiseTableService.deleteSessionTables(sessionId);
      expect(deletedCount).toBe(3);

      // Verify tables deleted
      savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(0);

      // Try to restore - should find nothing
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(0);
    }, TEST_TIMEOUT);
  });

  describe('E2E Test 6: Complete Workflow with All Features', () => {
    /**
     * Test complete workflow combining all features
     * Requirements: All
     */
    it('should handle complex multi-session workflow', async () => {
      const session1 = 'e2e-complex-1';
      const session2 = 'e2e-complex-2';
      
      bridge = new FlowiseTableBridge();

      // Session 1: Save multiple tables
      bridge.setCurrentSession(session1);
      
      const s1tables = [
        { keyword: 'Products', headers: ['Product', 'Price'], rows: [['Laptop', '$999']] },
        { keyword: 'Orders', headers: ['Order', 'Status'], rows: [['#001', 'Shipped']] }
      ];

      for (const tableData of s1tables) {
        const table = createMockTable(tableData);
        emitFlowiseEvent(table, tableData.keyword, 'n8n');
        await waitForAsync(50);
      }

      // Session 2: Save different tables
      bridge.setCurrentSession(session2);
      
      const s2tables = [
        { keyword: 'Users', headers: ['User', 'Role'], rows: [['Alice', 'Admin']] },
        { keyword: 'Settings', headers: ['Key', 'Value'], rows: [['theme', 'dark']] }
      ];

      for (const tableData of s2tables) {
        const table = createMockTable(tableData);
        emitFlowiseEvent(table, tableData.keyword, 'n8n');
        await waitForAsync(50);
      }

      // Try to save duplicate in session 2
      const duplicateTable = createMockTable(s2tables[0]);
      emitFlowiseEvent(duplicateTable, 'Users', 'n8n');
      await waitForAsync();

      // Verify session 1 has 2 tables
      const session1Tables = await flowiseTableService.restoreSessionTables(session1);
      expect(session1Tables).toHaveLength(2);

      // Verify session 2 has 2 tables (duplicate prevented)
      const session2Tables = await flowiseTableService.restoreSessionTables(session2);
      expect(session2Tables).toHaveLength(2);

      // Restore session 1
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(session1);
      await waitForAsync();

      let restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(2);

      // Switch to session 2
      document.body.innerHTML = '';
      emitSessionChangeEvent(session2);
      await waitForAsync();

      restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(2);

      // Delete session 1 tables
      await flowiseTableService.deleteSessionTables(session1);

      // Verify session 1 tables deleted
      const session1TablesAfter = await flowiseTableService.restoreSessionTables(session1);
      expect(session1TablesAfter).toHaveLength(0);

      // Verify session 2 tables still exist
      const session2TablesAfter = await flowiseTableService.restoreSessionTables(session2);
      expect(session2TablesAfter).toHaveLength(2);
    }, TEST_TIMEOUT);
  });
});
