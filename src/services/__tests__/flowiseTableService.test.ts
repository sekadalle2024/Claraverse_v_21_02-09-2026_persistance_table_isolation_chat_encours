/**
 * Tests for FlowiseTableService
 * 
 * These tests verify the core functionality of the FlowiseTableService including
 * fingerprint generation, table saving, restoration, and compression.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { flowiseTableService } from '../flowiseTableService';
import { indexedDBService } from '../indexedDB';
import type { FlowiseGeneratedTableRecord } from '../../types/flowise_table_types';

// Increase timeout for IndexedDB operations
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

describe('FlowiseTableService - Fingerprint Generation', () => {
  afterEach(async () => {
    try {
      await Promise.race([
        indexedDBService.clearGeneratedTables(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cleanup timeout')), 5000))
      ]);
    } catch (error) {
      // Ignore cleanup errors in tests
      console.warn('Cleanup skipped:', error);
    }
  });

  it('should generate same fingerprint for identical tables', () => {
    const data = [['A', 'B'], ['1', '2']];
    const table1 = createMockTable(data);
    const table2 = createMockTable(data);
    
    const fp1 = flowiseTableService.generateTableFingerprint(table1);
    const fp2 = flowiseTableService.generateTableFingerprint(table2);
    
    expect(fp1).toBe(fp2);
    expect(fp1).toBeTruthy();
  });

  it('should generate different fingerprints for different content', () => {
    const table1 = createMockTable([['A', 'B'], ['1', '2']]);
    const table2 = createMockTable([['A', 'B'], ['3', '4']]);
    
    const fp1 = flowiseTableService.generateTableFingerprint(table1);
    const fp2 = flowiseTableService.generateTableFingerprint(table2);
    
    expect(fp1).not.toBe(fp2);
  });

  it('should generate different fingerprints for same keyword but different data', () => {
    const table1 = createTableWithHeaders(['Flowise', 'Data'], [['Keyword1', 'Value1']]);
    const table2 = createTableWithHeaders(['Flowise', 'Data'], [['Keyword1', 'Value2']]);
    
    const fp1 = flowiseTableService.generateTableFingerprint(table1);
    const fp2 = flowiseTableService.generateTableFingerprint(table2);
    
    expect(fp1).not.toBe(fp2);
  });

  it('should include structure metadata in fingerprint', () => {
    const table1 = createMockTable([['A'], ['1']]);
    const table2 = createMockTable([['A', 'B'], ['1', '2']]);
    
    const fp1 = flowiseTableService.generateTableFingerprint(table1);
    const fp2 = flowiseTableService.generateTableFingerprint(table2);
    
    expect(fp1).not.toBe(fp2);
  });
});

describe('FlowiseTableService - Save and Restore', () => {
  const testSessionId = 'test-session-123';

  afterEach(async () => {
    await indexedDBService.clearGeneratedTables();
  });

  it('should save and restore a table correctly', async () => {
    const table = createTableWithHeaders(['Name', 'Age'], [['Alice', '30'], ['Bob', '25']]);
    
    const tableId = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      table,
      'TestKeyword',
      'n8n'
    );
    
    expect(tableId).toBeTruthy();
    
    const restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(1);
    expect(restored[0].keyword).toBe('TestKeyword');
    expect(restored[0].source).toBe('n8n');
    expect(restored[0].metadata.rowCount).toBeGreaterThan(0);
  });

  it('should not save duplicate tables', async () => {
    const table = createMockTable([['A', 'B'], ['1', '2']]);
    
    // Save first time
    const tableId1 = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      table,
      'Keyword',
      'n8n'
    );
    expect(tableId1).toBeTruthy();
    
    // Try to save again (should be skipped)
    const tableId2 = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      table,
      'Keyword',
      'n8n'
    );
    expect(tableId2).toBe('');
    
    // Verify only one table exists
    const restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(1);
  });

  it('should restore tables in chronological order', async () => {
    const table1 = createMockTable([['First']]);
    const table2 = createMockTable([['Second']]);
    const table3 = createMockTable([['Third']]);
    
    // Save tables with small delays to ensure different timestamps
    await flowiseTableService.saveGeneratedTable(testSessionId, table1, 'K1', 'n8n');
    await new Promise(resolve => setTimeout(resolve, 10));
    await flowiseTableService.saveGeneratedTable(testSessionId, table2, 'K2', 'n8n');
    await new Promise(resolve => setTimeout(resolve, 10));
    await flowiseTableService.saveGeneratedTable(testSessionId, table3, 'K3', 'n8n');
    
    const restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(3);
    expect(restored[0].keyword).toBe('K1');
    expect(restored[1].keyword).toBe('K2');
    expect(restored[2].keyword).toBe('K3');
  });

  it('should handle different table sources', async () => {
    const table1 = createMockTable([['N8N']]);
    const table2 = createMockTable([['Cached']]);
    const table3 = createMockTable([['Error']]);
    
    await flowiseTableService.saveGeneratedTable(testSessionId, table1, 'K1', 'n8n');
    await flowiseTableService.saveGeneratedTable(testSessionId, table2, 'K2', 'cached');
    await flowiseTableService.saveGeneratedTable(testSessionId, table3, 'K3', 'error');
    
    const restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(3);
    
    const sources = restored.map(t => t.source).sort();
    expect(sources).toEqual(['cached', 'error', 'n8n']);
  });
});

describe('FlowiseTableService - Compression', () => {
  const testSessionId = 'compression-test-session';

  afterEach(async () => {
    await indexedDBService.clearGeneratedTables();
  });

  it('should compress large tables', () => {
    const largeContent = 'A'.repeat(60000); // > 50KB
    const compressed = flowiseTableService.compressHTML(largeContent);
    
    expect(compressed.length).toBeLessThan(largeContent.length);
  });

  it('should decompress compressed content correctly', () => {
    const originalContent = '<table><tr><td>Test Data</td></tr></table>';
    const compressed = flowiseTableService.compressHTML(originalContent);
    const decompressed = flowiseTableService.decompressHTML(compressed);
    
    expect(decompressed).toBe(originalContent);
  });

  it('should handle compression of large tables during save', async () => {
    // Create a large table (> 50KB)
    const largeData: string[][] = [];
    for (let i = 0; i < 1000; i++) {
      largeData.push([`Row ${i}`, `Data ${i}`, `Value ${i}`, `Extra ${i}`]);
    }
    const largeTable = createMockTable(largeData);
    
    const tableId = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      largeTable,
      'LargeKeyword',
      'n8n'
    );
    
    expect(tableId).toBeTruthy();
    
    // Verify the table was saved with compression metadata
    const restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(1);
    
    // The HTML should be decompressed during restoration
    expect(restored[0].html).toContain('<table>');
  });
});

describe('FlowiseTableService - Table Deletion', () => {
  const testSessionId = 'delete-test-session';

  afterEach(async () => {
    await indexedDBService.clearGeneratedTables();
  });

  it('should delete all tables for a session', async () => {
    const table1 = createMockTable([['Data1']]);
    const table2 = createMockTable([['Data2']]);
    
    await flowiseTableService.saveGeneratedTable(testSessionId, table1, 'K1', 'n8n');
    await flowiseTableService.saveGeneratedTable(testSessionId, table2, 'K2', 'n8n');
    
    let restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(2);
    
    const deletedCount = await flowiseTableService.deleteSessionTables(testSessionId);
    expect(deletedCount).toBe(2);
    
    restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(0);
  });

  it('should delete a specific table by ID', async () => {
    const table = createMockTable([['Data']]);
    
    const tableId = await flowiseTableService.saveGeneratedTable(
      testSessionId,
      table,
      'Keyword',
      'n8n'
    );
    
    let restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(1);
    
    await flowiseTableService.deleteTable(tableId);
    
    restored = await flowiseTableService.restoreSessionTables(testSessionId);
    expect(restored).toHaveLength(0);
  });
});

describe('FlowiseTableService - Metadata Extraction', () => {
  afterEach(async () => {
    await indexedDBService.clearGeneratedTables();
  });

  it('should extract correct row and column counts', async () => {
    const table = createTableWithHeaders(
      ['Col1', 'Col2', 'Col3'],
      [['A', 'B', 'C'], ['D', 'E', 'F']]
    );
    
    const tableId = await flowiseTableService.saveGeneratedTable(
      'test-session',
      table,
      'Keyword',
      'n8n'
    );
    
    const restored = await flowiseTableService.restoreSessionTables('test-session');
    expect(restored).toHaveLength(1);
    expect(restored[0].metadata.colCount).toBe(3);
    expect(restored[0].metadata.rowCount).toBe(3); // header + 2 data rows
  });

  it('should extract column headers', async () => {
    const headers = ['Name', 'Age', 'City'];
    const table = createTableWithHeaders(headers, [['Alice', '30', 'NYC']]);
    
    const tableId = await flowiseTableService.saveGeneratedTable(
      'test-session',
      table,
      'Keyword',
      'n8n'
    );
    
    const restored = await flowiseTableService.restoreSessionTables('test-session');
    expect(restored).toHaveLength(1);
    expect(restored[0].metadata.headers).toEqual(headers);
  });
});
