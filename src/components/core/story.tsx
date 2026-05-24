import React, { useMemo, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import TextToSpeech from '@site/src/components/core/text-to-speech';
import styles from './story.module.css';

interface StoryLine {
    hanyu: string;
    pinyin: string;
    english: string;
}

interface StoryProps {
    title: string;
    theme: string;
    lines: StoryLine[];
    audioTitle?: string;
}

export default function Story({ title, theme, lines, audioTitle }: StoryProps) {
    const [showPinyin, setShowPinyin] = useState(false);
    const [showEnglish, setShowEnglish] = useState(false);
    const [copied, setCopied] = useState(false);

    const text = useMemo(() => lines.map((line) => line.hanyu).join(' '), [lines]);
    const hanziBody = useMemo(() => lines.map((line) => line.hanyu).join(''), [lines]);
    const mp3Title = audioTitle || title;
    const fallbackSrc = useBaseUrl(`/audio/${encodeURIComponent(mp3Title)}.mp3`);

    const handleCopyHanzi = async () => {
        try {
            await navigator.clipboard.writeText(hanziBody);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    return (
        <section className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.theme}>Theme: {theme}</div>
                </div>
                <div className={styles.audioWrap}>
                    <TextToSpeech text={text} fallbackSrc={fallbackSrc} />
                </div>
            </header>

            <div className={styles.controls}>
                <button
                    className={`${styles.toggleButton} ${showPinyin ? styles.active : ''}`}
                    onClick={() => setShowPinyin((value) => !value)}
                >
                    Pinyin
                </button>
                <button
                    className={`${styles.toggleButton} ${showEnglish ? styles.active : ''}`}
                    onClick={() => setShowEnglish((value) => !value)}
                >
                    English
                </button>
                <button
                    className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                    onClick={handleCopyHanzi}
                    type="button"
                >
                    {copied ? 'Copied Hanzi' : 'Copy Hanzi'}
                </button>
            </div>

            <div className={styles.storyGrid}>
                {lines.map((line, index) => (
                    <article key={index} className={styles.lineRow}>
                        <div className={styles.lineIndex}>{index + 1}</div>
                        <div className={styles.lineContent}>
                            <div className={styles.hanyu}>{line.hanyu}</div>
                            {showPinyin && <div className={styles.pinyin}>{line.pinyin}</div>}
                            {showEnglish && <div className={styles.english}>{line.english}</div>}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
