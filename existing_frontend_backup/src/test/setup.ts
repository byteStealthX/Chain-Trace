import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mock for Supabase client to avoid env var requirements in tests
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
            upsert: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            })),
        },
    },
    isSupabaseConfigured: () => true,
    testSupabaseConnection: () => Promise.resolve({ connected: true }),
}));
