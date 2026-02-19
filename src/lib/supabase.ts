import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment variables — set these in your .env file
// ---------------------------------------------------------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase credentials missing.\n' +
        '   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
        '   See .env.example for reference.'
    );
}

// ---------------------------------------------------------------------------
// Supabase Client — secure configuration
// ---------------------------------------------------------------------------
export const supabase = createClient(
    supabaseUrl ?? '',
    supabaseAnonKey ?? '',
    {
        auth: {
            autoRefreshToken: true,      // Auto-refresh JWT before expiry
            persistSession: true,        // Persist auth session to localStorage
            detectSessionInUrl: true,    // Handle OAuth redirects
        },
        global: {
            headers: {
                'X-Client-Info': 'chain-trace/1.0.0',   // Identify app in Supabase logs
            },
        },
        db: {
            schema: 'public',           // Default schema
        },
    }
);

// ---------------------------------------------------------------------------
// Connection test — call this to verify Supabase is reachable
// ---------------------------------------------------------------------------
export interface ConnectionTestResult {
    connected: boolean;
    latency_ms: number;
    error?: string;
    timestamp: string;
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
    const start = performance.now();
    const timestamp = new Date().toISOString();

    try {
        // Simple health-check: query the current server time
        const { error } = await supabase
            .from('accounts')
            .select('id')
            .limit(1);

        const latency = Math.round(performance.now() - start);

        if (error) {
            // Table might not exist yet — that's OK for initial setup
            // A "relation does not exist" error still means Supabase IS connected
            const isTableMissing =
                error.message?.includes('does not exist') ||
                error.code === '42P01';

            return {
                connected: isTableMissing ? true : false,
                latency_ms: latency,
                error: isTableMissing
                    ? 'Connected, but "accounts" table not yet created. Run the migration first.'
                    : error.message,
                timestamp,
            };
        }

        return { connected: true, latency_ms: latency, timestamp };
    } catch (err) {
        const latency = Math.round(performance.now() - start);
        return {
            connected: false,
            latency_ms: latency,
            error: err instanceof Error ? err.message : 'Unknown error',
            timestamp,
        };
    }
}

// ---------------------------------------------------------------------------
// Helper: check if Supabase is configured (env vars present)
// ---------------------------------------------------------------------------
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
}
