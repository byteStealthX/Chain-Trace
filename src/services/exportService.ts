import {
    analyzeTransactionsLocal,
    fetchSuspiciousAccounts,
    type AnalysisResult,
    type SuspiciousAccount,
} from './analysisService';

// ── Exact JSON export schema ──────────────────────────────────────────
export interface ExportPayload {
    suspicious_accounts: ExportSuspiciousAccount[];
    fraud_rings: ExportFraudRing[];
    summary: {
        total_accounts_analyzed: number;
        suspicious_accounts_flagged: number;
        fraud_rings_detected: number;
        processing_time_seconds: number;
    };
}

interface ExportSuspiciousAccount {
    account_id: string;
    suspicion_score: number;
    risk_label: string;
    cycle_score: number;
    fanin_fanout_score: number;
    shell_score: number;
    velocity_score: number;
    transaction_count: number;
    total_volume: number;
    contributing_rings: string[];
}

interface ExportFraudRing {
    ring_id: string;
    ring_type: string;
    severity: string;
    member_count: number;
    accounts: string[];
    transactions: string[];
    total_amount: number;
    description: string;
    cycle_length?: number;
    hop_count?: number;
    window_hours?: number;
}

// ── Build export payload ──────────────────────────────────────────────
export async function buildExportPayload(): Promise<{
    data: ExportPayload | null;
    error: string | null;
    durationMs: number;
}> {
    const start = performance.now();

    const [analysisRes, saRes] = await Promise.all([
        analyzeTransactionsLocal(),
        fetchSuspiciousAccounts(),
    ]);

    const durationMs = Math.round(performance.now() - start);

    if (analysisRes.error) {
        return { data: null, error: analysisRes.error, durationMs };
    }

    const analysis = analysisRes.data as AnalysisResult;
    const suspAccounts = (saRes.data ?? analysis.suspicious_accounts ?? []) as SuspiciousAccount[];
    const rings = analysis.fraud_rings ?? [];

    // ── Map suspicious accounts (sorted by score desc) ──────────────────
    const suspicious_accounts: ExportSuspiciousAccount[] = [...suspAccounts]
        .sort((a, b) => b.suspicion_score - a.suspicion_score)
        .map((sa) => ({
            account_id: sa.account_id,
            suspicion_score: sa.suspicion_score,
            risk_label: sa.risk_label,
            cycle_score: sa.cycle_score,
            fanin_fanout_score: sa.fanin_fanout_score,
            shell_score: sa.shell_score,
            velocity_score: sa.velocity_score,
            transaction_count: sa.transaction_count,
            total_volume: sa.total_volume,
            contributing_rings: sa.contributing_rings,
        }));

    // ── Map fraud rings (sorted by severity desc) ───────────────────────
    const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

    const fraud_rings: ExportFraudRing[] = [...rings]
        .sort((a, b) => (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0))
        .map((r, idx) => ({
            ring_id: `RING-${String(idx + 1).padStart(3, '0')}`,
            ring_type: r.ring_type,
            severity: r.severity,
            member_count: r.accounts.length,
            accounts: r.accounts.sort(),
            transactions: r.transactions,
            total_amount: r.total_amount,
            description: r.description,
            ...(r.cycle_length != null ? { cycle_length: r.cycle_length } : {}),
            ...(r.hop_count != null ? { hop_count: r.hop_count } : {}),
            ...(r.window_hours != null ? { window_hours: r.window_hours } : {}),
        }));

    // ── Summary ─────────────────────────────────────────────────────────
    const payload: ExportPayload = {
        suspicious_accounts,
        fraud_rings,
        summary: {
            total_accounts_analyzed: analysis.node_count,
            suspicious_accounts_flagged: suspicious_accounts.filter((sa) => sa.suspicion_score > 0).length,
            fraud_rings_detected: fraud_rings.length,
            processing_time_seconds: Math.round((durationMs / 1000) * 100) / 100,
        },
    };

    return { data: payload, error: null, durationMs };
}

// ── Download as JSON file ─────────────────────────────────────────────
export function downloadJson(payload: ExportPayload, filename?: string): void {
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `chain-trace-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
