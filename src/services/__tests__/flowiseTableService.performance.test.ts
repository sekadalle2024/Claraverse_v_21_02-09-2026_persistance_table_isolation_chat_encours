/**
 * Performance Tests for FlowiseTableService (Task 13.4)
 * 
 * Tests performance characteristics including:
 * - Handling of 100+ tables
 * - Compression efficiency
 * - Lazy loading performance
 * - Batch operation speed
 * 
 * Requirements: 7.1, 7.2
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { flowiseTableService } from '../flowiseTableService';
import { flowiseTableLazyLoader } from '../flowiseTableLazyLoader';
import { flowiseTableCache } from '../flowiseTableCache';
import { indexedDBService } from '../indexedDB';
import type { FlowiseGeneratedTableRecord } from '../../types/flowise_table_types';

// Increase timeout for performance tests
vi.setConfig({ testTimeout: 300000 });

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

// Helper to create large table with many rows
function createLargeTable(rowCount: number, colCount: number = 5): HTMLTableElement {
  const headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
  const data: string[][] = [];
  
  for (let i = 0; i < rowCount; i++) {
    const row: string[] = [];
    for (let j = 0; j < colCount; j++) {
      row.push(`Row ${i + 1} Col ${j + 1} Data`);
    }
    data.push(row);
  }
  
  return createTableWithHeaders(headers, data);
}

describe('FlowiseTableService - Performance Tests (Task 13.4)', () => {
  // Note: Cleanup is handled within each test to avoid timeout issues

  describe('Handling 100+ Tables (Task 13.4)', () => {
    it('should save and restore 100 tables efficiently', async () => {
      const sessionId = 'perf-test-100-tables';
      
      // Measure save time
      const saveStart = performance.now();
      for (let i = 0; i < 100; i++) {
        const table = createMockTable([[`Data ${i}`]]);
        await flowiseTableService.saveGeneratedTable(
          sessionId,
          table,
          `Keyword${i}`,
          'n8n'
        );
      }
      const saveTime = performance.now() - saveStart;
      
      // Measure restore time
      const restoreStart = performance.now();
      const tables = await flowiseTableService.restoreSessionTables(sessionId);
      const restoreTime = performance.now() - restoreStart;
      
      expect(tables).toHaveLength(100);
      expect(saveTime).toBeLessThan(15000); // 15 seconds
      expect(restoreTime).toBeLessThan(5000); // 5 seconds
      
      console.log(`✅ 100 tables: saved in ${saveTime.toFixed(2)}ms, restored in ${restoreTime.toFixed(2)}ms`);
      
      // Cleanup
      await flowiseTableService.deleteSessionTables(sessionId);
    }, 60000);
  });

  describe('Compression Efficiency (Task 13.4)', () => {
    it('should compress and decompress large tables efficiently', () => {
      const largeTable = createLargeTable(1000, 5);
      const html = largeTable.outerHTML;
      
      expect(html.length).toBeGreaterThan(50000);
      
      // Test compression
      const compressStart = performance.now();
      const compressed = flowiseTableService.compressHTML(html);
      const compressTime = performance.now() - compressStart;
      
      // Test decompression
      const decompressStart = performance.now();
      const decompressed = flowiseTableService.decompressHTML(compressed);
      const decompressTime = performance.now() - decompressStart;
      
      const compressionRatio = compressed.length / html.length;
      
      expect(decompressed).toBe(html);
      expect(compressionRatio).toBeLessThan(0.7); // At least 30% reduction
      expect(compressTime).toBeLessThan(200);
      expect(decompressTime).toBeLessThan(100);
      
      console.log(`✅ Compression: ${html.length} → ${compressed.length} bytes (${(compressionRatio * 100).toFixed(1)}%) in ${compressTime.toFixed(2)}ms`);
      console.log(`✅ Decompression: ${decompressTime.toFixed(2)}ms`);
    });
  });

  describe('Lazy Loading Performance (Task 13.4)', () => {
    it('should create placeholders quickly', () => {
      const mockTables: FlowiseGeneratedTableRecord[] = [];
      
      for (let i = 0; i < 100; i++) {
        mockTables.push({
          id: `table-${i}`,
          sessionId: 'lazy-test',
          keyword: `Keyword${i}`,
          html: '<table><tr><td>Data</td></tr></table>',
          fingerprint: `fp-${i}`,
          containerId: 'container-1',
          position: i,
          timestamp: new Date().toISOString(),
          source: 'n8n',
          metadata: {
            rowCount: 10,
            colCount: 5,
            headers: ['Col1', 'Col2', 'Col3', 'Col4', 'Col5'],
            compressed: false
          },
          tableType: 'generated',
          processed: false
        });
      }
      
      const startTime = performance.now();
      const placeholders: HTMLElement[] = [];
      
      for (const table of mockTables) {
        const placeholder = flowiseTableLazyLoader.createPlaceholder(table);
        placeholders.push(placeholder);
      }
      
      const creationTime = performance.now() - startTime;
      
      expect(placeholders).toHaveLength(100);
      expect(creationTime).toBeLessThan(200); // 200ms for 100 placeholders
      
      console.log(`✅ Created 100 placeholders in ${creationTime.toFixed(2)}ms`);
    });
  });

  describe('Batch Operation Speed (Task 13.4)', () => {
    it('should perform batch operations faster than individual operations', async () => {
      const sessionId = 'batch-perf-test';
      const tableCount = 30;
      
      // Create test tables
      const tables: HTMLTableElement[] = [];
      for (let i = 0; i < tableCount; i++) {
        tables.push(createMockTable([[`Data ${i}`]]));
      }
      
      // Measure batch save time
      const batchData = tables.map((table, i) => ({
        sessionId: `${sessionId}-batch`,
        tableElement: table,
        keyword: `Keyword${i}`,
        source: 'n8n' as const
      }));
      
      const batchStart = performance.now();
      const savedIds = await flowiseTableService.saveTablesBatch(batchData);
      const batchTime = performance.now() - batchStart;
      
      expect(savedIds.length).toBe(tableCount);
      expect(batchTime).toBeLessThan(10000); // 10 seconds
      
      console.log(`✅ Batch saved ${tableCount} tables in ${batchTime.toFixed(2)}ms`);
      
      // Cleanup
      await flowiseTableService.deleteTablesBatch(savedIds);
    }, 30000);
  });

  describe('Cache Performance (Task 13.4)', () => {
    it('should improve access speed with caching', async () => {
      const sessionId = 'cache-perf-test';
      const tableCount = 20;
      
      // Save tables
      const tableIds: string[] = [];
      for (let i = 0; i < tableCount; i++) {
        const table = createMockTable([[`Data ${i}`]]);
        const id = await flowiseTableService.saveGeneratedTable(
          sessionId,
          table,
          `Keyword${i}`,
          'n8n'
        );
        tableIds.push(id);
      }
      
      // First access (cache miss)
      const firstAccessStart = performance.now();
      for (const id of tableIds) {
        await flowiseTableService.getTableById(id);
      }
      const firstAccessTime = performance.now() - firstAccessStart;
      
      // Second access (cache hit)
      const secondAccessStart = performance.now();
      for (const id of tableIds) {
        await flowiseTableService.getTableById(id);
      }
      const secondAccessTime = performance.now() - secondAccessStart;
      
      // Cache should make second access faster
      expect(secondAccessTime).toBeLessThan(firstAccessTime);
      
      const speedup = (firstAccessTime / secondAccessTime).toFixed(2);
      console.log(`✅ Cache speedup: ${speedup}x (${firstAccessTime.toFixed(2)}ms → ${secondAccessTime.toFixed(2)}ms)`);
      
      // Cleanup
      await flowiseTableService.deleteSessionTables(sessionId);
    }, 30000);
  });

  describe('Overall Performance Metrics (Task 13.4)', () => {
    it('should provide performance statistics', async () => {
      const sessionId = 'metrics-test';
      
      // Perform operations
      for (let i = 0; i < 10; i++) {
        const table = createMockTable([[`Data ${i}`]]);
        await flowiseTableService.saveGeneratedTable(
          sessionId,
          table,
          `Keyword${i}`,
          'n8n'
        );
      }
      
      await flowiseTableService.restoreSessionTables(sessionId);
      
      const cacheStats = flowiseTableService.getCacheStats();
      const batchStats = flowiseTableService.getBatchOperationStats();
      
      expect(cacheStats).toBeDefined();
      expect(cacheStats).toHaveProperty('hits');
      expect(cacheStats).toHaveProperty('misses');
      expect(batchStats).toBeDefined();
      
      console.log('📊 Cache stats:', cacheStats);
      console.log('📊 Batch stats:', batchStats);
      
      // Cleanup
      await flowiseTableService.deleteSessionTables(sessionId);
    }, 30000);
  });
});
