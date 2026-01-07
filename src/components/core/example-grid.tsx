import React from 'react';
import styles from './example-grid.module.css';

interface Example {
    chinese: string;
    pinyin: string;
    english: string;
    note?: string;
}

interface ExampleGridProps {
    examples: Example[];
}

// Word type colors (matching word-graph.tsx)
const wordTypeColors: Record<string, string> = {
    verb: '#3b82f6',
    noun: '#10b981',
    adjective: '#f59e0b',
    adverb: '#8b5cf6',
    pronoun: '#ec4899',
    particle: '#6b7280',
    measureword: '#14b8a6',
    auxiliaryverb: '#0ea5e9',
    conjunction: '#a855f7',
};

// Custom markup parser: <c:type>text</c> renders text in the word type color
function parseCustomMarkup(text: string): React.ReactNode[] {
    const regex = /<c:(\w+)>(.*?)<\/c>/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        const wordType = match[1].toLowerCase();
        const color = wordTypeColors[wordType] || 'inherit';
        parts.push(<span key={match.index} style={{ color }}>{match[2]}</span>);
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

export default function ExampleGrid({ examples }: ExampleGridProps) {
    return (
        <div className={styles.grid}>
            {examples.map((example, idx) => (
                <div key={idx} className={styles.card}>
                    <div className={styles.chinese}>{example.chinese}</div>
                    <div className={styles.pinyin}>{example.pinyin}</div>
                    <div className={styles.english}>{example.english}</div>
                    {example.note && (
                        <div className={styles.note}>
                            {parseCustomMarkup(example.note)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
