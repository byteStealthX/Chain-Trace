
import { Link } from "react-router-dom";
import { useFraudSummary } from "../hooks/useData";

const FraudSummary = () => {
    const { alerts, reports, loading } = useFraudSummary();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background-dark text-slate-100">Loading summary...</div>;

    // Use latest report for stats if available, otherwise calc from alerts
    const totalFlagged = reports[0]?.details?.total_flagged || alerts.length;
    const avgRisk = reports[0]?.details?.avg_risk_score || 0;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex">
            {/* Left Sidebar (Narrow Icon Navigation) */}
            <aside className="w-20 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-8 gap-8 bg-background-light dark:bg-background-dark sticky top-0 h-screen">
                <div className="mb-4">
                    <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary active-glow">
                        <span className="material-symbols-outlined font-bold">shield</span>
                    </div>
                </div>
                <nav className="flex flex-col gap-6 flex-1">
                    <Link className="p-2 rounded-lg text-slate-500 hover:text-primary transition-colors" to="/" title="Dashboard">
                        <span className="material-symbols-outlined">grid_view</span>
                    </Link>
                    <Link className="p-2 rounded-lg text-slate-500 hover:text-primary transition-colors" to="/transactions" title="Transactions">
                        <span className="material-symbols-outlined">swap_horiz</span>
                    </Link>
                    <Link className="p-2 rounded-lg text-slate-500 hover:text-primary transition-colors" to="/analytics" title="Analytics">
                        <span className="material-symbols-outlined">analytics</span>
                    </Link>
                    <Link className="p-2 rounded-lg bg-primary/10 text-primary active-glow" to="/fraud-summary" title="Results">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security_update_warning</span>
                    </Link>
                    <Link className="p-2 rounded-lg text-slate-500 hover:text-primary transition-colors" to="/settings" title="Settings">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                </nav>
                <div className="mt-auto">
                    <div className="size-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img alt="User" data-alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSDBuNUlkOvDsDY8-4sNBRvn6pBsMbUx7KBS6x14BBVgsE8ZD-yZWJFrS9-rUJY2yNyo9cucCnHsznLeSKAG9c2Fz9dDfWWVllEE_dBf3AfFP1OGu9Zk43p_6cSZMuHj5CF1pzYmJnPocgz9LwE18M9QbXc9Rbl1eE9MAHW_glOY3h3ubg7Hsg78WzVkry4vW1AFxNRJrTdtpiQ0RI6BVzw--fxF8_oBVBMvmy_mSCYhCaz5cX1alvl9VSmrbIfN4to7xL-1UeYcNr" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Top Header */}
                <header className="p-8 pb-4 flex flex-wrap justify-between items-end gap-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Fraud Detection Results</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Last scan: <span className="text-slate-700 dark:text-slate-300 font-medium">Just now</span> —
                            <span className="text-red-500 font-semibold ml-1">{totalFlagged} flagged items</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 font-medium transition-all text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Download JSON
                        </button>
                    </div>
                </header>

                {/* Summary Row */}
                <section className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-xl flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Flagged Alerts</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-100">{totalFlagged}</span>
                            </div>
                        </div>
                        <div className="size-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-xl flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Reports Generated</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-100">{reports.length}</span>
                            </div>
                        </div>
                        <div className="size-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">hub</span>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-xl flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Risk Score (Avg)</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-100">{avgRisk}</span>
                                <span className="text-slate-500 text-sm">/ 100</span>
                            </div>
                        </div>
                        {/* Circle progress could be dynamic but static for now */}
                    </div>
                </section>

                {/* Main Table Section */}
                <section className="px-8 pb-8 flex-1">
                    <div className="glass rounded-xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/5">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">list</span>
                                Recent Alerts
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Message</th>
                                        <th className="px-6 py-4">Severity</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {alerts.map((alert) => (
                                        <tr key={alert.id} className="glass-hover transition-all text-sm group">
                                            <td className="px-6 py-4 font-medium text-slate-500">{alert.alert_type}</td>
                                            <td className="px-6 py-4">{alert.message}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                                                    alert.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                                                        'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {alert.severity.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(alert.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                            </td>
                                        </tr>
                                    ))}
                                    {alerts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">No alerts found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FraudSummary;
