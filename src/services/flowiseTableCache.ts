/**
 * FlowiseTableCache
 * 
 * LRU (Least Recently Used) cache for frequently accessed tables.
 * Reduces IndexedDB queries by caching recently accessed tables in memory.
 * 
 * Requirements: 7.1 - Performance optimization
 * Task 13.3: Implement caching
 */

import type { FlowiseGeneratedTableRecord } from '../types/flowise_table_types';

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  table: FlowiseGeneratedTableRecord;
  accessCount: number;
  lastAccessed: number;
  cachedAt: number;
}

/**
 * Cache statistics
 */
interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  totalAccesses: number;
}

export class FlowiseTableCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number; // Not readonly to allow dynamic resizing
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
    console.log(`✅ FlowiseTableCache initialized with max size: ${maxSize}`);
  }

  /**
   * Get a table from cache
   * Requirements: 7.1
   * Task 13.3: LRU cache with max 50 entries
   */
  get(tableId: string): FlowiseGeneratedTableRecord | null {
    const entry = this.cache.get(tableId);

    if (entry) {
      // Cache hit - update access metadata
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.hits++;

      console.log(`✅ Cache hit for table: ${tableId} (${entry.accessCount} accesses)`);
      return entry.table;
    }

    // Cache miss
    this.misses++;
    console.log(`❌ Cache miss for table: ${tableId}`);
    return null;
  }

  /**
   * Add or update a table in cache
   * Requirements: 7.1
   * Task 13.3: LRU cache implementation
   */
  set(tableId: string, table: FlowiseGeneratedTableRecord): void {
    const now = Date.now();

    // Check if table already exists in cache
    if (this.cache.has(tableId)) {
      // Update existing entry
      const entry = this.cache.get(tableId)!;
      entry.table = table;
      entry.accessCount++;
      entry.lastAccessed = now;
      console.log(`🔄 Updated cached table: ${tableId}`);
      return;
    }

    // Check if cache is full
    if (this.cache.size >= this.maxSize) {
      // Evict least recently used entry
      this.evictLRU();
    }

    // Add new entry
    const entry: CacheEntry = {
      table,
      accessCount: 1,
      lastAccessed: now,
      cachedAt: now
    };

    this.cache.set(tableId, entry);
    console.log(`✅ Cached table: ${tableId} (cache size: ${this.cache.size}/${this.maxSize})`);
  }

  /**
   * Evict the least recently used entry
   * Task 13.3: LRU eviction policy
   */
  private evictLRU(): void {
    let lruTableId: string | null = null;
    let lruTime = Infinity;

    // Find the least recently used entry
    for (const [tableId, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruTableId = tableId;
      }
    }

    if (lruTableId) {
      this.cache.delete(lruTableId);
      this.evictions++;
      console.log(`🗑️ Evicted LRU table: ${lruTableId} (last accessed: ${new Date(lruTime).toISOString()})`);
    }
  }

  /**
   * Check if a table is in cache
   */
  has(tableId: string): boolean {
    return this.cache.has(tableId);
  }

  /**
   * Remove a specific table from cache
   * Task 13.3: Invalidate cache on updates
   */
  invalidate(tableId: string): boolean {
    const deleted = this.cache.delete(tableId);
    if (deleted) {
      console.log(`🗑️ Invalidated cache for table: ${tableId}`);
    }
    return deleted;
  }

  /**
   * Invalidate multiple tables
   * Task 13.3: Batch invalidation
   */
  invalidateMultiple(tableIds: string[]): number {
    let count = 0;
    for (const tableId of tableIds) {
      if (this.invalidate(tableId)) {
        count++;
      }
    }
    console.log(`🗑️ Invalidated ${count} table(s) from cache`);
    return count;
  }

  /**
   * Invalidate all tables for a specific session
   * Task 13.3: Session-based invalidation
   */
  invalidateSession(sessionId: string): number {
    let count = 0;
    const toDelete: string[] = [];

    // Find all tables for this session
    for (const [tableId, entry] of this.cache.entries()) {
      if (entry.table.sessionId === sessionId) {
        toDelete.push(tableId);
      }
    }

    // Delete them
    for (const tableId of toDelete) {
      this.cache.delete(tableId);
      count++;
    }

    if (count > 0) {
      console.log(`🗑️ Invalidated ${count} table(s) for session: ${sessionId}`);
    }

    return count;
  }

  /**
   * Clear the entire cache
   * Task 13.3: Clear cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared cache (${size} entries removed)`);
  }

  /**
   * Get cache statistics
   * Task 13.3: Monitor cache performance
   */
  getStats(): CacheStats {
    const totalAccesses = this.hits + this.misses;
    const hitRate = totalAccesses > 0 ? (this.hits / totalAccesses) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      evictions: this.evictions,
      totalAccesses
    };
  }

  /**
   * Get detailed cache information
   */
  getDetailedInfo(): Array<{
    tableId: string;
    keyword: string;
    sessionId: string;
    accessCount: number;
    lastAccessed: Date;
    cachedAt: Date;
    ageMs: number;
  }> {
    const now = Date.now();
    const info: Array<any> = [];

    for (const [tableId, entry] of this.cache.entries()) {
      info.push({
        tableId,
        keyword: entry.table.keyword,
        sessionId: entry.table.sessionId,
        accessCount: entry.accessCount,
        lastAccessed: new Date(entry.lastAccessed),
        cachedAt: new Date(entry.cachedAt),
        ageMs: now - entry.cachedAt
      });
    }

    // Sort by access count (most accessed first)
    info.sort((a, b) => b.accessCount - a.accessCount);

    return info;
  }

  /**
   * Get most frequently accessed tables
   */
  getMostAccessed(limit: number = 10): Array<{
    tableId: string;
    keyword: string;
    accessCount: number;
  }> {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access count
    entries.sort((a, b) => b[1].accessCount - a[1].accessCount);

    // Take top N
    return entries.slice(0, limit).map(([tableId, entry]) => ({
      tableId,
      keyword: entry.table.keyword,
      accessCount: entry.accessCount
    }));
  }

  /**
   * Get least recently used tables
   */
  getLeastRecentlyUsed(limit: number = 10): Array<{
    tableId: string;
    keyword: string;
    lastAccessed: Date;
  }> {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // Take top N
    return entries.slice(0, limit).map(([tableId, entry]) => ({
      tableId,
      keyword: entry.table.keyword,
      lastAccessed: new Date(entry.lastAccessed)
    }));
  }

  /**
   * Preload multiple tables into cache
   * Task 13.3: Preload frequently accessed tables
   */
  preload(tables: FlowiseGeneratedTableRecord[]): number {
    let count = 0;
    for (const table of tables) {
      if (!this.cache.has(table.id)) {
        this.set(table.id, table);
        count++;
      }
    }
    console.log(`✅ Preloaded ${count} table(s) into cache`);
    return count;
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSizeBytes(): number {
    let totalSize = 0;

    for (const [, entry] of this.cache.entries()) {
      // Approximate size: HTML content + metadata
      totalSize += entry.table.html.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(entry.table.metadata).length * 2;
    }

    return totalSize;
  }

  /**
   * Get cache size in human-readable format
   */
  getSizeFormatted(): string {
    const bytes = this.getSizeBytes();
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    console.log('✅ Cache statistics reset');
  }

  /**
   * Update max cache size
   */
  setMaxSize(newMaxSize: number): void {
    if (newMaxSize < 1) {
      console.warn('⚠️ Max size must be at least 1');
      return;
    }

    this.maxSize = newMaxSize;

    // Evict entries if current size exceeds new max
    while (this.cache.size > this.maxSize) {
      this.evictLRU();
    }

    console.log(`✅ Cache max size updated to: ${newMaxSize}`);
  }

  /**
   * Get current cache size
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Get max cache size
   */
  getMaxSize(): number {
    return this.maxSize;
  }

  /**
   * Check if cache is full
   */
  isFull(): boolean {
    return this.cache.size >= this.maxSize;
  }

  /**
   * Get cache utilization percentage
   */
  getUtilization(): number {
    return (this.cache.size / this.maxSize) * 100;
  }
}

// Export singleton instance with default max size of 50
export const flowiseTableCache = new FlowiseTableCache(50);
