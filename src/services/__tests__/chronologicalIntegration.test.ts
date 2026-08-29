/**
 * Chronological Integration Tests
 * 
 * Tests for chronological integration of messages and tables
 * Requirements: 10.2, 10.3, 10.4, 10.5
 * 
 * This test suite focuses on:
 * - MessageId linking between tables and messages
 * - Timeline ordering with mixed messages and tables
 * - Restoration order preservation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flowiseTableService } from '../flowiseTableService';
import { flowiseTimelineService } from '../flowiseTimelineService';
import { indexedDBService } from '../indexedDB';
import type { FlowiseGeneratedTableRecord } from '../../types/flowise_table_types';

// Mock indexedDB
vi.mock('../indexedDB');

describe('Chronological Integration Tests', () => {
  const mockSessionId = 'chronological-test-session';
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock IndexedDB methods
    vi.mocked(indexedDBService.getAllGeneratedTables).mockResolvedValue([]);
    vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue([]);
    vi.mocked(indexedDBService.putGeneratedTable).mockResolvedValue(undefined);
    vi.mocked(indexedDBService.deleteGeneratedTable).mockResolvedValue(undefined);
  });

  describe('MessageId Linking (Requirement 10.4)', () => {
    it('should link table to specific message via messageId', async () => {
      const messageId = 'msg-123';
      const mockTable = document.createElement('table');
      mockTable.innerHTML = `
        <thead><tr><th>Column A</th><th>Column B</th></tr></thead>
        <tbody><tr><td>Data 1</td><td>Data 2</td></tr></tbody>
      `;

      // Save table with messageId
      const tableId = await flowiseTableService.saveGeneratedTable(
        mockSessionId,
        mockTable,
        'TestKeyword',
        'n8n',
        messageId
      );

      // Verify the put call included messageId
      expect(indexedDBService.putGeneratedTable).toHaveBeenCalled();
      const putCall = vi.mocked(indexedDBService.putGeneratedTable).mock.calls[0];
      const savedTable = putCall[0] as FlowiseGeneratedTableRecord;

      expect(savedTable.messageId).toBe(messageId);
      expect(savedTable.sessionId).toBe(mockSessionId);
      expect(savedTable.keyword).toBe('TestKeyword');
    });

    it('should retrieve tables by messageId', async () => {
      const messageId = 'msg-456';
      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'Keyword1',
          html: '<table><tr><td>Data</td></tr></table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:00:00Z',
          source: 'n8n',
          messageId: messageId,
          metadata: {
            rowCount: 1,
            colCount: 1,
            headers: ['Column'],
            compressed: false
          }
        },
        {
          id: 'table-2',
          sessionId: mockSessionId,
          keyword: 'Keyword2',
          html: '<table><tr><td>Other</td></tr></table>',
          fingerprint: 'fp2',
          containerId: 'container-1',
          position: 1,
          timestamp: '2024-01-01T10:05:00Z',
          source: 'n8n',
          messageId: 'different-msg',
          metadata: {
            rowCount: 1,
            colCount: 1,
            headers: ['Column'],
            compressed: false
          }
        }
      ];

      vi.mocked(indexedDBService.getAllGeneratedTables).mockResolvedValue(mockTables);

      const tables = await flowiseTableService.getTablesByMessageId(messageId);

      expect(tables).toHaveLength(1);
      expect(tables[0].id).toBe('table-1');
      expect(tables[0].messageId).toBe(messageId);
    });

    it('should handle tables without messageId', async () => {
      const mockTable = document.createElement('table');
      mockTable.innerHTML = '<thead><tr><th>A</th></tr></thead>';

      // Save table without messageId
      await flowiseTableService.saveGeneratedTable(
        mockSessionId,
        mockTable,
        'NoMessageKeyword',
        'n8n'
        // No messageId parameter
      );

      const putCall = vi.mocked(indexedDBService.putGeneratedTable).mock.calls[0];
      const savedTable = putCall[0] as FlowiseGeneratedTableRecord;

      expect(savedTable.messageId).toBeUndefined();
    });
  });

  describe('Timeline Ordering with Mixed Messages and Tables (Requirements 10.2, 10.3)', () => {
    it('should create chronologically ordered timeline with interleaved messages and tables', async () => {
      // Create messages at different times
      const messages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'First message',
          timestamp: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Second message',
          timestamp: new Date('2024-01-01T10:10:00Z')
        },
        {
          id: 'msg-3',
          role: 'user',
          content: 'Third message',
          timestamp: new Date('2024-01-01T10:20:00Z')
        }
      ];

      // Create tables at times between messages
      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'Keyword1',
          html: '<table>...</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:05:00Z', // Between msg-1 and msg-2
          source: 'n8n',
          messageId: 'msg-1',
          metadata: {
            rowCount: 5,
            colCount: 3,
            headers: ['A', 'B', 'C'],
            compressed: false
          }
        },
        {
          id: 'table-2',
          sessionId: mockSessionId,
          keyword: 'Keyword2',
          html: '<table>...</table>',
          fingerprint: 'fp2',
          containerId: 'container-1',
          position: 1,
          timestamp: '2024-01-01T10:15:00Z', // Between msg-2 and msg-3
          source: 'n8n',
          messageId: 'msg-2',
          metadata: {
            rowCount: 3,
            colCount: 2,
            headers: ['X', 'Y'],
            compressed: false
          }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(
        mockSessionId,
        messages
      );

      // Verify correct interleaving: msg-1, table-1, msg-2, table-2, msg-3
      expect(timeline).toHaveLength(5);
      expect(timeline[0].type).toBe('message');
      expect(timeline[0].id).toBe('msg-1');
      expect(timeline[1].type).toBe('table');
      expect(timeline[1].id).toBe('table-1');
      expect(timeline[2].type).toBe('message');
      expect(timeline[2].id).toBe('msg-2');
      expect(timeline[3].type).toBe('table');
      expect(timeline[3].id).toBe('table-2');
      expect(timeline[4].type).toBe('message');
      expect(timeline[4].id).toBe('msg-3');

      // Verify chronological ordering
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          timeline[i - 1].timestamp.getTime()
        );
      }
    });

    it('should maintain correct order with multiple tables between messages', async () => {
      const messages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Message 1',
          timestamp: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'msg-2',
          role: 'user',
          content: 'Message 2',
          timestamp: new Date('2024-01-01T10:30:00Z')
        }
      ];

      // Three tables generated between the two messages
      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'K1',
          html: '<table>1</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:10:00Z',
          source: 'n8n',
          messageId: 'msg-1',
          metadata: { rowCount: 1, colCount: 1, headers: ['A'], compressed: false }
        },
        {
          id: 'table-2',
          sessionId: mockSessionId,
          keyword: 'K2',
          html: '<table>2</table>',
          fingerprint: 'fp2',
          containerId: 'container-1',
          position: 1,
          timestamp: '2024-01-01T10:15:00Z',
          source: 'n8n',
          messageId: 'msg-1',
          metadata: { rowCount: 1, colCount: 1, headers: ['B'], compressed: false }
        },
        {
          id: 'table-3',
          sessionId: mockSessionId,
          keyword: 'K3',
          html: '<table>3</table>',
          fingerprint: 'fp3',
          containerId: 'container-1',
          position: 2,
          timestamp: '2024-01-01T10:20:00Z',
          source: 'n8n',
          messageId: 'msg-1',
          metadata: { rowCount: 1, colCount: 1, headers: ['C'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(
        mockSessionId,
        messages
      );

      // Expected order: msg-1, table-1, table-2, table-3, msg-2
      expect(timeline).toHaveLength(5);
      expect(timeline.map(item => item.id)).toEqual([
        'msg-1',
        'table-1',
        'table-2',
        'table-3',
        'msg-2'
      ]);

      // Verify all tables are linked to msg-1
      const tables = timeline.filter(item => item.type === 'table');
      tables.forEach(table => {
        expect((table as any).messageId).toBe('msg-1');
      });
    });

    it('should validate timeline ordering is correct', async () => {
      const messages = [
        { id: 'msg-1', role: 'user', content: 'M1', timestamp: new Date('2024-01-01T10:00:00Z') },
        { id: 'msg-2', role: 'user', content: 'M2', timestamp: new Date('2024-01-01T10:20:00Z') }
      ];

      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'K1',
          html: '<table>1</table>',
          fingerprint: 'fp1',
          containerId: 'c1',
          position: 0,
          timestamp: '2024-01-01T10:10:00Z',
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['A'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(mockSessionId, messages);

      // Validate ordering
      const isValid = flowiseTimelineService.validateTimelineOrdering(timeline);
      expect(isValid).toBe(true);
    });
  });

  describe('Restoration Order Preservation (Requirements 10.2, 10.5)', () => {
    it('should preserve creation order when restoring tables', async () => {
      // Create tables with specific timestamps
      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-3',
          sessionId: mockSessionId,
          keyword: 'Third',
          html: '<table>3</table>',
          fingerprint: 'fp3',
          containerId: 'container-1',
          position: 2,
          timestamp: '2024-01-01T10:20:00Z', // Created third
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['C'], compressed: false }
        },
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'First',
          html: '<table>1</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:00:00Z', // Created first
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['A'], compressed: false }
        },
        {
          id: 'table-2',
          sessionId: mockSessionId,
          keyword: 'Second',
          html: '<table>2</table>',
          fingerprint: 'fp2',
          containerId: 'container-1',
          position: 1,
          timestamp: '2024-01-01T10:10:00Z', // Created second
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['B'], compressed: false }
        }
      ];

      // Mock returns tables in random order
      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      // Restore tables
      const restoredTables = await flowiseTableService.restoreSessionTables(mockSessionId);

      // Verify tables are sorted by timestamp (creation order)
      expect(restoredTables).toHaveLength(3);
      expect(restoredTables[0].id).toBe('table-1'); // First created
      expect(restoredTables[1].id).toBe('table-2'); // Second created
      expect(restoredTables[2].id).toBe('table-3'); // Third created

      // Verify timestamps are in ascending order
      for (let i = 1; i < restoredTables.length; i++) {
        const prevTime = new Date(restoredTables[i - 1].timestamp).getTime();
        const currTime = new Date(restoredTables[i].timestamp).getTime();
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });

    it('should preserve position order within same container', async () => {
      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'K1',
          html: '<table>1</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0, // First in container
          timestamp: '2024-01-01T10:00:00Z',
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['A'], compressed: false }
        },
        {
          id: 'table-2',
          sessionId: mockSessionId,
          keyword: 'K2',
          html: '<table>2</table>',
          fingerprint: 'fp2',
          containerId: 'container-1',
          position: 1, // Second in container
          timestamp: '2024-01-01T10:01:00Z',
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['B'], compressed: false }
        },
        {
          id: 'table-3',
          sessionId: mockSessionId,
          keyword: 'K3',
          html: '<table>3</table>',
          fingerprint: 'fp3',
          containerId: 'container-1',
          position: 2, // Third in container
          timestamp: '2024-01-01T10:02:00Z',
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['C'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const restoredTables = await flowiseTableService.restoreSessionTables(mockSessionId);

      // Verify position order is preserved
      expect(restoredTables[0].position).toBe(0);
      expect(restoredTables[1].position).toBe(1);
      expect(restoredTables[2].position).toBe(2);
    });

    it('should maintain order across multiple containers', async () => {
      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-c1-1',
          sessionId: mockSessionId,
          keyword: 'K1',
          html: '<table>C1-1</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:00:00Z',
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['A'], compressed: false }
        },
        {
          id: 'table-c2-1',
          sessionId: mockSessionId,
          keyword: 'K2',
          html: '<table>C2-1</table>',
          fingerprint: 'fp2',
          containerId: 'container-2',
          position: 0,
          timestamp: '2024-01-01T10:05:00Z',
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['B'], compressed: false }
        },
        {
          id: 'table-c1-2',
          sessionId: mockSessionId,
          keyword: 'K3',
          html: '<table>C1-2</table>',
          fingerprint: 'fp3',
          containerId: 'container-1',
          position: 1,
          timestamp: '2024-01-01T10:10:00Z',
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['C'], compressed: false }
        },
        {
          id: 'table-c2-2',
          sessionId: mockSessionId,
          keyword: 'K4',
          html: '<table>C2-2</table>',
          fingerprint: 'fp4',
          containerId: 'container-2',
          position: 1,
          timestamp: '2024-01-01T10:15:00Z',
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['D'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const restoredTables = await flowiseTableService.restoreSessionTables(mockSessionId);

      // Verify chronological order is maintained across containers
      expect(restoredTables.map(t => t.id)).toEqual([
        'table-c1-1',
        'table-c2-1',
        'table-c1-2',
        'table-c2-2'
      ]);

      // Verify container grouping
      const container1Tables = restoredTables.filter(t => t.containerId === 'container-1');
      const container2Tables = restoredTables.filter(t => t.containerId === 'container-2');

      expect(container1Tables).toHaveLength(2);
      expect(container2Tables).toHaveLength(2);

      // Verify position order within each container
      expect(container1Tables[0].position).toBe(0);
      expect(container1Tables[1].position).toBe(1);
      expect(container2Tables[0].position).toBe(0);
      expect(container2Tables[1].position).toBe(1);
    });

    it('should preserve order when tables have same timestamp', async () => {
      const sameTimestamp = '2024-01-01T10:00:00Z';
      
      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'K1',
          html: '<table>1</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: sameTimestamp,
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['A'], compressed: false }
        },
        {
          id: 'table-2',
          sessionId: mockSessionId,
          keyword: 'K2',
          html: '<table>2</table>',
          fingerprint: 'fp2',
          containerId: 'container-1',
          position: 1,
          timestamp: sameTimestamp,
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['B'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const restoredTables = await flowiseTableService.restoreSessionTables(mockSessionId);

      // When timestamps are equal, position should determine order
      expect(restoredTables[0].position).toBeLessThan(restoredTables[1].position);
    });
  });

  describe('Complex Timeline Scenarios (Requirements 10.2, 10.3, 10.4, 10.5)', () => {
    it('should handle complete conversation flow with messages and tables', async () => {
      // Simulate a real conversation flow
      const messages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Show me sales data',
          timestamp: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Here is the sales data',
          timestamp: new Date('2024-01-01T10:00:30Z')
        },
        {
          id: 'msg-3',
          role: 'user',
          content: 'Now show inventory',
          timestamp: new Date('2024-01-01T10:05:00Z')
        },
        {
          id: 'msg-4',
          role: 'assistant',
          content: 'Here is the inventory',
          timestamp: new Date('2024-01-01T10:05:30Z')
        }
      ];

      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'sales-table',
          sessionId: mockSessionId,
          keyword: 'SalesData',
          html: '<table><tr><td>Sales</td></tr></table>',
          fingerprint: 'fp-sales',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:01:00Z', // After msg-2
          source: 'n8n',
          messageId: 'msg-2',
          metadata: { rowCount: 10, colCount: 5, headers: ['Product', 'Sales', 'Revenue', 'Date', 'Region'], compressed: false }
        },
        {
          id: 'inventory-table',
          sessionId: mockSessionId,
          keyword: 'InventoryData',
          html: '<table><tr><td>Inventory</td></tr></table>',
          fingerprint: 'fp-inventory',
          containerId: 'container-2',
          position: 0,
          timestamp: '2024-01-01T10:06:00Z', // After msg-4
          source: 'n8n',
          messageId: 'msg-4',
          metadata: { rowCount: 15, colCount: 4, headers: ['Item', 'Quantity', 'Location', 'Status'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(mockSessionId, messages);

      // Expected order: msg-1, msg-2, sales-table, msg-3, msg-4, inventory-table
      expect(timeline).toHaveLength(6);
      expect(timeline.map(item => item.id)).toEqual([
        'msg-1',
        'msg-2',
        'sales-table',
        'msg-3',
        'msg-4',
        'inventory-table'
      ]);

      // Verify messageId links
      const salesTable = timeline.find(item => item.id === 'sales-table');
      const inventoryTable = timeline.find(item => item.id === 'inventory-table');
      
      expect((salesTable as any).messageId).toBe('msg-2');
      expect((inventoryTable as any).messageId).toBe('msg-4');

      // Verify timeline is valid
      const isValid = flowiseTimelineService.validateTimelineOrdering(timeline);
      expect(isValid).toBe(true);
    });

    it('should handle tables without messageId in timeline', async () => {
      const messages = [
        { id: 'msg-1', role: 'user', content: 'Message 1', timestamp: new Date('2024-01-01T10:00:00Z') }
      ];

      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'orphan-table',
          sessionId: mockSessionId,
          keyword: 'OrphanData',
          html: '<table><tr><td>Orphan</td></tr></table>',
          fingerprint: 'fp-orphan',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:02:00Z',
          source: 'n8n',
          // No messageId
          metadata: { rowCount: 1, colCount: 1, headers: ['Data'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(mockSessionId, messages);

      expect(timeline).toHaveLength(2);
      
      const orphanTable = timeline.find(item => item.id === 'orphan-table');
      expect((orphanTable as any).messageId).toBeUndefined();

      // Should still be in correct chronological position
      expect(timeline[0].id).toBe('msg-1');
      expect(timeline[1].id).toBe('orphan-table');
    });

    it('should find closest message for unlinked table', async () => {
      const messages = [
        { id: 'msg-1', role: 'user', content: 'M1', timestamp: new Date('2024-01-01T10:00:00Z') },
        { id: 'msg-2', role: 'user', content: 'M2', timestamp: new Date('2024-01-01T10:10:00Z') },
        { id: 'msg-3', role: 'user', content: 'M3', timestamp: new Date('2024-01-01T10:20:00Z') }
      ];

      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'unlinked-table',
          sessionId: mockSessionId,
          keyword: 'UnlinkedData',
          html: '<table><tr><td>Data</td></tr></table>',
          fingerprint: 'fp-unlinked',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:12:00Z', // Closest to msg-2 (2 min away)
          source: 'n8n',
          metadata: { rowCount: 1, colCount: 1, headers: ['Data'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(mockSessionId, messages);
      
      const tableItem = timeline.find(item => item.id === 'unlinked-table');
      const closestMessage = flowiseTimelineService.findClosestMessage(tableItem as any, timeline);

      expect(closestMessage).not.toBeNull();
      expect(closestMessage?.id).toBe('msg-2'); // msg-2 is closest (2 min vs 8 min to msg-3)
    });

    it('should handle error tables in timeline', async () => {
      const messages = [
        { id: 'msg-1', role: 'user', content: 'Request data', timestamp: new Date('2024-01-01T10:00:00Z') }
      ];

      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'error-table',
          sessionId: mockSessionId,
          keyword: 'ErrorData',
          html: '<div class="error">Error: Connection failed</div>',
          fingerprint: 'fp-error',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:01:00Z',
          source: 'error',
          messageId: 'msg-1',
          metadata: { rowCount: 0, colCount: 0, headers: [], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(mockSessionId, messages);

      expect(timeline).toHaveLength(2);
      
      const errorTable = timeline.find(item => item.id === 'error-table');
      expect((errorTable as any).source).toBe('error');
      expect((errorTable as any).messageId).toBe('msg-1');
    });

    it('should handle cached tables in timeline', async () => {
      const messages = [
        { id: 'msg-1', role: 'user', content: 'Get cached data', timestamp: new Date('2024-01-01T10:00:00Z') }
      ];

      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'cached-table',
          sessionId: mockSessionId,
          keyword: 'CachedData',
          html: '<table><tr><td>Cached</td></tr></table>',
          fingerprint: 'fp-cached',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:01:00Z',
          source: 'cached',
          messageId: 'msg-1',
          metadata: { rowCount: 5, colCount: 3, headers: ['A', 'B', 'C'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(mockSessionId, messages);

      const cachedTable = timeline.find(item => item.id === 'cached-table');
      expect((cachedTable as any).source).toBe('cached');
    });
  });

  describe('Timeline Statistics and Analysis (Requirement 10.2)', () => {
    it('should calculate correct statistics for complex timeline', async () => {
      const messages = [
        { id: 'msg-1', role: 'user', content: 'M1', timestamp: new Date('2024-01-01T10:00:00Z') },
        { id: 'msg-2', role: 'assistant', content: 'M2', timestamp: new Date('2024-01-01T10:05:00Z') }
      ];

      const mockTables: FlowiseGeneratedTableRecord[] = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'K1',
          html: '<table>1</table>',
          fingerprint: 'fp1',
          containerId: 'c1',
          position: 0,
          timestamp: '2024-01-01T10:02:00Z',
          source: 'n8n',
          messageId: 'msg-1',
          metadata: { rowCount: 1, colCount: 1, headers: ['A'], compressed: false }
        },
        {
          id: 'table-2',
          sessionId: mockSessionId,
          keyword: 'K2',
          html: '<table>2</table>',
          fingerprint: 'fp2',
          containerId: 'c1',
          position: 1,
          timestamp: '2024-01-01T10:07:00Z',
          source: 'n8n',
          // No messageId
          metadata: { rowCount: 1, colCount: 1, headers: ['B'], compressed: false }
        }
      ];

      vi.mocked(indexedDBService.getGeneratedTablesBySession).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(mockSessionId, messages);
      const stats = flowiseTimelineService.getTimelineStats(timeline);

      expect(stats.totalItems).toBe(4);
      expect(stats.messageCount).toBe(2);
      expect(stats.tableCount).toBe(2);
      expect(stats.tablesLinkedToMessages).toBe(1);
      expect(stats.tablesWithoutMessages).toBe(1);
      expect(stats.duration).toBe(7 * 60 * 1000); // 7 minutes
    });
  });
});
