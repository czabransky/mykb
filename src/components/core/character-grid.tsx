import React from 'react';
import styles from './character-grid.module.css';

type Character = {
    char: string;
    pinyin: string;
    english: string;
    link?: string;
};

type CharacterGridProps = {
    characters: Character[];
};

export default function CharacterGrid({characters = []}: CharacterGridProps) {
    return (
        <div className={styles.grid}>
            {characters.map(({char, pinyin, english, link}) => {
                const href =
                    link ||
                    `https://www.archchinese.com/chinese_english_dictionary.html?find=${encodeURIComponent(char)}`;
                const handleClick = () => {
                    window.open(href, '_blank', 'noopener,noreferrer');
                };
                return (
                    <div
                        className={styles.card}
                        key={char}
                        title={english}
                        role="link"
                        tabIndex={0}
                        onClick={handleClick}
                        style={{cursor: 'pointer'}}
                    >
                        <span className={styles.char}>{char}</span>
                        <div className={styles.pinyin}>{pinyin}</div>
                        <div className={styles.english}>{english}</div>
                    </div>
                );
            })}
        </div>
    );
}
