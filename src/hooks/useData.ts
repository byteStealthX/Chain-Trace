
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Account, Transaction, FraudAlert, Report } from '../types/database';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select(`
            *,
            sender:accounts!sender_id(account_id, account_name),
            receiver:accounts!receiver_id(account_id, account_name)
          `)
                    .order('timestamp', { ascending: false });

                if (error) throw error;
                setTransactions(data || []);
            } catch (err: any) {
                console.error('Error fetching transactions:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, []);

    return { transactions, loading, error };
}

export function useFraudSummary() {
    const [alerts, setAlerts] = useState<FraudAlert[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [alertsRes, reportsRes] = await Promise.all([
                    supabase.from('fraud_alerts').select('*').order('created_at', { ascending: false }).limit(50),
                    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(1)
                ]);

                if (alertsRes.data) setAlerts(alertsRes.data);
                if (reportsRes.data) setReports(reportsRes.data);
            } catch (err) {
                console.error('Error fetching summary:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { alerts, reports, loading };
}

export function useDashboardStats() {
    const [stats, setStats] = useState({
        totalTransactions: 0,
        flaggedAccounts: 0,
        lastScan: 'Never',
        recentTransactions: [] as Transaction[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch counts
                const [txCount, flaggedCount, recentTx] = await Promise.all([
                    supabase.from('transactions').select('*', { count: 'exact', head: true }),
                    supabase.from('accounts').select('*', { count: 'exact', head: true }).or('risk_level.eq.high,risk_level.eq.critical'),
                    supabase.from('transactions')
                        .select(`
                            *,
                            sender:accounts!sender_id(account_id, account_name),
                            receiver:accounts!receiver_id(account_id, account_name)
                        `)
                        .order('timestamp', { ascending: false })
                        .limit(5)
                ]);

                setStats({
                    totalTransactions: txCount.count || 0,
                    flaggedAccounts: flaggedCount.count || 0,
                    lastScan: 'Just now', // Mock for now, or fetch from logs
                    recentTransactions: recentTx.data || []
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    return { stats, loading };
}
