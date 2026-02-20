
import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL; // fallback
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
});

// ── Types (JSDoc for intellisense) ────────────────────────────────────
/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} sender_id
 * @property {string} receiver_id
 * @property {number} amount
 * @property {string} timestamp
 * @property {number} risk_score
 * @property {boolean} is_flagged
 */

// ── 1. Build directed graph ───────────────────────────────────────────
function buildGraph(transactions) {
    const nodeMap = new Map();
    const edges = [];
    const adjacency = new Map();
    const riskScores = new Map();
    let totalVolume = 0;

    function getNode(id) {
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
        riskScores.get(tx.sender_id).push(tx.risk_score);
        if (!riskScores.has(tx.receiver_id)) riskScores.set(tx.receiver_id, []);
        riskScores.get(tx.receiver_id).push(tx.risk_score);

        // Adjacency list for graph traversal
        if (!adjacency.has(tx.sender_id)) adjacency.set(tx.sender_id, []);
        adjacency.get(tx.sender_id).push({ target: tx.receiver_id, tx });

        edges.push({
            id: tx.id, source: tx.sender_id, target: tx.receiver_id,
            amount: tx.amount, timestamp: tx.timestamp,
            risk_score: tx.risk_score, is_flagged: tx.is_flagged,
        });

        totalVolume += tx.amount;
    }

    for (const [accId, scores] of riskScores) {
        const node = nodeMap.get(accId);
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
function detectCircularRouting(adjacency, nodeMap) {
    const rings = [];
    const foundCycles = new Set(); // dedup by sorted account set
    const allNodes = Array.from(nodeMap.keys());

    for (const startNode of allNodes) {
        // DFS to find cycles of length 3–5 starting from startNode
        const stack = [{ node: startNode, path: [startNode], txIds: [], totalAmount: 0 }];

        while (stack.length > 0) {
            const { node, path, txIds, totalAmount } = stack.pop();
            const neighbors = adjacency.get(node) || [];

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
                            id: uuidv4(),
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
function detectSmurfing(transactions) {
    const rings = [];
    const WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours
    const MIN_COUNTERPARTIES = 8; // Adjust threshold as needed

    const sorted = [...transactions].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // ── Fan-in: many senders → one receiver ──────────────────────────
    const receiverGroups = new Map();
    for (const tx of sorted) {
        if (!receiverGroups.has(tx.receiver_id)) receiverGroups.set(tx.receiver_id, []);
        receiverGroups.get(tx.receiver_id).push(tx);
    }

    for (const [receiver, txs] of receiverGroups) {
        for (let i = 0; i < txs.length; i++) {
            const windowStart = new Date(txs[i].timestamp).getTime();
            const windowEnd = windowStart + WINDOW_MS;

            const windowTxs = [];
            const senders = new Set();
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
                    id: uuidv4(),
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
    const senderGroups = new Map();
    for (const tx of sorted) {
        if (!senderGroups.has(tx.sender_id)) senderGroups.set(tx.sender_id, []);
        senderGroups.get(tx.sender_id).push(tx);
    }

    for (const [sender, txs] of senderGroups) {
        for (let i = 0; i < txs.length; i++) {
            const windowStart = new Date(txs[i].timestamp).getTime();
            const windowEnd = windowStart + WINDOW_MS;

            const windowTxs = [];
            const receivers = new Set();
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
                    id: uuidv4(),
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
function detectShellNetworks(adjacency, nodeMap) {
    const rings = [];
    const foundChains = new Set();
    const MIN_HOPS = 3;
    const MAX_TX_FOR_SHELL = 3;

    const shellNodes = new Set();
    for (const [id, node] of nodeMap) {
        if (node.transaction_count >= 2 && node.transaction_count <= MAX_TX_FOR_SHELL) {
            shellNodes.add(id);
        }
    }

    for (const startNode of nodeMap.keys()) {
        if (shellNodes.has(startNode)) continue;

        const stack = [{ node: startNode, path: [startNode], txIds: [], totalAmount: 0, shellCount: 0 }];

        while (stack.length > 0) {
            const { node, path, txIds, totalAmount, shellCount } = stack.pop();
            const neighbors = adjacency.get(node) || [];

            for (const { target, tx } of neighbors) {
                if (path.includes(target)) continue;

                const isShell = shellNodes.has(target);
                const newShellCount = shellCount + (isShell ? 1 : 0);
                const newPath = [...path, target];
                const newTxIds = [...txIds, tx.id];
                const newAmount = totalAmount + tx.amount;

                if (newPath.length >= MIN_HOPS + 1) {
                    const intermediates = newPath.slice(1, -1);
                    const shellIntermediates = intermediates.filter((n) => shellNodes.has(n));

                    if (shellIntermediates.length >= Math.ceil(intermediates.length * 0.6)) {
                        const chainKey = newPath.sort().join('|');
                        if (!foundChains.has(chainKey)) {
                            foundChains.add(chainKey);
                            const hopCount = newPath.length - 1;
                            const severity = hopCount >= 5 ? 'critical' : hopCount >= 4 ? 'high' : 'medium';

                            rings.push({
                                id: uuidv4(),
                                ring_type: 'layered_shell_network',
                                severity,
                                accounts: [...newPath],
                                transactions: newTxIds,
                                hop_count: hopCount,
                                total_amount: Math.round(newAmount * 100) / 100,
                                description: `Shell network: ${newPath.join(' → ')} (${hopCount} hops, ${shellIntermediates.length}/${intermediates.length} shell intermediaries, ${newAmount.toFixed(2)} total)`,
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
    cycle: 40,
    fanin_fanout: 30,
    shell: 25,
    velocity: 10,
};

const VELOCITY_THRESHOLD = 5;

function computeSuspicionScores(nodeMap, fraudRings, transactions) {
    const scores = new Map();

    function getScore(id) {
        let s = scores.get(id);
        if (!s) {
            s = { cycle: 0, fan: 0, shell: 0, velocity: 0, ringIds: new Set() };
            scores.set(id, s);
        }
        return s;
    }

    for (const ring of fraudRings) {
        const ringId = ring.id;
        for (const accountId of ring.accounts) {
            const s = getScore(accountId);
            s.ringIds.add(ringId);

            switch (ring.ring_type) {
                case 'circular_routing':
                    s.cycle += SCORE_WEIGHTS.cycle * (ring.cycle_length || 3) / 3;
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

    const txByAccount = new Map();
    for (const tx of transactions) {
        const ts = new Date(tx.timestamp);
        for (const accId of [tx.sender_id, tx.receiver_id]) {
            if (!txByAccount.has(accId)) txByAccount.set(accId, []);
            txByAccount.get(accId).push(ts);
        }
    }

    for (const [accId, timestamps] of txByAccount) {
        timestamps.sort((a, b) => a.getTime() - b.getTime());
        const DAY_MS = 24 * 60 * 60 * 1000;
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
            s.velocity += SCORE_WEIGHTS.velocity * (maxInWindow / VELOCITY_THRESHOLD);
        }
    }

    const MERCHANT_DEGREE_THRESHOLD = 15;
    const MERCHANT_REDUCTION_FACTOR = 0.4;

    for (const [accId, s] of scores) {
        const node = nodeMap.get(accId);
        if (!node) continue;
        const totalDegree = node.in_degree + node.out_degree;
        const isHighVolumeStable = totalDegree >= MERCHANT_DEGREE_THRESHOLD && s.cycle === 0 && s.shell === 0;

        if (isHighVolumeStable) {
            s.velocity *= MERCHANT_REDUCTION_FACTOR;
            s.fan *= MERCHANT_REDUCTION_FACTOR;
        }
    }

    let maxRaw = 0;
    for (const s of scores.values()) {
        const raw = s.cycle + s.fan + s.shell + s.velocity;
        maxRaw = Math.max(maxRaw, raw);
    }
    if (maxRaw === 0) maxRaw = 1;

    const results = [];
    for (const [accId, s] of scores) {
        const raw = s.cycle + s.fan + s.shell + s.velocity;
        const normalized = Math.round((raw / maxRaw) * 100 * 100) / 100;
        const node = nodeMap.get(accId);

        let riskLabel;
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
            contributing_rings: Array.from(s.ringIds), // UUID[]
            transaction_count: node?.transaction_count || 0,
            total_volume: Math.round(((node?.total_sent || 0) + (node?.total_received || 0)) * 100) / 100,
        });
    }

    results.sort((a, b) => b.suspicion_score - a.suspicion_score);
    return results;
}

export const analyzeTransactions = async (fileBuffer) => {
    // 1. Parse CSV from buffer
    const transactions = [];
    const accounts = new Set();
    const rows = [];

    await new Promise((resolve, reject) => {
        const stream = Readable.from(fileBuffer);
        stream
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Parsed ${rows.length} rows`);

    // 2. Process rows into transactions & accounts
    // Need to match CSV headers: transaction_ref, sender_id, receiver_id, amount, timestamp
    // Or adapt if keys differ. Usually CSV parsers use header keys.
    // I'll assume keys match standard format or try best effort.

    for (const row of rows) {
        // Normalize keys (lowercase, trim)
        // Check standard keys
        const sender = row.sender_id || row['Sender ID'] || row.Sender;
        const receiver = row.receiver_id || row['Receiver ID'] || row.Receiver;
        const amtStr = row.amount || row.Amount;
        const tsStr = row.timestamp || row.Timestamp || row.Date;
        const ref = row.transaction_ref || row['Transaction Ref'] || uuidv4();

        if (sender && receiver && amtStr) {
            accounts.add(sender);
            accounts.add(receiver);
            transactions.push({
                transaction_ref: ref,
                id: uuidv4(), // Internal ID for graph
                sender_id: sender,
                receiver_id: receiver,
                amount: parseFloat(amtStr),
                timestamp: tsStr ? new Date(tsStr).toISOString() : new Date().toISOString(),
                risk_score: 0,
                is_flagged: false
            });
        }
    }

    console.log(`Processed ${transactions.length} transactions`);

    if (transactions.length === 0) {
        return { message: "No valid transactions found." };
    }

    // 3. Upsert Accounts
    const accountUpdates = Array.from(accounts).map(id => ({
        account_id: id,
        account_name: `Account ${id}`,
        risk_level: 'low'
    }));

    // In chunks if too many? Supabase can handle 1000s usually.
    // But for safety:
    const { error: accError } = await supabase.from('accounts').upsert(accountUpdates, { onConflict: 'account_id', ignoreDuplicates: true });
    if (accError) console.error("Account upsert error:", accError);

    // 4. Insert Transactions
    // We want to upsert by transaction_ref
    // transactions for DB: { transaction_ref, sender_id, receiver_id, amount, currency='USD', timestamp... }
    const dbTransactions = transactions.map(t => ({
        transaction_ref: t.transaction_ref,
        sender_id: t.sender_id,
        receiver_id: t.receiver_id,
        amount: t.amount,
        currency: 'USD',
        timestamp: t.timestamp,
        risk_score: 0,
        is_flagged: false
    }));

    const { error: txError } = await supabase.from('transactions').upsert(dbTransactions, { onConflict: 'transaction_ref', ignoreDuplicates: true });
    if (txError) console.error("Transaction upsert error:", txError);

    // 5. Build Graph & Analyze
    const { nodes, edges, totalVolume } = buildGraph(transactions);
    const circularRings = detectCircularRouting(new Map(), new Map()); // Wait, I need passing adjacency/nodemap

    // Re-build because detectCircularRouting needs adjacency which I didn't export from buildGraph, 
    // Wait, buildGraph returns adjacency.
    const graphData = buildGraph(transactions);
    const cRings = detectCircularRouting(graphData.adjacency, graphData.nodeMap);
    const sRings = detectSmurfing(transactions);
    const shRings = detectShellNetworks(graphData.adjacency, graphData.nodeMap);

    const allRings = [...cRings, ...sRings, ...shRings];

    // 6. Store Rings
    if (allRings.length > 0) {
        const ringRecords = allRings.map(r => ({
            id: r.id,
            ring_type: r.ring_type,
            severity: r.severity,
            accounts: r.accounts,
            transactions: r.transactions,
            cycle_length: r.cycle_length || null,
            hop_count: r.hop_count || null,
            window_hours: r.window_hours || null,
            total_amount: r.total_amount,
            description: r.description,
            details: r.details,
            detected_at: new Date().toISOString()
        }));

        const { error: rError } = await supabase.from('fraud_rings').insert(ringRecords);
        if (rError) console.error("Fraud ring insert error:", rError);
    }

    // 7. Compute & Store Suspicion Scores
    const analysisId = new Date().toISOString();
    const suspiciousAccounts = computeSuspicionScores(graphData.nodeMap, allRings, transactions);

    if (suspiciousAccounts.length > 0) {
        const saRecords = suspiciousAccounts.map(sa => ({
            account_id: sa.account_id,
            suspicion_score: sa.suspicion_score,
            raw_score: sa.raw_score,
            cycle_score: sa.cycle_score,
            fanin_fanout_score: sa.fanin_fanout_score,
            shell_score: sa.shell_score,
            velocity_score: sa.velocity_score,
            risk_label: sa.risk_label,
            contributing_rings: sa.contributing_rings,
            transaction_count: sa.transaction_count,
            total_volume: sa.total_volume,
            analysis_id: analysisId
        }));
        const { error: saError } = await supabase.from('suspicious_accounts').insert(saRecords);
        if (saError) console.error("Suspicious account insert error:", saError);
    }

    // 8. Return Result
    return {
        nodes: graphData.nodes,
        edges: graphData.edges,
        fraud_rings: allRings,
        suspicious_accounts: suspiciousAccounts,
        node_count: graphData.nodes.length,
        edge_count: graphData.edges.length,
        fraud_ring_count: allRings.length,
        suspicious_account_count: suspiciousAccounts.filter(sa => sa.suspicion_score > 0).length,
        circular_routing_count: cRings.length,
        smurfing_count: sRings.length,
        shell_network_count: shRings.length,
        total_volume: graphData.totalVolume,
        flagged_edges: graphData.edges.filter(e => e.is_flagged).length,
        flagged_nodes: graphData.nodes.filter(n => n.is_flagged).length,
        analysis_timestamp: analysisId
    };
};
