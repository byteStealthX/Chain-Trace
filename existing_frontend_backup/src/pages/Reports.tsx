import { useState, useCallback } from 'react';
import {
    HiOutlineDownload,
    HiOutlineRefresh,
    HiOutlineClipboardCopy,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineDocumentReport,
    HiOutlineCode,
    HiOutlineShieldExclamation,
    HiOutlineUserGroup,
    HiOutlineClock,
} from 'react-icons/hi';
import { buildExportPayload, downloadJson, type ExportPayload } from '../services/exportService';

export default function Reports() {
    const [payload, setPayload] = useState<ExportPayload | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [durationMs, setDurationMs] = useState(0);
    const [copied, setCopied] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // ── Generate report ─────────────────────────────────────────────────
    const generateReport = useCallback(async () => {
        setLoading(true);
        setError('');
        setValidationErrors([]);
        setCopied(false);

        const { data, error: err, durationMs: ms, validationErrors: vErrs } = await buildExportPayload();
        setDurationMs(ms);

        if (err || !data) {
            setError(err ?? 'Failed to generate report');
            if (vErrs && vErrs.length > 0) {
                setValidationErrors(vErrs);
            }
            setLoading(false);
            return;
        }

        setPayload(data);
        setLoading(false);
    }, []);

    // ── Download ────────────────────────────────────────────────────────
    const handleDownload = () => {
        if (payload && validationErrors.length === 0) downloadJson(payload);
    };

    // ── Copy to clipboard ──────────────────────────────────────────────
    const handleCopy = async () => {
        if (!payload) return;
        try {
            await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            setError('Failed to copy to clipboard');
        }
    };

    // ── Summary cards ──────────────────────────────────────────────────
    const summaryCards = payload
        ? [
            {
                label: 'Accounts Analyzed',
                value: payload.summary.total_accounts_analyzed,
                icon: <HiOutlineUserGroup className="h-5 w-5" />,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10',
            },
            {
                label: 'Suspicious Flagged',
                value: payload.summary.suspicious_accounts_flagged,
                icon: <HiOutlineShieldExclamation className="h-5 w-5" />,
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
            },
            {
                label: 'Fraud Rings',
                value: payload.summary.fraud_rings_detected,
                icon: <HiOutlineDocumentReport className="h-5 w-5" />,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
            },
            {
                label: 'Processing Time',
                value: `${payload.summary.processing_time_seconds}s`,
                icon: <HiOutlineClock className="h-5 w-5" />,
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
            },
        ]
        : [];

    const jsonPreview = payload ? JSON.stringify(payload, null, 2) : '';
    const fileSizeKb = payload
        ? (new Blob([jsonPreview]).size / 1024).toFixed(1)
        : '0';

    return (
        <div className="animate-fade-in-up space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">Reports</h1>
                    <p className="text-gray-400">
                        Generate and export fraud detection analysis as JSON
                    </p>
                </div>
            </div>

            {/* Action panel */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                            <HiOutlineDocumentReport className="h-5 w-5 text-violet-400" />
                            JSON Export
                        </h2>
                        <p className="text-sm text-gray-500">
                            Compile all suspicious accounts, fraud rings, and summary statistics into a downloadable JSON report
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {/* Generate / Refresh */}
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <HiOutlineRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {payload ? 'Regenerate' : 'Generate Report'}
                        </button>

                        {/* Download */}
                        {payload && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-500"
                            >
                                <HiOutlineDownload className="h-4 w-4" />
                                Download JSON
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error & Validation */}
            {(error || validationErrors.length > 0) && (
                <div className="flex flex-col gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm">
                    {error && (
                        <div className="flex items-center gap-3">
                            <HiOutlineExclamationCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                            <span className="text-rose-300">{error}</span>
                        </div>
                    )}
                    {validationErrors.length > 0 && (
                        <div className="space-y-2 mt-1">
                            <p className="font-semibold text-rose-400">Specification Mismatches:</p>
                            <ul className="list-disc list-inside text-rose-300/80 space-y-1">
                                {validationErrors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-16">
                    <HiOutlineRefresh className="h-6 w-6 text-violet-400 animate-spin mr-3" />
                    <span className="text-sm text-gray-400">Analyzing transactions and building report…</span>
                </div>
            )}

            {/* Results */}
            {payload && !loading && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {summaryCards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3"
                            >
                                <div className={`rounded-lg p-2 ${card.bg} ${card.color}`}>
                                    {card.icon}
                                </div>
                                <div>
                                    <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                                    <p className="text-xs text-gray-500">{card.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* JSON preview card */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                        {/* Preview header */}
                        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <HiOutlineCode className="h-5 w-5 text-cyan-400" />
                                <h3 className="text-sm font-semibold text-white">JSON Preview</h3>
                                <span className="text-xs text-gray-500">{fileSizeKb} KB</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    {showPreview ? 'Collapse' : 'Expand'}
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <HiOutlineCheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                            <span className="text-emerald-400">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineClipboardCopy className="h-3.5 w-3.5" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* JSON body — summary always visible, full preview toggleable */}
                        <div className="px-6 py-4">
                            {/* Always-visible summary snippet */}
                            <pre className="text-xs font-mono text-gray-400 leading-relaxed overflow-x-auto">
                                <code>
                                    <span className="text-gray-500">{'{'}</span>{'\n'}
                                    <span className="text-gray-500">  "summary"</span>
                                    <span className="text-gray-600">: {'{'}</span>{'\n'}
                                    <span className="text-gray-500">    "total_accounts_analyzed"</span>
                                    <span className="text-gray-600">: </span>
                                    <span className="text-cyan-400">{payload.summary.total_accounts_analyzed}</span>,{'\n'}
                                    <span className="text-gray-500">    "suspicious_accounts_flagged"</span>
                                    <span className="text-gray-600">: </span>
                                    <span className="text-rose-400">{payload.summary.suspicious_accounts_flagged}</span>,{'\n'}
                                    <span className="text-gray-500">    "fraud_rings_detected"</span>
                                    <span className="text-gray-600">: </span>
                                    <span className="text-amber-400">{payload.summary.fraud_rings_detected}</span>,{'\n'}
                                    <span className="text-gray-500">    "processing_time_seconds"</span>
                                    <span className="text-gray-600">: </span>
                                    <span className="text-emerald-400">{payload.summary.processing_time_seconds}</span>{'\n'}
                                    <span className="text-gray-600">  {'}'}</span>,{'\n'}
                                    <span className="text-gray-500">  "suspicious_accounts"</span>
                                    <span className="text-gray-600">: </span>
                                    <span className="text-violet-400">[{payload.suspicious_accounts.length} items]</span>,{'\n'}
                                    <span className="text-gray-500">  "fraud_rings"</span>
                                    <span className="text-gray-600">: </span>
                                    <span className="text-violet-400">[{payload.fraud_rings.length} items]</span>{'\n'}
                                    <span className="text-gray-500">{'}'}</span>
                                </code>
                            </pre>

                            {/* Full preview */}
                            {showPreview && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <pre className="text-xs font-mono text-gray-400 leading-relaxed overflow-x-auto max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                                        {jsonPreview}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                            Generated at {new Date().toLocaleTimeString()} • {fileSizeKb} KB •{' '}
                            {payload.suspicious_accounts.length} accounts •{' '}
                            {payload.fraud_rings.length} rings
                        </span>
                        <span>
                            Processing: {durationMs}ms ({payload.summary.processing_time_seconds}s)
                        </span>
                    </div>
                </>
            )}

            {/* Empty state — before first generation */}
            {!payload && !loading && !error && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-20 text-center">
                    <HiOutlineDownload className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-1">No report generated yet</p>
                    <p className="text-xs text-gray-600">
                        Click "Generate Report" to compile analysis data into a downloadable JSON file
                    </p>
                </div>
            )}
        </div>
    );
}
