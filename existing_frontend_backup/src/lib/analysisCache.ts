import { type AnalysisResult, type SuspiciousAccount } from '../services/analysisService';

// ── Analysis cache with TTL and version-based invalidation ────────────
// This ensures analysis only runs once after upload, and subsequent page
// navigations (Dashboard, Graph, Reports) reuse the cached result.

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    version: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class AnalysisCache {
    private analysisCache: CacheEntry<AnalysisResult> | null = null;
    private suspiciousCache: CacheEntry<SuspiciousAccount[]> | null = null;
    private version = 0;
    private ttlMs = DEFAULT_TTL_MS;
    private listeners = new Set<() => void>();

    // ── Version management ────────────────────────────────────────────
    /** Call after a successful CSV upload to invalidate all caches */
    invalidate(): void {
        this.version++;
        this.analysisCache = null;
        this.suspiciousCache = null;
        this.notifyListeners();
    }

    getVersion(): number {
        return this.version;
    }

    // ── Analysis result cache ─────────────────────────────────────────
    getAnalysis(): AnalysisResult | null {
        if (!this.analysisCache) return null;
        if (this.isExpired(this.analysisCache)) {
            this.analysisCache = null;
            return null;
        }
        return this.analysisCache.data;
    }

    setAnalysis(data: AnalysisResult): void {
        this.analysisCache = {
            data,
            timestamp: Date.now(),
            version: this.version,
        };
    }

    // ── Suspicious accounts cache ─────────────────────────────────────
    getSuspiciousAccounts(): SuspiciousAccount[] | null {
        if (!this.suspiciousCache) return null;
        if (this.isExpired(this.suspiciousCache)) {
            this.suspiciousCache = null;
            return null;
        }
        return this.suspiciousCache.data;
    }

    setSuspiciousAccounts(data: SuspiciousAccount[]): void {
        this.suspiciousCache = {
            data,
            timestamp: Date.now(),
            version: this.version,
        };
    }

    // ── TTL check ─────────────────────────────────────────────────────
    private isExpired<T>(entry: CacheEntry<T>): boolean {
        if (entry.version !== this.version) return true;
        return Date.now() - entry.timestamp > this.ttlMs;
    }

    // ── Listeners (for React integration) ─────────────────────────────
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach((fn) => fn());
    }

    // ── Stats ─────────────────────────────────────────────────────────
    getStats() {
        return {
            hasAnalysis: this.analysisCache !== null,
            hasSuspicious: this.suspiciousCache !== null,
            version: this.version,
            analysisAge: this.analysisCache
                ? Math.round((Date.now() - this.analysisCache.timestamp) / 1000)
                : null,
        };
    }

    /** Clear everything */
    clear(): void {
        this.analysisCache = null;
        this.suspiciousCache = null;
        this.notifyListeners();
    }
}

// ── Singleton ─────────────────────────────────────────────────────────
export const analysisCache = new AnalysisCache();
