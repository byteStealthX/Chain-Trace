
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../hooks/useData";
import { ModeToggle } from "../components/mode-toggle";
import Papa from "papaparse";
import { toast } from "sonner";

const PAGE_SIZE = 25;

const Transactions = () => {
    const { transactions, loading, error } = useTransactions();
    const [filter, setFilter] = useState<'all' | 'flagged' | 'clean'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const filteredTransactions = useMemo(() => transactions.filter(tx => {
        const matchesFilter = filter === 'all'
            ? true
            : filter === 'flagged' ? tx.is_flagged
                : !tx.is_flagged;

        const matchesSearch = searchTerm === '' ||
            tx.transaction_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.sender?.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.receiver?.account_name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    }), [transactions, filter, searchTerm]);

    // Reset to page 1 when filter/search changes
    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pagedTransactions = filteredTransactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    // ── Computed stats ────────────────────────────────────────────────────────
    const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
    const flaggedCount = transactions.filter(t => t.is_flagged).length;
    const avgRiskScore = transactions.length
        ? (transactions.reduce((acc, t) => acc + (t.risk_score || 0), 0) / transactions.length).toFixed(1)
        : '0.0';

    // ── Export CSV ────────────────────────────────────────────────────────────
    const handleExport = () => {
        const rows = filteredTransactions.map(tx => ({
            transaction_ref: tx.transaction_ref || tx.id,
            sender: tx.sender?.account_name || tx.sender_id,
            receiver: tx.receiver?.account_name || tx.receiver_id,
            amount: tx.amount,
            currency: tx.currency,
            timestamp: tx.timestamp,
            risk_score: tx.risk_score,
            is_flagged: tx.is_flagged,
            flag_reason: tx.flag_reason || '',
        }));
        const csv = Papa.unparse(rows);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chain-trace-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${rows.length} transactions as CSV`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background-dark text-slate-100">Loading transactions...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-background-dark text-red-500">Error: {error}</div>;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden">
            {/* Narrow Sidebar */}
            <aside className="w-16 md:w-20 flex flex-col items-center py-8 border-r border-glass-border bg-background-light dark:bg-background-dark z-20">
                <div className="mb-10">
                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,225,255,0.3)]">
                        <span className="material-symbols-outlined text-background-dark font-bold">shield</span>
                    </div>
                </div>
                <nav className="flex flex-col gap-6">
                    <Link className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/">
                        <span className="material-symbols-outlined">dashboard</span>
                    </Link>
                    <Link className="p-3 rounded-lg text-primary bg-primary/10 border border-primary/20 transition-colors" to="/transactions">
                        <span className="material-symbols-outlined">sync_alt</span>
                    </Link>
                    <Link className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/analytics">
                        <span className="material-symbols-outlined">monitoring</span>
                    </Link>
                    <Link className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/fraud-summary">
                        <span className="material-symbols-outlined">verified</span>
                    </Link>
                    <div className="w-8 h-px bg-glass-border my-2"></div>
                    <Link className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/login">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                </nav>
                <div className="mt-auto">
                    <div className="size-10 rounded-full border-2 border-primary/30 overflow-hidden">
                        <img className="w-full h-full object-cover" alt="User avatar profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQi3U_CLdHk-F40ufnT6t_UWhv0jsakj8-YmGW_toYsj8BuZCj5Jx5TVh8qDdPhEWMmT6jBhm5ZKLxxZ7rvPQV9F0DGLaWR62DgNI2manWcxj23redcDcNZyElGjweex3agfJuezHufsErwBityERyGV0doBxX_F7o_J5SAZCxJ_KdSJJkFhzIjCXe4ZC9EhCmDU5RecY8AY43JwjbwgAoUCP1chkCW7GNHy7pHFC6lMuRlOk1Z2bLmGm4ODOoeUGhMVlqxqaf-vF-" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header Section */}
                <header className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Transactions</h1>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search Bar */}
                            <div className="relative min-w-[280px]">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                                <input
                                    className="w-full bg-slate-100 dark:bg-glass-dark border-glass-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary placeholder:text-slate-500"
                                    placeholder="Search Transaction ID, Sender..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                />
                            </div>
                            {/* Filters */}
                            <div className="flex items-center glassmorphism rounded-lg p-1">
                                <button onClick={() => { setFilter('all'); setPage(1); }} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === 'all' ? 'bg-primary text-background-dark shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}>All</button>
                                <button onClick={() => { setFilter('flagged'); setPage(1); }} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === 'flagged' ? 'bg-primary text-background-dark shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}>Flagged</button>
                                <button onClick={() => { setFilter('clean'); setPage(1); }} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === 'clean' ? 'bg-primary text-background-dark shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}>Clean</button>
                            </div>
                            {/* Export CSV */}
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 glassmorphism px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">download</span>
                                <span>Export CSV</span>
                            </button>
                            <ModeToggle />
                        </div>
                    </div>

                    {/* Stats Mini Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glassmorphism p-4 rounded-lg flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 size-16 bg-primary/5 rounded-full blur-2xl transition-all group-hover:bg-primary/10"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Transactions</p>
                                <p className="text-2xl font-bold mt-1">{transactions.length}</p>
                            </div>
                            <span className="material-symbols-outlined text-primary/40 text-3xl">list_alt</span>
                        </div>
                        <div className="glassmorphism p-4 rounded-lg flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 size-16 bg-accent-purple/5 rounded-full blur-2xl transition-all group-hover:bg-accent-purple/10"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Volume</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(totalVolume, 'USD')}</p>
                            </div>
                            <span className="material-symbols-outlined text-accent-purple/40 text-3xl">payments</span>
                        </div>
                        <div className="glassmorphism p-4 rounded-lg flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 size-16 bg-red-500/5 rounded-full blur-2xl transition-all group-hover:bg-red-500/10"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Flagged Mules</p>
                                <p className="text-2xl font-bold mt-1 text-red-500">{flaggedCount}</p>
                            </div>
                            <span className="material-symbols-outlined text-red-500/40 text-3xl">report</span>
                        </div>
                        {/* 4th card – Avg Risk Score */}
                        <div className="glassmorphism p-4 rounded-lg flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 size-16 bg-amber-500/5 rounded-full blur-2xl transition-all group-hover:bg-amber-500/10"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Risk Score</p>
                                <p className="text-2xl font-bold mt-1 text-amber-400">{avgRiskScore}</p>
                            </div>
                            <span className="material-symbols-outlined text-amber-500/40 text-3xl">speed</span>
                        </div>
                    </div>
                </header>

                {/* Transactions Table */}
                <section className="flex-1 px-8 pb-8 overflow-y-auto scrollbar-hide">
                    <div className="glassmorphism rounded-lg overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 border-b border-glass-border">
                                    <tr>
                                        <th className="p-4 w-12"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sender</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Receiver</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Curr</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {pagedTransactions.map((tx, index) => (
                                        <tr key={tx.id} className={`table-row-hover transition-colors group ${tx.is_flagged ? 'flagged-border' : ''}`}>
                                            <td className="p-4"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                            <td className="p-4 text-sm text-slate-500 font-medium">{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                                            <td className="p-4 text-sm font-mono text-slate-300">{tx.transaction_ref || tx.id.slice(0, 8)}</td>
                                            <td className="p-4 text-sm font-medium">{tx.sender?.account_name || tx.sender_id}</td>
                                            <td className="p-4 text-sm font-medium">{tx.receiver?.account_name || tx.receiver_id}</td>
                                            <td className="p-4 text-sm font-bold text-right tabular-nums">{formatCurrency(tx.amount, tx.currency)}</td>
                                            <td className="p-4 text-sm text-slate-500">{tx.currency}</td>
                                            <td className="p-4 text-sm text-slate-400">{formatDate(tx.timestamp)}</td>
                                            <td className="p-4">
                                                {tx.is_flagged ? (
                                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold w-fit border border-red-500/20">
                                                        <span className="size-1.5 rounded-full bg-red-500"></span> Flagged
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-fit border border-emerald-500/20">
                                                        <span className="size-1.5 rounded-full bg-emerald-500"></span> Clean
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {pagedTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center text-slate-500">No transactions found matching your criteria.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-glass-border flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                                Showing {pagedTransactions.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length} transactions
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    className="p-2 glassmorphism rounded hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={safePage <= 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <span className="text-xs text-slate-400 px-2">{safePage} / {totalPages}</span>
                                <button
                                    className="p-2 glassmorphism rounded hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={safePage >= totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Transactions;
