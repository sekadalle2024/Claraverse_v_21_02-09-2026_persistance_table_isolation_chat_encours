/**
 * FlowiseTableLazyLoader
 * 
 * Service for implementing lazy loading of table content using IntersectionObserver.
 * Only loads table content when tables become visible in the viewport.
 * 
 * Requirements: 7.1 - Performance optimization
 * Task 13.1: Implement lazy loading
 */

import { flowiseTableService } from './flowiseTableService';
import type { FlowiseGeneratedTableRecord } from '../types/flowise_table_types';

/**
 * Configuration for lazy loading behavior
 */
interface LazyLoadConfig {
  rootMargin?: string;        // Margin around viewport for early loading
  threshold?: number;         // Percentage of visibility to trigger load
  enablePlaceholder?: boolean; // Show placeholder while loading
  placeholderHeight?: string; // Height of placeholder
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: LazyLoadConfig = {
  rootMargin: '50px',         // Load 50px before entering viewport
  threshold: 0.01,            // Load when 1% visible
  enablePlaceholder: true,
  placeholderHeight: '200px'
};

export class FlowiseTableLazyLoader {
  private observer: IntersectionObserver | null = null;
  private config: LazyLoadConfig;
  private loadedTables: Set<string> = new Set();
  private pendingLoads: Map<string, Promise<void>> = new Map();

  constructor(config: Partial<LazyLoadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeObserver();
  }

  /**
   * Initialize the IntersectionObserver
   * Requirements: 7.1
   */
  private initializeObserver(): void {
    if (!('IntersectionObserver' in window)) {
      console.warn('⚠️ IntersectionObserver not supported, lazy loading disabled');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      }
    );

    console.log('✅ FlowiseTableLazyLoader initialized');
  }

  /**
   * Handle intersection events
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const tableId = element.getAttribute('data-table-id');

        if (tableId && !this.loadedTables.has(tableId)) {
          this.loadTableContent(element, tableId);
        }
      }
    });
  }

  /**
   * Load table content when it becomes visible
   * Requirements: 7.1
   */
  private async loadTableContent(element: HTMLElement, tableId: string): Promise<void> {
    // Check if already loading
    if (this.pendingLoads.has(tableId)) {
      return this.pendingLoads.get(tableId)!;
    }

    // Mark as loading
    const loadPromise = this.performLoad(element, tableId);
    this.pendingLoads.set(tableId, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.pendingLoads.delete(tableId);
    }
  }

  /**
   * Perform the actual table content load
   */
  private async performLoad(element: HTMLElement, tableId: string): Promise<void> {
    try {
      console.log(`🔄 Lazy loading table: ${tableId}`);

      // Get table data from storage
      const tableData = await flowiseTableService.getTableById(tableId);

      if (!tableData) {
        console.error(`❌ Table ${tableId} not found in storage`);
        this.showErrorPlaceholder(element, 'Table not found');
        return;
      }

      // Replace placeholder with actual content
      element.innerHTML = tableData.html;

      // Mark as loaded
      this.loadedTables.add(tableId);
      element.setAttribute('data-lazy-loaded', 'true');
      element.removeAttribute('data-lazy-placeholder');

      // Stop observing this element
      if (this.observer) {
        this.observer.unobserve(element);
      }

      console.log(`✅ Lazy loaded table: ${tableId}`);

    } catch (error) {
      console.error(`❌ Error lazy loading table ${tableId}:`, error);
      this.showErrorPlaceholder(element, 'Failed to load table');
    }
  }

  /**
   * Create a placeholder for off-screen tables
   * Requirements: 7.1
   */
  createPlaceholder(tableData: FlowiseGeneratedTableRecord): HTMLElement {
    const placeholder = document.createElement('div');
    placeholder.className = 'overflow-x-auto my-4 lazy-table-placeholder';
    
    // Add identifying attributes
    placeholder.setAttribute('data-n8n-table', 'true');
    placeholder.setAttribute('data-n8n-keyword', tableData.keyword);
    placeholder.setAttribute('data-table-id', tableData.id);
    placeholder.setAttribute('data-restored', 'true');
    placeholder.setAttribute('data-source', tableData.source);
    placeholder.setAttribute('data-timestamp', tableData.timestamp);
    placeholder.setAttribute('data-lazy-placeholder', 'true');

    // Create placeholder content
    if (this.config.enablePlaceholder) {
      const placeholderContent = this.createPlaceholderContent(tableData);
      placeholder.appendChild(placeholderContent);
    }

    // Set height to prevent layout shift
    placeholder.style.minHeight = this.config.placeholderHeight || '200px';

    return placeholder;
  }

  /**
   * Create placeholder content with loading indicator
   */
  private createPlaceholderContent(tableData: FlowiseGeneratedTableRecord): HTMLElement {
    const content = document.createElement('div');
    content.className = 'flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600';
    content.style.minHeight = this.config.placeholderHeight || '200px';

    // Loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mb-4';
    content.appendChild(spinner);

    // Loading text
    const text = document.createElement('div');
    text.className = 'text-sm text-gray-600 dark:text-gray-400';
    text.textContent = `Loading table: ${tableData.keyword}`;
    content.appendChild(text);

    // Metadata
    const metadata = document.createElement('div');
    metadata.className = 'text-xs text-gray-500 dark:text-gray-500 mt-2';
    metadata.textContent = `${tableData.metadata.rowCount} rows × ${tableData.metadata.colCount} cols`;
    content.appendChild(metadata);

    return content;
  }

  /**
   * Show error placeholder when loading fails
   */
  private showErrorPlaceholder(element: HTMLElement, errorMessage: string): void {
    const errorContent = document.createElement('div');
    errorContent.className = 'flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-300 dark:border-red-600';
    errorContent.style.minHeight = this.config.placeholderHeight || '200px';

    // Error icon
    const icon = document.createElement('div');
    icon.className = 'text-4xl mb-4';
    icon.textContent = '⚠️';
    errorContent.appendChild(icon);

    // Error text
    const text = document.createElement('div');
    text.className = 'text-sm text-red-600 dark:text-red-400';
    text.textContent = errorMessage;
    errorContent.appendChild(text);

    element.innerHTML = '';
    element.appendChild(errorContent);
    element.setAttribute('data-lazy-error', 'true');
  }

  /**
   * Observe an element for lazy loading
   * Requirements: 7.1
   */
  observe(element: HTMLElement): void {
    if (!this.observer) {
      console.warn('⚠️ Observer not initialized, loading immediately');
      const tableId = element.getAttribute('data-table-id');
      if (tableId) {
        this.loadTableContent(element, tableId);
      }
      return;
    }

    this.observer.observe(element);
  }

  /**
   * Unobserve an element
   */
  unobserve(element: HTMLElement): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  /**
   * Check if a table is already loaded
   */
  isLoaded(tableId: string): boolean {
    return this.loadedTables.has(tableId);
  }

  /**
   * Preload a specific table (bypass lazy loading)
   */
  async preload(tableId: string): Promise<void> {
    if (this.loadedTables.has(tableId)) {
      console.log(`ℹ️ Table ${tableId} already loaded`);
      return;
    }

    const element = document.querySelector(`[data-table-id="${tableId}"]`) as HTMLElement;
    if (!element) {
      console.warn(`⚠️ Element for table ${tableId} not found`);
      return;
    }

    await this.loadTableContent(element, tableId);
  }

  /**
   * Preload multiple tables
   */
  async preloadMultiple(tableIds: string[]): Promise<void> {
    const promises = tableIds.map(id => this.preload(id));
    await Promise.all(promises);
  }

  /**
   * Get statistics about lazy loading
   */
  getStats(): {
    totalObserved: number;
    totalLoaded: number;
    pendingLoads: number;
    loadedPercentage: number;
  } {
    const totalObserved = this.loadedTables.size + this.pendingLoads.size;
    const totalLoaded = this.loadedTables.size;
    const pendingLoads = this.pendingLoads.size;
    const loadedPercentage = totalObserved > 0 ? (totalLoaded / totalObserved) * 100 : 0;

    return {
      totalObserved,
      totalLoaded,
      pendingLoads,
      loadedPercentage
    };
  }

  /**
   * Clear loaded tables cache
   */
  clearCache(): void {
    this.loadedTables.clear();
    this.pendingLoads.clear();
    console.log('✅ Lazy loader cache cleared');
  }

  /**
   * Disconnect the observer and clean up
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.clearCache();
    console.log('✅ FlowiseTableLazyLoader disconnected');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LazyLoadConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reinitialize observer with new config
    if (this.observer) {
      this.observer.disconnect();
    }
    this.initializeObserver();
    
    console.log('✅ Lazy loader configuration updated');
  }
}

// Export singleton instance
export const flowiseTableLazyLoader = new FlowiseTableLazyLoader();
