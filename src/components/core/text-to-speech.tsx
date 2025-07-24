import React, {useRef, useEffect, useState} from 'react';
import {FiVolume2, FiPause} from 'react-icons/fi';
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
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);

    const getTtsAudio = async () => {
        if (playing) {
            audioRef.current?.pause();
            audioRef.current!.currentTime = 0;
            setPlaying(false);
            setLoading(false);
            return;
        }
        if (loading) return; // Prevent multiple clicks while loading
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

    const handlePlay = () => {
        setLoading(false);
        setPlaying(true);
    };

    const handleEnded = () => {
        setPlaying(false);
        setLoading(false);
    };
    const handleError = () => {
        setPlaying(false);
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
                {loading
                    ? <span className={styles.ttsSpinner}/>
                    : playing
                        ? <FiPause size={20} style={{verticalAlign: 'middle', color: 'inherit'}}/>
                        : <FiVolume2 size={20} style={{verticalAlign: 'middle', color: 'inherit'}}/>
                }
            </button>
            <audio
                ref={audioRef}
                src={audioSrc ?? undefined}
                onPlay={handlePlay}
                onCanPlayThrough={handleCanPlayThrough}
                onEnded={handleEnded}
                onError={handleError}
            />
        </div>
    );
}