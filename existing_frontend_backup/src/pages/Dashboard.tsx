import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineRefresh,
    HiOutlineExclamationCircle,
    HiOutlineShieldExclamation,
    HiOutlineUserGroup,
    HiOutlineFingerPrint,
    HiOutlineLightningBolt,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineExternalLink,
} from 'react-icons/hi';
import {
    analyzeTransactionsLocal,
    fetchSuspiciousAccounts,
    type AnalysisResult,
    type FraudRing,
    type SuspiciousAccount,
} from '../services/analysisService';
import { subscribeToTransactions } from '../services/realtimeService';
import { resetDb, generateReport } from '../services/functionService';

// ── Helpers ───────────────────────────────────────────────────────────
const PATTERN_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    circular_routing: { label: 'Circular Routing', color: 'text-rose-400 bg-rose-500/15', icon: '🔄' },
    smurfing_fan_in: { label: 'Smurfing (Fan-In)', color: 'text-amber-400 bg-amber-500/15', icon: '📥' },
    smurfing_fan_out: { label: 'Smurfing (Fan-Out)', color: 'text-orange-400 bg-orange-500/15', icon: '📤' },
    layered_shell_network: { label: 'Shell Network', color: 'text-purple-400 bg-purple-500/15', icon: '🐚' },
};

const SEVERITY_COLORS: Record<string, string> = {
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    high: 'bg-red-500/15 text-red-400 border-red-500/30',
    critical: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function ringId(_ring: FraudRing, idx: number): string {
    return `RING-${String(idx + 1).padStart(3, '0')}`;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [suspiciousAccounts, setSuspiciousAccounts] = useState<SuspiciousAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    // ── Actions ─────────────────────────────────────────────────────────
    const handleReset = async () => {
        if (!confirm('Are you sure you want to delete ALL data?')) return;
        setActionLoading(true);
        const res = await resetDb();
        if (res.success) {
            await loadData();
        } else {
            alert('Failed to reset: ' + res.error);
        }
        setActionLoading(false);
    };

    const handleReport = async () => {
        setActionLoading(true);
        const report = await generateReport();
        if (report) {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fraud-report-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('Failed to generate report');
        }
        setActionLoading(false);
    };
    const [expandedRing, setExpandedRing] = useState<number | null>(null);
    const [sortField, setSortField] = useState<'severity' | 'members' | 'amount'>('severity');
    const [sortAsc, setSortAsc] = useState(false);
    const [filterType, setFilterType] = useState<string>('all');

    // ── Load data ───────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        const [analysisRes, saRes] = await Promise.all([
            analyzeTransactionsLocal(),
            fetchSuspiciousAccounts({ limit: 10 }),
        ]);

        if (analysisRes.error) {
            setError(analysisRes.error);
        } else {
            setAnalysis(analysisRes.data);
        }

        if (saRes.data) setSuspiciousAccounts(saRes.data);

        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Realtime Subscription ───────────────────────────────────────────
    useEffect(() => {
        const subscription = subscribeToTransactions((newTransaction) => {
            // Optional: Show toast or just silence refresh
            console.log('New transaction received:', newTransaction);
            loadData();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [loadData]);

    // ── Sort/filter ring data ───────────────────────────────────────────
    const rings = analysis?.fraud_rings ?? [];

    const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

    const filteredRings = rings.filter((r) =>
        filterType === 'all' ? true : r.ring_type === filterType
    );

    const sortedRings = [...filteredRings].sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
            case 'severity':
                cmp = (severityOrder[a.severity] ?? 0) - (severityOrder[b.severity] ?? 0);
                break;
            case 'members':
                cmp = a.accounts.length - b.accounts.length;
                break;
            case 'amount':
                cmp = a.total_amount - b.total_amount;
                break;
        }
        return sortAsc ? cmp : -cmp;
    });

    // ── Navigate to graph with highlighted ring ─────────────────────────
    const highlightRingInGraph = (ring: FraudRing) => {
        // Pass ring accounts as query params so the graph page can highlight them
        const params = new URLSearchParams({
            highlight: ring.accounts.join(','),
            ring_type: ring.ring_type,
        });
        navigate(`/graph?${params.toString()}`);
    };

    // ── Toggle sort ─────────────────────────────────────────────────────
    const toggleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    const SortIcon = ({ field }: { field: typeof sortField }) => {
        if (sortField !== field) return null;
        return sortAsc
            ? <HiOutlineChevronUp className="h-3 w-3 inline ml-1" />
            : <HiOutlineChevronDown className="h-3 w-3 inline ml-1" />;
    };

    // ── Stats cards ─────────────────────────────────────────────────────
    const statsCards = [
        {
            label: 'Total Fraud Rings',
            value: analysis?.fraud_ring_count ?? 0,
            icon: <HiOutlineShieldExclamation className="h-6 w-6" />,
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10',
        },
        {
            label: 'Suspicious Accounts',
            value: analysis?.suspicious_account_count ?? 0,
            icon: <HiOutlineUserGroup className="h-6 w-6" />,
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
        },
        {
            label: 'Circular Patterns',
            value: analysis?.circular_routing_count ?? 0,
            icon: <HiOutlineFingerPrint className="h-6 w-6" />,
            color: 'text-violet-400',
            bgColor: 'bg-violet-500/10',
        },
        {
            label: 'Flagged Edges',
            value: analysis?.flagged_edges ?? 0,
            icon: <HiOutlineLightningBolt className="h-6 w-6" />,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
        },
    ];

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <div className="animate-fade-in-up space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        Fraud Detection Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Real-time analysis of transaction patterns and risk scoring.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        disabled={loading || actionLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                    >
                        {actionLoading ? 'Processing...' : 'Reset DB'}
                    </button>
                    <button
                        onClick={handleReport}
                        disabled={loading || actionLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                    >
                        <HiOutlineExternalLink className="h-5 w-5" />
                        Download Report
                    </button>
                    <button
                        onClick={loadData}
                        disabled={loading || actionLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <HiOutlineRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-5 flex items-center gap-4"
                    >
                        <div className={`rounded-lg p-2.5 ${card.bgColor} ${card.color}`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                            <p className="text-xs text-gray-500">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm">
                    <HiOutlineExclamationCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                    <span className="text-rose-300">{error}</span>
                </div>
            )}

            {/* Fraud rings table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                {/* Table header bar */}
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <HiOutlineShieldExclamation className="h-5 w-5 text-rose-400" />
                        Fraud Rings
                        {rings.length > 0 && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                                ({filteredRings.length} of {rings.length})
                            </span>
                        )}
                    </h2>

                    {/* Filter dropdown */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-violet-500/50"
                    >
                        <option value="all">All Patterns</option>
                        <option value="circular_routing">Circular Routing</option>
                        <option value="smurfing_fan_in">Smurfing (Fan-In)</option>
                        <option value="smurfing_fan_out">Smurfing (Fan-Out)</option>
                        <option value="layered_shell_network">Shell Network</option>
                    </select>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <HiOutlineRefresh className="h-6 w-6 text-violet-400 animate-spin mr-3" />
                        <span className="text-sm text-gray-400">Loading fraud rings…</span>
                    </div>
                )}

                {/* Empty state */}
                {!loading && sortedRings.length === 0 && (
                    <div className="text-center py-16">
                        <HiOutlineShieldExclamation className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">No fraud rings detected</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Upload transactions and run analysis to detect fraud patterns
                        </p>
                    </div>
                )}

                {/* Table */}
                {!loading && sortedRings.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-3 font-medium">Ring ID</th>
                                    <th className="px-6 py-3 font-medium">Pattern Type</th>
                                    <th
                                        className="px-6 py-3 font-medium cursor-pointer hover:text-gray-300 transition-colors"
                                        onClick={() => toggleSort('members')}
                                    >
                                        Members <SortIcon field="members" />
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium cursor-pointer hover:text-gray-300 transition-colors"
                                        onClick={() => toggleSort('severity')}
                                    >
                                        Risk Score <SortIcon field="severity" />
                                    </th>
                                    <th
                                        className="px-6 py-3 font-medium cursor-pointer hover:text-gray-300 transition-colors"
                                        onClick={() => toggleSort('amount')}
                                    >
                                        Total Amount <SortIcon field="amount" />
                                    </th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRings.map((ring, idx) => {
                                    const id = ringId(ring, idx);
                                    const pattern = PATTERN_LABELS[ring.ring_type] ?? {
                                        label: ring.ring_type,
                                        color: 'text-gray-400 bg-gray-500/15',
                                        icon: '❓',
                                    };
                                    const isExpanded = expandedRing === idx;

                                    return (
                                        <tr key={idx} className="group">
                                            {/* Main row */}
                                            <td className="border-b border-white/5 px-6 py-4">
                                                <button
                                                    onClick={() => setExpandedRing(isExpanded ? null : idx)}
                                                    className="flex items-center gap-2 font-mono text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                                >
                                                    {isExpanded
                                                        ? <HiOutlineChevronUp className="h-3.5 w-3.5" />
                                                        : <HiOutlineChevronDown className="h-3.5 w-3.5" />}
                                                    {id}
                                                </button>
                                            </td>
                                            <td className="border-b border-white/5 px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pattern.color}`}>
                                                    <span>{pattern.icon}</span>
                                                    {pattern.label}
                                                </span>
                                            </td>
                                            <td className="border-b border-white/5 px-6 py-4">
                                                <span className="text-white font-semibold">{ring.accounts.length}</span>
                                                <span className="text-gray-500 ml-1">accounts</span>
                                            </td>
                                            <td className="border-b border-white/5 px-6 py-4">
                                                <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold uppercase ${SEVERITY_COLORS[ring.severity] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
                                                    {ring.severity}
                                                </span>
                                            </td>
                                            <td className="border-b border-white/5 px-6 py-4 text-gray-300 font-mono text-xs">
                                                ${ring.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="border-b border-white/5 px-6 py-4 text-right">
                                                <button
                                                    onClick={() => highlightRingInGraph(ring)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-500/20"
                                                    title="View in graph"
                                                >
                                                    <HiOutlineExternalLink className="h-3.5 w-3.5" />
                                                    View in Graph
                                                </button>
                                            </td>

                                            {/* Expanded row — member accounts */}
                                            {isExpanded && (
                                                <td colSpan={6} className="border-b border-white/5 bg-white/[0.01] px-6 py-4">
                                                    <div className="space-y-3">
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                            Member Accounts
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {ring.accounts.map((acc) => (
                                                                <span
                                                                    key={acc}
                                                                    className="inline-flex items-center rounded-lg bg-slate-800 border border-white/10 px-3 py-1.5 text-xs font-mono text-gray-300"
                                                                >
                                                                    <span className="h-2 w-2 rounded-full bg-violet-500 mr-2" />
                                                                    {acc}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {ring.description && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500">{ring.description}</p>
                                                            </div>
                                                        )}

                                                        <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                                            {ring.cycle_length && <span>Cycle length: <b className="text-gray-300">{ring.cycle_length}</b></span>}
                                                            {ring.hop_count && <span>Hops: <b className="text-gray-300">{ring.hop_count}</b></span>}
                                                            {ring.window_hours && <span>Window: <b className="text-gray-300">{ring.window_hours}h</b></span>}
                                                            <span>Transactions: <b className="text-gray-300">{ring.transactions.length}</b></span>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Top suspicious accounts mini-table */}
            {suspiciousAccounts.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    <div className="border-b border-white/5 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <HiOutlineUserGroup className="h-5 w-5 text-amber-400" />
                            Top Suspicious Accounts
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-3 font-medium">Account</th>
                                    <th className="px-6 py-3 font-medium">Score</th>
                                    <th className="px-6 py-3 font-medium">Risk</th>
                                    <th className="px-6 py-3 font-medium">Transactions</th>
                                    <th className="px-6 py-3 font-medium">Volume</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suspiciousAccounts.slice(0, 5).map((sa) => (
                                    <tr key={sa.account_id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="border-b border-white/5 px-6 py-3 font-mono text-xs text-violet-400">
                                            {sa.account_id}
                                        </td>
                                        <td className="border-b border-white/5 px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${sa.suspicion_score}%`,
                                                            backgroundColor:
                                                                sa.suspicion_score >= 80 ? '#f43f5e'
                                                                    : sa.suspicion_score >= 60 ? '#ef4444'
                                                                        : sa.suspicion_score >= 35 ? '#f59e0b'
                                                                            : '#3b82f6',
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-white">{sa.suspicion_score}</span>
                                            </div>
                                        </td>
                                        <td className="border-b border-white/5 px-6 py-3">
                                            <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold uppercase ${sa.risk_label === 'critical' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                                : sa.risk_label === 'high' ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                                    : sa.risk_label === 'moderate' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                                }`}>
                                                {sa.risk_label}
                                            </span>
                                        </td>
                                        <td className="border-b border-white/5 px-6 py-3 text-gray-300">
                                            {sa.transaction_count}
                                        </td>
                                        <td className="border-b border-white/5 px-6 py-3 text-gray-300 font-mono text-xs">
                                            ${sa.total_volume.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
