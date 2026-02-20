import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function subscribeToTransactions(onInsert: (payload: any) => void): RealtimeChannel {
    return supabase
        .channel('transactions-realtime')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'transactions' },
            (payload) => {
                onInsert(payload.new);
            }
        )
        .subscribe();
}
