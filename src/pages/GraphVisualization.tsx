import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import cytoscape, { type Core, type EventObject } from 'cytoscape';
import {
    HiOutlineRefresh,
    HiOutlineZoomIn,
    HiOutlineZoomOut,
    HiOutlineEye,
    HiOutlineExclamationCircle,
    HiX,
    HiOutlineExternalLink,
} from 'react-icons/hi';
import {
    fetchGraphData,
    type AnalysisResult,
} from '../services/analysisService';

// ── Tooltip data ──────────────────────────────────────────────────────
interface TooltipData {
    x: number;
    y: number;
    account_id: string;
    suspicion_score: number;
    risk_label: string;
    patterns: string[];
    ring_ids: string[];
    transaction_count: number;
    total_volume: number;
}

// ── Color palette ─────────────────────────────────────────────────────
const NODE_COLORS = {
    clean: { bg: '#1e293b', border: '#475569', text: '#94a3b8' },
    low: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
    moderate: { bg: '#422006', border: '#f59e0b', text: '#fcd34d' },
    high: { bg: '#450a0a', border: '#ef4444', text: '#fca5a5' },
    critical: { bg: '#4c0519', border: '#f43f5e', text: '#fda4af' },
    // Default ring color if not specific
    ring: { bg: '#3b0764', border: '#a855f7', text: '#d8b4fe' },
};

const EDGE_COLORS = { normal: '#64748b', flagged: '#ef4444', arrow: '#94a3b8' };

// Palette for different fraud rings
const RING_PALETTE = [
    '#F472B6', // Pink
    '#34D399', // Green
    '#60A5FA', // Blue
    '#FBBF24', // Amber
    '#A78BFA', // Purple
    '#F87171', // Red
    '#2DD4BF', // Teal
];

function riskColor(label: string) {
    return NODE_COLORS[label as keyof typeof NODE_COLORS] ?? NODE_COLORS.clean;
}

// Helper to get a consistent color for a ring ID
function getRingColor(ringId: string) {
    let hash = 0;
    for (let i = 0; i < ringId.length; i++) {
        hash = ringId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % RING_PALETTE.length;
    return RING_PALETTE[index];
}

function GraphVisualization() {
    const [searchParams] = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [selectedNode, setSelectedNode] = useState<TooltipData | null>(null);
    const [stats, setStats] = useState({ nodes: 0, edges: 0, rings: 0, suspicious: 0 });

    // ── Load data ───────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        const { data, error: err } = await fetchGraphData({ limit: 500 });
        if (err) {
            setError(err);
            setLoading(false);
            return;
        }
        setAnalysis(data);
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Build Cytoscape graph ───────────────────────────────────────────
    useEffect(() => {
        if (!analysis || !containerRef.current) return;

        // Build lookup maps for suspicious accounts
        const suspicionMap = new Map<string, {
            score: number;
            label: string;
            patterns: string[];
            ringIds: string[];
        }>();

        for (const sa of analysis.suspicious_accounts) {
            suspicionMap.set(sa.account_id, {
                score: sa.suspicion_score,
                label: sa.risk_label,
                patterns: sa.contributing_rings,
                ringIds: sa.contributing_rings,
            });
        }

        // Build ring membership maps
        // node -> Set<ringId>
        const ringMembership = new Map<string, Set<string>>();
        // transactionId -> ringId (for highlighting edges)
        const txRingMap = new Map<string, string>();

        // Map ring ID to color
        const ringColorMap = new Map<string, string>();

        for (const ring of analysis.fraud_rings) {
            const ringId = `${ring.ring_type}_${ring.accounts.slice(0, 3).join('_')}`;
            const color = getRingColor(ringId);
            ringColorMap.set(ringId, color);

            for (const acc of ring.accounts) {
                if (!ringMembership.has(acc)) ringMembership.set(acc, new Set());
                ringMembership.get(acc)!.add(ringId);
            }
            // Map transactions to this ring
            for (const txId of ring.transactions) {
                txRingMap.set(txId, ringId);
            }
        }

        // Create Cytoscape elements
        const elements: cytoscape.ElementDefinition[] = [];

        // Nodes
        for (const node of analysis.nodes) {
            const susp = suspicionMap.get(node.id);
            const rings = ringMembership.get(node.id);
            const riskLabel = susp?.label ?? 'clean';

            // Determine node color
            // If part of a ring, use the ring's color. If multiple, pick first.
            let bg = riskColor(riskLabel).bg;
            let borderColor = riskColor(riskLabel).border;
            let ringColor = null;

            const isRingMember = rings && rings.size > 0;
            if (isRingMember) {
                const firstRingId = Array.from(rings)[0];
                ringColor = ringColorMap.get(firstRingId);
                if (ringColor) {
                    bg = '#1e293b'; // Dark background
                    borderColor = ringColor; // Colored border
                }
            }

            elements.push({
                group: 'nodes',
                data: {
                    id: node.id,
                    label: node.id,
                    suspicion_score: susp?.score ?? 0,
                    risk_label: riskLabel,
                    patterns: susp?.patterns ?? [],
                    ring_ids: rings ? Array.from(rings) : [],
                    is_ring_member: isRingMember,
                    ring_color: ringColor, // For styling
                    transaction_count: node.transaction_count,
                    total_volume: Math.round((node.total_sent + node.total_received) * 100) / 100,
                    in_degree: node.in_degree,
                    out_degree: node.out_degree,
                    bg,
                    borderColor,
                    textColor: NODE_COLORS.clean.text,
                    nodeSize: Math.max(30, Math.min(70, 20 + node.transaction_count * 8)),
                },
            });
        }

        // Edges
        for (const edge of analysis.edges) {
            const ringId = txRingMap.get(edge.id);
            const ringColor = ringId ? ringColorMap.get(ringId) : null;

            elements.push({
                group: 'edges',
                data: {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    amount: edge.amount,
                    is_flagged: edge.is_flagged,
                    risk_score: edge.risk_score,
                    is_ring_edge: !!ringId,
                    ring_color: ringColor,
                    label: `$${edge.amount.toLocaleString()}`,
                    lineColor: ringColor || (edge.is_flagged ? EDGE_COLORS.flagged : EDGE_COLORS.normal),
                    width: ringId ? 4 : Math.max(1, Math.min(6, edge.amount / 2000)),
                },
            });
        }

        // Initialize Cytoscape
        const cy = cytoscape({
            container: containerRef.current,
            elements,
            minZoom: 0.1,
            maxZoom: 4,
            wheelSensitivity: 0.2,
            // ── Performance Optimization Flags ──────────────────────────
            hideEdgesOnViewport: true, // Hide edges while panning/zooming for FPS
            textureOnViewport: true,     // Render to texture for zoom/pan
            motionBlur: true,
            pixelRatio: 1,               // Lower resolution for high-DPI screens
            boxSelectionEnabled: false,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(bg)',
                        'border-color': 'data(borderColor)',
                        'border-width': 2,
                        'label': 'data(label)',
                        'color': 'data(textColor)',
                        'font-size': '10px',
                        'font-weight': 600,
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'width': 'data(nodeSize)',
                        'height': 'data(nodeSize)',
                        'text-outline-color': '#0f172a',
                        'text-outline-width': 2,
                        'overlay-padding': '4px',
                        'z-index': 10,
                    },
                },
                {
                    selector: 'node[?is_ring_member]',
                    style: {
                        'border-width': 3,
                        'background-color': 'data(ring_color)',
                        'background-opacity': 0.3,
                        'shadow-blur': 15,
                        'shadow-color': 'data(borderColor)',
                        'shadow-opacity': 0.5,
                    } as any,
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 'data(width)',
                        'line-color': 'data(lineColor)',
                        'target-arrow-color': 'data(lineColor)',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'haystack', // Haystack is MUCH faster than bezier
                        'opacity': 0.7,
                    },
                },
                {
                    selector: 'edge[?is_ring_edge]',
                    style: {
                        'curve-style': 'bezier', // Only rings get bezier (for visibility)
                        'width': 4,
                        'line-color': 'data(ring_color)',
                        'target-arrow-color': 'data(ring_color)',
                        'opacity': 1,
                        'z-index': 20,
                    } as any,
                },
                {
                    selector: '.highlighted',
                    style: {
                        'border-width': 5,
                        'border-color': '#fff',
                        'shadow-blur': 20,
                        'shadow-color': '#fff',
                        'z-index': 100,
                    } as any,
                },
                {
                    selector: '.dimmed',
                    style: {
                        'opacity': 0.05,
                        'z-index': 0,
                    },
                },
            ] as any,
            layout: {
                name: 'cose',
                animate: analysis.node_count < 200, // Disable animation for large graphs
                randomize: true,
                componentSpacing: 100,
                nodeRepulsion: () => 10000,
                edgeElasticity: () => 50,
                numIter: 1000,
                initialTemp: 1000,
                coolingFactor: 0.99,
                minTemp: 1.0,
                padding: 40,
            } as any,
        });

        // ── Hover tooltip ─────────────────────────────────────────────────
        cy.on('mouseover', 'node', (e: EventObject) => {
            const node = e.target;
            const pos = node.renderedPosition();
            setTooltip({
                x: pos.x + 50,
                y: pos.y - 50,
                account_id: node.data('id'),
                suspicion_score: node.data('suspicion_score'),
                risk_label: node.data('risk_label'),
                patterns: node.data('patterns'),
                ring_ids: node.data('ring_ids'),
                transaction_count: node.data('transaction_count'),
                total_volume: node.data('total_volume'),
            });

            // Highlight neighborhood
            const neighborhood = node.closedNeighborhood();
            cy.elements().addClass('dimmed');
            neighborhood.removeClass('dimmed');
            node.addClass('highlighted');
        });

        cy.on('mouseout', 'node', () => {
            setTooltip(null);
            cy.elements().removeClass('dimmed highlighted');
        });

        // ── Click handler ─────────────────────────────────────────────────
        cy.on('tap', 'node', (e: EventObject) => {
            const node = e.target;
            const data = {
                x: 0, y: 0,
                account_id: node.data('id'),
                suspicion_score: node.data('suspicion_score'),
                risk_label: node.data('risk_label'),
                patterns: node.data('patterns'),
                ring_ids: node.data('ring_ids'),
                transaction_count: node.data('transaction_count'),
                total_volume: node.data('total_volume'),
            };
            setSelectedNode(data);
        });

        cy.on('tap', (e: EventObject) => {
            if (e.target === cy) {
                setSelectedNode(null);
                // Also clear highlights if any persistent ones existed
                // (though currently we only persist from URL)
            }
        });

        setStats({
            nodes: analysis.node_count,
            edges: analysis.edge_count,
            rings: analysis.fraud_ring_count,
            suspicious: analysis.suspicious_account_count,
        });

        cyRef.current = cy;

        // ── Auto-highlight from URL ───────────────────────────────────────
        const highlightParam = searchParams.get('highlight');
        if (highlightParam) {
            const ringAccounts = highlightParam.split(',');
            // Find nodes
            const ringNodes = cy.nodes().filter((n) => ringAccounts.includes(n.data('id')));

            if (ringNodes.length > 0) {
                cy.elements().addClass('dimmed');

                // Highlight nodes
                ringNodes.removeClass('dimmed').addClass('highlighted');

                // Highlight edges between these nodes
                const ringEdges = ringNodes.edgesWith(ringNodes);
                ringEdges.removeClass('dimmed').style({
                    'width': 6,
                    'line-color': '#fff',
                    'target-arrow-color': '#fff',
                    'shadow-blur': 20,
                    'shadow-color': '#fff',
                    'opacity': 1,
                    'z-index': 100
                } as any);

                cy.fit(ringNodes, 80);
            }
        }

        return () => {
            cy.destroy();
            cyRef.current = null;
        };
    }, [analysis, searchParams]);

    // ── Controls ────────────────────────────────────────────────────────
    const zoomIn = () => cyRef.current?.zoom({ level: (cyRef.current.zoom() || 1) * 1.3, renderedPosition: { x: (containerRef.current?.offsetWidth || 0) / 2, y: (containerRef.current?.offsetHeight || 0) / 2 } });
    const zoomOut = () => cyRef.current?.zoom({ level: (cyRef.current.zoom() || 1) * 0.7, renderedPosition: { x: (containerRef.current?.offsetWidth || 0) / 2, y: (containerRef.current?.offsetHeight || 0) / 2 } });
    const fitAll = () => cyRef.current?.fit(undefined, 50);

    const riskLabels: Array<{ label: string; key: string }> = [
        { label: 'Clean', key: 'clean' },
        { label: 'Low', key: 'low' },
        { label: 'Moderate', key: 'moderate' },
        { label: 'High', key: 'high' },
        { label: 'Critical', key: 'critical' },
    ];

    return (
        <div className="animate-fade-in-up space-y-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">Graph Visualization</h1>
                    <p className="text-gray-400">
                        Interactive directed graph of transaction flows and fraud patterns
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-violet-500/15 px-5 py-2.5 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/25 disabled:opacity-50"
                >
                    <HiOutlineRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Nodes', value: stats.nodes, color: 'text-violet-400' },
                    { label: 'Edges', value: stats.edges, color: 'text-cyan-400' },
                    { label: 'Fraud Rings', value: stats.rings, color: 'text-rose-400' },
                    { label: 'Suspicious', value: stats.suspicious, color: 'text-amber-400' },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Error state */}
            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm">
                    <HiOutlineExclamationCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                    <span className="text-rose-300">{error}</span>
                </div>
            )}

            {/* Graph container */}
            <div className="relative rounded-2xl border border-white/10 bg-[#0a0e1a] overflow-hidden" style={{ height: '65vh' }}>
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0e1a]/80 backdrop-blur-sm">
                        <div className="text-center">
                            <HiOutlineRefresh className="h-8 w-8 text-violet-400 animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Loading transaction graph…</p>
                        </div>
                    </div>
                )}

                {!loading && analysis && analysis.node_count === 0 && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="text-center">
                            <HiOutlineEye className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500">No transactions to visualize</p>
                            <p className="text-gray-600 text-xs mt-1">Upload a CSV first on the Home page</p>
                        </div>
                    </div>
                )}

                <div ref={containerRef} className="w-full h-full" />

                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                    <button onClick={zoomIn} className="rounded-lg bg-white/5 border border-white/10 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Zoom In">
                        <HiOutlineZoomIn className="h-5 w-5" />
                    </button>
                    <button onClick={zoomOut} className="rounded-lg bg-white/5 border border-white/10 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Zoom Out">
                        <HiOutlineZoomOut className="h-5 w-5" />
                    </button>
                    <button onClick={fitAll} className="rounded-lg bg-white/5 border border-white/10 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Fit All">
                        <HiOutlineEye className="h-5 w-5" />
                    </button>
                </div>

                <div className="absolute top-4 left-4 rounded-xl bg-[#0f1629]/90 border border-white/10 p-4 z-10 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Risk Levels</p>
                    <div className="space-y-2">
                        {riskLabels.map(({ label, key }) => (
                            <div key={key} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full border-2"
                                    style={{
                                        backgroundColor: NODE_COLORS[key as keyof typeof NODE_COLORS]?.bg ?? '#1e293b',
                                        borderColor: NODE_COLORS[key as keyof typeof NODE_COLORS]?.border ?? '#475569',
                                    }}
                                />
                                <span className="text-xs text-gray-400">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {tooltip && (
                    <div
                        className="absolute z-30 pointer-events-none"
                        style={{
                            left: tooltip.x + 15,
                            top: tooltip.y - 10,
                            maxWidth: 280,
                        }}
                    >
                        <div className="rounded-xl bg-[#1a1f2e] border border-white/15 shadow-2xl shadow-black/50 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-white">{tooltip.account_id}</span>
                                <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tooltip.risk_label === 'critical'
                                        ? 'bg-rose-500/20 text-rose-300'
                                        : tooltip.risk_label === 'high'
                                            ? 'bg-red-500/20 text-red-300'
                                            : tooltip.risk_label === 'moderate'
                                                ? 'bg-amber-500/20 text-amber-300'
                                                : tooltip.risk_label === 'low'
                                                    ? 'bg-blue-500/20 text-blue-300'
                                                    : 'bg-slate-500/20 text-slate-300'
                                        }`}
                                >
                                    {tooltip.risk_label}
                                </span>
                            </div>

                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Suspicion Score</span>
                                    <span className="text-white font-semibold">{tooltip.suspicion_score}/100</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Transactions</span>
                                    <span className="text-gray-300">{tooltip.transaction_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Volume</span>
                                    <span className="text-gray-300">${tooltip.total_volume.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Side Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-40 w-96 transform bg-[#0a0e1a] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out ${selectedNode ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {selectedNode && (
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between border-b border-white/10 p-4">
                            <h2 className="text-lg font-semibold text-white">Account Details</h2>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                <HiX className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Account ID</p>
                                        <p className="font-mono text-lg font-bold text-white mt-1 break-all">{selectedNode.account_id}</p>
                                    </div>
                                    <div className={`rounded-full px-3 py-1 text-xs font-bold ${selectedNode.risk_label === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                                        selectedNode.risk_label === 'high' ? 'bg-red-500/20 text-red-300' :
                                            selectedNode.risk_label === 'moderate' ? 'bg-amber-500/20 text-amber-300' :
                                                selectedNode.risk_label === 'low' ? 'bg-blue-500/20 text-blue-300' :
                                                    'bg-slate-500/20 text-slate-300'
                                        }`}>
                                        {selectedNode.risk_label.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-white/10 p-3 bg-white/[0.02]">
                                    <p className="text-xs text-gray-500">Risk Score</p>
                                    <p className="text-2xl font-bold text-white mt-1">{selectedNode.suspicion_score}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 p-3 bg-white/[0.02]">
                                    <p className="text-xs text-gray-500">Tx Count</p>
                                    <p className="text-2xl font-bold text-white mt-1">{selectedNode.transaction_count}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 p-3 bg-white/[0.02] col-span-2">
                                    <p className="text-xs text-gray-500">Total Volume</p>
                                    <p className="text-2xl font-bold text-white mt-1">${selectedNode.total_volume.toLocaleString()}</p>
                                </div>
                            </div>

                            {selectedNode.patterns.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Detected Patterns</h3>
                                    <div className="space-y-2">
                                        {selectedNode.patterns.map((p, i) => (
                                            <div key={i} className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 p-3">
                                                <HiOutlineExclamationCircle className="h-5 w-5 text-violet-400 shrink-0" />
                                                <span className="text-sm text-violet-200">{p.replace(/_/g, ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedNode.ring_ids.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Fraud Ring Memberships</h3>
                                    <div className="space-y-2">
                                        {selectedNode.ring_ids.map((r, i) => (
                                            <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                                                <p className="text-xs text-purple-300 font-mono break-all">{r}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition-all">
                                <HiOutlineExternalLink className="h-4 w-4" />
                                View Full History
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedNode && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => setSelectedNode(null)}
                />
            )}
        </div>
    );
}

export default React.memo(GraphVisualization);
