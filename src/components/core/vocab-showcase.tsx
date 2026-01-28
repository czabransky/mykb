import React from 'react';
import styles from './vocab-showcase.module.css';

interface VocabWord {
    chinese: string;
    pinyin: string;
    english: string;
}

interface VocabShowcaseProps {
    words: VocabWord[];
    title?: string;
}

export default function VocabShowcase({
    words,
}: VocabShowcaseProps) {
    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {words.map((word, idx) => (
                    <div key={idx} className={styles.card}>
                        <div className={styles.chinese}>{word.chinese}</div>
                        <div className={styles.pinyin}>{word.pinyin}</div>
                        <div className={styles.english}>{word.english}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
