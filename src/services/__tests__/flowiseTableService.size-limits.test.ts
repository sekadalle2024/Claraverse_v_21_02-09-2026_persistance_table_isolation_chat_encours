/**
 * Tests for FlowiseTableService - Size Limits (Task 8.3)
 * 
 * Tests the enforcement of storage limits:
 * - Maximum 500 tables per user
 * - Maximum 50MB total storage per user
 * - Automatic cleanup when limits are approached
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowiseTableService } from '../flowiseTableService';
import { indexedDBService } from '../indexedDB';

describe('FlowiseTableService - Size Limits (Task 8.3)', () => {
  let service: FlowiseTableService;

  beforeEach(() => {
    service = new FlowiseTableService();
    // Note: We don't clear the database in beforeEach to avoid timeouts
    // Tests use mocking instead of actual database operations
  });

  // Helper function to create a mock table element
  function createMockTable(data: { rows?: number; cols?: number; size?: number } = {}): HTMLTableElement {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    const rows = data.rows || 3;
    const cols = data.cols || 3;
    
    // Create header
    const headerRow = document.createElement('tr');
    for (let i = 0; i < cols; i++) {
      const th = document.createElement('th');
      th.textContent = `Header ${i}`;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    
    // Create body rows
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < cols; j++) {
        const td = document.createElement('td');
        // If size is specified, add padding to reach that size
        if (data.size) {
          const paddingSize = Math.floor(data.size / (rows * cols));
          td.textContent = `Cell ${i}-${j} ${'x'.repeat(paddingSize)}`;
        } else {
          td.textContent = `Cell ${i}-${j}`;
        }
        row.appendChild(td);
      }
      tbody.appendChild(row);
    }
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    return table;
  }

  describe('checkStorageLimits', () => {
    it('should return limit status information', async () => {
      const limits = await service.checkStorageLimits();

      expect(limits).toHaveProperty('tableCount');
      expect(limits).toHaveProperty('storageSize');
      expect(limits).toHaveProperty('quota');
      expect(limits).toHaveProperty('needsCleanup');

      expect(limits.tableCount).toHaveProperty('current');
      expect(limits.tableCount).toHaveProperty('max');
      expect(limits.tableCount).toHaveProperty('percentage');
      expect(limits.tableCount).toHaveProperty('approaching');

      expect(limits.storageSize).toHaveProperty('current');
      expect(limits.storageSize).toHaveProperty('max');
      expect(limits.storageSize).toHaveProperty('percentage');
      expect(limits.storageSize).toHaveProperty('approaching');
    });

    it('should show no cleanup needed when limits are not approached', async () => {
      // Mock stats showing low usage
      const mockStats = {
        totalTables: 10,
        totalSize: 1024 * 1024, // 1MB
        averageSize: 100 * 1024,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([['session', 10]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);

      const limits = await service.checkStorageLimits();

      expect(limits.tableCount.approaching).toBe(false);
      expect(limits.storageSize.approaching).toBe(false);
      expect(limits.needsCleanup).toBe(false);
    });

    it('should detect when table count limit is approached', async () => {
      const sessionId = 'test-session-2';
      
      // Save 460 tables (92% of 500 limit)
      // Note: This is a simplified test - in reality we'd mock the stats
      const mockStats = {
        totalTables: 460,
        totalSize: 1024 * 1024, // 1MB
        averageSize: 2048,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([[sessionId, 460]])
      };

      // Mock getTableStorageStats
      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);

      const limits = await service.checkStorageLimits();

      expect(limits.tableCount.current).toBe(460);
      expect(limits.tableCount.max).toBe(500);
      expect(limits.tableCount.percentage).toBeGreaterThan(90);
      expect(limits.tableCount.approaching).toBe(true);
      expect(limits.needsCleanup).toBe(true);
    });

    it('should detect when storage size limit is approached', async () => {
      const sessionId = 'test-session-3';
      
      // Mock 46MB of storage (92% of 50MB limit)
      const mockStats = {
        totalTables: 100,
        totalSize: 46 * 1024 * 1024, // 46MB
        averageSize: 460 * 1024,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([[sessionId, 100]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);

      const limits = await service.checkStorageLimits();

      expect(limits.storageSize.current).toBe(46 * 1024 * 1024);
      expect(limits.storageSize.max).toBe(50 * 1024 * 1024);
      expect(limits.storageSize.percentage).toBeGreaterThan(90);
      expect(limits.storageSize.approaching).toBe(true);
      expect(limits.needsCleanup).toBe(true);
    });
  });

  describe('enforceStorageLimits', () => {
    it('should not trigger cleanup when limits are not approached', async () => {
      const sessionId = 'test-session-4';
      
      // Mock stats showing low usage
      const mockStats = {
        totalTables: 10,
        totalSize: 1024 * 1024, // 1MB
        averageSize: 100 * 1024,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([[sessionId, 10]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const cleanupSpy = vi.spyOn(service, 'performAutomaticCleanup');

      const result = await service.enforceStorageLimits(sessionId);

      expect(result).toBe(true);
      expect(cleanupSpy).not.toHaveBeenCalled();
    });

    it('should trigger cleanup when table count limit is approached', async () => {
      const sessionId = 'test-session-5';
      
      // Mock stats showing 460 tables (92% of limit)
      const mockStats = {
        totalTables: 460,
        totalSize: 1024 * 1024,
        averageSize: 2048,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([[sessionId, 460]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const cleanupSpy = vi.spyOn(service, 'performAutomaticCleanup').mockResolvedValue(92);

      const result = await service.enforceStorageLimits(sessionId);

      expect(result).toBe(true);
      expect(cleanupSpy).toHaveBeenCalledWith(sessionId);
    });

    it('should trigger cleanup when storage size limit is approached', async () => {
      const sessionId = 'test-session-6';
      
      // Mock stats showing 46MB (92% of 50MB limit)
      const mockStats = {
        totalTables: 100,
        totalSize: 46 * 1024 * 1024,
        averageSize: 460 * 1024,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([[sessionId, 100]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const cleanupSpy = vi.spyOn(service, 'performAutomaticCleanup').mockResolvedValue(20);

      const result = await service.enforceStorageLimits(sessionId);

      expect(result).toBe(true);
      expect(cleanupSpy).toHaveBeenCalledWith(sessionId);
    });

    it('should preserve active session during cleanup', async () => {
      const activeSessionId = 'active-session';
      
      // Mock stats to trigger cleanup
      const mockStats = {
        totalTables: 460,
        totalSize: 1024 * 1024,
        averageSize: 2048,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([
          [activeSessionId, 230],
          ['old-session', 230]
        ])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const cleanupSpy = vi.spyOn(service, 'performAutomaticCleanup').mockResolvedValue(92);

      // Enforce limits with active session
      await service.enforceStorageLimits(activeSessionId);

      // Verify cleanup was called with active session ID to preserve it
      expect(cleanupSpy).toHaveBeenCalledWith(activeSessionId);
    });
  });

  describe('Integration with saveGeneratedTable', () => {
    it('should automatically enforce limits when saving tables', async () => {
      const sessionId = 'test-session-7';
      
      // Mock stats to trigger cleanup
      const mockStats = {
        totalTables: 460,
        totalSize: 1024 * 1024,
        averageSize: 2048,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([[sessionId, 460]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const enforceSpy = vi.spyOn(service, 'enforceStorageLimits');

      const table = createMockTable();
      await service.saveGeneratedTable(sessionId, table, 'TestKeyword', 'n8n');

      // Verify enforceStorageLimits was called
      expect(enforceSpy).toHaveBeenCalledWith(sessionId);
    });

    it('should successfully save table after cleanup', async () => {
      const sessionId = 'test-session-8';
      
      // Mock stats to trigger cleanup
      const mockStats = {
        totalTables: 460,
        totalSize: 1024 * 1024,
        averageSize: 2048,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([[sessionId, 460]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const enforceSpy = vi.spyOn(service, 'enforceStorageLimits');
      const cleanupSpy = vi.spyOn(service, 'performAutomaticCleanup').mockResolvedValue(92);

      // Save new table (should trigger cleanup via enforceStorageLimits)
      const newTable = createMockTable();
      const tableId = await service.saveGeneratedTable(sessionId, newTable, 'NewKeyword', 'n8n');

      // Verify enforceStorageLimits was called
      expect(enforceSpy).toHaveBeenCalledWith(sessionId);
      // Verify cleanup was triggered
      expect(cleanupSpy).toHaveBeenCalled();
      // Verify table was saved
      expect(tableId).toBeTruthy();
      expect(tableId.length).toBeGreaterThan(0);
    });
  });

  describe('Limit thresholds', () => {
    it('should use 90% threshold for table count (450 tables)', async () => {
      const mockStats = {
        totalTables: 450, // Exactly 90%
        totalSize: 1024 * 1024,
        averageSize: 2048,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([['session', 450]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const cleanupSpy = vi.spyOn(service, 'performAutomaticCleanup').mockResolvedValue(90);

      await service.enforceStorageLimits('session');

      expect(cleanupSpy).toHaveBeenCalled();
    });

    it('should use 90% threshold for storage size (45MB)', async () => {
      const mockStats = {
        totalTables: 100,
        totalSize: 45 * 1024 * 1024, // Exactly 90% of 50MB
        averageSize: 460 * 1024,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([['session', 100]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const cleanupSpy = vi.spyOn(service, 'performAutomaticCleanup').mockResolvedValue(20);

      await service.enforceStorageLimits('session');

      expect(cleanupSpy).toHaveBeenCalled();
    });

    it('should not trigger cleanup below 90% threshold', async () => {
      const mockStats = {
        totalTables: 449, // Just below 90%
        totalSize: 44 * 1024 * 1024, // Just below 90%
        averageSize: 100 * 1024,
        compressedTables: 0,
        cachedTables: 0,
        errorTables: 0,
        tablesBySession: new Map([['session', 449]])
      };

      vi.spyOn(service, 'getTableStorageStats').mockResolvedValue(mockStats);
      const cleanupSpy = vi.spyOn(service, 'performAutomaticCleanup');

      await service.enforceStorageLimits('session');

      expect(cleanupSpy).not.toHaveBeenCalled();
    });
  });
});
