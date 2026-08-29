/**
 * Comprehensive Tests for Duplicate Detection
 * Task 6.3: Write tests for duplicate detection
 * 
 * Requirements Coverage:
 * - 5.3: Verify if Generated_Tables exist before processing Trigger_Table
 * - 5.4: Ignore Trigger_Table processing if Generated_Tables exist
 * - 11.5: Ignore saving if table with same fingerprint exists in same session
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { flowiseTableService } from '../flowiseTableService';

describe('Task 6.3 - Duplicate Detection Tests', () => {
  const testSessionId = 'test-session-duplicate-detection-comprehensive';

  beforeEach(async () => {
    await flowiseTableService.clearAllTables();
  });

  afterEach(async () => {
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

  describe('Requirement 11.5 - Fingerprint-based Duplicate Detection', () => {
    it('should reject duplicate table with same fingerprint in same session', async () => {
      const data = [
        ['Product', 'Price', 'Stock'],
        ['Laptop', '999', '15'],
        ['Mouse', '25', '50']
      ];

      const table1 = createMockTable(data);
      const table2 = createMockTable(data);

      // Save first table
      const tableId1 = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        table1,
        'ProductList',
        'n8n'
      );

      expect(tableId1).toBeTruthy();

      // Generate fingerprints - should be identical
      const fingerprint1 = flowiseTableService.generateTableFingerprint(table1);
      const fingerprint2 = flowiseTableService.generateTableFingerprint(table2);
      expect(fingerprint1).toBe(fingerprint2);

      // Attempt to save duplicate - should be rejected
      const tableId2 = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        table2,
        'ProductList',
        'n8n'
      );

      expect(tableId2).toBe(''); // Empty string indicates duplicate was rejected

      // Verify only one table exists
      const tables = await flowiseTableService.restoreSessionTables(testSessionId);
      expect(tables).toHaveLength(1);
    });

    it('should allow tables with same keyword but different content', async () => {
      const data1 = [
        ['Name', 'Score'],
        ['Alice', '95']
      ];

      const data2 = [
        ['Name', 'Score'],
        ['Bob', '87']
      ];

      const table1 = createMockTable(data1);
      const table2 = createMockTable(data2);

      // Both tables use same keyword but different content
      const tableId1 = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        table1,
        'StudentScores',
        'n8n'
      );

      const tableId2 = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        table2,
        'StudentScores',
        'n8n'
      );

      // Both should be saved successfully
      expect(tableId1).toBeTruthy();
      expect(tableId2).toBeTruthy();

      // Fingerprints should be different
      const fingerprint1 = flowiseTableService.generateTableFingerprint(table1);
      const fingerprint2 = flowiseTableService.generateTableFingerprint(table2);
      expect(fingerprint1).not.toBe(fingerprint2);

      // Verify both tables exist
      const tables = await flowiseTableService.restoreSessionTables(testSessionId);
      expect(tables).toHaveLength(2);
    });

    it('should allow same table content in different sessions', async () => {
      const session1 = 'session-1';
      const session2 = 'session-2';

      const data = [
        ['Item', 'Quantity'],
        ['Apple', '10']
      ];

      const table1 = createMockTable(data);
      const table2 = createMockTable(data);

      // Save identical table in different sessions
      const tableId1 = await flowiseTableService.saveGeneratedTable(
        session1,
        table1,
        'Inventory',
        'n8n'
      );

      const tableId2 = await flowiseTableService.saveGeneratedTable(
        session2,
        table2,
        'Inventory',
        'n8n'
      );

      // Both should be saved (different sessions)
      expect(tableId1).toBeTruthy();
      expect(tableId2).toBeTruthy();

      // Verify each session has its own table
      const tables1 = await flowiseTableService.restoreSessionTables(session1);
      const tables2 = await flowiseTableService.restoreSessionTables(session2);

      expect(tables1).toHaveLength(1);
      expect(tables2).toHaveLength(1);

      // Clean up
      await flowiseTableService.deleteSessionTables(session1);
      await flowiseTableService.deleteSessionTables(session2);
    });

    it('should detect duplicate even with different keyword', async () => {
      const data = [
        ['Column1', 'Column2'],
        ['Value1', 'Value2']
      ];

      const table1 = createMockTable(data);
      const table2 = createMockTable(data);

      // Save with first keyword
      const tableId1 = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        table1,
        'Keyword1',
        'n8n'
      );

      expect(tableId1).toBeTruthy();

      // Try to save same content with different keyword - should be rejected
      const tableId2 = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        table2,
        'Keyword2',
        'n8n'
      );

      expect(tableId2).toBe('');

      // Verify only one table exists
      const tables = await flowiseTableService.restoreSessionTables(testSessionId);
      expect(tables).toHaveLength(1);
      expect(tables[0].keyword).toBe('Keyword1'); // First keyword preserved
    });

    it('should use tableExists() to check for duplicates', async () => {
      const data = [
        ['Header1', 'Header2'],
        ['Data1', 'Data2']
      ];

      const table = createMockTable(data);
      const fingerprint = flowiseTableService.generateTableFingerprint(table);

      // Initially should not exist
      const exists1 = await flowiseTableService.tableExists(testSessionId, fingerprint);
      expect(exists1).toBe(false);

      // Save the table
      await flowiseTableService.saveGeneratedTable(
        testSessionId,
        table,
        'TestKeyword',
        'n8n'
      );

      // Now should exist
      const exists2 = await flowiseTableService.tableExists(testSessionId, fingerprint);
      expect(exists2).toBe(true);
    });
  });

  describe('Requirement 5.3 - Check for Generated_Tables Before Processing Trigger_Table', () => {
    it('should detect when Generated_Tables exist for a keyword', async () => {
      const keyword = 'ReportData';

      // Initially no Generated_Tables
      const hasGenerated1 = await flowiseTableService.hasGeneratedTablesForKeyword(
        testSessionId,
        keyword
      );
      expect(hasGenerated1).toBe(false);

      // Save a Generated_Table
      const generatedTable = createMockTable([
        ['Report', 'Value'],
        ['Sales', '1000']
      ]);

      await flowiseTableService.saveGeneratedTable(
        testSessionId,
        generatedTable,
        keyword,
        'n8n'
      );

      // Now should detect Generated_Tables
      const hasGenerated2 = await flowiseTableService.hasGeneratedTablesForKeyword(
        testSessionId,
        keyword
      );
      expect(hasGenerated2).toBe(true);
    });

    it('should not detect Generated_Tables from different sessions', async () => {
      const keyword = 'SharedKeyword';
      const session1 = 'session-1';
      const session2 = 'session-2';

      // Save Generated_Table in session1
      const table = createMockTable([['Data'], ['Value']]);
      await flowiseTableService.saveGeneratedTable(
        session1,
        table,
        keyword,
        'n8n'
      );

      // Check in session2 - should not find it
      const hasGenerated = await flowiseTableService.hasGeneratedTablesForKeyword(
        session2,
        keyword
      );
      expect(hasGenerated).toBe(false);

      // Clean up
      await flowiseTableService.deleteSessionTables(session1);
    });

    it('should detect multiple Generated_Tables for same keyword', async () => {
      const keyword = 'MultipleResults';

      // Save multiple Generated_Tables with same keyword
      const table1 = createMockTable([['Result'], ['A']]);
      const table2 = createMockTable([['Result'], ['B']]);
      const table3 = createMockTable([['Result'], ['C']]);

      await flowiseTableService.saveGeneratedTable(testSessionId, table1, keyword, 'n8n');
      await flowiseTableService.saveGeneratedTable(testSessionId, table2, keyword, 'n8n');
      await flowiseTableService.saveGeneratedTable(testSessionId, table3, keyword, 'n8n');

      // Should detect Generated_Tables
      const hasGenerated = await flowiseTableService.hasGeneratedTablesForKeyword(
        testSessionId,
        keyword
      );
      expect(hasGenerated).toBe(true);

      // Verify all three were saved
      const tables = await flowiseTableService.restoreSessionTables(testSessionId);
      const keywordTables = tables.filter(t => t.keyword === keyword);
      expect(keywordTables).toHaveLength(3);
    });
  });

  describe('Requirement 5.4 - Prevent Trigger_Table Processing When Generated_Tables Exist', () => {
    it('should mark Trigger_Table as processed', async () => {
      const keyword = 'ProcessedTrigger';
      const triggerTable = createMockTable([
        ['Flowise', 'Criteria'],
        [keyword, 'Value']
      ]);

      // Mark as processed
      const tableId = await flowiseTableService.markTriggerTableAsProcessed(
        testSessionId,
        keyword,
        triggerTable
      );

      expect(tableId).toBeTruthy();

      // Verify it was saved with correct metadata
      const allTables = await flowiseTableService.getAllTables();
      const savedTable = allTables.find(t => t.id === tableId);

      expect(savedTable).toBeDefined();
      expect(savedTable?.tableType).toBe('trigger');
      expect(savedTable?.processed).toBe(true);
      expect(savedTable?.keyword).toBe(keyword);
    });

    it('should detect if Trigger_Table is already processed', async () => {
      const keyword = 'AlreadyProcessed';
      const triggerTable = createMockTable([
        ['Flowise', 'Data'],
        [keyword, 'Value']
      ]);

      // Initially not processed
      const isProcessed1 = await flowiseTableService.isTriggerTableProcessed(
        testSessionId,
        triggerTable
      );
      expect(isProcessed1).toBe(false);

      // Mark as processed
      await flowiseTableService.markTriggerTableAsProcessed(
        testSessionId,
        keyword,
        triggerTable
      );

      // Now should be processed
      const isProcessed2 = await flowiseTableService.isTriggerTableProcessed(
        testSessionId,
        triggerTable
      );
      expect(isProcessed2).toBe(true);
    });

    it('should prevent duplicate Trigger_Table marking', async () => {
      const keyword = 'NoDuplicateMarking';
      const triggerTable = createMockTable([
        ['Flowise', 'Data'],
        [keyword, 'Value']
      ]);

      // Mark first time
      const tableId1 = await flowiseTableService.markTriggerTableAsProcessed(
        testSessionId,
        keyword,
        triggerTable
      );
      expect(tableId1).toBeTruthy();

      // Try to mark again - should return empty string
      const tableId2 = await flowiseTableService.markTriggerTableAsProcessed(
        testSessionId,
        keyword,
        triggerTable
      );
      expect(tableId2).toBe('');

      // Verify only one record exists
      const allTables = await flowiseTableService.getAllTables();
      const triggerTables = allTables.filter(
        t => t.sessionId === testSessionId && t.tableType === 'trigger'
      );
      expect(triggerTables).toHaveLength(1);
    });

    it('should exclude processed Trigger_Tables from restoration', async () => {
      // Save a processed Trigger_Table
      const triggerTable = createMockTable([
        ['Flowise', 'Data'],
        ['TriggerKeyword', 'Value']
      ]);

      await flowiseTableService.markTriggerTableAsProcessed(
        testSessionId,
        'TriggerKeyword',
        triggerTable
      );

      // Save a Generated_Table
      const generatedTable = createMockTable([
        ['Result', 'Value'],
        ['Data', '123']
      ]);

      await flowiseTableService.saveGeneratedTable(
        testSessionId,
        generatedTable,
        'GeneratedKeyword',
        'n8n'
      );

      // Restore tables - should only get Generated_Table
      const restoredTables = await flowiseTableService.restoreSessionTables(testSessionId);

      expect(restoredTables).toHaveLength(1);
      expect(restoredTables[0].tableType).toBe('generated');
      expect(restoredTables[0].keyword).toBe('GeneratedKeyword');
    });

    it('should distinguish Trigger_Tables from Generated_Tables with same keyword', async () => {
      const keyword = 'SharedKeyword';

      // Save a Trigger_Table
      const triggerTable = createMockTable([
        ['Flowise', 'Criteria'],
        [keyword, 'Value1']
      ]);

      await flowiseTableService.markTriggerTableAsProcessed(
        testSessionId,
        keyword,
        triggerTable
      );

      // Save a Generated_Table with same keyword
      const generatedTable = createMockTable([
        ['Result', 'Value'],
        ['Data', 'Value2']
      ]);

      await flowiseTableService.saveGeneratedTable(
        testSessionId,
        generatedTable,
        keyword,
        'n8n'
      );

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

    it('should get only restorable tables (exclude Trigger_Tables)', async () => {
      // Save 2 Trigger_Tables
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
  });

  describe('Integration - Complete Duplicate Detection Workflow', () => {
    it('should handle complete workflow: Trigger_Table -> Generated_Tables -> Duplicate Prevention', async () => {
      const keyword = 'CompleteWorkflow';

      // Step 1: Check if Generated_Tables exist (should be false)
      const hasGenerated1 = await flowiseTableService.hasGeneratedTablesForKeyword(
        testSessionId,
        keyword
      );
      expect(hasGenerated1).toBe(false);

      // Step 2: Create and mark Trigger_Table as processed
      const triggerTable = createMockTable([
        ['Flowise', 'Criteria'],
        [keyword, 'Value']
      ]);

      const triggerTableId = await flowiseTableService.markTriggerTableAsProcessed(
        testSessionId,
        keyword,
        triggerTable
      );
      expect(triggerTableId).toBeTruthy();

      // Step 3: Save Generated_Tables from n8n response
      const generatedTable1 = createMockTable([['Result'], ['Data1']]);
      const generatedTable2 = createMockTable([['Result'], ['Data2']]);

      const genId1 = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        generatedTable1,
        keyword,
        'n8n'
      );

      const genId2 = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        generatedTable2,
        keyword,
        'n8n'
      );

      expect(genId1).toBeTruthy();
      expect(genId2).toBeTruthy();

      // Step 4: Check if Generated_Tables exist (should be true now)
      const hasGenerated2 = await flowiseTableService.hasGeneratedTablesForKeyword(
        testSessionId,
        keyword
      );
      expect(hasGenerated2).toBe(true);

      // Step 5: Try to save duplicate Generated_Table (should be rejected)
      const duplicateTable = createMockTable([['Result'], ['Data1']]);
      const dupId = await flowiseTableService.saveGeneratedTable(
        testSessionId,
        duplicateTable,
        keyword,
        'n8n'
      );
      expect(dupId).toBe(''); // Duplicate rejected

      // Step 6: Verify restoration only includes Generated_Tables
      const restoredTables = await flowiseTableService.restoreSessionTables(testSessionId);
      expect(restoredTables).toHaveLength(2);
      expect(restoredTables.every(t => t.tableType === 'generated')).toBe(true);
      expect(restoredTables.every(t => t.keyword === keyword)).toBe(true);

      // Step 7: Verify Trigger_Table is not restored
      const allTables = await flowiseTableService.getAllTables();
      const sessionTables = allTables.filter(t => t.sessionId === testSessionId);
      expect(sessionTables).toHaveLength(3); // 1 trigger + 2 generated

      const triggerTables = sessionTables.filter(t => t.tableType === 'trigger');
      expect(triggerTables).toHaveLength(1);
      expect(triggerTables[0].processed).toBe(true);
    });

    it('should handle multiple keywords with mixed Trigger and Generated tables', async () => {
      // Keyword 1: Complete workflow
      const keyword1 = 'Keyword1';
      const trigger1 = createMockTable([['Flowise'], [keyword1]]);
      await flowiseTableService.markTriggerTableAsProcessed(testSessionId, keyword1, trigger1);

      const gen1 = createMockTable([['Result1'], ['Data1']]);
      await flowiseTableService.saveGeneratedTable(testSessionId, gen1, keyword1, 'n8n');

      // Keyword 2: Only Generated tables
      const keyword2 = 'Keyword2';
      const gen2 = createMockTable([['Result2'], ['Data2']]);
      await flowiseTableService.saveGeneratedTable(testSessionId, gen2, keyword2, 'n8n');

      // Keyword 3: Only Trigger table (not yet processed)
      const keyword3 = 'Keyword3';
      const trigger3 = createMockTable([['Flowise'], [keyword3]]);
      await flowiseTableService.markTriggerTableAsProcessed(testSessionId, keyword3, trigger3);

      // Verify Generated_Tables detection
      expect(await flowiseTableService.hasGeneratedTablesForKeyword(testSessionId, keyword1)).toBe(true);
      expect(await flowiseTableService.hasGeneratedTablesForKeyword(testSessionId, keyword2)).toBe(true);
      expect(await flowiseTableService.hasGeneratedTablesForKeyword(testSessionId, keyword3)).toBe(false);

      // Verify restoration only includes Generated_Tables
      const restoredTables = await flowiseTableService.restoreSessionTables(testSessionId);
      expect(restoredTables).toHaveLength(2);
      expect(restoredTables.every(t => t.tableType === 'generated')).toBe(true);
    });
  });
});
