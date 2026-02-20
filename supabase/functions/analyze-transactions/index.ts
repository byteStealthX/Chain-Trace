// supabase/functions/analyze-transactions/index.ts
// ──────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: analyze-transactions
//
// 1. Fetches transactions, builds a directed graph
// 2. Detects circular fund routing (cycles length 3–5)
// 3. Detects smurfing (fan-in / fan-out within 72h)
// 4. Detects layered shell networks (3+ hops through low-activity nodes)
// 5. Stores detected patterns in fraud_rings table
// ──────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

// ── CORS ──────────────────────────────────────────────────────────────
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Types ─────────────────────────────────────────────────────────────
interface Transaction {
    id: string;
    sender_id: string;
    receiver_id: string;
    amount: number;
    timestamp: string;
    risk_score: number;
    is_flagged: boolean;
}

interface GraphNode {
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

interface GraphEdge {
    id: string;
    source: string;
    target: string;
    amount: number;
    timestamp: string;
    risk_score: number;
    is_flagged: boolean;
}

interface FraudRing {
    id: string;
    ring_type: string;
    severity: string;
    accounts: string[];
    transactions: string[];
    cycle_length?: number;
    hop_count?: number;
    window_hours?: number;
    total_amount: number;
    description: string;
    details: Record<string, unknown>;
}

interface SuspiciousAccount {
    account_id: string;
    suspicion_score: number;   // Normalized 0–100
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

// ── 1. Build directed graph ───────────────────────────────────────────
function buildGraph(transactions: Transaction[]) {
    const nodeMap = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];
    const adjacency = new Map<string, Array<{ target: string; tx: Transaction }>>();
    const riskScores = new Map<string, number[]>();
    let totalVolume = 0;

    function getNode(id: string): GraphNode {
        let n = nodeMap.get(id);
        if (!n) {
            n = {
                id, label: id,
                in_degree: 0, out_degree: 0,
                total_sent: 0, total_received: 0,
                transaction_count: 0, avg_risk_score: 0,
                is_flagged: false,
            };
            nodeMap.set(id, n);
        }
        return n;
    }

    for (const tx of transactions) {
        const sender = getNode(tx.sender_id);
        const receiver = getNode(tx.receiver_id);

        sender.out_degree++;
        sender.total_sent += tx.amount;
        sender.transaction_count++;
        if (tx.is_flagged) sender.is_flagged = true;

        receiver.in_degree++;
        receiver.total_received += tx.amount;
        receiver.transaction_count++;
        if (tx.is_flagged) receiver.is_flagged = true;

        if (!riskScores.has(tx.sender_id)) riskScores.set(tx.sender_id, []);
        riskScores.get(tx.sender_id)!.push(tx.risk_score);
        if (!riskScores.has(tx.receiver_id)) riskScores.set(tx.receiver_id, []);
        riskScores.get(tx.receiver_id)!.push(tx.risk_score);

        // Adjacency list for graph traversal
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

    return {
        nodes: Array.from(nodeMap.values()),
        edges,
        adjacency,
        nodeMap,
        totalVolume: Math.round(totalVolume * 100) / 100,
    };
}

// ── 2. Detect circular fund routing (cycles length 3–5) ──────────────
function detectCircularRouting(
    adjacency: Map<string, Array<{ target: string; tx: Transaction }>>,
    nodeMap: Map<string, GraphNode>,
): FraudRing[] {
    const rings: FraudRing[] = [];
    const foundCycles = new Set<string>(); // dedup by sorted account set
    const allNodes = Array.from(nodeMap.keys());

    for (const startNode of allNodes) {
        // DFS to find cycles of length 3–5 starting from startNode
        const stack: Array<{
            node: string;
            path: string[];
            txIds: string[];
            totalAmount: number;
        }> = [{ node: startNode, path: [startNode], txIds: [], totalAmount: 0 }];

        while (stack.length > 0) {
            const { node, path, txIds, totalAmount } = stack.pop()!;
            const neighbors = adjacency.get(node) ?? [];

            for (const { target, tx } of neighbors) {
                const newPath = [...path, target];
                const newTxIds = [...txIds, tx.id];
                const newAmount = totalAmount + tx.amount;

                // Found a cycle back to start
                if (target === startNode && path.length >= 3 && path.length <= 5) {
                    const cycleKey = [...path].sort().join('|');
                    if (!foundCycles.has(cycleKey)) {
                        foundCycles.add(cycleKey);
                        const cycleLength = path.length;
                        const severity = cycleLength >= 4 ? 'critical' : 'high';

                        rings.push({
                            id: crypto.randomUUID(), // Generate UUID
                            ring_type: 'circular_routing',
                            severity,
                            accounts: path,
                            transactions: newTxIds,
                            cycle_length: cycleLength,
                            total_amount: Math.round(newAmount * 100) / 100,
                            description: `Circular fund routing detected: ${path.join(' → ')} → ${startNode} (${cycleLength}-node cycle, $${newAmount.toFixed(2)} total)`,
                            details: {
                                cycle_path: [...path, startNode],
                                cycle_length: cycleLength,
                                avg_amount_per_hop: Math.round((newAmount / cycleLength) * 100) / 100,
                            },
                        });
                    }
                    continue;
                }

                // Continue DFS if path length < 5 and no intermediate revisit
                if (path.length < 5 && !path.includes(target)) {
                    stack.push({
                        node: target,
                        path: newPath,
                        txIds: newTxIds,
                        totalAmount: newAmount,
                    });
                }
            }
        }
    }

    return rings;
}

// ── 3. Detect smurfing (fan-in / fan-out within 72h) ─────────────────
function detectSmurfing(transactions: Transaction[]): FraudRing[] {
    const rings: FraudRing[] = [];
    const WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours
    const MIN_COUNTERPARTIES = 8; // Adjust threshold as needed

    const sorted = [...transactions].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // ── Fan-in: many senders → one receiver ──────────────────────────
    const receiverGroups = new Map<string, Transaction[]>();
    for (const tx of sorted) {
        if (!receiverGroups.has(tx.receiver_id)) receiverGroups.set(tx.receiver_id, []);
        receiverGroups.get(tx.receiver_id)!.push(tx);
    }

    for (const [receiver, txs] of receiverGroups) {
        for (let i = 0; i < txs.length; i++) {
            const windowStart = new Date(txs[i].timestamp).getTime();
            const windowEnd = windowStart + WINDOW_MS;

            const windowTxs = [];
            const senders = new Set<string>();
            let totalAmount = 0;

            for (let j = i; j < txs.length; j++) {
                const ts = new Date(txs[j].timestamp).getTime();
                if (ts > windowEnd) break;
                windowTxs.push(txs[j]);
                senders.add(txs[j].sender_id);
                totalAmount += txs[j].amount;
            }

            if (senders.size >= MIN_COUNTERPARTIES) {
                const windowHours = Math.round(((new Date(windowTxs[windowTxs.length - 1].timestamp).getTime() - windowStart) / 3600000) * 10) / 10;
                rings.push({
                    id: crypto.randomUUID(),
                    ring_type: 'smurfing_fan_in',
                    severity: totalAmount > 10000 ? 'critical' : totalAmount > 5000 ? 'high' : 'medium',
                    accounts: [receiver, ...Array.from(senders)],
                    transactions: windowTxs.map(t => t.id),
                    window_hours: windowHours,
                    total_amount: Math.round(totalAmount * 100) / 100,
                    description: `Smurfing (fan-in): ${senders.size} senders → ${receiver} within ${windowHours}h ($${totalAmount.toFixed(2)} total)`,
                    details: { member_count: senders.size, window_hours: 72 }
                });
                i += windowTxs.length - 1; // Move past this window
            }
        }
    }

    // ── Fan-out: one sender → many receivers ─────────────────────────
    const senderGroups = new Map<string, Transaction[]>();
    for (const tx of sorted) {
        if (!senderGroups.has(tx.sender_id)) senderGroups.set(tx.sender_id, []);
        senderGroups.get(tx.sender_id)!.push(tx);
    }

    for (const [sender, txs] of senderGroups) {
        for (let i = 0; i < txs.length; i++) {
            const windowStart = new Date(txs[i].timestamp).getTime();
            const windowEnd = windowStart + WINDOW_MS;

            const windowTxs = [];
            const receivers = new Set<string>();
            let totalAmount = 0;

            for (let j = i; j < txs.length; j++) {
                const ts = new Date(txs[j].timestamp).getTime();
                if (ts > windowEnd) break;
                windowTxs.push(txs[j]);
                receivers.add(txs[j].receiver_id);
                totalAmount += txs[j].amount;
            }

            if (receivers.size >= MIN_COUNTERPARTIES) {
                const windowHours = Math.round(((new Date(windowTxs[windowTxs.length - 1].timestamp).getTime() - windowStart) / 3600000) * 10) / 10;
                rings.push({
                    id: crypto.randomUUID(),
                    ring_type: 'smurfing_fan_out',
                    severity: totalAmount > 10000 ? 'critical' : totalAmount > 5000 ? 'high' : 'medium',
                    accounts: [sender, ...Array.from(receivers)],
                    transactions: windowTxs.map(t => t.id),
                    window_hours: windowHours,
                    total_amount: Math.round(totalAmount * 100) / 100,
                    description: `Smurfing (fan-out): ${sender} → ${receivers.size} receivers within ${windowHours}h ($${totalAmount.toFixed(2)} total)`,
                    details: { member_count: receivers.size, window_hours: 72 }
                });
                i += windowTxs.length - 1;
            }
        }
    }

    return rings;
}

// ── 4. Detect layered shell networks (3+ hops, low-activity middle) ──
function detectShellNetworks(
    adjacency: Map<string, Array<{ target: string; tx: Transaction }>>,
    nodeMap: Map<string, GraphNode>,
): FraudRing[] {
    const rings: FraudRing[] = [];
    const foundChains = new Set<string>();
    const MIN_HOPS = 3;
    const MAX_TX_FOR_SHELL = 3; // Intermediate nodes have ≤ 3 transactions

    // Identify potential shell nodes (low activity: 2–3 transactions)
    const shellNodes = new Set<string>();
    for (const [id, node] of nodeMap) {
        if (node.transaction_count >= 2 && node.transaction_count <= MAX_TX_FOR_SHELL) {
            shellNodes.add(id);
        }
    }

    // For each node, try to find chains of 3+ hops through shell nodes
    for (const startNode of nodeMap.keys()) {
        if (shellNodes.has(startNode)) continue; // Start from non-shell nodes

        const stack: Array<{
            node: string;
            path: string[];
            txIds: string[];
            totalAmount: number;
            shellCount: number;
        }> = [{ node: startNode, path: [startNode], txIds: [], totalAmount: 0, shellCount: 0 }];

        while (stack.length > 0) {
            const { node, path, txIds, totalAmount, shellCount } = stack.pop()!;
            const neighbors = adjacency.get(node) ?? [];

            for (const { target, tx } of neighbors) {
                if (path.includes(target)) continue; // No revisiting

                const isShell = shellNodes.has(target);
                const newShellCount = shellCount + (isShell ? 1 : 0);
                const newPath = [...path, target];
                const newTxIds = [...txIds, tx.id];
                const newAmount = totalAmount + tx.amount;

                // Check if we've formed a valid shell chain:
                // 3+ hops, and intermediate nodes (index 1 to n-1) are mostly shell nodes
                if (newPath.length >= MIN_HOPS + 1) {
                    const intermediates = newPath.slice(1, -1);
                    const shellIntermediates = intermediates.filter((n) => shellNodes.has(n));

                    // At least 60% of intermediates should be shell nodes
                    if (shellIntermediates.length >= Math.ceil(intermediates.length * 0.6)) {
                        const chainKey = newPath.sort().join('|');
                        if (!foundChains.has(chainKey)) {
                            foundChains.add(chainKey);
                            const hopCount = newPath.length - 1;
                            const severity = hopCount >= 5 ? 'critical' : hopCount >= 4 ? 'high' : 'medium';

                            rings.push({
                                id: crypto.randomUUID(),
                                ring_type: 'layered_shell_network',
                                severity,
                                accounts: [...newPath], // unsorted for display
                                transactions: newTxIds,
                                hop_count: hopCount,
                                total_amount: Math.round(newAmount * 100) / 100,
                                description: `Shell network: ${newPath.join(' → ')} (${hopCount} hops, ${shellIntermediates.length}/${intermediates.length} shell intermediaries, $${newAmount.toFixed(2)} total)`,
                                details: {
                                    chain_path: newPath,
                                    hop_count: hopCount,
                                    shell_intermediates: shellIntermediates,
                                    non_shell_intermediates: intermediates.filter((n) => !shellNodes.has(n)),
                                    shell_ratio: Math.round((shellIntermediates.length / intermediates.length) * 100),
                                },
                            });
                        }
                    }
                }

                // Continue if path is short enough
                if (newPath.length < 7) {
                    stack.push({
                        node: target,
                        path: newPath,
                        txIds: newTxIds,
                        totalAmount: newAmount,
                        shellCount: newShellCount,
                    });
                }
            }
        }
    }

    return rings;
}

// ── 5. Suspicion scoring ─────────────────────────────────────────────
const SCORE_WEIGHTS = {
    cycle: 40,       // Circular fund routing
    fanin_fanout: 30, // Smurfing pattern
    shell: 25,       // Shell chain involvement
    velocity: 10,    // High transaction velocity
} as const;

const VELOCITY_THRESHOLD = 5; // Transactions per 24h considered "high"

function computeSuspicionScores(
    nodeMap: Map<string, GraphNode>,
    fraudRings: FraudRing[],
    transactions: Transaction[],
): SuspiciousAccount[] {
    // Per-account raw score accumulators
    const scores = new Map<string, {
        cycle: number;
        fan: number;
        shell: number;
        velocity: number;
        ringIds: Set<string>;
    }>();

    function getScore(id: string) {
        let s = scores.get(id);
        if (!s) {
            s = { cycle: 0, fan: 0, shell: 0, velocity: 0, ringIds: new Set() };
            scores.set(id, s);
        }
        return s;
    }

    // ── Credit from fraud ring participation ────────────────────────
    for (const ring of fraudRings) {
        const ringId = ring.id; // Use real UUID

        for (const accountId of ring.accounts) {
            const s = getScore(accountId);
            s.ringIds.add(ringId);

            switch (ring.ring_type) {
                case 'circular_routing':
                    // More credit for longer cycles
                    s.cycle += SCORE_WEIGHTS.cycle * (ring.cycle_length ?? 3) / 3;
                    break;
                case 'smurfing_fan_in':
                case 'smurfing_fan_out':
                    s.fan += SCORE_WEIGHTS.fanin_fanout;
                    break;
                case 'layered_shell_network':
                    s.shell += SCORE_WEIGHTS.shell;
                    break;
            }
        }
    }

    // ── High transaction velocity scoring ───────────────────────────
    // Count transactions per account per 24h bucket
    const txByAccount = new Map<string, Date[]>();
    for (const tx of transactions) {
        const ts = new Date(tx.timestamp);
        for (const accId of [tx.sender_id, tx.receiver_id]) {
            if (!txByAccount.has(accId)) txByAccount.set(accId, []);
            txByAccount.get(accId)!.push(ts);
        }
    }

    for (const [accId, timestamps] of txByAccount) {
        timestamps.sort((a, b) => a.getTime() - b.getTime());
        const DAY_MS = 24 * 60 * 60 * 1000;

        // Sliding 24h window to find peak velocity
        let maxInWindow = 0;
        for (let i = 0; i < timestamps.length; i++) {
            const windowEnd = timestamps[i].getTime() + DAY_MS;
            let count = 0;
            for (let j = i; j < timestamps.length && timestamps[j].getTime() <= windowEnd; j++) {
                count++;
            }
            maxInWindow = Math.max(maxInWindow, count);
        }

        if (maxInWindow >= VELOCITY_THRESHOLD) {
            const s = getScore(accId);
            // Scale: 5 tx = 1×, 10 tx = 2×, etc.
            s.velocity += SCORE_WEIGHTS.velocity * (maxInWindow / VELOCITY_THRESHOLD);
        }
    }

    // ── Apply Merchant Reduction Logic (False Positive Mitigation) ───
    const MERCHANT_DEGREE_THRESHOLD = 15; // High degree nodes
    const MERCHANT_REDUCTION_FACTOR = 0.4; // Reduce velocity/fan scores by 60%

    for (const [accId, s] of scores) {
        const node = nodeMap.get(accId);
        if (!node) continue;

        const totalDegree = node.in_degree + node.out_degree;

        // Profile: High transaction count but NO critical patterns (Cycles or Shells)
        const isHighVolumeStable = totalDegree >= MERCHANT_DEGREE_THRESHOLD &&
            s.cycle === 0 &&
            s.shell === 0;

        if (isHighVolumeStable) {
            // Legitimate high-traffic node (e.g. merchant or utility)
            // Reduce scores that are common in high-traffic but often benign
            s.velocity *= MERCHANT_REDUCTION_FACTOR;
            s.fan *= MERCHANT_REDUCTION_FACTOR;
        }
    }

    // ── Normalize to 0–100 ──────────────────────────────────────────
    // Find the maximum raw score across all accounts
    let maxRaw = 0;
    for (const s of scores.values()) {
        const raw = s.cycle + s.fan + s.shell + s.velocity;
        maxRaw = Math.max(maxRaw, raw);
    }
    if (maxRaw === 0) maxRaw = 1; // avoid division by zero

    const results: SuspiciousAccount[] = [];

    for (const [accId, s] of scores) {
        const raw = s.cycle + s.fan + s.shell + s.velocity;
        const normalized = Math.round((raw / maxRaw) * 100 * 100) / 100; // 2 decimal places
        const node = nodeMap.get(accId);

        let riskLabel: SuspiciousAccount['risk_label'];
        if (normalized >= 80) riskLabel = 'critical';
        else if (normalized >= 60) riskLabel = 'high';
        else if (normalized >= 35) riskLabel = 'moderate';
        else if (normalized > 0) riskLabel = 'low';
        else riskLabel = 'clean';

        results.push({
            account_id: accId,
            suspicion_score: normalized,
            raw_score: Math.round(raw * 100) / 100,
            cycle_score: Math.round(s.cycle * 100) / 100,
            fanin_fanout_score: Math.round(s.fan * 100) / 100,
            shell_score: Math.round(s.shell * 100) / 100,
            velocity_score: Math.round(s.velocity * 100) / 100,
            risk_label: riskLabel,
            contributing_rings: Array.from(s.ringIds),
            transaction_count: node?.transaction_count ?? 0,
            total_volume: Math.round(
                ((node?.total_sent ?? 0) + (node?.total_received ?? 0)) * 100
            ) / 100,
        });
    }

    // Sort descending by suspicion score
    results.sort((a, b) => b.suspicion_score - a.suspicion_score);

    return results;
}

// ── Edge Function handler ─────────────────────────────────────────────
serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });

        // Parse optional filters
        let limit: number | undefined;
        let dateFrom: string | undefined;
        let dateTo: string | undefined;

        if (req.method === 'POST') {
            try {
                const body = await req.json();
                limit = body.limit;
                dateFrom = body.date_from;
                dateTo = body.date_to;
            } catch { /* no body */ }
        }

        // Fetch transactions
        let query = supabase
            .from('transactions')
            .select('id, sender_id, receiver_id, amount, timestamp, risk_score, is_flagged')
            .order('timestamp', { ascending: true });

        if (dateFrom) query = query.gte('timestamp', dateFrom);
        if (dateTo) query = query.lte('timestamp', dateTo);
        if (limit) query = query.limit(limit);

        const { data: transactions, error } = await query;

        if (error) {
            return new Response(
                JSON.stringify({ error: `Database query failed: ${error.message}` }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!transactions || transactions.length === 0) {
            return new Response(
                JSON.stringify({
                    nodes: [], edges: [], fraud_rings: [], suspicious_accounts: [],
                    node_count: 0, edge_count: 0, fraud_ring_count: 0,
                    suspicious_account_count: 0,
                    total_volume: 0, flagged_edges: 0, flagged_nodes: 0,
                    analysis_timestamp: new Date().toISOString(),
                    message: 'No transactions found. Upload a CSV first.',
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ── Build graph ─────────────────────────────────────────────────
        const { nodes, edges, adjacency, nodeMap, totalVolume } =
            buildGraph(transactions as Transaction[]);

        // ── Run fraud detection algorithms ──────────────────────────────
        const circularRings = detectCircularRouting(adjacency, nodeMap);
        const smurfingRings = detectSmurfing(transactions as Transaction[]);
        const shellRings = detectShellNetworks(adjacency, nodeMap);

        const allRings = [...circularRings, ...smurfingRings, ...shellRings];

        // ── Store fraud rings in database ───────────────────────────────
        if (allRings.length > 0) {
            const records = allRings.map((r) => ({
                id: r.id, // Explicit ID
                ring_type: r.ring_type,
                severity: r.severity,
                accounts: r.accounts,
                transactions: r.transactions,
                cycle_length: r.cycle_length ?? null,
                hop_count: r.hop_count ?? null,
                window_hours: r.window_hours ?? null,
                total_amount: r.total_amount,
                description: r.description,
                details: r.details,
            }));

            const { error: insertError } = await supabase
                .from('fraud_rings')
                .insert(records);

            if (insertError) {
                console.error('Failed to store fraud rings:', insertError.message);
            }
        }

        // ── Compute suspicion scores ─────────────────────────────────────
        const analysisId = new Date().toISOString();
        const suspiciousAccounts = computeSuspicionScores(
            nodeMap, allRings, transactions as Transaction[]
        );

        // ── Store suspicious accounts in database ───────────────────────
        if (suspiciousAccounts.length > 0) {
            const saRecords = suspiciousAccounts.map((sa) => ({
                account_id: sa.account_id,
                suspicion_score: sa.suspicion_score,
                raw_score: sa.raw_score,
                cycle_score: sa.cycle_score,
                fanin_fanout_score: sa.fanin_fanout_score,
                shell_score: sa.shell_score,
                velocity_score: sa.velocity_score,
                risk_label: sa.risk_label,
                contributing_rings: sa.contributing_rings, // Insert UUID[] from Set
                transaction_count: sa.transaction_count,
                total_volume: sa.total_volume,
                analysis_id: analysisId,
            }));

            const { error: saError } = await supabase
                .from('suspicious_accounts')
                .insert(saRecords);

            if (saError) {
                console.error('Failed to store suspicious accounts:', saError.message);
            }
        }

        // ── Return full result ──────────────────────────────────────────
        const result = {
            nodes,
            edges,
            fraud_rings: allRings,
            suspicious_accounts: suspiciousAccounts,
            node_count: nodes.length,
            edge_count: edges.length,
            fraud_ring_count: allRings.length,
            suspicious_account_count: suspiciousAccounts.filter(
                (sa) => sa.suspicion_score > 0
            ).length,
            circular_routing_count: circularRings.length,
            smurfing_count: smurfingRings.length,
            shell_network_count: shellRings.length,
            total_volume: totalVolume,
            flagged_edges: edges.filter((e) => e.is_flagged).length,
            flagged_nodes: nodes.filter((n) => n.is_flagged).length,
            analysis_timestamp: analysisId,
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
