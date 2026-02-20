
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Account, Transaction, FraudRing, SuspiciousAccount } from '../types/database';

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
            } catch (err: unknown) {
                console.error('Error fetching transactions:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, []);

    return { transactions, loading, error };
}

export function useFraudSummary() {
    const [rings, setRings] = useState<FraudRing[]>([]);
    const [suspiciousAccounts, setSuspiciousAccounts] = useState<SuspiciousAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [ringsRes, accountsRes] = await Promise.all([
                    // ✅ Use detected_at (the real column name in fraud_rings)
                    supabase.from('fraud_rings').select('*').order('detected_at', { ascending: false }).limit(20),
                    supabase.from('suspicious_accounts').select('*').order('suspicion_score', { ascending: false }).limit(20)
                ]);

                if (ringsRes.error) console.error('fraud_rings query error:', ringsRes.error.message);
                if (accountsRes.error) console.error('suspicious_accounts query error:', accountsRes.error.message);

                if (ringsRes.data) setRings(ringsRes.data);
                if (accountsRes.data) setSuspiciousAccounts(accountsRes.data);
            } catch (err) {
                console.error('Error fetching summary:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { rings, suspiciousAccounts, loading };
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
                const [txCount, flaggedCount, recentTx, lastRing] = await Promise.all([
                    supabase.from('transactions').select('*', { count: 'exact', head: true }),
                    supabase.from('accounts').select('*', { count: 'exact', head: true }).or('risk_level.eq.high,risk_level.eq.critical'),
                    supabase.from('transactions')
                        .select(`
                            *,
                            sender:accounts!sender_id(account_id, account_name),
                            receiver:accounts!receiver_id(account_id, account_name)
                        `)
                        .order('timestamp', { ascending: false })
                        .limit(5),
                    // ✅ Use detected_at (the real column in fraud_rings)
                    supabase.from('fraud_rings')
                        .select('detected_at')
                        .order('detected_at', { ascending: false })
                        .limit(1)
                ]);

                // Compute lastScan from the most recent fraud ring analysis
                let lastScan = 'Never';
                if (lastRing.data && lastRing.data.length > 0) {
                    const scanDate = new Date(lastRing.data[0].detected_at);
                    const now = new Date();
                    const diffMs = now.getTime() - scanDate.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    const diffDays = Math.floor(diffHours / 24);

                    if (diffMins < 1) lastScan = 'Just now';
                    else if (diffMins < 60) lastScan = `${diffMins}m ago`;
                    else if (diffHours < 24) lastScan = `${diffHours}h ago`;
                    else lastScan = `${diffDays}d ago`;
                }

                setStats({
                    totalTransactions: txCount.count || 0,
                    flaggedAccounts: flaggedCount.count || 0,
                    lastScan,
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

// ── Analytics hook ───────────────────────────────────────────────────────────
export interface AnalyticsStats {
    fraudRingCount: number;
    accountCount: number;
    suspiciousAccountCount: number;
    flaggedTxCount: number;
    totalTxCount: number;
    volumeByDate: { date: string; legitimate: number; suspicious: number }[];
    riskDistribution: { low: number; medium: number; high: number; total: number };
}

export function useAnalyticsData(rangeDays: 7 | 30 | 90 = 7) {
    const [data, setData] = useState<AnalyticsStats>({
        fraudRingCount: 0,
        accountCount: 0,
        suspiciousAccountCount: 0,
        flaggedTxCount: 0,
        totalTxCount: 0,
        volumeByDate: [],
        riskDistribution: { low: 0, medium: 0, high: 0, total: 0 },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            try {
                const dateFrom = new Date();
                dateFrom.setDate(dateFrom.getDate() - rangeDays);
                const dateFromStr = dateFrom.toISOString();

                const [rings, accounts, suspicious, txs] = await Promise.all([
                    // ✅ fraud_rings uses detected_at, not created_at
                    supabase.from('fraud_rings').select('*', { count: 'exact', head: true }),
                    supabase.from('accounts').select('*', { count: 'exact', head: true }),
                    supabase.from('suspicious_accounts').select('risk_label'),
                    supabase.from('transactions')
                        .select('amount, timestamp, is_flagged, risk_score')
                        .gte('timestamp', dateFromStr)
                        .order('timestamp', { ascending: true }),
                ]);

                if (rings.error) console.error('fraud_rings count error:', rings.error.message);
                if (accounts.error) console.error('accounts count error:', accounts.error.message);

                // --- Volume by date ---
                const byDate: Record<string, { legitimate: number; suspicious: number }> = {};
                for (let i = rangeDays - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    byDate[key] = { legitimate: 0, suspicious: 0 };
                }

                for (const tx of txs.data || []) {
                    const key = new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (byDate[key]) {
                        if (tx.is_flagged) {
                            byDate[key].suspicious += tx.amount;
                        } else {
                            byDate[key].legitimate += tx.amount;
                        }
                    }
                }

                const volumeByDate = Object.entries(byDate).map(([date, v]) => ({ date, ...v }));

                // --- Risk distribution from suspicious_accounts ---
                const riskCounts = { low: 0, medium: 0, high: 0, total: 0 };
                for (const sa of suspicious.data || []) {
                    riskCounts.total++;
                    if (sa.risk_label === 'low') riskCounts.low++;
                    else if (sa.risk_label === 'moderate') riskCounts.medium++;
                    else if (sa.risk_label === 'high' || sa.risk_label === 'critical') riskCounts.high++;
                }

                const allTxs = txs.data || [];
                setData({
                    fraudRingCount: rings.count || 0,
                    accountCount: accounts.count || 0,
                    suspiciousAccountCount: suspicious.data?.length || 0,
                    flaggedTxCount: allTxs.filter(t => t.is_flagged).length,
                    totalTxCount: allTxs.length,
                    volumeByDate,
                    riskDistribution: riskCounts,
                });
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, [rangeDays]);

    return { data, loading };
}
