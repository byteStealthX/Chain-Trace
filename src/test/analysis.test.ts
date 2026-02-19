import { describe, it, expect, vi } from 'vitest';
import { analyzeTransactionsLocal } from '../services/analysisService';
import { analysisCache } from '../lib/analysisCache';

// Mock Supabase to avoid real network calls
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                order: () => Promise.resolve({
                    data: [
                        {
                            id: 'tx1', sender_id: 'A', receiver_id: 'B', amount: 5000,
                            timestamp: '2023-01-01T10:00:00Z', risk_score: 10, is_flagged: false
                        },
                        {
                            id: 'tx2', sender_id: 'B', receiver_id: 'C', amount: 5000,
                            timestamp: '2023-01-01T10:05:00Z', risk_score: 10, is_flagged: false
                        },
                        {
                            id: 'tx3', sender_id: 'C', receiver_id: 'A', amount: 4800,
                            timestamp: '2023-01-01T10:10:00Z', risk_score: 80, is_flagged: true
                        }
                    ],
                    error: null
                })
            })
        })
    }
}));

describe('Analysis Service', () => {
    it('detects transactions and builds graph correctly', async () => {
        const result = await analyzeTransactionsLocal({}, { skipCache: true });

        expect(result.data).toBeDefined();
        // 3 unique nodes: A, B, C
        expect(result.data?.nodes).toHaveLength(3);
        // 3 edges
        expect(result.data?.edges).toHaveLength(3);
        // Total volume = 5000 + 5000 + 4800 = 14800
        expect(result.data?.total_volume).toBe(14800);
    });

    it('caches results after analysis', async () => {
        // Clear cache first
        analysisCache.invalidate();

        // First run
        await analyzeTransactionsLocal({}, { skipCache: true });

        // Check cache
        const cached = analysisCache.getAnalysis();
        expect(cached).toBeDefined();
        expect(cached?.nodes).toHaveLength(3);
    });
});
