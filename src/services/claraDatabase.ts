import { indexedDBService } from './indexedDB';
import { 
  ClaraChatSession, 
  ClaraMessage, 
  ClaraFileAttachment
} from '../types/clara_assistant_types';
import { db } from '../db/index';

export interface ClaraChatSessionRecord extends Omit<ClaraChatSession, 'createdAt' | 'updatedAt'> {
  createdAt: string; // Store as ISO string for IndexedDB
  updatedAt: string;
  user_id?: string; // Add user_id for data isolation
}

export interface ClaraMessageRecord extends Omit<ClaraMessage, 'timestamp'> {
  sessionId: string; // Reference to the session
  timestamp: string; // Store as ISO string for IndexedDB
  user_id?: string; // Add user_id for data isolation
}

export interface ClaraFileRecord {
  id: string;
  sessionId: string;
  messageId: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  content: string; // Base64 for small files or blob URL for large files
  thumbnail?: string; // Base64 thumbnail for images
  processed: boolean;
  createdAt: string;
  user_id?: string; // Add user_id for data isolation
}

/**
 * Database service specifically for Clara chat sessions
 * Handles persistence of chat sessions, messages, and file attachments
 */
export class ClaraDatabaseService {
  private readonly SESSIONS_STORE = 'clara_sessions';
  private readonly MESSAGES_STORE = 'clara_messages';
  private readonly FILES_STORE = 'clara_files';
  
  /**
   * Get current user ID for data isolation
   */
  private async getCurrentUserId(): Promise<string | null> {
    return await db.getCurrentUser();
  }

  /**
   * Save a chat session to the database
   */
  async saveSession(session: ClaraChatSession): Promise<void> {
    // Get current user ID for data isolation
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('No user logged in');
    }
    
    const sessionRecord: ClaraChatSessionRecord = {
      ...session,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messages: [], // Don't store messages in the session record, they're separate
      user_id: currentUserId
    };
    
    console.log('💾 Saving Clara session with user_id:', currentUserId, 'session_id:', session.id);

    await indexedDBService.put(this.SESSIONS_STORE, sessionRecord);

    // Save all messages for this session
    for (const message of session.messages) {
      await this.saveMessage(session.id, message);
    }
  }

  /**
   * Save a message to the database
   */
  async saveMessage(sessionId: string, message: ClaraMessage): Promise<void> {
    // Get current user ID for data isolation
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('No user logged in');
    }
    
    const messageRecord: ClaraMessageRecord = {
      ...message,
      sessionId,
      timestamp: message.timestamp.toISOString(),
      user_id: currentUserId
    };
    
    console.log('💾 Saving Clara message with user_id:', currentUserId, 'session_id:', sessionId, 'message_id:', message.id);

    await indexedDBService.put(this.MESSAGES_STORE, messageRecord);

    // Save file attachments if any
    if (message.attachments) {
      for (const attachment of message.attachments) {
        await this.saveFile(sessionId, message.id, attachment);
      }
    }
  }

  /**
   * Save a file attachment to the database
   */
  async saveFile(sessionId: string, messageId: string, file: ClaraFileAttachment): Promise<void> {
    // Get current user ID for data isolation
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('No user logged in');
    }
    
    const fileRecord: ClaraFileRecord = {
      id: file.id,
      sessionId,
      messageId,
      name: file.name,
      type: file.type,
      size: file.size,
      mimeType: file.mimeType,
      content: file.base64 || file.url || '',
      thumbnail: file.thumbnail,
      processed: file.processed || false,
      createdAt: new Date().toISOString(),
      user_id: currentUserId
    };

    await indexedDBService.put(this.FILES_STORE, fileRecord);
  }

  /**
   * Get all chat sessions, ordered by most recent first
   */
  async getAllSessions(includeMessages: boolean = false): Promise<ClaraChatSession[]> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return [];
    }
    
    const sessionRecords = await indexedDBService.getAll<ClaraChatSessionRecord>(this.SESSIONS_STORE);
    
    console.log('🔍 Loading Clara sessions for user:', currentUserId, 'total records:', sessionRecords.length);
    console.log('📊 Session records user_id distribution:', sessionRecords.reduce((acc, record) => {
      const userId = record.user_id || 'no_user_id';
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    // Convert back to ClaraChatSession objects and sort by updatedAt
    // Support both new data with user_id and legacy data without user_id
    const sessions = sessionRecords
      .filter(record => record.user_id === currentUserId || !record.user_id)
      .map(this.recordToSession)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
    console.log('✅ Filtered Clara sessions for user:', currentUserId, 'found:', sessions.length);

    // Load messages if requested
    if (includeMessages) {
      for (const session of sessions) {
        session.messages = await this.getSessionMessages(session.id);
      }
    }

    return sessions;
  }

  /**
   * Get a specific session by ID with all its messages
   */
  async getSession(sessionId: string): Promise<ClaraChatSession | null> {
    const sessionRecord = await indexedDBService.get<ClaraChatSessionRecord>(this.SESSIONS_STORE, sessionId);
    if (!sessionRecord) return null;

    const session = this.recordToSession(sessionRecord);
    
    // Load all messages for this session
    const messages = await this.getSessionMessages(sessionId);
    session.messages = messages;

    return session;
  }

  /**
   * Get all messages for a session
   */
  async getSessionMessages(sessionId: string): Promise<ClaraMessage[]> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return [];
    }
    
    const allMessages = await indexedDBService.getAll<ClaraMessageRecord>(this.MESSAGES_STORE);
    const sessionMessages = allMessages
      .filter(msg => msg.sessionId === sessionId && (msg.user_id === currentUserId || !msg.user_id))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Convert to ClaraMessage objects and load attachments
    const messages: ClaraMessage[] = [];
    for (const messageRecord of sessionMessages) {
      const message = await this.recordToMessage(messageRecord);
      messages.push(message);
    }

    return messages;
  }

  /**
   * Get files for a specific message
   */
  async getMessageFiles(messageId: string): Promise<ClaraFileAttachment[]> {
    const allFiles = await indexedDBService.getAll<ClaraFileRecord>(this.FILES_STORE);
    const messageFiles = allFiles.filter(file => file.messageId === messageId);

    return messageFiles.map(this.recordToFileAttachment);
  }

  /**
   * Update session metadata (title, starred, archived, etc.)
   */
  async updateSession(sessionId: string, updates: Partial<ClaraChatSession>): Promise<void> {
    const existingRecord = await indexedDBService.get<ClaraChatSessionRecord>(this.SESSIONS_STORE, sessionId);
    if (!existingRecord) throw new Error(`Session ${sessionId} not found`);

    const updatedRecord: ClaraChatSessionRecord = {
      ...existingRecord,
      ...updates,
      updatedAt: new Date().toISOString(),
      // Ensure dates are strings
      createdAt: updates.createdAt ? updates.createdAt.toISOString() : existingRecord.createdAt,
    };

    await indexedDBService.put(this.SESSIONS_STORE, updatedRecord);
  }

  /**
   * Delete a session and all its messages and files
   * Also cascades to delete all generated tables for this session
   * Requirements: 9.4
   */
  async deleteSession(sessionId: string): Promise<void> {
    // Delete all messages for this session
    const messages = await indexedDBService.getAll<ClaraMessageRecord>(this.MESSAGES_STORE);
    for (const message of messages.filter(m => m.sessionId === sessionId)) {
      await indexedDBService.delete(this.MESSAGES_STORE, message.id);
    }

    // Delete all files for this session
    const files = await indexedDBService.getAll<ClaraFileRecord>(this.FILES_STORE);
    for (const file of files.filter(f => f.sessionId === sessionId)) {
      await indexedDBService.delete(this.FILES_STORE, file.id);
    }

    // Delete all generated tables for this session (cascade delete)
    // Requirements: 9.4
    await this.deleteSessionTables(sessionId);

    // Delete the session itself
    await indexedDBService.delete(this.SESSIONS_STORE, sessionId);
  }

  /**
   * Delete all generated tables for a specific session
   * Requirements: 9.4
   */
  async deleteSessionTables(sessionId: string): Promise<number> {
    try {
      const deletedCount = await indexedDBService.deleteGeneratedTablesBySession(sessionId);
      console.log(`🗑️ Deleted ${deletedCount} generated table(s) for session ${sessionId}`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error deleting session tables:', error);
      throw error;
    }
  }

  /**
   * Get recent sessions (for sidebar)
   */
  async getRecentSessions(limit: number = 20): Promise<ClaraChatSession[]> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return [];
    }
    
    const sessionRecords = await indexedDBService.getAll<ClaraChatSessionRecord>(this.SESSIONS_STORE);
    
    // Convert to sessions and sort by updatedAt
    // Support both new data with user_id and legacy data without user_id
    const sessions = sessionRecords
      .filter(record => record.user_id === currentUserId || !record.user_id)
      .map(this.recordToSession)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);

    // Load messages for each session
    for (const session of sessions) {
      session.messages = await this.getSessionMessages(session.id);
    }

    return sessions;
  }

  /**
   * Get recent sessions WITHOUT messages (for lightning-fast loading)
   * But includes message counts for sidebar display
   */
  async getRecentSessionsLight(limit: number = 20, offset: number = 0): Promise<ClaraChatSession[]> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return [];
    }
    
    const sessionRecords = await indexedDBService.getAll<ClaraChatSessionRecord>(this.SESSIONS_STORE);
    const allMessages = await indexedDBService.getAll<ClaraMessageRecord>(this.MESSAGES_STORE);
    
    // Create a map of session ID to message count for efficient lookup
    // Support both new data with user_id and legacy data without user_id
    const messageCountMap = new Map<string, number>();
    allMessages
      .filter(message => message.user_id === currentUserId || !message.user_id)
      .forEach(message => {
        const currentCount = messageCountMap.get(message.sessionId) || 0;
        messageCountMap.set(message.sessionId, currentCount + 1);
      });
    
    // Convert to sessions and sort by updatedAt, then apply pagination
    // Support both new data with user_id and legacy data without user_id
    const sessions = sessionRecords
      .filter(record => record.user_id === currentUserId || !record.user_id)
      .map(this.recordToSession)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(offset, offset + limit);

    // Return sessions with empty messages array but include messageCount property
    return sessions.map(session => ({
      ...session,
      messages: [], // Empty array for fast loading
      messageCount: messageCountMap.get(session.id) || 0 // Add message count for sidebar
    }));
  }

  /**
   * Get starred sessions
   */
  async getStarredSessions(): Promise<ClaraChatSession[]> {
    const sessions = await this.getAllSessions(true); // Include messages (already filtered by user)
    return sessions.filter(session => session.isStarred);
  }

  /**
   * Get archived sessions
   */
  async getArchivedSessions(): Promise<ClaraChatSession[]> {
    const sessions = await this.getAllSessions(true); // Include messages (already filtered by user)
    return sessions.filter(session => session.isArchived);
  }

  /**
   * Search sessions by title or message content
   */
  async searchSessions(query: string): Promise<ClaraChatSession[]> {
    const sessions = await this.getAllSessions(true); // Include messages for search (already filtered by user)
    const lowerQuery = query.toLowerCase();

    return sessions.filter(session => 
      session.title.toLowerCase().includes(lowerQuery) ||
      session.messages.some(message => 
        message.content.toLowerCase().includes(lowerQuery)
      )
    );
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalSessions: number;
    totalMessages: number;
    totalFiles: number;
    totalSize: number;
  }> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return { totalSessions: 0, totalMessages: 0, totalFiles: 0, totalSize: 0 };
    }
    
    const sessions = await indexedDBService.getAll<ClaraChatSessionRecord>(this.SESSIONS_STORE);
    const messages = await indexedDBService.getAll<ClaraMessageRecord>(this.MESSAGES_STORE);
    const files = await indexedDBService.getAll<ClaraFileRecord>(this.FILES_STORE);

    // Filter by current user
    const userSessions = sessions.filter(s => s.user_id === currentUserId);
    const userMessages = messages.filter(m => m.user_id === currentUserId);
    const userFiles = files.filter(f => f.user_id === currentUserId);
    
    const totalSize = userFiles.reduce((sum, file) => sum + (file.size || 0), 0);

    return {
      totalSessions: userSessions.length,
      totalMessages: userMessages.length,
      totalFiles: userFiles.length,
      totalSize
    };
  }

  /**
   * Debug method to check for orphaned data and integrity issues
   * Now includes orphaned generated tables check
   * Requirements: 9.4, 9.5
   */
  async debugDataIntegrity(): Promise<{
    sessions: number;
    messages: number;
    files: number;
    generatedTables: number;
    orphanedMessages: number;
    orphanedFiles: number;
    orphanedTables: number;
  }> {
    const sessions = await indexedDBService.getAll<ClaraChatSessionRecord>(this.SESSIONS_STORE);
    const messages = await indexedDBService.getAll<ClaraMessageRecord>(this.MESSAGES_STORE);
    const files = await indexedDBService.getAll<ClaraFileRecord>(this.FILES_STORE);
    
    // Get all generated tables
    const generatedTables = await indexedDBService.getAllGeneratedTables<any>();

    const sessionIds = new Set(sessions.map(s => s.id));
    const messageIds = new Set(messages.map(m => m.id));

    // Find orphaned messages (messages without valid sessions)
    const orphanedMessages = messages.filter(m => !sessionIds.has(m.sessionId));
    
    // Find orphaned files (files without valid messages or sessions)
    const orphanedFiles = files.filter(f => 
      !sessionIds.has(f.sessionId) || !messageIds.has(f.messageId)
    );

    // Find orphaned tables (tables without valid sessions)
    // Requirements: 9.5
    const orphanedTables = generatedTables.filter(t => !sessionIds.has(t.sessionId));

    console.log('Data integrity check:', {
      sessions: sessions.length,
      messages: messages.length,
      files: files.length,
      generatedTables: generatedTables.length,
      orphanedMessages: orphanedMessages.length,
      orphanedFiles: orphanedFiles.length,
      orphanedTables: orphanedTables.length
    });

    return {
      sessions: sessions.length,
      messages: messages.length,
      files: files.length,
      generatedTables: generatedTables.length,
      orphanedMessages: orphanedMessages.length,
      orphanedFiles: orphanedFiles.length,
      orphanedTables: orphanedTables.length
    };
  }

  /**
   * Clean up orphaned data
   * Now includes orphaned generated tables cleanup
   * Requirements: 9.4, 9.5
   */
  async cleanupOrphanedData(): Promise<void> {
    const sessions = await indexedDBService.getAll<ClaraChatSessionRecord>(this.SESSIONS_STORE);
    const messages = await indexedDBService.getAll<ClaraMessageRecord>(this.MESSAGES_STORE);
    const files = await indexedDBService.getAll<ClaraFileRecord>(this.FILES_STORE);
    const generatedTables = await indexedDBService.getAllGeneratedTables<any>();

    const sessionIds = new Set(sessions.map(s => s.id));
    const messageIds = new Set(messages.map(m => m.id));

    // Clean up orphaned messages
    const orphanedMessages = messages.filter(m => !sessionIds.has(m.sessionId));
    for (const message of orphanedMessages) {
      await indexedDBService.delete(this.MESSAGES_STORE, message.id);
      console.log('Deleted orphaned message:', message.id);
    }

    // Clean up orphaned files
    const orphanedFiles = files.filter(f => 
      !sessionIds.has(f.sessionId) || !messageIds.has(f.messageId)
    );
    for (const file of orphanedFiles) {
      await indexedDBService.delete(this.FILES_STORE, file.id);
      console.log('Deleted orphaned file:', file.id);
    }

    // Clean up orphaned tables (tables without valid sessions)
    // Requirements: 9.5
    const orphanedTables = generatedTables.filter(t => !sessionIds.has(t.sessionId));
    for (const table of orphanedTables) {
      await indexedDBService.deleteGeneratedTable(table.id);
      console.log('Deleted orphaned generated table:', table.id);
    }

    console.log(`Cleaned up ${orphanedMessages.length} orphaned messages, ${orphanedFiles.length} orphaned files, and ${orphanedTables.length} orphaned tables`);
  }

  /**
   * Clear all Clara chat sessions, messages, and files
   * WARNING: This will permanently delete all chat history
   */
  async clearAllSessions(): Promise<void> {
    try {
      // Clear all files first
      await indexedDBService.clear(this.FILES_STORE);
      
      // Clear all messages
      await indexedDBService.clear(this.MESSAGES_STORE);
      
      // Clear all sessions
      await indexedDBService.clear(this.SESSIONS_STORE);
      
      console.log('Successfully cleared all Clara chat data');
    } catch (error) {
      console.error('Failed to clear Clara chat data:', error);
      throw error;
    }
  }

  // Helper methods for converting between records and objects

  private recordToSession(record: ClaraChatSessionRecord): ClaraChatSession {
    return {
      ...record,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      messages: [] // Messages are loaded separately
    };
  }

  private async recordToMessage(record: ClaraMessageRecord): Promise<ClaraMessage> {
    const attachments = await this.getMessageFiles(record.id);
    
    console.log('📦 Loading message from database:', {
      messageId: record.id,
      role: record.role,
      contentLength: record.content.length,
      attachmentsCount: attachments.length,
      attachmentIds: attachments.map(att => att.id),
      attachmentTypes: attachments.map(att => att.type),
      hasImageAttachments: attachments.some(att => att.type === 'image'),
      contentPreview: record.content.substring(0, 100) + (record.content.length > 100 ? '...' : '')
    });
    
    return {
      ...record,
      timestamp: new Date(record.timestamp),
      attachments: attachments.length > 0 ? attachments : undefined
    };
  }

  private recordToFileAttachment(record: ClaraFileRecord): ClaraFileAttachment {
    console.log('📎 Converting file record to attachment:', {
      id: record.id,
      name: record.name,
      type: record.type,
      mimeType: record.mimeType,
      contentLength: record.content.length,
      contentIsDataUrl: record.content.startsWith('data:'),
      contentPrefix: record.content.substring(0, 50) + (record.content.length > 50 ? '...' : '')
    });
    
    let base64 = undefined;
    let url = undefined;
    
    if (record.content.startsWith('data:')) {
      // This is a data URL, extract the base64 part and keep the full URL
      url = record.content;
      const base64Match = record.content.match(/^data:[^;]+;base64,(.+)$/);
      if (base64Match) {
        base64 = base64Match[1];
      }
    } else {
      // This is raw base64 data, construct the data URL
      base64 = record.content;
      url = `data:${record.mimeType};base64,${record.content}`;
    }
    
    const attachment: ClaraFileAttachment = {
      id: record.id,
      name: record.name,
      type: record.type as any,
      size: record.size,
      mimeType: record.mimeType,
      base64,
      url,
      thumbnail: record.thumbnail,
      processed: record.processed
    };
    
    console.log('📎 Converted attachment:', {
      id: attachment.id,
      hasBase64: !!attachment.base64,
      hasUrl: !!attachment.url,
      urlPrefix: attachment.url?.substring(0, 50) + (attachment.url && attachment.url.length > 50 ? '...' : ''),
      base64Length: attachment.base64?.length
    });
    
    return attachment;
  }
}

// Export singleton instance
export const claraDatabaseService = new ClaraDatabaseService(); 