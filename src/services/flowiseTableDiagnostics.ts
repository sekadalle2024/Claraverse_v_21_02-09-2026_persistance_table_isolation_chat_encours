/**
 * FlowiseTableDiagnostics
 * 
 * Diagnostic and monitoring tools for Flowise table persistence system.
 * Provides storage statistics, integrity checking, and session table listing.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { flowiseTableService } from './flowiseTableService';
import { indexedDBService } from './indexedDB';
import type { FlowiseGeneratedTableRecord } from '../types/flowise_table_types';

/**
 * Storage statistics interface
 */
export interface StorageStats {
  totalTables: number;
  tablesBySession: Map<string, number>;
  totalSize: number;
  averageSize: number;
  compressedTables: number;
  cachedTables: number;
  errorTables: number;
  largestTable: {
    id: string;
    size: number;
    keyword: string;
  } | null;
  oldestTable: {
    id: string;
    timestamp: string;
    keyword: string;
  } | null;
}

/**
 * Integrity check results interface
 */
export interface IntegrityCheckResult {
  orphanedTables: number;
  corruptedTables: number;
  duplicates: number;
  orphanedTableIds: string[];
  corruptedTableIds: string[];
  duplicateGroups: Array<{
    fingerprint: string;
    sessionId: string;
    tableIds: string[];
  }>;
}

/**
 * Session table info interface
 */
export interface SessionTableInfo {
  id: string;
  keyword: string;
  timestamp: string;
  size: number;
  source: string;
  compressed: boolean;
  tableType: 'generated' | 'trigger';
  processed: boolean;
}

export class FlowiseTableDiagnostics {
  /**
   * Get comprehensive storage statistics
   * Requirements: 8.1, 8.2
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      console.log('📊 Calculating storage statistics...');

      const allTables = await flowiseTableService.getAllTables();

      // Initialize counters
      let totalSize = 0;
      let compressedTables = 0;
      let cachedTables = 0;
      let errorTables = 0;
      const tablesBySession = new Map<string, number>();

      let largestTable: StorageStats['largestTable'] = null;
      let oldestTable: StorageStats['oldestTable'] = null;

      // Process each table
      for (const table of allTables) {
        // Calculate size
        const tableSize = table.html.length;
        totalSize += tableSize;

        // Count compressed tables
        if (table.metadata.compressed) {
          compressedTables++;
        }

        // Count by source
        if (table.source === 'cached') {
          cachedTables++;
        }
        if (table.source === 'error') {
          errorTables++;
        }

        // Count tables per session
        const sessionCount = tablesBySession.get(table.sessionId) || 0;
        tablesBySession.set(table.sessionId, sessionCount + 1);

        // Track largest table
        if (!largestTable || tableSize > largestTable.size) {
          largestTable = {
            id: table.id,
            size: tableSize,
            keyword: table.keyword
          };
        }

        // Track oldest table
        if (!oldestTable || new Date(table.timestamp) < new Date(oldestTable.timestamp)) {
          oldestTable = {
            id: table.id,
            timestamp: table.timestamp,
            keyword: table.keyword
          };
        }
      }

      // Calculate average size
      const averageSize = allTables.length > 0 ? totalSize / allTables.length : 0;

      const stats: StorageStats = {
        totalTables: allTables.length,
        tablesBySession,
        totalSize,
        averageSize,
        compressedTables,
        cachedTables,
        errorTables,
        largestTable,
        oldestTable
      };

      console.log('✅ Storage statistics calculated:', {
        totalTables: stats.totalTables,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
        averageSizeKB: (stats.averageSize / 1024).toFixed(2),
        compressedTables: stats.compressedTables,
        cachedTables: stats.cachedTables,
        errorTables: stats.errorTables,
        sessionsWithTables: stats.tablesBySession.size
      });

      return stats;
    } catch (error) {
      console.error('❌ Error calculating storage statistics:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics in a human-readable format
   * Requirements: 8.1, 8.2
   */
  async getStorageStatsFormatted(): Promise<string> {
    const stats = await this.getStorageStats();

    const lines: string[] = [
      '📊 Flowise Table Storage Statistics',
      '═══════════════════════════════════',
      '',
      `Total Tables: ${stats.totalTables}`,
      `Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
      `Average Size: ${(stats.averageSize / 1024).toFixed(2)} KB`,
      '',
      `Compressed Tables: ${stats.compressedTables} (${((stats.compressedTables / stats.totalTables) * 100).toFixed(1)}%)`,
      `Cached Tables: ${stats.cachedTables}`,
      `Error Tables: ${stats.errorTables}`,
      '',
      `Sessions with Tables: ${stats.tablesBySession.size}`,
      ''
    ];

    // Add largest table info
    if (stats.largestTable) {
      lines.push(`Largest Table: ${(stats.largestTable.size / 1024).toFixed(2)} KB (${stats.largestTable.keyword})`);
    }

    // Add oldest table info
    if (stats.oldestTable) {
      const age = this.getTableAge(stats.oldestTable.timestamp);
      lines.push(`Oldest Table: ${age} ago (${stats.oldestTable.keyword})`);
    }

    // Add top sessions by table count
    if (stats.tablesBySession.size > 0) {
      lines.push('');
      lines.push('Top Sessions by Table Count:');
      const sortedSessions = Array.from(stats.tablesBySession.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      for (const [sessionId, count] of sortedSessions) {
        lines.push(`  ${sessionId.substring(0, 12)}...: ${count} tables`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Check data integrity
   * Requirements: 8.4
   */
  async checkIntegrity(): Promise<IntegrityCheckResult> {
    try {
      console.log('🔍 Checking data integrity...');

      const allTables = await flowiseTableService.getAllTables();
      const allSessions = await indexedDBService.getAll<any>('clara_sessions');
      const validSessionIds = new Set(allSessions.map(s => s.id));

      // Find orphaned tables
      const orphanedTableIds: string[] = [];
      for (const table of allTables) {
        if (!validSessionIds.has(table.sessionId)) {
          orphanedTableIds.push(table.id);
        }
      }

      // Find corrupted tables
      const corruptedTableIds: string[] = [];
      for (const table of allTables) {
        if (!this.isTableValid(table)) {
          corruptedTableIds.push(table.id);
        }
      }

      // Find duplicate fingerprints within same session
      const duplicateGroups: IntegrityCheckResult['duplicateGroups'] = [];
      const fingerprintMap = new Map<string, Map<string, string[]>>();

      for (const table of allTables) {
        if (!fingerprintMap.has(table.sessionId)) {
          fingerprintMap.set(table.sessionId, new Map());
        }
        
        const sessionMap = fingerprintMap.get(table.sessionId)!;
        if (!sessionMap.has(table.fingerprint)) {
          sessionMap.set(table.fingerprint, []);
        }
        
        sessionMap.get(table.fingerprint)!.push(table.id);
      }

      // Identify duplicate groups
      for (const [sessionId, sessionMap] of fingerprintMap.entries()) {
        for (const [fingerprint, tableIds] of sessionMap.entries()) {
          if (tableIds.length > 1) {
            duplicateGroups.push({
              fingerprint,
              sessionId,
              tableIds
            });
          }
        }
      }

      const result: IntegrityCheckResult = {
        orphanedTables: orphanedTableIds.length,
        corruptedTables: corruptedTableIds.length,
        duplicates: duplicateGroups.reduce((sum, group) => sum + group.tableIds.length - 1, 0),
        orphanedTableIds,
        corruptedTableIds,
        duplicateGroups
      };

      console.log('✅ Integrity check complete:', {
        orphanedTables: result.orphanedTables,
        corruptedTables: result.corruptedTables,
        duplicates: result.duplicates
      });

      return result;
    } catch (error) {
      console.error('❌ Error checking integrity:', error);
      throw error;
    }
  }

  /**
   * Get integrity check results in a human-readable format
   * Requirements: 8.4
   */
  async checkIntegrityFormatted(): Promise<string> {
    const result = await this.checkIntegrity();

    const lines: string[] = [
      '🔍 Data Integrity Check Results',
      '═══════════════════════════════',
      '',
      `Orphaned Tables: ${result.orphanedTables}`,
      `Corrupted Tables: ${result.corruptedTables}`,
      `Duplicate Tables: ${result.duplicates}`,
      ''
    ];

    if (result.orphanedTables > 0) {
      lines.push('⚠️ Orphaned Tables (no matching session):');
      for (const tableId of result.orphanedTableIds.slice(0, 10)) {
        lines.push(`  - ${tableId}`);
      }
      if (result.orphanedTableIds.length > 10) {
        lines.push(`  ... and ${result.orphanedTableIds.length - 10} more`);
      }
      lines.push('');
    }

    if (result.corruptedTables > 0) {
      lines.push('⚠️ Corrupted Tables (invalid data):');
      for (const tableId of result.corruptedTableIds.slice(0, 10)) {
        lines.push(`  - ${tableId}`);
      }
      if (result.corruptedTableIds.length > 10) {
        lines.push(`  ... and ${result.corruptedTableIds.length - 10} more`);
      }
      lines.push('');
    }

    if (result.duplicates > 0) {
      lines.push('⚠️ Duplicate Tables (same fingerprint in session):');
      for (const group of result.duplicateGroups.slice(0, 5)) {
        lines.push(`  Session ${group.sessionId.substring(0, 12)}...: ${group.tableIds.length} duplicates`);
        lines.push(`    Fingerprint: ${group.fingerprint.substring(0, 16)}...`);
      }
      if (result.duplicateGroups.length > 5) {
        lines.push(`  ... and ${result.duplicateGroups.length - 5} more groups`);
      }
      lines.push('');
    }

    if (result.orphanedTables === 0 && result.corruptedTables === 0 && result.duplicates === 0) {
      lines.push('✅ All data is valid and consistent!');
    }

    return lines.join('\n');
  }

  /**
   * List all tables for a given session
   * Requirements: 8.3
   */
  async listSessionTables(sessionId: string): Promise<SessionTableInfo[]> {
    try {
      console.log(`📋 Listing tables for session: ${sessionId}`);

      const tables = await flowiseTableService.restoreSessionTables(sessionId);

      const tableInfos: SessionTableInfo[] = tables.map(table => ({
        id: table.id,
        keyword: table.keyword,
        timestamp: table.timestamp,
        size: table.html.length,
        source: table.source,
        compressed: table.metadata.compressed,
        tableType: table.tableType || 'generated',
        processed: table.processed || false
      }));

      // Sort by timestamp (newest first)
      tableInfos.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      console.log(`✅ Found ${tableInfos.length} table(s) for session ${sessionId}`);

      return tableInfos;
    } catch (error) {
      console.error(`❌ Error listing tables for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * List session tables in a human-readable format
   * Requirements: 8.3
   */
  async listSessionTablesFormatted(sessionId: string): Promise<string> {
    const tables = await this.listSessionTables(sessionId);

    const lines: string[] = [
      `📋 Tables for Session: ${sessionId}`,
      '═══════════════════════════════════════',
      '',
      `Total Tables: ${tables.length}`,
      ''
    ];

    if (tables.length === 0) {
      lines.push('No tables found for this session.');
      return lines.join('\n');
    }

    for (const table of tables) {
      const age = this.getTableAge(table.timestamp);
      const sizeKB = (table.size / 1024).toFixed(2);
      const compressed = table.compressed ? '🗜️' : '';
      const type = table.tableType === 'trigger' ? '🔔' : '📊';
      const processed = table.processed ? '✓' : '';

      lines.push(`${type} ${table.keyword} ${compressed} ${processed}`);
      lines.push(`   ID: ${table.id.substring(0, 12)}...`);
      lines.push(`   Size: ${sizeKB} KB | Source: ${table.source} | Age: ${age}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get comprehensive diagnostic report
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async getFullDiagnosticReport(): Promise<string> {
    const lines: string[] = [
      '═══════════════════════════════════════════════',
      '   FLOWISE TABLE PERSISTENCE DIAGNOSTIC REPORT',
      '═══════════════════════════════════════════════',
      '',
      await this.getStorageStatsFormatted(),
      '',
      '───────────────────────────────────────────────',
      '',
      await this.checkIntegrityFormatted(),
      '',
      '═══════════════════════════════════════════════'
    ];

    return lines.join('\n');
  }

  /**
   * Log diagnostic report to console
   * Requirements: 8.5
   */
  async logDiagnosticReport(): Promise<void> {
    const report = await this.getFullDiagnosticReport();
    console.log(report);
  }

  // ==================
  // HELPER METHODS
  // ==================

  /**
   * Validate if a table record is valid
   */
  private isTableValid(table: FlowiseGeneratedTableRecord): boolean {
    try {
      // Check required fields
      if (!table.id || !table.sessionId || !table.keyword || !table.html) {
        return false;
      }

      // Check if HTML is valid (not empty and has basic structure)
      if (table.html.length === 0) {
        return false;
      }

      // Check if metadata is valid
      if (!table.metadata || typeof table.metadata !== 'object') {
        return false;
      }

      // Check if fingerprint is valid
      if (!table.fingerprint || table.fingerprint.length === 0) {
        return false;
      }

      // Check if timestamp is valid
      const timestamp = new Date(table.timestamp);
      if (isNaN(timestamp.getTime())) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
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
}

// Export singleton instance
export const flowiseTableDiagnostics = new FlowiseTableDiagnostics();
