import { describe, it, expect, vi } from 'vitest';
import { parseCsvFile, validateCsv } from '../services/csvService';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
            })),
        })),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            })),
        },
    },
}));

describe('CSV Service', () => {
    it('validates correct headers', () => {
        const validHeaders = ['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp'];
        const validRow = {
            transaction_id: 'tx1',
            sender_id: 'A',
            receiver_id: 'B',
            amount: '100',
            timestamp: new Date().toISOString()
        };
        const mockParseResult = { rows: [validRow], headers: validHeaders, totalRows: 1 };
        const result = validateCsv(mockParseResult);
        if (!result.valid) console.log('Validation failed:', JSON.stringify(result, null, 2));
        expect(result.valid).toBe(true);
        expect(result.missingHeaders).toHaveLength(0);
    });

    it('detects missing headers', () => {
        const invalidHeaders = ['sender_id', 'amount']; // missing receiver_id, timestamp
        const mockParseResult = { rows: [], headers: invalidHeaders, totalRows: 0 };
        const result = validateCsv(mockParseResult);
        expect(result.valid).toBe(false);
        expect(result.missingHeaders).toContain('receiver_id');
        expect(result.missingHeaders).toContain('timestamp');
    });

    it('parses valid CSV content', async () => {
        const csvContent = `sender_id,receiver_id,amount,timestamp
A,B,100,2023-01-01T12:00:00Z
B,C,200,2023-01-01T12:05:00Z`;

        const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

        const result = await parseCsvFile(file);

        expect(result.rows).toHaveLength(2);
        expect(result.rows[0].sender_id).toBe('A');
        expect(result.rows[0].amount).toBe('100'); // parsed as string initially by PapaParse
    });
});
