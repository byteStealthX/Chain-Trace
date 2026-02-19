import { supabase } from '../lib/supabase';
import { analysisCache } from '../lib/analysisCache';

// ---------------------------------------------------------------------------
// Types matching the Edge Function response
// ---------------------------------------------------------------------------
export interface GraphNode {
    id: string;
    label: string;
    in_degree: number;
    out_degree: number;
    total_sent: number;
    total_received: number;
    transaction_count: number;
    avg_risk_score: number;
    is_flagged: boolean;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    amount: number;
    timestamp: string;
    risk_score: number;
    is_flagged: boolean;
}

export interface FraudRing {
    ring_type: 'circular_routing' | 'smurfing_fan_in' | 'smurfing_fan_out' | 'layered_shell_network';
    severity: 'low' | 'medium' | 'high' | 'critical';
    accounts: string[];
    transactions: string[];
    cycle_length?: number;
    hop_count?: number;
    window_hours?: number;
    total_amount: number;
    description: string;
    details: Record<string, unknown>;
}

export interface AnalysisResult {
    nodes: GraphNode[];
    edges: GraphEdge[];
    fraud_rings: FraudRing[];
    suspicious_accounts: SuspiciousAccount[];
    node_count: number;
    edge_count: number;
    fraud_ring_count: number;
    suspicious_account_count: number;
    circular_routing_count: number;
    smurfing_count: number;
    shell_network_count: number;
    total_volume: number;
    flagged_edges: number;
    flagged_nodes: number;
    analysis_timestamp: string;
    message?: string;
}

export interface SuspiciousAccount {
    account_id: string;
    suspicion_score: number;
    raw_score: number;
    cycle_score: number;
    fanin_fanout_score: number;
    shell_score: number;
    velocity_score: number;
    risk_label: 'clean' | 'low' | 'moderate' | 'high' | 'critical';
    contributing_rings: string[];
    transaction_count: number;
    total_volume: number;
}

export interface AnalysisFilters {
    limit?: number;
    date_from?: string;
    date_to?: string;
}

// ---------------------------------------------------------------------------
// Invoke the analyze-transactions Edge Function
// ---------------------------------------------------------------------------
export async function analyzeTransactions(
    filters?: AnalysisFilters
): Promise<{ data: AnalysisResult | null; error: string | null }> {
    try {
        const { data, error } = await supabase.functions.invoke('analyze-transactions', {
            body: filters ?? {},
        });

        if (error) {
            return { data: null, error: error.message };
        }

        return { data: data as AnalysisResult, error: null };
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Failed to invoke Edge Function',
        };
    }
}

// ---------------------------------------------------------------------------
// Fetch stored fraud rings from the database
// ---------------------------------------------------------------------------
export async function fetchFraudRings(options?: {
    ring_type?: string;
    severity?: string;
    limit?: number;
}): Promise<{ data: FraudRing[] | null; error: string | null }> {
    try {
        let query = supabase
            .from('fraud_rings')
            .select('*')
            .order('detected_at', { ascending: false });

        if (options?.ring_type) query = query.eq('ring_type', options.ring_type);
        if (options?.severity) query = query.eq('severity', options.severity);
        if (options?.limit) query = query.limit(options.limit);

        const { data, error } = await query;

        if (error) return { data: null, error: error.message };
        return { data: data as FraudRing[], error: null };
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Failed to fetch fraud rings',
        };
    }
}

// ---------------------------------------------------------------------------
// Fetch suspicious accounts from the database
// ---------------------------------------------------------------------------
export async function fetchSuspiciousAccounts(options?: {
    risk_label?: string;
    min_score?: number;
    limit?: number;
    skipCache?: boolean;
}): Promise<{ data: SuspiciousAccount[] | null; error: string | null }> {
    try {
        // Cache-first
        if (!options?.skipCache && !options?.risk_label && !options?.min_score) {
            const cached = analysisCache.getSuspiciousAccounts();
            if (cached) {
                const limited = options?.limit ? cached.slice(0, options.limit) : cached;
                return { data: limited, error: null };
            }
        }

        let query = supabase
            .from('suspicious_accounts')
            .select('*')
            .order('suspicion_score', { ascending: false });

        if (options?.risk_label) query = query.eq('risk_label', options.risk_label);
        if (options?.min_score) query = query.gte('suspicion_score', options.min_score);
        if (options?.limit) query = query.limit(options.limit);

        const { data, error } = await query;

        if (error) return { data: null, error: error.message };

        const result = data as SuspiciousAccount[];

        // Store in cache (only for unfiltered results)
        if (!options?.risk_label && !options?.min_score) {
            analysisCache.setSuspiciousAccounts(result);
        }

        return { data: result, error: null };
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Failed to fetch suspicious accounts',
        };
    }
}

// ---------------------------------------------------------------------------
// Fallback: Build graph + detect fraud client-side
// ---------------------------------------------------------------------------
export async function analyzeTransactionsLocal(
    filters?: AnalysisFilters,
    options?: { skipCache?: boolean }
): Promise<{ data: AnalysisResult | null; error: string | null }> {
    try {
        // Cache-first: return cached result if available and not force-refreshing
        if (!options?.skipCache && !filters) {
            const cached = analysisCache.getAnalysis();
            if (cached) return { data: cached, error: null };
        }

        let query = supabase
            .from('transactions')
            .select('id, sender_id, receiver_id, amount, timestamp, risk_score, is_flagged')
            .order('timestamp', { ascending: true });

        if (filters?.date_from) query = query.gte('timestamp', filters.date_from);
        if (filters?.date_to) query = query.lte('timestamp', filters.date_to);
        if (filters?.limit) query = query.limit(filters.limit);

        const { data: transactions, error } = await query;

        if (error) return { data: null, error: error.message };
        if (!transactions || transactions.length === 0) {
            return {
                data: {
                    nodes: [], edges: [], fraud_rings: [], suspicious_accounts: [],
                    node_count: 0, edge_count: 0, fraud_ring_count: 0,
                    suspicious_account_count: 0,
                    circular_routing_count: 0, smurfing_count: 0, shell_network_count: 0,
                    total_volume: 0, flagged_edges: 0, flagged_nodes: 0,
                    analysis_timestamp: new Date().toISOString(),
                    message: 'No transactions found.',
                },
                error: null,
            };
        }

        // Build graph
        const nodeMap = new Map<string, GraphNode>();
        const edges: GraphEdge[] = [];
        const adjacency = new Map<string, Array<{ target: string; tx: typeof transactions[0] }>>();
        const riskScores = new Map<string, number[]>();
        let totalVolume = 0;

        function getNode(id: string): GraphNode {
            let n = nodeMap.get(id);
            if (!n) {
                n = {
                    id, label: id, in_degree: 0, out_degree: 0,
                    total_sent: 0, total_received: 0,
                    transaction_count: 0, avg_risk_score: 0, is_flagged: false,
                };
                nodeMap.set(id, n);
            }
            return n;
        }

        for (const tx of transactions) {
            const sender = getNode(tx.sender_id);
            const receiver = getNode(tx.receiver_id);

            sender.out_degree++; sender.total_sent += tx.amount;
            sender.transaction_count++; if (tx.is_flagged) sender.is_flagged = true;

            receiver.in_degree++; receiver.total_received += tx.amount;
            receiver.transaction_count++; if (tx.is_flagged) receiver.is_flagged = true;

            if (!riskScores.has(tx.sender_id)) riskScores.set(tx.sender_id, []);
            riskScores.get(tx.sender_id)!.push(tx.risk_score);
            if (!riskScores.has(tx.receiver_id)) riskScores.set(tx.receiver_id, []);
            riskScores.get(tx.receiver_id)!.push(tx.risk_score);

            if (!adjacency.has(tx.sender_id)) adjacency.set(tx.sender_id, []);
            adjacency.get(tx.sender_id)!.push({ target: tx.receiver_id, tx });

            edges.push({
                id: tx.id, source: tx.sender_id, target: tx.receiver_id,
                amount: tx.amount, timestamp: tx.timestamp,
                risk_score: tx.risk_score, is_flagged: tx.is_flagged,
            });
            totalVolume += tx.amount;
        }

        for (const [accId, scores] of riskScores) {
            const node = nodeMap.get(accId)!;
            node.avg_risk_score = Math.round(
                (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
            ) / 100;
        }

        const nodes = Array.from(nodeMap.values());

        const result: { data: AnalysisResult; error: null } = {
            data: {
                nodes, edges,
                fraud_rings: [],
                suspicious_accounts: [],
                node_count: nodes.length,
                edge_count: edges.length,
                fraud_ring_count: 0,
                suspicious_account_count: 0,
                circular_routing_count: 0,
                smurfing_count: 0,
                shell_network_count: 0,
                total_volume: Math.round(totalVolume * 100) / 100,
                flagged_edges: edges.filter((e) => e.is_flagged).length,
                flagged_nodes: nodes.filter((n) => n.is_flagged).length,
                analysis_timestamp: new Date().toISOString(),
            },
            error: null,
        };

        // Store in cache (only for unfiltered results)
        if (!filters && result.data) {
            analysisCache.setAnalysis(result.data);
        }

        return result;
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Local analysis failed',
        };
    }
}

// ---------------------------------------------------------------------------
// Fetch full graph data from DB (Transactions + Analysis Results)
// ---------------------------------------------------------------------------
export async function fetchGraphData(
    filters?: AnalysisFilters
): Promise<{ data: AnalysisResult | null; error: string | null }> {
    try {
        // 1. Fetch Transactions
        let txQuery = supabase
            .from('transactions')
            .select('id, sender_id, receiver_id, amount, timestamp, risk_score, is_flagged')
            .order('timestamp', { ascending: true });

        if (filters?.limit) txQuery = txQuery.limit(filters.limit);
        if (filters?.date_from) txQuery = txQuery.gte('timestamp', filters.date_from);
        if (filters?.date_to) txQuery = txQuery.lte('timestamp', filters.date_to);

        // 2. Fetch Suspicious Accounts
        const saQuery = supabase
            .from('suspicious_accounts')
            .select('*')
            .order('suspicion_score', { ascending: false });

        // 3. Fetch Fraud Rings
        const frQuery = supabase
            .from('fraud_rings')
            .select('*');

        const [txRes, saRes, frRes] = await Promise.all([txQuery, saQuery, frQuery]);

        if (txRes.error) throw new Error('Failed to fetch transactions: ' + txRes.error.message);
        if (saRes.error) throw new Error('Failed to fetch analysis: ' + saRes.error.message);
        if (frRes.error) throw new Error('Failed to fetch rings: ' + frRes.error.message);

        const transactions = txRes.data || [];
        const suspiciousAccounts = (saRes.data || []) as SuspiciousAccount[];
        const fraudRings = (frRes.data || []) as FraudRing[];

        // 4. Build Graph Objects
        const nodeMap = new Map<string, GraphNode>();
        const edges: GraphEdge[] = [];
        let totalVolume = 0;

        function getNode(id: string): GraphNode {
            let n = nodeMap.get(id);
            if (!n) {
                n = {
                    id, label: id, in_degree: 0, out_degree: 0,
                    total_sent: 0, total_received: 0,
                    transaction_count: 0, avg_risk_score: 0, is_flagged: false,
                };
                nodeMap.set(id, n);
            }
            return n;
        }

        for (const tx of transactions) {
            const sender = getNode(tx.sender_id);
            const receiver = getNode(tx.receiver_id);

            sender.out_degree++; sender.total_sent += tx.amount;
            sender.transaction_count++; if (tx.is_flagged) sender.is_flagged = true;

            receiver.in_degree++; receiver.total_received += tx.amount;
            receiver.transaction_count++; if (tx.is_flagged) receiver.is_flagged = true;

            // Edges
            edges.push({
                id: tx.id, source: tx.sender_id, target: tx.receiver_id,
                amount: tx.amount, timestamp: tx.timestamp,
                risk_score: tx.risk_score, is_flagged: tx.is_flagged,
            });
            totalVolume += tx.amount;
        }

        const nodes = Array.from(nodeMap.values());

        // 5. Assemble Result
        const result: AnalysisResult = {
            nodes,
            edges,
            fraud_rings: fraudRings,
            suspicious_accounts: suspiciousAccounts,
            node_count: nodes.length,
            edge_count: edges.length,
            fraud_ring_count: fraudRings.length,
            suspicious_account_count: suspiciousAccounts.length,
            circular_routing_count: fraudRings.filter(r => r.ring_type === 'circular_routing').length,
            smurfing_count: fraudRings.filter(r => r.ring_type.startsWith('smurfing')).length,
            shell_network_count: fraudRings.filter(r => r.ring_type === 'layered_shell_network').length,
            total_volume: Math.round(totalVolume * 100) / 100,
            flagged_edges: edges.filter(e => e.is_flagged).length,
            flagged_nodes: nodes.filter(n => n.is_flagged).length,
            analysis_timestamp: new Date().toISOString(),
        };

        return { data: result, error: null };

    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Error fetching graph data',
        };
    }
}
