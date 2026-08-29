/**
 * FlowiseTableBridge Restoration System Tests
 * 
 * Tests for the table restoration system including:
 * - Restoration on session change
 * - Container creation for missing containers
 * - Chronological ordering
 * - Multiple tables in same container
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlowiseTableBridge } from '../flowiseTableBridge';
import { flowiseTableService } from '../flowiseTableService';

// Set test timeout
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

describe('FlowiseTableBridge - Restoration System Tests', () => {
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
  }, TEST_TIMEOUT);

  afterEach(async () => {
    vi.clearAllMocks();
    try {
      await flowiseTableService.clearAllTables();
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }, TEST_TIMEOUT);

  describe('Restoration on Session Change', () => {
    /**
     * Test that tables are restored when session changes
     * Requirement: 4.2
     */
    it('should restore tables when session changes via event', async () => {
      // Setup: Create bridge and save tables for a session
      bridge = new FlowiseTableBridge();
      const sessionId = 'session-change-test-1';
      bridge.setCurrentSession(sessionId);

      // Save a table
      const table = createMockTable({
        headers: ['Product', 'Price'],
        rows: [['Laptop', '$999'], ['Mouse', '$29']]
      });

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table,
          keyword: 'Products',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
      });
      document.dispatchEvent(event);
      await waitForAsync();

      // Verify table was saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(1);

      // Clear DOM to simulate page navigation
      document.body.innerHTML = '';

      // Trigger session change event
      const sessionChangeEvent = new CustomEvent('claraverse:session:changed', {
        detail: { sessionId }
      });
      document.dispatchEvent(sessionChangeEvent);
      await waitForAsync();

      // Verify: Table was restored
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('Products');
    }, TEST_TIMEOUT);

    it('should only restore tables for the active session', async () => {
      bridge = new FlowiseTableBridge();

      // Save tables for two different sessions
      const session1 = 'session-isolation-1';
      const session2 = 'session-isolation-2';

      // Session 1 table
      bridge.setCurrentSession(session1);
      const table1 = createMockTable({
        headers: ['Session 1'],
        rows: [['Data 1']]
      });
      document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
        detail: { table: table1, keyword: 'Session1Table', source: 'n8n' as const, timestamp: Date.now() }
      }));
      await waitForAsync();

      // Session 2 table
      bridge.setCurrentSession(session2);
      const table2 = createMockTable({
        headers: ['Session 2'],
        rows: [['Data 2']]
      });
      document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
        detail: { table: table2, keyword: 'Session2Table', source: 'n8n' as const, timestamp: Date.now() }
      }));
      await waitForAsync();

      // Clear DOM
      document.body.innerHTML = '';

      // Restore session 1
      document.dispatchEvent(new CustomEvent('claraverse:session:changed', {
        detail: { sessionId: session1 }
      }));
      await waitForAsync();

      // Verify: Only session 1 table is restored
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('Session1Table');
    }, TEST_TIMEOUT);

    it('should clear previous session tables when switching sessions', async () => {
      bridge = new FlowiseTableBridge();

      const session1 = 'session-switch-1';
      const session2 = 'session-switch-2';

      // Save and restore session 1
      bridge.setCurrentSession(session1);
      const table1 = createMockTable({
        headers: ['First'],
        rows: [['Data']]
      });
      document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
        detail: { table: table1, keyword: 'FirstTable', source: 'n8n' as const, timestamp: Date.now() }
      }));
      await waitForAsync();

      await bridge.restoreTablesForSession(session1);
      await waitForAsync();

      expect(document.querySelectorAll('[data-restored="true"]').length).toBe(1);

      // Save session 2 table
      bridge.setCurrentSession(session2);
      const table2 = createMockTable({
        headers: ['Second'],
        rows: [['Data']]
      });
      document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
        detail: { table: table2, keyword: 'SecondTable', source: 'n8n' as const, timestamp: Date.now() }
      }));
      await waitForAsync();

      // Clear DOM and switch to session 2
      document.body.innerHTML = '';
      document.dispatchEvent(new CustomEvent('claraverse:session:changed', {
        detail: { sessionId: session2 }
      }));
      await waitForAsync();

      // Verify: Only session 2 table is present
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('SecondTable');
    }, TEST_TIMEOUT);
  });

  describe('Container Creation for Missing Containers', () => {
    /**
     * Test that containers are created when they don't exist
     * Requirement: 4.3, 4.4
     */
    it('should create container if it does not exist during restoration', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'container-creation-test';
      bridge.setCurrentSession(sessionId);

      // Save a table
      const table = createMockTable({
        headers: ['Test'],
        rows: [['Data']]
      });
      document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
        detail: { table, keyword: 'TestTable', source: 'n8n' as const, timestamp: Date.now() }
      }));
      await waitForAsync();

      // Clear DOM completely (no containers)
      document.body.innerHTML = '';

      // Restore tables
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: Container was created
      const container = document.querySelector('[data-restored-container="true"]');
      expect(container).toBeTruthy();
      expect(container?.getAttribute('data-container-id')).toBeTruthy();

      // Verify: Table was injected into the created container
      const restoredTable = container?.querySelector('[data-restored="true"]');
      expect(restoredTable).toBeTruthy();
    }, TEST_TIMEOUT);

    it('should create container with proper prose classes', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'prose-classes-test';
      bridge.setCurrentSession(sessionId);

      // Save a table
      const table = createMockTable({
        headers: ['Column'],
        rows: [['Value']]
      });
      document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
        detail: { table, keyword: 'ProseTest', source: 'n8n' as const, timestamp: Date.now() }
      }));
      await waitForAsync();

      // Clear DOM
      document.body.innerHTML = '';

      // Restore
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: Container has proper classes
      const container = document.querySelector('[data-restored-container="true"]');
      expect(container).toBeTruthy();
      expect(container?.className).toContain('prose');
      expect(container?.className).toContain('prose-base');
      expect(container?.className).toContain('dark:prose-invert');
      expect(container?.className).toContain('max-w-none');
    }, TEST_TIMEOUT);

    it('should create multiple containers for different container IDs', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'multi-container-test';
      bridge.setCurrentSession(sessionId);

      // Save tables with different container IDs
      const table1 = createMockTable({
        headers: ['Container 1'],
        rows: [['Data 1']]
      });
      const table2 = createMockTable({
        headers: ['Container 2'],
        rows: [['Data 2']]
      });

      // Manually save with different container IDs
      await flowiseTableService.saveGeneratedTable(sessionId, table1, 'Table1', 'n8n');
      await flowiseTableService.saveGeneratedTable(sessionId, table2, 'Table2', 'n8n');

      // Clear DOM
      document.body.innerHTML = '';

      // Restore
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: Multiple containers created
      const containers = document.querySelectorAll('[data-restored-container="true"]');
      expect(containers.length).toBeGreaterThanOrEqual(1);
    }, TEST_TIMEOUT);

    it('should use existing container if it exists', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'existing-container-test';
      bridge.setCurrentSession(sessionId);

      // Create a container manually
      const existingContainer = document.createElement('div');
      const containerId = 'existing-container-123';
      existingContainer.setAttribute('data-container-id', containerId);
      existingContainer.className = 'prose';
      document.body.appendChild(existingContainer);

      // Save a table (it will use a generated container ID)
      const table = createMockTable({
        headers: ['Test'],
        rows: [['Data']]
      });
      document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
        detail: { table, keyword: 'ExistingTest', source: 'n8n' as const, timestamp: Date.now() }
      }));
      await waitForAsync();

      // Get the saved table to check its container ID
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables.length).toBe(1);

      // Clear DOM except our existing container
      document.body.innerHTML = '';
      document.body.appendChild(existingContainer);

      // Restore
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: At least one container exists (either existing or new)
      const containers = document.querySelectorAll('[data-container-id]');
      expect(containers.length).toBeGreaterThanOrEqual(1);
    }, TEST_TIMEOUT);
  });

  describe('Chronological Ordering', () => {
    /**
     * Test that tables are restored in chronological order
     * Requirement: 4.2, 4.5
     */
    it('should restore tables in chronological order by timestamp', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'chronological-test';
      bridge.setCurrentSession(sessionId);

      // Save three tables with different timestamps
      const tables = [
        { keyword: 'FirstTable', data: 'First', delay: 0 },
        { keyword: 'SecondTable', data: 'Second', delay: 50 },
        { keyword: 'ThirdTable', data: 'Third', delay: 100 }
      ];

      for (const tableData of tables) {
        await waitForAsync(tableData.delay);
        const table = createMockTable({
          headers: ['Data'],
          rows: [[tableData.data]]
        });
        document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
          detail: { table, keyword: tableData.keyword, source: 'n8n' as const, timestamp: Date.now() }
        }));
        await waitForAsync(10);
      }

      // Wait for all saves to complete
      await waitForAsync(100);

      // Clear DOM
      document.body.innerHTML = '';

      // Restore tables
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: Tables are restored in chronological order
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(3);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('FirstTable');
      expect(restoredTables[1].getAttribute('data-n8n-keyword')).toBe('SecondTable');
      expect(restoredTables[2].getAttribute('data-n8n-keyword')).toBe('ThirdTable');
    }, TEST_TIMEOUT);

    it('should maintain chronological order across multiple containers', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'multi-container-chronological';
      bridge.setCurrentSession(sessionId);

      // Save tables with timestamps, alternating containers
      const table1 = createMockTable({ headers: ['T1'], rows: [['First']] });
      await flowiseTableService.saveGeneratedTable(sessionId, table1, 'Table1', 'n8n');
      await waitForAsync(50);

      const table2 = createMockTable({ headers: ['T2'], rows: [['Second']] });
      await flowiseTableService.saveGeneratedTable(sessionId, table2, 'Table2', 'n8n');
      await waitForAsync(50);

      const table3 = createMockTable({ headers: ['T3'], rows: [['Third']] });
      await flowiseTableService.saveGeneratedTable(sessionId, table3, 'Table3', 'n8n');

      // Clear DOM
      document.body.innerHTML = '';

      // Restore
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: Tables appear in chronological order
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(3);

      // Check timestamps are in ascending order
      const timestamps = Array.from(restoredTables).map(table => 
        new Date(table.getAttribute('data-timestamp') || '').getTime()
      );
      
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
      }
    }, TEST_TIMEOUT);

    it('should preserve creation order when timestamps are very close', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'close-timestamps-test';
      bridge.setCurrentSession(sessionId);

      // Save tables rapidly (close timestamps)
      const keywords = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      for (const keyword of keywords) {
        const table = createMockTable({
          headers: [keyword],
          rows: [['Data']]
        });
        document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
          detail: { table, keyword, source: 'n8n' as const, timestamp: Date.now() }
        }));
        await waitForAsync(5); // Very short delay
      }

      await waitForAsync(100);

      // Clear DOM
      document.body.innerHTML = '';

      // Restore
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: Tables are in order
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(4);

      const restoredKeywords = Array.from(restoredTables).map(table =>
        table.getAttribute('data-n8n-keyword')
      );

      expect(restoredKeywords).toEqual(keywords);
    }, TEST_TIMEOUT);
  });

  describe('Multiple Tables in Same Container', () => {
    /**
     * Test handling of multiple tables in the same container
     * Requirement: 4.5
     */
    it('should restore multiple tables in the same container', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'same-container-test';
      bridge.setCurrentSession(sessionId);

      // Create a specific container
      const containerId = 'shared-container-123';
      const container = document.createElement('div');
      container.setAttribute('data-container-id', containerId);
      document.body.appendChild(container);

      // Save multiple tables to the same container
      const table1 = createMockTable({ headers: ['Table 1'], rows: [['Data 1']] });
      const table2 = createMockTable({ headers: ['Table 2'], rows: [['Data 2']] });
      const table3 = createMockTable({ headers: ['Table 3'], rows: [['Data 3']] });

      // Save with same container ID
      await flowiseTableService.saveGeneratedTable(sessionId, table1, 'Table1', 'n8n');
      await waitForAsync(50);
      await flowiseTableService.saveGeneratedTable(sessionId, table2, 'Table2', 'n8n');
      await waitForAsync(50);
      await flowiseTableService.saveGeneratedTable(sessionId, table3, 'Table3', 'n8n');

      // Clear DOM
      document.body.innerHTML = '';

      // Restore
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: All tables restored
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(3);
    }, TEST_TIMEOUT);

    it('should maintain position order within same container', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'position-order-test';
      bridge.setCurrentSession(sessionId);

      // Save tables with explicit positions
      const tables = [
        { keyword: 'Position0', data: 'First', position: 0 },
        { keyword: 'Position1', data: 'Second', position: 1 },
        { keyword: 'Position2', data: 'Third', position: 2 }
      ];

      for (const tableData of tables) {
        const table = createMockTable({
          headers: [tableData.keyword],
          rows: [[tableData.data]]
        });
        await flowiseTableService.saveGeneratedTable(sessionId, table, tableData.keyword, 'n8n');
        await waitForAsync(50);
      }

      // Clear DOM
      document.body.innerHTML = '';

      // Restore
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: Tables are in position order
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(3);

      // Check they appear in the correct order
      const keywords = Array.from(restoredTables).map(table =>
        table.getAttribute('data-n8n-keyword')
      );
      expect(keywords[0]).toBe('Position0');
      expect(keywords[1]).toBe('Position1');
      expect(keywords[2]).toBe('Position2');
    }, TEST_TIMEOUT);

    it('should handle tables with different sources in same container', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'mixed-sources-test';
      bridge.setCurrentSession(sessionId);

      // Save tables with different sources
      const table1 = createMockTable({ headers: ['N8N'], rows: [['From n8n']] });
      const table2 = createMockTable({ headers: ['Cached'], rows: [['From cache']] });
      const table3 = createMockTable({ headers: ['Error'], rows: [['Error msg']] });

      await flowiseTableService.saveGeneratedTable(sessionId, table1, 'N8NTable', 'n8n');
      await waitForAsync(50);
      await flowiseTableService.saveGeneratedTable(sessionId, table2, 'CachedTable', 'cached');
      await waitForAsync(50);
      await flowiseTableService.saveGeneratedTable(sessionId, table3, 'ErrorTable', 'error');

      // Clear DOM
      document.body.innerHTML = '';

      // Restore
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: All tables restored with correct sources
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(3);

      const sources = Array.from(restoredTables).map(table =>
        table.getAttribute('data-source')
      );
      expect(sources).toContain('n8n');
      expect(sources).toContain('cached');
      expect(sources).toContain('error');
    }, TEST_TIMEOUT);

    it('should handle empty containers gracefully', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'empty-container-test';
      bridge.setCurrentSession(sessionId);

      // Don't save any tables
      
      // Clear DOM
      document.body.innerHTML = '';

      // Restore (should not throw)
      await expect(bridge.restoreTablesForSession(sessionId)).resolves.not.toThrow();

      // Verify: No tables restored
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(0);
    }, TEST_TIMEOUT);
  });

  describe('Complete Restoration Workflow', () => {
    /**
     * Test complete end-to-end restoration scenarios
     * Requirements: 4.2, 4.3, 4.4, 4.5
     */
    it('should handle complete restoration workflow with all features', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'complete-workflow-test';
      bridge.setCurrentSession(sessionId);

      // Save multiple tables with different characteristics
      const tables = [
        { keyword: 'First', data: 'Data 1', source: 'n8n' as const },
        { keyword: 'Second', data: 'Data 2', source: 'cached' as const },
        { keyword: 'Third', data: 'Data 3', source: 'n8n' as const },
        { keyword: 'Fourth', data: 'Data 4', source: 'error' as const }
      ];

      for (const tableData of tables) {
        await waitForAsync(50);
        const table = createMockTable({
          headers: [tableData.keyword],
          rows: [[tableData.data]]
        });
        document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
          detail: { 
            table, 
            keyword: tableData.keyword, 
            source: tableData.source, 
            timestamp: Date.now() 
          }
        }));
      }

      await waitForAsync(200);

      // Verify all saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables.length).toBe(4);

      // Clear DOM completely
      document.body.innerHTML = '';

      // Restore via session change event
      document.dispatchEvent(new CustomEvent('claraverse:session:changed', {
        detail: { sessionId }
      }));
      await waitForAsync();

      // Verify: All tables restored
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(4);

      // Verify: Chronological order maintained
      const keywords = Array.from(restoredTables).map(table =>
        table.getAttribute('data-n8n-keyword')
      );
      expect(keywords).toEqual(['First', 'Second', 'Third', 'Fourth']);

      // Verify: Containers created
      const containers = document.querySelectorAll('[data-container-id]');
      expect(containers.length).toBeGreaterThanOrEqual(1);

      // Verify: All sources preserved
      const sources = Array.from(restoredTables).map(table =>
        table.getAttribute('data-source')
      );
      expect(sources).toContain('n8n');
      expect(sources).toContain('cached');
      expect(sources).toContain('error');
    }, TEST_TIMEOUT);

    it('should handle restoration after page reload simulation', async () => {
      bridge = new FlowiseTableBridge();
      const sessionId = 'page-reload-test';
      bridge.setCurrentSession(sessionId);

      // Save tables
      const table = createMockTable({
        headers: ['Product', 'Price', 'Stock'],
        rows: [
          ['Laptop', '$999', '10'],
          ['Mouse', '$29', '50']
        ]
      });
      document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
        detail: { table, keyword: 'Inventory', source: 'n8n' as const, timestamp: Date.now() }
      }));
      await waitForAsync();

      // Simulate page reload: clear everything and create new bridge
      document.body.innerHTML = '';
      delete (window as any).claraverseState;

      // Create new bridge instance (simulating page reload)
      const newBridge = new FlowiseTableBridge();
      newBridge.setCurrentSession(sessionId);

      // Restore
      await newBridge.restoreTablesForSession(sessionId);
      await waitForAsync();

      // Verify: Table restored after "reload"
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('Inventory');

      // Verify: Table content preserved
      const tableElement = restoredTables[0].querySelector('table');
      expect(tableElement).toBeTruthy();
      const cells = tableElement?.querySelectorAll('td');
      expect(cells?.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);
  });
});
