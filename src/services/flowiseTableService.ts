/**
 * FlowiseTableService
 * 
 * Service for persisting and restoring Flowise-generated tables in IndexedDB.
 * Handles table fingerprinting, compression, duplicate detection, and restoration.
 */

import { indexedDBService } from './indexedDB';
import { flowiseTableCache } from './flowiseTableCache';
import type {
  FlowiseGeneratedTableRecord,
  FlowiseTableSource,
  FlowiseTableMetadata
} from '../types/flowise_table_types';

// Compression library - using lz-string for efficient string compression
import LZString from 'lz-string';

/**
 * Log levels for diagnostic logging
 * Requirements: 8.5
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Log entry interface
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  sessionId?: string;
}

export class FlowiseTableService {
  private readonly TABLES_STORE = 'clara_generated_tables';
  private readonly COMPRESSION_THRESHOLD = 50 * 1024; // 50KB
  private readonly MAX_LOG_ENTRIES = 1000; // Keep last 1000 log entries
  private logEntries: LogEntry[] = [];
  private loggingEnabled = true;
  private cachingEnabled = true; // Task 13.3: Enable caching by default

  /**
   * Generate a unique fingerprint for a table based on its complete content
   * This ensures tables with the same keyword but different data get different fingerprints
   */
  generateTableFingerprint(tableElement: HTMLTableElement): string {
    const headers = this.extractHeaders(tableElement);
    const rows = this.extractAllRows(tableElement);
    const structure = {
      rowCount: tableElement.querySelectorAll('tr').length,
      colCount: tableElement.querySelector('tr')?.children.length || 0
    };

    // Create a signature from all table data
    const data = {
      headers,
      rows,
      structure
    };

    const signature = JSON.stringify(data);
    
    // Calculate SHA-256 hash
    return this.sha256(signature);
  }

  /**
   * Extract all column headers from a table
   */
  private extractHeaders(table: HTMLTableElement): string[] {
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (!headerRow) return [];

    return Array.from(headerRow.querySelectorAll('th, td'))
      .map(cell => cell.textContent?.trim() || '');
  }

  /**
   * Extract all row data from a table
   */
  private extractAllRows(table: HTMLTableElement): string[][] {
    const rows = table.querySelectorAll('tbody tr, tr');
    return Array.from(rows).map(row =>
      Array.from(row.querySelectorAll('td, th'))
        .map(cell => cell.textContent?.trim() || '')
    );
  }

  /**
   * Calculate SHA-256-like hash of a string
   * Uses a fast, deterministic hash function suitable for fingerprinting
   */
  private sha256(message: string): string {
    // FNV-1a hash algorithm - fast and good distribution
    let hash = 2166136261; // FNV offset basis
    
    for (let i = 0; i < message.length; i++) {
      hash ^= message.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    
    // Convert to positive hex string
    const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
    
    // Create a longer hash by processing the string in chunks
    let extendedHash = hashHex;
    const chunkSize = Math.ceil(message.length / 4);
    
    for (let i = 1; i < 4; i++) {
      const chunk = message.substring(i * chunkSize, (i + 1) * chunkSize);
      let chunkHash = 2166136261;
      for (let j = 0; j < chunk.length; j++) {
        chunkHash ^= chunk.charCodeAt(j);
        chunkHash += (chunkHash << 1) + (chunkHash << 4) + (chunkHash << 7) + (chunkHash << 8) + (chunkHash << 24);
      }
      extendedHash += (chunkHash >>> 0).toString(16).padStart(8, '0');
    }
    
    return extendedHash;
  }

  /**
   * Extract metadata from a table element
   */
  private extractTableMetadata(tableElement: HTMLTableElement, html: string): FlowiseTableMetadata {
    const rows = tableElement.querySelectorAll('tr');
    const firstRow = tableElement.querySelector('tr');
    const colCount = firstRow ? firstRow.children.length : 0;

    return {
      rowCount: rows.length,
      colCount,
      headers: this.extractHeaders(tableElement),
      compressed: false,
      originalSize: html.length
    };
  }

  /**
   * Compress HTML content if it exceeds the threshold
   */
  compressHTML(html: string): string {
    try {
      return LZString.compressToUTF16(html);
    } catch (error) {
      console.error('Error compressing HTML:', error);
      return html;
    }
  }

  /**
   * Decompress HTML content
   */
  decompressHTML(compressed: string): string {
    try {
      const decompressed = LZString.decompressFromUTF16(compressed);
      return decompressed || compressed;
    } catch (error) {
      console.error('Error decompressing HTML:', error);
      return compressed;
    }
  }

  /**
   * Check if a table with the same fingerprint already exists in the session
   */
  async tableExists(sessionId: string, fingerprint: string): Promise<boolean> {
    try {
      return await indexedDBService.generatedTableExists(sessionId, fingerprint);
    } catch (error) {
      console.error('Error checking table existence:', error);
      return false;
    }
  }

  /**
   * Save a generated table to IndexedDB
   * Task 11.2: Enhanced with storage error handling
   */
  async saveGeneratedTable(
    sessionId: string,
    tableElement: HTMLTableElement,
    keyword: string,
    source: FlowiseTableSource,
    messageId?: string,
    forceUpdate: boolean = false
  ): Promise<string> {
    try {
      // Generate fingerprint
      const fingerprint = this.generateTableFingerprint(tableElement);

      // Check for duplicates (skip if forceUpdate is true)
      if (!forceUpdate) {
        const exists = await this.tableExists(sessionId, fingerprint);
        if (exists) {
          console.log('ℹ️ Table with same fingerprint already exists, skipping save');
          return '';
        }
      }

      // Check storage limits before saving (Task 8.1, 8.3)
      // Enforce size limits (max tables and max storage size)
      await this.enforceStorageLimits(sessionId);
      
      // Check quota threshold
      const quotaInfo = await this.checkStorageQuota();
      if (quotaInfo.percentage >= this.QUOTA_THRESHOLD) {
        console.warn(`⚠️ Storage quota at ${(quotaInfo.percentage * 100).toFixed(1)}%, performing cleanup...`);
        await this.performAutomaticCleanup(sessionId);
      }

      // Get HTML content
      let html = tableElement.outerHTML;
      const originalSize = html.length;

      // Extract metadata
      const metadata = this.extractTableMetadata(tableElement, html);

      // Compress if needed
      if (originalSize > this.COMPRESSION_THRESHOLD) {
        html = this.compressHTML(html);
        metadata.compressed = true;
        metadata.originalSize = originalSize;
        console.log(`🗜️ Compressed table from ${originalSize} to ${html.length} bytes`);
      }

      // Detect container and position
      const container = tableElement.closest('[data-container-id]') as HTMLElement;
      const containerId = container?.getAttribute('data-container-id') || this.generateContainerId();
      const position = this.detectTablePosition(tableElement, container);

      // Create table record
      const tableRecord: FlowiseGeneratedTableRecord = {
        id: this.generateUUID(),
        sessionId,
        messageId,
        keyword,
        html,
        fingerprint,
        containerId,
        position,
        timestamp: new Date().toISOString(),
        source,
        metadata,
        user_id: await this.getCurrentUserId(),
        tableType: 'generated', // Mark as generated table
        processed: false // Not a processed trigger table
      };

      // Save to IndexedDB with storage error handling
      // Task 11.2: Catch QuotaExceededError and trigger cleanup
      try {
        await indexedDBService.putGeneratedTable(tableRecord);
        console.log(`✅ Table saved: ${tableRecord.id} (keyword: ${keyword}, fingerprint: ${fingerprint.substring(0, 8)}...)`);
        return tableRecord.id;
      } catch (saveError: any) {
        // Handle QuotaExceededError specifically
        if (this.isQuotaExceededError(saveError)) {
          console.error('❌ Storage quota exceeded, attempting cleanup and retry...');
          
          // Log storage error for monitoring
          this.logStorageError('QuotaExceededError', saveError, {
            sessionId,
            keyword,
            tableSize: html.length,
            compressed: metadata.compressed
          });

          // Perform aggressive cleanup
          await this.performAutomaticCleanup(sessionId);

          // Retry save operation after cleanup
          try {
            await indexedDBService.putGeneratedTable(tableRecord);
            console.log(`✅ Table saved after cleanup: ${tableRecord.id}`);
            return tableRecord.id;
          } catch (retryError) {
            console.error('❌ Failed to save table even after cleanup:', retryError);
            
            // Log retry failure
            this.logStorageError('QuotaExceededError_RetryFailed', retryError, {
              sessionId,
              keyword,
              tableSize: html.length
            });

            throw new Error(`Storage quota exceeded and cleanup failed: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`);
          }
        } else {
          // Other storage errors
          console.error('❌ Storage error (not quota):', saveError);
          
          // Log storage error for monitoring
          this.logStorageError('StorageError', saveError, {
            sessionId,
            keyword,
            tableSize: html.length
          });

          throw saveError;
        }
      }
    } catch (error) {
      console.error('❌ Error saving generated table:', error);
      throw error;
    }
  }

  /**
   * Check if an error is a QuotaExceededError
   * Task 11.2: Detect quota exceeded errors
   * 
   * @param error - The error to check
   * @returns True if the error is a QuotaExceededError
   */
  private isQuotaExceededError(error: any): boolean {
    if (!error) return false;

    // Check error name
    if (error.name === 'QuotaExceededError') return true;

    // Check DOMException code (22 = QUOTA_EXCEEDED_ERR)
    if (error instanceof DOMException && error.code === 22) return true;

    // Check error message for quota-related keywords
    const message = error.message || error.toString() || '';
    const quotaKeywords = [
      'quota',
      'exceeded',
      'storage',
      'full',
      'limit',
      'space'
    ];

    return quotaKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  /**
   * Log storage errors for monitoring
   * Task 11.2: Log storage errors for monitoring
   * Requirements: 7.2
   * 
   * @param errorType - Type of storage error
   * @param error - The error object
   * @param context - Additional context about the error
   */
  private logStorageError(errorType: string, error: any, context?: any): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      errorType,
      errorName: error?.name || 'Unknown',
      errorMessage: error?.message || error?.toString() || 'No message',
      errorCode: error?.code,
      context,
      stackTrace: error?.stack
    };

    // Store in session storage for debugging
    try {
      const existingLogs = sessionStorage.getItem('flowise_storage_errors');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(errorLog);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      sessionStorage.setItem('flowise_storage_errors', JSON.stringify(logs));
    } catch (storageError) {
      console.debug('Could not store error log:', storageError);
    }

    // Also log using the service's logging system
    this.log(LogLevel.ERROR, `Storage error: ${errorType}`, errorLog);
  }

  /**
   * Get storage error logs for diagnostics
   * Task 11.2: Provide access to storage error logs
   * Requirements: 7.2
   * 
   * @returns Array of storage error logs
   */
  public getStorageErrorLogs(): any[] {
    try {
      const logs = sessionStorage.getItem('flowise_storage_errors');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving storage error logs:', error);
      return [];
    }
  }

  /**
   * Clear storage error logs
   * Task 11.2: Clear error logs
   */
  public clearStorageErrorLogs(): void {
    try {
      sessionStorage.removeItem('flowise_storage_errors');
      console.log('✅ Storage error logs cleared');
    } catch (error) {
      console.error('Error clearing storage error logs:', error);
    }
  }

  /**
   * Restore all tables for a specific session
   * Excludes processed Trigger_Tables from restoration
   * Requirements: 5.2
   */
  async restoreSessionTables(sessionId: string): Promise<FlowiseGeneratedTableRecord[]> {
    try {
      // Get only restorable tables (excludes processed Trigger_Tables)
      const tables = await this.getRestorableTables(sessionId);

      // Decompress HTML if needed
      const restoredTables = tables.map(table => {
        if (table.metadata.compressed) {
          return {
            ...table,
            html: this.decompressHTML(table.html)
          };
        }
        return table;
      });

      // Sort by timestamp (chronological order)
      restoredTables.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      console.log(`✅ Restored ${restoredTables.length} table(s) for session ${sessionId}`);

      return restoredTables;
    } catch (error) {
      console.error('❌ Error restoring session tables:', error);
      throw error;
    }
  }

  /**
   * Delete all tables for a specific session (cascade delete)
   */
  async deleteSessionTables(sessionId: string): Promise<number> {
    try {
      const deletedCount = await indexedDBService.deleteGeneratedTablesBySession(sessionId);
      console.log(`🗑️ Deleted ${deletedCount} table(s) for session ${sessionId}`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error deleting session tables:', error);
      throw error;
    }
  }

  /**
   * Get all tables (for diagnostics)
   */
  async getAllTables(): Promise<FlowiseGeneratedTableRecord[]> {
    try {
      return await indexedDBService.getAllGeneratedTables<FlowiseGeneratedTableRecord>();
    } catch (error) {
      console.error('❌ Error getting all tables:', error);
      throw error;
    }
  }

  /**
   * Get a specific table by ID
   * Requirements: 10.4
   * Task 13.3: Enhanced with caching
   */
  async getTableById(tableId: string): Promise<FlowiseGeneratedTableRecord | null> {
    try {
      // Task 13.3: Check cache first
      if (this.cachingEnabled) {
        const cached = flowiseTableCache.get(tableId);
        if (cached) {
          return cached;
        }
      }

      // Cache miss - fetch from IndexedDB
      const table = await indexedDBService.get<FlowiseGeneratedTableRecord>(this.TABLES_STORE, tableId);
      
      // Task 13.3: Cache the result
      if (table && this.cachingEnabled) {
        flowiseTableCache.set(tableId, table);
      }

      return table || null;
    } catch (error) {
      console.error(`❌ Error getting table ${tableId}:`, error);
      return null;
    }
  }

  /**
   * Update a table record
   * Requirements: 10.4
   * Task 13.3: Enhanced with cache invalidation
   */
  async updateTable(table: FlowiseGeneratedTableRecord): Promise<void> {
    try {
      await indexedDBService.putGeneratedTable(table);
      
      // Task 13.3: Invalidate cache on update
      if (this.cachingEnabled) {
        flowiseTableCache.invalidate(table.id);
      }

      console.log(`✅ Updated table ${table.id}`);
    } catch (error) {
      console.error(`❌ Error updating table ${table.id}:`, error);
      throw error;
    }
  }

  /**
   * Get all tables linked to a specific message
   * Requirements: 10.4
   */
  async getTablesByMessageId(messageId: string): Promise<FlowiseGeneratedTableRecord[]> {
    try {
      const allTables = await this.getAllTables();
      const tablesForMessage = allTables.filter(table => table.messageId === messageId);
      
      // Sort by timestamp (chronological order)
      tablesForMessage.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      console.log(`📋 Found ${tablesForMessage.length} table(s) for message ${messageId}`);
      return tablesForMessage;
    } catch (error) {
      console.error(`❌ Error getting tables for message ${messageId}:`, error);
      return [];
    }
  }

  /**
   * Delete a specific table by ID
   * Task 13.3: Enhanced with cache invalidation
   */
  async deleteTable(tableId: string): Promise<void> {
    try {
      await indexedDBService.deleteGeneratedTable(tableId);
      
      // Task 13.3: Invalidate cache on delete
      if (this.cachingEnabled) {
        flowiseTableCache.invalidate(tableId);
      }

      console.log(`🗑️ Deleted table ${tableId}`);
    } catch (error) {
      console.error('❌ Error deleting table:', error);
      throw error;
    }
  }

  /**
   * Clear all tables (for testing/debugging)
   */
  async clearAllTables(): Promise<void> {
    try {
      await indexedDBService.clearGeneratedTables();
      console.log('🗑️ Cleared all generated tables');
    } catch (error) {
      console.error('❌ Error clearing tables:', error);
      throw error;
    }
  }

  // ==================
  // ORPHANED TABLE DETECTION (Task 7.3)
  // ==================

  /**
   * Find all orphaned tables (tables with sessionIds that don't exist in clara_sessions)
   * Requirements: 9.5
   * 
   * @returns Array of orphaned table records
   */
  async findOrphanedTables(): Promise<FlowiseGeneratedTableRecord[]> {
    try {
      // Get all generated tables
      const allTables = await indexedDBService.getAllGeneratedTables<FlowiseGeneratedTableRecord>();
      
      // Get all valid session IDs
      const allSessions = await indexedDBService.getAll<any>('clara_sessions');
      const validSessionIds = new Set(allSessions.map(s => s.id));

      // Filter tables that don't have a valid session
      const orphanedTables = allTables.filter(table => !validSessionIds.has(table.sessionId));

      console.log(`🔍 Found ${orphanedTables.length} orphaned table(s) out of ${allTables.length} total`);

      return orphanedTables;
    } catch (error) {
      console.error('❌ Error finding orphaned tables:', error);
      throw error;
    }
  }

  /**
   * Check if a specific table is orphaned
   * Requirements: 9.5
   * 
   * @param tableId - The table ID to check
   * @returns True if the table is orphaned
   */
  async isTableOrphaned(tableId: string): Promise<boolean> {
    try {
      // Get the table
      const table = await indexedDBService.get<FlowiseGeneratedTableRecord>('clara_generated_tables', tableId);
      
      if (!table) {
        console.warn(`⚠️ Table ${tableId} not found`);
        return false;
      }

      // Check if the session exists
      const session = await indexedDBService.get<any>('clara_sessions', table.sessionId);
      
      return !session;
    } catch (error) {
      console.error('❌ Error checking if table is orphaned:', error);
      return false;
    }
  }

  /**
   * Clean up all orphaned tables
   * Requirements: 9.5
   * 
   * @returns Number of tables deleted
   */
  async cleanupOrphanedTables(): Promise<number> {
    try {
      const orphanedTables = await this.findOrphanedTables();
      
      if (orphanedTables.length === 0) {
        console.log('✅ No orphaned tables to clean up');
        return 0;
      }

      console.log(`🧹 Cleaning up ${orphanedTables.length} orphaned table(s)...`);

      // Delete each orphaned table
      for (const table of orphanedTables) {
        await indexedDBService.deleteGeneratedTable(table.id);
        console.log(`🗑️ Deleted orphaned table: ${table.id} (session: ${table.sessionId})`);
      }

      console.log(`✅ Cleaned up ${orphanedTables.length} orphaned table(s)`);

      return orphanedTables.length;
    } catch (error) {
      console.error('❌ Error cleaning up orphaned tables:', error);
      throw error;
    }
  }

  /**
   * Get statistics about orphaned tables
   * Requirements: 9.5
   * 
   * @returns Statistics about orphaned tables
   */
  async getOrphanedTableStats(): Promise<{
    totalTables: number;
    orphanedTables: number;
    orphanedBySession: Map<string, number>;
    totalOrphanedSize: number;
  }> {
    try {
      const allTables = await indexedDBService.getAllGeneratedTables<FlowiseGeneratedTableRecord>();
      const orphanedTables = await this.findOrphanedTables();

      // Group orphaned tables by session
      const orphanedBySession = new Map<string, number>();
      let totalOrphanedSize = 0;

      for (const table of orphanedTables) {
        const count = orphanedBySession.get(table.sessionId) || 0;
        orphanedBySession.set(table.sessionId, count + 1);
        
        // Calculate size (HTML + metadata)
        totalOrphanedSize += table.html.length;
      }

      return {
        totalTables: allTables.length,
        orphanedTables: orphanedTables.length,
        orphanedBySession,
        totalOrphanedSize
      };
    } catch (error) {
      console.error('❌ Error getting orphaned table stats:', error);
      throw error;
    }
  }

  // ==================
  // TRIGGER_TABLE HANDLING (Task 6.2)
  // ==================

  /**
   * Mark a Trigger_Table as processed
   * Requirements: 5.1, 5.2
   * 
   * @param sessionId - The session ID
   * @param keyword - The keyword from the Trigger_Table
   * @param tableElement - The trigger table element
   * @returns The ID of the saved trigger table record
   */
  async markTriggerTableAsProcessed(
    sessionId: string,
    keyword: string,
    tableElement: HTMLTableElement
  ): Promise<string> {
    try {
      // Generate fingerprint for the trigger table
      const fingerprint = this.generateTableFingerprint(tableElement);

      // Check if this trigger table is already marked as processed
      const exists = await this.tableExists(sessionId, fingerprint);
      if (exists) {
        console.log(`ℹ️ Trigger_Table already marked as processed (fingerprint: ${fingerprint.substring(0, 8)}...)`);
        return '';
      }

      // Get HTML content
      const html = tableElement.outerHTML;

      // Extract metadata
      const metadata = this.extractTableMetadata(tableElement, html);

      // Detect container and position
      const container = tableElement.closest('[data-container-id]') as HTMLElement;
      const containerId = container?.getAttribute('data-container-id') || this.generateContainerId();
      const position = this.detectTablePosition(tableElement, container);

      // Create trigger table record
      const tableRecord: FlowiseGeneratedTableRecord = {
        id: this.generateUUID(),
        sessionId,
        keyword,
        html,
        fingerprint,
        containerId,
        position,
        timestamp: new Date().toISOString(),
        source: 'n8n', // Trigger tables come from user input
        metadata,
        user_id: await this.getCurrentUserId(),
        tableType: 'trigger',
        processed: true
      };

      // Save to IndexedDB
      await indexedDBService.putGeneratedTable(tableRecord);

      console.log(`✅ Trigger_Table marked as processed: ${tableRecord.id} (keyword: ${keyword})`);

      return tableRecord.id;
    } catch (error) {
      console.error('❌ Error marking Trigger_Table as processed:', error);
      throw error;
    }
  }

  /**
   * Check if Generated_Tables exist for a given keyword in a session
   * Requirements: 5.3, 5.4
   * 
   * This helps avoid reprocessing Trigger_Tables when Generated_Tables already exist
   * 
   * @param sessionId - The session ID
   * @param keyword - The keyword to check
   * @returns True if Generated_Tables exist for this keyword
   */
  async hasGeneratedTablesForKeyword(sessionId: string, keyword: string): Promise<boolean> {
    try {
      const tables = await indexedDBService.getGeneratedTablesBySession<FlowiseGeneratedTableRecord>(sessionId);
      
      // Check if any Generated_Tables exist with this keyword
      const generatedTables = tables.filter(table => 
        table.keyword === keyword && 
        table.tableType === 'generated'
      );

      const exists = generatedTables.length > 0;
      
      if (exists) {
        console.log(`ℹ️ Found ${generatedTables.length} Generated_Table(s) for keyword "${keyword}"`);
      }

      return exists;
    } catch (error) {
      console.error('❌ Error checking for Generated_Tables:', error);
      return false;
    }
  }

  /**
   * Check if a Trigger_Table has already been processed
   * Requirements: 5.3, 5.4
   * 
   * @param sessionId - The session ID
   * @param tableElement - The trigger table element
   * @returns True if this Trigger_Table has been processed
   */
  async isTriggerTableProcessed(sessionId: string, tableElement: HTMLTableElement): Promise<boolean> {
    try {
      const fingerprint = this.generateTableFingerprint(tableElement);
      
      // Check if a processed trigger table with this fingerprint exists
      const tables = await indexedDBService.getGeneratedTablesBySession<FlowiseGeneratedTableRecord>(sessionId);
      
      const processedTrigger = tables.find(table => 
        table.fingerprint === fingerprint && 
        table.tableType === 'trigger' && 
        table.processed === true
      );

      return !!processedTrigger;
    } catch (error) {
      console.error('❌ Error checking if Trigger_Table is processed:', error);
      return false;
    }
  }

  /**
   * Get all non-processed tables for restoration
   * Excludes processed Trigger_Tables from restoration
   * Requirements: 5.2
   * 
   * @param sessionId - The session ID
   * @returns Array of tables that should be restored (excludes processed Trigger_Tables)
   */
  async getRestorableTables(sessionId: string): Promise<FlowiseGeneratedTableRecord[]> {
    try {
      const allTables = await indexedDBService.getGeneratedTablesBySession<FlowiseGeneratedTableRecord>(sessionId);

      // Filter out processed Trigger_Tables
      const restorableTables = allTables.filter(table => {
        // Exclude processed Trigger_Tables
        if (table.tableType === 'trigger' && table.processed === true) {
          return false;
        }
        // Include all Generated_Tables and unprocessed Trigger_Tables
        return true;
      });

      console.log(`📋 Found ${restorableTables.length} restorable table(s) (excluded ${allTables.length - restorableTables.length} processed Trigger_Tables)`);

      return restorableTables;
    } catch (error) {
      console.error('❌ Error getting restorable tables:', error);
      throw error;
    }
  }

  // ==================
  // STORAGE OPTIMIZATION (Task 8)
  // ==================

  private readonly QUOTA_THRESHOLD = 0.8; // 80% of quota
  private readonly MAX_TABLES_PER_USER = 500;
  private readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50 MB
  private readonly CLEANUP_PERCENTAGE = 0.2; // Delete 20% of eligible tables

  /**
   * Check storage usage and return quota information
   * Requirements: 7.2
   * 
   * @returns Storage quota information
   */
  async checkStorageQuota(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
    available: number;
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? usage / quota : 0;
        const available = quota - usage;

        console.log(`📊 Storage: ${(usage / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024).toFixed(2)} MB (${(percentage * 100).toFixed(1)}%)`);

        return { usage, quota, percentage, available };
      } else {
        console.warn('⚠️ Storage API not available');
        return { usage: 0, quota: 0, percentage: 0, available: 0 };
      }
    } catch (error) {
      console.error('❌ Error checking storage quota:', error);
      return { usage: 0, quota: 0, percentage: 0, available: 0 };
    }
  }

  /**
   * Check if storage quota is approaching the threshold
   * Requirements: 7.2
   * 
   * @returns True if cleanup is needed
   */
  async isCleanupNeeded(): Promise<boolean> {
    const { percentage } = await this.checkStorageQuota();
    return percentage >= this.QUOTA_THRESHOLD;
  }

  /**
   * Get storage statistics for tables
   * Requirements: 7.2
   * 
   * @returns Storage statistics
   */
  async getTableStorageStats(): Promise<{
    totalTables: number;
    totalSize: number;
    averageSize: number;
    compressedTables: number;
    cachedTables: number;
    errorTables: number;
    tablesBySession: Map<string, number>;
  }> {
    try {
      const allTables = await this.getAllTables();
      
      let totalSize = 0;
      let compressedTables = 0;
      let cachedTables = 0;
      let errorTables = 0;
      const tablesBySession = new Map<string, number>();

      for (const table of allTables) {
        totalSize += table.html.length;
        
        if (table.metadata.compressed) {
          compressedTables++;
        }
        
        if (table.source === 'cached') {
          cachedTables++;
        }
        
        if (table.source === 'error') {
          errorTables++;
        }

        const count = tablesBySession.get(table.sessionId) || 0;
        tablesBySession.set(table.sessionId, count + 1);
      }

      const averageSize = allTables.length > 0 ? totalSize / allTables.length : 0;

      return {
        totalTables: allTables.length,
        totalSize,
        averageSize,
        compressedTables,
        cachedTables,
        errorTables,
        tablesBySession
      };
    } catch (error) {
      console.error('❌ Error getting table storage stats:', error);
      throw error;
    }
  }

  /**
   * Perform automatic cleanup when storage quota is exceeded
   * Requirements: 7.2, 7.3, 7.4
   * 
   * @param activeSessionId - The current active session to preserve
   * @returns Number of tables deleted
   */
  async performAutomaticCleanup(activeSessionId?: string): Promise<number> {
    try {
      console.log('🧹 Starting automatic storage cleanup...');

      const allTables = await this.getAllTables();
      
      // Filter out tables from active session
      let eligibleTables = allTables.filter(table => 
        !activeSessionId || table.sessionId !== activeSessionId
      );

      if (eligibleTables.length === 0) {
        console.log('ℹ️ No eligible tables for cleanup');
        return 0;
      }

      // Sort by priority: cached and error tables first, then by timestamp (oldest first)
      eligibleTables.sort((a, b) => {
        // Priority 1: Cached tables
        if (a.source === 'cached' && b.source !== 'cached') return -1;
        if (a.source !== 'cached' && b.source === 'cached') return 1;
        
        // Priority 2: Error tables
        if (a.source === 'error' && b.source !== 'error') return -1;
        if (a.source !== 'error' && b.source === 'error') return 1;
        
        // Priority 3: Oldest first
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      // Delete oldest 20% of eligible tables
      const toDelete = Math.ceil(eligibleTables.length * this.CLEANUP_PERCENTAGE);
      const tablesToDelete = eligibleTables.slice(0, toDelete);

      console.log(`🗑️ Deleting ${toDelete} table(s) out of ${eligibleTables.length} eligible...`);

      for (const table of tablesToDelete) {
        await this.deleteTable(table.id);
        console.log(`🗑️ Deleted table: ${table.id} (source: ${table.source}, age: ${this.getTableAge(table.timestamp)})`);
      }

      console.log(`✅ Automatic cleanup complete: ${toDelete} table(s) deleted`);

      return toDelete;
    } catch (error) {
      console.error('❌ Error performing automatic cleanup:', error);
      throw error;
    }
  }

  /**
   * Check and enforce storage limits
   * Requirements: 7.5
   * 
   * Enforces:
   * - Maximum 500 tables per user
   * - Maximum 50MB total storage per user
   * - Triggers cleanup when limits are approached (90% threshold)
   * 
   * @param activeSessionId - The current active session to preserve
   * @returns True if limits are within acceptable range
   */
  async enforceStorageLimits(activeSessionId?: string): Promise<boolean> {
    try {
      const stats = await this.getTableStorageStats();

      let cleanupPerformed = false;
      const reasons: string[] = [];

      // Check table count limit (trigger cleanup at 90% = 450 tables)
      const tableCountThreshold = Math.floor(this.MAX_TABLES_PER_USER * 0.9);
      if (stats.totalTables >= tableCountThreshold) {
        const percentage = (stats.totalTables / this.MAX_TABLES_PER_USER * 100).toFixed(1);
        console.warn(`⚠️ Table count approaching limit: ${stats.totalTables} / ${this.MAX_TABLES_PER_USER} (${percentage}%)`);
        reasons.push(`table count: ${stats.totalTables}/${this.MAX_TABLES_PER_USER}`);
        cleanupPerformed = true;
      }

      // Check storage size limit (trigger cleanup at 90% = 45MB)
      const storageSizeThreshold = Math.floor(this.MAX_STORAGE_SIZE * 0.9);
      if (stats.totalSize >= storageSizeThreshold) {
        const percentage = (stats.totalSize / this.MAX_STORAGE_SIZE * 100).toFixed(1);
        console.warn(`⚠️ Storage size approaching limit: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB / ${(this.MAX_STORAGE_SIZE / 1024 / 1024).toFixed(2)} MB (${percentage}%)`);
        reasons.push(`storage size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB/${(this.MAX_STORAGE_SIZE / 1024 / 1024).toFixed(2)}MB`);
        cleanupPerformed = true;
      }

      // Check quota threshold (80%)
      const quotaInfo = await this.checkStorageQuota();
      if (quotaInfo.percentage >= this.QUOTA_THRESHOLD) {
        console.warn(`⚠️ Storage quota threshold reached: ${(quotaInfo.percentage * 100).toFixed(1)}%`);
        reasons.push(`quota: ${(quotaInfo.percentage * 100).toFixed(1)}%`);
        cleanupPerformed = true;
      }

      // Perform cleanup if any limit is approached
      if (cleanupPerformed) {
        console.log(`🧹 Triggering cleanup due to: ${reasons.join(', ')}`);
        const deletedCount = await this.performAutomaticCleanup(activeSessionId);
        console.log(`✅ Cleanup complete: ${deletedCount} table(s) deleted`);
        
        // Verify limits after cleanup
        const newStats = await this.getTableStorageStats();
        console.log(`📊 After cleanup: ${newStats.totalTables} tables, ${(newStats.totalSize / 1024 / 1024).toFixed(2)} MB`);
      } else {
        console.log(`✅ Storage limits OK: ${stats.totalTables}/${this.MAX_TABLES_PER_USER} tables, ${(stats.totalSize / 1024 / 1024).toFixed(2)}/${(this.MAX_STORAGE_SIZE / 1024 / 1024).toFixed(2)} MB`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error enforcing storage limits:', error);
      return false;
    }
  }

  /**
   * Check if storage limits are being approached
   * Requirements: 7.5
   * 
   * @returns Object with limit status information
   */
  async checkStorageLimits(): Promise<{
    tableCount: { current: number; max: number; percentage: number; approaching: boolean };
    storageSize: { current: number; max: number; percentage: number; approaching: boolean };
    quota: { percentage: number; approaching: boolean };
    needsCleanup: boolean;
  }> {
    try {
      const stats = await this.getTableStorageStats();
      const quotaInfo = await this.checkStorageQuota();

      const tableCountPercentage = (stats.totalTables / this.MAX_TABLES_PER_USER) * 100;
      const storageSizePercentage = (stats.totalSize / this.MAX_STORAGE_SIZE) * 100;
      const quotaPercentage = quotaInfo.percentage * 100;

      const tableCountApproaching = tableCountPercentage >= 90;
      const storageSizeApproaching = storageSizePercentage >= 90;
      const quotaApproaching = quotaPercentage >= 80;

      return {
        tableCount: {
          current: stats.totalTables,
          max: this.MAX_TABLES_PER_USER,
          percentage: tableCountPercentage,
          approaching: tableCountApproaching
        },
        storageSize: {
          current: stats.totalSize,
          max: this.MAX_STORAGE_SIZE,
          percentage: storageSizePercentage,
          approaching: storageSizeApproaching
        },
        quota: {
          percentage: quotaPercentage,
          approaching: quotaApproaching
        },
        needsCleanup: tableCountApproaching || storageSizeApproaching || quotaApproaching
      };
    } catch (error) {
      console.error('❌ Error checking storage limits:', error);
      throw error;
    }
  }

  /**
   * Manual cleanup API for users
   * Requirements: 7.4
   * 
   * @param options - Cleanup options
   * @returns Number of tables deleted
   */
  async manualCleanup(options: {
    olderThanDays?: number;
    sources?: FlowiseTableSource[];
    excludeSessionIds?: string[];
    maxTablesToDelete?: number;
  } = {}): Promise<number> {
    try {
      console.log('🧹 Starting manual cleanup with options:', options);

      const allTables = await this.getAllTables();
      
      // Apply filters
      let eligibleTables = allTables.filter(table => {
        // Filter by age
        if (options.olderThanDays) {
          const ageInDays = this.getTableAgeInDays(table.timestamp);
          if (ageInDays < options.olderThanDays) return false;
        }

        // Filter by source
        if (options.sources && options.sources.length > 0) {
          if (!options.sources.includes(table.source)) return false;
        }

        // Exclude specific sessions
        if (options.excludeSessionIds && options.excludeSessionIds.length > 0) {
          if (options.excludeSessionIds.includes(table.sessionId)) return false;
        }

        return true;
      });

      // Sort by timestamp (oldest first)
      eligibleTables.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Limit number of tables to delete
      if (options.maxTablesToDelete && eligibleTables.length > options.maxTablesToDelete) {
        eligibleTables = eligibleTables.slice(0, options.maxTablesToDelete);
      }

      console.log(`🗑️ Deleting ${eligibleTables.length} table(s)...`);

      for (const table of eligibleTables) {
        await this.deleteTable(table.id);
      }

      console.log(`✅ Manual cleanup complete: ${eligibleTables.length} table(s) deleted`);

      return eligibleTables.length;
    } catch (error) {
      console.error('❌ Error performing manual cleanup:', error);
      throw error;
    }
  }

  /**
   * Get the age of a table in a human-readable format
   */
  private getTableAge(timestamp: string): string {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMinutes > 0) return `${diffMinutes}m`;
    return 'just now';
  }

  /**
   * Get the age of a table in days
   */
  private getTableAgeInDays(timestamp: string): number {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    return diffMs / (1000 * 60 * 60 * 24);
  }

  // ==================
  // HELPER METHODS
  // ==================

  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate a container ID
   */
  private generateContainerId(): string {
    return `container-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Detect the position of a table within its container
   */
  private detectTablePosition(tableElement: HTMLTableElement, container: HTMLElement | null): number {
    if (!container) return 0;

    const tables = Array.from(container.querySelectorAll('table'));
    const index = tables.indexOf(tableElement);
    return index >= 0 ? index : 0;
  }

  /**
   * Get the current user ID (placeholder - should integrate with auth system)
   */
  private async getCurrentUserId(): Promise<string | undefined> {
    // TODO: Integrate with actual authentication system
    // For now, return undefined to allow operation without user_id
    return undefined;
  }

  // ==================
  // LOGGING METHODS (Task 9 - Requirements: 8.5)
  // ==================

  /**
   * Log a message with specified level
   * Requirements: 8.5
   */
  log(level: LogLevel, message: string, data?: any, sessionId?: string): void {
    if (!this.loggingEnabled) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId
    };

    // Add to log entries
    this.logEntries.push(logEntry);

    // Trim log entries if exceeding max
    if (this.logEntries.length > this.MAX_LOG_ENTRIES) {
      this.logEntries = this.logEntries.slice(-this.MAX_LOG_ENTRIES);
    }

    // Console output with appropriate styling
    const prefix = `[${level}] [FlowiseTableService]`;
    const timestamp = new Date().toLocaleTimeString();
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${timestamp}:`, message, data || '');
        break;
      case LogLevel.INFO:
        console.log(`${prefix} ${timestamp}:`, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${timestamp}:`, message, data || '');
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${timestamp}:`, message, data || '');
        break;
    }
  }

  /**
   * Get all log entries
   * Requirements: 8.5
   */
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let logs = this.logEntries;

    // Filter by level if specified
    if (level) {
      logs = logs.filter(entry => entry.level === level);
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      logs = logs.slice(-limit);
    }

    return logs;
  }

  /**
   * Get logs for a specific session
   * Requirements: 8.5
   */
  getSessionLogs(sessionId: string, level?: LogLevel): LogEntry[] {
    let logs = this.logEntries.filter(entry => entry.sessionId === sessionId);

    // Filter by level if specified
    if (level) {
      logs = logs.filter(entry => entry.level === level);
    }

    return logs;
  }

  /**
   * Clear all log entries
   * Requirements: 8.5
   */
  clearLogs(): void {
    this.logEntries = [];
    console.log('[INFO] [FlowiseTableService] Log entries cleared');
  }

  /**
   * Enable or disable logging
   * Requirements: 8.5
   */
  setLoggingEnabled(enabled: boolean): void {
    this.loggingEnabled = enabled;
    console.log(`[INFO] [FlowiseTableService] Logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get formatted log output
   * Requirements: 8.5
   */
  getLogsFormatted(level?: LogLevel, limit?: number): string {
    const logs = this.getLogs(level, limit);

    if (logs.length === 0) {
      return 'No log entries found.';
    }

    const lines: string[] = [
      '═══════════════════════════════════════',
      '   FLOWISE TABLE SERVICE LOGS',
      '═══════════════════════════════════════',
      ''
    ];

    for (const log of logs) {
      const time = new Date(log.timestamp).toLocaleTimeString();
      const levelIcon = this.getLevelIcon(log.level);
      
      lines.push(`${levelIcon} [${time}] ${log.message}`);
      
      if (log.sessionId) {
        lines.push(`   Session: ${log.sessionId.substring(0, 12)}...`);
      }
      
      if (log.data) {
        lines.push(`   Data: ${JSON.stringify(log.data, null, 2)}`);
      }
      
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get icon for log level
   */
  private getLevelIcon(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🔍';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      default: return '📝';
    }
  }

  // ==================
  // BATCH OPERATIONS (Task 13.2)
  // ==================

  /**
   * Save multiple tables in a single transaction
   * Requirements: 7.1
   * Task 13.2: Implement batch save operations
   * 
   * @param tables - Array of table data to save
   * @returns Array of saved table IDs
   */
  async saveTablesBatch(
    tables: Array<{
      sessionId: string;
      tableElement: HTMLTableElement;
      keyword: string;
      source: FlowiseTableSource;
      messageId?: string;
    }>
  ): Promise<string[]> {
    if (tables.length === 0) {
      console.log('ℹ️ No tables to save in batch');
      return [];
    }

    console.log(`🔄 Batch saving ${tables.length} table(s)...`);
    const startTime = performance.now();

    const savedIds: string[] = [];
    const errors: Array<{ index: number; error: any }> = [];

    // Process all tables in a single transaction
    try {
      // Prepare all table records
      const tableRecords: FlowiseGeneratedTableRecord[] = [];

      for (let i = 0; i < tables.length; i++) {
        const { sessionId, tableElement, keyword, source, messageId } = tables[i];

        try {
          // Generate fingerprint
          const fingerprint = this.generateTableFingerprint(tableElement);

          // Check for duplicates
          const exists = await this.tableExists(sessionId, fingerprint);
          if (exists) {
            console.log(`ℹ️ Table ${i} already exists, skipping`);
            continue;
          }

          // Get HTML content
          let html = tableElement.outerHTML;
          const originalSize = html.length;

          // Extract metadata
          const metadata = this.extractTableMetadata(tableElement, html);

          // Compress if needed
          if (originalSize > this.COMPRESSION_THRESHOLD) {
            html = this.compressHTML(html);
            metadata.compressed = true;
            metadata.originalSize = originalSize;
          }

          // Detect container and position
          const container = tableElement.closest('[data-container-id]') as HTMLElement;
          const containerId = container?.getAttribute('data-container-id') || this.generateContainerId();
          const position = this.detectTablePosition(tableElement, container);

          // Create table record
          const tableRecord: FlowiseGeneratedTableRecord = {
            id: this.generateUUID(),
            sessionId,
            messageId,
            keyword,
            html,
            fingerprint,
            containerId,
            position,
            timestamp: new Date().toISOString(),
            source,
            metadata,
            user_id: await this.getCurrentUserId(),
            tableType: 'generated',
            processed: false
          };

          tableRecords.push(tableRecord);
          savedIds.push(tableRecord.id);

        } catch (error) {
          console.error(`❌ Error preparing table ${i} for batch save:`, error);
          errors.push({ index: i, error });
        }
      }

      // Save all records in a single transaction
      if (tableRecords.length > 0) {
        await indexedDBService.putGeneratedTablesBatch(tableRecords);
        
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        console.log(`✅ Batch saved ${tableRecords.length} table(s) in ${duration}ms`);
        
        // Log batch save performance
        this.log(LogLevel.INFO, `Batch save completed`, {
          count: tableRecords.length,
          duration: `${duration}ms`,
          avgPerTable: `${(parseFloat(duration) / tableRecords.length).toFixed(2)}ms`
        });
      }

      if (errors.length > 0) {
        console.warn(`⚠️ ${errors.length} error(s) occurred during batch save`);
      }

      return savedIds;

    } catch (error) {
      console.error('❌ Critical error during batch save:', error);
      throw error;
    }
  }

  /**
   * Restore multiple tables efficiently in a single operation
   * Requirements: 7.1
   * Task 13.2: Implement batch restore operations
   * 
   * @param sessionIds - Array of session IDs to restore tables for
   * @returns Map of session ID to restored tables
   */
  async restoreTablesBatch(
    sessionIds: string[]
  ): Promise<Map<string, FlowiseGeneratedTableRecord[]>> {
    if (sessionIds.length === 0) {
      console.log('ℹ️ No sessions to restore in batch');
      return new Map();
    }

    console.log(`🔄 Batch restoring tables for ${sessionIds.length} session(s)...`);
    const startTime = performance.now();

    const results = new Map<string, FlowiseGeneratedTableRecord[]>();

    try {
      // Fetch all tables for all sessions in parallel
      const promises = sessionIds.map(async (sessionId) => {
        try {
          const tables = await this.restoreSessionTables(sessionId);
          return { sessionId, tables };
        } catch (error) {
          console.error(`❌ Error restoring tables for session ${sessionId}:`, error);
          return { sessionId, tables: [] };
        }
      });

      const sessionResults = await Promise.all(promises);

      // Build results map
      for (const { sessionId, tables } of sessionResults) {
        results.set(sessionId, tables);
      }

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      
      const totalTables = Array.from(results.values()).reduce((sum, tables) => sum + tables.length, 0);
      
      console.log(`✅ Batch restored ${totalTables} table(s) from ${sessionIds.length} session(s) in ${duration}ms`);
      
      // Log batch restore performance
      this.log(LogLevel.INFO, `Batch restore completed`, {
        sessionCount: sessionIds.length,
        tableCount: totalTables,
        duration: `${duration}ms`,
        avgPerSession: `${(parseFloat(duration) / sessionIds.length).toFixed(2)}ms`
      });

      return results;

    } catch (error) {
      console.error('❌ Critical error during batch restore:', error);
      throw error;
    }
  }

  /**
   * Delete multiple tables in a single transaction
   * Requirements: 7.1
   * Task 13.2: Implement batch delete operations
   * 
   * @param tableIds - Array of table IDs to delete
   * @returns Number of tables deleted
   */
  async deleteTablesBatch(tableIds: string[]): Promise<number> {
    if (tableIds.length === 0) {
      console.log('ℹ️ No tables to delete in batch');
      return 0;
    }

    console.log(`🔄 Batch deleting ${tableIds.length} table(s)...`);
    const startTime = performance.now();

    try {
      // Delete all tables in a single transaction
      await indexedDBService.deleteGeneratedTablesBatch(tableIds);

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      
      console.log(`✅ Batch deleted ${tableIds.length} table(s) in ${duration}ms`);
      
      // Log batch delete performance
      this.log(LogLevel.INFO, `Batch delete completed`, {
        count: tableIds.length,
        duration: `${duration}ms`,
        avgPerTable: `${(parseFloat(duration) / tableIds.length).toFixed(2)}ms`
      });

      return tableIds.length;

    } catch (error) {
      console.error('❌ Error during batch delete:', error);
      throw error;
    }
  }

  /**
   * Update multiple tables in a single transaction
   * Requirements: 7.1
   * Task 13.2: Implement batch update operations
   * 
   * @param tables - Array of table records to update
   * @returns Number of tables updated
   */
  async updateTablesBatch(tables: FlowiseGeneratedTableRecord[]): Promise<number> {
    if (tables.length === 0) {
      console.log('ℹ️ No tables to update in batch');
      return 0;
    }

    console.log(`🔄 Batch updating ${tables.length} table(s)...`);
    const startTime = performance.now();

    try {
      // Update all tables in a single transaction
      await indexedDBService.putGeneratedTablesBatch(tables);

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      
      console.log(`✅ Batch updated ${tables.length} table(s) in ${duration}ms`);
      
      // Log batch update performance
      this.log(LogLevel.INFO, `Batch update completed`, {
        count: tables.length,
        duration: `${duration}ms`,
        avgPerTable: `${(parseFloat(duration) / tables.length).toFixed(2)}ms`
      });

      return tables.length;

    } catch (error) {
      console.error('❌ Error during batch update:', error);
      throw error;
    }
  }

  /**
   * Get batch operation statistics
   * Task 13.2: Monitor batch operation performance
   * 
   * @returns Statistics about batch operations
   */
  getBatchOperationStats(): {
    batchSaves: number;
    batchRestores: number;
    batchDeletes: number;
    batchUpdates: number;
    totalBatchOperations: number;
  } {
    // Filter logs for batch operations
    const batchLogs = this.logEntries.filter(log => 
      log.message.includes('Batch') && log.level === LogLevel.INFO
    );

    const batchSaves = batchLogs.filter(log => log.message.includes('save')).length;
    const batchRestores = batchLogs.filter(log => log.message.includes('restore')).length;
    const batchDeletes = batchLogs.filter(log => log.message.includes('delete')).length;
    const batchUpdates = batchLogs.filter(log => log.message.includes('update')).length;

    return {
      batchSaves,
      batchRestores,
      batchDeletes,
      batchUpdates,
      totalBatchOperations: batchLogs.length
    };
  }

  // ==================
  // CACHING CONTROL (Task 13.3)
  // ==================

  /**
   * Enable caching
   * Requirements: 7.1
   * Task 13.3: Control caching behavior
   */
  enableCaching(): void {
    this.cachingEnabled = true;
    console.log('✅ Table caching enabled');
  }

  /**
   * Disable caching
   * Requirements: 7.1
   * Task 13.3: Control caching behavior
   */
  disableCaching(): void {
    this.cachingEnabled = false;
    console.log('✅ Table caching disabled');
  }

  /**
   * Check if caching is enabled
   * Task 13.3: Query caching status
   */
  isCachingEnabled(): boolean {
    return this.cachingEnabled;
  }

  /**
   * Get cache statistics
   * Requirements: 7.1
   * Task 13.3: Monitor cache performance
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
    totalAccesses: number;
  } {
    return flowiseTableCache.getStats();
  }

  /**
   * Get detailed cache information
   * Task 13.3: Inspect cache contents
   */
  getCacheDetails(): Array<{
    tableId: string;
    keyword: string;
    sessionId: string;
    accessCount: number;
    lastAccessed: Date;
    cachedAt: Date;
    ageMs: number;
  }> {
    return flowiseTableCache.getDetailedInfo();
  }

  /**
   * Clear the cache
   * Task 13.3: Clear cache
   */
  clearCache(): void {
    flowiseTableCache.clear();
    console.log('✅ Table cache cleared');
  }

  /**
   * Invalidate cache for a specific session
   * Task 13.3: Session-based cache invalidation
   */
  invalidateSessionCache(sessionId: string): number {
    const count = flowiseTableCache.invalidateSession(sessionId);
    console.log(`✅ Invalidated ${count} cached table(s) for session ${sessionId}`);
    return count;
  }

  /**
   * Preload frequently accessed tables into cache
   * Task 13.3: Preload cache
   */
  async preloadCache(sessionId: string): Promise<number> {
    try {
      const tables = await this.restoreSessionTables(sessionId);
      const count = flowiseTableCache.preload(tables);
      console.log(`✅ Preloaded ${count} table(s) into cache for session ${sessionId}`);
      return count;
    } catch (error) {
      console.error('❌ Error preloading cache:', error);
      return 0;
    }
  }

  /**
   * Get cache size in bytes
   * Task 13.3: Monitor cache memory usage
   */
  getCacheSize(): {
    bytes: number;
    formatted: string;
  } {
    return {
      bytes: flowiseTableCache.getSizeBytes(),
      formatted: flowiseTableCache.getSizeFormatted()
    };
  }

  /**
   * Get most frequently accessed tables from cache
   * Task 13.3: Analyze cache usage patterns
   */
  getMostAccessedTables(limit: number = 10): Array<{
    tableId: string;
    keyword: string;
    accessCount: number;
  }> {
    return flowiseTableCache.getMostAccessed(limit);
  }

  /**
   * Update cache max size
   * Task 13.3: Configure cache size
   */
  setCacheMaxSize(newMaxSize: number): void {
    flowiseTableCache.setMaxSize(newMaxSize);
    console.log(`✅ Cache max size updated to: ${newMaxSize}`);
  }

  /**
   * Get cache utilization percentage
   * Task 13.3: Monitor cache utilization
   */
  getCacheUtilization(): number {
    return flowiseTableCache.getUtilization();
  }
}

// Export singleton instance
export const flowiseTableService = new FlowiseTableService();
