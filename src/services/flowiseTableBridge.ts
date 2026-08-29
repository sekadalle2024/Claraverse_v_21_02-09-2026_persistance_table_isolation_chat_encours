/**
 * FlowiseTableBridge
 * 
 * Bridge service that connects Flowise.js events with the FlowiseTableService.
 * Handles event listening, session detection, table saving, and restoration.
 */

import { flowiseTableService } from './flowiseTableService';
import { flowiseTimelineService } from './flowiseTimelineService';
import { flowiseTableLazyLoader } from './flowiseTableLazyLoader';
import type { 
  FlowiseGeneratedTableRecord, 
  FlowiseTableSource
} from '../types/flowise_table_types';
import type { TimelineItem, TableTimelineItem } from './flowiseTimelineService';

// Extend Window interface to include claraverseState
declare global {
  interface Window {
    claraverseState?: {
      currentSession?: {
        id: string;
      };
    };
  }
}

/**
 * Event detail for flowise:table:integrated events
 */
interface FlowiseTableIntegratedDetail {
  table: HTMLTableElement;
  keyword: string;
  container?: HTMLElement;
  position?: number;
  source: FlowiseTableSource;
  error?: string;
  timestamp: number;
  messageId?: string; // Optional messageId for linking to specific messages
}

/**
 * Event detail for claraverse:session:changed events
 */
interface SessionChangedDetail {
  sessionId: string;
}

export class FlowiseTableBridge {
  private currentSessionId: string | null = null;
  private readonly MAX_RETRY_ATTEMPTS = 2;
  private readonly RETRY_DELAY_MS = 2000;
  private retryAttempts: Map<string, number> = new Map();
  private lazyLoadingEnabled: boolean = true; // Task 13.1: Enable lazy loading by default

  constructor() {
    this.initializeEventListeners();
    this.detectCurrentSession();
    
    // Automatically restore tables for the detected session on initialization
    // Requirements: 1.2, 4.1, 4.2
    // Don't await - let it run in background
    this.initializeRestoration().catch(error => {
      console.error('❌ Error during initialization restoration:', error);
    });
  }

  /**
   * Initialize table restoration on page load
   * Requirements: 1.2, 4.1, 4.2, 4.3, 4.4
   */
  private async initializeRestoration(): Promise<void> {
    // Vérifier le gestionnaire de verrouillage
    if ((window as any).restoreLockManager && !(window as any).restoreLockManager.canRestore()) {
      console.log('🔒 Bridge: Restauration bloquée par le gestionnaire de verrouillage');
      return;
    }

    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
      await new Promise<void>(resolve => {
        const handler = () => {
          document.removeEventListener('DOMContentLoaded', handler);
          resolve();
        };
        document.addEventListener('DOMContentLoaded', handler);
      });
    }

    // Restore tables for the current session if one is detected
    if (this.currentSessionId) {
      console.log(`🔄 Auto-restoring tables for session: ${this.currentSessionId}`);
      await this.restoreTablesForSession(this.currentSessionId);
    } else {
      console.log('ℹ️ No session detected on initialization, skipping auto-restore');
    }
  }

  // ==================
  // SESSION DETECTION (Subtask 3.1)
  // ==================

  /**
   * Detect the current active session using multiple detection methods with error handling
   * Requirements: 4.1, 9.1, 9.5
   * Task 11.1: Implements session detection error handling with fallback
   */
  private detectCurrentSession(): void {
    const detectionMethods = [
      { name: 'React State', method: () => this.detectFromReactState() },
      { name: 'URL Parameters', method: () => this.detectFromURL() },
      { name: 'DOM Attributes', method: () => this.detectFromDOM() }
    ];

    // Try each detection method in sequence
    for (const { name, method } of detectionMethods) {
      try {
        const sessionId = method();
        if (sessionId) {
          this.currentSessionId = sessionId;
          console.log(`✅ Session detected from ${name}: ${sessionId}`);
          
          // Log successful detection method
          this.logSessionDetection(name, sessionId, true);
          return;
        }
      } catch (error) {
        console.warn(`⚠️ Session detection failed for ${name}:`, error);
        
        // Log failed detection attempt
        this.logSessionDetection(name, null, false, error);
      }
    }

    // All detection methods failed - fall back to temporary session
    try {
      this.currentSessionId = this.createTemporarySession();
      console.warn(`⚠️ All session detection methods failed, created temporary session: ${this.currentSessionId}`);
      
      // Log fallback to temporary session
      this.logSessionDetection('Temporary Fallback', this.currentSessionId, true);
    } catch (error) {
      console.error('❌ Critical error: Failed to create temporary session:', error);
      
      // Last resort - set to null and log critical error
      this.currentSessionId = null;
      this.logSessionDetection('Temporary Fallback', null, false, error);
    }
  }

  /**
   * Log session detection attempts for monitoring
   * Requirements: 9.1, 9.5
   * Task 11.1: Log detection method used
   */
  private logSessionDetection(
    method: string,
    sessionId: string | null,
    success: boolean,
    error?: any
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method,
      sessionId,
      success,
      error: error ? (error instanceof Error ? error.message : String(error)) : undefined
    };

    // Store in session storage for debugging
    try {
      const existingLogs = sessionStorage.getItem('flowise_session_detection_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Keep only last 50 entries
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      sessionStorage.setItem('flowise_session_detection_logs', JSON.stringify(logs));
    } catch (storageError) {
      console.debug('Could not store session detection log:', storageError);
    }
  }

  /**
   * Get session detection logs for diagnostics
   * Requirements: 9.1, 9.5
   * Task 11.1: Provide access to detection logs
   */
  public getSessionDetectionLogs(): any[] {
    try {
      const logs = sessionStorage.getItem('flowise_session_detection_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving session detection logs:', error);
      return [];
    }
  }

  /**
   * Clear session detection logs
   * Requirements: 9.1, 9.5
   */
  public clearSessionDetectionLogs(): void {
    try {
      sessionStorage.removeItem('flowise_session_detection_logs');
      console.log('✅ Session detection logs cleared');
    } catch (error) {
      console.error('Error clearing session detection logs:', error);
    }
  }

  /**
   * Detect session from window.claraverseState (React global state)
   * Task 11.1: Enhanced with error handling
   */
  private detectFromReactState(): string | null {
    try {
      // Check if window object exists (for SSR compatibility)
      if (typeof window === 'undefined') {
        return null;
      }

      // Check for claraverseState
      if (!window.claraverseState) {
        return null;
      }

      // Validate structure
      if (typeof window.claraverseState !== 'object') {
        console.warn('⚠️ window.claraverseState is not an object');
        return null;
      }

      // Check for currentSession
      if (!window.claraverseState.currentSession) {
        return null;
      }

      // Get session ID
      const sessionId = window.claraverseState.currentSession.id;

      // Validate session ID
      if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
        console.warn('⚠️ Invalid session ID in React state:', sessionId);
        return null;
      }

      return sessionId.trim();
    } catch (error) {
      console.debug('Could not detect session from React state:', error);
      throw error; // Re-throw to be caught by detectCurrentSession
    }
  }

  /**
   * Detect session from URL parameters (sessionId, session, chatId)
   * Task 11.1: Enhanced with error handling
   */
  private detectFromURL(): string | null {
    try {
      // Check if window and location exist
      if (typeof window === 'undefined' || !window.location) {
        return null;
      }

      // Parse URL parameters safely
      let urlParams: URLSearchParams;
      try {
        urlParams = new URLSearchParams(window.location.search);
      } catch (parseError) {
        console.warn('⚠️ Failed to parse URL parameters:', parseError);
        return null;
      }
      
      // Try multiple parameter names
      const paramNames = ['sessionId', 'session', 'chatId', 'chat_id', 'sid'];
      
      for (const paramName of paramNames) {
        const sessionId = urlParams.get(paramName);
        
        // Validate session ID
        if (sessionId && typeof sessionId === 'string' && sessionId.trim() !== '') {
          const trimmedId = sessionId.trim();
          
          // Basic validation - check for reasonable length and format
          if (trimmedId.length > 0 && trimmedId.length < 256) {
            return trimmedId;
          } else {
            console.warn(`⚠️ Invalid session ID length from URL parameter ${paramName}:`, trimmedId.length);
          }
        }
      }

      return null;
    } catch (error) {
      console.debug('Could not detect session from URL:', error);
      throw error; // Re-throw to be caught by detectCurrentSession
    }
  }

  /**
   * Detect session from DOM attributes (data-session-id)
   * Task 11.1: Enhanced with error handling
   */
  private detectFromDOM(): string | null {
    try {
      // Check if document exists
      if (typeof document === 'undefined') {
        return null;
      }

      // Try multiple selectors with error handling for each
      const selectors = [
        '[data-session-id]',
        '[data-chat-session-id]',
        '.chat-container[data-session-id]',
        '#chat-session[data-session-id]',
        '[data-clara-session-id]',
        '.session-container[data-session-id]'
      ];

      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (!element) {
            continue;
          }

          // Try multiple attribute names
          const attributeNames = ['data-session-id', 'data-chat-session-id', 'data-clara-session-id'];
          
          for (const attrName of attributeNames) {
            const sessionId = element.getAttribute(attrName);
            
            // Validate session ID
            if (sessionId && typeof sessionId === 'string' && sessionId.trim() !== '') {
              const trimmedId = sessionId.trim();
              
              // Basic validation
              if (trimmedId.length > 0 && trimmedId.length < 256) {
                return trimmedId;
              } else {
                console.warn(`⚠️ Invalid session ID length from DOM attribute ${attrName}:`, trimmedId.length);
              }
            }
          }
        } catch (selectorError) {
          console.debug(`Invalid selector or query error for ${selector}:`, selectorError);
          // Continue to next selector
        }
      }

      return null;
    } catch (error) {
      console.debug('Could not detect session from DOM:', error);
      throw error; // Re-throw to be caught by detectCurrentSession
    }
  }

  /**
   * Create a temporary session ID as fallback
   * Marked as temporary for later cleanup
   * Task 11.1: Enhanced with error handling
   */
  private createTemporarySession(): string {
    try {
      const timestamp = Date.now();
      
      // Validate timestamp
      if (!timestamp || isNaN(timestamp)) {
        throw new Error('Invalid timestamp for temporary session');
      }

      // Generate random component with fallback
      let random: string;
      try {
        random = Math.random().toString(36).substring(2, 9);
      } catch (randomError) {
        console.warn('⚠️ Math.random() failed, using fallback:', randomError);
        // Fallback to a simple counter
        random = String(Date.now() % 1000000);
      }

      // Validate random component
      if (!random || random.length === 0) {
        random = 'fallback';
      }

      const tempSessionId = `temp-session-${timestamp}-${random}`;

      // Store temporary session info for cleanup
      try {
        const tempSessions = this.getTemporarySessions();
        tempSessions.push({
          id: tempSessionId,
          createdAt: new Date().toISOString(),
          reason: 'All detection methods failed'
        });
        sessionStorage.setItem('flowise_temp_sessions', JSON.stringify(tempSessions));
      } catch (storageError) {
        console.debug('Could not store temporary session info:', storageError);
      }

      return tempSessionId;
    } catch (error) {
      console.error('❌ Critical error creating temporary session:', error);
      // Last resort fallback
      return `temp-session-emergency-${Date.now()}`;
    }
  }

  /**
   * Get list of temporary sessions created
   * Requirements: 9.5
   * Task 11.1: Track temporary sessions for cleanup
   */
  public getTemporarySessions(): Array<{
    id: string;
    createdAt: string;
    reason: string;
  }> {
    try {
      const stored = sessionStorage.getItem('flowise_temp_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving temporary sessions:', error);
      return [];
    }
  }

  /**
   * Clean up temporary sessions
   * Requirements: 9.5
   * Task 11.1: Cleanup temporary sessions
   */
  public async cleanupTemporarySessions(): Promise<number> {
    try {
      const tempSessions = this.getTemporarySessions();
      
      if (tempSessions.length === 0) {
        console.log('✅ No temporary sessions to clean up');
        return 0;
      }

      console.log(`🧹 Cleaning up ${tempSessions.length} temporary session(s)...`);

      let deletedCount = 0;
      for (const tempSession of tempSessions) {
        try {
          const deleted = await flowiseTableService.deleteSessionTables(tempSession.id);
          deletedCount += deleted;
          console.log(`🗑️ Deleted ${deleted} table(s) from temporary session: ${tempSession.id}`);
        } catch (error) {
          console.error(`❌ Error deleting tables for temporary session ${tempSession.id}:`, error);
        }
      }

      // Clear temporary session list
      sessionStorage.removeItem('flowise_temp_sessions');

      console.log(`✅ Cleaned up ${deletedCount} table(s) from ${tempSessions.length} temporary session(s)`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up temporary sessions:', error);
      return 0;
    }
  }

  /**
   * Update the current session ID (can be called externally)
   */
  public setCurrentSession(sessionId: string): void {
    if (sessionId && sessionId.trim() !== '') {
      this.currentSessionId = sessionId.trim();
      console.log(`✅ Session manually set to: ${this.currentSessionId}`);
    }
  }

  /**
   * Get the current session ID
   */
  public getCurrentSession(): string | null {
    return this.currentSessionId;
  }

  // ==================
  // MESSAGE CONTEXT DETECTION (Task 10.1)
  // ==================

  /**
   * Detect the message context when a table is generated
   * Requirements: 10.4
   * 
   * This method attempts to find the message ID that the table is associated with
   * by looking at the DOM structure and data attributes.
   * 
   * @param tableElement - The table element that was generated
   * @returns The message ID if detected, undefined otherwise
   */
  private detectMessageContext(tableElement: HTMLTableElement): string | undefined {
    try {
      // Method 1: Check if the table or its container has a data-message-id attribute
      const messageIdFromTable = tableElement.getAttribute('data-message-id');
      if (messageIdFromTable) {
        console.log(`✅ Message ID detected from table attribute: ${messageIdFromTable}`);
        return messageIdFromTable;
      }

      // Method 2: Check parent containers for message ID
      let currentElement: HTMLElement | null = tableElement;
      while (currentElement && currentElement !== document.body) {
        const messageId = currentElement.getAttribute('data-message-id') ||
                         currentElement.getAttribute('data-clara-message-id');
        if (messageId) {
          console.log(`✅ Message ID detected from parent container: ${messageId}`);
          return messageId;
        }
        currentElement = currentElement.parentElement;
      }

      // Method 3: Look for the closest message container
      const messageContainer = tableElement.closest('[data-message-id], [data-clara-message-id], .message-container, .chat-message');
      if (messageContainer) {
        const messageId = messageContainer.getAttribute('data-message-id') ||
                         messageContainer.getAttribute('data-clara-message-id');
        if (messageId) {
          console.log(`✅ Message ID detected from message container: ${messageId}`);
          return messageId;
        }
      }

      // Method 4: Check if there's a message ID in the table's container
      const container = tableElement.closest('[data-container-id]');
      if (container) {
        const messageId = container.getAttribute('data-message-id') ||
                         container.getAttribute('data-clara-message-id');
        if (messageId) {
          console.log(`✅ Message ID detected from table container: ${messageId}`);
          return messageId;
        }
      }

      // Method 5: Try to find the most recent assistant message in the DOM
      const assistantMessages = document.querySelectorAll('[data-role="assistant"][data-message-id], .assistant-message[data-message-id]');
      if (assistantMessages.length > 0) {
        const lastMessage = assistantMessages[assistantMessages.length - 1];
        const messageId = lastMessage.getAttribute('data-message-id');
        if (messageId) {
          console.log(`✅ Message ID detected from last assistant message: ${messageId}`);
          return messageId;
        }
      }

      console.log('ℹ️ No message ID detected for table');
      return undefined;

    } catch (error) {
      console.error('❌ Error detecting message context:', error);
      return undefined;
    }
  }

  // ==================
  // EVENT LISTENERS (Subtask 3.2)
  // ==================

  /**
   * Initialize all event listeners
   * Requirements: 3.1, 3.2, 3.4, 3.5
   */
  private initializeEventListeners(): void {
    // Listen for Flowise table integrated events
    document.addEventListener('flowise:table:integrated', this.handleFlowiseTableIntegrated.bind(this));

    // Listen for session change events
    document.addEventListener('claraverse:session:changed', this.handleSessionChanged.bind(this));

    console.log('✅ FlowiseTableBridge event listeners initialized');
  }

  /**
   * Handle flowise:table:integrated events
   */
  private handleFlowiseTableIntegrated(event: Event): void {
    const customEvent = event as CustomEvent<FlowiseTableIntegratedDetail>;
    const detail = customEvent.detail;

    if (!detail || !detail.table) {
      console.warn('⚠️ Invalid flowise:table:integrated event, missing table');
      return;
    }

    this.handleTableIntegrated(detail);
  }

  /**
   * Handle claraverse:session:changed events
   * Requirements: 9.3 - Handle session switching with automatic reload
   */
  private handleSessionChanged(event: Event): void {
    const customEvent = event as CustomEvent<SessionChangedDetail>;
    const detail = customEvent.detail;

    if (!detail || !detail.sessionId) {
      console.warn('⚠️ Invalid claraverse:session:changed event, missing sessionId');
      return;
    }

    console.log(`🔄 Session changed from ${this.currentSessionId} to: ${detail.sessionId}`);
    this.currentSessionId = detail.sessionId;
    
    // Clear previously restored tables from DOM before loading new session
    // Requirements: 9.3
    this.clearRestoredTablesFromDOM();
    
    // Restore tables for the new session
    // Requirements: 9.3
    this.restoreTablesForSession(detail.sessionId);
  }

  /**
   * Clear all restored tables from the DOM
   * Used when switching sessions to ensure clean state
   * Requirements: 9.3
   */
  private clearRestoredTablesFromDOM(): void {
    try {
      // Find all restored table wrappers
      const restoredTables = document.querySelectorAll('[data-restored="true"]');
      
      console.log(`🧹 Clearing ${restoredTables.length} restored table(s) from DOM`);
      
      restoredTables.forEach(table => {
        table.remove();
      });

      // Also remove restored containers if they're empty
      const restoredContainers = document.querySelectorAll('[data-restored-container="true"]');
      restoredContainers.forEach(container => {
        if (container.children.length === 0) {
          container.remove();
        }
      });
    } catch (error) {
      console.error('❌ Error clearing restored tables from DOM:', error);
    }
  }

  /**
   * Handle table integrated event - save the table
   * Requirements: 3.1, 3.2, 3.5, 10.4
   * Task 11.3: Enhanced with retry logic
   */
  private async handleTableIntegrated(detail: FlowiseTableIntegratedDetail): Promise<void> {
    // Check if we have an active session
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, attempting to detect session...');
      this.detectCurrentSession();
      
      if (!this.currentSessionId) {
        console.error('❌ Cannot save table: no session detected');
        this.emitTableError('No active session detected', detail);
        return;
      }
    }

    try {
      const tableElement = detail.table;
      const keyword = detail.keyword;
      const source = detail.source;

      // Detect message context when table is generated
      // Requirements: 10.4
      const messageId = detail.messageId || this.detectMessageContext(tableElement);

      // Generate fingerprint to check for duplicates
      const fingerprint = flowiseTableService.generateTableFingerprint(tableElement);

      // Check if table already exists
      const exists = await flowiseTableService.tableExists(this.currentSessionId, fingerprint);

      if (exists) {
        console.log(`ℹ️ Table already saved (fingerprint: ${fingerprint.substring(0, 8)}...), skipping duplicate`);
        return;
      }

      // Save the table with messageId link
      // Requirements: 10.4
      const tableId = await flowiseTableService.saveGeneratedTable(
        this.currentSessionId,
        tableElement,
        keyword,
        source,
        messageId
      );

      if (tableId) {
        console.log(`✅ Table saved successfully: ${tableId}${messageId ? ` (linked to message: ${messageId})` : ''}`);
        
        // Emit success event
        this.emitTableSaved(tableId, this.currentSessionId, keyword, fingerprint);
        
        // Clear retry attempts for this table
        this.retryAttempts.delete(fingerprint);
        
        // Clear retry metadata
        this.clearRetryMetadata(fingerprint);
      }

    } catch (error) {
      console.error('❌ Error saving table:', error);
      
      // Log the error with context
      this.logSaveError(error, detail);
      
      // Emit error event
      this.emitTableError(error instanceof Error ? error.message : 'Unknown error', detail);
      
      // Retry logic with exponential backoff
      // Task 11.3: Retry failed saves after 2 seconds, max 2 attempts
      await this.retryTableSave(detail, error);
    }
  }

  /**
   * Retry saving a table after failure
   * Requirements: 3.5
   * Task 11.3: Enhanced retry logic with exponential backoff and error tracking
   */
  private async retryTableSave(detail: FlowiseTableIntegratedDetail, lastError: any): Promise<void> {
    const fingerprint = flowiseTableService.generateTableFingerprint(detail.table);
    const currentAttempts = this.retryAttempts.get(fingerprint) || 0;

    // Task 11.3: Maximum 2 retry attempts
    if (currentAttempts < this.MAX_RETRY_ATTEMPTS) {
      this.retryAttempts.set(fingerprint, currentAttempts + 1);
      
      // Store retry metadata for diagnostics
      this.storeRetryMetadata(fingerprint, currentAttempts + 1, lastError, detail);
      
      // Task 11.3: Retry after 2 seconds
      const delay = this.RETRY_DELAY_MS;
      
      console.log(`🔄 Retrying table save (attempt ${currentAttempts + 1}/${this.MAX_RETRY_ATTEMPTS}) in ${delay}ms...`);
      
      setTimeout(() => {
        this.handleTableIntegrated(detail);
      }, delay);
    } else {
      // Task 11.3: Emit error event after max retries
      console.error(`❌ Max retry attempts (${this.MAX_RETRY_ATTEMPTS}) reached for table, giving up`);
      
      // Store final failure
      this.storeRetryMetadata(fingerprint, currentAttempts, lastError, detail, true);
      
      // Emit final error event
      this.emitTableErrorMaxRetries(detail, lastError);
      
      // Clean up
      this.retryAttempts.delete(fingerprint);
    }
  }

  /**
   * Store retry metadata for diagnostics
   * Task 11.3: Track retry attempts for monitoring
   */
  private storeRetryMetadata(
    fingerprint: string,
    attemptNumber: number,
    error: any,
    detail: FlowiseTableIntegratedDetail,
    isFinalFailure: boolean = false
  ): void {
    try {
      const retryLog = {
        timestamp: new Date().toISOString(),
        fingerprint: fingerprint.substring(0, 16),
        attemptNumber,
        maxAttempts: this.MAX_RETRY_ATTEMPTS,
        keyword: detail.keyword,
        source: detail.source,
        sessionId: this.currentSessionId,
        errorName: error?.name || 'Unknown',
        errorMessage: error?.message || error?.toString() || 'No message',
        isFinalFailure
      };

      const existingLogs = sessionStorage.getItem('flowise_retry_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(retryLog);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      sessionStorage.setItem('flowise_retry_logs', JSON.stringify(logs));
    } catch (storageError) {
      console.debug('Could not store retry metadata:', storageError);
    }
  }

  /**
   * Clear retry metadata for a specific table
   * Task 11.3: Clean up after successful save
   */
  private clearRetryMetadata(fingerprint: string): void {
    try {
      const existingLogs = sessionStorage.getItem('flowise_retry_logs');
      if (!existingLogs) return;

      const logs = JSON.parse(existingLogs);
      const fingerprintPrefix = fingerprint.substring(0, 16);
      
      // Remove logs for this fingerprint
      const filteredLogs = logs.filter((log: any) => log.fingerprint !== fingerprintPrefix);
      
      sessionStorage.setItem('flowise_retry_logs', JSON.stringify(filteredLogs));
    } catch (error) {
      console.debug('Could not clear retry metadata:', error);
    }
  }

  /**
   * Log save errors for monitoring
   * Task 11.3: Track save errors
   */
  private logSaveError(error: any, detail: FlowiseTableIntegratedDetail): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      errorName: error?.name || 'Unknown',
      errorMessage: error?.message || error?.toString() || 'No message',
      keyword: detail.keyword,
      source: detail.source,
      sessionId: this.currentSessionId,
      stackTrace: error?.stack
    };

    try {
      const existingLogs = sessionStorage.getItem('flowise_save_errors');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(errorLog);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      sessionStorage.setItem('flowise_save_errors', JSON.stringify(logs));
    } catch (storageError) {
      console.debug('Could not store save error log:', storageError);
    }
  }

  /**
   * Emit error event after max retries
   * Task 11.3: Emit error event after max retries
   * Requirements: 3.5
   */
  private emitTableErrorMaxRetries(detail: FlowiseTableIntegratedDetail, lastError: any): void {
    const event = new CustomEvent('storage:table:error:max-retries', {
      detail: {
        error: `Max retry attempts (${this.MAX_RETRY_ATTEMPTS}) exceeded`,
        lastError: lastError?.message || lastError?.toString() || 'Unknown error',
        sessionId: this.currentSessionId,
        keyword: detail.keyword,
        source: detail.source,
        timestamp: Date.now(),
        maxAttempts: this.MAX_RETRY_ATTEMPTS
      },
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  /**
   * Get retry logs for diagnostics
   * Task 11.3: Provide access to retry logs
   */
  public getRetryLogs(): any[] {
    try {
      const logs = sessionStorage.getItem('flowise_retry_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving retry logs:', error);
      return [];
    }
  }

  /**
   * Get save error logs for diagnostics
   * Task 11.3: Provide access to save error logs
   */
  public getSaveErrorLogs(): any[] {
    try {
      const logs = sessionStorage.getItem('flowise_save_errors');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving save error logs:', error);
      return [];
    }
  }

  /**
   * Clear retry logs
   * Task 11.3: Clear retry logs
   */
  public clearRetryLogs(): void {
    try {
      sessionStorage.removeItem('flowise_retry_logs');
      console.log('✅ Retry logs cleared');
    } catch (error) {
      console.error('Error clearing retry logs:', error);
    }
  }

  /**
   * Clear save error logs
   * Task 11.3: Clear save error logs
   */
  public clearSaveErrorLogs(): void {
    try {
      sessionStorage.removeItem('flowise_save_errors');
      console.log('✅ Save error logs cleared');
    } catch (error) {
      console.error('Error clearing save error logs:', error);
    }
  }

  /**
   * Emit storage:table:saved event
   * Requirements: 3.2
   */
  private emitTableSaved(
    tableId: string, 
    sessionId: string, 
    keyword: string, 
    fingerprint: string
  ): void {
    const event = new CustomEvent('storage:table:saved', {
      detail: {
        tableId,
        sessionId,
        keyword,
        fingerprint,
        timestamp: Date.now()
      },
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  /**
   * Emit storage:table:error event
   * Requirements: 3.2, 3.5
   */
  private emitTableError(errorMessage: string, detail: FlowiseTableIntegratedDetail): void {
    const event = new CustomEvent('storage:table:error', {
      detail: {
        error: errorMessage,
        sessionId: this.currentSessionId,
        keyword: detail.keyword,
        source: detail.source,
        timestamp: Date.now()
      },
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  // ==================
  // TABLE RESTORATION (Subtask 3.3)
  // ==================

  /**
   * Restore all tables for a specific session
   * Requirements: 1.2, 4.1, 4.2, 4.5, 10.2, 10.5
   * Task 11: Enhanced with graceful error handling
   */
  public async restoreTablesForSession(sessionId: string): Promise<void> {
    try {
      console.log(`🔄 Restoring tables for session: ${sessionId}`);

      let tables: FlowiseGeneratedTableRecord[];
      
      // Attempt to restore tables with error handling
      try {
        tables = await flowiseTableService.restoreSessionTables(sessionId);
      } catch (restoreError) {
        console.error('❌ Error fetching tables from storage:', restoreError);
        
        // Log restoration error
        this.logRestorationError('FetchError', restoreError, sessionId);
        
        // Emit restoration error event
        this.emitRestorationError(sessionId, 'Failed to fetch tables from storage', restoreError);
        
        // Gracefully fail - don't throw, just return
        return;
      }

      if (tables.length === 0) {
        console.log(`ℹ️ No tables to restore for session ${sessionId}`);
        return;
      }

      console.log(`📋 Found ${tables.length} table(s) to restore`);

      // Sort tables chronologically by timestamp (Subtask 5.2)
      try {
        tables = this.sortTablesChronologically(tables);
      } catch (sortError) {
        console.warn('⚠️ Error sorting tables, using original order:', sortError);
        // Continue with unsorted tables
      }

      // Group tables by container to maintain position order
      let tablesByContainer: Map<string, FlowiseGeneratedTableRecord[]>;
      try {
        tablesByContainer = this.groupTablesByContainer(tables);
      } catch (groupError) {
        console.warn('⚠️ Error grouping tables, restoring individually:', groupError);
        // Fallback: restore tables individually without grouping
        for (const tableData of tables) {
          await this.safeInjectTableIntoDOM(tableData, sessionId);
        }
        return;
      }

      // Inject tables container by container, maintaining chronological order
      let successCount = 0;
      let failureCount = 0;

      for (const [containerId, containerTables] of tablesByContainer.entries()) {
        try {
          // Sort tables within the same container by position
          const sortedContainerTables = containerTables.sort((a, b) => a.position - b.position);
          
          for (const tableData of sortedContainerTables) {
            const success = await this.safeInjectTableIntoDOM(tableData, sessionId);
            if (success) {
              successCount++;
            } else {
              failureCount++;
            }
          }
        } catch (containerError) {
          console.error(`❌ Error restoring tables for container ${containerId}:`, containerError);
          failureCount += containerTables.length;
          
          // Log container restoration error
          this.logRestorationError('ContainerError', containerError, sessionId, containerId);
        }
      }

      if (successCount > 0) {
        console.log(`✅ Restored ${successCount} table(s) for session ${sessionId}${failureCount > 0 ? ` (${failureCount} failed)` : ''}`);
        
        // Clean up duplicate original tables after restoration
        // Use longer delay to ensure Flowise has time to generate original tables
        setTimeout(() => {
          this.cleanupDuplicateOriginalTables();
        }, 2000);
        
        // Also schedule additional cleanups to catch late-arriving tables
        setTimeout(() => {
          this.cleanupDuplicateOriginalTables();
        }, 5000);
      }

      if (failureCount > 0) {
        console.warn(`⚠️ Failed to restore ${failureCount} table(s) for session ${sessionId}`);
        
        // Emit partial restoration warning
        this.emitRestorationWarning(sessionId, successCount, failureCount);
      }

    } catch (error) {
      console.error('❌ Critical error restoring tables:', error);
      
      // Log critical restoration error
      this.logRestorationError('CriticalError', error, sessionId);
      
      // Emit restoration error event
      this.emitRestorationError(sessionId, 'Critical restoration error', error);
      
      // Don't throw - gracefully fail
    }
  }

  /**
   * Safely inject a table into the DOM with error handling
   * Task 11: Handle restoration failures gracefully
   * 
   * @param tableData - The table data to inject
   * @param sessionId - The session ID for logging
   * @returns True if injection was successful, false otherwise
   */
  private async safeInjectTableIntoDOM(
    tableData: FlowiseGeneratedTableRecord,
    sessionId: string
  ): Promise<boolean> {
    try {
      this.injectTableIntoDOM(tableData);
      return true;
    } catch (error) {
      console.error(`❌ Error injecting table ${tableData.id}:`, error);
      
      // Log individual table injection error
      this.logRestorationError('InjectionError', error, sessionId, undefined, tableData.id);
      
      return false;
    }
  }

  /**
   * Log restoration errors for monitoring
   * Task 11: Handle restoration failures gracefully
   */
  private logRestorationError(
    errorType: string,
    error: any,
    sessionId: string,
    containerId?: string,
    tableId?: string
  ): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      errorType,
      errorName: error?.name || 'Unknown',
      errorMessage: error?.message || error?.toString() || 'No message',
      sessionId,
      containerId,
      tableId,
      stackTrace: error?.stack
    };

    try {
      const existingLogs = sessionStorage.getItem('flowise_restoration_errors');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(errorLog);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      sessionStorage.setItem('flowise_restoration_errors', JSON.stringify(logs));
    } catch (storageError) {
      console.debug('Could not store restoration error log:', storageError);
    }
  }

  /**
   * Emit restoration error event
   * Task 11: Handle restoration failures gracefully
   */
  private emitRestorationError(sessionId: string, message: string, error: any): void {
    const event = new CustomEvent('storage:restoration:error', {
      detail: {
        sessionId,
        message,
        error: error?.message || error?.toString() || 'Unknown error',
        timestamp: Date.now()
      },
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  /**
   * Emit restoration warning event for partial failures
   * Task 11: Handle restoration failures gracefully
   */
  private emitRestorationWarning(sessionId: string, successCount: number, failureCount: number): void {
    const event = new CustomEvent('storage:restoration:warning', {
      detail: {
        sessionId,
        successCount,
        failureCount,
        message: `Partially restored tables: ${successCount} succeeded, ${failureCount} failed`,
        timestamp: Date.now()
      },
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  /**
   * Get restoration error logs for diagnostics
   * Task 11: Provide access to restoration error logs
   */
  public getRestorationErrorLogs(): any[] {
    try {
      const logs = sessionStorage.getItem('flowise_restoration_errors');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving restoration error logs:', error);
      return [];
    }
  }

  /**
   * Clear restoration error logs
   * Task 11: Clear restoration error logs
   */
  public clearRestorationErrorLogs(): void {
    try {
      sessionStorage.removeItem('flowise_restoration_errors');
      console.log('✅ Restoration error logs cleared');
    } catch (error) {
      console.error('Error clearing restoration error logs:', error);
    }
  }

  /**
   * Clean up duplicate original tables after restoration
   * Removes non-restored tables that have the same headers as restored tables
   */
  private cleanupDuplicateOriginalTables(): void {
    try {
      console.log('🧹 Cleaning up duplicate original tables...');
      
      // Get all restored tables and their header signatures
      const restoredTables = document.querySelectorAll('[data-restored="true"] table');
      const restoredHeaderSignatures = new Set<string>();
      
      // Generate header signatures for all restored tables
      restoredTables.forEach(table => {
        try {
          const headers = Array.from(table.querySelectorAll('th'))
            .map(th => th.textContent?.trim() || '')
            .filter(h => h.length > 0)
            .sort()
            .join('|');
          
          if (headers) {
            restoredHeaderSignatures.add(headers);
          }
        } catch (error) {
          console.warn('Error generating header signature for restored table:', error);
        }
      });
      
      console.log(`Found ${restoredHeaderSignatures.size} unique restored table header signature(s)`);
      
      // Find and remove non-restored tables with matching headers
      const allTables = document.querySelectorAll('table');
      let removedCount = 0;
      
      allTables.forEach(table => {
        const wrapper = table.closest('[data-n8n-table]');
        const isRestored = wrapper?.getAttribute('data-restored') === 'true';
        
        // Skip if this is a restored table
        if (isRestored) {
          return;
        }
        
        // Check if this table has the same headers as a restored table
        try {
          const headers = Array.from(table.querySelectorAll('th'))
            .map(th => th.textContent?.trim() || '')
            .filter(h => h.length > 0)
            .sort()
            .join('|');
          
          if (headers && restoredHeaderSignatures.has(headers)) {
            console.log(`🗑️ Removing duplicate original table with headers: ${headers.substring(0, 50)}...`);
            
            // Remove the table's container or wrapper
            const container = table.closest('[data-container-id]');
            if (container && container.getAttribute('data-restored-container') !== 'true') {
              container.remove();
              removedCount++;
            } else {
              // Fallback: remove just the table
              table.remove();
              removedCount++;
            }
          }
        } catch (error) {
          console.warn('Error checking table for duplicates:', error);
        }
      });
      
      if (removedCount > 0) {
        console.log(`✅ Removed ${removedCount} duplicate original table(s)`);
      } else {
        console.log('ℹ️ No duplicate original tables found');
      }
      
    } catch (error) {
      console.error('❌ Error cleaning up duplicate tables:', error);
    }
  }

  /**
   * Sort tables chronologically by timestamp
   * Requirements: 4.2, 4.5, 10.2, 10.5
   */
  private sortTablesChronologically(tables: FlowiseGeneratedTableRecord[]): FlowiseGeneratedTableRecord[] {
    return tables.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });
  }

  /**
   * Group tables by their container ID
   * Requirements: 4.5
   */
  private groupTablesByContainer(tables: FlowiseGeneratedTableRecord[]): Map<string, FlowiseGeneratedTableRecord[]> {
    const grouped = new Map<string, FlowiseGeneratedTableRecord[]>();

    for (const table of tables) {
      const containerId = table.containerId;
      if (!grouped.has(containerId)) {
        grouped.set(containerId, []);
      }
      grouped.get(containerId)!.push(table);
    }

    return grouped;
  }

  /**
   * Inject a restored table into the DOM
   * Requirements: 1.2, 1.3, 4.3, 4.4, 4.5
   * 
   * IMPORTANT: Matches tables by KEYWORD instead of containerID
   * because containerIDs change on each page reload.
   */
  private injectTableIntoDOM(tableData: FlowiseGeneratedTableRecord): void {
    try {
      // Find an existing table with the same keyword
      const existingTable = this.findTableByKeyword(tableData.keyword);
      
      if (!existingTable) {
        console.log(`ℹ️ No existing table found for keyword "${tableData.keyword}", skipping restoration`);
        return;
      }

      // Find the container of this table
      const container = existingTable.closest('[data-container-id]') as HTMLElement;
      
      if (!container) {
        console.log(`ℹ️ No container found for table "${tableData.keyword}", skipping restoration`);
        return;
      }

      // Create the table wrapper
      const tableWrapper = this.createTableWrapper(tableData);

      // Replace the entire content of the container with the restored table
      container.innerHTML = '';
      container.appendChild(tableWrapper);
      
      // Mark container as restored
      container.setAttribute('data-restored-content', 'true');

      console.log(`✅ Restored table "${tableData.keyword}" (${tableData.id}) into existing container`);

    } catch (error) {
      console.error(`❌ Error restoring table ${tableData.id}:`, error);
    }
  }

  /**
   * Find a table in the DOM by its keyword or headers
   * Falls back to header matching if keyword is not found
   */
  private findTableByKeyword(keyword: string): HTMLTableElement | null {
    const tables = document.querySelectorAll('table');
    
    // First try: Search by keyword attribute
    for (const table of tables) {
      const wrapper = table.closest('[data-n8n-keyword]');
      if (wrapper?.getAttribute('data-n8n-keyword') === keyword) {
        return table as HTMLTableElement;
      }
    }
    
    // Second try: Search by matching first header cell content
    // The keyword is often the first column header
    for (const table of tables) {
      const firstHeader = table.querySelector('th');
      if (firstHeader?.textContent?.trim().toLowerCase() === keyword.toLowerCase()) {
        return table as HTMLTableElement;
      }
    }
    
    // Third try: Search by any header containing the keyword
    for (const table of tables) {
      const headers = Array.from(table.querySelectorAll('th'));
      const hasMatchingHeader = headers.some(th => 
        th.textContent?.trim().toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasMatchingHeader) {
        return table as HTMLTableElement;
      }
    }
    
    return null;
  }

  /**
   * Find a table container by containerId
   */
  private findTableContainer(containerId: string): HTMLElement | null {
    // Try multiple selector strategies
    const selectors = [
      `[data-container-id="${containerId}"]`,
      `#${containerId}`,
      `.container-${containerId}`
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          return element;
        }
      } catch (error) {
        // Invalid selector, continue
      }
    }

    return null;
  }

  /**
   * Create a new table container with proper classes and attributes
   * Requirements: 4.4
   * 
   * Creates a div.prose container with:
   * - Proper prose classes for styling
   * - data-container-id attribute for identification
   * - data-restored-container attribute to mark as restored
   * - Appropriate insertion point in the chat DOM
   */
  private createTableContainer(containerId: string): HTMLElement {
    const container = document.createElement('div');
    
    // Set proper prose classes for consistent styling
    container.className = 'prose prose-base dark:prose-invert max-w-none';
    
    // Set identifying attributes
    container.setAttribute('data-container-id', containerId);
    container.setAttribute('data-restored-container', 'true');
    
    // Add timestamp for debugging
    container.setAttribute('data-created-at', new Date().toISOString());

    // Find appropriate insertion point in the chat DOM
    const chatContainer = this.findChatContainer();
    const insertionPoint = this.findAppropriateInsertionPoint(chatContainer, containerId);
    
    if (insertionPoint) {
      // Insert before the insertion point
      chatContainer.insertBefore(container, insertionPoint);
      console.log(`✅ Created new container: ${containerId} (inserted before existing element)`);
    } else {
      // Append at the end
      chatContainer.appendChild(container);
      console.log(`✅ Created new container: ${containerId} (appended to end)`);
    }

    return container;
  }

  /**
   * Find the main chat container for inserting new containers
   * Tries multiple selectors to find the appropriate chat container
   */
  private findChatContainer(): HTMLElement {
    // Try multiple possible chat container selectors in order of preference
    const selectors = [
      '.space-y-5',                    // Primary: Flowise chat messages container
      '.max-w-4xl.mx-auto',           // Secondary: Flowise wrapper
      '.flex-1.overflow-y-auto',      // Tertiary: Scrollable container
      '.chat-messages-container',
      '[data-chat-container]',
      '.chat-container',
      '#chat-messages',
      '.messages-container',
      '[role="log"]',
      'main',
      '.main-content'
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          console.log(`📍 Found chat container using selector: ${selector}`);
          return element;
        }
      } catch (error) {
        // Invalid selector, continue
        console.debug(`Invalid selector: ${selector}`);
      }
    }

    // Fallback to body
    console.warn('⚠️ No chat container found, using document.body as fallback');
    return document.body;
  }

  /**
   * Find appropriate insertion point for a new container
   * Tries to maintain chronological order based on container ID timestamps
   * 
   * Requirements: 4.4
   */
  private findAppropriateInsertionPoint(
    chatContainer: HTMLElement, 
    newContainerId: string
  ): HTMLElement | null {
    // Extract timestamp from container ID if it follows the pattern "container-{timestamp}-{random}"
    const newTimestamp = this.extractTimestampFromContainerId(newContainerId);
    
    if (!newTimestamp) {
      // Can't determine order, append at end
      return null;
    }

    // Find all existing containers
    const existingContainers = Array.from(
      chatContainer.querySelectorAll('[data-container-id]')
    ) as HTMLElement[];

    // Find the first container with a later timestamp
    for (const container of existingContainers) {
      const containerId = container.getAttribute('data-container-id');
      if (!containerId) continue;

      const containerTimestamp = this.extractTimestampFromContainerId(containerId);
      if (containerTimestamp && containerTimestamp > newTimestamp) {
        return container;
      }
    }

    // No later container found, append at end
    return null;
  }

  /**
   * Extract timestamp from a container ID
   * Assumes format: "container-{timestamp}-{random}"
   */
  private extractTimestampFromContainerId(containerId: string): number | null {
    const match = containerId.match(/container-(\d+)-/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  /**
   * Create a table wrapper element with proper attributes
   * Requirements: 1.2, 1.3
   * Task 13.1: Enhanced with lazy loading support
   */
  private createTableWrapper(tableData: FlowiseGeneratedTableRecord): HTMLElement {
    // DISABLED: Lazy loading causes infinite loading for restored tables
    // Always use immediate content for restored tables
    const useImmediateContent = true; // Force immediate content
    
    if (this.lazyLoadingEnabled && !useImmediateContent) {
      const placeholder = flowiseTableLazyLoader.createPlaceholder(tableData);
      
      // Observe the placeholder for lazy loading
      flowiseTableLazyLoader.observe(placeholder);
      
      // Force immediate load for restored tables (they're likely already visible)
      // Use setTimeout to ensure the placeholder is in the DOM first
      setTimeout(() => {
        if (placeholder.isConnected && !flowiseTableLazyLoader.isLoaded(tableData.id)) {
          flowiseTableLazyLoader.preload(tableData.id).catch(error => {
            console.error(`❌ Error preloading restored table ${tableData.id}:`, error);
          });
        }
      }, 100);
      
      return placeholder;
    }

    // Fallback: Create wrapper with immediate content
    const wrapper = document.createElement('div');
    wrapper.className = 'overflow-x-auto my-4';
    
    // Add identifying attributes
    wrapper.setAttribute('data-n8n-table', 'true');
    wrapper.setAttribute('data-n8n-keyword', tableData.keyword);
    wrapper.setAttribute('data-table-id', tableData.id);
    wrapper.setAttribute('data-restored', 'true');
    wrapper.setAttribute('data-source', tableData.source);
    wrapper.setAttribute('data-timestamp', tableData.timestamp);

    // Insert the table HTML
    wrapper.innerHTML = tableData.html;

    return wrapper;
  }

  /**
   * Insert a table wrapper at the correct position in the container
   * Requirements: 4.5
   */
  private insertTableAtPosition(
    container: HTMLElement, 
    tableWrapper: HTMLElement, 
    position: number
  ): void {
    const existingTables = Array.from(container.querySelectorAll('[data-n8n-table]'));

    if (position >= existingTables.length) {
      // Append at the end
      container.appendChild(tableWrapper);
    } else {
      // Insert before the element at the specified position
      const referenceElement = existingTables[position];
      container.insertBefore(tableWrapper, referenceElement);
    }
  }

  // ==================
  // PUBLIC API
  // ==================

  /**
   * Manually trigger restoration for current session
   */
  public async restoreCurrentSession(): Promise<void> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No current session to restore');
      return;
    }

    await this.restoreTablesForSession(this.currentSessionId);
  }

  /**
   * Switch to a different session and reload tables
   * Requirements: 9.3 - Handle session navigation and table filtering
   * 
   * @param sessionId - The session ID to switch to
   */
  public async switchSession(sessionId: string): Promise<void> {
    if (!sessionId || sessionId.trim() === '') {
      console.warn('⚠️ Invalid session ID provided');
      return;
    }

    console.log(`🔄 Manually switching session from ${this.currentSessionId} to ${sessionId}`);
    
    // Update current session
    this.currentSessionId = sessionId;
    
    // Clear old tables from DOM
    this.clearRestoredTablesFromDOM();
    
    // Restore tables for new session
    await this.restoreTablesForSession(sessionId);
  }

  /**
   * Get tables for a specific session without restoring to DOM
   * Requirements: 9.3 - Filter tables by sessionId
   * 
   * @param sessionId - The session ID to get tables for
   * @returns Array of table records for the session
   */
  public async getTablesForSession(sessionId: string): Promise<FlowiseGeneratedTableRecord[]> {
    try {
      return await flowiseTableService.restoreSessionTables(sessionId);
    } catch (error) {
      console.error(`❌ Error getting tables for session ${sessionId}:`, error);
      return [];
    }
  }

  /**
   * Clear all retry attempts (useful for testing)
   */
  public clearRetryAttempts(): void {
    this.retryAttempts.clear();
  }

  // ==================
  // LAZY LOADING CONTROL (Task 13.1)
  // ==================

  /**
   * Enable lazy loading for table restoration
   * Requirements: 7.1
   * Task 13.1: Control lazy loading behavior
   */
  public enableLazyLoading(): void {
    this.lazyLoadingEnabled = true;
    console.log('✅ Lazy loading enabled');
  }

  /**
   * Disable lazy loading for table restoration
   * Requirements: 7.1
   * Task 13.1: Control lazy loading behavior
   */
  public disableLazyLoading(): void {
    this.lazyLoadingEnabled = false;
    console.log('✅ Lazy loading disabled');
  }

  /**
   * Check if lazy loading is enabled
   * Task 13.1: Query lazy loading status
   */
  public isLazyLoadingEnabled(): boolean {
    return this.lazyLoadingEnabled;
  }

  /**
   * Preload a specific table (bypass lazy loading)
   * Requirements: 7.1
   * Task 13.1: Preload specific tables
   */
  public async preloadTable(tableId: string): Promise<void> {
    try {
      await flowiseTableLazyLoader.preload(tableId);
      console.log(`✅ Preloaded table: ${tableId}`);
    } catch (error) {
      console.error(`❌ Error preloading table ${tableId}:`, error);
    }
  }

  /**
   * Preload multiple tables
   * Requirements: 7.1
   * Task 13.1: Preload multiple tables
   */
  public async preloadTables(tableIds: string[]): Promise<void> {
    try {
      await flowiseTableLazyLoader.preloadMultiple(tableIds);
      console.log(`✅ Preloaded ${tableIds.length} table(s)`);
    } catch (error) {
      console.error('❌ Error preloading tables:', error);
    }
  }

  /**
   * Get lazy loading statistics
   * Requirements: 7.1
   * Task 13.1: Monitor lazy loading performance
   */
  public getLazyLoadingStats(): {
    totalObserved: number;
    totalLoaded: number;
    pendingLoads: number;
    loadedPercentage: number;
  } {
    return flowiseTableLazyLoader.getStats();
  }

  /**
   * Clear lazy loading cache
   * Task 13.1: Clear lazy loading cache
   */
  public clearLazyLoadingCache(): void {
    flowiseTableLazyLoader.clearCache();
    console.log('✅ Lazy loading cache cleared');
  }

  // ==================
  // ORPHANED TABLE DETECTION (Task 7.3)
  // ==================

  /**
   * Find all orphaned tables (tables without valid sessions)
   * Requirements: 9.5
   * 
   * @returns Array of orphaned table records
   */
  public async findOrphanedTables(): Promise<FlowiseGeneratedTableRecord[]> {
    try {
      return await flowiseTableService.findOrphanedTables();
    } catch (error) {
      console.error('❌ Error finding orphaned tables:', error);
      return [];
    }
  }

  /**
   * Clean up all orphaned tables
   * Requirements: 9.5
   * 
   * @returns Number of tables deleted
   */
  public async cleanupOrphanedTables(): Promise<number> {
    try {
      const deletedCount = await flowiseTableService.cleanupOrphanedTables();
      console.log(`✅ Cleaned up ${deletedCount} orphaned table(s)`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up orphaned tables:', error);
      return 0;
    }
  }

  /**
   * Get statistics about orphaned tables
   * Requirements: 9.5
   * 
   * @returns Statistics about orphaned tables
   */
  public async getOrphanedTableStats(): Promise<{
    totalTables: number;
    orphanedTables: number;
    orphanedBySession: Map<string, number>;
    totalOrphanedSize: number;
  }> {
    try {
      return await flowiseTableService.getOrphanedTableStats();
    } catch (error) {
      console.error('❌ Error getting orphaned table stats:', error);
      return {
        totalTables: 0,
        orphanedTables: 0,
        orphanedBySession: new Map(),
        totalOrphanedSize: 0
      };
    }
  }

  /**
   * Check if a specific table is orphaned
   * Requirements: 9.5
   * 
   * @param tableId - The table ID to check
   * @returns True if the table is orphaned
   */
  public async isTableOrphaned(tableId: string): Promise<boolean> {
    try {
      return await flowiseTableService.isTableOrphaned(tableId);
    } catch (error) {
      console.error('❌ Error checking if table is orphaned:', error);
      return false;
    }
  }

  // ==================
  // TRIGGER_TABLE HANDLING (Task 6.2)
  // ==================

  /**
   * Check if a Trigger_Table should be processed
   * Requirements: 5.3, 5.4, 5.5
   * 
   * This method should be called by Flowise.js before processing a Trigger_Table
   * to avoid duplicate processing and unnecessary n8n calls.
   * 
   * @param triggerTable - The trigger table element
   * @param keyword - The keyword extracted from the trigger table
   * @returns True if the Trigger_Table should be processed, false if it should be skipped
   */
  public async shouldProcessTriggerTable(
    triggerTable: HTMLTableElement,
    keyword: string
  ): Promise<boolean> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, cannot check Trigger_Table status');
      return true; // Allow processing if no session (fallback behavior)
    }

    try {
      // Check 1: Has this specific Trigger_Table already been processed?
      const alreadyProcessed = await flowiseTableService.isTriggerTableProcessed(
        this.currentSessionId,
        triggerTable
      );

      if (alreadyProcessed) {
        console.log(`ℹ️ Trigger_Table already processed, skipping`);
        return false;
      }

      // Check 2: Do Generated_Tables already exist for this keyword?
      const hasGeneratedTables = await flowiseTableService.hasGeneratedTablesForKeyword(
        this.currentSessionId,
        keyword
      );

      if (hasGeneratedTables) {
        console.log(`ℹ️ Generated_Tables already exist for keyword "${keyword}", skipping Trigger_Table processing`);
        
        // Mark this Trigger_Table as processed to avoid future checks
        await flowiseTableService.markTriggerTableAsProcessed(
          this.currentSessionId,
          keyword,
          triggerTable
        );
        
        return false;
      }

      // All checks passed - this Trigger_Table should be processed
      console.log(`✅ Trigger_Table should be processed (keyword: "${keyword}")`);
      return true;

    } catch (error) {
      console.error('❌ Error checking Trigger_Table status:', error);
      return true; // Allow processing on error (fail-safe behavior)
    }
  }

  /**
   * Mark a Trigger_Table as processed after successful n8n processing
   * Requirements: 5.1, 5.2
   * 
   * This method should be called by Flowise.js after successfully processing
   * a Trigger_Table and receiving Generated_Tables from n8n.
   * 
   * @param triggerTable - The trigger table element that was processed
   * @param keyword - The keyword extracted from the trigger table
   */
  public async markTriggerTableProcessed(
    triggerTable: HTMLTableElement,
    keyword: string
  ): Promise<void> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, cannot mark Trigger_Table as processed');
      return;
    }

    try {
      await flowiseTableService.markTriggerTableAsProcessed(
        this.currentSessionId,
        keyword,
        triggerTable
      );
      
      console.log(`✅ Trigger_Table marked as processed (keyword: "${keyword}")`);
    } catch (error) {
      console.error('❌ Error marking Trigger_Table as processed:', error);
    }
  }

  /**
   * Check if Generated_Tables exist for a keyword
   * Requirements: 5.3, 5.4
   * 
   * @param keyword - The keyword to check
   * @returns True if Generated_Tables exist for this keyword
   */
  public async hasGeneratedTablesForKeyword(keyword: string): Promise<boolean> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, cannot check for Generated_Tables');
      return false;
    }

    try {
      return await flowiseTableService.hasGeneratedTablesForKeyword(
        this.currentSessionId,
        keyword
      );
    } catch (error) {
      console.error('❌ Error checking for Generated_Tables:', error);
      return false;
    }
  }

  // ==================
  // MESSAGE LINKING (Task 10.1)
  // ==================

  /**
   * Manually link a table to a specific message
   * Requirements: 10.4
   * 
   * This method allows external code to create a reference link between
   * a table and a message after the table has been saved.
   * 
   * @param tableId - The ID of the table to link
   * @param messageId - The ID of the message to link to
   * @returns True if the link was created successfully
   */
  public async linkTableToMessage(tableId: string, messageId: string): Promise<boolean> {
    try {
      // Get the table record
      const table = await flowiseTableService.getTableById(tableId);
      
      if (!table) {
        console.error(`❌ Table not found: ${tableId}`);
        return false;
      }

      // Update the table with the messageId
      const updatedTable = {
        ...table,
        messageId
      };

      await flowiseTableService.updateTable(updatedTable);
      
      console.log(`✅ Linked table ${tableId} to message ${messageId}`);
      return true;

    } catch (error) {
      console.error('❌ Error linking table to message:', error);
      return false;
    }
  }

  /**
   * Get all tables linked to a specific message
   * Requirements: 10.4
   * 
   * @param messageId - The message ID to get tables for
   * @returns Array of table records linked to the message
   */
  public async getTablesForMessage(messageId: string): Promise<FlowiseGeneratedTableRecord[]> {
    try {
      return await flowiseTableService.getTablesByMessageId(messageId);
    } catch (error) {
      console.error(`❌ Error getting tables for message ${messageId}:`, error);
      return [];
    }
  }

  /**
   * Remove the message link from a table
   * Requirements: 10.4
   * 
   * @param tableId - The ID of the table to unlink
   * @returns True if the link was removed successfully
   */
  public async unlinkTableFromMessage(tableId: string): Promise<boolean> {
    try {
      // Get the table record
      const table = await flowiseTableService.getTableById(tableId);
      
      if (!table) {
        console.error(`❌ Table not found: ${tableId}`);
        return false;
      }

      // Remove the messageId
      const updatedTable = {
        ...table,
        messageId: undefined
      };

      await flowiseTableService.updateTable(updatedTable);
      
      console.log(`✅ Unlinked table ${tableId} from message`);
      return true;

    } catch (error) {
      console.error('❌ Error unlinking table from message:', error);
      return false;
    }
  }

  // ==================
  // TIMELINE ORDERING (Task 10.2)
  // ==================

  /**
   * Get a unified timeline of messages and tables for the current session
   * Requirements: 10.2, 10.3
   * 
   * This provides a chronologically ordered view of all messages and tables,
   * allowing for proper interleaving in the chat interface.
   * 
   * @param messages - Array of messages from the session
   * @returns Chronologically sorted timeline items
   */
  public async getSessionTimeline(messages: any[]): Promise<TimelineItem[]> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, cannot get timeline');
      return [];
    }

    try {
      return await flowiseTimelineService.getSessionTimeline(
        this.currentSessionId,
        messages
      );
    } catch (error) {
      console.error('❌ Error getting session timeline:', error);
      return [];
    }
  }

  /**
   * Get timeline for a specific message and its associated tables
   * Requirements: 10.3, 10.4
   * 
   * @param messageId - The message ID to get timeline for
   * @param messages - Array of messages from the session
   * @returns Timeline items for the message and its tables
   */
  public async getMessageTimeline(
    messageId: string,
    messages: any[]
  ): Promise<TimelineItem[]> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, cannot get message timeline');
      return [];
    }

    try {
      return await flowiseTimelineService.getMessageTimeline(
        messageId,
        this.currentSessionId,
        messages
      );
    } catch (error) {
      console.error(`❌ Error getting timeline for message ${messageId}:`, error);
      return [];
    }
  }

  /**
   * Restore tables in chronological order relative to messages
   * Requirements: 10.2, 10.5
   * 
   * This method restores tables while maintaining chronological order
   * with respect to the messages in the chat.
   * 
   * @param messages - Array of messages from the session
   * @returns Number of tables restored
   */
  public async restoreTablesChronologically(messages: any[]): Promise<number> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, cannot restore tables chronologically');
      return 0;
    }

    try {
      console.log(`🔄 Restoring tables chronologically for session: ${this.currentSessionId}`);

      // Get the unified timeline
      const timeline = await flowiseTimelineService.getSessionTimeline(
        this.currentSessionId,
        messages
      );

      if (timeline.length === 0) {
        console.log(`ℹ️ No timeline items for session ${this.currentSessionId}`);
        return 0;
      }

      // Validate timeline ordering
      const isValid = flowiseTimelineService.validateTimelineOrdering(timeline);
      if (!isValid) {
        console.error('❌ Timeline ordering validation failed');
      }

      // Filter only table items
      const tableItems = timeline.filter(item => item.type === 'table') as TableTimelineItem[];

      if (tableItems.length === 0) {
        console.log(`ℹ️ No tables to restore for session ${this.currentSessionId}`);
        return 0;
      }

      // Restore each table in chronological order
      for (const tableItem of tableItems) {
        // Convert timeline item back to table record for injection
        const tableRecord: FlowiseGeneratedTableRecord = {
          id: tableItem.tableId,
          sessionId: tableItem.sessionId,
          messageId: tableItem.messageId,
          keyword: tableItem.keyword,
          html: tableItem.html,
          fingerprint: '', // Not needed for restoration
          containerId: tableItem.containerId,
          position: tableItem.position,
          timestamp: tableItem.timestamp.toISOString(),
          source: tableItem.source,
          metadata: {
            rowCount: 0,
            colCount: 0,
            headers: [],
            compressed: false
          }
        };

        this.injectTableIntoDOM(tableRecord);
      }

      console.log(`✅ Restored ${tableItems.length} table(s) chronologically for session ${this.currentSessionId}`);

      return tableItems.length;

    } catch (error) {
      console.error('❌ Error restoring tables chronologically:', error);
      return 0;
    }
  }

  /**
   * Get timeline statistics for the current session
   * Requirements: 10.2
   * 
   * @param messages - Array of messages from the session
   * @returns Timeline statistics
   */
  public async getTimelineStats(messages: any[]): Promise<{
    totalItems: number;
    messageCount: number;
    tableCount: number;
    startTime: Date | null;
    endTime: Date | null;
    duration: number;
    tablesLinkedToMessages: number;
    tablesWithoutMessages: number;
  }> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, cannot get timeline stats');
      return {
        totalItems: 0,
        messageCount: 0,
        tableCount: 0,
        startTime: null,
        endTime: null,
        duration: 0,
        tablesLinkedToMessages: 0,
        tablesWithoutMessages: 0
      };
    }

    try {
      const timeline = await flowiseTimelineService.getSessionTimeline(
        this.currentSessionId,
        messages
      );

      return flowiseTimelineService.getTimelineStats(timeline);

    } catch (error) {
      console.error('❌ Error getting timeline stats:', error);
      return {
        totalItems: 0,
        messageCount: 0,
        tableCount: 0,
        startTime: null,
        endTime: null,
        duration: 0,
        tablesLinkedToMessages: 0,
        tablesWithoutMessages: 0
      };
    }
  }

  /**
   * Export the session timeline to a structured format
   * Requirements: 10.2, 10.3
   * 
   * @param messages - Array of messages from the session
   * @returns Exported timeline data
   */
  public async exportTimeline(messages: any[]): Promise<any> {
    if (!this.currentSessionId) {
      console.warn('⚠️ No active session, cannot export timeline');
      return null;
    }

    try {
      const timeline = await flowiseTimelineService.getSessionTimeline(
        this.currentSessionId,
        messages
      );

      return flowiseTimelineService.exportTimeline(timeline);

    } catch (error) {
      console.error('❌ Error exporting timeline:', error);
      return null;
    }
  }
}

// Export singleton instance
// The bridge initializes immediately and handles DOMContentLoaded internally
// Requirements: 1.2, 4.1, 4.2
export const flowiseTableBridge = new FlowiseTableBridge();

console.log('✅ FlowiseTableBridge singleton created and initialized');
