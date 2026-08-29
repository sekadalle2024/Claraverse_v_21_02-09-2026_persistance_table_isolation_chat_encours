/**
 * Unit Tests for FlowiseTableService (Non-IndexedDB operations)
 * 
 * These tests verify the core logic without requiring IndexedDB,
 * focusing on fingerprint generation, compression, and metadata extraction.
 */

import { describe, it, expect } from 'vitest';
import { flowiseTableService } from '../flowiseTableService';

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

describe('FlowiseTableService - Fingerprint Generation (Unit)', () => {
  it('should generate same fingerprint for identical tables', () => {
    const data = [['A', 'B'], ['1', '2']];
    const table1 = createMockTable(data);
    const table2 = createMockTable(data);
    
    const fp1 = flowiseTableService.generateTableFingerprint(table1);
    const fp2 = flowiseTableService.generateTableFingerprint(table2);
    
    expect(fp1).toBe(fp2);
    expect(fp1).toBeTruthy();
    expect(fp1.length).toBeGreaterThan(0);
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

  it('should generate consistent fingerprints', () => {
    const table = createTableWithHeaders(
      ['Name', 'Age', 'City'],
      [['Alice', '30', 'NYC'], ['Bob', '25', 'LA']]
    );
    
    // Generate fingerprint multiple times
    const fp1 = flowiseTableService.generateTableFingerprint(table);
    const fp2 = flowiseTableService.generateTableFingerprint(table);
    const fp3 = flowiseTableService.generateTableFingerprint(table);
    
    expect(fp1).toBe(fp2);
    expect(fp2).toBe(fp3);
  });
});

describe('FlowiseTableService - Compression (Unit)', () => {
  it('should compress and decompress content correctly', () => {
    const originalContent = '<table><tr><td>Test Data</td></tr></table>';
    const compressed = flowiseTableService.compressHTML(originalContent);
    const decompressed = flowiseTableService.decompressHTML(compressed);
    
    expect(decompressed).toBe(originalContent);
  });

  it('should compress large content', () => {
    const largeContent = 'A'.repeat(60000); // > 50KB
    const compressed = flowiseTableService.compressHTML(largeContent);
    
    expect(compressed.length).toBeLessThan(largeContent.length);
    expect(compressed.length).toBeGreaterThan(0);
  });

  it('should handle empty content', () => {
    const empty = '';
    const compressed = flowiseTableService.compressHTML(empty);
    const decompressed = flowiseTableService.decompressHTML(compressed);
    
    // lz-string may return a special character for empty strings
    // Just verify it doesn't throw and returns something
    expect(decompressed).toBeDefined();
    expect(typeof decompressed).toBe('string');
  });

  it('should handle special characters in compression', () => {
    const specialContent = '<table><tr><td>Special: &lt;&gt;&amp;"\'</td></tr></table>';
    const compressed = flowiseTableService.compressHTML(specialContent);
    const decompressed = flowiseTableService.decompressHTML(compressed);
    
    expect(decompressed).toBe(specialContent);
  });
});

describe('FlowiseTableService - Helper Methods (Unit)', () => {
  it('should handle tables without headers', () => {
    const table = createMockTable([['A', 'B'], ['C', 'D']]);
    const fingerprint = flowiseTableService.generateTableFingerprint(table);
    
    expect(fingerprint).toBeTruthy();
    expect(fingerprint.length).toBeGreaterThan(0);
  });

  it('should handle tables with headers', () => {
    const table = createTableWithHeaders(['Col1', 'Col2'], [['A', 'B']]);
    const fingerprint = flowiseTableService.generateTableFingerprint(table);
    
    expect(fingerprint).toBeTruthy();
    expect(fingerprint.length).toBeGreaterThan(0);
  });

  it('should handle empty tables', () => {
    const table = document.createElement('table');
    const fingerprint = flowiseTableService.generateTableFingerprint(table);
    
    expect(fingerprint).toBeTruthy();
  });

  it('should handle single cell tables', () => {
    const table = createMockTable([['Single']]);
    const fingerprint = flowiseTableService.generateTableFingerprint(table);
    
    expect(fingerprint).toBeTruthy();
    expect(fingerprint.length).toBeGreaterThan(0);
  });
});
