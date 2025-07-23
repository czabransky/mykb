import React, {ReactNode, useEffect } from 'react';
import {FaArrowLeft, FaArrowRight} from 'react-icons/fa'
import Card from '@site/src/components/core/card';
import styles from './flash-card-viewer.module.css';

export type QuestionAnswerPair = {
    question: string;
    answer: string;
};

interface FlashCardViewerProps {
    cards: QuestionAnswerPair[];
}

function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export default function FlashCardViewer({cards}: FlashCardViewerProps): ReactNode {
    const [shuffledCards, setShuffledCards] = React.useState<QuestionAnswerPair[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [flipped, setFlipped] = React.useState(false);

    useEffect(() => {
        setShuffledCards(shuffleArray(cards));
    }, [cards]);
    
    const handleFlip = () => setFlipped(f => !f);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
        setFlipped(false);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        setFlipped(false);
    };
    
    if (shuffledCards.length === 0) {
        return <div>No cards available.</div>;
    }
    
    return (
        <div
            className={styles.container}
            tabIndex={0}
            onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleFlip();
                    return;
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    handleNext();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    handlePrev();
                }
            }}
        >
            <Card contentClassName={styles.flashCardViewer}>
                <button
                    className={styles.navButton}
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    tabIndex={-1}
                    aria-label="Previous"
                >
                    <FaArrowLeft/>
                </button>
                <div
                    className={`${styles.flashCard} ${flipped ? styles.flipped : ''}`}
                    onClick={handleFlip}
                    tabIndex={0}
                >
                    <div className={styles.flashCardQuestion}>{shuffledCards[currentIndex].question}</div>
                    <div className={styles.flashCardAnswer}>{shuffledCards[currentIndex].answer}</div>
                    <div className={styles.flashCardIndex}>
                        {currentIndex + 1} out of {shuffledCards.length}
                    </div>
                </div>
                <button
                    className={styles.navButton}
                    onClick={handleNext}
                    disabled={currentIndex === shuffledCards.length - 1}
                    tabIndex={-1}
                    aria-label="Next"
                >
                    <FaArrowRight/>
                </button>
                <div className={styles.instructions}>
                    <span>press space to reveal</span>
                </div>
            </Card>
        </div>
    );
}