
import { Link } from "react-router-dom";
import { ModeToggle } from "../components/mode-toggle";
import { useDashboardStats } from "../hooks/useData";
import { useRef, useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Dashboard = () => {
    const { stats, loading } = useDashboardStats();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rows = results.data as any[];
                    console.log("Parsed CSV:", rows);

                    // 1. Extract unique accounts
                    const accounts = new Set<string>();
                    rows.forEach(row => {
                        if (row.sender_id) accounts.add(row.sender_id);
                        if (row.receiver_id) accounts.add(row.receiver_id);
                    });

                    // 2. Upsert accounts
                    const accountUpdates = Array.from(accounts).map(id => ({
                        account_id: id,
                        account_name: `Account ${id}`,
                        risk_level: 'low' // Default
                    }));

                    if (accountUpdates.length > 0) {
                        const { error: accError } = await supabase
                            .from('accounts')
                            .upsert(accountUpdates, { onConflict: 'account_id', ignoreDuplicates: true });
                        if (accError) throw accError;
                    }

                    // 3. Insert transactions
                    const transactions = rows.map(row => ({
                        transaction_ref: row.transaction_ref || crypto.randomUUID(),
                        sender_id: row.sender_id,
                        receiver_id: row.receiver_id,
                        amount: parseFloat(row.amount),
                        currency: row.currency || 'USD',
                        timestamp: row.timestamp || new Date().toISOString(),
                        risk_score: 0,
                        is_flagged: false
                    }));

                    const { error: txError } = await supabase.from('transactions').insert(transactions);
                    if (txError) throw txError;

                    toast.success(`Successfully uploaded ${transactions.length} transactions`);
                    window.location.reload();

                } catch (error: any) {
                    console.error("Upload error:", error);
                    toast.error("Upload failed: " + error.message);
                } finally {
                    setUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            },
            error: (error) => {
                toast.error("CSV Parse Error");
                setUploading(false);
            }
        });
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        toast.info("Starting AI analysis...");
        try {
            const { data, error } = await supabase.functions.invoke('analyze-transactions');
            if (error) throw error;

            toast.success(`Analysis Complete: ${data.fraud_ring_count || 0} rings detected.`);
            // Refresh stats after a short delay to allow DB to update
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err: any) {
            console.error("Analysis failed:", err);
            toast.error("Analysis failed: " + err.message);
        } finally {
            setAnalyzing(false);
        }
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
                {/* Graph removed from Dashboard to keep it clean, available in Analysis/Graph page? Or keep as SVG placeholder? Keeping placeholder for now as it's just a demo */}
                <div className="glass rounded-xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-10">
                    <p className="text-slate-500">Graph visualization moved to dedicated Engine page</p>
                    <Link to="/analytics" className="mt-4 px-6 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary/90">Go to Graph Engine</Link>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
