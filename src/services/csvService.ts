import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { analysisCache } from '../lib/analysisCache';
import { uploadCsvToStorage } from './storageService';
import { analyzeTransactionsBatch } from './functionService';

// ---------------------------------------------------------------------------
// Required CSV headers — upload will be rejected if any are missing
// ---------------------------------------------------------------------------
const REQUIRED_HEADERS = [
    'transaction_id',
    'sender_id',
    'receiver_id',
    'amount',
    'timestamp',
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CsvRow {
    transaction_id: string;
    sender_id: string;
    receiver_id: string;
    amount: string;
    timestamp: string;
    [key: string]: string; // allow extra columns
}

export interface ParseResult {
    rows: CsvRow[];
    headers: string[];
    totalRows: number;
}

export interface ValidationResult {
    valid: boolean;
    missingHeaders: string[];
    invalidRows: Array<{ row: number; reason: string }>;
    validRows: CsvRow[];
}

export interface UploadResult {
    success: boolean;
    recordsInserted: number;
    recordsFailed: number;
    errors: string[];
    duration_ms: number;
}

// ---------------------------------------------------------------------------
// 1. Parse CSV file using PapaParse (Worker Thread for Performance)
// ---------------------------------------------------------------------------
export function parseCsvFile(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            worker: true, // Offload parsing to a web worker
            transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
            complete: (results) => {
                resolve({
                    rows: results.data,
                    headers: results.meta.fields ?? [],
                    totalRows: results.data.length,
                });
            },
            error: (error) => {
                reject(new Error(`CSV parse error: ${error.message}`));
            },
        });
    });
}

// ---------------------------------------------------------------------------
// 2. Validate parsed CSV — check headers & row data
// ---------------------------------------------------------------------------
export function validateCsv(parsed: ParseResult): ValidationResult {
    const missingHeaders = REQUIRED_HEADERS.filter(
        (h) => !parsed.headers.includes(h)
    );

    if (missingHeaders.length > 0) {
        return {
            valid: false,
            missingHeaders,
            invalidRows: [],
            validRows: [],
        };
    }

    const invalidRows: ValidationResult['invalidRows'] = [];
    const validRows: CsvRow[] = [];

    parsed.rows.forEach((row, index) => {
        const rowNum = index + 2; // +2 because row 1 is headers, data starts at row 2
        const reasons: string[] = [];

        if (!row.transaction_id?.trim()) reasons.push('missing transaction_id');
        if (!row.sender_id?.trim()) reasons.push('missing sender_id');
        if (!row.receiver_id?.trim()) reasons.push('missing receiver_id');

        const amount = parseFloat(row.amount);
        if (isNaN(amount) || amount <= 0) reasons.push('invalid amount');

        if (!row.timestamp?.trim()) {
            reasons.push('missing timestamp');
        } else {
            const date = new Date(row.timestamp);
            if (isNaN(date.getTime())) reasons.push('invalid timestamp format');
        }

        if (reasons.length > 0) {
            invalidRows.push({ row: rowNum, reason: reasons.join(', ') });
        } else {
            validRows.push(row);
        }
    });

    return {
        valid: invalidRows.length === 0 && validRows.length > 0,
        missingHeaders: [],
        invalidRows,
        validRows,
    };
}

// ---------------------------------------------------------------------------
// 3. Ensure accounts exist in Supabase before inserting transactions
// ---------------------------------------------------------------------------
async function ensureAccounts(accountIds: string[]): Promise<void> {
    const unique = [...new Set(accountIds)];

    // Upsert accounts — create if not exists, ignore if already there
    const accountRecords = unique.map((id) => ({
        account_id: id,
        account_name: id,
        account_type: 'individual' as const,
        risk_level: 'safe' as const,
    }));

    // Upsert in batches of 5000 to maximize throughput (Supabase limit is high)
    const BATCH_SIZE = 5000;
    const CONCURRENCY_LIMIT = 5;
    const batches: any[][] = [];

    for (let i = 0; i < accountRecords.length; i += BATCH_SIZE) {
        batches.push(accountRecords.slice(i, i + BATCH_SIZE));
    }

    // Process batches with concurrency
    for (let i = 0; i < batches.length; i += CONCURRENCY_LIMIT) {
        const chunk = batches.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(chunk.map(async (batch) => {
            const { error } = await supabase
                .from('accounts')
                .upsert(batch, { onConflict: 'account_id', ignoreDuplicates: true });

            if (error) {
                console.warn('Account upsert warning:', error.message);
            }
        }));
    }
}

// ---------------------------------------------------------------------------
// 4. Insert validated rows into Supabase transactions table (Concurrent Batches)
// ---------------------------------------------------------------------------
export async function uploadToSupabase(
    file: File,
    validRows: CsvRow[],
    batchSize = 1000
): Promise<UploadResult> {
    const start = performance.now();
    let recordsInserted = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    // 0. Upload raw file to Storage (Fire-and-forget to not block)
    uploadCsvToStorage(file).catch(err => console.error('Background storage upload failed:', err));

    // First ensure all referenced accounts exist
    const allAccountIds = validRows.flatMap((r) => [r.sender_id, r.receiver_id]);
    await ensureAccounts(allAccountIds);

    // Prepare batches
    const batches: any[][] = [];
    for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize).map((row) => ({
            transaction_id: row.transaction_id.trim(),
            sender_id: row.sender_id.trim(),
            receiver_id: row.receiver_id.trim(),
            amount: parseFloat(row.amount),
            currency: 'USD',
            timestamp: new Date(row.timestamp).toISOString(),
            description: (row as Record<string, string>).description?.trim() || null,
            // Default values, will be enriched by Edge Function
            risk_score: 0,
            is_flagged: false,
        }));
        batches.push(batch);
    }

    // Process batches with concurrency limit (e.g., 5 concurrent requests)
    const CONCURRENCY_LIMIT = 5;
    const results: Array<{ error: any; count: number }> = [];

    for (let i = 0; i < batches.length; i += CONCURRENCY_LIMIT) {
        const chunk = batches.slice(i, i + CONCURRENCY_LIMIT);
        const promises = chunk.map(async (records) => {
            // 1. Analyze with Edge Function
            const analyzed = await analyzeTransactionsBatch(records);

            // Merge analysis results
            const enrichedRecords = records.map(r => {
                const analysis = analyzed.find(a => a.transaction_id === r.transaction_id);
                return {
                    ...r,
                    risk_score: analysis?.risk_score ?? 0,
                    is_flagged: analysis?.is_flagged ?? false
                };
            });

            // 2. Insert to DB
            const { error, data } = await supabase
                .from('transactions')
                .insert(enrichedRecords)
                .select('id');

            if (error) return { error: error.message, count: records.length };
            return { error: null, count: data?.length ?? records.length };
        });

        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
    }

    results.forEach((res, index) => {
        if (res.error) {
            errors.push(`Batch ${index + 1}: ${res.error}`);
            recordsFailed += res.count;
        } else {
            recordsInserted += res.count;
        }
    });

    const uploadResult = {
        success: recordsFailed === 0 && recordsInserted > 0,
        recordsInserted,
        recordsFailed,
        errors,
        duration_ms: Math.round(performance.now() - start),
    };

    // Invalidate analysis cache after successful upload
    if (uploadResult.success) {
        analysisCache.invalidate();
    }

    return uploadResult;
}
