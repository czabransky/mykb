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

    // Pan state
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const panStartRef = useRef({ x: 0, y: 0 });

    // Zoom state
    const [zoom, setZoom] = useState(1);

    const handleNodeClick = async (node: WordNode, event: React.MouseEvent) => {
        // Don't trigger node click if we were panning
        if (isPanning) {
            event.stopPropagation();
            return;
        }

        setSelectedNode(node.id);

        try {
            await navigator.clipboard.writeText(node.chinese);
            setCopiedNode(node.id);
            setTimeout(() => setCopiedNode(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    // Pan handlers
    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button !== 0) return; // Only left mouse button
        setIsPanning(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        panStartRef.current = { x: panOffset.x, y: panOffset.y };
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isPanning) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        setPanOffset({
            x: panStartRef.current.x + dx,
            y: panStartRef.current.y + dy
        });
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleMouseLeave = () => {
        setIsPanning(false);
    };

    // Add native wheel event listener with passive: false to prevent default
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const handleWheelNative = (e: WheelEvent) => {
            e.preventDefault();

            const zoomSensitivity = 0.001;
            const delta = -e.deltaY * zoomSensitivity;
            const newZoom = Math.max(0.1, Math.min(5, zoom + delta));

            const rect = svg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate the point in graph space that's under the mouse
            const graphX = (mouseX - panOffset.x) / zoom;
            const graphY = (mouseY - panOffset.y) / zoom;

            // Adjust pan offset so the point under mouse stays in the same place
            const newPanX = mouseX - graphX * newZoom;
            const newPanY = mouseY - graphY * newZoom;

            setZoom(newZoom);
            setPanOffset({ x: newPanX, y: newPanY });
        };

        svg.addEventListener('wheel', handleWheelNative, { passive: false });

        return () => {
            svg.removeEventListener('wheel', handleWheelNative);
        };
    }, [zoom, panOffset]);

    useEffect(() => {
        // Initialize node positions
        // Use fixed coordinate space, independent of viewport size
        const centerX = 0;
        const centerY = 0;

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

                    if (nodeId === '理解') {
                        console.log('理解 - First level positioning:', {
                            firstLevelIndex: firstLevelIndex - 1,
                            totalFirstLevel: firstLevelNodes.length,
                            angle,
                            angleInDegrees: (angle * 180 / Math.PI).toFixed(2),
                            distance
                        });
                    }
                } else {
                    // Deeper levels: position away from center
                    // Calculate angle from center to parent
                    const parentDx = current.parentX - centerX;
                    const parentDy = current.parentY - centerY;
                    const angleFromCenter = Math.atan2(parentDy, parentDx);

                    // Use parent's angle from center as base (points outward from center)
                    let baseAngle = angleFromCenter;

                    // Calculate distance first
                    distance = 150 + (Math.log(current.depth) * 30); // Increase distance for deeper levels

                    // Spread siblings around the outward direction
                    // Calculate spread based on number of siblings and node size
                    const nodeRadius = 35;
                    const gap = 20; // Gap between nodes
                    const arcLengthNeeded = connectedNodes.length * (2 * nodeRadius + gap);
                    const calculatedSpread = arcLengthNeeded / distance;

                    // Cap the spread angle to avoid excessive spreading
                    const maxSpread = Math.PI * 0.8; // Max 144 degrees
                    const spreadAngle = Math.min(calculatedSpread, maxSpread);

                    const angleOffset = (index / Math.max(connectedNodes.length - 1, 1) - 0.5) * spreadAngle;

                    angle = baseAngle + angleOffset;

                    if (nodeId === '理解') {
                        console.log('理解 - Deeper level positioning:', {
                            depth: current.depth,
                            parent: current.id,
                            index,
                            parentX: current.parentX,
                            parentY: current.parentY,
                            centerX,
                            centerY,
                            angleFromCenter,
                            angleFromCenterDegrees: (angleFromCenter * 180 / Math.PI).toFixed(2),
                            totalSiblings: connectedNodes.length,
                            angleOffset,
                            angleOffsetInDegrees: (angleOffset * 180 / Math.PI).toFixed(2),
                            finalAngle: angle,
                            finalAngleInDegrees: (angle * 180 / Math.PI).toFixed(2),
                            distance,
                            calculatedX: current.parentX + Math.cos(angle) * distance,
                            calculatedY: current.parentY + Math.sin(angle) * distance
                        });
                    }
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
    }, [nodes, centerNode, connections]);

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
                        nodeA.x = 0;
                        nodeA.y = 0;
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
                        // Gentle pull toward origin (0, 0)
                        const dx = 0 - node.x!;
                        const dy = 0 - node.y!;
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
    }, [graphNodes.length, connections, centerNode]);

    // Center the graph based on node positions
    useEffect(() => {
        if (graphNodes.length === 0) return;

        // Calculate bounding box of all nodes
        const nodeRadius = 50; // Max node radius
        const padding = 10; // Comfortable padding from viewport edges
        const minX = Math.min(...graphNodes.map(n => (n.x || 0) - nodeRadius));
        const maxX = Math.max(...graphNodes.map(n => (n.x || 0) + nodeRadius));
        const minY = Math.min(...graphNodes.map(n => (n.y || 0) - nodeRadius));
        const maxY = Math.max(...graphNodes.map(n => (n.y || 0) + nodeRadius));

        // Calculate the size of the bounding box
        const boundingBoxWidth = maxX - minX;
        const boundingBoxHeight = maxY - minY;

        // Calculate the center of the bounding box
        const boundingBoxCenterX = (minX + maxX) / 2;
        const boundingBoxCenterY = (minY + maxY) / 2;

        // Available space for content (viewport minus padding on both sides)
        const availableWidth = width - (padding * 2);
        const availableHeight = height - (padding * 2);

        // Calculate zoom to fit with padding
        const scaleX = availableWidth / boundingBoxWidth;
        const scaleY = availableHeight / boundingBoxHeight;
        const fitZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 1x

        // Calculate offset needed to center the bounding box in the viewport
        const viewportCenterX = width / 2;
        const viewportCenterY = height / 2;

        const offsetX = viewportCenterX - boundingBoxCenterX * fitZoom;
        const offsetY = viewportCenterY - boundingBoxCenterY * fitZoom;

        setZoom(fitZoom);
        setPanOffset({ x: offsetX, y: offsetY });
    }, [graphNodes, width, height]);

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
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
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
                <g className={styles.connections} transform={`translate(${panOffset.x},${panOffset.y}) scale(${zoom})`}>
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
                <g className={styles.nodes} transform={`translate(${panOffset.x},${panOffset.y}) scale(${zoom})`}>
                    {graphNodes.map(node => (
                        <g
                            key={node.id}
                            transform={`translate(${node.x},${node.y})`}
                            onClick={(e) => handleNodeClick(node, e)}
                            onMouseEnter={() => setSelectedNode(node.id)}
                            onMouseLeave={() => setSelectedNode(null)}
                            style={{ cursor: isPanning ? 'grabbing' : 'pointer' }}
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
