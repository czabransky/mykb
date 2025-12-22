import React from 'react';
import styles from './comparison-box.module.css';

interface ComparisonBoxProps {
    left: {
        label: string;
        content: React.ReactNode;
        accent?: string;
    };
    right: {
        label: string;
        content: React.ReactNode;
        accent?: string;
    };
}

export default function ComparisonBox({ left, right }: ComparisonBoxProps) {
    return (
        <div className={styles.container}>
            <div className={styles.box} data-accent={left.accent || 'neutral'}>
                <div className={styles.label}>{left.label}</div>
                <div className={styles.content}>{left.content}</div>
            </div>
            <div className={styles.divider}>vs</div>
            <div className={styles.box} data-accent={right.accent || 'neutral'}>
                <div className={styles.label}>{right.label}</div>
                <div className={styles.content}>{right.content}</div>
            </div>
        </div>
    );
}
