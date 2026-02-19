import { useState, useEffect } from 'react';
import {
    supabase,
    testSupabaseConnection,
    isSupabaseConfigured,
    type ConnectionTestResult,
} from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// useSupabaseQuery — generic hook for SELECT queries
// ---------------------------------------------------------------------------
interface QueryState<T> {
    data: T[] | null;
    loading: boolean;
    error: string | null;
}

export function useSupabaseQuery<T>(
    table: string,
    options?: {
        select?: string;
        orderBy?: { column: string; ascending?: boolean };
        limit?: number;
        filters?: Array<{ column: string; operator: string; value: unknown }>;
    }
) {
    const [state, setState] = useState<QueryState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            let query = supabase
                .from(table)
                .select(options?.select ?? '*');

            // Apply filters
            if (options?.filters) {
                for (const f of options.filters) {
                    query = query.filter(f.column, f.operator, f.value);
                }
            }

            // Ordering
            if (options?.orderBy) {
                query = query.order(options.orderBy.column, {
                    ascending: options.orderBy.ascending ?? true,
                });
            }

            // Limit
            if (options?.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query;

            if (!cancelled) {
                setState({
                    data: error ? null : (data as T[]),
                    loading: false,
                    error: error?.message ?? null,
                });
            }
        }

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [table, options?.select, options?.limit, options?.orderBy?.column, options?.orderBy?.ascending, options?.filters]);

    return state;
}

// ---------------------------------------------------------------------------
// useConnectionTest — hook to test Supabase connection
// ---------------------------------------------------------------------------
export function useConnectionTest() {
    const [result, setResult] = useState<ConnectionTestResult | null>(null);
    const [testing, setTesting] = useState(false);
    const configured = isSupabaseConfigured();

    const runTest = async () => {
        setTesting(true);
        const res = await testSupabaseConnection();
        setResult(res);
        setTesting(false);
        return res;
    };

    return { result, testing, configured, runTest };
}

// ---------------------------------------------------------------------------
// useRealtimeSubscription — subscribe to Supabase Realtime changes
// ---------------------------------------------------------------------------
export function useRealtimeSubscription(
    table: string,
    onInsert?: (payload: unknown) => void,
    onUpdate?: (payload: unknown) => void,
    onDelete?: (payload: unknown) => void,
) {
    useEffect(() => {
        const channel: RealtimeChannel = supabase
            .channel(`${table}-changes`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table },
                (payload) => onInsert?.(payload.new)
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table },
                (payload) => onUpdate?.(payload.new)
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table },
                (payload) => onDelete?.(payload.old)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, onInsert, onUpdate, onDelete]);
}
