import React, { useState } from 'react';
import useParagraphs, { Paragraph as ParagraphItem } from '../hooks/useParagraphs';
import styles from './paragraph.module.css';

interface ParagraphProps {
    paragraphKey?: string | string[];
    data?: ParagraphItem[];
}

const Paragraph: React.FC<ParagraphProps> = ({ paragraphKey, data }) => {
    const { paragraphs: fetchedParagraphs, loading } = useParagraphs(paragraphKey);
    const [showPinyin, setShowPinyin] = useState(true);
    const [showEnglish, setShowEnglish] = useState(true);
    const [showTeacherNotes, setShowTeacherNotes] = useState(true);

    // Use direct data if provided, otherwise use fetched data
    const paragraphs = data || fetchedParagraphs;

    if (!data && loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <button
                    className={`${styles.toggleButton} ${showPinyin ? styles.active : ''}`}
                    onClick={() => setShowPinyin(!showPinyin)}
                >
                    Pinyin
                </button>
                <button
                    className={`${styles.toggleButton} ${showEnglish ? styles.active : ''}`}
                    onClick={() => setShowEnglish(!showEnglish)}
                >
                    English
                </button>
                <button
                    className={`${styles.toggleButton} ${showTeacherNotes ? styles.active : ''}`}
                    onClick={() => setShowTeacherNotes(!showTeacherNotes)}
                >
                    Notes
                </button>
            </div>
            <div className={styles.paragraphGrid}>
                {paragraphs.map((item, index) => (
                    <div
                        key={index}
                        className={styles.row}
                        style={{
                            gridTemplateColumns: `repeat(${1 + (showPinyin ? 1 : 0) + (showEnglish ? 1 : 0)}, 1fr)`
                        }}
                    >
                        <div className={styles.chinese}>{item.chinese}</div>
                        {showPinyin && <div className={styles.pinyin}>{item.pinyin}</div>}
                        {showEnglish && <div className={styles.english}>{item.english}</div>}
                        {showTeacherNotes && item.teacherNotes && (
                            <div className={styles.teacherNotes}>
                                <div className={styles.teacherNotesLabel}>Note</div>
                                <div className={styles.teacherNotesText}>{item.teacherNotes}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Paragraph;
