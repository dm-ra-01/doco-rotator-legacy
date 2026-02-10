import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useHistory } from '@docusaurus/router';
import { useColorMode } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

// ── Cluster color palette ──
const CLUSTERS = {
    'business-planning': { label: 'Strategy', light: '#0d9488', dark: '#2dd4bf' },
    'app-documentation': { label: 'Product', light: '#4f46e5', dark: '#818cf8' },
    'infrastructure': { label: 'Infra', light: '#d97706', dark: '#fbbf24' },
    'projects': { label: 'Projects', light: '#059669', dark: '#34d399' },
    'governance-and-legal': { label: 'Governance', light: '#e11d48', dark: '#fb7185' },
    'compliance': { label: 'Compliance', light: '#7c3aed', dark: '#a78bfa' },
    'intro': { label: 'Intro', light: '#6366f1', dark: '#a5b4fc' },
};

function getCluster(id) {
    for (const prefix of Object.keys(CLUSTERS)) {
        if (id.startsWith(prefix)) return prefix;
    }
    return 'intro';
}

function getNodeColor(id, isDark) {
    const cluster = getCluster(id);
    const c = CLUSTERS[cluster] || CLUSTERS['intro'];
    return isDark ? c.dark : c.light;
}

// ── Transform compact JSON → force-graph data ──
function transformGraph(raw) {
    const nodeMap = new Map();
    const nodes = raw.n.map(n => {
        const node = {
            id: n[0],
            title: n[1],
            summary: n[2] || '',
            keywords: n[3] || [],
            cluster: getCluster(n[0]),
        };
        nodeMap.set(n[0], node);
        return node;
    });

    const links = raw.e
        .filter(e => nodeMap.has(e[0]) && nodeMap.has(e[1]))
        .map(e => ({
            source: e[0],
            target: e[1],
            type: e[2], // 'l' = link, 'h' = hierarchy
        }));

    return { nodes, links };
}

// ── Inner graph (rendered client-side only) ──
function GraphInner() {
    const [graphData, setGraphData] = useState(null);
    const [search, setSearch] = useState('');
    const [hovered, setHovered] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [ForceGraph2D, setForceGraph2D] = useState(null);
    const containerRef = useRef(null);
    const fgRef = useRef(null);
    const history = useHistory();
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const graphJsonUrl = useBaseUrl('/knowledge-graph.json');

    // Dynamically import react-force-graph-2d (client only)
    useEffect(() => {
        import('react-force-graph-2d').then(mod => {
            setForceGraph2D(() => mod.default);
        });
    }, []);

    // Fetch graph data
    useEffect(() => {
        fetch(graphJsonUrl)
            .then(r => r.json())
            .then(raw => setGraphData(transformGraph(raw)))
            .catch(err => console.error('Failed to load knowledge graph:', err));
    }, []);

    // Responsive sizing
    useEffect(() => {
        function handleResize() {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Search filtering
    const searchLower = search.toLowerCase();
    const matchedIds = useMemo(() => {
        if (!searchLower || !graphData) return null;
        return new Set(
            graphData.nodes
                .filter(n =>
                    n.title.toLowerCase().includes(searchLower) ||
                    n.id.toLowerCase().includes(searchLower) ||
                    n.summary.toLowerCase().includes(searchLower) ||
                    n.keywords.some(k => k.toLowerCase().includes(searchLower))
                )
                .map(n => n.id)
        );
    }, [searchLower, graphData]);

    // Connected nodes for hover highlight
    const connectedIds = useMemo(() => {
        if (!hovered || !graphData) return new Set();
        const ids = new Set([hovered]);
        graphData.links.forEach(l => {
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            if (s === hovered) ids.add(t);
            if (t === hovered) ids.add(s);
        });
        return ids;
    }, [hovered, graphData]);

    const handleNodeClick = useCallback((node) => {
        // Navigate to the doc page
        const docPath = `/docs/${node.id}`;
        history.push(docPath);
    }, [history]);

    const handleNodeHover = useCallback((node, prevNode) => {
        if (node) {
            setHovered(node.id);
            setTooltip({ title: node.title, summary: node.summary, cluster: CLUSTERS[node.cluster]?.label || '' });
        } else {
            setHovered(null);
            setTooltip(null);
        }
        // pointer cursor
        if (containerRef.current) {
            containerRef.current.style.cursor = node ? 'pointer' : 'default';
        }
    }, []);

    // Node paint function
    const paintNode = useCallback((node, ctx, globalScale) => {
        const isMatched = !matchedIds || matchedIds.has(node.id);
        const isConnected = hovered ? connectedIds.has(node.id) : true;
        const alpha = (isMatched && isConnected) ? 1.0 : 0.08;
        const r = hovered === node.id ? 6 : (isMatched && matchedIds ? 5 : 4);

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = getNodeColor(node.id, isDark);
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Glow on hover
        if (hovered === node.id) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI);
            ctx.fillStyle = getNodeColor(node.id, isDark);
            ctx.globalAlpha = 0.15;
            ctx.fill();
        }

        // Label (only when zoomed in enough or hovered/matched)
        ctx.globalAlpha = alpha;
        const fontSize = Math.max(12 / globalScale, 2);
        if (globalScale > 1.2 || hovered === node.id || (matchedIds && matchedIds.has(node.id))) {
            ctx.font = `${fontSize}px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = isDark ? '#e4e4e7' : '#27272a';
            ctx.globalAlpha = (hovered === node.id || (matchedIds && matchedIds.has(node.id))) ? 1 : alpha * 0.8;
            ctx.fillText(node.title, node.x, node.y + r + 2);
        }

        ctx.globalAlpha = 1;
    }, [isDark, matchedIds, hovered, connectedIds]);

    // Link paint
    const linkColor = useCallback((link) => {
        const s = typeof link.source === 'object' ? link.source.id : link.source;
        const t = typeof link.target === 'object' ? link.target.id : link.target;
        const isActive = hovered ? (connectedIds.has(s) && connectedIds.has(t)) : true;
        const isSearched = !matchedIds || (matchedIds.has(s) && matchedIds.has(t));

        if (!isActive || !isSearched) {
            return isDark ? 'rgba(63, 63, 70, 0.05)' : 'rgba(212, 212, 216, 0.05)';
        }
        if (link.type === 'h') {
            return isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.15)';
        }
        return isDark ? 'rgba(161, 161, 170, 0.2)' : 'rgba(113, 113, 122, 0.12)';
    }, [isDark, hovered, connectedIds, matchedIds]);

    if (!graphData || !ForceGraph2D) {
        return (
            <div className={styles.container} ref={containerRef}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading knowledge graph…</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} ref={containerRef}>
            {/* Controls overlay */}
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search nodes…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
                <div className={styles.legend}>
                    {Object.entries(CLUSTERS).map(([key, val]) => (
                        <span key={key} className={styles.legendItem}>
                            <span
                                className={styles.legendDot}
                                style={{ backgroundColor: isDark ? val.dark : val.light }}
                            />
                            {val.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className={styles.tooltip}>
                    <strong>{tooltip.title}</strong>
                    <span className={styles.tooltipCluster}>{tooltip.cluster}</span>
                    {tooltip.summary && <p>{tooltip.summary}</p>}
                </div>
            )}

            {/* Graph */}
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeCanvasObject={paintNode}
                nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI);
                    ctx.fillStyle = color;
                    ctx.fill();
                }}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                linkColor={linkColor}
                linkWidth={link => link.type === 'h' ? 1.5 : 0.5}
                linkDirectionalParticles={0}
                backgroundColor={isDark ? '#09090b' : '#fafafa'}
                cooldownTicks={120}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                warmupTicks={80}
                enableNodeDrag={true}
                enableZoomInteraction={true}
                enablePanInteraction={true}
            />
        </div>
    );
}

// ── Export with BrowserOnly wrapper ──
export default function KnowledgeGraph() {
    return (
        <BrowserOnly fallback={<div className={styles.loading}>Loading…</div>}>
            {() => <GraphInner />}
        </BrowserOnly>
    );
}
