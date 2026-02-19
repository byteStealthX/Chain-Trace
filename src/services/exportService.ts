import {
    fetchGraphData,
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
    detected_patterns: string[];
    ring_id: string;
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

// ── Validation Logic ────────────────────────────────────────────────
export function validateExportPayload(payload: ExportPayload): string[] {
    const errors: string[] = [];

    // 1. Summary validation
    if (!payload.summary) {
        errors.push('Missing summary object');
    } else {
        const requiredSummary = ['total_accounts_analyzed', 'suspicious_accounts_flagged', 'fraud_rings_detected', 'processing_time_seconds'];
        for (const field of requiredSummary) {
            if (typeof (payload.summary as any)[field] !== 'number') {
                errors.push(`Summary field "${field}" must be a number`);
            }
        }
    }

    // 2. Suspicious accounts validation
    if (!Array.isArray(payload.suspicious_accounts)) {
        errors.push('suspicious_accounts must be an array');
    } else {
        let prevScore = Infinity;
        payload.suspicious_accounts.forEach((sa) => {
            if (typeof sa.suspicion_score !== 'number') {
                errors.push(`Account ${sa.account_id}: suspicion_score must be a float`);
            }
            if (sa.suspicion_score > prevScore) {
                errors.push('suspicious_accounts are not sorted descending by score');
            }
            prevScore = sa.suspicion_score;

            if (!sa.ring_id || sa.ring_id === 'N/A') {
                errors.push(`Account ${sa.account_id}: missing ring_id`);
            }
            if (!Array.isArray(sa.detected_patterns)) {
                errors.push(`Account ${sa.account_id}: detected_patterns must be an array`);
            }
        });
    }

    // 3. Fraud rings validation
    if (!Array.isArray(payload.fraud_rings)) {
        errors.push('fraud_rings must be an array');
    }

    return errors;
}

// ── Build export payload ──────────────────────────────────────────────
export async function buildExportPayload(): Promise<{
    data: ExportPayload | null;
    error: string | null;
    durationMs: number;
    validationErrors?: string[];
}> {
    const start = performance.now();

    // Use fetchGraphData for consistency with UI and server-side analysis
    const { data: analysis, error } = await fetchGraphData({ limit: 1000 });

    const durationMs = Math.round(performance.now() - start);

    if (error || !analysis) {
        return { data: null, error: error ?? 'Failed to fetch graph data', durationMs };
    }

    const suspAccounts = (analysis.suspicious_accounts ?? []) as SuspiciousAccount[];
    const rings = analysis.fraud_rings ?? [];

    // Map severity to order for ring ID generation
    const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

    // ── Map fraud rings (sorted by severity desc) ───────────────────────
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

    // Generate a lookup for account_id -> ring_id
    const accToRingMap = new Map<string, string>();
    fraud_rings.forEach((fr) => {
        fr.accounts.forEach((acc) => {
            if (!accToRingMap.has(acc)) accToRingMap.set(acc, fr.ring_id);
        });
    });

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
            detected_patterns: sa.contributing_rings,
            ring_id: accToRingMap.get(sa.account_id) ?? 'N/A', // Assign primary ring ID
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

    // ── Automated Validation ────────────────────────────────────────────
    const validationErrors = validateExportPayload(payload);

    return {
        data: payload,
        error: validationErrors.length > 0 ? 'Export validation failed' : null,
        durationMs,
        validationErrors
    };
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
