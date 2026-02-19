import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import cytoscape, { type Core, type EventObject } from 'cytoscape';
import {
    HiOutlineRefresh,
    HiOutlineZoomIn,
    HiOutlineZoomOut,
    HiOutlineEye,
    HiOutlineExclamationCircle,
} from 'react-icons/hi';
import {
    analyzeTransactionsLocal,
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
    ring: { bg: '#3b0764', border: '#a855f7', text: '#d8b4fe' },
};

const EDGE_COLORS = { normal: '#334155', flagged: '#ef4444', arrow: '#64748b' };

function riskColor(label: string) {
    return NODE_COLORS[label as keyof typeof NODE_COLORS] ?? NODE_COLORS.clean;
}

export default function GraphVisualization() {
    const [searchParams] = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [stats, setStats] = useState({ nodes: 0, edges: 0, rings: 0, suspicious: 0 });

    // ── Load data ───────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        const { data, error: err } = await analyzeTransactionsLocal();
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

        // Build lookup maps for suspicious accounts and fraud rings
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

        // Build ring membership map
        const ringMembership = new Map<string, Set<string>>();
        for (const ring of analysis.fraud_rings) {
            const ringId = `${ring.ring_type}_${ring.accounts.slice(0, 3).join('_')}`;
            for (const acc of ring.accounts) {
                if (!ringMembership.has(acc)) ringMembership.set(acc, new Set());
                ringMembership.get(acc)!.add(ringId);
            }
        }

        // Create Cytoscape elements
        const elements: cytoscape.ElementDefinition[] = [];

        // Nodes
        for (const node of analysis.nodes) {
            const susp = suspicionMap.get(node.id);
            const rings = ringMembership.get(node.id);
            const riskLabel = susp?.label ?? 'clean';
            const isRingMember = rings && rings.size > 0;
            const color = isRingMember ? NODE_COLORS.ring : riskColor(riskLabel);

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
                    transaction_count: node.transaction_count,
                    total_volume: Math.round((node.total_sent + node.total_received) * 100) / 100,
                    in_degree: node.in_degree,
                    out_degree: node.out_degree,
                    bg: color.bg,
                    borderColor: color.border,
                    textColor: color.text,
                    // Size based on transaction count
                    nodeSize: Math.max(30, Math.min(70, 20 + node.transaction_count * 8)),
                },
            });
        }

        // Edges
        for (const edge of analysis.edges) {
            elements.push({
                group: 'edges',
                data: {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    amount: edge.amount,
                    is_flagged: edge.is_flagged,
                    risk_score: edge.risk_score,
                    label: `$${edge.amount.toLocaleString()}`,
                    lineColor: edge.is_flagged ? EDGE_COLORS.flagged : EDGE_COLORS.normal,
                    width: Math.max(1, Math.min(6, edge.amount / 2000)),
                },
            });
        }

        // Initialize Cytoscape
        const cy = cytoscape({
            container: containerRef.current,
            elements,
            minZoom: 0.2,
            maxZoom: 5,
            wheelSensitivity: 0.3,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(bg)',
                        'border-color': 'data(borderColor)',
                        'border-width': 3,
                        'label': 'data(label)',
                        'color': 'data(textColor)',
                        'font-size': '10px',
                        'font-family': '"Inter", sans-serif',
                        'font-weight': 600,
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'width': 'data(nodeSize)',
                        'height': 'data(nodeSize)',
                        'text-outline-color': 'data(bg)',
                        'text-outline-width': 2,
                        'overlay-padding': '6px',
                        'z-index': 10,
                    },
                },
                {
                    selector: 'node[?is_ring_member]',
                    style: {
                        'border-width': 4,
                        'border-style': 'double' as any,
                        'shadow-blur': 15,
                        'shadow-color': NODE_COLORS.ring.border,
                        'shadow-opacity': 0.6,
                    } as any,
                },
                {
                    selector: 'node:active',
                    style: {
                        'overlay-opacity': 0.15,
                        'overlay-color': '#a78bfa',
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 'data(width)',
                        'line-color': 'data(lineColor)',
                        'target-arrow-color': 'data(lineColor)',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'arrow-scale': 1.2,
                        'opacity': 0.7,
                    },
                },
                {
                    selector: 'edge[?is_flagged]',
                    style: {
                        'line-style': 'dashed',
                        'line-dash-pattern': [6, 3],
                        'opacity': 0.9,
                        'width': 3,
                    },
                },
                {
                    selector: '.highlighted',
                    style: {
                        'border-color': '#a855f7',
                        'border-width': 5,
                        'shadow-blur': 20,
                        'shadow-color': '#a855f7',
                        'shadow-opacity': 0.8,
                        'z-index': 100,
                    } as any,
                },
                {
                    selector: '.dimmed',
                    style: {
                        'opacity': 0.15,
                    },
                },
            ] as any,
            layout: {
                name: 'cose',
                animate: true,
                animationDuration: 800,
                randomize: false,
                gravity: 1,
                nodeRepulsion: () => 8000,
                idealEdgeLength: () => 120,
                edgeElasticity: () => 100,
                nestingFactor: 1.2,
                numIter: 1000,
                padding: 50,
            } as cytoscape.CoseLayoutOptions,
        });

        // ── Hover tooltip ─────────────────────────────────────────────────
        cy.on('mouseover', 'node', (e: EventObject) => {
            const node = e.target;
            const pos = node.renderedPosition();
            setTooltip({
                x: pos.x,
                y: pos.y,
                account_id: node.data('id'),
                suspicion_score: node.data('suspicion_score'),
                risk_label: node.data('risk_label'),
                patterns: node.data('patterns'),
                ring_ids: node.data('ring_ids'),
                transaction_count: node.data('transaction_count'),
                total_volume: node.data('total_volume'),
            });

            // Highlight connected nodes
            const neighborhood = node.closedNeighborhood();
            cy.elements().addClass('dimmed');
            neighborhood.removeClass('dimmed');
            node.addClass('highlighted');
        });

        cy.on('mouseout', 'node', () => {
            setTooltip(null);
            cy.elements().removeClass('dimmed highlighted');
        });

        // Stats
        setStats({
            nodes: analysis.node_count,
            edges: analysis.edge_count,
            rings: analysis.fraud_ring_count,
            suspicious: analysis.suspicious_account_count,
        });

        cyRef.current = cy;

        // ── Auto-highlight from Dashboard navigation ──────────────────────
        const highlightParam = searchParams.get('highlight');
        if (highlightParam) {
            const ringAccounts = highlightParam.split(',');
            const ringNodes = cy.nodes().filter((n) => ringAccounts.includes(n.data('id')));
            if (ringNodes.length > 0) {
                // Dim everything, highlight ring members
                cy.elements().addClass('dimmed');
                ringNodes.closedNeighborhood().removeClass('dimmed');
                ringNodes.addClass('highlighted');
                // Fit view to ring members
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

    // ── Fraud ring color reference ──────────────────────────────────────
    const riskLabels: Array<{ label: string; key: string }> = [
        { label: 'Clean', key: 'clean' },
        { label: 'Low', key: 'low' },
        { label: 'Moderate', key: 'moderate' },
        { label: 'High', key: 'high' },
        { label: 'Critical', key: 'critical' },
        { label: 'Ring Member', key: 'ring' },
    ];

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <div className="animate-fade-in-up space-y-6">
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

            {/* Graph canvas */}
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

                {/* Empty state */}
                {!loading && analysis && analysis.node_count === 0 && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="text-center">
                            <HiOutlineEye className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500">No transactions to visualize</p>
                            <p className="text-gray-600 text-xs mt-1">Upload a CSV first on the Home page</p>
                        </div>
                    </div>
                )}

                {/* Cytoscape container */}
                <div ref={containerRef} className="w-full h-full" />

                {/* Zoom controls */}
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

                {/* Legend */}
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
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-slate-500" />
                            <span className="text-xs text-gray-500">Normal tx</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 border-t-2 border-dashed border-rose-500" />
                            <span className="text-xs text-gray-500">Flagged tx</span>
                        </div>
                    </div>
                </div>

                {/* Tooltip */}
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

                            {tooltip.patterns.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-white/5">
                                    <p className="text-xs text-gray-500 mb-1">Detected Patterns</p>
                                    <div className="flex flex-wrap gap-1">
                                        {tooltip.patterns.slice(0, 4).map((p, i) => (
                                            <span
                                                key={i}
                                                className="inline-block rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] text-violet-300"
                                            >
                                                {p.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tooltip.ring_ids.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-white/5">
                                    <p className="text-xs text-gray-500 mb-1">Ring IDs</p>
                                    <div className="space-y-0.5">
                                        {tooltip.ring_ids.slice(0, 3).map((r, i) => (
                                            <p key={i} className="text-[10px] text-purple-300 font-mono truncate">
                                                {r}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
