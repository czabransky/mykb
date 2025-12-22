import React, { useState, useEffect } from 'react';
import styles from './character-grid.module.css';
import ExternalEmbed from './external-embed';

type Character = {
    char: string;
    pinyin: string;
    english: string;
    link?: string;
};

type CharacterGridProps = {
    characters: Character[];
};

export default function CharacterGrid({ characters = [] }: CharacterGridProps) {
    const [modalUrl, setModalUrl] = useState<string | null>(null);
    const [modalChar, setModalChar] = useState<string>('');

    const openModal = (url: string, char: string) => {
        setModalUrl(url);
        setModalChar(char);
    };

    const closeModal = () => {
        setModalUrl(null);
        setModalChar('');
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && modalUrl) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [modalUrl]);

    return (
        <>
            <div className={styles.grid}>
                {characters.map(({ char, pinyin, english, link }) => {
                    const href =
                        link ||
                        `https://www.archchinese.com/chinese_english_dictionary.html?find=${encodeURIComponent(char)}`;

                    return (
                        <div
                            className={styles.card}
                            key={char}
                            title={english}
                            role="button"
                            tabIndex={0}
                            onClick={() => openModal(href, char)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    openModal(href, char);
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className={styles.char}>{char}</span>
                            <div className={pinyin ? styles.pinyin : styles.notfound}>{pinyin ?? 'missing'}</div>
                            <div className={styles.english}>{english}</div>
                        </div>
                    );
                })}
            </div>

            {modalUrl && (
                <div className={styles.modal} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{modalChar} - Dictionary</h2>
                            <button className={styles.modalClose} onClick={closeModal}>
                                ✕
                            </button>
                        </div>
                        <ExternalEmbed url={modalUrl} height="600px" title={`Dictionary for ${modalChar}`} />
                    </div>
                </div>
            )}
        </>
    );
}
