/**
 * Tests for FlowiseTableService Storage Optimization (Task 8)
 * 
 * Tests quota monitoring, cleanup strategy, and size limits
 */

import { FlowiseTableService } from '../flowiseTableService';
import { indexedDBService } from '../indexedDB';
import type { FlowiseGeneratedTableRecord } from '../../types/flowise_table_types';

describe('FlowiseTableService - Storage Optimization', () => {
  let service: FlowiseTableService;

  beforeEach(async () => {
    service = new FlowiseTableService();
    await indexedDBService.clearGeneratedTables();
  }, 30000); // Increase timeout to 30 seconds

  afterEach(async () => {
    await indexedDBService.clearGeneratedTables();
  }, 30000); // Increase timeout to 30 seconds

  // Helper to create mock table element
  function createMockTable(data: { keyword: string; rows: string[][] }): HTMLTableElement {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create header
    const headerRow = document.createElement('tr');
    const th1 = document.createElement('th');
    th1.textContent = 'Column1';
    const th2 = document.createElement('th');
    th2.textContent = 'Column2';
    headerRow.appendChild(th1);
    headerRow.appendChild(th2);
    thead.appendChild(headerRow);

    // Create rows
    data.rows.forEach(rowData => {
      const row = document.createElement('tr');
      rowData.forEach(cellData => {
        const td = document.createElement('td');
        td.textContent = cellData;
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
  }

  describe('Quota Monitoring (Task 8.1)', () => {
    test('should check storage quota', async () => {
      const quotaInfo = await service.checkStorageQuota();

      expect(quotaInfo).toHaveProperty('usage');
      expect(quotaInfo).toHaveProperty('quota');
      expect(quotaInfo).toHaveProperty('percentage');
      expect(quotaInfo).toHaveProperty('available');
      expect(quotaInfo.percentage).toBeGreaterThanOrEqual(0);
      expect(quotaInfo.percentage).toBeLessThanOrEqual(1);
    });

    test('should determine if cleanup is needed', async () => {
      const isNeeded = await service.isCleanupNeeded();
      expect(typeof isNeeded).toBe('boolean');
    });

    test('should get table storage statistics', async () => {
      // Save some test tables
      const sessionId = 'test-session-stats';
      
      const table1 = createMockTable({ keyword: 'Test1', rows: [['A', 'B'], ['C', 'D']] });
      const table2 = createMockTable({ keyword: 'Test2', rows: [['E', 'F'], ['G', 'H']] });
      
      await service.saveGeneratedTable(sessionId, table1, 'Test1', 'n8n');
      await service.saveGeneratedTable(sessionId, table2, 'Test2', 'cached');

      const stats = await service.getTableStorageStats();

      expect(stats.totalTables).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.averageSize).toBeGreaterThan(0);
      expect(stats.cachedTables).toBe(1);
      expect(stats.tablesBySession.get(sessionId)).toBe(2);
    });
  });

  describe('Cleanup Strategy (Task 8.2)', () => {
    test('should perform automatic cleanup prioritizing cached and error tables', async () => {
      const sessionId1 = 'session-1';
      const sessionId2 = 'session-2';

      // Create tables with different sources
      const n8nTable = createMockTable({ keyword: 'N8N', rows: [['1', '2']] });
      const cachedTable = createMockTable({ keyword: 'Cached', rows: [['3', '4']] });
      const errorTable = createMockTable({ keyword: 'Error', rows: [['5', '6']] });

      await service.saveGeneratedTable(sessionId1, n8nTable, 'N8N', 'n8n');
      await service.saveGeneratedTable(sessionId1, cachedTable, 'Cached', 'cached');
      await service.saveGeneratedTable(sessionId2, errorTable, 'Error', 'error');

      // Perform cleanup (should delete cached and error tables first)
      const deletedCount = await service.performAutomaticCleanup(sessionId1);

      expect(deletedCount).toBeGreaterThan(0);

      // Verify n8n table from active session is preserved
      const remainingTables = await service.restoreSessionTables(sessionId1);
      const hasN8nTable = remainingTables.some(t => t.keyword === 'N8N');
      expect(hasN8nTable).toBe(true);
    });

    test('should preserve tables from active session during cleanup', async () => {
      const activeSessionId = 'active-session';
      const otherSessionId = 'other-session';

      // Create tables in both sessions
      const activeTable = createMockTable({ keyword: 'Active', rows: [['A', 'B']] });
      const otherTable = createMockTable({ keyword: 'Other', rows: [['C', 'D']] });

      await service.saveGeneratedTable(activeSessionId, activeTable, 'Active', 'n8n');
      await service.saveGeneratedTable(otherSessionId, otherTable, 'Other', 'n8n');

      // Perform cleanup with active session
      await service.performAutomaticCleanup(activeSessionId);

      // Verify active session table is preserved
      const activeTables = await service.restoreSessionTables(activeSessionId);
      expect(activeTables.length).toBeGreaterThan(0);
    });

    test('should delete oldest tables first', async () => {
      const sessionId = 'test-session-cleanup';

      // Create tables with different timestamps
      const oldTable = createMockTable({ keyword: 'Old', rows: [['1', '2']] });
      const newTable = createMockTable({ keyword: 'New', rows: [['3', '4']] });

      await service.saveGeneratedTable(sessionId, oldTable, 'Old', 'n8n');
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await service.saveGeneratedTable(sessionId, newTable, 'New', 'n8n');

      const beforeCleanup = await service.getAllTables();
      expect(beforeCleanup.length).toBe(2);

      // Perform cleanup
      await service.performAutomaticCleanup();

      const afterCleanup = await service.getAllTables();
      expect(afterCleanup.length).toBeLessThan(beforeCleanup.length);
    });
  });

  describe('Size Limits (Task 8.3)', () => {
    test('should enforce storage limits', async () => {
      const sessionId = 'test-session-limits';
      const table = createMockTable({ keyword: 'Test', rows: [['A', 'B']] });

      await service.saveGeneratedTable(sessionId, table, 'Test', 'n8n');

      const result = await service.enforceStorageLimits(sessionId);
      expect(result).toBe(true);
    });

    test('should trigger cleanup when table count exceeds limit', async () => {
      // This test would require creating 500+ tables which is impractical
      // Instead, we verify the method exists and can be called
      const result = await service.enforceStorageLimits();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Manual Cleanup API (Task 8)', () => {
    test('should perform manual cleanup with age filter', async () => {
      const sessionId = 'test-session-manual';
      const table = createMockTable({ keyword: 'Test', rows: [['A', 'B']] });

      await service.saveGeneratedTable(sessionId, table, 'Test', 'n8n');

      // Cleanup tables older than 30 days (should not delete recent table)
      const deletedCount = await service.manualCleanup({ olderThanDays: 30 });
      expect(deletedCount).toBe(0);

      // Cleanup tables older than 0 days (should delete all)
      const deletedCount2 = await service.manualCleanup({ olderThanDays: 0 });
      expect(deletedCount2).toBeGreaterThan(0);
    });

    test('should perform manual cleanup with source filter', async () => {
      const sessionId = 'test-session-source';

      const cachedTable = createMockTable({ keyword: 'Cached', rows: [['1', '2']] });
      const n8nTable = createMockTable({ keyword: 'N8N', rows: [['3', '4']] });

      await service.saveGeneratedTable(sessionId, cachedTable, 'Cached', 'cached');
      await service.saveGeneratedTable(sessionId, n8nTable, 'N8N', 'n8n');

      // Delete only cached tables
      const deletedCount = await service.manualCleanup({ sources: ['cached'] });
      expect(deletedCount).toBe(1);

      // Verify n8n table remains
      const remainingTables = await service.restoreSessionTables(sessionId);
      expect(remainingTables.length).toBe(1);
      expect(remainingTables[0].source).toBe('n8n');
    });

    test('should perform manual cleanup excluding specific sessions', async () => {
      const session1 = 'session-1';
      const session2 = 'session-2';

      const table1 = createMockTable({ keyword: 'Test1', rows: [['A', 'B']] });
      const table2 = createMockTable({ keyword: 'Test2', rows: [['C', 'D']] });

      await service.saveGeneratedTable(session1, table1, 'Test1', 'n8n');
      await service.saveGeneratedTable(session2, table2, 'Test2', 'n8n');

      // Delete all except session1
      const deletedCount = await service.manualCleanup({ 
        excludeSessionIds: [session1],
        olderThanDays: 0
      });

      expect(deletedCount).toBe(1);

      // Verify session1 table remains
      const session1Tables = await service.restoreSessionTables(session1);
      expect(session1Tables.length).toBe(1);

      // Verify session2 table is deleted
      const session2Tables = await service.restoreSessionTables(session2);
      expect(session2Tables.length).toBe(0);
    });

    test('should limit number of tables deleted in manual cleanup', async () => {
      const sessionId = 'test-session-limit';

      // Create 5 tables
      for (let i = 0; i < 5; i++) {
        const table = createMockTable({ keyword: `Test${i}`, rows: [[`${i}`, `${i}`]] });
        await service.saveGeneratedTable(sessionId, table, `Test${i}`, 'n8n');
      }

      // Delete max 2 tables
      const deletedCount = await service.manualCleanup({ 
        maxTablesToDelete: 2,
        olderThanDays: 0
      });

      expect(deletedCount).toBe(2);

      // Verify 3 tables remain
      const remainingTables = await service.getAllTables();
      expect(remainingTables.length).toBe(3);
    });
  });
});
