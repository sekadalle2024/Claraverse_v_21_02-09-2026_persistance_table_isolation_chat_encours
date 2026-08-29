/**
 * FlowiseTableBridge Integration Tests
 * 
 * Integration tests for the complete workflow of FlowiseTableBridge:
 * - Event capture and table save workflow
 * - Session change and table restoration
 * - Duplicate table handling
 * - Error handling and retry logic
 * 
 * Requirements: 3.1, 3.2, 3.5, 4.1, 4.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlowiseTableBridge } from '../flowiseTableBridge';
import { flowiseTableService } from '../flowiseTableService';
import { indexedDBService } from '../indexedDB';

// Set test timeout to 30 seconds for integration tests
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
    }, TEST_TIMEOUT);
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
    }, TEST_TIMEOUT);
    tbody.appendChild(row);
    }, TEST_TIMEOUT);
  table.appendChild(tbody);
  
  return table;
}

describe('FlowiseTableBridge - Integration Tests', () => {
  let bridge: FlowiseTableBridge;

  beforeEach(async () => {
    // Clear DOM
    document.body.innerHTML = '';
    
    // Clear window state
    delete (window as any).claraverseState;
    window.history.pushState({}, '', window.location.pathname);
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Clear IndexedDB - do this last
    try {
      await flowiseTableService.clearAllTables();
    } catch (error) {
      // Ignore errors during cleanup
      console.warn('Cleanup error:', error);
    }
    }, TEST_TIMEOUT);

  afterEach(async () => {
    // Cleanup
    vi.clearAllMocks();
    try {
      await flowiseTableService.clearAllTables();
    } catch (error) {
      // Ignore errors during cleanup
      console.warn('Cleanup error:', error);
    }
    }, TEST_TIMEOUT);

  describe('Integration Test 1: Event Capture and Table Save Workflow', () => {
    /**
     * Test complete workflow from event emission to table persistence
     * Requirements: 3.1, 3.2
     */
    it('should capture flowise:table:integrated event and save table to IndexedDB', async () => {
      // Setup: Create bridge with active session
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('integration-test-session-1');

      // Create a mock table
      const mockTable = createMockTable({
        headers: ['Name', 'Age', 'City'],
        rows: [
          ['Alice', '30', 'New York'],
          ['Bob', '25', 'Los Angeles'],
          ['Charlie', '35', 'Chicago']
        ]
    }, TEST_TIMEOUT);

      // Track if save event was emitted
      let savedEventDetail: any = null;
      document.addEventListener('storage:table:saved', (event: Event) => {
        savedEventDetail = (event as CustomEvent).detail;
    }, TEST_TIMEOUT);

      // Emit the flowise:table:integrated event
      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: mockTable,
          keyword: 'UserData',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event);

      // Wait for async processing
      await waitForAsync();

      // Verify: Table was saved to IndexedDB
      const savedTables = await flowiseTableService.restoreSessionTables('integration-test-session-1');
      expect(savedTables).toHaveLength(1);
      expect(savedTables[0].keyword).toBe('UserData');
      expect(savedTables[0].source).toBe('n8n');
      expect(savedTables[0].sessionId).toBe('integration-test-session-1');

      // Verify: storage:table:saved event was emitted
      expect(savedEventDetail).toBeTruthy();
      expect(savedEventDetail.keyword).toBe('UserData');
      expect(savedEventDetail.sessionId).toBe('integration-test-session-1');
    }, TEST_TIMEOUT);

    it('should save table with correct metadata and fingerprint', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('metadata-test-session');

      const mockTable = createMockTable({
        headers: ['Product', 'Price'],
        rows: [
          ['Laptop', '$999'],
          ['Mouse', '$29']
        ]
    }, TEST_TIMEOUT);

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: mockTable,
          keyword: 'Products',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event);

      await waitForAsync();

      const savedTables = await flowiseTableService.restoreSessionTables('metadata-test-session');
      expect(savedTables).toHaveLength(1);

      const savedTable = savedTables[0];
      expect(savedTable.metadata.rowCount).toBe(3); // header + 2 data rows
      expect(savedTable.metadata.colCount).toBe(2);
      expect(savedTable.metadata.headers).toEqual(['Product', 'Price']);
      expect(savedTable.fingerprint).toBeTruthy();
      expect(savedTable.fingerprint.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);
    }, TEST_TIMEOUT);

  describe('Integration Test 2: Session Change and Table Restoration', () => {
    /**
     * Test session switching and automatic table restoration
     * Requirements: 4.1, 4.2
     */
    it('should restore tables when session changes', async () => {
      // Setup: Save tables for two different sessions
      const session1 = 'session-restore-1';
      const session2 = 'session-restore-2';

      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(session1);

      // Save table for session 1
      const table1 = createMockTable({
        headers: ['Session 1 Data'],
        rows: [['Data for session 1']]
    }, TEST_TIMEOUT);

      const event1 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table1,
          keyword: 'Session1Table',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event1);
      await waitForAsync();

      // Switch to session 2 and save a different table
      bridge.setCurrentSession(session2);

      const table2 = createMockTable({
        headers: ['Session 2 Data'],
        rows: [['Data for session 2']]
    }, TEST_TIMEOUT);

      const event2 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table2,
          keyword: 'Session2Table',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event2);
      await waitForAsync();

      // Clear DOM to simulate page reload
      document.body.innerHTML = '';

      // Emit session change event to trigger restoration
      const sessionChangeEvent = new CustomEvent('claraverse:session:changed', {
        detail: { sessionId: session1 }
    }, TEST_TIMEOUT);
      document.dispatchEvent(sessionChangeEvent);
      await waitForAsync();

      // Verify: Only session 1 tables are restored
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('Session1Table');

      // Clear DOM again
      document.body.innerHTML = '';

      // Switch to session 2
      const sessionChangeEvent2 = new CustomEvent('claraverse:session:changed', {
        detail: { sessionId: session2 }
    }, TEST_TIMEOUT);
      document.dispatchEvent(sessionChangeEvent2);
      await waitForAsync();

      // Verify: Only session 2 tables are restored
      const restoredTables2 = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables2.length).toBe(1);
      expect(restoredTables2[0].getAttribute('data-n8n-keyword')).toBe('Session2Table');
    }, TEST_TIMEOUT);

    it('should restore multiple tables in chronological order', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('chronological-test-session');

      // Save three tables with different timestamps
      const tables = [
        { keyword: 'FirstTable', data: 'First' },
        { keyword: 'SecondTable', data: 'Second' },
        { keyword: 'ThirdTable', data: 'Third' }
      ];

      for (const tableData of tables) {
        const table = createMockTable({
          headers: ['Data'],
          rows: [[tableData.data]]
    }, TEST_TIMEOUT);

        const event = new CustomEvent('flowise:table:integrated', {
          detail: {
            table,
            keyword: tableData.keyword,
            source: 'n8n' as const,
            timestamp: Date.now()
          }
    }, TEST_TIMEOUT);
        document.dispatchEvent(event);
        await waitForAsync(50); // Small delay to ensure different timestamps
      }

      // Clear DOM
      document.body.innerHTML = '';

      // Restore tables
      await bridge.restoreTablesForSession('chronological-test-session');
      await waitForAsync();

      // Verify: Tables are restored in chronological order
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBe(3);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('FirstTable');
      expect(restoredTables[1].getAttribute('data-n8n-keyword')).toBe('SecondTable');
      expect(restoredTables[2].getAttribute('data-n8n-keyword')).toBe('ThirdTable');
    }, TEST_TIMEOUT);

    it('should create container if it does not exist during restoration', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('container-creation-session');

      // Save a table
      const table = createMockTable({
        headers: ['Test'],
        rows: [['Data']]
    }, TEST_TIMEOUT);

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table,
          keyword: 'TestTable',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event);
      await waitForAsync();

      // Clear DOM completely (no containers)
      document.body.innerHTML = '';

      // Restore tables
      await bridge.restoreTablesForSession('container-creation-session');
      await waitForAsync();

      // Verify: Container was created
      const container = document.querySelector('[data-restored-container="true"]');
      expect(container).toBeTruthy();
      expect(container?.getAttribute('data-container-id')).toBeTruthy();

      // Verify: Table was injected into the created container
      const restoredTable = container?.querySelector('[data-restored="true"]');
      expect(restoredTable).toBeTruthy();
    }, TEST_TIMEOUT);
    }, TEST_TIMEOUT);

  describe('Integration Test 3: Duplicate Table Handling', () => {
    /**
     * Test duplicate detection and prevention
     * Requirements: 3.1, 3.2
     */
    it('should not save duplicate tables with same content', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('duplicate-test-session');

      // Create identical tables
      const tableData = {
        headers: ['Name', 'Value'],
        rows: [['Test', '123']]
      };

      const table1 = createMockTable(tableData);
      const table2 = createMockTable(tableData); // Identical content

      // Save first table
      const event1 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table1,
          keyword: 'DuplicateTest',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event1);
      await waitForAsync();

      // Try to save duplicate
      const event2 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table2,
          keyword: 'DuplicateTest',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event2);
      await waitForAsync();

      // Verify: Only one table was saved
      const savedTables = await flowiseTableService.restoreSessionTables('duplicate-test-session');
      expect(savedTables).toHaveLength(1);
    }, TEST_TIMEOUT);

    it('should save tables with same keyword but different content', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('same-keyword-session');

      // Create tables with same keyword but different content
      const table1 = createMockTable({
        headers: ['Name'],
        rows: [['Alice']]
    }, TEST_TIMEOUT);

      const table2 = createMockTable({
        headers: ['Name'],
        rows: [['Bob']] // Different content
    }, TEST_TIMEOUT);

      // Save first table
      const event1 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table1,
          keyword: 'SameKeyword',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event1);
      await waitForAsync();

      // Save second table with same keyword
      const event2 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table2,
          keyword: 'SameKeyword',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event2);
      await waitForAsync();

      // Verify: Both tables were saved (different fingerprints)
      const savedTables = await flowiseTableService.restoreSessionTables('same-keyword-session');
      expect(savedTables).toHaveLength(2);
      expect(savedTables[0].keyword).toBe('SameKeyword');
      expect(savedTables[1].keyword).toBe('SameKeyword');
      expect(savedTables[0].fingerprint).not.toBe(savedTables[1].fingerprint);
    }, TEST_TIMEOUT);

    it('should handle duplicate detection across sessions correctly', async () => {
      bridge = new FlowiseTableBridge();

      const tableData = {
        headers: ['Data'],
        rows: [['Same content']]
      };

      // Save to session 1
      bridge.setCurrentSession('session-dup-1');
      const table1 = createMockTable(tableData);
      const event1 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table1,
          keyword: 'CrossSession',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event1);
      await waitForAsync();

      // Save to session 2 (same content, different session)
      bridge.setCurrentSession('session-dup-2');
      const table2 = createMockTable(tableData);
      const event2 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table2,
          keyword: 'CrossSession',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event2);
      await waitForAsync();

      // Verify: Both tables saved (duplicates allowed across sessions)
      const session1Tables = await flowiseTableService.restoreSessionTables('session-dup-1');
      const session2Tables = await flowiseTableService.restoreSessionTables('session-dup-2');
      
      expect(session1Tables).toHaveLength(1);
      expect(session2Tables).toHaveLength(1);
    }, TEST_TIMEOUT);
    }, TEST_TIMEOUT);

  describe('Integration Test 4: Error Handling and Retry Logic', () => {
    /**
     * Test error handling, event emission, and retry mechanism
     * Requirements: 3.2, 3.5
     */
    it('should emit error event when save fails', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('error-test-session');

      // Mock saveGeneratedTable to fail
      const originalSave = flowiseTableService.saveGeneratedTable;
      vi.spyOn(flowiseTableService, 'saveGeneratedTable').mockRejectedValue(
        new Error('IndexedDB quota exceeded')
      );

      // Track error event
      let errorEventDetail: any = null;
      document.addEventListener('storage:table:error', (event: Event) => {
        errorEventDetail = (event as CustomEvent).detail;
    }, TEST_TIMEOUT);

      const table = createMockTable({
        headers: ['Test'],
        rows: [['Data']]
    }, TEST_TIMEOUT);

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table,
          keyword: 'ErrorTest',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event);
      await waitForAsync();

      // Verify: Error event was emitted
      expect(errorEventDetail).toBeTruthy();
      expect(errorEventDetail.error).toContain('IndexedDB quota exceeded');
      expect(errorEventDetail.sessionId).toBe('error-test-session');
      expect(errorEventDetail.keyword).toBe('ErrorTest');

      // Restore original function
      flowiseTableService.saveGeneratedTable = originalSave;
    }, TEST_TIMEOUT);

    it('should retry save operation after failure', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('retry-test-session');
      bridge.clearRetryAttempts();

      let saveAttempts = 0;
      const originalSave = flowiseTableService.saveGeneratedTable.bind(flowiseTableService);

      // Mock to fail first time, succeed second time
      vi.spyOn(flowiseTableService, 'saveGeneratedTable').mockImplementation(async (...args) => {
        saveAttempts++;
        if (saveAttempts === 1) {
          throw new Error('Temporary failure');
        }
        return originalSave(...args);
    }, TEST_TIMEOUT);

      const table = createMockTable({
        headers: ['Retry'],
        rows: [['Test']]
    }, TEST_TIMEOUT);

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table,
          keyword: 'RetryTest',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event);

      // Wait for initial attempt and retry
      await waitForAsync(2500); // Wait for retry delay (2000ms) + processing

      // Verify: Save was attempted twice
      expect(saveAttempts).toBeGreaterThanOrEqual(2);

      // Verify: Table was eventually saved
      const savedTables = await flowiseTableService.restoreSessionTables('retry-test-session');
      expect(savedTables.length).toBeGreaterThanOrEqual(1);
    }, TEST_TIMEOUT);

    it('should stop retrying after max attempts', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('max-retry-session');
      bridge.clearRetryAttempts();

      let saveAttempts = 0;

      // Mock to always fail
      vi.spyOn(flowiseTableService, 'saveGeneratedTable').mockImplementation(async () => {
        saveAttempts++;
        throw new Error('Persistent failure');
    }, TEST_TIMEOUT);

      const table = createMockTable({
        headers: ['MaxRetry'],
        rows: [['Test']]
    }, TEST_TIMEOUT);

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table,
          keyword: 'MaxRetryTest',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event);

      // Wait for all retry attempts (initial + 2 retries)
      await waitForAsync(5000); // Wait for 2 retries with 2s delay each

      // Verify: Save was attempted max 3 times (initial + 2 retries)
      expect(saveAttempts).toBeLessThanOrEqual(3);
    }, TEST_TIMEOUT);

    it('should handle missing session gracefully', async () => {
      // Create bridge without setting session
      bridge = new FlowiseTableBridge();
      // Don't set session - should create temporary session

      const table = createMockTable({
        headers: ['NoSession'],
        rows: [['Test']]
    }, TEST_TIMEOUT);

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table,
          keyword: 'NoSessionTest',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event);
      await waitForAsync();

      // Verify: Table was saved with temporary session
      const currentSession = bridge.getCurrentSession();
      expect(currentSession).toBeTruthy();
      expect(currentSession).toMatch(/^temp-session-/);

      const savedTables = await flowiseTableService.restoreSessionTables(currentSession!);
      expect(savedTables).toHaveLength(1);
    }, TEST_TIMEOUT);
    }, TEST_TIMEOUT);

  describe('Integration Test 5: Complete End-to-End Workflow', () => {
    /**
     * Test complete workflow from event to restoration
     * Requirements: 3.1, 3.2, 4.1, 4.2
     */
    it('should handle complete workflow: save, reload, restore', async () => {
      // Phase 1: Initial save
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('e2e-test-session');

      const table1 = createMockTable({
        headers: ['Product', 'Price', 'Stock'],
        rows: [
          ['Laptop', '$999', '10'],
          ['Mouse', '$29', '50'],
          ['Keyboard', '$79', '30']
        ]
    }, TEST_TIMEOUT);

      const event1 = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: table1,
          keyword: 'Inventory',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(event1);
      await waitForAsync();

      // Verify save
      let savedTables = await flowiseTableService.restoreSessionTables('e2e-test-session');
      expect(savedTables).toHaveLength(1);

      // Phase 2: Simulate page reload (clear DOM and bridge)
      document.body.innerHTML = '';
      
      // Phase 3: Restore on new page load
      const newBridge = new FlowiseTableBridge();
      newBridge.setCurrentSession('e2e-test-session');
      await newBridge.restoreTablesForSession('e2e-test-session');
      await waitForAsync();

      // Verify restoration
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(1);
      expect(restoredTables[0].getAttribute('data-n8n-keyword')).toBe('Inventory');

      // Verify table content is preserved
      const restoredTable = restoredTables[0].querySelector('table');
      expect(restoredTable).toBeTruthy();
      const cells = restoredTable?.querySelectorAll('td');
      expect(cells?.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    it('should handle multiple tables with different sources', async () => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('multi-source-session');

      // Save n8n table
      const n8nTable = createMockTable({
        headers: ['N8N Data'],
        rows: [['From n8n']]
    }, TEST_TIMEOUT);

      const n8nEvent = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: n8nTable,
          keyword: 'N8NTable',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(n8nEvent);
      await waitForAsync(50);

      // Save cached table
      const cachedTable = createMockTable({
        headers: ['Cached Data'],
        rows: [['From cache']]
    }, TEST_TIMEOUT);

      const cachedEvent = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: cachedTable,
          keyword: 'CachedTable',
          source: 'cached' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(cachedEvent);
      await waitForAsync(50);

      // Save error table
      const errorTable = createMockTable({
        headers: ['Error'],
        rows: [['Error occurred']]
    }, TEST_TIMEOUT);

      const errorEvent = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: errorTable,
          keyword: 'ErrorTable',
          source: 'error' as const,
          timestamp: Date.now()
        }
    }, TEST_TIMEOUT);
      document.dispatchEvent(errorEvent);
      await waitForAsync();

      // Verify all tables saved
      const savedTables = await flowiseTableService.restoreSessionTables('multi-source-session');
      expect(savedTables).toHaveLength(3);

      const sources = savedTables.map(t => t.source);
      expect(sources).toContain('n8n');
      expect(sources).toContain('cached');
      expect(sources).toContain('error');

      // Restore and verify
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession('multi-source-session');
      await waitForAsync();

      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(3);
    }, TEST_TIMEOUT);
    }, TEST_TIMEOUT);
});
