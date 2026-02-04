import React, { useState } from 'react';
import useParagraphs from '../hooks/useParagraphs';
import styles from './paragraph.module.css';

interface ParagraphProps {
    paragraphKey: string | string[];
}

const Paragraph: React.FC<ParagraphProps> = ({ paragraphKey }) => {
    const { paragraphs, loading } = useParagraphs(paragraphKey);
    const [showPinyin, setShowPinyin] = useState(true);
    const [showEnglish, setShowEnglish] = useState(true);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <button
                    className={`${styles.toggleButton} ${showPinyin ? styles.active : ''}`}
                    onClick={() => setShowPinyin(!showPinyin)}
                >
                    {showPinyin ? 'Hide' : 'Show'} Pinyin
                </button>
                <button
                    className={`${styles.toggleButton} ${showEnglish ? styles.active : ''}`}
                    onClick={() => setShowEnglish(!showEnglish)}
                >
                    {showEnglish ? 'Hide' : 'Show'} English
                </button>
            </div>
            <div className={styles.paragraphGrid}>
                {paragraphs.map((item, index) => (
                    <div key={index} className={styles.row}>
                        <div className={styles.chinese}>{item.chinese}</div>
                        {showPinyin && <div className={styles.pinyin}>{item.pinyin}</div>}
                        {showEnglish && <div className={styles.english}>{item.english}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Paragraph;
