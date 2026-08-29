/**
 * FlowiseTableBridge Tests
 * 
 * Tests for the FlowiseTableBridge service that handles event listening,
 * session detection, and table restoration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlowiseTableBridge } from '../flowiseTableBridge';
import { flowiseTableService } from '../flowiseTableService';

describe('FlowiseTableBridge', () => {
  let bridge: FlowiseTableBridge;

  beforeEach(() => {
    // Clear any existing session state
    delete (window as any).claraverseState;
    
    // Clear URL parameters
    window.history.pushState({}, '', window.location.pathname);
    
    // Clear DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Detection', () => {
    it('should detect session from React state', () => {
      // Setup React state
      (window as any).claraverseState = {
        currentSession: {
          id: 'react-session-123'
        }
      };

      bridge = new FlowiseTableBridge();
      
      expect(bridge.getCurrentSession()).toBe('react-session-123');
    });

    it('should detect session from URL parameters', () => {
      // Setup URL parameter
      window.history.pushState({}, '', '?sessionId=url-session-456');

      bridge = new FlowiseTableBridge();
      
      expect(bridge.getCurrentSession()).toBe('url-session-456');
    });

    it('should detect session from DOM attributes', () => {
      // Setup DOM element
      const chatContainer = document.createElement('div');
      chatContainer.setAttribute('data-session-id', 'dom-session-789');
      document.body.appendChild(chatContainer);

      bridge = new FlowiseTableBridge();
      
      expect(bridge.getCurrentSession()).toBe('dom-session-789');
    });

    it('should create temporary session as fallback', () => {
      bridge = new FlowiseTableBridge();
      
      const sessionId = bridge.getCurrentSession();
      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^temp-session-\d+-[a-z0-9]+$/);
    });

    it('should prioritize React state over URL', () => {
      (window as any).claraverseState = {
        currentSession: { id: 'react-session' }
      };
      window.history.pushState({}, '', '?sessionId=url-session');

      bridge = new FlowiseTableBridge();
      
      expect(bridge.getCurrentSession()).toBe('react-session');
    });

    it('should allow manual session setting', () => {
      bridge = new FlowiseTableBridge();
      
      bridge.setCurrentSession('manual-session-999');
      
      expect(bridge.getCurrentSession()).toBe('manual-session-999');
    });
  });

  describe('Event Listeners', () => {
    beforeEach(() => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('test-session-123');
      vi.clearAllMocks();
    });

    it('should handle flowise:table:integrated event', async () => {
      const mockTable = document.createElement('table');
      mockTable.innerHTML = `
        <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>
        <tbody><tr><td>Data 1</td><td>Data 2</td></tr></tbody>
      `;

      const saveSpy = vi.spyOn(flowiseTableService, 'saveGeneratedTable');
      saveSpy.mockResolvedValue('saved-table-id');
      
      // Mock tableExists to return false (no duplicate)
      vi.spyOn(flowiseTableService, 'tableExists').mockResolvedValue(false);

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: mockTable,
          keyword: 'TestKeyword',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
      });

      document.dispatchEvent(event);

      // Wait for async handling
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(saveSpy).toHaveBeenCalledWith(
        'test-session-123',
        mockTable,
        'TestKeyword',
        'n8n',
        undefined
      );
    });

    it('should emit storage:table:saved event on success', async () => {
      const mockTable = document.createElement('table');
      mockTable.innerHTML = '<tr><td>Test</td></tr>';

      vi.spyOn(flowiseTableService, 'saveGeneratedTable').mockResolvedValue('table-123');
      vi.spyOn(flowiseTableService, 'tableExists').mockResolvedValue(false);

      let savedEventFired = false;
      document.addEventListener('storage:table:saved', () => {
        savedEventFired = true;
      });

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: mockTable,
          keyword: 'Test',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
      });

      document.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(savedEventFired).toBe(true);
    });

    it('should handle session change event', async () => {
      const restoreSpy = vi.spyOn(bridge, 'restoreTablesForSession');
      restoreSpy.mockResolvedValue();

      const event = new CustomEvent('claraverse:session:changed', {
        detail: {
          sessionId: 'new-session-456'
        }
      });

      document.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(bridge.getCurrentSession()).toBe('new-session-456');
      expect(restoreSpy).toHaveBeenCalledWith('new-session-456');
    });
  });

  describe('DOM Injection', () => {
    beforeEach(() => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('test-session');
    });

    it('should create container if not found', async () => {
      const mockTableData = {
        id: 'table-1',
        sessionId: 'test-session',
        keyword: 'Test',
        html: '<table><tr><td>Test</td></tr></table>',
        fingerprint: 'abc123',
        containerId: 'new-container',
        position: 0,
        timestamp: new Date().toISOString(),
        source: 'n8n' as const,
        metadata: {
          rowCount: 1,
          colCount: 1,
          headers: ['Test'],
          compressed: false
        }
      };

      vi.spyOn(flowiseTableService, 'restoreSessionTables').mockResolvedValue([mockTableData]);

      await bridge.restoreTablesForSession('test-session');

      const container = document.querySelector('[data-container-id="new-container"]');
      expect(container).toBeTruthy();
      expect(container?.getAttribute('data-restored-container')).toBe('true');
    });

    it('should inject table with proper attributes', async () => {
      const mockTableData = {
        id: 'table-1',
        sessionId: 'test-session',
        keyword: 'TestKeyword',
        html: '<table><tr><td>Test Data</td></tr></table>',
        fingerprint: 'abc123',
        containerId: 'container-1',
        position: 0,
        timestamp: '2024-01-01T00:00:00.000Z',
        source: 'n8n' as const,
        metadata: {
          rowCount: 1,
          colCount: 1,
          headers: ['Test'],
          compressed: false
        }
      };

      vi.spyOn(flowiseTableService, 'restoreSessionTables').mockResolvedValue([mockTableData]);

      await bridge.restoreTablesForSession('test-session');

      const tableWrapper = document.querySelector('[data-table-id="table-1"]');
      expect(tableWrapper).toBeTruthy();
      expect(tableWrapper?.getAttribute('data-n8n-table')).toBe('true');
      expect(tableWrapper?.getAttribute('data-n8n-keyword')).toBe('TestKeyword');
      expect(tableWrapper?.getAttribute('data-restored')).toBe('true');
      expect(tableWrapper?.getAttribute('data-source')).toBe('n8n');
    });

    it('should preserve table order by position', async () => {
      const container = document.createElement('div');
      container.setAttribute('data-container-id', 'test-container');
      document.body.appendChild(container);

      const mockTables = [
        {
          id: 'table-1',
          sessionId: 'test-session',
          keyword: 'First',
          html: '<table><tr><td>First</td></tr></table>',
          fingerprint: 'fp1',
          containerId: 'test-container',
          position: 0,
          timestamp: '2024-01-01T00:00:00.000Z',
          source: 'n8n' as const,
          metadata: { rowCount: 1, colCount: 1, headers: [], compressed: false }
        },
        {
          id: 'table-2',
          sessionId: 'test-session',
          keyword: 'Second',
          html: '<table><tr><td>Second</td></tr></table>',
          fingerprint: 'fp2',
          containerId: 'test-container',
          position: 1,
          timestamp: '2024-01-01T00:01:00.000Z',
          source: 'n8n' as const,
          metadata: { rowCount: 1, colCount: 1, headers: [], compressed: false }
        }
      ];

      vi.spyOn(flowiseTableService, 'restoreSessionTables').mockResolvedValue(mockTables);

      await bridge.restoreTablesForSession('test-session');

      const tables = container.querySelectorAll('[data-n8n-table]');
      expect(tables.length).toBe(2);
      expect(tables[0].getAttribute('data-table-id')).toBe('table-1');
      expect(tables[1].getAttribute('data-table-id')).toBe('table-2');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      bridge = new FlowiseTableBridge();
      bridge.setCurrentSession('test-session');
    });

    it('should emit error event on save failure', async () => {
      const mockTable = document.createElement('table');
      mockTable.innerHTML = '<tr><td>Test</td></tr>';

      vi.spyOn(flowiseTableService, 'saveGeneratedTable').mockRejectedValue(
        new Error('Save failed')
      );

      let errorEventFired = false;
      document.addEventListener('storage:table:error', () => {
        errorEventFired = true;
      });

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: mockTable,
          keyword: 'Test',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
      });

      document.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errorEventFired).toBe(true);
    });

    it('should skip duplicate tables', async () => {
      const mockTable = document.createElement('table');
      mockTable.innerHTML = '<tr><td>Test</td></tr>';

      vi.spyOn(flowiseTableService, 'tableExists').mockResolvedValue(true);
      const saveSpy = vi.spyOn(flowiseTableService, 'saveGeneratedTable');

      const event = new CustomEvent('flowise:table:integrated', {
        detail: {
          table: mockTable,
          keyword: 'Test',
          source: 'n8n' as const,
          timestamp: Date.now()
        }
      });

      document.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });
});
