import React, {useRef, useEffect, useState} from 'react';
import {FiVolume2} from 'react-icons/fi';
import styles from './text-to-speech.module.css';

type TextToSpeechProps = {
    text: string;
    lang?: string;
    fallbackSrc: string;
};

export default function TextToSpeech({text, lang = 'zh-CN', fallbackSrc}: TextToSpeechProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [shouldPlay, setShouldPlay] = useState(false);
    const [loading, setLoading] = useState(false);

    const getTtsAudio = async () => {
        setAudioSrc(fallbackSrc);
        setShouldPlay(true);
        setLoading(true);
    };

    useEffect(() => {
        if (audioSrc && shouldPlay) {
            audioRef.current?.play();
            setShouldPlay(false);
        }
    }, [audioSrc, shouldPlay]);

    const handleCanPlayThrough = () => {
        setLoading(false);
    };

    return (
        <div className={styles.ttsRoot}>
            <button
                type="button"
                onClick={getTtsAudio}
                disabled={loading}
                className={styles.ttsButton}
            >
                <FiVolume2 size={20} style={{verticalAlign: 'middle', color: 'inherit'}}/>
            </button>
            {loading && <span className={styles.ttsSpinner}/>}
            <audio
                ref={audioRef}
                src={audioSrc ?? undefined}
                onCanPlayThrough={handleCanPlayThrough}
            />
        </div>
    );
}