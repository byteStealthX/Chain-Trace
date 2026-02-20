
import { Link } from "react-router-dom";
import { ModeToggle } from "../components/mode-toggle";

const Dashboard = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
            <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-3">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center relative">
                            <span className="material-symbols-outlined text-background-dark font-bold text-[20px]">link</span>
                            <span className="material-symbols-outlined text-background-dark font-black text-[12px] absolute -bottom-0.5 -right-0.5 bg-accent-purple rounded-full p-0.5 border border-primary">manage_search</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">Chain-Trace</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-primary text-sm font-semibold" to="/">Dashboard</Link>
                        <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/transactions">Transactions</Link>
                        <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/fraud-summary">Fraud Summary</Link>
                        <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/analytics">Analytics</Link>
                        <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/settings">Settings</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <button className="p-2 text-slate-400 hover:text-white relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold">Alex Rivera</p>
                                <p className="text-[10px] text-slate-500">Security Lead</p>
                            </div>
                            <img alt="User profile avatar" className="size-9 rounded-full border border-white/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpN8Q6U5x2eacva97h5IHwCHx7ZNtyDqAVtDpaxxHecqY7cY5RoTklU0meWWdrfcLE7XGRXPI1-Z493CETsnSpVfVAkBUNsOB90f8z3WLLyQnwh2D6wReeYLDNOrxQWaUJCI3b7B6mOTIQElIrGIn2EQNutiCPhSBTKyzILsta0jSYJfM4p9p9iez3xuG-GKhd9ToeGlmRhdCB9iTfKVvaIbKgem-JKjczo2DkI__tbbjYUB-e7IgOFuitccnqqwrg_vmeVA8VkDPE" />
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-[1400px] mx-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass p-5 rounded-xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <span className="text-slate-400 text-sm font-medium">Total Transactions</span>
                            <span className="material-symbols-outlined text-primary/50">payments</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">12,847</h3>
                            <p className="text-emerald-400 text-xs font-medium mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span> +12.4% vs last week
                            </p>
                        </div>
                    </div>
                    <div className="glass p-5 rounded-xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <span className="text-slate-400 text-sm font-medium">Flagged Accounts</span>
                            <span className="material-symbols-outlined text-red-500/50">warning</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">23</h3>
                            <p className="text-red-400 text-xs font-medium mt-1">Immediate action required</p>
                        </div>
                    </div>
                    <div className="glass p-5 rounded-xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <span className="text-slate-400 text-sm font-medium">Detection Accuracy</span>
                            <span className="material-symbols-outlined text-primary/50">verified</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">94.7%</h3>
                            <p className="text-emerald-400 text-xs font-medium mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span> AI Engine Active
                            </p>
                        </div>
                    </div>
                    <div className="glass p-5 rounded-xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <span className="text-slate-400 text-sm font-medium">Last Scan</span>
                            <span className="material-symbols-outlined text-primary/50">schedule</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">2h ago</h3>
                            <p className="text-slate-500 text-xs mt-1">Automated daily check</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="glass rounded-xl p-6 flex-1 flex flex-col">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent-purple">psychology</span>
                                AI Fraud Detection
                            </h2>
                            <div className="space-y-6 flex-1">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold text-slate-400">Analysis Engine</span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase">
                                            <span className="size-2 bg-emerald-400 rounded-full"></span> Ready
                                        </span>
                                    </div>
                                    <button className="w-full gradient-btn py-4 rounded-xl font-bold text-background-dark shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                        Analyze Transactions
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold">Latest Findings</h3>
                                    <div className="flex items-start gap-4 p-4 glass rounded-xl border-l-4 border-l-red-500">
                                        <div className="bg-red-500/20 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-red-500 text-xl">group_remove</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Mule Network Detected</p>
                                            <p className="text-xs text-slate-400 mt-0.5">23 suspicious accounts identified in Cluster #4-A.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 glass rounded-xl border-l-4 border-l-primary">
                                        <div className="bg-primary/20 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Verification Complete</p>
                                            <p className="text-xs text-slate-400 mt-0.5">982 transactions cleared as legitimate today.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-xs text-slate-500">Processing Capacity</p>
                                    <p className="text-xs font-bold">78%</p>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-accent-purple w-[78%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-6 space-y-6">
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">upload_file</span>
                                Data Ingestion
                            </h2>
                            <div className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-all group">
                                <div className="bg-primary/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                                </div>
                                <h4 className="text-sm font-bold">Drag and drop CSV files</h4>
                                <p className="text-xs text-slate-500 mt-1">Supports bulk transaction logs up to 50MB</p>
                                <button className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors">Select Files</button>
                            </div>
                        </div>
                        <div className="glass rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-sm font-bold">Transaction Preview</h2>
                                <button className="gradient-btn px-4 py-1.5 rounded-lg text-[11px] font-bold text-background-dark uppercase tracking-wider">
                                    Upload to Database
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white/5 text-slate-400 uppercase tracking-tighter">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Sender</th>
                                            <th className="px-4 py-3 font-semibold">Receiver</th>
                                            <th className="px-4 py-3 font-semibold text-right">Amount</th>
                                            <th className="px-4 py-3 font-semibold">Timestamp</th>
                                            <th className="px-4 py-3 font-semibold text-center">Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-4 font-medium">Acct-9821-X</td>
                                            <td className="px-4 py-4">Acct-0042-B</td>
                                            <td className="px-4 py-4 text-right font-bold text-primary">$4,200.00</td>
                                            <td className="px-4 py-4 text-slate-500">2023-10-24 14:22</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold">Low</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-white/5 transition-colors bg-red-500/5">
                                            <td className="px-4 py-4 font-medium">Acct-4492-Z</td>
                                            <td className="px-4 py-4">Acct-3310-P</td>
                                            <td className="px-4 py-4 text-right font-bold text-primary">$8,900.00</td>
                                            <td className="px-4 py-4 text-slate-500">2023-10-24 14:30</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold">High</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="glass rounded-xl overflow-hidden min-h-[700px] flex flex-col">
                    <div className="p-6 border-b border-white/10 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold">Transaction Network Graph</h2>
                            <p className="text-xs text-slate-500 mt-1">Visualization of account relationships and fund flow patterns</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border-white/5">
                                <span className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(6,220,249,0.5)]"></span> Normal
                            </div>
                            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border-white/5">
                                <span className="size-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> Flagged
                            </div>
                            <div className="h-6 w-[1px] bg-white/10"></div>
                            <div className="flex bg-white/5 p-1 rounded-lg">
                                <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><span className="material-symbols-outlined text-sm">zoom_in</span></button>
                                <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><span className="material-symbols-outlined text-sm">zoom_out</span></button>
                                <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><span className="material-symbols-outlined text-sm">filter_list</span></button>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex-1 bg-[radial-gradient(circle_at_center,#1e293b_0%,#14161F_100%)] overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#06dcf9 1px, transparent 1px), linear-gradient(90deg, #06dcf9 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 1000 600">
                                <line stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" x1="500" x2="420" y1="300" y2="200"></line>
                                <line stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" x1="500" x2="580" y1="300" y2="200"></line>
                                <line stroke="#ef4444" strokeDasharray="4" strokeWidth="1.5" x1="500" x2="420" y1="300" y2="400"></line>
                                <line stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" x1="500" x2="580" y1="300" y2="400"></line>
                                <line stroke="#ef4444" strokeWidth="2" x1="420" x2="340" y1="400" y2="480"></line>
                                <circle cx="500" cy="300" fill="#06dcf9" fillOpacity="0.8" r="14"></circle>
                                <circle cx="420" cy="200" fill="#06dcf9" fillOpacity="0.6" r="10"></circle>
                                <circle cx="580" cy="200" fill="#06dcf9" fillOpacity="0.6" r="10"></circle>
                                <circle cx="580" cy="400" fill="#06dcf9" fillOpacity="0.6" r="10"></circle>
                                <circle className="animate-pulse" cx="420" cy="400" fill="#ef4444" r="12"></circle>
                                <circle cx="340" cy="480" fill="#ef4444" fillOpacity="0.9" r="10"></circle>
                                <text fill="white" fontSize="10" fontWeight="bold" x="518" y="305">Root Acct</text>
                                <text fill="#ef4444" fontSize="10" fontWeight="bold" x="365" y="405">Mule-01</text>
                            </svg>
                        </div>
                        <div className="absolute bottom-6 left-6 glass p-4 rounded-xl max-w-xs border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Detected Mule Cluster</p>
                                    <p className="text-[10px] text-slate-400">Node ID: Acct-3310-P</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="bg-white/5 rounded p-2">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Connections</p>
                                    <p className="text-xs font-bold">14 High-risk</p>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Volume</p>
                                    <p className="text-xs font-bold">$1.2M / 24h</p>
                                </div>
                            </div>
                            <button className="w-full mt-3 py-1.5 bg-red-500 hover:bg-red-600 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">Freeze Network</button>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="max-w-[1400px] mx-auto p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
                <p>© 2023 Chain-Trace AI Platform. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link className="hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link>
                    <Link className="hover:text-primary transition-colors" to="/status">System Status</Link>
                    <Link className="hover:text-primary transition-colors" to="/contact">Contact Intelligence Team</Link>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
