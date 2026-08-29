/**
 * Session Lifecycle Management Tests
 * 
 * Tests for Task 7: Implement session lifecycle management
 * - Cascade delete when session is deleted
 * - Session filtering and navigation
 * - Orphaned table detection and cleanup
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { claraDatabaseService } from '../claraDatabase';
import { flowiseTableService } from '../flowiseTableService';
import { flowiseTableBridge } from '../flowiseTableBridge';
import { indexedDBService } from '../indexedDB';
import { db } from '../../db/index';

describe('Session Lifecycle Management', () => {
  const testSessionId1 = 'test-session-lifecycle-1';
  const testSessionId2 = 'test-session-lifecycle-2';
  const orphanedSessionId = 'orphaned-session-123';
  const testUserId = 'test-user-lifecycle';

  beforeEach(async () => {
    // Set up a test user
    await indexedDBService.put('settings', { key: 'current_user', value: testUserId });
    
    // Clear all data before each test
    await indexedDBService.clear('clara_sessions');
    await indexedDBService.clear('clara_messages');
    await indexedDBService.clear('clara_files');
    await indexedDBService.clearGeneratedTables();
  }, 30000); // Increase timeout to 30 seconds

  afterEach(async () => {
    // Clean up after each test
    await indexedDBService.clear('clara_sessions');
    await indexedDBService.clear('clara_messages');
    await indexedDBService.clear('clara_files');
    await indexedDBService.clearGeneratedTables();
    await indexedDBService.delete('settings', 'current_user');
  }, 30000); // Increase timeout to 30 seconds

  describe('Task 7.1: Cascade Delete', () => {
    it('should delete all tables when session is deleted', async () => {
      // Create a test session
      const session = {
        id: testSessionId1,
        title: 'Test Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      await claraDatabaseService.saveSession(session);

      // Create test tables for the session
      const table1 = document.createElement('table');
      table1.innerHTML = '<tr><th>Header 1</th></tr><tr><td>Data 1</td></tr>';

      const table2 = document.createElement('table');
      table2.innerHTML = '<tr><th>Header 2</th></tr><tr><td>Data 2</td></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        table1,
        'TestKeyword1',
        'n8n'
      );

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        table2,
        'TestKeyword2',
        'n8n'
      );

      // Verify tables exist
      const tablesBeforeDelete = await flowiseTableService.restoreSessionTables(testSessionId1);
      expect(tablesBeforeDelete.length).toBe(2);

      // Delete the session (should cascade to tables)
      await claraDatabaseService.deleteSession(testSessionId1);

      // Verify tables are deleted
      const tablesAfterDelete = await flowiseTableService.restoreSessionTables(testSessionId1);
      expect(tablesAfterDelete.length).toBe(0);
    });

    it('should update debugDataIntegrity to include orphaned tables', async () => {
      // Create a session
      const session = {
        id: testSessionId1,
        title: 'Test Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      await claraDatabaseService.saveSession(session);

      // Create a table for the session
      const table = document.createElement('table');
      table.innerHTML = '<tr><th>Header</th></tr><tr><td>Data</td></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        table,
        'TestKeyword',
        'n8n'
      );

      // Check integrity before deletion
      const integrityBefore = await claraDatabaseService.debugDataIntegrity();
      expect(integrityBefore.generatedTables).toBe(1);
      expect(integrityBefore.orphanedTables).toBe(0);

      // Delete the session (but not the table - simulating orphaned state)
      await indexedDBService.delete('clara_sessions', testSessionId1);

      // Check integrity after deletion
      const integrityAfter = await claraDatabaseService.debugDataIntegrity();
      expect(integrityAfter.generatedTables).toBe(1);
      expect(integrityAfter.orphanedTables).toBe(1);
    });

    it('should cleanup orphaned tables via cleanupOrphanedData', async () => {
      // Create a table without a session (orphaned)
      const table = document.createElement('table');
      table.innerHTML = '<tr><th>Header</th></tr><tr><td>Data</td></tr>';

      await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        table,
        'OrphanedKeyword',
        'n8n'
      );

      // Verify orphaned table exists
      const allTables = await flowiseTableService.getAllTables();
      expect(allTables.length).toBe(1);

      // Run cleanup
      await claraDatabaseService.cleanupOrphanedData();

      // Verify orphaned table is deleted
      const tablesAfterCleanup = await flowiseTableService.getAllTables();
      expect(tablesAfterCleanup.length).toBe(0);
    });
  });

  describe('Task 7.2: Session Filtering', () => {
    it('should only restore tables for the current session', async () => {
      // Create two sessions
      const session1 = {
        id: testSessionId1,
        title: 'Session 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      const session2 = {
        id: testSessionId2,
        title: 'Session 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      await claraDatabaseService.saveSession(session1);
      await claraDatabaseService.saveSession(session2);

      // Create tables for each session
      const table1 = document.createElement('table');
      table1.innerHTML = '<tr><th>Session 1 Table</th></tr><tr><td>Data 1</td></tr>';

      const table2 = document.createElement('table');
      table2.innerHTML = '<tr><th>Session 2 Table</th></tr><tr><td>Data 2</td></tr>';

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

      // Restore tables for session 1
      const session1Tables = await flowiseTableService.restoreSessionTables(testSessionId1);
      expect(session1Tables.length).toBe(1);
      expect(session1Tables[0].keyword).toBe('Session1Keyword');

      // Restore tables for session 2
      const session2Tables = await flowiseTableService.restoreSessionTables(testSessionId2);
      expect(session2Tables.length).toBe(1);
      expect(session2Tables[0].keyword).toBe('Session2Keyword');
    });

    it('should switch sessions and reload tables', async () => {
      // Create two sessions
      const session1 = {
        id: testSessionId1,
        title: 'Session 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      const session2 = {
        id: testSessionId2,
        title: 'Session 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      await claraDatabaseService.saveSession(session1);
      await claraDatabaseService.saveSession(session2);

      // Create tables for each session
      const table1 = document.createElement('table');
      table1.innerHTML = '<tr><th>Session 1 Table</th></tr><tr><td>Data 1</td></tr>';

      const table2 = document.createElement('table');
      table2.innerHTML = '<tr><th>Session 2 Table</th></tr><tr><td>Data 2</td></tr>';

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

      // Switch to session 1
      await flowiseTableBridge.switchSession(testSessionId1);
      expect(flowiseTableBridge.getCurrentSession()).toBe(testSessionId1);

      // Get tables for session 1
      const session1Tables = await flowiseTableBridge.getTablesForSession(testSessionId1);
      expect(session1Tables.length).toBe(1);
      expect(session1Tables[0].keyword).toBe('Session1Keyword');

      // Switch to session 2
      await flowiseTableBridge.switchSession(testSessionId2);
      expect(flowiseTableBridge.getCurrentSession()).toBe(testSessionId2);

      // Get tables for session 2
      const session2Tables = await flowiseTableBridge.getTablesForSession(testSessionId2);
      expect(session2Tables.length).toBe(1);
      expect(session2Tables[0].keyword).toBe('Session2Keyword');
    });
  });

  describe('Task 7.3: Orphaned Table Detection', () => {
    it('should find orphaned tables', async () => {
      // Create a valid session with a table
      const session = {
        id: testSessionId1,
        title: 'Valid Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      await claraDatabaseService.saveSession(session);

      const validTable = document.createElement('table');
      validTable.innerHTML = '<tr><th>Valid Table</th></tr><tr><td>Data</td></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        validTable,
        'ValidKeyword',
        'n8n'
      );

      // Create an orphaned table (no session)
      const orphanedTable = document.createElement('table');
      orphanedTable.innerHTML = '<tr><th>Orphaned Table</th></tr><tr><td>Data</td></tr>';

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
      expect(orphanedTables[0].keyword).toBe('OrphanedKeyword');
    });

    it('should check if a specific table is orphaned', async () => {
      // Create an orphaned table
      const orphanedTable = document.createElement('table');
      orphanedTable.innerHTML = '<tr><th>Orphaned Table</th></tr><tr><td>Data</td></tr>';

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
        title: 'Now Valid Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      await claraDatabaseService.saveSession(session);

      // Check again - should not be orphaned now
      const isOrphanedAfter = await flowiseTableService.isTableOrphaned(tableId);
      expect(isOrphanedAfter).toBe(false);
    });

    it('should cleanup orphaned tables', async () => {
      // Create multiple orphaned tables
      const orphanedTable1 = document.createElement('table');
      orphanedTable1.innerHTML = '<tr><th>Orphaned 1</th></tr><tr><td>Data 1</td></tr>';

      const orphanedTable2 = document.createElement('table');
      orphanedTable2.innerHTML = '<tr><th>Orphaned 2</th></tr><tr><td>Data 2</td></tr>';

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

      // Cleanup orphaned tables
      const deletedCount = await flowiseTableService.cleanupOrphanedTables();
      expect(deletedCount).toBe(2);

      // Verify orphaned tables are deleted
      const orphanedAfter = await flowiseTableService.findOrphanedTables();
      expect(orphanedAfter.length).toBe(0);
    });

    it('should get orphaned table statistics', async () => {
      // Create a valid session with a table
      const session = {
        id: testSessionId1,
        title: 'Valid Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        isArchived: false
      };

      await claraDatabaseService.saveSession(session);

      const validTable = document.createElement('table');
      validTable.innerHTML = '<tr><th>Valid Table</th></tr><tr><td>Data</td></tr>';

      await flowiseTableService.saveGeneratedTable(
        testSessionId1,
        validTable,
        'ValidKeyword',
        'n8n'
      );

      // Create orphaned tables
      const orphanedTable1 = document.createElement('table');
      orphanedTable1.innerHTML = '<tr><th>Orphaned 1</th></tr><tr><td>Data 1</td></tr>';

      const orphanedTable2 = document.createElement('table');
      orphanedTable2.innerHTML = '<tr><th>Orphaned 2</th></tr><tr><td>Data 2</td></tr>';

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
    });

    it('should provide manual cleanup via bridge API', async () => {
      // Create orphaned tables
      const orphanedTable = document.createElement('table');
      orphanedTable.innerHTML = '<tr><th>Orphaned</th></tr><tr><td>Data</td></tr>';

      await flowiseTableService.saveGeneratedTable(
        orphanedSessionId,
        orphanedTable,
        'OrphanedKeyword',
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
