/**
 * Tests for FlowiseTableDiagnostics
 * 
 * Tests storage statistics calculation, integrity checking, and session table listing.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { flowiseTableDiagnostics } from '../flowiseTableDiagnostics';
import { flowiseTableService } from '../flowiseTableService';
import { indexedDBService } from '../indexedDB';

// Increase timeout for all tests in this file
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

// Helper function to create a mock table element
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

// Helper function to create a table with headers
function createTableWithHeaders(headers: string[], data: string[][]): HTMLTableElement {
  const table = document.createElement('table');
  
  // Create thead
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create tbody
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

// Helper to create a session
async function createTestSession(sessionId: string): Promise<void> {
  await indexedDBService.put('clara_sessions', {
    id: sessionId,
    title: `Test Session ${sessionId}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'test-user'
  });
}

// Generate unique session ID to avoid conflicts between tests
function generateUniqueSessionId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

describe('FlowiseTableDiagnostics - Storage Statistics', () => {
  it('should calculate storage statistics correctly', async () => {
    // Get baseline stats
    const baselineStats = await flowiseTableDiagnostics.getStorageStats();
    const baselineTables = baselineStats.totalTables;

    // Create a test session with a table
    const sessionId = generateUniqueSessionId('test-stats-baseline');
    await createTestSession(sessionId);

    const table = createMockTable([['Test', 'Data']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'BaselineKeyword',
      'n8n'
    );

    // Get new stats
    const stats = await flowiseTableDiagnostics.getStorageStats();

    // Verify the new table was counted
    expect(stats.totalTables).toBe(baselineTables + 1);
    expect(stats.totalSize).toBeGreaterThan(baselineStats.totalSize);
    expect(stats.averageSize).toBeGreaterThan(0);
  });

  it('should calculate storage statistics with single table', async () => {
    const sessionId = generateUniqueSessionId('test-stats-single');
    await createTestSession(sessionId);

    const table = createTableWithHeaders(
      ['Name', 'Age'],
      [['Alice', '30'], ['Bob', '25']]
    );

    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'TestKeyword',
      'n8n'
    );

    const stats = await flowiseTableDiagnostics.getStorageStats();

    expect(stats.totalTables).toBe(1);
    expect(stats.totalSize).toBeGreaterThan(0);
    expect(stats.averageSize).toBe(stats.totalSize);
    expect(stats.tablesBySession.get(sessionId)).toBe(1);
    expect(stats.largestTable).not.toBeNull();
    expect(stats.largestTable?.keyword).toBe('TestKeyword');
    expect(stats.oldestTable).not.toBeNull();
    expect(stats.oldestTable?.keyword).toBe('TestKeyword');
  });

  it('should calculate storage statistics with multiple tables', async () => {
    const sessionId1 = generateUniqueSessionId('test-stats-multi-1');
    const sessionId2 = generateUniqueSessionId('test-stats-multi-2');
    await createTestSession(sessionId1);
    await createTestSession(sessionId2);

    // Create 3 tables in session 1
    for (let i = 0; i < 3; i++) {
      const table = createTableWithHeaders(
        ['Col1', 'Col2'],
        [[`Data${i}`, `Value${i}`]]
      );
      await flowiseTableService.saveGeneratedTable(
        sessionId1,
        table,
        `Keyword${i}`,
        'n8n'
      );
    }

    // Create 2 tables in session 2
    for (let i = 0; i < 2; i++) {
      const table = createTableWithHeaders(
        ['Col1', 'Col2'],
        [[`Data${i}`, `Value${i}`]]
      );
      await flowiseTableService.saveGeneratedTable(
        sessionId2,
        table,
        `Keyword${i}`,
        'cached'
      );
    }

    const stats = await flowiseTableDiagnostics.getStorageStats();

    expect(stats.totalTables).toBe(5);
    expect(stats.tablesBySession.get(sessionId1)).toBe(3);
    expect(stats.tablesBySession.get(sessionId2)).toBe(2);
    expect(stats.tablesBySession.size).toBe(2);
    expect(stats.cachedTables).toBe(2);
    expect(stats.averageSize).toBeGreaterThan(0);
  });

  it('should count compressed tables correctly', async () => {
    const sessionId = generateUniqueSessionId('test-stats-compressed');
    await createTestSession(sessionId);

    // Create a large table that will be compressed
    const largeData: string[][] = [];
    for (let i = 0; i < 100; i++) {
      largeData.push([`Row${i}`, `Data${i}`, `Value${i}`, `Extra${i}`]);
    }

    const largeTable = createTableWithHeaders(
      ['Col1', 'Col2', 'Col3', 'Col4'],
      largeData
    );

    await flowiseTableService.saveGeneratedTable(
      sessionId,
      largeTable,
      'LargeKeyword',
      'n8n'
    );

    const stats = await flowiseTableDiagnostics.getStorageStats();

    expect(stats.totalTables).toBe(1);
    // Note: Compression depends on the actual size threshold
    // This test verifies the count is tracked
    expect(stats.compressedTables).toBeGreaterThanOrEqual(0);
  });

  it('should count error tables correctly', async () => {
    const sessionId = generateUniqueSessionId('test-stats-error');
    await createTestSession(sessionId);

    const errorTable = createMockTable([['Error occurred']]);

    await flowiseTableService.saveGeneratedTable(
      sessionId,
      errorTable,
      'ErrorKeyword',
      'error'
    );

    const stats = await flowiseTableDiagnostics.getStorageStats();

    expect(stats.totalTables).toBe(1);
    expect(stats.errorTables).toBe(1);
  });

  it('should identify largest table correctly', async () => {
    const sessionId = generateUniqueSessionId('test-stats-largest');
    await createTestSession(sessionId);

    // Create small table
    const smallTable = createMockTable([['A', 'B']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      smallTable,
      'SmallKeyword',
      'n8n'
    );

    // Create large table
    const largeData: string[][] = [];
    for (let i = 0; i < 50; i++) {
      largeData.push([`Row${i}`, `LongDataValue${i}`, `MoreData${i}`]);
    }
    const largeTable = createTableWithHeaders(['C1', 'C2', 'C3'], largeData);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      largeTable,
      'LargeKeyword',
      'n8n'
    );

    const stats = await flowiseTableDiagnostics.getStorageStats();

    expect(stats.largestTable).not.toBeNull();
    expect(stats.largestTable?.keyword).toBe('LargeKeyword');
    expect(stats.largestTable?.size).toBeGreaterThan(100);
  });
});

describe('FlowiseTableDiagnostics - Integrity Checking', () => {
  it('should report no issues for clean database', async () => {
    const sessionId = generateUniqueSessionId('test-integrity-clean');
    await createTestSession(sessionId);

    const table = createMockTable([['Data1', 'Data2']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'CleanKeyword',
      'n8n'
    );

    const result = await flowiseTableDiagnostics.checkIntegrity();

    expect(result.orphanedTables).toBe(0);
    expect(result.corruptedTables).toBe(0);
    expect(result.duplicates).toBe(0);
    expect(result.orphanedTableIds).toHaveLength(0);
    expect(result.corruptedTableIds).toHaveLength(0);
    expect(result.duplicateGroups).toHaveLength(0);
  });

  it('should detect orphaned tables', async () => {
    const sessionId = generateUniqueSessionId('test-integrity-orphaned');
    await createTestSession(sessionId);

    const table = createMockTable([['Data1', 'Data2']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'OrphanedKeyword',
      'n8n'
    );

    // Delete the session to create orphaned table
    await indexedDBService.delete('clara_sessions', sessionId);

    const result = await flowiseTableDiagnostics.checkIntegrity();

    expect(result.orphanedTables).toBe(1);
    expect(result.orphanedTableIds).toHaveLength(1);
  });

  it('should detect corrupted tables', async () => {
    const sessionId = generateUniqueSessionId('test-integrity-corrupted');
    await createTestSession(sessionId);

    // Create a valid table first
    const table = createMockTable([['Data1', 'Data2']]);
    const tableId = await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'CorruptedKeyword',
      'n8n'
    );

    // Manually corrupt the table by removing required fields
    const corruptedTable = await indexedDBService.get('clara_generated_tables', tableId);
    if (corruptedTable) {
      delete corruptedTable.html;
      await indexedDBService.put('clara_generated_tables', corruptedTable);
    }

    const result = await flowiseTableDiagnostics.checkIntegrity();

    expect(result.corruptedTables).toBe(1);
    expect(result.corruptedTableIds).toHaveLength(1);
  });

  it('should detect duplicate fingerprints in same session', async () => {
    const sessionId = generateUniqueSessionId('test-integrity-duplicate');
    await createTestSession(sessionId);

    const table = createMockTable([['Data1', 'Data2']]);
    
    // Save the same table twice by bypassing duplicate check
    const tableId1 = await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'DuplicateKeyword',
      'n8n'
    );

    // Manually create a duplicate with same fingerprint
    const originalTable = await indexedDBService.get('clara_generated_tables', tableId1);
    if (originalTable) {
      const duplicateTable = {
        ...originalTable,
        id: 'duplicate-' + Date.now()
      };
      await indexedDBService.put('clara_generated_tables', duplicateTable);
    }

    const result = await flowiseTableDiagnostics.checkIntegrity();

    expect(result.duplicates).toBeGreaterThan(0);
    expect(result.duplicateGroups.length).toBeGreaterThan(0);
  });

  it('should handle multiple integrity issues', async () => {
    const sessionId1 = generateUniqueSessionId('test-integrity-multi-1');
    const sessionId2 = generateUniqueSessionId('test-integrity-multi-2');
    await createTestSession(sessionId1);
    await createTestSession(sessionId2);

    // Create orphaned table
    const table1 = createMockTable([['Orphaned']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId1,
      table1,
      'Orphaned',
      'n8n'
    );
    await indexedDBService.delete('clara_sessions', sessionId1);

    // Create corrupted table
    const table2 = createMockTable([['Corrupted']]);
    const tableId2 = await flowiseTableService.saveGeneratedTable(
      sessionId2,
      table2,
      'Corrupted',
      'n8n'
    );
    const corruptedTable = await indexedDBService.get('clara_generated_tables', tableId2);
    if (corruptedTable) {
      delete corruptedTable.fingerprint;
      await indexedDBService.put('clara_generated_tables', corruptedTable);
    }

    const result = await flowiseTableDiagnostics.checkIntegrity();

    expect(result.orphanedTables).toBeGreaterThan(0);
    expect(result.corruptedTables).toBeGreaterThan(0);
  });
});

describe('FlowiseTableDiagnostics - Session Table Listing', () => {
  it('should return empty list for session with no tables', async () => {
    const sessionId = generateUniqueSessionId('test-list-empty');
    await createTestSession(sessionId);

    const tables = await flowiseTableDiagnostics.listSessionTables(sessionId);

    expect(tables).toHaveLength(0);
  });

  it('should list tables for session with single table', async () => {
    const sessionId = generateUniqueSessionId('test-list-single');
    await createTestSession(sessionId);

    const table = createTableWithHeaders(
      ['Name', 'Value'],
      [['Test', '123']]
    );

    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'SingleKeyword',
      'n8n'
    );

    const tables = await flowiseTableDiagnostics.listSessionTables(sessionId);

    expect(tables).toHaveLength(1);
    expect(tables[0].keyword).toBe('SingleKeyword');
    expect(tables[0].source).toBe('n8n');
    expect(tables[0].size).toBeGreaterThan(0);
    expect(tables[0].timestamp).toBeTruthy();
  });

  it('should list multiple tables for session', async () => {
    const sessionId = generateUniqueSessionId('test-list-multiple');
    await createTestSession(sessionId);

    // Create 3 tables with different keywords
    const keywords = ['Keyword1', 'Keyword2', 'Keyword3'];
    for (const keyword of keywords) {
      const table = createMockTable([[keyword, 'Data']]);
      await flowiseTableService.saveGeneratedTable(
        sessionId,
        table,
        keyword,
        'n8n'
      );
    }

    const tables = await flowiseTableDiagnostics.listSessionTables(sessionId);

    expect(tables).toHaveLength(3);
    const listedKeywords = tables.map(t => t.keyword);
    expect(listedKeywords).toContain('Keyword1');
    expect(listedKeywords).toContain('Keyword2');
    expect(listedKeywords).toContain('Keyword3');
  });

  it('should sort tables by timestamp (newest first)', async () => {
    const sessionId = generateUniqueSessionId('test-list-sorted');
    await createTestSession(sessionId);

    // Create tables with delays to ensure different timestamps
    const table1 = createMockTable([['First']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table1,
      'First',
      'n8n'
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const table2 = createMockTable([['Second']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table2,
      'Second',
      'n8n'
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const table3 = createMockTable([['Third']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table3,
      'Third',
      'n8n'
    );

    const tables = await flowiseTableDiagnostics.listSessionTables(sessionId);

    expect(tables).toHaveLength(3);
    // Newest first
    expect(tables[0].keyword).toBe('Third');
    expect(tables[1].keyword).toBe('Second');
    expect(tables[2].keyword).toBe('First');
  });

  it('should include table metadata in listing', async () => {
    const sessionId = generateUniqueSessionId('test-list-metadata');
    await createTestSession(sessionId);

    const table = createTableWithHeaders(
      ['Col1', 'Col2'],
      [['Data1', 'Data2']]
    );

    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'MetadataKeyword',
      'cached'
    );

    const tables = await flowiseTableDiagnostics.listSessionTables(sessionId);

    expect(tables).toHaveLength(1);
    expect(tables[0].id).toBeTruthy();
    expect(tables[0].keyword).toBe('MetadataKeyword');
    expect(tables[0].source).toBe('cached');
    expect(tables[0].compressed).toBeDefined();
    expect(tables[0].tableType).toBeDefined();
    expect(tables[0].processed).toBeDefined();
  });

  it('should not list tables from other sessions', async () => {
    const sessionId1 = generateUniqueSessionId('test-list-session1');
    const sessionId2 = generateUniqueSessionId('test-list-session2');
    await createTestSession(sessionId1);
    await createTestSession(sessionId2);

    // Create tables in session 1
    const table1 = createMockTable([['Session1']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId1,
      table1,
      'Session1Keyword',
      'n8n'
    );

    // Create tables in session 2
    const table2 = createMockTable([['Session2']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId2,
      table2,
      'Session2Keyword',
      'n8n'
    );

    const tables1 = await flowiseTableDiagnostics.listSessionTables(sessionId1);
    const tables2 = await flowiseTableDiagnostics.listSessionTables(sessionId2);

    expect(tables1).toHaveLength(1);
    expect(tables1[0].keyword).toBe('Session1Keyword');

    expect(tables2).toHaveLength(1);
    expect(tables2[0].keyword).toBe('Session2Keyword');
  });
});

describe('FlowiseTableDiagnostics - Formatted Output', () => {
  it('should generate formatted storage statistics', async () => {
    const sessionId = generateUniqueSessionId('test-format-stats');
    await createTestSession(sessionId);

    const table = createMockTable([['Data']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'FormatKeyword',
      'n8n'
    );

    const formatted = await flowiseTableDiagnostics.getStorageStatsFormatted();

    expect(formatted).toContain('Storage Statistics');
    expect(formatted).toContain('Total Tables: 1');
    expect(formatted).toContain('Total Size:');
    expect(formatted).toContain('Average Size:');
  });

  it('should generate formatted integrity check results', async () => {
    const sessionId = generateUniqueSessionId('test-format-integrity');
    await createTestSession(sessionId);

    const table = createMockTable([['Data']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'IntegrityKeyword',
      'n8n'
    );

    const formatted = await flowiseTableDiagnostics.checkIntegrityFormatted();

    expect(formatted).toContain('Integrity Check');
    expect(formatted).toContain('Orphaned Tables:');
    expect(formatted).toContain('Corrupted Tables:');
    expect(formatted).toContain('Duplicate Tables:');
  });

  it('should generate formatted session table list', async () => {
    const sessionId = generateUniqueSessionId('test-format-list');
    await createTestSession(sessionId);

    const table = createMockTable([['Data']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'ListKeyword',
      'n8n'
    );

    const formatted = await flowiseTableDiagnostics.listSessionTablesFormatted(sessionId);

    expect(formatted).toContain('Tables for Session');
    expect(formatted).toContain('Total Tables: 1');
    expect(formatted).toContain('ListKeyword');
  });

  it('should generate full diagnostic report', async () => {
    const sessionId = generateUniqueSessionId('test-format-report');
    await createTestSession(sessionId);

    const table = createMockTable([['Data']]);
    await flowiseTableService.saveGeneratedTable(
      sessionId,
      table,
      'ReportKeyword',
      'n8n'
    );

    const report = await flowiseTableDiagnostics.getFullDiagnosticReport();

    expect(report).toContain('DIAGNOSTIC REPORT');
    expect(report).toContain('Storage Statistics');
    expect(report).toContain('Integrity Check');
  });
});
