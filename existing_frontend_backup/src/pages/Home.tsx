import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineCloudUpload,
    HiOutlineDocumentText,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineX,
    HiOutlineTable,
    HiOutlineRefresh,
} from 'react-icons/hi';
import {
    parseCsvFile,
    validateCsv,
    uploadToSupabase,
    type ParseResult,
    type ValidationResult,
} from '../services/csvService';
import {
    analyzeTransactions,
} from '../services/analysisService';
import ConnectionStatus from '../components/ui/ConnectionStatus';

type Stage = 'idle' | 'parsing' | 'validated' | 'uploading' | 'analyzing' | 'done' | 'error';

export default function Home() {
    const navigate = useNavigate();
    const [stage, setStage] = useState<Stage>('idle');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // ── Handle file selection ────────────────────────────────────────────
    const handleFile = useCallback(async (selectedFile: File) => {
        if (!selectedFile.name.endsWith('.csv')) {
            setErrorMsg('Please upload a .csv file');
            setStage('error');
            return;
        }

        setFile(selectedFile);
        setStage('parsing');
        setErrorMsg('');

        try {
            const parsed = await parseCsvFile(selectedFile);
            setParseResult(parsed);

            const val = validateCsv(parsed);
            setValidation(val);

            if (val.missingHeaders.length > 0) {
                setErrorMsg(
                    `Missing required headers: ${val.missingHeaders.join(', ')}`
                );
                setStage('error');
            } else {
                setStage('validated');
            }
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to parse CSV');
            setStage('error');
        }
    }, []);

    // ── Upload validated rows to Supabase ────────────────────────────────
    const handleUpload = useCallback(async () => {
        if (!validation || validation.validRows.length === 0 || !file) return;

        setStage('uploading');
        try {
            await uploadToSupabase(file, validation.validRows);

            // ── Trigger Analysis Progress Interface ────────────────────────
            setStage('analyzing');

            // Invoke the fraud detection engine
            const { error: analysisError } = await analyzeTransactions({ limit: 5000 });

            if (analysisError) {
                setErrorMsg(`Analysis failed: ${analysisError}`);
                setStage('error');
                return;
            }

            // Success: Short delay for effect then redirect
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
            setStage('error');
        }
    }, [validation, file, navigate]);

    // ── Reset everything ─────────────────────────────────────────────────
    const reset = () => {
        setStage('idle');
        setFile(null);
        setParseResult(null);
        setValidation(null);
        setErrorMsg('');
        if (inputRef.current) inputRef.current.value = '';
    };

    // ── Drag & drop handlers ─────────────────────────────────────────────
    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    return (
        <div className="animate-fade-in-up space-y-8 relative min-h-[60vh]">
            {/* Page header */}
            <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">
                    Upload Transactions
                </h1>
                <p className="text-gray-400">
                    Import CSV transaction data for fraud analysis. Required headers:{' '}
                    <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">
                        transaction_id, sender_id, receiver_id, amount, timestamp
                    </code>
                </p>
            </div>

            {/* Connection status */}
            <ConnectionStatus />

            {/* ── Drag & Drop Zone ──────────────────────────────────────── */}
            {stage === 'idle' && (
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-300 ${isDragging
                        ? 'border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/10 scale-[1.01]'
                        : 'border-white/10 bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/5'
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".csv"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className={`flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 ${isDragging
                                ? 'bg-violet-500/20 text-violet-300 scale-110'
                                : 'bg-white/5 text-gray-400 group-hover:bg-violet-500/10 group-hover:text-violet-300'
                                }`}
                        >
                            <HiOutlineCloudUpload className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-white">
                                Drop your CSV file here
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                or click to browse · supports <span className="text-gray-400">.csv</span> files
                            </p>
                        </div>
                    </div>
                    {isDragging && (
                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5 animate-pulse" />
                    )}
                </div>
            )}

            {/* ── Parsing spinner ───────────────────────────────────────── */}
            {stage === 'parsing' && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 mb-4">
                        <HiOutlineRefresh className="h-6 w-6 text-violet-400 animate-spin" />
                    </div>
                    <p className="text-lg font-medium text-white">Parsing CSV…</p>
                    <p className="text-sm text-gray-500 mt-1">{file?.name}</p>
                </div>
            )}

            {/* ── Error state ───────────────────────────────────────────── */}
            {stage === 'error' && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 flex-shrink-0">
                            <HiOutlineExclamationCircle className="h-5 w-5 text-rose-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-rose-300">Upload Error</h3>
                            <p className="text-sm text-rose-300/70 mt-1">{errorMsg}</p>
                            {file && (
                                <p className="text-xs text-gray-500 mt-2">
                                    <HiOutlineDocumentText className="inline h-3.5 w-3.5 mr-1" />
                                    {file.name}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={reset}
                            className="rounded-lg bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <HiOutlineX className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Validation results + preview ──────────────────────────── */}
            {stage === 'validated' && validation && parseResult && (
                <div className="space-y-6">
                    {/* Summary bar */}
                    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-2">
                            <HiOutlineDocumentText className="h-5 w-5 text-violet-400" />
                            <span className="text-sm text-gray-300 font-medium">{file?.name}</span>
                            <span className="text-xs text-gray-600">
                                ({((file?.size ?? 0) / 1024).toFixed(1)} KB)
                            </span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-medium">
                            {validation.validRows.length} valid rows
                        </span>
                        {validation.invalidRows.length > 0 && (
                            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs text-amber-400 font-medium">
                                {validation.invalidRows.length} invalid rows
                            </span>
                        )}
                        <div className="ml-auto flex gap-3">
                            <button
                                onClick={reset}
                                className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={validation.validRows.length === 0}
                                className="rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Upload {validation.validRows.length} Records
                            </button>
                        </div>
                    </div>

                    {/* Invalid row warnings */}
                    {validation.invalidRows.length > 0 && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <h4 className="text-sm font-medium text-amber-300 mb-2">
                                ⚠️ Skipped Rows ({validation.invalidRows.length})
                            </h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {validation.invalidRows.slice(0, 10).map((r: any) => (
                                    <p key={r.row} className="text-xs text-amber-300/70">
                                        Row {r.row}: {r.reason}
                                    </p>
                                ))}
                                {validation.invalidRows.length > 10 && (
                                    <p className="text-xs text-amber-300/50">
                                        …and {validation.invalidRows.length - 10} more
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Data preview table */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                            <HiOutlineTable className="h-4 w-4 text-violet-400" />
                            <h4 className="text-sm font-medium text-gray-300">
                                Preview (first 10 rows)
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {parseResult.headers.slice(0, 6).map((h: string) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {validation.validRows.slice(0, 10).map((row: any, i: number) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-white/[0.02] transition-colors"
                                        >
                                            {parseResult.headers.slice(0, 6).map((h: string) => (
                                                <td key={h} className="px-4 py-2.5 text-gray-300 text-xs">
                                                    {(row as Record<string, string>)[h] ?? '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Uploading state ───────────────────────────────────────── */}
            {stage === 'uploading' && (
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-12 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 mb-4">
                        <HiOutlineCloudUpload className="h-7 w-7 text-violet-400 animate-bounce" />
                    </div>
                    <p className="text-lg font-semibold text-white">
                        Uploading to Supabase…
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Inserting {validation?.validRows.length ?? 0} records in batches
                    </p>
                </div>
            )}

            {/* ── Analyzing state (Full Screen Overlay) ────────────────── */}
            {stage === 'analyzing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-md animate-fade-in">
                    <div className="max-w-md w-full px-8 text-center">
                        <div className="relative mb-8 flex justify-center">
                            {/* Premium animated progress indicator */}
                            <div className="h-24 w-24 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <HiOutlineRefresh className="h-8 w-8 text-violet-400 animate-pulse" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Analyzing transaction network...</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Detecting money muling patterns, circular routing, and smurfing rings across {validation?.validRows.length} records.
                        </p>

                        {/* Progress bar */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 animate-progress" />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-4 font-semibold">
                            Processing Graph Algortihms
                        </p>
                    </div>
                </div>
            )}

            {/* ── Done state (Optional, usually we redirect) ───────────── */}
            {stage === 'done' && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-12 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 mb-4">
                        <HiOutlineCheckCircle className="h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="text-lg font-semibold text-white">Complete!</p>
                    <p className="text-sm text-gray-500 mt-1">Redirecting to Dashboard…</p>
                </div>
            )}
        </div>
    );
}
