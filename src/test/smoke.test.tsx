import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock Supabase globally for the App tree
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
        })),
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
    },
    isSupabaseConfigured: () => true,
    testSupabaseConnection: () => Promise.resolve({ connected: true }),
}));

// Mock the lazy loaded components to avoid suspense issues in simple smoke test
vi.mock('../pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('../pages/GraphView', () => ({ default: () => <div>Graph Page</div> }));
vi.mock('../pages/Reports', () => ({ default: () => <div>Reports Page</div> }));

describe('App Smoke Test', () => {
    it('renders the home page by default', async () => {
        render(<App />);

        // Wait for lazy loading/suspense
        await waitFor(() => {
            // Check for text that exists on Home page (e.g. "Chain-Trace")
            // Note: The Navbar is always there, so "Chain-Trace" logo text should be visible
            // Check for navigation bar which is critical
            expect(screen.getByRole('navigation')).toBeInTheDocument();
            // Also check for "Upload" link which is always present
            expect(screen.getByText(/Upload/i)).toBeInTheDocument();
        });
    });
});
