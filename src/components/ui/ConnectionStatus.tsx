import { useConnectionTest } from '../../lib/hooks';
import { HiOutlineStatusOnline, HiOutlineStatusOffline } from 'react-icons/hi';

export default function ConnectionStatus() {
    const { result, testing, configured, runTest } = useConnectionTest();

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Supabase Connection
                </h3>
                <button
                    onClick={runTest}
                    disabled={testing}
                    className="rounded-lg bg-violet-500/15 px-4 py-1.5 text-xs font-medium text-violet-300 transition-all hover:bg-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {testing ? 'Testing…' : 'Test Connection'}
                </button>
            </div>

            {!configured && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm">
                    <span className="text-amber-400 mt-0.5">⚠️</span>
                    <div>
                        <p className="text-amber-300 font-medium">Not Configured</p>
                        <p className="text-amber-300/70 text-xs mt-1">
                            Set <code className="bg-white/5 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
                            <code className="bg-white/5 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your{' '}
                            <code className="bg-white/5 px-1 rounded">.env</code> file.
                        </p>
                    </div>
                </div>
            )}

            {result && (
                <div
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm border ${result.connected
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : 'bg-rose-500/10 border-rose-500/20'
                        }`}
                >
                    {result.connected ? (
                        <HiOutlineStatusOnline className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                        <HiOutlineStatusOffline className="h-5 w-5 text-rose-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                        <p className={result.connected ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                            {result.connected ? 'Connected' : 'Connection Failed'}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                            {result.latency_ms}ms latency · {result.timestamp}
                        </p>
                        {result.error && (
                            <p className="text-gray-400 text-xs mt-1 truncate">{result.error}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
