import NodeCache from "node-cache";

/**
 * Simple in-memory cache service using node-cache
 * For production with multiple servers, consider Redis instead
 */
class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // Default TTL: 5 minutes
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // Performance optimization
    });

    // Log cache statistics every 5 minutes
    setInterval(() => {
      const stats = this.cache.getStats();
      console.log("Cache stats:", {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0,
      });
    }, 300000);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Set value in cache with optional TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (default: 300s)
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 300);
  }

  /**
   * Delete specific key from cache
   */
  del(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Delete multiple keys
   */
  delMultiple(keys: string[]): number {
    return this.cache.del(keys);
  }

  /**
   * Clear all cache
   */
  flush(): void {
    this.cache.flushAll();
  }

  /**
   * Invalidate all keys matching pattern
   * Example: invalidatePattern("employees") clears "employees:*"
   */
  invalidatePattern(pattern: string): void {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    if (matchingKeys.length > 0) {
      this.cache.del(matchingKeys);
      console.log(
        `Cache: Invalidated ${matchingKeys.length} keys matching "${pattern}"`
      );
    }
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return this.cache.keys();
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache key generators
export const CacheKeys = {
  // Employee cache keys
  employeeList: (options: any) => `employees:list:${JSON.stringify(options)}`,
  employeeById: (id: string) => `employee:${id}`,
  employeeByCode: (code: string) => `employee:code:${code}`,
  employeeByEmail: (email: string) => `employee:email:${email}`,
  employeeStats: () => `employees:stats`,

  // Department cache keys
  departmentList: (options: any) =>
    `departments:list:${JSON.stringify(options)}`,
  departmentById: (id: string) => `department:${id}`,
  departmentHierarchy: () => `departments:hierarchy`,
  departmentStats: (id: string) => `department:${id}:stats`,

  // Position cache keys
  positionList: (options: any) => `positions:list:${JSON.stringify(options)}`,
  positionById: (id: string) => `position:${id}`,
  positionHierarchy: () => `positions:hierarchy`,

  // Role cache keys
  roleList: () => `roles:list`,
  roleById: (id: string) => `role:${id}`,
  rolePermissions: (roleId: number) => `role:${roleId}:permissions`,

  // Project cache keys
  projectList: (options: any) => `projects:list:${JSON.stringify(options)}`,
  projectById: (id: string) => `project:${id}`,
  projectByEmployee: (employeeId: string) => `projects:employee:${employeeId}`,

  // Contract cache keys
  contractList: (options: any) => `contracts:list:${JSON.stringify(options)}`,
  contractById: (id: string) => `contract:${id}`,

  // Leave request cache keys
  leaveRequestList: (options: any) =>
    `leave-requests:list:${JSON.stringify(options)}`,
  leaveRequestById: (id: string) => `leave-request:${id}`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  VERY_LONG: 3600, // 1 hour
};
