
import { Link } from "react-router-dom";
import { useDashboardStats } from "../hooks/useData";

const Analytics = () => {
    const { stats, loading } = useDashboardStats();

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
                    <button className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all flex justify-center">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
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
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                            <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white">7D</button>
                            <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">1M</button>
                            <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">3M</button>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-background-dark text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(6,220,249,0.3)]">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export Report
                        </button>
                    </div>
                </header>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* KPI Card 1 */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">trending_up</span> +12.5%
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Total Transactions</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{loading ? "..." : stats.totalTransactions}</h3>
                    </div>

                    {/* KPI Card 2 */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-red-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">trending_up</span> +5.2%
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Fraud Detected</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{loading ? "..." : stats.flaggedAccounts}</h3>
                    </div>

                    {/* KPI Card 3 */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-accent-purple/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-accent-purple/10 text-accent-purple">
                                <span className="material-symbols-outlined">hub</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-500/10 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">remove</span> 0.0%
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Active Rings</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">14</h3>
                    </div>

                    {/* KPI Card 4 */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-sm">trending_up</span> +8.4%
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Entities Monitored</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">12,450</h3>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart - Transaction Volume */}
                    <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Volume Over Time</h3>
                                <p className="text-sm text-slate-400">Comparison of legitimate vs suspicious activity</p>
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
                        {/* SVG Line Chart */}
                        <div className="relative h-64 w-full">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                                {/* Grid Lines */}
                                <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />
                                <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />
                                <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />
                                <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />
                                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />

                                {/* Area 1 (Legitimate) */}
                                <path d="M0 40 Q 10 35 20 38 Q 30 25 40 30 Q 50 20 60 25 Q 70 15 80 18 Q 90 10 100 5 L 100 50 L 0 50 Z" fill="rgba(6, 220, 249, 0.1)" />
                                <path d="M0 40 Q 10 35 20 38 Q 30 25 40 30 Q 50 20 60 25 Q 70 15 80 18 Q 90 10 100 5" fill="none" stroke="#06dcf9" strokeWidth="0.5" className="chart-glow" />

                                {/* Area 2 (Suspicious) */}
                                <path d="M0 48 Q 15 45 30 47 Q 45 42 60 45 Q 75 35 90 40 L 100 38 L 100 50 L 0 50 Z" fill="rgba(239, 68, 68, 0.1)" />
                                <path d="M0 48 Q 15 45 30 47 Q 45 42 60 45 Q 75 35 90 40 L 100 38" fill="none" stroke="#ef4444" strokeWidth="0.5" className="chart-glow" strokeDasharray="1,1" />
                            </svg>
                        </div>
                    </div>

                    {/* Side Chart - Risk Distribution */}
                    <div className="lg:col-span-1 bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Risk Distribution</h3>
                        <div className="relative flex justify-center py-4">
                            <svg className="size-48 transform -rotate-90">
                                <circle cx="96" cy="96" r="80" fill="none" stroke="#e2e8f0" strokeWidth="20" className="dark:stroke-slate-700/50" />
                                {/* Segments */}
                                <circle cx="96" cy="96" r="80" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="335 502" strokeDashoffset="0" />
                                <circle cx="96" cy="96" r="80" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="100 502" strokeDashoffset="-335" />
                                <circle cx="96" cy="96" r="80" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="67 502" strokeDashoffset="-435" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">12.8%</span>
                                <span className="text-xs text-slate-500 uppercase font-semibold">High Risk</span>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-emerald-500"></span>
                                    <span className="text-slate-500 dark:text-slate-400">Low Risk</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">65%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-amber-500"></span>
                                    <span className="text-slate-500 dark:text-slate-400">Medium Risk</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">22.2%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-red-500"></span>
                                    <span className="text-slate-500 dark:text-slate-400">High Risk</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">12.8%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;

{/* Narrow Sidebar */ }
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
        <button className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all flex justify-center">
            <span className="material-symbols-outlined">logout</span>
        </button>
    </div>
</aside>

{/* Main Content */ }
<main className="flex-1 flex flex-col relative overflow-y-auto">
    {/* Header */}
    <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-background-light dark:bg-background-dark sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time monitoring of financial flows and risk vectors.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white">7D</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">1M</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">3M</button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-background-dark text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(6,220,249,0.3)]">
                <span className="material-symbols-outlined text-lg">download</span>
                Export Report
            </button>
        </div>
    </header>

    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Card 1 */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">trending_up</span> +12.5%
                </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Total Volume</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">$84.2M</h3>
        </div>

        {/* KPI Card 2 */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-red-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
                    <span className="material-symbols-outlined">warning</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">trending_up</span> +5.2%
                </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Fraud Detected</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">$1.2M</h3>
        </div>

        {/* KPI Card 3 */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-accent-purple/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-accent-purple/10 text-accent-purple">
                    <span className="material-symbols-outlined">hub</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-500/10 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">remove</span> 0.0%
                </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Active Rings</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">14</h3>
        </div>

        {/* KPI Card 4 */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                    <span className="material-symbols-outlined">group</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">trending_up</span> +8.4%
                </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Entities Monitored</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">12,450</h3>
        </div>
    </div>

    {/* Charts Section */}
    <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Transaction Volume */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Volume Over Time</h3>
                    <p className="text-sm text-slate-400">Comparison of legitimate vs suspicious activity</p>
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
            {/* SVG Line Chart */}
            <div className="relative h-64 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />
                    <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />
                    <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.1" />

                    {/* Area 1 (Legitimate) */}
                    <path d="M0 40 Q 10 35 20 38 Q 30 25 40 30 Q 50 20 60 25 Q 70 15 80 18 Q 90 10 100 5 L 100 50 L 0 50 Z" fill="rgba(6, 220, 249, 0.1)" />
                    <path d="M0 40 Q 10 35 20 38 Q 30 25 40 30 Q 50 20 60 25 Q 70 15 80 18 Q 90 10 100 5" fill="none" stroke="#06dcf9" strokeWidth="0.5" className="chart-glow" />

                    {/* Area 2 (Suspicious) */}
                    <path d="M0 48 Q 15 45 30 47 Q 45 42 60 45 Q 75 35 90 40 L 100 38 L 100 50 L 0 50 Z" fill="rgba(239, 68, 68, 0.1)" />
                    <path d="M0 48 Q 15 45 30 47 Q 45 42 60 45 Q 75 35 90 40 L 100 38" fill="none" stroke="#ef4444" strokeWidth="0.5" className="chart-glow" strokeDasharray="1,1" />
                </svg>
            </div>
        </div>

        {/* Side Chart - Risk Distribution */}
        <div className="lg:col-span-1 bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Risk Distribution</h3>
            <div className="relative flex justify-center py-4">
                <svg className="size-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#e2e8f0" strokeWidth="20" className="dark:stroke-slate-700/50" />
                    {/* Segments */}
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="335 502" strokeDashoffset="0" />
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="100 502" strokeDashoffset="-335" />
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="67 502" strokeDashoffset="-435" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">12.8%</span>
                    <span className="text-xs text-slate-500 uppercase font-semibold">High Risk</span>
                </div>
            </div>
            <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-500 dark:text-slate-400">Low Risk</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">65%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-amber-500"></span>
                        <span className="text-slate-500 dark:text-slate-400">Medium Risk</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">22.2%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-red-500"></span>
                        <span className="text-slate-500 dark:text-slate-400">High Risk</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">12.8%</span>
                </div>
            </div>
        </div>
    </div>
</main>
        </div >
    );
};

export default Analytics;
