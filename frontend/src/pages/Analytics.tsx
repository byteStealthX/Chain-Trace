
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAnalyticsData } from "../hooks/useData";
import { toast } from "sonner";

type Range = 7 | 30 | 90;

const Analytics = () => {
    const [range, setRange] = useState<Range>(7);
    const { data, loading } = useAnalyticsData(range);

    // ── Dynamic Bar Chart ─────────────────────────────────────────────────────
    const chartData = useMemo(() => {
        const items = data.volumeByDate;
        if (!items.length) return { bars: [], maxVal: 1, labels: [] };
        const maxVal = Math.max(...items.map(d => d.legitimate + d.suspicious), 1);
        return { bars: items, maxVal, labels: items.map(d => d.date) };
    }, [data.volumeByDate]);

    // ── Donut chart segments ──────────────────────────────────────────────────
    const donut = useMemo(() => {
        const { low, medium, high, total } = data.riskDistribution;
        const circumference = 2 * Math.PI * 80; // r=80
        const safeTotal = total || 1;
        const lowPct = low / safeTotal;
        const medPct = medium / safeTotal;
        const highPct = high / safeTotal;
        return {
            lowDash: `${lowPct * circumference} ${circumference}`,
            medDash: `${medPct * circumference} ${circumference}`,
            highDash: `${highPct * circumference} ${circumference}`,
            lowOffset: 0,
            medOffset: -(lowPct * circumference),
            highOffset: -((lowPct + medPct) * circumference),
            highPctLabel: total ? `${Math.round((high / total) * 100)}%` : '0%',
        };
    }, [data.riskDistribution]);

    // ── Export Report ─────────────────────────────────────────────────────────
    const handleExport = () => {
        const report = {
            generated_at: new Date().toISOString(),
            range_days: range,
            summary: {
                total_transactions: data.totalTxCount,
                flagged_transactions: data.flaggedTxCount,
                fraud_rings_detected: data.fraudRingCount,
                entities_monitored: data.accountCount,
                suspicious_accounts: data.suspiciousAccountCount,
            },
            risk_distribution: data.riskDistribution,
            volume_by_date: data.volumeByDate,
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chain-trace-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported successfully!');
    };

    const rangeLabel: Record<Range, string> = { 7: '7D', 30: '1M', 90: '3M' };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden font-display transition-colors duration-300">
            {/* Narrow Sidebar */}
            <aside className="w-20 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-8 bg-background-light dark:bg-background-dark z-20">
                <div className="mb-8">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-2xl">insights</span>
                    </div>
                </div>
                <nav className="flex flex-col gap-6 w-full px-4">
                    <Link to="/" className="p-3 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group flex justify-center">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">dashboard</span>
                    </Link>
                    <Link to="/transactions" className="p-3 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group flex justify-center">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">receipt_long</span>
                    </Link>
                    <Link to="/analytics" className="p-3 rounded-xl bg-primary/10 text-primary transition-all group flex justify-center relative">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">bar_chart</span>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full"></div>
                    </Link>
                    <Link to="/fraud-summary" className="p-3 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group flex justify-center">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">shield_person</span>
                    </Link>
                </nav>
                <div className="mt-auto px-4">
                    <Link to="/login" className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all flex justify-center">
                        <span className="material-symbols-outlined">logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-y-auto">
                {/* Header */}
                <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-background-light dark:bg-background-dark sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
                        <p className="text-slate-400 text-sm mt-1">Real-time monitoring of financial flows and risk vectors.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Time-range buttons */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                            {([7, 30, 90] as Range[]).map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${range === r
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {rangeLabel[r]}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-background-dark text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(6,220,249,0.3)]"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export Report
                        </button>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Transactions */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">trending_up</span> +12.5%
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Total Transactions</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                            {loading ? <span className="animate-pulse text-slate-400">—</span> : data.totalTxCount.toLocaleString()}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Last {range} days</p>
                    </div>

                    {/* Fraud Detected */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-red-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                {data.totalTxCount > 0 ? `${Math.round((data.flaggedTxCount / data.totalTxCount) * 100)}%` : '0%'}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Flagged Transactions</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                            {loading ? <span className="animate-pulse text-slate-400">—</span> : data.flaggedTxCount.toLocaleString()}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Last {range} days</p>
                    </div>

                    {/* Active Rings - now real */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-accent-purple/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-accent-purple/10 text-accent-purple">
                                <span className="material-symbols-outlined">hub</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-500/10 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">all_inclusive</span> All-time
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Fraud Rings Detected</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                            {loading ? <span className="animate-pulse text-slate-400">—</span> : data.fraudRingCount.toLocaleString()}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{data.suspiciousAccountCount} suspicious accounts</p>
                    </div>

                    {/* Entities Monitored - now real */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">verified</span> Live
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Entities Monitored</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                            {loading ? <span className="animate-pulse text-slate-400">—</span> : data.accountCount.toLocaleString()}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Unique accounts</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Dynamic Bar Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Volume Over Time</h3>
                                <p className="text-sm text-slate-400">Legitimate vs suspicious activity – last {range} days</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="size-2 rounded-full bg-primary"></span> Legitimate
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="size-2 rounded-full bg-red-500"></span> Suspicious
                                </div>
                            </div>
                        </div>

                        {/* Dynamic SVG Bar Chart */}
                        <div className="relative h-52 w-full">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Loading chart...</div>
                            ) : chartData.bars.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">No data for this period</div>
                            ) : (
                                <svg className="w-full h-full" viewBox={`0 0 ${Math.max(chartData.bars.length * 20, 100)} 60`} preserveAspectRatio="none">
                                    {/* Grid lines */}
                                    {[0, 15, 30, 45, 60].map(y => (
                                        <line key={y} x1="0" y1={y} x2="100%" y2={y} stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.3" />
                                    ))}
                                    {/* Bars */}
                                    {chartData.bars.map((d, i) => {
                                        const totalH = Math.min(((d.legitimate + d.suspicious) / chartData.maxVal) * 55, 55);
                                        const suspH = Math.min((d.suspicious / chartData.maxVal) * 55, totalH);
                                        const legitH = totalH - suspH;
                                        const x = i * 20 + 4;
                                        const barW = 12;
                                        return (
                                            <g key={i}>
                                                {/* Legitimate (bottom) */}
                                                {legitH > 0 && (
                                                    <rect x={x} y={60 - legitH - suspH} width={barW} height={legitH}
                                                        fill="#06dcf9" opacity="0.8" rx="1">
                                                        <title>{d.date}: ${d.legitimate.toFixed(0)} legit</title>
                                                    </rect>
                                                )}
                                                {/* Suspicious (top) */}
                                                {suspH > 0 && (
                                                    <rect x={x} y={60 - suspH} width={barW} height={suspH}
                                                        fill="#ef4444" opacity="0.8" rx="1">
                                                        <title>{d.date}: ${d.suspicious.toFixed(0)} suspicious</title>
                                                    </rect>
                                                )}
                                            </g>
                                        );
                                    })}
                                </svg>
                            )}
                        </div>

                        {/* X-axis labels — show subset to avoid clutter */}
                        {!loading && chartData.bars.length > 0 && (
                            <div className="flex justify-between mt-2 px-1">
                                {chartData.bars
                                    .filter((_, i) => i === 0 || i === Math.floor(chartData.bars.length / 2) || i === chartData.bars.length - 1)
                                    .map((d) => (
                                        <span key={d.date} className="text-[10px] text-slate-500">{d.date}</span>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Donut Chart – Risk Distribution */}
                    <div className="lg:col-span-1 bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Risk Distribution</h3>
                        <p className="text-xs text-slate-500 mb-4">Based on suspicious account labels</p>

                        <div className="relative flex justify-center py-2">
                            <svg className="size-44 transform -rotate-90" viewBox="0 0 192 192">
                                <circle cx="96" cy="96" r="80" fill="none" stroke="#e2e8f0" strokeWidth="20" className="dark:stroke-slate-700/50" />
                                {data.riskDistribution.total > 0 ? (
                                    <>
                                        {/* Low Risk */}
                                        <circle cx="96" cy="96" r="80" fill="none" stroke="#10b981" strokeWidth="20"
                                            strokeDasharray={donut.lowDash}
                                            strokeDashoffset={donut.lowOffset} />
                                        {/* Medium Risk */}
                                        <circle cx="96" cy="96" r="80" fill="none" stroke="#f59e0b" strokeWidth="20"
                                            strokeDasharray={donut.medDash}
                                            strokeDashoffset={donut.medOffset} />
                                        {/* High Risk */}
                                        <circle cx="96" cy="96" r="80" fill="none" stroke="#ef4444" strokeWidth="20"
                                            strokeDasharray={donut.highDash}
                                            strokeDashoffset={donut.highOffset} />
                                    </>
                                ) : (
                                    <circle cx="96" cy="96" r="80" fill="none" stroke="#334155" strokeWidth="20" strokeDasharray="502 0" />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{donut.highPctLabel}</span>
                                <span className="text-xs text-slate-500 uppercase font-semibold">High Risk</span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {[
                                { label: 'Low Risk', color: 'bg-emerald-500', count: data.riskDistribution.low },
                                { label: 'Medium Risk', color: 'bg-amber-500', count: data.riskDistribution.medium },
                                { label: 'High Risk', color: 'bg-red-500', count: data.riskDistribution.high },
                            ].map(({ label, color, count }) => (
                                <div key={label} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className={`size-3 rounded-full ${color}`}></span>
                                        <span className="text-slate-500 dark:text-slate-400">{label}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {loading ? '—' : data.riskDistribution.total
                                            ? `${Math.round((count / data.riskDistribution.total) * 100)}%`
                                            : '0%'}
                                        <span className="text-slate-500 font-normal ml-1 text-xs">({count})</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
