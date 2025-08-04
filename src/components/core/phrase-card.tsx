import React from 'react';
import Card from './card';
import TextToSpeech from './text-to-speech';
import styles from './phrase-card.module.css';

function getFileName(text: string) {
    return text
        .normalize('NFD')
        .replace(/[\s。？]/g, '')
        .toLowerCase();
}

type ChinesePhraseCardProps = {
    english: string;
    pinyin: string;
    chinese: React.ReactNode;
};

function getChineseText(chinese: React.ReactNode): string {
    if (typeof chinese === 'string') return chinese;
    if (React.isValidElement(chinese) && typeof chinese.props.children === 'string') {
        return chinese.props.children;
    }
    return '';
}

export default function PhraseCard({english, pinyin, chinese}: ChinesePhraseCardProps) {
    const chineseText = getChineseText(chinese);
    const fileName = getFileName(chineseText);
    const audioPath = `/mykb/audio/${fileName}.mp3`;

    return (
        <Card>
            <div className={styles.cardRoot}>
                <div className={styles.chinese}>{chinese}</div>
                <div className={styles.pinyinRow}>
                    <span className={styles.pinyin}>{pinyin}</span>
                    <TextToSpeech lang="zh-CN" fallbackSrc={audioPath}/>
                </div>
                <div className={styles.englishFooter}>{english}</div>
            </div>
        </Card>
    );
}
