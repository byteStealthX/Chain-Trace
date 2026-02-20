import { supabase } from '../lib/supabase';

export interface TransactionAnalysis {
    transaction_id: string;
    risk_score: number;
    is_flagged: boolean;
}

export async function analyzeTransactionsBatch(transactions: any[]): Promise<TransactionAnalysis[]> {
    try {
        const { data, error } = await supabase.functions.invoke('analyze-transactions', {
            body: { transactions },
        });

        if (error) {
            console.error('Edge Function error:', error);
            return [];
        }

        return data.results || [];
    } catch (err) {
        console.error('Edge Function call failed:', err);
        return [];
    }
}

export async function resetDb(): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.rpc('reset_db');
        if (error) throw error;
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Reset failed' };
    }
}

export async function generateReport(): Promise<any> {
    try {
        const { data, error } = await supabase.functions.invoke('generate-report');
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Report generation failed:', err);
        return null;
    }
}
