
import { Link } from "react-router-dom";
import { useFraudSummary } from "../hooks/useData";
import { ModeToggle } from "../components/mode-toggle";

const FraudSummary = () => {
    const { rings, suspiciousAccounts, loading } = useFraudSummary();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background-dark text-slate-100">Loading summary...</div>;

    const totalRings = rings.length;
    const highRiskAccounts = suspiciousAccounts.filter(a => a.risk_label === 'critical' || a.risk_label === 'high').length;
    const totalFraudVolume = rings.reduce((acc, ring) => acc + (ring.total_amount || 0), 0);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display transition-colors duration-300">
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
                </nav>
                <div className="mt-auto">
                    <div className="size-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSDBuNUlkOvDsDY8-4sNBRvn6pBsMbUx7KBS6x14BBVgsE8ZD-yZWJFrS9-rUJY2yNyo9cucCnHsznLeSKAG9c2Fz9dDfWWVllEE_dBf3AfFP1OGu9Zk43p_6cSZMuHj5CF1pzYmJnPocgz9LwE18M9QbXc9Rbl1eE9MAHW_glOY3h3ubg7Hsg78WzVkry4vW1AFxNRJrTdtpiQ0RI6BVzw--fxF8_oBVBMvmy_mSCYhCaz5cX1alvl9VSmrbIfN4to7xL-1UeYcNr" />
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
                            AI Analysis Report —
                            <span className="text-primary font-semibold ml-1">Live Updates</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ModeToggle />
                    </div>
                </header>

                {/* Summary Row */}
                <section className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-xl flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Fraud Rings Detected</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{totalRings}</span>
                            </div>
                        </div>
                        <div className="size-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">hub</span>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-xl flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">High Risk Accounts</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{highRiskAccounts}</span>
                            </div>
                        </div>
                        <div className="size-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">person_alert</span>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-xl flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Impact Volume</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact" }).format(totalFraudVolume)}
                                </span>
                            </div>
                        </div>
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">attach_money</span>
                        </div>
                    </div>
                </section>

                <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Fraud Rings Table */}
                    <section className="glass rounded-xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/5">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">group_work</span>
                                Detected Fraud Rings
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Severity</th>
                                        <th className="px-6 py-4 text-right">Volume</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {rings.map((ring) => (
                                        <tr key={ring.id} className="glass-hover transition-all text-sm group">
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 dark:text-slate-200 font-bold capitalize">{ring.ring_type.replace(/_/g, ' ')}</span>
                                                    <span className="text-xs text-slate-500">{ring.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${ring.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                                                        ring.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {ring.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(ring.total_amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    {rings.length === 0 && (
                                        <tr><td colSpan={3} className="p-8 text-center text-slate-500">No fraud rings detected yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Suspicious Accounts Table */}
                    <section className="glass rounded-xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/5">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">person_search</span>
                                Suspicious Accounts
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">Account ID</th>
                                        <th className="px-6 py-4">Risk Score</th>
                                        <th className="px-6 py-4">Label</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {suspiciousAccounts.map((account) => (
                                        <tr key={account.id} className="glass-hover transition-all text-sm group">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[150px]" title={account.account_id}>
                                                {account.account_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${account.suspicion_score > 80 ? 'bg-red-500' :
                                                                    account.suspicion_score > 50 ? 'bg-orange-500' : 'bg-yellow-400'
                                                                }`}
                                                            style={{ width: `${account.suspicion_score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{account.suspicion_score}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${account.risk_label === 'critical' ? 'bg-red-500/20 text-red-500' :
                                                        account.risk_label === 'high' ? 'bg-orange-500/20 text-orange-500' :
                                                            account.risk_label === 'moderate' ? 'bg-yellow-500/20 text-yellow-500' :
                                                                'bg-slate-500/20 text-slate-500'
                                                    }`}>
                                                    {account.risk_label}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {suspiciousAccounts.length === 0 && (
                                        <tr><td colSpan={3} className="p-8 text-center text-slate-500">No suspicious accounts found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default FraudSummary;
