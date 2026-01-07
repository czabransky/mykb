import React from 'react';
import styles from './conversation.module.css';

interface DialogLine {
    speaker: 'A' | 'B';
    chinese: string;
    pinyin: string;
    english: string;
    note?: string;
}

interface ConversationProps {
    dialog: DialogLine[];
    speakerA?: string;
    speakerB?: string;
    title?: string;
}

export default function Conversation({
    dialog,
    speakerA = 'A',
    speakerB = 'B',
    title = 'Conversation'
}: ConversationProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.headerIcon}>💬</span>
                <span className={styles.headerTitle}>{title}</span>
            </div>
            <div className={styles.dialog}>
                {dialog.map((line, idx) => (
                    <div key={idx} className={styles.line} data-speaker={line.speaker}>
                        <div className={`${styles.avatar} ${line.speaker === 'A' ? styles.avatarA : styles.avatarB}`}>
                            {line.speaker === 'A' ? speakerA.charAt(0).toUpperCase() : speakerB.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.bubble}>
                            <div className={styles.chinese}>{line.chinese}</div>
                            <div className={styles.pinyin}>{line.pinyin}</div>
                            <div className={styles.english}>{line.english}</div>
                            {line.note && <div className={styles.note}>{line.note}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
