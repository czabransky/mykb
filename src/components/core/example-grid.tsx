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

export default function ExampleGrid({ examples }: ExampleGridProps) {
    return (
        <div className={styles.grid}>
            {examples.map((example, idx) => (
                <div key={idx} className={styles.card}>
                    <div className={styles.chinese}>{example.chinese}</div>
                    <div className={styles.pinyin}>{example.pinyin}</div>
                    <div className={styles.english}>{example.english}</div>
                    {example.note && (
                        <div className={styles.note}>{example.note}</div>
                    )}
                </div>
            ))}
        </div>
    );
}
