/**
 * Tests for Flowise Generated Tables IndexedDB Schema
 * 
 * These tests verify that the clara_generated_tables store is properly
 * created with all required indexes.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { indexedDBService } from '../indexedDB';
import type { FlowiseGeneratedTableRecord } from '../../types/flowise_table_types';

describe('IndexedDB - Flowise Generated Tables Store', () => {
  // Clean up after each test
  afterEach(async () => {
    try {
      await indexedDBService.clearGeneratedTables();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should create clara_generated_tables store with proper schema', async () => {
    // This test verifies the store exists by attempting to use it
    const tables = await indexedDBService.getAllGeneratedTables<FlowiseGeneratedTableRecord>();
    expect(Array.isArray(tables)).toBe(true);
  });

  it('should save and retrieve a generated table', async () => {
    const mockTable: FlowiseGeneratedTableRecord = {
      id: 'test-table-1',
      sessionId: 'test-session-1',
      keyword: 'TestKeyword',
      html: '<table><tr><td>Test</td></tr></table>',
      fingerprint: 'abc123fingerprint',
      containerId: 'container-1',
      position: 0,
      timestamp: new Date().toISOString(),
      source: 'n8n',
      metadata: {
        rowCount: 1,
        colCount: 1,
        headers: ['Test'],
        compressed: false,
      },
      user_id: 'test-user-1',
    };

    // Save the table
    await indexedDBService.putGeneratedTable(mockTable);

    // Retrieve all tables
    const tables = await indexedDBService.getAllGeneratedTables<FlowiseGeneratedTableRecord>();
    expect(tables.length).toBe(1);
    expect(tables[0].id).toBe('test-table-1');
    expect(tables[0].keyword).toBe('TestKeyword');
  });

  it('should retrieve tables by session ID using index', async () => {
    const session1Table: FlowiseGeneratedTableRecord = {
      id: 'table-1',
      sessionId: 'session-1',
      keyword: 'Keyword1',
      html: '<table><tr><td>Data1</td></tr></table>',
      fingerprint: 'fp1',
      containerId: 'container-1',
      position: 0,
      timestamp: new Date().toISOString(),
      source: 'n8n',
      metadata: {
        rowCount: 1,
        colCount: 1,
        headers: ['Col1'],
        compressed: false,
      },
    };

    const session2Table: FlowiseGeneratedTableRecord = {
      id: 'table-2',
      sessionId: 'session-2',
      keyword: 'Keyword2',
      html: '<table><tr><td>Data2</td></tr></table>',
      fingerprint: 'fp2',
      containerId: 'container-2',
      position: 0,
      timestamp: new Date().toISOString(),
      source: 'n8n',
      metadata: {
        rowCount: 1,
        colCount: 1,
        headers: ['Col2'],
        compressed: false,
      },
    };

    // Save both tables
    await indexedDBService.putGeneratedTable(session1Table);
    await indexedDBService.putGeneratedTable(session2Table);

    // Retrieve tables for session-1
    const session1Tables = await indexedDBService.getGeneratedTablesBySession<FlowiseGeneratedTableRecord>('session-1');
    expect(session1Tables.length).toBe(1);
    expect(session1Tables[0].id).toBe('table-1');

    // Retrieve tables for session-2
    const session2Tables = await indexedDBService.getGeneratedTablesBySession<FlowiseGeneratedTableRecord>('session-2');
    expect(session2Tables.length).toBe(1);
    expect(session2Tables[0].id).toBe('table-2');
  });

  it('should detect duplicate tables using composite index', async () => {
    const table: FlowiseGeneratedTableRecord = {
      id: 'table-1',
      sessionId: 'session-1',
      keyword: 'Keyword1',
      html: '<table><tr><td>Data</td></tr></table>',
      fingerprint: 'unique-fingerprint',
      containerId: 'container-1',
      position: 0,
      timestamp: new Date().toISOString(),
      source: 'n8n',
      metadata: {
        rowCount: 1,
        colCount: 1,
        headers: ['Col1'],
        compressed: false,
      },
    };

    // Save the table
    await indexedDBService.putGeneratedTable(table);

    // Check if table exists
    const exists = await indexedDBService.generatedTableExists('session-1', 'unique-fingerprint');
    expect(exists).toBe(true);

    // Check for non-existent table
    const notExists = await indexedDBService.generatedTableExists('session-1', 'different-fingerprint');
    expect(notExists).toBe(false);
  });

  it('should delete all tables for a session (cascade delete)', async () => {
    const table1: FlowiseGeneratedTableRecord = {
      id: 'table-1',
      sessionId: 'session-to-delete',
      keyword: 'Keyword1',
      html: '<table><tr><td>Data1</td></tr></table>',
      fingerprint: 'fp1',
      containerId: 'container-1',
      position: 0,
      timestamp: new Date().toISOString(),
      source: 'n8n',
      metadata: {
        rowCount: 1,
        colCount: 1,
        headers: ['Col1'],
        compressed: false,
      },
    };

    const table2: FlowiseGeneratedTableRecord = {
      id: 'table-2',
      sessionId: 'session-to-delete',
      keyword: 'Keyword2',
      html: '<table><tr><td>Data2</td></tr></table>',
      fingerprint: 'fp2',
      containerId: 'container-2',
      position: 1,
      timestamp: new Date().toISOString(),
      source: 'n8n',
      metadata: {
        rowCount: 1,
        colCount: 1,
        headers: ['Col2'],
        compressed: false,
      },
    };

    // Save both tables
    await indexedDBService.putGeneratedTable(table1);
    await indexedDBService.putGeneratedTable(table2);

    // Verify tables exist
    let tables = await indexedDBService.getGeneratedTablesBySession<FlowiseGeneratedTableRecord>('session-to-delete');
    expect(tables.length).toBe(2);

    // Delete all tables for the session
    const deletedCount = await indexedDBService.deleteGeneratedTablesBySession('session-to-delete');
    expect(deletedCount).toBe(2);

    // Verify tables are deleted
    tables = await indexedDBService.getGeneratedTablesBySession<FlowiseGeneratedTableRecord>('session-to-delete');
    expect(tables.length).toBe(0);
  });

  it('should handle different table sources', async () => {
    const n8nTable: FlowiseGeneratedTableRecord = {
      id: 'table-n8n',
      sessionId: 'session-1',
      keyword: 'Keyword1',
      html: '<table><tr><td>N8N Data</td></tr></table>',
      fingerprint: 'fp-n8n',
      containerId: 'container-1',
      position: 0,
      timestamp: new Date().toISOString(),
      source: 'n8n',
      metadata: {
        rowCount: 1,
        colCount: 1,
        headers: ['Col1'],
        compressed: false,
      },
    };

    const cachedTable: FlowiseGeneratedTableRecord = {
      id: 'table-cached',
      sessionId: 'session-1',
      keyword: 'Keyword2',
      html: '<table><tr><td>Cached Data</td></tr></table>',
      fingerprint: 'fp-cached',
      containerId: 'container-2',
      position: 1,
      timestamp: new Date().toISOString(),
      source: 'cached',
      metadata: {
        rowCount: 1,
        colCount: 1,
        headers: ['Col2'],
        compressed: false,
      },
    };

    const errorTable: FlowiseGeneratedTableRecord = {
      id: 'table-error',
      sessionId: 'session-1',
      keyword: 'Keyword3',
      html: '<div>Error message</div>',
      fingerprint: 'fp-error',
      containerId: 'container-3',
      position: 2,
      timestamp: new Date().toISOString(),
      source: 'error',
      metadata: {
        rowCount: 0,
        colCount: 0,
        headers: [],
        compressed: false,
      },
    };

    // Save all tables
    await indexedDBService.putGeneratedTable(n8nTable);
    await indexedDBService.putGeneratedTable(cachedTable);
    await indexedDBService.putGeneratedTable(errorTable);

    // Retrieve all tables
    const tables = await indexedDBService.getGeneratedTablesBySession<FlowiseGeneratedTableRecord>('session-1');
    expect(tables.length).toBe(3);

    // Verify sources
    const sources = tables.map(t => t.source).sort();
    expect(sources).toEqual(['cached', 'error', 'n8n']);
  });
});
