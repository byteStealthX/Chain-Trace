
import { Link } from "react-router-dom";

const FraudSummary = () => {
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
                            Last scan: <span className="text-slate-700 dark:text-slate-300 font-medium">Feb 19, 2026 at 3:15 PM</span> —
                            <span className="text-red-500 font-semibold ml-1">23 flagged accounts</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 font-medium transition-all text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Download JSON
                        </button>
                        <button className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition-all text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">csv</span>
                            Export CSV
                        </button>
                    </div>
                </header>

                {/* Summary Row */}
                <section className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-xl flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Flagged Accounts</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-100">23</span>
                                <span className="text-red-500 text-sm font-semibold flex items-center">
                                    <span className="material-symbols-outlined text-xs">trending_up</span> 12%
                                </span>
                            </div>
                        </div>
                        <div className="size-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-xl flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Suspicious Chains</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-100">156</span>
                                <span className="text-primary text-sm font-semibold flex items-center">
                                    <span className="material-symbols-outlined text-xs">link</span> Active
                                </span>
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
                                <span className="text-4xl font-bold text-slate-100">78.4</span>
                                <span className="text-slate-500 text-sm">/ 100</span>
                            </div>
                        </div>
                        <div className="relative size-14">
                            <svg className="size-14 progress-ring">
                                <circle className="text-slate-200 dark:text-slate-800" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"></circle>
                                <circle className="text-orange-500" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeDasharray="150" strokeDashoffset="32" strokeLinecap="round" strokeWidth="4"></circle>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-orange-500">78%</span>
                        </div>
                    </div>
                </section>

                {/* Main Table Section */}
                <section className="px-8 pb-8 flex-1">
                    <div className="glass rounded-xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/5">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">list</span>
                                High-Risk Entities
                            </h2>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                <input className="bg-background-light dark:bg-background-dark/50 border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary w-64 transition-all" placeholder="Search Account ID..." type="text" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">Account ID</th>
                                        <th className="px-6 py-4 text-center">Risk Score</th>
                                        <th className="px-6 py-4">Connected</th>
                                        <th className="px-6 py-4">Volume</th>
                                        <th className="px-6 py-4">Reason</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {/* Sample Row 1 (Critical) */}
                                    <tr className="glass-hover transition-all text-sm group">
                                        <td className="px-6 py-4 font-medium text-slate-500">01</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">0x71C...a4b</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 font-bold border border-red-500/30">94</span>
                                        </td>
                                        <td className="px-6 py-4">42</td>
                                        <td className="px-6 py-4 font-medium">$124,500</td>
                                        <td className="px-6 py-4 text-slate-400">High Velocity Transfers</td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500 animate-pulse"></span> Critical</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                        </td>
                                    </tr>
                                    {/* Sample Row 2 (Critical) */}
                                    <tr className="glass-hover transition-all text-sm group">
                                        <td className="px-6 py-4 font-medium text-slate-500">02</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">0x12A...f92</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 font-bold border border-red-500/30">91</span>
                                        </td>
                                        <td className="px-6 py-4">38</td>
                                        <td className="px-6 py-4 font-medium">$98,200</td>
                                        <td className="px-6 py-4 text-slate-400">Rapid Structuring</td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500"></span> Critical</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                        </td>
                                    </tr>
                                    {/* Sample Row 3 (Warning) */}
                                    <tr className="glass-hover transition-all text-sm group">
                                        <td className="px-6 py-4 font-medium text-slate-500">03</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">0x88B...c11</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-500 font-bold border border-orange-500/30">88</span>
                                        </td>
                                        <td className="px-6 py-4">25</td>
                                        <td className="px-6 py-4 font-medium">$45,000</td>
                                        <td className="px-6 py-4 text-slate-400">Layering Pattern</td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-500"></span> Warning</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                        </td>
                                    </tr>
                                    {/* Sample Row 4 (Warning) */}
                                    <tr className="glass-hover transition-all text-sm group">
                                        <td className="px-6 py-4 font-medium text-slate-500">04</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">0x45E...d33</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-500 font-bold border border-orange-500/30">82</span>
                                        </td>
                                        <td className="px-6 py-4">19</td>
                                        <td className="px-6 py-4 font-medium">$32,100</td>
                                        <td className="px-6 py-4 text-slate-400">New Account Activity</td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-500"></span> Warning</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                        </td>
                                    </tr>
                                    {/* Sample Row 5 (Warning) */}
                                    <tr className="glass-hover transition-all text-sm group">
                                        <td className="px-6 py-4 font-medium text-slate-500">05</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">0x99F...e22</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-500 font-bold border border-orange-500/30">76</span>
                                        </td>
                                        <td className="px-6 py-4">12</td>
                                        <td className="px-6 py-4 font-medium">$15,400</td>
                                        <td className="px-6 py-4 text-slate-400">Irregular Hours</td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-500"></span> Warning</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                        </td>
                                    </tr>
                                    {/* Sample Row 6 (Elevated) */}
                                    <tr className="glass-hover transition-all text-sm group">
                                        <td className="px-6 py-4 font-medium text-slate-500">06</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">0x22D...a88</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-bold border border-yellow-500/30">72</span>
                                        </td>
                                        <td className="px-6 py-4">31</td>
                                        <td className="px-6 py-4 font-medium">$67,000</td>
                                        <td className="px-6 py-4 text-slate-400">Geographic Anomaly</td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-yellow-500"></span> Warning</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                        </td>
                                    </tr>
                                    {/* Sample Row 7 (Elevated) */}
                                    <tr className="glass-hover transition-all text-sm group">
                                        <td className="px-6 py-4 font-medium text-slate-500">07</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">0x55C...b44</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-bold border border-yellow-500/30">58</span>
                                        </td>
                                        <td className="px-6 py-4">8</td>
                                        <td className="px-6 py-4 font-medium">$5,200</td>
                                        <td className="px-6 py-4 text-slate-400">Small Round Sums</td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-400"></span> Elevated</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                        </td>
                                    </tr>
                                    {/* Sample Row 8 (Elevated) */}
                                    <tr className="glass-hover transition-all text-sm group">
                                        <td className="px-6 py-4 font-medium text-slate-500">08</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">0x33A...f00</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-bold border border-yellow-500/30">52</span>
                                        </td>
                                        <td className="px-6 py-4">5</td>
                                        <td className="px-6 py-4 font-medium">$2,100</td>
                                        <td className="px-6 py-4 text-slate-400">Frequent Transfers</td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-400"></span> Elevated</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" href="#">View Details</a>
                                        </td>
                                    </tr>
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
