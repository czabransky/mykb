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
                return (
                    <div className={styles.card} key={char}>
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.char}
                            title={english}
                        >
                            {char}
                        </a>
                        <div className={styles.pinyin}>{pinyin}</div>
                        <div className={styles.english}>{english}</div>
                    </div>
                );
            })}
        </div>
    );
}