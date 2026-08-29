/**
 * Tests for FlowiseTableBridge Duplicate Detection and Trigger_Table Handling
 * Task 6.2: Trigger_Table handling integration with bridge
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FlowiseTableBridge } from '../flowiseTableBridge';
import { flowiseTableService } from '../flowiseTableService';

describe('FlowiseTableBridge - Trigger_Table Handling (Task 6.2)', () => {
  let bridge: FlowiseTableBridge;
  const testSessionId = 'test-session-bridge-trigger';

  beforeEach(async () => {
    // Clear all tables
    await flowiseTableService.clearAllTables();

    // Create a new bridge instance
    bridge = new FlowiseTableBridge();
    bridge.setCurrentSession(testSessionId);
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

  it('should allow processing of new Trigger_Table', async () => {
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      ['NewKeyword', 'Value']
    ]);

    const shouldProcess = await bridge.shouldProcessTriggerTable(
      triggerTable,
      'NewKeyword'
    );

    expect(shouldProcess).toBe(true);
  });

  it('should prevent processing of already processed Trigger_Table', async () => {
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      ['ProcessedKeyword', 'Value']
    ]);

    // Mark as processed
    await bridge.markTriggerTableProcessed(triggerTable, 'ProcessedKeyword');

    // Try to process again
    const shouldProcess = await bridge.shouldProcessTriggerTable(
      triggerTable,
      'ProcessedKeyword'
    );

    expect(shouldProcess).toBe(false);
  });

  it('should prevent processing when Generated_Tables exist for keyword', async () => {
    const keyword = 'ExistingKeyword';

    // Create and save a Generated_Table
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

    // Create a new Trigger_Table with same keyword
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      [keyword, 'Value']
    ]);

    // Should not process because Generated_Tables exist
    const shouldProcess = await bridge.shouldProcessTriggerTable(
      triggerTable,
      keyword
    );

    expect(shouldProcess).toBe(false);

    // Verify the Trigger_Table was automatically marked as processed
    const isProcessed = await flowiseTableService.isTriggerTableProcessed(
      testSessionId,
      triggerTable
    );
    expect(isProcessed).toBe(true);
  });

  it('should check for Generated_Tables by keyword', async () => {
    const keyword = 'TestKeyword';

    // Initially no Generated_Tables
    const hasGenerated1 = await bridge.hasGeneratedTablesForKeyword(keyword);
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
    const hasGenerated2 = await bridge.hasGeneratedTablesForKeyword(keyword);
    expect(hasGenerated2).toBe(true);
  });

  it('should handle shouldProcessTriggerTable without active session', async () => {
    // Create bridge without session
    const bridgeNoSession = new FlowiseTableBridge();

    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      ['Keyword', 'Value']
    ]);

    // Should return true (allow processing) as fallback
    const shouldProcess = await bridgeNoSession.shouldProcessTriggerTable(
      triggerTable,
      'Keyword'
    );

    expect(shouldProcess).toBe(true);
  });

  it('should handle markTriggerTableProcessed without active session', async () => {
    // Create bridge without session
    const bridgeNoSession = new FlowiseTableBridge();

    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      ['Keyword', 'Value']
    ]);

    // Should not throw error
    await expect(
      bridgeNoSession.markTriggerTableProcessed(triggerTable, 'Keyword')
    ).resolves.not.toThrow();
  });

  it('should handle complete Trigger_Table workflow', async () => {
    const keyword = 'WorkflowKeyword';
    const triggerTable = createMockTable([
      ['Flowise', 'Data'],
      [keyword, 'Value']
    ]);

    // Step 1: Check if should process (should be true initially)
    const shouldProcess1 = await bridge.shouldProcessTriggerTable(
      triggerTable,
      keyword
    );
    expect(shouldProcess1).toBe(true);

    // Step 2: Process the Trigger_Table (simulated - would call n8n)
    // ... n8n processing happens ...

    // Step 3: Save Generated_Tables from n8n response
    const generatedTable1 = createMockTable([['Result'], ['Data1']]);
    const generatedTable2 = createMockTable([['Result'], ['Data2']]);

    await flowiseTableService.saveGeneratedTable(
      testSessionId,
      generatedTable1,
      keyword,
      'n8n'
    );

    await flowiseTableService.saveGeneratedTable(
      testSessionId,
      generatedTable2,
      keyword,
      'n8n'
    );

    // Step 4: Mark Trigger_Table as processed
    await bridge.markTriggerTableProcessed(triggerTable, keyword);

    // Step 5: Verify subsequent checks prevent reprocessing
    const shouldProcess2 = await bridge.shouldProcessTriggerTable(
      triggerTable,
      keyword
    );
    expect(shouldProcess2).toBe(false);

    // Step 6: Verify restoration only includes Generated_Tables
    const restoredTables = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restoredTables).toHaveLength(2);
    expect(restoredTables.every(t => t.tableType === 'generated')).toBe(true);
  });

  it('should allow different Trigger_Tables with same keyword but different content', async () => {
    const keyword = 'SameKeyword';

    // First Trigger_Table
    const trigger1 = createMockTable([
      ['Flowise', 'Data'],
      [keyword, 'Value1']
    ]);

    // Second Trigger_Table with same keyword but different data
    const trigger2 = createMockTable([
      ['Flowise', 'Data'],
      [keyword, 'Value2']
    ]);

    // Process first trigger
    const shouldProcess1 = await bridge.shouldProcessTriggerTable(trigger1, keyword);
    expect(shouldProcess1).toBe(true);

    await bridge.markTriggerTableProcessed(trigger1, keyword);

    // Second trigger should still be processable (different content)
    const shouldProcess2 = await bridge.shouldProcessTriggerTable(trigger2, keyword);
    expect(shouldProcess2).toBe(true);
  });

  it('should prevent duplicate Trigger_Table with identical content', async () => {
    const keyword = 'DuplicateKeyword';

    // Create two identical Trigger_Tables
    const trigger1 = createMockTable([
      ['Flowise', 'Data'],
      [keyword, 'Value']
    ]);

    const trigger2 = createMockTable([
      ['Flowise', 'Data'],
      [keyword, 'Value']
    ]);

    // Process first trigger
    const shouldProcess1 = await bridge.shouldProcessTriggerTable(trigger1, keyword);
    expect(shouldProcess1).toBe(true);

    await bridge.markTriggerTableProcessed(trigger1, keyword);

    // Second identical trigger should not be processed
    const shouldProcess2 = await bridge.shouldProcessTriggerTable(trigger2, keyword);
    expect(shouldProcess2).toBe(false);
  });
});
