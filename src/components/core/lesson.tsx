import React from 'react';
import usePhrases from '@site/src/components/hooks/usePhrases';
import useCharacters from '@site/src/components/hooks/useCharacters';
import CharacterGrid from '@site/src/components/core/character-grid';
import CardGrid from '@site/src/components/core/card-grid';
import PhraseCard from '@site/src/components/core/phrase-card';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FlashCardViewer from "@site/src/components/core/flash-card-viewer";
import flashCardStyles from "@site/src/components/core/flash-card-viewer.module.css";


interface Props {
    day: number;
}

const Lesson: React.FC<Props> = ({day}) => {
    const {phrases, loading: loadingPhrases} = usePhrases(day);
    const {characters, loading: loadingCharacters} = useCharacters(day);

    if (loadingPhrases || loadingCharacters) return <div>Loading...</div>;

    const characterGridData = characters.map((character: any) => ({
        char: character.chinese,
        pinyin: character.pinyin,
        english: character.english,
        link: character.link,
    }));

    return (
        <div>
            <Tabs>

                <TabItem value="lesson" label="Lesson" default>
                    <h2>Characters</h2>
                    <CharacterGrid characters={characterGridData}/>
                    <hr/>
                    <h2>Phrases</h2>
                    <CardGrid>
                        {phrases.map((phrase, idx) => (
                            <PhraseCard
                                key={`phrase-${idx}`}
                                english={phrase.english}
                                pinyin={phrase.pinyin}
                                chinese={<span>{phrase.chinese}</span>}
                            />
                        ))}
                    </CardGrid>
                </TabItem>
                <TabItem value="review" label="Review">
                    <div className={flashCardStyles.flashCardViewersRow}>
                        <FlashCardViewer cards={
                            characterGridData.map((character: any) => ({
                                question: character.char,
                                answer: `${character.pinyin} (${character.english})`,
                            }))
                        }
                        />
                        <FlashCardViewer cards={
                            phrases.map((phrase) => ({
                                question: phrase.chinese,
                                answer: phrase.pinyin,
                            }))
                        }
                        />
                    </div>
                </TabItem>
            </Tabs>
        </div>
    )
        ;
};

export default Lesson;
