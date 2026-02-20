
import { useState } from "react";
import { Link } from "react-router-dom";

const Transactions = () => {
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
                    <Link className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/settings">
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
                                <input className="w-full bg-slate-100 dark:bg-glass-dark border-glass-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary placeholder:text-slate-500" placeholder="Search Transaction ID, Sender..." type="text" />
                            </div>
                            {/* Filters */}
                            <div className="flex items-center glassmorphism rounded-lg p-1">
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-primary text-background-dark shadow-sm">All</button>
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-slate-100 transition-colors">Flagged</button>
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-slate-100 transition-colors">Clean</button>
                            </div>
                            <button className="flex items-center gap-2 glassmorphism px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                                <span className="material-symbols-outlined text-xl">calendar_today</span>
                                <span>Oct 1 - Oct 31, 2023</span>
                            </button>
                        </div>
                    </div>
                    {/* Stats Mini Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glassmorphism p-4 rounded-lg flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 size-16 bg-primary/5 rounded-full blur-2xl transition-all group-hover:bg-primary/10"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Transactions</p>
                                <p className="text-2xl font-bold mt-1">12,847</p>
                            </div>
                            <span className="material-symbols-outlined text-primary/40 text-3xl">list_alt</span>
                        </div>
                        <div className="glassmorphism p-4 rounded-lg flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 size-16 bg-accent-purple/5 rounded-full blur-2xl transition-all group-hover:bg-accent-purple/10"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today's Volume</p>
                                <p className="text-2xl font-bold mt-1">342</p>
                            </div>
                            <span className="material-symbols-outlined text-accent-purple/40 text-3xl">bolt</span>
                        </div>
                        <div className="glassmorphism p-4 rounded-lg flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 size-16 bg-red-500/5 rounded-full blur-2xl transition-all group-hover:bg-red-500/10"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Flagged Mules</p>
                                <p className="text-2xl font-bold mt-1 text-red-500">89</p>
                            </div>
                            <span className="material-symbols-outlined text-red-500/40 text-3xl">report</span>
                        </div>
                        <div className="glassmorphism p-4 rounded-lg flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 size-16 bg-primary/5 rounded-full blur-2xl transition-all group-hover:bg-primary/10"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Amount</p>
                                <p className="text-2xl font-bold mt-1 text-primary">$1,247</p>
                            </div>
                            <span className="material-symbols-outlined text-primary/40 text-3xl">payments</span>
                        </div>
                    </div>
                </header>

                {/* Main Transactions Table Section */}
                <section className="flex-1 px-8 pb-32 overflow-y-auto scrollbar-hide">
                    <div className="glassmorphism rounded-lg overflow-hidden flex flex-col h-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 border-b border-glass-border">
                                    <tr>
                                        <th className="p-4 w-12"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 cursor-pointer group">
                                                Transaction ID <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">expand_more</span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sender</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Receiver</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Curr</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {/* Row 1: Flagged */}
                                    <tr className="table-row-hover flagged-border transition-colors group">
                                        <td className="p-4"><input defaultChecked className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">01</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-82910-A</td>
                                        <td className="p-4 text-sm font-medium">James Sterling</td>
                                        <td className="p-4 text-sm font-medium">Digital Exchange LLC</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$4,500.00</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 14:22:10</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold w-fit border border-red-500/20">
                                                <span className="size-1.5 rounded-full bg-red-500"></span> Flagged
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 2: Clean */}
                                    <tr className="table-row-hover transition-colors">
                                        <td className="p-4"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">02</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-94321-B</td>
                                        <td className="p-4 text-sm font-medium">Alice Henderson</td>
                                        <td className="p-4 text-sm font-medium">Starbucks Corp</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$15.24</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 13:05:44</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-fit border border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span> Clean
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 3: Flagged */}
                                    <tr className="table-row-hover flagged-border transition-colors group">
                                        <td className="p-4"><input defaultChecked className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">03</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-10293-F</td>
                                        <td className="p-4 text-sm font-medium">Unknown Wallet 0x4f...</td>
                                        <td className="p-4 text-sm font-medium">Michael Chen</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$12,900.00</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 11:15:02</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold w-fit border border-red-500/20">
                                                <span className="size-1.5 rounded-full bg-red-500"></span> Flagged
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 4: Clean */}
                                    <tr className="table-row-hover transition-colors">
                                        <td className="p-4"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">04</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-55421-E</td>
                                        <td className="p-4 text-sm font-medium">Eleanor Rigby</td>
                                        <td className="p-4 text-sm font-medium">Amazon Web Services</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$1,450.00</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 10:42:19</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-fit border border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span> Clean
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 5: Flagged */}
                                    <tr className="table-row-hover flagged-border transition-colors group">
                                        <td className="p-4"><input defaultChecked className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">05</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-88219-X</td>
                                        <td className="p-4 text-sm font-medium">Robert Wilson</td>
                                        <td className="p-4 text-sm font-medium">Cayman Trading Ltd</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$8,000.00</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 09:59:00</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold w-fit border border-red-500/20">
                                                <span className="size-1.5 rounded-full bg-red-500"></span> Flagged
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 6: Clean */}
                                    <tr className="table-row-hover transition-colors">
                                        <td className="p-4"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">06</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-22103-W</td>
                                        <td className="p-4 text-sm font-medium">Sarah Jenkins</td>
                                        <td className="p-4 text-sm font-medium">Target Retail Inc</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$142.33</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 09:12:44</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-fit border border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span> Clean
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 7: Clean */}
                                    <tr className="table-row-hover transition-colors">
                                        <td className="p-4"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">07</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-33921-H</td>
                                        <td className="p-4 text-sm font-medium">Greg House</td>
                                        <td className="p-4 text-sm font-medium">Princeton Hospital</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$1,200.00</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 08:30:11</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-fit border border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span> Clean
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 8: Clean */}
                                    <tr className="table-row-hover transition-colors">
                                        <td className="p-4"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">08</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-00428-K</td>
                                        <td className="p-4 text-sm font-medium">Walter White</td>
                                        <td className="p-4 text-sm font-medium">A1A Car Wash</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$3,540.00</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 07:44:52</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-fit border border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span> Clean
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 9: Clean */}
                                    <tr className="table-row-hover transition-colors">
                                        <td className="p-4"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">09</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-11822-M</td>
                                        <td className="p-4 text-sm font-medium">Diana Prince</td>
                                        <td className="p-4 text-sm font-medium">The Louvre Museum</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$220.00</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 07:12:03</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-fit border border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span> Clean
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 10: Clean */}
                                    <tr className="table-row-hover transition-colors">
                                        <td className="p-4"><input className="rounded border-glass-border bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" /></td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">10</td>
                                        <td className="p-4 text-sm font-mono text-slate-300">TX-77321-Y</td>
                                        <td className="p-4 text-sm font-medium">Bruce Wayne</td>
                                        <td className="p-4 text-sm font-medium">Arkham Asylum Fund</td>
                                        <td className="p-4 text-sm font-bold text-right tabular-nums">$50,000.00</td>
                                        <td className="p-4 text-sm text-slate-500">USD</td>
                                        <td className="p-4 text-sm text-slate-400">Oct 24, 06:40:55</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold w-fit border border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span> Clean
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="p-4 border-t border-glass-border flex items-center justify-between">
                            <p className="text-sm text-slate-400">Showing 1 to 10 of 12,847 transactions</p>
                            <div className="flex gap-2">
                                <button className="p-2 glassmorphism rounded hover:bg-white/5 transition-colors">
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <button className="p-2 glassmorphism rounded hover:bg-white/5 transition-colors">
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Floating Bottom Action Bar */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 px-6 py-4 glassmorphism rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-primary/30">
                    <div className="flex items-center gap-3 border-r border-glass-border pr-6">
                        <span className="size-6 bg-primary text-background-dark text-xs font-bold flex items-center justify-center rounded-full">3</span>
                        <span className="text-sm font-medium text-slate-200">Selected Transactions</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-glass-border">
                            <span className="material-symbols-outlined text-xl">done_all</span>
                            Mark as Reviewed
                        </button>
                        <button className="flex items-center gap-2 bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-accent-purple/30">
                            <span className="material-symbols-outlined text-xl">visibility</span>
                            Add to Watchlist
                        </button>
                        <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-primary/40">
                            <span className="material-symbols-outlined text-xl">ios_share</span>
                            Export Selected
                        </button>
                    </div>
                    <button className="ml-4 p-2 text-slate-500 hover:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Transactions;
