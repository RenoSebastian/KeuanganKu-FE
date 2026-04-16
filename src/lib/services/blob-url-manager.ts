/**
 * BlobUrlManager - Safe Blob URL Pooling Service for PWA
 * 
 * Solves Android PWA issue: URL.createObjectURL exhaustion after ~50 URLs
 * Strategy: Pool URLs (max 5), LRU eviction, immediate cleanup
 * 
 * Usage:
 *   const manager = new BlobUrlManager();
 *   const url = manager.createObjectURL(blob);
 *   // ... use url ...
 *   manager.revokeObjectURL(url);
 *   // On component cleanup:
 *   manager.cleanup();
 */

export class BlobUrlManager {
    private pool: Map<string, Blob> = new Map();
    private urlMetadata: Map<string, { created: number; lastUsed: number }> = new Map();
    private readonly maxPoolSize = 5;
    private readonly debugMode = false;

    /**
     * Create a blob URL with automatic pooling management
     */
    public createObjectURL(blob: Blob): string {
        // If pool is full, evict LRU entry
        if (this.pool.size >= this.maxPoolSize) {
            this.evictLRU();
        }

        // Create new URL
        const url = URL.createObjectURL(blob);
        const now = Date.now();

        // Store in pool
        this.pool.set(url, blob);
        this.urlMetadata.set(url, {
            created: now,
            lastUsed: now,
        });

        this.debug(`Created URL (pool size: ${this.pool.size}/${this.maxPoolSize})`, url);
        return url;
    }

    /**
     * Revoke a blob URL and remove from pool
     */
    public revokeObjectURL(url: string): void {
        if (this.pool.has(url)) {
            URL.revokeObjectURL(url);
            this.pool.delete(url);
            this.urlMetadata.delete(url);
            this.debug(`Revoked URL (pool size: ${this.pool.size}/${this.maxPoolSize})`, url);
        }
    }

    /**
     * Update last-used timestamp (for LRU tracking)
     */
    public markURLUsed(url: string): void {
        const metadata = this.urlMetadata.get(url);
        if (metadata) {
            metadata.lastUsed = Date.now();
        }
    }

    /**
     * Evict Least Recently Used URL from pool
     */
    private evictLRU(): void {
        let lruUrl: string | null = null;
        let oldestLastUsed = Date.now();

        for (const [url, metadata] of this.urlMetadata.entries()) {
            if (metadata.lastUsed < oldestLastUsed) {
                oldestLastUsed = metadata.lastUsed;
                lruUrl = url;
            }
        }

        if (lruUrl) {
            this.debug(`Evicting LRU URL`, lruUrl);
            this.revokeObjectURL(lruUrl);
        }
    }

    /**
     * Force cleanup all URLs (call on component unmount)
     */
    public cleanup(): void {
        for (const url of this.pool.keys()) {
            URL.revokeObjectURL(url);
            this.urlMetadata.delete(url);
        }
        this.pool.clear();
        this.debug(`Cleanup complete (all URLs revoked)`);
    }

    /**
     * Get pool statistics (for monitoring)
     */
    public getPoolStats(): {
        activeUrls: number;
        maxSize: number;
        oldest: number | null;
        newest: number | null;
    } {
        const times = Array.from(this.urlMetadata.values()).map(m => m.created);
        return {
            activeUrls: this.pool.size,
            maxSize: this.maxPoolSize,
            oldest: times.length > 0 ? Math.min(...times) : null,
            newest: times.length > 0 ? Math.max(...times) : null,
        };
    }

    /**
     * Debug logging (enable in development)
     */
    private debug(message: string, url?: string): void {
        if (this.debugMode) {
            console.log(`[BlobUrlManager] ${message}`, url ? `${url.substring(0, 30)}...` : '');
        }
    }
}

/**
 * Singleton instance for app-wide use
 */
export const blobUrlManager = new BlobUrlManager();
