
import { Link } from "react-router-dom";
import { ModeToggle } from "../components/mode-toggle";
import { useDashboardStats } from "../hooks/useData";
import { useRef, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// ── Mini Transaction Network Graph ──────────────────────────────────────────
interface MiniGraphProps {
    transactions: Array<{
        id: string;
        sender_id: string;
        receiver_id: string;
        amount: number;
        is_flagged: boolean;
        sender?: { account_name?: string | null };
        receiver?: { account_name?: string | null };
    }>;
    loading: boolean;
}

function MiniGraph({ transactions, loading }: MiniGraphProps) {
    const [hovered, setHovered] = useState<string | null>(null);

    const { nodes, edges } = useMemo(() => {
        if (!transactions.length) return { nodes: [], edges: [] };

        // Collect unique accounts
        const accountMap = new Map<string, string>(); // id -> display label
        transactions.forEach(tx => {
            if (!accountMap.has(tx.sender_id))
                accountMap.set(tx.sender_id, tx.sender?.account_name || tx.sender_id.slice(0, 6));
            if (!accountMap.has(tx.receiver_id))
                accountMap.set(tx.receiver_id, tx.receiver?.account_name || tx.receiver_id.slice(0, 6));
        });

        const accountIds = Array.from(accountMap.keys());
        const W = 800, H = 320, CX = W / 2, CY = H / 2;

        // Layout on an ellipse
        const nodes = accountIds.map((id, i) => {
            const angle = (2 * Math.PI * i) / accountIds.length - Math.PI / 2;
            const rx = Math.min(CX * 0.7, 300);
            const ry = Math.min(CY * 0.7, 120);
            return {
                id,
                label: accountMap.get(id)!,
                x: CX + rx * Math.cos(angle),
                y: CY + ry * Math.sin(angle),
                flagged: transactions.some(t => (t.sender_id === id || t.receiver_id === id) && t.is_flagged),
            };
        });

        const nodeIndex = new Map(nodes.map(n => [n.id, n]));

        const edges = transactions.map(tx => ({
            id: tx.id,
            x1: nodeIndex.get(tx.sender_id)?.x ?? CX,
            y1: nodeIndex.get(tx.sender_id)?.y ?? CY,
            x2: nodeIndex.get(tx.receiver_id)?.x ?? CX,
            y2: nodeIndex.get(tx.receiver_id)?.y ?? CY,
            flagged: tx.is_flagged,
            amount: tx.amount,
        }));

        return { nodes, edges };
    }, [transactions]);

    return (
        <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-purple text-lg">hub</span>
                    Live Transaction Network
                </h2>
                <Link to="/analytics" className="text-xs text-primary hover:underline">View Full Analytics →</Link>
            </div>
            <div className="relative w-full" style={{ minHeight: 340 }}>
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">Loading graph...</div>
                ) : transactions.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
                        <span className="material-symbols-outlined text-4xl opacity-30">account_tree</span>
                        <p className="text-sm">Upload a CSV and run Analyze to see the network graph.</p>
                    </div>
                ) : (
                    <svg className="w-full" viewBox="0 0 800 340" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <marker id="arrowClean" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L6,3 z" fill="#06dcf9" opacity="0.6" />
                            </marker>
                            <marker id="arrowFlagged" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" opacity="0.8" />
                            </marker>
                        </defs>

                        {/* Edges */}
                        {edges.map(e => (
                            <line
                                key={e.id}
                                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                stroke={e.flagged ? '#ef4444' : '#06dcf9'}
                                strokeWidth={e.flagged ? 1.5 : 1}
                                strokeOpacity={e.flagged ? 0.7 : 0.4}
                                markerEnd={e.flagged ? 'url(#arrowFlagged)' : 'url(#arrowClean)'}
                                strokeDasharray={e.flagged ? '4 2' : undefined}
                            >
                                <title>${e.amount.toFixed(2)} {e.flagged ? '⚠ Flagged' : '✓ Clean'}</title>
                            </line>
                        ))}

                        {/* Nodes */}
                        {nodes.map(n => (
                            <g key={n.id}
                                onMouseEnter={() => setHovered(n.id)}
                                onMouseLeave={() => setHovered(null)}
                                style={{ cursor: 'pointer' }}>
                                {/* Glow ring on hover */}
                                {hovered === n.id && (
                                    <circle cx={n.x} cy={n.y} r={18}
                                        fill="none"
                                        stroke={n.flagged ? '#ef4444' : '#06dcf9'}
                                        strokeWidth={1.5}
                                        strokeOpacity={0.5} />
                                )}
                                <circle
                                    cx={n.x} cy={n.y} r={10}
                                    fill={n.flagged ? '#ef4444' : '#06dcf9'}
                                    fillOpacity={n.flagged ? 0.85 : 0.7}
                                />
                                <text
                                    x={n.x} y={n.y + 22}
                                    textAnchor="middle"
                                    fill="#94a3b8"
                                    fontSize="9"
                                    fontFamily="monospace">
                                    {n.label.length > 10 ? n.label.slice(0, 9) + '…' : n.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                )}
            </div>
            {/* Legend */}
            {!loading && transactions.length > 0 && (
                <div className="px-4 pb-4 flex items-center gap-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary/70 inline-block"></span>Clean transfer</span>
                    <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500/80 inline-block"></span>Flagged transfer</span>
                    <span className="text-slate-600">Showing recent {transactions.length} transactions</span>
                </div>
            )}
        </div>
    );
}

const Dashboard = () => {
    const { stats, loading } = useDashboardStats();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        toast.info("Uploading and analyzing transactions...");

        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
            const response = await fetch(`${apiUrl}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            console.log("Analysis Result:", result);

            toast.success(`Analysis Complete: ${result.fraud_ring_count || 0} rings detected.`);

            // Reload to fetch updated stats from DB
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error("Upload/Analysis error:", error);
            toast.error("Process failed: " + message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Removed separate handleAnalyze as upload now triggers analysis
    const handleAnalyze = () => {
        toast.info("Please upload a CSV file to trigger analysis.");
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display transition-colors duration-300">
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
                            <h3 className="text-2xl font-bold">{loading ? "..." : stats.totalTransactions}</h3>
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
                            <h3 className="text-2xl font-bold">{loading ? "..." : stats.flaggedAccounts}</h3>
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
                            <h3 className="text-2xl font-bold">{stats.lastScan}</h3>
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
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                        className="w-full gradient-btn py-4 rounded-xl font-bold text-background-dark shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                                        {analyzing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                                Analyzing...
                                            </span>
                                        ) : (
                                            "Analyze Transactions"
                                        )}
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
                            <div
                                className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-all group relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                                        <p className="text-sm font-bold mt-2">Uploading...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-primary/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                                        </div>
                                        <h4 className="text-sm font-bold">Drag and drop CSV files</h4>
                                        <p className="text-xs text-slate-500 mt-1">Supports bulk transaction logs up to 50MB</p>
                                        <button className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors">Select Files</button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="glass rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-sm font-bold">Transaction Preview</h2>
                                <Link to="/transactions" className="gradient-btn px-4 py-1.5 rounded-lg text-[11px] font-bold text-background-dark uppercase tracking-wider block">
                                    View All
                                </Link>
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
                                        {loading ? (
                                            <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                                        ) : stats.recentTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-4 font-medium truncate max-w-[100px]">{tx.sender?.account_name || tx.sender_id}</td>
                                                <td className="px-4 py-4 truncate max-w-[100px]">{tx.receiver?.account_name || tx.receiver_id}</td>
                                                <td className="px-4 py-4 text-right font-bold text-primary">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount)}
                                                </td>
                                                <td className="px-4 py-4 text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 text-center">
                                                    {tx.is_flagged ? (
                                                        <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold">High</span>
                                                    ) : (
                                                        <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold">Low</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Live Transaction Network Graph */}
                <MiniGraph transactions={stats.recentTransactions} loading={loading} />
            </main>
        </div>
    );
};

export default Dashboard;
