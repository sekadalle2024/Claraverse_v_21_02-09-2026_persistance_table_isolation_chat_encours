/**
 * Flowise Table Persistence - Stress Test Suite
 * 
 * Stress tests for Task 14.2:
 * - Test with 500+ tables
 * - Test with large tables (> 1MB)
 * - Test rapid table generation
 * - Test concurrent operations
 * 
 * Requirements: 7.1, 7.2, 7.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlowiseTableBridge } from '../flowiseTableBridge';
import { flowiseTableService } from '../flowiseTableService';
import { indexedDBService } from '../indexedDB';

// Extended timeout for stress tests
const STRESS_TEST_TIMEOUT = 120000; // 2 minutes

// Helper to wait for async operations
const waitForAsync = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create a mock table element
function createMockTable(data: { headers: string[], rows: string[][] }): HTMLTableElement {
  const table = document.createElement('table');
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  data.headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  data.rows.forEach(rowData => {
    const row = document.createElement('tr');
    rowData.forEach(cellData => {
      const td = document.createElement('td');
      td.textContent = cellData;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  
  return table;
}

// Helper to create large table
function createLargeTable(rows: number, cols: number): HTMLTableElement {
  const headers = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`);
  const rowsData = Array.from({ length: rows }, (_, i) => 
    Array.from({ length: cols }, (_, j) => `Row ${i + 1} Col ${j + 1} - Lorem ipsum dolor sit amet`)
  );
  
  return createMockTable({ headers, rows: rowsData });
}

// Helper to emit Flowise event
function emitFlowiseEvent(table: HTMLTableElement, keyword: string, source: 'n8n' | 'cached' | 'error' = 'n8n') {
  const event = new CustomEvent('flowise:table:integrated', {
    detail: {
      table,
      keyword,
      source,
      timestamp: Date.now()
    }
  });
  document.dispatchEvent(event);
}

describe('Flowise Table Persistence - Stress Tests', () => {
  let bridge: FlowiseTableBridge;

  beforeEach(async () => {
    document.body.innerHTML = '';
    delete (window as any).claraverseState;
    window.history.pushState({}, '', window.location.pathname);
    vi.clearAllMocks();
    
    try {
      await flowiseTableService.clearAllTables();
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  });

  afterEach(async () => {
    vi.clearAllMocks();
    try {
      await flowiseTableService.clearAllTables();
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  });

  describe('Stress Test 1: High Volume Tables (500+)', () => {
    /**
     * Test system with 500+ tables
     * Requirements: 7.5
     */
    it('should handle saving 500 tables', async () => {
      const sessionId = 'stress-500-tables';
      const tableCount = 500;
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      console.log(`Starting to save ${tableCount} tables...`);
      const startTime = performance.now();

      // Save 500 tables
      for (let i = 0; i < tableCount; i++) {
        const table = createMockTable({
          headers: ['ID', 'Name', 'Value'],
          rows: [[`${i}`, `Table ${i}`, `Value ${i}`]]
        });
        
        emitFlowiseEvent(table, `Table${i}`, 'n8n');
        
        // Small delay every 50 tables to prevent overwhelming
        if (i % 50 === 0) {
          await waitForAsync(10);
          console.log(`Saved ${i} tables...`);
        }
      }

      // Wait for all saves to complete
      await waitForAsync(1000);

      const saveTime = performance.now() - startTime;
      console.log(`Saved ${tableCount} tables in ${saveTime.toFixed(2)}ms`);

      // Verify all tables saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables.length).toBeGreaterThanOrEqual(tableCount * 0.95); // Allow 5% margin
      
      // Performance check: should complete in reasonable time
      expect(saveTime).toBeLessThan(60000); // < 60 seconds
    }, STRESS_TEST_TIMEOUT);

    it('should restore 500 tables efficiently', async () => {
      const sessionId = 'stress-restore-500';
      const tableCount = 500;
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Save 500 tables
      console.log(`Saving ${tableCount} tables for restoration test...`);
      for (let i = 0; i < tableCount; i++) {
        const table = createMockTable({
          headers: ['Data'],
          rows: [[`Table ${i}`]]
        });
        
        emitFlowiseEvent(table, `RestoreTable${i}`, 'n8n');
        
        if (i % 100 === 0) {
          await waitForAsync(10);
        }
      }

      await waitForAsync(1000);

      // Clear DOM
      document.body.innerHTML = '';

      // Restore all tables
      console.log('Starting restoration...');
      const restoreStart = performance.now();
      
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync(500);

      const restoreTime = performance.now() - restoreStart;
      console.log(`Restored tables in ${restoreTime.toFixed(2)}ms`);

      // Verify restoration
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables.length).toBeGreaterThanOrEqual(tableCount * 0.95);

      // Performance check
      expect(restoreTime).toBeLessThan(30000); // < 30 seconds
    }, STRESS_TEST_TIMEOUT);

    it('should handle storage optimization with 500+ tables', async () => {
      const sessionId = 'stress-optimization-500';
      const tableCount = 550; // Over the 500 limit
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      console.log(`Saving ${tableCount} tables to trigger optimization...`);
      
      // Save tables
      for (let i = 0; i < tableCount; i++) {
        const table = createMockTable({
          headers: ['ID'],
          rows: [[`${i}`]]
        });
        
        emitFlowiseEvent(table, `OptTable${i}`, 'n8n');
        
        if (i % 100 === 0) {
          await waitForAsync(10);
          console.log(`Saved ${i} tables...`);
        }
      }

      await waitForAsync(1000);

      // Check if cleanup was triggered
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      console.log(`Final table count: ${savedTables.length}`);
      
      // Should have cleaned up some tables
      expect(savedTables.length).toBeLessThanOrEqual(500);
    }, STRESS_TEST_TIMEOUT);
  });

  describe('Stress Test 2: Large Tables (> 1MB)', () => {
    /**
     * Test system with very large tables
     * Requirements: 7.1
     */
    it('should handle table with 1000 rows', async () => {
      const sessionId = 'stress-large-table-1000';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      console.log('Creating large table with 1000 rows...');
      const largeTable = createLargeTable(1000, 10);
      
      const htmlSize = largeTable.outerHTML.length;
      console.log(`Table HTML size: ${(htmlSize / 1024).toFixed(2)} KB`);

      const saveStart = performance.now();
      emitFlowiseEvent(largeTable, 'LargeTable1000', 'n8n');
      await waitForAsync(500);

      const saveTime = performance.now() - saveStart;
      console.log(`Saved large table in ${saveTime.toFixed(2)}ms`);

      // Verify saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(1);
      
      const savedTable = savedTables[0];
      expect(savedTable.metadata.rowCount).toBe(1001); // header + 1000 rows
      
      // Check if compression was applied
      if (htmlSize > 50000) {
        expect(savedTable.metadata.compressed).toBe(true);
        console.log('Compression applied');
      }

      // Restore and verify
      document.body.innerHTML = '';
      const restoreStart = performance.now();
      
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync(500);

      const restoreTime = performance.now() - restoreStart;
      console.log(`Restored large table in ${restoreTime.toFixed(2)}ms`);

      const restoredTable = document.querySelector('[data-restored="true"] table');
      expect(restoredTable).toBeTruthy();
      
      const rows = restoredTable?.querySelectorAll('tr');
      expect(rows?.length).toBe(1001);
    }, STRESS_TEST_TIMEOUT);

    it('should compress tables larger than 50KB', async () => {
      const sessionId = 'stress-compression';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Create table that will be > 50KB
      console.log('Creating very large table for compression test...');
      const veryLargeTable = createLargeTable(500, 20);
      
      const htmlSize = veryLargeTable.outerHTML.length;
      console.log(`Table HTML size: ${(htmlSize / 1024).toFixed(2)} KB`);
      expect(htmlSize).toBeGreaterThan(50000);

      emitFlowiseEvent(veryLargeTable, 'CompressionTest', 'n8n');
      await waitForAsync(500);

      // Verify compression applied
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      const savedTable = savedTables[0];
      
      expect(savedTable.metadata.compressed).toBe(true);
      expect(savedTable.metadata.originalSize).toBe(htmlSize);
      
      // Verify compressed size is smaller
      const compressedSize = savedTable.html.length;
      const compressionRatio = compressedSize / htmlSize;
      console.log(`Compression ratio: ${(compressionRatio * 100).toFixed(2)}%`);
      expect(compressionRatio).toBeLessThan(0.8); // At least 20% compression

      // Restore and verify content preserved
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync(500);

      const restoredTable = document.querySelector('[data-restored="true"] table');
      expect(restoredTable).toBeTruthy();
      
      const cells = restoredTable?.querySelectorAll('td');
      expect(cells?.length).toBe(500 * 20); // All cells preserved
    }, STRESS_TEST_TIMEOUT);

    it('should handle multiple large tables', async () => {
      const sessionId = 'stress-multiple-large';
      const largeTableCount = 10;
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      console.log(`Creating ${largeTableCount} large tables...`);
      
      for (let i = 0; i < largeTableCount; i++) {
        const largeTable = createLargeTable(200, 15);
        emitFlowiseEvent(largeTable, `LargeTable${i}`, 'n8n');
        await waitForAsync(100);
        console.log(`Saved large table ${i + 1}/${largeTableCount}`);
      }

      await waitForAsync(1000);

      // Verify all saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(largeTableCount);

      // Check compression stats
      const compressedCount = savedTables.filter(t => t.metadata.compressed).length;
      console.log(`${compressedCount}/${largeTableCount} tables compressed`);

      // Restore all
      document.body.innerHTML = '';
      await bridge.restoreTablesForSession(sessionId);
      await waitForAsync(1000);

      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      expect(restoredTables).toHaveLength(largeTableCount);
    }, STRESS_TEST_TIMEOUT);
  });

  describe('Stress Test 3: Rapid Table Generation', () => {
    /**
     * Test rapid successive table generation
     * Requirements: 7.1
     */
    it('should handle rapid table generation (100 tables in quick succession)', async () => {
      const sessionId = 'stress-rapid-generation';
      const rapidCount = 100;
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      console.log(`Rapidly generating ${rapidCount} tables...`);
      const startTime = performance.now();

      // Generate tables rapidly without delays
      for (let i = 0; i < rapidCount; i++) {
        const table = createMockTable({
          headers: ['Rapid'],
          rows: [[`Table ${i}`]]
        });
        
        emitFlowiseEvent(table, `RapidTable${i}`, 'n8n');
      }

      // Wait for processing
      await waitForAsync(2000);

      const generationTime = performance.now() - startTime;
      console.log(`Generated ${rapidCount} tables in ${generationTime.toFixed(2)}ms`);

      // Verify most tables saved (allow some to be deduplicated or dropped)
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables.length).toBeGreaterThanOrEqual(rapidCount * 0.9); // 90% success rate
      
      console.log(`Successfully saved ${savedTables.length}/${rapidCount} tables`);
    }, STRESS_TEST_TIMEOUT);

    it('should handle burst of duplicate tables', async () => {
      const sessionId = 'stress-duplicate-burst';
      const burstSize = 50;
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      // Create same table data
      const tableData = {
        headers: ['Duplicate'],
        rows: [['Same content']]
      };

      console.log(`Sending burst of ${burstSize} duplicate tables...`);
      
      // Send burst of duplicates
      for (let i = 0; i < burstSize; i++) {
        const table = createMockTable(tableData);
        emitFlowiseEvent(table, 'DuplicateBurst', 'n8n');
      }

      await waitForAsync(1000);

      // Verify only one saved
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(savedTables).toHaveLength(1);
      
      console.log('Duplicate detection working correctly');
    }, STRESS_TEST_TIMEOUT);

    it('should handle alternating save and restore operations', async () => {
      const sessionId = 'stress-alternating-ops';
      const cycles = 20;
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      console.log(`Running ${cycles} alternating save/restore cycles...`);

      for (let i = 0; i < cycles; i++) {
        // Save a table
        const table = createMockTable({
          headers: ['Cycle'],
          rows: [[`Cycle ${i}`]]
        });
        emitFlowiseEvent(table, `CycleTable${i}`, 'n8n');
        await waitForAsync(50);

        // Restore tables
        document.body.innerHTML = '';
        await bridge.restoreTablesForSession(sessionId);
        await waitForAsync(50);

        // Verify restoration
        const restoredTables = document.querySelectorAll('[data-restored="true"]');
        expect(restoredTables.length).toBe(i + 1);
        
        if (i % 5 === 0) {
          console.log(`Completed ${i + 1}/${cycles} cycles`);
        }
      }

      console.log('All alternating cycles completed successfully');
    }, STRESS_TEST_TIMEOUT);
  });

  describe('Stress Test 4: Concurrent Operations', () => {
    /**
     * Test concurrent save and restore operations
     * Requirements: 7.1
     */
    it('should handle concurrent saves to different sessions', async () => {
      const sessionCount = 10;
      const tablesPerSession = 20;
      
      console.log(`Testing concurrent saves to ${sessionCount} sessions...`);

      // Create bridges for multiple sessions
      const bridges = Array.from({ length: sessionCount }, (_, i) => {
        const b = new FlowiseTableBridge();
        b.setCurrentSession(`stress-concurrent-${i}`);
        return b;
      });

      const startTime = performance.now();

      // Save tables concurrently to all sessions
      const savePromises = bridges.map(async (b, sessionIndex) => {
        for (let i = 0; i < tablesPerSession; i++) {
          const table = createMockTable({
            headers: ['Session', 'Table'],
            rows: [[`${sessionIndex}`, `${i}`]]
          });
          
          emitFlowiseEvent(table, `S${sessionIndex}T${i}`, 'n8n');
          
          if (i % 5 === 0) {
            await waitForAsync(10);
          }
        }
      });

      await Promise.all(savePromises);
      await waitForAsync(1000);

      const saveTime = performance.now() - startTime;
      console.log(`Concurrent saves completed in ${saveTime.toFixed(2)}ms`);

      // Verify all sessions have correct table count
      for (let i = 0; i < sessionCount; i++) {
        const tables = await flowiseTableService.restoreSessionTables(`stress-concurrent-${i}`);
        expect(tables.length).toBeGreaterThanOrEqual(tablesPerSession * 0.9);
      }

      console.log('All concurrent sessions verified');
    }, STRESS_TEST_TIMEOUT);

    it('should handle concurrent restore operations', async () => {
      const sessionCount = 5;
      const tablesPerSession = 30;
      
      console.log(`Setting up ${sessionCount} sessions for concurrent restore...`);

      // Setup: Save tables to multiple sessions
      for (let s = 0; s < sessionCount; s++) {
        const bridge = new FlowiseTableBridge();
        bridge.setCurrentSession(`stress-restore-concurrent-${s}`);
        
        for (let t = 0; t < tablesPerSession; t++) {
          const table = createMockTable({
            headers: ['Data'],
            rows: [[`S${s}T${t}`]]
          });
          emitFlowiseEvent(table, `S${s}T${t}`, 'n8n');
        }
        
        await waitForAsync(100);
      }

      await waitForAsync(1000);

      // Clear DOM
      document.body.innerHTML = '';

      // Restore all sessions concurrently
      console.log('Starting concurrent restore operations...');
      const restoreStart = performance.now();

      const restorePromises = Array.from({ length: sessionCount }, async (_, i) => {
        const bridge = new FlowiseTableBridge();
        bridge.setCurrentSession(`stress-restore-concurrent-${i}`);
        await bridge.restoreTablesForSession(`stress-restore-concurrent-${i}`);
      });

      await Promise.all(restorePromises);
      await waitForAsync(500);

      const restoreTime = performance.now() - restoreStart;
      console.log(`Concurrent restores completed in ${restoreTime.toFixed(2)}ms`);

      // Verify all tables restored
      const allRestoredTables = document.querySelectorAll('[data-restored="true"]');
      const expectedTotal = sessionCount * tablesPerSession;
      expect(allRestoredTables.length).toBeGreaterThanOrEqual(expectedTotal * 0.9);
      
      console.log(`Restored ${allRestoredTables.length}/${expectedTotal} tables`);
    }, STRESS_TEST_TIMEOUT);

    it('should handle mixed concurrent operations', async () => {
      const sessionId = 'stress-mixed-concurrent';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      console.log('Running mixed concurrent operations...');

      // Start multiple operations concurrently
      const operations = [
        // Save operations
        ...Array.from({ length: 20 }, (_, i) => async () => {
          const table = createMockTable({
            headers: ['Mixed'],
            rows: [[`Table ${i}`]]
          });
          emitFlowiseEvent(table, `MixedTable${i}`, 'n8n');
          await waitForAsync(10);
        }),
        
        // Restore operations
        ...Array.from({ length: 5 }, () => async () => {
          await bridge.restoreTablesForSession(sessionId);
          await waitForAsync(50);
        }),
        
        // Query operations
        ...Array.from({ length: 5 }, () => async () => {
          await flowiseTableService.restoreSessionTables(sessionId);
          await waitForAsync(20);
        })
      ];

      // Shuffle operations
      operations.sort(() => Math.random() - 0.5);

      // Execute all concurrently
      const startTime = performance.now();
      await Promise.all(operations.map(op => op()));
      const totalTime = performance.now() - startTime;

      console.log(`Mixed operations completed in ${totalTime.toFixed(2)}ms`);

      // Verify system is still functional
      const finalTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(finalTables.length).toBeGreaterThan(0);
      
      console.log(`System stable with ${finalTables.length} tables`);
    }, STRESS_TEST_TIMEOUT);
  });

  describe('Stress Test 5: Memory and Performance', () => {
    /**
     * Test memory usage and performance under stress
     * Requirements: 7.1, 7.2
     */
    it('should maintain performance with growing dataset', async () => {
      const sessionId = 'stress-performance-growth';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      const batches = [50, 100, 150, 200];
      const timings: number[] = [];

      for (const batchSize of batches) {
        console.log(`Testing performance with ${batchSize} tables...`);
        
        const startTime = performance.now();
        
        for (let i = 0; i < batchSize; i++) {
          const table = createMockTable({
            headers: ['Perf'],
            rows: [[`Table ${i}`]]
          });
          emitFlowiseEvent(table, `PerfTable${i}`, 'n8n');
          
          if (i % 25 === 0) {
            await waitForAsync(10);
          }
        }
        
        await waitForAsync(500);
        
        const batchTime = performance.now() - startTime;
        timings.push(batchTime);
        
        console.log(`Batch of ${batchSize} completed in ${batchTime.toFixed(2)}ms`);
      }

      // Verify performance doesn't degrade significantly
      const avgTimePerTable = timings.map((time, i) => time / batches[i]);
      console.log('Average time per table:', avgTimePerTable.map(t => t.toFixed(2)));
      
      // Performance should remain relatively stable
      const firstAvg = avgTimePerTable[0];
      const lastAvg = avgTimePerTable[avgTimePerTable.length - 1];
      const degradation = lastAvg / firstAvg;
      
      console.log(`Performance degradation factor: ${degradation.toFixed(2)}x`);
      expect(degradation).toBeLessThan(3); // Less than 3x slowdown
    }, STRESS_TEST_TIMEOUT);

    it('should handle cleanup under memory pressure', async () => {
      const sessionId = 'stress-memory-pressure';
      
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession(sessionId);

      console.log('Creating memory pressure with large tables...');

      // Create many large tables to trigger cleanup
      for (let i = 0; i < 100; i++) {
        const largeTable = createLargeTable(100, 10);
        emitFlowiseEvent(largeTable, `MemTable${i}`, 'n8n');
        
        if (i % 10 === 0) {
          await waitForAsync(100);
          console.log(`Created ${i} large tables...`);
        }
      }

      await waitForAsync(2000);

      // Verify system handled cleanup
      const savedTables = await flowiseTableService.restoreSessionTables(sessionId);
      console.log(`Final table count after cleanup: ${savedTables.length}`);
      
      // Should have cleaned up to stay under limits
      expect(savedTables.length).toBeLessThanOrEqual(500);
      
      // System should still be functional
      const table = createMockTable({
        headers: ['Test'],
        rows: [['After cleanup']]
      });
      emitFlowiseEvent(table, 'AfterCleanup', 'n8n');
      await waitForAsync(200);

      const finalTables = await flowiseTableService.restoreSessionTables(sessionId);
      expect(finalTables.length).toBeGreaterThan(0);
      
      console.log('System remains functional after cleanup');
    }, STRESS_TEST_TIMEOUT);
  });
});
