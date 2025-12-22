import React from 'react';
import styles from './pattern-box.module.css';

interface PatternBoxProps {
    title?: string;
    pattern: Array<{
        part: string;
        label?: string;
    }>;
    example?: {
        chinese: string;
        pinyin: string;
        english: string;
    };
}

export default function PatternBox({ title, pattern, example }: PatternBoxProps) {
    return (
        <div className={styles.container}>
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.patternRow}>
                {pattern.map((item, idx) => (
                    <React.Fragment key={idx}>
                        {idx > 0 && <span className={styles.connector}>+</span>}
                        <div className={styles.patternPart}>
                            <span className={styles.partText}>{item.part}</span>
                            {item.label && <span className={styles.partLabel}>{item.label}</span>}
                        </div>
                    </React.Fragment>
                ))}
            </div>
            {example && (
                <div className={styles.example}>
                    <div className={styles.chinese}>{example.chinese}</div>
                    <div className={styles.pinyin}>{example.pinyin}</div>
                    <div className={styles.english}>{example.english}</div>
                </div>
            )}
        </div>
    );
}
