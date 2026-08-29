/**
 * Session Lifecycle Management Integration Tests
 * 
 * Simplified tests for Task 7: Implement session lifecycle management
 * These tests focus on the core logic without complex database setup
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { flowiseTableService } from '../flowiseTableService';
import { flowiseTableBridge } from '../flowiseTableBridge';
import { indexedDBService } from '../indexedDB';

describe('Session Lifecycle Integration Tests', () => {
  const testSessionId1 = 'test-session-1';
  const testSessionId2 = 'test-session-2';
  const orphanedSessionId = 'orphaned-session-999';

  beforeEach(async () => {
    // Clear generated tables only
    await indexedDBService.clearGeneratedTables();
  });

  afterEach(async () => {
    // Clean up
    await indexedDBService.clearGeneratedTables();
  });

  describe('Cascade Delete (Task 7.1)', () => {
    it('should delete all tables for a session', async () => {
      // Create test tables
      const table1 = document.createElement('table');
      table1.innerHTML = '<tr><th>Test 1</th></tr><tr><td>Data 1</td></tr>';

      const table2 = document.createElement('table');
      table2.innerHTML = '<tr><th>Test 2</th></tr><tr><td>Data 2</td></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        table1,
        'Keyword1',
        'n8n'
      );

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        table2,
        'Keyword2',
        'n8n'
      );

      // Verify tables exist
      const tablesBeforeDelete = await flowiseTableService.restoreSessionTables(testSessionId1);
      expect(tablesBeforeDelete.length).toBe(2);

      // Delete session tables
      const deletedCount = await flowiseTableService.deleteSessionTables(testSessionId1);
      expect(deletedCount).toBe(2);

      // Verify tables are deleted
      const tablesAfterDelete = await flowiseTableService.restoreSessionTables(testSessionId1);
      expect(tablesAfterDelete.length).toBe(0);
    });
  });

  describe('Session Filtering (Task 7.2)', () => {
    it('should filter tables by sessionId', async () => {
      // Create tables for different sessions
      const table1 = document.createElement('table');
      table1.innerHTML = '<tr><th>Session 1</th></tr><tr><td>Data 1</td></tr>';

      const table2 = document.createElement('table');
      table2.innerHTML = '<tr><th>Session 2</th></tr><tr><td>Data 2</td></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        table1,
        'Session1Keyword',
        'n8n'
      );

      await flowiseTableService.saveGeneratedTable(
        testSessionId2,
        table2,
        'Session2Keyword',
        'n8n'
      );

      // Get tables for session 1
      const session1Tables = await flowiseTableService.restoreSessionTables(testSessionId1);
      expect(session1Tables.length).toBe(1);
      expect(session1Tables[0].sessionId).toBe(testSessionId1);
      expect(session1Tables[0].keyword).toBe('Session1Keyword');

      // Get tables for session 2
      const session2Tables = await flowiseTableService.restoreSessionTables(testSessionId2);
      expect(session2Tables.length).toBe(1);
      expect(session2Tables[0].sessionId).toBe(testSessionId2);
      expect(session2Tables[0].keyword).toBe('Session2Keyword');
    });

    it('should switch sessions via bridge API', async () => {
      // Create tables for different sessions
      const table1 = document.createElement('table');
      table1.innerHTML = '<tr><th>Session 1</th></tr>';

      const table2 = document.createElement('table');
      table2.innerHTML = '<tr><th>Session 2</th></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        table1,
        'Keyword1',
        'n8n'
      );

      await flowiseTableService.saveGeneratedTable(
        testSessionId2,
        table2,
        'Keyword2',
        'n8n'
      );

      // Switch to session 1
      await flowiseTableBridge.switchSession(testSessionId1);
      expect(flowiseTableBridge.getCurrentSession()).toBe(testSessionId1);

      // Get tables for current session
      const session1Tables = await flowiseTableBridge.getTablesForSession(testSessionId1);
      expect(session1Tables.length).toBe(1);
      expect(session1Tables[0].sessionId).toBe(testSessionId1);

      // Switch to session 2
      await flowiseTableBridge.switchSession(testSessionId2);
      expect(flowiseTableBridge.getCurrentSession()).toBe(testSessionId2);

      // Get tables for current session
      const session2Tables = await flowiseTableBridge.getTablesForSession(testSessionId2);
      expect(session2Tables.length).toBe(1);
      expect(session2Tables[0].sessionId).toBe(testSessionId2);
    });
  });

  describe('Orphaned Table Detection (Task 7.3)', () => {
    it('should find orphaned tables', async () => {
      // Create a valid session with a table
      const validSession = {
        id: testSessionId1,
        title: 'Valid Session',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isStarred: false,
        isArchived: false
      };

      await indexedDBService.put('clara_sessions', validSession);

      const validTable = document.createElement('table');
      validTable.innerHTML = '<tr><th>Valid</th></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        validTable,
        'ValidKeyword',
        'n8n'
      );

      // Create an orphaned table (no session)
      const orphanedTable = document.createElement('table');
      orphanedTable.innerHTML = '<tr><th>Orphaned</th></tr>';

      await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        orphanedTable,
        'OrphanedKeyword',
        'n8n'
      );

      // Find orphaned tables
      const orphanedTables = await flowiseTableService.findOrphanedTables();
      expect(orphanedTables.length).toBe(1);
      expect(orphanedTables[0].sessionId).toBe(orphanedSessionId);

      // Clean up
      await indexedDBService.delete('clara_sessions', testSessionId1);
    });

    it('should check if a specific table is orphaned', async () => {
      // Create an orphaned table
      const orphanedTable = document.createElement('table');
      orphanedTable.innerHTML = '<tr><th>Orphaned</th></tr>';

      const tableId = await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        orphanedTable,
        'OrphanedKeyword',
        'n8n'
      );

      // Check if table is orphaned
      const isOrphaned = await flowiseTableService.isTableOrphaned(tableId);
      expect(isOrphaned).toBe(true);

      // Create a valid session
      const session = {
        id: orphanedSessionId,
        title: 'Now Valid',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isStarred: false,
        isArchived: false
      };

      await indexedDBService.put('clara_sessions', session);

      // Check again - should not be orphaned
      const isOrphanedAfter = await flowiseTableService.isTableOrphaned(tableId);
      expect(isOrphanedAfter).toBe(false);

      // Clean up
      await indexedDBService.delete('clara_sessions', orphanedSessionId);
    });

    it('should cleanup orphaned tables', async () => {
      // Create multiple orphaned tables
      const orphanedTable1 = document.createElement('table');
      orphanedTable1.innerHTML = '<tr><th>Orphaned 1</th></tr>';

      const orphanedTable2 = document.createElement('table');
      orphanedTable2.innerHTML = '<tr><th>Orphaned 2</th></tr>';

      await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        orphanedTable1,
        'Orphaned1',
        'n8n'
      );

      await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        orphanedTable2,
        'Orphaned2',
        'n8n'
      );

      // Verify orphaned tables exist
      const orphanedBefore = await flowiseTableService.findOrphanedTables();
      expect(orphanedBefore.length).toBe(2);

      // Cleanup
      const deletedCount = await flowiseTableService.cleanupOrphanedTables();
      expect(deletedCount).toBe(2);

      // Verify cleanup
      const orphanedAfter = await flowiseTableService.findOrphanedTables();
      expect(orphanedAfter.length).toBe(0);
    });

    it('should get orphaned table statistics', async () => {
      // Create a valid session with a table
      const validSession = {
        id: testSessionId1,
        title: 'Valid',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isStarred: false,
        isArchived: false
      };

      await indexedDBService.put('clara_sessions', validSession);

      const validTable = document.createElement('table');
      validTable.innerHTML = '<tr><th>Valid</th></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        validTable,
        'Valid',
        'n8n'
      );

      // Create orphaned tables
      const orphanedTable1 = document.createElement('table');
      orphanedTable1.innerHTML = '<tr><th>Orphaned 1</th></tr>';

      const orphanedTable2 = document.createElement('table');
      orphanedTable2.innerHTML = '<tr><th>Orphaned 2</th></tr>';

      await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        orphanedTable1,
        'Orphaned1',
        'n8n'
      );

      await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        orphanedTable2,
        'Orphaned2',
        'n8n'
      );

      // Get statistics
      const stats = await flowiseTableService.getOrphanedTableStats();
      expect(stats.totalTables).toBe(3);
      expect(stats.orphanedTables).toBe(2);
      expect(stats.orphanedBySession.get(orphanedSessionId)).toBe(2);
      expect(stats.totalOrphanedSize).toBeGreaterThan(0);

      // Clean up
      await indexedDBService.delete('clara_sessions', testSessionId1);
    });

    it('should provide cleanup via bridge API', async () => {
      // Create orphaned table
      const orphanedTable = document.createElement('table');
      orphanedTable.innerHTML = '<tr><th>Orphaned</th></tr>';

      await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        orphanedTable,
        'Orphaned',
        'n8n'
      );

      // Use bridge API to find orphaned tables
      const orphanedTables = await flowiseTableBridge.findOrphanedTables();
      expect(orphanedTables.length).toBe(1);

      // Use bridge API to cleanup
      const deletedCount = await flowiseTableBridge.cleanupOrphanedTables();
      expect(deletedCount).toBe(1);

      // Verify cleanup
      const orphanedAfter = await flowiseTableBridge.findOrphanedTables();
      expect(orphanedAfter.length).toBe(0);
    });
  });
});
