import { useEffect, useState } from 'react';

type CharacterData = Record<string, { pinyin: string; english: string }>;

interface Phrase {
    chinese: string;
    pinyin: string;
    english: string;
}

const useCharacters = (phrases: Phrase[]) => {
    const [characters, setCharacters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/mykb/data/words.json')
            .then(res => res.json())
            .then((data: CharacterData) => {
                // Extract unique Chinese characters from all phrases
                const uniqueChars = new Set<string>();
                phrases.forEach(phrase => {
                    // Split the chinese text into individual characters
                    [...phrase.chinese].forEach(char => {
                        // Skip punctuation, spaces, quotes, English letters, numbers
                        if (char.trim() && !/[a-zA-Z0-9\s''""，。、！？,.!?]/.test(char)) {
                            uniqueChars.add(char);
                        }
                    });
                });

                // Map unique characters to their data
                const characterList = Array.from(uniqueChars).map(char => ({
                    char: char,
                    chinese: char,
                    pinyin: data[char]?.pinyin,
                    english: data[char]?.english,
                }));

                setCharacters(characterList);
                setLoading(false);
            });
    }, [phrases]);

    return { characters, loading };
};

export default useCharacters;