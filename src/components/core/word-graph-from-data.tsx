import React, { useEffect, useState } from 'react';
import WordGraph from './word-graph';

interface Connection {
    source: string;
    target: string;
    type: 'related' | 'compound' | 'synonym' | 'component';
}

interface WordData {
    id: string;
    pinyin: string;
    english: string;
    type?: string;
}

interface WordGraphFromDataProps {
    centerNode: string;
    nodeIds: string[];
    connections: Connection[];
    width?: number;
    height?: number;
}

export default function WordGraphFromData({
    centerNode,
    nodeIds,
    connections,
    width = 800,
    height = 600
}: WordGraphFromDataProps) {
    const [nodes, setNodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/mykb/data/words.json')
            .then(res => res.json())
            .then((data: Record<string, WordData>) => {
                // Map the node IDs to their data from words.json
                const nodeList = nodeIds.map(id => {
                    const wordData = data[id];
                    if (!wordData) {
                        console.warn(`Word not found in words.json: ${id}`);
                        return null;
                    }
                    return {
                        id: wordData.id,
                        chinese: id,
                        pinyin: wordData.pinyin,
                        english: wordData.english,
                        type: wordData.type
                    };
                }).filter(node => node !== null);

                setNodes(nodeList);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading words.json:', error);
                setLoading(false);
            });
    }, [nodeIds]);

    if (loading) {
        return <div>Loading word graph...</div>;
    }

    if (nodes.length === 0) {
        return <div>No words found</div>;
    }

    return (
        <WordGraph
            nodes={nodes}
            connections={connections}
            centerNode={centerNode}
            width={width}
            height={height}
        />
    );
}
