/**
 * FlowiseTimelineService
 * 
 * Service for managing chronological integration of messages and tables.
 * Provides unified timeline view that interleaves messages and tables chronologically.
 * 
 * Requirements: 10.2, 10.3, 10.5
 */

import { flowiseTableService } from './flowiseTableService';

/**
 * Timeline item types
 */
export type TimelineItemType = 'message' | 'table';

/**
 * Base timeline item interface
 */
export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  timestamp: Date;
  sessionId: string;
}

/**
 * Message timeline item
 */
export interface MessageTimelineItem extends TimelineItem {
  type: 'message';
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageId: string;
}

/**
 * Table timeline item
 */
export interface TableTimelineItem extends TimelineItem {
  type: 'table';
  tableId: string;
  keyword: string;
  html: string;
  source: 'n8n' | 'cached' | 'error';
  messageId?: string;
  containerId: string;
  position: number;
}

/**
 * Timeline ordering options
 */
export interface TimelineOrderingOptions {
  includeMessages?: boolean;
  includeTables?: boolean;
  startDate?: Date;
  endDate?: Date;
  messageIds?: string[];
}

export class FlowiseTimelineService {
  /**
   * Get a unified timeline of messages and tables for a session
   * Requirements: 10.2, 10.3
   * 
   * @param sessionId - The session ID to get timeline for
   * @param messages - Array of messages from the session
   * @param options - Timeline ordering options
   * @returns Sorted array of timeline items (messages and tables interleaved chronologically)
   */
  async getSessionTimeline(
    sessionId: string,
    messages: any[],
    options: TimelineOrderingOptions = {}
  ): Promise<TimelineItem[]> {
    const {
      includeMessages = true,
      includeTables = true,
      startDate,
      endDate,
      messageIds
    } = options;

    const timeline: TimelineItem[] = [];

    try {
      // Add messages to timeline
      if (includeMessages && messages && messages.length > 0) {
        for (const message of messages) {
          const messageTimestamp = this.parseTimestamp(message.timestamp || message.createdAt);
          
          // Apply date filters
          if (startDate && messageTimestamp < startDate) continue;
          if (endDate && messageTimestamp > endDate) continue;
          
          // Apply message ID filter
          if (messageIds && messageIds.length > 0 && !messageIds.includes(message.id)) continue;

          const messageItem: MessageTimelineItem = {
            id: message.id,
            type: 'message',
            timestamp: messageTimestamp,
            sessionId,
            role: message.role || 'user',
            content: message.content || '',
            messageId: message.id
          };

          timeline.push(messageItem);
        }
      }

      // Add tables to timeline
      if (includeTables) {
        const tables = await flowiseTableService.restoreSessionTables(sessionId);
        
        for (const table of tables) {
          const tableTimestamp = this.parseTimestamp(table.timestamp);
          
          // Apply date filters
          if (startDate && tableTimestamp < startDate) continue;
          if (endDate && tableTimestamp > endDate) continue;
          
          // Apply message ID filter (if table is linked to a message)
          if (messageIds && messageIds.length > 0 && table.messageId && !messageIds.includes(table.messageId)) continue;

          const tableItem: TableTimelineItem = {
            id: table.id,
            type: 'table',
            timestamp: tableTimestamp,
            sessionId,
            tableId: table.id,
            keyword: table.keyword,
            html: table.html,
            source: table.source,
            messageId: table.messageId,
            containerId: table.containerId,
            position: table.position
          };

          timeline.push(tableItem);
        }
      }

      // Sort timeline chronologically by timestamp
      // Requirements: 10.2, 10.5
      timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      console.log(`📅 Generated timeline for session ${sessionId}: ${timeline.length} items (${timeline.filter(i => i.type === 'message').length} messages, ${timeline.filter(i => i.type === 'table').length} tables)`);

      return timeline;

    } catch (error) {
      console.error('❌ Error generating session timeline:', error);
      return [];
    }
  }

  /**
   * Get timeline items for a specific message and its associated tables
   * Requirements: 10.3, 10.4
   * 
   * @param messageId - The message ID to get timeline for
   * @param sessionId - The session ID
   * @param messages - Array of messages from the session
   * @returns Timeline items for the message and its tables
   */
  async getMessageTimeline(
    messageId: string,
    sessionId: string,
    messages: any[]
  ): Promise<TimelineItem[]> {
    try {
      const timeline: TimelineItem[] = [];

      // Find the message
      const message = messages.find(m => m.id === messageId);
      if (message) {
        const messageTimestamp = this.parseTimestamp(message.timestamp || message.createdAt);
        
        const messageItem: MessageTimelineItem = {
          id: message.id,
          type: 'message',
          timestamp: messageTimestamp,
          sessionId,
          role: message.role || 'user',
          content: message.content || '',
          messageId: message.id
        };

        timeline.push(messageItem);
      }

      // Get tables linked to this message
      const tables = await flowiseTableService.getTablesByMessageId(messageId);
      
      for (const table of tables) {
        const tableTimestamp = this.parseTimestamp(table.timestamp);
        
        const tableItem: TableTimelineItem = {
          id: table.id,
          type: 'table',
          timestamp: tableTimestamp,
          sessionId,
          tableId: table.id,
          keyword: table.keyword,
          html: table.html,
          source: table.source,
          messageId: table.messageId,
          containerId: table.containerId,
          position: table.position
        };

        timeline.push(tableItem);
      }

      // Sort chronologically
      timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      console.log(`📅 Generated timeline for message ${messageId}: ${timeline.length} items`);

      return timeline;

    } catch (error) {
      console.error(`❌ Error generating timeline for message ${messageId}:`, error);
      return [];
    }
  }

  /**
   * Group timeline items by time periods (hour, day, week, etc.)
   * Requirements: 10.2
   * 
   * @param timeline - The timeline items to group
   * @param groupBy - The time period to group by
   * @returns Map of time period to timeline items
   */
  groupTimelineByPeriod(
    timeline: TimelineItem[],
    groupBy: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Map<string, TimelineItem[]> {
    const grouped = new Map<string, TimelineItem[]>();

    for (const item of timeline) {
      const periodKey = this.getPeriodKey(item.timestamp, groupBy);
      
      if (!grouped.has(periodKey)) {
        grouped.set(periodKey, []);
      }
      
      grouped.get(periodKey)!.push(item);
    }

    return grouped;
  }

  /**
   * Get statistics about a timeline
   * Requirements: 10.2
   * 
   * @param timeline - The timeline items to analyze
   * @returns Statistics about the timeline
   */
  getTimelineStats(timeline: TimelineItem[]): {
    totalItems: number;
    messageCount: number;
    tableCount: number;
    startTime: Date | null;
    endTime: Date | null;
    duration: number; // in milliseconds
    itemsByType: Map<TimelineItemType, number>;
    tablesLinkedToMessages: number;
    tablesWithoutMessages: number;
  } {
    const stats = {
      totalItems: timeline.length,
      messageCount: 0,
      tableCount: 0,
      startTime: null as Date | null,
      endTime: null as Date | null,
      duration: 0,
      itemsByType: new Map<TimelineItemType, number>(),
      tablesLinkedToMessages: 0,
      tablesWithoutMessages: 0
    };

    if (timeline.length === 0) {
      return stats;
    }

    // Count items by type
    for (const item of timeline) {
      const count = stats.itemsByType.get(item.type) || 0;
      stats.itemsByType.set(item.type, count + 1);

      if (item.type === 'message') {
        stats.messageCount++;
      } else if (item.type === 'table') {
        stats.tableCount++;
        
        const tableItem = item as TableTimelineItem;
        if (tableItem.messageId) {
          stats.tablesLinkedToMessages++;
        } else {
          stats.tablesWithoutMessages++;
        }
      }
    }

    // Get time range
    stats.startTime = timeline[0].timestamp;
    stats.endTime = timeline[timeline.length - 1].timestamp;
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    return stats;
  }

  /**
   * Find the closest message for a table (by timestamp)
   * Requirements: 10.4
   * 
   * This can be used to suggest message links for tables that don't have one
   * 
   * @param tableItem - The table timeline item
   * @param timeline - The full timeline
   * @returns The closest message timeline item, or null if none found
   */
  findClosestMessage(
    tableItem: TableTimelineItem,
    timeline: TimelineItem[]
  ): MessageTimelineItem | null {
    const messages = timeline.filter(item => item.type === 'message') as MessageTimelineItem[];
    
    if (messages.length === 0) {
      return null;
    }

    // Find the message with the smallest time difference
    let closestMessage: MessageTimelineItem | null = null;
    let smallestDiff = Infinity;

    for (const message of messages) {
      const diff = Math.abs(message.timestamp.getTime() - tableItem.timestamp.getTime());
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestMessage = message;
      }
    }

    return closestMessage;
  }

  /**
   * Validate timeline ordering
   * Requirements: 10.5
   * 
   * Checks if the timeline is properly sorted chronologically
   * 
   * @param timeline - The timeline to validate
   * @returns True if timeline is properly ordered
   */
  validateTimelineOrdering(timeline: TimelineItem[]): boolean {
    if (timeline.length <= 1) {
      return true;
    }

    for (let i = 1; i < timeline.length; i++) {
      const prevTime = timeline[i - 1].timestamp.getTime();
      const currTime = timeline[i].timestamp.getTime();
      
      if (currTime < prevTime) {
        console.error(`❌ Timeline ordering violation at index ${i}: ${new Date(prevTime).toISOString()} > ${new Date(currTime).toISOString()}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Export timeline to a structured format
   * Requirements: 10.2, 10.3
   * 
   * @param timeline - The timeline to export
   * @returns Structured timeline data
   */
  exportTimeline(timeline: TimelineItem[]): {
    sessionId: string;
    generatedAt: string;
    itemCount: number;
    items: Array<{
      id: string;
      type: TimelineItemType;
      timestamp: string;
      data: any;
    }>;
  } {
    if (timeline.length === 0) {
      return {
        sessionId: '',
        generatedAt: new Date().toISOString(),
        itemCount: 0,
        items: []
      };
    }

    return {
      sessionId: timeline[0].sessionId,
      generatedAt: new Date().toISOString(),
      itemCount: timeline.length,
      items: timeline.map(item => ({
        id: item.id,
        type: item.type,
        timestamp: item.timestamp.toISOString(),
        data: item.type === 'message' 
          ? {
              role: (item as MessageTimelineItem).role,
              content: (item as MessageTimelineItem).content
            }
          : {
              keyword: (item as TableTimelineItem).keyword,
              source: (item as TableTimelineItem).source,
              messageId: (item as TableTimelineItem).messageId
            }
      }))
    };
  }

  // ==================
  // HELPER METHODS
  // ==================

  /**
   * Parse a timestamp from various formats
   */
  private parseTimestamp(timestamp: string | Date | number): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    return new Date();
  }

  /**
   * Get a period key for grouping
   */
  private getPeriodKey(date: Date, groupBy: 'hour' | 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    switch (groupBy) {
      case 'hour':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:00`;
      
      case 'day':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      case 'week':
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
      
      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`;
      
      default:
        return date.toISOString();
    }
  }

  /**
   * Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

// Export singleton instance
export const flowiseTimelineService = new FlowiseTimelineService();
