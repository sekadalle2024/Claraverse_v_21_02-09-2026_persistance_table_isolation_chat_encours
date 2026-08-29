/**
 * Tests for Duplicate Detection and Trigger_Table Handling
 * Task 6: Implement duplicate detection and prevention
 * Task 6.1: tableExists() method
 * Task 6.2: Trigger_Table handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { flowiseTableService } from '../flowiseTableService';
import { indexedDBService } from '../indexedDB';

describe('FlowiseTableService - Duplicate Detection (Task 6.1)', () => {
  const testSessionId = 'test-session-duplicate-detection';

  beforeEach(async () => {
    // Clear all tables before each test
    await flowiseTableService.clearAllTables();
  });

  afterEach(async () => {
    // Clean up after each test
    await flowiseTableService.clearAllTables();
  });

  /**
   * Helper function to create a mock table element
   */
  function createMockTable(data: string[][]): HTMLTableElement {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    data.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }

  it('should detect duplicate tables with same content', async () => {
    // Create two tables with identical content
    const data = [
      ['Name', 'Age', 'City'],
      ['Alice', '30', 'Paris'],
      ['Bob', '25', 'London']
    ];

    const table1 = createMockTable(data);
    const table2 = createMockTable(data);

    // Save the first table
    const tableId1 = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      table1,
      'TestKeyword',
      'n8n'
    );

    expect(tableId1).toBeTruthy();

    // Generate fingerprints
    const fingerprint1 = flowiseTableService.generateTableFingerprint(table1);
    const fingerprint2 = flowiseTableService.generateTableFingerprint(table2);

    // Fingerprints should be identical
    expect(fingerprint1).toBe(fingerprint2);

    // Check if duplicate exists
    const exists = await flowiseTableService.tableExists(testSessionId, fingerprint2);
    expect(exists).toBe(true);

    // Try to save the second table - should be skipped
    const tableId2 = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      table2,
      'TestKeyword',
      'n8n'
    );

    // Should return empty string (duplicate skipped)
    expect(tableId2).toBe('');

    // Verify only one table was saved
    const tables = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(tables).toHaveLength(1);
  });

  it('should allow tables with same keyword but different content', async () => {
    const data1 = [
      ['Name', 'Age'],
      ['Alice', '30']
    ];

    const data2 = [
      ['Name', 'Age'],
      ['Bob', '25']
    ];

    const table1 = createMockTable(data1);
    const table2 = createMockTable(data2);

    // Save both tables with same keyword
    const tableId1 = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      table1,
      'SameKeyword',
      'n8n'
    );

    const tableId2 = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      table2,
      'SameKeyword',
      'n8n'
    );

    // Both should be saved
    expect(tableId1).toBeTruthy();
    expect(tableId2).toBeTruthy();

    // Fingerprints should be different
    const fingerprint1 = flowiseTableService.generateTableFingerprint(table1);
    const fingerprint2 = flowiseTableService.generateTableFingerprint(table2);
    expect(fingerprint1).not.toBe(fingerprint2);

    // Verify both tables were saved
    const tables = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(tables).toHaveLength(2);
  });

  it('should handle tableExists() with non-existent fingerprint', async () => {
    const table = createMockTable([['Test']]);
    const fingerprint = flowiseTableService.generateTableFingerprint(table);

    // Check for non-existent table
    const exists = await flowiseTableService.tableExists(testSessionId, fingerprint);
    expect(exists).toBe(false);
  });

  it('should isolate duplicates by session', async () => {
    const session1 = 'session-1';
    const session2 = 'session-2';

    const data = [['Name'], ['Alice']];
    const table1 = createMockTable(data);
    const table2 = createMockTable(data);

    // Save same table in different sessions
    const tableId1 = await flowiseTableService.saveGeneratedTable(
      session1,
      table1,
      'Keyword',
      'n8n'
    );

    const tableId2 = await flowiseTableService.saveGeneratedTable(
      session2,
      table2,
      'Keyword',
      'n8n'
    );

    // Both should be saved (different sessions)
    expect(tableId1).toBeTruthy();
    expect(tableId2).toBeTruthy();

    // Clean up
    await flowiseTableService.deleteSessionTables(session1);
    await flowiseTableService.deleteSessionTables(session2);
  });
});

describe('FlowiseTableService - Trigger_Table Handling (Task 6.2)', () => {
  const testSessionId = 'test-session-trigger-handling';

  beforeEach(async () => {
    await flowiseTableService.clearAllTables();
  });

  afterEach(async () => {
    await flowiseTableService.clearAllTables();
  });

  function createMockTable(data: string[][]): HTMLTableElement {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    data.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }

  it('should mark Trigger_Table as processed', async () => {
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      ['TestKeyword', 'Value']
    ]);

    // Mark as processed
    const tableId = await flowiseTableService.markTriggerTableAsProcessed(
      testSessionId,
      'TestKeyword',
      triggerTable
    );

    expect(tableId).toBeTruthy();

    // Verify it was saved with correct metadata
    const allTables = await flowiseTableService.getAllTables();
    const savedTable = allTables.find(t => t.id === tableId);

    expect(savedTable).toBeDefined();
    expect(savedTable?.tableType).toBe('trigger');
    expect(savedTable?.processed).toBe(true);
    expect(savedTable?.keyword).toBe('TestKeyword');
  });

  it('should detect if Trigger_Table is already processed', async () => {
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      ['TestKeyword', 'Value']
    ]);

    // First check - should not be processed
    const isProcessed1 = await flowiseTableService.isTriggerTableProcessed(
      testSessionId,
      triggerTable
    );
    expect(isProcessed1).toBe(false);

    // Mark as processed
    await flowiseTableService.markTriggerTableAsProcessed(
      testSessionId,
      'TestKeyword',
      triggerTable
    );

    // Second check - should be processed
    const isProcessed2 = await flowiseTableService.isTriggerTableProcessed(
      testSessionId,
      triggerTable
    );
    expect(isProcessed2).toBe(true);
  });

  it('should check if Generated_Tables exist for keyword', async () => {
    const keyword = 'TestKeyword';

    // Initially no Generated_Tables
    const hasGenerated1 = await flowiseTableService.hasGeneratedTablesForKeyword(
      testSessionId,
      keyword
    );
    expect(hasGenerated1).toBe(false);

    // Save a Generated_Table
    const generatedTable = createMockTable([
      ['Result', 'Value'],
      ['Data', '123']
    ]);

    await flowiseTableService.saveGeneratedTable(
      testSessionId,
      generatedTable,
      keyword,
      'n8n'
    );

    // Now should have Generated_Tables
    const hasGenerated2 = await flowiseTableService.hasGeneratedTablesForKeyword(
      testSessionId,
      keyword
    );
    expect(hasGenerated2).toBe(true);
  });

  it('should exclude processed Trigger_Tables from restoration', async () => {
    // Create and save a processed Trigger_Table
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      ['Keyword1', 'Value']
    ]);

    await flowiseTableService.markTriggerTableAsProcessed(
      testSessionId,
      'Keyword1',
      triggerTable
    );

    // Create and save a Generated_Table
    const generatedTable = createMockTable([
      ['Result', 'Value'],
      ['Data', '123']
    ]);

    await flowiseTableService.saveGeneratedTable(
      testSessionId,
      generatedTable,
      'Keyword2',
      'n8n'
    );

    // Restore tables - should only get Generated_Table
    const restoredTables = await flowiseTableService.restoreSessionTables(testSessionId);

    expect(restoredTables).toHaveLength(1);
    expect(restoredTables[0].tableType).toBe('generated');
    expect(restoredTables[0].keyword).toBe('Keyword2');
  });

  it('should get only restorable tables', async () => {
    // Save 2 processed Trigger_Tables
    const trigger1 = createMockTable([['Flowise'], ['K1']]);
    const trigger2 = createMockTable([['Flowise'], ['K2']]);

    await flowiseTableService.markTriggerTableAsProcessed(testSessionId, 'K1', trigger1);
    await flowiseTableService.markTriggerTableAsProcessed(testSessionId, 'K2', trigger2);

    // Save 3 Generated_Tables
    const gen1 = createMockTable([['Data'], ['1']]);
    const gen2 = createMockTable([['Data'], ['2']]);
    const gen3 = createMockTable([['Data'], ['3']]);

    await flowiseTableService.saveGeneratedTable(testSessionId, gen1, 'K1', 'n8n');
    await flowiseTableService.saveGeneratedTable(testSessionId, gen2, 'K2', 'n8n');
    await flowiseTableService.saveGeneratedTable(testSessionId, gen3, 'K3', 'n8n');

    // Get restorable tables
    const restorableTables = await flowiseTableService.getRestorableTables(testSessionId);

    // Should only get the 3 Generated_Tables
    expect(restorableTables).toHaveLength(3);
    expect(restorableTables.every(t => t.tableType === 'generated')).toBe(true);
  });

  it('should not duplicate Trigger_Table marking', async () => {
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      ['TestKeyword', 'Value']
    ]);

    // Mark as processed first time
    const tableId1 = await flowiseTableService.markTriggerTableAsProcessed(
      testSessionId,
      'TestKeyword',
      triggerTable
    );

    expect(tableId1).toBeTruthy();

    // Try to mark again - should return empty string
    const tableId2 = await flowiseTableService.markTriggerTableAsProcessed(
      testSessionId,
      'TestKeyword',
      triggerTable
    );

    expect(tableId2).toBe('');

    // Verify only one record exists
    const allTables = await flowiseTableService.getAllTables();
    const triggerTables = allTables.filter(t => t.tableType === 'trigger');
    expect(triggerTables).toHaveLength(1);
  });

  it('should distinguish between Trigger_Tables and Generated_Tables with same keyword', async () => {
    const keyword = 'SharedKeyword';

    // Create and save a Trigger_Table
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      [keyword, 'Value']
    ]);

    await flowiseTableService.markTriggerTableAsProcessed(
      testSessionId,
      keyword,
      triggerTable
    );

    // Create and save a Generated_Table with same keyword
    const generatedTable = createMockTable([
      ['Result', 'Value'],
      ['Data', '123']
    ]);

    await flowiseTableService.saveGeneratedTable(
      testSessionId,
      generatedTable,
      keyword,
      'n8n'
    );

    // Check for Generated_Tables - should find the generated one
    const hasGenerated = await flowiseTableService.hasGeneratedTablesForKeyword(
      testSessionId,
      keyword
    );
    expect(hasGenerated).toBe(true);

    // Get all tables
    const allTables = await flowiseTableService.getAllTables();
    const sessionTables = allTables.filter(t => t.sessionId === testSessionId);

    // Should have both tables
    expect(sessionTables).toHaveLength(2);

    const triggerTables = sessionTables.filter(t => t.tableType === 'trigger');
    const generatedTables = sessionTables.filter(t => t.tableType === 'generated');

    expect(triggerTables).toHaveLength(1);
    expect(generatedTables).toHaveLength(1);

    // Restoration should only return Generated_Table
    const restoredTables = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restoredTables).toHaveLength(1);
    expect(restoredTables[0].tableType).toBe('generated');
  });
});
