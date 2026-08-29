/**
 * Flowise Table Persistence Types
 * 
 * Type definitions for the Flowise table persistence system that integrates
 * with the Clara IndexedDB storage.
 */

/**
 * Source of a generated table
 */
export type FlowiseTableSource = 'n8n' | 'cached' | 'error';

/**
 * Table type - distinguishes between trigger tables and generated tables
 */
export type FlowiseTableType = 'trigger' | 'generated';

/**
 * Metadata associated with a generated table
 */
export interface FlowiseTableMetadata {
  /** Number of rows in the table */
  rowCount: number;

  /** Number of columns in the table */
  colCount: number;

  /** Array of column headers */
  headers: string[];

  /** Whether the HTML content is compressed */
  compressed: boolean;

  /** Original size in bytes before compression (if compressed) */
  originalSize?: number;
}

/**
 * A complete record for a Flowise-generated table stored in IndexedDB
 */
export interface FlowiseGeneratedTableRecord {
  /** Primary key - UUID unique identifier */
  id: string;

  /** Foreign key to clara_sessions - links table to a chat session */
  sessionId: string;

  /** Optional foreign key to clara_messages - links table to specific message */
  messageId?: string;

  /** Dynamic keyword extracted from the Flowise trigger table */
  keyword: string;

  /** HTML content of the table (may be compressed) */
  html: string;

  /** Content-based fingerprint for duplicate detection */
  fingerprint: string;

  /** Container DIV identifier for DOM restoration */
  containerId: string;

  /** Position within the container for ordering */
  position: number;

  /** ISO timestamp of when the table was created */
  timestamp: string;

  /** Source of the table (n8n response, cached, or error) */
  source: FlowiseTableSource;

  /** Additional metadata about the table structure and compression */
  metadata: FlowiseTableMetadata;

  /** User ID for data isolation across multiple users */
  user_id?: string;

  /** Table type - 'trigger' for Trigger_Tables, 'generated' for Generated_Tables */
  tableType?: FlowiseTableType;

  /** Whether this Trigger_Table has been processed (only applicable for tableType='trigger') */
  processed?: boolean;

  /** CIA checkbox states for exam tables (optional) */
  ciaCheckboxStates?: CIACheckboxState[];
}

/**
 * State of a CIA checkbox in an exam table
 */
export interface CIACheckboxState {
  /** Index of the checkbox in the table */
  index: number;

  /** Whether the checkbox is checked */
  checked: boolean;
}

/**
 * Lightweight version of FlowiseGeneratedTableRecord for listing operations
 */
export interface FlowiseGeneratedTableSummary {
  id: string;
  sessionId: string;
  keyword: string;
  timestamp: string;
  source: FlowiseTableSource;
  size: number;
  rowCount: number;
  colCount: number;
}

/**
 * Options for saving a generated table
 */
export interface SaveGeneratedTableOptions {
  /** The session ID to associate with the table */
  sessionId: string;

  /** The HTML table element to save */
  tableElement: HTMLTableElement;

  /** The dynamic keyword from the trigger table */
  keyword: string;

  /** The source of the table */
  source: FlowiseTableSource;

  /** Optional message ID to link the table to a specific message */
  messageId?: string;

  /** Optional container ID (will be auto-detected if not provided) */
  containerId?: string;

  /** Optional position within container (will be auto-detected if not provided) */
  position?: number;
}

/**
 * Result of a table save operation
 */
export interface SaveTableResult {
  /** The ID of the saved table */
  tableId: string;

  /** Whether the table was actually saved or skipped as duplicate */
  saved: boolean;

  /** The fingerprint of the table */
  fingerprint: string;
}

/**
 * Options for restoring tables
 */
export interface RestoreTablesOptions {
  /** The session ID to restore tables for */
  sessionId: string;

  /** Optional filter by keyword */
  keyword?: string;

  /** Optional filter by source */
  source?: FlowiseTableSource;

  /** Whether to include error tables */
  includeErrors?: boolean;
}

/**
 * Storage statistics for diagnostic purposes
 */
export interface FlowiseTableStorageStats {
  /** Total number of tables stored */
  totalTables: number;

  /** Number of tables per session */
  tablesBySession: Map<string, number>;

  /** Total storage size in bytes */
  totalSize: number;

  /** Average table size in bytes */
  averageSize: number;

  /** Number of compressed tables */
  compressedTables: number;

  /** Number of error tables */
  errorTables: number;

  /** Number of cached tables */
  cachedTables: number;

  /** Number of n8n tables */
  n8nTables: number;
}

/**
 * Integrity check result
 */
export interface FlowiseTableIntegrityResult {
  /** Number of orphaned tables (session doesn't exist) */
  orphanedTables: number;

  /** Number of corrupted tables (invalid HTML or metadata) */
  corruptedTables: number;

  /** Number of duplicate fingerprints within same session */
  duplicates: number;

  /** List of table IDs with issues */
  problematicTableIds: string[];
}
