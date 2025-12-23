import React, { useEffect, useRef, useState } from 'react';
import styles from './word-graph.module.css';

export enum ConnectionType {
    Related = 'related',
    Compound = 'compound',
    Synonym = 'synonym',
    Component = 'component'
}

interface WordNode {
    id: string;
    chinese: string;
    pinyin: string;
    english: string;
    type?: string;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
}

interface Connection {
    source: string;
    target: string;
    type: ConnectionType;
}

interface WordGraphProps {
    nodes: WordNode[];
    connections: Connection[];
    centerNode: string;
    width?: number;
    height?: number;
}

export default function WordGraph({
    nodes,
    connections,
    centerNode,
    width = 800,
    height = 600
}: WordGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [graphNodes, setGraphNodes] = useState<WordNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [copiedNode, setCopiedNode] = useState<string | null>(null);
    const [showAllEnglish, setShowAllEnglish] = useState(false);
    const animationRef = useRef<number>();

    const handleNodeClick = async (node: WordNode) => {
        setSelectedNode(node.id);

        try {
            await navigator.clipboard.writeText(node.chinese);
            setCopiedNode(node.id);
            setTimeout(() => setCopiedNode(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    useEffect(() => {
        // Initialize node positions
        const centerX = width / 2;
        const centerY = height / 2;

        // Build position map using BFS to place nodes near their parents
        const positionMap = new Map<string, { x: number, y: number }>();
        positionMap.set(centerNode, { x: centerX, y: centerY });

        const visited = new Set<string>([centerNode]);
        const queue: Array<{ id: string, depth: number, parentX: number, parentY: number, parentAngle: number }> = [
            { id: centerNode, depth: 0, parentX: centerX, parentY: centerY, parentAngle: 0 }
        ];

        let firstLevelIndex = 0;

        while (queue.length > 0) {
            const current = queue.shift()!;

            // Find all unvisited connected nodes
            const connectedNodes = connections
                .filter(c => c.source === current.id || c.target === current.id)
                .map(c => c.source === current.id ? c.target : c.source)
                .filter(id => !visited.has(id));

            // Get total first-level nodes for even distribution
            const firstLevelNodes = connections
                .filter(c => c.source === centerNode || c.target === centerNode)
                .map(c => c.source === centerNode ? c.target : c.source);

            // Place connected nodes around the current node
            connectedNodes.forEach((nodeId, index) => {
                visited.add(nodeId);

                let angle: number;
                let distance: number;

                if (current.depth === 0) {
                    // First level: distribute evenly around the circle
                    angle = (firstLevelIndex / firstLevelNodes.length) * 2 * Math.PI;
                    distance = 150;
                    firstLevelIndex++;
                } else {
                    // Deeper levels: place near parent with some spread
                    const spread = Math.PI / 1.5; // Wider spread for better distribution
                    const angleOffset = (index / Math.max(connectedNodes.length - 1, 1) - 0.5) * spread;
                    angle = current.parentAngle + angleOffset;
                    distance = 150 + (Math.log(current.depth) * 25);
                    console.log('Deeper level node:', nodeId, 'Depth:', current.depth, 'Angle:', angle, 'Distance:', distance);
                }

                const x = current.parentX + Math.cos(angle) * distance;
                const y = current.parentY + Math.sin(angle) * distance;

                positionMap.set(nodeId, { x, y });
                queue.push({ id: nodeId, depth: current.depth + 1, parentX: x, parentY: y, parentAngle: angle });
            });
        }

        const initializedNodes = nodes.map(node => {
            const pos = positionMap.get(node.id) || { x: centerX, y: centerY };
            return {
                ...node,
                x: pos.x,
                y: pos.y,
                vx: 0,
                vy: 0
            };
        });

        setGraphNodes(initializedNodes);
    }, [nodes, centerNode, width, height, connections]);

    useEffect(() => {
        const velocityThreshold = 0.1;
        if (graphNodes.length === 0) return;

        const simulate = () => {
            setGraphNodes(prevNodes => {
                const newNodes = prevNodes.map(node => ({ ...node }));

                // Physics parameters
                const repelForce = 2000;
                const attractForce = 0.05; // Increased from 0.01 to pull connected nodes closer
                const linkDistance = 100; // Reduced from 120 to keep connected nodes closer
                const damping = 0.72;
                const centerPull = 0.05;

                // Build adjacency map for quick lookup
                const isConnected = (idA: string, idB: string): boolean => {
                    return connections.some(c =>
                        (c.source === idA && c.target === idB) ||
                        (c.source === idB && c.target === idA)
                    );
                };

                // Apply forces
                for (let i = 0; i < newNodes.length; i++) {
                    const nodeA = newNodes[i];

                    // Repel from all other nodes
                    for (let j = i + 1; j < newNodes.length; j++) {
                        const nodeB = newNodes[j];
                        const dx = nodeB.x! - nodeA.x!;
                        const dy = nodeB.y! - nodeA.y!;
                        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                        // Reduce repulsion between connected nodes
                        const connected = isConnected(nodeA.id, nodeB.id);
                        const effectiveRepelForce = connected ? repelForce * 0.3 : repelForce;

                        const force = effectiveRepelForce / (distance * distance);
                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;

                        nodeA.vx! -= fx;
                        nodeA.vy! -= fy;
                        nodeB.vx! += fx;
                        nodeB.vy! += fy;
                    }

                    // Center node stays in place
                    if (nodeA.id === centerNode) {
                        nodeA.x = width / 2;
                        nodeA.y = height / 2;
                        nodeA.vx = 0;
                        nodeA.vy = 0;
                    }
                }

                // Apply link forces
                connections.forEach(conn => {
                    const source = newNodes.find(n => n.id === conn.source);
                    const target = newNodes.find(n => n.id === conn.target);

                    if (source && target) {
                        const dx = target.x! - source.x!;
                        const dy = target.y! - source.y!;
                        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                        // Apply stronger forces and shorter distances for component and compound relationships
                        let effectiveAttractForce = attractForce;
                        let effectiveLinkDistance = linkDistance;

                        // if (conn.type === 'component') {
                        //     effectiveAttractForce = attractForce * 5; // Much stronger attraction
                        //     effectiveLinkDistance = linkDistance * 0.6; // Pull closer together
                        // } else if (conn.type === 'compound') {
                        //     effectiveAttractForce = attractForce * 2.0; // Stronger attraction
                        //     effectiveLinkDistance = linkDistance * 0.7; // Pull closer together
                        // }

                        const force = (distance - effectiveLinkDistance) * effectiveAttractForce;

                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;

                        if (source.id !== centerNode) {
                            source.vx! += fx;
                            source.vy! += fy;
                        }
                        if (target.id !== centerNode) {
                            target.vx! -= fx;
                            target.vy! -= fy;
                        }
                    }
                });

                // Update positions and apply damping
                newNodes.forEach(node => {
                    if (node.id !== centerNode) {
                        // Gentle pull toward center
                        const dx = width / 2 - node.x!;
                        const dy = height / 2 - node.y!;
                        node.vx! += dx * centerPull;
                        node.vy! += dy * centerPull;

                        // Update position
                        node.x! += node.vx!;
                        node.y! += node.vy!;

                        // Apply damping
                        node.vx! *= damping;
                        node.vy! *= damping;

                        // Stop very small movements
                        if (Math.abs(node.vx!) < velocityThreshold) node.vx = 0;
                        if (Math.abs(node.vy!) < velocityThreshold) node.vy = 0;

                        // Keep within bounds
                        const margin = 50;
                        node.x! = Math.max(margin, Math.min(width - margin, node.x!));
                        node.y! = Math.max(margin, Math.min(height - margin, node.y!));
                    }
                });

                return newNodes;
            });

            // Check if simulation has settled
            const maxVelocity = Math.max(
                ...graphNodes
                    .filter(n => n.id !== centerNode)
                    .map(n => Math.abs(n.vx || 0) + Math.abs(n.vy || 0))
            );

            if (maxVelocity > velocityThreshold) {
                animationRef.current = requestAnimationFrame(simulate);
            }
        };

        animationRef.current = requestAnimationFrame(simulate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [graphNodes.length, connections, centerNode, width, height]);

    const getNodeRadius = (node: WordNode) => {
        if (node.id === centerNode) return 50;
        return 35;
    };

    const getNodeClass = (node: WordNode) => {
        const classes = [styles.node];
        if (node.id === centerNode) classes.push(styles.centerNode);
        if (node.type) {
            const typeClass = styles[`type${node.type.charAt(0).toUpperCase() + node.type.slice(1).replace(/\s+/g, '')}`];
            if (typeClass) classes.push(typeClass);
        }
        if (selectedNode === node.id) classes.push(styles.selected);
        return classes.join(' ');
    };

    return (
        <div className={styles.container}>
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className={styles.svg}
            >
                <defs>
                    <filter id="bubble-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="0" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Arrow markers for directional relationships */}
                    <marker
                        id="arrow-compound"
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" />
                    </marker>

                    <marker
                        id="arrow-component"
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-success)" />
                    </marker>
                </defs>

                {/* Render connections */}
                <g className={styles.connections}>
                    {connections.map((conn, i) => {
                        const source = graphNodes.find(n => n.id === conn.source);
                        const target = graphNodes.find(n => n.id === conn.target);

                        if (!source || !target) return null;

                        // Calculate the angle and adjust endpoints to stop at node edges
                        const dx = target.x! - source.x!;
                        const dy = target.y! - source.y!;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const sourceRadius = getNodeRadius(source);
                        const targetRadius = getNodeRadius(target);

                        // Calculate adjusted start and end points
                        const x1 = source.x! + (dx / distance) * sourceRadius;
                        const y1 = source.y! + (dy / distance) * sourceRadius;
                        const x2 = target.x! - (dx / distance) * targetRadius;
                        const y2 = target.y! - (dy / distance) * targetRadius;

                        // Determine if this connection should have an arrow
                        const markerEnd = conn.type === 'compound' ? 'url(#arrow-compound)' :
                            conn.type === 'component' ? 'url(#arrow-component)' :
                                undefined;

                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                className={styles.connection}
                                data-type={conn.type}
                                markerEnd={markerEnd}
                            />
                        );
                    })}
                </g>

                {/* Render nodes */}
                <g className={styles.nodes}>
                    {graphNodes.map(node => (
                        <g
                            key={node.id}
                            transform={`translate(${node.x},${node.y})`}
                            onClick={() => handleNodeClick(node)}
                            onMouseEnter={() => setSelectedNode(node.id)}
                            onMouseLeave={() => setSelectedNode(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            <circle
                                r={getNodeRadius(node)}
                                className={getNodeClass(node)}
                                filter="url(#bubble-shadow)"
                            />
                            <text
                                className={styles.chinese}
                                textAnchor="middle"
                                dy="-5"
                            >
                                {node.chinese}
                            </text>
                            <text
                                className={styles.pinyin}
                                textAnchor="middle"
                                dy="15"
                            >
                                {node.pinyin}
                            </text>

                            {(showAllEnglish || selectedNode === node.id) && (
                                <text
                                    className={styles.english}
                                    textAnchor="middle"
                                    dy={node.id === centerNode ? "75" : "60"}
                                >
                                    {node.english}
                                </text>
                            )}

                            {copiedNode === node.id && (
                                <text
                                    className={styles.copied}
                                    textAnchor="middle"
                                    dy={node.id === centerNode ? "90" : "75"}
                                >
                                    ✓ Copied!
                                </text>
                            )}
                        </g>
                    ))}
                </g>
            </svg>

            <div className={styles.legend}>
                <div className={styles.legendTitle}>Legend</div>

                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={showAllEnglish}
                        onChange={(e) => setShowAllEnglish(e.target.checked)}
                        className={styles.checkbox}
                    />
                    <span>Show all English</span>
                </label>

                <div className={styles.legendSection}>
                    <div className={styles.legendLabel}>Word Types:</div>
                    <div className={styles.legendItem}>
                        <svg width="30" height="20">
                            <circle cx="10" cy="10" r="6" className={styles.legendTypeVerb} />
                        </svg>
                        <span>Verb</span>
                    </div>
                    <div className={styles.legendItem}>
                        <svg width="30" height="20">
                            <circle cx="10" cy="10" r="6" className={styles.legendTypeNoun} />
                        </svg>
                        <span>Noun</span>
                    </div>
                    <div className={styles.legendItem}>
                        <svg width="30" height="20">
                            <circle cx="10" cy="10" r="6" className={styles.legendTypeAdjective} />
                        </svg>
                        <span>Adjective</span>
                    </div>
                    <div className={styles.legendItem}>
                        <svg width="30" height="20">
                            <circle cx="10" cy="10" r="6" className={styles.legendTypeAdverb} />
                        </svg>
                        <span>Adverb</span>
                    </div>
                </div>

                <div className={styles.legendSection}>
                    <div className={styles.legendLabel}>Connections:</div>
                    <div className={styles.legendItem}>
                        <svg width="30" height="20">
                            <line x1="0" y1="10" x2="30" y2="10" className={styles.legendConnectionRelated} />
                        </svg>
                        <span>Related</span>
                    </div>
                    <div className={styles.legendItem}>
                        <svg width="30" height="20">
                            <defs>
                                <marker
                                    id="legend-arrow-compound"
                                    viewBox="0 0 10 10"
                                    refX="9"
                                    refY="5"
                                    markerWidth="4"
                                    markerHeight="4"
                                    orient="auto-start-reverse"
                                >
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" />
                                </marker>
                            </defs>
                            <line x1="0" y1="10" x2="30" y2="10" className={styles.legendConnectionCompound} markerEnd="url(#legend-arrow-compound)" />
                        </svg>
                        <span>Compound part</span>
                    </div>
                    <div className={styles.legendItem}>
                        <svg width="30" height="20">
                            <line x1="0" y1="10" x2="30" y2="10" className={styles.legendConnectionSynonym} />
                        </svg>
                        <span>Synonym/Similar</span>
                    </div>
                    <div className={styles.legendItem}>
                        <svg width="30" height="20">
                            <defs>
                                <marker
                                    id="legend-arrow-component"
                                    viewBox="0 0 10 10"
                                    refX="9"
                                    refY="5"
                                    markerWidth="4"
                                    markerHeight="4"
                                    orient="auto-start-reverse"
                                >
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-success)" />
                                </marker>
                            </defs>
                            <line x1="0" y1="10" x2="30" y2="10" className={styles.legendConnectionComponent} markerEnd="url(#legend-arrow-component)" />
                        </svg>
                        <span>Character component</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
