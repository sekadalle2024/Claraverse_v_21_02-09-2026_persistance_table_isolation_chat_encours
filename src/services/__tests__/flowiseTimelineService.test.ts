/**
 * Tests for FlowiseTimelineService
 * 
 * Requirements: 10.2, 10.3, 10.5
 */

import { flowiseTimelineService } from '../flowiseTimelineService';
import { flowiseTableService } from '../flowiseTableService';
import type { TimelineItem, MessageTimelineItem, TableTimelineItem } from '../flowiseTimelineService';

// Mock flowiseTableService
jest.mock('../flowiseTableService');

describe('FlowiseTimelineService', () => {
  const mockSessionId = 'test-session-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSessionTimeline', () => {
    it('should create a unified timeline with messages and tables sorted chronologically', async () => {
      // Mock messages
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
          timestamp: new Date('2024-01-01T10:05:00Z')
        },
        {
          id: 'msg-3',
          role: 'user',
          content: 'Third message',
          timestamp: new Date('2024-01-01T10:15:00Z')
        }
      ];

      // Mock tables
      const mockTables = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'Keyword1',
          html: '<table>...</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:02:00Z',
          source: 'n8n' as const,
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
          timestamp: '2024-01-01T10:10:00Z',
          source: 'n8n' as const,
          messageId: 'msg-2',
          metadata: {
            rowCount: 3,
            colCount: 2,
            headers: ['X', 'Y'],
            compressed: false
          }
        }
      ];

      (flowiseTableService.restoreSessionTables as jest.Mock).mockResolvedValue(mockTables);

      // Get timeline
      const timeline = await flowiseTimelineService.getSessionTimeline(
        mockSessionId,
        messages
      );

      // Verify timeline structure
      expect(timeline).toHaveLength(5); // 3 messages + 2 tables
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

    it('should handle empty messages array', async () => {
      (flowiseTableService.restoreSessionTables as jest.Mock).mockResolvedValue([]);

      const timeline = await flowiseTimelineService.getSessionTimeline(
        mockSessionId,
        []
      );

      expect(timeline).toHaveLength(0);
    });

    it('should filter timeline by date range', async () => {
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
          timestamp: new Date('2024-01-02T10:00:00Z')
        },
        {
          id: 'msg-3',
          role: 'user',
          content: 'Message 3',
          timestamp: new Date('2024-01-03T10:00:00Z')
        }
      ];

      (flowiseTableService.restoreSessionTables as jest.Mock).mockResolvedValue([]);

      const timeline = await flowiseTimelineService.getSessionTimeline(
        mockSessionId,
        messages,
        {
          startDate: new Date('2024-01-02T00:00:00Z'),
          endDate: new Date('2024-01-02T23:59:59Z')
        }
      );

      expect(timeline).toHaveLength(1);
      expect(timeline[0].id).toBe('msg-2');
    });

    it('should filter timeline by message IDs', async () => {
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
          timestamp: new Date('2024-01-01T11:00:00Z')
        }
      ];

      const mockTables = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'Keyword1',
          html: '<table>...</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:30:00Z',
          source: 'n8n' as const,
          messageId: 'msg-1',
          metadata: {
            rowCount: 5,
            colCount: 3,
            headers: ['A', 'B', 'C'],
            compressed: false
          }
        }
      ];

      (flowiseTableService.restoreSessionTables as jest.Mock).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getSessionTimeline(
        mockSessionId,
        messages,
        {
          messageIds: ['msg-1']
        }
      );

      expect(timeline).toHaveLength(2); // msg-1 and table-1
      expect(timeline.some(item => item.id === 'msg-1')).toBe(true);
      expect(timeline.some(item => item.id === 'table-1')).toBe(true);
      expect(timeline.some(item => item.id === 'msg-2')).toBe(false);
    });
  });

  describe('getMessageTimeline', () => {
    it('should get timeline for a specific message and its tables', async () => {
      const messages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test message',
          timestamp: new Date('2024-01-01T10:00:00Z')
        }
      ];

      const mockTables = [
        {
          id: 'table-1',
          sessionId: mockSessionId,
          keyword: 'Keyword1',
          html: '<table>...</table>',
          fingerprint: 'fp1',
          containerId: 'container-1',
          position: 0,
          timestamp: '2024-01-01T10:01:00Z',
          source: 'n8n' as const,
          messageId: 'msg-1',
          metadata: {
            rowCount: 5,
            colCount: 3,
            headers: ['A', 'B', 'C'],
            compressed: false
          }
        }
      ];

      (flowiseTableService.getTablesByMessageId as jest.Mock).mockResolvedValue(mockTables);

      const timeline = await flowiseTimelineService.getMessageTimeline(
        'msg-1',
        mockSessionId,
        messages
      );

      expect(timeline).toHaveLength(2); // 1 message + 1 table
      expect(timeline[0].type).toBe('message');
      expect(timeline[0].id).toBe('msg-1');
      expect(timeline[1].type).toBe('table');
      expect(timeline[1].id).toBe('table-1');
    });

    it('should handle message with no linked tables', async () => {
      const messages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test message',
          timestamp: new Date('2024-01-01T10:00:00Z')
        }
      ];

      (flowiseTableService.getTablesByMessageId as jest.Mock).mockResolvedValue([]);

      const timeline = await flowiseTimelineService.getMessageTimeline(
        'msg-1',
        mockSessionId,
        messages
      );

      expect(timeline).toHaveLength(1); // Only the message
      expect(timeline[0].type).toBe('message');
      expect(timeline[0].id).toBe('msg-1');
    });
  });

  describe('getTimelineStats', () => {
    it('should calculate correct statistics for a timeline', () => {
      const timeline: TimelineItem[] = [
        {
          id: 'msg-1',
          type: 'message',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          sessionId: mockSessionId,
          role: 'user',
          content: 'Message 1',
          messageId: 'msg-1'
        } as MessageTimelineItem,
        {
          id: 'table-1',
          type: 'table',
          timestamp: new Date('2024-01-01T10:05:00Z'),
          sessionId: mockSessionId,
          tableId: 'table-1',
          keyword: 'Keyword1',
          html: '<table>...</table>',
          source: 'n8n',
          messageId: 'msg-1',
          containerId: 'container-1',
          position: 0
        } as TableTimelineItem,
        {
          id: 'table-2',
          type: 'table',
          timestamp: new Date('2024-01-01T10:10:00Z'),
          sessionId: mockSessionId,
          tableId: 'table-2',
          keyword: 'Keyword2',
          html: '<table>...</table>',
          source: 'n8n',
          containerId: 'container-1',
          position: 1
        } as TableTimelineItem
      ];

      const stats = flowiseTimelineService.getTimelineStats(timeline);

      expect(stats.totalItems).toBe(3);
      expect(stats.messageCount).toBe(1);
      expect(stats.tableCount).toBe(2);
      expect(stats.tablesLinkedToMessages).toBe(1);
      expect(stats.tablesWithoutMessages).toBe(1);
      expect(stats.startTime).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(stats.endTime).toEqual(new Date('2024-01-01T10:10:00Z'));
      expect(stats.duration).toBe(10 * 60 * 1000); // 10 minutes in milliseconds
    });

    it('should handle empty timeline', () => {
      const stats = flowiseTimelineService.getTimelineStats([]);

      expect(stats.totalItems).toBe(0);
      expect(stats.messageCount).toBe(0);
      expect(stats.tableCount).toBe(0);
      expect(stats.startTime).toBeNull();
      expect(stats.endTime).toBeNull();
      expect(stats.duration).toBe(0);
    });
  });

  describe('validateTimelineOrdering', () => {
    it('should validate correctly ordered timeline', () => {
      const timeline: TimelineItem[] = [
        {
          id: 'item-1',
          type: 'message',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          sessionId: mockSessionId
        } as TimelineItem,
        {
          id: 'item-2',
          type: 'table',
          timestamp: new Date('2024-01-01T10:05:00Z'),
          sessionId: mockSessionId
        } as TimelineItem,
        {
          id: 'item-3',
          type: 'message',
          timestamp: new Date('2024-01-01T10:10:00Z'),
          sessionId: mockSessionId
        } as TimelineItem
      ];

      const isValid = flowiseTimelineService.validateTimelineOrdering(timeline);
      expect(isValid).toBe(true);
    });

    it('should detect incorrectly ordered timeline', () => {
      const timeline: TimelineItem[] = [
        {
          id: 'item-1',
          type: 'message',
          timestamp: new Date('2024-01-01T10:10:00Z'),
          sessionId: mockSessionId
        } as TimelineItem,
        {
          id: 'item-2',
          type: 'table',
          timestamp: new Date('2024-01-01T10:05:00Z'),
          sessionId: mockSessionId
        } as TimelineItem
      ];

      const isValid = flowiseTimelineService.validateTimelineOrdering(timeline);
      expect(isValid).toBe(false);
    });

    it('should handle empty timeline', () => {
      const isValid = flowiseTimelineService.validateTimelineOrdering([]);
      expect(isValid).toBe(true);
    });

    it('should handle single item timeline', () => {
      const timeline: TimelineItem[] = [
        {
          id: 'item-1',
          type: 'message',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          sessionId: mockSessionId
        } as TimelineItem
      ];

      const isValid = flowiseTimelineService.validateTimelineOrdering(timeline);
      expect(isValid).toBe(true);
    });
  });

  describe('findClosestMessage', () => {
    it('should find the closest message to a table by timestamp', () => {
      const timeline: TimelineItem[] = [
        {
          id: 'msg-1',
          type: 'message',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          sessionId: mockSessionId,
          role: 'user',
          content: 'Message 1',
          messageId: 'msg-1'
        } as MessageTimelineItem,
        {
          id: 'msg-2',
          type: 'message',
          timestamp: new Date('2024-01-01T10:10:00Z'),
          sessionId: mockSessionId,
          role: 'user',
          content: 'Message 2',
          messageId: 'msg-2'
        } as MessageTimelineItem
      ];

      const tableItem: TableTimelineItem = {
        id: 'table-1',
        type: 'table',
        timestamp: new Date('2024-01-01T10:08:00Z'),
        sessionId: mockSessionId,
        tableId: 'table-1',
        keyword: 'Keyword1',
        html: '<table>...</table>',
        source: 'n8n',
        containerId: 'container-1',
        position: 0
      };

      const closestMessage = flowiseTimelineService.findClosestMessage(tableItem, timeline);

      expect(closestMessage).not.toBeNull();
      expect(closestMessage?.id).toBe('msg-2'); // msg-2 is 2 minutes away, msg-1 is 8 minutes away
    });

    it('should return null when no messages exist', () => {
      const timeline: TimelineItem[] = [];

      const tableItem: TableTimelineItem = {
        id: 'table-1',
        type: 'table',
        timestamp: new Date('2024-01-01T10:08:00Z'),
        sessionId: mockSessionId,
        tableId: 'table-1',
        keyword: 'Keyword1',
        html: '<table>...</table>',
        source: 'n8n',
        containerId: 'container-1',
        position: 0
      };

      const closestMessage = flowiseTimelineService.findClosestMessage(tableItem, timeline);

      expect(closestMessage).toBeNull();
    });
  });

  describe('groupTimelineByPeriod', () => {
    it('should group timeline items by day', () => {
      const timeline: TimelineItem[] = [
        {
          id: 'item-1',
          type: 'message',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          sessionId: mockSessionId
        } as TimelineItem,
        {
          id: 'item-2',
          type: 'table',
          timestamp: new Date('2024-01-01T15:00:00Z'),
          sessionId: mockSessionId
        } as TimelineItem,
        {
          id: 'item-3',
          type: 'message',
          timestamp: new Date('2024-01-02T10:00:00Z'),
          sessionId: mockSessionId
        } as TimelineItem
      ];

      const grouped = flowiseTimelineService.groupTimelineByPeriod(timeline, 'day');

      expect(grouped.size).toBe(2);
      expect(grouped.get('2024-01-01')).toHaveLength(2);
      expect(grouped.get('2024-01-02')).toHaveLength(1);
    });

    it('should group timeline items by hour', () => {
      const timeline: TimelineItem[] = [
        {
          id: 'item-1',
          type: 'message',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          sessionId: mockSessionId
        } as TimelineItem,
        {
          id: 'item-2',
          type: 'table',
          timestamp: new Date('2024-01-01T10:30:00Z'),
          sessionId: mockSessionId
        } as TimelineItem,
        {
          id: 'item-3',
          type: 'message',
          timestamp: new Date('2024-01-01T11:00:00Z'),
          sessionId: mockSessionId
        } as TimelineItem
      ];

      const grouped = flowiseTimelineService.groupTimelineByPeriod(timeline, 'hour');

      expect(grouped.size).toBe(2);
      expect(grouped.get('2024-01-01 10:00')).toHaveLength(2);
      expect(grouped.get('2024-01-01 11:00')).toHaveLength(1);
    });
  });

  describe('exportTimeline', () => {
    it('should export timeline to structured format', () => {
      const timeline: TimelineItem[] = [
        {
          id: 'msg-1',
          type: 'message',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          sessionId: mockSessionId,
          role: 'user',
          content: 'Test message',
          messageId: 'msg-1'
        } as MessageTimelineItem,
        {
          id: 'table-1',
          type: 'table',
          timestamp: new Date('2024-01-01T10:05:00Z'),
          sessionId: mockSessionId,
          tableId: 'table-1',
          keyword: 'Keyword1',
          html: '<table>...</table>',
          source: 'n8n',
          messageId: 'msg-1',
          containerId: 'container-1',
          position: 0
        } as TableTimelineItem
      ];

      const exported = flowiseTimelineService.exportTimeline(timeline);

      expect(exported.sessionId).toBe(mockSessionId);
      expect(exported.itemCount).toBe(2);
      expect(exported.items).toHaveLength(2);
      expect(exported.items[0].type).toBe('message');
      expect(exported.items[0].data.role).toBe('user');
      expect(exported.items[1].type).toBe('table');
      expect(exported.items[1].data.keyword).toBe('Keyword1');
    });

    it('should handle empty timeline', () => {
      const exported = flowiseTimelineService.exportTimeline([]);

      expect(exported.sessionId).toBe('');
      expect(exported.itemCount).toBe(0);
      expect(exported.items).toHaveLength(0);
    });
  });
});
